import type { ManifestSubject } from '@schemas/index';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { getSubjectStats } from '@/content-runtime';
import { getCourseCinematicAsset } from '@/data/cinematicAssets';
import { ROUTES } from '@/shared/config/routes';

export interface SubjectCardProps {
  readonly subject: ManifestSubject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const stats = getSubjectStats(subject);
  const asset = getCourseCinematicAsset(subject.slug);

  return (
    <article
      aria-label={`Học phần ${subject.title}`}
      className="group flex flex-col justify-between rounded-3xl border border-stone-200/70 bg-[#FAF7F2] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Phía trên: Tag mã học phần + Tiêu đề môn học đậm lớn + 2 dòng mô tả súc tích */}
      <div className="space-y-3">
        <span className="block font-mono text-xs font-semibold tracking-wider text-stone-500 uppercase">
          {asset.categoryLabel}
        </span>

        <h2 className="font-serif text-2xl leading-snug font-bold text-stone-900 transition-colors group-hover:text-[#9A3412] sm:text-3xl">
          <Link to={ROUTES.courseOverview(subject.slug)}>{subject.title}</Link>
        </h2>

        <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">
          {asset.conciseDescription}
        </p>
      </div>

      {/* Phía dưới: Số chương/bài và Nút tròn mũi tên > màu đen ở góc phải dẫn thẳng vào /courses/:slug */}
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
        <span className="text-xs font-semibold text-stone-700">
          {stats.chapterCount} chương · {stats.lessonCount} bài học
        </span>

        <Link
          to={ROUTES.courseOverview(subject.slug)}
          aria-label={`Vào học phần ${subject.title}`}
          title={`Vào học phần ${subject.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-transform hover:scale-105"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
