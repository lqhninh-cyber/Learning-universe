import { useEffect, useRef, useState } from 'react';
import { Radar } from 'lucide-react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface RadarSubjectStat {
  readonly slug: string;
  readonly shortCode: string;
  readonly title: string;
  readonly chapters: number;
  readonly lessons: number;
  readonly completed: number;
  readonly percent: number;
  readonly branch: 'math' | 'pedagogy';
}

interface RadarAxisConfig {
  readonly slug: string;
  readonly axisLabel: string;
  readonly shortLabel: string;
  readonly angleRad: number;
  readonly color: string;
  readonly rgb: string;
  readonly pillClass: string;
}

const RADAR_AXES: readonly RadarAxisConfig[] = [
  {
    slug: 'cau-truc-dai-so',
    axisLabel: 'Cấu trúc & Tiên đề',
    shortLabel: 'CTĐS',
    angleRad: -Math.PI / 2, // Top
    color: '#6B5335',
    rgb: '156, 122, 76',
    pillClass: 'border-[#D8D0C0] bg-[#F3F0E8] text-[#6B5335]',
  },
  {
    slug: 'hinh-hoc-affine',
    axisLabel: 'Không gian & Biến hình',
    shortLabel: 'HHAVE',
    angleRad: 0, // Right
    color: '#2D5266',
    rgb: '73, 118, 143',
    pillClass: 'border-[#C9D7DF] bg-[#ECF1F4] text-[#2D5266]',
  },
  {
    slug: 'giai-tich-ham-mot-bien',
    axisLabel: 'Giới hạn & Liên tục',
    shortLabel: 'GTHMB',
    angleRad: Math.PI / 2, // Bottom
    color: '#245746',
    rgb: '59, 122, 101',
    pillClass: 'border-[#C6DBD0] bg-[#EBF2EE] text-[#245746]',
  },
  {
    slug: 'giao-duc-hoc',
    axisLabel: 'Lý luận & Sư phạm',
    shortLabel: 'GDH',
    angleRad: Math.PI, // Left
    color: '#7A463B',
    rgb: '158, 99, 86',
    pillClass: 'border-[#D8C8C1] bg-[#F3ECE9] text-[#7A463B]',
  },
];

export interface CurriculumRadarCardProps {
  readonly stats: readonly RadarSubjectStat[];
  readonly totalCompleted: number;
  readonly totalLessons: number;
}

/**
 * Mô hình 1 (Cột phải - Quỹ đạo học tập cá nhân):
 * Biểu đồ Radar 4 trục tương tác 120fps so sánh Quy mô Học phần & Tiến độ Cá nhân.
 */
