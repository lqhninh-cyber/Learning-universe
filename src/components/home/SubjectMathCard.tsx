import { ArrowRight, BookOpenCheck, PlayCircle } from 'lucide-react';
import { type FC } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';

export interface SubjectMathCardRecentLesson {
  readonly title: string;
  readonly label: string;
  readonly to: string;
  readonly isResuming: boolean;
}

export interface SubjectMathCardProps {
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly color: string;
  readonly pillClass: string;
  readonly chapterCount: number;
  readonly lessonCount: number;
  readonly completedCount: number;
  readonly percent: number;
  readonly overviewHref: string;
  readonly recentLesson: SubjectMathCardRecentLesson | null;
}

interface SubjectStageVisualSpec {
  readonly stageSurfaceClass: string;
  readonly washUrl: string;
  readonly topBarGradient: string;
  readonly inkTextClass: string;
  readonly dotColor: string;
  readonly darkDotColor: string;
  readonly progressBgClass: string;
  readonly ringStrokeClass: string;
  readonly badgeLabel: string;
}

const DEFAULT_STAGE_VISUAL: SubjectStageVisualSpec = {
  stageSurfaceClass:
    'border-[#E6D9C7]/90 bg-gradient-to-br from-[#FBF6EE] via-[#F5ECE0] to-[#EDE1CE] dark:border-[#3A2D20] dark:from-[#231B13] dark:via-[#1A1510] dark:to-[#13110E]',
  washUrl: '/assets/atmosphere/subject-wash-ctds.webp',
  topBarGradient: 'linear-gradient(90deg, #8C5828 0%, #D4AF6A 55%, #8C5828 100%)',
  inkTextClass: 'text-[#8C5828] dark:text-[#D99B5E]',
  dotColor: 'rgba(140, 88, 40, 0.25)',
  darkDotColor: 'rgba(217, 155, 94, 0.26)',
  progressBgClass: 'bg-[#8C5828] dark:bg-[#D99B5E]',
  ringStrokeClass: 'text-[#8C5828] dark:text-[#D99B5E]',
  badgeLabel: 'G / ker φ ≅ Im φ',
};

const SUBJECT_STAGE_VISUALS: Readonly<Record<string, SubjectStageVisualSpec>> = {
  'cau-truc-dai-so': DEFAULT_STAGE_VISUAL,
  'hinh-hoc-affine': {
    stageSurfaceClass:
      'border-[#C8DCE7]/90 bg-gradient-to-br from-[#F1F7FA] via-[#E6F0F6] to-[#DAE7F0] dark:border-[#233845] dark:from-[#131F28] dark:via-[#101820] dark:to-[#0D1319]',
    washUrl: '/assets/atmosphere/subject-wash-hhave.webp',
    topBarGradient: 'linear-gradient(90deg, #1D4F6E 0%, #64A8D1 55%, #1D4F6E 100%)',
    inkTextClass: 'text-[#1D4F6E] dark:text-[#64A8D1]',
    dotColor: 'rgba(29, 79, 110, 0.25)',
    darkDotColor: 'rgba(100, 168, 209, 0.26)',
    progressBgClass: 'bg-[#1D4F6E] dark:bg-[#64A8D1]',
    ringStrokeClass: 'text-[#1D4F6E] dark:text-[#64A8D1]',
    badgeLabel: 'Aff(E) · Hyperboloid',
  },
  'giai-tich-ham-mot-bien': {
    stageSurfaceClass:
      'border-[#C4DFD3]/90 bg-gradient-to-br from-[#EFF7F3] via-[#E3F1EB] to-[#D6E9E0] dark:border-[#1F3B31] dark:from-[#10221C] dark:via-[#0E1915] dark:to-[#0C1411]',
    washUrl: '/assets/atmosphere/subject-wash-gthmb.webp',
    topBarGradient: 'linear-gradient(90deg, #1B5E4A 0%, #4AD1A3 55%, #1B5E4A 100%)',
    inkTextClass: 'text-[#1B5E4A] dark:text-[#52B394]',
    dotColor: 'rgba(27, 94, 74, 0.25)',
    darkDotColor: 'rgba(82, 179, 148, 0.26)',
    progressBgClass: 'bg-[#1B5E4A] dark:bg-[#52B394]',
    ringStrokeClass: 'text-[#1B5E4A] dark:text-[#52B394]',
    badgeLabel: '∫ f(x) dx · Taylor',
  },
  'giao-duc-hoc': {
    stageSurfaceClass:
      'border-[#E4CCC8]/90 bg-gradient-to-br from-[#FAF2F0] via-[#F3E5E2] to-[#EAD8D4] dark:border-[#3F2624] dark:from-[#241615] dark:via-[#1A1212] dark:to-[#140F0F]',
    washUrl: '/assets/atmosphere/subject-wash-gdh.webp',
    topBarGradient: 'linear-gradient(90deg, #8F3D35 0%, #DF7B70 55%, #8F3D35 100%)',
    inkTextClass: 'text-[#8F3D35] dark:text-[#DF7B70]',
    dotColor: 'rgba(143, 61, 53, 0.25)',
    darkDotColor: 'rgba(223, 123, 112, 0.26)',
    progressBgClass: 'bg-[#8F3D35] dark:bg-[#DF7B70]',
    ringStrokeClass: 'text-[#8F3D35] dark:text-[#DF7B70]',
    badgeLabel: 'GV ↔ HS ↔ Tri thức',
  },
};

