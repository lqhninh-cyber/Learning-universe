import type { GeometryStampKind, InkStampItem } from './types';

export interface GeometryStampPreset {
  readonly kind: GeometryStampKind;
  readonly label: string;
  readonly shortHint: string;
}

export const GEOMETRY_STAMP_PRESETS: readonly GeometryStampPreset[] = [
  { kind: 'right-angle', label: 'Góc vuông', shortHint: 'Ký hiệu 90° chuẩn' },
  { kind: 'tick-1', label: 'Bằng nhau (1)', shortHint: '1 vạch đoạn bằng nhau' },
  { kind: 'tick-2', label: 'Bằng nhau (2)', shortHint: '2 vạch đoạn bằng nhau' },
  { kind: 'tick-3', label: 'Bằng nhau (3)', shortHint: '3 vạch đoạn bằng nhau' },
  { kind: 'angle-arc-1', label: 'Cung góc (1)', shortHint: 'Đánh dấu 1 cung góc' },
  { kind: 'angle-arc-2', label: 'Cung góc (2)', shortHint: 'Đánh dấu 2 cung góc bằng nhau' },
  { kind: 'parallel-1', label: 'Song song (>)', shortHint: '1 mũi tên song song' },
  { kind: 'parallel-2', label: 'Song song (>>)', shortHint: '2 mũi tên song song' },
  { kind: 'dot-point', label: 'Điểm có tên', shortHint: 'Chấm điểm đặc kèm nhãn A, M, I...' },
];

export function renderGeometryStampOnCanvas(
  ctx: CanvasRenderingContext2D,
  stamp: InkStampItem,
): void {
  const half = Math.max(8, stamp.size / 2);

  ctx.save();
  ctx.translate(stamp.x, stamp.y);
  ctx.rotate((stamp.rotationDeg * Math.PI) / 180);
  ctx.strokeStyle = stamp.color;
  ctx.fillStyle = stamp.color;
  ctx.lineWidth = Math.max(1.4, stamp.lineWidth);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stamp.kind === 'right-angle') {
    const s = half * 0.85;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.5);
    ctx.lineTo(s * 0.5, -s * 0.5);
    ctx.lineTo(s * 0.5, s * 0.5);
    ctx.stroke();

    // Chấm nhỏ tinh tế hoặc nét vuông hoàn chỉnh
    ctx.globalAlpha = 0.16;
    ctx.fillRect(-s * 0.5, -s * 0.5, s, s);
    ctx.globalAlpha = 1;
  } else if (stamp.kind === 'tick-1' || stamp.kind === 'tick-2' || stamp.kind === 'tick-3') {
    const count = stamp.kind === 'tick-1' ? 1 : stamp.kind === 'tick-2' ? 2 : 3;
    const spacing = Math.max(5, half * 0.34);
    const len = half * 0.65;
    const startX = -((count - 1) * spacing) / 2;

    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const tx = startX + i * spacing;
      ctx.moveTo(tx - len * 0.22, -len * 0.6);
      ctx.lineTo(tx + len * 0.22, len * 0.6);
    }
    ctx.stroke();
  } else if (stamp.kind === 'angle-arc-1' || stamp.kind === 'angle-arc-2') {
    const r = half * 0.82;
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.42, 0);
    ctx.stroke();
    if (stamp.kind === 'angle-arc-2') {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, -Math.PI * 0.42, 0);
      ctx.stroke();
    }
    if (stamp.label?.trim()) {
      ctx.rotate((-stamp.rotationDeg * Math.PI) / 180);
      ctx.font = 'italic 600 13px "Times New Roman", Georgia, serif';
      ctx.fillText(stamp.label.trim(), r * 0.78, -r * 0.38);
    }
  } else if (stamp.kind === 'parallel-1' || stamp.kind === 'parallel-2') {
    const count = stamp.kind === 'parallel-1' ? 1 : 2;
    const spacing = Math.max(6, half * 0.4);
    const arm = half * 0.48;
    const startX = -((count - 1) * spacing) / 2;

    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const ax = startX + i * spacing;
      ctx.moveTo(ax - arm * 0.7, -arm * 0.65);
      ctx.lineTo(ax + arm * 0.45, 0);
      ctx.lineTo(ax - arm * 0.7, arm * 0.65);
    }
    ctx.stroke();
  } else if (stamp.kind === 'dot-point') {
    const r = Math.max(3.5, Math.min(7, half * 0.24));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    if (stamp.label?.trim()) {
      ctx.rotate((-stamp.rotationDeg * Math.PI) / 180);
      ctx.font = 'italic 700 16px "Times New Roman", Georgia, serif';
      ctx.fillText(stamp.label.trim(), r + 6, -r - 3);
    }
  }

  ctx.restore();
}

export function doesStampHitPoint(stamp: InkStampItem, px: number, py: number): boolean {
  const radius = Math.max(18, stamp.size * 0.62);
  return Math.hypot(px - stamp.x, py - stamp.y) <= radius;
}
