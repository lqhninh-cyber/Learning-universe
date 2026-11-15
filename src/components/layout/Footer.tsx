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
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8AE7D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#112624]',
    isDarkLesson ? 'text-[#94A3B8] hover:text-[#C8AE7D]' : 'text-[#B8C7C2] hover:text-[#C8AE7D]',
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
              '--lake-deep': '#0D211D',
              '--lake-text': '#EBF0EE',
              '--lake-text-muted': '#B8C7C2',
              '--lake-accent': '#C8AE7D',
              background: 'linear-gradient(180deg, #0D211D 0%, #112624 100%)',
            } as React.CSSProperties)
      }
      className={cn(
        'relative border-t transition-colors duration-200',
        isDarkLesson
          ? 'border-[#2A323A] bg-[#16191D] text-[#E2E8F0]'
          : 'border-[#9E845A]/30 text-[#EBF0EE]',
      )}
    >
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
                  isDarkLesson ? 'text-[#F8FAFC]' : 'text-[#EBF0EE]',
                )}
              >
                Learning Universe
              </span>
            </div>
            <blockquote
              className={cn(
                'max-w-[740px] font-serif text-[15.5px] leading-[1.8] italic transition-colors lg:text-[16.5px]',
                isDarkLesson ? 'text-[#CBD5E1]' : 'text-[#B8C7C2]',
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
                  isDarkLesson ? 'text-[#C89738]' : 'text-[#C8AE7D]',
                )}
              >
                — Chủ tịch Hồ Chí Minh
              </cite>
            </div>
          </div>

          {/* Center Column: Ấn Chương Khuê Văn Tối Giản (Desktop) */}
          <div className="hidden shrink-0 items-center justify-center px-3 md:flex">
            <div data-testid="footer-brand-logo">
              <BrandLogo variant="emblem-only" size="lg" />
            </div>
          </div>

          {/* Right Column: Navigation Links */}
          <nav
            aria-label="Điều hướng chân trang"
            className="flex flex-row flex-wrap items-center justify-center gap-1 md:justify-end md:gap-2"
          >
            <Link to={ROUTES.home} className={footerLinkClass}>
              Trang chủ
            </Link>
            <span className="text-[#9E845A]/55 select-none" aria-hidden="true">
              ·
            </span>
            <Link to={ROUTES.learningSpace} className={footerLinkClass}>
              Không gian học tập
            </Link>
            <span className="text-[#9E845A]/55 select-none" aria-hidden="true">
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
            isDarkLesson ? 'border-[#2A323A] text-[#94A3B8]' : 'border-[#9E845A]/25 text-[#B8C7C2]',
          )}
        >
          <p>Learning Universe. Bản quyền mở.</p>
          <p>~Không gian tri thức mở~</p>
        </div>
      </Container>
    </footer>
  );
}
