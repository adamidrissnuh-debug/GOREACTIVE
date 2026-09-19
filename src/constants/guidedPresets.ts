import { AppMode } from '../types';

export interface GuidedPreset {
  id: string;
  level: 1 | 2 | 3;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  minInterval: number;
  maxInterval: number;
  stimuliCount: number;
  rounds?: number;
  rest?: number;
  sets?: number;
  description: { en: string; fr: string };
}

export type GuidedCategory = 'BOXING' | 'SPRINT';

export interface GuidedActivity {
  id: GuidedCategory;
  name: { en: string; fr: string };
  icon: string;
  presets: Record<AppMode, Record<string, GuidedPreset[]>>; // mode -> difficulty -> levels
}

// ─────────────────────────────────────────────────────────────────────────
// Niveaux Standards (Boxe) — nouvelle échelle : vitesse et nombre de
// stimulis sont deux choix indépendants, au lieu d'être liés comme avant
// (Facile/Moyen/Difficile faisait monter les deux en même temps).
//
// Les paliers 5 et 6 sont volontairement prudents : au-delà du simple temps
// de prononciation d'un mot, la synthèse vocale a son propre temps de
// démarrage avant que le son ne sorte réellement — un premier calibrage
// plus optimiste s'est révélé insuffisant en usage réel (stimulis coupés
// net avant même d'être audibles). Ces chiffres intègrent maintenant une
// vraie marge de sécurité, mais restent à confirmer par un usage réel —
// le seul moyen fiable de valider un temps de synthèse vocale sur un vrai
// appareil. Les mots longs (pack "Noms Techniques") ne tiennent toujours
// pas à ces vitesses — le choix du pack reste restreint aux vitesses 5 et
// 6 (voir STIMULI_CHOICE) plutôt que de ralentir l'intervalle en silence.
// ─────────────────────────────────────────────────────────────────────────
export interface SpeedTier {
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  minInterval: number;
  maxInterval: number;
  shortWordsOnly: boolean;
  label: { en: string; fr: string };
}

export const SPEED_TIERS: SpeedTier[] = [
  { tier: 1, minInterval: 2.2, maxInterval: 2.7, shortWordsOnly: false, label: { en: 'Discovery', fr: 'Découverte' } },
  { tier: 2, minInterval: 1.8, maxInterval: 2.2, shortWordsOnly: false, label: { en: 'Steady', fr: 'Posé' } },
  { tier: 3, minInterval: 1.4, maxInterval: 1.7, shortWordsOnly: false, label: { en: 'Sustained', fr: 'Soutenu' } },
  { tier: 4, minInterval: 1.15, maxInterval: 1.4, shortWordsOnly: false, label: { en: 'Fast', fr: 'Rapide' } },
  { tier: 5, minInterval: 0.9, maxInterval: 1.15, shortWordsOnly: true, label: { en: 'Very Fast', fr: 'Très rapide' } },
  { tier: 6, minInterval: 0.7, maxInterval: 0.8, shortWordsOnly: true, label: { en: 'Maximum', fr: 'Maximum' } },
];

// ─────────────────────────────────────────────────────────────────────────
// Neuro-Flow — 18 niveaux, toujours 6 stimulis actifs (dès le niveau 1,
// volontairement — Neuro-Flow représente une vraie séance de sparring, pas
// un tutoriel progressif). Seule la vitesse augmente, en accélérant plus
// fort sur la fin. Le niveau 18 tombe exactement sur l'intervalle du
// palier 6 des Niveaux Standards (0.70-0.80s, déjà validé en conditions
// réelles) ; les 17 premiers sont un resserrement progressif sans
// contrainte de correspondance avec les Niveaux Standards.
// ─────────────────────────────────────────────────────────────────────────
export interface NeuroFlowLevelDef {
  level: number;
  minInterval: number;
  maxInterval: number;
}

export const NEURO_FLOW_LEVELS: NeuroFlowLevelDef[] = [
  { level: 1, minInterval: 2.50, maxInterval: 3.00 },
  { level: 2, minInterval: 2.48, maxInterval: 2.98 },
  { level: 3, minInterval: 2.44, maxInterval: 2.93 },
  { level: 4, minInterval: 2.39, maxInterval: 2.86 },
  { level: 5, minInterval: 2.32, maxInterval: 2.78 },
  { level: 6, minInterval: 2.25, maxInterval: 2.69 },
  { level: 7, minInterval: 2.16, maxInterval: 2.58 },
  { level: 8, minInterval: 2.06, maxInterval: 2.47 },
  { level: 9, minInterval: 1.96, maxInterval: 2.34 },
  { level: 10, minInterval: 1.85, maxInterval: 2.20 },
  { level: 11, minInterval: 1.73, maxInterval: 2.06 },
  { level: 12, minInterval: 1.60, maxInterval: 1.90 },
  { level: 13, minInterval: 1.47, maxInterval: 1.74 },
  { level: 14, minInterval: 1.33, maxInterval: 1.57 },
  { level: 15, minInterval: 1.18, maxInterval: 1.39 },
  { level: 16, minInterval: 1.03, maxInterval: 1.20 },
  { level: 17, minInterval: 0.87, maxInterval: 1.00 },
  { level: 18, minInterval: 0.70, maxInterval: 0.80 },
];


