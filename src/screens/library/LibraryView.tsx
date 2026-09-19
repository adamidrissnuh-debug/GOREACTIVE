import { motion } from 'motion/react';
import type { AppCtx } from '../../app/useAppCtx';
import { LibraryChaosPanel } from './LibraryChaosPanel';
import { LibraryColorPanel } from './LibraryColorPanel';
import { LibraryWordsPanel } from './LibraryWordsPanel';

export function LibraryView({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, visualStimuliIncludesWords, appLanguage, clearWords,
  } = ctx;

  return (
    <motion.div 
      key="library" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 p-6 flex flex-col overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]"
    >
      {(appMode === 'CHAOS') ? (
        <LibraryChaosPanel ctx={ctx} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
                   {(appMode === 'COLOR') ? (appLanguage === 'en' ? 'Visual Stimuli' : 'Stimuli Visuels') : (appLanguage === 'en' ? 'Vocal Matrix' : 'Matrice Vocale')}
                </h2>
              </div>
            </div>
            {!(appMode === 'COLOR') && (
            <div className="flex gap-4">
              <button onClick={clearWords} className="text-[9px] uppercase opacity-40 hover:opacity-70 active:opacity-100 text-red-400 py-1 font-bold transition-opacity">
                {appLanguage === 'en' ? 'Clear all' : 'Tout effacer'}
              </button>
            </div>
            )}
          </div>

          {/* Original Stimuli content for non-Chaos modes */}
          {(appMode === 'COLOR') && (
            <LibraryColorPanel ctx={ctx} />
          )}

          {/* Matrix section */}
          {(appMode === 'VOICE' || visualStimuliIncludesWords) && (
            <LibraryWordsPanel ctx={ctx} />
          )}
        </>
      )}
    </motion.div>
  );
}
