import type { LessonMeta } from '@schemas/index';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { SplitStudyPane } from '@/components/lesson/SplitStudyPane';
import { Exercise, Hint, LessonProvider, Solution } from '@/content-runtime';
import { LayoutProvider } from '@/context/LayoutContext';
import { buildExerciseStorageKey, useLearningStore } from '@/features/learning';
import { MathInkPage } from '@/pages/math-ink/MathInkPage';
import { TooltipProvider } from '@/shared/ui';
import {
  clearExerciseHandoff,
  INK_EXERCISE_HANDOFF_KEY,
  readExerciseHandoff,
} from '@/utils/exerciseHandoff';

const DEMO_LESSON_ID = 'nhom-va-cac-vi-du-co-ban-bai-1';
const DEMO_LESSON_TITLE = 'Nửa nhóm, vị nhóm và tiên đề nhóm';
const DEMO_RETURN_PATH =
  '/mon-hoc/cau-truc-dai-so/nhom-va-cac-vi-du-co-ban/nua-nhom-vi-nhom-va-tien-de-nhom';

const MOCK_LESSON_META: LessonMeta = {
  chapterNumber: 1,
  lessonNumber: 1,
  headings: [{ id: 'bai-tap-tu-luyen', text: 'Bài tập tự luyện', depth: 2 }],
  blocks: [
    {
      name: 'Definition',
      id: 'def-1',
      anchorId: 'def-1',
      number: '1.1.1',
      label: 'Định nghĩa 1.1.1',
      title: 'Nhóm',
    },
    {
      name: 'Exercise',
      id: 'ex-1-1',
      anchorId: 'ex-1-1',
      number: '1.1.1',
      label: 'Bài tập 1.1.1',
      title: 'Kiểm tra tiên đề nhóm',
    },
    {
      name: 'Exercise',
      id: 'ex-1-2',
      anchorId: 'ex-1-2',
      number: '1.1.2',
      label: 'Bài tập 1.1.2',
      title: 'Chứng minh tính duy nhất phần tử nghịch đảo',
    },
  ],
};

