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
      if (id) {
        setChildId(id);
      } else {
        childrenApi
          .list()
          .then((res) => {
            if (res.data && res.data.length > 0) {
              const detected = res.data[0].id;
              setChildId(detected);
              localStorage.setItem('activeChildId', detected);
            } else {
              setLoading(false);
            }
          })
          .catch(() => setLoading(false));
      }
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
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2DDD0] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full opacity-[0.06]" style={{ background: '#E8927C' }} />
            <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <div className="w-16 h-16 rounded-2xl bg-[#FDF0EB] text-[#E8927C] flex items-center justify-center shadow-inner shrink-0">
                <Repeat className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#3D364A]" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                  {(t as any).reviews.title}
                </h1>
                <p className="text-[#6E637C] text-sm sm:text-base font-bold mt-1">
                  {(t as any).reviews.subtitle}
                </p>
              </div>
            </div>
            
            {child && (
              <div className="flex items-center gap-2 bg-[#FDF0EB] border border-[#F2DDD0] px-4 py-2.5 rounded-2xl shrink-0">
                <Star className="w-5 h-5 text-[#D4A75E] fill-[#D4A75E]" />
                <span className="text-sm font-black text-[#8A601B]">
                  {child.points} XP
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#E8927C] mb-3" />
              <p className="text-[#6E637C] text-sm font-black animate-pulse">{(t as any).reviews.loadingText}</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Revision Progress statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-[#F2DDD0] shadow-sm text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF6F3] text-[#2D6A53] flex items-center justify-center mx-auto mb-2 border border-[#D5EAE1]">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-black text-[#3D364A]">{completedLessons.length}</h4>
                  <p className="text-xs text-[#6E637C] font-black uppercase tracking-wider">{(t as any).reviews.completedLessons}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#F2DDD0] shadow-sm text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF8EC] text-[#8A601B] flex items-center justify-center mx-auto mb-2 border border-[#F6E3B8]">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-black text-[#3D364A]">+{completedLessons.length * 10} XP</h4>
                  <p className="text-xs text-[#6E637C] font-black uppercase tracking-wider">{(t as any).reviews.earnedXp}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#F2DDD0] shadow-sm text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0EB] text-[#E8927C] flex items-center justify-center mx-auto mb-2 border border-[#F2DDD0]">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-[#3D364A]">
                    {completedLessons.length > 0 ? (t as any).reviews.excellentStatus : (t as any).reviews.startLearningStatus}
                  </h4>
                  <p className="text-xs text-[#6E637C] font-black uppercase tracking-wider">{(t as any).reviews.memoryStatus}</p>
                </div>
              </div>

              {/* Completed Lessons Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-[#3D364A] flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-[#E8927C]" />
                  <span>{(t as any).reviews.completedLessonsSection}</span>
                </h3>

                {completedLessons.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#F2DDD0]">
                    <Logo size={52} className="mx-auto opacity-35 mb-4 animate-float" />
                    <h4 className="text-base font-black text-[#3D364A]">{(t as any).reviews.noLessonsCompleted}</h4>
                    <p className="text-sm text-[#6E637C] font-semibold mt-1">
                      {(t as any).reviews.noLessonsDesc}
                    </p>
                    <Link href={`/lessons?childId=${childId}`}>
                      <button className="btn-primary mt-6 text-sm font-black">{(t as any).reviews.goToLessonsBtn}</button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {completedLessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className="bg-white rounded-3xl p-6 border border-[#F2DDD0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[180px]"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-xl bg-[#FDF0EB] text-[#E8927C] border border-[#F2DDD0]">
                              {lesson.axis || (t as any).reviews.generalAxis}
                            </span>
                            <span className="text-xs font-bold text-[#6E637C]">
                              {lesson.duration} min ⏱️
                            </span>
                          </div>
                          <h4 className="text-base font-black text-[#3D364A] line-clamp-2 mt-1 leading-snug">{lesson.title}</h4>
                          <p className="text-xs text-[#6E637C] font-bold leading-tight">{lesson.subTopic}</p>
                        </div>

                        <div className="border-t border-[#F2DDD0] pt-3.5 flex justify-between items-center mt-3">
                          <span className="text-xs font-black text-[#2D6A53] bg-[#EEF6F3] border border-[#D5EAE1] px-3 py-1 rounded-full flex items-center gap-1">
                            ✓ {(t as any).reviews.completedBadge}
                          </span>
                          <Link href={`/lessons/${lesson.id}?childId=${childId}`}>
                            <button className="bg-[#E8927C] hover:bg-[#D97D67] text-white font-black text-xs px-4 py-2 rounded-2xl border-b-2 border-[#C9725C] cursor-pointer flex items-center gap-1.5 transition-all shadow-xs">
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
