import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Timer, Ear, Eye, HandFist, Users, HeartPulse, Activity, ChevronRight, X } from 'lucide-react';

interface IntroTutorialProps {
  appLanguage: 'en' | 'fr';
  onComplete: () => void;
}

// Reveals a headline word by word for a punchy, premium feel.
const AnimatedHeadline: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const words = text.split(' ');
  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.08 * i, duration: 0.35, ease: 'easeOut' }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

// Small live demo that ticks through random intervals inside a chosen range,
// to make the "no pattern, ever" pitch tangible instead of abstract.
const RandomIntervalDemo: React.FC<{ min: number; max: number }> = ({ min, max }) => {
  const [value, setValue] = useState(min);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.random() * (max - min) + min;
      setValue(next);
      setTick(t => t + 1);
    }, 850);
    return () => clearInterval(id);
  }, [min, max]);

  return (
    <div className="w-full bg-black/40 border border-[var(--acc-primary)]/20 rounded-3xl p-6 flex flex-col items-center gap-3">
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
        Intervalle choisi&nbsp;: [{min.toFixed(1)}s&nbsp;;&nbsp;{max.toFixed(1)}s]
      </span>
      <div className="relative h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={tick}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            className="text-5xl font-black italic text-[var(--acc-primary)] tabular-nums tracking-tighter"
          >
            {value.toFixed(1)}s
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center">
        À chaque stimulus, un nouveau temps d'attente. Jamais le même.
      </span>
    </div>
  );
};

