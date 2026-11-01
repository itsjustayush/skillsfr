import React, { useState, useRef, useEffect } from 'react';

interface HoldToConfirmProps {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmedText?: React.ReactNode;
  durationMs?: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const HoldToConfirm: React.FC<HoldToConfirmProps> = ({
  onConfirm,
  children,
  confirmedText = 'Confirmed!',
  durationMs = 1000,
  className = '',
  variant = 'primary'
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const startHold = () => {
    if (confirmed) return;
    setHolding(true);
    startRef.current = Date.now();
    const update = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / durationMs, 1);
      setProgress(p);
      if (p < 1) {
        timerRef.current = requestAnimationFrame(update);
      } else {
        setConfirmed(true);
        setHolding(false);
        onConfirm();
        setTimeout(() => {
          setConfirmed(false);
          setProgress(0);
        }, 2000);
      }
    };
    timerRef.current = requestAnimationFrame(update);
  };

  const cancelHold = () => {
    if (confirmed) return;
    setHolding(false);
    setProgress(0);
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      className={`hold-to-confirm hold-to-confirm--${variant} ${holding ? 'is-holding' : ''} ${confirmed ? 'is-confirmed' : ''} ${className}`}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
    >
      <span className="hold-progress-track" style={{ width: `${progress * 100}%` }} />
      <span className="hold-content">
        {confirmed ? confirmedText : children}
      </span>
      {!confirmed && (
        <span className="hold-hint">
          {holding ? `${Math.round(progress * 100)}%` : 'Hold to confirm'}
        </span>
      )}
    </button>
  );
};

export default HoldToConfirm;
