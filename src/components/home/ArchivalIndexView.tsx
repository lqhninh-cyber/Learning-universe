import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  Filter,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { ManifestChapter, ManifestLesson, ManifestSubject } from '@schemas/index';
import { getSubjectStats } from '@/content-runtime';
import { type AcademicBranch, getCourseCinematicAsset } from '@/data/cinematicAssets';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';

export interface ArchivalIndexViewProps {
  readonly subjects: readonly ManifestSubject[];
  readonly activeBranch: 'all' | AcademicBranch;
  readonly externalQuery?: string;
}

interface ArchivalSubjectStyle {
  readonly code: string;
  readonly dotHex: string;
  readonly pillClass: string;
  readonly accentTextClass: string;
}

const DEFAULT_ARCHIVAL_STYLE: ArchivalSubjectStyle = {
  code: 'CTĐS',
  dotHex: '#8C5828',
  pillClass:
    'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
  accentTextClass: 'text-[#8C5828] dark:text-[#D99B5E]',
};

const ARCHIVAL_SUBJECT_STYLES: Record<string, ArchivalSubjectStyle> = {
  'cau-truc-dai-so': DEFAULT_ARCHIVAL_STYLE,
  'hinh-hoc-affine': {
    code: 'HHAVE',
    dotHex: '#1D4F6E',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    accentTextClass: 'text-[#1D4F6E] dark:text-[#64A8D1]',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    dotHex: '#1B5E4A',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    accentTextClass: 'text-[#1B5E4A] dark:text-[#52B394]',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    dotHex: '#8F3D35',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    accentTextClass: 'text-[#8F3D35] dark:text-[#DF7B70]',
  },
};

function getLessonArchivalCode(
  _courseCode: string,
  chapter: ManifestChapter,
  lesson: ManifestLesson,
): string {
  return `C${chapter.number}.B${String(lesson.number).padStart(2, '0')}`;
}

function getLessonCloAndPagesBadge(chapter: ManifestChapter, lesson: ManifestLesson): string {
  const cloTags = lesson.tags.filter((t) => /^CLO\d+/i.test(t));
  const pageSource = lesson.sources.find((s) => Boolean(s.pages));
  const parts: string[] = [];

  if (cloTags.length > 0) {
    parts.push(cloTags.join(', '));
  }
  if (pageSource?.pages) {
    parts.push(`Tr. ${pageSource.pages}`);
  }
  if (parts.length === 0) {
    parts.push(`Chương ${chapter.number} · ${lesson.estimatedMinutes} phút`);
  }
  return parts.join(' · ');
}

function getSubjectStructureSummary(subject: ManifestSubject): string {
  if (subject.slug === 'giao-duc-hoc') {
    return '5 chương lý thuyết, 3 bài thực hành, 9 CLO';
  }
  const stats = getSubjectStats(subject);
  return `${stats.chapterCount} chương, ${stats.lessonCount} bài`;
}

