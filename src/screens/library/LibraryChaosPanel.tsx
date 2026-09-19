import {
  Eye,
  X,
  Mic,
  Zap,
  Volume2,
  Trash2,
} from 'lucide-react';
import { RAINBOW_COLORS } from '../../constants/colors';
import { fastIntervalWarning } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';

export function LibraryChaosPanel({ ctx }: { ctx: AppCtx }) {
  const {
    activeRainbowColors, setActiveRainbowColors, appLanguage, recordingWord,
    voiceRecordings, chaosVisualMode, setChaosVisualMode, chaosAudioMode,
    setChaosAudioMode, chaosVisualWords, setChaosVisualWords, chaosAudioWords,
    setChaosAudioWords, newChaosVisualWord, setNewChaosVisualWord, newChaosAudioWord,
    setNewChaosAudioWord, addChaosVisualWord, addChaosAudioWord, startRecording,
    stopRecording,
  } = ctx;

  return (
    <div className="space-y-8 pb-32">
      <header>
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--acc-primary)] italic">
          {appLanguage === 'en' ? 'Chaos Stimuli' : 'Stimuli Mode Chaos'}
        </h2>
        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black mt-1">
          {appLanguage === 'en' ? 'Configure visual and auditory triggers' : 'Configure les déclencheurs visuels et auditifs'}
        </p>
      </header>

      <div className="bg-[var(--acc-primary)]/5 border border-[var(--acc-primary)]/20 rounded-2xl p-4">
        <p className="text-[10px] text-[var(--acc-primary)] font-bold uppercase tracking-tight text-center leading-relaxed">
          {appLanguage === 'en' 
            ? "Configure the stimuli below for the Chaos mode. These will be triggered during training." 
            : "Configure les stimuli ci-dessous pour le mode Chaos. Ils seront déclenchés pendant l'entraînement."}
        </p>
      </div>

      {/* Chaos Visual Stimuli */}
      <div className="premium-card p-5 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--acc-primary)]/10 flex items-center justify-center text-[var(--acc-primary)]">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
            {appLanguage === 'en' ? '👁 Visual Stimulus' : '👁 Stimulus visuel'}
          </h2>
        </div>

        <div className="space-y-4">
          <select 
            value={chaosVisualMode} 
            onChange={(e) => setChaosVisualMode(e.target.value as any)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white focus:outline-none focus:border-[var(--acc-primary)] appearance-none cursor-pointer"
          >
            <option value="NONE">{appLanguage === 'en' ? 'None' : 'Aucun'}</option>
            <option value="COLORS">{appLanguage === 'en' ? 'Colors' : 'Couleurs'}</option>
            <option value="WORDS">{appLanguage === 'en' ? 'Words' : 'Mots'}</option>
            <option value="BOTH">{appLanguage === 'en' ? 'Both' : 'Couleurs + Mots'}</option>
          </select>

          {(chaosVisualMode === 'COLORS' || chaosVisualMode === 'BOTH') && (
            <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)]">
              <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase mb-3">
                {appLanguage === 'en' ? 'Visual Colors' : 'Couleurs visuelles'}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {RAINBOW_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setActiveRainbowColors(prev => 
                        prev.includes(color.id) ? prev.filter(id => id !== color.id) : [...prev, color.id]
                      );
                    }}
                    className={`p-2 rounded-xl border transition-all ${
                                  activeRainbowColors.includes(color.id) ? 'bg-white/5 border-[var(--acc-primary)]/20' : 'bg-transparent border-[var(--acc-primary)]/5 opacity-40 grayscale'
                                }`}
                  >
                    <div className="w-4 h-4 rounded-full mx-auto" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {(chaosVisualMode === 'WORDS' || chaosVisualMode === 'BOTH') && (
            <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] space-y-4">
                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                  {appLanguage === 'en' ? 'Visual Word Pool' : 'Mots visuels'}
                </p>
                <form onSubmit={addChaosVisualWord} className="flex gap-2">
                  <input 
                    type="text" value={newChaosVisualWord} onChange={(e) => setNewChaosVisualWord(e.target.value)}
                    placeholder={appLanguage === 'en' ? "Visual word..." : "Mot visuel..."}
                    className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[var(--acc-primary)] text-white font-bold"
                  />
                  <button type="submit" className="bg-[var(--acc-primary)] text-white px-4 font-black rounded-xl active:scale-90 transition-transform">+</button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {chaosVisualWords.map(w => (
                    <button
                      key={w}
                      onClick={() => setChaosVisualWords(prev => prev.filter(x => x !== w))}
                      className="bg-[var(--acc-primary)]/10 text-[var(--acc-primary)] border border-[var(--acc-primary)]/20 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 active:scale-95 hover:bg-[var(--acc-primary)]/20 transition-all"
                    >
                      {w} <X size={10} />
                    </button>
                  ))}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Chaos Auditory Stimuli */}
      <div className="premium-card p-5 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Mic className="w-4 h-4" />
          </div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
            {appLanguage === 'en' ? '🔊 Auditory Stimulus' : '🔊 Stimulus auditif'}
          </h2>
        </div>

        <div className="space-y-4">
          <select 
            value={chaosAudioMode} 
            onChange={(e) => setChaosAudioMode(e.target.value as any)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
          >
            <option value="NONE">{appLanguage === 'en' ? 'None' : 'Aucun'}</option>
            <option value="WORDS">{appLanguage === 'en' ? 'Words' : 'Mots'}</option>
          </select>

          {chaosAudioMode === 'WORDS' && (
            <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] space-y-4">
                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                  {appLanguage === 'en' ? 'Audio Word Pool' : 'Mots auditifs'}
                </p>
                <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight leading-snug flex items-start gap-1.5">
                  <Zap className="w-3 h-3 shrink-0 mt-0.5 text-[var(--acc-primary)]" />
                  {fastIntervalWarning(appLanguage)}
                </p>
                <form onSubmit={addChaosAudioWord} className="flex gap-2">
                  <input 
                    type="text" value={newChaosAudioWord} onChange={(e) => setNewChaosAudioWord(e.target.value)}
                    placeholder={appLanguage === 'en' ? "Audio word..." : "Mot auditif..."}
                    className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white font-bold"
                  />
                  <button type="submit" className="bg-emerald-500 text-black px-4 font-black rounded-xl active:scale-90 transition-transform">+</button>
                </form>
                <div className="space-y-2">
                  {chaosAudioWords.map(w => (
                    <div key={w} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-black uppercase italic text-white">{w}</span>
                      <div className="flex items-center gap-2">
                        {voiceRecordings[w] && (
                          <button
                            onClick={() => {
                              const audio = new Audio(voiceRecordings[w]);
                              audio.play();
                            }}
                            className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                        <button 
                          onMouseDown={() => startRecording(w)}
                          onMouseUp={() => stopRecording()}
                          onTouchStart={(e) => { e.preventDefault(); startRecording(w); }}
                          onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                                        recordingWord === w ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--acc-primary)]/5'
                                      }`}
                        >
                          <Mic size={14} />
                        </button>
                        <button onClick={() => setChaosAudioWords(prev => prev.filter(x => x !== w))} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center active:scale-90 transition-transform">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