export const IntroTutorial: React.FC<IntroTutorialProps> = ({ appLanguage, onComplete }) => {
  const [slide, setSlide] = useState(0);
  const en = appLanguage === 'en';
  const totalSlides = 4;

  const next = () => {
    if (slide < totalSlides - 1) setSlide(s => s + 1);
    else onComplete();
  };

  const slideVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center p-6 text-center z-[200] overflow-hidden">
      {/* Ambient glow, consistent with the rest of onboarding */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(251,191,36,0.14), transparent 55%)' }}
      />

      {/* Top bar: progress dots + skip */}
      <div className="w-full max-w-md flex items-center justify-between relative z-10 pt-4 shrink-0">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className="h-1.5 w-8 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: i <= slide ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
                className="h-full bg-[var(--acc-primary)]"
              />
            </div>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="flex items-center gap-1 text-[var(--acc-primary)]/70 hover:text-[var(--acc-primary)] transition-colors text-[9px] font-black uppercase tracking-[0.2em]"
        >
          {en ? 'Skip' : 'Passer'}
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 w-full max-w-md flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {slide === 0 && (
            <motion.div
              key="s0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="w-full space-y-8"
            >
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
                className="w-20 h-20 rounded-3xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/25 flex items-center justify-center mx-auto text-[var(--acc-primary)]"
              >
                <Shuffle className="w-10 h-10" />
              </motion.div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--acc-primary)]/70">
                  {en ? 'The problem' : 'Le problème'}
                </p>
                <AnimatedHeadline
                  className="text-3xl font-black text-white uppercase italic tracking-tighter leading-[0.95]"
                  text={en ? 'SAME ORDER. SAME RHYTHM. EVERY TIME.' : 'TOUJOURS LE MÊME ORDRE. TOUJOURS LE MÊME RYTHME.'}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.35 }}
                className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed px-2"
              >
                {en
                  ? "You want to train alone. But most apps give the same instructions in the same order, at the same interval — so your brain anticipates, and stops learning."
                  : "Tu veux t'entraîner seul. Mais la plupart des applis donnent leurs consignes dans le même ordre, au même intervalle — alors ton cerveau anticipe, et n'apprend plus rien."}
              </motion.p>
            </motion.div>
          )}

          {slide === 1 && (
            <motion.div
              key="s1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="w-full space-y-6"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/25 flex items-center justify-center mx-auto text-[var(--acc-primary)]"
              >
                <Timer className="w-10 h-10" />
              </motion.div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--acc-primary)]/70">
                  {en ? 'The solution' : 'La solution'}
                </p>
                <AnimatedHeadline
                  className="text-3xl font-black text-white uppercase italic tracking-tighter leading-[0.95]"
                  text={en ? 'CHAOS. BUT PROGRAMMED BY YOU.' : 'LE CHAOS, PROGRAMMÉ PAR TOI.'}
                />
              </div>
              <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed px-2">
                {en
                  ? "Set your own interval range between two stimuli. The app then draws a random time within it, every single time — impossible to memorize."
                  : "Choisis toi-même l'intervalle entre deux stimuli. L'appli tire ensuite un temps aléatoire à l'intérieur, à chaque fois — impossible à mémoriser."}
              </p>
              <RandomIntervalDemo min={1.0} max={2.0} />
            </motion.div>
          )}

          {slide === 2 && (
            <motion.div
              key="s2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="w-full space-y-6"
            >
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--acc-primary)]/70">
                  {en ? '3 types of stimuli' : '3 types de stimuli'}
                </p>
                <AnimatedHeadline
                  className="text-3xl font-black text-white uppercase italic tracking-tighter leading-[0.95]"
                  text={en ? 'TRAIN THE RIGHT CHANNEL.' : 'TRAVAILLE LE BON CANAL.'}
                />
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: <Ear className="w-6 h-6" />,
                    color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10 border-[var(--acc-primary)]/25',
                    label: en ? 'Audio' : 'Audio',
                    desc: en ? 'React to random vocal cues.' : 'Réagis à des consignes vocales aléatoires.',
                  },
                  {
                    icon: <Eye className="w-6 h-6" />,
                    color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10 border-[var(--acc-primary)]/25',
                    label: en ? 'Visual' : 'Visuel',
                    desc: en ? 'React to colors or signals on screen.' : 'Réagis à des couleurs ou signaux à l\u2019écran.',
                  },
                  {
                    icon: <Shuffle className="w-6 h-6" />,
                    color: 'text-[var(--acc-primary)] bg-[var(--acc-primary)]/10 border-[var(--acc-primary)]/25',
                    label: en ? 'Chaos' : 'Chaos',
                    desc: en ? 'Dual task: audio + visual at once.' : 'Double tâche : audio + visuel en simultané.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 * i, duration: 0.35 }}
                    className="flex items-center gap-4 bg-white/5 border border-[var(--acc-primary)]/10 rounded-2xl p-4 text-left"
                  >
                    <div className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase italic text-white tracking-tight">{item.label}</h3>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wide mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {slide === 3 && (
            <motion.div
              key="s3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="w-full space-y-6"
            >
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--acc-primary)]/70">
                  {en ? 'Who it\u2019s for' : 'Pour qui ?'}
                </p>
                <AnimatedHeadline
                  className="text-3xl font-black text-white uppercase italic tracking-tighter leading-[0.95]"
                  text={en ? 'EVERY SPORT. EVERY GOAL.' : 'TOUS LES SPORTS. TOUS LES OBJECTIFS.'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <HandFist className="w-5 h-5" />, label: en ? 'Combat sports' : 'Sports de combat' },
                  { icon: <Users className="w-5 h-5" />, label: en ? 'Team sports' : 'Sports collectifs' },
                  { icon: <HeartPulse className="w-5 h-5" />, label: en ? 'Adapted P.A.' : 'Activité adaptée' },
                  { icon: <Activity className="w-5 h-5" />, label: en ? 'General fitness' : 'Perf. générale' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i, duration: 0.35 }}
                    className="flex flex-col items-center gap-2 bg-white/5 border border-[var(--acc-primary)]/10 rounded-2xl p-4"
                  >
                    <div className="text-[var(--acc-primary)]">{item.icon}</div>
                    <span className="text-[9px] font-black uppercase tracking-wide text-[var(--text-secondary)] text-center leading-tight">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed px-2">
                {en
                  ? 'Faster reactions. Sharper information processing. More accurate responses — at your own pace.'
                  : 'Vitesse de réaction, traitement de l\u2019information, justesse de la réponse — à ton propre rythme.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-md relative z-10 pb-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={next}
          className="w-full py-6 bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black text-base uppercase italic rounded-[2rem] transition-all shadow-[0_0_40px_rgba(251,191,36,0.3)] flex items-center justify-center gap-3 group"
        >
          {slide < totalSlides - 1 ? (en ? 'NEXT' : 'SUIVANT') : (en ? "LET'S GO" : 'COMMENCER')}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};

export default IntroTutorial;
