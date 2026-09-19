import * as React from 'react';

export type AppMode = 'VOICE' | 'COLOR' | 'CHAOS';
export type AppProfile = 'PRO' | 'GUIDED';
export type WorkType = 'CONTINUOUS' | 'INTERMITTENT';
export type WorkPhase = 'WORK' | 'REST' | 'SET_REST' | 'COMPLETE';

export interface WordLog {
  id: string;
  word: string;
  timestamp: Date;
}

export interface TrainingSession {
  id: string;
  date: string;
  /** Raw epoch timestamp (ms), set alongside `date` — used for recency checks like "was this within the last 7 days" that the formatted `date` string can't support. */
  timestamp?: number;
  mode: AppMode;
  volume: number;
  successes: number;
  failures: number;
  bestStreak: number;
  duration: number; 
  rating: number; 
  isEvaluated?: boolean;
  /** How errors were tracked for this session — used to decide whether the
      "longest error-free streak" stat is meaningful enough to show in the
      journal (only 'live' tracking and Neuro-Flow guarantee it reflects
      real misses, not just unrecorded ones). */
  errorMode?: 'live' | 'post' | 'none' | null;
  neuroFlowActive?: boolean;
  neuroFlowFinalLevel?: number;
  neuroFlowHighestLevelReached?: number;
  guidedActivity?: string; 
  /** Sprint-specific interval config, captured at save time for display in the journal. */
  sprintWorkSeconds?: number;
  sprintRestSeconds?: number;
  sprintRounds?: number;
  sprintSets?: number;
  /** Which profile launched this session — used to separate Athlete (PRO) and Guided stats/history. */
  profile?: 'PRO' | 'GUIDED';
}

export interface UserProgress {
  streak: number;
  lastTrainingDate: string | null;
}

export interface SavedProtocol {
  id: string;
  name: string;
  mode: AppMode;
  minInterval: number;
  maxInterval: number;
  workDuration: number;
  workType: WorkType;
  words: string[];
  chaosAudioMode?: string;
  chaosAudioWords?: string[];
  chaosVisualMode?: string;
  chaosVisualWords?: string[];
  activeRainbowColors?: string[];
  visualStimuliIncludesWords?: boolean;
  visualStimuliIncludesColors?: boolean;
  createdAt: string;
}

export interface StroopColor {
  id: string;
  hex: string;
  labels: { en: string; fr: string };
}

export type GuidedActivity = 'BOXING' | 'SPRINT' | 'PLOTS' | 'EQUIPMENT_FREE';
export type GuidedSignalMode = 'AUDIO' | 'VISUAL' | 'CHAOS';
export type GuidedDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GuidedSessionConfig {
  activity: GuidedActivity;
  signalMode: GuidedSignalMode;
  difficulty: GuidedDifficulty;
  subLevel: number;
  errorTrackingEnabled: boolean;
  stimuliPackId?: string;
  language: 'en' | 'fr';
}

export interface EngineSessionSettings {
  appMode: AppMode;
  minInterval: number;
  maxInterval: number;
  words?: string[];
  visualMode?: 'NONE' | 'WORDS' | 'COLORS' | 'BOTH';
  visualWords?: string[];
  audioMode?: 'NONE' | 'WORDS' | 'RECORDS';
  audioWords?: string[];
  errorTrackingEnabled: boolean;
  switchingMode?: boolean;
  opposites?: Record<string, string>;
  activeRainbowColors?: string[];
}
