'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gamificationApi, childrenApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Trophy,
  Zap,
  CheckCircle,
  Loader2,
  Sparkles,
  Home,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Flame,
  Star
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  subject?: string;
  completed?: boolean;
}

interface Child {
  id: string;
  name: string;
  level: string;
  points: number;
  stars: number;
  streakDays: number;
}

function ChallengesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingChallengeId, setCompletingChallengeId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
      if (id) localStorage.setItem('activeChildId', id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!childId) return;

    Promise.all([
      childrenApi.get(childId),
      gamificationApi.listChallenges(),
    ])
      .then(([childRes, challengesRes]) => {
        setChild(childRes.data);
        setChallenges(challengesRes.data);
      })
      .catch((err) => {
        console.error(err);
        if (typeof window !== 'undefined') localStorage.removeItem('activeChildId');
        router.push('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [childId]);

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!childId) return;
    setCompletingChallengeId(challengeId);
    try {
      const res = await gamificationApi.completeChallenge(challengeId, childId);
      setChallenges(challenges.map((c) => (c.id === challengeId ? { ...c, completed: true } : c)));
      // Update local child points
      setChild((prev) => prev ? { ...prev, points: res.data.points || prev.points } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingChallengeId(null);
    }
  };

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <HelpCircle className="w-10 h-10 text-red-400" />
        </motion.div>
        <h2 className="text-2xl font-black mb-2 text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
          {dir === 'rtl' ? 'الرجاء اختيار طفل أولاً' : 'Veuillez sélectionner un enfant'}
        </h2>
        <Link href="/dashboard">
          <button className="btn-primary flex items-center gap-2 cursor-pointer mt-6">
            <Home className="w-5 h-5" />
            <span>{t.placementTest.goToDashboard}</span>
          </button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #06B6D4, #7C3AED)' }}
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-black mb-2 text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif', color: 'var(--color-primary)' }}>
          {t.challenges.title}
        </h1>
        <p className="text-[var(--color-muted)] text-sm font-semibold">{t.challenges.subtitle}</p>
      </div>

      {/* Premium Stats Bar */}
      {child && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className={`flex items-center gap-4 w-full sm:w-auto ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <div className="w-12 h-12 rounded-2xl bg-cyan-100/60 text-cyan-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {dir === 'rtl' ? 'التحديات المكتملة اليوم' : 'Défis complétés aujourd\'hui'}
              </p>
              <h3 className="font-black text-slate-800 text-lg leading-tight mt-0.5">
                {completedCount} / {challenges.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-around sm:justify-end">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-2xl">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
              <span className="text-xs font-black text-amber-700">{child.stars} ⭐</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-2xl">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-100 shrink-0" />
              <span className="text-xs font-black text-rose-700">{child.streakDays} {dir === 'rtl' ? 'يوم' : 'j'}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 px-4 py-2.5 rounded-2xl">
              <Trophy className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="text-xs font-black text-violet-700">{child.points} XP</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Daily Challenges */}
      <div className="space-y-4">
        <div className={`pb-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
          style={{ borderBottom: '2px solid rgba(124, 58, 237, 0.2)' }}>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span>{t.challenges.dailyTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">{t.challenges.dailyDesc}</p>
        </div>

        <div className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
                <Zap className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm">
                {dir === 'rtl' ? 'لا توجد تحديات متاحة حالياً' : 'Aucun défi disponible'}
              </p>
            </div>
          ) : (
            challenges.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className={`rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all duration-200 ${
                  dir === 'rtl' ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'
                }`}
                style={{
                  background: c.completed ? 'linear-gradient(145deg, #f0fdf4 0%, #ffffff 100%)' : 'white',
                  border: `2px solid ${c.completed ? '#22c55e30' : '#e2e8f0'}`,
                  boxShadow: c.completed ? '0 8px 24px rgba(34,197,94,0.05)' : '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div className="space-y-2 flex-1">
                  <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    c.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {c.subject || (dir === 'rtl' ? 'تحدي عام' : 'Défi général')}
                  </span>
                  <h3 className="font-black text-slate-800 text-base">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{c.description}</p>
                  <div
                    className={`flex items-center gap-2 text-xs font-black ${
                      dir === 'rtl' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
                    }`}
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <span>{t.challenges.reward}</span>
                    <span className="text-cyan-600 font-extrabold">{c.rewardPoints} {t.challenges.points}</span>
                  </div>
                </div>

                {c.completed ? (
                  <div
                    className="shrink-0 flex items-center gap-1.5 text-sm font-black px-4 py-2.5 rounded-2xl"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#16A34A', border: '1.5px solid rgba(74,222,128,0.3)' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.challenges.completedChallenge}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteChallenge(c.id)}
                    disabled={completingChallengeId !== null}
                    className="btn-primary py-3 px-6 text-xs font-black shrink-0 w-full sm:w-auto cursor-pointer"
                  >
                    {completingChallengeId === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{t.challenges.completeChallengeBtn}</span>
                    )}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Link to Badges */}
      <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
        <Link href={`/badges?childId=${childId}`}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 text-xs font-black px-6 py-3.5 rounded-2xl cursor-pointer border-2 transition-all"
            style={{
              background: 'rgba(245,158,11,0.06)',
              border: '2px solid rgba(245,158,11,0.2)',
              color: '#D97706',
            }}
          >
            <Award className="w-4 h-4 animate-bounce" />
            <span>{dir === 'rtl' ? 'عرض مجموعة الشارات الخاصة بي' : 'Voir ma collection de badges'}</span>
            {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </Link>
      </div>

    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <ChallengesContent />
    </Suspense>
  );
}
