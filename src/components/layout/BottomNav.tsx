import {
  Activity,
  History,
  Layers,
  LineChart,
  Settings2,
} from 'lucide-react';
import { NavButton } from '../ui/NavButton';
import type { AppCtx } from '../../app/useAppCtx';

export function BottomNav({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, appLanguage, appProfile, setGuidedStep, guidedAppMode, stopTraining, view,
    setView,
  } = ctx;

  return (
    <nav className="h-24 flex items-center justify-center px-4 shrink-0 z-50 safe-pad-x bg-gradient-to-t from-black via-black/95 to-transparent">
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--bg-secondary)]/90 backdrop-blur-xl border border-[var(--border-color)] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <NavButton active={view === 'training'} onClick={() => { stopTraining(); setView('training'); if (appProfile === 'GUIDED') { if (guidedAppMode) { setGuidedStep(null); } else { setGuidedStep('CLASS_CHOICE'); } } }} icon={<Activity className="w-5 h-5" />} label={appLanguage === 'en' ? 'Training' : 'Entraînement'} />
      <NavButton 
        active={view === 'history'} 
        onClick={() => { stopTraining(); setView('history'); }} 
        icon={<History className="w-5 h-5" />} 
        label={appLanguage === 'en' ? 'Log' : 'Journal'} 
      />
      {appProfile !== 'GUIDED' && (appMode === 'VOICE' || appMode === 'COLOR' || appMode === 'CHAOS') && (
        <NavButton active={view === 'library'} onClick={() => { stopTraining(); setView('library'); }} icon={<Layers className="w-5 h-5" />} label={appLanguage === 'en' ? 'Stimuli' : 'Stimuli'} />
      )}
      {appProfile === 'GUIDED' && (
        <NavButton active={view === 'progress'} onClick={() => { stopTraining(); setView('progress'); }} icon={<LineChart className="w-5 h-5" />} label={appLanguage === 'en' ? 'Progress' : 'Progrès'} />
      )}
      <NavButton active={view === 'settings'} onClick={() => { stopTraining(); setView('settings'); }} icon={<Settings2 className="w-5 h-5" />} label={appLanguage === 'en' ? 'Settings' : 'Réglages'} />
      </div>
    </nav>
  );
}
