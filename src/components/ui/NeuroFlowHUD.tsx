import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { NEURO_FLOW_LEVELS } from '../../constants/guidedPresets';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

// Neuro-Flow HUD: hearts for remaining lives + a 9-segment belt-style
// progress bar (white → blue → purple → brown → black, JJB-style) showing
// the current level, with a brief flash on the active segment at the
// halfway point (5/10) of the current streak.
// Une couleur par vitesse (6), chacune déclinée sur ses 3 sous-niveaux de
// stimulis — la couleur change de vitesse en vitesse, pas à chaque niveau.
const NEURO_FLOW_BELT_COLORS = [
  '#f5f5f4', '#f5f5f4', '#f5f5f4', // Vitesse 1 — Découverte (blanc)
  '#3b82f6', '#3b82f6', '#3b82f6', // Vitesse 2 — Posé (bleu)
  '#a855f7', '#a855f7', '#a855f7', // Vitesse 3 — Soutenu (violet)
  '#f97316', '#f97316', '#f97316', // Vitesse 4 — Rapide (orange)
  '#92400e', '#92400e', '#92400e', // Vitesse 5 — Très rapide (brun)
  '#111111', '#111111', '#111111', // Vitesse 6 — Maximum (noir)
];

export const NeuroFlowHUD: React.FC<{
  level: number;
  lives: number;
  streak: number;
  appLanguage: 'en' | 'fr' | null;
  bestLevel?: number;
}> = ({ level, lives, streak, appLanguage, bestLevel = 0 }) => {
  const [flash, setFlash] = useState(false);
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    if (prevStreakRef.current < 5 && streak >= 5) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 550);
      prevStreakRef.current = streak;
      return () => clearTimeout(t);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  const levelDef = NEURO_FLOW_LEVELS.find(l => l.level === level) || NEURO_FLOW_LEVELS[0];
  const levelLabel = `${levelDef.minInterval.toFixed(2)}-${levelDef.maxInterval.toFixed(2)}s`;

  return (
    <div className="w-full max-w-lg flex flex-col gap-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 shrink-0">
          {[0, 1, 2].map(i => (
            <Heart
              key={i}
              className={`w-4 h-4 transition-all ${i < lives ? 'text-red-500 fill-red-500' : 'text-[var(--acc-primary)]/15'}`}
            />
          ))}
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
          {levelLabel}
          <span className="text-[var(--acc-primary)]"> · {appLanguage === 'en' ? 'Level' : 'Niveau'} {level}/18</span>
        </span>
      </div>

      {bestLevel > 0 && (
        <div className="flex justify-end -mt-1">
          <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            {appLanguage === 'en' ? 'Your best' : 'Ton record'} : {bestLevel}/18
          </span>
        </div>
      )}

      <div className="flex items-center gap-1">
        {NEURO_FLOW_BELT_COLORS.map((color, i) => {
          const segLevel = i + 1;
          const isDone = segLevel < level;
          const isCurrent = segLevel === level;
          const isBlack = color === '#111111';
          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full bg-white/10 overflow-hidden relative border ${isBlack ? 'border-[var(--acc-primary)]/25' : 'border-[var(--acc-primary)]/5'}`}
            >
              {isDone && (
                <div
                  className={`absolute inset-0 ${color === '#f5f5f4' ? 'border border-[var(--acc-primary)]/30' : ''}`}
                  style={{ background: color }}
                />
              )}
              {isCurrent && (
                <motion.div
                  className={`absolute inset-y-0 left-0 ${color === '#f5f5f4' ? 'border-r border-[var(--acc-primary)]/30' : ''}`}
                  style={{ background: color }}
                  animate={{ width: `${Math.min(100, (streak / 10) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {isCurrent && flash && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.55 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Le chiffre de série grandit et s'intensifie à mesure qu'elle
          monte — discret à 2-3, franchement visible juste avant le palier
          de 10, pour créer une vraie tension positive avant la récompense. */}
      {streak > 0 && (
        <div className="flex justify-center pt-1">
          <motion.span
            key={streak}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="font-black italic tabular-nums"
            style={{
              fontSize: `${14 + Math.min(streak, 10) * 2.2}px`,
              color: streak >= 8 ? '#fbbf24' : streak >= 5 ? 'var(--acc-primary)' : 'var(--text-secondary)',
              textShadow: streak >= 8 ? '0 0 24px rgba(251,191,36,0.5)' : 'none',
            }}
          >
            {streak}
          </motion.span>
        </div>
      )}
    </div>
  );
};
