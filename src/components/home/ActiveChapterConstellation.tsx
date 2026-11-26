import type { ManifestSubject } from '@schemas/index';
import { type KeyboardEvent, useId, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  CONSTELLATION_VIEWBOX,
  type ConstellationStarNode,
  type ConstellationStarStatus,
  resolveActiveConstellationData,
} from '@/components/home/constellationGeometry';
import { getSubjects } from '@/content-runtime/manifest';
import { type LastVisitedEntry, useLearningStore } from '@/features/learning';
import { cn } from '@/shared/lib/cn';

export interface ActiveChapterConstellationProps {
  readonly className?: string;
  /** Cho phép truyền danh sách môn học tùy chỉnh (phục vụ kiểm thử đơn vị cô lập). */
  readonly subjectsOverride?: readonly ManifestSubject[];
  readonly completedLessonsOverride?: Readonly<Record<string, string>>;
  readonly lastVisitedGlobalOverride?: LastVisitedEntry | null;
}

const STATUS_LABELS: Readonly<Record<ConstellationStarStatus, string>> = {
  completed: 'Đã xong',
  active: 'Đang học',
  upcoming: 'Chưa học',
};

const STATUS_BADGE_STYLES: Readonly<Record<ConstellationStarStatus, string>> = {
  completed: 'border-[#F6D89B]/35 bg-[#F6D89B]/14 text-[#F6D89B]',
  active: 'border-[#8CE0BD]/40 bg-[#8CE0BD]/16 text-[#8CE0BD]',
  upcoming: 'border-[#FFFAF0]/22 bg-[#FFFAF0]/10 text-[#EDE6D8]',
};

function getTooltipPositionClasses(node: ConstellationStarNode): string {
  const { horizontal, vertical } = node.tooltipPlacement;
  const hClass =
    horizontal === 'left'
      ? 'left-0 translate-x-0'
      : horizontal === 'right'
        ? 'right-0 translate-x-0'
        : 'left-1/2 -translate-x-1/2';
  const vClass = vertical === 'below' ? 'top-full mt-2' : 'bottom-full mb-2';
  return `${hClass} ${vClass}`;
}

/**
 * Chòm Sao Chương Đang Học (`ActiveChapterConstellation`) — SVG tĩnh 0% CPU nhàn rỗi.
 *
 * Biểu diễn các bài học của chương hiện tại dọc theo cung thiên văn chữ S hữu cơ,
 * nổi trực tiếp trên vùng tối góc phải của Hero và cho phép bấm mở thẳng từng bài giảng.
 */
