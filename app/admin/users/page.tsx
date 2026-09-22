'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Search, Trash2, Users, Baby, AlertTriangle, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { Authorization: `Bearer ${token}` };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { children: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`, {
        params: { page, limit: LIMIT, search },
        headers: getAuthHeaders(),
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/admin/users/${id}`, { headers: getAuthHeaders() });
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>إدارة المستخدمين</h1>
          <p style={styles.pageSubtitle}>{total} مستخدم مسجل</p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIconWrap}><Search size={16} color="rgba(255,255,255,0.35)" /></span>
          <input
            id="users-search"
            type="text"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>الاسم</th>
              <th style={styles.th}>البريد الإلكتروني</th>
              <th style={styles.th}>الأطفال</th>
              <th style={styles.th}>تاريخ التسجيل</th>
              <th style={styles.th}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={styles.loadingCell}>جاري التحميل...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={styles.emptyCell}>لا توجد نتائج</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id} style={{ ...styles.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.userAvatar}>
                        <Users size={15} color="rgba(124,58,237,0.8)" />
                      </div>
                      <span style={styles.userName}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={styles.childBadge}>
                      <Baby size={12} color="#06B6D4" />
                      {u._count.children}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString('ar-TN')}
                  </td>
                  <td style={styles.td}>
                    <button id={`delete-user-${u.id}`} onClick={() => setDeleteConfirm(u.id)} style={styles.deleteBtn}>
                      <Trash2 size={14} color="#F87171" />
                      <span>حذف</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}>السابق</button>
          <span style={styles.pageInfo}>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}>التالي</button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button onClick={() => setDeleteConfirm(null)} style={styles.modalClose}><X size={16} color="rgba(255,255,255,0.4)" /></button>
            <div style={styles.modalIconWrap}><AlertTriangle size={32} color="#FBBF24" strokeWidth={1.5} /></div>
            <h3 style={styles.modalTitle}>تأكيد الحذف</h3>
            <p style={styles.modalText}>هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع الأطفال المرتبطين به.</p>
            <div style={styles.modalActions}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.cancelBtn}>إلغاء</button>
              <button id="confirm-delete-user" onClick={() => handleDelete(deleteConfirm)} style={styles.confirmDeleteBtn}>
                <Trash2 size={14} />
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', minHeight: '100vh', background: '#0D1117', color: '#E6EDF3', fontFamily: "'Tajawal','Nunito',sans-serif", direction: 'rtl', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 900, color: '#E6EDF3', margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '0.25rem 0 0' },
  toolbar: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' },
  searchWrapper: { position: 'relative', flex: 1, maxWidth: '420px', display: 'flex', alignItems: 'center' },
  searchIconWrap: { position: 'absolute', right: '1rem', display: 'flex', alignItems: 'center', zIndex: 1 },
  searchInput: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '0.75rem 3rem 0.75rem 1rem', color: '#E6EDF3', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', direction: 'rtl' },
  tableContainer: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(255,255,255,0.04)' },
  th: { padding: '1rem 1.25rem', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease' },
  td: { padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: '#E6EDF3' },
  loadingCell: { padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem' },
  emptyCell: { padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' },
  userCell: { display: 'flex', alignItems: 'center', gap: '0.625rem' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userName: { fontWeight: 700 },
  childBadge: { background: 'rgba(6,182,212,0.1)', color: '#06B6D4', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '2rem', border: '1px solid rgba(6,182,212,0.18)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.625rem', color: '#F87171', fontSize: '0.8rem', padding: '0.4rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s ease' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#E6EDF3', fontSize: '0.875rem', padding: '0.5rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease' },
  pageInfo: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#161B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' },
  modalClose: { position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' },
  modalIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  modalTitle: { fontSize: '1.15rem', fontWeight: 800, color: '#E6EDF3', margin: '0 0 0.75rem' },
  modalText: { color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.5rem' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'center' },
  cancelBtn: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', color: '#E6EDF3', fontSize: '0.9rem', padding: '0.6rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit' },
  confirmDeleteBtn: { background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: '0.875rem', color: '#F87171', fontSize: '0.9rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
};
