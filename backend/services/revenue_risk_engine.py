def analyze_transaction(transaction: dict) -> dict:
    # Convert types safely
    amount = float(transaction.get("amount", 0))
    recovered_amount = float(transaction.get("recovered_amount", 0))
    status = transaction.get("status", "")
    failure_reason = transaction.get("failure_reason", "none")
    transaction_type = transaction.get("transaction_type", "")
    prev_failed = int(transaction.get("previous_failed_payments", 0))
    invoice_due = int(transaction.get("invoice_due_days", 0))
    clv = float(transaction.get("customer_lifetime_value", 0))
    recovery_attempts = int(transaction.get("recovery_attempts", 0))

    revenue_at_risk = max(amount - recovered_amount, 0)
    
    # 1. Root Cause Classification and Recommended Recovery Window
    if status == "failed" and failure_reason == "temporary_bank_error":
        root_cause = "TEMPORARY_PAYMENT_FAILURE"
        rec_window = "15-30 minutes"
    elif status == "failed" and failure_reason == "network_error":
        root_cause = "PAYMENT_INFRASTRUCTURE_FAILURE"
        rec_window = "15-30 minutes"
    elif status == "failed" and failure_reason == "card_declined":
        root_cause = "PAYMENT_METHOD_FAILURE"
        rec_window = "1-4 hours"
    elif status == "failed" and failure_reason == "insufficient_funds":
        root_cause = "INSUFFICIENT_FUNDS"
        rec_window = "24-48 hours"
    elif status == "failed" and failure_reason == "authentication_failure":
        root_cause = "AUTHENTICATION_FAILURE"
        rec_window = "1-4 hours"
    elif status == "abandoned":
        root_cause = "CHECKOUT_ABANDONMENT"
        rec_window = "30-60 minutes"
    elif status == "overdue":
        root_cause = "OVERDUE_RECEIVABLE"
        rec_window = "1-3 days"
    elif status == "failed" and transaction_type == "subscription":
        root_cause = "SUBSCRIPTION_PAYMENT_FAILURE"
        rec_window = "24-48 hours"
    else:
        root_cause = "OTHER_REVENUE_RISK"
        rec_window = "24 hours"

    # 2. Risk Score & Factors
    score = 0
    factors = []

    if status == "failed":
        score += 30
        factors.append("Payment failed")
    elif status == "abandoned":
        score += 25
        factors.append("Checkout was abandoned")
    elif status == "overdue":
        score += 35
        factors.append("Invoice is overdue")

    if prev_failed >= 3:
        score += 10
        factors.append(f"Customer has {prev_failed} previous failed payments")
    if invoice_due >= 15:
        score += 10
        factors.append(f"Invoice is {invoice_due} days overdue")
    if amount >= 50000:
        score += 10
        factors.append("Transaction amount is >= 50,000")
    if clv >= 100000:
        score += 10
        factors.append("Customer lifetime value is >= 100,000")
    if recovery_attempts >= 2:
        score += 10
        factors.append(f"Already had {recovery_attempts} recovery attempts")

    score = min(score, 100)

    if score <= 29:
        risk_level = "LOW"
    elif score <= 59:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    return {
        "transaction_id": transaction.get("transaction_id", ""),
        "revenue_at_risk": revenue_at_risk,
        "risk_score": score,
        "risk_level": risk_level,
        "root_cause": root_cause,
        "risk_factors": factors,
        "recommended_recovery_window": rec_window
    }
