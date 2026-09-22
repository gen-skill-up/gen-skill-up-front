'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Trophy,
  Plus,
  Trash2,
  Medal,
  AlertTriangle,
  X,
  Code2,
  Type,
  AlignLeft,
  Smile,
  Zap,
  Star,
  BookOpen,
  Award,
  Flame,
  Heart,
  Rocket,
  Crown,
  Shield,
  Target,
  Sparkles,
  GraduationCap,
  Brain,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

// Map icon name strings (stored in DB) → Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap, star: Star, bookOpen: BookOpen, award: Award,
  flame: Flame, heart: Heart, rocket: Rocket, crown: Crown,
  shield: Shield, target: Target, sparkles: Sparkles,
  graduationCap: GraduationCap, brain: Brain, trophy: Trophy,
  checkCircle2: CheckCircle2, medal: Medal,
  // lowercase variants
  bookopen: BookOpen, graduationcap: GraduationCap,
  checkcircle2: CheckCircle2,
};

function BadgeIcon({ iconUrl, size = 28 }: { iconUrl: string; size?: number }) {
  // If it's a known Lucide icon name, render the component
  const LucideComp = ICON_MAP[iconUrl] ?? ICON_MAP[iconUrl?.toLowerCase()];
  if (LucideComp) {
    return <LucideComp size={size} color="#EAB308" strokeWidth={1.5} />;
  }
  // Otherwise render as emoji / raw text
  return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{iconUrl || '🏅'}</span>;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { Authorization: `Bearer ${token}` };
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  condition: Record<string, unknown>;
  createdAt: string;
  _count: { earned: number };
}

