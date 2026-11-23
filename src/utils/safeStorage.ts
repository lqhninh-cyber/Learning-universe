import type { StateStorage } from 'zustand/middleware';

/** Ngưỡng quota tham chiếu của localStorage trên trình duyệt phổ biến (5 MB = 5120 KB). */
export const LOCAL_STORAGE_QUOTA_KB = 5120;

export const STORAGE_KEYS = {
  learningProgress: 'learning-universe-progress-v1',
  workspace: 'learning-universe-workspace-v1',
  examBuilder: 'learning-universe-exam-builder-v1',
  mathInk: 'learning-universe-math-ink-v1',
} as const;

export type StorageWarningReason = 'quota' | 'security' | 'unknown';

export interface StorageWarningEvent {
  readonly reason: StorageWarningReason;
  readonly key: string;
  readonly usedKB: number;
  readonly quotaKB: number;
  readonly message: string;
}

export interface StorageUsageBreakdown {
  readonly totalBytes: number;
  readonly totalKB: number;
  readonly quotaKB: number;
  readonly percentUsed: number;
  readonly progressKB: number;
  readonly workspaceKB: number;
  readonly mathInkKB: number;
  readonly examBuilderKB: number;
  readonly otherKB: number;
}

type StorageWarningListener = (event: StorageWarningEvent) => void;

const warningListeners = new Set<StorageWarningListener>();

export function onStorageWarning(listener: StorageWarningListener): () => void {
  warningListeners.add(listener);
  return () => {
    warningListeners.delete(listener);
  };
}

export function emitStorageWarning(event: StorageWarningEvent): void {
  for (const listener of warningListeners) {
    try {
      listener(event);
    } catch {
      // Bảo vệ event bus khỏi lỗi trong listener
    }
  }
}

export function isQuotaExceededError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const candidate = err as { readonly name?: string; readonly code?: number };
  if (
    candidate.name === 'QuotaExceededError' ||
    candidate.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    candidate.name === 'QUOTA_EXCEEDED_ERR'
  ) {
    return true;
  }
  return candidate.code === 22 || candidate.code === 1014;
}

export function isSecurityStorageError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const candidate = err as { readonly name?: string };
  return candidate.name === 'SecurityError';
}

function measureEntryBytes(key: string, value: string): number {
  // Chuỗi JS lưu dạng UTF-16 (2 bytes/ký tự)
  return (key.length + value.length) * 2;
}

function bytesToKB(bytes: number): number {
  return Math.round((bytes / 1024) * 10) / 10;
}

export function estimateLocalStorageUsage(
  storage?: Pick<Storage, 'length' | 'key' | 'getItem'>,
): StorageUsageBreakdown {
  const empty: StorageUsageBreakdown = {
    totalBytes: 0,
    totalKB: 0,
    quotaKB: LOCAL_STORAGE_QUOTA_KB,
    percentUsed: 0,
    progressKB: 0,
    workspaceKB: 0,
    mathInkKB: 0,
    examBuilderKB: 0,
    otherKB: 0,
  };

  const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!target) return empty;

  let totalBytes = 0;
  let progressBytes = 0;
  let workspaceBytes = 0;
  let mathInkBytes = 0;
  let examBuilderBytes = 0;
  let otherBytes = 0;

  try {
    const count = target.length;
    for (let i = 0; i < count; i += 1) {
      const k = target.key(i);
      if (k === null) continue;
      const v = target.getItem(k) ?? '';
      const bytes = measureEntryBytes(k, v);
      totalBytes += bytes;

      if (k === STORAGE_KEYS.learningProgress) {
        progressBytes += bytes;
      } else if (k === STORAGE_KEYS.workspace) {
        workspaceBytes += bytes;
      } else if (k === STORAGE_KEYS.mathInk) {
        mathInkBytes += bytes;
      } else if (k === STORAGE_KEYS.examBuilder) {
        examBuilderBytes += bytes;
      } else {
        otherBytes += bytes;
      }
    }
  } catch {
    return empty;
  }

  const totalKB = bytesToKB(totalBytes);
  const percentUsed = Math.min(100, Math.round((totalKB / LOCAL_STORAGE_QUOTA_KB) * 1000) / 10);

  return {
    totalBytes,
    totalKB,
    quotaKB: LOCAL_STORAGE_QUOTA_KB,
    percentUsed,
    progressKB: bytesToKB(progressBytes),
    workspaceKB: bytesToKB(workspaceBytes),
    mathInkKB: bytesToKB(mathInkBytes),
    examBuilderKB: bytesToKB(examBuilderBytes),
    otherKB: bytesToKB(otherBytes),
  };
}

function handleStorageFailure(key: string, err: unknown): void {
  const usage = estimateLocalStorageUsage();
  if (isQuotaExceededError(err)) {
    emitStorageWarning({
      reason: 'quota',
      key,
      usedKB: usage.totalKB,
      quotaKB: LOCAL_STORAGE_QUOTA_KB,
      message: `Bộ nhớ cục bộ gần đầy (${Math.round(usage.totalKB)} KB / ${LOCAL_STORAGE_QUOTA_KB} KB). Hãy xuất bản sao lưu JSON trong Hồ sơ học tập.`,
    });
    return;
  }
  if (isSecurityStorageError(err)) {
    emitStorageWarning({
      reason: 'security',
      key,
      usedKB: usage.totalKB,
      quotaKB: LOCAL_STORAGE_QUOTA_KB,
      message:
        'Trình duyệt đang chặn ghi localStorage (chế độ ẩn danh/bảo mật). Dữ liệu sẽ chỉ lưu tạm trong phiên hiện tại.',
    });
    return;
  }
  emitStorageWarning({
    reason: 'unknown',
    key,
    usedKB: usage.totalKB,
    quotaKB: LOCAL_STORAGE_QUOTA_KB,
    message: 'Không thể ghi dữ liệu cục bộ vào trình duyệt. Vui lòng thử xuất bản sao lưu JSON.',
  });
}

export interface SyncSafeStorage extends StateStorage {
  readonly getItem: (name: string) => string | null;
  readonly setItem: (name: string, value: string) => void;
  readonly removeItem: (name: string) => void;
}

/**
 * Adapter lưu trữ an toàn chuẩn Zustand `StateStorage`:
 * - Mọi thao tác đều bọc try/catch, bắt riêng QuotaExceededError và SecurityError.
 * - Tuyệt đối không ném ngoại lệ chưa bắt làm hỏng trải nghiệm học hay ghi đè mất tiến độ.
 */
export const safeStorage: SyncSafeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch (err) {
      if (isSecurityStorageError(err)) {
        handleStorageFailure(name, err);
      }
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      handleStorageFailure(name, err);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch (err) {
      if (isSecurityStorageError(err)) {
        handleStorageFailure(name, err);
      }
    }
  },
};
