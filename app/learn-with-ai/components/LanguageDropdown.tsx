'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';

export type LlmLangType = 'ar' | 'fr' | 'en';

interface LanguageDropdownProps {
  selectedLang: LlmLangType;
  onSelect: (lang: LlmLangType) => void;
  dir: string;
  appLang: string;
}

export default function LanguageDropdown({
  selectedLang,
  onSelect,
  dir,
  appLang,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const languages: {
    id: LlmLangType;
    label: string;
    flag: string;
    subLabel: string;
  }[] = [
    {
      id: 'ar',
      label: 'العربية',
      flag: '🇹🇳',
      subLabel: appLang === 'ar' ? 'لغة الرد العربية' : 'Arabic responses',
    },
    {
      id: 'fr',
      label: 'Français',
      flag: '🇫🇷',
      subLabel: appLang === 'ar' ? 'لغة الرد الفرنسية' : 'Réponses en français',
    },
    {
      id: 'en',
      label: 'English',
      flag: '🇬🇧',
      subLabel: appLang === 'ar' ? 'لغة الرد الإنجليزية' : 'English responses',
    },
  ];

  const currentLang = languages.find((l) => l.id === selectedLang) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/20'
            : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:border-purple-200 hover:shadow-sm'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span className="text-xs font-black text-slate-700 flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span>{currentLang.label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-600' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-52 rounded-2xl bg-white border border-slate-100 shadow-xl p-1.5 focus:outline-none ${
              dir === 'rtl' ? 'left-0' : 'right-0'
            }`}
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {appLang === 'ar' ? 'لغة رد المعلم أنيس' : 'AI Tutor Language'}
              </p>
            </div>

            <div className="py-1 space-y-1">
              {languages.map((item) => {
                const isSelected = item.id === selectedLang;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border border-purple-200/70 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none shrink-0">{item.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800">{item.label}</div>
                        <div className="text-[9px] font-bold text-slate-400 truncate">
                          {item.subLabel}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
