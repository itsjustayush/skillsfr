import type { ResourceItem, RegistryEvent, TemplateItem } from '../types/registry';

export const INITIAL_RESOURCES: ResourceItem[] = [
  // --- CURATED KITS ---
  {
    id: 'skillsfr:kit:ui-ux',
    name: 'Skillsfr UI/UX Agent Kit',
    slug: 'skillsfr-ui-ux-kit',
    kind: 'kit',
    description: 'The unified, zero-bloat UI/UX capability pack for coding agents. Combines Anthropic frontend principles, ibelick components, web guidelines, and WCAG accessibility audits.',
    author: {
      name: 'Skillsfr Core Team',
      profileUrl: 'https://github.com/itsjustayush/skillsfr',
      verifiedOrg: true
    },
    sourcePlatform: 'Official',
    sourceUrl: 'https://skillsfr.vercel.app/kits/ui-ux',
    repositoryUrl: 'https://github.com/itsjustayush/skillsfr',
    createdDate: '2026-10-15',
    lastUpdated: '2026-11-01',
    lastIndexed: '2026-11-01T14:20:00Z',
    license: 'MIT',
    stars: 3420,
    communityRating: 4.96,
    reviewCount: 384,
    tags: ['ui-ux', 'design-system', 'accessibility', 'frontend', 'composed-pack'],
    category: 'Design & Frontend',
    subcategory: 'Curated Kits',
    version: '1.4.0',
    status: 'runtime-tested',
    riskLevel: 'low',
    qualityScore: 98,
    popularityScore: 92,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'opencode', 'windsurf', 'manus'],
    runtime: 'Universal',
    starterPackDetails: {
      quickstartCommand: 'npx skillsfr install ui-ux',
      includedResources: [
        { id: 'anthropics/frontend-design', name: 'Anthropic Frontend Design', kind: 'skill', role: 'Design Foundations' },
        { id: 'ibelick/ui-skills', name: 'iBelick Modern UI Skills', kind: 'skill', role: 'Component Craft' },
        { id: 'vercel-labs/web-design-guidelines', name: 'Web Design Guidelines', kind: 'skill', role: 'Layout Standards' },
        { id: 'nextlevelbuilder/ui-ux-pro-max', name: 'UI-UX Pro Max', kind: 'skill', role: 'Design Tokens' },
        { id: 'millionco/react-doctor', name: 'React Doctor Quality Review', kind: 'skill', role: 'Code Quality', optional: true }
      ],
      profiles: [
        { id: 'frontend', name: 'Frontend Implementation', description: 'Components, responsive CSS, typography, and interactive micro-animations.' },
        { id: 'marketing', name: 'High-Impact Landing Pages', description: 'Awwwards-quality hero layouts, brand typography, and visual distinction.' },
        { id: 'accessibility', name: 'WCAG 2.2 AA Audit', description: 'Semantic HTML, aria landmarks, keyboard navigation, and color contrast.' }
      ],
      overlapAnalysis: {
        duplicatePrinciples: [
          'Deduplicated 4 overlapping responsive layout guidelines',
          'Consolidated 3 separate accessibility color contrast check rules',
          'Merged conflicting font loading and typography recommendations'
        ],
        conflictsResolved: [
          'Resolved CSS framework conflict: favors clean Vanilla CSS custom properties over restrictive utility classes'
        ]
      },
      lockfileManifest: `skillsfr: 1
kit: skillsfr/ui-ux@1.4.0
profile: frontend
resources:
  - id: anthropics/frontend-design@1.2.0
    hash: sha256-a89c4d9...
  - id: ibelick/ui-skills@2.0.1
    hash: sha256-f401bc2...
  - id: vercel-labs/web-design-guidelines@1.0.0
    hash: sha256-e9182aa...
permissions:
  network: none
  filesystem: read-write-cwd`
    }
  },
  {
    id: 'skillsfr:kit:frontend-agent',
    name: 'Full-Stack Frontend Coding Agent Kit',
    slug: 'skillsfr-frontend-agent',
    kind: 'kit',
    description: 'Complete environment for AI agents writing frontend code: includes UI/UX design guidance, React performance diagnostics, Playwright browser testing, and git review workflows.',
    author: {
      name: 'Skillsfr Core Team',
      profileUrl: 'https://github.com/itsjustayush/skillsfr',
      verifiedOrg: true
    },
    sourcePlatform: 'Official',
    sourceUrl: 'https://skillsfr.vercel.app/kits/frontend-agent',
    repositoryUrl: 'https://github.com/itsjustayush/skillsfr',
    createdDate: '2026-10-20',
    lastUpdated: '2026-11-01',
    lastIndexed: '2026-11-01T13:45:00Z',
    license: 'MIT',
    stars: 2150,
    communityRating: 4.91,
    reviewCount: 198,
    tags: ['frontend', 'react', 'nextjs', 'browser-testing', 'playwright', 'composed-pack'],
    category: 'Full-Stack',
    subcategory: 'Curated Kits',
    version: '1.2.0',
    status: 'runtime-tested',
    riskLevel: 'low',
    qualityScore: 96,
    popularityScore: 88,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'opencode'],
    runtime: 'Universal',
    starterPackDetails: {
      quickstartCommand: 'npx skillsfr install frontend-agent',
      includedResources: [
        { id: 'skillsfr:kit:ui-ux', name: 'Skillsfr UI/UX Kit', kind: 'kit', role: 'UI Foundations' },
        { id: 'mcp:playwright', name: 'Playwright Browser Automation MCP', kind: 'mcp', role: 'Visual Verification' },
        { id: 'millionco/react-doctor', name: 'React Doctor', kind: 'skill', role: 'Performance Linting' },
        { id: 'mcp:github', name: 'GitHub Integration MCP', kind: 'mcp', role: 'PR & Review' }
      ],
      profiles: [
        { id: 'standard', name: 'Standard React/Next.js Dev', description: 'Core component generation and verification.' },
        { id: 'ci-headless', name: 'Headless CI Automation', description: 'Automated test suite and accessibility smoke runs.' }
      ],
      overlapAnalysis: {
        duplicatePrinciples: ['Unified browser viewport testing rules across skills and MCP tools.'],
        conflictsResolved: ['Standardized test framework config to Vitest + Playwright.']
      },
      lockfileManifest: `skillsfr: 1
kit: skillsfr/frontend-agent@1.2.0
profile: standard
dependencies:
  mcp:
    - playwright@latest
    - github@latest
  skills:
    - skillsfr/ui-ux@1.4.0`
    }
  },

  // --- SKILLS ---
  {
    id: 'anthropics/frontend-design',
    name: 'Anthropic Frontend Design Skill',
    slug: 'anthropics-frontend-design',
    kind: 'skill',
    description: 'Official Anthropic skill to guide AI coding agents in designing bespoke, modern, responsive, and aesthetically distinctive frontend interfaces while avoiding generic AI clichés.',
    author: {
      name: 'Anthropic',
      profileUrl: 'https://github.com/anthropics',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/anthropics/skills/tree/main/skills/frontend-design',
    repositoryUrl: 'https://github.com/anthropics/skills',
    createdDate: '2026-05-12',
    lastUpdated: '2026-10-28',
    lastIndexed: '2026-11-01T12:00:00Z',
    license: 'Apache-2.0',
    stars: 12850,
    communityRating: 4.95,
    reviewCount: 940,
    tags: ['frontend', 'ui-design', 'design-taste', 'responsive', 'anthropic'],
    category: 'Design & Frontend',
    version: '1.3.2',
    status: 'security-reviewed',
    riskLevel: 'low',
    qualityScore: 97,
    popularityScore: 98,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'opencode', 'windsurf', 'manus'],
    runtime: 'Universal',
    skillDetails: {
      installCommand: 'npx skills add anthropics/skills@frontend-design',
      triggerConditions: ['UI/UX creation', 'Styling changes', 'Component architecture', 'Visual polish requests'],
      requiredTools: ['filesystem:read_file', 'filesystem:write_to_file'],
      requiredDependencies: [],
      instructionsPreview: 'Guide agents to build memorable, purpose-driven UI. Prohibit flat purple-on-black generic AI palettes. Require typography pairing with editorial character.',
      profilesAvailable: ['standard', 'strict-a11y'],
      contextCostEstimateTokens: 1850
    }
  },
  {
    id: 'ibelick/ui-skills',
    name: 'iBelick UI Skills Root',
    slug: 'ibelick-ui-skills',
    kind: 'skill',
    description: 'Expert frontend implementation guidelines for craft-driven interactions, subtle physics, glassmorphism, fluid typography, and clean micro-interactions.',
    author: {
      name: 'Julien Pradet (ibelick)',
      profileUrl: 'https://github.com/ibelick',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/ibelick/ui-skills',
    repositoryUrl: 'https://github.com/ibelick/ui-skills',
    createdDate: '2026-06-18',
    lastUpdated: '2026-10-24',
    lastIndexed: '2026-11-01T11:15:00Z',
    license: 'MIT',
    stars: 8430,
    communityRating: 4.92,
    reviewCount: 462,
    tags: ['ui-components', 'micro-interactions', 'craft', 'framer-motion', 'vanilla-css'],
    category: 'Design & Frontend',
    version: '2.1.0',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 94,
    popularityScore: 91,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'opencode'],
    runtime: 'Universal',
    skillDetails: {
      installCommand: 'npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root',
      triggerConditions: ['Interactive component styling', 'Transitions and animation review', 'Hover states'],
      requiredTools: ['filesystem:read_file'],
      requiredDependencies: [],
      instructionsPreview: 'Enforce tactile interactions with active scale transforms, spring curves, and high-DPI crisp border rendering.',
      profilesAvailable: ['default'],
      contextCostEstimateTokens: 1420
    }
  },
  {
    id: 'millionco/react-doctor',
    name: 'React Doctor — Performance & Quality Diagnostic',
    slug: 'millionco-react-doctor',
    kind: 'skill',
    description: 'Analyzes React codebases for hidden re-renders, hook dependency violations, bloated bundle imports, waterfall data fetching, and SSR memory leaks.',
    author: {
      name: 'Million Software (Aiden Bai)',
      profileUrl: 'https://github.com/millionco',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/millionco/react-doctor',
    repositoryUrl: 'https://github.com/millionco/react-doctor',
    createdDate: '2026-03-10',
    lastUpdated: '2026-10-30',
    lastIndexed: '2026-11-01T10:40:00Z',
    license: 'MIT',
    stars: 6710,
    communityRating: 4.88,
    reviewCount: 312,
    tags: ['react', 'performance', 'diagnostic', 'virtual-dom', 'nextjs'],
    category: 'Code Quality & Linting',
    version: '2.4.1',
    status: 'runtime-tested',
    riskLevel: 'low',
    qualityScore: 93,
    popularityScore: 89,
    compatibleClients: ['claude-code', 'gemini', 'cursor'],
    runtime: 'Node.js',
    skillDetails: {
      installCommand: 'npx skills add https://github.com/millionco/react-doctor --skill improve-react',
      triggerConditions: ['React component refactoring', 'Lighthouse score drop', 'High render latency'],
      requiredTools: ['terminal:run_command', 'filesystem:read_file'],
      requiredDependencies: ['node>=18'],
      instructionsPreview: 'Flag unnecessary useMemo/useCallback overhead, identify missing key props, and recommend compiler-ready structural refactors.',
      profilesAvailable: ['react-19', 'legacy-react'],
      contextCostEstimateTokens: 2100
    }
  },
  {
    id: 'vercel-labs/web-design-guidelines',
    name: 'Vercel Web Design Guidelines',
    slug: 'vercel-web-design-guidelines',
    kind: 'skill',
    description: 'Official web platform best practices for Core Web Vitals, accessible layout shifts, native HTML dialogs, popovers, and CSS view transitions.',
    author: {
      name: 'Vercel Labs',
      profileUrl: 'https://github.com/vercel-labs',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/vercel-labs/agent-skills',
    repositoryUrl: 'https://github.com/vercel-labs/agent-skills',
    createdDate: '2026-07-04',
    lastUpdated: '2026-10-29',
    lastIndexed: '2026-11-01T09:20:00Z',
    license: 'Apache-2.0',
    stars: 9240,
    communityRating: 4.94,
    reviewCount: 520,
    tags: ['web-standards', 'performance', 'core-web-vitals', 'vercel', 'nextjs'],
    category: 'Design & Frontend',
    version: '1.1.0',
    status: 'security-reviewed',
    riskLevel: 'low',
    qualityScore: 96,
    popularityScore: 94,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'opencode'],
    runtime: 'Universal',
    skillDetails: {
      installCommand: 'npx skills add vercel-labs/agent-skills@web-design-guidelines',
      triggerConditions: ['Frontend page setup', 'Image optimization', 'Font loading configuration'],
      requiredTools: ['filesystem:read_file'],
      requiredDependencies: [],
      instructionsPreview: 'Enforce font-display: swap, layout stability with explicit aspect-ratio attributes, and zero runtime layout shifts.',
      profilesAvailable: ['default'],
      contextCostEstimateTokens: 1600
    }
  },
  {
    id: 'MengTo/build-awwwards-quality-sites',
    name: 'Build Awwwards-Quality Sites',
    slug: 'mengto-build-awwwards-quality-sites',
    kind: 'skill',
    description: 'Guides agents to architect award-winning marketing sites with kinetic typography, 3D CSS perspectives, smooth GSAP scroll triggers, and artistic grids.',
    author: {
      name: 'Meng To (DesignCode)',
      profileUrl: 'https://github.com/MengTo',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/MengTo/Skills',
    repositoryUrl: 'https://github.com/MengTo/Skills',
    createdDate: '2026-08-11',
    lastUpdated: '2026-10-18',
    lastIndexed: '2026-11-01T08:50:00Z',
    license: 'MIT',
    stars: 4320,
    communityRating: 4.89,
    reviewCount: 215,
    tags: ['awwwards', 'gsap', 'creative-development', 'typography', 'animation'],
    category: 'Design & Frontend',
    version: '1.0.5',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 91,
    popularityScore: 84,
    compatibleClients: ['claude-code', 'gemini', 'cursor'],
    runtime: 'Universal',
    skillDetails: {
      installCommand: 'npx skills add MengTo/Skills@build-awwwards-quality-sites',
      triggerConditions: ['Landing page animation', 'Showcase website design', 'Kinetic typography'],
      requiredTools: ['filesystem:read_file'],
      requiredDependencies: ['gsap'],
      instructionsPreview: 'Apply staggered character reveals, smooth inertia scrolling, and high-contrast editorial hierarchy.',
      profilesAvailable: ['marketing-showcase'],
      contextCostEstimateTokens: 2400
    }
  },

  // --- MCP SERVERS ---
  {
    id: 'mcp:github',
    name: 'Official GitHub MCP Server',
    slug: 'mcp-github',
    kind: 'mcp',
    description: 'Connect AI agents directly to GitHub repositories, pull requests, issue trackers, commit histories, search APIs, and release workflows.',
    author: {
      name: 'Model Context Protocol Core',
      profileUrl: 'https://github.com/modelcontextprotocol',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    repositoryUrl: 'https://github.com/modelcontextprotocol/servers',
    createdDate: '2025-11-20',
    lastUpdated: '2026-10-31',
    lastIndexed: '2026-11-01T14:10:00Z',
    license: 'MIT',
    stars: 18400,
    communityRating: 4.96,
    reviewCount: 1420,
    tags: ['mcp', 'github', 'git', 'pull-requests', 'ci-cd'],
    category: 'Development Tools',
    version: '2.4.0',
    status: 'security-reviewed',
    riskLevel: 'medium',
    qualityScore: 99,
    popularityScore: 100,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'windsurf', 'manus'],
    runtime: 'Node.js',
    mcpDetails: {
      transports: ['stdio', 'streamable-http'],
      toolsProvided: [
        { name: 'create_or_update_file', description: 'Create or replace file content in a branch' },
        { name: 'search_repositories', description: 'Search GitHub repos by query and topic', readOnly: true },
        { name: 'create_pull_request', description: 'Open a PR with title and descriptive body' },
        { name: 'get_issue', description: 'Fetch issue details and comments', readOnly: true },
        { name: 'list_commits', description: 'Fetch chronological commits', readOnly: true }
      ],
      envVarsRequired: [
        { key: 'GITHUB_PERSONAL_ACCESS_TOKEN', description: 'Personal Access Token with repo scope', secret: true }
      ],
      configExample: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxx..."
      }
    }
  }
}`,
      installCommand: 'npx -y @modelcontextprotocol/server-github',
      permissions: {
        network: ['api.github.com'],
        credentials: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
        shellExecution: false
      }
    }
  },
  {
    id: 'mcp:postgres',
    name: 'PostgreSQL Database MCP Server',
    slug: 'mcp-postgres',
    kind: 'mcp',
    description: 'Read-only and transactional PostgreSQL database integration allowing agents to inspect schemas, optimize slow queries, run EXPLAIN ANALYZE, and generate migrations safely.',
    author: {
      name: 'Model Context Protocol Core',
      profileUrl: 'https://github.com/modelcontextprotocol',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    repositoryUrl: 'https://github.com/modelcontextprotocol/servers',
    createdDate: '2025-11-20',
    lastUpdated: '2026-10-25',
    lastIndexed: '2026-11-01T13:20:00Z',
    license: 'MIT',
    stars: 12100,
    communityRating: 4.93,
    reviewCount: 890,
    tags: ['mcp', 'postgres', 'sql', 'database', 'neon'],
    category: 'Databases & Storage',
    version: '1.9.2',
    status: 'security-reviewed',
    riskLevel: 'medium',
    qualityScore: 97,
    popularityScore: 96,
    compatibleClients: ['claude-code', 'gemini', 'cursor', 'windsurf'],
    runtime: 'Node.js',
    mcpDetails: {
      transports: ['stdio'],
      toolsProvided: [
        { name: 'query', description: 'Execute a read query or statement' },
        { name: 'describe_table', description: 'Get table column definitions, types, and indexes', readOnly: true },
        { name: 'list_tables', description: 'List all public schema tables', readOnly: true }
      ],
      envVarsRequired: [
        { key: 'POSTGRES_CONNECTION_STRING', description: 'postgresql://user:pass@host/db', secret: true }
      ],
      configExample: `{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/mydb"]
    }
  }
}`,
      installCommand: 'npx -y @modelcontextprotocol/server-postgres "postgresql://..."',
      permissions: {
        network: ['database host'],
        credentials: ['POSTGRES_CONNECTION_STRING']
      }
    }
  },
  {
    id: 'mcp:playwright',
    name: 'Playwright Browser Automation MCP',
    slug: 'mcp-playwright',
    kind: 'mcp',
    description: 'Enables coding agents to launch Chromium/WebKit instances, click elements, fill forms, take screenshots, inspect DOM snapshots, and run automated E2E tests.',
    author: {
      name: 'ExecuteAutomation',
      profileUrl: 'https://github.com/executeautomation',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/executeautomation/mcp-playwright',
    repositoryUrl: 'https://github.com/executeautomation/mcp-playwright',
    createdDate: '2026-02-14',
    lastUpdated: '2026-10-27',
    lastIndexed: '2026-11-01T12:45:00Z',
    license: 'Apache-2.0',
    stars: 8920,
    communityRating: 4.90,
    reviewCount: 610,
    tags: ['mcp', 'playwright', 'browser', 'e2e-testing', 'automation'],
    category: 'Browser & Testing',
    version: '1.8.0',
    status: 'runtime-tested',
    riskLevel: 'medium',
    qualityScore: 95,
    popularityScore: 92,
    compatibleClients: ['claude-code', 'gemini', 'cursor'],
    runtime: 'Node.js',
    mcpDetails: {
      transports: ['stdio'],
      toolsProvided: [
        { name: 'browser_navigate', description: 'Navigate to target URL' },
        { name: 'browser_click', description: 'Click an element with CSS or role selector' },
        { name: 'browser_screenshot', description: 'Capture full-page or element screenshot', readOnly: true },
        { name: 'browser_evaluate', description: 'Evaluate JS in browser context' }
      ],
      envVarsRequired: [],
      configExample: `{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}`,
      installCommand: 'npx -y @executeautomation/playwright-mcp-server',
      permissions: {
        network: ['*'],
        filesystem: ['temp screenshots'],
        shellExecution: true
      }
    }
  },
  {
    id: 'mcp:figma',
    name: 'Figma Design System MCP',
    slug: 'mcp-figma',
    kind: 'mcp',
    description: 'Allows AI agents to read Figma design tokens, extract component properties, retrieve frame geometries, export SVG assets, and compare UI implementation against Figma mockups.',
    author: {
      name: 'Model Context Protocol Core',
      profileUrl: 'https://github.com/modelcontextprotocol',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/figma',
    repositoryUrl: 'https://github.com/modelcontextprotocol/servers',
    createdDate: '2026-03-22',
    lastUpdated: '2026-10-15',
    lastIndexed: '2026-11-01T10:10:00Z',
    license: 'MIT',
    stars: 5400,
    communityRating: 4.87,
    reviewCount: 340,
    tags: ['mcp', 'figma', 'design-tokens', 'ui-sync'],
    category: 'Design & Frontend',
    version: '1.3.1',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 92,
    popularityScore: 86,
    compatibleClients: ['claude-code', 'gemini', 'cursor'],
    runtime: 'Node.js',
    mcpDetails: {
      transports: ['stdio'],
      toolsProvided: [
        { name: 'get_file_nodes', description: 'Fetch node tree from Figma file', readOnly: true },
        { name: 'get_image_exports', description: 'Render SVG/PNG component previews', readOnly: true }
      ],
      envVarsRequired: [
        { key: 'FIGMA_PERSONAL_ACCESS_TOKEN', description: 'Figma API Token', secret: true }
      ],
      configExample: `{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": { "FIGMA_PERSONAL_ACCESS_TOKEN": "figd_xxx..." }
    }
  }
}`,
      installCommand: 'npx -y @modelcontextprotocol/server-figma',
      permissions: {
        network: ['api.figma.com'],
        credentials: ['FIGMA_PERSONAL_ACCESS_TOKEN']
      }
    }
  },

  // --- DATASETS ---
  {
    id: 'hf:swe-bench-in-the-wild',
    name: 'SWE-bench In-The-Wild Execution Traces',
    slug: 'swe-bench-in-the-wild',
    kind: 'dataset',
    description: 'Curated corpus of 14,200 real-world software engineering agent trajectories, tool-calling chains, patch files, and verified unit test passes on complex GitHub issues.',
    author: {
      name: 'Princeton NLP & SWE-bench Team',
      profileUrl: 'https://huggingface.co/princeton-nlp',
      verifiedOrg: true
    },
    sourcePlatform: 'Hugging Face',
    sourceUrl: 'https://huggingface.co/datasets/princeton-nlp/SWE-bench',
    repositoryUrl: 'https://github.com/princeton-nlp/SWE-bench',
    createdDate: '2025-08-14',
    lastUpdated: '2026-10-12',
    lastIndexed: '2026-11-01T07:15:00Z',
    license: 'MIT',
    stars: 3890,
    communityRating: 4.97,
    reviewCount: 280,
    tags: ['dataset', 'swe-bench', 'agent-trajectories', 'code-generation', 'github-issues'],
    category: 'Datasets & Benchmarks',
    version: '2.0.0',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 98,
    popularityScore: 95,
    compatibleClients: ['Universal'],
    runtime: 'Universal',
    datasetDetails: {
      totalRows: '14,200 trajectories',
      totalSize: '4.8 GB',
      fileFormats: ['parquet', 'jsonl'],
      modalities: ['code', 'text'],
      features: ['repo_name', 'problem_statement', 'patch', 'test_patch', 'trajectory_steps', 'resolved_status'],
      languages: ['Python', 'TypeScript', 'Go', 'Rust'],
      intendedUse: 'Agent evaluation, trajectory fine-tuning, step-by-step reasoning reinforcement.',
      splits: [
        { name: 'train', rows: '11,200' },
        { name: 'validation', rows: '1,500' },
        { name: 'test', rows: '1,500' }
      ]
    }
  },
  {
    id: 'hf:multimodal-ui-grounding',
    name: 'Multimodal Web UI Grounding & Action Dataset',
    slug: 'multimodal-ui-grounding',
    kind: 'dataset',
    description: 'High-resolution DOM snapshots paired with normalized bounding boxes, accessibility tree representations, user task intents, and verified click/type action sequences.',
    author: {
      name: 'Agentic Research Consortium',
      profileUrl: 'https://huggingface.co/agentic-research',
      verifiedOrg: true
    },
    sourcePlatform: 'Hugging Face',
    sourceUrl: 'https://huggingface.co/datasets/agentic-research/multimodal-ui-grounding',
    repositoryUrl: 'https://github.com/agentic-research/ui-grounding',
    createdDate: '2026-04-02',
    lastUpdated: '2026-09-28',
    lastIndexed: '2026-11-01T06:30:00Z',
    license: 'CC-BY-4.0',
    stars: 2190,
    communityRating: 4.89,
    reviewCount: 145,
    tags: ['dataset', 'multimodal', 'browser-agents', 'vision-ui', 'grounding'],
    category: 'Datasets & Benchmarks',
    version: '1.2.1',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 94,
    popularityScore: 87,
    compatibleClients: ['Universal'],
    runtime: 'Universal',
    datasetDetails: {
      totalRows: '45,000 screen-action pairs',
      totalSize: '12.4 GB',
      fileFormats: ['parquet', 'png-archive', 'jsonl'],
      modalities: ['image', 'code', 'text'],
      features: ['screen_img_url', 'dom_tree', 'accessibility_nodes', 'target_box', 'action_type'],
      languages: ['HTML', 'CSS', 'English'],
      intendedUse: 'Training vision-language action models for autonomous web browser agents.',
      splits: [
        { name: 'train', rows: '38,000' },
        { name: 'eval', rows: '7,000' }
      ]
    }
  },

  // --- BENCHMARKS ---
  {
    id: 'benchmark:swe-bench-verified',
    name: 'SWE-bench Verified',
    slug: 'swe-bench-verified',
    kind: 'benchmark',
    description: 'The golden standard benchmark for evaluating autonomous AI software engineering agents on real-world GitHub issues filtered for human-verified solvability and reproducible test harnesses.',
    author: {
      name: 'Princeton NLP & OpenAI',
      profileUrl: 'https://github.com/princeton-nlp/SWE-bench',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://www.swebench.com/',
    repositoryUrl: 'https://github.com/princeton-nlp/SWE-bench',
    createdDate: '2025-09-01',
    lastUpdated: '2026-10-31',
    lastIndexed: '2026-11-01T14:00:00Z',
    license: 'MIT',
    stars: 7600,
    communityRating: 4.98,
    reviewCount: 512,
    tags: ['benchmark', 'swe-bench', 'evaluation', 'coding-agents', 'leaderboard'],
    category: 'Datasets & Benchmarks',
    version: 'verified-2026',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 99,
    popularityScore: 98,
    compatibleClients: ['Universal'],
    runtime: 'Python',
    benchmarkDetails: {
      category: 'Autonomous Software Engineering',
      evaluationMethod: 'Docker containerized isolated test harness execution',
      scoringMetrics: ['Pass@1 (%)', 'Patch Cleanliness', 'Run Cost (USD)'],
      testCaseCount: 500,
      baselineResults: [
        { modelOrSystem: 'Claude 3.7 Sonnet (Agentic)', score: '70.4% Pass@1', date: '2026-03' },
        { modelOrSystem: 'OpenAI o3-mini', score: '68.2% Pass@1', date: '2026-02' },
        { modelOrSystem: 'Gemini 2.5 Pro', score: '66.8% Pass@1', date: '2026-01' }
      ],
      reproducibilityScript: 'docker run --rm -v $(pwd):/workspace swebench/eval:verified-2026 run --predictions predictions.json'
    }
  },
  {
    id: 'benchmark:webarena',
    name: 'WebArena Browser Agent Suite',
    slug: 'webarena-browser-suite',
    kind: 'benchmark',
    description: 'Realistic web environment evaluation suite covering shopping, forums, code hosting, and CMS sites to evaluate end-to-end task completion by AI agents.',
    author: {
      name: 'Carnegie Mellon University',
      profileUrl: 'https://webarena.dev',
      verifiedOrg: true
    },
    sourcePlatform: 'GitHub',
    sourceUrl: 'https://webarena.dev/',
    repositoryUrl: 'https://github.com/web-arena-x/webarena',
    createdDate: '2025-07-15',
    lastUpdated: '2026-09-19',
    lastIndexed: '2026-11-01T05:40:00Z',
    license: 'Apache-2.0',
    stars: 4200,
    communityRating: 4.91,
    reviewCount: 310,
    tags: ['benchmark', 'browser-agents', 'webarena', 'task-completion'],
    category: 'Datasets & Benchmarks',
    version: '1.4.0',
    status: 'verified',
    riskLevel: 'low',
    qualityScore: 95,
    popularityScore: 89,
    compatibleClients: ['Universal'],
    runtime: 'Python',
    benchmarkDetails: {
      category: 'Web Agent Autonomous Execution',
      evaluationMethod: 'Dynamic web service validation against live self-hosted instances',
      scoringMetrics: ['Task Success Rate (%)', 'Step Efficiency', 'API Call Count'],
      testCaseCount: 812,
      baselineResults: [
        { modelOrSystem: 'Claude 3.7 + Playwright', score: '54.2% Success', date: '2026-04' },
        { modelOrSystem: 'GPT-4o Agent', score: '42.8% Success', date: '2025-11' }
      ],
      reproducibilityScript: 'python run.py --test-config-base-dir config_files/test.json'
    }
  }
];

export const REGISTRY_EVENTS: RegistryEvent[] = [
  {
    id: 'evt-1092',
    resourceId: 'skillsfr:kit:ui-ux',
    resourceName: 'Skillsfr UI/UX Agent Kit',
    kind: 'kit',
    eventType: 'pack_composed',
    occurredAt: '2026-11-01T14:20:00Z',
    summary: 'Composed v1.4.0 release: unified Anthropic design guidelines with iBelick component physics and automated WCAG 2.2 AA contrast tests.',
    revision: 'sha-c9842a',
    sourceUrl: 'https://github.com/itsjustayush/skillsfr'
  },
  {
    id: 'evt-1091',
    resourceId: 'mcp:github',
    resourceName: 'Official GitHub MCP Server',
    kind: 'mcp',
    eventType: 'security_cleared',
    occurredAt: '2026-11-01T14:10:00Z',
    summary: 'Automated permission scan passed: scoped to api.github.com only, zero arbitrary shell injection vectors detected.',
    revision: 'v2.4.0',
    sourceUrl: 'https://github.com/modelcontextprotocol/servers'
  },
  {
    id: 'evt-1090',
    resourceId: 'anthropics/frontend-design',
    resourceName: 'Anthropic Frontend Design Skill',
    kind: 'skill',
    eventType: 'updated',
    occurredAt: '2026-11-01T12:00:00Z',
    summary: 'Indexed new revision: updated guidelines on CSS anchor positioning and native dialog focus trapping.',
    revision: 'v1.3.2',
    sourceUrl: 'https://github.com/anthropics/skills'
  },
  {
    id: 'evt-1089',
    resourceId: 'benchmark:swe-bench-verified',
    resourceName: 'SWE-bench Verified',
    kind: 'benchmark',
    eventType: 'verified',
    occurredAt: '2026-11-01T10:45:00Z',
    summary: 'Test harnesses confirmed reproducible: 500 Dockerized issue environments validated against latest Linux kernel.',
    revision: 'verified-2026',
    sourceUrl: 'https://www.swebench.com/'
  },
  {
    id: 'evt-1088',
    resourceId: 'hf:swe-bench-in-the-wild',
    resourceName: 'SWE-bench In-The-Wild Execution Traces',
    kind: 'dataset',
    eventType: 'discovered',
    occurredAt: '2026-11-01T07:15:00Z',
    summary: 'Scraped and verified Hugging Face metadata: 14,200 trajectories across Python, TypeScript, and Rust.',
    revision: 'v2.0.0',
    sourceUrl: 'https://huggingface.co/datasets/princeton-nlp/SWE-bench'
  }
];

export const TEMPLATES_DATA: TemplateItem[] = [
  {
    id: 'agents-md',
    filename: 'AGENTS.md',
    title: 'AGENTS.md — Autonomous Agent Architecture & Rules',
    category: 'agent',
    description: 'Establishes behavioral constraints, execution rules, coding guidelines, testing standards, and multi-agent roles (Supervisor, Planner, Executor, Reviewer).',
    variables: [
      { key: 'PROJECT_NAME', label: 'Project Name', defaultValue: 'my-agentic-app', description: 'Name of the repository or app' },
      { key: 'AUTHOR', label: 'Author/Team', defaultValue: 'Team', description: 'Maintainer name' },
      { key: 'FRAMEWORK', label: 'Primary Framework', defaultValue: 'Next.js / Vite', description: 'Tech stack' },
      { key: 'TESTING_TOOL', label: 'Testing Tool', defaultValue: 'Vitest + Playwright', description: 'Unit & E2E tool' }
    ],
    content: `# AGENTS.md — {{PROJECT_NAME}}

