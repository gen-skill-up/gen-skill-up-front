'use client';

import React, { useState } from 'react';
import { Volume2, Sparkles, Lightbulb, Bot, MessageSquare } from 'lucide-react';
import { soundEngine } from './SoundEngine';

export type SalahMood = 'idle' | 'happy' | 'thinking' | 'hint' | 'talking';

interface UncleSalahCharacterProps {
  mood?: SalahMood;
  speechText?: string;
  onAskHint?: () => void;
  isLoadingHint?: boolean;
  className?: string;
}

export default function UncleSalahCharacter({
  mood = 'idle',
  speechText = 'أهلاً بك يا بطل في دكاني! أنا عمّك صلاح، هيا نحسب معاً بالدينار والمليم!',
  onAskHint,
  isLoadingHint = false,
  className = ''
}: UncleSalahCharacterProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Web Speech API Voice for Arabic (Works seamlessly in all modern browsers)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || soundEngine.muted) return;

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`relative flex flex-col sm:flex-row items-center gap-3 ${className}`}>
      
      {/* Character Visual Avatar */}
      <div className="relative group shrink-0">
        {/* Glow halo */}
        <div className={`absolute -inset-1 rounded-full blur-lg opacity-60 transition-all duration-500 ${
          mood === 'happy'
            ? 'bg-emerald-500 animate-pulse'
            : mood === 'hint'
            ? 'bg-amber-400 animate-bounce'
            : 'bg-indigo-500/40'
        }`} />

        {/* Illustrated Vector Uncle Salah */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-amber-700 via-amber-900 to-slate-900 border-3 border-amber-400 shadow-xl overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              {/* Tunisian Chechia Red Gradient */}
              <linearGradient id="chechiaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              {/* Skin Tone Gradient */}
              <radialGradient id="skinGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="70%" stopColor="#fdba74" />
                <stop offset="100%" stopColor="#fb923c" />
              </radialGradient>
            </defs>

            {/* Background pattern */}
            <circle cx="60" cy="60" r="58" fill="#1e293b" opacity="0.3" />

            {/* Apron / Shoulders */}
            <path d="M20 120 Q60 95 100 120 L100 130 L20 130 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            <path d="M40 102 L60 120 L80 102" fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeLinecap="round" />

            {/* Head */}
            <ellipse cx="60" cy="62" rx="28" ry="30" fill="url(#skinGrad)" stroke="#c2410c" strokeWidth="1" />

            {/* Traditional Tunisian Red Chechia with Tassel (كبية) */}
            <path d="M34 46 C34 26 86 26 86 46 Z" fill="url(#chechiaGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
            {/* Tassel (الكبوشة الزرقاء / السوداء) */}
            <circle cx="60" cy="27" r="3.5" fill="#0f172a" />
            <path d="M60 27 Q70 28 72 38" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

            {/* Ears */}
            <circle cx="31" cy="64" r="5.5" fill="#fdba74" />
            <circle cx="89" cy="64" r="5.5" fill="#fdba74" />

            {/* Eyebrows */}
            <path d="M42 50 Q50 46 54 50" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M66 50 Q70 46 78 50" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

            {/* Eyes */}
            {mood === 'happy' ? (
              <>
                <path d="M43 56 Q48 51 53 56" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                <path d="M67 56 Q72 51 77 56" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="48" cy="56" r="4.5" fill="#0f172a" />
                <circle cx="46.5" cy="54.5" r="1.5" fill="#ffffff" />
                <circle cx="72" cy="56" r="4.5" fill="#0f172a" />
                <circle cx="70.5" cy="54.5" r="1.5" fill="#ffffff" />
              </>
            )}

            {/* Friendly Moustache (الشارب التونسي الأنيق) */}
            <path d="M42 69 Q60 67 60 74 Q60 67 78 69 Q60 78 42 69 Z" fill="#334155" />

            {/* Glasses */}
            <circle cx="48" cy="56" r="9" fill="none" stroke="#d97706" strokeWidth="1.8" />
            <circle cx="72" cy="56" r="9" fill="none" stroke="#d97706" strokeWidth="1.8" />
            <line x1="57" y1="56" x2="63" y2="56" stroke="#d97706" strokeWidth="2" />

            {/* Mouth / Smile */}
            {isSpeaking || mood === 'talking' ? (
              <ellipse cx="60" cy="80" rx="6" ry="4" fill="#991b1b" className="animate-pulse" />
            ) : (
              <path d="M52 79 Q60 85 68 79" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Cheeks Blush */}
            <circle cx="39" cy="66" r="4" fill="#f43f5e" opacity="0.35" />
            <circle cx="81" cy="66" r="4" fill="#f43f5e" opacity="0.35" />
          </svg>

          {/* Status Indicator Icon */}
          <div className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-950 p-1 rounded-full text-[10px] font-bold shadow-md">
            {mood === 'hint' ? '💡' : mood === 'happy' ? '⭐' : '🇹🇳'}
          </div>
        </div>
      </div>

      {/* Speech Bubble / Dialogue Box */}
      <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-amber-300/80 dark:border-amber-500/40 rounded-2xl p-3 shadow-sm relative text-right">
        {/* Triangle tail pointing to avatar */}
        <div className="hidden sm:block absolute top-5 -right-2.5 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-6 border-l-amber-300/80 dark:border-l-amber-500/40" />

        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-amber-700 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>عمّ صلاح العطّار:</span>
            </span>
            <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 font-bold">
              خبير الحساب
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speakText(speechText)}
              className={`p-1 sm:px-2 sm:py-1 rounded-lg border transition flex items-center gap-1 text-[11px] font-bold shadow-sm ${
                isSpeaking
                  ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 border-slate-200 dark:border-slate-700'
              }`}
              title="استمع لصوت عمّ صلاح"
            >
              <Volume2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">اقرأ</span>
            </button>

            {onAskHint && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAskHint();
                }}
                disabled={isLoadingHint}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1 shadow-sm"
              >
                <Lightbulb className="w-3 h-3" />
                <span>تلميح</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Content */}
        <p className="text-slate-700 dark:text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed">
          {speechText}
        </p>
      </div>

    </div>
  );
}
