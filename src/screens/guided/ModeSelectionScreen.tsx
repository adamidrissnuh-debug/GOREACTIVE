import { motion, AnimatePresence } from 'motion/react';
import type { AppCtx } from '../../app/useAppCtx';
import { GuidedClassChoiceStep } from './GuidedClassChoiceStep';
import { GuidedActivityChoiceStep } from './GuidedActivityChoiceStep';
import { GuidedActivityExplainStep } from './GuidedActivityExplainStep';
import { BoxingTutorialStep } from '../../tutorials/BoxingTutorialStep';
import { SprintTutorialStep } from '../../tutorials/SprintTutorialStep';
import { BoxingSenseChoiceStep } from './BoxingSenseChoiceStep';
import { StimuliChoiceStep } from './StimuliChoiceStep';
import { BoxingLevelExplainStep } from './BoxingLevelExplainStep';
import { NeuroFlowExplainStep } from './NeuroFlowExplainStep';
import { SprintTimeChoiceStep } from './SprintTimeChoiceStep';
import { LevelChoiceStep } from './LevelChoiceStep';
import { SpeedTierStimuliModal } from './SpeedTierStimuliModal';
import { ErrorTrackingChoiceStep } from './ErrorTrackingChoiceStep';
import { ProModeChoiceStep } from './ProModeChoiceStep';

export function ModeSelectionScreen({ ctx }: { ctx: AppCtx }) {
  const {
    appProfile, guidedStep, speedTierModalOpen,
  } = ctx;

  return (
    <>
    <div className="h-full overflow-y-auto overscroll-none bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 py-6"
      >
        {appProfile === 'GUIDED' ? (
          <AnimatePresence mode="wait">
            {guidedStep === 'CLASS_CHOICE' && (
              <GuidedClassChoiceStep key="guided-class" ctx={ctx} />
            )}

            {guidedStep === 'ACTIVITY_CHOICE' && (
              <GuidedActivityChoiceStep key="guided-activity" ctx={ctx} />
            )}

            {guidedStep === 'ACTIVITY_EXPLAIN' && (
              <GuidedActivityExplainStep key="guided-explain" ctx={ctx} />
            )}

            {guidedStep === 'BOXING_TUTORIAL' && (
              <BoxingTutorialStep key="guided-boxing-tutorial" ctx={ctx} />
            )}

            {guidedStep === 'SPRINT_TUTORIAL' && (
              <SprintTutorialStep key="guided-sprint-tutorial" ctx={ctx} />
            )}

            {guidedStep === 'BOXING_SENSE_CHOICE' && (
              <BoxingSenseChoiceStep key="guided-boxing-sense" ctx={ctx} />
            )}

            {guidedStep === 'STIMULI_CHOICE' && (
              <StimuliChoiceStep key="guided-stimuli" ctx={ctx} />
            )}

            {guidedStep === 'BOXING_LEVEL_EXPLAIN' && (
              <BoxingLevelExplainStep key="guided-boxing-level-explain" ctx={ctx} />
            )}

            {guidedStep === 'NEURO_FLOW_EXPLAIN' && <NeuroFlowExplainStep key="neuro-flow-explain" ctx={ctx} />}

            {guidedStep === 'SPRINT_TIME_CHOICE' && (
              <SprintTimeChoiceStep key="sprint-time-choice" ctx={ctx} />
            )}

            {guidedStep === 'LEVEL_CHOICE' && (
              <LevelChoiceStep key="guided-level" ctx={ctx} />
            )}

            {/* Fenêtre de choix du nombre de stimulis — ouverte après avoir
                tapé une vitesse dans la grille. Même disposition 3x2 pour
                rester visuellement cohérent avec la grille de vitesses. */}
            <AnimatePresence>
              {speedTierModalOpen !== null && (
                <SpeedTierStimuliModal key="speed-tier-stimuli-modal" ctx={ctx} />
              )}
            </AnimatePresence>

            {guidedStep === 'ERROR_TRACKING_CHOICE' && (
              <ErrorTrackingChoiceStep key="guided-error-choice" ctx={ctx} />
            )}
          </AnimatePresence>
        ) : (
          <ProModeChoiceStep ctx={ctx} />
        )}
      </motion.div>
    </div>
    </>
  );
}
