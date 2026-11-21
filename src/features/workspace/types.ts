export type WorkspaceSubjectSlug =
  'cau-truc-dai-so' | 'hinh-hoc-affine' | 'giai-tich-ham-mot-bien' | 'giao-duc-hoc';

export type TaskPriority = 'normal' | 'high';

export interface StudyTaskItem {
  readonly id: string;
  readonly title: string;
  /** Định dạng `YYYY-MM-DD` theo múi giờ địa phương */
  readonly dueDate: string;
  readonly subjectSlug: WorkspaceSubjectSlug | null;
  readonly priority: TaskPriority;
  readonly completed: boolean;
  readonly completedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ExamMilestoneItem {
  readonly id: string;
  readonly title: string;
  /** Định dạng `YYYY-MM-DD` theo múi giờ địa phương */
  readonly examDate: string;
  readonly subjectSlug: WorkspaceSubjectSlug | null;
  readonly createdAt: string;
}

export interface WeeklyStudyGoal {
  readonly targetLessons: number;
  readonly targetPomodoros: number;
}

export interface UserWorkspaceBucket {
  readonly tasks: readonly StudyTaskItem[];
  readonly milestones: readonly ExamMilestoneItem[];
  readonly weeklyGoal: WeeklyStudyGoal;
  /** Danh sách timestamp ISO của các phiên Pomodoro đã hoàn thành */
  readonly pomodoroLogs: readonly string[];
  readonly updatedAt: string;
}

export const DEFAULT_WEEKLY_GOAL: WeeklyStudyGoal = {
  targetLessons: 5,
  targetPomodoros: 6,
};

export const WORKSPACE_SUBJECT_META: Readonly<
  Record<
    WorkspaceSubjectSlug,
    {
      readonly code: string;
      readonly shortLabel: string;
      readonly color: string;
      readonly pillClass: string;
    }
  >
> = {
  'cau-truc-dai-so': {
    code: 'CTĐS',
    shortLabel: 'Cấu trúc đại số',
    color: '#8C5828',
    pillClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
  },
  'hinh-hoc-affine': {
    code: 'HHAVE',
    shortLabel: 'Hình học Affine & Euclid',
    color: '#1D4F6E',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    shortLabel: 'Giải tích hàm một biến',
    color: '#1B5E4A',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    shortLabel: 'Giáo dục học',
    color: '#8F3D35',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
  },
};

export function isWorkspaceSubjectSlug(value: unknown): value is WorkspaceSubjectSlug {
  return (
    value === 'cau-truc-dai-so' ||
    value === 'hinh-hoc-affine' ||
    value === 'giai-tich-ham-mot-bien' ||
    value === 'giao-duc-hoc'
  );
}
