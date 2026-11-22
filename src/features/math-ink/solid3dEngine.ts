import type { Ink3DSolidItem, Solid3DPresetKind } from './types';

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface SolidVertex {
  readonly id: string;
  readonly label: string;
  readonly pos: Vec3;
  readonly aux?: boolean;
}

export interface SolidEdge {
  readonly from: string;
  readonly to: string;
  /** Cạnh phụ (đường cao, đường chéo đáy) */
  readonly aux?: boolean;
  /** Cạnh mũi tên (cho hệ trục Oxyz) */
  readonly arrow?: boolean;
  /** Ép nét đứt (cho đường bên trong khối không gian) */
  readonly forceDashed?: boolean;
}

export interface SolidFace {
  readonly vertices: readonly string[];
}

export interface Solid3DPresetMeta {
  readonly kind: Solid3DPresetKind;
  readonly name: string;
  readonly shortName: string;
  readonly defaultYaw: number;
  readonly defaultPitch: number;
}

export const SOLID_3D_PRESETS: readonly Solid3DPresetMeta[] = [
  {
    kind: 'pyramid-tri',
    name: 'Hình chóp tam giác S.ABC',
    shortName: 'Chóp S.ABC',
    defaultYaw: 28,
    defaultPitch: 20,
  },
  {
    kind: 'pyramid-quad',
    name: 'Hình chóp tứ giác S.ABCD',
    shortName: 'Chóp S.ABCD',
    defaultYaw: 32,
    defaultPitch: 20,
  },
  {
    kind: 'prism-tri',
    name: "Hình lăng trụ ABC.A'B'C'",
    shortName: 'Lăng trụ',
    defaultYaw: 24,
    defaultPitch: 18,
  },
  {
    kind: 'box',
    name: "Hình hộp / Lập phương ABCD.A'B'C'D'",
    shortName: 'Hình hộp',
    defaultYaw: 34,
    defaultPitch: 22,
  },
  {
    kind: 'cone',
    name: 'Hình nón (đỉnh S, tâm O)',
    shortName: 'Hình nón',
    defaultYaw: 20,
    defaultPitch: 22,
  },
  {
    kind: 'cylinder',
    name: "Hình trụ (hai tâm O, O')",
    shortName: 'Hình trụ',
    defaultYaw: 20,
    defaultPitch: 20,
  },
  {
    kind: 'sphere',
    name: 'Mặt cầu tâm O bán kính R',
    shortName: 'Mặt cầu',
    defaultYaw: 25,
    defaultPitch: 18,
  },
  {
    kind: 'oxyz',
    name: 'Hệ trục tọa độ Oxyz',
    shortName: 'Hệ Oxyz',
    defaultYaw: 35,
    defaultPitch: 22,
  },
];

interface PolyhedronModel {
  readonly vertices: readonly SolidVertex[];
  readonly edges: readonly SolidEdge[];
  readonly faces: readonly SolidFace[];
}

