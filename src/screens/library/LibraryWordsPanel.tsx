import {
  Zap,
  Mic,
  Plus,
  Check,
  Trash2,
} from 'lucide-react';
import { fastIntervalWarning } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';

export function LibraryWordsPanel({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, appLanguage, recordingWord, voiceRecordings, setVoiceRecordings, words,
    setWords, newWord, setNewWord, startRecording, stopRecording, addWord, removeWord,
    startDictation,
  } = ctx;

  return (
    <>
      <div className="bg-[var(--acc-primary)]/5 border border-[var(--acc-primary)]/20 rounded-2xl p-4 mb-3">
        <div className="flex gap-3">
          <p className="text-[10px] text-[var(--text-primary)] leading-relaxed uppercase tracking-tight font-bold italic">
            {(appMode === 'COLOR')
              ? (appLanguage === 'en' ? 'Add words and/or numbers' : 'Ajoute des mots et/ou des chiffres')
              : (appLanguage === 'en' 
                ? 'Add words or numbers. AI voice is faster.'
                : 'Ajoute des mots ou chiffres. La voix IA est plus rapide.')}
          </p>
        </div>
      </div>
      {(appMode === 'VOICE') && (
        <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight leading-snug mb-6 px-1 flex items-start gap-1.5">
          <Zap className="w-3 h-3 shrink-0 mt-0.5 text-[var(--acc-primary)]" />
          {fastIntervalWarning(appLanguage)}
        </p>
      )}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-3 mb-6">
        <form onSubmit={addWord} className="flex gap-2">
           <div className="relative flex-1">
            <input 
              type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)}
              placeholder={appLanguage === 'en' ? "Add a word..." : "Ajouter un mot..."}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--acc-primary)] text-[var(--text-primary)] font-bold"
            />
            {!(appMode === 'COLOR') && (
              <button 
                type="button"
                onClick={startDictation}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--acc-primary)] active:scale-90 transition-all"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
          <button type="submit" className="bg-[var(--acc-primary)] text-[var(--acc-on-primary)] px-6 font-black border border-[var(--acc-primary)] rounded-xl active:scale-90 transition-all shadow-lg shadow-[var(--acc-primary)]/20">+</button>
        </form>
      </div>
      <div className="space-y-3 pb-32">
        {words.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--text-secondary)] italic gap-1">
            <Plus size={32} className="mb-2 opacity-60" />
            <span className="text-xs font-bold uppercase tracking-widest not-italic">{appLanguage === 'en' ? 'No words added' : 'Aucun mot ajouté'}</span>
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-70 not-italic max-w-[220px] text-center mt-1">
              {appLanguage === 'en' ? 'Add a few words below to start training.' : 'Ajoute quelques mots ci-dessous pour commencer.'}
            </span>
            <button
              onClick={() => setWords(appLanguage === 'en' ? ['Left', 'Right'] : ['Gauche', 'Droite'])}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/25 text-[var(--acc-primary)] text-[10px] font-black uppercase tracking-widest not-italic active:scale-95 hover:bg-[var(--acc-primary)]/20 transition-all"
            >
              {appLanguage === 'en' ? '+ Add Left/Right' : '+ Ajouter Gauche/Droite'}
            </button>
          </div>
        ) : (
          words.map(word => (
            <div key={word} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl flex justify-between items-center group active:bg-white/5 transition-colors">
              <div className="flex flex-col">
                <span className="text-base font-black italic uppercase text-[var(--text-primary)]">{word}</span>
                {voiceRecordings[word] && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[var(--acc-primary)] uppercase font-bold tracking-tight flex items-center gap-1">
                      <Check size={10} strokeWidth={4} />
                      {appLanguage === 'en' ? 'Audio Captured' : 'Audio Capturé'}
                    </span>
                    <button
                      onClick={() => {
                        const next = { ...voiceRecordings };
                        delete next[word];
                        setVoiceRecordings(next);
                      }}
                      className="text-red-500/50 hover:text-red-500 transition-colors"
                      title={appLanguage === 'en' ? 'Delete Recording' : 'Supprimer l\'enregistrement'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!(appMode === 'COLOR') && (
                  <button 
                    onMouseDown={() => startRecording(word)}
                    onMouseUp={() => stopRecording()}
                    onTouchStart={(e) => { e.preventDefault(); startRecording(word); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                      recordingWord === word ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => removeWord(word)} className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 active:bg-red-500 active:text-white transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
