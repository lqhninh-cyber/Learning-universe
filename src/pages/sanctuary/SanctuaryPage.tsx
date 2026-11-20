import { ArrowLeft, Gamepad2, Landmark } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { POMODORO_RETURN_PATH_KEY } from '@/context/IslandContext';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/shared/lib/cn';

const HeritageExhibitionPavilion = lazy(() =>
  import('@/components/home/HeritageExhibitionPavilion').then((mod) => ({
    default: mod.HeritageExhibitionPavilion,
  })),
);

const MineralBilliardsStage = lazy(() =>
  import('@/components/home/MineralBilliardsStage').then((mod) => ({
    default: mod.MineralBilliardsStage,
  })),
);

export type SanctuaryTab = 'di-san' | 'bida';

function resolveSanctuaryTab(raw: string | null): SanctuaryTab {
  return raw === 'bida' ? 'bida' : 'di-san';
}

function readPomodoroReturnPath(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.sessionStorage.getItem(POMODORO_RETURN_PATH_KEY);
    return val && val.startsWith('/') ? val : null;
  } catch {
    return null;
  }
}

function SanctuarySkeleton({ label }: { readonly label: string }) {
  return (
    <div
      data-testid="sanctuary-loading-skeleton"
      className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-10"
    >
      <div className="flex min-h-[580px] items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <span className="font-mono text-xs tracking-wider text-[var(--text-muted)] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Sảnh Thư giãn chuyên biệt (`/thu-gian`) — Academic OS:
 * - `?tab=di-san` (mặc định): Bảo tàng 40 Di sản Học thuật & Nghệ thuật (React.lazy).
 * - `?tab=bida`: Bàn Bida 8-Ball WPA 2.5D (React.lazy), tự động thu gọn LeftRail trên desktop để tối ưu bề ngang.
 * - Nối trực tiếp với Pomodoro: hiển thị nút `← Quay lại bài đang học` khi có `lu_pomodoro_return_path`.
 */
export function SanctuaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveSanctuaryTab(searchParams.get('tab'));
  const { setTopBarRightSlot, setRailCollapsed } = useLayout();
  const [returnLessonPath, setReturnLessonPath] = useState<string | null>(() =>
    readPomodoroReturnPath(),
  );

  const handleSelectTab = useCallback(
    (nextTab: SanctuaryTab) => {
      setSearchParams({ tab: nextTab }, { replace: true });
    },
    [setSearchParams],
  );

  // Tự động thu gọn LeftRail một lần mỗi khi chuyển sang tab Bida trên desktop
  const prevTabRef = useRef<SanctuaryTab | null>(null);
  useEffect(() => {
    const enteredBida = activeTab === 'bida' && prevTabRef.current !== 'bida';
    prevTabRef.current = activeTab;
    if (enteredBida && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setRailCollapsed(true);
    }
  }, [activeTab, setRailCollapsed]);

  const handleClearReturnPath = useCallback(() => {
    try {
      window.sessionStorage.removeItem(POMODORO_RETURN_PATH_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    setReturnLessonPath(null);
  }, []);

  const topBarControls = useMemo(
    () => (
      <div className="flex items-center gap-2">
        {returnLessonPath && (
          <Link
            to={returnLessonPath}
            onClick={handleClearReturnPath}
            data-testid="sanctuary-return-lesson-btn"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs font-semibold text-[var(--accent-os)] transition-colors hover:border-[var(--accent-os)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Quay lại bài đang học</span>
          </Link>
        )}

        <div
          role="tablist"
          aria-label="Chuyển đổi không gian Sảnh Thư giãn"
          data-testid="sanctuary-tab-switcher"
          className="inline-flex items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-shell)] p-0.5"
        >
          <button
            type="button"
            role="tab"
            data-testid="sanctuary-tab-di-san"
            aria-selected={activeTab === 'di-san'}
            onClick={() => handleSelectTab('di-san')}
            className={cn(
              'inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
              activeTab === 'di-san'
                ? 'bg-[var(--accent-os)] text-white shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Bảo tàng 40 Di sản</span>
          </button>

          <button
            type="button"
            role="tab"
            data-testid="sanctuary-tab-bida"
            aria-selected={activeTab === 'bida'}
            onClick={() => handleSelectTab('bida')}
            className={cn(
              'inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
              activeTab === 'bida'
                ? 'bg-[var(--accent-os)] text-white shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            <Gamepad2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Bida 8-Ball WPA</span>
          </button>
        </div>
      </div>
    ),
    [activeTab, handleClearReturnPath, handleSelectTab, returnLessonPath],
  );

  useEffect(() => {
    setTopBarRightSlot(topBarControls);
    return () => {
      setTopBarRightSlot(null);
    };
  }, [setTopBarRightSlot, topBarControls]);

  return (
    <div
      data-testid="sanctuary-page"
      data-active-tab={activeTab}
      className="min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      {activeTab === 'di-san' ? (
        <Suspense fallback={<SanctuarySkeleton label="Đang mở Phòng trưng bày 40 Di sản…" />}>
          <HeritageExhibitionPavilion />
        </Suspense>
      ) : (
        <Suspense fallback={<SanctuarySkeleton label="Đang chuẩn bị bàn Bida 8-Ball WPA 2.5D…" />}>
          <MineralBilliardsStage />
        </Suspense>
      )}
    </div>
  );
}

export default SanctuaryPage;
