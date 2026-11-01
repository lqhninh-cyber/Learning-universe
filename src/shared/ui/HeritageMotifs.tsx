import { cn } from '@/shared/lib/cn';

/**
 * Họa tiết vòng tròn đồng tâm Đông Sơn (Đồ họa nền Hero)
 * Lớp 1: Di sản tri thức — Vòng tròn lan tỏa tri thức toán học.
 */
export function DongSonConcentricMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <circle
        cx="300"
        cy="300"
        r="48"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle cx="300" cy="300" r="96" stroke="currentColor" strokeWidth="0.75" />
      <circle
        cx="300"
        cy="300"
        r="148"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <circle cx="300" cy="300" r="204" stroke="currentColor" strokeWidth="0.75" />
      <circle
        cx="300"
        cy="300"
        r="256"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="6 4"
      />
      <circle cx="300" cy="300" r="290" stroke="currentColor" strokeWidth="0.75" />

      {/* 8 tia mặt trời kỷ hà hình thoi tối giản */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 300 + 48 * Math.cos(angle);
        const y1 = 300 + 48 * Math.sin(angle);
        const x2 = 300 + 290 * Math.cos(angle);
        const y2 = 300 + 290 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        );
      })}

      {/* Điểm nhấn vòng tròn ngoại vi */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * Math.PI) / 8;
        const cx = 300 + 204 * Math.cos(angle);
        const cy = 300 + 204 * Math.sin(angle);
        return <circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" fillOpacity="0.6" />;
      })}
    </svg>
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
 * Dải phân cách mộng gỗ kỷ hà mây tre (Heritage Divider)
 * Phân tầng không gian với nút giao hình thoi hoa văn truyền thống.
 */
export function HeritageDivider({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2.5 py-4 select-none', className)}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ddd5c3] to-[#b89555]/50" />
      <div className="flex items-center gap-1 text-[#b89555]">
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path
            d="M10 0L17 6L10 12L3 6L10 0Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <circle cx="10" cy="6" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#ddd5c3] to-[#b89555]/50" />
    </div>
  );
}

/**
 * Dải hoa văn đan nan tre Kagome (Lục giác liên hoàn) ở viền Footer
 */
export function KagomeWeaveDivider({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('w-full overflow-hidden py-1 opacity-60 select-none', className)}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="8"
        viewBox="0 0 1200 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="4"
          x2="1200"
          y2="4"
          stroke="#ddd5c3"
          strokeWidth="0.75"
          strokeDasharray="6 3 2 3"
        />
        <circle cx="300" cy="4" r="2" fill="#b89555" />
        <circle cx="600" cy="4" r="2.5" fill="#173e35" />
        <circle cx="900" cy="4" r="2" fill="#b89555" />
      </svg>
    </div>
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
