import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage, STORAGE_KEYS } from '@/utils/safeStorage';
import {
  deleteExamMilestoneFromSupabase,
  deleteStudyTaskFromSupabase,
  syncExamMilestoneToSupabase,
  syncStudyPreferencesToSupabase,
  syncStudyTaskToSupabase,
  type CloudWorkspacePayload,
} from '@/services/supabase/workspace-sync';
import {
  DEFAULT_DASHBOARD_LAYOUT,
  DEFAULT_WEEKLY_GOAL,
  type DashboardSectionId,
  type ExamMilestoneItem,
  type StudyTaskItem,
  type TaskPriority,
  type UserWorkspaceBucket,
  type WeeklyStudyGoal,
  type WorkspaceSubjectSlug,
} from './types';
import { normalizeDashboardLayout, toLocalDateKey } from './workspace-utils';

export const GUEST_ACCOUNT_KEY = 'guest';

const EMPTY_WORKSPACE_BUCKET: UserWorkspaceBucket = Object.freeze({
  tasks: Object.freeze([]),
  milestones: Object.freeze([]),
  weeklyGoal: Object.freeze({ ...DEFAULT_WEEKLY_GOAL }),
  pomodoroLogs: Object.freeze([]),
  dashboardLayout: Object.freeze({
    order: Object.freeze([...DEFAULT_DASHBOARD_LAYOUT.order]),
    hidden: Object.freeze([]),
  }),
  reviewedLessons: Object.freeze({}),
  updatedAt: '1970-01-01T00:00:00.000Z',
});

function createEmptyBucket(): UserWorkspaceBucket {
  return {
    tasks: [],
    milestones: [],
    weeklyGoal: { ...DEFAULT_WEEKLY_GOAL },
    pomodoroLogs: [],
    dashboardLayout: {
      order: [...DEFAULT_DASHBOARD_LAYOUT.order],
      hidden: [],
    },
    reviewedLessons: {},
    updatedAt: new Date(0).toISOString(),
  };
}

function generateLocalId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export interface AddTaskInput {
  readonly title: string;
  readonly dueDate?: string;
  readonly dueTime?: string | null;
  readonly subjectSlug?: WorkspaceSubjectSlug | null;
  readonly priority?: TaskPriority;
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly dueDate?: string;
  readonly dueTime?: string | null;
  readonly subjectSlug?: WorkspaceSubjectSlug | null;
  readonly priority?: TaskPriority;
}

export interface AddMilestoneInput {
  readonly title: string;
  readonly examDate: string;
  readonly subjectSlug?: WorkspaceSubjectSlug | null;
}

export interface WorkspaceState {
  /** Khóa tài khoản đang hoạt động (`user.id` khi đã đăng nhập, `'guest'` khi là khách) */
  readonly activeAccountKey: string;
  /** Lưu tách biệt hoàn toàn dữ liệu cá nhân theo từng tài khoản */
  readonly buckets: Readonly<Record<string, UserWorkspaceBucket>>;

  setActiveAccount: (userId: string | null) => void;
  addTask: (input: AddTaskInput) => StudyTaskItem | null;
  updateTask: (taskId: string, patch: UpdateTaskInput) => void;
  toggleTask: (taskId: string) => void;
  toggleTaskPriority: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addMilestone: (input: AddMilestoneInput) => ExamMilestoneItem | null;
  deleteMilestone: (milestoneId: string) => void;
  updateWeeklyGoal: (goal: Partial<WeeklyStudyGoal>) => void;
  recordPomodoroCompleted: (completedAtIso?: string) => void;
  toggleDashboardSection: (sectionId: DashboardSectionId) => void;
  moveDashboardSection: (sectionId: DashboardSectionId, direction: 'up' | 'down') => void;
  resetDashboardLayout: () => void;
  markLessonReviewed: (lessonId: string, dateKey?: string) => void;
  mergeCloudWorkspaceData: (userId: string, cloud: CloudWorkspacePayload) => void;
  resetWorkspaceStore: () => void;
}

export function selectActiveWorkspaceBucket(state: WorkspaceState): UserWorkspaceBucket {
  return state.buckets[state.activeAccountKey] ?? EMPTY_WORKSPACE_BUCKET;
}

