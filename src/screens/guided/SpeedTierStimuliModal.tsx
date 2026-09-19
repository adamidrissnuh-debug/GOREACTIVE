import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { SPEED_TIERS } from '../../constants/guidedPresets';
import type { AppCtx } from '../../app/useAppCtx';

export function SpeedTierStimuliModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, speedTierModalOpen, setSpeedTierModalOpen,
    selectedStimuliCount, setSelectedStimuliCount, setCountdownDuration,
    setGuidedWorkDuration, setGuidedWorkType, applyGuidedSpeedLevel,
  } = ctx;

  return (
    <motion.div
      key="speed-tier-stimuli-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
      onClick={() => setSpeedTierModalOpen(null)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 8 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-zinc-950 border border-[var(--acc-primary)]/10 rounded-[2rem] p-6 relative"
      >
        <button
          onClick={() => setSpeedTierModalOpen(null)}
          aria-label={appLanguage === 'en' ? 'Close' : 'Fermer'}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-secondary)] active:scale-90 hover:bg-white/10 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        {(() => {
          const tier = SPEED_TIERS.find(t => t.tier === speedTierModalOpen) || SPEED_TIERS[0];
          const hue = 145 - ((tier.tier - 1) / 5) * 145;
          const confirmSelection = () => {
            if (selectedStimuliCount === null) return;
            applyGuidedSpeedLevel(tier.tier, selectedStimuliCount);
            setCountdownDuration(3);
            setGuidedWorkDuration(2);
            setGuidedWorkType('CONTINUOUS');
            setSpeedTierModalOpen(null);
            setGuidedStep('STIMULI_CHOICE');
          };
          return (
            <>
              <div className="text-center mb-5 pr-6">
                <span
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: `hsl(${hue}, 70%, 60%)` }}
                >
                  {appLanguage === 'en' ? 'LEVEL' : 'NIVEAU'} {tier.tier} — {appLanguage === 'en' ? tier.label.en : tier.label.fr}
                </span>
                <h2 className="text-lg font-black uppercase italic text-white tracking-tight mt-1">
                  {appLanguage === 'en' ? 'How many stimuli?' : 'Combien de stimulis ?'}
                </h2>
                {tier.shortWordsOnly && (
                  <p className="text-[9px] font-bold text-[var(--acc-primary)]/70 uppercase tracking-widest text-center mt-2">
                    {appLanguage === 'en'
                      ? 'Short words only at this speed (Numbers / Tags)'
                      : 'Mots courts uniquement à cette vitesse (Chiffres / Tags)'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((count) => {
                  const isSelected = selectedStimuliCount === count;
                  return (
                    <button
                      key={count}
                      onClick={() => setSelectedStimuliCount(count)}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-xl font-black italic active:scale-90 transition-all ${
                                      isSelected
                                        ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)] border border-[var(--acc-primary)] shadow-[0_0_0_4px_rgba(251,191,36,0.18)]'
                                        : 'bg-white/5 border border-[var(--acc-primary)]/10 text-white hover:bg-white/10 hover:border-[var(--acc-primary)]/30'
                                    }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedStimuliCount !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center mb-3">
                      {selectedStimuliCount} {appLanguage === 'en'
                        ? (selectedStimuliCount > 1 ? 'stimuli, continue?' : 'stimulus, continue?')
                        : (selectedStimuliCount > 1 ? 'stimulis, continuer ?' : 'stimulus, continuer ?')}
                    </p>
                    <button
                      onClick={confirmSelection}
                      className="w-full h-14 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black uppercase tracking-widest text-sm active:scale-95 transition-all"
                    >
                      {appLanguage === 'en' ? 'Continue' : 'Continuer'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </motion.div>
    </motion.div>
  );
}
