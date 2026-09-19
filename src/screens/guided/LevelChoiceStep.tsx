import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { SPEED_TIERS, GUIDED_PRESETS } from '../../constants/guidedPresets';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function LevelChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, guidedActivity, selectedSprintTime, setGuidedDifficulty,
    setGuidedSubLevel, setSpeedTierModalOpen, setCountdownDuration, setGuidedWords,
    setGuidedVoiceMinInterval, setGuidedVoiceMaxInterval, setGuidedWorkType,
    setGuidedIntermittentRestDuration, setGuidedIntermittentRounds,
    setGuidedIntermittentSets, setGuidedIntermittentWorkDuration, showLevelInfo,
    setShowLevelInfo, getGuidedProgress,
  } = ctx;

  return (
    <motion.div 
      key="guided-level"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <GuidedHeader
        onBack={() => setGuidedStep(guidedActivity === 'BOXING' ? 'BOXING_LEVEL_EXPLAIN' : (selectedSprintTime ? 'SPRINT_TIME_CHOICE' : 'ACTIVITY_EXPLAIN'))}
        step={getGuidedProgress()?.step}
        total={getGuidedProgress()?.total}
        appLanguage={appLanguage}
      />
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter text-center leading-none">
          {appLanguage === 'en' ? 'DIFFICULTY' : 'NIVEAU'} <br/>
          <span className="text-[var(--acc-primary)]">{appLanguage === 'en' ? 'LEVEL' : 'DE DIFFICULTÉ'}</span>
        </h1>
        <div className="h-1 w-12 bg-[var(--acc-primary)] mx-auto rounded-full" />
      </div>

      {guidedActivity !== 'SPRINT' && (
        <div className="px-2 -mt-6">
          <motion.button
            onClick={() => setShowLevelInfo(v => !v)}
            animate={showLevelInfo ? {} : { scale: [1, 1.035, 1], boxShadow: [
              '0 0 0px rgba(216,173,69,0)',
              '0 0 16px rgba(216,173,69,0.45)',
              '0 0 0px rgba(216,173,69,0)'
            ] }}
            transition={{ duration: 1.8, repeat: showLevelInfo ? 0 : Infinity, ease: 'easeInOut' }}
            className="w-full flex items-center gap-2.5 bg-[var(--acc-primary)]/8 border border-[var(--acc-primary)]/25 rounded-2xl px-4 py-3"
          >
            <Lightbulb className="w-4 h-4 text-[var(--acc-primary)]" />
            <span className="text-[10px] font-black text-[var(--acc-primary)] uppercase tracking-wide flex-1 text-left">
              {appLanguage === 'en' ? 'Why these levels?' : 'Pourquoi ces paliers ?'}
            </span>
            <ChevronDown className={`w-4 h-4 text-[var(--acc-primary)] transition-transform duration-300 ${showLevelInfo ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence initial={false}>
            {showLevelInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1 space-y-3">
                  <p className="text-[11px] text-[var(--text-secondary)] font-bold text-center leading-snug">
                    {appLanguage === 'en'
                      ? 'Speed sets the pace between stimuli. Stimuli count sets how many different moves you must recognize. Pick each one for what you want to train.'
                      : 'La vitesse règle le rythme entre les stimulis. Le nombre de stimulis règle combien de mouvements différents tu dois reconnaître. Choisis chacun selon ce que tu veux travailler.'}
                  </p>
                  <div className="flex items-center gap-1">
                    {SPEED_TIERS.map((t, i) => (
                      <div key={i} className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `hsl(${145 - i * 24}, 70%, 50%)` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    <span>{appLanguage === 'en' ? 'Discovery' : 'Découverte'}</span>
                    <span>{appLanguage === 'en' ? 'Maximum' : 'Maximum'}</span>
                  </div>
                  <p className="text-[9px] text-[var(--acc-primary)]/70 font-bold text-center leading-snug pt-1">
                    {appLanguage === 'en'
                      ? 'At the fastest speeds, only short words (Numbers / Tags) fit before the next stimulus.'
                      : 'Aux vitesses les plus rapides, seuls les mots courts (Chiffres / Tags) ont le temps d\'être prononcés.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-12">
        {guidedActivity === 'SPRINT' ? (
          // SPRINT SPECIFIC INTENSITY SELECTION - REFINED
          <div className="space-y-4 w-full max-w-sm mx-auto">
            {['Réactif', 'Vif', 'Explosif'].map((intensityLabel, idx) => {
              const levelNum = idx + 1;
              const activityPresets = GUIDED_PRESETS.SPRINT;
              const moduleKey = selectedSprintTime || 'T15';
              const levels = activityPresets.MODES.VOICE[moduleKey as keyof typeof activityPresets.MODES.VOICE];
              const preset = levels[idx];

              return (
                <button 
                  key={intensityLabel}
                  onClick={() => {
                    setGuidedDifficulty('MEDIUM'); // Internal placeholder
                    setGuidedSubLevel(levelNum);

                    const p = preset;
                    setGuidedVoiceMinInterval(p.minInterval);
                    setGuidedVoiceMaxInterval(p.maxInterval);
                    setCountdownDuration(3);
                    setGuidedIntermittentWorkDuration(parseInt(moduleKey.replace('T', ''))); 
                    setGuidedWorkType('INTERMITTENT'); // Sprint is intermittent by nature
                    setGuidedIntermittentRounds(p.rounds || 5);
                    setGuidedIntermittentRestDuration(p.rest || 60);
                    setGuidedIntermittentSets(p.sets || 1);

                    // Sprint always uses Left, Right, Back in Guided Mode
                    const sprintWords = appLanguage === 'en' 
                      ? ['LEFT', 'RIGHT', 'BACK'] 
                      : ['GAUCHE', 'DROITE', 'DERRIÈRE'];
                    setGuidedWords(sprintWords);
                    setGuidedStep('ERROR_TRACKING_CHOICE');
                  }}
                  className="w-full group relative flex flex-col p-8 rounded-[2rem] transition-all duration-500 bg-zinc-950/40 border border-[var(--acc-primary)]/5 hover:border-[var(--acc-primary)]/20 hover:bg-white/5 active:scale-[0.98] text-left overflow-hidden"
                >
                  {/* Background number label */}
                  <div className="absolute top-0 right-0 p-4 text-9xl font-black italic text-white/[0.02] -translate-y-1/4 translate-x-1/4 pointer-events-none group-hover:scale-110 group-hover:text-white/[0.04] transition-all duration-700">
                    {levelNum}
                  </div>

                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[var(--acc-primary)] uppercase tracking-[0.3em] italic">
                        {appLanguage === 'en' ? ['Reactive', 'Vivid', 'Explosive'][idx] : intensityLabel}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic text-white tracking-tighter leading-none group-hover:text-[var(--acc-primary)] transition-colors">
                          {preset.minInterval.toFixed(1)}s - {preset.maxInterval.toFixed(1)}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest leading-none">
                        {appLanguage === 'en' ? 'Intervals between 2 stimuli between:' : 'Intervalles entre 2 stimuli compris entre :'}
                      </p>
                      <div className="h-[1px] flex-1 bg-white/5" />
                      <ChevronRight className="w-5 h-5 text-[var(--acc-primary)]/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // BOXING — vitesse (grille 3x2) puis nombre de stimulis
          // (fenêtre dédiée, même disposition 3x2)
          <div className="grid grid-cols-3 gap-3">
            {SPEED_TIERS.map((tier) => {
              // Dégradé vert (lent) → rouge (rapide), un ton par palier.
              const hue = 145 - ((tier.tier - 1) / 5) * 145;
              return (
                <button
                  key={tier.tier}
                  onClick={() => setSpeedTierModalOpen(tier.tier)}
                  className="aspect-square rounded-3xl flex flex-col items-center justify-center gap-1.5 border transition-all active:scale-90"
                  style={{
                    background: `hsla(${hue}, 70%, 50%, 0.12)`,
                    borderColor: `hsla(${hue}, 70%, 50%, 0.35)`,
                  }}
                >
                  <span
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: `hsl(${hue}, 70%, 60%)` }}
                  >
                    {appLanguage === 'en' ? 'LVL' : 'NIV.'} {tier.tier}
                  </span>
                  <span className="text-xs font-black uppercase italic text-white leading-tight text-center px-1">
                    {appLanguage === 'en' ? tier.label.en : tier.label.fr}
                  </span>
                  <span className="text-[8px] font-bold text-[var(--text-secondary)] tracking-tight">
                    {tier.minInterval.toFixed(2)}–{tier.maxInterval.toFixed(2)}s
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
