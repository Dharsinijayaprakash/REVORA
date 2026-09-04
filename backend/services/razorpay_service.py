import os
import logging
from typing import Dict, Any, Optional, List
import requests
import razorpay
from razorpay.errors import BadRequestError, ServerError, GatewayError
from pydantic import BaseModel
from dotenv import load_dotenv

logger = logging.getLogger("REVORA.RazorpayService")


class RazorpayNotConfiguredError(Exception):
    """Raised when Razorpay credentials are not configured."""
    pass


class RazorpayAuthError(Exception):
    """Raised when Razorpay authentication fails against Test Mode."""
    pass


class RazorpayNotFoundError(Exception):
    """Raised when a specific payment entity does not exist in Razorpay."""
    pass


class RazorpayConnectionError(Exception):
    """Raised when communication with Razorpay API fails or times out."""
    pass


class RazorpayPayment(BaseModel):
    """
    Controlled internal representation of Razorpay Test Mode payment data.
    Strictly preserves provider data without inventing fields, risk scores, or defaults.
    """
    provider: str = "razorpay"
    mode: str = "test"
    payment_id: str
    status: Optional[str] = None
    amount: Optional[int] = None  # Preserves raw provider amount in smallest currency unit (e.g. paise)
    currency: Optional[str] = None  # Populated directly from Razorpay, never hardcoded default
    method: Optional[str] = None
    order_id: Optional[str] = None
    created_at: Optional[int] = None


