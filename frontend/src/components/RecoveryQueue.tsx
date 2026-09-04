import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import type { PaginatedTransactions, TransactionEvaluation } from '../types/evaluation';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  TableProperties, 
  RotateCcw, 
  AlertCircle,
  X,
  ArrowUpRight
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatLabel } from '../utils/formatters';

interface RecoveryQueueProps {
  onSelectTransaction: (transaction: TransactionEvaluation) => void;
  atRiskCount?: number;
}

export const RecoveryQueue: React.FC<RecoveryQueueProps> = ({ 
  onSelectTransaction,
  atRiskCount = 2026,
}) => {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const limit = 15;

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [rootCauseFilter, setRootCauseFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getTransactions({
          limit,
          offset: page * limit,
          risk_level: riskFilter || undefined,
          root_cause: rootCauseFilter || undefined,
          action: actionFilter || undefined,
        });
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load recovery queue');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [page, limit, riskFilter, rootCauseFilter, actionFilter]);

  const hasActiveFilters = Boolean(riskFilter || rootCauseFilter || actionFilter || searchQuery);

  const clearAllFilters = () => {
    setSearchQuery('');
    setRiskFilter('');
    setRootCauseFilter('');
    setActionFilter('');
    setPage(0);
  };

  // Client-side search across Transaction ID & Root Cause
  const filteredRows = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    const query = searchQuery.toLowerCase().trim();
    return data.data.filter((tx) => 
      tx.transaction_id.toLowerCase().includes(query) ||
      tx.root_cause.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const totalPages = data ? Math.ceil(data.total_count / limit) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Operations Console Header */}
      <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-indigo-600" />
              Recovery Queue
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              {atRiskCount.toLocaleString()} AT-RISK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live view of synthetic recovery opportunities. Select any row to inspect deep AI diagnosis and policy bounds.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/60 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transaction, customer or root cause..." 
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-mono"
          />
        </div>
        
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="hidden sm:inline font-medium">Filters:</span>
          </div>

          {/* Risk Filter */}
          <select 
            value={riskFilter} 
            onChange={(e) => { setRiskFilter(e.target.value); setPage(0); }}
            className={`bg-white border text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-colors ${
              riskFilter ? 'border-indigo-400 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 text-slate-700'
            }`}
          >
            <option value="">All Risks</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Root Cause Filter */}
          <select 
            value={rootCauseFilter} 
            onChange={(e) => { setRootCauseFilter(e.target.value); setPage(0); }}
            className={`bg-white border text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-colors ${
              rootCauseFilter ? 'border-indigo-400 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 text-slate-700'
            }`}
          >
            <option value="">All Root Causes</option>
            <option value="PAYMENT_METHOD_FAILURE">Payment Method Failure</option>
            <option value="CHECKOUT_ABANDONMENT">Checkout Abandonment</option>
            <option value="OVERDUE_RECEIVABLE">Overdue Receivable</option>
            <option value="TEMPORARY_PAYMENT_FAILURE">Temporary Payment Failure</option>
            <option value="INSUFFICIENT_FUNDS">Insufficient Funds</option>
            <option value="AUTHENTICATION_FAILURE">Authentication Failure</option>
            <option value="SUBSCRIPTION_PAYMENT_FAILURE">Subscription Failure</option>
          </select>
          
          {/* Action Filter */}
          <select 
            value={actionFilter} 
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className={`bg-white border text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-colors ${
              actionFilter ? 'border-indigo-400 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 text-slate-700'
            }`}
          >
            <option value="">All Actions</option>
            <option value="SMART_RETRY">Smart Retry</option>
            <option value="HUMAN_APPROVAL">Human Approval</option>
            <option value="RECEIVABLES_ESCALATION">Receivables Escalation</option>
            <option value="PAYMENT_REMINDER">Payment Reminder</option>
            <option value="STOP">Stop</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="px-5 sm:px-6 py-2 bg-indigo-50/30 border-b border-indigo-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active:</span>
          
          {riskFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800 font-semibold">
              Risk: {riskFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setRiskFilter('')} />
            </span>
          )}

          {rootCauseFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800 font-semibold">
              Root Cause: {formatLabel(rootCauseFilter)}
              <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setRootCauseFilter('')} />
            </span>
          )}

          {actionFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800 font-semibold">
              Action: {formatLabel(actionFilter)}
              <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setActionFilter('')} />
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800 font-semibold font-mono">
              Search: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSearchQuery('')} />
            </span>
          )}
        </div>
      )}

      {/* Operations Table */}
      <div className="overflow-x-auto min-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Retrieving real-time transaction stream...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3 text-center px-4">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-slate-900">Failed to load recovery queue</p>
            <p className="text-xs text-slate-500 max-w-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3 text-center px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-800">No recovery opportunities found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-1 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Root Cause
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  AI Proposal
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Final Action
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Recovery
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.map((tx) => {
                const isAIOverride = tx.ai_action !== tx.deterministic_action;

                return (
                  <tr 
                    key={tx.transaction_id} 
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-all duration-150 group"
                  >
                    {/* Transaction ID + Amount */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                          {tx.transaction_id}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-indigo-600 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        ₹{tx.revenue_at_risk.toLocaleString('en-IN')} exposed
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-3.5">
                      <StatusBadge type="risk" value={tx.risk_level} />
                    </td>

                    {/* Root Cause */}
                    <td className="px-6 py-3.5 font-medium text-slate-700">
                      {formatLabel(tx.root_cause)}
                    </td>

                    {/* AI Proposal + AI Override badge */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">
                          {formatLabel(tx.ai_action)}
                        </span>
                        {isAIOverride && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                            AI OVERRIDE
                          </span>
                        )}
                      </div>
                      {isAIOverride && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Baseline: {formatLabel(tx.deterministic_action)}
                        </span>
                      )}
                    </td>

                    {/* Final Action */}
                    <td className="px-6 py-3.5">
                      <StatusBadge type="action" value={tx.final_action} />
                    </td>

                    {/* Recovered Amount */}
                    <td className="px-6 py-3.5 text-right font-mono font-bold">
                      {tx.amount_recovered > 0 ? (
                        <span className="text-emerald-600">
                          ₹{tx.amount_recovered.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge 
                        type="status" 
                        value={tx.success ? 'SUCCESS' : (tx.attempted ? 'FAILED' : 'SKIPPED')} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && data && data.data.length > 0 && (
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{(page * limit) + 1}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min((page + 1) * limit, data.total_count)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{data.total_count.toLocaleString()}</span> total transactions
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-700 px-2 py-1 bg-white border border-slate-200 rounded-md">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
