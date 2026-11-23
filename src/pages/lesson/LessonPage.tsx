import { ArrowLeft, CheckCircle2, Link2, PanelLeft, PanelRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import {
  type CompiledLessonModule,
  getAdjacentLessons,
  getLessonById,
  getLessonBySlug,
  LessonMdxView,
  loadLessonModule,
} from '@/content-runtime';
import {
  EditorialChapterOpener,
  SplitStudyPane,
  type ChapterCloItem,
  type ChapterDifficultyLevel,
  type SplitStudyTab,
} from '@/components/lesson';
import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  getIslandSubjectByIdOrSlug,
  writeLessonReadingPosition,
} from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { useLayout } from '@/context/LayoutContext';
import { useReadingSettings } from '@/context/ReadingSettingsContext';
import { useLearningStore } from '@/features/learning';
import {
  DevEditorialBar,
  LessonActionBar,
  LessonPrevNextNav,
  LessonSidebar,
  SourcePanel,
} from '@/features/lesson-reader';
import { InPageSearchNavigator, useInPageSearch } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Button, Card, Drawer, Skeleton } from '@/shared/ui';
import { safeStorage } from '@/utils/safeStorage';

function getCurriculumSource(slug: string): string {
  if (slug === 'giao-duc-hoc') {
    return 'Giáo trình Giáo dục học — Trường ĐH Sư phạm TP.HCM (HCMUE, K50–51)';
  }
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return 'Giáo trình Giải tích hàm một biến — PGS.TS. Trần Trí Dũng (NXB Giáo dục)';
  }
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') {
    return 'Giáo trình Hình học cao cấp — GS. Nguyễn Mộng Hy / TS. Huỳnh Việt Khánh (NXB Giáo dục)';
  }
  if (slug === 'cau-truc-dai-so' || slug === 'algebraic-structures') {
    return 'Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường — TS. Huỳnh Việt Khánh (NXB Giáo dục)';
  }
  return 'Giáo trình chuẩn Đại học Sư phạm';
}

function getDifficultyLevel(
  level: 'basic' | 'intermediate' | 'advanced',
  slug: string,
): ChapterDifficultyLevel {
  if (slug === 'giao-duc-hoc') return 'Nghiệp vụ thực hành';
  if (level === 'basic') return 'Nền tảng';
  if (level === 'advanced') return 'Chuyên sâu';
  return 'Trung cấp';
}

function getCloFallbackDescription(slug: string): string {
  if (slug === 'giao-duc-hoc') {
    return 'Phân tích cơ sở lý luận và nghiệp vụ sư phạm giải quyết tình huống thực tế';
  }
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return 'Chứng minh giới hạn và phân tích tính chất giải tích bằng ngôn ngữ Epsilon';
  }
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') {
    return 'Khảo sát cấu trúc hình học afin, phương trình m-phẳng và ánh xạ afin';
  }
  return 'Phân tích cấu trúc đại số và chứng minh các mệnh đề học thuật';
}

