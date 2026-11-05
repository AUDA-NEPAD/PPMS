import React from 'react';
import { InitiativeStatus } from '../../types';
import {
  FileEdit,
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  FileCheck2,
  Briefcase,
  XCircle,
  PauseCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: InitiativeStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  switch (status) {
    case 'Draft':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
      Icon = FileEdit;
      break;
    case 'Submitted to Board':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Send;
      break;
    case 'Returned for Clarification':
    case 'Returned by CEO':
    case 'Deferred for Revision':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = RotateCcw;
      break;
    case 'Approved for Development':
    case 'Under Development':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = Clock;
      break;
    case 'Submitted for Appraisal':
    case 'Appraisal in Progress':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = FileCheck2;
      break;
    case 'Recommended for Approval':
    case 'Recommended with Conditions':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      Icon = CheckCircle2;
      break;
    case 'Awaiting CEO Decision':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-300 font-semibold';
      Icon = Award;
      break;
    case 'Approved':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      Icon = CheckCircle2;
      break;
    case 'Conditionally Approved':
      colorClasses = 'bg-lime-50 text-lime-800 border-lime-300';
      Icon = CheckCircle2;
      break;
    case 'Under Contracting':
    case 'Financing Finalized':
      colorClasses = 'bg-cyan-50 text-cyan-800 border-cyan-200';
      Icon = Briefcase;
      break;
    case 'Active / Implementation':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-medium';
      Icon = CheckCircle2;
      break;
    case 'On Hold':
      colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-300';
      Icon = PauseCircle;
      break;
    case 'Rejected':
    case 'Aborted':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs whitespace-nowrap ${colorClasses} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
