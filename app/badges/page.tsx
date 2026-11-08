'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gamificationApi, childrenApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Award,
  BookOpen,
  Zap,
  Lock,
  CheckCircle,
  Loader2,
  Home,
  HelpCircle,
  Star,
  Medal,
  Sparkles,
  Trophy
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt?: string;
  earned?: boolean;
}

interface Child {
  id: string;
  name: string;
  level: string;
  points: number;
  stars: number;
}

const badgeIconMap: Record<string, any> = {
  award: Award,
  bookOpen: BookOpen,
  zap: Zap,
  star: Star,
  medal: Medal,
  sparkles: Sparkles,
};

function BadgesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

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
      gamificationApi.listBadges(),
      gamificationApi.listEarnedBadges(childId),
    ])
      .then(([childRes, badgesRes, earnedRes]) => {
        setChild(childRes.data);
        setAllBadges(badgesRes.data);
        setEarnedBadges(earnedRes.data);
      })
      .catch((err) => {
        console.error(err);
        router.push('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [childId]);

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const badgesWithEarnedStatus = allBadges.map((badge) => {
    const earned = earnedBadges.find((eb) => eb.id === badge.id);
    return { ...badge, earned: !!earned, earnedAt: earned?.earnedAt };
  });

  const earnedCount = badgesWithEarnedStatus.filter((b) => b.earned).length;
  const totalCount = badgesWithEarnedStatus.length;
  const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-md bg-gradient-to-br from-[#E8927C] to-[#E58066]"
          animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Award className="w-10 h-10 text-white" />
        </motion.div>
        <h1
          className="text-3xl sm:text-4xl font-black text-[#3D364A]"
          style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}
        >
          {t.challenges.badgesTitle}
        </h1>
        <p className="text-[#6E637C] text-base font-bold">{t.challenges.badgesDesc}</p>
      </div>

      {/* Premium Gamified Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-[#F2B5C8]/40 flex flex-col sm:flex-row items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, #E8927C 0%, #E58066 100%)',
        }}
      >
        {/* Glow effects */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full opacity-20 bg-white blur-xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-36 h-36 rounded-full opacity-15 bg-amber-200 blur-xl pointer-events-none" />

        {/* Circular progress with neon/pastel style */}
        <div className="relative w-28 h-28 shrink-0 z-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#FFF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
              style={{
                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))'
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {earnedCount}
            </span>
            <span className="text-xs font-bold text-white/80">/ {totalCount}</span>
          </div>
        </div>

        {/* Text and progress info */}
        <div className={`flex-1 z-10 w-full ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-black text-white text-xl">
              {child?.name} —{' '}
              <span className="text-amber-200 font-extrabold">
                {earnedCount} {dir === 'rtl' ? 'شارة مكتسبة' : 'badge(s) obtenu(s)'}
              </span>
            </h3>
          </div>
          <p className="text-sm text-white/90 font-bold mb-4 leading-relaxed">
            {dir === 'rtl'
              ? `رائع! لقد أنجزت ${progressPercent}% من رحلة جمع الشارات. تابع الدروس والتمارين لتكسب الباقي!`
              : `Super ! Tu as accompli ${progressPercent}% de ta collection de badges. Continue à apprendre pour tous les débloquer !`}
          </p>
          
          <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden border border-white/10 p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-200 to-white relative shadow-xs"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>

        {child && (
          <div className="flex items-center gap-2.5 bg-white/20 border border-white/30 px-5 py-3 rounded-2xl shrink-0 z-10 backdrop-blur-sm self-stretch justify-center sm:self-center shadow-inner">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
            <div className="text-center">
              <span className="text-base font-black text-white block leading-none">{child.stars}</span>
              <span className="text-xs font-bold text-white/80 mt-1 block">
                {dir === 'rtl' ? 'نجوم' : 'Étoiles'}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Badges Grid */}
      {totalCount === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-[#F2DDD0] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto border border-[#F2DDD0]">
            <Award className="w-8 h-8 text-[#A49AA7]" />
          </div>
          <p className="text-[#6E637C] font-bold text-base">
            {dir === 'rtl' ? 'لا توجد شارات بعد' : 'Aucun badge disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {badgesWithEarnedStatus.map((b, idx) => {
            const BadgeIcon = badgeIconMap[b.iconUrl] || Award;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={{ opacity: b.earned ? 1 : 0.65, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.06, type: 'spring', stiffness: 260 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300"
                style={{
                  background: b.earned ? '#EEF6F3' : 'white',
                  border: `2px solid ${b.earned ? '#95C5B2' : '#F2DDD0'}`,
                  boxShadow: b.earned ? '0 10px 24px rgba(149, 197, 178, 0.15)' : '0 4px 16px rgba(0,0,0,0.02)',
                }}
              >
                {/* Lock icon for unearned */}
                {!b.earned && (
                  <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} text-[#A49AA7] bg-[#FAF8F5] border border-[#F2DDD0] p-1.5 rounded-xl`}>
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {/* Earned sparkle effect */}
                {b.earned && (
                  <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-[#FEF8EC] p-1.5 rounded-xl border border-[#F6E3B8]`}>
                    <Sparkles className="w-4 h-4 text-[#D4A75E] animate-pulse" />
                  </div>
                )}

                {/* Badge icon circle */}
                <div
                  className="w-18 h-18 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-300"
                  style={{
                    background: b.earned
                      ? 'linear-gradient(135deg, #E8927C, #F5C26B)'
                      : '#F5F0EB',
                  }}
                >
                  <BadgeIcon
                    className="w-8 h-8"
                    style={{ color: b.earned ? 'white' : '#A49AA7' }}
                  />
                </div>

                <h3 className="font-black text-[#3D364A] text-base mb-1 leading-tight">{b.name}</h3>
                <p className="text-xs text-[#6E637C] max-w-[220px] leading-relaxed mb-4 font-semibold">
                  {b.description}
                </p>

                {b.earned ? (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-black px-4 py-1.5 rounded-2xl flex items-center gap-1.5 mt-auto bg-white border border-[#95C5B2] text-[#2D6A53] shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4 text-[#2D6A53]" />
                    {dir === 'rtl' ? 'مكتسبة' : 'Obtenu'}
                  </motion.span>
                ) : (
                  <span
                    className="text-xs font-black px-4 py-1.5 rounded-2xl mt-auto bg-[#FAF8F5] text-[#A49AA7] border border-[#F2DDD0]"
                  >
                    {dir === 'rtl' ? '🔒 مقفلة' : '🔒 Bloqué'}
                  </span>
                )}

                {b.earnedAt && (
                  <p className="text-[10px] text-[#A49AA7] mt-2 font-bold uppercase tracking-wider">
                    {new Date(b.earnedAt).toLocaleDateString(
                      dir === 'rtl' ? 'ar-TN' : 'fr-FR',
                      { day: 'numeric', month: 'short', year: 'numeric' },
                    )}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Link to challenges */}
      <div className="text-center pt-6">
        <Link href={`/challenges?childId=${childId}`}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary px-8 py-3.5 flex items-center gap-2.5 mx-auto cursor-pointer text-xs font-black"
          >
            <Zap className="w-4 h-4" />
            <span>{dir === 'rtl' ? 'الانتقال إلى التحديات اليومية' : 'Accéder aux Défis du Jour'}</span>
          </motion.button>
        </Link>
      </div>

    </div>
  );
}

export default function BadgesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <BadgesContent />
    </Suspense>
  );
}
