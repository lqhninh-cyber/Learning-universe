import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HeritageExhibitionPavilion } from '@/components/home/HeritageExhibitionPavilion';
import { TopContextBar } from '@/components/layout/TopContextBar';
import {
  buildAtmosphericFallbackMesh,
  DASHBOARD_CANOPY_ASSETS,
  SANCTUARY_BANNER_ASSET,
  SUBJECT_WASH_ASSETS,
} from '@/config/atmosphereAssets';
import { IslandProvider } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { HomePage } from '@/pages/home/HomePage';
import { LearningSpacePage } from '@/pages/learning-space/LearningSpacePage';
import { AtmosphericCanopy } from './AtmosphericCanopy';

describe('Spatial Editorial Portal & Thiên Cảnh Khí Quyển (0% AI Real Photography)', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('AtmosphericCanopy nạp ảnh chụp thật Sáng/Tối độc lập, hỗ trợ chế độ fullBleedPhoto và Fallback CSS không vỡ ảnh', async () => {
    const { container } = render(
      <ReadingSettingsProvider>
        <AtmosphericCanopy variant="dashboard" fullBleedPhoto testId="test-canopy">
          <h1>Tiêu đề thử nghiệm</h1>
        </AtmosphericCanopy>
      </ReadingSettingsProvider>,
    );

    const canopy = screen.getByTestId('test-canopy');
    expect(canopy).toHaveAttribute('data-atmosphere-theme', 'light');
    expect(screen.getByTestId('test-canopy-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('test-canopy-scrim')).toBeInTheDocument();
    expect(container.querySelector('.lu-canopy-mask')).toBeNull();

    const lightImg = container.querySelector('img');
    expect(lightImg).not.toBeNull();
    expect(lightImg).toHaveAttribute('src', DASHBOARD_CANOPY_ASSETS.light);

    // Giả lập lỗi tải ảnh -> onError ẩn sạch <img>, fallback CSS giàu chiều sâu vẫn bảo vệ nền
    if (lightImg) {
      fireEvent.error(lightImg);
    }
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('test-canopy-fallback')).toBeInTheDocument();

    // Chuyển sang Chế độ Tối độc lập -> nạp dashboard-canopy-dark.webp (không dùng filter invert)
    act(() => {
      document.documentElement.classList.add('dark');
    });
    await waitFor(() => {
      expect(canopy).toHaveAttribute('data-atmosphere-theme', 'dark');
    });
    const darkImg = container.querySelector('img');
    expect(darkImg).not.toBeNull();
    expect(darkImg).toHaveAttribute('src', DASHBOARD_CANOPY_ASSETS.dark);
  });

  it('cung cấp đầy đủ 7 đường dẫn ảnh chụp thật (.webp) và fallback gradient giàu chiều sâu cho Hero, 4 Cổng Học Phần và Sảnh Thư Giãn', () => {
    expect(DASHBOARD_CANOPY_ASSETS.light).toBe('/assets/atmosphere/dashboard-canopy-light.webp');
    expect(DASHBOARD_CANOPY_ASSETS.dark).toBe('/assets/atmosphere/dashboard-canopy-dark.webp');
    expect(SANCTUARY_BANNER_ASSET.src).toBe('/assets/atmosphere/sanctuary-banner.webp');
    expect(SANCTUARY_BANNER_ASSET.fallbackGradient).toContain('#17332C');

    // Dashboard fallback phải đậm chiều sâu để thẻ Kính Mờ phía trên nổi khối rõ nét (không bợt trắng)
    const dashboardLightFallback = buildAtmosphericFallbackMesh({
      variant: 'dashboard',
      isDark: false,
    });
    const dashboardDarkFallback = buildAtmosphericFallbackMesh({
      variant: 'dashboard',
      isDark: true,
    });
    expect(dashboardLightFallback).toContain('#1E3D35');
    expect(dashboardDarkFallback).toContain('#0D1917');

    const slugs = [
      'cau-truc-dai-so',
      'hinh-hoc-affine',
      'giai-tich-ham-mot-bien',
      'giao-duc-hoc',
    ] as const;

    for (const slug of slugs) {
      expect(SUBJECT_WASH_ASSETS[slug]?.src).toContain('/assets/atmosphere/subject-wash-');
      const lightMesh = buildAtmosphericFallbackMesh({
        variant: 'subject',
        isDark: false,
        subjectSlug: slug,
      });
      const darkMesh = buildAtmosphericFallbackMesh({
        variant: 'subject',
        isDark: true,
        subjectSlug: slug,
      });
      expect(lightMesh).toContain('#FFFFFF');
      expect(darkMesh).toContain('#121716');
    }
  });

  it('TopContextBar giữ bề mặt lu-glass-bar sắc gọn trên / để không đè xung đột với góc bo của Hero Frame', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LayoutProvider>
          <IslandProvider initialPathname="/">
            <TopContextBar />
          </IslandProvider>
        </LayoutProvider>
      </MemoryRouter>,
    );

    const bar = screen.getByTestId('top-context-bar');
    expect(bar.className).toContain('lu-glass-bar');
    expect(bar.className).toContain('border-b');
  });

  it('HomePage vận hành đủ các khối Academic OS cá nhân hóa: Hero thích ứng (không lặp tìm kiếm) + 3 thẻ chất liệu + 4 Thẻ Toán học SVG + Lịch biểu/To-Do + Banner Sảnh Thư Giãn', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LayoutProvider>
          <ReadingSettingsProvider>
            <IslandProvider initialPathname="/">
              <HomePage />
            </IslandProvider>
          </ReadingSettingsProvider>
        </LayoutProvider>
      </MemoryRouter>,
    );

    // Khối A: Khung Hero tràn viền thích ứng khung giờ (KHÔNG lặp thanh tìm kiếm)
    const heroFrame = screen.getByTestId('spatial-hero-frame');
    expect(heroFrame.className).toContain('rounded-[28px]');
    expect(screen.getByTestId('dashboard-atmospheric-canopy')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-atmospheric-canopy-scrim')).toBeInTheDocument();
    expect(screen.getByTestId('hero-time-greeting')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-floating-pill')).not.toBeInTheDocument();

    // Khối B: 3 Thẻ Tương Phản Chất Liệu gác lề âm trực tiếp lên chân ảnh Hero
    const dock = screen.getByTestId('three-material-dock');
    expect(dock.className).toContain('-mt-10');
    expect(dock.className).toContain('lg:-mt-28');

    const resumeCard = screen.getByTestId('dashboard-resume-card');
    expect(resumeCard).toHaveAttribute('data-material', 'ceramic');
    expect(resumeCard).not.toHaveClass('lu-glass-dock');

    const metricsCard = screen.getByTestId('dashboard-metrics-card');
    expect(metricsCard).toHaveAttribute('data-material', 'frosted-glass');
    expect(metricsCard.className).toContain('backdrop-blur-xl');

    const todayCard = screen.getByTestId('dashboard-today-card');
    expect(todayCard).toHaveAttribute('data-material', 'deep-emerald');
    expect(todayCard.className).toContain('bg-[#17332C]');

    // Khối C: 4 Thẻ Học Phần dùng đồ họa vector toán học SVG thuần (KHÔNG dùng ảnh phong cảnh)
    const subjectsGrid = screen.getByTestId('dashboard-subjects-grid');
    expect(subjectsGrid.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getByTestId('subject-svg-cau-truc-dai-so')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-hinh-hoc-affine')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-giai-tich-ham-mot-bien')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-giao-duc-hoc')).toBeInTheDocument();

    // Khối D: Lịch biểu, Mốc thi, To-Do & Nhịp chuyên cần cá nhân hóa
    expect(screen.getByTestId('study-planner-widget')).toBeInTheDocument();
    expect(screen.getByTestId('study-rhythm-card')).toBeInTheDocument();

    // Khối E: Editorial Overlap Card Di sản (có liên hệ toán học) + Thuật ngữ Flashcard + Banner Sảnh Thư Giãn
    expect(screen.getByTestId('dashboard-heritage-card')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-overlap-badge')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-math-connection')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-glossary-card')).toBeInTheDocument();

    // Banner Sảnh Thư Giãn đã gỡ khỏi Tổng quan (trùng Rail trái & thẻ Di sản)
    expect(screen.queryByTestId('dashboard-sanctuary-banner')).not.toBeInTheDocument();
  });

  it('LearningSpacePage hiển thị dải sương khí quyển đầu trang và mô hình 3D đặt nổi không viền hộp cứng', () => {
    render(
      <MemoryRouter initialEntries={['/learning-space']}>
        <ReadingSettingsProvider>
          <LearningSpacePage />
        </ReadingSettingsProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('learning-space-atmospheric-wash')).toBeInTheDocument();
    const hero3d = screen.getByTestId('hero-3d-column');
    expect(hero3d.className).not.toContain('border-[var(--border-hairline)]');
  });

  it('HeritageExhibitionPavilion hiển thị lớp ánh sáng nền thích ứng Adaptive Exhibition Aura phía sau khung triển lãm', () => {
    render(
      <MemoryRouter>
        <HeritageExhibitionPavilion />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('heritage-adaptive-aura')).toBeInTheDocument();
  });
});
