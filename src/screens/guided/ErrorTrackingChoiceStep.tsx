import { motion } from 'motion/react';
import { Mic, Headphones, ClipboardList, Play } from 'lucide-react';
import { earphonesRequiredWarning } from '../../lib/utils';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function ErrorTrackingChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    hasMovementCalibrationPassed, appLanguage, setGuidedStep, guidedActivity,
    setSkipCalibration, setGuidedMovementErrorTrackingEnabled, setGuidedErrorMode,
    getGuidedProgress, setView, setShowMicTestModal, setShowMovementCalibrationModal,
    setMovementCalibrationCount, movementCalibrationCountRef, startTrainingFlow,
  } = ctx;

  return (
    <motion.div 
      key="guided-error-choice"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <GuidedHeader
        onBack={() => setGuidedStep(guidedActivity === 'BOXING' ? 'STIMULI_CHOICE' : 'LEVEL_CHOICE')}
        step={getGuidedProgress()?.step}
        total={getGuidedProgress()?.total}
        appLanguage={appLanguage}
      />
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter text-center">
          {appLanguage === 'en' ? 'SESSION TYPE' : 'TYPE D\'ENTRAÎNEMENT'}
        </h1>
        <div className="h-1 w-12 bg-[var(--acc-primary)] mx-auto rounded-full" />
        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest text-center px-6 leading-relaxed">
          {appLanguage === 'en'
            ? 'Choose how missed hits get tracked during this session.'
            : 'Choisis comment tes coups ratés seront suivis pendant la séance.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 px-2">
        <button 
          onClick={() => {
            setGuidedMovementErrorTrackingEnabled(true);
            setGuidedErrorMode('live');
            setSkipCalibration(false);
            setGuidedStep(null);
            setView('training');
            if (!hasMovementCalibrationPassed) {
              setShowMicTestModal(false);
              movementCalibrationCountRef.current = 0;
              setMovementCalibrationCount(0);
              setShowMovementCalibrationModal(true);
            } else {
              startTrainingFlow();
            }
          }}
          className="group relative bg-cyan-500/10 border border-cyan-500/25 p-5 rounded-[2rem] transition-all hover:border-cyan-400/60 hover:bg-cyan-500/15 active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-cyan-400 uppercase italic tracking-tighter leading-none">
                {appLanguage === 'en' ? 'LIVE VOICE' : 'VOIX EN DIRECT'}
              </h3>
              <span className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-[0.2em]">
                {appLanguage === 'en' ? 'Miss a hit? Say "No" out loud' : 'Coup raté ? Dis "Non" à voix haute'}
              </span>
            </div>
          </div>

          {/* Earphone requirement — important: prevents the AI voice from being picked up as the person's own speech */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <Headphones className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-cyan-400/90 font-bold uppercase tracking-widest leading-relaxed">
              {earphonesRequiredWarning(appLanguage)}
            </p>
          </div>
        </button>

        <button 
          onClick={() => {
            setGuidedMovementErrorTrackingEnabled(true);
            setGuidedErrorMode('post');
            setSkipCalibration(true);
            setGuidedStep(null);
            setView('training');
            startTrainingFlow();
          }}
          className="group relative bg-amber-500/10 border border-amber-500/25 p-5 rounded-[2rem] transition-all hover:border-amber-400/60 hover:bg-amber-500/15 active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-400 uppercase italic tracking-tighter leading-none">
                {appLanguage === 'en' ? 'AFTERWARD' : 'APRÈS COUP'}
              </h3>
              <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-[0.2em]">
                {appLanguage === 'en' ? 'Say how many you missed, at the end' : 'Indique tes ratés à la fin'}
              </span>
            </div>
          </div>
        </button>

        <button 
          onClick={() => {
            setGuidedMovementErrorTrackingEnabled(false);
            setGuidedErrorMode('none');
            setSkipCalibration(true);
            setGuidedStep(null);
            setView('training');
            startTrainingFlow();
          }}
          className="group relative bg-emerald-500/10 border border-emerald-500/25 p-5 rounded-[2rem] transition-all hover:border-emerald-400/60 hover:bg-emerald-500/15 active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-400 uppercase italic tracking-tighter leading-none">
                {appLanguage === 'en' ? 'FREE' : 'LIBRE'}
              </h3>
              <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-[0.2em]">
                {appLanguage === 'en' ? 'No error tracking at all' : 'Aucun suivi d\'erreur'}
              </span>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
