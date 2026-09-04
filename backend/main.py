import os
import json
import csv
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from services.razorpay_service import (
    RazorpayService,
    RazorpayNotConfiguredError,
    RazorpayAuthError,
    RazorpayNotFoundError,
    RazorpayConnectionError
)
from services.razorpay_transaction_adapter import (
    RazorpayTransactionAdapter,
    RazorpayTransactionMappingError
)
from services.razorpay_intelligence_service import RazorpayIntelligenceService
from services.razorpay_recovery_service import (
    RazorpayRecoveryService,
    RazorpayLiveModeRejectedError
)

class RazorpayRecoveryRequest(BaseModel):
    requested_action: Optional[str] = None
    ai_provider: Optional[str] = None

# Load environment variables following project convention
load_dotenv()

app = FastAPI(title="REVORA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SUMMARY_PATH = os.path.join(BASE_DIR, '..', 'data', 'sample', 'evaluation_summary.json')
RESULTS_PATH = os.path.join(BASE_DIR, '..', 'data', 'sample', 'evaluation_results.csv')

def parse_transaction_row(row: dict) -> dict:
    parsed = {}
    for key, value in row.items():
        # Ensure currency values are numeric
        if key in ["amount", "revenue_at_risk", "amount_recovered", "remaining_revenue_at_risk"]:
            try:
                parsed[key] = float(value)
            except ValueError:
                parsed[key] = 0.0
        # Parse booleans
        elif key in ["policy_approved", "policy_overridden", "attempted", "success"]:
            parsed[key] = str(value).lower() == "true"
        # Parse JSON fields if they exist
        else:
            try:
                if (value.startswith('[') and value.endswith(']')) or (value.startswith('{') and value.endswith('}')):
                    parsed[key] = json.loads(value.replace("'", '"'))
                else:
                    parsed[key] = value
            except Exception:
                parsed[key] = value
    return parsed

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "REVORA backend is running"}

@app.get("/api/integrations/razorpay/health")
def razorpay_health():
    service = RazorpayService()
    return service.verify_connection()

@app.get("/api/integrations/razorpay/payments")
def list_razorpay_payments(
    count: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0)
):
    service = RazorpayService()
    try:
        return service.list_payments(count=count, skip=skip)
    except RazorpayNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay credentials not configured"
        )
    except RazorpayAuthError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay authentication failed"
        )
    except RazorpayConnectionError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )

@app.get("/api/integrations/razorpay/payments/{payment_id}")
def get_razorpay_payment(payment_id: str):
    service = RazorpayService()
    try:
        payment = service.get_payment(payment_id)
        return payment.model_dump()
    except RazorpayNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Razorpay payment not found"
        )
    except RazorpayNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay credentials not configured"
        )
    except RazorpayAuthError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay authentication failed"
        )
    except RazorpayConnectionError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )

@app.get("/api/integrations/razorpay/transactions/{payment_id}")
def get_adapted_razorpay_transaction(payment_id: str):
    service = RazorpayService()
    adapter = RazorpayTransactionAdapter()
    try:
        payment = service.get_payment(payment_id)
        adapted = adapter.adapt_payment(payment)
        return {
            "source": "razorpay_test",
            "provider": "razorpay",
            "transaction": adapted
        }
    except RazorpayNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Razorpay payment not found"
        )
    except RazorpayNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay credentials not configured"
        )
    except RazorpayAuthError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay authentication failed"
        )
    except RazorpayConnectionError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )
    except RazorpayTransactionMappingError:
        # Crucial: do not expose internal exception text to client
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to map Razorpay payment to REVORA transaction"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )

@app.get("/api/integrations/razorpay/intelligence/{payment_id}")
def get_razorpay_intelligence(
    payment_id: str,
    ai_provider: Optional[str] = Query(None)
):
    service = RazorpayIntelligenceService()
    try:
        return service.evaluate_payment(payment_id, ai_provider=ai_provider)
    except RazorpayNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Razorpay payment not found"
        )
    except RazorpayNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay credentials not configured"
        )
    except RazorpayAuthError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay authentication failed"
        )
    except RazorpayConnectionError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )
    except RazorpayTransactionMappingError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to map Razorpay payment to REVORA transaction"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to process Razorpay intelligence evaluation"
        )

@app.post("/api/integrations/razorpay/recovery/{payment_id}")
def execute_razorpay_recovery(
    payment_id: str,
    request: Optional[RazorpayRecoveryRequest] = None
):
    service = RazorpayRecoveryService()
    req_action = request.requested_action if request else None
    ai_prov = request.ai_provider if request else None
    try:
        return service.recover_payment(payment_id, requested_action=req_action, ai_provider=ai_prov)
    except RazorpayNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay credentials not configured"
        )
    except RazorpayLiveModeRejectedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Live mode credentials are not permitted. Execution restricted to Test Mode."
        )
    except RazorpayNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Razorpay payment not found"
        )
    except RazorpayAuthError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay authentication failed"
        )
    except RazorpayConnectionError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve Razorpay payment data"
        )
    except RazorpayTransactionMappingError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to map Razorpay payment to REVORA transaction"
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to process Razorpay recovery execution"
        )

@app.get("/api/evaluation/summary")
def get_evaluation_summary():
    if not os.path.exists(SUMMARY_PATH):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Evaluation summary data is not available.")
    try:
        with open(SUMMARY_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read evaluation summary.")

@app.get("/api/evaluation/transactions")
def get_evaluation_transactions(
    risk_level: Optional[str] = None,
    root_cause: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    if not os.path.exists(RESULTS_PATH):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Evaluation results data is not available.")
    
    try:
        transactions = []
        with open(RESULTS_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Apply filters
                if risk_level and row.get("risk_level") != risk_level:
                    continue
                if root_cause and row.get("root_cause") != root_cause:
                    continue
                if action and row.get("final_action") != action:
                    continue
                transactions.append(parse_transaction_row(row))
        
        total_count = len(transactions)
        
        # Paginate
        paginated = transactions[offset:offset + limit]
        
        return {
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "data": paginated
        }
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read evaluation results.")

@app.get("/api/evaluation/transactions/{transaction_id}")
def get_transaction_detail(transaction_id: str):
    if not os.path.exists(RESULTS_PATH):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Evaluation results data is not available.")
        
    try:
        with open(RESULTS_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("transaction_id") == transaction_id:
                    return parse_transaction_row(row)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read evaluation results.")
        
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
