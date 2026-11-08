import { Compass, ListTree } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type HomepageViewMode = 'atlas' | 'archival';

export const HOMEPAGE_VIEW_MODE_STORAGE_KEY = 'lu-homepage-view-mode';

export interface ViewModeToggleProps {
  readonly mode: HomepageViewMode;
  readonly onChange: (mode: HomepageViewMode) => void;
}

export function getInitialHomepageViewMode(): HomepageViewMode {
  if (typeof window === 'undefined') {
    return 'atlas';
  }
  try {
    const saved = window.localStorage.getItem(HOMEPAGE_VIEW_MODE_STORAGE_KEY);
    if (saved === 'archival' || saved === 'atlas') {
      return saved;
    }
  } catch {
    // Dự phòng khi trình duyệt chặn localStorage
  }
  return 'atlas';
}

export function saveHomepageViewMode(mode: HomepageViewMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(HOMEPAGE_VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // Dự phòng khi trình duyệt chặn localStorage
  }
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div
      data-testid="homepage-view-mode-toggle"
      role="group"
      aria-label="Chế độ hiển thị Trang chủ"
      className="inline-flex shrink-0 items-center rounded-full border border-[#D9DFD9] bg-[#FAF9F6] p-1 shadow-2xs"
    >
      <button
        type="button"
        aria-pressed={mode === 'atlas'}
        onClick={() => onChange('atlas')}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium transition-all duration-200',
          mode === 'atlas'
            ? 'bg-[#365E4E] text-white shadow-2xs'
            : 'text-[#58635E] hover:text-[#262B28]',
        )}
      >
        <Compass className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Bản đồ Không gian (Atlas)</span>
      </button>

      <button
        type="button"
        aria-pressed={mode === 'archival'}
        onClick={() => onChange('archival')}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium transition-all duration-200',
          mode === 'archival'
            ? 'bg-[#365E4E] text-white shadow-2xs'
            : 'text-[#58635E] hover:text-[#262B28]',
        )}
      >
        <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Văn khố Thư mục (Archival Index)</span>
      </button>
    </div>
  );
}
