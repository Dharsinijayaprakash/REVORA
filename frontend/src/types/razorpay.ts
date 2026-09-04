export interface RazorpayPayment {
  provider: string;
  mode: string;
  payment_id: string;
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  method?: string | null;
  order_id?: string | null;
  created_at?: number | null;
}

export interface RazorpayPaymentsResponse {
  provider: string;
  mode: string;
  count: number;
  payments: RazorpayPayment[];
}

export interface RazorpayHealthResponse {
  provider: string;
  mode: string;
  configured: boolean;
  connected: boolean;
  status: string;
}

export interface RevoraAdaptedTransaction {
  transaction_id: string;
  payment_id: string;
  provider: string;
  source: string;
  amount: number;
  raw_amount: number;
  raw_amount_unit: string;
  currency: string;
  status: string;
  payment_method?: string | null;
  order_id?: string | null;
  transaction_date?: string | null;
  raw_created_at?: number | null;
}

export interface RazorpayRevoraTransactionResponse {
  source: string;
  provider: string;
  transaction: RevoraAdaptedTransaction;
}

export interface RazorpayIntelligenceResponse {
  provider: string;
  mode: string;
  payment: RazorpayPayment;
  transaction: RevoraAdaptedTransaction;
  risk: {
    transaction_id: string;
    revenue_at_risk: number;
    risk_score: number;
    risk_level: string;
    root_cause: string;
    risk_factors: string[];
    recommended_recovery_window: string;
  };
  deterministic_decision: {
    transaction_id: string;
    action: string;
    reason: string;
    expected_recovery: number;
    recovery_probability: number;
    intervention_cost: number;
    requires_human_approval: boolean;
    policy_checks: string[];
    stopping_reason?: string | null;
    confidence: number;
  };
  ai_proposal: {
    diagnosis: string;
    recommended_action: string;
    reasoning: string;
    customer_message: string;
    confidence: number;
    alternative_action: string;
    expected_outcome: string;
    requires_policy_validation: boolean;
  };
  policy_decision: {
    approved: boolean;
    final_action: string;
    reasons: string[];
    overrides: string[];
    requires_human_approval: boolean;
  };
}

export interface RazorpayRecoveryResponse {
  provider: string;
  mode: string;
  payment_id: string;
  transaction_id: string;
  status: string;
  executed: boolean;
  proposed_action?: string;
  approved_action?: string;
  executed_operation: string;
  operation_description?: string;
  order_id?: string | null;
  recovered_amount?: number;
  risk?: any;
  deterministic_decision?: any;
  ai_proposal?: any;
  policy_decision: any;
  idempotency_key?: string | null;
  idempotent_replay?: boolean;
  timestamp: string;
  test_mode: boolean;
  detail?: string;
}

