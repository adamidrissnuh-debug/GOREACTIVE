import { SPEED_TIERS, GUIDED_PRESETS } from '../../constants/guidedPresets';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function PendingPackChoiceModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, guidedStimuliCount, pendingPackChoiceTier, setPendingPackChoiceTier,
    applyGuidedSpeedLevel,
  } = ctx;

  const tier = SPEED_TIERS.find(t => t.tier === pendingPackChoiceTier) || SPEED_TIERS[0];
  const shortPacks = GUIDED_PRESETS.BOXING.STIMULI_PACKS.filter((p: any) => p.id !== 'FULL');
  return (
    <motion.div
      key="pending-pack-choice-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
      onClick={() => setPendingPackChoiceTier(null)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 8 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-zinc-950 border border-[var(--acc-primary)]/10 rounded-[2rem] p-6"
      >
        <div className="text-center mb-5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--acc-primary)]">
            {appLanguage === 'en' ? 'LEVEL' : 'NIVEAU'} {tier.tier} — {appLanguage === 'en' ? tier.label.en : tier.label.fr}
          </span>
          <h2 className="text-lg font-black uppercase italic text-white tracking-tight mt-1">
            {appLanguage === 'en' ? 'Choose a command pack' : 'Choisis un pack de commandes'}
          </h2>
          <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center mt-2">
            {appLanguage === 'en'
              ? 'Short words only at this speed (Numbers / Tags)'
              : 'Mots courts uniquement à cette vitesse (Chiffres / Tags)'}
          </p>
        </div>

        <div className="space-y-3">
          {shortPacks.map((pack: any) => (
            <button
              key={pack.id}
              onClick={() => {
                applyGuidedSpeedLevel(pendingPackChoiceTier, guidedStimuliCount, pack.id);
                setPendingPackChoiceTier(null);
              }}
              className="w-full p-4 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10 text-left flex items-center justify-between active:scale-95 hover:bg-[var(--acc-primary)] hover:text-[var(--acc-on-primary)] hover:border-[var(--acc-primary)] transition-all group"
            >
              <span className="text-sm font-black uppercase italic tracking-tight">
                {pack.name[appLanguage || 'fr']}
              </span>
              <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
