import type { ManifestSubject } from '@schemas/index';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  PlayCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router';
import { getLessonById, getSubjectStats } from '@/content-runtime';
import { getCourseCinematicAsset } from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { COURSE_DIRECT_PDF_LINKS, ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Badge, Breadcrumb, Button, ProgressRing } from '@/shared/ui';

export interface SubjectHeroProps {
  readonly subject: ManifestSubject;
}

const COURSE_BLIND_SLATS = [0, 1, 2, 3, 4, 5, 6] as const;

export function SubjectHero({ subject }: SubjectHeroProps) {
  const stats = getSubjectStats(subject);
  const cinematicAsset = getCourseCinematicAsset(subject.slug);
  const prefersReducedMotion = useReducedMotion();
  const maskId = useId().replace(/:/g, '');

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

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Môn học', href: ROUTES.subjects },
          { label: subject.title },
        ]}
      />

      {/* CINEMATIC COURSE COVER VỚI SVG MASK (HORIZONTAL BLINDS) & CẢNH QUAN VIỆT NAM */}
      <section
        aria-label={`Không gian học phần ${subject.title}`}
        className="relative overflow-hidden rounded-3xl border border-stone-300/80 bg-[#FAF7F2] px-6 py-10 shadow-xs sm:px-10 sm:py-12 lg:px-14 lg:py-14"
      >
        {/* Định nghĩa SVG Mask Horizontal Blinds hé lộ cảnh quan Việt Nam đặc trưng của môn học */}
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
          <defs>
            <mask id={`course-cover-blinds-${maskId}`} maskContentUnits="objectBoundingBox">
              {COURSE_BLIND_SLATS.map((idx) => {
                const sliceHeight = 1 / COURSE_BLIND_SLATS.length;
                return (
                  <rect
                    key={idx}
                    x="0"
                    y={idx * sliceHeight}
                    width="1"
                    height={sliceHeight - 0.004}
                    fill="white"
                  />
                );
              })}
            </mask>
          </defs>
        </svg>

        {/* Lớp nền cảnh quan Việt Nam đặc trưng của môn học */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage: prefersReducedMotion ? undefined : `url(#course-cover-blinds-${maskId})`,
            WebkitMaskImage: prefersReducedMotion
              ? undefined
              : `url(#course-cover-blinds-${maskId})`,
          }}
          aria-hidden="true"
        >
          <img
            src={cinematicAsset.remoteSrc}
            alt={cinematicAsset.alt}
            loading="eager"
            className="h-full w-full object-cover object-center opacity-35 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/65 to-[#FAF7F2]/45" />
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          {/* CỘT TRÁI (8 Cột): 4 Thông tin cốt lõi cô đọng của học phần */}
          <div className="space-y-5 lg:col-span-8">
            {/* 1. Mã học phần & Phân loại */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md border border-stone-300/90 bg-[#FDFBF7]/90 px-3 py-1 font-mono text-xs font-bold tracking-wider text-[#9A3412] uppercase backdrop-blur-xs">
                {cinematicAsset.categoryLabel}
              </span>
              <span className="font-mono text-xs text-stone-600">
                {cinematicAsset.vietnameseLandmark}
              </span>
            </div>

            {/* 2. Tên chính thức của môn học */}
            <h1 className="font-serif text-4xl leading-[1.08] font-bold tracking-tight text-stone-950 sm:text-5xl">
              {subject.title}
            </h1>

            {/* 3. Mô tả cơ bản, cô đọng đúng trọng tâm chuyên môn */}
            <p className="max-w-2xl text-base leading-relaxed text-stone-800">
              {cinematicAsset.conciseDescription}
            </p>

            {/* 4. Thông số thực tế: Số chương, Số bài học, Thời lượng */}
            <div className="flex flex-wrap items-center gap-5 border-t border-stone-300/60 pt-4 text-sm text-stone-700">
              <span className="inline-flex items-center gap-1.5 font-semibold text-stone-900">
                <Layers className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                <span>{stats.chapterCount} chương</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-stone-900">
                <BookOpen className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                <span>{stats.lessonCount} bài học</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-stone-700">
                <Clock className="h-4 w-4 text-stone-500" aria-hidden="true" />
                <span>~{stats.totalMinutes} phút</span>
              </span>
            </div>

            {/* Cụm nút hành động chính */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {ctaLocation && (
                <Button
                  asChild
                  variant="subject"
                  size="md"
                  className="rounded-full bg-stone-900 px-6 text-[#FAF7F2] hover:bg-[#9A3412]"
                >
                  <Link
                    to={ROUTES.lesson(
                      ctaLocation.subject.slug,
                      ctaLocation.chapter.slug,
                      ctaLocation.lesson.slug,
                    )}
                  >
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {resumeLocation ? 'Tiếp tục học' : 'Bắt đầu học'}: Bài{' '}
                      {ctaLocation.chapter.number}.{ctaLocation.lesson.number} —{' '}
                      {ctaLocation.lesson.title}
                    </span>
                  </Link>
                </Button>
              )}

              {directPdfUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="md"
                  className="gap-1.5 rounded-full border-stone-300 bg-[#FDFBF7]/90 text-stone-800 backdrop-blur-xs hover:bg-white"
                >
                  <a href={directPdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                    <span>Giáo trình PDF (Drive)</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                  </a>
                </Button>
              )}

              {(subject.slug === 'cau-truc-dai-so' ||
                subject.slug === 'giai-tich-ham-mot-bien') && (
                <Button
                  asChild
                  variant="outline"
                  size="md"
                  className="gap-1.5 rounded-full border-stone-300 bg-[#FDFBF7]/90 text-stone-800 backdrop-blur-xs hover:bg-white"
                >
                  <Link to={ROUTES.subjectExams(subject.slug)}>
                    <BookOpen className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                    <span>Ngân hàng Đề thi &amp; Lời giải</span>
                  </Link>
                </Button>
              )}

              {subject.slug === 'hinh-hoc-affine' && (
                <Button
                  asChild
                  variant="outline"
                  size="md"
                  className="gap-1.5 rounded-full border-stone-300 bg-[#FDFBF7]/90 text-stone-800 backdrop-blur-xs hover:bg-white"
                >
                  <a
                    href="/interactive/affine-geometry.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Sparkles className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                    <span>Mở phòng Lab &amp; Ôn tập tương tác</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (4 Cột): Khung Tiến độ Học tập Tối giản */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-stone-300/80 bg-[#FDFBF7]/90 p-5 backdrop-blur-md">
              {isAuthenticated ? (
                <div className="space-y-3" aria-label="Tiến độ học tập môn học">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold tracking-wider text-[#9A3412] uppercase">
                        Tiến độ học tập
                      </p>
                      <p className="mt-1 font-serif text-3xl font-bold text-stone-950">
                        {progressPercent}%
                      </p>
                    </div>
                    <ProgressRing value={progressPercent} size={52} strokeWidth={4.5} />
                  </div>
                  <p className="text-xs leading-relaxed text-stone-700">
                    Đã hoàn thành{' '}
                    <strong className="font-semibold text-stone-950">
                      {completedCount}/{stats.lessonCount}
                    </strong>{' '}
                    bài học trong môn {subject.title}.
                  </p>
                  {completedCount === stats.lessonCount && stats.lessonCount > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Badge variant="approved" className="w-full justify-center py-1">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Đã hoàn thành toàn bộ khóa học</span>
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3" aria-label="Chế độ khách">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold tracking-wider text-stone-700 uppercase">
                        Tiến độ học phần
                      </p>
                      <p className="mt-1 font-serif text-xl font-bold text-stone-950">
                        {progressPercent}%
                      </p>
                    </div>
                    <ProgressRing value={progressPercent} size={46} strokeWidth={4} />
                  </div>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Đang xem ở chế độ Khách. Bật theo dõi tiến độ để lưu bài đã học và ghi chú cá
                    nhân.
                  </p>
                  <Button
                    variant="subjectOutline"
                    size="sm"
                    onClick={() => enableLearnerMode()}
                    className="w-full rounded-full"
                  >
                    <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Bật theo dõi tiến độ học tập</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
