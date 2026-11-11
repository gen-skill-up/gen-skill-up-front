'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import OwlLogo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { BookOpen, ArrowRight, ArrowLeft, CheckCircle2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

export default function TermsPage() {
  const { dir, lang } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const content = {
    ar: {
      title: 'شروط وأحكام الاستخدام',
      subtitle: 'قواعد وضوابط الاستخدام الآمن والمسؤول لمنصة LearnWithAI التعليمية للأطفال والأولياء.',
      lastUpdated: 'آخر تحديث: 2026',
      backHome: 'العودة للرئيسية',
      sections: [
        {
          icon: UserCheck,
          title: '1. قبول الشروط ومسؤولية الحساب',
          text: 'استخدام المنصة للأطفال دون 13 عاماً يتطلب موافقة وإشراف أحد الوالدين أو الوصي القانوني. يتحمل الولي مسؤولية الحفاظ على سرية بيانات الدخول ومراقبة الاستخدام.'
        },
        {
          icon: BookOpen,
          title: '2. الاستخدام التعليمي المسموح',
          text: 'تم تصميم المنصة حصرياً للأغراض التعليمية ودعم المناهج المدرسية. يُمنع استغلال المحتوى أو نماذج الذكاء الاصطناعي في أي استخدام تجاري أو غير لائق.'
        },
        {
          icon: Sparkles,
          title: '3. الملكية الفكرية وحقوق المحتوى',
          text: 'جميع المناهج والمؤثرات البصرية والتمارين والألعاب التفاعلية والأكواد هي ملك لمنصة LearnWithAI ومحمية بموجب قوانين الملكية الفكرية وحقوق النشر.'
        },
        {
          icon: ShieldAlert,
          title: '4. استخدام الذكاء الاصطناعي وحدود المسؤولية',
          text: 'نعمل جاهدين لضمان دقة إجابات المساعد الذكي وانسجامها التام مع المنهج المدرسي. يُعد الذكاء الاصطناعي أداة مساعدة معززة للتعلم ولا يحل محل المعلم البشري.'
        }
      ]
    },
    fr: {
      title: 'Conditions Générales d\'Utilisation',
      subtitle: 'Règles et conditions pour une utilisation sûre et responsable de la plateforme LearnWithAI.',
      lastUpdated: 'Dernière mise à jour : 2026',
      backHome: 'Retour à l\'accueil',
      sections: [
        {
          icon: UserCheck,
          title: '1. Acceptation et responsabilité parentale',
          text: 'L\'utilisation de la plateforme pour les élèves de moins de 13 ans requiert le consentement préalable d\'un parent ou tuteur légal, responsable de la supervision du compte.'
        },
        {
          icon: BookOpen,
          title: '2. Usage pédagogique exclusif',
          text: 'LearnWithAI est exclusivement dédiée à l\'apprentissage et au soutien scolaire. Toute utilisation commerciale ou détournée de nos services est strictement interdite.'
        },
        {
          icon: Sparkles,
          title: '3. Propriété intellectuelle',
          text: 'L\'ensemble des leçons, exercices, illustrations et algorithmes interactifs constitue la propriété exclusive de LearnWithAI protégée par le droit d\'auteur.'
        },
        {
          icon: ShieldAlert,
          title: '4. Intelligence Artificielle & Responsabilité',
          text: 'Nos modèles d\'IA sont rigoureusement guidés pour respecter le programme officiel. Ils constituent un outil d\'accompagnement bienveillant et ne se substituent pas à l\'enseignant.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      subtitle: 'Rules and guidelines for safe and constructive use of the LearnWithAI educational platform.',
      lastUpdated: 'Last updated: 2026',
      backHome: 'Back to Home',
      sections: [
        {
          icon: UserCheck,
          title: '1. Acceptance & Parental Responsibility',
          text: 'Platform use for children under 13 requires supervision and consent from a parent or legal guardian who is responsible for managing login credentials.'
        },
        {
          icon: BookOpen,
          title: '2. Authorized Educational Use',
          text: 'LearnWithAI is designed solely for curriculum enrichment and educational learning. Any commercial reproduction or misuse is prohibited.'
        },
        {
          icon: Sparkles,
          title: '3. Intellectual Property',
          text: 'All interactive lessons, exercises, audio engines, and gamified mechanics are proprietary to LearnWithAI and protected under copyright laws.'
        },
        {
          icon: ShieldAlert,
          title: '4. AI Assistance & Disclaimers',
          text: 'Our AI tutoring models are strictly aligned with school curricula to assist students kindly and effectively, complementing classroom teachers.'
        }
      ]
    }
  };

  const current = content[lang] || content.ar;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDF8F3 0%, #F9F1E8 100%)' }}>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-[var(--color-primary)] hover:opacity-80 transition-opacity">
            <BackIcon className="w-4 h-4" />
            <span>{current.backHome}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <OwlLogo size={36} />
          </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-3"
        >
          <div className="inline-flex items-center gap-2 bg-[#FDF0EB] text-[#E8927C] border border-[#F2DDD0] px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>{current.lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#3D364A] tracking-tight">
            {current.title}
          </h1>
          <p className="text-base text-[#6E647D] max-w-2xl mx-auto leading-relaxed font-semibold">
            {current.subtitle}
          </p>
        </motion.div>

        {/* Policy Cards */}
        <div className="grid gap-6">
          {current.sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD0] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF6F3] border border-[#D5EAE1] flex items-center justify-center shrink-0 text-[#2D6A53]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#3D364A]">
                      {section.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#6E647D] leading-relaxed font-semibold">
                      {section.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

