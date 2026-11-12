'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { X, Crown, Sparkles, Zap, Brain, Award, ArrowRight, ArrowLeft } from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  reason?: 'ai_limit' | 'exercise_locked' | 'general';
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  title,
  reason = 'general',
}: PremiumUpgradeModalProps) {
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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-300 text-center overflow-hidden z-10"
            style={{ direction: dir }}
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 opacity-20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 opacity-20 blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Crown Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 mx-auto flex items-center justify-center shadow-lg shadow-amber-400/30 mb-4 animate-bounce">
              <Crown className="w-9 h-9 fill-current" />
            </div>

            {/* Tag Badge */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
              {lang === 'ar' ? 'باقة التميز الفائقة • PREMIUM' : lang === 'fr' ? 'Formule Premium' : 'Premium Membership'}
            </span>

            {/* Title */}
            <h3
              className="text-xl sm:text-2xl font-black text-[#3D364A] mb-2 leading-tight"
              style={{ fontFamily: 'Fredoka One, Tajawal, sans-serif' }}
            >
              {title || (
                reason === 'ai_limit'
                  ? (lang === 'ar' ? 'استنفدت حصتك اليومية من المعلم الذكي' : 'Limite quotidienne d\'IA atteinte')
                  : reason === 'exercise_locked'
                    ? (lang === 'ar' ? 'هذا التمرين متاح لمشتركي Premium' : 'Exercice réservé aux membres Premium')
                    : (lang === 'ar' ? 'انطلق بلا حدود مع النسخة المدفوعة' : 'Passez au niveau supérieur avec Premium')
              )}
            </h3>

            <p className="text-xs sm:text-sm text-[#6E647D] font-medium leading-relaxed mb-5">
              {reason === 'ai_limit'
                ? (lang === 'ar'
                  ? 'وصلت إلى الحد اليومي المجاني (5 أسئلة). احصل على محادثات غير محدودة وشروحات صوتية ذكية مع باقة Premium!'
                  : 'Passez à la formule Premium pour poser des questions illimitées à votre tuteur IA sans restriction !')
                : (lang === 'ar'
                  ? 'احصل على وصول غير محدود لكافة التمارين، الامتحانات التحديّة، ومساعد الذكاء الاصطناعي المتطور.'
                  : 'Débloquez tous les exercices avancés, les défis et un tuteur IA illimité pour une progression rapide.')
              }
            </p>

            {/* Perks List */}
            <div className="bg-slate-50 rounded-2xl p-4 text-start space-y-2 mb-6 border border-slate-100">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {lang === 'ar' ? 'ماذا ستحصل مع Premium؟' : 'Ce que comprend Premium :'}
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{lang === 'ar' ? 'وصول كامل وغير محدود لجميع التمارين والامتحانات' : 'Accès illimité à tous les exercices et examens'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{lang === 'ar' ? 'محادثات ذكاء اصطناعي غير محدودة (AI Tutor بلا سقف)' : 'Tuteur IA sans aucune limite quotidienne'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{lang === 'ar' ? 'توليد تمارين ذكية وتكييف الصعوبة تلقائياً' : 'Génération d\'exercices sur mesure par IA'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{lang === 'ar' ? 'تاج بريميوم ذهبي في لوحة الشرف وتقارير تفصيلية' : 'Badge couronne doré et rapports détaillés'}</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2.5">
              <Link href="/#pricing" onClick={onClose}>
                <button className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                  <span>{lang === 'ar' ? 'استعراض خطط الاشتراك والترقية 👑' : 'Voir les offres Premium 👑'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'ربما لاحقاً' : 'Peut-être plus tard'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

