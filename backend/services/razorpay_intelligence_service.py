import os
import logging
from typing import Dict, Any, Optional

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

logger = logging.getLogger("REVORA.RazorpayIntelligenceService")


class RazorpayIntelligenceService:
    """
    Orchestrates the evaluation of a Razorpay Test Mode payment through REVORA's
    existing intelligence pipeline.
    
    DATA FLOW:
    Razorpay Test Mode Payment
            ↓
       RazorpayService
            ↓
      RazorpayPayment
            ↓
    RazorpayTransactionAdapter
            ↓
      REVORA Transaction
            ↓
      Existing Risk Engine (analyze_transaction)
            ↓
      Existing Decision Engine (decide_recovery_action)
            ↓
      Existing AI Recovery Agent (analyze_recovery_case)
            ↓
      Existing Policy Guard (validate_action)
            ↓
        [STOP HERE]
    
    STRICT SAFETY INVARIANTS:
    - READ-ONLY: Never invokes Action Executor.
    - Zero write operations to Razorpay (no capture, refund, retry, create, delete).
    - Preserves distinct pipeline stages: Risk -> Deterministic Decision -> AI Proposal -> Policy Guard Decision.
    - Failure never defaults to an approved action.
    """

    def __init__(
        self,
        razorpay_service: Optional[RazorpayService] = None,
        adapter: Optional[RazorpayTransactionAdapter] = None
    ):
        self.razorpay_service = razorpay_service or RazorpayService()
        self.adapter = adapter or RazorpayTransactionAdapter()

    def evaluate_payment(self, payment_id: str, ai_provider: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetches a Razorpay Test Mode payment, adapts it, and evaluates it through
        REVORA's intelligence pipeline up to the authoritative Policy Guard.
        """
        # 1. Fetch normalized Razorpay test payment (READ-ONLY)
        payment = self.razorpay_service.get_payment(payment_id)

        # 2. Adapt to REVORA transaction representation
        adapted_tx = self.adapter.adapt_payment(payment)

        # 3. Existing REVORA Risk Engine
        risk = analyze_transaction(adapted_tx)

        # 4. Existing REVORA Recovery Decision Engine (Deterministic Baseline)
        deterministic_decision = decide_recovery_action(adapted_tx, risk)

        # 5. Existing REVORA AI Recovery Agent (Proposal only)
        # Select provider: explicit ai_provider, or groq if key is present, else mock
        provider = ai_provider if ai_provider else ("groq" if os.environ.get("GROQ_API_KEY") else "mock")
        agent = AIRecoveryAgent(provider=provider)
        try:
            ai_proposal = agent.analyze_recovery_case(adapted_tx, risk, deterministic_decision)
        except Exception as e:
            logger.warning(
                "AI recovery agent raised an exception: %s. Reusing existing deterministic fallback.",
                type(e).__name__
            )
            ai_proposal = agent._fallback_response(deterministic_decision, str(e))

        # 6. Existing REVORA Policy Guard (Authoritative decision)
        policy_decision = validate_action(adapted_tx, ai_proposal, deterministic_decision)

        # 7. STOP! Do NOT call action_executor or any mutation.
        return {
            "provider": "razorpay",
            "mode": "test",
            "payment": payment.model_dump(),
            "transaction": adapted_tx,
            "risk": risk,
            "deterministic_decision": deterministic_decision,
            "ai_proposal": ai_proposal,
            "policy_decision": policy_decision
        }
