import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function AboutModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setShowAboutModal,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-[3200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
      onClick={() => setShowAboutModal(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] rounded-[2rem] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl flex flex-col"
      >
        <div className="relative w-full h-52 shrink-0 overflow-hidden bg-black">
          <img
            src="./goreactive-logo.png"
            alt="GoReactive"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent" />
          <button
            onClick={() => setShowAboutModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[var(--text-secondary)] active:scale-90 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5 text-center overflow-y-auto custom-scrollbar">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              GO<span className="text-[var(--acc-primary)]">REACTIVE</span>
            </h2>
            <p className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-[0.3em] mt-1">
              {appLanguage === 'en' ? 'v1.0 — Training Support' : "v1.0 — Support d'Entraînement"}
            </p>
          </div>
          <div className="space-y-3 text-left">
            <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">
              {appLanguage === 'en'
                ? "Created by a sports coach and Adapted Physical Activity (APA) teacher, passionate about movement."
                : "Créée par un coach sportif et enseignant en Activité Physique Adaptée (APA-S), passionné de mouvement."}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              {appLanguage === 'en'
                ? "GoReactive is built for anyone who wants to sharpen their reactivity, and just as much for movement professionals — coaches, physical trainers, APA teachers — looking for a simple, reliable field tool."
                : "GoReactive s'adresse aussi bien à toute personne qui veut améliorer sa réactivité, qu'aux professionnels du mouvement — coachs, préparateurs physiques, enseignants APA — à la recherche d'un outil de terrain simple et fiable."}
            </p>
          </div>
          <button
            onClick={() => setShowAboutModal(false)}
            className="w-full py-3 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform"
          >
            {appLanguage === 'en' ? 'Close' : 'Fermer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
