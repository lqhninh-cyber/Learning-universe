import {
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
import { type AcademicBranch, getCourseCinematicAsset } from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { searchContent } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Kbd, ProgressRing } from '@/shared/ui';
import { HeroPhysicsCanvas } from '@/components/home/HeroPhysicsCanvas';
import { HeroSonHaDiorama } from '@/components/home/HeroSonHaDiorama';
import {
  GoldenCompassSpineBridge,
  LakeshoreLotusTransition,
  ShorelineWaveBridge,
  TopographicWaterlinesBackdrop,
} from '@/components/home/HomeScrollTransitions';
import { ArchivalIndexView } from './ArchivalIndexView';
import { GrandLotusLake } from './GrandLotusLake';
import { HeritageArtShowcase } from './HeritageArtShowcase';
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
    // 01. Cấu trúc đại số: Lưới đa diện đối xứng & đồ thị Cayley nhóm S₄
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

        {/* Trái: Lưới đa diện đối xứng xoay nhẹ khi hover */}
        <g className="origin-[135px_122px] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-[-6deg]">
          <polygon
            points="135,44 198,80 198,164 135,200 72,164 72,80"
            fill="#FAF9F6"
            fillOpacity="0.72"
            stroke={strokeMain}
            strokeWidth="1.4"
          />
          <polygon
            points="135,68 176,92 176,152 135,176 94,152 94,92"
            fill="#EBECE6"
            fillOpacity="0.6"
            stroke={strokeAccent}
            strokeWidth="1.2"
          />
          <line
            x1="135"
            y1="44"
            x2="135"
            y2="200"
            stroke={strokeMain}
            strokeWidth="0.9"
            strokeOpacity="0.55"
          />
          <line
            x1="72"
            y1="80"
            x2="198"
            y2="164"
            stroke={strokeMain}
            strokeWidth="0.9"
            strokeOpacity="0.55"
          />
          <line
            x1="198"
            y1="80"
            x2="72"
            y2="164"
            stroke={strokeMain}
            strokeWidth="0.9"
            strokeOpacity="0.55"
          />
          <circle cx="135" cy="122" r="4.5" fill={strokeAccent} />
        </g>

        {/* Đường đẳng cấu kết nối lưới đa diện sang đồ thị Cayley S₄ */}
        <path
          d="M 205 112 Q 236 96 266 112"
          fill="none"
          stroke={strokeAccent}
          strokeWidth="1.3"
          strokeDasharray="4 3"
        />

        {/* Phải: Đồ thị Cayley của nhóm đối xứng S₄ (vòng 4 chiều & chuyển vị) */}
        <g className="origin-[365px_120px] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-[5deg]">
          <circle
            cx="365"
            cy="120"
            r="74"
            fill="none"
            stroke={strokeMain}
            strokeWidth="1.15"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />
          <polygon
            points="365,52 433,120 365,188 297,120"
            fill="#FAF9F6"
            fillOpacity="0.7"
            stroke={strokeMain}
            strokeWidth="1.45"
          />
          <polygon
            points="318,73 412,73 412,167 318,167"
            fill="none"
            stroke={strokeAccent}
            strokeWidth="1.25"
            strokeOpacity="0.85"
          />
          <rect
            x="342"
            y="97"
            width="46"
            height="46"
            rx="4"
            fill="#EBECE6"
            fillOpacity="0.75"
            stroke={strokeMain}
            strokeWidth="1.2"
          />
          {[
            [365, 52],
            [433, 120],
            [365, 188],
            [297, 120],
            [318, 73],
            [412, 73],
            [412, 167],
            [318, 167],
            [342, 97],
            [388, 97],
            [388, 143],
            [342, 143],
          ].map(([cx, cy], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={idx < 4 ? 4 : 3}
              fill={idx % 2 === 0 ? '#FAF9F6' : strokeAccent}
              stroke={idx % 2 === 0 ? strokeMain : strokeAccent}
              strokeWidth="1.4"
            />
          ))}
        </g>

        <text x="24" y="30" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.3">
          LATTICE · D₆ &amp; S₄ CAYLEY GRAPH
        </text>
        <text x="358" y="224" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
          |S₄| = 24 · G/ker(φ) ≅ Im(φ)
        </text>
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    // 02. Hình học Affine & Euclide: Mục tiêu Affine, Mặt bậc hai & Phép chiếu Desargues
    return (
      <svg
        viewBox="0 0 520 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        {/* Chùm tia phối cảnh Desargues từ tâm O bên trái */}
        <g stroke="#C89738" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 3" fill="none">
          <line x1="56" y1="122" x2="274" y2="54" />
          <line x1="56" y1="122" x2="288" y2="122" />
          <line x1="56" y1="122" x2="262" y2="190" />
        </g>

        {/* Hai tam giác phối cảnh Desargues ABC & A'B'C' */}
        <g className="origin-[165px_122px] transition-transform duration-500 ease-out group-hover:rotate-[-2.5deg]">
          <polygon
            points="126,99 138,122 118,144"
            fill="#FAF9F6"
            fillOpacity="0.82"
            stroke={strokeMain}
            strokeWidth="1.45"
          />
          <polygon
            points="212,72 232,122 204,172"
            fill="#EBECE6"
            fillOpacity="0.65"
            stroke={strokeMain}
            strokeWidth="1.5"
          />
          <line
            x1="142"
            y1="198"
            x2="274"
            y2="42"
            stroke="#262B28"
            strokeWidth="1.15"
            strokeDasharray="5 3"
          />
          <circle cx="56" cy="122" r="4" fill={strokeAccent} />
        </g>

        {/* Phải: Khung mục tiêu Affine (O; e₁, e₂, e₃) & Mặt bậc hai (Quadric Ellipsoid/Hyperboloid) */}
        <g className="origin-[388px_120px] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-[4deg]">
          <ellipse
            cx="392"
            cy="122"
            rx="78"
            ry="44"
            fill="#FAF9F6"
            fillOpacity="0.6"
            stroke={strokeMain}
            strokeWidth="1.5"
          />
          <ellipse
            cx="392"
            cy="122"
            rx="78"
            ry="18"
            fill="none"
            stroke={strokeAccent}
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <ellipse
            cx="392"
            cy="122"
            rx="28"
            ry="44"
            fill="none"
            stroke={strokeMain}
            strokeWidth="1.15"
            strokeOpacity="0.7"
          />
          {/* Khung mục tiêu Affine */}
          <g stroke={strokeMain} strokeWidth="1.75" strokeLinecap="round">
            <line x1="392" y1="122" x2="454" y2="108" />
            <line x1="392" y1="122" x2="352" y2="152" />
            <line x1="392" y1="122" x2="392" y2="54" />
          </g>
          <circle cx="392" cy="122" r="4.5" fill={strokeAccent} />
        </g>

        <text x="24" y="30" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.3">
          AFFINE FRAME · QUADRICS &amp; DESARGUES
        </text>
        <text x="352" y="222" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
          (O; e₁, e₂, e₃) · Desargues
        </text>
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    // 03. Giải tích hàm một biến: Hội tụ Taylor–Maclaurin & Tích phân Riemann phân hoạch động
    return (
      <svg
        viewBox="0 0 520 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <line x1="42" y1="186" x2="478" y2="186" stroke="#58635E" strokeWidth="1.15" />
        <line x1="88" y1="30" x2="88" y2="210" stroke="#58635E" strokeWidth="1.15" />

        {/* Các lát cắt phân hoạch Riemann co giãn nhẹ khi hover */}
        <g className="transition-transform duration-500 ease-out group-hover:translate-x-1">
          {[
            { x: 120, h: 62 },
            { x: 146, h: 86 },
            { x: 172, h: 102 },
            { x: 198, h: 98 },
            { x: 224, h: 78 },
            { x: 250, h: 58 },
            { x: 276, h: 64 },
            { x: 302, h: 86 },
            { x: 328, h: 104 },
            { x: 354, h: 92 },
          ].map((bar, idx) => (
            <rect
              key={idx}
              x={bar.x}
              y={186 - bar.h}
              width="22"
              height={bar.h}
              fill={idx % 2 === 0 ? '#365E4E' : '#C89738'}
              fillOpacity="0.16"
              stroke={strokeMain}
              strokeWidth="0.9"
            />
          ))}
        </g>

        {/* Xấp xỉ đa thức Taylor–Maclaurin các bậc P₁, P₃ ôm sát hàm gốc */}
        <path
          d="M 88 148 L 284 44"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <path
          d="M 64 166 C 122 142, 166 72, 224 94 C 282 116, 336 146, 434 52"
          fill="none"
          stroke={strokeAccent}
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {/* Đường cong giải tích chính f(x) */}
        <path
          d="M 52 162 C 110 138, 152 68, 198 84 C 244 100, 274 148, 326 114 C 372 84, 412 56, 456 50"
          fill="none"
          stroke={strokeMain}
          strokeWidth="2.3"
        />
        <circle cx="198" cy="84" r="4.5" fill={strokeAccent} stroke="#FAF9F6" strokeWidth="1.5" />
        <circle cx="326" cy="114" r="4" fill={strokeMain} stroke="#FAF9F6" strokeWidth="1.5" />

        <text
          x="102"
          y="32"
          fill="#58635E"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1.3"
        >
          TAYLOR–MACLAURIN &amp; RIEMANN SUM
        </text>
        <text x="336" y="216" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
          Pₙ(x) → f(x) · ∫ₐᵇ f(x)dx
        </text>
      </svg>
    );
  }

  // 04. Giáo dục học: Cấu trúc hệ thống giáo dục, Chu trình phản tư & Ma trận chuẩn đầu ra CLO
  return (
    <svg
      viewBox="0 0 520 240"
      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
      aria-hidden="true"
    >
      {/* Trái: Chu trình phản tư sư phạm 4 pha xoay nhẹ khi hover */}
      <g className="origin-[148px_124px] transition-transform duration-500 ease-out group-hover:rotate-[8deg]">
        <circle
          cx="148"
          cy="124"
          r="66"
          fill="#FAF9F6"
          fillOpacity="0.65"
          stroke={strokeMain}
          strokeWidth="1.4"
          strokeDasharray="18 6"
        />
        <circle
          cx="148"
          cy="124"
          r="40"
          fill="#EBECE6"
          fillOpacity="0.65"
          stroke={strokeAccent}
          strokeWidth="1.3"
        />
        <circle cx="148" cy="58" r="5" fill={strokeAccent} stroke="#FAF9F6" strokeWidth="1.5" />
        <circle cx="214" cy="124" r="5" fill={strokeMain} stroke="#FAF9F6" strokeWidth="1.5" />
        <circle cx="148" cy="190" r="5" fill={strokeAccent} stroke="#FAF9F6" strokeWidth="1.5" />
        <circle cx="82" cy="124" r="5" fill={strokeMain} stroke="#FAF9F6" strokeWidth="1.5" />
        <circle cx="148" cy="124" r="7" fill={strokeMain} />
      </g>

      {/* Cầu nối hệ thống sang Ma trận CLO */}
      <line
        x1="220"
        y1="124"
        x2="268"
        y2="124"
        stroke={strokeAccent}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Phải: Ma trận chuẩn đầu ra CLO (4 × 3) */}
      <g className="origin-[372px_124px] transition-transform duration-500 ease-out group-hover:scale-105">
        <rect
          x="274"
          y="64"
          width="196"
          height="120"
          rx="12"
          fill="#FAF9F6"
          fillOpacity="0.82"
          stroke={strokeMain}
          strokeWidth="1.4"
        />
        <g stroke="#D9DFD9" strokeWidth="1">
          <line x1="274" y1="94" x2="470" y2="94" />
          <line x1="274" y1="124" x2="470" y2="124" />
          <line x1="274" y1="154" x2="470" y2="154" />
          <line x1="338" y1="64" x2="338" y2="184" />
          <line x1="404" y1="64" x2="404" y2="184" />
        </g>
        <text
          x="288"
          y="83"
          fill={strokeMain}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="700"
        >
          CLO1
        </text>
        <text
          x="352"
          y="83"
          fill={strokeMain}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="700"
        >
          CLO2
        </text>
        <text
          x="418"
          y="83"
          fill={strokeMain}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="700"
        >
          CLO3
        </text>
        {[
          [306, 109, true],
          [371, 109, false],
          [437, 109, true],
          [306, 139, false],
          [371, 139, true],
          [437, 139, true],
          [306, 169, true],
          [371, 169, true],
          [437, 169, false],
        ].map(([cx, cy, highlight], idx) => (
          <circle
            key={idx}
            cx={cx as number}
            cy={cy as number}
            r="5"
            fill={highlight ? strokeAccent : strokeMain}
            fillOpacity={highlight ? 0.9 : 0.72}
          />
        ))}
      </g>

      <text x="24" y="30" fill="#58635E" fontSize="10" fontFamily="monospace" letterSpacing="1.3">
        PEDAGOGY · REFLECTIVE CYCLE &amp; CLO MATRIX
      </text>
      <text x="336" y="218" fill="#365E4E" fontSize="11" fontFamily="serif" fontStyle="italic">
        Thực tiễn · Phản tư · CLO₁..CLO₆
      </text>
    </svg>
  );
}

