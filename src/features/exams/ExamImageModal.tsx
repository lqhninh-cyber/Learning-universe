import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Download, ExternalLink, FileQuestion, ImageIcon, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui';

export interface ExamImageModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly imagePath: string;
  readonly title: string;
  readonly year: string;
}

export function ExamImageModal({
  open,
  onOpenChange,
  imagePath,
  title,
  year,
}: ExamImageModalProps) {
  const [imageError, setImageError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-200" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[92vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl focus:outline-none sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-subject-700 bg-subject-50 border-subject-200 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Bản chụp đề gốc · {year}</span>
                </span>
              </div>
              <DialogPrimitive.Title className="text-base font-bold text-stone-900 sm:text-lg">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-stone-500">
                Tệp lưu trữ: <code className="font-mono text-stone-700">{imagePath}</code>
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="hover:border-subject-300 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
                aria-label="Đóng hộp thoại"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Body Viewer */}
          <div className="relative mt-4 flex min-h-[360px] flex-1 items-center justify-center overflow-auto rounded-xl border border-stone-200/80 bg-stone-50/70 p-4">
            {!imageError ? (
              <div
                className="transition-transform duration-150 ease-out"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <img
                  src={imagePath}
                  alt={`Bản chụp đề thi gốc - ${title}`}
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="mx-auto max-w-md py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-2xs">
                  <FileQuestion className="h-7 w-7" aria-hidden="true" />
                </div>
                <h4 className="mt-4 text-base font-bold text-stone-900">
                  Bản chụp đề gốc chưa được cập nhật
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Toàn bộ nội dung đề thi này đã được chuyển thể và số hóa 100% bằng KaTeX toán học
                  chuẩn xác với gợi ý định lý và lời giải chi tiết từng bước ngay tại giao diện bên
                  dưới.
                </p>
                <div className="mt-4 rounded-xl border border-stone-200/90 bg-white p-3 text-left text-xs text-stone-600">
                  <span className="font-medium text-stone-800">Đường dẫn tệp dự kiến:</span>
                  <div className="mt-1 font-mono break-all text-stone-500">{imagePath}</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
            {!imageError ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 75}
                  className="h-8 gap-1 px-2.5 text-xs"
                >
                  <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Thu nhỏ</span>
                </Button>
                <span className="min-w-[48px] text-center font-mono text-stone-600">
                  {zoomLevel}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="h-8 gap-1 px-2.5 text-xs"
                >
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Phóng to</span>
                </Button>
                {zoomLevel !== 100 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="text-subject-700 underline-offset-2 hover:underline"
                  >
                    Mặc định
                  </button>
                )}
              </div>
            ) : (
              <span className="text-stone-500">Trạng thái: Bản số hóa KaTeX hoạt động đầy đủ</span>
            )}

            <div className="flex items-center gap-2">
              {!imageError && (
                <>
                  <Button asChild variant="outline" size="sm" className="h-8 gap-1 px-3 text-xs">
                    <a href={imagePath} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Xem ảnh riêng</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8 gap-1 px-3 text-xs">
                    <a href={imagePath} download>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tải ảnh</span>
                    </a>
                  </Button>
                </>
              )}
              <DialogPrimitive.Close asChild>
                <Button variant="secondary" size="sm" className="h-8 px-4 text-xs">
                  Đóng
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
