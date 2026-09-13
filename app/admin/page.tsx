'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  Baby,
  BookOpen,
  Dumbbell,
  Trophy,
  BarChart3,
  CheckCircle2,
  Star,
  TrendingUp,
  Radio,
  Clock,
  GraduationCap,
  UserPlus,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { Authorization: `Bearer ${token}` };
}

interface Stats {
  totalUsers: number;
  totalChildren: number;
  totalLessons: number;
  totalExercises: number;
  totalBadges: number;
  totalCompletedLessons: number;
  totalExerciseResults: number;
  avgExerciseScore: number;
  levelDistribution: { level: string; _count: { id: number } }[];
  subjectProgress: { subject: string; _sum: { xp: number }; _count: { id: number } }[];
}

interface Activity {
  recentUsers: { id: string; name: string; email: string; createdAt: string }[];
  recentCompletions: {
    id: string; completedAt: string;
    child: { name: string }; lesson: { title: string; subject: string };
  }[];
  recentResults: {
    id: string; score: number; completedAt: string;
    child: { name: string }; exercise: { title: string; subject: string };
  }[];
}

const SUBJECT_LABELS: Record<string, string> = {
  FRANCAIS: 'الفرنسية', MATHS: 'الرياضيات', LOGIQUE: 'المنطق',
  CULTURE: 'الثقافة', ARABIC: 'العربية', SCIENCE: 'العلوم',
  ISLAMIC_CIVIC: 'التربية الإسلامية', ENGLISH: 'الإنجليزية', SOCIALS: 'الاجتماعيات',
};

const LEVEL_LABELS: Record<string, string> = {
  DEBUTANT: 'مبتدئ', INTERMEDIAIRE: 'متوسط', AVANCE: 'متقدم',
};

const LEVEL_COLORS: Record<string, string> = {
  DEBUTANT: '#06B6D4', INTERMEDIAIRE: '#7C3AED', AVANCE: '#10B981',
};

