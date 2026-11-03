import type { ManifestChapter } from '@schemas/index';
import {
  ArrowLeft,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getSubjectBySlug, getSubjectStats } from '@/content-runtime';
import { PEDAGOGY_DOCUMENTS, PEDAGOGICAL_CASE_STUDIES } from '@/data/courses/giao-duc-hoc/course';
import { CaseStudyBox, LegalQuoteCard, PrincipleMatrix } from '@/features/pedagogy';
import {
  ChapterAccordionList,
  type LessonLevelFilter,
  SubjectBibliography,
  SubjectFilterBar,
  SubjectHero,
} from '@/features/subject';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Button, Card } from '@/shared/ui';

export function SubjectOverviewPage() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const subject = subjectSlug ? getSubjectBySlug(subjectSlug) : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LessonLevelFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [pedagogyDocFilter, setPedagogyDocFilter] = useState<
    'all' | 'curriculum' | 'legal' | 'handbook'
  >('all');
  const [activePedagogyTab, setActivePedagogyTab] = useState<'principles' | 'cases' | 'legal'>(
    'principles',
  );
  const [activeCaseStudyId, setActiveCaseStudyId] = useState<number>(1);

  const stats = useMemo(() => (subject ? getSubjectStats(subject) : null), [subject]);

  const popularTags = useMemo(() => {
    if (!subject) return [];
    const frequency = new Map<string, number>();
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        for (const tag of lesson.tags) {
          frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
        }
      }
    }
    return [...frequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [subject]);

  const filteredPedagogyDocs = useMemo(() => {
    if (pedagogyDocFilter === 'all') return PEDAGOGY_DOCUMENTS;
    return PEDAGOGY_DOCUMENTS.filter((doc) => doc.category === pedagogyDocFilter);
  }, [pedagogyDocFilter]);

  const filteredChapters = useMemo<readonly ManifestChapter[]>(() => {
    if (!subject) {
      return [];
    }

    const hasFilter =
      searchQuery.trim().length > 0 || selectedLevel !== 'all' || selectedTag !== null;
    if (!hasFilter) {
      return subject.chapters;
    }

    const result: ManifestChapter[] = [];
    for (const chapter of subject.chapters) {
      const matchingLessons = chapter.lessons.filter((lesson) => {
        if (selectedLevel !== 'all' && lesson.level !== selectedLevel) {
          return false;
        }
        if (selectedTag !== null && !lesson.tags.includes(selectedTag)) {
          return false;
        }
        if (searchQuery.trim().length > 0) {
          const text = `${lesson.title} ${lesson.description} ${lesson.tags.join(' ')} ${chapter.title}`;
          if (!matchesVietnameseQuery(text, searchQuery)) {
            return false;
          }
        }
        return true;
      });

      if (matchingLessons.length > 0) {
        result.push({
          ...chapter,
          lessons: matchingLessons,
        });
      }
    }

    return result;
  }, [subject, searchQuery, selectedLevel, selectedTag]);

  const shownLessonCount = useMemo(
    () => filteredChapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
    [filteredChapters],
  );

  if (!subject || !stats) {
    return (
      <FadeIn className="mx-auto max-w-xl py-12 text-center">
        <Card className="space-y-4 p-8">
          <h1 className="text-2xl font-bold text-stone-900">Không tìm thấy môn học bạn yêu cầu</h1>
          <p className="text-sm text-stone-600">
            Đường dẫn môn học <code className="font-mono text-stone-800">{subjectSlug}</code> không
            tồn tại hoặc chưa được xuất bản.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="sm">
              <Link to={ROUTES.home}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Về trang chủ</span>
              </Link>
            </Button>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedTag(null);
  };

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-8">
      <SubjectHero subject={subject} />

      {/* Khối Phòng Lab tương tác chuyên sâu cho Hình học Affine và hình học Euclide */}
      {subject.slug === 'hinh-hoc-affine' && (
        <Card className="border-subject-200/90 from-subject-50/50 bg-gradient-to-br via-white to-stone-50/70 p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="subject">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Phòng Lab Tương tác &amp; Ôn luyện</span>
                </Badge>
                <Badge variant="neutral">61 Bài tập · 47 Trắc nghiệm · Thi thử thích ứng</Badge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                Phòng Lab &amp; Ôn tập tương tác Hình học cao cấp
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
                Toàn bộ tài liệu bài giảng 3 chương (Không gian afin, Không gian Ơclit, Không gian
                xạ ảnh) tích hợp cùng hệ thống 61 bài tập có gợi ý và giải chi tiết từng bước, 47
                câu trắc nghiệm nhanh, bộ luyện tính toán tự sinh số liệu và chế độ thi thử thông
                minh.
              </p>
            </div>
            <div className="shrink-0">
              <Button asChild variant="subject" size="lg" className="shadow-xs">
                <a
                  href="/interactive/affine-geometry.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Mở phòng Lab &amp; Ôn tập tương tác</span>
                  <ExternalLink className="h-4 w-4 opacity-80" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Khối Tài liệu học tập & Đề thi mẫu chuyên sâu cho Giải tích hàm một biến */}
      {subject.slug === 'giai-tich-ham-mot-bien' && (
        <Card className="border-subject-200/90 from-subject-50/40 bg-gradient-to-br via-white to-stone-50/70 p-6 shadow-xs sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="subject">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Tài liệu học tập &amp; Đề thi mẫu</span>
                </Badge>
                <Badge variant="neutral">Học phần MATH1403 · 4 Tín chỉ · Toán học</Badge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                Tài liệu học tập &amp; Đề cương ôn thi cuối khóa
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                Tải về giáo trình chính khóa và tài liệu hướng dẫn ôn thi kết thúc học phần Giải
                tích hàm một biến. Học viên có thể mở đọc trực tiếp trên trình duyệt hoặc tải về máy
                để phục vụ học tập và ôn luyện đề mẫu.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Tài liệu 1: Giáo trình */}
              <div className="hover:border-subject-300 flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-subject-700 text-xs font-bold tracking-wider uppercase">
                      Giáo trình chính khóa
                    </span>
                    <Badge variant="subject">PDF Bản chuẩn</Badge>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Giáo trình Giải tích hàm một biến (GV. Trần Trí Dũng)
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Nền tảng Giải tích thực từ tiên đề trường R, giới hạn dãy/hàm, tính liên tục,
                    phép tính vi phân, tích phân Riemann đến lý thuyết chuỗi số và chuỗi hàm.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                  <Button asChild variant="subject" size="sm" className="gap-1.5 text-xs">
                    <a
                      href="/docs/giai-tich-ham-mot-bien/GTHMB_Tran_Tri_Dung_2022.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mở xem PDF</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                    <a
                      href="/docs/giai-tich-ham-mot-bien/GTHMB_Tran_Tri_Dung_2022.pdf"
                      download="GTHMB_Tran_Tri_Dung_2022.pdf"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tải về máy</span>
                    </a>
                  </Button>
                </div>
              </div>

              {/* Tài liệu 2: Nội dung ôn tập & Đề thi mẫu */}
              <div className="hover:border-subject-300 flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">
                      Tài liệu ôn thi cuối khóa
                    </span>
                    <Badge variant="neutral">Trọng tâm &amp; Đề mẫu</Badge>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Nội dung ôn tập &amp; Đề thi mẫu cuối khóa
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Hệ thống trọng tâm lý thuyết, bài tập ôn thi và 5 câu tự luận đề mẫu học phần
                    Giải tích hàm một biến (MATH1403).
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                  <Button asChild variant="subject" size="sm" className="gap-1.5 text-xs">
                    <Link to="/mon-hoc/giai-tich-ham-mot-bien/on-tap-cuoi-khoa-va-de-thi-mau/de-cuong-trong-tam-ly-thuyet-va-cam-nang-bai-tap-on-thi">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Vào học chuyên đề</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                    <a
                      href="/docs/giai-tich-ham-mot-bien/ND_on_thi_va_de_mau.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mở xem PDF</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                    <a
                      href="/docs/giai-tich-ham-mot-bien/ND_on_thi_va_de_mau.pdf"
                      download="ND_on_thi_va_de_mau.pdf"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tải về máy</span>
                    </a>
                  </Button>
                </div>
              </div>

              {/* Tài liệu 3: Ngân hàng Đề thi & Lời giải thực chiến */}
              <div className="border-subject-300 from-subject-50/50 hover:border-subject-400 flex flex-col justify-between rounded-2xl border bg-gradient-to-br via-white to-amber-50/30 p-5 shadow-2xs transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-subject-800 text-xs font-bold tracking-wider uppercase">
                      Ngân hàng Đề thi Thực chiến
                    </span>
                    <Badge variant="subject">6 Bộ đề · 41 Bài</Badge>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Đề thi Kết thúc Học phần qua các năm (2018 – 2026)
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Kho 6 bộ đề thi chính thức kèm biểu điểm chi tiết, gợi ý định lý trọng tâm và
                    toàn bộ lời giải thực chiến từng bước được số hóa 100% bằng KaTeX.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                  <Button
                    asChild
                    variant="subject"
                    size="sm"
                    className="w-full gap-1.5 text-xs font-semibold sm:w-auto"
                  >
                    <Link to={ROUTES.subjectExams(subject.slug)}>
                      <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Vào luyện đề thi &amp; Xem lời giải</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Khối Tài liệu học phần & Văn bản pháp quy chuyên sâu cho Giáo dục học */}
      {subject.slug === 'giao-duc-hoc' && (
        <div className="space-y-6">
          {/* Banner giới thiệu học phần & 13 tài liệu chính thức */}
          <Card className="border-teal-200/90 bg-gradient-to-br from-teal-50/40 via-white to-amber-50/40 p-6 shadow-xs sm:p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="subject">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tài liệu học phần &amp; Văn bản pháp quy</span>
                  </Badge>
                  <Badge variant="neutral">Chuẩn HCMUE &amp; CT GDPT 2018 · 13 Tài liệu</Badge>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                  Hệ thống Tài liệu học tập, Giáo trình &amp; Văn bản quy phạm pháp luật
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                  Toàn bộ tài liệu chính thức của Trường ĐH Sư phạm TP.HCM và hệ thống văn bản pháp
                  quy của Bộ Giáo dục &amp; Đào tạo được số hóa và chuẩn bị sẵn sàng cho học viên
                  đọc trực tiếp hoặc tải về máy.
                </p>
              </div>

              {/* Bộ lọc 3 danh mục tài liệu */}
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/70 pb-3">
                <span className="mr-1 text-xs font-bold tracking-wider text-stone-600 uppercase">
                  Danh mục:
                </span>
                <button
                  type="button"
                  onClick={() => setPedagogyDocFilter('all')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    pedagogyDocFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
                  )}
                >
                  Tất cả ({PEDAGOGY_DOCUMENTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPedagogyDocFilter('curriculum')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    pedagogyDocFilter === 'curriculum'
                      ? 'bg-amber-800 text-white'
                      : 'border border-amber-200/70 bg-amber-50 text-amber-900 hover:bg-amber-100',
                  )}
                >
                  Giáo trình &amp; Đề cương (2)
                </button>
                <button
                  type="button"
                  onClick={() => setPedagogyDocFilter('legal')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    pedagogyDocFilter === 'legal'
                      ? 'bg-teal-800 text-white'
                      : 'border border-teal-200/70 bg-teal-50 text-teal-900 hover:bg-teal-100',
                  )}
                >
                  Văn bản pháp quy (7)
                </button>
                <button
                  type="button"
                  onClick={() => setPedagogyDocFilter('handbook')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    pedagogyDocFilter === 'handbook'
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-100 text-stone-800 hover:bg-stone-200',
                  )}
                >
                  Cẩm nang &amp; Nghiên cứu (4)
                </button>
              </div>

              {/* Lưới danh sách tài liệu */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPedagogyDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs transition-all hover:border-teal-400/80 hover:shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold tracking-wider text-teal-800 uppercase">
                          {doc.categoryLabel}
                        </span>
                        <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          {doc.badge}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-bold text-stone-900">{doc.title}</h3>
                      <p className="line-clamp-3 text-xs leading-relaxed text-stone-600">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3 text-xs">
                      <Button
                        asChild
                        variant="subject"
                        size="sm"
                        className="h-7 gap-1 px-2.5 text-xs"
                      >
                        <a href={doc.path} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span>Xem PDF</span>
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2.5 text-xs text-stone-700"
                      >
                        <a href={doc.path} download={doc.filename}>
                          <Download className="h-3 w-3" aria-hidden="true" />
                          <span>Tải về</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Phòng Thực hành & Tra cứu Sư phạm Tương tác */}
          <Card className="border-teal-200/90 bg-white p-6 shadow-xs sm:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Không gian Thực hành Sư phạm</span>
                    </span>
                    <Badge variant="neutral">Công cụ tương tác</Badge>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                    Tra cứu Nguyên tắc, Tình huống &amp; Pháp quy Sư phạm
                  </h2>
                </div>

                {/* Tabs chuyển đổi giữa 3 công cụ */}
                <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActivePedagogyTab('principles')}
                    className={cn(
                      'rounded-lg px-3 py-1.5 transition-all',
                      activePedagogyTab === 'principles'
                        ? 'bg-white font-bold text-teal-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900',
                    )}
                  >
                    6 Nguyên tắc
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePedagogyTab('cases')}
                    className={cn(
                      'rounded-lg px-3 py-1.5 transition-all',
                      activePedagogyTab === 'cases'
                        ? 'bg-white font-bold text-teal-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900',
                    )}
                  >
                    Tình huống thực tế
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePedagogyTab('legal')}
                    className={cn(
                      'rounded-lg px-3 py-1.5 transition-all',
                      activePedagogyTab === 'legal'
                        ? 'bg-white font-bold text-teal-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900',
                    )}
                  >
                    Trích dẫn Pháp quy
                  </button>
                </div>
              </div>

              {/* Tab 1: Ma trận 6 nguyên tắc */}
              {activePedagogyTab === 'principles' && <PrincipleMatrix />}

              {/* Tab 2: Tình huống thực tế */}
              {activePedagogyTab === 'cases' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase">
                      Chọn tình huống mẫu:
                    </span>
                    <Link
                      to="/mon-hoc/giao-duc-hoc/cam-nang-xu-ly-tinh-huong-su-pham-va-de-cuong-on-tap/ngan-hang-20-tinh-huong-su-pham-thuc-te"
                      className="text-xs font-semibold text-teal-800 hover:underline"
                    >
                      Xem toàn bộ 20 tình huống &rarr;
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PEDAGOGICAL_CASE_STUDIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveCaseStudyId(c.id)}
                        className={cn(
                          'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                          activeCaseStudyId === c.id
                            ? 'border-amber-800 bg-amber-800 text-white shadow-2xs'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100',
                        )}
                      >
                        Tình huống {c.id}
                      </button>
                    ))}
                  </div>

                  {PEDAGOGICAL_CASE_STUDIES.find((c) => c.id === activeCaseStudyId) && (
                    <CaseStudyBox
                      caseStudy={PEDAGOGICAL_CASE_STUDIES.find((c) => c.id === activeCaseStudyId)!}
                    />
                  )}
                </div>
              )}

              {/* Tab 3: Trích dẫn pháp quy */}
              {activePedagogyTab === 'legal' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <LegalQuoteCard
                    lawTitle="Luật Giáo dục 2019"
                    article="Khoản 1 Điều 28"
                    quote="Mục tiêu của giáo dục phổ thông là nhằm phát triển toàn diện cho người học về đạo đức, trí tuệ, thể chất, thẩm mỹ, kỹ năng cơ bản, phát triển năng lực cá nhân, tính năng động và sáng tạo; hình thành nhân cách con người Việt Nam xã hội chủ nghĩa và trách nhiệm công dân."
                    source="Luật số 43/2019/QH14"
                    sourceUrl="/docs/giao-duc-hoc/Luat_Giao_duc_2019.pdf"
                    significance="Định hướng cốt lõi cho mọi kế hoạch dạy học và hoạt động giáo dục trong nhà trường phổ thông."
                  />
                  <LegalQuoteCard
                    lawTitle="Thông tư 20/2018/TT-BGDĐT"
                    article="Tiêu chuẩn 1: Phẩm chất nhà giáo"
                    quote="Tuân thủ các quy định và rèn luyện về đạo đức nhà giáo; chia sẻ kinh nghiệm, hỗ trợ đồng nghiệp trong rèn luyện đạo đức và tạo dựng phong cách nhà giáo mẫu mực."
                    source="Quy định chuẩn nghề nghiệp giáo viên cơ sở GDPT"
                    sourceUrl="/docs/giao-duc-hoc/Chuan_nghe_nghiep_GV_TT20.pdf"
                    significance="Tấm gương nhân cách của người thầy là phương tiện trực quan mạnh mẽ nhất trong giáo dục đạo đức học sinh."
                  />
                  <LegalQuoteCard
                    lawTitle="Điều lệ trường trung học (TT 32/2020)"
                    article="Khoản 2 Điều 29"
                    quote="Giáo viên chủ nhiệm có quyền: Được dự các giờ học, hoạt động giáo dục khác của học sinh lớp mình chủ nhiệm; được dự các cuộc họp của Hội đồng thi đua khen thưởng và các hội đồng kỷ luật khi giải quyết những vấn đề có liên quan đến học sinh của lớp mình chủ nhiệm."
                    source="Thông tư số 32/2020/TT-BGDĐT"
                    sourceUrl="/docs/giao-duc-hoc/Dieu_le_truong_trung_hoc_TT32.pdf"
                    significance="Căn cứ pháp lý khẳng định vị thế điều phối và quyền hạn của GVCN trong việc bảo vệ quyền lợi chính đáng cho học sinh."
                  />
                  <LegalQuoteCard
                    lawTitle="Chương trình GDPT 2018"
                    article="5 Phẩm chất chủ yếu"
                    quote="Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm. Đây là 5 phẩm chất nền tảng được hình thành và phát triển thông qua các môn học và hoạt động trải nghiệm."
                    source="Khung Chương trình giáo dục phổ thông tổng thể"
                    sourceUrl="/docs/giao-duc-hoc/CT_GDPT_2018_Tong_the.pdf"
                    significance="Kim chỉ nam đánh giá sự tiến bộ về nhân cách của học sinh thay vì chỉ đánh giá điểm số học lực thuần túy."
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {subject.chapters.length > 0 ? (
        <>
          <SubjectFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            availableTags={popularTags}
            shownCount={shownLessonCount}
            totalCount={stats.lessonCount}
            onReset={handleResetFilters}
          />

          <ChapterAccordionList subject={subject} chapters={filteredChapters} />
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-base font-medium text-stone-800">
            Các bài học của môn {subject.title} đang trong quá trình thẩm định học thuật.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Nội dung sẽ được hiển thị ngay khi chuyển sang trạng thái xuất bản.
          </p>
        </Card>
      )}
      <SubjectBibliography subject={subject} />
    </FadeIn>
  );
}

export default SubjectOverviewPage;
