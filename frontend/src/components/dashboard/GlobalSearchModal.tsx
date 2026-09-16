'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, BookOpen, Users, UserCheck, Megaphone, X } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
}

export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch<{ results: SearchResultItem[] }>(
          `/admin/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.success && res.data) {
          setResults(res.data.results || []);
        }
      } catch {
        // Non-blocking
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Student':
        return <Users className="w-4 h-4 text-brand-500" />;
      case 'Teacher':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      case 'Course':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'Announcement':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Quick search...</span>
        <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, faculty, courses, announcements..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden"
              />
              {loading ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim().length >= 2 && results.length === 0 && !loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matches found for &quot;{query}&quot;
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => handleSelect(item.url)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {getIcon(item.type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Type at least 2 characters to search across university entities.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
