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
    // Trần tỷ lệ chẵn (tối thiểu 4) để 3 mốc trục tung luôn nguyên chính xác (0, scaleMax/2, scaleMax)
    const scaleMax = Math.max(4, Math.ceil(rawMax / 2) * 2);
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
      className="relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[26px] border border-[#17332C]/[0.07] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(23,51,44,0.12)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      {/* Dải màu giấy ấm & lục thông dịu nhẹ hòa nhập với toàn trang */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(158,118,59,0.08)_0%,rgba(23,51,44,0.04)_48%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(212,175,106,0.09)_0%,rgba(74,209,163,0.06)_50%,transparent_72%)]"
      />

      {/* Header + Bộ chuyển chế độ viên thuốc hòa sắc xanh thông trầm */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#17332C]/[0.07] bg-[#F4F3EC] text-[#17332C] dark:border-white/[0.08] dark:bg-[#192622] dark:text-[#6EE7B7]">
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

        <div className="inline-flex rounded-full border border-[#17332C]/[0.08] bg-[#F3F2EC] p-1 dark:border-white/[0.07] dark:bg-[#0E1614]">
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
                ? 'bg-[#17332C] text-[#F7F4EC] shadow-xs dark:bg-[#1F5E49] dark:text-white'
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
                ? 'bg-[#17332C] text-[#F7F4EC] shadow-xs dark:bg-[#1F5E49] dark:text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            4 học phần
          </button>
        </div>
      </div>

      {/* Nội dung chính: Biểu đồ Cột Rãnh Ấm (Trái) + Vòng Tròn Phân Bổ (Phải) */}
      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-12">
        {/* BIỂU ĐỒ CỘT KIẾN TRÚC RÃNH DỌC ĐỒNG BỘ SẮC GỐM SỨ & RỪNG THÔNG */}
        <div className="md:col-span-7">
          {chartMode === 'week' ? (
            <div
              data-testid="analytics-week-bars"
              className="relative flex h-[212px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#17332C]/[0.06] bg-[#F7F6F1]/90 px-4 pt-3 pb-3.5 dark:border-white/[0.06] dark:bg-[#101916]"
            >
              {/* Thanh thông số tức thì phía trên */}
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

              {/* Khu vực cột + trục chia độ chính xác */}
              <div className="relative mt-3 flex min-h-0 flex-1 items-end gap-2">
                {/* Cột chia độ trục tung bên trái (chẵn tuyệt đối: 4 / 2 / 0) */}
                <div
                  aria-hidden="true"
                  className="flex h-[calc(100%-22px)] flex-col justify-between pr-1 pb-0.5 font-mono text-[9px] text-[#7A847E] tabular-nums select-none dark:text-[#6E8079]"
                >
                  <span>{last7Days.scaleMax}</span>
                  <span>{last7Days.scaleMax / 2}</span>
                  <span>0</span>
                </div>

                {/* Vùng vẽ 7 cột rãnh đứng */}
                <div className="relative flex h-full min-w-0 flex-1 items-end justify-between gap-2 sm:gap-3">
                  {/* 3 đường lưới ngang mảnh ấm khớp chính xác trục tung */}
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
                        className="group relative z-10 flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 focus:outline-none"
                      >
                        {/* Rãnh nền thẳng đứng sắc giấy kem dịu, hòa nhập hoàn toàn vào thẻ */}
                        <div
                          className={cn(
                            'relative flex h-full w-6 max-w-full items-end justify-center rounded-[10px] border border-[#17332C]/[0.045] bg-[#ECEBE3]/75 p-[2px] transition-all duration-200 sm:w-7 dark:border-white/[0.05] dark:bg-white/[0.04]',
                            isHovered &&
                              'border-[#17332C]/22 bg-[#E5EAE6]/85 dark:border-[#58D2A4]/35 dark:bg-[#192A24]',
                          )}
                        >
                          {/* Nhãn số ceramic trắng viền mảnh bám sát ngay trên đỉnh cột */}
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
                              {/* Ánh vàng đồng nhẹ trên đỉnh cột nổi bật */}
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'pointer-events-none absolute inset-x-1 top-1 h-[2.5px] rounded-full',
                                  isPeak ? 'bg-[#F4D594]/70' : 'bg-white/30',
                                )}
                              />
                            </div>
                          ) : (
                            /* Ngày 0 hoạt động: vạch neo đáy sắc đá ấm rất thanh */
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

                        {/* Nhãn thứ trong tuần */}
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
            <div
              data-testid="analytics-subject-bars"
              className="relative flex h-[212px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#17332C]/[0.06] bg-[#F7F6F1]/90 px-4 pt-3 pb-3.5 dark:border-white/[0.06] dark:bg-[#101916]"
            >
              {/* Thanh thông số học phần đang chọn */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-b border-[#17332C]/[0.07] pb-2 dark:border-white/[0.06]">
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
                  <span className="shrink-0 rounded-full border border-[#17332C]/[0.07] bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums dark:border-white/[0.07] dark:bg-[#16221E]">
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
                  <span className="block border-t border-dashed border-[#17332C]/[0.07] dark:border-white/[0.07]" />
                  <span className="block border-t border-dashed border-[#17332C]/[0.06] dark:border-white/[0.06]" />
                  <span className="block border-t border-[#17332C]/[0.10] dark:border-white/[0.10]" />
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
                          'relative flex h-full w-9 max-w-full items-end justify-center rounded-[12px] border border-[#17332C]/[0.045] bg-[#ECEBE3]/75 p-[2.5px] transition-all duration-200 sm:w-11 dark:border-white/[0.05] dark:bg-white/[0.04]',
                          isActive && 'border-[#17332C]/25 dark:border-[#58D2A4]/35',
                        )}
                      >
                        <span
                          style={{
                            bottom: hasProgress ? `calc(${heightPct}% + 6px)` : '10px',
                          }}
                          className={cn(
                            'pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] leading-none font-bold whitespace-nowrap tabular-nums transition-transform',
                            isActive
                              ? 'scale-105 border-[#17332C] bg-[#17332C] text-[#F7F4EC] shadow-xs dark:border-[#58D2A4] dark:bg-[#1F5E49] dark:text-white'
                              : 'border-[#17332C]/10 bg-white/95 text-[var(--text-main)] shadow-2xs dark:border-white/10 dark:bg-[#192420]',
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
                              'relative w-full overflow-hidden rounded-[8px] transition-all duration-300',
                              isActive && 'brightness-110',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-1.5 top-1 h-[2.5px] rounded-full bg-white/30"
                            />
                          </div>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="mb-1 h-[3px] w-4 rounded-full bg-[#CFCDC2] dark:bg-[#2B3B36]"
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
          className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[20px] border border-[#17332C]/[0.06] bg-[#F7F6F1]/90 p-4 sm:flex-row md:col-span-5 md:flex-col lg:flex-row dark:border-white/[0.06] dark:bg-[#101916]"
        >
          <div className="relative h-30 w-30 shrink-0">
            <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90" aria-hidden="true">
              {/* Vành chia độ trắc địa siêu mảnh đồng bộ sắc đồng-thông */}
              <circle
                cx="58"
                cy="58"
                r="53"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeDasharray="2 5"
                className="text-[#9E763B]/30 dark:text-[#D4AF6A]/25"
              />
              <circle
                cx="58"
                cy="58"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-[#E6E4DB] dark:text-[#1D2A26]"
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
              <PieChart className="h-3 w-3 text-[#1E5945] dark:text-[#6EE7B7]" aria-hidden="true" />
              <span>Phân bổ theo môn</span>
            </p>
            <ul className="space-y-2">
              {subjectProgress.map((item) => (
                <li
                  key={item.slug}
                  onMouseEnter={() => setHoveredSubjectSlug(item.slug)}
                  onMouseLeave={() => setHoveredSubjectSlug(null)}
                  className="group space-y-1 rounded-lg px-1 py-0.5 transition-colors hover:bg-[#17332C]/[0.04] dark:hover:bg-white/[0.04]"
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
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[#E6E4DB] dark:bg-white/[0.07]">
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
