'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { childrenApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';

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

const avatars = ['cat', 'dog', 'fish', 'bird', 'rabbit', 'smile', 'ghost', 'crown', 'robot'];

export default function AgeSelectPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [step, setStep] = useState<'age' | 'profile'>('age');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('cat');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [userRole, setUserRole] = useState<string>('CHILD');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role || 'CHILD');
      }
    }
  }, []);

  const gradeGroups = [
    { value: 1, label: t.lessons.grades.g1, icon: Sprout, description: dir === 'rtl' ? "السن المعتاد: 6 سنوات" : "Typical age: 6 years", color: '#10B981', age: 6 },
    { value: 2, label: t.lessons.grades.g2, icon: Sprout, description: dir === 'rtl' ? "السن المعتاد: 7 سنوات" : "Typical age: 7 years", color: '#0EA5E9', age: 7 },
    { value: 3, label: t.lessons.grades.g3, icon: Rocket, description: dir === 'rtl' ? "السن المعتاد: 8 سنوات" : "Typical age: 8 years", color: '#8B5CF6', age: 8 },
    { value: 4, label: t.lessons.grades.g4, icon: Rocket, description: dir === 'rtl' ? "السن المعتاد: 9 سنوات" : "Typical age: 9 years", color: '#EC4899', age: 9 },
    { value: 5, label: t.lessons.grades.g5, icon: Trophy, description: dir === 'rtl' ? "السن المعتاد: 10 سنوات" : "Typical age: 10 years", color: '#F59E0B', age: 10 },
    { value: 6, label: t.lessons.grades.g6, icon: Trophy, description: dir === 'rtl' ? "السن المعتاد: 11 سنة" : "Typical age: 11 years", color: '#EF4444', age: 11 },
  ];

  const handleGradeSelect = (gradeVal: number) => {
    setSelectedGrade(gradeVal);
    setStep('profile');
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const selectedGroup = gradeGroups.find(g => g.value === selectedGrade);
      const age = selectedGroup ? selectedGroup.age : 6;
      const payload: any = { name, age, avatarUrl: selectedAvatar, grade: selectedGrade };
      
      if (userRole === 'PARENT') {
        payload.email = studentEmail;
        payload.password = studentPassword;
      }

      const res = await childrenApi.create(payload);
      
      if (userRole === 'PARENT') {
        router.push('/parent');
      } else {
        localStorage.setItem('activeChildId', res.data.id);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.childProfile = res.data;
          localStorage.setItem('user', JSON.stringify(user));
        }
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to create child profile:', err);
      setLoading(false);
    }
  };

  const SelectedAvatarIcon = avatarMap[selectedAvatar] || Smile;

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center stars-bg">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden stars-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5"
          style={{ background: 'radial-gradient(ellipse at center, var(--color-primary), transparent)' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {step === 'age' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-10">
              <motion.div
                className="w-20 h-20 rounded-full bg-[rgba(255,140,66,0.12)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)] border-2 border-[rgba(255,140,66,0.2)]"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <OwlLogo size={48} />
              </motion.div>
              <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>{t.lessons.gradeLabel}</h1>
              <p className="text-[var(--color-muted)] text-sm">{t.ageSelect.stepAgeSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gradeGroups.map((group, i) => {
                const Icon = group.icon;
                return (
                  <motion.button
                    key={group.value}
                    id={`grade-group-${group.value}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleGradeSelect(group.value)}
                    className={`glass rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer ${
                      dir === 'rtl' ? 'text-right flex-row-reverse' : 'text-left flex-row'
                    }`}
                    style={{ border: `2px solid ${group.color}25` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${group.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: group.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-sm mb-0.5" style={{ color: 'var(--color-text)' }}>{group.label}</div>
                      <div className="text-xs text-[var(--color-muted)]">{group.description}</div>
                    </div>
                    <div className="shrink-0 text-[var(--color-primary)]">
                      {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'profile' && (
          <motion.div initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[rgba(255,140,66,0.1)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)] border-2 border-[rgba(255,140,66,0.2)]">
                <SelectedAvatarIcon className="w-10 h-10 animate-float" />
              </div>
              <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>{t.ageSelect.stepProfileTitle}</h1>
              <p className="text-[var(--color-muted)] text-sm">{t.ageSelect.stepProfileSubtitle}</p>
            </div>

            <div className="glass rounded-3xl p-8 space-y-6 shadow-2xl">
              {/* Avatar selection */}
              <div>
                <label className="block text-sm font-bold mb-3 text-[var(--color-muted)]">{t.ageSelect.avatarLabel}</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {avatars.map((av) => {
                    const AvIcon = avatarMap[av];
                    const isSelected = selectedAvatar === av;
                    return (
                      <button
                        key={av}
                        id={`avatar-${av}`}
                        onClick={() => setSelectedAvatar(av)}
                        className="h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        style={{
                          background: isSelected ? 'rgba(255,140,66,0.15)' : 'rgba(255,140,66,0.04)',
                          border: isSelected ? '2.5px solid var(--color-primary)' : '1.5px solid rgba(255,140,66,0.15)',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)'
                        }}
                      >
                        <AvIcon className="w-6 h-6" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold mb-2 text-[var(--color-muted)]">{t.ageSelect.childNameLabel}</label>
                <input
                  id="child-name-input"
                  type="text"
                  placeholder={t.ageSelect.childNamePlaceholder}
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Student Credentials if Parent */}
              {userRole === 'PARENT' && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-muted)]">{t.auth.studentEmailLabel}</label>
                    <input
                      id="student-email-input"
                      type="email"
                      placeholder="student@email.com"
                      className="input-field"
                      value={studentEmail}
                      onChange={e => setStudentEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--color-muted)]">{t.auth.studentPasswordLabel}</label>
                    <input
                      id="student-password-input"
                      type="password"
                      placeholder="••••••••"
                      className="input-field"
                      value={studentPassword}
                      onChange={e => setStudentPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 flex-row">
                <button onClick={() => setStep('age')} className="btn-secondary flex-1 py-3 cursor-pointer">
                  {t.ageSelect.backBtn}
                </button>
                <motion.button
                  id="create-child-btn"
                  onClick={handleCreate}
                  disabled={!name.trim() || loading || (userRole === 'PARENT' && (!studentEmail.trim() || studentPassword.length < 6))}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer"
                  whileHover={{ scale: (!name.trim() || (userRole === 'PARENT' && (!studentEmail.trim() || studentPassword.length < 6))) ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.ageSelect.loading}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.ageSelect.startBtn}</span>
                      <Sparkles className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
