import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { getLessonBySlug } from '@/content-runtime';
import {
  getAllGlossaryEntries,
  getGlossaryEntryById,
  MATH_GLOSSARY,
  searchGlossary,
} from '@/data/math-glossary';
import { annotateTextString, matchLatexToGlossary } from './annotator';
import { MathGlossaryProvider } from './MathGlossaryContext';
import { MathGlossaryPopover } from './MathGlossaryPopover';
import { MathGlossaryTerm } from './MathGlossaryTerm';

describe('Cơ sở dữ liệu Thuật ngữ Toán học (Math Glossary)', () => {
  it('chứa ít nhất 30 thuật ngữ và ký hiệu chuẩn mực', () => {
    expect(MATH_GLOSSARY.length).toBeGreaterThanOrEqual(30);
  });

  it('mọi mục thuật ngữ đều có đầy đủ trường thông tin bắt buộc', () => {
    for (const item of MATH_GLOSSARY) {
      expect(item.id).toBeTruthy();
      expect(item.subject).toMatch(/^(cau-truc-dai-so|hinh-hoc-affine)$/);
      expect(item.patterns.length).toBeGreaterThan(0);
      expect(item.symbol).toBeTruthy();
      expect(item.nameVi).toBeTruthy();
      expect(item.nameEn).toBeTruthy();
      expect(item.brief).toBeTruthy();
      expect(item.intuition).toBeTruthy();
      expect(item.relatedLesson).toMatch(/^\/mon-hoc\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/);
    }
  });

  it('mọi liên kết relatedLesson đều trỏ tới bài học thực tế có trong hệ thống', () => {
    for (const item of MATH_GLOSSARY) {
      const parts = item.relatedLesson.split('/').filter(Boolean);
      // /mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug
      expect(parts.length).toBe(4);
      expect(parts[0]).toBe('mon-hoc');
      const subjectSlug = parts[1] ?? '';
      const chapterSlug = parts[2] ?? '';
      const lessonSlug = parts[3] ?? '';
      const found = getLessonBySlug(subjectSlug, chapterSlug, lessonSlug);
      expect(
        found,
        `Thuật ngữ "${item.id}" có relatedLesson "${item.relatedLesson}" không tìm thấy trong manifest`,
      ).toBeDefined();
    }
  });

  it('tìm kiếm chính xác theo ID', () => {
    const v4 = getGlossaryEntryById('v4');
    expect(v4).toBeDefined();
    expect(v4?.nameVi).toBe('Nhóm bốn Klein');
    expect(v4?.symbol).toBe('V_4');

    const affine = getGlossaryEntryById('khong-gian-afin');
    expect(affine).toBeDefined();
    expect(affine?.nameVi).toBe('Không gian Affine');
  });

  it('tìm kiếm tiếng Việt không phân biệt dấu thanh', () => {
    const resultsNoDiacritics = searchGlossary({ query: 'nhom bon klein' });
    expect(resultsNoDiacritics.some((r) => r.id === 'v4')).toBe(true);

    const resultsWithDiacritics = searchGlossary({ query: 'nhóm bốn Klein' });
    expect(resultsWithDiacritics.some((r) => r.id === 'v4')).toBe(true);

    const affineResults = searchGlossary({ query: 'khong gian afin' });
    expect(affineResults.some((r) => r.id === 'khong-gian-afin')).toBe(true);
  });

  it('tìm kiếm theo ký hiệu TeX', () => {
    const congResults = searchGlossary({ query: '\\cong' });
    expect(congResults.some((r) => r.id === 'dang-cau')).toBe(true);

    const v4Results = searchGlossary({ query: 'V_4' });
    expect(v4Results.some((r) => r.id === 'v4')).toBe(true);
  });

  it('lọc thuật ngữ theo môn học chính xác', () => {
    const all = getAllGlossaryEntries();
    const algebraOnly = searchGlossary({ subject: 'cau-truc-dai-so' });
    const affineOnly = searchGlossary({ subject: 'hinh-hoc-affine' });

    expect(algebraOnly.length + affineOnly.length).toBe(all.length);
    expect(algebraOnly.every((e) => e.subject === 'cau-truc-dai-so')).toBe(true);
    expect(affineOnly.every((e) => e.subject === 'hinh-hoc-affine')).toBe(true);
  });
});

