import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HeritageExhibitionPavilion } from '@/components/home/HeritageExhibitionPavilion';
import { TopContextBar } from '@/components/layout/TopContextBar';
import {
  buildAtmosphericFallbackMesh,
  DASHBOARD_CANOPY_ASSETS,
  SUBJECT_WASH_ASSETS,
} from '@/config/atmosphereAssets';
import { IslandProvider } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { HomePage } from '@/pages/home/HomePage';
import { LearningSpacePage } from '@/pages/learning-space/LearningSpacePage';
import { AtmosphericCanopy } from './AtmosphericCanopy';

describe('Thiên Cảnh Kính Mờ (Atmospheric Glassmorphism) — 6 Trụ Cột', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('AtmosphericCanopy nạp đúng ảnh Sáng/Tối độc lập và tự chuyển sang Fallback CSS mượt khi thiếu file ảnh ngoài', async () => {
    const { container } = render(
      <ReadingSettingsProvider>
        <AtmosphericCanopy variant="dashboard" testId="test-canopy">
          <h1>Tiêu đề thử nghiệm</h1>
        </AtmosphericCanopy>
      </ReadingSettingsProvider>,
    );

    const canopy = screen.getByTestId('test-canopy');
    expect(canopy).toHaveAttribute('data-atmosphere-theme', 'light');
    expect(screen.getByTestId('test-canopy-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('test-canopy-celestial')).toBeInTheDocument();

    const lightImg = container.querySelector('img');
    expect(lightImg).not.toBeNull();
    expect(lightImg).toHaveAttribute('src', DASHBOARD_CANOPY_ASSETS.light);

    // Giả lập chưa đặt file ảnh ngoài -> onError ẩn sạch <img>, không bao giờ hiện icon ảnh vỡ
    if (lightImg) {
      fireEvent.error(lightImg);
    }
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('test-canopy-fallback')).toBeInTheDocument();

    // Chuyển sang Chế độ Tối độc lập -> nạp dashboard-canopy-dark.webp (không dùng invert)
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

  it('cung cấp đầy đủ cấu hình ảnh và fallback màu nước độc lập cho 4 học phần', () => {
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

  it('TopContextBar trong suốt tại đỉnh trang / (scrollY <= 16) và chuyển sang kính mờ khi cuộn trang', () => {
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
    expect(bar).toHaveAttribute('data-transparent', 'true');
    expect(bar.className).toContain('bg-transparent');

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 48, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(bar).toHaveAttribute('data-transparent', 'false');
    expect(bar.className).toContain('lu-glass-bar');
  });

  it('HomePage vận hành đủ 3 tầng Trục Z: Mái Vòm Khí Quyển + Cầu Nối Kính Mờ (Tầng 2) + Mặt Phẳng Học Thuật sạch (Tầng 3)', () => {
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

    // Tầng 1: Mái Vòm Khí Quyển & dải chữ dọc nghệ thuật
    expect(screen.getByTestId('dashboard-atmospheric-canopy')).toBeInTheDocument();
    expect(screen.getByTestId('canopy-vertical-label')).toHaveClass('lu-vertical-label');

    // Tầng 2: Cầu Nối Kính Mờ (chỉ 2 thẻ kính mờ gối lề âm)
    expect(screen.getByTestId('floating-glass-dock')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-resume-card')).toHaveClass('lu-glass-dock');
    expect(screen.getByTestId('dashboard-metrics-card')).toHaveClass('lu-glass-dock');

    // Tầng 3: Mặt Phẳng Học Thuật sạch — KHÔNG dùng kính mờ
    expect(screen.getByTestId('dashboard-subject-card-cau-truc-dai-so')).not.toHaveClass(
      'lu-glass-dock',
    );
    expect(screen.getByTestId('dashboard-heritage-card')).not.toHaveClass('lu-glass-dock');
    expect(screen.getByTestId('dashboard-glossary-card')).not.toHaveClass('lu-glass-dock');
    expect(screen.getByTestId('dashboard-billiards-card')).not.toHaveClass('lu-glass-dock');
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
