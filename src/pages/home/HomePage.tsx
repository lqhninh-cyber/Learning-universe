import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Compass,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getLessonById, getSubjects, getSubjectStats } from '@/content-runtime';
import {
  type AcademicBranch,
  getCourseCinematicAsset,
  HOMEPAGE_OPENING_ASSET,
} from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { searchContent } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Kbd, ProgressRing } from '@/shared/ui';
import { ArchivalIndexView } from './ArchivalIndexView';
import { HeritageArtShowcase } from './HeritageArtShowcase';
import { KnowledgeThread } from './KnowledgeThread';
import { QuickKaTeXDrawer } from './QuickKaTeXDrawer';
import { RotatingScholarlyQuote } from './RotatingScholarlyQuote';
import {
  getInitialHomepageViewMode,
  type HomepageViewMode,
  saveHomepageViewMode,
  ViewModeToggle,
} from './ViewModeToggle';

type HubBranchFilter = 'all' | AcademicBranch;

/**
 * Chữ ký chìm nhận diện môn học (Watermark Signature) ở góc dưới bên phải mỗi thẻ môn học
 * tại chế độ Bản đồ Không gian (Atlas Mode).
 */
function SubjectWatermarkSignature({ slug }: { readonly slug: string }) {
  if (slug === 'cau-truc-dai-so') {
    // Cấu trúc đại số: Biểu đồ lưới nhóm Cayley & ký hiệu đồng cấu
    return (
      <svg
        data-testid={`subject-watermark-${slug}`}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 opacity-[0.04] select-none"
      >
        <g stroke="#262B28" strokeWidth="2.5" fill="none">
          <rect x="20" y="20" width="90" height="90" rx="6" />
          <line x1="50" y1="20" x2="50" y2="110" />
          <line x1="80" y1="20" x2="80" y2="110" />
          <line x1="20" y1="50" x2="110" y2="50" />
          <line x1="20" y1="80" x2="110" y2="80" />
          <circle cx="126" cy="126" r="22" />
          <path d="M 96 126 L 150 126" />
        </g>
        <text x="24" y="148" fill="#262B28" fontSize="22" fontFamily="serif" fontWeight="bold">
          G / ker φ ≅ Im φ
        </text>
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    // Hình học Affine: Hệ trục tọa độ không gian affine 3 chiều
    return (
      <svg
        data-testid={`subject-watermark-${slug}`}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 opacity-[0.04] select-none"
      >
        <g stroke="#262B28" strokeWidth="3" fill="none">
          <line x1="75" y1="95" x2="75" y2="15" />
          <line x1="75" y1="95" x2="148" y2="120" />
          <line x1="75" y1="95" x2="18" y2="138" />
          <polygon points="75,35 130,114 35,126" strokeWidth="2" />
          <circle cx="75" cy="95" r="5" fill="#262B28" />
        </g>
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    // Giải tích 1: Ký hiệu tích phân cong vút ∫ và đường cong phân bố hàm liên tục
    return (
      <svg
        data-testid={`subject-watermark-${slug}`}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 opacity-[0.04] select-none"
      >
        <path
          d="M 55 138 C 68 138, 72 115, 76 80 C 80 45, 84 22, 98 22"
          stroke="#262B28"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 15 120 C 45 115, 65 45, 95 60 C 120 72, 135 35, 152 28"
          stroke="#262B28"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>
    );
  }

  // Giáo dục học: Sơ đồ 3 vòng tròn giao thoa (Nhà trường - Gia đình - Xã hội)
  return (
    <svg
      data-testid={`subject-watermark-${slug}`}
      viewBox="0 0 160 160"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 opacity-[0.04] select-none"
    >
      <g stroke="#262B28" strokeWidth="3" fill="none">
        <circle cx="80" cy="56" r="38" />
        <circle cx="56" cy="100" r="38" />
        <circle cx="104" cy="100" r="38" />
      </g>
    </svg>
  );
}

/**
 * Minh họa hình học không gian độc bản (Custom Spatial SVG Artwork)
 * cho từng môn học trong Spatial Subject Gallery.
 */
function SubjectSpatialArtwork({
  slug,
  branch,
}: {
  readonly slug: string;
  readonly branch: AcademicBranch;
}) {
  const strokeMain = branch === 'pedagogy' ? '#365E4E' : '#B85D6F';
  const strokeAccent = '#C89738';

  if (slug === 'cau-truc-dai-so') {
    // 01. Cấu trúc đại số (MATH1301): Mạng tinh thể (Crystal Lattice), phép biến hình & đa diện đối xứng
    return (
      <svg
        viewBox="0 0 520 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <pattern id="lattice-grid-math1301" width="26" height="26" patternUnits="userSpaceOnUse">
            <path
              d="M 26 0 L 0 0 0 26"
              fill="none"
              stroke="#D9DFD9"
              strokeWidth="0.6"
              strokeOpacity="0.7"
            />
          </pattern>
        </defs>
        <rect width="520" height="240" fill="url(#lattice-grid-math1301)" />

        {/* Vòng quỹ đạo nhóm đối xứng */}
        <circle
          cx="260"
          cy="120"
          r="88"
          fill="none"
          stroke={strokeMain}
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.45"
        />
        <circle
          cx="260"
          cy="120"
          r="56"
          fill="none"
          stroke={strokeAccent}
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Cấu trúc lục giác đối xứng D_6 & mạng tinh thể */}
        <polygon
          points="260,34 334,77 334,163 260,206 186,163 186,77"
          fill="#FAF9F6"
          fillOpacity="0.65"
          stroke={strokeMain}
          strokeWidth="1.5"
        />
        <polygon
          points="260,64 308,92 308,148 260,176 212,148 212,92"
          fill="#EBECE6"
          fillOpacity="0.55"
          stroke={strokeMain}
          strokeWidth="1.2"
        />

        {/* Các đường đồng cấu kết nối tâm và đỉnh */}
        <line
          x1="260"
          y1="34"
          x2="260"
          y2="206"
          stroke={strokeMain}
          strokeWidth="0.9"
          strokeOpacity="0.5"
        />
        <line
          x1="186"
          y1="77"
          x2="334"
          y2="163"
          stroke={strokeMain}
          strokeWidth="0.9"
          strokeOpacity="0.5"
        />
        <line
          x1="334"
          y1="77"
          x2="186"
          y2="163"
          stroke={strokeMain}
          strokeWidth="0.9"
          strokeOpacity="0.5"
        />

        {/* Mạng tinh thể phụ bên trái & phải */}
        <g stroke={strokeMain} strokeWidth="1" strokeOpacity="0.55" fill="none">
          <polygon points="88,76 132,52 156,96 112,120" />
          <line x1="132" y1="52" x2="186" y2="77" strokeDasharray="3 3" />
          <line x1="156" y1="96" x2="212" y2="92" strokeDasharray="3 3" />

          <polygon points="432,164 388,188 364,144 408,120" />
          <line x1="388" y1="188" x2="334" y2="163" strokeDasharray="3 3" />
          <line x1="364" y1="144" x2="308" y2="148" strokeDasharray="3 3" />
        </g>

        {/* Các nút phần tử nhóm (Nodes) */}
        {[
          [260, 34],
          [334, 77],
          [334, 163],
          [260, 206],
          [186, 163],
          [186, 77],
          [260, 120],
          [132, 52],
          [388, 188],
        ].map(([x, y], idx) => (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r={idx === 6 ? 5 : 3.5}
            fill={idx === 6 ? strokeAccent : '#FAF9F6'}
            stroke={idx === 6 ? strokeAccent : strokeMain}
            strokeWidth="1.6"
          />
        ))}

        {/* Ký hiệu toán học tinh tế */}
        <text x="24" y="34" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
          LATTICE · D₆ / CAYLEY GRAPH
        </text>
        <text x="378" y="222" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
          G / ker(φ) ≅ Im(φ)
        </text>
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    // 02. Hình học Affine & Euclide (MATH1302): Mặt phẳng phối cảnh 3D, mục tiêu affine & thiết diện
    return (
      <svg
        viewBox="0 0 420 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        {/* Lưới phối cảnh không gian */}
        <g stroke="#D9DFD9" strokeWidth="0.7" fill="none">
          <line x1="30" y1="195" x2="390" y2="195" />
          <line x1="65" y1="160" x2="355" y2="160" />
          <line x1="100" y1="125" x2="320" y2="125" />
          <line x1="210" y1="30" x2="50" y2="210" />
          <line x1="210" y1="30" x2="155" y2="210" />
          <line x1="210" y1="30" x2="265" y2="210" />
          <line x1="210" y1="30" x2="370" y2="210" />
        </g>

        {/* Mặt phẳng siêu phẳng P_1 */}
        <polygon
          points="75,148 195,58 345,88 225,178"
          fill="#FAF9F6"
          fillOpacity="0.75"
          stroke={strokeMain}
          strokeWidth="1.5"
        />

        {/* Mặt phẳng cắt P_2 tạo giao tuyến affine */}
        <polygon
          points="115,62 295,46 315,174 135,190"
          fill="#EBECE6"
          fillOpacity="0.6"
          stroke={strokeAccent}
          strokeWidth="1.3"
        />

        {/* Giao tuyến không gian (Line of intersection) */}
        <line
          x1="145"
          y1="95"
          x2="282"
          y2="136"
          stroke="#262B28"
          strokeWidth="2"
          strokeDasharray="5 3"
        />

        {/* Hệ véc-tơ mục tiêu Affine (O; e1, e2, e3) */}
        <g stroke={strokeMain} strokeWidth="1.6">
          <line x1="185" y1="138" x2="265" y2="122" />
          <line x1="185" y1="138" x2="142" y2="172" />
          <line x1="185" y1="138" x2="185" y2="66" />
        </g>
        <circle cx="185" cy="138" r="4.5" fill={strokeAccent} />
        <circle cx="265" cy="122" r="3" fill="#FAF9F6" stroke={strokeMain} strokeWidth="1.5" />
        <circle cx="142" cy="172" r="3" fill="#FAF9F6" stroke={strokeMain} strokeWidth="1.5" />
        <circle cx="185" cy="66" r="3" fill="#FAF9F6" stroke={strokeMain} strokeWidth="1.5" />

        <text x="20" y="32" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
          AFFINE SPACE · (O; e₁, e₂, e₃)
        </text>
        <text x="285" y="222" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
          dim(U + V)
        </text>
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    // 03. Giải tích hàm một biến (MATH1303): Đường cong trơn, phân hoạch tích phân Riemann & tiếp tuyến
    return (
      <svg
        viewBox="0 0 420 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        {/* Trục tọa độ giải tích */}
        <line x1="36" y1="188" x2="392" y2="188" stroke="#58635E" strokeWidth="1.1" />
        <line x1="58" y1="28" x2="58" y2="212" stroke="#58635E" strokeWidth="1.1" />

        {/* Dải lân cận epsilon-delta */}
        <rect
          x="58"
          y="74"
          width="320"
          height="42"
          fill="#EBECE6"
          fillOpacity="0.45"
          stroke="#D9DFD9"
          strokeDasharray="3 3"
        />

        {/* Các lát cắt tổng tích phân Riemann (Riemann Sum Partitions) */}
        {[
          { x: 96, h: 68 },
          { x: 124, h: 88 },
          { x: 152, h: 102 },
          { x: 180, h: 98 },
          { x: 208, h: 82 },
          { x: 236, h: 64 },
          { x: 264, h: 58 },
          { x: 292, h: 72 },
          { x: 320, h: 96 },
        ].map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={188 - bar.h}
            width="24"
            height={bar.h}
            fill={idx % 2 === 0 ? '#365E4E' : '#365E4E'}
            fillOpacity="0.16"
            stroke={strokeMain}
            strokeWidth="0.9"
          />
        ))}

        {/* Đường cong hàm số khả vi f(x) */}
        <path
          d="M 48 164 C 95 140, 130 68, 172 82 C 218 96, 245 148, 288 122 C 324 100, 352 62, 384 52"
          fill="none"
          stroke={strokeMain}
          strokeWidth="2.2"
        />

        {/* Đường tiếp tuyến đạo hàm tại điểm cực trị / tiếp xúc */}
        <line
          x1="112"
          y1="108"
          x2="236"
          y2="62"
          stroke={strokeAccent}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx="172" cy="85" r="4.5" fill={strokeAccent} stroke="#FAF9F6" strokeWidth="1.5" />

        <text x="72" y="34" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
          RIEMANN INTEGRAL · CONTINUUM
        </text>
        <text x="278" y="218" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
          ∫ₐᵇ f(x)dx = F(b) − F(a)
        </text>
      </svg>
    );
  }

  // 04. Giáo dục học (EDUC2802): Không gian mở với các lớp sơ đồ tương tác giữa Con người, Môi trường & Quá trình Giáo dục
  return (
    <svg
      viewBox="0 0 520 240"
      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
      aria-hidden="true"
    >
      {/* Các lớp không gian đồng tâm: Nhà trường - Gia đình - Xã hội */}
      <ellipse
        cx="260"
        cy="122"
        rx="195"
        ry="86"
        fill="#FAF9F6"
        fillOpacity="0.55"
        stroke="#D9DFD9"
        strokeWidth="1.1"
      />
      <ellipse
        cx="260"
        cy="122"
        rx="138"
        ry="62"
        fill="#EBECE6"
        fillOpacity="0.5"
        stroke={strokeMain}
        strokeWidth="1.1"
        strokeDasharray="5 4"
      />
      <ellipse
        cx="260"
        cy="122"
        rx="82"
        ry="38"
        fill="#FAF9F6"
        fillOpacity="0.85"
        stroke={strokeMain}
        strokeWidth="1.5"
      />

      {/* Tam giác biện chứng: Nhà trường (Đỉnh chủ đạo) - Gia đình - Xã hội */}
      <polygon
        points="260,46 148,176 372,176"
        fill="none"
        stroke={strokeAccent}
        strokeWidth="1.4"
        strokeOpacity="0.75"
      />
      <line
        x1="260"
        y1="46"
        x2="260"
        y2="122"
        stroke={strokeMain}
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="148"
        y1="176"
        x2="260"
        y2="122"
        stroke={strokeMain}
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="372"
        y1="176"
        x2="260"
        y2="122"
        stroke={strokeMain}
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Các nút tương tác sư phạm */}
      <circle cx="260" cy="122" r="7" fill={strokeMain} />
      <circle cx="260" cy="46" r="5" fill={strokeAccent} stroke="#FAF9F6" strokeWidth="1.5" />
      <circle cx="148" cy="176" r="5" fill="#FAF9F6" stroke={strokeMain} strokeWidth="1.8" />
      <circle cx="372" cy="176" r="5" fill="#FAF9F6" stroke={strokeMain} strokeWidth="1.8" />

      {/* Các vệ tinh thành tố quá trình giáo dục (Mục đích, Nội dung, Phương pháp, Kết quả) */}
      <circle cx="102" cy="96" r="3.5" fill={strokeMain} />
      <circle cx="418" cy="96" r="3.5" fill={strokeMain} />
      <line x1="102" y1="96" x2="178" y2="122" stroke="#D9DFD9" strokeWidth="1" />
      <line x1="418" y1="96" x2="342" y2="122" stroke="#D9DFD9" strokeWidth="1" />

      <text x="24" y="32" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
        PEDAGOGICAL ECOSYSTEM · HUMAN &amp; SOCIETY
      </text>
      <text x="276" y="42" fill="#262B28" fontSize="10" fontFamily="monospace">
        NHÀ TRƯỜNG
      </text>
      <text x="86" y="192" fill="#58635E" fontSize="10" fontFamily="monospace">
        GIA ĐÌNH
      </text>
      <text x="382" y="192" fill="#58635E" fontSize="10" fontFamily="monospace">
        XÃ HỘI
      </text>
      <text x="368" y="224" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
        Nhân cách · Chủ đạo
      </text>
    </svg>
  );
}

