import type { ManifestSubject } from '@schemas/index';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { getSubjectStats } from '@/content-runtime';
import { getCourseCinematicAsset } from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface SubjectCardProps {
  readonly subject: ManifestSubject;
}

const CREDITS_MAP: Record<string, string> = {
  'cau-truc-dai-so': '04 Tín chỉ · Bắt buộc',
  'hinh-hoc-affine': '03 Tín chỉ · Bắt buộc',
  'giai-tich-ham-mot-bien': '04 Tín chỉ · Bắt buộc',
  'giao-duc-hoc': '04 Tín chỉ · Bắt buộc',
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const stats = getSubjectStats(subject);
  const asset = getCourseCinematicAsset(subject.slug);

  const completedLessons = useLearningStore((state) => state.completedLessons);
  const completedCount = useMemo(() => {
    return subject.chapters.reduce(
      (acc, ch) => acc + ch.lessons.filter((l) => Boolean(completedLessons[l.id])).length,
      0,
    );
  }, [subject.chapters, completedLessons]);

  const totalLessons = stats.lessonCount;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const creditsText = CREDITS_MAP[subject.slug] ?? '03 Tín chỉ · Bắt buộc';

  return (
    <article
      aria-label={`Học phần ${subject.title}`}
      className="group flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-editorial)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8"
    >
      {/* Phía trên: Huy hiệu tín chỉ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-[#C5A262]/40 bg-[#C5A262]/10 px-3 py-1 text-xs font-semibold text-[#8A6A2F] dark:border-[#C5A262]/30 dark:bg-[#C5A262]/15 dark:text-[#E5C378]">
            {creditsText}
          </span>
        </div>

        <div className="space-y-2.5">
          <h2 className="font-serif text-2xl leading-snug font-bold text-[#29383D] transition-colors group-hover:text-[#3F6570] sm:text-3xl dark:text-[#E6ECE7] dark:group-hover:text-[#739B88]">
            <Link to={ROUTES.courseOverview(subject.slug)}>{subject.title}</Link>
          </h2>

          <p className="line-clamp-2 text-sm leading-relaxed text-[#55676B] dark:text-[#A7B5AC]">
            {asset.conciseDescription}
          </p>
        </div>
      </div>

      {/* Thông tin chương/bài */}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium text-[#55676B] dark:text-[#A7B5AC]">
        <span>
          {subject.slug === 'giao-duc-hoc'
            ? `5 chương & 3 bài thực hành (${stats.lessonCount} bài học)`
            : `${stats.chapterCount} chương · ${stats.lessonCount} bài học`}
        </span>
      </div>

      {/* Phía dưới: Thanh tiến độ tổng thể (Tiến độ cá nhân: X%) + Nút tròn điều hướng */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">
              Tiến độ cá nhân:{' '}
              <strong className="font-semibold text-[var(--text-main)]">{progressPercent}%</strong>
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              ({completedCount}/{totalLessons} bài)
            </span>
          </div>

          {/* Thanh progress bar lấp đầy */}
          <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : progressPercent > 0
                    ? 'bg-[#C5A262]'
                    : 'bg-transparent',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Link
          to={ROUTES.courseOverview(subject.slug)}
          aria-label={`Vào học phần ${subject.title}`}
          title={`Vào học phần ${subject.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3F6570] text-white shadow-xs transition-all duration-200 hover:scale-105 hover:bg-[#345761] dark:bg-[#739B88] dark:text-[#0E1A15] dark:hover:bg-[#86b09c]"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
