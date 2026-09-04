import pytest
from services.recovery_simulator import simulate_recovery

def test_policy_rejection():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 1.0}
    policy = {"approved": False, "final_action": "SMART_RETRY"}
    
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    assert not result["attempted"]
    assert not result["success"]
    assert result["amount_recovered"] == 0.0

def test_stop_action():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 1.0}
    policy = {"approved": True, "final_action": "STOP"}
    
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    assert not result["attempted"]

def test_human_approval_action():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 1.0}
    policy = {"approved": True, "final_action": "HUMAN_APPROVAL"}
    
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    assert not result["attempted"]

def test_smart_retry_success():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 1.0} # Guarantee success with 1.0 prob
    policy = {"approved": True, "final_action": "SMART_RETRY"}
    
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    assert result["attempted"]
    assert result["success"]
    assert result["amount_recovered"] == 100.0

def test_receivables_escalation_success():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 1.0}
    policy = {"approved": True, "final_action": "RECEIVABLES_ESCALATION"}
    
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    assert result["attempted"]
    assert result["success"]
    assert result["amount_recovered"] == 80.0

def test_deterministic_idempotency():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 0.5}
    policy = {"approved": True, "final_action": "SMART_RETRY"}
    
    result1 = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    result2 = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    
    assert result1["success"] == result2["success"]
    assert result1["amount_recovered"] == result2["amount_recovered"]

def test_recovery_never_exceeds_risk():
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": False}
    decision = {"recovery_probability": 1.0}
    policy = {"approved": True, "final_action": "SMART_RETRY"}
    
    # Intentionally modifying simulator logic wouldn't make sense to test here,
    # but we can test that the result returned bounded.
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 100})
    assert result["amount_recovered"] <= tx["amount"]

def test_no_revenue_risk():
    # Transaction already recovered
    tx = {"transaction_id": "txn_123", "amount": 100, "recovered": True}
    decision = {"recovery_probability": 1.0}
    policy = {"approved": True, "final_action": "SMART_RETRY"}
    
    result = simulate_recovery(tx, decision, policy, {"revenue_at_risk": 0})
    assert not result["attempted"]
    assert result["outcome_reason"] == "No revenue risk"
