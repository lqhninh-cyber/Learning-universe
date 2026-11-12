import { BookOpen, Layers, ListChecks, Scale, ShieldCheck, Table2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface PedagogyMetadataBarProps {
  /** Mã học phần (mặc định EDUC2802) */
  readonly courseCode?: string;
  /** Mã định danh bài học (ví dụ: EDUC2802-C1-L1) */
  readonly lessonCode?: string;
  /** Danh sách chuẩn đầu ra CLO áp dụng cho bài học, ví dụ: ['CLO1', 'CLO2'] */
  readonly clos: readonly string[];
  /** Số trang tương ứng trong Giáo trình Giáo dục học HCMUE, ví dụ: 'Tr. 1–7' */
  readonly textbookPages: string;
  /** Tài liệu pháp quy hoặc mô đun đối chiếu kèm theo */
  readonly legalRefs?: readonly string[];
  /** Định lượng tiết học hoặc trọng tâm tự học */
  readonly sessionNote?: string;
  readonly className?: string;
}

function formatDisplayCourseBadge(courseCode: string): string {
  if (/^EDUC\d+/i.test(courseCode.trim())) {
    return 'Giáo dục học';
  }
  if (/^MATH\d+/i.test(courseCode.trim())) {
    return 'Toán học';
  }
  return courseCode;
}

function formatDisplayLessonBadge(lessonCode: string): string {
  const cleaned = lessonCode.replace(/^(MATH|EDUC)\d+-?/i, '');
  const chapterLessonMatch = cleaned.match(/^C(\d+)-L(\d+)$/i);
  if (chapterLessonMatch) {
    return `Chương ${chapterLessonMatch[1]} · Bài ${chapterLessonMatch[2]}`;
  }
  const practiceMatch = cleaned.match(/^PRACTICE-(\d+)$/i);
  if (practiceMatch) {
    return `Thực hành ${practiceMatch[1]}`;
  }
  return cleaned || lessonCode;
}

/**
 * 1. Thanh Metadata & Đối chiếu Đầu bài (PedagogyMetadataBar)
 * Hiển thị rõ Học phần, Chương/Bài, Chuẩn đầu ra CLO và Số trang tương ứng trong Giáo trình Giáo dục học HCMUE.
 */
export function PedagogyMetadataBar({
  courseCode = 'Giáo dục học',
  lessonCode,
  clos,
  textbookPages,
  legalRefs,
  sessionNote,
  className,
}: PedagogyMetadataBarProps) {
  const displayCourseBadge = formatDisplayCourseBadge(courseCode);
  const displayLessonBadge = lessonCode ? formatDisplayLessonBadge(lessonCode) : undefined;

  return (
    <div
      role="region"
      aria-label="Thông số đối chiếu đề cương và giáo trình"
      className={cn(
        'rounded-2xl border border-[#CFDADB] bg-[#E1E9EA]/70 p-4 text-xs text-[#29383D] shadow-2xs dark:border-[#2A323A] dark:bg-[#1C2126] dark:text-[#E2E8F0] dark:shadow-none',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#3F6570]/30 bg-[#3F6570] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white uppercase dark:border-[#2A323A] dark:bg-[#242C33] dark:text-[#F8FAFC]">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{displayCourseBadge}</span>
          </span>

          {displayLessonBadge && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-[#3F6570] dark:border-[#2A323A] dark:bg-[#14171A] dark:text-[#CBD5E1]">
              <span>{displayLessonBadge}</span>
            </span>
          )}

          {clos.map((clo) => (
            <span
              key={clo}
              className="inline-flex items-center gap-1 rounded-lg border border-[#718C7E]/45 bg-[#E8EFEB] px-2.5 py-1 font-mono text-[11px] font-bold text-[#29383D] dark:border-[#2A323A] dark:bg-[#14171A] dark:text-[#CBD5E1]"
            >
              <ShieldCheck
                className="h-3.5 w-3.5 text-[#3F6570] dark:text-[#C89738]"
                aria-hidden="true"
              />
              <span>{clo}</span>
            </span>
          ))}

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] px-2.5 py-1 font-medium text-[#29383D] dark:border-[#2A323A] dark:bg-[#14171A] dark:text-[#CBD5E1]">
            <BookOpen
              className="h-3.5 w-3.5 text-[#718C7E] dark:text-[#C89738]"
              aria-hidden="true"
            />
            <span>Giáo trình Giáo dục học HCMUE:</span>
            <strong className="font-mono font-bold text-[#3F6570] dark:text-[#F8FAFC]">
              {textbookPages}
            </strong>
          </span>
        </div>

        {sessionNote && (
          <span className="font-mono text-[11px] font-medium text-[#55676B] dark:text-[#94A3B8]">
            {sessionNote}
          </span>
        )}
      </div>

      {legalRefs && legalRefs.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[#CFDADB] pt-2.5 text-[11px] text-[#55676B] dark:border-[#2A323A] dark:text-[#94A3B8]">
          <span className="inline-flex items-center gap-1 font-semibold text-[#29383D] dark:text-[#E2E8F0]">
            <Scale className="h-3.5 w-3.5 text-[#718C7E] dark:text-[#C89738]" aria-hidden="true" />
            <span>Văn bản pháp quy &amp; Học liệu đối chiếu:</span>
          </span>
          {legalRefs.map((ref) => (
            <span
              key={ref}
              className="rounded-md border border-[#CFDADB] bg-[#F7FAFA] px-2 py-0.5 text-[11px] font-medium text-[#29383D] dark:border-[#2A323A] dark:bg-[#14171A] dark:text-[#CBD5E1]"
            >
              {ref}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export interface ComparativeTableColumn {
  readonly key: string;
  readonly header: string;
  readonly widthClass?: string;
  readonly highlight?: boolean;
}

export type ComparativeTableRow = Readonly<Record<string, ReactNode>> | readonly ReactNode[];

export interface ComparativeTableProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly badge?: string;
  readonly columns?: readonly (ComparativeTableColumn | string)[];
  readonly headers?: readonly string[];
  readonly rows: readonly ComparativeTableRow[];
  readonly footerNote?: string;
  readonly className?: string;
}

function isTupleRow(row: ComparativeTableRow): row is readonly ReactNode[] {
  return Array.isArray(row);
}

/**
 * 2. Bảng Ma trận So sánh (ComparativeTable)
 * Dùng cho các nội dung phân hóa (Nhiệm vụ GV Tiểu học vs Trung học, 3 giai đoạn tập thể, 5 phẩm chất & 10 năng lực, Kế hoạch GD 3 cấp học...).
 */
export function ComparativeTable({
  title,
  subtitle,
  badge = 'Ma trận Đối sánh Học thuật',
  columns,
  headers,
  rows,
  footerNote,
  className,
}: ComparativeTableProps) {
  const normalizedColumns: readonly ComparativeTableColumn[] = (columns ?? headers ?? []).map(
    (col, index) => (typeof col === 'string' ? { key: String(index), header: col } : col),
  );

  // Nhận diện bảng 3 cột dạng Ma trận Tiêu chuẩn - Số lượng - Tiêu chí chi tiết
  const isCriteriaCountMatrix =
    normalizedColumns.length === 3 &&
    (normalizedColumns[1]?.key === 'count' || /số lượng/i.test(normalizedColumns[1]?.header ?? ''));

  const getColumnWidthClass = (col: ComparativeTableColumn, colIndex: number): string => {
    if (isCriteriaCountMatrix) {
      if (colIndex === 0) return 'w-[22%]';
      if (colIndex === 1) return 'w-[18%] text-center';
      return 'w-[60%]';
    }
    return col.widthClass ?? '';
  };

  return (
    <div
      className={cn(
        'col-span-full clear-both my-6 w-full overflow-hidden overflow-x-auto rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-2xs dark:border dark:border-[#1D3629] dark:bg-[#0B1712] dark:shadow-none',
        className,
      )}
    >
      <div className="border-b border-[#CFDADB] bg-[#E1E9EA]/65 px-5 py-4 dark:border-[#1F3D2E] dark:bg-[#12241C]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718C7E]/40 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#29383D] dark:border-[#284E3B] dark:bg-[#163023] dark:text-[#C5DCD0]">
            <Table2 className="h-3.5 w-3.5 text-[#3F6570] dark:text-[#C5A262]" aria-hidden="true" />
            <span>{badge}</span>
          </span>
        </div>
        <h3 className="mt-2 font-serif text-base font-bold text-[#29383D] sm:text-lg dark:text-[#F5F2EB]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-[#55676B] dark:text-[#CBD5CE]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs md:text-sm">
          <thead>
            <tr className="border-b border-[#CFDADB] bg-[#E8EFEB]/80 text-[#29383D] dark:border-b dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#C5A262]">
              {normalizedColumns.map((col, colIndex) => {
                const isLastCol = colIndex === normalizedColumns.length - 1;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'border-b border-[#CFDADB] p-3.5 font-serif text-xs font-bold tracking-wide text-[#29383D] uppercase dark:border-[#1F3D2E] dark:text-[#C5A262]',
                      !isLastCol && 'border-r border-[#CFDADB]/60 dark:border-[#1F3D2E]/60',
                      getColumnWidthClass(col, colIndex),
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="transition-colors odd:bg-[#F7FAFA] even:bg-[#EAF0F1]/45 hover:bg-[#E8EFEB]/45 dark:odd:bg-[#0B1712] dark:even:bg-[#0E1E17] hover:dark:bg-[#102219]"
              >
                {normalizedColumns.map((col, colIndex) => {
                  const cellContent = isTupleRow(row) ? row[colIndex] : row[col.key];
                  const isLastCol = colIndex === normalizedColumns.length - 1;
                  const isCenteredCountCol = isCriteriaCountMatrix && colIndex === 1;

                  return (
                    <td
                      key={`${rowIndex}-${col.key}`}
                      className={cn(
                        'border-b border-[#CFDADB]/60 p-3.5 align-top leading-relaxed dark:border-[#152B20]/80 dark:text-[#E8F1EC]',
                        !isLastCol && 'border-r border-[#CFDADB]/60 dark:border-[#152B20]/80',
                        getColumnWidthClass(col, colIndex),
                        colIndex === 0 || col.highlight
                          ? 'font-medium text-[#29383D] dark:font-mono dark:font-bold dark:text-[#739B88]'
                          : isCenteredCountCol
                            ? 'text-center text-[#55676B] dark:text-[#CBD5CE]'
                            : colIndex === 2 && isCriteriaCountMatrix
                              ? 'leading-relaxed text-[#29383D] dark:text-[#E8F1EC]'
                              : 'leading-relaxed text-[#29383D] dark:text-[#E8F1EC]',
                      )}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footerNote && (
        <div className="border-t border-[#CFDADB] bg-[#E1E9EA]/45 px-5 py-2.5 text-[11px] text-[#55676B] italic dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#CBD5CE]">
          {footerNote}
        </div>
      )}
    </div>
  );
}

export interface ProcessFlowStep {
  readonly number?: string | number;
  readonly title: string;
  readonly badge?: string;
  readonly description: string;
  readonly keyAction?: string;
  readonly deliverable?: string;
}

export interface NumberedProcessFlowProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly badge?: string;
  readonly steps: readonly ProcessFlowStep[];
  readonly columns?: 1 | 2 | 3;
  readonly className?: string;
}

/**
 * 3. Lưu đồ Quy trình Đánh số (NumberedProcessFlow)
 * Trình bày các quy trình nghiệp vụ dạng thẻ đánh số 01, 02, 03 bằng font Serif sắc nét.
 */
export function NumberedProcessFlow({
  title,
  subtitle,
  badge = 'Lưu đồ Quy trình Nghiệp vụ',
  steps,
  columns = 2,
  className,
}: NumberedProcessFlowProps) {
  const gridColsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2';

  return (
    <div
      className={cn(
        'col-span-full clear-both my-6 w-full rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs sm:p-6 dark:border-[#2A323A] dark:bg-[#1C2126] dark:shadow-none',
        className,
      )}
    >
      <div className="border-b border-[#CFDADB] pb-4 dark:border-[#2A323A]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718C7E]/40 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#29383D] dark:border-[#2A323A] dark:bg-[#14171A] dark:text-[#CBD5E1]">
          <ListChecks
            className="h-3.5 w-3.5 text-[#3F6570] dark:text-[#C89738]"
            aria-hidden="true"
          />
          <span>{badge}</span>
        </span>
        <h3 className="mt-2 font-serif text-base font-bold text-[#29383D] sm:text-lg dark:text-[#F8FAFC]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-[#55676B] dark:text-[#94A3B8]">
            {subtitle}
          </p>
        )}
      </div>

      <div className={cn('mt-4 grid gap-3.5', gridColsClass)}>
        {steps.map((step, index) => {
          const stepNum =
            step.number !== undefined
              ? String(step.number).padStart(2, '0')
              : String(index + 1).padStart(2, '0');

          return (
            <div
              key={`process-step-${stepNum}-${step.title}`}
              className="flex flex-col justify-between rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/55 p-4 transition-colors hover:border-[#718C7E] dark:border-[#2A323A] dark:bg-[#14171A] dark:hover:border-[#C89738]"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#718C7E]/40 bg-[#E8EFEB] font-serif text-sm font-bold text-[#3F6570] dark:border-[#2A323A] dark:bg-[#242C33] dark:text-[#F8FAFC]">
                    {stepNum}
                  </span>
                  <div className="min-w-0 flex-1">
                    {step.badge && (
                      <span className="mb-1 inline-block rounded border border-[#718C7E]/35 bg-[#E8EFEB] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#3F6570] dark:border-[#2A323A] dark:bg-[#20252B] dark:text-[#C89738]">
                        {step.badge}
                      </span>
                    )}
                    <h4 className="font-serif text-sm font-bold text-[#29383D] dark:text-[#F8FAFC]">
                      {step.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#55676B] dark:text-[#CBD5E1]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {(step.keyAction || step.deliverable) && (
                <div className="mt-3 space-y-1 border-t border-[#CFDADB] pt-2.5 text-[11px] dark:border-[#2A323A]">
                  {step.keyAction && (
                    <p className="text-[#29383D] dark:text-[#E2E8F0]">
                      <strong className="text-[#3F6570] dark:text-[#C89738]">
                        Thao tác trọng tâm:{' '}
                      </strong>
                      <span>{step.keyAction}</span>
                    </p>
                  )}
                  {step.deliverable && (
                    <p className="text-[#55676B] dark:text-[#CBD5E1]">
                      <strong className="text-[#29383D] dark:text-[#F8FAFC]">
                        Sản phẩm / Minh chứng:{' '}
                      </strong>
                      <span>{step.deliverable}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
