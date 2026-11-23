import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamBuilderStore } from '@/features/exam-builder';
import { buildExerciseStorageKey, useLearningStore } from '@/features/learning';
import { useInkNotebookStore } from '@/features/math-ink';
import {
  applyBackupSnapshot,
  BACKUP_SCHEMA_VERSION,
  createBackupSnapshot,
  getBackupFilename,
  parseAndValidateBackup,
  serializeBackupSnapshot,
} from '@/utils/backupSnapshot';
import {
  clearMediaMemoryCache,
  deleteMediaAsset,
  getMediaDataUrlSync,
  isIdbMediaUri,
  resolveMediaDataUrl,
  storeMediaDataUrl,
} from '@/utils/mediaDb';
import {
  estimateLocalStorageUsage,
  isQuotaExceededError,
  LOCAL_STORAGE_QUOTA_KB,
  onStorageWarning,
  safeStorage,
  STORAGE_KEYS,
  type StorageWarningEvent,
} from '@/utils/safeStorage';

describe('safeStorage, IndexedDB mediaDb & JSON Backup Snapshot', () => {
  beforeEach(() => {
    localStorage.clear();
    clearMediaMemoryCache();
    useLearningStore.getState().resetLearningStore();
    useExamBuilderStore.getState().resetExamBuilderStore();
    useInkNotebookStore.getState().resetInkStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('bắt QuotaExceededError mà không văng lỗi chưa bắt và phát cảnh báo mềm kèm dung lượng KB / 5120 KB', () => {
    const quotaError = Object.assign(new Error('Storage quota exceeded'), {
      name: 'QuotaExceededError',
      code: 22,
    });
    expect(isQuotaExceededError(quotaError)).toBe(true);

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    const received: StorageWarningEvent[] = [];
    const unsubscribe = onStorageWarning((ev) => received.push(ev));

    try {
      expect(() => safeStorage.setItem('test-quota-key', 'payload')).not.toThrow();
      expect(received).toHaveLength(1);
      expect(received[0]?.reason).toBe('quota');
      expect(received[0]?.quotaKB).toBe(LOCAL_STORAGE_QUOTA_KB);
      expect(received[0]?.message).toContain(`${LOCAL_STORAGE_QUOTA_KB} KB`);
    } finally {
      unsubscribe();
      setItemSpy.mockRestore();
    }
  });

  it('bắt SecurityError an toàn trên getItem / setItem / removeItem', () => {
    const secError = Object.assign(new Error('Blocked'), { name: 'SecurityError' });
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw secError;
    });
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw secError;
    });

    const events: StorageWarningEvent[] = [];
    const unsub = onStorageWarning((ev) => events.push(ev));

    try {
      expect(safeStorage.getItem('any-key')).toBeNull();
      expect(() => safeStorage.setItem('any-key', 'value')).not.toThrow();
      expect(events.some((e) => e.reason === 'security')).toBe(true);
    } finally {
      unsub();
      getSpy.mockRestore();
      setSpy.mockRestore();
    }
  });

  it('estimateLocalStorageUsage phân loại dung lượng Tiến độ, Vở viết và Đề thi chính xác', () => {
    localStorage.setItem(STORAGE_KEYS.learningProgress, 'x'.repeat(1024));
    localStorage.setItem(STORAGE_KEYS.mathInk, 'y'.repeat(2048));
    localStorage.setItem(STORAGE_KEYS.examBuilder, 'z'.repeat(512));

    const usage = estimateLocalStorageUsage();
    expect(usage.quotaKB).toBe(5120);
    expect(usage.progressKB).toBeGreaterThanOrEqual(2);
    expect(usage.mathInkKB).toBeGreaterThanOrEqual(4);
    expect(usage.examBuilderKB).toBeGreaterThanOrEqual(1);
    expect(usage.totalKB).toBeGreaterThanOrEqual(7);
  });

  it('mediaDb tách chuỗi base64 ảnh khỏi localStorage sang tham chiếu idb:// cho cả ExamBuilder và MathInk', async () => {
    const fakePng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    const uri = storeMediaDataUrl(fakePng, 'demo-asset');
    expect(isIdbMediaUri(uri)).toBe(true);
    expect(getMediaDataUrlSync(uri)).toBe(fakePng);
    expect(await resolveMediaDataUrl(uri)).toBe(fakePng);

    // Gắn ảnh vào ExamBuilder -> store chỉ giữ idb:// trong JSON của localStorage
    const attached = useExamBuilderStore.getState().attachImageToActiveExam({
      dataUrl: fakePng,
      caption: 'Hình minh họa',
      widthPercent: 50,
    });
    expect(isIdbMediaUri(attached.dataUrl)).toBe(true);
    expect(await resolveMediaDataUrl(attached.dataUrl)).toBe(fakePng);
    const persistedExamRaw = localStorage.getItem(STORAGE_KEYS.examBuilder) ?? '';
    expect(persistedExamRaw).toContain('idb://');
    expect(persistedExamRaw).not.toContain('data:image/png;base64,');

    // Gắn nền phiếu bài tập vào MathInk -> store chỉ giữ idb:// trong localStorage
    useInkNotebookStore.getState().setWorksheetBackground({
      id: 'ws-test-1',
      title: 'Phiếu 1',
      dataUrl: fakePng,
      fitMode: 'full-width',
      opacity: 0.9,
      locked: true,
    });
    const persistedInkRaw = localStorage.getItem(STORAGE_KEYS.mathInk) ?? '';
    expect(persistedInkRaw).toContain('idb://');
    expect(persistedInkRaw).not.toContain('data:image/png;base64,');

    await deleteMediaAsset(uri);
    expect(getMediaDataUrlSync(uri)).toBeNull();
  });

  it('xuất bản sao lưu JSON hợp lệ, từ chối JSON sai schema và khôi phục chính xác ở cả 2 chế độ Gộp / Thay thế', () => {
    expect(getBackupFilename(new Date(2026, 10, 23))).toBe(
      'learning-universe-backup-2026-11-23.json',
    );

    const store = useLearningStore.getState();
    store.enableLearnerMode('Học viên Kiểm thử');
    store.toggleLessonCompleted('lesson-nhom-1');
    store.toggleLessonBookmark('lesson-nhom-2');
    store.setExerciseStatus('lesson-nhom-1', 'ex-1-1', 'done');
    store.setExerciseStatus('lesson-nhom-1', 'ex-1-2', 'review');
    safeStorage.setItem('lu_reading_theme', 'dark');
    safeStorage.setItem('lu_split_pane_open', 'false');

    const snapshot = createBackupSnapshot();
    expect(snapshot.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(snapshot.app).toBe('learning-universe');
    expect(snapshot.learning.completedLessons['lesson-nhom-1']).toBeDefined();
    expect(
      snapshot.learning.exerciseStatus[buildExerciseStorageKey('lesson-nhom-1', 'ex-1-1')],
    ).toBe('done');
    expect(snapshot.readingSettings.theme).toBe('dark');
    expect(snapshot.readingSettings.splitPaneOpen).toBe(false);

    const serialized = serializeBackupSnapshot();
    const parsedValid = parseAndValidateBackup(serialized);
    expect(parsedValid.ok).toBe(true);

    // Từ chối JSON hỏng hoặc sai schema
    expect(parseAndValidateBackup('{not-json').ok).toBe(false);
    expect(parseAndValidateBackup('').ok).toBe(false);
    expect(
      parseAndValidateBackup(
        JSON.stringify({ schemaVersion: 99, app: 'other-app', exportedAt: '2026-01-01' }),
      ).ok,
    ).toBe(false);
    expect(
      parseAndValidateBackup(
        JSON.stringify({
          ...snapshot,
          learning: {
            ...snapshot.learning,
            exerciseStatus: { 'a::b': 'invalid-status' },
          },
        }),
      ).ok,
    ).toBe(false);

    // Reset và thêm dữ liệu cục bộ mới -> kiểm tra chế độ GỘP (merge)
    useLearningStore.getState().resetLearningStore();
    useLearningStore.getState().enableLearnerMode('Học viên Mới');
    useLearningStore.getState().toggleLessonCompleted('lesson-local-only');
    useLearningStore.getState().setExerciseStatus('lesson-local-only', 'ex-local', 'review');

    if (parsedValid.ok) {
      applyBackupSnapshot(parsedValid.data, 'merge');
      const afterMerge = useLearningStore.getState();
      expect(afterMerge.completedLessons['lesson-local-only']).toBeDefined();
      expect(afterMerge.completedLessons['lesson-nhom-1']).toBeDefined();
      expect(
        afterMerge.exerciseStatus[buildExerciseStorageKey('lesson-local-only', 'ex-local')],
      ).toBe('review');
      expect(afterMerge.exerciseStatus[buildExerciseStorageKey('lesson-nhom-1', 'ex-1-1')]).toBe(
        'done',
      );

      // Kiểm tra chế độ THAY THẾ (replace) -> xóa bản ghi cục bộ không nằm trong bản sao lưu
      applyBackupSnapshot(parsedValid.data, 'replace');
      const afterReplace = useLearningStore.getState();
      expect(afterReplace.completedLessons['lesson-local-only']).toBeUndefined();
      expect(afterReplace.completedLessons['lesson-nhom-1']).toBeDefined();
      expect(
        afterReplace.exerciseStatus[buildExerciseStorageKey('lesson-local-only', 'ex-local')],
      ).toBeUndefined();
      expect(afterReplace.exerciseStatus[buildExerciseStorageKey('lesson-nhom-1', 'ex-1-2')]).toBe(
        'review',
      );
    }
  });
});
