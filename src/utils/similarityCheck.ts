import { Initiative } from '../types';

export interface SimilarityResult {
  initiativeId: string;
  code: string;
  title: string;
  ownerName: string;
  directorate: string;
  stage: string;
  similarityPercentage: number;
  reason: string;
  matchingFactors: string[];
}

function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'over', 'under',
    'across', 'will', 'have', 'been', 'which', 'what', 'who', 'how', 'are', 'was',
    'were', 'our', 'their', 'its', 'project', 'programme', 'initiative', 'support',
    'development', 'african', 'africa', 'regional', 'national', 'implementation'
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
  );
}

function calculateJaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  setA.forEach((item) => {
    if (setB.has(item)) intersectionCount++;
  });
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount > 0 ? (intersectionCount / unionCount) : 0;
}

export function performSimilarityCheck(
  target: Partial<Initiative>,
  allInitiatives: Initiative[],
  currentId?: string
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  const targetTitleTokens = tokenize(target.title || '');
  const targetProblemTokens = tokenize(target.problemStatement || '');
  const targetInterventionTokens = tokenize(target.proposedIntervention || '');
  const targetObjectiveTokens = tokenize(target.strategicObjective || '');
  const targetCountries = new Set(target.countries || []);
  const targetRegions = new Set(target.regions || []);

  allInitiatives.forEach((existing) => {
    if (existing.id === currentId || existing.id === target.id) return;

    const reasons: string[] = [];
    let score = 0;

    // 1. Title Token Overlap (weight 25%)
    const titleTokens = tokenize(existing.title);
    const titleSim = calculateJaccard(targetTitleTokens, titleTokens);
    if (titleSim > 0.15) {
      score += titleSim * 28;
      const commonWords = Array.from(targetTitleTokens).filter((w) => titleTokens.has(w));
      reasons.push(`Title shared thematic keywords: "${commonWords.slice(0, 3).join(', ')}"`);
    }

    // 2. Problem Statement Overlap (weight 25%)
    const probTokens = tokenize(existing.problemStatement);
    const probSim = calculateJaccard(targetProblemTokens, probTokens);
    if (probSim > 0.1) {
      score += probSim * 25;
      const commonWords = Array.from(targetProblemTokens).filter((w) => probTokens.has(w));
      reasons.push(`Shared problem themes: "${commonWords.slice(0, 3).join(', ')}"`);
    }

    // 3. Proposed Intervention Overlap (weight 20%)
    const intervTokens = tokenize(existing.proposedIntervention);
    const intervSim = calculateJaccard(targetInterventionTokens, intervTokens);
    if (intervSim > 0.1) {
      score += intervSim * 20;
      reasons.push('High intervention delivery methodology overlap');
    }

    // 4. Geographic Alignment (weight 15%)
    let sharedCountries = 0;
    existing.countries?.forEach((c) => {
      if (targetCountries.has(c)) sharedCountries++;
    });
    if (sharedCountries > 0) {
      const geoScore = Math.min(15, (sharedCountries / Math.max(existing.countries.length, 1)) * 15);
      score += geoScore;
      reasons.push(`Coincident target member states (${sharedCountries} shared country/ies)`);
    } else {
      let sharedRegions = 0;
      existing.regions?.forEach((r) => {
        if (targetRegions.has(r)) sharedRegions++;
      });
      if (sharedRegions > 0) {
        score += 8;
        reasons.push('Shared target regional economic community corridor');
      }
    }

    // 5. Existing Programme / Directorate Alignment (weight 12%)
    if (
      target.existingProgramme &&
      existing.existingProgramme &&
      target.programmeName &&
      target.programmeName === existing.programmeName
    ) {
      score += 12;
      reasons.push(`Aligned under same umbrella: ${existing.programmeName}`);
    } else if (target.directorate && target.directorate === existing.directorate) {
      score += 5;
    }

    // Normalize score to percentage (capped at 98% unless verbatim duplicate)
    const finalPercentage = Math.min(99, Math.round(score * 1.5));

    if (finalPercentage >= 20 || reasons.length >= 2) {
      results.push({
        initiativeId: existing.id,
        code: existing.code,
        title: existing.title,
        ownerName: existing.ownerName,
        directorate: existing.directorate,
        stage: existing.stage,
        similarityPercentage: finalPercentage,
        reason: reasons.join(' • ') || 'Thematic and sector coherence detected.',
        matchingFactors: reasons
      });
    }
  });

  return results.sort((a, b) => b.similarityPercentage - a.similarityPercentage);
}
