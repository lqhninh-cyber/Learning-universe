import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { type FC, type FormEvent, useMemo, useState } from 'react';
import type { InkFolder, InkNotebook } from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface FolderNotebookSidebarProps {
  readonly folders: readonly InkFolder[];
  readonly notebooks: readonly InkNotebook[];
  readonly activeNotebook: InkNotebook;
  readonly onSelectNotebook: (notebookId: string) => void;
  readonly onCreateNotebook: (title?: string, folderId?: string | null) => void;
  readonly onRenameActiveNotebook: (title: string) => void;
  readonly onDeleteNotebook: (notebookId: string) => void;
  readonly onMoveNotebook: (notebookId: string, folderId: string | null) => void;
  readonly onCreateFolder: (name: string, parentId?: string | null, color?: string) => void;
  readonly onRenameFolder: (folderId: string, name: string) => void;
  readonly onDeleteFolder: (folderId: string) => void;
  readonly onSelectPage: (index: number) => void;
  readonly onAddPage: () => void;
  readonly onDuplicatePage: (index: number) => void;
  readonly onDeletePage: (index: number) => void;
}

const FOLDER_COLORS = ['#1D4F6E', '#1B5E4A', '#8C5828', '#8F3D35', '#6D28D9', '#0F766E'] as const;

