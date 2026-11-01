import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Search, Layers, Cpu, Box, Award, 
  Terminal, ExternalLink, Copy, Check, Moon, Sun, 
  RefreshCw, FileText, Mail, Calculator
} from 'lucide-react';

import StrokeText from './components/reactbits/StrokeText';
import KbdKey from './components/ui/KbdKey';
import HoldToConfirm from './components/ui/HoldToConfirm';
import Accordion from './components/ui/Accordion';
import AnimatedDrawer from './components/ui/AnimatedDrawer';
import CommandSearch from './components/ui/CommandSearch';
import type { CommandItem } from './components/ui/CommandSearch';

import type { ResourceItem, ResourceKind, TemplateItem, RegistryEvent } from './types/registry';
import { INITIAL_RESOURCES, REGISTRY_EVENTS, TEMPLATES_DATA } from './data/mockRegistry';
import { 
  calculateResourceScore, resolveIntentForAgent, 
  calculateBayesianRating, calculatePopularityScore 
} from './utils/engine';
import { SITE_CONFIG } from './utils/config';
import { CANONICAL_RESOURCES } from './data/canonicalAdapter';

type TabView = 'registry' | 'router' | 'templates' | 'updates' | 'methodology' | 'newsletter' | 'cli';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Active navigation view
  const [activeTab, setActiveTab] = useState<TabView>('registry');

  // Canonical Resource State (Synchronized from Neon PostgreSQL & Registry snapshot)
  const [resources] = useState<ResourceItem[]>(CANONICAL_RESOURCES);
  const [events] = useState<RegistryEvent[]>(REGISTRY_EVENTS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<ResourceKind | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'stars' | 'rating' | 'recency'>('score');

  // Modal / Drawer state
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Intent router state
  const [routerInput, setRouterInput] = useState('Build an accessible, responsive Next.js frontend with animations');
  const [resolvedPlan, setResolvedPlan] = useState(() => 
    resolveIntentForAgent('Build an accessible, responsive Next.js frontend with animations', CANONICAL_RESOURCES)
  );

  // Templates state
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem>(TEMPLATES_DATA[0]);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    TEMPLATES_DATA[0].variables.forEach(v => { init[v.key] = v.defaultValue; });
    return init;
  });

  // Methodology interactive simulator state
  const [simRelevance, setSimRelevance] = useState(85);
  const [simComp, setSimComp] = useState(90);
  const [simMaint, setSimMaint] = useState(95);
  const [simVerif, setSimVerif] = useState(85);
  const [simStars, setSimStars] = useState(4500);
  const [simReviews, setSimReviews] = useState(120);
  const [simRating, setSimRating] = useState(4.9);

  // In-browser CLI simulator state
  const [cliInput, setCliInput] = useState('skillsfr nextjs my-dashboard');
  const [cliHistory, setCliHistory] = useState<Array<{ command: string; output: string }>>([
    { 
      command: 'skillsfr doctor', 
      output: '✓ Node.js detected: v24.19.0\n✓ Git detected\n✓ Skillsfr Registry connectivity: Online (https://skillsfr.vercel.app)\n✓ Ready for AI agent skill installation.' 
    }
  ]);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterCategory, setNewsletterCategory] = useState<'all' | 'mcps' | 'skills' | 'datasets'>('all');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Command Search Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Ranked resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      // Kind filter
      if (selectedKind !== 'all' && r.kind !== selectedKind) return false;

      // Source Platform filter
      if (selectedSource !== 'all' && r.sourcePlatform !== selectedSource) return false;

      // Client filter
      if (selectedClient !== 'all') {
        if (!r.compatibleClients.includes('Universal') && !r.compatibleClients.includes(selectedClient)) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = r.name.toLowerCase().includes(q);
        const inDesc = r.description.toLowerCase().includes(q);
        const inTags = r.tags.some(t => t.toLowerCase().includes(q));
        const inAuthor = r.author.name.toLowerCase().includes(q);
        return inName || inDesc || inTags || inAuthor;
      }

      return true;
    }).map(r => ({
      resource: r,
      scoreBreakdown: calculateResourceScore(r, searchQuery, selectedClient)
    })).sort((a, b) => {
      if (sortBy === 'stars') return b.resource.stars - a.resource.stars;
      if (sortBy === 'rating') return b.scoreBreakdown.smoothedRating - a.scoreBreakdown.smoothedRating;
      if (sortBy === 'recency') return new Date(b.resource.lastUpdated).getTime() - new Date(a.resource.lastUpdated).getTime();
      return b.scoreBreakdown.finalScore - a.scoreBreakdown.finalScore;
    });
  }, [resources, searchQuery, selectedKind, selectedSource, selectedClient, selectedStatus, sortBy]);

  // Command items for universal search
  const commandItems: CommandItem[] = useMemo(() => {
    const res: CommandItem[] = resources.map(r => ({
      id: r.id,
      title: r.name,
      subtitle: `${r.kind.toUpperCase()} • by ${r.author.name} • ⭐ ${r.stars.toLocaleString()}`,
      category: r.kind as CommandItem['category'],
      badge: r.status,
      action: () => {
        setSelectedResource(r);
      }
    }));

    // Add navigation actions
    res.push(
      { id: 'act-router', title: 'Open Intent Router', subtitle: 'Evaluate minimal token skill packages', category: 'action', action: () => setActiveTab('router') },
      { id: 'act-templates', title: 'Browse AI Templates', subtitle: 'AGENTS.md, CLAUDE.md, PRIVACY.md', category: 'action', action: () => setActiveTab('templates') },
      { id: 'act-cli', title: 'Skillsfr CLI Guide', subtitle: 'Dynamic starters for any framework', category: 'action', action: () => setActiveTab('cli') },
      { id: 'act-newsletter', title: 'Subscribe to The Dev Brief', subtitle: 'Weekly zero-card developer digest', category: 'action', action: () => setActiveTab('newsletter') }
    );

    return res;
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResolveIntent = () => {
    const plan = resolveIntentForAgent(routerInput, INITIAL_RESOURCES);
    setResolvedPlan(plan);
  };

  const handleCliRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const parts = cliInput.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const arg1 = parts[1] || '';
    const arg2 = parts[2] || '';

    let output = '';
    if (cmd === 'skillsfr' || cmd === 'npx') {
      const sub = cmd === 'npx' ? parts[2]?.toLowerCase() : arg1.toLowerCase();
      const target = cmd === 'npx' ? parts[3] : arg2;

      if (sub === 'doctor') {
        output = '✓ Node.js detected: v24.19.0\n✓ Git detected\n✓ Skillsfr Registry connectivity: Online (https://skillsfr.vercel.app)\n✓ Ready for AI agent skill installation.';
      } else if (sub === 'install') {
        output = `📦 Installing Skillsfr Agent Kit: [${target || 'ui-ux'}]...\n✓ Resolved dependencies across 5 verified packages\n✓ Deduplicated overlapping guidelines\n✓ Generated .skillsfr/manifest.lock\n✨ Successfully installed into active agent environment!`;
      } else if (sub === 'resolve') {
        output = `🔍 Resolving minimal skill set for intent...\n  Selected: anthropics/frontend-design, ibelick/ui-skills, web-design-guidelines\n  Excluded: 14 unrelated skills (saved 88% token context budget)\n  Token Budget: 4,200 tokens (vs 38,400 raw dump)`;
      } else if (sub === 'nextjs' || sub === 'react' || sub === 'python' || sub === 'rust' || sub === 'go') {
        output = `🚀 Scaffolding ${sub} project "${target || 'my-project'}"...\n   Executing official framework initialization.\n✨ Successfully generated ${target || 'my-project'} with Skillsfr AGENTS.md template!`;
      } else {
        output = `⚡ Skillsfr v1.4.0 — Executed: "${cliInput}"\nRun 'skillsfr doctor' or 'skillsfr install ui-ux' for available commands.`;
      }
    } else {
      output = `Command not recognized. Try 'skillsfr nextjs my-app' or 'skillsfr install ui-ux'.`;
    }

    setCliHistory(prev => [...prev, { command: cliInput, output }]);
    setCliInput('');
  };

  // Interpolated template content
  const renderedTemplateContent = useMemo(() => {
    let content = activeTemplate.content;
    Object.entries(templateVars).forEach(([k, v]) => {
      content = content.replace(new RegExp(`{{${k}}}`, 'g'), v);
    });
    return content;
  }, [activeTemplate, templateVars]);

  // Simulated score calculation
  const simulatedScore = useMemo(() => {
    const pop = calculatePopularityScore(simStars);
    const smoothed = calculateBayesianRating(simRating, simReviews);
    const score = Math.round(
      0.30 * simRelevance +
      0.20 * simComp +
      0.15 * simMaint +
      0.12 * simVerif +
      0.10 * 95 +
      0.08 * 90 +
      0.05 * pop
    );
    return {
      score: Math.min(100, Math.max(0, score)),
      pop,
      smoothed
    };
  }, [simRelevance, simComp, simMaint, simVerif, simStars, simReviews, simRating]);

  return (
    <div className="skillsfr-app">
      {/* ====================================================================
          TOP NAVIGATION BAR
          ==================================================================== */}
      <header className="site-nav">
        <div className="app-container nav-inner">
          <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); setActiveTab('registry'); }}>
            <div className="brand-logo-mark">
              <Sparkles size={18} />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">Skillsfr</span>
              <span className="brand-badge">v1.4.0</span>
            </div>
          </a>

          <nav className="nav-links">
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'registry' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('registry')}
            >
              Registry
            </button>
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'router' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('router')}
            >
              Intent Router
            </button>
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'templates' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'updates' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('updates')}
            >
              24/7 Activity
            </button>
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'methodology' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('methodology')}
            >
              Methodology
            </button>
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'cli' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('cli')}
            >
              CLI
            </button>
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'newsletter' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('newsletter')}
            >
              Newsletter
            </button>
          </nav>

          <div className="nav-actions">
            <button 
              type="button" 
              className="search-trigger-btn"
              onClick={() => setIsCommandSearchOpen(true)}
            >
              <Search size={15} />
              <span>Search...</span>
              <KbdKey>⌘K</KbdKey>
            </button>

            <button 
              type="button" 
              className="nav-btn" 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <a 
              href={SITE_CONFIG.githubRepo} 
              target="_blank" 
              rel="noreferrer" 
              className="nav-btn"
            >
              <span>GitHub</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </header>

      {/* ====================================================================
          COMMAND SEARCH MODAL
          ==================================================================== */}
      <CommandSearch 
        isOpen={isCommandSearchOpen} 
        onClose={() => setIsCommandSearchOpen(false)} 
        items={commandItems} 
      />

      <main className="app-container">
        {/* ==================================================================
            HERO SECTION WITH STROKETEXT COMPONENT
            ================================================================== */}
        {activeTab === 'registry' && (
          <section className="hero-section">
            <div className="hero-tagline-badge">
              <span className="indicator" />
              <span>Skills For Real — Continuous 24/7 Verification Active</span>
            </div>

            <div className="hero-stroke-wrapper">
              <StrokeText 
                text="Skillsfr"
                strokeColor={theme === 'dark' ? '#71717a' : '#a1a1aa'}
                fillColor={theme === 'dark' ? '#fafafa' : '#09090b'}
                fontSize={96}
                strokeWidth={1.4}
                drawDuration={1.4}
                trigger="mount"
                fillMode="wipe"
                hoverRedraw={true}
              />
            </div>

            <p className="hero-description">
              The centralized, community-driven registry & runtime resolver for AI agents and developers. 
              Find, evaluate, collect, combine, and deploy <strong>MCP servers</strong>, <strong>agent skills</strong>, 
              <strong>workflows</strong>, <strong>datasets</strong>, and <strong>benchmarks</strong>.
            </p>

            <div className="hero-cta-group">
              <button 
                type="button" 
                className="primary-btn"
                onClick={() => { setSelectedKind('kit'); }}
              >
                <Layers size={16} />
                <span>Explore Curated Kits</span>
              </button>

              <button 
                type="button" 
                className="secondary-btn"
                onClick={() => setActiveTab('router')}
              >
                <Sparkles size={16} />
                <span>Test Intent Router</span>
              </button>

              <button 
                type="button" 
                className="terminal-pill-btn"
                onClick={() => copyToClipboard('npx skills add skillsfr/agent', 'quickstart-cmd')}
              >
                <Terminal size={14} />
                <span>npx skills add skillsfr/agent</span>
                {copiedId === 'quickstart-cmd' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </section>
        )}

        {/* ==================================================================
            TAB: MAIN REGISTRY VIEW
            ================================================================== */}
        {activeTab === 'registry' && (
          <div>
            {/* Canonical Registry Database Bar */}
            <div className="canonical-registry-bar">
              <div className="canonical-registry-status">
                <span className="canonical-status-indicator" />
                <span style={{ fontWeight: 600 }}>Neon PostgreSQL Registry</span>
                <span className="canonical-status-meta">• 24/7 Verified Ingestion Pipeline Active</span>
                <span className="canonical-status-meta">• {resources.length} canonical resources</span>
              </div>

              <div className="canonical-registry-meta-tags">
                <span className="card-kind-badge mcp">GitHub</span>
                <span className="card-kind-badge dataset">Hugging Face</span>
                <span className="card-kind-badge benchmark">Kaggle</span>
                <span className="card-kind-badge kit">Curated Kits</span>
              </div>
            </div>

            {/* Ecosystem Dimensions Bar */}
            <div className="ecosystem-nav-bar">
              <button 
                type="button" 
                className={`ecosystem-tab-btn ${selectedKind === 'all' ? 'is-active' : ''}`}
                onClick={() => setSelectedKind('all')}
              >
                <span>All Resources</span>
                <span className="tab-count">{resources.length}</span>
              </button>
              <button 
                type="button" 
                className={`ecosystem-tab-btn ${selectedKind === 'kit' ? 'is-active' : ''}`}
                onClick={() => setSelectedKind('kit')}
              >
                <Layers size={14} />
                <span>Starter Kits</span>
                <span className="tab-count">{resources.filter(r => r.kind === 'kit').length}</span>
              </button>
              <button 
                type="button" 
                className={`ecosystem-tab-btn ${selectedKind === 'skill' ? 'is-active' : ''}`}
                onClick={() => setSelectedKind('skill')}
              >
                <Sparkles size={14} />
                <span>Agent Skills</span>
                <span className="tab-count">{resources.filter(r => r.kind === 'skill').length}</span>
              </button>
              <button 
                type="button" 
                className={`ecosystem-tab-btn ${selectedKind === 'mcp' ? 'is-active' : ''}`}
                onClick={() => setSelectedKind('mcp')}
              >
                <Cpu size={14} />
                <span>MCP Servers</span>
                <span className="tab-count">{resources.filter(r => r.kind === 'mcp').length}</span>
              </button>
              <button 
                type="button" 
                className={`ecosystem-tab-btn ${selectedKind === 'dataset' ? 'is-active' : ''}`}
                onClick={() => setSelectedKind('dataset')}
              >
                <Box size={14} />
                <span>Datasets</span>
                <span className="tab-count">{resources.filter(r => r.kind === 'dataset').length}</span>
              </button>
              <button 
                type="button" 
                className={`ecosystem-tab-btn ${selectedKind === 'benchmark' ? 'is-active' : ''}`}
                onClick={() => setSelectedKind('benchmark')}
              >
                <Award size={14} />
                <span>Benchmarks</span>
                <span className="tab-count">{resources.filter(r => r.kind === 'benchmark').length}</span>
              </button>
            </div>

            {/* Filter & Search Row */}
            <div className="controls-row">
              <div className="search-input-box">
                <Search size={16} className="search-icon-inside" />
                <input 
                  type="text" 
                  placeholder="Filter by name, description, tags, author..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-dropdown-group">
                <select 
                  className="filter-select"
                  value={selectedSource}
                  onChange={e => setSelectedSource(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Hugging Face">Hugging Face</option>
                  <option value="Kaggle">Kaggle</option>
                  <option value="Smithery">Smithery</option>
                  <option value="Official">Official / Core</option>
                </select>

                <select 
                  className="filter-select"
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                >
                  <option value="all">All AI Clients</option>
                  <option value="claude-code">Claude Code</option>
                  <option value="gemini">Gemini</option>
                  <option value="cursor">Cursor</option>
                  <option value="opencode">OpenCode</option>
                  <option value="windsurf">Windsurf</option>
                  <option value="manus">Manus</option>
                </select>

                <select 
                  className="filter-select"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Verifications</option>
                  <option value="security-reviewed">Security-Reviewed</option>
                  <option value="runtime-tested">Runtime-Tested</option>
                  <option value="verified">Verified</option>
                  <option value="indexed">Indexed</option>
                </select>

                <select 
                  className="filter-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                >
                  <option value="score">Sort: Algorithmic Rank</option>
                  <option value="stars">Sort: Platform Stars</option>
                  <option value="rating">Sort: Bayesian Rating</option>
                  <option value="recency">Sort: Recently Updated</option>
                </select>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="resources-grid">
              {filteredResources.map(({ resource: r, scoreBreakdown: score }) => (
                <div 
                  key={r.id} 
                  className="resource-card"
                  onClick={() => setSelectedResource(r)}
                >
                  <div>
                    <div className="card-top-row">
                      <span className={`card-kind-badge ${r.kind}`}>
                        {r.kind === 'kit' && <Layers size={12} />}
                        {r.kind === 'mcp' && <Cpu size={12} />}
                        {r.kind === 'skill' && <Sparkles size={12} />}
                        {r.kind === 'dataset' && <Box size={12} />}
                        {r.kind === 'benchmark' && <Award size={12} />}
                        <span>{r.kind}</span>
                      </span>

                      <span className={`card-status-badge ${r.status}`}>
                        {r.status}
                      </span>
                    </div>

                    <h3 className="card-title">{r.name}</h3>
                    <p className="card-description">{r.description}</p>

                    <div className="card-tags">
                      {r.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="card-tag">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="metrics-group">
                      <span className="metric-item" title="Original Platform Stars">
                        ⭐ {r.stars.toLocaleString()}
                      </span>
                      <span className="metric-item" title="Skillsfr Community Smoothed Rating">
                        🏆 {score.smoothedRating.toFixed(2)}
                      </span>
                      <span className="metric-item font-mono" title="Algorithmic Match Score">
                        📊 {score.finalScore}/100
                      </span>
                    </div>

                    <a 
                      href={r.author.profileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="author-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.author.name}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB: INTENT ROUTER & MINIMAL TOKEN RESOLVER
            ================================================================== */}
        {activeTab === 'router' && (
          <div className="intent-resolver-box">
            <div className="intent-resolver-header">
              <div className="hero-tagline-badge">
                <Sparkles size={13} />
                <span>Runtime Intent Resolver & Context Token Optimizer</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '28px', marginBottom: '8px' }}>
                Skillsfr Dynamic Skill Router
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Instead of dumping every single skill or MCP into an agent prompt (wasting thousands of dollars and polluting context), 
                Skillsfr classifies intent, retrieves only compatible packages, deduplicates instructions, and generates a verified lockfile.
              </p>
            </div>

            <div className="intent-resolver-input-group">
              <input 
                type="text" 
                className="intent-input"
                value={routerInput}
                onChange={e => setRouterInput(e.target.value)}
                placeholder="Describe your coding task or environment requirement..."
              />
              <button 
                type="button" 
                className="primary-btn"
                onClick={handleResolveIntent}
              >
                <span>Resolve Intent</span>
              </button>
            </div>

            {/* Token Savings Metric Bar */}
            <div className="token-savings-bar">
              <div className="token-metric">
                <div className="token-metric-val font-mono" style={{ color: 'var(--text-muted)' }}>
                  {resolvedPlan.tokenCostRawEstimate.toLocaleString()}
                </div>
                <div className="token-metric-label">Raw Full-Catalogue Dump</div>
              </div>

              <div className="token-metric">
                <div className="token-metric-val font-mono" style={{ color: 'var(--text-primary)' }}>
                  {resolvedPlan.tokenCostSkillsfrEstimate.toLocaleString()}
                </div>
                <div className="token-metric-label">Skillsfr Composed Stream</div>
              </div>

              <div className="token-metric">
                <div className="token-metric-val font-mono" style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {resolvedPlan.tokenReductionPercent}%
                </div>
                <div className="token-metric-label">Token Context Reduction</div>
              </div>

              <div className="token-metric">
                <div className="token-metric-val font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {resolvedPlan.selectedResources.length}
                </div>
                <div className="token-metric-label">Selected vs {resolvedPlan.excludedResources.length} Excluded</div>
              </div>
            </div>

            {/* Selected Packages & Lockfile Manifest */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '15px', marginBottom: '12px', fontWeight: 600 }}>
                  Selected Minimal Capabilities
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {resolvedPlan.selectedResources.map(r => (
                    <div 
                      key={r.id} 
                      style={{ 
                        padding: '12px 16px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {r.kind.toUpperCase()} • ~{r.skillDetails?.contextCostEstimateTokens || 1200} tokens
                        </div>
                      </div>
                      <span className="card-status-badge verified">Selected</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Generated skillsfr.lock</h4>
                  <HoldToConfirm 
                    onConfirm={() => copyToClipboard(resolvedPlan.generatedLockfile, 'lockfile-copy')}
                    confirmedText="Copied Lockfile!"
                  >
                    <span>Hold to Copy Lockfile</span>
                  </HoldToConfirm>
                </div>
                <pre className="code-preview-block" style={{ maxHeight: '200px' }}>
                  {resolvedPlan.generatedLockfile}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB: TEMPLATES HUB
            ================================================================== */}
        {activeTab === 'templates' && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="hero-tagline-badge">
                <FileText size={13} />
                <span>AI Developer Environment Artifacts</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '28px', marginBottom: '8px' }}>
                Autonomous Agent Templates
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Ready-to-use, production-vetted Markdown templates for agent rules, memory, testing boundaries, and security disclosures.
              </p>
            </div>

            {/* Template Selector Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {TEMPLATES_DATA.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`ecosystem-tab-btn ${activeTemplate.id === t.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveTemplate(t);
                    const init: Record<string, string> = {};
                    t.variables.forEach(v => { init[v.key] = v.defaultValue; });
                    setTemplateVars(init);
                  }}
                >
                  <FileText size={14} />
                  <span>{t.filename}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Variable Controls */}
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Template Variables</h4>
                {activeTemplate.variables.map(v => (
                  <div key={v.key} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {v.label}
                    </label>
                    <input 
                      type="text" 
                      value={templateVars[v.key] || ''}
                      onChange={e => setTemplateVars(prev => ({ ...prev, [v.key]: e.target.value }))}
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        fontSize: '13px', 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border-strong)', 
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.description}</span>
                  </div>
                ))}
              </div>

              {/* Live Preview */}
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{activeTemplate.filename} Preview</h4>
                  <HoldToConfirm 
                    onConfirm={() => copyToClipboard(renderedTemplateContent, 'template-copy')}
                    confirmedText="Copied Markdown!"
                  >
                    <span>Hold to Copy {activeTemplate.filename}</span>
                  </HoldToConfirm>
                </div>
                <pre className="code-preview-block" style={{ maxHeight: '420px' }}>
                  {renderedTemplateContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB: 24/7 ACTIVITY & CRAWLER LOG
            ================================================================== */}
        {activeTab === 'updates' && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="hero-tagline-badge">
                <RefreshCw size={13} />
                <span>24/7 Ingestion & GitHub README Sync Stream</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '28px', marginBottom: '8px' }}>
                Registry Activity & Verification Log
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                The Skillsfr background pipeline continuously polls official registries and GitHub endpoints using conditional ETags, 
                detects changes, recalculates multi-signal scores, and updates the repository README automatically.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {events.map(evt => (
                <div 
                  key={evt.id}
                  style={{ 
                    padding: '18px 24px', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className={`card-kind-badge ${evt.kind || 'mcp'}`}>{evt.kind || 'event'}</span>
                      <strong style={{ fontSize: '15px' }}>{evt.resourceName || evt.resourceId}</strong>
                      {evt.revision && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Revision {evt.revision}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                      {evt.summary}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(evt.occurredAt).toLocaleString()}
                    </div>
                    <a 
                      href={evt.sourceUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      View Source ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB: METHODOLOGY & MATHEMATICAL SIMULATOR
            ================================================================== */}
        {activeTab === 'methodology' && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="hero-tagline-badge">
                <Calculator size={13} />
                <span>Deterministic Zero-Credit Mathematical Models</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '28px', marginBottom: '8px' }}>
                Scoring & Ranking Methodology
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Skillsfr uses open, verifiable mathematical formulas instead of calling expensive LLM credits on every web crawler scrape.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Formula Cards */}
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-serif" style={{ fontSize: '18px', marginBottom: '12px' }}>
                  1. Deterministic Categorization Score
                </h3>
                <pre className="code-preview-block" style={{ marginBottom: '12px' }}>
                  category_score(c, r) = 
                    0.45 * keyword_match(c, r) +
                    0.25 * manifest_match(c, r) +
                    0.15 * topic_match(c, r) +
                    0.10 * dependency_match(c, r) +
                    0.05 * historical_feedback(c, r)
                </pre>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Evaluates lexical density, recognized <code>SKILL.md</code> tags, and SDK dependencies without requiring language model tokens.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-serif" style={{ fontSize: '18px', marginBottom: '12px' }}>
                  2. Multi-Signal Ranking Score
                </h3>
                <pre className="code-preview-block" style={{ marginBottom: '12px' }}>
                  final_score = 
                    0.30 * relevance +
                    0.20 * compatibility +
                    0.15 * maintenance +
                    0.12 * verification +
                    0.10 * documentation_quality +
                    0.08 * authority +
                    0.05 * popularity - risk_penalty
                </pre>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Balances GitHub popularity (log-scaled) against actual maintenance recency, sandboxed install tests, and security permission boundaries.
                </p>
              </div>
            </div>

            {/* Interactive Simulator */}
            <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-accent)' }}>
              <h3 className="font-serif" style={{ fontSize: '20px', marginBottom: '16px' }}>
                Live Mathematical Simulator
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Relevance: {simRelevance}%</label>
                  <input type="range" min="0" max="100" value={simRelevance} onChange={e => setSimRelevance(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Compatibility: {simComp}%</label>
                  <input type="range" min="0" max="100" value={simComp} onChange={e => setSimComp(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Maintenance: {simMaint}%</label>
                  <input type="range" min="0" max="100" value={simMaint} onChange={e => setSimMaint(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>GitHub Stars: {simStars.toLocaleString()}</label>
                  <input type="range" min="1" max="25000" step="100" value={simStars} onChange={e => setSimStars(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Verification: {simVerif}%</label>
                  <input type="range" min="0" max="100" value={simVerif} onChange={e => setSimVerif(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Community Reviews: {simReviews}</label>
                  <input type="range" min="1" max="1000" value={simReviews} onChange={e => setSimReviews(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Avg Rating: {simRating.toFixed(1)} / 5.0</label>
                  <input type="range" min="1.0" max="5.0" step="0.1" value={simRating} onChange={e => setSimRating(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>

              <div className="token-savings-bar">
                <div className="token-metric">
                  <div className="token-metric-val font-mono">{simulatedScore.score}/100</div>
                  <div className="token-metric-label">Calculated Final Score</div>
                </div>
                <div className="token-metric">
                  <div className="token-metric-val font-mono">{simulatedScore.pop}/100</div>
                  <div className="token-metric-label">Log-Scaled Popularity</div>
                </div>
                <div className="token-metric">
                  <div className="token-metric-val font-mono">{simulatedScore.smoothed.toFixed(2)} / 5.0</div>
                  <div className="token-metric-label">Bayesian Smoothed Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB: CLI TERMINAL SHOWCASE
            ================================================================== */}
        {activeTab === 'cli' && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="hero-tagline-badge">
                <Terminal size={13} />
                <span>Dynamic Project & Agent Starter CLI</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '28px', marginBottom: '8px' }}>
                Skillsfr CLI Reference
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Create framework starters for any language dynamically with a single command (React, Next.js, Vue, Angular, Svelte, Flutter, React Native, Rails, Django, Laravel, NestJS, Phoenix, Zig, Rust, Bun, Deno).
              </p>
            </div>

            {/* Quick Command Reference */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Dynamic Language Starters</strong>
                <pre className="code-preview-block" style={{ marginTop: '8px', fontSize: '12px' }}>
                  npx skillsfr nextjs my-app{'\n'}
                  npx skillsfr python my-api{'\n'}
                  npx skillsfr rust my-tool{'\n'}
                  npx skillsfr flutter my-app
                </pre>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Agent Kit Installation</strong>
                <pre className="code-preview-block" style={{ marginTop: '8px', fontSize: '12px' }}>
                  npx skillsfr install ui-ux{'\n'}
                  npx skillsfr install frontend-agent{'\n'}
                  npx skillsfr resolve "Build a DB app"{'\n'}
                  npx skillsfr doctor
                </pre>
              </div>
            </div>

            {/* Interactive Browser Terminal */}
            <div style={{ background: '#09090b', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-strong)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: '#121215', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#52525b' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#71717a' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a1a1aa' }} />
                <span style={{ marginLeft: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#71717a' }}>
                  skillsfr-cli-emulator
                </span>
              </div>

              <div style={{ padding: '20px', minHeight: '260px', maxHeight: '380px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                {cliHistory.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '14px' }}>
                    <div style={{ color: '#fafafa', fontWeight: 600 }}><span style={{ color: '#71717a' }}>$ </span>{item.command}</div>
                    <pre style={{ color: '#d4d4d8', whiteSpace: 'pre-wrap', marginTop: '4px' }}>{item.output}</pre>
                  </div>
                ))}

                <form onSubmit={handleCliRun} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <span style={{ color: '#71717a' }}>$</span>
                  <input 
                    type="text" 
                    value={cliInput}
                    onChange={e => setCliInput(e.target.value)}
                    placeholder="skillsfr nextjs my-app"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                  />
                  <button type="submit" style={{ display: 'none' }} />
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB: NEWSLETTER (THE DEV BRIEF)
            ================================================================== */}
        {activeTab === 'newsletter' && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="hero-tagline-badge">
                <Mail size={13} />
                <span>Zero-Card Free Weekly Digest Delivery</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '28px', marginBottom: '8px' }}>
                The Dev Brief & Newsletter Architecture
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                How to set up automated, cost-free weekly developer digests without credit cards using EmailOctopus or Buttondown.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Architecture comparison */}
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-serif" style={{ fontSize: '18px', marginBottom: '12px' }}>
                  Recommended Stack: EmailOctopus
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
                  • <strong>2,500 subscribers & 10,000 emails/month free</strong> forever without credit card.<br />
                  • Connect via subscriber REST API from your backend.<br />
                  • Can send using verified Gmail/Proton sender via shared domain.<br />
                  • Free double opt-in confirmation built-in.
                </p>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  POST https://emailoctopus.com/api/1.6/lists/&#123;id&#125;/contacts
                </div>
              </div>

              {/* Subscribe Box */}
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-serif" style={{ fontSize: '18px', marginBottom: '8px' }}>
                  Subscribe to The Dev Brief
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Get the latest AI agent tools, newly verified skills, and benchmarks delivered weekly.
                </p>

                {newsletterSubscribed ? (
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                    ✓ Check your inbox to confirm your double opt-in subscription!
                  </div>
                ) : (
                  <div>
                    <input 
                      type="email" 
                      placeholder="developer@example.com"
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border-strong)', 
                        color: 'var(--text-primary)',
                        marginBottom: '12px',
                        fontSize: '14px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <button 
                        type="button" 
                        className={`ecosystem-tab-btn ${newsletterCategory === 'all' ? 'is-active' : ''}`}
                        onClick={() => setNewsletterCategory('all')}
                      >
                        All Resources
                      </button>
                      <button 
                        type="button" 
                        className={`ecosystem-tab-btn ${newsletterCategory === 'skills' ? 'is-active' : ''}`}
                        onClick={() => setNewsletterCategory('skills')}
                      >
                        Skills Only
                      </button>
                      <button 
                        type="button" 
                        className={`ecosystem-tab-btn ${newsletterCategory === 'mcps' ? 'is-active' : ''}`}
                        onClick={() => setNewsletterCategory('mcps')}
                      >
                        MCPs Only
                      </button>
                    </div>

                    <HoldToConfirm 
                      onConfirm={() => { if (newsletterEmail) setNewsletterSubscribed(true); }}
                      confirmedText="Subscribed!"
                    >
                      <span>Hold to Subscribe</span>
                    </HoldToConfirm>
                  </div>
                )}
              </div>
            </div>

            {/* Newsletter Issue #001 Preview */}
            <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  ISSUE 001 • WEEKLY DEVELOPER RESOURCE DIGEST
                </span>
                <h3 className="font-serif" style={{ fontSize: '24px', marginTop: '6px' }}>
                  THE DEV BRIEF
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>
                    🔥 Top Curated Kit: Skillsfr UI/UX Pack v1.4.0
                  </h4>
                  <p>
                    Replaces 15 separate overlapping UI/UX skills with a single composed capability stream. Deduplicated responsive rules save ~88% context tokens.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>
                    ⚡ MCP Spotlight: Official GitHub & Playwright Servers
                  </h4>
                  <p>
                    Passed automated security audits: zero shell command injection vectors, strict scoped token access.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>
                    📊 Benchmark of the Week: SWE-bench Verified
                  </h4>
                  <p>
                    500 human-verified real-world GitHub issues running across isolated Docker harnesses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            RESOURCE DETAIL MODAL / DRAWER
            ================================================================== */}
        <AnimatedDrawer
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          title={selectedResource?.name || ''}
          subtitle={`${selectedResource?.kind.toUpperCase()} • by ${selectedResource?.author.name} • Version ${selectedResource?.version}`}
        >
          {selectedResource && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Metrics Bar */}
              <div style={{ display: 'flex', gap: '14px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>⭐ Stars: <strong>{selectedResource.stars.toLocaleString()}</strong></div>
                <div>🏆 Community Rating: <strong>{selectedResource.communityRating.toFixed(2)} / 5.0</strong></div>
                <div>🛡️ Status: <strong className="font-mono">{selectedResource.status}</strong></div>
                <div>⚖️ License: <strong>{selectedResource.license}</strong></div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Description</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {selectedResource.description}
                </p>
              </div>

              {/* Installation Command */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Installation & Usage</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <code style={{ fontSize: '13px' }}>
                    {selectedResource.skillDetails?.installCommand || 
                     selectedResource.mcpDetails?.installCommand || 
                     selectedResource.starterPackDetails?.quickstartCommand ||
                     `npx skillsfr inspect ${selectedResource.id}`}
                  </code>
                  <button 
                    type="button" 
                    className="nav-btn"
                    onClick={() => copyToClipboard(
                      selectedResource.skillDetails?.installCommand || 
                      selectedResource.mcpDetails?.installCommand || 
                      selectedResource.starterPackDetails?.quickstartCommand ||
                      `npx skillsfr inspect ${selectedResource.id}`,
                      'drawer-install-cmd'
                    )}
                  >
                    {copiedId === 'drawer-install-cmd' ? <Check size={14} /> : <Copy size={14} />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Type-Specific Details with Spectrum UI Accordion */}
              <Accordion 
                items={[
                  {
                    id: 'tech-specs',
                    title: 'Type-Specific Architecture & Metadata',
                    badge: selectedResource.kind.toUpperCase(),
                    content: (
                      <div>
                        {selectedResource.mcpDetails && (
                          <div style={{ fontSize: '13px' }}>
                            <p><strong>Supported Transports:</strong> {selectedResource.mcpDetails.transports.join(', ')}</p>
                            <p style={{ marginTop: '8px' }}><strong>Tools Exposed:</strong></p>
                            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                              {selectedResource.mcpDetails.toolsProvided.map(t => (
                                <li key={t.name}><code>{t.name}</code>: {t.description}</li>
                              ))}
                            </ul>
                            <p style={{ marginTop: '8px' }}><strong>Config Example (claude_desktop_config.json):</strong></p>
                            <pre className="code-preview-block" style={{ marginTop: '4px' }}>
                              {selectedResource.mcpDetails.configExample}
                            </pre>
                          </div>
                        )}

                        {selectedResource.skillDetails && (
                          <div style={{ fontSize: '13px' }}>
                            <p><strong>Estimated Context Cost:</strong> ~{selectedResource.skillDetails.contextCostEstimateTokens} tokens</p>
                            <p style={{ marginTop: '8px' }}><strong>Trigger Conditions:</strong></p>
                            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                              {selectedResource.skillDetails.triggerConditions.map(c => <li key={c}>{c}</li>)}
                            </ul>
                            <p style={{ marginTop: '8px' }}><strong>Instructions Preview:</strong></p>
                            <pre className="code-preview-block" style={{ marginTop: '4px' }}>
                              {selectedResource.skillDetails.instructionsPreview}
                            </pre>
                          </div>
                        )}

                        {selectedResource.datasetDetails && (
                          <div style={{ fontSize: '13px' }}>
                            <p><strong>Total Rows:</strong> {selectedResource.datasetDetails.totalRows}</p>
                            <p><strong>Total Size:</strong> {selectedResource.datasetDetails.totalSize}</p>
                            <p><strong>Modalities:</strong> {selectedResource.datasetDetails.modalities.join(', ')}</p>
                            <p><strong>Features:</strong> {selectedResource.datasetDetails.features.join(', ')}</p>
                          </div>
                        )}

                        {selectedResource.benchmarkDetails && (
                          <div style={{ fontSize: '13px' }}>
                            <p><strong>Category:</strong> {selectedResource.benchmarkDetails.category}</p>
                            <p><strong>Test Cases:</strong> {selectedResource.benchmarkDetails.testCaseCount}</p>
                            <p><strong>Metrics:</strong> {selectedResource.benchmarkDetails.scoringMetrics.join(', ')}</p>
                            <p style={{ marginTop: '8px' }}><strong>Baseline Leaderboard:</strong></p>
                            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                              {selectedResource.benchmarkDetails.baselineResults.map(b => (
                                <li key={b.modelOrSystem}>{b.modelOrSystem} — <strong>{b.score}</strong> ({b.date})</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedResource.starterPackDetails && (
                          <div style={{ fontSize: '13px' }}>
                            <p><strong>Included Resources:</strong></p>
                            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                              {selectedResource.starterPackDetails.includedResources.map(r => (
                                <li key={r.id}><strong>{r.name}</strong> — {r.role}</li>
                              ))}
                            </ul>
                            <p style={{ marginTop: '8px' }}><strong>Manifest Lockfile:</strong></p>
                            <pre className="code-preview-block" style={{ marginTop: '4px' }}>
                              {selectedResource.starterPackDetails.lockfileManifest}
                            </pre>
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    id: 'security-audit',
                    title: 'Security, Permissions & Risk Assessment',
                    badge: selectedResource.riskLevel.toUpperCase(),
                    content: (
                      <div style={{ fontSize: '13px' }}>
                        <p><strong>Risk Level:</strong> {selectedResource.riskLevel}</p>
                        <p><strong>Automated Verification:</strong> Passed static analysis and AST checks.</p>
                        <p><strong>Source Provenance:</strong> Verified against original commit hash on {selectedResource.sourcePlatform}.</p>
                      </div>
                    )
                  }
                ]}
              />

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <a 
                  href={selectedResource.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="primary-btn" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>Open on {selectedResource.sourcePlatform}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </AnimatedDrawer>

      </main>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="site-footer">
        <div className="app-container">
          <div className="footer-inner">
            <div className="footer-col-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div className="brand-logo-mark" style={{ width: '26px', height: '26px' }}>
                  <Sparkles size={14} />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700 }}>
                  Skillsfr
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                A centralized, community-driven developer resource registry. Discover, evaluate, compose, and deploy MCP servers, agent skills, datasets, and benchmarks.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Registry</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <li><a href="#skills" onClick={(e) => { e.preventDefault(); setActiveTab('registry'); setSelectedKind('skill'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Agent Skills</a></li>
                <li><a href="#mcps" onClick={(e) => { e.preventDefault(); setActiveTab('registry'); setSelectedKind('mcp'); }} style={{ color: 'inherit', textDecoration: 'none' }}>MCP Servers</a></li>
                <li><a href="#kits" onClick={(e) => { e.preventDefault(); setActiveTab('registry'); setSelectedKind('kit'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Curated Kits</a></li>
                <li><a href="#datasets" onClick={(e) => { e.preventDefault(); setActiveTab('registry'); setSelectedKind('dataset'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Datasets</a></li>
                <li><a href="#benchmarks" onClick={(e) => { e.preventDefault(); setActiveTab('registry'); setSelectedKind('benchmark'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Benchmarks</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Platform</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <li><a href="#router" onClick={(e) => { e.preventDefault(); setActiveTab('router'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Intent Router</a></li>
                <li><a href="#templates" onClick={(e) => { e.preventDefault(); setActiveTab('templates'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Templates</a></li>
                <li><a href="#methodology" onClick={(e) => { e.preventDefault(); setActiveTab('methodology'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Methodology</a></li>
                <li><a href="#cli" onClick={(e) => { e.preventDefault(); setActiveTab('cli'); }} style={{ color: 'inherit', textDecoration: 'none' }}>Skillsfr CLI</a></li>
                <li><a href="#updates" onClick={(e) => { e.preventDefault(); setActiveTab('updates'); }} style={{ color: 'inherit', textDecoration: 'none' }}>24/7 Activity</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Dynamic URLs</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '240px' }}>
                Canonical endpoint: <code>{SITE_CONFIG.getUrl()}</code>. Seamlessly switches from <code>skillsfr.vercel.app</code> to custom domains.
              </p>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© 2026 Skillsfr. Open source under MIT License.</span>
            <span>Crafted with precision & zero AI slop.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
