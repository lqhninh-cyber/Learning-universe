import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ATMOSPHERIC_PALETTES } from '@/components/home/atmosphereThemes';
import {
  buildAtmosphereSpriteCache,
  createAtmosphereWorld,
  renderAtmosphereFrame,
} from '@/components/home/heroAtmosphereEngine';
import {
  AcademicAxiomBand,
  BlueprintSectionFrame,
  EngravedGroundCanvas,
  FlutedGlassSurface,
  SlidingTabBar,
  SpecimenFxBars,
  TelemetrySpecBar,
} from '@/components/fx';
import { createGlowSpriteCache } from '@/shared/lib/canvasSprites';

function ControlledSlidingTabs() {
  const [active, setActive] = useState('all');
  return (
    <SlidingTabBar
      ariaLabel="Kiểm thử tab trượt"
      activeId={active}
      onChange={setActive}
      tabs={[
        { id: 'all', label: 'Tất cả', count: 4 },
        { id: 'math', label: 'Toán học', count: 3 },
        { id: 'ped', label: 'Sư phạm', badge: 'Mới' },
      ]}
    />
  );
}

describe('Hệ thống hiệu ứng & kiến trúc fx (taste-skill + hallmark)', () => {
  it('hiển thị EngravedGroundCanvas an toàn trên JSDOM', () => {
    render(<EngravedGroundCanvas step={16} crosshairEvery={4} />);
    const canvas = screen.getByTestId('engraved-ground-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('hiển thị FlutedGlassSurface kèm số rãnh thấu kính và nội dung', () => {
    render(
      <FlutedGlassSurface ribs={18} tone="brass">
        <span>HỌC PHẦN TRỌNG TÂM</span>
      </FlutedGlassSurface>,
    );
    const surface = screen.getByTestId('fluted-glass-surface');
    expect(surface).toHaveAttribute('data-fluted-ribs', '18');
    expect(surface).toHaveTextContent('HỌC PHẦN TRỌNG TÂM');
  });

  it('hiển thị BlueprintSectionFrame với 4 nút chữ thập 12x12px + giao điểm header và chia cột', () => {
    const { container } = render(
      <BlueprintSectionFrame columnSeams={[0.5]} headerSeamTopPx={36}>
        <div>Nội dung bản vẽ</div>
      </BlueprintSectionFrame>,
    );
    expect(screen.getByTestId('blueprint-section-frame')).toHaveTextContent('Nội dung bản vẽ');
    // 4 góc + 2 giao điểm đường chân header + 2 điểm chia cột trên/dưới = 8 SVG chữ thập 12x12px
    const crosshairs = container.querySelectorAll('svg[width="12"][height="12"]');
    expect(crosshairs).toHaveLength(8);
  });

  it('hiển thị TelemetrySpecBar với mã bản vẽ, ô thước milimét và tọa độ chuột (X, Y)', () => {
    render(
      <TelemetrySpecBar
        sectionCode="DOC. LU-2026 // SANCTUARY"
        subtitle="TEST"
        items={[{ label: 'HỌC PHẦN', value: '04' }]}
      />,
    );
    const bar = screen.getByTestId('telemetry-spec-bar');
    expect(bar).toHaveTextContent('DOC. LU-2026 // SANCTUARY');
    expect(bar).toHaveTextContent('HỌC PHẦN');
    expect(bar).toHaveTextContent('04');
    expect(screen.getByTestId('telemetry-pointer-coords')).toHaveTextContent(
      /\(\d{4},\s*\d{4}\)\s*PX/i,
    );
  });

  it('hiển thị AcademicAxiomBand chứa công thức tiên đề, mốc lịch sử và nút tạm dừng', () => {
    render(<AcademicAxiomBand />);
    const band = screen.getByTestId('architectural-band');
    expect(band).toHaveTextContent('G / ker φ ≅ Im φ');
    expect(band).toHaveTextContent('1832 · É. GALOIS');

    const toggleBtn = screen.getByTestId('axiom-band-toggle');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('hiển thị SpecimenFxBars cho từng chương, gợn sóng khi hover thẻ và hiện nhãn thanh khi focus', () => {
    render(
      <SpecimenFxBars
        accentHex="#245746"
        isCardHovered
        chapters={[
          { id: 'c1', title: 'Chương 1: Nhóm', totalLessons: 4, completedLessons: 2 },
          { id: 'c2', title: 'Chương 2: Vành', totalLessons: 6, completedLessons: 0 },
        ]}
      />,
    );
    const bars = screen.getByTestId('specimen-fx-bars');
    expect(bars.querySelectorAll('.lu-fx-bar-wave').length).toBe(2);
    const buttons = bars.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    fireEvent.mouseEnter(buttons[0]!);
    expect(screen.getByRole('status')).toHaveTextContent('Ch.1: 2/4');
  });

  it('SlidingTabBar điều hướng bằng click và bàn phím ArrowRight / End / Home', () => {
    render(<ControlledSlidingTabs />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabs[1]!, { key: 'End' });
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabs[2]!, { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('renderAtmosphereFrame chạy trọn vẹn Aurora Curtains, God Rays & Ridgeline Slices ở mọi pha', () => {
    const noop = vi.fn();
    const gradMock = { addColorStop: noop };
    const ctxMock = {
      save: noop,
      restore: noop,
      setTransform: noop,
      translate: noop,
      scale: noop,
      rotate: noop,
      clearRect: noop,
      fillRect: noop,
      strokeRect: noop,
      beginPath: noop,
      closePath: noop,
      moveTo: noop,
      lineTo: noop,
      quadraticCurveTo: noop,
      bezierCurveTo: noop,
      arc: noop,
      ellipse: noop,
      fill: noop,
      stroke: noop,
      clip: noop,
      setLineDash: noop,
      drawImage: noop,
      fillText: noop,
      measureText: () => ({ width: 24 }),
      createLinearGradient: () => gradMock,
      createRadialGradient: () => gradMock,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      lineDashOffset: 0,
      font: '12px sans-serif',
      textAlign: 'left',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D;

    const palette = ATMOSPHERIC_PALETTES['binh-minh-bach-ngoc'];
    const world = createAtmosphereWorld();
    const sprites = buildAtmosphereSpriteCache();
    const glowSprites = createGlowSpriteCache();

    expect(() =>
      renderAtmosphereFrame({
        ctx: ctxMock,
        width: 1280,
        height: 720,
        tSec: 4.5,
        dtSeconds: 0.0083,
        dtScale: 0.5,
        scrollProgress: 0.1,
        palette,
        world,
        sprites,
        glowSprites,
        terrainLayers: undefined,
        mouse: {
          active: true,
          x: 780,
          y: 360,
          vx: 0,
          vy: 0,
          normX: 0.22,
          normY: 0,
        },
        animate: true,
      }),
    ).not.toThrow();
  });
});
