import * as React from 'react';
import { motion } from 'motion/react';

export function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 transition-colors duration-200 h-12 rounded-full overflow-hidden ${
        active ? 'px-5 text-[var(--acc-on-primary)]' : 'w-12 text-[var(--text-secondary)] active:opacity-60'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="nav-active-pill"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="absolute inset-0 bg-[var(--acc-primary)] shadow-[0_4px_18px_rgba(251,191,36,0.35)]"
        />
      )}
      <div className="relative z-10 shrink-0">
        {icon}
      </div>
      {active && (
        <span className="relative z-10 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
      )}
    </button>
  );
}
