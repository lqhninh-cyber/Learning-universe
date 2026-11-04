import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { UiPreviewPage } from './UiPreviewPage';

describe('Thử nghiệm Redesign UI/UX V2 (/ui-preview)', () => {
  it('kết xuất thành công trang thử nghiệm với Hướng thiết kế mặc định Atelier và Trang chủ', () => {
    render(
      <MemoryRouter>
        <UiPreviewPage />
      </MemoryRouter>,
    );

    // Kiểm tra Floating Navbar
    expect(screen.getByText('Learning Universe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Không gian học tập/i })).toBeInTheDocument();

    // Kiểm tra Hero Section của Trang chủ
    expect(screen.getByText(/Nơi vẻ đẹp/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Toán học/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Nghệ thuật Sư phạm/i)).toBeInTheDocument();

    // Kiểm tra Preview Control Bar ở đáy màn hình
    expect(screen.getByRole('radio', { name: /1\. Atelier Bento/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /2\. Spatial Glass/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /3\. Editorial Folio/i })).toBeInTheDocument();
  });

  it('cho phép chuyển đổi mượt mà giữa 3 Hướng thiết kế (Visual Directions)', () => {
    const { container } = render(
      <MemoryRouter>
        <UiPreviewPage />
      </MemoryRouter>,
    );

    const btnSpatial = screen.getByRole('radio', { name: /2\. Spatial Glass/i });
    fireEvent.click(btnSpatial);

    expect(btnSpatial).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('[data-visual-direction="spatial"]')).toBeInTheDocument();

    const btnEditorial = screen.getByRole('radio', { name: /3\. Editorial Folio/i });
    fireEvent.click(btnEditorial);

    expect(btnEditorial).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('[data-visual-direction="editorial"]')).toBeInTheDocument();

    const btnAtelier = screen.getByRole('radio', { name: /1\. Atelier Bento/i });
    fireEvent.click(btnAtelier);

    expect(btnAtelier).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('[data-visual-direction="atelier"]')).toBeInTheDocument();
  });

  it('cho phép chuyển sang Chế độ Course Dashboard và chọn giữa 2 môn Giải tích & Giáo dục học', () => {
    render(
      <MemoryRouter>
        <UiPreviewPage />
      </MemoryRouter>,
    );

    const btnCourseView = screen.getByRole('radio', { name: /Trang môn học/i });
    fireEvent.click(btnCourseView);

    // Mặc định nạp môn Giải tích hàm một biến
    expect(screen.getByText('Giải tích hàm một biến')).toBeInTheDocument();
    expect(screen.getAllByText(/Tiên đề Supremum/i).length).toBeGreaterThanOrEqual(1);

    // Chuyển sang môn Giáo dục học
    const btnPedagogy = screen.getByRole('radio', { name: /Sư phạm: Giáo dục học/i });
    fireEvent.click(btnPedagogy);

    expect(screen.getByText('Giáo dục học đại cương')).toBeInTheDocument();
    expect(
      screen.getAllByText(/Hoạt động sư phạm và Người giáo viên/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('tương tác mở rộng và đóng Mega Menu hai không gian học thuật', () => {
    render(
      <MemoryRouter>
        <UiPreviewPage />
      </MemoryRouter>,
    );

    const megaBtn = screen.getByRole('button', { name: /Không gian học tập/i });
    fireEvent.click(megaBtn);

    expect(
      screen.getByText(/Cổng Không Gian Học Thuật \(Dual Spatial Portals\)/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Khối 1: Toán học Đại học').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Khối 2: Khoa học GD & Sư phạm').length).toBeGreaterThanOrEqual(1);

    // Chuyển tab trong Mega Menu sang Sư phạm
    const tabPedagogy = screen.getByRole('tab', { name: /Khối Khoa học Giáo dục/i });
    fireEvent.click(tabPedagogy);
    expect(tabPedagogy).toHaveAttribute('aria-selected', 'true');
  });

  it('cho phép bật tắt Motion và thu gọn/mở rộng thanh Control Bar', () => {
    const { container } = render(
      <MemoryRouter>
        <UiPreviewPage />
      </MemoryRouter>,
    );

    const motionBtn = screen.getByRole('button', { name: /Bật tắt chuyển động/i });
    fireEvent.click(motionBtn);
    expect(container.querySelector('[data-motion-enabled="false"]')).toBeInTheDocument();

    const collapseBtn = screen.getByRole('button', { name: /Thu gọn thanh điều khiển/i });
    fireEvent.click(collapseBtn);

    // Khi thu gọn, hiển thị nút pill mở lại
    const openBtn = screen.getByRole('button', { name: /Mở thanh điều khiển/i });
    expect(openBtn).toBeInTheDocument();

    fireEvent.click(openBtn);
    expect(screen.getByRole('radio', { name: /1\. Atelier Bento/i })).toBeInTheDocument();
  });
});
