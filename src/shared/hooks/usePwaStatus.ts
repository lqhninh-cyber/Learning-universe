import { useSyncExternalStore } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: readonly string[];
  readonly userChoice: Promise<{
    readonly outcome: 'accepted' | 'dismissed';
    readonly platform: string;
  }>;
  prompt: () => Promise<void>;
}

export interface PwaStatusSnapshot {
  readonly isOnline: boolean;
  readonly canInstall: boolean;
  readonly isStandalone: boolean;
}

let deferredPromptEvent: BeforeInstallPromptEvent | null = null;
let listenersInitialized = false;
const subscribers = new Set<() => void>();

function computeStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

let currentSnapshot: PwaStatusSnapshot = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
  canInstall: false,
  isStandalone: computeStandalone(),
};

function emitChange(): void {
  const next: PwaStatusSnapshot = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
    canInstall: deferredPromptEvent !== null,
    isStandalone: computeStandalone(),
  };
  if (
    next.isOnline === currentSnapshot.isOnline &&
    next.canInstall === currentSnapshot.canInstall &&
    next.isStandalone === currentSnapshot.isStandalone
  ) {
    return;
  }
  currentSnapshot = next;
  for (const cb of subscribers) {
    cb();
  }
}

function ensurePwaListeners(): void {
  if (listenersInitialized || typeof window === 'undefined') return;
  listenersInitialized = true;

  window.addEventListener('online', emitChange);
  window.addEventListener('offline', emitChange);
  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferredPromptEvent = event as BeforeInstallPromptEvent;
    emitChange();
  });
  window.addEventListener('appinstalled', () => {
    deferredPromptEvent = null;
    emitChange();
  });
}

function subscribePwaStatus(callback: () => void): () => void {
  ensurePwaListeners();
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getPwaSnapshot(): PwaStatusSnapshot {
  ensurePwaListeners();
  const liveOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  if (liveOnline !== currentSnapshot.isOnline) {
    currentSnapshot = {
      ...currentSnapshot,
      isOnline: liveOnline,
    };
  }
  return currentSnapshot;
}

const SERVER_SNAPSHOT: PwaStatusSnapshot = {
  isOnline: true,
  canInstall: false,
  isStandalone: false,
};

function getServerPwaSnapshot(): PwaStatusSnapshot {
  return SERVER_SNAPSHOT;
}

export async function triggerPwaInstallPrompt(): Promise<boolean> {
  if (!deferredPromptEvent) return false;
  const promptEvt = deferredPromptEvent;
  deferredPromptEvent = null;
  emitChange();
  try {
    await promptEvt.prompt();
    const choice = await promptEvt.userChoice;
    return choice.outcome === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Hỗ trợ kiểm thử đơn vị đặt lại trạng thái PWA giữa các test case.
 */
export function resetPwaStatusForTests(): void {
  deferredPromptEvent = null;
  emitChange();
}

export function usePwaStatus(): PwaStatusSnapshot & {
  readonly promptInstall: () => Promise<boolean>;
} {
  const snapshot = useSyncExternalStore(subscribePwaStatus, getPwaSnapshot, getServerPwaSnapshot);
  return {
    ...snapshot,
    promptInstall: triggerPwaInstallPrompt,
  };
}

export function registerAcademicServiceWorker(): void {
  if (
    !import.meta.env.PROD ||
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Bỏ qua êm ái nếu trình duyệt chặn Service Worker ở chế độ ẩn danh
    });
  });
}
