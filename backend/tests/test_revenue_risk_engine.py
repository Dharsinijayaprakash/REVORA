import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.revenue_risk_engine import analyze_transaction

def test_temporary_bank_error_classification():
    tx = {
        "transaction_id": "1", "amount": 100, "recovered_amount": 0,
        "status": "failed", "failure_reason": "temporary_bank_error"
    }
    res = analyze_transaction(tx)
    assert res["root_cause"] == "TEMPORARY_PAYMENT_FAILURE"
    assert res["recommended_recovery_window"] == "15-30 minutes"

def test_checkout_abandonment_classification():
    tx = {
        "transaction_id": "2", "amount": 200, "recovered_amount": 0,
        "status": "abandoned", "failure_reason": "none"
    }
    res = analyze_transaction(tx)
    assert res["root_cause"] == "CHECKOUT_ABANDONMENT"
    assert res["recommended_recovery_window"] == "30-60 minutes"

def test_overdue_classification():
    tx = {
        "transaction_id": "3", "amount": 300, "recovered_amount": 0,
        "status": "overdue", "failure_reason": "none"
    }
    res = analyze_transaction(tx)
    assert res["root_cause"] == "OVERDUE_RECEIVABLE"
    assert res["recommended_recovery_window"] == "1-3 days"

def test_risk_score_boundaries():
    # Base failed = 30
    tx1 = {"status": "failed"} # 30 -> MEDIUM
    assert analyze_transaction(tx1)["risk_score"] == 30
    assert analyze_transaction(tx1)["risk_level"] == "MEDIUM"

    # Maxing out score
    tx2 = {
        "status": "overdue", # 35
        "previous_failed_payments": 5, # 10
        "invoice_due_days": 20, # 10
        "amount": 60000, # 10
        "customer_lifetime_value": 150000, # 10
        "recovery_attempts": 3 # 10
    }
    # 35 + 50 = 85 -> HIGH
    assert analyze_transaction(tx2)["risk_score"] == 85
    assert analyze_transaction(tx2)["risk_level"] == "HIGH"

    tx3 = {"status": "successful"} # 0 -> LOW
    assert analyze_transaction(tx3)["risk_score"] == 0
    assert analyze_transaction(tx3)["risk_level"] == "LOW"

def test_revenue_at_risk_calculation():
    tx = {"amount": 1000, "recovered_amount": 200}
    res = analyze_transaction(tx)
    assert res["revenue_at_risk"] == 800

def test_deterministic_output():
    tx = {
        "transaction_id": "42",
        "status": "failed",
        "failure_reason": "insufficient_funds",
        "amount": 500,
        "recovered_amount": 0
    }
    res1 = analyze_transaction(tx)
    res2 = analyze_transaction(tx)
    assert res1 == res2
