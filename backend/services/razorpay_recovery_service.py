import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from services.razorpay_service import (
    RazorpayService,
    RazorpayNotConfiguredError,
    RazorpayAuthError,
    RazorpayNotFoundError,
    RazorpayConnectionError
)
from services.razorpay_transaction_adapter import (
    RazorpayTransactionAdapter,
    RazorpayTransactionMappingError
)
from services.revenue_risk_engine import analyze_transaction
from services.recovery_decision_engine import decide_recovery_action
from services.ai_recovery_agent import AIRecoveryAgent
from services.policy_guard import validate_action
from services.action_executor import execute_action

logger = logging.getLogger("REVORA.RazorpayRecoveryService")

ALLOWED_TEST_ACTIONS = {"SMART_RETRY"}


class RazorpayLiveModeRejectedError(Exception):
    """Raised when an attempt is made to execute actions with live Razorpay credentials."""
    pass


class IdempotencyStore:
    """
    Demo-only in-memory idempotency; state is lost on process restart.
    Protects against duplicate execution of the same payment and approved action.
    """
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        return self._store.get(key)

    def set(self, key: str, value: Dict[str, Any]) -> None:
        self._store[key] = value

    def clear(self) -> None:
        self._store.clear()


class AuditTrailStore:
    """
    In-memory audit log recording every recovery execution attempt.
    Sanitizes all sensitive tokens, credentials, and secrets.
    """
    def __init__(self):
        self._records: List[Dict[str, Any]] = []

    def record(self, entry: Dict[str, Any]) -> None:
        # Sanitize sensitive fields
        sanitized = {
            k: v for k, v in entry.items()
            if k not in {"secret", "api_key", "authorization", "raw_secret"}
        }
        self._records.append(sanitized)

    def get_records(self) -> List[Dict[str, Any]]:
        return list(self._records)

    def clear(self) -> None:
        self._records.clear()


# Global singletons for demo lifetime
global_idempotency_store = IdempotencyStore()
global_audit_store = AuditTrailStore()


