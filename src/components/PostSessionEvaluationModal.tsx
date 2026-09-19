import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Shield, BrainCircuit, TrendingUp, Award, Zap } from 'lucide-react';
import { translateMode, getAppModeClass } from '../lib/utils';
import { UserProgress, TrainingSession, AppMode } from '../types';

interface PostSessionEvaluationModalProps {
  lastSessionStats: {
    mode: AppMode;
    volume: number;
    duration: number;
    successes: number;
    failures: number;
    bestStreak: number;
    errorTrackingEnabled?: boolean;
    neuroFlowActive?: boolean;
    neuroFlowFinalLevel?: number;
    neuroFlowHighestLevelReached?: number;
  };
  userProgress: UserProgress;
  appLanguage: string;
  onSave: (rating: number) => void;
  onSkip: () => void;
  errorMode?: 'live' | 'post' | 'none' | null;
}

// Animated count-up — ticks a number from 0 to its target with an
// ease-out curve. Dependency-free, runs once on mount / value change.
const CountUp: React.FC<{
  value: number;
  decimals?: number;
  duration?: number;
  delay?: number;
  suffix?: string;
}> = ({ value, decimals = 0, duration = 900, delay = 0 }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(value * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, delay]);

  return <>{display.toFixed(decimals)}</>;
};