export function ArchivalIndexView({
  subjects,
  activeBranch,
  externalQuery = '',
}: ArchivalIndexViewProps) {
  const [archivalFilter, setArchivalFilter] = useState('');
  const [selectedClo, setSelectedClo] = useState<string>('ALL');
  const [collapsedSlugs, setCollapsedSlugs] = useState<Record<string, boolean>>({});

  const combinedQuery = `${externalQuery} ${archivalFilter}`.trim();

  const toggleSubjectCollapse = (slug: string) => {
    setCollapsedSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const expandAll = () => {
    setCollapsedSlugs({});
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const sub of subjects) {
      next[sub.slug] = true;
    }
    setCollapsedSlugs(next);
  };

  const filteredModules = useMemo(() => {
    return subjects
      .filter((subject) => {
        const asset = getCourseCinematicAsset(subject.slug);
        if (activeBranch !== 'all' && asset.branch !== activeBranch) {
          return false;
        }
        return true;
      })
      .map((subject) => {
        const asset = getCourseCinematicAsset(subject.slug);
        const filteredChapters = subject.chapters
          .map((chapter) => {
            const matchingLessons = chapter.lessons.filter((lesson) => {
              const code = getLessonArchivalCode(asset.courseCode, chapter, lesson);
              const metaBadge = getLessonCloAndPagesBadge(chapter, lesson);

              if (selectedClo !== 'ALL') {
                const hasClo = lesson.tags.some(
                  (t) => t.toUpperCase() === selectedClo.toUpperCase(),
                );
                if (!hasClo) {
                  return false;
                }
              }

              if (combinedQuery.length > 0) {
                const searchable = `${subject.title} ${asset.categoryLabel} Chương ${chapter.number} ${chapter.title} ${code} ${lesson.title} ${lesson.description} ${metaBadge} ${lesson.tags.join(' ')}`;
                return matchesVietnameseQuery(searchable, combinedQuery);
              }

              return true;
            });

            return {
              chapter,
              lessons: matchingLessons,
            };
          })
          .filter((item) => item.lessons.length > 0);

        return {
          subject,
          asset,
          chapters: filteredChapters,
          totalMatchedLessons: filteredChapters.reduce((sum, item) => sum + item.lessons.length, 0),
        };
      })
      .filter((mod) => mod.totalMatchedLessons > 0);
  }, [activeBranch, combinedQuery, selectedClo, subjects]);

  return (
    <div data-testid="archival-index-view" className="space-y-6">
      {/* Thanh công cụ lọc nhanh Văn khố: Tìm theo chương, bài, mã bài hoặc CLO */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Filter
              className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={archivalFilter}
              onChange={(e) => setArchivalFilter(e.target.value)}
              placeholder="Lọc nhanh mục lục văn khố theo tên chương, tên bài, mã bài hoặc chuẩn CLO (VD: CLO6, Lagrange, Nhóm)..."
              aria-label="Lọc nhanh mục lục văn khố"
              className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] pr-8 pl-9 text-xs text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-os)]"
            />
            {archivalFilter && (
              <button
                type="button"
                onClick={() => setArchivalFilter('')}
                aria-label="Xóa bộ lọc văn khố"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Bộ lọc nhanh theo Chuẩn đầu ra CLO */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] font-semibold text-[var(--text-muted)] uppercase">
              CLO:
            </span>
            {(['ALL', 'CLO1', 'CLO3', 'CLO4', 'CLO6', 'CLO8', 'CLO9'] as const).map((clo) => (
              <button
                key={clo}
                type="button"
                onClick={() => setSelectedClo(clo)}
                className={cn(
                  'cursor-pointer rounded-md px-2 py-1 font-mono text-[10px] font-semibold transition-colors',
                  selectedClo === clo
                    ? 'bg-[var(--accent-os)] text-white'
                    : 'border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                {clo === 'ALL' ? 'Tất cả' : clo}
              </button>
            ))}
          </div>
        </div>

        {/* Nút Mở rộng / Thu gọn tất cả */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1.5 font-mono text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mở rộng tất cả</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1.5 font-mono text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]"
          >
            <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thu gọn tất cả</span>
          </button>
        </div>
      </div>

      {/* Danh sách 4 Học phần dạng Collapsible Academic Modules */}
      {filteredModules.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-12 text-center">
          <p className="font-serif text-base font-semibold text-[var(--text-main)]">
            Không tìm thấy bài học nào khớp với tiêu chí lọc văn khố hiện tại.
          </p>
          <button
            type="button"
            onClick={() => {
              setArchivalFilter('');
              setSelectedClo('ALL');
            }}
            className="mt-3 cursor-pointer rounded-lg bg-[var(--accent-os)] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-95"
          >
            Đặt lại bộ lọc văn khố
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredModules.map(({ subject, asset, chapters }) => {
            const isCollapsed = Boolean(collapsedSlugs[subject.slug]);
            const summaryLabel = getSubjectStructureSummary(subject);
            const subjectStyle = ARCHIVAL_SUBJECT_STYLES[subject.slug] ?? DEFAULT_ARCHIVAL_STYLE;

            return (
              <section
                key={subject.id}
                data-testid={`archival-module-${subject.slug}`}
                aria-label={subject.title}
                className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              >
                {/* Header Học phần (Collapsible Module Header) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] bg-[var(--bg-shell)]/70 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSubjectCollapse(subject.slug)}
                    aria-expanded={!isCollapsed}
                    className="flex flex-1 cursor-pointer items-center gap-3 text-left"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        data-testid={`archival-subject-badge-${subject.slug}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider',
                          subjectStyle.pillClass,
                        )}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: subjectStyle.dotHex }}
                          aria-hidden="true"
                        />
                        <span>{subjectStyle.code}</span>
                        <span className="opacity-50" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-semibold tracking-normal">{asset.categoryLabel}</span>
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[var(--text-main)] sm:text-xl">
                        {subject.title}
                      </h3>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        ({summaryLabel})
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={ROUTES.courseOverview(subject.slug)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)] hover:bg-[var(--accent-os)] hover:text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Vào học phần</span>
                    </Link>
                  </div>
                </div>

                {/* Cây mục lục Chương & Dòng dữ liệu Bài học (Data Rows) */}
                {!isCollapsed && (
                  <div className="divide-y divide-[var(--border-hairline)]">
                    {chapters.map(({ chapter, lessons }) => (
                      <div key={chapter.id} className="p-4 sm:px-6">
                        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                          <h4
                            className={cn(
                              'font-mono text-xs font-bold tracking-wide uppercase',
                              subjectStyle.accentTextClass,
                            )}
                          >
                            Chương {String(chapter.number).padStart(2, '0')}: {chapter.title}
                          </h4>
                          <span className="font-mono text-[11px] text-[var(--text-muted)]">
                            {lessons.length} bài giảng
                          </span>
                        </div>

                        <div className="divide-y divide-[var(--border-hairline)] overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]">
                          {lessons.map((lesson) => {
                            const lessonCode = getLessonArchivalCode(
                              asset.courseCode,
                              chapter,
                              lesson,
                            );
                            const fullLessonTitle = lesson.title.startsWith('Bài')
                              ? lesson.title
                              : `Bài ${chapter.number}.${lesson.number}: ${lesson.title}`;
                            const cloAndPages = getLessonCloAndPagesBadge(chapter, lesson);
                            const lessonHref = ROUTES.lesson(
                              subject.slug,
                              chapter.slug,
                              lesson.slug,
                            );

                            return (
                              <div
                                key={lesson.id}
                                data-testid="archival-lesson-row"
                                className="flex flex-col justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-[var(--bg-surface)] sm:flex-row sm:items-center"
                              >
                                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2.5">
                                  <span
                                    className={cn(
                                      'shrink-0 font-mono text-xs font-semibold',
                                      subjectStyle.accentTextClass,
                                    )}
                                  >
                                    [{lessonCode}]
                                  </span>
                                  <span
                                    className="text-[var(--border-hairline)]"
                                    aria-hidden="true"
                                  >
                                    ·
                                  </span>
                                  <Link
                                    to={lessonHref}
                                    className="font-serif text-sm font-medium text-[var(--text-main)] transition-colors hover:text-[var(--accent-os)] hover:underline"
                                  >
                                    {fullLessonTitle}
                                  </Link>
                                </div>

                                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                                  <span className="inline-flex items-center gap-1 rounded bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                                    <FileText
                                      className="h-3 w-3 text-[var(--text-secondary)]"
                                      aria-hidden="true"
                                    />
                                    <span>{cloAndPages}</span>
                                  </span>

                                  <Link
                                    to={lessonHref}
                                    aria-label={`Đọc bài ${fullLessonTitle}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)] hover:bg-[var(--accent-os)] hover:text-white"
                                  >
                                    <span>Đọc bài</span>
                                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