/**
 * Tính tọa độ điểm trên đường cong Bézier bậc 3: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
 */
function evaluateCubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: Math.round(mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x),
    y: Math.round(mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y),
  };
}

/**
 * Tính tọa độ chính xác của đầu dẫn (Lead Tip) theo tỷ lệ cuộn trang (0..1)
 */
function computeThreadTipPoint(progress: number): { x: number; y: number } {
  const r = Math.max(0, Math.min(1, progress));
  if (r <= 0.33) {
    const t = r / 0.33;
    return evaluateCubicBezier(
      { x: 720, y: 140 },
      { x: 720, y: 420 },
      { x: 1120, y: 560 },
      { x: 1120, y: 860 },
      t,
    );
  }
  if (r <= 0.66) {
    const t = (r - 0.33) / 0.33;
    return evaluateCubicBezier(
      { x: 1120, y: 860 },
      { x: 1120, y: 1160 },
      { x: 320, y: 1320 },
      { x: 320, y: 1640 },
      t,
    );
  }
  const t = (r - 0.66) / 0.34;
  return evaluateCubicBezier(
    { x: 320, y: 1640 },
    { x: 320, y: 1920 },
    { x: 720, y: 2080 },
    { x: 720, y: 2380 },
    t,
  );
}

export function HomePage() {
  const subjects = getSubjects();
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const searchListboxId = useId();

  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);

  const [activeBranch, setActiveBranch] = useState<HubBranchFilter>('all');
  const [hubQuery, setHubQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [viewMode, setViewMode] = useState<HomepageViewMode>(() => getInitialHomepageViewMode());
  const [isKaTeXDrawerOpen, setIsKaTeXDrawerOpen] = useState(false);

  const handleViewModeChange = (nextMode: HomepageViewMode) => {
    setViewMode(nextMode);
    saveHomepageViewMode(nextMode);
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const threadPathRef = useRef<SVGPathElement>(null);
  const [leadTip, setLeadTip] = useState<{ x: number; y: number }>({ x: 720, y: 140 });

  // Theo dõi tiến trình cuộn trang cho The Knowledge Thread (Đường dẫn tri thức xuyên suốt)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let rafId = 0;
    const updateScroll = () => {
      rafId = 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        window.innerHeight,
        1,
      );
      const ratio = Math.min(1, Math.max(0, window.scrollY / docHeight));
      setPageScrollProgress(ratio);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Cập nhật vị trí đầu dẫn phát sáng (Glowing Lead Tip) theo vị trí cuộn trang
  useEffect(() => {
    const currentRatio = Math.max(0.14, pageScrollProgress);
    if (threadPathRef.current && typeof threadPathRef.current.getPointAtLength === 'function') {
      try {
        const pt = threadPathRef.current.getPointAtLength(currentRatio * 2400);
        setLeadTip({ x: Math.round(pt.x), y: Math.round(pt.y) });
        return;
      } catch {
        // Dự phòng tính toán giải tích Bézier thuần
      }
    }
    setLeadTip(computeThreadTipPoint(currentRatio));
  }, [pageScrollProgress]);

  // Đóng dropdown tìm kiếm khi click ra ngoài hoặc nhấn phím Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === 'K' || event.key === 'k') &&
        event.shiftKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        setIsKaTeXDrawerOpen((prev) => !prev);
      } else if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'Escape') {
        setIsSearchDropdownOpen(false);
        setIsKaTeXDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Kết quả tìm kiếm tức thời (môn học + bài học sâu) cho ô tìm kiếm thông minh duy nhất
  const instantSearchResults = useMemo(() => searchContent(hubQuery), [hubQuery]);
  const hasSearchQuery = hubQuery.trim().length > 0;

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const firstResult = instantSearchResults[0];
    if (firstResult) {
      setIsSearchDropdownOpen(false);
      void navigate(firstResult.href);
    }
  };

  // Bài học đang đọc dở tại My Learning Orbit:
  // Mặc định ưu tiên "Bài 1.1: Hoạt động sư phạm của người giáo viên" (EDUC2802) theo hồ sơ thiết kế,
  // hoặc bài học gần nhất được lưu động trong trình duyệt.
  const activeRecentLesson =
    (lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined) ??
    getLessonById('gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien') ??
    getLessonById('lop-ke-phan-hoach-va-chi-so-cua-nhom-con') ??
    getLessonById('dinh-nghia-nhom');

  const totalLessonCount = subjects.reduce((sum, sub) => sum + getSubjectStats(sub).lessonCount, 0);
  const completedCount = Object.keys(completedLessons).length;
  const computedPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;
  // Hiển thị 8% mặc định cho tiến trình khởi đầu của Bài 1.1 hoặc dữ liệu thực tế từ trình duyệt
  const displayOrbitPercent = completedCount > 0 ? Math.max(computedPercent, 1) : 8;

  // Lọc danh sách học phần trong Spatial Subject Gallery
  const filteredSubjects = subjects.filter((subject) => {
    const asset = getCourseCinematicAsset(subject.slug);
    if (activeBranch !== 'all' && asset.branch !== activeBranch) {
      return false;
    }
    if (hasSearchQuery) {
      const searchable = `${subject.title} ${asset.courseCode} ${asset.categoryLabel} ${asset.conciseDescription}`;
      const matchedDirect = matchesVietnameseQuery(searchable, hubQuery);
      const matchedLessonInSubject = instantSearchResults.some(
        (item) => item.subject.slug === subject.slug,
      );
      return matchedDirect || matchedLessonInSubject;
    }
    return true;
  });

  return (
    <div className="relative overflow-x-clip bg-[#F5F4EF] text-[#262B28]">
      {/* =====================================================================
          SIGNATURE ELEMENT: THE KNOWLEDGE THREAD (ĐƯỜNG DẪN TRI THỨC XUYÊN SUỐT)
          Kết nối tuần tự: Hero -> Subject Gallery -> My Learning Orbit -> Footer
          Tích hợp hiệu ứng Hoa nở (Floral Bloom) tại các điểm nút mốc khi cuộn trang
          ===================================================================== */}
      <KnowledgeThread
        pageScrollProgress={pageScrollProgress}
        leadTip={leadTip}
        threadPathRef={threadPathRef}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* =====================================================================
          SECTION 1: HERO — THE KNOWLEDGE UNIVERSE (BỐ CỤC ĐA LỚP 4 TẦNG)
          ===================================================================== */}
      <section
        aria-label="Không gian Khởi đầu Learning Universe"
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden border-b border-[#D9DFD9] bg-[#F5F4EF] pt-24 pb-10 md:pt-28 md:pb-12"
      >
        {/* LAYER 1 (Backdrop): Ho Chi Minh City / Vietnam Architectural Skyline ở độ tương phản cực thấp */}
        <img
          src={HOMEPAGE_OPENING_ASSET.localSrc}
          onError={(event) => {
            const target = event.currentTarget;
            if (target.src !== HOMEPAGE_OPENING_ASSET.remoteSrc) {
              target.src = HOMEPAGE_OPENING_ASSET.remoteSrc;
            }
          }}
          alt={HOMEPAGE_OPENING_ASSET.alt}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 mix-blend-multiply grayscale"
        />

        {/* Lớp lưới tọa độ kiến trúc nền mảnh (Spatial Atlas Grid) */}
        <div
          data-testid="horizontal-blinds-mask"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#D9DFD9_1px,transparent_1px),linear-gradient(to_bottom,#D9DFD9_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-35"
        />

        {/* Container chính của Hero (Kết hợp Layer 4 Foreground Typography & Cột Trưng bày Nghệ thuật Di sản) */}
        <div className="relative z-20 mx-auto my-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
          {/* LAYER 4 (Foreground Typography & CTAs — Cột Trái 6/12) */}
          <div className="space-y-6 lg:col-span-6">
            {/* Dòng định danh chuẩn mực */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D9DFD9] bg-[#FAF9F6]/90 px-3.5 py-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#B85D6F]" aria-hidden="true" />
              <span className="font-mono text-xs tracking-widest text-[#58635E] uppercase">
                LEARNING UNIVERSE
              </span>
            </div>

            {/* Tiêu đề chính (Serif) & Trích dẫn nguồn gốc */}
            <div className="space-y-2">
              <h1 className="font-serif text-4xl leading-[1.12] font-bold tracking-tight text-[#262B28] sm:text-5xl lg:text-6xl">
                <span className="sr-only">LEARNING UNIVERSE — </span>
                <span className="block">Đi một ngày đàng,</span>{' '}
                <span className="mt-1 block font-normal text-[#B85D6F] italic">
                  học một sàng khôn.
                </span>
              </h1>
              <p className="font-serif text-sm text-[#365E4E] italic">— Tục ngữ Việt Nam</p>
            </div>

            {/* Khẩu hiệu dẫn nhập (Subheading) */}
            <p className="max-w-xl text-base leading-relaxed text-[#58635E] sm:text-lg">
              Không gian hỗ trợ Toán học và Khoa học Giáo dục, đồng hành cùng người học trên bước
              đường học tập.
            </p>

            {/* Hai nút CTA đồng cấp */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#khong-gian-mon-hoc"
                className="inline-flex items-center gap-2 rounded-xl bg-[#365E4E] px-6 py-3 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-[#2B4C3E]"
              >
                <span>Khám phá không gian tri thức</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                to="/glossary"
                onClick={(event) => {
                  event.preventDefault();
                  setIsKaTeXDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D9DFD9] bg-[#FAF9F6] px-6 py-3 text-sm font-medium text-[#262B28] transition-all duration-200 hover:bg-[#EBECE6]"
              >
                <BookMarked className="h-4 w-4 text-[#365E4E]" aria-hidden="true" />
                <span>Tra cứu thuật ngữ KaTeX</span>
              </Link>
            </div>

            {/* Danh ngôn học thuật xoay vòng (Rotating Scholarly Quotes) */}
            <RotatingScholarlyQuote />
          </div>

          {/* Cột Phải (6/12): Khối Trưng bày Tác phẩm Nghệ thuật & Di sản Học thuật Đích thực */}
          <div className="relative lg:col-span-6">
            <HeritageArtShowcase />
          </div>
        </div>

        {/* Chân trang Hero (Architectural Status Bar) */}
        <div className="relative z-20 mx-auto mt-10 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-[#D9DFD9] px-4 pt-5 text-xs text-[#58635E] sm:flex-row sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-[#365E4E] uppercase">
            TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC · HCMUE
          </p>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#58635E] uppercase">
            04 HỌC PHẦN · 123 BÀI GIẢNG · ĐỒNG BỘ 2026
          </p>
          <a
            href="#khong-gian-mon-hoc"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-[#262B28] uppercase transition-colors hover:text-[#365E4E]"
          >
            <span>Cuộn xuống Không gian Học phần</span>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: SUBJECT SECTION — SPATIAL SUBJECT GALLERY (GALLERY BẤT ĐỐI XỨNG)
          ===================================================================== */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Không gian Học phần"
        className="relative z-20 scroll-mt-24 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header 2 tầng: Tầng 1 Tiêu đề & Mô tả trải rộng; Tầng 2 Toolbar linh hoạt không tràn mép */}
          <div className="mb-10 border-b border-[#D9DFD9] pb-6">
            {/* TẦNG 1: TIÊU ĐỀ & MÔ TẢ TRẢI RỘNG */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[#58635E] uppercase">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>SPATIAL SUBJECT GALLERY · HỆ THỐNG HỌC PHẦN CHUYÊN KHẢO</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[#262B28] md:text-3xl">
                Không gian Học phần
              </h2>
              <p className="mt-1.5 max-w-2xl font-sans text-sm leading-relaxed text-[#58635E]">
                Mỗi học phần là một kiến trúc tư duy độc lập với ngôn ngữ hình học riêng.
              </p>
            </div>

            {/* TẦNG 2: THANH TÁC VỤ & BỘ LỌC (TOOLBAR) */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#D9DFD9]/50 pt-3">
              {/* Cánh trái: Công tắc chế độ xem [Bản đồ Không gian (Atlas)] | [Văn khố Thư mục (Archival Index)] */}
              <div className="flex items-center">
                <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
              </div>

              {/* Cánh phải (Nhóm Lọc & Tìm kiếm): flex items-center gap-2.5 max-w-full */}
              <div className="flex max-w-full flex-wrap items-center gap-2.5 sm:flex-nowrap">
                {/* Bộ lọc danh mục: [Tất cả] [Toán học] [Khoa học Giáo dục] (các nút tab pill mỏng) */}
                <div
                  role="tablist"
                  aria-label="Phân nhánh học thuật"
                  className="inline-flex shrink-0 items-center rounded-xl border border-[#D9DFD9] bg-[#FAF9F6] p-1 shadow-2xs"
                >
                  {(
                    [
                      { id: 'all', label: 'Tất cả' },
                      { id: 'math', label: 'Toán học' },
                      { id: 'pedagogy', label: 'Khoa học Giáo dục' },
                    ] as const
                  ).map((tab) => {
                    const isSelected = activeBranch === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveBranch(tab.id)}
                        className={cn(
                          'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
                          isSelected
                            ? 'bg-[#365E4E] text-white shadow-2xs'
                            : 'text-[#58635E] hover:text-[#262B28]',
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ô Tìm kiếm: relative flex items-center w-44 md:w-56 h-8 px-2.5 rounded-lg border border-[#D9DFD9] bg-[#FAF9F6] text-xs text-[#262B28] focus-within:border-[#365E4E] transition-all */}
                <div ref={searchContainerRef} className="relative">
                  <form
                    onSubmit={handleSearchSubmit}
                    role="search"
                    aria-label="Tìm kiếm nội dung học tập"
                  >
                    <div className="relative flex h-8 w-44 items-center rounded-lg border border-[#D9DFD9] bg-[#FAF9F6] px-2.5 text-xs text-[#262B28] shadow-2xs transition-all focus-within:border-[#365E4E] md:w-56">
                      <Search
                        className="mr-1.5 h-3.5 w-3.5 shrink-0 text-[#58635E]"
                        aria-hidden="true"
                      />
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={hubQuery}
                        onChange={(event) => {
                          setHubQuery(event.target.value);
                          setIsSearchDropdownOpen(true);
                        }}
                        onFocus={() => setIsSearchDropdownOpen(true)}
                        placeholder="Tìm môn, chương, bài..."
                        aria-label="Tìm kiếm môn học hoặc bài học"
                        aria-expanded={isSearchDropdownOpen && hasSearchQuery}
                        aria-controls={searchListboxId}
                        className="w-full bg-transparent text-xs text-[#262B28] placeholder:text-[#58635E] focus:outline-none"
                      />
                      <div className="flex shrink-0 items-center gap-1 pl-1">
                        {hasSearchQuery ? (
                          <button
                            type="button"
                            aria-label="Xóa từ khóa tìm kiếm"
                            onClick={() => {
                              setHubQuery('');
                              searchInputRef.current?.focus();
                            }}
                            className="rounded p-0.5 text-[#58635E] transition-colors hover:bg-[#EBECE6] hover:text-[#262B28]"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        ) : (
                          <Kbd className="py-0.2 hidden px-1 text-[9px] sm:inline-flex">/</Kbd>
                        )}
                      </div>
                    </div>
                  </form>

                  {/* Popover hiển thị kết quả bài học & môn học tức thời */}
                  {isSearchDropdownOpen && hasSearchQuery && (
                    <div
                      id={searchListboxId}
                      role="region"
                      aria-label="Kết quả tìm kiếm"
                      className="absolute top-full right-0 z-40 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-[#D9DFD9] bg-[#FAF9F6] p-2 shadow-xl sm:w-96"
                    >
                      {instantSearchResults.length > 0 ? (
                        <ul className="divide-y divide-[#D9DFD9]/60">
                          {instantSearchResults.map((result) => {
                            if (result.kind === 'subject') {
                              return (
                                <li key={`subject-${result.subject.id}`}>
                                  <Link
                                    to={result.href}
                                    onClick={() => setIsSearchDropdownOpen(false)}
                                    className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[#EBECE6]/70"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBECE6] text-[#365E4E]">
                                        <Layers className="h-4 w-4" aria-hidden="true" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-[#262B28]">
                                            {result.subject.title}
                                          </span>
                                          <Badge variant="neutral">Môn học</Badge>
                                        </div>
                                        <p className="mt-0.5 line-clamp-1 text-xs text-[#58635E]">
                                          {result.subject.description}
                                        </p>
                                      </div>
                                    </div>
                                    <ArrowRight
                                      className="h-4 w-4 shrink-0 text-[#58635E]"
                                      aria-hidden="true"
                                    />
                                  </Link>
                                </li>
                              );
                            }

                            return (
                              <li key={`lesson-${result.lesson.id}`}>
                                <Link
                                  to={result.href}
                                  onClick={() => setIsSearchDropdownOpen(false)}
                                  className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[#EBECE6]/70"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBECE6] text-[#365E4E]">
                                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-[#262B28]">
                                          Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                          {result.lesson.title}
                                        </span>
                                        <Badge variant="neutral">{result.subject.shortTitle}</Badge>
                                      </div>
                                      <p className="mt-0.5 line-clamp-1 text-xs text-[#58635E]">
                                        {result.lesson.description}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    className="h-4 w-4 shrink-0 text-[#58635E]"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 text-center text-xs text-[#58635E]">
                          Không tìm thấy môn học hoặc bài học nào khớp với{' '}
                          <strong className="font-semibold text-[#262B28]">
                            &ldquo;{hubQuery}&rdquo;
                          </strong>
                          .
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chế độ Văn khố Thư mục (Archival Index View) hoặc Bản đồ Không gian (Spatial Subject Gallery) */}
          {viewMode === 'archival' ? (
            <ArchivalIndexView
              subjects={subjects}
              activeBranch={activeBranch}
              externalQuery={hubQuery}
            />
          ) : (
            <>
              {/* SPATIAL SUBJECT GALLERY BẤT ĐỐI XỨNG (Asymmetric 12-Column Architectural Grid) */}
              {filteredSubjects.length === 0 ? (
                <div className="rounded-3xl border border-[#D9DFD9] bg-[#FAF9F6] p-12 text-center">
                  <p className="font-serif text-lg font-semibold text-[#262B28]">
                    Không tìm thấy học phần phù hợp với bộ lọc hiện tại.
                  </p>
                  <p className="mt-1 text-sm text-[#58635E]">
                    Hãy thử xóa từ khóa tìm kiếm hoặc chuyển sang phân nhánh &ldquo;Tất cả&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBranch('all');
                      setHubQuery('');
                    }}
                    className="mt-4 cursor-pointer rounded-xl bg-[#365E4E] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#2B4C3E]"
                  >
                    Khôi phục bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {filteredSubjects.map((subject, idx) => {
                    const asset = getCourseCinematicAsset(subject.slug);
                    const stats = getSubjectStats(subject);
                    const isPedagogy = asset.branch === 'pedagogy';

                    // Bố cục bất đối xứng (Asymmetric Spatial Proportions):
                    // Hàng 1: 01 (7 cột) + 02 (5 cột) | Hàng 2: 03 (5 cột) + 04 (7 cột)
                    const colSpanClass =
                      subject.slug === 'cau-truc-dai-so' || subject.slug === 'giao-duc-hoc'
                        ? 'lg:col-span-7'
                        : 'lg:col-span-5';

                    const galleryIndex = String(idx + 1).padStart(2, '0');

                    return (
                      <FadeIn key={subject.id} delay={idx * 60} className={colSpanClass}>
                        <article
                          style={{ viewTransitionName: `subject-card-${subject.slug}` }}
                          className={cn(
                            'group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#D9DFD9] bg-[#FAF9F6] p-6 shadow-xs transition-all duration-500 sm:p-8',
                            isPedagogy
                              ? 'hover:border-[#365E4E] hover:bg-[#EBECE6]'
                              : 'hover:border-[#365E4E] hover:bg-[#FAF9F6]',
                          )}
                        >
                          {/* Dấu ấn chìm SVG môn học độc bản */}
                          <SubjectWatermarkSignature slug={subject.slug} />
                          {/* Hàng 1: Định danh số thứ tự, Mã học phần & Phân nhánh */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-[#C89738]">
                                {galleryIndex}.
                              </span>
                              <span
                                className={cn(
                                  'rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-wider transition-transform duration-300 group-hover:translate-x-0.5',
                                  isPedagogy
                                    ? 'border-[#365E4E]/30 bg-[#EBECE6] text-[#365E4E]'
                                    : 'border-[#365E4E]/30 bg-[#EBECE6] text-[#365E4E]',
                                )}
                              >
                                {asset.categoryLabel}
                              </span>
                            </div>

                            <span className="font-mono text-[11px] text-[#58635E]">
                              {stats.chapterCount} chương · {stats.lessonCount} bài giảng
                            </span>
                          </div>

                          {/* Hàng 2: Khung đồ họa hình học không gian riêng biệt (Bespoke SVG Artwork) */}
                          <div
                            className={cn(
                              'my-6 overflow-hidden rounded-2xl border border-[#D9DFD9] bg-[#F5F4EF]/75 transition-colors duration-500 group-hover:border-[#365E4E]/40',
                              subject.slug === 'cau-truc-dai-so' || subject.slug === 'giao-duc-hoc'
                                ? 'h-52 sm:h-56'
                                : 'h-48 sm:h-52',
                            )}
                          >
                            <SubjectSpatialArtwork slug={subject.slug} branch={asset.branch} />
                          </div>

                          {/* Hàng 3: Tiêu đề môn học, Mô tả chuyên môn & Nút hành động đồng nhất */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#262B28] transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.65rem]">
                                <Link
                                  to={ROUTES.subjectOverview(subject.slug)}
                                  className="transition-colors hover:text-[#365E4E]"
                                >
                                  {subject.title}
                                </Link>
                              </h3>
                              <p className="line-clamp-3 text-sm leading-relaxed text-[#58635E]">
                                {asset.conciseDescription}
                              </p>
                            </div>

                            {/* Chân thẻ: Ẩn dụ thị giác & Nút [Vào học phần →] */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D9DFD9] pt-4">
                              <span className="line-clamp-1 font-mono text-[11px] text-[#58635E]">
                                {asset.visualMetaphor}
                              </span>

                              <Link
                                to={ROUTES.courseOverview(subject.slug)}
                                aria-label={`Vào học phần ${subject.title}`}
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-200',
                                  isPedagogy
                                    ? 'bg-[#365E4E] hover:bg-[#2B4C3E]'
                                    : 'bg-[#365E4E] hover:bg-[#2B4C3E]',
                                )}
                              >
                                <span>Vào học phần</span>
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      </FadeIn>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* =====================================================================
      SECTION 3: CONTINUE LEARNING — MY LEARNING ORBIT (CHỈ HIỂN THỊ Ở CHẾ ĐỘ ATLAS)
      ===================================================================== */}
      {viewMode === 'atlas' && (
        <section
          aria-label="Không gian Tiếp tục học tập"
          className="relative z-20 border-t border-[#D9DFD9] bg-[#EBECE6]/45 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header khu vực My Learning Orbit */}
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[#365E4E] uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-[#C89738]" aria-hidden="true" />
                  <span>MY LEARNING ORBIT · QUỸ ĐẠO HỌC TẬP CÁ NHÂN</span>
                </div>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-[#262B28] sm:text-4xl">
                  Tiếp tục học tập
                </h2>
              </div>
              <p className="font-mono text-xs text-[#58635E]">
                Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt của bạn.
              </p>
            </div>

            {/* Bố cục phân cấp bất đối xứng 65% (8 cột) : 35% (4 cột) */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
              {/* VÙNG CHÍNH (65% — lg:col-span-8 — HERO PROGRESS CARD) */}
              <div
                role="region"
                aria-label="Tiếp tục học dở"
                className="flex flex-col justify-between rounded-3xl border border-[#D9DFD9] bg-[#FAF9F6] p-6 shadow-sm sm:p-8 lg:col-span-8"
              >
                {activeRecentLesson ? (
                  <>
                    <div className="space-y-6">
                      {/* Hàng trạng thái & Tiến độ phần trăm */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9DFD9] pb-5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-lg bg-[#EBECE6] px-3 py-1 font-mono text-xs font-semibold text-[#365E4E]">
                            {getCourseCinematicAsset(activeRecentLesson.subject.slug).courseCode}
                          </span>
                          <span className="text-xs font-medium text-[#58635E]">
                            {activeRecentLesson.subject.title} · Chương{' '}
                            {activeRecentLesson.chapter.number}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <ProgressRing value={displayOrbitPercent} size={44} strokeWidth={4} />
                          <div>
                            <p className="font-mono text-sm font-bold text-[#262B28]">
                              Tiến trình: {displayOrbitPercent}%
                            </p>
                            <p className="text-[11px] text-[#58635E]">
                              {completedCount > 0
                                ? `Đã hoàn thành ${completedCount}/${totalLessonCount} bài`
                                : 'Đang đọc dở trên trình duyệt'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tiêu đề bài học đang đọc dở & Trích đoạn ngắn nội dung */}
                      <div className="space-y-3">
                        <p className="font-mono text-xs tracking-wider text-[#C89738] uppercase">
                          BÀI HỌC ĐANG ĐỌC DỞ
                        </p>
                        <h3 className="font-serif text-2xl leading-snug font-bold text-[#262B28] sm:text-3xl">
                          {activeRecentLesson.lesson.title.startsWith('Bài')
                            ? activeRecentLesson.lesson.title
                            : `Bài ${activeRecentLesson.chapter.number}.${activeRecentLesson.lesson.number}: ${activeRecentLesson.lesson.title}`}
                        </h3>
                        <p className="text-sm leading-relaxed text-[#58635E] sm:text-base">
                          {activeRecentLesson.lesson.description}
                        </p>
                      </div>

                      {/* Thanh tiến độ trực quan */}
                      <div className="space-y-2 rounded-2xl border border-[#D9DFD9] bg-[#F5F4EF]/70 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#262B28]">
                            Trạng thái đọc bài &amp; ghi chú học thuật
                          </span>
                          <span className="font-mono font-semibold text-[#365E4E]">
                            {displayOrbitPercent}% hoàn thành
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#D9DFD9]">
                          <div
                            className="h-full rounded-full bg-[#365E4E] transition-all duration-500"
                            style={{ width: `${Math.max(displayOrbitPercent, 6)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nút chính nổi bật: [Tiếp tục đọc ngay] */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#D9DFD9] pt-5">
                      <div className="text-xs text-[#58635E]">
                        Thời lượng ước tính:{' '}
                        <strong className="text-[#262B28]">
                          {activeRecentLesson.lesson.estimatedMinutes} phút đọc sâu
                        </strong>
                      </div>

                      <Link
                        to={ROUTES.lesson(
                          activeRecentLesson.subject.slug,
                          activeRecentLesson.chapter.slug,
                          activeRecentLesson.lesson.slug,
                        )}
                        className="inline-flex items-center gap-2.5 rounded-xl bg-[#365E4E] px-6 py-3 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-[#2B4C3E]"
                      >
                        <span>Tiếp tục đọc ngay</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>

              {/* CỘT PHỤ BÊN CẠNH (35% — lg:col-span-4 — 2 THẺ TIỆN ÍCH XẾP CHỒNG) */}
              <div className="flex flex-col justify-between gap-6 lg:col-span-4">
                {/* Tiện ích 1: Ngân hàng Thuật ngữ KaTeX */}
                <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[#D9DFD9] bg-[#FAF9F6] p-6 shadow-xs transition-colors hover:border-[#365E4E]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#EBECE6] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#365E4E]">
                        UTILITY 01 · KATEX LEXICON
                      </span>
                      <BookMarked className="h-4 w-4 text-[#365E4E]" aria-hidden="true" />
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#262B28]">
                      Ngân hàng Thuật ngữ KaTeX
                    </h3>

                    <p className="text-xs leading-relaxed text-[#58635E]">
                      Tra cứu tức thời hệ thống ký hiệu đại số, tiên đề hình học, định lý giải tích
                      và thuật ngữ khoa học giáo dục chuẩn mực.
                    </p>

                    {/* Bảng ký hiệu minh họa gọn gàng */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#D9DFD9] bg-[#F5F4EF]/70 p-2.5 text-center font-mono text-xs text-[#262B28]">
                      <span className="rounded-lg bg-[#FAF9F6] py-1">G / ker φ</span>
                      <span className="rounded-lg bg-[#FAF9F6] py-1">∀ε &gt; 0, ∃δ</span>
                      <span className="rounded-lg bg-[#FAF9F6] py-1">CLO1–9</span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#D9DFD9] pt-4">
                    <Link
                      to="/glossary"
                      onClick={(event) => {
                        event.preventDefault();
                        setIsKaTeXDrawerOpen(true);
                      }}
                      aria-label="Mở Ngân hàng Thuật ngữ & Ký hiệu Toán"
                      className="inline-flex w-full items-center justify-between rounded-xl border border-[#D9DFD9] bg-[#EBECE6]/70 px-4 py-2.5 text-xs font-semibold text-[#262B28] transition-colors hover:bg-[#365E4E] hover:text-white"
                    >
                      <span>Mở Ngân hàng Thuật ngữ &amp; Ký hiệu Toán</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Tiện ích 2: Phòng Lab Hình học 3D */}
                <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[#D9DFD9] bg-[#FAF9F6] p-6 shadow-xs transition-colors hover:border-[#365E4E]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#EBECE6] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#365E4E]">
                        UTILITY 02 · SPATIAL LAB
                      </span>
                      <Compass className="h-4 w-4 text-[#365E4E]" aria-hidden="true" />
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#262B28]">
                      Phòng Lab Hình học 3D
                    </h3>

                    <p className="text-xs leading-relaxed text-[#58635E]">
                      Cửa sổ mô phỏng trực quan không gian Affine, phép biến đổi đẳng cự và hình học
                      phối cảnh đa chiều.
                    </p>

                    {/* Cửa sổ preview trực quan dẫn vào không gian mô phỏng */}
                    <div className="overflow-hidden rounded-xl border border-[#D9DFD9] bg-[#F5F4EF] p-2">
                      <svg viewBox="0 0 280 76" className="h-16 w-full" aria-hidden="true">
                        <line x1="16" y1="62" x2="264" y2="62" stroke="#D9DFD9" strokeWidth="1" />
                        <polygon
                          points="76,54 132,14 204,24 148,64"
                          fill="#FAF9F6"
                          stroke="#365E4E"
                          strokeWidth="1.3"
                        />
                        <polygon
                          points="108,18 184,12 196,58 120,64"
                          fill="#EBECE6"
                          fillOpacity="0.65"
                          stroke="#365E4E"
                          strokeWidth="1.2"
                        />
                        <circle cx="140" cy="38" r="3.5" fill="#C89738" />
                        <text x="14" y="20" fill="#58635E" fontSize="8.5" fontFamily="monospace">
                          3D AFFINE VIEWPORT
                        </text>
                      </svg>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#D9DFD9] pt-4">
                    <a
                      href="/interactive/affine-geometry.html"
                      aria-label="Mở Phòng Lab Hình học Không gian"
                      className="inline-flex w-full items-center justify-between rounded-xl border border-[#D9DFD9] bg-[#EBECE6]/70 px-4 py-2.5 text-xs font-semibold text-[#262B28] transition-colors hover:bg-[#365E4E] hover:text-white"
                    >
                      <span>Mở Phòng Lab Hình học Không gian</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ngăn kéo Tra cứu Thuật ngữ & Ký hiệu KaTeX (Quick KaTeX Drawer) */}
      <QuickKaTeXDrawer isOpen={isKaTeXDrawerOpen} onClose={() => setIsKaTeXDrawerOpen(false)} />
    </div>
  );
}

export default HomePage;
