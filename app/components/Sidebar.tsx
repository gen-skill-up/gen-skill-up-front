'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { childrenApi } from '@/lib/api';
import OwlLogo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import AiAssistant from './AiAssistant';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import GuestSignupModal from './GuestSignupModal';
import {
  Home,
  BookOpen,
  Zap,
  Target,
  LogOut,
  LogIn,
  Plus,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Smile,
  Cat,
  Dog,
  Fish,
  Bird,
  Rabbit,
  Ghost,
  Crown,
  Award,
  Star,
  Pencil,
  ClipboardList,
  Repeat,
  Medal,
  Monitor,
  Book,
  Users,
  Sparkles,
  Gamepad2,
  Flame,
  CheckCircle2
} from 'lucide-react';

const avatarMap: Record<string, any> = {
  cat: Cat,
  dog: Dog,
  fish: Fish,
  bird: Bird,
  rabbit: Rabbit,
  smile: Smile,
  ghost: Ghost,
  crown: Crown,
};

const avatarBgColors = ['#E8927C', '#95C5B2', '#C4A6D7', '#F0C987', '#F2B5C8', '#7EB5D6'];

interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  points: number;
  stars: number;
  streakDays: number;
  avatarUrl?: string;
}

interface SidebarProps {
  activeTab?: string;
}

