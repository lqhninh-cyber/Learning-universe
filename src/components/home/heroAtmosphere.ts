export type HeroAtmosphere = 'dawn' | 'sunset' | 'night';

export const HERO_ATMOSPHERE_STORAGE_KEY = 'lu_hero_atmosphere';

export interface AtmosphereThemeConfig {
  readonly id: HeroAtmosphere;
  readonly label: string;
  readonly shortLabel: string;
  readonly ariaLabel: string;
  readonly isDarkSurface: boolean;
  readonly skyGradient: string;
  readonly headingTextClass: string;
  readonly subtextClass: string;
  readonly proverbAuthorClass: string;
  readonly highlightGradientClass: string;
  readonly eyebrowContainerClass: string;
  readonly eyebrowTextClass: string;
  readonly primaryCtaClass: string;
  readonly secondaryCtaClass: string;
  readonly statusBarBorderClass: string;
  readonly statusAccentTextClass: string;
  readonly statusMutedTextClass: string;
  readonly bottomEdgeBlend: string;
}

export const ATMOSPHERE_ORDER: readonly HeroAtmosphere[] = ['dawn', 'sunset', 'night'] as const;

export const ATMOSPHERE_THEMES: Readonly<Record<HeroAtmosphere, AtmosphereThemeConfig>> = {
  dawn: {
    id: 'dawn',
    label: '☀️ Nắng Sớm',
    shortLabel: 'Nắng Sớm',
    ariaLabel: 'Chuyển sang khí quyển Nắng Sớm',
    isDarkSurface: false,
    skyGradient: 'linear-gradient(180deg, #FBF9F2 0%, #F2ECE1 65%, #E4EFE9 100%)',
    headingTextClass: 'text-[#18221D]',
    subtextClass: 'text-[#3D4E46]',
    proverbAuthorClass: 'text-[#365E4E]',
    highlightGradientClass:
      'bg-gradient-to-r from-[#C83E37] via-[#B85D3B] to-[#C89738] bg-clip-text text-transparent',
    eyebrowContainerClass: 'border-[#C5A262]/45 bg-[#FFFDF8]/85 shadow-2xs backdrop-blur-md',
    eyebrowTextClass: 'text-[#365E4E]',
    primaryCtaClass:
      'bg-[#365E4E] text-white shadow-sm hover:bg-[#294A3D] hover:-translate-y-0.5 active:scale-[0.98]',
    secondaryCtaClass:
      'border border-[#C5A262]/50 bg-[#FFFDF8]/85 text-[#18221D] backdrop-blur-md hover:border-[#C83E37]/50 hover:bg-[#F3EFE4] hover:-translate-y-0.5 active:scale-[0.98]',
    statusBarBorderClass: 'border-[#C5A262]/30',
    statusAccentTextClass: 'text-[#365E4E]',
    statusMutedTextClass: 'text-[#4A5851]',
    bottomEdgeBlend: 'linear-gradient(180deg, rgba(228,239,233,0) 0%, #F5F4EF 100%)',
  },
  sunset: {
    id: 'sunset',
    label: '🌇 Hoàng Hôn Chu Sa',
    shortLabel: 'Hoàng Hôn',
    ariaLabel: 'Chuyển sang khí quyển Hoàng Hôn Chu Sa',
    isDarkSurface: true,
    skyGradient: 'linear-gradient(180deg, #2A1820 0%, #5E2527 42%, #9E4733 78%, #D98A4E 100%)',
    headingTextClass: 'text-[#FFF9F0]',
    subtextClass: 'text-[#FDEBD3]/90',
    proverbAuthorClass: 'text-[#F3C978]',
    highlightGradientClass:
      'bg-gradient-to-r from-[#F3C978] via-[#FFB36B] to-[#F5E0A3] bg-clip-text text-transparent',
    eyebrowContainerClass: 'border-[#E5B869]/45 bg-[#2A1820]/60 shadow-sm backdrop-blur-md',
    eyebrowTextClass: 'text-[#F3C978]',
    primaryCtaClass:
      'bg-gradient-to-r from-[#C83E37] to-[#D97736] text-[#FFF9F0] shadow-md shadow-[#C83E37]/25 hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]',
    secondaryCtaClass:
      'border border-[#E5B869]/50 bg-[#2A1820]/55 text-[#FFF9F0] backdrop-blur-md hover:border-[#F3C978] hover:bg-[#3B1E28]/80 hover:-translate-y-0.5 active:scale-[0.98]',
    statusBarBorderClass: 'border-[#E5B869]/30',
    statusAccentTextClass: 'text-[#F3C978]',
    statusMutedTextClass: 'text-[#FFF9F0]/85',
    bottomEdgeBlend: 'linear-gradient(180deg, rgba(217,138,78,0) 0%, #F5F4EF 100%)',
  },
  night: {
    id: 'night',
    label: '🌙 Đêm Đom Đóm',
    shortLabel: 'Đêm Đom Đóm',
    ariaLabel: 'Chuyển sang khí quyển Đêm Đom Đóm',
    isDarkSurface: true,
    skyGradient: 'linear-gradient(180deg, #07120E 0%, #0D211A 55%, #153226 100%)',
    headingTextClass: 'text-[#F4F1EA]',
    subtextClass: 'text-[#D0DDD5]/90',
    proverbAuthorClass: 'text-[#86EFAC]',
    highlightGradientClass:
      'bg-gradient-to-r from-[#E5C378] via-[#86EFAC] to-[#F6DE9D] bg-clip-text text-transparent',
    eyebrowContainerClass: 'border-[#D4AF37]/40 bg-[#0A1A14]/70 shadow-sm backdrop-blur-md',
    eyebrowTextClass: 'text-[#E5C378]',
    primaryCtaClass:
      'bg-[#1D4E3B] border border-[#86EFAC]/35 text-[#F4F1EA] shadow-md shadow-black/30 hover:bg-[#25634B] hover:-translate-y-0.5 active:scale-[0.98]',
    secondaryCtaClass:
      'border border-[#D4AF37]/45 bg-[#0A1A14]/65 text-[#F4F1EA] backdrop-blur-md hover:border-[#86EFAC]/60 hover:bg-[#112A20]/85 hover:-translate-y-0.5 active:scale-[0.98]',
    statusBarBorderClass: 'border-[#D4AF37]/25',
    statusAccentTextClass: 'text-[#86EFAC]',
    statusMutedTextClass: 'text-[#D0DDD5]/85',
    bottomEdgeBlend: 'linear-gradient(180deg, rgba(21,50,38,0) 0%, #F5F4EF 100%)',
  },
};

export function isHeroAtmosphere(value: unknown): value is HeroAtmosphere {
  return value === 'dawn' || value === 'sunset' || value === 'night';
}

export function detectSystemDarkMode(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const savedReadingTheme = window.localStorage.getItem('lu_reading_theme');
      if (savedReadingTheme === 'dark') {
        return true;
      }
      if (savedReadingTheme === 'light' || savedReadingTheme === 'sepia') {
        return false;
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return false;
}

export function getInitialHeroAtmosphere(): HeroAtmosphere {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(HERO_ATMOSPHERE_STORAGE_KEY);
      if (isHeroAtmosphere(stored)) {
        return stored;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return detectSystemDarkMode() ? 'night' : 'dawn';
}

export function saveHeroAtmosphere(atmosphere: HeroAtmosphere): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HERO_ATMOSPHERE_STORAGE_KEY, atmosphere);
  } catch {
    // Ignore storage quota errors
  }
}
