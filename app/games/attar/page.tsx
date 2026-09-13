'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Coins, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Star, 
  BookOpen, 
  Trophy, 
  Receipt, 
  ArrowRight,
  TrendingUp,
  Bot,
  Wand2,
  Maximize2,
  Minimize2,
  Heart,
  Timer,
  Flame,
  Gamepad2,
  ArrowLeft
} from 'lucide-react';

import { 
  TUNISIAN_CURRENCIES, 
  CurrencyItem, 
  CurrencyItemCard, 
  formatTunisianMoney 
} from '../components/TunisianCurrency';
import { soundEngine } from '../components/SoundEngine';
import UncleSalahCharacter, { SalahMood } from '../components/UncleSalahCharacter';
import CashRegister from '../components/CashRegister';
import ShopShelf, { Product, STORE_PRODUCTS } from '../components/ShopShelf';
import ReceiptModal from '../components/ReceiptModal';

interface GradeConfig {
  id: number;
  title: string;
  subtitle: string;
  maxAmount: number;
  allowNotes: boolean;
}

const GRADE_LEVELS: GradeConfig[] = [
  { id: 1, title: 'السنة 1 و 2 ابتدائي', subtitle: 'المليمات حتى 1000 مليم', maxAmount: 1000, allowNotes: false },
  { id: 2, title: 'السنة 3 و 4 ابتدائي', subtitle: 'الدينار والمليم حتى 10 دنانير', maxAmount: 10000, allowNotes: true },
  { id: 3, title: 'السنة 5 و 6 ابتدائي', subtitle: 'الميزانيات والعمليات حتى 20 دينار', maxAmount: 20000, allowNotes: true },
];

