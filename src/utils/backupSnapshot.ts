import { z } from 'zod';
import {
  useLearningStore,
  type ExercisePracticeStatus,
  type LessonNoteEntry,
} from '@/features/learning/learning-store';
import { safeStorage } from '@/utils/safeStorage';

export const BACKUP_SCHEMA_VERSION = 1 as const;

const exerciseStatusValueSchema = z.enum(['todo', 'review', 'done']);

const lessonNoteEntrySchema = z.object({
  body: z.string(),
  updatedAt: z.string(),
});

const readingSettingsSnapshotSchema = z.object({
  theme: z.enum(['light', 'dark', 'sepia']),
  fontFamily: z.enum(['serif', 'sans']),
  fontSize: z.enum(['sm', 'base', 'lg', 'xl']),
  fontScale: z.number().min(0.8).max(1.5).optional(),
  eyeComfortWarmth: z.boolean().optional(),
  splitPaneOpen: z.boolean().optional(),
});

export const learningBackupSchema = z.object({
  schemaVersion: z.literal(BACKUP_SCHEMA_VERSION),
  app: z.literal('learning-universe'),
  exportedAt: z.string().min(1),
  learning: z.object({
    completedLessons: z.record(z.string(), z.string()),
    bookmarkedLessons: z.record(z.string(), z.string()),
    exerciseStatus: z.record(z.string(), exerciseStatusValueSchema),
    lessonNotes: z.record(z.string(), lessonNoteEntrySchema).optional(),
    glossaryAnnotationsEnabled: z.boolean().optional(),
  }),
  readingSettings: readingSettingsSnapshotSchema,
});

export type LearningBackupSnapshot = z.infer<typeof learningBackupSchema>;

export type BackupRestoreMode = 'merge' | 'replace';

export type BackupParseResult =
  | { readonly ok: true; readonly data: LearningBackupSnapshot }
  | { readonly ok: false; readonly error: string };

function readThemeSetting(): 'light' | 'dark' | 'sepia' {
  const saved = safeStorage.getItem('lu_reading_theme');
  if (saved === 'dark' || saved === 'sepia' || saved === 'light') return saved;
  return 'light';
}

function readFontFamilySetting(): 'serif' | 'sans' {
  const saved = safeStorage.getItem('lu_reading_font_family');
  if (saved === 'sans' || saved === 'serif') return saved;
  return 'serif';
}

function readFontSizeSetting(): 'sm' | 'base' | 'lg' | 'xl' {
  const saved = safeStorage.getItem('lu_reading_font_size');
  if (saved === 'sm' || saved === 'base' || saved === 'lg' || saved === 'xl') return saved;
  return 'base';
}

function readFontScaleSetting(): number | undefined {
  const raw = safeStorage.getItem('lu_island_font_scale');
  if (!raw) return undefined;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0.8 || parsed > 1.5) return undefined;
  return parsed;
}

export function getBackupFilename(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `learning-universe-backup-${yyyy}-${mm}-${dd}.json`;
}

export function createBackupSnapshot(): LearningBackupSnapshot {
  const learning = useLearningStore.getState();
  const splitSaved = safeStorage.getItem('lu_split_pane_open');
  const eyeComfortSaved = safeStorage.getItem('lu_eye_comfort_warmth');

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    app: 'learning-universe',
    exportedAt: new Date().toISOString(),
    learning: {
      completedLessons: { ...learning.completedLessons },
      bookmarkedLessons: { ...learning.bookmarkedLessons },
      exerciseStatus: { ...learning.exerciseStatus },
      lessonNotes: { ...learning.lessonNotes },
      glossaryAnnotationsEnabled: learning.glossaryAnnotationsEnabled,
    },
    readingSettings: {
      theme: readThemeSetting(),
      fontFamily: readFontFamilySetting(),
      fontSize: readFontSizeSetting(),
      fontScale: readFontScaleSetting(),
      eyeComfortWarmth: eyeComfortSaved === 'true',
      splitPaneOpen: splitSaved === null ? true : splitSaved !== 'false',
    },
  };
}

export function serializeBackupSnapshot(): string {
  return JSON.stringify(createBackupSnapshot(), null, 2);
}

export function downloadBackupSnapshot(): LearningBackupSnapshot {
  const snapshot = createBackupSnapshot();
  if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getBackupFilename();
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  return snapshot;
}

export function parseAndValidateBackup(rawJson: string): BackupParseResult {
  if (!rawJson.trim()) {
    return { ok: false, error: 'Tệp sao lưu đang trống.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: 'Tệp không đúng định dạng JSON hợp lệ.' };
  }

  const checked = learningBackupSchema.safeParse(parsed);
  if (!checked.success) {
    return {
      ok: false,
      error:
        'Cấu trúc tệp sao lưu không hợp lệ hoặc sai phiên bản schema Learning Universe (yêu cầu schemaVersion = 1).',
    };
  }

  return { ok: true, data: checked.data };
}

export function applyBackupSnapshot(
  snapshot: LearningBackupSnapshot,
  mode: BackupRestoreMode,
): {
  readonly completedCount: number;
  readonly exerciseCount: number;
  readonly bookmarkCount: number;
} {
  const completedLessons: Record<string, string> = { ...snapshot.learning.completedLessons };
  const bookmarkedLessons: Record<string, string> = { ...snapshot.learning.bookmarkedLessons };
  const exerciseStatus: Record<string, ExercisePracticeStatus> = {
    ...snapshot.learning.exerciseStatus,
  };
  const lessonNotes: Record<string, LessonNoteEntry> | undefined = snapshot.learning.lessonNotes
    ? { ...snapshot.learning.lessonNotes }
    : undefined;

  useLearningStore.getState().importLearningSnapshot(
    {
      completedLessons,
      bookmarkedLessons,
      exerciseStatus,
      lessonNotes,
      glossaryAnnotationsEnabled: snapshot.learning.glossaryAnnotationsEnabled,
    },
    mode,
  );

  // Áp dụng lại cấu hình đọc và thông báo cho các context liên quan
  const rs = snapshot.readingSettings;
  safeStorage.setItem('lu_reading_theme', rs.theme);
  safeStorage.setItem('lu_reading_font_family', rs.fontFamily);
  safeStorage.setItem('lu_reading_font_size', rs.fontSize);
  if (typeof rs.fontScale === 'number') {
    safeStorage.setItem('lu_island_font_scale', String(rs.fontScale));
  }
  if (typeof rs.eyeComfortWarmth === 'boolean') {
    safeStorage.setItem('lu_eye_comfort_warmth', String(rs.eyeComfortWarmth));
  }
  if (typeof rs.splitPaneOpen === 'boolean') {
    safeStorage.setItem('lu_split_pane_open', String(rs.splitPaneOpen));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: rs.theme }));
    window.dispatchEvent(new CustomEvent('lu_reading_font_size_change', { detail: rs.fontSize }));
  }

  const nextState = useLearningStore.getState();
  return {
    completedCount: Object.keys(nextState.completedLessons).length,
    exerciseCount: Object.keys(nextState.exerciseStatus).length,
    bookmarkCount: Object.keys(nextState.bookmarkedLessons).length,
  };
}
