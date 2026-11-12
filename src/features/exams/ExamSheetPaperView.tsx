import { useState } from 'react';
import {
  AlertTriangle,
  BookCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  FileCheck2,
  Lightbulb,
} from 'lucide-react';
import type { ExamPaper, ExamProblem } from '@/data/courses/exam-bank-types';
import { MathText } from '@/features/exams/MathText';
import { cn } from '@/shared/lib/cn';

export interface ExamSheetPaperViewProps {
  readonly paper: ExamPaper;
  readonly className?: string;
}

function getProblemHeading(paper: ExamPaper, problem: ExamProblem): string {
  if (problem.sheetHeading) return problem.sheetHeading;
  const prefix = problem.labelPrefix ?? paper.questionPrefix ?? 'Câu';
  const punctuation = prefix === 'Bài' ? '' : '.';
  return `${prefix} ${problem.number}${punctuation} (${problem.points} điểm)`;
}

function formatSheetHeadingMarkdown(heading: string): string {
  const starIdx = heading.indexOf('*');
  if (starIdx === -1) return `**${heading}**`;
  const boldPart = heading.slice(0, starIdx).trimEnd();
  const restPart = heading.slice(starIdx).trimStart();
  return restPart ? `**${boldPart}** ${restPart}` : `**${boldPart}**`;
}

function getTotalPoints(paper: ExamPaper): string {
  const sum = paper.problems.reduce((acc, p) => acc + p.points, 0);
  return Number.isInteger(sum) ? `${sum}.0` : sum.toFixed(1);
}

/**
 * Hiển thị bài thi theo bố cục tách biệt 2 khối:
 * 1) Khối trên: TỜ ĐỀ THI nguyên bản 100% dạng trang A4 chuẩn mực (không chèn tên tóm tắt hay nút lời giải xen kẽ).
 * 2) Khối dưới: LỜI GIẢI CHI TIẾT & THANG ĐIỂM THAM KHẢO (mặc định thu gọn, đóng/mở bằng một nút Xanh Rêu Sơn Mài).
 */
