import { Initiative, StageCode, WorkflowTransition } from '../types';

export type RAGStatus = 'ahead' | 'on_track' | 'at_risk' | 'delayed';

export interface GateSLADefinition {
  stageCode: StageCode;
  stageName: string;
  shortName: string;
  slaDays: number;
  description: string;
}

/**
 * Standard AUDA-NEPAD / PPMS Institutional Gate Target SLAs (in calendar days)
 */
export const GATE_SLAS: Record<StageCode, GateSLADefinition> = {
  0: {
    stageCode: 0,
    stageName: 'Stage 0: Concept Development',
    shortName: 'Concept Dev',
    slaDays: 30,
    description: 'Initial concept formulation, problem diagnostics, and preliminary alignment'
  },
  1: {
    stageCode: 1,
    stageName: 'Stage 1: Concept Evaluation',
    shortName: 'Concept Eval',
    slaDays: 15,
    description: 'Programme Board statutory review, similarity triage, and proceeding decision'
  },
  2: {
    stageCode: 2,
    stageName: 'Stage 2: Project Development',
    shortName: 'Project Dev',
    slaDays: 60,
    description: 'Detailed proposal, Theory of Change, risk matrix, results framework, and budget roll-up'
  },
  3: {
    stageCode: 3,
    stageName: 'Stage 3: Project Appraisal',
    shortName: 'Appraisal',
    slaDays: 25,
    description: 'Independent multi-criteria technical, financial, and environmental appraisal'
  },
  4: {
    stageCode: 4,
    stageName: 'Stage 4: Project Approval',
    shortName: 'CEO Approval',
    slaDays: 14,
    description: 'Executive review, conditions warrant, and formal CEO sign-off directive'
  },
  5: {
    stageCode: 5,
    stageName: 'Stage 5: Contracting',
    shortName: 'Contracting',
    slaDays: 45,
    description: 'Financing agreements, MoUs, procurement terms, and tranche pre-condition fulfillment'
  },
  6: {
    stageCode: 6,
    stageName: 'Stage 6: Amendment and Change Control',
    shortName: 'Amendments',
    slaDays: 30,
    description: 'Statutory amendment review, budget/timeline scope re-baselining'
  }
};

export interface GateAgeBreakdown {
  stageCode: StageCode;
  stageName: string;
  shortName: string;
  slaDays: number;
  daysSpent: number;
  status: 'completed' | 'active' | 'upcoming';
  ragStatus: RAGStatus;
  varianceDays: number; // positive = over SLA (delayed), negative = under SLA (ahead)
  startDate?: string;
  endDate?: string;
}

export interface InitiativeLifecycleAge {
  totalDaysElapsed: number;
  cumulativeSlaDays: number;
  totalVarianceDays: number;
  overallRagStatus: RAGStatus;
  currentStageCode: StageCode;
  currentGateDaysElapsed: number;
  currentGateSlaDays: number;
  currentGateVarianceDays: number;
  currentGateRagStatus: RAGStatus;
  gateBreakdown: GateAgeBreakdown[];
  formattedAgeSummary: string;
}

/**
 * Computes RAG status based on days spent vs target benchmark
 */
export function evaluateRAG(daysSpent: number, slaDays: number): RAGStatus {
  if (daysSpent > slaDays) {
    return 'delayed'; // Red
  }
  if (daysSpent >= Math.ceil(slaDays * 0.8)) {
    return 'at_risk'; // Amber (nearing deadline: >= 80%)
  }
  if (daysSpent <= Math.floor(slaDays * 0.5)) {
    return 'ahead'; // Green (well ahead of schedule: <= 50%)
  }
  return 'on_track'; // Green (on time: 51% - 79%)
}

/**
 * Returns UI styling classes and human labels for RAG status
 */
export function getRAGConfig(status: RAGStatus): {
  label: string;
  badgeClass: string;
  pillClass: string;
  dotClass: string;
  textClass: string;
  borderClass: string;
  bgLightClass: string;
} {
  switch (status) {
    case 'ahead':
      return {
        label: 'Ahead of Schedule',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        pillClass: 'bg-emerald-500 text-white',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-300',
        bgLightClass: 'bg-emerald-50/60'
      };
    case 'on_track':
      return {
        label: 'On Time',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        pillClass: 'bg-emerald-600 text-white',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
        bgLightClass: 'bg-emerald-50/40'
      };
    case 'at_risk':
      return {
        label: 'At Risk (Nearing Target)',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        pillClass: 'bg-amber-500 text-white',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-300',
        bgLightClass: 'bg-amber-50/60'
      };
    case 'delayed':
      return {
        label: 'Delayed (Overdue)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        pillClass: 'bg-rose-600 text-white',
        dotClass: 'bg-rose-500 animate-pulse',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-300',
        bgLightClass: 'bg-rose-50/60'
      };
  }
}

/**
 * Helper to calculate days between two dates
 */