function getPolyhedronModel(kind: Solid3DPresetKind): PolyhedronModel | null {
  if (kind === 'pyramid-tri') {
    return {
      vertices: [
        { id: 'S', label: 'S', pos: { x: -0.05, y: 1.05, z: 0.05 } },
        { id: 'A', label: 'A', pos: { x: 0.05, y: -0.75, z: -0.85 } },
        { id: 'B', label: 'B', pos: { x: -0.95, y: -0.75, z: 0.65 } },
        { id: 'C', label: 'C', pos: { x: 0.95, y: -0.75, z: 0.55 } },
        { id: 'H', label: 'H', pos: { x: -0.05, y: -0.75, z: 0.05 }, aux: true },
      ],
      edges: [
        { from: 'S', to: 'A' },
        { from: 'S', to: 'B' },
        { from: 'S', to: 'C' },
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' },
        { from: 'S', to: 'H', aux: true, forceDashed: true },
      ],
      faces: [
        { vertices: ['A', 'C', 'B'] },
        { vertices: ['S', 'B', 'C'] },
        { vertices: ['S', 'C', 'A'] },
        { vertices: ['S', 'A', 'B'] },
      ],
    };
  }

  if (kind === 'pyramid-quad') {
    return {
      vertices: [
        { id: 'S', label: 'S', pos: { x: 0, y: 1.1, z: 0 } },
        { id: 'A', label: 'A', pos: { x: -0.72, y: -0.72, z: -0.72 } },
        { id: 'B', label: 'B', pos: { x: -0.72, y: -0.72, z: 0.72 } },
        { id: 'C', label: 'C', pos: { x: 0.72, y: -0.72, z: 0.72 } },
        { id: 'D', label: 'D', pos: { x: 0.72, y: -0.72, z: -0.72 } },
        { id: 'O', label: 'O', pos: { x: 0, y: -0.72, z: 0 }, aux: true },
      ],
      edges: [
        { from: 'S', to: 'A' },
        { from: 'S', to: 'B' },
        { from: 'S', to: 'C' },
        { from: 'S', to: 'D' },
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'A' },
        { from: 'A', to: 'C', aux: true, forceDashed: true },
        { from: 'B', to: 'D', aux: true, forceDashed: true },
        { from: 'S', to: 'O', aux: true, forceDashed: true },
      ],
      faces: [
        { vertices: ['A', 'D', 'C', 'B'] },
        { vertices: ['S', 'B', 'C'] },
        { vertices: ['S', 'C', 'D'] },
        { vertices: ['S', 'D', 'A'] },
        { vertices: ['S', 'A', 'B'] },
      ],
    };
  }

  if (kind === 'prism-tri') {
    return {
      vertices: [
        { id: 'A', label: 'A', pos: { x: 0.05, y: -0.78, z: -0.78 } },
        { id: 'B', label: 'B', pos: { x: -0.88, y: -0.78, z: 0.62 } },
        { id: 'C', label: 'C', pos: { x: 0.88, y: -0.78, z: 0.52 } },
        { id: 'A1', label: "A'", pos: { x: 0.2, y: 0.84, z: -0.78 } },
        { id: 'B1', label: "B'", pos: { x: -0.73, y: 0.84, z: 0.62 } },
        { id: 'C1', label: "C'", pos: { x: 1.03, y: 0.84, z: 0.52 } },
      ],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' },
        { from: 'A1', to: 'B1' },
        { from: 'B1', to: 'C1' },
        { from: 'C1', to: 'A1' },
        { from: 'A', to: 'A1' },
        { from: 'B', to: 'B1' },
        { from: 'C', to: 'C1' },
      ],
      faces: [
        { vertices: ['A', 'C', 'B'] },
        { vertices: ['A1', 'B1', 'C1'] },
        { vertices: ['B', 'C', 'C1', 'B1'] },
        { vertices: ['C', 'A', 'A1', 'C1'] },
        { vertices: ['A', 'B', 'B1', 'A1'] },
      ],
    };
  }

  if (kind === 'box') {
    return {
      vertices: [
        { id: 'A', label: 'A', pos: { x: -0.72, y: -0.68, z: -0.62 } },
        { id: 'B', label: 'B', pos: { x: -0.72, y: -0.68, z: 0.62 } },
        { id: 'C', label: 'C', pos: { x: 0.72, y: -0.68, z: 0.62 } },
        { id: 'D', label: 'D', pos: { x: 0.72, y: -0.68, z: -0.62 } },
        { id: 'A1', label: "A'", pos: { x: -0.58, y: 0.72, z: -0.62 } },
        { id: 'B1', label: "B'", pos: { x: -0.58, y: 0.72, z: 0.62 } },
        { id: 'C1', label: "C'", pos: { x: 0.86, y: 0.72, z: 0.62 } },
        { id: 'D1', label: "D'", pos: { x: 0.86, y: 0.72, z: -0.62 } },
      ],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'A' },
        { from: 'A1', to: 'B1' },
        { from: 'B1', to: 'C1' },
        { from: 'C1', to: 'D1' },
        { from: 'D1', to: 'A1' },
        { from: 'A', to: 'A1' },
        { from: 'B', to: 'B1' },
        { from: 'C', to: 'C1' },
        { from: 'D', to: 'D1' },
        { from: 'A', to: 'C', aux: true, forceDashed: true },
        { from: 'B', to: 'D', aux: true, forceDashed: true },
      ],
      faces: [
        { vertices: ['A', 'D', 'C', 'B'] },
        { vertices: ['A1', 'B1', 'C1', 'D1'] },
        { vertices: ['B', 'C', 'C1', 'B1'] },
        { vertices: ['C', 'D', 'D1', 'C1'] },
        { vertices: ['D', 'A', 'A1', 'D1'] },
        { vertices: ['A', 'B', 'B1', 'A1'] },
      ],
    };
  }

  if (kind === 'oxyz') {
    return {
      vertices: [
        { id: 'O', label: 'O', pos: { x: 0, y: 0, z: 0 } },
        { id: 'X', label: 'x', pos: { x: -0.75, y: -0.45, z: 0.95 } },
        { id: 'Y', label: 'y', pos: { x: 1.15, y: 0, z: 0 } },
        { id: 'Z', label: 'z', pos: { x: 0, y: 1.15, z: 0 } },
      ],
      edges: [
        { from: 'O', to: 'X', arrow: true },
        { from: 'O', to: 'Y', arrow: true },
        { from: 'O', to: 'Z', arrow: true },
      ],
      faces: [],
    };
  }

  return null;
}