export function ExamSheetPaperView({ paper, className }: ExamSheetPaperViewProps) {
  const [showSolutions, setShowSolutions] = useState(false);

  const delimiterDefault = ')';

  return (
    <div className={cn('space-y-8', className)}>
      {/* KHỐI 1: TỜ ĐỀ THI NGUYÊN BẢN (A4 PAPER SHEET) */}
      <article
        aria-label={`Tờ đề thi: ${paper.title}`}
        className="rounded-xl border border-[var(--border-control)] bg-[var(--bg-surface)] px-5 py-6 shadow-sm sm:px-10 sm:py-9"
      >
        {/* Nhãn phân biệt Đề biên soạn thêm (chỉ hiện ở đề mẫu / ôn tập) */}
        {paper.isMockExam ? (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50/90 px-4 py-2.5 text-center text-xs font-bold tracking-wide text-amber-950 uppercase">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>
              {paper.mockBannerLabel ?? 'ĐỀ BIÊN SOẠN ÔN TẬP (MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC)'}
            </span>
          </div>
        ) : (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-[var(--border-subtle)] pb-3 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#1B3D2F]">
              <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
              TỜ ĐỀ THI CHÍNH THỨC ({paper.year} · {paper.semester})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {paper.durationMinutes} phút · Tổng {getTotalPoints(paper)} điểm
            </span>
          </div>
        )}

        {/* Header 2 cột chuẩn đề thi đại học */}
        {paper.sheetHeader ? (
          <header className="border-b border-[var(--border-control)] pb-5">
            <div className="grid gap-5 text-center sm:grid-cols-12 sm:items-start">
              {/* Cột trái */}
              <div className="space-y-0.5 text-xs leading-relaxed text-[var(--text-main)] sm:col-span-5 sm:text-[13px]">
                {paper.sheetHeader.leftLines.map((line, idx) => (
                  <p
                    key={`${paper.id}-hl-${idx}`}
                    className={cn(
                      idx === 0 && 'font-bold tracking-wide uppercase',
                      idx === 1 &&
                        'mx-auto inline-block border-b border-[var(--text-main)]/40 pb-0.5 font-semibold uppercase',
                      idx === 2 && 'pt-1 font-bold',
                      idx >= 3 && 'text-xs text-[var(--text-muted)] italic',
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Cột phải */}
              <div className="space-y-0.5 text-xs leading-relaxed text-[var(--text-main)] sm:col-span-7 sm:text-[13px]">
                <p className="font-bold tracking-wide uppercase">{paper.sheetHeader.rightTitle}</p>
                <p className="font-bold text-[#1B3D2F] uppercase">
                  {paper.sheetHeader.rightSubtitle}
                </p>
                {paper.sheetHeader.metaRows.map((row, idx, arr) => (
                  <p
                    key={`${paper.id}-hm-${idx}`}
                    className={cn(idx === arr.length - 1 ? 'font-medium italic' : 'font-medium')}
                  >
                    {row}
                  </p>
                ))}
              </div>
            </div>
          </header>
        ) : null}

        {/* Nội dung đề thi hiển thị liền mạch, nguyên văn */}
        <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[var(--text-main)]">
          {paper.problems.map((problem) => {
            const headingMd = formatSheetHeadingMarkdown(getProblemHeading(paper, problem));
            const delimiter = problem.partDelimiter ?? delimiterDefault;
            const hasInlineStatement = Boolean(problem.inlineSheetHeading && problem.statement);

            return (
              <section key={problem.id} className="space-y-2">
                {hasInlineStatement && problem.statement ? (
                  <MathText
                    text={`${headingMd} ${problem.statement}`}
                    className="space-y-2.5 text-[15px] leading-relaxed"
                  />
                ) : (
                  <>
                    <MathText text={headingMd} className="text-[15px] leading-relaxed" />
                    {problem.statement ? (
                      <MathText
                        text={problem.statement}
                        className="space-y-2.5 text-[15px] leading-relaxed"
                      />
                    ) : null}
                  </>
                )}

                {problem.parts && problem.parts.length > 0 ? (
                  <div className="mt-1.5 space-y-1.5 pl-1 sm:pl-4">
                    {problem.parts.map((part) => (
                      <div
                        key={`${problem.id}-sheet-part-${part.label}`}
                        className="flex items-start gap-2"
                      >
                        <span className="shrink-0 font-semibold text-[var(--text-main)]">
                          {part.label}
                          {delimiter}
                        </span>
                        <div className="min-w-0 flex-1">
                          <MathText
                            text={part.statement}
                            className="space-y-2 text-[15px] leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        {/* Dòng kết thúc & Ghi chú / Chú ý nguyên bản */}
        {(paper.endMarker || (paper.sheetNotes && paper.sheetNotes.length > 0)) && (
          <footer className="mt-7 space-y-4">
            {paper.endMarker ? (
              <p className="text-center text-sm font-bold tracking-widest text-[var(--text-main)]">
                {paper.endMarker}
              </p>
            ) : null}

            {paper.sheetNotes && paper.sheetNotes.length > 0 ? (
              <div className="border-t border-[var(--border-subtle)] pt-4 text-sm text-[var(--text-main)]">
                {paper.sheetNotesHeading ? (
                  <p className="font-semibold italic underline underline-offset-4">
                    {paper.sheetNotesHeading}
                  </p>
                ) : null}
                <ul className="mt-1.5 space-y-1 pl-1">
                  {paper.sheetNotes.map((note, idx) => (
                    <li key={`${paper.id}-note-${idx}`} className="leading-relaxed">
                      - {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </footer>
        )}
      </article>

      {/* KHỐI 2: LỜI GIẢI CHI TIẾT & THANG ĐIỂM THAM KHẢO (ĐỘC LẬP Ở DƯỚI) */}
      <section
        aria-label="Lời giải chi tiết và thang điểm tham khảo"
        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-2xs sm:p-7"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-[#1B3D2F]" aria-hidden="true" />
              <h3 className="text-base font-bold tracking-tight text-[var(--text-main)] uppercase sm:text-lg">
                LỜI GIẢI CHI TIẾT &amp; THANG ĐIỂM THAM KHẢO
              </h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
              Hãy hoàn thành trọn vẹn tờ đề thi phía trên trước khi mở toàn bộ lời giải và thang
              điểm tự chấm.
            </p>
          </div>

          <button
            type="button"
            aria-expanded={showSolutions}
            onClick={() => setShowSolutions((prev) => !prev)}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B3D2F] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#142F24] sm:text-sm"
          >
            {showSolutions ? (
              <>
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                <span>Ẩn lời giải chi tiết</span>
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>Hiện lời giải chi tiết &amp; thang điểm</span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {showSolutions ? (
          <div className="mt-6 space-y-6 border-t border-[var(--border-subtle)] pt-6">
            {paper.problems.map((problem) => {
              const headingMd = formatSheetHeadingMarkdown(getProblemHeading(paper, problem));
              const delimiter = problem.partDelimiter ?? delimiterDefault;

              return (
                <div
                  key={`${problem.id}-solution-block`}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/35 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                    <div className="text-sm font-bold text-[#1B3D2F] sm:text-base">
                      <MathText text={headingMd} />
                    </div>
                    <span className="rounded-md bg-[#1B3D2F] px-2.5 py-0.5 text-xs font-semibold text-white">
                      {problem.points.toFixed(1)} điểm
                    </span>
                  </div>

                  {problem.solutionRubric ? (
                    <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-medium text-[#1B3D2F]">
                      <strong>Thang điểm tham khảo:</strong> {problem.solutionRubric}
                    </p>
                  ) : null}

                  {problem.hint ? (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                        <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                        Hướng tiếp cận
                      </p>
                      <MathText text={problem.hint} className="text-xs sm:text-sm" />
                    </div>
                  ) : null}

                  {problem.solution ? (
                    <div className="mt-4">
                      <MathText text={problem.solution} className="space-y-3 text-sm" />
                    </div>
                  ) : null}

                  {problem.parts && problem.parts.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {problem.parts.map((part) => (
                        <div
                          key={`${problem.id}-sol-part-${part.label}`}
                          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                        >
                          <p className="mb-2 text-xs font-bold tracking-wide text-[#1B3D2F] uppercase">
                            Lời giải {part.label}
                            {delimiter}
                          </p>
                          {part.hint ? (
                            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2">
                              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                                Gợi ý nhanh
                              </p>
                              <MathText text={part.hint} className="text-xs sm:text-sm" />
                            </div>
                          ) : null}
                          <MathText text={part.solution} className="space-y-3 text-sm" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
