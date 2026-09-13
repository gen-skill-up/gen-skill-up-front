'use client';

import { useState } from 'react';
import { Check, X, FileEdit, Eye, Sparkles, RotateCcw, Code } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface EditorModeProps {
  lessonTitle: string;
  currentMarkdown: string;
  proposedMarkdown: string | null;
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
  dir: string;
  lang: string;
}

/**
 * Compute line-based diff between two text blocks.
 */
function computeLineDiff(oldText: string, newText: string) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const diffItems: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diffItems.unshift({ type: 'same', text: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffItems.unshift({ type: 'added', text: newLines[j - 1] });
      j--;
    } else {
      diffItems.unshift({ type: 'removed', text: oldLines[i - 1] });
      i--;
    }
  }

  return diffItems;
}

export default function EditorMode({
  lessonTitle,
  currentMarkdown,
  proposedMarkdown,
  onApprove,
  onReject,
  onReset,
  dir,
  lang,
}: EditorModeProps) {
  const [displayMode, setDisplayMode] = useState<'diff' | 'preview'>('diff');

  const diffItems = proposedMarkdown ? computeLineDiff(currentMarkdown, proposedMarkdown) : [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Top Document Header */}
      <div className="bg-slate-50/90 border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-2xs">
            <FileEdit className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800">{lessonTitle}</h3>
            <p className="text-[10px] font-bold text-slate-400">
              {lang === 'ar' ? 'وثيقة الدرس مع التعديلات المقترحة' : 'Lesson document & live diffs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {proposedMarkdown && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setDisplayMode('diff')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                  displayMode === 'diff'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>{lang === 'ar' ? 'الفروقات (Diff)' : 'Diff View'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                  displayMode === 'preview'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{lang === 'ar' ? 'المعاينة' : 'Preview'}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
            title={lang === 'ar' ? 'إعادة تعيين التعديلات' : 'Reset'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'ar' ? 'إعادة تعيين' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Proposed Changes Banner (Approve / Reject Actions) */}
      {proposedMarkdown && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black flex items-center gap-1.5">
                <span>{lang === 'ar' ? 'تعديل مقترح من أنيس المعلم الذكي 🦉' : 'Proposed changes by Anis 🦉'}</span>
              </h4>
              <p className="text-[10px] text-purple-200 font-bold mt-0.5">
                {lang === 'ar' ? 'راجع الفروقات ثم اختر موافقة أو رفض للتطبيق على وثيقة الدرس' : 'Review diff lines then choose Approve or Reject.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onApprove}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md border-b-2 border-emerald-700 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'موافق على التعديل' : 'Approve'}</span>
            </button>
            <button
              type="button"
              onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 cursor-pointer transition-all active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'رفض' : 'Reject'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Document View Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        {proposedMarkdown && displayMode === 'diff' ? (
          /* Diff Display */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" />
                <span>{lang === 'ar' ? 'سطور الفروقات والتعقبات:' : 'Line Diff Breakdown:'}</span>
              </div>
              <div className="flex gap-2.5 text-[10px]">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-black border border-emerald-200">+ إضافات</span>
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-black border border-rose-200">- محذوفات</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {diffItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`px-5 py-2 font-mono text-xs leading-relaxed ${
                    item.type === 'added'
                      ? 'bg-emerald-50/90 text-emerald-950 border-r-4 border-emerald-500 font-bold'
                      : item.type === 'removed'
                      ? 'bg-rose-50/90 text-rose-900 border-r-4 border-rose-400 line-through opacity-80'
                      : 'text-slate-700'
                  }`}
                  style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr', textAlign: dir === 'rtl' ? 'right' : 'left' }}
                >
                  <span className="inline-block w-6 text-center mr-2 text-[10px] font-black opacity-50">
                    {item.type === 'added' ? '+' : item.type === 'removed' ? '−' : ' '}
                  </span>
                  {item.text || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Full Document Preview */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-4xl mx-auto">
            <h2 className="text-lg font-black text-slate-800 mb-6 pb-4 border-b border-slate-100">
              {lessonTitle}
            </h2>
            <div style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
              <MarkdownRenderer content={proposedMarkdown || currentMarkdown} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
