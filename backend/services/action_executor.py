from typing import Optional, Any


def execute_action(
    transaction: dict,
    approved_action: dict,
    razorpay_client: Optional[Any] = None
) -> dict:
    """
    Authoritative REVORA Action Executor.
    
    Two supported modes:
    1. Bounded Razorpay Test Mode execution:
       When transaction has provider == 'razorpay' and razorpay_client is provided,
       executes the single allowlisted bounded Test Mode operation (TEST_ORDER_CREATION).
       Enforces validated provider currency (never defaults to INR).
       Never executes live money movement, captures, or refunds.
       
    2. Synthetic / Simulation execution:
       When razorpay_client is None or for synthetic transactions,
       executes safe simulation for batch evaluation and demos.
    """
    action = approved_action.get("final_action", "STOP")
    tx_id = transaction.get("transaction_id", "unknown")

    # ---------------------------------------------------------
    # Mode 1: Bounded Razorpay Test Mode Execution Path
    # ---------------------------------------------------------
    if transaction.get("provider") == "razorpay" and razorpay_client is not None:
        # Currency Validation: strictly require provider-supplied currency without defaulting
        currency = transaction.get("currency")
        if not currency or not isinstance(currency, str) or not currency.strip():
            return {
                "success": False,
                "action": action,
                "message": "Transaction currency is missing or invalid. Cannot execute Razorpay operation without valid provider currency.",
                "executed_operation": "NONE",
                "simulated": False,
                "test_mode": True
            }

        # Allowlist check for bounded Test Mode action
        if action != "SMART_RETRY":
            return {
                "success": False,
                "action": action,
                "message": f"Action '{action}' is not allowlisted for bounded Razorpay Test Mode execution.",
                "executed_operation": "NONE",
                "simulated": False,
                "test_mode": True
            }

        raw_amount = transaction.get("raw_amount")
        if raw_amount is None:
            raw_amount = int(round(float(transaction.get("amount", 0)) * 100))

        payment_id = transaction.get("payment_id", tx_id)
        # Razorpay receipt max length is 40 chars
        receipt = f"rcpt_{payment_id[-14:]}"

        order_data = {
            "amount": raw_amount,
            "currency": currency.strip(),
            "receipt": receipt,
            "notes": {
                "revora_action": "SMART_RETRY",
                "original_payment_id": payment_id,
                "environment": "test"
            }
        }

        order = razorpay_client.order.create(data=order_data)

        return {
            "success": True,
            "action": "SMART_RETRY",
            "executed_operation": "TEST_ORDER_CREATION",
            "operation_description": "Created a bounded Razorpay Test Mode order for payment recovery retry intent. Does not recharge or alter original payment.",
            "order_id": order.get("id"),
            "recovered_amount": 0.0,
            "simulated": False,
            "test_mode": True
        }

    # ---------------------------------------------------------
    # Mode 2: Synthetic / Pure Simulation Path (Existing)
    # ---------------------------------------------------------
    if action == "SMART_RETRY":
        message = f"Simulated SMART_RETRY for transaction {tx_id}"
    elif action == "PAYMENT_REMINDER":
        message = f"Simulated PAYMENT_REMINDER for transaction {tx_id}"
    elif action == "MANDATE_RETRY":
        message = f"Simulated MANDATE_RETRY for transaction {tx_id}"
    elif action == "RECEIVABLES_ESCALATION":
        message = f"Simulated RECEIVABLES_ESCALATION for transaction {tx_id}"
    elif action == "HUMAN_APPROVAL":
        message = f"Simulated HUMAN_APPROVAL request for transaction {tx_id}"
    elif action == "STOP":
        message = f"Simulated STOP action for transaction {tx_id}"
    else:
        message = f"Unknown simulated action for transaction {tx_id}"
        return {
            "success": False,
            "action": action,
            "message": "Invalid action in executor simulation",
            "simulated": True
        }

    return {
        "success": True,
        "action": action,
        "message": message,
        "simulated": True
    }
