import type { ResourceItem, ResourceKind, VerificationStatus, RiskLevel } from '../types/registry';
import rawCanonicalResources from '../../registry/resources.json';
import { INITIAL_RESOURCES } from './mockRegistry';

function mapRawToResourceItem(raw: any): ResourceItem {
  const source = raw.source || raw.sourcePlatform || 'github';
  const sourcePlatform = source === 'github' ? 'GitHub' : source === 'huggingface' ? 'Hugging Face' : source === 'kaggle' ? 'Kaggle' : 'Official';

  const stars = raw.metrics?.stars ?? raw.stars ?? 0;
  const rating = raw.metrics?.communityRating ?? raw.communityRating ?? 4.5;
  const reviewCount = raw.metrics?.reviewCount ?? raw.reviewCount ?? 0;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    kind: (raw.kind || 'skill') as ResourceKind,
    description: raw.description || `${raw.name} indexed from ${sourcePlatform}`,
    author: {
      name: raw.author?.name || raw.owner || 'Community',
      profileUrl: raw.author?.url || raw.sourceUrl || '#',
      verifiedOrg: raw.author?.verified || false
    },
    sourcePlatform: sourcePlatform as any,
    sourceUrl: raw.sourceUrl || raw.repositoryUrl || '#',
    repositoryUrl: raw.repositoryUrl || raw.sourceUrl || '#',
    createdDate: raw.firstIndexedAt || new Date().toISOString(),
    lastUpdated: raw.lastUpdatedAt || new Date().toISOString(),
    lastIndexed: raw.lastSeenAt || new Date().toISOString(),
    license: raw.license || 'unknown',
    stars,
    communityRating: rating,
    reviewCount,
    tags: raw.capabilityTags || raw.tags || [],
    category: raw.primaryCategory ? raw.primaryCategory.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Agent Architecture',
    subcategory: raw.secondaryCategories?.[0] || 'Indexed',
    version: raw.sourceRevision || raw.version || '1.0.0',
    status: (raw.status || 'indexed') as VerificationStatus,
    riskLevel: (raw.riskLevel || 'unknown') as RiskLevel,
    qualityScore: raw.scores?.quality ? Math.round(raw.scores.quality * 100) : raw.qualityScore || 80,
    popularityScore: raw.scores?.popularity ?? raw.popularityScore ?? 50,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'Universal'],
    runtime: raw.kind === 'mcp' ? 'Node.js' : 'Universal',
    mcpDetails: raw.kind === 'mcp' ? {
      transports: ['stdio', 'sse'],
      toolsProvided: [{ name: raw.slug, description: raw.description || 'Tools provided by MCP server' }],
      envVarsRequired: [],
      configExample: `{\n  "mcpServers": {\n    "${raw.slug}": {\n      "command": "npx",\n      "args": ["-y", "${raw.owner}/${raw.repository}"]\n    }\n  }\n}`,
      installCommand: raw.installCommand || `npx -y @modelcontextprotocol/inspector ${raw.owner}/${raw.repository}`,
      permissions: { filesystem: ['read'], network: ['outbound'] }
    } : undefined,
    skillDetails: raw.kind === 'skill' ? {
      contextCostEstimateTokens: 1200,
      triggerConditions: [`When user requests ${raw.name} capabilities`],
      instructionsPreview: `// ${raw.name} Guidelines\n// Applied from ${raw.sourceUrl}`,
      installCommand: raw.installCommand || `npx skillsfr install ${raw.slug}`,
      requiredTools: [],
      requiredDependencies: [],
      profilesAvailable: ['standard', 'strict']
    } : undefined
  };
}

// Combine raw canonical database records with curated starter pack definitions
export function getCanonicalRegistry(): ResourceItem[] {
  const seenIds = new Set<string>();
  const list: ResourceItem[] = [];

  // Add curated packs first so starter kits remain featured
  for (const kit of INITIAL_RESOURCES) {
    if (kit.kind === 'kit' && !seenIds.has(kit.id)) {
      list.push(kit);
      seenIds.add(kit.id);
    }
  }

  // Add all canonical indexed records
  for (const raw of (rawCanonicalResources as any[])) {
    if (!seenIds.has(raw.id)) {
      list.push(mapRawToResourceItem(raw));
      seenIds.add(raw.id);
    }
  }

  return list;
}

export const CANONICAL_RESOURCES: ResourceItem[] = getCanonicalRegistry();
