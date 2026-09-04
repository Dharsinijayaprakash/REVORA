import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.policy_guard import validate_action

def test_high_value_transaction_cannot_bypass_human_approval():
    tx = {"amount": 60000}
    ai = {"recommended_action": "SMART_RETRY", "confidence": 80}
    det = {"action": "HUMAN_APPROVAL", "expected_recovery": 30000, "requires_human_approval": True}
    
    res = validate_action(tx, ai, det)
    assert res["approved"] == False
    assert res["final_action"] == "HUMAN_APPROVAL"

def test_max_recovery_attempts_cannot_be_bypassed():
    tx = {"amount": 1000, "recovery_attempts": 2}
    ai = {"recommended_action": "SMART_RETRY", "confidence": 80}
    det = {"action": "STOP", "expected_recovery": 0}
    
    res = validate_action(tx, ai, det)
    assert res["approved"] == False
    assert res["final_action"] == "STOP"

def test_severe_overdue_invoice_cannot_bypass_human_approval():
    tx = {"amount": 1000, "invoice_due_days": 40}
    ai = {"recommended_action": "RECEIVABLES_ESCALATION", "confidence": 80}
    det = {"action": "HUMAN_APPROVAL", "expected_recovery": 500, "requires_human_approval": True}
    
    res = validate_action(tx, ai, det)
    assert res["approved"] == False
    assert res["final_action"] == "HUMAN_APPROVAL"

def test_deterministic_stop_cannot_be_overridden():
    tx = {"amount": 100}
    ai = {"recommended_action": "SMART_RETRY", "confidence": 80}
    det = {"action": "STOP", "expected_recovery": 0}
    
    res = validate_action(tx, ai, det)
    assert res["approved"] == False
    assert res["final_action"] == "STOP"

def test_invalid_ai_action_is_rejected():
    tx = {"amount": 100}
    ai = {"recommended_action": "REFUND_MONEY", "confidence": 80}
    det = {"action": "SMART_RETRY", "expected_recovery": 75}
    
    res = validate_action(tx, ai, det)
    assert res["approved"] == False
    assert res["final_action"] == "SMART_RETRY"

def test_economic_invalidity_rejected():
    tx = {"amount": 5}
    ai = {"recommended_action": "RECEIVABLES_ESCALATION", "confidence": 80} # Cost 50
    det = {"action": "STOP", "expected_recovery": 2}
    
    res = validate_action(tx, ai, det)
    assert res["approved"] == False
    assert res["final_action"] == "STOP"
