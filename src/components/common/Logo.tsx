import type { FC } from 'react';
import { cn } from '@/shared/lib/cn';

export interface LogoProps {
  readonly variant?: 'primary' | 'symbol';
  readonly theme?: 'light' | 'dark';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const SIZE_MAP = {
  sm: { img: 'h-7 w-7', text: 'text-sm', sub: 'text-[10px]' },
  md: { img: 'h-9 w-9', text: 'text-base', sub: 'text-xs' },
  lg: { img: 'h-14 w-14', text: 'text-xl', sub: 'text-sm' },
  xl: { img: 'h-20 w-20', text: 'text-2xl', sub: 'text-base' },
} as const;

export const Logo: FC<LogoProps> = ({
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}) => {
  const cfg = SIZE_MAP[size];
  const isDark = theme === 'dark';

  return (
    <div
      className={cn('inline-flex items-center gap-2.5 select-none', className)}
      aria-label={ariaLabel}
    >
      <img
        src="/logo-laxanh.png"
        alt="Learning Universe Logo"
        className={cn(cfg.img, 'object-contain transition-transform duration-200 hover:scale-105')}
        loading="eager"
      />
      {variant === 'primary' && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              cfg.text,
              'font-serif font-bold tracking-[0.16em] uppercase',
              isDark ? 'text-[#F5F2EB]' : 'text-[#081611]',
            )}
          >
            Learning
          </span>
          <span
            className={cn(
              cfg.sub,
              'mt-1 font-sans font-semibold tracking-[0.22em] text-[#C5A262] uppercase',
            )}
          >
            Universe
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
