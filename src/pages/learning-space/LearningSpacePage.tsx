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
import { LearningSpaceHeroCanvas } from '@/components/home/LearningSpaceHeroCanvas';
import { LearningSpaceHub } from '@/components/home/LearningSpaceHub';
import { getSubjects, getSubjectStats } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { searchContent } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Kbd } from '@/shared/ui';

/**
 * Trang Không Gian Học Tập (/learning-space):
 * Trung tâm học thuật tách biệt khỏi Trang chủ phong cảnh, tập hợp:
 * - Hero Sanctuary Tân Cổ Điển (Royal Indigo #10212E -> #233E4F + Đèn hổ phách & Thiên cầu Armillary 3D 120fps)
 * - Không gian Học phần (Spatial Subject Atlas 2x2 với Canvas 120fps)
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
        ACADEMIC SANCTUARY BANNER (Chàm Hoàng Gia & Hoàng Kim Tân Cổ Điển)
        ================================================================= */}
      <section
        aria-label="Không gian Học tập & Nghiên cứu"
        className="relative pt-24 pb-4 sm:pt-28"
      >
        <div className="lu-container-wide">
          <div
            style={{
              background: 'linear-gradient(130deg, #10212E 0%, #183142 55%, #233E4F 100%)',
            }}
            className="relative min-h-[380px] rounded-3xl border border-[#C89D54]/35 px-6 py-8 text-[#FAF6EE] shadow-[0_20px_60px_rgba(16,32,48,0.12)] sm:px-10 sm:py-10"
          >
            {/* Lớp nền đồ họa (Bo tròn gọn, không tràn ra ngoài thẻ) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl select-none"
            >
              {/* Tia sáng hổ phách dịu tỏa từ Thiên cầu */}
              <div
                className="absolute -top-24 right-0 h-[420px] w-[520px] opacity-60"
                style={{
                  background:
                    'radial-gradient(circle at 68% 42%, rgba(229, 184, 91, 0.20) 0%, rgba(56, 189, 248, 0.08) 42%, transparent 72%)',
                }}
              />
              {/* Hệ tọa độ cực Đông Sơn & đường kẻ lưới vàng mờ */}
              <svg className="h-full w-full opacity-[0.11]">
                <defs>
                  <pattern id={gridPatternId} width="56" height="56" patternUnits="userSpaceOnUse">
                    <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#D4A853" strokeWidth="0.6" />
                    <circle cx="56" cy="56" r="1.2" fill="#E5B85B" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
                <circle
                  cx="78%"
                  cy="50%"
                  r="190"
                  fill="none"
                  stroke="#E5B85B"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                />
                <circle cx="78%" cy="50%" r="260" fill="none" stroke="#D4A853" strokeWidth="0.6" />
              </svg>
            </div>

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                {/* Breadcrumb & Eyebrow */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#C8D6DE]">
                  <Link to={ROUTES.home} className="transition-colors hover:text-[#FAF6EE]">
                    Trang chủ
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold text-[#E5B85B]">Không gian học tập</span>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A853]/35 bg-white/10 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#F7E3B5] uppercase backdrop-blur-sm">
                    <Compass className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
                    <span>ACADEMIC SANCTUARY · HỆ THỐNG HỌC PHẦN &amp; NGHIÊN CỨU</span>
                  </div>

                  <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#FAF6EE] sm:text-4xl lg:text-5xl">
                    Không Gian Học Tập &amp; Nghiên Cứu
                  </h1>

                  <p className="max-w-2xl text-sm leading-relaxed text-[#D8E2E7] sm:text-base">
                    Toàn bộ kho tàng học phần Toán học và Khoa học Giáo dục, tra cứu ký hiệu KaTeX,
                    phòng mô phỏng hình học 3D và quỹ đạo tiến độ học tập cá nhân được tổ chức khoa
                    học tại đây.
                  </p>
                </div>

                {/* Thống kê nhanh độ tương phản cao viền vàng */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4A853]/30 bg-white/10 px-3.5 py-1.5 font-mono font-semibold text-[#FAF6EE] backdrop-blur-sm">
                    <Layers className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
                    <span>{String(subjects.length).padStart(2, '0')} học phần cốt lõi</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4A853]/30 bg-white/10 px-3.5 py-1.5 font-mono font-semibold text-[#FAF6EE] backdrop-blur-sm">
                    <BookOpen className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
                    <span>
                      {totalChapterCount} chương · {totalLessonCount} bài giảng
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5B85B]/45 bg-[#E5B85B]/15 px-3.5 py-1.5 font-mono font-semibold text-[#FBE6B2] backdrop-blur-sm">
                    <GraduationCap className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
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
                    <div className="relative flex h-12 w-full items-center rounded-2xl border border-[#D4A853]/40 bg-[#FAF6EE] px-4 text-sm text-[#142834] shadow-[0_12px_30px_rgba(6,14,22,0.28)] transition-all focus-within:border-[#E5B85B] focus-within:ring-2 focus-within:ring-[#E5B85B]/40">
                      <Search className="mr-3 h-4 w-4 shrink-0 text-[#6B5428]" aria-hidden="true" />
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
                        className="w-full bg-transparent text-sm text-[#142834] placeholder:text-[#5C6E7C] focus:outline-none"
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
                            className="rounded-lg p-1 text-[#5C6E7C] transition-colors hover:bg-[#EFE8D8] hover:text-[#142834]"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <Kbd className="hidden border-[#C89D54]/30 bg-[#EFE8D8] px-2 py-0.5 text-[11px] text-[#6B5428] sm:inline-flex">
                            /
                          </Kbd>
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
                      className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#C89D54]/30 bg-[var(--bg-surface)] p-2 shadow-2xl"
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
                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142834]/10 text-[#142834] dark:bg-[#183142] dark:text-[#E5B85B]">
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
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142834]/10 text-[#142834] dark:bg-[#183142] dark:text-[#E5B85B]">
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

              {/* Cột Phải Banner (5 cột): Sân khấu Canvas 2D 120fps Thiên cầu Armillary 3D */}
              <div className="hidden flex-col items-center justify-center lg:col-span-5 lg:flex">
                <div className="relative w-full max-w-[340px] rounded-2xl border border-[#D4A853]/25 bg-[#0C1924]/55 p-3 shadow-inner backdrop-blur-sm">
                  <LearningSpaceHeroCanvas />
                  <div className="pointer-events-none mx-auto mt-1 flex w-fit items-center gap-1.5 rounded-full border border-[#D4A853]/40 bg-[#10212E]/90 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#F7E3B5] shadow-xs">
                    <Sparkles className="h-3 w-3 text-[#E5B85B]" aria-hidden="true" />
                    <span>CELESTIAL GEOMETRY · KHUÊ VĂN</span>
                  </div>
                </div>
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
