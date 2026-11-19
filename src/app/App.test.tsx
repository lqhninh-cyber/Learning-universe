import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { CustomCursorFollower } from '@/components/layout/CustomCursorFollower';
import { useLearningStore } from '@/features/learning';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

function renderWithProviders(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(
    <MotionProvider>
      <TooltipProvider>
        <CustomCursorFollower />
        <RouterProvider router={router} />
      </TooltipProvider>
    </MotionProvider>,
  );
}

describe('App routing smoke test', () => {
  beforeEach(() => {
    useLearningStore.getState().resetLearningStore();
  });

  it('hiển thị trang chủ 3 màn hình Bạch Ngọc Khoáng Thạch liền mạch (Hero -> Bảo tàng Di sản -> Tuyên ngôn Chladni) tại /', async () => {
    renderWithProviders('/');

    expect(
      await screen.findByRole('heading', {
        name: /LEARNING UNIVERSE/i,
      }),
    ).toBeInTheDocument();
    // Floating Capsule Island Header: Wordmark LEARNING UNIVERSE, nút Tìm kiếm ⌘K, Avatar và liên kết Không gian học tập
    expect(screen.getByRole('button', { name: /Mở tìm kiếm nhanh/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tài khoản và cài đặt giao diện/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Không gian học tập' })[0]).toHaveAttribute(
      'href',
      '/learning-space',
    );

    // 1. Hero Section — Toàn cảnh thoáng đãng Bình Minh Bạch Ngọc & Thẻ Danh ngôn
    expect(await screen.findByRole('heading', { name: /Đi một ngày đàng/i })).toBeInTheDocument();
    expect(screen.getByText(/— Tục ngữ Việt Nam/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Không gian hỗ trợ Toán học và Khoa học Giáo dục, đồng hành cùng người học trên bước đường học tập/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('LEARNING UNIVERSE').length).toBeGreaterThan(0);
    expect(screen.getByTestId('son-ha-diorama')).toHaveAttribute(
      'data-landscape',
      'hoang-lien-son',
    );
    expect(screen.queryByTestId('atmospheric-time-dial')).not.toBeInTheDocument();
    expect(screen.getByTestId('fansipan-peaks')).toBeInTheDocument();
    expect(screen.queryByTestId('hoang-lien-cranes')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-physics-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('dong-son-star-motif')).toBeInTheDocument();
    expect(screen.getByTestId('rotating-scholarly-quote')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Khám phá Không gian học tập/i })).toHaveAttribute(
      'href',
      '/learning-space',
    );
    expect(screen.getByRole('link', { name: /Thưởng lãm Di sản/i })).toHaveAttribute(
      'href',
      '#khong-gian-di-san',
    );

    // 2. Screen 2 — Phòng Trưng Bày Di Sản Bảo Tàng Thạch Cao Sáng (#khong-gian-di-san)
    const heritageShowcase = screen.getByTestId('heritage-art-showcase');
    expect(heritageShowcase).toBeInTheDocument();
    expect(heritageShowcase.className).toContain('bg-[#EEF2F0]');
    expect(heritageShowcase.className).toContain('pt-28');
    expect(heritageShowcase.className).toContain('scroll-mt-24');
    expect(
      screen.getByRole('heading', { name: /Di sản Học thuật & Nghệ thuật/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('heritage-filmstrip')).toBeInTheDocument();

    // 3. Screen 3 — Tuyên ngôn Học thuật × Đài cộng hưởng sóng đứng Chladni 120fps (thay thế hoàn toàn Hồ Sen)
    expect(screen.getByTestId('chladni-manifesto-section')).toBeInTheDocument();
    expect(screen.getByTestId('chladni-resonance-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('chladni-footer-seam')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Khi trực giác hình học gặp gỡ chiều sâu tiên đề\./i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('lakeshore-lotus-transition')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Đại cảnh Hồ Sen Tri Thức/i)).not.toBeInTheDocument();

    // Không gian Học phần & Quỹ đạo cá nhân đã được tách hoàn toàn sang /learning-space
    expect(screen.queryByRole('heading', { name: /Không gian Học phần/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Tiếp tục học tập/i })).not.toBeInTheDocument();
  });

  it('hiển thị trang Không gian Học tập (/learning-space) với đầy đủ học phần, Radar và Mạng lưới tri thức', async () => {
    renderWithProviders('/learning-space');

    // Academic Sanctuary Banner
    expect(
      await screen.findByRole('heading', { level: 1, name: /^Không Gian Học Tập$/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('observatory-vignette')).toBeInTheDocument();
    expect(screen.getByTestId('learning-space-perimeter-frame')).toBeInTheDocument();
    expect(screen.getByTestId('geodesic-corner-brackets')).toBeInTheDocument();
    expect(screen.getByTestId('learning-space-spy-rail')).toBeInTheDocument();
    expect(screen.getByTestId('ambient-geodesic-wings')).toBeInTheDocument();
    expect(screen.getByTestId('hero-blueprint-grid')).toBeInTheDocument();
    expect(screen.getByTestId('hero-3d-column')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-telemetry-pills')).not.toBeInTheDocument();
    expect(screen.queryByText(/Cấu trúc · 04 Hệ tiên đề/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bài giảng chuẩn hóa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mô phỏng 120 FPS/i)).not.toBeInTheDocument();
    const ringsContainer = screen.getByTestId('learning-space-celestial-rings');
    expect(ringsContainer).toBeInTheDocument();
    expect(ringsContainer).toHaveAttribute('data-sculpture-version', 'crystalline-astrolabe-v5');
    expect(ringsContainer).not.toHaveAttribute('data-dual-locked');
    expect(ringsContainer).not.toHaveAttribute('title');
    const heroCanvas = ringsContainer.querySelector('canvas');
    expect(heroCanvas).not.toBeNull();
    expect(heroCanvas).not.toHaveAttribute('title');
    expect(heroCanvas).toHaveClass('cursor-grab');
    if (heroCanvas) {
      expect(heroCanvas).toHaveAttribute('data-dragging', 'false');
      fireEvent.pointerDown(heroCanvas, { clientX: 120, clientY: 140, button: 0, pointerId: 1 });
      expect(heroCanvas).toHaveAttribute('data-dragging', 'true');
      fireEvent.pointerMove(heroCanvas, { clientX: 180, clientY: 165, pointerId: 1 });
      fireEvent.pointerUp(heroCanvas, { clientX: 180, clientY: 165, pointerId: 1 });
      expect(heroCanvas).toHaveAttribute('data-dragging', 'false');
    }
    const glyphs = screen.getByTestId('hero-math-parallax-glyphs');
    for (const symbol of ['∫', '∂', '∑', 'π', '∆', 'φ', '∀', '≃']) {
      expect(glyphs).toHaveTextContent(symbol);
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
    expect(screen.getByTestId('fx-search-glow')).toBeInTheDocument();

    const algebraLinks = screen.getAllByRole('link', { name: 'Cấu trúc đại số' });
    expect(algebraLinks[0]).toHaveAttribute('href', '/mon-hoc/cau-truc-dai-so');

    const enterCourseLinks = screen.getAllByRole('link', { name: /Vào học phần/i });
    expect(enterCourseLinks.length).toBe(4);
    expect(enterCourseLinks[0]).toHaveAttribute('href', '/courses/cau-truc-dai-so');

    // Vòng chuẩn độ ngữ cảnh 120fps (CustomCursorFollower)
    const cursorFollower = screen.getByTestId('custom-cursor-follower');
    const cursorRing = screen.getByTestId('custom-cursor-follower-ring');
    expect(cursorFollower).toBeInTheDocument();
    expect(cursorRing).toBeInTheDocument();

    fireEvent.mouseMove(enterCourseLinks[0]!, { clientX: 240, clientY: 320 });
    expect(cursorRing).toHaveAttribute('data-cursor-context', 'interactive');
    expect(cursorRing).toHaveAttribute('data-target-scale', '1.35');
    expect(cursorRing).toHaveAttribute('data-target-opacity', '1');

    fireEvent.mouseDown(enterCourseLinks[0]!, { button: 0 });
    expect(cursorRing).toHaveAttribute('data-cursor-pressed', 'true');
    expect(cursorRing).toHaveAttribute('data-target-scale', '0.85');

    fireEvent.mouseUp(enterCourseLinks[0]!, { button: 0 });
    expect(cursorRing).toHaveAttribute('data-cursor-pressed', 'false');
    expect(cursorRing).toHaveAttribute('data-target-scale', '1.35');

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
