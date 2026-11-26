import type { ManifestSubject } from '@schemas/index';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ActiveChapterConstellation } from '@/components/home/ActiveChapterConstellation';
import {
  computeConstellationPoints,
  computeTooltipPlacement,
  CONSTELLATION_VIEWBOX,
  MIN_STAR_DISTANCE,
  resolveActiveConstellationData,
} from '@/components/home/constellationGeometry';
import { getSubjects } from '@/content-runtime/manifest';
import { useLearningStore } from '@/features/learning';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="current-pathname">{location.pathname}</div>;
}

describe('ActiveChapterConstellation & constellationGeometry', () => {
  beforeEach(() => {
    useLearningStore.getState().resetLearningStore();
  });

  describe('computeConstellationPoints (Deterministic Layout)', () => {
    it('hoàn toàn xác định (deterministic): gọi lặp lại với cùng đầu vào trả về tọa độ y hệt', () => {
      const first = computeConstellationPoints(8, 'hinh-hoc-affine::01-khong-gian-affine');
      const second = computeConstellationPoints(8, 'hinh-hoc-affine::01-khong-gian-affine');
      expect(first).toEqual(second);
    });

    it('xử lý an toàn số lượng bài <= 0 hoặc 1 bài mà không sinh NaN', () => {
      expect(computeConstellationPoints(0, 'empty')).toEqual([]);
      expect(computeConstellationPoints(-3, 'negative')).toEqual([]);

      const single = computeConstellationPoints(1, 'single-lesson');
      expect(single).toHaveLength(1);
      expect(Number.isFinite(single[0]!.x)).toBe(true);
      expect(Number.isFinite(single[0]!.y)).toBe(true);
    });

    it('đảm bảo đúng số nút, không NaN, nằm gọn trong vùng đệm an toàn và khoảng cách Euclid >= 36px cho mọi chương từ 3 đến 15 bài', () => {
      const chapterSeeds = [
        'cau-truc-dai-so::01-nhom-va-cac-vi-du-co-ban',
        'hinh-hoc-affine::01-khong-gian-affine',
        'giai-tich-ham-mot-bien::06-phep-tinh-tich-phan',
        'giao-duc-hoc::02-ban-chat-giao-duc',
      ];

      const minX = CONSTELLATION_VIEWBOX.paddingX;
      const maxX = CONSTELLATION_VIEWBOX.width - CONSTELLATION_VIEWBOX.paddingX;
      const minY = CONSTELLATION_VIEWBOX.paddingTop;
      const maxY = CONSTELLATION_VIEWBOX.height - CONSTELLATION_VIEWBOX.paddingBottom;

      for (const seed of chapterSeeds) {
        for (let count = 3; count <= 15; count += 1) {
          const points = computeConstellationPoints(count, seed);
          expect(points).toHaveLength(count);

          for (const pt of points) {
            expect(Number.isFinite(pt.x)).toBe(true);
            expect(Number.isFinite(pt.y)).toBe(true);
            expect(pt.x).toBeGreaterThanOrEqual(minX);
            expect(pt.x).toBeLessThanOrEqual(maxX);
            expect(pt.y).toBeGreaterThanOrEqual(minY);
            expect(pt.y).toBeLessThanOrEqual(maxY);
          }

          for (let i = 0; i < points.length - 1; i += 1) {
            for (let j = i + 1; j < points.length; j += 1) {
              const dist = Math.hypot(points[j]!.x - points[i]!.x, points[j]!.y - points[i]!.y);
              expect(
                dist,
                `Khoảng cách giữa sao ${i} và ${j} (N=${count}, seed=${seed}) phải >= ${MIN_STAR_DISTANCE}px`,
              ).toBeGreaterThanOrEqual(MIN_STAR_DISTANCE);
            }
          }
        }
      }
    });

    it('computeTooltipPlacement tự động neo trái/phải/trên/dưới chống tràn khung Hero', () => {
      expect(computeTooltipPlacement(40, 48)).toEqual({ horizontal: 'left', vertical: 'below' });
      expect(computeTooltipPlacement(296, 52)).toEqual({ horizontal: 'right', vertical: 'below' });
      expect(computeTooltipPlacement(170, 150)).toEqual({
        horizontal: 'center',
        vertical: 'above',
      });
    });
  });

  describe('resolveActiveConstellationData (Data Resolution & Fallbacks)', () => {
    it('lấy đúng chương của bài đang học dở, phân loại trạng thái sao & đoạn nối chính xác', () => {
      const subjects = getSubjects();
      const hhave = subjects.find((s) => s.slug === 'hinh-hoc-affine')!;
      const chapter1 = hhave.chapters[0]!;
      expect(chapter1.lessons.length).toBeGreaterThanOrEqual(3);

      const completedLessons: Record<string, string> = {
        [chapter1.lessons[0]!.id]: '2026-11-25T10:00:00.000Z',
        [chapter1.lessons[1]!.id]: '2026-11-25T11:00:00.000Z',
      };
      const activeLesson = chapter1.lessons[2]!;

      const resolved = resolveActiveConstellationData({
        subjects,
        completedLessons,
        lastVisitedGlobal: {
          subjectId: hhave.id,
          lessonId: activeLesson.id,
          visitedAt: '2026-11-26T08:00:00.000Z',
        },
      });

      expect(resolved).not.toBeNull();
      expect(resolved!.subjectCode).toBe('HHAVE');
      expect(resolved!.chapterId).toBe(chapter1.id);
      expect(resolved!.completedCount).toBe(2);
      expect(resolved!.totalCount).toBe(chapter1.lessons.length);
      expect(resolved!.isChapterCompleted).toBe(false);
      expect(resolved!.metadataCaption).toBe(
        `HHAVE · CHƯƠNG ${chapter1.number} · 2/${chapter1.lessons.length}`,
      );

      expect(resolved!.nodes[0]!.status).toBe('completed');
      expect(resolved!.nodes[1]!.status).toBe('completed');
      expect(resolved!.nodes[2]!.status).toBe('active');
      expect(resolved!.segments[0]!.kind).toBe('completed');
      expect(resolved!.segments[1]!.kind).toBe('to-active');
      if (resolved!.segments[2]) {
        expect(resolved!.segments[2].kind).toBe('upcoming');
      }
      expect(resolved!.waypoints.find((w) => w.code === 'HHAVE')?.active).toBe(true);
    });

    it('fallback khi chưa có lịch sử học: chọn chương đầu tiên chưa hoàn thành của học phần mặc định', () => {
      const subjects = getSubjects();
      const defaultSubject = subjects[0]!;
      const firstChapter = defaultSubject.chapters[0]!;
      const secondChapter = defaultSubject.chapters[1]!;

      // Đánh dấu hoàn thành trọn vẹn chương đầu tiên của học phần mặc định
      const completedLessons: Record<string, string> = {};
      for (const ls of firstChapter.lessons) {
        completedLessons[ls.id] = '2026-11-24T09:00:00.000Z';
      }

      const resolved = resolveActiveConstellationData({
        subjects,
        completedLessons,
        lastVisitedGlobal: null,
      });

      expect(resolved).not.toBeNull();
      expect(resolved!.subjectSlug).toBe(defaultSubject.slug);
      expect(resolved!.chapterId).toBe(secondChapter.id);
      expect(resolved!.isChapterCompleted).toBe(false);
      expect(resolved!.nodes[0]!.status).toBe('active');
    });

    it('fallback khi toàn bộ học phần đã hoàn thành 100%: hiển thị trọn vẹn chòm sao sáng vàng kèm cờ hoàn tất', () => {
      const subjects = getSubjects();
      const defaultSubject = subjects[0]!;
      const allCompleted: Record<string, string> = {};
      for (const ch of defaultSubject.chapters) {
        for (const ls of ch.lessons) {
          allCompleted[ls.id] = '2026-11-26T12:00:00.000Z';
        }
      }

      const resolved = resolveActiveConstellationData({
        subjects: [defaultSubject],
        completedLessons: allCompleted,
        lastVisitedGlobal: null,
      });

      expect(resolved).not.toBeNull();
      expect(resolved!.isChapterCompleted).toBe(true);
      expect(resolved!.completedCount).toBe(resolved!.totalCount);
      expect(resolved!.nodes.every((n) => n.status === 'completed')).toBe(true);
      expect(resolved!.segments.every((s) => s.kind === 'completed')).toBe(true);
    });

    it('trả về null an toàn khi danh sách môn hoặc chương rỗng', () => {
      expect(
        resolveActiveConstellationData({
          subjects: [],
          completedLessons: {},
          lastVisitedGlobal: null,
        }),
      ).toBeNull();

      const baseSubject = getSubjects()[0]!;
      const emptySubject: ManifestSubject = {
        ...baseSubject,
        chapters: baseSubject.chapters.map((ch) => ({ ...ch, lessons: [] })),
      };

      expect(
        resolveActiveConstellationData({
          subjects: [emptySubject],
          completedLessons: {},
          lastVisitedGlobal: null,
        }),
      ).toBeNull();
    });
  });

  describe('ActiveChapterConstellation Component Interaction & A11y', () => {
    it('hiển thị tooltip khi hover/focus, gắn nhãn hoàn thành 100% khi xong trọn chương và điều hướng thật tới bài giảng', () => {
      const subjects = getSubjects();
      const hhave = subjects.find((s) => s.slug === 'hinh-hoc-affine')!;
      const ch1 = hhave.chapters[0]!;
      const lesson0 = ch1.lessons[0]!;
      const lesson1 = ch1.lessons[1]!;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ActiveChapterConstellation
                  subjectsOverride={[hhave]}
                  completedLessonsOverride={{ [lesson0.id]: '2026-11-26T08:00:00.000Z' }}
                  lastVisitedGlobalOverride={{
                    subjectId: hhave.id,
                    lessonId: lesson1.id,
                    visitedAt: '2026-11-26T09:00:00.000Z',
                  }}
                />
              }
            />
            <Route path="/mon-hoc/:subject/:chapter/:lesson" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('active-chapter-constellation')).toBeInTheDocument();
      expect(screen.getByTestId('constellation-metadata-caption')).toHaveTextContent(
        `HHAVE · CHƯƠNG ${ch1.number} · 1/${ch1.lessons.length}`,
      );
      expect(screen.getByTestId('constellation-waypoint-hinh-hoc-affine')).toHaveAttribute(
        'data-active',
        'true',
      );

      // Hover vào nút sao đang học -> hiển thị tooltip với mã bài, tiêu đề đầy đủ và trạng thái "Đang học"
      const activeCode = `${ch1.number}.${lesson1.number}`;
      const activeStar = screen.getByTestId(`constellation-star-${activeCode}`);
      fireEvent.mouseEnter(activeStar);

      const tooltip = screen.getByTestId('constellation-star-tooltip');
      expect(tooltip).toHaveTextContent(`Bài ${activeCode}`);
      expect(tooltip).toHaveTextContent(lesson1.title);
      expect(tooltip).toHaveTextContent('Đang học');

      fireEvent.mouseLeave(activeStar);
      expect(screen.queryByTestId('constellation-star-tooltip')).not.toBeInTheDocument();

      // Điều hướng bàn phím (Tab focus) cũng kích hoạt tooltip và giữ tabIndex={0}
      expect(activeStar).toHaveAttribute('tabindex', '0');
      fireEvent.focus(activeStar);
      expect(screen.getByTestId('constellation-star-tooltip')).toHaveTextContent(lesson1.title);
      fireEvent.blur(activeStar);

      // Kiểm tra trạng thái hoàn thành 100% chương hiển thị huy hiệu HOÀN THÀNH 100%
      const allCh1Done: Record<string, string> = {};
      for (const ls of ch1.lessons) {
        allCh1Done[ls.id] = '2026-11-26T10:00:00.000Z';
      }
      rerender(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ActiveChapterConstellation
                  subjectsOverride={[hhave]}
                  completedLessonsOverride={allCh1Done}
                  lastVisitedGlobalOverride={{
                    subjectId: hhave.id,
                    lessonId: lesson1.id,
                    visitedAt: '2026-11-26T10:05:00.000Z',
                  }}
                />
              }
            />
            <Route path="/mon-hoc/:subject/:chapter/:lesson" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('constellation-completed-badge')).toHaveTextContent(
        'HOÀN THÀNH 100%',
      );

      // Nhấn chuột trực tiếp vào ngôi sao đầu tiên -> điều hướng tới bài giảng tương ứng
      const firstCode = `${ch1.number}.${lesson0.number}`;
      fireEvent.click(screen.getByTestId(`constellation-star-${firstCode}`));
      expect(screen.getByTestId('current-pathname')).toHaveTextContent(
        `/mon-hoc/${hhave.slug}/${ch1.slug}/${lesson0.slug}`,
      );
    });

    it('hỗ trợ nhấn phím Space trên nút sao đang focus để mở bài giảng', () => {
      const subjects = getSubjects();
      const hhave = subjects.find((s) => s.slug === 'hinh-hoc-affine')!;
      const ch1 = hhave.chapters[0]!;
      const lesson1 = ch1.lessons[1]!;
      const activeCode = `${ch1.number}.${lesson1.number}`;

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ActiveChapterConstellation
                  subjectsOverride={[hhave]}
                  completedLessonsOverride={{}}
                  lastVisitedGlobalOverride={{
                    subjectId: hhave.id,
                    lessonId: lesson1.id,
                    visitedAt: '2026-11-26T10:05:00.000Z',
                  }}
                />
              }
            />
            <Route path="/mon-hoc/:subject/:chapter/:lesson" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>,
      );

      fireEvent.keyDown(screen.getByTestId(`constellation-star-${activeCode}`), { key: ' ' });
      expect(screen.getByTestId('current-pathname')).toHaveTextContent(
        `/mon-hoc/${hhave.slug}/${ch1.slug}/${lesson1.slug}`,
      );
    });
  });
});