function clampGoalValue(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeAccountKey: GUEST_ACCOUNT_KEY,
      buckets: {},

      setActiveAccount: (userId) => {
        const nextKey = userId?.trim() || GUEST_ACCOUNT_KEY;
        set((state) => {
          if (state.activeAccountKey === nextKey) return state;
          return { activeAccountKey: nextKey };
        });
      },

      addTask: (input) => {
        const trimmed = input.title.trim();
        if (!trimmed) return null;

        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const nowIso = new Date().toISOString();
        const dueDate = input.dueDate?.trim() || toLocalDateKey(new Date());

        const newTask: StudyTaskItem = {
          id: generateLocalId('task'),
          title: trimmed,
          dueDate,
          dueTime: input.dueTime?.trim() || null,
          subjectSlug: input.subjectSlug ?? null,
          priority: input.priority ?? 'normal',
          completed: false,
          completedAt: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              tasks: [newTask, ...currentBucket.tasks],
              updatedAt: nowIso,
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncStudyTaskToSupabase(accountKey, newTask);
        }
        return newTask;
      },

      updateTask: (taskId, patch) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey];
        if (!currentBucket) return;

        const nowIso = new Date().toISOString();
        let updatedTask: StudyTaskItem | null = null;
        const nextTasks = currentBucket.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextTitle = patch.title !== undefined ? patch.title.trim() : task.title;
          if (!nextTitle) return task;
          updatedTask = {
            ...task,
            title: nextTitle,
            dueDate: patch.dueDate?.trim() || task.dueDate,
            dueTime:
              patch.dueTime !== undefined ? patch.dueTime?.trim() || null : (task.dueTime ?? null),
            subjectSlug: patch.subjectSlug !== undefined ? patch.subjectSlug : task.subjectSlug,
            priority: patch.priority ?? task.priority,
            updatedAt: nowIso,
          };
          return updatedTask;
        });

        if (!updatedTask) return;

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              tasks: nextTasks,
              updatedAt: nowIso,
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncStudyTaskToSupabase(accountKey, updatedTask);
        }
      },

      toggleTask: (taskId) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey];
        if (!currentBucket) return;

        const nowIso = new Date().toISOString();
        let updatedTask: StudyTaskItem | null = null;
        const nextTasks = currentBucket.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextCompleted = !task.completed;
          updatedTask = {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? nowIso : null,
            updatedAt: nowIso,
          };
          return updatedTask;
        });

        if (!updatedTask) return;

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              tasks: nextTasks,
              updatedAt: nowIso,
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncStudyTaskToSupabase(accountKey, updatedTask);
        }
      },

      toggleTaskPriority: (taskId) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey];
        if (!currentBucket) return;

        const nowIso = new Date().toISOString();
        let updatedTask: StudyTaskItem | null = null;
        const nextTasks = currentBucket.tasks.map((task) => {
          if (task.id !== taskId) return task;
          updatedTask = {
            ...task,
            priority: task.priority === 'high' ? 'normal' : 'high',
            updatedAt: nowIso,
          };
          return updatedTask;
        });

        if (!updatedTask) return;

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              tasks: nextTasks,
              updatedAt: nowIso,
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncStudyTaskToSupabase(accountKey, updatedTask);
        }
      },

      deleteTask: (taskId) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey];
        if (!currentBucket) return;

        const nextTasks = currentBucket.tasks.filter((task) => task.id !== taskId);
        if (nextTasks.length === currentBucket.tasks.length) return;

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              tasks: nextTasks,
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void deleteStudyTaskFromSupabase(accountKey, taskId);
        }
      },

      addMilestone: (input) => {
        const trimmed = input.title.trim();
        const examDate = input.examDate.trim();
        if (!trimmed || !examDate) return null;

        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const nowIso = new Date().toISOString();

        const milestone: ExamMilestoneItem = {
          id: generateLocalId('exam'),
          title: trimmed,
          examDate,
          subjectSlug: input.subjectSlug ?? null,
          createdAt: nowIso,
        };

        const nextMilestones = [...currentBucket.milestones, milestone].sort((a, b) =>
          a.examDate.localeCompare(b.examDate),
        );

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              milestones: nextMilestones,
              updatedAt: nowIso,
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncExamMilestoneToSupabase(accountKey, milestone);
        }
        return milestone;
      },

      deleteMilestone: (milestoneId) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey];
        if (!currentBucket) return;

        const nextMilestones = currentBucket.milestones.filter((m) => m.id !== milestoneId);
        if (nextMilestones.length === currentBucket.milestones.length) return;

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              milestones: nextMilestones,
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void deleteExamMilestoneFromSupabase(accountKey, milestoneId);
        }
      },

      updateWeeklyGoal: (goalPatch) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const nextGoal: WeeklyStudyGoal = {
          targetLessons: clampGoalValue(
            goalPatch.targetLessons ?? currentBucket.weeklyGoal.targetLessons,
            1,
            30,
            DEFAULT_WEEKLY_GOAL.targetLessons,
          ),
          targetPomodoros: clampGoalValue(
            goalPatch.targetPomodoros ?? currentBucket.weeklyGoal.targetPomodoros,
            1,
            40,
            DEFAULT_WEEKLY_GOAL.targetPomodoros,
          ),
        };

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              weeklyGoal: nextGoal,
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncStudyPreferencesToSupabase(accountKey, nextGoal, currentBucket.pomodoroLogs);
        }
      },

      recordPomodoroCompleted: (completedAtIso) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const stamp = completedAtIso ?? new Date().toISOString();
        const nextLogs = [...currentBucket.pomodoroLogs, stamp].slice(-240);

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              pomodoroLogs: nextLogs,
              updatedAt: stamp,
            },
          },
        });

        if (accountKey !== GUEST_ACCOUNT_KEY) {
          void syncStudyPreferencesToSupabase(accountKey, currentBucket.weeklyGoal, nextLogs);
        }
      },

      toggleDashboardSection: (sectionId) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const currentLayout = normalizeDashboardLayout(currentBucket.dashboardLayout);
        const isHidden = currentLayout.hidden.includes(sectionId);
        const nextHidden = isHidden
          ? currentLayout.hidden.filter((id) => id !== sectionId)
          : [...currentLayout.hidden, sectionId];

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              dashboardLayout: {
                order: currentLayout.order,
                hidden: nextHidden,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      moveDashboardSection: (sectionId, direction) => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const currentLayout = normalizeDashboardLayout(currentBucket.dashboardLayout);
        const nextOrder = [...currentLayout.order];
        const idx = nextOrder.indexOf(sectionId);
        if (idx === -1) return;

        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= nextOrder.length) return;

        const swapped = nextOrder[targetIdx];
        if (!swapped) return;
        nextOrder[targetIdx] = sectionId;
        nextOrder[idx] = swapped;

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              dashboardLayout: {
                order: nextOrder,
                hidden: currentLayout.hidden,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      resetDashboardLayout: () => {
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              dashboardLayout: {
                order: [...DEFAULT_DASHBOARD_LAYOUT.order],
                hidden: [],
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      markLessonReviewed: (lessonId, dateKey) => {
        const cleanId = lessonId.trim();
        if (!cleanId) return;
        const state = get();
        const accountKey = state.activeAccountKey;
        const currentBucket = state.buckets[accountKey] ?? createEmptyBucket();
        const stampKey = dateKey?.trim() || toLocalDateKey(new Date());

        set({
          buckets: {
            ...state.buckets,
            [accountKey]: {
              ...currentBucket,
              reviewedLessons: {
                ...(currentBucket.reviewedLessons ?? {}),
                [cleanId]: stampKey,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      mergeCloudWorkspaceData: (userId, cloud) => {
        if (!userId) return;
        set((state) => {
          const local = state.buckets[userId] ?? createEmptyBucket();

          const taskById = new Map<string, StudyTaskItem>();
          for (const t of local.tasks) taskById.set(t.id, t);
          for (const t of cloud.tasks) {
            const existing = taskById.get(t.id);
            if (!existing || t.updatedAt >= existing.updatedAt) {
              taskById.set(t.id, t);
            }
          }

          const milestoneById = new Map<string, ExamMilestoneItem>();
          for (const m of local.milestones) milestoneById.set(m.id, m);
          for (const m of cloud.milestones) milestoneById.set(m.id, m);

          const mergedLogs = Array.from(
            new Set([...local.pomodoroLogs, ...(cloud.pomodoroLogs ?? [])]),
          )
            .sort()
            .slice(-240);

          return {
            buckets: {
              ...state.buckets,
              [userId]: {
                tasks: Array.from(taskById.values()).sort((a, b) =>
                  b.createdAt.localeCompare(a.createdAt),
                ),
                milestones: Array.from(milestoneById.values()).sort((a, b) =>
                  a.examDate.localeCompare(b.examDate),
                ),
                weeklyGoal: cloud.weeklyGoal ?? local.weeklyGoal,
                pomodoroLogs: mergedLogs,
                dashboardLayout: local.dashboardLayout,
                reviewedLessons: local.reviewedLessons,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      resetWorkspaceStore: () => {
        set({
          activeAccountKey: GUEST_ACCOUNT_KEY,
          buckets: {},
        });
      },
    }),
    {
      name: STORAGE_KEYS.workspace,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        activeAccountKey: state.activeAccountKey,
        buckets: state.buckets,
      }),
    },
  ),
);
