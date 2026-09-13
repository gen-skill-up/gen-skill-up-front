'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar, TranslationType } from './translations/ar';
import { en } from './translations/en';
import { fr } from './translations/fr';

type Lang = 'ar' | 'en' | 'fr';

interface LanguageContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationType;
  dir: 'rtl' | 'ltr';
}

const translations = { ar, en, fr };

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en' || savedLang === 'fr')) {
      setLangState(savedLang);
    } else {
      // Try browser language detection
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'fr') {
        setLangState('fr');
      } else if (browserLang === 'en') {
        setLangState('en');
      } else {
        setLangState('ar');
      }
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const currentTranslation = translations[lang];
  const dir = currentTranslation.common.dir;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: currentTranslation, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
