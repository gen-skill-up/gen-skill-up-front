'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { chatApi } from '@/lib/api';
import OwlLogo from './Logo';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  spoken?: boolean;
}

export default function AiAssistant() {
  const { t, dir, lang } = useLanguage();
  const tc = t.chatAssistant as any;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null); // tracks msg id currently speaking
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Fetch active child on mount & check localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedChildId = localStorage.getItem('activeChildId');
      setActiveChildId(storedChildId);

      // Listen to storage changes
      const handleStorageChange = () => {
        setActiveChildId(localStorage.getItem('activeChildId'));
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Set up welcome message once activeChildId or lang changes
  useEffect(() => {
    if (!activeChildId) return;

    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'assistant',
      content: tc.welcomeMessage || 'مرحباً! أنا أنيس 🦉 رفيقك الذكي.',
      suggestions: [
        tc.suggestMath || 'ساعدني في الرياضيات 📐',
        tc.suggestScience || 'معلومة علمية مفيدة 💡',
        tc.suggestRiddle || 'قل لي حزورة ذكية 🧩',
      ],
    };

    setMessages([welcomeMsg]);
  }, [activeChildId, lang, tc]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSpeak = (msgId: string, text: string) => {
    if (!synthRef.current) return;

    // If already speaking this message, stop it
    if (isSpeaking === msgId) {
      synthRef.current.cancel();
      setIsSpeaking(null);
      return;
    }

    // Stop anything currently speaking
    synthRef.current.cancel();

    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, ""); // strip emojis for cleaner pronunciation
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Map language
    if (lang === 'ar') {
      utterance.lang = 'ar-XA'; // Arabic
    } else if (lang === 'fr') {
      utterance.lang = 'fr-FR'; // French
    } else {
      utterance.lang = 'en-US'; // English
    }

    utterance.onend = () => {
      setIsSpeaking(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(msgId);
    synthRef.current.speak(utterance);
    utteranceRef.current = utterance;
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChildId || loading) return;

    // 1. Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    // 2. Format history for backend (limit to last 6 messages)
    const historyPayload = messages
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // 3. Extract page context
    let subject = 'General';
    let lessonTitle = 'General Learning';
    
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('lessons')) {
        subject = 'Lessons';
        const titleEl = document.querySelector('h1');
        if (titleEl) lessonTitle = titleEl.innerText;
      } else if (path.includes('exercises')) {
        subject = 'Exercises';
      } else if (path.includes('placement-test')) {
        subject = 'Placement Test';
      }
    }

    try {
      const res = await chatApi.sendMessage(activeChildId, text, historyPayload, {
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        lessonTitle,
        subject,
        language: lang,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response,
        suggestions: res.data.suggestions || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          lang === 'ar'
            ? 'عذراً يا بطل! واجهت مشكلة في الاتصال بالخادم. يرجى المحاولة مرة أخرى قريباً. 🦉'
            : lang === 'fr'
              ? "Désolé champion ! J'ai un problème de connexion. Réessaie bientôt. 🦉"
              : 'Sorry superstar! I had trouble connecting. Please try again soon. 🦉',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(null);
    
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'assistant',
      content: tc.welcomeMessage || 'مرحباً! أنا أنيس 🦉 رفيقك الذكي.',
      suggestions: [
        tc.suggestMath || 'ساعدني في الرياضيات 📐',
        tc.suggestScience || 'معلومة علمية مفيدة 💡',
        tc.suggestRiddle || 'قل لي حزورة ذكية 🧩',
      ],
    };
    setMessages([welcomeMsg]);
  };

  // If no child profile is logged in, don't show the assistant at all
  if (!activeChildId) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 z-40 w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-2xl border-b-4 border-indigo-800 cursor-pointer"
        style={{
          right: dir === 'rtl' ? 'auto' : '24px',
          left: dir === 'rtl' ? '24px' : 'auto',
        }}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <OwlLogo size={42} />
              <span className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Glassmorphic Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 z-40 w-[90vw] sm:w-[400px] h-[550px] rounded-[2rem] shadow-2xl flex flex-col border border-white/10 overflow-hidden"
            style={{
              right: dir === 'rtl' ? 'auto' : '24px',
              left: dir === 'rtl' ? '24px' : 'auto',
              background: 'linear-gradient(135deg, rgba(17, 15, 76, 0.95) 0%, rgba(26, 23, 102, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner relative">
                  <OwlLogo size={32} />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#110f4c]" />
                </div>
                <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>{tc.title || 'أنيس المساعد الذكي'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">
                    {tc.subtitle || 'اسألني أي شيء وسأساعدك!'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all"
                  title={tc.clearBtn || 'مسح'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.role === 'user'
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-500'
                        : 'bg-gradient-to-tr from-violet-600 to-indigo-600'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <SmileAvatar />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Bubble content */}
                  <div className="max-w-[75%] space-y-1.5">
                    <div
                      className={`p-3.5 rounded-[1.5rem] text-xs font-bold leading-relaxed shadow-md ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/5 text-slate-100 rounded-tl-none'
                      }`}
                      style={{
                        direction: lang === 'ar' ? 'rtl' : 'ltr',
                        textAlign: lang === 'ar' ? 'right' : 'left',
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Speaker Text-to-Speech button for assistant */}
                    {msg.role === 'assistant' && msg.id !== 'error' && (
                      <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black cursor-pointer transition-all ${
                            isSpeaking === msg.id
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                          }`}
                        >
                          {isSpeaking === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 animate-pulse" />
                              <span>{tc.muteBtn || 'كتم'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>{tc.speakBtn || 'استمع'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Suggestions list underneath assistant message */}
                    {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((sug, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleSend(sug)}
                            className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/25 rounded-full py-1.5 px-3 text-[10px] font-extrabold cursor-pointer transition-all"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {sug}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shrink-0 flex items-center justify-center text-white font-bold shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white/5 border border-white/5 text-slate-400 px-4 py-3 rounded-[1.5rem] rounded-tl-none flex items-center gap-1.5">
                    <span className="text-[10px] font-black">{tc.aiTyping || 'أنيس يفكر...'}</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-4 border-t border-white/5 bg-white/5 flex gap-2.5 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={tc.placeholder || 'اكتب رسالة...'}
                className="flex-1 bg-white/5 border border-white/5 text-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-violet-500 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg cursor-pointer transition-all"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Minimal user avatar inside chat
function SmileAvatar() {
  return (
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
