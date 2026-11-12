import { ArrowRight, BookOpen, Lightbulb, Search, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  getAllGlossaryEntries,
  InlineMathText,
  KatexMath,
  type MathGlossarySubject,
  searchGlossary,
} from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Button, Card } from '@/shared/ui';

type SubjectFilter = 'all' | MathGlossarySubject;

export function GlossaryPage() {
  const searchInputId = useId();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');

  const allEntries = useMemo(() => getAllGlossaryEntries(), []);

  const algebraCount = useMemo(
    () => allEntries.filter((e) => e.subject === 'cau-truc-dai-so').length,
    [allEntries],
  );
  const affineCount = useMemo(
    () => allEntries.filter((e) => e.subject === 'hinh-hoc-affine').length,
    [allEntries],
  );
  const calculusCount = useMemo(
    () => allEntries.filter((e) => e.subject === 'giai-tich-ham-mot-bien').length,
    [allEntries],
  );
  const gdhCount = useMemo(
    () => allEntries.filter((e) => e.subject === 'giao-duc-hoc').length,
    [allEntries],
  );

  const filteredEntries = useMemo(() => {
    return searchGlossary({
      subject: subjectFilter,
      query,
    });
  }, [subjectFilter, query]);

  return (
    <FadeIn className="space-y-8 bg-[var(--bg-page)] pb-16 text-[var(--text-main)]">
      <div className="mx-auto w-[min(94vw,1600px)] space-y-6">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: ROUTES.home },
            { label: 'Tra cứu thuật ngữ & ký hiệu' },
          ]}
        />

        {/* Tiêu đề & Lời mở đầu */}
        <header className="space-y-3 border-b border-[#CFDADB] pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="subject">Sổ tay tra cứu học thuật</Badge>
            <Badge variant="neutral">{allEntries.length} thuật ngữ & ký hiệu chuẩn</Badge>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#29383D] sm:text-4xl">
            Ký hiệu & Thuật ngữ Toán học
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-[#55676B]">
            Hệ thống tra cứu nhanh ý nghĩa định nghĩa, bản chất hình học - đại số và bài giảng đối
            chiếu cho các ký hiệu quy ước cốt lõi trong hai học phần Cấu trúc đại số và Hình học
            Affine & Euclide.
          </p>
        </header>

        {/* Thanh công cụ tìm kiếm và bộ lọc */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Ô tìm kiếm */}
            <div className="relative max-w-md flex-1">
              <label htmlFor={searchInputId} className="sr-only">
                Tìm kiếm thuật ngữ hoặc ký hiệu
              </label>
              <Search
                className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#55676B]"
                aria-hidden="true"
              />
              <input
                id={searchInputId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, ký hiệu (\cong, V_4...), tiếng Anh..."
                className="w-full rounded-xl border border-[#CFDADB] bg-white py-2.5 pr-9 pl-10 text-sm text-[#29383D] placeholder-[#55676B]/60 shadow-2xs focus:border-[#3F6570] focus:ring-1 focus:ring-[#3F6570] focus:outline-hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[#55676B] hover:text-[#29383D]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Các tab lọc môn học */}
            <div
              role="group"
              aria-label="Lọc theo môn học"
              className="inline-flex rounded-xl border border-[#CFDADB] bg-[#E1E9EA] p-1 text-xs"
            >
              <button
                type="button"
                onClick={() => setSubjectFilter('all')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'all'
                    ? 'bg-white font-semibold text-[#29383D] shadow-2xs'
                    : 'text-[#55676B] hover:text-[#29383D]'
                }`}
              >
                Tất cả ({allEntries.length})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('cau-truc-dai-so')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'cau-truc-dai-so'
                    ? 'bg-white font-semibold text-[#29383D] shadow-2xs'
                    : 'text-[#55676B] hover:text-[#29383D]'
                }`}
              >
                Cấu trúc đại số ({algebraCount})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('hinh-hoc-affine')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'hinh-hoc-affine'
                    ? 'bg-white font-semibold text-[#29383D] shadow-2xs'
                    : 'text-[#55676B] hover:text-[#29383D]'
                }`}
              >
                Hình học Affine ({affineCount})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('giai-tich-ham-mot-bien')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'giai-tich-ham-mot-bien'
                    ? 'bg-white font-semibold text-[#29383D] shadow-2xs'
                    : 'text-[#55676B] hover:text-[#29383D]'
                }`}
              >
                Giải tích hàm một biến ({calculusCount})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('giao-duc-hoc')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'giao-duc-hoc'
                    ? 'bg-white font-semibold text-[#29383D] shadow-2xs'
                    : 'text-[#55676B] hover:text-[#29383D]'
                }`}
              >
                Giáo dục học ({gdhCount})
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#55676B]">
            <span>
              Hiển thị <strong>{filteredEntries.length}</strong> / {allEntries.length} thuật ngữ
            </span>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSubjectFilter('all');
                }}
                className="text-[#3F6570] hover:underline"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Danh sách thẻ thuật ngữ */}
        {filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredEntries.map((entry) => {
              const isAlgebra = entry.subject === 'cau-truc-dai-so';
              return (
                <Card
                  key={entry.id}
                  className="group/card flex h-full flex-col justify-between rounded-2xl border border-[#DFE6E1] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-editorial)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#1E3B2D]"
                >
                  <div className="flex-1 space-y-3.5">
                    {/* Hàng trên: Ký hiệu + Badge môn học */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex h-14 min-w-[64px] shrink-0 items-center justify-center overflow-visible rounded-xl border border-[#DFE6E1] bg-[#EEF2EE] px-3 shadow-2xs dark:border-[#1E3B2D] dark:bg-[#12241C]">
                        <div className="flex items-center justify-center leading-none">
                          <KatexMath
                            math={entry.symbol}
                            className="font-serif text-2xl font-semibold text-[#29383D] dark:text-[#E2E8F0]"
                          />
                        </div>
                      </div>
                      <Badge variant={isAlgebra ? 'subject' : 'neutral'}>
                        {entry.courseName ||
                          (entry.subject === 'cau-truc-dai-so'
                            ? 'Cấu trúc đại số'
                            : entry.subject === 'giai-tich-ham-mot-bien'
                              ? 'Giải tích hàm một biến'
                              : entry.subject === 'giao-duc-hoc'
                                ? 'Giáo dục học'
                                : 'Hình học Affine')}
                      </Badge>
                    </div>

                    {/* Tên thuật ngữ */}
                    <div>
                      <h2 className="font-serif text-[18.5px] leading-snug font-bold text-[#29383D] dark:text-[#E6ECE7]">
                        {entry.nameVi}
                      </h2>
                      <p className="text-xs text-[#55676B] italic dark:text-[#A7B5AC]">
                        {entry.nameEn}
                      </p>
                    </div>

                    {/* Định nghĩa tóm tắt */}
                    <div className="text-[15.5px] leading-relaxed text-[#55676B] dark:text-[#A7B5AC]">
                      <InlineMathText text={entry.brief} />
                    </div>

                    {/* Hộp trực quan */}
                    <div className="space-y-1.5 rounded-xl border border-[#DFE6E1] bg-[#EEF2EE]/60 p-3.5 text-[14.5px] leading-relaxed text-[#29383D] dark:border-[#1E3B2D] dark:bg-[#12241C]/60 dark:text-[#E2E8F0]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#3F6570] dark:text-[#739B88]">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>Trực quan &amp; Bản chất:</span>
                      </div>
                      <div>
                        <InlineMathText text={entry.intuition} />
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động căn sát đáy card */}
                  <div className="mt-auto border-t border-[#DFE6E1] pt-3.5 dark:border-[#1E3B2D]">
                    <Link
                      to={entry.relatedLesson}
                      className="group/link flex w-full items-center justify-between rounded-xl border border-[#DFE6E1] bg-white/70 px-3.5 py-2 text-xs font-medium text-[#29383D] transition-all duration-200 hover:border-[#2E4A6B] hover:text-[#2E4A6B] hover:shadow-2xs dark:border-[#1E3B2D] dark:bg-[#16191D]/70 dark:text-[#E2E8F0] dark:hover:border-[#C5A262] dark:hover:text-[#E5C378]"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen
                          className="h-3.5 w-3.5 text-[#55676B] transition-colors group-hover/link:text-[#2E4A6B] dark:text-[#A7B5AC] dark:group-hover/link:text-[#E5C378]"
                          aria-hidden="true"
                        />
                        <span>Xem bài giảng gốc</span>
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-[#55676B] transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:text-[#2E4A6B] dark:text-[#A7B5AC] dark:group-hover/link:text-[#E5C378]"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="space-y-3 p-10 text-center">
            <h3 className="text-base font-semibold text-stone-900">Không tìm thấy thuật ngữ nào</h3>
            <p className="text-xs text-stone-600">
              Không có kết quả phù hợp với từ khóa &ldquo;{query}&rdquo;. Hãy thử tìm với ký hiệu
              Toán học hoặc từ khóa khác.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setSubjectFilter('all');
                }}
              >
                Xóa bộ lọc tìm kiếm
              </Button>
            </div>
          </Card>
        )}
      </div>
    </FadeIn>
  );
}

export default GlossaryPage;
