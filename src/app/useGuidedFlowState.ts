/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * État du profil (PRO/GUIDED), du parcours guidé, de la Neuro-Flow, des tutoriels guidés, des paliers de vitesse et du compte à rebours.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import { useState, useEffect, useRef } from 'react';
import { AppProfile, AppMode, GuidedSignalMode } from '../types';
import { GuidedCategory } from '../constants/guidedPresets';
import type { useCoreState } from './useCoreState';

export function useGuidedFlowState(prev: ReturnType<typeof useCoreState>) {
  const {
    isPaused, pauseStartTimeRef, setAccumulatedPauseTime, appMode, appLanguage,
  } = prev;

  const [appProfile, setAppProfile] = useState<AppProfile | null>(() => {
    const saved = localStorage.getItem('goreactive_profile');
    return saved === 'PRO' || saved === 'GUIDED' ? saved : null;
  });
  const [guidedStep, setGuidedStep] = useState<'CLASS_CHOICE' | 'ACTIVITY_CHOICE' | 'LEVEL_CHOICE' | 'STIMULI_CHOICE' | 'ACTIVITY_EXPLAIN' | 'BOXING_SENSE_CHOICE' | 'BOXING_TUTORIAL' | 'ERROR_TRACKING_CHOICE' | 'BOXING_LEVEL_EXPLAIN' | 'SPRINT_TIME_CHOICE' | 'SPRINT_TUTORIAL' | 'NEURO_FLOW_EXPLAIN' | null>('CLASS_CHOICE');
  const [neuroFlowActive, setNeuroFlowActive] = useState(false);
  const [neuroFlowLevel, setNeuroFlowLevel] = useState(1); // 1-18 (6 vitesses × 3 sous-niveaux de stimulis)
  const [neuroFlowLives, setNeuroFlowLives] = useState(3);
  const [neuroFlowSuccessStreak, setNeuroFlowSuccessStreak] = useState(0);
  const [neuroFlowHighestLevel, setNeuroFlowHighestLevel] = useState(1);
  const [neuroFlowLevelUpGlow, setNeuroFlowLevelUpGlow] = useState(false);
  // Incrémenté à chaque bonne réaction pendant Neuro-Flow — sert de
  // déclencheur pour un pulse visuel bref à l'écran (voir rendu plus bas).
  const [neuroFlowHitPulse, setNeuroFlowHitPulse] = useState(0);

  const [guidedActivity, setGuidedActivity] = useState<GuidedCategory | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [guidedAppMode, setGuidedAppMode] = useState<AppMode | null>(null);

  // Mode-specific messages for the tutorial
  const getBoxingTutorialMessages = () => {
    if (guidedAppMode === 'VOICE') {
      return [
        {
          title: appLanguage === 'fr' ? "Écoute le signal." : "Listen to signal.",
          desc: appLanguage === 'fr' ? "Concentre-toi sur l'ordre audio du coach." : "Focus on the coach's audio command."
        },
        {
          title: appLanguage === 'fr' ? "Frappe immédiatement." : "Punch immediately.",
          desc: appLanguage === 'fr' ? "Déclenche ton coup sans la moindre hésitation." : "Trigger your punch without any hesitation."
        },
        {
          title: appLanguage === 'fr' ? "Replace-toi." : "Reset Guard.",
          desc: appLanguage === 'fr' ? "Reviens en garde instantanément après l'impact." : "Return to guard instantly after the impact."
        }
      ];
    }
    if (guidedAppMode === 'COLOR') {
      return [
        {
          title: appLanguage === 'fr' ? "Lis le signal affiché." : "Read the signal.",
          desc: appLanguage === 'fr' ? "Identifie visuellement la commande sur le téléphone." : "Visually identify the command on the phone."
        },
        {
          title: appLanguage === 'fr' ? "Réagis rapidement." : "React quickly.",
          desc: appLanguage === 'fr' ? "Ta lecture doit être instantanée et précise." : "Your reading must be instantaneous and precise."
        },
        {
          title: appLanguage === 'fr' ? "Reste mobile." : "Stay mobile.",
          desc: appLanguage === 'fr' ? "Garde un jeu de jambes dynamique en attendant le signal." : "Keep dynamic footwork while waiting for the signal."
        }
      ];
    }
    if (guidedAppMode === 'CHAOS') {
      return [
        {
          title: appLanguage === 'fr' ? "🟢 Vert : fais le coup entendu." : "🟢 Green: do the heard punch.",
          desc: appLanguage === 'fr' ? "Le signal audio est ta commande directe." : "The audio signal is your direct command."
        },
        {
          title: appLanguage === 'fr' ? "🔴 Rouge : fais l’opposé." : "🔴 Red: do the opposite.",
          desc: appLanguage === 'fr' ? "Ignore l'audio et frappe du côté inverse." : "Ignore the audio and punch on the opposite side."
        }
      ];
    }
    return [
      {
        title: appLanguage === 'fr' ? "Réagis vite." : "React fast.",
        desc: appLanguage === 'fr' ? "Cible le stimulus dès son apparition." : "Target the stimulus as soon as it appears."
      },
      {
        title: appLanguage === 'fr' ? "Replace-toi." : "Reset Guard.",
        desc: appLanguage === 'fr' ? "Frappe et reviens immédiatement en garde." : "Punch and return to guard instantly."
      },
      {
        title: appLanguage === 'fr' ? "Mode Erreur" : "Error Mode",
        desc: appLanguage === 'fr' ? "Si tu rates, dis \"Faux\" ou \"Non\" à haute voix." : "If you miss, say \"No\" or \"False\" out loud."
      }
    ];
  };

  const getSprintTutorialMessages = () => {
    return [
      {
        title: appLanguage === 'fr' ? "Plein Gaz." : "Full Speed.",
        desc: appLanguage === 'fr' ? "Sprinte le plus vite possible et reste à l'affût du signal." : "Sprint at full speed and stay alert for the signal."
      },
      {
        title: appLanguage === 'fr' ? "Explose." : "Explode.",
        desc: appLanguage === 'fr' ? "Change de direction instantanément avec une impulsion brutale." : "Change direction instantly with an explosive push-off."
      },
      {
        title: appLanguage === 'fr' ? "Reste Agile." : "Stay Agile.",
        desc: appLanguage === 'fr' ? "Sois le plus explosif possible sur tes changements d'appuis." : "Be as explosive as possible on your footwork transitions."
      }
    ];
  };

  const boxingTutorialMessages = guidedActivity === 'BOXING' ? getBoxingTutorialMessages() : getSprintTutorialMessages();
  const currentTutorialMessage = boxingTutorialMessages[tutorialStep] || boxingTutorialMessages[0];

  useEffect(() => {
    // Reset tutorial step whenever we enter the tutorial or change mode
    if (guidedStep === 'BOXING_TUTORIAL') {
      setTutorialStep(0);
    }
  }, [guidedStep, guidedAppMode]);

  // "In Motion" is now the only class, so the class-selection screen is a
  // dead click — auto-select it and jump straight to activity choice
  // (Boxing / Sprint), which is the real next step. (Effect moved below,
  // after sessionHistory is declared — see the block right after it.)


  // Neuro-Flow Adaptation Logic
  const prevSuccessRef = useRef(0);
  const prevErrorsRef = useRef(0);

  const [selectedSprintTime, setSelectedSprintTime] = useState<string | null>(null);
  const [skipCalibration, setSkipCalibration] = useState(false);
  const [guidedSignalMode, setGuidedSignalMode] = useState<GuidedSignalMode | null>(null);
  const [guidedDifficulty, setGuidedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);
  const [guidedSubLevel, setGuidedSubLevel] = useState<number>(1);
  // Niveaux Standards (Boxe) — nouvelle échelle : vitesse (1-6) et nombre de
  // stimulis (1-6) sont deux choix indépendants. Remplace guidedDifficulty/
  // guidedSubLevel pour ce parcours ; Neuro-Flow garde son propre système
  // de progression automatique, inchangé.
  const [guidedSpeedTier, setGuidedSpeedTier] = useState<1 | 2 | 3 | 4 | 5 | 6 | null>(null);
  const [guidedStimuliCount, setGuidedStimuliCount] = useState<number>(3);
  // Fenêtre de choix du nombre de stimulis, ouverte après avoir tapé une
  // vitesse dans la grille — null tant qu'aucune vitesse n'est en attente.
  const [speedTierModalOpen, setSpeedTierModalOpen] = useState<number | null>(null);
  // Sélection en attente de confirmation dans la fenêtre "Combien de
  // stimulis ?" — le carré choisi s'illumine, puis un bouton Continuer
  // apparaît ; rien n'est appliqué tant qu'il n'est pas confirmé.
  const [selectedStimuliCount, setSelectedStimuliCount] = useState<number | null>(null);
  useEffect(() => {
    setSelectedStimuliCount(null);
  }, [speedTierModalOpen]);
  // Filet de sécurité : cette fenêtre n'a de sens que sur l'écran de choix
  // de niveau — si on le quitte par n'importe quel chemin (retour, reprise
  // de l'assistant depuis le début, etc.) sans être passé par un des 6
  // boutons de stimulis, elle doit se refermer plutôt que de rester
  // affichée par-dessus l'écran suivant.
  useEffect(() => {
    if (guidedStep !== 'LEVEL_CHOICE') setSpeedTierModalOpen(null);
  }, [guidedStep]);
  const [guidedStimuliPack, setGuidedStimuliPack] = useState<string | null>('FULL');
  // Fenêtre de choix Chiffres/Tags — ouverte quand un changement de vitesse
  // en cours de séance (menu pause ou réglages) forcerait l'abandon du pack
  // "Noms Techniques" pour un pack à mots courts. Contient le palier de
  // vitesse en attente tant que l'utilisateur n'a pas choisi ; null sinon.
  const [pendingPackChoiceTier, setPendingPackChoiceTier] = useState<1 | 2 | 3 | 4 | 5 | 6 | null>(null);
  const [countdownDuration, setCountdownDuration] = useState(3);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [isResumeCountdown, setIsResumeCountdown] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>(['red', 'blue', 'green']);
  const [selectedClass, setSelectedClass] = useState<'MOTION' | null>(null);
  // Authoritative training class for the current mode — falls back to
  // selectedClass only when no mode is active yet. Only Motion exists now.
  const currentTrainingClass: 'MOTION' | null = (appMode || guidedAppMode) ? 'MOTION' : selectedClass;
  const selectedClassRef = useRef(selectedClass);
  useEffect(() => { selectedClassRef.current = selectedClass; }, [selectedClass]);
  const [colorLanguage, setColorLanguage] = useState<'en' | 'fr'>('fr');
  const [workDuration, setWorkDuration] = useState(5); // in minutes

  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else if (pauseStartTimeRef.current) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      setAccumulatedPauseTime(prev => prev + pauseDuration);
      pauseStartTimeRef.current = null;
    }
  }, [isPaused]);

  const [isVocalCountdownActive, setIsVocalCountdownActive] = useState(false);

  return {
    appProfile, setAppProfile, guidedStep, setGuidedStep, neuroFlowActive,
    setNeuroFlowActive, neuroFlowLevel, setNeuroFlowLevel, neuroFlowLives,
    setNeuroFlowLives, neuroFlowSuccessStreak, setNeuroFlowSuccessStreak,
    neuroFlowHighestLevel, setNeuroFlowHighestLevel, neuroFlowLevelUpGlow,
    setNeuroFlowLevelUpGlow, neuroFlowHitPulse, setNeuroFlowHitPulse, guidedActivity,
    setGuidedActivity, tutorialStep, setTutorialStep, guidedAppMode, setGuidedAppMode,
    getBoxingTutorialMessages, getSprintTutorialMessages, boxingTutorialMessages,
    currentTutorialMessage, prevSuccessRef, prevErrorsRef, selectedSprintTime,
    setSelectedSprintTime, skipCalibration, setSkipCalibration, guidedSignalMode,
    setGuidedSignalMode, guidedDifficulty, setGuidedDifficulty, guidedSubLevel,
    setGuidedSubLevel, guidedSpeedTier, setGuidedSpeedTier, guidedStimuliCount,
    setGuidedStimuliCount, speedTierModalOpen, setSpeedTierModalOpen,
    selectedStimuliCount, setSelectedStimuliCount, guidedStimuliPack,
    setGuidedStimuliPack, pendingPackChoiceTier, setPendingPackChoiceTier,
    countdownDuration, setCountdownDuration, countdownRemaining, setCountdownRemaining,
    isResumeCountdown, setIsResumeCountdown, selectedColors, setSelectedColors,
    selectedClass, setSelectedClass, currentTrainingClass, selectedClassRef,
    colorLanguage, setColorLanguage, workDuration, setWorkDuration,
    isVocalCountdownActive, setIsVocalCountdownActive,
  };
}