export function ActiveChapterConstellation({
  className,
  subjectsOverride,
  completedLessonsOverride,
  lastVisitedGlobalOverride,
}: ActiveChapterConstellationProps) {
  const navigate = useNavigate();
  const instanceId = useId().replace(/:/g, '');
  const storeCompleted = useLearningStore((state) => state.completedLessons);
  const storeLastVisited = useLearningStore((state) => state.lastVisitedGlobal);

  const subjects = useMemo(() => subjectsOverride ?? getSubjects(), [subjectsOverride]);
  const completedLessons = completedLessonsOverride ?? storeCompleted;
  const lastVisitedGlobal =
    lastVisitedGlobalOverride !== undefined ? lastVisitedGlobalOverride : storeLastVisited;

  const data = useMemo(
    () =>
      resolveActiveConstellationData({
        subjects,
        completedLessons,
        lastVisitedGlobal,
      }),
    [completedLessons, lastVisitedGlobal, subjects],
  );

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  if (!data) {
    return null;
  }

  const activeTooltipNode = highlightedId
    ? (data.nodes.find((node) => node.id === highlightedId) ?? null)
    : null;

  const spinePointsAttr = data.nodes.map((n) => `${n.x},${n.y}`).join(' ');
  const revealMaskId = `constellation-reveal-mask-${instanceId}`;

  const handleStarKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, href: string) => {
    if (event.key === ' ') {
      event.preventDefault();
      navigate(href);
    }
  };

  return (
    <div
      data-testid="active-chapter-constellation"
      data-chapter-key={data.chapterKey}
      data-chapter-completed={data.isChapterCompleted ? 'true' : 'false'}
      role="region"
      aria-label={`Chòm sao tiến độ ${data.subjectTitle} — Chương ${data.chapterNumber}: ${data.chapterTitle}`}
      className={cn(
        'relative aspect-[340/220] w-[268px] shrink-0 select-none lg:w-[340px]',
        className,
      )}
    >
      {/* Vầng sương mực không viền siêu dịu bảo toàn tương phản nét sao trên cả Sáng & Tối */}
      <div
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(66% 64% at 52% 52%, rgba(10, 22, 19, 0.34) 0%, rgba(10, 22, 19, 0.14) 62%, rgba(10, 22, 19, 0) 100%)',
        }}
        className="pointer-events-none absolute -inset-3 rounded-full"
      />

      <svg
        viewBox={`0 0 ${CONSTELLATION_VIEWBOX.width} ${CONSTELLATION_VIEWBOX.height}`}
        fill="none"
        aria-hidden="true"
        className="pointer-events-none relative z-10 block h-full w-full overflow-visible"
      >
        <defs>
          {data.segments
            .filter((seg) => seg.kind === 'to-active')
            .map((seg, idx) => (
              <linearGradient
                key={seg.id}
                id={`constellation-active-grad-${instanceId}-${idx}`}
                gradientUnits="userSpaceOnUse"
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
              >
                <stop offset="0%" stopColor="#F3D299" />
                <stop offset="100%" stopColor="#8CE0BD" />
              </linearGradient>
            ))}

          {data.segments.length > 0 && (
            <mask id={revealMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="340" height="220">
              <polyline
                key={data.chapterKey}
                points={spinePointsAttr}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                className="lu-constellation-reveal"
              />
            </mask>
          )}
        </defs>

        {/* 2 cung thiên cầu mảnh định vị */}
        <path
          d="M 22 44.9 A 420 420 0 0 1 318 44.9"
          stroke="rgba(255, 248, 232, 0.10)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        <path
          d="M 38 173 A 360 360 0 0 0 302 173"
          stroke="rgba(255, 248, 232, 0.10)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />

        {/* 4 điểm mốc vành ngoài đại diện 4 học phần */}
        {data.waypoints.map((wp) => (
          <g
            key={wp.code}
            data-testid={`constellation-waypoint-${wp.slug}`}
            data-active={wp.active ? 'true' : 'false'}
            transform={`translate(${wp.x}, ${wp.y})`}
          >
            {wp.active && <circle r={5.4} fill="rgba(246, 216, 155, 0.22)" />}
            <circle
              r={wp.active ? 2.4 : 1.7}
              fill={wp.active ? '#F6D89B' : 'rgba(255, 248, 232, 0.28)'}
            />
            <text
              y={-6.5}
              textAnchor="middle"
              style={{
                fontSize: '8.5px',
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                letterSpacing: '0.06em',
                paintOrder: 'stroke',
                stroke: 'rgba(8, 18, 15, 0.5)',
                strokeWidth: '2px',
              }}
              fill={wp.active ? 'rgba(255, 248, 232, 0.88)' : 'rgba(255, 248, 232, 0.34)'}
            >
              {wp.code}
            </text>
          </g>
        ))}

        {/* Đường nối chòm sao chạy 1 nhịp stroke-dashoffset 650ms khi mount / đổi chương */}
        <g
          key={`edges-${data.chapterKey}`}
          mask={data.segments.length > 0 ? `url(#${revealMaskId})` : undefined}
        >
          {data.segments.map((seg) => {
            if (seg.kind === 'completed') {
              return (
                <line
                  key={seg.id}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#F3D299"
                  strokeOpacity={0.65}
                  strokeWidth={1.15}
                  strokeLinecap="round"
                />
              );
            }

            if (seg.kind === 'to-active') {
              const gradIdx = data.segments
                .filter((s) => s.kind === 'to-active')
                .findIndex((s) => s.id === seg.id);
              return (
                <line
                  key={seg.id}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke={`url(#constellation-active-grad-${instanceId}-${Math.max(0, gradIdx)})`}
                  strokeOpacity={0.75}
                  strokeWidth={1.15}
                  strokeLinecap="round"
                />
              );
            }

            return (
              <line
                key={seg.id}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke="rgba(255, 250, 240, 0.22)"
                strokeWidth={1.15}
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Các nút sao và nhãn mã bài ngắn */}
        {data.nodes.map((node) => {
          const isHighlighted = highlightedId === node.id;
          const labelDy = node.labelSide === 'above' ? -12.5 : 16.5;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              data-status={node.status}
              data-highlighted={isHighlighted ? 'true' : 'false'}
            >
              {/* Vùng đệm mục tiêu 16px đồng bộ hình học */}
              <circle r={16} fill="transparent" />

              <g className="lu-constellation-star-core">
                {node.status === 'completed' && (
                  <>
                    <circle r={9.5} fill="rgba(246, 216, 155, 0.24)" />
                    <circle r={4.2} fill="#F6D89B" />
                  </>
                )}

                {node.status === 'active' && (
                  <>
                    <circle
                      r={11}
                      fill="none"
                      stroke="#8CE0BD"
                      strokeWidth={1}
                      className="lu-constellation-active-ring"
                    />
                    <circle r={7} fill="rgba(140, 224, 189, 0.18)" />
                    <circle r={4.8} fill="#FFFDF7" />
                  </>
                )}

                {node.status === 'upcoming' && (
                  <circle
                    r={3.4}
                    fill="rgba(18, 32, 28, 0.55)"
                    stroke="rgba(255, 250, 240, 0.48)"
                    strokeWidth={1.1}
                  />
                )}
              </g>

              <text
                y={labelDy}
                textAnchor="middle"
                className="lu-constellation-code tabular-nums"
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontVariantNumeric: 'tabular-nums',
                  paintOrder: 'stroke',
                  stroke: 'rgba(8, 18, 15, 0.62)',
                  strokeWidth: '2.4px',
                  strokeLinejoin: 'round',
                }}
              >
                {node.shortCode}
              </text>
            </g>
          );
        })}

        {/* Nhãn hoàn thành 100% khi trọn vẹn chương đã học xong */}
        {data.isChapterCompleted && (
          <g data-testid="constellation-completed-badge" transform="translate(34, 208)">
            <circle cx={4} cy={-3.5} r={3} fill="#F6D89B" />
            <text
              x={11}
              y={0}
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                letterSpacing: '0.06em',
                paintOrder: 'stroke',
                stroke: 'rgba(8, 18, 15, 0.62)',
                strokeWidth: '2.4px',
              }}
              fill="#F6D89B"
            >
              HOÀN THÀNH 100%
            </text>
          </g>
        )}

        {/* Metadata góc dưới phải: <MÃ MÔN> · CHƯƠNG <X> · <xong>/<tổng> */}
        <text
          data-testid="constellation-metadata-caption"
          x={CONSTELLATION_VIEWBOX.width - 14}
          y={208}
          textAnchor="end"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            paintOrder: 'stroke',
            stroke: 'rgba(8, 18, 15, 0.62)',
            strokeWidth: '2.5px',
            strokeLinejoin: 'round',
          }}
          fill="rgba(255, 250, 240, 0.74)"
        >
          {data.metadataCaption}
        </text>
      </svg>

      {/* Lớp nút tương tác thật (bán kính 16px = 32×32px) cho chuột, bàn phím (Tab/Enter/Space) & trình đọc màn hình */}
      <div className="absolute inset-0 z-20">
        {data.nodes.map((node) => {
          const statusLabel = STATUS_LABELS[node.status];
          const isHighlighted = activeTooltipNode?.id === node.id;
          const tooltipId = `constellation-tooltip-${instanceId}-${node.index}`;

          return (
            <div
              key={node.id}
              style={{
                left: `${(node.x / CONSTELLATION_VIEWBOX.width) * 100}%`,
                top: `${(node.y / CONSTELLATION_VIEWBOX.height) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <Link
                to={node.href}
                tabIndex={0}
                data-testid={`constellation-star-${node.shortCode}`}
                data-star-status={node.status}
                aria-label={`Bài ${node.shortCode}: ${node.title} (${statusLabel})`}
                aria-describedby={isHighlighted ? tooltipId : undefined}
                onMouseEnter={() => setHighlightedId(node.id)}
                onMouseLeave={() => setHighlightedId((prev) => (prev === node.id ? null : prev))}
                onFocus={() => setHighlightedId(node.id)}
                onBlur={() => setHighlightedId((prev) => (prev === node.id ? null : prev))}
                onKeyDown={(e) => handleStarKeyDown(e, node.href)}
                className="block h-8 w-8 rounded-full focus-visible:ring-2 focus-visible:ring-[#F6D89B] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0C1613] focus-visible:outline-none"
              />

              {isHighlighted && (
                <div
                  id={tooltipId}
                  role="tooltip"
                  data-testid="constellation-star-tooltip"
                  data-placement={`${node.tooltipPlacement.vertical}-${node.tooltipPlacement.horizontal}`}
                  style={{
                    backgroundColor: 'rgba(12, 22, 19, 0.90)',
                    borderColor: 'rgba(255, 248, 232, 0.16)',
                  }}
                  className={cn(
                    'pointer-events-none absolute z-30 w-max max-w-[216px] rounded-xl border px-3 py-2 shadow-lg backdrop-blur-md',
                    getTooltipPositionClasses(node),
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] font-semibold text-[#F6D89B] tabular-nums">
                      Bài {node.shortCode}
                    </span>
                    <span
                      className={cn(
                        'rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold',
                        STATUS_BADGE_STYLES[node.status],
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-left text-[11.5px] leading-snug font-medium text-[#FFFDF7]">
                    {node.title}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActiveChapterConstellation;
