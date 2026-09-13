'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { placementTestApi, childrenApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import OwlLogo from '../components/Logo';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Award,
  BookOpen,
  TrendingUp,
  Brain,
  ChevronRight,
  ChevronLeft,
  Star,
  CheckCircle,
  ThumbsUp,
  Calendar,
  AlertCircle,
  RotateCcw,
  FileText,
  X,
  Check,
  XCircle,
  HelpCircle,
  Activity,
  Zap,
  Book,
  MessageCircle,
  Compass,
  Globe,
  BookmarkCheck
} from 'lucide-react';

interface PastResult {
  id: string;
  score: number;
  level: string;
  completedAt: string;
  answers: any;
  aiAnalysis?: {
    type?: string;
    subject?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
}

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const { t, dir } = useLanguage();

  // Active Tab: 'overview' | 'exams' | 'history'
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'history'>('overview');

  // Backend States
  const [childInfo, setChildInfo] = useState<any>(null);
  const [history, setHistory] = useState<PastResult[]>([]);
  const [loadingHub, setLoadingHub] = useState(true);

  // Modal State
  const [selectedPastResult, setSelectedPastResult] = useState<PastResult | null>(null);

  // Active Quiz/Exam State
  const [activeExam, setActiveExam] = useState<{
    type: 'PLACEMENT' | 'SUBJECT';
    subject?: string;
    questions: any[];
  } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  // Load Child Details & Exam History
  const fetchHubData = async () => {
    if (!childId) return;
    try {
      const [childRes, historyRes] = await Promise.all([
        childrenApi.get(childId),
        placementTestApi.getHistory(childId),
      ]);
      setChildInfo(childRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Failed to load exams hub data:', err);
    } finally {
      setLoadingHub(false);
    }
  };

  useEffect(() => {
    if (!childId) {
      router.push('/dashboard');
      return;
    }
    setLoadingHub(true);
    fetchHubData();
  }, [childId, router]);

  // Translate levels helper
  const getLevelLabel = (lvl: string) => {
    const levelKey = lvl as 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
    return t.dashboard.levels[levelKey] || lvl;
  };

  // Translate Subject helper
  const getSubjectLabel = (subj: string) => {
    const s = subj.toUpperCase();
    if (s === 'MATHS' || s === 'MATH') return t.lessons.math;
    if (s === 'FRANCAIS' || s === 'FRENCH') return t.lessons.french;
    if (s === 'LOGIQUE' || s === 'LOGIC') return t.lessons.logic;
    if (s === 'CULTURE') return t.lessons.culture;
    if (s === 'SCIENCE') return t.lessons.science;
    if (s === 'ARABIC') return t.lessons.arabic;
    if (s === 'ISLAMIC_CIVIC') return t.lessons.islamicCivic;
    if (s === 'ENGLISH') return t.lessons.english;
    if (s === 'SOCIALS') return t.lessons.socials;
    return subj;
  };

  // Grade Subjects Config
  const gradeSubjects: Record<number, string[]> = {
    1: ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC'],
    2: ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC'],
    3: ['MATHS', 'ARABIC', 'FRANCAIS', 'SCIENCE', 'SOCIALS'],
    4: ['MATHS', 'ARABIC', 'FRANCAIS', 'SCIENCE', 'SOCIALS'],
    5: ['MATHS', 'ARABIC', 'FRANCAIS', 'ENGLISH', 'SCIENCE', 'SOCIALS'],
    6: ['MATHS', 'ARABIC', 'FRANCAIS', 'ENGLISH', 'SCIENCE', 'SOCIALS'],
  };

  // Subject Colors & Icons Config
  const subjectConfigs: Record<string, { gradient: string; text: string; bgLight: string; icon: any }> = {
    MATHS: {
      gradient: 'from-violet-500 to-indigo-600',
      text: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      icon: Brain,
    },
    FRANCAIS: {
      gradient: 'from-orange-400 to-orange-600',
      text: 'text-orange-600',
      bgLight: 'bg-orange-50',
      icon: MessageCircle,
    },
    ARABIC: {
      gradient: 'from-purple-500 to-purple-700',
      text: 'text-purple-600',
      bgLight: 'bg-purple-50',
      icon: BookOpen,
    },
    SCIENCE: {
      gradient: 'from-emerald-500 to-green-600',
      text: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      icon: Compass,
    },
    ISLAMIC_CIVIC: {
      gradient: 'from-amber-400 to-amber-600',
      text: 'text-amber-600',
      bgLight: 'bg-amber-50',
      icon: Star,
    },
    ENGLISH: {
      gradient: 'from-pink-500 to-rose-600',
      text: 'text-pink-600',
      bgLight: 'bg-pink-50',
      icon: Globe,
    },
    SOCIALS: {
      gradient: 'from-violet-500 to-purple-600',
      text: 'text-purple-600',
      bgLight: 'bg-purple-50',
      icon: BookmarkCheck,
    },
    LOGIQUE: {
      gradient: 'from-cyan-500 to-blue-600',
      text: 'text-cyan-600',
      bgLight: 'bg-cyan-50',
      icon: Zap,
    },
    CULTURE: {
      gradient: 'from-amber-500 to-orange-600',
      text: 'text-orange-600',
      bgLight: 'bg-orange-50',
      icon: HelpCircle,
    },
  };

  // Start Placement Test Session
  const handleStartPlacementTest = async () => {
    setLoadingHub(true);
    try {
      const res = await placementTestApi.getQuestions();
      setActiveExam({
        type: 'PLACEMENT',
        questions: res.data,
      });
      setCurrentIdx(0);
      setSelectedAnswers({});
      setExamResult(null);
    } catch (err) {
      console.error('Failed to load placement test questions:', err);
    } finally {
      setLoadingHub(false);
    }
  };

  // Start Subject Mock Exam Session
  const handleStartSubjectExam = async (subject: string) => {
    setLoadingHub(true);
    try {
      const res = await placementTestApi.getSubjectQuestions(subject, childId!);
      setActiveExam({
        type: 'SUBJECT',
        subject,
        questions: res.data,
      });
      setCurrentIdx(0);
      setSelectedAnswers({});
      setExamResult(null);
    } catch (err) {
      console.error(`Failed to load ${subject} questions:`, err);
    } finally {
      setLoadingHub(false);
    }
  };

  // Quiz Handling
  const handleOptionSelect = (qId: string, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleNext = () => {
    if (currentIdx < (activeExam?.questions.length || 0) - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleQuizSubmit = async () => {
    if (!activeExam || !childId) return;
    setSubmitting(true);

    try {
      if (activeExam.type === 'PLACEMENT') {
        const payload = Object.entries(selectedAnswers).map(([qId, idx]) => ({
          questionId: qId,
          selectedIdx: idx,
        }));
        const res = await placementTestApi.submit({
          childId,
          answers: payload,
        });
        setTimeout(() => {
          setExamResult({
            score: `${res.data.score * 10}%`,
            level: res.data.level,
            strengths: res.data.strengths,
            weaknesses: res.data.weaknesses,
            recommendations: res.data.recommendations,
            points: 100,
            stars: 10,
          });
          setSubmitting(false);
        }, 1500);
      } else {
        // SUBJECT EXAM submission
        const payload = activeExam.questions.map(q => ({
          questionId: q.text, // Virtual ID is the question text itself
          selectedIdx: selectedAnswers[q.id] ?? -1,
          correctIdx: q.correctIdx,
        }));
        const res = await placementTestApi.submitSubjectExam({
          childId,
          subject: activeExam.subject!,
          answers: payload,
        });
        setTimeout(() => {
          setExamResult({
            score: `${res.data.score}%`,
            level: res.data.level,
            strengths: res.data.strengths,
            weaknesses: res.data.weaknesses,
            recommendations: res.data.recommendations,
            points: res.data.pointsEarned,
            stars: res.data.starsEarned,
          });
          setSubmitting(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setSubmitting(false);
    }
  };

  // Close exam results screen and refresh hub dashboard
  const handleCloseExamResult = () => {
    setActiveExam(null);
    setExamResult(null);
    setLoadingHub(true);
    fetchHubData();
    setActiveTab('overview');
  };

  // Latest placement test results for diagnostic tab
  const getLatestDiagnostic = () => {
    // Find the latest result that has aiAnalysis report
    return history.find(h => h.aiAnalysis);
  };

  const latestDiagnostic = getLatestDiagnostic();

  // If hub is loading on mount
  if (loadingHub && !activeExam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center stars-bg">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
        <p className="text-[var(--color-muted)] text-sm font-bold">{t.placementTest.loading}</p>
      </div>
    );
  }

  // Immersive active exam or quiz view
  if (activeExam) {
    if (submitting) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center stars-bg text-center px-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-20 h-20 rounded-full bg-[rgba(124,58,237,0.12)] flex items-center justify-center text-[var(--color-primary)] border-2 border-[rgba(124,58,237,0.25)] mb-6"
          >
            <Brain className="w-10 h-10 animate-pulse" />
          </motion.div>
          <h2 className="text-2xl font-black mb-2 gradient-text">{t.placementTest.submitting}</h2>
          <p className="text-[var(--color-muted)] text-sm max-w-sm font-bold">
            {dir === 'rtl'
              ? 'تقوم خوارزميات الذكاء الاصطناعي بتقييم مهاراتك وإعداد التقرير التشخيصي لك الآن.'
              : "L'IA analyse vos réponses et prépare votre rapport de diagnostic."}
          </p>
        </div>
      );
    }

    if (examResult) {
      return (
        <div className="min-h-screen flex items-center justify-center py-12 px-6 stars-bg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl glass rounded-3xl p-8 border-2 border-[rgba(124,58,237,0.15)] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[rgba(74,222,128,0.12)] flex items-center justify-center mx-auto mb-4 text-[#16A34A] border border-[rgba(74,222,128,0.3)]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
                {t.placementTest.resultTitle}
              </h1>
              <p className="text-[var(--color-muted)] text-sm font-bold">
                {t.placementTest.resultSubtitle}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[rgba(96,165,250,0.12)] text-[#2563EB] border border-[rgba(96,165,250,0.2)] text-lg font-black">
                  <Award className="w-5 h-5" />
                  <span>{getLevelLabel(examResult.level)}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[rgba(234,179,8,0.12)] text-amber-600 border border-[rgba(234,179,8,0.2)] text-lg font-black">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span>{t.placementTest.examScore} {examResult.score}</span>
                </div>
              </div>

              <div className="mt-4 text-xs font-black text-emerald-500 bg-emerald-500/10 inline-block px-4 py-1.5 rounded-full border border-emerald-500/20">
                {t.placementTest.scorePoints.replace('{points}', String(examResult.points)).replace('{stars}', String(examResult.stars))}
              </div>
            </div>

            <div className="space-y-6 mb-8 text-right" style={{ direction: dir }}>
              {examResult.strengths && examResult.strengths.length > 0 && (
                <div>
                  <h3 className="font-black text-[var(--color-text)] mb-2 flex items-center gap-2 text-base justify-start">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>{t.placementTest.strengths}</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--color-text)]">
                    {examResult.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 bg-[rgba(124,58,237,0.04)] p-2 rounded-xl border border-[rgba(124,58,237,0.12)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="font-bold">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {examResult.weaknesses && examResult.weaknesses.length > 0 && (
                <div>
                  <h3 className="font-black text-[var(--color-text)] mb-2 flex items-center gap-2 text-base justify-start">
                    <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>{t.placementTest.weaknesses}</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--color-text)]">
                    {examResult.weaknesses.map((w: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 bg-[rgba(124,58,237,0.04)] p-2 rounded-xl border border-[rgba(124,58,237,0.12)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                        <span className="font-bold">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {examResult.recommendations && examResult.recommendations.length > 0 && (
                <div>
                  <h3 className="font-black text-[var(--color-text)] mb-2 flex items-center gap-2 text-base justify-start">
                    <TrendingUp className="w-5 h-5 text-[var(--color-secondary)]" />
                    <span>{t.placementTest.recommendations}</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text)]">
                    {examResult.recommendations.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 bg-[rgba(124,58,237,0.04)] p-3 rounded-xl border border-[rgba(124,58,237,0.12)]">
                        <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleCloseExamResult}
              className="btn-primary w-full py-3.5 text-base font-black cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.placementTest.goToDashboard}</span>
              {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </motion.div>
        </div>
      );
    }

    const currentQ = activeExam.questions[currentIdx];
    const selectedOptionIdx = selectedAnswers[currentQ?.id];
    const totalQCount = activeExam.questions.length;
    const allAnswered = Object.keys(selectedAnswers).length === totalQCount;

    return (
      <main className="min-h-screen py-12 px-6 flex items-center justify-center relative overflow-hidden stars-bg">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }} />

        <div className="w-full max-w-xl relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <OwlLogo size={36} />
              <span className="text-xl font-black text-[var(--color-primary)]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.common.brand}
              </span>
            </div>
            <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
              {activeExam.type === 'PLACEMENT' ? t.placementTest.title : t.placementTest.examTypeSubject.replace('{subject}', getSubjectLabel(activeExam.subject || ''))}
            </h1>
            <p className="text-[var(--color-muted)] text-sm font-semibold">
              {activeExam.type === 'PLACEMENT' ? t.placementTest.subtitle : t.placementTest.subjectExamsDesc}
            </p>
          </div>

          {totalQCount > 0 && currentQ && (
            <div className="glass rounded-3xl p-8 border-2 border-[rgba(124,58,237,0.15)] shadow-2xl space-y-6">
              {/* Header progress info */}
              <div className="flex justify-between items-center text-xs font-bold text-[var(--color-muted)]">
                <span>
                  {t.placementTest.questionLabel} {currentIdx + 1} {t.placementTest.of} {totalQCount}
                </span>
                <span className="text-[var(--color-primary)]">
                  {Math.round(((currentIdx + 1) / totalQCount) * 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-[rgba(124,58,237,0.1)] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentIdx + 1) / totalQCount) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question Text */}
              <div className={`py-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-black text-[var(--color-text)] leading-relaxed">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {currentQ.options.map((option: string, optIdx: number) => {
                  const isSelected = selectedOptionIdx === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-xl border-2 text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--color-primary)] font-black'
                          : 'border-[rgba(124,58,237,0.12)] bg-[rgba(124,58,237,0.02)] text-[var(--color-text)] hover:bg-[rgba(124,58,237,0.06)]'
                      } ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                    >
                      <span className="inline-block">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Footer Stepper Controls */}
              <div className="flex justify-between gap-3 pt-4 border-t-2 border-[rgba(124,58,237,0.12)]">
                <button
                  onClick={handleBack}
                  disabled={currentIdx === 0}
                  className="btn-secondary text-sm py-2.5 px-4 cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{t.placementTest.backBtn}</span>
                </button>

                {currentIdx === totalQCount - 1 ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={!allAnswered}
                    className="btn-primary text-sm py-2.5 px-6 cursor-pointer disabled:opacity-45 disabled:pointer-events-none flex items-center gap-2"
                  >
                    <span>{t.placementTest.submitBtn}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={selectedOptionIdx === undefined}
                    className="btn-primary text-sm py-2.5 px-6 cursor-pointer disabled:opacity-45 disabled:pointer-events-none flex items-center gap-1.5"
                  >
                    <span>{t.placementTest.nextBtn}</span>
                    {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Dashboard Hub View
  return (
    <div className="flex-1 p-6 md:p-10 stars-bg" style={{ direction: dir }}>
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] flex items-center gap-3">
            <span>{t.placementTest.hubTitle}</span>
            <span className="text-xl">🏆</span>
          </h1>
          <p className="text-[var(--color-muted)] text-sm mt-1 font-bold">
            {t.placementTest.hubSubtitle}
          </p>
        </div>

        {childInfo && (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold border border-indigo-500/20">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[var(--color-text)] leading-tight">{childInfo.name}</h4>
              <p className="text-xs text-[var(--color-primary)] font-black mt-0.5">{getLevelLabel(childInfo.level)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/60 mb-8 gap-6 text-sm font-black">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'text-[var(--color-primary)]' : 'text-[var(--color-light)] hover:text-[var(--color-muted)]'
          }`}
        >
          <span>{t.placementTest.tabOverview}</span>
          {activeTab === 'overview' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary)] rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer ${
            activeTab === 'exams' ? 'text-[var(--color-primary)]' : 'text-[var(--color-light)] hover:text-[var(--color-muted)]'
          }`}
        >
          <span>{t.placementTest.tabExams}</span>
          {activeTab === 'exams' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary)] rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer ${
            activeTab === 'history' ? 'text-[var(--color-primary)]' : 'text-[var(--color-light)] hover:text-[var(--color-muted)]'
          }`}
        >
          <span>{t.placementTest.tabHistory}</span>
          {activeTab === 'history' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary)] rounded-full"
            />
          )}
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="w-full">
        {/* TAB 1: OVERVIEW & AI DIAGNOSTIC */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Diagnostics Card */}
            <div className="lg:col-span-2 space-y-6">
              {latestDiagnostic ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-600">
                      <Brain className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">{t.placementTest.diagnosticsTitle}</h2>
                      <p className="text-xs text-[var(--color-muted)] font-bold">
                        {dir === 'rtl' ? 'آخر تشخيص ذكي تم إعداده' : 'Dernier diagnostic généré'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 text-right" style={{ direction: dir }}>
                    {/* Level summary */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex flex-wrap justify-between items-center gap-2">
                      <span className="text-xs font-black text-slate-500">{t.placementTest.levelLabel}</span>
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-100">
                        {getLevelLabel(latestDiagnostic.level)}
                      </span>
                    </div>

                    {/* Strengths */}
                    {latestDiagnostic.aiAnalysis?.strengths && latestDiagnostic.aiAnalysis.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-2 justify-start">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>{t.placementTest.strengths}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {latestDiagnostic.aiAnalysis.strengths.map((str, i) => (
                            <div key={i} className="text-xs bg-emerald-500/5 text-emerald-700 font-bold p-2.5 rounded-xl border border-emerald-500/10">
                              {str}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {latestDiagnostic.aiAnalysis?.weaknesses && latestDiagnostic.aiAnalysis.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-2 justify-start">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>{t.placementTest.weaknesses}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {latestDiagnostic.aiAnalysis.weaknesses.map((weak, i) => (
                            <div key={i} className="text-xs bg-amber-500/5 text-amber-700 font-bold p-2.5 rounded-xl border border-amber-500/10">
                              {weak}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {latestDiagnostic.aiAnalysis?.recommendations && latestDiagnostic.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-2 justify-start">
                          <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
                          <span>{t.placementTest.recommendations}</span>
                        </h4>
                        <div className="space-y-2">
                          {latestDiagnostic.aiAnalysis.recommendations.map((rec, i) => (
                            <div key={i} className="text-xs bg-indigo-500/5 text-indigo-700 font-bold p-3 rounded-xl border border-indigo-500/10 flex items-center gap-2">
                              <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleStartPlacementTest}
                      className="btn-secondary text-xs py-2 px-5 cursor-pointer flex items-center gap-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.placementTest.retakeTest}</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center"
                >
                  <div className="w-20 h-20 bg-indigo-500/5 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 border border-indigo-500/10">
                    <Brain className="w-10 h-10 animate-float" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">
                    {dir === 'rtl' ? 'ابدأ رحلة التقييم الذكي!' : 'Commencez l\'évaluation intelligente !'}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold max-w-sm mx-auto mb-6 leading-relaxed">
                    {dir === 'rtl'
                      ? 'قم بإجراء اختبار تحديد المستوى الأول لطفلك لتفعيل خوارزميات التخصيص بالذكاء الاصطناعي وتهيئة المنهج الدراسي المناسب له.'
                      : "Passez le premier test de niveau pour activer la personnalisation par l'IA et configurer le parcours d'apprentissage idéal."}
                  </p>
                  <button
                    onClick={handleStartPlacementTest}
                    className="btn-primary py-3 px-8 text-sm font-black cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <span>{t.placementTest.startTest}</span>
                    {dir === 'rtl' ? <ArrowLeft className="w-4.5 h-4.5" /> : <ArrowRight className="w-4.5 h-4.5" />}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sidebar quick stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
                <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{dir === 'rtl' ? 'إحصائيات الامتحانات' : 'Stats des examens'}</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                    <span className="text-xs font-black text-slate-500">{dir === 'rtl' ? 'الامتحانات المنجزة' : 'Examens terminés'}</span>
                    <span className="text-sm font-black text-slate-800">{history.length}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                    <span className="text-xs font-black text-slate-500">{dir === 'rtl' ? 'أعلى نتيجة' : 'Meilleur score'}</span>
                    <span className="text-sm font-black text-emerald-600">
                      {history.length > 0 ? `${Math.max(...history.map(h => h.score))}%` : '--'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                    <span className="text-xs font-black text-slate-500">{dir === 'rtl' ? 'معدل الدرجات' : 'Score moyen'}</span>
                    <span className="text-sm font-black text-indigo-600">
                      {history.length > 0
                        ? `${Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)}%`
                        : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBJECT PRACTICE EXAMS */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-slate-800">{t.placementTest.subjectExamsTitle}</h2>
              <p className="text-xs text-[var(--color-muted)] font-bold mt-1">
                {t.placementTest.subjectExamsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(gradeSubjects[childInfo?.grade || 1] || ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC']).map((subjKey) => {
                const conf = subjectConfigs[subjKey] || subjectConfigs.MATHS;
                const IconComponent = conf.icon;
                const pastSubjectExams = history.filter(
                  h => h.aiAnalysis?.type === 'SUBJECT_EXAM' && h.aiAnalysis.subject === subjKey
                );
                const bestScore = pastSubjectExams.length > 0
                  ? Math.max(...pastSubjectExams.map(e => e.score))
                  : null;

                return (
                  <motion.div
                    key={subjKey}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${conf.gradient} flex items-center justify-center text-white shadow`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        {bestScore !== null && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            {dir === 'rtl' ? `أعلى نتيجة: ${bestScore}%` : `Max: ${bestScore}%`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-800">{getSubjectLabel(subjKey)}</h3>
                      <p className="text-slate-400 text-xs font-bold mt-1">
                        {t.placementTest.examDuration}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>
                          {dir === 'rtl' ? 'يتكيف حسب مستوى الطفل' : 'S\'adapte au niveau de l\'enfant'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartSubjectExam(subjKey)}
                      className="btn-primary text-xs w-full py-3 mt-6 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{t.placementTest.takeExamBtn}</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: EXAM HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right" style={{ direction: dir }}>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500">
                      <th className="p-4">{dir === 'rtl' ? 'نوع الامتحان' : 'Type d\'examen'}</th>
                      <th className="p-4 text-center">{t.placementTest.examScore}</th>
                      <th className="p-4 text-center">{dir === 'rtl' ? 'المستوى المحقق' : 'Niveau atteint'}</th>
                      <th className="p-4 text-center">{t.placementTest.examDate}</th>
                      <th className="p-4 text-center">{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => {
                      const isSubjectExam = item.aiAnalysis?.type === 'SUBJECT_EXAM';
                      const title = isSubjectExam
                        ? t.placementTest.examTypeSubject.replace('{subject}', getSubjectLabel(item.aiAnalysis?.subject || ''))
                        : t.placementTest.examTypePlacement;
                      
                      // Score Badge Colors
                      let scoreColor = 'text-red-600 bg-red-50 border-red-100';
                      if (item.score >= 80) scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                      else if (item.score >= 50) scoreColor = 'text-amber-600 bg-amber-50 border-amber-100';

                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-xs font-bold text-slate-700">
                          <td className="p-4 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                              isSubjectExam ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-violet-50 border-violet-100 text-violet-500'
                            }`}>
                              {isSubjectExam ? <FileText className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                            </div>
                            <span className="font-extrabold text-slate-800">{title}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full border font-black ${scoreColor}`}>
                              {item.score}%
                            </span>
                          </td>
                          <td className="p-4 text-center font-black text-slate-700">
                            {getLevelLabel(item.level)}
                          </td>
                          <td className="p-4 text-center text-slate-400 font-semibold">
                            {new Date(item.completedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedPastResult(item)}
                              className="text-[var(--color-primary)] font-black hover:underline cursor-pointer"
                            >
                              {t.placementTest.viewReport}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                  <FileText className="w-7 h-7" />
                </div>
                <p className="text-slate-400 font-bold text-sm">
                  {t.placementTest.noHistory}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAILED HISTORY MODAL */}
      <AnimatePresence>
        {selectedPastResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
              style={{ direction: dir }}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[var(--color-primary)]" />
                  <span>{t.placementTest.modalReportTitle}</span>
                </h3>
                <button
                  onClick={() => setSelectedPastResult(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200/60 transition-colors text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-right" style={{ direction: dir }}>
                {/* Diagnostics Summary */}
                {selectedPastResult.aiAnalysis && (
                  <div className="bg-[rgba(124,58,237,0.02)] border-2 border-indigo-50 p-5 rounded-2xl space-y-4">
                    <h4 className="font-black text-indigo-600 text-sm flex items-center gap-2 justify-start">
                      <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                      <span>{t.placementTest.diagnosticsTitle}</span>
                    </h4>

                    {selectedPastResult.aiAnalysis.strengths && selectedPastResult.aiAnalysis.strengths.length > 0 && (
                      <div>
                        <span className="text-xs font-black text-slate-500 block mb-1.5">{t.placementTest.strengths}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPastResult.aiAnalysis.strengths.map((str, i) => (
                            <span key={i} className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                              {str}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPastResult.aiAnalysis.weaknesses && selectedPastResult.aiAnalysis.weaknesses.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-black text-slate-500 block mb-1.5">{t.placementTest.weaknesses}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPastResult.aiAnalysis.weaknesses.map((weak, i) => (
                            <span key={i} className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                              {weak}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPastResult.aiAnalysis.recommendations && selectedPastResult.aiAnalysis.recommendations.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-black text-slate-500 block mb-1.5">{t.placementTest.recommendations}</span>
                        <ul className="space-y-1.5 text-xs text-slate-700 font-bold">
                          {selectedPastResult.aiAnalysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-center gap-1.5 justify-start">
                              <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Answers list */}
                {selectedPastResult.answers && Array.isArray(selectedPastResult.answers) && (
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-2 justify-start">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                      <span>{dir === 'rtl' ? 'الأسئلة والإجابات التفصيلية' : 'Questions & Réponses détaillées'}</span>
                    </h4>

                    <div className="space-y-3.5">
                      {selectedPastResult.answers.map((ans, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border-2 ${
                            ans.isCorrect ? 'border-emerald-100 bg-emerald-500/2' : 'border-red-100 bg-red-500/2'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="font-extrabold text-slate-800 text-sm">
                              {idx + 1}. {ans.questionText || `سؤال ${idx + 1}`}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                              ans.isCorrect ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'
                            }`}>
                              {ans.isCorrect ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>{t.placementTest.correct}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  <span>{t.placementTest.incorrect}</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs font-bold mt-3 text-slate-600">
                            <div className="flex justify-start gap-1">
                              <span className="text-slate-400">{t.placementTest.qAnswered}</span>
                              <span className={ans.isCorrect ? 'text-emerald-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                                {ans.selectedOption || (ans.selectedIdx !== undefined ? `إيار ${ans.selectedIdx + 1}` : t.placementTest.noAnswer)}
                              </span>
                            </div>
                            {!ans.isCorrect && (
                              <div className="flex justify-start gap-1">
                                <span className="text-slate-400">{t.placementTest.qCorrect}</span>
                                <span className="text-emerald-600 font-extrabold">
                                  {ans.correctOption || (ans.correctIdx !== undefined ? `اختيار ${ans.correctIdx + 1}` : '')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedPastResult(null)}
                  className="btn-secondary text-xs py-2 px-6 cursor-pointer"
                >
                  {t.placementTest.closeBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlacementTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center stars-bg">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
      </div>
    }>
      <TestContent />
    </Suspense>
  );
}
