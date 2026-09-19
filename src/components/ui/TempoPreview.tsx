import * as React from 'react';
import { motion } from 'motion/react';

// Small rhythm preview: 3 dots pulsing on a loop matching the average
// configured interval, so the person can feel the pace of stimuli without
// starting a test session. Purely decorative — no timers, framer-motion
// drives the loop off the CSS/animation engine.
export const TempoPreview: React.FC<{ minInterval: number; maxInterval: number; appLanguage: 'en' | 'fr' | null }> = ({ minInterval, maxInterval, appLanguage }) => {
  const avg = Math.max(0.3, (minInterval + maxInterval) / 2);
  // Keying on the rounded avg forces Framer Motion to fully remount the dots
  // whenever the interval changes — an already-running infinite animation
  // doesn't pick up a new `transition.duration` on its own, which is why the
  // preview used to look the same regardless of the configured speed.
  const animKey = avg.toFixed(2);
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10">
      <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
        {appLanguage === 'en' ? 'Rhythm preview' : 'Aperçu du rythme'}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono font-bold text-[var(--acc-primary)]">~{avg.toFixed(1)}s</span>
        <div className="flex items-center gap-2.5">
          {[0, 1, 2].map(i => (
            <motion.span
              key={`${animKey}-${i}`}
              className="w-2.5 h-2.5 rounded-full bg-[var(--acc-primary)]"
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ duration: avg, repeat: Infinity, delay: (i * avg) / 3, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
