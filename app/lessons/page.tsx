'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonsApi, childrenApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Logo from '../components/Logo';
import {
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  HelpCircle,
  Home,
  Brain,
  MessageCircle,
  Globe,
  Lock,
  Star,
  Bookmark,
  Compass,
  BookmarkCheck,
  ChevronDown,
  Zap,
  Trophy,
  Check,
  Sparkles,
} from 'lucide-react';

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
  difficulty: string;
  duration: number;
  order: number;
  completed: boolean;
  unlocked: boolean;
  read: boolean;
  grade: number;
  axis: string;
  subTopic: string;
  content: any;
  exercises: LessonExercise[];
}

interface Child {
  id: string;
  name: string;
  level: string;
  grade: number;
  points: number;
  stars: number;
  streakDays: number;
  shareCode?: string;
  groupId?: string;
}

interface PathNode {
  type: 'LESSON' | 'MANDATORY_EXERCISE';
  id: string;
  lessonId: string;
  title: string;
  order: number;
  data: any;
  unlocked: boolean;
  completed: boolean;
}

const subjectIcons: Record<string, any> = {
  MATHS: Brain,
  FRANCAIS: MessageCircle,
  ARABIC: BookOpen,
  SCIENCE: Compass,
  ISLAMIC_CIVIC: Star,
  ENGLISH: Globe,
  SOCIALS: BookmarkCheck,
};

const subjectColors: Record<string, { main: string; hover: string; bg: string; text: string; shadow: string }> = {
  MATHS: { main: '#3B82F6', hover: '#2563EB', bg: 'rgba(59,130,246,0.1)', text: '#1D4ED8', shadow: 'rgba(59,130,246,0.3)' },
  FRANCAIS: { main: '#FF8C42', hover: '#E0732B', bg: 'rgba(255,140,66,0.1)', text: '#D95F02', shadow: 'rgba(255,140,66,0.3)' },
  ARABIC: { main: '#A855F7', hover: '#8B5CF6', bg: 'rgba(168,85,247,0.1)', text: '#7E22CE', shadow: 'rgba(168,85,247,0.3)' },
  SCIENCE: { main: '#10B981', hover: '#059669', bg: 'rgba(16,185,129,0.1)', text: '#047857', shadow: 'rgba(16,185,129,0.3)' },
  ISLAMIC_CIVIC: { main: '#F59E0B', hover: '#D97706', bg: 'rgba(245,158,11,0.1)', text: '#B45309', shadow: 'rgba(245,158,11,0.3)' },
  ENGLISH: { main: '#EC4899', hover: '#DB2777', bg: 'rgba(236,72,153,0.1)', text: '#BE185D', shadow: 'rgba(236,72,153,0.3)' },
  SOCIALS: { main: '#8B5CF6', hover: '#7C3AED', bg: 'rgba(139,92,246,0.1)', text: '#6D28D9', shadow: 'rgba(139,92,246,0.3)' },
};

const gradeSubjects: Record<number, string[]> = {
  1: ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC'],
  2: ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC'],
  3: ['MATHS', 'ARABIC', 'FRANCAIS', 'SCIENCE', 'SOCIALS'],
  4: ['MATHS', 'ARABIC', 'FRANCAIS', 'SCIENCE', 'SOCIALS'],
  5: ['MATHS', 'ARABIC', 'FRANCAIS', 'ENGLISH', 'SCIENCE', 'SOCIALS'],
  6: ['MATHS', 'ARABIC', 'FRANCAIS', 'ENGLISH', 'SCIENCE', 'SOCIALS'],
};

const AVAILABLE_SUBJECTS = new Set(['MATHS']);

function OwlMascotCheer({ className = "" }: { className?: string }) {
  const { dir } = useLanguage();
  return (
    <motion.div
      className={`absolute z-10 pointer-events-none ${className}`}
      animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ top: '-48px', left: '16px' }}
    >
      <div className="relative">
        <div className="absolute right-full mr-1.5 bottom-6 bg-slate-800 text-white text-[9px] font-black py-1 px-2.5 rounded-xl whitespace-nowrap shadow-md border border-slate-700">
          {dir === 'rtl' ? 'ابدأ هنا! 🚀' : 'Start here! 🚀'}
          <div className="absolute top-1/2 left-full -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-slate-800" />
        </div>
        <Logo size={36} />
      </div>
    </motion.div>
  );
}

