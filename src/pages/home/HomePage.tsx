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
import {
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type HubBranchFilter = 'all' | AcademicBranch;

interface HeroNodeMeta {
  readonly slug: string;
  readonly code: string;
  readonly shortTitle: string;
  readonly subtitle: string;
  readonly branch: AcademicBranch;
  /** Tọa độ tương đối trên khung SVG trung tâm (viewBox 0..1000 x 0..640) */
  readonly cx: number;
  readonly cy: number;
  readonly anchorX: number;
  readonly anchorY: number;
  readonly formula: string;
}

const HERO_KNOWLEDGE_NODES: readonly HeroNodeMeta[] = [
  {
    slug: 'cau-truc-dai-so',
    code: 'MATH1301',
    shortTitle: 'Cấu trúc đại số',
    subtitle: 'Nhóm · Vành · Trường & Đẳng cấu',
    branch: 'math',
    cx: 175,
    cy: 165,
    anchorX: 430,
    anchorY: 270,
    formula: 'G / ker(φ) ≅ Im(φ)',
  },
  {
    slug: 'hinh-hoc-affine',
    code: 'MATH1302',
    shortTitle: 'Hình học Affine & Euclide',
    subtitle: 'Phẳng con · Tâm tỉ cự & Đẳng cự',
    branch: 'math',
    cx: 825,
    cy: 165,
    anchorX: 570,
    anchorY: 270,
    formula: 'AB + BC = AC',
  },
  {
    slug: 'giai-tich-ham-mot-bien',
    code: 'MATH1303',
    shortTitle: 'Giải tích hàm một biến',
    subtitle: 'Giới hạn · Vi phân & Tích phân Riemann',
    branch: 'math',
    cx: 175,
    cy: 485,
    anchorX: 430,
    anchorY: 370,
    formula: '∫ f(x)dx = F(b) − F(a)',
  },
  {
    slug: 'giao-duc-hoc',
    code: 'EDUC2802',
    shortTitle: 'Giáo dục học',
    subtitle: 'Hoạt động sư phạm · Chủ nhiệm & HĐTN',
    branch: 'pedagogy',
    cx: 825,
    cy: 485,
    anchorX: 570,
    anchorY: 370,
    formula: 'CLO1–CLO9 · HCMUE',
  },
] as const;

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
  const strokeMain = branch === 'pedagogy' ? '#5E786D' : '#3F6570';
  const strokeAccent = '#92714F';

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
              stroke="#CFDADB"
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
          fill="#F7FAFA"
          fillOpacity="0.65"
          stroke={strokeMain}
          strokeWidth="1.5"
        />
        <polygon
          points="260,64 308,92 308,148 260,176 212,148 212,92"
          fill="#E1E9EA"
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
            fill={idx === 6 ? strokeAccent : '#F7FAFA'}
            stroke={idx === 6 ? strokeAccent : strokeMain}
            strokeWidth="1.6"
          />
        ))}

        {/* Ký hiệu toán học tinh tế */}
        <text x="24" y="34" fill="#55676B" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
          LATTICE · D₆ / CAYLEY GRAPH
        </text>
        <text x="378" y="222" fill="#3F6570" fontSize="11" fontFamily="serif" fontStyle="italic">
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
        <g stroke="#CFDADB" strokeWidth="0.7" fill="none">
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
          fill="#F7FAFA"
          fillOpacity="0.75"
          stroke={strokeMain}
          strokeWidth="1.5"
        />

        {/* Mặt phẳng cắt P_2 tạo giao tuyến affine */}
        <polygon
          points="115,62 295,46 315,174 135,190"
          fill="#E1E9EA"
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
          stroke="#29383D"
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
        <circle cx="265" cy="122" r="3" fill="#F7FAFA" stroke={strokeMain} strokeWidth="1.5" />
        <circle cx="142" cy="172" r="3" fill="#F7FAFA" stroke={strokeMain} strokeWidth="1.5" />
        <circle cx="185" cy="66" r="3" fill="#F7FAFA" stroke={strokeMain} strokeWidth="1.5" />

        <text x="20" y="32" fill="#55676B" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
          AFFINE SPACE · (O; e₁, e₂, e₃)
        </text>
        <text x="285" y="222" fill="#3F6570" fontSize="11" fontFamily="serif" fontStyle="italic">
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
        <line x1="36" y1="188" x2="392" y2="188" stroke="#55676B" strokeWidth="1.1" />
        <line x1="58" y1="28" x2="58" y2="212" stroke="#55676B" strokeWidth="1.1" />

        {/* Dải lân cận epsilon-delta */}
        <rect
          x="58"
          y="74"
          width="320"
          height="42"
          fill="#E1E9EA"
          fillOpacity="0.45"
          stroke="#CFDADB"
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
            fill={idx % 2 === 0 ? '#3F6570' : '#5E786D'}
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
        <circle cx="172" cy="85" r="4.5" fill={strokeAccent} stroke="#F7FAFA" strokeWidth="1.5" />

        <text x="72" y="34" fill="#55676B" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
          RIEMANN INTEGRAL · CONTINUUM
        </text>
        <text x="278" y="218" fill="#3F6570" fontSize="11" fontFamily="serif" fontStyle="italic">
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
        fill="#F7FAFA"
        fillOpacity="0.55"
        stroke="#CFDADB"
        strokeWidth="1.1"
      />
      <ellipse
        cx="260"
        cy="122"
        rx="138"
        ry="62"
        fill="#E1E9EA"
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
        fill="#F7FAFA"
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
      <circle cx="260" cy="46" r="5" fill={strokeAccent} stroke="#F7FAFA" strokeWidth="1.5" />
      <circle cx="148" cy="176" r="5" fill="#F7FAFA" stroke={strokeMain} strokeWidth="1.8" />
      <circle cx="372" cy="176" r="5" fill="#F7FAFA" stroke={strokeMain} strokeWidth="1.8" />

      {/* Các vệ tinh thành tố quá trình giáo dục (Mục đích, Nội dung, Phương pháp, Kết quả) */}
      <circle cx="102" cy="96" r="3.5" fill={strokeMain} />
      <circle cx="418" cy="96" r="3.5" fill={strokeMain} />
      <line x1="102" y1="96" x2="178" y2="122" stroke="#CFDADB" strokeWidth="1" />
      <line x1="418" y1="96" x2="342" y2="122" stroke="#CFDADB" strokeWidth="1" />

      <text x="24" y="32" fill="#55676B" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
        PEDAGOGICAL ECOSYSTEM · HUMAN &amp; SOCIETY
      </text>
      <text x="276" y="42" fill="#29383D" fontSize="10" fontFamily="monospace">
        NHÀ TRƯỜNG
      </text>
      <text x="86" y="192" fill="#55676B" fontSize="10" fontFamily="monospace">
        GIA ĐÌNH
      </text>
      <text x="382" y="192" fill="#55676B" fontSize="10" fontFamily="monospace">
        XÃ HỘI
      </text>
      <text x="368" y="224" fill="#5E786D" fontSize="11" fontFamily="serif" fontStyle="italic">
        Nhân cách · Chủ đạo
      </text>
    </svg>
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
  const [activeHeroNode, setActiveHeroNode] = useState<string>('cau-truc-dai-so');
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pageScrollProgress, setPageScrollProgress] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'Escape') {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Parallax nhẹ theo tọa độ chuột cho cấu trúc không gian tầng 2 của Hero
  const handleHeroPointerMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const normX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointerOffset({
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    });
  };

  const handleHeroPointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

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

  const activeNodeDetail =
    HERO_KNOWLEDGE_NODES.find((node) => node.slug === activeHeroNode) ?? HERO_KNOWLEDGE_NODES[0]!;

  // Chiều dài đường dẫn The Knowledge Thread
  const threadPathLength = 2400;
  const threadDashOffset = prefersReducedMotion
    ? 0
    : Math.round(threadPathLength * (1 - Math.max(0.14, pageScrollProgress)));

  return (
    <div className="relative overflow-x-clip bg-[#EAF0F1] text-[#29383D]">
      {/* =====================================================================
          SIGNATURE ELEMENT: THE KNOWLEDGE THREAD (ĐƯỜNG DẪN TRI THỨC XUYÊN SUỐT)
          Kết nối tuần tự: Hero -> Subject Gallery -> My Learning Orbit -> Footer
          ===================================================================== */}
      <div
        data-testid="the-knowledge-thread"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-10 hidden overflow-hidden lg:block"
      >
        <svg
          viewBox="0 0 1440 2400"
          preserveAspectRatio="none"
          className="h-full w-full"
          fill="none"
        >
          {/* Đường dẫn nền tĩnh cực mảnh */}
          <path
            d="M 720 140 C 720 420, 1120 560, 1120 860 C 1120 1160, 320 1320, 320 1640 C 320 1920, 720 2080, 720 2380"
            stroke="#CFDADB"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          {/* Đường dẫn động vẽ theo thao tác cuộn trang */}
          <path
            d="M 720 140 C 720 420, 1120 560, 1120 860 C 1120 1160, 320 1320, 320 1640 C 320 1920, 720 2080, 720 2380"
            stroke="#3F6570"
            strokeWidth="1.75"
            strokeOpacity="0.55"
            strokeDasharray={threadPathLength}
            strokeDashoffset={threadDashOffset}
            style={{
              transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 180ms ease-out',
            }}
          />

          {/* 4 Điểm nút (Knowledge Thread Stations) sáng nhẹ khi cuộn qua từng khu vực */}
          {[
            { cx: 720, cy: 220, threshold: 0.02 },
            { cx: 1120, cy: 860, threshold: 0.32 },
            { cx: 320, cy: 1640, threshold: 0.68 },
            { cx: 720, cy: 2340, threshold: 0.92 },
          ].map((station, idx) => {
            const isLit = prefersReducedMotion || pageScrollProgress >= station.threshold;
            return (
              <g key={idx}>
                <circle
                  cx={station.cx}
                  cy={station.cy}
                  r={isLit ? 9 : 6}
                  fill={isLit ? '#92714F' : '#E1E9EA'}
                  fillOpacity={isLit ? 0.22 : 0.4}
                />
                <circle
                  cx={station.cx}
                  cy={station.cy}
                  r="4"
                  fill={isLit ? '#3F6570' : '#CFDADB'}
                  stroke="#F7FAFA"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* =====================================================================
          SECTION 1: HERO — THE KNOWLEDGE UNIVERSE (BỐ CỤC ĐA LỚP 4 TẦNG)
          ===================================================================== */}
      <section
        aria-label="Không gian Khởi đầu Learning Universe"
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={handleHeroPointerLeave}
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden border-b border-[#CFDADB] bg-[#EAF0F1] pt-24 pb-10 md:pt-28 md:pb-12"
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
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#CFDADB_1px,transparent_1px),linear-gradient(to_bottom,#CFDADB_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-35"
        />

        {/* Container chính của Hero (Kết hợp Layer 4 Foreground Typography & Layer 2 + 3 Spatial Atlas) */}
        <div className="relative z-20 mx-auto my-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
          {/* LAYER 4 (Foreground Typography & CTAs — Cột Trái 6/12) */}
          <div className="space-y-6 lg:col-span-6">
            {/* Dòng định danh chuẩn mực */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#CFDADB] bg-[#F7FAFA]/90 px-3.5 py-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#3F6570]" aria-hidden="true" />
              <span className="font-mono text-xs tracking-widest text-[#55676B] uppercase">
                LEARNING UNIVERSE / 2026 · A SPACE FOR KNOWLEDGE
              </span>
            </div>

            {/* Tiêu đề chính (Serif) */}
            <h1 className="font-serif text-4xl leading-[1.08] font-bold tracking-tight text-[#29383D] sm:text-5xl lg:text-6xl">
              <span className="sr-only">LEARNING UNIVERSE — </span>
              <span className="block">Tri thức không</span>{' '}
              <span className="mt-1 block font-normal text-[#3F6570] italic">có biên giới.</span>
            </h1>

            {/* Tagline */}
            <p className="max-w-xl text-base leading-relaxed text-[#55676B] sm:text-lg">
              Nơi Toán học gặp gỡ Khoa học Giáo dục. Một không gian kết nối tư duy, khám phá và hành
              trình trở thành người kiến tạo tri thức.
            </p>

            {/* Hai nút CTA đồng cấp */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#khong-gian-mon-hoc"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3F6570] px-6 py-3 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-[#345761]"
              >
                <span>Khám phá không gian tri thức</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                to="/glossary"
                className="inline-flex items-center gap-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] px-6 py-3 text-sm font-medium text-[#29383D] transition-all duration-200 hover:bg-[#E1E9EA]"
              >
                <BookMarked className="h-4 w-4 text-[#3F6570]" aria-hidden="true" />
                <span>Tra cứu thuật ngữ KaTeX</span>
              </Link>
            </div>

            {/* Dải thông tin tọa độ nút tri thức đang tương tác */}
            <div className="rounded-2xl border border-[#CFDADB] bg-[#F7FAFA]/85 p-4 backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#E1E9EA] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#3F6570]">
                    {activeNodeDetail.code}
                  </span>
                  <span className="font-serif text-sm font-bold text-[#29383D]">
                    {activeNodeDetail.shortTitle}
                  </span>
                </div>
                <span className="font-mono text-xs text-[#92714F]">{activeNodeDetail.formula}</span>
              </div>
              <p className="mt-1.5 text-xs text-[#55676B]">
                {activeNodeDetail.subtitle} — Di chuyển qua các nút trên cấu trúc không gian để khảo
                sát mối liên kết giữa 04 học phần cốt lõi.
              </p>
            </div>
          </div>

          {/* LAYER 2 (Center Geometric Architecture) & LAYER 3 (4 Điểm kết nối — Cột Phải 6/12) */}
          <div className="relative lg:col-span-6">
            <div
              data-testid="hero-spatial-structure"
              className="relative mx-auto aspect-[1000/640] w-full max-w-2xl rounded-3xl border border-[#CFDADB] bg-[#F7FAFA]/75 p-3 shadow-sm backdrop-blur-md sm:p-5"
            >
              {/* Nhãn góc kiến trúc */}
              <div className="mb-2 flex items-center justify-between px-2 font-mono text-[10px] tracking-widest text-[#55676B] uppercase">
                <span>ATLAS PROJECTION · HCMUE</span>
                <span>10°45′42″N · 106°40′56″E</span>
              </div>

              {/* Khối SVG Tương tác kết hợp Layer 2 (Cấu trúc hình học trung tâm) & Layer 3 (4 Nút môn học) */}
              <svg
                viewBox="0 0 1000 640"
                className="h-full w-full select-none"
                role="img"
                aria-label="Bản đồ cấu trúc không gian tri thức kết nối 4 học phần MATH1301, MATH1302, MATH1303 và EDUC2802"
              >
                <defs>
                  <radialGradient id="atlas-core-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3F6570" stopOpacity="0.16" />
                    <stop offset="65%" stopColor="#5E786D" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#EAF0F1" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Hào quang kiến trúc dịu nhẹ ở tâm */}
                <circle cx="500" cy="320" r="250" fill="url(#atlas-core-glow)" />

                {/* Trục chuẩn hình học cố định */}
                <line
                  x1="80"
                  y1="320"
                  x2="920"
                  y2="320"
                  stroke="#CFDADB"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <line
                  x1="500"
                  y1="40"
                  x2="500"
                  y2="600"
                  stroke="#CFDADB"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />

                {/* LAYER 2 (Center): Khối kiến trúc hình học trừu tượng dịch chuyển parallax nhẹ */}
                <g
                  style={{
                    transform: prefersReducedMotion
                      ? undefined
                      : `translate3d(${pointerOffset.x * 14}px, ${pointerOffset.y * 10}px, 0)`,
                    transition: prefersReducedMotion ? 'none' : 'transform 220ms ease-out',
                  }}
                >
                  {/* Vòng quỹ đạo kinh tuyến & vĩ tuyến không gian */}
                  <circle
                    cx="500"
                    cy="320"
                    r="190"
                    fill="none"
                    stroke="#CFDADB"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="500"
                    cy="320"
                    r="138"
                    fill="none"
                    stroke="#3F6570"
                    strokeWidth="1.2"
                    strokeOpacity="0.4"
                    strokeDasharray="6 6"
                  />
                  <ellipse
                    cx="500"
                    cy="320"
                    rx="185"
                    ry="78"
                    fill="none"
                    stroke="#5E786D"
                    strokeWidth="1.2"
                    strokeOpacity="0.45"
                    transform="rotate(-22 500 320)"
                  />
                  <ellipse
                    cx="500"
                    cy="320"
                    rx="185"
                    ry="78"
                    fill="none"
                    stroke="#3F6570"
                    strokeWidth="1.2"
                    strokeOpacity="0.45"
                    transform="rotate(22 500 320)"
                  />

                  {/* Đa diện kiến trúc trung tâm (Isometric Octahedron / Polyhedral Core) */}
                  <polygon
                    points="500,175 630,270 575,425 425,425 370,270"
                    fill="#F7FAFA"
                    fillOpacity="0.7"
                    stroke="#3F6570"
                    strokeWidth="1.8"
                  />
                  <polygon
                    points="500,210 595,285 550,395 450,395 405,285"
                    fill="#E1E9EA"
                    fillOpacity="0.6"
                    stroke="#5E786D"
                    strokeWidth="1.4"
                  />

                  {/* Các đường chéo cấu trúc không gian bên trong khối đa diện */}
                  <line
                    x1="500"
                    y1="175"
                    x2="500"
                    y2="465"
                    stroke="#3F6570"
                    strokeWidth="1.2"
                    strokeOpacity="0.55"
                  />
                  <line
                    x1="370"
                    y1="270"
                    x2="630"
                    y2="270"
                    stroke="#3F6570"
                    strokeWidth="1.2"
                    strokeOpacity="0.55"
                  />
                  <line
                    x1="425"
                    y1="425"
                    x2="630"
                    y2="270"
                    stroke="#92714F"
                    strokeWidth="1.1"
                    strokeOpacity="0.5"
                  />
                  <line
                    x1="575"
                    y1="425"
                    x2="370"
                    y2="270"
                    stroke="#92714F"
                    strokeWidth="1.1"
                    strokeOpacity="0.5"
                  />

                  {/* Hạt nhân trung tâm (The Living Atlas Core) */}
                  <circle
                    cx="500"
                    cy="320"
                    r="22"
                    fill="#F7FAFA"
                    stroke="#3F6570"
                    strokeWidth="2"
                  />
                  <circle cx="500" cy="320" r="7" fill="#92714F" />
                </g>

                {/* LAYER 3 (4 Điểm kết nối): Đường line SVG hữu cơ & 4 nút môn học */}
                {HERO_KNOWLEDGE_NODES.map((node) => {
                  const isActive = activeHeroNode === node.slug;
                  const nodeColor = node.branch === 'pedagogy' ? '#5E786D' : '#3F6570';
                  const controlX = (node.cx + node.anchorX) / 2;
                  const controlY = node.cy;

                  return (
                    <g
                      key={node.slug}
                      onMouseEnter={() => setActiveHeroNode(node.slug)}
                      onClick={() => void navigate(ROUTES.courseOverview(node.slug))}
                      className="cursor-pointer"
                    >
                      {/* Đường line SVG mảnh kết nối hữu cơ với cấu trúc trung tâm */}
                      <path
                        d={`M ${node.anchorX + pointerOffset.x * 10} ${node.anchorY + pointerOffset.y * 8} Q ${controlX} ${controlY} ${node.cx} ${node.cy}`}
                        fill="none"
                        stroke={isActive ? '#92714F' : nodeColor}
                        strokeWidth={isActive ? '2.2' : '1.3'}
                        strokeDasharray={isActive ? undefined : '4 4'}
                        strokeOpacity={isActive ? '0.95' : '0.55'}
                      />

                      {/* Vòng phản hồi quanh điểm nút */}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={isActive ? 30 : 22}
                        fill={isActive ? '#92714F' : nodeColor}
                        fillOpacity={isActive ? 0.14 : 0.07}
                      />

                      {/* Thẻ nhãn nút tri thức trên bản đồ SVG */}
                      <rect
                        x={node.cx - 125}
                        y={node.cy - 34}
                        width="250"
                        height="68"
                        rx="14"
                        fill={isActive ? '#F7FAFA' : '#F7FAFA'}
                        stroke={isActive ? '#3F6570' : '#CFDADB'}
                        strokeWidth={isActive ? '1.8' : '1.2'}
                      />

                      <circle
                        cx={node.cx - 102}
                        cy={node.cy - 8}
                        r="5"
                        fill={isActive ? '#92714F' : nodeColor}
                      />

                      <text
                        x={node.cx - 88}
                        y={node.cy - 4}
                        fill="#3F6570"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {node.code}
                      </text>

                      <text
                        x={node.cx - 16}
                        y={node.cy - 4}
                        fill="#55676B"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        · {node.branch === 'pedagogy' ? 'SƯ PHẠM' : 'TOÁN HỌC'}
                      </text>

                      <text
                        x={node.cx - 102}
                        y={node.cy + 18}
                        fill="#29383D"
                        fontSize="13"
                        fontFamily="serif"
                        fontWeight="bold"
                      >
                        {node.shortTitle}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Danh sách nút tương tác hỗ trợ bàn phím & thiết bị di động */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {HERO_KNOWLEDGE_NODES.map((node) => {
                  const isActive = activeHeroNode === node.slug;
                  return (
                    <button
                      key={node.slug}
                      type="button"
                      onMouseEnter={() => setActiveHeroNode(node.slug)}
                      onFocus={() => setActiveHeroNode(node.slug)}
                      onClick={() => void navigate(ROUTES.courseOverview(node.slug))}
                      className={cn(
                        'flex cursor-pointer flex-col items-start rounded-xl border px-3 py-2 text-left transition-all',
                        isActive
                          ? 'border-[#3F6570] bg-[#E1E9EA]/80 text-[#29383D]'
                          : 'border-[#CFDADB] bg-[#F7FAFA]/70 text-[#55676B] hover:border-[#3F6570]/50 hover:text-[#29383D]',
                      )}
                    >
                      <span className="font-mono text-[10px] font-semibold text-[#3F6570]">
                        {node.code}
                      </span>
                      <span className="line-clamp-1 font-serif text-xs font-bold text-[#29383D]">
                        {node.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Chân trang Hero (Architectural Status Bar) */}
        <div className="relative z-20 mx-auto mt-10 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-[#CFDADB] px-4 pt-5 text-xs text-[#55676B] sm:flex-row sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-[#3F6570] uppercase">
            TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC · HCMUE
          </p>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#55676B] uppercase">
            04 HỌC PHẦN · 123 BÀI GIẢNG · ĐỒNG BỘ 2026
          </p>
          <a
            href="#khong-gian-mon-hoc"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-[#29383D] uppercase transition-colors hover:text-[#3F6570]"
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
        className="relative z-20 scroll-mt-24 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tiêu đề phân cảnh & Thanh công cụ tối giản (3 Tabs + DUY NHẤT 01 Ô tìm kiếm thông minh) */}
          <div className="mb-12 flex flex-col justify-between gap-6 border-b border-[#CFDADB] pb-8 lg:flex-row lg:items-end">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[#3F6570] uppercase">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>SPATIAL SUBJECT GALLERY · 04 HỌC PHẦN CỐT LÕI</span>
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#29383D] sm:text-4xl">
                Không gian Học phần
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#55676B] sm:text-base">
                Mỗi học phần là một kiến trúc tư duy độc lập với ngôn ngữ hình học riêng, kết nối
                giữa nền tảng Toán học chặt chẽ, chuẩn mực và Khoa học Giáo dục nhân văn.
              </p>
            </div>

            {/* Thanh công cụ tối giản: Các tab phân loại + DUY NHẤT 01 ô tìm kiếm thông minh */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              {/* Các tab phân loại: [Tất cả], [Toán học], [Khoa học Giáo dục] */}
              <div
                role="tablist"
                aria-label="Phân nhánh học thuật"
                className="inline-flex shrink-0 items-center rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-1"
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
                        'cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-all',
                        isSelected
                          ? 'bg-[#3F6570] text-white shadow-2xs'
                          : 'text-[#55676B] hover:text-[#29383D]',
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* DUY NHẤT 01 Ô TÌM KIẾM THÔNG MINH (Loại bỏ triệt để tình trạng 2 ô tìm kiếm trùng lặp) */}
              <div ref={searchContainerRef} className="relative w-full sm:w-80">
                <form
                  onSubmit={handleSearchSubmit}
                  role="search"
                  aria-label="Tìm kiếm nội dung học tập"
                >
                  <div className="relative flex items-center">
                    <Search
                      className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#55676B]"
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
                      placeholder="Tìm mã môn, chương, định lý..."
                      aria-label="Tìm kiếm môn học hoặc bài học"
                      aria-expanded={isSearchDropdownOpen && hasSearchQuery}
                      aria-controls={searchListboxId}
                      className="h-10 w-full rounded-xl border border-[#CFDADB] bg-[#F7FAFA] pr-16 pl-10 text-xs text-[#29383D] transition-colors placeholder:text-[#55676B] focus:border-[#3F6570] focus:outline-none"
                    />
                    <div className="absolute right-2.5 flex items-center gap-1">
                      {hasSearchQuery ? (
                        <button
                          type="button"
                          aria-label="Xóa từ khóa tìm kiếm"
                          onClick={() => {
                            setHubQuery('');
                            searchInputRef.current?.focus();
                          }}
                          className="rounded-md p-1 text-[#55676B] transition-colors hover:bg-[#E1E9EA] hover:text-[#29383D]"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : (
                        <Kbd className="hidden sm:inline-flex">/</Kbd>
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
                    className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-2 shadow-xl sm:left-auto sm:w-[26rem]"
                  >
                    {instantSearchResults.length > 0 ? (
                      <ul className="divide-y divide-[#CFDADB]/60">
                        {instantSearchResults.map((result) => {
                          if (result.kind === 'subject') {
                            return (
                              <li key={`subject-${result.subject.id}`}>
                                <Link
                                  to={result.href}
                                  onClick={() => setIsSearchDropdownOpen(false)}
                                  className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[#E1E9EA]/70"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E1E9EA] text-[#3F6570]">
                                      <Layers className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[#29383D]">
                                          {result.subject.title}
                                        </span>
                                        <Badge variant="neutral">Môn học</Badge>
                                      </div>
                                      <p className="mt-0.5 line-clamp-1 text-xs text-[#55676B]">
                                        {result.subject.description}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    className="h-4 w-4 shrink-0 text-[#55676B]"
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
                                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-[#E1E9EA]/70"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E1E9EA] text-[#3F6570]">
                                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-semibold text-[#29383D]">
                                        Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                        {result.lesson.title}
                                      </span>
                                      <Badge variant="neutral">{result.subject.shortTitle}</Badge>
                                    </div>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-[#55676B]">
                                      {result.lesson.description}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight
                                  className="h-4 w-4 shrink-0 text-[#55676B]"
                                  aria-hidden="true"
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-xs text-[#55676B]">
                        Không tìm thấy môn học hoặc bài học nào khớp với{' '}
                        <strong className="font-semibold text-[#29383D]">
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

          {/* SPATIAL SUBJECT GALLERY BẤT ĐỐI XỨNG (Asymmetric 12-Column Architectural Grid) */}
          {filteredSubjects.length === 0 ? (
            <div className="rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-12 text-center">
              <p className="font-serif text-lg font-semibold text-[#29383D]">
                Không tìm thấy học phần phù hợp với bộ lọc hiện tại.
              </p>
              <p className="mt-1 text-sm text-[#55676B]">
                Hãy thử xóa từ khóa tìm kiếm hoặc chuyển sang phân nhánh &ldquo;Tất cả&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveBranch('all');
                  setHubQuery('');
                }}
                className="mt-4 cursor-pointer rounded-xl bg-[#3F6570] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#345761]"
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
                        'group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs transition-all duration-500 sm:p-8',
                        isPedagogy
                          ? 'hover:border-[#5E786D] hover:bg-[#ECF2EE]'
                          : 'hover:border-[#3F6570] hover:bg-[#E9F1F2]',
                      )}
                    >
                      {/* Hàng 1: Định danh số thứ tự, Mã học phần & Phân nhánh */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#92714F]">
                            {galleryIndex}.
                          </span>
                          <span
                            className={cn(
                              'rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-wider transition-transform duration-300 group-hover:translate-x-0.5',
                              isPedagogy
                                ? 'border-[#5E786D]/30 bg-[#E1E9EA] text-[#5E786D]'
                                : 'border-[#3F6570]/30 bg-[#E1E9EA] text-[#3F6570]',
                            )}
                          >
                            {asset.categoryLabel}
                          </span>
                        </div>

                        <span className="font-mono text-[11px] text-[#55676B]">
                          {stats.chapterCount} chương · {stats.lessonCount} bài giảng
                        </span>
                      </div>

                      {/* Hàng 2: Khung đồ họa hình học không gian riêng biệt (Bespoke SVG Artwork) */}
                      <div
                        className={cn(
                          'my-6 overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/75 transition-colors duration-500 group-hover:border-[#3F6570]/40',
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
                          <h3 className="font-serif text-2xl font-bold tracking-tight text-[#29383D] transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.65rem]">
                            <Link
                              to={ROUTES.subjectOverview(subject.slug)}
                              className="transition-colors hover:text-[#3F6570]"
                            >
                              {subject.title}
                            </Link>
                          </h3>
                          <p className="line-clamp-3 text-sm leading-relaxed text-[#55676B]">
                            {asset.conciseDescription}
                          </p>
                        </div>

                        {/* Chân thẻ: Ẩn dụ thị giác & Nút [Vào học phần →] */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#CFDADB] pt-4">
                          <span className="line-clamp-1 font-mono text-[11px] text-[#55676B]">
                            {asset.visualMetaphor}
                          </span>

                          <Link
                            to={ROUTES.courseOverview(subject.slug)}
                            aria-label={`Vào học phần ${subject.title}`}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-200',
                              isPedagogy
                                ? 'bg-[#5E786D] hover:bg-[#4E665C]'
                                : 'bg-[#3F6570] hover:bg-[#345761]',
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
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: CONTINUE LEARNING — MY LEARNING ORBIT (BỐ CỤC BẤT ĐỐI XỨNG 65% : 35%)
          ===================================================================== */}
      <section
        aria-label="Không gian Tiếp tục học tập"
        className="relative z-20 border-t border-[#CFDADB] bg-[#E1E9EA]/45 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header khu vực My Learning Orbit */}
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[#3F6570] uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#92714F]" aria-hidden="true" />
                <span>MY LEARNING ORBIT · QUỸ ĐẠO HỌC TẬP CÁ NHÂN</span>
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#29383D] sm:text-4xl">
                Tiếp tục học tập
              </h2>
            </div>
            <p className="font-mono text-xs text-[#55676B]">
              Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt của bạn.
            </p>
          </div>

          {/* Bố cục phân cấp bất đối xứng 65% (8 cột) : 35% (4 cột) */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            {/* VÙNG CHÍNH (65% — lg:col-span-8 — HERO PROGRESS CARD) */}
            <div
              role="region"
              aria-label="Tiếp tục học dở"
              className="flex flex-col justify-between rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-sm sm:p-8 lg:col-span-8"
            >
              {activeRecentLesson ? (
                <>
                  <div className="space-y-6">
                    {/* Hàng trạng thái & Tiến độ phần trăm */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CFDADB] pb-5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-lg bg-[#E1E9EA] px-3 py-1 font-mono text-xs font-semibold text-[#3F6570]">
                          {getCourseCinematicAsset(activeRecentLesson.subject.slug).courseCode}
                        </span>
                        <span className="text-xs font-medium text-[#55676B]">
                          {activeRecentLesson.subject.title} · Chương{' '}
                          {activeRecentLesson.chapter.number}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <ProgressRing value={displayOrbitPercent} size={44} strokeWidth={4} />
                        <div>
                          <p className="font-mono text-sm font-bold text-[#29383D]">
                            Tiến trình: {displayOrbitPercent}%
                          </p>
                          <p className="text-[11px] text-[#55676B]">
                            {completedCount > 0
                              ? `Đã hoàn thành ${completedCount}/${totalLessonCount} bài`
                              : 'Đang đọc dở trên trình duyệt'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tiêu đề bài học đang đọc dở & Trích đoạn ngắn nội dung */}
                    <div className="space-y-3">
                      <p className="font-mono text-xs tracking-wider text-[#92714F] uppercase">
                        BÀI HỌC ĐANG ĐỌC DỞ
                      </p>
                      <h3 className="font-serif text-2xl leading-snug font-bold text-[#29383D] sm:text-3xl">
                        {activeRecentLesson.lesson.title.startsWith('Bài')
                          ? activeRecentLesson.lesson.title
                          : `Bài ${activeRecentLesson.chapter.number}.${activeRecentLesson.lesson.number}: ${activeRecentLesson.lesson.title}`}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#55676B] sm:text-base">
                        {activeRecentLesson.lesson.description}
                      </p>
                    </div>

                    {/* Thanh tiến độ trực quan */}
                    <div className="space-y-2 rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#29383D]">
                          Trạng thái đọc bài &amp; ghi chú học thuật
                        </span>
                        <span className="font-mono font-semibold text-[#3F6570]">
                          {displayOrbitPercent}% hoàn thành
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#CFDADB]">
                        <div
                          className="h-full rounded-full bg-[#3F6570] transition-all duration-500"
                          style={{ width: `${Math.max(displayOrbitPercent, 6)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút chính nổi bật: [Tiếp tục đọc ngay] */}
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#CFDADB] pt-5">
                    <div className="text-xs text-[#55676B]">
                      Thời lượng ước tính:{' '}
                      <strong className="text-[#29383D]">
                        {activeRecentLesson.lesson.estimatedMinutes} phút đọc sâu
                      </strong>
                    </div>

                    <Link
                      to={ROUTES.lesson(
                        activeRecentLesson.subject.slug,
                        activeRecentLesson.chapter.slug,
                        activeRecentLesson.lesson.slug,
                      )}
                      className="inline-flex items-center gap-2.5 rounded-xl bg-[#3F6570] px-6 py-3 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-[#345761]"
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
              <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs transition-colors hover:border-[#3F6570]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#E1E9EA] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#3F6570]">
                      UTILITY 01 · KATEX LEXICON
                    </span>
                    <BookMarked className="h-4 w-4 text-[#3F6570]" aria-hidden="true" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#29383D]">
                    Ngân hàng Thuật ngữ KaTeX
                  </h3>

                  <p className="text-xs leading-relaxed text-[#55676B]">
                    Tra cứu tức thời hệ thống ký hiệu đại số, tiên đề hình học, định lý giải tích và
                    thuật ngữ khoa học giáo dục chuẩn mực.
                  </p>

                  {/* Bảng ký hiệu minh họa gọn gàng */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-2.5 text-center font-mono text-xs text-[#29383D]">
                    <span className="rounded-lg bg-[#F7FAFA] py-1">G / ker φ</span>
                    <span className="rounded-lg bg-[#F7FAFA] py-1">∀ε &gt; 0, ∃δ</span>
                    <span className="rounded-lg bg-[#F7FAFA] py-1">CLO1–9</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-[#CFDADB] pt-4">
                  <Link
                    to="/glossary"
                    aria-label="Mở Ngân hàng Thuật ngữ & Ký hiệu Toán"
                    className="inline-flex w-full items-center justify-between rounded-xl border border-[#CFDADB] bg-[#E1E9EA]/70 px-4 py-2.5 text-xs font-semibold text-[#29383D] transition-colors hover:bg-[#3F6570] hover:text-white"
                  >
                    <span>Mở Ngân hàng Thuật ngữ &amp; Ký hiệu Toán</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Tiện ích 2: Phòng Lab Hình học 3D */}
              <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs transition-colors hover:border-[#3F6570]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#E1E9EA] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#5E786D]">
                      UTILITY 02 · SPATIAL LAB
                    </span>
                    <Compass className="h-4 w-4 text-[#5E786D]" aria-hidden="true" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#29383D]">
                    Phòng Lab Hình học 3D
                  </h3>

                  <p className="text-xs leading-relaxed text-[#55676B]">
                    Cửa sổ mô phỏng trực quan không gian Affine, phép biến đổi đẳng cự và hình học
                    phối cảnh đa chiều.
                  </p>

                  {/* Cửa sổ preview trực quan dẫn vào không gian mô phỏng */}
                  <div className="overflow-hidden rounded-xl border border-[#CFDADB] bg-[#EAF0F1] p-2">
                    <svg viewBox="0 0 280 76" className="h-16 w-full" aria-hidden="true">
                      <line x1="16" y1="62" x2="264" y2="62" stroke="#CFDADB" strokeWidth="1" />
                      <polygon
                        points="76,54 132,14 204,24 148,64"
                        fill="#F7FAFA"
                        stroke="#3F6570"
                        strokeWidth="1.3"
                      />
                      <polygon
                        points="108,18 184,12 196,58 120,64"
                        fill="#E1E9EA"
                        fillOpacity="0.65"
                        stroke="#5E786D"
                        strokeWidth="1.2"
                      />
                      <circle cx="140" cy="38" r="3.5" fill="#92714F" />
                      <text x="14" y="20" fill="#55676B" fontSize="8.5" fontFamily="monospace">
                        3D AFFINE VIEWPORT
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="mt-5 border-t border-[#CFDADB] pt-4">
                  <a
                    href="/interactive/affine-geometry.html"
                    aria-label="Mở Phòng Lab Hình học Không gian"
                    className="inline-flex w-full items-center justify-between rounded-xl border border-[#CFDADB] bg-[#E1E9EA]/70 px-4 py-2.5 text-xs font-semibold text-[#29383D] transition-colors hover:bg-[#3F6570] hover:text-white"
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
    </div>
  );
}

export default HomePage;
