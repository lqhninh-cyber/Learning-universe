import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSubjectBySlug } from '@/content-runtime';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';
import { SubjectHeroCanvas } from './SubjectHeroCanvas';
import { getSubjectUniverseTheme, SUBJECT_UNIVERSE_THEMES } from './subjectUniverseThemes';

function renderCourse(slug: string) {
  return render(
    <MotionProvider>
      <TooltipProvider>
        <MemoryRouter initialEntries={[`/courses/${slug}`]}>
          <Routes>
            <Route path="/courses/:subjectSlug" element={<CourseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </MotionProvider>,
  );
}

describe('Không gian Tri thức 120fps trên trang Chi tiết Môn học', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    ['cau-truc-dai-so', 'ctds', 'Thang Cấu Trúc Đại Số', '#E5B84B', '#FBF5E6'],
    ['hinh-hoc-affine', 'hhave', 'Ba Tầng Hình Học', '#38BDF8', '#EEF8FD'],
    ['giai-tich-ham-mot-bien', 'gthmb', 'Mạch Giải Tích 5 Chặng', '#34D399', '#ECF9F3'],
    ['giao-duc-hoc', 'gdh', 'Bản Đồ 4 Trụ Cột Sư Phạm', '#E76F51', '#FDF1EC'],
  ] as const)(
    'môn %s dùng cảnh Canvas riêng (%s), đồng bộ biến CSS và có sơ đồ điều hướng',
    async (slug, universe, widgetTitle, expectedAccent, expectedSurface) => {
      const { container } = renderCourse(slug);

      const pageRoot = container.querySelector(
        `[data-subject-universe="${universe}"]`,
      ) as HTMLElement;
      expect(pageRoot).toBeInTheDocument();
      expect(pageRoot.style.getPropertyValue('--subject-accent')).toBe(expectedAccent);
      expect(pageRoot.style.getPropertyValue('--subject-surface')).toBe(expectedSurface);

      const hero = await screen.findByTestId('subject-universe-hero');
      expect(hero).toHaveAttribute('data-subject-universe', universe);
      expect(hero.querySelector('img')).toBeNull();
      expect(within(hero).getByTestId('subject-hero-canvas')).toHaveAttribute(
        'data-universe',
        universe,
      );

      // Vùng 1: Progress Pill gọn nằm bên cột thông tin; Vùng 2: Sân khấu đồ họa bên phải trống hoàn toàn; Vùng 3: Dock ngang ở đáy
      expect(within(hero).getByTestId('subject-progress-pill')).toBeInTheDocument();
      const visualStage = within(hero).getByTestId('subject-visual-stage');
      expect(visualStage).toBeInTheDocument();
      expect(within(visualStage).getByText('Rê chuột để tương tác mô hình')).toBeInTheDocument();
      expect(visualStage.querySelectorAll('a, button')).toHaveLength(0);

      const dock = within(hero).getByTestId('subject-pathway-dock');
      expect(within(dock).getByRole('list', { name: widgetTitle })).toBeInTheDocument();
      expect(within(hero).queryByText(/tín chỉ/i)).not.toBeInTheDocument();
    },
  );

  it('Giáo dục học hiển thị quy mô "5 chương & 3 bài thực hành · 19 bài học" và không còn "04 tín chỉ"', async () => {
    renderCourse('giao-duc-hoc');

    const hero = await screen.findByTestId('subject-universe-hero');
    expect(within(hero).getByText('5 chương & 3 bài thực hành · 19 bài học')).toBeInTheDocument();
    expect(screen.queryByText(/04 tín chỉ/i)).not.toBeInTheDocument();
  });

  it('bấm bậc "Trường" trên Thang Cấu Trúc Đại Số mở và cuộn tới Chương 9', async () => {
    const { container } = renderCourse('cau-truc-dai-so');

    const stageButton = await screen.findByRole('button', { name: /^Trường \(F\) — Chương 9$/ });
    fireEvent.click(stageButton);

    const focused = container.querySelectorAll('section[data-focused="true"]');
    expect(focused).toHaveLength(1);
    expect(focused[0]?.getAttribute('aria-label')).toMatch(/Trường con và trường các thương/);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('SubjectHeroCanvas tự tạm dừng vòng lặp 120fps qua IntersectionObserver khi cuộn ra khỏi khung nhìn', () => {
    let ioCallback: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly scrollMargin = '';
      readonly thresholds = [];
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;
      takeRecords = () => [];
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    const fakeCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      closePath: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const { unmount } = render(<SubjectHeroCanvas universe="ctds" />);
    expect(observe).toHaveBeenCalledTimes(1);
    expect(rafSpy).toHaveBeenCalledTimes(1);

    // Rời khung nhìn -> hủy frame đang chờ
    ioCallback?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(cafSpy).toHaveBeenCalledWith(42);

    // Cuộn trở lại khung nhìn -> khởi động lại vòng lặp
    ioCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(rafSpy).toHaveBeenCalledTimes(2);

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('mỗi bậc trong sơ đồ đều trỏ tới chương có thật trong manifest', () => {
    for (const theme of Object.values(SUBJECT_UNIVERSE_THEMES)) {
      const subject = getSubjectBySlug(theme.slug);
      expect(subject).toBeDefined();
      const chapterNumbers = new Set(subject?.chapters.map((chapter) => chapter.number));
      for (const stage of theme.stages) {
        for (const number of stage.chapterNumbers) {
          expect(chapterNumbers.has(number), `${theme.code} · ${stage.label} · ${number}`).toBe(
            true,
          );
        }
      }
    }
    expect(getSubjectUniverseTheme('mon-chua-cau-hinh').id).toBe('ctds');
  });
});
