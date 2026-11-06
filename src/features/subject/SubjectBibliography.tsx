import type { BibliographyEntry, ManifestSubject } from '@schemas/index';
import { BookOpenCheck, FileText, Library } from 'lucide-react';
import { getBibliographyEntry } from '@/content-runtime';
import { GOOGLE_DRIVE_DOCS_URL } from '@/shared/config/routes';
import { Badge, Button, Card } from '@/shared/ui';

export interface SubjectBibliographyProps {
  readonly subject: ManifestSubject;
  readonly bibliographyOverride?: readonly BibliographyEntry[];
}

export function SubjectBibliography({ subject, bibliographyOverride }: SubjectBibliographyProps) {
  const resolveEntry = (sourceId: string): BibliographyEntry | undefined => {
    if (bibliographyOverride) {
      return bibliographyOverride.find((item) => item.id === sourceId);
    }
    return getBibliographyEntry(sourceId);
  };

  const primaryEntry = subject.sources.primary ? resolveEntry(subject.sources.primary) : undefined;
  const referenceEntries = subject.sources.references.map((id) => ({
    id,
    entry: resolveEntry(id),
  }));

  const hasSources = Boolean(subject.sources.primary) || subject.sources.references.length > 0;
  const pdfHref = hasSources ? GOOGLE_DRIVE_DOCS_URL : null;

  return (
    <section aria-label="Giáo trình và tài liệu tham khảo môn học" className="pt-2">
      <Card className="border-stone-200/90 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Library className="text-subject-600 h-5 w-5" aria-hidden="true" />
            <h2 className="text-base font-bold text-stone-900">
              Giáo trình chính & Tài liệu tham khảo — {subject.title}
            </h2>
          </div>
          <Badge variant="neutral">
            {hasSources
              ? `${(subject.sources.primary ? 1 : 0) + subject.sources.references.length} tài liệu`
              : 'Đang cập nhật thư mục'}
          </Badge>
        </div>

        {hasSources ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {subject.sources.primary && (
              <div className="border-subject-200/80 bg-subject-50/35 rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-subject-800 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                    <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Giáo trình chính</span>
                  </span>
                  <Badge variant="subject">Chính thức</Badge>
                </div>
                {primaryEntry ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-bold text-stone-900">{primaryEntry.title}</p>
                    <p className="text-xs text-stone-600">
                      {primaryEntry.authors.join(', ')} ({primaryEntry.year}) ·{' '}
                      {primaryEntry.publisher}
                    </p>
                    {primaryEntry.numberingNote && (
                      <p className="text-xs text-stone-500 italic">
                        Quy ước đánh số: {primaryEntry.numberingNote}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 font-mono text-xs text-stone-700">{subject.sources.primary}</p>
                )}
                {pdfHref && (
                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="hover:border-subject-300 hover:bg-subject-50 hover:text-subject-700 h-8 gap-1.5 border-stone-200 text-xs font-medium text-stone-700 transition-colors"
                    >
                      <a href={pdfHref} target="_blank" rel="noopener noreferrer">
                        <FileText className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
                        <span>Đọc giáo trình PDF</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {referenceEntries.length > 0 && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="text-xs font-semibold tracking-wide text-stone-700 uppercase">
                  Tài liệu tham khảo mở rộng ({referenceEntries.length})
                </p>
                <ul className="mt-2 space-y-2 text-xs text-stone-700">
                  {referenceEntries.map(({ id, entry }) => (
                    <li key={id} className="border-b border-stone-200/60 pb-2 last:border-b-0">
                      {entry ? (
                        <>
                          <span className="font-semibold text-stone-900">{entry.title}</span> —{' '}
                          {entry.authors.join(', ')} ({entry.year}), {entry.publisher}
                        </>
                      ) : (
                        <span className="font-mono">{id}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
            Danh mục giáo trình chính và tài liệu tham khảo của môn{' '}
            <strong className="font-medium text-stone-900">{subject.title}</strong> sẽ được bổ sung
            vào <code className="font-mono text-xs text-stone-800">bibliography.yaml</code> khi bắt
            đầu giai đoạn biên soạn học thuật.
          </p>
        )}
      </Card>
    </section>
  );
}
