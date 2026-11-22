import { FileText, ImageUp, Lock, Trash2, Unlock, X } from 'lucide-react';
import { type ChangeEvent, type FC, useRef } from 'react';
import type { InkWorksheetBackground, WorksheetFitMode } from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface WorksheetBackgroundPopoverProps {
  readonly background: InkWorksheetBackground | null | undefined;
  readonly activeExamTitle: string | null;
  readonly onUploadImages: (files: FileList) => void;
  readonly onImportActiveExam: () => void;
  readonly onUpdateBackground: (patch: Partial<InkWorksheetBackground>) => void;
  readonly onRemoveBackground: () => void;
  readonly onClose: () => void;
}

const FIT_OPTIONS: readonly {
  readonly value: WorksheetFitMode;
  readonly label: string;
  readonly hint: string;
}[] = [
  { value: 'top-half', label: 'Nửa trên trang', hint: 'Chừa nửa dưới giải bài' },
  { value: 'contain', label: 'Vừa khít trang', hint: 'Hiển thị trọn phiếu bài tập' },
  { value: 'full-width', label: 'Khít chiều rộng', hint: 'Phóng rộng tối đa đề bài' },
];

export const WorksheetBackgroundPopover: FC<WorksheetBackgroundPopoverProps> = ({
  background,
  activeExamTitle,
  onUploadImages,
  onImportActiveExam,
  onUpdateBackground,
  onRemoveBackground,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadImages(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div
      data-testid="worksheet-bg-popover"
      className="w-[330px] max-w-[92vw] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 shadow-2xl"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
        aria-label="Chọn ảnh phiếu bài tập hoặc trang đề thi"
      />

      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
          <FileText className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <span>Phiếu bài tập / Đề nền khóa</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp phiếu bài tập nền"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Gắn ảnh chụp đề thi hoặc nạp đề từ <strong>Xưởng Soạn Đề</strong> làm lớp nền cố định để
        dùng bút viết lời giải trực tiếp mà không sợ dịch chuyển đề.
      </p>

      {/* Hai nguồn nạp nhanh */}
      <div className="mb-3 space-y-1.5">
        <button
          type="button"
          data-testid="worksheet-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--accent-os)]/40 bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--accent-os)] transition-colors hover:bg-[var(--accent-os)]/10"
        >
          <ImageUp className="h-4 w-4" aria-hidden="true" />
          <span>Chọn ảnh phiếu bài tập (1 hoặc nhiều trang)</span>
        </button>

        {activeExamTitle && (
          <button
            type="button"
            data-testid="worksheet-import-exam-btn"
            onClick={onImportActiveExam}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]"
          >
            <FileText
              className="h-3.5 w-3.5 text-[#8C5828] dark:text-[#D4AF6A]"
              aria-hidden="true"
            />
            <span className="truncate">Nạp đề: {activeExamTitle}</span>
          </button>
        )}
      </div>

      {/* Điều khiển nền phiếu đang gắn */}
      {background ? (
        <div className="space-y-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/70 p-2.5 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <span
              className="truncate font-semibold text-[var(--text-main)]"
              title={background.title}
            >
              {background.title}
            </span>
            <button
              type="button"
              data-testid="worksheet-lock-toggle"
              onClick={() => onUpdateBackground({ locked: !background.locked })}
              title={
                background.locked
                  ? 'Đang khóa nền (xóa sạch nháp trang vẫn giữ đề)'
                  : 'Đang mở khóa nền'
              }
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-semibold',
                background.locked
                  ? 'border-[#1B5E4A]/40 bg-[#EDF7F3] text-[#1B5E4A] dark:bg-[#13261F] dark:text-[#52B394]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-muted)]',
              )}
            >
              {background.locked ? (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Đã khóa</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" />
                  <span>Mở khóa</span>
                </>
              )}
            </button>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Độ đậm nền đề</span>
              <span className="font-mono font-semibold text-[var(--text-main)]">
                {Math.round(background.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              data-testid="worksheet-opacity-slider"
              min={20}
              max={100}
              step={5}
              value={Math.round(background.opacity * 100)}
              onChange={(e) => onUpdateBackground({ opacity: Number(e.target.value) / 100 })}
              className="w-full accent-[var(--accent-os)]"
            />
          </div>

          <div>
            <span className="mb-1 block text-[var(--text-muted)]">Vị trí đặt phiếu trên trang</span>
            <div className="grid grid-cols-3 gap-1">
              {FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-testid={`worksheet-fit-${opt.value}`}
                  title={opt.hint}
                  onClick={() => onUpdateBackground({ fitMode: opt.value })}
                  className={cn(
                    'cursor-pointer rounded-md border px-1.5 py-1 text-[10px] font-medium transition-colors',
                    background.fitMode === opt.value
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            data-testid="worksheet-remove-btn"
            onClick={onRemoveBackground}
            className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#8F3D35]/35 bg-[#FDF2F2] py-1.5 text-[11px] font-semibold text-[#8F3D35] hover:bg-[#FCE5E5] dark:bg-[#261414] dark:text-[#F87171]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Gỡ phiếu bài tập khỏi trang này</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border-hairline)] bg-[var(--bg-surface)]/40 px-3 py-2.5 text-center text-[11px] text-[var(--text-muted)]">
          Trang hiện tại chưa gắn phiếu bài tập nền.
        </div>
      )}
    </div>
  );
};
