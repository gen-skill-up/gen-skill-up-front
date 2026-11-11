'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import OwlLogo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ShieldCheck, ArrowRight, ArrowLeft, Lock, Eye, HeartHandshake, FileCheck } from 'lucide-react';

export default function PrivacyPage() {
  const { dir, lang } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const content = {
    ar: {
      title: 'سياسة الخصوصية وحماية بيانات الأطفال',
      subtitle: 'نلتزم بأعلى معايير حماية وخصوصية أطفالكم وفق المعايير الدولية والتشريعات المنظمة.',
      lastUpdated: 'آخر تحديث: 2026',
      backHome: 'العودة للرئيسية',
      sections: [
        {
          icon: ShieldCheck,
          title: '1. التزامنا تجاه خصوصية الطفل',
          text: 'منصة LearnWithAI مصممة للأطفال من 6 إلى 14 سنة. نحن لا نقوم ببيع أو مشاركة أي بيانات شخصية للأطفال لأي جهة إعلانية أو تجارية، ونتقيد بمعايير COPPA وGDPR-K لحماية النشء.'
        },
        {
          icon: Eye,
          title: '2. البيانات التي نجمعها',
          text: 'نجمع فقط البيانات الضرورية لتشخيص المستوى التعليمي وتكييف الدروس: الاسم المستعار، الفئة العمرية، المستوى الدراسي، وسجل الإجابات عن التمارين لتحسين المنظومة التكيفية.'
        },
        {
          icon: Lock,
          title: '3. أمان وحفظ البيانات',
          text: 'يتم تشفير كلمات المرور وسجلات البيانات عبر بروتوكولات حماية متقدمة، مع عزل بيانات كل تلميذ عن الحسابات الأخرى عبر حواجز تحقق مشددة (Child Ownership Guards).'
        },
        {
          icon: HeartHandshake,
          title: '4. حقوق الأولياء والرقابة الأبوية',
          text: 'يمتلك الولي الحق الكامل في أي وقت بالاطلاع على تقارير طفله أو تعديلها أو حذف الحساب وجميع البيانات المتعلقة به نهائياً من خلال لوحة تحكم الولي.'
        }
      ]
    },
    fr: {
      title: 'Politique de Confidentialité et Protection des Enfants',
      subtitle: 'Nous appliquons les normes les plus strictes pour la sécurité et la confidentialité des données de vos enfants.',
      lastUpdated: 'Dernière mise à jour : 2026',
      backHome: 'Retour à l\'accueil',
      sections: [
        {
          icon: ShieldCheck,
          title: '1. Notre engagement envers la sécurité des enfants',
          text: 'LearnWithAI est conçu pour les enfants de 6 à 14 ans. Nous ne vendons ni ne partageons aucune donnée personnelle à des fins publicitaires ou commerciales, dans le respect strict des normes COPPA et RGPD-K.'
        },
        {
          icon: Eye,
          title: '2. Données collectées',
          text: 'Nous collectons uniquement les informations indispensables au suivi pédagogique : prénom ou pseudo, âge, niveau scolaire et historique des réponses pour adapter les exercices.'
        },
        {
          icon: Lock,
          title: '3. Sécurité et cryptage',
          text: 'Les mots de passe et données de progression sont protégés par un chiffrement robuste et un contrôle strict d\'accès parental (Child Ownership Guard).'
        },
        {
          icon: HeartHandshake,
          title: '4. Contrôle parental et droits d\'accès',
          text: 'Les parents disposent d\'un contrôle total pour consulter, modifier ou supprimer définitivement le compte et les données de leur enfant depuis l\'espace parent.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy & Child Safety',
      subtitle: 'Dedicated to the highest standards of child data protection and privacy.',
      lastUpdated: 'Last updated: 2026',
      backHome: 'Back to Home',
      sections: [
        {
          icon: ShieldCheck,
          title: '1. Our Child Privacy Commitment',
          text: 'LearnWithAI is designed for children aged 6 to 14. We never sell or share children\'s personal information with third-party advertisers, adhering strictly to COPPA and GDPR-K guidelines.'
        },
        {
          icon: Eye,
          title: '2. Information We Collect',
          text: 'We only collect essential educational data: nickname, age, grade level, and exercise answers to adapt learning content dynamically.'
        },
        {
          icon: Lock,
          title: '3. Data Security & Storage',
          text: 'Passwords and learning records are securely encrypted and protected through strict authorization checks (Child Ownership Guards).'
        },
        {
          icon: HeartHandshake,
          title: '4. Parental Rights & Control',
          text: 'Parents have full authority to view, modify, or permanently delete their child’s profile and learning history at any time from the Parent Portal.'
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
          <div className="inline-flex items-center gap-2 bg-[#EEF6F3] text-[#2D6A53] border border-[#D5EAE1] px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <FileCheck className="w-4 h-4" />
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
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0EB] border border-[#F2DDD0] flex items-center justify-center shrink-0 text-[var(--color-primary)]">
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

