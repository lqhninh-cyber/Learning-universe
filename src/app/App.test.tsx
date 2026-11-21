import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { useLearningStore } from '@/features/learning';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

function renderWithProviders(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(
    <MotionProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </MotionProvider>,
  );
}

describe('App routing smoke test', () => {
  beforeEach(() => {
    useLearningStore.getState().resetLearningStore();
  });

  it('hiển thị Workspace Dashboard tối giản Academic OS tại / (không chặn intro, không vòng con trỏ thừa, giữ chuyển tiếp Di sản & Bida)', async () => {
    renderWithProviders('/');

    expect(
      await screen.findByRole('heading', {
        name: /Không gian Tổng quan/i,
      }),
    ).toBeInTheDocument();

    // Academic OS AppShell: LeftRail + TopContextBar, không có CustomCursorFollower hay WaterTouchIntro chặn đầu trang
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('left-rail')).toBeInTheDocument();
    expect(screen.getByTestId('top-context-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-cursor-follower')).not.toBeInTheDocument();
    expect(screen.queryByTestId('water-touch-intro')).not.toBeInTheDocument();
    expect(screen.queryByTestId('son-ha-diorama')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero-physics-canvas')).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Mở tìm kiếm nhanh/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tài khoản và cài đặt giao diện/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Không gian học tập' })[0]).toHaveAttribute(
      'href',
      '/learning-space',
    );

    // Workspace Dashboard — Spatial Editorial Portal (4 Khối: Hero + 3-Material Dock + 4 Cổng Học Phần + Văn hiến & Sảnh Thư Giãn)
    expect(screen.getByTestId('workspace-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('spatial-hero-frame')).toBeInTheDocument();
    expect(screen.getByTestId('hero-floating-pill')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-quote-text')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-quote-next')).toBeInTheDocument();
    expect(screen.getByTestId('three-material-dock')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-resume-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-metrics-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-quick-hub-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-pomodoro-bar')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-subjects-grid')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-subject-card-cau-truc-dai-so')).toHaveAttribute(
      'href',
      '/mon-hoc/cau-truc-dai-so',
    );
    expect(screen.getByTestId('dashboard-subject-card-hinh-hoc-affine')).toHaveAttribute(
      'href',
      '/mon-hoc/hinh-hoc-affine',
    );
    expect(screen.getByTestId('dashboard-subject-card-giai-tich-ham-mot-bien')).toHaveAttribute(
      'href',
      '/mon-hoc/giai-tich-ham-mot-bien',
    );
    expect(screen.getByTestId('dashboard-subject-card-giao-duc-hoc')).toHaveAttribute(
      'href',
      '/mon-hoc/giao-duc-hoc',
    );
    expect(screen.getByTestId('dashboard-heritage-card')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-overlap-badge')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-glossary-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-sanctuary-banner')).toBeInTheDocument();

    // Bảo tàng 40 Di sản & Bida 8-Ball đã được tách hoàn toàn sang /thu-gian
    expect(screen.getByRole('link', { name: /Xem phòng trưng bày 40 Di sản/i })).toHaveAttribute(
      'href',
      '/thu-gian?tab=di-san',
    );
    expect(screen.getByRole('link', { name: /Mở bàn Bida 8-Ball/i })).toHaveAttribute(
      'href',
      '/thu-gian?tab=bida',
    );
    expect(screen.getByRole('link', { name: /Bảo tàng 40 Di sản/i })).toHaveAttribute(
      'href',
      '/thu-gian?tab=di-san',
    );
    expect(screen.queryByTestId('heritage-art-showcase')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mineral-billiards-stage')).not.toBeInTheDocument();

    // Không gian Học phần chi tiết nằm tại /learning-space
    expect(screen.queryByRole('heading', { name: /Không gian Học phần/i })).not.toBeInTheDocument();
  });

  it('hiển thị trang Không gian Học tập (/learning-space) sạch gọn chuẩn Swiss Editorial với đa diện 3D, 4 học phần, Radar và Mạng lưới tri thức', async () => {
    renderWithProviders('/learning-space');

    expect(
      await screen.findByRole('heading', { level: 1, name: /^Không Gian Học Tập$/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('learning-space-page')).toBeInTheDocument();

    // Đã thanh lọc toàn bộ lớp trang trí bản vẽ kỹ thuật dư thừa & vòng con trỏ phụ
    expect(screen.queryByTestId('observatory-vignette')).not.toBeInTheDocument();
    expect(screen.queryByTestId('learning-space-perimeter-frame')).not.toBeInTheDocument();
    expect(screen.queryByTestId('geodesic-corner-brackets')).not.toBeInTheDocument();
    expect(screen.queryByTestId('learning-space-spy-rail')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ambient-geodesic-wings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero-blueprint-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('engraved-ground-canvas')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fx-search-glow')).not.toBeInTheDocument();
    expect(screen.queryByTestId('custom-cursor-follower')).not.toBeInTheDocument();
    expect(screen.queryByText(/DOC\. LU-2026/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SPECIMEN №/i)).not.toBeInTheDocument();

    // Giữ nguyên khối đa diện 3D tương tác kéo xoay mượt mà
    expect(screen.getByTestId('hero-3d-column')).toBeInTheDocument();
    const ringsContainer = screen.getByTestId('learning-space-celestial-rings');
    expect(ringsContainer).toBeInTheDocument();
    const heroCanvas = ringsContainer.querySelector('canvas');
    expect(heroCanvas).not.toBeNull();
    expect(heroCanvas).toHaveClass('cursor-grab');
    if (heroCanvas) {
      expect(heroCanvas).toHaveAttribute('data-dragging', 'false');
      fireEvent.pointerDown(heroCanvas, { clientX: 120, clientY: 140, button: 0, pointerId: 1 });
      expect(heroCanvas).toHaveAttribute('data-dragging', 'true');
      fireEvent.pointerMove(heroCanvas, { clientX: 180, clientY: 165, pointerId: 1 });
      fireEvent.pointerUp(heroCanvas, { clientX: 180, clientY: 165, pointerId: 1 });
      expect(heroCanvas).toHaveAttribute('data-dragging', 'false');
    }

    // Hệ thống học phần (3 Tabs phân loại & ô tìm kiếm tích hợp)
    expect(screen.getByRole('heading', { name: /Không gian Học phần/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Toán học/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Khoa học Giáo dục/i })).toBeInTheDocument();

    const searchboxes = screen.getAllByRole('searchbox', {
      name: /Tìm kiếm môn học hoặc bài học/i,
    });
    expect(searchboxes).toHaveLength(1);

    const algebraLinks = screen.getAllByRole('link', { name: 'Cấu trúc đại số' });
    expect(algebraLinks[0]).toHaveAttribute('href', '/mon-hoc/cau-truc-dai-so');

    const enterCourseLinks = screen.getAllByRole('link', { name: /Vào học phần/i });
    expect(enterCourseLinks.length).toBe(4);
    expect(enterCourseLinks[0]).toHaveAttribute('href', '/courses/cau-truc-dai-so');

    // Quỹ đạo học tập cá nhân + Biểu đồ Radar + Mạng lưới Liên kết Tri thức
    expect(screen.getByRole('heading', { name: /Tiếp tục học tập/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Tiếp tục học dở/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Bài 1\.1: Hoạt động sư phạm của người giáo viên/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tiếp tục đọc ngay/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Biểu đồ Radar Năng lực Học phần/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Mạng Lưới Liên Kết Tri Thức/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt/i),
    ).toBeInTheDocument();

    expect(screen.queryByText(/MATH1301|MATH1302|MATH1303|EDUC2802/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Đang đồng bộ:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Supabase Cloud/i)).not.toBeInTheDocument();
  });

  it('hiển thị Cinematic Course Cover tràn viền tại /courses/cau-truc-dai-so', async () => {
    renderWithProviders('/courses/cau-truc-dai-so');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cấu trúc đại số' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Toán học').length).toBeGreaterThan(0);
    expect(screen.queryByText(/MATH1301/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('10 chương · 39 bài học').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Tiếp tục học: Bài/i })).toBeInTheDocument();
    expect(screen.getByTestId('pathway-bezier-connectors')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đọc giáo trình PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Ôn tập$/i })).toBeInTheDocument();
    expect(screen.queryByText(/Ngân hàng Đề thi & Lời giải/i)).not.toBeInTheDocument();
  });

  it('chuyển hướng /courses về Không Gian Học Tập (/learning-space)', async () => {
    renderWithProviders('/courses');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /^Không Gian Học Tập$/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vào học phần Cấu trúc đại số/i })).toHaveAttribute(
      'href',
      '/courses/cau-truc-dai-so',
    );
  });

  it('hiển thị trang 404 tiếng Việt khi truy cập đường dẫn không tồn tại', async () => {
    renderWithProviders('/duong-dan-khong-ton-tai');

    expect(
      await screen.findByRole('heading', {
        name: /Không tìm thấy trang bạn yêu cầu/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Về trang chủ/i })).toHaveAttribute('href', '/');
  });

  it('hiển thị trang kiểm thử Content Engine tại /dev/mdx ở chế độ DEV', async () => {
    renderWithProviders('/dev/mdx');

    expect(
      await screen.findByRole('heading', {
        name: /Content Engine & Academic MDX/i,
      }),
    ).toBeInTheDocument();
    const defItems = await screen.findAllByText(/Định nghĩa \d+\.\d+\.\d+/, {}, { timeout: 10000 });
    expect(defItems.length).toBeGreaterThan(0);
  });
});
