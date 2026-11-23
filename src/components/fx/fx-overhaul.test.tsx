import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  AcademicAxiomBand,
  BlueprintSectionFrame,
  EngravedGroundCanvas,
  FlutedGlassSurface,
  SlidingTabBar,
  SpecimenFxBars,
  TelemetrySpecBar,
} from '@/components/fx';

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

  it('hiển thị AcademicAxiomBand chứa công thức tiên đề, mốc lịch sử và trôi liên tục không có nút Tạm dừng', () => {
    render(<AcademicAxiomBand />);
    const band = screen.getByTestId('architectural-band');
    expect(band).toHaveTextContent('G / ker φ ≅ Im φ');
    expect(band).toHaveTextContent('1832 · É. GALOIS');
    expect(screen.queryByTestId('axiom-band-toggle')).not.toBeInTheDocument();
  });

  it('hiển thị SpecimenFxBars cho từng chương, gợn sóng khi hover thẻ và hiện nhãn thanh khi focus', () => {
    render(
      <SpecimenFxBars
        accentHex="#8C5828"
        darkAccentHex="#D99B5E"
        isCardHovered
        chapters={[
          { id: 'c1', title: 'Chương 1: Nhóm', totalLessons: 4, completedLessons: 2 },
          { id: 'c2', title: 'Chương 2: Vành', totalLessons: 6, completedLessons: 0 },
        ]}
      />,
    );
    const bars = screen.getByTestId('specimen-fx-bars');
    expect(bars.style.getPropertyValue('--fx-bar-accent')).toBe('#8C5828');
    expect(bars.style.getPropertyValue('--fx-bar-accent-dark')).toBe('#D99B5E');
    expect(bars.querySelectorAll('.lu-fx-bar-wave').length).toBe(2);
    const buttons = bars.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    fireEvent.mouseEnter(buttons[0]!);
    expect(screen.getByRole('status')).toHaveTextContent('Ch.1: 2/4');
  });

  it('SlidingTabBar điều hướng bằng click, bàn phím và hỗ trợ token màu Dark Mode', () => {
    render(<ControlledSlidingTabs />);
    const tablist = screen.getByTestId('sliding-tab-bar');
    expect(tablist).toHaveClass('dark:bg-[#181F1D]');
    expect(tablist.style.getPropertyValue('--fx-tab-accent-dark')).toBe('#286D57');
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabs[1]!, { key: 'End' });
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabs[2]!, { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });
});
