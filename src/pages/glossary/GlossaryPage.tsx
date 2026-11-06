import { ArrowRight, BookOpen, Lightbulb, Search, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  getAllGlossaryEntries,
  KatexMath,
  type MathGlossarySubject,
  searchGlossary,
} from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Button, Card, Container } from '@/shared/ui';

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

  const filteredEntries = useMemo(() => {
    return searchGlossary({
      subject: subjectFilter,
      query,
    });
  }, [subjectFilter, query]);

  return (
    <FadeIn className="space-y-8 bg-[#FAF7F2] pb-16 text-stone-900">
      <Container className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: ROUTES.home },
            { label: 'Tra cứu thuật ngữ & ký hiệu' },
          ]}
        />

        {/* Tiêu đề & Lời mở đầu */}
        <header className="space-y-3 border-b border-stone-200/80 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="subject">Sổ tay tra cứu học thuật</Badge>
            <Badge variant="neutral">{allEntries.length} thuật ngữ & ký hiệu chuẩn</Badge>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Ký hiệu & Thuật ngữ Toán học
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-stone-700">
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
                className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id={searchInputId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, ký hiệu (\cong, V_4...), tiếng Anh..."
                className="w-full rounded-xl border border-stone-200/80 bg-white py-2.5 pr-9 pl-10 text-sm text-stone-900 placeholder-stone-400 shadow-2xs focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:outline-hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Các tab lọc môn học */}
            <div
              role="group"
              aria-label="Lọc theo môn học"
              className="inline-flex rounded-xl border border-stone-200/80 bg-[#F4EFEA] p-1 text-xs"
            >
              <button
                type="button"
                onClick={() => setSubjectFilter('all')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Tất cả ({allEntries.length})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('cau-truc-dai-so')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'cau-truc-dai-so'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cấu trúc đại số ({algebraCount})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('hinh-hoc-affine')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'hinh-hoc-affine'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Hình học Affine ({affineCount})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('giai-tich-ham-mot-bien')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  subjectFilter === 'giai-tich-ham-mot-bien'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Giải tích hàm một biến ({calculusCount})
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600">
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
                className="text-amber-800 hover:underline"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Danh sách thẻ thuật ngữ */}
        {filteredEntries.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => {
              const isAlgebra = entry.subject === 'cau-truc-dai-so';
              return (
                <Card
                  key={entry.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Hàng trên: Ký hiệu + Badge môn học */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex min-h-[38px] min-w-[50px] items-center justify-center rounded-lg border border-stone-200/90 bg-[#F4EFEA] px-3 py-1 shadow-2xs">
                        <KatexMath
                          math={entry.symbol}
                          className="font-serif text-base font-semibold text-stone-900"
                        />
                      </div>
                      <Badge variant={isAlgebra ? 'subject' : 'neutral'}>
                        {entry.courseName ||
                          (entry.subject === 'cau-truc-dai-so'
                            ? 'Cấu trúc đại số'
                            : entry.subject === 'giai-tich-ham-mot-bien'
                              ? 'Giải tích hàm một biến'
                              : 'Hình học Affine')}
                      </Badge>
                    </div>

                    {/* Tên thuật ngữ */}
                    <div>
                      <h2 className="font-serif text-lg leading-snug font-bold text-stone-900">
                        {entry.nameVi}
                      </h2>
                      <p className="text-xs text-stone-500 italic">{entry.nameEn}</p>
                    </div>

                    {/* Định nghĩa tóm tắt */}
                    <p className="text-xs leading-relaxed text-stone-700">{entry.brief}</p>

                    {/* Hộp trực quan */}
                    <div className="space-y-1 rounded-lg border border-stone-200/80 bg-[#FAF7F2] p-3 text-[11px] leading-relaxed text-stone-700">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                        <Lightbulb
                          className="h-3.5 w-3.5 shrink-0 text-amber-700"
                          aria-hidden="true"
                        />
                        <span>Trực quan & Bản chất:</span>
                      </div>
                      <p>{entry.intuition}</p>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="mt-4 border-t border-stone-200/70 pt-3">
                    <Button asChild variant="outline" size="sm" className="w-full justify-between">
                      <Link to={entry.relatedLesson}>
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                          <span>Xem bài giảng gốc</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                      </Link>
                    </Button>
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
      </Container>
    </FadeIn>
  );
}

export default GlossaryPage;
