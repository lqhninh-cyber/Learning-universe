import { cn } from '@/shared/lib/cn';

/**
 * HỌA TIẾT TRỐNG ĐỒNG ĐÔNG SƠN NÂNG CAO (Dong Son Drum Visual Landmark)
 * Kết hợp 6 vành hoa văn đặc trưng của trống đồng Ngọc Lũ / Hoàng Hạ:
 * - Tâm: Mặt trời 14 tia nhọn xen kẽ họa tiết lông đuôi chim / lông công.
 * - Vành 1: Chuỗi hạt vừng chấm tròn đồng tâm.
 * - Vành 2: Vành răng cưa / răng lược tam giác đối xứng.
 * - Vành 3: Đàn chim Lạc bay sải cánh ngược chiều kim đồng hồ (khí động học cổ điển).
 * - Vành 4: Vòng tròn kép có tâm điểm nối tiếp tuyến.
 * - Vành 5: Hoa văn thổ cẩm quả trám hình thoi liên hoàn.
 * - Vành 6: Vòng nan nón lá xoắn ốc lan tỏa ra không gian 2.5D.
 */
export function DongSonDrumVisual({ className }: { readonly className?: string }) {
  // Tạo 14 cánh mặt trời Đông Sơn
  const sunRays = Array.from({ length: 14 }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / 14;
    const nextAngle = ((i + 0.5) * 2 * Math.PI) / 14;
    const prevAngle = ((i - 0.5) * 2 * Math.PI) / 14;
    const rTip = 72;
    const rBase = 22;
    const xTip = 300 + rTip * Math.cos(angle);
    const yTip = 300 + rTip * Math.sin(angle);
    const xBase1 = 300 + rBase * Math.cos(prevAngle);
    const yBase1 = 300 + rBase * Math.sin(prevAngle);
    const xBase2 = 300 + rBase * Math.cos(nextAngle);
    const yBase2 = 300 + rBase * Math.sin(nextAngle);
    return `M 300 300 L ${xBase1.toFixed(1)} ${yBase1.toFixed(1)} L ${xTip.toFixed(1)} ${yTip.toFixed(1)} L ${xBase2.toFixed(1)} ${yBase2.toFixed(1)} Z`;
  });

  // Tạo 6 chú chim Lạc bay sải cánh ngược chiều kim đồng hồ
  const lacBirds = Array.from({ length: 6 }).map((_, i) => {
    const baseAngle = (i * 2 * Math.PI) / 6;
    const rotDeg = (baseAngle * 180) / Math.PI + 90;
    // Bán kính quỹ đạo bay: r = 180
    const cx = 300 + 178 * Math.cos(baseAngle);
    const cy = 300 + 178 * Math.sin(baseAngle);
    return (
      <g
        key={i}
        transform={`translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(0.85)`}
      >
        {/* Mỏ chim dài, đầu và mắt */}
        <path d="M 0 -22 L 2 -10 L 0 -8 L -2 -10 Z" fill="currentColor" fillOpacity="0.8" />
        <circle cx="0" cy="-9" r="0.8" fill="#8b302d" />
        {/* Thân chim thon vuốt cong */}
        <path
          d="M 0 -8 C 4 -2, 4 8, 0 16 C -4 8, -4 -2, 0 -8 Z"
          fill="currentColor"
          fillOpacity="0.75"
        />
        {/* Cánh phải sải rộng xòe răng lược */}
        <path
          d="M 2 -4 C 12 -8, 26 -4, 32 4 C 24 6, 14 4, 3 2 Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
        <line x1="10" y1="-2" x2="16" y2="3" stroke="currentColor" strokeWidth="0.75" />
        <line x1="18" y1="-1" x2="24" y2="4" stroke="currentColor" strokeWidth="0.75" />
        {/* Cánh trái thuôn gọn */}
        <path
          d="M -2 -4 C -12 -8, -26 -4, -32 4 C -24 6, -14 4, -3 2 Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
        <line x1="-10" y1="-2" x2="-16" y2="3" stroke="currentColor" strokeWidth="0.75" />
        <line x1="-18" y1="-1" x2="-24" y2="4" stroke="currentColor" strokeWidth="0.75" />
        {/* Đuôi chim xòe 3 nhánh bay lượn */}
        <path d="M 0 16 L -5 28 L 0 25 L 5 28 Z" fill="currentColor" fillOpacity="0.7" />
      </g>
    );
  });

  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      {/* Vòng hào quang nền mờ */}
      <circle cx="300" cy="300" r="290" fill="url(#dg-ambient)" />

      {/* 1. Mặt trời 14 tia trung tâm */}
      <circle cx="300" cy="300" r="22" fill="currentColor" fillOpacity="0.85" />
      <circle cx="300" cy="300" r="8" fill="#8b302d" fillOpacity="0.9" />
      {sunRays.map((d, idx) => (
        <path
          key={idx}
          d={d}
          fill="currentColor"
          fillOpacity="0.85"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      ))}

      {/* Vành lông đuôi công xen giữa các tia */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = ((i + 0.5) * 2 * Math.PI) / 14;
        const x1 = 300 + 42 * Math.cos(angle);
        const y1 = 300 + 42 * Math.sin(angle);
        const x2 = 300 + 68 * Math.cos(angle);
        const y2 = 300 + 68 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            strokeOpacity="0.6"
          />
        );
      })}

      {/* 2. Vành hạt vừng (Stippling Ring r = 85..95) */}
      <circle cx="300" cy="300" r="82" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="300" cy="300" r="96" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      {Array.from({ length: 28 }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / 28;
        const cx = 300 + 89 * Math.cos(angle);
        const cy = 300 + 89 * Math.sin(angle);
        return <circle key={i} cx={cx} cy={cy} r="1.5" fill="currentColor" fillOpacity="0.75" />;
      })}

      {/* 3. Vành răng cưa nhọn (Serrated Teeth Ring r = 108..130) */}
      <circle cx="300" cy="300" r="108" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="300" cy="300" r="132" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      {Array.from({ length: 28 }).map((_, i) => {
        const a1 = (i * 2 * Math.PI) / 28;
        const a2 = ((i + 0.5) * 2 * Math.PI) / 28;
        const a3 = ((i + 1) * 2 * Math.PI) / 28;
        const x1 = 300 + 108 * Math.cos(a1);
        const y1 = 300 + 108 * Math.sin(a1);
        const xTip = 300 + 132 * Math.cos(a2);
        const yTip = 300 + 132 * Math.sin(a2);
        const x2 = 300 + 108 * Math.cos(a3);
        const y2 = 300 + 108 * Math.sin(a3);
        return (
          <path
            key={i}
            d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xTip.toFixed(1)} ${yTip.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`}
            stroke="currentColor"
            strokeWidth="0.75"
            fill="currentColor"
            fillOpacity="0.15"
          />
        );
      })}

      {/* 4. Vành chim Lạc bay (Lac Bird Ring r = 145..215) */}
      <circle
        cx="300"
        cy="300"
        r="146"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.8"
      />
      <circle
        cx="300"
        cy="300"
        r="212"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.8"
      />
      {lacBirds}

      {/* 5. Vành vòng tròn kép có tâm (Concentric Eyelets r = 222..244) */}
      <circle cx="300" cy="300" r="222" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="300" cy="300" r="244" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / 24;
        const nextAngle = ((i + 1) * 2 * Math.PI) / 24;
        const cx = 300 + 233 * Math.cos(angle);
        const cy = 300 + 233 * Math.sin(angle);
        const nextCx = 300 + 233 * Math.cos(nextAngle);
        const nextCy = 300 + 233 * Math.sin(nextAngle);
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r="4.5"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeOpacity="0.8"
            />
            <circle cx={cx} cy={cy} r="1.5" fill="currentColor" fillOpacity="0.9" />
            <line
              x1={cx}
              y1={cy}
              x2={nextCx}
              y2={nextCy}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
          </g>
        );
      })}

      {/* 6. Vành thổ cẩm quả trám hình thoi (Diamond Brocade Ring r = 252..276) */}
      <circle
        cx="300"
        cy="300"
        r="252"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.75"
      />
      <circle
        cx="300"
        cy="300"
        r="278"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.75"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const a1 = (i * 2 * Math.PI) / 24;
        const aMid = ((i + 0.5) * 2 * Math.PI) / 24;
        const a2 = ((i + 1) * 2 * Math.PI) / 24;
        const xLeft = 300 + 265 * Math.cos(a1);
        const yLeft = 300 + 265 * Math.sin(a1);
        const xTop = 300 + 278 * Math.cos(aMid);
        const yTop = 300 + 278 * Math.sin(aMid);
        const xRight = 300 + 265 * Math.cos(a2);
        const yRight = 300 + 265 * Math.sin(a2);
        const xBottom = 300 + 252 * Math.cos(aMid);
        const yBottom = 300 + 252 * Math.sin(aMid);
        return (
          <g key={i}>
            <polygon
              points={`${xLeft.toFixed(1)},${yLeft.toFixed(1)} ${xTop.toFixed(1)},${yTop.toFixed(1)} ${xRight.toFixed(1)},${yRight.toFixed(1)} ${xBottom.toFixed(1)},${yBottom.toFixed(1)}`}
              stroke="currentColor"
              strokeWidth="0.75"
              fill="currentColor"
              fillOpacity="0.12"
            />
            <circle
              cx={300 + 265 * Math.cos(aMid)}
              cy={300 + 265 * Math.sin(aMid)}
              r="1"
              fill="currentColor"
            />
          </g>
        );
      })}

      {/* 7. Vành ngoài cùng: Cấu trúc nan nón lá xoắn ốc (Logarithmic Conical Rays) */}
      <circle
        cx="300"
        cy="300"
        r="290"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / 16;
        const x1 = 300 + 278 * Math.cos(angle);
        const y1 = 300 + 278 * Math.sin(angle);
        const x2 = 300 + 298 * Math.cos(angle + 0.08);
        const y2 = 300 + 298 * Math.sin(angle + 0.08);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
        );
      })}

      {/* Định nghĩa Gradient ánh kim đồng */}
      <defs>
        <radialGradient id="dg-ambient" cx="300" cy="300" r="290" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#b89555" stopOpacity="0.12" />
          <stop offset="60%" stopColor="#173e35" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#f7f4ec" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * Họa tiết vòng tròn đồng tâm Đông Sơn (Tương thích ngược nhưng nâng cấp độ sắc nét)
 */
export function DongSonConcentricMotif({ className }: { readonly className?: string }) {
  return <DongSonDrumVisual className={className} />;
}

/**
 * DẢI HOA VĂN HỒI VĂN / RĂNG LƯỢC TRUYỀN THỐNG (Traditional Meander Border)
 * Sử dụng làm dải viền trang nhã dưới Navbar hoặc đỉnh các Card môn học.
 */
export function TraditionalMeanderBorder({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden opacity-80 select-none', className)}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="6"
        viewBox="0 0 400 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
      >
        <pattern id="meander-pat" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
          <path
            d="M 0 5 L 8 5 L 8 1 L 14 1 L 14 3 L 11 3 L 11 4 L 17 4 L 17 1 L 20 1"
            stroke="#b89555"
            strokeWidth="0.8"
            strokeLinecap="square"
          />
          <circle cx="4" cy="2.5" r="0.75" fill="#8b302d" />
        </pattern>
        <rect width="100%" height="6" fill="url(#meander-pat)" />
      </svg>
    </div>
  );
}

/**
 * Biểu tượng Kỷ hà Đối xứng Đại số (Motif môn Cấu trúc đại số)
 * Lấy cảm hứng từ đối xứng nhóm Dihedral D_4, hình thoi Đông Sơn và bảng Cayley.
 */
export function AlgebraicSymmetryMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4 shrink-0', className)}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <path
        d="M12 3L21 12L12 21L3 12L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="12" cy="6" r="1.25" fill="currentColor" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" />
      <circle cx="12" cy="18" r="1.25" fill="currentColor" />
      <circle cx="6" cy="12" r="1.25" fill="currentColor" />
    </svg>
  );
}

/**
 * Biểu tượng Kỷ hà Lưới Phẳng Tọa độ (Motif môn Hình học Affine)
 * Lấy cảm hứng từ lưới mây tre đan, khung mục tiêu Affine và phép trượt không gian.
 */
export function AffineGridMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4 shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M4 18L10 6L20 6L14 18H4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M4 18L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M7 12L17 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 2"
        strokeOpacity="0.6"
      />
      <circle cx="4" cy="18" r="1.75" fill="currentColor" />
      <circle cx="10" cy="6" r="1.5" fill="currentColor" />
      <circle cx="14" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Biểu tượng Kỷ hà Đường cong Giải tích & Tích phân Riemann (Motif môn Giải tích hàm một biến)
 * Lấy cảm hứng từ dấu tích phân ∫, hàm số liên tục lượn sóng và các điểm nút giải tích.
 */
export function CalculusCurveMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4 shrink-0', className)}
      aria-hidden="true"
    >
      <path d="M3 20H21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 21V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M5 16C8 16 9 7 13 8C17 9 17 5 20 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="5" cy="16" r="1.5" fill="currentColor" />
      <circle cx="13" cy="8" r="1.5" fill="currentColor" />
      <circle cx="20" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Dải phân cách mộng gỗ kỷ hà mây tre (Heritage Divider)
 * Phân tầng không gian với nút giao hình thoi hoa văn truyền thống.
 */
export function HeritageDivider({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2.5 py-4 select-none', className)}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ddd5c3] to-[#b89555]/60" />
      <div className="flex items-center gap-1.5 text-[#b89555]">
        <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
          <path
            d="M12 0L22 7L12 14L2 7L12 0Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle cx="12" cy="7" r="2" fill="#8b302d" />
        </svg>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#ddd5c3] to-[#b89555]/60" />
    </div>
  );
}

/**
 * Dải hoa văn đan nan tre Kagome (Lục giác liên hoàn) ở viền Footer
 */
export function KagomeWeaveDivider({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('w-full overflow-hidden py-1.5 opacity-75 select-none', className)}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="10"
        viewBox="0 0 1200 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="5"
          x2="1200"
          y2="5"
          stroke="#ddd5c3"
          strokeWidth="0.75"
          strokeDasharray="6 3 2 3"
        />
        <circle cx="200" cy="5" r="2" fill="#b89555" />
        <circle cx="400" cy="5" r="2.5" fill="#173e35" />
        <circle cx="600" cy="5" r="3" fill="#8b302d" />
        <circle cx="800" cy="5" r="2.5" fill="#173e35" />
        <circle cx="1000" cy="5" r="2" fill="#b89555" />
      </svg>
    </div>
  );
}

/**
 * Họa tiết góc mộc bản đình làng (Woodblock Corner Motif) cho Thư viện tri thức
 */
export function WoodblockCornerMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-vn-accent pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <path
        d="M 2 18 L 2 2 L 18 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
      <rect x="4" y="4" width="3" height="3" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

/* =========================================================================
   6 BIỂU TƯỢNG HÌNH HỌC KỶ HÀ CHO "THƯ VIỆN TRI THỨC" (KNOWLEDGE PILLARS)
   ========================================================================= */

/** 1. Lý thuyết (Theory): Cuốn sách gỗ & tiên đề */
export function TheoryPillarMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <path
        d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H18.5C19.33 3 20 3.67 20 4.5V19.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M4 19.5C4 18.67 4.67 18 5.5 18H20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7H16" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M8 11H14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="17" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

/** 2. Định nghĩa (Definition): La bàn kỷ hà / Điểm chuẩn hóa */
export function DefinitionPillarMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.25" />
      <path d="M12 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 3. Định lý & Bổ đề (Theorem): Kim tự tháp tam giác đối xứng */
export function TheoremPillarMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <polygon
        points="12,3 21,19 3,19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon
        points="12,11 16.5,19 7.5,19"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="12" cy="7" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** 4. Chứng minh (Proof): Chuỗi mắt xích suy luận logic hai chiều */
export function ProofPillarMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="7"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <rect x="11" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M13 10L15 12L13 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 5. Ví dụ trực quan (Examples): Ma trận điểm Cayley / Mô hình cụ thể */
export function ExamplePillarMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="6" r="2" fill="currentColor" />
      <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <circle cx="12" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

/** 6. Bài tập & Lời giải (Exercises & Solutions): Chìa khóa & Thước đo */
export function ExercisePillarMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <path
        d="M14 3L21 10L10 21H3V14L14 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 6L18 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M7 17L8.5 15.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}
