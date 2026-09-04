import React from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { CreditCard, ShoppingCart, Clock, FileText, AlertCircle } from 'lucide-react';

interface Scene02LeakageProps {
  totalRevenueAtRisk: number;
  totalAtRiskCount: number;
}

export const Scene02Leakage: React.FC<Scene02LeakageProps> = ({ 
  totalRevenueAtRisk, 
  totalAtRiskCount 
}) => {
  // Animated count-up from 0 to actual value
  const atRiskCr = useCountUp(totalRevenueAtRisk / 10000000, 1600);

  const signals = [
    {
      id: 'sig-1',
      title: 'PAYMENT FAILED',
      code: 'ERR_AUTH_EXPIRED / ISSUER_DIP',
      icon: CreditCard,
      coord: 'top-0 left-0 sm:left-4',
    },
    {
      id: 'sig-2',
      title: 'CHECKOUT ABANDONED',
      code: 'HIGH_INTENT_SESSION_DROP',
      icon: ShoppingCart,
      coord: 'top-0 right-0 sm:right-4',
    },
    {
      id: 'sig-3',
      title: 'SUBSCRIPTION FAILED',
      code: 'MANDATE_REVOCATION_TIMEOUT',
      icon: Clock,
      coord: 'bottom-0 left-0 sm:left-4',
    },
    {
      id: 'sig-4',
      title: 'INVOICE OVERDUE',
      code: 'NET30_RECEIVABLES_EXPIRED',
      icon: FileText,
      coord: 'bottom-0 right-0 sm:right-4',
    },
  ];

  return (
    <section id="scene-leakage" className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-dots select-none">
      
      {/* Chapter Eyebrow */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/30 border border-rose-800/40 text-xs font-mono text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>01 / THE PROBLEM</span>
        </div>
      </div>

      {/* Main Typography Statement */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <h2 className="scene-statement-title text-white uppercase tracking-tight">
          <span className="block text-slate-400">REVENUE</span>
          <span className="block text-slate-100">DOESN'T DISAPPEAR.</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-300 to-amber-300">
            IT LEAKS.
          </span>
        </h2>

        {/* Spatial Floating Telemetry Signals (Not generic cards) */}
        <div className="relative my-16 py-12">
          {/* Subtle grid anchor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {signals.map((sig) => {
              const Icon = sig.icon;
              return (
                <div 
                  key={sig.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                      SIGNAL
                    </span>
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-white">
                    {sig.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {sig.code}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monumental Number Reveal */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 block mb-2">
              IDENTIFIED CAPITAL AT RISK
            </span>
            <div className="stat-monumental text-white">
              ₹{atRiskCr.toFixed(2)}<span className="text-2xl sm:text-4xl text-slate-500 font-sans ml-2">Cr</span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-base font-mono font-bold text-slate-300 block">
              {totalAtRiskCount.toLocaleString()} TRANSACTIONS
            </span>
            <span className="text-xs font-mono text-slate-500 mt-1 block">
              Continuous gateway ingestion stream
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
