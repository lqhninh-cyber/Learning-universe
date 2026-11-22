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
      className="flex min-w-0 flex-col justify-between gap-4 rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 lg:col-span-5 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
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
          className="flex flex-1 flex-col justify-center gap-4 rounded-[20px] bg-[#F6F8F7] p-5 dark:bg-[#0F1715]"
        >
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
              Thử nhớ công thức & định nghĩa
            </span>
            <p className="font-serif text-lg font-semibold text-[var(--text-main)]">
              {entry.nameVi}
            </p>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">{entry.nameEn}</p>
          </div>

          {isRevealed ? (
            <div
              data-testid="glossary-flashcard-answer"
              className="space-y-3 border-t border-[var(--border-hairline)] pt-3"
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0F7656]/45 bg-white px-3 py-3.5 text-xs font-semibold text-[#0F7656] transition-colors hover:bg-[#EAF5F0] dark:bg-[#141D1A] dark:text-[#4AD1A3]"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Lật xem công thức & định nghĩa</span>
            </button>
          )}
        </div>
      ) : (
        <Link
          to={`${ROUTES.glossary}?q=${encodeURIComponent(entry.nameVi)}`}
          className="group flex flex-1 flex-col justify-center gap-3.5 rounded-[20px] bg-[#F6F8F7] p-4 transition-colors hover:bg-[#EFF7F3] dark:bg-[#0F1715] dark:hover:bg-[#13221D]"
        >
          <div className="space-y-1">
            <p className="font-serif text-lg leading-snug font-semibold text-[var(--text-main)] group-hover:text-[#0F7656] dark:group-hover:text-[#4AD1A3]">
              {entry.nameVi}
            </p>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">{entry.nameEn}</p>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-[#0F7656]/15 bg-white px-4 py-3 text-base text-[var(--text-main)] shadow-2xs dark:bg-[#141D1A]">
            <KatexMath math={entry.formula || entry.symbol} />
          </div>

          {entry.brief && (
            <p className="line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
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
