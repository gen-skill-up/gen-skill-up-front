'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, childrenApi, lessonsApi, gamificationApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
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
  LogOut,
  Target,
  BookOpen,
  PenTool,
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
  BookmarkCheck
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

// Colors for avatar backgrounds
const avatarBgColors = ['#FF8C42', '#4ECDC4', '#A855F7', '#4ADE80', '#F472B6', '#60A5FA'];

const levelInfo: Record<string, { labelKey: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'; color: string; bg: string; icon: any }> = {
  DEBUTANT: { labelKey: 'DEBUTANT', color: '#16A34A', bg: 'rgba(74,222,128,0.12)', icon: Sprout },
  INTERMEDIAIRE: { labelKey: 'INTERMEDIAIRE', color: '#1D4ED8', bg: 'rgba(96,165,250,0.12)', icon: Rocket },
  AVANCE: { labelKey: 'AVANCE', color: '#D97706', bg: 'rgba(255,217,61,0.15)', icon: Trophy },
};

// Subjects configurations for grades
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
  colorClass: string;
  bg: string;
  border: string;
  fill: string;
  iconBg: string;
  textKey: 'math' | 'french' | 'logic' | 'culture' | 'arabic' | 'science' | 'islamicCivic' | 'english' | 'socials';
}> = {
  MATHS: { icon: Brain, colorClass: 'sky', bg: 'bg-sky-50/50', border: 'border-sky-100', fill: 'bg-sky-500', iconBg: 'bg-sky-500', textKey: 'math' },
  FRANCAIS: { icon: MessageCircle, colorClass: 'amber', bg: 'bg-amber-50/50', border: 'border-amber-100', fill: 'bg-amber-500', iconBg: 'bg-amber-500', textKey: 'french' },
  SCIENCE: { icon: Compass, colorClass: 'emerald', bg: 'bg-emerald-50/50', border: 'border-emerald-100', fill: 'bg-emerald-500', iconBg: 'bg-emerald-500', textKey: 'science' },
  ARABIC: { icon: BookOpen, colorClass: 'violet', bg: 'bg-violet-50/50', border: 'border-violet-100', fill: 'bg-violet-500', iconBg: 'bg-violet-500', textKey: 'arabic' },
  ISLAMIC_CIVIC: { icon: Star, colorClass: 'rose', bg: 'bg-rose-50/50', border: 'border-rose-100', fill: 'bg-rose-500', iconBg: 'bg-rose-500', textKey: 'islamicCivic' },
  ENGLISH: { icon: Globe, colorClass: 'indigo', bg: 'bg-indigo-50/50', border: 'border-indigo-100', fill: 'bg-indigo-500', iconBg: 'bg-indigo-500', textKey: 'english' },
  SOCIALS: { icon: BookmarkCheck, colorClass: 'cyan', bg: 'bg-cyan-50/50', border: 'border-cyan-100', fill: 'bg-cyan-500', iconBg: 'bg-cyan-500', textKey: 'socials' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const td = t.dashboard as any;
  const [user, setUser] = useState<UserData | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeChildDetails, setActiveChildDetails] = useState<Child | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.push('/auth/login'); return; }

    const userObj = JSON.parse(userStr);
    if (userObj.role === 'PARENT') {
      router.push('/parent');
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
      return;
    }

    Promise.all([
      childrenApi.get(activeChildId),
      lessonsApi.list(activeChildId).catch(() => ({ data: [] }))
    ])
      .then(([childRes, lessonsRes]) => {
        setActiveChildDetails(childRes.data);
        setLessons(lessonsRes.data);
      })
      .catch((err) => {
        console.error("Error loading active child details:", err);
        // If the stored child ID no longer exists (e.g. after DB reset), clear it
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
  }, [activeChildId]);

  const renderAvatar = (avatar: string | undefined, index: number, size = 20) => {
    const bgColor = avatarBgColors[index % avatarBgColors.length];
    if (!avatar) return (
      <div className="w-full h-full flex items-center justify-center rounded-full" style={{ background: bgColor + '20' }}>
        <Smile style={{ width: size * 0.5, height: size * 0.5, color: bgColor }} />
      </div>
    );
    const IconComponent = avatarMap[avatar];
    if (IconComponent) {
      return (
        <div className="w-full h-full flex items-center justify-center rounded-full" style={{ background: bgColor + '20' }}>
          <IconComponent style={{ width: size * 0.5, height: size * 0.5, color: bgColor }} />
        </div>
      );
    }
    return <div className="text-4xl">{avatar}</div>;
  };

  const activeChild = children.find(c => c.id === activeChildId);

  // If loading
  if (loading || (activeChildId && !activeChildDetails)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#F8FAFC' }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <OwlLogo size={64} />
        </motion.div>
        <Loader2 className="w-8 h-8 animate-spin mt-4" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  // Render child selector if no children or no active child
  if (children.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-14 text-center max-w-xl mx-auto bg-white border border-slate-200 shadow-xl"
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-tr from-violet-500 to-indigo-500"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <UserPlus className="w-9 h-9 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black mb-3 text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.dashboard.noChildrenTitle}
          </h2>
          <p className="text-[var(--color-muted)] text-sm mb-8 font-semibold">{t.dashboard.noChildrenSubtitle}</p>
          <Link href="/age-select" id="add-child-btn">
            <motion.button
              className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{t.dashboard.addChildBtn}</span>
              <Plus className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // If a child is selected, show their learning dashboard
  if (activeChildId && activeChildDetails) {
    const activeChildIdx = children.findIndex(c => c.id === activeChildId);
    
    // 1. Calculate subject progress dynamically
    const childGrade = activeChildDetails.grade || 1;
    const subjectsForGrade = gradeSubjects[childGrade] || gradeSubjects[1];

    const subjectProgressList = subjectsForGrade.map(subject => {
      const config = subjectConfigs[subject] || subjectConfigs.MATHS;
      const subjectLessons = lessons.filter(l => l.subject === subject);
      const totalLessons = subjectLessons.length;
      const completedLessons = subjectLessons.filter(l => l.completed).length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      // Find current topic: first uncompleted lesson
      const currentLesson = subjectLessons.find(l => !l.completed);
      const axisLabel = currentLesson?.axis || (t.dashboard as any).lessonAxisDefault || 'Leçon';
      const currentTopicLabel = currentLesson 
        ? `${axisLabel}: ${currentLesson.title}`
        : ((t.dashboard as any).subjectCompleted || 'Complété ! 🎉');

      return {
        subject,
        percentage,
        totalLessons,
        completedLessons,
        currentTopicLabel,
        config
      };
    });

    // 2. Daily Goal / Challenge calculation
    const activeChallenge = challenges[0];
    const todayStr = new Date().toDateString();
    
    // Count how many exercises the child completed today
    const exercisesCompletedToday = activeChildDetails.exerciseResults?.filter(res => {
      return new Date(res.completedAt).toDateString() === todayStr;
    }) || [];
    
    const exerciseCountToday = exercisesCompletedToday.length;
    const challengeTarget = activeChallenge?.description?.includes('واحد') || activeChallenge?.description?.includes('one') ? 1 : 1;
    const challengeProgressPercent = Math.min(Math.round((exerciseCountToday / challengeTarget) * 100), 100);

    // 3. Weekly Progress SVG graph calculations
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

    const points = weekDays.map((day, idx) => {
      const lessonsCount = activeChildDetails.completedLessons?.filter(c => {
        return new Date(c.completedAt).toDateString() === day.toDateString();
      }).length || 0;
      const exercisesCount = activeChildDetails.exerciseResults?.filter(r => {
        return new Date(r.completedAt).toDateString() === day.toDateString();
      }).length || 0;
      const activity = lessonsCount + exercisesCount;
      const x = 10 + idx * 40;
      const y = 65 - Math.min(activity * 15, 50);
      return { x, y, activity };
    });

    const linePathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaPathD = `${linePathD} L 250 80 L 10 80 Z`;

    // Exercises solved this week
    const exercisesCompletedThisWeek = activeChildDetails.exerciseResults?.filter(r => {
      return new Date(r.completedAt).getTime() >= monday.getTime();
    }).length || 0;

    // Lessons completed this week
    const lessonsCompletedThisWeek = activeChildDetails.completedLessons?.filter(c => {
      return new Date(c.completedAt).getTime() >= monday.getTime();
    }) || [];

    // Sum learning duration: lessons (dynamic duration) + exercises (5 minutes each)
    const lessonMinutes = lessonsCompletedThisWeek.reduce((sum, c) => sum + (c.lesson?.duration || 5), 0);
    const exerciseMinutes = exercisesCompletedThisWeek * 5;
    const totalMinutes = lessonMinutes + exerciseMinutes;
    const learningHours = Math.floor(totalMinutes / 60);
    const learningMins = totalMinutes % 60;
    const learningTimeString = learningHours > 0 
      ? `${learningHours}${td.timeHoursUnit} ${learningMins}${td.timeMinsUnit}` 
      : `${learningMins}${td.timeMinsUnit}`;

    // 4. AI Learning Profile properties
    const latestTestResult = activeChildDetails.testResults?.[0];
    const hasAIProfile = !!latestTestResult;
    const aiAnalysis = latestTestResult?.aiAnalysis;
    const learningStyle = aiAnalysis?.strengths?.[0] || 'Mémoire visuelle 🖼️';
    const learningRecommendation = aiAnalysis?.recommendations?.[0] || 'Répétition espacée et exercices interactifs';

    // 5. Level Card calculations (every 1000 XP is a level)
    const pointsTotal = activeChildDetails.points || 0;
    const currentLevel = Math.floor(pointsTotal / 1000) + 1;
    const xpInLevel = pointsTotal % 1000;
    const targetXpForLevel = 1000;
    const levelProgressPercent = Math.min(Math.round((xpInLevel / targetXpForLevel) * 100), 100);

    return (
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 relative z-10 space-y-6">
            
            {/* Top Welcome Banner Card (Tunisian theme) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200">
                    {renderAvatar(activeChildDetails.avatarUrl, activeChildIdx, 10)}
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {td.levelWord} {Math.floor(activeChildDetails.points / 1000) + 1}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                  {`${td.greetingPrefix} ${activeChildDetails.name}! 👋`}
                </h1>
                <p className="text-slate-500 text-xs font-semibold max-w-md">
                  {td.readyForAdventure}
                </p>
              </div>

              {/* Tunisian Architecture SVG Illustration */}
              <svg className="absolute right-0 bottom-0 h-32 w-72 pointer-events-none opacity-80 hidden md:block" viewBox="0 0 280 120" fill="none">
                <circle cx="210" cy="90" r="35" fill="rgba(251,191,36,0.12)" />
                <path d="M40 30 C50 30 55 25 60 20 C65 25 75 25 80 30 Z" fill="rgba(255,255,255,0.4)" />
                <path d="M220 20 C228 20 232 17 236 14 C240 17 248 17 252 20 Z" fill="rgba(255,255,255,0.4)" />

                {/* Sidi Bou Said style wall */}
                <rect x="80" y="70" width="120" height="50" fill="#F1F5F9" rx="4" />
                <path d="M120 70 C120 50, 160 50, 160 70 Z" fill="#3B82F6" />
                <path d="M135 120 L135 95 C135 90, 145 90, 145 95 L145 120 Z" fill="#1D4ED8" />
                <rect x="95" y="80" width="10" height="15" rx="2" fill="#1D4ED8" />
                <rect x="175" y="80" width="10" height="15" rx="2" fill="#1D4ED8" />
                
                {/* Minaret */}
                <rect x="60" y="40" width="20" height="80" fill="#E2E8F0" rx="2" />
                <polygon points="60,40 70,25 80,40" fill="#3B82F6" />
                <rect x="66" y="50" width="8" height="15" rx="1" fill="#475569" />

                {/* Palm tree */}
                <path d="M230 120 Q225 90 240 70" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M240 70 Q210 65 200 75" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M240 70 Q250 50 235 45" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M240 70 Q270 75 260 85" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M240 70 Q265 60 255 52" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                {/* Tunisian flag */}
                <rect x="18" y="80" width="25" height="18" fill="#EF4444" rx="2" />
                <line x1="18" y1="80" x2="18" y2="120" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                <circle cx="30.5" cy="89" r="4.5" fill="white" />
                <path d="M30 86 C28 86, 28 92, 30 92 C31 92, 31 86, 30 86 Z" fill="#EF4444" />
                <polygon points="31.5,88 32.5,90.5 30,89.5 33,89.5 30.5,90.5" fill="#EF4444" />
              </svg>

              {/* Point Card Badge */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 shrink-0 z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-amber-700 text-lg font-black leading-none">{activeChildDetails.points} XP</h4>
                  <p className="text-[10px] text-amber-600 font-extrabold mt-1">{td.tunisiaTop}</p>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Grid (Main content vs side widgets) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Subjects & Training */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Resume learning section */}
                <div className="space-y-3">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span>{td.resumeLearning}</span>
                  </h2>
                  
                  {/* Subject cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {subjectProgressList.map(({ subject, percentage, currentTopicLabel, config }) => {
                      const SubjectIcon = config.icon;
                      return (
                        <div key={subject} className={`${config.bg} border ${config.border} rounded-3xl p-4 flex flex-col justify-between h-40`}>
                          <div className="flex justify-between items-start">
                            <div className={`p-2 ${config.iconBg} text-white rounded-xl shadow-sm`}>
                              <SubjectIcon className="w-5 h-5" />
                            </div>
                            <span className={`text-[9px] font-black text-${config.colorClass}-600 bg-${config.colorClass}-100/50 px-2 py-0.5 rounded-full`}>
                              {percentage}% {td.completedStatus}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-sm">
                              {t.lessons[config.textKey]}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5 leading-snug line-clamp-2" title={currentTopicLabel}>
                              {currentTopicLabel}
                            </p>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                            <div className={`h-full ${config.fill} rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Objective */}
                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-3xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-slate-800 truncate">
                        {activeChallenge ? `${td.dailyObjectivePrefix}${activeChallenge.title}` : `${td.dailyObjectivePrefix}${td.dailyObjectiveDefault}`}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold mb-1 truncate leading-normal">
                        {activeChallenge ? activeChallenge.description : td.dailyObjectiveDescDefault}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-32 h-2 bg-indigo-200/50 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${challengeProgressPercent}%` }} />
                        </div>
                        <span className="text-xs font-black text-indigo-700">{exerciseCountToday} / {challengeTarget}</span>
                      </div>
                    </div>
                  </div>
                  <Gift className="w-6 h-6 text-amber-500 animate-bounce shrink-0" />
                </div>

                {/* Training Modes */}
                <div className="space-y-3">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>{td.trainingModes}</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Standard */}
                    <Link href={`/lessons?childId=${activeChildId}`} className="block">
                      <div className="bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl p-4 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                          <Compass className="w-5 h-5" />
                        </div>
                        <h5 className="font-black text-xs text-slate-800">{td.modeStandard}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">{td.modeStandardDesc}</p>
                      </div>
                    </Link>

                    {/* AI Personalized */}
                    <Link href={`/placement-test?childId=${activeChildId}`} className="block">
                      <div className="bg-white hover:bg-slate-50 border-2 border-indigo-500/20 rounded-3xl p-4 text-center cursor-pointer transition-all shadow-md relative flex flex-col items-center">
                        <span className="absolute -top-2.5 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">{td.modeAi}</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                          <Brain className="w-5 h-5" />
                        </div>
                        <h5 className="font-black text-xs text-indigo-700">{td.modeAi}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">{td.modeAiDesc}</p>
                      </div>
                    </Link>

                    {/* Challenges */}
                    <Link href={`/challenges?childId=${activeChildId}`} className="block">
                      <div className="bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl p-4 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <h5 className="font-black text-xs text-slate-800">{td.modeChallenges}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">{td.modeChallengesDesc}</p>
                      </div>
                    </Link>

                    {/* Fast Practice */}
                    <Link href={`/lessons?childId=${activeChildId}`} className="block">
                      <div className="bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl p-4 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h5 className="font-black text-xs text-slate-800">{td.modeFast}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">{td.modeFastDesc}</p>
                      </div>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Right Column: AI Profile Card & Progression Graphs */}
              <div className="space-y-6">

                {/* Premium Gamified Level Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl border border-[#3b82f630]"
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #1e1a78 100%)',
                  }}
                >
                  {/* Glowing background light blob */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 bg-cyan-400 blur-xl pointer-events-none" />
                  <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full opacity-10 bg-violet-400 blur-xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex justify-between items-start z-10 relative">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 opacity-90">
                        {td.yourLevel}
                      </span>
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400 shrink-0" />
                        <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                          {`${td.levelWord} ${currentLevel}`}
                        </h2>
                      </div>
                    </div>

                    {/* Squircle avatar badge */}
                    <div 
                      className="w-16 h-16 rounded-3xl flex items-center justify-center border border-white/20 relative overflow-hidden shrink-0 shadow-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <div className="w-11 h-11">
                        {renderAvatar(activeChildDetails.avatarUrl, activeChildIdx, 22)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Box Container */}
                  <div 
                    className="mt-6 p-4 rounded-[1.5rem] border border-white/10 relative z-10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div className={`flex justify-between items-center text-xs font-black mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-white/80">
                        {xpInLevel} / {targetXpForLevel} XP
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                        <Trophy className="w-3.5 h-3.5 fill-amber-500/20 text-amber-400 shrink-0" />
                        {xpInLevel} XP
                      </span>
                    </div>

                    {/* Glow-themed Progress Bar */}
                    <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 relative"
                      >
                        {/* Shimmer light effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                
                {/* AI Learning Profile Card (dependent on placement test) */}
                {!hasAIProfile ? (
                  <motion.div
                    className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white rounded-3xl p-5 border border-indigo-950 shadow-xl relative overflow-hidden flex flex-col gap-4"
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex justify-between items-start z-10">
                      <div className="space-y-1">
                        <h3 className="font-black text-sm text-cyan-400">{td.aiProfileTitle}</h3>
                        <p className="text-[10px] text-indigo-200">{td.aiProfileDesc}</p>
                      </div>
                      <OwlLogo size={42} />
                    </div>
                    <div className="z-10 text-center py-2 space-y-3">
                      <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                        {td.startTestPrompt}
                      </p>
                      <Link href={`/placement-test?childId=${activeChildDetails.id}`} className="block">
                        <button className="btn-primary w-full py-2.5 text-xs font-black bg-cyan-500 hover:bg-cyan-600 border-b-2 border-cyan-700 cursor-pointer">
                          {td.startTestBtn}
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white rounded-3xl p-5 border border-indigo-950 shadow-xl relative overflow-hidden flex flex-col gap-4"
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex justify-between items-start z-10">
                      <div className="space-y-1">
                        <h3 className="font-black text-sm text-cyan-400">{td.aiProfileTitle}</h3>
                        <p className="text-[10px] text-indigo-200">{td.aiProfileDesc}</p>
                      </div>
                      <OwlLogo size={42} />
                    </div>

                    <div className="space-y-2 z-10 text-xs font-bold text-slate-200">
                      <div className="flex justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                        <span>{td.learningStyleLabel}</span>
                        <span className="text-cyan-400 font-black">{learningStyle}</span>
                      </div>
                      <div className="flex justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                        <span>{td.responseSpeedLabel}</span>
                        <span className="text-emerald-400 font-black">{activeChildDetails.level === 'AVANCE' ? td.responseSpeedVeryFast : td.responseSpeedFast}</span>
                      </div>
                      <div className="flex justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                        <span>{td.learningSupportLabel}</span>
                        <span className="text-indigo-300 font-black">{td.learningSupportActive}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Ta Progression weekly Graph Widget */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm text-slate-800">
                      {td.weeklyProgress}
                    </h3>
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full">
                      {td.thisWeek}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-50 pb-2">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{td.weeklyExercises.replace('{count}', String(exercisesCompletedThisWeek))}</span>
                    </span>
                    <span>{td.studyTime.replace('{time}', learningTimeString)}</span>
                  </div>

                  {/* SVG Weekly Line Chart */}
                  <div className="w-full pt-2">
                    <svg className="w-full h-24" viewBox="0 0 260 80">
                      {/* Grid Lines */}
                      <line x1="10" y1="10" x2="250" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="10" y1="35" x2="250" y2="35" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="10" y1="60" x2="250" y2="60" stroke="#F1F5F9" strokeWidth="1" />

                      {/* Smooth Area Under Line */}
                      <path d={areaPathD} fill="rgba(124,58,237,0.04)" />

                      {/* Line Chart Path */}
                      <path d={linePathD} fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />

                      {/* Glowing Data Point Dots */}
                      {points.map((p, idx) => (
                        p.activity > 0 && (
                          <circle 
                            key={idx}
                            cx={p.x} 
                            cy={p.y} 
                            r="4.5" 
                            fill="#7C3AED" 
                            stroke="#FFFFFF" 
                            strokeWidth="1.5" 
                            className="animate-pulse"
                          >
                            <title>{`${p.activity} activities`}</title>
                          </circle>
                        )
                      ))}

                      {/* Labels - day names come from the locale automatically */}
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((_, i) => {
                        const d = new Date(monday);
                        d.setDate(monday.getDate() + i);
                        return (
                          <text key={i} x={10 + i * 40} y="78" fill="#94A3B8" fontSize="7" fontWeight="bold" textAnchor="middle">
                            {d.toLocaleDateString(dir === 'rtl' ? 'ar-TN' : 'fr-FR', { weekday: 'short' })}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Revision fun card */}
                <div className="bg-gradient-to-tr from-violet-50 to-indigo-50/50 rounded-3xl p-5 border border-indigo-100 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-xs text-indigo-700">{td.revisionFunTitle}</h4>
                    <p className="text-[9px] text-indigo-500 font-bold">{td.revisionFunDesc}</p>
                  </div>
                  <div className="text-3xl shrink-0 animate-bounce">🎈</div>
                </div>

              </div>

            </div>

          </main>
    );
  }

  // Fallback / child selector screen (if activeChildId is not set)
  return (
    <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
        >
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.dashboard.title}
            </h1>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-7 h-7 text-amber-400" />
            </motion.div>
          </div>
          <p className="text-[var(--color-muted)] text-sm font-semibold">{t.dashboard.subtitle}</p>
        </motion.div>

        {/* Children grid */}
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
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                className={`relative overflow-hidden flex flex-col justify-between rounded-3xl p-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                style={{
                  background: 'white',
                  border: '1px solid rgba(124, 58, 237, 0.08)',
                  boxShadow: '0 6px 24px rgba(124, 58, 237, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)'
                }}
                whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(124, 58, 237, 0.08)' }}
              >
                {/* Decorative top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4)' }} />

                {/* Level badge */}
                <div className={`absolute top-5 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}>
                  <span className="px-2.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1"
                    style={{ background: lvl.bg, color: lvl.color, border: `1.5px solid ${lvl.color}30` }}>
                    <LevelIcon className="w-3.5 h-3.5" />
                    {translatedLevelLabel}
                  </span>
                </div>

                <div className="pt-4 text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden"
                    style={{ border: '3px solid rgba(124, 58, 237, 0.1)', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)' }}>
                    {renderAvatar(child.avatarUrl, i)}
                  </div>
                  <h3 className="text-xl font-black mb-0.5 text-slate-800">{child.name}</h3>
                  <p className="text-xs text-[var(--color-muted)] mb-5 font-semibold">
                    {child.grade ? (t.lessons.grades as any)[`g${child.grade}`] || `السنة ${child.grade}` : `${child.age} ${t.dashboard.ageLabel}`}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-5 rounded-2xl p-3 bg-slate-50 border border-slate-100">
                    <div className="text-center">
                      <div className="font-black text-base flex items-center justify-center gap-1 text-cyan-500">
                        <Award className="w-4 h-4 shrink-0" />
                        <span>{child.points}</span>
                      </div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5 text-cyan-600">{t.dashboard.points}</div>
                    </div>
                    <div className="text-center border-l border-slate-100 border-r">
                      <div className="font-black text-base flex items-center justify-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 shrink-0 fill-amber-400" />
                        <span>{child.stars}</span>
                      </div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5 text-amber-500">{t.dashboard.stars}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-base flex items-center justify-center gap-1 text-rose-500">
                        <Flame className="w-4 h-4 shrink-0" />
                        <span>{child.streakDays}</span>
                      </div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5 text-rose-500">{t.dashboard.days}</div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => {
                      localStorage.setItem('activeChildId', child.id);
                      setActiveChildId(child.id);
                    }}
                    className="btn-primary w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Rocket className="w-4 h-4" />
                    <span>{td.enterDashboard}</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}

          {/* Add child card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: children.length * 0.1 }}
          >
            <Link href="/age-select" id="add-another-child-btn" className="block h-full">
              <motion.div
                className="flex flex-col items-center justify-center h-full min-h-[260px] rounded-3xl cursor-pointer border-2 border-dashed border-indigo-200 bg-indigo-50/10"
                whileHover={{ background: 'rgba(124, 58, 237, 0.03)', borderColor: 'var(--color-primary)', y: -4 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm bg-gradient-to-tr from-indigo-100 to-violet-100"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="w-7 h-7 text-indigo-500" />
                </motion.div>
                <div className="font-bold text-sm text-indigo-600">{t.dashboard.addAnotherChild}</div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </main>
  );
}
