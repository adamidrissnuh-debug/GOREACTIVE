import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, ShieldAlert } from 'lucide-react';

interface ScreenLockOverlayProps {
  isOpen: boolean;
  appLanguage?: string;
  onUnlockStart: () => void;
  onUnlockEnd: () => void;
}

export const ScreenLockOverlay: React.FC<ScreenLockOverlayProps> = ({ 
  isOpen,
  appLanguage = 'fr',
  onUnlockStart, 
  onUnlockEnd 
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
      >
        <Lock className="w-16 h-16 text-[var(--acc-primary)] mb-6 animate-pulse" />
        <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-widest mb-2">
          {appLanguage === 'en' ? 'Interface Locked' : 'Interface Verrouillée'}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-tight mb-12">
          {appLanguage === 'en' ? 'Preventing accidental input during session' : 'Évite les appuis accidentels pendant la session'}
        </p>
        
        <button
          onMouseDown={onUnlockStart}
          onMouseUp={onUnlockEnd}
          onTouchStart={onUnlockStart}
          onTouchEnd={onUnlockEnd}
          className="w-24 h-24 rounded-full border-4 border-[var(--acc-primary)]/20 flex items-center justify-center group active:scale-95 transition-transform relative"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--acc-primary)] flex items-center justify-center text-[var(--acc-on-primary)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          {/* Circular Progress Ring Placeholder Effect */}
          <div className="absolute inset-0 rounded-full border-4 border-[var(--acc-primary)] border-t-transparent animate-spin opacity-40"></div>
        </button>
        <p className="mt-6 text-[10px] font-bold text-[var(--acc-primary)] uppercase tracking-[0.3em]">
          {appLanguage === 'en' ? 'Hold to Unlock' : 'Maintenir pour déverrouiller'}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);
