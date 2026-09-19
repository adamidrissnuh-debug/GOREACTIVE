import { motion } from 'motion/react';
import { Zap, ChevronRight } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function LanguageSelectScreen({ ctx }: { ctx: AppCtx }) {
  const {
    setAppLanguage, setOnboardingStep,
  } = ctx;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-[200] overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-40" 
          style={{ background: 'radial-gradient(circle at 50% 38%, rgba(251,191,36,0.16), transparent 55%)' }} 
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-12 relative z-10"
        >
          <div className="space-y-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                filter: ["drop-shadow(0 0 0px var(--acc-primary))", "drop-shadow(0 0 15px var(--acc-primary))", "drop-shadow(0 0 0px var(--acc-primary))"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-[var(--acc-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 rounded-full border border-[var(--acc-primary)]/30 animate-ping opacity-20" />
              <Zap className="w-12 h-12 text-[var(--acc-primary)]" />
            </motion.div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              GO<span className="text-[var(--acc-primary)] drop-shadow-[0_0_12px_var(--shadow-acc)]">REACTIVE</span>
            </h1>
            <p className="text-[var(--acc-primary)] text-[11px] font-bold uppercase tracking-[0.4em] opacity-80 mt-2">
              Select your language / Choisis ta langue
            </p>
          </div>
    <div className="grid grid-cols-1 gap-4">
            <motion.button 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => {
                setAppLanguage('en');
                setOnboardingStep('TUTORIAL');
              }}
              className="group relative overflow-hidden bg-white/5 border border-[var(--acc-primary)]/10 p-6 rounded-3xl transition-all hover:bg-[var(--acc-primary)]/10 hover:border-[var(--acc-primary)]/50 active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <div className="text-2xl font-black text-[var(--text-primary)] uppercase italic group-hover:text-[var(--acc-primary)] transition-colors">English</div>
                  <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-widest opacity-60">Continue in English</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--acc-primary)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
              </div>
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              onClick={() => {
                setAppLanguage('fr');
                setOnboardingStep('TUTORIAL');
              }}
              className="group relative overflow-hidden bg-white/5 border border-[var(--acc-primary)]/10 p-6 rounded-3xl transition-all hover:bg-[var(--acc-primary)]/10 hover:border-[var(--acc-primary)]/50 active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <div className="text-2xl font-black text-[var(--text-primary)] uppercase italic group-hover:text-[var(--acc-primary)] transition-colors">Français</div>
                  <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-widest opacity-60">Continuer en français</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--acc-primary)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
  );
}
