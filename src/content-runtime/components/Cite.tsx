import { BookMarked } from 'lucide-react';
import { Tooltip } from '@/shared/ui';
import { useLessonContext } from '../lesson-context';

export interface CiteProps {
  /** Mã tài liệu trong `content/_shared/bibliography.yaml`. */
  readonly source: string;
  /** Số trang tham khảo (ví dụ: "25" hoặc "25-31"). */
  readonly page?: string;
  /** Ghi chú ngắn kèm theo trích dẫn. */
  readonly note?: string;
}

export function Cite({ source, page, note }: CiteProps) {
  const { resolveSource } = useLessonContext();
  const entry = resolveSource(source);

  const shortName = entry ? `${entry.authors[0]}, ${entry.year}` : source;
  const details = [shortName, page ? `tr. ${page}` : null, note ?? null].filter(Boolean).join(', ');

  const badge = (
    <span className="mx-0.5 inline-flex items-baseline gap-1 rounded-md border border-stone-200 bg-stone-100/90 px-1.5 py-0.5 text-xs font-medium text-stone-700">
      <BookMarked className="h-3 w-3 self-center text-stone-500" aria-hidden="true" />
      <span>[{details}]</span>
    </span>
  );

  if (!entry) {
    return badge;
  }

  return (
    <Tooltip
      content={
        <div className="space-y-0.5">
          <p className="font-medium text-white">{entry.title}</p>
          <p className="text-stone-300">
            {entry.authors.join(', ')} — {entry.publisher} ({entry.year})
          </p>
          {page && <p className="text-stone-400">Trang {page}</p>}
        </div>
      }
    >
      {badge}
    </Tooltip>
  );
}
