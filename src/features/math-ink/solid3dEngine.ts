import type { Ink3DSolidItem, Solid3DConstruction, Solid3DPresetKind } from './types';

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
  /** Cạnh phụ (đường cao mặc định, đường chéo đáy) */
  readonly aux?: boolean;
  /** Cạnh mũi tên (cho hệ trục Oxyz) */
  readonly arrow?: boolean;
  /** Ép nét đứt (cho đường bên trong khối không gian) */
  readonly forceDashed?: boolean;
}

export interface SolidFace {
  readonly id: string;
  readonly label: string;
  readonly vertices: readonly string[];
}

export interface Solid3DPresetMeta {
  readonly kind: Solid3DPresetKind;
  readonly name: string;
  readonly shortName: string;
  readonly defaultYaw: number;
  readonly defaultPitch: number;
}

export interface Solid3DPresetSchema {
  readonly kind: Solid3DPresetKind;
  readonly vertices: readonly SolidVertex[];
  readonly edges: readonly SolidEdge[];
  readonly faces: readonly SolidFace[];
  readonly basePlaneY: number;
  readonly supportsConstructions: boolean;
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

export function getSolidPresetSchema(kind: Solid3DPresetKind): Solid3DPresetSchema {
  if (kind === 'pyramid-tri') {
    return {
      kind,
      basePlaneY: -0.75,
      supportsConstructions: true,
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
        { id: 'face-abc', label: 'Đáy ABC', vertices: ['A', 'C', 'B'] },
        { id: 'face-sbc', label: 'Mặt SBC', vertices: ['S', 'B', 'C'] },
        { id: 'face-sca', label: 'Mặt SCA', vertices: ['S', 'C', 'A'] },
        { id: 'face-sab', label: 'Mặt SAB', vertices: ['S', 'A', 'B'] },
      ],
    };
  }

