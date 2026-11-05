import React from 'react';
import { Outcome } from '../../types';
import {
  calculateTotalProjectBudget,
  calculateBudgetVariance,
  calculatePartnerBudgetBreakdown,
  calculateOutcomeBudgetBreakdown
} from '../../utils/budgetCalculations';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Users,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

interface BudgetRollupSummaryProps {
  outcomes: Outcome[];
  estimatedCost: number;
  currency?: string;
  onUpdateActivityCost?: (activityId: string, newCost: number) => void;
}

export const BudgetRollupSummary: React.FC<BudgetRollupSummaryProps> = ({
  outcomes = [],
  estimatedCost = 0,
  currency = 'USD'
}) => {
  const totalCalculated = calculateTotalProjectBudget(outcomes);
  const variance = calculateBudgetVariance(estimatedCost, totalCalculated);
  const partnerBreakdown = calculatePartnerBudgetBreakdown(outcomes);
  const outcomeBreakdown = calculateOutcomeBudgetBreakdown(outcomes);

  const totalActivities = outcomes.reduce(
    (sum, o) =>
      sum + (o.outputs?.reduce((s, outp) => s + (outp.activities?.length || 0), 0) || 0),
    0
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs animate-in fade-in">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Automated Activity-Based Budget Roll-Up
              </h4>
              <p className="text-[11px] text-slate-500">
                Sum of {totalActivities} granular activities rolling up through outputs and outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Currency Tag */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Reporting Currency:
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-mono font-bold text-xs border border-slate-200">
            {currency}
          </span>
        </div>
      </div>

      {/* 3 Main KPI Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Initial Concept Estimate */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Concept Initial Estimate (Stage 0)
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-800">
            {formatCurrency(estimatedCost, currency)}
          </div>
          <p className="text-[10px] text-slate-400">
            Approved concept allocation baseline cap
          </p>
        </div>

        {/* 2. Detailed Calculated Budget */}
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
            <span>Granular Calculated Budget</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-950">
            {formatCurrency(totalCalculated, currency)}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium">
            Computed live across {outcomes.length} outcomes & {totalActivities} activities
          </p>
        </div>

        {/* 3. Variance Analysis */}
        <div
          className={`p-4 rounded-xl border space-y-1 ${
            variance.status === 'significant_over_budget'
              ? 'bg-rose-50/60 border-rose-300 text-rose-900'
              : variance.status === 'minor_over_budget'
              ? 'bg-amber-50/60 border-amber-300 text-amber-900'
              : 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Variance vs Concept Baseline</span>
            {variance.status === 'significant_over_budget' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            ) : variance.status === 'minor_over_budget' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="text-xl font-extrabold font-mono">
            {variance.variance >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(variance.variance), currency)}
            <span className="text-xs font-bold ml-1.5 opacity-90">
              ({variance.variancePercentage >= 0 ? '+' : ''}
              {variance.variancePercentage.toFixed(1)}%)
            </span>
          </div>
          <p className="text-[10px] leading-tight">
            {variance.status === 'exact'
              ? 'Matches concept estimate perfectly.'
              : variance.status === 'under_budget'
              ? 'Within approved envelope (budget savings).'
              : variance.status === 'minor_over_budget'
              ? 'Minor variance within 10% contingency.'
              : 'Requires formal Director financial justification.'}
          </p>
        </div>
      </div>

      {/* Warning message if over budget */}
      {variance.warningMessage && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            variance.status === 'significant_over_budget'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{variance.warningMessage}</p>
        </div>
      )}

      {/* Visual Budget Distribution Splits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Outcome Allocation Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-600" />
              <span>Budget by Strategic Outcome</span>
            </h5>
            <span className="text-[10px] text-slate-400">
              {outcomes.length} Strategic Outcomes
            </span>
          </div>

          {outcomeBreakdown.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-xs">
              No outcome cost allocations calculated.
            </p>
          ) : (
            <div className="space-y-2">
              {outcomeBreakdown.map((ob, idx) => (
                <div key={ob.outcomeNumber} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={ob.narrative}>
                      {ob.outcomeNumber}: {ob.narrative}
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {formatCurrency(ob.amount, currency)} ({ob.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${ob.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Partner Allocation Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Budget by Lead Implementing Partner</span>
            </h5>
            <span className="text-[10px] text-slate-400">
              {partnerBreakdown.length} Partners Assigned
            </span>
          </div>

          {partnerBreakdown.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-xs">
              No partners assigned to activities yet.
            </p>
          ) : (
            <div className="space-y-2">
              {partnerBreakdown.slice(0, 5).map((pb) => (
                <div key={pb.partner} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={pb.partner}>
                      {pb.partner}
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {formatCurrency(pb.amount, currency)} ({pb.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      style={{ width: `${pb.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
