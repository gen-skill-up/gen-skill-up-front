'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Baby,
  Star,
  Flame,
  BookOpen,
  Dumbbell,
  Award,
  AlertTriangle,
  X,
  Save,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { Authorization: `Bearer ${token}` };
}

interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  grade: number;
  points: number;
  stars: number;
  streakDays: number;
  avatarUrl?: string;
  createdAt: string;
  parent: { name: string; email: string };
  _count: { completedLessons: number; exerciseResults: number; earnedBadges: number };
}

const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT: { bg: 'rgba(6,182,212,0.12)', text: '#06B6D4', label: 'مبتدئ' },
  INTERMEDIAIRE: { bg: 'rgba(124,58,237,0.12)', text: '#7C3AED', label: 'متوسط' },
  AVANCE: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', label: 'متقدم' },
};

export default function AdminChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Child | null>(null);
  const [editForm, setEditForm] = useState({ level: '', points: 0, stars: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/children`, {
        params: { page, limit: LIMIT, search, level: levelFilter || undefined },
        headers: getAuthHeaders(),
      });
      setChildren(res.data.children);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, levelFilter]);

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  const handleEdit = (child: Child) => {
    setEditTarget(child);
    setEditForm({ level: child.level, points: child.points, stars: child.stars });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      await axios.patch(`${API}/admin/children/${editTarget.id}`, editForm, { headers: getAuthHeaders() });
      setEditTarget(null);
      fetchChildren();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/admin/children/${id}`, { headers: getAuthHeaders() });
      setDeleteConfirm(null);
      fetchChildren();
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>إدارة الأطفال</h1>
          <p style={s.pageSubtitle}>{total} طفل مسجل</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrapper}>
          <span style={s.iconWrap}><Search size={16} color="rgba(255,255,255,0.35)" /></span>
          <input
            id="children-search" type="text"
            placeholder="البحث باسم الطفل..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={s.searchInput}
          />
        </div>
        <div style={s.selectWrapper}>
          <SlidersHorizontal size={15} color="rgba(255,255,255,0.35)" />
          <select
            id="level-filter" value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
            style={s.select}
          >
            <option value="">كل المستويات</option>
            <option value="DEBUTANT">مبتدئ</option>
            <option value="INTERMEDIAIRE">متوسط</option>
            <option value="AVANCE">متقدم</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>الطفل</th>
              <th style={s.th}>المستوى</th>
              <th style={s.th}>الصف</th>
              <th style={s.th}>النقاط</th>
              <th style={s.th}>النجوم</th>
              <th style={s.th}>السلسلة</th>
              <th style={s.th}>الدروس</th>
              <th style={s.th}>التمارين</th>
              <th style={s.th}>الشارات</th>
              <th style={s.th}>الوالد</th>
              <th style={s.th}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} style={s.loadingCell}>جاري التحميل...</td></tr>
            ) : children.length === 0 ? (
              <tr><td colSpan={11} style={s.emptyCell}>لا توجد نتائج</td></tr>
            ) : children.map((c, i) => {
              const lv = LEVEL_STYLES[c.level] ?? LEVEL_STYLES.DEBUTANT;
              return (
                <tr key={c.id} style={{ ...s.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                  <td style={s.td}>
                    <div style={s.childCell}>
                      <div style={s.avatar}><Baby size={15} color="rgba(124,58,237,0.8)" /></div>
                      <div>
                        <div style={s.childName}>{c.name}</div>
                        <div style={s.childAge}>{c.age} سنوات</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ background: lv.bg, color: lv.text, fontSize: '0.75rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: '2rem' }}>
                      {lv.label}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: 'rgba(255,255,255,0.45)' }}>الصف {c.grade}</td>
                  <td style={{ ...s.td, color: '#F59E0B', fontWeight: 700 }}>{c.points.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={s.starCell}><Star size={12} color="#EAB308" fill="#EAB308" /> {c.stars}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.flameCell}><Flame size={12} color="#F97316" /> {c.streakDays}</span>
                  </td>
                  <td style={{ ...s.td, color: '#06B6D4' }}>
                    <span style={s.countCell}><BookOpen size={12} color="#06B6D4" /> {c._count.completedLessons}</span>
                  </td>
                  <td style={{ ...s.td, color: '#10B981' }}>
                    <span style={s.countCell}><Dumbbell size={12} color="#10B981" /> {c._count.exerciseResults}</span>
                  </td>
                  <td style={{ ...s.td, color: '#C084FC' }}>
                    <span style={s.countCell}><Award size={12} color="#C084FC" /> {c._count.earnedBadges}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontSize: '0.8rem', color: '#E6EDF3' }}>{c.parent.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{c.parent.email}</div>
                  </td>
                  <td style={s.td}>
                    <div style={s.actionBtns}>
                      <button id={`edit-child-${c.id}`} onClick={() => handleEdit(c)} style={s.editBtn} title="تعديل">
                        <Pencil size={14} color="#818CF8" />
                      </button>
                      <button id={`delete-child-${c.id}`} onClick={() => setDeleteConfirm(c.id)} style={s.deleteBtn} title="حذف">
                        <Trash2 size={14} color="#F87171" />
                      </button>
                    </div>
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

      {/* Edit Modal */}
      {editTarget && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <button onClick={() => setEditTarget(null)} style={s.modalClose}><X size={16} color="rgba(255,255,255,0.4)" /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Pencil size={18} color="#818CF8" />
              <h3 style={s.modalTitle}>تعديل بيانات {editTarget.name}</h3>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>المستوى</label>
              <select id="edit-level" value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} style={s.formSelect}>
                <option value="DEBUTANT">مبتدئ</option>
                <option value="INTERMEDIAIRE">متوسط</option>
                <option value="AVANCE">متقدم</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>النقاط</label>
              <input id="edit-points" type="number" value={editForm.points} onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })} style={s.formInput} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>النجوم</label>
              <input id="edit-stars" type="number" value={editForm.stars} onChange={(e) => setEditForm({ ...editForm, stars: parseInt(e.target.value) || 0 })} style={s.formInput} />
            </div>
            <div style={s.modalActions}>
              <button onClick={() => setEditTarget(null)} style={s.cancelBtn}>إلغاء</button>
              <button id="save-child-edit" onClick={handleSaveEdit} style={s.saveBtn}>
                <Save size={14} /> حفظ
              </button>
            </div>
          </div>
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
            <h3 style={{ ...s.modalTitle, textAlign: 'center' }}>تأكيد الحذف</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              هل أنت متأكد من حذف هذا الطفل وجميع بياناته؟
            </p>
            <div style={{ ...s.modalActions, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={s.cancelBtn}>إلغاء</button>
              <button id="confirm-delete-child" onClick={() => handleDelete(deleteConfirm)} style={s.confirmDeleteBtn}>
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
  toolbar: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' },
  searchWrapper: { position: 'relative', flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center' },
  iconWrap: { position: 'absolute', right: '1rem', display: 'flex', alignItems: 'center', zIndex: 1 },
  searchInput: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '0.72rem 3rem 0.72rem 1rem', color: '#E6EDF3', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', direction: 'rtl' },
  selectWrapper: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '0 0.875rem' },
  select: { background: 'transparent', border: 'none', padding: '0.72rem 0', color: '#E6EDF3', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', direction: 'rtl' },
  tableContainer: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '960px' },
  thead: { background: 'rgba(255,255,255,0.04)' },
  th: { padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '0.72rem 1rem', fontSize: '0.875rem', color: '#E6EDF3' },
  loadingCell: { padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)' },
  emptyCell: { padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)' },
  childCell: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  childName: { fontWeight: 700, fontSize: '0.875rem' },
  childAge: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' },
  starCell: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#EAB308' },
  flameCell: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#F97316' },
  countCell: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  actionBtns: { display: 'flex', gap: '0.4rem' },
  editBtn: { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#E6EDF3', fontSize: '0.875rem', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  pageInfo: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#161B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2rem', maxWidth: '420px', width: '90%', position: 'relative' },
  modalClose: { position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' },
  modalTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#E6EDF3', margin: 0 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' },
  formLabel: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  formSelect: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.6rem 0.875rem', color: '#E6EDF3', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', direction: 'rtl' },
  formInput: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.6rem 0.875rem', color: '#E6EDF3', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', direction: 'rtl' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' },
  cancelBtn: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', color: '#E6EDF3', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn: { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.875rem', color: '#818CF8', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  confirmDeleteBtn: { background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: '0.875rem', color: '#F87171', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
};
