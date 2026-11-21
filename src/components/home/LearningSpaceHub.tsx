import type { ManifestChapter, ManifestLesson, ManifestSubject } from '@schemas/index';
import { ArrowRight, CheckCircle2, ChevronDown, Compass, Play, Sparkles } from 'lucide-react';
import { type CSSProperties, type MouseEvent, useState } from 'react';
import { Link } from 'react-router';
import { getLessonById, getSubjects, getSubjectStats } from '@/content-runtime';
import { type AcademicBranch, getCourseCinematicAsset } from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { searchContent } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { ProgressRing } from '@/shared/ui';
import { CurriculumRadarCard, type RadarSubjectStat } from '@/components/home/CurriculumRadarCard';
import { KnowledgeConstellationCard } from '@/components/home/KnowledgeConstellationCard';
import { SubjectStageCanvas } from '@/components/home/SubjectStageCanvas';
import { SlidingTabBar, SpecimenFxBars } from '@/components/fx';
import { ArchivalIndexView } from '@/pages/home/ArchivalIndexView';
import {
  getInitialHomepageViewMode,
  type HomepageViewMode,
  saveHomepageViewMode,
  ViewModeToggle,
} from '@/pages/home/ViewModeToggle';

type HubBranchFilter = 'all' | AcademicBranch;

interface AtlasCardPalette {
  readonly subjectRgb: string;
  readonly topBarGradient: string;
  readonly cardBorder: string;
  readonly indexText: string;
  readonly badgeClass: string;
  readonly titleHover: string;
  readonly ctaClass: string;
  readonly secondaryBtnClass: string;
  readonly chapterPillClass: string;
  readonly progressBarColor: string;
  readonly progressBadgeClass: string;
}

const SUBJECT_SHORT_CODES: Record<string, string> = {
  'cau-truc-dai-so': 'CTĐS',
  'hinh-hoc-affine': 'HHAVE',
  'giai-tich-ham-mot-bien': 'GTHMB',
  'giao-duc-hoc': 'GDH',
};

const DEFAULT_ATLAS_PALETTE: AtlasCardPalette = {
  subjectRgb: '140, 88, 40',
  topBarGradient: 'linear-gradient(90deg, transparent 0%, #8C5828 50%, transparent 100%)',
  cardBorder: 'border-[var(--border-hairline)] hover:border-[#8C5828] dark:hover:border-[#D99B5E]',
  indexText: 'text-[#8C5828] dark:text-[#D99B5E]',
  badgeClass:
    'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
  titleHover: 'hover:text-[#8C5828] dark:hover:text-[#D99B5E]',
  ctaClass:
    'bg-[#8C5828] text-white hover:bg-[#73471F] dark:bg-[#D99B5E] dark:text-[#121716] dark:hover:bg-[#E5AF78]',
  secondaryBtnClass:
    'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] hover:border-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
  chapterPillClass:
    'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[#8C5828] hover:text-[#8C5828] dark:hover:border-[#D99B5E] dark:hover:text-[#D99B5E]',
  progressBarColor: '#8C5828',
  progressBadgeClass:
    'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
};

