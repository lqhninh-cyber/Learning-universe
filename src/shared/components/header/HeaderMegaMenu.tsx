import {
  Activity,
  ArrowRight,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface HeaderMegaMenuProps {
  readonly isDark: boolean;
  readonly isSepia: boolean;
  readonly onClose: () => void;
}

export const HeaderMegaMenu: FC<HeaderMegaMenuProps> = ({ isDark, isSepia, onClose }) => {
  const mathItems = [
    {
      to: ROUTES.courseOverview('cau-truc-dai-so'),
      title: 'Cấu trúc đại số',
      badge: '04 TC',
      icon: Layers,
    },
    {
      to: ROUTES.courseOverview('hinh-hoc-affine'),
      title: 'Hình học Affine & Euclide',
      badge: '03 TC',
      icon: Compass,
    },
    {
      to: ROUTES.courseOverview('giai-tich-ham-mot-bien'),
      title: 'Giải tích hàm một biến',
      badge: '04 TC',
      icon: Activity,
    },
  ] as const;

  const eduItems = [
    {
      to: ROUTES.courseOverview('giao-duc-hoc'),
      title: 'Giáo dục học',
      badge: '04 TC',
      icon: GraduationCap,
    },
    {
      to: '/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te',
      title: 'Tình huống sư phạm thực hành',
      badge: '20 án lệ',
      icon: ShieldCheck,
    },
    {
      to: '/mon-hoc/giao-duc-hoc?tab=documents',
      title: 'Hệ thống văn bản & Thông tư GD',
      badge: 'GD phổ thông',
      icon: FileText,
    },
  ] as const;

  return (
    <div
      role="region"
      aria-label="Danh mục Không gian học tập"
      className={cn(
        'absolute top-full left-1/2 mt-3 w-[640px] max-w-[94vw] -translate-x-1/2 rounded-3xl p-6 shadow-2xl backdrop-blur-xl transition-all duration-200',
        isDark
          ? 'border border-[#4E9B58]/25 bg-[#11221A]/96 text-[#F7F4EB]'
          : isSepia
            ? 'border border-[#1B3D2F]/16 bg-[#FBF7EC]/98 text-[#231F18]'
            : 'border border-[#1B3D2F]/14 bg-[#FCFDFC]/96 text-[#142B21] dark:border-[#4E9B58]/25 dark:bg-[#11221A]/96 dark:text-[#F7F4EB]',
      )}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Cột 1: Toán học */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2.5">
            <p
              className={cn(
                'font-mono text-[11px] font-semibold tracking-wider uppercase',
                isDark ? 'text-[#A7B5AC]' : 'text-[#55676B]',
              )}
            >
              Toán học
            </p>
            <span className="text-[10px] text-[#55676B] dark:text-[#A7B5AC]">3 học phần</span>
          </div>
          <div className="space-y-1">
            {mathItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
                    isDark ? 'hover:bg-white/5' : 'hover:bg-[#E9EFEA]/80 dark:hover:bg-white/5',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isDark
                          ? 'bg-[#1B3D2F] text-[#8EC5AA]'
                          : 'bg-[#E9EFEA] text-[#1B3D2F] dark:bg-[#1B3D2F] dark:text-[#8EC5AA]',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <span
                      className={cn(
                        'truncate font-serif text-sm font-semibold',
                        isDark ? 'text-[#F7F4EB]' : 'text-[#142B21] dark:text-[#F7F4EB]',
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 font-mono text-[11px] opacity-80',
                      isDark ? 'text-[#A7B5AC]' : 'text-[#55676B] dark:text-[#A7B5AC]',
                    )}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cột 2: Khoa học Giáo dục */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2.5">
            <p
              className={cn(
                'font-mono text-[11px] font-semibold tracking-wider uppercase',
                isDark ? 'text-[#A7B5AC]' : 'text-[#55676B]',
              )}
            >
              Khoa học Giáo dục
            </p>
            <span className="text-[10px] text-[#55676B] dark:text-[#A7B5AC]">Sư phạm ứng dụng</span>
          </div>
          <div className="space-y-1">
            {eduItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
                    isDark ? 'hover:bg-white/5' : 'hover:bg-[#E9EFEA]/80 dark:hover:bg-white/5',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isDark
                          ? 'bg-[#2A261A] text-[#E5C378]'
                          : 'bg-[#FAF3E3] text-[#8A6A2F] dark:bg-[#2A261A] dark:text-[#E5C378]',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <span
                      className={cn(
                        'truncate font-serif text-sm font-semibold',
                        isDark ? 'text-[#F7F4EB]' : 'text-[#142B21] dark:text-[#F7F4EB]',
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 font-mono text-[11px] opacity-80',
                      isDark ? 'text-[#A7B5AC]' : 'text-[#55676B] dark:text-[#A7B5AC]',
                    )}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dưới cùng: Liên kết Xem tất cả học phần */}
      <div
        className={cn(
          'mt-5 flex items-center justify-between border-t pt-3.5',
          isDark ? 'border-[#2A4035]' : 'border-[var(--border-subtle)]',
        )}
      >
        <span className="text-[11px] text-[#55676B] dark:text-[#A7B5AC]">
          Sư phạm Toán học · ĐH Sư phạm TP.HCM (HCMUE)
        </span>
        <Link
          to={ROUTES.courses}
          onClick={onClose}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 text-xs font-semibold transition-colors',
            isDark
              ? 'text-[#E5C378] hover:text-[#DFAD4D]'
              : 'text-[#1B3D2F] hover:text-[#C83E37] dark:text-[#E5C378]',
          )}
        >
          <span>Xem tất cả học phần</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};