export function rotatePoint3D(p: Vec3, yawDeg: number, pitchDeg: number): Vec3 {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;

  // Xoay quanh trục Y (yaw)
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;

  // Xoay quanh trục X (pitch)
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = p.y * cosP - z1 * sinP;
  const z2 = p.y * sinP + z1 * cosP;

  return { x: x1, y: y2, z: z2 };
}

function projectToBox(
  p: Vec3,
  cx: number,
  cy: number,
  scale: number,
): { readonly x: number; readonly y: number; readonly z: number } {
  const perspective = 4.6 / (4.6 - p.z * 0.55);
  return {
    x: cx + p.x * scale * perspective,
    y: cy - p.y * scale * perspective,
    z: p.z,
  };
}

function drawArrowTip(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
): void {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function drawCurvedSolid3D(ctx: CanvasRenderingContext2D, item: Ink3DSolidItem): void {
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;
  const scale = Math.min(item.width, item.height) * 0.36;
  const pitchRad = (Math.max(8, Math.min(55, item.pitch)) * Math.PI) / 180;
  const rx = scale * 0.92;
  const ry = Math.max(10, rx * Math.sin(pitchRad));

  ctx.strokeStyle = item.color;
  ctx.fillStyle = item.color;
  ctx.lineWidth = item.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawLabel = (text: string, lx: number, ly: number) => {
    if (!item.showLabels) return;
    ctx.save();
    ctx.font = 'italic 600 14px "Times New Roman", Georgia, serif';
    ctx.fillStyle = item.color;
    ctx.fillText(text, lx, ly);
    ctx.restore();
  };

  if (item.preset === 'cone') {
    const topY = cy - scale * 1.05;
    const baseY = cy + scale * 0.78;

    // Cung trước (nét liền)
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI, false);
    ctx.stroke();

    // Cung sau bị che khuất (nét đứt)
    ctx.setLineDash(item.dashedHidden ? [6, 5] : []);
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, Math.PI * 2, false);
    ctx.stroke();

    // Hai đường sinh biên
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx - rx, baseY);
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx + rx, baseY);
    ctx.stroke();

    // Trục chiều cao SO & bán kính OA (nét đứt)
    if (item.showAuxLines) {
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, baseY);
      ctx.lineTo(cx + rx, baseY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, baseY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      drawLabel('O', cx - 14, baseY + 14);
      drawLabel('R', cx + rx * 0.45, baseY - 5);
    }

    drawLabel('S', cx - 4, topY - 8);
    drawLabel('A', cx + rx + 6, baseY + 4);
    return;
  }

  if (item.preset === 'cylinder') {
    const topY = cy - scale * 0.78;
    const baseY = cy + scale * 0.78;

    // Đáy trên (nét liền toàn phần)
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Đáy dưới cung trước (nét liền)
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI, false);
    ctx.stroke();

    // Đáy dưới cung sau (nét đứt)
    ctx.setLineDash(item.dashedHidden ? [6, 5] : []);
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, Math.PI * 2, false);
    ctx.stroke();

    // Hai đường sinh biên
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx - rx, topY);
    ctx.lineTo(cx - rx, baseY);
    ctx.moveTo(cx + rx, topY);
    ctx.lineTo(cx + rx, baseY);
    ctx.stroke();

    if (item.showAuxLines) {
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, baseY);
      ctx.lineTo(cx + rx, baseY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, topY, 2.5, 0, Math.PI * 2);
      ctx.arc(cx, baseY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      drawLabel("O'", cx - 16, topY + 4);
      drawLabel('O', cx - 14, baseY + 14);
      drawLabel('R', cx + rx * 0.45, baseY - 5);
    }
    return;
  }

  // Mặt cầu (sphere)
  const radius = scale * 1.05;
  const eqRy = Math.max(12, radius * Math.sin(pitchRad));

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Xích đạo cung trước
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, eqRy, 0, 0, Math.PI, false);
  ctx.stroke();

  // Xích đạo cung sau (nét đứt)
  ctx.setLineDash(item.dashedHidden ? [6, 5] : []);
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, eqRy, 0, Math.PI, Math.PI * 2, false);
  ctx.stroke();

  if (item.showAuxLines) {
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * 0.72, cy - radius * 0.68);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, 2.8, 0, Math.PI * 2);
    ctx.fill();
    drawLabel('O', cx - 15, cy + 5);
    drawLabel('R', cx + radius * 0.36, cy - radius * 0.42);
  }
}

