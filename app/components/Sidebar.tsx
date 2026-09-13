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
import {
  Home,
  BookOpen,
  Zap,
  Target,
  LogOut,
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
  Gamepad2
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

const avatarBgColors = ['#FF8C42', '#4ECDC4', '#A855F7', '#4ADE80', '#F472B6', '#60A5FA'];

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
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const [comingSoonTab, setComingSoonTab] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const childDropdownRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('CHILD');

  // Hydrate collapsed state and userRole from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || 'CHILD');
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

    // Redirect to apply child context change
    if (pathname === '/dashboard') {
      window.location.reload();
    } else {
      router.push(`${pathname}?childId=${id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeChildId');
    router.push('/');
  };

  const renderAvatar = (avatar: string | undefined, index: number, size = 10) => {
    const bgColor = avatarBgColors[index % avatarBgColors.length];
    const IconComponent = avatar ? avatarMap[avatar] : Smile;
    return (
      <div 
        className="rounded-full flex items-center justify-center overflow-hidden shrink-0" 
        style={{ 
          width: `${size * 4}px`, 
          height: `${size * 4}px`, 
          background: bgColor + '20',
          border: `2px solid ${bgColor}40`
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
      href: '/dashboard',
      comingSoon: false,
    },
    {
      id: 'lessons',
      label: t.sidebar.cours,
      icon: BookOpen,
      href: activeChildId ? `/lessons?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'learn-with-ai',
      label: t.sidebar.learnWithAi || 'تعلم مع الذكاء الاصطناعي',
      icon: Sparkles,
      href: activeChildId ? `/learn-with-ai?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'exercises',
      label: t.sidebar.exercices,
      icon: Pencil,
      href: activeChildId ? `/exercises?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'exams',
      label: t.sidebar.examens,
      icon: ClipboardList,
      href: activeChildId ? `/placement-test?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'reviews',
      label: t.sidebar.revisions,
      icon: Repeat,
      href: activeChildId ? `/reviews?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'challenges',
      label: t.sidebar.defis,
      icon: Zap,
      href: activeChildId ? `/challenges?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
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
      href: activeChildId ? `/badges?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'virtual-class',
      label: t.sidebar.classeVirtuelle,
      icon: Monitor,
      href: activeChildId ? `/virtual-class?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'library',
      label: t.sidebar.bibliotheque,
      icon: Book,
      href: activeChildId ? `/library?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
    {
      id: 'parent',
      label: t.sidebar.parentTuteur,
      icon: Users,
      href: activeChildId ? `/parent?childId=${activeChildId}` : '/dashboard',
      comingSoon: false,
    },
  ];

  const renderSidebarContent = (isCollapsedMode: boolean) => (
    <div className={`flex flex-col h-full justify-between transition-all duration-200 ${isCollapsedMode ? 'px-2 py-5' : 'p-5'}`}>
      {/* Top Part */}
      <div className="space-y-6">
        {/* Brand Logo — clicking goes to landing page */}
        <Link 
          href="/" 
          className={`flex items-center group ${isCollapsedMode ? 'justify-center py-1 w-10 h-10 mx-auto' : 'gap-3 px-2 py-1'}`}
        >
          <OwlLogo size={isCollapsedMode ? 36 : 42} />
          {!isCollapsedMode && (
            <span className="text-xl font-black text-white transition-opacity group-hover:opacity-75" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              {t.common.brand}
            </span>
          )}
        </Link>

        {children.length > 0 && (
          <div className="relative" ref={childDropdownRef}>
            <button
              onClick={() => userRole !== 'CHILD' && setIsChildDropdownOpen(!isChildDropdownOpen)}
              className={`w-full flex items-center transition-all border border-slate-800 text-white ${
                isCollapsedMode ? 'justify-center p-0 rounded-2xl w-10 h-10 mx-auto' : 'justify-between p-3 rounded-2xl'
              } ${userRole === 'CHILD' ? 'cursor-default' : 'cursor-pointer'}`}
              style={{
                background: 'rgba(255,255,255,0.05)',
              }}
              title={activeChild ? activeChild.name : 'اختر ملف طفل'}
            >
              {activeChild ? (
                isCollapsedMode ? (
                  renderAvatar(activeChild.avatarUrl, children.indexOf(activeChild), 7)
                ) : (
                  <div className={`flex items-center gap-2.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {renderAvatar(activeChild.avatarUrl, children.indexOf(activeChild), 9)}
                    <div>
                      <h4 className="font-extrabold text-xs text-white leading-tight">{activeChild.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-slate-300">
                        <span className="flex items-center gap-0.5 text-cyan-400">
                          <Award className="w-3.5 h-3.5" />
                          {activeChild.points}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {activeChild.stars}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                !isCollapsedMode && <span className="text-xs font-bold text-slate-400">اختر ملف طفل</span>
              )}
              {userRole !== 'CHILD' && !isCollapsedMode && <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />}
            </button>

            {/* Child Switcher Dropdown */}
            <AnimatePresence>
              {isChildDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`absolute mt-2 bg-[#161456] rounded-2xl shadow-xl border border-slate-800 z-50 overflow-hidden max-h-60 overflow-y-auto ${
                    isCollapsedMode 
                      ? (dir === 'rtl' ? 'right-full mr-2 top-0 mt-0 w-48' : 'left-full ml-2 top-0 mt-0 w-48') 
                      : 'left-0 right-0'
                  }`}
                >
                  <div className="p-1 space-y-1">
                    {children.map((child, index) => (
                      <button
                        key={child.id}
                        onClick={() => handleChildSwitch(child.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-right transition-all cursor-pointer ${
                          activeChildId === child.id ? 'bg-indigo-600/30 text-white' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        {renderAvatar(child.avatarUrl, index, 7)}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs truncate leading-tight">{child.name}</p>
                          <p className="text-[9px] font-semibold text-slate-400">{child.age} {t.dashboard.ageLabel}</p>
                        </div>
                      </button>
                    ))}
                    
                    <div className="h-[1px] bg-slate-800 my-1" />
                    
                    <Link href="/age-select" className="block">
                      <button className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-black text-cyan-400 hover:bg-cyan-400/5 transition-all cursor-pointer">
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
        <nav className="space-y-1.5">
          {menuItems.filter(item => !(item.id === 'parent' && userRole === 'CHILD')).map((item) => {
            const isSelected = activeTab 
              ? activeTab === item.id 
              : (item.id === 'dashboard' 
                ? pathname === '/dashboard' 
                : (item.id === 'exams'
                  ? pathname.startsWith('/placement-test')
                  : (item.id === 'badges'
                    ? pathname.startsWith('/badges')
                    : (item.id === 'challenges'
                      ? pathname.startsWith('/challenges')
                      : pathname.startsWith(item.href.split('?')[0])
                    )
                  )
                )
              );
            const IconComponent = item.icon;

            const handleClick = (e: React.MouseEvent) => {
              if (item.comingSoon) {
                e.preventDefault();
                setComingSoonTab(item.label);
              }
            };

            return (
              <Link key={item.id} href={item.href} className="block" onClick={handleClick}>
                <motion.div
                  className={`flex items-center rounded-2xl font-black text-xs cursor-pointer transition-all border border-transparent ${
                    isCollapsedMode ? 'justify-center w-10 h-10 mx-auto p-0' : 'gap-3 px-3.5 py-3'
                  }`}
                  title={item.label}
                  style={{
                    color: isSelected ? 'white' : '#94A3B8',
                    background: isSelected ? 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)' : 'transparent',
                    boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    x: isCollapsedMode ? 0 : (dir === 'rtl' ? -3 : 3),
                    background: isSelected ? 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.04)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-5 h-5 shrink-0" style={{ color: isSelected ? 'white' : '#64748B' }} />
                  {!isCollapsedMode && <span>{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Part */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        {/* Language Switcher */}
        <div className="flex justify-center">
          <LanguageSwitcher isCollapsed={isCollapsedMode} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center transition-all border border-rose-950/30 hover:bg-rose-950/10 cursor-pointer ${
            isCollapsedMode ? 'w-10 h-10 rounded-2xl mx-auto p-0' : 'w-full gap-2 py-3 px-4 rounded-2xl text-xs font-black text-rose-400'
          }`}
          title={t.dashboard.logoutBtn}
        >
          <LogOut className="w-4.5 h-4.5 text-rose-400" />
          {!isCollapsedMode && <span>{t.dashboard.logoutBtn}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="hidden md:block h-screen sticky top-0 shrink-0 z-30 relative"
        style={{
          background: '#110F4C',
          borderRight: dir === 'ltr' ? '1px solid rgba(255,255,255,0.06)' : 'none',
          borderLeft: dir === 'rtl' ? '1px solid rgba(255,255,255,0.06)' : 'none',
          boxShadow: '0 0 40px rgba(0,0,0,0.15)',
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
          className={`hidden md:flex items-center justify-center absolute top-6 z-50 w-6 h-6 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white border border-white/10 shadow-md cursor-pointer transition-all duration-200 ${
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
        className="md:hidden flex items-center justify-between px-5 py-3.5 sticky top-0 z-40 bg-[#110F4C] backdrop-blur-md"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <OwlLogo size={32} />
          <span className="text-lg font-black text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            {t.common.brand}
          </span>
        </Link>

        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer (visible on mobile when open) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 w-72 bg-[#110F4C] z-50 md:hidden shadow-2xl flex flex-col"
              style={{
                right: dir === 'rtl' ? 0 : 'auto',
                left: dir === 'ltr' ? 0 : 'auto',
              }}
            >
              {/* Close Button inside drawer */}
              <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-50`}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 transition-all text-slate-400"
                >
                  <X className="w-5 h-5 text-slate-300" />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setComingSoonTab(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 max-w-xs w-full mx-4 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-lg font-black text-slate-800 mb-2">
                {comingSoonTab}
              </h3>
              <p className="text-slate-500 text-xs font-bold mb-6">
                {dir === 'rtl' 
                  ? 'هذا القسم قيد التطوير والبرمجة حالياً وسيكون متاحاً قريباً جداً! انتظرونا 🎉' 
                  : 'Ce module est en cours de développement et sera disponible très bientôt ! 🎉'}
              </p>
              <button
                onClick={() => setComingSoonTab(null)}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black py-3 rounded-2xl shadow border-b-4 border-indigo-900 cursor-pointer transition-all"
              >
                {dir === 'rtl' ? 'حسناً 👍' : 'D\'accord 👍'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AiAssistant />
    </>
  );
}