This repository is built for collaboration between human engineers and autonomous AI agents.
Maintainer: {{AUTHOR}}
Stack: {{FRAMEWORK}}
Test Suite: {{TESTING_TOOL}}

## 1. Agent Operating Principles
- **Documentation Integrity**: Never delete existing comments or documentation unless explicitly requested.
- **Minimal Context Cost**: Prefer concise, targeted edits over whole-file replacements.
- **Defensive Execution**: Always run static analysis and unit tests before finalizing changes.
- **No Unvetted Code**: Do not install unpinned packages without prior user consent.

## 2. Multi-Agent Roles
| Role | Responsibility | Permitted Tools |
|---|---|---|
| **Supervisor** | Orchestrates tasks, validates end goals | Read-only tools |
| **Planner** | Decomposes objectives into testable steps | Read-only tools |
| **Executor** | Implements code changes and tests | Filesystem & Terminal |
| **Reviewer** | Audits code for security & regressions | Lint & Static analysis |

## 3. Verification Protocol
Before marking any task complete:
1. Run \`npm run lint\` or language equivalent.
2. Run \`npm test\` to guarantee zero regressions.
3. Verify responsive layout and a11y color contrast.
`
  },
  {
    id: 'claude-md',
    filename: 'CLAUDE.md',
    title: 'CLAUDE.md — Claude Code Context & Command Guide',
    category: 'agent',
    description: 'Concise project memory and cheat-sheet for Claude Code: commands, architecture boundaries, formatting rules, and style tokens.',
    variables: [
      { key: 'PROJECT_NAME', label: 'Project Name', defaultValue: 'skillsfr', description: 'Repository name' },
      { key: 'DEV_COMMAND', label: 'Dev Server Command', defaultValue: 'npm run dev', description: 'Command to run dev server' },
      { key: 'BUILD_COMMAND', label: 'Build Command', defaultValue: 'npm run build', description: 'Build command' }
    ],
    content: `# CLAUDE.md — {{PROJECT_NAME}}

## Build & Test Commands
- Dev Server: \`{{DEV_COMMAND}}\`
- Production Build: \`{{BUILD_COMMAND}}\`
- Lint: \`npm run lint\`

## Code Style & Conventions
- **TypeScript**: Strict mode enabled. Never use \`any\` when interface can be typed.
- **Styling**: Use Vanilla CSS with CSS custom properties; keep styles modular and scoped.
- **Dependencies**: Keep external dependencies minimal. Avoid heavy runtime libraries.
`
  },
  {
    id: 'privacy-md',
    filename: 'PRIVACY.md',
    title: 'PRIVACY.md — AI Agent Data & Telemetry Policy',
    category: 'legal',
    description: 'Declares what code, prompts, tokens, and telemetry are transmitted to LLM providers or third-party MCP endpoints.',
    variables: [
      { key: 'PROJECT_NAME', label: 'Project Name', defaultValue: 'skillsfr', description: 'App name' },
      { key: 'CONTACT_EMAIL', label: 'Contact Email', defaultValue: 'privacy@skillsfr.dev', description: 'Email for privacy queries' }
    ],
    content: `# PRIVACY & AI TELEMETRY POLICY — {{PROJECT_NAME}}

Last updated: November 2026
Contact: {{CONTACT_EMAIL}}

## 1. Local-First Processing
All skill resolution, dependency analysis, and starter generation occurs locally on your machine. Your proprietary source code and private prompts are NEVER stored on Skillsfr servers.

## 2. Remote Registry Calls
When using \`skillsfr search\` or querying the registry:
- Transmitted: Search keyword query or capability tag.
- NOT Transmitted: Source code, environment variables, API secrets, or local file contents.

## 3. Third-Party MCP Servers
Each MCP server in the registry clearly lists required network endpoints (e.g. \`api.github.com\`). You retain explicit control over environment credentials.
`
  },
  {
    id: 'security-md',
    filename: 'SECURITY.md',
    title: 'SECURITY.md — Vulnerability Disclosure & Audit Rules',
    category: 'security',
    description: 'Vulnerability reporting process, sandboxed execution rules, and security scanning policies for MCP servers and agent skills.',
    variables: [
      { key: 'PROJECT_NAME', label: 'Project Name', defaultValue: 'skillsfr', description: 'App name' },
      { key: 'SECURITY_EMAIL', label: 'Security Email', defaultValue: 'security@skillsfr.dev', description: 'Vulnerability reporting email' }
    ],
    content: `# SECURITY POLICY — {{PROJECT_NAME}}

## Supported Versions
Only the latest release of {{PROJECT_NAME}} receives active security patches.

## Reporting a Vulnerability
Please email reports to \`{{SECURITY_EMAIL}}\` with:
- Description of the attack vector or credential leakage.
- Proof-of-concept reproduction steps.
- Affected MCP server, skill manifest, or CLI version.

We commit to an initial response within 24 hours and a remediation plan within 72 hours.
`
  }
];
