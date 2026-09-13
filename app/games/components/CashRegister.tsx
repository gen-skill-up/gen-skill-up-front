'use client';

import React from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, Sparkles, Coins } from 'lucide-react';
import { formatTunisianMoney, CurrencyItem, CurrencyItemCard } from './TunisianCurrency';
import { soundEngine } from './SoundEngine';

interface CashRegisterProps {
  mode: 'buy' | 'change' | 'budget';
  targetAmount: number; // in Millimes (Target to pay or required change)
  customerPaidAmount?: number; // for change mode
  placedItems: CurrencyItem[];
  onRemoveItem: (index: number) => void;
  onClear: () => void;
  onVerify: () => void;
  isVerifying?: boolean;
}

export default function CashRegister({
  mode,
  targetAmount,
  customerPaidAmount = 0,
  placedItems,
  onRemoveItem,
  onClear,
  onVerify,
  isVerifying = false
}: CashRegisterProps) {
  const currentTotal = placedItems.reduce((acc, item) => acc + item.value, 0);
  const diff = currentTotal - targetAmount;

  // Group items for nice count stacking
  const groupedItems = placedItems.reduce<Record<string, { item: CurrencyItem; count: number; indices: number[] }>>(
    (acc, item, index) => {
      if (!acc[item.id]) {
        acc[item.id] = { item, count: 0, indices: [] };
      }
      acc[item.id].count += 1;
      acc[item.id].indices.push(index);
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 md:p-5 shadow-sm relative overflow-hidden">
      
      {/* Top Register Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span className="text-[11px] font-black tracking-wider text-slate-800 dark:text-amber-400 mr-2 uppercase">
            CASIO-TUNISIA TM-2026 • الكاسة الذكية
          </span>
        </div>

        <div className="text-[10px] font-mono bg-emerald-50 dark:bg-slate-950 px-2.5 py-0.5 rounded-full text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold">
          ● ONLINE CASHIER
        </div>
      </div>

      {/* Illuminated Retro LCD Screen */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-inner mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
          
          {/* Box 1: Required Amount */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-xl p-2 shadow-sm">
            <span className="block text-[10px] text-amber-800 dark:text-amber-300 font-bold mb-0.5">
              {mode === 'buy' ? 'المطلوب دفعه 🏷️' : mode === 'change' ? 'الباقي المطلوب 🔄' : 'الميزانية 🎯'}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-400 font-mono tracking-tight">
              {formatTunisianMoney(targetAmount)}
            </span>
          </div>

          {/* Box 2: If Change Mode, Show Customer Note */}
          {mode === 'change' && (
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl p-2 shadow-sm">
              <span className="block text-[10px] text-blue-800 dark:text-blue-300 font-bold mb-0.5">
                مدفوع الحريف 💵
              </span>
              <span className="text-base sm:text-lg font-black text-blue-700 dark:text-blue-300 font-mono">
                {formatTunisianMoney(customerPaidAmount)}
              </span>
            </div>
          )}

          {/* Box 3: Placed Amount on Counter */}
          <div className={`border rounded-xl p-2 shadow-sm ${
            diff === 0 && currentTotal > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500 ring-2 ring-emerald-500/20'
              : diff > 0
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">
              الموضوع في الكاسة 🪙
            </span>
            <span className={`text-base sm:text-lg font-black font-mono ${
              diff === 0 && currentTotal > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-white'
            }`}>
              {formatTunisianMoney(currentTotal)}
            </span>
          </div>

          {/* Difference Indicator */}
          {mode !== 'change' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex items-center justify-center sm:col-span-1 shadow-sm">
              <span className="text-[11px] font-bold">
                {diff === 0 && currentTotal > 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> مضبوط تماماً!
                  </span>
                ) : diff < 0 ? (
                  <span className="text-rose-600 dark:text-rose-400">ينقص: {formatTunisianMoney(Math.abs(diff))}</span>
                ) : diff > 0 ? (
                  <span className="text-amber-700 dark:text-amber-400">زيادة: {formatTunisianMoney(diff)}</span>
                ) : (
                  <span className="text-slate-400">في انتظار وضع النقود</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cash Counter Surface (Drop Tray) */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>طاولة الكاسة:</span>
          </span>
          {placedItems.length > 0 && (
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">
              (انقر على أي قطعة لإرجاعها)
            </span>
          )}
        </div>

        <div className="min-h-[88px] sm:min-h-[105px] max-h-[140px] overflow-y-auto bg-slate-50/80 dark:bg-slate-950/80 border-2 border-dashed border-amber-300 dark:border-amber-500/40 rounded-2xl p-2.5 flex flex-wrap gap-2.5 items-center justify-center relative transition-all shadow-inner">
          {placedItems.length === 0 ? (
            <div className="text-center py-3">
              <span className="text-2xl block mb-1 opacity-70">🪙</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                طاولة الكاسة فارغة! انقر على العملات من المحفظة أدناه لوضعها هنا.
              </p>
            </div>
          ) : (
            Object.values(groupedItems).map(({ item, count, indices }) => (
              <div key={item.id} className="relative group">
                <CurrencyItemCard
                  item={item}
                  size="sm"
                  count={count}
                  onClick={() => {
                    soundEngine.playClick();
                    onRemoveItem(indices[indices.length - 1]);
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            soundEngine.playClick();
            onClear();
          }}
          disabled={placedItems.length === 0}
          className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 text-xs font-bold shadow-sm"
          title="تفريغ طاولة الكاسة"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إفراغ</span>
        </button>

        <button
          onClick={onVerify}
          disabled={isVerifying || placedItems.length === 0}
          className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>تأكيد العملية وتسجيل الفاتورة 🚀</span>
        </button>
      </div>

    </div>
  );
}
