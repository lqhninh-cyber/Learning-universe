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
import { GoldenCompassSpineBridge } from '@/components/home/HomeScrollTransitions';
import { KnowledgeConstellationCard } from '@/components/home/KnowledgeConstellationCard';
import { SubjectStageCanvas } from '@/components/home/SubjectStageCanvas';
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
  subjectRgb: '156, 122, 76',
  topBarGradient: 'linear-gradient(90deg, transparent 0%, #9C7A4C 50%, transparent 100%)',
  cardBorder: 'border-[#D8E0DD] hover:border-[#9C7A4C]',
  indexText: 'text-[#6B5335]',
  badgeClass: 'border-[#D8D0C0] bg-[#F3F0E8] text-[#6B5335]',
  titleHover: 'hover:text-[#6B5335]',
  ctaClass: 'bg-[#6B5335] text-[#FAFBF9] hover:bg-[#57432B]',
  secondaryBtnClass:
    'border-[#D8D0C0] bg-[#F3F0E8]/70 text-[#6B5335] hover:border-[#6B5335] hover:bg-[#F3F0E8]',
  chapterPillClass:
    'border-[#D8D0C0] bg-[#FAFBF9] text-[#4A5D58] hover:border-[#6B5335] hover:bg-[#F3F0E8] hover:text-[#6B5335]',
  progressBarColor: '#6B5335',
  progressBadgeClass: 'border-[#D8D0C0] bg-[#F3F0E8]/80 text-[#6B5335]',
};

