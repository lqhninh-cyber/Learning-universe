import type React from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

export interface KnowledgeThreadStation {
  readonly cx: number;
  readonly cy: number;
  readonly threshold: number;
  readonly name: string;
}

/**
 * 04 Điểm nút mốc chuyên khảo (Knowledge Thread Stations)
 * kết nối tuần tự: Hero -> Subject Gallery -> My Learning Orbit -> Footer
 */
export const KNOWLEDGE_THREAD_STATIONS: readonly KnowledgeThreadStation[] = [
  { cx: 720, cy: 140, threshold: 0.02, name: 'Khởi đầu Hero' },
  { cx: 1120, cy: 860, threshold: 0.32, name: 'Spatial Subject Gallery' },
  { cx: 320, cy: 1640, threshold: 0.68, name: 'My Learning Orbit' },
  { cx: 720, cy: 2380, threshold: 0.92, name: 'Chân trang Tri thức' },
] as const;

export const THREAD_PATH_LENGTH = 2400;

export interface KnowledgeThreadProps {
  readonly pageScrollProgress: number;
  readonly leadTip: { x: number; y: number };
  readonly threadPathRef?: React.RefObject<SVGPathElement | null>;
  readonly prefersReducedMotion?: boolean;
}

/**
 * Component Đóa Hoa Sen Việt Nam nguyên bản đa tầng (Authentic Lotus Bloom)
 * tại mỗi trạm dừng của Đường dẫn tri thức.
 */
interface FloralStationBloomProps {
  readonly station: KnowledgeThreadStation;
  readonly pageScrollProgress: number;
  readonly prefersReducedMotion: boolean;
}

