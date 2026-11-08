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
 * Component đóa hoa hình học 6 cánh (Geometric Floral Bloom)
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

  // Xác định tỉ lệ scale, góc xoay và độ trong suốt cho 3 trạng thái
  let scale = 0;
  let rotate = 0;
  let opacity = 0;

  if (prefersReducedMotion) {
    if (isReached) {
      scale = 0.9;
      rotate = 20;
      opacity = 0.4;
    }
  } else if (isCurrentBloom) {
    scale = 1;
    rotate = 20;
    opacity = 1;
  } else if (isSettledBloom) {
    scale = 0.9;
    rotate = 20;
    opacity = 0.35;
  }

  const angles = [0, 60, 120, 180, 240, 300] as const;
  const outerAngles = [30, 90, 150, 210, 270, 330] as const;

  return (
    <g
      transform={`translate(${station.cx}, ${station.cy})`}
      data-testid={`knowledge-thread-station-${station.threshold}`}
    >
      {/* Điểm nút mốc tĩnh trước khi hoa nở */}
      {!isReached && (
        <circle
          cx="0"
          cy="0"
          r="4.5"
          fill="#CFDADB"
          fillOpacity="0.45"
          stroke="#E1E9EA"
          strokeWidth="1"
        />
      )}

      {/* Hiệu ứng sóng xung kích ripple khi đầu dẫn The Knowledge Thread vừa chạm mốc */}
      {isCurrentBloom && (
        <circle
          cx="0"
          cy="0"
          r="26"
          fill="none"
          stroke="#92714F"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          className="animate-ping"
        />
      )}

      {/* Đóa hoa hình học 6 cánh bung nở (Floral Bloom) */}
      <g
        data-testid="floral-bloom-group"
        transform={`scale(${scale}) rotate(${rotate})`}
        style={{
          transformOrigin: '0px 0px',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 700ms ease-out',
        }}
        opacity={opacity}
      >
        {/* VÒNG CÁNH HOA BUNG TỎA BÊN NGOÀI (Outer Bloom):
            Đường nét viền mảnh #3F6570 mờ 20% xen kẽ đối xứng */}
        {outerAngles.map((angle) => (
          <g key={`outer-petal-${angle}`} transform={`rotate(${angle})`}>
            <path
              d="M 0 0 C -6 -8, -6 -20, 0 -25 C 6 -20, 6 -8, 0 0"
              fill="none"
              stroke="#3F6570"
              strokeWidth="1.1"
              strokeOpacity="0.2"
            />
          </g>
        ))}

        {/* VÒNG CÁNH HOA BÊN TRONG (Inner Petals):
            6 cánh hình học cách điệu màu xanh xô thơm #718C7E mờ 40% */}
        {angles.map((angle) => (
          <g key={`inner-petal-${angle}`} transform={`rotate(${angle})`}>
            <path
              d="M 0 0 C -4.5 -5, -4.5 -13, 0 -17 C 4.5 -13, 4.5 -5, 0 0"
              fill="#718C7E"
              fillOpacity="0.4"
              stroke="#5E786D"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
          </g>
        ))}

        {/* NHỤY HOA TRUNG TÂM (Core):
            Vòng tròn nhỏ 6px (bán kính r=3) màu hổ phách ấm #92714F, phát sáng khi kích hoạt */}
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="#92714F"
          stroke="#F7FAFA"
          strokeWidth="1.2"
          style={{
            filter: isCurrentBloom ? 'drop-shadow(0 0 10px rgba(146, 113, 79, 0.85))' : 'none',
          }}
        />
      </g>
    </g>
  );
}

/**
 * SIGNATURE ELEMENT: THE KNOWLEDGE THREAD (ĐƯỜNG DẪN TRI THỨC XUYÊN SUỐT)
 * Kết nối tuần tự: Hero -> Subject Gallery -> My Learning Orbit -> Footer
 * Tích hợp hiệu ứng Hoa nở (Floral Bloom) tại các điểm nút mốc khi cuộn trang.
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
        </defs>

        {/* Đường dẫn nền tĩnh cực mảnh */}
        <path
          d="M 720 140 C 720 420, 1120 560, 1120 860 C 1120 1160, 320 1320, 320 1640 C 320 1920, 720 2080, 720 2380"
          stroke="#CFDADB"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />

        {/* Đường dẫn động vẽ theo thao tác cuộn trang */}
        <path
          ref={threadPathRef}
          d="M 720 140 C 720 420, 1120 560, 1120 860 C 1120 1160, 320 1320, 320 1640 C 320 1920, 720 2080, 720 2380"
          stroke="#3F6570"
          strokeWidth="1.75"
          strokeOpacity="0.55"
          strokeDasharray={THREAD_PATH_LENGTH}
          strokeDashoffset={threadDashOffset}
          style={{
            transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 180ms ease-out',
          }}
        />

        {/* Glowing Lead Tip tại đầu mút đang di chuyển của The Knowledge Thread */}
        {!prefersReducedMotion && (
          <g
            className="transition-all duration-150 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(146, 113, 79, 0.75))',
            }}
          >
            {/* Vầng hào quang ngoài */}
            <circle cx={leadTip.x} cy={leadTip.y} r="14" fill="#92714F" fillOpacity="0.18" />
            {/* Vầng hào quang giữa */}
            <circle cx={leadTip.x} cy={leadTip.y} r="7" fill="#92714F" fillOpacity="0.38" />
            {/* Hạt nhân phát sáng 6px */}
            <circle
              cx={leadTip.x}
              cy={leadTip.y}
              r="3.5"
              fill="#92714F"
              stroke="#F7FAFA"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* 04 Điểm nút mốc với hiệu ứng Hoa nở (Floral Bloom Animation) */}
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
