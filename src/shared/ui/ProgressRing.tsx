import { cn } from '@/shared/lib/cn';

export interface ProgressRingProps {
  readonly value: number;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly showLabel?: boolean;
  readonly className?: string;
}

export function ProgressRing({
  value,
  size = 44,
  strokeWidth = 4,
  showLabel = true,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Tiến độ ${clamped}%`}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 transform" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          className="stroke-stone-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-subject-600 transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="font-mono text-[11px] font-medium text-stone-700">{clamped}%</span>
      )}
    </div>
  );
}
