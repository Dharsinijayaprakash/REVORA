import random
import hashlib

def simulate_recovery(transaction: dict, decision: dict, policy_result: dict, risk_analysis: dict) -> dict:
    """
    Simulates the outcome of a recovery action using a deterministic probability model.
    """
    tx_id = transaction.get("transaction_id", "")
    revenue_at_risk = float(risk_analysis.get("revenue_at_risk", 0.0))
    
    # If the transaction isn't at risk, no recovery can happen
    if revenue_at_risk <= 0:
        return {
            "transaction_id": tx_id,
            "action": "NONE",
            "attempted": False,
            "success": False,
            "amount_recovered": 0.0,
            "remaining_revenue_at_risk": 0.0,
            "outcome_reason": "No revenue risk",
            "simulated": True
        }

    final_action = policy_result.get("final_action", "STOP")
    approved = policy_result.get("approved", False)
    
    # Policy rejection, STOP, or HUMAN_APPROVAL mean no autonomous attempt
    if not approved or final_action in ["STOP", "HUMAN_APPROVAL"]:
        reason = "Action rejected by policy" if not approved else f"Action was {final_action}"
        return {
            "transaction_id": tx_id,
            "action": final_action,
            "attempted": False,
            "success": False,
            "amount_recovered": 0.0,
            "remaining_revenue_at_risk": revenue_at_risk,
            "outcome_reason": reason,
            "simulated": True
        }

    # Deterministic randomness based on transaction ID
    # This ensures reproducible simulation across runs
    seed_val = int(hashlib.md5(tx_id.encode('utf-8')).hexdigest(), 16)
    rng = random.Random(seed_val)
    
    # Use recovery probability from decision engine, default to 0.2 if missing
    prob = decision.get("recovery_probability", 0.2)
    
    is_success = rng.random() < prob
    
    amount_recovered = 0.0
    reason = "Recovery attempt failed"
    
    if is_success:
        reason = "Recovery successful"
        if final_action == "RECEIVABLES_ESCALATION":
            # 80% recovery with 20% haircut
            amount_recovered = revenue_at_risk * 0.8
        else:
            # 100% recovery for SMART_RETRY, PAYMENT_REMINDER, MANDATE_RETRY
            amount_recovered = revenue_at_risk
            
        # Bound check: never exceed revenue at risk
        amount_recovered = min(amount_recovered, revenue_at_risk)
        
    return {
        "transaction_id": tx_id,
        "action": final_action,
        "attempted": True,
        "success": is_success,
        "amount_recovered": round(amount_recovered, 2),
        "remaining_revenue_at_risk": round(revenue_at_risk - amount_recovered, 2),
        "outcome_reason": reason,
        "simulated": True
    }
