import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { useSubjectTheme } from '@/shared/theme/subject-themes';
import { SubjectThemeProvider } from '@/shared/theme/SubjectThemeProvider';
import {
  AffineGridMotif,
  AlgebraicSymmetryMotif,
  Badge,
  Breadcrumb,
  Button,
  CalculusCurveMotif,
  Collapsible,
  DefinitionPillarMotif,
  DongSonConcentricMotif,
  ExamplePillarMotif,
  ExercisePillarMotif,
  HeritageDivider,
  KagomeWeaveDivider,
  ProgressRing,
  ProofPillarMotif,
  TheoremPillarMotif,
  TheoryPillarMotif,
  TooltipProvider,
} from '@/shared/ui';

function ThemeConsumerProbe() {
  const theme = useSubjectTheme();
  return (
    <div>
      <span data-testid="theme-name">{theme.name}</span>
      <span data-testid="theme-hue">{theme.hue}</span>
    </div>
  );
}

describe('Design System & Subject Theming (Giai đoạn 1)', () => {
  it('gán đúng data-subject và cung cấp metadata qua SubjectThemeProvider', () => {
    const { container } = render(
      <SubjectThemeProvider subject="algebraic-structures">
        <ThemeConsumerProbe />
      </SubjectThemeProvider>,
    );

    const wrapper = container.querySelector('[data-subject="algebraic-structures"]');
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByTestId('theme-name')).toHaveTextContent('Cấu trúc đại số');
    expect(screen.getByTestId('theme-hue')).toHaveTextContent('275');
  });

  it('hiển thị và đóng/mở Collapsible khi người dùng tương tác', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible title="Chứng minh định lý">
        <p>Nội dung chứng minh chi tiết.</p>
      </Collapsible>,
    );

    expect(screen.queryByText('Nội dung chứng minh chi tiết.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Chứng minh định lý/i }));
    expect(screen.getByText('Nội dung chứng minh chi tiết.')).toBeInTheDocument();
  });

  it('clamp giá trị ProgressRing trong khoảng 0..100 và gắn thuộc tính ARIA chuẩn', () => {
    render(<ProgressRing value={125} />);
    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('kết xuất Button, Badge và Breadcrumb đúng ngữ nghĩa', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <div>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Cấu trúc đại số' }]} />
            <Badge variant="subject">Nhóm</Badge>
            <Button variant="subject">Bắt đầu học</Button>
          </div>
        ),
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Cấu trúc đại số')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Bắt đầu học' })).toBeInTheDocument();
  });

  it('mở được trang /dev/ui và chuyển đổi trực tiếp giữa các bảng màu môn học', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ['/dev/ui'] });
    const { container } = render(
      <MotionProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </MotionProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: /Design System & Subject Theming/i }),
    ).toBeInTheDocument();

    expect(container.querySelector('[data-subject="algebraic-structures"]')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Hình học Affine/i }));
    expect(container.querySelector('[data-subject="affine-geometry"]')).toBeInTheDocument();
  });

  it('kết xuất đầy đủ 12 component họa tiết di sản với aria-hidden="true" chuẩn accessibility', () => {
    const { container } = render(
      <div>
        <DongSonConcentricMotif data-testid="dong-son" />
        <AlgebraicSymmetryMotif data-testid="algebra-motif" />
        <AffineGridMotif data-testid="affine-motif" />
        <CalculusCurveMotif data-testid="calculus-motif" />
        <HeritageDivider data-testid="heritage-divider" />
        <KagomeWeaveDivider data-testid="kagome-divider" />
        <TheoryPillarMotif data-testid="theory-motif" />
        <DefinitionPillarMotif data-testid="definition-motif" />
        <TheoremPillarMotif data-testid="theorem-motif" />
        <ProofPillarMotif data-testid="proof-motif" />
        <ExamplePillarMotif data-testid="example-motif" />
        <ExercisePillarMotif data-testid="exercise-motif" />
      </div>,
    );

    const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThanOrEqual(12);
  });
});
