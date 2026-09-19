import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Zap, Tablet } from 'lucide-react';

interface SprintTutorialSceneProps {
  language: 'en' | 'fr' | null;
  step: number;
  auraColor?: string;
  showTrail?: boolean;
  isPulsing?: boolean;
  accentColor?: string;
}

const SprintTutorialScene: React.FC<SprintTutorialSceneProps> = ({ 
  language, 
  step,
  auraColor,
  showTrail,
  isPulsing,
  accentColor = "#d97706"
}) => {
  const [sequenceStep, setSequenceStep] = useState(0); // 0: Idle/Running, 1: Signal, 2: Turning
  const [currentExample, setCurrentExample] = useState(0); // 0: Left turn, 1: Right turn, 2: Back turn
  const [isStimulusActive, setIsStimulusActive] = useState(false);
  const [charFacing, setCharFacing] = useState(0); // Degrees
  const [runPhase, setRunPhase] = useState(0);
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  
  const charFacingRef = useRef(0);
  const currentExampleRef = useRef(0);
  const isMounted = useRef(true);
  const speed = 8; // Faster speed

  // Continuous background scrolling and animation
  useEffect(() => {
    isMounted.current = true;
    const interval = setInterval(() => {
      if (isPaused) return;

      setRunPhase(p => (p + 1) % 4);
      
      const rad = (charFacingRef.current * Math.PI) / 180;
      const dx = Math.sin(rad) * speed;
      const dy = -Math.cos(rad) * speed;
      
      setBgPos(p => ({ 
        x: (p.x - dx) % 100, 
        y: (p.y - dy) % 100 
      }));
    }, 40); // Faster interval for speed feel

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [isPaused]);

  // Main interaction loop
  useEffect(() => {
    let activeId = Math.random();
    const cycleIdRef = { id: activeId };
    let isTransitioning = false;

    const runCycle = async () => {
      while (isMounted.current && cycleIdRef.id === activeId && !isPaused) {
        // 1. Run straight for a while
        setSequenceStep(0);
        setIsStimulusActive(false);
        await new Promise(r => setTimeout(r, 1200));
        if (!isMounted.current || cycleIdRef.id !== activeId || isPaused) break;

        // 2. Show Stimulus
        setSequenceStep(1);
        setIsStimulusActive(true);
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted.current || cycleIdRef.id !== activeId || isPaused) break;

        // 3. Perform the Turn
        setSequenceStep(2);
        let turnAmount = 0;
        const currentIdx = currentExampleRef.current;
        
        if (currentIdx === 0) turnAmount = -90;
        else if (currentIdx === 1) turnAmount = 90;
        else turnAmount = 180;

        const newFacing = charFacingRef.current + turnAmount;
        charFacingRef.current = newFacing;
        setCharFacing(newFacing);
        setIsStimulusActive(false);

        // Run in new direction
        await new Promise(r => setTimeout(r, 2000));
        if (!isMounted.current || cycleIdRef.id !== activeId || isPaused) break;

        // Move to next example
        const nextIdx = (currentIdx + 1) % 3;
        currentExampleRef.current = nextIdx;
        setCurrentExample(nextIdx);
      }
    };

    runCycle();

    return () => {
      activeId = -1; // Invalidate current cycle
    };
  }, [isPaused, step]);

  // Reset function called on step change
  useEffect(() => {
    setCharFacing(0);
    charFacingRef.current = 0;
    currentExampleRef.current = 0;
    setCurrentExample(0);
    setIsPaused(false);
    setBgPos({ x: 0, y: 0 });
  }, [step]);

  const getStimulusText = () => {
    if (currentExample === 0) return language === 'fr' ? 'GAUCHE' : 'LEFT';
    if (currentExample === 1) return language === 'fr' ? 'DROITE' : 'RIGHT';
    return language === 'fr' ? 'DERRIÈRE' : 'BACK';
  };

  return (
    <div className="relative w-full h-full bg-[#1a3a14] overflow-hidden flex flex-col items-center justify-center font-sans tracking-tight">
      
      {/* RPG STYLE GRASS BACKGROUND */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#2d5a27',
          backgroundImage: `
            radial-gradient(#3d7536 15%, transparent 20%),
            radial-gradient(#3d7536 15%, transparent 20%)
          `,
          backgroundPosition: `${bgPos.x}px ${bgPos.y}px, ${bgPos.x + 50}px ${bgPos.y + 50}px`,
          backgroundSize: '100px 100px'
        }}
      >
        {/* Subtle Path / Grid lines for speed perception */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Floating Natural Props (Flowers/Tufts) */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4"
            style={{
              top: `${(i * 25 + 10) % 100}%`,
              left: `${(i * 37 + 20) % 100}%`,
              transform: `translate(${bgPos.x}px, ${bgPos.y}px)`
            }}
          >
             <div className="w-2 h-2 bg-[#4a8c41] rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* TRAINING FACILITY DECOR - Phone on Stand */}
      <div className="absolute top-10 right-10 z-20">
        <div className="relative">
          {/* Support / Stand */}
          <div className="w-16 h-4 bg-zinc-800 rounded-lg shadow-xl" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-20 bg-zinc-900 rounded-xl border-2 border-zinc-700 shadow-2xl p-1 overflow-hidden">
             {/* Phone Screen */}
             <div className={`w-full h-full rounded-lg transition-colors duration-300 flex flex-col items-center justify-center ${isStimulusActive ? 'bg-[var(--acc-primary)]' : 'bg-black'}`}>
               {isStimulusActive && (
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="flex flex-col items-center"
                 >
                    <Smartphone className="w-6 h-6 text-white mb-1" />
                    <span className="text-[8px] font-black italic text-white uppercase leading-none text-center">
                       {getStimulusText()}
                    </span>
                 </motion.div>
               )}
             </div>

             {/* Speaker Waves if active */}
             {isStimulusActive && (
               <div className="absolute -top-4 -left-4 -right-4 flex justify-around">
                 {[1, 2, 3].map(i => (
                   <motion.div
                     key={i}
                     animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                     transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                     className="w-2 h-2 bg-[var(--acc-primary)] rounded-full blur-[2px]"
                   />
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* BIG STIMULUS OVERLAY FOR CLARITY */}
      <AnimatePresence>
        {isStimulusActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute top-24 z-30 pointer-events-none"
          >
             <div className="bg-black/80 backdrop-blur-md px-10 py-4 rounded-3xl border-2 border-[var(--acc-primary)]/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <div className="flex items-center gap-4">
                  <Zap className="w-8 h-8 text-[var(--acc-primary)] fill-[var(--acc-primary)]" />
                  <span className="text-4xl font-black italic text-[var(--acc-primary)] uppercase tracking-tighter">
                    {getStimulusText()}
                  </span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIRECTIONAL INDICATOR ARROW */}
      <AnimatePresence>
        {isStimulusActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-20 pointer-events-none"
            style={{ 
              rotate: charFacing + (currentExample === 0 ? -90 : (currentExample === 1 ? 90 : 180)),
              y: -100
            }}
          >
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 0.5, repeat: Infinity }}
               className="w-16 h-16 flex items-center justify-center p-2 rounded-full bg-white/10 backdrop-blur-sm border-2 border-[var(--acc-primary)]/40"
             >
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-white" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2D TOP-DOWN CHARACTER */}
      <motion.div
        animate={{ 
          rotate: charFacing,
          scale: (sequenceStep === 2 || isPulsing) ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          rotate: { type: "spring", stiffness: 200, damping: 20 },
          scale: { duration: 0.3, repeat: isPulsing ? Infinity : 0 }
        }}
        className="relative z-10"
      >
        {/* Aura Effect */}
        {auraColor && (
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ backgroundColor: auraColor }}
            className="absolute inset-0 -m-8 rounded-full blur-[30px] z-0"
          />
        )}

        <TopDownAthlete 
          runPhase={runPhase} 
          showTrail={showTrail} 
          accentColor={accentColor} 
          auraColor={auraColor}
        />
        
        {/* Dash Pulse during turn */}
        {sequenceStep === 2 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            className="absolute inset-0 rounded-full bg-[var(--acc-primary)]/20 blur-xl"
          />
        )}
      </motion.div>

      {/* FOOTPRINT EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-5">
         {[...Array(4)].map((_, i) => (
           <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.2, 0],
                y: [20, 60],
                x: i % 2 === 0 ? -15 : 15
              }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              className="absolute left-1/2 bottom-1/2 w-4 h-6 bg-black/20 rounded-full blur-[2px]"
           />
         ))}
      </div>

    </div>
  );
};

const TopDownAthlete = ({ 
  runPhase, 
  showTrail, 
  accentColor,
  auraColor 
}: { 
  runPhase: number;
  showTrail?: boolean;
  accentColor: string;
  auraColor?: string;
}) => {
  // Ultra-minimalist athlete: Just head and hands
  // Eliminates 'carapace' look entirely
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Soft Shadow */}
      <motion.div 
        animate={{ scale: runPhase % 2 === 1 ? 1 : 1.1 }}
        className="absolute bottom-2 w-10 h-3 bg-black/20 rounded-full blur-sm" 
      />
      
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Trail lines (Permanent if SPEED_TRAIL is unlocked) */}
        {showTrail && (
           <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
              {[...Array(3)].map((_, i) => (
                <motion.path 
                  key={i}
                  d={`M${40 + i * 10},70 L${40 + i * 10},100`} 
                  stroke={accentColor} 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  animate={{ y: [0, 20], opacity: [0.6, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
           </motion.g>
        )}

        {/* Hands (fists) in run cycle */}
        <motion.g>
           {/* Left Hand */}
           <motion.circle 
             cx="30" cy="50" r="7" fill="#1a1a1a"
             stroke={showTrail ? accentColor : "none"}
             strokeWidth="1"
             animate={{ 
               cy: runPhase === 1 ? 30 : (runPhase === 3 ? 70 : 50),
               cx: runPhase === 1 ? 20 : (runPhase === 3 ? 35 : 28)
             }}
             transition={{ duration: 0.1 }}
           />
           {/* Right Hand */}
           <motion.circle 
             cx="70" cy="50" r="7" fill="#222"
             stroke={showTrail ? accentColor : "none"}
             strokeWidth="1"
             animate={{ 
               cy: runPhase === 3 ? 30 : (runPhase === 1 ? 70 : 50),
               cx: runPhase === 3 ? 80 : (runPhase === 1 ? 65 : 72)
             }}
             transition={{ duration: 0.1 }}
           />
        </motion.g>

        {/* Head - Focused top view */}
        <circle cx="50" cy="45" r="16" fill="#050505" />
        
        {/* Minimal detail (Headband/Cap) */}
        <path d="M40,38 Q50,32 60,38" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        
        {/* Subtle speed trail lines (standard) */}
        {!showTrail && (
          <motion.g animate={{ opacity: [0, 0.3, 0], y: [0, 20] }} transition={{ duration: 0.2, repeat: Infinity }}>
            <path d="M42,65 L42,85" stroke="white" strokeWidth="1" opacity="0.3" />
            <path d="M58,65 L58,85" stroke="white" strokeWidth="1" opacity="0.3" />
          </motion.g>
        )}

        {/* Aura Particles (if enabled) */}
        {auraColor && (
           <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <circle cx="30" cy="20" r="1" fill="white" opacity="0.5" />
              <circle cx="70" cy="25" r="1.5" fill="white" opacity="0.3" />
              <circle cx="50" cy="10" r="0.8" fill="white" opacity="0.6" />
           </motion.g>
        )}
      </svg>
    </div>
  );
};

export default SprintTutorialScene;
