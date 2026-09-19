/**
 * LOGIQUE — ZONE PROTÉGÉE.
 * Assemble tous les hooks de logique dans l'ordre d'origine et expose un unique objet `ctx`
 * que les écrans (src/screens, src/components) lisent. Les écrans ne contiennent que de l'affichage.
 */
import { useCoreState } from './useCoreState';
import { useGuidedFlowState } from './useGuidedFlowState';
import { useHistoryAndModalsState } from './useHistoryAndModalsState';
import { useSettingsState } from './useSettingsState';
import { useGuidedActions } from './useGuidedActions';
import { useTrainingEngine } from './useTrainingEngine';
import { useSessionControl } from './useSessionControl';
import { useSessionPersistence } from './useSessionPersistence';

export function useAppCtx() {
  const s1 = useCoreState();
  const s2 = { ...s1, ...useGuidedFlowState(s1) };
  const s3 = { ...s2, ...useHistoryAndModalsState(s2) };
  const s4 = { ...s3, ...useSettingsState(s3) };
  const s5 = { ...s4, ...useGuidedActions(s4) };
  const s6 = { ...s5, ...useTrainingEngine(s5) };
  const s7 = { ...s6, ...useSessionControl(s6) };
  const s8 = { ...s7, ...useSessionPersistence(s7) };
  return s8;
}

export type AppCtx = ReturnType<typeof useAppCtx>;
