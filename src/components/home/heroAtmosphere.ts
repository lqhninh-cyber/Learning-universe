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
  readonly bottomEdgeBlend: string;
}

export const ATMOSPHERE_ORDER: readonly HeroAtmosphere[] = ['dawn', 'sunset', 'night'] as const;

export const ATMOSPHERE_THEMES: Readonly<Record<HeroAtmosphere, AtmosphereThemeConfig>> = {
  dawn: {
    id: 'dawn',
    label: '🌾 Ruộng Bậc Thang',
    shortLabel: 'Ruộng Bậc Thang',
    ariaLabel: 'Chuyển sang cảnh quan Ruộng Bậc Thang và Núi Rừng Tây Bắc',
    isDarkSurface: false,
    skyGradient: 'linear-gradient(180deg, #FBF9F2 0%, #EEF4EC 52%, #DCEAD9 100%)',
    headingTextClass: 'text-[#18221D]',
    subtextClass: 'text-[#36493E]',
    proverbAuthorClass: 'text-[#2E5D46]',
    highlightGradientClass:
      'bg-gradient-to-r from-[#2E5D46] via-[#5B8C5A] to-[#C88A1E] bg-clip-text text-transparent',
    eyebrowContainerClass: 'border-[#5B8C5A]/45 bg-[#FFFDF8]/88 shadow-2xs backdrop-blur-md',
    eyebrowTextClass: 'text-[#2E5D46]',
    primaryCtaClass:
      'bg-[#234F3B] text-white shadow-sm hover:bg-[#1A3B2C] hover:-translate-y-0.5 active:scale-[0.98]',
    secondaryCtaClass:
      'border border-[#5B8C5A]/45 bg-[#FFFDF8]/88 text-[#18221D] backdrop-blur-md hover:border-[#D49B27] hover:bg-[#F5F2E6] hover:-translate-y-0.5 active:scale-[0.98]',
    bottomEdgeBlend: 'linear-gradient(180deg, rgba(220,234,217,0) 0%, #F5F4EF 100%)',
  },
  sunset: {
    id: 'sunset',
    label: '⛵ Vịnh Hạ Long',
    shortLabel: 'Vịnh Hạ Long',
    ariaLabel: 'Chuyển sang cảnh quan Vịnh Hạ Long và Biển Cả',
    isDarkSurface: true,
    skyGradient: 'linear-gradient(180deg, #1E2433 0%, #6E3A3D 38%, #C47A4C 67%, #164E46 100%)',
    headingTextClass: 'text-[#FFF9F0]',
    subtextClass: 'text-[#FDEBD3]/92',
    proverbAuthorClass: 'text-[#F6D383]',
    highlightGradientClass:
      'bg-gradient-to-r from-[#F6D383] via-[#FFB978] to-[#8EE5CE] bg-clip-text text-transparent',
    eyebrowContainerClass: 'border-[#F6D383]/40 bg-[#1B222D]/65 shadow-sm backdrop-blur-md',
    eyebrowTextClass: 'text-[#F6D383]',
    primaryCtaClass:
      'bg-gradient-to-r from-[#1D6B5F] to-[#2B8C7B] text-[#FFF9F0] shadow-md shadow-[#0C2E29]/35 hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]',
    secondaryCtaClass:
      'border border-[#F6D383]/50 bg-[#1B222D]/60 text-[#FFF9F0] backdrop-blur-md hover:border-[#F6D383] hover:bg-[#233238]/85 hover:-translate-y-0.5 active:scale-[0.98]',
    bottomEdgeBlend: 'linear-gradient(180deg, rgba(22,78,70,0) 0%, #F5F4EF 100%)',
  },
  night: {
    id: 'night',
    label: '🕳️ Hang Sơn Đoòng',
    shortLabel: 'Hang Sơn Đoòng',
    ariaLabel: 'Chuyển sang cảnh quan Hang Sơn Đoòng và Rừng Nguyên Sinh',
    isDarkSurface: true,
    skyGradient: 'linear-gradient(180deg, #060E0B 0%, #0C2018 52%, #133124 100%)',
    headingTextClass: 'text-[#F4F1EA]',
    subtextClass: 'text-[#D0DDD5]/92',
    proverbAuthorClass: 'text-[#86EFAC]',
    highlightGradientClass:
      'bg-gradient-to-r from-[#86EFAC] via-[#E5C378] to-[#A7F3D0] bg-clip-text text-transparent',
    eyebrowContainerClass: 'border-[#86EFAC]/35 bg-[#091711]/75 shadow-sm backdrop-blur-md',
    eyebrowTextClass: 'text-[#A7F3D0]',
    primaryCtaClass:
      'bg-[#1D543D] border border-[#86EFAC]/35 text-[#F4F1EA] shadow-md shadow-black/30 hover:bg-[#266B4F] hover:-translate-y-0.5 active:scale-[0.98]',
    secondaryCtaClass:
      'border border-[#D4AF37]/45 bg-[#091711]/70 text-[#F4F1EA] backdrop-blur-md hover:border-[#86EFAC]/65 hover:bg-[#10291F]/85 hover:-translate-y-0.5 active:scale-[0.98]',
    bottomEdgeBlend: 'linear-gradient(180deg, rgba(19,49,36,0) 0%, #F5F4EF 100%)',
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
