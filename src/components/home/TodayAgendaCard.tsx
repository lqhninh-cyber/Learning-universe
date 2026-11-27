import { AlertCircle, ArrowRight, CalendarCheck, Check, Clock, Star } from 'lucide-react';
import { type FC, useMemo } from 'react';
import {
  toLocalDateKey,
  useWorkspaceStore,
  WORKSPACE_SUBJECT_META,
  type StudyTaskItem,
} from '@/features/workspace';

export interface TodayAgendaCardProps {
  readonly tasks: readonly StudyTaskItem[];
  readonly weekLessonsCount: number;
  readonly targetLessons: number;
  /** Neo cuộn tới khu Lịch biểu đầy đủ (mặc định `#lich-bieu-hoc-tap`) */
  readonly plannerAnchor?: string;
}

const MAX_VISIBLE_TASKS = 3;

/**
 * Thẻ "Hôm nay" — thay cho khối "Điều phối nhanh" (vốn lặp lại toàn bộ lối tắt của Rail trái).
 * Hiển thị việc đến hạn hôm nay + việc quá hạn, cho phép đánh dấu hoàn thành tại chỗ
 * và tóm tắt mục tiêu bài học của tuần.
 */
export const TodayAgendaCard: FC<TodayAgendaCardProps> = ({
  tasks,
  weekLessonsCount,
  targetLessons,
  plannerAnchor = '#lich-bieu-hoc-tap',
}) => {
  const toggleTask = useWorkspaceStore((state) => state.toggleTask);
  const todayKey = toLocalDateKey(new Date());

  const { visible, hiddenCount, overdueCount } = useMemo(() => {
    const due = tasks
      .filter((t) => !t.completed && t.dueDate <= todayKey)
      .sort((a, b) => {
        const aOver = a.dueDate < todayKey ? 0 : 1;
        const bOver = b.dueDate < todayKey ? 0 : 1;
        if (aOver !== bOver) return aOver - bOver;
        const aPri = a.priority === 'high' ? 0 : 1;
        const bPri = b.priority === 'high' ? 0 : 1;
        if (aPri !== bPri) return aPri - bPri;
        return (a.dueTime ?? '99:99').localeCompare(b.dueTime ?? '99:99');
      });
    return {
      visible: due.slice(0, MAX_VISIBLE_TASKS),
      hiddenCount: Math.max(0, due.length - MAX_VISIBLE_TASKS),
      overdueCount: due.filter((t) => t.dueDate < todayKey).length,
    };
  }, [tasks, todayKey]);

  const safeTarget = Math.max(1, targetLessons);
  const weekPct = Math.min(100, Math.round((weekLessonsCount / safeTarget) * 100));

  return (
    <div
      data-testid="dashboard-today-card"
      data-material="deep-emerald"
      className="relative flex min-w-0 flex-col justify-between gap-3.5 overflow-hidden rounded-[26px] border border-white/15 bg-[#17332C] bg-gradient-to-br from-[#127D59] via-[#154C3B] to-[#17332C] p-5 text-white shadow-[0_20px_44px_-16px_rgba(15,82,58,0.42)] lg:col-span-3"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-[#4AD1A3]/18 blur-2xl"
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#A7F3D0] uppercase">
            Hôm nay
          </p>
          <h2 className="font-serif text-lg leading-snug font-semibold text-white">Việc cần làm</h2>
        </div>
        {overdueCount > 0 && (
          <span
            data-testid="today-overdue-badge"
            className="inline-flex items-center gap-1 rounded-full border border-[#F0C87D]/45 bg-black/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#F5D89B]"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {overdueCount} quá hạn
          </span>
        )}
      </div>

      <div className="relative z-10 flex-1">
        {visible.length > 0 ? (
          <ul className="space-y-1.5" aria-label="Việc đến hạn hôm nay">
            {visible.map((task) => {
              const isOverdue = task.dueDate < todayKey;
              const subjectCode = task.subjectSlug
                ? WORKSPACE_SUBJECT_META[task.subjectSlug].code
                : null;
              return (
                <li
                  key={task.id}
                  data-testid="today-task-item"
                  className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/10 px-2.5 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Hoàn thành: ${task.title}`}
                    className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/45 text-transparent transition-colors hover:border-[#A7F3D0] hover:bg-[#A7F3D0]/20 hover:text-[#A7F3D0]"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 truncate text-xs font-medium text-white/95">
                      {task.priority === 'high' && (
                        <Star
                          className="h-3 w-3 shrink-0 fill-[#F0C87D] text-[#F0C87D]"
                          aria-label="Ưu tiên"
                        />
                      )}
                      <span className="truncate">{task.title}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/65">
                      {isOverdue ? (
                        <span className="text-[#F5D89B]">Quá hạn</span>
                      ) : task.dueTime ? (
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                          {task.dueTime}
                        </span>
                      ) : (
                        <span>Trong ngày</span>
                      )}
                      {subjectCode && <span>· {subjectCode}</span>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div
            data-testid="today-empty"
            className="flex items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 px-3 py-3 text-xs text-white/80"
          >
            <CalendarCheck className="h-4 w-4 shrink-0 text-[#A7F3D0]" aria-hidden="true" />
            <span>Không có việc đến hạn. Lên kế hoạch cho buổi học tiếp theo nhé.</span>
          </div>
        )}
      </div>

      <div className="relative z-10 space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-[10px] text-white/75">
            <span>Mục tiêu tuần</span>
            <span data-testid="today-week-goal" className="font-semibold text-white tabular-nums">
              {weekLessonsCount}/{safeTarget} bài
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#A7F3D0] transition-[width] duration-300"
              style={{ width: `${weekPct}%` }}
            />
          </div>
        </div>
        <a
          href={plannerAnchor}
          className="group/today flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/95 transition-colors hover:bg-white/20"
        >
          <span>{hiddenCount > 0 ? `Xem thêm ${hiddenCount} việc` : 'Mở Lịch biểu'}</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-150 group-hover/today:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
};
