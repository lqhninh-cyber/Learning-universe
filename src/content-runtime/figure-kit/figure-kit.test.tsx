import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';
import {
  addVec,
  AffineMapDemo,
  applyAffineMap2D,
  Barycenter,
  computeBarycenter,
  fourthParallelogramVertex,
  Parallelogram,
  type Point2D,
  resolveAffineCoordinates,
  scaleVec,
  translatePoint,
  vectorBetween,
} from './index';

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return {
    router,
    ...render(
      <MotionProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </MotionProvider>,
    ),
  };
}

describe('Giai đoạn 5 — Figure Kit 2D với Mafs (Hình học Affine tương tác)', () => {
  describe('1. Kiểm thử toán học lõi Hình học Affine (affine-math.ts)', () => {
    it('kiểm nghiệm đẳng thức Chasles AB + BC = AC và đỉnh thứ tư của hình bình hành ABCD', () => {
      const A: Point2D = [-2.5, -1.2];
      const B: Point2D = [1.0, -0.8];
      const D: Point2D = [-1.1, 1.7];
      const C = fourthParallelogramVertex(A, B, D);

      const ab = vectorBetween(A, B);
      const bc = vectorBetween(B, C);
      const ac = vectorBetween(A, C);
      const dc = vectorBetween(D, C);
      const ad = vectorBetween(A, D);

      // AB + BC = AC
      const sumChasles = addVec(ab, bc);
      expect(sumChasles[0]).toBeCloseTo(ac[0], 6);
      expect(sumChasles[1]).toBeCloseTo(ac[1], 6);

      // AB = DC và AD = BC
      expect(ab[0]).toBeCloseTo(dc[0], 6);
      expect(ab[1]).toBeCloseTo(dc[1], 6);
      expect(ad[0]).toBeCloseTo(bc[0], 6);
      expect(ad[1]).toBeCloseTo(bc[1], 6);
    });

    it('phân tích chính xác tọa độ affine trong mục tiêu xiên R = (O; e1, e2) và phát hiện suy biến', () => {
      const O: Point2D = [-1, 0.5];
      const e1: Point2D = [2, 0.5];
      const e2: Point2D = [-0.5, 1.5];
      const M: Point2D = [2.5, 3.25];

      const coords = resolveAffineCoordinates(O, e1, e2, M);
      expect(coords.degenerate).toBe(false);

      // O + x*e1 + y*e2 phải trùng khít với M
      const reconstructed = translatePoint(
        translatePoint(O, scaleVec(e1, coords.x)),
        scaleVec(e2, coords.y),
      );
      expect(reconstructed[0]).toBeCloseTo(M[0], 6);
      expect(reconstructed[1]).toBeCloseTo(M[1], 6);

      // Hai vectơ cơ sở cùng phương -> suy biến (degenerate = true)
      const degenerate = resolveAffineCoordinates(O, [2, 1], [4, 2], M);
      expect(degenerate.degenerate).toBe(true);
    });

    it('tính đúng tâm tỉ cự G và bảo toàn tâm tỉ cự qua ánh xạ affine phẳng f', () => {
      const A: Point2D = [-3, -1];
      const B: Point2D = [2, -2];
      const C: Point2D = [1, 3];

      const bary = computeBarycenter([
        { point: A, weight: 2 },
        { point: B, weight: 1 },
        { point: C, weight: 3 },
      ]);
      expect(bary.exists).toBe(true);
      expect(bary.barycenter).not.toBeNull();

      const matrix = { a11: 1.2, a12: -0.5, a21: 0.4, a22: 0.9 };
      const translation: Point2D = [1.5, -0.7];

      const imageG = applyAffineMap2D(bary.barycenter!, matrix, translation);
      const baryOfImages = computeBarycenter([
        { point: applyAffineMap2D(A, matrix, translation), weight: 2 },
        { point: applyAffineMap2D(B, matrix, translation), weight: 1 },
        { point: applyAffineMap2D(C, matrix, translation), weight: 3 },
      ]);

      expect(imageG[0]).toBeCloseTo(baryOfImages.barycenter![0], 6);
      expect(imageG[1]).toBeCloseTo(baryOfImages.barycenter![1], 6);

      // Trường hợp tổng trọng số bằng 0
      const zeroSum = computeBarycenter([
        { point: A, weight: 1 },
        { point: B, weight: -1 },
      ]);
      expect(zeroSum.exists).toBe(false);
      expect(zeroSum.barycenter).toBeNull();
    });
  });

  describe('2. Kiểm thử tương tác Component của Figure Kit', () => {
    it('Parallelogram hiển thị khung Mafs SVG, cho phép bật/tắt lưới và Đặt lại hình', async () => {
      const user = userEvent.setup();
      render(<Parallelogram />);

      expect(
        screen.getByRole('region', {
          name: /Quy tắc Hình bình hành trong Không gian Affine/i,
        }),
      ).toBeInTheDocument();

      const gridButton = screen.getByRole('button', { name: /Ẩn lưới/i });
      await user.click(gridButton);
      expect(screen.getByRole('button', { name: /Hiện lưới/i })).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /Đặt lại hình/i });
      await user.click(resetButton);
    });

    it('Barycenter cho phép chuyển đổi nhanh giữa Trọng tâm, Trung điểm và Tổng trọng số bằng 0', async () => {
      const user = userEvent.setup();
      render(<Barycenter pointCount={3} />);

      await user.click(screen.getByRole('button', { name: /Tổng bằng 0/i }));
      expect(
        screen.getByText(/Tổng trọng số S = 0: Không tồn tại tâm tỉ cự G/i),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Trọng tâm △ABC/i }));
      expect(screen.getByText(/Tổng trọng số S = 3/i)).toBeInTheDocument();
    });

    it('AffineMapDemo cho phép chuyển đổi các preset biến đổi Affine và hiển thị công thức tương ứng', async () => {
      const user = userEvent.setup();
      render(<AffineMapDemo />);

      await user.click(screen.getByRole('button', { name: /Phép trượt \(Shear\)/i }));
      expect(screen.getByText(/x' = x \+ 0\.7y, y' = y \+ 0\.5/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Phép chiếu song song/i }));
      expect(screen.getByText(/biến △ABC thành đoạn thẳng/i)).toBeInTheDocument();
    });
  });

  describe('3. Kiểm thử tích hợp Trang /dev/figures và Bài học Hình học Affine', () => {
    it('hiển thị đầy đủ 4 phòng thí nghiệm trực quan tại /dev/figures', async () => {
      renderRoute('/dev/figures');

      expect(
        await screen.findByRole('heading', {
          level: 1,
          name: /Phòng thí nghiệm Hình học Tương tác — Figure Kit \(Mafs\)/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('region', { name: /Lab 1: Quy tắc Chasles và Định lý Hình bình hành/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /Lab 3: Tâm tỉ cự và Tổ hợp Affine/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /Lab 4: Ánh xạ Affine phẳng/i }),
      ).toBeInTheDocument();
    });

    it('hiển thị 3 hình tương tác mẫu trong bài học Hình học Affine (/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine)', async () => {
      renderRoute('/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine');

      expect(
        await screen.findByRole('region', {
          name: /Mô hình tương tác: Tiên đề Weyl & Quy tắc ba điểm Chasles/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('region', {
          name: /Mô hình tương tác: Quy tắc Hình bình hành/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('region', {
          name: /Mô hình tương tác: Trung điểm & Tâm tỉ cự hai điểm/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
