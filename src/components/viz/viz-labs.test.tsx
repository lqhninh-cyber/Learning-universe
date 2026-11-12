import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLessonById, LessonMdxView, loadLessonModule } from '@/content-runtime';
import {
  BarycentricViz,
  DesarguesProjectiveViz,
  EuclideanDotCrossViz,
  InlineTheoremViz,
  SymmetricGroupCycleViz,
} from '@/components/viz';
import {
  composePerm,
  computeBarycenter,
  computeDesargues,
  computeEuclideanMetrics,
  formatCycleNotation,
  generateCyclicSubgroup,
  permutationOrder,
  permutationSign,
  SVG_H,
  SVG_W,
} from '@/components/viz/viz-math';

function mockSvgRect(container: HTMLElement) {
  const svg = container.querySelector('svg.viz-svg');
  if (svg) {
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: SVG_W,
      height: SVG_H,
      right: SVG_W,
      bottom: SVG_H,
      toJSON: () => ({}),
    });
  }
  return svg;
}

describe('viz-math — Thuật toán hình học 2D & nhóm hoán vị thuần', () => {
  it('tính chính xác tâm tỉ cự và phát hiện suy biến khi ∑λᵢ = 0', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 3 },
    ] as const;

    const centroid = computeBarycenter(pts, [1, 1, 1]);
    expect(centroid.exists).toBe(true);
    expect(centroid.inSimplex).toBe(true);
    expect(centroid.point?.x).toBeCloseTo(1, 5);
    expect(centroid.point?.y).toBeCloseTo(1, 5);

    const outside = computeBarycenter(pts, [-1, 2, 1]);
    expect(outside.exists).toBe(true);
    expect(outside.inSimplex).toBe(false);

    const degenerate = computeBarycenter(pts, [1, 1, -2]);
    expect(degenerate.exists).toBe(false);
    expect(degenerate.point).toBeNull();
    expect(degenerate.freeVector).toEqual({ x: 3, y: -6 });
  });

  it('tính chính xác tích vô hướng, góc, diện tích hình bình hành và nhận diện trực giao', () => {
    const ortho = computeEuclideanMetrics({ x: 3, y: 0 }, { x: 0, y: 4 });
    expect(ortho.dot).toBeCloseTo(0, 6);
    expect(ortho.area).toBeCloseTo(12, 6);
    expect(ortho.angleDeg).toBeCloseTo(90, 4);
    expect(ortho.distanceToLineA).toBeCloseTo(4, 6);
    expect(ortho.isOrthogonal).toBe(true);

    const parallel = computeEuclideanMetrics({ x: 2, y: 1 }, { x: 4, y: 2 });
    expect(parallel.area).toBeCloseTo(0, 6);
    expect(parallel.isCollinear).toBe(true);
    expect(parallel.distanceToLineA).toBeCloseTo(0, 6);
  });

  it('tính giao điểm Desargues P, Q, R thẳng hàng và xử lý trường hợp cạnh song song ra vô tận', () => {
    const O = { x: 225, y: 32 };
    const A = { x: 210, y: 82 };
    const B = { x: 145, y: 148 };
    const C = { x: 305, y: 138 };

    const general = computeDesargues(O, A, B, C, [1.75, 1.3, 1.08]);
    expect(general.parallelCount).toBe(0);
    expect(general.P.kind).toBe('point');
    expect(general.Q.kind).toBe('point');
    expect(general.R.kind).toBe('point');

    if (general.P.kind === 'point' && general.Q.kind === 'point' && general.R.kind === 'point') {
      // Collinearity determinant |(Q - P) x (R - P)| == 0
      const det =
        (general.Q.point.x - general.P.point.x) * (general.R.point.y - general.P.point.y) -
        (general.Q.point.y - general.P.point.y) * (general.R.point.x - general.P.point.x);
      expect(Math.abs(det)).toBeLessThan(1e-4);
    }

    const parallelCase = computeDesargues(O, A, B, C, [1.525, 1.525, 0.93]);
    expect(parallelCase.parallelCount).toBe(1);
    expect(parallelCase.P.kind).toBe('parallel');
    expect(parallelCase.Q.kind).toBe('point');
    expect(parallelCase.R.kind).toBe('point');
    expect(parallelCase.axisLine).not.toBeNull();
  });

  it('tính chính xác tích hoán vị (từ phải sang trái), chu trình rời, cấp, dấu và nhóm Klein V4', () => {
    const t12 = [2, 1, 3];
    const t13 = [3, 2, 1];
    // (1 2)(1 3): 1->3->3? No: 1->3->3 (under t13: 1->3, then t12(3)=3) => (1 3 2)
    const p12_13 = composePerm(t12, t13);
    const p13_12 = composePerm(t13, t12);
    expect(formatCycleNotation(p12_13)).toBe('(1 3 2)');
    expect(formatCycleNotation(p13_12)).toBe('(1 2 3)');
    expect(p12_13).not.toEqual(p13_12);

    const v4a = [2, 1, 4, 3]; // (1 2)(3 4)
    const v4b = [3, 4, 1, 2]; // (1 3)(2 4)
    const v4c = composePerm(v4a, v4b);
    expect(formatCycleNotation(v4c)).toBe('(1 4)(2 3)');
    expect(permutationOrder(v4a)).toBe(2);
    expect(permutationSign(v4a)).toBe(1);

    const sigma4 = [2, 3, 4, 1]; // (1 2 3 4)
    expect(permutationOrder(sigma4)).toBe(4);
    expect(permutationSign(sigma4)).toBe(-1);
    expect(generateCyclicSubgroup(sigma4).map(formatCycleNotation)).toEqual([
      'id',
      '(1 2 3 4)',
      '(1 3)(2 4)',
      '(1 4 3 2)',
    ]);
  });
});

