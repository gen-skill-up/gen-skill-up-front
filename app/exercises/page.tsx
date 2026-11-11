'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { exercisesApi, childrenApi, lessonsApi, authApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Brain,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Home,
  MessageCircle,
  Globe,
  Award,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Compass,
  Star,
  BookmarkCheck,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  Video,
  X,
  Crown
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExerciseDetail {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  subject: string;
  completed: boolean;
  isAdapted: boolean;
  isMandatory?: boolean;
  isPremium?: boolean;
}

interface LessonExercise {
  id: string;
  title: string;
  isMandatory: boolean;
  completed: boolean;
  isPremium?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  order: number;
  axis: string;
  unlocked: boolean;
  completed: boolean;
  read: boolean;
  exercises: LessonExercise[];
}

interface Child {
  id: string;
  name: string;
  level: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const subjectStyles: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
  MATHS:        { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',   gradient: 'linear-gradient(135deg,#60A5FA,#3B82F6)' },
  FRANCAIS:     { color: '#E8927C', bg: 'rgba(232,146,124,0.15)', border: 'rgba(232,146,124,0.3)', gradient: 'linear-gradient(135deg,#E8927C,#D4785F)' },
  LOGIQUE:      { color: '#7EB5D6', bg: 'rgba(126,181,214,0.15)', border: 'rgba(126,181,214,0.3)', gradient: 'linear-gradient(135deg,#7EB5D6,#5B9CC2)' },
  CULTURE:      { color: '#95C5B2', bg: 'rgba(149,197,178,0.15)', border: 'rgba(149,197,178,0.3)', gradient: 'linear-gradient(135deg,#95C5B2,#7BAEA0)' },
  ARABIC:       { color: '#C4A6D7', bg: 'rgba(196,166,215,0.18)', border: 'rgba(196,166,215,0.3)', gradient: 'linear-gradient(135deg,#C4A6D7,#B08EC7)' },
  SCIENCE:      { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  gradient: 'linear-gradient(135deg,#34D399,#10B981)' },
  ISLAMIC_CIVIC:{ color: '#F0C987', bg: 'rgba(240,201,135,0.2)',  border: 'rgba(240,201,135,0.4)', gradient: 'linear-gradient(135deg,#F0C987,#E5B365)' },
  ENGLISH:      { color: '#F2B5C8', bg: 'rgba(242,181,200,0.2)',  border: 'rgba(242,181,200,0.4)', gradient: 'linear-gradient(135deg,#F2B5C8,#E89CB3)' },
  SOCIALS:      { color: '#95C5B2', bg: 'rgba(149,197,178,0.15)', border: 'rgba(149,197,178,0.3)', gradient: 'linear-gradient(135deg,#95C5B2,#76A798)' },
};

// Video exercises list
const videoExercisesList = [
  {
    id: 'vid-math-1',
    title: 'تمرين الجمع الحسابي والعد السريع',
    titleFr: 'Exercice Vidéo : Calcul Mental & Addition',
    subject: 'MATHS',
    duration: '3:45',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/embed/videoseries?list=PLb0zKSynM2PAeEecVf3-oKjV640ePz3hW',
    xpReward: 35,
    difficulty: 'FACILE'
  },
  {
    id: 'vid-science-1',
    title: 'تمرين دورة الماء وتبخر السحب',
    titleFr: 'Exercice Vidéo : Le Cycle de l\'Eau',
    subject: 'SCIENCE',
    duration: '4:15',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/embed/videoseries?list=PLb0zKSynM2PAeEecVf3-oKjV640ePz3hW',
    xpReward: 40,
    difficulty: 'MOYEN',
    isPremium: true
  }
];

function getSubjectLabel(subj: string, t: any): string {
  if (subj === 'MATHS') return t.lessons.math;
  if (subj === 'FRANCAIS') return t.lessons.french;
  if (subj === 'LOGIQUE') return t.lessons.logic;
  if (subj === 'CULTURE') return t.lessons.culture;
  if (subj === 'ARABIC') return t.lessons.arabic;
  if (subj === 'SCIENCE') return t.lessons.science;
  if (subj === 'ISLAMIC_CIVIC') return t.lessons.islamicCivic;
  if (subj === 'ENGLISH') return t.lessons.english;
  if (subj === 'SOCIALS') return t.lessons.socials;
  return subj;
}

function ExercisesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exerciseDetailsMap, setExerciseDetailsMap] = useState<Record<string, ExerciseDetail>>({});
  const [aiExercises, setAiExercises] = useState<ExerciseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('MATHS');
  const [expandedAxes, setExpandedAxes] = useState<Set<string>>(new Set());
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [premiumModalExercise, setPremiumModalExercise] = useState<any | null>(null);
  const [togglingPremium, setTogglingPremium] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setIsUserPremium(!!u.isPremium);
        } catch (e) {}
      }
    }
    authApi.profile()
      .then((res) => {
        if (res.data) {
          setIsUserPremium(!!res.data.isPremium);
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              u.isPremium = res.data.isPremium;
              u.plan = res.data.plan;
              localStorage.setItem('user', JSON.stringify(u));
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleDemoPremium = async () => {
    setTogglingPremium(true);
    try {
      const res = await authApi.upgradePremium();
      const updated = res.data;
      setIsUserPremium(!!updated.isPremium);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          u.isPremium = updated.isPremium;
          u.plan = updated.plan;
          localStorage.setItem('user', JSON.stringify(u));
        } catch (e) {}
      }
      if (updated.isPremium) {
        setPremiumModalExercise(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingPremium(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      if (id) {
        setChildId(id);
        localStorage.setItem('activeChildId', id);
      } else {
        childrenApi
          .list()
          .then((res) => {
            if (res.data && res.data.length > 0) {
              const detected = res.data[0].id;
              setChildId(detected);
              localStorage.setItem('activeChildId', detected);
            } else {
              setLoading(false);
            }
          })
          .catch(() => setLoading(false));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!childId) return;

    Promise.all([
      childrenApi.get(childId),
      lessonsApi.list(childId),
      exercisesApi.list(childId),
    ])
      .then(([childRes, lessonsRes, exercisesRes]) => {
        setChild(childRes.data);
        setLessons(lessonsRes.data);

        const map: Record<string, ExerciseDetail> = {};
        const ai: ExerciseDetail[] = [];
        (exercisesRes.data as ExerciseDetail[]).forEach((ex) => {
          map[ex.id] = ex;
          if (ex.isAdapted) ai.push(ex);
        });
        setExerciseDetailsMap(map);
        setAiExercises(ai);

        const firstSubject = lessonsRes.data[0]?.subject;
        if (firstSubject) setSelectedSubject(firstSubject);
      })
      .catch((err) => {
        console.error(err);
        if (typeof window !== 'undefined') localStorage.removeItem('activeChildId');
        router.push('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [childId, router]);

  const handleGenerateCustom = async () => {
    if (!childId) return;
    setGenerating(true);
    try {
      const res = await exercisesApi.generateCustom(childId, selectedSubject);
      router.push(`/exercises/${res.data.id}?childId=${childId}`);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const toggleAxis = (axisKey: string) => {
    setExpandedAxes((prev) => {
      const next = new Set(prev);
      if (next.has(axisKey)) next.delete(axisKey);
      else next.add(axisKey);
      return next;
    });
  };

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#FDF8F3]">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#FDE1D6] border-2 border-[#E8927C]"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <HelpCircle className="w-10 h-10 text-[#D4785F]" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-black mb-2 text-[#3D364A]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
          {dir === 'rtl' ? 'الرجاء اختيار طفل أولاً' : 'Veuillez sélectionner un enfant'}
        </h2>
        <p className="text-[#6E647D] text-sm sm:text-base mb-8 max-w-sm font-semibold">
          {dir === 'rtl' ? 'يجب اختيار ملف الطفل من لوحة التحكم لعرض التمارين.' : 'Veuillez choisir un profil pour voir les exercices.'}
        </p>
        <Link href="/dashboard">
          <button className="btn-primary flex items-center gap-2 cursor-pointer">
            <Home className="w-5 h-5" />
            <span>{t.placementTest.goToDashboard}</span>
          </button>
        </Link>
      </div>
    );
  }

  if (loading || generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3]">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#E8927C]" />
        {generating && (
          <p className="text-[#6E647D] text-base font-bold animate-pulse">{t.exercises.generating}</p>
        )}
      </div>
    );
  }

  const availableSubjects = Array.from(new Set(lessons.map((l) => l.subject)));

  const subjectsList = [
    { id: 'MATHS',         label: t.lessons.math,        icon: Brain,         color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { id: 'FRANCAIS',      label: t.lessons.french,      icon: MessageCircle, color: '#E8927C', bg: 'rgba(232,146,124,0.15)' },
    { id: 'ARABIC',        label: t.lessons.arabic,      icon: BookOpen,      color: '#C4A6D7', bg: 'rgba(196,166,215,0.18)' },
    { id: 'SCIENCE',       label: t.lessons.science,     icon: Compass,       color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { id: 'ENGLISH',       label: t.lessons.english,     icon: Globe,         color: '#F2B5C8', bg: 'rgba(242,181,200,0.2)' },
    { id: 'SOCIALS',       label: t.lessons.socials,     icon: BookmarkCheck, color: '#95C5B2', bg: 'rgba(149,197,178,0.15)' },
    { id: 'LOGIQUE',       label: t.lessons.logic,       icon: HelpCircle,    color: '#7EB5D6', bg: 'rgba(126,181,214,0.15)' },
    { id: 'CULTURE',       label: t.lessons.culture,     icon: Globe,         color: '#95C5B2', bg: 'rgba(149,197,178,0.15)' },
    { id: 'ISLAMIC_CIVIC', label: t.lessons.islamicCivic,icon: Star,          color: '#F0C987', bg: 'rgba(240,201,135,0.2)' },
  ].filter((s) => availableSubjects.includes(s.id));

  const subjectLessons = lessons
    .filter((l) => l.subject === selectedSubject)
    .sort((a, b) => a.order - b.order);

  const axisGroupMap: Record<string, { axisName: string; lessons: Lesson[] }> = {};
  subjectLessons.forEach((lesson) => {
    const axisKey = lesson.axis || 'general';
    if (!axisGroupMap[axisKey]) {
      axisGroupMap[axisKey] = { axisName: lesson.axis || '', lessons: [] };
    }
    axisGroupMap[axisKey].lessons.push(lesson);
  });
  const axisGroups = Object.entries(axisGroupMap);

  const subjectAiExercises = aiExercises.filter((ex) => ex.subject === selectedSubject);

  const countExercisesForSubject = (subjectId: string) => {
    return lessons
      .filter((l) => l.subject === subjectId)
      .reduce((sum, l) => sum + l.exercises.length, 0);
  };

  const activeStyles = subjectStyles[selectedSubject] || subjectStyles.MATHS;

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs"
            style={{ background: 'linear-gradient(135deg, #FDDECF, #F2B5C8)' }}
          >
            <Zap className="w-6 h-6 text-[#D4785F]" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black text-[#3D364A]"
              style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}
            >
              {t.exercises.title}
            </h1>
            <p className="text-[#6E647D] text-sm sm:text-base font-bold">{t.exercises.subtitle}</p>
          </div>
        </div>

        <div className={`flex items-center gap-2.5 flex-wrap ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Premium Status Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-xs transition-all ${
              isUserPremium
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 border border-amber-300 ring-2 ring-amber-300/30'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${isUserPremium ? 'text-amber-900 fill-amber-900' : 'text-emerald-700'}`} />
            <span>{isUserPremium ? (dir === 'rtl' ? '👑 عضوية بريميوم' : '👑 Membre Premium') : (dir === 'rtl' ? '🌱 باقة مجانية' : '🌱 Forfait Gratuit')}</span>
            <button
              type="button"
              onClick={handleToggleDemoPremium}
              disabled={togglingPremium}
              className="text-[10px] underline ml-1 cursor-pointer opacity-75 hover:opacity-100 font-extrabold"
            >
              {isUserPremium
                ? (dir === 'rtl' ? '(تجريبي: تحويل لمجاني)' : '(Démo: Gratuit)')
                : (dir === 'rtl' ? '(تجربة بريميوم ⚡)' : '(Démo: Premium ⚡)')}
            </button>
          </div>

          {child && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8927C]/25 text-xs font-black text-[#3D364A] shadow-xs">
              <span>{dir === 'rtl' ? 'ملف التلميذ:' : 'Profil :'}</span>
              <span className="text-[#E8927C]">{child.name}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Featured Video Exercises Section (Contenu: تمرين أو اثنين مع فيديوهات) ── */}
      <div className="rounded-[2.2rem] bg-white p-6 border border-[#E8927C]/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8927C]/15 text-[#E8927C] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                {dir === 'rtl' ? 'تمارين تفاعلية بالفيديو 🎬' : 'Exercices Vidéo Interactifs 🎬'}
              </h2>
              <p className="text-xs font-bold text-[#6E647D]">
                {dir === 'rtl' ? 'شاهد الشرح بالفيديو ثم حل التمارين التفاعلية لتربح نقاطاً مضاعفة' : 'Regardez la vidéo puis répondez au quiz pour gagner des points !'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#E8927C]/15 text-[#D4785F]">
            {dir === 'rtl' ? 'جديد 🌟' : 'Nouveau 🌟'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {videoExercisesList.map(vid => {
            const isVidLocked = vid.isPremium && !isUserPremium;
            const handleVideoClick = () => {
              if (isVidLocked) {
                setPremiumModalExercise(vid);
              } else {
                setActiveVideoModal(vid);
              }
            };

            return (
              <div 
                key={vid.id}
                className={`rounded-3xl p-4 border shadow-xs flex flex-col sm:flex-row items-center gap-4 transition-all ${
                  isVidLocked
                    ? 'border-amber-300/80 bg-gradient-to-r from-[#FFFBF2] to-amber-50/40 ring-1 ring-amber-300/30'
                    : 'border-[#F2ECE5] bg-[#FFFBF7]'
                }`}
              >
                <div 
                  onClick={handleVideoClick}
                  className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden relative group cursor-pointer shrink-0 shadow-xs"
                >
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md ${
                      isVidLocked ? 'bg-amber-400 text-slate-900' : 'bg-white text-[#E8927C]'
                    }`}>
                      {isVidLocked ? <Crown className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-[#E8927C] ml-0.5" />}
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    {vid.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-start">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                    {vid.isPremium && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 shadow-xs">
                        👑 بريميوم
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E8927C]/15 text-[#D4785F]">
                      +{vid.xpReward} XP
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F5EDE4] text-[#6E647D]">
                      {vid.difficulty}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-[#3D364A] leading-snug line-clamp-2">
                    {dir === 'rtl' ? vid.title : vid.titleFr}
                  </h3>
                  <button
                    onClick={handleVideoClick}
                    className={`text-xs py-2 px-4 rounded-xl cursor-pointer font-black flex items-center justify-center gap-1.5 ${
                      isVidLocked
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:shadow-md'
                        : 'btn-primary'
                    }`}
                  >
                    {isVidLocked ? <Crown className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span className="mx-1">{isVidLocked ? (dir === 'rtl' ? 'فتح مع بريميوم' : 'Débloquer Premium') : (dir === 'rtl' ? 'مشاهدة وبدء التمرين' : 'Regarder & Jouer')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two-column layout: Subject sidebar + Main content ── */}
      <div className={`flex flex-col lg:flex-row gap-6 ${dir === 'rtl' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

        {/* ── Subject Sidebar ── */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8927C]/20 shadow-xs sticky top-8 space-y-3">
            <h2
              className={`text-xs font-black text-[#8B7E9B] uppercase tracking-wider ${
                dir === 'rtl' ? 'text-right' : 'text-left'
              }`}
            >
              {dir === 'rtl' ? 'المواد الدراسية' : 'Matières scolaires'}
            </h2>
            <div className="flex flex-col gap-2">
              {subjectsList.map((sub) => {
                const isSelected = selectedSubject === sub.id;
                const SubIcon = sub.icon;
                const count = countExercisesForSubject(sub.id);
                return (
                  <motion.button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-black cursor-pointer transition-all ${
                      isSelected
                        ? 'text-white shadow-md'
                        : 'bg-[#FDF8F3] text-[#4A4458] hover:bg-[#F7EFE7]'
                    } ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
                    style={isSelected ? { background: activeStyles.gradient } : {}}
                  >
                    <div className={`flex items-center gap-2.5 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: isSelected ? 'rgba(255,255,255,0.25)' : sub.bg }}
                      >
                        <SubIcon className="w-4.5 h-4.5" style={{ color: isSelected ? 'white' : sub.color }} />
                      </div>
                      <span className="leading-tight">{sub.label}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                        isSelected ? 'bg-white/30 text-white' : 'bg-[#EFE5DB] text-[#6E647D]'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Main Exercises Content ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── AI Generator Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.2rem] p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FDDECF 0%, #F5ECE3 100%)',
              border: '2px solid rgba(232, 146, 124, 0.25)',
              boxShadow: '0 8px 24px rgba(232, 146, 124, 0.1)',
            }}
          >
            <div
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                dir === 'rtl' ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/80 text-[#D4785F] border border-[#E8927C]/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E8927C]" />
                  <span>{dir === 'rtl' ? 'ذكاء اصطناعي تكيفي' : 'IA Adaptative'}</span>
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#3D364A]">{t.exercises.generateCustom}</h2>
                <p className="text-[#6E647D] text-xs sm:text-sm font-bold">{t.exercises.customDesc}</p>
              </div>
              <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-xs sm:text-sm font-black text-[#4A4458] bg-white border border-[#E8927C]/20 px-3.5 py-2 rounded-xl shadow-xs">
                  {getSubjectLabel(selectedSubject, t)}
                </span>
                <button
                  onClick={handleGenerateCustom}
                  className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.exercises.startBtn}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Axis Groups ── */}
          {axisGroups.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#E8927C]/30">
              <h3 className="text-base font-black text-[#6E647D]">
                {dir === 'rtl' ? 'لا توجد تمارين متاحة في هذه المادة حالياً' : 'Aucun exercice disponible dans cette matière'}
              </h3>
            </div>
          ) : (
            axisGroups.map(([axisKey, axisGroup], axisIdx) => {
              const axisHasUnlocked = axisGroup.lessons.some((l) => l.unlocked);
              const isExpanded = expandedAxes.has(axisKey);
              const totalExercises = axisGroup.lessons.reduce((s, l) => s + l.exercises.length, 0);
              const completedExercises = axisGroup.lessons.reduce(
                (s, l) => s + l.exercises.filter((e) => e.completed).length,
                0
              );
              const axisLabel = axisGroup.axisName || (dir === 'rtl' ? `المحور ${axisIdx + 1}` : `Axe ${axisIdx + 1}`);

              return (
                <motion.div
                  key={axisKey}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: axisIdx * 0.05 }}
                  className="rounded-[2rem] overflow-hidden border border-[#E8927C]/20 shadow-xs bg-white"
                >
                  {/* Axis Header */}
                  <button
                    onClick={() => toggleAxis(axisKey)}
                    className={`w-full px-6 py-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-[#FDF8F3] ${
                      dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                    }`}
                  >
                    <div className={`flex items-center gap-3.5 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: axisHasUnlocked ? activeStyles.bg : '#F5EDE4' }}
                      >
                        <Layers className="w-5 h-5" style={{ color: axisHasUnlocked ? activeStyles.color : '#A396B5' }} />
                      </div>
                      <div>
                        <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-base font-black text-[#3D364A] leading-tight">{axisLabel}</span>
                          {!axisHasUnlocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#6E647D] bg-[#F5EDE4] px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              {dir === 'rtl' ? 'مقفل' : 'Verrouillé'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6E647D] font-bold mt-0.5">
                          {axisGroup.lessons.length} {dir === 'rtl' ? 'دروس' : 'leçons'} · {totalExercises} {dir === 'rtl' ? 'تمارين' : 'exercices'}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-[#F5EDE4] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0}%`,
                              background: activeStyles.gradient,
                            }}
                          />
                        </div>
                        <span className="text-xs font-black text-[#6E647D]">
                          {completedExercises}/{totalExercises}
                        </span>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: isExpanded ? activeStyles.bg : '#F5EDE4' }}
                      >
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" style={{ color: activeStyles.color }} />
                          : <ChevronDown className="w-4 h-4 text-[#6E647D]" />}
                      </div>
                    </div>
                  </button>

                  {/* Axis Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-6 border-t border-[#F2ECE5] pt-4">
                          {axisGroup.lessons.map((lesson) => {
                            const lessonStyles = subjectStyles[lesson.subject] || activeStyles;
                            const lessonCompleted = lesson.completed;

                            return (
                              <div key={lesson.id} className="space-y-3">
                                <div
                                  className={`flex items-center gap-2.5 ${
                                    dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                                  }`}
                                >
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                                    style={{
                                      background: lesson.unlocked ? lessonStyles.gradient : '#E0D7CD',
                                      color: lesson.unlocked ? 'white' : '#8E8378',
                                    }}
                                  >
                                    {lesson.order}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className={`text-sm font-black truncate ${
                                        lesson.unlocked ? 'text-[#3D364A]' : 'text-[#A396B5]'
                                      }`}
                                    >
                                      {lesson.title}
                                    </span>
                                  </div>
                                  {lessonCompleted && (
                                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#D9EFE6] text-[#2D6652]">
                                      <CheckCircle className="w-3 h-3" />
                                      {t.lessons.completed}
                                    </span>
                                  )}
                                  {!lesson.unlocked && (
                                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black text-[#6E647D] bg-[#F5EDE4] px-2.5 py-0.5 rounded-full">
                                      <Lock className="w-3 h-3" />
                                      {dir === 'rtl' ? 'مقفل' : 'Verrouillé'}
                                    </span>
                                  )}
                                </div>

                                {lesson.exercises.length === 0 ? (
                                  <p className={`text-xs text-[#6E647D] font-bold italic ${dir === 'rtl' ? 'text-right' : 'text-left'} px-2`}>
                                    {dir === 'rtl' ? 'لا توجد تمارين لهذا الدرس' : 'Aucun exercice pour cette leçon'}
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-9 pr-9">
                                    {lesson.exercises.map((ex, exIdx) => {
                                      const detail = exerciseDetailsMap[ex.id];
                                      const isUnlocked = lesson.unlocked;
                                      const isPremiumEx = ex.isPremium || detail?.isPremium || detail?.difficulty === 'DIFFICILE';
                                      const isLockedByPremium = isPremiumEx && !isUserPremium;

                                      const handleCardClick = () => {
                                        if (isLockedByPremium) {
                                          setPremiumModalExercise({ ...ex, ...detail, title: ex.title });
                                        }
                                      };

                                      const cardContent = (
                                        <motion.div
                                          initial={{ opacity: 0, y: 6 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: exIdx * 0.04 }}
                                          onClick={handleCardClick}
                                          className={`rounded-2xl p-4 flex items-center gap-3 transition-all ${
                                            isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                          } ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                                          style={{
                                            background: ex.completed
                                              ? '#F5FBF8'
                                              : isLockedByPremium
                                              ? '#FFFDF9'
                                              : isUnlocked
                                              ? 'white'
                                              : '#F8F4F0',
                                            border: `1.5px solid ${
                                              ex.completed
                                                ? '#95C5B2'
                                                : isLockedByPremium
                                                ? '#F6D896'
                                                : isUnlocked
                                                ? '#E8927C30'
                                                : '#E0D7CD'
                                            }`,
                                            boxShadow: isLockedByPremium
                                              ? '0 4px 14px rgba(245,158,11,0.08)'
                                              : isUnlocked
                                              ? '0 2px 10px rgba(0,0,0,0.03)'
                                              : 'none',
                                          }}
                                          whileHover={
                                            isUnlocked
                                              ? {
                                                  y: -2,
                                                  borderColor: isLockedByPremium ? '#F59E0B' : lessonStyles.color,
                                                  boxShadow: isLockedByPremium
                                                    ? '0 8px 24px rgba(245,158,11,0.18)'
                                                    : `0 6px 20px ${lessonStyles.bg}`,
                                                }
                                              : {}
                                          }
                                        >
                                          <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                                            style={{
                                              background: isLockedByPremium
                                                ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                                                : isUnlocked
                                                ? lessonStyles.bg
                                                : '#E0D7CD',
                                            }}
                                          >
                                            {isLockedByPremium ? (
                                              <Crown className="w-5 h-5 text-amber-700 fill-amber-400" />
                                            ) : isUnlocked ? (
                                              ex.isMandatory ? (
                                                <Target className="w-5 h-5" style={{ color: lessonStyles.color }} />
                                              ) : (
                                                <Zap className="w-5 h-5" style={{ color: lessonStyles.color }} />
                                              )
                                            ) : (
                                              <Lock className="w-4 h-4 text-[#A396B5]" />
                                            )}
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div className={`flex items-center gap-1.5 flex-wrap ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                                              <h3 className={`font-black text-sm truncate ${isUnlocked ? 'text-[#3D364A]' : 'text-[#A396B5]'}`}>
                                                {ex.title}
                                              </h3>
                                              {isPremiumEx && (
                                                <span
                                                  className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full ${
                                                    isUserPremium
                                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 shadow-2xs'
                                                  }`}
                                                >
                                                  {isUserPremium ? t.exercises.premiumUnlocked : t.exercises.premiumBadge}
                                                </span>
                                              )}
                                              {ex.isMandatory && (
                                                <span
                                                  className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full"
                                                  style={{ background: lessonStyles.bg, color: lessonStyles.color, border: `1px solid ${lessonStyles.border}` }}
                                                >
                                                  {dir === 'rtl' ? 'إلزامي' : 'Obligatoire'}
                                                </span>
                                              )}
                                            </div>
                                            {detail?.description && (
                                              <p className={`text-xs truncate font-bold mt-0.5 ${isUnlocked ? 'text-[#6E647D]' : 'text-[#A396B5]'}`}>
                                                {detail.description}
                                              </p>
                                            )}
                                          </div>

                                          {ex.completed ? (
                                            <div className="shrink-0 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#D9EFE6] text-[#2D6652]">
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span>{t.lessons.completed}</span>
                                            </div>
                                          ) : isLockedByPremium ? (
                                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-800 shadow-2xs">
                                              <Lock className="w-3.5 h-3.5" />
                                            </div>
                                          ) : isUnlocked ? (
                                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[#F2ECE5] bg-[#FDF8F3] text-[#6E647D]">
                                              {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </div>
                                          ) : (
                                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#E0D7CD] text-[#8E8378]">
                                              <Lock className="w-3.5 h-3.5" />
                                            </div>
                                          )}
                                        </motion.div>
                                      );

                                      if (isLockedByPremium) {
                                        return <div key={ex.id}>{cardContent}</div>;
                                      }

                                      return isUnlocked ? (
                                        <Link key={ex.id} href={`/exercises/${ex.id}?childId=${childId}`}>
                                          {cardContent}
                                        </Link>
                                      ) : (
                                        <div key={ex.id}>{cardContent}</div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}

          {/* ── AI Adapted Exercises ── */}
          {subjectAiExercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] overflow-hidden border border-[#C4A6D7]/30 shadow-xs bg-white"
            >
              <div
                className={`px-6 py-4 flex items-center gap-3 border-b border-[#F5F0FA] ${
                  dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                }`}
                style={{ background: 'rgba(196,166,215,0.1)' }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#C4A6D7]/20 text-[#8B6DA4]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#3D364A]">
                    {dir === 'rtl' ? 'تمارين الذكاء الاصطناعي التكيفية' : 'Exercices IA Adaptatifs'}
                  </h3>
                  <p className="text-xs text-[#6E647D] font-bold">
                    {subjectAiExercises.length} {dir === 'rtl' ? 'تمارين مخصصة لمستواك' : 'exercices adaptés'}
                  </p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {subjectAiExercises.map((ex, idx) => (
                  <Link key={ex.id} href={`/exercises/${ex.id}?childId=${childId}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-2xl p-4 flex items-center gap-3 cursor-pointer bg-white border border-[#C4A6D7]/30 shadow-xs hover:shadow-md transition-all ${
                        dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                      }`}
                      whileHover={{ y: -2 }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#C4A6D7]/20 text-[#8B6DA4]">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-[#3D364A] truncate">{ex.title}</h4>
                        {ex.description && (
                          <p className="text-xs text-[#6E647D] font-bold truncate mt-0.5">{ex.description}</p>
                        )}
                      </div>
                      {ex.completed ? (
                        <div className="shrink-0 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#D9EFE6] text-[#2D6652]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t.lessons.completed}</span>
                        </div>
                      ) : (
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[#F2ECE5] bg-[#FDF8F3] text-[#6E647D]">
                          {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* ── Video Player Modal ── */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-[#F2ECE5]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-[#FDF8F3] border-b border-[#F2ECE5] flex items-center justify-between">
                <h4 className="font-black text-sm sm:text-base text-[#3D364A]">
                  {dir === 'rtl' ? activeVideoModal.title : activeVideoModal.titleFr}
                </h4>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 rounded-full bg-white border border-[#E8DDD2] text-[#6E647D] hover:bg-[#F2ECE5] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-video bg-black relative">
                <iframe
                  className="w-full h-full"
                  src={activeVideoModal.videoUrl}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 flex items-center justify-between bg-white">
                <span className="text-xs font-black text-[#E8927C] bg-[#FDE1D6] px-3 py-1 rounded-full">
                  +{activeVideoModal.xpReward} XP
                </span>
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="btn-primary text-xs sm:text-sm py-2 px-5 rounded-xl cursor-pointer"
                >
                  {dir === 'rtl' ? 'بدء الأسئلة التطبيقية ✍️' : 'Commencer le quiz ✍️'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Premium Upgrade Modal ── */}
      <AnimatePresence>
        {premiumModalExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={() => setPremiumModalExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-300 relative overflow-hidden text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative glows */}
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 opacity-20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 opacity-20 blur-2xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setPremiumModalExercise(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 mx-auto flex items-center justify-center shadow-lg shadow-amber-400/30 mb-4 animate-bounce">
                <Crown className="w-9 h-9 fill-current" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
                {t.exercises.premiumBadge}
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                {t.exercises.premiumModalTitle}
              </h3>

              <div className="my-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs font-bold text-amber-900">
                <span>{premiumModalExercise.title}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#6E647D] font-medium leading-relaxed mb-5">
                {t.exercises.premiumModalDesc}
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 text-start space-y-2 mb-6 border border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {t.exercises.premiumPerksTitle}
                </p>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{t.exercises.premiumPerk1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>{t.exercises.premiumPerk2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{t.exercises.premiumPerk3}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t.exercises.premiumPerk4}</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link href="/#pricing" onClick={() => setPremiumModalExercise(null)}>
                  <button className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-900 font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                    <span>{t.exercises.upgradeBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={handleToggleDemoPremium}
                  disabled={togglingPremium}
                  className="w-full py-2.5 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer border border-purple-200 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.exercises.testPremiumBtn}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8927C]" />
      </div>
    }>
      <ExercisesContent />
    </Suspense>
  );
}