// ─── Exercise Branch Node (For optional exercises rendering as leaf nodes) ────────────────────────────────────────────────────
function ExerciseBranchNode({
  exercise,
  childId,
  lessonId,
  offsetX,
  offsetY,
}: {
  exercise: LessonExercise;
  childId: string;
  lessonId: string;
  offsetX: number;
  offsetY: number;
}) {
  const isCompleted = exercise.completed;
  const isChallenge = exercise.title.includes('تحدي') || exercise.title.includes('تحدّي') || exercise.title.includes('امتحان');

  const iconColor = "text-white";
  const iconSize = "w-5.5 h-5.5";

  const bgColor = isCompleted
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    : isChallenge
      ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
      : 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)';

  const borderColor = isCompleted
    ? '#047857'
    : isChallenge
      ? '#B45309'
      : '#6D28D9';

  return (
    <Link href={`/exercises/${exercise.id}?childId=${childId}&fromLesson=${lessonId}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="absolute flex flex-col items-center cursor-pointer"
        style={{
          left: `calc(50% + ${offsetX}px)`,
          top: `${offsetY}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }}
        title={exercise.title}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-b-4 transition-all duration-300 relative group"
          style={{
            background: bgColor,
            borderColor,
            borderBottomWidth: '4px',
            borderStyle: 'solid',
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />

          {isCompleted ? (
            <Check className={`${iconSize} ${iconColor} stroke-[3]`} />
          ) : isChallenge ? (
            <Trophy className={`${iconSize} ${iconColor} fill-white/10`} />
          ) : (
            <Sparkles className={`${iconSize} ${iconColor} fill-white/10`} />
          )}
        </div>
        <span
          className="mt-1.5 text-[8.5px] font-black text-center leading-tight max-w-[50px] uppercase tracking-tight bg-white/95 px-1.5 py-0.5 rounded-md shadow-sm border border-slate-100"
          style={{
            color: isCompleted ? '#047857' : isChallenge ? '#B45309' : '#6D28D9'
          }}
        >
          {isCompleted ? 'مكتمل' : isChallenge ? 'تحدي' : 'تدريب'}
        </span>
      </motion.div>
    </Link>
  );
}

function getBranchOffsets(count: number) {
  if (count === 1) {
    return [{ x: -60, y: 60 }];
  }
  if (count === 2) {
    return [
      { x: -70, y: 55 },
      { x: 70, y: 85 },
    ];
  }
  return [
    { x: -100, y: 50 },
    { x: 0, y: 95 },
    { x: 75, y: 65 },
  ];
}

function LessonsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<string>('MATHS');
  const [activeLessonPopover, setActiveLessonPopover] = useState<string | null>(null);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [comingSoonSubject, setComingSoonSubject] = useState<string | null>(null);

  // Social & Leaderboard States
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'friends' | 'group'>('friends');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialSuccess, setSocialSuccess] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [loading, lessons]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
      if (id) localStorage.setItem('activeChildId', id);
    }
  }, [searchParams]);

  const fetchLeaderboard = () => {
    if (!childId) return;
    childrenApi.getLeaderboard(childId)
      .then((res) => {
        setLeaderboard(res.data);
      })
      .catch((err) => console.error('Failed to fetch leaderboard:', err));
  };

  useEffect(() => {
    if (!childId) return;
    childrenApi
      .get(childId)
      .then((res) => {
        const childData = res.data;
        setChild(childData);
        if (childData.grade) {
          setSelectedGrade(childData.grade);
          setSelectedSubject('MATHS');
        }
      })
      .catch((err) => {
        console.error(err);
        if (typeof window !== 'undefined') localStorage.removeItem('activeChildId');
        router.push('/dashboard');
      });
  }, [childId]);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    lessonsApi
      .list(childId, selectedSubject, selectedGrade)
      .then((res) => {
        const filtered = res.data.filter((l: Lesson) => l.grade === selectedGrade);
        setLessons(filtered);
        fetchLeaderboard();
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [childId, selectedGrade, selectedSubject]);

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    setIsGradeDropdownOpen(false);
    setActiveLessonPopover(null);
    setSelectedSubject('MATHS');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActiveLessonPopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Social Actions Handlers ---
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !friendCodeInput.trim()) return;
    setSocialLoading(true);
    setSocialError(null);
    setSocialSuccess(null);
    try {
      const res = await childrenApi.addFriend(childId, friendCodeInput);
      if (res.data.status === 'already_friends') {
        setSocialSuccess(dir === 'rtl' ? 'صديق مضاف بالفعل!' : 'Already friends!');
      } else {
        setSocialSuccess(dir === 'rtl' ? `تمت إضافة ${res.data.friend.name} بنجاح!` : `Added ${res.data.friend.name}!`);
      }
      setFriendCodeInput('');
      fetchLeaderboard();
    } catch (err: any) {
      setSocialError(err.response?.data?.message || (dir === 'rtl' ? 'فشل إضافة الصديق.' : 'Failed to add friend.'));
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !groupNameInput.trim()) return;
    setSocialLoading(true);
    setSocialError(null);
    setSocialSuccess(null);
    try {
      const res = await childrenApi.createGroup(childId, groupNameInput);
      setSocialSuccess(dir === 'rtl' ? `تم إنشاء المجموعة "${res.data.name}" بنجاح!` : `Created group "${res.data.name}"!`);
      setGroupNameInput('');
      fetchLeaderboard();
    } catch (err: any) {
      setSocialError(err.response?.data?.message || (dir === 'rtl' ? 'فشل إنشاء المجموعة.' : 'Failed to create group.'));
    } finally {
      setSocialLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !groupCodeInput.trim()) return;
    setSocialLoading(true);
    setSocialError(null);
    setSocialSuccess(null);
    try {
      await childrenApi.joinGroup(childId, groupCodeInput);
      setSocialSuccess(dir === 'rtl' ? 'تم الانضمام للمجموعة بنجاح!' : 'Joined group successfully!');
      setGroupCodeInput('');
      fetchLeaderboard();
    } catch (err: any) {
      setSocialError(err.response?.data?.message || (dir === 'rtl' ? 'كود المجموعة غير صحيح.' : 'Invalid group code.'));
    } finally {
      setSocialLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!childId || !confirm(dir === 'rtl' ? 'هل أنت متأكد من مغادرة المجموعة؟' : 'Are you sure you want to leave the group?')) return;
    setSocialLoading(true);
    setSocialError(null);
    setSocialSuccess(null);
    try {
      await childrenApi.leaveGroup(childId);
      setSocialSuccess(dir === 'rtl' ? 'تمت مغادرة المجموعة.' : 'Left the group.');
      fetchLeaderboard();
    } catch (err: any) {
      setSocialError(err.response?.data?.message || 'Error leaving group.');
    } finally {
      setSocialLoading(false);
    }
  };

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#FFF9F0' }}>
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
          يجب اختيار ملف الطفل من لوحة التحكم لعرض الدروس المتوافقة مع مستواه.
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

  // ─── Map Path Construction ────────────────────────────────────────────────
  const pathNodes: PathNode[] = [];
  lessons.forEach((lesson, index) => {
    // Add the lesson node
    pathNodes.push({
      type: 'LESSON',
      id: lesson.id,
      lessonId: lesson.id,
      title: lesson.title,
      order: index + 1,
      data: lesson,
      unlocked: lesson.unlocked,
      completed: lesson.completed,
    });

    // Find the mandatory exercise
    const mandatoryEx = lesson.exercises?.find((ex) => ex.isMandatory);
    if (mandatoryEx) {
      pathNodes.push({
        type: 'MANDATORY_EXERCISE',
        id: mandatoryEx.id,
        lessonId: lesson.id,
        title: mandatoryEx.title,
        order: index + 1,
        data: mandatoryEx,
        unlocked: lesson.read, // unlocked if lesson has been read
        completed: mandatoryEx.completed,
      });
    }
  });

  const getX = (index: number) => {
    const isMobile = containerWidth < 480;
    const padding = isMobile ? 65 : 85;
    const usableWidth = containerWidth - padding * 2;
    const mid = containerWidth / 2;
    const amp = usableWidth / 2;

    const mod = index % 4;
    if (mod === 0 || mod === 2) return mid;
    if (mod === 1) return mid + amp;
    return mid - amp;
  };

  const getSubjectLabel = (subj: string) => {
    if (subj === 'MATHS') return t.lessons.math;
    if (subj === 'FRANCAIS') return t.lessons.french;
    if (subj === 'ARABIC') return t.lessons.arabic;
    if (subj === 'SCIENCE') return t.lessons.science;
    if (subj === 'ISLAMIC_CIVIC') return t.lessons.islamicCivic;
    if (subj === 'ENGLISH') return t.lessons.english;
    if (subj === 'SOCIALS') return t.lessons.socials;
    return subj;
  };

  const activeLessonIndex = pathNodes.findIndex((n) => n.type === 'LESSON' && n.unlocked && !n.completed);
  const mascotNodeIndex = activeLessonIndex !== -1 ? activeLessonIndex : pathNodes.findIndex((n) => n.type === 'LESSON' && n.unlocked);

  const NODE_SPACING = 90;
  const BRANCH_EXTRA = 65;

  const lessonYPositions: number[] = [];
  let cumulativeY = 75;
  for (let i = 0; i < pathNodes.length; i++) {
    lessonYPositions.push(cumulativeY);
    const node = pathNodes[i];

    // Only mandatory exercise nodes have branches (optional exercises of the parent lesson)
    let hasVisibleBranches = false;
    if (node.type === 'MANDATORY_EXERCISE') {
      const parentLesson = lessons.find((l) => l.id === node.lessonId);
      const optionalExercisesCount = parentLesson?.exercises?.filter((ex: any) => !ex.isMandatory).length ?? 0;
      hasVisibleBranches = (parentLesson?.read ?? false) && optionalExercisesCount > 0;
    }

    cumulativeY += NODE_SPACING + (hasVisibleBranches ? BRANCH_EXTRA : 0);
  }
  const containerHeight = cumulativeY + 60;

  let pathD = '';
  for (let i = 0; i < pathNodes.length; i++) {
    const x = getX(i);
    const y = lessonYPositions[i];
    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevX = getX(i - 1);
      const prevY = lessonYPositions[i - 1];
      const cpY1 = prevY + (y - prevY) * 0.5;
      const cpY2 = y - (y - prevY) * 0.5;
      pathD += ` C ${prevX} ${cpY1}, ${x} ${cpY2}, ${x} ${y}`;
    }
  }

  const currentColorSet = subjectColors[selectedSubject] || subjectColors.MATHS;
  const availableTabs = gradeSubjects[selectedGrade] || [];

  return (
    <div className="w-full px-6 lg:px-8 pt-8 pb-20 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left/Center Column: Banner + Subjects + Winding Map */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: '#7C3AED' }} />
              <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                    {t.lessons.title}
                  </h1>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">{t.lessons.subtitle}</p>
                </div>
              </div>

              {/* Grade Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm cursor-pointer transition-all"
                >
                  <span><span>{(t.lessons.grades as any)[`g${selectedGrade}`] || `السنة ${selectedGrade}`}</span></span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGradeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isGradeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <button
                          key={g}
                          onClick={() => handleGradeChange(g)}
                          className={`w-full text-right px-4 py-2.5 text-xs font-bold transition-all block cursor-pointer border-b border-slate-50 hover:bg-slate-50 ${selectedGrade === g ? 'text-[#7C3AED] bg-indigo-50/50' : 'text-slate-700'
                            }`}
                        >
                          {(t.lessons.grades as any)[`g${g}`]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Split layout: Subjects (Left/Right based on dir) and Map */}
            <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in" style={{ direction: dir }}>

              {/* Subjects List (Left side of map) */}
              <div className="flex flex-col gap-3 shrink-0 w-full md:w-48" style={{ direction: dir }}>
                {availableTabs.map((subject) => {
                  const isAvailable = AVAILABLE_SUBJECTS.has(subject);
                  const isSelected = selectedSubject === subject;
                  const colors = subjectColors[subject] || subjectColors.MATHS;
                  const TabIcon = subjectIcons[subject] || BookOpen;
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        if (!isAvailable) { setComingSoonSubject(subject); return; }
                        setSelectedSubject(subject);
                        setActiveLessonPopover(null);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 w-full ${dir === 'rtl' ? 'text-right justify-start flex-row-reverse' : 'text-left justify-start'
                        }`}
                      style={{
                        background: isSelected && isAvailable ? 'white' : 'transparent',
                        borderColor: isSelected && isAvailable ? colors.main : 'rgba(0,0,0,0.06)',
                        color: isAvailable ? (isSelected ? colors.text : '#64748B') : '#94A3B8',
                        boxShadow: isSelected && isAvailable ? `0 4px 14px ${colors.shadow}` : 'none',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.55,
                        filter: isAvailable ? 'none' : 'grayscale(1)',
                      }}
                    >
                      <TabIcon className="w-4.5 h-4.5 shrink-0" style={{ color: isAvailable ? colors.main : '#94A3B8' }} />
                      <span className="truncate">{getSubjectLabel(subject)}</span>
                      {!isAvailable && (
                        <span
                          style={{
                            fontSize: '8px',
                            background: 'rgba(148,163,184,0.15)',
                            color: '#94A3B8',
                            borderRadius: '999px',
                            padding: '1px 5px',
                            fontWeight: 800
                          }}
                          className={dir === 'rtl' ? 'mr-auto ml-0' : 'ml-auto mr-0'}
                        >
                          {(t.lessons as any).soon || 'Soon'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Winding Map Container (Right side of subjects) */}
              <div className="flex-1 w-full min-w-0">
                {/* Coming Soon Modal */}
                <AnimatePresence>
                  {comingSoonSubject && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center"
                      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
                      onClick={() => setComingSoonSubject(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 max-w-xs w-full mx-4 text-center relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="text-5xl mb-4"
                        >🚧</motion.div>
                        <h3 className="text-xl font-black text-slate-800 mb-2" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                          {getSubjectLabel(comingSoonSubject)}
                        </h3>
                        <p className="text-slate-500 text-sm font-bold mb-1">هذه المادة قيد التطوير حالياً</p>
                        <p className="text-slate-400 text-xs font-semibold mb-6">
                          نعمل حالياً فقط على مادة <span className="text-[#7C3AED] font-black">الرياضيات</span> 🧮<br />
                          ترقّبوا المزيد قريباً! 🎉
                        </p>
                        <button
                          onClick={() => setComingSoonSubject(null)}
                          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-black py-3 rounded-2xl shadow border-b-4 border-indigo-900 cursor-pointer transition-all"
                        >
                          حسناً، سأنتظر! 👍
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading state / Winding path */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin text-[#FF8C42] mb-3" />
                    <p className="text-slate-500 text-xs font-black animate-pulse">تحميل الخريطة... / Loading Map...</p>
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 mt-6 max-w-md mx-auto">
                    <Logo size={48} className="mx-auto opacity-40 mb-4 animate-float" />
                    <h3 className="text-lg font-black text-slate-700">لا توجد دروس حالياً</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">سيقوم المشرفون بإضافة دروس ومحاور لهذه السنة الدراسية قريباً!</p>
                  </div>
                ) : (
                  <div className="flex justify-center relative w-full px-4">
                    <div
                      ref={containerRef}
                      className="relative w-full max-w-4xl mx-auto"
                      style={{ height: `${containerHeight}px`, direction: 'ltr' /* keep path always LTR */ }}
                    >
                      {/* SVG Winding Path */}
                      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        {pathD && (
                          <path d={pathD} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="16" strokeLinecap="round" />
                        )}
                        {pathD && (
                          <path d={pathD} fill="none" stroke={currentColorSet.main} strokeWidth="8" strokeDasharray="14 10" strokeLinecap="round" />
                        )}

                        {/* SVG Branch Lines for optional/challenge exercises - branching from MANDATORY_EXERCISE nodes */}
                        {pathNodes.map((node, idx) => {
                          if (node.type !== 'MANDATORY_EXERCISE') return null;
                          const parentLesson = lessons.find((l) => l.id === node.lessonId);
                          const optionalExercises = parentLesson?.exercises?.filter((ex: any) => !ex.isMandatory) || [];
                          const hasVisibleBranches = parentLesson?.read && optionalExercises.length > 0;
                          if (!hasVisibleBranches) return null;

                          const nodeX = getX(idx);
                          const nodeY = lessonYPositions[idx];
                          const exCount = optionalExercises.length;
                          const offsets = getBranchOffsets(exCount);

                          return optionalExercises.map((ex: any, exIdx: number) => {
                            const offset = offsets[exIdx] || { x: 0, y: 70 };
                            const targetX = nodeX + offset.x;
                            const targetY = nodeY + offset.y;

                            const cpY1 = nodeY + offset.y * 0.35;
                            const cpY2 = targetY - offset.y * 0.35;
                            const pathString = `M ${nodeX} ${nodeY + 16} C ${nodeX} ${cpY1}, ${targetX} ${cpY2}, ${targetX} ${targetY}`;

                            return (
                              <path
                                key={ex.id}
                                d={pathString}
                                fill="none"
                                stroke="#A855F7"
                                strokeWidth="3"
                                strokeDasharray="6 5"
                                strokeOpacity="0.75"
                                strokeLinecap="round"
                              />
                            );
                          });
                        })}
                      </svg>

                      {/* Nodes Rendering */}
                      {pathNodes.map((node, idx) => {
                        const nodeX = getX(idx);
                        const nodeY = lessonYPositions[idx];
                        const isMascotHere = mascotNodeIndex === idx;

                        if (node.type === 'LESSON') {
                          const lesson = node.data;

                          let state: 'completed' | 'active' | 'locked' = 'locked';
                          if (lesson.completed) state = 'completed';
                          else if (lesson.unlocked) state = 'active';

                          const popoverWidth = 256;
                          const halfWidth = popoverWidth / 2;
                          const margin = 12;
                          const absoluteLeft = Math.max(margin, Math.min(containerWidth - popoverWidth - margin, nodeX - halfWidth));
                          const relativeLeft = absoluteLeft - (nodeX - 36);
                          const arrowLeft = nodeX - absoluteLeft;

                          return (
                            <div
                              key={node.id}
                              className="absolute w-18 h-18"
                              style={{
                                left: `${nodeX}px`,
                                top: `${nodeY}px`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              {/* Mascot */}
                              {isMascotHere && state === 'active' && <OwlMascotCheer />}

                              {/* Large Lesson Node */}
                              <motion.button
                                onClick={() => {
                                  setActiveLessonPopover(activeLessonPopover === lesson.id ? null : lesson.id);
                                }}
                                className="w-18 h-18 rounded-full border-b-6 flex items-center justify-center relative cursor-pointer outline-none transition-all shadow-md"
                                style={{
                                  background: state === 'completed' ? '#10B981' : state === 'active' ? currentColorSet.main : '#E2E8F0',
                                  borderColor: state === 'completed' ? '#059669' : state === 'active' ? currentColorSet.hover : '#CBD5E1',
                                  borderWidth: '2px',
                                  borderBottomWidth: '6px',
                                  color: 'white',
                                }}
                                whileHover={{ scale: state === 'locked' ? 1 : 1.08 }}
                                whileTap={{ scale: state === 'locked' ? 1 : 0.95 }}
                                animate={state === 'active' ? { y: [0, -4, 0] } : {}}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                {state === 'completed' ? (
                                  <CheckCircle className="w-8 h-8 text-white drop-shadow-sm" />
                                ) : state === 'active' ? (
                                  <span className="font-extrabold text-xl font-mono">{node.order}</span>
                                ) : (
                                  <Lock className="w-6 h-6 text-[#94A3B8]" />
                                )}
                              </motion.button>

                              {/* Popover info */}
                              <AnimatePresence>
                                {activeLessonPopover === lesson.id && (
                                  <div
                                    ref={popoverRef}
                                    className="absolute z-30 w-64 bg-slate-800 text-white rounded-3xl p-5 shadow-2xl border border-slate-700"
                                    style={{ bottom: '84px', left: `${relativeLeft}px` }}
                                  >
                                    <div
                                      className="absolute top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-800"
                                      style={{ left: `${arrowLeft}px`, transform: 'translateX(-50%)' }}
                                    />
                                    <div className="space-y-1 text-center">
                                      <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-700 text-[#FFD93D]">
                                        {lesson.axis || 'المحور العام'}
                                      </span>
                                      <h4 className="font-black text-sm line-clamp-2 mt-1 leading-snug">{lesson.title}</h4>
                                      <p className="text-[10px] text-slate-300 font-bold">{lesson.subTopic}</p>
                                    </div>
                                    <div className="my-3.5 h-[1px] bg-slate-700" />
                                    {state === 'locked' ? (
                                      <div className="text-center text-xs font-extrabold text-slate-400 py-1.5 flex items-center justify-center gap-1.5">
                                        <Lock className="w-4 h-4 text-rose-400" />
                                        <span>{t.lessons.lockedLesson}</span>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="flex justify-around items-center text-xs text-slate-300 font-black">
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-[#FF8C42]" />
                                            <span>{lesson.duration} {t.lessons.duration}</span>
                                          </span>
                                          <span className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <span>+20 XP</span>
                                          </span>
                                        </div>
                                        <Link href={`/lessons/${lesson.id}?childId=${childId}`}>
                                          <button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white text-xs font-black py-2.5 rounded-2xl shadow cursor-pointer block transition-all">
                                            {state === 'completed' ? '🔄 مراجعة الدرس' : t.lessons.startLessonBtn}
                                          </button>
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        } else {
                          // MANDATORY EXERCISE NODE ON THE PATH
                          const exercise = node.data;
                          const isCompleted = node.completed;
                          const isUnlocked = node.unlocked;

                          const bgColor = isCompleted ? '#10B981' : isUnlocked ? '#FF8C42' : '#CBD5E1';
                          const borderColor = isCompleted ? '#059669' : isUnlocked ? '#E0732B' : '#94A3B8';

                          const innerContent = (
                            <motion.div
                              className="w-13 h-13 rounded-full flex items-center justify-center text-base shadow-md border-b-4 cursor-pointer"
                              style={{
                                background: bgColor,
                                borderColor,
                                borderBottomWidth: '4px',
                                borderStyle: 'solid',
                                color: 'white',
                              }}
                              whileHover={isUnlocked ? { scale: 1.1 } : {}}
                              whileTap={isUnlocked ? { scale: 0.95 } : {}}
                            >
                              <span>{isCompleted ? '✅' : isUnlocked ? '🔑' : '🔒'}</span>
                            </motion.div>
                          );

                          // Find optional/challenge exercises for this node's parent lesson
                          const parentLesson = lessons.find((l) => l.id === node.lessonId);
                          const optionalExercises = parentLesson?.exercises?.filter((ex: any) => !ex.isMandatory) || [];
                          const hasVisibleBranches = parentLesson?.read && optionalExercises.length > 0;

                          const exCount = optionalExercises.length;
                          const offsets = getBranchOffsets(exCount);

                          return (
                            <div
                              key={node.id}
                              className="absolute w-13 h-13"
                              style={{
                                left: `${nodeX}px`,
                                top: `${nodeY}px`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 15,
                              }}
                            >
                              <div className="flex flex-col items-center justify-center w-full h-full relative">
                                {isUnlocked ? (
                                  <Link href={`/exercises/${exercise.id}?childId=${childId}&fromLesson=${node.lessonId}`}>
                                    {innerContent}
                                  </Link>
                                ) : (
                                  innerContent
                                )}
                                <span className="text-[8px] font-black text-slate-500 mt-1 uppercase tracking-tight whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                                  {dir === 'rtl' ? 'تمرين إلزامي' : 'Mandatory Ex'}
                                </span>
                              </div>

                              {/* Render Optional Branch nodes (branching from this mandatory exercise) */}
                              {hasVisibleBranches && optionalExercises.map((ex: any, exIdx: number) => {
                                const offset = offsets[exIdx] || { x: 0, y: 70 };
                                return (
                                  <ExerciseBranchNode
                                    key={ex.id}
                                    exercise={ex}
                                    childId={childId!}
                                    lessonId={node.lessonId}
                                    offsetX={offset.x}
                                    offsetY={offset.y}
                                  />
                                );
                              })}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Level Progress and Leaderboard Sidebar */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">

            {/* Student Level Card */}
            {child && (
              <div className="bg-[#1D1B84]/95 rounded-3xl p-5 border border-indigo-500/20 relative overflow-hidden flex flex-col gap-3.5 shadow-lg">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 bg-indigo-400 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-indigo-300 font-extrabold uppercase tracking-wider">
                      {dir === 'rtl' ? 'مستواك الحالي' : 'TON NIVEAU'}
                    </span>
                    <span className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
                      <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                      Niveau {Math.floor(child.points / 1000) + 1}
                    </span>
                  </div>
                  <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Logo size={36} />
                  </div>
                </div>

                <div className="space-y-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="flex justify-between text-[10px] font-black text-indigo-200">
                    <span>{child.points % 1000} / 1000 XP</span>
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Trophy className="w-3 h-3" />
                      {child.points} XP
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-indigo-950/60 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-500" style={{ width: `${Math.min((child.points % 1000) / 10, 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-800 text-sm">
                  {dir === 'rtl' ? 'لوحة المتصدرين' : 'Leaderboard'}
                </h3>
              </div>

              {/* Status alerts */}
              {socialSuccess && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-2.5 text-[10px] font-bold text-center">
                  {socialSuccess}
                </div>
              )}
              {socialError && (
                <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-xl p-2.5 text-[10px] font-bold text-center">
                  {socialError}
                </div>
              )}

              {/* Tab Selector */}
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                <button
                  onClick={() => { setLeaderboardTab('friends'); setSocialError(null); setSocialSuccess(null); }}
                  className={`flex-1 text-center py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all ${leaderboardTab === 'friends' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {dir === 'rtl' ? 'الأصدقاء' : 'Friends'}
                </button>
                <button
                  onClick={() => { setLeaderboardTab('group'); setSocialError(null); setSocialSuccess(null); }}
                  className={`flex-1 text-center py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all ${leaderboardTab === 'group' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {dir === 'rtl' ? 'المجموعة' : 'Group'}
                </button>
              </div>

              {/* Rankings List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {leaderboardTab === 'friends' ? (
                  leaderboard?.friendsLeaderboard && leaderboard.friendsLeaderboard.length > 0 ? (
                    leaderboard.friendsLeaderboard.map((member: any, mIdx: number) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${member.isSelf ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50/50 border-slate-100'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 w-4 text-center">#{mIdx + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase overflow-hidden text-slate-600">
                            {member.avatarUrl ? (
                              <span className="text-base">👤</span>
                            ) : (
                              member.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 leading-tight">
                              {member.name} {member.isSelf && <span className="text-indigo-600 font-extrabold">({dir === 'rtl' ? 'أنت' : 'you'})</span>}
                            </p>
                            <p className="text-[8px] font-semibold text-slate-400 mt-0.5">Lv. {Math.floor(member.points / 1000) + 1}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{member.points} XP</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center font-semibold py-4">
                      {dir === 'rtl' ? 'لا يوجد أصدقاء بعد. أضف صديقاً بكود الصديق!' : 'No friends yet. Add a friend using their code!'}
                    </p>
                  )
                ) : (
                  leaderboard?.groupLeaderboard && leaderboard.groupLeaderboard.length > 0 ? (
                    leaderboard.groupLeaderboard.map((member: any, mIdx: number) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${member.isSelf ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50/50 border-slate-100'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 w-4 text-center">#{mIdx + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase overflow-hidden text-slate-600">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 leading-tight">
                              {member.name} {member.isSelf && <span className="text-indigo-600 font-extrabold">({dir === 'rtl' ? 'أنت' : 'you'})</span>}
                            </p>
                            <p className="text-[8px] font-semibold text-slate-400 mt-0.5">Lv. {Math.floor(member.points / 1000) + 1}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{member.points} XP</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center font-semibold py-4">
                      {dir === 'rtl' ? 'أنت لست في مجموعة حالياً. انضم أو أنشئ مجموعة!' : 'You are not in a group yet. Join or create one!'}
                    </p>
                  )
                )}
              </div>

              {/* Action panels */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
                {leaderboardTab === 'friends' ? (
                  <div className="space-y-2">
                    {/* Share friend code */}
                    {leaderboard?.child?.shareCode && (
                      <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px]">
                        <span className="font-bold text-slate-500">
                          {dir === 'rtl' ? 'كود الصديق الخاص بك:' : 'Your friend code:'}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(leaderboard.child.shareCode);
                            alert(dir === 'rtl' ? 'تم نسخ كود الصديق!' : 'Copied friend code!');
                          }}
                          className="font-black text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm text-[9px]"
                        >
                          {leaderboard.child.shareCode} 📋
                        </button>
                      </div>
                    )}
                    {/* Add friend form */}
                    <form onSubmit={handleAddFriend} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder={dir === 'rtl' ? 'كود الصديق الجديد' : 'Friend Code'}
                        value={friendCodeInput}
                        onChange={(e) => setFriendCodeInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 text-[10px] font-bold p-2 rounded-xl outline-none focus:border-indigo-400 uppercase"
                        maxLength={6}
                      />
                      <button
                        type="submit"
                        disabled={socialLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] px-3.5 rounded-xl border-b-2 border-indigo-900 cursor-pointer disabled:opacity-50"
                      >
                        {dir === 'rtl' ? 'إضافة' : 'Add'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard?.group ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px]">
                          <span className="font-bold text-slate-500 truncate max-w-[120px]">
                            {dir === 'rtl' ? 'المجموعة:' : 'Group:'} <strong className="text-slate-800">{leaderboard.group.name}</strong>
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(leaderboard.group.code);
                              alert(dir === 'rtl' ? 'تم نسخ كود المجموعة!' : 'Copied group code!');
                            }}
                            className="font-black text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm text-[9px]"
                          >
                            {leaderboard.group.code} 📋
                          </button>
                        </div>
                        <button
                          onClick={handleLeaveGroup}
                          disabled={socialLoading}
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] py-2 rounded-xl border-b-2 border-rose-800 cursor-pointer disabled:opacity-50"
                        >
                          {dir === 'rtl' ? 'مغادرة المجموعة' : 'Leave Group'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Join Group */}
                        <form onSubmit={handleJoinGroup} className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder={dir === 'rtl' ? 'كود المجموعة للانضمام' : 'Group Code'}
                            value={groupCodeInput}
                            onChange={(e) => setGroupCodeInput(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-[10px] font-bold p-2 rounded-xl outline-none focus:border-indigo-400 uppercase"
                            maxLength={6}
                          />
                          <button
                            type="submit"
                            disabled={socialLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] px-3.5 rounded-xl border-b-2 border-indigo-900 cursor-pointer disabled:opacity-50"
                          >
                            {dir === 'rtl' ? 'انضمام' : 'Join'}
                          </button>
                        </form>
                        {/* Create Group */}
                        <form onSubmit={handleCreateGroup} className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder={dir === 'rtl' ? 'اسم مجموعة جديدة' : 'New Group Name'}
                            value={groupNameInput}
                            onChange={(e) => setGroupNameInput(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-[10px] font-bold p-2 rounded-xl outline-none focus:border-indigo-400"
                          />
                          <button
                            type="submit"
                            disabled={socialLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3.5 rounded-xl border-b-2 border-emerald-900 cursor-pointer disabled:opacity-50"
                          >
                            {dir === 'rtl' ? 'إنشاء' : 'Create'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#FFFDF9' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FF8C42]" />
      </div>
    }>
      <LessonsContent />
    </Suspense>
  );
}
