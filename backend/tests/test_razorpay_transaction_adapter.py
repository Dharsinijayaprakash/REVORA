import os
import sys
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from razorpay.errors import BadRequestError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.razorpay_service import RazorpayService, RazorpayPayment
from services.razorpay_transaction_adapter import (
    RazorpayTransactionAdapter,
    RazorpayTransactionMappingError
)
from main import app

client = TestClient(app)

# ---------------------------------------------------------
# Test 1: Basic Successful Mapping
# ---------------------------------------------------------

def test_basic_successful_mapping():
    adapter = RazorpayTransactionAdapter()
    payment = RazorpayPayment(
        provider="razorpay",
        mode="test",
        payment_id="pay_test_abc123",
        status="captured",
        amount=50000,
        currency="INR",
        method="upi",
        order_id="order_xyz",
        created_at=1700000000
    )

    tx = adapter.adapt_payment(payment)

    assert tx["transaction_id"] == "razorpay:pay_test_abc123"
    assert tx["payment_id"] == "pay_test_abc123"
    assert tx["provider"] == "razorpay"
    assert tx["source"] == "razorpay_test"
    assert tx["amount"] == 500.0  # Converted from 50000 paise to 500.00 Rupees
    assert tx["raw_amount"] == 50000
    assert tx["raw_amount_unit"] == "paise"
    assert tx["currency"] == "INR"
    assert tx["status"] == "successful"  # captured -> successful
    assert tx["payment_method"] == "upi"
    assert tx["order_id"] == "order_xyz"
    assert tx["transaction_date"] == "2023-11-14 22:13:20"
    assert tx["raw_created_at"] == 1700000000


# ---------------------------------------------------------
# Test 2: Deterministic Identity
# ---------------------------------------------------------

def test_deterministic_identity():
    adapter = RazorpayTransactionAdapter()
    payment = RazorpayPayment(
        payment_id="pay_determ_001",
        status="captured",
        amount=10000,
        currency="INR"
    )

    tx1 = adapter.adapt_payment(payment)
    tx2 = adapter.adapt_payment(payment)

    assert tx1["transaction_id"] == tx2["transaction_id"]
    assert tx1 == tx2


# ---------------------------------------------------------
# Test 3: Amount Handling (Case B: Decimal Rupees + Raw Paise)
# ---------------------------------------------------------

def test_amount_preservation_and_conversion():
    adapter = RazorpayTransactionAdapter()

    # 50000 paise = 500.00 Rupees
    payment_50k = RazorpayPayment(payment_id="pay_1", status="captured", amount=50000, currency="INR")
    tx_50k = adapter.adapt_payment(payment_50k)
    assert tx_50k["amount"] == 500.0
    assert tx_50k["raw_amount"] == 50000
    assert tx_50k["raw_amount_unit"] == "paise"

    # 1739 paise = 17.39 Rupees
    payment_odd = RazorpayPayment(payment_id="pay_2", status="failed", amount=1739, currency="INR")
    tx_odd = adapter.adapt_payment(payment_odd)
    assert tx_odd["amount"] == 17.39
    assert tx_odd["raw_amount"] == 1739


# ---------------------------------------------------------
# Test 4: Currency Handling
# ---------------------------------------------------------

def test_currency_preservation():
    adapter = RazorpayTransactionAdapter()

    payment_inr = RazorpayPayment(payment_id="pay_inr", status="captured", amount=1000, currency="INR")
    assert adapter.adapt_payment(payment_inr)["currency"] == "INR"

    payment_usd = RazorpayPayment(payment_id="pay_usd", status="captured", amount=1000, currency="USD")
    assert adapter.adapt_payment(payment_usd)["currency"] == "USD"


# ---------------------------------------------------------
# Test 5: Optional Fields Missing (No fabricated sentinels)
# ---------------------------------------------------------