// Compact scorecard block: one big number + icon + a single keyword underneath.
// No sub-text, no explanatory sentence — meant to be read in a glance.
const ScoreBlock: React.FC<{
  icon: React.ReactNode;
  value: React.ReactNode;
  keyword: string;
  color: string;
  accent: string;
  delay?: number;
}> = ({ icon, value, keyword, color, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-4 rounded-2xl border ${accent} flex flex-col items-center justify-center gap-1 text-center`}
  >
    <div className={color}>{icon}</div>
    <span className="text-3xl font-black text-white font-mono leading-none">{value}</span>
    <span className={`text-[9px] font-black uppercase tracking-widest ${color} opacity-70`}>{keyword}</span>
  </motion.div>
);

// 5-step visual difficulty picker for Motion sessions — no phrase, just
// tap the level that matches how the session felt. Spread across the
// same 1–10 rating domain everything else in the app expects.
const DIFFICULTY_LEVELS: { rating: number; en: string; fr: string; color: string }[] = [
  { rating: 2, en: 'Easy', fr: 'Facile', color: 'text-emerald-400' },
  { rating: 4, en: 'Light', fr: 'Léger', color: 'text-lime-400' },
  { rating: 6, en: 'Moderate', fr: 'Modéré', color: 'text-amber-400' },
  { rating: 8, en: 'Hard', fr: 'Difficile', color: 'text-orange-400' },
  { rating: 10, en: 'Brutal', fr: 'Brutal', color: 'text-red-400' },
];

export const PostSessionEvaluationModal: React.FC<PostSessionEvaluationModalProps> = ({
  lastSessionStats,
  userProgress,
  appLanguage,
  onSave,
  onSkip,
  errorMode
}) => {
  const accentColor = "var(--acc-primary)";
  const isPostMode = errorMode === 'post';
  const isMotion = getAppModeClass(lastSessionStats.mode) === 'MOVEMENT';
  const [showRating, setShowRating] = useState(false);

  // Le pourcentage se base toujours sur le vrai nombre de stimulis (volume) —
  // jamais sur la somme de deux compteurs suivis séparément (réussites +
  // erreurs), qui peuvent ne pas coïncider exactement. Réussites = stimulis
  // moins erreurs, par construction : le pourcentage ne peut alors jamais
  // être incohérent avec le nombre d'erreurs affiché.
  const effectiveTotal = Math.max(1, lastSessionStats.volume);
  const effectiveSuccesses = Math.max(0, effectiveTotal - lastSessionStats.failures);
  const successRate = Math.round((effectiveSuccesses / effectiveTotal) * 100);

  const durationFormatted = lastSessionStats.duration >= 60
    ? `${Math.floor(lastSessionStats.duration / 60)}m ${lastSessionStats.duration % 60}s`
    : `${lastSessionStats.duration}s`;

  const isTracked = lastSessionStats.errorTrackingEnabled !== false;

  // The rating buttons only appear once the numbers have finished their
  // reveal — a deliberate pause so the result actually gets seen before
  // being asked to move on, rather than everything landing at once.
  useEffect(() => {
    const t = setTimeout(() => setShowRating(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-y-auto py-8 px-5"
    >
      <motion.div
        initial={{ scale: 0.94, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm space-y-5"
      >

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `color-mix(in srgb, ${accentColor} 13%, transparent)`, border: `1px solid color-mix(in srgb, ${accentColor} 27%, transparent)` }}
          >
            {lastSessionStats.neuroFlowActive
              ? <BrainCircuit className="w-8 h-8" style={{ color: accentColor }} />
              : <Trophy className="w-8 h-8" style={{ color: accentColor }} />}
          </motion.div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
            {lastSessionStats.neuroFlowActive
              ? (appLanguage === 'en' ? 'Neuro-Flow' : 'Neuro-Flow')
              : (appLanguage === 'en' ? 'Session Complete' : 'Session Terminée')}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40" style={{ color: accentColor }}>
            {translateMode(lastSessionStats.mode, appLanguage)}
          </p>
        </div>

        {/* Neuro-Flow block — le "sommet" de la séance mis en avant comme un
            vrai temps fort à battre la prochaine fois, pas juste une donnée
            parmi d'autres. */}
        {lastSessionStats.neuroFlowActive && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl border border-[var(--acc-primary)]/15 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, rgba(216,173,69,0.1), rgba(216,173,69,0.02))' }}
          >
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(216,173,69,0.25), transparent 70%)' }}
            />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-[9px] font-black text-[var(--acc-primary)]/80 uppercase tracking-widest mb-1">
                  {appLanguage === 'en' ? 'Peak reached' : 'Sommet atteint'}
                </p>
                <p className="text-5xl font-black text-white italic leading-none">
                  <CountUp value={lastSessionStats.neuroFlowHighestLevelReached || 0} delay={200} />
                  <span className="text-lg opacity-40">/18</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[var(--acc-primary)]/15 border border-[var(--acc-primary)]/30 flex items-center justify-center">
                <Award className="w-7 h-7 text-[var(--acc-primary)]" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--acc-primary)]/10 relative">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-black">
                  {appLanguage === 'en' ? 'Ended at' : 'Terminé à'}
                </span>
              </div>
              <span className="text-[11px] font-black text-[var(--text-secondary)] font-mono">
                {appLanguage === 'en' ? 'Lvl' : 'Niv.'} {lastSessionStats.neuroFlowFinalLevel}/18
              </span>
            </div>
          </motion.div>
        )}

        {/* Main stats */}
        {isTracked && isMotion ? (
          /* Motion mode: a single score card, 4 numbers, no surrounding text.
             The 4th block (Difficulté) doubles as the rating picker below. */
          <div className="rounded-2xl border border-[var(--acc-primary)]/8 bg-white/3 p-3">
            <div className="grid grid-cols-3 gap-3">
              <ScoreBlock
                icon={<Zap className="w-4 h-4" />}
                value={<CountUp value={lastSessionStats.volume} delay={150} />}
                keyword={appLanguage === 'en' ? 'Stimuli' : 'Stimuli'}
                color="text-[var(--acc-primary)]"
                accent="border-[var(--acc-primary)]/10 bg-[var(--acc-primary)]/3"
                delay={0.15}
              />
              <ScoreBlock
                icon={<Shield className="w-4 h-4" />}
                value={<CountUp value={lastSessionStats.failures} delay={150} />}
                keyword={appLanguage === 'en' ? 'Errors' : 'Erreurs'}
                color="text-red-400"
                accent="border-red-400/10 bg-red-400/3"
                delay={0.19}
              />
              <ScoreBlock
                icon={<Trophy className="w-4 h-4" />}
                value={<><CountUp value={successRate} delay={230} />%</>}
                keyword={appLanguage === 'en' ? 'Success' : 'Réussite'}
                color={successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400'}
                accent={successRate >= 90 ? 'border-emerald-400/10 bg-emerald-400/3' : successRate >= 70 ? 'border-amber-400/10 bg-amber-400/3' : 'border-red-400/10 bg-red-400/3'}
                delay={0.23}
              />
            </div>
          </div>
        ) : isTracked ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
            <div className="p-5 rounded-2xl border border-[var(--acc-primary)]/8 bg-white/3 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-black mb-1">{appLanguage === 'en' ? 'Duration' : 'Durée'}</p>
                <p className="text-3xl font-black text-white font-mono">{durationFormatted}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-black mb-1 text-right">{appLanguage === 'en' ? 'Stimuli' : 'Stimuli'}</p>
                <p className="text-3xl font-black text-[var(--acc-primary)] font-mono text-right"><CountUp value={lastSessionStats.volume} delay={200} /></p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-[var(--acc-primary)]/5 bg-white/2 text-center">
              <Shield className="w-6 h-6 text-[var(--text-secondary)] mx-auto mb-2" />
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                {appLanguage === 'en' ? 'Free session — no error tracking' : 'Session libre — sans suivi d\'erreur'}
              </p>
            </div>
          </motion.div>
        ) : null}

        {/* Difficulty rating — appears once the reveal has settled */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={showRating ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35 }}
          className="space-y-3"
          style={{ pointerEvents: showRating ? 'auto' : 'none' }}
        >
          {isMotion ? (
            <div className="rounded-2xl border border-[var(--acc-primary)]/8 bg-white/3 p-3">
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-center mb-2">
                {appLanguage === 'en' ? 'How difficult did it feel?' : 'Quelle difficulté as-tu ressenti ?'}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {DIFFICULTY_LEVELS.map((lvl) => (
                  <button
                    key={lvl.rating}
                    onClick={() => onSave(lvl.rating)}
                    className={`h-14 rounded-xl bg-white/5 border border-[var(--acc-primary)]/8 flex flex-col items-center justify-center gap-0.5 font-black transition-all active:scale-90 hover:bg-white/10 ${lvl.color}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span className="text-[8px] uppercase tracking-wide leading-none">
                      {appLanguage === 'en' ? lvl.en : lvl.fr}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-center">
                {appLanguage === 'en' ? 'How difficult? (1 easy → 10 brutal)' : 'Niveau de difficulté ressenti (1 facile → 10 brutal)'}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                  <button
                    key={r}
                    onClick={() => onSave(r)}
                    className="h-11 rounded-xl bg-white/5 border border-[var(--acc-primary)]/8 flex items-center justify-center font-black text-sm text-[var(--text-primary)] hover:bg-[var(--acc-primary)] hover:text-black hover:border-[var(--acc-primary)] transition-all active:scale-90"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <button
          onClick={onSkip}
          className="w-full text-center text-[10px] font-black text-[var(--acc-primary)]/60 uppercase tracking-[0.3em] py-2 hover:text-[var(--acc-primary)] active:scale-95 transition-all"
        >
          {appLanguage === 'en' ? 'Skip' : 'Passer'}
        </button>

      </motion.div>
    </motion.div>
  );
};
