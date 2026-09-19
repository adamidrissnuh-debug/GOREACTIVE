import * as React from 'react';
import { useRef, useEffect } from 'react';

// A +/- button that behaves like a normal tap on a quick press, but holds
// down to repeat rapidly (with a short initial delay so it never triggers
// on an ordinary tap) — used by every stepper control in the settings.
export const StepperButton: React.FC<{
  onStep: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onStep, className, children }) => {
  const holdTimeoutRef = useRef<number | null>(null);
  const repeatIntervalRef = useRef<number | null>(null);
  // Some Android WebViews fire a synthetic mousedown right after a real
  // touchstart, even with preventDefault() called — without this guard,
  // a single tap could call onStep() twice (once per event), which felt
  // exactly like the button was being held down for one extra step.
  const lastTouchRef = useRef(0);

  const stop = () => {
    if (holdTimeoutRef.current) { window.clearTimeout(holdTimeoutRef.current); holdTimeoutRef.current = null; }
    if (repeatIntervalRef.current) { window.clearInterval(repeatIntervalRef.current); repeatIntervalRef.current = null; }
  };

  const start = () => {
    stop();
    onStep();
    holdTimeoutRef.current = window.setTimeout(() => {
      repeatIntervalRef.current = window.setInterval(onStep, 70);
    }, 400);
  };

  useEffect(() => stop, []);

  return (
    <button
      onMouseDown={() => {
        if (Date.now() - lastTouchRef.current < 600) return;
        start();
      }}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={(e) => { e.preventDefault(); lastTouchRef.current = Date.now(); start(); }}
      onTouchEnd={stop}
      onTouchCancel={stop}
      className={className}
    >
      {children}
    </button>
  );
};
