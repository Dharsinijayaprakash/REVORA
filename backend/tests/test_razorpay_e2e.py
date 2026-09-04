import os
import sys
import json
import csv
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from razorpay.errors import BadRequestError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.razorpay_service import RazorpayService, RazorpayPayment
from services.razorpay_transaction_adapter import RazorpayTransactionAdapter
from services.razorpay_intelligence_service import RazorpayIntelligenceService
from services.razorpay_recovery_service import (
    RazorpayRecoveryService,
    IdempotencyStore,
    AuditTrailStore,
    RazorpayLiveModeRejectedError
)
from services.action_executor import execute_action
from main import app, SUMMARY_PATH, RESULTS_PATH

client = TestClient(app)

# ---------------------------------------------------------
# Test 1: Real integration path can be exercised with Test Mode credentials
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_1_integration_path_with_test_credentials(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.order.all.return_value = {"items": []}
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/health")
    assert res.status_code == 200
    data = res.json()
    assert data["provider"] == "razorpay"
    assert data["mode"] == "test"
    assert data["configured"] is True
    assert data["connected"] is True


# ---------------------------------------------------------
# Test 2: Payment retrieval works and normalizes properly
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_2_payment_retrieval_normalization(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_retrieval",
        "amount": 250000,
        "currency": "INR",
        "status": "failed",
        "method": "upi",
        "order_id": "order_e2e_1",
        "created_at": 1700000000
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/payments/pay_e2e_retrieval")
    assert res.status_code == 200
    data = res.json()
    assert data["payment_id"] == "pay_e2e_retrieval"
    assert data["amount"] == 250000
    assert data["currency"] == "INR"
    assert data["status"] == "failed"


# ---------------------------------------------------------
# Test 3: Payment adaptation works (paise to rupees, deterministic ID)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_3_payment_adaptation(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_adapt",
        "amount": 250000,
        "currency": "INR",
        "status": "failed",
        "method": "card"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/transactions/pay_e2e_adapt")
    assert res.status_code == 200
    tx = res.json()["transaction"]
    assert tx["transaction_id"] == "razorpay:pay_e2e_adapt"
    assert tx["amount"] == 2500.0
    assert tx["raw_amount"] == 250000
    assert tx["raw_amount_unit"] == "paise"
    assert tx["currency"] == "INR"
    assert tx["status"] == "failed"


# ---------------------------------------------------------
# Test 4: Intelligence pipeline works end-to-end
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_4_intelligence_pipeline_e2e(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_intel",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/intelligence/pay_e2e_intel?ai_provider=mock")
    assert res.status_code == 200
    data = res.json()
    assert "risk" in data
    assert "deterministic_decision" in data
    assert "ai_proposal" in data
    assert "policy_decision" in data


# ---------------------------------------------------------
# Test 5: AI proposal remains separate from policy decision
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_5_ai_proposal_separate_from_policy(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_sep",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/intelligence/pay_e2e_sep?ai_provider=mock")
    data = res.json()
    # Structural separation
    assert isinstance(data["ai_proposal"], dict)
    assert isinstance(data["policy_decision"], dict)
    assert "confidence" in data["ai_proposal"]
    assert "approved" in data["policy_decision"]


# ---------------------------------------------------------
# Test 6: APPROVED + SMART_RETRY reaches Action Executor (TEST_ORDER_CREATION)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_6_approved_smart_retry_executes(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_appr",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_e2e_exec_1"}
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = service.recover_payment("pay_e2e_appr")

        assert res["executed"] is True
        assert res["executed_operation"] == "TEST_ORDER_CREATION"
        assert res["order_id"] == "order_e2e_exec_1"
        assert res["recovered_amount"] == 0.0
        mock_instance.order.create.assert_called_once()


# ---------------------------------------------------------
# Test 7: HUMAN_APPROVAL does not execute
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_7_human_approval_does_not_execute(mock_rzp_client_class):
    mock_instance = MagicMock()
    # >= 50,000 INR triggers Policy Guard human approval
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_high",
        "amount": 6000000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    res = service.recover_payment("pay_e2e_high", ai_provider="mock")

    assert res["executed"] is False
    assert res["status"] == "human_approval_required"
    assert res["executed_operation"] == "NONE"
    mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 8: BLOCKED does not execute
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_8_blocked_does_not_execute(mock_rzp_client_class):
    mock_instance = MagicMock()
    # 10.00 INR -> Expected recovery < intervention cost -> STOP
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_block",
        "amount": 1000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    res = service.recover_payment("pay_e2e_block", ai_provider="mock")

    assert res["executed"] is False
    assert res["status"] == "blocked"
    mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 9: Non-allowlisted action does not execute
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_9_non_allowlisted_does_not_execute(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_remind",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    with patch("services.policy_guard.validate_action") as mock_validate:
        mock_validate.return_value = {
            "approved": True,
            "final_action": "PAYMENT_REMINDER",
            "reasons": ["Passed"],
            "overrides": [],
            "requires_human_approval": False
        }
        res = service.recover_payment("pay_e2e_remind")
        assert res["executed"] is False
        assert res["status"] == "not_allowlisted"
        mock_instance.order.create.assert_not_called()


# ---------------------------------------------------------
# Test 10: Live credentials are rejected with 403
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_live_PROD_999", "RAZORPAY_KEY_SECRET": "prod_secret"}, clear=False)
def test_10_live_credentials_rejected():
    res = client.post("/api/integrations/razorpay/recovery/pay_live_test")
    assert res.status_code == 403
    assert "Live mode credentials are not permitted" in res.json()["detail"]


# ---------------------------------------------------------
# Test 11: Test Mode boundary is enforced
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid_mode", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_11_test_mode_boundary_enforced():
    service = RazorpayService()
    assert service.key_id.startswith("rzp_test_")
    assert service.is_configured() is True


# ---------------------------------------------------------
# Test 12: Idempotent replay does not execute twice (call count boundary test)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_12_idempotency_provider_call_boundary(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_idemp",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_e2e_idemp_1"}
    mock_rzp_client_class.return_value = mock_instance

    idemp = IdempotencyStore()
    service = RazorpayRecoveryService(idempotency_store=idemp)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        # First call -> order.create called exactly once
        res1 = service.recover_payment("pay_e2e_idemp")
        assert res1["executed"] is True
        assert mock_instance.order.create.call_count == 1

        # Second call -> order.create is NOT called again
        res2 = service.recover_payment("pay_e2e_idemp")
        assert res2["idempotent_replay"] is True
        assert res2["status"] == "already_executed"
        assert mock_instance.order.create.call_count == 1


# ---------------------------------------------------------
# Test 13: Provider failure is safe
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_13_provider_failure_is_safe(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_prov_fail",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.side_effect = BadRequestError("Invalid parameter")
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayRecoveryService()
    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = service.recover_payment("pay_e2e_prov_fail")
        assert res["executed"] is False
        assert res["status"] in ["execution_unknown", "failed"]


# ---------------------------------------------------------
# Test 14: Timeout becomes execution_unknown
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_14_timeout_becomes_execution_unknown(mock_rzp_client_class):
    import requests
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_timeout",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
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
        res = service.recover_payment("pay_e2e_timeout")
        assert res["executed"] is False
        assert res["status"] == "execution_unknown"


# ---------------------------------------------------------
# Test 15: No secrets appear in response
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "super_secret_e2e_val_123"}, clear=False)
def test_15_no_secrets_in_response(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_sec_res",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_e2e_sec_1"}
    mock_rzp_client_class.return_value = mock_instance

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = client.post("/api/integrations/razorpay/recovery/pay_e2e_sec_res")
        assert res.status_code == 200
        assert "super_secret_e2e_val_123" not in res.text
        assert "RAZORPAY_KEY_SECRET" not in res.text


# ---------------------------------------------------------
# Test 16: No secrets appear in audit
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "super_secret_e2e_val_123"}, clear=False)
def test_16_no_secrets_in_audit(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_e2e_sec_aud",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_e2e_sec_2"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        service.recover_payment("pay_e2e_sec_aud")
        for rec in audit.get_records():
            assert "super_secret_e2e_val_123" not in str(rec)
            assert "secret" not in rec


# ---------------------------------------------------------
# Test 17: Audit is created for execution
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_17_audit_created_for_execution(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {"id": "pay_e2e_aud_exec", "amount": 150000, "currency": "INR", "status": "failed"}
    mock_instance.order.create.return_value = {"id": "order_e2e_aud_1"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        service.recover_payment("pay_e2e_aud_exec")

    recs = audit.get_records()
    assert len(recs) == 1
    assert recs[0]["execution_status"] == "executed"
    assert recs[0]["executed"] is True
    assert recs[0]["executed_operation"] == "TEST_ORDER_CREATION"


# ---------------------------------------------------------
# Test 18: Audit is created for blocked/human outcomes
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_18_audit_created_for_blocked_and_human(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.order.create.return_value = {"id": "order_e2e_aud_2"}
    mock_rzp_client_class.return_value = mock_instance

    audit = AuditTrailStore()
    service = RazorpayRecoveryService(audit_store=audit)

    # Blocked
    mock_instance.payment.fetch.return_value = {"id": "pay_aud_b", "amount": 1000, "currency": "INR", "status": "failed"}
    service.recover_payment("pay_aud_b", ai_provider="mock")

    # Human approval
    mock_instance.payment.fetch.return_value = {"id": "pay_aud_h", "amount": 6000000, "currency": "INR", "status": "failed"}
    service.recover_payment("pay_aud_h", ai_provider="mock")

    recs = audit.get_records()
    assert len(recs) == 2
    assert recs[0]["execution_status"] == "blocked"
    assert recs[1]["execution_status"] == "human_approval_required"


# ---------------------------------------------------------
# Test 19: Synthetic dataset remains unchanged
# ---------------------------------------------------------

def test_19_synthetic_dataset_isolation():
    assert os.path.exists(SUMMARY_PATH)
    with open(SUMMARY_PATH, 'r', encoding='utf-8') as f:
        summary = json.load(f)
    assert summary["total_transactions"] == 5000
    assert summary["total_at_risk_transactions"] == 2026
    assert summary["total_revenue_at_risk"] == 51042090.0


# ---------------------------------------------------------
# Test 20: Currency validation remains strict
# ---------------------------------------------------------

def test_20_strict_currency_validation():
    tx_no_curr = {"provider": "razorpay", "transaction_id": "tx_curr_test", "amount": 1000, "currency": ""}
    action_appr = {"final_action": "SMART_RETRY"}
    res = execute_action(tx_no_curr, action_appr, razorpay_client=MagicMock())
    assert res["success"] is False
    assert "currency is missing or invalid" in res["message"]


# ---------------------------------------------------------
# Test 21: Existing 8A tests pass
# ---------------------------------------------------------

def test_21_existing_8a_health():
    res = client.get("/api/integrations/razorpay/health")
    assert res.status_code == 200
    assert "status" in res.json()


# ---------------------------------------------------------
# Test 22: Existing 8B tests pass
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_22_existing_8b_payments(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {"items": []}
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/payments")
    assert res.status_code == 200
    assert res.json()["payments"] == []


# ---------------------------------------------------------
# Test 23: Existing 8C tests pass
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_23_existing_8c_adapter(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_8c_e2e",
        "amount": 50000,
        "currency": "INR",
        "status": "captured"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/transactions/pay_8c_e2e")
    assert res.status_code == 200
    assert res.json()["transaction"]["amount"] == 500.0


# ---------------------------------------------------------
# Test 24: Existing 8D tests pass
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_24_existing_8d_intelligence(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_8d_e2e",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/intelligence/pay_8d_e2e?ai_provider=mock")
    assert res.status_code == 200
    assert "risk" in res.json()
    assert "deterministic_decision" in res.json()


# ---------------------------------------------------------
# Test 25: Existing 8E tests pass
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_e2e_key", "RAZORPAY_KEY_SECRET": "e2e_secret"}, clear=False)
def test_25_existing_8e_recovery(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_8e_e2e",
        "amount": 150000,
        "currency": "INR",
        "status": "failed"
    }
    mock_instance.order.create.return_value = {"id": "order_8e_e2e_1"}
    mock_rzp_client_class.return_value = mock_instance

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Test", "recommended_action": "SMART_RETRY", "reasoning": "Test",
            "customer_message": "", "confidence": 80.0, "alternative_action": "STOP",
            "expected_outcome": "High", "requires_policy_validation": True
        }
        res = client.post("/api/integrations/razorpay/recovery/pay_8e_e2e")
        assert res.status_code == 200
        assert res.json()["executed_operation"] == "TEST_ORDER_CREATION"
        assert res.json()["executed"] is True
