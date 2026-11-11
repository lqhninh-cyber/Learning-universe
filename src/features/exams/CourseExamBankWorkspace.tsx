import {
  ArrowRight,
  BarChart3,
  Calendar,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { CourseExamBank } from '@/data/courses/exam-bank-types';
import { ExamPaperPracticeView } from '@/features/exams/ExamPaperPracticeView';
import { MatrixAnalysisView } from '@/features/exams/MatrixAnalysisView';
import { MathGlossaryPopover, MathGlossaryProvider } from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Badge, Button, Card } from '@/shared/ui';

export type ExamBankSectionTab = 'official' | 'matrix' | 'mock';

export interface CourseExamBankWorkspaceProps {
  readonly bank: CourseExamBank;
  readonly defaultSection?: ExamBankSectionTab;
  readonly showFullPageLink?: boolean;
  readonly withGlossaryProvider?: boolean;
}

const SECTION_TABS: ReadonlyArray<{
  readonly id: ExamBankSectionTab;
  readonly label: string;
  readonly icon: typeof FileCheck2;
}> = [
  {
    id: 'official',
    label: 'Đề thi chính thức & Lời giải chuẩn',
    icon: FileCheck2,
  },
  {
    id: 'matrix',
    label: 'Phân tích cấu trúc & Chiến lược ôn tập',
    icon: BarChart3,
  },
  {
    id: 'mock',
    label: 'Đề ôn tập mẫu bám sát cấu trúc',
    icon: ClipboardCheck,
  },
];

