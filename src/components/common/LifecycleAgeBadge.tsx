import React, { useState } from 'react';
import { Initiative } from '../../types';
import {
  calculateInitiativeLifecycleAge,
  getRAGConfig,
  GATE_SLAS
} from '../../utils/lifecycleAgeCalculations';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  Info,
  Calendar,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface LifecycleAgeBadgeProps {
  initiative: Initiative;
  compact?: boolean;
}

export const LifecycleAgeBadge: React.FC<LifecycleAgeBadgeProps> = ({
  initiative,
  compact = false
}) => {
  const [showModal, setShowModal] = useState(false);

  const ageData = calculateInitiativeLifecycleAge(initiative);
  const ragConfig = getRAGConfig(ageData.currentGateRagStatus);
  const overallRagConfig = getRAGConfig(ageData.overallRagStatus);
  const currentGateSla = GATE_SLAS[ageData.currentStageCode] || GATE_SLAS[0];

  // Modal Dialog showing full Lifecycle Gate Age Matrix
  const renderBreakdownModal = () => {
    if (!showModal) return null;

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(false);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between gap-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {initiative.code}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Stage {initiative.stageCode}: {currentGateSla.shortName}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                {initiative.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted / Originated: {formatDate(initiative.dateSubmitted || '2026-09-01')}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
            {/* 4 Summary Highlight Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Card 1: Total Proposal Process Age */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Total Process Age</span>
                </div>
                <div className="font-mono font-extrabold text-slate-900 text-base sm:text-lg mt-1">
                  {ageData.totalDaysElapsed} Days
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Overall turnaround
                </div>
              </div>

              {/* Card 2: Current Gate Age vs SLA */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Gate {ageData.currentStageCode} Days
                </div>
                <div className="font-mono font-extrabold text-slate-900 text-base sm:text-lg mt-1">
                  {ageData.currentGateDaysElapsed} / {ageData.currentGateSlaDays}d
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  SLA Target: {ageData.currentGateSlaDays} days
                </div>
              </div>

              {/* Card 3: Gate RAG Indicator */}
              <div className={`p-3 rounded-xl border ${ragConfig.bgLightClass} ${ragConfig.borderClass}`}>
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  Gate SLA Timeliness
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${ragConfig.dotClass}`} />
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {ragConfig.label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {ageData.currentGateVarianceDays > 0
                    ? `+${ageData.currentGateVarianceDays}d overdue`
                    : `${Math.abs(ageData.currentGateVarianceDays)}d buffer`}
                </div>
              </div>

              {/* Card 4: Cumulative SLA Variance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Cumulative Target
                </div>
                <div className="font-mono font-extrabold text-slate-900 text-base sm:text-lg mt-1">
                  {ageData.cumulativeSlaDays} Days
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {ageData.totalVarianceDays <= 0 ? (
                    <span className="text-emerald-700 font-semibold">
                      {Math.abs(ageData.totalVarianceDays)}d ahead of max SLA
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold">
                      +{ageData.totalVarianceDays}d over cumulative SLA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Life Cycle Process Age: Days in Each Gate Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Lifecycle Process Age: Days Elapsed in Each Governance Gate</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  7 Statutory Stages
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {ageData.gateBreakdown.map((gate) => {
                  const gRag = getRAGConfig(gate.ragStatus);
                  const isCurrent = gate.status === 'active';
                  const isCompleted = gate.status === 'completed';
                  const isUpcoming = gate.status === 'upcoming';
                  const percentSla = gate.slaDays > 0 ? Math.min(100, (gate.daysSpent / gate.slaDays) * 100) : 0;

                  return (
                    <div
                      key={gate.stageCode}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/20'
                          : isCompleted
                          ? 'bg-slate-50/80 border-slate-200'
                          : 'bg-white border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Gate Name & Status */}
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : gate.stageCode}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {gate.stageName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Estimated Gate SLA: <strong>{gate.slaDays} calendar days</strong>
                            </div>
                          </div>
                        </div>

                        {/* Days Spent & RAG Badge */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm block">
                              {isUpcoming ? '--' : `${gate.daysSpent} days`}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {isUpcoming
                                ? 'Upcoming Gate'
                                : isCurrent
                                ? 'Active Gate'
                                : 'Completed Gate'}
                            </span>
                          </div>

                          {!isUpcoming && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : gRag.badgeClass
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : gRag.dotClass}`} />
                              <span>{isCompleted ? 'Done' : gRag.label}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual SLA Progress Bar */}
                      {!isUpcoming && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Elapsed: {gate.daysSpent}d / {gate.slaDays}d SLA target</span>
                            <span>{Math.round((gate.daysSpent / gate.slaDays) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : gate.ragStatus === 'delayed'
                                  ? 'bg-rose-500'
                                  : gate.ragStatus === 'at_risk'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentSla}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RAG Benchmark SLA Legend */}
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                AUDA-NEPAD Statutory Turnaround & RAG Status Definitions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span><strong>Ahead / On Time:</strong> &le; 79% of gate SLA consumed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span><strong>At Risk:</strong> 80% to 100% of gate SLA consumed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
                  <span><strong>Delayed:</strong> &gt; 100% of gate SLA (overdue)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 1. Compact View (Used in table rows: Active Initiative Pipeline Register & GenericModuleView)
  if (compact) {
    return (
      <>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="flex flex-col gap-1 min-w-[170px] max-w-[210px] p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-2xs cursor-pointer transition-all text-left group"
          title="Click to view complete Lifecycle Process Age & Gate SLA Matrix"
        >
          {/* Row 1: Total process days & RAG Indicator Pill */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              <span>
                Total: <strong className="font-mono text-slate-900">{ageData.totalDaysElapsed}d</strong>
              </span>
            </div>

            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border flex items-center gap-1 ${ragConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ragConfig.dotClass}`} />
              <span>{ragConfig.label.split(' ')[0]}</span>
            </span>
          </div>

          {/* Row 2: Days in current gate vs SLA */}
          <div className="flex items-center justify-between text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            <span className="font-medium truncate max-w-[105px]">
              Gate {ageData.currentStageCode} ({currentGateSla.shortName}):
            </span>
            <span className="font-mono font-bold text-slate-900">
              {ageData.currentGateDaysElapsed} / {ageData.currentGateSlaDays}d
            </span>
          </div>

          {/* Row 3: Mini inspection action hint */}
          <div className="flex items-center justify-between text-[9px] text-emerald-700 font-semibold pt-0.5">
            <span className="group-hover:underline">Inspect Gate Age Matrix</span>
            <ChevronDown className="w-3 h-3 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

        {renderBreakdownModal()}
      </>
    );
  }

  // 2. Full Rich Card Display (Used in Overview panels, detail headers)
  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs ${ragConfig.bgLightClass} ${ragConfig.borderClass}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${ragConfig.textClass}`} />
            <span className="font-bold text-slate-900 text-xs">
              {ageData.totalDaysElapsed} Days Total
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ragConfig.badgeClass}`}>
            {ragConfig.label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px]">
          <span className="text-slate-600 font-medium">
            Gate {ageData.currentStageCode} ({currentGateSla.shortName}):
          </span>
          <span className="font-mono font-bold text-slate-900">
            {ageData.currentGateDaysElapsed} / {ageData.currentGateSlaDays} days
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              ageData.currentGateRagStatus === 'delayed'
                ? 'bg-rose-500'
                : ageData.currentGateRagStatus === 'at_risk'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(
                100,
                (ageData.currentGateDaysElapsed / ageData.currentGateSlaDays) * 100
              )}%`
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
          <span>Click to see all 7 gate ages</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {renderBreakdownModal()}
    </>
  );
};
