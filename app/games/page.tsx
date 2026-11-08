'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  ShoppingBag, 
  Sparkles, 
  Trophy, 
  Star, 
  Search, 
  Play, 
  ArrowRight, 
  Filter,
  Check,
  BookOpen,
  GraduationCap,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { THIRTY_GAMES, SUBJECT_FILTERS, GRADE_FILTERS, GameDefinition } from './data/gamesList';

export default function GamesArcadeHubPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter games based on subject, grade, and search query
  const filteredGames = THIRTY_GAMES.filter((game) => {
    // Subject filter
    if (selectedSubject !== 'all' && game.subject !== selectedSubject) {
      return false;
    }
    // Grade filter
    if (selectedGrade !== 0) {
      if (selectedGrade === 1 && !game.grades.some(g => g === 1 || g === 2)) return false;
      if (selectedGrade === 2 && !game.grades.some(g => g === 3 || g === 4)) return false;
      if (selectedGrade === 3 && !game.grades.some(g => g === 5 || g === 6)) return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchDesc = game.description.toLowerCase().includes(q);
      const matchSubject = game.subjectLabel.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSubject) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#3D364A] p-4 sm:p-6 md:p-8 font-sans select-none" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Arcade Hero Header */}
        <div className="relative bg-gradient-to-r from-[#E8927C] via-[#E58066] to-[#F2B5C8] text-white rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-right">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-black shadow-xs">
                <Gamepad2 className="w-4 h-4 text-amber-200" />
                <span>مكتبة الألعاب التعليمية الذكية (30 لعبة)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-xs" style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}>
                أروقة الألعاب التفاعلية الممتعة 🎮
              </h1>
              <p className="text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed font-bold">
                اكتشف 30 لعبة تفاعلية شيقة ومطابقة للمناهج التونسية في الرياضيات، الإيقاظ العلمي، اللغات، التاريخ، والمنطق!
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-2xl shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 text-white rounded-xl shadow-inner">
                  <Trophy className="w-6 h-6 text-amber-200" />
                </div>
                <div>
                  <span className="block text-xs text-white/80 font-bold">الألعاب المتاحة</span>
                  <span className="text-xl font-black text-white font-mono">30 لعبة</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 text-white rounded-xl shadow-inner">
                  <GraduationCap className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <span className="block text-xs text-white/80 font-bold">المواد التعليمية</span>
                  <span className="text-xl font-black text-white">6 مواد</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Quests / Mini Challenges Banner */}
        <div className="bg-white border border-[#F2DDD0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-[#E8927C] to-[#F5C26B] text-white rounded-2xl font-bold shadow-xs">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black text-[#3D364A] block">مهمة اليوم التفاعلية 🎯</span>
              <span className="text-xs sm:text-sm text-[#6E637C] font-semibold">العب 3 ألعاب تعليمية مختلفة لكسب مكافأة +100 XP فورية!</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black bg-[#FEF8EC] px-4 py-2 rounded-2xl border border-[#F6E3B8] text-[#8A601B]">
            <Flame className="w-4 h-4 text-[#D4A75E] fill-[#D4A75E]" />
            <span>حماس يومي نشط 🔥</span>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="bg-white border border-[#F2DDD0] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Search Input & Grade Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لعبة أو مادة أو مهارة..."
                className="w-full bg-[#FAF8F5] border border-[#F2DDD0] focus:border-[#E8927C] rounded-2xl px-4 py-3 pr-10 text-sm text-[#3D364A] placeholder:text-[#A49AA7] outline-none transition shadow-inner font-bold"
              />
              <Search className="w-5 h-5 text-[#A49AA7] absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Grade Level Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {GRADE_FILTERS.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition shrink-0 border ${
                    selectedGrade === grade.id
                      ? 'bg-[#E8927C] text-white border-[#E8927C] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#6E637C] border-[#F2DDD0] hover:border-[#E8927C]'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Tabs Filter */}
          <div className="flex items-center gap-2.5 overflow-x-auto pt-3 border-t border-[#F2DDD0] pb-1">
            {SUBJECT_FILTERS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 border ${
                  selectedSubject === sub.id
                    ? 'bg-[#FDF0EB] text-[#E8927C] border-[#F2DDD0] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6E637C] border-[#F2DDD0] hover:text-[#3D364A]'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Games Grid (Displaying all 30 games) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#3D364A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E8927C]" />
              <span>الألعاب التعليمية ({filteredGames.length} من 30):</span>
            </h2>
            <span className="text-xs sm:text-sm text-[#6E637C] font-bold">تفاعلية بالكامل 🎮</span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="bg-white border border-[#F2DDD0] rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <span className="text-4xl block">🔍</span>
              <h3 className="text-base font-bold text-[#3D364A]">لم نجد ألعاباً مطابقة لبحثك</h3>
              <p className="text-xs text-[#6E637C]">جرب تغيير المادة أو المستوى الدراسي المختار</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {filteredGames.map((game) => {
                const playUrl = game.gameType === 'custom_page' && game.customUrl 
                  ? game.customUrl 
                  : `/games/play/${game.id}`;

                return (
                  <div
                    key={game.id}
                    className="bg-white border border-[#F2DDD0] hover:border-[#E8927C] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black bg-[#FDF0EB] text-[#E8927C] border border-[#F2DDD0] px-3 py-1 rounded-full">
                          {game.badge}
                        </span>
                        <span className="text-xs text-[#2D6A53] font-black">
                          +{game.xpReward} XP
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-[#FAF8F5] rounded-2xl border border-[#F2DDD0] flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-inner p-1">
                          {game.icon}
                        </div>
                        <div>
                          <h3 className="font-black text-[#3D364A] text-base leading-snug">{game.title}</h3>
                          <span className="text-xs text-[#6E637C] font-bold block mt-0.5">{game.subtitle}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#6E637C] leading-relaxed line-clamp-2 font-medium">
                        {game.description}
                      </p>

                      {/* Subject & Grade Pill */}
                      <div className="flex items-center justify-between text-xs text-[#6E637C] bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#F2DDD0] font-bold">
                        <span className="text-[#E8927C]">{game.subjectLabel}</span>
                        <span>{game.gradeLabel}</span>
                      </div>
                    </div>

                    {/* Launch Game Button */}
                    <div className="pt-3.5 mt-3.5 border-t border-[#F2DDD0]">
                      <Link
                        href={playUrl}
                        className="w-full bg-gradient-to-r from-[#E8927C] to-[#E58066] hover:from-[#D97D67] hover:to-[#D47157] text-white font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>العب الآن 🚀</span>
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
