import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

export const LaunchSplash = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 3600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[999] overflow-hidden bg-black flex items-center justify-center"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 38%, rgba(216,173,69,0.18) 0%, rgba(216,173,69,0.055) 28%, rgba(0,0,0,0.96) 64%, #000 100%)'
        }}
      />

      <motion.div
        className="relative flex flex-col items-center justify-center px-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="relative w-28 h-28 rounded-[2rem] premium-card flex items-center justify-center shadow-[0_0_38px_rgba(216,173,69,0.20)]">
          <div className="absolute inset-4 rounded-[1.35rem] border border-[var(--acc-primary)]/10" />
          <Zap className="w-14 h-14 text-[var(--acc-primary)] fill-[var(--acc-primary)]/10" style={{ filter: 'drop-shadow(0 0 14px rgba(216,173,69,0.65))' }} />
        </div>

        <div className="mt-8 text-white text-[2.85rem] font-black tracking-[-0.11em] italic uppercase leading-none">
          GO<span className="text-[var(--acc-primary)]" style={{ textShadow: '0 0 14px rgba(216,173,69,0.55)' }}>REACTIVE</span>
        </div>

        <div className="mt-5 gold-divider w-48" />
        <div className="mt-6 text-[9px] font-black uppercase tracking-[0.36em] text-[var(--acc-primary)]/45">
          Chargement
        </div>
      </motion.div>
    </div>
  );
};
