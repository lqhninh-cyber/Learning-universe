import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Container } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { BrandLogo } from '@/components/common/BrandLogo';

export interface FooterProps {
  readonly isDarkLesson?: boolean;
}

export function Footer({ isDarkLesson }: FooterProps = {}) {
  const footerLinkClass = cn(
    'min-h-[44px] flex items-center px-2.5 text-[15px] font-medium whitespace-nowrap rounded-md',
    'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'hover:-translate-y-0.5 active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B85B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#122530]',
    isDarkLesson ? 'text-[#94A3B8] hover:text-[#E8C16D]' : 'text-[#DCE6E2] hover:text-[#E8C16D]',
  );

  return (
    <footer
      style={
        isDarkLesson
          ? ({
              '--lake-deep': '#16191D',
              '--lake-text': '#E2E8F0',
              '--lake-text-muted': '#94A3B8',
              '--lake-accent': '#C89738',
            } as React.CSSProperties)
          : ({
              '--lake-deep': '#0F2926',
              '--lake-text': '#FAF5E8',
              '--lake-text-muted': '#DCE6E2',
              '--lake-accent': '#E5B85B',
              '--lotus-rose': '#D9778D',
              background:
                'radial-gradient(circle at 50% 50%, rgba(229,184,91,0.14), transparent 60%), linear-gradient(180deg, #0F2926 0%, #122530 55%, #161F2C 100%)',
            } as React.CSSProperties)
      }
      className={cn(
        'relative transition-colors duration-200',
        isDarkLesson ? 'border-t border-[#2A323A] bg-[#16191D] text-[#E2E8F0]' : 'text-[#FAF5E8]',
      )}
    >
      {/* Đường viền sáng mảnh vàng đồng phân tách thanh thoát với Hồ Sen */}
      {!isDarkLesson && <div aria-hidden="true" className="h-px w-full bg-[#D4A853]/40" />}

      <Container size="wide" className="relative z-10 px-6 pt-7 pb-8 md:px-12 md:pb-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
          {/* Mobile Center Emblem */}
          <div className="flex justify-center md:hidden">
            <div data-testid="footer-brand-logo">
              <BrandLogo variant="emblem-only" size="lg" />
            </div>
          </div>

          {/* Left Column: Branding & President Ho Chi Minh Quotation */}
          <div className="w-full max-w-[740px] md:w-[54%]">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  'font-serif text-[20px] font-bold tracking-wide transition-colors lg:text-[22px]',
                  isDarkLesson ? 'text-[#F8FAFC]' : 'text-[#FAF5E8]',
                )}
              >
                Learning Universe
              </span>
            </div>
            <blockquote
              className={cn(
                'max-w-[740px] font-serif text-[15.5px] leading-[1.8] italic transition-colors lg:text-[16.5px]',
                isDarkLesson ? 'text-[#CBD5E1]' : 'text-[#DCE6E2]',
              )}
            >
              “Chúng ta phải học, phải cố gắng học nhiều. Không chịu khó học thì không tiến bộ được.
              Không tiến bộ là thoái bộ. Xã hội càng đi tới, công việc càng nhiều, máy móc càng tinh
              xảo. Mình không chịu học thì lạc hậu, mà lạc hậu là bị đào thải, tự mình đào thải
              mình...”
            </blockquote>
            <div className="mt-1.5 flex w-full justify-end">
              <cite
                className={cn(
                  'mt-1.5 text-right font-mono text-[14.5px] font-medium not-italic transition-colors',
                  isDarkLesson ? 'text-[#C89738]' : 'text-[#E8C16D]',
                )}
              >
                — Chủ tịch Hồ Chí Minh
              </cite>
            </div>
          </div>

          {/* Center Column: Sao Khuê & Thiên Cầu Đông Sơn Emblem (Desktop) */}
          <div className="hidden shrink-0 items-center justify-center px-3 md:flex">
            <div data-testid="footer-brand-logo">
              <BrandLogo variant="emblem-only" size="lg" />
            </div>
          </div>

          {/* Right Column: Navigation Links including Không gian học tập */}
          <nav
            aria-label="Điều hướng chân trang"
            className="flex flex-row flex-wrap items-center justify-center gap-1 md:justify-end md:gap-2"
          >
            <Link to={ROUTES.home} className={footerLinkClass}>
              Trang chủ
            </Link>
            <span className="text-[#D4A853]/55 select-none" aria-hidden="true">
              ·
            </span>
            <Link to={ROUTES.learningSpace} className={footerLinkClass}>
              Không gian học tập
            </Link>
            <span className="text-[#D4A853]/55 select-none" aria-hidden="true">
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
            'mt-6 flex flex-col items-center justify-between gap-2 border-t pt-4 font-mono text-[15px] font-medium transition-colors sm:flex-row',
            isDarkLesson ? 'border-[#2A323A] text-[#94A3B8]' : 'border-[#D4A853]/25 text-[#BAC8C3]',
          )}
        >
          <p>Learning Universe. Bản quyền mở.</p>
          <p>~Không gian tri thức mở~</p>
        </div>
      </Container>
    </footer>
  );
}
