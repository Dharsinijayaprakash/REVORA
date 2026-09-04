import React, { useState, useEffect } from 'react';
import type { TransactionEvaluation } from '../types/evaluation';
import { api } from '../services/api';
import { formatINR, formatLabel } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  RotateCcw, 
  X, 
  ListFilter 
} from 'lucide-react';

interface Scene09OperationsConsoleProps {
  onSelectTransaction: (tx: TransactionEvaluation) => void;
  atRiskCount?: number;
  initialRootCauseFilter?: string;
}

export const Scene09OperationsConsole: React.FC<Scene09OperationsConsoleProps> = ({
  onSelectTransaction,
  atRiskCount = 2026,
  initialRootCauseFilter,
}) => {
  const [transactions, setTransactions] = useState<TransactionEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [rootCauseFilter, setRootCauseFilter] = useState<string>(initialRootCauseFilter || 'all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  useEffect(() => {
    if (initialRootCauseFilter) {
      setRootCauseFilter(initialRootCauseFilter);
    }
  }, [initialRootCauseFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch from API
  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params: any = {
          limit,
          offset: (page - 1) * limit,
        };

        if (riskFilter !== 'all') params.risk_level = riskFilter;
        if (rootCauseFilter !== 'all') params.root_cause = rootCauseFilter;
        if (actionFilter !== 'all') params.final_action = actionFilter;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        const response = await api.getTransactions(params);
        if (isMounted) {
          setTransactions(response.data || []);
          setTotalCount(response.total_count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch transactions from API', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => { isMounted = false; };
  }, [page, riskFilter, rootCauseFilter, actionFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const hasActiveFilters = riskFilter !== 'all' || rootCauseFilter !== 'all' || actionFilter !== 'all' || debouncedSearch.trim() !== '';

  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setRiskFilter('all');
    setRootCauseFilter('all');
    setActionFilter('all');
    setPage(1);
  };

  return (
    <section id="scene-console" className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-grain-grid select-none">
      
      {/* Console Header */}
      <div className="max-w-6xl mx-auto w-full mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs font-mono text-indigo-300 mb-4">
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            <span>08 / OPERATIONS CONSOLE</span>
          </div>

          <div className="flex items-baseline gap-4">
            <h2 className="scene-statement-title text-white uppercase tracking-tight">
              RECOVERY QUEUE
            </h2>
            <span className="text-sm font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3.5 py-1 rounded-full">
              {atRiskCount.toLocaleString()} AT-RISK
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">
            Autonomous live stream of transactions evaluated by Groq AI and validated by Policy Guard.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-slate-300 text-xs font-mono transition-colors cursor-pointer self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="max-w-6xl mx-auto w-full mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transaction ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Root Cause Filter */}
          <select
            value={rootCauseFilter}
            onChange={(e) => { setRootCauseFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Root Causes</option>
            <option value="PAYMENT_METHOD_FAILURE">Payment Method Failure</option>
            <option value="CHECKOUT_ABANDONMENT">Checkout Abandonment</option>
            <option value="OVERDUE_RECEIVABLE">Overdue Receivable</option>
            <option value="PAYMENT_INFRASTRUCTURE_FAILURE">Infrastructure Failure</option>
            <option value="AUTHENTICATION_FAILURE">Authentication Failure</option>
            <option value="INSUFFICIENT_FUNDS">Insufficient Funds</option>
            <option value="SUBSCRIPTION_PAYMENT_FAILURE">Subscription Failure</option>
          </select>

          {/* Final Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.08] rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="SMART_RETRY">Smart Retry</option>
            <option value="HUMAN_APPROVAL">Human Approval</option>
            <option value="PAYMENT_REMINDER">Payment Reminder</option>
            <option value="RECEIVABLES_ESCALATION">Receivables Escalation</option>
            <option value="STOP">Stop Action</option>
          </select>

        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-mono text-slate-500">Active Filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                Search: {debouncedSearch}
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-400 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {riskFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800">
                Risk: {riskFilter}
                <button onClick={() => setRiskFilter('all')} className="hover:text-rose-400 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {rootCauseFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                Cause: {formatLabel(rootCauseFilter)}
                <button onClick={() => setRootCauseFilter('all')} className="hover:text-indigo-400 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {actionFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                Action: {formatLabel(actionFilter)}
                <button onClick={() => setActionFilter('all')} className="hover:text-emerald-400 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Editorial Console Table */}
      <div className="max-w-6xl mx-auto w-full rounded-3xl bg-slate-950/60 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-slate-950/90 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                <th className="py-4 px-6">Transaction / Exposure</th>
                <th className="py-4 px-4">Risk</th>
                <th className="py-4 px-4">Root Cause</th>
                <th className="py-4 px-4">AI Proposal</th>
                <th className="py-4 px-4">Final Action</th>
                <th className="py-4 px-4">Simulated Recovery</th>
                <th className="py-4 px-6 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                      <span>Ingesting recovery stream...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching transactions found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isAIOverride = tx.ai_action !== tx.deterministic_action;
                  const isHovered = hoveredRowId === tx.transaction_id;

                  return (
                    <tr
                      key={tx.transaction_id}
                      onMouseEnter={() => setHoveredRowId(tx.transaction_id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      onClick={() => onSelectTransaction(tx)}
                      className={`transition-all duration-150 cursor-pointer ${
                        isHovered 
                          ? 'bg-indigo-950/30' 
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Transaction ID & Exposure */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white tracking-tight">
                          {tx.transaction_id}
                        </div>
                        <div className="text-[11px] text-rose-400 font-bold mt-0.5">
                          {formatINR(tx.revenue_at_risk)} exposed
                        </div>
                      </td>

                      {/* Risk */}
                      <td className="py-4 px-4">
                        <StatusBadge type="risk" value={tx.risk_level} />
                      </td>

                      {/* Root Cause */}
                      <td className="py-4 px-4 text-slate-300">
                        {formatLabel(tx.root_cause)}
                      </td>

                      {/* AI Proposal */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-200">
                            {formatLabel(tx.ai_action)}
                          </span>
                          {isAIOverride && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold">
                              <Sparkles className="w-2.5 h-2.5" />
                              OVERRIDE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Final Action */}
                      <td className="py-4 px-4">
                        <StatusBadge type="action" value={tx.final_action} />
                      </td>

                      {/* Recovery */}
                      <td className="py-4 px-4">
                        {tx.success ? (
                          <span className="text-emerald-400 font-bold">
                            {formatINR(tx.amount_recovered)}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* View Trace Button */}
                      <td className="py-4 px-6 text-right">
                        <div className={`inline-flex items-center gap-1 text-[11px] font-bold transition-transform ${
                          isHovered ? 'text-indigo-400 translate-x-1' : 'text-slate-500'
                        }`}>
                          <span>→ VIEW TRACE</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500">
          <div>
            Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()} transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
