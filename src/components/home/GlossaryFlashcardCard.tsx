import { ArrowRight, BookMarked, Eye, Layers, RefreshCw } from 'lucide-react';
import { type FC, useState } from 'react';
import { Link } from 'react-router';
import {
  InlineMathText,
  KatexMath,
  type MathGlossaryEntry,
  type MathGlossarySubject,
} from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface GlossaryFlashcardCardProps {
  readonly entry: MathGlossaryEntry;
  readonly onShuffle: () => void;
}

interface GlossarySubjectTheme {
  readonly code: string;
  readonly washUrl: string;
  readonly topBarGradient: string;
  readonly inkClass: string;
  readonly pillClass: string;
  readonly stageGradClass: string;
}

const GLOSSARY_SUBJECT_THEMES: Readonly<Record<MathGlossarySubject, GlossarySubjectTheme>> = {
  'cau-truc-dai-so': {
    code: 'CTĐS',
    washUrl: '/assets/atmosphere/subject-wash-ctds.webp',
    topBarGradient: 'linear-gradient(90deg, #8C5828 0%, #D4AF6A 55%, #0F7656 100%)',
    inkClass: 'text-[#8C5828] dark:text-[#D99B5E]',
    pillClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
    stageGradClass:
      'from-[#FBF6EE] via-[#F7F4ED] to-[#F3F5F4] dark:from-[#1B1712] dark:via-[#121917] dark:to-[#0F1715]',
  },
  'hinh-hoc-affine': {
    code: 'HHAVE',
    washUrl: '/assets/atmosphere/subject-wash-hhave.webp',
    topBarGradient: 'linear-gradient(90deg, #1D4F6E 0%, #64A8D1 55%, #0F7656 100%)',
    inkClass: 'text-[#1D4F6E] dark:text-[#64A8D1]',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    stageGradClass:
      'from-[#F1F7FA] via-[#F3F7F7] to-[#F2F6F4] dark:from-[#121B22] dark:via-[#10181A] dark:to-[#0F1715]',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    washUrl: '/assets/atmosphere/subject-wash-gthmb.webp',
    topBarGradient: 'linear-gradient(90deg, #1B5E4A 0%, #4AD1A3 55%, #D4AF6A 100%)',
    inkClass: 'text-[#1B5E4A] dark:text-[#52B394]',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    stageGradClass:
      'from-[#EEF7F3] via-[#F3F8F5] to-[#F4F7F5] dark:from-[#101E19] dark:via-[#0F1916] dark:to-[#0F1715]',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    washUrl: '/assets/atmosphere/subject-wash-gdh.webp',
    topBarGradient: 'linear-gradient(90deg, #8F3D35 0%, #DF7B70 55%, #D4AF6A 100%)',
    inkClass: 'text-[#8F3D35] dark:text-[#DF7B70]',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    stageGradClass:
      'from-[#FAF2F0] via-[#F7F3F2] to-[#F4F6F5] dark:from-[#1E1413] dark:via-[#151716] dark:to-[#0F1715]',
  },
};

