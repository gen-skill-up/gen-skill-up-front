'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  MapPin,
  Flag,
  Award,
  Crown
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
  MATHS: { main: '#E8927C', hover: '#D97D67', bg: '#FDF0EB', text: '#A44C36', shadow: 'rgba(232,146,124,0.3)' },
  FRANCAIS: { main: '#F5C26B', hover: '#E5B055', bg: '#FEF8EC', text: '#966014', shadow: 'rgba(245,194,107,0.3)' },
  ARABIC: { main: '#B89FD8', hover: '#A385C7', bg: '#F5F0FB', text: '#6C4E97', shadow: 'rgba(184,159,216,0.3)' },
  SCIENCE: { main: '#95C5B2', hover: '#7EB39E', bg: '#EEF6F3', text: '#2D6A53', shadow: 'rgba(149,197,178,0.3)' },
  ISLAMIC_CIVIC: { main: '#E6BA75', hover: '#D4A75E', bg: '#FBF5EB', text: '#8A601B', shadow: 'rgba(230,186,117,0.3)' },
  ENGLISH: { main: '#F2B5C8', hover: '#E59FB5', bg: '#FDF2F5', text: '#9C4763', shadow: 'rgba(242,181,200,0.3)' },
  SOCIALS: { main: '#AFA3CE', hover: '#9B8EB8', bg: '#F3F1F8', text: '#5B4C83', shadow: 'rgba(175,163,206,0.3)' },
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

// ─── 3D Chibi Avatar Mascot Cheering on the Active Node ──────────────────────
function ChibiMascotCheer({ speechText }: { speechText?: string }) {
  const { dir } = useLanguage();
  return (
    <motion.div
      className="absolute z-30 pointer-events-none flex flex-col items-center"
      style={{ top: '-86px', left: '50%', transform: 'translateX(-50%)' }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm text-[#3D364A] text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-[#F2DDD0] whitespace-nowrap mb-1 flex items-center gap-1.5 relative"
      >
        <span className="text-amber-500">✨</span>
        <span>{speechText || (dir === 'rtl' ? 'أنت هنا! هيا ننطلق 🚀' : 'Tu es ici ! C\'est parti 🚀')}</span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white" />
      </motion.div>

      {/* 3D Chibi Mascot Illustration */}
      <div className="relative w-18 h-18 filter drop-shadow-md">
        <Image
          src="/images/avatar-mascot.png"
          alt="Mascot"
          width={72}
          height={72}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </motion.div>
  );
}

// ─── 3D Golden Stars Rating for Completed Lessons ────────────────────────────
function FloatingStarRating() {
  return (
    <motion.div
      className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-20 pointer-events-none"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-xs rotate-[-12deg]" />
      <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-sm -translate-y-1" />
      <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-xs rotate-[12deg]" />
    </motion.div>
  );
}

// ─── Exercise Branch Node (Optional / Challenge exercises) ───────────────────
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

  const bgColor = isCompleted
    ? 'linear-gradient(135deg, #95C5B2 0%, #76A798 100%)'
    : isChallenge
      ? 'linear-gradient(135deg, #F5C26B 0%, #E5A845 100%)'
      : 'linear-gradient(135deg, #F2A490 0%, #E8927C 100%)';

  const bevelColor = isCompleted
    ? '#5E8B7C'
    : isChallenge
      ? '#C98D2E'
      : '#C8735F';

  return (
    <Link href={`/exercises/${exercise.id}?childId=${childId}&fromLesson=${lessonId}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.15, y: -3 }}
        whileTap={{ scale: 0.92 }}
        className="absolute flex flex-col items-center cursor-pointer group"
        style={{
          left: `calc(50% + ${offsetX}px)`,
          top: `${offsetY}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 22,
        }}
        title={exercise.title}
      >
        {/* Soft 3D Ground Shadow */}
        <div className="absolute -bottom-1 w-12 h-5 rounded-full bg-[#4A321E]/18 blur-xs pointer-events-none" />

        {/* 3D Circular Stage */}
        <div
          className="w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative"
          style={{
            background: bgColor,
            borderBottom: `4px solid ${bevelColor}`,
            boxShadow: '0 6px 14px rgba(70, 45, 25, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
          }}
        >
          {isCompleted ? (
            <Check className="w-6 h-6 text-white stroke-[3] drop-shadow-xs" />
          ) : isChallenge ? (
            <Trophy className="w-5.5 h-5.5 text-white fill-white/20 drop-shadow-xs" />
          ) : (
            <Sparkles className="w-5.5 h-5.5 text-white fill-white/20 drop-shadow-xs" />
          )}
        </div>

        {/* Label Tag */}
        <span
          className="mt-1.5 text-[11px] font-black text-center leading-tight max-w-[70px] uppercase tracking-tight bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-xl shadow-sm border border-[#F2DDD0]"
          style={{
            color: isCompleted ? '#2D6A53' : isChallenge ? '#966014' : '#A44C36',
          }}
        >
          {isCompleted ? 'مكتمل' : isChallenge ? 'تحدي' : 'تدريب'}
        </span>
      </motion.div>
    </Link>
  );
}

