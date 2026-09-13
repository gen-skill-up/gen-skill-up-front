'use client';

import React from 'react';
import { Sparkles, Trophy, Star, ArrowRight, Award, Printer, CheckCircle2 } from 'lucide-react';
import { formatTunisianMoney } from './TunisianCurrency';
import { Product } from './ShopShelf';
import { soundEngine } from './SoundEngine';

interface ReceiptModalProps {
  isOpen: boolean;
  onNextChallenge: () => void;
  earnedScore: number;
  streak: number;
  gradeLevelName: string;
  gameModeTitle: string;
  items: Product[];
  totalAmount: number;
  customerPaid?: number;
  changeAmount?: number;
}

export default function ReceiptModal({
  isOpen,
  onNextChallenge,
  earnedScore,
  streak,
  gradeLevelName,
  gameModeTitle,
  items,
  totalAmount,
  customerPaid,
  changeAmount
}: ReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-4 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scaleUp relative">
        
        {/* Glowing Trophy Crown */}
        <div className="relative">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border-2 border-amber-400 shadow-xl animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black shadow">
            +{earnedScore} XP!
          </div>
        </div>

        {/* Victory Heading */}
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>ممتاز يا بطل!</span>
            <span className="text-amber-400">🏆</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            حساب دقيق وإتقان باهر للعملة التونسية!
          </p>
        </div>

        {/* Stars Rating */}
        <div className="flex items-center justify-center gap-2 py-1">
          <Star className="w-8 h-8 fill-amber-400 text-amber-400 animate-pulse" />
          <Star className="w-9 h-9 fill-amber-400 text-amber-400 animate-bounce" />
          <Star className="w-8 h-8 fill-amber-400 text-amber-400 animate-pulse" />
        </div>

        {/* Animated Realistic Tunisian Receipt */}
        <div className="bg-amber-50 text-slate-900 p-5 rounded-2xl text-right font-mono text-xs space-y-2 border border-amber-300 shadow-inner relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-slate-400 pb-3">
            <div className="font-black text-sm tracking-wide">🇹🇳 دكّان الحي التونسي 🇹🇳</div>
            <div className="text-[10px] text-slate-600">عمّ صلاح للعطارة والحساب الذهني</div>
            <div className="text-[9px] text-slate-500 mt-1">تاريخ العملية: {new Date().toLocaleDateString('ar-TN')}</div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 py-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">المستوى الدراسي:</span>
              <span className="font-bold">{gradeLevelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">نوع العملية:</span>
              <span className="font-bold text-amber-900">{gameModeTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">سلسلة الإجابات:</span>
              <span className="font-bold text-emerald-700">{streak} متتالية 🔥</span>
            </div>
          </div>

          {/* Itemized List */}
          {items.length > 0 && (
            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
              <div className="font-bold text-slate-700 mb-1">قائمة السلع:</div>
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.icon} {item.name}</span>
                  <span className="font-semibold">{formatTunisianMoney(item.price)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Financial Summary */}
          <div className="border-t-2 border-slate-800 pt-2 space-y-1 font-bold">
            <div className="flex justify-between text-xs">
              <span>المجموع الكلي:</span>
              <span className="text-emerald-700">{formatTunisianMoney(totalAmount)}</span>
            </div>

            {customerPaid !== undefined && customerPaid > 0 && (
              <div className="flex justify-between text-[11px] text-blue-700">
                <span>المبلغ المقبوض:</span>
                <span>{formatTunisianMoney(customerPaid)}</span>
              </div>
            )}

            {changeAmount !== undefined && changeAmount > 0 && (
              <div className="flex justify-between text-[11px] text-purple-700">
                <span>الباقي المرجع بدقة:</span>
                <span>{formatTunisianMoney(changeAmount)}</span>
              </div>
            )}
          </div>

          {/* Stamp / Barcode */}
          <div className="border-t border-dashed border-slate-400 pt-3 text-center">
            <div className="inline-block border-2 border-emerald-600 text-emerald-700 px-3 py-0.5 rounded-md font-black text-[10px] transform -rotate-3">
              ✓ خَالِص ومقبول من عمّ صلاح
            </div>
          </div>
        </div>

        {/* Next Challenge Action Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onNextChallenge();
          }}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-amber-500/25 flex items-center justify-center gap-2 text-base transform active:scale-95"
        >
          <span>التحدي والمهمة التالية</span>
          <ArrowRight className="w-5 h-5 rotate-180 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
}
