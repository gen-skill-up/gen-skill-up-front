'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  SlidersHorizontal,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { Authorization: `Bearer ${token}` };
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  duration: number;
  grade: number;
  order: number;
  axis: string;
  createdAt: string;
  _count: { completions: number; exercises: number; questions: number };
}

const SUBJECT_LABELS: Record<string, string> = {
  FRANCAIS: 'الفرنسية', MATHS: 'الرياضيات', LOGIQUE: 'المنطق',
  CULTURE: 'الثقافة', ARABIC: 'العربية', SCIENCE: 'العلوم',
  ISLAMIC_CIVIC: 'التربية الإسلامية', ENGLISH: 'الإنجليزية', SOCIALS: 'الاجتماعيات',
};

const SUBJECT_COLORS: Record<string, string> = {
  MATHS: '#7C3AED', FRANCAIS: '#06B6D4', ARABIC: '#EC4899', ENGLISH: '#3B82F6',
  SCIENCE: '#10B981', LOGIQUE: '#F59E0B', CULTURE: '#EF4444',
  ISLAMIC_CIVIC: '#8B5CF6', SOCIALS: '#F97316',
};

const DIFF_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  FACILE: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', label: 'سهل' },
  MOYEN: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: 'متوسط' },
  DIFFICILE: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', label: 'صعب' },
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 15;

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/lessons`, {
        params: { page, limit: LIMIT, subject: subjectFilter || undefined, grade: gradeFilter || undefined },
        headers: getAuthHeaders(),
      });
      setLessons(res.data.lessons);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, subjectFilter, gradeFilter]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>إدارة الدروس</h1>
          <p style={s.pageSubtitle}>{total} درس في المنصة</p>
        </div>
        <span style={s.totalBadge}>
          <BookOpen size={14} color="#C084FC" />
          {total} درس
        </span>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.selectWrapper}>
          <SlidersHorizontal size={15} color="rgba(255,255,255,0.35)" />
          <select
            id="subject-filter" value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            style={s.select}
          >
            <option value="">كل المواد</option>
            {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div style={s.selectWrapper}>
          <SlidersHorizontal size={15} color="rgba(255,255,255,0.35)" />
          <select
            id="grade-filter" value={gradeFilter}
            onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
            style={s.select}
          >
            <option value="">كل الصفوف</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>الصف {g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>#</th>
              <th style={s.th}>عنوان الدرس</th>
              <th style={s.th}>المادة</th>
              <th style={s.th}>الصعوبة</th>
              <th style={s.th}>الصف</th>
              <th style={s.th}>المدة</th>
              <th style={{ ...s.th, textAlign: 'center' }}>الإتمامات</th>
              <th style={{ ...s.th, textAlign: 'center' }}>التمارين</th>
              <th style={{ ...s.th, textAlign: 'center' }}>الأسئلة</th>
              <th style={s.th}>المحور</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={s.loadingCell}>جاري التحميل...</td></tr>
            ) : lessons.length === 0 ? (
              <tr><td colSpan={10} style={s.emptyCell}>لا توجد دروس</td></tr>
            ) : lessons.map((l, i) => {
              const diff = DIFF_STYLES[l.difficulty] ?? DIFF_STYLES.MOYEN;
              const color = SUBJECT_COLORS[l.subject] ?? '#7C3AED';
              return (
                <tr key={l.id} style={{ ...s.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.22)', fontSize: '0.73rem' }}>{l.order}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.title}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ background: color + '20', color, fontSize: '0.73rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: '2rem', whiteSpace: 'nowrap' }}>
                      {SUBJECT_LABELS[l.subject] ?? l.subject}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ background: diff.bg, color: diff.text, fontSize: '0.73rem', fontWeight: 700, padding: '0.22rem 0.5rem', borderRadius: '1rem' }}>
                      {diff.label}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>الصف {l.grade}</td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textAlign: 'center' }}>{l.duration} د</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={s.countCell}>
                      <CheckCircle2 size={13} color="#10B981" />
                      <span style={{ color: '#10B981', fontWeight: 700 }}>{l._count.completions}</span>
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={s.countCell}>
                      <Dumbbell size={13} color="#C084FC" />
                      <span style={{ color: '#C084FC' }}>{l._count.exercises}</span>
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={s.countCell}>
                      <HelpCircle size={13} color="#06B6D4" />
                      <span style={{ color: '#06B6D4' }}>{l._count.questions}</span>
                    </span>
                  </td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.axis}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pagination}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...s.pageBtn, opacity: page === 1 ? 0.4 : 1 }}>
            <ChevronRight size={16} /> السابق
          </button>
          <span style={s.pageInfo}>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...s.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}>
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', minHeight: '100vh', background: '#0D1117', color: '#E6EDF3', fontFamily: "'Tajawal','Nunito',sans-serif", direction: 'rtl', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 900, color: '#E6EDF3', margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '0.25rem 0 0' },
  totalBadge: { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '2rem', padding: '0.4rem 1rem', color: '#C084FC', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  toolbar: { display: 'flex', gap: '0.875rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' },
  selectWrapper: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '0 0.875rem' },
  select: { background: 'transparent', border: 'none', padding: '0.68rem 0', color: '#E6EDF3', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', direction: 'rtl' },
  tableContainer: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  thead: { background: 'rgba(255,255,255,0.04)' },
  th: { padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '0.72rem 1rem', fontSize: '0.875rem', color: '#E6EDF3' },
  loadingCell: { padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)' },
  emptyCell: { padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)' },
  countCell: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#E6EDF3', fontSize: '0.875rem', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  pageInfo: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' },
};
