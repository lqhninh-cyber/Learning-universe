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
import { useWorkspaceStore } from '@/features/workspace';

export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface IslandPomodoroState {
  readonly status: PomodoroStatus;
  readonly totalSeconds: number;
  readonly remainingSeconds: number;
  readonly presetLabel: string;
}

export type SanctuaryBreakStatus = 'idle' | 'running' | 'paused' | 'done';

export type SanctuaryBreakDuration = 5 | 10;

export interface SanctuaryBreakState {
  readonly status: SanctuaryBreakStatus;
  readonly durationMinutes: SanctuaryBreakDuration;
  readonly totalSeconds: number;
  readonly remainingSeconds: number;
}

export interface PomodoroHostNoticePayload {
  readonly text: string;
  readonly type?: 'success' | 'info' | 'timer';
  readonly accentColor?: string;
}

export interface PomodoroHostBridge {
  readonly getRoutePathname: () => string;
  readonly triggerIslandNotice: (payload: PomodoroHostNoticePayload) => void;
}

export interface PomodoroStateContextValue {
  readonly pomodoro: IslandPomodoroState;
  readonly pomodoroBreakPrompt: boolean;
  readonly breakTimer: SanctuaryBreakState;
}

export interface PomodoroActionsContextValue {
  readonly startPomodoro: (minutes: number, presetLabel?: string) => void;
  readonly addPomodoroMinutes: (deltaMinutes: number) => void;
  readonly pausePomodoro: () => void;
  readonly resumePomodoro: () => void;
  readonly resetPomodoro: () => void;
  readonly dismissPomodoroBreakPrompt: () => void;
  readonly startBreakTimer: (minutes?: SanctuaryBreakDuration) => void;
  readonly setBreakDuration: (minutes: SanctuaryBreakDuration) => void;
  readonly pauseBreakTimer: () => void;
  readonly resumeBreakTimer: () => void;
  readonly resetBreakTimer: () => void;
  readonly registerHost: (bridge: PomodoroHostBridge | null) => void;
}

export type PomodoroContextValue = PomodoroStateContextValue &
  Omit<PomodoroActionsContextValue, 'registerHost'>;

export const POMODORO_RETURN_PATH_KEY = 'lu_pomodoro_return_path';
export const POMODORO_BREAK_AUTOSTART_KEY = 'lu_pomodoro_break_autostart';

const DEFAULT_POMODORO: IslandPomodoroState = {
  status: 'idle',
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  presetLabel: 'Tiêu chuẩn',
};

const DEFAULT_BREAK_TIMER: SanctuaryBreakState = {
  status: 'idle',
  durationMinutes: 5,
  totalSeconds: 5 * 60,
  remainingSeconds: 5 * 60,
};

const DEFAULT_POMODORO_STATE: PomodoroStateContextValue = {
  pomodoro: DEFAULT_POMODORO,
  pomodoroBreakPrompt: false,
  breakTimer: DEFAULT_BREAK_TIMER,
};

const DEFAULT_POMODORO_ACTIONS: PomodoroActionsContextValue = {
  startPomodoro: () => {},
  addPomodoroMinutes: () => {},
  pausePomodoro: () => {},
  resumePomodoro: () => {},
  resetPomodoro: () => {},
  dismissPomodoroBreakPrompt: () => {},
  startBreakTimer: () => {},
  setBreakDuration: () => {},
  pauseBreakTimer: () => {},
  resumeBreakTimer: () => {},
  resetBreakTimer: () => {},
  registerHost: () => {},
};

const PomodoroStateContext = createContext<PomodoroStateContextValue | null>(null);
const PomodoroActionsContext = createContext<PomodoroActionsContextValue | null>(null);

export interface PomodoroProviderProps {
  readonly children: ReactNode;
}

