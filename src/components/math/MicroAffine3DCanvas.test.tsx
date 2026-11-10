import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MicroAffine3DCanvas } from './MicroAffine3DCanvas';

describe('MicroAffine3DCanvas (Khung tương tác tọa độ Afin 3D thuần Canvas 2D)', () => {
  it('kết xuất thành công tiêu đề, canvas và 3 tab chế độ quan sát', () => {
    render(<MicroAffine3DCanvas />);

    // Kiểm tra tiêu đề
    expect(screen.getByText('Không gian Afin 3D & Siêu phẳng')).toBeInTheDocument();

    // Thẻ canvas có aria-label hỗ trợ tiếp cận
    const canvas = screen.getByLabelText(/Khung vẽ mô hình 3D tọa độ Afin và siêu phẳng/i);
    expect(canvas).toBeInTheDocument();

    // 3 tabs chuyển đổi
    const tab1 = screen.getByRole('tab', { name: /1\. Siêu phẳng & Phương/i });
    const tab2 = screen.getByRole('tab', { name: /2\. Tương giao d ∩ α/i });
    const tab3 = screen.getByRole('tab', { name: /3\. Đường thẳng d ∥ α/i });

    expect(tab1).toBeInTheDocument();
    expect(tab2).toBeInTheDocument();
    expect(tab3).toBeInTheDocument();

    // Mặc định chọn tab 1
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(tab3).toHaveAttribute('aria-selected', 'false');

    // Chú thích học thuật của tab 1
    expect(screen.getByText(/Đặc tả siêu phẳng:/i)).toBeInTheDocument();
  });

  it('chuyển đổi mượt mà sang Chế độ 2: Tương giao d ∩ α', () => {
    render(<MicroAffine3DCanvas />);

    const tab2 = screen.getByRole('tab', { name: /2\. Tương giao d ∩ α/i });
    fireEvent.click(tab2);

    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Tương giao xuyên cắt:/i)).toBeInTheDocument();
    expect(screen.getByText(/cắt siêu phẳng/i)).toBeInTheDocument();
  });

  it('chuyển đổi mượt mà sang Chế độ 3: Đường thẳng d ∥ α', () => {
    render(<MicroAffine3DCanvas />);

    const tab3 = screen.getByRole('tab', { name: /3\. Đường thẳng d ∥ α/i });
    fireEvent.click(tab3);

    expect(tab3).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Vị trí song song:/i)).toBeInTheDocument();
    expect(screen.getByText(/song song với/i)).toBeInTheDocument();
  });

  it('hỗ trợ các nút thao tác zoom in, zoom out, đặt lại và mở rộng toàn khung', () => {
    render(<MicroAffine3DCanvas />);

    const zoomInBtn = screen.getByRole('button', { name: /Phóng to/i });
    const zoomOutBtn = screen.getByRole('button', { name: /Thu nhỏ/i });
    const resetBtn = screen.getByRole('button', { name: /Đặt lại góc nhìn/i });
    const expandBtn = screen.getByRole('button', { name: /Mở rộng toàn khung/i });

    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();
    expect(expandBtn).toBeInTheDocument();

    // Phóng to & thu nhỏ không gây lỗi
    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(resetBtn);

    // Mở rộng toàn khung
    fireEvent.click(expandBtn);
    expect(screen.getByRole('button', { name: /Thu nhỏ khung/i })).toBeInTheDocument();

    // Nhấn phím Escape để thoát toàn khung
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /Mở rộng toàn khung/i })).toBeInTheDocument();
  });

  it('nhận initialMode tùy biến khi khởi tạo', () => {
    render(<MicroAffine3DCanvas initialMode="line-intersect" />);

    const tab2 = screen.getByRole('tab', { name: /2\. Tương giao d ∩ α/i });
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Tương giao xuyên cắt:/i)).toBeInTheDocument();
  });

  it('hiển thị chú dẫn caption khi được truyền vào', () => {
    render(
      <MicroAffine3DCanvas caption="Hình minh họa không gian afin ba chiều A³ và siêu phẳng hai chiều." />,
    );

    expect(
      screen.getByText('Hình minh họa không gian afin ba chiều A³ và siêu phẳng hai chiều.'),
    ).toBeInTheDocument();
  });
});
