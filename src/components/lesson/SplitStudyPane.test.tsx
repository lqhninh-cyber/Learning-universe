import type { LessonMeta } from '@schemas/index';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SplitStudyPane, type SplitStudyTab } from './SplitStudyPane';

const MOCK_LESSON_META: LessonMeta = {
  chapterNumber: 1,
  lessonNumber: 1,
  headings: [
    {
      id: '1-tien-de-nhom',
      text: '1. Tiên đề của Nhóm $(G, \\cdot)$',
      depth: 2,
    },
    {
      id: '2-tinh-chat-co-ban',
      text: '2. Tính chất cơ bản',
      depth: 2,
    },
  ],
  blocks: [
    {
      name: 'Definition',
      id: 'def-nhom',
      anchorId: 'def-nhom',
      number: '1.1.1',
      label: 'Định nghĩa 1.1.1',
      title: 'Khái niệm Nhóm',
    },
    {
      name: 'Theorem',
      id: 'thm-duy-nhat',
      anchorId: 'thm-duy-nhat',
      number: '1.1.2',
      label: 'Định lý 1.1.2',
      title: 'Tính duy nhất phần tử đơn vị',
    },
  ],
};

function ControlledSplitPane({ initialTab = 'toc' }: { readonly initialTab?: SplitStudyTab }) {
  const [tab, setTab] = useState<SplitStudyTab>(initialTab);
  return (
    <MemoryRouter>
      <SplitStudyPane
        lessonId="test-lesson-group"
        lessonSlug="dinh-nghia-nhom"
        lessonTitle="Định nghĩa nhóm và nhóm thương"
        lessonDescription="Tìm hiểu nhóm, phần tử đơn vị, phần tử nghịch đảo và định lý cơ bản."
        subjectSlug="cau-truc-dai-so"
        subjectTitle="Cấu trúc đại số"
        lessonMeta={MOCK_LESSON_META}
        activeTab={tab}
        onTabChange={setTab}
      />
    </MemoryRouter>
  );
}

describe('SplitStudyPane (Ngăn kéo học tập chia đôi 3 Tab Academic OS)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Tab Mục lục hiển thị đầy đủ đề mục bài giảng có KaTeX và tóm tắt Định nghĩa / Định lý', () => {
    const { container } = render(<ControlledSplitPane initialTab="toc" />);

    expect(screen.getByTestId('split-study-pane')).toBeInTheDocument();
    expect(screen.getByTestId('split-panel-toc')).toBeInTheDocument();

    const tocNav = screen.getByRole('navigation', { name: 'Mục lục bài học' });
    expect(tocNav).toHaveTextContent(/Tiên đề của Nhóm/i);
    expect(tocNav).toHaveTextContent('Định nghĩa 1.1.1');
    expect(tocNav).toHaveTextContent('Định lý 1.1.2');
    expect(container.querySelectorAll('.katex').length).toBeGreaterThan(0);
  });

  it('Tab Thuật ngữ tự động lọc theo môn hiện tại, hỗ trợ tìm không dấu tiếng Việt và hiển thị công thức KaTeX', () => {
    const { container } = render(<ControlledSplitPane initialTab="toc" />);

    fireEvent.click(screen.getByTestId('split-tab-glossary'));
    expect(screen.getByTestId('split-panel-glossary')).toBeInTheDocument();

    const searchInput = screen.getByTestId('split-glossary-search');
    fireEvent.change(searchInput, { target: { value: 'nhom' } });

    expect(screen.getByTestId('split-panel-glossary')).toHaveTextContent(/Bản chất:/i);
    expect(container.querySelectorAll('.katex').length).toBeGreaterThan(0);
  });

  it('Tab Sổ tay tự động lưu localStorage (debounce 300ms), chuyển đổi Soạn thảo ↔ Xem trước (KaTeX) và xuất file .md', () => {
    vi.useFakeTimers();
    const { container } = render(<ControlledSplitPane initialTab="notes" />);

    const textarea = screen.getByTestId('split-notes-textarea');
    fireEvent.change(textarea, {
      target: {
        value: '# Nhóm\n- Công thức nội dòng $a \\cdot e = a$\n$$|G| = [G:H] \\cdot |H|$$',
      },
    });

    expect(screen.getByTestId('split-notes-save-status')).toHaveTextContent('Đang lưu...');
    act(() => {
      vi.advanceTimersByTime(320);
    });
    expect(screen.getByTestId('split-notes-save-status')).toHaveTextContent('Đã lưu tự động');
    expect(localStorage.getItem('lu_split_study_note:test-lesson-group')).toContain('|G| = [G:H]');

    // Chuyển sang Xem trước (KaTeX)
    fireEvent.click(screen.getByTestId('split-notes-mode-preview'));
    const preview = screen.getByTestId('split-notes-preview');
    expect(preview).toBeInTheDocument();
    expect(container.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2);

    // Kiểm tra nút xuất .md hoạt động
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-note');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    fireEvent.click(screen.getByTestId('split-notes-export'));
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-note');
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