const PomodoroInternalProvider: FC<PomodoroProviderProps> = ({ children }) => {
  const [pomodoro, setPomodoro] = useState<IslandPomodoroState>(DEFAULT_POMODORO);
  const [pomodoroBreakPrompt, setPomodoroBreakPrompt] = useState<boolean>(false);
  const [breakTimer, setBreakTimer] = useState<SanctuaryBreakState>(DEFAULT_BREAK_TIMER);

  const hostBridgeRef = useRef<PomodoroHostBridge | null>(null);

  const registerHost = useCallback((bridge: PomodoroHostBridge | null) => {
    hostBridgeRef.current = bridge;
  }, []);

  const dismissPomodoroBreakPrompt = useCallback(() => {
    setPomodoroBreakPrompt(false);
  }, []);

  // Bộ đếm Pomodoro chạy ngầm 1Hz — cô lập hoàn toàn trong PomodoroStateContext
  useEffect(() => {
    if (pomodoro.status !== 'running' || typeof window === 'undefined') {
      return;
    }

    const timer = window.setInterval(() => {
      setPomodoro((prev) => {
        if (prev.status !== 'running') return prev;
        if (prev.remainingSeconds <= 1) {
          queueMicrotask(() => {
            try {
              const currentPath =
                hostBridgeRef.current?.getRoutePathname() ||
                (typeof window !== 'undefined' ? window.location.pathname : '/');
              const isLessonPath =
                currentPath.startsWith('/bai-hoc/') ||
                /^\/(?:mon-hoc|courses)\/[^/]+\/[^/]+\/[^/]+/.test(currentPath);
              if (isLessonPath && typeof window !== 'undefined') {
                window.sessionStorage.setItem(POMODORO_RETURN_PATH_KEY, currentPath);
              }
            } catch {
              // Bỏ qua lỗi sessionStorage
            }
            useWorkspaceStore.getState().recordPomodoroCompleted();
            setPomodoroBreakPrompt(true);
            hostBridgeRef.current?.triggerIslandNotice({
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
  }, [pomodoro.status]);

  // Bộ đếm ngược giờ nghỉ giải lao (5p / 10p) cho Sảnh Thư giãn
  useEffect(() => {
    if (breakTimer.status !== 'running' || typeof window === 'undefined') {
      return;
    }

    const timer = window.setInterval(() => {
      setBreakTimer((prev) => {
        if (prev.status !== 'running') return prev;
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            status: 'done',
            remainingSeconds: 0,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [breakTimer.status]);

  const startPomodoro = useCallback((minutes: number, presetLabel = 'Tùy chỉnh') => {
    const safeMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
    const totalSeconds = safeMinutes * 60;
    setPomodoroBreakPrompt(false);
    setPomodoro({
      status: 'running',
      totalSeconds,
      remainingSeconds: totalSeconds,
      presetLabel,
    });
    hostBridgeRef.current?.triggerIslandNotice({
      text: `⏳ Bắt đầu nhịp học tập ${safeMinutes} phút (${presetLabel})`,
      type: 'timer',
    });
  }, []);

  const addPomodoroMinutes = useCallback((deltaMinutes: number) => {
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
    hostBridgeRef.current?.triggerIslandNotice({
      text: `⏳ Đã cộng thêm ${deltaMinutes} phút vào nhịp học tập`,
      type: 'timer',
    });
  }, []);

  const pausePomodoro = useCallback(() => {
    setPomodoro((prev) => (prev.status === 'running' ? { ...prev, status: 'paused' } : prev));
  }, []);

  const resumePomodoro = useCallback(() => {
    setPomodoro((prev) => (prev.status === 'paused' ? { ...prev, status: 'running' } : prev));
  }, []);

  const resetPomodoro = useCallback(() => {
    setPomodoro(DEFAULT_POMODORO);
  }, []);

  const startBreakTimer = useCallback((minutes: SanctuaryBreakDuration = 5) => {
    const totalSeconds = minutes * 60;
    try {
      window.sessionStorage.removeItem(POMODORO_BREAK_AUTOSTART_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    setBreakTimer({
      status: 'running',
      durationMinutes: minutes,
      totalSeconds,
      remainingSeconds: totalSeconds,
    });
  }, []);

  const setBreakDuration = useCallback((minutes: SanctuaryBreakDuration) => {
    const totalSeconds = minutes * 60;
    setBreakTimer({
      status: 'running',
      durationMinutes: minutes,
      totalSeconds,
      remainingSeconds: totalSeconds,
    });
  }, []);

  const pauseBreakTimer = useCallback(() => {
    setBreakTimer((prev) => (prev.status === 'running' ? { ...prev, status: 'paused' } : prev));
  }, []);

  const resumeBreakTimer = useCallback(() => {
    setBreakTimer((prev) => (prev.status === 'paused' ? { ...prev, status: 'running' } : prev));
  }, []);

  const resetBreakTimer = useCallback(() => {
    setBreakTimer(DEFAULT_BREAK_TIMER);
  }, []);

  const actionsValue = useMemo<PomodoroActionsContextValue>(
    () => ({
      startPomodoro,
      addPomodoroMinutes,
      pausePomodoro,
      resumePomodoro,
      resetPomodoro,
      dismissPomodoroBreakPrompt,
      startBreakTimer,
      setBreakDuration,
      pauseBreakTimer,
      resumeBreakTimer,
      resetBreakTimer,
      registerHost,
    }),
    [
      addPomodoroMinutes,
      dismissPomodoroBreakPrompt,
      pauseBreakTimer,
      pausePomodoro,
      registerHost,
      resetBreakTimer,
      resetPomodoro,
      resumeBreakTimer,
      resumePomodoro,
      setBreakDuration,
      startBreakTimer,
      startPomodoro,
    ],
  );

  const stateValue = useMemo<PomodoroStateContextValue>(
    () => ({
      pomodoro,
      pomodoroBreakPrompt,
      breakTimer,
    }),
    [breakTimer, pomodoro, pomodoroBreakPrompt],
  );

  return (
    <PomodoroActionsContext.Provider value={actionsValue}>
      <PomodoroStateContext.Provider value={stateValue}>{children}</PomodoroStateContext.Provider>
    </PomodoroActionsContext.Provider>
  );
};

export const PomodoroProvider: FC<PomodoroProviderProps> = ({ children }) => {
  const existing = useContext(PomodoroActionsContext);
  if (existing) {
    return <>{children}</>;
  }
  return <PomodoroInternalProvider>{children}</PomodoroInternalProvider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function usePomodoroState(): PomodoroStateContextValue {
  const ctx = useContext(PomodoroStateContext);
  return ctx ?? DEFAULT_POMODORO_STATE;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePomodoroActions(): PomodoroActionsContextValue {
  const ctx = useContext(PomodoroActionsContext);
  return ctx ?? DEFAULT_POMODORO_ACTIONS;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePomodoro(): PomodoroContextValue {
  const state = usePomodoroState();
  const actions = usePomodoroActions();
  return {
    pomodoro: state.pomodoro,
    pomodoroBreakPrompt: state.pomodoroBreakPrompt,
    breakTimer: state.breakTimer,
    startPomodoro: actions.startPomodoro,
    addPomodoroMinutes: actions.addPomodoroMinutes,
    pausePomodoro: actions.pausePomodoro,
    resumePomodoro: actions.resumePomodoro,
    resetPomodoro: actions.resetPomodoro,
    dismissPomodoroBreakPrompt: actions.dismissPomodoroBreakPrompt,
    startBreakTimer: actions.startBreakTimer,
    setBreakDuration: actions.setBreakDuration,
    pauseBreakTimer: actions.pauseBreakTimer,
    resumeBreakTimer: actions.resumeBreakTimer,
    resetBreakTimer: actions.resetBreakTimer,
  };
}