def test_optional_fields_missing():
    adapter = RazorpayTransactionAdapter()
    payment = RazorpayPayment(
        payment_id="pay_sparse",
        status="captured",
        amount=2000,
        currency="INR",
        method=None,
        order_id=None,
        created_at=None
    )

    tx = adapter.adapt_payment(payment)
    assert tx["payment_method"] is None
    assert tx["order_id"] is None
    assert tx["transaction_date"] is None
    assert tx["raw_created_at"] is None


# ---------------------------------------------------------
# Test 6: Unsupported Status Fails Safely
# ---------------------------------------------------------

def test_unsupported_status_fails_safely():
    adapter = RazorpayTransactionAdapter()

    # Razorpay 'authorized' must NOT be assumed equivalent to 'successful'
    payment_authorized = RazorpayPayment(payment_id="pay_auth", status="authorized", amount=1000, currency="INR")
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(payment_authorized)

    payment_created = RazorpayPayment(payment_id="pay_created", status="created", amount=1000, currency="INR")
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(payment_created)

    payment_refunded = RazorpayPayment(payment_id="pay_ref", status="refunded", amount=1000, currency="INR")
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(payment_refunded)


# ---------------------------------------------------------
# Test 7: Payment Method Preservation (No arbitrary allowlist)
# ---------------------------------------------------------

def test_payment_method_preservation():
    adapter = RazorpayTransactionAdapter()
    for method in ["card", "upi", "netbanking", "wallet", "emi", "bank_transfer", "custom_pay"]:
        payment = RazorpayPayment(payment_id="pay_m", status="captured", amount=1000, currency="INR", method=method)
        tx = adapter.adapt_payment(payment)
        assert tx["payment_method"] == method


# ---------------------------------------------------------
# Test 8: Missing Required Fields
# ---------------------------------------------------------

def test_missing_required_fields():
    adapter = RazorpayTransactionAdapter()

    # Missing payment_id
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(RazorpayPayment(payment_id="", status="captured", amount=1000, currency="INR"))

    # Missing amount
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(RazorpayPayment(payment_id="p", status="captured", amount=None, currency="INR"))

    # Missing currency
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(RazorpayPayment(payment_id="p", status="captured", amount=1000, currency=None))

    # Missing status
    with pytest.raises(RazorpayTransactionMappingError):
        adapter.adapt_payment(RazorpayPayment(payment_id="p", status=None, amount=1000, currency="INR"))


# ---------------------------------------------------------
# Test 9: No AI Recovery Agent Invocation
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.ai_recovery_agent.AIRecoveryAgent.analyze_recovery_case")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_no_ai_invocation(mock_ai, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_ai_check", "amount": 50000, "currency": "INR", "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_ai_check")
    assert response.status_code == 200
    assert mock_ai.call_count == 0


# ---------------------------------------------------------
# Test 10: No Risk Engine Invocation
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.revenue_risk_engine.analyze_transaction")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_no_risk_engine_invocation(mock_risk, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_risk_check", "amount": 50000, "currency": "INR", "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_risk_check")
    assert response.status_code == 200
    assert mock_risk.call_count == 0


# ---------------------------------------------------------
# Test 11: No Policy Guard Invocation
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.policy_guard.validate_action")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_no_policy_guard_invocation(mock_policy, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_policy_check", "amount": 50000, "currency": "INR", "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_policy_check")
    assert response.status_code == 200
    assert mock_policy.call_count == 0


# ---------------------------------------------------------
# Test 12: No Action Executor Invocation
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch("services.action_executor.execute_action")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_no_executor_invocation(mock_executor, mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_exec_check", "amount": 50000, "currency": "INR", "status": "failed"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_exec_check")
    assert response.status_code == 200
    assert mock_executor.call_count == 0



