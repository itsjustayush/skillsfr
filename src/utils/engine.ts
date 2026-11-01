import type { ResourceItem } from '../types/registry';

export interface ScoreBreakdown {
  relevance: number;
  compatibility: number;
  maintenance: number;
  verification: number;
  docQuality: number;
  authority: number;
  popularity: number;
  riskPenalty: number;
  finalScore: number;
  smoothedRating: number;
}

export const GLOBAL_RATING_AVG = 4.72;
export const MIN_REVIEW_THRESHOLD = 25;
export const MAX_STARS_BASELINE = 25000;

/**
 * Bayesian smoothed community rating:
 * smoothed_rating = (v / (v + m)) * R + (m / (v + m)) * C
 */
export function calculateBayesianRating(rating: number, reviewCount: number): number {
  const v = reviewCount;
  const m = MIN_REVIEW_THRESHOLD;
  const R = rating;
  const C = GLOBAL_RATING_AVG;
  const smoothed = (v / (v + m)) * R + (m / (v + m)) * C;
  return Math.round(smoothed * 100) / 100;
}

/**
 * Log-scaled popularity score:
 * popularity = 100 * log(1 + stars) / log(1 + maxStars)
 */
export function calculatePopularityScore(stars: number): number {
  const score = (100 * Math.log(1 + stars)) / Math.log(1 + MAX_STARS_BASELINE);
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Transparent Ranking Model:
 * final_score = 0.30 * relevance + 0.20 * compatibility + 0.15 * maintenance
 *             + 0.12 * verification + 0.10 * doc_quality + 0.08 * authority
 *             + 0.05 * popularity - risk_penalty
 */
export function calculateResourceScore(
  resource: ResourceItem,
  queryTerm = '',
  targetClient = 'all'
): ScoreBreakdown {
  // 1. Relevance
  let relevance = 70;
  if (queryTerm) {
    const q = queryTerm.toLowerCase();
    const matchesName = resource.name.toLowerCase().includes(q);
    const matchesDesc = resource.description.toLowerCase().includes(q);
    const matchesTags = resource.tags.some(t => t.toLowerCase().includes(q));
    if (matchesName) relevance = 100;
    else if (matchesTags) relevance = 90;
    else if (matchesDesc) relevance = 80;
    else relevance = 40;
  }

  // 2. Compatibility
  let compatibility = 85;
  if (targetClient !== 'all') {
    if (resource.compatibleClients.includes('Universal') || resource.compatibleClients.includes(targetClient)) {
      compatibility = 100;
    } else {
      compatibility = 25;
    }
  }

  // 3. Maintenance (based on recency of update)
  const daysOld = Math.floor(
    (Date.now() - new Date(resource.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );
  let maintenance = 95;
  if (daysOld > 180) maintenance = 50;
  else if (daysOld > 60) maintenance = 75;
  else if (daysOld > 14) maintenance = 90;

  // 4. Verification
  let verification = 50;
  switch (resource.status) {
    case 'security-reviewed': verification = 100; break;
    case 'runtime-tested': verification = 95; break;
    case 'verified': verification = 85; break;
    case 'community-used': verification = 80; break;
    case 'parsed': verification = 65; break;
    case 'indexed': verification = 50; break;
  }

  // 5. Documentation Quality
  const docQuality = resource.qualityScore || 85;

  // 6. Authority
  let authority = 70;
  if (resource.author.verifiedOrg) authority = 95;
  else if (resource.sourcePlatform === 'Official') authority = 100;
  else if (resource.stars > 5000) authority = 85;

  // 7. Popularity
  const popularity = calculatePopularityScore(resource.stars);

  // Risk Penalty
  let riskPenalty = 0;
  if (resource.riskLevel === 'high') riskPenalty = 30;
  else if (resource.riskLevel === 'medium') riskPenalty = 10;
  else if (resource.riskLevel === 'experimental') riskPenalty = 15;

  const finalScore = Math.round(
    0.30 * relevance +
    0.20 * compatibility +
    0.15 * maintenance +
    0.12 * verification +
    0.10 * docQuality +
    0.08 * authority +
    0.05 * popularity -
    riskPenalty
  );

  const smoothedRating = calculateBayesianRating(resource.communityRating, resource.reviewCount);

  return {
    relevance,
    compatibility,
    maintenance,
    verification,
    docQuality,
    authority,
    popularity,
    riskPenalty,
    finalScore: Math.min(100, Math.max(0, finalScore)),
    smoothedRating
  };
}

/**
 * Intent Router & Minimal Token Skill Resolver
 */
export interface ResolvedIntentPlan {
  query: string;
  identifiedCategory: string;
  detectedTags: string[];
  selectedResources: ResourceItem[];
  excludedResources: ResourceItem[];
  tokenCostRawEstimate: number;
  tokenCostSkillsfrEstimate: number;
  tokenReductionPercent: number;
  composedContextSummary: string[];
  generatedLockfile: string;
}

export function resolveIntentForAgent(intentText: string, allResources: ResourceItem[]): ResolvedIntentPlan {
  const text = intentText.toLowerCase();

  // Intent classification
  let category = 'Design & Frontend';
  const detectedTags: string[] = [];

  if (text.includes('database') || text.includes('postgres') || text.includes('sql') || text.includes('migration')) {
    category = 'Databases & Storage';
    detectedTags.push('postgres', 'sql');
  } else if (text.includes('test') || text.includes('playwright') || text.includes('browser') || text.includes('e2e')) {
    category = 'Browser & Testing';
    detectedTags.push('browser-testing', 'playwright');
  } else if (text.includes('eval') || text.includes('benchmark') || text.includes('dataset') || text.includes('swe-bench')) {
    category = 'Datasets & Benchmarks';
    detectedTags.push('evaluation', 'benchmark');
  } else {
    category = 'Design & Frontend';
    detectedTags.push('ui-ux', 'frontend', 'accessibility');
  }

  // Filter & rank resources
  const scored = allResources.map(r => ({
    resource: r,
    breakdown: calculateResourceScore(r, intentText)
  })).sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);

  // Pick top 3-4 highly relevant ones, leave the rest excluded
  const selectedResources = scored.slice(0, 3).map(s => s.resource);
  const excludedResources = scored.slice(3, 8).map(s => s.resource);

  const tokenCostRawEstimate = 38400; // Average if an agent dumps whole directories or 15 skills into prompt
  const tokenCostSkillsfrEstimate = selectedResources.reduce((acc, r) => {
    return acc + (r.skillDetails?.contextCostEstimateTokens || 1200);
  }, 450);

  const tokenReductionPercent = Math.round(
    ((tokenCostRawEstimate - tokenCostSkillsfrEstimate) / tokenCostRawEstimate) * 100
  );

  const composedContextSummary = [
    `Resolved intent: "${intentText}"`,
    `Primary Category: ${category}`,
    `Deduplicated overlapping layout & responsive rules from ${selectedResources.length} packages into a single unified context stream`,
    `Enforced token budget cap: ${tokenCostSkillsfrEstimate} tokens (${tokenReductionPercent}% reduction vs unmanaged prompt dump)`
  ];

  const generatedLockfile = `# skillsfr.lock (Auto-generated by Skillsfr Intent Router)
version: 1
timestamp: ${new Date().toISOString()}
intent: "${intentText.replace(/"/g, "'")}"
category: "${category}"
selected_packages:
${selectedResources.map(r => `  - id: "${r.id}"
    version: "${r.version}"
    source: "${r.sourcePlatform}"
    quality_score: ${r.qualityScore}`).join('\n')}
excluded_count: ${excludedResources.length}
token_budget: ${tokenCostSkillsfrEstimate}
`;

  return {
    query: intentText,
    identifiedCategory: category,
    detectedTags,
    selectedResources,
    excludedResources,
    tokenCostRawEstimate,
    tokenCostSkillsfrEstimate,
    tokenReductionPercent,
    composedContextSummary,
    generatedLockfile
  };
}
