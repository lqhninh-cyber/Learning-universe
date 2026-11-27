import { BarChart3, Flame, SlidersHorizontal, Target, X } from 'lucide-react';
import { type FC, type FormEvent, useMemo, useState } from 'react';
import {
  parseLocalDateKey,
  selectActiveWorkspaceBucket,
  useWorkspaceStore,
  type StudyActivityMetrics,
} from '@/features/workspace';
import { cn } from '@/shared/lib/cn';

export interface DashboardAnalyticsCardProps {
  readonly metrics: StudyActivityMetrics;
}

type RhythmViewMode = 'week' | 'heatmap';

const SHORT_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

const HEATMAP_LEVEL_CLASSES: Readonly<Record<0 | 1 | 2 | 3, string>> = {
  0: 'bg-[#E9EFEC] dark:bg-[#1A2421]',
  1: 'bg-[#A7DEC8] dark:bg-[#193B30]',
  2: 'bg-[#3AA981] dark:bg-[#2A6F59]',
  3: 'bg-[#0F7656] dark:bg-[#4AD1A3]',
};

function getShortWeekdayLabel(dateKey: string): string {
  const date = parseLocalDateKey(dateKey);
  return SHORT_WEEKDAYS[date.getDay()] ?? 'T2';
}

/**
 * Thẻ gộp "Nhịp học & Chuyên cần" — hợp nhất biểu đồ cột 7 ngày, bản đồ nhiệt 28 ngày,
 * chuỗi chuyên cần (Streak) và mục tiêu học tập theo tuần vào một không gian thống nhất
 * (loại bỏ hoàn toàn biểu đồ 4 học phần & Donut vốn trùng lặp với 4 thẻ học phần).
 */
