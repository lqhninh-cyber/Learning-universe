import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  syncBookmarkToSupabase,
  syncNoteToSupabase,
  syncProgressToSupabase,
} from '@/services/supabase/learning-sync';
import { safeStorage, STORAGE_KEYS } from '@/utils/safeStorage';

export type PendingLearningActionType = 'complete' | 'bookmark' | 'note';

export type ExercisePracticeStatus = 'todo' | 'review' | 'done';

export function buildExerciseStorageKey(lessonId: string, exerciseId: string): string {
  return `${lessonId}::${exerciseId}`;
}

export function getNextExerciseStatus(current: ExercisePracticeStatus): ExercisePracticeStatus {
  if (current === 'todo') return 'review';
  if (current === 'review') return 'done';
  return 'todo';
}

export interface PendingLearningAction {
  readonly type: PendingLearningActionType;
  readonly lessonId: string;
}

export interface LessonNoteEntry {
  readonly body: string;
  readonly updatedAt: string;
}

export interface LastVisitedEntry {
  readonly subjectId: string;
  readonly lessonId: string;
  readonly visitedAt: string;
}

export interface LearningState {
  /** Trạng thái đã đăng nhập / kích hoạt hồ sơ học viên (mặc định `false` = Guest theo D1). */
  readonly isAuthenticated: boolean;
  readonly currentUserId: string | null;
  readonly learnerName: string;
  /** Bản đồ `lessonId -> completedAt (ISO)`. */
  readonly completedLessons: Readonly<Record<string, string>>;
  /** Bản đồ `lessonId -> createdAt (ISO)`. */
  readonly bookmarkedLessons: Readonly<Record<string, string>>;
  /** Bản đồ `${lessonId}::${exerciseId} -> 'todo' | 'review' | 'done'`. */
  readonly exerciseStatus: Readonly<Record<string, ExercisePracticeStatus>>;
  /** Bản đồ `lessonId -> LessonNoteEntry` (giữ tương thích đồng bộ Supabase). */
  readonly lessonNotes: Readonly<Record<string, LessonNoteEntry>>;
  /** Bài học mở gần nhất theo từng `subjectId` (lưu cho cả Guest theo D1). */
  readonly lastVisitedBySubject: Readonly<Record<string, LastVisitedEntry>>;
  /** Bài học mở gần nhất trên toàn hệ thống. */
  readonly lastVisitedGlobal: LastVisitedEntry | null;
  /** Thao tác đang chờ xác nhận đăng nhập (D1). */
  readonly pendingPromptAction: PendingLearningAction | null;
  /** Bật hoặc tắt tự động chú thích ký hiệu & thuật ngữ trong bài học (Zen Mode). Mặc định `true`. */
  readonly glossaryAnnotationsEnabled: boolean;

  recordLessonVisit: (subjectId: string, lessonId: string) => void;
  toggleLessonCompleted: (lessonId: string) => boolean;
  toggleLessonBookmark: (lessonId: string) => boolean;
  setExerciseStatus: (lessonId: string, exerciseId: string, status: ExercisePracticeStatus) => void;
  cycleExerciseStatus: (lessonId: string, exerciseId: string) => ExercisePracticeStatus;
  toggleGlossaryAnnotations: () => void;
  setGlossaryAnnotationsEnabled: (enabled: boolean) => void;
  saveLessonNote: (lessonId: string, body: string) => boolean;
  enableLearnerMode: (learnerName?: string, userId?: string) => void;
  mergeCloudLearningData: (data: {
    readonly completedLessons?: Record<string, string>;
    readonly bookmarkedLessons?: Record<string, string>;
    readonly lessonNotes?: Record<string, LessonNoteEntry>;
  }) => void;
  importLearningSnapshot: (
    data: {
      readonly completedLessons: Readonly<Record<string, string>>;
      readonly bookmarkedLessons: Readonly<Record<string, string>>;
      readonly exerciseStatus: Readonly<Record<string, ExercisePracticeStatus>>;
      readonly lessonNotes?: Readonly<Record<string, LessonNoteEntry>>;
      readonly glossaryAnnotationsEnabled?: boolean;
    },
    mode: 'merge' | 'replace',
  ) => void;
  signOutLearnerMode: () => void;
  dismissPrompt: () => void;
  resetLearningStore: () => void;
}

