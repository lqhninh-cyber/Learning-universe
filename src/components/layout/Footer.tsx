import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Container } from '@/shared/ui';
import { LotusCenterLogo } from './LotusCenterLogo';

export function Footer() {
  return (
    <footer className="border-t border-[#CFDADB] bg-[#F7FAFA]/90 text-[#29383D]">
      <Container size="wide" className="py-6 md:py-7">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
          {/* Mobile Center Logo */}
          <div className="flex justify-center md:hidden">
            <LotusCenterLogo />
          </div>

          {/* Left Column: Branding & President Ho Chi Minh Quotation (Dàn rộng max-w-xl) */}
          <div className="w-full max-w-xl md:w-[55%]">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-serif text-base font-semibold text-[#29383D]">
                Learning Universe
              </span>
            </div>
            <blockquote className="font-serif text-xs leading-relaxed text-[#55676B] italic md:text-sm">
              “Chúng ta phải học, phải cố gắng học nhiều. Không chịu khó học thì không tiến bộ được.
              Không tiến bộ là thoái bộ. Xã hội càng đi tới, công việc càng nhiều, máy móc càng tinh
              xảo. Mình không chịu học thì lạc hậu, mà lạc hậu là bị đào thải, tự mình đào thải
              mình...”
            </blockquote>
            <div className="mt-1 flex w-full justify-end">
              <cite className="text-right font-mono text-xs font-medium text-[#3F6570] not-italic">
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
            className="flex flex-row items-center justify-center gap-5 md:justify-end md:gap-6"
          >
            <Link
              to={ROUTES.home}
              className="text-xs font-medium whitespace-nowrap text-[#55676B] transition-colors hover:text-[#365E4E] md:text-sm"
            >
              Trang chủ
            </Link>
            <Link
              to={ROUTES.courses}
              className="text-xs font-medium whitespace-nowrap text-[#55676B] transition-colors hover:text-[#365E4E] md:text-sm"
            >
              Tất cả môn học
            </Link>
            <Link
              to={ROUTES.glossary}
              className="text-xs font-medium whitespace-nowrap text-[#55676B] transition-colors hover:text-[#365E4E] md:text-sm"
            >
              Thuật ngữ
            </Link>
          </nav>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-[#CFDADB]/60 pt-3 text-xs text-[#55676B] sm:flex-row">
          <p>Learning Universe. Bản quyền mở.</p>
          <p>-Không gian tri thức mở-</p>
        </div>
      </Container>
    </footer>
  );
}