function getLessonClos(tags: readonly string[], slug: string): readonly ChapterCloItem[] {
  const cloTags = tags.filter((t) => /^CLO/i.test(t));
  if (cloTags.length > 0) {
    return cloTags.map((tag) => {
      const match = tag.match(/^CLO-?(\d+(?:\.\d+)?)(?:\s*[:-]\s*(.*))?$/i);
      const code = match ? `CLO ${match[1]}` : tag;
      const desc = match?.[2] || getCloFallbackDescription(slug);
      return { code, description: desc };
    });
  }

  if (slug === 'giao-duc-hoc') {
    return [
      {
        code: 'CLO 1.1',
        description:
          'Phân tích bản chất hiện tượng giáo dục và chuẩn nghề nghiệp giáo viên THCS/THPT',
      },
      {
        code: 'CLO 6.2',
        description: 'Vận dụng 5 bước xử lý sư phạm và khung pháp quy giáo dục giải quyết xung đột',
      },
    ];
  }
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return [
      {
        code: 'CLO 1.2',
        description:
          'Kỹ thuật định lượng và chứng minh giới hạn dãy số bằng ngôn ngữ ε–N (Epsilon)',
      },
      {
        code: 'CLO 2.1',
        description:
          'Vận dụng tiêu chuẩn hội tụ Cauchy, Weierstrass và tính liên tục phân tích hàm số',
      },
    ];
  }
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') {
    return [
      {
        code: 'CLO 2.1',
        description:
          'Xác định mục tiêu afin, phương và hệ phương trình tham số của m-phẳng trong không gian Afin',
      },
      {
        code: 'CLO 3.2',
        description:
          'Vận dụng nhóm các phép biến đổi afin và tính chất bất biến trong nghiên cứu hình học',
      },
    ];
  }
  return [
    {
      code: 'CLO 1.1',
      description:
        'Nắm vững hệ thống tiên đề cấu trúc đại số: Nhóm, Vành, Trường và các định lý đẳng cấu',
    },
  ];
}

const SPLIT_PANE_STORAGE_KEY = 'lu_split_pane_open';

function readInitialLeftSidebarOpen(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = safeStorage.getItem('lu_sidebar_collapsed');
  if (saved === 'true') return false;
  if (saved === 'false') return true;
  return window.innerWidth >= 1280;
}

function readInitialSplitPaneOpen(): boolean {
  const saved = safeStorage.getItem(SPLIT_PANE_STORAGE_KEY);
  if (saved === 'false') return false;
  if (saved === 'true') return true;
  return true;
}

