'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import OwlLogo from './Logo';
import { X, Sparkles, BookOpen, Trophy, Bot, ArrowRight, ArrowLeft } from 'lucide-react';

interface GuestSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  sourceContext?: string;
}

export default function GuestSignupModal({
  isOpen,
  onClose,
  title,
  subtitle,
  sourceContext,
}: GuestSignupModalProps) {
  const { lang, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#3D364A]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-[#F2DDD0] text-center overflow-hidden z-10"
            style={{ direction: dir }}
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br from-[#E8927C]/20 to-[#F5C26B]/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-gradient-to-tr from-[#95C5B2]/20 to-[#B89FD8]/20 blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 left-5 p-2 rounded-full bg-[#FAF8F5] hover:bg-[#F2DDD0] text-[#6E637C] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon / Mascot */}
            <div className="mx-auto mb-4 w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#FDF0EB] to-[#FDE1D7] flex items-center justify-center border border-[#F2DDD0] shadow-sm">
              <OwlLogo size={48} />
            </div>

            {/* Tag Badge */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FDF0EB] text-[#E8927C] border border-[#F2DDD0] mb-3">
              {lang === 'ar' ? 'انضم إلى عائلة المعرفة' : lang === 'fr' ? 'Rejoins l\'aventure' : 'Join the Adventure'}
            </span>

            {/* Title & Subtitle */}
            <h3
              className="text-2xl font-black text-[#3D364A] mb-2 leading-tight"
              style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}
            >
              {title || (lang === 'ar' ? 'أعجبك المحتوى؟ سجّل حسابك مجاناً!' : lang === 'fr' ? 'Prêt à continuer ? Crée ton compte !' : 'Ready to continue? Sign up free!')}
            </h3>
            <p className="text-xs sm:text-sm text-[#6E637C] font-semibold mb-6 leading-relaxed">
              {subtitle || (lang === 'ar'
                ? 'أنشئ حساباً مجانياً للوصول إلى كافة الدروس، حفظ النقاط، وتحدي أصدقائك في لوحة الشرف!'
                : lang === 'fr'
                ? 'Crée un compte gratuit pour débloquer toutes les leçons, sauvegarder tes points et grimper au classement !'
                : 'Create a free account to unlock all lessons, save your streak, and climb the leaderboard!')}
            </p>

            {/* Key Benefits List */}
            <div className="bg-[#FAF8F5] rounded-2xl p-4 text-start space-y-2.5 mb-6 border border-[#F2DDD0]">
              <div className="flex items-center gap-3 text-xs font-bold text-[#3D364A]">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#E8927C] shadow-2xs shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'فتح كامل دروس المنهج لجميع السنوات' : lang === 'fr' ? 'Accès à toutes les leçons du programme' : 'Unlock full curriculum across all grades'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-[#3D364A]">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'حفظ النقاط والشارات وعداد الأيام المتتالية' : lang === 'fr' ? 'Sauvegarde des points, badges et séries' : 'Save XP, badges and daily streaks'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-[#3D364A]">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-purple-500 shadow-2xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <span>{lang === 'ar' ? 'المعلم الذكي التفاعلي للمساعدة والشرح' : lang === 'fr' ? 'Tuteur IA interactif pour t\'aider' : 'Interactive AI Tutor to guide you'}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5">
              <Link href="/auth/register" onClick={onClose}>
                <button className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8927C] to-[#E58066] hover:from-[#D97D67] hover:to-[#D47155] text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                  <span>{lang === 'ar' ? 'إنشاء حساب مجاني في 30 ثانية 🚀' : lang === 'fr' ? 'Créer un compte gratuit en 30s 🚀' : 'Create Free Account in 30s 🚀'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/auth/login" onClick={onClose}>
                <button className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#3D364A] font-bold text-xs transition-colors cursor-pointer border border-[#F2DDD0]">
                  {lang === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : lang === 'fr' ? 'Déjà un compte ? Se connecter' : 'Already have an account? Log in'}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