export function CurriculumRadarCard({
  stats,
  totalCompleted,
  totalLessons,
}: CurriculumRadarCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSlugRef = useRef<string | null>('cau-truc-dai-so');
  const [activeSlug, setActiveSlug] = useState<string>('cau-truc-dai-so');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    activeSlugRef.current = activeSlug;
  }, [activeSlug]);

  const statsMap = new Map(stats.map((item) => [item.slug, item]));
  const maxLessons = Math.max(1, ...stats.map((item) => item.lessons));

  const footprintValues = RADAR_AXES.map((axis) => {
    const entry = statsMap.get(axis.slug);
    const ratio = entry ? entry.lessons / maxLessons : 0.6;
    return 0.44 + ratio * 0.48; // Giữ đa giác cân đối [0.44 .. 0.92]
  });

  const masteryValues = RADAR_AXES.map((axis) => {
    const entry = statsMap.get(axis.slug);
    if (!entry || entry.completed === 0) return 0.14;
    return Math.min(0.92, 0.16 + (entry.percent / 100) * 0.76);
  });

  const footprintValuesRef = useRef<readonly number[]>(footprintValues);
  const masteryValuesRef = useRef<readonly number[]>(masteryValues);

  useEffect(() => {
    footprintValuesRef.current = footprintValues;
    masteryValuesRef.current = masteryValues;
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(240, container.clientWidth || 320);
    let height = Math.max(200, container.clientHeight || 228);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(240, container.clientWidth || 320);
      height = Math.max(200, container.clientHeight || 228);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    let rafId = 0;
    let isVisible = true;
    let elapsed = 0;
    let prevNow = performance.now();

    const getCenterRadius = () => {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const maxR = Math.min(width, height) * 0.36;
      return { cx, cy, maxR };
    };

    const drawRadar = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const { cx, cy, maxR } = getCenterRadius();
      const focusedSlug = activeSlugRef.current;

      // 4 vòng tròn đồng tâm đo tỷ lệ kèm nhãn chuẩn độ (fx-chart grid)
      for (const ringRatio of [0.25, 0.5, 0.75, 1.0]) {
        const r = maxR * ringRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = ringRatio === 1 ? 'rgba(30, 58, 52, 0.24)' : 'rgba(30, 58, 52, 0.11)';
        ctx.setLineDash(ringRatio === 0.5 || ringRatio === 0.25 ? [3, 4] : []);
        ctx.lineWidth = ringRatio === 1 ? 1.25 : 0.85;
        ctx.stroke();

        if (ringRatio === 0.5 || ringRatio === 1.0) {
          ctx.font = '500 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(74, 93, 88, 0.55)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${Math.round(ringRatio * 100)}%`, cx + 4, cy - r - 2);
        }
      }
      ctx.setLineDash([]);

      // Tia quét Radar mềm mại 120fps
      const sweepAngle = time * 0.55;
      const sweepGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxR);
      sweepGrad.addColorStop(0, 'rgba(36, 87, 70, 0.14)');
      sweepGrad.addColorStop(1, 'rgba(36, 87, 70, 0)');
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - 0.55, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // 4 trục tọa độ
      RADAR_AXES.forEach((axis, idx) => {
        const isFocused = focusedSlug === axis.slug;
        const ex = cx + Math.cos(axis.angleRad) * (maxR + 4);
        const ey = cy + Math.sin(axis.angleRad) * (maxR + 4);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = isFocused ? axis.color : 'rgba(74, 93, 88, 0.28)';
        ctx.lineWidth = isFocused ? 1.8 : 1;
        ctx.stroke();

        // Chấm góc chỉ dấu chiều tư duy ở đầu trục
        const lx = cx + Math.cos(axis.angleRad) * (maxR + 17);
        const ly = cy + Math.sin(axis.angleRad) * (maxR + 14);
        ctx.font = `${isFocused ? '700' : '600'} 10px "JetBrains Mono", monospace`;
        ctx.textAlign = idx === 1 ? 'left' : idx === 3 ? 'right' : 'center';
        ctx.textBaseline = idx === 0 ? 'bottom' : idx === 2 ? 'top' : 'middle';
        ctx.fillStyle = isFocused ? axis.color : '#4A5D58';
        ctx.fillText(axis.shortLabel, lx, ly);
      });

      // Lớp 1: Đa giác Quy mô Học phần (Curriculum Footprint - fx-chart area gradient)
      const currentFootprint = footprintValuesRef.current;
      const currentMastery = masteryValuesRef.current;
      const footprintPts = RADAR_AXES.map((axis, idx) => {
        const pulse = Math.sin(time * 1.4 + idx * 1.1) * 0.015;
        const val = (currentFootprint[idx] ?? 0.6) + pulse;
        return {
          x: cx + Math.cos(axis.angleRad) * (maxR * val),
          y: cy + Math.sin(axis.angleRad) * (maxR * val),
        };
      });

      const footAreaGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, maxR);
      footAreaGrad.addColorStop(0, 'rgba(36, 87, 70, 0.06)');
      footAreaGrad.addColorStop(1, 'rgba(36, 87, 70, 0.22)');

      ctx.beginPath();
      footprintPts.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = footAreaGrad;
      ctx.fill();
      ctx.strokeStyle = '#245746';
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Xung truyền dữ liệu (dg-comet & dg-spark chu kỳ 3.2s) chạy dọc chu vi đa giác Quy mô
      const cycleProgress = ((time % 3.2) / 3.2) * footprintPts.length;
      const edgeIdx = Math.floor(cycleProgress) % footprintPts.length;
      const edgeT = cycleProgress - Math.floor(cycleProgress);
      const pStart = footprintPts[edgeIdx]!;
      const pEnd = footprintPts[(edgeIdx + 1) % footprintPts.length]!;
      const sparkX = pStart.x + (pEnd.x - pStart.x) * edgeT;
      const sparkY = pStart.y + (pEnd.y - pStart.y) * edgeT;
      const tailT = Math.max(0, edgeT - 0.32);
      const tailX = pStart.x + (pEnd.x - pStart.x) * tailT;
      const tailY = pStart.y + (pEnd.y - pStart.y) * tailT;

      const cometGrad = ctx.createLinearGradient(tailX, tailY, sparkX, sparkY);
      cometGrad.addColorStop(0, 'rgba(36, 87, 70, 0)');
      cometGrad.addColorStop(1, 'rgba(59, 122, 101, 0.95)');
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(sparkX, sparkY);
      ctx.strokeStyle = cometGrad;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 122, 101, 0.24)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();

      // Lớp 2: Đa giác Tiến độ Cá nhân (Mastery Overlay)
      const masteryPts = RADAR_AXES.map((axis, idx) => {
        const val = currentMastery[idx] ?? 0.14;
        return {
          x: cx + Math.cos(axis.angleRad) * (maxR * val),
          y: cy + Math.sin(axis.angleRad) * (maxR * val),
        };
      });

      ctx.beginPath();
      masteryPts.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(156, 122, 76, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#9C7A4C';
      ctx.lineWidth = 1.85;
      ctx.stroke();

      // Đỉnh tương tác tại 4 góc của Quy mô & Tiến độ
      RADAR_AXES.forEach((axis, idx) => {
        const fPt = footprintPts[idx]!;
        const mPt = masteryPts[idx]!;
        const isFocused = focusedSlug === axis.slug;

        if (isFocused) {
          const aura = ctx.createRadialGradient(fPt.x, fPt.y, 1, fPt.x, fPt.y, 14);
          aura.addColorStop(0, `rgba(${axis.rgb}, 0.42)`);
          aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(fPt.x, fPt.y, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(fPt.x, fPt.y, isFocused ? 5.2 : 3.8, 0, Math.PI * 2);
        ctx.fillStyle = axis.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(fPt.x, fPt.y, isFocused ? 2.1 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FAFBF9';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mPt.x, mPt.y, 3.1, 0, Math.PI * 2);
        ctx.fillStyle = '#9C7A4C';
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#1E3A34';
      ctx.fill();

      ctx.restore();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const { cx, cy, maxR } = getCenterRadius();

      let nearestSlug: string | null = null;
      let bestDist = 42;
      RADAR_AXES.forEach((axis, idx) => {
        const val = footprintValuesRef.current[idx] ?? 0.6;
        const vx = cx + Math.cos(axis.angleRad) * (maxR * val);
        const vy = cy + Math.sin(axis.angleRad) * (maxR * val);
        const lx = cx + Math.cos(axis.angleRad) * (maxR + 16);
        const ly = cy + Math.sin(axis.angleRad) * (maxR + 14);
        const dist = Math.min(Math.hypot(px - vx, py - vy), Math.hypot(px - lx, py - ly));
        if (dist < bestDist) {
          bestDist = dist;
          nearestSlug = axis.slug;
        }
      });

      if (nearestSlug && nearestSlug !== activeSlugRef.current) {
        setActiveSlug(nearestSlug);
      }
    };

    container.addEventListener('pointermove', handlePointerMove);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => resize());
      ro.observe(container);
    }

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      io.observe(container);
    }

    drawRadar(0.5);
    if (prefersReducedMotion) {
      return () => {
        container.removeEventListener('pointermove', handlePointerMove);
        ro?.disconnect();
        io?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtSeconds;
        drawRadar(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', handlePointerMove);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [prefersReducedMotion]);

  const activeAxis = RADAR_AXES.find((item) => item.slug === activeSlug) ?? RADAR_AXES[0]!;
  const activeStat = statsMap.get(activeAxis.slug);
  const mathLessons = stats
    .filter((item) => item.branch === 'math')
    .reduce((sum, item) => sum + item.lessons, 0);
  const pedLessons = Math.max(0, totalLessons - mathLessons);
  const coveragePercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const activeWeight =
    activeStat && totalLessons > 0 ? Math.round((activeStat.lessons / totalLessons) * 100) : 0;

  return (
    <div
      data-testid="curriculum-radar-card"
      className="lu-fx-card flex flex-1 flex-col justify-between rounded-3xl p-5 sm:p-6"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-lg bg-[#EBF2EE] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-[#245746]">
            CẤU TRÚC &amp; NĂNG LỰC HỌC PHẦN
          </span>
          <Radar className="h-4 w-4 text-[#245746]" aria-hidden="true" />
        </div>

        <h3 className="font-serif text-lg font-bold text-[var(--text-main)] sm:text-xl">
          Biểu đồ Radar Năng lực Học phần
        </h3>

        {/* Chú giải 2 lớp đa giác */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10.5px] text-[#4A5D58]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs border border-[#245746] bg-[#245746]/25" />
            Quy mô học phần
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs border border-[#9C7A4C] bg-[#9C7A4C]/35" />
            Tiến độ cá nhân
          </span>
        </div>

        {/* Canvas Radar 120fps trên nền chấm chuẩn độ lu-dg-ground-dots */}
        <div
          ref={containerRef}
          className="lu-dg-ground-dots relative h-[218px] w-full overflow-hidden rounded-2xl border border-[#D8E0DD] bg-[#F2F4F3]/60"
        >
          <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
        </div>

        {/* 4 Nút chọn đỉnh Radar */}
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Chọn trục phân tích môn">
          {RADAR_AXES.map((axis) => {
            const isSelected = activeAxis.slug === axis.slug;
            return (
              <button
                key={axis.slug}
                type="button"
                data-testid={`radar-axis-${axis.slug}`}
                onMouseEnter={() => setActiveSlug(axis.slug)}
                onClick={() => setActiveSlug(axis.slug)}
                aria-pressed={isSelected}
                className={cn(
                  'cursor-pointer rounded-lg border px-2 py-1 font-mono text-[10px] font-bold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#1E332E] focus-visible:outline-none',
                  isSelected
                    ? axis.pillClass
                    : 'border-[#D8E0DD] bg-[#FAFBF9] text-[#4A5D58] hover:border-[#1E332E]/40 hover:text-[#182624]',
                )}
              >
                {axis.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Bảng phân tích chi tiết của đỉnh Radar đang chọn */}
        {activeStat && (
          <div
            data-testid="radar-detail-panel"
            className="space-y-1 rounded-xl border border-[#D8E0DD] bg-[#F2F4F3]/75 px-3 py-2.5 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#182624]">{activeAxis.axisLabel}</span>
              <span
                className="font-mono text-[10.5px] font-bold"
                style={{ color: activeAxis.color }}
              >
                {activeWeight}% khối lượng
              </span>
            </div>
            <p className="text-[11px] text-[#4A5D58]">
              {activeStat.title} ·{' '}
              <strong className="font-medium text-[#182624]">
                {activeStat.chapters} chương · {activeStat.lessons} bài
              </strong>
            </p>
            <p className="font-mono text-[10.5px] text-[#3F524E]">
              Tiến độ cá nhân: {activeStat.completed}/{activeStat.lessons} bài ({activeStat.percent}
              %)
            </p>
          </div>
        )}
      </div>

      {/* Chỉ số tổng hợp bên dưới */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 text-center">
        <div className="rounded-xl bg-[#F2F4F3]/75 px-2 py-1.5">
          <p className="font-mono text-xs font-bold text-[#182624]">
            {totalCompleted}/{totalLessons}
          </p>
          <p className="text-[10px] text-[#4A5D58]">Bài hoàn thành</p>
        </div>
        <div className="rounded-xl bg-[#F2F4F3]/75 px-2 py-1.5">
          <p className="font-mono text-xs font-bold text-[#245746]">{coveragePercent}%</p>
          <p className="text-[10px] text-[#4A5D58]">Độ bao phủ</p>
        </div>
        <div className="rounded-xl bg-[#F2F4F3]/75 px-2 py-1.5">
          <p className="font-mono text-xs font-bold text-[#6B5335]">
            {mathLessons} / {pedLessons}
          </p>
          <p className="text-[10px] text-[#4A5D58]">Toán / Sư phạm</p>
        </div>
      </div>
    </div>
  );
}
