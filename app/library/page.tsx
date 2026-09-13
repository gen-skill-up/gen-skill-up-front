'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { childrenApi } from '@/lib/api';
import {
  Book,
  BookOpen,
  Star,
  CheckCircle,
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  points: number;
}

interface StoryBook {
  id: string;
  title: string;
  desc: string;
  subject: 'MATHS' | 'SCIENCE' | 'ARABIC' | 'ENGLISH';
  coverBg: string;
  emoji: string;
  pages: {
    title: string;
    text: string;
    illustration: string;
  }[];
  question: {
    text: string;
    options: string[];
    correctIdx: number;
  };
}

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  // Library State
  const [selectedSubject, setSelectedSubject] = useState<'ALL' | 'MATHS' | 'SCIENCE' | 'ARABIC'>('ALL');
  const [activeBook, setActiveBook] = useState<StoryBook | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [readBooks, setReadBooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);
      
      const savedRead = localStorage.getItem(`readBooks_${id}`);
      if (savedRead) {
        setReadBooks(new Set(JSON.parse(savedRead)));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    childrenApi.get(childId)
      .then((res) => {
        setChild(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [childId]);

  const booksList: StoryBook[] = [
    {
      id: 'book1',
      title: dir === 'rtl' ? 'قصّة الصفر العجيب 🧮' : 'L\'histoire magique du Zéro 🧮',
      desc: dir === 'rtl' ? 'تعلم كيف غير الصفر عالم الأرقام وأصبح بطلاً خارقاً في الرياضيات!' : 'Découvre comment le zéro a changé le monde des mathématiques !',
      subject: 'MATHS',
      coverBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      emoji: '💡',
      pages: [
        {
          title: dir === 'rtl' ? 'الصفر وحيداً' : 'Le zéro tout seul',
          text: dir === 'rtl' ? 'في قديم الزمان، كانت الأرقام من 1 إلى 9 تعيش معاً بسعادة. لكن لم يكن هناك شيء اسمه صفر. عندما كانوا يريدون قول "لا شيء"، لم يجدوا رمزاً لكتابته.' : 'Il y a très longtemps, les chiffres de 1 à 9 vivaient ensemble. Mais le zéro n\'existait pas encore. Pour dire "rien", ils n\'avaient aucun symbole.',
          illustration: '🥚'
        },
        {
          title: dir === 'rtl' ? 'اختراع البطل' : 'L\'invention du héros',
          text: dir === 'rtl' ? 'اخترع علماء الرياضيات العرب الصفر ليحجز الخانات الفارغة! أصبح الصفر يوضع بجانب الـ 1 ليعطينا 10، ويضاعف قوة كل رقم يرافقه عشرات المرات.' : 'Les mathématiciens ont inventé le zéro pour remplir les espaces vides ! Mis à droite du 1, il crée le 10 et décuple la valeur de chaque chiffre.',
          illustration: '🚀'
        },
        {
          title: dir === 'rtl' ? 'القوة الكبرى' : 'Le super-pouvoir',
          text: dir === 'rtl' ? 'الصفر لا يغير قيمة الجمع أو الطرح، لكنه في الضرب يدمر كل الأرقام ويحولها إلى صفر! 999 × 0 = صفر. إنه الرقم الأقوى في الضرب!' : 'Le zéro ne change rien à l\'addition, mais à la multiplication, il transforme tout en zéro ! 999 × 0 = 0. C\'est le plus fort !',
          illustration: '👑'
        }
      ],
      question: {
        text: dir === 'rtl' ? 'ما هو ناتج ضرب 25 × 0 ؟' : 'Calcule le résultat de 25 × 0 ?',
        options: ['25', '0', '1', '250'],
        correctIdx: 1
      }
    },
    {
      id: 'book2',
      title: dir === 'rtl' ? 'مغامرة في الفضاء 🚀' : 'Aventure dans l\'Espace 🚀',
      desc: dir === 'rtl' ? 'سافر مع رائد الفضاء الصغير واكتشف أسرار كواكب المجموعة الشمسية.' : 'Voyage avec le petit astronaute et découvre les planètes du système solaire.',
      subject: 'SCIENCE',
      coverBg: 'linear-gradient(135deg, #A855F7 0%, #6D28D9 100%)',
      emoji: '🪐',
      pages: [
        {
          title: dir === 'rtl' ? 'الانطلاق الكبير' : 'Le grand départ',
          text: dir === 'rtl' ? 'استعد رائد الفضاء الصغير وارتدى خوذته اللامعة. انطلق الصاروخ بسرعة هائلة متجاوزاً الجاذبية الأرضية نحو الفضاء الفسيح.' : 'Le petit astronaute enfile son casque brillant. La fusée décolle à toute vitesse vers l\'espace infini.',
          illustration: '👨‍🚀'
        },
        {
          title: dir === 'rtl' ? 'ملك الكواكب' : 'Le roi des planètes',
          text: dir === 'rtl' ? 'أول محطة كانت كوكب المشتري، وهو أكبر الكواكب في مجموعتنا الشمسية! يتكون معظمه من الغاز ولديه حلقات خفيفة جداً.' : 'Le premier arrêt est Jupiter, la plus grande planète ! Elle est géante et faite de gaz.',
          illustration: '🪐'
        }
      ],
      question: {
        text: dir === 'rtl' ? 'ما هو أكبر كواكب المجموعة الشمسية؟' : 'Quelle est la plus grande planète du système solaire ?',
        options: [
          dir === 'rtl' ? 'الأرض' : 'La Terre',
          dir === 'rtl' ? 'المريخ' : 'Mars',
          dir === 'rtl' ? 'المشتري' : 'Jupiter',
          dir === 'rtl' ? 'زحل' : 'Saturne'
        ],
        correctIdx: 2
      }
    }
  ];

  const handleOpenBook = (book: StoryBook) => {
    setActiveBook(book);
    setActivePage(0);
    setShowQuiz(false);
    setQuizAnswered(false);
    setSelectedOption(null);
  };

  const handleNextPage = () => {
    if (!activeBook) return;
    if (activePage < activeBook.pages.length - 1) {
      setActivePage(activePage + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevPage = () => {
    if (activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  const handleQuizSubmit = (idx: number) => {
    if (!activeBook) return;
    setSelectedOption(idx);
    setQuizAnswered(true);

    if (idx === activeBook.question.correctIdx) {
      const updatedRead = new Set(readBooks);
      updatedRead.add(activeBook.id);
      setReadBooks(updatedRead);
      localStorage.setItem(`readBooks_${childId}`, JSON.stringify(Array.from(updatedRead)));

      // Award XP
      if (child) {
        setChild((prev: any) => prev ? { ...prev, points: prev.points + 20 } : null);
      }
    }
  };

  const filteredBooks = selectedSubject === 'ALL'
    ? booksList
    : booksList.filter((b) => b.subject === selectedSubject);

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

  return (
    <div className="w-full px-6 lg:px-8 pt-8 pb-20 max-w-5xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: '#10B981' }} />
            <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <Book className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {dir === 'rtl' ? 'مكتبة الأبطال 📖' : 'Bibliothèque des Héros 📖'}
                </h1>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  {dir === 'rtl' ? 'اقرأ قصصاً قصيرة ممتعة، واجب عن الأسئلة لتكسب مكافآت حقيقية!' : 'Lis de courtes histoires et gagne des récompenses en répondant aux quiz !'}
                </p>
              </div>
            </div>
            
            {child && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 px-4 py-2.5 rounded-2xl shrink-0">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span className="text-xs font-black text-emerald-800">
                  {child.points} XP
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#10B981] mb-3" />
              <p className="text-slate-500 text-xs font-black animate-pulse">جاري تحميل كتب المكتبة... / Chargement...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Category tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                {['ALL', 'MATHS', 'SCIENCE'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub as any)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-[#10B981] text-white shadow'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub === 'ALL' ? (dir === 'rtl' ? 'الكل' : 'Tous') : sub === 'MATHS' ? (dir === 'rtl' ? 'الرياضيات' : 'Maths') : (dir === 'rtl' ? 'العلوم' : 'Sciences')}
                  </button>
                ))}
              </div>

              {/* Book Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredBooks.map((book) => {
                  const isRead = readBooks.has(book.id);
                  return (
                    <div
                      key={book.id}
                      onClick={() => handleOpenBook(book)}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer h-72 group"
                    >
                      {/* Cover Design */}
                      <div 
                        className="h-36 flex items-center justify-center relative transition-all group-hover:scale-[1.02]"
                        style={{ background: book.coverBg }}
                      >
                        <span className="text-5xl drop-shadow-md select-none">{book.emoji}</span>
                        {isRead && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black border border-emerald-100 flex items-center gap-0.5">
                            ✓ {dir === 'rtl' ? 'قرأتُه' : 'Lu'}
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                            {book.subject === 'MATHS' ? (dir === 'rtl' ? 'رياضيات' : 'Maths') : (dir === 'rtl' ? 'علوم' : 'Sciences')}
                          </span>
                          <h4 className="font-black text-slate-800 text-sm mt-1">{book.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-0.5 leading-snug">
                            {book.desc}
                          </p>
                        </div>

                        <button className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-slate-600 hover:text-indigo-700 font-black text-[10px] py-2 rounded-xl mt-3 transition-colors cursor-pointer block text-center">
                          {dir === 'rtl' ? 'افتح الكتاب 📖' : 'Ouvrir 📖'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Reader Modal Overlay */}
          <AnimatePresence>
            {activeBook && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full flex flex-col justify-between min-h-[400px] border border-slate-100"
                >
                  {/* Top Bar inside reader */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-[#10B981] flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{activeBook.title}</span>
                    </span>
                    <button
                      onClick={() => setActiveBook(null)}
                      className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comic/Book Content slides */}
                  <div className="flex-1 py-6 flex flex-col justify-center items-center text-center space-y-4">
                    {!showQuiz ? (
                      <>
                        <div className="text-6xl animate-float">{activeBook.pages[activePage].illustration}</div>
                        <h4 className="text-base font-black text-slate-800">{activeBook.pages[activePage].title}</h4>
                        <p className="text-xs text-slate-500 font-bold max-w-sm leading-relaxed">
                          {activeBook.pages[activePage].text}
                        </p>
                        
                        {/* Page dots indicator */}
                        <div className="flex gap-1.5 pt-2">
                          {activeBook.pages.map((_, pIdx) => (
                            <div
                              key={pIdx}
                              className={`h-2 rounded-full transition-all ${
                                activePage === pIdx ? 'w-5 bg-[#10B981]' : 'w-2 bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4 w-full">
                        <div className="text-5xl">📝</div>
                        <h4 className="text-sm font-black text-slate-800">
                          {dir === 'rtl' ? 'اختبر فهمك للقصّة!' : 'Teste ta compréhension !'}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                          {activeBook.question.text}
                        </p>

                        <div className="space-y-2 max-w-xs mx-auto">
                          {activeBook.question.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === activeBook.question.correctIdx;
                            const isSelected = selectedOption === oIdx;

                            let optStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";
                            if (quizAnswered) {
                              if (isCorrect) {
                                optStyle = "bg-emerald-500 border-emerald-600 text-white shadow-emerald-100 shadow-md";
                              } else if (isSelected) {
                                optStyle = "bg-rose-500 border-rose-600 text-white shadow-rose-100 shadow-md";
                              } else {
                                optStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleQuizSubmit(oIdx)}
                                disabled={quizAnswered}
                                className={`w-full border-b-4 font-black py-2.5 rounded-2xl text-[10px] transition-all cursor-pointer ${optStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation controls in reader */}
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    {!showQuiz ? (
                      <>
                        <button
                          onClick={handlePrevPage}
                          disabled={activePage === 0}
                          className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-600 text-xs font-black rounded-2xl disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>{dir === 'rtl' ? 'السابق' : 'Précédent'}</span>
                        </button>

                        <button
                          onClick={handleNextPage}
                          className="flex items-center gap-1 bg-[#10B981] hover:bg-[#0E9F6E] text-white px-4 py-2 rounded-2xl text-xs font-black cursor-pointer border-b-2 border-emerald-800"
                        >
                          <span>{activePage === activeBook.pages.length - 1 ? (dir === 'rtl' ? 'الكويز ⚡' : 'Quiz ⚡') : (dir === 'rtl' ? 'التالي' : 'Suivant')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center">
                        {quizAnswered && (
                          <button
                            onClick={() => setActiveBook(null)}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black px-6 py-2.5 rounded-2xl cursor-pointer shadow"
                          >
                            {selectedOption === activeBook.question.correctIdx 
                              ? (dir === 'rtl' ? 'أنهيت القراءة! 📖' : 'Lecture terminée ! 📖') 
                              : (dir === 'rtl' ? 'أغلق الكتاب ❌' : 'Fermer ❌')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}
