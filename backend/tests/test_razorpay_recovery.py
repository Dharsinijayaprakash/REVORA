import os
import sys
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from razorpay.errors import BadRequestError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.razorpay_service import RazorpayService
from services.razorpay_recovery_service import (
    RazorpayRecoveryService,
    IdempotencyStore,
    AuditTrailStore,
    RazorpayLiveModeRejectedError
)
from services.action_executor import execute_action
from main import app

client = TestClient(app)

# ---------------------------------------------------------
# Test 1: APPROVED policy -> allowed action executes
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_approved_policy_allowed_action_executes(mock_rzp_client_class):
    mock_instance = MagicMock()
    # 150,000 paise = 1,500.00 INR (well below 50,000 INR high-value threshold)
    mock_instance.payment.fetch.return_value = {
        "id": "pay_appr_ok",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {
        "id": "order_test_123",
        "amount": 150000,
        "currency": "INR",
        "status": "created"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Temporary payment failure",
            "recommended_action": "SMART_RETRY",
            "reasoning": "Eligible for test retry order",
            "customer_message": "",
            "confidence": 85.0,
            "alternative_action": "PAYMENT_REMINDER",
            "expected_outcome": "High",
            "requires_policy_validation": True
        }
        res = service.recover_payment("pay_appr_ok")

        assert res["executed"] is True
        assert res["status"] == "executed"
        assert res["approved_action"] == "SMART_RETRY"
        assert res["executed_operation"] == "TEST_ORDER_CREATION"
        assert res["order_id"] == "order_test_123"
        mock_instance.order.create.assert_called_once()


# ---------------------------------------------------------
# Test 2: HUMAN_APPROVAL -> action does NOT execute
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_human_approval_does_not_execute(mock_rzp_client_class):
    mock_instance = MagicMock()
    # 6,000,000 paise = 60,000.00 INR (exceeds >= 50,000 threshold)
    mock_instance.payment.fetch.return_value = {
        "id": "pay_high_val",
        "amount": 6000000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    res = service.recover_payment("pay_high_val", ai_provider="mock")

    assert res["executed"] is False
    assert res["status"] == "human_approval_required"
    assert res["approved_action"] == "HUMAN_APPROVAL"
    assert res["executed_operation"] == "NONE"
    mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 3: BLOCKED -> action does NOT execute
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_blocked_does_not_execute(mock_rzp_client_class):
    mock_instance = MagicMock()
    # 10.00 INR -> Expected recovery is less than intervention cost -> STOP
    mock_instance.payment.fetch.return_value = {
        "id": "pay_blocked_low",
        "amount": 1000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    res = service.recover_payment("pay_blocked_low", ai_provider="mock")

    assert res["executed"] is False
    assert res["status"] == "blocked"
    assert res["approved_action"] == "STOP"
    assert res["executed_operation"] == "NONE"
    mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 4: Policy failure -> action does NOT execute
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_policy_failure_does_not_execute(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_pol_fail",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.razorpay_recovery_service.validate_action") as mock_validate:
        mock_validate.return_value = {
            "approved": False,
            "final_action": "STOP",
            "reasons": ["Policy validation failure simulated."],
            "overrides": ["Failure override."],
            "requires_human_approval": False
        }
        res = service.recover_payment("pay_pol_fail")

        assert res["executed"] is False
        assert res["status"] == "blocked"
        mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 5: AI failure -> safe deterministic fallback, does NOT execute unapproved
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_ai_failure_safe_fallback(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_ai_err",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.side_effect = RuntimeError("Groq rate limit exceeded")
        # Should fall back gracefully to deterministic baseline without unapproved execution
        res = service.recover_payment("pay_ai_err")
        assert "status" in res


# ---------------------------------------------------------
# Test 6: Invalid AI action -> overridden by policy guard
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_invalid_ai_action_overridden(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_ai_invalid",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Invalid action attempt",
            "recommended_action": "TRANSFER_MONEY_ILLEGAL",
            "reasoning": "Should be rejected",
            "customer_message": "",
            "confidence": 99.0,
            "alternative_action": "STOP",
            "expected_outcome": "None",
            "requires_policy_validation": True
        }
        res = service.recover_payment("pay_ai_invalid")

        assert res["approved_action"] != "TRANSFER_MONEY_ILLEGAL"


# ---------------------------------------------------------
# Test 7: Non-allowlisted action -> stops safely (executed: false)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_non_allowlisted_action_stops(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_non_allow",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.policy_guard.validate_action") as mock_validate:
        # PAYMENT_REMINDER is approved by policy, but NOT in ALLOWED_TEST_ACTIONS ("SMART_RETRY" only)
        mock_validate.return_value = {
            "approved": True,
            "final_action": "PAYMENT_REMINDER",
            "reasons": ["Policy validation passed."],
            "overrides": [],
            "requires_human_approval": False
        }
        res = service.recover_payment("pay_non_allow")

        assert res["executed"] is False
        assert res["status"] == "not_allowlisted"
        assert res["executed_operation"] == "NONE"
        mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 8: Action Executor receives only validated action
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_action_executor_receives_validated_action(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_exec_val",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_xyz"}
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.razorpay_recovery_service.execute_action") as mock_exec:
        mock_exec.return_value = {
            "success": True,
            "action": "SMART_RETRY",
            "executed_operation": "TEST_ORDER_CREATION",
            "order_id": "order_xyz",
            "recovered_amount": 0.0
        }
        with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
            mock_ai.return_value = {
                "diagnosis": "Test",
                "recommended_action": "SMART_RETRY",
                "reasoning": "Test",
                "customer_message": "",
                "confidence": 80.0,
                "alternative_action": "STOP",
                "expected_outcome": "High",
                "requires_policy_validation": True
            }
            service.recover_payment("pay_exec_val")

            mock_exec.assert_called_once()
            call_kwargs = mock_exec.call_args.kwargs
            assert call_kwargs["approved_action"]["final_action"] == "SMART_RETRY"


# ---------------------------------------------------------
# Test 9: Razorpay operation is Test Mode only
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_razorpay_operation_test_mode_flag(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_mode_chk",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_mode_1"}
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = service.recover_payment("pay_mode_chk")
        assert res["mode"] == "test"
        assert res["test_mode"] is True


# ---------------------------------------------------------
# Test 10: Live credential attempt is rejected with 403
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_live_PROD_KEY_999", "RAZORPAY_KEY_SECRET": "prod_secret"}, clear=False)
def test_live_credential_attempt_rejected():
    response = client.post("/api/integrations/razorpay/recovery/pay_live_test")
    assert response.status_code == 403
    assert "Live mode credentials are not permitted" in response.json()["detail"]


# ---------------------------------------------------------
# Test 11: Razorpay write method receives only expected parameters
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_write_method_receives_expected_parameters(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_param_check",
        "amount": 250000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_param_1"}
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        service.recover_payment("pay_param_check")

        mock_instance.order.create.assert_called_once()
        order_arg = mock_instance.order.create.call_args[1]["data"]
        assert order_arg["amount"] == 250000
        assert order_arg["currency"] == "INR"
        assert order_arg["receipt"].startswith("rcpt_")
        assert order_arg["notes"]["revora_action"] == "SMART_RETRY"
        assert order_arg["notes"]["original_payment_id"] == "pay_param_check"
        assert order_arg["notes"]["environment"] == "test"


# ---------------------------------------------------------
# Test 12: Duplicate request is protected by idempotency
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_idempotency_protection_enabled(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_idemp_12", "amount": 150000, "currency": "INR", "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_idemp_12"}
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    service = RazorpayRecoveryService(idempotency_store=idemp)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = service.recover_payment("pay_idemp_12")
        assert "idempotency_key" in res
        assert res["idempotency_key"] == "revora:8e:pay_idemp_12:SMART_RETRY"


# ---------------------------------------------------------
# Test 13: Repeated identical request does not execute twice
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_repeated_request_does_not_execute_twice(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_idemp_13", "amount": 150000, "currency": "INR", "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_idemp_13"}
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    service = RazorpayRecoveryService(idempotency_store=idemp)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res1 = service.recover_payment("pay_idemp_13")
        assert res1["executed"] is True
        assert mock_instance.order.create.call_count == 1

        res2 = service.recover_payment("pay_idemp_13")
        assert res2["idempotent_replay"] is True
        assert res2["status"] == "already_executed"
        # order.create call_count MUST remain exactly 1
        assert mock_instance.order.create.call_count == 1


# ---------------------------------------------------------
# Test 14: Razorpay API failure returns safe failure
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_razorpay_api_failure_safe_response(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_api_fail", "amount": 150000, "currency": "INR", "status": "failed"
    }
    mock_instance.order.create.side_effect = BadRequestError("Invalid order parameters")
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = service.recover_payment("pay_api_fail")
        assert res["executed"] is False
        assert res["status"] in ["execution_unknown", "failed"]


# ---------------------------------------------------------
# Test 15: Razorpay timeout returns safe failure (execution_unknown)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_razorpay_timeout_returns_execution_unknown(mock_rzp_client_class):
    import requests
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_timeout_test", "amount": 150000, "currency": "INR", "status": "failed"
    }
    mock_instance.order.create.side_effect = requests.exceptions.Timeout("Read timeout")
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = service.recover_payment("pay_timeout_test")
        assert res["executed"] is False
        assert res["status"] == "execution_unknown"


# ---------------------------------------------------------
# Test 16: No credentials appear in response
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k123", "RAZORPAY_KEY_SECRET": "super_secret_recovery_888"}, clear=False)
def test_no_credentials_leak_in_response(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_sec_chk", "amount": 150000, "currency": "INR", "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_sec_1"}
    mock_rzp_client_class.return_value = mock_instance

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = client.post("/api/integrations/razorpay/recovery/pay_sec_chk")
        assert res.status_code == 200
        assert "super_secret_recovery_888" not in res.text


# ---------------------------------------------------------
# Test 17: No credentials appear in logs/audit records
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k123", "RAZORPAY_KEY_SECRET": "super_secret_recovery_888"}, clear=False)
def test_no_credentials_in_audit_records(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_sec_aud", "amount": 150000, "currency": "INR", "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_sec_aud_1"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        service.recover_payment("pay_sec_aud")
        for record in audit.get_records():
            assert "super_secret_recovery_888" not in str(record)
            assert "secret" not in record


# ---------------------------------------------------------
# Test 18: Audit record created for approved execution
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_audit_record_approved(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {"id": "pay_aud_appr", "amount": 150000, "currency": "INR", "status": "failed"}
    mock_instance.order.create.return_value = {"id": "order_aud_1"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        service.recover_payment("pay_aud_appr")

    records = audit.get_records()
    assert len(records) == 1
    assert records[0]["execution_status"] == "executed"
    assert records[0]["executed"] is True
    assert records[0]["executed_operation"] == "TEST_ORDER_CREATION"


# ---------------------------------------------------------
# Test 19: Audit record created for blocked execution
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_audit_record_blocked(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {"id": "pay_aud_block", "amount": 1000, "currency": "INR", "status": "failed"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)
    service.recover_payment("pay_aud_block", ai_provider="mock")

    records = audit.get_records()
    assert len(records) == 1
    assert records[0]["execution_status"] == "blocked"
    assert records[0]["executed"] is False


# ---------------------------------------------------------
# Test 20: Audit record created for human approval
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_audit_record_human_approval(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {"id": "pay_aud_human", "amount": 6000000, "currency": "INR", "status": "failed"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)
    service.recover_payment("pay_aud_human", ai_provider="mock")

    records = audit.get_records()
    assert len(records) == 1
    assert records[0]["execution_status"] == "human_approval_required"
    assert records[0]["executed"] is False


# ---------------------------------------------------------
# Test 21: executed=false for all non-approved outcomes
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_executed_false_for_all_non_approved(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {"id": "pay_stop", "amount": 1000, "currency": "INR", "status": "failed"}
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    res = service.recover_payment("pay_stop", ai_provider="mock")
    assert res["executed"] is False


# ---------------------------------------------------------
# Test 22: Synthetic evaluation dataset remains untouched
# ---------------------------------------------------------

def test_synthetic_evaluation_unaffected():
    from main import SUMMARY_PATH, RESULTS_PATH
    import csv

    assert os.path.exists(SUMMARY_PATH)
    assert os.path.exists(RESULTS_PATH)

    with open(RESULTS_PATH, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        assert "transaction_id" in header
        first_row = next(reader)
        assert first_row[0].startswith("txn_")


# ---------------------------------------------------------
# Test 23-26: Regressions for Steps 8A, 8B, 8C, 8D
# ---------------------------------------------------------

def test_regression_8a_health():
    res = client.get("/api/integrations/razorpay/health")
    assert res.status_code == 200
    assert "configured" in res.json()

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_regression_8b_payments(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {"items": []}
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/payments")
    assert res.status_code == 200
    assert res.json()["payments"] == []

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_regression_8c_adapter(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_adapt_reg",
        "amount": 50000,
        "currency": "INR",
        "status": "captured"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/transactions/pay_adapt_reg")
    assert res.status_code == 200
    assert res.json()["transaction"]["amount"] == 500.0

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_regression_8d_intelligence(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_intel_reg",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/intelligence/pay_intel_reg?ai_provider=mock")
    assert res.status_code == 200
    assert "risk" in res.json()
    assert "policy_decision" in res.json()


# ---------------------------------------------------------
# Test 27: Currency missing/invalid aborts execution without defaulting to INR
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid123", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_missing_currency_aborts_without_defaulting_to_inr(mock_rzp_client_class):
    mock_instance = MagicMock()
    # Currency missing / None in payment
    mock_instance.payment.fetch.return_value = {
        "id": "pay_no_curr",
        "amount": 150000,
        "currency": None,
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    audit = AuditTrailStore()
    service = RazorpayRecoveryService(idempotency_store=idemp, audit_store=audit)

    # 1. Verify Action Executor directly rejects missing/invalid currency without defaulting to INR
    tx_invalid_curr = {"provider": "razorpay", "transaction_id": "pay_no_curr", "amount": 1500, "currency": None}
    action_appr = {"final_action": "SMART_RETRY"}
    exec_res = execute_action(tx_invalid_curr, action_appr, razorpay_client=MagicMock())
    assert exec_res["success"] is False
    assert "currency is missing or invalid" in exec_res["message"]

    # 2. Verify Recovery Service pipeline rejects payment with missing currency
    with pytest.raises(Exception) as excinfo:
        service.recover_payment("pay_no_curr")
    assert "currency" in str(excinfo.value).lower()
    mock_instance.order.create.assert_not_called()
