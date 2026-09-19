import { motion } from 'motion/react';
import type { AppCtx } from '../../app/useAppCtx';

export function ExitConfirmModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setShowExitConfirm,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-[3300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={() => setShowExitConfirm(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="premium-card border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-6 text-center"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic">
            {appLanguage === 'en' ? 'Quit GoReactive?' : 'Fermer GoReactive ?'}
          </h2>
          <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            {appLanguage === 'en' ? 'The app will close completely.' : "L'application se fermera complètement."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExitConfirm(false)}
            className="flex-1 py-4 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10 text-[var(--text-primary)] font-black uppercase tracking-widest text-xs active:scale-95 hover:bg-white/10 transition-all"
          >
            {appLanguage === 'en' ? 'No' : 'Non'}
          </button>
          <button
            onClick={() => {
              import('@capacitor/app').then(({ App: CapacitorApp }) => CapacitorApp.exitApp());
            }}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs active:scale-95 hover:bg-red-600 transition-all"
          >
            {appLanguage === 'en' ? 'Yes' : 'Oui'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
