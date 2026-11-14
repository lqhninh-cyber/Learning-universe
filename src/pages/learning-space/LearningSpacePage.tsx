import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TopographicWaterlinesBackdrop } from '@/components/home/HomeScrollTransitions';
import { LearningSpaceHub } from '@/components/home/LearningSpaceHub';
import { getSubjects, getSubjectStats } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { searchContent } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta } from '@/shared/lib/canvasSprites';
import { Badge, Kbd } from '@/shared/ui';

/**
 * Biểu tượng vòng tròn thiên văn & hình học bằng đồng vàng chuyển động 120fps
 * ở góc phải của Academic Sanctuary Banner.
 */
function CelestialBronzeRingsArtwork() {
  const prefersReducedMotion = useReducedMotion();
  const outerRingRef = useRef<SVGGElement>(null);
  const innerRingRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;
    let angle = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, lastNow);
      lastNow = now;
      angle = (angle + dtSeconds * 8.5) % 360;

      if (outerRingRef.current) {
        outerRingRef.current.setAttribute('transform', `rotate(${angle.toFixed(2)} 160 160)`);
      }
      if (innerRingRef.current) {
        innerRingRef.current.setAttribute(
          'transform',
          `rotate(${(-angle * 1.45).toFixed(2)} 160 160)`,
        );
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  return (
    <svg
      data-testid="learning-space-celestial-rings"
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="pointer-events-none h-56 w-56 select-none sm:h-64 sm:w-64 lg:h-72 lg:w-72"
    >
      <circle
        cx="160"
        cy="160"
        r="142"
        fill="none"
        stroke="#C9A45C"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
      <g ref={outerRingRef}>
        <circle
          cx="160"
          cy="160"
          r="126"
          fill="none"
          stroke="#C9A45C"
          strokeOpacity="0.48"
          strokeWidth="1.2"
          strokeDasharray="6 6"
        />
        <polygon
          points="160,34 269,97 269,223 160,286 51,223 51,97"
          fill="none"
          stroke="#1B3D2F"
          strokeOpacity="0.2"
          strokeWidth="1.15"
        />
        <circle cx="160" cy="34" r="4" fill="#C9A45C" />
        <circle cx="269" cy="223" r="3.5" fill="#1B3D2F" fillOpacity="0.6" />
        <circle cx="51" cy="223" r="3.5" fill="#1B3D2F" fillOpacity="0.6" />
      </g>

      <g ref={innerRingRef}>
        <circle
          cx="160"
          cy="160"
          r="86"
          fill="none"
          stroke="#1B3D2F"
          strokeOpacity="0.28"
          strokeWidth="1.15"
          strokeDasharray="16 5"
        />
        <rect
          x="99"
          y="99"
          width="122"
          height="122"
          fill="none"
          stroke="#C9A45C"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <circle cx="160" cy="74" r="3" fill="#C9A45C" />
        <circle cx="246" cy="160" r="3" fill="#1B3D2F" fillOpacity="0.55" />
      </g>

      {/* Ngôi sao Khuê Văn 8 cánh ở tâm */}
      <path
        d="M160 116 L170 147 L201 137 L176 157 L206 160 L176 163 L201 183 L170 173 L160 204 L150 173 L119 183 L144 163 L114 160 L144 157 L119 137 L150 147 Z"
        fill="#C9A45C"
        fillOpacity="0.25"
        stroke="#C9A45C"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="160" cy="160" r="5" fill="#1B3D2F" />
    </svg>
  );
}

/**
 * Trang Không Gian Học Tập (/learning-space):
 * Trung tâm học thuật tách biệt khỏi Trang chủ phong cảnh, tập hợp:
 * - Academic Sanctuary Banner (Giấy dó Ngà Ấm #F6F3EB + Ngọc Khuê Văn #1B3D2F + Tìm kiếm nhanh tích hợp)
 * - Không gian Học phần (Spatial Subject Gallery / Văn khố Thư mục)
 * - Tiếp tục học tập (Quỹ đạo học tập cá nhân, KaTeX Lexicon Drawer, Phòng Lab 3D)
 */
