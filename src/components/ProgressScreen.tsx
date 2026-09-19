import React, { useMemo } from 'react';
import { TrendingUp, BrainCircuit, Target } from 'lucide-react';
import { TrainingSession, UserProgress } from '../types';

interface ProgressScreenProps {
  sessionHistory: TrainingSession[];
  userProgress: UserProgress;
  appLanguage: 'en' | 'fr' | null;
}

// Guided-only screen (Stimuli isn't relevant there, so this fills that nav
// slot instead): streak, all-time Neuro-Flow peak, and a simple success-rate
// trend across recent sessions — a sense of progression without exposing
// any of the fine-grained settings this audience doesn't need.
export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  sessionHistory,
  userProgress,
  appLanguage,
}) => {
  const lang = appLanguage || 'fr';

  // Guided sessions only, oldest → newest, for the trend line.
  const guidedSessions = useMemo(() => {
    const filtered = sessionHistory.filter(s => (s.profile ?? (s.guidedActivity ? 'GUIDED' : 'PRO')) === 'GUIDED');
    return [...filtered].reverse();
  }, [sessionHistory]);

  const trendSessions = useMemo(() => {
    return guidedSessions
      .filter(s => s.isEvaluated !== false)
      .slice(-10)
      .map(s => {
        const total = (s.successes || 0) + (s.failures || 0);
        return {
          rate: total > 0 ? Math.round((s.successes / total) * 100) : 100,
          date: s.date,
        };
      });
  }, [guidedSessions]);

  const trendDelta = useMemo(() => {
    if (trendSessions.length < 2) return null;
    const mid = Math.ceil(trendSessions.length / 2);
    const firstHalf = trendSessions.slice(0, mid);
    const secondHalf = trendSessions.slice(mid);
    const avg = (arr: typeof trendSessions) => arr.reduce((sum, s) => sum + s.rate, 0) / arr.length;
    return Math.round(avg(secondHalf) - avg(firstHalf));
  }, [trendSessions]);

  // Only surfaced if there's been a Neuro-Flow session in the last 7 days —
  // otherwise this card just sits there showing a stale number forever,
  // even for someone who's moved on to Standard Levels or Sprint.
  const bestNeuroFlowLevel = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return guidedSessions.reduce((max, s) => {
      if (!s.neuroFlowActive || !s.timestamp || s.timestamp < sevenDaysAgo) return max;
      const lvl = s.neuroFlowHighestLevelReached || 0;
      return lvl > max ? lvl : max;
    }, 0);
  }, [guidedSessions]);

  const hasData = guidedSessions.length > 0;

  // Simple SVG area chart — no charting library needed for ~10 points.
  const chartWidth = 300;
  const chartHeight = 100;
  const chartPad = 6;
  const yFor = (v: number) => chartPad + (chartHeight - chartPad * 2) - (v / 100) * (chartHeight - chartPad * 2);
  const xFor = (i: number) => trendSessions.length > 1 ? (i / (trendSessions.length - 1)) * chartWidth : chartWidth / 2;
  const linePoints = trendSessions.map((s, i) => `${xFor(i)},${yFor(s.rate)}`).join(' ');
  const areaPoints = `0,${chartHeight} ${linePoints} ${chartWidth},${chartHeight}`;

  return (
    <div
      className="absolute inset-0 p-6 flex flex-col overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]"
    >
      <div className="space-y-6 pb-12">
      <header className="mb-2">
        <h1 className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
          {lang === 'en' ? 'My Progress' : 'Mes Progrès'}
        </h1>
        <p className="text-[var(--text-secondary)] text-[10px] items-center flex gap-2 font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-lg mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc-primary)] animate-pulse" />
          {lang === 'en' ? 'Guided Training' : 'Entraînement Guidé'}
        </p>
      </header>

      {!hasData ? (
        <div
          className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] p-10 rounded-3xl text-center flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-[var(--acc-primary)] opacity-70" />
          </div>
          <div>
            <p className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-wide mb-1.5">
              {lang === 'en' ? 'Nothing to show yet' : 'Rien à montrer pour l\u2019instant'}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide opacity-60 max-w-[220px] mx-auto leading-relaxed">
              {lang === 'en' ? 'Your progress will build up as you train.' : 'Ta progression se construira au fil de tes séances.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className={bestNeuroFlowLevel > 0 ? "grid grid-cols-1 gap-3" : ""}>
            {bestNeuroFlowLevel > 0 && (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-3xl flex flex-col items-center gap-1">
                <BrainCircuit className="w-4 h-4 text-[var(--acc-primary)] mb-1" />
                <span className="text-2xl font-black font-mono leading-none text-[var(--text-primary)]">
                  {bestNeuroFlowLevel}/18
                </span>
                <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
                  {lang === 'en' ? 'Neuro-Flow (7d)' : 'Neuro-Flow (7j)'}
                </span>
              </div>
            )}
          </div>

          {trendSessions.length >= 2 && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-[var(--acc-primary)]" />
                  <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    {lang === 'en' ? `Success rate — last ${trendSessions.length}` : `Taux de réussite — ${trendSessions.length} dernières`}
                  </span>
                </div>
                {trendDelta !== null && trendDelta !== 0 && (
                  <span className={`text-[10px] font-black font-mono flex items-center gap-0.5 ${trendDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trendDelta > 0 ? '↗' : '↘'} {trendDelta > 0 ? '+' : ''}{trendDelta}
                  </span>
                )}
              </div>

              <div className="relative">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-28" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="progress-area-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--acc-primary)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--acc-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Reference gridlines at 25/50/75/100% */}
                  {[0, 25, 50, 75, 100].map(mark => (
                    <line
                      key={mark}
                      x1="0" x2={chartWidth}
                      y1={yFor(mark)} y2={yFor(mark)}
                      stroke="white" strokeOpacity={mark === 0 ? 0.12 : 0.05}
                      strokeWidth="1"
                      strokeDasharray={mark === 0 ? undefined : '3 3'}
                    />
                  ))}

                  {/* Filled area under the curve */}
                  <polygon points={areaPoints} fill="url(#progress-area-fill)" />

                  {/* Line */}
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke="var(--acc-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {trendSessions.map((s, i) => {
                    const isLast = i === trendSessions.length - 1;
                    return (
                      <circle
                        key={i}
                        cx={xFor(i)}
                        cy={yFor(s.rate)}
                        r={isLast ? 4 : 2.5}
                        fill={isLast ? 'var(--acc-primary)' : 'var(--bg-secondary)'}
                        stroke="var(--acc-primary)"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-28 flex flex-col justify-between text-[7px] font-bold text-[var(--text-secondary)] -translate-x-1 -ml-1">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--acc-primary)]/5">
                <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
                  {trendSessions[0]?.date || ''}
                </span>
                <span className="text-lg font-black text-[var(--acc-primary)] font-mono">
                  {trendSessions[trendSessions.length - 1]?.rate}%
                </span>
                <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide opacity-60">
                  {lang === 'en' ? 'Now' : 'Aujourd\u2019hui'}
                </span>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};
