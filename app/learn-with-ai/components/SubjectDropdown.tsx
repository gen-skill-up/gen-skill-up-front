'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Calculator,
  BookOpen,
  Lightbulb,
  Languages,
  Heart,
  Globe,
  Compass,
} from 'lucide-react';

export type SubjectType =
  | 'MATHS'
  | 'ARABIC'
  | 'SCIENCE'
  | 'FRANCAIS'
  | 'ISLAMIC_CIVIC'
  | 'ENGLISH'
  | 'SOCIALS';

interface SubjectDropdownProps {
  selectedSubject: SubjectType;
  onSelect: (subject: SubjectType) => void;
  dir: string;
  lang: string;
}

export default function SubjectDropdown({
  selectedSubject,
  onSelect,
  dir,
  lang,
}: SubjectDropdownProps) {
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

  const subjects: {
    id: SubjectType;
    label: string;
    icon: any;
    emoji: string;
    desc: string;
    color: string;
    bgHover: string;
    badgeBg: string;
  }[] = [
    {
      id: 'MATHS',
      label: lang === 'ar' ? 'الرياضيات' : lang === 'fr' ? 'Mathématiques' : 'Mathematics',
      icon: Calculator,
      emoji: '📐',
      desc: lang === 'ar' ? 'الحساب والأشكال الهندسية' : lang === 'fr' ? 'Calcul et géométrie' : 'Numbers & geometry',
      color: 'text-purple-600',
      bgHover: 'hover:bg-purple-50/70',
      badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    {
      id: 'ARABIC',
      label: lang === 'ar' ? 'اللغة العربية' : lang === 'fr' ? 'Langue Arabe' : 'Arabic Language',
      icon: BookOpen,
      emoji: '📝',
      desc: lang === 'ar' ? 'القراءة وقواعد اللغة والتعبير' : lang === 'fr' ? 'Lecture et grammaire' : 'Reading & grammar',
      color: 'text-emerald-600',
      bgHover: 'hover:bg-emerald-50/70',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      id: 'SCIENCE',
      label: lang === 'ar' ? 'الإيقاظ العلمي' : lang === 'fr' ? 'Éveil Scientifique' : 'Science & Discovery',
      icon: Lightbulb,
      emoji: '💡',
      desc: lang === 'ar' ? 'الاستكشاف والظواهر الطبيعية' : lang === 'fr' ? 'Sciences et découvertes' : 'Science & nature',
      color: 'text-amber-600',
      bgHover: 'hover:bg-amber-50/70',
      badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      id: 'FRANCAIS',
      label: lang === 'ar' ? 'اللغة الفرنسية' : lang === 'fr' ? 'Français' : 'French',
      icon: Languages,
      emoji: '🇫🇷',
      desc: lang === 'ar' ? 'قواعد اللغة والتواصل بالفرنسية' : lang === 'fr' ? 'Vocabulaire et communication' : 'French grammar & vocab',
      color: 'text-blue-600',
      bgHover: 'hover:bg-blue-50/70',
      badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      id: 'ISLAMIC_CIVIC',
      label: lang === 'ar' ? 'التربية الإسلامية والمدنية' : lang === 'fr' ? 'Éducation Islamique & Civique' : 'Islamic & Civic Ed',
      icon: Heart,
      emoji: '🕌',
      desc: lang === 'ar' ? 'القيم والأخلاق وحب الوطن' : lang === 'fr' ? 'Valeurs, morale et citoyenneté' : 'Values & citizenship',
      color: 'text-teal-600',
      bgHover: 'hover:bg-teal-50/70',
      badgeBg: 'bg-teal-100 text-teal-700 border-teal-200',
    },
    {
      id: 'ENGLISH',
      label: lang === 'ar' ? 'اللغة الإنجليزية' : lang === 'fr' ? 'Anglais' : 'English',
      icon: Globe,
      emoji: '🇬🇧',
      desc: lang === 'ar' ? 'مفردات ومحادثة بالإنجليزية' : lang === 'fr' ? 'Anglais pour débutants' : 'Vocabulary & reading',
      color: 'text-rose-600',
      bgHover: 'hover:bg-rose-50/70',
      badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    {
      id: 'SOCIALS',
      label: lang === 'ar' ? 'المواد الاجتماعية' : lang === 'fr' ? 'Histoire-Géo' : 'Social Studies',
      icon: Compass,
      emoji: '🌍',
      desc: lang === 'ar' ? 'التاريخ والجغرافيا والتربية المدنية' : lang === 'fr' ? 'Histoire, géographie et société' : 'History & geography',
      color: 'text-orange-600',
      bgHover: 'hover:bg-orange-50/70',
      badgeBg: 'bg-orange-100 text-orange-700 border-orange-200',
    },
  ];

  const currentSubject = subjects.find((s) => s.id === selectedSubject) || subjects[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/20'
            : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:border-purple-200 hover:shadow-sm'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-xl bg-white shadow-2xs border border-slate-100 text-xs">
          {currentSubject.emoji}
        </span>
        <div className="flex flex-col text-start">
          <span className="text-[9px] font-bold text-slate-400 leading-none">
            {lang === 'ar' ? 'المادة' : 'Subject'}
          </span>
          <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
            {currentSubject.label}
          </span>
        </div>
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
            className={`absolute z-50 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl p-1.5 focus:outline-none ${
              dir === 'rtl' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {lang === 'ar' ? 'اختر المادة للمتابعة' : 'Select Subject'}
              </p>
            </div>

            <div className="py-1 space-y-1">
              {subjects.map((sub) => {
                const isSelected = sub.id === selectedSubject;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSelect(sub.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border border-purple-200/70 shadow-2xs'
                        : `${sub.bgHover} hover:border-slate-100 border border-transparent`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white shadow-2xs border border-slate-100 text-sm shrink-0">
                        {sub.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 truncate">
                          {sub.label}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 truncate">
                          {sub.desc}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
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
