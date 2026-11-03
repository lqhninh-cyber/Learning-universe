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
import {
  ChapterAccordionList,
  type LessonLevelFilter,
  SubjectBibliography,
  SubjectFilterBar,
  SubjectHero,
} from '@/features/subject';
import { ROUTES } from '@/shared/config/routes';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Button, Card } from '@/shared/ui';

export function SubjectOverviewPage() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const subject = subjectSlug ? getSubjectBySlug(subjectSlug) : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LessonLevelFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
