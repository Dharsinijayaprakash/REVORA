import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from services.razorpay_service import RazorpayPayment

logger = logging.getLogger("REVORA.RazorpayTransactionAdapter")


class RazorpayTransactionMappingError(Exception):
    """Raised when a Razorpay payment cannot be deterministically mapped to REVORA."""
    pass


# Explicit status mapping.
# 'captured' represents a confirmed settlement -> 'successful'
# 'failed' represents a failed transaction -> 'failed'
# Other Razorpay statuses (e.g. 'authorized', 'created', 'refunded') do NOT have semantic
# equivalence in REVORA's core payment transaction status model and must fail safely.
RAZORPAY_STATUS_MAP = {
    "captured": "successful",
    "failed": "failed",
}


class RazorpayTransactionAdapter:
    """
    Deterministic, read-only adapter that converts a normalized RazorpayPayment
    into a REVORA-compatible transaction representation.
    
    CRITICAL ARCHITECTURAL BOUNDARY:
    - Performs DATA MAPPING ONLY.
    - Does NOT invoke Risk Engine, Decision Engine, AI Agent, Policy Guard, or Executor.
    - Zero write operations against Razorpay.
    """

    def adapt_payment(self, payment: RazorpayPayment) -> Dict[str, Any]:
        """
        Converts a normalized RazorpayPayment into a REVORA transaction dictionary.
        
        Amount Handling (Case B):
        - Razorpay provides amounts in smallest currency units (paise for INR).
        - REVORA standard transactions use decimal Rupees (e.g. 500.00 INR).
        - Conversion: amount_rupees = round(payment.amount / 100.0, 2)
        - Both converted amount and raw_amount (paise) are preserved.
        """
        if not payment.payment_id:
            logger.warning("Adapter error: Missing payment_id in Razorpay payment.")
            raise RazorpayTransactionMappingError("Missing required field: payment_id")

        if payment.amount is None or payment.amount < 0:
            logger.warning("Adapter error: Missing or negative amount in Razorpay payment: %s", payment.payment_id)
            raise RazorpayTransactionMappingError("Missing or invalid required field: amount")

        if not payment.currency:
            logger.warning("Adapter error: Missing currency in Razorpay payment: %s", payment.payment_id)
            raise RazorpayTransactionMappingError("Missing required field: currency")

        if not payment.status:
            logger.warning("Adapter error: Missing status in Razorpay payment: %s", payment.payment_id)
            raise RazorpayTransactionMappingError("Missing required field: status")

        raw_status = payment.status.strip().lower()
        if raw_status not in RAZORPAY_STATUS_MAP:
            logger.warning(
                "Adapter error: Unsupported Razorpay status '%s' for payment %s. "
                "No semantic equivalence in REVORA; failing safely.",
                raw_status, payment.payment_id
            )
            raise RazorpayTransactionMappingError(f"Unsupported Razorpay status: {raw_status}")

        revora_status = RAZORPAY_STATUS_MAP[raw_status]

        # Case B: Explicit conversion from paise to decimal Rupees
        amount_rupees = round(payment.amount / 100.0, 2)

        # Preserve payment method as free-form string from provider if present; do not invent sentinels
        payment_method = payment.method.strip() if payment.method else None

        # Deterministic timestamp formatting if created_at is provided; never invent current time
        transaction_date = None
        if payment.created_at is not None:
            try:
                transaction_date = datetime.fromtimestamp(payment.created_at, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                logger.warning("Adapter error: Could not parse created_at timestamp %s: %s", payment.created_at, type(e).__name__)
                raise RazorpayTransactionMappingError("Invalid created_at timestamp")

        # Deterministic transaction identity
        transaction_id = f"razorpay:{payment.payment_id}"

        adapted: Dict[str, Any] = {
            "transaction_id": transaction_id,
            "payment_id": payment.payment_id,
            "provider": "razorpay",
            "source": "razorpay_test",
            "amount": amount_rupees,
            "raw_amount": payment.amount,
            "raw_amount_unit": "paise",
            "currency": payment.currency,
            "status": revora_status,
            "payment_method": payment_method,
            "order_id": payment.order_id if payment.order_id else None,
            "transaction_date": transaction_date,
            "raw_created_at": payment.created_at,
        }

        return adapted