function getBranchOffsets(count: number) {
  if (count === 1) return [{ x: -68, y: 64 }];
  if (count === 2) {
    return [
      { x: -75, y: 58 },
      { x: 75, y: 88 },
    ];
  }
  return [
    { x: -105, y: 52 },
    { x: 0, y: 100 },
    { x: 80, y: 68 },
  ];
}

// ─── Floating Clouds Background Animation ────────────────────────────────────
function FloatingClouds() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
      <motion.div
        className="absolute top-12 left-[-120px] w-64 h-24 rounded-full bg-white/40 blur-md"
        animate={{ x: [0, 800, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-96 right-[-150px] w-72 h-28 rounded-full bg-white/35 blur-md"
        animate={{ x: [0, -850, 0] }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear', delay: 4 }}
      />
      <motion.div
        className="absolute bottom-64 left-[-100px] w-80 h-32 rounded-full bg-white/30 blur-lg"
        animate={{ x: [0, 750, 0] }}
        transition={{ duration: 52, repeat: Infinity, ease: 'linear', delay: 8 }}
      />
    </div>
  );
}

// ─── Wooden Bridge Segment Graphic ───────────────────────────────────────────
function WoodenBridgeOverlay({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="w-24 h-10 rounded-xl bg-gradient-to-r from-[#B47F4B] via-[#C99661] to-[#B47F4B] border-2 border-[#86592F] shadow-lg flex items-center justify-around px-1 relative overflow-hidden">
        {/* Wooden Planks */}
        <div className="w-1.5 h-full bg-[#86592F]/40" />
        <div className="w-1.5 h-full bg-[#86592F]/40" />
        <div className="w-1.5 h-full bg-[#86592F]/40" />
        <div className="w-1.5 h-full bg-[#86592F]/40" />
        <div className="w-1.5 h-full bg-[#86592F]/40" />
        <div className="w-1.5 h-full bg-[#86592F]/40" />
        {/* Railings */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#86592F]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#86592F]" />
      </div>
    </div>
  );
}

// ─── Main Content Component ──────────────────────────────────────────────────
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
  const [containerWidth, setContainerWidth] = useState(450);
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
    childrenApi
      .getLeaderboard(childId)
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
          style={{ background: 'rgba(232,146,124,0.15)', border: '2px solid rgba(232,146,124,0.3)' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <HelpCircle className="w-10 h-10 text-[#E8927C]" />
        </motion.div>
        <h2 className="text-2xl font-black mb-2 text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
          الرجاء اختيار طفل أولاً / Please Select a Child
        </h2>
        <p className="text-[#6E637C] text-sm mb-8 max-w-sm font-semibold">
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

    const mandatoryEx = lesson.exercises?.find((ex) => ex.isMandatory);
    if (mandatoryEx) {
      pathNodes.push({
        type: 'MANDATORY_EXERCISE',
        id: mandatoryEx.id,
        lessonId: lesson.id,
        title: mandatoryEx.title,
        order: index + 1,
        data: mandatoryEx,
        unlocked: lesson.read,
        completed: mandatoryEx.completed,
      });
    }
  });

  // Calculate Natural Winding Coordinates
  const getX = (index: number) => {
    const isMobile = containerWidth < 480;
    const padding = isMobile ? 65 : 100;
    const usableWidth = Math.max(containerWidth - padding * 2, 160);
    const mid = containerWidth / 2;
    const amp = usableWidth * 0.38;

    // Organic wavy pattern that meanders gently across landscape features
    const wavePattern = [0, 0.78, 0.15, -0.78, -0.22, 0.82];
    const offset = wavePattern[index % wavePattern.length];
    return mid + amp * offset;
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

  const NODE_SPACING = 115;
  const BRANCH_EXTRA = 75;

  const lessonYPositions: number[] = [];
  let cumulativeY = 130; // initial top margin for start flag / milestone
  for (let i = 0; i < pathNodes.length; i++) {
    lessonYPositions.push(cumulativeY);
    const node = pathNodes[i];

    let hasVisibleBranches = false;
    if (node.type === 'MANDATORY_EXERCISE') {
      const parentLesson = lessons.find((l) => l.id === node.lessonId);
      const optionalExercisesCount = parentLesson?.exercises?.filter((ex: any) => !ex.isMandatory).length ?? 0;
      hasVisibleBranches = (parentLesson?.read ?? false) && optionalExercisesCount > 0;
    }

    cumulativeY += NODE_SPACING + (hasVisibleBranches ? BRANCH_EXTRA : 0);
  }

  // Extra room for the Final Golden Treasure Chest at the top or bottom
  const containerHeight = Math.max(900, cumulativeY + 160);

  // Generate Smooth Cubic Bézier Curves for the Winding Trail
  let pathD = '';
  for (let i = 0; i < pathNodes.length; i++) {
    const x = getX(i);
    const y = lessonYPositions[i];
    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevX = getX(i - 1);
      const prevY = lessonYPositions[i - 1];
      const dy = y - prevY;
      const cpY1 = prevY + dy * 0.45;
      const cpY2 = y - dy * 0.45;
      pathD += ` C ${prevX} ${cpY1}, ${x} ${cpY2}, ${x} ${y}`;
    }
  }

  const currentColorSet = subjectColors[selectedSubject] || subjectColors.MATHS;
  const availableTabs = gradeSubjects[selectedGrade] || [];
  const completedLessonsCount = lessons.filter((l) => l.completed).length;
  const totalLessonsCount = lessons.length;
  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24 grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* Main Column: Header Banner + Subjects + Adventure Map Canvas */}
      <div className="lg:col-span-3 flex flex-col space-y-6">

        {/* Top Header Banner */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-6 sm:p-7 border border-[#F2DDD0] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-[0.07] bg-[#E8927C] pointer-events-none" />
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FDF0EB] to-[#FDE1D7] text-[#E8927C] flex items-center justify-center shadow-inner shrink-0 border border-[#F2DDD0]">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                {t.lessons.title}
              </h1>
              <p className="text-[#6E637C] text-sm sm:text-base font-bold mt-1">{t.lessons.subtitle}</p>
            </div>
          </div>

          {/* Grade Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
              className="flex items-center gap-2.5 bg-[#FAF8F5] border-2 border-[#F2DDD0] hover:border-[#E8927C] text-[#3D364A] text-sm font-black px-5 py-3 rounded-2xl shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <span>{(t.lessons.grades as any)[`g${selectedGrade}`] || `السنة ${selectedGrade}`}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGradeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isGradeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-52 bg-white border border-[#F2DDD0] rounded-2xl shadow-xl z-40 overflow-hidden"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleGradeChange(g)}
                      className={`w-full text-right px-4 py-3 text-sm font-bold transition-all block cursor-pointer border-b border-[#F9F5F0] hover:bg-[#FDF0EB] ${
                        selectedGrade === g ? 'text-[#E8927C] bg-[#FDF0EB]/60 font-black' : 'text-[#3D364A]'
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

        {/* Split Layout: Subjects Sidebar + Adventure Map */}
        <div className="flex flex-col md:flex-row gap-6 items-start animate-fade-in" style={{ direction: dir }}>

          {/* Subjects Navigation Buttons */}
          <div className="flex flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-52 overflow-x-auto md:overflow-visible pb-2 md:pb-0" style={{ direction: dir }}>
            {availableTabs.map((subject) => {
              const isAvailable = AVAILABLE_SUBJECTS.has(subject);
              const isSelected = selectedSubject === subject;
              const colors = subjectColors[subject] || subjectColors.MATHS;
              const TabIcon = subjectIcons[subject] || BookOpen;
              return (
                <button
                  key={subject}
                  onClick={() => {
                    if (!isAvailable) {
                      setComingSoonSubject(subject);
                      return;
                    }
                    setSelectedSubject(subject);
                    setActiveLessonPopover(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all border-2 shrink-0 md:w-full ${
                    dir === 'rtl' ? 'text-right justify-start flex-row-reverse' : 'text-left justify-start'
                  }`}
                  style={{
                    background: isSelected && isAvailable ? 'white' : '#FAF8F5',
                    borderColor: isSelected && isAvailable ? colors.main : 'rgba(0,0,0,0.06)',
                    color: isAvailable ? (isSelected ? colors.text : '#6E637C') : '#A49AA7',
                    boxShadow: isSelected && isAvailable ? `0 6px 18px ${colors.shadow}` : 'none',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.65,
                    filter: isAvailable ? 'none' : 'grayscale(1)',
                  }}
                >
                  <TabIcon className="w-5 h-5 shrink-0" style={{ color: isAvailable ? colors.main : '#A49AA7' }} />
                  <span className="truncate">{getSubjectLabel(subject)}</span>
                  {!isAvailable && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(164,154,167,0.15)',
                        color: '#8C8191',
                        borderRadius: '999px',
                        padding: '2px 7px',
                        fontWeight: 800,
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

          {/* ════════════════════════════════════════════════════════════════════
              ADVENTURE MAP CANVAS (خريطة المغامرة المدمجة بالصور والمسار الطبيعي)
             ════════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 w-full min-w-0">

            {/* Coming Soon Modal */}
            <AnimatePresence>
              {comingSoonSubject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  style={{ background: 'rgba(61,54,74,0.5)', backdropFilter: 'blur(5px)' }}
                  onClick={() => setComingSoonSubject(null)}
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="bg-white rounded-3xl p-8 shadow-2xl border border-[#F2DDD0] max-w-xs w-full mx-4 text-center relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-5xl mb-4 animate-bounce">🚧</div>
                    <h3 className="text-xl font-black text-[#3D364A] mb-2" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                      {getSubjectLabel(comingSoonSubject)}
                    </h3>
                    <p className="text-[#6E637C] text-sm font-bold mb-1">هذه المادة قيد الإعداد والإطلاق قريباً!</p>
                    <p className="text-[#8C8191] text-xs font-semibold mb-6">
                      نعمل حالياً فقط على مادة <span className="text-[#E8927C] font-black">الرياضيات</span> 🧮<br />
                      ترقّبوا الإضافات الساحرة قريباً! 🎉
                    </p>
                    <button
                      onClick={() => setComingSoonSubject(null)}
                      className="w-full bg-[#E8927C] hover:bg-[#D97D67] text-white text-base font-black py-3 rounded-2xl shadow-md border-b-4 border-[#C8735F] cursor-pointer transition-all active:translate-y-0.5"
                    >
                      حسناً، سأنتظر! 👍
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 bg-white/70 rounded-[2.5rem] border border-[#F2DDD0]">
                <Loader2 className="w-12 h-12 animate-spin text-[#E8927C] mb-3" />
                <p className="text-[#6E637C] text-sm font-black animate-pulse">جاري رسم خريطة المغامرة...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-[#F2DDD0] max-w-md mx-auto">
                <Logo size={52} className="mx-auto opacity-40 mb-4 animate-float" />
                <h3 className="text-xl font-black text-[#3D364A]">لا توجد دروس حالياً لهذا المستوى</h3>
                <p className="text-sm text-[#6E637C] font-bold mt-1">سيتم إضافة محاور ودروس جديدة قريباً!</p>
              </div>
            ) : (
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[5px] border-white shadow-[0_20px_50px_rgba(74,68,88,0.12)] bg-[#FAF4ED]">

                {/* 1. Background Scenery Illustration Layer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "url('/images/map-adventure-bg.jpg')",
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'repeat-y',
                    backgroundPosition: 'top center',
                    opacity: 0.95,
                  }}
                />

                {/* 2. Soft Ambient Tint & Vignette Overlays */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 via-transparent to-white/30" />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(253,248,243,0.5)]" />

                {/* 3. Floating Clouds Atmosphere */}
                <FloatingClouds />

                {/* 4. Top Floating World HUD Status Bar */}
                <div className="relative z-20 px-4 sm:px-6 pt-5 pb-3">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#F2DDD0] shadow-md flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF0EB] text-[#E8927C] flex items-center justify-center font-bold text-lg">
                        🏝️
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#3D364A] leading-tight">
                          {getSubjectLabel(selectedSubject)} • {(t.lessons.grades as any)[`g${selectedGrade}`]}
                        </h3>
                        <p className="text-xs text-[#6E637C] font-bold">
                          {completedLessonsCount} من {totalLessonsCount} درساً مكتمل ({completionPercentage}%)
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Stars Badge */}
                    <div className="flex items-center gap-3">
                      <div className="w-28 sm:w-36 h-3 bg-[#F0EAE3] rounded-full overflow-hidden border border-[#E2DDD5]">
                        <div
                          className="h-full bg-gradient-to-r from-[#95C5B2] to-[#7EB39E] rounded-full transition-all duration-700 shadow-xs"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-[#FEF8EC] text-[#966014] px-3 py-1 rounded-xl text-xs font-black border border-[#F5C26B]/40 shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-[#F5C26B] text-[#F5C26B]" />
                        <span>{child?.stars || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Start Flag Signpost at the Top */}
                <div className="relative z-10 flex justify-center pt-2">
                  <div className="bg-white/95 backdrop-blur-xs text-[#3D364A] text-xs font-black px-4 py-1.5 rounded-full shadow-md border-2 border-[#E8927C]/30 flex items-center gap-1.5 animate-pulse">
                    <Flag className="w-4 h-4 text-[#E8927C] fill-[#E8927C]" />
                    <span>🏁 انطلاقة رحلة التعلم • البداية</span>
                  </div>
                </div>

                {/* 6. Interactive Winding Map Stage */}
                <div
                  ref={containerRef}
                  className="relative w-full mx-auto"
                  style={{
                    height: `${containerHeight}px`,
                    direction: 'ltr', // Keep SVG path geometry strictly consistent LTR
                  }}
                >
                  {/* Multi-Layered Natural Scenic SVG Path */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      {/* Smooth Path Shadow Filter */}
                      <filter id="path-soil-shadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#4A321E" floodOpacity="0.22" />
                      </filter>

                      {/* Soil Bedding Gradient */}
                      <linearGradient id="soil-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C99D6E" />
                        <stop offset="100%" stopColor="#B38655" />
                      </linearGradient>

                      {/* Cobblestone Sandy Core Gradient */}
                      <linearGradient id="cobble-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF4E3" />
                        <stop offset="100%" stopColor="#F5E4CE" />
                      </linearGradient>
                    </defs>

                    {/* Layer 1: Earthen Trench Foundation with Soft Drop Shadow */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#soil-gradient)"
                        strokeWidth="44"
                        strokeLinecap="round"
                        filter="url(#path-soil-shadow)"
                      />
                    )}

                    {/* Layer 2: Cobblestone Roadbed */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#cobble-gradient)"
                        strokeWidth="32"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Layer 3: Natural Stone Speckle Edges */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#DDBB93"
                        strokeWidth="32"
                        strokeDasharray="4 8"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Layer 4: Stepping Stones / Paving Slabs */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="14"
                        strokeDasharray="22 18"
                        strokeLinecap="round"
                        strokeOpacity="0.95"
                      />
                    )}

                    {/* Branch Lines for Exercises (Stone paths branching to optional islands) */}
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
                        const branchPathString = `M ${nodeX} ${nodeY + 14} C ${nodeX} ${cpY1}, ${targetX} ${cpY2}, ${targetX} ${targetY}`;

                        return (
                          <g key={ex.id}>
                            {/* Branch Dirt Trench */}
                            <path
                              d={branchPathString}
                              fill="none"
                              stroke="#C99D6E"
                              strokeWidth="20"
                              strokeLinecap="round"
                              opacity="0.8"
                            />
                            {/* Branch Cobblestone */}
                            <path
                              d={branchPathString}
                              fill="none"
                              stroke="#FFF5E8"
                              strokeWidth="14"
                              strokeLinecap="round"
                            />
                            {/* Branch Dashed Stones */}
                            <path
                              d={branchPathString}
                              fill="none"
                              stroke="#F5C26B"
                              strokeWidth="6"
                              strokeDasharray="8 6"
                              strokeLinecap="round"
                            />
                          </g>
                        );
                      });
                    })}
                  </svg>

                  {/* Midpoint Wooden Bridge Crossing */}
                  {pathNodes.length >= 4 && (
                    <WoodenBridgeOverlay
                      x={(getX(1) + getX(2)) / 2}
                      y={(lessonYPositions[1] + lessonYPositions[2]) / 2}
                    />
                  )}

                  {/* ════════════════════════════════════════════════════════════
                      Nodes Rendering (Pedestals, Chibi Mascot, Stars & Popovers)
                     ════════════════════════════════════════════════════════════ */}
                  {pathNodes.map((node, idx) => {
                    const nodeX = getX(idx);
                    const nodeY = lessonYPositions[idx];
                    const isMascotHere = mascotNodeIndex === idx;

                    if (node.type === 'LESSON') {
                      const lesson = node.data;

                      let state: 'completed' | 'active' | 'locked' = 'locked';
                      if (lesson.completed) state = 'completed';
                      else if (lesson.unlocked) state = 'active';

                      const popoverWidth = 280;
                      const halfWidth = popoverWidth / 2;
                      const margin = 16;
                      const absoluteLeft = Math.max(margin, Math.min(containerWidth - popoverWidth - margin, nodeX - halfWidth));
                      const relativeLeft = absoluteLeft - (nodeX - 40);
                      const arrowLeft = nodeX - absoluteLeft;

                      return (
                        <div
                          key={node.id}
                          className="absolute w-20 h-20"
                          style={{
                            left: `${nodeX}px`,
                            top: `${nodeY}px`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 18,
                          }}
                        >
                          {/* 3D Ground Earthen Shadow Mound */}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-22 h-9 rounded-full bg-[#4A321E]/22 blur-xs pointer-events-none" />

                          {/* Completed State: Floating 3D Star Crown */}
                          {state === 'completed' && <FloatingStarRating />}

                          {/* Active State: 3D Chibi Avatar Mascot Cheering */}
                          {isMascotHere && state === 'active' && <ChibiMascotCheer />}

                          {/* Active State: Glowing Ripple Beacon */}
                          {state === 'active' && (
                            <div className="absolute inset-0 rounded-full bg-[#E8927C] opacity-40 animate-ping pointer-events-none" />
                          )}

                          {/* 3D Tactile Lesson Pedestal Button */}
                          <motion.button
                            onClick={() => {
                              setActiveLessonPopover(activeLessonPopover === lesson.id ? null : lesson.id);
                            }}
                            className="w-20 h-20 rounded-full flex items-center justify-center relative cursor-pointer outline-none transition-all"
                            style={{
                              background:
                                state === 'completed'
                                  ? 'linear-gradient(135deg, #A8D8C5 0%, #7EB39E 100%)'
                                  : state === 'active'
                                    ? 'linear-gradient(135deg, #F5A997 0%, #E8927C 100%)'
                                    : 'linear-gradient(135deg, #EAE5DE 0%, #D8D2C9 100%)',
                              borderBottom: `6px solid ${
                                state === 'completed' ? '#5E9883' : state === 'active' ? '#C8735F' : '#B8ADA1'
                              }`,
                              boxShadow:
                                state === 'active'
                                  ? '0 10px 25px rgba(232, 146, 124, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.7)'
                                  : '0 8px 18px rgba(70, 45, 25, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
                            }}
                            whileHover={{ scale: state === 'locked' ? 1.02 : 1.1, y: -4 }}
                            whileTap={{ scale: state === 'locked' ? 1 : 0.94 }}
                            animate={state === 'active' ? { y: [0, -4, 0] } : {}}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {/* Inner Gloss Ring */}
                            <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none" />

                            {state === 'completed' ? (
                              <CheckCircle className="w-10 h-10 text-white drop-shadow-md" />
                            ) : state === 'active' ? (
                              <span className="font-black text-2xl font-mono text-white drop-shadow-md">
                                {node.order}
                              </span>
                            ) : (
                              <Lock className="w-7 h-7 text-[#8C8191]" />
                            )}
                          </motion.button>

                          {/* Lesson Info Popover */}
                          <AnimatePresence>
                            {activeLessonPopover === lesson.id && (
                              <div
                                ref={popoverRef}
                                className="absolute z-40 w-72 bg-white/95 backdrop-blur-md text-[#3D364A] rounded-3xl p-5 shadow-2xl border-2 border-[#F2DDD0]"
                                style={{ bottom: '92px', left: `${relativeLeft}px`, direction: dir }}
                              >
                                <div
                                  className="absolute top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"
                                  style={{ left: `${arrowLeft}px`, transform: 'translateX(-50%)' }}
                                />
                                <div className="space-y-1.5 text-center">
                                  <span className="inline-block text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-xl bg-[#FDF0EB] text-[#E8927C] border border-[#F2DDD0]">
                                    {lesson.axis || 'المحور العام'}
                                  </span>
                                  <h4 className="font-black text-base line-clamp-2 mt-1 leading-snug text-[#3D364A]">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs text-[#6E637C] font-bold">{lesson.subTopic}</p>
                                </div>

                                <div className="my-3.5 h-[1px] bg-[#F4EBE3]" />

                                {state === 'locked' ? (
                                  <div className="text-center text-sm font-extrabold text-[#A49AA7] py-2 flex items-center justify-center gap-1.5">
                                    <Lock className="w-4 h-4 text-rose-400" />
                                    <span>{t.lessons.lockedLesson}</span>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex justify-around items-center text-xs text-[#6E637C] font-black">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-[#E8927C]" />
                                        <span>{lesson.duration} {t.lessons.duration}</span>
                                      </span>
                                      <span className="flex items-center gap-1 text-[#F5C26B]">
                                        <Star className="w-4 h-4 fill-[#F5C26B]" />
                                        <span>+20 XP</span>
                                      </span>
                                    </div>
                                    <Link href={`/lessons/${lesson.id}?childId=${childId}`}>
                                      <button className="w-full bg-[#E8927C] hover:bg-[#D97D67] text-white text-sm font-black py-2.5 rounded-2xl shadow-md border-b-2 border-[#C9725C] cursor-pointer block transition-all active:translate-y-0.5">
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
                      // MANDATORY EXERCISE NODE
                      const exercise = node.data;
                      const isCompleted = node.completed;
                      const isUnlocked = node.unlocked;

                      const bgColor = isCompleted
                        ? 'linear-gradient(135deg, #95C5B2 0%, #76A798 100%)'
                        : isUnlocked
                          ? 'linear-gradient(135deg, #F2A490 0%, #E8927C 100%)'
                          : 'linear-gradient(135deg, #EAE5DE 0%, #D8D2C9 100%)';

                      const bevelColor = isCompleted ? '#5E8B7C' : isUnlocked ? '#C8735F' : '#B8ADA1';

                      const innerContent = (
                        <motion.div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-base shadow-md cursor-pointer relative"
                          style={{
                            background: bgColor,
                            borderBottom: `4px solid ${bevelColor}`,
                            boxShadow: '0 6px 14px rgba(70, 45, 25, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
                            color: 'white',
                          }}
                          whileHover={isUnlocked ? { scale: 1.12, y: -3 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                        >
                          <span className="text-lg">{isCompleted ? '✅' : isUnlocked ? '🔑' : '🔒'}</span>
                        </motion.div>
                      );

                      const parentLesson = lessons.find((l) => l.id === node.lessonId);
                      const optionalExercises = parentLesson?.exercises?.filter((ex: any) => !ex.isMandatory) || [];
                      const hasVisibleBranches = parentLesson?.read && optionalExercises.length > 0;
                      const exCount = optionalExercises.length;
                      const offsets = getBranchOffsets(exCount);

                      return (
                        <div
                          key={node.id}
                          className="absolute w-14 h-14"
                          style={{
                            left: `${nodeX}px`,
                            top: `${nodeY}px`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 16,
                          }}
                        >
                          {/* Ground Shadow */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-6 rounded-full bg-[#4A321E]/18 blur-xs pointer-events-none" />

                          <div className="flex flex-col items-center justify-center w-full h-full relative">
                            {isUnlocked ? (
                              <Link href={`/exercises/${exercise.id}?childId=${childId}&fromLesson=${node.lessonId}`}>
                                {innerContent}
                              </Link>
                            ) : (
                              innerContent
                            )}
                            <span className="text-[10px] font-black text-[#6E637C] mt-1.5 uppercase tracking-tight whitespace-nowrap bg-white/95 px-2.5 py-0.5 rounded-full shadow-xs border border-[#F2DDD0]">
                              {dir === 'rtl' ? 'تمرين إلزامي' : 'Mandatory Ex'}
                            </span>
                          </div>

                          {/* Branch nodes for optional/challenge exercises */}
                          {hasVisibleBranches &&
                            optionalExercises.map((ex: any, exIdx: number) => {
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

                  {/* ════════════════════════════════════════════════════════════
                      7. Final Destination: 3D Golden Treasure Chest Monument
                     ════════════════════════════════════════════════════════════ */}
                  <div
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${containerWidth / 2}px`,
                      top: `${cumulativeY + 50}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20,
                    }}
                  >
                    {/* Cloud Island Pedestal */}
                    <motion.div
                      className="relative flex flex-col items-center"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {/* Aura Glow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-amber-400/25 blur-xl pointer-events-none animate-pulse" />

                      {/* 3D Golden Treasure Chest Graphic */}
                      <div className="relative w-36 h-36 filter drop-shadow-xl">
                        <Image
                          src="/images/treasure-chest.png"
                          alt="Golden Treasure Chest"
                          width={144}
                          height={144}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Milestone Title Badge */}
                      <div className="mt-2 bg-gradient-to-r from-amber-400 via-[#F5C26B] to-amber-400 text-white font-black text-sm px-5 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1.5 whitespace-nowrap">
                        <Crown className="w-4 h-4 fill-white" />
                        <span>🏆 كنز الإتقان النهائي • +150 XP</span>
                      </div>
                      <p className="text-xs font-bold text-[#6E637C] mt-1 bg-white/80 px-3 py-0.5 rounded-full shadow-2xs">
                        أكمل جميع الدروس والتمارين لفتح الكنز!
                      </p>
                    </motion.div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Student Level Card and Social Leaderboard */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">

        {/* Student Level Card */}
        {child && (
          <div className="bg-gradient-to-br from-[#E8927C] to-[#E58066] rounded-[2rem] p-6 border border-[#F2B5C8]/40 relative overflow-hidden flex flex-col gap-4 shadow-lg text-white">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-20 bg-white blur-lg pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-white/80 font-black uppercase tracking-wider">
                  {dir === 'rtl' ? 'مستواك الحالي' : 'TON NIVEAU'}
                </span>
                <span className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                  <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                  Niveau {Math.floor(child.points / 1000) + 1}
                </span>
              </div>
              <div className="w-14 h-14 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <Logo size={40} />
              </div>
            </div>

            <div className="space-y-1.5 bg-black/10 rounded-2xl p-3.5 border border-white/10">
              <div className="flex justify-between text-xs font-black text-white/90">
                <span>{child.points % 1000} / 1000 XP</span>
                <span className="text-amber-200 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {child.points} XP
                </span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-white rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.min((child.points % 1000) / 10, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Card */}
        <div className="bg-white rounded-[2rem] p-6 border border-[#F2DDD0] shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h3 className="font-black text-[#3D364A] text-base">
              {dir === 'rtl' ? 'لوحة المتصدرين' : 'Leaderboard'}
            </h3>
          </div>

          {socialSuccess && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl p-3 text-xs font-bold text-center">
              {socialSuccess}
            </div>
          )}
          {socialError && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl p-3 text-xs font-bold text-center">
              {socialError}
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex bg-[#F9F5F0] p-1.5 rounded-2xl border border-[#F2DDD0]">
            <button
              onClick={() => {
                setLeaderboardTab('friends');
                setSocialError(null);
                setSocialSuccess(null);
              }}
              className={`flex-1 text-center py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                leaderboardTab === 'friends' ? 'bg-[#E8927C] text-white shadow-xs' : 'text-[#6E637C] hover:text-[#3D364A]'
              }`}
            >
              {dir === 'rtl' ? 'الأصدقاء' : 'Friends'}
            </button>
            <button
              onClick={() => {
                setLeaderboardTab('group');
                setSocialError(null);
                setSocialSuccess(null);
              }}
              className={`flex-1 text-center py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                leaderboardTab === 'group' ? 'bg-[#E8927C] text-white shadow-xs' : 'text-[#6E637C] hover:text-[#3D364A]'
              }`}
            >
              {dir === 'rtl' ? 'المجموعة' : 'Group'}
            </button>
          </div>

          {/* Rankings List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {leaderboardTab === 'friends' ? (
              leaderboard?.friendsLeaderboard && leaderboard.friendsLeaderboard.length > 0 ? (
                leaderboard.friendsLeaderboard.map((member: any, mIdx: number) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      member.isSelf ? 'bg-[#FDF0EB] border-[#E8927C]/40 shadow-2xs' : 'bg-[#FAF8F5] border-[#F2DDD0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-[#A49AA7] w-5 text-center">#{mIdx + 1}</span>
                      <div className="w-9 h-9 rounded-full bg-white border border-[#F2DDD0] flex items-center justify-center font-bold text-xs uppercase overflow-hidden text-[#3D364A] shadow-2xs">
                        {member.avatarUrl ? <span className="text-base">👤</span> : member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#3D364A] leading-tight">
                          {member.name}{' '}
                          {member.isSelf && <span className="text-[#E8927C] font-extrabold">({dir === 'rtl' ? 'أنت' : 'you'})</span>}
                        </p>
                        <p className="text-[10px] font-bold text-[#A49AA7] mt-0.5">Lv. {Math.floor(member.points / 1000) + 1}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#E8927C] bg-[#FDF0EB] border border-[#F2DDD0] px-2.5 py-1 rounded-full">
                      {member.points} XP
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#A49AA7] text-center font-bold py-5">
                  {dir === 'rtl' ? 'لا يوجد أصدقاء بعد. أضف صديقاً بكود الصديق!' : 'No friends yet. Add a friend using their code!'}
                </p>
              )
            ) : leaderboard?.groupLeaderboard && leaderboard.groupLeaderboard.length > 0 ? (
              leaderboard.groupLeaderboard.map((member: any, mIdx: number) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    member.isSelf ? 'bg-[#FDF0EB] border-[#E8927C]/40 shadow-2xs' : 'bg-[#FAF8F5] border-[#F2DDD0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-[#A49AA7] w-5 text-center">#{mIdx + 1}</span>
                    <div className="w-9 h-9 rounded-full bg-white border border-[#F2DDD0] flex items-center justify-center font-bold text-xs uppercase overflow-hidden text-[#3D364A] shadow-2xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#3D364A] leading-tight">
                        {member.name}{' '}
                        {member.isSelf && <span className="text-[#E8927C] font-extrabold">({dir === 'rtl' ? 'أنت' : 'you'})</span>}
                      </p>
                      <p className="text-[10px] font-bold text-[#A49AA7] mt-0.5">Lv. {Math.floor(member.points / 1000) + 1}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#E8927C] bg-[#FDF0EB] border border-[#F2DDD0] px-2.5 py-1 rounded-full">
                    {member.points} XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#A49AA7] text-center font-bold py-5">
                {dir === 'rtl' ? 'أنت لست في مجموعة حالياً. انضم أو أنشئ مجموعة!' : 'You are not in a group yet. Join or create one!'}
              </p>
            )}
          </div>

          {/* Social Action Panels */}
          <div className="border-t border-[#F2DDD0] pt-4 flex flex-col gap-3">
            {leaderboardTab === 'friends' ? (
              <div className="space-y-2.5">
                {leaderboard?.child?.shareCode && (
                  <div className="flex justify-between items-center bg-[#FAF8F5] border border-[#F2DDD0] rounded-2xl p-2.5 text-xs">
                    <span className="font-bold text-[#6E637C]">{dir === 'rtl' ? 'كود الصديق الخاص بك:' : 'Your friend code:'}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(leaderboard.child.shareCode);
                        alert(dir === 'rtl' ? 'تم نسخ كود الصديق!' : 'Copied friend code!');
                      }}
                      className="font-black text-[#E8927C] bg-white border border-[#F2DDD0] px-3 py-1.5 rounded-xl hover:bg-[#FDF0EB] cursor-pointer shadow-2xs text-xs"
                    >
                      {leaderboard.child.shareCode} 📋
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddFriend} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={dir === 'rtl' ? 'كود الصديق الجديد' : 'Friend Code'}
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#F2DDD0] text-xs font-bold p-2.5 rounded-2xl outline-none focus:border-[#E8927C] uppercase text-[#3D364A]"
                    maxLength={6}
                  />
                  <button
                    type="submit"
                    disabled={socialLoading}
                    className="bg-[#E8927C] hover:bg-[#D97D67] text-white font-black text-xs px-4 py-2 rounded-2xl border-b-2 border-[#C9725C] cursor-pointer disabled:opacity-50"
                  >
                    {dir === 'rtl' ? 'إضافة' : 'Add'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard?.group ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center bg-[#FAF8F5] border border-[#F2DDD0] rounded-2xl p-2.5 text-xs">
                      <span className="font-bold text-[#6E637C] truncate max-w-[130px]">
                        {dir === 'rtl' ? 'المجموعة:' : 'Group:'} <strong className="text-[#3D364A]">{leaderboard.group.name}</strong>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(leaderboard.group.code);
                          alert(dir === 'rtl' ? 'تم نسخ كود المجموعة!' : 'Copied group code!');
                        }}
                        className="font-black text-[#E8927C] bg-white border border-[#F2DDD0] px-3 py-1.5 rounded-xl hover:bg-[#FDF0EB] cursor-pointer shadow-2xs text-xs"
                      >
                        {leaderboard.group.code} 📋
                      </button>
                    </div>
                    <button
                      onClick={handleLeaveGroup}
                      disabled={socialLoading}
                      className="w-full bg-[#E57373] hover:bg-[#D32F2F] text-white font-black text-xs py-2.5 rounded-2xl border-b-2 border-[#B71C1C] cursor-pointer disabled:opacity-50"
                    >
                      {dir === 'rtl' ? 'مغادرة المجموعة' : 'Leave Group'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <form onSubmit={handleJoinGroup} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={dir === 'rtl' ? 'كود المجموعة للانضمام' : 'Group Code'}
                        value={groupCodeInput}
                        onChange={(e) => setGroupCodeInput(e.target.value)}
                        className="flex-1 bg-[#FAF8F5] border border-[#F2DDD0] text-xs font-bold p-2.5 rounded-2xl outline-none focus:border-[#E8927C] uppercase text-[#3D364A]"
                        maxLength={6}
                      />
                      <button
                        type="submit"
                        disabled={socialLoading}
                        className="bg-[#E8927C] hover:bg-[#D97D67] text-white font-black text-xs px-4 py-2 rounded-2xl border-b-2 border-[#C9725C] cursor-pointer disabled:opacity-50"
                      >
                        {dir === 'rtl' ? 'انضمام' : 'Join'}
                      </button>
                    </form>
                    <form onSubmit={handleCreateGroup} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={dir === 'rtl' ? 'اسم مجموعة جديدة' : 'New Group Name'}
                        value={groupNameInput}
                        onChange={(e) => setGroupNameInput(e.target.value)}
                        className="flex-1 bg-[#FAF8F5] border border-[#F2DDD0] text-xs font-bold p-2.5 rounded-2xl outline-none focus:border-[#95C5B2] text-[#3D364A]"
                      />
                      <button
                        type="submit"
                        disabled={socialLoading}
                        className="bg-[#95C5B2] hover:bg-[#7EB39E] text-white font-black text-xs px-4 py-2 rounded-2xl border-b-2 border-[#6A9C8B] cursor-pointer disabled:opacity-50"
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
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#FFFDF9' }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#E8927C]" />
        </div>
      }
    >
      <LessonsContent />
    </Suspense>
  );
}
