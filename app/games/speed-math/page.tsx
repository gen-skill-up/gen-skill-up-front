'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  Flame, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowLeft, 
  Zap, 
  Timer, 
  Heart, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Gauge,
  Play
} from 'lucide-react';
import { soundEngine } from '../components/SoundEngine';

interface Question {
  id: number;
  text: string;
  options: number[];
  answer: number;
  explanation: string;
  points: number;
}

export default function SpeedMathGamePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [distance, setDistance] = useState<number>(0); // in meters
  const [speed, setSpeed] = useState<number>(60); // km/h
  const [nitroActive, setNitroActive] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  // Current Math Question
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('speed-math-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Generate Math Question based on difficulty
  const generateQuestion = useCallback((): Question => {
    let a = 0, b = 0, op = '+', answer = 0, text = '';
    const ops = selectedDifficulty === 'easy' ? ['+', '-'] : selectedDifficulty === 'medium' ? ['+', '-', '*'] : ['+', '-', '*', 'millimes'];

    const chosenOp = ops[Math.floor(Math.random() * ops.length)];

    if (chosenOp === '+') {
      if (selectedDifficulty === 'easy') {
        a = Math.floor(Math.random() * 15) + 1;
        b = Math.floor(Math.random() * 15) + 1;
      } else if (selectedDifficulty === 'medium') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
      } else {
        a = Math.floor(Math.random() * 300) + 100;
        b = Math.floor(Math.random() * 300) + 100;
      }
      answer = a + b;
      text = `${a} + ${b} = ؟`;
    } else if (chosenOp === '-') {
      if (selectedDifficulty === 'easy') {
        a = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * a);
      } else if (selectedDifficulty === 'medium') {
        a = Math.floor(Math.random() * 80) + 20;
        b = Math.floor(Math.random() * (a - 10)) + 5;
      } else {
        a = Math.floor(Math.random() * 500) + 200;
        b = Math.floor(Math.random() * (a - 50)) + 50;
      }
      answer = a - b;
      text = `${a} - ${b} = ؟`;
    } else if (chosenOp === '*') {
      if (selectedDifficulty === 'medium') {
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
      } else {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
      }
      answer = a * b;
      text = `${a} × ${b} = ؟`;
    } else {
      // Tunisian Millimes Math
      const vals = [200, 350, 500, 600, 750, 1000, 1500, 2000];
      a = vals[Math.floor(Math.random() * vals.length)];
      b = vals[Math.floor(Math.random() * vals.length)];
      answer = a + b;
      text = `${a} مليم + ${b} مليم = ؟`;
    }

    // Generate 3 wrong options
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * (chosenOp === '*' ? a : chosenOp === 'millimes' ? 100 : 2);
      const fake = answer + delta;
      if (fake >= 0 && fake !== answer) {
        optionsSet.add(fake);
      }
    }

    const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());

    return {
      id: Date.now(),
      text,
      options,
      answer,
      explanation: `${text.replace(' = ؟', '')} = ${answer}`,
      points: selectedDifficulty === 'easy' ? 15 : selectedDifficulty === 'medium' ? 25 : 40
    };
  }, [selectedDifficulty]);

  // Start Game
  const handleStartGame = () => {
    soundEngine.playClick();
    setScore(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(60);
    setDistance(0);
    setSpeed(60);
    setFeedback(null);
    setSelectedOption(null);
    setGameState('playing');
    setCurrentQ(generateQuestion());
  };

  // Timer Tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          soundEngine.playLevelUp();
          setGameState('gameover');
          return 0;
        }
        return t - 1;
      });

      // Update distance based on speed
      setDistance(d => d + Math.floor(speed / 10));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, speed]);

  // Handle Option Click
  const handleSelectOption = (opt: number) => {
    if (!currentQ || selectedOption !== null) return;
    setSelectedOption(opt);

    if (opt === currentQ.answer) {
      // Correct!
      soundEngine.playCorrect();
      const comboMultiplier = combo + 1;
      const gain = currentQ.points * comboMultiplier;

      setScore(s => {
        const next = s + gain;
        if (next > highScore) {
          setHighScore(next);
          localStorage.setItem('speed-math-highscore', next.toString());
        }
        return next;
      });

      setCombo(c => {
        const nextCombo = c + 1;
        if (nextCombo >= 3) {
          soundEngine.playCombo();
          setNitroActive(true);
          setSpeed(180);
          setTimeout(() => setNitroActive(false), 2000);
        } else {
          setSpeed(s => Math.min(140, s + 15));
        }
        return nextCombo;
      });

      setFeedback({ isCorrect: true, text: `إجابة خارقة! +${gain} نقطة نيترو! 🚀` });

      setTimeout(() => {
        setSelectedOption(null);
        setFeedback(null);
        setCurrentQ(generateQuestion());
      }, 500);

    } else {
      // Wrong
      soundEngine.playWrong();
      setCombo(0);
      setSpeed(50);
      setFeedback({ isCorrect: false, text: `خطأ! الإجابة الصحيحة هي ${currentQ.answer}` });

      setLives(l => {
        const rem = l - 1;
        if (rem <= 0) {
          soundEngine.playWrong();
          setTimeout(() => setGameState('gameover'), 800);
        }
        return rem;
      });

      setTimeout(() => {
        setSelectedOption(null);
        setFeedback(null);
        if (lives > 1) {
          setCurrentQ(generateQuestion());
        }
      }, 900);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 font-sans select-none" dir="rtl">
      
      {/* Top Arcade Navigation */}
      <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-violet-500/20">
                🏎️
              </div>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-800 dark:text-white">سباق الحساب الذهني السريع</h1>
                <span className="text-[10px] text-purple-700 dark:text-indigo-300 font-bold">سرعة وردة فعل وحساب دقيق</span>
              </div>
            </div>
          </div>

          {/* Sound & HUD */}
          <div className="flex items-center gap-3">
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

      {/* Main Container */}
      <div className="max-w-5xl mx-auto">
        
        {/* State: MENU */}
        {gameState === 'menu' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6 max-w-2xl mx-auto animate-scaleUp">
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-4xl sm:text-5xl shadow-md shadow-purple-600/20 animate-bounce">
              🏎️
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">سباق الحساب الذهني 🏁</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                اضغط على الإجابة الصحيحة بأسرع ما يمكن لتفعيل النيترو وتجاوز المنافسين في حلبة السباق!
              </p>
            </div>

            {/* Difficulty Options */}
            <div className="space-y-2 text-right">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">اختر مستوى التحدي:</span>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'easy', label: 'مبتدئ 🟢', desc: 'جمع وطرح بسيط' },
                  { id: 'medium', label: 'بطل 🟡', desc: 'جداول الضرب والجمع' },
                  { id: 'hard', label: 'أسطورة 🔴', desc: 'عمليات معقدة ومليمات' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedDifficulty(d.id as any);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedDifficulty === d.id
                        ? 'bg-purple-50 dark:bg-violet-950/50 border-purple-500 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 font-black shadow-sm scale-102'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-black text-xs sm:text-sm">{d.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Record HighScore */}
            <div className="bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
              <span className="text-xs text-amber-800 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> أعلى رقم قياسي مسجل:
              </span>
              <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-400 font-mono">{highScore} XP</span>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 sm:py-4 rounded-2xl shadow-md shadow-emerald-600/20 transition transform active:scale-95 text-base sm:text-lg flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              <span>انطلاق السباق الآن! 🚀</span>
            </button>

          </div>
        )}

        {/* State: PLAYING */}
        {gameState === 'playing' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            
            {/* Race HUD Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Timer */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">الوقت المتبقي</span>
                  <span className={`text-lg sm:text-xl font-black font-mono ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                    {timeLeft} ثانية
                  </span>
                </div>
              </div>

              {/* Speedometer */}
              <div className={`border rounded-2xl p-3 flex items-center gap-3 transition-all shadow-sm ${
                nitroActive ? 'bg-cyan-50 dark:bg-indigo-950/80 border-cyan-400 ring-2 ring-cyan-400/40 animate-pulse' : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}>
                <div className="p-2.5 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    {nitroActive ? 'نيترو فائق! 🔥' : 'السرعة الحالية'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {speed} كم/س
                  </span>
                </div>
              </div>

              {/* Score & Combo */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">النقاط</span>
                  <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {score} XP
                  </span>
                </div>
              </div>

              {/* Lives */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">المحاولات</span>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3].map((h) => (
                      <Heart key={h} className={`w-4 h-4 sm:w-5 sm:h-5 ${h <= lives ? 'fill-rose-500 text-rose-500' : 'text-slate-200 dark:text-slate-700'}`} />
                    ))}
                  </div>
                </div>

                {combo > 1 && (
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-sm animate-bounce flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>x{combo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Race Track Simulation Visual Banner */}
            <div className="relative h-24 sm:h-28 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner flex items-center px-6">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 via-slate-100 to-slate-200/50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-indigo-950/60" />
              
              {/* Animated Road Lines */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 border-t-2 border-b-2 border-dashed border-amber-400 opacity-70" />

              {/* Player Car Icon moving based on speed */}
              <div 
                className={`relative z-10 transition-all duration-300 flex items-center gap-2 ${
                  nitroActive ? 'transform scale-125' : ''
                }`}
                style={{ right: `${Math.min(80, (distance % 1000) / 12)}%` }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center text-2xl sm:text-3xl">
                  🏎️
                </div>
                {nitroActive && (
                  <span className="text-xl animate-pulse">🔥💨</span>
                )}
              </div>

              {/* Finish Line Marker */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">
                🏁
              </div>
            </div>

            {/* Math Question Arena */}
            {currentQ && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-5">
                
                {/* Question Text */}
                <div className="space-y-1">
                  <span className="text-xs text-purple-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                    احسب العملية بأقصى سرعة:
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white font-mono tracking-tight my-2">
                    {currentQ.text}
                  </div>
                </div>

                {/* Feedback Message */}
                {feedback && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold animate-fadeIn shadow-sm ${
                    feedback.isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40' : 'bg-rose-50 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                  }`}>
                    {feedback.text}
                  </div>
                )}

                {/* Options 4 Grid Buttons */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isAnswer = opt === currentQ.answer;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        disabled={selectedOption !== null}
                        className={`p-4 sm:p-5 rounded-2xl text-2xl sm:text-3xl font-black font-mono transition-all transform active:scale-95 border-2 shadow-sm ${
                          selectedOption === null
                            ? 'bg-slate-50 dark:bg-slate-950 hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border-slate-200/80 dark:border-slate-700 hover:border-purple-300 hover:scale-102'
                            : isAnswer
                            ? 'bg-emerald-600 text-white border-emerald-500 ring-4 ring-emerald-500/30'
                            : isSelected
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 border-slate-200/50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

        {/* State: GAMEOVER */}
        {gameState === 'gameover' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 max-w-lg mx-auto animate-scaleUp">
            <div className="w-18 h-18 bg-amber-50 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300 shadow-md">
              <Trophy className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">نهاية السباق الحماسي! 🏁</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">أداء رائع وسرعة بديهة فائقة في الحساب الذهني</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-right text-xs shadow-inner">
              <div className="flex justify-between">
                <span className="text-slate-500">النقاط المحققة:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-base font-mono">{score} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المسافة المقطوعة:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">{distance} متر</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المستوى:</span>
                <span className="font-bold text-purple-700 dark:text-indigo-300">
                  {selectedDifficulty === 'easy' ? 'مبتدئ' : selectedDifficulty === 'medium' ? 'بطل' : 'أسطورة'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartGame}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة السباق 🏎️</span>
              </button>

              <Link
                href="/games"
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition"
              >
                ركن الألعاب
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
