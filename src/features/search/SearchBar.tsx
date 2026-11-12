import { ArrowRight, BookOpen, Layers, Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Badge, Kbd } from '@/shared/ui';
import { searchContent } from './search-content';

export interface SearchBarProps {
  readonly placeholder?: string;
  readonly className?: string;
}

export function SearchBar({
  placeholder = 'Tìm kiếm môn học, chương, định nghĩa nhóm, quy tắc Chasles...',
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const navigate = useNavigate();

  const results = useMemo(() => searchContent(query), [query]);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const firstResult = results[0];
    if (firstResult) {
      setIsOpen(false);
      void navigate(firstResult.href);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} role="search" aria-label="Tìm kiếm nội dung học tập">
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-4 h-4 w-4 text-stone-400"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            aria-label="Tìm kiếm môn học hoặc bài học"
            aria-expanded={isOpen && hasQuery}
            aria-controls={listboxId}
            className="h-12 w-full rounded-2xl border border-stone-200/90 bg-white pr-20 pl-11 text-sm text-stone-900 shadow-2xs transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {hasQuery ? (
              <button
                type="button"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Kbd className="hidden sm:inline-flex">/</Kbd>
            )}
          </div>
        </div>
      </form>

      {isOpen && hasQuery && (
        <div
          id={listboxId}
          role="region"
          aria-label="Kết quả tìm kiếm"
          className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-lg"
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {results.map((result) => {
                if (result.kind === 'subject') {
                  return (
                    <li key={`subject-${result.subject.id}`}>
                      <Link
                        to={result.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-stone-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                            <Layers className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-stone-900">
                                {result.subject.title}
                              </span>
                              <Badge variant="neutral">Môn học</Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500">
                              {result.subject.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-stone-400"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={`lesson-${result.lesson.id}`}>
                    <Link
                      to={result.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-stone-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-stone-900">
                              Bài {result.chapter.number}.{result.lesson.number}:{' '}
                              {result.lesson.title}
                            </span>
                            <Badge variant="neutral">{result.subject.title}</Badge>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
                            {result.lesson.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-stone-500">
              Không tìm thấy môn học hoặc bài học nào khớp với{' '}
              <strong className="font-medium text-stone-800">&ldquo;{query}&rdquo;</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
