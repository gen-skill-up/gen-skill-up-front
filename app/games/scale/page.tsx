'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Trophy, 
  Star, 
  RotateCcw, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  ArrowRight,
  Flame
} from 'lucide-react';
import { soundEngine } from '../components/SoundEngine';

interface WeightItem {
  id: string;
  name: string;
  weight: number; // in grams
  label: string;
  color: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

const BRASS_WEIGHTS: WeightItem[] = [
  { id: 'w50', name: '50 غرام', weight: 50, label: '50غ', color: 'from-amber-600 to-yellow-700', size: 'sm' },
  { id: 'w100', name: '100 غرام', weight: 100, label: '100غ', color: 'from-yellow-600 to-amber-700', size: 'sm' },
  { id: 'w200', name: '200 غرام', weight: 200, label: '200غ', color: 'from-yellow-500 to-amber-600', size: 'md' },
  { id: 'w250', name: '250 غرام (ربع كغ)', weight: 250, label: '250غ', color: 'from-amber-500 to-yellow-600', size: 'md' },
  { id: 'w500', name: '500 غرام (رطل)', weight: 500, label: '500غ (رطل)', color: 'from-yellow-400 to-amber-600', size: 'lg' },
  { id: 'w1000', name: '1 كيلوغرام (1000غ)', weight: 1000, label: '1 كغ', color: 'from-amber-400 to-yellow-700', size: 'xl' },
  { id: 'w2000', name: '2 كيلوغرام (2000غ)', weight: 2000, label: '2 كغ', color: 'from-amber-300 to-yellow-800', size: 'xl' },
];

interface ProduceItem {
  id: string;
  name: string;
  weight: number; // in grams
  icon: string;
  origin: string;
}

const TUNISIAN_PRODUCE: ProduceItem[] = [
  { id: 'p1', name: 'تفاح سبيطلة اللذيذ', weight: 750, icon: '🍎', origin: 'سبيطلة' },
  { id: 'p2', name: 'دقلة النور الممتازة', weight: 1250, icon: '🌴', origin: 'قبلي وتوزر' },
  { id: 'p3', name: 'برتقال طومسون نابل', weight: 1500, icon: '🍊', origin: 'نابل' },
  { id: 'p4', name: 'رمان قابس الحلو', weight: 800, icon: '🫐', origin: 'قابس' },
  { id: 'p5', name: 'طماطم الوطن القبلي', weight: 500, icon: '🍅', origin: 'الوطن القبلي' },
  { id: 'p6', name: 'حبات تين طازجة', weight: 350, icon: '🍐', origin: 'طبرقة' },
  { id: 'p7', name: 'عنب قرمبالية الفاخر', weight: 2000, icon: '🍇', origin: 'قرمبالية' },
  { id: 'p8', name: 'بطيخ سيدي بوزيد', weight: 3000, icon: '🍉', origin: 'سيدي بوزيد' },
];

export const formatGrams = (grams: number): string => {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg} كغ (${grams} غرام)`;
  }
  if (grams === 500) {
    return '500 غرام (رطل)';
  }
  return `${grams} غرام`;
};

export default function MagicScaleGamePage() {
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [currentProduce, setCurrentProduce] = useState<ProduceItem>(TUNISIAN_PRODUCE[0]);
  const [placedWeights, setPlacedWeights] = useState<WeightItem[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'neutral' | 'success' | 'error' }>({
    message: 'ضع العيارات النحاسية المناسبة في الكفة المقابلة لتعديل الميزان بدقة!',
    type: 'neutral'
  });

  // Pick new challenge
  const generateNewChallenge = () => {
    setPlacedWeights([]);
    const shuffled = [...TUNISIAN_PRODUCE].sort(() => 0.5 - Math.random());
    setCurrentProduce(shuffled[0]);
    setFeedback({
      message: `المطلوب: وزن ${shuffled[0].name} (${formatGrams(shuffled[0].weight)}). ضع العيارات حتى تتوازن الكفتان!`,
      type: 'neutral'
    });
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  const totalRightWeight = placedWeights.reduce((sum, w) => sum + w.weight, 0);
  const totalLeftWeight = currentProduce.weight;
  const weightDiff = totalLeftWeight - totalRightWeight;

  // Tilt angle in degrees (-12 to 12)
  const tiltAngle = Math.max(-12, Math.min(12, weightDiff * 0.015));

  const handleAddWeight = (weightItem: WeightItem) => {
    soundEngine.playCoin();
    setPlacedWeights(prev => [...prev, weightItem]);
  };

  const handleRemoveWeight = (index: number) => {
    soundEngine.playClick();
    setPlacedWeights(prev => prev.filter((_, i) => i !== index));
  };

  const handleVerifyBalance = () => {
    if (weightDiff === 0) {
      soundEngine.playCorrect();
      setScore(s => s + 25 + streak * 5);
      setStreak(st => st + 1);
      setIsSuccessModalOpen(true);
      setFeedback({ message: 'توازن مثالي ورائع! أحسنت وزن المحصول التونسي! ⚖️🌟', type: 'success' });
    } else if (weightDiff > 0) {
      soundEngine.playWrong();
      setStreak(0);
      setFeedback({
        message: `الكفة مائلة للخضار! ينقصك ${weightDiff} غرام لتحقيق التوازن.`,
        type: 'error'
      });
    } else {
      soundEngine.playWrong();
      setStreak(0);
      setFeedback({
        message: `الكفة مائلة للعيارات! وضعت زيادة قدرها ${Math.abs(weightDiff)} غرام.`,
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 font-sans select-none" dir="rtl">
      
      {/* Header */}
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-violet-600 to-purple-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-violet-500/20">
                ⚖️
              </div>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-800 dark:text-white">ميزان الخضار والغلال العجيب</h1>
                <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">تعلم الكيلوغرام والغرام والرطل التونسي</span>
              </div>
            </div>
          </div>

          {/* Stats & Audio */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 dark:bg-slate-950 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 text-center">
              <span className="text-[9px] text-amber-800 dark:text-slate-400 block font-bold leading-none">النقاط</span>
              <span className="text-sm font-black text-amber-700 dark:text-amber-400 font-mono">{score} XP</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-1 bg-violet-600 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>x{streak}</span>
              </div>
            )}

            <button
              onClick={() => {
                const next = !muted;
                setMuted(next);
                soundEngine.muted = next;
                soundEngine.playClick();
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Feedback Bar */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 shadow-sm ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
            : feedback.type === 'error'
            ? 'bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200 dark:border-rose-500/40'
            : 'bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300 border-purple-200 dark:border-purple-500/40'
        }`}>
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
          {feedback.type === 'error' && <RotateCcw className="w-5 h-5 shrink-0 text-rose-600" />}
          {feedback.type === 'neutral' && <HelpCircle className="w-5 h-5 shrink-0 text-purple-600" />}
          <span className="text-xs sm:text-sm font-bold">{feedback.message}</span>
        </div>

        {/* Interactive Roberval Scale Canvas Arena */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          
          {/* Target Produce Badge */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentProduce.icon}</span>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">المحصول المراد وزنه:</span>
                <span className="font-black text-slate-800 dark:text-white text-sm">{currentProduce.name} ({currentProduce.origin})</span>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-purple-200 dark:border-purple-500/30">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 font-mono">
                الوزن المطلوب: {formatGrams(currentProduce.weight)}
              </span>
            </div>
          </div>

          {/* Graphical Balance Scale */}
          <div className="relative py-10 sm:py-12 flex flex-col items-center justify-center">
            
            {/* Center Pointer Dial */}
            <div className="relative z-20 w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-amber-500 shadow-md flex items-center justify-center -mb-8">
              <div 
                className={`w-1 h-7 rounded-full transition-transform duration-300 origin-bottom ${
                  weightDiff === 0 ? 'bg-emerald-500 shadow-sm ring-2 ring-emerald-400' : 'bg-rose-500'
                }`}
                style={{ transform: `rotate(${tiltAngle * 3}deg)` }}
              />
              <div className="absolute w-3 h-3 rounded-full bg-amber-400" />
            </div>

            {/* Central Fulcrum Stand */}
            <div className="w-8 h-36 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-500 rounded-t-lg shadow-md relative z-10" />
            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-900 border-2 border-amber-600 rounded-2xl shadow-sm -mt-2 z-10" />

            {/* Tilting Beam */}
            <div 
              className="absolute top-20 w-4/5 max-w-xl h-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border border-amber-300 rounded-full shadow-lg transition-transform duration-300 origin-center flex justify-between items-center px-4"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              {/* Left Pan (Produce) */}
              <div 
                className="relative -top-2 -right-4 flex flex-col items-center transition-transform duration-300"
                style={{ transform: `rotate(${tiltAngle}deg)` }}
              >
                {/* Chains */}
                <div className="w-16 h-16 border-l-2 border-r-2 border-amber-500/80 -mb-2" />
                {/* Brass Pan */}
                <div className="w-36 h-14 bg-gradient-to-b from-amber-400 to-amber-700 border-2 border-yellow-300 rounded-b-full shadow-lg flex flex-col items-center justify-center p-2 relative">
                  <span className="text-3xl filter drop-shadow">{currentProduce.icon}</span>
                  <span className="text-[10px] font-black text-amber-950 mt-0.5">{formatGrams(currentProduce.weight)}</span>
                </div>
              </div>

              {/* Right Pan (Brass Weights) */}
              <div 
                className="relative -top-2 -left-4 flex flex-col items-center transition-transform duration-300"
                style={{ transform: `rotate(${tiltAngle}deg)` }}
              >
                {/* Chains */}
                <div className="w-16 h-16 border-l-2 border-r-2 border-amber-500/80 -mb-2" />
                {/* Brass Pan */}
                <div className="w-36 h-14 bg-gradient-to-b from-amber-400 to-amber-700 border-2 border-yellow-300 rounded-b-full shadow-lg flex flex-wrap items-center justify-center gap-1 p-2 relative overflow-hidden">
                  {placedWeights.length === 0 ? (
                    <span className="text-[10px] text-amber-950 font-bold">ضع العيارات هنا</span>
                  ) : (
                    placedWeights.map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRemoveWeight(idx)}
                        className="bg-amber-300 text-amber-950 font-black text-[9px] px-1.5 py-0.5 rounded-md border border-amber-500 shadow-sm hover:opacity-75"
                        title="انقر للإزالة"
                      >
                        {w.label}
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Scale Summary Status */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-inner">
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">مجموع العيارات الموضوعة: </span>
              <span className="font-black text-amber-700 dark:text-amber-400 font-mono text-sm">{formatGrams(totalRightWeight)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { soundEngine.playClick(); setPlacedWeights([]); }}
                disabled={placedWeights.length === 0}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                إفراغ الكفة
              </button>

              <button
                onClick={handleVerifyBalance}
                disabled={placedWeights.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تحقق من التوازن ⚖️</span>
              </button>
            </div>
          </div>

        </div>

        {/* Weights Box (صندوق العيارات النحاسية) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-black text-slate-800 dark:text-amber-400 uppercase tracking-wider">
              صندوق العيارات النحاسية (انقر لإضافة العيار للكفة):
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">1000 غرام = 1 كيلوغرام</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {BRASS_WEIGHTS.map((weight) => (
              <button
                key={weight.id}
                onClick={() => handleAddWeight(weight)}
                className={`bg-gradient-to-b ${weight.color} text-amber-950 border border-yellow-400/80 p-3 sm:p-3.5 rounded-2xl font-black shadow-sm hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center`}
              >
                <span className="text-xs font-black">{weight.label}</span>
                <span className="text-[9px] opacity-80 mt-0.5">{weight.weight}غ</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scaleUp">
            <div className="w-18 h-18 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
              <Trophy className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">توازن مثالي وناجح! ⚖️</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">أتقنت وزن {currentProduce.name} بدقة تامة!</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs text-right shadow-inner">
              <div className="flex justify-between">
                <span className="text-slate-500">وزن السلعة:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatGrams(currentProduce.weight)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العيارات المستخدمة:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{placedWeights.map(w => w.label).join(' + ')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsSuccessModalOpen(false);
                generateNewChallenge();
              }}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>المحصول التالي 🍎</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
