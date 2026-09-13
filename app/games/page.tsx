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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-8 font-sans select-none" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Arcade Hero Header — Aligned with Platform Violet/Cyan Theme */}
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-right">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-amber-200 border border-white/20 px-3.5 py-1 rounded-full text-xs font-black shadow-sm">
                <Gamepad2 className="w-4 h-4 text-amber-300" />
                <span>مكتبة الألعاب التعليمية الذكية (30 لعبة)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                أروقة الألعاب التفاعلية الممتعة 🎮
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed font-medium">
                اكتشف 30 لعبة تفاعلية شيقة ومطابقة للمناهج التونسية في الرياضيات، الإيقاظ العلمي، اللغات، التاريخ، والمنطق!
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl shadow-xl shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-400/30 text-amber-200 rounded-xl shadow-inner">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-purple-200 font-bold">الألعاب المتاحة</span>
                  <span className="text-lg font-black text-amber-300 font-mono">30 لعبة</span>
                </div>
              </div>
              <div className="h-7 w-px bg-white/20" />
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-400/30 text-emerald-200 rounded-xl shadow-inner">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-purple-200 font-bold">المواد التعليمية</span>
                  <span className="text-lg font-black text-emerald-300">6 مواد</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Quests / Mini Challenges Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md shadow-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">مهمة اليوم التفاعلية 🎯</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">العب 3 ألعاب تعليمية مختلفة لكسب مكافأة +100 XP فورية!</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>حماس يومي نشط 🔥</span>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
          
          {/* Search Input & Grade Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لعبة أو مادة أو مهارة..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 pr-9 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none transition shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Grade Level Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {GRADE_FILTERS.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${
                    selectedGrade === grade.id
                      ? 'bg-violet-600 text-white border-violet-600 font-black shadow-md shadow-violet-600/20'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 pb-1">
            {SUBJECT_FILTERS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 border ${
                  selectedSubject === sub.id
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
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
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>الألعاب التعليمية ({filteredGames.length} من 30):</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">تفاعلية بالكامل 🎮</span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-2.5 shadow-sm">
              <span className="text-4xl block">🔍</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">لم نجد ألعاباً مطابقة لبحثك</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">جرب تغيير المادة أو المستوى الدراسي المختار</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredGames.map((game) => {
                const playUrl = game.gameType === 'custom_page' && game.customUrl 
                  ? game.customUrl 
                  : `/games/play/${game.id}`;

                return (
                  <div
                    key={game.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50 px-2.5 py-0.5 rounded-full">
                          {game.badge}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black">
                          +{game.xpReward} XP
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl border border-purple-100 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner p-1">
                          {game.icon}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 dark:text-white text-sm leading-snug">{game.title}</h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">{game.subtitle}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {game.description}
                      </p>

                      {/* Subject & Grade Pill */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                        <span className="font-bold text-purple-700 dark:text-purple-300">{game.subjectLabel}</span>
                        <span>{game.gradeLabel}</span>
                      </div>
                    </div>

                    {/* Launch Game Button */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={playUrl}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-purple-600/15 group-hover:shadow-purple-600/30"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
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
