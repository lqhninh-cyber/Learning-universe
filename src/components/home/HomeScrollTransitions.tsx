import { useId } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

interface FloatingSporeSpec {
  readonly left: string;
  readonly bottom: string;
  readonly size: number;
  readonly delay: string;
  readonly duration: string;
}

const SHORELINE_SPORES: readonly FloatingSporeSpec[] = [
  { left: '8%', bottom: '36%', size: 4, delay: '0s', duration: '5.2s' },
  { left: '16%', bottom: '28%', size: 3, delay: '1.1s', duration: '6.1s' },
  { left: '24%', bottom: '42%', size: 5, delay: '0.5s', duration: '5.6s' },
  { left: '34%', bottom: '32%', size: 3.5, delay: '2.2s', duration: '6.4s' },
  { left: '46%', bottom: '44%', size: 4.5, delay: '1.4s', duration: '5.1s' },
  { left: '57%', bottom: '34%', size: 3, delay: '2.7s', duration: '5.9s' },
  { left: '68%', bottom: '40%', size: 4, delay: '0.8s', duration: '6.3s' },
  { left: '79%', bottom: '30%', size: 5, delay: '1.9s', duration: '5.4s' },
  { left: '89%', bottom: '38%', size: 3.5, delay: '0.3s', duration: '6.0s' },
];

/**
 * KẾT NỐI 1: Shoreline Wave & Mist Bridge
 * Dải sóng bờ vịnh & sương sớm 3 lớp chuyển mượt từ mặt nước Hạ Long (#123831)
 * qua sương ngọc lục bảo (rgba(28,78,69,0.25)) vào nền kem giấy dó / sơn mài (var(--bg-page)).
 */
