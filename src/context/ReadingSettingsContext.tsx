import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { cn } from '@/shared/lib/cn';

export type ReadingTheme = 'light' | 'dark' | 'sepia';
export type ReadingFontFamily = 'serif' | 'sans';
export type ReadingFontSize = 'sm' | 'base' | 'lg' | 'xl';

export const FONT_SIZE_LEVELS: readonly ReadingFontSize[] = ['sm', 'base', 'lg', 'xl'] as const;

export const FONT_SIZE_LABELS: Record<ReadingFontSize, string> = {
  sm: 'Nhỏ',
  base: 'Vừa',
  lg: 'Lớn',
  xl: 'Đại',
};

const FONT_SIZE_CLASSES: Record<ReadingFontSize, string> = {
  sm: 'text-[16.5px] leading-[1.8]',
  base: 'text-[18.5px] leading-[1.9]',
  lg: 'text-[20.5px] leading-[1.9]',
  xl: 'text-[22px] leading-loose',
};

export interface ReadingSettingsContextValue {
  readonly theme: ReadingTheme;
  readonly setTheme: (theme: ReadingTheme) => void;
  readonly toggleTheme: () => void;
  readonly fontFamily: ReadingFontFamily;
  readonly setFontFamily: (font: ReadingFontFamily) => void;
  readonly toggleFontFamily: () => void;
  readonly fontSize: ReadingFontSize;
  readonly setFontSize: (size: ReadingFontSize) => void;
  readonly increaseFontSize: () => void;
  readonly decreaseFontSize: () => void;
  readonly isZenMode: boolean;
  readonly setZenMode: (zen: boolean) => void;
  readonly toggleZenMode: () => void;
  readonly typographyClasses: string;
}

const DEFAULT_READING_SETTINGS: ReadingSettingsContextValue = {
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  fontFamily: 'serif',
  setFontFamily: () => {},
  toggleFontFamily: () => {},
  fontSize: 'base',
  setFontSize: () => {},
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  isZenMode: false,
  setZenMode: () => {},
  toggleZenMode: () => {},
  typographyClasses: 'font-serif text-[18.5px] leading-[1.9]',
};

const ReadingSettingsContext = createContext<ReadingSettingsContextValue | null>(null);

export interface ReadingSettingsProviderProps {
  readonly children: ReactNode;
  readonly initialTheme?: ReadingTheme;
  readonly initialFontFamily?: ReadingFontFamily;
  readonly initialFontSize?: ReadingFontSize;
  readonly initialZenMode?: boolean;
}

