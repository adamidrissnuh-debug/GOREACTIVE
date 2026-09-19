import { motion } from 'motion/react';
import { getAppModeClass } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';
import { GuidedSettingsPanel } from './GuidedSettingsPanel';
import { ProSettingsPanel } from './ProSettingsPanel';

export function SettingsView({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, appLanguage, appProfile, settingsScrollRef, startProTutorial,
  } = ctx;

  return (
    <motion.div 
        key="settings" 
        ref={settingsScrollRef}
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }}
        className="absolute inset-0 p-4 sm:p-6 flex flex-col space-y-6 overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]"
      >
        <header className="mb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
                {appLanguage === 'en' ? 'Settings' : 'Réglages'}
              </h1>
            </div>
            {appProfile === 'PRO' && (
              <button
                onClick={startProTutorial}
                aria-label={appLanguage === 'en' ? 'Show tutorial' : 'Afficher le tutoriel'}
                className="w-8 h-8 rounded-full border border-[var(--acc-primary)]/30 bg-[var(--acc-primary)]/10 text-[var(--acc-primary)] flex items-center justify-center font-black text-sm active:scale-90 hover:bg-[var(--acc-primary)]/20 transition-all shrink-0"
              >
                ?
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appProfile === 'GUIDED' ? (
            <GuidedSettingsPanel ctx={ctx} />
          ) : (
            <>
          {/* Mode de Travail - Movement Class Only */}
          {getAppModeClass(appMode!) === 'MOVEMENT' && (
            <ProSettingsPanel ctx={ctx} />
          )}


        {/* Session Timing - Second redundant block removed */}


        </>
      )}
      </div>

      <div className="h-24 shrink-0" />
      <motion.div 
        layoutId="active-settings-glow"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--acc-primary)]/5 to-transparent pointer-events-none"
      />
    </motion.div>
  );
}