const SUBJECT_COLORS: Record<string, string> = {
  MATHS: '#7C3AED', FRANCAIS: '#06B6D4', ARABIC: '#EC4899',
  ENGLISH: '#3B82F6', SCIENCE: '#10B981', LOGIQUE: '#F59E0B',
  CULTURE: '#EF4444', ISLAMIC_CIVIC: '#8B5CF6', SOCIALS: '#F97316',
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() }),
          axios.get(`${API}/admin/activity`, { headers: getAuthHeaders() }),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  const statCards = [
    { label: 'الآباء المسجلون', value: stats?.totalUsers ?? 0, icon: Users, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
    { label: 'الأطفال النشطون', value: stats?.totalChildren ?? 0, icon: Baby, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'الدروس المتاحة', value: stats?.totalLessons ?? 0, icon: BookOpen, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'نتائج التمارين', value: stats?.totalExerciseResults ?? 0, icon: CheckCircle2, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'الدروس المكتملة', value: stats?.totalCompletedLessons ?? 0, icon: GraduationCap, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
    { label: 'متوسط الدرجات', value: `${stats?.avgExerciseScore ?? 0}%`, icon: TrendingUp, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'إجمالي التمارين', value: stats?.totalExercises ?? 0, icon: Dumbbell, color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
    { label: 'الشارات المتاحة', value: stats?.totalBadges ?? 0, icon: Trophy, color: '#EAB308', bg: 'rgba(234,179,8,0.12)' },
  ];

  const maxSubjectXP = Math.max(
    ...(stats?.subjectProgress?.map((s) => s._sum.xp ?? 0) ?? [1]),
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>نظرة عامة</h1>
          <p style={styles.pageSubtitle}>إحصائيات المنصة التعليمية في الوقت الفعلي</p>
        </div>
        <div style={styles.liveBadge}>
          <Radio size={13} color="#10B981" />
          <span style={styles.liveDot} />
          مباشر
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: card.bg, color: card.color }}>
                <Icon size={22} color={card.color} strokeWidth={1.8} />
              </div>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statValue, color: card.color }}>{card.value}</span>
                <span style={styles.statLabel}>{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Level Distribution */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <BarChart3 size={18} color="#C084FC" strokeWidth={1.5} />
            <h2 style={styles.chartTitle}>توزيع مستويات الأطفال</h2>
          </div>
          <div style={styles.levelChart}>
            {stats?.levelDistribution?.map((item) => {
              const total = stats.totalChildren || 1;
              const pct = Math.round((item._count.id / total) * 100);
              return (
                <div key={item.level} style={styles.levelRow}>
                  <span style={{ ...styles.levelBadge, background: LEVEL_COLORS[item.level] + '22', color: LEVEL_COLORS[item.level] }}>
                    {LEVEL_LABELS[item.level] ?? item.level}
                  </span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${pct}%`, background: LEVEL_COLORS[item.level] }} />
                  </div>
                  <span style={styles.barCount}>{item._count.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject XP */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <Star size={18} color="#EAB308" strokeWidth={1.5} />
            <h2 style={styles.chartTitle}>نقاط XP حسب المادة</h2>
          </div>
          <div style={styles.subjectChart}>
            {stats?.subjectProgress?.map((item) => {
              const xp = item._sum.xp ?? 0;
              const pct = Math.round((xp / maxSubjectXP) * 100);
              const color = SUBJECT_COLORS[item.subject] ?? '#7C3AED';
              return (
                <div key={item.subject} style={styles.subjectRow}>
                  <span style={styles.subjectName}>{SUBJECT_LABELS[item.subject] ?? item.subject}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
                  </div>
                  <span style={{ ...styles.barCount, color }}>{xp.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activityRow}>
        {/* Recent Users */}
        <div style={styles.activityCard}>
          <div style={styles.chartHeader}>
            <UserPlus size={17} color="#06B6D4" strokeWidth={1.5} />
            <h2 style={styles.chartTitle}>آخر المستخدمين المسجلين</h2>
          </div>
          <div style={styles.activityList}>
            {activity?.recentUsers?.map((u) => (
              <div key={u.id} style={styles.activityItem}>
                <div style={{ ...styles.activityAvatar, background: 'rgba(6,182,212,0.1)' }}>
                  <Users size={15} color="#06B6D4" />
                </div>
                <div style={styles.activityInfo}>
                  <span style={styles.activityName}>{u.name}</span>
                  <span style={styles.activityMeta}>{u.email}</span>
                </div>
                <span style={styles.activityTime}>
                  {new Date(u.createdAt).toLocaleDateString('ar-TN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Completions */}
        <div style={styles.activityCard}>
          <div style={styles.chartHeader}>
            <GraduationCap size={17} color="#10B981" strokeWidth={1.5} />
            <h2 style={styles.chartTitle}>آخر الدروس المكتملة</h2>
          </div>
          <div style={styles.activityList}>
            {activity?.recentCompletions?.map((c) => (
              <div key={c.id} style={styles.activityItem}>
                <div style={{ ...styles.activityAvatar, background: 'rgba(16,185,129,0.1)' }}>
                  <BookOpen size={15} color="#10B981" />
                </div>
                <div style={styles.activityInfo}>
                  <span style={styles.activityName}>{c.child.name}</span>
                  <span style={styles.activityMeta}>{c.lesson.title}</span>
                </div>
                <span style={styles.activityTime}>
                  {new Date(c.completedAt).toLocaleDateString('ar-TN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Exercise Results */}
        <div style={styles.activityCard}>
          <div style={styles.chartHeader}>
            <Dumbbell size={17} color="#C084FC" strokeWidth={1.5} />
            <h2 style={styles.chartTitle}>آخر نتائج التمارين</h2>
          </div>
          <div style={styles.activityList}>
            {activity?.recentResults?.map((r) => (
              <div key={r.id} style={styles.activityItem}>
                <div style={{ ...styles.activityAvatar, background: 'rgba(124,58,237,0.1)' }}>
                  <Dumbbell size={15} color="#C084FC" />
                </div>
                <div style={styles.activityInfo}>
                  <span style={styles.activityName}>{r.child.name}</span>
                  <span style={styles.activityMeta}>{r.exercise.title}</span>
                </div>
                <span style={{
                  ...styles.scoreBadge,
                  background: r.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: r.score >= 70 ? '#10B981' : '#EF4444',
                }}>
                  {r.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', gap: '0.75rem' }}>
      <Clock size={20} color="rgba(255,255,255,0.3)" />
      جاري تحميل البيانات...
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', minHeight: '100vh', background: '#0D1117', color: '#E6EDF3', fontFamily: "'Tajawal', 'Nunito', sans-serif", direction: 'rtl', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 900, color: '#E6EDF3', margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '0.25rem 0 0' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '2rem', padding: '0.4rem 1rem', color: '#10B981', fontSize: '0.8rem', fontWeight: 700 },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s ease' },
  statIcon: { width: '50px', height: '50px', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statValue: { fontSize: '1.55rem', fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' },
  chartCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem', padding: '1.5rem' },
  chartHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' },
  chartTitle: { fontSize: '0.95rem', fontWeight: 800, color: '#E6EDF3', margin: 0 },
  levelChart: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  levelRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  levelBadge: { fontSize: '0.73rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '2rem', flexShrink: 0, width: '68px', textAlign: 'center' },
  barTrack: { flex: 1, height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '100px', transition: 'width 1s ease' },
  barCount: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', minWidth: '28px', textAlign: 'left' },
  subjectChart: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  subjectRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  subjectName: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', flexShrink: 0, width: '88px', textAlign: 'right' },
  activityRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' },
  activityCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem', padding: '1.5rem' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  activityItem: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  activityAvatar: { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityInfo: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  activityName: { fontSize: '0.83rem', fontWeight: 700, color: '#E6EDF3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  activityMeta: { fontSize: '0.71rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  activityTime: { fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0 },
  scoreBadge: { fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', flexShrink: 0 },
};
