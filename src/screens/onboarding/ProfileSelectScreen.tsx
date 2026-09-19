import { motion } from 'motion/react';
import { Shield, ChevronRight, Zap } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function ProfileSelectScreen({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setAppProfile, setOnboardingStep,
  } = ctx;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-[200]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-10"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">
            {appLanguage === 'en' ? 'CHOOSE YOUR' : 'CHOISIS TON'} <br />
            <span className="text-[var(--acc-primary)] drop-shadow-[0_0_12px_var(--shadow-acc)]">{appLanguage === 'en' ? 'EXPERIENCE' : 'EXPÉRIENCE'}</span>
          </h1>
          <div className="h-1 w-16 bg-[var(--acc-primary)] mx-auto rounded-full shadow-[0_0_10px_var(--shadow-acc)]" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => {
              setAppProfile('PRO');
              localStorage.setItem('goreactive_profile', 'PRO');
              setOnboardingStep('MANIFESTO');
            }}
            className="group relative overflow-hidden bg-white/5 border border-[var(--acc-primary)]/10 p-8 rounded-3xl transition-all hover:bg-white/10 hover:border-[var(--acc-primary)]/30 text-left"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 rounded-2xl bg-white/10 text-white group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic transition-colors">
                  {appLanguage === 'en' ? 'Expert (Pro)' : 'Expert (Pro)'}
                </h2>
                <p className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide opacity-60 mt-1">
                  {appLanguage === 'en' ? 'Full control, advanced settings' : 'Contrôle total, réglages avancés'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--acc-primary)]/60 group-hover:text-white transition-colors" />
            </div>
          </button>

          <button 
            onClick={() => {
              setAppProfile('GUIDED');
              localStorage.setItem('goreactive_profile', 'GUIDED');
              setOnboardingStep('MANIFESTO');
            }}
            className="group relative overflow-hidden bg-[var(--acc-primary)]/5 border border-[var(--acc-primary)]/20 p-8 rounded-3xl transition-all hover:bg-[var(--acc-primary)]/10 hover:border-[var(--acc-primary)]/40 text-left"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 rounded-2xl bg-[var(--acc-primary)]/20 text-[var(--acc-primary)] group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic group-hover:text-[var(--acc-primary)] transition-colors">
                  {appLanguage === 'en' ? 'Guided (Athletes)' : 'Guidé (Athlètes)'}
                </h2>
                <p className="text-[var(--acc-primary)] text-[10px] uppercase tracking-wide opacity-80 mt-1">
                  {appLanguage === 'en' ? 'Structured levels, tutorial-first' : 'Niveaux structurés, tutoriels inclus'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--acc-primary)]/40 group-hover:text-[var(--acc-primary)] transition-colors" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
