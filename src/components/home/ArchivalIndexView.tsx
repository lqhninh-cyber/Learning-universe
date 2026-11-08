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

function getLessonArchivalCode(
  courseCode: string,
  chapter: ManifestChapter,
  lesson: ManifestLesson,
): string {
  const explicitTag = lesson.tags.find((t) => /^(MATH1301|MATH1302|MATH1303|EDUC2802)-/i.test(t));
  if (explicitTag) {
    return explicitTag.toUpperCase();
  }
  return `${courseCode}-C${chapter.number}-L${String(lesson.number).padStart(2, '0')}`;
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
                const searchable = `${asset.courseCode} ${subject.title} Chương ${chapter.number} ${chapter.title} ${code} ${lesson.title} ${lesson.description} ${metaBadge} ${lesson.tags.join(' ')}`;
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
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-4 shadow-2xs lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Filter
              className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#55676B]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={archivalFilter}
              onChange={(e) => setArchivalFilter(e.target.value)}
              placeholder="Lọc nhanh mục lục văn khố theo tên chương, tên bài, mã bài hoặc chuẩn CLO (VD: CLO6, Lagrange, Nhóm)..."
              aria-label="Lọc nhanh mục lục văn khố"
              className="h-9 w-full rounded-xl border border-[#CFDADB] bg-white pr-8 pl-9 text-xs text-[#29383D] outline-none placeholder:text-[#55676B]/75 focus:border-[#3F6570]"
            />
            {archivalFilter && (
              <button
                type="button"
                onClick={() => setArchivalFilter('')}
                aria-label="Xóa bộ lọc văn khố"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-[#55676B] hover:text-[#29383D]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Bộ lọc nhanh theo Chuẩn đầu ra CLO */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] font-semibold text-[#55676B] uppercase">
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
                    ? 'bg-[#3F6570] text-white'
                    : 'border border-[#CFDADB] bg-white text-[#55676B] hover:text-[#29383D]',
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
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-white px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#3F6570] transition-colors hover:bg-[#E1E9EA]/60"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mở rộng tất cả</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-white px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#55676B] transition-colors hover:bg-[#E1E9EA]/60 hover:text-[#29383D]"
          >
            <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thu gọn tất cả</span>
          </button>
        </div>
      </div>

      {/* Danh sách 4 Học phần dạng Collapsible Academic Modules */}
      {filteredModules.length === 0 ? (
        <div className="rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-12 text-center">
          <p className="font-serif text-base font-semibold text-[#29383D]">
            Không tìm thấy bài học nào khớp với tiêu chí lọc văn khố hiện tại.
          </p>
          <button
            type="button"
            onClick={() => {
              setArchivalFilter('');
              setSelectedClo('ALL');
            }}
            className="mt-3 cursor-pointer rounded-xl bg-[#3F6570] px-4 py-2 text-xs font-medium text-white hover:bg-[#345761]"
          >
            Đặt lại bộ lọc văn khố
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredModules.map(({ subject, asset, chapters }) => {
            const isCollapsed = Boolean(collapsedSlugs[subject.slug]);
            const summaryLabel = getSubjectStructureSummary(subject);
            const isPedagogy = asset.branch === 'pedagogy';

            return (
              <section
                key={subject.id}
                data-testid={`archival-module-${asset.courseCode}`}
                aria-label={`${asset.courseCode}: ${subject.title}`}
                className="overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-2xs"
              >
                {/* Header Học phần (Collapsible Module Header) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#CFDADB] bg-[#E1E9EA]/55 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSubjectCollapse(subject.slug)}
                    aria-expanded={!isCollapsed}
                    className="flex flex-1 cursor-pointer items-center gap-3 text-left"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#CFDADB] bg-[#F7FAFA] text-[#3F6570]">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>

                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <span
                        className={cn(
                          'rounded-md px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider',
                          isPedagogy ? 'bg-[#5E786D] text-white' : 'bg-[#3F6570] text-white',
                        )}
                      >
                        {asset.courseCode}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#29383D] sm:text-xl">
                        {subject.title}
                      </h3>
                      <span className="font-mono text-xs text-[#55676B]">({summaryLabel})</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={ROUTES.courseOverview(subject.slug)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#3F6570] transition-colors hover:border-[#3F6570] hover:bg-[#3F6570] hover:text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Vào học phần</span>
                    </Link>
                  </div>
                </div>

                {/* Cây mục lục Chương & Dòng dữ liệu Bài học (Data Rows) */}
                {!isCollapsed && (
                  <div className="divide-y divide-[#CFDADB]/70">
                    {chapters.map(({ chapter, lessons }) => (
                      <div key={chapter.id} className="p-4 sm:px-6">
                        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-mono text-xs font-bold tracking-wide text-[#3F6570] uppercase">
                            Chương {String(chapter.number).padStart(2, '0')}: {chapter.title}
                          </h4>
                          <span className="font-mono text-[11px] text-[#55676B]">
                            {lessons.length} bài giảng
                          </span>
                        </div>

                        <div className="divide-y divide-[#CFDADB]/50 overflow-hidden rounded-xl border border-[#CFDADB]/70 bg-white">
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
                                className="flex flex-col justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-[#E1E9EA]/50 sm:flex-row sm:items-center"
                              >
                                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2.5">
                                  <span className="shrink-0 font-mono text-xs font-semibold text-[#3F6570]">
                                    [{lessonCode}]
                                  </span>
                                  <span className="text-[#CFDADB]" aria-hidden="true">
                                    ·
                                  </span>
                                  <Link
                                    to={lessonHref}
                                    className="font-serif text-sm font-medium text-[#29383D] transition-colors hover:text-[#3F6570] hover:underline"
                                  >
                                    {fullLessonTitle}
                                  </Link>
                                </div>

                                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                                  <span className="inline-flex items-center gap-1 rounded bg-[#EAF0F1] px-2 py-0.5 font-mono text-[11px] text-[#55676B]">
                                    <FileText
                                      className="h-3 w-3 text-[#718C7E]"
                                      aria-hidden="true"
                                    />
                                    <span>{cloAndPages}</span>
                                  </span>

                                  <Link
                                    to={lessonHref}
                                    aria-label={`Đọc bài ${fullLessonTitle}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#29383D] transition-colors hover:border-[#3F6570] hover:bg-[#3F6570] hover:text-white"
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
