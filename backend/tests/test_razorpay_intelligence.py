import os
import sys
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from razorpay.errors import BadRequestError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.razorpay_service import RazorpayService, RazorpayPayment
from services.razorpay_intelligence_service import RazorpayIntelligenceService
from services.revenue_risk_engine import analyze_transaction
from services.recovery_decision_engine import decide_recovery_action
from services.ai_recovery_agent import AIRecoveryAgent
from services.policy_guard import validate_action
from main import app

client = TestClient(app)

# ---------------------------------------------------------
# Test 1: Adapter output reaches Risk Engine
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_adapter_output_reaches_risk_engine(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_adapter_reach",
        "amount": 250000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    with patch("services.razorpay_intelligence_service.analyze_transaction") as mock_risk:
        mock_risk.return_value = {
            "transaction_id": "razorpay:pay_adapter_reach",
            "revenue_at_risk": 2500.0,
            "risk_score": 40,
            "risk_level": "MEDIUM",
            "root_cause": "OTHER_REVENUE_RISK",
            "risk_factors": ["Payment failed"],
            "recommended_recovery_window": "24 hours"
        }
        service = RazorpayIntelligenceService()
        result = service.evaluate_payment("pay_adapter_reach", ai_provider="mock")

        mock_risk.assert_called_once()
        passed_tx = mock_risk.call_args[0][0]
        assert passed_tx["transaction_id"] == "razorpay:pay_adapter_reach"
        assert passed_tx["amount"] == 2500.0


# ---------------------------------------------------------
# Test 2: Risk result is preserved in response
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_risk_result_preserved(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_risk_pres",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    result = service.evaluate_payment("pay_risk_pres", ai_provider="mock")

    assert "risk" in result
    assert result["risk"]["revenue_at_risk"] == 1000.0
    assert result["risk"]["risk_level"] in ["LOW", "MEDIUM", "HIGH"]


# ---------------------------------------------------------
# Test 3: Successful full flow
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_successful_full_intelligence_flow(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_flow_ok",
        "amount": 150000,
        "currency": "INR",
        "status": "failed",
        "method": "card",
        "order_id": "order_123",
        "created_at": 1700000000
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    res = service.evaluate_payment("pay_flow_ok", ai_provider="mock")

    assert res["provider"] == "razorpay"
    assert res["mode"] == "test"
    assert "payment" in res
    assert "transaction" in res
    assert "risk" in res
    assert "deterministic_decision" in res
    assert "ai_proposal" in res
    assert "policy_decision" in res


# ---------------------------------------------------------
# Test 4: AI proposal is generated
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_ai_proposal_is_generated(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_ai_gen",
        "amount": 50000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    res = service.evaluate_payment("pay_ai_gen", ai_provider="mock")

    assert res["ai_proposal"] is not None
    assert res["ai_proposal"]["recommended_action"] in AIRecoveryAgent.ALLOWED_ACTIONS


# ---------------------------------------------------------
# Test 5: AI structured output preserved in response
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_ai_structured_output_preserved(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_ai_struct",
        "amount": 50000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    res = service.evaluate_payment("pay_ai_struct", ai_provider="mock")

    prop = res["ai_proposal"]
    for key in ["diagnosis", "recommended_action", "reasoning", "confidence", "requires_policy_validation"]:
        assert key in prop


# ---------------------------------------------------------
# Test 6: Policy Guard receives AI proposal
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_policy_guard_receives_ai_proposal(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_pg_rcv",
        "amount": 50000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    with patch("services.razorpay_intelligence_service.validate_action") as mock_validate:
        mock_validate.return_value = {
            "approved": True,
            "final_action": "PAYMENT_REMINDER",
            "reasons": ["Policy validation passed."],
            "overrides": [],
            "requires_human_approval": False
        }
        service = RazorpayIntelligenceService()
        service.evaluate_payment("pay_pg_rcv", ai_provider="mock")

        mock_validate.assert_called_once()
        call_args = mock_validate.call_args[0]
        # args: (adapted_tx, ai_proposal, deterministic_decision)
        assert len(call_args) == 3
        assert "recommended_action" in call_args[1]



# ---------------------------------------------------------
# Test 6-7: Policy Guard receives proposal & APPROVED decision
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_policy_guard_approved_decision(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_approve_test",
        "amount": 150000,  # 1500.00 Rupees (well below 50,000 threshold)
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    result = service.evaluate_payment("pay_approve_test", ai_provider="mock")

    policy = result["policy_decision"]
    assert "approved" in policy
    assert "final_action" in policy
    assert "reasons" in policy
    assert "overrides" in policy
    assert policy["approved"] is True
    assert policy["final_action"] == result["ai_proposal"]["recommended_action"]


# ---------------------------------------------------------
# Test 8: HUMAN_APPROVAL Decision (High Value >= 50,000 INR)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_policy_guard_high_value_human_approval(mock_rzp_client_class):
    mock_instance = MagicMock()
    # 6,000,000 paise = 60,000.00 Rupees (breaches >= 50,000 threshold)
    mock_instance.payment.fetch.return_value = {
        "id": "pay_high_val",
        "amount": 6000000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    result = service.evaluate_payment("pay_high_val", ai_provider="mock")

    policy = result["policy_decision"]
    assert policy["final_action"] == "HUMAN_APPROVAL"
    assert policy["requires_human_approval"] is True
    # If AI proposed something other than HUMAN_APPROVAL, policy overridden it
    if result["ai_proposal"]["recommended_action"] != "HUMAN_APPROVAL":
        assert policy["approved"] is False
        assert any("High-value" in r for r in policy["reasons"])


# ---------------------------------------------------------
# Test 9: BLOCKED / STOP Decision (Deterministic STOP override)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_policy_guard_blocked_decision(mock_rzp_client_class):
    mock_instance = MagicMock()
    # Tiny amount where expected recovery (0.20 * 10 = 2 INR) <= intervention cost (5 INR for SMART_RETRY)
    # -> Deterministic decision is STOP due to LOW_ROI
    mock_instance.payment.fetch.return_value = {
        "id": "pay_low_val",
        "amount": 1000,  # 10.00 Rupees
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    result = service.evaluate_payment("pay_low_val", ai_provider="mock")

    policy = result["policy_decision"]
    assert policy["final_action"] == "STOP"


# ---------------------------------------------------------
# Test 10: Action Executor is NOT Called
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.action_executor.execute_action")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_action_executor_not_called(mock_executor, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_exec_check",
        "amount": 200000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    service = RazorpayIntelligenceService()
    service.evaluate_payment("pay_exec_check", ai_provider="mock")

    # Invariant: Action Executor must NEVER be called
    assert mock_executor.call_count == 0


# ---------------------------------------------------------
# Test 11: Razorpay Write Methods are NOT Called
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_no_razorpay_write_methods(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_write_check",
        "amount": 200000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/intelligence/pay_write_check?ai_provider=mock")
    assert response.status_code == 200

    # Verify only fetch was called, zero mutations
    mock_instance.payment.fetch.assert_called_once_with("pay_write_check")
    assert getattr(mock_instance.payment, "create", MagicMock()).call_count == 0
    assert getattr(mock_instance.payment, "capture", MagicMock()).call_count == 0
    assert getattr(mock_instance.payment, "refund", MagicMock()).call_count == 0


# ---------------------------------------------------------
# Test 12: Secret Leakage Prevention
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_sec_id", "RAZORPAY_KEY_SECRET": "super_secret_key_intel_777"}, clear=False)
def test_credentials_never_leaked(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_sec",
        "amount": 200000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/intelligence/pay_sec?ai_provider=mock")
    assert response.status_code == 200
    assert "super_secret_key_intel_777" not in response.text
    assert "RAZORPAY_KEY_SECRET" not in response.text


# ---------------------------------------------------------
# Test 13: Payment Not Found (HTTP 404)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_payment_not_found(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("The id provided does not exist")
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/intelligence/pay_nonexistent")
    assert response.status_code == 404
    assert response.json() == {"detail": "Razorpay payment not found"}


# ---------------------------------------------------------
# Test 14: Authentication Failure (HTTP 502)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_authentication_failure(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("Authentication failed")
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/intelligence/pay_auth_fail")
    assert response.status_code == 502
    assert response.json() == {"detail": "Razorpay authentication failed"}


# ---------------------------------------------------------
# Test 15: Network Failure (HTTP 502)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_network_failure(mock_rzp_client_class):
    import requests
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = requests.exceptions.ConnectionError("Connection timeout")
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/intelligence/pay_net_fail")
    assert response.status_code == 502
    assert response.json() == {"detail": "Unable to retrieve Razorpay payment data"}


# ---------------------------------------------------------
# Test 16: Mapping Failure (HTTP 422)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_mapping_failure(mock_rzp_client_class):
    mock_instance = MagicMock()
    # Razorpay payment with unmappable status
    mock_instance.payment.fetch.return_value = {
        "id": "pay_unmappable",
        "amount": 1000,
        "currency": "INR",
        "status": "authorized"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/intelligence/pay_unmappable")
    assert response.status_code == 422
    assert response.json() == {"detail": "Unable to map Razorpay payment to REVORA transaction"}


# ---------------------------------------------------------
# Test 17: AI Provider Failure (Fallback gracefully)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_ai_provider_failure_fallback(mock_ai_analyze, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_ai_fail",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance
    mock_ai_analyze.side_effect = RuntimeError("Groq rate limit exceeded")

    service = RazorpayIntelligenceService()
    result = service.evaluate_payment("pay_ai_fail", ai_provider="groq")

    assert "AI provider failure" in result["ai_proposal"]["diagnosis"]
    assert result["policy_decision"]["final_action"] in AIRecoveryAgent.ALLOWED_ACTIONS


# ---------------------------------------------------------
# Test 18: Invalid AI Output Handling
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_invalid_ai_output_handled_by_policy_guard(mock_ai_analyze, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_invalid_ai",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance
    # AI returns unauthorized action
    mock_ai_analyze.return_value = {
        "diagnosis": "Invalid action attempt",
        "recommended_action": "TRANSFER_MONEY_ILLEGAL",
        "reasoning": "Should be blocked",
        "customer_message": "",
        "confidence": 99.0,
        "alternative_action": "STOP",
        "expected_outcome": "None",
        "requires_policy_validation": True
    }

    service = RazorpayIntelligenceService()
    result = service.evaluate_payment("pay_invalid_ai")

    policy = result["policy_decision"]
    assert policy["approved"] is False
    assert policy["final_action"] != "TRANSFER_MONEY_ILLEGAL"
    assert any("unauthorized action" in r for r in policy["reasons"])


# ---------------------------------------------------------
# Test 19: Policy Guard Failure Handling
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_policy_guard_confidence_out_of_bounds(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_conf_fail",
        "amount": 100000,
        "currency": "INR",
        "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    with patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case") as mock_ai:
        mock_ai.return_value = {
            "diagnosis": "Out of bounds confidence",
            "recommended_action": "SMART_RETRY",
            "reasoning": "Test",
            "customer_message": "",
            "confidence": 150.0,  # Out of bounds > 100
            "alternative_action": "STOP",
            "expected_outcome": "None",
            "requires_policy_validation": True
        }
        service = RazorpayIntelligenceService()
        result = service.evaluate_payment("pay_conf_fail")

        policy = result["policy_decision"]
        assert policy["approved"] is False
        assert any("confidence out of bounds" in r for r in policy["reasons"])


# ---------------------------------------------------------
# Test 20: Synthetic Evaluation Dataset Isolation
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
# Test 21: Existing 8A Health Endpoint Regression
# ---------------------------------------------------------

def test_regression_8a_health():
    res = client.get("/api/integrations/razorpay/health")
    assert res.status_code == 200
    assert "configured" in res.json()


# ---------------------------------------------------------
# Test 22: Existing 8B Payments Endpoint Regression
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_regression_8b_payments(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {"items": []}
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/payments")
    assert res.status_code == 200
    assert res.json()["payments"] == []


# ---------------------------------------------------------
# Test 23: Existing 8C Transaction Adapter Regression
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Test 24: Unconfigured Intelligence Endpoint Returns 503
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": ""}, clear=False)
def test_intelligence_endpoint_unconfigured_503():
    res = client.get("/api/integrations/razorpay/intelligence/pay_test")
    assert res.status_code == 503
    assert res.json() == {"detail": "Razorpay credentials not configured"}
