import { BookOpen, Layers, ListChecks, Scale, ShieldCheck, Table2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface PedagogyMetadataBarProps {
  /** Mã học phần (mặc định EDUC2802) */
  readonly courseCode?: string;
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

/**
 * 1. Thanh Metadata & Đối chiếu Đầu bài (PedagogyMetadataBar)
 * Hiển thị rõ Mã học phần EDUC2802, Chuẩn đầu ra CLO và Số trang tương ứng trong Giáo trình Giáo dục học HCMUE.
 */
export function PedagogyMetadataBar({
  courseCode = 'EDUC2802',
  clos,
  textbookPages,
  legalRefs,
  sessionNote,
  className,
}: PedagogyMetadataBarProps) {
  return (
    <div
      role="region"
      aria-label="Thông số đối chiếu đề cương và giáo trình"
      className={cn(
        'rounded-2xl border border-[#CFDADB] bg-[#E1E9EA]/70 p-4 text-xs text-[#29383D] shadow-2xs',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#3F6570]/30 bg-[#3F6570] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white uppercase">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{courseCode}</span>
          </span>

          {clos.map((clo) => (
            <span
              key={clo}
              className="inline-flex items-center gap-1 rounded-lg border border-[#718C7E]/45 bg-[#E8EFEB] px-2.5 py-1 font-mono text-[11px] font-bold text-[#29383D]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
              <span>{clo}</span>
            </span>
          ))}

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] px-2.5 py-1 font-medium text-[#29383D]">
            <BookOpen className="h-3.5 w-3.5 text-[#718C7E]" aria-hidden="true" />
            <span>Giáo trình Giáo dục học HCMUE:</span>
            <strong className="font-mono font-bold text-[#3F6570]">{textbookPages}</strong>
          </span>
        </div>

        {sessionNote && (
          <span className="font-mono text-[11px] font-medium text-[#55676B]">{sessionNote}</span>
        )}
      </div>

      {legalRefs && legalRefs.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[#CFDADB] pt-2.5 text-[11px] text-[#55676B]">
          <span className="inline-flex items-center gap-1 font-semibold text-[#29383D]">
            <Scale className="h-3.5 w-3.5 text-[#718C7E]" aria-hidden="true" />
            <span>Văn bản pháp quy &amp; Học liệu đối chiếu:</span>
          </span>
          {legalRefs.map((ref) => (
            <span
              key={ref}
              className="rounded-md border border-[#CFDADB] bg-[#F7FAFA] px-2 py-0.5 text-[11px] font-medium text-[#29383D]"
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

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-2xs',
        className,
      )}
    >
      <div className="border-b border-[#CFDADB] bg-[#E1E9EA]/65 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718C7E]/40 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#29383D]">
            <Table2 className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
            <span>{badge}</span>
          </span>
        </div>
        <h3 className="mt-2 font-serif text-base font-bold text-[#29383D] sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-1 text-xs leading-relaxed text-[#55676B]">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#CFDADB] bg-[#E8EFEB]/80 text-[#29383D]">
              {normalizedColumns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-serif text-xs font-bold tracking-wide text-[#29383D] uppercase',
                    col.widthClass,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CFDADB]">
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="transition-colors odd:bg-[#F7FAFA] even:bg-[#EAF0F1]/45 hover:bg-[#E8EFEB]/45"
              >
                {normalizedColumns.map((col, colIndex) => {
                  const cellContent = isTupleRow(row) ? row[colIndex] : row[col.key];
                  return (
                    <td
                      key={`${rowIndex}-${col.key}`}
                      className={cn(
                        'px-4 py-3.5 align-top leading-relaxed',
                        colIndex === 0 || col.highlight
                          ? 'font-semibold text-[#29383D]'
                          : 'text-[#55676B]',
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
        <div className="border-t border-[#CFDADB] bg-[#E1E9EA]/45 px-5 py-2.5 text-[11px] text-[#55676B] italic">
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
        'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs sm:p-6',
        className,
      )}
    >
      <div className="border-b border-[#CFDADB] pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718C7E]/40 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#29383D]">
          <ListChecks className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
          <span>{badge}</span>
        </span>
        <h3 className="mt-2 font-serif text-base font-bold text-[#29383D] sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-1 text-xs leading-relaxed text-[#55676B]">{subtitle}</p>}
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
              className="flex flex-col justify-between rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/55 p-4 transition-colors hover:border-[#718C7E]"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#718C7E]/40 bg-[#E8EFEB] font-serif text-sm font-bold text-[#3F6570]">
                    {stepNum}
                  </span>
                  <div className="min-w-0 flex-1">
                    {step.badge && (
                      <span className="mb-1 inline-block rounded border border-[#718C7E]/35 bg-[#E8EFEB] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#3F6570]">
                        {step.badge}
                      </span>
                    )}
                    <h4 className="font-serif text-sm font-bold text-[#29383D]">{step.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#55676B]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {(step.keyAction || step.deliverable) && (
                <div className="mt-3 space-y-1 border-t border-[#CFDADB] pt-2.5 text-[11px]">
                  {step.keyAction && (
                    <p className="text-[#29383D]">
                      <strong className="text-[#3F6570]">Thao tác trọng tâm: </strong>
                      <span>{step.keyAction}</span>
                    </p>
                  )}
                  {step.deliverable && (
                    <p className="text-[#55676B]">
                      <strong className="text-[#29383D]">Sản phẩm / Minh chứng: </strong>
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
