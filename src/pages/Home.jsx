import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Radar, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import heroImage from '../assets/hero.png';

const features = [
  {
    icon: Radar,
    title: 'Real vaqt tahlili',
    copy: "Murojaatlar, risk signallari va hududiy ko'rsatkichlar avtomatik tahlil qilinadi.",
    glow: 'from-cyan-400/30 to-blue-500/10',
    iconColor: 'text-cyan-300',
  },
  {
    icon: Eye,
    title: 'Jamoatchilik nazorati',
    copy: "Fuqarolar yuborgan ma'lumotlar xaritada ko'rinadi va nazorat jarayoniga ulanadi.",
    glow: 'from-violet-400/30 to-fuchsia-500/10',
    iconColor: 'text-violet-300',
  },
  {
    icon: ShieldCheck,
    title: 'Xavfsiz murojaat',
    copy: "Dalillar, joylashuv va tavsiflar himoyalangan tarzda qabul qilinadi.",
    glow: 'from-emerald-400/30 to-teal-500/10',
    iconColor: 'text-emerald-300',
  },
];

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  delay: (index % 8) * 0.35,
  duration: 5 + (index % 5),
}));

function PremiumButton({ to, variant = 'primary', children }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const baseClass = 'premium-cta group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-2xl px-7 py-4 text-sm font-bold transition-transform duration-300';
  const variants = {
    primary: 'premium-cta-primary text-white shadow-[0_18px_50px_rgba(99,102,241,0.28)]',
    secondary: 'premium-cta-secondary border border-white/15 bg-white/[0.03] text-white backdrop-blur-xl',
  };

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Link
        to={to}
        onPointerMove={handlePointerMove}
        style={{ '--x': `${pointer.x}px`, '--y': `${pointer.y}px` }}
        className={`${baseClass} ${variants[variant]}`}
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span
            className="absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-2xl"
            style={{ left: 'var(--x)', top: 'var(--y)' }}
          />
        </span>
        <span className="premium-ripple" />
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Link>
    </motion.div>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: 'easeOut' }}
      whileHover={{ y: -10, scale: 1.015 }}
      className="premium-card group relative overflow-hidden rounded-3xl p-[1px]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.glow} opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative h-full rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl backdrop-blur-2xl transition-colors duration-300 group-hover:border-white/25">
        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${feature.iconColor} shadow-[0_0_34px_rgba(99,102,241,0.25)]`}>
          <Icon size={24} />
        </div>
        <h3 className="mb-3 text-xl font-black tracking-tight text-white">{feature.title}</h3>
        <p className="text-sm leading-6 text-slate-400">{feature.copy}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 70, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 70, damping: 24 });
  const glowX = useTransform(springX, (value) => `${value}px`);
  const glowY = useTransform(springY, (value) => `${value}px`);

  const handlePointerMove = (event) => {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="premium-home relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1E293B_0%,#0F172A_48%,#020617_100%)] px-5 pt-28 text-white md:px-8"
    >
      <motion.div
        className="pointer-events-none fixed z-0 hidden h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl md:block"
        style={{ left: glowX, top: glowY }}
      />

      <div className="premium-gradient-flow absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-[110px]" />
      <div className="absolute right-[-8rem] top-28 h-96 w-96 rounded-full bg-purple-500/20 blur-[130px]" />
      <div className="absolute bottom-24 left-[-7rem] h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="pointer-events-none absolute z-0 h-1 w-1 rounded-full bg-white/40 shadow-[0_0_16px_rgba(168,85,247,0.75)]"
          style={{ left: particle.left, top: particle.top }}
          animate={{ opacity: [0.1, 0.8, 0.1], y: [-8, -34, -8] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl flex-col items-center justify-center pb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-indigo-100 shadow-[0_0_40px_rgba(99,102,241,0.16)] backdrop-blur-xl"
        >
          <Sparkles size={16} className="text-violet-300" />
          AI orqali shaffof nazorat platformasi
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: 'easeOut' }}
          className="relative max-w-6xl text-6xl font-black leading-[0.92] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <span className="absolute inset-x-10 top-1/2 -z-10 h-24 rounded-full bg-indigo-500/25 blur-[70px]" />
          NAZORAT{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_36px_rgba(168,85,247,0.35)]">
            AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.18, ease: 'easeOut' }}
          className="mt-7 max-w-2xl text-lg font-medium leading-8 text-slate-300 md:text-2xl md:leading-9"
        >
          Korrupsiyani sun'iy intellekt orqali aniqlang va nazorat qiling.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.28, ease: 'easeOut' }}
          className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
        >
          <PremiumButton to="/map">
            Xaritani ochish <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </PremiumButton>
          <PremiumButton to="/report" variant="secondary">
            Murojaat yuborish
          </PremiumButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: 'easeOut' }}
          className="relative mt-14 w-full max-w-5xl"
        >
          <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 shadow-[0_30px_110px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
            <img
              src={heroImage}
              alt="Nazorat AI analytics dashboard"
              className="h-52 w-full rounded-[1.45rem] object-cover opacity-80 saturate-125 sm:h-64 md:h-72"
            />
            <div className="absolute inset-3 rounded-[1.45rem] bg-gradient-to-tr from-slate-950/75 via-transparent to-indigo-500/20" />
            <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-xl">
                  <Zap size={13} /> Live risk intelligence
                </div>
                <p className="max-w-md text-2xl font-black tracking-tight text-white md:text-3xl">
                  Murojaatlar xaritada, risklar real vaqtda.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-slate-950/55 p-2 backdrop-blur-xl">
                {['92', '24/7', 'AI'].map((item, index) => (
                  <div key={item} className="rounded-xl bg-white/5 px-4 py-3 text-center">
                    <div className="text-lg font-black text-white">{item}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {index === 0 ? 'Risk' : index === 1 ? 'Monitor' : 'Engine'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl pb-20">
        <div className="mb-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-violet-300">Platforma imkoniyatlari</p>
            <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
              Toza, tezkor va ishonchli nazorat tajribasi.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Har bir karta shaffoflik, dalil va real vaqt monitoringini bitta premium interfeysga jamlaydi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