const ATLAS_CARD_PALETTES: Record<string, AtlasCardPalette> = {
  'cau-truc-dai-so': DEFAULT_ATLAS_PALETTE,
  'hinh-hoc-affine': {
    subjectRgb: '29, 79, 110',
    topBarGradient: 'linear-gradient(90deg, transparent 0%, #1D4F6E 50%, transparent 100%)',
    cardBorder:
      'border-[var(--border-hairline)] hover:border-[#1D4F6E] dark:hover:border-[#64A8D1]',
    indexText: 'text-[#1D4F6E] dark:text-[#64A8D1]',
    badgeClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    titleHover: 'hover:text-[#1D4F6E] dark:hover:text-[#64A8D1]',
    ctaClass:
      'bg-[#1D4F6E] text-white hover:bg-[#163E57] dark:bg-[#64A8D1] dark:text-[#121716] dark:hover:bg-[#7BB7DB]',
    secondaryBtnClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] hover:border-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    chapterPillClass:
      'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[#1D4F6E] hover:text-[#1D4F6E] dark:hover:border-[#64A8D1] dark:hover:text-[#64A8D1]',
    progressBarColor: '#1D4F6E',
    progressBadgeClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
  },
  'giai-tich-ham-mot-bien': {
    subjectRgb: '27, 94, 74',
    topBarGradient: 'linear-gradient(90deg, transparent 0%, #1B5E4A 50%, transparent 100%)',
    cardBorder:
      'border-[var(--border-hairline)] hover:border-[#1B5E4A] dark:hover:border-[#52B394]',
    indexText: 'text-[#1B5E4A] dark:text-[#52B394]',
    badgeClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    titleHover: 'hover:text-[#1B5E4A] dark:hover:text-[#52B394]',
    ctaClass:
      'bg-[#1B5E4A] text-white hover:bg-[#144A3A] dark:bg-[#52B394] dark:text-[#121716] dark:hover:bg-[#6AC2A5]',
    secondaryBtnClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] hover:border-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    chapterPillClass:
      'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[#1B5E4A] hover:text-[#1B5E4A] dark:hover:border-[#52B394] dark:hover:text-[#52B394]',
    progressBarColor: '#1B5E4A',
    progressBadgeClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
  },
  'giao-duc-hoc': {
    subjectRgb: '143, 61, 53',
    topBarGradient: 'linear-gradient(90deg, transparent 0%, #8F3D35 50%, transparent 100%)',
    cardBorder:
      'border-[var(--border-hairline)] hover:border-[#8F3D35] dark:hover:border-[#DF7B70]',
    indexText: 'text-[#8F3D35] dark:text-[#DF7B70]',
    badgeClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    titleHover: 'hover:text-[#8F3D35] dark:hover:text-[#DF7B70]',
    ctaClass:
      'bg-[#8F3D35] text-white hover:bg-[#753029] dark:bg-[#DF7B70] dark:text-[#121716] dark:hover:bg-[#E99288]',
    secondaryBtnClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] hover:border-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    chapterPillClass:
      'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[#8F3D35] hover:text-[#8F3D35] dark:hover:border-[#DF7B70] dark:hover:text-[#DF7B70]',
    progressBarColor: '#8F3D35',
    progressBadgeClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
  },
};

/**
 * Chữ ký chìm nhận diện môn học (Watermark Signature) ở góc dưới bên phải mỗi thẻ môn học
 * tại chế độ Bản đồ Không gian (Atlas Mode).
 */
