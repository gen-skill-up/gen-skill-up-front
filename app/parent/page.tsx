'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { childrenApi } from '@/lib/api';
import {
  Users,
  Settings,
  Star,
  CheckCircle,
  HelpCircle,
  Plus,
  Shield,
  Save,
  Clock,
  BookOpen,
  Award,
  Loader2
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  grade: number;
  points: number;
  stars: number;
  streakDays: number;
}

function ParentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Settings states
  const [studyLimit, setStudyLimit] = useState<string>('30');
  const [exerciseTarget, setExerciseTarget] = useState<number>(5);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }
    const userObj = JSON.parse(userStr);
    if (userObj.role === 'CHILD') {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    childrenApi.list()
      .then((res) => {
        setChildren(res.data);
        const activeId = childId || (res.data.length > 0 ? res.data[0].id : null);
        if (activeId) {
          const current = res.data.find((c: any) => c.id === activeId);
          const activeChild = current || res.data[0];
          setSelectedChild(activeChild);
          if (activeChild) {
            setSelectedGrade(activeChild.grade || 1);
            const savedLimit = localStorage.getItem(`studyLimit_${activeChild.id}`);
            if (savedLimit) setStudyLimit(savedLimit);
            const savedTarget = localStorage.getItem(`exTarget_${activeChild.id}`);
            if (savedTarget) setExerciseTarget(parseInt(savedTarget));
            
            // Fetch child analytics
            childrenApi.getAnalytics(activeChild.id)
              .then((analyticsRes) => setAnalytics(analyticsRes.data))
              .catch((e) => console.error('Failed to load analytics:', e));
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [childId]);

  const handleChildSwitch = (cId: string) => {
    const nextChild = children.find((c) => c.id === cId);
    if (nextChild) {
      setSelectedChild(nextChild);
      setSelectedGrade(nextChild.grade || 1);
      
      const savedLimit = localStorage.getItem(`studyLimit_${nextChild.id}`);
      setStudyLimit(savedLimit || '30');
      
      const savedTarget = localStorage.getItem(`exTarget_${nextChild.id}`);
      setExerciseTarget(savedTarget ? parseInt(savedTarget) : 5);
      
      setSaveSuccess(false);

      childrenApi.getAnalytics(nextChild.id)
        .then((analyticsRes) => setAnalytics(analyticsRes.data))
        .catch((e) => console.error('Failed to load analytics:', e));
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update grade on backend API
      await childrenApi.update(selectedChild.id, { grade: selectedGrade });
      
      // 2. Save screen time limits and exercise targets locally
      localStorage.setItem(`studyLimit_${selectedChild.id}`, studyLimit);
      localStorage.setItem(`exTarget_${selectedChild.id}`, exerciseTarget.toString());
      
      // Update local state copy
      setSelectedChild((prev: any) => prev ? { ...prev, grade: selectedGrade } : null);
      setChildren((prev) => prev.map((c) => c.id === selectedChild.id ? { ...c, grade: selectedGrade } : c));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save parent configurations:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-6 lg:px-8 pt-8 pb-20 max-w-5xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: '#4F46E5' }} />
            <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {dir === 'rtl' ? 'بوابة الأولياء والأوصياء 👨‍👩‍👧' : 'Espace Parent / Tuteur 👨‍👩‍👧'}
                </h1>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  {dir === 'rtl' ? 'تحكم في أوقات الشاشة، حدد الأهداف، وتابع التقارير المفصلة لطفلك.' : 'Configure les limites d\'écran, ajuste les classes et supervise le travail.'}</p>
              </div>
            </div>
            
            <Link href="/age-select">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-2xl border-b-4 border-indigo-900 cursor-pointer flex items-center gap-1.5 transition-all shadow">
                <Plus className="w-4 h-4" />
                <span>{dir === 'rtl' ? 'إضافة طفل' : 'Ajouter enfant'}</span>
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-3" />
              <p className="text-slate-500 text-xs font-black animate-pulse">جاري تحميل البوابة... / Chargement...</p>
            </div>
          ) : !selectedChild ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <Logo size={48} className="mx-auto opacity-35 mb-4 animate-float" />
              <h4 className="text-sm font-black text-slate-600">{dir === 'rtl' ? 'لا يوجد أطفال مضافين حالياً!' : 'Aucun enfant enregistré !'}</h4>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {dir === 'rtl' ? 'الرجاء الضغط على إضافة طفل لإنشاء ملفهم الأول.' : 'Crée un profil enfant pour commencer.'}
              </p>
              <Link href="/age-select">
                <button className="btn-primary mt-6">{dir === 'rtl' ? 'إنشاء ملف طفل 🚀' : 'Créer un profil 🚀'}</button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left/Center Columns: Configuration form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Save status message */}
                {saveSuccess && (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 text-xs font-black flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{dir === 'rtl' ? 'تم حفظ التغييرات والحدود بنجاح!' : 'Paramètres enregistrés avec succès !'}</span>
                  </div>
                )}

                {/* Form parameters */}
                <form onSubmit={handleSaveChanges} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-800">
                      {dir === 'rtl' ? 'إعدادات التحكم والرقابة' : 'Paramètres de contrôle'}
                    </h3>
                  </div>

                  {/* Child Selector dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 block">
                      {dir === 'rtl' ? 'اختر ملف الطفل لتعديله:' : 'Sélectionne le profil de l\'enfant :'}
                    </label>
                    <select
                      value={selectedChild.id}
                      onChange={(e) => handleChildSwitch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold p-3 rounded-2xl outline-none focus:border-indigo-400"
                    >
                      {children.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Daily Screen study limit */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{dir === 'rtl' ? 'حد وقت الدراسة اليومي (الشاشة):' : 'Limite de temps d\'étude quotidien (Écran) :'}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { val: '15', label: dir === 'rtl' ? '15 دقيقة' : '15 min' },
                        { val: '30', label: dir === 'rtl' ? '30 دقيقة' : '30 min' },
                        { val: '60', label: dir === 'rtl' ? 'ساعة كاملة' : '1 heure' },
                        { val: 'unlimited', label: dir === 'rtl' ? 'غير محدود' : 'Illimité' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setStudyLimit(opt.val)}
                          className={`border-b-4 font-black py-2.5 rounded-2xl text-[10px] cursor-pointer transition-all ${
                            studyLimit === opt.val
                              ? 'bg-indigo-600 border-indigo-700 text-white shadow'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weekly target exercises */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 block">
                      {dir === 'rtl' ? 'الهدف الأسبوعي من التمارين:' : 'Objectif hebdomadaire d\'exercices :'}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="2"
                        max="25"
                        value={exerciseTarget}
                        onChange={(e) => setExerciseTarget(parseInt(e.target.value))}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs px-3 py-1.5 rounded-xl shrink-0">
                        {exerciseTarget} {dir === 'rtl' ? 'تمارين' : 'Exercices'}
                      </span>
                    </div>
                  </div>

                  {/* Adjust school grade level */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 block">
                      {dir === 'rtl' ? 'تعديل السنة الدراسية للطفل:' : 'Modifier la classe scolaire :'}
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold p-3 rounded-2xl outline-none focus:border-indigo-400"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          {(t.lessons.grades as any)[`g${g}`] || `السنة ${g}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Save button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3.5 rounded-2xl border-b-4 border-indigo-900 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4.5 h-4.5" />
                    <span>{saving ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Sauvegarde...') : (dir === 'rtl' ? 'حفظ كافة التغييرات' : 'Enregistrer les paramètres')}</span>
                  </button>
                </form>

              </div>

              {/* Right Column: Active child quick reports & AI analytics */}
              <div className="space-y-6">
                
                {/* Child statistics dashboard */}
                <div className="bg-[#1D1B84]/95 rounded-3xl p-5 border border-indigo-500/20 relative overflow-hidden flex flex-col gap-3 shadow-lg text-white">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 bg-indigo-400 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h3 className="font-black text-xs text-indigo-300">
                      {dir === 'rtl' ? 'تقرير التميز الأكاديمي' : 'Rapport Académique'}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs font-bold mt-2">
                    <div className="flex justify-between bg-white/5 p-2.5 rounded-xl">
                      <span>{dir === 'rtl' ? 'الاسم:' : 'Nom :'}</span>
                      <span>{selectedChild.name}</span>
                    </div>
                    <div className="flex justify-between bg-white/5 p-2.5 rounded-xl">
                      <span>{dir === 'rtl' ? 'مجموع النقاط:' : 'XP total :'}</span>
                      <span className="text-amber-400">{selectedChild.points} XP</span>
                    </div>
                    <div className="flex justify-between bg-white/5 p-2.5 rounded-xl">
                      <span>{dir === 'rtl' ? 'الدروس المكتملة:' : 'Leçons terminées :'}</span>
                      <span className="text-sky-300">{analytics?.totalLessonsCompleted ?? 0}</span>
                    </div>
                    <div className="flex justify-between bg-white/5 p-2.5 rounded-xl">
                      <span>{dir === 'rtl' ? 'التمارين المنجزة:' : 'Exercices résolus :'}</span>
                      <span className="text-emerald-300">{analytics?.totalExercisesSolved ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* Subject Analytics breakdown */}
                {analytics?.subjectAnalytics && analytics.subjectAnalytics.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                      <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                      <h4 className="text-xs font-black text-slate-800">
                        {dir === 'rtl' ? 'معدل الأداء حسب المواد' : 'Performance par Matière'}
                      </h4>
                    </div>
                    <div className="space-y-3 pt-1">
                      {analytics.subjectAnalytics.map((item: any) => (
                        <div key={item.subject} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>{item.subject}</span>
                            <span className="text-indigo-600 font-extrabold">{item.avgScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(item.avgScore, 5)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                            <span>{item.lessonsCompleted} {dir === 'rtl' ? 'دروس' : 'leçons'}</span>
                            <span>{item.xp} XP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Placement test recommendations */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-800">{dir === 'rtl' ? 'توصيات الذكاء الاصطناعي' : 'Diagnostic IA'}</h4>
                  </div>
                  <div className="space-y-2 text-[10px] font-bold text-slate-500 leading-normal">
                    {analytics?.strengths?.length > 0 && (
                      <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                        <p className="text-emerald-800 font-black mb-0.5">🌟 {dir === 'rtl' ? 'نقاط القوة:' : 'Points forts :'}</p>
                        <p className="text-emerald-700 font-semibold">{analytics.strengths.join(' ، ')}</p>
                      </div>
                    )}
                    {analytics?.weaknesses?.length > 0 && (
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                        <p className="text-amber-800 font-black mb-0.5">⚠️ {dir === 'rtl' ? 'نقاط التحسين:' : 'À renforcer :'}</p>
                        <p className="text-amber-700 font-semibold">{analytics.weaknesses.join(' ، ')}</p>
                      </div>
                    )}
                    <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">
                      <p className="text-indigo-700 font-black mb-0.5">📌 {dir === 'rtl' ? 'المهارة المستهدفة حالياً:' : 'Compétence cible :'}</p>
                      <p>{dir === 'rtl' ? 'حل التمارين التكيفية المنتظمة مع المعلم الذكي أنيس للحفاظ على استمرارية التعلم.' : 'Pratiquer régulièrement avec Anis le hibou.'}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

    </div>
  );
}

export default function ParentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <ParentContent />
    </Suspense>
  );
}