  if (kind === 'pyramid-quad') {
    return {
      kind,
      basePlaneY: -0.72,
      supportsConstructions: true,
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
        { id: 'face-abcd', label: 'Đáy ABCD', vertices: ['A', 'D', 'C', 'B'] },
        { id: 'face-sbc', label: 'Mặt SBC', vertices: ['S', 'B', 'C'] },
        { id: 'face-scd', label: 'Mặt SCD', vertices: ['S', 'C', 'D'] },
        { id: 'face-sda', label: 'Mặt SDA', vertices: ['S', 'D', 'A'] },
        { id: 'face-sab', label: 'Mặt SAB', vertices: ['S', 'A', 'B'] },
      ],
    };
  }

  if (kind === 'prism-tri') {
    return {
      kind,
      basePlaneY: -0.78,
      supportsConstructions: true,
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
        { id: 'face-abc', label: 'Đáy ABC', vertices: ['A', 'C', 'B'] },
        { id: 'face-a1b1c1', label: "Đáy A'B'C'", vertices: ['A1', 'B1', 'C1'] },
        { id: 'face-bcc1b1', label: "Mặt BCC'B'", vertices: ['B', 'C', 'C1', 'B1'] },
        { id: 'face-caa1c1', label: "Mặt CAA'C'", vertices: ['C', 'A', 'A1', 'C1'] },
        { id: 'face-abb1a1', label: "Mặt ABB'A'", vertices: ['A', 'B', 'B1', 'A1'] },
      ],
    };
  }

  if (kind === 'box') {
    return {
      kind,
      basePlaneY: -0.68,
      supportsConstructions: true,
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
        { id: 'face-abcd', label: 'Đáy ABCD', vertices: ['A', 'D', 'C', 'B'] },
        { id: 'face-top', label: "Đáy A'B'C'D'", vertices: ['A1', 'B1', 'C1', 'D1'] },
        { id: 'face-front', label: "Mặt BCC'B'", vertices: ['B', 'C', 'C1', 'B1'] },
        { id: 'face-right', label: "Mặt CDD'C'", vertices: ['C', 'D', 'D1', 'C1'] },
        { id: 'face-back', label: "Mặt DAA'D'", vertices: ['D', 'A', 'A1', 'D1'] },
        { id: 'face-left', label: "Mặt ABB'A'", vertices: ['A', 'B', 'B1', 'A1'] },
      ],
    };
  }

  if (kind === 'oxyz') {
    return {
      kind,
      basePlaneY: 0,
      supportsConstructions: false,
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

  if (kind === 'cone') {
    return {
      kind,
      basePlaneY: -0.78,
      supportsConstructions: false,
      vertices: [
        { id: 'S', label: 'S', pos: { x: 0, y: 1.05, z: 0 } },
        { id: 'O', label: 'O', pos: { x: 0, y: -0.78, z: 0 }, aux: true },
        { id: 'A', label: 'A', pos: { x: 0.92, y: -0.78, z: 0 } },
        { id: 'R', label: 'R', pos: { x: 0.45, y: -0.78, z: 0 }, aux: true },
      ],
      edges: [],
      faces: [],
    };
  }

  if (kind === 'cylinder') {
    return {
      kind,
      basePlaneY: -0.78,
      supportsConstructions: false,
      vertices: [
        { id: 'O1', label: "O'", pos: { x: 0, y: 0.78, z: 0 }, aux: true },
        { id: 'O', label: 'O', pos: { x: 0, y: -0.78, z: 0 }, aux: true },
        { id: 'R', label: 'R', pos: { x: 0.45, y: -0.78, z: 0 }, aux: true },
      ],
      edges: [],
      faces: [],
    };
  }

  return {
    kind: 'sphere',
    basePlaneY: 0,
    supportsConstructions: false,
    vertices: [
      { id: 'O', label: 'O', pos: { x: 0, y: 0, z: 0 }, aux: true },
      { id: 'R', label: 'R', pos: { x: 0.5, y: 0.5, z: 0 }, aux: true },
    ],
    edges: [],
    faces: [],
  };
}

export function resolveSolidVertexLabel(
  vertexId: string,
  defaultLabel: string,
  customLabels?: Readonly<Record<string, string>>,
): string {
  if (!customLabels) return defaultLabel;
  const custom = customLabels[vertexId];
  return custom !== undefined ? custom : defaultLabel;
}

export function rotatePoint3D(p: Vec3, yawDeg: number, pitchDeg: number): Vec3 {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;

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

export interface EvaluatedConstructionPoint {
  readonly id: string;
  readonly label: string;
  readonly pos: Vec3;
  readonly color: string;
}

/**
 * Tính tọa độ 3D chính xác cho các phần tử dựng hình phụ:
 * - Trung điểm cạnh: (A + B) / 2
 * - Trọng tâm mặt/tam giác: trung bình cộng tọa độ các đỉnh
 * - Chân đường cao hạ xuống mặt đáy (y = basePlaneY) hoặc tới điểm mục tiêu
 */
export function evaluateSolidConstructions(
  schema: Solid3DPresetSchema,
  constructions: readonly Solid3DConstruction[] | undefined,
  defaultColor: string,
): {
  readonly allPoints3D: ReadonlyMap<string, Vec3>;
  readonly constructedPoints: readonly EvaluatedConstructionPoint[];
} {
  const allPoints3D = new Map<string, Vec3>();
  for (const v of schema.vertices) {
    allPoints3D.set(v.id, v.pos);
  }

  const constructedPoints: EvaluatedConstructionPoint[] = [];
  if (!constructions || constructions.length === 0) {
    return { allPoints3D, constructedPoints };
  }

  for (const c of constructions) {
    if (c.kind === 'midpoint') {
      const a = allPoints3D.get(c.fromVertex);
      const b = allPoints3D.get(c.toVertex);
      if (!a || !b) continue;
      const pos: Vec3 = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: (a.z + b.z) / 2,
      };
      allPoints3D.set(c.id, pos);
      constructedPoints.push({ id: c.id, label: c.label, pos, color: c.color ?? defaultColor });
    } else if (c.kind === 'centroid') {
      const pts = c.vertices
        .map((vid) => allPoints3D.get(vid))
        .filter((v): v is Vec3 => Boolean(v));
      if (pts.length < 2) continue;
      const sum = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }), {
        x: 0,
        y: 0,
        z: 0,
      });
      const pos: Vec3 = {
        x: sum.x / pts.length,
        y: sum.y / pts.length,
        z: sum.z / pts.length,
      };
      allPoints3D.set(c.id, pos);
      constructedPoints.push({ id: c.id, label: c.label, pos, color: c.color ?? defaultColor });
    } else if (c.kind === 'altitude') {
      const apex = allPoints3D.get(c.apexVertex);
      if (!apex) continue;
      let footPos: Vec3;
      if (c.footTarget === 'base-plane') {
        footPos = { x: apex.x, y: schema.basePlaneY, z: apex.z };
      } else {
        const target = allPoints3D.get(c.footTarget);
        if (!target) continue;
        footPos = target;
      }
      allPoints3D.set(c.id, footPos);
      constructedPoints.push({
        id: c.id,
        label: c.footLabel,
        pos: footPos,
        color: c.color ?? defaultColor,
      });
    }
  }

  return { allPoints3D, constructedPoints };
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

  const labelOf = (id: string, fallback: string) =>
    resolveSolidVertexLabel(id, fallback, item.customLabels);

  const drawLabel = (text: string, lx: number, ly: number) => {
    if (!item.showLabels || !text.trim()) return;
    ctx.save();
    ctx.font = 'italic 600 14px "Times New Roman", Georgia, serif';
    ctx.fillStyle = item.color;
    ctx.fillText(text, lx, ly);
    ctx.restore();
  };

  if (item.preset === 'cone') {
    const topY = cy - scale * 1.05;
    const baseY = cy + scale * 0.78;

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI, false);
    ctx.stroke();

    ctx.setLineDash(item.dashedHidden ? [6, 5] : []);
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, Math.PI * 2, false);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx - rx, baseY);
    ctx.moveTo(cx, topY);
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
      // Dấu góc vuông tại tâm O
      const sq = 10;
      ctx.beginPath();
      ctx.moveTo(cx, baseY - sq);
      ctx.lineTo(cx + sq, baseY - sq);
      ctx.lineTo(cx + sq, baseY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, baseY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(labelOf('O', 'O'), cx - 14, baseY + 14);
      drawLabel(labelOf('R', 'R'), cx + rx * 0.45, baseY - 5);
    }

    drawLabel(labelOf('S', 'S'), cx - 4, topY - 8);
    drawLabel(labelOf('A', 'A'), cx + rx + 6, baseY + 4);
    return;
  }

  if (item.preset === 'cylinder') {
    const topY = cy - scale * 0.78;
    const baseY = cy + scale * 0.78;

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI, false);
    ctx.stroke();

    ctx.setLineDash(item.dashedHidden ? [6, 5] : []);
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, Math.PI * 2, false);
    ctx.stroke();

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
      drawLabel(labelOf('O1', "O'"), cx - 16, topY + 4);
      drawLabel(labelOf('O', 'O'), cx - 14, baseY + 14);
      drawLabel(labelOf('R', 'R'), cx + rx * 0.45, baseY - 5);
    }
    return;
  }

  // Mặt cầu
  const radius = scale * 1.05;
  const eqRy = Math.max(12, radius * Math.sin(pitchRad));

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, eqRy, 0, 0, Math.PI, false);
  ctx.stroke();

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
    drawLabel(labelOf('O', 'O'), cx - 15, cy + 5);
    drawLabel(labelOf('R', 'R'), cx + radius * 0.36, cy - radius * 0.42);
  }
}

