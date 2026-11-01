import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AnimatedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'center';
  maxWidth?: string;
}

export const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  position = 'right',
  maxWidth = '760px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`drawer-overlay ${position === 'center' ? 'is-center' : 'is-right'}`}>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-container" style={{ maxWidth }} role="dialog" aria-modal="true">
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2 className="drawer-title">{title}</h2>
            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {children}
        </div>

        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default AnimatedDrawer;
