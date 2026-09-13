'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  SlidersHorizontal,
  Trash2,
  Bot,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  ChevronLeft,
  Pin,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { Authorization: `Bearer ${token}` };
}

interface Exercise {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  isAdapted: boolean;
  isMandatory: boolean;
  createdAt: string;
  child?: { name: string } | null;
  lesson?: { title: string } | null;
  _count: { results: number };
}

const SUBJECT_LABELS: Record<string, string> = {
  FRANCAIS: 'الفرنسية', MATHS: 'الرياضيات', LOGIQUE: 'المنطق',
  CULTURE: 'الثقافة', ARABIC: 'العربية', SCIENCE: 'العلوم',
  ISLAMIC_CIVIC: 'التربية الإسلامية', ENGLISH: 'الإنجليزية', SOCIALS: 'الاجتماعيات',
};

const DIFF_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  FACILE: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', label: 'سهل' },
  MOYEN: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: 'متوسط' },
  DIFFICILE: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', label: 'صعب' },
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [adaptedFilter, setAdaptedFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (subjectFilter) params.subject = subjectFilter;
      if (adaptedFilter !== '') params.isAdapted = adaptedFilter;
      const res = await axios.get(`${API}/admin/exercises`, { params, headers: getAuthHeaders() });
      setExercises(res.data.exercises);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, subjectFilter, adaptedFilter]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/admin/exercises/${id}`, { headers: getAuthHeaders() });
      setDeleteConfirm(null);
      fetchExercises();
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>إدارة التمارين</h1>
          <p style={s.pageSubtitle}>{total} تمرين في المنصة</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.selectWrapper}>
          <SlidersHorizontal size={15} color="rgba(255,255,255,0.35)" />
          <select
            id="exercise-subject-filter" value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            style={s.select}
          >
            <option value="">كل المواد</option>
            {Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={s.selectWrapper}>
          <Bot size={15} color="rgba(255,255,255,0.35)" />
          <select
            id="exercise-type-filter" value={adaptedFilter}
            onChange={(e) => { setAdaptedFilter(e.target.value); setPage(1); }}
            style={s.select}
          >
            <option value="">كل الأنواع</option>
            <option value="false">عام</option>
            <option value="true">ذكاء اصطناعي</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>عنوان التمرين</th>
              <th style={s.th}>المادة</th>
              <th style={s.th}>الصعوبة</th>
              <th style={s.th}>النوع</th>
              <th style={s.th}>الطفل</th>
              <th style={s.th}>الدرس</th>
              <th style={{ ...s.th, textAlign: 'center' }}>النتائج</th>
              <th style={s.th}>تاريخ الإنشاء</th>
              <th style={s.th}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={s.loadingCell}>جاري التحميل...</td></tr>
            ) : exercises.length === 0 ? (
              <tr><td colSpan={9} style={s.emptyCell}>لا توجد تمارين</td></tr>
            ) : exercises.map((ex, i) => {
              const diff = DIFF_STYLES[ex.difficulty] ?? DIFF_STYLES.MOYEN;
              return (
                <tr key={ex.id} style={{ ...s.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ex.title}
                    </div>
                    {ex.isMandatory && (
                      <span style={s.mandatoryBadge}>
                        <Pin size={10} color="#F97316" /> إلزامي
                      </span>
                    )}
                  </td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                    {SUBJECT_LABELS[ex.subject] ?? ex.subject}
                  </td>
                  <td style={s.td}>
                    <span style={{ background: diff.bg, color: diff.text, fontSize: '0.73rem', fontWeight: 700, padding: '0.22rem 0.5rem', borderRadius: '1rem' }}>
                      {diff.label}
                    </span>
                  </td>
                  <td style={s.td}>
                    {ex.isAdapted ? (
                      <span style={s.aiBadge}><Bot size={13} color="#C084FC" /> ذكاء اصطناعي</span>
                    ) : (
                      <span style={s.generalBadge}><FileText size={13} color="rgba(255,255,255,0.4)" /> عام</span>
                    )}
                  </td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{ex.child?.name ?? '—'}</td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.35)', fontSize: '0.76rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ex.lesson?.title ?? '—'}
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={s.resultCount}>
                      <CheckCircle2 size={13} color="#10B981" />
                      <span style={{ color: '#10B981', fontWeight: 700 }}>{ex._count.results}</span>
                    </span>
                  </td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.28)', fontSize: '0.76rem' }}>
                    {new Date(ex.createdAt).toLocaleDateString('ar-TN')}
                  </td>
                  <td style={s.td}>
                    <button id={`delete-ex-${ex.id}`} onClick={() => setDeleteConfirm(ex.id)} style={s.deleteBtn} title="حذف">
                      <Trash2 size={14} color="#F87171" />
                    </button>
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, textAlign: 'center' }}>
            <button onClick={() => setDeleteConfirm(null)} style={s.modalClose}><X size={16} color="rgba(255,255,255,0.4)" /></button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={32} color="#FBBF24" strokeWidth={1.5} />
            </div>
            <h3 style={s.modalTitle}>تأكيد الحذف</h3>
            <p style={s.modalText}>هل أنت متأكد من حذف هذا التمرين وجميع نتائجه؟</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={s.cancelBtn}>إلغاء</button>
              <button id="confirm-delete-exercise" onClick={() => handleDelete(deleteConfirm)} style={s.confirmDeleteBtn}>
                <Trash2 size={14} /> حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', minHeight: '100vh', background: '#0D1117', color: '#E6EDF3', fontFamily: "'Tajawal','Nunito',sans-serif", direction: 'rtl', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 900, color: '#E6EDF3', margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '0.25rem 0 0' },
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
  mandatoryBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(249,115,22,0.12)', color: '#F97316', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '0.5rem', marginTop: '0.2rem', fontWeight: 700 },
  aiBadge: { background: 'rgba(124,58,237,0.12)', color: '#C084FC', fontSize: '0.75rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' },
  generalBadge: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, padding: '0.22rem 0.6rem', borderRadius: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' },
  resultCount: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#E6EDF3', fontSize: '0.875rem', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  pageInfo: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#161B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2rem', maxWidth: '400px', width: '90%', position: 'relative' },
  modalClose: { position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' },
  modalTitle: { fontSize: '1.1rem', fontWeight: 800, color: '#E6EDF3', margin: '0 0 0.75rem' },
  modalText: { color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: '1.5rem' },
  cancelBtn: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', color: '#E6EDF3', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit' },
  confirmDeleteBtn: { background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: '0.875rem', color: '#F87171', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
};