export default function AttarGamePage() {
  // Game Configuration & Modes
  const [selectedGrade, setSelectedGrade] = useState<number>(2);
  const [gameMode, setGameMode] = useState<'buy' | 'change' | 'budget'>('buy');
  const [isSpeedRun, setIsSpeedRun] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Arcade Score, Combo & Lives
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [muted, setMuted] = useState<boolean>(false);

  // Challenge States
  const [currentOrder, setCurrentOrder] = useState<Product[]>([]);
  const [customerPaidAmount, setCustomerPaidAmount] = useState<number>(0);
  const [placedItems, setPlacedItems] = useState<CurrencyItem[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [feedback, setFeedback] = useState<{ message: string; type: 'neutral' | 'success' | 'error' }>({
    message: 'اختر النقود المناسبة وضعها على الكاسة لدفع المشتريات!',
    type: 'neutral'
  });

  // Uncle Salah AI States
  const [salahMood, setSalahMood] = useState<SalahMood>('idle');
  const [salahSpeech, setSalahSpeech] = useState<string>('مرحباً بك يا بطل في دكاني! اختر النقود المناسبة من محفظتك وضعها في الكاسة!');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Success Modal & Confetti
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load HighScore
  useEffect(() => {
    const saved = localStorage.getItem('attar-game-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Confetti Physics Trigger
  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      life: number;
    }> = [];

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 5,
        life: 110
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22;
          p.life -= 1.5;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();
  }, []);

  // Generate New Transaction Challenge
  const generateNewChallenge = useCallback(() => {
    setPlacedItems([]);
    setSalahMood('idle');
    
    const currentGradeConfig = GRADE_LEVELS.find(g => g.id === selectedGrade) || GRADE_LEVELS[1];
    const availableProducts = STORE_PRODUCTS.filter(p => p.price <= currentGradeConfig.maxAmount);

    if (gameMode === 'buy') {
      const count = selectedGrade === 1 ? 1 : Math.min(Math.floor(Math.random() * 2) + 1, availableProducts.length);
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      setCurrentOrder(selected);
      const total = selected.reduce((sum, p) => sum + p.price, 0);

      setSalahSpeech(`الزبون يريد شراء ${selected.map(p => p.name).join(' و ')} بمجموع ${formatTunisianMoney(total)}. ضع النقود المضبوطة على الكاسة!`);
      setFeedback({
        message: 'اسحب العملات أو انقر عليها لوضع المبلغ المباشر للتاجر!',
        type: 'neutral'
      });
    } else if (gameMode === 'change') {
      const count = Math.min(Math.floor(Math.random() * 2) + 1, availableProducts.length);
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      const total = selected.reduce((sum, p) => sum + p.price, 0);

      let paid = 1000;
      if (total < 1000) paid = 1000;
      else if (total < 5000) paid = 5000;
      else if (total < 10000) paid = 10000;
      else paid = 20000;

      setCurrentOrder(selected);
      setCustomerPaidAmount(paid);
      const requiredChange = paid - total;

      setSalahSpeech(`المشتريات بـ ${formatTunisianMoney(total)} والحريف أعطاني ورقة ${formatTunisianMoney(paid)}. ساعدني في إرجاع الباقي وقدره ${formatTunisianMoney(requiredChange)}!`);
      setFeedback({
        message: `دفع الحريف ${formatTunisianMoney(paid)}. احسب وأرجع له الباقي بدقة!`,
        type: 'neutral'
      });
    } else if (gameMode === 'budget') {
      const budget = selectedGrade === 1 ? 1000 : selectedGrade === 2 ? 5000 : 10000;
      setBudgetLimit(budget);
      setCurrentOrder([]);
      setSalahSpeech(`أعطتك أمك ميزانية ${formatTunisianMoney(budget)}. املأ القفة بسلع متنوعة ومفيدة دون تجاوز هذا المبلغ!`);
      setFeedback({
        message: `لديك ميزانية ${formatTunisianMoney(budget)}. اختر منتجات لا تتجاوز هذا المبلغ!`,
        type: 'neutral'
      });
    }
  }, [gameMode, selectedGrade]);

  useEffect(() => {
    generateNewChallenge();
  }, [generateNewChallenge]);

  // Speed Run Timer
  useEffect(() => {
    if (!isSpeedRun || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          soundEngine.playWrong();
          setFeedback({ message: 'انتهى الوقت! أحسنت المحاولة في سباق السرعة!', type: 'error' });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSpeedRun, timeLeft]);

  // Handle Money Item Click
  const handleAddMoney = (item: CurrencyItem) => {
    if (item.type === 'coin') {
      soundEngine.playCoin();
    } else {
      soundEngine.playBanknote();
    }
    setPlacedItems(prev => [...prev, item]);
  };

  const handleRemoveMoney = (index: number) => {
    soundEngine.playClick();
    setPlacedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Ask Uncle Salah for a smart hint
  const handleAskSalahHint = async () => {
    setIsAiLoading(true);
    setSalahMood('thinking');
    soundEngine.playClick();

    const currentOrderTotal = currentOrder.reduce((sum, p) => sum + p.price, 0);

    setTimeout(() => {
      if (gameMode === 'buy') {
        const dinars = Math.floor(currentOrderTotal / 1000);
        const rem = currentOrderTotal % 1000;
        if (dinars > 0 && rem > 0) {
          setSalahSpeech(`فكرة ذكية من عم صلاح: ابدأ أولاً بوضع ${dinars} دينار، ثم اجمع الـ ${rem} مليم بالقطع النقدية المناسبة!`);
        } else if (dinars > 0) {
          setSalahSpeech(`تلميح: المبلغ هو ${dinars} دينار بالتمام والكمال. ابحث عن العملة المناسبة!`);
        } else {
          setSalahSpeech(`تلميح: المبلغ أقل من دينار (${rem} مليم). جرب استخدام قطع الـ 500 أو 200 أو 100 مليم!`);
        }
      } else if (gameMode === 'change') {
        const requiredChange = customerPaidAmount - currentOrderTotal;
        setSalahSpeech(`لحساب الباقي: اطرح ثمن السلع (${formatTunisianMoney(currentOrderTotal)}) من المبلغ المدفوع (${formatTunisianMoney(customerPaidAmount)}). الباقي هو ${formatTunisianMoney(requiredChange)}!`);
      } else {
        setSalahSpeech(`نصيحة الميزانية: اختر السلع ذات الأولوية أولاً (مثل الخبز أو الحليب) وراقب المجموع في الكاسة حتى لا يتجاوز ${formatTunisianMoney(budgetLimit)}.`);
      }
      setSalahMood('hint');
      setIsAiLoading(false);
    }, 400);
  };

  // Verification Logic
  const handleVerify = () => {
    const currentOrderTotal = currentOrder.reduce((sum, p) => sum + p.price, 0);
    const currentTableTotal = placedItems.reduce((sum, item) => sum + item.value, 0);

    if (gameMode === 'buy') {
      if (currentTableTotal === currentOrderTotal) {
        // Success
        soundEngine.playCashRegister();
        soundEngine.playCorrect();
        const baseXP = 20;
        const comboBonus = streak * 5;
        const totalGain = baseXP + comboBonus;

        setScore(s => {
          const next = s + totalGain;
          if (next > highScore) {
            setHighScore(next);
            localStorage.setItem('attar-game-highscore', next.toString());
          }
          return next;
        });

        setStreak(st => {
          const nextStreak = st + 1;
          if (nextStreak % 3 === 0) {
            soundEngine.playCombo();
            setLevel(lvl => lvl + 1);
          }
          return nextStreak;
        });

        setEarnedPoints(totalGain);
        setSalahMood('happy');
        setSalahSpeech('يا سلام عليك يا بطل! دفع دقيق وصحيح 100%، تفضل وصل الشراء!');
        triggerConfetti();
        setIsReceiptOpen(true);
        setFeedback({ message: 'ممتاز! دفع صحيح بالمبلغ المضبوط! 🏆', type: 'success' });
      } else {
        // Error
        soundEngine.playWrong();
        setStreak(0);
        setSalahMood('thinking');
        setLives(l => {
          const rem = Math.max(0, l - 1);
          if (rem === 0) {
            setSalahSpeech('انتهت المحاولات يا بطل! لا تقلق، لنبدأ جولة جديدة ونتعلم أكثر!');
          } else {
            setSalahSpeech(currentTableTotal < currentOrderTotal ? 'المبلغ ناقص يا بني، أضف بعض القطع!' : 'المبلغ زائد عن ثمن المشتريات، قلل من القطع.');
          }
          return rem;
        });

        setFeedback({
          message: currentTableTotal < currentOrderTotal
            ? `المبلغ ناقص! وضعت ${formatTunisianMoney(currentTableTotal)} والمطلوب ${formatTunisianMoney(currentOrderTotal)}`
            : `المبلغ زائد! وضعت ${formatTunisianMoney(currentTableTotal)} والمطلوب ${formatTunisianMoney(currentOrderTotal)}`,
          type: 'error'
        });
      }
    } else if (gameMode === 'change') {
      const requiredChange = customerPaidAmount - currentOrderTotal;
      if (currentTableTotal === requiredChange) {
        soundEngine.playCashRegister();
        soundEngine.playCorrect();
        const totalGain = 25 + streak * 5;
        setScore(s => s + totalGain);
        setStreak(st => st + 1);
        setEarnedPoints(totalGain);
        setSalahMood('happy');
        setSalahSpeech('أحسنت يا كاسيي المحترف! الباقي مضبوط والزبون سعيد جداً!');
        triggerConfetti();
        setIsReceiptOpen(true);
        setFeedback({ message: 'أحسنت يا بطل! أرجعت الباقي بدقة متناهية! ✨', type: 'success' });
      } else {
        soundEngine.playWrong();
        setStreak(0);
        setLives(l => Math.max(0, l - 1));
        setSalahMood('thinking');
        setSalahSpeech(`احسب الفرق بدقة: ${formatTunisianMoney(customerPaidAmount)} ناقص ${formatTunisianMoney(currentOrderTotal)}.`);
        setFeedback({
          message: `خطأ في إرجاع الباقي! الباقي الصحيح هو ${formatTunisianMoney(requiredChange)} بينما وضعت ${formatTunisianMoney(currentTableTotal)}`,
          type: 'error'
        });
      }
    } else if (gameMode === 'budget') {
      if (currentOrderTotal > 0 && currentOrderTotal <= budgetLimit) {
        soundEngine.playCashRegister();
        soundEngine.playCorrect();
        const totalGain = 30 + streak * 5;
        setScore(s => s + totalGain);
        setStreak(st => st + 1);
        setEarnedPoints(totalGain);
        setSalahMood('happy');
        setSalahSpeech(`تسوق ممتاز واقتصادي! مجموع مشترياتك ${formatTunisianMoney(currentOrderTotal)} وهو أقل من ميزانيتك.`);
        triggerConfetti();
        setIsReceiptOpen(true);
        setFeedback({ message: 'شراء ذكي وضمن الميزانية! ممتاز جداً 🌟', type: 'success' });
      } else if (currentOrderTotal === 0) {
        setFeedback({ message: 'الرجاء اختيار منتج واحد على الأقل من الرفوف!', type: 'error' });
      } else {
        soundEngine.playWrong();
        setStreak(0);
        setFeedback({ message: 'تجاوزت الميزانية المحددة! انقر على بعض السلع لإزالتها.', type: 'error' });
      }
    }
  };

  const handleToggleProductInBudget = (product: Product) => {
    if (currentOrder.some(p => p.id === product.id)) {
      setCurrentOrder(prev => prev.filter(p => p.id !== product.id));
    } else {
      setCurrentOrder(prev => [...prev, product]);
    }
  };

  const targetAmount = gameMode === 'buy'
    ? currentOrder.reduce((sum, p) => sum + p.price, 0)
    : gameMode === 'change'
    ? customerPaidAmount - currentOrder.reduce((sum, p) => sum + p.price, 0)
    : budgetLimit;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 font-sans ${isFullscreen ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-5'}`} dir="rtl">
      
      {/* Dynamic Confetti Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Arcade Top Navigation / HUD Bar */}
      <div className="max-w-7xl mx-auto mb-3 sm:mb-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Brand & Game Title */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/games"
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 text-xs font-bold shadow-sm"
              title="العودة لركن الألعاب"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">الألعاب</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>دكّان الحي وعمّ صلاح</span>
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.2 rounded-full font-bold">
                    المرحلة {level} ⚡
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  الحساب بالدينار والمليم التونسي
                </p>
              </div>
            </div>
          </div>

          {/* Arcade Stats HUD: Score, Streak, Lives, Timer */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Hearts / Lives */}
            <div className="flex items-center gap-0.5 bg-rose-50 dark:bg-slate-950 px-2 sm:px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-500/30 shadow-inner">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-all ${
                    heart <= lives ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Score & Combo */}
            <div className="bg-amber-50 dark:bg-slate-950 px-2.5 sm:px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 text-center">
              <span className="text-[9px] text-amber-800 dark:text-slate-400 block font-bold leading-none">النقاط</span>
              <span className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-400 font-mono">{score} XP</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 rounded-xl font-black text-[11px] shadow-sm animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>x{streak}</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                soundEngine.muted = nextMuted;
                soundEngine.playClick();
              }}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition"
              title={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition hidden md:flex"
              title="ملء الشاشة"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">

        {/* Left Column: Grade Selector, Game Modes & Uncle Salah Dialogue */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">

          {/* Uncle Salah Character Box */}
          <UncleSalahCharacter
            mood={salahMood}
            speechText={salahSpeech}
            onAskHint={handleAskSalahHint}
            isLoadingHint={isAiLoading}
          />

          {/* Game Modes Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
            <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Gamepad2 className="w-3.5 h-3.5 text-violet-600 dark:text-emerald-400" />
              <span>نمط التحدي:</span>
            </h3>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setGameMode('buy');
                }}
                className={`p-2 rounded-xl text-[11px] font-black transition-all text-center border flex flex-col items-center gap-1 ${
                  gameMode === 'buy'
                    ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🛍️</span>
                <span>المشتري</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setGameMode('change');
                }}
                className={`p-2 rounded-xl text-[11px] font-black transition-all text-center border flex flex-col items-center gap-1 ${
                  gameMode === 'change'
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🏧</span>
                <span>إرجاع الباقي</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setGameMode('budget');
                }}
                className={`p-2 rounded-xl text-[11px] font-black transition-all text-center border flex flex-col items-center gap-1 ${
                  gameMode === 'budget'
                    ? 'bg-gradient-to-b from-purple-600 to-pink-700 text-white border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🧺</span>
                <span>الميزانية</span>
              </button>
            </div>

            {/* School Grade Level Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">المستوى:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedGrade(grade.id);
                    }}
                    className={`p-2 rounded-xl text-right transition-all border text-[11px] font-bold flex items-center justify-between ${
                      selectedGrade === grade.id
                        ? 'bg-purple-50 dark:bg-amber-500/20 border-purple-300 dark:border-amber-500 text-purple-700 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-slate-800 dark:text-white font-bold">{grade.title}</div>
                      <div className="text-[9px] text-slate-400 font-normal">{grade.subtitle}</div>
                    </div>
                    {selectedGrade === grade.id && <span className="text-purple-600 dark:text-amber-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Wallet Drawer (Only in Buy or Change mode) */}
          {gameMode !== 'budget' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1 uppercase">
                  <Coins className="w-3.5 h-3.5" /> المحفظة النقدية
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                  اضغط للوضع
                </span>
              </div>

              {/* Coins & Notes Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-1.5">
                {TUNISIAN_CURRENCIES.filter(c => {
                  const levelConfig = GRADE_LEVELS.find(g => g.id === selectedGrade);
                  if (!levelConfig?.allowNotes && c.type === 'note') return false;
                  return c.value <= (levelConfig?.maxAmount || 20000);
                }).map((item) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-0.5 flex items-center justify-center hover:border-purple-300 dark:hover:border-amber-500/50 transition">
                    <CurrencyItemCard
                      item={item}
                      size="xs"
                      onClick={() => handleAddMoney(item)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Shop Shelf & Interactive Cash Register */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">

          {/* Feedback / Instructions Bar */}
          <div className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center gap-2.5 shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
          }`}>
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
            {feedback.type === 'error' && <XCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            {feedback.type === 'neutral' && <HelpCircle className="w-5 h-5 shrink-0 text-amber-600" />}
            <span className="text-xs sm:text-sm font-bold">{feedback.message}</span>
          </div>

          {/* Shop Shelf */}
          <ShopShelf
            mode={gameMode}
            selectedProducts={currentOrder}
            onToggleProduct={handleToggleProductInBudget}
            budgetLimit={budgetLimit}
          />

          {/* Cash Register Desk (For Buy & Change Mode) */}
          {gameMode !== 'budget' ? (
            <CashRegister
              mode={gameMode}
              targetAmount={targetAmount}
              customerPaidAmount={customerPaidAmount}
              placedItems={placedItems}
              onRemoveItem={handleRemoveMoney}
              onClear={() => setPlacedItems([])}
              onVerify={handleVerify}
            />
          ) : (
            /* Budget Mode Confirmation Desk */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-purple-500/40 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold">مجموع ما اخترته:</span>
                <span className="text-lg sm:text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
                  {formatTunisianMoney(currentOrder.reduce((sum, p) => sum + p.price, 0))}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  الميزانية: {formatTunisianMoney(budgetLimit)}
                </span>
              </div>

              <button
                onClick={handleVerify}
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3 px-6 rounded-xl shadow-md shadow-purple-600/20 transition-all transform active:scale-95 text-sm flex items-center gap-2"
              >
                <span>تأكيد المشتريات 🧺</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Success Receipt & Stars Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onNextChallenge={() => {
          setIsReceiptOpen(false);
          if (lives === 0) setLives(3);
          generateNewChallenge();
        }}
        earnedScore={earnedPoints}
        streak={streak}
        gradeLevelName={GRADE_LEVELS.find(g => g.id === selectedGrade)?.title || ''}
        gameModeTitle={
          gameMode === 'buy'
            ? 'المشتري الشاطر (دفع مباشر)'
            : gameMode === 'change'
            ? 'إرجاع الباقي'
            : 'تحدي الميزانية'
        }
        items={currentOrder}
        totalAmount={currentOrder.reduce((sum, p) => sum + p.price, 0)}
        customerPaid={gameMode === 'change' ? customerPaidAmount : undefined}
        changeAmount={gameMode === 'change' ? customerPaidAmount - currentOrder.reduce((sum, p) => sum + p.price, 0) : undefined}
      />

    </div>
  );
}
