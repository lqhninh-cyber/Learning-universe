import { ArrowRight, BookMarked, Eye, Layers, RefreshCw } from 'lucide-react';
import { type FC, useState } from 'react';
import { Link } from 'react-router';
import { InlineMathText, KatexMath, type MathGlossaryEntry } from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface GlossaryFlashcardCardProps {
  readonly entry: MathGlossaryEntry;
  readonly onShuffle: () => void;
}

export const GlossaryFlashcardCard: FC<GlossaryFlashcardCardProps> = ({ entry, onShuffle }) => {
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

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
      className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 lg:col-span-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          <BookMarked className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
          <span>Thuật ngữ ngẫu nhiên</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="glossary-flashcard-toggle"
            onClick={handleToggleFlashcardMode}
            aria-pressed={isFlashcardMode}
            className={cn(
              'inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 font-mono text-[10px] font-semibold transition-colors',
              isFlashcardMode
                ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]',
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
            className="group/gbtn inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] active:scale-95"
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
          className="flex flex-1 flex-col justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4"
        >
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
              Thử nhớ công thức & định nghĩa
            </span>
            <p className="font-serif text-base font-semibold text-[var(--text-main)]">
              {entry.nameVi}
            </p>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">{entry.nameEn}</p>
          </div>

          {isRevealed ? (
            <div
              data-testid="glossary-flashcard-answer"
              className="space-y-2.5 border-t border-[var(--border-hairline)] pt-3"
            >
              <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-main)]">
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
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-95"
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--accent-os)]/45 bg-[var(--bg-surface)] px-3 py-3 text-xs font-semibold text-[var(--accent-os)] transition-colors hover:bg-[var(--accent-os)]/8"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Lật xem công thức & định nghĩa</span>
            </button>
          )}
        </div>
      ) : (
        <Link
          to={`${ROUTES.glossary}?q=${encodeURIComponent(entry.nameVi)}`}
          className="group flex flex-1 flex-col justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 transition-colors hover:border-[var(--accent-os)]/45"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
                {entry.nameVi}
              </p>
              <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">
                {entry.nameEn}
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-sm text-[var(--text-main)]">
              <KatexMath math={entry.formula || entry.symbol} />
            </span>
          </div>

          {entry.brief && (
            <p className="line-clamp-2 border-t border-[var(--border-hairline)] pt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              <InlineMathText text={entry.brief} />
            </p>
          )}
        </Link>
      )}

      <div className="flex justify-end">
        <Link
          to={ROUTES.glossary}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent-os)] hover:underline"
        >
          <span>Tra cứu trên Kho Thuật ngữ</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default GlossaryFlashcardCard;
