import type { LessonMeta } from '@schemas/index';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { getSubjectBySlug, MathRenderer } from '@/content-runtime';
import { LessonSidebar } from './LessonSidebar';
import { LessonToc } from './LessonToc';
import { ReadingControlsToolbar } from './ReadingControlsToolbar';
import * as lessonReaderExports from './index';

describe('Thanh công cụ đọc nhanh (ReadingControlsToolbar)', () => {
  it('xuất đầy đủ component và types từ module index', () => {
    expect(lessonReaderExports.ReadingControlsToolbar).toBeDefined();
  });

  it('kết xuất đúng 3 nút cỡ chữ A-, A, A+ và thể hiện trạng thái kích hoạt', () => {
    const handleFontSizeChange = vi.fn();
    const handleToggleFocus = vi.fn();

    render(
      <ReadingControlsToolbar
        fontSize="base"
        onFontSizeChange={handleFontSizeChange}
        isFocusMode={false}
        onToggleFocusMode={handleToggleFocus}
      />,
    );

    const btnSm = screen.getByRole('button', { name: /Cỡ chữ nhỏ/i });
    const btnBase = screen.getByRole('button', { name: /Cỡ chữ chuẩn/i });
    const btnLg = screen.getByRole('button', { name: /Cỡ chữ lớn/i });

    expect(btnSm).toBeInTheDocument();
    expect(btnBase).toBeInTheDocument();
    expect(btnLg).toBeInTheDocument();

    expect(btnBase).toHaveAttribute('aria-pressed', 'true');
    expect(btnSm).toHaveAttribute('aria-pressed', 'false');
    expect(btnLg).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(btnSm);
    expect(handleFontSizeChange).toHaveBeenCalledWith('sm');

    fireEvent.click(btnLg);
    expect(handleFontSizeChange).toHaveBeenCalledWith('lg');
  });

  it('cho phép chuyển đổi chế độ đọc tập trung (Focus Mode)', () => {
    const handleFontSizeChange = vi.fn();
    const handleToggleFocus = vi.fn();

    const { rerender } = render(
      <ReadingControlsToolbar
        fontSize="base"
        onFontSizeChange={handleFontSizeChange}
        isFocusMode={false}
        onToggleFocusMode={handleToggleFocus}
      />,
    );

    const focusBtn = screen.getByRole('button', { name: /Bật chế độ tập trung/i });
    expect(focusBtn).toBeInTheDocument();
    expect(focusBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Chế độ tập trung')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();

    fireEvent.click(focusBtn);
    expect(handleToggleFocus).toHaveBeenCalledTimes(1);

    // Khi chuyển sang trạng thái isFocusMode = true
    rerender(
      <ReadingControlsToolbar
        fontSize="base"
        onFontSizeChange={handleFontSizeChange}
        isFocusMode={true}
        onToggleFocusMode={handleToggleFocus}
      />,
    );

    const exitFocusBtn = screen.getByRole('button', { name: /Thoát chế độ tập trung/i });
    expect(exitFocusBtn).toBeInTheDocument();
    expect(exitFocusBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Thoát tập trung')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();

    fireEvent.click(exitFocusBtn);
    expect(handleToggleFocus).toHaveBeenCalledTimes(2);
  });
});

describe('Bộ kết xuất Toán học MathRenderer & Mục lục bài học LessonToc', () => {
  it('MathRenderer chuyển đổi chính xác công thức có phân cách $ thành KaTeX', () => {
    const { container } = render(
      <MathRenderer content="Mô hình chuẩn của nhóm cyclic: $\mathbb{Z}$ và $\mathbb{Z}/n\mathbb{Z}$" />,
    );

    expect(screen.getByText(/Mô hình chuẩn của nhóm cyclic:/i)).toBeInTheDocument();
    const katexEls = container.querySelectorAll('.katex');
    expect(katexEls.length).toBeGreaterThanOrEqual(2);
  });

  it('MathRenderer nhận diện và chuyển đổi biểu thức LaTeX trần không bị lộ mã nguồn', () => {
    const { container } = render(
      <MathRenderer content="Nhóm đối xứng \operatorname{Sym}(X), nhóm nhị diện D_{2n} và \Z/12\Z" />,
    );

    const katexEls = container.querySelectorAll('.katex');
    expect(katexEls.length).toBeGreaterThanOrEqual(3);

    // Kiểm tra các phần tử hiển thị trực quan (.katex-html) không lộ mã LaTeX
    const htmlVisualText = Array.from(container.querySelectorAll('.katex-html'))
      .map((el) => el.textContent)
      .join(' ');
    expect(htmlVisualText).not.toContain('\\operatorname');
    expect(htmlVisualText).not.toContain('\\Z');
  });

  it('LessonToc kết xuất công thức toán trong danh sách mục lục (TOC headings và blocks)', () => {
    const mockMeta: LessonMeta = {
      chapterNumber: 2,
      lessonNumber: 2,
      headings: [
        {
          id: 'cac-ho-nhom-so-hoc',
          text: '1. Các họ nhóm số học: $(\\Z, +)$ và $\\Z/12\\Z$',
          depth: 2,
        },
        {
          id: 'nhom-doi-xung-va-d2n',
          text: '2. Nhóm đối xứng \\operatorname{Sym}(X) và D_{2n}',
          depth: 2,
        },
      ],
      blocks: [
        {
          name: 'Example',
          id: 'ex-mo-hinh-chuan',
          anchorId: 'ex-mo-hinh-chuan',
          number: '2.2.1',
          label: 'Ví dụ 2.2.1',
          title: 'Mô hình chuẩn của nhóm cyclic: $\\mathbb{Z}$ và $\\mathbb{Z}/n\\mathbb{Z}$',
        },
      ],
    };

    const { container } = render(<LessonToc lessonMeta={mockMeta} />);

    // Kiểm tra có các phần tử KaTeX trong mục lục
    const katexHeadings = container.querySelectorAll('.katex');
    expect(katexHeadings.length).toBeGreaterThan(0);

    // Kiểm tra các phần tử hiển thị thị giác .katex-html không chứa mã lệnh thô
    const katexHtmls = Array.from(container.querySelectorAll('.katex-html'));
    expect(katexHtmls.length).toBeGreaterThan(0);
    for (const el of katexHtmls) {
      expect(el.textContent).not.toContain('\\operatorname');
      expect(el.textContent).not.toContain('\\Z');
    }

    // Chuyển sang Tab Định lý
    const theoremTab = screen.getByRole('tab', { name: /Định lý/i });
    fireEvent.click(theoremTab);

    expect(screen.getByText('Ví dụ 2.2.1')).toBeInTheDocument();
    const katexTheorems = container.querySelectorAll('.katex');
    expect(katexTheorems.length).toBeGreaterThan(0);
  });
});

describe('Thanh tác vụ bài học LessonActionBar & Chế độ Đọc Chuyên sâu (Dark Reading Mode)', () => {
  it('xuất LessonActionBar và FloatingReadingController từ module index', () => {
    expect(lessonReaderExports.LessonActionBar).toBeDefined();
    expect(lessonReaderExports.FloatingReadingController).toBeDefined();
  });

  it('kết xuất FloatingReadingController dạng Pill Button công thái học và cho phép chuyển đổi chế độ đọc qua click và phím D', () => {
    const handleToggle = vi.fn();

    const { rerender } = render(
      <lessonReaderExports.FloatingReadingController
        readingTheme="light"
        onToggleReadingTheme={handleToggle}
      />,
    );

    // Khi ở Light Mode: icon Moon, nhãn "Chế độ đọc: Tối"
    const toggleBtn = screen.getByRole('button', { name: /Chế độ đọc: Tối/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveClass('rounded-full', 'backdrop-blur-md');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    // Click nút
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    // Bấm phím D
    fireEvent.keyDown(window, { key: 'd' });
    expect(handleToggle).toHaveBeenCalledTimes(2);

    // Rerender ở chế độ dark
    rerender(
      <lessonReaderExports.FloatingReadingController
        readingTheme="dark"
        onToggleReadingTheme={handleToggle}
      />,
    );

    // Khi ở Dark Mode: icon Sun, nhãn "Chế độ đọc: Sáng"
    const darkToggleBtn = screen.getByRole('button', { name: /Chế độ đọc: Sáng/i });
    expect(darkToggleBtn).toBeInTheDocument();
    expect(darkToggleBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Thanh điều hướng bài học bên trái (LessonSidebar)', () => {
  it('hiển thị tiêu đề môn không cắt cụt, nút thu gọn icon-only và mở mặc định chương chứa bài đang đọc', () => {
    const subject = getSubjectBySlug('hinh-hoc-affine');
    expect(subject).toBeDefined();
    if (!subject) return;

    const firstChapter = subject.chapters[0];
    const secondChapter = subject.chapters[1];
    const activeLesson = secondChapter?.lessons[0] ?? firstChapter?.lessons[0];
    expect(firstChapter).toBeDefined();
    expect(activeLesson).toBeDefined();
    if (!firstChapter || !activeLesson) return;
    const onToggleCollapse = vi.fn();

    render(
      <MemoryRouter>
        <LessonSidebar
          subject={subject}
          activeLessonId={activeLesson.id}
          onToggleCollapse={onToggleCollapse}
        />
      </MemoryRouter>,
    );

    // Tiêu đề môn đầy đủ hiển thị bằng line-clamp-2 (không dùng truncate cắt giữa từ)
    const subjectTitleEl = screen.getByText(subject.title);
    expect(subjectTitleEl).toHaveClass('line-clamp-2');
    expect(subjectTitleEl).not.toHaveClass('truncate');

    // Nút thu gọn dạng icon vuông w-8 h-8 kèm tooltip "Thu gọn mục lục"
    const collapseBtn = screen.getByRole('button', { name: 'Thu gọn mục lục' });
    expect(collapseBtn).toHaveAttribute('title', 'Thu gọn mục lục');
    expect(collapseBtn).toHaveClass('h-8', 'w-8');
    fireEvent.click(collapseBtn);
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);

    // Chương chứa bài đang học mặc định mở, chương khác mặc định đóng
    const chapterButtons = screen.getAllByRole('button', { expanded: true });
    expect(chapterButtons.length).toBe(1);

    // Bài đang học nổi bật với border-l-[3px] và nền xanh rêu nhạt
    const activeLink = screen.getByRole('link', {
      current: 'page',
    });
    expect(activeLink).toHaveClass('border-l-[3px]', 'border-[#1B3D2F]', 'text-[#1B3D2F]');

    // Bấm vào nút chương đầu tiên để mở rộng accordion chương đó
    const firstChapterBtn = screen.getByRole('button', {
      name: new RegExp(firstChapter.title, 'i'),
    });
    expect(firstChapterBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(firstChapterBtn);
    expect(firstChapterBtn).toHaveAttribute('aria-expanded', 'true');
  });
});
