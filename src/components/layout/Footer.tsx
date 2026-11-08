import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Container } from '@/shared/ui';

function AcademicMonogramLogo() {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CFDADB] bg-[#E1E9EA]/50 p-2 text-[#3F6570] shadow-xs"
      aria-label="Learning Universe"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Academic geometric crest: open folio silhouette */}
        <path
          d="M4 19.5c2.5-1 5-1.5 8-1.5s5.5 0.5 8 1.5V5.5c-2.5-1-5.5-1.5-8-1.5s-5.5 0.5-8 1.5v14Z"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />
        <path d="M12 4.2v13.6" strokeWidth="1.2" strokeOpacity="0.45" />
        {/* Stylized geometric monogram L */}
        <path d="M7 8.5v5.2a1.2 1.2 0 0 0 1.2 1.2H10.5" />
        {/* Stylized geometric monogram U */}
        <path d="M13.5 8.5v4.2a1.8 1.8 0 0 0 3.6 0V8.5" />
      </svg>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#CFDADB] bg-[#F7FAFA]/90 text-[#29383D]">
      <Container size="wide" className="space-y-6 py-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          {/* Mobile Center Logo */}
          <div className="mb-4 flex justify-center md:hidden">
            <AcademicMonogramLogo />
          </div>

          {/* Left Column: Branding & President Ho Chi Minh Quotation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-semibold text-[#29383D]">
                Learning Universe
              </span>
            </div>
            <blockquote className="mt-2 max-w-md font-serif text-xs leading-relaxed text-[#55676B] italic md:text-sm">
              “Chúng ta phải học, phải cố gắng học nhiều. Không chịu khó học thì không tiến bộ được.
              Không tiến bộ là thoái bộ. Xã hội càng đi tới, công việc càng nhiều, máy móc càng tinh
              xảo. Mình không chịu học thì lạc hậu, mà lạc hậu là bị đào thải, tự mình đào thải
              mình...”
            </blockquote>
            <cite className="mt-1.5 block font-mono text-[11px] text-[#3F6570] not-italic">
              — Chủ tịch Hồ Chí Minh
            </cite>
          </div>

          {/* Center Column: Desktop Monogram / Academic Vector Logo */}
          <div className="hidden flex-col items-center justify-center px-6 md:flex">
            <AcademicMonogramLogo />
          </div>

          {/* Right Column: Simplified Links */}
          <nav aria-label="Điều hướng chân trang" className="flex flex-col gap-2.5 md:items-end">
            <Link
              to={ROUTES.home}
              className="text-xs font-medium text-[#55676B] transition-colors hover:text-[#3F6570] md:text-sm"
            >
              Trang chủ
            </Link>
            <Link
              to={ROUTES.courses}
              className="text-xs font-medium text-[#55676B] transition-colors hover:text-[#3F6570] md:text-sm"
            >
              Tất cả môn học
            </Link>
            <Link
              to={ROUTES.glossary}
              className="text-xs font-medium text-[#55676B] transition-colors hover:text-[#3F6570] md:text-sm"
            >
              Thuật ngữ
            </Link>
          </nav>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#CFDADB] pt-4 font-mono text-xs text-[#55676B] sm:flex-row">
          <p>Learning Universe. Bản quyền mở.</p>
          <p>Không gian tri thức mở</p>
        </div>
      </Container>
    </footer>
  );
}
