# Skillsfr (Skills for Real)

> **A centralized, community-driven developer resource registry:** A discovery, evaluation, and assembly platform where developers and autonomous AI agents find, evaluate, combine, and deploy MCP servers, agent skills, datasets, benchmarks, and curated starter packs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Registry Status](https://img.shields.io/badge/Registry-Online-success.svg)](https://skillsfr.vercel.app)
[![24/7 Crawler](https://img.shields.io/badge/24%2F7%20Crawler-Active-brightgreen.svg)](#-247-continuous-automation)

---

## 🌟 The Five Dimensions of Skillsfr

1. **MCPs** — Standardized capabilities, external tools, and service integrations for AI agents.
2. **Skills** — Reusable instructions, workflows, domain knowledge, and behavioral constraints.
3. **Datasets** — Verified data for model training, trajectory fine-tuning, RAG, and agent experimentation.
4. **Benchmarks** — Standardized evaluation harnesses, test suites, and leaderboards.
5. **Starter Packs & Curated Kits** — Intelligently composed, conflict-free resource combinations with automated lockfiles (e.g. `skillsfr/ui-ux`, `skillsfr/frontend-agent`).

---

## 🚀 Quickstart CLI

Skillsfr includes a universal dynamic starter CLI to scaffold projects for **any** language or framework, and install verified AI agent kits:

```bash
# Dynamic Language & Framework Starters
npx skillsfr nextjs my-dashboard
npx skillsfr react my-vite-app
npx skillsfr python my-api
npx skillsfr rust my-tool
npx skillsfr go my-service
npx skillsfr flutter my-mobile-app

# Agent Kit Installation
npx skills add skillsfr/agent         # Installs the Skillsfr Intent Router
npx skillsfr install ui-ux             # Installs the Curated UI/UX Kit
npx skillsfr install frontend-agent    # Installs Full-Stack Frontend Agent

# Intent Resolver (Minimal Token Retrieval)
npx skillsfr resolve "Build an accessible Next.js dashboard with animations"
```

---

<!-- SKILLSFR:REGISTRY:START -->
> **Automated Registry Snapshot** (Updated 24/7 by Skillsfr background pipeline)

### Starter Packs & Kits

| Resource | Author | Stars | Status | Description |
|---|---|---|---|---|
| [**Skillsfr UI/UX Agent Kit**](https://github.com/itsjustayush/skillsfr) | Skillsfr Core | ⭐ 3,420 | `Runtime-Tested` | Composed, conflict-free UI/UX guidance: Anthropic design principles, ibelick micro-interactions, and WCAG accessibility. |

### Agent Skills

| Resource | Author | Stars | Status | Description |
|---|---|---|---|---|
| [**Anthropic Frontend Design Skill**](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Anthropic | ⭐ 12,850 | `Security-Reviewed` | Official Anthropic skill to design bespoke, responsive, and distinctive interfaces without generic AI tropes. |
| [**iBelick Modern UI Skills**](https://github.com/ibelick/ui-skills) | ibelick | ⭐ 8,430 | `Verified` | Tactile interaction craft, spring curves, micro-animations, and fluid responsive styling. |

### MCP Servers

| Resource | Author | Stars | Status | Description |
|---|---|---|---|---|
| [**Official GitHub MCP Server**](https://github.com/modelcontextprotocol/servers/tree/main/src/github) | Model Context Protocol | ⭐ 18,400 | `Security-Reviewed` | Enables AI agents to query issues, open pull requests, and commit code directly. |
| [**PostgreSQL Database MCP Server**](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) | Model Context Protocol | ⭐ 12,100 | `Security-Reviewed` | Safe schema inspection, EXPLAIN query optimization, and migration generation for PostgreSQL. |
| [**Playwright Browser Automation MCP**](https://github.com/executeautomation/mcp-playwright) | ExecuteAutomation | ⭐ 8,920 | `Runtime-Tested` | Full browser control, click/type actions, screenshots, and visual regression tests. |

### Datasets

| Resource | Author | Stars | Status | Description |
|---|---|---|---|---|
| [**SWE-bench In-The-Wild Execution Traces**](https://huggingface.co/datasets/princeton-nlp/SWE-bench) | Princeton NLP | ⭐ 3,890 | `Verified` | 14,200 real-world software engineering agent trajectories, tool calls, and verified patches. |

### Benchmarks

| Resource | Author | Stars | Status | Description |
|---|---|---|---|---|
| [**SWE-bench Verified**](https://www.swebench.com/) | Princeton NLP & OpenAI | ⭐ 7,600 | `Verified` | Standardized evaluation harness assessing autonomous coding agents on verified GitHub issues. |

<!-- SKILLSFR:REGISTRY:END -->

---

## 📐 Mathematical Ranking & Categorization Model

Skillsfr eliminates credit waste and avoids calling expensive LLMs for basic indexing decisions. It uses transparent deterministic mathematical formulas:

### 1. Deterministic Categorization Score
$$\text{category\_score}(c, r) = 0.45 \cdot K + 0.25 \cdot M + 0.15 \cdot T + 0.10 \cdot D + 0.05 \cdot F$$
- $K$: Keyword and lexical frequency match
- $M$: Manifest & `SKILL.md` schema compliance
- $T$: Topic and repository tag alignment
- $D$: Dependency matching (e.g. `@modelcontextprotocol/sdk`)
- $F$: Community confirmation signals

### 2. Multi-Signal Ranking Score
$$\text{final\_score} = 0.30 \cdot \text{Rel} + 0.20 \cdot \text{Comp} + 0.15 \cdot \text{Maint} + 0.12 \cdot \text{Verif} + 0.10 \cdot \text{Doc} + 0.08 \cdot \text{Auth} + 0.05 \cdot \text{Pop} - \text{Penalty}$$

- **Log-Scaled Popularity**: $\text{popularity} = 100 \cdot \frac{\ln(1 + \text{stars})}{\ln(1 + 25000)}$
- **Bayesian Smoothed Community Rating**: $S = \frac{v}{v + m} R + \frac{m}{v + m} C$ (where $C = 4.72$, $m = 25$).

---

## 🤖 Intent Router & Minimal Context Architecture

Skillsfr avoids the dangerous anti-pattern of dumping every indexed skill into an agent's context window. Instead, `skillsfr/agent` functions as an **Intent Router**:

```text
User Request: "Build an accessible, responsive Next.js dashboard"
       │
       ▼
Skillsfr Intent Router
       ├── Analyzes intent vectors & constraints
       ├── Evaluates ranking & compatibility
       ├── Selects 3 minimal matching skills:
       │     1. Anthropic Frontend Design
       │     2. iBelick Modern UI Skills
       │     3. Web Design Guidelines
       ├── Excludes 14 unrelated skills
       └── Deduplicates overlapping guidance
       │
       ▼
Result: 4,200 tokens (88% reduction vs 38,400 raw dump)
```

---

## 🔄 Real-time Multi-Platform Sync Engine

Skillsfr continuously monitors and synchronizes open-source repositories, datasets, and benchmark manifests across the Internet:

| Platform | Resource Dimensions | Ingestion Mechanism | Requirements |
|---|---|---|---|
| **GitHub** | MCP Servers, Agent Skills, Starter Packs | Search API (`mcp server`, `topic:agent-skills`) & Webhooks | Public (60 req/hr) or `GITHUB_TOKEN` (5,000 req/hr) |
| **Hugging Face** | Evaluation Datasets, Leaderboards, Models | Hub API (`/api/datasets?search=agent`) | Free Read API or optional `HF_TOKEN` |
| **Kaggle** | Datasets & Ground Truth Benchmarks | Public Metadata Feeds & API Mirrors | Optional `KAGGLE_USERNAME` & `KAGGLE_KEY` |
| **Smithery / OpenML** | MCP Tool Manifests & Open Benchmarks | Open-Source JSON Endpoints & Mirrors | Zero credentials required |

### Run Real-time Sync Locally

```bash
# Execute full discovery sweep across GitHub and Hugging Face, then update README
npm run sync

# Regenerate README from registry cache
npm run refresh-readme
```

### 24/7 Serverless Automation Options

1. **GitHub Actions Scheduled Cron** (Included out of the box in `.github/workflows/skillsfr-refresh.yml`):
   - Runs every 6 hours (configurable to hourly).
   - Automatically crawls upstream sources, computes multi-signal scores, and commits fresh updates back to the repository with zero server overhead.
2. **Vercel Serverless Sync & Crons** (Configured in `vercel.json` and `api/sync.ts`):
   - Triggers `GET /api/sync` on an automated interval.
3. **Instant Webhooks** (Configured in `api/webhooks.ts`):
   - Point GitHub repository webhooks to `https://skillsfr.vercel.app/api/webhooks/registry` for instant re-indexing on pushes or releases.

---

## 📄 License

MIT © [Ayush](https://github.com/itsjustayush)
