'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonsApi, aiTutorApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OwlLogo from '../../components/Logo';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Star,
  Compass,
  Volume2,
  Image as ImageIcon,
  Lightbulb,
  HelpCircle,
  Zap,
  Lock,
  Trophy,
  ChevronRight,
  Brain,
} from 'lucide-react';

interface LessonExercise {
  id: string;
  title: string;
  isMandatory: boolean;
  completed: boolean;
}

function LessonDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, dir, lang } = useLanguage();

  const lessonId = params.id as string;
  const [childId, setChildId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [lessonRead, setLessonRead] = useState(false);
  const [exercises, setExercises] = useState<LessonExercise[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!lessonId || !childId) return;

    lessonsApi
      .get(lessonId, childId)
      .then((res) => {
        setLesson(res.data);
        // If lesson was previously marked as read (has LessonCompletion), show exercises
        if (res.data.read) {
          setLessonRead(true);
          setExercises(res.data.exercises || []);
        } else if (res.data.exercises?.length > 0) {
          setExercises(res.data.exercises);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [lessonId, childId]);

  const handleComplete = async () => {
    if (!childId) return;
    setCompleting(true);
    try {
      const res = await lessonsApi.complete(lessonId, childId);
      setSuccessData(res.data);
      setLessonRead(true);
      setExercises(res.data.exercises || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTTS = async () => {
    if (!lesson?.content?.text) return;
    
    // If currently playing, stop it
    if (isPlayingTTS && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingTTS(false);
      return;
    }
    
    setIsPlayingTTS(true);
    try {
      // Call the AI TTS endpoint
      const audioBlob = await aiTutorApi.generateTTS(lesson.content.text);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error("Failed to generate or play TTS:", error);
      setIsPlayingTTS(false);
      
      // Fallback to browser TTS if AI fails
      const utterance = new SpeechSynthesisUtterance(lesson.content.text);
      utterance.lang = dir === 'rtl' ? 'ar-SA' : 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const content = lesson?.content as any;

  const mandatoryExercise = exercises.find((e) => e.isMandatory);
  const optionalExercises = exercises.filter((e) => !e.isMandatory);
  const mandatoryDone = mandatoryExercise?.completed ?? false;

  return (
    <div className="w-full stars-bg pb-20">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 glass border-b-2 border-[rgba(124,58,237,0.12)] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href={`/lessons?childId=${childId}`} className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
              {dir === 'rtl' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="text-sm font-bold">{t.lessons.backToLessons}</span>
            </Link>
            <div className="flex items-center gap-2 md:hidden">
              <OwlLogo size={32} />
              <span className="text-lg font-black text-[var(--color-primary)]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.common.brand}
              </span>
            </div>
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>

        {loading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : !lesson ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20">
            <div className="mb-4"><OwlLogo size={60} /></div>
            <h2 className="text-2xl font-black mb-4 text-[var(--color-text)]">الدرس غير موجود / Lesson Not Found</h2>
            <Link href={`/lessons?childId=${childId}`}>
              <button className="btn-primary">{t.lessons.backToLessons}</button>
            </Link>
          </div>
        ) : (
          <>
            <div className="max-w-3xl mx-auto px-6 py-10 w-full">
        {/* Lesson Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 border-2 border-[rgba(124,58,237,0.15)] shadow-2xl space-y-6"
        >
          {/* Metadata */}
          <div className={`flex flex-wrap items-center gap-2.5 text-xs text-[var(--color-muted)] border-b border-[rgba(124,58,237,0.12)] pb-4 ${
            dir === 'rtl' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
          }`}>
            <span className="flex items-center gap-1 font-bold bg-[rgba(124,58,237,0.06)] px-3 py-1 rounded-xl border border-[rgba(124,58,237,0.12)]">
              <Clock className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{lesson.duration} {t.lessons.duration}</span>
            </span>
            <span className="bg-[rgba(124,58,237,0.1)] px-3 py-1 rounded-xl border border-[rgba(124,58,237,0.2)] font-extrabold text-[var(--color-primary)]">
              {(t.dashboard.levels as any)[lesson.difficulty] || lesson.difficulty}
            </span>
            {lesson.axis && (
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/30 font-bold">
                {lesson.axis}
              </span>
            )}
            {content?.pages && (
              <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-900/30 font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>الصحفات: {content.pages.start} - {content.pages.end}</span>
              </span>
            )}
          </div>

          {/* Builds On */}
          {content?.builds_on && content.builds_on !== 'لا يوجد' && (
            <div className={`text-xs font-bold text-slate-500 dark:text-slate-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <span>يبني على: </span>
              <span className="text-[var(--color-primary)] text-sm">
                {Array.isArray(content.builds_on) ? content.builds_on.join('، ') : content.builds_on}
              </span>
            </div>
          )}

          {/* Key Concepts */}
          {content?.key_concepts && content.key_concepts.length > 0 && (
            <div className={`space-y-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h3 className="font-black text-[var(--color-text)] text-sm flex items-center gap-2 justify-start opacity-80">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>المفاهيم الأساسية / Key Concepts:</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {content.key_concepts.map((concept: string, i: number) => (
                  <span key={i} className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/10 dark:to-indigo-950/10 text-violet-800 dark:text-violet-300 px-3 py-1.5 rounded-xl border border-violet-100 dark:border-violet-900/20 text-xs font-bold shadow-sm">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Title, Speech & AI Explanation */}
          <div className={`flex items-center justify-between gap-3 flex-wrap ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text)] flex-grow">{lesson.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  // Store full lesson content in sessionStorage for AI tutor context
                  try {
                    sessionStorage.setItem('aiExplainContext', JSON.stringify({
                      type: 'lesson',
                      title: lesson.title,
                      text: content?.text || '',
                      summary: content?.summary || '',
                      key_concepts: content?.key_concepts || [],
                      examples: content?.examples || [],
                    }));
                  } catch (e) { /* ignore storage errors */ }
                  router.push(`/learn-with-ai?childId=${childId}&lessonId=${lessonId}&subject=${lesson.subject || 'MATHS'}&autoExplain=true`);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                title="اشرح الدرس بالذكاء الاصطناعي 🦉"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="inline">{lang === 'ar' ? 'اشرح بالذكاء الاصطناعي 🦉' : 'Explain with AI 🦉'}</span>
              </button>
              <button
                onClick={handleTTS}
                className="w-10 h-10 rounded-xl bg-[rgba(124,58,237,0.08)] border-2 border-[rgba(124,58,237,0.15)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[rgba(124,58,237,0.15)] transition-all cursor-pointer shrink-0"
                title="Read aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lesson Body Text Card */}
          <div className="bg-violet-50/10 dark:bg-violet-950/5 rounded-3xl p-6 md:p-8 border-2 border-violet-100/20 dark:border-violet-900/10 shadow-inner">
            <div className={`text-[var(--color-text)] text-lg leading-relaxed ${dir === 'rtl' ? 'text-right font-arabic' : 'text-left'}`} style={{ fontSize: '1.25rem', lineHeight: '2' }}>
              <p className="whitespace-pre-wrap font-bold text-slate-800 dark:text-slate-200">{content?.text}</p>
            </div>
          </div>

          {/* Dedicated AI Explanation Banner */}
          <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-purple-500/20 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'text-right flex-row-reverse' : 'text-left flex-row'}`}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md shrink-0">
                🦉
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 justify-start">
                  <span>{lang === 'ar' ? 'هل تحتاج إلى زيادة الشرح والتوضيح؟' : 'Need more explanation?'}</span>
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                  {lang === 'ar' 
                    ? 'المعلم الذكي أنيس جاهز للإجابة عن تساؤلاتك ومساعدتك على فهم هذا الدرس بسهولة!' 
                    : 'AI Tutor Anis is ready to explain this lesson step by step and answer all your questions!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                try {
                  sessionStorage.setItem('aiExplainContext', JSON.stringify({
                    type: 'lesson',
                    title: lesson.title,
                    text: content?.text || '',
                    summary: content?.summary || '',
                    key_concepts: content?.key_concepts || [],
                    examples: content?.examples || [],
                  }));
                } catch (e) { /* ignore storage errors */ }
                router.push(`/learn-with-ai?childId=${childId}&lessonId=${lessonId}&subject=${lesson.subject || 'MATHS'}&autoExplain=true`);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>{lang === 'ar' ? 'اسأل معلم الذكاء الاصطناعي أنيس 🦉' : 'Ask AI Tutor Anis 🦉'}</span>
            </button>
          </div>

          {/* Examples */}
          {content?.examples && content.examples.length > 0 && (
            <div className={`space-y-4 pt-4 border-t border-[rgba(124,58,237,0.12)] ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h3 className="font-black text-[var(--color-text)] text-base flex items-center gap-2 justify-start">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)] animate-pulse" />
                <span>المفردات والأمثلة / Vocabulary & Examples:</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {content.examples.map((ex: string, i: number) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border-2 border-[rgba(124,58,237,0.08)] hover:border-[rgba(124,58,237,0.2)] text-center shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center gap-2"
                  >
                    <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-arabic tracking-wide">{ex}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Scenes */}
          {content?.images && content.images.length > 0 && (
            <div className={`space-y-4 pt-4 border-t border-[rgba(124,58,237,0.12)] ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h3 className="font-black text-[var(--color-text)] text-base flex items-center gap-2 justify-start">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <span>المشاهد البصرية / Visual Scenes:</span>
              </h3>
              <div className="space-y-3">
                {content.images.map((img: any, i: number) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1.5 bg-blue-400" />
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                          صفحة {img.page} | {img.position}
                        </span>
                        {img.concept && (
                          <span className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {img.concept}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-relaxed">{img.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {content?.summary && (
            <div className={`bg-gradient-to-r from-emerald-50/30 to-teal-50/30 dark:from-emerald-950/5 dark:to-teal-950/5 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/10 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-start gap-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <Award className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-xs block mb-1 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">خلاصة الدرس / Lesson Summary</span>
                <p className="leading-relaxed">{content.summary}</p>
              </div>
            </div>
          )}

          {/* ─── ACTION AREA ─── */}
          <div className="pt-6 space-y-6">
            {!lessonRead ? (
              /* Complete Lesson Button */
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary w-full py-4 text-base font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                {completing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.lessons.completeBtn}</span>
                  </>
                )}
              </button>
            ) : (
              /* Exercises Section — shown after lesson is read */
              <div className="space-y-4">
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-4 h-4" />
                    قرأت الدرس بنجاح! — الآن حل التمارين
                  </span>
                </div>

                {/* Mandatory Exercise */}
                {mandatoryExercise && (
                  <div>
                    <p className="text-xs font-black text-[var(--color-primary)] mb-2 flex items-center gap-1">
                      <span>🔑</span>
                      <span>التمرين الإلزامي — مطلوب لفتح الدرس التالي</span>
                    </p>
                    <Link href={`/exercises/${mandatoryExercise.id}?childId=${childId}&fromLesson=${lessonId}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all"
                        style={{
                          background: mandatoryDone
                            ? 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(16,185,129,0.06))'
                            : 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))',
                          borderColor: mandatoryDone ? 'rgba(74,222,128,0.4)' : 'var(--color-primary)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
                            style={{ background: mandatoryDone ? '#10B981' : 'var(--color-primary)' }}>
                            {mandatoryDone ? <CheckCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{mandatoryExercise.title}</p>
                            <p className="text-xs text-slate-500 font-semibold">
                              {mandatoryDone ? '✅ تم الإكمال' : 'أساسي — يفتح الدرس التالي'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </motion.div>
                    </Link>
                  </div>
                )}

                {/* Optional Exercises */}
                {optionalExercises.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-slate-500 mb-2 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>تمارين إضافية اختيارية</span>
                    </p>
                    <div className="space-y-2">
                      {optionalExercises.map((ex) => (
                        <Link key={ex.id} href={`/exercises/${ex.id}?childId=${childId}&fromLesson=${lessonId}`}>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all"
                            style={{
                              background: ex.completed ? 'rgba(74,222,128,0.05)' : 'white',
                              borderColor: ex.completed ? 'rgba(74,222,128,0.3)' : 'rgba(0,0,0,0.06)',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                                style={{ background: ex.completed ? '#10B981' : '#A855F7' }}>
                                {ex.completed ? <CheckCircle className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-700 text-sm">{ex.title}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  {ex.completed ? '✅ مكتمل' : 'اختياري — يمنحك نقاطاً إضافية'}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Map */}
                <Link href={`/lessons?childId=${childId}`}>
                  <button className="w-full py-3 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all cursor-pointer border border-slate-200 flex items-center justify-center gap-2">
                    {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    <span>العودة إلى خريطة الدروس</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Success Modal (shown after clicking complete) */}
      <AnimatePresence>
              {successData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md glass border-2 border-[rgba(124,58,237,0.15)] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />

                    <div className="w-16 h-16 rounded-full bg-[rgba(74,222,128,0.12)] flex items-center justify-center mx-auto mb-6 text-[#16A34A] border border-[rgba(74,222,128,0.3)] animate-wiggle">
                      <Award className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-black mb-3 text-[var(--color-text)]">أحسنت صنعاً! 🎉</h2>
                    <p className="text-[var(--color-muted)] text-sm mb-2 font-bold">
                      قرأت الدرس وحصلت على +{successData.pointsAwarded} نقطة و +{successData.starsAwarded} نجمة!
                    </p>
                    <p className="text-xs text-[var(--color-primary)] font-black mb-6">
                      🔑 أكمل التمرين الإلزامي لفتح الدرس التالي
                    </p>

                    <div className="flex gap-3 justify-center items-center mb-6">
                      <div className="rounded-2xl px-4 py-2 flex items-center gap-1.5 text-sm bg-[rgba(96,165,250,0.12)] border border-[rgba(96,165,250,0.25)]">
                        <Award className="w-4 h-4 text-[#2563EB]" />
                        <span className="text-[#2563EB] font-black">+{successData.pointsAwarded} XP</span>
                      </div>
                      <div className="rounded-2xl px-4 py-2 flex items-center gap-1.5 text-sm bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.25)]">
                        <Star className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
                        <span className="text-[#D97706] font-black">+{successData.starsAwarded} نجمة</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSuccessData(null)}
                      className="w-full btn-primary py-3.5 cursor-pointer flex items-center justify-center gap-2"
                    >
                      إلى التمارين! ⚡
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
    </div>
  );
}

export default function LessonDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center stars-bg">
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    }>
      <LessonDetailContent />
    </Suspense>
  );
}