function daysBetween(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    if (isNaN(start) || isNaN(end)) return 1;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch {
    return 1;
  }
}

/**
 * Calculates complete proposal age and lifecycle gate duration breakdown
 * @param initiative The initiative to evaluate
 * @param referenceDate Optional reference timestamp (defaults to current date: Sep 28, 2026)
 */
export function calculateInitiativeLifecycleAge(
  initiative: Initiative,
  referenceDate: string = '2026-09-28T02:35:46Z'
): InitiativeLifecycleAge {
  const submissionDate = initiative.dateSubmitted || '2026-09-01T00:00:00Z';
  const now = new Date(referenceDate).getTime();
  const subTime = new Date(submissionDate).getTime();
  
  // Total proposal age in calendar days
  const totalDaysElapsed = Math.max(
    1,
    Math.round((now - (isNaN(subTime) ? now : subTime)) / (1000 * 60 * 60 * 24))
  );

  const currentStageCode = initiative.stageCode ?? 0;

  // Cumulative SLA target up to the active stage
  let cumulativeSlaDays = 0;
  for (let s = 0; s <= currentStageCode; s++) {
    cumulativeSlaDays += GATE_SLAS[s as StageCode]?.slaDays || 30;
  }

  const totalVarianceDays = totalDaysElapsed - cumulativeSlaDays;
  const overallRagStatus = evaluateRAG(totalDaysElapsed, cumulativeSlaDays);

  // Parse workflow transitions to compute gate durations accurately
  const transitions = [...(initiative.transitions || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate days spent in each stage (0 through 6)
  const gateBreakdown: GateAgeBreakdown[] = [];
  let remainingDaysToDistribute = totalDaysElapsed;

  for (let s = 0; s <= 6; s++) {
    const stageCode = s as StageCode;
    const slaDef = GATE_SLAS[stageCode];
    const isCompleted = s < currentStageCode;
    const isActive = s === currentStageCode;
    const isUpcoming = s > currentStageCode;

    let daysSpent = 0;
    let gateStatus: GateAgeBreakdown['status'] = 'upcoming';

    if (isCompleted) {
      gateStatus = 'completed';
      // Find transitions related to this stage
      const enteringTrans = transitions.find((t) => t.toStage.includes(`Stage ${s}`));
      const leavingTrans = transitions.find((t) => t.fromStage.includes(`Stage ${s}`));

      if (enteringTrans && leavingTrans) {
        daysSpent = daysBetween(enteringTrans.timestamp, leavingTrans.timestamp);
      } else if (leavingTrans) {
        daysSpent = daysBetween(submissionDate, leavingTrans.timestamp);
      } else {
        // Realistic distribution based on SLA proportion of prior completed stages
        const stageWeight = slaDef.slaDays / cumulativeSlaDays;
        daysSpent = Math.max(1, Math.round(totalDaysElapsed * stageWeight * 0.85));
      }
      remainingDaysToDistribute -= daysSpent;
    } else if (isActive) {
      gateStatus = 'active';
      // Days in active gate
      const enteringTrans = transitions
        .slice()
        .reverse()
        .find((t) => t.toStage.includes(`Stage ${s}`));

      if (enteringTrans) {
        daysSpent = daysBetween(enteringTrans.timestamp, referenceDate);
      } else {
        daysSpent = Math.max(1, remainingDaysToDistribute);
      }
    } else {
      gateStatus = 'upcoming';
      daysSpent = 0;
    }

    const varianceDays = daysSpent - slaDef.slaDays;
    const ragStatus = isActive
      ? evaluateRAG(daysSpent, slaDef.slaDays)
      : isCompleted
      ? daysSpent <= slaDef.slaDays
        ? 'on_track'
        : 'delayed'
      : 'on_track';

    gateBreakdown.push({
      stageCode,
      stageName: slaDef.stageName,
      shortName: slaDef.shortName,
      slaDays: slaDef.slaDays,
      daysSpent,
      status: gateStatus,
      ragStatus,
      varianceDays
    });
  }

  // Active gate metrics
  const activeGate = gateBreakdown.find((g) => g.stageCode === currentStageCode) || gateBreakdown[0];
  const currentGateDaysElapsed = activeGate.daysSpent;
  const currentGateSlaDays = activeGate.slaDays;
  const currentGateVarianceDays = activeGate.varianceDays;
  const currentGateRagStatus = activeGate.ragStatus;

  const formattedAgeSummary = `${totalDaysElapsed}d total • Gate ${currentStageCode}: ${currentGateDaysElapsed}/${currentGateSlaDays}d (${getRAGConfig(currentGateRagStatus).label})`;

  return {
    totalDaysElapsed,
    cumulativeSlaDays,
    totalVarianceDays,
    overallRagStatus,
    currentStageCode,
    currentGateDaysElapsed,
    currentGateSlaDays,
    currentGateVarianceDays,
    currentGateRagStatus,
    gateBreakdown,
    formattedAgeSummary
  };
}
