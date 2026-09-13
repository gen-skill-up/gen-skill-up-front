'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { exercisesApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OwlLogo from '../../components/Logo';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  Star,
  Compass,
  ThumbsUp,
  XCircle,
  Lightbulb,
  Zap,
  TrendingUp,
  MessageCircle,
  Globe,
  BookOpen,
  Trophy,
  Check,
  X,
  BookmarkCheck
} from 'lucide-react';

const subjectIcons: Record<string, any> = {
  MATHS: Brain,
  FRANCAIS: MessageCircle,
  LOGIQUE: HelpCircle,
  CULTURE: Globe,
  ARABIC: BookOpen,
  SCIENCE: Compass,
  ISLAMIC_CIVIC: Star,
  ENGLISH: Globe,
  SOCIALS: BookmarkCheck,
};

const subjectStyles: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
  MATHS:        { color: 'var(--color-accent)', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)',   gradient: 'linear-gradient(135deg, var(--color-accent), #1D4ED8)' },
  FRANCAIS:     { color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',   gradient: 'linear-gradient(135deg, var(--color-warning), #EA580C)' },
  LOGIQUE:      { color: 'var(--color-primary)', bg: 'rgba(124,58,237,0.1)',   border: 'rgba(124,58,237,0.25)',   gradient: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' },
  CULTURE:      { color: 'var(--color-secondary)', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)',   gradient: 'linear-gradient(135deg, var(--color-secondary), #0891B2)' },
  ARABIC:       { color: 'var(--color-primary)', bg: 'rgba(124,58,237,0.1)',   border: 'rgba(124,58,237,0.25)',   gradient: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' },
  SCIENCE:      { color: 'var(--color-green)', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)',   gradient: 'linear-gradient(135deg, var(--color-green), #047857)' },
  ISLAMIC_CIVIC:{ color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',   gradient: 'linear-gradient(135deg, var(--color-warning), #D97706)' },
  ENGLISH:      { color: 'var(--color-pink)', bg: 'rgba(236,72,153,0.1)',   border: 'rgba(236,72,153,0.25)',   gradient: 'linear-gradient(135deg, var(--color-pink), #BE185D)' },
  SOCIALS:      { color: 'var(--color-purple)', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)',   gradient: 'linear-gradient(135deg, var(--color-purple), #6D28D9)' },
};

function ExerciseDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const exerciseId = params.id as string;
  const fromLesson = searchParams.get('fromLesson');
  const [childId, setChildId] = useState<string | null>(null);
  const [exercise, setExercise] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [selectedLeftIdxMap, setSelectedLeftIdxMap] = useState<Record<number, number | null>>({});
  const [shuffledRightItemsMap, setShuffledRightItemsMap] = useState<Record<number, { originalIdx: number; text: string }[]>>({});
  const [shuffledOrderItemsMap, setShuffledOrderItemsMap] = useState<Record<number, { originalIdx: number; text: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const moveItem = (qIdx: number, fromIdx: number, toIdx: number) => {
    if (feedback) return;
    const currentOrder = [...(selectedAnswers[qIdx] || [])];
    if (toIdx < 0 || toIdx >= currentOrder.length) return;
    // Swap original indices in user's order
    const temp = currentOrder[fromIdx];
    currentOrder[fromIdx] = currentOrder[toIdx];
    currentOrder[toIdx] = temp;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: currentOrder,
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!exerciseId) return;

    exercisesApi
      .get(exerciseId)
      .then((res) => setExercise(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  useEffect(() => {
    if (!exercise) return;
    const questions = exercise.content?.questions || [];
    
    const newShuffledRightMap: Record<number, { originalIdx: number; text: string }[]> = {};
    const newShuffledOrderMap: Record<number, { originalIdx: number; text: string }[]> = {};
    const initialAnswers: Record<number, any> = {};

    questions.forEach((q: any, qIdx: number) => {
      if (q.type === 'matching' && q.right) {
        const rightWithIndices = q.right.map((text: string, originalIdx: number) => ({
          originalIdx,
          text,
        }));
        const shuffled = [...rightWithIndices].sort(() => Math.random() - 0.5);
        newShuffledRightMap[qIdx] = shuffled;
      } else if (q.type === 'ordering' && q.items) {
        const itemsWithIndices = q.items.map((text: string, originalIdx: number) => ({
          originalIdx,
          text,
        }));
        const shuffled = [...itemsWithIndices].sort(() => Math.random() - 0.5);
        newShuffledOrderMap[qIdx] = shuffled;
        initialAnswers[qIdx] = shuffled.map(item => item.originalIdx);
      }
    });

    setShuffledRightItemsMap(newShuffledRightMap);
    setShuffledOrderItemsMap(newShuffledOrderMap);
    setSelectedAnswers(initialAnswers);
  }, [exercise]);

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (feedback) return; // Prevent changing after submission
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optIdx,
    });
  };

  const handleSubmit = async () => {
    if (!childId) return;
    setSubmitting(true);
    
    const payload = Object.entries(selectedAnswers).map(([qIdxStr, val]) => {
      const idx = parseInt(qIdxStr);
      const q = questions[idx];
      if (q?.type === 'matching') {
        const shuffledRight = shuffledRightItemsMap[idx] || [];
        const matchDict = val || {};
        const matchArray = Array(q.left.length).fill(-1);
        for (let l = 0; l < q.left.length; l++) {
          const shuffledRIdx = matchDict[l];
          if (shuffledRIdx !== undefined && shuffledRIdx !== null && shuffledRight[shuffledRIdx]) {
            matchArray[l] = shuffledRight[shuffledRIdx].originalIdx;
          }
        }
        return {
          questionIdx: idx,
          selectedMatch: matchArray,
        };
      } else if (q?.type === 'ordering') {
        return {
          questionIdx: idx,
          selectedOrder: val, // array of ordered indices
        };
      } else {
        return {
          questionIdx: idx,
          selectedIdx: val, // number
        };
      }
    });

    try {
      const res = await exercisesApi.submit(exerciseId, childId, payload as any);
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionControls = (q: any, qIdx: number, answerSelected: any, optionLetters: string[]) => {
    // 1. QCM
    if ((!q.type || q.type === 'qcm') && q.options) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {q.options.map((option: string, optIdx: number) => {
            const isSelected = answerSelected === optIdx;
            const isCorrect = q.correctIdx === optIdx;
            const isWrongSelection = isSelected && !isCorrect;
            const optionLetter = optionLetters[optIdx] || String(optIdx + 1);

            let borderStyle = 'border-2 border-[rgba(124,58,237,0.12)] bg-[rgba(124,58,237,0.02)] hover:bg-[rgba(124,58,237,0.06)]';
            let textStyle = 'text-[var(--color-text)] font-semibold';
            let letterBg = 'bg-[rgba(124,58,237,0.06)] text-[var(--color-primary)]';

            if (feedback) {
              if (isCorrect) {
                borderStyle = 'border-2 border-[var(--color-green)] bg-[rgba(16,185,129,0.1)] shadow-sm';
                textStyle = 'text-[var(--color-green)] font-black';
                letterBg = 'bg-[var(--color-green)] text-white';
              } else if (isWrongSelection) {
                borderStyle = 'border-2 border-[var(--color-red)] bg-[rgba(239,68,68,0.1)] shadow-sm';
                textStyle = 'text-[var(--color-red)] font-black';
                letterBg = 'bg-[var(--color-red)] text-white';
              } else {
                borderStyle = 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60';
              }
            } else if (isSelected) {
              borderStyle = `border-2 border-[var(--color-primary)] bg-[rgba(124,58,237,0.08)] shadow-md`;
              textStyle = 'text-[var(--color-primary)] font-black';
              letterBg = 'bg-[var(--color-primary)] text-white';
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={!!feedback}
                onClick={() => handleOptionSelect(qIdx, optIdx)}
                className={`p-4 rounded-2xl transition-all flex items-center gap-4 text-start ${
                  !!feedback ? 'cursor-default' : 'cursor-pointer hover:shadow-md active:scale-98'
                } ${borderStyle}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black shadow-inner ${letterBg}`}>
                  {optionLetter}
                </div>
                <span className={`text-sm ${textStyle}`}>{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // 2. True/False
    if (q.type === 'true_false' && q.options) {
      return (
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
          {q.options.map((option: string, optIdx: number) => {
            const isSelected = answerSelected === optIdx;
            const isCorrect = q.correctIdx === optIdx;
            const isWrongSelection = isSelected && !isCorrect;
            const isTrueButton = optIdx === 0;

            let borderStyle = isTrueButton 
              ? 'border border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-900/50' 
              : 'border border-slate-200 dark:border-slate-800 hover:border-rose-400 bg-slate-50/50 dark:bg-slate-900/50';
            let textStyle = 'text-slate-600 dark:text-slate-300 font-semibold';
            let emojiColor = 'opacity-65';

            if (feedback) {
              if (isCorrect) {
                borderStyle = 'border-2 border-[var(--color-green)] bg-[rgba(16,185,129,0.1)]';
                textStyle = 'text-[var(--color-green)] font-black';
                emojiColor = 'scale-110';
              } else if (isWrongSelection) {
                borderStyle = 'border-2 border-[var(--color-red)] bg-[rgba(239,68,68,0.1)]';
                textStyle = 'text-[var(--color-red)] font-black';
                emojiColor = 'scale-110';
              } else {
                borderStyle = 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-40';
              }
            } else if (isSelected) {
              borderStyle = isTrueButton 
                ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-md' 
                : 'border-2 border-rose-500 bg-rose-500/10 shadow-md';
              textStyle = isTrueButton 
                ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                : 'text-rose-600 dark:text-rose-400 font-black';
              emojiColor = 'scale-115';
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={!!feedback}
                onClick={() => handleOptionSelect(qIdx, optIdx)}
                className={`py-6 px-4 rounded-3xl transition-all flex flex-col items-center justify-center gap-2 text-center select-none ${
                  !!feedback ? 'cursor-default' : 'cursor-pointer hover:shadow-lg active:scale-95'
                } ${borderStyle}`}
              >
                <span className={`text-3xl transition-transform ${emojiColor}`}>
                  {isTrueButton ? '👍' : '👎'}
                </span>
                <span className={`text-sm ${textStyle}`}>{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // 3. Fill Blanks
    if (q.type === 'fill_blanks' && q.text && q.options) {
      const textParts = q.text.split('[blank]');
      return (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-center font-bold text-base md:text-lg text-slate-700 dark:text-slate-200">
            <span>{textParts[0]}</span>
            <span className={`mx-2 px-4 py-1.5 rounded-xl border-2 font-black transition-all ${
              feedback 
                ? q.correctIdx === answerSelected
                  ? 'border-[var(--color-green)] bg-[rgba(16,185,129,0.1)] text-[var(--color-green)]'
                  : 'border-[var(--color-red)] bg-[rgba(239,68,68,0.1)] text-[var(--color-red)] animate-shake'
                : answerSelected !== undefined
                  ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                  : 'border-slate-300 bg-slate-100 text-slate-400 animate-pulse'
            }`}>
              {answerSelected !== undefined ? q.options[answerSelected] : '..........'}
            </span>
            <span>{textParts[1]}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {q.options.map((option: string, optIdx: number) => {
              const isSelected = answerSelected === optIdx;
              const isCorrect = q.correctIdx === optIdx;
              const isWrongSelection = isSelected && !isCorrect;

              let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-purple-400';
              let textStyle = '';

              if (feedback) {
                if (isCorrect) {
                  btnStyle = 'border-2 border-[var(--color-green)] bg-[rgba(16,185,129,0.1)] text-[var(--color-green)]';
                  textStyle = 'font-black';
                } else if (isWrongSelection) {
                  btnStyle = 'border-2 border-[var(--color-red)] bg-[rgba(239,68,68,0.1)] text-[var(--color-red)]';
                  textStyle = 'font-black';
                } else {
                  btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-40';
                }
              } else if (isSelected) {
                btnStyle = 'border-2 border-purple-500 bg-purple-500 text-white shadow-md';
                textStyle = 'font-black';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={!!feedback}
                  onClick={() => handleOptionSelect(qIdx, optIdx)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-extrabold transition-all duration-250 cursor-pointer ${
                    !!feedback ? 'cursor-default' : 'hover:-translate-y-0.5 active:scale-95'
                  } ${btnStyle} ${textStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 4. Matching
    if (q.type === 'matching' && q.left) {
      const matchDict = answerSelected || {};
      const selectedLeftIdx = selectedLeftIdxMap[qIdx] !== undefined && selectedLeftIdxMap[qIdx] !== null ? selectedLeftIdxMap[qIdx] : null;
      const leftColors = [
        { border: 'border-purple-400 dark:border-purple-600', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
        { border: 'border-blue-400 dark:border-blue-600', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
        { border: 'border-emerald-400 dark:border-emerald-600', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
        { border: 'border-amber-400 dark:border-amber-600', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
      ];
      const shuffledRight = shuffledRightItemsMap[qIdx] || [];

      return (
        <div className="space-y-6" style={{ direction: dir }}>
          <div className="grid grid-cols-2 gap-8 items-start">
            
            {/* Left Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase mb-2">المجموعة أ</h4>
              {q.left.map((item: string, lIdx: number) => {
                const color = leftColors[lIdx % leftColors.length];
                const isSelected = selectedLeftIdx === lIdx;
                const matchedRightShuffledIdx = matchDict[lIdx];
                const isMatched = matchedRightShuffledIdx !== undefined;

                let borderStyle = isSelected 
                  ? 'border-2 border-purple-500 bg-purple-500/10' 
                  : isMatched 
                    ? `border border-dashed ${color.border} ${color.bg}` 
                    : 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50';

                if (feedback) {
                  const correctIdx = lIdx;
                  const isCorrect = matchedRightShuffledIdx !== undefined && 
                    shuffledRight[matchedRightShuffledIdx]?.originalIdx === correctIdx;
                  borderStyle = isCorrect
                    ? 'border-2 border-[var(--color-green)] bg-[rgba(16,185,129,0.1)]'
                    : 'border-2 border-[var(--color-red)] bg-[rgba(239,68,68,0.1)]';
                }

                return (
                  <button
                    key={lIdx}
                    type="button"
                    onClick={() => {
                      if (feedback) return;
                      setSelectedLeftIdxMap({
                        ...selectedLeftIdxMap,
                        [qIdx]: lIdx
                      });
                    }}
                    disabled={!!feedback}
                    className={`w-full p-4 rounded-2xl text-sm font-black transition-all flex items-center justify-between text-start select-none ${
                      !!feedback ? 'cursor-default' : 'cursor-pointer hover:shadow-md active:scale-98'
                    } ${borderStyle}`}
                  >
                    <span>{item}</span>
                    {isMatched && !feedback && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border ${color.text} font-black`}>
                        صلة {lIdx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase mb-2">المجموعة ب</h4>
              {shuffledRight.map((item, rIdx) => {
                let matchedLeftIdx: number | null = null;
                Object.entries(matchDict).forEach(([lIdx, shuffleRIdx]) => {
                  if (shuffleRIdx === rIdx) {
                    matchedLeftIdx = parseInt(lIdx);
                  }
                });

                const isMatched = matchedLeftIdx !== null;
                const color = matchedLeftIdx !== null ? leftColors[matchedLeftIdx % leftColors.length] : null;

                let borderStyle = isMatched && color
                  ? `border-2 ${color.border} ${color.bg}`
                  : 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50';

                if (feedback && isMatched) {
                  const correctIdx = matchedLeftIdx!;
                  const isCorrect = item.originalIdx === correctIdx;
                  borderStyle = isCorrect
                    ? 'border-2 border-[var(--color-green)] bg-[rgba(16,185,129,0.1)]'
                    : 'border-2 border-[var(--color-red)] bg-[rgba(239,68,68,0.1)]';
                }

                return (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => {
                      if (feedback || selectedLeftIdx === null) return;
                      const currentMatches = { ...matchDict };
                      Object.keys(currentMatches).forEach(k => {
                        if (currentMatches[k] === rIdx) {
                          delete currentMatches[k];
                        }
                      });
                      currentMatches[selectedLeftIdx] = rIdx;
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [qIdx]: currentMatches
                      });
                      setSelectedLeftIdxMap({
                        ...selectedLeftIdxMap,
                        [qIdx]: null
                      });
                    }}
                    disabled={!!feedback || selectedLeftIdx === null}
                    className={`w-full p-4 rounded-2xl text-sm font-black transition-all flex items-center justify-between text-start select-none ${
                      (selectedLeftIdx === null || !!feedback) ? 'cursor-default opacity-85' : 'cursor-pointer hover:border-purple-400 active:scale-98'
                    } ${borderStyle}`}
                  >
                    <span>{item.text}</span>
                    {isMatched && color && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border ${color.text} font-black`}>
                        صلة {matchedLeftIdx! + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
          {!feedback && selectedLeftIdx !== null && (
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 animate-pulse text-center mt-2">
              👉 اختر العنصر المطابق من المجموعة ب للربطه بـ: "{q.left[selectedLeftIdx]}"
            </p>
          )}
        </div>
      );
    }

    // 5. Ordering
    if (q.type === 'ordering' && q.items) {
      const userOrder = answerSelected || [];
      return (
        <div className="space-y-4 max-w-md mx-auto" style={{ direction: dir }}>
          {!feedback && (
            <p className="text-xs text-slate-400 text-center font-bold mb-2">
              🔄 استخدم الأسهم لترتيب العناصر بالشكل الصحيح:
            </p>
          )}
          <div className="space-y-3">
            {userOrder.map((originalIdx: number, displayIdx: number) => {
              const itemText = q.items[originalIdx];
              const isCorrectPosition = originalIdx === displayIdx;

              let borderStyle = 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50';
              if (feedback) {
                borderStyle = isCorrectPosition
                  ? 'border-2 border-[var(--color-green)] bg-[rgba(16,185,129,0.1)]'
                  : 'border-2 border-[var(--color-red)] bg-[rgba(239,68,68,0.1)]';
              }

              return (
                <motion.div
                  key={originalIdx}
                  layout
                  className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition-all ${borderStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black">
                      {displayIdx + 1}
                    </span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{itemText}</span>
                  </div>
                  
                  {!feedback && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={displayIdx === 0}
                        onClick={() => moveItem(qIdx, displayIdx, displayIdx - 1)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={displayIdx === userOrder.length - 1}
                        onClick={() => moveItem(qIdx, displayIdx, displayIdx + 1)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const questions = exercise?.content?.questions || [];
  
  const isQuestionAnswered = (qIdx: number) => {
    const ans = selectedAnswers[qIdx];
    const q = questions[qIdx];
    if (!q) return false;
    if (ans === undefined) return false;
    if (q.type === 'matching') {
      return Object.keys(ans).length === q.left?.length;
    }
    if (q.type === 'ordering') {
      return Array.isArray(ans) && ans.length === q.items?.length;
    }
    return ans !== undefined;
  };

  const allAnswered = questions.length > 0 && questions.every((_: any, idx: number) => isQuestionAnswered(idx));
  
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((_: any, idx: number) => isQuestionAnswered(idx)).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const subjectKey = exercise?.subject?.toUpperCase() || 'MATHS';
  const activeStyles = subjectStyles[subjectKey] || subjectStyles.MATHS;
  const SubjectIcon = subjectIcons[subjectKey] || Brain;
  const borderSideClass = dir === 'rtl' ? 'border-r-4' : 'border-l-4';

  return (
    <div className="w-full stars-bg pb-20">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 glass border-b-2 border-[rgba(124,58,237,0.12)] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href={fromLesson ? `/lessons/${fromLesson}?childId=${childId}` : `/lessons?childId=${childId}`} className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
              {dir === 'rtl' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="text-sm font-bold">{fromLesson ? t.lessons.backToLessons : t.ageSelect.backBtn}</span>
            </Link>
            <div className="flex items-center gap-2 md:hidden">
              <OwlLogo size={32} />
              <span className="text-lg font-black text-[var(--color-primary)]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.common.brand}
              </span>
            </div>
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>

        {loading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : !exercise ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20">
            <div className="mb-4">
              <OwlLogo size={60} />
            </div>
            <h2 className="text-2xl font-black mb-4 text-[var(--color-text)]">التمرين غير موجود / Exercise Not Found</h2>
            <Link href={fromLesson ? `/lessons/${fromLesson}?childId=${childId}` : `/lessons?childId=${childId}`}>
              <button className="btn-primary">{fromLesson ? t.lessons.backToLessons : t.exercises.title}</button>
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Exercise card */}
          <div className="glass rounded-3xl p-8 border-2 border-[rgba(124,58,237,0.15)] shadow-2xl space-y-6">
            <div className={`flex items-center justify-between gap-3 flex-wrap ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: activeStyles.bg }}
                >
                  <SubjectIcon className="w-5 h-5" style={{ color: activeStyles.color }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--color-muted)] text-[10px] font-black uppercase tracking-wider">
                    {(t.lessons as any)[exercise.subject.toLowerCase()] || exercise.subject}
                  </span>
                  <span 
                    className="font-extrabold text-[10px] uppercase inline-block self-start mt-0.5 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100"
                  >
                    {(t.dashboard.levels as any)[exercise.difficulty] || exercise.difficulty}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Store exercise content in sessionStorage for AI tutor context
                  try {
                    const questions = exercise.content?.questions || [];
                    const questionsText = questions.map((q: any, i: number) => {
                      let qText = `${i + 1}. ${q.question || q.text || ''}`;
                      if (q.options) qText += ` (${q.options.join(' / ')})`;
                      return qText;
                    }).join('\n');
                    sessionStorage.setItem('aiExplainContext', JSON.stringify({
                      type: 'exercise',
                      title: exercise.title,
                      description: exercise.description || '',
                      subject: exercise.subject,
                      difficulty: exercise.difficulty,
                      questions: questionsText,
                    }));
                  } catch (e) { /* ignore storage errors */ }
                  router.push(`/learn-with-ai?childId=${childId}&lessonId=${exercise.lessonId || ''}&subject=${exercise.subject || 'MATHS'}&autoExplain=true`);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{dir === 'rtl' ? 'اشرح التمرين بالذكاء الاصطناعي 🦉' : 'Explain Exercise with AI 🦉'}</span>
              </button>
            </div>

            <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-2xl font-black text-[var(--color-text)]">{exercise.title}</h1>
              <p className="text-sm text-[var(--color-muted)] font-bold">{exercise.description}</p>
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="glass rounded-3xl p-6 border-2 border-[rgba(124,58,237,0.15)] shadow-md space-y-3">
            <div className={`flex items-center justify-between text-xs font-black text-slate-500 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{t.exercises.progress || "التقدم:"}</span>
              </span>
              <span>
                {feedback ? (
                  dir === 'rtl'
                    ? `نتيجة التصحيح لـ ${totalQuestions} أسئلة`
                    : `Correction results for ${totalQuestions} questions`
                ) : (
                  dir === 'rtl'
                    ? `السؤال ${currentQuestionIdx + 1} من ${totalQuestions}`
                    : `Question ${currentQuestionIdx + 1} of ${totalQuestions}`
                )}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100/80 overflow-hidden border border-slate-200/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feedback ? 100 : progressPercentage}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: activeStyles.gradient || 'linear-gradient(135deg, #7C3AED, #60A5FA)',
                }}
              />
            </div>
          </div>

          {/* Active Question or Stacked Corrections */}
          <div className="space-y-8">
            {!feedback ? (
              // Solving mode: Render only the active question card
              (() => {
                const qIdx = currentQuestionIdx;
                const q = questions[qIdx];
                if (!q) return null;
                
                const answerSelected = selectedAnswers[qIdx];
                const answered = isQuestionAnswered(qIdx);
                const optionLetters = dir === 'rtl' ? ['أ', 'ب', 'ج', 'د', 'هـ'] : ['A', 'B', 'C', 'D', 'E'];

                return (
                  <motion.div 
                    key={qIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`glass rounded-3xl p-6 md:p-8 border-2 border-[rgba(124,58,237,0.12)] shadow-lg space-y-6 relative overflow-hidden`}
                  >
                    {/* Decorative side accent */}
                    <div 
                      className="absolute top-0 bottom-0 w-1.5"
                      style={{
                        left: dir === 'rtl' ? 'auto' : 0,
                        right: dir === 'rtl' ? 0 : 'auto',
                        background: answered ? activeStyles.gradient : 'rgba(124,58,237,0.12)'
                      }}
                    />

                    {/* Question header */}
                    <div className={`flex items-center justify-between border-b border-slate-100 pb-3 ${
                      dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-purple-50 text-[var(--color-primary)] border border-purple-100">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{t.placementTest.questionLabel || "سؤال"} {qIdx + 1} / {totalQuestions}</span>
                      </span>
                      {answered && (
                        <span className="text-[10px] font-bold text-[var(--color-green)] bg-[rgba(16,185,129,0.1)] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.exercises.answered || "تمت الإجابة"}</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg font-black text-[var(--color-text)] leading-relaxed ${
                      dir === 'rtl' ? 'text-right' : 'text-left'
                    }`}>
                      <span>{q.text}</span>
                    </h3>

                    {/* Question Interactive Controls */}
                    {renderQuestionControls(q, qIdx, answerSelected, optionLetters)}

                  </motion.div>
                );
              })()
            ) : (
              // Correction mode: Render all questions in a vertical stack
              questions.map((q: any, qIdx: number) => {
                const answerSelected = selectedAnswers[qIdx];
                const optionLetters = dir === 'rtl' ? ['أ', 'ب', 'ج', 'د', 'هـ'] : ['A', 'B', 'C', 'D', 'E'];

                return (
                  <motion.div 
                    key={qIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`glass rounded-3xl p-6 md:p-8 border-2 border-[rgba(124,58,237,0.12)] shadow-lg space-y-6 relative overflow-hidden`}
                  >
                    {/* Decorative side accent */}
                    <div 
                      className="absolute top-0 bottom-0 w-1.5"
                      style={{
                        left: dir === 'rtl' ? 'auto' : 0,
                        right: dir === 'rtl' ? 0 : 'auto',
                        background: activeStyles.gradient
                      }}
                    />

                    {/* Question header */}
                    <div className={`flex items-center justify-between border-b border-slate-100 pb-3 ${
                      dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-purple-50 text-[var(--color-primary)] border border-purple-100">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{t.placementTest.questionLabel || "سؤال"} {qIdx + 1} / {totalQuestions}</span>
                      </span>
                    </div>

                    <h3 className={`text-lg font-black text-[var(--color-text)] leading-relaxed ${
                      dir === 'rtl' ? 'text-right' : 'text-left'
                    }`}>
                      <span>{q.text}</span>
                    </h3>

                    {/* Question Interactive Controls */}
                    {renderQuestionControls(q, qIdx, answerSelected, optionLetters)}

                    {/* Inline detailed question explanation with icons */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      {q.explanation && (
                        <div className={`p-4 rounded-2xl bg-violet-50/50 border border-violet-100 text-sm flex items-start gap-3 shadow-inner ${borderSideClass} border-[var(--color-primary)]`}>
                          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-[var(--color-primary)] shrink-0 mt-0.5 shadow-sm">
                            <BookOpen className="w-4.5 h-4.5" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-black text-xs text-[var(--color-primary)] block">
                              {t.exercises.questionExplanation || "شرح الحل:"}
                            </span>
                            <p className="text-[var(--color-text)] font-semibold leading-relaxed text-start">{q.explanation}</p>
                          </div>
                        </div>
                      )}

                      {q.funFact && (
                        <div className={`p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-sm flex items-start gap-3 shadow-inner ${borderSideClass} border-[var(--color-warning)]`}>
                          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-[var(--color-warning)] shrink-0 mt-0.5 shadow-sm">
                            <Sparkles className="w-4.5 h-4.5" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-black text-xs text-amber-700 block">
                              {t.exercises.funFactLabel || "معلومة ممتعة:"}
                            </span>
                            <p className="text-[var(--color-text)] font-semibold leading-relaxed text-start">{q.funFact}</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>

          {/* Navigation / Submit Controls */}
          {!feedback && (
            <div className={`flex items-center gap-4 pt-2 justify-between ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                type="button"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="btn-secondary py-2.5 px-6 text-sm font-black flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{dir === 'rtl' ? "السابق" : "Previous"}</span>
              </button>

              {currentQuestionIdx < totalQuestions - 1 ? (
                <button
                  type="button"
                  disabled={selectedAnswers[currentQuestionIdx] === undefined}
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="btn-primary py-2.5 px-6 text-sm font-black flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{dir === 'rtl' ? "التالي" : "Next"}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="btn-primary py-2.5 px-6 text-sm font-black flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md animate-pulse-warm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t.exercises.submitBtn}</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          {/* AI Feedback Board */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8 border-2 border-[rgba(124,58,237,0.15)] shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Level adjustment notice */}
              {feedback.levelMessage && (
                <div className="mb-4 p-4 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] text-[var(--color-warning)] text-sm font-extrabold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{feedback.levelMessage}</span>
                </div>
              )}

              {/* Title & Score */}
              <div className={`flex items-center justify-between border-b-2 border-[rgba(124,58,237,0.12)] pb-4 ${
                dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
              }`}>
                <h2 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-primary)] animate-pulse" />
                  <span>{t.exercises.feedbackTitle}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-muted)] text-sm font-bold">{t.exercises.score}</span>
                  <span className={`text-2xl font-black ${feedback.score === 100 ? 'text-[var(--color-green)]' : 'text-[var(--color-primary)]'}`}>
                    {feedback.score}%
                  </span>
                </div>
              </div>

              {/* Score Rewards */}
              <div className={`flex items-center gap-4 py-2 justify-center`}>
                <div className="rounded-2xl px-4 py-2 flex items-center gap-1.5 text-sm bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.25)] shadow-sm">
                  <Award className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-[var(--color-accent)] font-black">+{feedback.pointsAwarded} XP</span>
                </div>
                <div className="rounded-2xl px-4 py-2 flex items-center gap-1.5 text-sm bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.25)] shadow-sm">
                  <Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                  <span className="text-[var(--color-warning)] font-black">+{feedback.starsAwarded} {t.dashboard.stars || "نجوم"}</span>
                </div>
              </div>

              {/* Correction details */}
              <div className="space-y-4 text-right" style={{ direction: dir }}>
                {/* Encouragement */}
                {feedback.aiFeedback?.encouragement && (
                  <div className={`bg-[rgba(59,130,246,0.04)] border-[rgba(59,130,246,0.15)] border p-4 rounded-2xl space-y-1.5 shadow-sm ${borderSideClass} border-[var(--color-accent)]`}>
                    <h4 className="text-xs font-black text-[var(--color-accent)] flex items-center gap-1.5 justify-start">
                      <ThumbsUp className="w-4.5 h-4.5" />
                      <span>{t.exercises.encouragement}</span>
                    </h4>
                    <p className="text-sm text-[var(--color-text)] font-semibold leading-relaxed text-start">{feedback.aiFeedback.encouragement}</p>
                  </div>
                )}

                {/* Explanation */}
                {feedback.aiFeedback?.explanation && (
                  <div className={`bg-[rgba(124,58,237,0.03)] border-[rgba(124,58,237,0.12)] border p-4 rounded-2xl space-y-1.5 shadow-sm ${borderSideClass} border-[var(--color-primary)]`}>
                    <h4 className="text-xs font-black text-[var(--color-primary)] flex items-center gap-1.5 justify-start">
                      <HelpCircle className="w-4.5 h-4.5" />
                      <span>{t.exercises.explanation}</span>
                    </h4>
                    <p className="text-sm text-[var(--color-text)] font-semibold leading-relaxed text-start">{feedback.aiFeedback.explanation}</p>
                  </div>
                )}

                {/* Tip */}
                {feedback.aiFeedback?.tip && (
                  <div className={`bg-[rgba(245,158,11,0.04)] border-[rgba(245,158,11,0.15)] border p-4 rounded-2xl space-y-1.5 shadow-sm ${borderSideClass} border-[var(--color-warning)]`}>
                    <h4 className="text-xs font-black text-[var(--color-warning)] flex items-center gap-1.5 justify-start">
                      <Lightbulb className="w-4.5 h-4.5" />
                      <span>{t.exercises.tip}</span>
                    </h4>
                    <p className="text-sm text-[var(--color-text)] font-semibold leading-relaxed text-start">{feedback.aiFeedback.tip}</p>
                  </div>
                )}
              </div>

              <Link href={fromLesson ? `/lessons/${fromLesson}?childId=${childId}` : `/lessons?childId=${childId}`}>
                <button className="btn-primary w-full py-4 font-black cursor-pointer mt-4 shadow-md hover:shadow-lg transition-all">
                  <span>{fromLesson ? "العودة إلى الدرس / Back to Lesson" : "العودة إلى الدروس / Back to Lessons"}</span>
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
        )}
    </div>
  );
}

export default function ExerciseDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center stars-bg">
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    }>
      <ExerciseDetailContent />
    </Suspense>
  );
}