class RazorpayService:
    """
    Dedicated service for Razorpay Test Mode API communication.
    Strictly isolated from core risk, policy, and recovery engines.
    Provides READ-ONLY access in Step 8B.
    """

    def __init__(self, key_id: Optional[str] = None, key_secret: Optional[str] = None):
        # Follow existing project convention: read from environment variables
        load_dotenv()
        self.key_id = (key_id if key_id is not None else os.environ.get("RAZORPAY_KEY_ID", "")).strip()
        self.key_secret = (key_secret if key_secret is not None else os.environ.get("RAZORPAY_KEY_SECRET", "")).strip()

    def is_configured(self) -> bool:
        """
        Returns True only if both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are non-empty.
        NOTE: configured does NOT mean connected.
        """
        return bool(self.key_id and self.key_secret)

    def get_client(self) -> Optional[razorpay.Client]:
        """
        Initializes and returns the official Razorpay client with basic auth.
        """
        if not self.is_configured():
            return None
        return razorpay.Client(auth=(self.key_id, self.key_secret))

    def verify_connection(self) -> Dict[str, Any]:
        """
        Verifies actual connectivity and authentication to Razorpay Test Mode.
        CRITICAL RULE:
        'connected: True' is returned ONLY after a valid authenticated request succeeds.
        Never returns or logs secret keys or raw authentication headers.
        """
        if not self.is_configured():
            return {
                "provider": "razorpay",
                "mode": "test",
                "configured": False,
                "connected": False,
                "status": "not_configured"
            }

        try:
            client = self.get_client()
            # Perform an authenticated read request against Razorpay Test Mode
            # Querying orders with count=1 verifies credentials without mutating any state
            client.order.all({"count": 1})

            logger.info("Razorpay Test Mode API connection verified successfully.")
            return {
                "provider": "razorpay",
                "mode": "test",
                "configured": True,
                "connected": True,
                "status": "operational"
            }
        except BadRequestError as e:
            # Razorpay raises BadRequestError when authentication fails (HTTP 401)
            logger.warning("Razorpay Test Mode authentication failed: %s", type(e).__name__)
            return {
                "provider": "razorpay",
                "mode": "test",
                "configured": True,
                "connected": False,
                "status": "authentication_failed"
            }
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            logger.warning("Razorpay Test Mode connection timeout or network failure: %s", type(e).__name__)
            return {
                "provider": "razorpay",
                "mode": "test",
                "configured": True,
                "connected": False,
                "status": "connection_failed"
            }
        except (ServerError, GatewayError) as e:
            logger.error("Razorpay server or gateway error: %s", type(e).__name__)
            return {
                "provider": "razorpay",
                "mode": "test",
                "configured": True,
                "connected": False,
                "status": "connection_failed"
            }
        except Exception as e:
            logger.error("Unexpected error during Razorpay connection check: %s", type(e).__name__)
            return {
                "provider": "razorpay",
                "mode": "test",
                "configured": True,
                "connected": False,
                "status": "connection_failed"
            }

    def normalize_payment(self, raw: dict) -> RazorpayPayment:
        """
        Normalizes raw Razorpay payment data into a safe internal representation.
        Preserves original values; does not convert currency units or fabricate missing fields.
        """
        return RazorpayPayment(
            provider="razorpay",
            mode="test",
            payment_id=str(raw.get("id") or raw.get("payment_id") or ""),
            status=raw.get("status"),
            amount=raw.get("amount"),  # Raw provider amount (e.g. paise) preserved as-is
            currency=raw.get("currency"),  # Populated from actual response, never defaulted
            method=raw.get("method"),
            order_id=raw.get("order_id"),
            created_at=raw.get("created_at"),
        )

    def get_payment(self, payment_id: str) -> RazorpayPayment:
        """
        Fetches a single Razorpay payment by payment_id (READ-ONLY).
        Translates provider responses into clean domain exceptions.
        """
        if not self.is_configured():
            raise RazorpayNotConfiguredError("Razorpay credentials not configured")

        try:
            client = self.get_client()
            raw_payment = client.payment.fetch(payment_id)
            return self.normalize_payment(raw_payment)
        except BadRequestError as e:
            err_msg = str(e).lower()
            if "auth" in err_msg or "authentication" in err_msg:
                logger.warning("Razorpay Test Mode authentication failed during get_payment: %s", type(e).__name__)
                raise RazorpayAuthError("Razorpay authentication failed")
            if "does not exist" in err_msg or "not found" in err_msg or "the id provided" in err_msg:
                logger.warning("Razorpay payment not found: %s", type(e).__name__)
                raise RazorpayNotFoundError("Razorpay payment not found")
            logger.warning("Razorpay bad request error: %s", type(e).__name__)
            raise RazorpayConnectionError("Unable to retrieve Razorpay payment data")
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.RequestException, ServerError, GatewayError) as e:
            logger.warning("Razorpay network or server error during get_payment: %s", type(e).__name__)
            raise RazorpayConnectionError("Unable to retrieve Razorpay payment data")
        except (RazorpayNotConfiguredError, RazorpayAuthError, RazorpayNotFoundError, RazorpayConnectionError):
            raise
        except Exception as e:
            logger.error("Unexpected error during Razorpay get_payment: %s", type(e).__name__)
            raise RazorpayConnectionError("Unable to retrieve Razorpay payment data")

    def list_payments(self, count: int = 10, skip: int = 0) -> Dict[str, Any]:
        """
        Fetches a paginated list of Razorpay payments (READ-ONLY).
        Returns valid empty list if no payments exist. Does NOT generate fake data.
        """
        if not self.is_configured():
            raise RazorpayNotConfiguredError("Razorpay credentials not configured")

        try:
            client = self.get_client()
            response = client.payment.all({"count": count, "skip": skip})
            items = response.get("items", []) if isinstance(response, dict) else (response if isinstance(response, list) else [])
            normalized = [self.normalize_payment(item) for item in items]
            return {
                "provider": "razorpay",
                "mode": "test",
                "count": len(normalized),
                "payments": [p.model_dump() for p in normalized]
            }
        except BadRequestError as e:
            err_msg = str(e).lower()
            if "auth" in err_msg or "authentication" in err_msg:
                logger.warning("Razorpay Test Mode authentication failed during list_payments: %s", type(e).__name__)
                raise RazorpayAuthError("Razorpay authentication failed")
            logger.warning("Razorpay bad request error during list_payments: %s", type(e).__name__)
            raise RazorpayConnectionError("Unable to retrieve Razorpay payment data")
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.RequestException, ServerError, GatewayError) as e:
            logger.warning("Razorpay network or server error during list_payments: %s", type(e).__name__)
            raise RazorpayConnectionError("Unable to retrieve Razorpay payment data")
        except (RazorpayNotConfiguredError, RazorpayAuthError, RazorpayConnectionError):
            raise
        except Exception as e:
            logger.error("Unexpected error during Razorpay list_payments: %s", type(e).__name__)
            raise RazorpayConnectionError("Unable to retrieve Razorpay payment data")
