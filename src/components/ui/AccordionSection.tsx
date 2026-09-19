import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const AccordionSection: React.FC<{
  id?: string;
  title: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  highlighted?: boolean;
  children: React.ReactNode;
}> = ({ id, title, badge, isOpen, onToggle, className, highlighted, children }) => (
  <div
    id={id}
    className={`premium-card rounded-3xl overflow-hidden transition-all duration-300 ${
      highlighted ? 'ring-2 ring-[var(--acc-primary)] shadow-[0_0_30px_rgba(216,173,69,0.25)]' : ''
    } ${className || ''}`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 p-5 text-left active:bg-white/[0.03] transition-colors"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
          {title}
        </h2>
        {badge}
      </div>
      <ChevronDown className={`w-4 h-4 text-[var(--acc-primary)] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
