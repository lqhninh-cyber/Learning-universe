import { Compass, Layers, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  AffineFrame,
  AffineLine,
  AffineMapDemo,
  AffinePlane,
  Barycenter,
  DraggablePoint,
  formatCoords,
  Parallelogram,
  type Point2D,
  VectorArrow,
} from '@/content-runtime/figure-kit';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Card } from '@/shared/ui';

export function DevFiguresPage() {
  const [linePointA, setLinePointA] = useState<Point2D>([-2.5, -1.0]);
  const [linePointB, setLinePointB] = useState<Point2D>([2.0, 1.2]);
  const [shadeHalfPlane, setShadeHalfPlane] = useState(true);

  return (
    <FadeIn className="space-y-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Phòng thí nghiệm Figure Kit 2D với Mafs (/dev/figures)' },
        ]}
      />

      <header className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-2xs sm:p-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="subject">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Giai đoạn 5 — Figure Kit với Mafs</span>
            </Badge>
            <Badge variant="neutral">8 Component Hình học Affine 2D</Badge>
            <Badge variant="neutral">Hỗ trợ Cảm ứng (Touch Gestures)</Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Phòng thí nghiệm Hình học Tương tác — Figure Kit (Mafs)
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
            Bộ 8 component cấp cao dành riêng cho học phần <strong>Hình học Affine</strong>: nạp
            lười (<code className="font-mono text-stone-800">vendor-mafs</code>), vùng chạm cảm ứng
            44px trên di động và kiểm tra trực tiếp bằng{' '}
            <code className="font-mono text-stone-800">content:check</code>.
          </p>
        </div>
      </header>

      <section aria-label="Lab 1: Quy tắc Chasles và Định lý Hình bình hành" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-stone-900">
            Lab 1: Tiên đề Chasles & Quy tắc Hình bình hành (<code>&lt;Parallelogram /&gt;</code>)
          </h2>
        </div>
        <Parallelogram />
      </section>

      <section
        aria-label="Lab 2: Mục tiêu Affine xiên và Siêu phẳng"
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-stone-900">
              Lab 2A: Mục tiêu Affine (<code>&lt;AffineFrame /&gt;</code>)
            </h2>
          </div>
          <AffineFrame height={340} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-stone-900">
              Lab 2B: Đường thẳng & Siêu phẳng (<code>&lt;AffineLine /&gt;</code>)
            </h2>
          </div>
          <AffinePlane
            title="Đường thẳng qua 2 điểm A, B và Siêu phẳng x - 2y + 1 = 0"
            instruction="Kéo điểm A, B để đổi đường thẳng d; bật/tắt miền nửa mặt phẳng của siêu phẳng H."
            height={340}
            onReset={() => {
              setLinePointA([-2.5, -1.0]);
              setLinePointB([2.0, 1.2]);
              setShadeHalfPlane(true);
            }}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono">
                  A{formatCoords(linePointA)} · B{formatCoords(linePointB)}
                </span>
                <button
                  type="button"
                  onClick={() => setShadeHalfPlane((prev) => !prev)}
                  className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-medium text-stone-700 hover:bg-stone-100"
                >
                  {shadeHalfPlane ? 'Ẩn miền nửa mặt phẳng H⁺' : 'Hiện miền nửa mặt phẳng H⁺'}
                </button>
              </div>
            }
          >
            <AffineLine
              generalEquation={{ a: 1, b: -2, c: 1, shadeHalfPlane }}
              label="H: x - 2y + 1 = 0"
              tone="accent"
              style="dashed"
            />
            <AffineLine through={[linePointA, linePointB]} label="d = AB" tone="secondary" />
            <VectorArrow tail={linePointA} tip={linePointB} label="u_d" tone="primary" />
            <DraggablePoint
              point={linePointA}
              onMove={setLinePointA}
              label="A"
              attach="sw"
              tone="primary"
            />
            <DraggablePoint
              point={linePointB}
              onMove={setLinePointB}
              label="B"
              attach="ne"
              tone="secondary"
            />
          </AffinePlane>
        </div>
      </section>

      <section aria-label="Lab 3: Tâm tỉ cự và Tổ hợp Affine" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-stone-900">
            Lab 3: Tâm tỉ cự & Tổ hợp Affine (<code>&lt;Barycenter /&gt;</code>)
          </h2>
        </div>
        <Barycenter pointCount={3} />
      </section>

      <section aria-label="Lab 4: Ánh xạ Affine phẳng" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-stone-900">
            Lab 4: Ánh xạ Affine & Bảo toàn Tâm tỉ cự (<code>&lt;AffineMapDemo /&gt;</code>)
          </h2>
        </div>
        <AffineMapDemo />
      </section>

      <Card className="p-6 text-xs text-stone-600">
        <p className="font-semibold text-stone-900">
          Danh sách 8 Component trong Whitelist của Figure Kit:
        </p>
        <p className="mt-1 font-mono text-stone-700">
          AffinePlane · DraggablePoint · VectorArrow · AffineLine · AffineFrame · Parallelogram ·
          Barycenter · AffineMapDemo
        </p>
      </Card>
    </FadeIn>
  );
}

export default DevFiguresPage;
