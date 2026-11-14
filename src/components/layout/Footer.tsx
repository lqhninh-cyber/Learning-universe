import { useId } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Container } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

export interface FooterProps {
  readonly isDarkLesson?: boolean;
}

/**
 * Huy hiệu Hoa Sen 8 cánh & Sao Khuê Vàng Hoàng Kim tinh xảo (Imperial Gold Lotus–Khuê Star SVG)
 * thay thế logo lá xanh neon ở chân trang, đồng bộ mỹ thuật Bảo tàng & Hồ Sen Đêm.
 */
function ImperialGoldLotusEmblem() {
  const uid = useId().replace(/:/g, '');
  const goldGradId = `lu-footer-gold-${uid}`;
  const haloGradId = `lu-footer-halo-${uid}`;

  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315] as const;

  return (
    <div
      data-testid="footer-gold-lotus-emblem"
      className="relative flex h-14 w-14 items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* Vầng hào quang vàng ấm phía sau */}
      <span
        className="pointer-events-none absolute inset-[-10px] rounded-full opacity-75 blur-md"
        style={{
          background:
            'radial-gradient(circle, rgba(229, 193, 88, 0.36) 0%, rgba(201, 164, 92, 0.12) 55%, rgba(4, 14, 11, 0) 75%)',
        }}
      />

      <svg
        viewBox="0 0 80 80"
        className="relative h-14 w-14 motion-safe:animate-[spin_42s_linear_infinite]"
        fill="none"
      >
        <defs>
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6D383" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8892E" />
          </linearGradient>
          <radialGradient id={haloGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F3C978" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="40" cy="40" r="34" fill={`url(#${haloGradId})`} />

        {/* Vòng tròn quỹ đạo ngoại & 8 điểm sao Khuê */}
        <circle
          cx="40"
          cy="40"
          r="33"
          stroke={`url(#${goldGradId})`}
          strokeWidth="0.9"
          strokeOpacity="0.55"
          strokeDasharray="3 3"
        />
        <circle
          cx="40"
          cy="40"
          r="25"
          stroke={`url(#${goldGradId})`}
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* 8 cánh Hoa Sen Hoàng Kim */}
        {petalAngles.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 40 40)`}>
            <path
              d="M40 10 C43.5 18 44 26 40 31.5 C36 26 36.5 18 40 10 Z"
              fill={`url(#${goldGradId})`}
              fillOpacity="0.22"
              stroke={`url(#${goldGradId})`}
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <line
              x1="40"
              y1="14"
              x2="40"
              y2="29"
              stroke="#F6D383"
              strokeWidth="0.7"
              strokeOpacity="0.65"
            />
          </g>
        ))}

        {/* Ngôi sao 4 phương Khuê Văn ở tâm */}
        <path
          d="M40 28 L42.8 37.2 L52 40 L42.8 42.8 L40 52 L37.2 42.8 L28 40 L37.2 37.2 Z"
          fill={`url(#${goldGradId})`}
          fillOpacity="0.85"
          stroke="#FFF6DB"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="40" r="2.6" fill="#FFF6DB" />
      </svg>
    </div>
  );
}

export function Footer({ isDarkLesson }: FooterProps = {}) {
  const footerLinkClass = cn(
    'min-h-[44px] flex items-center px-2.5 text-[15px] font-medium whitespace-nowrap rounded-md',
    'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'hover:-translate-y-0.5 active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C158] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040E0B]',
    isDarkLesson ? 'text-[#94A3B8] hover:text-[#E5C158]' : 'text-[#D0DDD7] hover:text-[#E5C158]',
  );

  return (
    <footer
      style={
        {
          '--lake-deep': '#040E0B',
          '--lake-text': '#F7F3E8',
          '--lake-text-muted': '#D0DDD7',
          '--lake-accent': '#E5C158',
          '--lotus-rose': '#D9778D',
        } as React.CSSProperties
      }
      className={cn(
        'relative transition-colors duration-200',
        isDarkLesson
          ? 'border-t border-[#2A323A] bg-[#16191D] text-[#E2E8F0]'
          : 'bg-[linear-gradient(180deg,#040E0B_0%,#020806_100%)] text-[#F7F3E8]',
      )}
    >
      {/* Đường viền sáng mảnh vàng đồng ngăn cách dịu với Hồ Sen */}
      {!isDarkLesson && (
        <div
          aria-hidden="true"
          className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A45C]/50 to-transparent"
        />
      )}

      <Container size="wide" className="relative z-10 px-6 pt-7 pb-8 md:px-12 md:pb-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
          {/* Mobile Center Emblem */}
          <div className="flex justify-center md:hidden">
            <ImperialGoldLotusEmblem />
          </div>

          {/* Left Column: Branding & President Ho Chi Minh Quotation */}
          <div className="w-full max-w-[740px] md:w-[54%]">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  'font-serif text-[20px] font-bold tracking-wide transition-colors lg:text-[22px]',
                  isDarkLesson ? 'text-[#F8FAFC]' : 'text-[#F7F3E8]',
                )}
              >
                Learning Universe
              </span>
            </div>
            <blockquote
              className={cn(
                'max-w-[740px] font-serif text-[15.5px] leading-[1.8] italic transition-colors lg:text-[16.5px]',
                isDarkLesson ? 'text-[#CBD5E1]' : 'text-[#D0DDD7]',
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
                  isDarkLesson ? 'text-[#C89738]' : 'text-[#E5C158]',
                )}
              >
                — Chủ tịch Hồ Chí Minh
              </cite>
            </div>
          </div>

          {/* Center Column: Imperial Gold Lotus–Khuê Star SVG Emblem (Desktop) */}
          <div className="hidden shrink-0 items-center justify-center px-3 md:flex">
            <ImperialGoldLotusEmblem />
          </div>

          {/* Right Column: Navigation Links including Không gian học tập */}
          <nav
            aria-label="Điều hướng chân trang"
            className="flex flex-row flex-wrap items-center justify-center gap-1 md:justify-end md:gap-2"
          >
            <Link to={ROUTES.home} className={footerLinkClass}>
              Trang chủ
            </Link>
            <span className="text-[#C9A45C]/55 select-none" aria-hidden="true">
              ·
            </span>
            <Link to={ROUTES.learningSpace} className={footerLinkClass}>
              Không gian học tập
            </Link>
            <span className="text-[#C9A45C]/55 select-none" aria-hidden="true">
              ·
            </span>
            <Link to={ROUTES.courses} className={footerLinkClass}>
              Tất cả môn học
            </Link>
            <span className="text-[#C9A45C]/55 select-none" aria-hidden="true">
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
            isDarkLesson ? 'border-[#2A323A] text-[#94A3B8]' : 'border-[#C9A45C]/20 text-[#A8BCB2]',
          )}
        >
          <p>Learning Universe. Bản quyền mở.</p>
          <p>~Không gian tri thức mở~</p>
        </div>
      </Container>
    </footer>
  );
}
