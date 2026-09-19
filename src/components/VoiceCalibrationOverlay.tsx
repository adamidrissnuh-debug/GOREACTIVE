import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Headphones } from 'lucide-react';
import { matchMovementCommand } from '../lib/voiceUtils';

interface VoiceCalibrationOverlayProps {
  isOpen: boolean;
  progress: number;
  threshold: number;
  appLanguage: string;
  onCancel: () => void;
  localTrigger: any;
}

export const VoiceCalibrationOverlay: React.FC<VoiceCalibrationOverlayProps> = ({
  isOpen,
  progress,
  threshold,
  appLanguage,
  onCancel,
  localTrigger
}) => {
  const volume = localTrigger.volume;
  const status = localTrigger.status;
  const isAndroid = /Android/i.test(navigator.userAgent);

  const threshold_val = Math.max(5, 150 * (1 - threshold));
  const isVoiceActive = isAndroid ? (status === 'listening') : (volume > threshold_val);
  
  const transcript = localTrigger.lastTranscript;
  const matchedWord = matchMovementCommand(transcript, appLanguage === 'en' ? 'en' : 'fr');

  const instruction = appLanguage === 'en' ? 'Say "No" or "False" 3 times' : 'Dites "Faux" ou "Non" 3 fois';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--text-primary)]/5">
              <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                animate={{ width: `${(progress / 3) * 100}%` }}
              />
            </div>

            <div className="text-center space-y-6 relative z-10">
              <div className="space-y-2">
                <div className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center mx-auto ${isVoiceActive ? 'bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.8)] scale-110' : 'bg-[var(--text-primary)]/10'}`}>
                  <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-white' : 'bg-[var(--text-primary)]/20'}`} />
                </div>
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-none uppercase">
                  {instruction}
                </h2>
                <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
                  {appLanguage === 'en' ? 'No / False' : 'Faux / Non'}
                </p>
                {/* Earphone tip */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Headphones className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <p className="text-[var(--text-secondary)] text-[9px] font-bold uppercase tracking-widest">
                    {appLanguage === 'en' ? 'Earphones recommended' : 'Écouteurs recommandés'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4 py-4">
                {[1, 2, 3].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 ${
                      progress > i 
                        ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-110' 
                        : 'bg-[var(--text-primary)]/5 border-[var(--border-color)] opacity-30'
                    }`}
                  >
                    {progress > i ? <Check className="w-6 h-6 text-white" /> : <span className="text-[var(--text-primary)]/20 font-black text-sm">{i + 1}</span>}
                  </div>
                ))}
              </div>

              {progress > 0 && progress < 3 && (
                <p className="text-[var(--acc-primary)] text-[10px] font-black uppercase tracking-widest -mt-2">
                  {appLanguage === 'en'
                    ? `${3 - progress} more to go`
                    : `Encore ${3 - progress}`}
                </p>
              )}

              <div className="bg-black/40 border border-[var(--border-color)] rounded-3xl p-6 text-center min-h-[80px] flex items-center justify-center">
                {matchedWord ? (
                  <motion.span 
                    key={matchedWord}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black text-emerald-400 uppercase italic"
                  >
                    {matchedWord}
                  </motion.span>
                ) : (
                  <span className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                    {appLanguage === 'en' ? 'Waiting for voice...' : 'En attente...'}
                  </span>
                )}
              </div>

              <button 
                onClick={onCancel}
                className="w-full py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] hover:text-[var(--text-primary)] transition-colors"
              >
                {appLanguage === 'en' ? 'Cancel' : 'Annuler'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
