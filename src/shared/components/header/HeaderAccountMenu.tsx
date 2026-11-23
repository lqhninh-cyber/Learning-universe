import {
  BookOpen,
  Download,
  HardDrive,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { type ChangeEvent, type FC, useRef, useState } from 'react';
import { Link } from 'react-router';
import { FONT_SIZE_LABELS, type ReadingFontSize } from '@/context/ReadingSettingsContext';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import {
  applyBackupSnapshot,
  downloadBackupSnapshot,
  parseAndValidateBackup,
  type BackupRestoreMode,
} from '@/utils/backupSnapshot';
import { estimateLocalStorageUsage } from '@/utils/safeStorage';

export interface HeaderAccountMenuProps {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onClose: () => void;
  readonly isDark: boolean;
  readonly isSepia: boolean;
  readonly isAdmin: boolean;
  readonly isUserLoggedIn: boolean;
  readonly completedCount: number;
  readonly fontSize: ReadingFontSize;
  readonly onSelectFontSize: (size: ReadingFontSize) => void;
  readonly onOpenAuthModal: () => void;
  readonly onEnableLearnerMode: () => void;
  readonly onSignOut: () => Promise<void>;
  readonly placement?: 'header' | 'rail';
  readonly collapsed?: boolean;
}

export const HeaderAccountMenu: FC<HeaderAccountMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  isDark,
  isSepia,
  isAdmin,
  isUserLoggedIn,
  completedCount,
  fontSize,
  onSelectFontSize,
  onOpenAuthModal,
  onEnableLearnerMode,
  onSignOut,
  placement = 'header',
  collapsed = false,
}) => {
  const fontOptions: ReadonlyArray<{ readonly id: ReadingFontSize; readonly label: string }> = [
    { id: 'sm', label: 'A−' },
    { id: 'base', label: 'A' },
    { id: 'lg', label: 'A+' },
  ];
  const isRail = placement === 'rail';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMode, setRestoreMode] = useState<BackupRestoreMode>('merge');
  const [backupNotice, setBackupNotice] = useState<{
    readonly tone: 'success' | 'error';
    readonly text: string;
  } | null>(null);
  const [, setUsageRefreshTick] = useState(0);

  const storageUsage = isOpen ? estimateLocalStorageUsage() : null;

  const handleExportBackup = () => {
    downloadBackupSnapshot();
    setBackupNotice({
      tone: 'success',
      text: 'Đã tải về tệp sao lưu JSON tiến độ & bài tập.',
    });
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      const result = parseAndValidateBackup(raw);
      if (!result.ok) {
        setBackupNotice({ tone: 'error', text: result.error });
        return;
      }
      const summary = applyBackupSnapshot(result.data, restoreMode);
      setUsageRefreshTick((t) => t + 1);
      setBackupNotice({
        tone: 'success',
        text: `Đã khôi phục (${restoreMode === 'merge' ? 'gộp' : 'thay thế'}): ${summary.completedCount} bài · ${summary.exerciseCount} bài tập.`,
      });
    };
    reader.onerror = () => {
      setBackupNotice({ tone: 'error', text: 'Không thể đọc tệp sao lưu đã chọn.' });
    };
    reader.readAsText(file);
  };

  return (
    <div className={cn('relative', isRail ? 'w-full' : 'hidden md:block')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Tài khoản và cài đặt giao diện"
        title="Tài khoản & Hồ sơ học tập"
        className={cn(
          'cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none active:scale-[0.98]',
          isRail
            ? collapsed
              ? 'mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]'
              : 'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 text-[13px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]'
            : cn(
                'flex h-10 w-10 items-center justify-center rounded-full border',
                isDark
                  ? 'border-[#4E9B58]/25 bg-[#182E24] text-[#F7F4EB] hover:border-[#4E9B58]/50 hover:bg-[#1E3B2E]'
                  : 'border-[#1B3D2F]/14 bg-[var(--bg-page)] text-[#142B21] hover:border-[#1B3D2F]/30 hover:bg-white dark:border-[#4E9B58]/25 dark:bg-[#182E24] dark:text-[#F7F4EB]',
              ),
        )}
      >
        {isRail && !collapsed ? (
          <>
            <span className="flex min-w-0 items-center gap-2.5">
              <User className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="truncate">{isUserLoggedIn ? 'Hồ sơ học tập' : 'Tài khoản'}</span>
            </span>
            {completedCount > 0 && (
              <span className="shrink-0 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums">
                {completedCount}
              </span>
            )}
          </>
        ) : (
          <User className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu tài khoản và giao diện"
          className={cn(
            'absolute z-50 w-72 rounded-2xl p-4 shadow-2xl backdrop-blur-xl',
            isRail ? 'bottom-0 left-full ml-3' : 'top-full right-0 mt-3',
            isRail
              ? 'border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]'
              : isDark
                ? 'border border-[#4E9B58]/25 bg-[#11221A]/96 text-[#F7F4EB]'
                : isSepia
                  ? 'border border-[#1B3D2F]/16 bg-[#FBF7EC]/98 text-[#231F18]'
                  : 'border border-[#1B3D2F]/14 bg-[#FCFDFC]/96 text-[#142B21] dark:border-[#4E9B58]/25 dark:bg-[#11221A]/96 dark:text-[#F7F4EB]',
          )}
        >
          {/* Mục 1: Thông tin học tập cá nhân */}
          <div className="space-y-1.5 border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <BookOpen className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
              <span>Thông tin học tập cá nhân</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Đã hoàn thành <strong className="text-[var(--text-main)]">{completedCount}</strong>{' '}
              bài học trên trình duyệt này.
            </p>
          </div>

          {/* Mục 2: Cài đặt giao diện (Cỡ chữ đọc bài) */}
          <div className="space-y-2 border-b border-[var(--border-hairline)] py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)]">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal
                  className="h-3.5 w-3.5 text-[var(--accent-os)]"
                  aria-hidden="true"
                />
                <span>Cỡ chữ bài đọc</span>
              </span>
              <span className="font-mono text-[11px] font-medium text-[var(--accent-heritage)]">
                {FONT_SIZE_LABELS[fontSize]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1">
              {fontOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectFontSize(opt.id)}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-xs font-semibold transition-colors',
                    fontSize === opt.id
                      ? 'bg-[var(--accent-os)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mục 2b: Dung lượng bộ nhớ cục bộ & Sao lưu / Khôi phục JSON */}
          {storageUsage && (
            <div
              data-testid="profile-storage-backup-section"
              className="space-y-2.5 border-b border-[var(--border-hairline)] py-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)]">
                <span className="inline-flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
                  <span>Bộ nhớ cục bộ</span>
                </span>
                <span
                  data-testid="profile-storage-usage-text"
                  className={cn(
                    'font-mono text-[10.5px] font-semibold tabular-nums',
                    storageUsage.percentUsed >= 85
                      ? 'text-red-600 dark:text-red-400'
                      : storageUsage.percentUsed >= 65
                        ? 'text-[#9E763B] dark:text-[#D4AF6A]'
                        : 'text-[var(--text-muted)]',
                  )}
                >
                  {Math.round(storageUsage.totalKB)} / {storageUsage.quotaKB} KB
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    storageUsage.percentUsed >= 85
                      ? 'bg-red-500'
                      : storageUsage.percentUsed >= 65
                        ? 'bg-[#9E763B]'
                        : 'bg-[var(--accent-os)]',
                  )}
                  style={{ width: `${Math.max(2, Math.min(100, storageUsage.percentUsed))}%` }}
                />
              </div>

              <p className="font-mono text-[10px] leading-snug text-[var(--text-muted)] tabular-nums">
                Tiến độ {Math.round(storageUsage.progressKB + storageUsage.workspaceKB)} KB · Vở
                viết {Math.round(storageUsage.mathInkKB)} KB · Đề thi{' '}
                {Math.round(storageUsage.examBuilderKB)} KB
              </p>

              <div className="space-y-1.5 pt-0.5">
                <button
                  type="button"
                  data-testid="backup-export-btn"
                  onClick={handleExportBackup}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]/50 hover:text-[var(--accent-os)]"
                >
                  <span>Xuất bản sao lưu (.json)</span>
                  <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="backup-import-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-1 cursor-pointer items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]/50 hover:text-[var(--accent-os)]"
                  >
                    <span>Khôi phục từ tệp (.json)</span>
                    <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    data-testid="backup-restore-mode-toggle"
                    onClick={() =>
                      setRestoreMode((prev) => (prev === 'merge' ? 'replace' : 'merge'))
                    }
                    title={
                      restoreMode === 'merge'
                        ? 'Chế độ Gộp: giữ tiến độ cũ và bổ sung từ tệp'
                        : 'Chế độ Thay thế: ghi đè toàn bộ bằng tệp sao lưu'
                    }
                    className="shrink-0 cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]"
                  >
                    {restoreMode === 'merge' ? 'Gộp' : 'Thay thế'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  data-testid="backup-import-input"
                  onChange={handleImportFileChange}
                  className="hidden"
                  aria-label="Chọn tệp sao lưu JSON để khôi phục"
                />

                {backupNotice && (
                  <p
                    role="status"
                    data-testid="backup-status-notice"
                    className={cn(
                      'rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug',
                      backupNotice.tone === 'error'
                        ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
                    )}
                  >
                    {backupNotice.text}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Liên kết Quản trị viên (nếu có quyền Admin) */}
          {isAdmin && (
            <div className="border-b border-[var(--border-hairline)] py-2">
              <Link
                to={ROUTES.adminUsers}
                onClick={onClose}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-surface)]"
              >
                <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Quản lý học viên</span>
              </Link>
            </div>
          )}

          {/* Mục 3: Đăng nhập / Đăng xuất */}
          <div className="pt-2.5">
            {isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-surface)]"
              >
                <span>Đăng xuất</span>
                <LogOut className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[var(--accent-os)] px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                >
                  <span>Đăng nhập đồng bộ</span>
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEnableLearnerMode();
                    onClose();
                  }}
                  className="w-full cursor-pointer rounded-xl px-3 py-1.5 text-center text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                >
                  Bật lưu tiến độ trình duyệt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
