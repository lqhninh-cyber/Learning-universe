import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_PAPER_CONFIG,
  DEFAULT_PEN_PRESETS,
  type Ink3DSolidItem,
  type InkFolder,
  type InkGraphItem,
  type InkImageItem,
  type InkNotebook,
  type InkPage,
  type InkShapeItem,
  type InkStampItem,
  type InkStroke,
  type InkTextItem,
  type InkVariationTableItem,
  type InkWorksheetBackground,
  type PaperConfig,
  type PenPreset,
} from './types';

export const INK_GUEST_ACCOUNT_KEY = 'guest';

export interface UserInkBucket {
  readonly folders: readonly InkFolder[];
  readonly notebooks: readonly InkNotebook[];
  readonly activeNotebookId: string;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createBlankInkPage(
  id?: string,
  worksheetBackground: InkWorksheetBackground | null = null,
): InkPage {
  return {
    id: id ?? makeId('page'),
    strokes: [],
    shapes: [],
    solids3d: [],
    graphs: [],
    variationTables: [],
    stamps: [],
    texts: [],
    images: [],
    worksheetBackground,
  };
}

function normalizePage(page: InkPage): InkPage {
  if (Array.isArray(page.variationTables) && Array.isArray(page.stamps)) {
    return page;
  }
  return {
    ...page,
    variationTables: Array.isArray(page.variationTables) ? page.variationTables : [],
    stamps: Array.isArray(page.stamps) ? page.stamps : [],
    worksheetBackground: page.worksheetBackground ?? null,
  };
}

export const DEFAULT_INK_FOLDERS: readonly InkFolder[] = Object.freeze([
  {
    id: 'folder-hinh-hoc',
    name: 'Hình học không gian',
    parentId: null,
    color: '#1D4F6E',
    createdAt: '2026-11-22T00:00:00.000Z',
  },
  {
    id: 'folder-giai-tich',
    name: 'Giải tích & Đồ thị',
    parentId: null,
    color: '#1B5E4A',
    createdAt: '2026-11-22T00:00:00.000Z',
  },
  {
    id: 'folder-dai-so',
    name: 'Cấu trúc đại số',
    parentId: null,
    color: '#8C5828',
    createdAt: '2026-11-22T00:00:00.000Z',
  },
  {
    id: 'folder-giang-day',
    name: 'Giáo án & Bài tập',
    parentId: null,
    color: '#8F3D35',
    createdAt: '2026-11-22T00:00:00.000Z',
  },
]);

function createDefaultNotebook(folderId: string | null = 'folder-hinh-hoc'): InkNotebook {
  return {
    id: 'nb-default-math',
    title: 'Vở Toán — Nháp & Hình không gian',
    folderId,
    paper: { ...DEFAULT_PAPER_CONFIG },
    pages: [createBlankInkPage('page-initial-1')],
    activePageIndex: 0,
    updatedAt: '2026-11-22T00:00:00.000Z',
  };
}

const DEFAULT_NOTEBOOK_SINGLETON: InkNotebook = Object.freeze(createDefaultNotebook());
const FALLBACK_INK_BUCKET: UserInkBucket = Object.freeze({
  folders: DEFAULT_INK_FOLDERS,
  notebooks: Object.freeze([DEFAULT_NOTEBOOK_SINGLETON]),
  activeNotebookId: DEFAULT_NOTEBOOK_SINGLETON.id,
});

function createInitialBucket(): UserInkBucket {
  const nb = createDefaultNotebook();
  return {
    folders: [...DEFAULT_INK_FOLDERS],
    notebooks: [nb],
    activeNotebookId: nb.id,
  };
}

function normalizeBucket(raw: UserInkBucket | undefined): UserInkBucket {
  if (!raw) return createInitialBucket();
  const normalizedNotebooks =
    raw.notebooks.length > 0
      ? raw.notebooks.map((nb) => ({
          ...nb,
          pages: nb.pages.map(normalizePage),
        }))
      : [createDefaultNotebook()];
  return {
    folders: Array.isArray(raw.folders) ? raw.folders : [...DEFAULT_INK_FOLDERS],
    notebooks: normalizedNotebooks,
    activeNotebookId: raw.activeNotebookId,
  };
}

export interface InkNotebookState {
  readonly activeAccountKey: string;
  readonly buckets: Readonly<Record<string, UserInkBucket>>;
  readonly penPresets: readonly PenPreset[];
  readonly activePenPresetId: string;
  readonly undoStack: readonly InkPage[];
  readonly redoStack: readonly InkPage[];