export function HomePage() {
  const subjects = getSubjects();
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

  // Theo dõi tiến trình cuộn trang cho vùng chuyển tiếp tới Đại cảnh Hồ Sen
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
    <div className="relative overflow-x-clip bg-[var(--bg-page)] text-[var(--text-main)]">
      <div className="relative">
        {/* =====================================================================
          SECTION 1: HERO — VỊNH HẠ LONG 4 TẦNG KARST, SÓNG PHẢN CHIẾU & DI SẢN
          ===================================================================== */}
        <section
          aria-label="Không gian Khởi đầu Learning Universe"
          className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#133832] pt-20 pb-24 md:pt-24 md:pb-28"
        >
          {/* LAYER 1: 4-Layer Karst Diorama Vịnh Hạ Long (Hòn Trống Mái & Thuyền Buồm Cánh Dơi) */}
          <HeroSonHaDiorama />

          {/* LAYER 2: 60fps Dynamic Sunpath Shimmer & Soft Fireflies */}
          <HeroPhysicsCanvas />

          {/* Container chính của Hero (Cột Trái Biên Tập & Cột Phải Trưng Bày Di Sản Cố Định) */}
          <div className="lu-container-wide relative z-20 my-auto grid grid-cols-1 items-center gap-10 pt-2 lg:grid-cols-[1.08fr_0.92fr] lg:pt-4 xl:gap-16">
            {/* Cột Trái: Huy hiệu LEARNING UNIVERSE, Tục Ngữ & Danh Ngôn */}
            <div className="min-w-0 space-y-6">
              {/* Badge LEARNING UNIVERSE tinh gọn với Ngôi sao Trống Đồng Đông Sơn */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A85A]/45 bg-[#122623]/75 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                <svg
                  data-testid="dong-son-star-motif"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 shrink-0 text-[#F6D383]"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M12 3.5L13.6 9.4L19.5 7.5L14.8 11.4L20.5 12L14.8 12.6L19.5 16.5L13.6 14.6L12 20.5L10.4 14.6L4.5 16.5L9.2 12.6L3.5 12L9.2 11.4L4.5 7.5L10.4 9.4Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-mono text-xs tracking-widest text-[#F6D383] uppercase">
                  LEARNING UNIVERSE
                </span>
              </div>

              {/* Tiêu đề chính (Serif) căn trái gọn gàng & Trích dẫn nguồn gốc */}
              <div className="min-w-0 space-y-2">
                <h1 className="font-serif text-[clamp(2.4rem,3.6vw,3.75rem)] leading-[1.12] font-bold tracking-tight text-[#FFF9F0]">
                  <span className="sr-only">LEARNING UNIVERSE — </span>
                  <span className="block">Đi một ngày đàng,</span>{' '}
                  <span className="mt-1 block bg-gradient-to-r from-[#F6D383] via-[#E8A85A] to-[#8EE5CE] bg-clip-text font-serif text-transparent italic">
                    học một sàng khôn.
                  </span>
                </h1>
                <p className="font-serif text-sm text-[#F6D383] italic">— Tục ngữ Việt Nam</p>
              </div>

              {/* Khẩu hiệu dẫn nhập (Subheading) */}
              <p className="max-w-2xl text-base leading-relaxed text-[#FDEBD3]/92 sm:text-lg lg:text-[18.5px]">
                Không gian hỗ trợ Toán học và Khoa học Giáo dục, đồng hành cùng người học trên bước
                đường học tập.
              </p>

              {/* Nút hành động chính */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#khong-gian-mon-hoc"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D6B5F] to-[#2B8C7B] px-6 py-3 text-sm font-medium text-[#FFF9F0] shadow-md shadow-[#0C2E29]/40 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
                >
                  <span>Khám phá không gian tri thức</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              {/* Danh ngôn học thuật xoay vòng (Rotating Scholarly Quotes) */}
              <RotatingScholarlyQuote />
            </div>

            {/* Cột Phải: Bộ Sưu Tập Di Sản Thẳng Góc & Cố Định Khung Tương Tác */}
            <div className="relative min-w-0">
              <HeritageArtShowcase />
            </div>
          </div>
        </section>

        {/* KẾT NỐI 1: Dải sóng bờ vịnh & sương sớm 3 lớp hòa vào thềm giấy dó */}
        <ShorelineWaveBridge />

        {/* Không gian liền mạch với đường đồng mức nước chìm cho Học phần & Quỹ đạo Học tập */}
        <div className="relative bg-[var(--bg-page)]">
          <TopographicWaterlinesBackdrop />

          {/* =====================================================================
            SECTION 2: SUBJECT SECTION — SPATIAL SUBJECT GALLERY
            ===================================================================== */}
          <section
            id="khong-gian-mon-hoc"
            aria-label="Không gian Học phần"
            className="relative z-20 -mt-10 scroll-mt-24 pt-2 pb-10 lg:pb-12"
          >
            <div className="lu-container-wide">
              {/* Header 2 tầng: Tầng 1 Tiêu đề & Mô tả trải rộng; Tầng 2 Toolbar linh hoạt không tràn mép */}
              <div className="mb-8 border-b border-[var(--border-subtle)] pb-6">
                {/* TẦNG 1: TIÊU ĐỀ & MÔ TẢ TRẢI RỘNG */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--text-muted)] uppercase">
                    <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>SPATIAL SUBJECT GALLERY · HỆ THỐNG HỌC PHẦN CHUYÊN KHẢO</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                    Không gian Học phần
                  </h2>
                  <p className="mt-1.5 max-w-2xl font-sans text-sm leading-relaxed text-[var(--text-muted)]">
                    Mỗi học phần là một kiến trúc tư duy độc lập với ngôn ngữ hình học riêng.
                  </p>
                </div>

                {/* TẦNG 2: THANH TÁC VỤ & BỘ LỌC (TOOLBAR) */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)]/60 pt-3">
                  {/* Cánh trái: Công tắc chế độ xem [Bản đồ Không gian (Atlas)] | [Văn khố Thư mục (Archival Index)] */}
                  <div className="flex items-center">
                    <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
                  </div>

                  {/* Cánh phải (Nhóm Lọc & Tìm kiếm) */}
                  <div className="flex max-w-full flex-wrap items-center gap-2.5 sm:flex-nowrap">
                    {/* Bộ lọc danh mục */}
                    <div
                      role="tablist"
                      aria-label="Phân nhánh học thuật"
                      className="inline-flex shrink-0 items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-2xs"
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
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]',
                            )}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Ô Tìm kiếm */}
                    <div ref={searchContainerRef} className="relative">
                      <form
                        onSubmit={handleSearchSubmit}
                        role="search"
                        aria-label="Tìm kiếm nội dung học tập"
                      >
                        <div className="relative flex h-8 w-44 items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-xs text-[var(--text-main)] shadow-2xs transition-all focus-within:border-[#365E4E] md:w-56">
                          <Search
                            className="mr-1.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
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
                            className="w-full bg-transparent text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
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
                                className="rounded p-0.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--text-main)]"
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
                          className="absolute top-full right-0 z-40 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-xl sm:w-96"
                        >
                          {instantSearchResults.length > 0 ? (
                            <ul className="divide-y divide-[var(--border-subtle)]/60">
                              {instantSearchResults.map((result) => {
                                if (result.kind === 'subject') {
                                  return (
                                    <li key={`subject-${result.subject.id}`}>
                                      <Link
                                        to={result.href}
                                        onClick={() => setIsSearchDropdownOpen(false)}
                                        className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[var(--bg-sunken)]"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBECE6] text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                                            <Layers className="h-4 w-4" aria-hidden="true" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-semibold text-[var(--text-main)]">
                                                {result.subject.title}
                                              </span>
                                              <Badge variant="neutral">Môn học</Badge>
                                            </div>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                                              {result.subject.description}
                                            </p>
                                          </div>
                                        </div>
                                        <ArrowRight
                                          className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
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
                                      className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[var(--bg-sunken)]"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBECE6] text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-[var(--text-main)]">
                                              Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                              {result.lesson.title}
                                            </span>
                                            <Badge variant="neutral">{result.subject.title}</Badge>
                                          </div>
                                          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                                            {result.lesson.description}
                                          </p>
                                        </div>
                                      </div>
                                      <ArrowRight
                                        className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                                        aria-hidden="true"
                                      />
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                              Không tìm thấy môn học hoặc bài học nào khớp với{' '}
                              <strong className="font-semibold text-[var(--text-main)]">
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
                  {/* SPATIAL SUBJECT GALLERY CÂN XỨNG (grid-cols-1 md:grid-cols-2 gap-6) */}
                  {filteredSubjects.length === 0 ? (
                    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
                      <p className="font-serif text-lg font-semibold text-[var(--text-main)]">
                        Không tìm thấy học phần phù hợp với bộ lọc hiện tại.
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Hãy thử xóa từ khóa tìm kiếm hoặc chuyển sang phân nhánh &ldquo;Tất
                        cả&rdquo;.
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
                    <div
                      data-testid="atlas-subjects-grid"
                      className="grid grid-cols-1 gap-7 md:grid-cols-2"
                    >
                      {filteredSubjects.map((subject, idx) => {
                        const asset = getCourseCinematicAsset(subject.slug);
                        const stats = getSubjectStats(subject);
                        const isPedagogy = asset.branch === 'pedagogy';

                        // Nếu số lượng thẻ đang hiển thị bị lẻ, thẻ cuối trải đều toàn hàng (md:col-span-2) để không để trống nửa phải
                        const isLonelyTailCard =
                          filteredSubjects.length % 2 === 1 && idx === filteredSubjects.length - 1;
                        const galleryIndex = String(idx + 1).padStart(2, '0');

                        return (
                          <FadeIn
                            key={subject.id}
                            delay={idx * 0.06}
                            className={isLonelyTailCard ? 'md:col-span-2' : undefined}
                          >
                            <article
                              style={{ viewTransitionName: `subject-card-${subject.slug}` }}
                              className={cn(
                                'group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs transition-all duration-500 sm:p-8',
                                isPedagogy
                                  ? 'hover:border-[#365E4E] dark:hover:border-[#8EE5CE]/50'
                                  : 'hover:border-[#365E4E] dark:hover:border-[#8EE5CE]/50',
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
                                  <span className="rounded-full border border-[#365E4E]/30 bg-[#EBECE6] px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#365E4E] transition-transform duration-300 group-hover:translate-x-0.5 dark:border-[#8EE5CE]/25 dark:bg-[#19332A] dark:text-[#A6E3CD]">
                                    {asset.categoryLabel}
                                  </span>
                                </div>

                                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                  {stats.chapterCount} chương · {stats.lessonCount} bài giảng
                                </span>
                              </div>

                              {/* Hàng 2: Khung đồ họa hình học không gian riêng biệt (Bespoke SVG Artwork) */}
                              <div className="my-6 h-48 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/75 transition-colors duration-500 group-hover:border-[#365E4E]/40 sm:h-52">
                                <SubjectSpatialArtwork slug={subject.slug} branch={asset.branch} />
                              </div>

                              {/* Hàng 3: Tiêu đề môn học, Mô tả chuyên môn & Nút hành động đồng nhất */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h3 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-main)] transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.65rem]">
                                    <Link
                                      to={ROUTES.subjectOverview(subject.slug)}
                                      className="transition-colors hover:text-[#365E4E] dark:hover:text-[#8EE5CE]"
                                    >
                                      {subject.title}
                                    </Link>
                                  </h3>
                                  <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">
                                    {asset.conciseDescription}
                                  </p>
                                </div>

                                {/* Chân thẻ: Ẩn dụ thị giác & Nút [Vào học phần →] */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                                  <span className="line-clamp-1 font-mono text-[11px] text-[var(--text-muted)]">
                                    {asset.visualMetaphor}
                                  </span>

                                  <Link
                                    to={ROUTES.courseOverview(subject.slug)}
                                    aria-label={`Vào học phần ${subject.title}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#365E4E] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#2B4C3E]"
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

          {/* KẾT NỐI 2 & SECTION 3: CHỈ HIỂN THỊ Ở CHẾ ĐỘ ATLAS */}
          {viewMode === 'atlas' && (
            <>
              <GoldenCompassSpineBridge />

              <section
                aria-label="Không gian Tiếp tục học tập"
                className="relative z-20 py-10 lg:py-12"
              >
                <div className="lu-container-wide">
                  {/* Header khu vực My Learning Orbit */}
                  <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[#365E4E] uppercase dark:text-[#8EE5CE]">
                        <Sparkles className="h-3.5 w-3.5 text-[#C89738]" aria-hidden="true" />
                        <span>MY LEARNING ORBIT · QUỸ ĐẠO HỌC TẬP CÁ NHÂN</span>
                      </div>
                      <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
                        Tiếp tục học tập
                      </h2>
                    </div>
                    <p className="font-mono text-xs text-[var(--text-muted)]">
                      Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt của bạn.
                    </p>
                  </div>

                  {/* Bố cục phân cấp bất đối xứng 65% (8 cột) : 35% (4 cột) */}
                  <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                    {/* VÙNG CHÍNH (65% — lg:col-span-8 — HERO PROGRESS CARD) */}
                    <div
                      role="region"
                      aria-label="Tiếp tục học dở"
                      className="flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm sm:p-8 lg:col-span-8"
                    >
                      {activeRecentLesson ? (
                        <>
                          <div className="space-y-6">
                            {/* Hàng trạng thái & Tiến độ phần trăm */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="rounded-lg bg-[#EBECE6] px-3 py-1 font-mono text-xs font-semibold text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                                  {
                                    getCourseCinematicAsset(activeRecentLesson.subject.slug)
                                      .categoryLabel
                                  }
                                </span>
                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                  {activeRecentLesson.subject.title} · Chương{' '}
                                  {activeRecentLesson.chapter.number}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <ProgressRing
                                  value={displayOrbitPercent}
                                  size={44}
                                  strokeWidth={4}
                                />
                                <div>
                                  <p className="font-mono text-sm font-bold text-[var(--text-main)]">
                                    Tiến trình: {displayOrbitPercent}%
                                  </p>
                                  <p className="text-[11px] text-[var(--text-muted)]">
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
                              <h3 className="font-serif text-2xl leading-snug font-bold text-[var(--text-main)] sm:text-3xl">
                                {activeRecentLesson.lesson.title.startsWith('Bài')
                                  ? activeRecentLesson.lesson.title
                                  : `Bài ${activeRecentLesson.chapter.number}.${activeRecentLesson.lesson.number}: ${activeRecentLesson.lesson.title}`}
                              </h3>
                              <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                                {activeRecentLesson.lesson.description}
                              </p>
                            </div>

                            {/* Thanh tiến độ trực quan */}
                            <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/70 p-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-[var(--text-main)]">
                                  Trạng thái đọc bài &amp; ghi chú học thuật
                                </span>
                                <span className="font-mono font-semibold text-[#365E4E] dark:text-[#8EE5CE]">
                                  {displayOrbitPercent}% hoàn thành
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                                <div
                                  className="h-full rounded-full bg-[#365E4E] transition-all duration-500 dark:bg-[#499C7E]"
                                  style={{ width: `${Math.max(displayOrbitPercent, 6)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Nút chính nổi bật: [Tiếp tục đọc ngay] */}
                          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-5">
                            <div className="text-xs text-[var(--text-muted)]">
                              Thời lượng ước tính:{' '}
                              <strong className="text-[var(--text-main)]">
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
                      <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs transition-colors hover:border-[#365E4E] dark:hover:border-[#8EE5CE]/50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="rounded-lg bg-[#EBECE6] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                              UTILITY 01 · KATEX LEXICON
                            </span>
                            <BookMarked
                              className="h-4 w-4 text-[#365E4E] dark:text-[#8EE5CE]"
                              aria-hidden="true"
                            />
                          </div>

                          <h3 className="font-serif text-xl font-bold text-[var(--text-main)]">
                            Ngân hàng Thuật ngữ KaTeX
                          </h3>

                          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                            Tra cứu tức thời hệ thống ký hiệu đại số, tiên đề hình học, định lý giải
                            tích và thuật ngữ khoa học giáo dục chuẩn mực.
                          </p>

                          {/* Bảng ký hiệu minh họa gọn gàng */}
                          <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/70 p-2.5 text-center font-mono text-xs text-[var(--text-main)]">
                            <span className="rounded-lg bg-[var(--bg-surface)] py-1">
                              G / ker φ
                            </span>
                            <span className="rounded-lg bg-[var(--bg-surface)] py-1">
                              ∀ε &gt; 0, ∃δ
                            </span>
                            <span className="rounded-lg bg-[var(--bg-surface)] py-1">CLO1–9</span>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
                          <Link
                            to="/glossary"
                            onClick={(event) => {
                              event.preventDefault();
                              setIsKaTeXDrawerOpen(true);
                            }}
                            aria-label="Mở Ngân hàng Thuật ngữ & Ký hiệu Toán"
                            className="inline-flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/80 px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:bg-[#365E4E] hover:text-white"
                          >
                            <span>Mở Ngân hàng Thuật ngữ &amp; Ký hiệu Toán</span>
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>

                      {/* Tiện ích 2: Phòng Lab Hình học 3D */}
                      <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs transition-colors hover:border-[#365E4E] dark:hover:border-[#8EE5CE]/50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="rounded-lg bg-[#EBECE6] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#365E4E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
                              UTILITY 02 · SPATIAL LAB
                            </span>
                            <Compass
                              className="h-4 w-4 text-[#365E4E] dark:text-[#8EE5CE]"
                              aria-hidden="true"
                            />
                          </div>

                          <h3 className="font-serif text-xl font-bold text-[var(--text-main)]">
                            Phòng Lab Hình học 3D
                          </h3>

                          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                            Cửa sổ mô phỏng trực quan không gian Affine, phép biến đổi đẳng cự và
                            hình học phối cảnh đa chiều.
                          </p>

                          {/* Cửa sổ preview trực quan dẫn vào không gian mô phỏng */}
                          <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] p-2">
                            <svg viewBox="0 0 280 76" className="h-16 w-full" aria-hidden="true">
                              <line
                                x1="16"
                                y1="62"
                                x2="264"
                                y2="62"
                                stroke="var(--border-subtle)"
                                strokeWidth="1"
                              />
                              <polygon
                                points="76,54 132,14 204,24 148,64"
                                fill="var(--bg-surface)"
                                stroke="#365E4E"
                                strokeWidth="1.3"
                              />
                              <polygon
                                points="108,18 184,12 196,58 120,64"
                                fill="var(--bg-sunken)"
                                fillOpacity="0.65"
                                stroke="#365E4E"
                                strokeWidth="1.2"
                              />
                              <circle cx="140" cy="38" r="3.5" fill="#C89738" />
                              <text
                                x="14"
                                y="20"
                                fill="var(--text-muted)"
                                fontSize="8.5"
                                fontFamily="monospace"
                              >
                                3D AFFINE VIEWPORT
                              </text>
                            </svg>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
                          <a
                            href="/interactive/affine-geometry.html"
                            aria-label="Mở Phòng Lab Hình học Không gian"
                            className="inline-flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/80 px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:bg-[#365E4E] hover:text-white"
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
            </>
          )}
        </div>

        {/* KẾT NỐI 3: Dải chạng vạng bờ hồ & thảm thực vật ven nước chuyển êm vào Hồ Sen Đêm */}
        <LakeshoreLotusTransition />
      </div>

      {/* Đại cảnh Hồ Sen Tri Thức chuyển tiếp chân trang (Grand Lotus Lake Panorama — Không gian thuần khiết) */}
      <GrandLotusLake pageScrollProgress={pageScrollProgress} />

      {/* Ngăn kéo Tra cứu Thuật ngữ & Ký hiệu KaTeX (Quick KaTeX Drawer) */}
      <QuickKaTeXDrawer isOpen={isKaTeXDrawerOpen} onClose={() => setIsKaTeXDrawerOpen(false)} />
    </div>
  );
}

export default HomePage;
