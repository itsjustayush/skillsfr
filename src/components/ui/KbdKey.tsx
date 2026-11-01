import React from 'react';

interface KbdKeyProps {
  children: React.ReactNode;
  className?: string;
}

export const KbdKey: React.FC<KbdKeyProps> = ({ children, className = '' }) => {
  return (
    <kbd className={`kbd-key ${className}`}>
      {children}
    </kbd>
  );
};

export default KbdKey;
