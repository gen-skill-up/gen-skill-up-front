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
  TrendingUp,
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Menu,
  X,
  ChevronUp,
  Zap,
  Check,
  Star,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function HomePage() {
  const { t, dir } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Demo State
  const [demoStep, setDemoStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [xpEarned, setXpEarned] = useState(0);

  // Mascot Speech Bubble State
  const [mascotBubble, setMascotBubble] = useState(false);
  const [mascotMessageIdx, setMascotMessageIdx] = useState(0);

  // Freemium Billing Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    dir === 'rtl' ? 'جرّب التحدي التفاعلي أدناه واكسب 15 نقطة فوراً! 🌟' : 'Try the interactive challenge below & earn 15 XP! 🌟',
    dir === 'rtl' ? 'الباقة المجانية متاحة دائماً بدون بطاقة بنكية! 🚀' : 'Our Free tier is always available with no card needed! 🚀',
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

  // Streamlined Freemium Plans (3 Focused Tiers)
  const streamlinedPlans = [
    {
      key: 'free',
      name: t.pricing.plans.free.name,
      price: '0',
      periodLabel: dir === 'rtl' ? 'مجاني دائماً' : 'Free forever',
      desc: t.pricing.plans.free.desc,
      features: t.pricing.plans.free.features,
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
      key: 'primary',
      name: t.pricing.plans.basic.name,
      price: billingCycle === 'yearly' ? t.pricing.plans.basic.priceYearly : t.pricing.plans.basic.price,
      periodLabel: billingCycle === 'yearly' ? (dir === 'rtl' ? 'د.ت / شهر (سنوياً)' : 'DT / mo (yearly)') : (dir === 'rtl' ? 'د.ت / شهر' : 'DT / month'),
      desc: t.pricing.plans.basic.desc,
      features: t.pricing.plans.basic.features,
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
      key: 'premium',
      name: t.pricing.plans.premium.name,
      price: billingCycle === 'yearly' ? t.pricing.plans.premium.priceYearly : t.pricing.plans.premium.price,
      periodLabel: billingCycle === 'yearly' ? (dir === 'rtl' ? 'د.ت / شهر (سنوياً)' : 'DT / mo (yearly)') : (dir === 'rtl' ? 'د.ت / شهر' : 'DT / month'),
      desc: t.pricing.plans.premium.desc,
      features: [
        ...t.pricing.plans.premium.features.slice(0, 3),
        dir === 'rtl' ? 'اشتراك عائلي يشمل حتى 3 أطفال' : 'Includes up to 3 children'
      ],
      isFree: false,
      popular: false,
      badgeText: dir === 'rtl' ? 'دعم شامل 👑' : 'Full Support 👑',
      color: '#F97316',
      bg: 'rgba(249,115,22,0.05)',
      border: 'rgba(249,115,22,0.25)',
      btnClass: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 shadow-sm',
      btnText: t.pricing.startBtn,
      btnHref: isLoggedIn ? '/dashboard' : '/auth/register',
    },
  ];

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#FDF8F3] text-slate-800 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      {/* Sticky Compact Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#F2DDD0] py-2'
            : 'bg-white/80 backdrop-blur-md py-3 border-b border-[#F2DDD0]'
        }`}
      >
        <nav className="flex items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto">
          {/* Logo & Brand */}
          <Link href="#hero" className="flex items-center gap-2.5 group focus:outline-none">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              onClick={handleMascotClick}
              className="cursor-pointer"
            >
              <OwlLogo size={36} />
            </motion.div>
            <span
              className="text-xl sm:text-2xl font-black text-[var(--color-primary)]"
              style={{ fontFamily: 'Fredoka One, sans-serif' }}
            >
              {t.common.brand}
            </span>
          </Link>

          {/* Quick Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-xs">
            <Link
              href="#demo"
              className="text-xs font-extrabold px-3 py-1.5 rounded-full text-slate-600 hover:text-[var(--color-primary)] hover:bg-white transition-colors"
            >
              {t.navbar.demo}
            </Link>
            <Link
              href="#pricing"
              className="text-xs font-extrabold px-3 py-1.5 rounded-full text-slate-600 hover:text-[var(--color-primary)] hover:bg-white transition-colors flex items-center gap-1"
            >
              <span>{t.navbar.pricing}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black">
                {dir === 'rtl' ? 'مجاني' : 'Free'}
              </span>
            </Link>
            <Link
              href="#contact"
              className="text-xs font-extrabold px-3 py-1.5 rounded-full text-slate-600 hover:text-[var(--color-primary)] hover:bg-white transition-colors"
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
                      <button className="btn-primary text-xs px-4 py-2 cursor-pointer shadow-xs">
                        {t.navbar.dashboardBtn}
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn-secondary text-xs px-3.5 py-2 cursor-pointer"
                    >
                      {t.navbar.logoutBtn}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <button className="btn-secondary text-xs px-3.5 py-2 cursor-pointer font-bold">
                        {t.navbar.loginBtn}
                      </button>
                    </Link>
                    <Link href="/auth/register">
                      <button className="btn-primary text-xs px-4 py-2 cursor-pointer shadow-xs flex items-center gap-1.5">
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
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="md:hidden px-6 pt-2 pb-4 border-t border-slate-200 bg-white/95 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col gap-1.5 py-2">
                <Link
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl font-bold text-slate-700 hover:bg-purple-50 transition-colors"
                >
                  {t.navbar.demo}
                </Link>
                <Link
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl font-bold text-slate-700 hover:bg-purple-50 transition-colors flex items-center justify-between"
                >
                  <span>{t.navbar.pricing}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Freemium
                  </span>
                </Link>
                <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl font-bold text-slate-700 hover:bg-purple-50 transition-colors"
                >
                  {t.navbar.contact}
                </Link>
              </div>

              {/* Mobile Auth */}
              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2 sm:hidden">
                {mounted &&
                  (isLoggedIn ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <button className="btn-primary w-full text-xs py-2.5">{t.navbar.dashboardBtn}</button>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="btn-secondary w-full text-xs py-2.5 cursor-pointer"
                      >
                        {t.navbar.logoutBtn}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <button className="btn-secondary w-full text-xs py-2.5 cursor-pointer">{t.navbar.loginBtn}</button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        <button className="btn-primary w-full text-xs py-2.5 cursor-pointer">{t.navbar.startFree}</button>
                      </Link>
                    </>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section (Concise & Impactful) */}
      <section id="hero" className="relative z-10 text-center px-4 sm:px-6 pt-24 sm:pt-28 pb-8 max-w-3xl mx-auto scroll-mt-20">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Interactive Mascot Button */}
          <div className="relative inline-block mb-3">
            <button
              type="button"
              onClick={handleMascotClick}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs cursor-pointer bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.hero.badgeText}</span>
              <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded-full font-black">
                {dir === 'rtl' ? 'أنيس 🦉' : 'Anis 🦉'}
              </span>
            </button>

            {/* Mascot message popover */}
            <AnimatePresence>
              {mascotBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 rounded-2xl bg-white shadow-xl border-2 border-purple-200 text-xs text-slate-700 font-semibold z-30"
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
            className="text-3xl sm:text-5xl font-black mb-3 leading-tight text-slate-900"
            style={{ fontFamily: 'Fredoka One, sans-serif' }}
          >
            <span>{t.hero.titlePart1} </span>
            <span className="gradient-text">{t.hero.titlePart2} </span>
            <span>{t.hero.titlePart3}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed font-semibold">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-2.5 justify-center items-center mb-6">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
              <button className="btn-primary text-xs sm:text-sm px-6 py-2.5 flex items-center gap-2 cursor-pointer shadow-md">
                <Rocket className="w-4 h-4" />
                <span>{isLoggedIn ? t.navbar.dashboardBtn : t.hero.startJourney}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </Link>

            <Link href="#demo">
              <button className="btn-secondary text-xs sm:text-sm px-5 py-2.5 cursor-pointer flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.interactiveDemo.badge}</span>
              </button>
            </Link>

            <Link href="#pricing">
              <button className="text-slate-600 hover:text-[var(--color-primary)] font-bold text-xs px-3.5 py-2.5 transition-colors flex items-center gap-1 cursor-pointer">
                <span>{t.hero.seePricing}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">
                  {dir === 'rtl' ? '0 د.ت' : '0 DT'}
                </span>
              </button>
            </Link>
          </div>

          {/* 3 Core Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{dir === 'rtl' ? 'باقة مجانية بدون التزام' : 'Free tier forever'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>{dir === 'rtl' ? 'ذكاء اصطناعي مكيف بالكامل' : '100% Adaptive AI'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{dir === 'rtl' ? 'مكافآت وشارات محفزة' : 'Gamified rewards'}</span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Unified Demo & Core Features Section */}
      <section id="demo" className="relative z-10 py-10 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t.interactiveDemo.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.interactiveDemo.title}
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto mt-0.5">
              {t.interactiveDemo.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Live Interactive Challenge Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-purple-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <OwlLogo size={32} />
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-800">{dir === 'rtl' ? 'أنيس المساعد الذكي' : 'Anis AI Tutor'}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{dir === 'rtl' ? 'تحدي فوري ومباشر' : 'Live Interactive Challenge'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{xpEarned} XP</span>
                    </div>
                    <button
                      onClick={handleNextChallenge}
                      className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title={t.interactiveDemo.nextChallenge}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div className="py-4">
                  <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                    {dir === 'rtl' ? `سؤال ${demoStep + 1} من 2` : `Question ${demoStep + 1} of 2`}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 mt-1 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300';

                    if (isSelected) {
                      if (feedbackState === 'correct') {
                        style = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300';
                      } else if (feedbackState === 'wrong') {
                        style = 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`p-2.5 rounded-xl border-2 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${style}`}
                      >
                        {isSelected && feedbackState === 'correct' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        {isSelected && feedbackState === 'wrong' && <X className="w-3.5 h-3.5 text-rose-500" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                <AnimatePresence mode="wait">
                  {feedbackState === 'correct' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{currentQ.feedbackCorrect}</span>
                      </div>
                      <button
                        onClick={handleNextChallenge}
                        className="text-emerald-800 underline text-xs font-black cursor-pointer"
                      >
                        {t.interactiveDemo.nextChallenge}
                      </button>
                    </motion.div>
                  )}

                  {feedbackState === 'wrong' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{currentQ.feedbackWrong}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Card CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-[11px]">
                <span className="text-slate-500 font-semibold">{t.interactiveDemo.ctaTeaser}</span>
                <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
                  <button className="font-extrabold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer">
                    <span>{isLoggedIn ? t.navbar.dashboardBtn : t.navbar.startFree}</span>
                    {dir === 'rtl' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  </button>
                </Link>
              </div>
            </div>

            {/* 4 Core Pillars (Merged Features) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {[
                {
                  title: t.features.aiLearningTitle,
                  desc: t.features.aiLearningDesc,
                  icon: Brain,
                  color: '#8B5CF6',
                  bg: 'rgba(139,92,246,0.08)',
                  href: '/learn-with-ai',
                },
                {
                  title: t.features.rewardsTitle,
                  desc: t.features.rewardsDesc,
                  icon: Trophy,
                  color: '#F59E0B',
                  bg: 'rgba(245,158,11,0.08)',
                  href: '/badges',
                },
                {
                  title: t.features.testTitle,
                  desc: t.features.testDesc,
                  icon: Target,
                  color: '#EC4899',
                  bg: 'rgba(236,72,153,0.08)',
                  href: '/placement-test',
                },
                {
                  title: t.features.trackingTitle,
                  desc: t.features.trackingDesc,
                  icon: TrendingUp,
                  color: '#10B981',
                  bg: 'rgba(16,185,129,0.08)',
                  href: '/parent',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link key={idx} href={isLoggedIn ? item.href : '/auth/register'}>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-purple-300 transition-all flex items-center gap-3 cursor-pointer group">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        style={{ background: item.bg }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 group-hover:text-purple-600 font-bold">
                            {dir === 'rtl' ? '←' : '→'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Streamlined Freemium Pricing (3 Focused Tiers) */}
      <section id="pricing" className="relative z-10 py-12 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Freemium</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.pricing.title}
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto mt-0.5">
              {t.pricing.subtitle}
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="bg-slate-200/80 p-0.5 rounded-full flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.pricing.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    billingCycle === 'yearly' ? 'bg-[var(--color-primary)] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <span>{t.pricing.yearly}</span>
                  <span className="text-[9px] bg-amber-400 text-slate-900 px-1 py-0.2 rounded-full font-black">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {streamlinedPlans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-3xl p-5 flex flex-col justify-between border-2 bg-white transition-all ${
                  plan.popular
                    ? 'shadow-lg ring-2 ring-purple-400/30'
                    : plan.isFree
                    ? 'shadow-xs border-emerald-400/60'
                    : 'shadow-2xs'
                }`}
                style={{
                  backgroundColor: plan.bg,
                  borderColor: plan.popular ? plan.color : plan.border,
                }}
              >
                {/* Popular or Free Badge */}
                {plan.badgeText && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs ${
                      plan.popular ? 'bg-gradient-to-r from-purple-600 to-violet-600' : 'bg-emerald-600'
                    }`}
                  >
                    {plan.badgeText}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Plan Header */}
                  <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                    <h3 className="text-base font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                        {plan.price}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {plan.periodLabel}
                      </span>
                    </div>
                  </div>

                  <p className={`text-[11px] text-slate-500 font-medium leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {plan.desc}
                  </p>

                  <div className="border-t border-slate-200/80" />

                  {/* Features List */}
                  <ul className="space-y-1.5">
                    {plan.features.slice(0, 4).map((feat: string, idx: number) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.color }} />
                        <span className={`text-[11px] font-semibold text-slate-600 leading-snug ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <div className="pt-5">
                  <Link href={plan.btnHref} className="w-full block">
                    <button
                      className={`w-full py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${plan.btnClass}`}
                    >
                      {plan.btnText}
                    </button>
                  </Link>
                  <p className="text-[10px] text-center text-slate-400 font-medium mt-1">
                    {plan.isFree ? t.pricing.noCreditCard : (dir === 'rtl' ? 'إلغاء في أي وقت' : 'Cancel anytime')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact CTA Banner & Footer */}
      <footer id="contact" className="relative z-10 pt-8 pb-6 px-4 sm:px-6 bg-white/70 border-t border-[#F2DDD0]">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Streamlined CTA Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-start space-y-0.5">
              <h3 className="text-lg sm:text-xl font-black" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.cta.sectionTitle}
              </h3>
              <p className="text-xs text-purple-100 font-medium max-w-md">
                {t.cta.sectionSubtitle}
              </p>
            </div>

            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'} className="shrink-0">
              <button className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-black text-xs shadow-md hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5">
                <span>{isLoggedIn ? t.navbar.dashboardBtn : t.cta.buttonText}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </Link>
          </div>

          {/* Simple Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium pt-2">
            <div className="flex items-center gap-2">
              <OwlLogo size={22} />
              <span className="font-black text-slate-800">{t.common.brand}</span>
              <span>•</span>
              <p>© 2026 {t.common.brand}. All rights reserved.</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">
                {t.footer.privacy}
              </Link>
              <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">
                {t.footer.terms}
              </Link>
              <a href={`mailto:${t.footer.contactEmail}`} className="hover:text-[var(--color-primary)] transition-colors">
                {t.footer.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-4 ${
            dir === 'rtl' ? 'left-4' : 'right-4'
          } z-40 p-2.5 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          aria-label="Back to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </main>
  );
}
