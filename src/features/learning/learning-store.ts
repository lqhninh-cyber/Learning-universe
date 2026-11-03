import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  syncBookmarkToSupabase,
  syncNoteToSupabase,
  syncProgressToSupabase,
} from '@/services/supabase/learning-sync';

export type PendingLearningActionType = 'complete' | 'bookmark' | 'note';

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
  /** Bản đồ `lessonId -> LessonNoteEntry`. */
  readonly lessonNotes: Readonly<Record<string, LessonNoteEntry>>;
  /** Bài học mở gần nhất theo từng `subjectId` (lưu cho cả Guest theo D1). */
  readonly lastVisitedBySubject: Readonly<Record<string, LastVisitedEntry>>;
  /** Bài học mở gần nhất trên toàn hệ thống. */
  readonly lastVisitedGlobal: LastVisitedEntry | null;
  /** Thao tác đang chờ xác nhận đăng nhập (D1). */
  readonly pendingPromptAction: PendingLearningAction | null;
  /** Bài học đang mở khung ghi chú cá nhân. */
  readonly openNoteLessonId: string | null;
  /** Bật hoặc tắt tự động chú thích ký hiệu & thuật ngữ trong bài học (Zen Mode). Mặc định `true`. */
  readonly glossaryAnnotationsEnabled: boolean;

  recordLessonVisit: (subjectId: string, lessonId: string) => void;
  toggleLessonCompleted: (lessonId: string) => boolean;
  toggleLessonBookmark: (lessonId: string) => boolean;
  toggleGlossaryAnnotations: () => void;
  setGlossaryAnnotationsEnabled: (enabled: boolean) => void;
  requestNoteAccess: (lessonId: string) => boolean;
  setOpenNoteLessonId: (lessonId: string | null) => void;
  saveLessonNote: (lessonId: string, body: string) => boolean;
  enableLearnerMode: (learnerName?: string, userId?: string) => void;
  mergeCloudLearningData: (data: {
    readonly completedLessons?: Record<string, string>;
    readonly bookmarkedLessons?: Record<string, string>;
    readonly lessonNotes?: Record<string, LessonNoteEntry>;
  }) => void;
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
  lessonNotes: {} as Readonly<Record<string, LessonNoteEntry>>,
  lastVisitedBySubject: {} as Readonly<Record<string, LastVisitedEntry>>,
  lastVisitedGlobal: null as LastVisitedEntry | null,
  pendingPromptAction: null as PendingLearningAction | null,
  openNoteLessonId: null as string | null,
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

      toggleGlossaryAnnotations: () => {
        set((state) => ({ glossaryAnnotationsEnabled: !state.glossaryAnnotationsEnabled }));
      },

      setGlossaryAnnotationsEnabled: (enabled) => {
        set({ glossaryAnnotationsEnabled: enabled });
      },

      requestNoteAccess: (lessonId) => {
        const state = get();
        if (!state.isAuthenticated) {
          set({ pendingPromptAction: { type: 'note', lessonId } });
          return false;
        }
        return true;
      },

      setOpenNoteLessonId: (lessonId) => {
        set({ openNoteLessonId: lessonId });
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
        let openNoteLessonId = state.openNoteLessonId;

        if (pending?.type === 'complete') {
          completedLessons[pending.lessonId] = now;
        } else if (pending?.type === 'bookmark') {
          bookmarkedLessons[pending.lessonId] = now;
        } else if (pending?.type === 'note') {
          openNoteLessonId = pending.lessonId;
        }

        set({
          isAuthenticated: true,
          currentUserId: userId ?? state.currentUserId,
          learnerName: learnerName?.trim() || state.learnerName,
          completedLessons,
          bookmarkedLessons,
          openNoteLessonId,
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
      name: 'learning-universe-progress-v1',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUserId: state.currentUserId,
        learnerName: state.learnerName,
        completedLessons: state.completedLessons,
        bookmarkedLessons: state.bookmarkedLessons,
        lessonNotes: state.lessonNotes,
        lastVisitedBySubject: state.lastVisitedBySubject,
        lastVisitedGlobal: state.lastVisitedGlobal,
        glossaryAnnotationsEnabled: state.glossaryAnnotationsEnabled,
      }),
    },
  ),
);
