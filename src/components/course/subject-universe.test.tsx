import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSubjectBySlug } from '@/content-runtime';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';
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

  it.each([
    ['cau-truc-dai-so', 'ctds', 'Thang Cấu Trúc Đại Số'],
    ['hinh-hoc-affine', 'hhave', 'Ba Tầng Hình Học'],
    ['giai-tich-ham-mot-bien', 'gthmb', 'Mạch Giải Tích 5 Chặng'],
    ['giao-duc-hoc', 'gdh', 'Bản Đồ 4 Trụ Cột Sư Phạm'],
  ] as const)(
    'môn %s dùng cảnh Canvas riêng (%s), không còn ảnh nền chụp và có sơ đồ điều hướng',
    async (slug, universe, widgetTitle) => {
      renderCourse(slug);

      const hero = await screen.findByTestId('subject-universe-hero');
      expect(hero).toHaveAttribute('data-subject-universe', universe);
      expect(hero.querySelector('img')).toBeNull();
      expect(within(hero).getByTestId('subject-hero-canvas')).toHaveAttribute(
        'data-universe',
        universe,
      );
      expect(within(hero).getByRole('list', { name: widgetTitle })).toBeInTheDocument();
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
