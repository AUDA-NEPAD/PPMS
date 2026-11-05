import { Outcome, Output, Activity } from '../types';

export interface BudgetVarianceResult {
  estimatedCost: number;
  calculatedBudget: number;
  variance: number;
  variancePercentage: number;
  status: 'exact' | 'under_budget' | 'minor_over_budget' | 'significant_over_budget';
  warningMessage?: string;
}

export interface PartnerBudgetBreakdown {
  partner: string;
  amount: number;
  percentage: number;
  activityCount: number;
}

export interface OutcomeBudgetBreakdown {
  outcomeNumber: string;
  narrative: string;
  amount: number;
  percentage: number;
  outputCount: number;
  activityCount: number;
}

/**
 * Calculates total cost for all activities within a single output
 */
export const calculateOutputBudget = (output: Output): number => {
  if (!output.activities || output.activities.length === 0) return 0;
  return output.activities.reduce((sum, act) => sum + (Number(act.cost) || 0), 0);
};

/**
 * Calculates total cost for an outcome by rolling up all its outputs and activities
 */
export const calculateOutcomeBudget = (outcome: Outcome): number => {
  if (!outcome.outputs || outcome.outputs.length === 0) return 0;
  return outcome.outputs.reduce((sum, outp) => sum + calculateOutputBudget(outp), 0);
};

/**
 * Calculates grand total project budget by rolling up all outcomes
 */
export const calculateTotalProjectBudget = (outcomes?: Outcome[]): number => {
  if (!outcomes || outcomes.length === 0) return 0;
  return outcomes.reduce((sum, outcome) => sum + calculateOutcomeBudget(outcome), 0);
};

/**
 * Computes variance analysis comparing concept estimated cost with detailed activity-based budget
 */
export const calculateBudgetVariance = (
  estimatedCost: number,
  calculatedBudget: number
): BudgetVarianceResult => {
  const est = Number(estimatedCost) || 0;
  const calc = Number(calculatedBudget) || 0;
  const variance = calc - est;
  const variancePercentage = est > 0 ? (variance / est) * 100 : 0;

  let status: BudgetVarianceResult['status'] = 'exact';
  let warningMessage: string | undefined;

  if (Math.abs(variance) < 1) {
    status = 'exact';
  } else if (variance < 0) {
    status = 'under_budget';
  } else if (variancePercentage <= 10) {
    status = 'minor_over_budget';
    warningMessage = `Budget is ${variancePercentage.toFixed(1)}% above initial concept estimate. Within acceptable 10% contingency threshold.`;
  } else {
    status = 'significant_over_budget';
    warningMessage = `Budget exceeds initial concept estimate by ${variancePercentage.toFixed(1)}% ($${Math.abs(variance).toLocaleString()}). Formal budget justification and director endorsement required before Stage 3 appraisal.`;
  }

  return {
    estimatedCost: est,
    calculatedBudget: calc,
    variance,
    variancePercentage,
    status,
    warningMessage
  };
};

/**
 * Computes budget breakdown aggregated across all activities by Lead Partner
 */
export const calculatePartnerBudgetBreakdown = (outcomes?: Outcome[]): PartnerBudgetBreakdown[] => {
  if (!outcomes || outcomes.length === 0) return [];

  const partnerMap = new Map<string, { amount: number; count: number }>();
  let total = 0;

  outcomes.forEach((outcome) => {
    outcome.outputs?.forEach((outp) => {
      outp.activities?.forEach((act) => {
        const partner = act.leadPartner?.trim() || 'Unassigned / Direct AUDA-NEPAD';
        const cost = Number(act.cost) || 0;
        total += cost;

        const current = partnerMap.get(partner) || { amount: 0, count: 0 };
        partnerMap.set(partner, {
          amount: current.amount + cost,
          count: current.count + 1
        });
      });
    });
  });

  if (total === 0) return [];

  return Array.from(partnerMap.entries())
    .map(([partner, data]) => ({
      partner,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      activityCount: data.count
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Computes budget breakdown aggregated across all outcomes
 */
export const calculateOutcomeBudgetBreakdown = (outcomes?: Outcome[]): OutcomeBudgetBreakdown[] => {
  if (!outcomes || outcomes.length === 0) return [];

  const total = calculateTotalProjectBudget(outcomes);

  return outcomes.map((outcome) => {
    const amount = calculateOutcomeBudget(outcome);
    const outputCount = outcome.outputs?.length || 0;
    const activityCount = outcome.outputs?.reduce(
      (sum, outp) => sum + (outp.activities?.length || 0),
      0
    ) || 0;

    return {
      outcomeNumber: outcome.outcomeNumber,
      narrative: outcome.narrative,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      outputCount,
      activityCount
    };
  });
};
