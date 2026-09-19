import { Mic } from 'lucide-react';

export function MicrophonePreparingScreen() {
  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full border border-[var(--acc-primary)]/30 flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(245,158,11,0.22)]">
        <Mic className="w-7 h-7 text-[var(--acc-primary)]" />
      </div>
      <p className="text-white text-[11px] font-black uppercase tracking-[0.28em] mb-2">GoReactive</p>
      <p className="text-[var(--acc-primary)]/70 text-[10px] font-bold uppercase tracking-[0.22em]">
        Préparation du micro
      </p>
    </div>
  );
}