describe('Bộ nhận diện thuật ngữ tự động (Auto-Annotator)', () => {
  it('khớp chính xác chuỗi TeX với mục từ điển tương ứng kể cả có khoảng trắng và trong công thức', () => {
    expect(matchLatexToGlossary('V_4')?.id).toBe('v4');
    expect(matchLatexToGlossary('\\cong')?.id).toBe('dang-cau');
    expect(matchLatexToGlossary('G \\cong H')?.id).toBe('dang-cau');
    expect(matchLatexToGlossary('H \\unlhd G')?.id).toBe('nhom-con-chuan-tac');
    expect(matchLatexToGlossary('\\ker \\varphi')?.id).toBe('hat-nhan');
    expect(matchLatexToGlossary('\\mathbb{A}^n')?.id).toBe('khong-gian-afin');
    expect(matchLatexToGlossary('[G:H]')?.id).toBe('dinh-ly-lagrange');
    expect(matchLatexToGlossary('[G : H]')?.id).toBe('dinh-ly-lagrange');
    expect(matchLatexToGlossary('|G| = [G:H] \\cdot |H|')?.id).toBe('dinh-ly-lagrange');
  });

  it('bóc tách chuỗi văn bản và chèn MathGlossaryTerm cố định không bị mất', () => {
    const text = 'Xét nhóm bốn Klein trong đại số trừu tượng.';
    const nodes = annotateTextString(text);

    expect(nodes.length).toBeGreaterThan(1);
  });
});

describe('Hành vi tương tác Popover & Toggle bền vững', () => {
  it('cho phép nhấp mở, nhấp lại để đóng (toggle) và nhấp lại nhiều lần không mất tương tác', () => {
    const entry = getGlossaryEntryById('v4')!;

    render(
      <MemoryRouter>
        <MathGlossaryProvider>
          <div>
            <MathGlossaryTerm entry={entry}>V_4</MathGlossaryTerm>
            <MathGlossaryPopover />
          </div>
        </MathGlossaryProvider>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /Chú thích thuật ngữ: Nhóm bốn Klein/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('lu-glossary-term');

    // 1. Nhấp lần 1: Mở Popover
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Klein four-group')).toBeInTheDocument();

    // 2. Nhấp lần 2 vào chính ký hiệu đó: Đóng Popover (Toggle)
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Ký hiệu V_4 vẫn còn nguyên là button trigger với class lu-glossary-term
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('lu-glossary-term');

    // 3. Nhấp lần 3: Mở lại Popover thành công
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 4. Bấm phím Escape: Đóng Popover
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 5. Nhấp lần 4: Mở lại tiếp tục bình thường
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 6. Nhấp nút [X] trong popover: Đóng popover
    const closeBtn = screen.getByRole('button', { name: /Đóng chú thích/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('đóng Popover khi click ra ngoài vùng trigger và popover', () => {
    const entry = getGlossaryEntryById('v4')!;

    render(
      <MemoryRouter>
        <MathGlossaryProvider>
          <div>
            <div data-testid="outside-area">Vùng bên ngoài</div>
            <MathGlossaryTerm entry={entry}>V_4</MathGlossaryTerm>
            <MathGlossaryPopover />
          </div>
        </MathGlossaryProvider>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /Chú thích thuật ngữ: Nhóm bốn Klein/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click ra ngoài
    const outside = screen.getByTestId('outside-area');
    fireEvent.pointerDown(outside);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Trigger vẫn tồn tại sẵn sàng cho lần click tiếp theo
    expect(trigger).toBeInTheDocument();
  });
});
