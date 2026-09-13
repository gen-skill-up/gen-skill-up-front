'use client';

import React from 'react';

export interface CurrencyItem {
  id: string;
  name: string;
  value: number; // in Millimes
  type: 'coin' | 'note';
  label: string;
  shortLabel: string;
  colorName: string;
  description?: string;
}

export const TUNISIAN_CURRENCIES: CurrencyItem[] = [
  { id: 'm20', name: '20 مليم', value: 20, type: 'coin', label: 'عشرون مليماً', shortLabel: '20 م', colorName: 'bronze', description: 'أصغر قطعة متداولة' },
  { id: 'm50', name: '50 مليم', value: 50, type: 'coin', label: 'خمسون مليماً', shortLabel: '50 م', colorName: 'copper', description: 'قطعة نحاسية' },
  { id: 'm100', name: '100 مليم', value: 100, type: 'coin', label: 'مائة مليم', shortLabel: '100 م', colorName: 'brass', description: 'قطعة ذهبية شائعة' },
  { id: 'm200', name: '200 مليم', value: 200, type: 'coin', label: 'مائتا مليم', shortLabel: '200 م', colorName: 'brass-poly', description: 'قطعة مضلعة مميزة' },
  { id: 'm500', name: '500 مليم', value: 500, type: 'coin', label: 'نصف دينار', shortLabel: '500 م', colorName: 'silver', description: 'نصف دينار فضي' },
  { id: 'd1', name: '1 دينار', value: 1000, type: 'coin', label: 'دينار واحد', shortLabel: '1 د.ت', colorName: 'gold-silver', description: '1000 مليم = 1 دينار' },
  { id: 'd2', name: '2 دينار', value: 2000, type: 'coin', label: 'ديناران', shortLabel: '2 د.ت', colorName: 'bimetal', description: 'قطعة ثنائية المعدن' },
  { id: 'd5', name: '5 دنانير', value: 5000, type: 'note', label: 'خمسة دنانير', shortLabel: '5 د.ت', colorName: 'green', description: 'ورقة خضراء (حنبعل)' },
  { id: 'd10', name: '10 دنانير', value: 10000, type: 'note', label: 'عشرة دنانير', shortLabel: '10 د.ت', colorName: 'blue', description: 'ورقة زرقاء (توحيدة)' },
  { id: 'd20', name: '20 دينار', value: 20000, type: 'note', label: 'عشرون ديناراً', shortLabel: '20 د.ت', colorName: 'red', description: 'ورقة حمراء (حشاد)' },
];

export const formatTunisianMoney = (millimes: number): string => {
  if (millimes === 0) return '0 مليم';
  if (millimes < 1000) {
    return `${millimes} مليم`;
  }
  const dinars = Math.floor(millimes / 1000);
  const remMillimes = millimes % 1000;
  if (remMillimes === 0) {
    return `${dinars} د.ت`;
  }
  return `${dinars} د.ت و ${remMillimes} م`;
};

