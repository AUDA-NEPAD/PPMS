import { Outcome, Output, Activity } from '../types';

export function sanitizeAmount(val: number): number {
  if (isNaN(val) || val < 0) return 0;
  return Math.round(val * 100) / 100;
}

export function calculateOutputCost(output: Output): number {
  if (!output.activities || output.activities.length === 0) return 0;
  return output.activities.reduce((sum, act) => sum + sanitizeAmount(act.cost || 0), 0);
}

export function calculateOutcomeCost(outcome: Outcome): number {
  if (!outcome.outputs || outcome.outputs.length === 0) return 0;
  return outcome.outputs.reduce((sum, outp) => sum + calculateOutputCost(outp), 0);
}

export function calculateProjectTotalBudget(outcomes: Outcome[]): number {
  if (!outcomes || outcomes.length === 0) return 0;
  return outcomes.reduce((sum, outc) => sum + calculateOutcomeCost(outc), 0);
}

export interface BudgetSummaryByPartner {
  partner: string;
  totalCost: number;
  activityCount: number;
  percentage: number;
}

export function calculateBudgetByPartner(outcomes: Outcome[], overallTotal?: number): BudgetSummaryByPartner[] {
  const map = new Map<string, { total: number; count: number }>();
  let total = 0;

  outcomes.forEach((outc) => {
    outc.outputs?.forEach((outp) => {
      outp.activities?.forEach((act) => {
        const partnerName = act.leadPartner?.trim() || 'Unassigned / Direct AUDA-NEPAD';
        const cost = sanitizeAmount(act.cost || 0);
        total += cost;

        const current = map.get(partnerName) || { total: 0, count: 0 };
        map.set(partnerName, {
          total: current.total + cost,
          count: current.count + 1
        });
      });
    });
  });

  const baseTotal = overallTotal || total || 1;

  return Array.from(map.entries())
    .map(([partner, data]) => ({
      partner,
      totalCost: data.total,
      activityCount: data.count,
      percentage: Math.round((data.total / baseTotal) * 1000) / 10
    }))
    .sort((a, b) => b.totalCost - a.totalCost);
}

export function calculateBudgetByOutcome(outcomes: Outcome[], overallTotal?: number) {
  const total = overallTotal || calculateProjectTotalBudget(outcomes) || 1;
  return outcomes.map((outc) => {
    const cost = calculateOutcomeCost(outc);
    return {
      outcomeNumber: outc.outcomeNumber,
      narrative: outc.narrative,
      totalCost: cost,
      outputCount: outc.outputs?.length || 0,
      activityCount: outc.outputs?.reduce((acc, o) => acc + (o.activities?.length || 0), 0) || 0,
      percentage: Math.round((cost / total) * 1000) / 10
    };
  });
}
