import { ArrowRight, BookMarked, Clock, Compass, GraduationCap, Play, Sigma } from 'lucide-react';
import { type FC, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import type { VisualDirection } from './types';

export interface PreviewHomepageViewProps {
  readonly direction: VisualDirection;
  readonly onNavigateToCourse: (slug: string) => void;
  readonly motionEnabled: boolean;
}

export const PreviewHomepageView: FC<PreviewHomepageViewProps> = ({
  direction,
  onNavigateToCourse,
  motionEnabled,
}) => {
  const [hoveredPortalCard, setHoveredPortalCard] = useState<string | null>(null);

  return (
    <div className="space-y-16 pt-24 pb-24 sm:pt-28">
      {/* =========================================================================
          1. EDITORIAL ASYMMETRIC HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden">
        {/* Họa tiết nền theo hướng thiết kế */}
        {direction === 'atelier' && (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />
        )}
        {direction === 'spatial' && (
          <div
            className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl"
            aria-hidden="true"
          />
        )}

        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* CỘT TRÁI (Hero Text - 7 Cols): Bố cục Editorial bất đối xứng */}
            <div className="space-y-6 lg:col-span-7">
              {/* Badge học thuật */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-50/80 px-3.5 py-1 text-xs font-semibold text-amber-950 shadow-2xs">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-600" />
                <span>Nền tảng Sư phạm Toán học &amp; Nghiệp vụ Giáo dục Đại học</span>
              </div>

              {/* Tiêu đề phân cấp Serif mạnh mẽ */}
              <h1
                className={cn(
                  'text-4xl leading-[1.12] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl',
                  direction === 'atelier' && 'font-sans font-extrabold',
                  direction === 'spatial' && 'font-serif font-bold text-stone-900',
                  direction === 'editorial' &&
                    'font-serif font-bold tracking-normal text-stone-900 italic',
                )}
              >
                Nơi vẻ đẹp <span className="text-amber-900 not-italic">Toán học</span> giao hòa cùng{' '}
                <span className="text-teal-900 not-italic">Nghệ thuật Sư phạm</span>.
              </h1>

              {/* Lời dẫn dắt học thuật */}
              <p className="max-w-2xl text-base leading-relaxed text-stone-700 sm:text-lg sm:leading-relaxed">
                Được số hóa hoàn toàn từ giáo trình chuẩn mực của Trường ĐH Sư phạm TP.HCM (HCMUE)
                và Chương trình GDPT 2018. Kết hợp giữa lý luận đại số chặt chẽ, mô hình hình học
                tương tác 2D và cẩm nang xử lý tình huống sư phạm thực chiến.
              </p>

              {/* Cụm CTA kép */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToCourse('giai-tich-ham-mot-bien')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all',
                    motionEnabled &&
                      'hover:-translate-y-0.5 hover:bg-amber-950 hover:shadow-lg active:scale-95',
                  )}
                >
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>Khám phá 2 Không gian</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToCourse('giao-duc-hoc')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 bg-white/90 px-4 py-3 text-sm font-semibold text-stone-800 shadow-2xs transition-all',
                    motionEnabled &&
                      'hover:-translate-y-0.5 hover:border-stone-400 hover:bg-stone-50 active:scale-95',
                  )}
                >
                  <Play className="h-3.5 w-3.5 text-teal-800" aria-hidden="true" />
                  <span>Tiếp tục học dở</span>
                </button>
              </div>

              {/* Thông số nhanh nền tảng */}
              <div className="flex flex-wrap items-center gap-6 border-t border-stone-200/80 pt-6 text-xs text-stone-600 sm:gap-8">
                <div>
                  <span className="font-mono text-base font-bold text-stone-900 sm:text-lg">
                    103
                  </span>
                  <p className="text-[11px] text-stone-500">Bài học chuẩn hóa</p>
                </div>
                <div className="h-6 w-px bg-stone-300/60" aria-hidden="true" />
                <div>
                  <span className="font-mono text-base font-bold text-stone-900 sm:text-lg">
                    04
                  </span>
                  <p className="text-[11px] text-stone-500">Học phần Cử nhân</p>
                </div>
                <div className="h-6 w-px bg-stone-300/60" aria-hidden="true" />
                <div>
                  <span className="font-mono text-base font-bold text-stone-900 sm:text-lg">
                    14
                  </span>
                  <p className="text-[11px] text-stone-500">Tài liệu &amp; Văn bản số</p>
                </div>
                <div className="h-6 w-px bg-stone-300/60" aria-hidden="true" />
                <div>
                  <span className="font-mono text-base font-bold text-emerald-800 sm:text-lg">
                    100%
                  </span>
                  <p className="text-[11px] text-stone-500">Nguồn sự thật Git</p>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (Hero Floating 2.5D Cluster - 5 Cols): Cụm thẻ nổi đa tầng */}
            <div className="space-y-4 lg:col-span-5">
              {/* Thẻ 1: Đang học dở (Tiến độ sống động) */}
              <div
                className={cn(
                  'rounded-2xl border p-5 transition-all duration-300',
                  direction === 'atelier' && 'border-stone-300 bg-white shadow-xs',
                  direction === 'spatial' &&
                    'border-white/80 bg-white/85 p-5.5 shadow-xl ring-1 shadow-stone-900/5 ring-stone-900/5 backdrop-blur-xl hover:-translate-y-1',
                  direction === 'editorial' && 'border-amber-900/20 bg-[#faf8f2] shadow-sm',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                    <Play className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>Bài học gần nhất</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-900">Tiến độ 68%</span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-medium text-stone-500">
                    Giải tích hàm một biến · Chương 3
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 sm:text-base">
                    Bài 3.2: Dãy hội tụ &amp; Nguyên lý Bolzano-Weierstrass
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-800 transition-all duration-500"
                    style={{ width: '68%' }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>Còn ~15 phút đọc</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateToCourse('giai-tich-ham-mot-bien')}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
                  >
                    <span>Tiếp tục ngay</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Thẻ 2: Tra cứu tức thời 2.5D (KaTeX & Pháp quy) */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-2xl border p-4 transition-all duration-300',
                  direction === 'atelier' && 'border-stone-300 bg-white/95 shadow-2xs',
                  direction === 'spatial' &&
                    'border-white/70 bg-white/80 shadow-md backdrop-blur-lg hover:-translate-y-1 hover:shadow-lg',
                  direction === 'editorial' && 'border-stone-300/70 bg-[#fbf9f4]',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-900">
                    <BookMarked className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 sm:text-sm">
                      Tra cứu Thuật ngữ &amp; Ký hiệu
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      68 thuật ngữ KaTeX và Ma trận Chuẩn nghề nghiệp GVPT
                    </p>
                  </div>
                </div>
                <Link
                  to="/thuat-ngu"
                  className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900"
                  title="Mở bảng tra cứu thuật ngữ"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DUAL SPATIAL PORTALS (ASYMMETRIC BENTO GRID)
          ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-900 uppercase">
              <span>Kiến trúc Không gian Học thuật</span>
              <span className="h-1 w-1 rounded-full bg-amber-900" />
              <span>Dual Spatial Portals</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Hai Cổng Học Tập Với Bản Sắc Thị Giác Riêng Biệt
            </h2>
          </div>
          <p className="max-w-md text-xs text-stone-600">
            Chuyển động nâng thẻ (Hover Elevation) và hé lộ danh sách chương học khi tương tác.
          </p>
        </div>

        {/* Bento Grid: 2 Cổng đối trọng */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* =====================================================================
              CỔNG 1: KHỐI TOÁN HỌC (Geometric, Structured, Precise) - 7 Cols
              ===================================================================== */}
          <div
            className={cn(
              'rounded-3xl border p-6 transition-all duration-300 sm:p-8 lg:col-span-7',
              direction === 'atelier' && 'border-stone-300 bg-white/95 shadow-xs',
              direction === 'spatial' &&
                'border-white/80 bg-gradient-to-br from-white/90 via-amber-50/20 to-white/80 shadow-xl ring-1 ring-stone-900/5 backdrop-blur-xl',
              direction === 'editorial' && 'border-stone-300 bg-[#faf8f2] shadow-sm',
            )}
          >
            {/* Header Portal Toán */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/10 px-3 py-1 text-xs font-bold text-amber-950">
                  <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Khối 1: Toán học Đại học</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                  Cấu trúc Đại số, Hình học Affine &amp; Giải tích
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-amber-900/80">3 Môn · 83 Bài</span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-stone-600 sm:text-sm">
              Ngôn ngữ thị giác hình học kỷ luật cao. Tích hợp KaTeX công thức toán, phòng thí
              nghiệm hình học 2D Mafs và ngân hàng 6 bộ đề thi đại học chính thức.
            </p>

            {/* Danh sách 3 Thẻ môn học với Hover Elevation & Reveal */}
            <div className="mt-6 space-y-3.5">
              {/* Thẻ 1: Cấu trúc đại số */}
              <div
                onMouseEnter={() => setHoveredPortalCard('ctds')}
                onMouseLeave={() => setHoveredPortalCard(null)}
                onClick={() => onNavigateToCourse('giai-tich-ham-mot-bien')}
                className={cn(
                  'group cursor-pointer rounded-2xl border p-4.5 transition-all duration-300 sm:p-5',
                  hoveredPortalCard === 'ctds'
                    ? '-translate-y-1.5 border-amber-800 bg-amber-50/50 shadow-md'
                    : 'border-stone-200/90 bg-white shadow-2xs hover:border-amber-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                      Học phần 1
                    </span>
                    <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-950">
                      Cấu trúc đại số
                    </h4>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    8 Chương
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                  Nửa nhóm, Nhóm, Vành, Miền nguyên, Trường và Định lý đồng cấu.
                </p>

                {/* Hover Reveal: Hé lộ chương học */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    hoveredPortalCard === 'ctds'
                      ? 'mt-3 max-h-24 border-t border-amber-900/15 pt-3 opacity-100'
                      : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Ch.1 Nửa nhóm
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Ch.2 Định lý Lagrange
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Ch.3 Nhóm cyclic
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Ch.4 Đồng cấu và Vành
                    </span>
                  </div>
                </div>
              </div>

              {/* Thẻ 2: Hình học Affine & Euclide */}
              <div
                onMouseEnter={() => setHoveredPortalCard('affine')}
                onMouseLeave={() => setHoveredPortalCard(null)}
                onClick={() => onNavigateToCourse('giai-tich-ham-mot-bien')}
                className={cn(
                  'group cursor-pointer rounded-2xl border p-4.5 transition-all duration-300 sm:p-5',
                  hoveredPortalCard === 'affine'
                    ? '-translate-y-1.5 border-amber-800 bg-amber-50/50 shadow-md'
                    : 'border-stone-200/90 bg-white shadow-2xs hover:border-amber-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                      Học phần 2
                    </span>
                    <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-950">
                      Hình học Affine và Euclide
                    </h4>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    Lab 2D Mafs
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                  Mô hình không gian afin, ánh xạ afin, trọng tâm và siêu mặt bậc hai.
                </p>

                {/* Hover Reveal */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    hoveredPortalCard === 'affine'
                      ? 'mt-3 max-h-24 border-t border-amber-900/15 pt-3 opacity-100'
                      : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Phòng thí nghiệm Mafs
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Kéo thả vector
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Hình bình hành tương tác
                    </span>
                  </div>
                </div>
              </div>

              {/* Thẻ 3: Giải tích hàm một biến */}
              <div
                onMouseEnter={() => setHoveredPortalCard('calculus')}
                onMouseLeave={() => setHoveredPortalCard(null)}
                onClick={() => onNavigateToCourse('giai-tich-ham-mot-bien')}
                className={cn(
                  'group cursor-pointer rounded-2xl border p-4.5 transition-all duration-300 sm:p-5',
                  hoveredPortalCard === 'calculus'
                    ? '-translate-y-1.5 border-amber-800 bg-amber-50/50 shadow-md'
                    : 'border-stone-200/90 bg-white shadow-2xs hover:border-amber-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                      Học phần 3 · Trọng tâm
                    </span>
                    <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-950">
                      Giải tích hàm một biến
                    </h4>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                    6 Đề thi có giải
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                  Số thực, Dãy số, Giới hạn hàm số, Đạo hàm, Tích phân Riemann và Chuỗi số.
                </p>

                {/* Hover Reveal */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    hoveredPortalCard === 'calculus'
                      ? 'mt-3 max-h-24 border-t border-amber-900/15 pt-3 opacity-100'
                      : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Đề thi 2025-2026 (HK1)
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Ảnh đề gốc
                    </span>
                    <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                      Lời giải chi tiết
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              CỔNG 2: KHỐI KHOA HỌC GIÁO DỤC (Editorial, Human-centered) - 5 Cols
              ===================================================================== */}
          <div
            className={cn(
              'flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 sm:p-8 lg:col-span-5',
              direction === 'atelier' && 'border-stone-300 bg-white/95 shadow-xs',
              direction === 'spatial' &&
                'border-white/80 bg-gradient-to-br from-white/90 via-teal-50/25 to-white/80 shadow-xl ring-1 ring-stone-900/5 backdrop-blur-xl',
              direction === 'editorial' && 'border-stone-300 bg-[#faf8f2] shadow-sm',
            )}
          >
            <div>
              {/* Header Portal Sư phạm */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-900/10 px-3 py-1 text-xs font-bold text-teal-950">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Khối 2: Khoa học GD &amp; Sư phạm</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                    Giáo dục học &amp; Nghiệp vụ Sư phạm
                  </h3>
                </div>
                <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-900">
                  Mới
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-stone-600 sm:text-sm">
                Ngôn ngữ thị giác Editorial, Human-centered, Warm, Layered. Bố cục trang sách mở,
                sắc Slate Teal và Terracotta ấm áp.
              </p>

              {/* Thẻ môn học Giáo dục học */}
              <div
                onClick={() => onNavigateToCourse('giao-duc-hoc')}
                className="group mt-6 cursor-pointer rounded-2xl border border-teal-200/80 bg-white p-5 shadow-2xs transition-all hover:-translate-y-1 hover:border-teal-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-teal-800 uppercase">
                    Khoa học Giáo dục
                  </span>
                </div>
                <h4 className="mt-1 text-base font-bold text-stone-900 group-hover:text-teal-950">
                  Giáo dục học
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  Bản chất giáo dục, 6 nguyên tắc giáo dục học sinh, nghiệp vụ GVCN và hoạt động
                  trải nghiệm.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-2">
                    <span className="block font-bold text-stone-900">20 Tình huống</span>
                    <span className="text-[10px] text-stone-500">Cẩm nang thực tế</span>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-2">
                    <span className="block font-bold text-stone-900">14 Tài liệu</span>
                    <span className="text-[10px] text-stone-500">Pháp quy chuẩn</span>
                  </div>
                </div>
              </div>

              {/* Danh ngôn sư phạm đính kèm */}
              <div className="mt-5 rounded-2xl border-l-4 border-amber-800/70 bg-amber-50/60 p-4">
                <p className="font-serif text-xs leading-relaxed text-stone-800 italic sm:text-[13px]">
                  &ldquo;Dưới ánh mặt trời, không có nghề nào cao quý hơn nghề dạy học.&rdquo;
                </p>
                <span className="mt-1 block text-[11px] font-semibold text-amber-950">
                  — J.A. Comenius (1592 – 1670)
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-stone-200/80 pt-4">
              <button
                type="button"
                onClick={() => onNavigateToCourse('giao-duc-hoc')}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-teal-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-teal-950"
              >
                <span>Vào học phần Giáo dục học</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