interface CoinVisualProps {
  id: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function CoinVisual({ id, size = 'md', className = '' }: CoinVisualProps) {
  const sizeMap = {
    xs: { px: 32, text: 'text-[8px]', sub: 'text-[6px]' },
    sm: { px: 40, text: 'text-[9px]', sub: 'text-[7px]' },
    md: { px: 52, text: 'text-xs', sub: 'text-[9px]' },
    lg: { px: 70, text: 'text-sm', sub: 'text-[11px]' }
  };

  const { px } = sizeMap[size];

  switch (id) {
    case 'm20':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            <radialGradient id="grad-m20" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#d97736" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <linearGradient id="rim-m20" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#rim-m20)" stroke="#78350f" strokeWidth="2" />
          <circle cx="50" cy="50" r="44" fill="url(#grad-m20)" stroke="#fcd34d" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6" />
          <text x="50" y="44" textAnchor="middle" fill="#fef3c7" fontSize="22" fontWeight="900" fontFamily="sans-serif">20</text>
          <text x="50" y="62" textAnchor="middle" fill="#fed7aa" fontSize="13" fontWeight="bold">مليم</text>
          <path d="M40 73 Q50 78 60 73" stroke="#fcd34d" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'm50':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            <radialGradient id="grad-m50" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>
            <linearGradient id="rim-m50" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#431407" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#rim-m50)" stroke="#7c2d12" strokeWidth="2" />
          <circle cx="50" cy="50" r="44" fill="url(#grad-m50)" stroke="#fed7aa" strokeWidth="1.2" />
          {/* Beaded rim */}
          <circle cx="50" cy="50" r="39" fill="none" stroke="#ffedd5" strokeWidth="1" strokeDasharray="2 2" />
          <text x="50" y="43" textAnchor="middle" fill="#fff7ed" fontSize="24" fontWeight="900">50</text>
          <text x="50" y="62" textAnchor="middle" fill="#fed7aa" fontSize="13" fontWeight="bold">مليم</text>
          <circle cx="50" cy="74" r="2.5" fill="#fcd34d" />
        </svg>
      );

    case 'm100':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            <radialGradient id="grad-m100" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
            <linearGradient id="rim-m100" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#rim-m100)" stroke="#854d0e" strokeWidth="2" />
          <circle cx="50" cy="50" r="43" fill="url(#grad-m100)" stroke="#fef08a" strokeWidth="1" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="#713f12" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
          <text x="50" y="43" textAnchor="middle" fill="#451a03" fontSize="22" fontWeight="900">100</text>
          <text x="50" y="62" textAnchor="middle" fill="#713f12" fontSize="13" fontWeight="bold">مليم</text>
          <path d="M35 72 Q50 78 65 72" stroke="#854d0e" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'm200':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            <radialGradient id="grad-m200" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="45%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
          </defs>
          {/* Heptagonal polygon feel */}
          <polygon
            points="50,3 88,18 97,60 72,94 28,94 3,60 12,18"
            fill="#b45309"
            stroke="#fef08a"
            strokeWidth="2"
          />
          <polygon
            points="50,8 84,21 92,58 70,89 30,89 8,58 16,21"
            fill="url(#grad-m200)"
          />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#78350f" strokeWidth="1.2" strokeDasharray="3 2" />
          <text x="50" y="43" textAnchor="middle" fill="#451a03" fontSize="21" fontWeight="900">200</text>
          <text x="50" y="62" textAnchor="middle" fill="#78350f" fontSize="13" fontWeight="bold">مليم</text>
          <path d="M38 72 L62 72" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'm500':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            <radialGradient id="grad-m500" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
            <linearGradient id="rim-m500" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#rim-m500)" stroke="#475569" strokeWidth="2" />
          <circle cx="50" cy="50" r="43" fill="url(#grad-m500)" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="50" cy="50" r="37" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />
          <text x="50" y="42" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">500</text>
          <text x="50" y="61" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="bold">نصف دينار</text>
          <path d="M36 71 Q50 76 64 71" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'd1':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            <radialGradient id="grad-d1-outer" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </radialGradient>
            <radialGradient id="grad-d1-inner" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>
          </defs>
          {/* Large impressive golden coin with Tunisian star & crescent & boat */}
          <circle cx="50" cy="50" r="48" fill="#713f12" />
          <circle cx="50" cy="50" r="46" fill="url(#grad-d1-outer)" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#713f12" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="34" fill="url(#grad-d1-inner)" stroke="#ca8a04" strokeWidth="1" />
          <text x="50" y="44" textAnchor="middle" fill="#0f172a" fontSize="26" fontWeight="900">1</text>
          <text x="50" y="62" textAnchor="middle" fill="#451a03" fontSize="13" fontWeight="bold">دينار</text>
          <path d="M42 72 L58 72" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'd2':
      return (
        <svg width={px} height={px} viewBox="0 0 100 100" className={`filter drop-shadow-md select-none ${className}`}>
          <defs>
            {/* Bimetallic ring: Outer silver / inner brass */}
            <radialGradient id="grad-d2-outer" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
            <radialGradient id="grad-d2-inner" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>
          {/* Outer ring */}
          <circle cx="50" cy="50" r="48" fill="#334155" />
          <circle cx="50" cy="50" r="46" fill="url(#grad-d2-outer)" stroke="#f8fafc" strokeWidth="1" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
          {/* Inner core */}
          <circle cx="50" cy="50" r="33" fill="url(#grad-d2-inner)" stroke="#451a03" strokeWidth="1.5" />
          <text x="50" y="44" textAnchor="middle" fill="#451a03" fontSize="26" fontWeight="900">2</text>
          <text x="50" y="62" textAnchor="middle" fill="#451a03" fontSize="13" fontWeight="bold">دينار</text>
          {/* Olive branch mini symbol */}
          <circle cx="50" cy="71" r="2" fill="#78350f" />
        </svg>
      );

    default:
      return null;
  }
}

