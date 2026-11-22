import { ArrowDown, ArrowUp, Check, Copy, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { type ChangeEvent, type FC, useRef, useState } from 'react';
import {
  getDefaultPartInstruction,
  getDefaultPartLabel,
  type ExamImageAttachment,
  type ExamPart,
  type ExamPartKind,
  type ExamQuestion,
  type MathSnippetItem,
  type OptionColumnsMode,
  type OptionLetter,
} from '@/features/exam-builder';
import { cn } from '@/shared/lib/cn';
import { MathToolbar } from './MathToolbar';

export interface ExamVisualEditorProps {
  readonly parts: readonly ExamPart[];
  readonly onPartsChange: (nextParts: readonly ExamPart[]) => void;
  readonly onAttachImage: (dataUrl: string, fileName: string) => ExamImageAttachment;
}

type ActiveFieldTarget =
  | { readonly type: 'stem'; readonly partIdx: number; readonly qIdx: number }
  | {
      readonly type: 'option';
      readonly partIdx: number;
      readonly qIdx: number;
      readonly optIdx: number;
    }
  | {
      readonly type: 'statement';
      readonly partIdx: number;
      readonly qIdx: number;
      readonly stIdx: number;
    }
  | { readonly type: 'shortAnswer'; readonly partIdx: number; readonly qIdx: number };

function createEmptyQuestion(kind: ExamPartKind, nextNumber: number): ExamQuestion {
  const id = `q-${kind}-${Date.now().toString(36)}-${nextNumber}`;
  if (kind === 'multiple-choice') {
    return {
      id,
      kind,
      number: nextNumber,
      stem: 'Nhập nội dung câu hỏi trắc nghiệm...',
      options: [
        { label: 'A', content: '' },
        { label: 'B', content: '' },
        { label: 'C', content: '' },
        { label: 'D', content: '' },
      ],
      correctOption: 'A',
      columnsMode: 'auto',
    };
  }
  if (kind === 'true-false') {
    return {
      id,
      kind,
      number: nextNumber,
      stem: 'Cho hàm số $f(x) = $...',
      statements: [
        { label: 'a', content: '', isTrue: true },
        { label: 'b', content: '', isTrue: false },
        { label: 'c', content: '', isTrue: true },
        { label: 'd', content: '', isTrue: false },
      ],
    };
  }
  return {
    id,
    kind,
    number: nextNumber,
    stem: kind === 'short-answer' ? 'Tính giá trị biểu thức...' : 'Chứng minh rằng...',
    shortAnswer: '',
  };
}

function renumberPart(part: ExamPart): ExamPart {
  const questions = part.questions.map((q, idx) => ({ ...q, number: idx + 1 }));
  return {
    ...part,
    instruction: getDefaultPartInstruction(part.kind, questions.length),
    questions,
  };
}

export const ExamVisualEditor: FC<ExamVisualEditorProps> = ({
  parts,
  onPartsChange,
  onAttachImage,
}) => {
  const [activeTarget, setActiveTarget] = useState<ActiveFieldTarget | null>(null);
  const activeElementRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [pendingImageTarget, setPendingImageTarget] = useState<{
    readonly partIdx: number;
    readonly qIdx: number;
  } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const updateQuestion = (
    partIdx: number,
    qIdx: number,
    updater: (q: ExamQuestion) => ExamQuestion,
  ) => {
    const nextParts = parts.map((part, pIdx) => {
      if (pIdx !== partIdx) return part;
      return {
        ...part,
        questions: part.questions.map((q, idx) => (idx === qIdx ? updater(q) : q)),
      };
    });
    onPartsChange(nextParts);
  };

  const handleAddQuestion = (kind: ExamPartKind) => {
    const existingPartIndex = parts.findIndex((p) => p.kind === kind);
    if (existingPartIndex >= 0) {
      const nextParts = parts.map((part, idx) => {
        if (idx !== existingPartIndex) return part;
        const newQ = createEmptyQuestion(kind, part.questions.length + 1);
        return renumberPart({ ...part, questions: [...part.questions, newQ] });
      });
      onPartsChange(nextParts);
      return;
    }

    const newQ = createEmptyQuestion(kind, 1);
    const newPart: ExamPart = {
      id: `part-${parts.length + 1}-${kind}`,
      kind,
      label: getDefaultPartLabel(kind, parts.length),
      instruction: getDefaultPartInstruction(kind, 1),
      questions: [newQ],
    };
    onPartsChange([...parts, newPart]);
  };

  const handleMoveQuestion = (partIdx: number, qIdx: number, direction: -1 | 1) => {
    const part = parts[partIdx];
    if (!part) return;
    const targetIdx = qIdx + direction;
    if (targetIdx < 0 || targetIdx >= part.questions.length) return;

    const list = [...part.questions];
    const tmp = list[qIdx]!;
    list[qIdx] = list[targetIdx]!;
    list[targetIdx] = tmp;

    const nextParts = parts.map((p, idx) =>
      idx === partIdx ? renumberPart({ ...p, questions: list }) : p,
    );
    onPartsChange(nextParts);
  };

  const handleDuplicateQuestion = (partIdx: number, qIdx: number) => {
    const part = parts[partIdx];
    const original = part?.questions[qIdx];
    if (!part || !original) return;
    const clone: ExamQuestion = {
      ...original,
      id: `${original.id}-copy-${Date.now().toString(36)}`,
    };
    const list = [...part.questions];
    list.splice(qIdx + 1, 0, clone);

    const nextParts = parts.map((p, idx) =>
      idx === partIdx ? renumberPart({ ...p, questions: list }) : p,
    );
    onPartsChange(nextParts);
  };

  const handleDeleteQuestion = (partIdx: number, qIdx: number) => {
    const nextParts = parts
      .map((part, idx) => {
        if (idx !== partIdx) return part;
        const remaining = part.questions.filter((_, i) => i !== qIdx);
        return remaining.length > 0 ? renumberPart({ ...part, questions: remaining }) : null;
      })
      .filter((p): p is ExamPart => p !== null);
    onPartsChange(nextParts);
  };

  const handleInsertMathIntoFocused = (snippet: MathSnippetItem) => {
    if (!activeTarget) return;
    const el = activeElementRef.current;
    const applyInsert = (currentValue: string): string => {
      const start = el?.selectionStart ?? currentValue.length;
      const end = el?.selectionEnd ?? currentValue.length;
      const selected = currentValue.slice(start, end);
      const inner = selected || snippet.placeholder || '';
      const rawInserted = `${snippet.insertBefore}${inner}${snippet.insertAfter ?? ''}`;

      // Kiểm tra con trỏ có đang ở trong cặp `$ ... $` không
      const beforeCursor = currentValue.slice(0, start);
      const dollarCount = (beforeCursor.match(/(?<!\\)\$/g) ?? []).length;
      const insideMath = dollarCount % 2 === 1;
      const finalChunk =
        snippet.wrapMathIfOutside && !insideMath ? `$${rawInserted}$` : rawInserted;

      return `${currentValue.slice(0, start)}${finalChunk}${currentValue.slice(end)}`;
    };

    const { partIdx, qIdx } = activeTarget;
    if (activeTarget.type === 'stem') {
      updateQuestion(partIdx, qIdx, (q) => ({ ...q, stem: applyInsert(q.stem) }));
    } else if (activeTarget.type === 'option') {
      updateQuestion(partIdx, qIdx, (q) => ({
        ...q,
        options: (q.options ?? []).map((opt, idx) =>
          idx === activeTarget.optIdx ? { ...opt, content: applyInsert(opt.content) } : opt,
        ),
      }));
    } else if (activeTarget.type === 'statement') {
      updateQuestion(partIdx, qIdx, (q) => ({
        ...q,
        statements: (q.statements ?? []).map((st, idx) =>
          idx === activeTarget.stIdx ? { ...st, content: applyInsert(st.content) } : st,
        ),
      }));
    } else if (activeTarget.type === 'shortAnswer') {
      updateQuestion(partIdx, qIdx, (q) => ({
        ...q,
        shortAnswer: applyInsert(q.shortAnswer ?? ''),
      }));
    }
  };

  const handleQuestionImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingImageTarget) return;
    const target = pendingImageTarget;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const attached = onAttachImage(reader.result, file.name);
        updateQuestion(target.partIdx, target.qIdx, (q) => ({ ...q, image: attached }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
    setPendingImageTarget(null);
  };

  return (
    <div data-testid="exam-visual-editor" className="space-y-4">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuestionImageFileChange}
        className="hidden"
        aria-label="Tải hình vẽ cho câu hỏi"
      />

      {/* Thanh thêm câu nhanh theo dạng */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="visual-add-mc"
          onClick={() => handleAddQuestion('multiple-choice')}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Trắc nghiệm (A–D)</span>
        </button>
        <button
          type="button"
          data-testid="visual-add-tf"
          onClick={() => handleAddQuestion('true-false')}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]/50"
        >
          <Plus className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
          <span>Đúng / Sai (a–d)</span>
        </button>
        <button
          type="button"
          data-testid="visual-add-short"
          onClick={() => handleAddQuestion('short-answer')}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]/50"
        >
          <Plus className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
          <span>Trả lời ngắn</span>
        </button>
        <button
          type="button"
          data-testid="visual-add-essay"
          onClick={() => handleAddQuestion('essay')}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]/50"
        >
          <Plus className="h-3.5 w-3.5 text-[var(--accent-heritage)]" aria-hidden="true" />
          <span>Tự luận</span>
        </button>
      </div>

      {/* Thanh ký hiệu toán học dùng chung cho ô đang nhập */}
      <MathToolbar compact onInsertSnippet={handleInsertMathIntoFocused} />

      {/* Danh sách các Phần và Thẻ câu hỏi */}
      {parts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
          Chưa có câu hỏi nào. Hãy bấm một trong các nút thêm câu ở trên để bắt đầu soạn đề.
        </div>
      ) : (
        <div className="space-y-5">
          {parts.map((part, partIdx) => (
            <div key={part.id} className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-[var(--accent-os)] uppercase">
                  {part.label} · {part.questions.length} câu
                </span>
              </div>

              {part.questions.map((q, qIdx) => (
                <div
                  key={`${part.id}-${q.number}-${qIdx}`}
                  data-testid={`visual-card-${part.kind}-${q.number}`}
                  className="space-y-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 shadow-2xs"
                >
                  {/* Header thẻ câu hỏi */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--text-main)]">
                      Câu {q.number}
                    </span>

                    <div className="flex items-center gap-1">
                      {q.kind === 'multiple-choice' && (
                        <select
                          aria-label={`Kiểu dàn cột Câu ${q.number}`}
                          value={String(q.columnsMode ?? 'auto')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const nextMode: OptionColumnsMode =
                              raw === 'auto' ? 'auto' : (Number(raw) as 1 | 2 | 4);
                            updateQuestion(partIdx, qIdx, (cur) => ({
                              ...cur,
                              columnsMode: nextMode,
                            }));
                          }}
                          className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]"
                        >
                          <option value="auto">Cột: Tự động</option>
                          <option value="4">4 cột</option>
                          <option value="2">2 cột</option>
                          <option value="1">1 cột</option>
                        </select>
                      )}

                      <button
                        type="button"
                        title="Đính kèm ảnh hình vẽ"
                        aria-label={`Đính kèm hình vẽ Câu ${q.number}`}
                        onClick={() => {
                          setPendingImageTarget({ partIdx, qIdx });
                          imageInputRef.current?.click();
                        }}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-os)]"
                      >
                        <ImagePlus className="h-3 w-3" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        title="Đưa lên"
                        aria-label={`Đưa Câu ${q.number} lên`}
                        disabled={qIdx === 0}
                        onClick={() => handleMoveQuestion(partIdx, qIdx, -1)}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-35"
                      >
                        <ArrowUp className="h-3 w-3" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        title="Đưa xuống"
                        aria-label={`Đưa Câu ${q.number} xuống`}
                        disabled={qIdx === part.questions.length - 1}
                        onClick={() => handleMoveQuestion(partIdx, qIdx, 1)}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-35"
                      >
                        <ArrowDown className="h-3 w-3" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        title="Nhân bản câu"
                        aria-label={`Nhân bản Câu ${q.number}`}
                        onClick={() => handleDuplicateQuestion(partIdx, qIdx)}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                      >
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        title="Xóa câu"
                        aria-label={`Xóa Câu ${q.number}`}
                        onClick={() => handleDeleteQuestion(partIdx, qIdx)}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[#8F3D35]"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Thân câu hỏi */}
                  <textarea
                    rows={2}
                    value={q.stem}
                    aria-label={`Nội dung Câu ${q.number}`}
                    onFocus={(e) => {
                      activeElementRef.current = e.currentTarget;
                      setActiveTarget({ type: 'stem', partIdx, qIdx });
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateQuestion(partIdx, qIdx, (cur) => ({ ...cur, stem: val }));
                    }}
                    className="w-full resize-y rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-xs leading-relaxed text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                  />

                  {/* Ảnh đính kèm (nếu có) */}
                  {q.image && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs">
                      <span className="truncate font-mono text-[10.5px] text-[var(--text-secondary)]">
                        Hình đính kèm ({q.image.widthPercent}%)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(partIdx, qIdx, (cur) => ({ ...cur, image: null }))
                        }
                        className="inline-flex cursor-pointer items-center gap-1 text-[10.5px] text-[#8F3D35] hover:underline"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                        <span>Gỡ ảnh</span>
                      </button>
                    </div>
                  )}

                  {/* PHẦN I: 4 ô phương án A/B/C/D */}
                  {q.kind === 'multiple-choice' && q.options && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOption === opt.label;
                        return (
                          <div key={opt.label} className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Chọn làm đáp án đúng"
                              onClick={() =>
                                updateQuestion(partIdx, qIdx, (cur) => ({
                                  ...cur,
                                  correctOption: opt.label as OptionLetter,
                                }))
                              }
                              className={cn(
                                'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border font-mono text-xs font-bold transition-colors',
                                isCorrect
                                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-os)]/50',
                              )}
                            >
                              {isCorrect ? <Check className="h-3.5 w-3.5" /> : opt.label}
                            </button>
                            <input
                              type="text"
                              value={opt.content}
                              aria-label={`Phương án ${opt.label} Câu ${q.number}`}
                              onFocus={(e) => {
                                activeElementRef.current = e.currentTarget;
                                setActiveTarget({ type: 'option', partIdx, qIdx, optIdx });
                              }}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateQuestion(partIdx, qIdx, (cur) => ({
                                  ...cur,
                                  options: (cur.options ?? []).map((o, i) =>
                                    i === optIdx ? { ...o, content: val } : o,
                                  ),
                                }));
                              }}
                              placeholder={`Phương án ${opt.label}...`}
                              className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* PHẦN II: 4 ý Đúng / Sai a), b), c), d) */}
                  {q.kind === 'true-false' && q.statements && (
                    <div className="space-y-1.5">
                      {q.statements.map((st, stIdx) => (
                        <div key={st.label} className="flex items-center gap-1.5">
                          <span className="w-5 shrink-0 font-mono text-xs font-bold text-[var(--text-secondary)]">
                            {st.label})
                          </span>
                          <input
                            type="text"
                            value={st.content}
                            aria-label={`Mệnh đề ${st.label} Câu ${q.number}`}
                            onFocus={(e) => {
                              activeElementRef.current = e.currentTarget;
                              setActiveTarget({ type: 'statement', partIdx, qIdx, stIdx });
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateQuestion(partIdx, qIdx, (cur) => ({
                                ...cur,
                                statements: (cur.statements ?? []).map((s, i) =>
                                  i === stIdx ? { ...s, content: val } : s,
                                ),
                              }));
                            }}
                            placeholder={`Nội dung mệnh đề ${st.label})...`}
                            className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(partIdx, qIdx, (cur) => ({
                                ...cur,
                                statements: (cur.statements ?? []).map((s, i) =>
                                  i === stIdx
                                    ? { ...s, isTrue: s.isTrue === true ? false : true }
                                    : s,
                                ),
                              }))
                            }
                            className={cn(
                              'shrink-0 cursor-pointer rounded-md border px-2 py-1 font-mono text-[10px] font-bold',
                              st.isTrue === true
                                ? 'border-[#1B5E4A] bg-[#F2F9F6] text-[#1B5E4A] dark:bg-[#111F1A] dark:text-[#52B394]'
                                : 'border-[#8F3D35]/40 bg-[#FBF4F3] text-[#8F3D35] dark:bg-[#211514] dark:text-[#DF7B70]',
                            )}
                          >
                            {st.isTrue === true ? 'Đúng' : 'Sai'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PHẦN III / IV: Đáp án ngắn hoặc gợi ý chấm */}
                  {(q.kind === 'short-answer' || q.kind === 'essay') && (
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                        {q.kind === 'short-answer' ? 'Đáp án:' : 'Gợi ý:'}
                      </span>
                      <input
                        type="text"
                        value={q.shortAnswer ?? ''}
                        aria-label={`Đáp án Câu ${q.number}`}
                        onFocus={(e) => {
                          activeElementRef.current = e.currentTarget;
                          setActiveTarget({ type: 'shortAnswer', partIdx, qIdx });
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateQuestion(partIdx, qIdx, (cur) => ({ ...cur, shortAnswer: val }));
                        }}
                        placeholder={
                          q.kind === 'short-answer' ? 'VD: 0,85 hoặc 1008' : 'Gợi ý chấm tự luận...'
                        }
                        className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamVisualEditor;