describe('Interactive 2D SVG Labs (.viz)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('BarycentricViz: hiển thị SVG viewBox 540x320, kéo đỉnh, kích hoạt suy biến ∑λᵢ=0 và Reset', () => {
    const { container } = render(<BarycentricViz />);
    const svg = mockSvgRect(container);
    expect(svg).toHaveAttribute('viewBox', '0 0 540 320');

    // Drag P1 and verify barycenter readout updates live
    const handleP1 = screen.getByTestId('handle-p1');
    fireEvent.pointerDown(handleP1, { clientX: 130, clientY: 245, pointerId: 1 });
    if (svg) {
      fireEvent.pointerMove(svg, { clientX: 250, clientY: 125, pointerId: 1 });
      fireEvent.pointerUp(svg, { pointerId: 1 });
    }
    expect(handleP1).toHaveAttribute('data-dragging', 'false');
    expect(screen.getByText(/\(1\.00, 0\.50\)/)).toBeInTheDocument();

    // Activate degenerate preset
    fireEvent.click(screen.getByRole('button', { name: /Suy biến ∑λᵢ = 0/i }));
    expect(screen.getByText(/Tâm tỉ cự G không tồn tại/i)).toBeInTheDocument();

    // Reset restores normal state
    fireEvent.click(screen.getByRole('button', { name: /Đặt lại \(Reset\)/i }));
    expect(screen.queryByText(/Tâm tỉ cự G không tồn tại/i)).not.toBeInTheDocument();
  });

  it('EuclideanDotCrossViz: chuyển chế độ Trực giao đánh dấu góc vuông và đổi góc b⃗', () => {
    const { container } = render(<EuclideanDotCrossViz />);
    mockSvgRect(container);

    fireEvent.click(screen.getByRole('button', { name: /Trực giao/i }));
    expect(screen.getByTestId('right-angle-marker')).toBeInTheDocument();
    expect(screen.getByText(/Hai véc-tơ trực giao/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cùng phương/i }));
    expect(screen.queryByTestId('right-angle-marker')).not.toBeInTheDocument();
  });

  it('DesarguesProjectiveViz: vẽ trục Desargues và chuyển sang chế độ AB ∥ A′B′ (P → ∞)', () => {
    const { container } = render(<DesarguesProjectiveViz />);
    mockSvgRect(container);

    expect(screen.getByTestId('desargues-axis')).toBeInTheDocument();
    expect(screen.getByTestId('desargues-P')).toBeInTheDocument();
    expect(screen.getByTestId('desargues-Q')).toBeInTheDocument();
    expect(screen.getByTestId('desargues-R')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /AB ∥ A′B′/i }));
    expect(screen.getByTestId('desargues-infinity-badge')).toBeInTheDocument();
    expect(screen.getByText(/điểm vô tận \(∞\)/i)).toBeInTheDocument();
  });

  it('SymmetricGroupCycleViz: chuyển S₃/S₄, tác động chuyển vị bằng click đỉnh và xem V₄', () => {
    render(<SymmetricGroupCycleViz />);

    expect(screen.getByTestId('perm-cycle-notation')).toHaveTextContent('σ = (1 2 3)');
    expect(screen.getByTestId('perm-order')).toHaveTextContent('3');

    // Click vertex 1 then vertex 2 to compose transposition (1 2) on left of (1 2 3)
    // (1 2) o (1 2 3): 1->2->1, 2->3->3, 3->1->2 => (2 3)
    fireEvent.click(screen.getByTestId('perm-node-1'));
    fireEvent.click(screen.getByTestId('perm-node-2'));
    expect(screen.getByTestId('perm-cycle-notation')).toHaveTextContent('σ = (2 3)');
    expect(screen.getByTestId('perm-order')).toHaveTextContent('2');

    // Switch to S4 & Klein V4
    fireEvent.click(screen.getByRole('button', { name: /S₄ & V₄/i }));
    expect(screen.getByTestId('perm-cycle-notation')).toHaveTextContent('(1 2)(3 4)');
    expect(screen.getByText(/nhóm con chuẩn tắc Klein V₄/i)).toBeInTheDocument();
  });

  it('InlineTheoremViz & LessonMdxView: tự động nhúng lab tương tác bên dưới đúng định lý trong bài giảng', async () => {
    const { container: empty } = render(<InlineTheoremViz blockId="unknown-id" />);
    expect(empty.firstChild).toBeNull();

    render(<InlineTheoremViz blockId="thm-p10-6" />);
    await waitFor(() => {
      expect(screen.getByText(/Định lí Desargues trong Mặt phẳng Xạ ảnh/i)).toBeInTheDocument();
    });

    // Verify full real MDX lesson (status: published, untouched MDX file) embeds BarycentricViz below thm-s4-1
    const compiled = await loadLessonModule('tam-ti-cu-cua-mot-he-diem');
    const lesson = getLessonById('tam-ti-cu-cua-mot-he-diem');
    expect(lesson).toBeDefined();
    render(<LessonMdxView Content={compiled.default} lessonMeta={compiled.lessonMeta} />);

    await waitFor(() => {
      expect(screen.getByText(/Tâm tỉ cự và Đơn hình afin ΔP₁P₂P₃/i)).toBeInTheDocument();
    });
  });
});
