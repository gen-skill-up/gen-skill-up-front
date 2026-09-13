'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`,
        form,
      );
      const { user, token } = res.data;
      if (user.role !== 'ADMIN') {
        setError('ليس لديك صلاحية الوصول إلى لوحة التحكم');
        return;
      }
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      router.push('/admin');
    } catch {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoIconWrap}>
            <Shield size={32} color="#C084FC" strokeWidth={1.5} />
          </div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>LearnWithAI – لوحة التحكم الإدارية</p>
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={16} color="#FCA5A5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>البريد الإلكتروني</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><Mail size={16} color="rgba(255,255,255,0.35)" /></span>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@learnwithai.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><Lock size={16} color="rgba(255,255,255,0.35)" /></span>
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <LogIn size={18} />
            {loading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}
          </button>
        </form>

        <p style={styles.hint}>محمي بصلاحيات المشرف فقط</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F0A1E 0%, #1A0E3A 50%, #0D1B2A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Tajawal', 'Nunito', sans-serif",
    direction: 'rtl',
    padding: '1rem',
  },
  bgOrb1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
  },
  bgOrb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
    bottom: '-80px',
    left: '-80px',
  },
  bgOrb3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '2rem',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoIconWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '1.25rem',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 900,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    margin: '0.5rem 0 0',
  },
  error: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '1rem',
    padding: '0.75rem 1rem',
    color: '#FCA5A5',
    fontSize: '0.9rem',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: '1rem',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '1rem',
    padding: '0.875rem 3rem 0.875rem 1rem',
    color: '#FFFFFF',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
    direction: 'rtl',
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
    border: 'none',
    borderRadius: '1rem',
    padding: '1rem',
    color: '#FFFFFF',
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'inherit',
    marginTop: '0.5rem',
    boxShadow: '0 8px 25px rgba(124,58,237,0.4)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: '0.75rem',
    marginTop: '1.5rem',
    marginBottom: 0,
  },
};
