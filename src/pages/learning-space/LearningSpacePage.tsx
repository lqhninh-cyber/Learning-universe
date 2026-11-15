import { ArrowRight, BookOpen, Compass, GraduationCap, Layers, Search, X } from 'lucide-react';
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
 * Hệ màu "Bạch Ngọc Khoáng Thạch & Trắng Sứ Dịu" (Balanced Mineral & Soft Porcelain):
 * - Nền trang: #F2F4F3 | Bề mặt: #FAFBF9 | Mực chữ: #182624
 * - Hero Banner Sương Ngọc Khoáng Thạch Dịu (#EBF0EE -> #E2EAE7 -> #E8ECE8) cùng Thiên cầu Đa diện 120fps
 * - Không gian Học phần (Spatial Subject Atlas 2x2 với 4 khung Bảng màu Khoáng thạch Tự nhiên)
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
    <div className="relative min-h-screen overflow-x-clip bg-[#F2F4F3] text-[#182624]">
      {/* =================================================================
        HERO BANNER SƯƠNG NGỌC KHOÁNG THẠCH DỊU (Balanced Mineral Mist)
        ================================================================= */}
      <section
        aria-label="Không gian Học tập & Nghiên cứu"
        className="relative pt-24 pb-4 sm:pt-28"
      >
        <div className="lu-container-wide">
          <div
            style={{
              background: 'linear-gradient(135deg, #EBF0EE 0%, #E2EAE7 55%, #E8ECE8 100%)',
            }}
            className="relative min-h-[380px] overflow-hidden rounded-3xl border border-[#CBD6D2] p-8 text-[#162623] shadow-[0_10px_32px_rgba(24,38,36,0.05)] lg:p-11"
          >
            {/* Họa tiết lưới hình học khoáng thạch cực mờ */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl select-none"
            >
              <svg className="h-full w-full">
                <defs>
                  <pattern id={gridPatternId} width="56" height="56" patternUnits="userSpaceOnUse">
                    <path
                      d="M 56 0 L 0 0 0 56"
                      fill="none"
                      stroke="#243E38"
                      strokeOpacity="0.045"
                      strokeWidth="0.7"
                    />
                    <circle cx="56" cy="56" r="1.15" fill="#243E38" fillOpacity="0.055" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
                <circle
                  cx="78%"
                  cy="50%"
                  r="195"
                  fill="none"
                  stroke="#243E38"
                  strokeOpacity="0.055"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="78%"
                  cy="50%"
                  r="265"
                  fill="none"
                  stroke="#3B6275"
                  strokeOpacity="0.045"
                  strokeWidth="0.7"
                />
              </svg>
            </div>

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#4A5D58]">
                  <Link to={ROUTES.home} className="transition-colors hover:text-[#182624]">
                    Trang chủ
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold text-[#1E332E]">Không gian học tập</span>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#1E332E] uppercase">
                    <Compass className="h-3.5 w-3.5 text-[#243E38]" aria-hidden="true" />
                    <span>ACADEMIC SANCTUARY · HỆ THỐNG HỌC PHẦN &amp; NGHIÊN CỨU</span>
                  </div>

                  <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#162623] sm:text-4xl lg:text-5xl">
                    Không Gian Học Tập &amp; Nghiên Cứu
                  </h1>

                  <p className="max-w-2xl text-sm leading-relaxed text-[#3F524E] sm:text-base">
                    Toàn bộ kho tàng học phần Toán học và Khoa học Giáo dục, tra cứu ký hiệu KaTeX,
                    phòng mô phỏng hình học 3D và quỹ đạo tiến độ học tập cá nhân được tổ chức khoa
                    học tại đây.
                  </p>
                </div>

                {/* 3 Huy hiệu thống kê nền Trắng Sứ Dịu */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                    <Layers className="h-3.5 w-3.5 text-[#243E38]" aria-hidden="true" />
                    <span>{String(subjects.length).padStart(2, '0')} học phần cốt lõi</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                    <BookOpen className="h-3.5 w-3.5 text-[#3B6275]" aria-hidden="true" />
                    <span>
                      {totalChapterCount} chương · {totalLessonCount} bài giảng
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                    <GraduationCap className="h-3.5 w-3.5 text-[#8C7248]" aria-hidden="true" />
                    <span>Tiến độ cá nhân: {displayOrbitPercent}%</span>
                  </span>
                </div>

                {/* Ô tìm kiếm Trắng Sứ Dịu */}
                <div ref={searchContainerRef} className="relative max-w-2xl">
                  <form
                    onSubmit={handleSearchSubmit}
                    role="search"
                    aria-label="Tìm kiếm nội dung học tập"
                  >
                    <div className="relative flex h-12 w-full items-center rounded-2xl border border-[#CBD6D2] bg-[#FAFBF9]/95 px-4 text-sm text-[#182624] shadow-sm transition-all focus-within:border-[#1E332E] focus-within:ring-2 focus-within:ring-[#1E332E]/15">
                      <Search className="mr-3 h-4 w-4 shrink-0 text-[#4A5D58]" aria-hidden="true" />
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
                        className="w-full bg-transparent text-sm text-[#182624] placeholder:text-[#4A5D58] focus:outline-none"
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
                            className="rounded-lg p-1 text-[#4A5D58] transition-colors hover:bg-[#E7ECEA] hover:text-[#182624]"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <Kbd className="hidden border-[#CBD6D2] bg-[#EBF0EE] px-2 py-0.5 text-[11px] text-[#1E332E] sm:inline-flex">
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
                      className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#CBD6D2] bg-[#FAFBF9] p-2 shadow-xl"
                    >
                      {instantSearchResults.length > 0 ? (
                        <ul className="divide-y divide-[#E7ECEA]">
                          {instantSearchResults.map((result) => {
                            if (result.kind === 'subject') {
                              return (
                                <li key={`subject-${result.subject.id}`}>
                                  <Link
                                    to={result.href}
                                    onClick={() => setIsSearchDropdownOpen(false)}
                                    className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[#EBF0EE]"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E7ECEA] text-[#1E332E]">
                                        <Layers className="h-4 w-4" aria-hidden="true" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-[#182624]">
                                            {result.subject.title}
                                          </span>
                                          <Badge variant="neutral">Môn học</Badge>
                                        </div>
                                        <p className="mt-0.5 line-clamp-1 text-xs text-[#4A5D58]">
                                          {result.subject.description}
                                        </p>
                                      </div>
                                    </div>
                                    <ArrowRight
                                      className="h-4 w-4 shrink-0 text-[#4A5D58]"
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
                                  className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[#EBF0EE]"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E7ECEA] text-[#1E332E]">
                                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-[#182624]">
                                          Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                          {result.lesson.title}
                                        </span>
                                        <Badge variant="neutral">{result.subject.title}</Badge>
                                      </div>
                                      <p className="mt-0.5 line-clamp-1 text-xs text-[#4A5D58]">
                                        {result.lesson.description}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    className="h-4 w-4 shrink-0 text-[#4A5D58]"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 text-center text-xs text-[#4A5D58]">
                          Không tìm thấy môn học hoặc bài học nào khớp với{' '}
                          <strong className="font-semibold text-[#182624]">
                            &ldquo;{hubQuery}&rdquo;
                          </strong>
                          .
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột Phải Banner (5 cột): Thiên Cầu Đa Diện 120fps vẽ trực tiếp không đóng hộp tối */}
              <div className="hidden flex-col items-center justify-center lg:col-span-5 lg:flex">
                <div className="relative w-full max-w-[350px]">
                  <LearningSpaceHeroCanvas />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Đường đồng mức nước chìm & Nội dung Không gian Học phần + Tiếp tục học tập */}
      <div className="relative bg-[#F2F4F3]">
        <TopographicWaterlinesBackdrop />
        <LearningSpaceHub hubQuery={hubQuery} onResetQuery={() => setHubQuery('')} />
      </div>
    </div>
  );
}

export default LearningSpacePage;
