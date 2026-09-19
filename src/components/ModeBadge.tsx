import React from 'react';
import { AppMode } from '../types';

interface ModeBadgeProps {
  mode: AppMode;
  appLanguage: string;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode, appLanguage }) => {
    const getModeInfo = () => {
        switch(mode) {
            case 'VOICE': return { label: appLanguage === 'en' ? 'Voice' : 'Vocale', color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10', border: 'border-[var(--acc-primary)]/20' };
            case 'COLOR': return { label: appLanguage === 'en' ? 'Color' : 'Couleur', color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10', border: 'border-[var(--acc-primary)]/20' };
            case 'CHAOS': return { label: 'Chaos', color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10', border: 'border-[var(--acc-primary)]/20' };
            default: return { label: mode, color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10', border: 'border-[var(--acc-primary)]/20' };
        }
    };
    const info = getModeInfo();
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${info.color} ${info.border}`}>
            {info.label}
        </span>
    );
};
