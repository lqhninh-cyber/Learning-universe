import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { GlossaryPage } from './GlossaryPage';

describe('Trang Tra cứu Thuật ngữ & Ký hiệu Toán học (GlossaryPage)', () => {
  it('hiển thị tiêu đề và danh sách thuật ngữ ban đầu', () => {
    render(
      <MemoryRouter>
        <GlossaryPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /Ký hiệu & Thuật ngữ Toán học/i }),
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/Tìm kiếm theo tên/i)).toBeInTheDocument();

    // Hiển thị một số thuật ngữ tiêu biểu
    expect(screen.getByText('Nhóm bốn Klein')).toBeInTheDocument();
    expect(screen.getByText('Không gian Affine')).toBeInTheDocument();
    expect(screen.getByText('Đẳng cấu')).toBeInTheDocument();
  });

  it('lọc thuật ngữ khi nhập từ khóa tìm kiếm tiếng Việt không dấu', () => {
    render(
      <MemoryRouter>
        <GlossaryPage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/Tìm kiếm theo tên/i);
    fireEvent.change(input, { target: { value: 'nhom bon klein' } });

    expect(screen.getByText('Nhóm bốn Klein')).toBeInTheDocument();
    expect(screen.queryByText('Không gian Affine')).not.toBeInTheDocument();
  });

  it('chuyển đổi giữa các tab lọc môn học', () => {
    render(
      <MemoryRouter>
        <GlossaryPage />
      </MemoryRouter>,
    );

    // Nhấn tab Cấu trúc đại số
    const algebraTab = screen.getByRole('button', { name: /Cấu trúc đại số/i });
    fireEvent.click(algebraTab);

    expect(screen.getByText('Nhóm bốn Klein')).toBeInTheDocument();
    expect(screen.queryByText('Không gian Affine')).not.toBeInTheDocument();

    // Nhấn tab Hình học Affine
    const affineTab = screen.getByRole('button', { name: /Hình học Affine/i });
    fireEvent.click(affineTab);

    expect(screen.getByText('Không gian Affine')).toBeInTheDocument();
    expect(screen.queryByText('Nhóm bốn Klein')).not.toBeInTheDocument();

    // Nhấn tab Giải tích hàm một biến
    const calculusTab = screen.getByRole('button', { name: /Giải tích hàm một biến/i });
    fireEvent.click(calculusTab);

    expect(screen.getByText('Định lý giá trị trung bình Lagrange')).toBeInTheDocument();
    expect(screen.queryByText('Nhóm bốn Klein')).not.toBeInTheDocument();
    expect(screen.queryByText('Không gian Affine')).not.toBeInTheDocument();
  });

  it('hiển thị thông báo khi không tìm thấy kết quả phù hợp', () => {
    render(
      <MemoryRouter>
        <GlossaryPage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/Tìm kiếm theo tên/i);
    fireEvent.change(input, { target: { value: 'tu-khoa-khong-ton-tai-xyz' } });

    expect(screen.getByText(/Không tìm thấy thuật ngữ nào/i)).toBeInTheDocument();
  });
});
