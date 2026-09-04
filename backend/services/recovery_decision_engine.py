def decide_recovery_action(transaction: dict, risk_analysis: dict) -> dict:
    PROBABILITIES = {
        "TEMPORARY_PAYMENT_FAILURE": 0.75,
        "PAYMENT_INFRASTRUCTURE_FAILURE": 0.70,
        "PAYMENT_METHOD_FAILURE": 0.40,
        "INSUFFICIENT_FUNDS": 0.30,
        "AUTHENTICATION_FAILURE": 0.45,
        "CHECKOUT_ABANDONMENT": 0.35,
        "OVERDUE_RECEIVABLE": 0.50,
        "SUBSCRIPTION_PAYMENT_FAILURE": 0.55,
        "OTHER_REVENUE_RISK": 0.20
    }

    COSTS = {
        "SMART_RETRY": 5,
        "PAYMENT_REMINDER": 2,
        "MANDATE_RETRY": 5,
        "RECEIVABLES_ESCALATION": 50,
        "HUMAN_APPROVAL": 0,
        "STOP": 0
    }

    BASE_ACTIONS = {
        "TEMPORARY_PAYMENT_FAILURE": "SMART_RETRY",
        "PAYMENT_INFRASTRUCTURE_FAILURE": "SMART_RETRY",
        "PAYMENT_METHOD_FAILURE": "PAYMENT_REMINDER",
        "INSUFFICIENT_FUNDS": "PAYMENT_REMINDER",
        "AUTHENTICATION_FAILURE": "PAYMENT_REMINDER",
        "CHECKOUT_ABANDONMENT": "PAYMENT_REMINDER",
        "SUBSCRIPTION_PAYMENT_FAILURE": "MANDATE_RETRY",
        "OVERDUE_RECEIVABLE": "RECEIVABLES_ESCALATION", 
        "OTHER_REVENUE_RISK": "PAYMENT_REMINDER"
    }

    amount = float(transaction.get("amount", 0))
    recovery_attempts = int(transaction.get("recovery_attempts", 0))
    invoice_due = int(transaction.get("invoice_due_days", 0))
    prev_failed = int(transaction.get("previous_failed_payments", 0))
    checkout_abandoned = str(transaction.get("checkout_abandoned", "false")).lower() == "true"
    
    root_cause = risk_analysis.get("root_cause", "OTHER_REVENUE_RISK")
    recovery_prob = PROBABILITIES.get(root_cause, 0.20)
    expected_recovery = amount * recovery_prob
    
    action = BASE_ACTIONS.get(root_cause, "PAYMENT_REMINDER")
    reason = f"Base action selected for {root_cause}"
    requires_human_approval = False
    stopping_reason = None
    policy_checks = []

    # Policy E: Overdue escalation overrides
    if root_cause == "OVERDUE_RECEIVABLE":
        if 1 <= invoice_due <= 7:
            action = "PAYMENT_REMINDER"
            reason = f"Invoice is {invoice_due} days overdue (early stage)"
            policy_checks.append("OVERDUE_EARLY")
        elif 8 <= invoice_due <= 30:
            action = "RECEIVABLES_ESCALATION"
            reason = f"Invoice is {invoice_due} days overdue (escalation stage)"
            policy_checks.append("OVERDUE_ESCALATION")
        elif invoice_due > 30:
            action = "HUMAN_APPROVAL"
            requires_human_approval = True
            reason = f"Invoice is severely overdue ({invoice_due} days). Requires human approval."
            policy_checks.append("OVERDUE_SEVERE")

    # Policy B: High-value transactions
    if amount >= 50000:
        action = "HUMAN_APPROVAL"
        requires_human_approval = True
        reason = "High-value transactions (>= 50,000) require human approval."
        policy_checks.append("HIGH_VALUE")

    # Policy D: Customer fatigue for abandoned checkouts
    if checkout_abandoned and recovery_attempts >= 1:
        policy_checks.append("CUSTOMER_FATIGUE_CHECKOUT")

    # Policy A: Maximum automatic recovery attempts
    if recovery_attempts >= 2:
        action = "STOP"
        stopping_reason = "Maximum automatic recovery attempts reached"
        reason = stopping_reason
        requires_human_approval = False
        policy_checks.append("MAX_ATTEMPTS")

    # Calculate intervention cost based on chosen action
    intervention_cost = COSTS.get(action, 0)

    # Policy C: Low expected value
    if action not in ["STOP", "HUMAN_APPROVAL"]:
        if expected_recovery <= intervention_cost:
            action = "STOP"
            stopping_reason = "Expected recovery does not justify intervention cost"
            reason = stopping_reason
            policy_checks.append("LOW_ROI")

    # Confidence calculation:
    # 1. Base confidence is derived from historical recovery probabilities mapping (recovery_prob * 100).
    # 2. Add 10 if customer has a clean history (no previous failures).
    # 3. Deduct 10 if customer has a bad history (more than 2 previous failures).
    # 4. Bounded to min 10, max 95 to avoid absolute certainty.
    confidence = recovery_prob * 100
    if prev_failed == 0:
        confidence += 10
    elif prev_failed > 2:
        confidence -= 10
    confidence = max(10, min(95, confidence))

    return {
        "transaction_id": transaction.get("transaction_id", ""),
        "action": action,
        "reason": reason,
        "expected_recovery": round(expected_recovery, 2),
        "recovery_probability": recovery_prob,
        "intervention_cost": intervention_cost,
        "requires_human_approval": requires_human_approval,
        "policy_checks": policy_checks,
        "stopping_reason": stopping_reason,
        "confidence": confidence
    }