export function SubjectWatermarkSignature({ slug }: { readonly slug: string }) {
  if (slug === 'cau-truc-dai-so') {
    return (
      <svg
        data-testid={`subject-watermark-${slug}`}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 text-[var(--text-main)] opacity-[0.045] select-none dark:opacity-[0.075]"
      >
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          <rect x="20" y="20" width="90" height="90" rx="6" />
          <line x1="50" y1="20" x2="50" y2="110" />
          <line x1="80" y1="20" x2="80" y2="110" />
          <line x1="20" y1="50" x2="110" y2="50" />
          <line x1="20" y1="80" x2="110" y2="80" />
          <circle cx="126" cy="126" r="22" />
          <path d="M 96 126 L 150 126" />
        </g>
        <text x="24" y="148" fill="currentColor" fontSize="22" fontFamily="serif" fontWeight="bold">
          G / ker φ ≅ Im φ
        </text>
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    return (
      <svg
        data-testid={`subject-watermark-${slug}`}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 text-[var(--text-main)] opacity-[0.045] select-none dark:opacity-[0.075]"
      >
        <g stroke="currentColor" strokeWidth="3" fill="none">
          <line x1="75" y1="95" x2="75" y2="15" />
          <line x1="75" y1="95" x2="148" y2="120" />
          <line x1="75" y1="95" x2="18" y2="138" />
          <polygon points="75,35 130,114 35,126" strokeWidth="2" />
          <circle cx="75" cy="95" r="5" fill="currentColor" />
        </g>
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    return (
      <svg
        data-testid={`subject-watermark-${slug}`}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 text-[var(--text-main)] opacity-[0.045] select-none dark:opacity-[0.075]"
      >
        <path
          d="M 55 138 C 68 138, 72 115, 76 80 C 80 45, 84 22, 98 22"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 15 120 C 45 115, 65 45, 95 60 C 120 72, 135 35, 152 28"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      data-testid={`subject-watermark-${slug}`}
      viewBox="0 0 160 160"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 bottom-4 h-36 w-36 text-[var(--text-main)] opacity-[0.045] select-none dark:opacity-[0.075]"
    >
      <g stroke="currentColor" strokeWidth="3" fill="none">
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
export function SubjectSpatialArtwork({
  slug,
  branch,
}: {
  readonly slug: string;
  readonly branch: AcademicBranch;
}) {
  const strokeMain = branch === 'pedagogy' ? '#365E4E' : '#B85D6F';
  const strokeAccent = '#C89738';

  if (slug === 'cau-truc-dai-so') {
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

        <path
          d="M 205 112 Q 236 96 266 112"
          fill="none"
          stroke={strokeAccent}
          strokeWidth="1.3"
          strokeDasharray="4 3"
        />

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
    return (
      <svg
        viewBox="0 0 520 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <g stroke="#C89738" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 3" fill="none">
          <line x1="56" y1="122" x2="274" y2="54" />
          <line x1="56" y1="122" x2="288" y2="122" />
          <line x1="56" y1="122" x2="262" y2="190" />
        </g>

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
    return (
      <svg
        viewBox="0 0 520 240"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <line x1="42" y1="186" x2="478" y2="186" stroke="#58635E" strokeWidth="1.15" />
        <line x1="88" y1="30" x2="88" y2="210" stroke="#58635E" strokeWidth="1.15" />

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

  return (
    <svg
      viewBox="0 0 520 240"
      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
      aria-hidden="true"
    >
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

      <line
        x1="220"
        y1="124"
        x2="268"
        y2="124"
        stroke={strokeAccent}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

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

export interface LearningSpaceHubProps {
  readonly hubQuery: string;
  readonly onResetQuery: () => void;
}

interface NextQueueItem {
  readonly lesson: ManifestLesson;
  readonly chapter: ManifestChapter;
  readonly subjectSlug: string;
}

function findSubjectResumeTarget(
  subject: ManifestSubject,
  completedLessons: Readonly<Record<string, string | boolean>>,
  lastVisitedLessonId?: string,
): { chapter: ManifestChapter; lesson: ManifestLesson } | undefined {
  if (lastVisitedLessonId) {
    for (const ch of subject.chapters) {
      const found = ch.lessons.find((l) => l.id === lastVisitedLessonId);
      if (found) return { chapter: ch, lesson: found };
    }
  }
  for (const ch of subject.chapters) {
    const firstPending = ch.lessons.find((l) => !completedLessons[l.id]);
    if (firstPending) return { chapter: ch, lesson: firstPending };
  }
  const firstChapter = subject.chapters[0];
  const firstLesson = firstChapter?.lessons[0];
  return firstChapter && firstLesson ? { chapter: firstChapter, lesson: firstLesson } : undefined;
}

export function LearningSpaceHub({ hubQuery, onResetQuery }: LearningSpaceHubProps) {
  const subjects = getSubjects();
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const lastVisitedBySubject = useLearningStore((state) => state.lastVisitedBySubject);

  const [activeBranch, setActiveBranch] = useState<HubBranchFilter>('all');
  const [viewMode, setViewMode] = useState<HomepageViewMode>(() => getInitialHomepageViewMode());
  const [hoveredCardSlug, setHoveredCardSlug] = useState<string | null>(null);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Record<string, boolean>>({});

  const handleCardMouseLeave = (slug: string) => {
    setHoveredCardSlug((prev) => (prev === slug ? null : prev));
  };

  const handleViewModeChange = (nextMode: HomepageViewMode) => {
    setViewMode(nextMode);
    saveHomepageViewMode(nextMode);
  };

  const hasSearchQuery = hubQuery.trim().length > 0;
  const instantSearchResults = hasSearchQuery ? searchContent(hubQuery) : [];

  const activeRecentLesson =
    (lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined) ??
    getLessonById('gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien') ??
    getLessonById('lop-ke-phan-hoach-va-chi-so-cua-nhom-con') ??
    getLessonById('dinh-nghia-nhom');

  const totalLessonCount = subjects.reduce((sum, sub) => sum + getSubjectStats(sub).lessonCount, 0);
  const completedCount = Object.keys(completedLessons).length;
  const computedPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;
  const displayOrbitPercent = completedCount > 0 ? Math.max(computedPercent, 1) : 8;

  const subjectProgressMatrix = subjects.map((sub) => {
    const stats = getSubjectStats(sub);
    let done = 0;
    for (const ch of sub.chapters) {
      for (const ls of ch.lessons) {
        if (completedLessons[ls.id]) done += 1;
      }
    }
    const percent = stats.lessonCount > 0 ? Math.round((done / stats.lessonCount) * 100) : 0;
    const palette = ATLAS_CARD_PALETTES[sub.slug] ?? DEFAULT_ATLAS_PALETTE;
    const resume = findSubjectResumeTarget(
      sub,
      completedLessons,
      lastVisitedBySubject[sub.id]?.lessonId,
    );
    const currentChapter = resume?.chapter ?? sub.chapters[0];
    return {
      subject: sub,
      shortCode: SUBJECT_SHORT_CODES[sub.slug] ?? sub.shortTitle.toUpperCase(),
      done,
      total: stats.lessonCount,
      percent,
      palette,
      currentChapter,
    };
  });

  const radarSubjectStats: readonly RadarSubjectStat[] = subjectProgressMatrix.map((entry) => {
    const asset = getCourseCinematicAsset(entry.subject.slug);
    const stats = getSubjectStats(entry.subject);
    return {
      slug: entry.subject.slug,
      shortCode: entry.shortCode,
      title: entry.subject.title,
      chapters: stats.chapterCount,
      lessons: entry.total,
      completed: entry.done,
      percent: entry.percent,
      branch: asset.branch,
    };
  });

  const upNextQueue: readonly NextQueueItem[] = (() => {
    if (!activeRecentLesson) return [];
    const queue: NextQueueItem[] = [];
    const flat: NextQueueItem[] = [];
    for (const ch of activeRecentLesson.subject.chapters) {
      for (const ls of ch.lessons) {
        flat.push({
          lesson: ls,
          chapter: ch,
          subjectSlug: activeRecentLesson.subject.slug,
        });
      }
    }
    const curIndex = flat.findIndex((entry) => entry.lesson.id === activeRecentLesson.lesson.id);
    if (curIndex >= 0) {
      for (let i = curIndex + 1; i < flat.length && queue.length < 3; i += 1) {
        const item = flat[i];
        if (item) queue.push(item);
      }
    }
    return queue;
  })();

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
    <>
      <section
        id="khong-gian-mon-hoc"
        aria-label="Không gian Học phần"
        className="relative z-20 scroll-mt-16 space-y-6 pb-8"
      >
        <div>
          <div className="space-y-6">
            {/* Header + Toolbar lọc phân nhánh Swiss Editorial */}
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-hairline)] pb-5 md:flex-row md:items-end">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Hệ thống Học phần</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[var(--text-main)]">
                  Không gian Học phần
                </h2>
                <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
                  Mỗi học phần là một kiến trúc tư duy độc lập với hệ màu nhận diện và lộ trình
                  riêng.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
                <SlidingTabBar
                  ariaLabel="Phân nhánh học thuật"
                  activeId={activeBranch}
                  onChange={(id) => setActiveBranch(id as HubBranchFilter)}
                  tabs={[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'math', label: 'Toán học' },
                    { id: 'pedagogy', label: 'Khoa học Giáo dục' },
                  ]}
                />
              </div>
            </div>

            {viewMode === 'archival' ? (
              <ArchivalIndexView
                subjects={subjects}
                activeBranch={activeBranch}
                externalQuery={hubQuery}
              />
            ) : (
              <>
                {filteredSubjects.length === 0 ? (
                  <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
                    <p className="font-serif text-lg font-semibold text-[var(--text-main)]">
                      Không tìm thấy học phần phù hợp với bộ lọc hiện tại.
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Hãy thử xóa từ khóa tìm kiếm hoặc chuyển sang phân nhánh &ldquo;Tất cả&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBranch('all');
                        onResetQuery();
                      }}
                      className="mt-4 cursor-pointer rounded-xl bg-[#1E332E] px-5 py-2.5 text-xs font-medium text-[#FAFBF9] transition-colors hover:bg-[#182624]"
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
                      const palette = ATLAS_CARD_PALETTES[subject.slug] ?? DEFAULT_ATLAS_PALETTE;
                      const isLonelyTailCard =
                        filteredSubjects.length % 2 === 1 && idx === filteredSubjects.length - 1;
                      const galleryIndex = String(idx + 1).padStart(2, '0');

                      let subjectCompletedCount = 0;
                      for (const ch of subject.chapters) {
                        for (const ls of ch.lessons) {
                          if (completedLessons[ls.id]) subjectCompletedCount += 1;
                        }
                      }
                      const subjectPercent =
                        stats.lessonCount > 0
                          ? Math.round((subjectCompletedCount / stats.lessonCount) * 100)
                          : 0;
                      const resumeTarget = findSubjectResumeTarget(
                        subject,
                        completedLessons,
                        lastVisitedBySubject[subject.id]?.lessonId,
                      );
                      const highlightedChapters = subject.chapters.slice(0, 3);
                      const isRoadmapOpen = Boolean(expandedRoadmaps[subject.slug]);

                      return (
                        <FadeIn
                          key={subject.id}
                          delay={idx * 0.06}
                          className={isLonelyTailCard ? 'md:col-span-2' : undefined}
                        >
                          <article
                            id={`atlas-subject-${subject.slug}`}
                            onMouseMove={(event: MouseEvent<HTMLElement>) => {
                              const rect = event.currentTarget.getBoundingClientRect();
                              event.currentTarget.style.setProperty(
                                '--spot-x',
                                `${Math.round(event.clientX - rect.left)}px`,
                              );
                              event.currentTarget.style.setProperty(
                                '--spot-y',
                                `${Math.round(event.clientY - rect.top)}px`,
                              );
                            }}
                            onMouseEnter={() => setHoveredCardSlug(subject.slug)}
                            onMouseLeave={() => handleCardMouseLeave(subject.slug)}
                            style={
                              {
                                viewTransitionName: `subject-card-${subject.slug}`,
                                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                '--subject-rgb': palette.subjectRgb,
                                '--spot-glow': `rgba(${palette.subjectRgb}, 0.12)`,
                                '--spot-glow-dark': `rgba(${palette.subjectRgb}, 0.24)`,
                              } as CSSProperties & { '--subject-rgb': string }
                            }
                            className={cn(
                              'lu-bento-interactive group relative flex h-full scroll-mt-16 flex-col justify-between overflow-hidden rounded-xl border bg-[var(--bg-surface)] p-6 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[var(--bg-workspace)] hover:shadow-[var(--shadow-bento-hover)]',
                              palette.cardBorder,
                            )}
                          >
                            {/* Dải sáng mảnh chạy dọc mép trên của thẻ khi hover */}
                            <div
                              aria-hidden="true"
                              style={{ background: palette.topBarGradient }}
                              className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            />

                            <SubjectWatermarkSignature slug={subject.slug} />

                            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-0.5 font-mono text-[11px] font-semibold',
                                    palette.indexText,
                                  )}
                                >
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: palette.progressBarColor }}
                                    aria-hidden="true"
                                  />
                                  <span>{SUBJECT_SHORT_CODES[subject.slug] ?? galleryIndex}</span>
                                </span>
                                <span
                                  className={cn(
                                    'rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider transition-colors duration-200',
                                    palette.badgeClass,
                                  )}
                                >
                                  {asset.categoryLabel}
                                </span>
                              </div>

                              {/* Thanh mật độ chương & huy hiệu tiến độ gọn gàng */}
                              <div className="flex flex-wrap items-center justify-end gap-2.5">
                                <SpecimenFxBars
                                  isCardHovered={hoveredCardSlug === subject.slug}
                                  chapters={subject.chapters.map((ch) => ({
                                    id: ch.id,
                                    title: `Chương ${ch.number}: ${ch.title}`,
                                    totalLessons: ch.lessons.length,
                                    completedLessons: ch.lessons.filter(
                                      (ls) => completedLessons[ls.id],
                                    ).length,
                                  }))}
                                  accentHex={palette.progressBarColor}
                                />
                                <span
                                  data-testid={`subject-progress-badge-${subject.slug}`}
                                  className={cn(
                                    'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums',
                                    palette.progressBadgeClass,
                                  )}
                                >
                                  {subjectCompletedCount}/{stats.lessonCount} bài · {subjectPercent}
                                  %
                                </span>
                              </div>
                            </div>

                            <div
                              style={{
                                background: `radial-gradient(circle at 50% 50%, rgba(${palette.subjectRgb}, 0.08) 0%, transparent 78%)`,
                              }}
                              className="relative z-10 overflow-hidden rounded-xl"
                            >
                              <SubjectStageCanvas
                                slug={subject.slug}
                                isCardHovered={hoveredCardSlug === subject.slug}
                              />
                            </div>

                            <div className="relative z-10 space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-main)]">
                                  <Link
                                    to={ROUTES.subjectOverview(subject.slug)}
                                    className={cn('transition-colors', palette.titleHover)}
                                  >
                                    {subject.title}
                                  </Link>
                                </h3>
                                <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                                  {asset.conciseDescription}
                                </p>
                              </div>

                              {/* Bảng chỉ mục chương học */}
                              <div
                                data-testid={`almanac-chapter-index-${subject.slug}`}
                                className="space-y-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-1.5">
                                  <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                                    Lộ trình chương học
                                  </span>
                                  <button
                                    type="button"
                                    aria-expanded={isRoadmapOpen}
                                    data-testid={`roadmap-toggle-${subject.slug}`}
                                    onClick={() =>
                                      setExpandedRoadmaps((prev) => ({
                                        ...prev,
                                        [subject.slug]: !prev[subject.slug],
                                      }))
                                    }
                                    className={cn(
                                      'inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 font-mono text-[10.5px] font-semibold transition-colors hover:bg-[var(--bg-surface)]',
                                      palette.indexText,
                                    )}
                                  >
                                    <span>
                                      {isRoadmapOpen ? 'Thu gọn lộ trình' : 'Xem nhanh lộ trình'}
                                    </span>
                                    <ChevronDown
                                      className={cn(
                                        'h-3 w-3 transition-transform duration-200',
                                        isRoadmapOpen && 'rotate-180',
                                      )}
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>

                                <div className="divide-y divide-[var(--border-hairline)]">
                                  {highlightedChapters.map((chapter) => {
                                    const chDone = chapter.lessons.filter(
                                      (l) => completedLessons[l.id],
                                    ).length;
                                    return (
                                      <Link
                                        key={chapter.id}
                                        to={`${ROUTES.subjectOverview(subject.slug)}?chapter=${chapter.slug}`}
                                        title={`Mở Chương ${chapter.number}: ${chapter.title}`}
                                        className="group/row flex items-baseline gap-2 py-1.5 text-xs transition-colors hover:bg-[var(--bg-surface)]"
                                      >
                                        <span
                                          className={cn(
                                            'lu-tabular-telemetry shrink-0 font-mono text-[10px] font-bold',
                                            palette.indexText,
                                          )}
                                        >
                                          Ch.{String(chapter.number).padStart(2, '0')}
                                        </span>
                                        <span className="max-w-[58%] truncate font-medium text-[var(--text-main)] group-hover/row:underline">
                                          {chapter.title}
                                        </span>
                                        <span
                                          aria-hidden="true"
                                          className="mx-1 min-w-[16px] flex-1 border-b border-dotted border-[var(--border-strong)]"
                                        />
                                        <span className="lu-tabular-telemetry shrink-0 font-mono text-[10.5px] font-medium text-[var(--text-muted)]">
                                          {chDone > 0 ? `${chDone}/` : ''}
                                          {String(chapter.lessons.length).padStart(2, '0')} bài
                                        </span>
                                      </Link>
                                    );
                                  })}
                                </div>

                                {subject.chapters.length > highlightedChapters.length &&
                                  !isRoadmapOpen && (
                                    <div className="pt-0.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedRoadmaps((prev) => ({
                                            ...prev,
                                            [subject.slug]: true,
                                          }))
                                        }
                                        className="inline-flex cursor-pointer items-center rounded border border-dashed border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--text-main)] hover:text-[var(--text-main)]"
                                      >
                                        + Mở đầy đủ {subject.chapters.length} chương
                                      </button>
                                    </div>
                                  )}

                                {isRoadmapOpen && (
                                  <div
                                    data-testid={`roadmap-drawer-${subject.slug}`}
                                    className="mt-1 max-h-48 divide-y divide-[var(--border-hairline)] overflow-y-auto border-t border-[var(--border-hairline)] pt-1.5 pr-1"
                                  >
                                    {subject.chapters.map((chapter) => {
                                      const chDone = chapter.lessons.filter(
                                        (l) => completedLessons[l.id],
                                      ).length;
                                      return (
                                        <Link
                                          key={chapter.id}
                                          to={`${ROUTES.subjectOverview(subject.slug)}?chapter=${chapter.slug}`}
                                          className="flex items-baseline gap-2 py-1.5 text-xs transition-colors hover:bg-[var(--bg-surface)]"
                                        >
                                          <span
                                            className={cn(
                                              'lu-tabular-telemetry shrink-0 font-mono text-[10px] font-bold',
                                              palette.indexText,
                                            )}
                                          >
                                            Ch.{String(chapter.number).padStart(2, '0')}
                                          </span>
                                          <span className="max-w-[58%] truncate font-medium text-[var(--text-main)]">
                                            {chapter.title}
                                          </span>
                                          <span
                                            aria-hidden="true"
                                            className="mx-1 min-w-[16px] flex-1 border-b border-dotted border-[var(--border-strong)]"
                                          />
                                          <span className="lu-tabular-telemetry shrink-0 font-mono text-[10.5px] text-[var(--text-muted)]">
                                            {chDone}/{chapter.lessons.length} bài
                                          </span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Chân thẻ: Huy hiệu Tiến độ gọn gàng + Cụm nút Học tiếp & Vào học phần */}
                              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border-hairline)] pt-4">
                                <span
                                  data-testid={`subject-footer-progress-${subject.slug}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-[var(--text-main)]"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: palette.progressBarColor }}
                                  />
                                  <span>
                                    Tiến độ: {subjectPercent}% ({subjectCompletedCount}/
                                    {stats.lessonCount} bài)
                                  </span>
                                </span>

                                <div className="ml-auto flex flex-wrap items-center gap-2">
                                  {resumeTarget && (
                                    <Link
                                      to={ROUTES.lesson(
                                        subject.slug,
                                        resumeTarget.chapter.slug,
                                        resumeTarget.lesson.slug,
                                      )}
                                      title={`Mở ngay: ${resumeTarget.lesson.title}`}
                                      className={cn(
                                        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.98]',
                                        palette.secondaryBtnClass,
                                      )}
                                    >
                                      <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                                      <span>Học tiếp</span>
                                    </Link>
                                  )}

                                  <Link
                                    to={ROUTES.courseOverview(subject.slug)}
                                    aria-label={`Vào học phần ${subject.title}`}
                                    className={cn(
                                      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs transition-all duration-200 active:scale-[0.98]',
                                      palette.ctaClass,
                                    )}
                                  >
                                    <span>Vào học phần</span>
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Link>
                                </div>
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
        </div>
      </section>

      {viewMode === 'atlas' && (
        <section
          id="quy-dao-hoc-tap"
          aria-label="Không gian Tiếp tục học tập"
          className="relative z-20 scroll-mt-16 border-t border-[var(--border-hairline)] pt-8 pb-6"
        >
          <div>
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    <Sparkles
                      className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                      aria-hidden="true"
                    />
                    <span>Quỹ đạo học tập &amp; Phân tích năng lực</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-main)]">
                    Tiếp tục học tập
                  </h2>
                </div>
                <p className="font-mono text-xs text-[var(--text-muted)]">
                  Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt của bạn.
                </p>
              </div>

              {/* Lưới Bento 2 Cột cân xứng Swiss Editorial */}
              <div
                data-testid="learning-bento-grid"
                className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12"
              >
                {/* Cột Trái (7 cột): Bài đang đọc dở + Tiến độ 4 học phần */}
                <div className="flex flex-col gap-6 lg:col-span-7">
                  <div
                    role="region"
                    aria-label="Tiếp tục học dở"
                    className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6"
                  >
                    {activeRecentLesson ? (
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="rounded-lg bg-[#E7ECEA] px-3 py-1 font-mono text-xs font-semibold text-[#1E332E] dark:bg-[#19332A] dark:text-[#A6E3CD]">
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
                            <ProgressRing value={displayOrbitPercent} size={42} strokeWidth={4} />
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

                        <div className="space-y-2.5">
                          <p className="font-mono text-xs tracking-wider text-[#C89738] uppercase">
                            BÀI HỌC ĐANG ĐỌC DỞ
                          </p>
                          <h3 className="font-serif text-2xl leading-snug font-bold text-[var(--text-main)] sm:text-[1.7rem]">
                            {activeRecentLesson.lesson.title.startsWith('Bài')
                              ? activeRecentLesson.lesson.title
                              : `Bài ${activeRecentLesson.chapter.number}.${activeRecentLesson.lesson.number}: ${activeRecentLesson.lesson.title}`}
                          </h3>
                          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                            {activeRecentLesson.lesson.description}
                          </p>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/70 p-3.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[var(--text-main)]">
                              Trạng thái đọc bài &amp; ghi chú học thuật
                            </span>
                            <span className="font-mono font-semibold text-[#1E332E] dark:text-[#8EE5CE]">
                              {displayOrbitPercent}% hoàn thành
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                            <div
                              className="h-full rounded-full bg-[#1E332E] transition-all duration-500 dark:bg-[#499C7E]"
                              style={{ width: `${Math.max(displayOrbitPercent, 6)}%` }}
                            />
                          </div>
                        </div>

                        {upNextQueue.length > 0 && (
                          <div className="space-y-2" data-testid="up-next-queue">
                            <p className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                              Lộ trình bài kế tiếp ({upNextQueue.length} bài)
                            </p>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                              {upNextQueue.map((item) => {
                                const isDone = Boolean(completedLessons[item.lesson.id]);
                                return (
                                  <Link
                                    key={item.lesson.id}
                                    to={ROUTES.lesson(
                                      item.subjectSlug,
                                      item.chapter.slug,
                                      item.lesson.slug,
                                    )}
                                    className="group/next flex flex-col justify-between gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent-os)]/50 hover:shadow-xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-[10.5px] font-bold text-[var(--accent-os)]">
                                        Bài {item.chapter.number}.{item.lesson.number}
                                      </span>
                                      {isDone ? (
                                        <CheckCircle2
                                          className="h-3.5 w-3.5 text-[var(--accent-os)]"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                                          {item.lesson.estimatedMinutes} phút
                                        </span>
                                      )}
                                    </div>
                                    <p className="line-clamp-2 text-xs leading-snug font-semibold text-[var(--text-main)] group-hover/next:text-[var(--accent-os)]">
                                      {item.lesson.title}
                                    </p>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-hairline)] pt-4">
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
                            className="group/read inline-flex items-center gap-2 rounded-lg bg-[var(--accent-os)] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[var(--accent-primary-hover)] active:scale-[0.98]"
                          >
                            <span>Tiếp tục đọc ngay</span>
                            <ArrowRight
                              className="h-4 w-4 transition-transform duration-150 group-hover/read:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Ma Trận Tiến Độ & Phân Bố 4 Học Phần */}
                  <div
                    role="region"
                    aria-label="Ma Trận Tiến Độ 4 Học Phần"
                    data-testid="progress-matrix-4-subjects"
                    className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3.5">
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
                          Tổng quan phân bố
                        </p>
                        <h3 className="font-serif text-lg font-bold text-[var(--text-main)] sm:text-xl">
                          Ma Trận Tiến Độ &amp; Phân Bố 4 Học Phần
                        </h3>
                      </div>
                      <span className="rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--text-main)] tabular-nums">
                        {completedCount}/{totalLessonCount} bài toàn hệ
                      </span>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {subjectProgressMatrix.map((entry) => {
                        const ch = entry.currentChapter;
                        const chapterHref = ch
                          ? `${ROUTES.subjectOverview(entry.subject.slug)}?chapter=${ch.slug}`
                          : ROUTES.subjectOverview(entry.subject.slug);
                        return (
                          <div
                            key={entry.subject.id}
                            className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 transition-colors hover:border-[var(--border-strong)]"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  to={ROUTES.subjectOverview(entry.subject.slug)}
                                  className={cn(
                                    'font-serif text-sm leading-snug font-bold text-[var(--text-main)] transition-colors',
                                    entry.palette.titleHover,
                                  )}
                                >
                                  {entry.subject.title}
                                </Link>
                                <span
                                  className={cn(
                                    'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-bold tabular-nums',
                                    entry.palette.progressBadgeClass,
                                  )}
                                >
                                  {entry.percent}%
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.max(entry.percent, entry.done > 0 ? 8 : 0)}%`,
                                      backgroundColor: entry.palette.progressBarColor,
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between font-mono text-[10.5px] text-[var(--text-muted)]">
                                  <span>
                                    {entry.done}/{entry.total} bài
                                  </span>
                                  <span className={entry.palette.indexText}>{entry.shortCode}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-2.5">
                              <span className="line-clamp-1 text-[11px] font-medium text-[var(--text-muted)]">
                                {ch ? `Chương ${ch.number}: ${ch.title}` : 'Sẵn sàng khởi đầu'}
                              </span>
                              <Link
                                to={chapterHref}
                                className={cn(
                                  'inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[10.5px] font-semibold transition-colors',
                                  entry.palette.secondaryBtnClass,
                                )}
                              >
                                <span>Mở chương</span>
                                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Cột Phải (5 cột): 2 Thẻ Bento xếp chồng tương ứng chiều cao */}
                <div className="flex flex-col gap-6 lg:col-span-5">
                  {/* Hàng Trên Phải: Biểu đồ Radar Cấu trúc & Phân tích Năng lực Học phần */}
                  <CurriculumRadarCard
                    stats={radarSubjectStats}
                    totalCompleted={completedCount}
                    totalLessons={totalLessonCount}
                  />

                  {/* Hàng Dưới Phải: Mạng lưới Liên kết Tri thức Liên môn 120fps */}
                  <div className="flex flex-1 flex-col [&>*]:flex-1">
                    <KnowledgeConstellationCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
