'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, childrenApi, lessonsApi, gamificationApi, exercisesApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import OwlLogo from '../components/Logo';
import {
  Sprout,
  Rocket,
  Trophy,
  Cat,
  Dog,
  Fish,
  Bird,
  Rabbit,
  Smile,
  Ghost,
  Crown,
  Bot,
  Plus,
  Loader2,
  Target,
  BookOpen,
  Zap,
  Star,
  Flame,
  UserPlus,
  Award,
  Sparkles,
  Brain,
  Compass,
  Gift,
  MessageCircle,
  Globe,
  BookmarkCheck,
  Play,
  CheckCircle2,
  Clock,
  Heart,
  Lock,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Video,
  Layers,
  MapPin,
  X
} from 'lucide-react';

interface LessonCompletion {
  id: string;
  lessonId: string;
  completedAt: string;
  lesson: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    duration: number;
    order: number;
    grade: number;
    axis?: string;
    subTopic?: string;
  };
}

interface ExerciseResult {
  id: string;
  exerciseId: string;
  completedAt: string;
  score: number;
  exercise: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
  };
}

interface PlacementTestResult {
  id: string;
  score: number;
  level: string;
  aiAnalysis?: {
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
}

interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  grade?: number;
  points: number;
  stars: number;
  streakDays: number;
  avatarUrl?: string;
  completedLessons?: LessonCompletion[];
  exerciseResults?: ExerciseResult[];
  testResults?: PlacementTestResult[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  subject?: string;
  completed?: boolean;
}

const avatarMap: Record<string, any> = {
  cat: Cat,
  dog: Dog,
  fish: Fish,
  bird: Bird,
  rabbit: Rabbit,
  smile: Smile,
  ghost: Ghost,
  crown: Crown,
  robot: Bot,
};

const avatarBgColors = ['#E8927C', '#95C5B2', '#C4A6D7', '#F0C987', '#F2B5C8', '#7EB5D6'];

const levelInfo: Record<string, { labelKey: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'; color: string; bg: string; icon: any }> = {
  DEBUTANT: { labelKey: 'DEBUTANT', color: '#16A34A', bg: 'rgba(74,222,128,0.15)', icon: Sprout },
  INTERMEDIAIRE: { labelKey: 'INTERMEDIAIRE', color: '#2563EB', bg: 'rgba(96,165,250,0.15)', icon: Rocket },
  AVANCE: { labelKey: 'AVANCE', color: '#D97706', bg: 'rgba(255,217,61,0.2)', icon: Trophy },
};

const gradeSubjects: Record<number, string[]> = {
  1: ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC'],
  2: ['MATHS', 'ARABIC', 'SCIENCE', 'ISLAMIC_CIVIC'],
  3: ['MATHS', 'ARABIC', 'FRANCAIS', 'SCIENCE', 'SOCIALS'],
  4: ['MATHS', 'ARABIC', 'FRANCAIS', 'SCIENCE', 'SOCIALS'],
  5: ['MATHS', 'ARABIC', 'FRANCAIS', 'ENGLISH', 'SCIENCE', 'SOCIALS'],
  6: ['MATHS', 'ARABIC', 'FRANCAIS', 'ENGLISH', 'SCIENCE', 'SOCIALS'],
};

const subjectConfigs: Record<string, {
  icon: any;
  color: string;
  bgLight: string;
  border: string;
  barColor: string;
  textKey: 'math' | 'french' | 'logic' | 'culture' | 'arabic' | 'science' | 'islamicCivic' | 'english' | 'socials';
}> = {
  MATHS: { icon: Brain, color: '#3B82F6', bgLight: '#EFF6FF', border: '#BFDBFE', barColor: '#60A5FA', textKey: 'math' },
  FRANCAIS: { icon: MessageCircle, color: '#F97316', bgLight: '#FFF7ED', border: '#FED7AA', barColor: '#FB923C', textKey: 'french' },
  SCIENCE: { icon: Compass, color: '#10B981', bgLight: '#ECFDF5', border: '#A7F3D0', barColor: '#34D399', textKey: 'science' },
  ARABIC: { icon: BookOpen, color: '#8B5CF6', bgLight: '#F5F3FF', border: '#DDD6FE', barColor: '#A78BFA', textKey: 'arabic' },
  ISLAMIC_CIVIC: { icon: Star, color: '#F59E0B', bgLight: '#FFFBEB', border: '#FDE68A', barColor: '#FBBF24', textKey: 'islamicCivic' },
  ENGLISH: { icon: Globe, color: '#EC4899', bgLight: '#FDF2F8', border: '#FBCFE8', barColor: '#F472B6', textKey: 'english' },
  SOCIALS: { icon: BookmarkCheck, color: '#06B6D4', bgLight: '#ECFEFF', border: '#A5F3FC', barColor: '#22D3EE', textKey: 'socials' },
};

// Video Exercises Data for the Children's Curriculum
const featuredVideoExercises = [
  {
    id: 'vid-math-1',
    title: 'تمرين تفاعلي بالفيديو: الجمع الذهني السريع',
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
    title: 'تمرين بالفيديو: دورة الماء في الطبيعة',
    titleFr: 'Exercice Vidéo : Le Cycle de l\'Eau',
    subject: 'SCIENCE',
    duration: '4:15',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/embed/videoseries?list=PLb0zKSynM2PAeEecVf3-oKjV640ePz3hW',
    xpReward: 40,
    difficulty: 'MOYEN'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const td = t.dashboard as any;
  const [user, setUser] = useState<UserData | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeChildDetails, setActiveChildDetails] = useState<Child | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapSubject, setSelectedMapSubject] = useState<string>('MATHS');
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);

  useEffect(() => {
    const handleActiveChildChange = (e: any) => {
      if (e.detail?.id) {
        setActiveChildId(e.detail.id);
      }
    };
    window.addEventListener('activeChildChanged', handleActiveChildChange);
    return () => window.removeEventListener('activeChildChanged', handleActiveChildChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.push('/auth/login'); return; }

    try {
      const userObj = JSON.parse(userStr);
      if (userObj.role === 'PARENT') {
        router.push('/parent');
        return;
      }
    } catch (e) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    Promise.all([
      authApi.profile(),
      childrenApi.list(),
      gamificationApi.listChallenges().catch(() => ({ data: [] }))
    ])
      .then(([userRes, childrenRes, challengesRes]) => {
        setUser(userRes.data);
        setChildren(childrenRes.data);
        setChallenges(challengesRes.data || []);

        const storedChildId = localStorage.getItem('activeChildId');
        let currentActiveId = storedChildId;
        if (!currentActiveId && childrenRes.data.length > 0) {
          currentActiveId = childrenRes.data[0].id;
        }
        if (currentActiveId) {
          localStorage.setItem('activeChildId', currentActiveId);
          setActiveChildId(currentActiveId);
        }
      })
      .catch((err) => {
        console.error("Dashboard initialization error:", err);
        router.push('/auth/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!activeChildId) {
      setActiveChildDetails(null);
      setLessons([]);
      setExercises([]);
      return;
    }

    Promise.all([
      childrenApi.get(activeChildId),
      lessonsApi.list(activeChildId).catch(() => ({ data: [] })),
      exercisesApi.list(activeChildId).catch(() => ({ data: [] }))
    ])
      .then(([childRes, lessonsRes, exercisesRes]) => {
        setActiveChildDetails(childRes.data);
        setLessons(lessonsRes.data || []);
        setExercises(exercisesRes.data || []);
      })
      .catch((err) => {
        console.error("Error loading active child details:", err);
        if (err?.response?.status === 404) {
          localStorage.removeItem('activeChildId');
          const fallback = children.length > 0 ? children[0].id : null;
          if (fallback) {
            localStorage.setItem('activeChildId', fallback);
            setActiveChildId(fallback);
          } else {
            setActiveChildId(null);
            setActiveChildDetails(null);
          }
        }
      });
  }, [activeChildId, children]);

  const renderAvatar = (avatar: string | undefined, index: number, size = 20) => {
    const bgColor = avatarBgColors[index % avatarBgColors.length];
    if (!avatar) return (
      <div className="w-full h-full flex items-center justify-center rounded-full shadow-inner" style={{ background: bgColor + '30' }}>
        <Smile style={{ width: size * 0.55, height: size * 0.55, color: bgColor }} />
      </div>
    );
    const IconComponent = avatarMap[avatar];
    if (IconComponent) {
      return (
        <div className="w-full h-full flex items-center justify-center rounded-full shadow-inner" style={{ background: bgColor + '30' }}>
          <IconComponent style={{ width: size * 0.55, height: size * 0.55, color: bgColor }} />
        </div>
      );
    }
    return <div className="text-3xl">{avatar}</div>;
  };

  const activeChild = children.find(c => c.id === activeChildId);

  // If loading
  if (loading || (activeChildId && !activeChildDetails)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3]">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <OwlLogo size={70} />
        </motion.div>
        <Loader2 className="w-8 h-8 animate-spin mt-4 text-[#E8927C]" />
        <p className="mt-3 text-sm font-bold text-[#6E647D] animate-pulse">
          {dir === 'rtl' ? 'جاري تجهيز لوحة أبطال Gen Skill Up...' : 'Préparation du tableau de bord...'}
        </p>
      </div>
    );
  }

  // Render child selector if no children
  if (children.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-[#FDF8F3]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] p-10 md:p-14 text-center max-w-xl mx-auto bg-white border border-[#E8927C]/20 shadow-xl"
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md bg-gradient-to-tr from-[#FDDECF] to-[#F2B5C8]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <UserPlus className="w-9 h-9 text-[#D4785F]" />
          </motion.div>
          <h2 className="text-3xl font-black mb-3 text-[#3D364A]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.dashboard.noChildrenTitle}
          </h2>
          <p className="text-[#6E647D] text-base mb-8 font-semibold leading-relaxed">
            {t.dashboard.noChildrenSubtitle}
          </p>
          <Link href="/age-select" id="add-child-btn">
            <motion.button
              className="btn-primary px-8 py-3.5 flex items-center gap-2 mx-auto cursor-pointer text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{t.dashboard.addChildBtn}</span>
              <Plus className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // When child is selected
  if (activeChildId && activeChildDetails) {
    const activeChildIdx = children.findIndex(c => c.id === activeChildId);
    const childGrade = activeChildDetails.grade || 1;
    const subjectsForGrade = gradeSubjects[childGrade] || gradeSubjects[1];

    // Calculate dates for this week
    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff));
    };

    const monday = getMonday(new Date());
    monday.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    // Count weekly exercises & lessons
    const exercisesCompletedThisWeek = activeChildDetails.exerciseResults?.filter(r => {
      return new Date(r.completedAt).getTime() >= monday.getTime();
    }).length || 0;

    const lessonsCompletedThisWeek = activeChildDetails.completedLessons?.filter(c => {
      return new Date(c.completedAt).getTime() >= monday.getTime();
    }) || [];

    const totalExercisesCompletedAll = activeChildDetails.exerciseResults?.length || 0;

    // Study time calculation
    const lessonMinutes = lessonsCompletedThisWeek.reduce((sum, c) => sum + (c.lesson?.duration || 10), 0);
    const exerciseMinutes = exercisesCompletedThisWeek * 5;
    const totalMinutes = lessonMinutes + exerciseMinutes;
    const learningHours = (totalMinutes / 60).toFixed(1);
    const learningTimeString = `${learningHours} ${td.timeHoursUnit || 'س'}`;

    // Activity points for each day of the week
    const weekActivities = weekDays.map((day) => {
      const lessonsCount = activeChildDetails.completedLessons?.filter(c => {
        return new Date(c.completedAt).toDateString() === day.toDateString();
      }).length || 0;
      const exercisesCount = activeChildDetails.exerciseResults?.filter(r => {
        return new Date(r.completedAt).toDateString() === day.toDateString();
      }).length || 0;
      return lessonsCount + exercisesCount;
    });

    const maxActivity = Math.max(...weekActivities, 4);

    // Subject breakdown
    const subjectProgressList = subjectsForGrade.map(subject => {
      const config = subjectConfigs[subject] || subjectConfigs.MATHS;
      const subjectLessons = lessons.filter(l => l.subject === subject);
      const totalLessons = subjectLessons.length;
      const completedLessons = subjectLessons.filter(l => l.completed).length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const currentLesson = subjectLessons.find(l => !l.completed);
      const currentTopicLabel = currentLesson ? currentLesson.title : (td.subjectCompleted || 'مكتمل! 🎉');

      return {
        subject,
        percentage,
        totalLessons,
        completedLessons,
        currentTopicLabel,
        config
      };
    });

    // Learning & Exercises Roadmap (Map) Data
    const selectedMapLessons = lessons
      .filter(l => l.subject === selectedMapSubject)
      .slice(0, 7);

    // Merge in matching exercises for this subject
    const selectedMapExercises = exercises
      .filter(e => e.subject === selectedMapSubject)
      .slice(0, 5);

    return (
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        
        {/* ── Top Bar: Search, Title & Notification ── */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#3D364A] tracking-tight" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.dashboard.title}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E8927C]/15 text-[#D4785F]">
              {td.levelWord} {Math.floor(activeChildDetails.points / 1000) + 1}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input (matching reference design) */}
            <div className="relative flex-1 sm:w-72">
              <Search className={`w-4 h-4 text-[#A396B5] absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dir === 'rtl' ? 'ابحث عن درس أو تمرين...' : 'Rechercher un cours, exercice...'}
                className={`w-full py-2.5 rounded-full bg-white/90 border border-[#E8927C]/20 text-xs font-bold text-[#3D364A] shadow-xs focus:outline-none focus:border-[#E8927C] ${
                  dir === 'rtl' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
                }`}
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                className="w-10 h-10 rounded-full bg-white border border-[#E8927C]/20 shadow-xs flex items-center justify-center text-[#554C62] hover:bg-[#FDF0EC] transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-[#6E647D]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8927C] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  2
                </span>
              </button>
            </div>

            {/* Avatar Pill Button */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              {renderAvatar(activeChildDetails.avatarUrl, activeChildIdx, 10)}
            </div>
          </div>
        </div>

        {/* ── 1. Hero Welcome Banner (Cute Kawaii theme like reference) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.2rem] p-6 sm:p-8 md:p-9 relative overflow-hidden shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #FDDECF 0%, #FAD4C0 40%, #F5C6BA 100%)',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 10px 30px -10px rgba(232, 146, 124, 0.25)',
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left Content */}
            <div className={`space-y-3 text-center md:text-start flex-1 ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-xs font-black text-[#C4674F] shadow-xs">
                <span>✨ {td.readyForAdventure || 'مغامرة تعليمية ممتعة'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#3D302A] leading-tight" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                {dir === 'rtl' ? `صباح الخير، ${activeChildDetails.name}! ☀️` : `Good Morning, ${activeChildDetails.name}! ☀️`}
              </h2>
              <p className="text-sm sm:text-base font-bold text-[#6D544C] max-w-xl leading-relaxed">
                {dir === 'rtl' 
                  ? 'دعنا نستمتع بالتعلم وحل تمارين اليوم في الرياضيات والعلوم واللغات!' 
                  : 'Amusons-nous à apprendre et résoudre des exercices aujourd\'hui !'}
              </p>

              {/* Action Button (Play Something like reference) */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Link href={`/exercises?childId=${activeChildId}`}>
                  <motion.button 
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 rounded-full bg-[#E8927C] hover:bg-[#D4785F] text-white font-black text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>{dir === 'rtl' ? 'ابدأ تمريناً الآن 🎮' : 'Résoudre un exercice 🎮'}</span>
                  </motion.button>
                </Link>

                <Link href={`/lessons?childId=${activeChildId}`}>
                  <motion.button 
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-3 rounded-full bg-white/90 hover:bg-white text-[#3D302A] font-black text-sm shadow-xs border border-white/60 cursor-pointer transition-all"
                  >
                    {dir === 'rtl' ? 'متابعة الدروس 📚' : 'Continuer les leçons 📚'}
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Right Cute Graphic Illustration */}
            <div className="shrink-0 flex items-center justify-center relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/40 p-3 shadow-inner flex items-center justify-center backdrop-blur-xs">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md">
                  {renderAvatar(activeChildDetails.avatarUrl, activeChildIdx, 24)}
                </div>
              </div>
              {/* Cute floating plant / badge */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 bg-white px-3 py-1.5 rounded-2xl shadow-md border border-[#F0C987] flex items-center gap-1.5"
              >
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-xs font-black text-[#5C4533]">{activeChildDetails.points} XP</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── 2. Four Pastel Stat Cards (Songs Played, Favorites, Hours, Streak style) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Exercises Solved (Pastel Mint) */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl p-5 text-center transition-all shadow-xs"
            style={{
              background: '#D9EFE6',
              border: '2px solid rgba(149, 197, 178, 0.4)',
            }}
          >
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs mx-auto mb-2 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#589B82]" />
            </div>
            <p className="text-xs font-black text-[#4E7667] mb-1">
              {dir === 'rtl' ? 'تمارين منجزة' : 'Exercices résolus'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#264438]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {totalExercisesCompletedAll}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-extrabold text-[#3F7561] bg-white/70 px-2 py-0.5 rounded-full">
              +{exercisesCompletedThisWeek} {dir === 'rtl' ? 'هذا الأسبوع' : 'cette semaine'}
            </span>
          </motion.div>

          {/* 2. Stars / Favorites (Pastel Peach/Coral) */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl p-5 text-center transition-all shadow-xs"
            style={{
              background: '#FDE1D6',
              border: '2px solid rgba(232, 146, 124, 0.4)',
            }}
          >
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs mx-auto mb-2 flex items-center justify-center">
              <Star className="w-6 h-6 text-[#E8927C] fill-[#E8927C]" />
            </div>
            <p className="text-xs font-black text-[#855042] mb-1">
              {dir === 'rtl' ? 'النجوم المكتسبة' : 'Étoiles gagnées'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#52291F]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {activeChildDetails.stars}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-extrabold text-[#A84A34] bg-white/70 px-2 py-0.5 rounded-full">
              +{activeChildDetails.stars > 0 ? 6 : 0} {dir === 'rtl' ? 'هذا الأسبوع' : 'cette semaine'}
            </span>
          </motion.div>

          {/* 3. Study Hours (Pastel Soft Gold) */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl p-5 text-center transition-all shadow-xs"
            style={{
              background: '#FFF1D0',
              border: '2px solid rgba(240, 201, 135, 0.4)',
            }}
          >
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs mx-auto mb-2 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#D99A26]" />
            </div>
            <p className="text-xs font-black text-[#7D6124] mb-1">
              {dir === 'rtl' ? 'ساعات التعلم' : 'Heures d\'apprentissage'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#4E3A0E]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {learningHours}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-extrabold text-[#8F6A17] bg-white/70 px-2 py-0.5 rounded-full">
              {dir === 'rtl' ? 'نشاط مستمر ⏰' : 'Temps actif ⏰'}
            </span>
          </motion.div>

          {/* 4. Current Streak (Pastel Soft Blue) */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl p-5 text-center transition-all shadow-xs"
            style={{
              background: '#D9E8F5',
              border: '2px solid rgba(126, 181, 214, 0.4)',
            }}
          >
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs mx-auto mb-2 flex items-center justify-center">
              <Flame className="w-6 h-6 text-[#4F94C4] fill-[#4F94C4]" />
            </div>
            <p className="text-xs font-black text-[#3E6582] mb-1">
              {dir === 'rtl' ? 'أيام متتالية' : 'Série de jours'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1C3D57]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {activeChildDetails.streakDays}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-extrabold text-[#2F6891] bg-white/70 px-2 py-0.5 rounded-full">
              {dir === 'rtl' ? 'أبطال متواصلون 🔥' : 'En série active 🔥'}
            </span>
          </motion.div>

        </div>

        {/* ── 3. The Interactive Learning & Exercises Map (خريطة التعلم والتمارين) ── */}
        {/* User request: "لخلفية (Background): تغييرها وإضافة الجزء الخاص بالتمارين (les exercices) في الخريطة." */}
        <div className="rounded-[2.2rem] bg-white p-6 sm:p-7 border border-[#E8927C]/20 shadow-xs space-y-5">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2ECE4] pb-4 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8927C]/15 flex items-center justify-center text-[#E8927C]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                  {dir === 'rtl' ? 'خريطة التعلم والتمارين التفاعلية 🗺️' : 'Carte d\'Apprentissage & Exercices 🗺️'}
                </h3>
                <p className="text-xs font-bold text-[#6E647D]">
                  {dir === 'rtl' 
                    ? 'استكشف محطات الدروس والتمارين التفاعلية وافتح مراحل جديدة' 
                    : 'Explorez le parcours pédagogique : leçons, quiz et exercices interactifs'}
                </p>
              </div>
            </div>

            {/* Subject Tabs Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {subjectsForGrade.map(subKey => {
                const conf = subjectConfigs[subKey] || subjectConfigs.MATHS;
                const isSelected = selectedMapSubject === subKey;
                const Icon = conf.icon;
                return (
                  <button
                    key={subKey}
                    onClick={() => setSelectedMapSubject(subKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isSelected 
                        ? 'bg-[#E8927C] text-white shadow-xs' 
                        : 'bg-[#F7EFE7] text-[#6E647D] hover:bg-[#EFE5DB]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.lessons[conf.textKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Road / Island Map Visualization */}
          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-[#ECDCCF] bg-[#FAF4ED]">
            {/* Background Scenery Texture Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: "url('/images/map-adventure-bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
              }}
            />
            {/* Ambient map path illustration line */}
            <div className="absolute top-1/2 left-8 right-8 h-3 bg-[#E5C7A3] border-y-2 border-dashed border-[#C9A87C] rounded-full -translate-y-1/2 hidden md:block opacity-60" />

            {/* Map Stations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
              
              {/* Station 1: Lesson Node */}
              {selectedMapLessons.slice(0, 3).map((lesson, idx) => {
                const isCompleted = lesson.completed;
                const isUnlocked = lesson.unlocked !== false;
                return (
                  <motion.div
                    key={lesson.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-44 ${
                      isCompleted 
                        ? 'bg-white border-[#95C5B2] shadow-xs' 
                        : isUnlocked 
                          ? 'bg-white border-[#E8927C] shadow-sm' 
                          : 'bg-[#F2ECE5]/70 border-[#DED4CA] opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-[#E8927C]/15 text-[#D4785F] text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#D9EFE6] text-[#2D6652] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {dir === 'rtl' ? 'مكتمل' : 'Terminé'}
                        </span>
                      ) : isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#FDE1D6] text-[#C45E45] px-2 py-0.5 rounded-full animate-pulse">
                          {dir === 'rtl' ? 'محطة نشطة' : 'En cours'}
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#A396B5]" />
                      )}
                    </div>

                    <div className="my-2">
                      <span className="text-[10px] font-black uppercase text-[#E8927C] tracking-wider">
                        {dir === 'rtl' ? 'درس تعليمي' : 'Leçon'}
                      </span>
                      <h4 className="font-black text-sm text-[#3D364A] line-clamp-2 mt-0.5 leading-snug">
                        {lesson.title}
                      </h4>
                    </div>

                    <Link href={`/lessons/${lesson.id}?childId=${activeChildId}`} className="block mt-auto">
                      <button 
                        disabled={!isUnlocked}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isUnlocked 
                            ? 'bg-[#E8927C] hover:bg-[#D4785F] text-white shadow-xs' 
                            : 'bg-[#E0D7CD] text-[#8E8378] cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (dir === 'rtl' ? 'مراجعة 🔄' : 'Revoir') : (dir === 'rtl' ? 'ابدأ الدرس 📖' : 'Commencer')}
                      </button>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Station: Exercises directly integrated into the map! */}
              {selectedMapExercises.slice(0, 2).map((ex, exIdx) => {
                const isCompleted = ex.completed;
                return (
                  <motion.div
                    key={ex.id || exIdx}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-44 ${
                      isCompleted 
                        ? 'bg-white border-[#95C5B2] shadow-xs' 
                        : 'bg-white border-[#7EB5D6] shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-[#7EB5D6]/20 text-[#3A7EA8] text-xs font-black flex items-center justify-center">
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#D9EFE6] text-[#2D6652] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {dir === 'rtl' ? 'منجز' : 'Résolu'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#D9E8F5] text-[#2D6A94] px-2 py-0.5 rounded-full">
                          {dir === 'rtl' ? 'تمرين تطبيقي' : 'Exercice'}
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      <span className="text-[10px] font-black uppercase text-[#478CB8] tracking-wider">
                        {dir === 'rtl' ? 'تمرين الخريطة' : 'Exercice'}
                      </span>
                      <h4 className="font-black text-sm text-[#3D364A] line-clamp-2 mt-0.5 leading-snug">
                        {ex.title}
                      </h4>
                    </div>

                    <Link href={`/exercises/${ex.id}?childId=${activeChildId}`} className="block mt-auto">
                      <button className="w-full py-1.5 px-3 rounded-xl text-xs font-black bg-[#7EB5D6] hover:bg-[#68A3C7] text-white shadow-xs transition-all cursor-pointer">
                        {isCompleted ? (dir === 'rtl' ? 'إعادة التمرين 🎯' : 'Refaire') : (dir === 'rtl' ? 'حل التمرين ✍️' : 'Résoudre')}
                      </button>
                    </Link>
                  </motion.div>
                );
              })}

            </div>

            {/* Map Footer Bar */}
            <div className="mt-5 pt-4 border-t border-[#E8DDD2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#6E647D]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#95C5B2]" />
                <span>{dir === 'rtl' ? 'محطة مكتملة' : 'Station complétée'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8927C] mr-3" />
                <span>{dir === 'rtl' ? 'محطة نشطة' : 'Station en cours'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#7EB5D6] mr-3" />
                <span>{dir === 'rtl' ? 'تمرين خريطة' : 'Exercice de carte'}</span>
              </div>

              <Link href={`/lessons?childId=${activeChildId}`}>
                <span className="text-[#E8927C] hover:text-[#D4785F] font-black cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm bg-white/90 px-3.5 py-1.5 rounded-xl border border-[#E8927C]/30 shadow-2xs hover:shadow-xs transition-all">
                  <span>{dir === 'rtl' ? 'خوض المغامرة على الخريطة الكاملة 🗺️ 🚀' : 'Explorer la carte complète 🗺️ 🚀'}</span>
                  {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4. Charts & Overview Section (Listening Overview + Top Genres style) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Chart: Weekly Activity Overview (Listening Overview in reference) */}
          <div className="lg:col-span-2 rounded-[2.2rem] bg-white p-6 sm:p-7 border border-[#E8927C]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#3D364A]">
                  {dir === 'rtl' ? 'نظرة عامة على النشاط الأسبوعي 📊' : 'Aperçu de l\'activité hebdomadaire 📊'}
                </h3>
                <p className="text-xs font-bold text-[#6E647D]">
                  {dir === 'rtl' ? 'تمارين ودروس منجزة يومياً' : 'Leçons et exercices complétés chaque jour'}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#F7EFE7] text-[#6E647D]">
                {td.thisWeek || 'هذا الأسبوع'}
              </span>
            </div>

            {/* Rounded pastel 3D-like vertical bars (like reference) */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
                {weekDays.map((day, idx) => {
                  const act = weekActivities[idx];
                  const heightPercent = maxActivity > 0 ? Math.max((act / maxActivity) * 100, 14) : 14;
                  // Color palette for the 7 days matching reference bars
                  const barColors = ['#F9B4AB', '#FDE293', '#A8D5C2', '#F29C85', '#98C5E2', '#86C5B5', '#D2BCE3'];
                  const barColor = barColors[idx % barColors.length];

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* Hover Tooltip */}
                      <span className="text-[10px] font-black text-[#6E647D] opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {act} {dir === 'rtl' ? 'أنشطة' : 'acts'}
                      </span>

                      {/* Pastel 3D Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.08 }}
                        className="w-full max-w-[34px] rounded-2xl shadow-xs transition-transform group-hover:scale-105"
                        style={{
                          background: barColor,
                          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)'
                        }}
                      />

                      {/* Day Label */}
                      <span className="text-xs font-black text-[#6E647D] mt-2">
                        {day.toLocaleDateString(dir === 'rtl' ? 'ar-TN' : 'fr-FR', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Chart: Subject Mastery / Distribution (Top Genres in reference) */}
          <div className="rounded-[2.2rem] bg-white p-6 sm:p-7 border border-[#E8927C]/20 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-[#3D364A]">
                {dir === 'rtl' ? 'توزيع المهارات والمواد 🎯' : 'Répartition par Matière 🎯'}
              </h3>
              <p className="text-xs font-bold text-[#6E647D]">
                {dir === 'rtl' ? 'نسبة التقدم في المناهج' : 'Taux de maîtrise du programme'}
              </p>
            </div>

            {/* Donut representation & Legend */}
            <div className="space-y-3 my-2">
              {subjectProgressList.slice(0, 4).map(({ subject, percentage, config }) => {
                const SubIcon = config.icon;
                return (
                  <div key={subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-[#3D364A]">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: config.barColor }} />
                        <span>{t.lessons[config.textKey]}</span>
                      </div>
                      <span className="text-[#6E647D]">{percentage}%</span>
                    </div>
                    {/* Rounded pastel progress bar */}
                    <div className="w-full h-2 rounded-full bg-[#F5EDE4] overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${percentage}%`, background: config.barColor }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href={`/reviews?childId=${activeChildId}`}>
              <button className="w-full py-2.5 rounded-xl bg-[#F7EFE7] hover:bg-[#EFE5DB] text-[#4A3D36] text-xs font-black transition-all cursor-pointer">
                {dir === 'rtl' ? 'مراجعة المهارات الضعيفة 🔄' : 'Réviser les compétences 🔄'}
              </button>
            </Link>
          </div>

        </div>

        {/* ── 5. Content Section: Featured Video Exercises (Contenu: إضافة تمرين أو اثنين مع فيديوهات) ── */}
        {/* User request: "المحتوى (Contenu): إضافة تمرين أو اثنين مع فيديوهات." */}
        <div className="rounded-[2.2rem] bg-white p-6 sm:p-7 border border-[#E8927C]/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8927C]/15 text-[#E8927C] flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                  {dir === 'rtl' ? 'تمارين تفاعلية بالفيديو 🎬' : 'Exercices Interactifs en Vidéo 🎬'}
                </h3>
                <p className="text-xs font-bold text-[#6E647D]">
                  {dir === 'rtl' ? 'شاهد الشرح بالفيديو ثم حل التمارين التفاعلية لتربح نقاطاً مضاعفة' : 'Regarde la vidéo explicative puis réussis le quiz pour doubler tes points'}
                </p>
              </div>
            </div>

            <Link href={`/exercises?childId=${activeChildId}`}>
              <span className="text-xs font-black text-[#E8927C] hover:underline cursor-pointer">
                {dir === 'rtl' ? 'عرض الكل' : 'Voir tout'}
              </span>
            </Link>
          </div>

          {/* Video Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredVideoExercises.map(vidEx => (
              <motion.div
                key={vidEx.id}
                whileHover={{ y: -3 }}
                className="rounded-3xl p-4 border border-[#F2ECE5] bg-[#FFFBF7] shadow-xs flex flex-col sm:flex-row items-center gap-4 transition-all"
              >
                {/* Thumbnail with Play Overlay */}
                <div 
                  onClick={() => setActiveVideoModal(vidEx)}
                  className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden relative group cursor-pointer shrink-0 shadow-xs"
                >
                  <img 
                    src={vidEx.thumbnail} 
                    alt={vidEx.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                    <div className="w-11 h-11 rounded-full bg-white/95 text-[#E8927C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-[#E8927C] ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    {vidEx.duration}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-start">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E8927C]/15 text-[#D4785F]">
                      +{vidEx.xpReward} XP
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F5EDE4] text-[#6E647D]">
                      {vidEx.difficulty}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-[#3D364A] line-clamp-2 leading-snug">
                    {dir === 'rtl' ? vidEx.title : vidEx.titleFr}
                  </h4>

                  <button
                    onClick={() => setActiveVideoModal(vidEx)}
                    className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span className="mx-1">{dir === 'rtl' ? 'مشاهدة وبدء التمرين' : 'Regarder & Jouer'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── 6. Bottom Motivational CTA Banner (Discover new music style from reference) ── */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-[2.2rem] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, #FDF9F5 0%, #FDDECF 100%)',
            border: '2px solid rgba(232, 146, 124, 0.25)',
          }}
        >
          <div className="flex items-center gap-4 text-center sm:text-start">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 text-2xl">
              ⭐
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-[#3D302A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                {dir === 'rtl' ? 'اكتشف تمارين وألعاب جديدة اليوم ✨' : 'Découvrez de nouveaux exercices et jeux ✨'}
              </h4>
              <p className="text-xs sm:text-sm font-bold text-[#6D544C]">
                {dir === 'rtl' ? 'محتوى متجدد وتكيفي بالذكاء الاصطناعي مخصص لطفلك' : 'Contenu personnalisé par intelligence artificielle adapté à votre enfant'}
              </p>
            </div>
          </div>

          <Link href={`/exercises?childId=${activeChildId}`}>
            <button className="px-6 py-2.5 rounded-full bg-[#95C5B2] hover:bg-[#7EAFA0] text-[#1D3B31] font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer">
              {dir === 'rtl' ? 'استكشف الآن 🚀' : 'Explorer maintenant 🚀'}
            </button>
          </Link>
        </motion.div>

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
                {/* Modal Header */}
                <div className="p-4 bg-[#FDF8F3] border-b border-[#F2ECE5] flex items-center justify-between">
                  <h4 className="font-black text-sm text-[#3D364A]">
                    {dir === 'rtl' ? activeVideoModal.title : activeVideoModal.titleFr}
                  </h4>
                  <button
                    onClick={() => setActiveVideoModal(null)}
                    className="p-1.5 rounded-full bg-white border border-[#E8DDD2] text-[#6E647D] hover:bg-[#F2ECE5] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Video Player */}
                <div className="aspect-video bg-black relative">
                  <iframe
                    className="w-full h-full"
                    src={activeVideoModal.videoUrl}
                    title={activeVideoModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Modal Footer */}
                <div className="p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#E8927C] bg-[#FDE1D6] px-2.5 py-1 rounded-full">
                      +{activeVideoModal.xpReward} XP
                    </span>
                    <span className="text-xs font-bold text-[#6E647D]">
                      {dir === 'rtl' ? 'بعد إنهاء الفيديو ستبدأ الأسئلة' : 'Après la vidéo, le quiz commencera'}
                    </span>
                  </div>

                  <Link href={`/exercises?childId=${activeChildId}`}>
                    <button 
                      onClick={() => setActiveVideoModal(null)}
                      className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
                    >
                      {dir === 'rtl' ? 'انتقل إلى الكويز التفاعلي ✍️' : 'Passer au Quiz ✍️'}
                    </button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    );
  }

  // Fallback / child selector screen (if activeChildId is not set)
  return (
    <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8 relative z-10 bg-[#FDF8F3]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.dashboard.title}
          </h1>
          <Sparkles className="w-7 h-7 text-[#F59E0B]" />
        </div>
        <p className="text-[#6E647D] text-sm font-semibold">{t.dashboard.subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child, i) => {
          const lvl = levelInfo[child.level] || levelInfo.DEBUTANT;
          const LevelIcon = lvl.icon;
          const translatedLevelLabel = t.dashboard.levels[lvl.labelKey] || lvl.labelKey;

          return (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden flex flex-col justify-between rounded-3xl p-6 bg-white border border-[#E8927C]/20 shadow-sm ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E8927C] to-[#95C5B2]" />

              <div className={`absolute top-5 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}>
                <span className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1"
                  style={{ background: lvl.bg, color: lvl.color }}>
                  <LevelIcon className="w-3.5 h-3.5" />
                  {translatedLevelLabel}
                </span>
              </div>

              <div className="pt-4 text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-[#E8927C]/30 shadow-xs">
                  {renderAvatar(child.avatarUrl, i)}
                </div>
                <h3 className="text-xl font-black mb-0.5 text-[#3D364A]">{child.name}</h3>
                <p className="text-xs text-[#6E647D] mb-5 font-semibold">
                  {child.grade ? `السنة ${child.grade}` : `${child.age} ${t.dashboard.ageLabel}`}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-5 rounded-2xl p-3 bg-[#FDF8F3] border border-[#F2ECE5]">
                  <div className="text-center">
                    <div className="font-black text-base flex items-center justify-center gap-1 text-[#06B6D4]">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>{child.points}</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-[#6E647D]">{t.dashboard.points}</div>
                  </div>
                  <div className="text-center border-l border-r border-[#EFE5DB]">
                    <div className="font-black text-base flex items-center justify-center gap-1 text-[#F59E0B]">
                      <Star className="w-4 h-4 shrink-0 fill-[#F59E0B]" />
                      <span>{child.stars}</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-[#6E647D]">{t.dashboard.stars}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-base flex items-center justify-center gap-1 text-[#EF4444]">
                      <Flame className="w-4 h-4 shrink-0 fill-[#EF4444]" />
                      <span>{child.streakDays}</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-[#6E647D]">{t.dashboard.days}</div>
                  </div>
                </div>

                <motion.button
                  onClick={() => {
                    localStorage.setItem('activeChildId', child.id);
                    setActiveChildId(child.id);
                  }}
                  className="btn-primary w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{td.enterDashboard || 'الدخول للوحة التحكم'}</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {/* Add Child Card */}
        <Link href="/age-select" className="block h-full">
          <div className="flex flex-col items-center justify-center h-full min-h-[260px] rounded-3xl cursor-pointer border-2 border-dashed border-[#E8927C]/40 bg-[#FFF7F2] hover:bg-[#FDF0EC] transition-colors p-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-xs bg-white text-[#E8927C]">
              <Plus className="w-7 h-7" />
            </div>
            <div className="font-black text-sm text-[#D4785F]">{t.dashboard.addAnotherChild}</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