const ReadingSettingsInternalProvider: FC<ReadingSettingsProviderProps> = ({
  children,
  initialTheme,
  initialFontFamily,
  initialFontSize,
  initialZenMode,
}) => {
  const [theme, setThemeState] = useState<ReadingTheme>(() => {
    if (initialTheme) return initialTheme;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'sepia') return saved;
      } catch {
        // Ignore storage error
      }
    }
    return 'light';
  });

  const [fontFamily, setFontFamilyState] = useState<ReadingFontFamily>(() => {
    if (initialFontFamily) return initialFontFamily;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_font_family');
        if (saved === 'serif' || saved === 'sans') return saved;
      } catch {
        // Ignore storage error
      }
    }
    return 'serif';
  });

  const [fontSize, setFontSizeState] = useState<ReadingFontSize>(() => {
    if (initialFontSize) return initialFontSize;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_font_size');
        if (saved === 'sm' || saved === 'base' || saved === 'lg' || saved === 'xl') return saved;
      } catch {
        // Ignore storage error
      }
    }
    return 'base';
  });

  const [isZenMode, setZenModeState] = useState<boolean>(() => {
    if (initialZenMode !== undefined) return initialZenMode;
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('lu_zen_mode') === 'true';
      } catch {
        // Ignore storage error
      }
    }
    return false;
  });

  const themeRef = useRef(theme);
  const fontSizeRef = useRef(fontSize);
  const isZenModeRef = useRef(isZenMode);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    isZenModeRef.current = isZenMode;
  }, [isZenMode]);

  const setTheme = useCallback((nextTheme: ReadingTheme) => {
    themeRef.current = nextTheme;
    setThemeState(nextTheme);
    try {
      localStorage.setItem('lu_reading_theme', nextTheme);
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: nextTheme }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ReadingTheme = themeRef.current === 'dark' ? 'light' : 'dark';
    themeRef.current = next;
    setThemeState(next);
    try {
      localStorage.setItem('lu_reading_theme', next);
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: next }));
    }
  }, []);

  // Đồng bộ class 'dark' và attribute 'data-theme' trên <html> (document.documentElement)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.removeAttribute('data-theme');
    } else if (theme === 'sepia') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'sepia');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  // Lắng nghe sự kiện lu_reading_theme_change nếu được kích hoạt từ nơi khác
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ReadingTheme>;
      if (custom.detail === 'light' || custom.detail === 'dark' || custom.detail === 'sepia') {
        themeRef.current = custom.detail;
        setThemeState(custom.detail);
      }
    };
    window.addEventListener('lu_reading_theme_change', handler);
    return () => window.removeEventListener('lu_reading_theme_change', handler);
  }, []);

  const setFontFamily = useCallback((font: ReadingFontFamily) => {
    setFontFamilyState(font);
    try {
      localStorage.setItem('lu_reading_font_family', font);
    } catch {
      // Ignore
    }
  }, []);

  const toggleFontFamily = useCallback(() => {
    setFontFamilyState((prev) => {
      const next = prev === 'serif' ? 'sans' : 'serif';
      try {
        localStorage.setItem('lu_reading_font_family', next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const setFontSize = useCallback((size: ReadingFontSize) => {
    fontSizeRef.current = size;
    setFontSizeState(size);
    try {
      localStorage.setItem('lu_reading_font_size', size);
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<ReadingFontSize>('lu_reading_font_size_change', { detail: size }),
      );
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    const idx = FONT_SIZE_LEVELS.indexOf(fontSizeRef.current);
    if (idx >= 0 && idx < FONT_SIZE_LEVELS.length - 1) {
      const next = FONT_SIZE_LEVELS[idx + 1];
      if (next) {
        fontSizeRef.current = next;
        setFontSizeState(next);
        try {
          localStorage.setItem('lu_reading_font_size', next);
        } catch {
          // Ignore
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent<ReadingFontSize>('lu_reading_font_size_change', { detail: next }),
          );
        }
      }
    }
  }, []);

  const decreaseFontSize = useCallback(() => {
    const idx = FONT_SIZE_LEVELS.indexOf(fontSizeRef.current);
    if (idx > 0) {
      const next = FONT_SIZE_LEVELS[idx - 1];
      if (next) {
        fontSizeRef.current = next;
        setFontSizeState(next);
        try {
          localStorage.setItem('lu_reading_font_size', next);
        } catch {
          // Ignore
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent<ReadingFontSize>('lu_reading_font_size_change', { detail: next }),
          );
        }
      }
    }
  }, []);

  // Đồng bộ ngược khi Island Quick Reader Controls thay đổi fontScale
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ReadingFontSize>;
      const tier = custom.detail;
      if (tier === 'sm' || tier === 'base' || tier === 'lg' || tier === 'xl') {
        fontSizeRef.current = tier;
        setFontSizeState((prev) => (prev === tier ? prev : tier));
      }
    };
    window.addEventListener('lu_island_font_scale_to_size', handler);
    return () => window.removeEventListener('lu_island_font_scale_to_size', handler);
  }, []);

  const setZenMode = useCallback((zen: boolean) => {
    isZenModeRef.current = zen;
    setZenModeState(zen);
    try {
      localStorage.setItem('lu_zen_mode', String(zen));
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<boolean>('lu_zen_mode_change', { detail: zen }));
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    const next = !isZenModeRef.current;
    isZenModeRef.current = next;
    setZenModeState(next);
    try {
      localStorage.setItem('lu_zen_mode', String(next));
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<boolean>('lu_zen_mode_change', { detail: next }));
    }
  }, []);

  // Đồng bộ chế độ tập trung Zen từ IslandContext
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<boolean>;
      if (typeof custom.detail === 'boolean') {
        isZenModeRef.current = custom.detail;
        setZenModeState((prev) => (prev === custom.detail ? prev : custom.detail));
      }
    };
    window.addEventListener('lu_zen_mode_change', handler);
    return () => window.removeEventListener('lu_zen_mode_change', handler);
  }, []);

  // Đồng bộ thuộc tính data-zen-mode và data-focus-mode lên document.body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isZenMode) {
      document.body.setAttribute('data-zen-mode', 'true');
      document.body.setAttribute('data-focus-mode', 'true');
    } else {
      document.body.removeAttribute('data-zen-mode');
      document.body.removeAttribute('data-focus-mode');
    }
    return () => {
      document.body.removeAttribute('data-zen-mode');
      document.body.removeAttribute('data-focus-mode');
    };
  }, [isZenMode]);

  const typographyClasses = useMemo(() => {
    const fontClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans';
    const sizeClass = FONT_SIZE_CLASSES[fontSize];
    return cn(fontClass, sizeClass);
  }, [fontFamily, fontSize]);

  const value = useMemo<ReadingSettingsContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      fontFamily,
      setFontFamily,
      toggleFontFamily,
      fontSize,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      isZenMode,
      setZenMode,
      toggleZenMode,
      typographyClasses,
    }),
    [
      theme,
      setTheme,
      toggleTheme,
      fontFamily,
      setFontFamily,
      toggleFontFamily,
      fontSize,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      isZenMode,
      setZenMode,
      toggleZenMode,
      typographyClasses,
    ],
  );

  return (
    <ReadingSettingsContext.Provider value={value}>{children}</ReadingSettingsContext.Provider>
  );
};

export const ReadingSettingsProvider: FC<ReadingSettingsProviderProps> = ({
  children,
  ...props
}) => {
  const existing = useContext(ReadingSettingsContext);
  if (existing) {
    return <>{children}</>;
  }
  return <ReadingSettingsInternalProvider {...props}>{children}</ReadingSettingsInternalProvider>;
};

export function useReadingSettings(): ReadingSettingsContextValue {
  const context = useContext(ReadingSettingsContext);
  return context ?? DEFAULT_READING_SETTINGS;
}

export default ReadingSettingsProvider;
