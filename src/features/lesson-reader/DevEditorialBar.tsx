import type { LessonMeta, ManifestLesson } from '@schemas/index';
import { FileCode2, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Badge } from '@/shared/ui';

export interface DevEditorialBarProps {
  readonly lesson: ManifestLesson;
  readonly lessonMeta?: LessonMeta | null;
}

export function DevEditorialBar({ lesson, lessonMeta }: DevEditorialBarProps) {
  const blockCount = lessonMeta?.blocks.length ?? 0;
  const headingCount = lessonMeta?.headings.length ?? 0;

  return (
    <aside
      aria-label="Thanh thông tin biên tập kỹ thuật"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/75 px-4 py-2.5 text-xs text-stone-800"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-900">
          <Wrench className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
          <span>Chế độ Biên tập (DEV)</span>
        </span>
        <Badge variant={lesson.status}>{lesson.status}</Badge>
        <span className="rounded-md bg-white/90 px-2 py-0.5 font-mono text-stone-700">
          id: {lesson.id}
        </span>
        <span className="rounded-md bg-white/90 px-2 py-0.5 font-mono text-stone-700">
          v{lesson.version}
        </span>
        <span className="inline-flex items-center gap-1 text-stone-600">
          <FileCode2 className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
          <code className="font-mono">{lesson.file}</code>
        </span>
        <span className="text-stone-600">
          {headingCount} mục · {blockCount} khối đánh số
        </span>
      </div>

      <Link
        to={ROUTES.devPreview}
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-medium text-amber-900 transition-colors hover:bg-amber-100/70"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
        <span>Mở trang Kiểm định (/dev/preview)</span>
      </Link>
    </aside>
  );
}