describe('Hệ thống Tự luyện 3 Trạng thái & Cầu nối 1 chạm sang Bảng viết', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearExerciseHandoff();
    useLearningStore.getState().resetLearningStore();
  });

  it('learning-store cập nhật và xoay vòng 3 trạng thái tự luyện theo khóa ổn định lessonId::exerciseId', () => {
    const store = useLearningStore.getState();
    const key = buildExerciseStorageKey(DEMO_LESSON_ID, 'ex-1-1');

    expect(useLearningStore.getState().exerciseStatus[key]).toBeUndefined();

    expect(store.cycleExerciseStatus(DEMO_LESSON_ID, 'ex-1-1')).toBe('review');
    expect(useLearningStore.getState().exerciseStatus[key]).toBe('review');

    expect(store.cycleExerciseStatus(DEMO_LESSON_ID, 'ex-1-1')).toBe('done');
    expect(useLearningStore.getState().exerciseStatus[key]).toBe('done');

    expect(store.cycleExerciseStatus(DEMO_LESSON_ID, 'ex-1-1')).toBe('todo');
    expect(useLearningStore.getState().exerciseStatus[key]).toBeUndefined();
  });

  it('ExerciseBlock đổi trạng thái 3 mức, đồng bộ bộ đếm & bộ lọc Cần xem lại trên SplitStudyPane', () => {
    render(
      <MemoryRouter initialEntries={[DEMO_RETURN_PATH]}>
        <TooltipProvider>
          <LessonProvider
            lessonMeta={MOCK_LESSON_META}
            lessonId={DEMO_LESSON_ID}
            lessonTitle={DEMO_LESSON_TITLE}
            lessonPath={DEMO_RETURN_PATH}
          >
            <Exercise id="ex-1-1" number="1.1.1" title="Kiểm tra tiên đề nhóm">
              <p>Chứng minh phép cộng trên Z lập thành một nhóm giao hoán.</p>
            </Exercise>
            <Exercise id="ex-1-2" number="1.1.2" title="Chứng minh nghịch đảo">
              <p>Chứng minh phần tử nghịch đảo là duy nhất.</p>
            </Exercise>
            <SplitStudyPane
              lessonId={DEMO_LESSON_ID}
              lessonTitle={DEMO_LESSON_TITLE}
              subjectSlug="cau-truc-dai-so"
              lessonMeta={MOCK_LESSON_META}
              activeTab="toc"
              onTabChange={() => {}}
            />
          </LessonProvider>
        </TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('split-exercise-progress')).toHaveTextContent('Bài tập: 0/2 đã giải');

    // Đánh dấu Bài tập 1.1.1 -> Đã giải xong; Bài tập 1.1.2 -> Cần xem lại
    const firstExSection = document.querySelector('[data-exercise-id="ex-1-1"]') as HTMLElement;
    const secondExSection = document.querySelector('[data-exercise-id="ex-1-2"]') as HTMLElement;
    expect(firstExSection).not.toBeNull();
    expect(secondExSection).not.toBeNull();

    fireEvent.click(within(firstExSection).getByTestId('exercise-status-done'));
    expect(firstExSection).toHaveAttribute('data-exercise-status', 'done');

    fireEvent.click(within(secondExSection).getByTestId('exercise-status-review'));
    expect(secondExSection).toHaveAttribute('data-exercise-status', 'review');

    expect(screen.getByTestId('split-exercise-progress')).toHaveTextContent('Bài tập: 1/2 đã giải');
    const filterReviewBtn = screen.getByTestId('split-exercise-filter-review');
    expect(filterReviewBtn).toHaveTextContent('Cần xem lại (1)');

    // Bật lọc "Cần xem lại" -> chỉ còn hiện Bài tập 1.1.2 trong danh sách khối
    fireEvent.click(filterReviewBtn);
    const splitPane = screen.getByTestId('split-panel-toc');
    expect(splitPane).toHaveTextContent('Bài tập 1.1.2');
    expect(splitPane).not.toHaveTextContent('Bài tập 1.1.1');
    expect(splitPane).not.toHaveTextContent('Định nghĩa 1.1.1');
  });

  it('nút Nháp trên Bảng viết lưu ngữ cảnh (loại bỏ Gợi ý/Lời giải), ghim thẻ đề bài trên MathInkPage và đồng bộ Đã giải xong', () => {
    render(
      <MemoryRouter initialEntries={[DEMO_RETURN_PATH]}>
        <LayoutProvider initialRailCollapsed={false}>
          <TooltipProvider>
            <Routes>
              <Route
                path="/mon-hoc/:s/:c/:l"
                element={
                  <LessonProvider
                    lessonMeta={MOCK_LESSON_META}
                    lessonId={DEMO_LESSON_ID}
                    lessonTitle={DEMO_LESSON_TITLE}
                    lessonPath={DEMO_RETURN_PATH}
                  >
                    <Exercise id="ex-1-1" number="1.1.1" title="Kiểm tra tiên đề nhóm">
                      <p>Cho nhóm G thỏa mãn điều kiện kết hợp và có đơn vị.</p>
                      <Hint>Gợi ý bí mật không được chép sang bảng nháp.</Hint>
                      <Solution>Lời giải chi tiết không được lộ trên bảng nháp.</Solution>
                    </Exercise>
                  </LessonProvider>
                }
              />
              <Route path="/bang-viet" element={<MathInkPage />} />
            </Routes>
          </TooltipProvider>
        </LayoutProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('exercise-ink-handoff-btn'));

    // Xác nhận sessionStorage lưu đúng đề bài gốc và KHÔNG chứa Gợi ý / Lời giải
    const saved = readExerciseHandoff();
    expect(saved).not.toBeNull();
    expect(saved?.lessonId).toBe(DEMO_LESSON_ID);
    expect(saved?.exerciseId).toBe('ex-1-1');
    expect(saved?.promptText).toContain('Cho nhóm G thỏa mãn điều kiện kết hợp');
    expect(saved?.promptText).not.toContain('Gợi ý bí mật');
    expect(saved?.promptText).not.toContain('Lời giải chi tiết');

    // Trên MathInkPage hiện Thẻ Đề Bài Ghim Nổi
    const pinnedCard = screen.getByTestId('ink-pinned-exercise-card');
    expect(pinnedCard).toBeInTheDocument();
    expect(pinnedCard).toHaveTextContent('Bài tập 1.1.1');
    expect(screen.getByTestId('ink-pinned-exercise-body')).toHaveTextContent(
      'Cho nhóm G thỏa mãn điều kiện kết hợp',
    );
    expect(screen.getByTestId('ink-handoff-return-btn')).toHaveAttribute(
      'href',
      `${DEMO_RETURN_PATH}#ex-1-1`,
    );

    // Bấm "Đánh dấu đã giải" trên thẻ ghim -> đồng bộ thẳng về learning-store
    fireEvent.click(screen.getByTestId('ink-handoff-mark-done-btn'));
    expect(
      useLearningStore.getState().exerciseStatus[buildExerciseStorageKey(DEMO_LESSON_ID, 'ex-1-1')],
    ).toBe('done');

    // Thu gọn / mở rộng thẻ ghim
    fireEvent.click(screen.getByTestId('ink-handoff-collapse-btn'));
    expect(screen.queryByTestId('ink-pinned-exercise-body')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('ink-handoff-collapse-btn'));
    expect(screen.getByTestId('ink-pinned-exercise-body')).toBeInTheDocument();

    // Đóng thẻ ghim -> xóa lu_ink_exercise_handoff
    fireEvent.click(screen.getByTestId('ink-handoff-close-btn'));
    expect(screen.queryByTestId('ink-pinned-exercise-card')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(INK_EXERCISE_HANDOFF_KEY)).toBeNull();
  });
});