const GlossaryDomainArtwork: FC<{ readonly subject: MathGlossarySubject }> = ({ subject }) => {
  if (subject === 'cau-truc-dai-so') {
    return (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -right-2 h-28 w-40 opacity-[0.18] dark:opacity-[0.24]"
      >
        <g className="lu-orbit-ring">
          <polygon
            points="126,20 150,32 158,58 144,82 118,88 94,74 88,48 102,24"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeDasharray="3 3"
          />
        </g>
        <path d="M98 54L126 32L150 56L126 78Z" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="126" cy="54" r="2.8" fill="currentColor" />
      </svg>
    );
  }
  if (subject === 'hinh-hoc-affine') {
    return (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -right-2 h-28 w-40 opacity-[0.18] dark:opacity-[0.24]"
      >
        <ellipse
          cx="124"
          cy="56"
          rx="36"
          ry="16"
          transform="rotate(-22 124 56)"
          stroke="currentColor"
          strokeWidth="1.15"
        />
        <path
          d="M84 94L156 26M92 28L148 90"
          stroke="currentColor"
          strokeWidth="0.95"
          strokeDasharray="3 3"
        />
        <circle cx="124" cy="56" r="2.8" fill="currentColor" />
      </svg>
    );
  }
  if (subject === 'giai-tich-ham-mot-bien') {
    return (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -right-2 h-28 w-40 opacity-[0.18] dark:opacity-[0.24]"
      >
        <path
          d="M54 90C80 84 96 28 124 32C146 35 156 76 176 58"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M62 94H172" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 3" />
        <circle cx="124" cy="32" r="3" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 180 120"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute -top-2 -right-2 h-28 w-40 opacity-[0.2] dark:opacity-[0.26]"
    >
      <circle
        cx="126"
        cy="58"
        r="40"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="lu-orbit-ring-reverse"
      />
      <circle cx="126" cy="58" r="26" stroke="currentColor" strokeWidth="1" />
      <polygon
        points="126,34 104,72 148,72"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="126" cy="34" r="2.6" fill="currentColor" />
      <circle cx="104" cy="72" r="2.6" fill="currentColor" />
      <circle cx="148" cy="72" r="2.6" fill="currentColor" />
    </svg>
  );
};

export const GlossaryFlashcardCard: FC<GlossaryFlashcardCardProps> = ({ entry, onShuffle }) => {
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const domainTheme =
    GLOSSARY_SUBJECT_THEMES[entry.subject] ?? GLOSSARY_SUBJECT_THEMES['cau-truc-dai-so'];

  const handleToggleFlashcardMode = () => {
    setIsFlashcardMode((prev) => !prev);
    setIsRevealed(false);
  };

  const handleNextCard = () => {
    setIsRevealed(false);
    onShuffle();
  };

  return (
    <div
      data-testid="dashboard-glossary-card"
      className="relative flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 lg:col-span-5 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      {/* Dải gờ màu chuyên ngành trên đỉnh thẻ Thuật ngữ */}
      <div
        aria-hidden="true"
        style={{ background: domainTheme.topBarGradient }}
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 opacity-85"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          <BookMarked
            className="h-3.5 w-3.5 text-[#0F7656] dark:text-[#4AD1A3]"
            aria-hidden="true"
          />
          <span>Thuật ngữ ngẫu nhiên</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="glossary-flashcard-toggle"
            onClick={handleToggleFlashcardMode}
            aria-pressed={isFlashcardMode}
            className={cn(
              'inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border px-2.5 font-mono text-[10px] font-semibold transition-colors',
              isFlashcardMode
                ? 'border-[#0F7656] bg-[#0F7656] text-white'
                : 'border-[var(--border-hairline)] bg-[#F6F8F7] text-[var(--text-secondary)] hover:border-[#0F7656]/40 hover:text-[var(--text-main)] dark:bg-[#0F1715]',
            )}
          >
            <Layers className="h-3 w-3" aria-hidden="true" />
            <span>{isFlashcardMode ? 'Đang ôn nhanh' : 'Flashcard'}</span>
          </button>

          <button
            type="button"
            data-testid="glossary-shuffle-btn"
            onClick={handleNextCard}
            aria-label="Đổi thuật ngữ ngẫu nhiên"
            className="group/gbtn inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[#F6F8F7] text-[var(--text-secondary)] transition-colors hover:border-[#0F7656]/40 hover:text-[var(--text-main)] active:scale-95 dark:bg-[#0F1715]"
          >
            <RefreshCw
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/gbtn:rotate-180"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {isFlashcardMode ? (
        <div
          data-testid="glossary-flashcard-stage"
          className={cn(
            'lu-atelier-backdrop relative flex flex-1 flex-col justify-center gap-4 overflow-hidden rounded-[20px] border border-black/[0.04] bg-gradient-to-br p-5 dark:border-white/[0.06]',
            domainTheme.stageGradClass,
            domainTheme.inkClass,
          )}
        >
          <GlossaryDomainArtwork subject={entry.subject} />
          <div className="relative z-10 space-y-1 text-[var(--text-main)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
                Thử nhớ công thức & định nghĩa
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-bold',
                  domainTheme.pillClass,
                )}
              >
                {domainTheme.code}
              </span>
            </div>
            <p className="font-serif text-lg font-semibold text-[var(--text-main)]">
              {entry.nameVi}
            </p>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">{entry.nameEn}</p>
          </div>

          {isRevealed ? (
            <div
              data-testid="glossary-flashcard-answer"
              className="relative z-10 space-y-3 border-t border-[var(--border-hairline)] pt-3"
            >
              <div className="inline-flex rounded-xl border border-[#0F7656]/20 bg-white px-3.5 py-2 text-sm text-[var(--text-main)] shadow-2xs dark:bg-[#141D1A]">
                <KatexMath math={entry.formula || entry.symbol} />
              </div>
              {entry.brief && (
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  <InlineMathText text={entry.brief} />
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsRevealed(false)}
                  className="cursor-pointer font-mono text-[10.5px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  Úp thẻ lại
                </button>
                <button
                  type="button"
                  onClick={handleNextCard}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#0F7656] px-3 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-95"
                >
                  <span>Thẻ tiếp theo</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              data-testid="glossary-flashcard-reveal"
              onClick={() => setIsRevealed(true)}
              className="relative z-10 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0F7656]/45 bg-white/90 px-3 py-3.5 text-xs font-semibold text-[#0F7656] backdrop-blur-xs transition-colors hover:bg-[#EAF5F0] dark:bg-[#141D1A]/90 dark:text-[#4AD1A3]"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Lật xem công thức & định nghĩa</span>
            </button>
          )}
        </div>
      ) : (
        <Link
          to={`${ROUTES.glossary}?q=${encodeURIComponent(entry.nameVi)}`}
          className={cn(
            'lu-atelier-backdrop group relative flex flex-1 flex-col justify-center gap-3.5 overflow-hidden rounded-[20px] border border-black/[0.05] bg-gradient-to-br p-4 transition-all duration-200 hover:border-black/[0.1] dark:border-white/[0.07] dark:hover:border-white/[0.14]',
            domainTheme.stageGradClass,
            domainTheme.inkClass,
          )}
        >
          {/* Lớp tranh màu nước khoáng thạch cục bộ hòa trộn dịu phía sau công thức */}
          <div
            aria-hidden="true"
            style={{ backgroundImage: `url('${domainTheme.washUrl}')` }}
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105 dark:opacity-15 dark:mix-blend-screen"
          />
          <GlossaryDomainArtwork subject={entry.subject} />
          <div className="relative z-10 space-y-1 text-[var(--text-main)]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-serif text-lg leading-snug font-semibold text-[var(--text-main)] group-hover:text-[#0F7656] dark:group-hover:text-[#4AD1A3]">
                {entry.nameVi}
              </p>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-bold',
                  domainTheme.pillClass,
                )}
              >
                {domainTheme.code}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">{entry.nameEn}</p>
          </div>

          <div className="relative z-10 flex items-center justify-center rounded-2xl border border-[#0F7656]/18 bg-white/92 px-4 py-3 text-base text-[var(--text-main)] shadow-xs backdrop-blur-xs dark:bg-[#141D1A]/92">
            <KatexMath math={entry.formula || entry.symbol} />
          </div>

          {entry.brief && (
            <p className="relative z-10 line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <InlineMathText text={entry.brief} />
            </p>
          )}
        </Link>
      )}

      <div className="flex justify-end">
        <Link
          to={ROUTES.glossary}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#0F7656] hover:underline dark:text-[#4AD1A3]"
        >
          <span>Tra cứu trên Kho Thuật ngữ</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default GlossaryFlashcardCard;