export function LearningSpacePage() {
  const subjects = getSubjects();
  const navigate = useNavigate();
  const searchListboxId = useId();
  const gridPatternId = useId().replace(/:/g, '');
  const completedLessons = useLearningStore((state) => state.completedLessons);

  const [hubQuery, setHubQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'Escape') {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const totalChapterCount = subjects.reduce(
    (sum, sub) => sum + getSubjectStats(sub).chapterCount,
    0,
  );
  const totalLessonCount = subjects.reduce((sum, sub) => sum + getSubjectStats(sub).lessonCount, 0);
  const completedCount = Object.keys(completedLessons).length;
  const computedPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;
  const displayOrbitPercent = completedCount > 0 ? Math.max(computedPercent, 1) : 8;

  const instantSearchResults = useMemo(() => searchContent(hubQuery), [hubQuery]);
  const hasSearchQuery = hubQuery.trim().length > 0;

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const firstResult = instantSearchResults[0];
    if (firstResult) {
      setIsSearchDropdownOpen(false);
      void navigate(firstResult.href);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* =================================================================
        ACADEMIC SANCTUARY BANNER (Giấy Dó Ngà Ấm #F6F3EB & Ngọc Khuê Văn #1B3D2F)
        ================================================================= */}
      <section
        aria-label="Không gian Học tập & Nghiên cứu"
        className="relative overflow-hidden border-b border-[#C9A45C]/30 bg-[#F6F3EB] pt-28 pb-12 text-[#142B21] sm:pt-32 sm:pb-14 dark:bg-[#0B1914] dark:text-[#F5F2EB]"
      >
        {/* Họa tiết lưới tọa độ Đông Sơn mờ nhẹ */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] select-none"
        >
          <defs>
            <pattern id={gridPatternId} width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1B3D2F" strokeWidth="0.8" />
              <circle cx="48" cy="48" r="1.5" fill="#C9A45C" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
        </svg>

        <div className="lu-container-wide relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {/* Breadcrumb & Eyebrow */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#365E4E] dark:text-[#8EE5CE]">
              <Link to={ROUTES.home} className="hover:underline">
                Trang chủ
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#1B3D2F] dark:text-[#E5C158]">
                Không gian học tập
              </span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1B3D2F]/20 bg-white/75 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#1B3D2F] uppercase shadow-2xs backdrop-blur-sm dark:border-[#C9A45C]/30 dark:bg-[#122620]/80 dark:text-[#E5C158]">
                <Compass className="h-3.5 w-3.5 text-[#C9A45C]" aria-hidden="true" />
                <span>ACADEMIC SANCTUARY · HỆ THỐNG HỌC PHẦN &amp; NGHIÊN CỨU</span>
              </div>

              <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#142B21] sm:text-4xl lg:text-5xl dark:text-[#F7F3E8]">
                Không Gian Học Tập &amp; Nghiên Cứu
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-[#3F5148] sm:text-base dark:text-[#CBD5CE]">
                Toàn bộ kho tàng học phần Toán học và Khoa học Giáo dục, tra cứu ký hiệu KaTeX,
                phòng mô phỏng hình học 3D và quỹ đạo tiến độ học tập cá nhân được tổ chức khoa học
                tại đây.
              </p>
            </div>

            {/* Thống kê nhanh */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#1B3D2F]/18 bg-white/80 px-3 py-1.5 font-mono font-semibold text-[#1B3D2F] shadow-2xs dark:border-[#4E9B58]/30 dark:bg-[#122620] dark:text-[#A6E3CD]">
                <Layers className="h-3.5 w-3.5 text-[#C9A45C]" aria-hidden="true" />
                <span>{String(subjects.length).padStart(2, '0')} học phần cốt lõi</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#1B3D2F]/18 bg-white/80 px-3 py-1.5 font-mono font-semibold text-[#1B3D2F] shadow-2xs dark:border-[#4E9B58]/30 dark:bg-[#122620] dark:text-[#A6E3CD]">
                <BookOpen className="h-3.5 w-3.5 text-[#C9A45C]" aria-hidden="true" />
                <span>
                  {totalChapterCount} chương · {totalLessonCount} bài giảng
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9A45C]/35 bg-[#C9A45C]/12 px-3 py-1.5 font-mono font-semibold text-[#7A5915] dark:text-[#E5C158]">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tiến độ cá nhân: {displayOrbitPercent}%</span>
              </span>
            </div>

            {/* Thanh tìm kiếm thông minh tích hợp ngay trong Banner */}
            <div ref={searchContainerRef} className="relative max-w-2xl">
              <form
                onSubmit={handleSearchSubmit}
                role="search"
                aria-label="Tìm kiếm nội dung học tập"
              >
                <div className="relative flex h-12 w-full items-center rounded-2xl border border-[#1B3D2F]/20 bg-white/95 px-4 text-sm text-[#142B21] shadow-sm transition-all focus-within:border-[#1B3D2F] focus-within:ring-2 focus-within:ring-[#1B3D2F]/15 dark:border-[#4E9B58]/35 dark:bg-[#0E1E18] dark:text-[#F7F3E8]">
                  <Search
                    className="mr-3 h-4 w-4 shrink-0 text-[#55676B] dark:text-[#A7B5AC]"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={hubQuery}
                    onChange={(event) => {
                      setHubQuery(event.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    placeholder="Tìm nhanh môn học, chương, định lý hoặc bài giảng (vd: Cayley, Chasles)..."
                    aria-label="Tìm kiếm môn học hoặc bài học"
                    aria-expanded={isSearchDropdownOpen && hasSearchQuery}
                    aria-controls={searchListboxId}
                    className="w-full bg-transparent text-sm text-[#142B21] placeholder:text-[#55676B] focus:outline-none dark:text-[#F7F3E8] dark:placeholder:text-[#94A89D]"
                  />
                  <div className="flex shrink-0 items-center gap-1.5 pl-2">
                    {hasSearchQuery ? (
                      <button
                        type="button"
                        aria-label="Xóa từ khóa tìm kiếm"
                        onClick={() => {
                          setHubQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="rounded-lg p-1 text-[#55676B] transition-colors hover:bg-[#EBECE6] hover:text-[#142B21] dark:text-[#A7B5AC] dark:hover:bg-white/10"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <Kbd className="hidden px-2 py-0.5 text-[11px] sm:inline-flex">/</Kbd>
                    )}
                  </div>
                </div>
              </form>

              {/* Popover kết quả tìm kiếm tức thời */}
              {isSearchDropdownOpen && hasSearchQuery && (
                <div
                  id={searchListboxId}
                  role="region"
                  aria-label="Kết quả tìm kiếm"
                  className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-xl"
                >
                  {instantSearchResults.length > 0 ? (
                    <ul className="divide-y divide-[var(--border-subtle)]/60">
                      {instantSearchResults.map((result) => {
                        if (result.kind === 'subject') {
                          return (
                            <li key={`subject-${result.subject.id}`}>
                              <Link
                                to={result.href}
                                onClick={() => setIsSearchDropdownOpen(false)}
                                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[var(--bg-sunken)]"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBECE6] text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                                    <Layers className="h-4 w-4" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-[var(--text-main)]">
                                        {result.subject.title}
                                      </span>
                                      <Badge variant="neutral">Môn học</Badge>
                                    </div>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                                      {result.subject.description}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight
                                  className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
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
                              onClick={() => setIsSearchDropdownOpen(false)}
                              className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[var(--bg-sunken)]"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBECE6] text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-[var(--text-main)]">
                                      Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                      {result.lesson.title}
                                    </span>
                                    <Badge variant="neutral">{result.subject.title}</Badge>
                                  </div>
                                  <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                                    {result.lesson.description}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                                aria-hidden="true"
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                      Không tìm thấy môn học hoặc bài học nào khớp với{' '}
                      <strong className="font-semibold text-[var(--text-main)]">
                        &ldquo;{hubQuery}&rdquo;
                      </strong>
                      .
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải Banner: Vòng tròn Thiên văn – Hình học Đồng vàng 120fps */}
          <div className="hidden items-center justify-center lg:flex">
            <div className="relative flex items-center justify-center rounded-full border border-[#C9A45C]/25 bg-white/40 p-4 shadow-inner backdrop-blur-xs dark:bg-[#0D211A]/50">
              <CelestialBronzeRingsArtwork />
              <div className="pointer-events-none absolute -bottom-2 inline-flex items-center gap-1.5 rounded-full border border-[#C9A45C]/40 bg-[#F6F3EB] px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#1B3D2F] shadow-xs dark:bg-[#10241C] dark:text-[#E5C158]">
                <Sparkles className="h-3 w-3 text-[#C9A45C]" aria-hidden="true" />
                <span>CELESTIAL GEOMETRY · KHUÊ VĂN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Đường đồng mức nước chìm & Nội dung Không gian Học phần + Tiếp tục học tập */}
      <div className="relative bg-[var(--bg-page)]">
        <TopographicWaterlinesBackdrop />
        <LearningSpaceHub hubQuery={hubQuery} onResetQuery={() => setHubQuery('')} />
      </div>
    </div>
  );
}

export default LearningSpacePage;
