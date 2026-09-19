import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';

interface BoxingTutorialSceneProps {
  mode: 'VOICE' | 'COLOR' | 'CHAOS';
  language: 'en' | 'fr' | null;
  step: number; 
  auraColor?: string;
  showTrail?: boolean;
  isPulsing?: boolean;
  accentColor?: string;
}

// Visuals restored to the original design (character, phone dock, sound
// waves, banner). Only the timing engine was changed: the original used
// two effects that both read and set `isPaused`/`currentExample` (one keyed
// on [currentExample, mode, isPaused, step], the other on [step] alone,
// resetting the same two values) — on every step change this raced through
// a stale-then-fresh double run. This version uses one effect with a single
// cancellation flag, so each step transition runs its animation exactly
// once, deterministically.
const BoxingTutorialScene: React.FC<BoxingTutorialSceneProps> = ({ 
  mode, 
  language, 
  step,
  auraColor,
  showTrail,
  isPulsing,
  accentColor = "var(--acc-primary)"
}) => {
  const [sequenceStep, setSequenceStep] = useState(0); 
  const [currentExample, setCurrentExample] = useState(0); 
  const [isStimulusActive, setIsStimulusActive] = useState(false);
  const [activePunch, setActivePunch] = useState<'left' | 'right' | null>(null);
  const [reactionColor, setReactionColor] = useState<'green' | 'red' | null>(null);

  // Audio specific stimuli
  const [isAudioPulsing, setIsAudioPulsing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutIds: number[] = [];

    const wait = (ms: number) => new Promise<void>(resolve => {
      timeoutIds.push(window.setTimeout(resolve, ms));
    });

    const runExample = async (example: 0 | 1) => {
      if (cancelled) return;
      setCurrentExample(example);
      setSequenceStep(0);
      setIsStimulusActive(false);
      setActivePunch(null);
      setReactionColor(null);
      setIsAudioPulsing(false);
      await wait(1200);
      if (cancelled) return;

      let stimulusSide: 'left' | 'right' = example === 0 ? 'left' : 'right';
      let intent: 'left' | 'right' = stimulusSide;
      let colorType: 'green' | 'red' | null = null;

      if (mode === 'CHAOS') {
        stimulusSide = 'left';
        if (example === 0) {
          colorType = 'green';
          intent = 'left';
        } else {
          colorType = 'red';
          intent = 'right';
        }
      }

      setSequenceStep(1);
      setIsStimulusActive(true);
      setReactionColor(colorType);
      if (mode === 'VOICE' || mode === 'CHAOS') {
        setIsAudioPulsing(true);
      }
      await wait(800);
      if (cancelled) return;

      setSequenceStep(2);
      setActivePunch(intent);
      await wait(600);
      if (cancelled) return;

      setActivePunch(null);
      setSequenceStep(3);
      setIsStimulusActive(false);
      setIsAudioPulsing(false);
      await wait(1200);
    };

    const runLoop = async () => {
      await runExample(0);
      if (cancelled) return;
      await runExample(1);
    };

    runLoop();

    return () => {
      cancelled = true;
      timeoutIds.forEach(id => window.clearTimeout(id));
    };
  }, [mode, step]);

  return (
    <div className="relative w-full h-full bg-[#030303] overflow-hidden flex flex-col items-center justify-center">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--acc-primary)]/5 via-transparent to-black" />
        <div className="absolute bottom-0 w-full h-1/4 bg-zinc-950/80">
           <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>
      </div>

      {/* BOXER SCENE ZONE */}
      <div className="relative w-full h-full flex flex-col items-center justify-center z-10 px-4">
        
        {/* CHARACTER: MORE COMPACT FOR CLEARANCE */}
        <div className="relative scale-[0.6] md:scale-[0.7] flex items-center justify-center w-full max-w-sm -mb-4">
           {/* Aura Effect background */}
           {auraColor && (
              <motion.div 
                animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ backgroundColor: auraColor }}
                className="absolute w-[200%] aspect-square rounded-full blur-[80px]"
              />
           )}

           <motion.div 
             animate={{ scaleX: activePunch ? 1.4 : 1, opacity: activePunch ? 0.3 : 0.6 }}
             className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/80 blur-2xl rounded-full" 
           />

           <motion.div
             animate={{ 
               y: [0, -3, 0],
               scale: isPulsing ? [1, 1.05, 1] : 1
             }}
             transition={{ 
               y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
               scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
             }}
             className="w-full flex justify-center"
           >
             <svg viewBox="0 0 160 200" className="w-[85%] h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-visible">
                <defs>
                   <linearGradient id="bodySilk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1a1e" />
                      <stop offset="100%" stopColor="#050505" />
                   </linearGradient>
                </defs>

                {/* Physique Mapping - Boxer Facing Right */}
                <path d="M100,145 L115,195" stroke="#050505" strokeWidth="10" strokeLinecap="round" />
                <path d="M75,145 L62,195" stroke="#1a1a1e" strokeWidth="14" strokeLinecap="round" />

                <motion.path 
                  animate={activePunch ? { skewX: activePunch === 'left' ? 4 : -4 } : { skewX: 0 }}
                  d="M65,85 Q85,80 105,90 L115,145 L55,145 Z" 
                  fill="url(#bodySilk)" 
                />

                {/* BACK ARM (Perceived as LEFT by user) */}
                <motion.g 
                  animate={activePunch === 'left' ? { 
                    x: 60, y: -20, rotate: 5, scale: 1.1 
                  } : { x: 0, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                   {/* Speed Trails for Back Arm */}
                   {showTrail && activePunch === 'left' && (
                      <motion.g>
                        {[1, 2, 3].map(i => (
                          <motion.path 
                            key={i}
                            d="M80,105 L100,105" 
                            stroke={accentColor} 
                            strokeWidth={3-i} 
                            opacity={0.4}
                            initial={{ x: 0, opacity: 0 }}
                            animate={{ x: -40, opacity: [0, 0.5, 0] }}
                            transition={{ delay: i * 0.1, repeat: Infinity, duration: 0.3 }}
                          />
                        ))}
                      </motion.g>
                   )}
                   <path d="M100,105 L105,95" stroke="#050505" strokeWidth="14" strokeLinecap="round" />
                   <circle cx="106" cy="90" r="16" fill="#050505" stroke={accentColor} strokeWidth="1.5" />
                   {activePunch === 'left' && (
                      <motion.circle initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.3 }} cx="120" cy="90" r="12" fill={auraColor || "white"} className="blur-md" />
                   )}
                </motion.g>

                {/* FRONT ARM (Perceived as RIGHT by user) */}
                <motion.g 
                  animate={activePunch === 'right' ? { 
                    x: 40, y: -15, rotate: 10, scale: 1.05 
                  } : { x: 0, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                   {/* Speed Trails for Front Arm */}
                   {showTrail && activePunch === 'right' && (
                      <motion.g>
                        {[1, 2, 3].map(i => (
                          <motion.path 
                            key={i}
                            d="M70,110 L90,110" 
                            stroke={accentColor} 
                            strokeWidth={4-i} 
                            opacity={0.5}
                            initial={{ x: 0, opacity: 0 }}
                            animate={{ x: -50, opacity: [0, 0.6, 0] }}
                            transition={{ delay: i * 0.1, repeat: Infinity, duration: 0.3 }}
                          />
                        ))}
                      </motion.g>
                   )}
                   <path d="M85,110 L115,105" stroke="#1a1a1e" strokeWidth="16" strokeLinecap="round" />
                   <circle cx="118" cy="100" r="22" fill="#1a1a1e" stroke={accentColor} strokeWidth="2.5" />
                   {activePunch === 'right' && (
                      <motion.circle initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.3 }} cx="138" cy="100" r="15" fill={auraColor || "white"} className="blur-xl" />
                   )}
                </motion.g>

                {/* Head */}
                <g transform="translate(90, 52)">
                   <circle r="36" fill="#050505" />
                   <path d="M-36,-8 Q0,-12 36,-8 L36,2 Q0,-3 -36,2 Z" fill={accentColor} />
                </g>

                {/* Aura Sparks */}
                {auraColor && (
                  <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <circle cx="100" cy="40" r="2" fill="white" opacity="0.4" />
                    <circle cx="140" cy="100" r="1.5" fill="white" opacity="0.2" />
                    <circle cx="40" cy="80" r="1" fill="white" opacity="0.3" />
                  </motion.g>
                )}
             </svg>
           </motion.div>
        </div>

        {/* DOCK / PHONE - RAISED SLIGHTLY */}
        <div className="relative w-full max-w-[160px] flex items-center justify-center mt-2">
           
           {/* Sound waves for Audio Mode */}
           {isAudioPulsing && (
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1">
               {[1, 2, 3].map((i) => (
                 <motion.div
                   key={i}
                   animate={{ height: [4, 12, 4], opacity: [0.3, 0.8, 0.3] }}
                   transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                   className="w-1 bg-[var(--acc-primary)] rounded-full"
                 />
               ))}
             </div>
           )}

           <div className="w-full h-7 bg-zinc-900/40 backdrop-blur-3xl rounded-t-[1.5rem] border-x border-t border-[var(--acc-primary)]/5 relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-28 bg-zinc-950 rounded-[1.5rem] border-2 border-[var(--acc-primary)]/5 shadow-2xl transform -rotate-[12deg] overflow-hidden">
                 {/* PHONE SCREEN CONTENT */}
                 <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 rounded-[1.5rem] ${isStimulusActive ? (reactionColor === 'red' ? 'bg-red-500/40 shadow-[inset_0_0_20px_rgba(239,68,68,0.6)]' : reactionColor === 'green' ? 'bg-green-500/40 shadow-[inset_0_0_20px_rgba(34,197,94,0.6)]' : 'bg-[var(--acc-primary)]/20') : 'bg-transparent'}`}>
                    
                    {/* Visual Signal on Phone */}
                    {isStimulusActive && (
                      <motion.div 
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                         <span className={`font-black italic tracking-tighter leading-none text-center px-1 w-full ${reactionColor ? 'text-white' : 'text-[var(--acc-primary)]'} ${(mode === 'CHAOS' || mode === 'COLOR') ? 'text-[10px]' : 'text-2xl'}`}>
                            {(mode === 'CHAOS' || mode === 'COLOR') 
                               ? (mode === 'CHAOS' 
                                   ? (language === 'fr' ? 'GAUCHE' : 'LEFT') 
                                   : (currentExample === 0 ? (language === 'fr' ? 'GAUCHE' : 'LEFT') : (language === 'fr' ? 'DROITE' : 'RIGHT'))) 
                               : (currentExample === 0 ? 'L' : 'R')}
                         </span>
                         {mode === 'VOICE' && (
                           <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="mt-1">
                             <Activity className="w-5 h-5 text-[var(--acc-primary)]" />
                           </motion.div>
                         )}
                         {mode === 'COLOR' && (
                           <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="mt-2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_white]" />
                         )}
                         {mode === 'CHAOS' && (
                           <div className="mt-1 flex gap-0.5">
                             {[1, 2, 3].map(i => (
                               <motion.div key={i} animate={{ height: [2, 6, 2], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-0.5 bg-white/50 rounded-full" />
                             ))}
                           </div>
                         )}
                      </motion.div>
                    )}
                 </div>
              </div>
           </div>

           {/* Central Banner Highlighting (for clarity) */}
           <AnimatePresence>
             {isStimulusActive && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.9 }}
                 animate={{ opacity: 1, y: -90, scale: 1 }}
                 exit={{ opacity: 0, y: -110, scale: 1.1 }}
                 className="absolute z-50 pointer-events-none text-center bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-[var(--acc-primary)]/10"
               >
                 <div className="flex flex-col items-center">
                    <span 
                      className={`text-4xl font-black italic tracking-tighter uppercase ${reactionColor === 'red' ? 'text-red-500' : reactionColor === 'green' ? 'text-green-500' : 'text-[var(--acc-primary)]'}`}
                      style={{ textShadow: '0 0 20px rgba(245,158,11,0.2)' }}
                    >
                      {mode === 'CHAOS' ? (
                        currentExample === 0 ? (language === 'fr' ? 'GAUCHE' : 'LEFT') : (language === 'fr' ? 'GAUCHE' : 'LEFT')
                      ) : (
                        currentExample === 0 ? (language === 'fr' ? 'GAUCHE' : 'LEFT') : (language === 'fr' ? 'DROITE' : 'RIGHT')
                      )}
                    </span>
                    {mode === 'CHAOS' && (
                       <span className={`text-xs font-black tracking-[0.2em] transform -translate-y-1 ${reactionColor === 'red' ? 'text-red-400' : 'text-green-400'}`}>
                          {reactionColor === 'red' ? (language === 'fr' ? 'OPPOSÉ' : 'OPPOSITE') : (language === 'fr' ? 'DIRECT' : 'DIRECT')}
                       </span>
                    )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black opacity-60" />
    </div>
  );
};

export default BoxingTutorialScene;
