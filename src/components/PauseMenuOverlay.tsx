import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, LogOut, Square, Minus, Plus } from 'lucide-react';

interface PauseMenuOverlayProps {
  isOpen: boolean;
  appLanguage: string;
  variant?: 'simple' | 'premium';
  onResume: () => void;
  onStop: () => void;
  levelControls?: {
    label: string;
    onLevelUp: () => void;
    onLevelDown: () => void;
    canLevelUp: boolean;
    canLevelDown: boolean;
  };
  stimuliControls?: {
    label: string;
    onIncrease: () => void;
    onDecrease: () => void;
    canIncrease: boolean;
    canDecrease: boolean;
  };
  intervalControls?: {
    appLanguage: string;
    min: number;
    max: number;
    step: number;
    minBound: number;
    maxBound: number;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
  };
}

export const PauseMenuOverlay: React.FC<PauseMenuOverlayProps> = ({
  isOpen,
  appLanguage,
  variant = 'premium',
  onResume,
  onStop,
  levelControls,
  stimuliControls,
  intervalControls
}) => {
  if (variant === 'simple') {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="absolute inset-0 z-[2100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm premium-card rounded-[2.5rem] p-8 flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--acc-primary)]/10 flex items-center justify-center mb-2">
                  <Square className="w-8 h-8 text-[var(--acc-primary)] fill-[var(--acc-primary)]" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">PAUSE</h2>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-widest text-center">
                  {appLanguage === 'en' ? 'Session Interrupted' : 'Session Interrompue'}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={onResume}
                  className="h-16 rounded-2xl premium-button-active font-black uppercase tracking-widest text-sm active:scale-95 transition-all"
                >
                  {appLanguage === 'en' ? 'RESUME' : 'CONTINUER'}
                </button>
                <button
                  onClick={onStop}
                  className="h-16 rounded-2xl bg-[var(--text-primary)]/5 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase tracking-widest text-sm active:scale-95 transition-all hover:bg-[var(--text-primary)]/10"
                >
                  {appLanguage === 'en' ? 'STOP' : 'ARRÊTER'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-2xl"
        >
          <div className="w-full max-w-sm premium-card rounded-[3rem] p-10 flex flex-col gap-8 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[var(--acc-primary)]/10 blur-[80px] rounded-full" />
            
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center mb-4">
                <Pause className="w-10 h-10 text-[var(--acc-primary)] fill-[var(--acc-primary)]" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">PAUSE</h2>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">
                {appLanguage === 'en' ? 'Session suspended' : 'Session suspendue'}
              </p>
            </div>

            {levelControls && (
              <div className="flex items-center justify-between gap-3 bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-3 py-3 relative z-10">
                <button
                  onClick={levelControls.onLevelDown}
                  disabled={!levelControls.canLevelDown}
                  className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center min-w-0 px-1">
                  <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    {appLanguage === 'en' ? 'Level' : 'Niveau'}
                  </span>
                  <span className="text-sm font-black text-[var(--acc-primary)] uppercase whitespace-nowrap px-0.5">
                    {levelControls.label}
                  </span>
                </div>
                <button
                  onClick={levelControls.onLevelUp}
                  disabled={!levelControls.canLevelUp}
                  className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {stimuliControls && (
              <div className="flex items-center justify-between gap-3 bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-3 py-3 relative z-10">
                <button
                  onClick={stimuliControls.onDecrease}
                  disabled={!stimuliControls.canDecrease}
                  className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center min-w-0 px-1">
                  <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    {appLanguage === 'en' ? 'Stimuli' : 'Stimulis'}
                  </span>
                  <span className="text-sm font-black text-[var(--acc-primary)] uppercase whitespace-nowrap px-0.5">
                    {stimuliControls.label}
                  </span>
                </div>
                <button
                  onClick={stimuliControls.onIncrease}
                  disabled={!stimuliControls.canIncrease}
                  className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {intervalControls && (
              <div className="flex flex-col gap-2 bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-3 py-3 relative z-10">
                {[
                  {
                    label: intervalControls.appLanguage === 'en' ? 'MIN' : 'MINIMUM',
                    value: intervalControls.min,
                    onChange: intervalControls.onMinChange,
                  },
                  {
                    label: intervalControls.appLanguage === 'en' ? 'MAX' : 'MAXIMUM',
                    value: intervalControls.max,
                    onChange: intervalControls.onMaxChange,
                  },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest w-14 shrink-0">
                      {row.label}
                    </span>
                    <button
                      onClick={() => row.onChange(Math.max(intervalControls.minBound, Number((row.value - intervalControls.step).toFixed(1))))}
                      className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 transition-all shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-sm font-black text-[var(--acc-primary)] font-mono">
                      {row.value.toFixed(1)}s
                    </span>
                    <button
                      onClick={() => row.onChange(Math.min(intervalControls.maxBound, Number((row.value + intervalControls.step).toFixed(1))))}
                      className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 transition-all shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col gap-4 relative z-10">
              <button
                onClick={onResume}
                className="h-20 rounded-[2rem] premium-button-active font-black uppercase tracking-widest text-sm active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                {appLanguage === 'en' ? 'RESUME' : 'REPRENDRE'}
              </button>
              <button
                onClick={onStop}
                className="h-20 rounded-[2rem] bg-[var(--text-primary)]/5 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase tracking-widest text-sm active:scale-95 transition-all hover:bg-[var(--text-primary)]/10 flex items-center justify-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                {appLanguage === 'en' ? 'ABANDON' : 'ABANDONNER'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
