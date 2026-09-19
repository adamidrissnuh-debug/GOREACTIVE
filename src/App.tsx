/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence } from 'motion/react';
import { IntroTutorial } from './tutorials/IntroTutorial';
import { VoiceCalibrationOverlay } from './components/VoiceCalibrationOverlay';
import { ClearHistoryModal } from './components/ClearHistoryModal';
import { ScreenLockOverlay } from './components/ScreenLockOverlay';
import { PostSessionEvaluationModal } from './components/PostSessionEvaluationModal';
import { HistoryScreen } from './components/HistoryScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { LaunchSplash } from './components/ui/LaunchSplash';
import { useAppCtx } from './app/useAppCtx';
import { MicrophonePreparingScreen } from './screens/onboarding/MicrophonePreparingScreen';
import { LanguageSelectScreen } from './screens/onboarding/LanguageSelectScreen';
import { ProfileSelectScreen } from './screens/onboarding/ProfileSelectScreen';
import { ManifestoScreen } from './screens/onboarding/ManifestoScreen';
import { ModeSelectionScreen } from './screens/guided/ModeSelectionScreen';
import { GuidedFormatPickerModal } from './components/modals/GuidedFormatPickerModal';
import { GuidedModePickerModal } from './components/modals/GuidedModePickerModal';
import { PendingGuidedModeModal } from './components/modals/PendingGuidedModeModal';
import { ErrorModeModal } from './components/modals/ErrorModeModal';
import { PostSessionErrorModal } from './components/modals/PostSessionErrorModal';
import { TrainingView } from './screens/training/TrainingView';
import { LibraryView } from './screens/library/LibraryView';
import { SettingsView } from './screens/settings/SettingsView';
import { ProTutorialCard } from './tutorials/ProTutorialCard';
import { AboutModal } from './components/modals/AboutModal';
import { ExitConfirmModal } from './components/modals/ExitConfirmModal';
import { ToastNotice } from './components/modals/ToastNotice';
import { NoStimuliWarningModal } from './components/modals/NoStimuliWarningModal';
import { ProtocolRecapModal } from './components/modals/ProtocolRecapModal';
import { BottomNav } from './components/layout/BottomNav';
import { PendingPackChoiceModal } from './components/modals/PendingPackChoiceModal';
import { GlobalInlineStyles } from './components/layout/GlobalInlineStyles';

/**
 * App.tsx = AIGUILLAGE UNIQUEMENT.
 * - La logique vit dans src/app/ (zone protégée).
 * - L'affichage vit dans src/screens/ et src/components/ (zone design).
 * Ce fichier décide quel écran afficher et assemble la mise en page globale.
 */
