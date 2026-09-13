'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lessonsApi, childrenApi } from '@/lib/api';
import {
  Repeat,
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle,
  Loader2,
  Trophy,
  Brain,
  HelpCircle
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  subject: string;
  duration: number;
  completed: boolean;
  unlocked: boolean;
  order: number;
  axis: string;
  subTopic: string;
}

interface Child {
  id: string;
  name: string;
  points: number;
  stars: number;
}

function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);

    Promise.all([
      childrenApi.get(childId),
      lessonsApi.list(childId)
    ])
      .then(([childRes, lessonsRes]) => {
        setChild(childRes.data);
        // Filter out completed lessons
        const completed = lessonsRes.data.filter((l: Lesson) => l.completed);
        setCompletedLessons(completed);
      })
      .catch((err) => {
        console.error('Error loading reviews:', err);
      })
      .finally(() => setLoading(false));
  }, [childId]);

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#FFF9F0]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-100 border border-red-200">
          <HelpCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black mb-2 text-slate-800">{(t as any).reviews.selectChildError}</h2>
        <Link href="/dashboard">
          <button className="btn-primary mt-4">{(t as any).reviews.dashboardBtn}</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-8 pt-8 pb-20 max-w-5xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: '#7C3AED' }} />
            <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                <Repeat className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {(t as any).reviews.title}
                </h1>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  {(t as any).reviews.subtitle}
                </p>
              </div>
            </div>
            
            {child && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 px-4 py-2.5 rounded-2xl shrink-0">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span className="text-xs font-black text-indigo-800">
                  {child.points} XP
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#A855F7] mb-3" />
              <p className="text-slate-500 text-xs font-black animate-pulse">{(t as any).reviews.loadingText}</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Revision Progress statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">{completedLessons.length}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{(t as any).reviews.completedLessons}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">+{completedLessons.length * 10} XP</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{(t as any).reviews.earnedXp}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">
                    {completedLessons.length > 0 ? (t as any).reviews.excellentStatus : (t as any).reviews.startLearningStatus}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{(t as any).reviews.memoryStatus}</p>
                </div>
              </div>

              {/* Completed Lessons Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span>{(t as any).reviews.completedLessonsSection}</span>
                </h3>

                {completedLessons.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                    <Logo size={48} className="mx-auto opacity-35 mb-4 animate-float" />
                    <h4 className="text-sm font-black text-slate-600">{(t as any).reviews.noLessonsCompleted}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {(t as any).reviews.noLessonsDesc}
                    </p>
                    <Link href={`/lessons?childId=${childId}`}>
                      <button className="btn-primary mt-6 text-xs font-black">{(t as any).reviews.goToLessonsBtn}</button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {completedLessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-44"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                              {lesson.axis || (t as any).reviews.generalAxis}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">
                              {lesson.duration} min ⏱️
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 line-clamp-2 mt-1.5 leading-snug">{lesson.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-tight">{lesson.subTopic}</p>
                        </div>

                        <div className="border-t border-slate-50 pt-3 flex justify-between items-center mt-3">
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            ✓ {(t as any).reviews.completedBadge}
                          </span>
                          <Link href={`/lessons/${lesson.id}?childId=${childId}`}>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] px-3.5 py-1.5 rounded-xl border-b-2 border-purple-900 cursor-pointer flex items-center gap-1 transition-all">
                              <span>{(t as any).reviews.reviewNowBtn}</span>
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A855F7]" />
      </div>
    }>
      <ReviewsContent />
    </Suspense>
  );
}
