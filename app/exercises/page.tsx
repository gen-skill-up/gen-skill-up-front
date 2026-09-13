'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { exercisesApi, childrenApi, lessonsApi } from '@/lib/api';
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
}

interface LessonExercise {
  id: string;
  title: string;
  isMandatory: boolean;
  completed: boolean;
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

const subjectIcons: Record<string, any> = {
  MATHS: Brain,
  FRANCAIS: MessageCircle,
  LOGIQUE: HelpCircle,
  CULTURE: Globe,
  ARABIC: BookOpen,
  SCIENCE: Compass,
  ISLAMIC_CIVIC: Star,
  ENGLISH: Globe,
  SOCIALS: BookmarkCheck,
};

const subjectStyles: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
  MATHS:        { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)',   gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' },
  FRANCAIS:     { color: '#FF8C42', bg: 'rgba(255,140,66,0.1)',   border: 'rgba(255,140,66,0.25)',   gradient: 'linear-gradient(135deg,#FF8C42,#EA580C)' },
  LOGIQUE:      { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.25)',   gradient: 'linear-gradient(135deg,#60A5FA,#2563EB)' },
  CULTURE:      { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)',   gradient: 'linear-gradient(135deg,#4ADE80,#16A34A)' },
  ARABIC:       { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',   border: 'rgba(124,58,237,0.25)',   gradient: 'linear-gradient(135deg,#7C3AED,#5B21B6)' },
  SCIENCE:      { color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)',   gradient: 'linear-gradient(135deg,#10B981,#047857)' },
  ISLAMIC_CIVIC:{ color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',   gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  ENGLISH:      { color: '#EC4899', bg: 'rgba(236,72,153,0.1)',   border: 'rgba(236,72,153,0.25)',   gradient: 'linear-gradient(135deg,#EC4899,#BE185D)' },
  SOCIALS:      { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)',   gradient: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Main component ──────────────────────────────────────────────────────────

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

  // ── Load childId ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
      if (id) localStorage.setItem('activeChildId', id);
    }
  }, [searchParams]);

  // ── Load data ───────────────────────────────────────────────────────────────
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

        // Build a map of exercise details (id → full detail)
        const map: Record<string, ExerciseDetail> = {};
        const ai: ExerciseDetail[] = [];
        (exercisesRes.data as ExerciseDetail[]).forEach((ex) => {
          map[ex.id] = ex;
          if (ex.isAdapted) ai.push(ex);
        });
        setExerciseDetailsMap(map);
        setAiExercises(ai);

        // Determine which subjects have lessons
        const firstSubject = lessonsRes.data[0]?.subject;
        if (firstSubject) setSelectedSubject(firstSubject);
      })
      .catch((err) => {
        console.error(err);
        if (typeof window !== 'undefined') localStorage.removeItem('activeChildId');
        router.push('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [childId]);

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

  // ── Guard states ────────────────────────────────────────────────────────────
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
          الرجاء اختيار طفل أولاً / Please Select a Child
        </h2>
        <p className="text-slate-500 text-sm mb-8 max-w-sm font-semibold">
          يجب اختيار ملف الطفل من لوحة التحكم لعرض التمارين.
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-primary)]" />
        {generating && (
          <p className="text-slate-500 text-sm font-semibold animate-pulse">{t.exercises.generating}</p>
        )}
      </div>
    );
  }

  // ── Derived data: subjects that have lessons ──────────────────────────────
  const availableSubjects = Array.from(new Set(lessons.map((l) => l.subject)));

  const subjectsList = [
    { id: 'MATHS',         label: t.lessons.math,        icon: Brain,         color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { id: 'FRANCAIS',      label: t.lessons.french,      icon: MessageCircle, color: '#FF8C42', bg: 'rgba(255,140,66,0.1)' },
    { id: 'ARABIC',        label: t.lessons.arabic,      icon: BookOpen,      color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    { id: 'SCIENCE',       label: t.lessons.science,     icon: Compass,       color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { id: 'ENGLISH',       label: t.lessons.english,     icon: Globe,         color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
    { id: 'SOCIALS',       label: t.lessons.socials,     icon: BookmarkCheck, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { id: 'LOGIQUE',       label: t.lessons.logic,       icon: HelpCircle,    color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
    { id: 'CULTURE',       label: t.lessons.culture,     icon: Globe,         color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
    { id: 'ISLAMIC_CIVIC', label: t.lessons.islamicCivic,icon: Star,          color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ].filter((s) => availableSubjects.includes(s.id));

  // ── Build axis groups for the selected subject ───────────────────────────
  // Only lessons of selected subject, sorted by order
  const subjectLessons = lessons
    .filter((l) => l.subject === selectedSubject)
    .sort((a, b) => a.order - b.order);

  // Group by axis, preserving lesson order within each axis
  const axisGroupMap: Record<string, { axisName: string; lessons: Lesson[] }> = {};
  subjectLessons.forEach((lesson) => {
    const axisKey = lesson.axis || 'general';
    if (!axisGroupMap[axisKey]) {
      axisGroupMap[axisKey] = { axisName: lesson.axis || '', lessons: [] };
    }
    axisGroupMap[axisKey].lessons.push(lesson);
  });
  const axisGroups = Object.entries(axisGroupMap);

  // AI exercises for selected subject
  const subjectAiExercises = aiExercises.filter((ex) => ex.subject === selectedSubject);

  // Count for badge on subject button
  const countExercisesForSubject = (subjectId: string) => {
    return lessons
      .filter((l) => l.subject === subjectId)
      .reduce((sum, l) => sum + l.exercises.length, 0);
  };

  const activeStyles = subjectStyles[selectedSubject] || subjectStyles.MATHS;

  return (
    <div className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-6 py-8">

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
          >
            <div className={`flex items-center gap-3 mb-1 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #A855F7, #60A5FA)' }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1
                className="text-3xl font-black text-slate-800"
                style={{ fontFamily: 'Fredoka One, sans-serif' }}
              >
                {t.exercises.title}
              </h1>
            </div>
            <p className="text-[var(--color-muted)] text-sm font-semibold">{t.exercises.subtitle}</p>
          </motion.div>

          {/* ── Two-column layout: Subject sidebar + Main content ── */}
          <div className={`flex flex-col lg:flex-row gap-6 ${dir === 'rtl' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

            {/* ── Subject Sidebar ── */}
            <div className="w-full lg:w-60 shrink-0">
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-md sticky top-8">
                <h2
                  className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ${
                    dir === 'rtl' ? 'text-right' : 'text-left'
                  }`}
                >
                  {dir === 'rtl' ? 'المواد الدراسية' : 'MATIÈRES'}
                </h2>
                <div className="flex flex-col gap-1.5">
                  {subjectsList.map((sub) => {
                    const isSelected = selectedSubject === sub.id;
                    const SubIcon = sub.icon;
                    const count = countExercisesForSubject(sub.id);
                    return (
                      <motion.button
                        key={sub.id}
                        onClick={() => setSelectedSubject(sub.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-black cursor-pointer transition-all ${
                          isSelected
                            ? 'text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        } ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
                        style={isSelected ? { background: activeStyles.gradient } : {}}
                      >
                        <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: isSelected ? 'rgba(255,255,255,0.2)' : sub.bg }}
                          >
                            <SubIcon className="w-4 h-4" style={{ color: isSelected ? 'white' : sub.color }} />
                          </div>
                          <span className="leading-tight">{sub.label}</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'
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
                className="rounded-3xl p-5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(96,165,250,0.08) 100%)',
                  border: '2px solid rgba(168,85,247,0.2)',
                  boxShadow: '0 4px 24px rgba(168,85,247,0.08)',
                }}
              >
                <div
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    dir === 'rtl' ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#7E22CE', border: '1.5px solid rgba(168,85,247,0.3)' }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{dir === 'rtl' ? 'ذكاء اصطناعي تكيفي' : 'Adaptive AI'}</span>
                    </span>
                    <h2 className="text-base font-black text-slate-800">{t.exercises.generateCustom}</h2>
                    <p className="text-slate-500 text-xs font-semibold">{t.exercises.customDesc}</p>
                  </div>
                  <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs font-black text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                      {getSubjectLabel(selectedSubject, t)}
                    </span>
                    <button
                      onClick={handleGenerateCustom}
                      className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.exercises.startBtn}</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ── Axis Groups ── */}
              {axisGroups.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                  <h3 className="text-sm font-black text-slate-700">
                    {dir === 'rtl' ? 'لا توجد تمارين في هذه المادة' : 'Aucun exercice disponible dans cette matière'}
                  </h3>
                </div>
              ) : (
                axisGroups.map(([axisKey, axisGroup], axisIdx) => {
                  // Axis-level unlock: open if any lesson in it is unlocked
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
                      transition={{ delay: axisIdx * 0.07 }}
                      className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-white"
                    >
                      {/* Axis Header – clickable to expand/collapse */}
                      <button
                        onClick={() => toggleAxis(axisKey)}
                        className={`w-full px-6 py-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 ${
                          dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Axis icon */}
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: axisHasUnlocked ? activeStyles.bg : '#F1F5F9' }}
                          >
                            <Layers className="w-5 h-5" style={{ color: axisHasUnlocked ? activeStyles.color : '#94A3B8' }} />
                          </div>
                          <div>
                            <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="text-sm font-black text-slate-800 leading-tight">{axisLabel}</span>
                              {!axisHasUnlocked && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Lock className="w-2.5 h-2.5" />
                                  {dir === 'rtl' ? 'مقفل' : 'Verrouillé'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {axisGroup.lessons.length} {dir === 'rtl' ? 'دروس' : 'leçons'} · {totalExercises} {dir === 'rtl' ? 'تمارين' : 'exercices'}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Progress */}
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0}%`,
                                  background: activeStyles.gradient,
                                }}
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-400">
                              {completedExercises}/{totalExercises}
                            </span>
                          </div>
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: isExpanded ? activeStyles.bg : '#F1F5F9' }}
                          >
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4" style={{ color: activeStyles.color }} />
                              : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                      </button>

                      {/* Axis Content: lessons & exercises */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 space-y-6 border-t border-slate-100 pt-4">
                              {axisGroup.lessons.map((lesson, lessonIdx) => {
                                const lessonStyles = subjectStyles[lesson.subject] || activeStyles;
                                const lessonCompleted = lesson.completed;

                                return (
                                  <div key={lesson.id} className="space-y-3">
                                    {/* Lesson sub-header */}
                                    <div
                                      className={`flex items-center gap-2.5 ${
                                        dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                                      }`}
                                    >
                                      {/* order circle */}
                                      <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                                        style={{
                                          background: lesson.unlocked ? lessonStyles.gradient : '#E2E8F0',
                                          color: lesson.unlocked ? 'white' : '#94A3B8',
                                        }}
                                      >
                                        {lesson.order}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span
                                          className={`text-xs font-black truncate ${
                                            lesson.unlocked ? 'text-slate-700' : 'text-slate-400'
                                          }`}
                                        >
                                          {lesson.title}
                                        </span>
                                      </div>
                                      {lessonCompleted && (
                                        <span
                                          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                                          style={{ background: 'rgba(74,222,128,0.12)', color: '#16A34A', border: '1px solid rgba(74,222,128,0.3)' }}
                                        >
                                          <CheckCircle className="w-2.5 h-2.5" />
                                          {t.lessons.completed}
                                        </span>
                                      )}
                                      {!lesson.unlocked && (
                                        <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                          <Lock className="w-2.5 h-2.5" />
                                          {dir === 'rtl' ? 'مقفل' : 'Verrouillé'}
                                        </span>
                                      )}
                                    </div>

                                    {/* Exercise cards grid */}
                                    {lesson.exercises.length === 0 ? (
                                      <p className={`text-[10px] text-slate-400 font-semibold italic ${dir === 'rtl' ? 'text-right' : 'text-left'} px-2`}>
                                        {dir === 'rtl' ? 'لا توجد تمارين لهذا الدرس' : 'Aucun exercice pour cette leçon'}
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                                        {lesson.exercises.map((ex, exIdx) => {
                                          // Merge with full exercise details
                                          const detail = exerciseDetailsMap[ex.id];
                                          const isUnlocked = lesson.unlocked;

                                          const cardContent = (
                                            <motion.div
                                              initial={{ opacity: 0, y: 6 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ delay: exIdx * 0.04 }}
                                              className={`rounded-2xl p-4 flex items-center gap-3 transition-all ${
                                                isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                              } ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                                              style={{
                                                background: ex.completed
                                                  ? lessonStyles.bg.replace('0.1)', '0.06)')
                                                  : isUnlocked
                                                    ? 'white'
                                                    : '#F8FAFC',
                                                border: `1.5px solid ${
                                                  ex.completed
                                                    ? lessonStyles.border
                                                    : isUnlocked
                                                      ? 'rgba(0,0,0,0.06)'
                                                      : '#E2E8F0'
                                                }`,
                                                boxShadow: isUnlocked ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                                              }}
                                              whileHover={
                                                isUnlocked
                                                  ? { y: -2, borderColor: lessonStyles.border, boxShadow: `0 6px 20px ${lessonStyles.bg}` }
                                                  : {}
                                              }
                                            >
                                              {/* Icon */}
                                              <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: isUnlocked ? lessonStyles.bg : '#E2E8F0' }}
                                              >
                                                {isUnlocked ? (
                                                  ex.isMandatory
                                                    ? <Target className="w-4.5 h-4.5" style={{ color: lessonStyles.color }} />
                                                    : <Zap className="w-4.5 h-4.5" style={{ color: lessonStyles.color }} />
                                                ) : (
                                                  <Lock className="w-4 h-4 text-slate-400" />
                                                )}
                                              </div>

                                              {/* Text */}
                                              <div className="flex-1 min-w-0">
                                                <div className={`flex items-center gap-1.5 flex-wrap ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                  <h3 className={`font-black text-xs truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {ex.title}
                                                  </h3>
                                                  {ex.isMandatory && (
                                                    <span
                                                      className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full"
                                                      style={{ background: lessonStyles.bg, color: lessonStyles.color, border: `1px solid ${lessonStyles.border}` }}
                                                    >
                                                      {dir === 'rtl' ? 'إلزامي' : 'Obligatoire'}
                                                    </span>
                                                  )}
                                                </div>
                                                {detail?.description && (
                                                  <p className={`text-[10px] truncate font-semibold mt-0.5 ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {detail.description}
                                                  </p>
                                                )}
                                                {detail?.difficulty && (
                                                  <span
                                                    className="text-[8px] font-bold uppercase"
                                                    style={{ color: isUnlocked ? lessonStyles.color : '#94A3B8' }}
                                                  >
                                                    {(t.dashboard.levels as any)[detail.difficulty] || detail.difficulty}
                                                  </span>
                                                )}
                                              </div>

                                              {/* Right badge */}
                                              {ex.completed ? (
                                                <div
                                                  className="shrink-0 flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full"
                                                  style={{ background: 'rgba(74,222,128,0.12)', color: '#16A34A', border: '1.5px solid rgba(74,222,128,0.3)' }}
                                                >
                                                  <CheckCircle className="w-3 h-3" />
                                                  <span>{t.lessons.completed}</span>
                                                </div>
                                              ) : isUnlocked ? (
                                                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-slate-100 bg-slate-50 text-slate-500">
                                                  {dir === 'rtl'
                                                    ? <ChevronLeft className="w-3.5 h-3.5" />
                                                    : <ChevronRight className="w-3.5 h-3.5" />}
                                                </div>
                                              ) : (
                                                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                  <Lock className="w-3 h-3" />
                                                </div>
                                              )}
                                            </motion.div>
                                          );

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

              {/* ── AI / Adapted Exercises ── */}
              {subjectAiExercises.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl overflow-hidden border border-purple-100 shadow-sm bg-white"
                >
                  <div
                    className={`px-6 py-4 flex items-center gap-3 border-b border-purple-50 ${
                      dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                    }`}
                    style={{ background: 'rgba(168,85,247,0.04)' }}
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.12)' }}>
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800">
                        {dir === 'rtl' ? 'تمارين الذكاء الاصطناعي المخصصة' : 'Exercices IA Personnalisés'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {subjectAiExercises.length} {dir === 'rtl' ? 'تمارين متاحة' : 'exercices disponibles'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjectAiExercises.map((ex, idx) => (
                      <Link key={ex.id} href={`/exercises/${ex.id}?childId=${childId}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`rounded-2xl p-4 flex items-center gap-3 cursor-pointer ${
                            dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                          }`}
                          style={{
                            background: ex.completed ? 'rgba(168,85,247,0.06)' : 'white',
                            border: `1.5px solid ${ex.completed ? 'rgba(168,85,247,0.3)' : 'rgba(0,0,0,0.06)'}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                          whileHover={{ y: -2, borderColor: 'rgba(168,85,247,0.4)', boxShadow: '0 6px 20px rgba(168,85,247,0.1)' }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.12)' }}>
                            <Sparkles className="w-4.5 h-4.5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-xs text-slate-800 truncate">{ex.title}</h3>
                            {ex.description && (
                              <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{ex.description}</p>
                            )}
                            <span className="text-[8px] font-bold text-purple-600 uppercase">
                              {(t.dashboard.levels as any)[ex.difficulty] || ex.difficulty}
                            </span>
                          </div>
                          {ex.completed ? (
                            <div className="shrink-0 flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full"
                              style={{ background: 'rgba(74,222,128,0.12)', color: '#16A34A', border: '1.5px solid rgba(74,222,128,0.3)' }}>
                              <CheckCircle className="w-3 h-3" />
                              <span>{t.lessons.completed}</span>
                            </div>
                          ) : (
                            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-slate-100 bg-slate-50 text-slate-500">
                              {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
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
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <ExercisesContent />
    </Suspense>
  );
}
