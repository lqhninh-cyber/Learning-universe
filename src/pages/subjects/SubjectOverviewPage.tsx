import type { ManifestChapter } from '@schemas/index';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getSubjectBySlug, getSubjectStats } from '@/content-runtime';
import { PEDAGOGY_DOCUMENTS, PEDAGOGICAL_CASE_STUDIES } from '@/data/courses/giao-duc-hoc/course';
import { CaseStudyBox, LegalQuoteCard, PrincipleMatrix } from '@/features/pedagogy';
import {
  ChapterAccordionList,
  DocumentCard,
  type LessonLevelFilter,
  SubjectBibliography,
  SubjectFilterBar,
  SubjectHero,
} from '@/features/subject';
import { EXTERNAL_LINKS, GOOGLE_DRIVE_DOCS_URL, ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Button, Card } from '@/shared/ui';

type CourseWorkspaceTab = 'roadmap' | 'documents' | 'specialized' | 'overview';

interface CourseTabDef {
  readonly id: CourseWorkspaceTab;
  readonly label: string;
  readonly badge?: string | number;
  readonly icon: typeof BookOpen;
}

export function SubjectOverviewPage() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const subject = subjectSlug ? getSubjectBySlug(subjectSlug) : undefined;

  const [activeTab, setActiveTab] = useState<CourseWorkspaceTab>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LessonLevelFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [pedagogyDocFilter, setPedagogyDocFilter] = useState<
    'all' | 'curriculum' | 'legal' | 'handbook'
  >('all');
  const [activePedagogyTab, setActivePedagogyTab] = useState<
    'rubrics' | 'principles' | 'cases' | 'legal'
  >('rubrics');
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
    return PEDAGOGY_DOCUMENTS.filter(
      (doc) =>
        doc.category === pedagogyDocFilter ||
        (pedagogyDocFilter === 'handbook' && doc.category === 'Cẩm nang & Nghiên cứu'),
    );
  }, [pedagogyDocFilter]);

  const pedagogyCategoryCounts = useMemo(() => {
    return {
      curriculum: PEDAGOGY_DOCUMENTS.filter((d) => d.category === 'curriculum').length,
      legal: PEDAGOGY_DOCUMENTS.filter((d) => d.category === 'legal').length,
      handbook: PEDAGOGY_DOCUMENTS.filter(
        (d) => d.category === 'handbook' || d.category === 'Cẩm nang & Nghiên cứu',
      ).length,
    };
  }, []);

  const hasFilter =
    searchQuery.trim().length > 0 || selectedLevel !== 'all' || selectedTag !== null;

  const filteredChapters = useMemo<readonly ManifestChapter[]>(() => {
    if (!subject) {
      return [];
    }

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
  }, [subject, searchQuery, selectedLevel, selectedTag, hasFilter]);

  const shownLessonCount = useMemo(
    () => filteredChapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
    [filteredChapters],
  );

  // Cấu hình thanh Tab điều hướng linh hoạt theo từng môn học
  const workspaceTabs = useMemo<readonly CourseTabDef[]>(() => {
    if (!subject) return [];

    const tabs: CourseTabDef[] = [
      {
        id: 'roadmap',
        label: 'Lộ trình bài học',
        badge: stats?.lessonCount ?? 0,
        icon: BookOpen,
      },
    ];

    // Tab 2: Tài liệu & Văn bản
    if (subject.slug === 'giao-duc-hoc') {
      tabs.push({
        id: 'documents',
        label: 'Tài liệu & Văn bản',
        badge: PEDAGOGY_DOCUMENTS.length,
        icon: FileText,
      });
    } else if (subject.slug === 'giai-tich-ham-mot-bien') {
      tabs.push({
        id: 'documents',
        label: 'Tài liệu & Đề thi mẫu',
        badge: 3,
        icon: FileText,
      });
    } else {
      const bibCount =
        (subject.sources?.references?.length ?? 0) + (subject.sources?.primary ? 1 : 0);
      if (bibCount > 0) {
        tabs.push({
          id: 'documents',
          label: 'Tài liệu tham khảo',
          badge: bibCount,
          icon: FileText,
        });
      }
    }

    // Tab 3: Học phần chuyên biệt
    if (subject.slug === 'giao-duc-hoc') {
      tabs.push({
        id: 'specialized',
        label: 'Tình huống sư phạm & Rubric',
        badge: 'Thực hành',
        icon: Sparkles,
      });
    } else if (subject.slug === 'giai-tich-ham-mot-bien') {
      tabs.push({
        id: 'specialized',
        label: 'Đề thi & Lời giải các năm',
        badge: '6 bộ đề',
        icon: GraduationCap,
      });
    } else if (subject.slug === 'cau-truc-dai-so') {
      tabs.push({
        id: 'specialized',
        label: 'Đề thi & Đề cương ôn tập',
        badge: 'Đề thi 90p',
        icon: GraduationCap,
      });
    } else if (subject.slug === 'hinh-hoc-affine') {
      tabs.push({
        id: 'specialized',
        label: 'Phòng Lab tương tác',
        badge: 'Lab 2D',
        icon: Sparkles,
      });
    }

    // Tab 4: Tổng quan & Mục tiêu
    tabs.push({
      id: 'overview',
      label: 'Tổng quan & Mục tiêu',
      icon: Target,
    });

    return tabs;
  }, [subject, stats]);

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
    <FadeIn className="mx-auto max-w-5xl space-y-6">
      {/* =========================================================================
          KHU VỰC 1: COMPACT COURSE HERO (TIỀN SẢNH MÔN HỌC TINH GỌN)
          ========================================================================= */}
      <SubjectHero subject={subject} />

      {/* =========================================================================
          KHU VỰC 2: THANH TAB ĐIỀU HƯỚNG WORKSPACE (COURSE WORKSPACE TABS)
          ========================================================================= */}
      <div
        role="tablist"
        aria-label="Các không gian làm việc của môn học"
        className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-stone-200/90 bg-white/90 p-1.5 shadow-2xs backdrop-blur-md sm:gap-2"
      >
        {workspaceTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm',
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
              )}
            >
              <TabIcon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-stone-500')} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700',
                  )}
                >
                  {typeof tab.badge === 'number' ? `(${tab.badge})` : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: LỘ TRÌNH BÀI HỌC (DEFAULT ACTIVE - ACCORDION ROADMAP GỌN GÀNG)
          ========================================================================= */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
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

              <ChapterAccordionList
                subject={subject}
                chapters={filteredChapters}
                hasActiveFilter={hasFilter}
              />
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: TÀI LIỆU & VĂN BẢN QUY PHẠM PHÁP LUẬT
          ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* A. Dành cho môn Giáo dục học: 19 Tài liệu HCMUE & Pháp quy */}
          {subject.slug === 'giao-duc-hoc' && (
            <Card className="border-teal-200/90 bg-gradient-to-br from-teal-50/40 via-white to-amber-50/30 p-6 shadow-xs sm:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="subject">
                      <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tài liệu học phần &amp; Văn bản pháp quy</span>
                    </Badge>
                    <Badge variant="neutral">
                      Chuẩn HCMUE &amp; CT GDPT 2018 · {PEDAGOGY_DOCUMENTS.length} Tài liệu
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                    Hệ thống Tài liệu học tập, Giáo trình &amp; Văn bản quy phạm pháp luật
                  </h2>
                  <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                    Toàn bộ tài liệu chính thức của Trường ĐH Sư phạm TP.HCM và hệ thống văn bản
                    pháp quy của Bộ Giáo dục &amp; Đào tạo được số hóa và chuẩn bị sẵn sàng cho học
                    viên đọc trực tiếp hoặc tải về máy.
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
                    Giáo trình &amp; Đề cương ({pedagogyCategoryCounts.curriculum})
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
                    Văn bản pháp quy ({pedagogyCategoryCounts.legal})
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
                    Cẩm nang &amp; Nghiên cứu ({pedagogyCategoryCounts.handbook})
                  </button>
                </div>

                {/* Lưới danh sách 19 tài liệu qua component DocumentCard */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPedagogyDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      categoryLabel={doc.categoryLabel}
                      size={doc.size}
                      badge={doc.badge}
                      description={doc.description}
                      url={doc.url || GOOGLE_DRIVE_DOCS_URL}
                      filename={doc.filename}
                    />
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* B. Dành cho môn Giải tích hàm một biến: Giáo trình & Đề cương */}
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
                    tích hàm một biến. Học viên có thể mở đọc trực tiếp trên trình duyệt hoặc tải về
                    máy để phục vụ học tập và ôn luyện đề mẫu.
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
                        Nền tảng Giải tích thực từ tiên đề trường R, giới hạn dãy/hàm, tính liên
                        tục, phép tính vi phân, tích phân Riemann đến lý thuyết chuỗi số và chuỗi
                        hàm.
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                      <Button asChild variant="subject" size="sm" className="gap-1.5 text-xs">
                        <a
                          href={EXTERNAL_LINKS.giaiTichHamMotBienPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Mở xem trên Drive</span>
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                        <a
                          href={EXTERNAL_LINKS.giaiTichHamMotBienPdf}
                          target="_blank"
                          rel="noopener noreferrer"
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
                        Hệ thống trọng tâm lý thuyết, bài tập ôn thi và 5 câu tự luận đề mẫu học
                        phần Giải tích hàm một biến (MATH1403).
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
                          href={EXTERNAL_LINKS.giaiTichDeCuongPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Mở xem trên Drive</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Tài liệu 3: Ngân hàng Đề thi Thực chiến */}
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
                        Kho 6 bộ đề thi chính thức kèm biểu điểm chi tiết, gợi ý định lý trọng tâm
                        và toàn bộ lời giải thực chiến từng bước được số hóa 100% bằng KaTeX.
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

          {/* C. Dành cho các môn còn lại: Danh mục Giáo trình chính thức */}
          {subject.slug !== 'giao-duc-hoc' && subject.slug !== 'giai-tich-ham-mot-bien' && (
            <SubjectBibliography subject={subject} />
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: KHÔNG GIAN CHUYÊN BIỆT THEO MÔN HỌC
          ========================================================================= */}
      {activeTab === 'specialized' && (
        <div className="space-y-6">
          {/* 3.1 Dành cho môn Giáo dục học: Tình huống sư phạm & Rubric đánh giá */}
          {subject.slug === 'giao-duc-hoc' && (
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
                      Bộ Tiêu chí Rubric, Tình huống Thực tế &amp; Nguyên tắc Giáo dục
                    </h2>
                  </div>

                  {/* Tabs chuyển đổi giữa 4 công cụ */}
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setActivePedagogyTab('rubrics')}
                      className={cn(
                        'rounded-lg px-3 py-1.5 transition-all',
                        activePedagogyTab === 'rubrics'
                          ? 'bg-white font-bold text-teal-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900',
                      )}
                    >
                      Rubric A.1.2 &amp; A.1.9
                    </button>
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
                      6 Nguyên tắc GD
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

                {/* Sub-tab 1: Tổng hợp Rubric Đánh giá chính thức A.1.2 & A.1.9 */}
                {activePedagogyTab === 'rubrics' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Thẻ Rubric A.1.2 */}
                      <div className="space-y-3 rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-amber-900">
                            Rubric A.1.2: Xử lý Tình huống Sư phạm
                          </span>
                          <Badge variant="subject">10% Điểm quá trình</Badge>
                        </div>
                        <p className="text-xs leading-relaxed text-stone-600">
                          Đánh giá năng lực vận dụng quy trình 5 bước khoa học vào giải quyết các
                          mâu thuẫn, khủng hoảng giáo dục thực tế tại trường phổ thông.
                        </p>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              1. Nhận diện mâu thuẫn cốt lõi
                            </span>
                            <span className="font-bold text-amber-800">1.0 đ</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              2. Phân tích nguyên nhân tâm lý - GD
                            </span>
                            <span className="font-bold text-amber-800">2.0 đ</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              3. Đề xuất giải pháp khoa học &amp; nhân văn
                            </span>
                            <span className="font-bold text-amber-800">5.0 đ</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              4. Bài học sư phạm phản tư sâu sắc
                            </span>
                            <span className="font-bold text-amber-800">2.0 đ</span>
                          </div>
                        </div>
                        <Button asChild variant="subject" size="sm" className="mt-2 w-full text-xs">
                          <Link to="/mon-hoc/giao-duc-hoc/cong-tac-cua-nguoi-giao-vien-chu-nhiem-lop/thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12">
                            <span>Vào học chi tiết Bài 4.4 theo Rubric A.1.2</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>

                      {/* Thẻ Rubric A.1.9 */}
                      <div className="space-y-3 rounded-2xl border border-teal-200/80 bg-teal-50/30 p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-teal-950">
                            Rubric A.1.9: Kế hoạch &amp; Tổ chức HĐTN
                          </span>
                          <Badge variant="subject">20% Điểm quá trình</Badge>
                        </div>
                        <p className="text-xs leading-relaxed text-stone-600">
                          Đánh giá năng lực thiết kế kế hoạch giáo dục chủ đề theo chu trình David
                          Kolb và kỹ năng điều hành hoạt động trải nghiệm thực tế.
                        </p>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              Phần A: Thiết kế KHBD chủ đề HĐTN
                            </span>
                            <span className="font-bold text-teal-800">5.0 đ</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              Phần B: Kỹ năng điều hành &amp; tương tác
                            </span>
                            <span className="font-bold text-teal-800">5.0 đ</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white p-2">
                            <span className="font-medium text-stone-700">
                              Tiêu chuẩn: CT GDPT 2018 (105 tiết/năm)
                            </span>
                            <span className="font-bold text-teal-800">Mức Tốt</span>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="subject"
                          size="sm"
                          className="mt-2 w-full bg-teal-800 text-xs hover:bg-teal-900"
                        >
                          <Link to="/mon-hoc/giao-duc-hoc/to-chuc-hoat-dong-trai-nghiem-o-truong-pho-thong/danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19">
                            <span>Vào học chi tiết Bài 5.4 theo Rubric A.1.9</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Ma trận 6 nguyên tắc */}
                {activePedagogyTab === 'principles' && <PrincipleMatrix />}

                {/* Sub-tab 3: Tình huống thực tế */}
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
                        caseStudy={PEDAGOGICAL_CASE_STUDIES.find(
                          (c) => c.id === activeCaseStudyId,
                        )!}
                      />
                    )}
                  </div>
                )}

                {/* Sub-tab 4: Trích dẫn pháp quy */}
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
          )}

          {/* 3.2 Dành cho môn Giải tích hàm một biến: Ngân hàng Đề thi qua các năm */}
          {subject.slug === 'giai-tich-ham-mot-bien' && (
            <Card className="border-subject-200/90 from-subject-50/50 bg-gradient-to-br via-white to-amber-50/30 p-6 shadow-xs sm:p-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="subject">
                        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Kho Đề thi Tự luận Chính thức</span>
                      </Badge>
                      <Badge variant="neutral">6 Bộ đề · 41 Câu hỏi · Số hóa KaTeX 100%</Badge>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                      Ngân hàng Đề thi Kết thúc Học phần &amp; Lời giải Thực chiến (2018 – 2026)
                    </h2>
                    <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                      Kho đề thi chính thức được biên tập chuẩn xác từ đề thi thật của Khoa Toán -
                      Tin, tích hợp gợi ý định lý trọng tâm và lời giải chi tiết từng bước cho từng
                      bài toán.
                    </p>
                  </div>
                  <Button asChild variant="subject" size="lg" className="shrink-0 shadow-xs">
                    <Link to={ROUTES.subjectExams(subject.slug)}>
                      <span>Vào phòng Luyện đề &amp; Xem đáp án</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>NĂM HỌC 2025 - 2026</span>
                      <Badge variant="subject">HK1 · 90 phút</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-stone-900">
                      Đề thi Chính thức Học kỳ 1 (2025 – 2026)
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      5 câu tự luận: Epsilon-delta, Vi phân Lagrange, Tích phân Riemann &amp; Chuỗi
                      hàm
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>NĂM HỌC 2024 - 2025</span>
                      <Badge variant="neutral">HK1 · 90 phút</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-stone-900">
                      Đề thi Chính thức Học kỳ 1 (2024 – 2025)
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      5 câu tự luận: Dãy đơn điệu, Khả vi cấp cao, Đạo hàm hàm ngược &amp; Chuỗi lũy
                      thừa
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>CÁC NĂM TRƯỚC</span>
                      <Badge variant="neutral">2018 – 2021</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-stone-900">
                      Kho Đề thi Lưu trữ 4 năm (2018, 2019, 2020, 2021)
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      Tuyển tập 20+ bài toán giải tích kinh điển có lời giải mẫu chặt chẽ
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 3.3 Dành cho môn Cấu trúc đại số: Ngân hàng Đề thi & Đề cương ôn tập */}
          {subject.slug === 'cau-truc-dai-so' && (
            <Card className="border-subject-200/90 from-subject-50/50 bg-gradient-to-br via-white to-amber-50/30 p-6 shadow-xs sm:p-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="subject">
                        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Kho Đề thi Tự luận &amp; Đề cương Chuẩn Sư phạm</span>
                      </Badge>
                      <Badge variant="neutral">
                        2 Bộ đề 90p · 10 Câu hỏi tự luận lớn · Barem 0.25đ · KaTeX 100%
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                      Ngân hàng Đề thi Kết thúc Học phần &amp; Đề cương Trọng tâm CLO
                    </h2>
                    <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                      Kho đề thi chính thức chuẩn chương trình đào tạo Sư phạm Toán học (HCMUE),
                      tích hợp gợi ý định lý cốt lõi, lời giải chi tiết từng bước, barem chấm điểm
                      0.25đ và phân tích bẫy thi thường gặp cho từng bài toán.
                    </p>
                  </div>
                  <Button asChild variant="subject" size="lg" className="shrink-0 shadow-xs">
                    <Link to={ROUTES.subjectExams(subject.slug)}>
                      <span>Vào phòng Luyện đề &amp; Xem đáp án</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>NĂM HỌC 2025 - 2026</span>
                      <Badge variant="subject">HK1 · 90 phút</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-stone-900">
                      Đề thi Chính thức Học kỳ 1 (2025 – 2026)
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      5 câu tự luận: Quan hệ tương đương &amp; phép toán cảm sinh, Cấp phần tử &amp;
                      cyclic, Lớp kề S₃ &amp; Lagrange, Đồng cấu &amp; Đẳng cấu 1, Vành thương
                      ℚ[x]/⟨f⟩
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>NĂM HỌC 2024 - 2025</span>
                      <Badge variant="neutral">HK1 · 90 phút</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-stone-900">
                      Đề thi Chính thức Học kỳ 1 (2024 – 2025)
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      5 câu tự luận: Bảng Cayley &amp; Nhóm cấp 4, Phân loại nhóm cấp 2p, Tự đẳng
                      cấu Aut(ℤₙ), I-đê-an nguyên tố &amp; cực đại, Trường các thương
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>ĐỀ CƯƠNG TRỌNG TÂM</span>
                      <Badge variant="neutral">5 Module · CLO</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-stone-900">
                      Cẩm nang Ôn thi &amp; Phân tích Bẫy thi
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      Khung kiến thức chuẩn đầu ra CLO 1–5, 10 công thức vương miện và phương pháp
                      chứng minh tự luận chuẩn mực
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 3.4 Dành cho môn Hình học Affine: Phòng Lab tương tác */}
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
                    Toàn bộ tài liệu bài giảng 3 chương (Không gian afin, Không gian Ơclit, Không
                    gian xạ ảnh) tích hợp cùng hệ thống 61 bài tập có gợi ý và giải chi tiết từng
                    bước, 47 câu trắc nghiệm nhanh, bộ luyện tính toán tự sinh số liệu và chế độ thi
                    thử thông minh.
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
        </div>
      )}

      {/* =========================================================================
          TAB 4: TỔNG QUAN, MỤC TIÊU & CHUẨN ĐẦU RA (CLOs)
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="space-y-6 border-stone-200/90 bg-white p-6 shadow-xs sm:p-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="subject">Đề cương chi tiết học phần</Badge>
                <Badge variant="neutral">Mã: {subject.shortTitle}</Badge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                Mục tiêu Đào tạo &amp; Chuẩn đầu ra Học phần (CLOs)
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                Học phần được thiết kế đáp ứng chuẩn đầu ra của chương trình đào tạo Cử nhân Sư phạm
                Toán học, kết hợp hài hòa giữa nền tảng học thuật chuyên sâu và năng lực sư phạm
                thực tiễn.
              </p>
            </div>

            {/* Bảng chuẩn đầu ra CLOs phân tầng */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-amber-800 uppercase">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>CLO 1: Phẩm chất &amp; Tác phong</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900">
                  Ý thức kỷ luật &amp; Chuẩn mực nghề nghiệp
                </h3>
                <p className="text-xs leading-relaxed text-stone-600">
                  {subject.slug === 'giao-duc-hoc'
                    ? 'Hình thành tác phong sư phạm mẫu mực, lòng yêu nghề và tinh thần trách nhiệm theo Chuẩn nghề nghiệp GVPT (Thông tư 20/2018).'
                    : 'Rèn luyện tính cẩn trọng, kỷ luật tư duy logic chặt chẽ và niềm say mê nghiên cứu khoa học toán học.'}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-teal-800 uppercase">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  <span>CLO 2: Kiến thức chuyên môn</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900">
                  Hệ thống lý thuyết &amp; Bản chất khoa học
                </h3>
                <p className="text-xs leading-relaxed text-stone-600">
                  {subject.slug === 'giao-duc-hoc'
                    ? 'Nắm vững bản chất xã hội của giáo dục, 6 nguyên tắc giáo dục học sinh và các chức năng nòng cốt của người giáo viên chủ nhiệm.'
                    : 'Nắm vững các hệ tiên đề, định lý cấu trúc, phương pháp chứng minh và các quy tắc tính toán nền tảng của môn học.'}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-stone-800 uppercase">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  <span>CLO 3: Năng lực vận dụng</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900">
                  Kỹ năng thực hành &amp; Tự rèn luyện
                </h3>
                <p className="text-xs leading-relaxed text-stone-600">
                  {subject.slug === 'giao-duc-hoc'
                    ? 'Thành thạo quy trình 5 bước xử lý tình huống giáo dục (Rubric A.1.2) và kỹ năng thiết kế, tổ chức Hoạt động trải nghiệm (Rubric A.1.9).'
                    : 'Vận dụng linh hoạt các định lý vào giải quyết hệ thống bài tập chuyên đề, đề thi tự luận và trực quan hóa mô hình tương tác.'}
                </p>
              </div>
            </div>

            {/* Quy chuẩn đánh giá học phần */}
            <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900">
                <Scale className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Quy chuẩn &amp; Trọng số Đánh giá Học phần</span>
              </h3>
              <div className="grid gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-xl border border-stone-200/70 bg-stone-50 p-3">
                  <span className="mb-1 block font-bold text-stone-800">
                    Đánh giá Thường xuyên (10%)
                  </span>
                  <p className="text-stone-600">
                    Chuyên cần, tham gia thảo luận trên lớp và hoàn thành các bài học trực tuyến.
                  </p>
                </div>
                <div className="rounded-xl border border-stone-200/70 bg-stone-50 p-3">
                  <span className="mb-1 block font-bold text-stone-800">
                    Đánh giá Quá trình (30% - 40%)
                  </span>
                  <p className="text-stone-600">
                    Bài kiểm tra giữa kỳ, bài tập thực hành theo rubric hoặc đề tài nghiên cứu
                    chuyên đề.
                  </p>
                </div>
                <div className="rounded-xl border border-stone-200/70 bg-stone-50 p-3">
                  <span className="mb-1 block font-bold text-stone-800">
                    Đánh giá Cuối kỳ (50% - 60%)
                  </span>
                  <p className="text-stone-600">
                    Thi kết thúc học phần tự luận 90 phút hoặc báo cáo đề án tốt nghiệp môn học.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Danh mục tài liệu tham khảo chính thức của môn học */}
          <SubjectBibliography subject={subject} />
        </div>
      )}
    </FadeIn>
  );
}

export default SubjectOverviewPage;
