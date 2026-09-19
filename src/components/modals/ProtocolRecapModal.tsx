import { translateMode } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';

export function ProtocolRecapModal({ ctx }: { ctx: AppCtx }) {
  const {
    workType, appMode, appLanguage, workDuration, setShowProtocolRecap,
    protocolNameDraft, setProtocolNameDraft, words, voiceMinInterval, setOpenProSetting,
    voiceMaxInterval, colorMinInterval, colorMaxInterval, chaosVisualWords,
    chaosAudioWords, chaosMinInterval, chaosMaxInterval, setView, saveCurrentAsProtocol,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-[3400] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
      onClick={() => { setShowProtocolRecap(false); setProtocolNameDraft(''); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar premium-card rounded-[2rem] p-8 space-y-6"
      >
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black uppercase italic text-[var(--text-primary)] tracking-tight">
              {appLanguage === 'en' ? 'Protocol recap' : 'Récapitulatif du protocole'}
            </h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
              {appLanguage === 'en' ? 'Check everything before saving' : 'Vérifie tout avant de sauvegarder'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-4 py-3">
              <div>
                <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                  {appLanguage === 'en' ? 'Mode' : 'Mode'}
                </p>
                <p className="text-sm font-black text-[var(--text-primary)] uppercase italic">
                  {translateMode(appMode, appLanguage || 'fr')}
                </p>
              </div>
              <button
                onClick={() => { setShowProtocolRecap(false); setOpenProSetting('specificMode'); }}
                className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-widest active:scale-95 shrink-0"
              >
                {appLanguage === 'en' ? 'Edit' : 'Modifier'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-4 py-3">
              <div>
                <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                  {appLanguage === 'en' ? 'Stimuli' : 'Stimulis'}
                </p>
                <p className="text-sm font-black text-[var(--text-primary)] uppercase italic">
                  {appMode === 'CHAOS'
                    ? `${chaosAudioWords.length + chaosVisualWords.length} ${appLanguage === 'en' ? 'configured' : 'configurés'}`
                    : `${words.length} ${appLanguage === 'en' ? 'words' : 'mots'}`}
                </p>
              </div>
              <button
                onClick={() => { setShowProtocolRecap(false); setView('library'); }}
                className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-widest active:scale-95 shrink-0"
              >
                {appLanguage === 'en' ? 'Edit' : 'Modifier'}
              </button>
            </div>

            {(() => {
              const min = appMode === 'COLOR' ? colorMinInterval : appMode === 'CHAOS' ? chaosMinInterval : voiceMinInterval;
              const max = appMode === 'COLOR' ? colorMaxInterval : appMode === 'CHAOS' ? chaosMaxInterval : voiceMaxInterval;
              const isDefault = min === 2 && max === 5;
              return (
                <div className="flex items-center justify-between bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest flex items-center gap-1.5">
                      {appLanguage === 'en' ? 'Interval' : 'Intervalle'}
                      {isDefault && <span>⚠️</span>}
                    </p>
                    <p className="text-sm font-black text-[var(--text-primary)] font-mono">
                      {min.toFixed(1)}s - {max.toFixed(1)}s
                    </p>
                    {isDefault && (
                      <p className="text-[8px] text-orange-400 font-bold uppercase tracking-tight mt-0.5">
                        {appLanguage === 'en' ? 'Still default — check it\u2019s intended' : 'Encore par défaut — vérifie que c\u2019est voulu'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowProtocolRecap(false); setOpenProSetting('intervals'); }}
                    className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-widest active:scale-95 shrink-0"
                  >
                    {appLanguage === 'en' ? 'Edit' : 'Modifier'}
                  </button>
                </div>
              );
            })()}

            <div className="flex items-center justify-between bg-black/30 border border-[var(--acc-primary)]/10 rounded-2xl px-4 py-3">
              <div>
                <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                  {appLanguage === 'en' ? 'Session' : 'Séance'}
                </p>
                <p className="text-sm font-black text-[var(--text-primary)]">
                  {workDuration} min · {workType === 'CONTINUOUS' ? (appLanguage === 'en' ? 'Continuous' : 'Continu') : (appLanguage === 'en' ? 'Intermittent' : 'Intermittent')}
                </p>
              </div>
              <button
                onClick={() => { setShowProtocolRecap(false); setOpenProSetting('session'); }}
                className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-widest active:scale-95 shrink-0"
              >
                {appLanguage === 'en' ? 'Edit' : 'Modifier'}
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={protocolNameDraft}
              onChange={(e) => setProtocolNameDraft(e.target.value)}
              placeholder={appLanguage === 'en' ? 'Protocol name...' : 'Nom du protocole...'}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--acc-primary)] text-[var(--text-primary)] font-bold"
            />
            <button
              onClick={() => {
                if (!protocolNameDraft.trim()) return;
                saveCurrentAsProtocol(protocolNameDraft.trim());
                setProtocolNameDraft('');
                setShowProtocolRecap(false);
              }}
              disabled={!protocolNameDraft.trim()}
              className="w-full py-4 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black uppercase italic tracking-tight active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              {appLanguage === 'en' ? 'Confirm & save' : 'Confirmer et sauvegarder'}
            </button>
          </div>
      </div>
    </div>
  );
}
