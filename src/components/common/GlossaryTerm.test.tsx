import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlossaryTerm } from './GlossaryTerm';

describe('GlossaryTerm Component (Hệ thống chú giải thuật ngữ nổi)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('kết xuất từ khóa inline với đường gạch chân đứt đoạn và nhãn trợ năng', () => {
    render(
      <MemoryRouter>
        <p>
          Khái niệm <GlossaryTerm termId="supremum">Supremum</GlossaryTerm> trong giải tích.
        </p>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /Supremum/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-glossary-term', 'supremum');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveClass('border-dashed');

    // Popover chưa mở
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mở popover khi người dùng nhấp chuột, hiển thị định nghĩa, ký hiệu KaTeX và liên kết chuyên khảo', () => {
    render(
      <MemoryRouter>
        <GlossaryTerm termId="supremum" />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /Supremum/i });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const dialog = screen.getByRole('dialog', { name: /Chú giải thuật ngữ: Supremum/i });
    expect(dialog).toBeInTheDocument();

    // Dòng 1: Tiêu đề & Ký hiệu
    expect(screen.getByRole('heading', { level: 4, name: 'Supremum' })).toBeInTheDocument();

    // Dòng 2: Định nghĩa
    expect(
      screen.getByText(/Cận trên nhỏ nhất của một tập hợp số thực bị chặn trên/i),
    ).toBeInTheDocument();

    // Dòng 3: Huy hiệu môn học & Link
    expect(screen.getByText('GTHMB')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Xem mục chuyên khảo/i });
    expect(link).toHaveAttribute('href', '/glossary#supremum');
  });

  it('hỗ trợ thuật ngữ Hình học Affine với công thức KaTeX nội dòng trong định nghĩa', () => {
    render(
      <MemoryRouter>
        <GlossaryTerm termId="sieu-phang" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Siêu phẳng/i }));

    expect(screen.getByRole('heading', { level: 4, name: 'Siêu phẳng' })).toBeInTheDocument();
    expect(screen.getByText('HHAVE')).toBeInTheDocument();
    expect(screen.getByText(/chia không gian thành hai nửa không gian/i)).toBeInTheDocument();
  });

  it('hỗ trợ thuật ngữ Giáo dục học với ký hiệu dạng phiên âm tiếng Anh', () => {
    render(
      <MemoryRouter>
        <GlossaryTerm termId="ban-chat-xa-hoi" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Bản chất xã hội/i }));

    expect(screen.getByRole('heading', { level: 4, name: 'Bản chất xã hội' })).toBeInTheDocument();
    expect(screen.getByText('Social Essence')).toBeInTheDocument();
    expect(screen.getByText('GDH')).toBeInTheDocument();
    expect(screen.getByText(/đời sống xã hội loài người/i)).toBeInTheDocument();
  });

  it('đóng popover khi nhấn phím Escape hoặc nhấp ra ngoài', () => {
    render(
      <MemoryRouter>
        <div>
          <GlossaryTerm termId="supremum" />
          <button type="button">Bên ngoài</button>
        </div>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /Supremum/i });

    // Mở popover
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Nhấn ESC để đóng
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Mở lại và click outside để đóng
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('kết xuất an toàn khi không tìm thấy termId trong từ điển', () => {
    render(
      <MemoryRouter>
        <GlossaryTerm termId="thuat-ngu-khong-ton-tai">Từ tùy ý</GlossaryTerm>
      </MemoryRouter>,
    );

    expect(screen.getByText('Từ tùy ý')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
