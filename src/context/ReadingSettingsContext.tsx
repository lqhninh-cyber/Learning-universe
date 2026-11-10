import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { cn } from '@/shared/lib/cn';

export type ReadingTheme = 'light' | 'dark';
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
  sm: 'text-[15px] leading-relaxed',
  base: 'text-[17px] leading-relaxed',
  lg: 'text-[19px] leading-relaxed',
  xl: 'text-[21px] leading-loose',
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
  typographyClasses: 'font-serif text-[17px] leading-relaxed',
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
        if (saved === 'dark' || saved === 'light') return saved;
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

  const setTheme = useCallback((nextTheme: ReadingTheme) => {
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
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('lu_reading_theme', next);
      } catch {
        // Ignore
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: next }));
      }
      return next;
    });
  }, []);

  // Đồng bộ class 'dark' trên <html> (document.documentElement)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Lắng nghe sự kiện lu_reading_theme_change nếu được kích hoạt từ nơi khác
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ReadingTheme>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
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
    setFontSizeState(size);
    try {
      localStorage.setItem('lu_reading_font_size', size);
    } catch {
      // Ignore
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSizeState((prev) => {
      const idx = FONT_SIZE_LEVELS.indexOf(prev);
      if (idx >= 0 && idx < FONT_SIZE_LEVELS.length - 1) {
        const next = FONT_SIZE_LEVELS[idx + 1];
        if (next) {
          try {
            localStorage.setItem('lu_reading_font_size', next);
          } catch {
            // Ignore
          }
          return next;
        }
      }
      return prev;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeState((prev) => {
      const idx = FONT_SIZE_LEVELS.indexOf(prev);
      if (idx > 0) {
        const next = FONT_SIZE_LEVELS[idx - 1];
        if (next) {
          try {
            localStorage.setItem('lu_reading_font_size', next);
          } catch {
            // Ignore
          }
          return next;
        }
      }
      return prev;
    });
  }, []);

  const setZenMode = useCallback((zen: boolean) => {
    setZenModeState(zen);
    try {
      localStorage.setItem('lu_zen_mode', String(zen));
    } catch {
      // Ignore
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    setZenModeState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lu_zen_mode', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
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
