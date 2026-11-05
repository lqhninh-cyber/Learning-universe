import type {
  BibliographyEntry,
  LessonBlockInfo,
  LessonMeta,
  ManifestLesson,
} from '@schemas/index';
import {
  BookMarked,
  BookOpen,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { getBibliographyEntry } from '@/content-runtime';
import { PEDAGOGY_DOCUMENTS, type PedagogyDocument } from '@/data/courses/giao-duc-hoc/course';
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

/**
 * Bảng ánh xạ các mã nguồn rút gọn / định danh bài học sang tài liệu chuẩn trong PEDAGOGY_DOCUMENTS
 */
const PEDAGOGY_SOURCE_MAP: Record<string, string> = {
  // Giáo trình HCMUE
  'gt-gdh-hcmue-2024': 'gt-gdh-hcmue',
  'gt-gdh-hcmue': 'gt-gdh-hcmue',
  'giao-trinh-gdh-hcmue': 'gt-gdh-hcmue',
  'giao-trinh-gdh': 'gt-gdh-hcmue',
  hcmue: 'gt-gdh-hcmue',

  // Chuẩn nghề nghiệp GV (Thông tư 20/2018)
  'thong-tu-20-2018': 'chuan-nghe-nghiep-gv-tt20',
  'tt20-2018': 'chuan-nghe-nghiep-gv-tt20',
  'chuan-nghe-nghiep-gv-tt20': 'chuan-nghe-nghiep-gv-tt20',
  tt20: 'chuan-nghe-nghiep-gv-tt20',

  // Điều lệ trường trung học (Thông tư 32/2020)
  'thong-tu-32-2020': 'dieu-le-truong-trung-hoc-tt32',
  'tt32-2020': 'dieu-le-truong-trung-hoc-tt32',
  'dieu-le-truong-trung-hoc-tt32': 'dieu-le-truong-trung-hoc-tt32',
  tt32: 'dieu-le-truong-trung-hoc-tt32',

  // Khung Chương trình GDPT 2018
  'chuong-trinh-gdpt-2018': 'ct-gdpt-2018-tong-the',
  'ct-gdpt-2018': 'ct-gdpt-2018-tong-the',
  'ct-gdpt-2018-tong-the': 'ct-gdpt-2018-tong-the',

  // Luật Giáo dục 2019
  'luat-giao-duc-2019': 'luat-giao-duc-2019',
  'luat-gd-2019': 'luat-giao-duc-2019',

  // Chương trình Hoạt động trải nghiệm
  'ct-hoat-dong-trai-nghiem': 'ct-hoat-dong-trai-nghiem',
  'hoat-dong-trai-nghiem': 'ct-hoat-dong-trai-nghiem',

  // Thông tư 17 Sửa đổi
  'tt17-sua-doi-ctgdpt': 'tt17-sua-doi-ctgdpt',
  'tt17-2025': 'tt17-sua-doi-ctgdpt',

  // Dự thảo Luật Nhà giáo
  'du-thao-luat-nha-giao': 'du-thao-luat-nha-giao',
  'luat-nha-giao': 'du-thao-luat-nha-giao',

  // Chiến lược phát triển GD
  'doc-chien-luoc-phat-trien-gd': 'doc-chien-luoc-phat-trien-gd',
  'chien-luoc-phat-trien-gd': 'doc-chien-luoc-phat-trien-gd',

  // Cẩm nang Kỷ luật tích cực
  'ky-luat-tich-cuc': 'ky-luat-tich-cuc',

  // Thang đo nhận thức Bloom
  'thang-bloom': 'thang-bloom',

  // Tra cứu nghề nghiệp ILO
  'tra-cuu-nghe-ilo': 'tra-cuu-nghe-ilo',

  // Nghiên cứu sư phạm bổ trợ
  'nghien-cuu-su-pham-bo-tro': 'nghien-cuu-su-pham-bo-tro',

  // Tài liệu Mô-đun & Kế hoạch HĐTN
  'doc-hdtnhn-thcs-modun-4': 'doc-hdtnhn-thcs-modun-4',
  'hdtnhn-thcs-modun-4': 'doc-hdtnhn-thcs-modun-4',
  'doc-hdtnhn-thpt-modun-4': 'doc-hdtnhn-thpt-modun-4',
  'hdtnhn-thpt-modun-4': 'doc-hdtnhn-thpt-modun-4',
  'doc-hdtn-thcs-modun-2': 'doc-hdtn-thcs-modun-2',
  'hdtn-thcs-modun-2': 'doc-hdtn-thcs-modun-2',
  'doc-phuong-thuc-to-chuc-hdtn': 'doc-phuong-thuc-to-chuc-hdtn',
  'phuong-thuc-to-chuc-hdtn': 'doc-phuong-thuc-to-chuc-hdtn',
  'doc-quy-trinh-thiet-ke-chu-de-hdtn': 'doc-quy-trinh-thiet-ke-chu-de-hdtn',
  'quy-trinh-thiet-ke-chu-de-hdtn': 'doc-quy-trinh-thiet-ke-chu-de-hdtn',
};

function resolvePedagogyDoc(sourceId: string): PedagogyDocument | undefined {
  const targetId = PEDAGOGY_SOURCE_MAP[sourceId] || sourceId;
  const normalized = targetId.toLowerCase().trim();

  return PEDAGOGY_DOCUMENTS.find(
    (doc) =>
      doc.id.toLowerCase() === normalized ||
      doc.id.toLowerCase() === sourceId.toLowerCase() ||
      doc.filename.toLowerCase().replace('.pdf', '') === normalized ||
      doc.path.toLowerCase().includes(normalized),
  );
}

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
          <BookMarked className="h-4 w-4 text-teal-800" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-wide text-stone-900 uppercase">
            Nguồn tham khảo & Đối chiếu giáo trình
          </h2>
        </div>
        <Badge variant="neutral">
          {lesson.sources.length > 0 ? `${lesson.sources.length} nguồn tài liệu` : 'Chưa gắn nguồn'}
        </Badge>
      </div>

      {hasAnySource ? (
        <div className="mt-4 space-y-6">
          {lesson.sources.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-600">
                Tài liệu tham khảo sử dụng trong bài học:
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {lesson.sources.map((ref, index) => {
                  const entry = resolveEntry(ref.source);
                  const pedagogyDoc = resolvePedagogyDoc(ref.source);

                  // 1. Nếu tìm thấy tài liệu sư phạm chuẩn (Pedagogy Document Reference Card)
                  if (pedagogyDoc) {
                    const docHref = pedagogyDoc.path || pedagogyDoc.url || '#';
                    const isTextbook =
                      pedagogyDoc.category === 'curriculum' ||
                      pedagogyDoc.id.startsWith('gt-') ||
                      pedagogyDoc.title.includes('Giáo trình');

                    return (
                      <div
                        key={`${ref.source}-${index}`}
                        className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ${
                                isTextbook
                                  ? 'border-amber-200/80 bg-amber-50/90 text-amber-800'
                                  : 'border-rose-200/80 bg-rose-50/90 text-rose-600'
                              }`}
                            >
                              {isTextbook ? (
                                <BookOpen className="h-6 w-6" aria-hidden="true" />
                              ) : (
                                <FileText className="h-6 w-6" aria-hidden="true" />
                              )}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h4 className="font-serif text-lg leading-snug font-bold text-stone-900">
                                  {pedagogyDoc.title}
                                </h4>
                                <span className="rounded-full bg-teal-100/90 px-2.5 py-0.5 text-xs font-bold text-teal-900">
                                  {pedagogyDoc.badge || pedagogyDoc.categoryLabel}
                                </span>
                                {pedagogyDoc.size && (
                                  <span className="rounded-lg border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-600">
                                    {pedagogyDoc.size}
                                  </span>
                                )}
                              </div>
                              <p className="text-[14.5px] leading-relaxed text-stone-600">
                                {pedagogyDoc.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                            <a
                              href={docHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600/30 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 shadow-2xs transition-colors hover:bg-teal-100"
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                              <span>Đọc tài liệu (PDF)</span>
                            </a>
                            <a
                              href={docHref}
                              download={pedagogyDoc.filename}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-2xs transition-colors hover:bg-stone-50"
                            >
                              <Download className="h-4 w-4 text-stone-500" aria-hidden="true" />
                              <span>Tải về</span>
                            </a>
                          </div>
                        </div>

                        {(ref.pages || ref.sections || ref.note) && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3.5 text-xs text-stone-600">
                            {ref.sections && (
                              <span className="rounded-lg border border-stone-200/80 bg-stone-100/90 px-3 py-1 font-semibold text-stone-800">
                                {ref.sections}
                              </span>
                            )}
                            {ref.pages && (
                              <span className="rounded-lg border border-stone-200/80 bg-stone-100/90 px-3 py-1 font-semibold text-stone-700">
                                Trang {ref.pages}
                              </span>
                            )}
                            {ref.note && <span className="text-stone-500 italic">{ref.note}</span>}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 2. Nếu tìm thấy giáo trình toán trong danh mục Bibliography tiêu chuẩn
                  if (entry) {
                    const isBook =
                      entry.type === 'textbook' ||
                      entry.type === 'reference-book' ||
                      entry.type === 'lecture-notes';

                    return (
                      <div
                        key={`${ref.source}-${index}`}
                        className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ${
                              isBook
                                ? 'border-amber-200/80 bg-amber-50/90 text-amber-800'
                                : 'border-stone-200/80 bg-stone-100/90 text-stone-600'
                            }`}
                          >
                            {isBook ? (
                              <BookOpen className="h-6 w-6" aria-hidden="true" />
                            ) : (
                              <FileText className="h-6 w-6" aria-hidden="true" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif text-lg leading-snug font-bold text-stone-900">
                              {entry.title}
                            </h4>
                            <p className="mt-1 text-[14.5px] text-stone-600">
                              {entry.authors.join(', ')} ({entry.year}) · {entry.publisher}
                              {entry.edition ? ` · ${entry.edition}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="subject">{SOURCE_TYPE_LABELS[entry.type]}</Badge>
                            {ref.sections && (
                              <span className="rounded-lg border border-stone-200/80 bg-stone-100/90 px-3 py-1 text-xs font-semibold text-stone-800">
                                {ref.sections}
                              </span>
                            )}
                            {ref.pages && (
                              <span className="rounded-lg border border-stone-200/80 bg-stone-100/90 px-3 py-1 text-xs font-semibold text-stone-700">
                                Trang {ref.pages}
                              </span>
                            )}
                            {ref.note && (
                              <span className="text-xs text-stone-500 italic">{ref.note}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 3. Fallback khi không tìm thấy nguồn đã đăng ký
                  return (
                    <div
                      key={`${ref.source}-${index}`}
                      className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200/80 bg-stone-100/90 text-stone-600 shadow-2xs">
                          <FileText className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif text-lg leading-snug font-bold text-stone-900">
                            Tài liệu tham khảo
                          </h4>
                          <p className="mt-1 font-mono text-xs font-semibold text-stone-800">
                            Mã nguồn: {ref.source}
                          </p>
                          {(ref.pages || ref.sections || ref.note) && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
                              {ref.sections && (
                                <span className="rounded-lg border border-stone-200/80 bg-stone-100/90 px-3 py-1 font-semibold text-stone-800">
                                  {ref.sections}
                                </span>
                              )}
                              {ref.pages && (
                                <span className="rounded-lg border border-stone-200/80 bg-stone-100/90 px-3 py-1 font-semibold text-stone-700">
                                  Trang {ref.pages}
                                </span>
                              )}
                              {ref.note && (
                                <span className="text-stone-500 italic">{ref.note}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  const pedagogyDoc = block.source ? resolvePedagogyDoc(block.source) : undefined;
                  return (
                    <a
                      key={block.anchorId}
                      href={`#${block.anchorId}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs transition-colors hover:border-teal-300 hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">
                          {block.label}
                          {block.title ? ` — ${block.title}` : ''}
                        </p>
                        <p className="truncate text-stone-600">
                          {block.original ? `Số hiệu gốc: ${block.original}` : 'Đối chiếu nguồn'}
                          {pedagogyDoc
                            ? ` · ${pedagogyDoc.badge || pedagogyDoc.title}`
                            : entry
                              ? ` · ${entry.authors[0]} (${entry.year})`
                              : ''}
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