function LessonPageContent() {
  const { pathname } = useLocation();
  const { subjectSlug, chapterSlug, lessonSlug } = useParams<{
    subjectSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }>();

  const location =
    subjectSlug && chapterSlug && lessonSlug
      ? getLessonBySlug(subjectSlug, chapterSlug, lessonSlug)
      : undefined;

  const lessonId = location?.lesson.id;
  const subjectId = location?.subject.id;

  const recordLessonVisit = useLearningStore((state) => state.recordLessonVisit);
  const isLessonCompleted = useLearningStore((state) =>
    Boolean(lessonId && state.completedLessons[lessonId]),
  );
  const toggleLessonCompleted = useLearningStore((state) => state.toggleLessonCompleted);

  const [loadedMap, setLoadedMap] = useState<Readonly<Record<string, CompiledLessonModule>>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(readInitialLeftSidebarOpen);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const [isSplitPaneOpen, setIsSplitPaneOpen] = useState<boolean>(readInitialSplitPaneOpen);
  const [isMobileSplitOpen, setIsMobileSplitOpen] = useState<boolean>(false);
  const [splitTab, setSplitTab] = useState<SplitStudyTab>('toc');

  const { theme, fontSize, typographyClasses } = useReadingSettings();
  const {
    readerSettings,
    increaseFontScale,
    decreaseFontScale,
    toggleDarkMode,
    toggleZenMode,
    setZenMode,
    triggerIslandNotice,
  } = useIsland();
  const readingTheme = readerSettings.isDarkMode ? 'dark' : theme === 'dark' ? 'light' : theme;
  const isEyeComfort =
    readerSettings.eyeComfortWarmth && readingTheme !== 'dark' && readingTheme !== 'sepia';
  const isZenMode = readerSettings.isZenMode;
  const articleRef = useRef<HTMLElement>(null);

  // Phím tắt trình đọc: D (Sáng/Tối), Z (Zen Mode), Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const nextDark = !readerSettings.isDarkMode;
        toggleDarkMode();
        triggerIslandNotice({
          text: nextDark ? 'Đã chuyển sang chế độ Tối' : 'Đã chuyển sang chế độ Sáng',
          type: 'info',
        });
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        const nextZen = !isZenMode;
        toggleZenMode();
        triggerIslandNotice({
          text: nextZen ? 'Đã bật chế độ tập trung Zen' : 'Đã tắt chế độ tập trung Zen',
          type: 'info',
        });
      } else if (e.key === 'Escape') {
        if (isMobileSplitOpen) {
          e.preventDefault();
          setIsMobileSplitOpen(false);
        } else if (isZenMode) {
          e.preventDefault();
          setZenMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    readerSettings.isDarkMode,
    isZenMode,
    isMobileSplitOpen,
    toggleDarkMode,
    toggleZenMode,
    setZenMode,
    triggerIslandNotice,
  ]);

  const handleToggleLeftSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setIsSidebarDrawerOpen((prev) => !prev);
      return;
    }
    setIsLeftSidebarOpen((prev) => {
      const next = !prev;
      safeStorage.setItem('lu_sidebar_collapsed', String(!next));
      return next;
    });
  }, []);

  const handleSetSplitPaneOpen = useCallback((nextOpen: boolean) => {
    setIsSplitPaneOpen(nextOpen);
    safeStorage.setItem(SPLIT_PANE_STORAGE_KEY, String(nextOpen));
  }, []);

  const handleToggleSplitPane = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSplitOpen((prev) => !prev);
      return;
    }
    setIsSplitPaneOpen((prev) => {
      const next = !prev;
      safeStorage.setItem(SPLIT_PANE_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const handleTopBarComplete = useCallback(() => {
    if (!lessonId) return;
    const wasCompleted = Boolean(useLearningStore.getState().completedLessons[lessonId]);
    if (!toggleLessonCompleted(lessonId)) {
      return;
    }

    const loc = getLessonById(lessonId);
    const shortLesson = loc ? `Bài ${loc.chapter.number}.${loc.lesson.number}` : 'bài học';
    if (wasCompleted) {
      triggerIslandNotice({ text: `Đã bỏ đánh dấu ${shortLesson}`, type: 'info' });
      return;
    }

    if (loc) {
      const updatedMap = useLearningStore.getState().completedLessons;
      const allLessons = loc.subject.chapters.flatMap((ch) => ch.lessons);
      const doneInSubject = allLessons.filter((item) => Boolean(updatedMap[item.id])).length;
      const pct = allLessons.length > 0 ? Math.round((doneInSubject / allLessons.length) * 100) : 0;
      const subjectCode = getIslandSubjectByIdOrSlug(loc.subject.slug)?.code ?? loc.subject.title;
      triggerIslandNotice({
        text: `Đã hoàn thành ${shortLesson} · Tiến độ ${subjectCode}: ${pct}%`,
        type: 'success',
      });
      return;
    }

    triggerIslandNotice({ text: `Đã hoàn thành ${shortLesson}`, type: 'success' });
  }, [lessonId, toggleLessonCompleted, triggerIslandNotice]);

  const compiled = lessonId ? loadedMap[lessonId] : undefined;

  const inPageSearch = useInPageSearch({
    containerRef: articleRef,
    contentReadyKey: lessonId ? `${lessonId}:${compiled ? 'ready' : 'loading'}` : 'none',
  });

  // Gắn 4 công cụ trình đọc gọn nhẹ lên góc phải TopContextBar & tự thu gọn LeftRail về 60px trên desktop
  const { setTopBarRightSlot, setRailCollapsed } = useLayout();
  const didAutoCollapseRailRef = useRef(false);
  useEffect(() => {
    if (didAutoCollapseRailRef.current) return;
    didAutoCollapseRailRef.current = true;
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setRailCollapsed(true);
    }
  }, [setRailCollapsed]);
  const scalePercent = Math.round(readerSettings.fontScale * 100);
  const isMinScale = readerSettings.fontScale <= FONT_SCALE_MIN;
  const isMaxScale = readerSettings.fontScale >= FONT_SCALE_MAX;

  const topBarToolsNode = useMemo(
    () => (
      <div
        role="group"
        aria-label="Công cụ trình đọc bài giảng"
        data-testid="quick-reader-controls"
        className="flex items-center gap-1.5"
      >
        {/* 1. Bật/tắt Mục lục học phần bên trái */}
        <button
          type="button"
          data-testid="lesson-sidebar-toggle"
          onClick={handleToggleLeftSidebar}
          aria-pressed={isLeftSidebarOpen || isSidebarDrawerOpen}
          aria-label="Bật hoặc tắt mục lục học phần"
          title="Mục lục học phần"
          className={cn(
            'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors',
            isLeftSidebarOpen || isSidebarDrawerOpen
              ? 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)]'
              : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <PanelLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden 2xl:inline">Học phần</span>
        </button>

        {/* 2. Bộ chỉnh cỡ chữ siêu gọn: A- / 100% / A+ */}
        <div className="hidden items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5 sm:flex">
          <button
            type="button"
            onClick={decreaseFontScale}
            disabled={isMinScale}
            aria-label="Giảm cỡ chữ"
            title="Giảm cỡ chữ"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            A-
          </button>
          <span
            data-testid="quick-reader-scale-badge"
            aria-live="polite"
            className="min-w-[36px] text-center font-mono text-[11px] font-medium text-[var(--text-muted)] tabular-nums select-none"
          >
            {scalePercent}%
          </span>
          <button
            type="button"
            onClick={increaseFontScale}
            disabled={isMaxScale}
            aria-label="Tăng cỡ chữ"
            title="Tăng cỡ chữ"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            A+
          </button>
        </div>

        {/* 3. Nút Chia đôi công cụ (Split-Pane) */}
        <button
          type="button"
          data-testid="lesson-split-pane-toggle"
          onClick={handleToggleSplitPane}
          aria-pressed={isSplitPaneOpen || isMobileSplitOpen}
          aria-label="Bật hoặc tắt ngăn chia đôi công cụ học tập"
          title="Chia đôi công cụ (Mục lục · Thuật ngữ)"
          className={cn(
            'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
            isSplitPaneOpen || isMobileSplitOpen
              ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white shadow-2xs'
              : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]',
          )}
        >
          <PanelRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline">Chia đôi</span>
        </button>

        {/* 4. Nút Đánh dấu hoàn thành bài */}
        {lessonId && (
          <button
            type="button"
            data-testid="lesson-topbar-complete-btn"
            onClick={handleTopBarComplete}
            aria-pressed={isLessonCompleted}
            aria-label={isLessonCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành'}
            title={isLessonCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành bài học'}
            className={cn(
              'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
              isLessonCompleted
                ? 'border-[#1B5E4A] bg-[#1B5E4A] text-white dark:border-[#52B394] dark:bg-[#52B394] dark:text-[#0D1110]'
                : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)] hover:border-[var(--accent-os)] hover:text-[var(--accent-os)]',
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">
              {isLessonCompleted ? 'Đã hoàn thành' : 'Hoàn thành'}
            </span>
          </button>
        )}
      </div>
    ),
    [
      decreaseFontScale,
      handleToggleLeftSidebar,
      handleToggleSplitPane,
      handleTopBarComplete,
      increaseFontScale,
      isLeftSidebarOpen,
      isLessonCompleted,
      isMaxScale,
      isMinScale,
      isMobileSplitOpen,
      isSidebarDrawerOpen,
      isSplitPaneOpen,
      lessonId,
      scalePercent,
    ],
  );

  useEffect(() => {
    setTopBarRightSlot(topBarToolsNode);
    return () => {
      setTopBarRightSlot(null);
    };
  }, [setTopBarRightSlot, topBarToolsNode]);

  useEffect(() => {
    if (subjectId && lessonId) {
      recordLessonVisit(subjectId, lessonId);
    }
  }, [subjectId, lessonId, recordLessonVisit]);

  useEffect(() => {
    if (!lessonId || typeof window === 'undefined') return;

    let rafId = 0;
    let lastSavedKey = '';

    const updateReadingPosition = () => {
      rafId = 0;
      const articleEl = articleRef.current;
      if (!articleEl) return;

      const rect = articleEl.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const scrollable = Math.max(1, articleEl.scrollHeight - window.innerHeight * 0.65);
      const rawProgress = ((window.scrollY - articleTop + 160) / scrollable) * 100;
      const progressPercent = Math.max(0, Math.min(100, Math.round(rawProgress)));

      const headings = articleEl.querySelectorAll<HTMLElement>('h2, h3');
      let sectionTitle = '';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 160) {
          sectionTitle = (heading.textContent ?? '').trim();
        } else {
          break;
        }
      }
      if (!sectionTitle && headings.length > 0) {
        sectionTitle = (headings[0]?.textContent ?? '').trim();
      }

      const nextKey = `${sectionTitle}::${progressPercent}`;
      if (nextKey !== lastSavedKey && sectionTitle) {
        lastSavedKey = nextKey;
        writeLessonReadingPosition(lessonId, {
          sectionTitle,
          progressPercent,
        });
      }
    };

    const handleScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateReadingPosition);
    };

    rafId = window.requestAnimationFrame(updateReadingPosition);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lessonId, compiled]);

  useEffect(() => {
    if (!lessonId || loadedMap[lessonId]) return;

    let cancelled = false;
    loadLessonModule(lessonId)
      .then((mod) => {
        if (!cancelled) {
          setLoadedMap((prev) => ({ ...prev, [lessonId]: mod }));
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Không tải được nội dung bài học');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId, loadedMap]);

  // Dự đoán nạp trước bài học tiếp theo
  useEffect(() => {
    if (!subjectSlug || !lessonId) return;
    const { next } = getAdjacentLessons(subjectSlug, lessonId);
    if (!next?.lesson?.id || loadedMap[next.lesson.id]) return;

    let prefetched = false;
    const triggerPrefetch = () => {
      if (prefetched) return;
      prefetched = true;
      loadLessonModule(next.lesson.id)
        .then((mod) => {
          setLoadedMap((prev) =>
            prev[next.lesson.id] ? prev : { ...prev, [next.lesson.id]: mod },
          );
        })
        .catch(() => {
          // Bỏ qua lỗi ngầm khi prefetch
        });
    };

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      if (totalHeight > 0 && scrollPos / totalHeight >= 0.6) {
        triggerPrefetch();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (document.documentElement.scrollHeight <= window.innerHeight * 1.5) {
      triggerPrefetch();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [subjectSlug, lessonId, loadedMap]);

  if (!location) {
    return (
      <FadeIn className="mx-auto max-w-xl py-12 text-center">
        <Card className="space-y-4 p-8">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">
            Không tìm thấy bài học bạn yêu cầu
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Bài học không tồn tại hoặc đường dẫn đã thay đổi.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="sm">
              <Link to={subjectSlug ? ROUTES.subjectOverview(subjectSlug) : ROUTES.home}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Quay lại môn học</span>
              </Link>
            </Button>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const { subject, chapter, lesson } = location;

  return (
    <div
      data-subject={subject.slug}
      data-eye-comfort={isEyeComfort ? 'true' : undefined}
      className={cn(
        'min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)] transition-colors duration-200',
        readingTheme === 'dark' && 'dark',
        readingTheme === 'sepia' && 'bg-[#F4EEDF] text-[#231F18]',
        isEyeComfort && 'bg-[#F5F3EE]',
      )}
    >
      {/* Nút thoát Zen Mode duy nhất */}
      {isZenMode && (
        <button
          type="button"
          onClick={toggleZenMode}
          className="fixed top-14 right-4 z-50 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 px-3.5 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-md backdrop-blur-md transition-colors hover:border-[var(--accent-os)]"
          title="Thoát chế độ đọc tập trung (Phím Esc hoặc Z)"
          aria-label="Thoát chế độ tập trung"
        >
          <span aria-hidden="true">✕</span>
          <span>Thoát tập trung</span>
          <kbd className="ml-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
            Esc
          </kbd>
        </button>
      )}

      {/* Drawer Mục lục học phần bên trái trên màn hình < 1280px */}
      <div className="xl:hidden">
        <Drawer
          open={isSidebarDrawerOpen}
          onOpenChange={setIsSidebarDrawerOpen}
          side="left"
          title={`Chương & Bài học — ${subject.title}`}
          trigger={<span className="hidden" aria-hidden="true" />}
        >
          <LessonSidebar
            subject={subject}
            activeLessonId={lesson.id}
            readingTheme={readingTheme}
            onSelectLesson={() => setIsSidebarDrawerOpen(false)}
          />
        </Drawer>
      </div>

      {/* Bố cục 3 cột linh hoạt Academic OS: Left Course TOC | Center Monograph | Right Split-Pane */}
      <div className="flex min-h-[calc(100vh-3rem)] w-full items-start">
        {/* CỘT TRÁI: Mục lục Học phần docked (>= 1280px) */}
        {!isZenMode && isLeftSidebarOpen && (
          <aside
            data-testid="lesson-left-sidebar"
            aria-label="Danh mục điều hướng bài học"
            className="os-thin-scrollbar sticky top-12 hidden h-[calc(100vh-3rem)] w-[272px] shrink-0 overflow-y-auto border-r border-[var(--border-hairline)] bg-[var(--bg-shell)] p-3.5 xl:block print:hidden"
          >
            <LessonSidebar
              subject={subject}
              activeLessonId={lesson.id}
              readingTheme={readingTheme}
              onToggleCollapse={handleToggleLeftSidebar}
            />
          </aside>
        )}

        {/* CỘT GIỮA: Vùng đọc chuyên khảo Pure Monograph Typography (max-w-[780px]) */}
        <div
          role="region"
          aria-label="Nội dung bài giảng"
          className="min-w-0 flex-1 bg-[var(--bg-workspace)]"
        >
          <div className="mx-auto w-full max-w-[780px] px-6 py-8 lg:px-10">
            {import.meta.env.DEV && (
              <div className="mb-4">
                <DevEditorialBar lesson={lesson} lessonMeta={compiled?.lessonMeta ?? null} />
              </div>
            )}

            <article
              ref={articleRef}
              data-reading-article
              data-reading-theme={readingTheme}
              data-reading-size={fontSize}
              style={{ '--lu-reading-scale': String(readerSettings.fontScale) } as CSSProperties}
              className={cn(
                'lesson-content w-full text-[clamp(17px,1.08vw,19px)] leading-[1.82] text-[var(--text-main)]',
                typographyClasses,
                fontSize === 'lg' && 'reader-scale-lg',
              )}
            >
              <EditorialChapterOpener
                subjectName={subject.title}
                chapterNumber={chapter.number}
                title={lesson.title}
                subtitle={lesson.description}
                estimatedReadingMinutes={Math.max(5, lesson.estimatedMinutes)}
                difficultyLevel={getDifficultyLevel(lesson.level, subject.slug)}
                clos={getLessonClos(lesson.tags, subject.slug)}
                curriculumSource={getCurriculumSource(subject.slug)}
                collapsibleMeta
                prerequisites={
                  lesson.prerequisites.length > 0 ? (
                    <div className="clear-both mt-3 flex flex-wrap items-center gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 text-xs md:text-sm">
                      <div className="flex shrink-0 items-center gap-1.5 font-semibold text-[var(--text-main)]">
                        <Link2 className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
                        <span>Kiến thức tiên quyết:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {lesson.prerequisites.map((prereqId) => {
                          const prereq = getLessonById(prereqId);
                          if (!prereq) {
                            return (
                              <Badge key={prereqId} variant="neutral">
                                {prereqId}
                              </Badge>
                            );
                          }
                          return (
                            <Link
                              key={prereqId}
                              to={ROUTES.lesson(
                                prereq.subject.slug,
                                prereq.chapter.slug,
                                prereq.lesson.slug,
                              )}
                              className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 text-xs font-medium text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--accent-os)]"
                            >
                              <span>
                                Bài {prereq.chapter.number}.{prereq.lesson.number}:{' '}
                                {prereq.lesson.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null
                }
              >
                {lesson.status !== 'published' && (
                  <div className="pt-2">
                    <Badge variant={lesson.status}>Bản {lesson.status}</Badge>
                  </div>
                )}
              </EditorialChapterOpener>

              <div className="clear-both mb-5 flex flex-wrap items-center gap-2.5 border-b border-[var(--border-hairline)] pb-4">
                <LessonActionBar lessonId={lesson.id} readingTheme={readingTheme} />
              </div>

              <InPageSearchNavigator
                query={inPageSearch.query}
                totalMatches={inPageSearch.totalMatches}
                activeIndex={inPageSearch.activeIndex}
                onPrev={inPageSearch.goToPrev}
                onNext={inPageSearch.goToNext}
                onClear={inPageSearch.clearSearch}
                readingTheme={readingTheme}
              />

              <div className="mt-8">
                {loadError ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {loadError}
                  </div>
                ) : compiled ? (
                  <LessonMdxView
                    Content={compiled.default}
                    lessonMeta={compiled.lessonMeta}
                    lessonId={lesson.id}
                    lessonTitle={lesson.title}
                    lessonPath={pathname}
                  />
                ) : (
                  <div className="space-y-4" aria-label="Đang tải nội dung bài học">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                )}
              </div>

              <SourcePanel lesson={lesson} lessonMeta={compiled?.lessonMeta ?? null} />

              <footer className="mt-10 border-t border-[var(--border-hairline)] pt-6 print:hidden">
                <LessonPrevNextNav subjectSlug={subject.slug} lessonId={lesson.id} />
              </footer>
            </article>
          </div>
        </div>

        {/* CỘT PHẢI: Ngăn kéo Chia đôi 2 Tab (Desktop docked sticky top-12) */}
        {!isZenMode && isSplitPaneOpen && (
          <aside
            data-sidenotes-column
            data-testid="split-pane-desktop"
            role="complementary"
            aria-label="Ngăn kéo chia đôi công cụ học tập"
            className="sticky top-12 hidden h-[calc(100vh-3rem)] w-[340px] shrink-0 border-l border-[var(--border-hairline)] bg-[var(--bg-shell)] lg:block xl:w-[380px] print:hidden"
          >
            <SplitStudyPane
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              lessonDescription={lesson.description}
              subjectSlug={subject.slug}
              lessonMeta={compiled?.lessonMeta ?? null}
              activeTab={splitTab}
              onTabChange={setSplitTab}
              onClose={() => handleSetSplitPaneOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Mobile Slide-Over Drawer cho SplitStudyPane (< 1024px) */}
      {isMobileSplitOpen && (
        <div
          data-testid="split-pane-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Bảng chia đôi công cụ học tập"
          className="fixed inset-0 z-50 flex justify-end lg:hidden print:hidden"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsMobileSplitOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <div className="relative z-10 h-full w-[min(92vw,380px)] border-l border-[var(--border-hairline)] bg-[var(--bg-shell)] shadow-xl">
            <SplitStudyPane
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              lessonDescription={lesson.description}
              subjectSlug={subject.slug}
              lessonMeta={compiled?.lessonMeta ?? null}
              activeTab={splitTab}
              onTabChange={setSplitTab}
              onClose={() => setIsMobileSplitOpen(false)}
              onSelectAnchor={() => setIsMobileSplitOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function LessonPage() {
  return <LessonPageContent />;
}

export default LessonPage;