  setActiveAccount: (userId: string | null) => void;

  // Quản lý thư mục đa cấp (Folders & Sub-folders)
  createFolder: (name: string, parentId?: string | null, color?: string) => InkFolder | null;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  moveNotebookToFolder: (notebookId: string, folderId: string | null) => void;

  // Quản lý vở ghi chép
  selectNotebook: (notebookId: string) => void;
  createNotebook: (title?: string, folderId?: string | null) => InkNotebook;
  renameActiveNotebook: (title: string) => void;
  deleteNotebook: (notebookId: string) => void;

  // Quản lý trang vở & kiểu giấy
  updatePaperConfig: (patch: Partial<PaperConfig>) => void;
  selectPage: (index: number) => void;
  addPage: () => void;
  duplicateActivePage: () => void;
  deletePage: (index: number) => void;
  clearActivePage: () => void;

  // Chỉnh sửa nội dung trên trang hiện tại
  commitPageMutation: (updater: (page: InkPage) => InkPage) => void;
  addStroke: (stroke: InkStroke) => void;
  addShape: (shape: InkShapeItem) => void;
  addSolid3D: (solid: Ink3DSolidItem) => void;
  updateSolid3D: (solidId: string, patch: Partial<Ink3DSolidItem>) => void;
  addGraph: (graph: InkGraphItem) => void;
  updateGraph: (graphId: string, patch: Partial<InkGraphItem>) => void;
  addVariationTable: (table: InkVariationTableItem) => void;
  updateVariationTable: (tableId: string, patch: Partial<InkVariationTableItem>) => void;
  addStamp: (stamp: InkStampItem) => void;
  updateStamp: (stampId: string, patch: Partial<InkStampItem>) => void;
  setWorksheetBackground: (bg: InkWorksheetBackground | null) => void;
  addPagesWithWorksheets: (worksheets: readonly InkWorksheetBackground[]) => void;
  addText: (text: InkTextItem) => void;
  addImage: (image: InkImageItem) => void;

  undo: () => void;
  redo: () => void;

  selectPenPreset: (presetId: string) => void;
  updateActivePenPreset: (patch: Partial<Omit<PenPreset, 'id'>>) => void;

  resetInkStore: () => void;
}

export function selectActiveInkBucket(state: InkNotebookState): UserInkBucket {
  return state.buckets[state.activeAccountKey] ?? FALLBACK_INK_BUCKET;
}

export function selectActiveInkFolders(state: InkNotebookState): readonly InkFolder[] {
  const bucket = state.buckets[state.activeAccountKey];
  if (!bucket || !Array.isArray(bucket.folders)) return DEFAULT_INK_FOLDERS;
  return bucket.folders;
}

export function selectActiveNotebook(state: InkNotebookState): InkNotebook {
  const bucket = selectActiveInkBucket(state);
  return (
    bucket.notebooks.find((nb) => nb.id === bucket.activeNotebookId) ??
    bucket.notebooks[0] ??
    DEFAULT_NOTEBOOK_SINGLETON
  );
}

export function selectActiveInkPage(state: InkNotebookState): InkPage {
  const nb = selectActiveNotebook(state);
  return nb.pages[nb.activePageIndex] ?? nb.pages[0] ?? DEFAULT_NOTEBOOK_SINGLETON.pages[0]!;
}

export function selectActivePenPreset(state: InkNotebookState): PenPreset {
  return (
    state.penPresets.find((p) => p.id === state.activePenPresetId) ??
    state.penPresets[0] ??
    DEFAULT_PEN_PRESETS[0]!
  );
}

export const useInkNotebookStore = create<InkNotebookState>()(
  persist(
    (set, get) => ({
      activeAccountKey: INK_GUEST_ACCOUNT_KEY,
      buckets: {},
      penPresets: DEFAULT_PEN_PRESETS,
      activePenPresetId: DEFAULT_PEN_PRESETS[0]!.id,
      undoStack: [],
      redoStack: [],

      setActiveAccount: (userId) => {
        const nextKey = userId?.trim() || INK_GUEST_ACCOUNT_KEY;
        set((state) =>
          state.activeAccountKey === nextKey
            ? state
            : { activeAccountKey: nextKey, undoStack: [], redoStack: [] },
        );
      },

      createFolder: (name, parentId = null, color = '#1D4F6E') => {
        const trimmed = name.trim();
        if (!trimmed) return null;

        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const folder: InkFolder = {
          id: makeId('folder'),
          name: trimmed,
          parentId: parentId ?? null,
          color,
          createdAt: new Date().toISOString(),
        };

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              folders: [...bucket.folders, folder],
            },
          },
        });
        return folder;
      },

