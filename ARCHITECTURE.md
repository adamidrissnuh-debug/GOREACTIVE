# Architecture GoReactive (après découpage de App.tsx)

L'ancien `App.tsx` (6 261 lignes, logique + affichage mélangés) a été découpé **mécaniquement** :
le code a été déplacé tel quel, sans réécriture. Comportement identique.

## Zones

| Zone | Dossiers / fichiers | Rôle | Design (AI Studio) |
|---|---|---|---|
| LOGIQUE | `src/app/*`, `src/hooks/*`, `src/services/*`, `src/lib/*`, `src/constants/*`, `src/types.ts` | états, modes, moteur, timers, stockage | Hors design |
| TUTORIELS | `src/tutorials/*` | tutoriels Boxe/Sprint/Intro/PRO, animations | Hors design |
| AIGUILLAGE | `src/App.tsx`, `src/main.tsx`, `src/ErrorBoundary.tsx` | quel écran s'affiche et quand (parcours) | Hors design |
| AFFICHAGE | `src/screens/**`, `src/components/**`, `src/index.css` | rendu visuel | Design (style uniquement) |
| NATIF/CONFIG | `android/`, `capacitor.config.ts`, `vite.config.ts`, `package.json`, `index.html` | build | Hors design |

## Flux
`App.tsx` appelle `useAppCtx()` (src/app) qui assemble 8 hooks de logique et renvoie un objet `ctx`.
Chaque écran reçoit `ctx` et en extrait uniquement ce qu'il affiche :
`const { appLanguage, setView } = ctx;`

## Hooks de logique (ordre d'appel d'origine conservé)
useCoreState → useGuidedFlowState → useHistoryAndModalsState → useSettingsState →
useGuidedActions → useTrainingEngine → useSessionControl → useSessionPersistence

Note : deux états (`view`, `nextActionTime`) ont été remontés dans `useCoreState` car des fonctions
déclarées plus haut les utilisaient. Sans effet sur le comportement.

## Corrections
Corrections apportées après le découpage (seules modifications de comportement) :
1. Suppression des `(` et `)` parasites affichés dans la vue entraînement.
2. Suppression du doublon de la modale « Combien d'erreurs ? » (il reste `PostSessionErrorModal`).
