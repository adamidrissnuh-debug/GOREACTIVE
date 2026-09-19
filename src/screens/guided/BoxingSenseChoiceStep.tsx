import { motion } from 'motion/react';
import { Ear, Eye, ChevronRight } from 'lucide-react';
import { AppMode } from '../../types';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function BoxingSenseChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, guidedActivity, setGuidedAppMode, setGuidedSignalMode,
    enterBoxingTutorial, getGuidedProgress,
  } = ctx;

  return (
    <motion.div 
      key="guided-boxing-sense"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <GuidedHeader
        onBack={() => setGuidedStep('ACTIVITY_EXPLAIN')}
        step={getGuidedProgress()?.step}
        total={getGuidedProgress()?.total}
        appLanguage={appLanguage}
      />
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter text-center">
          {appLanguage === 'en' ? 'SELECT SENSE' : 'CHOISIS LE SENS'}
        </h1>
        <div className="h-1 w-12 bg-[var(--acc-primary)] mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
        {[
          { 
            id: 'VOICE', 
            icon: <Ear className="w-8 h-8"/>, 
            label: appLanguage === 'en' ? 'AUDIO' : 'AUDIO', 
            desc: appLanguage === 'en' 
              ? 'Vocal technical commands' 
              : 'Instructions vocales', 
            color: 'text-[var(--acc-primary)]', 
            bg: 'bg-[var(--acc-primary)]/10' 
          },
          { 
            id: 'COLOR', 
            icon: <Eye className="w-8 h-8"/>, 
            label: appLanguage === 'en' ? 'VISUAL' : 'VISUEL', 
            desc: appLanguage === 'en' 
              ? 'On-screen color signals' 
              : 'Instructions visuelles', 
            color: 'text-[var(--acc-primary)]', 
            bg: 'bg-[var(--acc-primary)]/10' 
          },
          { 
            id: 'CHAOS', 
            icon: (
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Eye className="w-7 h-7 absolute -top-1 -left-1 opacity-80" />
                <Ear className="w-7 h-7 absolute -bottom-1 -right-1 text-[var(--text-secondary)]" />
              </div>
            ), 
            label: appLanguage === 'en' ? 'MIXED' : 'MIXTE', 
            desc: appLanguage === 'en' 
              ? 'Audio commands + Color filters (True/False)' 
              : 'Commandes audio + filtres couleur (vrai/faux)', 
            color: 'text-[var(--acc-primary)]', 
            bg: 'bg-[var(--acc-primary)]/10' 
          },
        ].map(m => (
          <button 
            key={m.id}
            onClick={() => { 
              const mode = m.id as AppMode;
              setGuidedAppMode(mode); 
              setGuidedSignalMode(mode === 'VOICE' ? 'AUDIO' : mode === 'COLOR' ? 'VISUAL' : 'CHAOS');
              if (guidedActivity === 'BOXING') {
                enterBoxingTutorial();
              } else {
                setGuidedStep('LEVEL_CHOICE');
              }
            }}
            className="group flex flex-col gap-3 bg-zinc-900 border border-[var(--acc-primary)]/5 p-6 rounded-[2rem] transition-all hover:bg-zinc-800 hover:border-[var(--acc-primary)]/20 text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center ${m.color} group-hover:scale-110 transition-transform duration-500`}>
                {m.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black uppercase italic group-hover:text-white transition-colors`}>
                  {m.label}
                </h3>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">
                  {m.desc}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-[var(--acc-primary)]/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
