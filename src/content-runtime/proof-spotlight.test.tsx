import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  clampProofStep,
  countProofSteps,
  getProofStepState,
  LessonMdxView,
  loadLessonModule,
  Proof,
  stepProofSpotlight,
} from '@/content-runtime';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';

describe('Chế độ Spotlight từng bước cho <Proof>', () => {
  it('đếm đúng số bước cấp cao cho đoạn đơn, nhiều đoạn, danh sách ol/ul > li, Fragment và công thức display KaTeX', () => {
    expect(countProofSteps('Chứng minh ngắn trong một dòng.')).toBe(1);
    expect(countProofSteps(<p>Chỉ có một đoạn văn duy nhất.</p>)).toBe(1);
    expect(
      countProofSteps(
        <>
          Giả sử <em>x</em> = 0 và <strong>y</strong> = 1.
        </>,
      ),
    ).toBe(1);

    expect(
      countProofSteps(
        <>
          {'\n'}
          <p>Bước 1: Giả thiết.</p>
          {'\n'}
          <span className="katex-display">a + b = b + a</span>
          {'\n'}
          <p>Bước 3: Kết luận.</p>
          {'\n'}
        </>,
      ),
    ).toBe(3);

    expect(
      countProofSteps(
        <ol>
          <li>Tiên đề 1</li>
          <li>
            Tiên đề 2
            <ul>
              <li>Ý phụ lồng nhau không tách thêm bước cấp cao</li>
              <li>Ý phụ 2</li>
            </ul>
          </li>
          <li>Tiên đề 3</li>
        </ol>,
      ),
    ).toBe(3);

    expect(
      countProofSteps(
        <>
          <p>Trường hợp cơ sở.</p>
          <ul>
            <li>Sự tồn tại.</li>
            <li>Tính duy nhất.</li>
          </ul>
          <p>Suy ra điều phải chứng minh.</p>
        </>,
      ),
    ).toBe(4);
  });

  it('chặn biên điều hướng bước chính xác trong khoảng [0, N - 1] và trả về đúng trạng thái past/active/future', () => {
    expect(clampProofStep(-3, 4)).toBe(0);
    expect(clampProofStep(0, 4)).toBe(0);
    expect(clampProofStep(2, 4)).toBe(2);
    expect(clampProofStep(99, 4)).toBe(3);
    expect(clampProofStep(5, 0)).toBe(0);

    expect(stepProofSpotlight(0, -1, 4)).toBe(0);
    expect(stepProofSpotlight(0, 1, 4)).toBe(1);
    expect(stepProofSpotlight(3, 1, 4)).toBe(3);
    expect(stepProofSpotlight(3, -1, 4)).toBe(2);

    expect(getProofStepState(0, 2)).toBe('past');
    expect(getProofStepState(1, 2)).toBe('past');
    expect(getProofStepState(2, 2)).toBe('active');
    expect(getProofStepState(3, 2)).toBe('future');
  });

  it('ẩn nút Từng bước khi <Proof> chỉ có 1 đoạn ngắn để giữ giao diện gọn gàng', () => {
    render(
      <ReadingSettingsProvider>
        <Proof defaultOpen>
          <p>Kiểm tra trực tiếp theo định nghĩa là xong.</p>
        </Proof>
      </ReadingSettingsProvider>,
    );

    expect(screen.queryByTestId('proof-spotlight-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('proof-spotlight-controls')).not.toBeInTheDocument();
  });

  it('hỗ trợ bật Spotlight (tự mở khối đang thu gọn), điều hướng nút/bàn phím biên 0..N-1, bấm nhảy bước và Hiện toàn bộ', () => {
    const { container } = render(
      <ReadingSettingsProvider>
        <Proof title="Quy tắc chuyển vế">
          <p>Bước 1: Cộng phần tử nghịch đảo vào hai vế.</p>
          <span className="katex-display">a + b = c \implies b = (-a) + c</span>
          <ol>
            <li>Bước 3: Áp dụng tính kết hợp.</li>
            <li>Bước 4: Thu gọn phần tử đơn vị.</li>
          </ol>
        </Proof>
      </ReadingSettingsProvider>,
    );

    // Nút Từng bước hiển thị trên thanh tiêu đề dù chứng minh đang thu gọn
    const toggleBtn = screen.getByTestId('proof-spotlight-toggle');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    // Bấm Từng bước sẽ tự mở chứng minh và chiếu sáng Bước 1 / 4
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 1 / 4');

    const prevBtn = screen.getByTestId('proof-spotlight-prev');
    const nextBtn = screen.getByTestId('proof-spotlight-next');
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    const getStepStates = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[data-proof-step]')).map((el) =>
        el.getAttribute('data-spotlight-state'),
      );

    expect(getStepStates()).toEqual(['active', 'future', 'future', 'future']);

    // Điều hướng bằng nút Tiếp
    fireEvent.click(nextBtn);
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 2 / 4');
    expect(getStepStates()).toEqual(['past', 'active', 'future', 'future']);
    expect(prevBtn).not.toBeDisabled();

    // Điều hướng bằng bàn phím ArrowDown / ArrowRight / ArrowUp / ArrowLeft với chặn biên
    const proofSection = container.querySelector<HTMLElement>('section[data-kind="proof"]')!;
    fireEvent.keyDown(proofSection, { key: 'ArrowDown' });
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 3 / 4');
    expect(getStepStates()).toEqual(['past', 'past', 'active', 'future']);

    fireEvent.keyDown(proofSection, { key: 'ArrowRight' });
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 4 / 4');
    expect(nextBtn).toBeDisabled();

    // Quá biên phải vẫn giữ nguyên Bước 4 / 4
    fireEvent.keyDown(proofSection, { key: 'ArrowRight' });
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 4 / 4');

    // Quay lại bằng ArrowLeft / ArrowUp
    fireEvent.keyDown(proofSection, { key: 'ArrowLeft' });
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 3 / 4');
    fireEvent.keyDown(proofSection, { key: 'ArrowUp' });
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 2 / 4');

    // Bấm trực tiếp vào bước chưa đọc (bước 4, index 3) để nhảy thẳng tới đó
    const step4El = container.querySelector<HTMLElement>('[data-proof-step="3"]')!;
    fireEvent.click(step4El);
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 4 / 4');
    expect(getStepStates()).toEqual(['past', 'past', 'past', 'active']);

    // Bấm trực tiếp vào bước đã đọc (bước 1, index 0) để nhảy ngược lại
    const step1El = container.querySelector<HTMLElement>('[data-proof-step="0"]')!;
    fireEvent.click(step1El);
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 1 / 4');
    expect(prevBtn).toBeDisabled();

    // Quá biên trái vẫn giữ nguyên Bước 1 / 4
    fireEvent.keyDown(proofSection, { key: 'ArrowLeft' });
    expect(screen.getByTestId('proof-spotlight-counter')).toHaveTextContent('Bước 1 / 4');

    // Bấm Hiện toàn bộ thoát chế độ Spotlight
    fireEvent.click(screen.getByTestId('proof-spotlight-show-all'));
    expect(screen.queryByTestId('proof-spotlight-controls')).not.toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelectorAll('[data-proof-step]')).toHaveLength(0);
  });

  it('tương thích tự động với tệp bài giảng .mdx thật (không cần chỉnh sửa MDX)', async () => {
    const compiled = await loadLessonModule('khong-gian-affine');
    render(
      <ReadingSettingsProvider>
        <LessonMdxView Content={compiled.default} lessonMeta={compiled.lessonMeta} />
      </ReadingSettingsProvider>,
    );

    const toggles = screen.getAllByTestId('proof-spotlight-toggle');
    expect(toggles.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(toggles[0]!);
    expect(screen.getByTestId('proof-spotlight-controls')).toBeInTheDocument();
    expect(screen.getByTestId('proof-spotlight-counter').textContent).toMatch(/^Bước 1 \/ [2-9]/);
  }, 20000);
});
