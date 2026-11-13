import type { ManifestSubject } from '@schemas/index';
import { BookOpen, ExternalLink, FileText, Layers, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { SubjectHeroCanvas } from '@/components/course/SubjectHeroCanvas';
import { SubjectUniverseWidget } from '@/components/course/SubjectUniverseWidget';
import {
  getSubjectThemeVars,
  getSubjectUniverseTheme,
} from '@/components/course/subjectUniverseThemes';
import { getLessonById, getSubjectStats } from '@/content-runtime';
import { getCourseCinematicAsset } from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { COURSE_DIRECT_PDF_LINKS, ROUTES } from '@/shared/config/routes';

export interface SubjectHeroProps {
  readonly subject: ManifestSubject;
  readonly onSelectSpecializedTab?: () => void;
  /** Nhảy nhanh tới các chương tương ứng khi bấm vào sơ đồ cấu trúc môn học */
  readonly onJumpToChapters?: (chapterNumbers: readonly number[]) => void;
}

const SECONDARY_CTA_CLASS =
  'inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-[var(--subject-accent-border)] hover:bg-white/12';

export function SubjectHero({
  subject,
  onSelectSpecializedTab,
  onJumpToChapters,
}: SubjectHeroProps) {
  const stats = getSubjectStats(subject);
  const cinematicAsset = getCourseCinematicAsset(subject.slug);
  const theme = getSubjectUniverseTheme(subject.slug);

  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisited = useLearningStore((state) => state.lastVisitedBySubject[subject.id]);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);

  const completedCount = subject.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.lessons.filter((lesson) => Boolean(completedLessons[lesson.id])).length,
    0,
  );
  const progressPercent =
    stats.lessonCount > 0 ? Math.round((completedCount / stats.lessonCount) * 100) : 0;

  const resumeLocation = lastVisited ? getLessonById(lastVisited.lessonId) : undefined;
  const ctaLocation = resumeLocation ?? stats.firstLesson;
  const directPdfUrl = COURSE_DIRECT_PDF_LINKS[subject.slug];

  const hasDedicatedExamPage =
    subject.slug === 'cau-truc-dai-so' ||
    subject.slug === 'hinh-hoc-affine' ||
    subject.slug === 'giai-tich-ham-mot-bien';

  const scaleLabel =
    subject.slug === 'giao-duc-hoc'
      ? `5 chương & 3 bài thực hành · ${stats.lessonCount} bài học`
      : `${stats.chapterCount} chương · ${stats.lessonCount} bài học`;

  const [baseR, baseG, baseB] = theme.baseRgb;
  const legibilityVeil = `linear-gradient(90deg, rgba(${baseR}, ${baseG}, ${baseB}, 0.82) 0%, rgba(${baseR}, ${baseG}, ${baseB}, 0.5) 38%, rgba(${baseR}, ${baseG}, ${baseB}, 0) 70%)`;

  return (
    <section
      aria-label={`Không gian học phần ${subject.title}`}
      data-testid="subject-universe-hero"
      data-subject-universe={theme.id}
      className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] flex min-h-[380px] w-screen flex-col overflow-hidden lg:min-h-[420px]"
      style={{ ...getSubjectThemeVars(theme), background: theme.background }}
    >
      {/* CẢNH NỀN CANVAS 120FPS ĐỘC BẢN CHO TỪNG MÔN HỌC */}
      <SubjectHeroCanvas universe={theme.id} />
      {/* Lớp tương phản theo chính tông nền môn học, giữ chữ bên trái sắc nét */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: legibilityVeil }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-24 pb-10 sm:px-10 sm:pt-28 lg:px-12 lg:pb-12">
        {/* PHÍA TRÊN: Breadcrumb & nhãn quy mô học phần */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/12 pb-4">
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-white/75">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to={ROUTES.home} className="transition-colors hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/35">
                /
              </li>
              <li>
                <Link to={ROUTES.subjects} className="transition-colors hover:text-white">
                  Môn học
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/35">
                /
              </li>
              <li aria-current="page" className="font-semibold text-white">
                {subject.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-full border border-[var(--subject-accent-border)] bg-[var(--subject-accent-soft)] px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-[var(--subject-accent)] uppercase backdrop-blur-md">
              {cinematicAsset.categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3.5 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
              <Layers className="h-3.5 w-3.5 text-[var(--subject-accent)]" aria-hidden="true" />
              <span>{scaleLabel}</span>
            </span>
          </div>
        </div>

        {/* PHẦN CHÍNH: Tiêu đề, mô tả, CTA & Sơ đồ cấu trúc kèm tiến độ */}
        <div className="grid flex-1 gap-8 pt-7 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11.5px] font-semibold tracking-[0.18em] text-[var(--subject-accent)] uppercase">
              <span>{theme.code}</span>
              <span className="h-px w-6 bg-[var(--subject-accent-border)]" aria-hidden="true" />
              <span className="text-white/70">{theme.themeTitle}</span>
            </p>

            <h1 className="font-serif text-4xl leading-tight tracking-tight text-white md:text-6xl">
              {subject.title}
            </h1>

            <p className="mt-4 line-clamp-3 max-w-2xl text-base font-light text-white/80 md:text-[17px]">
              {cinematicAsset.conciseDescription}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {ctaLocation && (
                <Link
                  to={ROUTES.lesson(
                    ctaLocation.subject.slug,
                    ctaLocation.chapter.slug,
                    ctaLocation.lesson.slug,
                  )}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#FBFAF6] px-6 py-3 text-sm font-semibold text-stone-950 shadow-md transition-all hover:bg-white"
                >
                  <PlayCircle
                    className="h-4 w-4 text-[var(--subject-accent-ink)]"
                    aria-hidden="true"
                  />
                  <span>
                    Tiếp tục học: Bài {ctaLocation.chapter.number}.{ctaLocation.lesson.number}
                  </span>
                </Link>
              )}

              {directPdfUrl && (
                <a
                  href={directPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SECONDARY_CTA_CLASS}
                >
                  <FileText className="h-4 w-4 text-[var(--subject-accent)]" aria-hidden="true" />
                  <span>Đọc giáo trình PDF</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                </a>
              )}

              {hasDedicatedExamPage ? (
                <Link to={ROUTES.subjectExams(subject.slug)} className={SECONDARY_CTA_CLASS}>
                  <BookOpen className="h-4 w-4 text-[var(--subject-accent)]" aria-hidden="true" />
                  <span>Ôn tập</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onSelectSpecializedTab}
                  className={`${SECONDARY_CTA_CLASS} cursor-pointer`}
                >
                  <BookOpen className="h-4 w-4 text-[var(--subject-accent)]" aria-hidden="true" />
                  <span>Ôn tập</span>
                </button>
              )}

              {subject.slug === 'hinh-hoc-affine' && (
                <a
                  href="/interactive/affine-geometry.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SECONDARY_CTA_CLASS}
                >
                  <Sparkles className="h-4 w-4 text-[var(--subject-accent)]" aria-hidden="true" />
                  <span>Phòng Lab 3D</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          <div className="flex lg:col-span-5 lg:justify-end">
            <SubjectUniverseWidget
              theme={theme}
              chapters={subject.chapters}
              completedLessons={completedLessons}
              isAuthenticated={isAuthenticated}
              completedCount={completedCount}
              lessonCount={stats.lessonCount}
              progressPercent={progressPercent}
              onEnableLearnerMode={() => enableLearnerMode()}
              onJumpToChapters={onJumpToChapters}
            />
          </div>
        </div>
      </div>

      {/* ĐƯỜNG VIỀN NGHỆ THUẬT MẢNH CHUYỂN TIẾP SANG THANH TAB */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.accent} 22%, ${theme.accentSecondary} 50%, ${theme.accent} 78%, transparent 100%)`,
          }}
        />
        <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rotate-45 border border-[var(--subject-accent)] bg-[var(--subject-accent-soft)]" />
      </div>
    </section>
  );
}
