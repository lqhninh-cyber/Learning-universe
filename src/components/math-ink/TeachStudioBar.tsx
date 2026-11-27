import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Compass,
  Eraser,
  Mic,
  MicOff,
  Pause,
  Play,
  Plus,
  Pointer,
  Presentation,
  RotateCcw,
  Sigma,
  Square,
  Timer,
  Undo2,
  X,
} from 'lucide-react';
import { type FC, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  drawFormattedMathTextOnCanvas,
  type InkActiveTool,
  type InkPage,
  type PenPreset,
} from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function pickSupportedRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return 'video/webm';
  }
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return '';
}

export interface TeachStudioBarProps {
  readonly notebookTitle: string;
  readonly pageIndex: number;
  readonly pageCount: number;
  readonly pageWidth: number;
  readonly pageHeight: number;
  readonly activePage: InkPage;
  readonly mainCanvasRef: RefObject<HTMLCanvasElement | null>;
  readonly laserCanvasRef: RefObject<HTMLCanvasElement | null>;
  readonly penPresets: readonly PenPreset[];
  readonly activePenPresetId: string;
  readonly activeTool: InkActiveTool;
  readonly canUndo: boolean;
  readonly onSelectPen: (presetId: string) => void;
  readonly onSelectTool: (tool: InkActiveTool) => void;
  readonly onOpenFormulaPad: () => void;
  readonly onUndo: () => void;
  readonly onSelectPage: (index: number) => void;
  readonly onAddPage: () => void;
  readonly onExitTeachMode: () => void;
}

