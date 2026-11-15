import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { type AtmosphericPhase } from '@/components/home/atmosphereThemes';
import { AtmosphericTimeDial } from '@/components/home/AtmosphericTimeDial';
import { HeritageExhibitionPavilion } from '@/components/home/HeritageExhibitionPavilion';
import { HeroPhysicsCanvas } from '@/components/home/HeroPhysicsCanvas';
import { HeroSonHaDiorama } from '@/components/home/HeroSonHaDiorama';
import {
  LakeshoreLotusTransition,
  ShorelineWaveBridge,
} from '@/components/home/HomeScrollTransitions';
import { ROUTES } from '@/shared/config/routes';
import { GrandLotusLake } from './GrandLotusLake';
import { RotatingScholarlyQuote } from './RotatingScholarlyQuote';

/**
 * TRANG CHỦ: 3 MÀN HÌNH CHUYÊN BIỆT KHÔNG CHE KHUẤT
 * - Screen 1: Khởi Đầu Thiên Nhiên & Khí Quyển Hoàng Liên Sơn 3D 120fps (Panoramic Unobstructed Hero)
 * - Screen 2: Phòng Trưng Bày Di Sản Bảo Tàng (#khong-gian-di-san)
 * - Screen 3: Đại Cảnh Hồ Sen Tri Thức (#khong-gian-ho-sen)
 */
export function HomePage() {
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [atmosphericPhase, setAtmosphericPhase] = useState<AtmosphericPhase>('dem-ngan-ha');

  // Theo dõi tiến trình cuộn trang cho Đại cảnh Hồ Sen Tri Thức ở Screen 3
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let rafId = 0;
    const updateScroll = () => {
      rafId = 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        window.innerHeight,
        1,
      );
      const ratio = Math.min(1, Math.max(0, window.scrollY / docHeight));
      setPageScrollProgress(ratio);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="relative overflow-x-clip bg-[#060C18] text-[#F7F3E8]">
      {/* =====================================================================
        SCREEN 1: HERO PANORAMA — HOÀNG LIÊN SƠN 3D 120FPS (LAM NGỌC & HOÀNG KIM)
        ===================================================================== */}
      <section
        aria-label="Không gian Khởi đầu Learning Universe"
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#060C18] pt-24 pb-6 md:pt-28 md:pb-8"
      >
        {/* LAYER 1: Khối núi 3D đa diện Hoàng Liên Sơn, Camera bay xuyên 3D & 4 thời khắc */}
        <HeroSonHaDiorama phase={atmosphericPhase} />

        {/* LAYER 2: Engine Khí Quyển 3D 120fps (Tia sáng, Chim Lạc ánh sao, Cực quang gảy dây & Đèn Trời 3D) */}
        <HeroPhysicsCanvas phase={atmosphericPhase} />

        {/* KHỐI NỘI DUNG NGANG TẦM MẮT: 2 CỘT CÂN ĐỐI GIẢI PHÓNG HOÀN TOÀN THÁC NƯỚC, RUỘNG BẬC THANG & BIỂN MÂY */}
        <div className="lu-container-wide relative z-20 my-auto grid grid-cols-1 items-end gap-8 pt-6 pb-10 lg:grid-cols-12">
          {/* Cột Trái (7 cột): Thông điệp khai phóng & La bàn 4 thời khắc */}
          <div className="space-y-5 lg:col-span-7">
            {/* Badge LEARNING UNIVERSE với Ngôi sao Trống Đồng Đông Sơn */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5C158]/30 bg-[#081520]/65 px-3.5 py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <svg
                data-testid="dong-son-star-motif"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 text-[#E5C158]"
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
              <span className="font-mono text-xs tracking-widest text-[#E5C158] uppercase">
                LEARNING UNIVERSE
              </span>
            </div>

            {/* Tiêu đề chính & Tục ngữ nguồn gốc */}
            <div className="space-y-2">
              <h1 className="font-serif text-[clamp(2.45rem,4vw,3.9rem)] leading-[1.12] font-bold tracking-tight text-[#FFF9F0]">
                <span className="sr-only">LEARNING UNIVERSE — </span>
                <span className="block">Đi một ngày đàng,</span>{' '}
                <span className="mt-1 block bg-gradient-to-r from-[#E5C158] via-[#F6D383] to-[#4EA8DE] bg-clip-text font-serif text-transparent italic">
                  học một sàng khôn.
                </span>
              </h1>
              <p className="font-serif text-sm text-[#E5C158] italic">— Tục ngữ Việt Nam</p>
            </div>

            {/* Khẩu hiệu dẫn nhập ngắn gọn */}
            <p className="max-w-xl text-base leading-relaxed text-[#E7EEF0] sm:text-lg lg:text-[18.5px]">
              Không gian hỗ trợ Toán học và Khoa học Giáo dục, đồng hành cùng người học trên bước
              đường học tập.
            </p>

            {/* Nút Hành Động Chính + Nút Cuộn Xuống Bảo Tàng Di Sản */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={ROUTES.learningSpace}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C99B3B] via-[#E5C158] to-[#D4A359] px-6 py-3 text-sm font-semibold text-[#060C18] shadow-[0_14px_34px_rgba(229,193,88,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98]"
              >
                <span>Khám phá Không gian học tập</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <a
                href="#khong-gian-di-san"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5C158]/30 bg-[#081520]/65 px-5 py-3 text-sm font-medium text-[#F7F3E8] shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E5C158]/70 hover:bg-[#0D2130]/80 active:scale-[0.98]"
              >
                <span>Thưởng lãm Di sản</span>
                <ArrowDown className="h-4 w-4 text-[#E5C158]" aria-hidden="true" />
              </a>
            </div>

            {/* La bàn 4 Thời khắc Khí quyển đặt ngay bên dưới khối CTA */}
            <div className="mt-6 pt-2">
              <AtmosphericTimeDial
                activePhase={atmosphericPhase}
                onChangePhase={setAtmosphericPhase}
              />
            </div>
          </div>

          {/* Cột Phải (5 cột): Thẻ Danh ngôn học thuật nâng cao ngang tầm khu vực CTA */}
          <div className="lg:col-span-5 lg:mb-2">
            <RotatingScholarlyQuote variant="hero" />
          </div>
        </div>
      </section>

      {/* CẦU NỐI 1: Biển mây Hoàng Liên Sơn hòa tan êm ái vào Phòng Trưng Bày Di Sản (#121B28) */}
      <ShorelineWaveBridge variant="pavilion" bottomColor="#121B28" />

      {/* =====================================================================
        SCREEN 2: PHÒNG TRƯNG BÀY DI SẢN BẢO TÀNG (#khong-gian-di-san)
        ===================================================================== */}
      <HeritageExhibitionPavilion />

      {/* CẦU NỐI 2: Dải chạng vạng bờ hồ & ánh vàng phản chiếu nối Screen 2 (#081A15) -> Hồ Sen (#061510) */}
      <LakeshoreLotusTransition />

      {/* =====================================================================
        SCREEN 3: ĐẠI CẢNH HỒ SEN TRI THỨC (#061510 -> #040E0B)
        ===================================================================== */}
      <GrandLotusLake pageScrollProgress={pageScrollProgress} />
    </div>
  );
}

export default HomePage;
