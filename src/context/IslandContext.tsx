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
import type { ReadingFontSize } from '@/context/ReadingSettingsContext';
import {
  clampFontScale,
  FONT_SCALE_DEFAULT,
  FONT_SCALE_STEP,
  fontScaleToReadingSize,
  readingSizeToFontScale,
  resolveActiveSubjectFromPath,
  type IslandSubjectMeta,
} from './island-helpers';

export type IslandNoticeType = 'success' | 'info' | 'timer';

export interface IslandNoticePayload {
  readonly text: string;
  readonly type?: IslandNoticeType;
  readonly accentColor?: string;
}

export interface IslandNoticeState {
  readonly id: number;
  readonly text: string;
  readonly type: IslandNoticeType;
  readonly accentColor?: string;
}

export interface IslandReaderSettings {
  readonly fontScale: number;
  readonly eyeComfortWarmth: boolean;
  readonly isDarkMode: boolean;
  readonly isZenMode: boolean;
}

export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface IslandPomodoroState {
  readonly status: PomodoroStatus;
  readonly totalSeconds: number;
  readonly remainingSeconds: number;
  readonly presetLabel: string;
}

export interface IslandContextValue {
  readonly activeNotice: IslandNoticeState | null;
  readonly triggerIslandNotice: (payload: IslandNoticePayload) => void;
  readonly dismissIslandNotice: () => void;
  readonly readerSettings: IslandReaderSettings;
  readonly setFontScale: (scale: number) => void;
  readonly increaseFontScale: () => void;
  readonly decreaseFontScale: () => void;
  readonly setEyeComfortWarmth: (enabled: boolean) => void;
  readonly toggleEyeComfortWarmth: () => void;
  readonly setDarkMode: (dark: boolean) => void;
  readonly toggleDarkMode: () => void;
  readonly setZenMode: (zen: boolean) => void;
  readonly toggleZenMode: () => void;
  readonly activeSubject: IslandSubjectMeta | null;
  readonly routePathname: string;
  readonly setRoutePathname: (pathname: string) => void;
  readonly pomodoro: IslandPomodoroState;
  readonly startPomodoro: (minutes: number, presetLabel?: string) => void;
  readonly addPomodoroMinutes: (deltaMinutes: number) => void;
  readonly pausePomodoro: () => void;
  readonly resumePomodoro: () => void;
  readonly resetPomodoro: () => void;
}

const FONT_SCALE_STORAGE_KEY = 'lu_island_font_scale';
const EYE_COMFORT_STORAGE_KEY = 'lu_eye_comfort_warmth';
const THEME_STORAGE_KEY = 'lu_reading_theme';
const ZEN_MODE_STORAGE_KEY = 'lu_zen_mode';
const NOTICE_AUTO_DISMISS_MS = 2200;

const DEFAULT_POMODORO: IslandPomodoroState = {
  status: 'idle',
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  presetLabel: 'Tiêu chuẩn',
};

const DEFAULT_ISLAND_CONTEXT: IslandContextValue = {
  activeNotice: null,
  triggerIslandNotice: () => {},
  dismissIslandNotice: () => {},
  readerSettings: {
    fontScale: FONT_SCALE_DEFAULT,
    eyeComfortWarmth: false,
    isDarkMode: false,
    isZenMode: false,
  },
  setFontScale: () => {},
  increaseFontScale: () => {},
  decreaseFontScale: () => {},
  setEyeComfortWarmth: () => {},
  toggleEyeComfortWarmth: () => {},
  setDarkMode: () => {},
  toggleDarkMode: () => {},
  setZenMode: () => {},
  toggleZenMode: () => {},
  activeSubject: null,
  routePathname: '/',
  setRoutePathname: () => {},
  pomodoro: DEFAULT_POMODORO,
  startPomodoro: () => {},
  addPomodoroMinutes: () => {},
  pausePomodoro: () => {},
  resumePomodoro: () => {},
  resetPomodoro: () => {},
};

const IslandContext = createContext<IslandContextValue | null>(null);

