'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  Sparkles, 
  RotateCcw, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Heart
} from 'lucide-react';
import { soundEngine } from '../components/SoundEngine';

interface WordPuzzle {
  word: string;
  category: string;
  hint: string;
  icon: string;
}

const PUZZLE_WORDS: WordPuzzle[] = [
  { word: 'تُونِس', category: 'وطني الغالي', hint: 'خضراء جميلة في قلب المتوسط', icon: '🇹🇳' },
  { word: 'زَيْتُون', category: 'طبيعة وتغذية', hint: 'شجرة مباركة تشتهر بها صفاقس والساحل', icon: '🫒' },
  { word: 'قَرْطَاج', category: 'تاريخ وآثار', hint: 'مدينة أثرية عريقة أسستها عليسة', icon: '🏛️' },
  { word: 'يَاسَمِين', category: 'زهور تونس', hint: 'رمز الفرح والمشموم التونسي الأصيل', icon: '🌸' },
  { word: 'مَدْرَسَة', category: 'تعليم ومعرفة', hint: 'مكان نكتسب فيه العلم والأصدقاء', icon: '🏫' },
  { word: 'قَيْرَوَان', category: 'مدن وتاريخ', hint: 'عاصمة الأغالبة ومدينة جامع عقبة والمقروض', icon: '🕌' },
  { word: 'حَنَّبَعْل', category: 'شخصيات تاريخية', hint: 'قائد قرطاجي عبقري قهر جبال الألب', icon: '🛡️' },
  { word: 'صَدَاقَة', category: 'قيم وأخلاق', hint: 'كنز جميل بين الرفاق والأحباب', icon: '🤝' },
];

export default function WordCatcherGamePage() {
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [muted, setMuted] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [collectedLetters, setCollectedLetters] = useState<string[]>([]);
  const [availableBubbles, setAvailableBubbles] = useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  const currentPuzzle = PUZZLE_WORDS[currentIdx % PUZZLE_WORDS.length];
  // Strip diacritics for clean matching
  const cleanWordLetters = currentPuzzle.word.replace(/[\u064B-\u065F]/g, '').split('');

  // Setup challenge
  const setupPuzzle = (puzzle: WordPuzzle) => {
    setCollectedLetters([]);
    const wordLetters = puzzle.word.replace(/[\u064B-\u065F]/g, '').split('');
    
    // Add some random distractor Arabic letters
    const alphabet = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'س', 'ش', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
    const distractors = alphabet.filter(l => !wordLetters.includes(l)).sort(() => 0.5 - Math.random()).slice(0, 3);

    const allBubbles = [...wordLetters, ...distractors].sort(() => 0.5 - Math.random());
    setAvailableBubbles(allBubbles);
  };

  useEffect(() => {
    setupPuzzle(currentPuzzle);
  }, [currentIdx]);

  const handlePopLetter = (letter: string, bubbleIndex: number) => {
    const nextExpectedIdx = collectedLetters.length;
    const expectedLetter = cleanWordLetters[nextExpectedIdx];

    if (letter === expectedLetter) {
      // Correct sequence pop!
      soundEngine.playCoin();
      const updated = [...collectedLetters, letter];
      setCollectedLetters(updated);
      
      // Remove bubble from pool
      setAvailableBubbles(prev => prev.filter((_, i) => i !== bubbleIndex));

      // Check if word completed
      if (updated.length === cleanWordLetters.length) {
        soundEngine.playCorrect();
        soundEngine.playLevelUp();
        setScore(s => s + 30 + combo * 5);
        setCombo(c => c + 1);
        setIsSuccessModalOpen(true);
      }
    } else {
      // Wrong sequence
      soundEngine.playWrong();
      setCombo(0);
      setLives(l => Math.max(0, l - 1));
    }
  };

  const bubbleColors = [
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-fuchsia-600',
    'from-cyan-500 to-blue-600'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 font-sans select-none" dir="rtl">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>الألعاب</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-pink-500/20">
                🎯
              </div>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-800 dark:text-white">صائد الكلمات والحروف</h1>
                <span className="text-[10px] text-pink-700 dark:text-pink-300 font-bold">التقط حروف الكلمة التونسية بالترتيب الصحيح</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 dark:bg-slate-950 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 text-center">
              <span className="text-[9px] text-amber-800 dark:text-slate-400 block font-bold leading-none">النقاط</span>
              <span className="text-sm font-black text-amber-700 dark:text-amber-400 font-mono">{score} XP</span>
            </div>

            <div className="flex items-center gap-0.5 bg-rose-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-500/30 shadow-inner">
              {[1, 2, 3].map((h) => (
                <Heart key={h} className={`w-4 h-4 ${h <= lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300 dark:text-slate-800'}`} />
              ))}
            </div>

            <button
              onClick={() => {
                const next = !muted;
                setMuted(next);
                soundEngine.muted = next;
                soundEngine.playClick();
              }}
              className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 transition shadow-sm"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* Word Clue Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-pink-500/40 rounded-3xl p-5 sm:p-6 shadow-sm text-center space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs bg-pink-50 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30 px-3 py-1 rounded-full font-bold">
              {currentPuzzle.category}
            </span>
            <span className="text-3xl">{currentPuzzle.icon}</span>
          </div>

          <div>
            <h2 className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">تلميح الكلمة:</h2>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">« {currentPuzzle.hint} »</p>
          </div>

          {/* Letter Slots Target Display */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {cleanWordLetters.map((targetLetter, idx) => {
              const isFilled = idx < collectedLetters.length;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all shadow-sm ${
                    isFilled
                      ? 'bg-gradient-to-b from-pink-600 to-purple-600 text-white border-pink-500 scale-105 ring-2 ring-pink-500/20'
                      : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isFilled ? collectedLetters[idx] : '؟'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Letter Bubbles Popping Arena */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              انقر على فقاعات الحروف بالترتيب الصحيح لتركيب الكلمة 🎈
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 max-w-xl mx-auto min-h-[140px]">
            {availableBubbles.map((letter, idx) => {
              const bgGradient = bubbleColors[idx % bubbleColors.length];

              return (
                <button
                  key={`${letter}-${idx}`}
                  type="button"
                  onClick={() => handlePopLetter(letter, idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr ${bgGradient} text-white font-black text-2xl sm:text-3xl rounded-full border-2 border-white/60 shadow-lg hover:scale-115 active:scale-90 transition-all flex items-center justify-center hover:brightness-110`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-pink-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scaleUp">
            <div className="w-18 h-18 bg-pink-50 dark:bg-pink-500/20 text-pink-600 rounded-full flex items-center justify-center mx-auto border-2 border-pink-300 shadow-md">
              <Trophy className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">أحسنت يا بطل اللغة! 🎉</h3>
              <p className="text-sm text-pink-600 dark:text-pink-300 font-bold">الكلمة الصحيحة: « {currentPuzzle.word} » {currentPuzzle.icon}</p>
            </div>

            <div className="flex items-center justify-center gap-1 py-1">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-400" />
              <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400 text-amber-400 animate-bounce" />
              <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-400" />
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsSuccessModalOpen(false);
                setCurrentIdx(i => i + 1);
              }}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>الكلمة التالية 🎯</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