interface BanknoteVisualProps {
  id: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function BanknoteVisual({ id, size = 'md', className = '' }: BanknoteVisualProps) {
  const sizeMap = {
    xs: { w: 76, h: 40 },
    sm: { w: 92, h: 48 },
    md: { w: 120, h: 62 },
    lg: { w: 160, h: 82 }
  };

  const { w, h } = sizeMap[size];

  switch (id) {
    case 'd5':
      return (
        <svg width={w} height={h} viewBox="0 0 200 100" className={`filter drop-shadow-md select-none rounded-lg ${className}`}>
          <defs>
            <linearGradient id="grad-note-d5" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="70%" stopColor="#047857" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
            <pattern id="pattern-d5" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 10 0 M 0 0 L 10 10" fill="none" stroke="#34d399" strokeWidth="0.4" opacity="0.3" />
            </pattern>
          </defs>
          {/* Main Banknote Base */}
          <rect x="2" y="2" width="196" height="96" rx="6" fill="url(#grad-note-d5)" stroke="#064e3b" strokeWidth="2" />
          <rect x="6" y="6" width="188" height="88" rx="4" fill="url(#pattern-d5)" stroke="#a7f3d0" strokeWidth="1" />
          
          {/* Security Thread */}
          <line x1="55" y1="6" x2="55" y2="94" stroke="#fcd34d" strokeWidth="2.5" strokeDasharray="6 3" />
          
          {/* Watermark circle */}
          <circle cx="32" cy="50" r="22" fill="#064e3b" opacity="0.4" />
          <circle cx="32" cy="50" r="18" fill="none" stroke="#a7f3d0" strokeWidth="1" strokeDasharray="3 2" />
          <text x="32" y="55" textAnchor="middle" fill="#d1fae5" fontSize="16" fontWeight="bold" opacity="0.8">5</text>

          {/* Bank Title & Details */}
          <text x="145" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">البنك المركزي التونسي</text>
          <text x="145" y="40" textAnchor="middle" fill="#d1fae5" fontSize="8">خمسة دنانير • 5 DINARS</text>
          
          {/* Hannibal / Carthage columns motif */}
          <path d="M125 50 L125 80 M135 48 L135 80 M145 50 L145 80 M155 48 L155 80 M120 52 L160 52" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

          {/* Large Numerals */}
          <rect x="165" y="62" width="26" height="26" rx="4" fill="#064e3b" opacity="0.6" />
          <text x="178" y="82" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900">5</text>
          <text x="18" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">5</text>
        </svg>
      );

    case 'd10':
      return (
        <svg width={w} height={h} viewBox="0 0 200 100" className={`filter drop-shadow-md select-none rounded-lg ${className}`}>
          <defs>
            <linearGradient id="grad-note-d10" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="35%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
            <pattern id="pattern-d10" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 4 L 4 0 L 8 4 L 4 8 Z" fill="none" stroke="#93c5fd" strokeWidth="0.4" opacity="0.3" />
            </pattern>
          </defs>
          <rect x="2" y="2" width="196" height="96" rx="6" fill="url(#grad-note-d10)" stroke="#172554" strokeWidth="2" />
          <rect x="6" y="6" width="188" height="88" rx="4" fill="url(#pattern-d10)" stroke="#bfdbfe" strokeWidth="1" />

          {/* Holographic Strip */}
          <line x1="58" y1="6" x2="58" y2="94" stroke="#e0e7ff" strokeWidth="3" strokeDasharray="8 3" />
          
          {/* Watermark area (Tawhida Ben Cheikh silhouette) */}
          <circle cx="34" cy="50" r="22" fill="#1e3a8a" opacity="0.5" />
          <circle cx="34" cy="50" r="18" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
          <text x="34" y="55" textAnchor="middle" fill="#dbeafe" fontSize="15" fontWeight="bold" opacity="0.8">10</text>

          {/* Central Text */}
          <text x="145" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">البنك المركزي التونسي</text>
          <text x="145" y="40" textAnchor="middle" fill="#bfdbfe" fontSize="8">عشرة دنانير • 10 DINARS</text>
          
          {/* Scientific/Medical motif */}
          <circle cx="140" cy="65" r="12" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.6" />
          <path d="M140 57 L140 73 M132 65 L148 65" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

          {/* Large Numerals */}
          <rect x="160" y="62" width="32" height="26" rx="4" fill="#172554" opacity="0.6" />
          <text x="176" y="82" textAnchor="middle" fill="#ffffff" fontSize="17" fontWeight="900">10</text>
          <text x="20" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">10</text>
        </svg>
      );

    case 'd20':
      return (
        <svg width={w} height={h} viewBox="0 0 200 100" className={`filter drop-shadow-md select-none rounded-lg ${className}`}>
          <defs>
            <linearGradient id="grad-note-d20" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="35%" stopColor="#e11d48" />
              <stop offset="70%" stopColor="#9f1239" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>
            <pattern id="pattern-d20" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="3" fill="none" stroke="#fda4af" strokeWidth="0.4" opacity="0.3" />
            </pattern>
          </defs>
          <rect x="2" y="2" width="196" height="96" rx="6" fill="url(#grad-note-d20)" stroke="#4c0519" strokeWidth="2" />
          <rect x="6" y="6" width="188" height="88" rx="4" fill="url(#pattern-d20)" stroke="#fecdd3" strokeWidth="1" />

          {/* Metallic security strip */}
          <line x1="60" y1="6" x2="60" y2="94" stroke="#fde047" strokeWidth="3" strokeDasharray="7 2" />

          {/* Watermark area */}
          <circle cx="34" cy="50" r="22" fill="#881337" opacity="0.5" />
          <circle cx="34" cy="50" r="18" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" />
          <text x="34" y="56" textAnchor="middle" fill="#ffe4e6" fontSize="16" fontWeight="bold" opacity="0.8">20</text>

          {/* Central Text */}
          <text x="145" y="24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">البنك المركزي التونسي</text>
          <text x="145" y="40" textAnchor="middle" fill="#ffe4e6" fontSize="8">عشرون ديناراً • 20 DINARS</text>

          {/* Farhat Hached / Star emblem */}
          <polygon points="140,52 144,62 154,63 146,70 149,80 140,74 131,80 134,70 126,63 136,62" fill="#fda4af" opacity="0.5" />

          {/* Large Numerals */}
          <rect x="160" y="62" width="32" height="26" rx="4" fill="#4c0519" opacity="0.6" />
          <text x="176" y="82" textAnchor="middle" fill="#ffffff" fontSize="17" fontWeight="900">20</text>
          <text x="20" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">20</text>
        </svg>
      );

    default:
      return null;
  }
}

interface CurrencyItemCardProps {
  item: CurrencyItem;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  count?: number;
  interactive?: boolean;
}

export function CurrencyItemCard({
  item,
  onClick,
  size = 'md',
  count,
  interactive = true
}: CurrencyItemCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`relative group flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl transition-all duration-200 ${
        interactive
          ? 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-lg hover:brightness-110'
          : 'cursor-default'
      }`}
      title={`${item.name} (${item.label})`}
    >
      {item.type === 'coin' ? (
        <CoinVisual id={item.id} size={size} />
      ) : (
        <BanknoteVisual id={item.id} size={size} />
      )}

      {/* Label and Details below */}
      <div className="mt-1 text-center leading-none">
        <span className="block text-[11px] font-black text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-amber-300 transition-colors">
          {item.name}
        </span>
        <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          {item.type === 'coin' ? 'قطعة' : 'ورقة'}
        </span>
      </div>

      {/* Stack Count Badge if multiple on table */}
      {count !== undefined && count > 1 && (
        <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-slate-900 shadow-md animate-bounce">
          x{count}
        </div>
      )}
    </button>
  );
}
