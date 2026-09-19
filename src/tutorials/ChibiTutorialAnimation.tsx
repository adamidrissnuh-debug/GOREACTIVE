import { AppMode } from '../types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Animated "Ghost Boxer" for tutorials
 * Designed to look like the app's UI (black, white, gold)
 */
/**
 * Chibi Boxer Portrait - Professional 2D View
 * Immersive POV training with smartphone interaction
 */
export const ChibiTutorialAnimation = ({ mode, language }: { mode: AppMode; language: 'en' | 'fr' | null }) => {
  const [activeHand, setActiveHand] = useState<'left' | 'right' | null>(null);
  const [step, setStep] = useState(0);
  const [isPhoneTalking, setIsPhoneTalking] = useState(false);
  const [stimulus, setStimulus] = useState<{ text?: string; color?: string }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 2);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const runSequence = async () => {
      await new Promise(r => setTimeout(r, 800));
      
      const isLeft = step === 0;
      const label = isLeft ? (language === 'fr' ? 'GAUCHE' : 'LEFT') : (language === 'fr' ? 'DROITE' : 'RIGHT');
      
      // Step 1: Phone "Command"
      setIsPhoneTalking(true);
      if (mode === 'VOICE' || mode === 'CHAOS') setStimulus({ text: label });
      if (mode === 'COLOR' || mode === 'CHAOS') setStimulus(s => ({ ...s, color: isLeft ? '#3b82f6' : '#ef4444' }));
      
      await new Promise(r => setTimeout(r, 1000));
      setIsPhoneTalking(false);
      
      // Step 2: Boxer Reaction
      setActiveHand(isLeft ? 'left' : 'right');
      await new Promise(r => setTimeout(r, 800));
      
      // Step 3: Reset
      setActiveHand(null);
      setStimulus({});
    };
    runSequence();
  }, [step, mode, language]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8fafc] overflow-hidden">
      {/* Subtle Gym Floor Background */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-zinc-200/50 z-0" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,#f1f5f9_100%)]" />
      
      {/* Portrait Scene - Scale to Fill */}
      <div className="relative w-full h-full flex flex-col items-center justify-center z-10 p-2 sm:p-4">
        
        {/* THE CHIBI BOXER - Centered and scaled */}
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-3/5 flex flex-col items-center justify-center mb-4 min-h-[280px]"
        >
          {/* Shadow */}
          <div className="absolute bottom-4 w-32 h-6 bg-black/5 blur-xl rounded-full" />

          {/* CHIBI BOXER - Responsive SVG */}
          <svg viewBox="0 0 120 160" className="h-full w-auto drop-shadow-md overflow-visible">
            <defs>
              <linearGradient id="chibiSkin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="100%" stopColor="#fee2e2" />
              </linearGradient>
            </defs>

            {/* Body - Tank Top (Blue) */}
            <path d="M40,90 L80,90 L85,140 L35,140 Z" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
            <path d="M40,90 Q50,85 60,90 Q70,85 80,90" fill="none" stroke="#2563eb" strokeWidth="1" />

            {/* Arms & Boxing Gloves - GUARD POSITION */}
            <motion.g animate={activeHand === 'left' ? { x: -20, y: -30, rotate: -20, scale: 1.1 } : { x: 0, y: 0 }}>
               <path d="M40,110 L30,90" stroke="#fee2e2" strokeWidth="12" strokeLinecap="round" />
               <circle cx="28" cy="85" r="15" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
               <rect x="20" y="85" width="16" height="4" rx="2" fill="white" opacity="0.3" transform="rotate(-30, 28, 85)" />
            </motion.g>

            <motion.g animate={activeHand === 'right' ? { x: 20, y: -30, rotate: 20, scale: 1.1 } : { x: 0, y: 0 }}>
               <path d="M80,110 L90,90" stroke="#fee2e2" strokeWidth="12" strokeLinecap="round" />
               <circle cx="92" cy="85" r="15" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
               <rect x="84" y="85" width="16" height="4" rx="2" fill="white" opacity="0.3" transform="rotate(30, 92, 85)" />
            </motion.g>

            {/* Head - Classic Chibi */}
            <g transform="translate(60, 55)">
              <circle r="45" fill="url(#chibiSkin)" stroke="#fee2e2" strokeWidth="1" />
              <path d="M-45,0 Q-35,-55 0,-52 Q35,-55 45,0 L45,-15 Q35,-60 0,-58 Q-35,-60 -45,-15 Z" fill="#18181b" />
              
              <motion.g animate={activeHand ? { scaleY: 1.2 } : { scaleY: 1 }}>
                 <circle cx="-18" cy="10" r="4" fill="#18181b" />
                 <circle cx="18" cy="10" r="4" fill="#18181b" />
              </motion.g>
              <path d="M-5,30 Q0,35 5,30" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </motion.div>

        {/* THE SMARTPHONE - Integrated POV */}
        <div className="relative z-20 flex flex-col items-center">
            <div className="relative w-28 h-44 bg-zinc-900 rounded-[2.5rem] border-8 border-zinc-200 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
               {/* Phone Camera & Detail */}
               <div className="absolute top-2 w-10 h-1.5 bg-zinc-800 rounded-full" />
               
               {/* Active Audio Pulse */}
               <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center relative">
                  {isPhoneTalking && (
                    <div className="flex gap-2 items-center">
                       {[...Array(4)].map((_, i) => (
                         <motion.div 
                           key={i} 
                           animate={{ height: [8, 24, 8] }} 
                           transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.05 }}
                           className="w-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" 
                         />
                       ))}
                    </div>
                  )}
               </div>

               {/* Home button area */}
               <div className="absolute bottom-2 w-12 h-2 bg-zinc-800 rounded-full" />
            </div>

            {/* Command Bubble from phone */}
            <AnimatePresence>
               {stimulus.text && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.5, y: 20 }} 
                   animate={{ opacity: 1, scale: 1, y: -30 }} 
                   exit={{ opacity: 0, scale: 1.5, y: -60 }}
                   className="absolute -top-16 px-6 py-2 bg-white border border-zinc-100 shadow-2xl rounded-2xl flex items-center gap-3 whitespace-nowrap"
                 >
                   {stimulus.color && <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: stimulus.color }} />}
                   <span className="text-2xl font-black text-zinc-900 italic uppercase tracking-tighter">
                     {stimulus.text}
                   </span>
                 </motion.div>
               )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
