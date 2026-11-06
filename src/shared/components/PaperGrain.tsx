import type { FC } from 'react';
import { cn } from '@/shared/lib/cn';

export interface PaperGrainProps {
  readonly className?: string;
}

/**
 * Lớp phủ vi chất liệu Giấy Dó (Tactile Noise & Paper Grain):
 * Sử dụng SVG `<feTurbulence>` nội dòng siêu nhẹ, không nạp ảnh ngoài,
 * bảo toàn hiệu năng cuộn mượt 60fps.
 */
export const PaperGrain: FC<PaperGrainProps> = ({ className }) => {
  return (
    <svg
      aria-hidden="true"
      data-testid="paper-grain-overlay"
      className={cn(
        'pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.032] mix-blend-multiply dark:opacity-[0.025] dark:mix-blend-screen print:hidden',
        className,
      )}
    >
      <filter id="dopaper-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={3} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#dopaper-noise)" />
    </svg>
  );
};

export default PaperGrain;
