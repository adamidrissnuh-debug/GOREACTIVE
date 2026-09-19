import { RefreshCw, Zap, ChevronRight, Trash2 } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function ProSettingsAppTab({ ctx }: { ctx: AppCtx }) {
  const {
    setAppMode, appLanguage, setAppLanguage, setShowAboutModal, resetToProfileSelection,
    setView,
  } = ctx;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h2 className="text-[9px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
          {appLanguage === 'en' ? 'Language' : 'Langue'}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {['en', 'fr'].map(lang => (
            <button 
              key={lang}
              onClick={() => setAppLanguage(lang as 'en' | 'fr')}
              className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              appLanguage === lang ? 'bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)] text-[var(--acc-primary)] shadow-lg' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                            }`}
            >
              {lang === 'en' ? 'English' : 'Français'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[9px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
          {appLanguage === 'en' ? 'Profile' : 'Profil'}
        </h2>
        <button 
          onClick={resetToProfileSelection}
          className="w-full flex items-center justify-center gap-3 bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 p-4 rounded-2xl text-[var(--acc-primary)] hover:bg-[var(--acc-primary)]/20 active:scale-95 transition-all group"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{appLanguage === 'en' ? 'Change Experience' : 'Changer d\'expérience'}</span>
        </button>
      </div>

      <button
        onClick={() => setShowAboutModal(true)}
        className="w-full flex items-center gap-4 text-left active:scale-[0.99] transition-transform"
      >
        <div className="w-11 h-11 rounded-xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/25 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-[var(--acc-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase italic">
            {appLanguage === 'en' ? 'About GoReactive' : 'À propos de GoReactive'}
          </h2>
          <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
            {appLanguage === 'en' ? 'Version, mission & credits' : 'Version, mission & crédits'}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] opacity-40 shrink-0" />
      </button>

      <div className="space-y-3 pt-3 border-t border-[var(--acc-primary)]/5">
        <h2 className="text-[9px] font-bold tracking-widest uppercase text-red-500/60">
          {appLanguage === 'en' ? 'Reset' : 'Réinitialisation'}
        </h2>
        <button 
          onClick={() => { 
              setAppLanguage(null); 
              setAppMode(null); 
              setView('training');
              localStorage.removeItem('goreactive_profile');
            }}
          className="w-full flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 hover:bg-red-500/20 active:scale-95 transition-all group"
        >
          <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{appLanguage === 'en' ? 'Reset App' : 'Réinitialiser l\'app'}</span>
        </button>
      </div>
    </div>
  );
}
