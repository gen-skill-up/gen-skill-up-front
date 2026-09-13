'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Conversation {
  id: string;
  createdAt: number;
  label: string;
}

interface ConversationTabsProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  dir: string;
  lang: string;
}

export default function ConversationTabs({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
  dir,
  lang,
}: ConversationTabsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const useDropdownMode = conversations.length > 3;

  return (
    <div className="flex items-center justify-between gap-2 px-5 py-2 bg-slate-50/70 border-b border-slate-100/80 shrink-0">
      {/* Tab Switcher: If few, show pills; if many, show dropdown + pills */}
      {!useDropdownMode ? (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {conversations.map((conv, idx) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/60'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>{conv.label || `${lang === 'ar' ? 'محادثة' : 'Chat'} ${idx + 1}`}</span>
                {conversations.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className={`p-0.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                      isActive
                        ? 'hover:bg-white/20 text-white/80 hover:text-white'
                        : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                    }`}
                    title={lang === 'ar' ? 'حذف المحادثة' : 'Delete chat'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Dropdown Mode for many conversations */
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-purple-300 rounded-xl text-xs font-black text-slate-800 shadow-2xs cursor-pointer transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
            <span>
              {activeConv?.label ||
                `${lang === 'ar' ? 'المحادثة الحالية' : 'Active Chat'}`}
            </span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
              {conversations.findIndex((c) => c.id === activeConversationId) + 1}/
              {conversations.length}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                dropdownOpen ? 'rotate-180 text-purple-600' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`absolute z-40 mt-1.5 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl p-1.5 ${
                  dir === 'rtl' ? 'right-0' : 'left-0'
                }`}
              >
                <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'سجل المحادثات' : 'Conversations'}
                </div>
                <div className="py-1 max-h-48 overflow-y-auto space-y-0.5">
                  {conversations.map((conv, idx) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          onSelect(conv.id);
                          setDropdownOpen(false);
                        }}
                        className={`group flex items-center justify-between p-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                          isActive
                            ? 'bg-purple-50 text-purple-700 font-black'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {conv.label || `${lang === 'ar' ? 'محادثة' : 'Chat'} ${idx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isActive && <Check className="w-3.5 h-3.5 text-purple-600" />}
                          {conversations.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(conv.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* New Conversation Button */}
      <button
        type="button"
        onClick={onNew}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-purple-50/80 hover:bg-purple-100 text-purple-700 border border-purple-200/60 cursor-pointer transition-all shrink-0 active:scale-95"
        title={lang === 'ar' ? 'بدء محادثة جديدة مع أنيس' : 'New chat'}
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{lang === 'ar' ? 'محادثة جديدة' : 'New Chat'}</span>
      </button>
    </div>
  );
}
