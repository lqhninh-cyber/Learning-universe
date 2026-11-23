import { type FC, type ReactNode } from 'react';
import {
  resolveOptionColumns,
  type ExamImageAttachment,
  type ExamPart,
  type ExamQuestion,
  type ParsedExamStructure,
} from '@/features/exam-builder';
import { InlineMathText } from '@/features/math-glossary';
import { cn } from '@/shared/lib/cn';
import { useResolvedMediaUrl } from '@/utils/useResolvedMediaUrl';

const ResolvedExamFigure: FC<{
  readonly image: ExamImageAttachment;
  readonly questionNumber: number;
}> = ({ image, questionNumber }) => {
  const resolvedSrc = useResolvedMediaUrl(image.dataUrl);
  if (!resolvedSrc) return null;

  return (
    <figure className="my-2 flex flex-col items-center">
      <img
        src={resolvedSrc}
        alt={image.caption || `Hình minh họa Câu ${questionNumber}`}
        style={{ width: `${Math.max(20, Math.min(100, image.widthPercent))}%` }}
        className="h-auto max-h-[260px] object-contain"
      />
      {image.caption && (
        <figcaption className="mt-1 text-[10.5pt] text-neutral-700 italic">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
};

export interface ExamPaperPreviewProps {
  readonly structure: ParsedExamStructure;
  readonly showEndLine: boolean;
  readonly showAnswerKey: boolean;
}

/**
 * Kết xuất chuỗi có hỗ trợ **chữ đậm**, *chữ nghiêng* và công thức KaTeX ($...$, $$...$$).
 */
function renderRichMathInline(text: string): ReactNode {
  if (!text) return null;
  // Tách các đoạn in đậm **...** ngoài công thức toán
  const boldParts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return boldParts.map((segment, idx) => {
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      return (
        <strong key={idx} className="font-bold">
          <InlineMathText text={segment.slice(2, -2)} />
        </strong>
      );
    }
    return <InlineMathText key={idx} text={segment} />;
  });
}

interface StemBlock {
  readonly kind: 'paragraph' | 'table' | 'bullet';
  readonly lines: readonly string[];
}

function splitStemIntoBlocks(stem: string): readonly StemBlock[] {
  const lines = stem.split('\n');
  const blocks: StemBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    // Nhận diện bảng Markdown | ... |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i]!.trim().startsWith('|') &&
        lines[i]!.trim().endsWith('|')
      ) {
        tableLines.push(lines[i]!.trim());
        i += 1;
      }
      blocks.push({ kind: 'table', lines: tableLines });
      continue;
    }

    // Nhận diện gạch đầu dòng `+ ...` (kiểu Câu 5 đề Toán 2025)
    if (trimmed.startsWith('+ ')) {
      const bulletLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith('+ ')) {
        bulletLines.push(lines[i]!.trim());
        i += 1;
      }
      blocks.push({ kind: 'bullet', lines: bulletLines });
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const t = lines[i]!.trim();
      if (!t || (t.startsWith('|') && t.endsWith('|')) || t.startsWith('+ ')) break;
      paraLines.push(lines[i]!);
      i += 1;
    }
    blocks.push({ kind: 'paragraph', lines: paraLines });
  }

  return blocks;
}

