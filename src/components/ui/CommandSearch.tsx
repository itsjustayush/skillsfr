import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Command, Sparkles, Layers, Box, Cpu, FileText, ArrowRight } from 'lucide-react';
import KbdKey from './KbdKey';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'mcp' | 'skill' | 'dataset' | 'benchmark' | 'kit' | 'template' | 'action';
  action: () => void;
  badge?: string;
}

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
}

export const CommandSearch: React.FC<CommandSearchProps> = ({ isOpen, onClose, items }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = items.filter(item => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'mcp': return <Cpu size={16} style={{ color: 'var(--text-primary)' }} />;
      case 'skill': return <Sparkles size={16} style={{ color: 'var(--text-primary)' }} />;
      case 'kit': return <Layers size={16} style={{ color: 'var(--text-primary)' }} />;
      case 'dataset': return <Box size={16} style={{ color: 'var(--text-secondary)' }} />;
      case 'template': return <FileText size={16} style={{ color: 'var(--text-secondary)' }} />;
      default: return <Command size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="command-search-overlay">
      <div className="command-backdrop" onClick={onClose} />
      <div className="command-palette-card" role="dialog" aria-modal="true">
        {/* Animated Beam Effect */}
        <div className="beam-glow" />

        <div className="command-input-row">
          <Search size={18} className="command-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Search all skills, MCPs, datasets, benchmarks, kits..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          {query ? (
            <button type="button" className="command-clear" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          ) : (
            <div className="command-badge-group">
              <KbdKey>ESC</KbdKey>
            </div>
          )}
        </div>

        <div className="command-results-list">
          {filtered.length === 0 ? (
            <div className="command-empty-state">
              <p>No resources found for "{query}"</p>
              <span>Try searching for "frontend", "postgres", "ui-ux", or "benchmarks"</span>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-item-icon">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="command-item-text">
                    <div className="command-item-title-row">
                      <span className="command-item-title">{item.title}</span>
                      {item.badge && <span className="command-item-badge">{item.badge}</span>}
                    </div>
                    <span className="command-item-sub">{item.subtitle}</span>
                  </div>
                  <ArrowRight size={14} className="command-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="command-footer">
          <div className="command-shortcuts">
            <span><KbdKey>↑</KbdKey> <KbdKey>↓</KbdKey> to navigate</span>
            <span><KbdKey>↵</KbdKey> to select</span>
            <span><KbdKey>ESC</KbdKey> to close</span>
          </div>
          <div className="command-brand">
            <span>Skillsfr Universal Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandSearch;
