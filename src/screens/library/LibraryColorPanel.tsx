import { Palette, Check } from 'lucide-react';
import { RAINBOW_COLORS } from '../../constants/colors';
import type { AppCtx } from '../../app/useAppCtx';

export function LibraryColorPanel({ ctx }: { ctx: AppCtx }) {
  const {
    visualStimuliIncludesColors, setVisualStimuliIncludesColors,
    visualStimuliIncludesWords, setVisualStimuliIncludesWords, activeRainbowColors,
    setActiveRainbowColors, appLanguage,
  } = ctx;

  return (
    <div className="premium-card p-5 rounded-3xl space-y-6 mb-6">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
            {appLanguage === 'en' ? 'Mode' : 'Mode'}
          </h2>
        </div>

        <div className="flex gap-2">
           <button 
            onClick={() => {
              const nextVal = !visualStimuliIncludesColors;
              if (!nextVal && !visualStimuliIncludesWords) return;
              setVisualStimuliIncludesColors(nextVal);
            }}
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${visualStimuliIncludesColors ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)]' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            <div className={`w-3 h-3 rounded-sm border ${visualStimuliIncludesColors ? 'bg-black border-black' : 'border-[var(--acc-primary)]/20'} flex items-center justify-center`}>
              {visualStimuliIncludesColors && <Check className="w-2.5 h-2.5 text-[var(--acc-primary)]" />}
            </div>
            {appLanguage === 'en' ? 'Colors' : 'Couleurs'}
          </button>
          <button 
            onClick={() => {
              const nextVal = !visualStimuliIncludesWords;
              if (!nextVal && !visualStimuliIncludesColors) return;
              setVisualStimuliIncludesWords(nextVal);
            }}
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${visualStimuliIncludesWords ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)]' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            <div className={`w-3 h-3 rounded-sm border ${visualStimuliIncludesWords ? 'bg-black border-black' : 'border-[var(--acc-primary)]/20'} flex items-center justify-center`}>
              {visualStimuliIncludesWords && <Check className="w-2.5 h-2.5 text-[var(--acc-primary)]" />}
            </div>
            {appLanguage === 'en' ? 'Words' : 'Mots'}
          </button>
        </div>
      </div>

      {visualStimuliIncludesColors ? (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {RAINBOW_COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => {
                setActiveRainbowColors(prev => 
                  prev.includes(color.id) ? prev.filter(id => id !== color.id) : [...prev, color.id]
                );
              }}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all group ${
                                activeRainbowColors.includes(color.id) 
                                  ? 'bg-white/5 border-[var(--acc-primary)]/20' 
                                  : 'bg-transparent border-[var(--acc-primary)]/5 opacity-40 grayscale hover:grayscale-0'
                              }`}
            >
              <div 
                className={`w-6 h-6 rounded-full shadow-lg transition-transform group-hover:scale-110`}
                style={{ backgroundColor: color.hex, boxShadow: activeRainbowColors.includes(color.id) ? `0 0 15px ${color.hex}66` : 'none' }}
              />
              <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">
                {appLanguage === 'en' ? color.labels.en : color.labels.fr}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
