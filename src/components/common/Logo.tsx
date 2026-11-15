import type { FC } from 'react';
import { BrandLogo } from './BrandLogo';

export interface LogoProps {
  readonly variant?: 'primary' | 'symbol';
  readonly theme?: 'light' | 'dark';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly className?: string;
  readonly 'aria-label'?: string;
}

export const Logo: FC<LogoProps> = ({
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <BrandLogo
      variant={variant === 'primary' ? 'full' : 'emblem-only'}
      size={size}
      isDark={theme === 'dark'}
      className={className}
      aria-label={ariaLabel}
    />
  );
};

export default Logo;
