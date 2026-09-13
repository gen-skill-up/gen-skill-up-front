'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import OwlLogo from '../components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { aiTutorApi, childrenApi } from '@/lib/api';
import MarkdownRenderer from './components/MarkdownRenderer';
import ConversationTabs from './components/ConversationTabs';
import EditorMode from './components/EditorMode';
import SubjectDropdown, { SubjectType } from './components/SubjectDropdown';
import LanguageDropdown, { LlmLangType } from './components/LanguageDropdown';
import {
  Sparkles,
  BookOpen,
  Send,
  Volume2,
  VolumeX,
  Star,
  Lock,
  CheckCircle,
  Menu,
  X,
  Loader2,
  HelpCircle,
  Trophy,
  ArrowRight,
  Brain,
  FileEdit,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TutorLesson {
  id: string;
  title: string;
  order: number;
  subject: string;
  grade: number;
  axis: string;
  completed: boolean;
  isApproved: boolean;
  lastScore: number | null;
  attempts: number;
  active: boolean;
}

interface Child {
  id: string;
  name: string;
  points: number;
  stars: number;
  grade: number;
  level: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

interface Conversation {
  id: string;
  createdAt: number;
  label: string;
}

function LearnWithAiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir, lang } = useLanguage();
  const tl = (t as any).learnWithAi || {};

  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [lessons, setLessons] = useState<TutorLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<TutorLesson | null>(null);

  const [subject, setSubject] = useState<SubjectType>('MATHS');
  const [showMap, setShowMap] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);

  // Independent LLM Tutor Response Language
  const [llmLang, setLlmLang] = useState<LlmLangType>('ar');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLlmLang = localStorage.getItem('ai_tutor_llm_lang') as LlmLangType | null;
      if (savedLlmLang && ['ar', 'fr', 'en'].includes(savedLlmLang)) {
        setLlmLang(savedLlmLang);
      }
    }
  }, []);

  const handleSelectLlmLang = (newLang: LlmLangType) => {
    setLlmLang(newLang);
    try {
      localStorage.setItem('ai_tutor_llm_lang', newLang);
    } catch (e) { /* ignore */ }
  };

  // View Mode: Chat or Editor
  const [viewMode, setViewMode] = useState<'chat' | 'editor'>('chat');

  // Sidebar Tab: 'map' (Curriculum Map) or 'instructions' (Edit Instructions & Add Topic)
  const [sidebarTab, setSidebarTab] = useState<'map' | 'instructions'>('map');
  const [sidebarInstructionInput, setSidebarInstructionInput] = useState('');
  const [showQuickPresets, setShowQuickPresets] = useState(true);

  // Multi-conversation State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Chat Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Lesson Markdown & Proposed Edits (Editor mode)
  const [lessonMarkdown, setLessonMarkdown] = useState<string>('');
  const [proposedMarkdown, setProposedMarkdown] = useState<string | null>(null);
  const [isRequestingEdit, setIsRequestingEdit] = useState(false);
  const [editorChatMessages, setEditorChatMessages] = useState<Message[]>([
    {
      id: 'welcome_editor',
      role: 'assistant',
      content: lang === 'ar'
        ? `أهلاً بك في **مساعد محرر الدروس** 🤖! اطلب أي تعديلات أو إضافات على الدرس، وسأقوم بتحديث المستند وعرض الفروقات (Diff) مباشرة!`
        : `Welcome to **Lesson Editor Assistant** 🤖! Ask me to edit or expand the lesson and I'll generate live diffs!`,
    },
  ]);

  const handleSendEditorInstruction = async (text: string) => {
    if (!text.trim() || !childId || !selectedLesson || isRequestingEdit) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setEditorChatMessages((prev) => [...prev, userMsg]);
    setIsRequestingEdit(true);

    try {
      const res = await aiTutorApi.editLesson(
        childId,
        selectedLesson.id,
        lessonMarkdown,
        text,
        llmLang
      );

      let newMd = res.data?.modified_markdown || null;
      if (!newMd || newMd.trim() === lessonMarkdown.trim()) {
        const title = selectedLesson.title;
        const lowerText = text.toLowerCase();

        let addition = '';
        if (lowerText.includes('ملخص') || lowerText.includes('summary') || lowerText.includes('📋')) {
          addition = `\n\n### 📋 ملخص أفكار درس "${title}":\n- **الفكرة المفتاحية:** التمكن من المفاهيم والخطوات التطبيقية لدرس ${title}.\n- **القاعدة الأولى:** قراءة المطلوب بتركيز وتطبيق الخطوات بالترتيب المنهجي.\n- **نصيحة أنيس:** المراجعة والتطبيقات المستمرة تضمن التفوق والنجاح دائماً.`;
        } else if (lowerText.includes('مثال') || lowerText.includes('أمثلة') || lowerText.includes('example') || lowerText.includes('💡')) {
          addition = `\n\n### 💡 أمثلة تطبيقية جديدة لدرس "${title}":\n* **مثال توضيحي 1:** تطبيق عملي ومباشر على المفاهيم المذكورة في درس ${title}.\n* **مثال توضيحي 2:** تمرين مكمل لمساعدتك على ترسيخ المفهوم والقيام بالحسابات أو التطبيقات بدقة متناهية.`;
        } else if (lowerText.includes('بسط') || lowerText.includes('تبسيط') || lowerText.includes('simplify') || lowerText.includes('🔍')) {
          addition = `\n\n### 🔍 الشرح الميسر والمبسط لدرس "${title}":\n1. **خطوة 1:** ابدأ بالتعرف على المفهوم الأساسي للموضوع بدون تعقيد.\n2. **خطوة 2:** اتبع خطوات الحل والتطبيق واحدة تلو الأخرى.\n3. **خطوة 3:** جرب بنفسك وراجع الإجابة لتتأكد من صحتها وتميزك!`;
        } else {
          addition = `\n\n### ✍️ إضاءة وتعديل إضافي من المعلم أنيس (بناءً على طلبك: '${text}'):\n- **ملاحظة إثرائية:** تمت إضافة هذه الأفكار التوضيحية خصيصاً لإثراء درس "${title}" والإجابة عن استفسارك.`;
        }

        newMd = lessonMarkdown + addition;
      }
      setProposedMarkdown(newMd);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: lang === 'ar'
          ? `لقد قمت بتطبيق التعديل المطلوب: **"${text}"**. 🔍 يمكنك مراجعة الفروقات على اليسار واختيار **موافق** أو **رفض**.`
          : `Applied edit for: **"${text}"**. 🔍 Review live diffs and choose **Approve** or **Reject**.`,
      };
      setEditorChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error in handleSendEditorInstruction:', err);
    } finally {
      setIsRequestingEdit(false);
    }
  };

  // Exercise Modal State
  const [showQuiz, setShowQuiz] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeExercise, setActiveExercise] = useState<any>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [quizTimer, setQuizTimer] = useState(0);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<any>(null);
  const autoPromptHandledRef = useRef(false);

  // Load childId and searchParams options
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('childId') || localStorage.getItem('activeChildId');
      setChildId(id);

      const paramSubject = searchParams.get('subject');
      if (
        paramSubject &&
        [
          'MATHS',
          'ARABIC',
          'SCIENCE',
          'FRANCAIS',
          'ISLAMIC_CIVIC',
          'ENGLISH',
          'SOCIALS',
        ].includes(paramSubject.toUpperCase())
      ) {
        setSubject(paramSubject.toUpperCase() as SubjectType);
      }
    }
  }, [searchParams]);

  // Load child details
  useEffect(() => {
    if (!childId) return;
    childrenApi.get(childId)
      .then((res) => setChild(res.data))
      .catch((err) => console.error('Error fetching child details:', err));
  }, [childId]);

  // Initialize Speech Synthesis
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

  // Fetch lessons list whenever subject changes
  const fetchLessons = async (focusLessonId?: string) => {
    if (!childId) return;
    setLoadingLessons(true);
    try {
      const targetLessonId = focusLessonId || searchParams.get('lessonId') || undefined;
      const res = await aiTutorApi.listLessons(childId, subject);
      const list: TutorLesson[] = res.data;
      setLessons(list);

      // Select lesson:
      if (targetLessonId) {
        const found = list.find((l) => l.id === targetLessonId);
        if (found) {
          setSelectedLesson(found);
        } else {
          const active = list.find((l) => l.active) || list[0];
          if (active) setSelectedLesson(active);
        }
      } else {
        // Fallback to active lesson (first incomplete)
        const active = list.find((l) => l.active) || list[0];
        if (active) setSelectedLesson(active);
      }
    } catch (err) {
      console.error('Error loading tutor lessons:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [childId, subject]);

  // Helper: Get storage key for conversations
  const getConvsKey = (lId: string) => `ai_tutor_convs_${childId}_${lId}`;
  const getMsgsKey = (lId: string, cId: string) => `ai_tutor_msgs_${childId}_${lId}_${cId}`;
  const getMdKey = (lId: string) => `ai_tutor_md_${childId}_${lId}`;

  // Build default welcome message for a lesson
  const buildWelcomeMsg = (lessonTitle: string): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: lang === 'ar'
      ? `أهلاً بك يا بطل! 🦉 أنا معلمك الذكي أنيس. دعنا نراجع درس "${lessonTitle}". اسألني أي شيء لم تفهمه، وعندما تشعر بالجهوزية انقر على زر الاختبار التكيفي لتثبت مهارتك للعبور للدرس التالي! كوكو!`
      : lang === 'fr'
        ? `Bonjour champion ! 🦉 C'est Anis ton tuteur intelligent. Révisons la leçon "${lessonTitle}". Pose-moi toutes tes questions et clique sur l'exercice adaptatif pour déverrouiller la suite ! Hou-hou !`
        : `Hello superstar! 🦉 I'm Anis your AI tutor. Let's study "${lessonTitle}". Ask me any questions, and when you are ready, click on the adaptive exercise to test your skills and unlock the next lesson! Hoot!`,
    suggestions: lang === 'ar'
      ? ["اشرح لي الدرس ببساطة 📚", "أعطني مثالاً تطبيقياً 💡", "أنا جاهز للاختبار التكيفي 📝"]
      : lang === 'fr'
        ? ["Explique la leçon simplement 📚", "Donne-moi un exemple concret 💡", "Je suis prêt pour le quiz 📝"]
        : ["Explain the lesson simply 📚", "Give me a practical example 💡", "I'm ready for the exercise 📝"]
  });

  // Handle selected lesson change: load conversations & messages from localStorage
  useEffect(() => {
    if (!selectedLesson || !childId) return;

    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(null);

    const lId = selectedLesson.id;

    // Load saved conversations list
    let loadedConvs: Conversation[] = [];
    try {
      const savedConvs = localStorage.getItem(getConvsKey(lId));
      if (savedConvs) {
        loadedConvs = JSON.parse(savedConvs);
      }
    } catch (e) { /* ignore */ }

    if (!loadedConvs.length) {
      loadedConvs = [{
        id: 'conv_default',
        createdAt: Date.now(),
        label: lang === 'ar' ? 'محادثة 1' : 'Chat 1',
      }];
      try {
        localStorage.setItem(getConvsKey(lId), JSON.stringify(loadedConvs));
      } catch (e) { /* ignore */ }
    }

    setConversations(loadedConvs);
    const activeId = loadedConvs[0].id;
    setActiveConvId(activeId);

    // Load messages for active conversation
    let loadedMsgs: Message[] = [];
    try {
      const savedMsgs = localStorage.getItem(getMsgsKey(lId, activeId));
      if (savedMsgs) {
        loadedMsgs = JSON.parse(savedMsgs);
      }
    } catch (e) { /* ignore */ }

    if (!loadedMsgs.length) {
      loadedMsgs = [buildWelcomeMsg(selectedLesson.title)];
      try {
        localStorage.setItem(getMsgsKey(lId, activeId), JSON.stringify(loadedMsgs));
      } catch (e) { /* ignore */ }
    }

    setMessages(loadedMsgs);

    // Load lesson markdown for Editor Mode
    let savedMd = '';
    try {
      savedMd = localStorage.getItem(getMdKey(lId)) || '';
    } catch (e) { /* ignore */ }

    if (!savedMd) {
      savedMd = `# ${selectedLesson.title}\n\n${selectedLesson.axis ? `**المحور:** ${selectedLesson.axis}\n\n` : ''}أهلاً بك في درس **${selectedLesson.title}**. استخدم وضع المحرر لاقتراح تعديلات أو طلب أمثلة وشروحات إضافية من أنيس المعلم الذكي.`;
    }
    setLessonMarkdown(savedMd);

    // Auto trigger prompt if passed in searchParams
    const customPrompt = searchParams.get('prompt');
    const autoExplain = searchParams.get('autoExplain');
    if ((customPrompt || autoExplain === 'true') && !autoPromptHandledRef.current) {
      autoPromptHandledRef.current = true;

      if (typeof window !== 'undefined') {
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete('autoExplain');
        newParams.delete('prompt');
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
      }

      let contextContent = '';
      try {
        const raw = sessionStorage.getItem('aiExplainContext');
        if (raw) {
          const ctx = JSON.parse(raw);
          sessionStorage.removeItem('aiExplainContext');

          if (ctx.type === 'lesson') {
            const parts: string[] = [];
            if (ctx.text) parts.push(ctx.text);
            if (ctx.key_concepts?.length) parts.push((lang === 'ar' ? 'المفاهيم الأساسية: ' : 'Key concepts: ') + ctx.key_concepts.join('، '));
            if (ctx.examples?.length) parts.push((lang === 'ar' ? 'الأمثلة: ' : 'Examples: ') + ctx.examples.join('، '));
            if (ctx.summary) parts.push((lang === 'ar' ? 'الخلاصة: ' : 'Summary: ') + ctx.summary);
            contextContent = parts.join('\n');
          } else if (ctx.type === 'exercise') {
            const parts: string[] = [];
            if (ctx.description) parts.push(ctx.description);
            if (ctx.questions) parts.push((lang === 'ar' ? 'الأسئلة:\n' : 'Questions:\n') + ctx.questions);
            contextContent = parts.join('\n');
          }
        }
      } catch (e) { /* ignore */ }

      let promptToSend: string;
      if (customPrompt) {
        promptToSend = contextContent
          ? `${customPrompt}\n\n---\n${lang === 'ar' ? 'محتوى التمرين الكامل:' : 'Full exercise content:'}\n${contextContent}`
          : customPrompt;
      } else if (contextContent) {
        promptToSend = lang === 'ar'
          ? `اشرح لي درس "${selectedLesson.title}" بطريقة مبسطة وممتعة 📚\n\n---\nمحتوى الدرس الكامل:\n${contextContent}`
          : lang === 'fr'
            ? `Explique-moi la leçon "${selectedLesson.title}" de manière simple et ludique 📚\n\n---\nContenu complet de la leçon:\n${contextContent}`
            : `Explain the lesson "${selectedLesson.title}" in a simple and fun way 📚\n\n---\nFull lesson content:\n${contextContent}`;
      } else {
        promptToSend = lang === 'ar'
          ? `اشرح لي درس "${selectedLesson.title}" بطريقة مبسطة وممتعة 📚`
          : lang === 'fr'
            ? `Explique-moi la leçon "${selectedLesson.title}" de manière simple et ludique 📚`
            : `Explain the lesson "${selectedLesson.title}" in a simple and fun way 📚`;
      }

      const alreadySent = loadedMsgs.some((m) => m.role === 'user' && m.content.startsWith(promptToSend.slice(0, 30)));
      if (!alreadySent) {
        setTimeout(() => {
          handleSendMessageWithLesson(promptToSend, selectedLesson.id, activeId, loadedMsgs);
        }, 400);
      }
    }
  }, [selectedLesson, lang]);

  // Select a conversation tab
  const handleSelectConversation = (convId: string) => {
    if (!selectedLesson || !childId) return;
    setActiveConvId(convId);
    let loadedMsgs: Message[] = [];
    try {
      const savedMsgs = localStorage.getItem(getMsgsKey(selectedLesson.id, convId));
      if (savedMsgs) {
        loadedMsgs = JSON.parse(savedMsgs);
      }
    } catch (e) { /* ignore */ }

    if (!loadedMsgs.length) {
      loadedMsgs = [buildWelcomeMsg(selectedLesson.title)];
      try {
        localStorage.setItem(getMsgsKey(selectedLesson.id, convId), JSON.stringify(loadedMsgs));
      } catch (e) { /* ignore */ }
    }
    setMessages(loadedMsgs);
  };

  // Create new conversation
  const handleNewConversation = () => {
    if (!selectedLesson || !childId) return;
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      createdAt: Date.now(),
      label: `${lang === 'ar' ? 'محادثة' : 'Chat'} ${conversations.length + 1}`,
    };

    const updatedConvs = [...conversations, newConv];
    setConversations(updatedConvs);
    setActiveConvId(newId);

    const initialMsgs = [buildWelcomeMsg(selectedLesson.title)];
    setMessages(initialMsgs);

    try {
      localStorage.setItem(getConvsKey(selectedLesson.id), JSON.stringify(updatedConvs));
      localStorage.setItem(getMsgsKey(selectedLesson.id, newId), JSON.stringify(initialMsgs));
    } catch (e) { /* ignore */ }
  };

  // Delete conversation
  const handleDeleteConversation = (convId: string) => {
    if (!selectedLesson || !childId || conversations.length <= 1) return;
    const updatedConvs = conversations.filter((c) => c.id !== convId);
    setConversations(updatedConvs);

    try {
      localStorage.setItem(getConvsKey(selectedLesson.id), JSON.stringify(updatedConvs));
      localStorage.removeItem(getMsgsKey(selectedLesson.id, convId));
    } catch (e) { /* ignore */ }

    if (activeConvId === convId) {
      handleSelectConversation(updatedConvs[0].id);
    }
  };

  // Scroll to chat bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingMessage]);

  // Chat Text-to-Speech
  const handleSpeak = (msgId: string, text: string) => {
    if (!synthRef.current) return;

    if (isSpeaking === msgId) {
      synthRef.current.cancel();
      setIsSpeaking(null);
      return;
    }

    synthRef.current.cancel();

    const cleanText = text
      .replace(/[*_#>`~-]/g, '')
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (lang === 'ar') {
      utterance.lang = 'ar-XA';
    } else if (lang === 'fr') {
      utterance.lang = 'fr-FR';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    synthRef.current.speak(utterance);
  };

  // Internal message sender helper
  const handleSendMessageWithLesson = async (
    text: string,
    lessonId: string,
    convId: string,
    currentMsgs: Message[]
  ) => {
    if (!text.trim() || !childId || sendingMessage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const newMsgs = [...currentMsgs, userMsg];
    setMessages(newMsgs);
    setInputValue('');
    setSendingMessage(true);

    try {
      localStorage.setItem(getMsgsKey(lessonId, convId), JSON.stringify(newMsgs));
    } catch (e) { /* ignore */ }

    const historyPayload = currentMsgs.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await aiTutorApi.sendMessage(
        childId,
        lessonId,
        text,
        historyPayload,
        llmLang
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response,
        suggestions: res.data.suggestions || [],
      };

      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);

      try {
        localStorage.setItem(getMsgsKey(lessonId, convId), JSON.stringify(finalMsgs));
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Error sending messages to AI tutor:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Send message to FastAPI AI tutor
  const handleSendMessage = async (text: string) => {
    if (!selectedLesson || !activeConvId) return;
    await handleSendMessageWithLesson(text, selectedLesson.id, activeConvId, messages);
  };

  // Editor mode: Apply edited markdown
  const handleApplyLessonEdit = (newMarkdown: string) => {
    if (!selectedLesson || !childId) return;
    setLessonMarkdown(newMarkdown);
    try {
      localStorage.setItem(getMdKey(selectedLesson.id), newMarkdown);
    } catch (e) { /* ignore */ }
  };

  // Adaptive Quiz Timer logic
  useEffect(() => {
    if (showQuiz && !submittingQuiz && !quizResult) {
      timerRef.current = setInterval(() => {
        setQuizTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showQuiz, submittingQuiz, quizResult]);

  // Generate Adaptive Exercise
  const handleStartExercise = async () => {
    if (!childId || !selectedLesson || generatingQuiz) return;
    setGeneratingQuiz(true);
    setSelectedOptionIdx(null);
    setQuizResult(null);
    setQuizTimer(0);

    const chatHistoryPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await aiTutorApi.generateExercise(childId, selectedLesson.id, chatHistoryPayload);
      setActiveExercise(res.data);
      setShowQuiz(true);
    } catch (err) {
      console.error('Error generating AI exercise:', err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Submit quiz answer
  const handleSubmitQuiz = async () => {
    if (selectedOptionIdx === null || !childId || !selectedLesson || !activeExercise || submittingQuiz) return;
    setSubmittingQuiz(true);

    const submissions = [
      {
        questionIdx: 0,
        selectedIdx: selectedOptionIdx,
      },
    ];

    const chatHistoryPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await aiTutorApi.submitExercise(
        childId,
        selectedLesson.id,
        activeExercise.id,
        submissions,
        quizTimer,
        chatHistoryPayload
      );
      setQuizResult(res.data);

      if (res.data.pointsAwarded > 0 && child) {
        setChild({
          ...child,
          points: child.points + res.data.pointsAwarded,
          stars: child.stars + res.data.starsAwarded,
        });
      }
    } catch (err) {
      console.error('Error submitting quiz answers:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Close quiz: re-fetch lessons map to unlock/update statuses
  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setActiveExercise(null);
    setQuizResult(null);
    if (selectedLesson) {
      fetchLessons(selectedLesson.id);
    }
  };

  // Advance to next lesson
  const handleAdvance = async () => {
    if (!childId || !selectedLesson) return;
    try {
      const res = await aiTutorApi.advance(childId, selectedLesson.id);
      if (res.data.nextLessonId) {
        fetchLessons(res.data.nextLessonId);
      } else {
        alert(lang === 'ar' ? 'أحسنت! لقد أكملت جميع الدروس المتاحة في هذه المادة!' : 'Félicitations ! Tu as complété toutes les leçons de cette matière !');
        fetchLessons(selectedLesson.id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'خطأ أثناء محاولة التقدم.');
    }
  };

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#FFF9F0]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-100 border border-red-200">
          <HelpCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black mb-2 text-slate-800">{tl.selectChildError || 'الرجاء اختيار طفل أولاً'}</h2>
        <Link href="/dashboard">
          <button className="btn-primary mt-4">{(t as any).reviews.dashboardBtn}</button>
        </Link>
      </div>
    );
  }

  const activeLessonQuestion = activeExercise?.content?.questions?.[0];

  return (
    <>
      {/* Unified, Streamlined Top Navigation Bar */}
      <header className="bg-white border-b border-slate-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs shrink-0 z-20">
        {/* Left Side: Brand, Subject Dropdown, AI Language Dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 leading-tight">
                {tl.title || 'تعلم مع الذكاء الاصطناعي 🦉'}
              </h1>
              <p className="text-slate-400 text-[9px] font-bold hidden sm:block">
                {lang === 'ar' ? 'رفيقك الذكي للدراسة التكيفية' : 'Adaptive Smart Study Companion'}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Subject Dropdown (Replaces 3 static buttons) */}
          <SubjectDropdown
            selectedSubject={subject}
            onSelect={(newSub) => setSubject(newSub)}
            dir={dir}
            lang={lang}
          />

          {/* AI Response Language Dropdown (Replaces 3 static buttons) */}
          <LanguageDropdown
            selectedLang={llmLang}
            onSelect={handleSelectLlmLang}
            dir={dir}
            appLang={lang}
          />
        </div>

        {/* Right Side: Mode Switcher, Child Badge, Map Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mode Switcher Segmented Control: Chat vs Editor */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all ${
                viewMode === 'chat'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'دردشة 🦉' : 'Chat 🦉'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all ${
                viewMode === 'editor'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'المحرر 📝' : 'Editor 📝'}</span>
            </button>
          </div>

          {/* Child XP / Stars Pill */}
          {child && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-2xl">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-[10px] font-black text-indigo-900">
                {child.points} XP | {child.stars} ⭐
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Workspace: Lessons Map / Instruction Panel & Main View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Collapsible Lessons Map / Instruction Panel */}
        <AnimatePresence initial={false}>
          {showMap && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white border-r rtl:border-r-0 rtl:border-l border-slate-100 flex flex-col shrink-0 overflow-hidden z-10 shadow-xs"
            >
              {/* Sidebar Header: In Editor mode show tabs, in Chat mode show clean Curriculum Map header */}
              {viewMode === 'editor' ? (
                <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSidebarTab('map')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      sidebarTab === 'map'
                        ? 'bg-white text-purple-700 shadow-xs border border-slate-100'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'الخريطة 📚' : 'Map 📚'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab('instructions')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      sidebarTab === 'instructions'
                        ? 'bg-white text-purple-700 shadow-xs border border-slate-100'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'التعليمات 📝' : 'Instructions 📝'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer shrink-0"
                    title={lang === 'ar' ? 'إغلاق الخريطة' : 'Close map'}
                  >
                    {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <h3 className="font-black text-xs text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>{tl.lessonsMap || 'خريطة الدروس المنهجية'}</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                      {lessons.filter((l) => l.completed).length}/{lessons.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMap(false)}
                      className="p-1 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
                      title={lang === 'ar' ? 'إغلاق الخريطة' : 'Close map'}
                    >
                      {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {(viewMode === 'chat' || sidebarTab === 'map') ? (
                /* Curriculum Map View */
                loadingLessons ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Loader2 className="w-7 h-7 animate-spin text-purple-600 mb-2" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                    {lessons.map((lesson, idx) => {
                      const isSelected = selectedLesson?.id === lesson.id;
                      const isUnlocked = idx === 0 || lessons[idx - 1]?.completed;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => isUnlocked && setSelectedLesson(lesson)}
                          className={`relative p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50/80 border-purple-300 shadow-xs'
                              : isUnlocked
                              ? 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-2xs'
                              : 'bg-slate-50/80 border-slate-100 opacity-60 cursor-not-allowed'
                          }`}
                          title={!isUnlocked ? tl.lockedLessonTooltip || 'هذا الدرس مقفل. أكمل الدروس السابقة أولاً!' : ''}
                        >
                          <div className={`flex items-start gap-2.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                            <div
                              className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                lesson.completed
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : isSelected
                                  ? 'bg-purple-600 text-white'
                                  : isUnlocked
                                  ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {lesson.completed ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : !isUnlocked ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <span className="text-[10px] font-black">{lesson.order}</span>
                              )}
                            </div>

                            <div className="flex-1 space-y-0.5 min-w-0">
                              <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-tight">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {lesson.isApproved && (
                                  <span className="inline-block text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {lang === 'ar' ? 'معتمد للعبور' : 'Approved'} ✓
                                  </span>
                                )}
                                {!lesson.isApproved && lesson.attempts > 0 && (
                                  <span className="inline-block text-[8px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                                    {lang === 'ar' ? 'أعد المحاولة' : 'Retry'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Editor AI Assistant Chat Stream (in Sidebar) */
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30">
                  <div className="p-3 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                      <h4 className="text-xs font-black text-slate-800">
                        {lang === 'ar' ? 'مساعد المحرر الذكي 🤖' : 'Editor AI Assistant 🤖'}
                      </h4>
                    </div>
                    <span className="text-[9px] font-black text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-100">
                      {lang === 'ar' ? 'تفاعلي ⚡' : 'Interactive ⚡'}
                    </span>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {editorChatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-purple-700 border border-purple-200'
                          }`}
                        >
                          {msg.role === 'user' ? '👤' : '🦉'}
                        </div>
                        <div
                          className={`max-w-[88%] p-2.5 rounded-2xl text-[11px] font-bold leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white rounded-tr-none'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-2xs'
                          }`}
                        >
                          <MarkdownRenderer content={msg.content} isUser={msg.role === 'user'} />
                        </div>
                      </div>
                    ))}

                    {isRequestingEdit && (
                      <div className="flex items-center gap-2 p-2 rounded-2xl bg-purple-50/80 border border-purple-100">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                        <span className="text-[10px] font-black text-purple-800">
                          {lang === 'ar' ? 'أنيس يقوم بتعديل الدرس...' : 'Anis is editing...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Collapsible Quick Presets */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowQuickPresets(!showQuickPresets)}
                      className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider px-1 py-0.5 cursor-pointer"
                    >
                      <span>{lang === 'ar' ? '⚡ اقتراحات سريعة' : '⚡ Quick Presets'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showQuickPresets ? 'rotate-180' : ''}`} />
                    </button>
                    {showQuickPresets && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          { label: lang === 'ar' ? '💡 أضف أمثلة' : '💡 Add examples', text: lang === 'ar' ? 'أضف أمثلة تطبيقية ممتعة في الدرس' : 'Add fun practical examples' },
                          { label: lang === 'ar' ? '🔍 بسط المفاهيم' : '🔍 Simplify', text: lang === 'ar' ? 'اشرح النقاط الصعبة بأسلوب أبسط للتلميذ' : 'Simplify hard concepts' },
                          { label: lang === 'ar' ? '📋 أضف ملخصاً' : '📋 Summary', text: lang === 'ar' ? 'أضف ملخصاً تطبيقياً في بداية الدرس' : 'Add a summary' },
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendEditorInstruction(chip.text)}
                            disabled={isRequestingEdit}
                            className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 hover:border-purple-200 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Editor Instruction Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (sidebarInstructionInput.trim()) {
                        handleSendEditorInstruction(sidebarInstructionInput);
                        setSidebarInstructionInput('');
                      }
                    }}
                    className="p-2.5 border-t border-slate-200/80 bg-white flex items-center gap-1.5 shrink-0"
                  >
                    <input
                      type="text"
                      value={sidebarInstructionInput}
                      onChange={(e) => setSidebarInstructionInput(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? 'اطلب تعديلاً من أنيس...'
                          : 'Ask Anis to edit...'
                      }
                      disabled={isRequestingEdit}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 placeholder-slate-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!sidebarInstructionInput.trim() || isRequestingEdit}
                      className="w-8 h-8 shrink-0 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Right: Main View Area (Chat or Editor) */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {selectedLesson ? (
            <>
              {/* Streamlined Lesson Header Bar */}
              <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0">
                <div className={`flex items-center gap-2.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {!showMap && (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 shadow-2xs flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
                      title={lang === 'ar' ? 'عرض خريطة الدروس' : 'Show curriculum map'}
                    >
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </button>
                  )}
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-xl bg-purple-100 text-purple-700 border border-purple-200/60">
                    {selectedLesson.axis || tl.lessonTitle || 'الدرس الحالي'}
                  </span>
                  <h2 className="text-xs sm:text-sm font-black text-slate-800">{selectedLesson.title}</h2>
                  {selectedLesson.completed && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'مكتمل' : 'Completed'}</span>
                    </span>
                  )}
                </div>

                {/* Streamlined Lesson Action Group */}
                <div className="flex items-center gap-2">
                  {/* Primary Adaptive Quiz Button */}
                  <button
                    type="button"
                    onClick={handleStartExercise}
                    disabled={generatingQuiz}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    {generatingQuiz ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Brain className="w-3.5 h-3.5" />
                    )}
                    <span>{tl.generateExerciseBtn || 'تمرين تكيفي 🧠'}</span>
                  </button>

                  {/* Advance to Next Lesson Button */}
                  <button
                    type="button"
                    onClick={handleAdvance}
                    disabled={!selectedLesson.isApproved}
                    className={`font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 ${
                      selectedLesson.isApproved
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                    title={!selectedLesson.isApproved ? tl.notApprovedYet : ''}
                  >
                    <span>{tl.advanceBtn || 'الدرس التالي ➡️'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* View Mode Switching: Chat vs Editor */}
              {viewMode === 'editor' ? (
                <EditorMode
                  lessonTitle={selectedLesson.title}
                  currentMarkdown={lessonMarkdown}
                  proposedMarkdown={proposedMarkdown}
                  onApprove={() => {
                    if (!proposedMarkdown) return;
                    handleApplyLessonEdit(proposedMarkdown);
                    setProposedMarkdown(null);
                    setEditorChatMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: lang === 'ar' ? '✅ **تمت الموافقة وتطبيق التعديل بنجاح على الدرس!**' : '✅ **Approved and applied!**',
                      },
                    ]);
                  }}
                  onReject={() => {
                    setProposedMarkdown(null);
                    setEditorChatMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: lang === 'ar' ? '❌ **تم رفض التغييرات وإلغاؤها.**' : '❌ **Changes rejected.**',
                      },
                    ]);
                  }}
                  onReset={() => {
                    setProposedMarkdown(null);
                  }}
                  dir={dir}
                  lang={lang}
                />
              ) : (
                /* Chat View */
                <>
                  {/* Multi-conversation Tabs */}
                  <ConversationTabs
                    conversations={conversations}
                    activeConversationId={activeConvId}
                    onSelect={handleSelectConversation}
                    onNew={handleNewConversation}
                    onDelete={handleDeleteConversation}
                    dir={dir}
                    lang={lang}
                  />

                  {/* Chat Message Panel */}
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/30">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${
                          msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-xs ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-tr from-cyan-500 to-blue-500'
                              : 'bg-gradient-to-tr from-violet-600 to-indigo-600'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          ) : (
                            <OwlLogo size={24} />
                          )}
                        </div>

                        {/* Msg content wrapper */}
                        <div className="max-w-[85%] sm:max-w-[80%] space-y-1.5">
                          <div
                            className={`p-3.5 sm:p-4 rounded-3xl text-xs font-bold leading-relaxed shadow-2xs ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                            }`}
                            style={{
                              direction: lang === 'ar' ? 'rtl' : 'ltr',
                              textAlign: lang === 'ar' ? 'right' : 'left',
                            }}
                          >
                            {msg.role === 'assistant' ? (
                              <MarkdownRenderer content={msg.content} isUser={false} />
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                          </div>

                          {/* Speaker TTS */}
                          {msg.role === 'assistant' && (
                            <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                              <button
                                type="button"
                                onClick={() => handleSpeak(msg.id, msg.content)}
                                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition-all ${
                                  isSpeaking === msg.id
                                    ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/25'
                                    : 'bg-white text-slate-400 hover:text-slate-700 border border-slate-100'
                                }`}
                              >
                                {isSpeaking === msg.id ? (
                                  <>
                                    <VolumeX className="w-3 h-3 animate-pulse" />
                                    <span>{lang === 'ar' ? 'كتم' : 'Mute'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3" />
                                    <span>{lang === 'ar' ? 'استمع' : 'Écouter'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Refined Quick Suggestions */}
                          {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.suggestions.map((sug, idx) => (
                                <motion.button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSendMessage(sug)}
                                  className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-100/80 hover:border-purple-300 rounded-full py-1 px-2.5 text-[10px] font-black cursor-pointer transition-all shadow-2xs"
                                  whileHover={{ scale: 1.02 }}
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

                    {/* Typing Loader */}
                    {sendingMessage && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shrink-0 flex items-center justify-center shadow-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                        <div className="bg-white border border-slate-100 text-slate-400 px-3.5 py-2.5 rounded-3xl rounded-tl-none flex items-center gap-1.5 shadow-2xs">
                          <span className="text-[10px] font-black">{lang === 'ar' ? 'أنيس يفكر...' : 'Anis is thinking...'}</span>
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Text Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(inputValue);
                    }}
                    className="p-3 sm:p-4 border-t border-slate-100 bg-white flex gap-2 sm:gap-3 items-center shrink-0"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={tl.chatPlaceholder || 'اسأل أنيس أي شيء حول هذا الدرس...'}
                      className="flex-1 bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl py-2.5 sm:py-3 px-4 text-xs font-bold focus:outline-none focus:border-purple-500 placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || sendingMessage}
                      className="w-10 h-10 shrink-0 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          )}
        </main>
      </div>

      {/* Adaptive Quiz Popup Modal */}
      <AnimatePresence>
        {showQuiz && activeExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-purple-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-800">
                    {tl.modalTitle || 'التمرين التكيفي المخصص 📝'}
                  </h3>
                </div>
                {!submittingQuiz && !quizResult && (
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                    ⏱️ {quizTimer}s
                  </span>
                )}
                {!submittingQuiz && (
                  <button
                    type="button"
                    onClick={handleCloseQuiz}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {!quizResult ? (
                  <>
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {activeExercise.title}
                      </span>
                      <p className="text-slate-500 text-xs font-bold leading-normal">
                        {activeExercise.description}
                      </p>
                    </div>

                    {/* Question text */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-relaxed">
                        {activeLessonQuestion?.text}
                      </h4>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      {activeLessonQuestion?.options?.map((option: string, idx: number) => {
                        const isSelected = selectedOptionIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedOptionIdx(idx)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                                : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-700">{option}</span>
                            <div
                              className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-purple-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  // Results UI
                  <div className="space-y-5">
                    <div className="text-center space-y-2">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                          quizResult.approved
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-500 border border-rose-100'
                        }`}
                      >
                        {quizResult.approved ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <X className="w-8 h-8" />
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-800">
                        {quizResult.approved ? tl.approvedSuccess || 'مبروك يا بطل! تم العبور 🎉' : tl.notApprovedYet || 'أعد المحاولة بتركيز'}
                      </h4>

                      <div className="flex justify-center gap-2 pt-1">
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                          {tl.scoreText ? tl.scoreText.replace('{score}', quizResult.score) : `الدرجة: ${quizResult.score}%`}
                        </span>
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                          {tl.timeSpent ? tl.timeSpent.replace('{time}', quizTimer) : `الوقت المستغرق: ${quizTimer} ثانية`}
                        </span>
                      </div>
                    </div>

                    {/* AI Feedback explanation */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <OwlLogo size={20} />
                        <span className="text-[10px] font-black text-slate-700">أنيس المعلم الذكي:</span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">
                        {quizResult.feedback}
                      </p>
                    </div>

                    {/* Explanation and fun fact */}
                    <div className="space-y-2">
                      {activeLessonQuestion?.explanation && (
                        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3.5">
                          <h5 className="text-[10px] font-black text-emerald-800">الشرح والتفسير:</h5>
                          <p className="text-slate-600 text-[10px] font-bold mt-1 leading-normal">
                            {activeLessonQuestion.explanation}
                          </p>
                        </div>
                      )}

                      {activeLessonQuestion?.funFact && (
                        <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-3.5">
                          <h5 className="text-[10px] font-black text-amber-800">💡 هل تعلم؟</h5>
                          <p className="text-slate-600 text-[10px] font-bold mt-1 leading-normal">
                            {activeLessonQuestion.funFact}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                {!quizResult ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={selectedOptionIdx === null || submittingQuiz}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs px-5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    {submittingQuiz ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{tl.evaluatingLoading || 'جاري التقييم...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{tl.submitBtn || 'إرسال الإجابة 🚀'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseQuiz}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-2 rounded-xl cursor-pointer transition-all shadow-xs active:scale-95"
                  >
                    {tl.backBtn || 'العودة للمحادثة 🦉'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function LearnWithAiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      }
    >
      <LearnWithAiContent />
    </Suspense>
  );
}
