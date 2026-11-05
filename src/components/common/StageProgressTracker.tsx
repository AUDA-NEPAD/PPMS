import React from 'react';
import { LifecycleStage, StageCode, WorkflowTransition, Initiative } from '../../types';
import {
  Check,
  Clock,
  RotateCcw,
  XCircle,
  PauseCircle,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import {
  calculateInitiativeLifecycleAge,
  getRAGConfig,
  GATE_SLAS
} from '../../utils/lifecycleAgeCalculations';

interface StageProgressTrackerProps {
  currentStageCode: StageCode;
  currentStatus: string;
  transitions?: WorkflowTransition[];
  compact?: boolean;
  initiative?: Initiative;
  dateSubmitted?: string;
}

interface StageStep {
  code: StageCode;
  label: string;
  stageName: LifecycleStage;
  shortName: string;
}

const STAGES: StageStep[] = [
  { code: 0, label: 'Stage 0', shortName: 'Concept Dev', stageName: 'Stage 0: Concept Development' },
  { code: 1, label: 'Stage 1', shortName: 'Concept Eval', stageName: 'Stage 1: Concept Evaluation' },
  { code: 2, label: 'Stage 2', shortName: 'Project Dev', stageName: 'Stage 2: Project Development' },
  { code: 3, label: 'Stage 3', shortName: 'Appraisal', stageName: 'Stage 3: Project Appraisal' },
  { code: 4, label: 'Stage 4', shortName: 'CEO Approval', stageName: 'Stage 4: Project Approval' },
  { code: 5, label: 'Stage 5', shortName: 'Contracting', stageName: 'Stage 5: Contracting' },
  { code: 6, label: 'Stage 6', shortName: 'Amendments', stageName: 'Stage 6: Amendment and Change Control' }
];

export const StageProgressTracker: React.FC<StageProgressTrackerProps> = ({
  currentStageCode,
  currentStatus,
  transitions = [],
  compact = false,
  initiative,
  dateSubmitted
}) => {
  const isReturned =
    currentStatus.includes('Returned') || currentStatus.includes('Deferred');
  const isRejected = currentStatus === 'Rejected' || currentStatus === 'Aborted';
  const isOnHold = currentStatus === 'On Hold';

  // Build a dummy or real initiative object to calculate lifecycle age
  const effectiveInitiative: Initiative = initiative || ({
    id: 'temp',
    code: 'INIT',
    title: '',
    classification: 'Project',
    stage: STAGES.find((s) => s.code === currentStageCode)?.stageName || 'Stage 0: Concept Development',
    stageCode: currentStageCode,
    status: currentStatus as any,
    directorate: 'Operations',
    ownerId: '',
    ownerName: '',
    dateSubmitted: dateSubmitted || transitions[0]?.timestamp || '2026-09-01T00:00:00Z',
    lastUpdated: '2026-09-28T02:35:46Z',
    regions: ['Continental'],
    countries: [],
    isContinental: true,
    existingProgramme: false,
    strategicObjective: '',
    implementationPeriod: '2–3 years',
    problemStatement: '',
    affectedParties: '',
    importanceStatement: '',
    consequencesOfInaction: '',
    proposedIntervention: '',
    expectedBeneficiaries: '',
    expectedResults: '',
    estimatedCost: 0,
    currency: 'USD',
    possibleFundingPartners: [],
    sras: [],
    sdps: [],
    documents: [],
    transitions
  } as Initiative);

  const ageData = calculateInitiativeLifecycleAge(effectiveInitiative);
  const currentGateRag = getRAGConfig(ageData.currentGateRagStatus);
  const overallRag = getRAGConfig(ageData.overallRagStatus);

  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between text-[10px] text-slate-500 pb-0.5">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-700">{ageData.totalDaysElapsed}d Total</span>
            <span>•</span>
            <span>G{currentStageCode}: {ageData.currentGateDaysElapsed}/{ageData.currentGateSlaDays}d</span>
          </div>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${currentGateRag.badgeClass}`}>
            {currentGateRag.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 w-full overflow-x-auto py-1">
          {STAGES.map((s, idx) => {
            const isCompleted = s.code < currentStageCode && !isRejected;
            const isCurrent = s.code === currentStageCode;
            const gateAge = ageData.gateBreakdown[s.code];
            const gRag = getRAGConfig(gateAge?.ragStatus || 'on_track');

            let badgeColor = 'bg-slate-100 text-slate-400 border-slate-200';
            if (isCompleted) {
              badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
            } else if (isCurrent) {
              if (isRejected) {
                badgeColor = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
              } else if (isReturned) {
                badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
              } else if (isOnHold) {
                badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-300 font-bold';
              } else {
                badgeColor = 'bg-sky-600 text-white border-sky-700 shadow-xs font-bold';
              }
            }

            return (
              <React.Fragment key={s.code}>
                <div
                  title={`${s.label}: ${s.shortName} • ${gateAge ? `${gateAge.daysSpent}d / ${gateAge.slaDays}d SLA (${gRag.label})` : ''}`}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] whitespace-nowrap border ${badgeColor}`}
                >
                  <span>{s.label.replace('Stage ', 'S')}</span>
                  <span className="hidden sm:inline text-[10px] opacity-90">{s.shortName}</span>
                  {gateAge && (isCompleted || isCurrent) && (
                    <span className="text-[9px] font-mono opacity-80 ml-0.5 font-bold">
                      ({gateAge.daysSpent}d)
                    </span>
                  )}
                </div>
                {idx < STAGES.length - 1 && (
                  <div className={`h-0.5 w-2 flex-shrink-0 ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Tracker Header with Overall Age & Current Gate Timeliness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lifecycle Governance & Process Age
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-700">
              SLA Standard
            </span>
          </div>

          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
            <span>Current Stage:</span>
            <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-200">
              {STAGES.find((s) => s.code === currentStageCode)?.stageName || 'N/A'}
            </span>
          </div>
        </div>

        {/* Process Age & RAG Summary Box */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex-wrap">
          {/* Total Days Elapsed */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 leading-none">
                Total Process Age
              </div>
              <div className="font-mono font-extrabold text-slate-900 text-xs mt-0.5">
                {ageData.totalDaysElapsed} Days
              </div>
            </div>
          </div>

          <span className="text-slate-300">|</span>

          {/* Current Gate Days vs SLA */}
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 leading-none">
              Gate {currentStageCode} Days
            </div>
            <div className="font-mono font-extrabold text-slate-900 text-xs mt-0.5">
              {ageData.currentGateDaysElapsed} / {ageData.currentGateSlaDays}d SLA
            </div>
          </div>

          <span className="text-slate-300">|</span>

          {/* Gate RAG Indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${currentGateRag.dotClass}`} />
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentGateRag.badgeClass}`}>
              {currentGateRag.label}
            </span>
          </div>
        </div>
      </div>

      {/* 7-Stage Node Pathway with Gate Days and SLA Indicators */}
      <div className="relative">
        <div className="overflow-x-auto pb-3">
          <div className="min-w-[700px] grid grid-cols-7 gap-2 relative">
            {STAGES.map((stage, idx) => {
              const isCompleted = stage.code < currentStageCode && !isRejected;
              const isCurrent = stage.code === currentStageCode;
              const isPending = stage.code > currentStageCode;
              const gateAge = ageData.gateBreakdown[stage.code];
              const gRag = getRAGConfig(gateAge?.ragStatus || 'on_track');

              // Find matching transition
              const matchingTransition = transitions
                .slice()
                .reverse()
                .find((t) => t.toStage === stage.stageName);

              return (
                <div key={stage.code} className="flex flex-col items-center text-center relative group">
                  {/* Connecting Line */}
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-1 -z-0 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Stage Node */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : isCurrent
                        ? isRejected
                          ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                          : isReturned
                          ? 'bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100'
                          : isOnHold
                          ? 'bg-yellow-500 text-white border-yellow-500 ring-4 ring-yellow-100'
                          : 'bg-sky-600 text-white border-sky-600 ring-4 ring-sky-100 shadow-md'
                        : 'bg-white text-slate-400 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isCurrent ? (
                      isRejected ? (
                        <XCircle className="w-4 h-4" />
                      ) : isReturned ? (
                        <RotateCcw className="w-4 h-4" />
                      ) : isOnHold ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4 animate-spin-slow" />
                      )
                    ) : (
                      <span className="text-xs font-semibold">{stage.code}</span>
                    )}
                  </div>

                  {/* Stage Title */}
                  <div className="mt-2 text-xs font-bold text-slate-800">
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">
                    {stage.shortName}
                  </div>

                  {/* GATE DAYS & SLA TARGET METRIC */}
                  <div className="mt-1.5 p-1 rounded-md bg-white border border-slate-200 w-full max-w-[90px] shadow-2xs">
                    <div className="text-[9px] font-bold uppercase text-slate-400">
                      SLA: {gateAge?.slaDays || 30}d
                    </div>
                    <div className="font-mono text-[10px] font-extrabold text-slate-800">
                      {gateAge?.status === 'upcoming' ? (
                        <span className="text-slate-300 font-normal">--</span>
                      ) : (
                        `${gateAge?.daysSpent} days`
                      )}
                    </div>
                  </div>

                  {/* Gate RAG Indicator Pill */}
                  <div className="mt-1">
                    {isCompleted && (
                      <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100/90 px-1.5 py-0.2 rounded border border-emerald-300 flex items-center gap-0.5 justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Done</span>
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[9px] border flex items-center gap-0.5 justify-center ${gRag.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${gRag.dotClass}`} />
                        <span>{gRag.label.split(' ')[0]}</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="text-slate-400 text-[9px]">Upcoming</span>
                    )}
                  </div>

                  {/* Transition note if available */}
                  {matchingTransition && (
                    <div
                      className="mt-1 text-[9px] text-slate-400 max-w-[90px] truncate"
                      title={`${matchingTransition.performedBy} on ${formatDateTime(matchingTransition.timestamp)}`}
                    >
                      {matchingTransition.performedBy.split(' ')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