function ExamBankWorkspaceContent({
  bank,
  defaultSection = 'official',
  showFullPageLink = true,
}: Omit<CourseExamBankWorkspaceProps, 'withGlossaryProvider'>) {
  const [activeSection, setActiveSection] = useState<ExamBankSectionTab>(defaultSection);
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>(
    bank.officialExams[0]?.id ?? '',
  );
  const [selectedMockId, setSelectedMockId] = useState<string>(bank.mockExams[0]?.id ?? '');

  // Đồng bộ đề mặc định khi chuyển giữa MATH1301 và MATH1302
  const [prevSlug, setPrevSlug] = useState(bank.subjectSlug);
  if (prevSlug !== bank.subjectSlug) {
    setPrevSlug(bank.subjectSlug);
    setActiveSection(defaultSection);
    setSelectedOfficialId(bank.officialExams[0]?.id ?? '');
    setSelectedMockId(bank.mockExams[0]?.id ?? '');
  }

  const activeOfficialPaper = useMemo(
    () =>
      bank.officialExams.find((paper) => paper.id === selectedOfficialId) ?? bank.officialExams[0],
    [bank.officialExams, selectedOfficialId],
  );

  const activeMockPaper = useMemo(
    () => bank.mockExams.find((paper) => paper.id === selectedMockId) ?? bank.mockExams[0],
    [bank.mockExams, selectedMockId],
  );

  return (
    <div className="space-y-6">
      {/* Header Khu vực Ngân hàng Đề thi & Lời giải */}
      <Card className="border-subject-200/90 bg-[var(--bg-surface)] p-5 shadow-xs sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subject">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ngân hàng Đề thi &amp; Lời giải</span>
              </Badge>
              <Badge variant="neutral" className="font-mono font-semibold">
                {bank.courseCode} · Mã HP đề thi: {bank.examCourseCode}
              </Badge>
            </div>

            <h2 className="font-serif text-xl font-bold tracking-tight text-[var(--text-main)] sm:text-2xl">
              Kho Đề thi Kết thúc Học phần, Ma trận &amp; Đề mẫu — {bank.courseTitle}
            </h2>

            <p className="max-w-3xl text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
              {bank.subtitle}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {bank.subjectSlug === 'hinh-hoc-affine' && (
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <a
                  href="/interactive/affine-geometry.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Sparkles className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
                  <span>Phòng Lab 3D</span>
                  <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
                </a>
              </Button>
            )}
            {showFullPageLink && (
              <Button asChild variant="subject" size="sm" className="gap-1.5 text-xs">
                <Link to={ROUTES.subjectExams(bank.subjectSlug)}>
                  <span>Mở chế độ Toàn trang</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* 3 Sub-tabs Phân khu Học thuật */}
        <div
          role="tablist"
          aria-label="Phân khu Ngân hàng Đề thi và Lời giải"
          className="mt-5 grid gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/70 p-1.5 md:grid-cols-3"
        >
          {SECTION_TABS.map((tab, index) => {
            const isActive = activeSection === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  'flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] active:scale-[0.98] sm:text-sm',
                  isActive
                    ? 'bg-subject-600 text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:-translate-y-0.5 hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]',
                )}
              >
                <TabIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-left leading-snug">
                  <span className="mr-1 font-mono opacity-80">{index + 1}.</span>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Phân khu 1: Đề thi chính thức & Lời giải chuẩn */}
      {activeSection === 'official' && activeOfficialPaper && (
        <div className="space-y-4">
          {bank.officialExams.length > 1 && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold text-[var(--text-muted)] uppercase">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Chọn đề thi chính thức</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bank.officialExams.map((paper, idx) => {
                  const isSelected = paper.id === activeOfficialPaper.id;
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => setSelectedOfficialId(paper.id)}
                      className={cn(
                        'inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] active:scale-[0.98]',
                        isSelected
                          ? 'border-subject-600 bg-subject-600 text-white shadow-xs'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-sunken)]/60 text-[var(--text-main)] hover:border-[var(--border-control)]',
                      )}
                    >
                      <span>{paper.year}</span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
                        )}
                      >
                        {paper.semester}
                      </span>
                      {paper.examCourseCode && (
                        <span className="font-mono text-[10px] opacity-85">
                          ({paper.examCourseCode})
                        </span>
                      )}
                      {idx === 0 && (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase',
                            isSelected
                              ? 'bg-amber-300 text-stone-950'
                              : 'bg-amber-100 text-amber-900',
                          )}
                        >
                          Chuẩn mới
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <ExamPaperPracticeView paper={activeOfficialPaper} variantLabel="Đề thi chính thức" />
        </div>
      )}

      {/* Phân khu 2: Phân tích cấu trúc & Chiến lược ôn tập */}
      {activeSection === 'matrix' && (
        <MatrixAnalysisView subjectSlug={bank.subjectSlug} analysis={bank.matrixAnalysis} />
      )}

      {/* Phân khu 3: Đề ôn tập mẫu bám sát cấu trúc */}
      {activeSection === 'mock' && activeMockPaper && (
        <div className="space-y-4">
          {bank.mockExams.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {bank.mockExams.map((paper) => {
                const isSelected = paper.id === activeMockPaper.id;
                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => setSelectedMockId(paper.id)}
                    className={cn(
                      'min-h-[40px] cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all',
                      isSelected
                        ? 'border-subject-600 bg-subject-600 text-white'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)]',
                    )}
                  >
                    {paper.semester}
                  </button>
                );
              })}
            </div>
          )}

          <ExamPaperPracticeView
            paper={activeMockPaper}
            variantLabel="Đề ôn tập mẫu bám sát cấu trúc"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Không gian Ngân hàng Đề thi & Lời giải chuẩn hóa cho trang chi tiết học phần (`MATH1301`, `MATH1302`).
 */
export function CourseExamBankWorkspace({
  withGlossaryProvider = true,
  ...props
}: CourseExamBankWorkspaceProps) {
  if (!withGlossaryProvider) {
    return <ExamBankWorkspaceContent {...props} />;
  }

  return (
    <MathGlossaryProvider courseId={props.bank.subjectSlug}>
      <ExamBankWorkspaceContent {...props} />
      <MathGlossaryPopover />
    </MathGlossaryProvider>
  );
}