export const FolderNotebookSidebar: FC<FolderNotebookSidebarProps> = ({
  folders,
  notebooks,
  activeNotebook,
  onSelectNotebook,
  onCreateNotebook,
  onRenameActiveNotebook,
  onDeleteNotebook,
  onMoveNotebook,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'folders' | 'pages'>('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const f of folders) map[f.id] = true;
    return map;
  });

  // Form tạo thư mục gốc hoặc thư mục con
  const [newFolderParentId, setNewFolderParentId] = useState<string | null | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<string>(FOLDER_COLORS[0]);

  // Đổi tên thư mục inline
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Đang mở hộp chuyển thư mục cho 1 vở
  const [movingNotebookId, setMovingNotebookId] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredNotebooks = useMemo(() => {
    if (!normalizedQuery) return notebooks;
    return notebooks.filter((nb) => nb.title.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, notebooks]);

  const validFolderIds = useMemo(() => new Set(folders.map((f) => f.id)), [folders]);

  const unfiledNotebooks = useMemo(
    () => filteredNotebooks.filter((nb) => !nb.folderId || !validFolderIds.has(nb.folderId)),
    [filteredNotebooks, validFolderIds],
  );

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !(prev[folderId] ?? true) }));
  };

  const handleCreateFolderSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const parentId = newFolderParentId ?? null;
    onCreateFolder(newFolderName.trim(), parentId, newFolderColor);
    if (parentId) {
      setExpandedFolders((prev) => ({ ...prev, [parentId]: true }));
    }
    setNewFolderName('');
    setNewFolderParentId(undefined);
  };

  const handleRenameFolderSubmit = (e: FormEvent, folderId: string) => {
    e.preventDefault();
    if (editingFolderName.trim()) {
      onRenameFolder(folderId, editingFolderName.trim());
    }
    setEditingFolderId(null);
  };

  const renderNotebookRow = (nb: InkNotebook) => {
    const isActive = nb.id === activeNotebook.id;
    const isMoving = movingNotebookId === nb.id;

    return (
      <div
        key={nb.id}
        data-testid={`sidebar-notebook-${nb.id}`}
        className={cn(
          'group rounded-lg border px-2 py-1.5 transition-colors',
          isActive
            ? 'border-[var(--accent-os)]/50 bg-[var(--bg-workspace)] shadow-2xs'
            : 'border-transparent hover:bg-[var(--bg-workspace)]/70',
        )}
      >
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onSelectNotebook(nb.id)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left"
          >
            <FileText
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isActive ? 'text-[var(--accent-os)]' : 'text-[var(--text-muted)]',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'truncate text-[11.5px]',
                isActive ? 'font-semibold text-[var(--accent-os)]' : 'text-[var(--text-main)]',
              )}
            >
              {nb.title}
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-0.5">
            <span className="font-mono text-[9.5px] text-[var(--text-muted)] tabular-nums">
              {nb.pages.length}tr
            </span>
            <button
              type="button"
              title="Chuyển sang thư mục khác"
              aria-label={`Chuyển thư mục cho ${nb.title}`}
              onClick={() => setMovingNotebookId(isMoving ? null : nb.id)}
              className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] opacity-65 hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] hover:opacity-100"
            >
              <Folder className="h-3 w-3" aria-hidden="true" />
            </button>
            {notebooks.length > 1 && (
              <button
                type="button"
                title="Xóa vở"
                aria-label={`Xóa vở ${nb.title}`}
                onClick={() => onDeleteNotebook(nb.id)}
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] opacity-65 hover:bg-[var(--bg-surface)] hover:text-[#8F3D35] hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isMoving && (
          <div className="mt-1.5 flex items-center gap-1 border-t border-[var(--border-hairline)] pt-1.5">
            <select
              aria-label={`Chọn thư mục đích cho ${nb.title}`}
              value={nb.folderId ?? ''}
              onChange={(e) => {
                onMoveNotebook(nb.id, e.target.value || null);
                setMovingNotebookId(null);
              }}
              className="min-w-0 flex-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10.5px] text-[var(--text-main)]"
            >
              <option value="">Chưa phân mục</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.parentId ? `↳ ${f.name}` : f.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMovingNotebookId(null)}
              className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)]"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderFolderTree = (parentId: string | null, depth: number) => {
    const children = folders.filter((f) => (f.parentId ?? null) === parentId);
    if (children.length === 0) return null;

    return (
      <div
        className={cn(
          'space-y-1',
          depth > 0 && 'ml-3 border-l border-[var(--border-hairline)] pl-2',
        )}
      >
        {children.map((folder) => {
          const isExpanded = expandedFolders[folder.id] ?? true;
          const folderNotebooks = filteredNotebooks.filter((nb) => nb.folderId === folder.id);
          const hasSubFolders = folders.some((sub) => sub.parentId === folder.id);
          const isEditing = editingFolderId === folder.id;

          return (
            <div key={folder.id} data-testid={`ink-folder-${folder.id}`} className="space-y-0.5">
              <div className="group flex items-center justify-between gap-1 rounded-lg px-1.5 py-1 hover:bg-[var(--bg-workspace)]/70">
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleRenameFolderSubmit(e, folder.id)}
                    className="flex min-w-0 flex-1 items-center gap-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={() => setEditingFolderId(null)}
                      aria-label="Tên mới của thư mục"
                      className="min-w-0 flex-1 rounded border border-[var(--accent-os)] bg-[var(--bg-workspace)] px-1.5 py-0.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpand(folder.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronRight className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                    )}
                    {isExpanded ? (
                      <FolderOpen
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: folder.color }}
                        aria-hidden="true"
                      />
                    ) : (
                      <Folder
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: folder.color }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate text-xs font-semibold text-[var(--text-main)]">
                      {folder.name}
                    </span>
                    <span className="font-mono text-[9.5px] text-[var(--text-muted)]">
                      ({folderNotebooks.length})
                    </span>
                  </button>
                )}

                {!isEditing && (
                  <div className="flex shrink-0 items-center gap-0.5 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      title="Thêm vở mới vào mục này"
                      aria-label={`Thêm vở mới vào ${folder.name}`}
                      onClick={() => {
                        setExpandedFolders((prev) => ({ ...prev, [folder.id]: true }));
                        onCreateNotebook(undefined, folder.id);
                      }}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-os)]"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                    </button>
                    {depth < 2 && (
                      <button
                        type="button"
                        title="Tạo thư mục con"
                        aria-label={`Tạo mục con trong ${folder.name}`}
                        onClick={() => {
                          setNewFolderParentId(folder.id);
                          setNewFolderColor(folder.color);
                          setNewFolderName('');
                        }}
                        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-os)]"
                      >
                        <FolderPlus className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Đổi tên thư mục"
                      aria-label={`Đổi tên ${folder.name}`}
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                    >
                      <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title="Xóa thư mục (giữ lại vở)"
                      aria-label={`Xóa thư mục ${folder.name}`}
                      onClick={() => onDeleteFolder(folder.id)}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[#8F3D35]"
                    >
                      <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="space-y-1 pl-3">
                  {renderFolderTree(folder.id, depth + 1)}
                  {folderNotebooks.map(renderNotebookRow)}
                  {folderNotebooks.length === 0 && !hasSubFolders && (
                    <p className="px-2 py-0.5 text-[10.5px] text-[var(--text-muted)] italic">
                      Mục trống — nhấn + để tạo vở
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      data-testid="ink-pages-sidebar"
      className="os-thin-scrollbar flex w-64 shrink-0 flex-col overflow-hidden border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] print:hidden"
    >
      {/* 2 Tab phân tách gọn: Thư mục & Vở ↔ Trang vở */}
      <div className="grid grid-cols-2 gap-1 border-b border-[var(--border-hairline)] p-2">
        <button
          type="button"
          data-testid="sidebar-tab-folders"
          onClick={() => setSidebarTab('folders')}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-colors',
            sidebarTab === 'folders'
              ? 'bg-[var(--accent-os)] text-white'
              : 'bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <Folder className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Thư mục ({folders.length})</span>
        </button>
        <button
          type="button"
          data-testid="sidebar-tab-pages"
          onClick={() => setSidebarTab('pages')}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-colors',
            sidebarTab === 'pages'
              ? 'bg-[var(--accent-os)] text-white'
              : 'bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Trang ({activeNotebook.pages.length})</span>
        </button>
      </div>

      {sidebarTab === 'folders' ? (
        <div className="os-thin-scrollbar flex-1 space-y-2.5 overflow-y-auto p-2.5">
          {/* Tìm kiếm nhanh + nút tạo thư mục gốc */}
          <div className="flex items-center gap-1.5">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1">
              <Search className="h-3 w-3 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm vở..."
                aria-label="Tìm kiếm vở ghi chép"
                className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>
            <button
              type="button"
              data-testid="ink-new-folder-btn"
              title="Tạo thư mục mới"
              onClick={() => {
                setNewFolderParentId(null);
                setNewFolderName('');
              }}
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2 text-[11px] font-semibold text-white hover:opacity-95"
            >
              <FolderPlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mục</span>
            </button>
          </div>

          {/* Form tạo thư mục gốc hoặc thư mục con */}
          {newFolderParentId !== undefined && (
            <form
              onSubmit={handleCreateFolderSubmit}
              data-testid="ink-new-folder-form"
              className="space-y-2 rounded-xl border border-[var(--accent-os)]/40 bg-[var(--bg-workspace)] p-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between font-mono text-[10.5px] text-[var(--text-muted)]">
                <span>
                  {newFolderParentId
                    ? `Tạo mục con trong "${folders.find((f) => f.id === newFolderParentId)?.name ?? ''}"`
                    : 'Tạo thư mục mới'}
                </span>
                <button
                  type="button"
                  onClick={() => setNewFolderParentId(undefined)}
                  className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <input
                type="text"
                autoFocus
                data-testid="ink-new-folder-input"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="VD: Chương 1: Khối đa diện..."
                aria-label="Tên thư mục mới"
                className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      style={{ backgroundColor: c }}
                      className={cn(
                        'h-4 w-4 cursor-pointer rounded-full',
                        newFolderColor === c && 'ring-2 ring-[var(--accent-os)] ring-offset-1',
                      )}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="cursor-pointer rounded-md bg-[var(--accent-os)] px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  Tạo
                </button>
              </div>
            </form>
          )}

          {/* Cây thư mục đa cấp */}
          {renderFolderTree(null, 0)}

          {/* Vở chưa phân mục */}
          {unfiledNotebooks.length > 0 && (
            <div className="space-y-1 border-t border-[var(--border-hairline)] pt-2">
              <p className="px-1.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Chưa phân mục ({unfiledNotebooks.length})
              </p>
              {unfiledNotebooks.map(renderNotebookRow)}
            </div>
          )}
        </div>
      ) : (
        <div className="os-thin-scrollbar flex-1 space-y-2.5 overflow-y-auto p-3">
          <input
            type="text"
            value={activeNotebook.title}
            onChange={(e) => onRenameActiveNotebook(e.target.value)}
            aria-label="Tên vở ghi chép"
            className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
          />

          <div className="flex items-center justify-between font-mono text-[10.5px] text-[var(--text-muted)]">
            <span>
              Trang {activeNotebook.activePageIndex + 1} / {activeNotebook.pages.length}
            </span>
            <button
              type="button"
              data-testid="ink-add-page-btn"
              onClick={onAddPage}
              className="inline-flex cursor-pointer items-center gap-0.5 font-semibold text-[var(--accent-os)] hover:underline"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>Thêm trang</span>
            </button>
          </div>

          <div className="space-y-2">
            {activeNotebook.pages.map((pg, idx) => {
              const isActive = idx === activeNotebook.activePageIndex;
              const itemCount =
                pg.strokes.length +
                pg.shapes.length +
                pg.solids3d.length +
                pg.graphs.length +
                pg.texts.length;
              return (
                <div
                  key={pg.id}
                  className={cn(
                    'rounded-xl border p-2 transition-all',
                    isActive
                      ? 'border-[var(--accent-os)] bg-[var(--bg-workspace)] shadow-xs'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)]/60 hover:border-[var(--border-strong)]',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectPage(idx)}
                    className="flex w-full cursor-pointer flex-col items-start gap-1 text-left"
                  >
                    <div
                      style={{ backgroundColor: activeNotebook.paper.backgroundColor }}
                      className="flex h-20 w-full items-center justify-center rounded-lg border border-[var(--border-hairline)] font-mono text-[10px] text-[var(--text-muted)]"
                    >
                      {itemCount > 0 ? `${itemCount} phần tử` : 'Trang trống'}
                    </div>
                    <span className="font-mono text-[10.5px] font-semibold text-[var(--text-main)]">
                      Trang {idx + 1}
                    </span>
                  </button>

                  <div className="mt-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Nhân bản trang"
                      onClick={() => onDuplicatePage(idx)}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </button>
                    {activeNotebook.pages.length > 1 && (
                      <button
                        type="button"
                        title="Xóa trang"
                        onClick={() => onDeletePage(idx)}
                        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[#8F3D35]"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FolderNotebookSidebar;
