import type { LessonMeta } from '@schemas/index';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MathRenderer } from '@/content-runtime';
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
