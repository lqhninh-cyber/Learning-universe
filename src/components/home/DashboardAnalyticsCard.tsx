import { BarChart3, PieChart } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import type { StudyActivityMetrics } from '@/features/workspace';
import { cn } from '@/shared/lib/cn';

export interface SubjectProgressDatum {
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly color: string;
  readonly completedCount: number;
  readonly lessonCount: number;
  readonly percent: number;
}

export interface DashboardAnalyticsCardProps {
  readonly metrics: StudyActivityMetrics;
  readonly subjectProgress: readonly SubjectProgressDatum[];
  readonly totalPercent: number;
  readonly completedCount: number;
  readonly totalLessons: number;
}

type ChartMode = 'week' | 'subjects';

const VI_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

function getShortWeekdayLabel(dateKey: string): string {
  const m = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
  return VI_WEEKDAYS[d.getDay()] ?? '';
}

export const DashboardAnalyticsCard: FC<DashboardAnalyticsCardProps> = ({
  metrics,
  subjectProgress,
  totalPercent,
  completedCount,
  totalLessons,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSubjectSlug, setHoveredSubjectSlug] = useState<string | null>(null);

  // 7 ngày gần nhất từ heatmapDays (28 ngày -> lấy 7 ô cuối cùng)
  const last7Days = useMemo(() => {
    const slice = metrics.heatmapDays.slice(-7);
    const rawMax = Math.max(0, ...slice.map((c) => c.count));
    // Giữ trần tỷ lệ tối thiểu = 3 để 1 hoạt động trông cân đối, không bị đẩy kịch trần
    const scaleMax = Math.max(3, rawMax);
    const peakIndex = slice.reduce(
      (bestIdx, item, idx) => (item.count >= (slice[bestIdx]?.count ?? -1) ? idx : bestIdx),
      Math.max(0, slice.length - 1),
    );
    return { items: slice, rawMax, scaleMax, peakIndex };
  }, [metrics.heatmapDays]);

  // Tính các cung tròn SVG cho Donut Chart 4 học phần
  const donutSegments = useMemo(() => {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const safeTotal = Math.max(1, totalLessons);
    const segments: (SubjectProgressDatum & {
      readonly length: number;
      readonly offset: number;
      readonly circumference: number;
    })[] = [];
    let cumulative = 0;

    for (const item of subjectProgress) {
      const fraction = item.completedCount / safeTotal;
      const length = fraction * circumference;
      const offset = -cumulative;
      cumulative += length;
      segments.push({
        ...item,
        length,
        offset,
        circumference,
      });
    }

    return segments;
  }, [subjectProgress, totalLessons]);

  const total7DayActivities = useMemo(
    () => last7Days.items.reduce((sum, cell) => sum + cell.count, 0),
    [last7Days.items],
  );

  // Ngày đang được chọn/hover (mặc định hiển thị ngày đạt đỉnh trong tuần)
  const focusedDayIdx =
    hoveredIndex ?? (last7Days.rawMax > 0 ? last7Days.peakIndex : last7Days.items.length - 1);
  const focusedDay = last7Days.items[focusedDayIdx] ?? null;
  const focusedSubject =
    hoveredIndex !== null ? (subjectProgress[hoveredIndex] ?? null) : (subjectProgress[0] ?? null);

  return (
    <section
      aria-label="Biểu đồ nhịp học và phân bổ tiến độ học phần"
      data-testid="dashboard-analytics-card"
      className="relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      {/* Dải sáng nền tinh tế góc trên phải */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(15,118,86,0.10)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(74,209,163,0.12)_0%,transparent_70%)]"
      />

      {/* Header + Bộ chuyển chế độ viên thuốc */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EAF5F0] text-[#0F7656] dark:bg-[#132C24] dark:text-[#4AD1A3]">
            <BarChart3 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-[17px] leading-tight font-semibold text-[var(--text-main)]">
              Nhịp học & Tiến độ trực quan
            </h2>
            <p className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
              {chartMode === 'week'
                ? `${total7DayActivities} hoạt động trong 7 ngày gần nhất`
                : `${completedCount}/${totalLessons} bài giảng hoàn thành toàn chương trình`}
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-full border border-[var(--border-hairline)] bg-[#F2F5F3] p-1 dark:bg-[#0E1614]">
          <button
            type="button"
            data-testid="analytics-mode-week"
            onClick={() => {
              setChartMode('week');
              setHoveredIndex(null);
            }}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-all duration-150',
              chartMode === 'week'
                ? 'bg-[#0F7656] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            data-testid="analytics-mode-subjects"
            onClick={() => {
              setChartMode('subjects');
              setHoveredIndex(null);
            }}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-all duration-150',
              chartMode === 'subjects'
                ? 'bg-[#0F7656] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            4 học phần
          </button>
        </div>
      </div>

      {/* Nội dung chính: Biểu đồ Cột Rãnh Thanh Lịch (Trái) + Vòng Tròn Phân Bổ (Phải) */}
      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-12">
        {/* BIỂU ĐỒ CỘT KIẾN TRÚC RÃNH DỌC */}
        <div className="md:col-span-7">
          {chartMode === 'week' ? (
            <div
              data-testid="analytics-week-bars"
              className="relative flex h-[212px] flex-col justify-between overflow-hidden rounded-[20px] border border-black/[0.05] bg-[#F7F9F8] px-4 pt-3 pb-3.5 dark:border-white/[0.06] dark:bg-[#0F1715]"
            >
              {/* Thanh thông số tức thì phía trên (thay hoàn toàn tooltip mặc định thô của trình duyệt) */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-b border-black/[0.05] pb-2 dark:border-white/[0.06]">
                <div className="flex min-w-0 items-center gap-2 font-mono text-[11px]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full transition-colors',
                      focusedDay && focusedDay.count > 0
                        ? 'bg-[#0F7656] shadow-[0_0_0_3px_rgba(15,118,86,0.16)] dark:bg-[#4AD1A3]'
                        : 'bg-[#B5C4BE] dark:bg-[#3A4D46]',
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
                            ? 'text-[#0F7656] dark:text-[#4AD1A3]'
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
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--text-muted)] tabular-nums ring-1 ring-black/[0.05] dark:bg-[#16221E] dark:ring-white/[0.07]">
                  Đỉnh {last7Days.rawMax}/ngày
                </span>
              </div>

              {/* Khu vực cột + trục chia độ mảnh */}
              <div className="relative mt-3 flex min-h-0 flex-1 items-end gap-2">
                {/* Cột chia độ trục tung bên trái */}
                <div
                  aria-hidden="true"
                  className="flex h-[calc(100%-22px)] flex-col justify-between pr-1 pb-0.5 font-mono text-[9px] text-[var(--text-muted)]/75 tabular-nums select-none"
                >
                  <span>{last7Days.scaleMax}</span>
                  <span>{Math.ceil(last7Days.scaleMax / 2)}</span>
                  <span>0</span>
                </div>

                {/* Vùng vẽ 7 cột rãnh đứng */}
                <div className="relative flex h-full min-w-0 flex-1 items-end justify-between gap-2 sm:gap-3">
                  {/* 3 đường lưới ngang siêu mảnh khớp chính xác trục tung */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-1 bottom-[22px] flex flex-col justify-between"
                  >
                    <span className="block border-t border-dashed border-black/[0.06] dark:border-white/[0.07]" />
                    <span className="block border-t border-dashed border-black/[0.05] dark:border-white/[0.06]" />
                    <span className="block border-t border-black/[0.08] dark:border-white/[0.09]" />
                  </div>

                  {last7Days.items.map((cell, idx) => {
                    const isPeak = last7Days.rawMax > 0 && idx === last7Days.peakIndex;
                    const isHovered = hoveredIndex === idx;
                    const isHighlighted = hoveredIndex === null ? isPeak : isHovered;
                    const isToday = idx === last7Days.items.length - 1;
                    const hasActivity = cell.count > 0;
                    const barHeightPct = hasActivity
                      ? Math.max(
                          24,
                          Math.min(100, Math.round((cell.count / last7Days.scaleMax) * 100)),
                        )
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
                        className="group relative z-10 flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 focus:outline-none"
                      >
                        {/* Rãnh nền thẳng đứng đồng đều cho mọi ngày */}
                        <div
                          className={cn(
                            'relative flex h-full w-6 max-w-full items-end justify-center rounded-[10px] bg-black/[0.035] p-[2px] transition-all duration-200 sm:w-7 dark:bg-white/[0.045]',
                            isHovered &&
                              'bg-[#0F7656]/[0.07] ring-1 ring-[#0F7656]/25 dark:bg-[#4AD1A3]/[0.08] dark:ring-[#4AD1A3]/30',
                          )}
                        >
                          {/* Nhãn số bám sát ngay trên đỉnh cột (chỉ hiện khi có hoạt động hoặc đang hover) */}
                          {isHighlighted && hasActivity && (
                            <span
                              style={{ bottom: `calc(${barHeightPct}% + 5px)` }}
                              className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md bg-[#113128] px-1.5 py-0.5 font-mono text-[9.5px] leading-none font-bold whitespace-nowrap text-white shadow-sm dark:bg-[#4AD1A3] dark:text-[#082018]"
                            >
                              +{cell.count}
                            </span>
                          )}

                          {hasActivity ? (
                            <div
                              style={{ height: `${barHeightPct}%` }}
                              className={cn(
                                'relative w-full overflow-hidden rounded-[8px] transition-all duration-300',
                                isHighlighted
                                  ? 'bg-gradient-to-t from-[#0D664A] via-[#138A63] to-[#24BC8B] shadow-[0_8px_18px_-6px_rgba(15,118,86,0.55)]'
                                  : 'bg-gradient-to-t from-[#5CB597] to-[#87CEB5] group-hover:from-[#12845F] group-hover:to-[#24BC8B] dark:from-[#1E5644] dark:to-[#2D7A62]',
                              )}
                            >
                              {/* Điểm nhấn ánh sáng mảnh trên đỉnh cột */}
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-1 top-1 h-[3px] rounded-full bg-white/35"
                              />
                            </div>
                          ) : (
                            /* Ngày 0 hoạt động: vạch neo đáy tinh tế thay vì cục xám to thô */
                            <span
                              aria-hidden="true"
                              className={cn(
                                'mb-1 h-1 w-3 rounded-full transition-colors duration-200',
                                isHovered
                                  ? 'bg-[#0F7656]/55 dark:bg-[#4AD1A3]/60'
                                  : 'bg-[#C4D1CC] dark:bg-[#2B3B36]',
                              )}
                            />
                          )}
                        </div>

                        {/* Nhãn thứ trong tuần */}
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none font-semibold transition-colors',
                            isHovered
                              ? 'bg-[#0F7656]/12 text-[#0F7656] dark:bg-[#4AD1A3]/15 dark:text-[#4AD1A3]'
                              : isToday
                                ? 'text-[#0F7656] dark:text-[#4AD1A3]'
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
            <div
              data-testid="analytics-subject-bars"
              className="relative flex h-[212px] flex-col justify-between overflow-hidden rounded-[20px] border border-black/[0.05] bg-[#F7F9F8] px-4 pt-3 pb-3.5 dark:border-white/[0.06] dark:bg-[#0F1715]"
            >
              {/* Thanh thông số học phần đang chọn */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-b border-black/[0.05] pb-2 dark:border-white/[0.06]">
                {focusedSubject ? (
                  <div className="flex min-w-0 items-center gap-2 font-mono text-[11px]">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: focusedSubject.color }}
                    />
                    <span className="truncate font-semibold text-[var(--text-main)]">
                      {focusedSubject.title}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    Tiến độ 4 học phần
                  </span>
                )}
                {focusedSubject && (
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums ring-1 ring-black/[0.05] dark:bg-[#16221E] dark:ring-white/[0.07]">
                    {focusedSubject.completedCount}/{focusedSubject.lessonCount} bài ·{' '}
                    {focusedSubject.percent}%
                  </span>
                )}
              </div>

              <div className="relative mt-3 flex min-h-0 flex-1 items-end justify-between gap-4 px-2">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-2 top-1 bottom-[24px] flex flex-col justify-between"
                >
                  <span className="block border-t border-dashed border-black/[0.06] dark:border-white/[0.07]" />
                  <span className="block border-t border-dashed border-black/[0.05] dark:border-white/[0.06]" />
                  <span className="block border-t border-black/[0.08] dark:border-white/[0.09]" />
                </div>

                {subjectProgress.map((item, idx) => {
                  const hasProgress = item.percent > 0;
                  const heightPct = hasProgress ? Math.max(18, item.percent) : 0;
                  const isActive = hoveredIndex === idx;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onFocus={() => setHoveredIndex(idx)}
                      onBlur={() => setHoveredIndex(null)}
                      className="relative z-10 flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 focus:outline-none"
                    >
                      <div
                        className={cn(
                          'relative flex h-full w-9 max-w-full items-end justify-center rounded-[12px] bg-black/[0.035] p-[2.5px] transition-all duration-200 sm:w-11 dark:bg-white/[0.045]',
                          isActive && 'ring-1 ring-[#0F7656]/30 dark:ring-[#4AD1A3]/30',
                        )}
                      >
                        <span
                          style={{
                            bottom: hasProgress ? `calc(${heightPct}% + 5px)` : '10px',
                          }}
                          className={cn(
                            'pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md px-1.5 py-0.5 font-mono text-[9.5px] leading-none font-bold whitespace-nowrap tabular-nums transition-transform',
                            isActive
                              ? 'scale-105 bg-[#17332C] text-white shadow-xs dark:bg-[#4AD1A3] dark:text-[#082018]'
                              : 'bg-white/90 text-[var(--text-main)] shadow-2xs dark:bg-[#192420]',
                          )}
                        >
                          {item.percent}%
                        </span>

                        {hasProgress ? (
                          <div
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: item.color,
                            }}
                            className={cn(
                              'relative w-full overflow-hidden rounded-[9px] transition-all duration-300',
                              isActive && 'brightness-110',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-1.5 top-1 h-[3px] rounded-full bg-white/30"
                            />
                          </div>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="mb-1 h-1 w-4 rounded-full bg-[#C4D1CC] dark:bg-[#2B3B36]"
                          />
                        )}
                      </div>

                      <span className="font-mono text-[10.5px] leading-none font-bold text-[var(--text-secondary)]">
                        {item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* VÒNG TRÒN PHÂN BỔ TIẾN ĐỘ + THANH MINI ĐỒNG BỘ HOVER */}
        <div
          data-testid="analytics-donut-chart"
          className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[20px] border border-black/[0.05] bg-[#F7F9F8] p-4 sm:flex-row md:col-span-5 md:flex-col lg:flex-row dark:border-white/[0.06] dark:bg-[#0F1715]"
        >
          <div className="relative h-30 w-30 shrink-0">
            <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90" aria-hidden="true">
              {/* Vành chia độ trắc địa siêu mảnh xung quanh biểu đồ vòng */}
              <circle
                cx="58"
                cy="58"
                r="53"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeDasharray="2 5"
                className="text-[#0F7656]/25 dark:text-[#4AD1A3]/22"
              />
              <circle
                cx="58"
                cy="58"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-[#E2EAE6] dark:text-[#1D2A26]"
              />
              {donutSegments.map(
                (seg) =>
                  seg.completedCount > 0 && (
                    <circle
                      key={seg.slug}
                      cx="58"
                      cy="58"
                      r="42"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={hoveredSubjectSlug === seg.slug ? 12 : 10}
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(4, seg.length - 3)} ${seg.circumference}`}
                      strokeDashoffset={seg.offset}
                      opacity={hoveredSubjectSlug && hoveredSubjectSlug !== seg.slug ? 0.35 : 1}
                      className="transition-all duration-300"
                    />
                  ),
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-lg font-bold text-[var(--text-main)] tabular-nums">
                {totalPercent}%
              </span>
              <span className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase">
                Tổng tiến độ
              </span>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-2">
            <p className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              <PieChart className="h-3 w-3 text-[#0F7656] dark:text-[#4AD1A3]" aria-hidden="true" />
              <span>Phân bổ theo môn</span>
            </p>
            <ul className="space-y-2">
              {subjectProgress.map((item) => (
                <li
                  key={item.slug}
                  onMouseEnter={() => setHoveredSubjectSlug(item.slug)}
                  onMouseLeave={() => setHoveredSubjectSlug(null)}
                  className="group space-y-1 rounded-lg px-1 py-0.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="flex min-w-0 items-center gap-1.5 text-[var(--text-secondary)]">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-semibold text-[var(--text-main)]">
                        {item.code}
                      </span>
                    </span>
                    <span className="shrink-0 text-[var(--text-muted)] tabular-nums">
                      {item.completedCount}/{item.lessonCount}
                    </span>
                  </div>
                  {/* Thanh tiến độ mini đồng bộ màu học phần */}
                  <div className="h-1 w-full overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.07]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardAnalyticsCard;
