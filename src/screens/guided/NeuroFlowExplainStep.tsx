import {
  Ear,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Headphones,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SPEED_TIERS } from '../../constants/guidedPresets';
import { earphonesRequiredWarning } from '../../lib/utils';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function NeuroFlowExplainStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, guidedAppMode, setSkipCalibration,
    setGuidedMovementErrorTrackingEnabled, getGuidedProgress,
  } = ctx;

  const modeTheme = {
    VOICE: {
      hue: 190, // cyan électrique
      icon: <Ear className="w-10 h-10" />,
      name: appLanguage === 'en' ? 'AUDIO FLOW' : 'FLOW AUDIO',
      tagline: appLanguage === 'en' ? 'React to the voice before you even think.' : 'Réagis à la voix avant même d\'y penser.',
    },
    COLOR: {
      hue: 285, // violet/fuchsia
      icon: <Eye className="w-10 h-10" />,
      name: appLanguage === 'en' ? 'VISUAL FLOW' : 'FLOW VISUEL',
      tagline: appLanguage === 'en' ? 'Your eyes decide. Your body follows.' : 'Tes yeux décident. Ton corps suit.',
    },
    CHAOS: {
      hue: 18, // orange/rouge feu
      icon: (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <Eye className="w-7 h-7 absolute -top-1 -left-1" />
          <Ear className="w-7 h-7 absolute -bottom-1 -right-1 opacity-80" />
        </div>
      ),
      name: appLanguage === 'en' ? 'CHAOS FLOW' : 'FLOW CHAOS',
      tagline: appLanguage === 'en' ? 'Both senses at once. No mercy.' : 'Les deux sens à la fois. Sans pitié.',
    },
  }[guidedAppMode || 'VOICE'];

  return (
  <motion.div 
    key="neuro-flow-explain"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-10"
  >
    <GuidedHeader
      onBack={() => setGuidedStep('BOXING_LEVEL_EXPLAIN')}
      step={getGuidedProgress()?.step}
      total={getGuidedProgress()?.total}
      appLanguage={appLanguage}
    />
    <div className="space-y-5 relative">
      {/* Ambient glow, tinted to the chosen mode */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, hsla(${modeTheme.hue}, 85%, 55%, 0.18), transparent 70%)` }}
      />
      <div className="flex justify-center relative">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-24 h-24 rounded-[2rem] flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, hsla(${modeTheme.hue}, 85%, 55%, 0.18), hsla(${modeTheme.hue}, 85%, 55%, 0.04))`,
            border: `1px solid hsla(${modeTheme.hue}, 85%, 60%, 0.35)`,
            color: `hsl(${modeTheme.hue}, 85%, 65%)`,
            boxShadow: `0 0 50px -8px hsla(${modeTheme.hue}, 85%, 55%, 0.45)`,
          }}
        >
          {modeTheme.icon}
        </motion.div>
      </div>
      <div className="text-center space-y-1 relative">
        <span
          className="text-[9px] font-black uppercase tracking-[0.35em]"
          style={{ color: `hsl(${modeTheme.hue}, 85%, 65%)` }}
        >
          NEURO-FLOW
        </span>
        <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter leading-none">
          {modeTheme.name}
        </h1>
        <p className="text-[11px] text-[var(--text-secondary)] font-bold italic px-8 pt-1">
          {modeTheme.tagline}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 py-2 px-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-1 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 relative overflow-hidden"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-4xl font-black italic text-emerald-400 leading-none">10</span>
          <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest text-center leading-tight mt-1">
            {appLanguage === 'en' ? <>Successes<br/>Level Up</> : <>Réussites<br/>Niveau +1</>}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex flex-col items-center gap-1 p-5 rounded-3xl bg-red-500/10 border border-red-500/25 relative overflow-hidden"
        >
          <ShieldAlert className="w-5 h-5 text-red-400 mb-1" />
          <span className="text-4xl font-black italic text-red-400 leading-none">3</span>
          <span className="text-[8px] font-black text-red-400/70 uppercase tracking-widest text-center leading-tight mt-1">
            {appLanguage === 'en' ? <>Mistakes<br/>Level Down</> : <>Erreurs<br/>Niveau -1</>}
          </span>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-1.5 px-6">
        {SPEED_TIERS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: `hsla(${modeTheme.hue}, 85%, 60%, ${0.15 + i * 0.13})` }}
          />
        ))}
      </div>
      <p className="text-center text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
        18 {appLanguage === 'en' ? 'levels · 6 speeds × 3 stimuli counts' : 'niveaux · 6 vitesses × 3 paliers de stimulis'}
      </p>

      {/* Earphone requirement — Neuro-Flow relies entirely on
          live voice detection, so this is non-negotiable. */}
      <div className="flex items-start gap-3 px-4 py-3 mx-1 rounded-2xl bg-[var(--acc-primary)]/5 border border-[var(--acc-primary)]/15">
        <Headphones className="w-4 h-4 text-[var(--acc-primary)] shrink-0 mt-0.5" />
        <p className="text-[9px] text-[var(--acc-primary)]/90 font-bold uppercase tracking-widest leading-relaxed">
          {earphonesRequiredWarning(appLanguage)}
        </p>
      </div>
    </div>

    <div className="flex flex-col items-center gap-4 pt-2 px-4 w-full max-w-sm mx-auto">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          // Neuro-Flow always starts with error tracking enabled
          setGuidedMovementErrorTrackingEnabled(true);
          setSkipCalibration(false);
          setGuidedStep('STIMULI_CHOICE');
        }} 
        className="w-full text-black font-black uppercase italic tracking-tighter p-5 rounded-2xl transition-all text-lg flex items-center justify-center gap-2 group"
        style={{
          background: `linear-gradient(135deg, hsl(${modeTheme.hue}, 85%, 60%), hsl(${modeTheme.hue}, 85%, 48%))`,
          boxShadow: `0 12px 40px -8px hsla(${modeTheme.hue}, 85%, 50%, 0.55)`,
        }}
      >
        {appLanguage === 'en' ? 'ENTER THE FLOW' : 'ENTRER DANS LE FLOW'}
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  </motion.div>
  );
}
