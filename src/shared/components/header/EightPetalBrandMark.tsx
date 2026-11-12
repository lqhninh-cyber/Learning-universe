import type { FC, RefObject } from 'react';
import { cn } from '@/shared/lib/cn';

function buildEightPetalRosePath(cx: number, cy: number, radius: number, steps = 160): string {
  const commands: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const theta = (2 * Math.PI * i) / steps;
    const r = radius * Math.cos(4 * theta);
    const x = (cx + r * Math.cos(theta)).toFixed(2);
    const y = (cy + r * Math.sin(theta)).toFixed(2);
    commands.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  commands.push('Z');
  return commands.join(' ');
}

const EIGHT_PETAL_ROSE_PATH = buildEightPetalRosePath(20, 20, 16.5);

export interface EightPetalBrandMarkProps {
  readonly roseRef: RefObject<SVGSVGElement | null>;
  readonly isDark?: boolean;
  readonly isSepia?: boolean;
}

export const EightPetalBrandMark: FC<EightPetalBrandMarkProps> = ({
  roseRef,
  isDark = false,
  isSepia = false,
}) => {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        ref={roseRef}
        viewBox="0 0 40 40"
        aria-hidden="true"
        style={{ transform: 'rotate(0deg)' }}
        className="h-9 w-9 shrink-0 transition-transform duration-150 ease-out will-change-transform"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={isDark ? 'rgba(197, 162, 98, 0.25)' : 'rgba(197, 162, 98, 0.35)'}
          strokeWidth="0.9"
          strokeDasharray="2 2.2"
        />
        <path
          d={EIGHT_PETAL_ROSE_PATH}
          fill={isDark ? 'rgba(197, 162, 98, 0.16)' : 'rgba(197, 162, 98, 0.18)'}
          stroke={isDark ? '#E5C378' : '#9A7B3E'}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="20" r="2.3" fill="#C83E37" />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[15px] font-extrabold tracking-[0.16em] uppercase',
            isDark
              ? 'text-[#F7F4EB]'
              : isSepia
                ? 'text-[#231F18]'
                : 'text-[#142B21] dark:text-[#F7F4EB]',
          )}
        >
          LEARNING
        </span>
        <span
          className={cn(
            'mt-1 text-[11px] font-bold tracking-[0.26em] uppercase',
            isDark ? 'text-[#E5C378]' : 'text-[#9A7B3E] dark:text-[#E5C378]',
          )}
        >
          UNIVERSE
        </span>
      </div>
    </div>
  );
};