export default function Sidebar({ activeTab }: SidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, dir, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const [comingSoonTab, setComingSoonTab] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const childDropdownRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('CHILD');
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  // Hydrate collapsed state and userRole from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    const token = localStorage.getItem('token');
    setIsGuest(!token || token === 'null' || token === 'undefined');

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || 'CHILD');
        setIsUserPremium(!!user.isPremium);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch children and active child
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    childrenApi.list()
      .then(res => {
        setChildren(res.data);
        const stored = localStorage.getItem('activeChildId');
        if (stored && res.data.some((c: any) => c.id === stored)) {
          setActiveChildId(stored);
        } else if (res.data.length > 0) {
          setActiveChildId(res.data[0].id);
          localStorage.setItem('activeChildId', res.data[0].id);
        }
      })
      .catch(err => console.error('Failed to load children in sidebar:', err));
  }, []);

  // Close child switcher dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (childDropdownRef.current && !childDropdownRef.current.contains(event.target as Node)) {
        setIsChildDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeChild = children.find(c => c.id === activeChildId);

  const handleChildSwitch = (id: string) => {
    localStorage.setItem('activeChildId', id);
    setActiveChildId(id);
    setIsChildDropdownOpen(false);

    window.dispatchEvent(new CustomEvent('activeChildChanged', { detail: { id } }));
    if (pathname !== '/dashboard') {
      router.push(`${pathname}?childId=${id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeChildId');
    router.push('/');
  };

  const renderAvatar = (avatar: string | undefined, index: number, size = 11) => {
    const bgColor = avatarBgColors[index % avatarBgColors.length];
    const IconComponent = avatar ? avatarMap[avatar] : Smile;
    return (
      <div 
        className="rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm" 
        style={{ 
          width: `${size * 4}px`, 
          height: `${size * 4}px`, 
          background: bgColor + '25',
          border: `2.5px solid ${bgColor}`
        }}
      >
        <IconComponent className="stroke-[2.5]" style={{ width: `${size * 2.2}px`, height: `${size * 2.2}px`, color: bgColor }} />
      </div>
    );
  };

  // Nav items configuration
  const menuItems = [
    {
      id: 'dashboard',
      label: t.sidebar.accueil,
      icon: Home,
      href: isGuest ? '/' : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'lessons',
      label: t.sidebar.cours,
      icon: BookOpen,
      href: activeChildId ? `/lessons?childId=${activeChildId}` : '/lessons',
      comingSoon: false,
    },
    {
      id: 'exercises',
      label: t.sidebar.exercices,
      icon: Pencil,
      href: activeChildId ? `/exercises?childId=${activeChildId}` : '/exercises',
      comingSoon: false,
    },
    {
      id: 'learn-with-ai',
      label: t.sidebar.learnWithAi || 'تعلم مع الذكاء الاصطناعي',
      icon: Sparkles,
      href: activeChildId ? `/learn-with-ai?childId=${activeChildId}` : '/learn-with-ai',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'exams',
      label: t.sidebar.examens,
      icon: ClipboardList,
      href: activeChildId ? `/placement-test?childId=${activeChildId}` : '/placement-test',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'reviews',
      label: t.sidebar.revisions,
      icon: Repeat,
      href: activeChildId ? `/reviews?childId=${activeChildId}` : '/reviews',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'challenges',
      label: t.sidebar.defis,
      icon: Zap,
      href: activeChildId ? `/challenges?childId=${activeChildId}` : '/challenges',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'games',
      label: (t.sidebar as any).games || 'الألعاب التفاعلية 🎮',
      icon: Gamepad2,
      href: activeChildId ? `/games?childId=${activeChildId}` : '/games',
      comingSoon: false,
    },
    {
      id: 'badges',
      label: t.sidebar.badges,
      icon: Medal,
      href: activeChildId ? `/badges?childId=${activeChildId}` : '/badges',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'virtual-class',
      label: t.sidebar.classeVirtuelle,
      icon: Monitor,
      href: activeChildId ? `/virtual-class?childId=${activeChildId}` : '/virtual-class',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'library',
      label: t.sidebar.bibliotheque,
      icon: Book,
      href: activeChildId ? `/library?childId=${activeChildId}` : '/library',
      comingSoon: false,
      requiresAuth: true,
    },
    {
      id: 'parent',
      label: t.sidebar.parentTuteur,
      icon: Users,
      href: activeChildId ? `/parent?childId=${activeChildId}` : '/parent',
      comingSoon: false,
      requiresAuth: true,
    },
  ];

  const renderSidebarContent = (isCollapsedMode: boolean) => (
    <div className={`flex flex-col h-full justify-between transition-all duration-200 ${isCollapsedMode ? 'px-2 py-4' : 'px-4 py-5'}`}>
      {/* Top Part */}
      <div className="space-y-4">
        {/* Brand Logo & Name */}
        <Link 
          href="/" 
          className={`flex items-center group transition-transform ${isCollapsedMode ? 'justify-center py-1 w-11 h-11 mx-auto' : 'gap-3 px-2 py-1'}`}
        >
          <OwlLogo size={isCollapsedMode ? 38 : 44} />
          {!isCollapsedMode && (
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#31463D] tracking-tight group-hover:text-[#E8927C] transition-colors" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {t.common.brand}
              </span>
              <span className="text-[11px] font-bold text-[#627D72] -mt-1">
                {dir === 'rtl' ? 'التعلم الذكي للأطفال' : 'Smart Learning for Kids'}
              </span>
            </div>
          )}
        </Link>

        {/* Profile / Child Header (Pastel Neumorphic style like reference) */}
        {activeChild && !isCollapsedMode && (
          <div className="p-3 rounded-2xl bg-white/70 border border-[#D5E3DB] shadow-sm flex items-center gap-3">
            {renderAvatar(activeChild.avatarUrl, children.indexOf(activeChild), 10)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-[#273B32] truncate">
                  {dir === 'rtl' ? `مرحباً، ${activeChild.name}! 👋` : `Hi, ${activeChild.name}! 👋`}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-[#557165]">
                <span className="flex items-center gap-0.5 text-[#E8927C]">
                  <Award className="w-3.5 h-3.5" />
                  {activeChild.points}
                </span>
                <span className="flex items-center gap-0.5 text-[#E5A83B]">
                  <Star className="w-3.5 h-3.5 fill-[#E5A83B]" />
                  {activeChild.stars}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Guest Mode Indicator */}
        {isGuest && !isCollapsedMode && (
          <div className="p-3 rounded-2xl bg-white/80 border border-emerald-300 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h4 className="font-black text-xs text-slate-800 truncate">
                {lang === 'ar' ? 'وضع الزائر 🚀' : lang === 'fr' ? 'Mode Visiteur 🚀' : 'Guest Mode 🚀'}
              </h4>
              <p className="text-[10px] font-bold text-emerald-700 truncate">
                {lang === 'ar' ? 'تصفح مجاني للدروس والتمارين' : lang === 'fr' ? 'Cours gratuits sans connexion' : 'Free access to sample lessons'}
              </p>
            </div>
          </div>
        )}

        {/* Child Switcher Dropdown (for multi-children / parent) */}
        {children.length > 0 && userRole !== 'CHILD' && (
          <div className="relative" ref={childDropdownRef}>
            <button
              onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-[#D5E3DB] text-[#2F443A] text-xs font-black shadow-xs hover:bg-white transition-all cursor-pointer ${
                isCollapsedMode ? 'justify-center p-2' : ''
              }`}
              title={activeChild ? activeChild.name : 'اختر طفلاً'}
            >
              {isCollapsedMode ? (
                activeChild && renderAvatar(activeChild.avatarUrl, children.indexOf(activeChild), 6)
              ) : (
                <>
                  <span className="truncate">{activeChild ? activeChild.name : 'اختر طفلاً'}</span>
                  <ChevronDown className="w-4 h-4 text-[#557165]" />
                </>
              )}
            </button>

            <AnimatePresence>
              {isChildDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className={`absolute mt-1.5 bg-white rounded-2xl shadow-xl border border-[#D5E3DB] z-50 overflow-hidden max-h-60 overflow-y-auto ${
                    isCollapsedMode 
                      ? (dir === 'rtl' ? 'right-full mr-2 top-0 w-48' : 'left-full ml-2 top-0 w-48') 
                      : 'left-0 right-0'
                  }`}
                >
                  <div className="p-1.5 space-y-1">
                    {children.map((child, index) => (
                      <button
                        key={child.id}
                        onClick={() => handleChildSwitch(child.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-start transition-all cursor-pointer ${
                          activeChildId === child.id ? 'bg-[#E2ECE7] text-[#22352C] font-black' : 'hover:bg-[#F2F7F4] text-[#455D52]'
                        }`}
                      >
                        {renderAvatar(child.avatarUrl, index, 6)}
                        <div className="flex-1 min-w-0 text-start">
                          <p className="font-extrabold text-xs truncate leading-tight">{child.name}</p>
                          <p className="text-[10px] text-[#698478]">{child.age} {t.dashboard.ageLabel}</p>
                        </div>
                      </button>
                    ))}
                    
                    <div className="h-[1px] bg-[#E5EFE9] my-1" />
                    
                    <Link href="/age-select" className="block">
                      <button className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-black text-[#E8927C] hover:bg-[#FDF0EC] transition-all cursor-pointer">
                        <Plus className="w-4 h-4" />
                        <span>{t.dashboard.addChildBtn}</span>
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Menu Navigation Links */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-380px)] pr-1 pl-1 no-scrollbar">
          {menuItems.filter(item => !(item.id === 'parent' && userRole === 'CHILD')).map((item) => {
            const itemPathPrefixes: Record<string, string> = {
              dashboard: '/dashboard',
              lessons: '/lessons',
              exercises: '/exercises',
              'learn-with-ai': '/learn-with-ai',
              exams: '/placement-test',
              reviews: '/reviews',
              challenges: '/challenges',
              games: '/games',
              badges: '/badges',
              'virtual-class': '/virtual-class',
              library: '/library',
              parent: '/parent',
            };
            const prefix = itemPathPrefixes[item.id] || item.href.split('?')[0];
            const isSelected = activeTab 
              ? activeTab === item.id 
              : (item.id === 'dashboard' 
                ? (pathname === '/dashboard' || (isGuest && pathname === '/'))
                : pathname.startsWith(prefix)
              );
            const IconComponent = item.icon;

            const handleClick = (e: React.MouseEvent) => {
              if (item.comingSoon) {
                e.preventDefault();
                setComingSoonTab(item.label);
              } else if (isGuest && (item as any).requiresAuth) {
                e.preventDefault();
                setGuestModalOpen(true);
              }
            };

            return (
              <Link key={item.id} href={item.href} className="block" onClick={handleClick}>
                <motion.div
                  className={`flex items-center font-black cursor-pointer transition-all duration-200 ${
                    isCollapsedMode 
                      ? 'justify-center w-11 h-11 mx-auto p-0 rounded-2xl' 
                      : 'gap-3 px-3.5 py-2.5 rounded-2xl'
                  } ${
                    isSelected
                      ? 'bg-white text-[#223B30] shadow-[0_4px_14px_rgba(40,70,55,0.08)] border border-[#D5E3DB]'
                      : 'text-[#486357] hover:text-[#1F332A] hover:bg-white/50'
                  }`}
                  title={item.label}
                  whileHover={{ scale: 1.02, x: isCollapsedMode ? 0 : (dir === 'rtl' ? -3 : 3) }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className={`flex items-center justify-center shrink-0 rounded-xl ${
                      isSelected ? 'w-8 h-8 bg-[#E6F0EB] text-[#244537]' : 'w-7 h-7 text-[#567568]'
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  {!isCollapsedMode && (
                    <span className="text-[14.5px] font-black tracking-tight leading-none">
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Part (Pastel CTA card & actions) */}
      <div className="space-y-3 pt-3 border-t border-[#D5E3DB]">
        {/* Motivational / Premium Tier Card */}
        {!isCollapsedMode && (
          isUserPremium ? (
            <div 
              className="p-3.5 rounded-2xl relative overflow-hidden text-center shadow-xs bg-gradient-to-tr from-amber-100 to-yellow-100 border border-amber-300"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs mx-auto mb-2 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
              </div>
              <h5 className="font-black text-xs text-amber-900 flex items-center justify-center gap-1">
                <span>{lang === 'ar' ? 'عضوية Premium VIP 👑' : lang === 'fr' ? 'Membre Premium VIP 👑' : 'Premium VIP Member 👑'}</span>
              </h5>
              <p className="text-[11px] font-bold text-amber-800/80 mt-0.5">
                {lang === 'ar' ? 'وصول كامل وغير محدود لكافة التمارين والـ AI' : lang === 'fr' ? 'Accès illimité aux exercices et à l\'IA' : 'Unlimited access to all exercises and AI'}
              </p>
            </div>
          ) : (
            <div 
              className="p-3.5 rounded-2xl relative overflow-hidden text-center shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #FDDECF 0%, #FBEBE1 100%)',
                border: '1.5px solid rgba(232, 146, 124, 0.35)',
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs mx-auto mb-2 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#E8927C] fill-[#E8927C]" />
              </div>
              <h5 className="font-black text-xs text-[#4A3830]">
                {lang === 'ar' ? 'الترقية إلى Premium 👑' : lang === 'fr' ? 'Passez à Premium 👑' : 'Upgrade to Premium 👑'}
              </h5>
              <p className="text-[11px] font-bold text-[#7E655C] mt-0.5 mb-2.5">
                {lang === 'ar' ? 'افتح جميع التمارين التحديّة والذكاء الاصطناعي بلا سقف!' : lang === 'fr' ? 'Débloquez tous les exercices et l\'IA illimitée !' : 'Unlock all challenging exercises & unlimited AI!'}
              </p>
              <button 
                onClick={() => setPremiumModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 text-xs font-black shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'ترقية الحساب الآن ✨' : lang === 'fr' ? 'Passer à Premium ✨' : 'Upgrade Now ✨'}</span>
              </button>
            </div>
          )
        )}

        {/* Language Switcher */}
        <div className="flex justify-center">
          <LanguageSwitcher isCollapsed={isCollapsedMode} />
        </div>

        {/* Logout or Login Button */}
        {isGuest ? (
          <Link href="/auth/login" className="block w-full">
            <button
              className={`flex items-center justify-center transition-all bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer shadow-xs ${
                isCollapsedMode ? 'w-10 h-10 rounded-xl mx-auto p-0' : 'w-full gap-2 py-2.5 px-3 rounded-xl text-xs font-black'
              }`}
              title={lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Log In'}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              {!isCollapsedMode && <span>{lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Log In'}</span>}
            </button>
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center transition-all bg-white/60 hover:bg-[#FDF0EC] border border-[#E8927C]/30 text-[#D46B55] hover:text-[#B94E38] cursor-pointer shadow-xs ${
              isCollapsedMode ? 'w-10 h-10 rounded-xl mx-auto p-0' : 'w-full gap-2 py-2.5 px-3 rounded-xl text-xs font-black'
            }`}
            title={t.dashboard.logoutBtn}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsedMode && <span>{t.dashboard.logoutBtn}</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <motion.aside 
        animate={{ width: isCollapsed ? 82 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="hidden md:block h-screen sticky top-0 shrink-0 z-30 relative"
        style={{
          background: '#E6EFEA', // Soft Pastel Sage/Mint matching reference design
          borderRight: dir === 'ltr' ? '1.5px solid #D2E2D8' : 'none',
          borderLeft: dir === 'rtl' ? '1.5px solid #D2E2D8' : 'none',
          boxShadow: '4px 0 24px rgba(45, 75, 60, 0.04)',
          overflow: 'visible'
        }}
      >
        {/* Toggle Button for desktop */}
        <button
          onClick={() => {
            const nextState = !isCollapsed;
            setIsCollapsed(nextState);
            localStorage.setItem('sidebar-collapsed', String(nextState));
          }}
          className={`hidden md:flex items-center justify-center absolute top-6 z-50 w-6 h-6 rounded-full bg-white hover:bg-[#F0F6F2] text-[#345344] border border-[#CBDDD2] shadow-sm cursor-pointer transition-all duration-200 ${
            dir === 'rtl' 
              ? 'left-0 -translate-x-1/2' 
              : 'right-0 translate-x-1/2'
          }`}
        >
          {dir === 'rtl' ? (
            isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {renderSidebarContent(isCollapsed)}
      </motion.aside>

      {/* Mobile Top Header (only visible on mobile to toggle drawer) */}
      <header 
        className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-[#E6EFEA]/95 backdrop-blur-md shadow-xs"
        style={{ borderBottom: '1.5px solid #D2E2D8' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <OwlLogo size={34} />
          <span className="text-lg font-black text-[#263D33]" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.common.brand}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {activeChild && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#D2E2D8] text-xs font-bold text-[#355244]">
              {renderAvatar(activeChild.avatarUrl, children.indexOf(activeChild), 5)}
              <span className="truncate max-w-[90px]">{activeChild.name}</span>
            </div>
          )}
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2.5 rounded-xl bg-white border border-[#D2E2D8] text-[#263D33] shadow-xs cursor-pointer hover:bg-[#F2F7F4] transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (visible on mobile when open) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#1A2E25] z-50 md:hidden backdrop-blur-xs"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 w-76 bg-[#E6EFEA] z-50 md:hidden shadow-2xl flex flex-col"
              style={{
                right: dir === 'rtl' ? 0 : 'auto',
                left: dir === 'ltr' ? 0 : 'auto',
              }}
            >
              {/* Close Button inside drawer */}
              <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-50`}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/80 border border-[#D2E2D8] hover:bg-white transition-all text-[#263D33] shadow-xs cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-full overflow-y-auto">
                {renderSidebarContent(false)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {comingSoonTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs"
            onClick={() => setComingSoonTab(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-7 shadow-2xl border border-[#F0D5CB] max-w-xs w-full mx-4 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">🚀</div>
              <h3 className="text-lg font-black text-[#3D364A] mb-2">
                {comingSoonTab}
              </h3>
              <p className="text-[#6E647D] text-xs font-bold mb-6">
                {lang === 'ar' 
                  ? 'هذا القسم قيد التطوير والبرمجة حالياً وسيكون متاحاً قريباً جداً! انتظرونا 🎉' 
                  : lang === 'fr'
                  ? 'Ce module est en cours de développement et sera disponible très bientôt ! 🎉'
                  : 'This feature is currently under development and will be available very soon! 🎉'}
              </p>
              <button
                onClick={() => setComingSoonTab(null)}
                className="w-full bg-[#E8927C] hover:bg-[#D4785F] text-white text-xs font-black py-3 rounded-2xl shadow-md cursor-pointer transition-all"
              >
                {lang === 'ar' ? 'حسناً 👍' : lang === 'fr' ? 'D\'accord 👍' : 'Got it 👍'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Guest Signup Modal */}
      <GuestSignupModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        reason="general"
      />
      <AiAssistant />
    </>
  );
}
