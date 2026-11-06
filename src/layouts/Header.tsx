import {
  ArrowRight,
  ChevronDown,
  Clock,
  Compass,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  Sigma,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { ReadingProgressBar } from '@/features/lesson-reader/ReadingProgressBar';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Button, Drawer } from '@/shared/ui';

export interface HeaderProps {
  readonly className?: string;
}

export const Header: FC<HeaderProps> = ({ className }) => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isPending,
    isApprovedStudent,
    openAuthModal,
    openPendingNotice,
    signOut,
  } = useAuth();

  const isStoreAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Đóng mega menu và drawer khi chuyển trang
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
  }

  // Thanh điều hướng luôn dính trên cùng (sticky) với nền kính mờ; nội dung bài đọc lướt qua phía sau.
  // Ở Chế độ tập trung, việc ẩn Header do CSS `body[data-focus-mode='true'] header.sticky` đảm nhận.

  // Đóng Mega menu khi nhấp bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    signOutLearnerMode();
    await signOut();
  };

  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;

  return (
    <header
      className={cn(
        'lu-site-header sticky top-0 z-40 w-full border-b border-stone-200/60 bg-[#FDFBF7]/85 backdrop-blur-md transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] supports-[backdrop-filter]:bg-[#FDFBF7]/75 print:hidden',
        className,
      )}
    >
      <div ref={megaMenuRef} className="relative mx-auto w-full max-w-6xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Button */}
            <div className="md:hidden">
              <Drawer
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
                side="left"
                title="Điều hướng Learning Universe"
                trigger={
                  <Button variant="ghost" size="icon" aria-label="Mở menu điều hướng">
                    <Menu className="h-5 w-5 text-stone-700" aria-hidden="true" />
                  </Button>
                }
              >
                <nav aria-label="Menu điều hướng di động" className="space-y-4">
                  <div className="space-y-1">
                    <Link
                      to={ROUTES.home}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-100"
                    >
                      Trang chủ
                    </Link>
                  </div>

                  {/* Phân tầng Khối 1: Toán học */}
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-900 uppercase">
                        <Sigma className="h-3.5 w-3.5" />
                        <span>Khối Toán học</span>
                      </span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        3 môn
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Link
                        to={ROUTES.subjectOverview('cau-truc-dai-so')}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Cấu trúc đại số"
                        className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-white"
                      >
                        <div className="font-semibold text-stone-900">Cấu trúc đại số</div>
                        <div className="text-[11px] text-stone-500">
                          Nhóm, Vành, Trường &amp; Tiên đề
                        </div>
                      </Link>
                      <Link
                        to={ROUTES.subjectOverview('hinh-hoc-affine')}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Hình học Affine và hình học Euclide"
                        className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-white"
                      >
                        <div className="font-semibold text-stone-900">
                          Hình học Affine và Euclide
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Không gian Affine &amp; Phòng Lab 2D
                        </div>
                      </Link>
                      <Link
                        to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Giải tích hàm một biến"
                        className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-white"
                      >
                        <div className="font-semibold text-stone-900">Giải tích hàm một biến</div>
                        <div className="text-[11px] text-stone-500">
                          Giới hạn, Vi tích phân &amp; Đề thi
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Phân tầng Khối 2: Khoa học GD & Nghiệp vụ Sư phạm */}
                  <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-3">
                    <div className="flex items-center justify-between border-b border-teal-200/60 pb-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-teal-900 uppercase">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Khoa học GD &amp; Sư phạm</span>
                      </span>
                      <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                        Cốt lõi
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Link
                        to={ROUTES.subjectOverview('giao-duc-hoc')}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Giáo dục học"
                        className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-teal-950">Giáo dục học</span>
                          <span className="font-mono text-[10px] text-teal-700">EDUT1401</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Lao động sư phạm, GVCN &amp; 20 Tình huống
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Liên kết điều hướng chung */}
                  <div className="space-y-1 border-t border-stone-200 pt-3">
                    <Link
                      to={ROUTES.courses}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-stone-100"
                    >
                      <span>Khám phá tất cả học phần</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      to={ROUTES.glossary}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      Thuật ngữ &amp; Ký hiệu
                    </Link>
                  </div>

                  {/* Quản lý học viên cho Admin */}
                  {isAdmin && (
                    <div className="space-y-1 border-t border-stone-200 pt-2">
                      <Link
                        to={ROUTES.adminUsers}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-900 hover:bg-purple-100"
                      >
                        <Users className="h-4 w-4 text-purple-700" aria-hidden="true" />
                        <span>Quản lý học viên</span>
                      </Link>
                      <Link
                        to={ROUTES.uiPreview}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                      >
                        <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
                        <span>Thử nghiệm UI V2</span>
                      </Link>
                    </div>
                  )}

                  {/* Khối tài khoản Mobile */}
                  <div className="border-t border-stone-200 pt-3">
                    {isUserLoggedIn ? (
                      <div className="space-y-2 px-1">
                        <div className="text-xs text-stone-500">
                          Đăng nhập: {user?.fullName || user?.email || 'Học viên'}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-xs text-rose-700"
                        >
                          <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          <span>Đăng xuất</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="subject"
                        size="sm"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openAuthModal();
                        }}
                        className="w-full justify-start text-xs"
                      >
                        <LogIn className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        <span>Đăng nhập</span>
                      </Button>
                    )}
                  </div>
                </nav>
              </Drawer>
            </div>

            {/* Logo Thương hiệu */}
            <Link
              to={ROUTES.home}
              className="group flex items-center gap-2.5 text-stone-900 transition-opacity hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-900 text-white shadow-2xs transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9">
                <span className="font-serif text-base font-bold">LU</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-sm font-bold tracking-tight text-stone-900 sm:text-base">
                  Learning Universe
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-amber-900/80 uppercase">
                  Toán &amp; Sư phạm
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links & Mega Menu */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden items-center gap-1.5 md:flex lg:gap-2"
          >
            <Link
              to={ROUTES.home}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                pathname === ROUTES.home
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900',
              )}
            >
              Trang chủ
            </Link>

            {/* Nút kích hoạt Mega Menu "Không gian học tập" */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                  isMegaMenuOpen
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900',
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

              {/* BẢNG MEGA MENU 2.5D PHÂN TÁCH 2 PHÂN KHU HỌC THUẬT */}
              {isMegaMenuOpen && (
                <div className="absolute top-full left-1/2 z-50 w-[640px] max-w-[95vw] -translate-x-1/2 pt-3">
                  <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white/95 p-4 shadow-2xl ring-1 ring-stone-900/5 backdrop-blur-xl">
                    {/* Header Mega Menu */}
                    <div className="flex items-center justify-between border-b border-stone-100 px-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-600" />
                        <span className="font-serif text-xs font-bold text-stone-900">
                          Cổng Không Gian Học Thuật Đại Học
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">ĐH Sư phạm TP.HCM (HCMUE)</span>
                    </div>

                    {/* Lưới 2 Phân khu thị giác (Dual Spatial Portals) */}
                    <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* PHÂN KHU 1: KHỐI TOÁN HỌC */}
                      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-stone-50/50 p-3.5 shadow-2xs transition-all hover:border-amber-300">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-900 uppercase">
                            <Sigma className="h-3.5 w-3.5 text-amber-800" />
                            <span>Khối Toán học</span>
                          </span>
                          <span className="rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            3 môn
                          </span>
                        </div>

                        <div className="mt-2.5 space-y-1.5">
                          <Link
                            to={ROUTES.subjectOverview('cau-truc-dai-so')}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="group block rounded-xl bg-white/80 p-2.5 shadow-2xs transition-all hover:bg-white hover:shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-amber-900">
                                Cấu trúc đại số
                              </span>
                              <span className="text-[10px] font-semibold text-amber-800">
                                39 bài
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">
                              Nhóm, Vành, Trường &amp; Tiên đề
                            </p>
                          </Link>

                          <Link
                            to={ROUTES.subjectOverview('hinh-hoc-affine')}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="group block rounded-xl bg-white/80 p-2.5 shadow-2xs transition-all hover:bg-white hover:shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-amber-900">
                                Hình học Affine &amp; Euclide
                              </span>
                              <span className="text-[10px] font-semibold text-amber-800">
                                23 bài
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">
                              Không gian Affine &amp; Phòng Lab 2D
                            </p>
                          </Link>

                          <Link
                            to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="group block rounded-xl bg-white/80 p-2.5 shadow-2xs transition-all hover:bg-white hover:shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-amber-900">
                                Giải tích hàm một biến
                              </span>
                              <span className="text-[10px] font-semibold text-amber-800">
                                41 bài
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">
                              Giới hạn, Vi tích phân &amp; Đề thi
                            </p>
                          </Link>
                        </div>
                      </div>

                      {/* PHÂN KHU 2: KHỐI KHOA HỌC GIÁO DỤC & NGHIỆP VỤ SƯ PHẠM */}
                      <div className="flex flex-col justify-between rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 p-3.5 shadow-2xs transition-all hover:border-teal-300">
                        <div>
                          <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-teal-900 uppercase">
                              <GraduationCap className="h-3.5 w-3.5 text-teal-800" />
                              <span>Khoa học GD &amp; Sư phạm</span>
                            </span>
                            <span className="rounded-full bg-teal-100/90 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                              Chuẩn HCMUE
                            </span>
                          </div>

                          <div className="mt-2.5">
                            <Link
                              to={ROUTES.subjectOverview('giao-duc-hoc')}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="group block rounded-xl bg-white/90 p-2.5 shadow-2xs transition-all hover:bg-white hover:shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-teal-950">
                                  Giáo dục học đại cương
                                </span>
                                <span className="font-mono text-[10px] font-bold text-teal-800">
                                  EDUT1401
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-600">
                                Lao động sư phạm, 6 nguyên tắc, GVCN &amp; Ngân hàng 20 tình huống
                                thực tế.
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-teal-800">
                                <span className="rounded bg-teal-100 px-1.5 py-0.5">
                                  19 tệp tài liệu
                                </span>
                                <span className="rounded bg-teal-100 px-1.5 py-0.5">
                                  Rubric A.1.2 &amp; A.1.9
                                </span>
                              </div>
                            </Link>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-teal-200/60 bg-teal-100/40 p-2 text-[10px] text-teal-900">
                          Bám sát Chuẩn nghề nghiệp GVPT (Thông tư 20) &amp; CT GDPT 2018.
                        </div>
                      </div>
                    </div>

                    {/* Chân Mega Menu */}
                    <div className="mt-3 flex items-center justify-between border-t border-stone-100 px-2 pt-2.5">
                      <span className="text-[11px] text-stone-500">
                        Nền tảng mở phục vụ giảng dạy và tự học sư phạm
                      </span>
                      <Link
                        to={ROUTES.courses}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline"
                      >
                        <span>Khám phá tất cả học phần</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to={ROUTES.courses}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                pathname === ROUTES.courses
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900',
              )}
            >
              Tất cả môn học
            </Link>

            <Link
              to={ROUTES.glossary}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                pathname === ROUTES.glossary
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900',
              )}
            >
              Thuật ngữ
            </Link>
          </nav>

          {/* Action Utilities & User Identity */}
          <div className="flex items-center gap-2">
            {/* Nút Admin thu gọn dạng icon nhỏ tinh gọn */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <Link
                  to={ROUTES.adminUsers}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-purple-800 shadow-2xs transition-transform hover:scale-105 hover:bg-purple-100"
                  title="Quản lý và xét duyệt học viên (/admin/users)"
                  aria-label="Quản lý học viên"
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to={ROUTES.uiPreview}
                  className="hidden h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-900 shadow-2xs transition-transform hover:scale-105 hover:bg-amber-100 sm:flex"
                  title="Thử nghiệm UI V2 (/ui-preview)"
                  aria-label="Thử nghiệm UI V2"
                >
                  <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
                </Link>
              </div>
            )}

            {/* Trạng thái Chờ duyệt */}
            {isPending && (
              <button
                type="button"
                onClick={openPendingNotice}
                title="Tài khoản đang chờ phê duyệt. Nhấp để xem chi tiết."
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                <Clock className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                <span className="hidden sm:inline">Chờ duyệt</span>
              </button>
            )}

            {/* Huy hiệu Học viên đã duyệt */}
            {!isAdmin && (isApprovedStudent || (!user && isStoreAuthenticated)) && (
              <div className="hidden items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 sm:inline-flex">
                <UserCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                <span>Học viên</span>
              </div>
            )}

            {/* Khối Đăng nhập / Đăng xuất */}
            {isUserLoggedIn ? (
              <div className="flex items-center gap-2">
                <span
                  className="hidden max-w-[120px] truncate text-xs font-semibold text-stone-700 lg:inline-block"
                  title={user?.fullName || user?.email || 'Học viên'}
                >
                  {user?.fullName || user?.email || 'Học viên'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 rounded-full px-2.5 text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  title="Đăng xuất khỏi thiết bị"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Thoát</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="subject"
                size="sm"
                onClick={openAuthModal}
                className="h-8 rounded-full px-3 text-xs font-semibold shadow-2xs"
              >
                <LogIn className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                <span>Đăng nhập</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Thanh chỉ báo tiến độ đọc bài (2px) nằm sát mép dưới Header kính mờ — chỉ hiện trên trang bài học */}
      <ReadingProgressBar key={pathname} className="absolute inset-x-0 -bottom-px" />
    </header>
  );
};
