import type { EvaluationSummary, PaginatedTransactions, TransactionEvaluation } from '../types/evaluation';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export const api = {
  getEvaluationSummary: async (): Promise<EvaluationSummary> => {
    const res = await fetch(`${API_BASE}/evaluation/summary`);
    if (!res.ok) {
      throw new Error(`Failed to fetch summary: ${res.statusText}`);
    }
    return res.json();
  },

  getTransactions: async (params: {
    limit?: number;
    offset?: number;
    risk_level?: string;
    root_cause?: string;
    action?: string;
  } = {}): Promise<PaginatedTransactions> => {
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params.risk_level) searchParams.append('risk_level', params.risk_level);
    if (params.root_cause) searchParams.append('root_cause', params.root_cause);
    if (params.action) searchParams.append('action', params.action);

    const res = await fetch(`${API_BASE}/evaluation/transactions?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch transactions: ${res.statusText}`);
    }
    return res.json();
  },

  getTransactionDetail: async (transactionId: string): Promise<TransactionEvaluation> => {
    const res = await fetch(`${API_BASE}/evaluation/transactions/${transactionId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch transaction detail: ${res.statusText}`);
    }
    return res.json();
  },

  getRazorpayHealth: async (): Promise<import('../types/razorpay').RazorpayHealthResponse> => {
    const res = await fetch(`${API_BASE}/integrations/razorpay/health`);
    if (!res.ok) {
      throw new Error(`Failed to fetch Razorpay health: ${res.statusText}`);
    }
    return res.json();
  },

  getRazorpayPayments: async (params: { count?: number; skip?: number } = {}): Promise<import('../types/razorpay').RazorpayPaymentsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.count !== undefined) searchParams.append('count', params.count.toString());
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    const res = await fetch(`${API_BASE}/integrations/razorpay/payments?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch Razorpay payments: ${res.statusText}`);
    }
    return res.json();
  },

  getRazorpayPayment: async (paymentId: string): Promise<import('../types/razorpay').RazorpayPayment> => {
    const res = await fetch(`${API_BASE}/integrations/razorpay/payments/${paymentId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch Razorpay payment ${paymentId}: ${res.statusText}`);
    }
    return res.json();
  },

  getRazorpayRevoraTransaction: async (paymentId: string): Promise<import('../types/razorpay').RazorpayRevoraTransactionResponse> => {
    const res = await fetch(`${API_BASE}/integrations/razorpay/transactions/${paymentId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch adapted Razorpay transaction ${paymentId}: ${res.statusText}`);
    }
    return res.json();
  },

  getRazorpayIntelligence: async (paymentId: string, aiProvider?: string): Promise<import('../types/razorpay').RazorpayIntelligenceResponse> => {
    const query = aiProvider ? `?ai_provider=${encodeURIComponent(aiProvider)}` : '';
    const res = await fetch(`${API_BASE}/integrations/razorpay/intelligence/${paymentId}${query}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch Razorpay intelligence for ${paymentId}: ${res.statusText}`);
    }
    return res.json();
  },

  executeRazorpayRecovery: async (
    paymentId: string,
    options?: { requested_action?: string; ai_provider?: string }
  ): Promise<import('../types/razorpay').RazorpayRecoveryResponse> => {
    const res = await fetch(`${API_BASE}/integrations/razorpay/recovery/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {})
    });
    if (!res.ok) {
      throw new Error(`Failed to execute recovery for ${paymentId}: ${res.statusText}`);
    }
    return res.json();
  }
};

