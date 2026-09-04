import os
import sys
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
import requests
from razorpay.errors import BadRequestError, ServerError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.razorpay_service import RazorpayService
from main import app

client = TestClient(app)

# ---------------------------------------------------------
# Test Case A: Credentials Missing
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": ""}, clear=False)
def test_credentials_missing_both():
    service = RazorpayService()
    res = service.verify_connection()
    assert res["provider"] == "razorpay"
    assert res["mode"] == "test"
    assert res["configured"] is False
    assert res["connected"] is False
    assert res["status"] == "not_configured"

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_12345", "RAZORPAY_KEY_SECRET": ""}, clear=False)
def test_credentials_missing_secret_only():
    service = RazorpayService()
    res = service.verify_connection()
    assert res["configured"] is False
    assert res["connected"] is False
    assert res["status"] == "not_configured"

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": "secret_abc"}, clear=False)
def test_credentials_missing_key_only():
    service = RazorpayService()
    res = service.verify_connection()
    assert res["configured"] is False
    assert res["connected"] is False
    assert res["status"] == "not_configured"


# ---------------------------------------------------------
# Test Case B: Credentials Present but Invalid (Auth Failed)
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_invalid", "RAZORPAY_KEY_SECRET": "invalid_secret"}, clear=False)
def test_credentials_invalid_auth_failed(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.order.all.side_effect = BadRequestError("Authentication failed")
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    res = service.verify_connection()

    assert res["provider"] == "razorpay"
    assert res["mode"] == "test"
    assert res["configured"] is True
    assert res["connected"] is False
    assert res["status"] == "authentication_failed"


# ---------------------------------------------------------
# Test Case C: Valid Credentials & Successful Connection
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid", "RAZORPAY_KEY_SECRET": "valid_secret_123"}, clear=False)
def test_valid_credentials_connected(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.order.all.return_value = {"entity": "collection", "count": 0, "items": []}
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    res = service.verify_connection()

    assert res["provider"] == "razorpay"
    assert res["mode"] == "test"
    assert res["configured"] is True
    assert res["connected"] is True
    assert res["status"] == "operational"


# ---------------------------------------------------------
# Test Case D: Connection Timeout / Network Failure
# ---------------------------------------------------------

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_valid", "RAZORPAY_KEY_SECRET": "valid_secret_123"}, clear=False)
def test_connection_timeout(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.order.all.side_effect = requests.exceptions.Timeout("Connection timed out")
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    res = service.verify_connection()

    assert res["configured"] is True
    assert res["connected"] is False
    assert res["status"] == "connection_failed"


# ---------------------------------------------------------
# Strict Verification: Configured != Connected
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_foo", "RAZORPAY_KEY_SECRET": "secret_bar"}, clear=False)
def test_configured_does_not_imply_connected():
    """
    Ensure that simply having credentials does NOT result in connected=True.
    A failed or unverified call MUST result in connected=False.
    """
    with patch("services.razorpay_service.razorpay.Client") as mock_client_class:
        mock_instance = MagicMock()
        mock_instance.order.all.side_effect = BadRequestError("Invalid key id")
        mock_client_class.return_value = mock_instance

        service = RazorpayService()
        assert service.is_configured() is True

        res = service.verify_connection()
        assert res["configured"] is True
        assert res["connected"] is False
        assert res["status"] != "operational"


# ---------------------------------------------------------
# FastAPI Health Endpoint Tests & Secret Leak Prevention
# ---------------------------------------------------------

@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": ""}, clear=False)
def test_health_endpoint_not_configured():
    response = client.get("/api/integrations/razorpay/health")
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "razorpay"
    assert data["mode"] == "test"
    assert data["configured"] is False
    assert data["connected"] is False
    assert data["status"] == "not_configured"

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_super_secret_id", "RAZORPAY_KEY_SECRET": "super_secret_key_value_987"}, clear=False)
def test_health_endpoint_never_leaks_secret(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.order.all.return_value = {"entity": "collection", "count": 0, "items": []}
    mock_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/health")
    assert response.status_code == 200
    data = response.json()
    assert data["configured"] is True
    assert data["connected"] is True
    assert data["status"] == "operational"

    # Strict security check: secret key must never appear in response body or headers
    raw_text = response.text
    assert "super_secret_key_value_987" not in raw_text
    assert "RAZORPAY_KEY_SECRET" not in raw_text
    for h_name, h_val in response.headers.items():
        assert "super_secret_key_value_987" not in h_val


# ---------------------------------------------------------
# STEP 8B Tests: Read-Only Payment Retrieval & Normalization
# ---------------------------------------------------------

from services.razorpay_service import (
    RazorpayNotConfiguredError,
    RazorpayAuthError,
    RazorpayNotFoundError,
    RazorpayConnectionError,
    RazorpayPayment
)

# 1. get_payment successful response & 2. normalization
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_get_payment_success_and_normalization(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_test_001",
        "entity": "payment",
        "amount": 75000,  # 750.00 INR in paise
        "currency": "INR",
        "status": "captured",
        "order_id": "order_999",
        "method": "upi",
        "created_at": 1690000000
    }
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    payment = service.get_payment("pay_test_001")

    assert isinstance(payment, RazorpayPayment)
    assert payment.provider == "razorpay"
    assert payment.mode == "test"
    assert payment.payment_id == "pay_test_001"
    assert payment.amount == 75000  # Preserved in paise, no silent conversion
    assert payment.currency == "INR"
    assert payment.status == "captured"
    assert payment.method == "upi"
    assert payment.order_id == "order_999"
    assert payment.created_at == 1690000000

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_get_payment_normalization_missing_optional_fields(mock_client_class):
    mock_instance = MagicMock()
    # Response without method, order_id, currency, created_at
    mock_instance.payment.fetch.return_value = {
        "id": "pay_minimal",
        "status": "failed",
        "amount": 2500
    }
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    payment = service.get_payment("pay_minimal")

    assert payment.payment_id == "pay_minimal"
    assert payment.status == "failed"
    assert payment.amount == 2500
    assert payment.currency is None  # Never fabricated
    assert payment.method is None
    assert payment.order_id is None
    assert payment.created_at is None

# 3. payment not found
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_get_payment_not_found(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("The id provided does not exist")
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    with pytest.raises(RazorpayNotFoundError) as exc_info:
        service.get_payment("pay_nonexistent")
    assert "Razorpay payment not found" in str(exc_info.value)

# 4. authentication failure
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_bad", "RAZORPAY_KEY_SECRET": "bad_secret"}, clear=False)
def test_get_payment_auth_failure(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("Authentication failed")
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    with pytest.raises(RazorpayAuthError):
        service.get_payment("pay_123")

# 5. network failure
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_get_payment_network_failure(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = requests.exceptions.ConnectionError("Connection refused")
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    with pytest.raises(RazorpayConnectionError):
        service.get_payment("pay_123")

# 6. missing credentials
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": ""}, clear=False)
def test_get_payment_missing_credentials():
    service = RazorpayService()
    with pytest.raises(RazorpayNotConfiguredError):
        service.get_payment("pay_123")

# 7. list payments successful response
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_list_payments_success(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {
        "entity": "collection",
        "count": 2,
        "items": [
            {"id": "pay_01", "amount": 1000, "currency": "INR", "status": "captured"},
            {"id": "pay_02", "amount": 2000, "currency": "INR", "status": "failed"}
        ]
    }
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    res = service.list_payments(count=10, skip=0)

    assert res["provider"] == "razorpay"
    assert res["mode"] == "test"
    assert res["count"] == 2
    assert len(res["payments"]) == 2
    assert res["payments"][0]["payment_id"] == "pay_01"
    assert res["payments"][0]["amount"] == 1000
    assert res["payments"][1]["payment_id"] == "pay_02"
    assert res["payments"][1]["status"] == "failed"

# 8. empty payment list
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_list_payments_empty(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {"entity": "collection", "count": 0, "items": []}
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    res = service.list_payments(count=10, skip=0)

    assert res["provider"] == "razorpay"
    assert res["mode"] == "test"
    assert res["count"] == 0
    assert res["payments"] == []

# 9. count default and 10. maximum limit
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_list_payments_count_params(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {"items": []}
    mock_client_class.return_value = mock_instance

    service = RazorpayService()
    service.list_payments(count=50, skip=5)
    mock_instance.payment.all.assert_called_once_with({"count": 50, "skip": 5})

# 11. count above maximum rejected by FastAPI endpoint
def test_api_list_payments_count_above_max_rejected():
    response = client.get("/api/integrations/razorpay/payments?count=51")
    assert response.status_code == 422

# 12. negative count rejected
def test_api_list_payments_negative_count_rejected():
    response = client.get("/api/integrations/razorpay/payments?count=-1")
    assert response.status_code == 422

# 13. negative skip rejected
def test_api_list_payments_negative_skip_rejected():
    response = client.get("/api/integrations/razorpay/payments?skip=-1")
    assert response.status_code == 422

# 14. API endpoint list payments success
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_api_endpoint_list_payments_success(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.all.return_value = {
        "items": [{"id": "pay_test", "amount": 5000, "currency": "INR", "status": "captured"}]
    }
    mock_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/payments?count=10&skip=0")
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "razorpay"
    assert data["mode"] == "test"
    assert data["count"] == 1
    assert data["payments"][0]["payment_id"] == "pay_test"
    assert data["payments"][0]["amount"] == 5000

# 15. API endpoint get single payment success & 404
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_api_endpoint_get_payment_success(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {
        "id": "pay_987",
        "amount": 12000,
        "currency": "INR",
        "status": "failed",
        "method": "card"
    }
    mock_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/payments/pay_987")
    assert response.status_code == 200
    data = response.json()
    assert data["payment_id"] == "pay_987"
    assert data["amount"] == 12000
    assert data["currency"] == "INR"
    assert data["status"] == "failed"

@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_123", "RAZORPAY_KEY_SECRET": "secret_123"}, clear=False)
def test_api_endpoint_get_payment_404(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("The id provided does not exist")
    mock_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/payments/pay_nonexistent")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Razorpay payment not found"

# 16. Secret leakage prevention across read endpoints
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_super_id", "RAZORPAY_KEY_SECRET": "super_secret_token_val_456"}, clear=False)
def test_payment_endpoints_never_leak_secret(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.return_value = {"id": "pay_secure", "amount": 100}
    mock_instance.payment.all.return_value = {"items": [{"id": "pay_secure", "amount": 100}]}
    mock_client_class.return_value = mock_instance

    res_single = client.get("/api/integrations/razorpay/payments/pay_secure")
    assert "super_secret_token_val_456" not in res_single.text
    assert "RAZORPAY_KEY_SECRET" not in res_single.text

    res_list = client.get("/api/integrations/razorpay/payments")
    assert "super_secret_token_val_456" not in res_list.text
    assert "RAZORPAY_KEY_SECRET" not in res_list.text

# 17. Raw headers or internal exceptions not exposed in errors
@patch("services.razorpay_service.razorpay.Client")
@patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_id", "RAZORPAY_KEY_SECRET": "test_secret"}, clear=False)
def test_raw_headers_not_exposed_on_error(mock_client_class):
    mock_instance = MagicMock()
    mock_instance.payment.fetch.side_effect = BadRequestError("Authentication failed")
    mock_client_class.return_value = mock_instance

    response = client.get("/api/integrations/razorpay/payments/pay_err")
    assert response.status_code == 502
    assert response.json() == {"detail": "Razorpay authentication failed"}
    assert "Authorization" not in str(response.headers)
    assert "Basic" not in str(response.headers)

# 18. Synthetic evaluation unaffected
def test_synthetic_evaluation_unaffected():
    # Calling razorpay endpoints does not modify evaluation summary
    from main import SUMMARY_PATH, RESULTS_PATH
    assert os.path.exists(SUMMARY_PATH)
    assert os.path.exists(RESULTS_PATH)
    res = client.get("/api/evaluation/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_transactions" in data

