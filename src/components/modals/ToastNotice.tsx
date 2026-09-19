import { Check } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function ToastNotice({ ctx }: { ctx: AppCtx }) {
  const {
    toastMessage,
  } = ctx;

  return (
    <div
      className="fixed bottom-28 left-1/2 z-[4000] pointer-events-none"
      style={{ animation: 'toast-in-out 2.2s ease-out forwards' }}
    >
      <div className="bg-[var(--bg-secondary)] border border-[var(--acc-primary)]/30 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-2.5 whitespace-nowrap">
        <Check className="w-4 h-4 text-[var(--acc-primary)] shrink-0" />
        <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wide">{toastMessage}</span>
      </div>
    </div>
  );
}