/**
 * Kết xuất Hình học không gian 3D lên Canvas 2D:
 * - Tự tính cạnh khuất vẽ bằng nét đứt (back-face visibility).
 * - Hỗ trợ đổi tên đỉnh tùy ý HOẶC ẩn toàn bộ nhãn đỉnh để người dùng tự viết tay.
 * - Hỗ trợ dựng trung điểm, trọng tâm, đường cao (có ký hiệu góc vuông 3D) và đoạn nối thiết diện.
 */
export function renderSolid3DOnCanvas(ctx: CanvasRenderingContext2D, item: Ink3DSolidItem): void {
  ctx.save();

  if (item.preset === 'cone' || item.preset === 'cylinder' || item.preset === 'sphere') {
    drawCurvedSolid3D(ctx, item);
    ctx.restore();
    return;
  }

  const schema = getSolidPresetSchema(item.preset);
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;
  const scale = Math.min(item.width, item.height) * 0.4;

  const { allPoints3D, constructedPoints } = evaluateSolidConstructions(
    schema,
    item.constructions,
    item.color,
  );

  const projectedMap = new Map<
    string,
    { readonly x: number; readonly y: number; readonly z: number }
  >();
  for (const [pid, pos] of allPoints3D.entries()) {
    const rot = rotatePoint3D(pos, item.yaw, item.pitch);
    projectedMap.set(pid, projectToBox(rot, cx, cy, scale));
  }

  const frontFaceEdgeKeys = new Set<string>();
  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  for (const face of schema.faces) {
    if (face.vertices.length < 3) continue;
    const p0 = projectedMap.get(face.vertices[0]!);
    const p1 = projectedMap.get(face.vertices[1]!);
    const p2 = projectedMap.get(face.vertices[2]!);
    if (!p0 || !p1 || !p2) continue;

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

  // 1. Vẽ các cạnh gốc của khối đa diện / hệ trục
  for (const edge of schema.edges) {
    if (edge.aux && !item.showAuxLines) continue;
    const a = projectedMap.get(edge.from);
    const b = projectedMap.get(edge.to);
    if (!a || !b) continue;

    const isVisibleByFaces =
      schema.faces.length === 0 || frontFaceEdgeKeys.has(edgeKey(edge.from, edge.to));
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

  // 2. Vẽ đường cao & đoạn nối dựng thêm (constructions)
  if (item.constructions) {
    for (const c of item.constructions) {
      if (c.kind === 'altitude') {
        const apex2d = projectedMap.get(c.apexVertex);
        const foot2d = projectedMap.get(c.id);
        const apex3d = allPoints3D.get(c.apexVertex);
        const foot3d = allPoints3D.get(c.id);
        if (!apex2d || !foot2d || !apex3d || !foot3d) continue;

        ctx.save();
        ctx.strokeStyle = c.color ?? '#DC2626';
        ctx.lineWidth = Math.max(1.6, item.lineWidth * 0.9);
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(apex2d.x, apex2d.y);
        ctx.lineTo(foot2d.x, foot2d.y);
        ctx.stroke();

        // Ký hiệu góc vuông 3D chuẩn tại chân đường cao
        if (c.showRightAngle !== false) {
          const upDir3d: Vec3 = {
            x: foot3d.x + (apex3d.x - foot3d.x) * 0.14,
            y: foot3d.y + (apex3d.y - foot3d.y) * 0.14,
            z: foot3d.z + (apex3d.z - foot3d.z) * 0.14,
          };
          const horizDir3d: Vec3 = {
            x: foot3d.x + 0.18,
            y: foot3d.y,
            z: foot3d.z,
          };
          const corner3d: Vec3 = {
            x: upDir3d.x + 0.18,
            y: upDir3d.y,
            z: upDir3d.z,
          };

          const pUp = projectToBox(rotatePoint3D(upDir3d, item.yaw, item.pitch), cx, cy, scale);
          const pHoriz = projectToBox(
            rotatePoint3D(horizDir3d, item.yaw, item.pitch),
            cx,
            cy,
            scale,
          );
          const pCorner = projectToBox(
            rotatePoint3D(corner3d, item.yaw, item.pitch),
            cx,
            cy,
            scale,
          );

          ctx.setLineDash([]);
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(pUp.x, pUp.y);
          ctx.lineTo(pCorner.x, pCorner.y);
          ctx.lineTo(pHoriz.x, pHoriz.y);
          ctx.stroke();
        }
        ctx.restore();
      } else if (c.kind === 'segment') {
        const a = projectedMap.get(c.fromPoint);
        const b = projectedMap.get(c.toPoint);
        if (!a || !b) continue;
        ctx.save();
        ctx.strokeStyle = c.color ?? '#1D4ED8';
        ctx.lineWidth = Math.max(1.7, item.lineWidth);
        ctx.setLineDash(c.style === 'dashed' ? [6, 4] : []);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  ctx.setLineDash([]);

  // 3. Vẽ các điểm dựng phụ (Trung điểm, Trọng tâm, Chân đường cao)
  for (const cp of constructedPoints) {
    const p2d = projectedMap.get(cp.id);
    if (!p2d) continue;
    ctx.save();
    ctx.fillStyle = cp.color;
    ctx.beginPath();
    ctx.arc(p2d.x, p2d.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    if (item.showLabels && cp.label.trim()) {
      ctx.font = 'italic 700 13.5px "Times New Roman", Georgia, serif';
      ctx.fillText(cp.label, p2d.x + 6, p2d.y - 5);
    }
    ctx.restore();
  }

  // 4. Vẽ tên các đỉnh gốc (hỗ trợ customLabels hoặc ẩn sạch khi !item.showLabels)
  if (item.showLabels) {
    ctx.fillStyle = item.color;
    ctx.font = 'italic 600 14px "Times New Roman", Georgia, serif';
    for (const v of schema.vertices) {
      if (v.aux && !item.showAuxLines) continue;
      const label = resolveSolidVertexLabel(v.id, v.label, item.customLabels);
      if (!label.trim()) continue;
      const p = projectedMap.get(v.id);
      if (!p) continue;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (dx / len) * 14 - 4;
      const oy = (dy / len) * 14 + 5;
      ctx.fillText(label, p.x + ox, p.y + oy);
    }
  }

  ctx.restore();
}
