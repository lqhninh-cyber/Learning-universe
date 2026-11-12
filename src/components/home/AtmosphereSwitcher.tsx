import { cn } from '@/shared/lib/cn';
import { ATMOSPHERE_ORDER, ATMOSPHERE_THEMES, type HeroAtmosphere } from './heroAtmosphere';

export interface AtmosphereSwitcherProps {
  readonly atmosphere: HeroAtmosphere;
  readonly onChange: (next: HeroAtmosphere) => void;
  readonly className?: string;
}

/**
 * Bộ chuyển đổi khí quyển 3 thời khắc dạng viên thuốc nổi (`dawn` | `sunset` | `night`).
 */
export function AtmosphereSwitcher({ atmosphere, onChange, className }: AtmosphereSwitcherProps) {
  const isDark = ATMOSPHERE_THEMES[atmosphere].isDarkSurface;

  return (
    <div
      data-testid="atmosphere-switcher"
      role="radiogroup"
      aria-label="Bộ chuyển đổi khí quyển thời gian"
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-full border p-1 backdrop-blur-md transition-colors duration-700',
        isDark
          ? 'border-[#E5B869]/35 bg-[#121D19]/65 shadow-lg shadow-black/25'
          : 'border-[#C5A262]/45 bg-[#FFFDF8]/85 shadow-sm shadow-[#18221D]/5',
        className,
      )}
    >
      {ATMOSPHERE_ORDER.map((mode) => {
        const theme = ATMOSPHERE_THEMES[mode];
        const isActive = atmosphere === mode;

        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={theme.ariaLabel}
            data-testid={`atmosphere-option-${mode}`}
            onClick={() => onChange(mode)}
            className={cn(
              'min-h-[34px] cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]',
              isActive && mode === 'dawn' && 'bg-[#365E4E] text-[#FFFDF8] shadow-xs',
              isActive &&
                mode === 'sunset' &&
                'bg-gradient-to-r from-[#C83E37] to-[#D97736] text-[#FFF9F0] shadow-xs',
              isActive &&
                mode === 'night' &&
                'border border-[#86EFAC]/40 bg-[#1B4333] text-[#F4F1EA] shadow-xs',
              !isActive &&
                (isDark
                  ? 'text-[#E6E0D4]/80 hover:bg-white/10 hover:text-white'
                  : 'text-[#4A5851] hover:bg-[#E7ECE8]/80 hover:text-[#18221D]'),
            )}
          >
            {theme.label}
          </button>
        );
      })}
    </div>
  );
}
