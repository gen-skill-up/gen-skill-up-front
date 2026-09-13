'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Star, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Heart, 
  Flame, 
  ArrowRight,
  Zap,
  Play,
  Lightbulb,
  Compass,
  MapPin,
  Bot,
  Layers
} from 'lucide-react';
import { THIRTY_GAMES, GameDefinition } from '../../data/gamesList';
import { soundEngine } from '../../components/SoundEngine';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

// ─── 🍕 1. Interactive Pizza Fractions Game ───
function PizzaFractionsMiniGame({ onWin }: { onWin: (score: number) => void }) {
  const [selectedSlices, setSelectedSlices] = useState<number[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);

  const fractionLevels = [
    { num: 4, den: 8, text: 'أطعم الصديق نصف البيتزا (4 قطع من 8)' },
    { num: 2, den: 8, text: 'أطعم الصديق ربع البيتزا (قطعتان من 8)' },
    { num: 6, den: 8, text: 'أطعم الصديق ثلاثة أرباع البيتزا (6 قطع من 8)' },
    { num: 8, den: 8, text: 'البيتزا كاملة (8 قطع من 8)' },
  ];

  const toggleSlice = (index: number) => {
    soundEngine.playCoin();
    if (selectedSlices.includes(index)) {
      setSelectedSlices(prev => prev.filter(i => i !== index));
    } else {
      setSelectedSlices(prev => [...prev, index]);
    }
  };

  const handleVerify = () => {
    const cur = fractionLevels[levelIndex];
    if (selectedSlices.length === cur.num) {
      soundEngine.playCorrect();
      if (levelIndex + 1 >= fractionLevels.length) {
        soundEngine.playLevelUp();
        onWin(100);
      } else {
        setLevelIndex(prev => prev + 1);
        setSelectedSlices([]);
      }
    } else {
      soundEngine.playWrong();
    }
  };

  const cur = fractionLevels[levelIndex];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-5 text-center">
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 px-4 py-2 rounded-2xl shadow-sm">
        <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block mb-1">المهمة الحالية ({levelIndex + 1} من {fractionLevels.length}):</span>
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">{cur.text}</h3>
      </div>

      {/* Visual Interactive Pizza Slices SVG */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64">
        <svg viewBox="-110 -110 220 220" className="w-full h-full transform -rotate-90 filter drop-shadow-md">
          {/* Crust outer shadow */}
          <circle cx="0" cy="0" r="104" fill="#b45309" />
          <circle cx="0" cy="0" r="98" fill="#d97706" />

          {/* Pizza Slices */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (360 / 8);
            const startAngle = (i * angle * Math.PI) / 180;
            const endAngle = ((i + 1) * angle * Math.PI) / 180;
            const x1 = 92 * Math.cos(startAngle);
            const y1 = 92 * Math.sin(startAngle);
            const x2 = 92 * Math.cos(endAngle);
            const y2 = 92 * Math.sin(endAngle);

            const isSelected = selectedSlices.includes(i);

            return (
              <path
                key={i}
                d={`M 0 0 L ${x1} ${y1} A 92 92 0 0 1 ${x2} ${y2} Z`}
                fill={isSelected ? '#10b981' : '#f59e0b'}
                stroke="#78350f"
                strokeWidth="2"
                onClick={() => toggleSlice(i)}
                className="cursor-pointer hover:brightness-110 transition-all duration-150 transform hover:scale-105"
              />
            );
          })}
          {/* Pizza center badge */}
          <circle cx="0" cy="0" r="14" fill="#78350f" />
        </svg>
      </div>

      {/* Slices Counter Pill */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          القطع المختارة: <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{selectedSlices.length} / 8</span>
        </div>

        <button
          onClick={handleVerify}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2 rounded-xl shadow-md transition transform active:scale-95 text-xs sm:text-sm"
        >
          تأكيد التوزيع 🍕
        </button>
      </div>
    </div>
  );
}

