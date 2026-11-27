import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Flag,
  HardDrive,
  Pencil,
  Pin,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { type FC, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PLANNER_EMPTY_ASSET } from '@/config/atmosphereAssets';
import { useOptionalAuth } from '@/features/auth';
import {
  computeDaysUntilDate,
  computeExamPacePlan,
  formatCountdownLabel,
  formatShortVietnameseDate,
  GUEST_ACCOUNT_KEY,
  selectActiveWorkspaceBucket,
  toLocalDateKey,
  useWorkspaceStore,
  WORKSPACE_SUBJECT_META,
  type StudyTaskItem,
  type TaskPriority,
  type WorkspaceSubjectSlug,
} from '@/features/workspace';
import { cn } from '@/shared/lib/cn';

export interface PlannerSubjectProgress {
  readonly code: string;
  readonly completedCount: number;
  readonly lessonCount: number;
}

export interface StudyPlannerWidgetProps {
  /** Bản đồ ngày (`YYYY-MM-DD`) -> số hoạt động học tập để chấm dấu trên lịch tháng */
  readonly activityByDate: Readonly<Record<string, number>>;
  /** Tiến độ thực tế theo slug học phần để tính nhịp độ ôn thi mỗi ngày */
  readonly subjectProgressBySlug?: Readonly<Record<string, PlannerSubjectProgress>>;
}

type TaskFilterMode = 'all' | 'today' | 'upcoming' | 'done';

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

const SUBJECT_OPTIONS: readonly {
  readonly value: '' | WorkspaceSubjectSlug;
  readonly label: string;
}[] = [
  { value: '', label: 'Chung' },
  { value: 'cau-truc-dai-so', label: 'CTĐS' },
  { value: 'hinh-hoc-affine', label: 'HHAVE' },
  { value: 'giai-tich-ham-mot-bien', label: 'GTHMB' },
  { value: 'giao-duc-hoc', label: 'GDH' },
];

const QUICK_TASK_TEMPLATES: readonly {
  readonly title: string;
  readonly subjectSlug: WorkspaceSubjectSlug | null;
  readonly priority: TaskPriority;
}[] = [
  {
    title: 'Ôn lại định lý trọng tâm & chứng minh',
    subjectSlug: 'cau-truc-dai-so',
    priority: 'high',
  },
  {
    title: 'Giải 3 bài tập tự luyện trong chương',
    subjectSlug: 'hinh-hoc-affine',
    priority: 'normal',
  },
  {
    title: 'Hoàn thành 1 phiên Pomodoro 25 phút',
    subjectSlug: null,
    priority: 'normal',
  },
];

interface CalendarDayCell {
  readonly dateKey: string;
  readonly dayNumber: number;
  readonly inCurrentMonth: boolean;
}

function buildMonthGrid(year: number, monthIndex: number): readonly CalendarDayCell[] {
  const firstDay = new Date(year, monthIndex, 1, 12, 0, 0, 0);
  const firstWeekdayMon = (firstDay.getDay() + 6) % 7; // 0 = T2 ... 6 = CN
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells: CalendarDayCell[] = [];

  for (let i = firstWeekdayMon - 1; i >= 0; i -= 1) {
    const dayNum = prevMonthDays - i;
    const d = new Date(year, monthIndex - 1, dayNum, 12, 0, 0, 0);
    cells.push({ dateKey: toLocalDateKey(d), dayNumber: dayNum, inCurrentMonth: false });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const d = new Date(year, monthIndex, dayNum, 12, 0, 0, 0);
    cells.push({ dateKey: toLocalDateKey(d), dayNumber: dayNum, inCurrentMonth: true });
  }

  const remainder = cells.length % 7;
  if (remainder > 0) {
    const trailing = 7 - remainder;
    for (let dayNum = 1; dayNum <= trailing; dayNum += 1) {
      const d = new Date(year, monthIndex + 1, dayNum, 12, 0, 0, 0);
      cells.push({ dateKey: toLocalDateKey(d), dayNumber: dayNum, inCurrentMonth: false });
    }
  }

  return cells;
}