function FloralStationBloom({
  station,
  pageScrollProgress,
  prefersReducedMotion,
}: FloralStationBloomProps) {
  const isReached = pageScrollProgress >= station.threshold;
  const isCurrentBloom =
    !prefersReducedMotion && isReached && pageScrollProgress < station.threshold + 0.16;
  const isSettledBloom = isReached && !isCurrentBloom;

  // Xác định tỉ lệ scale và độ trong suốt cho các trạng thái
  let overallScale = 0;
  let overallOpacity = 0;

  if (prefersReducedMotion) {
    if (isReached) {
      overallScale = 0.95;
      overallOpacity = 0.45;
    }
  } else if (isCurrentBloom) {
    overallScale = 1;
    overallOpacity = 1;
  } else if (isSettledBloom) {
    overallScale = 0.95;
    overallOpacity = 0.45;
  }

  // Góc của 6 cánh hoa lớn lớp ngoài: 60 độ mỗi cánh
  const outerAngles = [0, 60, 120, 180, 240, 300] as const;
  // Góc của 4 cánh hoa nhỏ lớp trong: ôm nhẹ, lệch đối xứng
  const innerAngles = [45, 135, 225, 315] as const;

  // Dáng cánh sen chuẩn: bầu tròn ở giữa, thuôn nhọn ở đầu mút
  const outerPetalPath = 'M 0 0 C -9 -8, -12 -20, 0 -28 C 12 -20, 9 -8, 0 0';
  const innerPetalPath = 'M 0 0 C -6 -6, -8 -14, 0 -20 C 8 -14, 6 -6, 0 0';

  return (
    <g
      transform={`translate(${station.cx}, ${station.cy})`}
      data-testid={`knowledge-thread-station-${station.threshold}`}
    >
      {/* Điểm nút mốc tĩnh trước khi sen nở */}
      {!isReached && (
        <circle
          cx="0"
          cy="0"
          r="4.5"
          fill="#D9DFD9"
          fillOpacity="0.5"
          stroke="#B85D6F"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
      )}

      {/* Hiệu ứng sóng xung kích ripple khi đầu dẫn The Knowledge Thread vừa chạm mốc */}
      {isCurrentBloom && (
        <circle
          cx="0"
          cy="0"
          r="28"
          fill="none"
          stroke="#C89738"
          strokeWidth="1.2"
          strokeOpacity="0.45"
          className="animate-ping"
        />
      )}

      {/* Đóa Hoa Sen Việt Nam nguyên bản đa tầng bung nở */}
      <g
        data-testid="floral-bloom-group"
        data-testid-lotus="lotus-bloom"
        transform={`scale(${overallScale})`}
        opacity={overallOpacity}
        style={{
          transformOrigin: '0px 0px',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 800ms ease-out',
        }}
      >
        {/* LỚP 1: 6 CÁNH HOA LỚN LỚP NGOÀI XÒE RỘNG (rotate 15deg với độ trễ 120ms) */}
        <g
          data-testid="lotus-outer-petals"
          transform={isCurrentBloom || isSettledBloom ? 'rotate(15)' : 'rotate(0)'}
          style={{
            transformOrigin: '0px 0px',
            transition: prefersReducedMotion
              ? 'none'
              : 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 120ms',
          }}
        >
          {outerAngles.map((angle) => (
            <g key={`outer-petal-${angle}`} transform={`rotate(${angle})`}>
              <path
                d={outerPetalPath}
                fill="url(#lotusOuterPetal)"
                stroke="#B85D6F"
                strokeWidth="0.8"
                strokeOpacity="0.65"
              />
            </g>
          ))}
        </g>

        {/* LỚP 2: 4 CÁNH HOA NHỎ LỚP TRONG ÔM NHẸ (rotate 0deg) */}
        <g
          data-testid="lotus-inner-petals"
          transform="rotate(0)"
          style={{
            transformOrigin: '0px 0px',
            transition: prefersReducedMotion
              ? 'none'
              : 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {innerAngles.map((angle) => (
            <g key={`inner-petal-${angle}`} transform={`rotate(${angle})`}>
              <path
                d={innerPetalPath}
                fill="url(#lotusInnerPetal)"
                stroke="#A84C5E"
                strokeWidth="0.75"
                strokeOpacity="0.75"
              />
            </g>
          ))}
        </g>

        {/* LỚP 3: TÂM ĐÀI SEN (GƯƠNG SEN) VÀNG NHỤY VỚI 5 CHẤM HẠT SEN */}
        <g
          data-testid="lotus-core-group"
          style={{
            filter: isCurrentBloom
              ? 'drop-shadow(0 0 14px #C89738)'
              : 'drop-shadow(0 0 3px rgba(200, 151, 56, 0.35))',
            transition: prefersReducedMotion ? 'none' : 'filter 800ms ease-out',
          }}
        >
          {/* Gương sen vàng tròn */}
          <circle cx="0" cy="0" r="5.5" fill="url(#lotusCore)" stroke="#C89738" strokeWidth="0.8" />
          {/* 5 chấm li ti biểu trưng hạt sen */}
          <circle cx="0" cy="0" r="0.8" fill="#5A4010" />
          <circle cx="2" cy="1.8" r="0.65" fill="#5A4010" />
          <circle cx="-2" cy="1.8" r="0.65" fill="#5A4010" />
          <circle cx="-2" cy="-1.8" r="0.65" fill="#5A4010" />
          <circle cx="2" cy="-1.8" r="0.65" fill="#5A4010" />
        </g>
      </g>
    </g>
  );
}

/**
 * SIGNATURE ELEMENT: THE KNOWLEDGE THREAD (ĐƯỜNG DẪN TRI THỨC XUYÊN SUỐT)
 * Kết nối tuần tự: Hero -> Subject Gallery -> My Learning Orbit -> Footer
 * Tích hợp hiệu ứng Hoa sen bung nở (Authentic Lotus Bloom Animation) tại các điểm nút mốc.
 */
export function KnowledgeThread({
  pageScrollProgress,
  leadTip,
  threadPathRef,
  prefersReducedMotion: propPrefersReducedMotion,
}: KnowledgeThreadProps) {
  const hookPrefersReducedMotion = useReducedMotion();
  const prefersReducedMotion = propPrefersReducedMotion ?? hookPrefersReducedMotion;

  const threadDashOffset = prefersReducedMotion
    ? 0
    : Math.round(THREAD_PATH_LENGTH * (1 - Math.max(0.14, pageScrollProgress)));

  return (
    <div
      data-testid="the-knowledge-thread"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-10 hidden overflow-hidden lg:block"
    >
      <svg viewBox="0 0 1440 2400" preserveAspectRatio="none" className="h-full w-full" fill="none">
        <defs>
          <filter id="thread-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>

          {/* Gradient Cánh Sen Lớp Ngoài */}
          <linearGradient id="lotusOuterPetal" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FCF5F7" />
            <stop offset="60%" stopColor="#E896A7" />
            <stop offset="100%" stopColor="#B85D6F" />
          </linearGradient>

          {/* Gradient Cánh Sen Lớp Trong */}
          <linearGradient id="lotusInnerPetal" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FDEEF1" />
            <stop offset="100%" stopColor="#A84C5E" />
          </linearGradient>

          {/* Gradient Tâm Nhụy Sen / Gương Sen */}
          <radialGradient id="lotusCore">
            <stop offset="0%" stopColor="#E5AF42" />
            <stop offset="70%" stopColor="#C89738" />
            <stop offset="100%" stopColor="#8C651E" />
          </radialGradient>
        </defs>

        {/* Đường dẫn nền tĩnh mảnh sắc viền gốm sứ */}
        <path
          d="M 720 140 C 720 420, 1120 560, 1120 860 C 1120 1160, 320 1320, 320 1640 C 320 1920, 720 2080, 720 2380"
          stroke="#D9DFD9"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />

        {/* Đường dẫn động vẽ theo thao tác cuộn trang */}
        <path
          ref={threadPathRef}
          d="M 720 140 C 720 420, 1120 560, 1120 860 C 1120 1160, 320 1320, 320 1640 C 320 1920, 720 2080, 720 2380"
          stroke="#B85D6F"
          strokeWidth="1.75"
          strokeOpacity="0.65"
          strokeDasharray={THREAD_PATH_LENGTH}
          strokeDashoffset={threadDashOffset}
          style={{
            transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 180ms ease-out',
          }}
        />

        {/* Glowing Lead Tip tại đầu bút dẫn đường với sắc vàng nhụy và hồng sen */}
        {!prefersReducedMotion && (
          <g
            className="transition-all duration-150 ease-out"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(200, 151, 56, 0.85))',
            }}
          >
            {/* Vầng hào quang ngoài */}
            <circle cx={leadTip.x} cy={leadTip.y} r="14" fill="#C89738" fillOpacity="0.2" />
            {/* Vầng hào quang giữa */}
            <circle cx={leadTip.x} cy={leadTip.y} r="7" fill="#B85D6F" fillOpacity="0.35" />
            {/* Hạt nhân phát sáng 6px */}
            <circle
              cx={leadTip.x}
              cy={leadTip.y}
              r="3.5"
              fill="#C89738"
              stroke="#FAF9F6"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* 04 Điểm nút mốc với hiệu ứng Hoa sen bung nở (Lotus Bloom Animation) */}
        {KNOWLEDGE_THREAD_STATIONS.map((station) => (
          <FloralStationBloom
            key={station.threshold}
            station={station}
            pageScrollProgress={pageScrollProgress}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </svg>
    </div>
  );
}
