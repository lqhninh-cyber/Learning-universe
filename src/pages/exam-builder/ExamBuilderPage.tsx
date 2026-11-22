import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  FilePenLine,
  FilePlus2,
  LayoutGrid,
  ListChecks,
  Printer,
  Shuffle,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ExamPaperPreview } from '@/components/exam-builder/ExamPaperPreview';
import { ExamVisualEditor } from '@/components/exam-builder/ExamVisualEditor';
import { MathToolbar } from '@/components/exam-builder/MathToolbar';
import {
  exportExamToLatex,
  parseExamMarkupToStructure,
  selectActiveExamBucket,
  selectActiveExamDocument,
  serializePartsToExamMarkup,
  shuffleExamParts,
  useExamBuilderStore,
  type ExamPart,
  type MathSnippetItem,
} from '@/features/exam-builder';
import { cn } from '@/shared/lib/cn';

type EditorTabMode = 'smart-text' | 'visual-cards';
type MobilePaneMode = 'editor' | 'preview';

export function ExamBuilderPage() {
  const bucket = useExamBuilderStore(selectActiveExamBucket);
  const activeDoc = useExamBuilderStore(selectActiveExamDocument);
  const selectExam = useExamBuilderStore((state) => state.selectExam);
  const createNewExam = useExamBuilderStore((state) => state.createNewExam);
  const duplicateActiveExam = useExamBuilderStore((state) => state.duplicateActiveExam);
  const deleteExam = useExamBuilderStore((state) => state.deleteExam);
  const updateActiveExam = useExamBuilderStore((state) => state.updateActiveExam);
  const attachImageToActiveExam = useExamBuilderStore((state) => state.attachImageToActiveExam);

  const [editorTab, setEditorTab] = useState<EditorTabMode>('smart-text');
  const [mobilePane, setMobilePane] = useState<MobilePaneMode>('editor');
  const [copiedLatex, setCopiedLatex] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parsedStructure = useMemo(
    () =>
      parseExamMarkupToStructure({
        title: activeDoc.title,
        rawMarkup: activeDoc.rawMarkup,
        autoRecognizeMath: activeDoc.autoRecognizeMath,
        images: activeDoc.images,
      }),
    [activeDoc.autoRecognizeMath, activeDoc.images, activeDoc.rawMarkup, activeDoc.title],
  );

  const handleInsertSnippet = (snippet: MathSnippetItem) => {
    const el = textareaRef.current;
    const current = activeDoc.rawMarkup;
    const isFocused = typeof document !== 'undefined' && document.activeElement === el;
    // Với mẫu cấu trúc câu/phần: nếu người dùng chưa đặt con trỏ trong khung soạn thì tự nối vào cuối đề (không chèn đè lên trước PHẦN I)
    const start =
      snippet.category === 'structure' && !isFocused
        ? current.length
        : (el?.selectionStart ?? current.length);
    const end =
      snippet.category === 'structure' && !isFocused
        ? current.length
        : (el?.selectionEnd ?? current.length);
    const selected = current.slice(start, end);
    const inner = selected || snippet.placeholder || '';
    const rawInserted = `${snippet.insertBefore}${inner}${snippet.insertAfter ?? ''}`;

    const beforeCursor = current.slice(0, start);
    const dollarCount = (beforeCursor.match(/(?<!\\)\$/g) ?? []).length;
    const insideMath = dollarCount % 2 === 1;
    const chunk = snippet.wrapMathIfOutside && !insideMath ? `$${rawInserted}$` : rawInserted;

    const nextText = `${current.slice(0, start)}${chunk}${current.slice(end)}`;
    updateActiveExam({ rawMarkup: nextText });

    if (el) {
      const nextCursorPos = start + chunk.length;
      window.requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(nextCursorPos, nextCursorPos);
      });
    }
  };

  const handleUploadImageForText = (dataUrl: string, fileName: string) => {
    const caption = fileName.replace(/\.[^.]+$/, '');
    const attached = attachImageToActiveExam({ dataUrl, caption, widthPercent: 52 });
    const tag = `\n[HÌNH:${attached.id}]\n`;
    const el = textareaRef.current;
    const current = activeDoc.rawMarkup;
    const pos = el?.selectionStart ?? current.length;
    updateActiveExam({
      rawMarkup: `${current.slice(0, pos)}${tag}${current.slice(pos)}`,
    });
  };

  const handleVisualPartsChange = (nextParts: readonly ExamPart[]) => {
    const serialized = serializePartsToExamMarkup(nextParts);
    updateActiveExam({ rawMarkup: serialized });
  };

  const handleRenumberAndFormat = () => {
    const cleanMarkup = serializePartsToExamMarkup(parsedStructure.parts);
    updateActiveExam({ rawMarkup: cleanMarkup });
  };

  const handleShuffleExam = () => {
    const shuffled = shuffleExamParts(parsedStructure.parts);
    updateActiveExam({ rawMarkup: serializePartsToExamMarkup(shuffled) });
  };

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const handleCopyLatex = async () => {
    const tex = exportExamToLatex(parsedStructure, {
      showEndLine: activeDoc.showEndLine,
      showAnswerKey: activeDoc.showAnswerKey,
    });
    try {
      await navigator.clipboard.writeText(tex);
      setCopiedLatex(true);
      window.setTimeout(() => setCopiedLatex(false), 1800);
    } catch {
      // Dự phòng nếu môi trường không hỗ trợ clipboard API
    }
  };

  const handleDownloadLatex = () => {
    const tex = exportExamToLatex(parsedStructure, {
      showEndLine: activeDoc.showEndLine,
      showAnswerKey: activeDoc.showAnswerKey,
    });
    const blob = new Blob([tex], { type: 'application/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDoc.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'de-kiem-tra'}.tex`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="exam-builder-page"
      className="min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)] print:min-h-0 print:bg-white"
    >
      {/* THANH CÔNG CỤ STUDIO SOẠN ĐỀ (Ẩn hoàn toàn khi in PDF) */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/80 px-4 py-3.5 sm:px-6 print:hidden">
        <div className="mx-auto max-w-[1440px] space-y-3">
          {/* Hàng 1: Danh sách đề của tài khoản + Tạo mới / Mẫu + Hành động xuất bản */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-os)] text-white">
                <FilePenLine className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h1 className="font-serif text-lg leading-tight font-semibold text-[var(--text-main)]">
                  Xưởng Soạn Đề Toán
                </h1>
                <p className="font-mono text-[10.5px] text-[var(--text-muted)]">
                  Định dạng chuẩn 3 phần (A–D, Đúng/Sai, Trả lời ngắn) · Chỉ in Tên đề kiểm tra
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <select
                aria-label="Chọn đề kiểm tra đã lưu"
                data-testid="exam-selector"
                value={activeDoc.id}
                onChange={(e) => selectExam(e.target.value)}
                className="h-8 max-w-[200px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-xs font-medium text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
              >
                {bucket.exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title || 'Đề chưa đặt tên'}
                  </option>
                ))}
              </select>

              <button
                type="button"
                data-testid="exam-new-blank"
                onClick={() => createNewExam('blank')}
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-os)]/50 hover:text-[var(--text-main)]"
              >
                <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đề mới</span>
              </button>

              <button
                type="button"
                onClick={() => createNewExam('algebra')}
                className="hidden h-8 cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-os)]/50 hover:text-[var(--text-main)] sm:inline-flex"
              >
                <span>Mẫu CTĐS</span>
              </button>

              <button
                type="button"
                title="Nhân bản đề hiện tại"
                onClick={() => duplicateActiveExam()}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {bucket.exams.length > 1 && (
                <button
                  type="button"
                  title="Xóa đề hiện tại"
                  aria-label="Xóa đề hiện tại"
                  onClick={() => deleteExam(activeDoc.id)}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-muted)] hover:text-[#8F3D35]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}

              <div className="mx-1 hidden h-5 w-px bg-[var(--border-hairline)] sm:block" />

              <button
                type="button"
                data-testid="exam-shuffle-btn"
                onClick={handleShuffleExam}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-os)]/50 hover:text-[var(--text-main)]"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trộn đề</span>
              </button>

              <button
                type="button"
                data-testid="exam-toggle-answers"
                onClick={() => updateActiveExam({ showAnswerKey: !activeDoc.showAnswerKey })}
                aria-pressed={activeDoc.showAnswerKey}
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                  activeDoc.showAnswerKey
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đáp án</span>
              </button>

              <button
                type="button"
                data-testid="exam-copy-latex"
                onClick={() => void handleCopyLatex()}
                className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] md:inline-flex"
              >
                {copiedLatex ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#1B5E4A]" aria-hidden="true" />
                    <span>Đã chép .tex</span>
                  </>
                ) : (
                  <>
                    <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Chép LaTeX</span>
                  </>
                )}
              </button>

              <button
                type="button"
                title="Tải file .tex (LaTeX)"
                aria-label="Tải mã LaTeX (.tex)"
                onClick={handleDownloadLatex}
                className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] md:inline-flex"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                data-testid="exam-print-btn"
                onClick={handlePrintPdf}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[#17332C] px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#21463C] active:scale-[0.98]"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                <span>In / Lưu PDF</span>
              </button>
            </div>
          </div>

          {/* Hàng 2: Ô nhập Tên đề kiểm tra (chỉ in dòng này ở đầu trang đề) + Chuyển chế độ */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5">
              <span className="shrink-0 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Tên đề:
              </span>
              <input
                type="text"
                data-testid="exam-title-input"
                value={activeDoc.title}
                onChange={(e) => updateActiveExam({ title: e.target.value })}
                placeholder="VD: ĐỀ KIỂM TRA GIỮA KỲ I — TOÁN 12"
                aria-label="Tên đề kiểm tra"
                className="min-w-0 flex-1 bg-transparent font-serif text-sm font-semibold text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chuyển đổi Soạn nhanh ↔ Thẻ trực quan */}
              <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-0.5">
                <button
                  type="button"
                  data-testid="editor-tab-smart-text"
                  onClick={() => setEditorTab('smart-text')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                    editorTab === 'smart-text'
                      ? 'bg-[var(--accent-os)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Soạn nhanh</span>
                </button>
                <button
                  type="button"
                  data-testid="editor-tab-visual-cards"
                  onClick={() => setEditorTab('visual-cards')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                    editorTab === 'visual-cards'
                      ? 'bg-[var(--accent-os)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Thẻ trực quan</span>
                </button>
              </div>

              {/* Công tắc Tự nhận diện ký hiệu toán học */}
              <button
                type="button"
                data-testid="toggle-auto-math"
                onClick={() =>
                  updateActiveExam({ autoRecognizeMath: !activeDoc.autoRecognizeMath })
                }
                aria-pressed={activeDoc.autoRecognizeMath}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10.5px] font-semibold transition-colors',
                  activeDoc.autoRecognizeMath
                    ? 'border-[var(--accent-heritage)]/50 bg-[#FDF8F3] text-[#8C5828] dark:bg-[#1D1813] dark:text-[#D4AF6A]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-muted)]',
                )}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tự nhận diện Toán: {activeDoc.autoRecognizeMath ? 'BẬT' : 'TẮT'}</span>
              </button>

              {/* Chuyển Tab Soạn / Xem trước trên màn hình nhỏ (< xl) */}
              <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-0.5 xl:hidden">
                <button
                  type="button"
                  onClick={() => setMobilePane('editor')}
                  className={cn(
                    'cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold',
                    mobilePane === 'editor'
                      ? 'bg-[var(--accent-os)] text-white'
                      : 'text-[var(--text-secondary)]',
                  )}
                >
                  Soạn
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePane('preview')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold',
                    mobilePane === 'preview'
                      ? 'bg-[var(--accent-os)] text-white'
                      : 'text-[var(--text-secondary)]',
                  )}
                >
                  <Eye className="h-3 w-3" aria-hidden="true" />
                  <span>Tờ đề A4</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KHÔNG GIAN CHIA ĐÔI: KHUNG SOẠN BÊN TRÁI ↔ TỜ ĐỀ A4 XEM TRƯỚC TRỰC TIẾP BÊN PHẢI */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 xl:grid-cols-12 print:block print:max-w-none">
        {/* CỘT TRÁI: TRÌNH SOẠN ĐỀ (Ẩn hoàn toàn khi in) */}
        <div
          className={cn(
            'border-r border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 sm:p-5 xl:col-span-6 print:hidden',
            mobilePane === 'preview' && 'hidden xl:block',
          )}
        >
          {editorTab === 'smart-text' ? (
            <div className="flex h-full flex-col gap-3">
              <MathToolbar
                onInsertSnippet={handleInsertSnippet}
                onUploadImage={handleUploadImageForText}
              />

              <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                <span className="font-mono">
                  Gõ <strong className="text-[var(--text-main)]">Câu 1:</strong>,{' '}
                  <strong className="text-[var(--text-main)]">A. B. C. D.</strong> hoặc{' '}
                  <strong className="text-[var(--text-main)]">a) b) c) d)</strong> — tự động biên tờ
                  đề bên phải
                </span>
                <button
                  type="button"
                  onClick={handleRenumberAndFormat}
                  className="shrink-0 cursor-pointer font-mono text-[10.5px] font-semibold text-[var(--accent-os)] hover:underline"
                >
                  Đánh lại số câu
                </button>
              </div>

              <textarea
                ref={textareaRef}
                data-testid="exam-markup-textarea"
                value={activeDoc.rawMarkup}
                onChange={(e) => updateActiveExam({ rawMarkup: e.target.value })}
                spellCheck={false}
                aria-label="Nội dung soạn đề thông minh"
                placeholder="PHẦN I. Thí sinh trả lời từ câu 1 đến câu 12...&#10;&#10;Câu 1: Cho hàm số f(x) = x^2 - 4x + 3..."
                className="os-thin-scrollbar min-h-[540px] w-full flex-1 resize-y rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 font-mono text-[13px] leading-relaxed text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
              />
            </div>
          ) : (
            <ExamVisualEditor
              parts={parsedStructure.parts}
              onPartsChange={handleVisualPartsChange}
              onAttachImage={(dataUrl, fileName) =>
                attachImageToActiveExam({
                  dataUrl,
                  caption: fileName.replace(/\.[^.]+$/, ''),
                  widthPercent: 52,
                })
              }
            />
          )}
        </div>

        {/* CỘT PHẢI: TỜ ĐỀ GIẤY A4 XEM TRƯỚC TRỰC TIẾP (In trọn 100% khi gọi window.print) */}
        <div
          className={cn(
            'bg-[var(--bg-shell)] p-4 sm:p-6 xl:col-span-6 print:bg-white print:p-0',
            mobilePane === 'editor' && 'hidden xl:block print:block',
          )}
        >
          <div className="mx-auto mb-3 flex max-w-[794px] flex-wrap items-center justify-between gap-2 print:hidden">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Xem trước bản in A4 · {parsedStructure.parts.length} phần ·{' '}
              {parsedStructure.totalQuestions} câu hỏi
            </span>

            <label className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={activeDoc.showEndLine}
                onChange={(e) => updateActiveExam({ showEndLine: e.target.checked })}
                className="accent-[var(--accent-os)]"
              />
              <span>Hiện dòng HẾT</span>
            </label>
          </div>

          <ExamPaperPreview
            structure={parsedStructure}
            showEndLine={activeDoc.showEndLine}
            showAnswerKey={activeDoc.showAnswerKey}
          />
        </div>
      </div>
    </div>
  );
}

export default ExamBuilderPage;
