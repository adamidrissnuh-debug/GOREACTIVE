import React from 'react';
import { Zap, X, Target, BrainCircuit, TrendingUp, Flame } from 'lucide-react';
import { TrainingSession } from '../types';
import { translateMode } from '../lib/utils';

interface SessionHistoryCardProps {
  session: TrainingSession;
  appLanguage: string;
}

// Same 5-point scale as the post-session rating screen — kept in sync by
// hand since it's just a small lookup, not worth sharing a module for.
const DIFFICULTY_LEVELS: { rating: number; en: string; fr: string; color: string; dot: string }[] = [
  { rating: 2, en: 'Easy', fr: 'Facile', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { rating: 4, en: 'Light', fr: 'Léger', color: 'text-lime-400', dot: 'bg-lime-400' },
  { rating: 6, en: 'Moderate', fr: 'Modéré', color: 'text-amber-400', dot: 'bg-amber-400' },
  { rating: 8, en: 'Hard', fr: 'Difficile', color: 'text-orange-400', dot: 'bg-orange-400' },
  { rating: 10, en: 'Brutal', fr: 'Brutal', color: 'text-red-400', dot: 'bg-red-400' },
];

// Minimal journal row: session name, total stimuli, errors, success rate,
// and the day/date in very small text. Nothing else — but laid out with
// clear visual hierarchy (icons, dividers, a colored success chip) instead
// of cramming everything into tiny undifferentiated numbers.
export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  session,
  appLanguage,
}) => {
  const totalAttempts = (session.successes || 0) + (session.failures || 0);
  const successRate = totalAttempts > 0
    ? Math.round((session.successes / totalAttempts) * 100)
    : 100;

  const successColor =
    successRate >= 90 ? 'text-emerald-400' :
    successRate >= 70 ? 'text-amber-400' :
    'text-red-400';
  const successBg =
    successRate >= 90 ? 'bg-emerald-400/10' :
    successRate >= 70 ? 'bg-amber-400/10' :
    'bg-red-400/10';

  const difficulty = session.rating
    ? DIFFICULTY_LEVELS.find(l => l.rating === session.rating)
    : null;

  const isNeuroFlow = !!session.neuroFlowActive;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
      {/* Header: mode + Neuro-Flow badge + date */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)]/60 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wide truncate">
            {appLanguage === 'en' ? `${session.mode}` : `${translateMode(session.mode, appLanguage)}`}
          </span>
          {isNeuroFlow && (
            <span className="flex items-center gap-1 shrink-0 text-[8px] font-black uppercase tracking-wide text-[var(--acc-primary)] bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 px-1.5 py-0.5 rounded-full">
              <BrainCircuit className="w-2.5 h-2.5" />
              Neuro-Flow
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono text-[var(--text-secondary)] opacity-50 shrink-0">
          {session.date}
        </span>
      </div>

      {isNeuroFlow ? (
        <div className="grid grid-cols-3 divide-x divide-[var(--border-color)]/60">
          <div className="flex flex-col items-center justify-center gap-1 py-3">
            <Zap className="w-3.5 h-3.5 text-[var(--acc-primary)] opacity-70" />
            <span className="text-xl font-black font-mono leading-none text-[var(--text-primary)]">{session.volume}</span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Stimuli' : 'Stimulis'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 py-3 bg-[var(--acc-primary)]/5">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--acc-primary)] opacity-90" />
            <span className="text-xl font-black font-mono leading-none text-[var(--acc-primary)]">
              {session.neuroFlowFinalLevel ?? '—'}<span className="text-[10px] opacity-50">/18</span>
            </span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Last Level' : 'Dernier Niv.'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 py-3">
            <X className="w-3.5 h-3.5 text-red-400 opacity-70" />
            <span className="text-xl font-black font-mono leading-none text-[var(--text-primary)]">{session.failures}</span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Errors' : 'Erreurs'}
            </span>
          </div>
        </div>
      ) : session.isEvaluated !== false ? (
        <div className="grid grid-cols-3 divide-x divide-[var(--border-color)]/60">
          <div className="flex flex-col items-center justify-center gap-1 py-3">
            <Zap className="w-3.5 h-3.5 text-[var(--acc-primary)] opacity-70" />
            <span className="text-xl font-black font-mono leading-none text-[var(--text-primary)]">{session.volume}</span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Stimuli' : 'Stimulis'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 py-3">
            <X className="w-3.5 h-3.5 text-red-400 opacity-70" />
            <span className="text-xl font-black font-mono leading-none text-[var(--text-primary)]">{session.failures}</span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Errors' : 'Erreurs'}
            </span>
          </div>
          <div className={`flex flex-col items-center justify-center gap-1 py-3 ${successBg}`}>
            <Target className={`w-3.5 h-3.5 ${successColor} opacity-90`} />
            <span className={`text-xl font-black font-mono leading-none ${successColor}`}>{successRate}%</span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Success' : 'Réussite'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3">
          <Zap className="w-3.5 h-3.5 text-[var(--acc-primary)] opacity-70" />
          <span className="text-xl font-black font-mono leading-none text-[var(--text-primary)]">{session.volume}</span>
          <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
            {appLanguage === 'en' ? 'Stimuli · Free' : 'Stimulis · Libre'}
          </span>
        </div>
      )}

      {(session.errorMode === 'live' || isNeuroFlow) && session.bestStreak > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-[var(--border-color)]/60">
          <Flame className="w-3.5 h-3.5 text-[var(--acc-primary)]" />
          <span className="text-[10px] font-black font-mono text-[var(--acc-primary)]">{session.bestStreak}</span>
          <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
            {appLanguage === 'en' ? 'Longest error-free streak' : 'Plus longue série sans erreur'}
          </span>
        </div>
      )}

      {session.sprintRounds != null && (
        <div className="flex items-center justify-center divide-x divide-[var(--border-color)]/40 border-t border-[var(--border-color)]/60 px-2">
          <div className="flex-1 flex flex-col items-center gap-0.5 py-2">
            <span className="text-[10px] font-black font-mono text-[var(--text-primary)]">{session.sprintRounds}{session.sprintSets && session.sprintSets > 1 ? ` ×${session.sprintSets}` : ''}</span>
            <span className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? (session.sprintSets && session.sprintSets > 1 ? 'Rounds/Set' : 'Rounds') : (session.sprintSets && session.sprintSets > 1 ? 'Rounds/Série' : 'Rounds')}
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 py-2">
            <span className="text-[10px] font-black font-mono text-[var(--text-primary)]">{session.sprintWorkSeconds}s</span>
            <span className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Work' : 'Travail'}
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 py-2">
            <span className="text-[10px] font-black font-mono text-[var(--text-primary)]">{session.sprintRestSeconds}s</span>
            <span className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
              {appLanguage === 'en' ? 'Rest' : 'Repos'}
            </span>
          </div>
        </div>
      )}

      {difficulty && (
        <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 border-t border-[var(--border-color)]/60">
          <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${difficulty.color}`}>
            {appLanguage === 'en' ? difficulty.en : difficulty.fr}
          </span>
        </div>
      )}
    </div>
  );
};