/**
 * Kết xuất hình học không gian 3D lên Canvas 2D với cơ chế tự tính cạnh khuất (nét đứt)
 * dựa trên pháp tuyến mặt phẳng (back-face visibility).
 */
export function renderSolid3DOnCanvas(ctx: CanvasRenderingContext2D, item: Ink3DSolidItem): void {
  ctx.save();

  if (item.preset === 'cone' || item.preset === 'cylinder' || item.preset === 'sphere') {
    drawCurvedSolid3D(ctx, item);
    ctx.restore();
    return;
  }

  const model = getPolyhedronModel(item.preset);
  if (!model) {
    ctx.restore();
    return;
  }

  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;
  const scale = Math.min(item.width, item.height) * 0.4;

  const rotatedMap = new Map<string, Vec3>();
  const projectedMap = new Map<
    string,
    { readonly x: number; readonly y: number; readonly z: number }
  >();

  for (const v of model.vertices) {
    const r = rotatePoint3D(v.pos, item.yaw, item.pitch);
    rotatedMap.set(v.id, r);
    projectedMap.set(v.id, projectToBox(r, cx, cy, scale));
  }

  // Xác định các mặt đang hướng về phía người nhìn (front-facing)
  const frontFaceEdgeKeys = new Set<string>();
  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  for (const face of model.faces) {
    if (face.vertices.length < 3) continue;
    const p0 = projectedMap.get(face.vertices[0]!);
    const p1 = projectedMap.get(face.vertices[1]!);
    const p2 = projectedMap.get(face.vertices[2]!);
    if (!p0 || !p1 || !p2) continue;

    // Tích có hướng 2D trên màn hình (trục Y hướng xuống) -> mặt hướng ra trước có cross < 0
    const cross = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
    if (cross < 0) {
      for (let i = 0; i < face.vertices.length; i += 1) {
        const a = face.vertices[i]!;
        const b = face.vertices[(i + 1) % face.vertices.length]!;
        frontFaceEdgeKeys.add(edgeKey(a, b));
      }
    }
  }

  ctx.strokeStyle = item.color;
  ctx.fillStyle = item.color;
  ctx.lineWidth = item.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const edge of model.edges) {
    if (edge.aux && !item.showAuxLines) continue;
    const a = projectedMap.get(edge.from);
    const b = projectedMap.get(edge.to);
    if (!a || !b) continue;

    const isVisibleByFaces =
      model.faces.length === 0 || frontFaceEdgeKeys.has(edgeKey(edge.from, edge.to));
    const shouldDash = Boolean(edge.forceDashed) || (item.dashedHidden && !isVisibleByFaces);

    ctx.setLineDash(shouldDash ? [6, 5] : []);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    if (edge.arrow) {
      ctx.setLineDash([]);
      drawArrowTip(ctx, a.x, a.y, b.x, b.y, 10);
    }
  }

  ctx.setLineDash([]);

  // Hiển thị tên đỉnh chuẩn ký hiệu sách giáo khoa Toán
  if (item.showLabels) {
    ctx.font = 'italic 600 14px "Times New Roman", Georgia, serif';
    for (const v of model.vertices) {
      if (v.aux && !item.showAuxLines) continue;
      const p = projectedMap.get(v.id);
      if (!p) continue;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (dx / len) * 14 - 4;
      const oy = (dy / len) * 14 + 5;
      ctx.fillText(v.label, p.x + ox, p.y + oy);
    }
  }

  ctx.restore();
}
