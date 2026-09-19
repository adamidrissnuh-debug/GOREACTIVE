import * as React from 'react';
import { useState, useMemo } from 'react';
import { Target, Zap, Flame, Activity } from 'lucide-react';
import { TrainingSession, UserProgress, AppProfile } from '../types';
import { translateMode } from '../lib/utils';
import { SessionHistoryCard } from './SessionHistoryCard';
import { ContextSwitcher, TrainingClass } from './ContextSwitcher';

interface HistoryScreenProps {
  sessionHistory: TrainingSession[];
  userProgress: UserProgress;
  appLanguage: 'en' | 'fr' | null;
  expandedSessionId: string | null;
  setExpandedSessionId: (id: string | null) => void;
  setShowClearHistoryModal: (show: boolean) => void;
  appProfile?: AppProfile | null;
  trainingClass?: TrainingClass;
  onChangeProfile?: () => void;
}

// A session predates the `profile` field, or was launched from the Athlete
// flow directly, whenever it carries no `guidedActivity` tag.
const getProfile = (session: TrainingSession): 'PRO' | 'GUIDED' =>
  session.profile ?? (session.guidedActivity ? 'GUIDED' : 'PRO');

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  sessionHistory,
  userProgress,
  appLanguage,
  expandedSessionId,
  setExpandedSessionId,
  setShowClearHistoryModal,
  appProfile,
  trainingClass,
  onChangeProfile,
}) => {
  const lang = appLanguage || 'fr';

  // Each profile only ever sees its own training log — a Pro session never
  // shows up while in Guided, and vice versa.
  const filteredSessions = useMemo(() => {
    return sessionHistory.filter(s => !appProfile || getProfile(s) === appProfile);
  }, [sessionHistory, appProfile]);

  const totalSuccesses = filteredSessions.reduce((acc, s) => acc + (s.successes || 0), 0);
  const totalAttempts = filteredSessions.reduce((acc, s) => acc + ((s.successes || 0) + (s.failures || 0)), 0);
  const efficiency = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : null;

  const modeCounts: Record<string, number> = {};
  filteredSessions.forEach(s => {
    modeCounts[s.mode] = (modeCounts[s.mode] || 0) + 1;
  });
  const modeEntries = Object.entries(modeCounts).sort((a, b) => b[1] - a[1]);
  const maxModeCount = Math.max(1, ...modeEntries.map(([, c]) => c));

  const evaluatedSessions = filteredSessions.filter(s => s.isEvaluated !== false);
  const avgAccuracy = evaluatedSessions.length > 0
    ? Math.round(evaluatedSessions.reduce((sum, s) => {
        const total = (s.successes || 0) + (s.failures || 0);
        return sum + (total > 0 ? (s.successes / total) * 100 : 100);
      }, 0) / evaluatedSessions.length)
    : null;


  return (
    <div
      className="absolute inset-0 p-6 flex flex-col overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]"
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--acc-primary)] mb-2">
            {lang === 'en' ? 'Tracking & History' : 'Suivi & Historique'}
          </h2>
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
            {lang === 'en' ? 'Training Log' : 'Journal de Bord'}
          </h1>
        </div>
        {onChangeProfile && (appProfile || trainingClass) && (
          <div className="pt-1 shrink-0">
            <ContextSwitcher
              profile={appProfile ?? null}
              trainingClass={trainingClass ?? null}
              appLanguage={appLanguage}
              onChangeProfile={onChangeProfile}
            />
          </div>
        )}
      </header>

      <div className="space-y-6 pb-12">
          {filteredSessions.length === 0 ? (
            <div
              className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] p-10 rounded-3xl text-center flex flex-col items-center gap-4"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-2xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-[var(--acc-primary)] opacity-70" />
                </div>
                <div className="absolute -inset-2 rounded-3xl border border-[var(--acc-primary)]/10 animate-ping opacity-40" style={{ animationDuration: '2.4s' }} />
              </div>
              <div>
                <p className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-wide mb-1.5">
                  {sessionHistory.length === 0
                    ? (lang === 'en' ? 'Nothing tracked yet' : 'Rien à suivre pour l’instant')
                    : (lang === 'en' ? 'No sessions here' : 'Aucune séance ici')}
                </p>
                {sessionHistory.length === 0 && (
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide opacity-60 max-w-[220px] mx-auto leading-relaxed">
                    {lang === 'en' ? 'Your first session will show up right here.' : 'Ta première séance apparaîtra juste ici.'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-3xl flex flex-col items-center gap-1">
                  <Zap className="w-4 h-4 text-[var(--acc-primary)] mb-1" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {lang === 'en' ? 'Efficiency' : 'Efficacité'}
                  </span>
                  <span className="text-lg font-black text-[var(--text-primary)] italic">
                    {efficiency !== null ? `${efficiency}%` : '--%'}
                  </span>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-3xl flex flex-col items-center gap-1">
                  <Target className="w-4 h-4 text-[var(--acc-primary)] mb-1" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {lang === 'en' ? 'Sessions' : 'Séances'}
                  </span>
                  <span className="text-lg font-black text-[var(--text-primary)] italic">
                    {filteredSessions.length}
                  </span>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-3xl flex flex-col items-center gap-1">
                  <Flame className="w-4 h-4 text-[var(--acc-primary)] mb-1" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {lang === 'en' ? 'Streak' : 'Série'}
                  </span>
                  <span className="text-lg font-black text-[var(--text-primary)] italic">
                    {userProgress.streak} {lang === 'en' ? (userProgress.streak > 1 ? 'days' : 'day') : (userProgress.streak > 1 ? 'jours' : 'jour')}
                  </span>
                  <span className="text-[8px] font-medium text-[var(--text-secondary)] opacity-50 uppercase tracking-wide">
                    {lang === 'en' ? 'Global, all training' : 'Global, tout entraînement'}
                  </span>
                </div>
              </div>

              {modeEntries.length > 0 && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-3xl space-y-3">
                  <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                    {lang === 'en' ? 'Sessions by Mode' : 'Séances par Mode'}
                  </h3>
                  {modeEntries.map(([mode, count]) => (
                    <div key={mode} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase w-24 shrink-0 truncate">
                        {translateMode(mode, lang)}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--acc-primary)]"
                          style={{ width: `${(count / maxModeCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)] w-6 text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="flex justify-between items-end border-b border-[var(--border-color)] pb-2 mb-4">
                  <h2 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {lang === 'en' ? 'Training History' : "Historique d'Entraînement"}
                  </h2>
                  {sessionHistory.length > 0 && (
                    <button
                      onClick={() => setShowClearHistoryModal(true)}
                      className="text-[10px] font-bold text-red-500/70 uppercase tracking-tight hover:text-red-500 active:scale-95 transition-all px-2 py-1"
                    >
                      {lang === 'en' ? 'Reset Log' : 'Vider'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {avgAccuracy !== null && (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--acc-primary)]/20 p-4 rounded-2xl mb-4 flex items-center justify-between shadow-lg shadow-[var(--acc-primary)]/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--acc-primary)]/10 flex items-center justify-center border border-[var(--acc-primary)]/30">
                          <Target className="w-5 h-5 text-[var(--acc-primary)]" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-[var(--acc-primary)] uppercase tracking-widest leading-none mb-1">
                            {lang === 'en' ? 'Global Accuracy' : 'Précision Globale'}
                          </h4>
                          <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">
                            {evaluatedSessions.length} {lang === 'en' ? 'Evaluated Sessions' : 'Séances Évaluées'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[var(--text-primary)] italic">{avgAccuracy}%</span>
                      </div>
                    </div>
                  )}

                  {filteredSessions.map((session) => (
                    <SessionHistoryCard
                      key={session.id}
                      session={session}
                      appLanguage={lang}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
      </div>
      <div className="h-24 shrink-0" />
    </div>
  );
};

export default HistoryScreen;
