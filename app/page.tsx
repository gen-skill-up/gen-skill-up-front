'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import OwlLogo from './components/Logo';
import {
  Brain,
  Trophy,
  Target,
  Lightbulb,
  BookOpen,
  Flame,
  Sparkles,
  Award,
  GraduationCap,
  TrendingUp,
  Rocket,
  Compass,
  ArrowRight,
  ArrowLeft,
  Pencil,
  Calculator,
  Atom,
  Ruler,
  Globe,
  Microscope,
  Play,
  CheckCircle2,
  Menu,
  X,
  ChevronUp
} from 'lucide-react';


const floatingElements = [
  { Icon: Calculator, color: 'text-amber-400', size: 'w-7 h-7' },
  { Icon: GraduationCap, color: 'text-orange-400', size: 'w-7 h-7' },
  { Icon: Pencil, color: 'text-pink-400', size: 'w-6 h-6' },
  { Icon: Lightbulb, color: 'text-yellow-500', size: 'w-7 h-7' },
  { Icon: Globe, color: 'text-emerald-400', size: 'w-7 h-7' },
  { Icon: Ruler, color: 'text-purple-400', size: 'w-6 h-6' },
  { Icon: BookOpen, color: 'text-teal-400', size: 'w-7 h-7' },
  { Icon: Atom, color: 'text-sky-400', size: 'w-6 h-6' },
  { Icon: Compass, color: 'text-rose-400', size: 'w-6 h-6' },
  { Icon: Microscope, color: 'text-blue-400', size: 'w-5 h-5' },
];