const INITIAL_DATA = {
  isAuthenticated: false,
  currentUserId: null as string | null,
  learnerName: 'Sinh viên Sư phạm Toán',
  completedLessons: {} as Readonly<Record<string, string>>,
  bookmarkedLessons: {} as Readonly<Record<string, string>>,
  exerciseStatus: {} as Readonly<Record<string, ExercisePracticeStatus>>,
  lessonNotes: {} as Readonly<Record<string, LessonNoteEntry>>,
  lastVisitedBySubject: {} as Readonly<Record<string, LastVisitedEntry>>,
  lastVisitedGlobal: null as LastVisitedEntry | null,
  pendingPromptAction: null as PendingLearningAction | null,
  glossaryAnnotationsEnabled: true,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      ...INITIAL_DATA,

      recordLessonVisit: (subjectId, lessonId) => {
        const entry: LastVisitedEntry = {
          subjectId,
          lessonId,
          visitedAt: new Date().toISOString(),
        };
        set((state) => ({
          lastVisitedBySubject: {
            ...state.lastVisitedBySubject,
            [subjectId]: entry,
          },
          lastVisitedGlobal: entry,
        }));
      },

      toggleLessonCompleted: (lessonId) => {
        const state = get();
        if (!state.isAuthenticated) {
          set({ pendingPromptAction: { type: 'complete', lessonId } });
          return false;
        }

        const next = { ...state.completedLessons };
        const willBeCompleted = !next[lessonId];
        if (next[lessonId]) {
          delete next[lessonId];
        } else {
          next[lessonId] = new Date().toISOString();
        }
        set({ completedLessons: next });

        if (state.currentUserId) {
          void syncProgressToSupabase(state.currentUserId, lessonId, willBeCompleted);
        }
        return true;
      },

      toggleLessonBookmark: (lessonId) => {
        const state = get();
        if (!state.isAuthenticated) {
          set({ pendingPromptAction: { type: 'bookmark', lessonId } });
          return false;
        }

        const next = { ...state.bookmarkedLessons };
        const willBeBookmarked = !next[lessonId];
        if (next[lessonId]) {
          delete next[lessonId];
        } else {
          next[lessonId] = new Date().toISOString();
        }
        set({ bookmarkedLessons: next });

        if (state.currentUserId) {
          void syncBookmarkToSupabase(state.currentUserId, lessonId, willBeBookmarked);
        }
        return true;
      },

      setExerciseStatus: (lessonId, exerciseId, status) => {
        const key = buildExerciseStorageKey(lessonId, exerciseId);
        set((state) => {
          const next = { ...state.exerciseStatus };
          if (status === 'todo') {
            delete next[key];
          } else {
            next[key] = status;
          }
          return { exerciseStatus: next };
        });
      },

      cycleExerciseStatus: (lessonId, exerciseId) => {
        const key = buildExerciseStorageKey(lessonId, exerciseId);
        const current = get().exerciseStatus[key] ?? 'todo';
        const nextStatus = getNextExerciseStatus(current);
        get().setExerciseStatus(lessonId, exerciseId, nextStatus);
        return nextStatus;
      },

      toggleGlossaryAnnotations: () => {
        set((state) => ({ glossaryAnnotationsEnabled: !state.glossaryAnnotationsEnabled }));
      },

      setGlossaryAnnotationsEnabled: (enabled) => {
        set({ glossaryAnnotationsEnabled: enabled });
      },

      saveLessonNote: (lessonId, body) => {
        const state = get();
        if (!state.isAuthenticated) {
          set({ pendingPromptAction: { type: 'note', lessonId } });
          return false;
        }

        const trimmed = body.trim();
        const next = { ...state.lessonNotes };
        if (!trimmed) {
          delete next[lessonId];
        } else {
          next[lessonId] = {
            body,
            updatedAt: new Date().toISOString(),
          };
        }
        set({ lessonNotes: next });

        if (state.currentUserId) {
          void syncNoteToSupabase(state.currentUserId, lessonId, body);
        }
        return true;
      },

      enableLearnerMode: (learnerName, userId) => {
        const state = get();
        const pending = state.pendingPromptAction;
        const now = new Date().toISOString();

        const completedLessons = { ...state.completedLessons };
        const bookmarkedLessons = { ...state.bookmarkedLessons };

        if (pending?.type === 'complete') {
          completedLessons[pending.lessonId] = now;
        } else if (pending?.type === 'bookmark') {
          bookmarkedLessons[pending.lessonId] = now;
        }

        set({
          isAuthenticated: true,
          currentUserId: userId ?? state.currentUserId,
          learnerName: learnerName?.trim() || state.learnerName,
          completedLessons,
          bookmarkedLessons,
          pendingPromptAction: null,
        });

        if (userId && pending?.type === 'complete') {
          void syncProgressToSupabase(userId, pending.lessonId, true);
        } else if (userId && pending?.type === 'bookmark') {
          void syncBookmarkToSupabase(userId, pending.lessonId, true);
        }
      },

      mergeCloudLearningData: (cloudData) => {
        set((state) => ({
          completedLessons: {
            ...state.completedLessons,
            ...(cloudData.completedLessons ?? {}),
          },
          bookmarkedLessons: {
            ...state.bookmarkedLessons,
            ...(cloudData.bookmarkedLessons ?? {}),
          },
          lessonNotes: {
            ...state.lessonNotes,
            ...(cloudData.lessonNotes ?? {}),
          },
        }));
      },

      importLearningSnapshot: (data, mode) => {
        set((state) => {
          if (mode === 'replace') {
            return {
              completedLessons: { ...data.completedLessons },
              bookmarkedLessons: { ...data.bookmarkedLessons },
              exerciseStatus: { ...data.exerciseStatus },
              lessonNotes: data.lessonNotes ? { ...data.lessonNotes } : {},
              glossaryAnnotationsEnabled:
                data.glossaryAnnotationsEnabled ?? state.glossaryAnnotationsEnabled,
            };
          }
          return {
            completedLessons: {
              ...state.completedLessons,
              ...data.completedLessons,
            },
            bookmarkedLessons: {
              ...state.bookmarkedLessons,
              ...data.bookmarkedLessons,
            },
            exerciseStatus: {
              ...state.exerciseStatus,
              ...data.exerciseStatus,
            },
            lessonNotes: {
              ...state.lessonNotes,
              ...(data.lessonNotes ?? {}),
            },
            glossaryAnnotationsEnabled:
              data.glossaryAnnotationsEnabled ?? state.glossaryAnnotationsEnabled,
          };
        });
      },

      signOutLearnerMode: () => {
        set({
          isAuthenticated: false,
          currentUserId: null,
          pendingPromptAction: null,
        });
      },

      dismissPrompt: () => {
        set({ pendingPromptAction: null });
      },

      resetLearningStore: () => {
        set({ ...INITIAL_DATA });
      },
    }),
    {
      name: STORAGE_KEYS.learningProgress,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUserId: state.currentUserId,
        learnerName: state.learnerName,
        completedLessons: state.completedLessons,
        bookmarkedLessons: state.bookmarkedLessons,
        exerciseStatus: state.exerciseStatus,
        lessonNotes: state.lessonNotes,
        lastVisitedBySubject: state.lastVisitedBySubject,
        lastVisitedGlobal: state.lastVisitedGlobal,
        glossaryAnnotationsEnabled: state.glossaryAnnotationsEnabled,
      }),
    },
  ),
);
