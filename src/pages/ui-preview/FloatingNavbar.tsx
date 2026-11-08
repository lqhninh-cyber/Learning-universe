import { ArrowRight, ChevronDown, Compass, GraduationCap, Search, Sigma } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import type { VisualDirection } from './types';

export interface FloatingNavbarProps {
  readonly direction: VisualDirection;
  readonly onSelectCourse?: (slug: string) => void;
  readonly className?: string;
}

export const FloatingNavbar: FC<FloatingNavbarProps> = ({
  direction,
  onSelectCourse,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<'math' | 'pedagogy'>('math');
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Lắng nghe hướng cuộn trang: Cuộn xuống thì ẩn, cuộn lên thì hiện
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 10) {
          setIsVisible(false);
          setIsMegaMenuOpen(false);
        } else if (lastScrollY - currentScrollY > 10) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Đóng Mega menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-4 right-4 left-4 z-40 mx-auto max-w-[1360px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isVisible ? 'translate-y-0' : '-translate-y-28',
        className,
      )}
    >
      <div
        ref={megaMenuRef}
        className={cn(
          'relative rounded-2xl border px-3.5 py-2.5 transition-all duration-300 sm:rounded-full sm:px-6',
          direction === 'atelier' && 'border-stone-300/90 bg-white/95 shadow-sm',
          direction === 'spatial' &&
            'border-white/70 bg-white/80 shadow-xl ring-1 shadow-stone-900/5 ring-stone-900/5 backdrop-blur-xl',
          direction === 'editorial' && 'border-stone-300/80 bg-[#fdfbf7]/95 shadow-md',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-stone-900 transition-opacity hover:opacity-85"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-900 text-white shadow-2xs sm:h-9 sm:w-9">
                <span className="font-serif text-base font-bold">LU</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-sm font-bold tracking-tight text-stone-900 sm:text-base">
                  Learning Universe
                </span>
                <span className="text-[10px] font-medium tracking-wider text-amber-900/80 uppercase">
                  Sư phạm Toán &amp; Giáo dục
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links with Mega Menu Portal */}
          <nav aria-label="Điều hướng chính" className="hidden md:flex md:items-center md:gap-1.5">
            <Link
              to="/"
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              Trang chủ
            </Link>

            {/* Nút mở Mega Menu: Hai Không Gian Học Tập */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                aria-expanded={isMegaMenuOpen}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                  isMegaMenuOpen
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'text-stone-800 hover:bg-stone-100/90',
                )}
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Không gian học tập</span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-200',
                    isMegaMenuOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

            <Link
              to="/courses"
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              Tất cả môn học
            </Link>

            <Link
              to="/thuat-ngu"
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              Thuật ngữ
            </Link>
          </nav>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-stone-200/90 bg-stone-50/80 px-2.5 py-1 text-[11px] text-stone-600 sm:inline-flex">
              <Search className="h-3 w-3 text-stone-400" aria-hidden="true" />
              <span>Tìm kiếm</span>
              <kbd className="ml-1 rounded border border-stone-200 bg-white px-1 font-mono text-[9px] text-stone-500">
                ⌘K
              </kbd>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/20 bg-amber-50/80 px-2.5 py-1 text-xs font-medium text-amber-950">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">Học viên Sư phạm</span>
              <span className="sm:hidden">Sư phạm</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MEGA MENU: HAI KHÔNG GIAN HỌC THUẬT (DUAL SPATIAL PORTALS)
            ========================================================================= */}
        {isMegaMenuOpen && (
          <div
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className={cn(
              'animate-in fade-in zoom-in-95 slide-in-from-top-2 absolute top-full right-0 left-0 mt-3 rounded-3xl border p-5 shadow-2xl transition-all duration-300 sm:p-7',
              direction === 'atelier' && 'border-stone-300 bg-white/98 ring-1 ring-stone-900/5',
              direction === 'spatial' &&
                'border-white/80 bg-white/90 shadow-2xl ring-1 shadow-stone-900/10 ring-white/60 backdrop-blur-2xl',
              direction === 'editorial' && 'border-stone-300 bg-[#fbf9f4] shadow-xl',
            )}
          >
            {/* Header của Mega Menu với Animated Navigation Indicator */}
            <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Cổng Không Gian Học Thuật (Dual Spatial Portals)
                </h3>
                <p className="text-xs text-stone-600">
                  Khám phá chương trình đào tạo Cử nhân Sư phạm Toán học &amp; Nghiệp vụ Sư phạm
                  chuẩn quốc gia.
                </p>
              </div>

              {/* Animated Navigation Indicator Switcher */}
              <div
                className="inline-flex self-start rounded-full border border-stone-200 bg-stone-100/90 p-1 sm:self-auto"
                role="tablist"
                aria-label="Chọn không gian học thuật"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePortalTab === 'math'}
                  onClick={() => setActivePortalTab('math')}
                  className={cn(
                    'relative cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold transition-all',
                    activePortalTab === 'math'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Khối Toán học</span>
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activePortalTab === 'pedagogy'}
                  onClick={() => setActivePortalTab('pedagogy')}
                  className={cn(
                    'relative cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold transition-all',
                    activePortalTab === 'pedagogy'
                      ? 'bg-teal-900 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Khối Khoa học Giáo dục</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Nội dung Mega Menu: 2 Không gian đối trọng */}
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* KHÔNG GIAN 1: KHỐI TOÁN HỌC (Geometric & Structured) */}
              <div
                className={cn(
                  'flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-200 sm:p-5',
                  activePortalTab === 'math'
                    ? 'border-amber-900/30 bg-amber-50/40 ring-1 ring-amber-900/10'
                    : 'border-stone-200/70 bg-stone-50/50 opacity-90 hover:opacity-100',
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 uppercase">
                      <Sigma className="h-3 w-3" aria-hidden="true" />
                      <span>Khối 1: Toán học Đại học</span>
                    </span>
                    <span className="font-mono text-xs font-semibold text-stone-500">
                      3 Học phần
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-stone-600">
                    Ngôn ngữ thị giác Geometric, Structured, Precise. Trực quan hóa công thức KaTeX,
                    chứng minh định lý và phòng thí nghiệm Mafs 2D.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
                    {/* Môn 1 */}
                    <div
                      onClick={() => {
                        onSelectCourse?.('cau-truc-dai-so');
                        setIsMegaMenuOpen(false);
                      }}
                      className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-3 shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-amber-800">8 Chương</span>
                      <h4 className="mt-0.5 text-xs font-bold text-stone-900 group-hover:text-amber-900">
                        Cấu trúc đại số
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[10px] text-stone-500">
                        Nhóm, Vành, Trường và Đồng cấu đại số.
                      </p>
                    </div>

                    {/* Môn 2 */}
                    <div
                      onClick={() => {
                        onSelectCourse?.('hinh-hoc-affine');
                        setIsMegaMenuOpen(false);
                      }}
                      className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-3 shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-amber-800">Lab 2D Mafs</span>
                      <h4 className="mt-0.5 text-xs font-bold text-stone-900 group-hover:text-amber-900">
                        Hình học Affine
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[10px] text-stone-500">
                        Không gian afin, Euclide &amp; mô hình xạ ảnh.
                      </p>
                    </div>

                    {/* Môn 3 */}
                    <div
                      onClick={() => {
                        onSelectCourse?.('giai-tich-ham-mot-bien');
                        setIsMegaMenuOpen(false);
                      }}
                      className="group cursor-pointer rounded-xl border border-amber-300/80 bg-white p-3 shadow-2xs transition-all hover:border-amber-500 hover:shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-amber-800">6 Bộ đề thi</span>
                      <h4 className="mt-0.5 text-xs font-bold text-stone-900 group-hover:text-amber-900">
                        Giải tích 1
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[10px] text-stone-500">
                        Dãy số, chuỗi hàm, vi tích phân Riemann.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-amber-900/10 pt-3 text-xs">
                  <span className="text-[11px] font-medium text-stone-600">
                    Ngân hàng 6 đề thi có lời giải mẫu
                  </span>
                  <Link
                    to="/courses"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="flex items-center gap-1 font-bold text-amber-900 hover:underline"
                  >
                    <span>Vào không gian Toán</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* KHÔNG GIAN 2: KHOA HỌC GIÁO DỤC (Editorial & Human-centered Layered) */}
              <div
                className={cn(
                  'flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-200 sm:p-5',
                  activePortalTab === 'pedagogy'
                    ? 'border-teal-900/30 bg-teal-50/40 ring-1 ring-teal-900/10'
                    : 'border-stone-200/70 bg-stone-50/50 opacity-90 hover:opacity-100',
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-900 uppercase">
                      <GraduationCap className="h-3 w-3" aria-hidden="true" />
                      <span>Khối 2: Khoa học GD &amp; Sư phạm</span>
                    </span>
                    <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                      Chương trình mới
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-stone-600">
                    Ngôn ngữ thị giác Editorial, Human-centered, Warm, Layered. Bám sát Giáo trình
                    HCMUE, Thông tư 20 chuẩn nghề nghiệp và 14 văn bản pháp quy.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
                    {/* Học phần Giáo dục học */}
                    <div
                      onClick={() => {
                        onSelectCourse?.('giao-duc-hoc');
                        setIsMegaMenuOpen(false);
                      }}
                      className="group cursor-pointer rounded-xl border border-teal-200/80 bg-white p-3 shadow-2xs transition-all hover:border-teal-400 hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-800">
                          Học phần EDUC2802
                        </span>
                        <span className="text-[10px] text-stone-500">04 Tín chỉ</span>
                      </div>
                      <h4 className="mt-1 text-xs font-bold text-stone-900 group-hover:text-teal-900">
                        Giáo dục học
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[10px] text-stone-500">
                        Lao động sư phạm, nguyên tắc giáo dục &amp; công tác GVCN lớp.
                      </p>
                    </div>

                    {/* Cẩm nang tình huống */}
                    <div
                      onClick={() => {
                        onSelectCourse?.('giao-duc-hoc');
                        setIsMegaMenuOpen(false);
                      }}
                      className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-3 shadow-2xs transition-all hover:border-teal-400 hover:shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-teal-800">Thực hành sư phạm</span>
                      <h4 className="mt-1 text-xs font-bold text-stone-900 group-hover:text-teal-900">
                        Ngân hàng 20 tình huống
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[10px] text-stone-500">
                        Quy trình 5 bước giải quyết, bẫy sai lầm &amp; 14 tài liệu PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-teal-900/10 pt-3 text-xs">
                  <span className="text-[11px] font-medium text-stone-600">
                    Bao gồm 14 văn bản pháp quy sư phạm
                  </span>
                  <Link
                    to="/courses"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="flex items-center gap-1 font-bold text-teal-900 hover:underline"
                  >
                    <span>Vào không gian Sư phạm</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
