import { ArrowUpRight, FilePenLine, Folder, PenTool, Plus } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { STUDIO_PREVIEW_ASSETS } from '@/config/atmosphereAssets';
import { selectActiveExamBucket, useExamBuilderStore } from '@/features/exam-builder';
import {
  selectActiveInkBucket,
  selectActiveInkFolders,
  useInkNotebookStore,
} from '@/features/math-ink';
import { ROUTES } from '@/shared/config/routes';

export const RecentStudioShelf: FC = () => {
  const navigate = useNavigate();
  const [inkImgFailed, setInkImgFailed] = useState(false);
  const [examImgFailed, setExamImgFailed] = useState(false);

  const inkBucket = useInkNotebookStore(selectActiveInkBucket);
  const inkFolders = useInkNotebookStore(selectActiveInkFolders);
  const selectNotebook = useInkNotebookStore((s) => s.selectNotebook);
  const createNotebook = useInkNotebookStore((s) => s.createNotebook);

  const examBucket = useExamBuilderStore(selectActiveExamBucket);
  const selectExam = useExamBuilderStore((s) => s.selectExam);
  const createNewExam = useExamBuilderStore((s) => s.createNewExam);

  const folderNameById = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const f of inkFolders) {
      map.set(f.id, { name: f.name, color: f.color });
    }
    return map;
  }, [inkFolders]);

  const recentNotebooks = useMemo(() => {
    return [...inkBucket.notebooks]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 2);
  }, [inkBucket.notebooks]);

  const recentExam = useMemo(() => {
    return (
      examBucket.exams.find((ex) => ex.id === examBucket.activeExamId) ??
      examBucket.exams[0] ??
      null
    );
  }, [examBucket.activeExamId, examBucket.exams]);

  const handleOpenNotebook = (notebookId: string) => {
    selectNotebook(notebookId);
    void navigate(ROUTES.mathInk);
  };

  const handleCreateNotebook = () => {
    createNotebook();
    void navigate(ROUTES.mathInk);
  };

  const handleOpenExam = (examId: string) => {
    selectExam(examId);
    void navigate(ROUTES.examBuilder);
  };

  const handleCreateExam = () => {
    createNewExam('blank');
    void navigate(ROUTES.examBuilder);
  };

  return (
    <section
      aria-label="Kệ Studio gần đây cho Bảng viết và Soạn đề"
      data-testid="recent-studio-shelf"
      className="flex min-w-0 flex-col justify-between gap-4 rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]"
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-[17px] leading-tight font-semibold text-[var(--text-main)]">
              Studio gần đây
            </h2>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">
              Mở lại vở Bảng viết & đề Soạn đề bằng 1 chạm
            </p>
          </div>
          <span className="rounded-full bg-[#EAF5F0] px-2.5 py-1 font-mono text-[10px] font-bold text-[#0F7656] dark:bg-[#132C24] dark:text-[#4AD1A3]">
            {inkBucket.notebooks.length} vở · {examBucket.exams.length} đề
          </span>
        </div>

        {/* Dải thẻ ảnh minh họa trực quan cho Bảng viết & Soạn đề */}
        <div data-testid="studio-visual-preview-strip" className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => void navigate(ROUTES.mathInk)}
            style={{ backgroundImage: STUDIO_PREVIEW_ASSETS.mathInk.fallbackGradient }}
            className="group/prev1 relative h-[86px] w-full cursor-pointer overflow-hidden rounded-[18px] border border-black/[0.06] text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08]"
          >
            {!inkImgFailed && (
              <img
                src={STUDIO_PREVIEW_ASSETS.mathInk.src}
                alt={STUDIO_PREVIEW_ASSETS.mathInk.alt}
                loading="lazy"
                decoding="async"
                onError={() => setInkImgFailed(true)}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/prev1:scale-105 dark:brightness-[0.82]"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0D211B]/80 via-[#0D211B]/25 to-transparent"
            />
            <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between gap-1 text-white">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide">
                <PenTool className="h-3 w-3 text-[#93D5FA]" aria-hidden="true" />
                <span>Bảng viết</span>
              </span>
              <ArrowUpRight
                className="h-3.5 w-3.5 text-white/80 transition-transform duration-150 group-hover/prev1:translate-x-0.5 group-hover/prev1:-translate-y-0.5"
                aria-hidden="true"
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => void navigate(ROUTES.examBuilder)}
            style={{ backgroundImage: STUDIO_PREVIEW_ASSETS.examBuilder.fallbackGradient }}
            className="group/prev2 relative h-[86px] w-full cursor-pointer overflow-hidden rounded-[18px] border border-black/[0.06] text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08]"
          >
            {!examImgFailed && (
              <img
                src={STUDIO_PREVIEW_ASSETS.examBuilder.src}
                alt={STUDIO_PREVIEW_ASSETS.examBuilder.alt}
                loading="lazy"
                decoding="async"
                onError={() => setExamImgFailed(true)}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/prev2:scale-105 dark:brightness-[0.82]"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0D211B]/80 via-[#0D211B]/25 to-transparent"
            />
            <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between gap-1 text-white">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide">
                <FilePenLine className="h-3 w-3 text-[#F5D078]" aria-hidden="true" />
                <span>Soạn đề</span>
              </span>
              <ArrowUpRight
                className="h-3.5 w-3.5 text-white/80 transition-transform duration-150 group-hover/prev2:translate-x-0.5 group-hover/prev2:-translate-y-0.5"
                aria-hidden="true"
              />
            </div>
          </button>
        </div>

        {/* 1. Vở Bảng viết gần nhất */}
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Bảng viết
          </p>
          <div className="space-y-1.5">
            {recentNotebooks.map((nb) => {
              const folderMeta = nb.folderId ? folderNameById.get(nb.folderId) : null;
              const elementCount = nb.pages.reduce(
                (sum, pg) =>
                  sum +
                  pg.strokes.length +
                  pg.shapes.length +
                  pg.solids3d.length +
                  pg.graphs.length +
                  (pg.variationTables?.length ?? 0) +
                  (pg.stamps?.length ?? 0),
                0,
              );
              return (
                <button
                  key={nb.id}
                  type="button"
                  data-testid={`studio-recent-notebook-${nb.id}`}
                  onClick={() => handleOpenNotebook(nb.id)}
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-black/[0.05] bg-[#F6F8F7] px-3.5 py-2.5 text-left transition-all duration-150 hover:border-[#0F7656]/40 hover:bg-[#EFF7F3] dark:border-white/[0.06] dark:bg-[#0F1715] dark:hover:bg-[#142520]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#1D4F6E] shadow-2xs dark:bg-[#162328] dark:text-[#64A8D1]">
                      <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[var(--text-main)] group-hover:text-[#0F7656] dark:group-hover:text-[#4AD1A3]">
                        {nb.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-[var(--text-muted)]">
                        {folderMeta && (
                          <span className="inline-flex max-w-[120px] items-center gap-1 truncate">
                            <Folder
                              className="h-2.5 w-2.5 shrink-0"
                              style={{ color: folderMeta.color }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{folderMeta.name}</span>
                          </span>
                        )}
                        <span className="tabular-nums">
                          {nb.pages.length} trang · {elementCount} nét/hình
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0F7656]"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Đề đang soạn dở */}
        {recentExam && (
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Soạn đề
            </p>
            <button
              type="button"
              data-testid="studio-recent-exam"
              onClick={() => handleOpenExam(recentExam.id)}
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-black/[0.05] bg-[#F6F8F7] px-3.5 py-2.5 text-left transition-all duration-150 hover:border-[#0F7656]/40 hover:bg-[#EFF7F3] dark:border-white/[0.06] dark:bg-[#0F1715] dark:hover:bg-[#142520]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#8C5828] shadow-2xs dark:bg-[#231B14] dark:text-[#D99B5E]">
                  <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[var(--text-main)] group-hover:text-[#0F7656] dark:group-hover:text-[#4AD1A3]">
                    {recentExam.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)] tabular-nums">
                    {Object.keys(recentExam.images).length} hình đính kèm · Sẵn sàng xuất A4 / LaTeX
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0F7656]"
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>

      {/* 2 nút tạo nhanh dạng pill bo tròn kiểu Quixotic */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          data-testid="studio-quick-new-notebook"
          onClick={handleCreateNotebook}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0F7656] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#0D664A] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Vở viết mới</span>
        </button>
        <button
          type="button"
          data-testid="studio-quick-new-exam"
          onClick={handleCreateExam}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[#F6F8F7] px-3 py-2 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[#0F7656]/45 hover:text-[#0F7656] active:scale-[0.98] dark:bg-[#0F1715]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tạo đề mới</span>
        </button>
      </div>
    </section>
  );
};

export default RecentStudioShelf;
