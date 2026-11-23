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

  // 7 ngày gần nhất từ heatmapDays (28 ngày -> lấy 7 ô cuối cùng)
  const last7Days = useMemo(() => {
    const slice = metrics.heatmapDays.slice(-7);
    const maxCount = Math.max(1, ...slice.map((c) => c.count));
    const peakIndex = slice.reduce(
      (bestIdx, item, idx) => (item.count >= (slice[bestIdx]?.count ?? -1) ? idx : bestIdx),
      Math.max(0, slice.length - 1),
    );
    return { items: slice, maxCount, peakIndex };
  }, [metrics.heatmapDays]);

  // Tính các cung tròn SVG cho Donut Chart 4 học phần (kiểu Travelie)
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

  // Đường cong xu hướng Spline nối 7 đỉnh hoạt động trong tuần (viewBox 280 x 110)
  const weeklyTrendGeometry = useMemo(() => {
    const pts = last7Days.items.map((cell, idx) => {
      const x = 20 + idx * 40;
      const ratio = cell.count > 0 ? Math.min(1, cell.count / last7Days.maxCount) : 0.08;
      const y = 94 - ratio * 68;
      return { x, y, count: cell.count };
    });
    if (pts.length === 0) return { linePath: '', areaPath: '', pts: [] };
    let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const curr = pts[i]!;
      const next = pts[i + 1]!;
      const cpx1 = curr.x + (next.x - curr.x) * 0.45;
      const cpx2 = curr.x + (next.x - curr.x) * 0.55;
      d += ` C ${cpx1.toFixed(1)} ${curr.y.toFixed(1)}, ${cpx2.toFixed(1)} ${next.y.toFixed(1)}, ${next.x} ${next.y}`;
    }
    const last = pts[pts.length - 1]!;
    const areaPath = `${d} L ${last.x} 106 L ${pts[0]!.x} 106 Z`;
    return { linePath: d, areaPath, pts };
  }, [last7Days]);

  return (
    <section
      aria-label="Biểu đồ nhịp học và phân bổ tiến độ học phần"
      data-testid="dashboard-analytics-card"
      className="relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      {/* Dải trang trí góc trên phải thẻ phân tích */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(15,118,86,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(74,209,163,0.12)_0%,transparent_70%)]"
      />
      {/* Header + Bộ chuyển chế độ viên thuốc kiểu Quixotic */}
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

      {/* Nội dung chính: Biểu đồ Cột Bo Tròn (Trái) + Vòng Tròn Phân Bổ (Phải) */}
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        {/* BIỂU ĐỒ CỘT VIÊN THUỐC BO TRÒN KIỂU QUIXOTIC */}
        <div className="md:col-span-7">
          {chartMode === 'week' ? (
            <div
              data-testid="analytics-week-bars"
              className="relative flex h-[196px] items-end justify-between gap-2.5 overflow-hidden rounded-[20px] border border-black/[0.04] bg-[#F6F8F7] px-4 pt-9 pb-3.5 sm:gap-3.5 dark:border-white/[0.06] dark:bg-[#0F1715]"
            >
              {/* Lưới chia độ chuẩn bản vẽ phía sau biểu đồ cột */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-8 bottom-9 flex flex-col justify-between"
              >
                <span className="block border-t border-dashed border-[#0F7656]/12 dark:border-[#4AD1A3]/12" />
                <span className="block border-t border-dashed border-[#0F7656]/10 dark:border-[#4AD1A3]/10" />
                <span className="block border-t border-dashed border-[#0F7656]/10 dark:border-[#4AD1A3]/10" />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 left-1/2 h-28 w-44 -translate-x-1/2 rounded-full bg-[#0F7656]/[0.07] blur-2xl dark:bg-[#4AD1A3]/[0.09]"
              />
              {/* Đường cong xu hướng Spline + vùng sáng phủ mềm trên biểu đồ cột */}
              {weeklyTrendGeometry.linePath && (
                <svg
                  viewBox="0 0 280 110"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-6 bottom-8 z-[5] h-[calc(100%-3.5rem)] w-[calc(100%-1.5rem)]"
                >
                  <defs>
                    <linearGradient id="weekly-spline-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F7656" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0F7656" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={weeklyTrendGeometry.areaPath} fill="url(#weekly-spline-area)" />
                  <path
                    d={weeklyTrendGeometry.linePath}
                    fill="none"
                    stroke="#D4AF6A"
                    strokeWidth="1.6"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />
                  {weeklyTrendGeometry.pts.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.count > 0 ? 2.8 : 1.8}
                      fill={pt.count > 0 ? '#D4AF6A' : '#9EB0AA'}
                    />
                  ))}
                </svg>
              )}
              {last7Days.items.map((cell, idx) => {
                const isPeak = idx === last7Days.peakIndex;
                const isActive = hoveredIndex === null ? isPeak : hoveredIndex === idx;
                const pct =
                  cell.count > 0
                    ? Math.max(24, Math.round((cell.count / last7Days.maxCount) * 100))
                    : 14;
                const isToday = idx === last7Days.items.length - 1;

                return (
                  <div
                    key={cell.dateKey}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="group relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      {/* Bong bóng số nổi trên đỉnh cột nổi bật giống Quixotic */}
                      {isActive && (
                        <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-[#0F7656] px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-white shadow-sm">
                          {cell.count > 0 ? `+${cell.count}` : '0'}
                        </span>
                      )}

                      <div
                        title={`${cell.shortLabel}: ${cell.count} hoạt động`}
                        style={{ height: `${pct}%` }}
                        className={cn(
                          'w-full max-w-[34px] rounded-full transition-all duration-300',
                          isActive
                            ? 'bg-gradient-to-t from-[#0D664A] to-[#16A073] shadow-[0_10px_22px_-8px_rgba(15,118,86,0.55)]'
                            : cell.count > 0
                              ? 'bg-[#9ED2BF] group-hover:bg-[#5DB496] dark:bg-[#234E40]'
                              : 'bg-[#DCE5E1] dark:bg-[#1C2824]',
                        )}
                      />
                    </div>

                    <span
                      className={cn(
                        'font-mono text-[10px] font-semibold',
                        isToday ? 'text-[#0F7656] dark:text-[#4AD1A3]' : 'text-[var(--text-muted)]',
                      )}
                    >
                      {isToday ? 'Nay' : getShortWeekdayLabel(cell.dateKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              data-testid="analytics-subject-bars"
              className="relative flex h-[196px] items-end justify-between gap-4 overflow-hidden rounded-[20px] border border-black/[0.04] bg-[#F6F8F7] px-5 pt-9 pb-3.5 dark:border-white/[0.06] dark:bg-[#0F1715]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-8 bottom-9 flex flex-col justify-between"
              >
                <span className="block border-t border-dashed border-[#0F7656]/12 dark:border-[#4AD1A3]/12" />
                <span className="block border-t border-dashed border-[#0F7656]/10 dark:border-[#4AD1A3]/10" />
                <span className="block border-t border-dashed border-[#0F7656]/10 dark:border-[#4AD1A3]/10" />
              </div>
              {subjectProgress.map((item, idx) => {
                const heightPct = item.percent > 0 ? Math.max(22, item.percent) : 14;
                const isActive = hoveredIndex === idx;
                return (
                  <div
                    key={item.slug}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      <span
                        className={cn(
                          'pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap transition-transform',
                          isActive
                            ? 'scale-105 bg-[#17332C] text-white'
                            : 'bg-white text-[var(--text-main)] shadow-2xs dark:bg-[#192420]',
                        )}
                      >
                        {item.percent}%
                      </span>
                      <div
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: item.percent > 0 ? item.color : undefined,
                        }}
                        className={cn(
                          'w-full max-w-[44px] rounded-full transition-all duration-300',
                          item.percent === 0 && 'bg-[#DCE5E1] dark:bg-[#1C2824]',
                          isActive && 'brightness-110',
                        )}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] font-bold text-[var(--text-secondary)]">
                      {item.code}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* VÒNG TRÒN PHÂN BỔ TIẾN ĐỘ KIỂU TRAVELIE + VÀNH CHIA ĐỘ THIÊN CẦU */}
        <div
          data-testid="analytics-donut-chart"
          className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[20px] border border-black/[0.04] bg-[#F6F8F7] p-4 sm:flex-row md:col-span-5 md:flex-col lg:flex-row dark:border-white/[0.06] dark:bg-[#0F1715]"
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
                className="text-[#0F7656]/28 dark:text-[#4AD1A3]/25"
              />
              <circle
                cx="58"
                cy="58"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="11"
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
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(4, seg.length - 3)} ${seg.circumference}`}
                      strokeDashoffset={seg.offset}
                      className="transition-all duration-500"
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

          <div className="min-w-0 flex-1 space-y-2">
            <p className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              <PieChart className="h-3 w-3 text-[#0F7656]" aria-hidden="true" />
              <span>Phân bổ theo môn</span>
            </p>
            <ul className="space-y-1.5">
              {subjectProgress.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-center justify-between gap-2 font-mono text-[11px]"
                >
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