export function ShorelineWaveBridge() {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();
  const mistWaveGradId = `lu-shore-mist-${uid}`;
  const foamStrokeGradId = `lu-shore-foam-${uid}`;

  return (
    <div
      data-testid="shoreline-wave-bridge"
      aria-hidden="true"
      className="pointer-events-none relative z-10 -mt-24 h-[126px] w-full overflow-hidden select-none sm:-mt-28 sm:h-[144px] lg:h-[156px]"
    >
      {/* Dải sương vịnh hòa tan mềm từ mặt biển Vịnh Hạ Long (trong suốt dần) */}
      <div
        className="absolute inset-x-0 top-0 h-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(18, 56, 49, 0) 0%, rgba(18, 56, 49, 0.42) 48%, rgba(28, 78, 69, 0.16) 80%, rgba(18, 56, 49, 0) 100%)',
        }}
      />

      {/* 3 lớp sóng uốn lượn SVG trôi ngang lệch pha */}
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={mistWaveGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#123831" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#1C4E45" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={foamStrokeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8A85A" stopOpacity="0" />
            <stop offset="28%" stopColor="#F6D383" stopOpacity="0.48" />
            <stop offset="52%" stopColor="#E8A85A" stopOpacity="0.62" />
            <stop offset="78%" stopColor="#8EE5CE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E8A85A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Lớp sóng 1 (sâu): Xanh ngọc lục bảo mặt vịnh #123831 */}
        <g className={prefersReducedMotion ? undefined : 'lu-wave-drift-1'}>
          <path
            d="M -120 44 C 120 12, 340 68, 580 40 C 820 12, 1060 66, 1300 36 C 1420 22, 1520 34, 1580 44 L 1580 140 L -120 140 Z"
            fill={`url(#${mistWaveGradId})`}
          />
        </g>

        {/* Lớp sóng 2 (giữa): Sương ngọc lục bảo mờ rgba(28, 78, 69, 0.25) */}
        <g className={prefersReducedMotion ? undefined : 'lu-wave-drift-2'}>
          <path
            d="M -120 68 C 140 94, 380 38, 660 68 C 940 96, 1180 42, 1440 68 C 1510 76, 1550 72, 1580 68 L 1580 140 L -120 140 Z"
            className="fill-[#1C4E45]/25 dark:fill-[#1C4E45]/45"
          />
          <path
            d="M -120 68 C 140 94, 380 38, 660 68 C 940 96, 1180 42, 1440 68 C 1510 76, 1550 72, 1580 68"
            fill="none"
            stroke={`url(#${foamStrokeGradId})`}
            strokeWidth="1.4"
          />
        </g>

        {/* Lớp sóng 3 (tiền cảnh): Hòa tiệp hoàn toàn vào nền kem/tối var(--bg-page) */}
        <g className={prefersReducedMotion ? undefined : 'lu-wave-drift-3'}>
          <path
            d="M -120 92 C 180 62, 440 116, 740 88 C 1020 62, 1260 114, 1580 86 L 1580 142 L -120 142 Z"
            fill="var(--bg-page)"
          />
        </g>

        {/* Dải đáy khóa mép 2px tuyệt đối không hở viền */}
        <rect x="-120" y="132" width="1700" height="12" fill="var(--bg-page)" />
      </svg>

      {/* Hạt bọt sáng vàng kim bay lơ lửng từ mặt nước lên thềm "Không gian Học phần" */}
      {SHORELINE_SPORES.map((spore, idx) => (
        <span
          key={idx}
          className={
            prefersReducedMotion
              ? 'absolute rounded-full bg-[#E8A85A]/55'
              : 'lu-foam-float absolute rounded-full bg-[#F6D383] shadow-[0_0_8px_rgba(232,168,90,0.65)]'
          }
          style={{
            left: spore.left,
            bottom: spore.bottom,
            width: `${spore.size}px`,
            height: `${spore.size}px`,
            animationDelay: spore.delay,
            animationDuration: spore.duration,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Nền vân đồng mức nước chìm (Subtle Topographic Waterlines) phủ nhẹ xuyên suốt giữa
 * "Không gian Học phần" và "Tiếp tục học tập" tạo chiều sâu liên tục.
 */
export function TopographicWaterlinesBackdrop() {
  return (
    <div
      data-testid="topographic-waterlines"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-[#1B3D2F] opacity-[0.035] select-none dark:text-[#8EE5CE] dark:opacity-[0.06]"
    >
      <svg viewBox="0 0 1440 1200" preserveAspectRatio="none" className="h-full w-full">
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M -80 110 C 260 40, 560 180, 920 110 C 1180 60, 1340 130, 1520 95" />
          <path d="M -80 210 C 220 270, 580 140, 940 220 C 1200 276, 1380 190, 1520 225" />
          <path d="M -80 370 C 310 310, 620 430, 960 360 C 1220 308, 1360 390, 1520 355" />
          <path d="M -80 540 C 240 600, 580 480, 910 550 C 1190 610, 1370 520, 1520 560" />
          <path d="M -80 710 C 280 650, 610 770, 950 700 C 1210 648, 1360 730, 1520 695" />
          <path d="M -80 880 C 240 940, 580 820, 920 890 C 1200 945, 1360 865, 1520 905" />
          <path d="M -80 1050 C 290 990, 620 1110, 960 1040 C 1220 990, 1370 1070, 1520 1035" />
        </g>
      </svg>
    </div>
  );
}

/**
 * KẾT NỐI 2: Golden Compass & Watercourse Spine
 * Cầu nối thủy mặc & Hoa thị la bàn 8 cánh giữa "Không gian Học phần" và "Tiếp tục học tập".
 */
export function GoldenCompassSpineBridge() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      data-testid="golden-compass-spine"
      aria-hidden="true"
      className="relative z-20 flex flex-col items-center justify-center py-2 select-none"
    >
      <div className="relative flex w-full items-center justify-center">
        {/* Trục mạch dọc chuyển sắc vàng đồng - xanh rêu */}
        <div className="h-16 w-[1.5px] bg-gradient-to-b from-transparent via-[#C5A262]/55 to-[#1B3D2F]/45 dark:via-[#E5C378]/65 dark:to-[#8EE5CE]/40" />

        {/* Hai đường gợn sóng mảnh tỏa ngang hai bên từ tâm Hoa Thị */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-12">
          <svg viewBox="0 0 192 10" className="h-[10px] w-32 sm:w-48" fill="none">
            <path
              d="M 192 5 Q 168 1 144 5 T 96 5 T 48 5 T 0 5"
              stroke="url(#lu-spine-ripple-left)"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="lu-spine-ripple-left" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#C5A262" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#C5A262" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <svg viewBox="0 0 192 10" className="h-[10px] w-32 sm:w-48" fill="none">
            <path
              d="M 0 5 Q 24 1 48 5 T 96 5 T 144 5 T 192 5"
              stroke="url(#lu-spine-ripple-right)"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="lu-spine-ripple-right" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C5A262" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#C5A262" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hoa thị La bàn 8 cánh ở tâm cầu nối */}
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#C5A262]/45 bg-[var(--bg-page)] shadow-xs">
          <svg
            viewBox="0 0 24 24"
            className={
              prefersReducedMotion
                ? 'h-5 w-5 text-[#C5A262] dark:text-[#E5C378]'
                : 'lu-compass-spin h-5 w-5 text-[#C5A262] dark:text-[#E5C378]'
            }
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeOpacity="0.45"
            />
            <path
              d="M12 2.8L13.7 9.3L20.2 7.2L15.1 11.4L21.2 12L15.1 12.6L20.2 16.8L13.7 14.7L12 21.2L10.3 14.7L3.8 16.8L8.9 12.6L2.8 12L8.9 11.4L3.8 7.2L10.3 9.3Z"
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * KẾT NỐI 3: Lakeshore Twilight & Lotus Reed Transition
 * Dải chuyển tiếp chạng vạng bờ hồ 3 tầng (cao 168px-196px) xóa bỏ vết cắt ngang giữa
 * nền trang (var(--bg-page)) và mặt nước Hồ Sen Tri Thức (#071A14).
 */
export function LakeshoreLotusTransition() {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();
  const glintGradId = `lu-lake-glint-${uid}`;

  return (
    <div
      data-testid="lakeshore-lotus-transition"
      aria-hidden="true"
      className="lu-lakeshore-sky-wash pointer-events-none relative z-20 h-[176px] w-full overflow-hidden select-none sm:h-[196px]"
    >
      {/* LỚP 2: Đường bờ hồ uốn lượn 3 tầng sóng + vệt gợn nước sáng mảnh */}
      <svg
        viewBox="0 0 1440 190"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={glintGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5C378" stopOpacity="0" />
            <stop offset="30%" stopColor="#A6D9C6" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#E5C378" stopOpacity="0.52" />
            <stop offset="80%" stopColor="#A6D9C6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E5C378" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sóng bờ hồ 1 (sương ngọc xa) */}
        <g className={prefersReducedMotion ? undefined : 'lu-wave-drift-1'}>
          <path
            d="M -120 76 C 180 54, 420 102, 740 74 C 1060 46, 1280 96, 1580 72 L 1580 190 L -120 190 Z"
            fill="#52796F"
            fillOpacity="0.38"
          />
        </g>

        {/* Sóng bờ hồ 2 (bờ rêu trung cảnh) */}
        <g className={prefersReducedMotion ? undefined : 'lu-wave-drift-2'}>
          <path
            d="M -120 104 C 160 128, 460 82, 760 108 C 1060 132, 1300 84, 1580 106 L 1580 190 L -120 190 Z"
            fill="#1B3B32"
            fillOpacity="0.72"
          />
          <path
            d="M 140 112 Q 360 100 580 112 M 820 110 Q 1080 98 1310 112"
            fill="none"
            stroke={`url(#${glintGradId})`}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* Sóng bờ hồ 3 (mặt nước đêm sâu thẳm nối liền vào Hồ Sen) */}
        <g className={prefersReducedMotion ? undefined : 'lu-wave-drift-3'}>
          <path
            d="M -120 138 C 200 114, 500 158, 820 134 C 1100 114, 1340 152, 1580 132 L 1580 192 L -120 192 Z"
            fill="#071A14"
          />
          <path
            d="M 280 140 Q 520 148 760 138 Q 980 128 1190 142"
            fill="none"
            stroke={`url(#${glintGradId})`}
            strokeWidth="1.1"
            strokeOpacity="0.6"
          />
        </g>

        {/* Khóa dải đáy 12px trùng khớp màu mặt hồ #071A14 */}
        <rect x="-120" y="178" width="1700" height="14" fill="#071A14" />
      </svg>

      {/* LỚP 3: Bóng lá sen non, búp sen nhỏ & cụm cỏ thủy sinh đung đưa ở 2 bên bờ hồ */}
      <svg
        viewBox="0 0 1440 190"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* BỜ TRÁI: Cụm cỏ lau, cỏ thủy sinh & lá sen non mềm mại */}
        <g fill="#0A221A" fillOpacity="0.88">
          {/* Cỏ thủy sinh đung đưa nhẹ */}
          <g className={prefersReducedMotion ? undefined : 'lu-reed-sway'}>
            <path d="M 38 186 C 28 148, 22 114, 14 82 C 24 114, 34 148, 46 186 Z" />
            <path d="M 54 186 C 50 142, 54 102, 64 68 C 58 104, 58 144, 62 186 Z" fill="#0E2C22" />
            <path d="M 74 186 C 80 152, 90 120, 102 92 C 88 122, 82 154, 82 186 Z" />
          </g>
          <g className={prefersReducedMotion ? undefined : 'lu-reed-sway-slow'}>
            <path
              d="M 118 186 C 114 152, 106 122, 96 98 C 110 122, 118 152, 126 186 Z"
              fill="#0E2C22"
            />
            {/* Cuống và búp sen non bên trái */}
            <path
              d="M 152 186 Q 150 148 164 118"
              fill="none"
              stroke="#143A2E"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 164 118 C 156 106, 159 92, 168 86 C 175 94, 174 109, 164 118 Z"
              fill="#355B4E"
            />
            <path
              d="M 164 118 C 168 104, 174 96, 170 88 C 165 98, 163 108, 164 118 Z"
              fill="#9E5E72"
              fillOpacity="0.62"
            />
          </g>

          {/* Phiến lá sen non mặt nước ven bờ trái */}
          <ellipse cx="128" cy="170" rx="36" ry="7.5" fill="#0E2E23" fillOpacity="0.82" />
          <ellipse cx="212" cy="176" rx="28" ry="5.5" fill="#092119" fillOpacity="0.76" />
          <path
            d="M 184 184 C 179 164, 181 149, 188 140 C 194 135, 200 137, 206 142 C 198 156, 194 170, 192 184 Z"
            fill="#12362A"
            fillOpacity="0.84"
          />
        </g>

        {/* BỜ PHẢI: Cụm cỏ thủy sinh, búp sen & lá sen non mềm mại */}
        <g fill="#0A221A" fillOpacity="0.88">
          <g className={prefersReducedMotion ? undefined : 'lu-reed-sway-slow'}>
            <path d="M 1398 186 C 1408 146, 1416 112, 1426 80 C 1416 114, 1410 148, 1406 186 Z" />
            <path
              d="M 1378 186 C 1382 142, 1378 102, 1368 70 C 1374 108, 1374 146, 1370 186 Z"
              fill="#0E2C22"
            />
            <path d="M 1352 186 C 1344 152, 1334 122, 1322 96 C 1336 124, 1342 154, 1344 186 Z" />
          </g>
          <g className={prefersReducedMotion ? undefined : 'lu-reed-sway'}>
            <path
              d="M 1296 186 C 1304 154, 1312 126, 1320 104 C 1306 128, 1296 154, 1288 186 Z"
              fill="#0E2C22"
            />
            {/* Cuống và búp sen nhỏ bên phải */}
            <path
              d="M 1258 186 Q 1262 148 1248 116"
              fill="none"
              stroke="#143A2E"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 1248 116 C 1239 105, 1242 91, 1250 85 C 1258 93, 1257 107, 1248 116 Z"
              fill="#355B4E"
            />
            <path
              d="M 1248 116 C 1252 103, 1256 95, 1251 87 C 1246 97, 1246 107, 1248 116 Z"
              fill="#9E5E72"
              fillOpacity="0.62"
            />
          </g>

          {/* Phiến lá sen non ven bờ phải */}
          <ellipse cx="1312" cy="171" rx="38" ry="7.5" fill="#0E2E23" fillOpacity="0.82" />
          <ellipse cx="1224" cy="177" rx="27" ry="5.5" fill="#092119" fillOpacity="0.76" />
        </g>
      </svg>
    </div>
  );
}