// ─── ⚡ 2. Interactive Circuit Lab Mini-Game ───
function CircuitLabMiniGame({ onWin }: { onWin: (score: number) => void }) {
  const [switchClosed, setSwitchClosed] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<'copper' | 'plastic' | 'wood' | 'gold'>('copper');
  const [isSuccess, setIsSuccess] = useState(false);

  const materials = [
    { id: 'copper', name: 'سلك نحاسي', isConductor: true, icon: '🔌' },
    { id: 'plastic', name: 'مسطرة بلاستيكية', isConductor: false, icon: '📏' },
    { id: 'wood', name: 'قطعة خشب جافة', isConductor: false, icon: '🪵' },
    { id: 'gold', name: 'خاتم ذهبي', isConductor: true, icon: '💍' },
  ] as const;

  const currentMat = materials.find(m => m.id === selectedMaterial);
  const isLightOn = switchClosed && (currentMat?.isConductor ?? false);

  const handleToggleSwitch = () => {
    soundEngine.playClick();
    const next = !switchClosed;
    setSwitchClosed(next);
    if (next && currentMat?.isConductor) {
      soundEngine.playNitro();
      setIsSuccess(true);
      setTimeout(() => onWin(100), 1200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-5 text-center">
      <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 px-4 py-2 rounded-2xl shadow-sm">
        <span className="text-xs text-cyan-800 dark:text-cyan-300 font-bold block mb-0.5">تحدي المختبر:</span>
        <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">اختر مادة ناقلة واغلق القاطع لإضاءة المصباح 💡</h3>
      </div>

      {/* Circuit Workbench Visual */}
      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 relative flex flex-col items-center justify-center min-h-[200px] shadow-inner">
        {/* Bulb visual */}
        <div className="relative mb-5">
          {isLightOn && (
            <div className="absolute -inset-6 bg-yellow-400/40 rounded-full blur-2xl animate-pulse pointer-events-none" />
          )}
          <div className={`w-18 h-18 rounded-full border-3 flex items-center justify-center text-3xl shadow-lg transition-all duration-300 ${
            isLightOn
              ? 'bg-yellow-300 border-yellow-400 text-yellow-950 shadow-yellow-500/50 scale-110'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
          }`}>
            💡
          </div>
        </div>

        {/* Battery, Material and Switch */}
        <div className="flex items-center justify-between w-full px-2 gap-2">
          {/* Battery */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex flex-col items-center shadow-sm">
            <span className="text-xl">🔋</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-0.5">بطارية</span>
          </div>

          {/* Connected Material */}
          <div className="bg-white dark:bg-slate-900 border-2 border-cyan-400 p-2.5 rounded-xl flex flex-col items-center shadow-sm">
            <span className="text-xl">{currentMat?.icon}</span>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold mt-0.5">{currentMat?.name}</span>
          </div>

          {/* Switch */}
          <button
            onClick={handleToggleSwitch}
            className={`p-2.5 rounded-xl border-2 font-black text-xs transition flex flex-col items-center gap-1 shadow-sm ${
              switchClosed
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-400 text-rose-700 dark:text-rose-300'
            }`}
          >
            <span className="text-lg">{switchClosed ? '🔘' : '⭕'}</span>
            <span className="text-[10px]">{switchClosed ? 'مغلق' : 'مفتوح'}</span>
          </button>
        </div>
      </div>

      {/* Materials selector */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">اختر مادة للتوصيل:</span>
        <div className="flex flex-wrap gap-2 justify-center">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedMaterial(m.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 shadow-sm ${
                selectedMaterial === m.id
                  ? 'bg-cyan-600 text-white border-cyan-600 font-black shadow-md shadow-cyan-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 🗺️ 3. Interactive Tunisia Map Explorer ───
function TunisiaMapMiniGame({ onWin }: { onWin: (score: number) => void }) {
  const regions = [
    { id: 'tunis', name: 'تونس العاصمة', monument: 'جامع الزيتونة', landmark: '🕌', hint: 'شمال شرق تونس والمركز الاقتصادي والسياسي' },
    { id: 'carthage', name: 'قرطاج', monument: 'آثار قرطاج وعليسة', landmark: '🏛️', hint: 'حضارة بحرية عريقة في خليج تونس' },
    { id: 'kairouan', name: 'القيروان', monument: 'جامع عقبة بن نافع', landmark: '🕌', hint: 'عاصمة الأغالبة ورابعة المدن الإسلامية' },
    { id: 'el_djem', name: 'الجم (المهدية)', monument: 'المدرج الروماني الأثري', landmark: '🏟️', hint: 'قصر الجم الشامخ وسط تونس' },
    { id: 'tozeur', name: 'توزر', monument: 'واحات النخيل والشطوط', landmark: '🌴', hint: 'لؤلؤة الجريد في الجنوب الغربي' },
    { id: 'djerba', name: 'جربة', monument: 'جزيرة الأحلام ومتحف قلالة', landmark: '🏝️', hint: 'جزيرة ساحرة في خليج قابس' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const target = regions[currentIndex];

  const handleSelectCity = (chosenId: string) => {
    if (chosenId === target.id) {
      soundEngine.playCorrect();
      setFeedback('إجابة صحيحة وموقع مضبوط تماماً! 🌟');
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 >= regions.length) {
          soundEngine.playLevelUp();
          onWin(100);
        } else {
          setCurrentIndex(i => i + 1);
        }
      }, 1000);
    } else {
      soundEngine.playWrong();
      setFeedback('موقع غير صحيح، تذكر موقع المعلم جيداً!');
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center">
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-sm">
        <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block mb-0.5">المعلم المطلوب تحديده ({currentIndex + 1} من {regions.length}):</span>
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <span>{target.landmark}</span>
          <span>أين يقع: {target.monument}؟</span>
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تلميح: {target.hint}</p>
      </div>

      {feedback && (
        <div className="bg-purple-50 dark:bg-slate-900 border border-purple-300 dark:border-amber-400 px-4 py-1.5 rounded-xl text-xs font-bold text-purple-800 dark:text-amber-300 animate-fadeIn shadow-sm">
          {feedback}
        </div>
      )}

      {/* Tunisia Grid Map Locations */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-lg">
        {regions.map((reg) => (
          <button
            key={reg.id}
            onClick={() => handleSelectCity(reg.id)}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-slate-800 border-2 border-slate-200/80 dark:border-slate-800 hover:border-purple-400 rounded-2xl transition transform active:scale-95 flex flex-col items-center gap-1 shadow-sm group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{reg.landmark}</span>
            <span className="text-xs font-black text-slate-800 dark:text-white">{reg.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 🃏 4. Interactive Memory Match Mini-Game ───
function MemoryMatchMiniGame({ onWin }: { onWin: (score: number) => void }) {
  const cardsData = [
    { id: 1, pairId: 'carthage', label: 'قرطاج', icon: '🏛️' },
    { id: 2, pairId: 'carthage', label: 'قرطاج', icon: '🏛️' },
    { id: 3, pairId: 'dinar', label: 'دينار', icon: '🪙' },
    { id: 4, pairId: 'dinar', label: 'دينار', icon: '🪙' },
    { id: 5, pairId: 'olive', label: 'زيتون', icon: '🫒' },
    { id: 6, pairId: 'olive', label: 'زيتون', icon: '🫒' },
    { id: 7, pairId: 'science', label: 'مجهر', icon: '🔬' },
    { id: 8, pairId: 'science', label: 'مجهر', icon: '🔬' },
  ];

  const [shuffledCards, setShuffledCards] = useState(() => [...cardsData].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(shuffledCards[index].pairId)) return;
    soundEngine.playCoin();

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const card1 = shuffledCards[nextFlipped[0]];
      const card2 = shuffledCards[nextFlipped[1]];

      if (card1.pairId === card2.pairId) {
        soundEngine.playCorrect();
        setMatched(prev => {
          const nextMatched = [...prev, card1.pairId];
          if (nextMatched.length === cardsData.length / 2) {
            soundEngine.playLevelUp();
            setTimeout(() => onWin(100), 800);
          }
          return nextMatched;
        });
        setFlipped([]);
      } else {
        soundEngine.playWrong();
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center">
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 px-4 py-2 rounded-2xl shadow-sm">
        <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">طابق البطاقات المتشابهة لتنشيط الذاكرة 🃏</h3>
        <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">المطابقات: {matched.length} من {cardsData.length / 2}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs sm:max-w-sm">
        {shuffledCards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(card.pairId);

          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              className={`w-15 h-18 sm:w-18 sm:h-22 rounded-2xl border-2 font-black transition-all duration-300 flex flex-col items-center justify-center shadow-sm transform active:scale-95 ${
                isFlipped
                  ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-purple-400'
              }`}
            >
              {isFlipped ? (
                <>
                  <span className="text-2xl sm:text-3xl mb-0.5">{card.icon}</span>
                  <span className="text-[9px] font-bold">{card.label}</span>
                </>
              ) : (
                <span className="text-xl opacity-40">❓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 🤖 5. Interactive Maze & Coding Mini-Game ───
function MazeLogicMiniGame({ onWin }: { onWin: (score: number) => void }) {
  const [robotPos, setRobotPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const goalPos = { x: 2, y: 2 };
  const obstacles = [{ x: 1, y: 0 }, { x: 1, y: 1 }];

  const move = (dx: number, dy: number) => {
    const nextX = Math.max(0, Math.min(2, robotPos.x + dx));
    const nextY = Math.max(0, Math.min(2, robotPos.y + dy));

    if (obstacles.some(ob => ob.x === nextX && ob.y === nextY)) {
      soundEngine.playWrong();
      return;
    }

    soundEngine.playClick();
    setRobotPos({ x: nextX, y: nextY });

    if (nextX === goalPos.x && nextY === goalPos.y) {
      soundEngine.playLevelUp();
      setTimeout(() => onWin(100), 700);
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    setRobotPos({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 text-center">
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 px-4 py-2 rounded-2xl shadow-sm">
        <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">وجّه الروبوت الصغير نحو كنز المعرفة 🤖🏆</h3>
        <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">استعمل أسهم التوجيه وتفادى العوائق</span>
      </div>

      {/* 3x3 Grid Maze */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
        {[0, 1, 2].map((y) =>
          [0, 1, 2].map((x) => {
            const isRobot = robotPos.x === x && robotPos.y === y;
            const isGoal = goalPos.x === x && goalPos.y === y;
            const isObstacle = obstacles.some(ob => ob.x === x && ob.y === y);

            return (
              <div
                key={`${x}-${y}`}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all shadow-sm ${
                  isRobot
                    ? 'bg-violet-100 dark:bg-indigo-600/40 border-violet-500 animate-pulse'
                    : isGoal
                    ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400'
                    : isObstacle
                    ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 text-rose-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {isRobot ? '🤖' : isGoal ? '🏆' : isObstacle ? '🧱' : ''}
              </div>
            );
          })
        )}
      </div>

      {/* Direction Controls */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={() => move(0, -1)}
          className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm"
        >
          ⬆️ للأعلى
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => move(-1, 0)}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm"
          >
            ⬅️ لليسار
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500"
          >
            إعادة 🔄
          </button>
          <button
            onClick={() => move(1, 0)}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm"
          >
            ➡️ لليمين
          </button>
        </div>
        <button
          onClick={() => move(0, 1)}
          className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm"
        >
          ⬇️ للأسفل
        </button>
      </div>
    </div>
  );
}

// ─── 🌟 Main Dynamic Game Runner ───
export default function DynamicGamePlayPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const gameId = resolvedParams.gameId;

  const game = THIRTY_GAMES.find((g) => g.id === gameId);

  // If this game has a dedicated custom page (like attar, speed-math, scale, word-catcher), redirect seamlessly
  useEffect(() => {
    if (game && game.gameType === 'custom_page' && game.customUrl) {
      router.replace(game.customUrl);
    }
  }, [game, router]);

  // Game States
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [muted, setMuted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-black mb-2">اللعبة غير موجودة!</h2>
        <Link href="/games" className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl shadow-md">
          العودة لركن الألعاب
        </Link>
      </div>
    );
  }

  const questions = game.contentData.questions || [];
  const currentQ = questions[currentQIndex % (questions.length || 1)];

  const handleSelectOption = (option: string) => {
    if (!currentQ || selectedOption !== null) return;
    setSelectedOption(option);

    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      soundEngine.playCorrect();
      const gain = game.xpReward + streak * 5;
      setScore((s) => s + gain);
      setStreak((st) => st + 1);
      setFeedback({
        isCorrect: true,
        text: `إجابة صحيحة وممتازة! +${gain} XP 🌟`
      });

      setTimeout(() => {
        setSelectedOption(null);
        setFeedback(null);
        if (currentQIndex + 1 >= questions.length) {
          soundEngine.playLevelUp();
          setIsGameFinished(true);
        } else {
          setCurrentQIndex((i) => i + 1);
        }
      }, 1200);
    } else {
      soundEngine.playWrong();
      setStreak(0);
      setFeedback({
        isCorrect: false,
        text: `إجابة غير صحيحة! ${currentQ.explanation}`
      });

      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setTimeout(() => setIsGameOver(true), 1200);
        }
        return next;
      });

      setTimeout(() => {
        setSelectedOption(null);
        setFeedback(null);
      }, 1500);
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentQIndex(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setSelectedOption(null);
    setFeedback(null);
    setIsGameOver(false);
    setIsGameFinished(false);
  };

  const handleCustomMiniGameWin = (gain: number) => {
    setScore(s => s + gain);
    setIsGameFinished(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 p-3 sm:p-5 font-sans select-none" dir="rtl">
      
      {/* Top HUD Header */}
      <div className="max-w-3xl mx-auto mb-3 sm:mb-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3.5 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/games"
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>الألعاب</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-purple-50 dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-inner">
                {game.icon}
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{game.title}</h1>
                <span className="text-[10px] text-purple-700 dark:text-amber-300 font-bold">{game.subjectLabel} • {game.gradeLabel}</span>
              </div>
            </div>
          </div>

          {/* Stats, Lives, Score */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Lives */}
            <div className="flex items-center gap-0.5 bg-rose-50 dark:bg-slate-950 px-2 sm:px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-500/30">
              {[1, 2, 3].map((h) => (
                <Heart key={h} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${h <= lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300 dark:text-slate-800'}`} />
              ))}
            </div>

            {/* Score */}
            <div className="bg-amber-50 dark:bg-slate-950 px-2.5 py-0.5 sm:py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 text-center">
              <span className="text-[9px] text-amber-800 dark:text-slate-400 block font-bold leading-none">النقاط</span>
              <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 font-mono">{score} XP</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
                <Flame className="w-3 h-3 fill-white" />
                <span>x{streak}</span>
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !muted;
                setMuted(next);
                soundEngine.muted = next;
                soundEngine.playClick();
              }}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">

        {/* ─── DEDICATED MINI-GAMES / CHALLENGE ARENA ─── */}
        {!isGameOver && !isGameFinished && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            {game.id === 'pizza-fractions' ? (
              <PizzaFractionsMiniGame onWin={handleCustomMiniGameWin} />
            ) : game.id === 'circuit-lab' ? (
              <CircuitLabMiniGame onWin={handleCustomMiniGameWin} />
            ) : game.id === 'tunisia-map-explorer' ? (
              <TunisiaMapMiniGame onWin={handleCustomMiniGameWin} />
            ) : game.id === 'memory-match' ? (
              <MemoryMatchMiniGame onWin={handleCustomMiniGameWin} />
            ) : game.id === 'maze-logic' ? (
              <MazeLogicMiniGame onWin={handleCustomMiniGameWin} />
            ) : (
              /* Standard Quiz Runner */
              currentQ && (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  {questions.length > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
                      <span>السؤال {currentQIndex + 1} من {questions.length}</span>
                      <div className="flex-1 max-w-xs mx-3 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-violet-700 dark:text-violet-400">+{game.xpReward} XP</span>
                    </div>
                  )}

                  {/* Question Header & Prompt */}
                  <div className="text-center space-y-2 py-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 dark:bg-slate-950 rounded-2xl border border-purple-200 dark:border-slate-700 mx-auto flex items-center justify-center text-3xl shadow-inner">
                      {currentQ.icon || game.icon}
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-white leading-snug">
                      {currentQ.prompt}
                    </h2>
                  </div>

                  {/* Feedback Box */}
                  {feedback && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm ${
                      feedback.isCorrect
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                    }`}>
                      {feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                      <span>{feedback.text}</span>
                    </div>
                  )}

                  {/* Options Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === currentQ.correctAnswer;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(option)}
                          disabled={selectedOption !== null}
                          className={`p-3 sm:p-3.5 rounded-xl font-bold text-xs sm:text-sm text-right transition-all transform active:scale-98 border shadow-sm flex items-center justify-between gap-2 ${
                            selectedOption === null
                              ? 'bg-white dark:bg-slate-950 hover:bg-purple-50/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                              : isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/30'
                              : isSelected
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-50 dark:bg-slate-950/40 text-slate-400 border-slate-200 opacity-50'
                          }`}
                        >
                          <span>{option}</span>
                          <span className="text-[10px] opacity-60 font-mono">#{idx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* State: GAME OVER */}
        {isGameOver && (
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4 max-w-md mx-auto animate-scaleUp">
            <div className="w-18 h-18 bg-rose-50 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border-2 border-rose-300 dark:border-rose-400 shadow-md">
              <RotateCcw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">انتهت المحاولات!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">لا بأس يا بطل، يمكنك المحاولة مجدداً والتعلم من الأخطاء!</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-right space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">النقاط المكتسبة:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">{score} XP</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition shadow-md text-xs sm:text-sm"
              >
                إعادة المحاولة 🔄
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

        {/* State: GAME FINISHED (VICTORY) */}
        {isGameFinished && (
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4 max-w-md mx-auto animate-scaleUp">
            <div className="w-18 h-18 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-400 shadow-md">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">إنجاز رائع يا بطل! 🏆</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">أنهيت جميع مراحل لعبة {game.title} بنجاح!</p>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1">
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
              <Star className="w-8 h-8 fill-amber-400 text-amber-400 animate-bounce" />
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-right space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">مجموع النقاط:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-base font-mono">+{score} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المادة:</span>
                <span className="font-bold text-violet-600 dark:text-emerald-400">{game.subjectLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRestart}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition border border-slate-200 dark:border-slate-700 text-xs"
              >
                اللعب مرة أخرى 🔄
              </button>
              <Link
                href="/games"
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition shadow-md text-xs flex items-center justify-center gap-1"
              >
                <span>لعبة أخرى 🎮</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