export const DashboardAnalyticsCard: FC<DashboardAnalyticsCardProps> = ({ metrics }) => {
  const bucket = useWorkspaceStore(selectActiveWorkspaceBucket);
  const updateWeeklyGoal = useWorkspaceStore((state) => state.updateWeeklyGoal);

  const [viewMode, setViewMode] = useState<RhythmViewMode>('week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredHeatmapIndex, setHoveredHeatmapIndex] = useState<number | null>(null);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [lessonTargetInput, setLessonTargetInput] = useState(
    String(bucket.weeklyGoal.targetLessons),
  );
  const [pomodoroTargetInput, setPomodoroTargetInput] = useState(
    String(bucket.weeklyGoal.targetPomodoros),
  );

  // 7 ngày gần nhất lấy từ cùng mảng 28 ngày
  const last7Days = useMemo(() => {
    const slice = metrics.heatmapDays.slice(-7);
    const rawMax = Math.max(0, ...slice.map((c) => c.count));
    const scaleMax = Math.max(4, Math.ceil(rawMax / 2) * 2);
    const peakIndex = slice.reduce(
      (bestIdx, item, idx) => (item.count >= (slice[bestIdx]?.count ?? -1) ? idx : bestIdx),
      Math.max(0, slice.length - 1),
    );
    return { items: slice, rawMax, scaleMax, peakIndex };
  }, [metrics.heatmapDays]);

  const total7DayActivities = useMemo(
    () => last7Days.items.reduce((sum, cell) => sum + cell.count, 0),
    [last7Days.items],
  );

  const focusedDayIdx =
    hoveredIndex ?? (last7Days.rawMax > 0 ? last7Days.peakIndex : last7Days.items.length - 1);
  const focusedDay = last7Days.items[focusedDayIdx] ?? null;

  const focusedHeatmapIdx = hoveredHeatmapIndex ?? metrics.heatmapDays.length - 1;
  const focusedHeatmapDay = metrics.heatmapDays[focusedHeatmapIdx] ?? null;

  const lessonPct = Math.min(
    100,
    Math.round((metrics.weekLessonsCount / Math.max(1, bucket.weeklyGoal.targetLessons)) * 100),
  );
  const pomodoroPct = Math.min(
    100,
    Math.round((metrics.weekPomodorosCount / Math.max(1, bucket.weeklyGoal.targetPomodoros)) * 100),
  );

  const handleOpenEdit = () => {
    setLessonTargetInput(String(bucket.weeklyGoal.targetLessons));
    setPomodoroTargetInput(String(bucket.weeklyGoal.targetPomodoros));
    setIsEditingGoal(true);
  };

  const handleSaveGoal = (event: FormEvent) => {
    event.preventDefault();
    updateWeeklyGoal({
      targetLessons: Number.parseInt(lessonTargetInput, 10),
      targetPomodoros: Number.parseInt(pomodoroTargetInput, 10),
    });
    setIsEditingGoal(false);
  };

  return (
    <section
      aria-label="Nhịp học, chuỗi chuyên cần, bản đồ nhiệt 28 ngày và mục tiêu tuần"
      data-testid="dashboard-analytics-card"
      className="relative flex h-full min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[26px] border border-[#17332C]/[0.07] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(23,51,44,0.12)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(158,118,59,0.08)_0%,rgba(23,51,44,0.04)_48%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(212,175,106,0.09)_0%,rgba(74,209,163,0.06)_50%,transparent_72%)]"
      />

      {/* Header + Bộ chuyển chế độ 7 ngày ↔ Nhiệt đồ 28 ngày */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#17332C]/[0.07] bg-[#F4F3EC] text-[#17332C] dark:border-white/[0.08] dark:bg-[#192622] dark:text-[#6EE7B7]">
            <BarChart3 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-[17px] leading-tight font-semibold text-[var(--text-main)]">
              Nhịp học &amp; Chuyên cần
            </h2>
            <p className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
              {viewMode === 'week'
                ? `${total7DayActivities} hoạt động trong 7 ngày gần nhất`
                : `${metrics.activeDaysLast28}/28 ngày có hoạt động học tập`}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Chế độ xem nhịp học"
          className="inline-flex rounded-full border border-[#17332C]/[0.08] bg-[#F3F2EC] p-1 dark:border-white/[0.07] dark:bg-[#0E1614]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'week'}
            data-testid="analytics-mode-week"
            onClick={() => {
              setViewMode('week');
              setHoveredIndex(null);
            }}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F7656]',
              viewMode === 'week'
                ? 'bg-[#17332C] text-[#F7F4EC] shadow-xs dark:bg-[#1F5E49] dark:text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'heatmap'}
            data-testid="analytics-mode-heatmap"
            onClick={() => {
              setViewMode('heatmap');
              setHoveredHeatmapIndex(null);
            }}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F7656]',
              viewMode === 'heatmap'
                ? 'bg-[#17332C] text-[#F7F4EC] shadow-xs dark:bg-[#1F5E49] dark:text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            Nhiệt đồ 28 ngày
          </button>
        </div>
      </div>

      {/* Nội dung gộp: Biểu đồ 7 ngày / Nhiệt đồ 28 ngày (Trái 7/12) + Chuỗi & Mục tiêu tuần (Phải 5/12) */}
      <div className="relative z-10 grid flex-1 grid-cols-1 items-stretch gap-5 md:grid-cols-12">
        {/* TRÁI (7/12): CÙNG NGUỒN DỮ LIỆU HOẠT ĐỘNG — 7 NGÀY HOẶC 28 NGÀY */}
        <div className="md:col-span-7">
          {viewMode === 'week' ? (
            <div
              data-testid="analytics-week-bars"
              className="relative flex h-full min-h-[216px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#17332C]/[0.06] bg-[#F7F6F1]/90 px-4 pt-3 pb-3.5 dark:border-white/[0.06] dark:bg-[#101916]"
            >
              {/* Thanh thông số tức thì */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-b border-[#17332C]/[0.07] pb-2 dark:border-white/[0.06]">
                <div className="flex min-w-0 items-center gap-2 font-mono text-[11px]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full transition-colors',
                      focusedDay && focusedDay.count > 0
                        ? 'bg-[#1E5945] shadow-[0_0_0_3px_rgba(30,89,69,0.14)] dark:bg-[#58D2A4]'
                        : 'bg-[#C4C1B6] dark:bg-[#3A4D46]',
                    )}
                  />
                  {focusedDay ? (
                    <span className="truncate text-[var(--text-secondary)]">
                      <strong className="font-semibold text-[var(--text-main)]">
                        {focusedDayIdx === last7Days.items.length - 1
                          ? 'Hôm nay'
                          : getShortWeekdayLabel(focusedDay.dateKey)}
                        , {focusedDay.shortLabel}
                      </strong>
                      <span className="mx-1.5 text-[var(--text-muted)]">·</span>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          focusedDay.count > 0
                            ? 'text-[#1E5945] dark:text-[#6EE7B7]'
                            : 'text-[var(--text-muted)]',
                        )}
                      >
                        {focusedDay.count > 0
                          ? `${focusedDay.count} hoạt động`
                          : 'Chưa có hoạt động'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">7 ngày gần nhất</span>
                  )}
                </div>
                <span className="shrink-0 rounded-full border border-[#9E763B]/20 bg-[#FBF8F1] px-2 py-0.5 font-mono text-[10px] font-medium text-[#7C5A2B] tabular-nums dark:border-[#D4AF6A]/20 dark:bg-[#1B221D] dark:text-[#E2C285]">
                  Đỉnh {last7Days.rawMax}/ngày
                </span>
              </div>

              {/* Khu vực 7 cột rãnh đứng */}
              <div className="relative mt-3 flex min-h-0 flex-1 items-end gap-2">
                <div
                  aria-hidden="true"
                  className="flex h-[calc(100%-22px)] flex-col justify-between pr-1 pb-0.5 font-mono text-[9px] text-[#7A847E] tabular-nums select-none dark:text-[#6E8079]"
                >
                  <span>{last7Days.scaleMax}</span>
                  <span>{last7Days.scaleMax / 2}</span>
                  <span>0</span>
                </div>

                <div className="relative flex h-full min-w-0 flex-1 items-end justify-between gap-2 sm:gap-3">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-1 bottom-[22px] flex flex-col justify-between"
                  >
                    <span className="block border-t border-dashed border-[#17332C]/[0.07] dark:border-white/[0.07]" />
                    <span className="block border-t border-dashed border-[#17332C]/[0.06] dark:border-white/[0.06]" />
                    <span className="block border-t border-[#17332C]/[0.10] dark:border-white/[0.10]" />
                  </div>

                  {last7Days.items.map((cell, idx) => {
                    const isPeak = last7Days.rawMax > 0 && idx === last7Days.peakIndex;
                    const isHovered = hoveredIndex === idx;
                    const isHighlighted = hoveredIndex === null ? isPeak : isHovered;
                    const isToday = idx === last7Days.items.length - 1;
                    const hasActivity = cell.count > 0;
                    const exactPct = (cell.count / last7Days.scaleMax) * 100;
                    const barHeightPct = hasActivity
                      ? Math.max(18, Math.min(100, Math.round(exactPct)))
                      : 0;

                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        aria-label={`${cell.shortLabel}: ${cell.count} hoạt động`}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onFocus={() => setHoveredIndex(idx)}
                        onBlur={() => setHoveredIndex(null)}
                        className="group relative z-10 flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 focus-visible:outline-none"
                      >
                        <div
                          className={cn(
                            'relative flex h-full w-6 max-w-full items-end justify-center rounded-[10px] border border-[#17332C]/[0.045] bg-[#ECEBE3]/75 p-[2px] transition-all duration-200 sm:w-7 dark:border-white/[0.05] dark:bg-white/[0.04]',
                            isHovered &&
                              'border-[#17332C]/22 bg-[#E5EAE6]/85 dark:border-[#58D2A4]/35 dark:bg-[#192A24]',
                          )}
                        >
                          {isHighlighted && hasActivity && (
                            <span
                              style={{ bottom: `calc(${barHeightPct}% + 6px)` }}
                              className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md border border-[#17332C]/14 bg-white px-1.5 py-0.5 font-mono text-[9.5px] leading-none font-bold whitespace-nowrap text-[#17332C] shadow-[0_3px_10px_-3px_rgba(23,51,44,0.22)] dark:border-[#58D2A4]/30 dark:bg-[#192923] dark:text-[#DFF6EC]"
                            >
                              +{cell.count}
                            </span>
                          )}

                          {hasActivity ? (
                            <div
                              style={{ height: `${barHeightPct}%` }}
                              className={cn(
                                'relative w-full overflow-hidden rounded-[7px] transition-all duration-300',
                                isHighlighted
                                  ? 'bg-gradient-to-t from-[#17332C] via-[#1E5643] to-[#3B886C] shadow-[0_6px_14px_-5px_rgba(23,51,44,0.42)] dark:from-[#1B5744] dark:via-[#267D60] dark:to-[#4FD0A3]'
                                  : 'bg-gradient-to-t from-[#7AA896] to-[#9BC2B2] group-hover:from-[#1B4C3C] group-hover:to-[#3B886C] dark:from-[#214B3E] dark:to-[#316B58]',
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'pointer-events-none absolute inset-x-1 top-1 h-[2.5px] rounded-full',
                                  isPeak ? 'bg-[#F4D594]/70' : 'bg-white/30',
                                )}
                              />
                            </div>
                          ) : (
                            <span
                              aria-hidden="true"
                              className={cn(
                                'mb-1 h-[3px] w-3 rounded-full transition-colors duration-200',
                                isHovered
                                  ? 'bg-[#8C5828]/55 dark:bg-[#D4AF6A]/65'
                                  : 'bg-[#CFCDC2] dark:bg-[#2B3B36]',
                              )}
                            />
                          )}
                        </div>

                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none font-semibold transition-colors',
                            isHovered
                              ? 'bg-[#17332C]/10 text-[#17332C] dark:bg-[#58D2A4]/15 dark:text-[#6EE7B7]'
                              : isToday
                                ? 'text-[#1E5945] dark:text-[#6EE7B7]'
                                : 'text-[var(--text-muted)]',
                          )}
                        >
                          {isToday ? 'Nay' : getShortWeekdayLabel(cell.dateKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex h-full min-h-[216px] flex-col justify-between gap-3 rounded-[20px] border border-[#17332C]/[0.06] bg-[#F7F6F1]/90 px-4 pt-3 pb-3.5 dark:border-white/[0.06] dark:bg-[#101916]">
              {/* Thanh thông số tức thì của ô nhiệt đồ */}
              <div className="flex items-center justify-between gap-2 border-b border-[#17332C]/[0.07] pb-2 dark:border-white/[0.06]">
                <div className="flex min-w-0 items-center gap-2 font-mono text-[11px]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      focusedHeatmapDay && focusedHeatmapDay.count > 0
                        ? 'bg-[#0F7656] dark:bg-[#4AD1A3]'
                        : 'bg-[#C4C1B6] dark:bg-[#3A4D46]',
                    )}
                  />
                  {focusedHeatmapDay && (
                    <span className="truncate text-[var(--text-secondary)]">
                      <strong className="font-semibold text-[var(--text-main)]">
                        {focusedHeatmapIdx === metrics.heatmapDays.length - 1
                          ? 'Hôm nay'
                          : getShortWeekdayLabel(focusedHeatmapDay.dateKey)}
                        , {focusedHeatmapDay.shortLabel}
                      </strong>
                      <span className="mx-1.5 text-[var(--text-muted)]">·</span>
                      <span className="font-semibold text-[#0F7656] tabular-nums dark:text-[#4AD1A3]">
                        {focusedHeatmapDay.count} hoạt động
                      </span>
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-mono text-[10px] font-semibold text-[#0F7656] tabular-nums dark:text-[#4AD1A3]">
                  {metrics.activeDaysLast28}/28 ngày
                </span>
              </div>

              {/* Lưới 28 ngày (7 cột × 4 hàng) */}
              <div
                data-testid="study-activity-heatmap"
                className="grid grid-cols-7 gap-1.5 sm:gap-2"
                aria-label="Lưới 28 ngày hoạt động học tập gần nhất"
              >
                {metrics.heatmapDays.map((cell, idx) => (
                  <button
                    key={cell.dateKey}
                    type="button"
                    data-level={cell.level}
                    title={`${cell.shortLabel}: ${cell.count} hoạt động`}
                    aria-label={`${cell.shortLabel}: ${cell.count} hoạt động`}
                    onMouseEnter={() => setHoveredHeatmapIndex(idx)}
                    onMouseLeave={() => setHoveredHeatmapIndex(null)}
                    onFocus={() => setHoveredHeatmapIndex(idx)}
                    onBlur={() => setHoveredHeatmapIndex(null)}
                    className={cn(
                      'h-7 w-full cursor-pointer rounded-[7px] transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F7656]',
                      HEATMAP_LEVEL_CLASSES[cell.level],
                      idx === metrics.heatmapDays.length - 1 &&
                        'ring-1 ring-[#0F7656]/60 ring-offset-1 ring-offset-[#F7F6F1] dark:ring-[#4AD1A3]/60 dark:ring-offset-[#101916]',
                    )}
                  />
                ))}
              </div>

              {/* Thang cường độ */}
              <div className="flex items-center justify-between gap-2 font-mono text-[9.5px] text-[var(--text-muted)]">
                <span>4 tuần gần nhất</span>
                <div className="flex items-center gap-1">
                  <span>Ít</span>
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#E9EFEC] dark:bg-[#1A2421]" />
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#A7DEC8] dark:bg-[#193B30]" />
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#3AA981] dark:bg-[#2A6F59]" />
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#0F7656] dark:bg-[#4AD1A3]" />
                  <span>Nhiều</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PHẢI (5/12): CHUỖI CHUYÊN CẦN + MỤC TIÊU TUẦN (GỘP TỪ StudyRhythmCard) */}
        <div className="flex flex-col justify-between gap-3.5 rounded-[20px] border border-[#17332C]/[0.06] bg-[#FAF9F5] p-4 md:col-span-5 dark:border-white/[0.06] dark:bg-[#101916]">
          {/* 1. Chuỗi ngày học */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E7] text-[#C27824] dark:bg-[#261D12] dark:text-[#E5A95C]">
                <Flame className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[9.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  Chuỗi chuyên cần
                </p>
                <p
                  data-testid="study-streak-value"
                  className="font-serif text-xl leading-tight font-semibold text-[var(--text-main)] tabular-nums"
                >
                  {metrics.currentStreak}{' '}
                  <span className="font-sans text-[11.5px] font-normal text-[var(--text-secondary)]">
                    ngày liên tiếp
                  </span>
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--border-hairline)] bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums dark:bg-[#141D1A]">
              Kỷ lục {metrics.bestStreak}d
            </span>
          </div>

          {/* 2. Mục tiêu tuần này */}
          <div
            data-testid="weekly-study-goal-card"
            className="flex flex-1 flex-col justify-between gap-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                <Target className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
                <span>Mục tiêu tuần</span>
              </span>
              <button
                type="button"
                data-testid="weekly-goal-edit-toggle"
                onClick={() => (isEditingGoal ? setIsEditingGoal(false) : handleOpenEdit())}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]"
              >
                {isEditingGoal ? (
                  <>
                    <X className="h-3 w-3" aria-hidden="true" />
                    <span>Hủy</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                    <span>Tùy chỉnh</span>
                  </>
                )}
              </button>
            </div>

            {isEditingGoal ? (
              <form
                onSubmit={handleSaveGoal}
                data-testid="weekly-goal-form"
                className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-2.5"
              >
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="block font-mono text-[9.5px] text-[var(--text-muted)]">
                      Bài / tuần
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={lessonTargetInput}
                      onChange={(e) => setLessonTargetInput(e.target.value)}
                      aria-label="Mục tiêu số bài mỗi tuần"
                      className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 font-mono text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block font-mono text-[9.5px] text-[var(--text-muted)]">
                      Pomodoro / tuần
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={pomodoroTargetInput}
                      onChange={(e) => setPomodoroTargetInput(e.target.value)}
                      aria-label="Mục tiêu số phiên Pomodoro mỗi tuần"
                      className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 font-mono text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-[var(--accent-os)] py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                >
                  Lưu mục tiêu tuần
                </button>
              </form>
            ) : (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Bài giảng hoàn thành</span>
                    <span
                      data-testid="weekly-goal-lessons-ratio"
                      className="font-mono text-[11px] font-semibold text-[var(--text-main)] tabular-nums"
                    >
                      {metrics.weekLessonsCount}/{bucket.weeklyGoal.targetLessons}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent-os)] transition-[width] duration-300"
                      style={{
                        width: `${Math.max(lessonPct, metrics.weekLessonsCount > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Phiên tập trung Pomodoro</span>
                    <span
                      data-testid="weekly-goal-pomodoro-ratio"
                      className="font-mono text-[11px] font-semibold text-[var(--text-main)] tabular-nums"
                    >
                      {metrics.weekPomodorosCount}/{bucket.weeklyGoal.targetPomodoros}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent-heritage)] transition-[width] duration-300"
                      style={{
                        width: `${Math.max(pomodoroPct, metrics.weekPomodorosCount > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardAnalyticsCard;