/**
 * Sân khấu mô hình vector toán học động (SVG thuần, 0 thẻ <img>)
 * thiết kế riêng theo bản chất học thuật của từng học phần Sư phạm Toán,
 * sử dụng currentColor để tự động đạt tương phản cao trên cả Ceramic Light & Obsidian Studio.
 */
const SubjectMathStageModel: FC<{ readonly slug: string }> = ({ slug }) => {
  if (slug === 'cau-truc-dai-so') {
    // Đồ thị đối xứng bát giác Cayley + khối bát diện 3D + sơ đồ giao hoán nhóm
    return (
      <svg
        viewBox="0 0 280 112"
        fill="none"
        aria-hidden="true"
        data-testid="subject-svg-cau-truc-dai-so"
        className="h-full w-full transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
      >
        <defs>
          <radialGradient id="ctds-mini-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="96" cy="56" r="46" fill="url(#ctds-mini-glow)" />

        {/* Vòng đối xứng bát giác xoay nhẹ */}
        <g className="lu-orbit-ring" opacity="0.72">
          <polygon
            points="96,16 124,28 136,56 124,84 96,96 68,84 56,56 68,28"
            stroke="currentColor"
            strokeWidth="1.05"
            strokeDasharray="3 3"
          />
          <circle cx="96" cy="16" r="2.2" fill="currentColor" />
          <circle cx="136" cy="56" r="2.2" fill="currentColor" />
          <circle cx="96" cy="96" r="2.2" fill="currentColor" />
          <circle cx="56" cy="56" r="2.2" fill="currentColor" />
        </g>

        {/* Khối bát diện bán trong suốt ở tâm */}
        <polygon points="96,26 120,56 96,64 72,56" fill="currentColor" fillOpacity="0.16" />
        <polygon points="96,86 120,56 96,64 72,56" fill="currentColor" fillOpacity="0.09" />
        <path
          d="M96 26L120 56L96 86L72 56Z M96 26V86 M72 56L96 64L120 56"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <circle cx="96" cy="56" r="3" fill="currentColor" />

        {/* Sơ đồ giao hoán đồng cấu nhóm bên phải */}
        <g transform="translate(152, 16)">
          <circle
            cx="24"
            cy="20"
            r="13"
            fill="currentColor"
            fillOpacity="0.09"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="94"
            cy="20"
            r="13"
            fill="currentColor"
            fillOpacity="0.09"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="59"
            cy="66"
            r="14"
            fill="currentColor"
            fillOpacity="0.13"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <path d="M39 20H78" stroke="currentColor" strokeWidth="1.2" className="lu-dg-stream" />
          <path d="M74 16.5L79 20L74 23.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M33 32L49 53" stroke="currentColor" strokeWidth="1.15" />
          <path d="M44.5 51.5L50 54L49.5 48" stroke="currentColor" strokeWidth="1.15" />
          <path
            d="M70 54L86 32"
            stroke="currentColor"
            strokeWidth="1.2"
            className="lu-dg-stream-fast"
          />
          <path d="M81 33.5L86.5 31L85.5 37" stroke="currentColor" strokeWidth="1.15" />
          <circle cx="24" cy="20" r="2.2" fill="currentColor" />
          <circle cx="94" cy="20" r="2.2" fill="currentColor" />
          <circle cx="59" cy="66" r="2.4" fill="currentColor" />
        </g>
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    // Siêu mặt Hyperboloid 1 tầng có 2 họ đường sinh chéo + Hệ mục tiêu Affine (O; e1, e2, e3)
    return (
      <svg
        viewBox="0 0 280 112"
        fill="none"
        aria-hidden="true"
        data-testid="subject-svg-hinh-hoc-affine"
        className="h-full w-full transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
      >
        <defs>
          <radialGradient id="hhave-mini-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="102" cy="56" rx="54" ry="40" fill="url(#hhave-mini-glow)" />

        {/* Mặt Hyperboloid đường sinh chéo */}
        <path
          d="M66 22C80 42 80 70 66 90L138 90C124 70 124 42 138 22Z"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <ellipse cx="102" cy="22" rx="36" ry="9" stroke="currentColor" strokeWidth="1.2" />
        <ellipse
          cx="102"
          cy="56"
          rx="22"
          ry="6"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeDasharray="3 3"
        />
        <ellipse cx="102" cy="90" rx="36" ry="9" stroke="currentColor" strokeWidth="1.2" />
        <g stroke="currentColor" strokeWidth="0.95" opacity="0.72">
          <line x1="68" y1="24" x2="124" y2="95" />
          <line x1="80" y1="18" x2="136" y2="91" />
          <line x1="94" y1="14" x2="138" y2="85" />
          <line x1="136" y1="24" x2="80" y2="95" />
          <line x1="124" y1="18" x2="68" y2="91" />
          <line x1="110" y1="14" x2="66" y2="85" />
        </g>

        {/* Hệ mục tiêu Affine & Quỹ đạo biến hình bên phải */}
        <g transform="translate(154, 14)">
          <polygon points="24,74 68,54 100,66 56,86" fill="currentColor" fillOpacity="0.14" />
          <path d="M24 74V16" stroke="currentColor" strokeWidth="1.35" />
          <path d="M20.5 21L24 15L27.5 21" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M24 74L92 42"
            stroke="currentColor"
            strokeWidth="1.35"
            className="lu-dg-stream"
          />
          <path d="M85.5 41.5L93 41.5L88.5 47.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M24 74L102 82" stroke="currentColor" strokeWidth="1.25" />
          <path d="M96 78L103 82L95.5 85" stroke="currentColor" strokeWidth="1.25" />
          <ellipse
            cx="64"
            cy="42"
            rx="26"
            ry="12"
            transform="rotate(-18 64 42)"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeDasharray="4 3"
          />
          <circle cx="24" cy="74" r="3" fill="currentColor" />
          <circle cx="64" cy="42" r="2.6" fill="currentColor" />
        </g>
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    // Dải tích phân Riemann bán trong suốt + đường cong f(x) + sóng xấp xỉ Taylor & tiếp tuyến
    return (
      <svg
        viewBox="0 0 280 112"
        fill="none"
        aria-hidden="true"
        data-testid="subject-svg-giai-tich-ham-mot-bien"
        className="h-full w-full transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
      >
        <defs>
          <linearGradient id="gthmb-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Trục tọa độ */}
        <path d="M20 88H260" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />
        <path d="M40 16V98" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />

        {/* Các phân hoạch Riemann bán trong suốt */}
        <g
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="0.85"
        >
          <rect
            x="54"
            y="64"
            width="20"
            height="24"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="78"
            y="42"
            width="20"
            height="46"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="102"
            y="28"
            width="20"
            height="60"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="126"
            y="34"
            width="20"
            height="54"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="150"
            y="54"
            width="20"
            height="34"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="174"
            y="62"
            width="20"
            height="26"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="198"
            y="48"
            width="20"
            height="40"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
          <rect
            x="222"
            y="38"
            width="20"
            height="50"
            rx="2"
            className="group-hover/card:lu-fx-bar-wave"
          />
        </g>

        {/* Vùng tích phân liên tục */}
        <path
          d="M28 84C56 80 78 24 114 26C148 28 164 76 196 60C220 48 236 30 256 38L256 88L28 88Z"
          fill="url(#gthmb-area-grad)"
        />

        {/* Sóng xấp xỉ Taylor nét đứt */}
        <path
          d="M28 78C64 62 90 36 124 38C158 40 176 68 212 52C232 44 244 40 256 44"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.65"
          strokeDasharray="4 4"
          className="lu-dg-stream"
        />

        {/* Đường cong chính f(x) */}
        <path
          d="M28 84C56 80 78 24 114 26C148 28 164 76 196 60C220 48 236 30 256 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Tiếp tuyến tại cực đại cục bộ & điểm phát sáng */}
        <path d="M78 26H150" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3" />
        <circle
          cx="114"
          cy="26"
          r="7"
          stroke="currentColor"
          strokeWidth="1"
          className="lu-dg-pulse-ring"
        />
        <circle cx="114" cy="26" r="3.4" fill="currentColor" />
      </svg>
    );
  }

  // Giáo dục học: 3 vòng sinh thái đồng tâm + Tam giác Sư phạm tương tác hai chiều + Đường xoắn ốc trưởng thành
  return (
    <svg
      viewBox="0 0 280 112"
      fill="none"
      aria-hidden="true"
      data-testid="subject-svg-giao-duc-hoc"
      className="h-full w-full transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
    >
      <defs>
        <radialGradient id="gdh-mini-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="96" cy="56" r="46" fill="url(#gdh-mini-glow)" />

      {/* 3 vòng sinh thái đồng tâm xoay nhẹ ngược chiều */}
      <g className="lu-orbit-ring-reverse" opacity="0.58">
        <circle
          cx="96"
          cy="56"
          r="42"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </g>
      <g className="lu-orbit-ring" opacity="0.72">
        <circle
          cx="96"
          cy="56"
          r="29"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeDasharray="2 4"
        />
      </g>
      <circle
        cx="96"
        cy="56"
        r="16"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeOpacity="0.45"
      />

      {/* Tam giác Sư phạm tương tác hai chiều */}
      <polygon points="96,24 68,74 124,74" fill="currentColor" fillOpacity="0.13" />
      <path
        d="M96 24Q74 44 68 74"
        stroke="currentColor"
        strokeWidth="1.25"
        className="lu-dg-stream"
      />
      <path
        d="M68 74Q96 84 124 74"
        stroke="currentColor"
        strokeWidth="1.25"
        className="lu-dg-stream"
      />
      <path
        d="M124 74Q118 44 96 24"
        stroke="currentColor"
        strokeWidth="1.25"
        className="lu-dg-stream"
      />
      <circle cx="96" cy="24" r="3.4" fill="currentColor" />
      <circle cx="68" cy="74" r="3.2" fill="currentColor" />
      <circle cx="124" cy="74" r="3.2" fill="currentColor" />
      <circle cx="96" cy="56" r="2.2" fill="currentColor" />

      {/* Đường xoắn ốc trưởng thành & 4 mầm năng lực bên phải */}
      <path
        d="M124 74C144 88 168 76 178 58C188 40 208 26 232 30C244 32 252 24 258 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="lu-dg-stream-fast"
      />
      <circle cx="164" cy="72" r="2.5" fill="currentColor" />
      <circle cx="190" cy="44" r="3" fill="currentColor" />
      <circle cx="224" cy="30" r="3.4" fill="currentColor" />
      <circle cx="256" cy="19" r="4" fill="currentColor" />
      <circle
        cx="256"
        cy="19"
        r="8"
        stroke="currentColor"
        strokeWidth="0.9"
        className="lu-dg-pulse-ring"
      />
    </svg>
  );
};

export const SubjectMathCard: FC<SubjectMathCardProps> = ({
  slug,
  code,
  title,
  color,
  pillClass,
  chapterCount,
  lessonCount,
  completedCount,
  percent,
  overviewHref,
  recentLesson,
}) => {
  const ringRadius = 14;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringFill = (Math.max(0, Math.min(100, percent)) / 100) * ringCirc;
  const visual = SUBJECT_STAGE_VISUALS[slug] ?? DEFAULT_STAGE_VISUAL;

  return (
    <article
      data-subject-card-style="math-vector"
      className="group/card relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[26px] border border-black/[0.05] bg-white shadow-[0_12px_32px_-20px_rgba(16,45,35,0.16)] transition-all duration-200 hover:-translate-y-1 hover:border-black/[0.1] hover:shadow-[0_20px_42px_-22px_rgba(16,45,35,0.22)] dark:border-white/[0.07] dark:bg-[#141D1A] dark:hover:border-white/[0.14]"
    >
      {/* Dải gờ màu học phần trên đỉnh thẻ */}
      <div
        aria-hidden="true"
        style={{ background: visual.topBarGradient }}
        className="pointer-events-none h-1.5 w-full opacity-85"
      />

      {/* Phần thân chính dẫn tới trang tổng quan học phần */}
      <Link
        to={overviewHref}
        data-testid={`dashboard-subject-card-${slug}`}
        className="relative flex flex-1 flex-col justify-between gap-3.5 p-4 focus-visible:ring-2 focus-visible:ring-[#0F7656] focus-visible:outline-none focus-visible:ring-inset"
      >
        {/* Vầng sáng dịu nhẹ theo màu học phần bao quanh góc thẻ */}
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at 88% 12%, ${color}1A 0%, transparent 58%)`,
          }}
          className="pointer-events-none absolute inset-0 opacity-75 transition-opacity duration-300 group-hover/card:opacity-100"
        />

        {/* Sân khấu mô hình toán học mini kết hợp nền tranh loang màu nước (0 thẻ <img>, 100% vector + CSS wash) */}
        <div
          className={cn(
            'relative h-[120px] w-full overflow-hidden rounded-[18px] border shadow-inner transition-colors duration-200',
            visual.stageSurfaceClass,
            visual.inkTextClass,
          )}
        >
          {/* Lớp tranh màu nước khoáng thạch cục bộ qua CSS backgroundImage (không tạo thẻ <img>) */}
          <div
            aria-hidden="true"
            style={{ backgroundImage: `url('${visual.washUrl}')` }}
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50 mix-blend-multiply transition-transform duration-700 ease-out group-hover/card:scale-105 dark:opacity-15 dark:mix-blend-screen"
          />

          {/* Lưới điểm bản vẽ siêu mịn */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-65 dark:opacity-55"
            style={{
              backgroundImage: `radial-gradient(${visual.dotColor} 0.85px, transparent 0.9px)`,
              backgroundSize: '14px 14px',
            }}
          />

          {/* 4 dấu góc hiệu chuẩn bản vẽ */}
          <span className="pointer-events-none absolute top-2 left-2 h-2 w-2 border-t border-l border-current opacity-40" />
          <span className="pointer-events-none absolute top-2 right-2 h-2 w-2 border-t border-r border-current opacity-40" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l border-current opacity-40" />
          <span className="pointer-events-none absolute right-2 bottom-2 h-2 w-2 border-r border-b border-current opacity-40" />

          <div className="relative z-10 h-full w-full px-1 py-0.5">
            <SubjectMathStageModel slug={slug} />
          </div>

          {/* Nhãn ký hiệu học phần góc trên trái */}
          <span
            className={cn(
              'absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide shadow-2xs backdrop-blur-xs',
              pillClass,
            )}
          >
            <span
              className={cn('h-1.5 w-1.5 rounded-full', visual.progressBgClass)}
              aria-hidden="true"
            />
            <span>{code}</span>
          </span>

          {/* Nhãn công thức đặc trưng góc dưới phải */}
          <span className="pointer-events-none absolute right-2.5 bottom-2 z-20 rounded-md bg-white/75 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-tight backdrop-blur-xs dark:bg-[#0D1412]/75">
            {visual.badgeLabel}
          </span>
        </div>

        {/* Hàng tiêu đề + Vòng tròn tiến độ */}
        <div className="relative z-10 space-y-2.5 px-1">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className="font-serif text-[17px] leading-snug font-semibold text-[var(--text-main)] transition-colors group-hover/card:text-[#0F7656] dark:group-hover/card:text-[#4AD1A3]">
                {title}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                {chapterCount} chương · {completedCount}/{lessonCount} bài
              </p>
            </div>

            {/* Vòng tròn tiến độ mini */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  className="text-[#E6ECE9] dark:text-[#1F2C28]"
                />
                {percent > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeDasharray={`${ringFill} ${ringCirc}`}
                    className={cn('transition-all duration-500', visual.ringStrokeClass)}
                  />
                )}
              </svg>
              <span className="absolute font-mono text-[9px] font-bold text-[var(--text-main)] tabular-nums">
                {percent}%
              </span>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EAF0ED] dark:bg-[#1E2B27]">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-300',
                visual.progressBgClass,
              )}
              style={{
                width: `${completedCount > 0 ? Math.max(percent, 8) : 4}%`,
              }}
            />
          </div>
        </div>
      </Link>

      {/* Dải cá nhân hóa đáy thẻ: Bài gần nhất của riêng học phần này */}
      {recentLesson && (
        <div className="px-3 pb-3">
          <Link
            to={recentLesson.to}
            data-testid={`dashboard-subject-recent-${slug}`}
            title={recentLesson.title}
            className="group/recent flex items-center justify-between gap-2 rounded-2xl bg-[#F4F7F5] px-3.5 py-2.5 text-xs transition-colors hover:bg-[#EBF4F0] focus-visible:ring-2 focus-visible:ring-[#0F7656] focus-visible:outline-none dark:bg-[#0F1715] dark:hover:bg-[#142520]"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              {recentLesson.isResuming ? (
                <PlayCircle className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />
              ) : (
                <BookOpenCheck
                  className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
              )}
              <span className="truncate text-[11.5px] text-[var(--text-secondary)] group-hover/recent:text-[var(--text-main)]">
                <strong className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                  {recentLesson.isResuming ? 'Gần nhất' : 'Bắt đầu'}:{' '}
                </strong>
                {recentLesson.label}
              </span>
            </span>

            <ArrowRight
              className="h-3 w-3 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-hover/recent:translate-x-0.5 group-hover/recent:text-[var(--text-main)]"
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
    </article>
  );
};

export default SubjectMathCard;