# ---------------------------------------------------------
# Test 13: No Razorpay Write Operations
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_no_razorpay_write_operations(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_read_only",
        "amount": 2000,
        "currency": "INR",
        "status": "captured"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_read_only")
    assert response.status_code == 200

    # Verify only fetch was called, never create, capture, refund, etc.
    mock_instance.payment.fetch.assert_called_once_with("pay_read_only")
    assert getattr(mock_instance.payment, "create", MagicMock()).call_count == 0
    assert getattr(mock_instance.payment, "capture", MagicMock()).call_count == 0
    assert getattr(mock_instance.payment, "refund", MagicMock()).call_count == 0


# ---------------------------------------------------------
# Test 14: API Endpoint Successful Mapping
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_api_endpoint_success(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_live_01",
        "amount": 100000,  # 1000.00 Rupees
        "currency": "INR",
        "status": "captured",
        "method": "upi",
        "order_id": "order_001",
        "created_at": 1700000000
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_live_01")
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "razorpay_test"
    assert data["provider"] == "razorpay"
    tx = data["transaction"]
    assert tx["transaction_id"] == "razorpay:pay_live_01"
    assert tx["amount"] == 1000.0
    assert tx["raw_amount"] == 100000
    assert tx["raw_amount_unit"] == "paise"
    assert tx["status"] == "successful"


# ---------------------------------------------------------
# Test 15: API Endpoint Payment Not Found
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_api_endpoint_payment_not_found(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("The id provided does not exist")
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_not_found")
    assert response.status_code == 404
    assert response.json() == {"detail": "Razorpay payment not found"}


# ---------------------------------------------------------
# Test 16: API Endpoint Mapping Failure (Safe error message)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_api_endpoint_mapping_failure_safe_message(mock_rzp_client_class):
    mock_instance = MagicMock()
    # Razorpay payment with unmappable status
    mock_instance.payment.fetch.return_value = {
        "id": "pay_unmappable",
        "amount": 1000,
        "currency": "INR",
        "status": "authorized"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_unmappable")
    assert response.status_code == 422
    # Ensure internal exception stack or message is NOT exposed to client
    assert response.json() == {"detail": "Unable to map Razorpay payment to REVORA transaction"}


# ---------------------------------------------------------
# Test 17: Secret Leakage Prevention
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_sec_id", "RAZORPAY_KEY_SECRET": "super_secret_adapter_val_999"}, clear=False)
def test_api_endpoint_never_leaks_secret(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_sec_check",
        "amount": 5000,
        "currency": "INR",
        "status": "captured"
    }
    mock_rzp_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/transactions/pay_sec_check")
    assert response.status_code == 200
    assert "super_secret_adapter_val_999" not in response.text
    assert "RAZORPAY_KEY_SECRET" not in response.text


# ---------------------------------------------------------
# Test 18: Synthetic Dataset Isolation
# ---------------------------------------------------------

def test_synthetic_dataset_isolation():
    from main import SUMMARY_PATH, RESULTS_PATH
    import csv

    # Verify existing synthetic CSVs and summary remain intact and valid
    assert os.path.exists(SUMMARY_PATH)
    assert os.path.exists(RESULTS_PATH)

    with open(RESULTS_PATH, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        assert "transaction_id" in header
        first_row = next(reader)
        # Verify first row still contains synthetic transaction ID
        assert first_row[0].startswith("txn_")


# ---------------------------------------------------------
# Test 19: Existing Health Endpoint Regression
# ---------------------------------------------------------

def test_regression_health_endpoint():
    res = client.get("/api/integrations/razorpay/health")
    assert res.status_code == 200
    data = res.json()
    assert data["provider"] == "razorpay"
    assert data["mode"] == "test"
    assert "configured" in data
    assert "connected" in data


# ---------------------------------------------------------
# Test 20: Existing Payments Endpoint Regression
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_k", "RAZORPAY_KEY_SECRET": "sec_k"}, clear=False)
def test_regression_payments_endpoint(mock_rzp_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {
        "items": [{"id": "pay_reg", "amount": 1000, "currency": "INR", "status": "captured"}]
    }
    mock_rzp_client_class.return_value = mock_instance

    res = client.get("/api/integrations/razorpay/payments")
    assert res.status_code == 200
    assert res.json()["count"] == 1
