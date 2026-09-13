'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { lang, setLang, dir } = useLanguage();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ] as const;

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const initialY = isCollapsed ? 0 : (isLandingPage ? -8 : 8);

  return (
    <div className="relative z-50" ref={containerRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-2xl text-sm font-bold cursor-pointer transition-all ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'px-3 py-2'
          }`}
        style={{
          background: 'rgba(124, 58, 237, 0.08)',
          border: '2px solid rgba(124, 58, 237, 0.2)',
          color: 'var(--color-primary)'
        }}
        whileHover={{ scale: 1.05, borderColor: 'rgba(124, 58, 237, 0.45)' }}
        whileTap={{ scale: 0.97 }}
        title={currentLang.label}
      >
        {isCollapsed ? (
          <span className="text-base leading-none">{currentLang.flag}</span>
        ) : (
          <>
            <Globe className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span>{currentLang.flag} {currentLang.label}</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: initialY, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: initialY, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`absolute w-40 rounded-2xl z-50 overflow-hidden ${isCollapsed
                ? (dir === 'rtl' ? 'right-full mr-2 bottom-0' : 'left-full ml-2 bottom-0')
                : isLandingPage
                  ? 'right-0 top-full mt-2'
                  : 'right-0 bottom-full mb-2'
              }`}
            style={{
              background: 'white',
              border: '2px solid rgba(124, 58, 237, 0.2)',
              boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)'
            }}
          >
            {languages.map((l, i) => (
              <motion.button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setIsOpen(false);
                }}
                className="w-full text-right px-4 py-2.5 text-sm block cursor-pointer transition-all font-bold"
                style={{
                  color: lang === l.code ? 'var(--color-primary)' : '#475569',
                  background: lang === l.code ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                  borderBottom: i < languages.length - 1 ? '1px solid rgba(124, 58, 237, 0.1)' : 'none'
                }}
                whileHover={{ background: 'rgba(124, 58, 237, 0.06)', color: 'var(--color-primary)', x: -3 }}
              >
                {l.flag} {l.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
