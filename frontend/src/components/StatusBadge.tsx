import React from 'react';

type BadgeType = 'risk' | 'action' | 'status' | 'outline';

interface StatusBadgeProps {
  type: BadgeType;
  value: string;
}

const formatLabel = (value: string): string => {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  const baseClass = "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide whitespace-nowrap ";
  let colorClass = "";

  if (type === 'risk') {
    switch (value.toUpperCase()) {
      case 'HIGH':   colorClass = "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"; break;
      case 'MEDIUM': colorClass = "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"; break;
      case 'LOW':    colorClass = "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"; break;
      default:       colorClass = "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
    }
  } else if (type === 'action') {
    switch (value.toUpperCase()) {
      case 'HUMAN_APPROVAL':        colorClass = "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200"; break;
      case 'STOP':                  colorClass = "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"; break;
      case 'SMART_RETRY':           colorClass = "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"; break;
      case 'PAYMENT_REMINDER':      colorClass = "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"; break;
      case 'RECEIVABLES_ESCALATION': colorClass = "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200"; break;
      case 'NONE':                  colorClass = "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200"; break;
      default:                      colorClass = "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    }
  } else if (type === 'status') {
    switch (value.toUpperCase()) {
      case 'SUCCESS':
      case 'TRUE':
        colorClass = "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"; break;
      case 'FAILED':
      case 'FALSE':
        colorClass = "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"; break;
      case 'ATTEMPTED':
        colorClass = "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"; break;
      default: colorClass = "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
    }
  } else {
    colorClass = "bg-white text-slate-600 ring-1 ring-inset ring-slate-200";
  }

  return (
    <span className={`${baseClass} ${colorClass}`}>
      {formatLabel(value)}
    </span>
  );
};
