'use client';

import React from 'react';
import { ShoppingBag, Sparkles, Plus, Check } from 'lucide-react';
import { formatTunisianMoney } from './TunisianCurrency';
import { soundEngine } from './SoundEngine';

export interface Product {
  id: string;
  name: string;
  price: number; // in Millimes
  icon: string;
  category: string;
  unit?: string;
}

export const STORE_PRODUCTS: Product[] = [
  { id: 'baguette', name: 'خبزة باقيت طازجة', price: 200, icon: '🥖', category: 'مخبوزات' },
  { id: 'milk', name: 'علبة حليب نصف دسم', price: 1350, icon: '🥛', category: 'ألبان' },
  { id: 'yogurt', name: 'علبة ياغورت فواكه', price: 450, icon: '🍦', category: 'ألبان' },
  { id: 'cheese', name: 'علبة جبن مثلثات', price: 2500, icon: '🧀', category: 'ألبان' },
  { id: 'tuna', name: 'علبة تن بزيت الزيتون', price: 2200, icon: '🐟', category: 'معلبات' },
  { id: 'eggs', name: 'حارة عظم (4 بيضات)', price: 1400, icon: '🥚', category: 'ألبان' },
  { id: 'water', name: 'قارورة ماء معدني', price: 600, icon: '💧', category: 'مشروبات' },
  { id: 'juice', name: 'عصير برتقال طبيعي', price: 1200, icon: '🧃', category: 'مشروبات' },
  { id: 'apple', name: 'تفاحة حمراء طازجة', price: 500, icon: '🍎', category: 'غلال' },
  { id: 'banana', name: 'موزة طازجة', price: 800, icon: '🍌', category: 'غلال' },
  { id: 'biscuit', name: 'علبة بسكويت محشو', price: 750, icon: '🍪', category: 'حلويات' },
  { id: 'chocolate', name: 'لوح شوكولاتة', price: 900, icon: '🍫', category: 'حلويات' },
  { id: 'notebook', name: 'كراس مدرسي 48 صفحة', price: 1800, icon: '📓', category: 'أدوات' },
  { id: 'pen', name: 'قلم جاف أزرق', price: 350, icon: '🖊️', category: 'أدوات' },
  { id: 'harissa', name: 'حكّة هريسة تونسية', price: 1100, icon: '🌶️', category: 'معلبات' },
  { id: 'olive_oil', name: 'قارورة زيت زيتون بكر', price: 8500, icon: '🫒', category: 'معلبات' },
];

interface ShopShelfProps {
  mode: 'buy' | 'change' | 'budget';
  selectedProducts: Product[];
  onToggleProduct?: (product: Product) => void;
  availableProducts?: Product[];
  budgetLimit?: number;
}

export default function ShopShelf({
  mode,
  selectedProducts,
  onToggleProduct,
  availableProducts = STORE_PRODUCTS,
  budgetLimit = 5000
}: ShopShelfProps) {
  const totalAmount = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 md:p-5 shadow-sm relative">
      
      {/* Shelf Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200/80 dark:border-amber-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base">
              {mode === 'buy' && 'سلة المشتريات المطلوبة 🛒'}
              {mode === 'change' && 'سلعة الحريف والفاتورة 🧾'}
              {mode === 'budget' && 'معرض سلع الدكان (امْلأ القُفّة 🧺)'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {mode === 'budget'
                ? `اختر ما يعجبك بدون تجاوز ميزانية ${formatTunisianMoney(budgetLimit)}`
                : 'احسب مجموع السلع بدقة'}
            </p>
          </div>
        </div>

        {/* Total Price Tag */}
        <div className="bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30 px-3 py-1 rounded-xl text-left shadow-inner">
          <span className="block text-[9px] text-amber-800 dark:text-slate-400 font-bold">مجموع السلع</span>
          <span className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-400">{formatTunisianMoney(totalAmount)}</span>
        </div>
      </div>

      {/* Mode = Buy or Change -> Ordered Items display */}
      {mode !== 'budget' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
          {selectedProducts.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center relative shadow-sm hover:border-purple-300 dark:hover:border-amber-500/40 transition"
            >
              <span className="text-3xl mb-1 filter drop-shadow transform hover:scale-105 transition-transform">
                {product.icon}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px] line-clamp-1">{product.name}</span>
              <span className="text-amber-800 dark:text-amber-300 font-black text-[11px] mt-0.5 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                {formatTunisianMoney(product.price)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Mode = Budget -> Interactive Shelf Selection */
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {availableProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onToggleProduct?.(product);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center relative ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-amber-500/20 border-purple-500 text-purple-900 dark:text-white ring-2 ring-purple-500/30 shadow-sm scale-102'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 hover:bg-white dark:hover:bg-slate-900'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-violet-600 text-white rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <span className="text-2xl mb-0.5">{product.icon}</span>
                  <span className="font-bold text-[11px] line-clamp-1">{product.name}</span>
                  <span className="text-amber-800 dark:text-amber-300 font-bold text-[10px] mt-0.5 bg-amber-50 dark:bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-slate-800">
                    {formatTunisianMoney(product.price)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Selection in Bag */}
          {selectedProducts.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-xs font-bold text-slate-400 shrink-0">في القُفّة:</span>
                {selectedProducts.map((p, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>
              <span className="text-xs font-black text-amber-400 shrink-0">
                {selectedProducts.length} سلع
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