const MarkdownExamTable: FC<{ readonly lines: readonly string[] }> = ({ lines }) => {
  const parsedRows = lines
    .filter((line) => !/^\|[\s:|-]+\|$/.test(line))
    .map((line) =>
      line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim()),
    );

  if (parsedRows.length === 0) return null;

  return (
    <div className="my-2.5 overflow-x-auto">
      <table className="mx-auto w-full max-w-[94%] border-collapse border border-black text-[11.5pt] text-black">
        <tbody>
          {parsedRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={cn(
                    'border border-black px-2.5 py-1.5',
                    cIdx === 0 ? 'text-left font-bold whitespace-nowrap' : 'text-center',
                  )}
                >
                  {renderRichMathInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function renderPartInstruction(part: ExamPart): ReactNode {
  // In đậm `a), b), c), d)` trong dòng hướng dẫn PHẦN II giống hệt PDF Toán 2025
  const marker = 'a), b), c), d)';
  if (part.instruction.includes(marker)) {
    const [before, after] = part.instruction.split(marker);
    return (
      <>
        {before}
        <strong className="font-bold">{marker}</strong>
        {after}
      </>
    );
  }
  return part.instruction;
}

const ExamQuestionPaperItem: FC<{
  readonly question: ExamQuestion;
  readonly highlightAnswers: boolean;
}> = ({ question, highlightAnswers }) => {
  const blocks = splitStemIntoBlocks(question.stem);
  const firstBlock = blocks[0];
  const restBlocks = blocks.slice(1);

  const optionColumns =
    question.kind === 'multiple-choice' && question.options
      ? resolveOptionColumns(question.options, question.columnsMode)
      : 4;

  const optionGridClass =
    optionColumns === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : optionColumns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1';

  return (
    <div
      data-testid={`paper-question-${question.kind}-${question.number}`}
      className="lu-exam-question break-inside-avoid space-y-1.5 text-[12.5pt] leading-[1.58] text-black"
    >
      {/* Đoạn đầu nối tiếp ngay sau "Câu N:" in đậm giống hệt đề PDF */}
      {firstBlock && firstBlock.kind === 'paragraph' ? (
        <p className="text-justify">
          <strong className="font-bold">Câu {question.number}:</strong>{' '}
          {renderRichMathInline(firstBlock.lines.join(' '))}
        </p>
      ) : (
        <>
          <p className="text-justify">
            <strong className="font-bold">Câu {question.number}:</strong>
          </p>
          {firstBlock?.kind === 'table' && <MarkdownExamTable lines={firstBlock.lines} />}
          {firstBlock?.kind === 'bullet' && (
            <div className="space-y-0.5 pl-1">
              {firstBlock.lines.map((bLine, idx) => (
                <p key={idx} className="text-justify">
                  {renderRichMathInline(bLine)}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {/* Các đoạn bổ sung (bảng tần số, đoạn tiếp theo, gạch đầu dòng + ...) */}
      {restBlocks.map((block, bIdx) => {
        if (block.kind === 'table') {
          return <MarkdownExamTable key={bIdx} lines={block.lines} />;
        }
        if (block.kind === 'bullet') {
          return (
            <div key={bIdx} className="space-y-0.5 pl-1">
              {block.lines.map((bLine, idx) => (
                <p key={idx} className="text-justify">
                  {renderRichMathInline(bLine)}
                </p>
              ))}
            </div>
          );
        }
        return (
          <p key={bIdx} className="text-justify">
            {renderRichMathInline(block.lines.join(' '))}
          </p>
        );
      })}

      {/* Hình vẽ minh họa đính kèm (hỗ trợ cả DataURL và idb:// từ IndexedDB) */}
      {question.image && (
        <ResolvedExamFigure image={question.image} questionNumber={question.number} />
      )}

      {/* PHẦN I: Phương án A. B. C. D. tự động căn 4 cột / 2 cột / 1 cột */}
      {question.kind === 'multiple-choice' && question.options && question.options.length > 0 && (
        <div
          data-testid={`paper-options-grid-${question.number}`}
          data-columns={optionColumns}
          className={cn('grid gap-x-4 gap-y-1 pt-0.5 pl-3', optionGridClass)}
        >
          {question.options.map((opt) => {
            const isCorrect = highlightAnswers && question.correctOption === opt.label;
            return (
              <div key={opt.label} className="min-w-0 leading-[1.5]">
                <strong
                  className={cn(
                    'font-bold',
                    isCorrect && 'underline decoration-2 underline-offset-2',
                  )}
                >
                  {opt.label}.
                </strong>{' '}
                <span>{renderRichMathInline(opt.content)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* PHẦN II: 4 ý Đúng / Sai a), b), c), d) thụt đầu dòng gọn chuẩn PDF */}
      {question.kind === 'true-false' && question.statements && question.statements.length > 0 && (
        <div className="space-y-1 pt-0.5 pl-5">
          {question.statements.map((st) => (
            <p key={st.label} className="text-justify leading-[1.55]">
              <strong className="font-bold">{st.label})</strong>{' '}
              <span>{renderRichMathInline(st.content)}</span>
              {highlightAnswers && st.isTrue !== null && (
                <span className="ml-2 inline-block rounded border border-black/40 px-1 font-sans text-[9pt] font-bold">
                  {st.isTrue ? 'Đ' : 'S'}
                </span>
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Tờ đề giấy A4 chuẩn định dạng PDF Đề thi Toán 2025:
 * - Bỏ hoàn toàn khối Bộ GD&ĐT, Đề thi chính thức, Họ tên thí sinh, Số báo danh, Mã đề.
 * - CHỈ hiển thị Tên đề kiểm tra ở đầu trang.
 * - Luôn hiển thị giấy trắng mực đen (#FFFFFF / #000000) với font Times New Roman chuẩn in ấn.
 */
export const ExamPaperPreview: FC<ExamPaperPreviewProps> = ({
  structure,
  showEndLine,
  showAnswerKey,
}) => {
  return (
    <div
      data-testid="exam-paper-preview"
      className="lu-exam-paper mx-auto w-full max-w-[794px] rounded-xl border border-[var(--border-hairline)] bg-white px-7 py-8 text-black shadow-[0_14px_40px_-20px_rgba(17,26,24,0.25)] sm:px-12 sm:py-11 print:max-w-none print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none"
      style={{
        fontFamily: "'Times New Roman', 'Crimson Pro', Georgia, Cambria, serif",
      }}
    >
      {/* ĐẦU TRANG: CHỈ ĐỂ TÊN ĐỀ KIỂM TRA (đã bỏ sạch phần Bộ GD&ĐT / Họ tên / SBD / Mã đề) */}
      <header data-testid="exam-paper-header" className="mb-5 text-center">
        <h1 className="text-[16pt] leading-snug font-bold tracking-wide text-black uppercase">
          {structure.title}
        </h1>
      </header>

      {/* NỘI DUNG CÁC PHẦN ĐỀ THI */}
      {structure.parts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center font-sans text-sm text-neutral-500">
          Chưa có câu hỏi nào. Hãy nhập <code className="font-mono">Câu 1: ...</code> ở khung bên
          trái hoặc nhấn nút chèn mẫu câu trên thanh công cụ.
        </div>
      ) : (
        <div className="space-y-4">
          {structure.parts.map((part) => (
            <section key={part.id} className="space-y-2.5">
              {/* Tiêu đề PHẦN chuẩn PDF */}
              <p className="text-justify text-[12.5pt] leading-[1.55] text-black">
                <strong className="font-bold">{part.label}.</strong> {renderPartInstruction(part)}
              </p>

              {/* Danh sách câu hỏi trong phần */}
              <div className="space-y-2.5">
                {part.questions.map((question) => (
                  <ExamQuestionPaperItem
                    key={question.id}
                    question={question}
                    highlightAnswers={showAnswerKey}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* DÒNG KẾT THÚC ĐỀ CHUẨN PDF */}
      {showEndLine && structure.parts.length > 0 && (
        <div className="mt-6 text-center text-[12pt] font-bold tracking-wide text-black">
          ---------------- HẾT ----------------
        </div>
      )}

      {/* BẢNG ĐÁP ÁN CUỐI ĐỀ (TÙY CHỌN BẬT/TẮT) */}
      {showAnswerKey && structure.parts.length > 0 && (
        <section
          data-testid="exam-answer-key-sheet"
          className="mt-8 border-t-2 border-dashed border-black/35 pt-6 print:break-before-page print:border-t-0 print:pt-0"
        >
          <h2 className="mb-3 text-center text-[13.5pt] font-bold tracking-wide text-black uppercase">
            BẢNG ĐÁP ÁN — {structure.title}
          </h2>

          <div className="space-y-3">
            {structure.parts.map((part) => (
              <div key={`ans-${part.id}`} className="space-y-1.5">
                <p className="text-[11.5pt] font-bold text-black">{part.label}</p>
                <table className="w-full border-collapse border border-black text-[11pt] text-black">
                  <tbody>
                    {part.kind === 'multiple-choice' ? (
                      <>
                        <tr>
                          <th className="w-20 border border-black bg-neutral-100 px-2 py-1 text-left font-bold">
                            Câu
                          </th>
                          {part.questions.map((q) => (
                            <th
                              key={q.id}
                              className="border border-black bg-neutral-100 px-2 py-1 text-center font-bold"
                            >
                              {q.number}
                            </th>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1 font-bold">Đáp án</td>
                          {part.questions.map((q) => (
                            <td
                              key={q.id}
                              className="border border-black px-2 py-1 text-center font-bold"
                            >
                              {q.correctOption ?? '—'}
                            </td>
                          ))}
                        </tr>
                      </>
                    ) : (
                      part.questions.map((q) => (
                        <tr key={q.id}>
                          <td className="w-24 border border-black bg-neutral-50 px-2.5 py-1 font-bold">
                            Câu {q.number}
                          </td>
                          <td className="border border-black px-2.5 py-1">
                            {q.kind === 'true-false' ? (
                              <span className="font-semibold">
                                {(q.statements ?? [])
                                  .map(
                                    (s) =>
                                      `${s.label}) ${s.isTrue === true ? 'Đúng' : s.isTrue === false ? 'Sai' : '—'}`,
                                  )
                                  .join('  ·  ')}
                              </span>
                            ) : (
                              <span>{renderRichMathInline(q.shortAnswer || '—')}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ExamPaperPreview;