const ATLAS_CARD_PALETTES: Record<string, AtlasCardPalette> = {
  'cau-truc-dai-so': DEFAULT_ATLAS_PALETTE,
  'hinh-hoc-affine': {
    subjectRgb: '45, 82, 102',
    topBarGradient: 'linear-gradient(90deg, transparent 0%, #2D5266 50%, transparent 100%)',
    cardBorder: 'border-[#D8E0DD] hover:border-[#2D5266]',
    indexText: 'text-[#2D5266]',
    badgeClass: 'border-[#C9D7DF] bg-[#ECF1F4] text-[#2D5266]',
    titleHover: 'hover:text-[#2D5266]',
    ctaClass: 'bg-[#2D5266] text-[#FAFBF9] hover:bg-[#224050]',
    secondaryBtnClass:
      'border-[#C9D7DF] bg-[#ECF1F4]/70 text-[#2D5266] hover:border-[#2D5266] hover:bg-[#ECF1F4]',
    chapterPillClass:
      'border-[#C9D7DF] bg-[#FAFBF9] text-[#4A5D58] hover:border-[#2D5266] hover:bg-[#ECF1F4] hover:text-[#2D5266]',
    progressBarColor: '#2D5266',
    progressBadgeClass: 'border-[#C9D7DF] bg-[#ECF1F4]/80 text-[#2D5266]',
  },
  'giai-tich-ham-mot-bien': {
    subjectRgb: '36, 87, 70',
    topBarGradient: 'linear-gradient(90deg, transparent 0%, #245746 50%, transparent 100%)',
    cardBorder: 'border-[#D8E0DD] hover:border-[#245746]',
    indexText: 'text-[#245746]',
    badgeClass: 'border-[#C6DBD0] bg-[#EBF2EE] text-[#245746]',
    titleHover: 'hover:text-[#245746]',
    ctaClass: 'bg-[#245746] text-[#FAFBF9] hover:bg-[#1B4436]',
    secondaryBtnClass:
      'border-[#C6DBD0] bg-[#EBF2EE]/70 text-[#245746] hover:border-[#245746] hover:bg-[#EBF2EE]',
    chapterPillClass:
      'border-[#C6DBD0] bg-[#FAFBF9] text-[#4A5D58] hover:border-[#245746] hover:bg-[#EBF2EE] hover:text-[#245746]',
    progressBarColor: '#245746',
    progressBadgeClass: 'border-[#C6DBD0] bg-[#EBF2EE]/80 text-[#245746]',
  },
  'giao-duc-hoc': {
    subjectRgb: '122, 70, 59',
    topBarGradient: 'linear-gradient(90deg, transparent 0%, #7A463B 50%, transparent 100%)',
    cardBorder: 'border-[#D8E0DD] hover:border-[#7A463B]',
    indexText: 'text-[#7A463B]',
    badgeClass: 'border-[#D8C8C1] bg-[#F3ECE9] text-[#7A463B]',
    titleHover: 'hover:text-[#7A463B]',
    ctaClass: 'bg-[#7A463B] text-[#FAFBF9] hover:bg-[#62372E]',
    secondaryBtnClass:
      'border-[#D8C8C1] bg-[#F3ECE9]/70 text-[#7A463B] hover:border-[#7A463B] hover:bg-[#F3ECE9]',
    chapterPillClass:
      'border-[#D8C8C1] bg-[#FAFBF9] text-[#4A5D58] hover:border-[#7A463B] hover:bg-[#F3ECE9] hover:text-[#7A463B]',
    progressBarColor: '#7A463B',
    progressBadgeClass: 'border-[#D8C8C1] bg-[#F3ECE9]/80 text-[#7A463B]',
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

  const handleCardMouseMove = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    el.style.setProperty('--mx', `${Math.round(event.clientX - rect.left)}px`);
    el.style.setProperty('--my', `${Math.round(event.clientY - rect.top)}px`);
  };

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
    return {
      subject: sub,
      shortCode: SUBJECT_SHORT_CODES[sub.slug] ?? sub.shortTitle.toUpperCase(),
      done,
      total: stats.lessonCount,
      percent,
      palette,
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
        className="relative z-20 scroll-mt-24 pt-10 pb-10 lg:pt-12 lg:pb-12"
      >
        <div className="lu-container-wide">
          {/* Header 2 tầng + Toolbar lọc phân nhánh */}
          <div className="mb-8 border-b border-[var(--border-subtle)] pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--text-muted)] uppercase">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>HỆ THỐNG HỌC PHẦN</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                Không gian Học phần
              </h2>
              <p className="mt-1.5 max-w-2xl font-sans text-sm leading-relaxed text-[var(--text-muted)]">
                Mỗi học phần là một kiến trúc tư duy độc lập với ngôn ngữ hình học riêng.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)]/60 pt-3">
              <div className="flex items-center">
                <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
              </div>

              <div className="flex max-w-full flex-wrap items-center gap-2.5">
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
                            ? 'bg-[#1E332E] text-[#FAFBF9] shadow-2xs'
                            : 'text-[#4A5D58] hover:text-[#182624]',
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                          onMouseEnter={() => setHoveredCardSlug(subject.slug)}
                          onMouseMove={handleCardMouseMove}
                          onMouseLeave={() => handleCardMouseLeave(subject.slug)}
                          style={
                            {
                              viewTransitionName: `subject-card-${subject.slug}`,
                              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                              '--subject-rgb': palette.subjectRgb,
                            } as CSSProperties & { '--subject-rgb': string }
                          }
                          className={cn(
                            'group relative flex h-full scroll-mt-24 flex-col justify-between overflow-hidden rounded-3xl border bg-[#FAFBF9] p-6 shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(20,36,32,0.09)] sm:p-7',
                            palette.cardBorder,
                          )}
                        >
                          {/* Dải sáng mảnh chạy dọc mép trên của thẻ khi hover */}
                          <div
                            aria-hidden="true"
                            style={{ background: palette.topBarGradient }}
                            className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-[2.5px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          />

                          {/* Quầng sáng Radial Spotlight bám theo con trỏ chuột (không gây mờ chữ) */}
                          <div
                            aria-hidden="true"
                            data-testid={`card-spotlight-${subject.slug}`}
                            style={{
                              background:
                                'radial-gradient(420px circle at var(--mx, 50%) var(--my, 35%), rgba(var(--subject-rgb), 0.10), transparent 70%)',
                            }}
                            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          />

                          <SubjectWatermarkSignature slug={subject.slug} />

                          <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={cn('font-mono text-xs font-bold', palette.indexText)}
                              >
                                {galleryIndex}.
                              </span>
                              <span
                                className={cn(
                                  'rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors duration-200',
                                  palette.badgeClass,
                                )}
                              >
                                {asset.categoryLabel}
                              </span>
                            </div>

                            {/* Số chương/bài & Huy hiệu Tiến độ môn học */}
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <span className="font-mono text-[11px] text-[#4A5D58]">
                                  {stats.chapterCount} chương · {stats.lessonCount} bài giảng
                                </span>
                                <span
                                  data-testid={`subject-progress-badge-${subject.slug}`}
                                  className={cn(
                                    'rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold',
                                    palette.progressBadgeClass,
                                  )}
                                >
                                  Đã học {subjectCompletedCount}/{stats.lessonCount} bài ·{' '}
                                  {subjectPercent}%
                                </span>
                              </div>
                              <div className="h-1 w-32 overflow-hidden rounded-full bg-[#E7ECEA]">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.max(subjectPercent, subjectCompletedCount > 0 ? 6 : 0)}%`,
                                    backgroundColor: palette.progressBarColor,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10">
                            <SubjectStageCanvas
                              slug={subject.slug}
                              isCardHovered={hoveredCardSlug === subject.slug}
                            />
                          </div>

                          <div className="relative z-10 space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#182624] sm:text-[1.6rem]">
                                <Link
                                  to={ROUTES.subjectOverview(subject.slug)}
                                  className={cn('transition-colors', palette.titleHover)}
                                >
                                  {subject.title}
                                </Link>
                              </h3>
                              <p className="line-clamp-3 text-sm leading-relaxed text-[#4A5D58]">
                                {asset.conciseDescription}
                              </p>
                            </div>

                            {/* Dải Nhảy Nhanh Chương & Nút Xem nhanh lộ trình */}
                            <div className="space-y-2.5 rounded-2xl border border-[#D8E0DD]/80 bg-[#F2F4F3]/65 p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono text-[10px] font-semibold tracking-wider text-[#4A5D58] uppercase">
                                  Chương trọng tâm
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
                                    'inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-[10.5px] font-semibold transition-colors',
                                    palette.indexText,
                                    'hover:bg-[#FAFBF9]',
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

                              <div className="flex flex-wrap items-center gap-1.5">
                                {highlightedChapters.map((chapter) => (
                                  <Link
                                    key={chapter.id}
                                    to={`${ROUTES.subjectOverview(subject.slug)}?chapter=${chapter.slug}`}
                                    title={`Mở Chương ${chapter.number}: ${chapter.title}`}
                                    className={cn(
                                      'inline-flex max-w-[190px] items-center gap-1 truncate rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all duration-150',
                                      palette.chapterPillClass,
                                    )}
                                  >
                                    <span className="font-mono text-[10px] font-bold">
                                      Ch.{chapter.number}
                                    </span>
                                    <span className="truncate">{chapter.title}</span>
                                  </Link>
                                ))}
                                {subject.chapters.length > highlightedChapters.length && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedRoadmaps((prev) => ({
                                        ...prev,
                                        [subject.slug]: !prev[subject.slug],
                                      }))
                                    }
                                    className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#CBD6D2] bg-[#FAFBF9] px-2.5 py-1 font-mono text-[10.5px] font-semibold text-[#4A5D58] transition-colors hover:border-[#1E332E] hover:text-[#182624]"
                                  >
                                    +{subject.chapters.length - highlightedChapters.length} chương
                                  </button>
                                )}
                              </div>

                              {isRoadmapOpen && (
                                <div
                                  data-testid={`roadmap-drawer-${subject.slug}`}
                                  className="mt-2 max-h-48 space-y-1.5 overflow-y-auto border-t border-[#D8E0DD] pt-2.5 pr-1"
                                >
                                  {subject.chapters.map((chapter) => {
                                    const chDone = chapter.lessons.filter(
                                      (l) => completedLessons[l.id],
                                    ).length;
                                    return (
                                      <Link
                                        key={chapter.id}
                                        to={`${ROUTES.subjectOverview(subject.slug)}?chapter=${chapter.slug}`}
                                        className="flex items-center justify-between gap-2 rounded-xl border border-transparent bg-[#FAFBF9] px-3 py-1.5 text-xs transition-colors hover:border-[#CBD6D2] hover:bg-white"
                                      >
                                        <span className="flex min-w-0 items-center gap-2">
                                          <span
                                            className={cn(
                                              'shrink-0 font-mono text-[10.5px] font-bold',
                                              palette.indexText,
                                            )}
                                          >
                                            Ch.{chapter.number}
                                          </span>
                                          <span className="truncate font-medium text-[#182624]">
                                            {chapter.title}
                                          </span>
                                        </span>
                                        <span className="shrink-0 font-mono text-[10.5px] text-[#4A5D58]">
                                          {chDone}/{chapter.lessons.length} bài
                                        </span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Chân thẻ: Cụm nút Học tiếp bài đang dở + Vào học phần */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#D8E0DD] pt-4">
                              <span className="line-clamp-1 max-w-full font-mono text-[11px] text-[#4A5D58] xl:max-w-[44%]">
                                {asset.visualMetaphor}
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
                                    <span>Học tiếp bài đang dở</span>
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
      </section>

      {viewMode === 'atlas' && (
        <>
          <GoldenCompassSpineBridge />

          <section
            aria-label="Không gian Tiếp tục học tập"
            className="relative z-20 py-10 lg:py-14"
          >
            <div className="lu-container-wide">
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

              <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                <div
                  role="region"
                  aria-label="Tiếp tục học dở"
                  className="flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm sm:p-8 lg:col-span-7"
                >
                  {activeRecentLesson ? (
                    <>
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
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
                            <ProgressRing value={displayOrbitPercent} size={44} strokeWidth={4} />
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

                        <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/70 p-4">
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

                        {/* Lộ trình bài kế tiếp (Up Next Queue) */}
                        {upNextQueue.length > 0 && (
                          <div className="space-y-2.5" data-testid="up-next-queue">
                            <p className="font-mono text-[11px] font-semibold tracking-wider text-[#4A5D58] uppercase">
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
                                    className="group/next flex flex-col justify-between gap-1.5 rounded-2xl border border-[#D8E0DD] bg-[#F2F4F3]/65 p-3 transition-all duration-150 hover:border-[#1E332E]/40 hover:bg-white hover:shadow-xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-[10.5px] font-bold text-[#1E332E]">
                                        Bài {item.chapter.number}.{item.lesson.number}
                                      </span>
                                      {isDone ? (
                                        <CheckCircle2
                                          className="h-3.5 w-3.5 text-[#245746]"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <span className="font-mono text-[10px] text-[#4A5D58]">
                                          {item.lesson.estimatedMinutes} phút
                                        </span>
                                      )}
                                    </div>
                                    <p className="line-clamp-2 text-xs leading-snug font-semibold text-[#182624] group-hover/next:text-[#245746]">
                                      {item.lesson.title}
                                    </p>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tổng quan Tiến độ 4 Học phần */}
                        <div className="space-y-2.5" data-testid="progress-matrix-4-subjects">
                          <p className="font-mono text-[11px] font-semibold tracking-wider text-[#4A5D58] uppercase">
                            Tổng quan Tiến độ 4 Học phần
                          </p>
                          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                            {subjectProgressMatrix.map((entry) => (
                              <Link
                                key={entry.subject.id}
                                to={ROUTES.subjectOverview(entry.subject.slug)}
                                className="flex flex-col justify-between gap-2 rounded-2xl border border-[#D8E0DD] bg-[#FAFBF9] p-3 transition-colors hover:border-[#1E332E]/40 hover:bg-white"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={cn(
                                      'font-mono text-[11px] font-bold',
                                      entry.palette.indexText,
                                    )}
                                  >
                                    {entry.shortCode}
                                  </span>
                                  <span className="font-mono text-[11px] font-bold text-[#182624]">
                                    {entry.percent}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E7ECEA]">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.max(entry.percent, entry.done > 0 ? 8 : 0)}%`,
                                      backgroundColor: entry.palette.progressBarColor,
                                    }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-[#4A5D58]">
                                  {entry.done}/{entry.total} bài
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

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

                <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                  {/* Mô hình 1: Biểu đồ Radar Cấu trúc & Phân tích Năng lực Học phần */}
                  <CurriculumRadarCard
                    stats={radarSubjectStats}
                    totalCompleted={completedCount}
                    totalLessons={totalLessonCount}
                  />

                  {/* Mô hình 2: Mạng lưới Liên kết Tri thức Liên môn 120fps */}
                  <KnowledgeConstellationCard />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
