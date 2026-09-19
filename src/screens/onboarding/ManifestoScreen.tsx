import { ChevronLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { AppCtx } from '../../app/useAppCtx';

export function ManifestoScreen({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, appProfile, setOnboardingStep, resetToProfileSelection,
  } = ctx;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-[200] overflow-hidden">
      <button
        onClick={resetToProfileSelection}
        aria-label={appLanguage === 'en' ? 'Back' : 'Retour'}
        style={{ top: 'max(20px, var(--safe-top))' }}
        className="absolute left-5 z-20 w-9 h-9 rounded-full bg-white/5 border border-[var(--acc-primary)]/10 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {/* Micro-interaction: neural chaos background (subtle, reduced motion load) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [0.8, 1.2, 0.8],
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className="absolute text-[8vw] font-black text-[var(--acc-primary)] italic tracking-tighter"
            style={{ 
              left: `${Math.random() * 80 + 10}%`, 
              top: `${Math.random() * 80 + 10}%` 
            }}
          >
            {appLanguage === 'en' 
              ? (['LEFT', 'RIGHT', 'UP', 'DOWN', 'GO'][Math.floor(Math.random() * 5)])
              : (['GAUCHE', 'DROITE', 'HAUT', 'BAS', 'VITE'][Math.floor(Math.random() * 5)])
            }
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-12 relative z-10"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
            className="w-14 h-14 rounded-2xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/30 flex items-center justify-center mx-auto text-[var(--acc-primary)]"
          >
            <CheckCircle2 className="w-7 h-7" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
            {appLanguage === 'en' ? 'PROFILE' : 'PROFIL'} <br />
            <span className="text-[var(--acc-primary)] drop-shadow-[0_0_16px_var(--shadow-acc)]">{appLanguage === 'en' ? 'READY' : 'PRÊT'}</span>
          </h1>
          <div className="h-1.5 w-24 bg-[var(--acc-primary)] mx-auto rounded-full shadow-[0_0_15px_var(--shadow-acc)]" />
          <p className="text-white text-base font-bold uppercase italic tracking-tight max-w-[300px] mx-auto leading-tight">
            {appProfile === 'GUIDED'
              ? (appLanguage === 'en' 
                  ? 'Guided mode unlocked. We\'ll walk you through every choice, step by step.' 
                  : 'Mode Guidé activé. On t\'accompagne pas à pas, choix par choix.')
              : (appLanguage === 'en' 
                  ? 'Expert mode unlocked. Full control, every setting is yours to tune.' 
                  : 'Mode Expert activé. Contrôle total, chaque réglage est entre tes mains.')
            }
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOnboardingStep('DONE')}
          className="w-full py-7 bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black text-xl uppercase italic rounded-[2rem] transition-all shadow-[0_0_40px_rgba(251,191,36,0.3)] flex items-center justify-center gap-4 group"
        >
          {appLanguage === 'en' ? "LET'S GO" : "C'EST PARTI"}
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}
