'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle2,
  Menu,
  X,
  ChevronUp,
  Zap,
  Check,
  Star,
  ExternalLink,
  MessageCircle,
  HelpCircle
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
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <Icon className={size} />
    </motion.div>
  );
}

function Bubble({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, opacity: 0.12 }}
      animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function HomePage() {
  const { t, dir } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Interactive Demo State
  const [demoStep, setDemoStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [xpEarned, setXpEarned] = useState(0);

  // Interactive Mascot Speech Bubble
  const [mascotBubble, setMascotBubble] = useState(false);
  const [mascotMessageIdx, setMascotMessageIdx] = useState(0);

  // Interactive Features Modal State
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(null);

  // Freemium Billing Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollY / totalHeight) * 100)));
      }

      const sectionIds = ['hero', 'demo', 'features', 'pricing', 'contact'];
      for (const sec of sectionIds) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
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

  // Mascot Messages on Click
  const mascotMessages = [
    dir === 'rtl' ? 'أهلاً بك! أنا أنيس، صديقك الذكي للتعلم 🦉✨' : 'Hello! I am Anis, your smart learning buddy 🦉✨',
    dir === 'rtl' ? 'جرّب التحدي التفاعلي أدناه واكسب 15 نقطة فوراً! 🌟' : 'Try the interactive mini-challenge below & earn 15 XP! 🌟',
    dir === 'rtl' ? 'الباقة المجانية تمنحك 5 دروس واختبار تحديد المستوى مجاناً! 🚀' : 'Our Free plan gives you 5 free lessons and the smart diagnostic test! 🚀',
  ];

  const handleMascotClick = () => {
    setMascotBubble(true);
    setMascotMessageIdx((prev) => (prev + 1) % mascotMessages.length);
  };

  // Demo questions
  const demoQuestions = [
    {
      question: t.interactiveDemo.question1,
      options: t.interactiveDemo.options1,
      correctIdx: 1, // 12
      feedbackCorrect: t.interactiveDemo.correctFeedback,
      feedbackWrong: t.interactiveDemo.wrongFeedback,
    },
    {
      question: t.interactiveDemo.question2,
      options: t.interactiveDemo.options2,
      correctIdx: 1, // 8
      feedbackCorrect: t.interactiveDemo.correctFeedback2,
      feedbackWrong: t.interactiveDemo.wrongFeedback,
    },
  ];

  const currentQ = demoQuestions[demoStep];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    if (idx === currentQ.correctIdx) {
      setFeedbackState('correct');
      setXpEarned((prev) => prev + 15);
    } else {
      setFeedbackState('wrong');
    }
  };

  const handleNextChallenge = () => {
    setSelectedOption(null);
    setFeedbackState('idle');
    setDemoStep((prev) => (prev + 1) % demoQuestions.length);
  };

  // Features list with interactive details
  const features = [
    {
      icon: Brain,
      title: t.features.aiLearningTitle,
      desc: t.features.aiLearningDesc,
      detail: t.features.aiLearningDetail,
      href: '/learn-with-ai',
      color: '#FF8C42',
      bg: 'rgba(255,140,66,0.1)',
      border: 'rgba(255,140,66,0.3)',
      badge: 'AI Smart',
    },
    {
      icon: Trophy,
      title: t.features.rewardsTitle,
      desc: t.features.rewardsDesc,
      detail: t.features.rewardsDetail,
      href: '/badges',
      color: '#EAB308',
      bg: 'rgba(234,179,8,0.1)',
      border: 'rgba(234,179,8,0.3)',
      badge: 'Gamified',
    },
    {
      icon: TrendingUp,
      title: t.features.trackingTitle,
      desc: t.features.trackingDesc,
      detail: t.features.trackingDetail,
      href: '/parent',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.3)',
      badge: 'Parents Hub',
    },
    {
      icon: Target,
      title: t.features.testTitle,
      desc: t.features.testDesc,
      detail: t.features.testDetail,
      href: '/placement-test',
      color: '#EC4899',
      bg: 'rgba(236,72,153,0.1)',
      border: 'rgba(236,72,153,0.3)',
      badge: 'Smart Test',
    },
    {
      icon: BookOpen,
      title: t.features.lessonsTitle,
      desc: t.features.lessonsDesc,
      detail: t.features.lessonsDetail,
      href: '/lessons',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.3)',
      badge: 'Interactive',
    },
    {
      icon: Flame,
      title: t.features.challengesTitle,
      desc: t.features.challengesDesc,
      detail: t.features.challengesDetail,
      href: '/challenges',
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.1)',
      border: 'rgba(139,92,246,0.3)',
      badge: 'Daily Quests',
    },
  ];

  // Stats items (Interactive & compact)
  const stats = [
    { value: t.stats.freeTitle, label: t.stats.freeDesc, targetId: 'pricing', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    { value: t.stats.aiTitle, label: t.stats.aiDesc, targetId: 'demo', color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
    { value: t.stats.ageTitle, label: t.stats.ageDesc, targetId: 'features', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    { value: t.stats.mathTitle, label: t.stats.mathDesc, targetId: 'features', color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
  ];

  // Freemium Pricing Plans
  const pricingPlans = [
    {
      key: 'free',
      data: t.pricing.plans.free,
      price: '0',
      isFree: true,
      popular: false,
      badgeText: t.pricing.freeBadge,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.05)',
      border: 'rgba(16,185,129,0.3)',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20',
      btnText: t.pricing.startFreeBtn,
      btnHref: isLoggedIn ? '/dashboard' : '/auth/register',
    },
    {
      key: 'basic',
      data: t.pricing.plans.basic,
      price: billingCycle === 'yearly' ? t.pricing.plans.basic.priceYearly : t.pricing.plans.basic.price,
      isFree: false,
      popular: true,
      badgeText: t.pricing.popularBadge,
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.06)',
      border: 'rgba(139,92,246,0.35)',
      btnClass: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25',
      btnText: t.pricing.startBtn,
      btnHref: isLoggedIn ? '/dashboard' : '/auth/register',
    },
    {
      key: 'advanced',
      data: t.pricing.plans.advanced,
      price: billingCycle === 'yearly' ? t.pricing.plans.advanced.priceYearly : t.pricing.plans.advanced.price,
      isFree: false,
      popular: false,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.05)',
      border: 'rgba(59,130,246,0.25)',
      btnClass: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white',
      btnText: t.pricing.startBtn,
      btnHref: isLoggedIn ? '/dashboard' : '/auth/register',
    },
    {
      key: 'family',
      data: t.pricing.plans.family,
      price: billingCycle === 'yearly' ? t.pricing.plans.family.priceYearly : t.pricing.plans.family.price,
      isFree: false,
      popular: false,
      badgeText: dir === 'rtl' ? '3 أطفال 👨‍👩‍👧' : '3 Children 👨‍👩‍👧',
      color: '#F97316',
      bg: 'rgba(249,115,22,0.05)',
      border: 'rgba(249,115,22,0.25)',
      btnClass: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white',
      btnText: t.pricing.startBtn,
      btnHref: isLoggedIn ? '/dashboard' : '/auth/register',
    },
  ];

  const bubbles = [
    { x: 5, y: 12, size: 100, color: 'var(--color-primary)', delay: 0 },
    { x: 88, y: 18, size: 80, color: 'var(--color-secondary)', delay: 1 },
    { x: 75, y: 60, size: 90, color: '#4ECDC4', delay: 2 },
    { x: 12, y: 65, size: 70, color: '#A855F7', delay: 1.5 },
  ];

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#FDF8F3] text-slate-800">
      {/* Decorative background bubbles */}
      <div className="fixed inset-0 pointer-events-none">
        {mounted && bubbles.map((b, i) => <Bubble key={i} {...b} />)}
        <div
          className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] shape-blob opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] shape-blob opacity-8"
          style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)' }}
        />
      </div>

      {/* Floating icons */}
      {mounted &&
        floatingElements.map((item, i) => (
          <FloatingIcon
            key={i}
            Icon={item.Icon}
            color={item.color}
            size={item.size}
            x={(i * 10 + 4) % 90}
            y={(i * 12 + 6) % 80}
            delay={i * 0.4}
          />
        ))}

      {/* Sticky Compact Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#F2DDD0] py-2'
            : 'bg-white/85 backdrop-blur-md py-3 border-b border-[#F2DDD0]'
        }`}
      >
        <nav className="flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Logo & Brand */}
          <Link href="#hero" className="flex items-center gap-2.5 group focus:outline-none">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              onClick={handleMascotClick}
              className="cursor-pointer"
            >
              <OwlLogo size={38} />
            </motion.div>
            <span
              className="text-xl sm:text-2xl font-black group-hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'Fredoka One, sans-serif', color: 'var(--color-primary)' }}
            >
              {t.common.brand}
            </span>
          </Link>

          {/* Desktop Section Navigation Buttons */}
          <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 backdrop-blur-sm shadow-xs">
            <Link
              href="#demo"
              className={`text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'demo'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[var(--color-primary)] hover:bg-white'
              }`}
            >
              {t.navbar.demo}
            </Link>
            <Link
              href="#features"
              className={`text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'features'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[var(--color-primary)] hover:bg-white'
              }`}
            >
              {t.navbar.features}
            </Link>
            <Link
              href="#pricing"
              className={`text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                activeSection === 'pricing'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[var(--color-primary)] hover:bg-white'
              }`}
            >
              <span>{t.navbar.pricing}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-black">
                {dir === 'rtl' ? 'مجاني' : 'Free'}
              </span>
            </Link>
            <Link
              href="#contact"
              className={`text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeSection === 'contact'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[var(--color-primary)] hover:bg-white'
              }`}
            >
              {t.navbar.contact}
            </Link>
          </div>

          {/* Right Controls & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {/* Auth buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {mounted &&
                (isLoggedIn ? (
                  <>
                    <Link href="/dashboard">
                      <button className="btn-primary text-xs sm:text-sm px-4 py-2 cursor-pointer shadow-xs">
                        {t.navbar.dashboardBtn}
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn-secondary text-xs sm:text-sm px-3.5 py-2 cursor-pointer"
                    >
                      {t.navbar.logoutBtn}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <button className="btn-secondary text-xs sm:text-sm px-3.5 py-2 cursor-pointer">
                        {t.navbar.loginBtn}
                      </button>
                    </Link>
                    <Link href="/auth/register">
                      <button className="btn-primary text-xs sm:text-sm px-4 py-2 cursor-pointer shadow-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.navbar.startFree}</span>
                      </button>
                    </Link>
                  </>
                ))}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden px-6 pt-2 pb-5 border-t border-slate-200 bg-white/95 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col gap-1.5 py-2">
                <Link
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-colors ${
                    activeSection === 'demo' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {t.navbar.demo}
                </Link>
                <Link
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-colors ${
                    activeSection === 'features' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {t.navbar.features}
                </Link>
                <Link
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center justify-between ${
                    activeSection === 'pricing' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  <span>{t.navbar.pricing}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Freemium
                  </span>
                </Link>
                <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-colors ${
                    activeSection === 'contact' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {t.navbar.contact}
                </Link>
              </div>

              {/* Mobile Auth */}
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2 sm:hidden">
                {mounted &&
                  (isLoggedIn ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
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
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <button className="btn-secondary w-full text-sm py-2.5 cursor-pointer">{t.navbar.loginBtn}</button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        <button className="btn-primary w-full text-sm py-2.5 cursor-pointer">{t.navbar.startFree}</button>
                      </Link>
                    </>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-200/40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] via-indigo-500 to-emerald-400 transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Hero Section (Compact & Focused) */}
      <section id="hero" className="relative z-10 text-center px-4 sm:px-6 pt-24 sm:pt-28 pb-10 max-w-4xl mx-auto scroll-mt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Interactive Mascot Speech Bubble */}
          <div className="relative inline-block mb-3">
            <motion.button
              type="button"
              onClick={handleMascotClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              style={{
                background: 'rgba(124, 58, 237, 0.1)',
                border: '2px solid rgba(124, 58, 237, 0.25)',
                color: 'var(--color-primary)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{t.hero.badgeText}</span>
              <span className="text-[10px] bg-purple-200/80 text-purple-800 px-1.5 py-0.5 rounded-full font-extrabold">
                {dir === 'rtl' ? 'اضغطني 🦉' : 'Tap me 🦉'}
              </span>
            </motion.button>

            {/* Mascot message popover */}
            <AnimatePresence>
              {mascotBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 sm:w-80 p-3 rounded-2xl bg-white shadow-xl border-2 border-purple-300 text-xs text-slate-700 font-semibold z-30"
                >
                  <p>{mascotMessages[mascotMessageIdx]}</p>
                  <button
                    onClick={() => setMascotBubble(false)}
                    className="mt-2 text-[10px] font-bold text-purple-600 hover:underline cursor-pointer block text-center w-full"
                  >
                    {dir === 'rtl' ? 'حسناً يا أنيس! 👍' : 'Got it Anis! 👍'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight"
            style={{ fontFamily: 'Fredoka One, sans-serif' }}
          >
            <span>{t.hero.titlePart1} </span>
            <span className="gradient-text">{t.hero.titlePart2} </span>
            <br className="hidden sm:inline" />
            <span className="text-2xl sm:text-4xl text-slate-700">{t.hero.titlePart3}</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-muted)] mb-8 max-w-2xl mx-auto leading-relaxed font-semibold">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 justify-center items-center mb-8">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
              <motion.button
                className="btn-primary text-sm sm:text-base px-7 py-3 flex items-center gap-2 cursor-pointer shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <Rocket className="w-4 h-4" />
                <span>{isLoggedIn ? t.navbar.dashboardBtn : t.hero.startJourney}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </Link>

            <Link href="#demo">
              <motion.button
                className="btn-secondary text-sm sm:text-base px-6 py-3 cursor-pointer flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{t.interactiveDemo.badge}</span>
              </motion.button>
            </Link>

            <Link href="#pricing">
              <button className="text-slate-600 hover:text-[var(--color-primary)] font-bold text-xs sm:text-sm px-4 py-3 transition-colors flex items-center gap-1 cursor-pointer">
                <span>{t.hero.seePricing}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">
                  {dir === 'rtl' ? '0 د.ت' : '0 DT'}
                </span>
              </button>
            </Link>
          </div>

          {/* Integrated Interactive Stats Strip (Replaces entire redundant section) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-2">
            {stats.map((stat, i) => (
              <motion.a
                key={stat.label}
                href={`#${stat.targetId}`}
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="block text-center rounded-2xl p-3 border transition-all duration-200 cursor-pointer bg-white/70 backdrop-blur-xs shadow-xs hover:shadow-md"
                style={{ borderColor: `${stat.color}40` }}
              >
                <div
                  className="text-base sm:text-lg font-black"
                  style={{ color: stat.color, fontFamily: 'Fredoka One, sans-serif' }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">{stat.label}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Interactive Demo / Playground Section */}
      <section id="demo" className="relative z-10 py-12 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t.interactiveDemo.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.interactiveDemo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto mt-1">
              {t.interactiveDemo.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Interactive Live Challenge Card (Interactive Quiz) */}
            <motion.div
              className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-200 flex flex-col justify-between relative overflow-hidden"
              whileHover={{ boxShadow: '0 20px 40px -15px rgba(124, 58, 237, 0.15)' }}
            >
              {/* Top Bar with Anis avatar & XP score */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <OwlLogo size={36} />
                    <div>
                      <h4 className="font-black text-sm text-slate-800">{dir === 'rtl' ? 'أنيس المساعد الذكي' : 'Anis AI Tutor'}</h4>
                      <p className="text-[11px] text-slate-400 font-bold">{dir === 'rtl' ? 'تمرين ذكي مباشر' : 'Live Adaptive Quiz'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.div
                      key={xpEarned}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{xpEarned} XP</span>
                    </motion.div>
                    <button
                      onClick={handleNextChallenge}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title={t.interactiveDemo.nextChallenge}
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="py-6">
                  <span className="text-[11px] font-black uppercase text-purple-600 tracking-wider">
                    {dir === 'rtl' ? `سؤال ${demoStep + 1} من 2` : `Question ${demoStep + 1} of 2`}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 mt-1 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Clickable Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIdx;
                    let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300';

                    if (isSelected) {
                      if (feedbackState === 'correct') {
                        style = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300';
                      } else if (feedbackState === 'wrong') {
                        style = 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300';
                      }
                    }

                    return (
                      <motion.button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`p-3.5 rounded-2xl border-2 font-black text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${style}`}
                      >
                        {isSelected && feedbackState === 'correct' && <Check className="w-4 h-4 text-emerald-600" />}
                        {isSelected && feedbackState === 'wrong' && <X className="w-4 h-4 text-rose-500" />}
                        <span>{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Real-time AI Feedback */}
                <AnimatePresence mode="wait">
                  {feedbackState === 'correct' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{currentQ.feedbackCorrect}</span>
                      </div>
                      <button
                        onClick={handleNextChallenge}
                        className="text-emerald-700 underline text-xs font-black cursor-pointer"
                      >
                        {t.interactiveDemo.nextChallenge}
                      </button>
                    </motion.div>
                  )}

                  {feedbackState === 'wrong' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-2xl bg-rose-100/80 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{currentQ.feedbackWrong}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Card CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-[11px] font-semibold text-slate-500">
                  {t.interactiveDemo.ctaTeaser}
                </span>
                <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
                  <button className="text-xs font-extrabold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer">
                    <span>{isLoggedIn ? t.navbar.dashboardBtn : t.navbar.startFree}</span>
                    {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Platform Highlights (Interactive Clickable Features Teaser) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
              {[
                {
                  title: t.videoIntro.feature1Title,
                  desc: t.videoIntro.feature1Desc,
                  icon: Brain,
                  color: '#8B5CF6',
                  bg: 'rgba(139,92,246,0.08)',
                  targetId: 'features',
                },
                {
                  title: t.videoIntro.feature2Title,
                  desc: t.videoIntro.feature2Desc,
                  icon: Trophy,
                  color: '#F59E0B',
                  bg: 'rgba(245,158,11,0.08)',
                  targetId: 'features',
                },
                {
                  title: t.videoIntro.feature3Title,
                  desc: t.videoIntro.feature3Desc,
                  icon: Target,
                  color: '#10B981',
                  bg: 'rgba(16,185,129,0.08)',
                  targetId: 'pricing',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={idx}
                    href={`#${item.targetId}`}
                    whileHover={{ scale: 1.02, x: dir === 'rtl' ? -4 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-3 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                      style={{ background: item.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-800">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 group-hover:text-purple-600 transition-colors font-bold">
                          {dir === 'rtl' ? 'استكشف ←' : 'Explore →'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </motion.a>
                );
              })}

              {/* Quick start banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-black text-sm">
                    {dir === 'rtl' ? 'ابدأ مجاناً اليوم 🌟' : 'Start 100% Free Today 🌟'}
                  </h4>
                  <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
                    {t.pricing.noCreditCard}
                  </p>
                </div>
                <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
                  <button className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer">
                    {dir === 'rtl' ? 'سجّل الآن' : 'Sign Up'}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Clickable Interactive Cards) */}
      <section id="features" className="relative z-10 py-12 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.features.sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              {t.features.sectionSubtitle}
            </p>
            <p className="text-[11px] text-purple-600 font-bold mt-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.features.interactiveHint}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  onClick={() => setActiveFeatureIndex(i)}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`card group cursor-pointer transition-all duration-300 relative bg-white/90 backdrop-blur-xs border-2 shadow-xs hover:shadow-lg p-5 ${
                    dir === 'rtl' ? 'text-right' : 'text-left'
                  }`}
                  style={{ borderColor: f.border }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xs"
                      style={{ background: f.bg, border: `1.5px solid ${f.border}` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <span
                      className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                      style={{ background: f.bg, color: f.color }}
                    >
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-base mb-1.5 text-slate-800 group-hover:text-purple-700 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium mb-3">
                    {f.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                    <span>{t.features.tryFeature}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Feature Modal */}
      <AnimatePresence>
        {activeFeatureIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 relative"
              style={{ borderColor: features[activeFeatureIndex].color }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveFeatureIndex(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs"
                  style={{ background: features[activeFeatureIndex].bg }}
                >
                  {(() => {
                    const ModalIcon = features[activeFeatureIndex].icon;
                    return <ModalIcon className="w-6 h-6" style={{ color: features[activeFeatureIndex].color }} />;
                  })()}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800">
                    {features[activeFeatureIndex].title}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {features[activeFeatureIndex].badge}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mb-6">
                {features[activeFeatureIndex].detail}
              </p>

              <div className="flex gap-2">
                <Link
                  href={isLoggedIn ? features[activeFeatureIndex].href : '/auth/register'}
                  className="flex-1"
                >
                  <button
                    className="w-full py-2.5 rounded-2xl text-white text-xs sm:text-sm font-black shadow-md cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    style={{ background: features[activeFeatureIndex].color }}
                  >
                    <span>{t.features.tryFeature}</span>
                    {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </Link>
                <button
                  onClick={() => setActiveFeatureIndex(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {dir === 'rtl' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Freemium Pricing Section */}
      <section id="pricing" className="relative z-10 py-14 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {dir === 'rtl' ? 'نموذج Freemium المرن' : 'Flexible Freemium Model'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.pricing.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-xl mx-auto mt-1">
              {t.pricing.subtitle}
            </p>

            {/* Monthly / Yearly Toggle Switch */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <div className="bg-slate-200/80 p-1 rounded-full flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.pricing.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-[var(--color-primary)] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{t.pricing.yearly}</span>
                  <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-black">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid (4 Cards: Free, Primary, Advanced, Family) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.key}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className={`relative rounded-3xl p-5 flex flex-col justify-between border-2 bg-white/95 backdrop-blur-xs transition-all duration-300 ${
                  plan.popular
                    ? 'shadow-xl ring-3 ring-purple-400/30'
                    : plan.isFree
                    ? 'shadow-md border-emerald-400/60 ring-2 ring-emerald-300/20'
                    : 'shadow-xs hover:shadow-md'
                }`}
                style={{
                  backgroundColor: plan.bg,
                  borderColor: plan.popular ? plan.color : plan.border,
                }}
              >
                {/* Popular or Free Badge */}
                {plan.badgeText && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600'
                        : plan.isFree
                        ? 'bg-emerald-600'
                        : 'bg-orange-500'
                    }`}
                  >
                    {plan.badgeText}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-base font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                      {plan.data.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                        {plan.price}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {t.pricing.currency} / {billingCycle === 'yearly' ? (dir === 'rtl' ? 'شهر (سنوياً)' : 'mo (yearly)') : t.pricing.period}
                      </span>
                    </div>
                  </div>

                  {/* Plan Description */}
                  <p className={`text-[11px] text-slate-500 font-medium leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {plan.data.desc}
                  </p>

                  <div className="border-t border-slate-200/80" />

                  {/* Features List */}
                  <div className="space-y-2.5">
                    <p className={`text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {t.pricing.featuresTitle}
                    </p>
                    <ul className="space-y-2">
                      {plan.data.features.map((feat: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.color }} />
                          <span className={`text-[11px] font-semibold text-slate-600 leading-snug ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div className="pt-6">
                  <Link href={plan.btnHref} className="w-full block">
                    <button
                      className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${plan.btnClass}`}
                    >
                      {plan.btnText}
                    </button>
                  </Link>
                  <p className="text-[10px] text-center text-slate-400 font-medium mt-1.5">
                    {plan.isFree ? t.pricing.noCreditCard : (dir === 'rtl' ? 'إلغاء في أي وقت' : 'Cancel anytime')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrated CTA Strip & Modern Footer */}
      <footer id="contact" className="relative z-10 pt-10 pb-6 px-4 sm:px-6 bg-white/60 backdrop-blur-sm border-t border-[#F2DDD0] scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Compact CTA Banner */}
          <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-start space-y-1">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                {dir === 'rtl' ? 'ابدأ الآن مجاناً' : 'Get Started Free'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.cta.sectionTitle}
              </h3>
              <p className="text-xs text-purple-100 font-medium max-w-md">
                {t.cta.sectionSubtitle}
              </p>
            </div>

            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'} className="shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-3 rounded-2xl bg-white text-purple-900 font-black text-sm shadow-lg hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>{isLoggedIn ? t.navbar.dashboardBtn : t.cta.buttonText}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </Link>
          </div>

          {/* Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className={`space-y-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-2.5">
                <OwlLogo size={32} />
                <span className="text-lg font-black text-[var(--color-primary)]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {t.common.brand}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t.footer.about}
              </p>
            </div>

            {/* Quick Links */}
            <div className={`space-y-2.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-slate-800 font-extrabold text-xs tracking-wider uppercase">
                {t.footer.linksTitle}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="#hero" className="text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.home}
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.navbar.demo}
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.footer.features}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-slate-500 hover:text-[var(--color-primary)] font-semibold transition-colors">
                    {t.navbar.pricing}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learning Subjects */}
            <div className={`space-y-2.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-slate-800 font-extrabold text-xs tracking-wider uppercase">
                {t.footer.learningTitle}
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-600 font-semibold">{t.footer.math}</li>
                <li className="text-slate-400 font-medium">{t.footer.logic}</li>
                <li className="text-slate-400 font-medium">{t.footer.french}</li>
              </ul>
            </div>

            {/* Contact */}
            <div className={`space-y-2.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-slate-800 font-extrabold text-xs tracking-wider uppercase">
                {t.footer.contactTitle}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href={`mailto:${t.footer.contactEmail}`} className="text-[var(--color-primary)] font-bold hover:underline">
                    {t.footer.contactEmail}
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-500 hover:text-[var(--color-primary)] font-medium transition-colors">
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-500 hover:text-[var(--color-primary)] font-medium transition-colors">
                    {t.footer.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <OwlLogo size={18} />
              <p>© 2026 {t.common.brand}. All rights reserved.</p>
            </div>
            <p>{t.footer.text}</p>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top */}
      {scrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-5 ${
            dir === 'rtl' ? 'left-5' : 'right-5'
          } z-40 p-3 rounded-full bg-[var(--color-primary)] text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/50`}
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </main>
  );
}
