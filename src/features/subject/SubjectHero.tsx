import type { ManifestSubject } from '@schemas/index';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Layers,
  PlayCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { getLessonById, getSubjectStats } from '@/content-runtime';
import { getCourseCinematicAsset } from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { COURSE_DIRECT_PDF_LINKS, ROUTES } from '@/shared/config/routes';

export interface SubjectHeroProps {
  readonly subject: ManifestSubject;
  readonly onSelectSpecializedTab?: () => void;
}

export function SubjectHero({ subject, onSelectSpecializedTab }: SubjectHeroProps) {
  const stats = getSubjectStats(subject);
  const cinematicAsset = getCourseCinematicAsset(subject.slug);

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

  // Thông số cho vòng tròn tiến độ tối giản trên nền kính tối
  const ringSize = 64;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <section
      aria-label={`Không gian học phần ${subject.title}`}
      className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] flex min-h-[82vh] w-screen flex-col justify-between overflow-hidden bg-stone-950 lg:h-[88vh]"
    >
      {/* NỀN PHONG CẢNH / DI SẢN VIỆT NAM ĐẠI DIỆN CHO MÔN HỌC */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={cinematicAsset.remoteSrc}
          alt={cinematicAsset.alt}
          loading="eager"
          className="h-full w-full object-cover object-center"
        />
        {/* Lớp phủ tối dịu tăng độ tương phản cho chữ trắng sắc nét */}
        <div className="absolute inset-0 bg-stone-950/45" />
        {/* Gradient chuyển tiếp mượt xuống nền canvas #EAF0F1 ở chân Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#EAF0F1] via-stone-900/50 to-stone-900/70" />
        <div className="absolute inset-x-0 top-0 h-[84%] bg-gradient-to-b from-stone-950/60 via-stone-950/45 to-transparent" />
      </div>

      {/* BỐ CỤC NỘI DUNG HERO MÔN HỌC */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-1 flex-col justify-between px-6 pt-24 pb-16 sm:px-10 sm:pt-28 lg:px-12 lg:pb-20">
        {/* PHÍA TRÊN: Breadcrumb thanh mảnh màu trắng sáng & Badge mã môn học */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-white/80">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to={ROUTES.home} className="transition-colors hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/40">
                /
              </li>
              <li>
                <Link to={ROUTES.subjects} className="transition-colors hover:text-white">
                  Môn học
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/40">
                /
              </li>
              <li aria-current="page" className="font-semibold text-white">
                {subject.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-amber-200 uppercase backdrop-blur-md">
              {cinematicAsset.categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-stone-950/45 px-3.5 py-1 text-xs font-medium text-stone-200 backdrop-blur-md">
              <Layers className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                {subject.slug === 'giao-duc-hoc'
                  ? `04 tín chỉ · 5 chương & 3 bài thực hành (${stats.lessonCount} bài học)`
                  : `${stats.chapterCount} chương · ${stats.lessonCount} bài học`}
              </span>
            </span>
          </div>
        </div>

        {/* PHẦN CHÍNH: Tiêu đề Serif lớn, Mô tả 2 dòng, Cụm CTA & Vòng tròn tiến độ */}
        <div className="my-auto grid gap-8 py-6 lg:grid-cols-12 lg:items-end">
          {/* CỘT TRÁI (8 Cột): Typography & Primary Actions */}
          <div className="lg:col-span-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 font-mono text-xs font-medium tracking-wider text-amber-200 uppercase backdrop-blur-xs">
              <span>{cinematicAsset.categoryLabel}</span>
            </div>

            <h1 className="font-serif text-5xl leading-tight tracking-tight text-white md:text-7xl">
              {subject.title}
            </h1>

            <p className="mt-4 line-clamp-2 max-w-2xl text-base font-light text-stone-200 md:text-lg">
              {cinematicAsset.conciseDescription}
            </p>

            {/* Cụm hành động chính (Primary CTA) */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              {ctaLocation && (
                <Link
                  to={ROUTES.lesson(
                    ctaLocation.subject.slug,
                    ctaLocation.chapter.slug,
                    ctaLocation.lesson.slug,
                  )}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#F7FAFA] px-6 py-3.5 text-sm font-semibold text-stone-950 shadow-md transition-all hover:bg-white"
                >
                  <PlayCircle className="h-4 w-4 text-[#3F6570]" aria-hidden="true" />
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-stone-950/50 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-white/15"
                >
                  <FileText className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Đọc giáo trình PDF</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                </a>
              )}

              {hasDedicatedExamPage ? (
                <Link
                  to={ROUTES.subjectExams(subject.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-stone-950/50 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-white/15"
                >
                  <BookOpen className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Ôn tập</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onSelectSpecializedTab}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-stone-950/50 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-white/15"
                >
                  <BookOpen className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Ôn tập</span>
                </button>
              )}

              {subject.slug === 'hinh-hoc-affine' && (
                <a
                  href="/interactive/affine-geometry.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-stone-950/50 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-white/15"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Phòng Lab 3D</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (4 Cột): Vòng tròn tiến độ hoàn thành (%) tối giản, thanh lịch */}
          <div className="flex lg:col-span-4 lg:justify-end">
            <div
              aria-label={isAuthenticated ? 'Tiến độ học tập môn học' : 'Chế độ khách'}
              className="w-full rounded-2xl border border-white/20 bg-stone-950/55 p-5 text-white shadow-lg backdrop-blur-md sm:max-w-xs"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-wider text-amber-200 uppercase">
                    Tiến độ hoàn thành
                  </p>
                  <p className="mt-1 font-serif text-3xl font-normal text-white">
                    {progressPercent}%
                  </p>
                  <p className="mt-1 text-xs text-stone-300">
                    {completedCount}/{stats.lessonCount} bài học
                  </p>
                </div>

                {/* Vòng tròn tiến độ tối giản */}
                <div className="relative flex items-center justify-center">
                  <svg
                    width={ringSize}
                    height={ringSize}
                    viewBox={`0 0 ${ringSize} ${ringSize}`}
                    className="-rotate-90 transform"
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Tiến độ hoàn thành: ${progressPercent}%`}
                  >
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="transparent"
                      stroke="#FCD34D"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs font-semibold text-amber-200">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {isAuthenticated ? (
                completedCount === stats.lessonCount &&
                stats.lessonCount > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/15 pt-3 text-xs font-medium text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Đã hoàn thành toàn bộ học phần</span>
                  </div>
                )
              ) : (
                <div className="mt-3 border-t border-white/15 pt-3">
                  <button
                    type="button"
                    onClick={() => enableLearnerMode()}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    <span>Bật theo dõi tiến độ học tập</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