function syncReadingFontSizeFromScale(scale: number): void {
  const mappedSize = fontScaleToReadingSize(scale);
  try {
    localStorage.setItem('lu_reading_font_size', mappedSize);
  } catch {
    // Bỏ qua lỗi lưu trữ cục bộ
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-reading-size', mappedSize);
    document.documentElement.style.setProperty('--lu-reading-scale', String(scale));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<ReadingFontSize>('lu_island_font_scale_to_size', { detail: mappedSize }),
    );
  }
}

export interface IslandProviderProps {
  readonly children: ReactNode;
  readonly initialPathname?: string;
}

const IslandInternalProvider: FC<IslandProviderProps> = ({ children, initialPathname }) => {
  const [routePathname, setRoutePathnameState] = useState<string>(() => {
    if (initialPathname) return initialPathname;
    if (typeof window !== 'undefined') return window.location.pathname || '/';
    return '/';
  });

  const [activeNotice, setActiveNotice] = useState<IslandNoticeState | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const noticeCounterRef = useRef(0);

  const [fontScale, setFontScaleState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedScale = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
        if (savedScale !== null) {
          const parsed = Number.parseFloat(savedScale);
          if (Number.isFinite(parsed)) {
            return clampFontScale(parsed);
          }
        }
        const savedTier = localStorage.getItem('lu_reading_font_size');
        if (
          savedTier === 'sm' ||
          savedTier === 'base' ||
          savedTier === 'lg' ||
          savedTier === 'xl'
        ) {
          return readingSizeToFontScale(savedTier);
        }
      } catch {
        // Bỏ qua lỗi lưu trữ cục bộ
      }
    }
    return FONT_SCALE_DEFAULT;
  });

  const [eyeComfortWarmth, setEyeComfortWarmthState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(EYE_COMFORT_STORAGE_KEY) === 'true';
      } catch {
        // Bỏ qua lỗi lưu trữ cục bộ
      }
    }
    return false;
  });

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
      } catch {
        // Bỏ qua lỗi lưu trữ cục bộ
      }
    }
    return false;
  });

  const [isZenMode, setIsZenModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(ZEN_MODE_STORAGE_KEY) === 'true';
      } catch {
        // Bỏ qua lỗi lưu trữ cục bộ
      }
    }
    return false;
  });

  const isDarkModeRef = useRef(isDarkMode);
  const isZenModeRef = useRef(isZenMode);
  const eyeComfortWarmthRef = useRef(eyeComfortWarmth);

  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

  useEffect(() => {
    isZenModeRef.current = isZenMode;
  }, [isZenMode]);

  useEffect(() => {
    eyeComfortWarmthRef.current = eyeComfortWarmth;
  }, [eyeComfortWarmth]);

  const [pomodoro, setPomodoro] = useState<IslandPomodoroState>(DEFAULT_POMODORO);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const dismissIslandNotice = useCallback(() => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    setActiveNotice(null);
  }, []);

  const triggerIslandNotice = useCallback((payload: IslandNoticePayload) => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    noticeCounterRef.current += 1;
    setActiveNotice({
      id: noticeCounterRef.current,
      text: payload.text,
      type: payload.type ?? 'info',
      accentColor: payload.accentColor,
    });
    if (typeof window !== 'undefined') {
      noticeTimerRef.current = window.setTimeout(() => {
        noticeTimerRef.current = null;
        setActiveNotice(null);
      }, NOTICE_AUTO_DISMISS_MS);
    }
  }, []);

  const applyFontScale = useCallback((nextRaw: number) => {
    const next = clampFontScale(nextRaw);
    setFontScaleState(next);
    try {
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(next));
    } catch {
      // Bỏ qua lỗi lưu trữ cục bộ
    }
    syncReadingFontSizeFromScale(next);
  }, []);

  const increaseFontScale = useCallback(() => {
    applyFontScale(fontScale + FONT_SCALE_STEP);
  }, [applyFontScale, fontScale]);

  const decreaseFontScale = useCallback(() => {
    applyFontScale(fontScale - FONT_SCALE_STEP);
  }, [applyFontScale, fontScale]);

  // Đồng bộ hai chiều khi cỡ chữ được chỉnh từ ReadingSettingsContext hoặc HeaderAccountMenu
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleReadingSizeEvent = (event: Event) => {
      const custom = event as CustomEvent<ReadingFontSize>;
      const tier = custom.detail;
      if (tier === 'sm' || tier === 'base' || tier === 'lg' || tier === 'xl') {
        const mapped = readingSizeToFontScale(tier);
        setFontScaleState((prev) => {
          if (fontScaleToReadingSize(prev) === tier) return prev;
          try {
            localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(mapped));
          } catch {
            // Bỏ qua lỗi storage
          }
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-reading-size', tier);
            document.documentElement.style.setProperty('--lu-reading-scale', String(mapped));
          }
          return mapped;
        });
      }
    };
    window.addEventListener('lu_reading_font_size_change', handleReadingSizeEvent);
    return () => window.removeEventListener('lu_reading_font_size_change', handleReadingSizeEvent);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--lu-reading-scale', String(fontScale));
  }, [fontScale]);

  const setEyeComfortWarmth = useCallback((enabled: boolean) => {
    eyeComfortWarmthRef.current = enabled;
    setEyeComfortWarmthState(enabled);
    try {
      localStorage.setItem(EYE_COMFORT_STORAGE_KEY, String(enabled));
    } catch {
      // Bỏ qua lỗi storage
    }
  }, []);

  const toggleEyeComfortWarmth = useCallback(() => {
    const next = !eyeComfortWarmthRef.current;
    eyeComfortWarmthRef.current = next;
    setEyeComfortWarmthState(next);
    try {
      localStorage.setItem(EYE_COMFORT_STORAGE_KEY, String(next));
    } catch {
      // Bỏ qua lỗi storage
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (eyeComfortWarmth) {
      document.documentElement.setAttribute('data-eye-comfort', 'true');
    } else {
      document.documentElement.removeAttribute('data-eye-comfort');
    }
    return () => {
      document.documentElement.removeAttribute('data-eye-comfort');
    };
  }, [eyeComfortWarmth]);

  const setDarkMode = useCallback((dark: boolean) => {
    isDarkModeRef.current = dark;
    setIsDarkModeState(dark);
    const nextTheme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Bỏ qua lỗi storage
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: nextTheme }));
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !isDarkModeRef.current;
    isDarkModeRef.current = next;
    setIsDarkModeState(next);
    const nextTheme = next ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Bỏ qua lỗi storage
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: nextTheme }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleThemeEvent = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail === 'dark' || custom.detail === 'light' || custom.detail === 'sepia') {
        const nextDark = custom.detail === 'dark';
        isDarkModeRef.current = nextDark;
        setIsDarkModeState(nextDark);
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeEvent);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeEvent);
  }, []);

  const setZenMode = useCallback((zen: boolean) => {
    isZenModeRef.current = zen;
    setIsZenModeState(zen);
    try {
      localStorage.setItem(ZEN_MODE_STORAGE_KEY, String(zen));
    } catch {
      // Bỏ qua lỗi storage
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<boolean>('lu_zen_mode_change', { detail: zen }));
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    const next = !isZenModeRef.current;
    isZenModeRef.current = next;
    setIsZenModeState(next);
    try {
      localStorage.setItem(ZEN_MODE_STORAGE_KEY, String(next));
    } catch {
      // Bỏ qua lỗi storage
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<boolean>('lu_zen_mode_change', { detail: next }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleZenEvent = (event: Event) => {
      const custom = event as CustomEvent<boolean>;
      if (typeof custom.detail === 'boolean') {
        isZenModeRef.current = custom.detail;
        setIsZenModeState(custom.detail);
      }
    };
    window.addEventListener('lu_zen_mode_change', handleZenEvent);
    return () => window.removeEventListener('lu_zen_mode_change', handleZenEvent);
  }, []);

  // Bộ đếm Pomodoro chạy ngầm bền vững khi người học chuyển trang
  useEffect(() => {
    if (pomodoro.status !== 'running' || typeof window === 'undefined') {
      return;
    }

    const timer = window.setInterval(() => {
      setPomodoro((prev) => {
        if (prev.status !== 'running') return prev;
        if (prev.remainingSeconds <= 1) {
          queueMicrotask(() => {
            triggerIslandNotice({
              text: `Hoàn thành nhịp học ${prev.presetLabel}! Hãy nghỉ ngơi vài phút.`,
              type: 'timer',
            });
          });
          return {
            ...prev,
            status: 'idle',
            remainingSeconds: prev.totalSeconds,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [pomodoro.status, triggerIslandNotice]);

  const startPomodoro = useCallback(
    (minutes: number, presetLabel = 'Tùy chỉnh') => {
      const safeMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
      const totalSeconds = safeMinutes * 60;
      setPomodoro({
        status: 'running',
        totalSeconds,
        remainingSeconds: totalSeconds,
        presetLabel,
      });
      triggerIslandNotice({
        text: `⏳ Bắt đầu nhịp học tập ${safeMinutes} phút (${presetLabel})`,
        type: 'timer',
      });
    },
    [triggerIslandNotice],
  );

  const addPomodoroMinutes = useCallback(
    (deltaMinutes: number) => {
      const deltaSeconds = Math.round(deltaMinutes * 60);
      if (deltaSeconds <= 0) return;
      setPomodoro((prev) => {
        if (prev.status === 'idle') return prev;
        return {
          ...prev,
          totalSeconds: prev.totalSeconds + deltaSeconds,
          remainingSeconds: prev.remainingSeconds + deltaSeconds,
        };
      });
      triggerIslandNotice({
        text: `⏳ Đã cộng thêm ${deltaMinutes} phút vào nhịp học tập`,
        type: 'timer',
      });
    },
    [triggerIslandNotice],
  );

  const pausePomodoro = useCallback(() => {
    setPomodoro((prev) => (prev.status === 'running' ? { ...prev, status: 'paused' } : prev));
  }, []);

  const resumePomodoro = useCallback(() => {
    setPomodoro((prev) => (prev.status === 'paused' ? { ...prev, status: 'running' } : prev));
  }, []);

  const resetPomodoro = useCallback(() => {
    setPomodoro(DEFAULT_POMODORO);
  }, []);

  const setRoutePathname = useCallback((nextPath: string) => {
    setRoutePathnameState((prev) => (prev === nextPath ? prev : nextPath));
  }, []);

  const activeSubject = useMemo(() => resolveActiveSubjectFromPath(routePathname), [routePathname]);

  const readerSettings = useMemo<IslandReaderSettings>(
    () => ({ fontScale, eyeComfortWarmth, isDarkMode, isZenMode }),
    [fontScale, eyeComfortWarmth, isDarkMode, isZenMode],
  );

  const value = useMemo<IslandContextValue>(
    () => ({
      activeNotice,
      triggerIslandNotice,
      dismissIslandNotice,
      readerSettings,
      setFontScale: applyFontScale,
      increaseFontScale,
      decreaseFontScale,
      setEyeComfortWarmth,
      toggleEyeComfortWarmth,
      setDarkMode,
      toggleDarkMode,
      setZenMode,
      toggleZenMode,
      activeSubject,
      routePathname,
      setRoutePathname,
      pomodoro,
      startPomodoro,
      addPomodoroMinutes,
      pausePomodoro,
      resumePomodoro,
      resetPomodoro,
    }),
    [
      activeNotice,
      triggerIslandNotice,
      dismissIslandNotice,
      readerSettings,
      applyFontScale,
      increaseFontScale,
      decreaseFontScale,
      setEyeComfortWarmth,
      toggleEyeComfortWarmth,
      setDarkMode,
      toggleDarkMode,
      setZenMode,
      toggleZenMode,
      activeSubject,
      routePathname,
      setRoutePathname,
      pomodoro,
      startPomodoro,
      addPomodoroMinutes,
      pausePomodoro,
      resumePomodoro,
      resetPomodoro,
    ],
  );

  return <IslandContext.Provider value={value}>{children}</IslandContext.Provider>;
};

export const IslandProvider: FC<IslandProviderProps> = ({ children, ...props }) => {
  const existing = useContext(IslandContext);
  if (existing) {
    return <>{children}</>;
  }
  return <IslandInternalProvider {...props}>{children}</IslandInternalProvider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useIsland(): IslandContextValue {
  const ctx = useContext(IslandContext);
  return ctx ?? DEFAULT_ISLAND_CONTEXT;
}

export default IslandProvider;
