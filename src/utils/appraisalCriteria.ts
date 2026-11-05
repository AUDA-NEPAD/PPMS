import { AppraisalRating } from '../types';

export const STANDARD_APPRAISAL_CRITERIA: AppraisalRating[] = [
  {
    criteriaId: 'crit-1',
    criteriaName: 'Strategic Alignment & AU Agenda 2063 Fit',
    rating: 'Meets requirements',
    score: 18,
    maxScore: 20,
    evidence: 'Direct alignment with Agenda 2063 strategic result areas, continental flagship priorities, and RECs integration frameworks.',
    status: 'Reviewed'
  },
  {
    criteriaId: 'crit-2',
    criteriaName: 'Theory of Change & Programme Design Principles',
    rating: 'Meets requirements',
    score: 18,
    maxScore: 20,
    evidence: 'Sound causal logic linking root causes, proposed interventions, outputs, and long-term socio-economic outcomes with realistic assumptions.',
    status: 'Reviewed'
  },
  {
    criteriaId: 'crit-3',
    criteriaName: 'Portfolio Coherence, Synergies & Integration',
    rating: 'Meets requirements',
    score: 14,
    maxScore: 15,
    evidence: 'Synergistic with existing regional initiatives, avoiding cross-border duplication and utilizing established continental platforms.',
    status: 'Reviewed'
  },
  {
    criteriaId: 'crit-4',
    criteriaName: 'Budget Allocation, Cost Efficiency & Value for Money',
    rating: 'Meets requirements',
    score: 13,
    maxScore: 15,
    evidence: 'Itemized activity cost rollups reflect competitive market unit benchmarks with sensible operational-to-programmatic ratios.',
    status: 'Reviewed'
  },
  {
    criteriaId: 'crit-5',
    criteriaName: 'Strategic Partnerships & Co-Financing Commitments',
    rating: 'Meets requirements',
    score: 14,
    maxScore: 15,
    evidence: 'Confirmed donor expressions of interest, bilateral letters of intent, and validated member state counterpart commitments.',
    status: 'Reviewed'
  },
  {
    criteriaId: 'crit-6',
    criteriaName: 'Risk Management & Environmental / Social Safeguards',
    rating: 'Meets requirements',
    score: 13,
    maxScore: 15,
    evidence: 'Comprehensive 5x5 threat matrix, designated focal risk owners, and environmental, social, and governance (ESG) compliance frameworks.',
    status: 'Reviewed'
  }
];

export function calculateAppraisalTotalScore(ratings: AppraisalRating[]): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  gradeTier: 'Exceptional (A)' | 'Satisfactory (B)' | 'Conditional (C)' | 'Unsatisfactory (D)';
  gradeColor: string;
} {
  const totalScore = ratings.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
  const maxScore = ratings.reduce((sum, r) => sum + (Number(r.maxScore) || 20), 0) || 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let gradeTier: 'Exceptional (A)' | 'Satisfactory (B)' | 'Conditional (C)' | 'Unsatisfactory (D)' = 'Satisfactory (B)';
  let gradeColor = 'text-blue-600 bg-blue-50 border-blue-200';

  if (percentage >= 88) {
    gradeTier = 'Exceptional (A)';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  } else if (percentage >= 75) {
    gradeTier = 'Satisfactory (B)';
    gradeColor = 'text-blue-700 bg-blue-50 border-blue-300';
  } else if (percentage >= 60) {
    gradeTier = 'Conditional (C)';
    gradeColor = 'text-amber-700 bg-amber-50 border-amber-300';
  } else {
    gradeTier = 'Unsatisfactory (D)';
    gradeColor = 'text-rose-700 bg-rose-50 border-rose-300';
  }

  return { totalScore, maxScore, percentage, gradeTier, gradeColor };
}
