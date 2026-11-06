import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CommandPalette } from './CommandPalette';

function CommandPaletteHarness({ initialOpen = false }: { readonly initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const location = useLocation();

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Mở tìm kiếm
      </button>
      <div data-testid="current-location">{`${location.pathname}${location.search}`}</div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}

describe('CommandPalette', () => {
  it('mở và đóng bằng phím tắt toàn cục Ctrl+K / Cmd+K và phím Escape', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CommandPaletteHarness initialOpen={false} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Nhấn Ctrl+K để mở
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Tìm kiếm định lý, công thức, bài học (Lagrange, Affine, Nhóm con)...',
      ),
    ).toBeInTheDocument();
    expect(document.body.classList.contains('overflow-hidden')).toBe(true);

    // Nhấn Escape để đóng
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.classList.contains('overflow-hidden')).toBe(false);
  });

  it('hiển thị danh sách Gợi ý phổ biến khi chưa nhập từ khóa', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CommandPaletteHarness initialOpen={true} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Gợi ý phổ biến')).toBeInTheDocument();
    expect(screen.getByText('Định lý Lagrange')).toBeInTheDocument();
    expect(screen.getByText('Không gian Affine')).toBeInTheDocument();
    expect(screen.getByText('Giới hạn dãy số')).toBeInTheDocument();
    expect(screen.getByText('20 tình huống sư phạm')).toBeInTheDocument();
  });

  it('lọc kết quả theo 4 nhóm: Định lý & Công thức, Bài học & Chương, Học phần, Thuật ngữ', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CommandPaletteHarness initialOpen={true} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(
      'Tìm kiếm định lý, công thức, bài học (Lagrange, Affine, Nhóm con)...',
    );

    // Gõ từ khóa "Lagrange" (khớp Định lý & Công thức, Bài học, Thuật ngữ)
    fireEvent.change(input, { target: { value: 'Lagrange' } });
    expect(screen.getByText('ĐỊNH LÝ & CÔNG THỨC')).toBeInTheDocument();
    expect(screen.getByText('BÀI HỌC & CHƯƠNG')).toBeInTheDocument();
    expect(screen.getByText('THUẬT NGỮ')).toBeInTheDocument();
    expect(screen.getByText('Định lý Lagrange (Lý thuyết Nhóm)')).toBeInTheDocument();

    // Gõ từ khóa "Affine" (khớp cả Học phần Hình học Affine & Euclide)
    fireEvent.change(input, { target: { value: 'Affine' } });
    expect(screen.getByText('HỌC PHẦN')).toBeInTheDocument();
  });

  it('hỗ trợ di chuyển bằng phím mũi tên ↑ / ↓, nhấn Enter để chuyển trang và tự động đóng modal', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CommandPaletteHarness initialOpen={true} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(
      'Tìm kiếm định lý, công thức, bài học (Lagrange, Affine, Nhóm con)...',
    );

    // Mặc định mục đầu tiên (Định lý Lagrange) được chọn, nhấn ArrowDown sang Không gian Affine
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByTestId('current-location').textContent).toBe(
      '/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị thông báo lịch sự khi không tìm thấy kết quả phù hợp', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CommandPaletteHarness initialOpen={true} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(
      'Tìm kiếm định lý, công thức, bài học (Lagrange, Affine, Nhóm con)...',
    );

    fireEvent.change(input, { target: { value: 'zzzz-tu-khoa-khong-ton-tai-9999' } });
    expect(screen.getByText('Không tìm thấy nội dung phù hợp cho từ khóa này')).toBeInTheDocument();
  });
});
