import type {
  BibliographyEntry,
  LessonBlockInfo,
  LessonMeta,
  ManifestLesson,
} from '@schemas/index';
import { BookMarked, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { getBibliographyEntry } from '@/content-runtime';
import { Badge } from '@/shared/ui';

export interface SourcePanelProps {
  readonly lesson: ManifestLesson;
  readonly lessonMeta?: LessonMeta | null;
  /** Cho phép truyền danh mục tài liệu tùy chỉnh khi kiểm thử đơn vị. */
  readonly bibliographyOverride?: readonly BibliographyEntry[];
}

const SOURCE_TYPE_LABELS: Record<BibliographyEntry['type'], string> = {
  textbook: 'Giáo trình',
  'reference-book': 'Sách tham khảo',
  'lecture-notes': 'Bài giảng',
  article: 'Bài báo',
  other: 'Tài liệu khác',
};

export function SourcePanel({ lesson, lessonMeta, bibliographyOverride }: SourcePanelProps) {
  const resolveEntry = (sourceId: string): BibliographyEntry | undefined => {
    if (bibliographyOverride) {
      return bibliographyOverride.find((item) => item.id === sourceId);
    }
    return getBibliographyEntry(sourceId);
  };

  const blocksWithOriginalOrSource: readonly LessonBlockInfo[] = (lessonMeta?.blocks ?? []).filter(
    (block) => Boolean(block.original || block.source),
  );

  const hasAnySource = lesson.sources.length > 0 || blocksWithOriginalOrSource.length > 0;

  return (
    <section
      aria-label="Nguồn giáo trình và đối chiếu học thuật"
      className="mt-10 rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookMarked className="text-subject-600 h-4 w-4" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-wide text-stone-900 uppercase">
            Nguồn tham khảo & Đối chiếu giáo trình
          </h2>
        </div>
        <Badge variant="neutral">
          {lesson.sources.length > 0 ? `${lesson.sources.length} nguồn tài liệu` : 'Chưa gắn nguồn'}
        </Badge>
      </div>

      {hasAnySource ? (
        <div className="mt-4 space-y-5">
          {lesson.sources.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-600">
                Tài liệu tham khảo sử dụng trong bài học:
              </p>
              <ul className="space-y-2.5">
                {lesson.sources.map((ref, index) => {
                  const entry = resolveEntry(ref.source);
                  return (
                    <li
                      key={`${ref.source}-${index}`}
                      className="rounded-xl border border-stone-200 bg-white p-3.5 text-sm shadow-2xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          {entry ? (
                            <>
                              <p className="font-semibold text-stone-900">{entry.title}</p>
                              <p className="text-xs text-stone-600">
                                {entry.authors.join(', ')} ({entry.year}) · {entry.publisher}
                                {entry.edition ? ` · ${entry.edition}` : ''}
                              </p>
                            </>
                          ) : (
                            <p className="font-mono text-xs font-semibold text-stone-800">
                              Mã nguồn: {ref.source}
                            </p>
                          )}
                        </div>
                        {entry && <Badge variant="subject">{SOURCE_TYPE_LABELS[entry.type]}</Badge>}
                      </div>

                      {(ref.pages || ref.sections || ref.note) && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-2 text-xs text-stone-600">
                          {ref.pages && (
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-800">
                              Trang {ref.pages}
                            </span>
                          )}
                          {ref.sections && (
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                              {ref.sections}
                            </span>
                          )}
                          {ref.note && <span className="text-stone-500 italic">{ref.note}</span>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {blocksWithOriginalOrSource.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <FileSpreadsheet className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                <span>Bảng đối chiếu số hiệu gốc trong giáo trình:</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {blocksWithOriginalOrSource.map((block) => {
                  const entry = block.source ? resolveEntry(block.source) : undefined;
                  return (
                    <a
                      key={block.anchorId}
                      href={`#${block.anchorId}`}
                      className="hover:border-subject-300 flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs transition-colors hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">
                          {block.label}
                          {block.title ? ` — ${block.title}` : ''}
                        </p>
                        <p className="truncate text-stone-600">
                          {block.original ? `Số hiệu gốc: ${block.original}` : 'Đối chiếu nguồn'}
                          {entry ? ` · ${entry.authors[0]} (${entry.year})` : ''}
                          {block.page ? ` · tr. ${block.page}` : ''}
                        </p>
                      </div>
                      <ExternalLink
                        className="h-3.5 w-3.5 shrink-0 text-stone-400"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2.5 text-xs leading-relaxed text-stone-600">
          Thông tin giáo trình chính và số trang đối chiếu của bài học sẽ được cập nhật trong giai
          đoạn biên soạn nội dung học thuật.
        </p>
      )}
    </section>
  );
}
