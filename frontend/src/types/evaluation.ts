export interface EvaluationSummary {
  total_transactions: number;
  total_at_risk_transactions: number;
  total_revenue_at_risk: number;
  total_recovery_attempts: number;
  successful_recoveries: number;
  failed_recoveries: number;
  total_amount_recovered: number;
  remaining_revenue_at_risk: number;
  recovery_rate: number;
  revenue_recovery_rate: number;
  human_approval_count: number;
  stopped_count: number;
  policy_override_count: number;
  expected_recovery_from_decision_engine: number;
  actual_simulated_recovery: number;
  recovery_calibration_gap: number;
  action_performance: Record<string, {
    attempts: number;
    successes: number;
    recovered: number;
  }>;
  root_cause_performance: Record<string, {
    attempts: number;
    successes: number;
    recovered: number;
  }>;
}

export interface TransactionEvaluation {
  transaction_id: string;
  amount: number;
  revenue_at_risk: number;
  risk_level: string;
  root_cause: string;
  deterministic_action: string;
  ai_action: string;
  final_action: string;
  policy_approved: boolean;
  policy_overridden: boolean;
  attempted: boolean;
  success: boolean;
  amount_recovered: number;
  remaining_revenue_at_risk: number;
  outcome_reason: string;
  // Included if the backend provides them, optional
  ai_recommendation?: Record<string, any>;
  policy_checks?: any[];
}

export interface PaginatedTransactions {
  total_count: number;
  limit: number;
  offset: number;
  data: TransactionEvaluation[];
}