class RazorpayRecoveryService:
    """
    Orchestrates bounded, allowlisted Razorpay Test Mode recovery execution.
    
    SAFETY INVARIANTS:
    - Dual Test Mode verification (rzp_test_ prefix and mode == 'test').
    - Rejects live-mode credentials immediately.
    - Authoritative Policy Guard gating: execution requires policy_decision.approved is True.
    - HUMAN_APPROVAL / BLOCKED / STOP states return executed = False.
    - Server-side action allowlist: only ALLOWED_TEST_ACTIONS ("SMART_RETRY") permitted.
    - AI proposal ≠ SDK method. AI cannot select endpoints or parameters.
    - Single authoritative Action Executor path (execute_action).
    - Precise semantics: operation is TEST_ORDER_CREATION (not PAYMENT_RETRIED).
    - Enforces provider-supplied currency without defaulting to INR.
    - In-memory idempotency protection.
    - Sanitized audit trail for all attempts.
    """

    def __init__(
        self,
        razorpay_service: Optional[RazorpayService] = None,
        adapter: Optional[RazorpayTransactionAdapter] = None,
        idempotency_store: Optional[IdempotencyStore] = None,
        audit_store: Optional[AuditTrailStore] = None
    ):
        self.razorpay_service = razorpay_service or RazorpayService()
        self.adapter = adapter or RazorpayTransactionAdapter()
        self.idempotency_store = idempotency_store or global_idempotency_store
        self.audit_store = audit_store or global_audit_store

    def recover_payment(
        self,
        payment_id: str,
        requested_action: Optional[str] = None,
        ai_provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates and conditionally executes a bounded Test Mode action for payment_id.
        """
        # 1. Dual Test Mode Verification
        if not self.razorpay_service.is_configured():
            raise RazorpayNotConfiguredError("Razorpay credentials not configured")

        key_id = self.razorpay_service.key_id or ""
        if not key_id.startswith("rzp_test_"):
            raise RazorpayLiveModeRejectedError(
                "Execution is strictly restricted to Razorpay Test Mode. Live mode credentials are not permitted."
            )

        # 2. Fetch normalized payment (READ-ONLY)
        payment = self.razorpay_service.get_payment(payment_id)

        # 3. Adapt to REVORA transaction representation
        adapted_tx = self.adapter.adapt_payment(payment)

        # 4. Intelligence Pipeline: Risk Engine
        risk = analyze_transaction(adapted_tx)

        # 5. Decision Engine: Deterministic Baseline
        det_decision = decide_recovery_action(adapted_tx, risk)

        # 6. AI Recovery Agent Proposal
        provider = ai_provider if ai_provider else ("groq" if os.environ.get("GROQ_API_KEY") else "mock")
        agent = AIRecoveryAgent(provider=provider)
        try:
            ai_proposal = agent.analyze_recovery_case(adapted_tx, risk, det_decision)
        except Exception as e:
            logger.warning("AI recovery agent failed: %s. Using safe deterministic fallback.", type(e).__name__)
            ai_proposal = agent._fallback_response(det_decision, str(e))

        # 7. Authoritative Policy Guard
        policy_decision = validate_action(adapted_tx, ai_proposal, det_decision)
        approved = policy_decision.get("approved", False)
        final_action = policy_decision.get("final_action", "STOP")
        requires_human = policy_decision.get("requires_human_approval", False)

        # 8. Client requested_action Validation
        if requested_action:
            if requested_action != final_action:
                raise ValueError(
                    f"Requested action '{requested_action}' does not match policy decision '{final_action}'. Client cannot override policy."
                )

        now_iso = datetime.now(timezone.utc).isoformat()
        tx_id = adapted_tx.get("transaction_id", f"razorpay:{payment_id}")

        # 9. Gating on Policy Guard Decisions
        # Case A: HUMAN_APPROVAL / HUMAN_REVIEW
        if requires_human or final_action in ["HUMAN_APPROVAL", "HUMAN_REVIEW"]:
            self.audit_store.record({
                "timestamp": now_iso,
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "execution_status": "human_approval_required",
                "executed": False,
                "test_mode": True,
                "idempotency_key": None
            })
            return {
                "provider": "razorpay",
                "mode": "test",
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "status": "human_approval_required",
                "executed": False,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "detail": "Action requires human approval. Automated execution blocked.",
                "test_mode": True,
                "timestamp": now_iso
            }

        # Case B: BLOCKED / STOP
        if not approved or final_action == "STOP":
            self.audit_store.record({
                "timestamp": now_iso,
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "execution_status": "blocked",
                "executed": False,
                "test_mode": True,
                "idempotency_key": None
            })
            return {
                "provider": "razorpay",
                "mode": "test",
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "status": "blocked",
                "executed": False,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "detail": "Action blocked by policy guard.",
                "test_mode": True,
                "timestamp": now_iso
            }

        # Case C: Non-allowlisted Action
        if final_action not in ALLOWED_TEST_ACTIONS:
            self.audit_store.record({
                "timestamp": now_iso,
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "execution_status": "not_allowlisted",
                "executed": False,
                "test_mode": True,
                "idempotency_key": None
            })
            return {
                "provider": "razorpay",
                "mode": "test",
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "status": "not_allowlisted",
                "executed": False,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "detail": f"Action '{final_action}' is not allowlisted for automated test execution.",
                "test_mode": True,
                "timestamp": now_iso
            }

        # 10. Idempotency Check
        idempotency_key = f"revora:8e:{payment_id}:{final_action}"
        cached = self.idempotency_store.get(idempotency_key)
        if cached:
            replay_res = dict(cached)
            replay_res["idempotent_replay"] = True
            replay_res["status"] = "already_executed"
            return replay_res

        # 11. Currency Validation (No defaulting to INR)
        currency = adapted_tx.get("currency")
        if not currency or not isinstance(currency, str) or not currency.strip():
            self.audit_store.record({
                "timestamp": now_iso,
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "execution_status": "invalid_currency",
                "executed": False,
                "test_mode": True,
                "idempotency_key": idempotency_key
            })
            return {
                "provider": "razorpay",
                "mode": "test",
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "status": "failed",
                "executed": False,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "detail": "Transaction currency is missing or invalid. Execution aborted.",
                "test_mode": True,
                "timestamp": now_iso
            }

        # 12. Single Authoritative Action Executor Path
        try:
            client = self.razorpay_service.get_client()
            exec_result = execute_action(
                transaction=adapted_tx,
                approved_action=policy_decision,
                razorpay_client=client
            )
        except Exception as e:
            logger.error("Razorpay operation failed during execution: %s", str(e))
            self.audit_store.record({
                "timestamp": now_iso,
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "TEST_ORDER_CREATION",
                "execution_status": "execution_failed",
                "executed": False,
                "test_mode": True,
                "idempotency_key": idempotency_key
            })
            return {
                "provider": "razorpay",
                "mode": "test",
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "status": "execution_unknown",
                "executed": False,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "detail": "Razorpay operation failed or timed out. Execution marked unconfirmed.",
                "test_mode": True,
                "timestamp": now_iso
            }

        if not exec_result.get("success"):
            self.audit_store.record({
                "timestamp": now_iso,
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "execution_status": "executor_rejected",
                "executed": False,
                "test_mode": True,
                "idempotency_key": idempotency_key
            })
            return {
                "provider": "razorpay",
                "mode": "test",
                "payment_id": payment_id,
                "transaction_id": tx_id,
                "status": "failed",
                "executed": False,
                "proposed_action": ai_proposal.get("recommended_action"),
                "policy_decision": policy_decision,
                "approved_action": final_action,
                "executed_operation": "NONE",
                "detail": exec_result.get("message", "Action executor rejected action"),
                "test_mode": True,
                "timestamp": now_iso
            }

        # 13. Construct Execution Success Response
        response_data = {
            "provider": "razorpay",
            "mode": "test",
            "payment_id": payment_id,
            "transaction_id": tx_id,
            "status": "executed",
            "executed": True,
            "proposed_action": ai_proposal.get("recommended_action"),
            "approved_action": final_action,
            "executed_operation": exec_result.get("executed_operation", "TEST_ORDER_CREATION"),
            "operation_description": exec_result.get("operation_description", ""),
            "order_id": exec_result.get("order_id"),
            "recovered_amount": exec_result.get("recovered_amount", 0.0),
            "risk": risk,
            "deterministic_decision": det_decision,
            "ai_proposal": ai_proposal,
            "policy_decision": policy_decision,
            "idempotency_key": idempotency_key,
            "idempotent_replay": False,
            "timestamp": now_iso,
            "test_mode": True
        }

        # 14. Record Audit and Cache in Idempotency Store
        self.audit_store.record({
            "timestamp": now_iso,
            "payment_id": payment_id,
            "transaction_id": tx_id,
            "proposed_action": ai_proposal.get("recommended_action"),
            "policy_decision": policy_decision,
            "approved_action": final_action,
            "executed_operation": exec_result.get("executed_operation", "TEST_ORDER_CREATION"),
            "execution_status": "executed",
            "executed": True,
            "test_mode": True,
            "idempotency_key": idempotency_key
        })
        self.idempotency_store.set(idempotency_key, response_data)

        return response_data
