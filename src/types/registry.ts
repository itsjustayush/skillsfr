export type ResourceKind = 'mcp' | 'skill' | 'dataset' | 'benchmark' | 'kit' | 'workflow' | 'tool';

export type VerificationStatus = 
  | 'indexed'          // Metadata scraped from source
  | 'parsed'           // Manifest, dependencies & README understood
  | 'verified'         // Passed automated checks
  | 'runtime-tested'   // Executed in sandbox
  | 'security-reviewed'// Security & permission audit completed
  | 'community-used';  // Verified by active developers

export type RiskLevel = 'low' | 'medium' | 'high' | 'experimental';

export interface SharedMetadata {
  id: string;
  name: string;
  slug: string;
  kind: ResourceKind;
  description: string;
  author: {
    name: string;
    avatarUrl?: string;
    profileUrl: string;
    verifiedOrg?: boolean;
  };
  sourcePlatform: 'GitHub' | 'Hugging Face' | 'Kaggle' | 'Smithery' | 'SkillsMP' | 'Official';
  sourceUrl: string;
  repositoryUrl: string;
  createdDate: string;
  lastUpdated: string;
  lastIndexed: string;
  license: string;
  stars: number;             // Original platform stars/likes
  communityRating: number;   // 1.0 to 5.0 Bayesian smoothed rating
  reviewCount: number;
  tags: string[];
  category: string;
  subcategory?: string;
  version: string;
  status: VerificationStatus;
  riskLevel: RiskLevel;
  qualityScore: number;      // 0-100 algorithmic score
  popularityScore: number;   // 0-100 log-scaled
  compatibleClients: string[]; // 'claude-code' | 'gemini' | 'cursor' | 'opencode' | 'windsurf' | 'manus'
  runtime?: string;          // 'Node.js' | 'Python' | 'Rust' | 'Go' | 'Universal'
}

export interface McpSpecificMetadata {
  transports: ('stdio' | 'streamable-http' | 'sse')[];
  toolsProvided: { name: string; description: string; readOnly?: boolean }[];
  envVarsRequired: { key: string; description: string; secret: boolean }[];
  configExample: string;
  installCommand: string;
  permissions: {
    filesystem?: string[];
    network?: string[];
    shellExecution?: boolean;
    credentials?: string[];
  };
}

export interface SkillSpecificMetadata {
  instructionsPreview: string;
  triggerConditions: string[];
  requiredTools: string[];
  requiredDependencies: string[];
  installCommand: string;
  profilesAvailable: string[];
  contextCostEstimateTokens: number;
}

export interface DatasetSpecificMetadata {
  totalRows: string;
  totalSize: string;
  fileFormats: string[];
  modalities: ('code' | 'text' | 'image' | 'multimodal' | 'tabular')[];
  features: string[];
  languages: string[];
  intendedUse: string;
  splits: { name: string; rows: string }[];
}

export interface BenchmarkSpecificMetadata {
  category: string;
  evaluationMethod: string;
  scoringMetrics: string[];
  testCaseCount: number;
  baselineResults: { modelOrSystem: string; score: string; date: string }[];
  reproducibilityScript: string;
}

export interface StarterPackSpecificMetadata {
  includedResources: { id: string; name: string; kind: ResourceKind; role: string; optional?: boolean }[];
  profiles: { id: string; name: string; description: string }[];
  overlapAnalysis: { duplicatePrinciples: string[]; conflictsResolved: string[] };
  lockfileManifest: string;
  quickstartCommand: string;
}

export interface ResourceItem extends SharedMetadata {
  mcpDetails?: McpSpecificMetadata;
  skillDetails?: SkillSpecificMetadata;
  datasetDetails?: DatasetSpecificMetadata;
  benchmarkDetails?: BenchmarkSpecificMetadata;
  starterPackDetails?: StarterPackSpecificMetadata;
}

export interface RegistryEvent {
  id: string;
  resourceId: string;
  resourceName: string;
  kind: ResourceKind;
  eventType: 'discovered' | 'verified' | 'updated' | 'security_cleared' | 'pack_composed';
  occurredAt: string;
  summary: string;
  revision: string;
  sourceUrl: string;
}

export interface TemplateItem {
  id: string;
  filename: string;
  title: string;
  description: string;
  category: 'agent' | 'security' | 'architecture' | 'legal' | 'workflow';
  content: string;
  variables: { key: string; label: string; defaultValue: string; description: string }[];
}
