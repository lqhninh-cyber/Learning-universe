import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Container } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { LotusCenterLogo } from './LotusCenterLogo';

export interface FooterProps {
  readonly isDarkLesson?: boolean;
}

export function Footer({ isDarkLesson }: FooterProps = {}) {
  const footerLinkClass = cn(
    'min-h-[44px] flex items-center px-3 text-xs font-medium whitespace-nowrap rounded-md md:text-sm',
    'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'hover:-translate-y-0.5 active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B25D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081a13]',
    isDarkLesson ? 'text-[#94A3B8] hover:text-[#F8FAFC]' : 'text-[#CBD5CE] hover:text-[#F1F5F3]',
  );

  return (
    <footer
      style={
        {
          '--lake-deep': '#081a13',
          '--lake-text': '#F1F5F3',
          '--lake-text-muted': '#CBD5CE',
          '--lake-accent': '#E5B25D',
          '--lotus-rose': '#D9778D',
        } as React.CSSProperties
      }
      className={cn(
        'border-t transition-colors duration-200',
        isDarkLesson
          ? 'border-[#2A323A] bg-[#16191D] text-[#E2E8F0]'
          : 'border-[#1F332A]/50 bg-gradient-to-b from-[#0A261D] via-[#081a13] to-[#081a13] text-[#F1F5F3]',
      )}
    >
      <Container size="wide" className="py-5 md:py-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
          {/* Mobile Center Logo */}
          <div className="flex justify-center md:hidden">
            <LotusCenterLogo />
          </div>

          {/* Left Column: Branding & President Ho Chi Minh Quotation (Dàn rộng max-w-xl) */}
          <div className="w-full max-w-xl md:w-[55%]">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={cn(
                  'font-serif text-base font-semibold transition-colors',
                  isDarkLesson ? 'text-[#F8FAFC]' : 'text-[#F1F5F3]',
                )}
              >
                Learning Universe
              </span>
            </div>
            <blockquote
              className={cn(
                'font-serif text-xs leading-relaxed italic transition-colors md:text-sm',
                isDarkLesson ? 'text-[#CBD5E1]' : 'text-[#CBD5CE]',
              )}
            >
              “Chúng ta phải học, phải cố gắng học nhiều. Không chịu khó học thì không tiến bộ được.
              Không tiến bộ là thoái bộ. Xã hội càng đi tới, công việc càng nhiều, máy móc càng tinh
              xảo. Mình không chịu học thì lạc hậu, mà lạc hậu là bị đào thải, tự mình đào thải
              mình...”
            </blockquote>
            <div className="mt-1 flex w-full justify-end">
              <cite
                className={cn(
                  'text-right font-mono text-xs font-medium not-italic transition-colors',
                  isDarkLesson ? 'text-[#C89738]' : 'text-[#E5B25D]',
                )}
              >
                — Chủ tịch Hồ Chí Minh
              </cite>
            </div>
          </div>

          {/* Center Column: Artistic Lotus Emblem (Desktop) */}
          <div className="hidden shrink-0 items-center justify-center px-4 md:flex">
            <LotusCenterLogo />
          </div>

          {/* Right Column: Flat Single-Row Navigation Links */}
          <nav
            aria-label="Điều hướng chân trang"
            className="flex flex-row items-center justify-center gap-2 md:justify-end md:gap-3"
          >
            <Link to={ROUTES.home} className={footerLinkClass}>
              Trang chủ
            </Link>
            <span className="text-[#365E4E] select-none" aria-hidden="true">
              ·
            </span>
            <Link to={ROUTES.courses} className={footerLinkClass}>
              Tất cả môn học
            </Link>
            <span className="text-[#365E4E] select-none" aria-hidden="true">
              ·
            </span>
            <Link to={ROUTES.glossary} className={footerLinkClass}>
              Thuật ngữ
            </Link>
          </nav>
        </div>

        {/* Bottom Metadata Bar */}
        <div
          className={cn(
            'mt-4 flex flex-col items-center justify-between gap-2 border-t pt-3 text-xs transition-colors sm:flex-row',
            isDarkLesson
              ? 'border-[#2A323A] text-[#94A3B8]'
              : 'border-[#1F332A]/50 font-mono text-xs text-[#D1E0D7] opacity-85',
          )}
        >
          <p>Learning Universe. Bản quyền mở.</p>
          <p>-Không gian tri thức mở-</p>
        </div>
      </Container>
    </footer>
  );
}