const DEFAULT_FORM = { name: '', description: '', iconUrl: '🏅', condition: '{}' };

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/badges`, { headers: getAuthHeaders() });
      setBadges(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const handleCreate = async () => {
    setFormError('');
    let condition: Record<string, unknown>;
    try {
      condition = JSON.parse(form.condition);
    } catch {
      setFormError('صيغة الشرط (JSON) غير صحيحة');
      return;
    }
    try {
      await axios.post(`${API}/admin/badges`, {
        name: form.name,
        description: form.description,
        iconUrl: form.iconUrl,
        condition,
      }, { headers: getAuthHeaders() });
      setShowCreate(false);
      setForm(DEFAULT_FORM);
      fetchBadges();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/admin/badges/${id}`, { headers: getAuthHeaders() });
      setDeleteConfirm(null);
      fetchBadges();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.titleRow}>
            <Trophy size={22} color="#EAB308" strokeWidth={1.5} />
            <h1 style={s.pageTitle}>إدارة الشارات</h1>
          </div>
          <p style={s.pageSubtitle}>{badges.length} شارة متاحة</p>
        </div>
        <button id="create-badge-btn" onClick={() => setShowCreate(true)} style={s.createBtn}>
          <Plus size={18} /> إنشاء شارة جديدة
        </button>
      </div>

      {loading ? (
        <div style={s.loadingScreen}>جاري التحميل...</div>
      ) : badges.length === 0 ? (
        <div style={s.emptyState}>
          <Trophy size={48} color="rgba(255,255,255,0.12)" strokeWidth={1} />
          <p style={{ color: 'rgba(255,255,255,0.35)', marginTop: '1rem' }}>لا توجد شارات بعد. أنشئ أول شارة!</p>
        </div>
      ) : (
        <div style={s.badgesGrid}>
          {badges.map((badge) => (
            <div key={badge.id} style={s.badgeCard}>
              <div style={s.badgeIconBox}>
                <BadgeIcon iconUrl={badge.iconUrl} size={28} />
              </div>
              <div style={s.badgeInfo}>
                <h3 style={s.badgeName}>{badge.name}</h3>
                <p style={s.badgeDesc}>{badge.description}</p>
                <div style={s.badgeMeta}>
                  <span style={s.earnedBadge}>
                    <Medal size={12} color="#EAB308" />
                    حصل عليها {badge._count.earned}
                  </span>
                  <span style={s.dateBadge}>{new Date(badge.createdAt).toLocaleDateString('ar-TN')}</span>
                </div>
              </div>
              <button
                id={`delete-badge-${badge.id}`}
                onClick={() => setDeleteConfirm(badge.id)}
                style={s.deleteBtn}
                title="حذف الشارة"
              >
                <Trash2 size={15} color="#F87171" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <button onClick={() => { setShowCreate(false); setForm(DEFAULT_FORM); setFormError(''); }} style={s.modalClose}>
              <X size={16} color="rgba(255,255,255,0.4)" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Plus size={18} color="#C084FC" />
              <h3 style={s.modalTitle}>إنشاء شارة جديدة</h3>
            </div>
            {formError && (
              <div style={s.error}>
                <AlertTriangle size={14} color="#FCA5A5" /> {formError}
              </div>
            )}
            <div style={s.formGroup}>
              <label style={s.label}>
                <Smile size={13} color="rgba(255,255,255,0.4)" /> الأيقونة (emoji)
              </label>
              <input id="badge-icon" type="text" value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} style={s.input} placeholder="🏅" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                <Type size={13} color="rgba(255,255,255,0.4)" /> اسم الشارة
              </label>
              <input id="badge-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={s.input} placeholder="بطل التحدي" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                <AlignLeft size={13} color="rgba(255,255,255,0.4)" /> الوصف
              </label>
              <textarea
                id="badge-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...s.input, minHeight: '75px', resize: 'vertical' }}
                placeholder="وصف قصير للشارة..."
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                <Code2 size={13} color="rgba(255,255,255,0.4)" /> الشرط (JSON)
              </label>
              <textarea
                id="badge-condition"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                style={{ ...s.input, minHeight: '65px', resize: 'vertical', fontFamily: 'monospace', direction: 'ltr' }}
                placeholder='{"type": "lessons_completed", "count": 10}'
              />
            </div>
            <div style={s.modalActions}>
              <button onClick={() => { setShowCreate(false); setForm(DEFAULT_FORM); setFormError(''); }} style={s.cancelBtn}>إلغاء</button>
              <button id="save-badge" onClick={handleCreate} style={s.saveBtn}>
                <Plus size={15} /> إنشاء
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
            <h3 style={s.modalTitle}>تأكيد الحذف</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              سيتم حذف الشارة وجميع بيانات من حصل عليها.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={s.cancelBtn}>إلغاء</button>
              <button id="confirm-delete-badge" onClick={() => handleDelete(deleteConfirm)} style={s.confirmDeleteBtn}>
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
  page: { padding: '2rem', minHeight: '100vh', background: '#0D1117', color: '#E6EDF3', fontFamily: "'Tajawal','Nunito',sans-serif", direction: 'rtl', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 900, color: '#E6EDF3', margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 },
  createBtn: { background: 'linear-gradient(135deg, #7C3AED, #6366F1)', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '0.88rem', fontWeight: 700, padding: '0.7rem 1.4rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 15px rgba(124,58,237,0.35)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  loadingScreen: { textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' },
  emptyState: { textAlign: 'center', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' },
  badgeCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', transition: 'all 0.25s ease', position: 'relative' },
  badgeIconBox: { width: '54px', height: '54px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeInfo: { flex: 1 },
  badgeName: { fontSize: '1rem', fontWeight: 800, color: '#E6EDF3', margin: '0 0 0.3rem' },
  badgeDesc: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.75rem', lineHeight: 1.5 },
  badgeMeta: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' },
  earnedBadge: { background: 'rgba(234,179,8,0.1)', color: '#EAB308', fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  dateBadge: { color: 'rgba(255,255,255,0.22)', fontSize: '0.7rem' },
  deleteBtn: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#161B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2rem', maxWidth: '480px', width: '90%', position: 'relative' },
  modalClose: { position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' },
  modalTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#E6EDF3', margin: 0 },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.6rem 1rem', color: '#FCA5A5', fontSize: '0.83rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' },
  label: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' },
  input: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.6rem 0.875rem', color: '#E6EDF3', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', direction: 'rtl', width: '100%' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' },
  cancelBtn: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', color: '#E6EDF3', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn: { background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '0.875rem', color: '#C084FC', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  confirmDeleteBtn: { background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: '0.875rem', color: '#F87171', fontSize: '0.88rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  usersBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
};