export const TeachStudioBar: FC<TeachStudioBarProps> = ({
  notebookTitle,
  pageIndex,
  pageCount,
  pageWidth,
  pageHeight,
  activePage,
  mainCanvasRef,
  laserCanvasRef,
  penPresets,
  activePenPresetId,
  activeTool,
  canUndo,
  onSelectPen,
  onSelectTool,
  onOpenFormulaPad,
  onUndo,
  onSelectPage,
  onAddPage,
  onExitTeachMode,
}) => {
  // Đồng hồ bấm giờ Tập giảng (15 phút vi giảng / 45 phút tiết chuẩn)
  const [targetMinutes, setTargetMinutes] = useState<15 | 45>(15);
  const [timerRunning, setTimerRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Trạng thái Ghi hình bài giảng Offline (.webm)
  const [withMic, setWithMic] = useState(true);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activePageRef = useRef<InkPage>(activePage);
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const composeIntervalRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);

  // Nhịp đếm giờ tập giảng 1Hz
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // Nhịp đếm thời lượng video đang ghi
  useEffect(() => {
    if (recordingState !== 'recording') return;
    const id = window.setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [recordingState]);

  const cleanupRecordingResources = useCallback(() => {
    if (composeIntervalRef.current !== null) {
      window.clearInterval(composeIntervalRef.current);
      composeIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      for (const track of micStreamRef.current.getTracks()) {
        track.stop();
      }
      micStreamRef.current = null;
    }
    if (canvasStreamRef.current) {
      for (const track of canvasStreamRef.current.getTracks()) {
        track.stop();
      }
      canvasStreamRef.current = null;
    }
    recorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
    };
  }, [cleanupRecordingResources]);

  const handleStartRecording = async () => {
    setStatusMessage(null);
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas || typeof MediaRecorder === 'undefined') {
      setStatusMessage('Trình duyệt hiện tại chưa hỗ trợ ghi hình bài giảng Offline (.webm).');
      return;
    }

    const composite = document.createElement('canvas');
    composite.width = pageWidth;
    composite.height = pageHeight;
    const compCtx = composite.getContext('2d');

    const compositeWithCapture = composite as HTMLCanvasElement & {
      captureStream?: (frameRate?: number) => MediaStream;
    };

    if (!compCtx || typeof compositeWithCapture.captureStream !== 'function') {
      setStatusMessage('Trình duyệt hiện tại chưa hỗ trợ trích xuất luồng hình từ bảng viết.');
      return;
    }

    const drawCompositeFrame = () => {
      const srcMain = mainCanvasRef.current;
      const srcLaser = laserCanvasRef.current;
      compCtx.fillStyle = '#FCFBF7';
      compCtx.fillRect(0, 0, pageWidth, pageHeight);
      if (srcMain && srcMain.width > 0 && srcMain.height > 0) {
        compCtx.drawImage(srcMain, 0, 0, pageWidth, pageHeight);
      }
      for (const txt of activePageRef.current.texts) {
        drawFormattedMathTextOnCanvas(compCtx, txt);
      }
      if (srcLaser && srcLaser.width > 0 && srcLaser.height > 0) {
        compCtx.drawImage(srcLaser, 0, 0, pageWidth, pageHeight);
      }
    };

    drawCompositeFrame();
    const videoStream = compositeWithCapture.captureStream(30);
    canvasStreamRef.current = videoStream;

    const combinedTracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];

    if (withMic && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = audioStream;
        combinedTracks.push(...audioStream.getAudioTracks());
      } catch {
        setStatusMessage('Không truy cập được Micro — đang ghi hình bảng viết không âm thanh.');
      }
    }

    const combinedStream = new MediaStream(combinedTracks);
    const mimeType = pickSupportedRecorderMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(combinedStream, { mimeType })
        : new MediaRecorder(combinedStream);
    } catch {
      cleanupRecordingResources();
      setStatusMessage('Không khởi tạo được bộ ghi hình bài giảng trên thiết bị này.');
      return;
    }

    chunksRef.current = [];
    recorder.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) {
        chunksRef.current.push(ev.data);
      }
    };

    recorder.onstop = () => {
      const recordedChunks = chunksRef.current;
      chunksRef.current = [];
      const finalMime = recorder.mimeType || mimeType || 'video/webm';
      if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: finalMime });
        const url = URL.createObjectURL(blob);
        const safeName =
          notebookTitle.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'bai-giang-toan';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}-tap-giang.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        setStatusMessage('Đã tải video bài giảng (.webm) về máy tính!');
      }
      cleanupRecordingResources();
      setRecordingState('idle');
    };

    composeIntervalRef.current = window.setInterval(drawCompositeFrame, 33);
    recorderRef.current = recorder;
    setRecordSeconds(0);
    setRecordingState('recording');
    recorder.start(500);
  };

  const handleTogglePauseRecording = () => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state === 'recording') {
      rec.pause();
      setRecordingState('paused');
    } else if (rec.state === 'paused') {
      rec.resume();
      setRecordingState('recording');
    }
  };

  const handleStopRecording = () => {
    const rec = recorderRef.current;
    if (!rec) {
      cleanupRecordingResources();
      setRecordingState('idle');
      return;
    }
    if (rec.state !== 'inactive') {
      rec.stop();
    } else {
      cleanupRecordingResources();
      setRecordingState('idle');
    }
  };

  const handleExit = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    } else {
      cleanupRecordingResources();
    }
    onExitTeachMode();
  };

  const isOverTime = elapsedSeconds >= targetMinutes * 60;
  const quickPens = penPresets.slice(0, 4);

  return (
    <div
      data-testid="ink-teach-studio-bar"
      className="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[#132923] px-3 py-2 text-white shadow-md print:hidden"
    >
      {/* TRÁI: Huy hiệu Tập giảng + Đồng hồ bấm giờ tiết dạy */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-200">
          <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tập giảng</span>
        </span>

        <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/8 px-2 py-1 text-xs">
          <Timer
            className={cn('h-3.5 w-3.5', isOverTime ? 'text-amber-300' : 'text-emerald-300')}
            aria-hidden="true"
          />
          <span
            data-testid="teach-timer-readout"
            className={cn(
              'font-mono text-xs font-bold tabular-nums',
              isOverTime ? 'text-amber-300' : 'text-white',
            )}
          >
            {formatClock(elapsedSeconds)}
          </span>
          <button
            type="button"
            onClick={() => setTargetMinutes((m) => (m === 15 ? 45 : 15))}
            title="Đổi mốc thời lượng tập giảng (15 phút vi giảng / 45 phút tiết chuẩn)"
            className="cursor-pointer rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/80 hover:bg-white/20"
          >
            /{targetMinutes}p
          </button>
          <button
            type="button"
            onClick={() => setTimerRunning((r) => !r)}
            aria-label={timerRunning ? 'Tạm dừng đồng hồ giảng' : 'Tiếp tục đồng hồ giảng'}
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded hover:bg-white/15"
          >
            {timerRunning ? (
              <Pause className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Play className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setElapsedSeconds(0)}
            aria-label="Đặt lại đồng hồ giảng"
            title="Đặt lại 00:00"
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded hover:bg-white/15"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* GIỮA: Phấn / Bút nhanh · Laser · Công thức · Dựng hình · Tẩy · Lật trang bảng */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5">
          {quickPens.map((preset) => {
            const active = activeTool === 'pen' && activePenPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPen(preset.id)}
                aria-label={`Bút giảng ${preset.id}`}
                className={cn(
                  'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-transform',
                  active ? 'scale-110 ring-2 ring-emerald-300' : 'opacity-85 hover:scale-105',
                )}
              >
                <span
                  style={{ backgroundColor: preset.color }}
                  className="h-3.5 w-3.5 rounded-full border border-white/60"
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          data-testid="teach-laser-btn"
          onClick={() => onSelectTool(activeTool === 'laser' ? 'pen' : 'laser')}
          title="Bút Laser tự tan (Phím tắt: L — tự mờ sau 1.2s)"
          className={cn(
            'inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 text-xs font-medium transition-colors',
            activeTool === 'laser'
              ? 'border-red-400 bg-red-600 text-white'
              : 'border-white/15 bg-white/8 text-white/90 hover:bg-white/16',
          )}
        >
          <Pointer className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden lg:inline">Laser</span>
        </button>

        <button
          type="button"
          onClick={onOpenFormulaPad}
          title="Chèn công thức toán KaTeX"
          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/8 px-2 text-xs font-medium text-white/90 hover:bg-white/16"
        >
          <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden xl:inline">Công thức</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool(activeTool === 'geo' ? 'pen' : 'geo')}
          title="Bật/tắt thanh Dựng hình động GeoGebra"
          className={cn(
            'inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 text-xs font-medium transition-colors',
            activeTool === 'geo'
              ? 'border-blue-300 bg-blue-600 text-white'
              : 'border-white/15 bg-white/8 text-white/90 hover:bg-white/16',
          )}
        >
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden xl:inline">Dựng hình</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('eraser')}
          aria-label="Tẩy bảng"
          className={cn(
            'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition-colors',
            activeTool === 'eraser'
              ? 'border-emerald-300 bg-emerald-600 text-white'
              : 'border-white/15 bg-white/8 text-white/90 hover:bg-white/16',
          )}
        >
          <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Hoàn tác nét vừa viết"
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/8 text-white/90 hover:bg-white/16 disabled:opacity-35"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        {/* Bộ lật trang bảng */}
        <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/8 px-1.5 py-0.5 text-xs">
          <button
            type="button"
            data-testid="teach-prev-page"
            disabled={pageIndex <= 0}
            onClick={() => onSelectPage(pageIndex - 1)}
            aria-label="Trang trước"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-white/15 disabled:opacity-35"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span
            data-testid="teach-page-indicator"
            className="px-1 font-mono text-[11px] font-semibold tabular-nums"
          >
            Trang {pageIndex + 1}/{pageCount}
          </span>
          <button
            type="button"
            data-testid="teach-next-page"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => onSelectPage(pageIndex + 1)}
            aria-label="Trang tiếp theo"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-white/15 disabled:opacity-35"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-testid="teach-add-page"
            onClick={onAddPage}
            title="Thêm trang bảng mới"
            aria-label="Thêm trang bảng mới"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/12 hover:bg-white/22"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* PHẢI: Ghi hình bài giảng Offline (.webm) + Thoát chế độ Tập giảng */}
      <div className="flex flex-wrap items-center gap-1.5">
        {recordingState === 'idle' ? (
          <>
            <button
              type="button"
              data-testid="teach-mic-toggle"
              onClick={() => setWithMic((m) => !m)}
              aria-pressed={withMic}
              title={
                withMic ? 'Đang bật thu âm Micro giảng bài' : 'Đang tắt Micro (chỉ ghi hình bảng)'
              }
              className={cn(
                'inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 text-[11px] font-medium transition-colors',
                withMic
                  ? 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100'
                  : 'border-white/15 bg-white/8 text-white/70',
              )}
            >
              {withMic ? (
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{withMic ? 'Có Mic' : 'Tắt Mic'}</span>
            </button>

            <button
              type="button"
              data-testid="teach-record-start"
              onClick={() => void handleStartRecording()}
              className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg bg-[#DC2626] px-2.5 text-xs font-semibold text-white shadow-xs transition-transform hover:bg-[#EF4444] active:scale-[0.98]"
            >
              <Circle className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
              <span>Ghi bài giảng</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg border border-red-400/50 bg-red-950/60 px-2 py-0.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-red-200 tabular-nums">
              <span
                className={cn(
                  'h-2 w-2 rounded-full bg-red-400',
                  recordingState === 'recording' && 'animate-pulse',
                )}
              />
              <span>
                {recordingState === 'paused' ? 'TẠM DỪNG' : 'REC'} {formatClock(recordSeconds)}
              </span>
            </span>

            <button
              type="button"
              data-testid="teach-record-pause"
              onClick={handleTogglePauseRecording}
              className="cursor-pointer rounded bg-white/12 px-2 py-0.5 text-[11px] font-medium hover:bg-white/22"
            >
              {recordingState === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
            </button>

            <button
              type="button"
              data-testid="teach-record-stop"
              onClick={handleStopRecording}
              className="inline-flex cursor-pointer items-center gap-1 rounded bg-white px-2 py-0.5 text-[11px] font-bold text-[#991B1B] hover:bg-red-50"
            >
              <Square className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
              <span>Lưu .webm</span>
            </button>
          </div>
        )}

        <button
          type="button"
          data-testid="teach-exit-btn"
          onClick={handleExit}
          title="Thoát chế độ Tập giảng về Bảng viết đầy đủ"
          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 text-xs font-medium text-white hover:bg-white/20"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Thoát</span>
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          data-testid="teach-status-banner"
          className="flex w-full items-center justify-between rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-emerald-100"
        >
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="ml-2 cursor-pointer text-white/75 hover:text-white"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default TeachStudioBar;