export const StudyPlannerWidget: FC<StudyPlannerWidgetProps> = ({
  activityByDate,
  subjectProgressBySlug,
}) => {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const openAuthModal = auth?.openAuthModal ?? (() => {});
  const activeAccountKey = useWorkspaceStore((state) => state.activeAccountKey);
  const bucket = useWorkspaceStore(selectActiveWorkspaceBucket);
  const addTask = useWorkspaceStore((state) => state.addTask);
  const updateTask = useWorkspaceStore((state) => state.updateTask);
  const toggleTask = useWorkspaceStore((state) => state.toggleTask);
  const toggleTaskPriority = useWorkspaceStore((state) => state.toggleTaskPriority);
  const deleteTask = useWorkspaceStore((state) => state.deleteTask);
  const addMilestone = useWorkspaceStore((state) => state.addMilestone);
  const deleteMilestone = useWorkspaceStore((state) => state.deleteMilestone);

  const todayDate = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toLocalDateKey(todayDate), [todayDate]);

  const [viewYear, setViewYear] = useState(() => todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => todayDate.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<TaskFilterMode>('all');

  // Form thêm To-Do vào lịch biểu
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState<'' | WorkspaceSubjectSlug>('');
  const [taskDueDate, setTaskDueDate] = useState(todayKey);
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('normal');
  const [formNotice, setFormNotice] = useState<{
    readonly type: 'hint' | 'success';
    readonly text: string;
  } | null>(null);
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);

  // Sửa nhanh 1 nhiệm vụ trực tiếp
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState(todayKey);
  const [editDueTime, setEditDueTime] = useState('');
  const [editSubject, setEditSubject] = useState<'' | WorkspaceSubjectSlug>('');

  // Form ghim mốc kỳ thi / hạn nộp
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState(todayKey);
  const [examSubject, setExamSubject] = useState<'' | WorkspaceSubjectSlug>('cau-truc-dai-so');
  const [emptyArtworkFailed, setEmptyArtworkFailed] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const flashNotice = (type: 'hint' | 'success', text: string) => {
    setFormNotice({ type, text });
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setFormNotice(null);
      noticeTimerRef.current = null;
    }, 2800);
  };

  const monthCells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, { pending: number; total: number }> = {};
    for (const task of bucket.tasks) {
      const slot = map[task.dueDate] ?? { pending: 0, total: 0 };
      slot.total += 1;
      if (!task.completed) slot.pending += 1;
      map[task.dueDate] = slot;
    }
    return map;
  }, [bucket.tasks]);

  const milestonesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of bucket.milestones) {
      map[m.examDate] = (map[m.examDate] ?? 0) + 1;
    }
    return map;
  }, [bucket.milestones]);

  const filteredTasks = useMemo(() => {
    return bucket.tasks.filter((task) => {
      if (selectedDateKey) {
        return task.dueDate === selectedDateKey;
      }
      if (filterMode === 'today') return task.dueDate === todayKey && !task.completed;
      if (filterMode === 'upcoming') return task.dueDate > todayKey && !task.completed;
      if (filterMode === 'done') return task.completed;
      return true;
    });
  }, [bucket.tasks, filterMode, selectedDateKey, todayKey]);

  const pendingCount = useMemo(
    () => bucket.tasks.filter((task) => !task.completed).length,
    [bucket.tasks],
  );

  const upcomingMilestones = useMemo(() => {
    return [...bucket.milestones].sort((a, b) => a.examDate.localeCompare(b.examDate)).slice(0, 4);
  }, [bucket.milestones]);

  const syncCalendarViewToDate = (dateKey: string) => {
    const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    if (Number.isFinite(year) && Number.isFinite(month) && month >= 0 && month <= 11) {
      setViewYear(year);
      setViewMonth(month);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    setSelectedDateKey(todayKey);
    setTaskDueDate(todayKey);
    setExamDate(todayKey);
  };

  const handleSelectDay = (dateKey: string) => {
    if (selectedDateKey === dateKey) {
      setSelectedDateKey(null);
    } else {
      setSelectedDateKey(dateKey);
      setTaskDueDate(dateKey);
      setExamDate(dateKey);
    }
  };

  const commitNewTask = (payload: {
    readonly title: string;
    readonly dueDate: string;
    readonly dueTime?: string | null;
    readonly subjectSlug: WorkspaceSubjectSlug | null;
    readonly priority: TaskPriority;
  }) => {
    const created = addTask(payload);
    if (!created) return;

    syncCalendarViewToDate(created.dueDate);
    if (filterMode === 'done') {
      setFilterMode('all');
    } else if (filterMode === 'today' && created.dueDate !== todayKey) {
      setFilterMode('all');
    } else if (filterMode === 'upcoming' && created.dueDate <= todayKey) {
      setFilterMode('all');
    }
    if (selectedDateKey && selectedDateKey !== created.dueDate) {
      setSelectedDateKey(created.dueDate);
    }
    flashNotice('success', `Đã thêm vào lịch ngày ${formatShortVietnameseDate(created.dueDate)}`);
  };

  const handleAddTask = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = taskTitle.trim();
    if (!trimmed) {
      setShowQuickTemplates(true);
      flashNotice('hint', 'Nhập nội dung nhiệm vụ hoặc chọn nhanh một gợi ý bên dưới.');
      titleInputRef.current?.focus();
      return;
    }

    const effectiveDate = taskDueDate || selectedDateKey || todayKey;
    commitNewTask({
      title: trimmed,
      dueDate: effectiveDate,
      dueTime: taskDueTime || null,
      subjectSlug: taskSubject || null,
      priority: taskPriority,
    });
    setTaskTitle('');
    setTaskDueTime('');
    setTaskPriority('normal');
    setShowQuickTemplates(false);
  };

  const handleQuickAddTemplate = (template: (typeof QUICK_TASK_TEMPLATES)[number]) => {
    const effectiveDate = taskDueDate || selectedDateKey || todayKey;
    commitNewTask({
      title: template.title,
      dueDate: effectiveDate,
      dueTime: taskDueTime || null,
      subjectSlug: taskSubject || template.subjectSlug,
      priority: template.priority,
    });
    setShowQuickTemplates(false);
  };

  const startEditTask = (task: StudyTaskItem) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate);
    setEditDueTime(task.dueTime ?? '');
    setEditSubject(task.subjectSlug ?? '');
  };

  const handleSaveTaskEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editingTaskId || !editTitle.trim()) return;
    updateTask(editingTaskId, {
      title: editTitle.trim(),
      dueDate: editDueDate || todayKey,
      dueTime: editDueTime || null,
      subjectSlug: editSubject || null,
    });
    setEditingTaskId(null);
    flashNotice('success', 'Đã cập nhật lịch biểu.');
  };

  const handleAddMilestone = (event: FormEvent) => {
    event.preventDefault();
    if (!examTitle.trim() || !examDate) return;
    addMilestone({
      title: examTitle,
      examDate,
      subjectSlug: examSubject || null,
    });
    syncCalendarViewToDate(examDate);
    setExamTitle('');
    setIsExamFormOpen(false);
    flashNotice('success', `Đã ghim mốc kỳ thi ngày ${formatShortVietnameseDate(examDate)}`);
  };

  const isSignedAccount = activeAccountKey !== GUEST_ACCOUNT_KEY;

  return (
    <section
      aria-label="Lịch biểu học tập, mốc kỳ thi và danh sách việc cần làm"
      data-testid="study-planner-widget"
      className="grid min-w-0 grid-cols-1 overflow-hidden rounded-[28px] border border-black/[0.05] bg-white shadow-[0_16px_42px_-22px_rgba(16,45,35,0.16)] lg:grid-cols-12 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      {/* CỘT TRÁI (5/12): LỊCH THÁNG RỘNG RÃI + MỐC ĐẾM NGƯỢC KỲ THI */}
      <div className="lu-atelier-backdrop relative flex flex-col justify-between gap-5 border-b border-[var(--border-hairline)] bg-[#F7FAF8] p-5 sm:p-6 lg:col-span-5 lg:border-r lg:border-b-0 dark:bg-[#101816]">
        <div className="space-y-3">
          {/* Header tháng */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
              <h2 className="font-mono text-xs font-semibold tracking-wider text-[var(--text-main)] uppercase">
                Tháng {String(viewMonth + 1).padStart(2, '0')}, {viewYear}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleJumpToday}
                className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Tháng trước"
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Tháng sau"
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Lưới thứ & ngày */}
          <div data-testid="mini-calendar-grid" className="space-y-1">
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_HEADERS.map((day) => (
                <span
                  key={day}
                  className="py-1 font-mono text-[10px] font-semibold text-[var(--text-muted)]"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {monthCells.map((cell) => {
                const isToday = cell.dateKey === todayKey;
                const isSelected = cell.dateKey === selectedDateKey;
                const hasPendingTask = (tasksByDate[cell.dateKey]?.pending ?? 0) > 0;
                const hasMilestone = (milestonesByDate[cell.dateKey] ?? 0) > 0;
                const hasActivity = (activityByDate[cell.dateKey] ?? 0) > 0;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    data-testid={`calendar-day-${cell.dateKey}`}
                    onClick={() => handleSelectDay(cell.dateKey)}
                    aria-pressed={isSelected}
                    className={cn(
                      'relative flex h-10 cursor-pointer flex-col items-center justify-center rounded-xl font-mono text-xs tabular-nums transition-all duration-150',
                      !cell.inCurrentMonth && 'opacity-35',
                      isSelected
                        ? 'bg-[#0F7656] font-bold text-white shadow-[0_8px_18px_-6px_rgba(15,118,86,0.55)]'
                        : isToday
                          ? 'border border-[#0F7656]/55 bg-white font-bold text-[#0F7656] shadow-2xs dark:bg-[#141D1A] dark:text-[#4AD1A3]'
                          : 'text-[var(--text-main)] hover:bg-white dark:hover:bg-[#192521]',
                    )}
                  >
                    <span>{cell.dayNumber}</span>
                    {(hasPendingTask || hasMilestone || hasActivity) && (
                      <span className="mt-0.5 flex items-center gap-0.5" aria-hidden="true">
                        {hasMilestone && (
                          <span
                            className={cn(
                              'h-1 w-1 rounded-full',
                              isSelected ? 'bg-[#F0C87D]' : 'bg-[#B45309] dark:bg-[#F59E0B]',
                            )}
                          />
                        )}
                        {hasPendingTask && (
                          <span
                            className={cn(
                              'h-1 w-1 rounded-full',
                              isSelected ? 'bg-white' : 'bg-[#1D4F6E] dark:bg-[#64A8D1]',
                            )}
                          />
                        )}
                        {hasActivity && (
                          <span
                            className={cn(
                              'h-1 w-1 rounded-full',
                              isSelected ? 'bg-emerald-200' : 'bg-[#1B5E4A] dark:bg-[#52B394]',
                            )}
                          />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thanh hành động nhanh khi chọn một ngày cụ thể trên lịch */}
          {selectedDateKey && (
            <div
              data-testid="calendar-selected-day-bar"
              className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-[var(--accent-os)]/30 bg-[var(--bg-workspace)] px-2.5 py-2 text-[11px]"
            >
              <span className="font-mono font-semibold text-[var(--accent-os)]">
                Ngày {formatShortVietnameseDate(selectedDateKey)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-testid="calendar-day-add-task"
                  onClick={() => {
                    setTaskDueDate(selectedDateKey);
                    setShowQuickTemplates(true);
                    titleInputRef.current?.focus();
                  }}
                  className="inline-flex cursor-pointer items-center gap-0.5 rounded-md bg-[var(--accent-os)] px-2 py-0.5 font-mono text-[10px] font-semibold text-white hover:opacity-95"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  <span>Thêm việc</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExamDate(selectedDateKey);
                    setIsExamFormOpen(true);
                  }}
                  className="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  <Pin className="h-2.5 w-2.5" aria-hidden="true" />
                  <span>Mốc thi</span>
                </button>
              </div>
            </div>
          )}

          {/* Chú thích dấu chấm lịch */}
          <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[10px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B45309]" aria-hidden="true" />
              <span>Kỳ thi</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1D4F6E]" aria-hidden="true" />
              <span>Việc cần làm</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B5E4A]" aria-hidden="true" />
              <span>Đã học</span>
            </span>
          </div>

          {/* La bàn Nhật Quỹ & Nhịp Độ Tháng (Trang trí học thuật cố định bên cột Lịch) */}
          <div
            data-testid="calendar-sundial-ornament"
            className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-[#D4AF6A]/30 bg-gradient-to-r from-[#FDF9F1] via-white to-[#EFF7F3] px-3.5 py-2.5 shadow-2xs dark:border-[#D99B5E]/20 dark:from-[#1B1712] dark:via-[#141D1A] dark:to-[#11221C]"
          >
            <div className="flex items-center gap-2.5">
              <svg
                viewBox="0 0 44 44"
                fill="none"
                aria-hidden="true"
                className="h-10 w-10 shrink-0 text-[#8C5828] dark:text-[#F5D078]"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="lu-orbit-ring"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="13"
                  stroke="#0F7656"
                  strokeWidth="1"
                  strokeOpacity="0.55"
                />
                <polygon
                  points="22,8 25,22 22,36 19,22"
                  fill="currentColor"
                  fillOpacity="0.22"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <circle cx="22" cy="22" r="2.5" fill="#0F7656" />
              </svg>
              <div>
                <p className="font-mono text-[9.5px] font-bold tracking-wider text-[#8C5828] uppercase dark:text-[#F5D078]">
                  La bàn Nhật quỹ
                </p>
                <p className="text-[11.5px] font-semibold text-[var(--text-main)]">
                  {Object.keys(activityByDate).length} ngày ghi nhận dấu ấn học tập
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#0F7656]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#0F7656] tabular-nums dark:bg-[#4AD1A3]/15 dark:text-[#4AD1A3]">
              {bucket.milestones.length} mốc
            </span>
          </div>
        </div>

        {/* MỐC ĐẾM NGƯỢC KỲ THI / HẠN NỘP */}
        <div
          data-testid="exam-countdown-panel"
          className="space-y-2.5 border-t border-[var(--border-hairline)] pt-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              <Pin className="h-3 w-3 text-[var(--accent-heritage)]" aria-hidden="true" />
              <span>Mốc kỳ thi & Hạn nộp</span>
            </span>
            <button
              type="button"
              data-testid="exam-milestone-toggle"
              onClick={() => setIsExamFormOpen((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--text-main)]"
            >
              {isExamFormOpen ? (
                <>
                  <X className="h-3 w-3" aria-hidden="true" />
                  <span>Đóng</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  <span>Ghim mốc</span>
                </>
              )}
            </button>
          </div>

          {isExamFormOpen && (
            <form
              onSubmit={handleAddMilestone}
              data-testid="exam-milestone-form"
              className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-2.5"
            >
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="VD: Thi giữa kỳ Cấu trúc đại số..."
                aria-label="Tên mốc kỳ thi hoặc hạn nộp"
                className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-os)] focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  aria-label="Ngày thi"
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[11px] text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                />
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value as '' | WorkspaceSubjectSlug)}
                  aria-label="Học phần kỳ thi"
                  className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[11px] text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-95"
                >
                  Lưu
                </button>
              </div>
            </form>
          )}

          {upcomingMilestones.length === 0 ? (
            <p className="text-[11.5px] text-[var(--text-muted)]">
              Chưa ghim lịch thi nào. Nhấn &ldquo;Ghim mốc&rdquo; để đếm ngược hạn thi/tiểu luận.
            </p>
          ) : (
            <ul className="space-y-2">
              {upcomingMilestones.map((milestone) => {
                const daysUntil = computeDaysUntilDate(milestone.examDate);
                const subjectMeta = milestone.subjectSlug
                  ? WORKSPACE_SUBJECT_META[milestone.subjectSlug]
                  : null;
                const progress = milestone.subjectSlug
                  ? subjectProgressBySlug?.[milestone.subjectSlug]
                  : undefined;
                const pacePlan =
                  progress && subjectMeta
                    ? computeExamPacePlan({
                        daysUntil,
                        completedCount: progress.completedCount,
                        lessonCount: progress.lessonCount,
                        subjectCode: progress.code,
                      })
                    : null;
                const subjectPct =
                  progress && progress.lessonCount > 0
                    ? Math.round((progress.completedCount / progress.lessonCount) * 100)
                    : 0;
                return (
                  <li
                    key={milestone.id}
                    data-testid="exam-milestone-item"
                    className="space-y-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: subjectMeta?.color ?? '#9E763B' }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--text-main)]">
                            {milestone.title}
                          </p>
                          <p className="font-mono text-[10px] text-[var(--text-muted)]">
                            {subjectMeta ? `${subjectMeta.code} · ` : ''}
                            {formatShortVietnameseDate(milestone.examDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={cn(
                            'rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums',
                            daysUntil <= 3 && daysUntil >= 0
                              ? 'bg-[#FBF4F3] text-[#8F3D35] dark:bg-[#2A1716] dark:text-[#DF7B70]'
                              : 'bg-[var(--bg-surface)] text-[var(--accent-heritage)]',
                          )}
                        >
                          {formatCountdownLabel(daysUntil)}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteMilestone(milestone.id)}
                          aria-label={`Xóa mốc ${milestone.title}`}
                          className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[#8F3D35]"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {pacePlan && (
                      <div
                        data-testid="exam-milestone-pace"
                        className="space-y-1 border-t border-[var(--border-hairline)]/70 pt-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10.5px]">
                          <span
                            className={cn(
                              'font-medium',
                              pacePlan.urgency === 'ready'
                                ? 'text-[#0F7656] dark:text-[#4AD1A3]'
                                : pacePlan.urgency === 'intense'
                                  ? 'text-[#8F3D35] dark:text-[#DF7B70]'
                                  : pacePlan.urgency === 'tight'
                                    ? 'text-[#8C5828] dark:text-[#E5A95C]'
                                    : 'text-[var(--text-secondary)]',
                            )}
                          >
                            {pacePlan.summary}
                          </span>
                          <span className="shrink-0 font-mono text-[9.5px] text-[var(--text-muted)] tabular-nums">
                            {subjectPct}%
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                          <div
                            className="h-full rounded-full transition-[width] duration-300"
                            style={{
                              width: `${Math.max(subjectPct, progress && progress.completedCount > 0 ? 6 : 0)}%`,
                              backgroundColor: subjectMeta?.color ?? '#0F7656',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* CỘT PHẢI (7/12): BANNER TRANH BÀN HỌC CỐ ĐỊNH + DANH SÁCH TO-DO LIST HỌC THUẬT CÁ NHÂN HÓA */}
      <div className="flex min-w-0 flex-col justify-between gap-4 p-5 sm:p-6 lg:col-span-7">
        <div className="space-y-3.5">
          {/* Banner nghệ thuật cố định đầu khung Kế hoạch (luôn hiển thị sinh động dù danh sách rỗng hay đã có việc) */}
          <div
            style={{ backgroundImage: PLANNER_EMPTY_ASSET.fallbackGradient }}
            className="group/pbanner relative overflow-hidden rounded-2xl border border-black/[0.06] p-4 text-white shadow-xs dark:border-white/[0.08]"
          >
            {!emptyArtworkFailed && (
              <img
                src={PLANNER_EMPTY_ASSET.src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                onError={() => setEmptyArtworkFailed(true)}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/pbanner:scale-105"
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#122D25]/92 via-[#17332C]/80 to-[#17332C]/45"
            />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold tracking-[0.14em] text-[#F5D078] uppercase">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                  <span>Sổ tay điều phối học thuật</span>
                </span>
                <h2 className="mt-0.5 font-serif text-lg font-semibold text-white">
                  Kế hoạch &amp; Việc cần làm
                </h2>
                <p className="font-mono text-[11px] text-white/80 tabular-nums">
                  {pendingCount} việc đang chờ · {bucket.tasks.length - pendingCount} đã hoàn thành
                </p>
              </div>

              {isSignedAccount ? (
                <span
                  data-testid="workspace-account-scope"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-2.5 py-1 font-mono text-[10.5px] font-medium text-[#A7F3D0] backdrop-blur-md"
                >
                  <Cloud className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="max-w-[160px] truncate">
                    Riêng tư · {user?.fullName || 'Học viên'}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  data-testid="workspace-account-scope"
                  onClick={openAuthModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-2.5 py-1 font-mono text-[10.5px] font-medium text-white/90 backdrop-blur-md transition-colors hover:border-[#A7F3D0] hover:text-white"
                >
                  <HardDrive className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>Lưu cục bộ · Đăng nhập đồng bộ</span>
                </button>
              )}
            </div>
          </div>

          {/* Form thêm việc vào lịch biểu (2 tầng thoáng rộng, luôn phản hồi rõ ràng) */}
          <form
            onSubmit={handleAddTask}
            data-testid="todo-add-form"
            className={cn(
              'space-y-2 rounded-xl border bg-[var(--bg-surface)] p-2.5 transition-colors',
              formNotice?.type === 'hint'
                ? 'border-[#B45309]/55 ring-2 ring-[#B45309]/15'
                : 'border-[var(--border-hairline)] focus-within:border-[var(--accent-os)]/50',
            )}
          >
            {/* Tầng 1: Ô nhập nội dung rộng rãi + nút + Thêm */}
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                type="text"
                data-testid="todo-title-input"
                value={taskTitle}
                onChange={(e) => {
                  setTaskTitle(e.target.value);
                  if (formNotice?.type === 'hint') setFormNotice(null);
                }}
                placeholder="VD: Chứng minh Định lý Lagrange, làm bài tập Chương 5..."
                aria-label="Nội dung nhiệm vụ học tập mới"
                className="min-w-0 flex-1 rounded-lg bg-[var(--bg-workspace)] px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-[var(--accent-os)] focus:outline-none sm:text-[13px]"
              />

              <button
                type="submit"
                data-testid="todo-add-submit"
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#0F7656] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#0D664A] active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Thêm</span>
              </button>
            </div>

            {/* Tầng 2: Chọn Học phần, Ngày hạn, Giờ dự kiến, Ưu tiên & Gợi ý nhanh */}
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value as '' | WorkspaceSubjectSlug)}
                  aria-label="Học phần cho nhiệm vụ"
                  className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)] focus:border-[var(--accent-os)] focus:outline-none"
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  aria-label="Ngày hạn nhiệm vụ"
                  className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)] focus:border-[var(--accent-os)] focus:outline-none"
                />

                <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1">
                  <Clock className="h-3 w-3 text-[var(--text-muted)]" aria-hidden="true" />
                  <input
                    type="time"
                    data-testid="todo-time-input"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    aria-label="Giờ dự kiến"
                    className="bg-transparent font-mono text-[11px] text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  data-testid="todo-priority-toggle"
                  onClick={() => setTaskPriority((p) => (p === 'high' ? 'normal' : 'high'))}
                  aria-pressed={taskPriority === 'high'}
                  title="Đặt mức ưu tiên cao"
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[10.5px] font-medium transition-colors',
                    taskPriority === 'high'
                      ? 'border-[#B45309]/45 bg-[#FDF8F3] text-[#B45309] dark:border-[#F59E0B]/40 dark:bg-[#241B12] dark:text-[#F59E0B]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-muted)] hover:text-[var(--text-main)]',
                  )}
                >
                  <Flag className="h-3 w-3" aria-hidden="true" />
                  <span>Ưu tiên</span>
                </button>
              </div>

              <button
                type="button"
                data-testid="todo-quick-templates-toggle"
                onClick={() => setShowQuickTemplates((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10.5px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-workspace)] hover:text-[var(--accent-os)]"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span>Gợi ý nhanh</span>
              </button>
            </div>

            {/* Phản hồi rõ ràng khi bấm + Thêm lúc trống hoặc khi thêm thành công */}
            {formNotice && (
              <p
                role="status"
                data-testid="todo-form-notice"
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-medium',
                  formNotice.type === 'hint'
                    ? 'bg-[#FDF8F3] text-[#8C5828] dark:bg-[#231A12] dark:text-[#E5B87A]'
                    : 'bg-[#EDF7F3] text-[#1B5E4A] dark:bg-[#13261F] dark:text-[#6EE7B7]',
                )}
              >
                {formNotice.text}
              </p>
            )}

            {/* Gợi ý thêm nhanh 1-click */}
            {(showQuickTemplates || bucket.tasks.length === 0) && (
              <div
                data-testid="todo-quick-templates"
                className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-hairline)] pt-2"
              >
                <span className="font-mono text-[10px] text-[var(--text-muted)]">Thêm nhanh:</span>
                {QUICK_TASK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.title}
                    type="button"
                    data-testid="todo-quick-template-btn"
                    onClick={() => handleQuickAddTemplate(tpl)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--accent-os)]"
                  >
                    <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>{tpl.title}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Thanh lọc chế độ xem */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'today', label: 'Hôm nay' },
                  { id: 'upcoming', label: 'Sắp tới' },
                  { id: 'done', label: 'Đã xong' },
                ] as const
              ).map((tab) => {
                const isActive = !selectedDateKey && filterMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(null);
                      setFilterMode(tab.id);
                    }}
                    className={cn(
                      'cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-colors',
                      isActive
                        ? 'bg-[#0F7656] text-white'
                        : 'bg-[#F2F6F4] text-[var(--text-secondary)] hover:text-[var(--text-main)] dark:bg-[#0F1715]',
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {selectedDateKey && (
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#0F7656]/40 bg-[#EAF5F0] px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#0F7656] dark:bg-[#132C24] dark:text-[#4AD1A3]"
              >
                <span>Ngày {formatShortVietnameseDate(selectedDateKey)}</span>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Danh sách nhiệm vụ */}
          <div
            data-testid="todo-list-container"
            className="max-h-[340px] space-y-2 overflow-y-auto pr-0.5"
          >
            {filteredTasks.length === 0 ? (
              <div
                data-testid="todo-empty-illustration"
                className="group/empty flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--border-hairline)] bg-gradient-to-br from-[#F7FAF8] via-white to-[#F6F1E7]/50 p-4 sm:flex-row sm:text-left dark:from-[#101916] dark:via-[#141D1A] dark:to-[#1B1914]/60"
              >
                <div
                  style={{ backgroundImage: PLANNER_EMPTY_ASSET.fallbackGradient }}
                  className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-black/[0.06] shadow-2xs sm:w-44 dark:border-white/[0.08]"
                >
                  {!emptyArtworkFailed && (
                    <img
                      src={PLANNER_EMPTY_ASSET.src}
                      alt={PLANNER_EMPTY_ASSET.alt}
                      loading="lazy"
                      decoding="async"
                      onError={() => setEmptyArtworkFailed(true)}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/empty:scale-105 dark:brightness-[0.82]"
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5F0] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#0F7656] dark:bg-[#132C24] dark:text-[#4AD1A3]">
                    <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>Khởi tạo phiên học mới</span>
                  </span>
                  <p className="text-xs leading-relaxed font-medium text-[var(--text-secondary)]">
                    {selectedDateKey
                      ? `Chưa có nhiệm vụ nào cho ngày ${formatShortVietnameseDate(selectedDateKey)}.`
                      : filterMode === 'done'
                        ? 'Chưa có nhiệm vụ hoàn thành nào.'
                        : 'Danh sách đang trống. Nhập mục tiêu phía trên hoặc bấm một gợi ý nhanh để thêm vào lịch.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const subjectMeta = task.subjectSlug
                  ? WORKSPACE_SUBJECT_META[task.subjectSlug]
                  : null;
                const isTodayDue = task.dueDate === todayKey;

                if (editingTaskId === task.id) {
                  return (
                    <form
                      key={task.id}
                      onSubmit={handleSaveTaskEdit}
                      data-testid="todo-edit-form"
                      className="space-y-2 rounded-xl border border-[var(--accent-os)]/50 bg-[var(--bg-surface)] p-2.5"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        aria-label="Sửa tên nhiệm vụ"
                        className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <select
                            value={editSubject}
                            onChange={(e) =>
                              setEditSubject(e.target.value as '' | WorkspaceSubjectSlug)
                            }
                            aria-label="Sửa học phần"
                            className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-1 font-mono text-[10.5px]"
                          >
                            {SUBJECT_OPTIONS.map((opt) => (
                              <option key={opt.label} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            aria-label="Sửa ngày hạn"
                            className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-1 font-mono text-[10.5px]"
                          />
                          <input
                            type="time"
                            value={editDueTime}
                            onChange={(e) => setEditDueTime(e.target.value)}
                            aria-label="Sửa giờ dự kiến"
                            className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-1 font-mono text-[10.5px]"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="cursor-pointer rounded-md px-2 py-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="cursor-pointer rounded-md bg-[var(--accent-os)] px-2.5 py-1 text-[11px] font-semibold text-white"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={task.id}
                    data-testid="todo-item"
                    className={cn(
                      'group flex items-center justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2.5 transition-colors hover:border-[var(--border-strong)]',
                      task.completed && 'bg-[var(--bg-surface)]/60 opacity-75',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        aria-label={
                          task.completed
                            ? `Đánh dấu chưa hoàn thành: ${task.title}`
                            : `Đánh dấu hoàn thành: ${task.title}`
                        }
                        className={cn(
                          'inline-flex h-4.5 w-4.5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors',
                          task.completed
                            ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                            : 'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[var(--accent-os)]',
                        )}
                      >
                        {task.completed && <Check className="h-3 w-3" aria-hidden="true" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-xs font-medium sm:text-[13px]',
                            task.completed
                              ? 'text-[var(--text-muted)] line-through'
                              : 'text-[var(--text-main)]',
                          )}
                        >
                          {task.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {subjectMeta && (
                            <span
                              className={cn(
                                'py-0.2 rounded border px-1.5 font-mono text-[9.5px] font-bold',
                                subjectMeta.pillClass,
                              )}
                            >
                              {subjectMeta.code}
                            </span>
                          )}
                          <span
                            className={cn(
                              'font-mono text-[10px] tabular-nums',
                              isTodayDue && !task.completed
                                ? 'font-semibold text-[var(--accent-heritage)]'
                                : 'text-[var(--text-muted)]',
                            )}
                          >
                            {isTodayDue ? 'Hôm nay' : formatShortVietnameseDate(task.dueDate)}
                          </span>
                          {task.dueTime && (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-[var(--text-muted)] tabular-nums">
                              <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                              <span>{task.dueTime}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditTask(task)}
                        aria-label={`Sửa nhiệm vụ: ${task.title}`}
                        title="Sửa nhiệm vụ"
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] opacity-65 transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] hover:opacity-100"
                      >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTaskPriority(task.id)}
                        aria-label={`Đánh dấu ưu tiên: ${task.title}`}
                        title={task.priority === 'high' ? 'Ưu tiên cao' : 'Đặt ưu tiên cao'}
                        className={cn(
                          'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors',
                          task.priority === 'high'
                            ? 'text-[#B45309] dark:text-[#F59E0B]'
                            : 'text-[var(--text-muted)] opacity-50 hover:opacity-100',
                        )}
                      >
                        <Flag className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Xóa nhiệm vụ: ${task.title}`}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[#8F3D35]"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudyPlannerWidget;
