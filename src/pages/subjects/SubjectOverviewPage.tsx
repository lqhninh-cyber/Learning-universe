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
import { useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { getSubjectBySlug, getSubjectStats } from '@/content-runtime';
import { getCourseExamBank } from '@/data/courses/exam-banks';
import {
  EDUC2802_CLOS,
  EDUC2802_SYLLABUS_META,
  PEDAGOGY_DOCUMENTS,
  PEDAGOGICAL_CASE_STUDIES,
} from '@/data/courses/giao-duc-hoc/course';
import { CourseExamBankWorkspace } from '@/features/exams/CourseExamBankWorkspace';
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

function resolveWorkspaceTab(rawTab: string | null): CourseWorkspaceTab | null {
  if (!rawTab) return null;
  if (rawTab === 'exams') return 'specialized';
  if (
    rawTab === 'roadmap' ||
    rawTab === 'documents' ||
    rawTab === 'specialized' ||
    rawTab === 'overview'
  ) {
    return rawTab;
  }
  return null;
}

interface CourseTabDef {
  readonly id: CourseWorkspaceTab;
  readonly label: string;
  readonly badge?: string | number;
  readonly icon: typeof BookOpen;
}

export function SubjectOverviewPage() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const [searchParams] = useSearchParams();
  const subject = subjectSlug ? getSubjectBySlug(subjectSlug) : undefined;
  const workspaceTabsRef = useRef<HTMLDivElement>(null);

  const urlTab = resolveWorkspaceTab(searchParams.get('tab'));
  const initialTab: CourseWorkspaceTab = urlTab ?? 'roadmap';

  const [activeTab, setActiveTab] = useState<CourseWorkspaceTab>(initialTab);
  const [prevUrlTab, setPrevUrlTab] = useState(urlTab);
  if (urlTab !== prevUrlTab) {
    setPrevUrlTab(urlTab);
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }

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
    } else if (
      subject.slug === 'giai-tich-ham-mot-bien' ||
      subject.slug === 'cau-truc-dai-so' ||
      subject.slug === 'hinh-hoc-affine'
    ) {
      tabs.push({
        id: 'specialized',
        label: 'Ôn tập',
        icon: GraduationCap,
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

  const courseExamBank = useMemo(
    () => (subject ? getCourseExamBank(subject.slug) : undefined),
    [subject],
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

  const handleOpenSpecializedTab = () => {
    setActiveTab('specialized');
    workspaceTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <FadeIn className="mx-auto w-[min(94vw,1520px)] space-y-8">
      {/* =========================================================================
          KHU VỰC 1: CINEMATIC COURSE HERO TRÀN VIỀN (FULL-BLEED 100VW)
          ========================================================================= */}
      <SubjectHero subject={subject} onSelectSpecializedTab={handleOpenSpecializedTab} />

      {/* =========================================================================
          KHU VỰC 2: THANH TAB ĐIỀU HƯỚNG WORKSPACE (COURSE WORKSPACE TABS)
          ========================================================================= */}
      <div
        ref={workspaceTabsRef}
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
                    <Badge variant="neutral">4 Tín chỉ · Toán học</Badge>
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
                        phần Giải tích hàm một biến.
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

                  {/* Tài liệu 3: Ôn tập & Đề thi thực chiến */}
                  <div className="border-subject-300 from-subject-50/50 hover:border-subject-400 flex flex-col justify-between rounded-2xl border bg-gradient-to-br via-white to-amber-50/30 p-5 shadow-2xs transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-subject-800 text-xs font-bold tracking-wider uppercase">
                          Ôn tập thực chiến
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
                          <span>Vào ôn tập &amp; luyện đề</span>
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

                {/* Sub-tab 1: Tổng hợp 3 Bài Thực hành Nghiệp vụ Sư phạm (EDUC2802) */}
                {activePedagogyTab === 'rubrics' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                      {/* Thẻ Thực hành 1 */}
                      <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/60 p-5">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm font-bold text-[#29383D]">
                              Thực hành 1: 20 Tình huống Sư phạm
                            </span>
                            <Badge variant="subject">CLO4, CLO5</Badge>
                          </div>
                          <p className="text-xs leading-relaxed text-[#55676B]">
                            Phân tích và giải quyết 20 tình huống sư phạm thực tế ở trường phổ thông
                            theo đúng quy trình 5 bước (Mục 3.3.6 Giáo trình HCMUE tr. 65–66).
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-2">
                              <span className="font-medium text-[#29383D]">
                                Quy trình chuẩn HCMUE
                              </span>
                              <span className="font-bold text-[#3F6570]">5 bước xử lí</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-2">
                              <span className="font-medium text-[#29383D]">
                                Ngân hàng tình huống
                              </span>
                              <span className="font-bold text-[#3F6570]">20 tình huống</span>
                            </div>
                          </div>
                        </div>
                        <Button asChild variant="subject" size="sm" className="mt-2 w-full text-xs">
                          <Link to="/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te">
                            <span>Vào học Thực hành 1</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>

                      {/* Thẻ Thực hành 2 */}
                      <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/60 p-5">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm font-bold text-[#29383D]">
                              Thực hành 2: Kế hoạch GVCN &amp; SHL
                            </span>
                            <Badge variant="subject">CLO6, CLO7</Badge>
                          </div>
                          <p className="text-xs leading-relaxed text-[#55676B]">
                            Lập kế hoạch giáo dục lớp chủ nhiệm theo quy trình 6 bước (Giáo trình
                            tr. 71–73) và thiết kế kịch bản tiết Sinh hoạt lớp tự quản.
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-2">
                              <span className="font-medium text-[#29383D]">
                                Kế hoạch chủ nhiệm lớp
                              </span>
                              <span className="font-bold text-[#3F6570]">Quy trình 6 bước</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-2">
                              <span className="font-medium text-[#29383D]">Tiết Sinh hoạt lớp</span>
                              <span className="font-bold text-[#3F6570]">Kịch bản tự quản</span>
                            </div>
                          </div>
                        </div>
                        <Button asChild variant="subject" size="sm" className="mt-2 w-full text-xs">
                          <Link to="/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop">
                            <span>Vào học Thực hành 2</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>

                      {/* Thẻ Thực hành 3 */}
                      <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/60 p-5">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm font-bold text-[#29383D]">
                              Thực hành 3: Kế hoạch Chủ đề HĐTN
                            </span>
                            <Badge variant="subject">CLO8, CLO9</Badge>
                          </div>
                          <p className="text-xs leading-relaxed text-[#55676B]">
                            Thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp tích hợp
                            tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 THCS &amp; THPT.
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-2">
                              <span className="font-medium text-[#29383D]">Học liệu đối chiếu</span>
                              <span className="font-bold text-[#3F6570]">Mô đun 2 THCS/THPT</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-2">
                              <span className="font-medium text-[#29383D]">
                                Chương trình HĐTN 2018
                              </span>
                              <span className="font-bold text-[#3F6570]">105 tiết/năm</span>
                            </div>
                          </div>
                        </div>
                        <Button asChild variant="subject" size="sm" className="mt-2 w-full text-xs">
                          <Link to="/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep">
                            <span>Vào học Thực hành 3</span>
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
                        to="/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te"
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

          {/* 3.2 Dành cho môn Giải tích hàm một biến: Khu vực Ôn tập qua các năm */}
          {subject.slug === 'giai-tich-ham-mot-bien' && (
            <Card className="border-subject-200/90 from-subject-50/50 bg-gradient-to-br via-white to-amber-50/30 p-6 shadow-xs sm:p-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="subject">
                        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Ôn tập</span>
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                      Ôn tập môn {subject.title}
                    </h2>
                  </div>
                  <Button asChild variant="subject" size="lg" className="shrink-0 shadow-xs">
                    <Link to={ROUTES.subjectExams(subject.slug)}>
                      <span>Vào ôn tập &amp; Luyện đề</span>
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

          {/* 3.3 & 3.4 Dành cho môn Cấu trúc đại số (MATH1301) & Hình học Affine (MATH1302):
              Ngân hàng Đề thi & Lời giải chuẩn 3 phân khu */}
          {courseExamBank && <CourseExamBankWorkspace bank={courseExamBank} />}

          {/* Bổ sung lối vào Phòng Lab 3D cho Hình học Affine & Euclid */}
          {subject.slug === 'hinh-hoc-affine' && (
            <Card className="border-subject-200/90 bg-[var(--bg-surface)] p-5 shadow-xs sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="subject">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Phòng Lab Tương tác Hình học</span>
                    </Badge>
                    <Badge variant="neutral">61 Bài tập · 47 Trắc nghiệm · Mô phỏng 3D</Badge>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-main)] sm:text-lg">
                    Phòng Lab &amp; Ôn tập tương tác Hình học cao cấp
                  </h3>
                  <p className="max-w-2xl text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
                    Thực hành trực quan 3 chương (Không gian afin, Không gian Ơclit, Không gian xạ
                    ảnh) cùng bộ sinh đề luyện tập tự động.
                  </p>
                </div>
                <div className="shrink-0">
                  <Button asChild variant="outline" size="md">
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="subject">Đề cương chi tiết học phần</Badge>
                {subject.slug === 'giao-duc-hoc' && (
                  <>
                    <Badge variant="neutral">{EDUC2802_SYLLABUS_META.credits}</Badge>
                    <Badge variant="neutral">{EDUC2802_SYLLABUS_META.structureSummary}</Badge>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                Mục tiêu Đào tạo &amp; Chuẩn đầu ra Học phần (CLOs)
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                {subject.slug === 'giao-duc-hoc'
                  ? `Học phần ${EDUC2802_SYLLABUS_META.courseName} (Khóa ${EDUC2802_SYLLABUS_META.cohort}): ${EDUC2802_SYLLABUS_META.credits} gồm ${EDUC2802_SYLLABUS_META.classHours} và ${EDUC2802_SYLLABUS_META.selfStudyHours}, bám sát ${EDUC2802_SYLLABUS_META.textbookTitle}.`
                  : 'Học phần được thiết kế đáp ứng chuẩn đầu ra của chương trình đào tạo Cử nhân Sư phạm Toán học, kết hợp hài hòa giữa nền tảng học thuật chuyên sâu và năng lực sư phạm thực tiễn.'}
              </p>
            </div>

            {subject.slug === 'giao-duc-hoc' ? (
              <div className="space-y-4">
                {/* Thông số Đề cương Giáo dục học */}
                <div className="grid gap-3 rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-3">
                    <span className="block font-mono text-[11px] font-semibold text-[#55676B] uppercase">
                      Thời lượng tín chỉ
                    </span>
                    <strong className="mt-1 block font-serif text-base font-bold text-[#29383D]">
                      04 tín chỉ (80 tiết lớp)
                    </strong>
                    <span className="text-[11px] text-[#55676B]">40 LT · 20 TL · 20 TH</span>
                  </div>
                  <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-3">
                    <span className="block font-mono text-[11px] font-semibold text-[#55676B] uppercase">
                      Thời lượng tự học
                    </span>
                    <strong className="mt-1 block font-serif text-base font-bold text-[#29383D]">
                      120 giờ tự học
                    </strong>
                    <span className="text-[11px] text-[#55676B]">
                      Nghiên cứu giáo trình &amp; bài tập
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-3">
                    <span className="block font-mono text-[11px] font-semibold text-[#55676B] uppercase">
                      Cấu trúc học phần
                    </span>
                    <strong className="mt-1 block font-serif text-base font-bold text-[#29383D]">
                      5 Chương &amp; 3 Thực hành
                    </strong>
                    <span className="text-[11px] text-[#55676B]">Chuẩn Giáo trình HCMUE</span>
                  </div>
                </div>

                {/* Hệ thống 9 Chuẩn đầu ra (CLO1 đến CLO9) */}
                <div className="grid gap-3 md:grid-cols-3">
                  {EDUC2802_CLOS.map((item) => (
                    <div
                      key={item.code}
                      className="flex flex-col justify-between space-y-2 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-bold text-[#3F6570]">
                            <ShieldCheck
                              className="h-3.5 w-3.5 text-[#718C7E]"
                              aria-hidden="true"
                            />
                            <span>{item.code}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-[#55676B]">
                            {item.group}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-[#29383D]">{item.description}</p>
                      </div>
                      <div className="border-t border-[#CFDADB] pt-2 text-[11px] font-medium text-[#55676B]">
                        Đáp ứng tại: <strong className="text-[#29383D]">{item.chapters}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Bảng chuẩn đầu ra CLOs phân tầng cho các môn Toán */
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
                    Rèn luyện tính cẩn trọng, kỷ luật tư duy logic chặt chẽ và niềm say mê nghiên
                    cứu khoa học toán học.
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
                    Nắm vững các hệ tiên đề, định lý cấu trúc, phương pháp chứng minh và các quy tắc
                    tính toán nền tảng của môn học.
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
                    Vận dụng linh hoạt các định lý vào giải quyết hệ thống bài tập chuyên đề, đề thi
                    tự luận và trực quan hóa mô hình tương tác.
                  </p>
                </div>
              </div>
            )}

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
