'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export default function MarkdownRenderer({ content, className = '', isUser = false }: MarkdownRendererProps) {
  return (
    <div className={`markdown-prose ${isUser ? 'markdown-user' : 'markdown-assistant'} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-black mt-3 mb-1.5 leading-snug">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-black mt-2.5 mb-1 leading-snug">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-black mt-2 mb-1 leading-snug">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-xs font-bold leading-relaxed mb-1.5 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-0.5 text-xs font-bold mb-2 mr-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-0.5 text-xs font-bold mb-2 mr-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-black">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isUser
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                }`}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`block p-3 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto my-2 ${
                isUser
                  ? 'bg-white/10 text-white/90 border border-white/10'
                  : 'bg-slate-50 text-slate-800 border border-slate-200'
              }`}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className={`border-r-3 pr-3 my-2 text-xs italic ${
              isUser
                ? 'border-white/30 text-white/80'
                : 'border-purple-300 text-slate-600 bg-purple-50/30 rounded-lg p-2'
            }`}>
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-xl border border-slate-200">
              <table className="min-w-full text-[10px] font-bold">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-purple-50 text-purple-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 text-start font-black border-b border-slate-200">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 border-b border-slate-100">{children}</td>
          ),
          hr: () => (
            <hr className={`my-3 ${isUser ? 'border-white/20' : 'border-slate-200'}`} />
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-purple-600 hover:text-purple-800">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
