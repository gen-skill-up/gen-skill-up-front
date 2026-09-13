'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { childrenApi, virtualClassApi, chatApi } from '@/lib/api';
import {
  Monitor,
  Send,
  Users,
  Star,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Loader2,
  UserPlus,
  RefreshCw
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  grade?: number;
  level?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  avatar?: string;
  time: string;
  isLoading?: boolean;
}

interface QuizData {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  difficulty?: string;
  subject?: string;
  lessonTitle?: string | null;
}

interface TipData {
  title: string;
  subject: string;
  content: string;
  example: string;
  lessonId?: string | null;
  axis?: string;
  date: string;
}

function VirtualClassContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real data states
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [tipData, setTipData] = useState<TipData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // Quiz State
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; rewardPoints: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);

    Promise.all([
      childrenApi.get(childId),
      childrenApi.getLeaderboard(childId)
    ])
      .then(([childRes, lbRes]) => {
        setChild(childRes.data);
        setLeaderboard(lbRes.data);
      })
      .catch((err) => {
        console.error('Error loading virtual class:', err);
      })
      .finally(() => setLoading(false));

    // Load quiz and tip data
    loadQuiz(childId);
    loadTip(childId);
  }, [childId]);

  const loadQuiz = async (cId: string) => {
    setQuizLoading(true);
    try {
      const res = await virtualClassApi.getQuiz(cId);
      setQuizData(res.data);
      // Reset quiz state for new question
      setQuizAnswered(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuizResult(null);
    } catch (err) {
      console.error('Error loading quiz:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const loadTip = async (cId: string) => {
    setTipLoading(true);
    try {
      const res = await virtualClassApi.getTip(cId);
      setTipData(res.data);
    } catch (err) {
      console.error('Error loading tip:', err);
    } finally {
      setTipLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !child || !childId) return;

    const userText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: child.name,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Add loading indicator
    const loadingMsgId = (Date.now() + 1).toString();
    setChatMessages((prev) => [
      ...prev,
      {
        id: loadingMsgId,
        sender: dir === 'rtl' ? 'المشرف البومة 🦉' : 'Chouette Prof 🦉',
        text: '...',
        time: '',
        isLoading: true,
      },
    ]);

    // Update chat history for context
    const updatedHistory = [
      ...chatHistory,
      { role: 'user' as const, content: userText },
    ];

    try {
      // Use the existing AI Chat API for smart responses
      const res = await chatApi.sendMessage(
        childId,
        userText,
        updatedHistory,
        {
          page: 'virtual-class',
          language: dir === 'rtl' ? 'ar' : 'fr',
        },
      );

      const aiResponse =
        res.data?.response ||
        res.data?.reply ||
        res.data?.message ||
        (dir === 'rtl' ? 'أحسنت! استمر في التقدم.' : 'Excellent travail ! Continue comme ça.');

      setChatHistory([
        ...updatedHistory,
        { role: 'assistant' as const, content: aiResponse },
      ]);

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsgId
            ? {
                ...msg,
                text: aiResponse,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isLoading: false,
              }
            : msg,
        ),
      );
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback response on error
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsgId
            ? {
                ...msg,
                text: dir === 'rtl'
                  ? `أحسنت يا ${child.name}! استمر في التقدم والمشاركة.`
                  : `Excellent travail, ${child.name} ! Continue comme ça.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isLoading: false,
              }
            : msg,
        ),
      );
    }
  };

  const handleQuizSubmit = async (idx: number) => {
    if (quizAnswered || !quizData || !childId) return;
    setSelectedAnswer(idx);
    setQuizAnswered(true);
    setShowExplanation(true);

    try {
      const res = await virtualClassApi.submitQuiz(childId, quizData.id, idx);
      setQuizResult(res.data);

      // Update local child points if correct
      if (res.data.correct && child) {
        setChild((prev: any) =>
          prev ? { ...prev, points: res.data.totalPoints } : null,
        );
      }
    } catch (err) {
      console.error('Quiz submit error:', err);
      // Fallback: use local correctIdx
      const isCorrect = idx === quizData.correctIdx;
      setQuizResult({ correct: isCorrect, rewardPoints: isCorrect ? 15 : 0 });
      if (isCorrect && child) {
        setChild((prev: any) =>
          prev ? { ...prev, points: prev.points + 15 } : null,
        );
      }
    }
  };

  const handleNextQuiz = () => {
    if (childId) {
      loadQuiz(childId);
    }
  };

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#FFF9F0]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-100 border border-red-200">
          <HelpCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black mb-2 text-slate-800">الرجاء اختيار طفل أولاً / Please Select a Child</h2>
        <Link href="/dashboard">
          <button className="btn-primary mt-4">لوحة التحكم / Dashboard</button>
        </Link>
      </div>
    );
  }

  // Get real friends from leaderboard (exclude self)
  const classmates = leaderboard?.friendsLeaderboard?.filter((m: any) => !m.isSelf) || [];

  return (
    <div className="w-full px-6 lg:px-8 pt-8 pb-20 max-w-6xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: '#3B82F6' }} />
            <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {dir === 'rtl' ? 'القسم الافتراضي الذكي 🖥️' : 'Classe Virtuelle 🖥️'}
                </h1>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  {dir === 'rtl' ? 'ادرس مع أصدقائك، وحلوا التحديات المشتركة والمسابقات الحية!' : 'Étudie avec tes amis et relève les défis de la classe !'}
                </p>
              </div>
            </div>
            
            {child && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100/50 px-4 py-2.5 rounded-2xl shrink-0">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
                <span className="text-xs font-black text-blue-800">
                  {child.points} XP
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#3B82F6] mb-3" />
              <p className="text-slate-500 text-xs font-black animate-pulse">
                {dir === 'rtl' ? 'جاري الاتصال بالقسم الافتراضي...' : 'Connexion à la classe...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Virtual blackboard & Quick quiz */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Dynamic Classroom Blackboard */}
                <div className="bg-[#1E293B] rounded-3xl p-6 border-8 border-slate-700 shadow-2xl relative text-white space-y-4">
                  {/* Screws on corner */}
                  <div className="absolute top-2 left-2 w-3.5 h-3.5 bg-slate-500 rounded-full border border-slate-600" />
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-slate-500 rounded-full border border-slate-600" />
                  <div className="absolute bottom-2 left-2 w-3.5 h-3.5 bg-slate-500 rounded-full border border-slate-600" />
                  <div className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-slate-500 rounded-full border border-slate-600" />

                  <div className="border-b border-white/10 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-amber-400">
                      {tipData
                        ? `💡 ${tipData.title}`
                        : (dir === 'rtl' ? '💡 قاعدة اليوم' : '💡 Règle du Jour')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date().toLocaleDateString(dir === 'rtl' ? 'ar-TN' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>

                  {tipLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className={`space-y-3 font-mono leading-relaxed text-slate-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {tipData?.subject && (
                        <span className="inline-block text-[9px] font-black bg-white/10 text-cyan-400 px-2 py-0.5 rounded-full mb-1">
                          {tipData.subject}
                          {tipData.axis ? ` — ${tipData.axis}` : ''}
                        </span>
                      )}
                      <p className="text-xs leading-normal">
                        {tipData?.content || (dir === 'rtl' ? 'جاري تحميل نصيحة اليوم...' : 'Chargement du conseil...')}
                      </p>
                      {tipData?.example && (
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 font-mono text-[11px] text-emerald-400 space-y-1 whitespace-pre-line">
                          {tipData.example}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2 text-[10px] text-slate-400 font-semibold">
                    <span>{dir === 'rtl' ? 'المعلم البومة 🦉' : 'Chouette Prof 🦉'}</span>
                  </div>
                </div>

                {/* Quick Quiz Interactive Widget — Real Data */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
                      <h3 className="text-sm font-black text-slate-800">
                        {dir === 'rtl' ? 'سؤال سريع لاكتساب +15 نقطة ⚡' : 'Quiz rapide pour +15 XP ⚡'}
                      </h3>
                    </div>
                    {quizAnswered && (
                      <button
                        onClick={handleNextQuiz}
                        className="flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {dir === 'rtl' ? 'سؤال آخر' : 'Suivant'}
                      </button>
                    )}
                  </div>

                  {quizLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </div>
                  ) : quizData ? (
                    <>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700 leading-snug">
                        {quizData.question}
                        {quizData.lessonTitle && (
                          <span className="block mt-1.5 text-[9px] text-slate-400 font-semibold">
                            {dir === 'rtl' ? `📚 من درس: ${quizData.lessonTitle}` : `📚 Leçon: ${quizData.lessonTitle}`}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {quizData.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === quizData.correctIdx;
                          const isSelected = selectedAnswer === oIdx;

                          let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";
                          if (quizAnswered) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 shadow-lg";
                            } else if (isSelected) {
                              btnStyle = "bg-rose-500 border-rose-600 text-white shadow-rose-200 shadow-lg";
                            } else {
                              btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizSubmit(oIdx)}
                              disabled={quizAnswered}
                              className={`border-b-4 font-black py-3 rounded-2xl text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {showExplanation && quizResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl p-3.5 text-[10px] font-semibold border flex gap-2.5 items-start ${
                              quizResult.correct
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {quizResult.correct ? (
                              <CheckCircle className="w-5 h-5 shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 shrink-0" />
                            )}
                            <div>
                              <p className="font-bold">
                                {quizResult.correct
                                  ? (dir === 'rtl' ? `أحسنت! إجابة صحيحة +${quizResult.rewardPoints} XP 🎉` : `Félicitations ! +${quizResult.rewardPoints} XP 🎉`)
                                  : (dir === 'rtl' ? 'إجابة خاطئة! حاول مرة أخرى مع السؤال التالي 💪' : 'Mauvaise réponse ! Réessaie avec la prochaine question 💪')}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-bold">
                      {dir === 'rtl' ? 'لا توجد أسئلة متاحة حالياً' : 'Aucune question disponible'}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Online classmates & classroom chat */}
              <div className="space-y-6">
                
                {/* Online Students List — Real Friends */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-blue-500" />
                    <span>{dir === 'rtl' ? 'الأصدقاء في القسم' : 'Amis dans la classe'}</span>
                    {classmates.length > 0 && (
                      <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black">
                        {classmates.length}
                      </span>
                    )}
                  </h3>

                  {classmates.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {classmates.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] uppercase text-slate-600 relative">
                              {member.name.charAt(0)}
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-slate-800 block">{member.name}</span>
                              {member.level && (
                                <span className="text-[8px] font-bold text-slate-400">
                                  {member.level === 'DEBUTANT' ? '🌱' : member.level === 'INTERMEDIAIRE' ? '🚀' : '🏆'} 
                                  {member.level}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{member.points} XP</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                        <UserPlus className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500">
                          {dir === 'rtl' ? 'لم تضف أصدقاء بعد!' : 'Tu n\'as pas encore d\'amis !'}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {dir === 'rtl' 
                            ? 'شارك كود صداقتك مع زملائك للانضمام'
                            : 'Partage ton code ami avec tes camarades'}
                        </p>
                        {leaderboard?.child?.shareCode && (
                          <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                            <span className="text-[9px] text-indigo-400 font-semibold block">
                              {dir === 'rtl' ? 'كود الصداقة' : 'Code ami'}
                            </span>
                            <span className="text-sm font-black text-indigo-700 tracking-widest">
                              {leaderboard.child.shareCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Classroom Chat — AI-Powered */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col h-[320px] justify-between">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{dir === 'rtl' ? 'اسأل المعلم البومة 🦉' : 'Demande à Chouette Prof 🦉'}</span>
                  </h3>

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                        <Logo size={32} />
                        <p className="text-[10px] font-bold text-slate-400 mt-2">
                          {dir === 'rtl' 
                            ? 'اسأل المعلم البومة أي سؤال تعليمي! 💡'
                            : 'Pose une question à Chouette Prof ! 💡'}
                        </p>
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === child?.name ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] font-black text-slate-400 mb-0.5">{msg.sender}</span>
                        <div 
                          className={`rounded-2xl p-2.5 text-[10px] leading-relaxed max-w-[85%] font-medium ${
                            msg.sender === child?.name
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                          }`}
                        >
                          {msg.isLoading ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="animate-pulse">{dir === 'rtl' ? 'يفكر...' : 'Réflexion...'}</span>
                            </span>
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="flex gap-1.5 border-t border-slate-50 pt-3">
                    <input
                      type="text"
                      placeholder={dir === 'rtl' ? 'اسأل المعلم البومة...' : 'Pose ta question...'}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-[10px] font-bold p-2.5 rounded-xl outline-none focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl border-b-2 border-blue-900 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

    </div>
  );
}

export default function VirtualClassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
      </div>
    }>
      <VirtualClassContent />
    </Suspense>
  );
}
