import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.recovery_decision_engine import decide_recovery_action

def test_temporary_payment_failure_retry():
    tx = {"amount": 1000, "recovery_attempts": 0}
    risk = {"root_cause": "TEMPORARY_PAYMENT_FAILURE"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "SMART_RETRY"

def test_checkout_abandonment_reminder():
    tx = {"amount": 2000, "recovery_attempts": 0}
    risk = {"root_cause": "CHECKOUT_ABANDONMENT"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "PAYMENT_REMINDER"

def test_subscription_failure_mandate_retry():
    tx = {"amount": 500, "recovery_attempts": 0}
    risk = {"root_cause": "SUBSCRIPTION_PAYMENT_FAILURE"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "MANDATE_RETRY"

def test_overdue_15_days_escalation():
    tx = {"amount": 5000, "recovery_attempts": 0, "invoice_due_days": 15}
    risk = {"root_cause": "OVERDUE_RECEIVABLE"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "RECEIVABLES_ESCALATION"

def test_high_value_transaction_human_approval():
    tx = {"amount": 60000, "recovery_attempts": 0}
    risk = {"root_cause": "TEMPORARY_PAYMENT_FAILURE"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "HUMAN_APPROVAL"
    assert res["requires_human_approval"] == True

def test_two_previous_recovery_attempts_stop():
    tx = {"amount": 1000, "recovery_attempts": 2}
    risk = {"root_cause": "TEMPORARY_PAYMENT_FAILURE"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "STOP"
    assert res["stopping_reason"] == "Maximum automatic recovery attempts reached"

def test_low_expected_recovery_stop():
    # amount = 10 -> expected recovery = 10 * 0.40 = 4. Cost of PAYMENT_REMINDER = 2. Wait, 4 > 2, so it proceeds.
    # amount = 3 -> expected recovery = 3 * 0.40 = 1.20. Cost = 2. 1.20 < 2, so STOP.
    tx = {"amount": 3, "recovery_attempts": 0}
    risk = {"root_cause": "PAYMENT_METHOD_FAILURE"}
    res = decide_recovery_action(tx, risk)
    assert res["action"] == "STOP"
    assert res["stopping_reason"] == "Expected recovery does not justify intervention cost"

def test_deterministic_output():
    tx = {"transaction_id": "1", "amount": 1000, "previous_failed_payments": 0}
    risk = {"root_cause": "INSUFFICIENT_FUNDS"}
    res1 = decide_recovery_action(tx, risk)
    res2 = decide_recovery_action(tx, risk)
    assert res1 == res2
