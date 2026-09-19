import { motion } from 'motion/react';
import { formatTime } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';

export function TrainingStage({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, neuroFlowActive, effectiveAppMode, effectiveWorkType,
    effectiveIntermittentWorkDuration, effectiveMovementErrorTrackingEnabled,
    effectiveErrorMode, activeModeData, displayPhase, displayTime, displayRound,
    displaySet, displayTotalRounds, displayTotalSets, currentWord, currentColor,
    isOppositeAction, stats, feedbackFlash,
  } = ctx;

  return (
    <div className={`flex-1 w-full flex flex-col items-center justify-between pb-4 transition-opacity duration-300 ${effectiveWorkType === 'INTERMITTENT' && (displayPhase === 'REST' || displayPhase === 'SET_REST') ? 'opacity-0' : 'opacity-100'}`}>


    {/* TOP SECTION: Stats Bar (hidden in Neuro-Flow — the belt HUD covers progress instead) */}
    {!neuroFlowActive && effectiveMovementErrorTrackingEnabled && effectiveErrorMode !== 'post' && (
      <div className="w-full max-w-lg flex items-center justify-between px-4">
        {[
          { label: appLanguage === 'en' ? 'STIM' : 'STIM', value: (activeModeData as any)?.stimuliCount || 0, color: 'text-[var(--text-secondary)]' },
          { label: appLanguage === 'en' ? 'ERR' : 'ERR', value: stats.errors, color: 'text-red-400' },
          { label: appLanguage === 'en' ? 'STK' : 'STK', value: stats.currentStreak, color: 'text-[var(--acc-primary)]' },
          { label: 'MAX', value: stats.bestStreak, color: 'text-[var(--acc-primary)]' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className={`text-3xl font-black font-mono leading-none tabular-nums ${s.color}`}>{s.value}</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{s.label}</span>
          </div>
        ))}
      </div>
    )}
    {/* MIDDLE SECTION: Original V17 training renderer (no tutorial character during active training) */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center">
        <motion.div
          animate={feedbackFlash === 'success' ? { scale: [1, 1.04, 1] } : feedbackFlash === 'error' ? { scale: [1, 0.96, 1] } : { scale: 1 }}
          transition={{ duration: 0.18 }}
          className={`relative border flex items-center justify-center overflow-hidden ${
                        effectiveAppMode === 'COLOR'
                          ? 'w-[92vw] max-w-[34rem] h-[min(60vw,42vh)] max-h-[22rem] rounded-[2.5rem]'
                          : 'w-[min(88vw,54vh)] h-[min(88vw,54vh)] max-w-[28rem] max-h-[28rem] rounded-full'
                      } ${
                        feedbackFlash === 'success' ? 'border-green-400/70 shadow-[0_0_70px_rgba(34,197,94,0.25)]' :
                        feedbackFlash === 'error' ? 'border-red-400/70 shadow-[0_0_70px_rgba(239,68,68,0.25)]' :
                        currentColor ? 'border-[var(--acc-primary)]/30 shadow-[0_0_80px_rgba(255,255,255,0.12)]' :
                        'border-[var(--border-color)] shadow-[0_0_60px_var(--shadow-acc)]'
                      }`}
          style={{
            background: currentColor
              ? (effectiveAppMode === 'COLOR' ? currentColor : `radial-gradient(circle, ${currentColor} 0%, ${currentColor} 44%, rgba(10,13,20,0.92) 72%)`)
              : (effectiveAppMode === 'COLOR' ? 'var(--bg-secondary)' : 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 48%, var(--bg-secondary) 100%)')
          }}
        >
          <div className={`absolute inset-4 border border-[var(--border-color)] ${effectiveAppMode === 'COLOR' ? 'rounded-[1.75rem]' : 'rounded-full'}`} />
          <div className="absolute inset-0 bg-black/10" />

          {effectiveAppMode === 'VOICE' ? (
            <div
              key="voice-countdown"
              className="relative z-10 flex flex-col items-center justify-center text-center"
            >
              <span className="text-7xl sm:text-8xl font-black text-[var(--text-primary)] font-mono tabular-nums leading-none">
                {formatTime(displayTime || 0)}
              </span>
            </div>
          ) : currentWord || currentColor ? (
            <div
              key={`${currentWord || 'color'}-${currentColor || 'word'}-${isOppositeAction ? 'opposite' : 'normal'}`}
              className="relative z-10 flex flex-col items-center justify-center text-center px-6"
            >

              {currentWord ? (
                <span
                  className="font-black uppercase italic tracking-tighter leading-none"
                  style={effectiveAppMode === 'COLOR' ? {
                    color: currentColor ? '#ffffff' : 'rgba(255,255,255,0.96)',
                    textShadow: '0 4px 20px rgba(0,0,0,0.45)',
                    fontSize: 'clamp(2.01rem, 10.35vw, 5.18rem)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: 1.05
                  } : {
                    color: currentColor ? '#ffffff' : 'rgba(255,255,255,0.96)',
                    textShadow: '0 4px 20px rgba(0,0,0,0.45)',
                    fontSize: 'min(44vw, 27vh, 14rem)'
                  }}
                >
                  {currentWord}
                </span>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* BOTTOM SECTION: Time and Info */}
      <div className="w-full flex flex-col items-center gap-4">
        {effectiveWorkType === 'CONTINUOUS' ? (
          effectiveAppMode !== 'VOICE' && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-1">
                {neuroFlowActive
                  ? (appLanguage === 'en' ? 'TIME ELAPSED' : 'TEMPS ÉCOULÉ')
                  : (appLanguage === 'en' ? 'TIME REMAINING' : 'TEMPS RESTANT')}
              </span>
              <span className="text-5xl font-bold text-[var(--text-primary)] font-mono tabular-nums leading-none">
                {formatTime(displayTime || 0)}
              </span>
            </div>
          )
        ) : (
          effectiveWorkType === 'INTERMITTENT' && displayPhase === 'WORK' && (
            <div className="flex flex-col items-center w-full max-w-sm px-4">
               <div className="flex justify-between w-full mb-4 px-2">
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase mb-1">{appLanguage === 'en' ? 'ROUND' : 'ROUND'}</span>
                     <span className="text-xs font-bold text-[var(--text-primary)] uppercase">{displayRound} / {displayTotalRounds}</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase mb-1">{appLanguage === 'en' ? 'SET' : 'SÉRIE'}</span>
                     <span className="text-xs font-bold text-[var(--text-primary)] uppercase">{displaySet} / {displayTotalSets}</span>
                  </div>
               </div>

               {/* Bottom Timer hidden in VOICE mode because it's in the circle */}
               {effectiveAppMode !== 'VOICE' && (
                  <div className="flex flex-col items-center w-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 transition-colors duration-300" style={{ color: '#22c55e' }}>
                      {appLanguage === 'en' ? 'WORK' : 'TRAVAIL'}
                    </span>
                    <span className="text-6xl font-bold text-[var(--text-primary)] font-mono leading-none mb-3">
                      {formatTime(displayTime || 0)}
                    </span>
                    <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full shadow-lg bg-green-500"
                        initial={false}
                        animate={{ 
                          width: `${((displayTime || 0) / effectiveIntermittentWorkDuration) * 100}%` 
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
               )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
