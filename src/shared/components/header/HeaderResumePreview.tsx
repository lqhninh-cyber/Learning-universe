import { ArrowRight, Play } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { readLessonReadingPosition } from '@/context/island-helpers';

export interface ResumePreviewData {
  readonly label: string;
  readonly to: string;
  readonly lessonId: string;
  readonly subjectName: string;
  readonly subjectAccentColor: string;
  readonly chapterNumber: number;
  readonly lessonTitle: string;
  readonly isCompleted: boolean;
}

export interface HeaderResumePreviewProps {
  readonly data: ResumePreviewData;
}

export const HeaderResumePreview: FC<HeaderResumePreviewProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionInfo, setPositionInfo] = useState<{
    sectionTitle: string;
    progressPercent: number;
  } | null>(null);

  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (isOpen) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      const saved = readLessonReadingPosition(data.lessonId);
      setPositionInfo({
        sectionTitle: saved?.sectionTitle ?? 'Mục 1. Mở đầu bài học',
        progressPercent: data.isCompleted ? 100 : (saved?.progressPercent ?? 12),
      });
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsOpen(false);
    }, 160);
  };

  const resolvedSection = positionInfo?.sectionTitle ?? 'Mục 1. Mở đầu bài học';
  const resolvedPercent = positionInfo?.progressPercent ?? (data.isCompleted ? 100 : 12);

  return (
    <div
      className="relative hidden xl:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={data.to}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#9E845A]/30 bg-[#26403A] px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap text-[#F2F4F3] shadow-sm transition-all duration-150 hover:bg-[#1E332E] focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none active:scale-[0.98]"
      >
        <Play className="h-3 w-3 fill-current" aria-hidden="true" />
        <span>Học tiếp: {data.label}</span>
      </Link>

      {isOpen && (
        <Link
          to={data.to}
          data-testid="resume-preview-card"
          className="absolute top-full right-0 z-50 mt-2.5 block w-80 rounded-2xl border border-[#D8E0DD] bg-[#FAFBF9]/95 p-4 text-left shadow-[0_16px_40px_rgba(24,38,36,0.12)] backdrop-blur-xl transition-all duration-200 hover:border-[#9E845A]/60"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold">
            <span style={{ color: data.subjectAccentColor }}>{data.subjectName}</span>
            <span className="rounded-full bg-[#EDF1EF] px-2 py-0.5 font-mono text-[10px] text-[#4A5D58]">
              Chương {data.chapterNumber}
            </span>
          </div>

          <h4 className="text-[15px] leading-snug font-bold text-[#182624]">{data.lessonTitle}</h4>

          <p className="mt-1.5 truncate text-xs text-[#4A5D58]">
            Đang dừng ở: <span className="font-medium text-[#182624]">{resolvedSection}</span>
          </p>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#4A5D58]">Tiến độ bài học</span>
              <span className="font-mono font-semibold text-[#182624] tabular-nums">
                {resolvedPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E7ECEA]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${resolvedPercent}%`,
                  backgroundColor: data.subjectAccentColor,
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-[#1E332E]">
            <span>Nhấp để tiếp tục học ngay</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        </Link>
      )}
    </div>
  );
};
