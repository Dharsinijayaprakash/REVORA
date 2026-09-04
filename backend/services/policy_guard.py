def validate_action(transaction: dict, ai_result: dict, deterministic_decision: dict) -> dict:
    ALLOWED_ACTIONS = {
        "SMART_RETRY", "PAYMENT_REMINDER", "MANDATE_RETRY",
        "RECEIVABLES_ESCALATION", "HUMAN_APPROVAL", "STOP"
    }
    
    amount = float(transaction.get("amount", 0))
    recovery_attempts = int(transaction.get("recovery_attempts", 0))
    invoice_due = int(transaction.get("invoice_due_days", 0))
    
    ai_action = ai_result.get("recommended_action", "STOP")
    det_action = deterministic_decision.get("action", "STOP")
    det_human_approval = deterministic_decision.get("requires_human_approval", False)
    
    approved = True
    reasons = []
    overrides = []
    final_action = ai_action
    
    # 8. AI confidence must be between 0 and 100
    confidence = ai_result.get("confidence", 0)
    if not (0 <= confidence <= 100):
        approved = False
        reasons.append("AI confidence out of bounds.")
        overrides.append("Confidence check failed.")
        final_action = det_action
        
    # 1. AI action is one of the six allowed actions
    if ai_action not in ALLOWED_ACTIONS:
        approved = False
        reasons.append(f"AI recommended an unauthorized action: {ai_action}")
        overrides.append("Invalid action override.")
        final_action = det_action

    # 2. High-value transactions >= 50,000 require HUMAN_APPROVAL
    if amount >= 50000 and final_action != "HUMAN_APPROVAL":
        approved = False
        reasons.append("High-value transaction >= 50,000 requires human approval.")
        overrides.append("High-value override.")
        final_action = "HUMAN_APPROVAL"

    # 3. Transactions with recovery_attempts >= 2 must be STOP
    if recovery_attempts >= 2 and final_action != "STOP":
        approved = False
        reasons.append("Maximum recovery attempts reached.")
        overrides.append("Max attempts override.")
        final_action = "STOP"

    # 4. Severely overdue invoices >30 days require HUMAN_APPROVAL
    if invoice_due > 30 and final_action not in ["HUMAN_APPROVAL", "STOP"]:
        # If it hits STOP because of attempts, let it be STOP, otherwise HUMAN_APPROVAL
        if recovery_attempts < 2:
            approved = False
            reasons.append("Severely overdue invoice > 30 days requires human approval.")
            overrides.append("Severe overdue override.")
            final_action = "HUMAN_APPROVAL"

    # 5. If deterministic decision is STOP, AI cannot override it
    if det_action == "STOP" and final_action != "STOP":
        approved = False
        reasons.append("Deterministic decision was STOP. AI cannot override.")
        overrides.append("Deterministic STOP override.")
        final_action = "STOP"

    # 6. If deterministic decision requires human approval, AI cannot downgrade it
    if det_human_approval and final_action not in ["HUMAN_APPROVAL", "STOP"]:
        approved = False
        reasons.append("Deterministic decision required human approval. AI cannot downgrade.")
        overrides.append("Human approval override.")
        final_action = "HUMAN_APPROVAL"
            
    # 7. AI cannot execute an action that is economically invalid
    cost_map = {"SMART_RETRY": 5, "PAYMENT_REMINDER": 2, "MANDATE_RETRY": 5, "RECEIVABLES_ESCALATION": 50, "HUMAN_APPROVAL": 0, "STOP": 0}
    ai_cost = cost_map.get(final_action, 0)
    expected_rec = deterministic_decision.get("expected_recovery", 0)
    
    if final_action not in ["HUMAN_APPROVAL", "STOP"] and expected_rec <= ai_cost:
        approved = False
        reasons.append("Action is economically invalid (expected recovery <= cost).")
        overrides.append("Economic invalidity override.")
        final_action = "STOP"

    req_human = final_action == "HUMAN_APPROVAL"
    
    return {
        "approved": approved,
        "final_action": final_action,
        "reasons": reasons if not approved else ["Policy validation passed."],
        "overrides": overrides,
        "requires_human_approval": req_human
    }
