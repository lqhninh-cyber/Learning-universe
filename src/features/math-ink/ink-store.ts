import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_PAPER_CONFIG,
  DEFAULT_PEN_PRESETS,
  type Ink3DSolidItem,
  type InkGraphItem,
  type InkImageItem,
  type InkNotebook,
  type InkPage,
  type InkShapeItem,
  type InkStroke,
  type InkTextItem,
  type PaperConfig,
  type PenPreset,
} from './types';

export const INK_GUEST_ACCOUNT_KEY = 'guest';

export interface UserInkBucket {
  readonly notebooks: readonly InkNotebook[];
  readonly activeNotebookId: string;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createBlankInkPage(id?: string): InkPage {
  return {
    id: id ?? makeId('page'),
    strokes: [],
    shapes: [],
    solids3d: [],
    graphs: [],
    texts: [],
    images: [],
  };
}

function createDefaultNotebook(): InkNotebook {
  return {
    id: 'nb-default-math',
    title: 'Vở Toán — Nháp & Hình không gian',
    paper: { ...DEFAULT_PAPER_CONFIG },
    pages: [createBlankInkPage('page-initial-1')],
    activePageIndex: 0,
    updatedAt: '2026-11-22T00:00:00.000Z',
  };
}

const DEFAULT_NOTEBOOK_SINGLETON: InkNotebook = Object.freeze(createDefaultNotebook());
const FALLBACK_INK_BUCKET: UserInkBucket = Object.freeze({
  notebooks: Object.freeze([DEFAULT_NOTEBOOK_SINGLETON]),
  activeNotebookId: DEFAULT_NOTEBOOK_SINGLETON.id,
});

function createInitialBucket(): UserInkBucket {
  const nb = createDefaultNotebook();
  return {
    notebooks: [nb],
    activeNotebookId: nb.id,
  };
}

export interface InkNotebookState {
  readonly activeAccountKey: string;
  readonly buckets: Readonly<Record<string, UserInkBucket>>;
  readonly penPresets: readonly PenPreset[];
  readonly activePenPresetId: string;
  /** Lịch sử Undo/Redo trong phiên (không lưu localStorage để giữ dung lượng nhỏ gọn) */
  readonly undoStack: readonly InkPage[];
  readonly redoStack: readonly InkPage[];

  setActiveAccount: (userId: string | null) => void;
  selectNotebook: (notebookId: string) => void;
  createNotebook: (title?: string) => InkNotebook;
  renameActiveNotebook: (title: string) => void;
  deleteNotebook: (notebookId: string) => void;

  updatePaperConfig: (patch: Partial<PaperConfig>) => void;
  selectPage: (index: number) => void;
  addPage: () => void;
  duplicateActivePage: () => void;
  deletePage: (index: number) => void;
  clearActivePage: () => void;

  commitPageMutation: (updater: (page: InkPage) => InkPage) => void;
  addStroke: (stroke: InkStroke) => void;
  addShape: (shape: InkShapeItem) => void;
  addSolid3D: (solid: Ink3DSolidItem) => void;
  addGraph: (graph: InkGraphItem) => void;
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

      selectNotebook: (notebookId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
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

      createNotebook: (title) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        const nb: InkNotebook = {
          id: makeId('nb'),
          title: title?.trim() || `Vở ghi chép ${bucket.notebooks.length + 1}`,
          paper: { ...DEFAULT_PAPER_CONFIG },
          pages: [createBlankInkPage()],
          activePageIndex: 0,
          updatedAt: new Date().toISOString(),
        };
        set({
          buckets: {
            ...state.buckets,
            [key]: {
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        const bucket = state.buckets[key] ?? createInitialBucket();
        const remaining = bucket.notebooks.filter((n) => n.id !== notebookId);
        const nextList = remaining.length > 0 ? remaining : [createDefaultNotebook()];
        const nextActiveId =
          bucket.activeNotebookId === notebookId ? nextList[0]!.id : bucket.activeNotebookId;
        set({
          buckets: {
            ...state.buckets,
            [key]: {
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        get().commitPageMutation((page) => createBlankInkPage(page.id));
      },

      commitPageMutation: (updater) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
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

      addGraph: (graph) => {
        get().commitPageMutation((page) => ({
          ...page,
          graphs: [...page.graphs, graph],
        }));
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
        const bucket = state.buckets[key] ?? createInitialBucket();
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