      renameFolder: (folderId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              folders: bucket.folders.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f)),
            },
          },
        });
      },

      deleteFolder: (folderId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const target = bucket.folders.find((f) => f.id === folderId);
        if (!target) return;

        // Gom tất cả thư mục con cháu để xóa sạch cây thư mục con, nhưng giữ nguyên vở (đẩy lên thư mục cha)
        const toRemove = new Set<string>([folderId]);
        let added = true;
        while (added) {
          added = false;
          for (const f of bucket.folders) {
            if (f.parentId && toRemove.has(f.parentId) && !toRemove.has(f.id)) {
              toRemove.add(f.id);
              added = true;
            }
          }
        }

        const fallbackFolderId = target.parentId ?? null;
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              folders: bucket.folders.filter((f) => !toRemove.has(f.id)),
              notebooks: bucket.notebooks.map((nb) =>
                nb.folderId && toRemove.has(nb.folderId)
                  ? { ...nb, folderId: fallbackFolderId }
                  : nb,
              ),
            },
          },
        });
      },

      moveNotebookToFolder: (notebookId, folderId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) =>
                nb.id === notebookId ? { ...nb, folderId: folderId ?? null } : nb,
              ),
            },
          },
        });
      },

      selectNotebook: (notebookId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        if (!bucket.notebooks.some((n) => n.id === notebookId)) return;
        set({
          buckets: {
            ...state.buckets,
            [key]: { ...bucket, activeNotebookId: notebookId },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      createNotebook: (title, folderId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const activeNb = bucket.notebooks.find((n) => n.id === bucket.activeNotebookId);
        const resolvedFolderId =
          folderId !== undefined ? folderId : (activeNb?.folderId ?? bucket.folders[0]?.id ?? null);

        const nb: InkNotebook = {
          id: makeId('nb'),
          title: title?.trim() || `Vở ghi chép ${bucket.notebooks.length + 1}`,
          folderId: resolvedFolderId,
          paper: { ...DEFAULT_PAPER_CONFIG },
          pages: [createBlankInkPage()],
          activePageIndex: 0,
          updatedAt: new Date().toISOString(),
        };
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: [nb, ...bucket.notebooks],
              activeNotebookId: nb.id,
            },
          },
          undoStack: [],
          redoStack: [],
        });
        return nb;
      },

      renameActiveNotebook: (title) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const nowIso = new Date().toISOString();
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) =>
                nb.id === bucket.activeNotebookId ? { ...nb, title, updatedAt: nowIso } : nb,
              ),
            },
          },
        });
      },

      deleteNotebook: (notebookId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const remaining = bucket.notebooks.filter((n) => n.id !== notebookId);
        const nextList = remaining.length > 0 ? remaining : [createDefaultNotebook()];
        const nextActiveId =
          bucket.activeNotebookId === notebookId ? nextList[0]!.id : bucket.activeNotebookId;
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: nextList,
              activeNotebookId: nextActiveId,
            },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      updatePaperConfig: (patch) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const nowIso = new Date().toISOString();
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) =>
                nb.id === bucket.activeNotebookId
                  ? { ...nb, paper: { ...nb.paper, ...patch }, updatedAt: nowIso }
                  : nb,
              ),
            },
          },
        });
      },

      selectPage: (index) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) => {
                if (nb.id !== bucket.activeNotebookId) return nb;
                const clamped = Math.max(0, Math.min(nb.pages.length - 1, index));
                return { ...nb, activePageIndex: clamped };
              }),
            },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      addPage: () => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const nowIso = new Date().toISOString();
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) => {
                if (nb.id !== bucket.activeNotebookId) return nb;
                const nextPages = [...nb.pages, createBlankInkPage()];
                return {
                  ...nb,
                  pages: nextPages,
                  activePageIndex: nextPages.length - 1,
                  updatedAt: nowIso,
                };
              }),
            },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      duplicateActivePage: () => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const nowIso = new Date().toISOString();
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) => {
                if (nb.id !== bucket.activeNotebookId) return nb;
                const cur = nb.pages[nb.activePageIndex] ?? nb.pages[0]!;
                const copy: InkPage = { ...cur, id: makeId('page') };
                const nextPages = [...nb.pages];
                nextPages.splice(nb.activePageIndex + 1, 0, copy);
                return {
                  ...nb,
                  pages: nextPages,
                  activePageIndex: nb.activePageIndex + 1,
                  updatedAt: nowIso,
                };
              }),
            },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      deletePage: (index) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const nowIso = new Date().toISOString();
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) => {
                if (nb.id !== bucket.activeNotebookId) return nb;
                const filtered = nb.pages.filter((_, i) => i !== index);
                const nextPages = filtered.length > 0 ? filtered : [createBlankInkPage()];
                const nextIdx = Math.min(nb.activePageIndex, nextPages.length - 1);
                return {
                  ...nb,
                  pages: nextPages,
                  activePageIndex: nextIdx,
                  updatedAt: nowIso,
                };
              }),
            },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      clearActivePage: () => {
        get().commitPageMutation((page) =>
          createBlankInkPage(
            page.id,
            page.worksheetBackground?.locked ? page.worksheetBackground : null,
          ),
        );
      },

      commitPageMutation: (updater) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const activeNb =
          bucket.notebooks.find((n) => n.id === bucket.activeNotebookId) ?? bucket.notebooks[0]!;
        const currentPage = activeNb.pages[activeNb.activePageIndex] ?? activeNb.pages[0]!;
        const nextPage = updater(currentPage);
        if (nextPage === currentPage) return;

        const nowIso = new Date().toISOString();
        const nextUndo = [...state.undoStack, currentPage].slice(-40);

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) => {
                if (nb.id !== activeNb.id) return nb;
                return {
                  ...nb,
                  pages: nb.pages.map((p, idx) => (idx === nb.activePageIndex ? nextPage : p)),
                  updatedAt: nowIso,
                };
              }),
            },
          },
          undoStack: nextUndo,
          redoStack: [],
        });
      },

      addStroke: (stroke) => {
        get().commitPageMutation((page) => ({
          ...page,
          strokes: [...page.strokes, stroke],
        }));
      },

      addShape: (shape) => {
        get().commitPageMutation((page) => ({
          ...page,
          shapes: [...page.shapes, shape],
        }));
      },

      addSolid3D: (solid) => {
        get().commitPageMutation((page) => ({
          ...page,
          solids3d: [...page.solids3d, solid],
        }));
      },

      updateSolid3D: (solidId, patch) => {
        get().commitPageMutation((page) => ({
          ...page,
          solids3d: page.solids3d.map((s) => (s.id === solidId ? { ...s, ...patch } : s)),
        }));
      },

      addGraph: (graph) => {
        get().commitPageMutation((page) => ({
          ...page,
          graphs: [...page.graphs, graph],
        }));
      },

      updateGraph: (graphId, patch) => {
        get().commitPageMutation((page) => ({
          ...page,
          graphs: page.graphs.map((g) => (g.id === graphId ? { ...g, ...patch } : g)),
        }));
      },

      addVariationTable: (table) => {
        get().commitPageMutation((page) => ({
          ...page,
          variationTables: [...(page.variationTables ?? []), table],
        }));
      },

      updateVariationTable: (tableId, patch) => {
        get().commitPageMutation((page) => ({
          ...page,
          variationTables: (page.variationTables ?? []).map((t) =>
            t.id === tableId ? { ...t, ...patch } : t,
          ),
        }));
      },

      addStamp: (stamp) => {
        get().commitPageMutation((page) => ({
          ...page,
          stamps: [...(page.stamps ?? []), stamp],
        }));
      },

      updateStamp: (stampId, patch) => {
        get().commitPageMutation((page) => ({
          ...page,
          stamps: (page.stamps ?? []).map((st) => (st.id === stampId ? { ...st, ...patch } : st)),
        }));
      },

      setWorksheetBackground: (bg) => {
        get().commitPageMutation((page) => ({
          ...page,
          worksheetBackground: bg,
        }));
      },

      addPagesWithWorksheets: (worksheets) => {
        if (worksheets.length === 0) return;
        const state = get();
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const nowIso = new Date().toISOString();

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) => {
                if (nb.id !== bucket.activeNotebookId) return nb;
                const current = nb.pages[nb.activePageIndex];
                const canReuseCurrent = current && !current.worksheetBackground;
                const [first, ...rest] = worksheets;
                const updatedPages = [...nb.pages];
                let insertIdx = nb.activePageIndex;

                if (canReuseCurrent && first) {
                  updatedPages[nb.activePageIndex] = {
                    ...current,
                    worksheetBackground: first,
                  };
                  const extraPages = rest.map((ws) => createBlankInkPage(undefined, ws));
                  updatedPages.splice(nb.activePageIndex + 1, 0, ...extraPages);
                } else {
                  const newPages = worksheets.map((ws) => createBlankInkPage(undefined, ws));
                  insertIdx = nb.activePageIndex + 1;
                  updatedPages.splice(insertIdx, 0, ...newPages);
                }

                return {
                  ...nb,
                  pages: updatedPages,
                  activePageIndex: insertIdx,
                  updatedAt: nowIso,
                };
              }),
            },
          },
          undoStack: [],
          redoStack: [],
        });
      },

      addText: (text) => {
        get().commitPageMutation((page) => ({
          ...page,
          texts: [...page.texts, text],
        }));
      },

      addImage: (image) => {
        get().commitPageMutation((page) => ({
          ...page,
          images: [...page.images, image],
        }));
      },

      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return;
        const previousPage = state.undoStack[state.undoStack.length - 1]!;
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const activeNb =
          bucket.notebooks.find((n) => n.id === bucket.activeNotebookId) ?? bucket.notebooks[0]!;
        const currentPage = activeNb.pages[activeNb.activePageIndex] ?? activeNb.pages[0]!;

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) =>
                nb.id === activeNb.id
                  ? {
                      ...nb,
                      pages: nb.pages.map((p, idx) =>
                        idx === nb.activePageIndex ? previousPage : p,
                      ),
                    }
                  : nb,
              ),
            },
          },
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, currentPage].slice(-40),
        });
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;
        const nextPage = state.redoStack[state.redoStack.length - 1]!;
        const key = state.activeAccountKey;
        const bucket = normalizeBucket(state.buckets[key]);
        const activeNb =
          bucket.notebooks.find((n) => n.id === bucket.activeNotebookId) ?? bucket.notebooks[0]!;
        const currentPage = activeNb.pages[activeNb.activePageIndex] ?? activeNb.pages[0]!;

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              notebooks: bucket.notebooks.map((nb) =>
                nb.id === activeNb.id
                  ? {
                      ...nb,
                      pages: nb.pages.map((p, idx) => (idx === nb.activePageIndex ? nextPage : p)),
                    }
                  : nb,
              ),
            },
          },
          undoStack: [...state.undoStack, currentPage].slice(-40),
          redoStack: state.redoStack.slice(0, -1),
        });
      },

      selectPenPreset: (presetId) => {
        set({ activePenPresetId: presetId });
      },

      updateActivePenPreset: (patch) => {
        set((state) => ({
          penPresets: state.penPresets.map((preset) =>
            preset.id === state.activePenPresetId ? { ...preset, ...patch } : preset,
          ),
        }));
      },

      resetInkStore: () => {
        set({
          activeAccountKey: INK_GUEST_ACCOUNT_KEY,
          buckets: {},
          penPresets: DEFAULT_PEN_PRESETS,
          activePenPresetId: DEFAULT_PEN_PRESETS[0]!.id,
          undoStack: [],
          redoStack: [],
        });
      },
    }),
    {
      name: 'learning-universe-math-ink-v1',
      partialize: (state) => ({
        activeAccountKey: state.activeAccountKey,
        buckets: state.buckets,
        penPresets: state.penPresets,
        activePenPresetId: state.activePenPresetId,
      }),
    },
  ),
);