export default function App() {
  const ctx = useAppCtx();
  const {
    showLaunchSplash, setShowLaunchSplash, launchMicrophoneChecked, isRunning, appMode,
    appLanguage, appProfile, guidedStep, pendingPackChoiceTier, countdownRemaining,
    currentTrainingClass, sessionHistory, setSessionHistory, showEvaluation,
    lastSessionStats, showClearHistoryModal, setShowClearHistoryModal, showAboutModal,
    showExitConfirm, toastMessage, showToast, showNoStimuliWarning, expandedSessionId,
    setExpandedSessionId, showGuidedModePicker, pendingGuidedMode,
    showGuidedFormatPicker, showProtocolRecap, userProgress, onboardingStep,
    setOnboardingStep, isLocked, setIsLocked, vocalThreshold, showErrorModeModal,
    showPostSessionErrorModal, proTutorialStep, resetToProfileSelection,
    effectiveAppMode, effectiveErrorMode, view, showMovementCalibrationModal,
    setShowMovementCalibrationModal, movementCalibrationCount,
    setMovementCalibrationCount, movementCalibrationCountRef, voiceTrigger, lockTimerRef,
    saveSession,
  } = ctx;

  if (!launchMicrophoneChecked) {
    return <MicrophonePreparingScreen />;
  }


  if (showLaunchSplash) {
    return (
      <AnimatePresence mode="wait">
        <LaunchSplash key="launch-splash" onComplete={() => setShowLaunchSplash(false)} />
      </AnimatePresence>
    );
  }


  if (!appLanguage) {
    return <LanguageSelectScreen ctx={ctx} />;
  }


  if (onboardingStep === 'TUTORIAL') {
    return (
      <IntroTutorial
        appLanguage={appLanguage || 'fr'}
        onComplete={() => setOnboardingStep('PROFILE_SELECTION')}
      />
    );
  }


  if (onboardingStep === 'PROFILE_SELECTION') {
    return <ProfileSelectScreen ctx={ctx} />;
  }


  if (onboardingStep === 'MANIFESTO') {
    return <ManifestoScreen ctx={ctx} />;
  }

    if (!effectiveAppMode || (appProfile === 'GUIDED' && guidedStep)) {
    return <ModeSelectionScreen ctx={ctx} />;
  }


    return (
    <>
      {/* Modal Format Guidé (Neuro-Flow / Niveaux Standards) */}
      <AnimatePresence>
      {showGuidedFormatPicker && (
          <GuidedFormatPickerModal ctx={ctx} />
        )}
      </AnimatePresence>

      {/* Modal Mode Guidé (Audio / Visuel / Chaos) */}
      <AnimatePresence>
      {showGuidedModePicker && (
          <GuidedModePickerModal ctx={ctx} />
        )}
      </AnimatePresence>

      {/* Modal confirmation tutoriel — après avoir choisi un nouveau mode */}
      <AnimatePresence>
      {pendingGuidedMode && (
          <PendingGuidedModeModal ctx={ctx} />
        )}
      </AnimatePresence>

      {/* Modal choix mode d'erreur */}
      <AnimatePresence>
      {showErrorModeModal && (
          <ErrorModeModal ctx={ctx} />
        )}
      </AnimatePresence>

      {/* Modal saisie erreurs post-session */}
      {showPostSessionErrorModal && (
          <PostSessionErrorModal ctx={ctx} />
        )}

      {/* Global Modals Container */}
      <AnimatePresence>
        <VoiceCalibrationOverlay 
          key="modal-calibration-movement"
          isOpen={showMovementCalibrationModal}
          progress={movementCalibrationCount}
          threshold={vocalThreshold}
          appLanguage={appLanguage || 'fr'}
          onCancel={() => {
            setShowMovementCalibrationModal(false);
            setMovementCalibrationCount(0);
            movementCalibrationCountRef.current = 0;
          }}
          localTrigger={voiceTrigger}
        />

        <ClearHistoryModal 
          isOpen={showClearHistoryModal}
          appLanguage={appLanguage || 'fr'}
          onClear={() => {
            setSessionHistory([]);
            localStorage.removeItem('goreactive_history');
            setShowClearHistoryModal(false);
            showToast(appLanguage === 'en' ? 'History cleared' : 'Historique vidé');
          }}
          onClose={() => setShowClearHistoryModal(false)}
        />
    </AnimatePresence>

    <div className="fixed inset-0 premium-shell bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans selection:bg-[var(--acc-primary)] selection:text-[var(--bg-primary)] flex flex-col overflow-hidden select-none transition-colors duration-300">
      
      <ScreenLockOverlay 
        isOpen={isLocked}
        appLanguage={appLanguage || 'fr'}
        onUnlockStart={() => { lockTimerRef.current = window.setTimeout(() => setIsLocked(false), 1000); }}
        onUnlockEnd={() => { if(lockTimerRef.current) window.clearTimeout(lockTimerRef.current); }}
      />

      <AnimatePresence>
        {showEvaluation && lastSessionStats && (
          <PostSessionEvaluationModal 
            lastSessionStats={lastSessionStats}
            userProgress={userProgress}
            appLanguage={appLanguage}
            onSave={saveSession}
            onSkip={() => saveSession(0)}
            errorMode={effectiveErrorMode}
          />
        )}
      </AnimatePresence>
      {/* Viewport for Views */}
      <main className="flex-1 relative overflow-hidden bg-[var(--bg-primary)]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--acc-primary) 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        
        <AnimatePresence mode="sync" initial={false}>
          {view === 'history' && (
            <HistoryScreen
              sessionHistory={sessionHistory}
              userProgress={userProgress}
              appLanguage={appLanguage}
              expandedSessionId={expandedSessionId}
              setExpandedSessionId={setExpandedSessionId}
              setShowClearHistoryModal={setShowClearHistoryModal}
              appProfile={appProfile}
              trainingClass={currentTrainingClass}
              onChangeProfile={resetToProfileSelection}
            />
          )}
          {view === 'progress' && (
            <ProgressScreen
              sessionHistory={sessionHistory}
              userProgress={userProgress}
              appLanguage={appLanguage}
            />
          )}
    {view === 'training' && (
      <TrainingView key="training-view" ctx={ctx} />
        )}
    {view === 'library' && (
            <LibraryView key="library" ctx={ctx} />
          )}
    {view === 'settings' && (
      <SettingsView key="settings" ctx={ctx} />
    )}

    {/* Pro settings tutorial — a fixed bottom card, rendered as a sibling of
        the settings screen (not nested inside its animated motion.div,
        which keeps a CSS transform even at rest and would break `fixed`
        positioning for anything inside it). */}
    <AnimatePresence>
      {proTutorialStep !== null && view === 'settings' && (
        <ProTutorialCard key="pro-tutorial-card" ctx={ctx} />
      )}
    </AnimatePresence>

    {showAboutModal && (
        <AboutModal ctx={ctx} />
      )}

    {showExitConfirm && (
        <ExitConfirmModal ctx={ctx} />
      )}

    {toastMessage && (
      <ToastNotice ctx={ctx} />
    )}

    {showNoStimuliWarning && (
      <NoStimuliWarningModal ctx={ctx} />
    )}

    {showProtocolRecap && appMode && (
      <ProtocolRecapModal ctx={ctx} />
    )}

        </AnimatePresence>
      </main>
    {/* Ergonomic Bottom Navigation */}
      {!isRunning && countdownRemaining === null && (
        <BottomNav ctx={ctx} />
      )}

      {/* Choix Chiffres/Tags en cours de séance — s'affiche quand un
          changement de vitesse (menu pause ou réglages) forcerait
          l'abandon du pack "Noms Techniques" pour un pack à mots courts.
          Rendue au niveau racine pour rester disponible depuis n'importe
          quel écran. */}
      <AnimatePresence>
        {pendingPackChoiceTier !== null && <PendingPackChoiceModal key="pending-pack-choice-modal" ctx={ctx} />}
      </AnimatePresence>

    <GlobalInlineStyles />
    </div>
    </>
  );
}
