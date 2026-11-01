import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  badge?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  allowMultiple = false,
  className = ''
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`spectrum-accordion ${className}`}>
      {items.map(item => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className={`accordion-card ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
            >
              <div className="accordion-title-wrapper">
                <span className="accordion-title">{item.title}</span>
                {item.badge && <span className="accordion-badge">{item.badge}</span>}
              </div>
              <ChevronDown className={`accordion-chevron ${isOpen ? 'is-rotated' : ''}`} size={18} />
            </button>
            {isOpen && (
              <div className="accordion-body">
                <div className="accordion-content">{item.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
