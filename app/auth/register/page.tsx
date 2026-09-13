'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Mail, Lock, User, AlertCircle, Loader2, ArrowLeft, ArrowRight, Star, Sparkles, BookOpen, Trophy } from 'lucide-react';
import Logo from '../../components/Logo';

const decorativeItems = [
  { Icon: Star, color: '#FFD93D', x: 5, y: 10, delay: 0 },
  { Icon: Sparkles, color: '#4ECDC4', x: 90, y: 15, delay: 0.8 },
  { Icon: BookOpen, color: '#A855F7', x: 8, y: 80, delay: 1.2 },
  { Icon: Trophy, color: '#FF8C42', x: 88, y: 75, delay: 0.4 },
  { Icon: Star, color: '#F472B6', x: 82, y: 45, delay: 1.8 },
];

export default function RegisterPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'PARENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError(t.auth.errorPasswordMismatch);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.register({
        email: form.email,
        name: form.name,
        password: form.password,
        role: form.role,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'CHILD') {
        router.push('/age-select');
      } else {
        router.push('/parent');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else {
        setError(msg || t.auth.errorDefault);
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
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg2)]">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-80 h-80 rounded-full opacity-12"
          style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)' }} />
        <div className="absolute bottom-[-10%] right-[20%] w-72 h-72 rounded-full opacity-12"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }} />
        <div className="absolute top-[40%] right-[-5%] w-52 h-52 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }} />
      </div>

      {/* Floating icons */}
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
        <div className="text-center mb-6">
          <Link href="/">
            <motion.div
              className="inline-flex items-center gap-3 mb-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Logo size={48} />
              </motion.div>
              <span className="text-2xl font-black" style={{ fontFamily: 'Fredoka One, sans-serif', color: 'var(--color-primary)' }}>
                {t.common.brand}
              </span>
            </motion.div>
          </Link>
          <h1 className="text-3xl font-black mt-1 mb-1 text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.auth.registerTitle}
          </h1>
          <p className="text-[var(--color-muted)] text-sm font-semibold">{t.auth.registerSubtitle}</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">{t.auth.roleLabel}</label>
              <div className="grid grid-cols-2 gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'PARENT' })}
                  className={`border-b-4 font-black py-3 rounded-2xl text-xs cursor-pointer transition-all ${
                    form.role === 'PARENT'
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.auth.parentRole}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'CHILD' })}
                  className={`border-b-4 font-black py-3 rounded-2xl text-xs cursor-pointer transition-all ${
                    form.role === 'CHILD'
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.auth.childRole}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">{t.auth.fullNameLabel}</label>
              <div className="relative">
                <User className={`absolute top-3.5 w-5 h-5 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
                  style={{ color: 'var(--color-primary)' }} />
                <input
                  id="register-name"
                  type="text"
                  placeholder={t.auth.fullNamePlaceholder}
                  className={`input-field ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  style={{ borderColor: 'rgba(124,58,237,0.15)' }}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">{t.auth.emailLabel}</label>
              <div className="relative">
                <Mail className={`absolute top-3.5 w-5 h-5 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
                  style={{ color: 'var(--color-primary)' }} />
                <input
                  id="register-email"
                  type="email"
                  placeholder="example@email.com"
                  className={`input-field ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  style={{ borderColor: 'rgba(124,58,237,0.15)' }}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">{t.auth.passwordLabel}</label>
              <div className="relative">
                <Lock className={`absolute top-3.5 w-5 h-5 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
                  style={{ color: 'var(--color-primary)' }} />
                <input
                  id="register-password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  className={`input-field ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  style={{ borderColor: 'rgba(124,58,237,0.15)' }}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600">{t.auth.confirmPasswordLabel}</label>
              <div className="relative">
                <Lock className={`absolute top-3.5 w-5 h-5 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
                  style={{ color: 'var(--color-primary)' }} />
                <input
                  id="register-confirm"
                  type="password"
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  className={`input-field ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  style={{ borderColor: 'rgba(124,58,237,0.15)' }}
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
            </div>

            <motion.button
              id="register-submit-btn"
              type="submit"
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 cursor-pointer mt-6"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.auth.loadingRegister}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{t.auth.submitRegister}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </span>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6 pt-5"
            style={{ borderTop: '1.5px dashed rgba(124, 58, 237, 0.2)' }}>
            <p className="text-[var(--color-muted)] text-sm font-semibold">
              {t.auth.haveAccount}{' '}
              <Link href="/auth/login" className="font-black hover:underline text-[var(--color-primary)]">
                {t.auth.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