export const GUIDED_PRESETS: Record<string, any> = {
  BOXING: {
    STIMULI_PACKS: [
      { 
        id: 'FULL', 
        name: { en: 'Technical Names', fr: 'Noms Techniques' }, 
        description: { en: 'Straight, Hook, Uppercut', fr: 'Direct, Crochet, Uppercut' }, 
        stimuli: { 
          fr: ['Gauche', 'Droite', 'Crochet Gauche', 'Crochet Droit', 'Uppercut Gauche', 'Uppercut Droit'], 
          en: ['Jab', 'Cross', 'Left Hook', 'Right Hook', 'Left Uppercut', 'Right Uppercut'] 
        },
        mapping: {
          fr: [
            { signal: 'Gauche', meaning: 'Coup de poing avant direct' },
            { signal: 'Droite', meaning: 'Coup de poing arrière direct' },
            { signal: 'Crochet Gauche', meaning: 'Coup circulaire court gauche' },
            { signal: 'Crochet Droit', meaning: 'Coup circulaire court droit' },
            { signal: 'Uppercut Gauche', meaning: 'Coup remontant gauche' },
            { signal: 'Uppercut Droit', meaning: 'Coup remontant droit' }
          ],
          en: [
            { signal: 'Jab', meaning: 'Front straight punch' },
            { signal: 'Cross', meaning: 'Back straight punch' },
            { signal: 'Left Hook', meaning: 'Short lateral punch left' },
            { signal: 'Right Hook', meaning: 'Short lateral punch right' },
            { signal: 'Left Uppercut', meaning: 'Rising punch left' },
            { signal: 'Right Uppercut', meaning: 'Rising punch right' }
          ]
        },
        opposites: {
          'Gauche': 'Droite',
          'Droite': 'Gauche',
          'Crochet Gauche': 'Crochet Droit',
          'Crochet Droit': 'Crochet Gauche',
          'Uppercut Gauche': 'Uppercut Droit',
          'Uppercut Droit': 'Uppercut Gauche',
          'Jab': 'Cross',
          'Cross': 'Jab',
          'Left Hook': 'Right Hook',
          'Right Hook': 'Left Hook',
          'Left Uppercut': 'Right Uppercut',
          'Right Uppercut': 'Left Uppercut'
        }
      },
      { 
        id: 'PRO', 
        name: { en: 'Pro (Numbers)', fr: 'Pro (Chiffres)' }, 
        description: { en: '1 to 6 numbering', fr: 'Numérotation de 1 à 6' }, 
        stimuli: { fr: ['1', '2', '3', '4', '5', '6'], en: ['1', '2', '3', '4', '5', '6'] },
        mapping: {
          fr: [
            { signal: '1', meaning: 'Gauche' },
            { signal: '2', meaning: 'Droite' },
            { signal: '3', meaning: 'Crochet Gauche' },
            { signal: '4', meaning: 'Crochet Droit' },
            { signal: '5', meaning: 'Uppercut Gauche' },
            { signal: '6', meaning: 'Uppercut Droit' }
          ],
          en: [
            { signal: '1', meaning: 'Jab' },
            { signal: '2', meaning: 'Cross' },
            { signal: '3', meaning: 'Left Hook' },
            { signal: '4', meaning: 'Right Hook' },
            { signal: '5', meaning: 'Left Uppercut' },
            { signal: '6', meaning: 'Right Uppercut' }
          ]
        },
        opposites: {
          '1': '2', '2': '1',
          '3': '4', '4': '3',
          '5': '6', '6': '5'
        }
      },
      { 
        id: 'SHORT', 
        name: { en: 'Short (Tags)', fr: 'Abrégé (Tags)' }, 
        description: { en: 'J, C, LH, RH, LU, RU', fr: 'G, D, CG, CD, UG, UD' }, 
        stimuli: { 
          fr: ['G', 'D', 'CG', 'CD', 'UG', 'UD'], 
          en: ['J', 'C', 'LH', 'RH', 'LU', 'RU'] 
        },
        mapping: {
          fr: [
            { signal: 'G', meaning: 'Gauche' },
            { signal: 'D', meaning: 'Droite' },
            { signal: 'CG', meaning: 'Crochet Gauche' },
            { signal: 'CD', meaning: 'Crochet Droit' },
            { signal: 'UG', meaning: 'Uppercut Gauche' },
            { signal: 'UD', meaning: 'Uppercut Droit' }
          ],
          en: [
            { signal: 'J', meaning: 'Jab' },
            { signal: 'C', meaning: 'Cross' },
            { signal: 'LH', meaning: 'Left Hook' },
            { signal: 'RH', meaning: 'Right Hook' },
            { signal: 'LU', meaning: 'Left Uppercut' },
            { signal: 'RU', meaning: 'Right Uppercut' }
          ]
        },
        opposites: {
          'G': 'D', 'D': 'G',
          'CG': 'CD', 'CD': 'CG',
          'UG': 'UD', 'UD': 'UG',
          'J': 'C', 'C': 'J',
          'LH': 'RH', 'RH': 'LH',
          'LU': 'RU', 'RU': 'LU'
        }
      }
    ],
    MODES: {
      VOICE: {
        EASY: [
          { level: 1, stimuliCount: 2, minInterval: 2.2, maxInterval: 2.8, description: { en: 'Basic patterns learning.', fr: 'Apprentissage des patterns de base.' } },
          { level: 2, stimuliCount: 3, minInterval: 2.3, maxInterval: 2.9, description: { en: 'Introduction of a new angle (e.g., Hook).', fr: 'Introduction d\'un nouvel angle (ex: Crochet).' } },
          { level: 3, stimuliCount: 3, minInterval: 1.9, maxInterval: 2.5, description: { en: 'Consolidation, reduced rest time.', fr: 'Consolidation, on réduit le temps de repos.' } }
        ],
        MEDIUM: [
          { level: 1, stimuliCount: 4, minInterval: 1.6, maxInterval: 2.0, description: { en: '4 basic punches (Jabs + Hooks).', fr: 'On passe aux 4 coups de base (Directs + Crochets).' } },
          { level: 2, stimuliCount: 4, minInterval: 1.3, maxInterval: 1.7, description: { en: 'Flow state: moderate heart intensity.', fr: 'Zone de "Flow" : intensité cardiaque modérée.' } },
          { level: 3, stimuliCount: 5, minInterval: 1.4, maxInterval: 1.8, description: { en: 'Introduction of Uppercut, slight time adjustment.', fr: 'Introduction d\'un Uppercut, léger ajustement de temps.' } }
        ],
        HARD: [
          { level: 1, stimuliCount: 6, minInterval: 1.0, maxInterval: 1.4, description: { en: 'Full boxing panel. Total vigilance.', fr: 'Panel complet de boxe. Exige une vigilance totale.' } },
          { level: 2, stimuliCount: 6, minInterval: 0.8, maxInterval: 1.2, description: { en: 'Close to pro decision reaction time.', fr: 'Proche du temps de réaction de décision pro.' } },
          { level: 3, stimuliCount: 6, minInterval: 0.6, maxInterval: 1.0, description: { en: 'Champion mode: instinctive reaction.', fr: 'Mode "Champion" : Réaction quasi-instinctive.' } }
        ]
      },
      COLOR: {
        EASY: [
          { level: 1, stimuliCount: 2, minInterval: 2.2, maxInterval: 2.8, description: { en: 'Basic visual patterns.', fr: 'Patterns visuels de base.' } },
          { level: 2, stimuliCount: 3, minInterval: 2.3, maxInterval: 2.9, description: { en: 'New visual angles.', fr: 'Nouveaux angles visuels.' } },
          { level: 3, stimuliCount: 3, minInterval: 1.9, maxInterval: 2.5, description: { en: 'Visual consolidation.', fr: 'Consolidation visuelle.' } }
        ],
        MEDIUM: [
          { level: 1, stimuliCount: 4, minInterval: 1.6, maxInterval: 2.0, description: { en: '4 color/word reaction.', fr: 'Réaction sur 4 couleurs/mots.' } },
          { level: 2, stimuliCount: 4, minInterval: 1.3, maxInterval: 1.7, description: { en: 'Visual flow state.', fr: 'Zone de flow visuelle.' } },
          { level: 3, stimuliCount: 5, minInterval: 1.4, maxInterval: 1.8, description: { en: 'High capacity visual load.', fr: 'Charge visuelle haute capacité.' } }
        ],
        HARD: [
          { level: 1, stimuliCount: 6, minInterval: 1.0, maxInterval: 1.4, description: { en: 'Expert visual panel.', fr: 'Panel visuel expert.' } },
          { level: 2, stimuliCount: 6, minInterval: 0.8, maxInterval: 1.2, description: { en: 'Pro visual reaction speed.', fr: 'Vitesse de réaction visuelle pro.' } },
          { level: 3, stimuliCount: 6, minInterval: 0.6, maxInterval: 1.0, description: { en: 'Champion visual reaction.', fr: 'Réaction visuelle champion.' } }
        ]
      },
      CHAOS: {
        EASY: [
          { level: 1, stimuliCount: 2, minInterval: 2.2, maxInterval: 2.8, description: { en: 'Mixed basic patterns.', fr: 'Patterns mixtes de base.' } },
          { level: 2, stimuliCount: 3, minInterval: 2.3, maxInterval: 2.9, description: { en: 'Chaos intro: base 3.', fr: 'Introduction au chaos : base 3.' } },
          { level: 3, stimuliCount: 3, minInterval: 1.9, maxInterval: 2.5, description: { en: 'Mixed consolidation.', fr: 'Consolidation mixte.' } }
        ],
        MEDIUM: [
          { level: 1, stimuliCount: 4, minInterval: 1.6, maxInterval: 2.0, description: { en: 'Mixed 4-punch rhythm.', fr: 'Rythme mixte 4 coups.' } },
          { level: 2, stimuliCount: 4, minInterval: 1.3, maxInterval: 1.7, description: { en: 'High flow mixed intensity.', fr: 'Intensité mixte zone de flow.' } },
          { level: 3, stimuliCount: 5, minInterval: 1.4, maxInterval: 1.8, description: { en: 'Mixed 5 stimuli load.', fr: 'Charge mixte 5 stimuli.' } }
        ],
        HARD: [
          { level: 1, stimuliCount: 6, minInterval: 1.0, maxInterval: 1.4, description: { en: 'Chaos expert panel.', fr: 'Panel chaos expert.' } },
          { level: 2, stimuliCount: 6, minInterval: 0.8, maxInterval: 1.2, description: { en: 'Chaos pro reaction.', fr: 'Réaction chaos pro.' } },
          { level: 3, stimuliCount: 6, minInterval: 0.6, maxInterval: 1.0, description: { en: 'Chaos champion mode.', fr: 'Mode chaos champion.' } }
        ]
      }
    }
  },
  SPRINT: {
    TIME_MODULES: [
      { id: 'T15', seconds: 15, label: '15s', desc: { en: 'Speed Endurance', fr: 'Endurance de Vitesse' } },
      { id: 'T30', seconds: 30, label: '30s', desc: { en: 'Lactic Capacity', fr: 'Capacité Lactique' } },
      { id: 'T45', seconds: 45, label: '45s', desc: { en: 'Maximum Grit', fr: 'Détermination Maximale' } }
    ],
    MODES: {
      VOICE: {
        T15: [
          { level: 1, stimuliCount: 3, minInterval: 2.5, maxInterval: 4.0, rounds: 5, rest: 45, sets: 1, description: { en: 'Reactive: Fluid technique focus.', fr: 'Réactif : Focus technique et fluidité.' } },
          { level: 2, stimuliCount: 3, minInterval: 1.8, maxInterval: 2.8, rounds: 6, rest: 45, sets: 1, description: { en: 'Vivid: High frequency patterns.', fr: 'Vif : Patterns haute fréquence.' } },
          { level: 3, stimuliCount: 3, minInterval: 1.0, maxInterval: 1.5, rounds: 8, rest: 30, sets: 1, description: { en: 'Explosive: Absolute neural overload.', fr: 'Explosif : Surcharge neurale absolue.' } }
        ],
        T30: [
          { level: 1, stimuliCount: 3, minInterval: 2.5, maxInterval: 4.0, rounds: 3, rest: 90, sets: 1, description: { en: 'Lactic buffer capacity.', fr: 'Capacité tampon lactique.' } },
          { level: 2, stimuliCount: 3, minInterval: 1.8, maxInterval: 2.8, rounds: 4, rest: 90, sets: 1, description: { en: 'Total performance focus.', fr: 'Focus performance totale.' } },
          { level: 3, stimuliCount: 3, minInterval: 1.0, maxInterval: 1.5, rounds: 5, rest: 60, sets: 1, description: { en: 'Peak intensity barrier.', fr: 'Barrière d\'intensité pic.' } }
        ],
        T45: [
          { level: 1, stimuliCount: 3, minInterval: 2.5, maxInterval: 4.0, rounds: 2, rest: 120, sets: 1, description: { en: 'Elite endurance threshold.', fr: 'Seuil d\'endurance élite.' } },
          { level: 2, stimuliCount: 3, minInterval: 1.8, maxInterval: 2.8, rounds: 3, rest: 120, sets: 1, description: { en: 'Anaerobic ceiling.', fr: 'Plafond anaérobie.' } },
          { level: 3, stimuliCount: 3, minInterval: 1.0, maxInterval: 1.5, rounds: 4, rest: 120, sets: 1, description: { en: 'The hurt locker: Zero failure allowed.', fr: 'Zone rouge : Échec interdit.' } }
        ]
      }
    }
  }
};
