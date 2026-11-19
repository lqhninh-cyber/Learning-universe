import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { type MouseEvent } from 'react';
import { Link } from 'react-router';
import { ChladniManifestoSection } from '@/components/home/ChladniManifestoSection';
import { HeritageExhibitionPavilion } from '@/components/home/HeritageExhibitionPavilion';
import { HeroPhysicsCanvas } from '@/components/home/HeroPhysicsCanvas';
import { HeroSonHaDiorama } from '@/components/home/HeroSonHaDiorama';
import { ShorelineWaveBridge } from '@/components/home/HomeScrollTransitions';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { RotatingScholarlyQuote } from './RotatingScholarlyQuote';

/**
 * TRANG CHỦ: 3 MÀN HÌNH BẠCH NGỌC KHOÁNG THẠCH LIỀN MẠCH
 * - Screen 1: Khởi Đầu Bình Minh Bạch Ngọc & Sơn Thủy Sương Lam 120fps (#EDF3F1)
 * - Screen 2: Phòng Trưng Bày Di Sản Bảo Tàng Thạch Cao Sáng (#EEF2F0 · #khong-gian-di-san)
 * - Screen 3: Tuyên Ngôn Học Thuật × Đài Cộng Hưởng Sóng Đứng Chladni 120fps (#F2F4F3)
 */
export function HomePage() {
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToHeritage = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('khong-gian-di-san');
    if (!target || typeof target.scrollIntoView !== 'function') return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="relative overflow-x-clip bg-[#EDF3F1] text-[#142622]">
      {/* =====================================================================
        SCREEN 1: HERO PANORAMA — BÌNH MINH BẠCH NGỌC & SƠN THỦY SƯƠNG LAM 120FPS
        ===================================================================== */}
      <section
        aria-label="Không gian Khởi đầu Learning Universe"
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#EDF3F1] pt-24 pb-10 md:pt-28 md:pb-14"
      >
        {/* LAYER 1: Bầu trời Sương Ngọc Ban Mai & lớp phủ bảo toàn độ tương phản AAA */}
        <HeroSonHaDiorama />

        {/* LAYER 2: Engine Sơn Thủy Khắc Đồng, Tia Nắng Ban Mai, Thiên Cầu Đông Sơn & Caustics 120fps */}
        <HeroPhysicsCanvas />

        {/* KHỐI NỘI DUNG NGANG TẦM MẮT: 2 CỘT CÂN ĐỐI, KHOẢNG THỞ THANH THOÁT */}
        <div className="lu-container-wide relative z-20 my-auto grid grid-cols-1 items-end gap-10 pt-8 pb-12 lg:grid-cols-12">
          {/* Cột Trái (7 cột): Thông điệp khai phóng & Cụm nút CTA */}
          <div className="space-y-6 lg:col-span-7">
            {/* Badge LEARNING UNIVERSE nền Bạch Ngọc Sứ */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CFDAD5] bg-[#FAFBF9]/90 px-3.5 py-1.5 text-[#28423C] shadow-xs backdrop-blur-md">
              <svg
                data-testid="dong-son-star-motif"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 text-[#8C6228]"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M12 3.5L13.6 9.4L19.5 7.5L14.8 11.4L20.5 12L14.8 12.6L19.5 16.5L13.6 14.6L12 20.5L10.4 14.6L4.5 16.5L9.2 12.6L3.5 12L9.2 11.4L4.5 7.5L10.4 9.4Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-mono text-xs font-semibold tracking-widest text-[#28423C] uppercase">
                LEARNING UNIVERSE
              </span>
            </div>

            {/* Tiêu đề chính & Tục ngữ nguồn gốc (WCAG AAA trên nền sáng) */}
            <div className="space-y-2.5">
              <h1 className="font-serif text-[clamp(2.45rem,4.1vw,4rem)] leading-[1.12] font-bold tracking-tight text-[#142622]">
                <span className="sr-only">LEARNING UNIVERSE — </span>
                <span className="block">Đi một ngày đàng,</span>{' '}
                <span className="mt-1 block font-serif text-[#8C6228] italic">
                  học một sàng khôn.
                </span>
              </h1>
              <p className="font-serif text-sm font-medium text-[#344B46] italic">
                — Tục ngữ Việt Nam
              </p>
            </div>

            {/* Khẩu hiệu dẫn nhập ngắn gọn */}
            <p className="max-w-xl text-base leading-relaxed font-medium text-[#344B46] sm:text-lg lg:text-[18.5px]">
              Không gian hỗ trợ Toán học và Khoa học Giáo dục, đồng hành cùng người học trên bước
              đường học tập.
            </p>

            {/* Nút Hành Động Chính + Nút Cuộn Xuống Bảo Tàng Di Sản */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3 pb-2">
              <Link
                to={ROUTES.learningSpace}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E332E] px-6 py-3 text-sm font-semibold text-[#FAFBF9] shadow-[0_10px_24px_rgba(30,51,46,0.18)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98]"
              >
                <span>Khám phá Không gian học tập</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <a
                href="#khong-gian-di-san"
                onClick={handleScrollToHeritage}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C6D4CF] bg-[#FAFBF9]/88 px-5 py-3 text-sm font-semibold text-[#182624] shadow-xs backdrop-blur-md transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#9C7A4C]/60 hover:bg-[#FAFBF9] active:scale-[0.98]"
              >
                <span>Thưởng lãm Di sản</span>
                <ArrowDown className="h-4 w-4 text-[#8C6228]" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Cột Phải (5 cột): Thẻ Danh ngôn học thuật kính sứ cao cấp */}
          <div className="lg:col-span-5 lg:mb-2">
            <RotatingScholarlyQuote variant="hero" />
          </div>
        </div>
      </section>

      {/* CẦU NỐI 1: Dải sương mặt hồ Bình Minh Bạch Ngọc (#B8CBC5 -> #EEF2F0) hòa tan êm ái vào Phòng Trưng Bày Di Sản (#EEF2F0) */}
      <ShorelineWaveBridge variant="pavilion" bottomColor="#EEF2F0" />

      {/* =====================================================================
        SCREEN 2: PHÒNG TRƯNG BÀY DI SẢN BẢO TÀNG THẠCH CAO SÁNG (#EEF2F0 · #khong-gian-di-san)
        ===================================================================== */}
      <HeritageExhibitionPavilion />

      {/* =====================================================================
        SCREEN 3: TUYÊN NGÔN HỌC THUẬT × ĐÀI CỘNG HƯỞNG SÓNG ĐỨNG CHLADNI 120FPS (#F2F4F3)
        ===================================================================== */}
      <ChladniManifestoSection />
    </div>
  );
}

export default HomePage;
