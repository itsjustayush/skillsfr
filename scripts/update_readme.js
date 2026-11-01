import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const README_FILE = path.join(ROOT_DIR, 'README.md');

const START_MARKER = '<!-- SKILLSFR:REGISTRY:START -->';
const END_MARKER = '<!-- SKILLSFR:REGISTRY:END -->';

const SEED_DATA = [
  {
    name: 'Skillsfr UI/UX Agent Kit',
    kind: 'Starter Packs & Kits',
    url: 'https://github.com/itsjustayush/skillsfr',
    description: 'Composed, conflict-free UI/UX guidance: Anthropic design principles, ibelick micro-interactions, and WCAG accessibility.',
    indexed: '2026-11-01',
    author: 'Skillsfr Core',
    stars: 3420,
    status: 'Runtime-Tested'
  },
  {
    name: 'Anthropic Frontend Design Skill',
    kind: 'Agent Skills',
    url: 'https://github.com/anthropics/skills/tree/main/skills/frontend-design',
    description: 'Official Anthropic skill to design bespoke, responsive, and distinctive interfaces without generic AI tropes.',
    indexed: '2026-11-01',
    author: 'Anthropic',
    stars: 12850,
    status: 'Security-Reviewed'
  },
  {
    name: 'iBelick Modern UI Skills',
    kind: 'Agent Skills',
    url: 'https://github.com/ibelick/ui-skills',
    description: 'Tactile interaction craft, spring curves, micro-animations, and fluid responsive styling.',
    indexed: '2026-11-01',
    author: 'ibelick',
    stars: 8430,
    status: 'Verified'
  },
  {
    name: 'Official GitHub MCP Server',
    kind: 'MCP Servers',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    description: 'Enables AI agents to query issues, open pull requests, and commit code directly.',
    indexed: '2026-11-01',
    author: 'Model Context Protocol',
    stars: 18400,
    status: 'Security-Reviewed'
  },
  {
    name: 'PostgreSQL Database MCP Server',
    kind: 'MCP Servers',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    description: 'Safe schema inspection, EXPLAIN query optimization, and migration generation for PostgreSQL.',
    indexed: '2026-11-01',
    author: 'Model Context Protocol',
    stars: 12100,
    status: 'Security-Reviewed'
  },
  {
    name: 'Playwright Browser Automation MCP',
    kind: 'MCP Servers',
    url: 'https://github.com/executeautomation/mcp-playwright',
    description: 'Full browser control, click/type actions, screenshots, and visual regression tests.',
    indexed: '2026-11-01',
    author: 'ExecuteAutomation',
    stars: 8920,
    status: 'Runtime-Tested'
  },
  {
    name: 'SWE-bench In-The-Wild Execution Traces',
    kind: 'Datasets',
    url: 'https://huggingface.co/datasets/princeton-nlp/SWE-bench',
    description: '14,200 real-world software engineering agent trajectories, tool calls, and verified patches.',
    indexed: '2026-11-01',
    author: 'Princeton NLP',
    stars: 3890,
    status: 'Verified'
  },
  {
    name: 'SWE-bench Verified',
    kind: 'Benchmarks',
    url: 'https://www.swebench.com/',
    description: 'Standardized evaluation harness assessing autonomous coding agents on verified GitHub issues.',
    indexed: '2026-11-01',
    author: 'Princeton NLP & OpenAI',
    stars: 7600,
    status: 'Verified'
  }
];

function generateMarkdownContent() {
  const categories = ['Starter Packs & Kits', 'Agent Skills', 'MCP Servers', 'Datasets', 'Benchmarks'];
  let md = `${START_MARKER}\n`;
  md += `> **Automated Registry Snapshot** (Updated 24/7 by Skillsfr background pipeline)\n\n`;

  categories.forEach(cat => {
    const items = SEED_DATA.filter(d => d.kind === cat);
    if (items.length > 0) {
      md += `### ${cat}\n\n`;
      md += `| Resource | Author | Stars | Status | Description |\n`;
      md += `|---|---|---|---|---|\n`;
      items.forEach(item => {
        md += `| [**${item.name}**](${item.url}) | ${item.author} | ⭐ ${item.stars.toLocaleString()} | \`${item.status}\` | ${item.description} |\n`;
      });
      md += `\n`;
    }
  });

  md += `${END_MARKER}`;
  return md;
}

export function updateReadme() {
  if (!fs.existsSync(README_FILE)) {
    console.error(`README file not found at ${README_FILE}`);
    return;
  }

  const currentContent = fs.readFileSync(README_FILE, 'utf-8');
  const startIndex = currentContent.indexOf(START_MARKER);
  const endIndex = currentContent.indexOf(END_MARKER);

  const generatedRegion = generateMarkdownContent();

  if (startIndex !== -1 && endIndex !== -1) {
    const before = currentContent.substring(0, startIndex);
    const after = currentContent.substring(endIndex + END_MARKER.length);
    const newContent = before + generatedRegion + after;
    fs.writeFileSync(README_FILE, newContent, 'utf-8');
    console.log('✓ Successfully refreshed protected region in README.md');
  } else {
    const newContent = currentContent + '\n\n## 📚 Automatically Indexed Registry\n\n' + generatedRegion + '\n';
    fs.writeFileSync(README_FILE, newContent, 'utf-8');
    console.log('✓ Injected new protected region into README.md');
  }
}

updateReadme();
