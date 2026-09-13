'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft, ArrowRight, Star, Sparkles, BookOpen, Rocket } from 'lucide-react';
import Logo from '../../components/Logo';

const decorativeItems = [
  { Icon: Star, color: '#FFD93D', x: 8, y: 15, delay: 0 },
  { Icon: Sparkles, color: '#4ECDC4', x: 88, y: 20, delay: 0.5 },
  { Icon: BookOpen, color: '#A855F7', x: 12, y: 75, delay: 1 },
  { Icon: Rocket, color: '#FF8C42', x: 85, y: 70, delay: 1.5 },
  { Icon: Star, color: '#F472B6', x: 80, y: 45, delay: 2 },
];

export default function LoginPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'CHILD') {
        if (data.user.childProfile) {
          localStorage.setItem('activeChildId', data.user.childProfile.id);
          router.push('/dashboard');
        } else {
          router.push('/age-select');
        }
      } else {
        router.push('/parent');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else {
        setError(msg || t.auth.errorLoginFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, var(--color-primary), #6366F1)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full opacity-12"
          style={{ background: 'radial-gradient(circle, var(--color-secondary), #3B82F6)' }} />
        <div className="absolute top-[40%] left-[-5%] w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }} />
      </div>

      {/* Floating decorative icons */}
      {decorativeItems.map(({ Icon, color, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ left: `${x}%`, top: `${y}%`, color, opacity: 0.5 }}
          animate={{ y: [0, -15, 0], rotate: [-10, 10, -10] }}
          transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 300 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Logo size={52} />
              </motion.div>
              <span className="text-2xl font-black" style={{ fontFamily: 'Fredoka One, sans-serif', color: 'var(--color-primary)' }}>
                {t.common.brand}
              </span>
            </motion.div>
          </Link>
          <h1 className="text-3xl font-black mt-2 mb-2 text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.auth.loginTitle}
          </h1>
          <p className="text-[var(--color-muted)] text-sm font-semibold">{t.auth.loginSubtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-xl"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(124, 58, 237, 0.15)',
            boxShadow: '0 20px 60px rgba(124, 58, 237, 0.08), 0 4px 20px rgba(0,0,0,0.03)'
          }}>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-5 p-3.5 rounded-2xl text-sm font-bold flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', color: '#DC2626' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className={`absolute top-3.5 w-5 h-5 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
                  style={{ color: 'var(--color-primary)' }} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="example@email.com"
                  className={`input-field ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <Lock className={`absolute top-3.5 w-5 h-5 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
                  style={{ color: 'var(--color-primary)' }} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className={`input-field ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <motion.button
              id="login-submit-btn"
              type="submit"
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 cursor-pointer mt-6"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.auth.loadingLogin}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{t.auth.submitLogin}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </span>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6 pt-5"
            style={{ borderTop: '1.5px dashed rgba(124, 58, 237, 0.2)' }}>
            <p className="text-[var(--color-muted)] text-sm font-semibold">
              {t.auth.noAccount}{' '}
              <Link href="/auth/register" className="font-black hover:underline text-[var(--color-primary)]">
                {t.auth.createAccountLink}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