function FloatingIcon({ Icon, color, size, x, y, delay }: { Icon: any; color: string; size: string; x: number; y: number; delay: number }) {
  return (
    <motion.div
      className={`absolute pointer-events-none select-none opacity-60 ${color}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -18, 0],
        rotate: [-8, 8, -8],
        scale: [0.9, 1.1, 0.9],
        opacity: [0.5, 0.75, 0.5],
      }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <Icon className={size} />
    </motion.div>
  );
}

// Decorative bubble
function Bubble({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, opacity: 0.12 }}
      animate={{ y: [0, -30, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function HomePage() {
  const { t, dir } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = ['hero', 'demo', 'features', 'pricing', 'contact'];
      for (const sec of sectionIds) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  }, []);

  const features = [
    { icon: Brain, title: t.features.aiLearningTitle, desc: t.features.aiLearningDesc, color: '#FF8C42', bg: 'rgba(255,140,66,0.1)', border: 'rgba(255,140,66,0.25)' },
    { icon: Trophy, title: t.features.rewardsTitle, desc: t.features.rewardsDesc, color: '#FFD93D', bg: 'rgba(255,217,61,0.1)', border: 'rgba(255,217,61,0.3)' },
    { icon: TrendingUp, title: t.features.trackingTitle, desc: t.features.trackingDesc, color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' },
    { icon: Target, title: t.features.testTitle, desc: t.features.testDesc, color: '#F472B6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
    { icon: BookOpen, title: t.features.lessonsTitle, desc: t.features.lessonsDesc, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
    { icon: Flame, title: t.features.challengesTitle, desc: t.features.challengesDesc, color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' },
  ];

  const stats = [
    { value: t.stats.freeTitle, label: t.stats.freeDesc, color: '#FF8C42', bg: 'rgba(255,140,66,0.08)' },
    { value: t.stats.aiTitle, label: t.stats.aiDesc, color: '#4ECDC4', bg: 'rgba(78,205,196,0.08)' },
    { value: t.stats.ageTitle, label: t.stats.ageDesc, color: '#4ADE80', bg: 'rgba(74,222,128,0.08)' },
    { value: t.stats.mathTitle, label: t.stats.mathDesc, color: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
  ];

  const bubbles = [
    { x: 5, y: 15, size: 120, color: 'var(--color-primary)', delay: 0 },
    { x: 85, y: 20, size: 90, color: 'var(--color-secondary)', delay: 1 },
    { x: 70, y: 65, size: 100, color: '#4ECDC4', delay: 2 },
    { x: 15, y: 70, size: 80, color: '#A855F7', delay: 1.5 },
    { x: 50, y: 40, size: 60, color: '#F472B6', delay: 0.5 },
  ];
  const pricingPlans = [
    {
      key: 'basic',
      data: t.pricing.plans.basic,
      color: '#FF8C42',
      bg: 'rgba(255,140,66,0.06)',
      border: 'rgba(255,140,66,0.2)',
      popular: false,
    },
    {
      key: 'advanced',
      data: t.pricing.plans.advanced,
      color: '#4ECDC4',
      bg: 'rgba(78,205,196,0.06)',
      border: 'rgba(78,205,196,0.2)',
      popular: false,
    },
    {
      key: 'premium',
      data: t.pricing.plans.premium,
      color: '#A855F7',
      bg: 'rgba(168,85,247,0.08)',
      border: 'rgba(168,85,247,0.3)',
      popular: true,
    },
    {
      key: 'family',
      data: t.pricing.plans.family,
      color: '#4ADE80',
      bg: 'rgba(74,222,128,0.06)',
      border: 'rgba(74,222,128,0.2)',
      popular: false,
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden stars-bg">
      {/* Decorative background bubbles */}
      <div className="fixed inset-0 pointer-events-none">
        {mounted && bubbles.map((b, i) => (
          <Bubble key={i} {...b} />
        ))}
        {/* Decorative blobs */}
        <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] shape-blob opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }} />
        <div className="absolute bottom-[-10%] left-[-8%] w-[400px] h-[400px] shape-blob opacity-8"
          style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)' }} />
      </div>

      {/* Floating icons */}
      {mounted && floatingElements.map((item, i) => (
        <FloatingIcon
          key={i}
          Icon={item.Icon}
          color={item.color}
          size={item.size}
          x={(i * 9 + 3) % 88}
          y={(i * 13 + 5) % 78}
          delay={i * 0.4}
        />
      ))}

      {/* Fixed Sticky Header / Navbar */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-md border-b border-purple-100/60 dark:border-slate-800/80 py-2.5'
            : 'bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm py-4 border-b border-transparent'
        }`}
      >
        <nav className="flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Logo & Brand */}
          <Link href="#hero" className="flex items-center gap-3 group focus:outline-none">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <OwlLogo size={42} />
            </motion.div>
            <span
              className="text-2xl font-black group-hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'Fredoka One, sans-serif', color: 'var(--color-primary)' }}
            >
              {t.common.brand}
            </span>
          </Link>

          {/* Desktop Section Navigation Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm shadow-inner">
            <Link
              href="#demo"
              id="nav-sec-demo"
              className={`text-xs md:text-sm font-extrabold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'demo'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-white/70 dark:hover:bg-slate-700/70'
              }`}
            >
              {t.navbar.demo}
            </Link>
            <Link
              href="#features"
              id="nav-sec-features"
              className={`text-xs md:text-sm font-extrabold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'features'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-white/70 dark:hover:bg-slate-700/70'
              }`}
            >
              {t.navbar.features}
            </Link>
            <Link
              href="#pricing"
              id="nav-sec-pricing"
              className={`text-xs md:text-sm font-extrabold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'pricing'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-white/70 dark:hover:bg-slate-700/70'
              }`}
            >
              {t.navbar.pricing}
            </Link>
            <Link
              href="#contact"
              id="nav-sec-contact"
              className={`text-xs md:text-sm font-extrabold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'contact'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-white/70 dark:hover:bg-slate-700/70'
              }`}
            >
              {t.navbar.contact}
            </Link>
          </div>

          {/* Right: Controls & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {/* Auth buttons - desktop / tablet */}
            <div className="hidden sm:flex items-center gap-2">
              {mounted ? (
                isLoggedIn ? (
                  <>
                    <Link href="/dashboard" id="nav-dashboard-btn">
                      <button className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2 cursor-pointer shadow-sm">
                        {t.navbar.dashboardBtn}
                      </button>
                    </Link>
                    <button
                      id="nav-logout-btn"
                      onClick={handleLogout}
                      className="btn-secondary text-xs sm:text-sm px-4 sm:px-5 py-2 cursor-pointer"
                    >
                      {t.navbar.logoutBtn}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" id="nav-login-btn">
                      <button className="btn-secondary text-xs sm:text-sm px-4 sm:px-5 py-2 cursor-pointer">
                        {t.navbar.loginBtn}
                      </button>
                    </Link>
                    <Link href="/auth/register" id="nav-register-btn">
                      <button className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2 cursor-pointer shadow-sm">
                        {t.navbar.startFree}
                      </button>
                    </Link>
                  </>
                )
              ) : (
                <div className="flex items-center gap-2 opacity-0 pointer-events-none" aria-hidden="true">
                  <button className="btn-secondary text-xs sm:text-sm px-4 sm:px-5 py-2">{t.navbar.loginBtn}</button>
                  <button className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2">{t.navbar.startFree}</button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="nav-mobile-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden px-6 pt-2 pb-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg shadow-xl"
          >
            <div className="flex flex-col gap-2 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
                {t.navbar.features} & {t.navbar.demo}
              </span>
              <Link
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
                  activeSection === 'demo'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[var(--color-primary)]'
                }`}
              >
                {t.navbar.demo}
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
                  activeSection === 'features'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[var(--color-primary)]'
                }`}
              >
                {t.navbar.features}
              </Link>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
                  activeSection === 'pricing'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[var(--color-primary)]'
                }`}
              >
                {t.navbar.pricing}
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
                  activeSection === 'contact'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[var(--color-primary)]'
                }`}
              >
                {t.navbar.contact}
              </Link>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-2.5 sm:hidden">
              {mounted && (
                isLoggedIn ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <button className="btn-primary w-full text-sm py-2.5">{t.navbar.dashboardBtn}</button>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn-secondary w-full text-sm py-2.5 cursor-pointer"
                    >
                      {t.navbar.logoutBtn}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <button className="btn-secondary w-full text-sm py-2.5 cursor-pointer">{t.navbar.loginBtn}</button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <button className="btn-primary w-full text-sm py-2.5 cursor-pointer">{t.navbar.startFree}</button>
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 text-center px-6 pt-12 pb-20 max-w-5xl mx-auto scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-6"
            style={{
              background: 'rgba(124, 58, 237, 0.12)',
              border: '2px solid rgba(124, 58, 237, 0.35)',
              color: 'var(--color-primary)'
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            {t.hero.badgeText}
          </motion.span>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            <span style={{ color: '#1E293B' }}>{t.hero.titlePart1}</span>
            <br />
            <span className="gradient-text">{t.hero.titlePart2}</span>
            <br />
            <span className="text-3xl md:text-4xl" style={{ color: '#475569' }}>{t.hero.titlePart3}</span>
          </h1>

          <p className="text-lg text-[var(--color-muted)] mb-10 max-w-2xl mx-auto leading-relaxed font-semibold">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'} id="hero-cta-btn">
              <motion.button
                className="btn-primary text-base px-10 py-4 flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.96 }}
              >
                <Rocket className="w-5 h-5" />
                <span>{isLoggedIn ? t.navbar.dashboardBtn : t.hero.startJourney}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </Link>
            <Link href="#features" id="hero-features-btn">
              <button className="btn-secondary text-base px-8 py-4 cursor-pointer">
                {t.hero.discoverFeatures}
              </button>
            </Link>
            <Link href="#pricing" id="hero-pricing-btn">
              <button className="text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] font-bold text-base px-5 py-4 transition-colors flex items-center gap-1.5 cursor-pointer">
                <span>{t.hero.seePricing}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Video Showcase & App Introduction (Demo) */}
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="scroll-mt-24 mt-16 max-w-5xl mx-auto px-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Column 1: Video Showcase (6 cols on lg) */}
            <div className="lg:col-span-6 relative">
              {/* Outer decorative glowing backgrounds */}
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur-lg opacity-25" />
              
              <div className="relative group aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--color-primary)]/20 dark:border-[var(--color-primary)]/10 bg-slate-950 flex items-center justify-center cursor-pointer">
                {/* Background thumbnail gradient mockup */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-indigo-500/10 to-cyan-600/20 opacity-80 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                
                {/* Visual lines resembling video details / interface */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <div className="h-3 w-24 bg-white/20 rounded-full" />
                  </div>
                </div>

                {/* Pulsing Play Button */}
                <motion.div
                  className="relative z-10 w-16 h-16 rounded-full bg-white/90 dark:bg-slate-900/90 text-[var(--color-primary)] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Play className={`w-7 h-7 fill-current ${dir === 'rtl' ? 'mr-0.5' : 'ml-1'}`} />
                </motion.div>
                
                {/* Duration Tag */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                  2:15
                </div>
              </div>
            </div>

            {/* Column 2: Definition (6 cols on lg) */}
            <div className={`lg:col-span-6 space-y-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-black text-slate-800 leading-tight" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.videoIntro.title}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-semibold">
                {t.videoIntro.description}
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: t.videoIntro.feature1Title, desc: t.videoIntro.feature1Desc, color: 'text-purple-500' },
                  { title: t.videoIntro.feature2Title, desc: t.videoIntro.feature2Desc, color: 'text-emerald-500' },
                  { title: t.videoIntro.feature3Title, desc: t.videoIntro.feature3Desc, color: 'text-sky-500' },
                ].map((item, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${item.color}`} />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Section Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href={isLoggedIn ? '/dashboard' : '/auth/register'} id="demo-cta-btn">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary text-sm px-6 py-3 flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{isLoggedIn ? t.navbar.dashboardBtn : t.hero.startJourney}</span>
                    {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </Link>
                <Link href="#pricing" id="demo-pricing-btn">
                  <button className="btn-secondary text-sm px-5 py-3 cursor-pointer">
                    {t.hero.seePricing}
                  </button>
                </Link>
              </div>
            </div>
            
          </div>
        </motion.div>

      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-12 px-6 scroll-mt-24">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
              className="text-center rounded-3xl p-5"
              style={{ background: stat.bg, border: `2px solid ${stat.color}30` }}
            >
              <div className="text-xl md:text-2xl font-black mb-1" style={{ color: stat.color, fontFamily: 'Fredoka One, sans-serif' }}>
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <OwlLogo size={38} />
              <h2 className="section-title">
                {t.features.sectionTitle.split('Gen Skill Up')[0]}
                <span style={{ color: '#FF8C42' }}>Gen Skill Up</span>
                {t.features.sectionTitle.split('Gen Skill Up')[1]}
              </h2>
            </div>
            <p className="text-[var(--color-muted)] text-base font-semibold">{t.features.sectionSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 250 }}
                  className={`card group cursor-pointer ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                  style={{ borderColor: f.border }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"
                    style={{ background: f.bg, border: `2px solid ${f.border}` }}>
                    <Icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-black text-lg mb-2 text-slate-800">{f.title}</h3>
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Features Section CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="#pricing" id="features-to-pricing-btn">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>{t.hero.seePricing}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-16 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-[var(--color-muted)] text-base font-semibold">
              {t.pricing.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`relative rounded-3xl p-6 flex flex-col justify-between border-2 backdrop-blur-md transition-all duration-300 ${
                  plan.popular 
                    ? 'shadow-xl ring-4 ring-purple-500/20' 
                    : 'shadow-md hover:shadow-lg'
                }`}
                style={{
                  backgroundColor: plan.bg,
                  borderColor: plan.popular ? plan.color : plan.border,
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r from-purple-500 to-[#A855F7] shadow-md uppercase tracking-wider">
                    {t.pricing.popularBadge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className={`space-y-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-lg font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                      {plan.data.name}
                    </h3>
                    <div className="flex items-baseline gap-1 justify-start">
                      <span className="text-4xl font-black text-slate-900" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                        {plan.data.price}
                      </span>
                      <span className="text-sm font-bold text-slate-500">
                        {t.pricing.currency} / {t.pricing.period}
                      </span>
                    </div>
                  </div>

                  {/* Plan Description */}
                  <p className={`text-xs text-slate-500 font-medium leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {plan.data.desc}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-slate-200/60 dark:border-slate-800/60" />

                  {/* Features List */}
                  <div className="space-y-4">
                    <p className={`text-xs font-extrabold text-slate-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {t.pricing.featuresTitle}
                    </p>
                    <ul className="space-y-3">
                      {plan.data.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                          <span className={`text-xs font-semibold text-slate-600 leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Select Button */}
                <div className="pt-8">
                  <Link href={isLoggedIn ? '/dashboard' : '/auth/register'} className="w-full block">
                    <button
                      className={`w-full py-3 px-4 rounded-2xl text-sm font-black transition-all duration-300 cursor-pointer ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-[#A855F7] text-white hover:shadow-lg hover:shadow-purple-500/25'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200'
                      }`}
                    >
                      {t.pricing.startBtn}
                    </button>
                  </Link>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(6,182,212,0.1) 100%)',
            border: '2px solid rgba(124, 58, 237, 0.25)',
            boxShadow: '0 20px 60px rgba(124, 58, 237, 0.12)'
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)', transform: 'translate(-30%, 30%)' }} />

          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="section-title mb-4" style={{ color: '#1E293B' }}>
            {t.cta.sectionTitle}
          </h2>
          <p className="text-[var(--color-muted)] mb-8 text-base font-semibold">
            {t.cta.sectionSubtitle}
          </p>
          <Link href={isLoggedIn ? '/dashboard' : '/auth/register'} id="bottom-cta-btn">
            <motion.button
              className="btn-primary text-base px-12 py-4 cursor-pointer"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoggedIn ? t.navbar.dashboardBtn : t.cta.buttonText}
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer / Contact Section */}
      <footer id="contact" className="relative z-10 pt-16 pb-8 px-6 bg-white/40 backdrop-blur-sm dark:bg-slate-900/40 scroll-mt-24"
        style={{ borderTop: '2px solid rgba(255,140,66,0.12)' }}>
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand & Logo */}
            <div className={`space-y-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-3 justify-start">
                <OwlLogo size={36} />
                <span className="text-xl font-black" style={{ fontFamily: 'Fredoka One, sans-serif', color: 'var(--color-primary)' }}>
                  {t.common.brand}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {t.footer.about}
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className={`space-y-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-slate-800 font-extrabold text-sm tracking-wide uppercase">
                {t.footer.linksTitle}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="#hero" className="text-sm text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.home}
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-sm text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.features}
                  </Link>
                </li>
                <li>
                  <Link href="/lessons" className="text-sm text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.lessons}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.navbar.dashboardBtn}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Learning Subjects */}
            <div className={`space-y-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-slate-800 font-extrabold text-sm tracking-wide uppercase">
                {t.footer.learningTitle}
              </h4>
              <ul className="space-y-2.5">
                <li className="text-sm text-slate-500 font-semibold">
                  {t.footer.math}
                </li>
                <li className="text-sm text-slate-400 font-medium italic">
                  {t.footer.logic}
                </li>
                <li className="text-sm text-slate-400 font-medium italic">
                  {t.footer.french}
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Legal */}
            <div className={`space-y-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-slate-800 font-extrabold text-sm tracking-wide uppercase">
                {t.footer.contactTitle}
              </h4>
              <ul className="space-y-2.5">
                <li className="text-sm text-[var(--color-primary)] font-semibold">
                  <a href={`mailto:${t.footer.contactEmail}`} className="hover:underline">
                     {t.footer.contactEmail}
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.terms}
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/60 dark:border-slate-800/60 my-6" />

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <OwlLogo size={20} />
              <p>© 2026 <span style={{ color: 'var(--color-primary)', fontWeight: 900 }}>{t.common.brand}</span>. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{t.footer.text}</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {scrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 ${
            dir === 'rtl' ? 'left-6' : 'right-6'
          } z-40 p-3.5 rounded-full bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center border-2 border-white/40`}
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </main>
  );
}
