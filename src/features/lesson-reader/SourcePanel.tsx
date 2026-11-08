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
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { getBibliographyEntry } from '@/content-runtime';
import { PEDAGOGY_DOCUMENTS, type PedagogyDocument } from '@/data/courses/giao-duc-hoc/course';
import { COURSE_DIRECT_PDF_LINKS } from '@/shared/config/routes';
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
  'gioi-thieu-hp-gdh': 'gioi-thieu-hp-gdh',
  'de-cuong-educ2802': 'gioi-thieu-hp-gdh',
  educ2802: 'gioi-thieu-hp-gdh',
  'Chi tiết học phần Giáo dục học - EDUC2802 (K50-51).pdf': 'gioi-thieu-hp-gdh',
  'doc-hdtnhn-thcs-modun-4': 'doc-hdtnhn-thcs-modun-4',
  'hdtnhn-thcs-modun-4': 'doc-hdtnhn-thcs-modun-4',
  'doc-hdtnhn-thpt-modun-4': 'doc-hdtnhn-thpt-modun-4',
  'hdtnhn-thpt-modun-4': 'doc-hdtnhn-thpt-modun-4',
  'doc-hdtn-thcs-modun-2': 'doc-hdtn-thcs-modun-2',
  'hdtn-thcs-modun-2': 'doc-hdtn-thcs-modun-2',
  '11.HDTN_tai-lieu-THCS_9.10.20.20-24h.pdf': 'doc-hdtn-thcs-modun-2',
  'doc-hdtn-thpt-modun-2': 'doc-hdtn-thpt-modun-2',
  'hdtn-thpt-modun-2': 'doc-hdtn-thpt-modun-2',
  '12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf': 'doc-hdtn-thpt-modun-2',
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
      className="mt-10 rounded-2xl border border-[#CFDADB] bg-[#E1E9EA]/50 p-5 text-[#29383D] sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-[#3F6570]" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-wide text-[#29383D] uppercase">
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
              <p className="text-xs font-medium text-[#55676B]">
                Tài liệu tham khảo sử dụng trong bài học:
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {lesson.sources.map((ref, index) => {
                  const entry = resolveEntry(ref.source);
                  const pedagogyDoc = resolvePedagogyDoc(ref.source);

                  // 1. Nếu tìm thấy tài liệu sư phạm chuẩn (Pedagogy Document Reference Card)
                  if (pedagogyDoc) {
                    const docHref = pedagogyDoc.url || pedagogyDoc.path || '#';
                    const isTextbook =
                      pedagogyDoc.category === 'curriculum' ||
                      pedagogyDoc.id.startsWith('gt-') ||
                      pedagogyDoc.title.includes('Giáo trình');

                    return (
                      <div
                        key={`${ref.source}-${index}`}
                        className="rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-sm transition-all hover:shadow-md"
                      >
                        {/* Hàng 1 (Header row - flex items-start justify-between gap-4) */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          {/* Cụm bên trái: khung icon vector mảnh, tiêu đề, badge */}
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E1E9EA] text-[#3F6570]">
                              {isTextbook ? (
                                <BookOpen className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <FileText className="h-5 w-5" aria-hidden="true" />
                              )}
                            </div>
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h4 className="font-serif text-base font-semibold text-[#29383D]">
                                {pedagogyDoc.title}
                              </h4>
                              {(pedagogyDoc.badge || pedagogyDoc.categoryLabel) && (
                                <span className="inline-flex items-center rounded-md bg-[#E1E9EA] px-2 py-0.5 text-[11px] font-medium text-[#55676B]">
                                  {pedagogyDoc.badge || pedagogyDoc.categoryLabel}
                                </span>
                              )}
                              {pedagogyDoc.size && (
                                <span className="inline-flex items-center rounded-md bg-[#E1E9EA] px-2 py-0.5 text-[11px] font-medium text-[#55676B]">
                                  {pedagogyDoc.size}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Cụm bên phải: Nút Đọc tài liệu (PDF) và Nút Tải về */}
                          <div className="flex shrink-0 items-center gap-2 self-start">
                            <a
                              href={docHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3F6570] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#345761]"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Đọc tài liệu (PDF)</span>
                            </a>
                            <a
                              href={docHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={pedagogyDoc.filename}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-white px-3 py-1.5 text-xs font-medium text-[#29383D] transition-colors hover:bg-[#E1E9EA]"
                            >
                              <Download className="h-3.5 w-3.5 text-[#55676B]" aria-hidden="true" />
                              <span>Tải về</span>
                            </a>
                          </div>
                        </div>

                        {/* Hàng 2 (Mô tả - mt-3 pt-3 border-t border-[#CFDADB]/60 w-full) */}
                        {pedagogyDoc.description && (
                          <div className="mt-3 w-full border-t border-[#CFDADB]/60 pt-3">
                            <p className="w-full text-xs leading-relaxed text-[#55676B] md:text-sm">
                              {pedagogyDoc.description}
                            </p>
                          </div>
                        )}

                        {/* Hàng 3 (Số trang, chương mục đối chiếu nếu có) */}
                        {(ref.pages || ref.sections || ref.note) && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#CFDADB]/40 pt-2.5 text-xs text-[#55676B]">
                            {ref.sections && (
                              <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2.5 py-0.5 font-semibold text-[#29383D]">
                                {ref.sections}
                              </span>
                            )}
                            {ref.pages && (
                              <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2.5 py-0.5 font-semibold text-[#55676B]">
                                Trang {ref.pages}
                              </span>
                            )}
                            {ref.note && <span className="text-[#55676B] italic">{ref.note}</span>}
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

                    const isHvkAlgebra =
                      entry.id === 'gt-ctds-hvk-2026' ||
                      ref.source === 'gt-ctds-hvk-2026' ||
                      (entry.authors.some((a) => a.includes('Huỳnh Việt Khánh')) &&
                        entry.title.includes('Cấu trúc Đại số'));

                    const directPdfUrl = isHvkAlgebra
                      ? 'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view'
                      : COURSE_DIRECT_PDF_LINKS[ref.source] ||
                        (entry.id ? COURSE_DIRECT_PDF_LINKS[entry.id] : undefined);

                    const titleText = isHvkAlgebra
                      ? 'Giáo trình Cấu trúc đại số - TS. Huỳnh Việt Khánh'
                      : entry.title;

                    const descriptionText = isHvkAlgebra
                      ? 'Tài liệu học tập chính thức học phần Cấu trúc Đại số — ĐH Sư phạm TP.HCM (HCMUE)'
                      : `${entry.authors.join(', ')} (${entry.year}) · ${entry.publisher}${entry.edition ? ` · ${entry.edition}` : ''}`;

                    return (
                      <div
                        key={`${ref.source}-${index}`}
                        className="rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-sm transition-all hover:shadow-md"
                      >
                        {/* Hàng 1 (Header row - flex items-start justify-between gap-4) */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E1E9EA] text-[#3F6570]">
                              {isBook ? (
                                <BookOpen className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <FileText className="h-5 w-5" aria-hidden="true" />
                              )}
                            </div>

                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h4 className="font-serif text-base font-semibold text-[#29383D]">
                                {titleText}
                              </h4>
                              <span className="inline-flex items-center rounded-md bg-[#E1E9EA] px-2 py-0.5 text-[11px] font-medium text-[#55676B]">
                                {SOURCE_TYPE_LABELS[entry.type]}
                              </span>
                            </div>
                          </div>

                          {directPdfUrl && (
                            <div className="flex shrink-0 items-center gap-2 self-start">
                              <a
                                href={directPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3F6570] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#345761]"
                              >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>
                                  {ref.pages
                                    ? `Đọc giáo trình PDF (Trang ${ref.pages})`
                                    : 'Đọc tài liệu (PDF)'}
                                </span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Hàng 2 (Mô tả tác giả / xuất bản - mt-3 pt-3 border-t border-[#CFDADB]/60 w-full) */}
                        <div className="mt-3 w-full border-t border-[#CFDADB]/60 pt-3">
                          <p className="w-full text-xs leading-relaxed text-[#55676B] md:text-sm">
                            {descriptionText}
                          </p>
                        </div>

                        {/* Hàng 3 (Số trang, chương mục đối chiếu nếu có) */}
                        {(ref.pages || ref.sections || ref.note) && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#CFDADB]/40 pt-2.5 text-xs text-[#55676B]">
                            {ref.sections && (
                              <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2.5 py-0.5 font-semibold text-[#29383D]">
                                {ref.sections}
                              </span>
                            )}
                            {ref.pages && (
                              <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2.5 py-0.5 font-semibold text-[#55676B]">
                                Trang {ref.pages}
                              </span>
                            )}
                            {ref.note && <span className="text-[#55676B] italic">{ref.note}</span>}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 3. Fallback khi không tìm thấy nguồn đã đăng ký
                  return (
                    <div
                      key={`${ref.source}-${index}`}
                      className="rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* Hàng 1 (Header row - flex items-start justify-between gap-4) */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E1E9EA] text-[#55676B]">
                            <FileText className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h4 className="font-serif text-base font-semibold text-[#29383D]">
                              Tài liệu tham khảo
                            </h4>
                            <span className="inline-flex items-center rounded-md bg-[#E1E9EA] px-2 py-0.5 text-[11px] font-medium text-[#55676B]">
                              Mã nguồn: {ref.source}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hàng 2 (Số trang, chương mục đối chiếu nếu có) */}
                      {(ref.pages || ref.sections || ref.note) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#CFDADB]/60 pt-3 text-xs text-[#55676B]">
                          {ref.sections && (
                            <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2.5 py-0.5 font-semibold text-[#29383D]">
                              {ref.sections}
                            </span>
                          )}
                          {ref.pages && (
                            <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2.5 py-0.5 font-semibold text-[#55676B]">
                              Trang {ref.pages}
                            </span>
                          )}
                          {ref.note && <span className="text-[#55676B] italic">{ref.note}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {blocksWithOriginalOrSource.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#55676B]">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
                <span>Bảng đối chiếu số hiệu gốc trong giáo trình:</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                {blocksWithOriginalOrSource.map((block) => {
                  const entry = block.source ? resolveEntry(block.source) : undefined;
                  const pedagogyDoc = block.source ? resolvePedagogyDoc(block.source) : undefined;

                  // Tên định lý ngắn gọn (ví dụ: "ĐL 3.2.1 · Lagrange")
                  const shortLabel = block.label
                    .replace(/^Định lý\s*/i, 'ĐL ')
                    .replace(/^Định nghĩa\s*/i, 'ĐN ')
                    .replace(/^Mệnh đề\s*/i, 'MĐ ')
                    .replace(/^Bổ đề\s*/i, 'BĐ ')
                    .replace(/^Hệ quả\s*/i, 'HQ ')
                    .replace(/^Ví dụ\s*/i, 'VD ');

                  const shortTitle = block.title
                    ? block.title
                        .replace(/^Định lý\s+/i, '')
                        .replace(/^Định nghĩa\s+/i, '')
                        .trim()
                    : '';

                  const shortOriginal = block.original
                    ? block.original
                        .replace(/^Định lý\s*/i, 'ĐL ')
                        .replace(/^Định nghĩa\s*/i, 'ĐN ')
                        .replace(/^Mệnh đề\s*/i, 'MĐ ')
                        .replace(/^Bổ đề\s*/i, 'BĐ ')
                        .replace(/^Hệ quả\s*/i, 'HQ ')
                    : '';

                  let authorName = '';
                  if (pedagogyDoc) {
                    authorName = pedagogyDoc.badge || pedagogyDoc.title;
                  } else if (entry) {
                    if (
                      entry.id === 'gt-ctds-hvk-2026' ||
                      entry.authors.some((a) => a.includes('Huỳnh Việt Khánh'))
                    ) {
                      authorName = 'TS. Huỳnh Việt Khánh';
                    } else {
                      authorName = entry.authors[0] || entry.authors.join(', ');
                    }
                  }

                  return (
                    <a
                      key={block.anchorId}
                      href={`#${block.anchorId}`}
                      title={`${block.label}${block.title ? ` — ${block.title}` : ''} (${block.original ? `Số hiệu gốc: ${block.original}` : 'Đối chiếu'})`}
                      className="group relative flex flex-col justify-between rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-2.5 text-xs shadow-2xs transition-all duration-200 hover:z-20 hover:scale-105 hover:border-[#71889A] hover:bg-white hover:shadow-xl"
                    >
                      <div>
                        {/* Dòng 1: Tên ngắn gọn + Icon liên kết */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="line-clamp-1 font-semibold text-[#29383D] group-hover:text-[#3F6570]">
                            {shortLabel}
                            {shortTitle ? ` · ${shortTitle}` : ''}
                          </span>
                          <ExternalLink
                            className="h-3 w-3 shrink-0 text-[#55676B] transition-colors group-hover:text-[#29383D]"
                            aria-hidden="true"
                          />
                        </div>

                        {/* Dòng 2: Số hiệu gốc nổi bật */}
                        <div className="mt-1 flex flex-wrap items-center gap-1 font-mono text-[11px] font-medium text-[#3F6570]">
                          <span className="rounded bg-[#E5EDF1] px-1.5 py-0.5">
                            {block.original ? `Gốc: ${shortOriginal}` : 'Đối chiếu'}
                          </span>
                          {block.page && (
                            <span className="rounded bg-[#E1E9EA] px-1 py-0.5 text-[#55676B]">
                              tr. {block.page}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chi tiết khi Hover: Tên đầy đủ và Nguồn sách gốc */}
                      <div className="mt-2 space-y-0.5 border-t border-[#CFDADB] pt-1 text-[11px] text-[#55676B]">
                        <p className="line-clamp-1 font-medium text-[#29383D] group-hover:line-clamp-none">
                          {block.label}
                          {block.title ? `: ${block.title}` : ''}
                        </p>
                        <p className="line-clamp-1 text-[10.5px] text-[#55676B] group-hover:line-clamp-none">
                          {block.original ? (
                            <span>Số hiệu gốc: {block.original}</span>
                          ) : (
                            <span>Đối chiếu nguồn</span>
                          )}
                          {authorName && <span> · {authorName}</span>}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2.5 text-xs leading-relaxed text-[#55676B]">
          Thông tin giáo trình chính và số trang đối chiếu của bài học sẽ được cập nhật trong giai
          đoạn biên soạn nội dung học thuật.
        </p>
      )}
    </section>
  );
}
