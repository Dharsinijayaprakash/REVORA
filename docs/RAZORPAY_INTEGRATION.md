# Razorpay Integration

**Provider:** Razorpay  
**Mode:** Test  
**Purpose:** External payment-system connectivity, read-only data ingestion, deterministic adaptation, intelligence pipeline evaluation, bounded Test Mode recovery execution, and end-to-end verification for REVORA  
**Current Step:** STEP 8F (Complete Razorpay Test Mode End-to-End Demo)  

> **Crucial Status Statement:**  
> **"STEP 8F establishes and verifies the complete end-to-end flow from Razorpay Test Mode through the REVORA intelligence pipeline and authoritative Policy Guard to a bounded Test Mode action with deterministic idempotency and a secret-safe audit trail."**

---

## 1. Safety & Operational Boundaries

STEP 8F proves that the existing architecture functions end-to-end under strict fintech demo guardrails.

- **ALLOWED:**
  - Retrieve Test Mode payment data from Razorpay (`RazorpayService`)
  - Adapt normalized payment data into standard REVORA transaction representation (`RazorpayTransactionAdapter`)
  - Run full REVORA intelligence pipeline (Risk Engine → Decision Engine → AI Proposal → Policy Guard)
  - Execute a single, explicitly allowlisted, bounded Test Mode action (`SMART_RETRY`) via `services.action_executor.execute_action`
  - Perform the bounded Test Mode operation: `TEST_ORDER_CREATION` (`client.order.create`) with fixed parameters
  - Prevent duplicate execution using deterministic in-memory idempotency
  - Maintain a sanitized audit trail for all execution attempts
- **STRICTLY FORBIDDEN:**
  - **Zero Live-Mode operations**: Credentials must strictly be Test Mode (`rzp_test_...`). Live keys (`rzp_live_...`) are rejected with HTTP 403.
  - **Zero Money Movement**: No funds are debited, transferred, or charged.
  - **Zero Payment Captures or Refunds**: No capture, refund, retry, or cancellation of existing payments.
  - **Zero Unrestricted Execution**: The AI cannot choose API methods, endpoints, or arbitrary payloads.
  - **Zero Execution on Non-Approved Decisions**: `HUMAN_APPROVAL`, `BLOCKED`, and `STOP` states stop execution (`executed = false`).
  - **Zero Modification to Synthetic Evaluation**: `transactions.csv`, `evaluation_results.csv`, and `evaluation_summary.json` remain untouched.

---

## 2. Testing vs Demonstration Separation

STEP 8F explicitly separates automated regression testing from real-provider CLI demonstrations:

```text
Automated tests (pytest)
→ Deterministic mocked Razorpay provider
→ Zero live network calls or credential dependencies
→ Verifies all internal engines, safety guards, and error paths

Real E2E Demo (demo_razorpay_e2e.py)
→ Actual Razorpay Test Mode credentials (RAZORPAY_KEY_ID=rzp_test_...)
→ Real Test Mode payments (or fallback demonstration harness)
→ Secret-safe terminal presentation
```

---

## 3. End-to-End Data Flow

```text
Razorpay Test Mode
        ↓
Payment Retrieval (RazorpayService.get_payment)
        ↓
Transaction Adapter (RazorpayTransactionAdapter.adapt_payment)
        ↓
Risk Engine (analyze_transaction)
        ↓
Deterministic Decision Engine (decide_recovery_action)
        ↓
AI Recovery Proposal (AIRecoveryAgent.analyze_recovery_case)
        ↓
Authoritative Policy Guard (validate_action)
        ↓
    APPROVED?
    ├── NO  ──> STOP (executed = false, recorded in audit)
    └── YES ──> Allowlist Check (SMART_RETRY)
                     ↓
                Idempotency Check (revora:8e:{payment_id}:{action})
                     ↓
                Authoritative Action Executor (execute_action)
                     ↓
                Bounded Test Action (TEST_ORDER_CREATION)
                     ↓
                Audit Trail Record (Sanitized, no secrets)
                     ↓
                Execution Result
```

---

## 4. Semantic Accuracy & Recovery Operations

- **Exact Razorpay Operation:** `client.order.create(data={amount, currency, receipt, notes})`.
- **Semantic Distinction:** Creating an order in Razorpay Test Mode creates an order resource for retry intent. It **does not recharge, debit, or alter the original failed payment**. The API, CLI, and UI explicitly report `TEST_ORDER_CREATION` and never claim `"PAYMENT_RETRIED"`.
- **Recovered Amount:** `0.0`. No revenue recovery is claimed merely because a test order was created.
- **Strict Currency Validation:** The executor strictly uses the provider-supplied currency preserved by `RazorpayTransactionAdapter`. It never silently defaults to `"INR"`. If currency is missing or invalid, execution is rejected (`executed = false`).

---

## 5. Endpoints & CLI Demonstration

### Supported Endpoints:
- `GET /api/integrations/razorpay/health` — Connection verification
- `GET /api/integrations/razorpay/payments` — Read-only payment list
- `GET /api/integrations/razorpay/payments/{id}` — Single payment details
- `GET /api/integrations/razorpay/transactions/{id}` — Adapted transaction representation
- `GET /api/integrations/razorpay/intelligence/{id}` — Full intelligence pipeline evaluation
- `POST /api/integrations/razorpay/recovery/{id}` — Bounded recovery execution with idempotency and audit

### Running the End-to-End Demonstration:
```powershell
python demo_razorpay_e2e.py [--payment-id <TEST_PAYMENT_ID>] [--ai-provider groq|mock] [--demo-fallback]
```

### Running Full Automated Regression Suite:
```powershell
python -m pytest -q
```
*(All 164 unit, integration, and E2E tests pass deterministically without network dependencies).*
