import { type FC, type RefObject, useId } from 'react';
import { cn } from '@/shared/lib/cn';

const LEAF_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

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
  const rawId = useId();
  const gradId = `lu-leaf-grad-${rawId.replace(/:/g, '')}`;

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        ref={roseRef}
        viewBox="0 0 100 100"
        aria-hidden="true"
        style={{ transform: 'rotate(0deg)' }}
        className="h-9 w-9 shrink-0 transition-transform duration-150 ease-out will-change-transform"
      >
        <defs>
          <linearGradient id={gradId} x1="50%" y1="6%" x2="50%" y2="85%">
            <stop offset="0%" stopColor="#80D62A" />
            <stop offset="56%" stopColor="#248A24" />
            <stop offset="100%" stopColor="#145A1A" />
          </linearGradient>
        </defs>

        {LEAF_ANGLES.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <path
              d="M50 48 C37 36, 37 19, 50 6 C65 18, 63 39, 50 48 Z"
              fill={`url(#${gradId})`}
              stroke="#0E3311"
              strokeWidth="0.6"
              strokeOpacity="0.4"
              strokeLinejoin="round"
            />
            <path
              d="M50 45 Q48.2 27 50 9"
              fill="none"
              stroke="#DDF9B5"
              strokeWidth="0.7"
              strokeOpacity="0.32"
              strokeLinecap="round"
            />
          </g>
        ))}
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
            isDark ? 'text-[#86EFAC]' : 'text-[#246A3B] dark:text-[#86EFAC]',
          )}
        >
          UNIVERSE
        </span>
      </div>
    </div>
  );
};
