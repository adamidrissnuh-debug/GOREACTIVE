import { motion } from 'motion/react';
import BoxingTutorialScene from './BoxingTutorialScene';
import { Activity, ChevronRight } from 'lucide-react';
import { GuidedHeader } from '../components/ui/GuidedHeader';
import type { AppCtx } from '../app/useAppCtx';

export function BoxingTutorialStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, tutorialStep, setTutorialStep, guidedAppMode,
    boxingTutorialMessages, currentTutorialMessage, getGuidedProgress,
  } = ctx;

  return (
    <motion.div
      key="guided-boxing-tutorial"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col pt-safe overflow-hidden"
    >
      {/* ANIMATED SCENE: ~70% height */}
      <div className="h-[68%] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 z-40 px-4">
          <GuidedHeader
            onBack={() => setGuidedStep('BOXING_SENSE_CHOICE')}
            step={getGuidedProgress()?.step}
            total={getGuidedProgress()?.total}
            appLanguage={appLanguage}
            onSkip={() => { setGuidedStep('BOXING_LEVEL_EXPLAIN'); }}
          />
        </div>
        <BoxingTutorialScene 
          mode={guidedAppMode as any || 'VOICE'} 
          language={appLanguage} 
          step={tutorialStep} 
        />
      </div>

      {/* INSTRUCTION CARD: ~17% height */}
      <div className="h-[17%] px-6 flex items-center justify-center">
        <motion.div 
          key={tutorialStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/[0.03] border border-[var(--acc-primary)]/5 p-4 rounded-2xl backdrop-blur-3xl shadow-2xl overflow-y-auto max-h-full"
        >
           <div className="flex items-center gap-3 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[var(--acc-primary)]/10 flex items-center justify-center text-[var(--acc-primary)]">
                 <Activity className="w-3 h-3" />
              </div>
              <h4 className="text-white font-black text-lg italic tracking-tighter uppercase whitespace-nowrap">
                {currentTutorialMessage.title}
              </h4>
           </div>
           <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed">
             {currentTutorialMessage.desc}
           </p>
        </motion.div>
      </div>

      {/* NAVIGATION BAR: Remaining height */}
      <div className="flex-1 flex flex-col justify-center px-8 pb-4">
         <div className="max-w-md mx-auto w-full space-y-2">
            <button 
              onClick={() => {
                if (tutorialStep < boxingTutorialMessages.length - 1) {
                  setTutorialStep(prev => prev + 1);
                } else {
                  setGuidedStep('BOXING_LEVEL_EXPLAIN');
                }
              }}
              className="w-full bg-[var(--acc-primary)] text-black font-black uppercase italic tracking-tighter py-4 rounded-xl hover:bg-[var(--acc-primary)] transition-all text-xl shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 group shrink-0"
            >
              {tutorialStep < boxingTutorialMessages.length - 1 
                ? (appLanguage === 'en' ? 'CONTINUE' : "CONTINUER")
                : (appLanguage === 'en' ? 'START TRAINING' : "COMMENCER")
              }
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>
    </motion.div>
  );
}
