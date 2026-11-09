/**
 * PROCEDURAL LOTUS CANVAS ENGINE (Thuật toán đồ họa Canvas 2D thủ tục hoa sen tả thực - Hoa sen_2.html)
 * Tái tạo nguyên vẹn 100% logic toán học và mỹ thuật Canvas từ "Hoa sen_2.html" với phân tầng độ sâu quang học.
 */

export const rng = (s: number) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const mix = (a: readonly number[], b: readonly number[], t: number): number[] =>
  a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * t));

export const rgb = (c: readonly number[], a = 1): string =>
  `rgba(${c[0] ?? 0},${c[1] ?? 0},${c[2] ?? 0},${a})`;

export const CREAM: readonly [number, number, number] = [246, 250, 225];

export interface PetalData {
  readonly c: HTMLCanvasElement;
  readonly pad: number;
  readonly len: number;
  readonly w: number;
  readonly h: number;
}

export function makePetal(
  len: number,
  wid: number,
  c1: readonly [number, number, number],
  seed: number,
  c0: readonly [number, number, number] = CREAM,
): PetalData {
  const r = rng(seed);
  const q = 2.4;
  const pad = wid * 1.35;
  const w = Math.ceil(pad * 2 * q);
  const h = Math.ceil((len * 1.08 + 8) * q);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) {
    return { c, pad, len, w: w / q, h: h / q };
  }
  g.scale(q, q);
  g.translate(pad, len + 4);

  // Phom dáng hình chiếc muỗng / lòng thuyền (spoon/boat-shaped):
  // Đường cong Bezier phình rộng ở phần thân dưới (0.35 * len), uốn thon mượt và vuốt nhọn nhẹ ở chóp cánh
  const path = () => {
    g.beginPath();
    g.moveTo(0, 0);
    // Vòng cung bên phải: phình rộng ở 0.35 * len, uốn thon mượt về chóp
    g.bezierCurveTo(wid * 0.95, -len * 0.12, wid * 1.25, -len * 0.35, wid * 0.92, -len * 0.65);
    g.bezierCurveTo(wid * 0.62, -len * 0.86, wid * 0.18, -len * 0.98, 0, -len * 1.03);
    // Vòng cung bên trái đối xứng
    g.bezierCurveTo(-wid * 0.18, -len * 0.98, -wid * 0.62, -len * 0.86, -wid * 0.92, -len * 0.65);
    g.bezierCurveTo(-wid * 1.25, -len * 0.35, -wid * 0.95, -len * 0.12, 0, 0);
    g.closePath();
  };

  // Chuyển sắc 4 tầng tự nhiên theo trục dọc:
  // - Gốc cánh: Trắng ngà ánh vàng lục nhạt rgba(246, 250, 225, 1)
  // - Thân cánh dưới: Hồng phấn trong trẻo rgba(248, 195, 214, 0.95)
  // - Thân cánh trên: Hồng sen dịu rgba(235, 120, 160, 0.95)
  // - Viền và chóp cánh: Hồng sen thắm rgba(210, 60, 115, 1)
  const gr = g.createLinearGradient(0, 0, 0, -len * 1.03);
  gr.addColorStop(0, rgb(c0, 1));
  gr.addColorStop(0.32, 'rgba(248, 195, 214, 0.95)');
  gr.addColorStop(0.72, 'rgba(235, 120, 160, 0.95)');
  gr.addColorStop(1.0, rgb(c1, 1));

  path();
  g.fillStyle = gr;
  g.fill();

  g.save();
  path();
  g.clip();

  // Đổ bóng lòng máng: Dải gradient ngang tạo cảm giác cánh hoa khum lõm vào trong (mép cánh sáng viền, lòng cánh đậm sắc hơn)
  const bg = g.createLinearGradient(-wid * 1.25, 0, wid * 1.25, 0);
  bg.addColorStop(0, 'rgba(255, 255, 255, 0.35)'); // Mép cánh sáng viền
  bg.addColorStop(0.22, 'rgba(235, 120, 160, 0.05)');
  bg.addColorStop(0.5, 'rgba(185, 45, 95, 0.28)'); // Lòng cánh đậm sắc hơn (lòng máng trũng)
  bg.addColorStop(0.78, 'rgba(235, 120, 160, 0.05)');
  bg.addColorStop(1, 'rgba(255, 255, 255, 0.35)'); // Mép cánh sáng viền
  g.fillStyle = bg;
  g.fillRect(-pad, -len * 1.15, pad * 2, len * 1.3);

  // Ửng hồng rực rỡ ở chóp cánh
  const tipGrad = g.createRadialGradient(0, -len * 0.96, 2, 0, -len * 0.96, wid * 0.95);
  tipGrad.addColorStop(0, rgb(c1, 0.55));
  tipGrad.addColorStop(1, rgb(c1, 0));
  g.fillStyle = tipGrad;
  g.fillRect(-pad, -len * 1.15, pad * 2, len * 1.3);

  // Sắc vàng lục nhạt ở gốc cánh
  const baseGrad = g.createRadialGradient(0, -len * 0.02, 1, 0, -len * 0.02, len * 0.32);
  baseGrad.addColorStop(0, 'rgba(246, 250, 225, 0.9)');
  baseGrad.addColorStop(0.65, 'rgba(246, 250, 225, 0.3)');
  baseGrad.addColorStop(1, 'rgba(246, 250, 225, 0)');
  g.fillStyle = baseGrad;
  g.fillRect(-pad, -len * 1.15, pad * 2, len * 1.3);

  // Hệ gân cánh dọc: 24 đường vân mảnh chạy dọc song song từ gốc cánh, uốn lượn theo mép cong và hội tụ mềm về phía đỉnh
  const veinCount = 24;
  for (let i = 0; i <= veinCount; i++) {
    const frac = (i / veinCount) * 2 - 1; // -1 đến 1
    const aFrac = Math.abs(frac);
    g.beginPath();
    g.moveTo(frac * wid * 0.1, -len * 0.015);
    const midX = frac * wid * (1.18 - aFrac * 0.15);
    const midY = -len * 0.38;
    const endX = frac * wid * 0.12 * (1 - aFrac * 0.4);
    const endY = -len * (0.98 - aFrac * 0.06);

    g.bezierCurveTo(midX * 0.85, -len * 0.18, midX, midY, endX, endY);
    const alpha = 0.07 + (1 - aFrac) * 0.09 + r() * 0.04;
    g.strokeStyle = `rgba(195, 45, 95, ${alpha.toFixed(3)})`;
    g.lineWidth = 0.42 + (1 - aFrac) * 0.3;
    g.stroke();
  }

  g.restore();

  // Viền sáng mềm mại phản quang
  path();
  g.lineWidth = 1.4;
  g.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  g.stroke();

  // Đường viền hồng cánh sen thanh mảnh ngoài cùng
  path();
  g.lineWidth = 0.6;
  g.strokeStyle = 'rgba(190, 45, 95, 0.45)';
  g.stroke();

  // Giọt sương đọng tự nhiên
  if (r() < 0.68) {
    const x = (r() - 0.5) * wid * 0.65;
    const y = -len * (0.28 + r() * 0.45);
    const d = 2.2 + r() * 2;
    const dewGrad = g.createRadialGradient(x - d * 0.3, y - d * 0.3, 0.2, x, y, d);
    dewGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    dewGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.22)');
    dewGrad.addColorStop(1, 'rgba(140, 35, 75, 0.35)');
    g.beginPath();
    g.arc(x, y, d, 0, Math.PI * 2);
    g.fillStyle = dewGrad;
    g.fill();
  }

  return { c, pad, len, w: w / q, h: h / q };
}

export const drawPetal = (ctx: CanvasRenderingContext2D, p: PetalData) => {
  const ga = ctx.globalAlpha;
  ctx.globalAlpha = ga * 0.94;
  ctx.drawImage(p.c, -p.pad, -p.len - 4, p.w, p.h);
  ctx.globalAlpha = ga;
};

export interface LayerConfig {
  readonly n: number;
  readonly sp: number;
  readonly len: number;
  readonly wid: number;
  readonly c1: readonly [number, number, number];
  ps: PetalData[];
}

export function stamen(
  ctx: CanvasRenderingContext2D,
  a: number,
  len: number,
  t: number,
  i: number,
  front: boolean,
) {
  const aa = a + Math.sin(t * 0.6 + i) * 0.018;
  const sx = Math.sin(aa) * (front ? 7.5 : 7.0);
  const sy = front ? 0 : -2.5;
  const ex = Math.sin(aa) * len * (front ? 0.72 : 0.88);
  const ey = front ? -len * 0.42 + 1.5 : -2.5 - Math.cos(aa) * len * 0.95;

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(
    Math.sin(aa) * len * (front ? 0.38 : 0.46),
    (sy + ey) / 2 - (front ? 1 : 3),
    ex,
    ey,
  );
  // Sợi nhị vàng tươi #FEE86B
  ctx.strokeStyle = '#FEE86B';
  ctx.lineWidth = 1.15;
  ctx.stroke();

  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(aa);
  // Đầu mang hạt phấn óng ả #E5A520
  ctx.beginPath();
  ctx.ellipse(0, -2, 1.5, 3.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E5A520';
  ctx.fill();
  // Đầu hạt phấn ngà sáng
  ctx.beginPath();
  ctx.ellipse(0, -5.8, 0.85, 1.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF9C4';
  ctx.fill();
  ctx.restore();
}

export function pod(ctx: CanvasRenderingContext2D, t: number) {
  const r = rng(7);
  ctx.save();

  // 1. Vầng hào quang ấm nhẹ quanh nhị hoa
  const hg = ctx.createRadialGradient(0, -14, 4, 0, -14, 48);
  hg.addColorStop(0, 'rgba(254, 232, 107, 0.25)');
  hg.addColorStop(0.6, 'rgba(254, 232, 107, 0.08)');
  hg.addColorStop(1, 'rgba(254, 232, 107, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(-50, -42, 100, 60);

  // 2. LỚP NHỊ SAU (Back stamens): ~50 sợi mọc dày đặc quanh chân gương sen, uốn cong ôm sát lưng
  const backCount = 50;
  for (let i = 0; i < backCount; i++) {
    const frac = i / (backCount - 1) - 0.5;
    const a = frac * 2.2 + (r() - 0.5) * 0.1;
    const len = 28 + r() * 8;
    stamen(ctx, a, len, t, i, false);
  }

  // 3. THÂN NÓN GƯƠNG SEN: Hình nón cụt lùn tự nhiên (chiều cao chỉ 20px từ y = 0 đến y = -20, gắn sát đế hoa)
  // TUYỆT ĐỐI KHÔNG có ống cuống nối dài nhô lên trên
  // Màu vàng chanh ngọc bích (#DCE86A -> #B0C440)
  const coneGrad = ctx.createLinearGradient(-19, -20, 19, 0);
  coneGrad.addColorStop(0, '#8EA032');
  coneGrad.addColorStop(0.22, '#B0C440');
  coneGrad.addColorStop(0.5, '#DCE86A');
  coneGrad.addColorStop(0.78, '#B0C440');
  coneGrad.addColorStop(1, '#788828');

  ctx.beginPath();
  ctx.moveTo(-19, -20);
  ctx.bezierCurveTo(-18, -10, -11, -2, -6, 0);
  ctx.lineTo(6, 0);
  ctx.bezierCurveTo(11, -2, 18, -10, 19, -20);
  ctx.closePath();
  ctx.fillStyle = coneGrad;
  ctx.fill();

  // Đổ bóng khối 3D mềm lên thân nón
  const shadowGrad = ctx.createRadialGradient(-3, -11, 2, 0, -10, 16);
  shadowGrad.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
  shadowGrad.addColorStop(0.7, 'rgba(120, 140, 30, 0)');
  shadowGrad.addColorStop(1, 'rgba(60, 75, 18, 0.45)');
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  // 4. MẶT GƯƠNG SEN: Phối cảnh nghiêng 30° tự nhiên (ellipse rx = 19, ry = 7.2)
  const topGrad = ctx.createRadialGradient(-3, -22, 2, 0, -20, 19);
  topGrad.addColorStop(0, '#F5FA9E');
  topGrad.addColorStop(0.52, '#DCE86A');
  topGrad.addColorStop(0.88, '#B0C440');
  topGrad.addColorStop(1, '#8FA230');

  ctx.beginPath();
  ctx.ellipse(0, -20, 19, 7.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = topGrad;
  ctx.fill();

  // Viền vàng chanh ngọc bích sắc nét
  ctx.strokeStyle = 'rgba(140, 160, 40, 0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 5. 15 MẮT HẠT SEN (2 viền sắc nét) bố trí hài hòa trên mặt gương sen
  const PITS: readonly (readonly [number, number])[] = [
    [0, -20],
    [-8, -20],
    [8, -20],
    [-4.5, -17.5],
    [4.5, -17.5],
    [-4.5, -22.5],
    [4.5, -22.5],
    [-12, -19.5],
    [12, -19.5],
    [0, -17],
    [0, -23],
    [-8, -17.8],
    [8, -17.8],
    [-8, -22.2],
    [8, -22.2],
  ];

  PITS.forEach(([px, py]) => {
    // Vòng hốc hạt ngoài
    ctx.beginPath();
    ctx.ellipse(px, py, 2.9, 1.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#584814';
    ctx.fill();
    // Mầm hạt xanh non ở trong
    ctx.beginPath();
    ctx.ellipse(px + 0.2, py + 0.2, 1.9, 0.85, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#E2EC82';
    ctx.fill();
    // Chấm tâm nhỏ màu nâu
    ctx.beginPath();
    ctx.arc(px + 0.2, py + 0.2, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#3E300E';
    ctx.fill();
  });

  // 6. LỚP NHỊ TRƯỚC (Front stamens): ~32 sợi ngắn hơn uốn cong ôm sát chân trước gương sen
  const frontCount = 32;
  for (let i = 0; i < frontCount; i++) {
    const frac = i / (frontCount - 1) - 0.5;
    const a = frac * 2.6 + (r() - 0.5) * 0.12;
    const len = 15 + r() * 6;
    stamen(ctx, a, len, t, i + 60, true);
  }

  ctx.restore();
}

export function flower(ctx: CanvasRenderingContext2D, t: number, layers: readonly LayerConfig[]) {
  const open = 0.94 + 0.06 * Math.sin(t * 0.35);
  ctx.save();
  ctx.rotate(Math.sin(t * 0.3) * 0.02);

  // Đế hoa (Receptacle calyx collar)
  ctx.beginPath();
  ctx.ellipse(0, 2.5, 12, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4c782b';
  ctx.fill();

  // ===================================================================
  // TRẬT TỰ 5 LỚP CÁNH HOA HÌNH CHÉN NGỌC 3D (5-TIER Z-INDEX):
  // ===================================================================

  // Lớp 1 (Back Petals - Cánh hậu cảnh): layers[0] (5 cánh hoa vươn cao ở phía sau lưng, đỉnh cánh hơi mở nhẹ ra sau)
  const l0 = layers[0];
  if (l0) {
    for (let i = 0; i < l0.n; i++) {
      const f = l0.n > 1 ? (i / (l0.n - 1)) * 2 - 1 : 0;
      const a = f * l0.sp * open + Math.sin(t * 0.5 + i * 1.3) * 0.016;
      ctx.save();
      ctx.rotate(a);
      let scaleY = 1 - Math.abs(f) * 0.08 + Math.sin(t * 0.45 + i) * 0.01;
      if (Math.abs(f) > 0.1) {
        scaleY *= 1.05;
      }
      ctx.scale(1, scaleY);
      const petal = l0.ps[i];
      if (petal) drawPetal(ctx, petal);
      ctx.restore();
    }
  }

  // Lớp 2 (Outer Wing Petals - Cánh mở hai bên): layers[1] (4 cánh mở sang hai bên nâng đỡ phom hoa, khum cong tự nhiên)
  const l1 = layers[1];
  if (l1) {
    for (let i = 0; i < l1.n; i++) {
      const f = l1.n > 1 ? (i / (l1.n - 1)) * 2 - 1 : 0;
      const a = f * l1.sp * open + Math.sin(t * 0.48 + i * 1.1 + 1) * 0.016;
      ctx.save();
      ctx.rotate(a);
      const scaleY = 1 - Math.abs(f) * 0.1 + Math.sin(t * 0.42 + i + 1) * 0.01;
      ctx.scale(1, scaleY);
      const petal = l1.ps[i];
      if (petal) drawPetal(ctx, petal);
      ctx.restore();
    }
  }

  // Lớp 3 (Deep Core - Tâm sen chìm trong lòng hoa): Gương sen lùn 20px (#DCE86A -> #B0C440) + Nhị sen vàng tươi (#FEE86B, hạt phấn #E5A520)
  pod(ctx, t);

  // Lớp 4 (Inner Cupping Petals - Cánh khum ôm tâm): layers[2] (4 cánh kích thước vừa, ôm sát quanh đài sen tạo thành lòng chén hoa kín đáo)
  const l2 = layers[2];
  if (l2) {
    for (let i = 0; i < l2.n; i++) {
      const f = l2.n > 1 ? (i / (l2.n - 1)) * 2 - 1 : 0;
      const a = f * l2.sp * open + Math.sin(t * 0.52 + i * 1.4 + 2) * 0.016;
      ctx.save();
      ctx.rotate(a);
      const scaleY = 0.95 + Math.sin(t * 0.4 + i + 2) * 0.01;
      ctx.scale(1, scaleY);
      const petal = l2.ps[i];
      if (petal) drawPetal(ctx, petal);
      ctx.restore();
    }
  }

  // Đổ bóng tự nhiên (Self-shadowing): Chân các cánh trước đổ bóng mờ nhẹ vào lòng hoa
  {
    const shadowGrad = ctx.createRadialGradient(0, 0, 3, 0, 2, 26);
    shadowGrad.addColorStop(0, 'rgba(60, 20, 35, 0.32)');
    shadowGrad.addColorStop(0.65, 'rgba(60, 20, 35, 0.14)');
    shadowGrad.addColorStop(1, 'rgba(60, 20, 35, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 2, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lớp 5 (Foreground Front Petals - CÁNH TIỀN CẢNH PHÍA TRƯỚC - QUYẾT ĐỊNH ĐỘ TỰ NHIÊN): layers[3] (3 cánh lớn phía trước)
  // - 1 cánh chính diện hướng thẳng về phía trước, uốn cong khum lòng chảo (foreshortened via scale(1, 0.72)), che khuất 60% chân đài sen và gốc nhị hoa
  // - 2 cánh phụ chếch sang hai bên ôm đỡ lấy cánh chính
  const l3 = layers[3];
  if (l3 && l3.n >= 3) {
    // Cánh phụ trái: index 0
    const petalLeft = l3.ps[0];
    if (petalLeft) {
      ctx.save();
      ctx.translate(-7, 3);
      ctx.rotate(-0.38 * open + Math.sin(t * 0.5 + 1) * 0.015);
      ctx.scale(1, 0.74 + Math.sin(t * 0.45 + 1) * 0.015);
      drawPetal(ctx, petalLeft);
      ctx.restore();
    }

    // Cánh phụ phải: index 2
    const petalRight = l3.ps[2];
    if (petalRight) {
      ctx.save();
      ctx.translate(7, 3);
      ctx.rotate(0.38 * open + Math.sin(t * 0.5 + 2) * 0.015);
      ctx.scale(1, 0.74 + Math.sin(t * 0.45 + 2) * 0.015);
      drawPetal(ctx, petalRight);
      ctx.restore();
    }

    // Cánh chính diện: index 1 (vẽ trên cùng ở chính giữa, che khuất 60% chân đài sen)
    const petalCenter = l3.ps[1];
    if (petalCenter) {
      ctx.save();
      ctx.translate(0, 3.5);
      ctx.rotate(Math.sin(t * 0.45) * 0.012);
      ctx.scale(1, 0.72 + Math.sin(t * 0.45) * 0.012);
      drawPetal(ctx, petalCenter);
      ctx.restore();
    }
  }

  ctx.restore();
}

/* ---------- Lá sen ---------- */
export function makePad(seed: number, col: readonly [string, string, string]): HTMLCanvasElement {
  const r = rng(seed);
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  if (!g) return c;
  g.translate(128, 128);
  const R = 120;
  const n = 0.03;
  const path = () => {
    g.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * 6.2832;
      const rr = R * (1 + 0.035 * Math.sin(a * 7 + seed) + 0.02 * Math.sin(a * 13 + 1));
      if (i) {
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      } else {
        g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
    }
    g.closePath();
  };

  const gr = g.createRadialGradient(-30, -30, 10, 0, 0, R);
  gr.addColorStop(0, col[0]);
  gr.addColorStop(0.6, col[1]);
  gr.addColorStop(1, col[2]);
  path();
  g.fillStyle = gr;
  g.fill();
  g.save();
  path();
  g.clip();

  for (let i = 0; i < 28; i++) {
    const a = n + (i / 27) * (Math.PI * 2 - 2 * n);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(a) * R, Math.sin(a) * R);
    g.strokeStyle = 'rgba(205,245,190,.22)';
    g.lineWidth = 1.1;
    g.stroke();
    for (const d of [-0.07, 0.07]) {
      g.beginPath();
      g.moveTo(Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.45);
      g.lineTo(Math.cos(a + d) * R * 0.92, Math.sin(a + d) * R * 0.92);
      g.strokeStyle = 'rgba(205,245,190,.11)';
      g.lineWidth = 0.6;
      g.stroke();
    }
  }

  let bg = g.createRadialGradient(0, 0, 2, 0, 0, 22);
  bg.addColorStop(0, 'rgba(10,50,28,.55)');
  bg.addColorStop(1, 'rgba(10,50,28,0)');
  g.fillStyle = bg;
  g.fillRect(-30, -30, 60, 60);

  bg = g.createRadialGradient(-45, -50, 4, -45, -50, 85);
  bg.addColorStop(0, 'rgba(255,255,255,.17)');
  bg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = bg;
  g.fillRect(-R, -R, R * 2, R * 2);

  for (let i = 0; i < 9; i++) {
    const a = r() * 6.28;
    const d = 25 + r() * 75;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const b = 2.5 + r() * 4.5;
    bg = g.createRadialGradient(x - b * 0.3, y - b * 0.3, 0.3, x, y, b);
    bg.addColorStop(0, 'rgba(255,255,255,.8)');
    bg.addColorStop(0.6, 'rgba(200,255,225,.25)');
    bg.addColorStop(1, 'rgba(10,60,35,.4)');
    g.beginPath();
    g.arc(x, y, b, 0, Math.PI * 2);
    g.fillStyle = bg;
    g.fill();
  }
  g.restore();

  path();
  g.strokeStyle = 'rgba(8,50,28,.65)';
  g.lineWidth = 3;
  g.stroke();
  return c;
}

export interface PadDewdrop {
  readonly a: number;
  readonly k: number;
  readonly z: number;
  readonly ph: number;
}

export interface PadConfig {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly rot: number;
  readonly p: number;
  readonly s: number;
  readonly f?: number; // 1 = tiền cảnh, undefined/0 = hậu cảnh
  d?: PadDewdrop[];
}

export const PADS: readonly PadConfig[] = [
  { x: 0.08, y: 0.24, r: 40, rot: 0.5, p: 0, s: 0 },
  { x: 0.2, y: 0.12, r: 30, rot: 2.4, p: 1.7, s: 1 },
  { x: 0.66, y: 0.1, r: 32, rot: 3.3, p: 5, s: 2 },
  { x: 0.9, y: 0.2, r: 38, rot: 1.2, p: 2, s: 0 },
  { x: 0.07, y: 0.5, r: 46, rot: 4.0, p: 3, s: 2 },
  { x: 0.94, y: 0.46, r: 44, rot: 5.2, p: 4, s: 1 },
  { x: 0.14, y: 0.13, r: 62, rot: 2.0, p: 0.8, s: 1, f: 1 },
  { x: 0.36, y: 0.2, r: 42, rot: 0.2, p: 2.6, s: 0, f: 1 },
  { x: 0.66, y: 0.15, r: 34, rot: 3.9, p: 3.4, s: 2, f: 1 },
  { x: 0.88, y: 0.12, r: 58, rot: 5.8, p: 1.2, s: 0, f: 1 },
];

export function initPadsDewdrops(pads: readonly PadConfig[]) {
  const q = rng(21);
  pads.forEach((p) => {
    p.d = [];
    for (let i = 0; i < 7; i++) {
      p.d.push({
        a: q() * 6.283,
        k: 1.05 + q() * 0.5,
        z: q(),
        ph: q() * 6.28,
      });
    }
  });
}

export function padDraw(
  ctx: CanvasRenderingContext2D,
  p: PadConfig,
  t: number,
  W: number,
  H: number,
  S: number,
  wy: number,
  padSp: readonly HTMLCanvasElement[],
) {
  const yy = p.f ? wy + p.y * H : p.y * H;
  const dep = 0.55 + 0.9 * Math.min(1, yy / H);
  const PS = Math.max(S, 0.9);
  const x = p.x * W + Math.sin(t * 0.12 + p.p) * 6;
  const y = yy + Math.cos(t * 0.1 + p.p) * 4;
  const r = p.r * PS * dep;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.42);
  ctx.beginPath();
  ctx.arc(0, r * 0.14, r * 0.99, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,25,15,.38)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(220,255,235,.16)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.rotate(Math.sin(p.rot * 2.3) * 0.6 + Math.sin(t * 0.08 + p.p) * 0.04);
  const padCanvas = padSp[p.s];
  if (padCanvas) {
    ctx.drawImage(padCanvas, -r, -r, r * 2, r * 2);
  }
  ctx.restore();

  if (p.d) {
    p.d.forEach((o) => {
      const dx = x + Math.cos(o.a) * r * o.k + Math.sin(t * 0.1 + o.ph) * 3;
      const dy = y + Math.sin(o.a) * r * o.k * 0.42;
      const rr = (1.5 + o.z * 1.8) * PS * dep;
      ctx.beginPath();
      ctx.ellipse(dx, dy + rr * 0.25, rr * 1.05, rr * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,30,18,.3)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(dx, dy, rr, rr * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(143,211,110,.9)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(dx - rr * 0.2, dy - rr * 0.15, rr * 0.45, rr * 0.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(235,255,200,.55)';
      ctx.fill();
    });
  }
}

/* ---------- Nước ---------- */
export interface GlistenItem {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly p: number;
}

export function createGlistens(): GlistenItem[] {
  const gl: GlistenItem[] = [];
  const r = rng(9);
  for (let i = 0; i < 46; i++) {
    gl.push({ x: r(), y: r(), w: 6 + r() * 14, p: r() * 6.28 });
  }
  return gl;
}

export function water(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  W: number,
  H: number,
  S: number,
  gl: readonly GlistenItem[],
) {
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#22825a');
  g.addColorStop(0.5, '#17694b');
  g.addColorStop(1, '#0a4833');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  g = ctx.createRadialGradient(cx, cy - 120 * S, 10, cx, cy - 120 * S, Math.max(W, H) * 0.6);
  g.addColorStop(0, 'rgba(190,240,215,.2)');
  g.addColorStop(1, 'rgba(190,240,215,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.lineWidth = 1.2;
  for (let k = 0; k < 18; k++) {
    const y = ((k + 0.5) / 18) * H;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 14) {
      const yy =
        y + Math.sin(x * 0.015 + t * 0.28 + k * 1.7) * 5 + Math.sin(x * 0.04 - t * 0.18 + k) * 2;
      if (x) {
        ctx.lineTo(x, yy);
      } else {
        ctx.moveTo(x, yy);
      }
    }
    ctx.strokeStyle = `rgba(190,255,215,${0.05 + 0.04 * Math.sin(t * 0.4 + k)})`;
    ctx.stroke();
  }

  gl.forEach((o) => {
    const a = Math.pow(Math.max(0, Math.sin(t * 0.35 + o.p)), 6) * 0.55;
    if (a < 0.02) return;
    ctx.beginPath();
    ctx.ellipse(o.x * W + Math.sin(t * 0.1 + o.p) * 5, o.y * H, o.w * S, 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(235,255,245,${a})`;
    ctx.fill();
  });
}

export function ripples(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number,
  S: number,
) {
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.045 + i / 4) % 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, (60 + k * 270) * S, (60 + k * 270) * S * 0.28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220,255,235,${0.35 * (1 - k)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/* ---------- Nụ sen ---------- */
export function bud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number,
  S: number,
  budPetals: readonly PetalData[],
) {
  const bx = Math.max(70 * S, cx - 215 * S);
  const by = cy - 250 * S;
  const sw = Math.sin(t * 0.3) * 5 * S;

  // Thân nụ sen uốn lượn S-curve tự nhiên, thuôn nhỏ dần từ gốc lên cổ đài
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bx - 22 * S, cy);
  ctx.bezierCurveTo(
    bx - 32 * S,
    cy - (cy - by) * 0.36,
    bx - 14 * S + sw * 0.5,
    cy - (cy - by) * 0.72,
    bx + sw,
    by + 14 * S,
  );
  ctx.strokeStyle = '#3c7a38';
  ctx.lineWidth = 4.8 * S;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.strokeStyle = 'rgba(160,215,140,.45)';
  ctx.lineWidth = 1.4 * S;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(bx + sw, by + 14 * S);
  ctx.rotate(-0.1 + Math.sin(t * 0.3) * 0.025);
  ctx.scale(S, S);
  (
    [
      [-0.3, 0],
      [0.3, 0],
      [0, 1],
      [-0.12, 2],
      [0.12, 2],
    ] as const
  ).forEach(([a, k]) => {
    ctx.save();
    ctx.rotate(a);
    const bp = budPetals[k];
    if (bp) {
      drawPetal(ctx, bp);
    }
    ctx.restore();
  });
  ctx.restore();
}

/* ---------- Cá chép ---------- */
export interface FishConfig {
  readonly ax: number;
  readonly ay: number;
  readonly sp: number;
  readonly ph: number;
  readonly sz: number;
  readonly c: readonly [number, number, number];
  readonly p: readonly [number, number, number];
}

export interface FishRuntimeState {
  u: number;
  lastT: number;
  boostTime: number;
  speedMult: number;
}

export const FISH: readonly FishConfig[] = [
  { ax: 0.34, ay: 0.26, sp: 0.16, ph: 0, sz: 1.15, c: [238, 116, 40], p: [255, 244, 232] },
  { ax: 0.28, ay: 0.22, sp: 0.13, ph: 2.1, sz: 0.95, c: [250, 236, 224], p: [240, 110, 50] },
  { ax: 0.38, ay: 0.2, sp: 0.11, ph: 4.2, sz: 1.3, c: [232, 168, 48], p: [250, 236, 220] },
  // 4. Cá koi Tancho / Kohaku (thân trắng sứ, đốm đỏ son rực rỡ ở tầng trung cảnh)
  { ax: 0.31, ay: 0.17, sp: 0.14, ph: 5.6, sz: 1.08, c: [252, 250, 246], p: [225, 45, 45] },
];

export const FP = [11, 14, 17, 13] as const;

export function fishPos(f: FishConfig, u: number, W: number, H: number): [number, number] {
  return [W * (0.5 + f.ax * Math.sin(u)), H * (0.58 + f.ay * Math.sin(u * 1.3 + f.ph))];
}

export function fishRipples(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  S: number,
) {
  FISH.forEach((f, fi) => {
    const per = FP[fi] ?? 12;
    const off = fi * 3.7;
    const k = Math.floor((t - off) / per);
    const ts = k * per + off;
    const age = t - ts;
    if (age > 6) return;
    const [x, y] = fishPos(f, ts * f.sp + f.ph, W, H);
    for (let j = 0; j < 3; j++) {
      const a = age - j * 0.6;
      if (a < 0) continue;
      const kk = a / 4.5;
      if (kk > 1) continue;
      ctx.beginPath();
      ctx.ellipse(x, y, (8 + kk * 70) * S, (8 + kk * 70) * S * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(225,255,240,${0.5 * (1 - kk)})`;
      ctx.lineWidth = 1.6 * (1 - kk * 0.5);
      ctx.stroke();
    }
    if (age < 0.5) {
      ctx.beginPath();
      ctx.ellipse(x, y, (3 + age * 20) * S, (3 + age * 20) * S * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - age / 0.5)})`;
      ctx.fill();
    }
  });
}

export function fishes(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  S: number,
  fishStates?: FishRuntimeState[],
  pointerX?: number | null,
  pointerY?: number | null,
) {
  const wd = [0.5, 0.85, 1, 0.95, 0.82, 0.64, 0.48, 0.34, 0.24, 0.17, 0.13, 0.1];
  const N = 12;

  FISH.forEach((f, fi) => {
    let u: number;
    let speedMult = 1.0;

    if (fishStates) {
      let state = fishStates[fi];
      if (!state) {
        state = { u: f.ph, lastT: t, boostTime: -999, speedMult: 1.0 };
        fishStates[fi] = state;
      }

      const dt = state.lastT > 0 ? Math.min(Math.max(t - state.lastT, 0), 0.1) : 0.016;
      state.lastT = t;

      // Kiểm tra vị trí hiện tại so với con trỏ chuột (phản ứng né tránh khi d < 80 * S)
      const [currX, currY] = fishPos(f, state.u, W, H);
      if (
        pointerX !== null &&
        pointerX !== undefined &&
        pointerY !== null &&
        pointerY !== undefined
      ) {
        const dist = Math.hypot(currX - pointerX, currY - pointerY);
        if (dist < 80 * S && t - state.boostTime > 2.0) {
          state.boostTime = t;
        }
      }

      // Gia tốc bơi mượt mà hình chuông 1.0x -> 1.5x -> 1.0x trong 1.5s
      const boostAge = t - state.boostTime;
      if (boostAge >= 0 && boostAge < 1.5) {
        const progress = boostAge / 1.5;
        state.speedMult = 1.0 + 0.5 * Math.sin(progress * Math.PI);
      } else {
        state.speedMult = 1.0;
      }

      state.u += dt * f.sp * state.speedMult;
      u = state.u;
      speedMult = state.speedMult;
    } else {
      u = t * f.sp + f.ph;
    }

    const [x, y] = fishPos(f, u, W, H);
    const [x2, y2] = fishPos(f, u + 0.02, W, H);
    const per = FP[fi] ?? 12;
    const d0 = (((t - fi * 3.7) % per) + per) % per;
    const dd = Math.min(d0, per - d0);
    const nr = Math.exp(-Math.pow(dd / 1.3, 2));

    // Công thức kích thước cá BẮT BUỘC có tỉ lệ phối cảnh theo trục dọc
    const k = S * f.sz * (1 + 0.07 * nr) * (0.6 + (0.8 * y) / H);
    const seg = 7 * k;
    const pts: [number, number, number][] = [];
    let px = x;
    let py = y;
    let a = Math.atan2(y2 - y, x2 - x);

    // Khi cá giật mình quẫy đuôi (speedMult > 1), tần số quẫy đuôi tăng nhanh tương ứng
    const swimFreq = 3.5 * speedMult;
    for (let i = 0; i < N; i++) {
      pts.push([px, py, a]);
      px -= Math.cos(a) * seg;
      py -= Math.sin(a) * seg;
      a += Math.sin(t * swimFreq - i * 0.6 + fi * 2) * 0.16 * (0.3 + i / N);
    }

    const h = pts[0];
    const e = pts[N - 1];
    const q = pts[2];
    if (!h || !e || !q) return;

    ctx.save();
    ctx.globalAlpha = 0.88 + 0.12 * nr;
    ctx.lineJoin = 'round';

    const ca = Math.cos(e[2]);
    const sa = Math.sin(e[2]);
    const wv = Math.sin(t * 3.5 - N * 0.6 + fi * 2) * 4 * k;
    const bx = e[0] - ca * 18 * k;
    const by = e[1] - sa * 18 * k;
    const nx = -sa;
    const ny = ca;

    // Vây đuôi
    ctx.beginPath();
    ctx.moveTo(e[0], e[1]);
    ctx.quadraticCurveTo(
      e[0] - ca * 9 * k + nx * 8 * k,
      e[1] - sa * 9 * k + ny * 8 * k,
      bx + nx * (11 * k + wv),
      by + ny * (11 * k + wv),
    );
    ctx.lineTo(e[0] - ca * 11 * k + nx * wv * 0.5, e[1] - sa * 11 * k + ny * wv * 0.5);
    ctx.lineTo(bx - nx * (11 * k - wv), by - ny * (11 * k - wv));
    ctx.quadraticCurveTo(
      e[0] - ca * 9 * k - nx * 8 * k,
      e[1] - sa * 9 * k - ny * 8 * k,
      e[0],
      e[1],
    );
    ctx.fillStyle = rgb(f.c, 0.6);
    ctx.fill();

    // Vây ức
    const qn: [number, number] = [-Math.sin(q[2]), Math.cos(q[2])];
    const qw = (wd[2] ?? 1) * 6.5 * k;
    for (const s of [-1, 1]) {
      const sx = q[0] + qn[0] * qw * s;
      const sy = q[1] + qn[1] * qw * s;
      const fw = Math.sin(t * 2.2 + s) * 2 * k;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        sx + qn[0] * s * (9 * k + fw),
        sy + qn[1] * s * (9 * k + fw),
        sx - Math.cos(q[2]) * 9 * k + qn[0] * s * 5 * k,
        sy - Math.sin(q[2]) * 9 * k + qn[0] * s * 5 * k,
      );
      ctx.closePath();
      ctx.fillStyle = rgb(f.c, 0.5);
      ctx.fill();
    }

    // Thân cá chép
    const L: [number, number][] = [];
    const R: [number, number][] = [];
    pts.forEach((p, i) => {
      const w = (wd[i] ?? 0.5) * 6.5 * k;
      const n: [number, number] = [-Math.sin(p[2]), Math.cos(p[2])];
      L.push([p[0] + n[0] * w, p[1] + n[1] * w]);
      R.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    });

    ctx.beginPath();
    ctx.moveTo(h[0] + Math.cos(h[2]) * seg * 0.7, h[1] + Math.sin(h[2]) * seg * 0.7);
    L.forEach((p) => ctx.lineTo(p[0], p[1]));
    for (let i = N - 1; i >= 0; i--) {
      const rPoint = R[i];
      if (rPoint) ctx.lineTo(rPoint[0], rPoint[1]);
    }
    ctx.closePath();
    ctx.fillStyle = rgb(f.c);
    ctx.fill();

    // Đốm hoa văn cam/trắng
    [2, 5, 8].forEach((i, j) => {
      const p = pts[i];
      if (!p) return;
      ctx.beginPath();
      ctx.ellipse(
        p[0] + (j - 1) * k,
        p[1] + (1 - j) * k,
        seg * (j === 1 ? 1.1 : 0.8),
        (wd[i] ?? 0.5) * 4.6 * k,
        p[2],
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = rgb(j === 1 ? f.p : mix(f.p, f.c, 0.2), 0.9);
      ctx.fill();
    });

    // Đường sống lưng phát sáng
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 1.6 * k;
    ctx.stroke();

    // Mắt cá
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        h[0] + Math.cos(h[2]) * seg * 0.15 - Math.sin(h[2]) * 3.2 * k * s,
        h[1] + Math.sin(h[2]) * seg * 0.15 + Math.cos(h[2]) * 3.2 * k * s,
        1.2 * k,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
    }
    ctx.restore();
  });
}

/* ---------- Bầy cá nhỏ (School of Minnows) ---------- */
export function drawMinnowSchool(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  S: number,
  pointerX?: number | null,
  pointerY?: number | null,
) {
  const numMinnows = 5;
  const baseSpeed = 0.25;
  const cx = W * 0.44;
  const cy = H * 0.58;
  const radiusX = 135 * S;
  const radiusY = 56 * S;

  ctx.save();
  ctx.lineJoin = 'round';

  for (let i = 0; i < numMinnows; i++) {
    const delay = i * 0.24;
    const mt = t * baseSpeed - delay;
    const lateralOff = Math.sin(mt * 2.6 + i * 1.5) * 5.5 * S;

    let x = cx + Math.cos(mt) * radiusX + Math.sin(mt * 2) * 22 * S + lateralOff;
    let y = cy + Math.sin(mt * 1.2) * radiusY + Math.cos(mt * 0.7) * 10 * S;

    const nxtMt = mt + 0.04;
    const nxtX = cx + Math.cos(nxtMt) * radiusX + Math.sin(nxtMt * 2) * 22 * S + lateralOff;
    const nxtY = cy + Math.sin(nxtMt * 1.2) * radiusY + Math.cos(nxtMt * 0.7) * 10 * S;
    let heading = Math.atan2(nxtY - y, nxtX - x);

    // Phản ứng né tránh khi con trỏ chuột đến gần bầy cá con (< 75 * S)
    if (
      pointerX !== null &&
      pointerX !== undefined &&
      pointerY !== null &&
      pointerY !== undefined
    ) {
      const dist = Math.hypot(x - pointerX, y - pointerY);
      if (dist < 75 * S) {
        const scatterPush = (1 - dist / (75 * S)) * 26 * S;
        const pushAngle = Math.atan2(y - pointerY, x - pointerX);
        x += Math.cos(pushAngle) * scatterPush;
        y += Math.sin(pushAngle) * scatterPush;
        heading = pushAngle;
      }
    }

    // Tỉ lệ phối cảnh theo trục dọc (cá bơi xa phía trên nhỏ hơn cá bơi gần phía dưới)
    const perspective = 0.6 + (0.75 * Math.min(Math.max(y, 0), H)) / H;
    const minnowScale = S * 0.35 * perspective;
    const len = 38 * minnowScale;
    const bodyW = 8 * minnowScale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    const tailWave = Math.sin(t * 8.5 - i * 0.8) * 0.25;

    const bodyGrad = ctx.createLinearGradient(len * 0.5, 0, -len * 0.5, 0);
    bodyGrad.addColorStop(0, 'rgba(240, 252, 245, 0.85)');
    bodyGrad.addColorStop(0.4, 'rgba(120, 180, 140, 0.75)');
    bodyGrad.addColorStop(0.7, 'rgba(60, 110, 80, 0.8)');
    bodyGrad.addColorStop(1, 'rgba(180, 220, 195, 0.7)');

    ctx.beginPath();
    ctx.moveTo(len * 0.5, 0);
    ctx.bezierCurveTo(
      len * 0.25,
      bodyW * 0.9,
      -len * 0.2,
      bodyW * 0.7,
      -len * 0.5,
      tailWave * 4 * S,
    );
    ctx.bezierCurveTo(-len * 0.2, -bodyW * 0.7, len * 0.25, -bodyW * 0.9, len * 0.5, 0);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Sống lưng bạc phát sáng nhẹ
    ctx.beginPath();
    ctx.moveTo(len * 0.45, 0);
    ctx.lineTo(-len * 0.45, tailWave * 3 * S);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.8 * S;
    ctx.stroke();

    // Vây ngực mini
    ctx.beginPath();
    ctx.ellipse(len * 0.15, bodyW * 0.8, 5 * minnowScale, 2 * minnowScale, 0.6, 0, Math.PI * 2);
    ctx.ellipse(len * 0.15, -bodyW * 0.8, 5 * minnowScale, 2 * minnowScale, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 250, 235, 0.55)';
    ctx.fill();

    // Vây đuôi hình quạt uốn lượn nhịp nhàng
    ctx.save();
    ctx.translate(-len * 0.5, tailWave * 4 * S);
    ctx.rotate(tailWave * 1.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-11 * minnowScale, 6 * minnowScale);
    ctx.quadraticCurveTo(-6 * minnowScale, 0, -11 * minnowScale, -6 * minnowScale);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 240, 220, 0.65)';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  ctx.restore();
}

/* ---------- Chú ếch ngồi thiền trên lá sen (Meditative Frog) ---------- */
export function drawFrog(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  S: number,
  wy: number,
  pointerX?: number | null,
  pointerY?: number | null,
) {
  // Neo trên phiến lá sen tiền cảnh phía trước bên trái (PADS[6])
  const p = PADS[6];
  if (!p) return;
  const yy = wy + (p.y ?? 0.13) * H;
  const padX = (p.x ?? 0.14) * W + Math.sin(t * 0.12 + p.p) * 6;
  const padY = yy + Math.cos(t * 0.1 + p.p) * 4;

  const frogX = padX + 5 * S;
  const frogY = padY - 6 * S;

  let distToCursor = 9999;
  if (pointerX !== null && pointerX !== undefined && pointerY !== null && pointerY !== undefined) {
    distToCursor = Math.hypot(frogX - pointerX, frogY - pointerY);
  }
  const isCursorNear = distToCursor < 45;
  const alertFactor = isCursorNear ? Math.pow(1 - distToCursor / 45, 1.5) : 0;
  const alertHop = -alertFactor * 5 * S;

  // Nhịp thở họng/bụng phập phồng nhẹ nhàng: 1 + 0.05 * Math.sin(t * 2.8)
  const breath = 1 + 0.05 * Math.sin(t * 2.8);

  // Chu kỳ chớp mắt ngẫu nhiên sau mỗi 4-6s
  const blinkCycle = (t % 5.0) / 0.16;
  const isBlinking = blinkCycle < 1.0 || (isCursorNear && distToCursor < 25 && t % 1.1 < 0.15);
  const blinkAmount = isBlinking ? (blinkCycle < 1.0 ? Math.sin(blinkCycle * Math.PI) : 1) : 0;

  const fs = 1.35 * S;

  ctx.save();
  ctx.translate(frogX, frogY + alertHop);
  // Dáng ngồi hướng mắt nhìn về đóa hoa sen trung tâm (bên phải)
  ctx.scale(1, 1);

  // 1. Đổ bóng mềm xuống mặt phiến lá sen nơi nó ngồi
  ctx.save();
  ctx.scale(1, 0.42);
  const shadowGrad = ctx.createRadialGradient(0, 0, 2 * fs, 0, 0, 17 * fs);
  shadowGrad.addColorStop(0, 'rgba(0, 25, 12, 0.42)');
  shadowGrad.addColorStop(0.7, 'rgba(0, 25, 12, 0.16)');
  shadowGrad.addColorStop(1, 'rgba(0, 25, 12, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 9 * fs, 17 * fs, 10 * fs, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Chân sau xếp đùi tự nhiên (Folded hind legs)
  // Đùi trái (phía xa):
  ctx.beginPath();
  ctx.ellipse(-7.5 * fs, 3.5 * fs, 8.5 * fs, 5 * fs, -0.32, 0, Math.PI * 2);
  ctx.fillStyle = '#2E6E42';
  ctx.fill();

  // Đùi phải (phía gần, nổi khối):
  ctx.beginPath();
  ctx.ellipse(6 * fs, 4 * fs, 9.5 * fs, 5.5 * fs, 0.28, 0, Math.PI * 2);
  const thighGrad = ctx.createLinearGradient(0, -2 * fs, 14 * fs, 8 * fs);
  thighGrad.addColorStop(0, '#4AA366');
  thighGrad.addColorStop(1, '#2E6E42');
  ctx.fillStyle = thighGrad;
  ctx.fill();

  // Bàn chân sau (Webbed hind feet):
  ctx.beginPath();
  ctx.ellipse(-10 * fs, 7 * fs, 4 * fs, 2 * fs, -0.2, 0, Math.PI * 2);
  ctx.ellipse(10 * fs, 7.5 * fs, 4.5 * fs, 2.2 * fs, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#357C4B';
  ctx.fill();

  // 3. Thân màu xanh ngọc bích hữu cơ #3D8B55 chuyển dần sang bụng trắng kem #FAF4E1
  ctx.beginPath();
  ctx.moveTo(-6.5 * fs, 5 * fs);
  ctx.bezierCurveTo(-10.5 * fs, 0, -7.5 * fs, -9.5 * fs, 0, -10.5 * fs);
  ctx.bezierCurveTo(7.5 * fs, -9.5 * fs, 9.5 * fs, -2 * fs, 6.5 * fs, 5 * fs);
  ctx.bezierCurveTo(3.5 * fs, 7.5 * fs, -3.5 * fs, 7.5 * fs, -6.5 * fs, 5 * fs);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(0, -10.5 * fs, 3.5 * fs, 6.5 * fs);
  bodyGrad.addColorStop(0, '#4AA366');
  bodyGrad.addColorStop(0.3, '#3D8B55');
  bodyGrad.addColorStop(0.7, '#8FC68A');
  bodyGrad.addColorStop(1, '#FAF4E1');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Đốm lưng vi mô (Micro dorsal spots)
  const spots = [
    [-3 * fs, -6 * fs, 1.2 * fs],
    [-1 * fs, -3 * fs, 1.3 * fs],
    [-4 * fs, -1 * fs, 1.1 * fs],
    [1.5 * fs, -5 * fs, 1.2 * fs],
    [3 * fs, -2 * fs, 1.2 * fs],
  ];
  ctx.fillStyle = '#265C38';
  spots.forEach(([sx, sy, sr]) => {
    if (sx === undefined || sy === undefined || sr === undefined) return;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sr, sr * 0.7, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Nhịp thở họng/bụng phập phồng nhẹ nhàng: 1 + 0.05 * Math.sin(t * 2.8)
  ctx.beginPath();
  ctx.ellipse(3 * fs, 1 * fs, 4 * fs * breath, 4.8 * fs * breath, 0.2, 0, Math.PI * 2);
  const throatGrad = ctx.createRadialGradient(3 * fs, 1 * fs, 0, 3 * fs, 1 * fs, 4.5 * fs);
  throatGrad.addColorStop(0, 'rgba(250, 244, 225, 0.85)');
  throatGrad.addColorStop(0.75, 'rgba(250, 244, 225, 0.3)');
  throatGrad.addColorStop(1, 'rgba(250, 244, 225, 0)');
  ctx.fillStyle = throatGrad;
  ctx.fill();

  // 5. Chân trước chống nhẹ
  ctx.beginPath();
  ctx.moveTo(-3 * fs, 2 * fs);
  ctx.bezierCurveTo(-4 * fs, 5 * fs, -4.5 * fs, 7 * fs, -5 * fs, 8 * fs);
  ctx.moveTo(2 * fs, 2 * fs);
  ctx.bezierCurveTo(2.5 * fs, 5 * fs, 3 * fs, 7 * fs, 4 * fs, 8 * fs);
  ctx.strokeStyle = '#357C4B';
  ctx.lineWidth = 1.8 * S;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Bàn chân trước (tiny toes)
  ctx.beginPath();
  ctx.arc(-5 * fs, 8 * fs, 1.2 * S, 0, Math.PI * 2);
  ctx.arc(4 * fs, 8 * fs, 1.2 * S, 0, Math.PI * 2);
  ctx.fillStyle = '#FAF4E1';
  ctx.fill();

  // 6. Đôi mắt lồi tròn với viền vàng kim #E5B84A và con ngươi đen nhánh
  // Hốc mắt trái:
  ctx.beginPath();
  ctx.arc(-3.5 * fs, -10.5 * fs, 2.6 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#3D8B55';
  ctx.fill();

  // Hốc mắt phải:
  ctx.beginPath();
  ctx.arc(3.5 * fs, -10.5 * fs, 3.2 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#4AA366';
  ctx.fill();

  // Tròng mắt vàng kim #E5B84A
  ctx.beginPath();
  ctx.arc(-3.5 * fs, -10.5 * fs, 2.1 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#E5B84A';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(3.5 * fs, -10.5 * fs, 2.6 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#E5B84A';
  ctx.fill();

  // Con ngươi đen nhánh (thu hẹp khi chớp mắt)
  ctx.beginPath();
  ctx.ellipse(-3.5 * fs, -10.5 * fs, 1.3 * fs, 0.7 * fs * (1 - blinkAmount), 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(3.8 * fs, -10.5 * fs, 1.6 * fs, 0.85 * fs * (1 - blinkAmount), 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // Đốm sáng phản chiếu trong mắt
  if (blinkAmount < 0.5) {
    ctx.beginPath();
    ctx.arc(4.4 * fs, -11.4 * fs, 0.8 * S, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  // Mí mắt khép lại khi chớp mắt
  if (blinkAmount > 0.05) {
    ctx.beginPath();
    ctx.arc(3.5 * fs, -10.5 * fs - (1 - blinkAmount) * 2 * fs, 2.7 * fs, 0, Math.PI);
    ctx.fillStyle = '#3D8B55';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-3.5 * fs, -10.5 * fs - (1 - blinkAmount) * 1.8 * fs, 2.2 * fs, 0, Math.PI);
    ctx.fillStyle = '#357C4B';
    ctx.fill();
  }

  // Khóe miệng thư thái
  ctx.beginPath();
  ctx.moveTo(-1 * fs, -6.5 * fs);
  ctx.bezierCurveTo(2 * fs, -6 * fs, 5 * fs, -6.8 * fs, 7 * fs, -7.5 * fs);
  ctx.strokeStyle = 'rgba(30, 80, 45, 0.65)';
  ctx.lineWidth = 0.9 * S;
  ctx.stroke();

  ctx.restore();
}

/* ---------- Bầy đom đóm phát sáng bay lơ lửng (Fireflies) ---------- */
export interface Firefly {
  readonly baseXRatio: number;
  readonly baseYRatio: number;
  readonly rangeX: number;
  readonly rangeY: number;
  readonly speedX: number;
  readonly speedY: number;
  readonly pulseSpeed: number;
  readonly phase: number;
  readonly size: number;
  readonly haloRadius: number;
}

export function createFireflies(): Firefly[] {
  const r = rng(42);
  const list: Firefly[] = [];
  for (let i = 0; i < 16; i++) {
    list.push({
      baseXRatio: 0.15 + r() * 0.7,
      baseYRatio: 0.24 + r() * 0.5,
      rangeX: 30 + r() * 40,
      rangeY: 20 + r() * 30,
      speedX: 0.25 + r() * 0.35,
      speedY: 0.2 + r() * 0.4,
      pulseSpeed: 1.4 + r() * 1.5,
      phase: r() * Math.PI * 2,
      size: 1.5 + r() * 1.0,
      haloRadius: 8 + r() * 6,
    });
  }
  return list;
}

export function drawFireflies(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  S: number,
  wy: number,
  fireflies: readonly Firefly[],
) {
  ctx.save();
  fireflies.forEach((f) => {
    const x = f.baseXRatio * W + Math.sin(t * f.speedX + f.phase) * f.rangeX * S;
    const y = f.baseYRatio * H + Math.cos(t * f.speedY + f.phase) * f.rangeY * S;
    const alpha = Math.pow(Math.max(0, Math.sin(t * f.pulseSpeed + f.phase)), 4);
    if (alpha <= 0.015) return;

    const haloR = f.haloRadius * S;
    const coreR = f.size * S;

    // 1. Quầng hào quang lan tỏa 8px - 14px với sắc rgba(226, 248, 107, alpha * 0.35) mờ dần về 0
    const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, haloR);
    haloGrad.addColorStop(0, `rgba(226, 248, 107, ${alpha * 0.35})`);
    haloGrad.addColorStop(0.4, `rgba(226, 248, 107, ${alpha * 0.12})`);
    haloGrad.addColorStop(1, 'rgba(226, 248, 107, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(x, y, haloR, 0, Math.PI * 2);
    ctx.fill();

    // 2. Đốm tâm: Hạt sáng tròn đường kính 1.5px - 2.5px màu vàng chanh ánh lục #E2F86B
    ctx.beginPath();
    ctx.arc(x, y, coreR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(226, 248, 107, ${alpha * 0.95})`;
    ctx.fill();

    // 3. Đốm phản xạ mờ dưới mặt nước (Water reflection)
    if (y < wy + 80 * S) {
      const mirrorY = wy + (wy - y) * 0.35 + 18 * S;
      const refAlpha = alpha * 0.18;
      const refGrad = ctx.createRadialGradient(x, mirrorY, 0, x, mirrorY, haloR * 0.85);
      refGrad.addColorStop(0, `rgba(226, 248, 107, ${refAlpha})`);
      refGrad.addColorStop(1, 'rgba(226, 248, 107, 0)');
      ctx.fillStyle = refGrad;
      ctx.beginPath();
      ctx.ellipse(x, mirrorY, haloR * 0.85, haloR * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

/* ---------- Chuồn chuồn ---------- */
export function wing(
  ctx: CanvasRenderingContext2D,
  len: number,
  wid: number,
  rot: number,
  flap: number,
) {
  ctx.save();
  ctx.rotate(rot + flap);
  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, 'rgba(235,250,255,.55)');
  g.addColorStop(1, 'rgba(200,230,245,.18)');
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(len * 0.3, -wid, len * 0.8, -wid * 0.9, len, 0);
  ctx.bezierCurveTo(len * 0.8, wid * 0.9, len * 0.3, wid * 0.8, 0, 0);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,140,165,.55)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len * 0.95, 0);
  for (let i = 1; i < 7; i++) {
    const x = (len * i) / 7;
    const m = Math.sin((i / 7) * 3.1);
    ctx.moveTo(x, 0);
    ctx.lineTo(x + len * 0.03, -wid * 0.7 * m);
    ctx.moveTo(x, 0);
    ctx.lineTo(x + len * 0.03, wid * 0.6 * m);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(60,60,60,.7)';
  ctx.fillRect(len * 0.82, -1.1, len * 0.1, 2.2);
  ctx.restore();
}

export function drawDF(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  k: number,
  t: number,
  shadow: boolean,
  amp: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(h + Math.PI / 2);
  ctx.scale(k, k);
  const fl = Math.sin(t * 38) * 0.2 * amp;

  if (shadow) {
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#02150d';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(s * 20, -2, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 19, 4, 19, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillRect(-1.2, 0, 2.4, 36);
    ctx.restore();
    return;
  }

  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s, 1);
    ctx.save();
    ctx.translate(0, 3);
    wing(ctx, 34, 11, 0.12, -fl);
    ctx.restore();
    ctx.save();
    ctx.translate(0, -2);
    wing(ctx, 36, 9, -0.22, fl);
    ctx.restore();
    ctx.restore();
  }

  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(0, 5 + i * 3.3, 2.3 - i * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? '#1f5f8b' : '#3b8fc4';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.ellipse(0, 0, 3.8, 6.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2f6f5a';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-1, -1.5, 1.2, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -8.5, 3.4, 0, Math.PI * 2);
  ctx.fillStyle = '#2f8f6a';
  ctx.fill();

  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * 3, -9.5, 2.9, 0, Math.PI * 2);
    ctx.fillStyle = '#3aa0a8';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 3.4 - s * 0.6, -10.4, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fill();
  }
  ctx.restore();
}

export function dragonfly(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  W: number,
  H: number,
  S: number,
  sh: boolean,
) {
  const P = (u: number): [number, number] => [
    cx + Math.sin(u * 0.37) * W * 0.3 + Math.sin(u * 0.9) * 30 * S,
    cy - 140 * S + Math.sin(u * 0.29 + 1) * H * 0.16 + Math.sin(u * 1.3) * 14 * S,
  ];
  const u = t * 0.55;
  const [fx, fy] = P(u);
  const [x2, y2] = P(u + 0.05);
  const hf = Math.atan2(y2 - fy, x2 - fx);
  const k = S * 0.95;
  const c = t % 44;
  const sm = (v: number) => v * v * (3 - 2 * v);
  const lw =
    c < 24 ? 0 : c < 30 ? sm((c - 24) / 6) : c < 37 ? 1 : c < 42 ? 1 - sm((c - 37) / 5) : 0;
  let dh = -2.4 - hf;
  dh = Math.atan2(Math.sin(dh), Math.cos(dh));
  const h = hf + dh * lw;
  const x = fx + (cx - fx) * lw;
  const y = fy + (cy - 72 * S - fy) * lw;
  const hv = Math.sin(t * 5) * 1.2 * S * (1 - lw);

  if (sh) {
    drawDF(ctx, x + 40 * S * (1 - lw * 0.7), y + 75 * S * (1 - lw * 0.55), h, k * 0.9, t, true, 1);
  } else {
    drawDF(ctx, x, y + hv, h, k, t, false, 1 - lw * 0.93);
  }
}

/* ---------- Cuống sen và lá đứng ---------- */
export function stem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  wy: number,
  t: number,
  S: number,
) {
  const sw = Math.sin(t * 0.28) * 3 * S;
  // Điểm điều khiển đường cong chữ S tự nhiên (Organic S-Curve) do sức nặng của bông hoa
  const P0: readonly [number, number] = [cx, cy + 2 * S];
  const P1: readonly [number, number] = [cx + (13 + sw) * S, cy + (wy - cy) * 0.32];
  const P2: readonly [number, number] = [cx - (9 - sw * 0.5) * S, cy + (wy - cy) * 0.68];
  const P3: readonly [number, number] = [cx - 2 * S, wy + 4 * S];

  const N = 24;
  const leftPts: [number, number][] = [];
  const rightPts: [number, number][] = [];
  const centerPts: [number, number][] = [];

  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const m = 1 - u;
    // Điểm nội suy Cubic Bézier
    const bx =
      m * m * m * P0[0] + 3 * m * m * u * P1[0] + 3 * m * u * u * P2[0] + u * u * u * P3[0];
    const by =
      m * m * m * P0[1] + 3 * m * m * u * P1[1] + 3 * m * u * u * P2[1] + u * u * u * P3[1];
    centerPts.push([bx, by]);

    // Tiếp tuyến và véc-tơ pháp tuyến
    const tx =
      3 * m * m * (P1[0] - P0[0]) + 6 * m * u * (P2[0] - P1[0]) + 3 * u * u * (P3[0] - P2[0]);
    const ty =
      3 * m * m * (P1[1] - P0[1]) + 6 * m * u * (P2[1] - P1[1]) + 3 * u * u * (P3[1] - P2[1]);
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;

    // Bán kính thuôn nhỏ dần từ gốc cuống (5.4 * S) lên đỉnh cuống (3.4 * S)
    const r = (3.4 + 2.0 * u) * S;
    leftPts.push([bx + nx * r, by + ny * r]);
    rightPts.push([bx - nx * r, by - ny * r]);
  }

  ctx.save();
  // Tô dải thân sen chuyển màu ánh sáng tự nhiên
  const g = ctx.createLinearGradient(cx - 10 * S, 0, cx + 10 * S, 0);
  g.addColorStop(0, '#27602f');
  g.addColorStop(0.42, '#78b867');
  g.addColorStop(0.72, '#4a873e');
  g.addColorStop(1, '#245a2c');

  ctx.beginPath();
  const firstLeft = leftPts[0];
  if (firstLeft) {
    ctx.moveTo(firstLeft[0], firstLeft[1]);
  }
  for (let i = 1; i < leftPts.length; i++) {
    const p = leftPts[i];
    if (p) ctx.lineTo(p[0], p[1]);
  }
  for (let i = rightPts.length - 1; i >= 0; i--) {
    const p = rightPts[i];
    if (p) ctx.lineTo(p[0], p[1]);
  }
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  ctx.strokeStyle = 'rgba(20, 60, 30, 0.45)';
  ctx.lineWidth = 0.8 * S;
  ctx.stroke();

  // Đốm gai sần li ti ngẫu nhiên (bán kính 0.6px - 1.0px) màu xanh rêu sẫm #1f4824 và nâu nhạt #4a5228
  const rPrickle = rng(101);
  const prickleCount = 46;
  for (let i = 0; i < prickleCount; i++) {
    const u = 0.04 + rPrickle() * 0.92;
    const idx = Math.min(Math.floor(u * N), N - 1);
    const cp = centerPts[idx];
    if (!cp) continue;
    const m = 1 - u;
    const tx =
      3 * m * m * (P1[0] - P0[0]) + 6 * m * u * (P2[0] - P1[0]) + 3 * u * u * (P3[0] - P2[0]);
    const ty =
      3 * m * m * (P1[1] - P0[1]) + 6 * m * u * (P2[1] - P1[1]) + 3 * u * u * (P3[1] - P2[1]);
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    const r = (3.2 + 2.0 * u) * S;
    const latOffset = (rPrickle() * 2 - 1) * 0.78 * r;
    const x = cp[0] + nx * latOffset;
    const y = cp[1] + ny * latOffset;

    const rad = (0.6 + rPrickle() * 0.4) * S;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#1f4824' : '#4a5228';
    ctx.fill();
  }

  // Bóng đổ mặt nước tại gốc cuống
  ctx.beginPath();
  ctx.ellipse(P3[0], wy + 2 * S, 14 * S, 4.8 * S, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,30,20,.32)';
  ctx.fill();

  for (let j = 0; j < 2; j++) {
    ctx.beginPath();
    ctx.ellipse(
      P3[0],
      wy + 2 * S,
      (12 + j * 7 + Math.sin(t * 0.6 + j) * 1.5) * S,
      (12 + j * 7) * S * 0.3,
      0,
      0,
      Math.PI * 2,
    );
    ctx.strokeStyle = `rgba(225,255,240,${0.38 - j * 0.15})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Khúc ngập dưới nước cong nhẹ tiếp nối
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.moveTo(P3[0], wy + 2 * S);
  ctx.quadraticCurveTo(P3[0] + 3 * S, wy + 22 * S, P3[0] + 5 * S, wy + 46 * S);
  ctx.strokeStyle = '#2f6a36';
  ctx.lineWidth = 8.5 * S;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

export function standLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  wy: number,
  ly: number,
  r: number,
  t: number,
  S: number,
) {
  const sw = Math.sin(t * 0.28 + 2) * 4 * S;
  const lx = x + sw;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 8 * S, wy + 3 * S);
  ctx.quadraticCurveTo(x - 14 * S + sw * 0.5, (wy + ly) / 2, lx, ly + r * 0.45);
  ctx.strokeStyle = '#2f6e35';
  ctx.lineWidth = 4.5 * S;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(165,220,145,.45)';
  ctx.lineWidth = 1.3 * S;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(x - 8 * S, wy + 3 * S, 12 * S, 3.6 * S, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(225,255,240,.35)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.translate(lx, ly);
  ctx.rotate(Math.sin(t * 0.25 + 1) * 0.03);
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.quadraticCurveTo(0, r * 0.95, r, 0);
  ctx.fillStyle = '#1b5a31';
  ctx.fill();

  const g = ctx.createRadialGradient(-r * 0.25, -r * 0.1, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#62b977');
  g.addColorStop(0.7, '#2f8548');
  g.addColorStop(1, '#1d5c33');
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(8,50,28,.6)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(205,245,190,.24)';
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 6.283;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.36);
    ctx.stroke();
  }

  // 4 giọt sương mai hình cầu nổi 3D đọng trên phiến lá
  for (let j = 0; j < 4; j++) {
    const ph = t * 0.12 + j * 1.7;
    const bx = Math.sin(ph) * r * 0.4;
    const by = Math.cos(ph * 1.3 + j) * r * 0.1;
    const b = r * (0.03 + 0.012 * j);
    ctx.beginPath();
    ctx.ellipse(bx + b * 0.4, by + b * 0.5, b * 1.1, b * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5,40,25,.35)';
    ctx.fill();
    const bg = ctx.createRadialGradient(bx - b * 0.3, by - b * 0.3, 0.2, bx, by, b);
    bg.addColorStop(0, 'rgba(255,255,255,.9)');
    bg.addColorStop(0.5, 'rgba(190,245,215,.3)');
    bg.addColorStop(1, 'rgba(20,80,50,.55)');
    ctx.beginPath();
    ctx.arc(bx, by, b, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
  }

  ctx.restore();
}

export interface InteractiveRipple {
  readonly x: number;
  readonly y: number;
  readonly birthTime: number;
}

/**
 * Bổ sung 2 phiến lá sen già ở góc tiền cảnh (Corner Framing Pads)
 * Tạo tiền cảnh đóng khung điện ảnh ở 2 góc đáy, đưa ánh nhìn tập trung vào đóa sen trung tâm
 */
export function drawCornerFramingPads(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  S: number,
  t: number,
  padSp: readonly HTMLCanvasElement[],
) {
  const padLeft = padSp[2] ?? padSp[0];
  const padRight = padSp[1] ?? padSp[0];

  // 1. Lá sen già góc dưới bên trái (Bottom-Left Corner Pad)
  const lx = 0.03 * W + Math.sin(t * 0.09) * 4;
  const ly = H + 8 * S + Math.cos(t * 0.08) * 3;
  const lr = 114 * S;

  ctx.save();
  ctx.translate(lx, ly);
  ctx.scale(1.15, 0.44);

  // Bóng đổ đáy lá góc trái
  ctx.beginPath();
  ctx.arc(0, lr * 0.16, lr * 0.98, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 20, 12, 0.5)';
  ctx.fill();

  // Viền sáng mép lá
  ctx.beginPath();
  ctx.arc(0, 0, lr * 1.04, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200, 255, 225, 0.22)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Xoay nhẹ tự nhiên
  ctx.rotate(0.38 + Math.sin(t * 0.07) * 0.02);
  if (padLeft) {
    ctx.drawImage(padLeft, -lr, -lr, lr * 2, lr * 2);
  }
  ctx.restore();

  // Giọt sương đọng lớn trên phiến lá góc trái
  const leftDewdrops = [
    { a: 0.85, k: 0.65, r: 3.2 },
    { a: 1.25, k: 0.48, r: 2.4 },
    { a: 0.4, k: 0.72, r: 2.8 },
  ];
  leftDewdrops.forEach((d) => {
    const dx = lx + Math.cos(d.a) * lr * 1.15 * d.k;
    const dy = ly + Math.sin(d.a) * lr * 0.44 * d.k;
    const dr = d.r * S;
    ctx.beginPath();
    ctx.ellipse(dx, dy + dr * 0.25, dr * 1.05, dr * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,30,18,.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dx, dy, dr, dr * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(145,215,115,.92)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dx - dr * 0.2, dy - dr * 0.15, dr * 0.45, dr * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,255,210,.7)';
    ctx.fill();
  });

  // 2. Lá sen già góc dưới bên phải (Bottom-Right Corner Pad)
  const rx = 0.97 * W + Math.cos(t * 0.09) * 4;
  const ry = H + 10 * S + Math.sin(t * 0.08) * 3;
  const rr = 120 * S;

  ctx.save();
  ctx.translate(rx, ry);
  ctx.scale(1.18, 0.45);

  // Bóng đổ đáy lá góc phải
  ctx.beginPath();
  ctx.arc(0, rr * 0.16, rr * 0.98, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 20, 12, 0.52)';
  ctx.fill();

  // Viền sáng mép lá
  ctx.beginPath();
  ctx.arc(0, 0, rr * 1.04, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200, 255, 225, 0.24)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Xoay nhẹ góc phải
  ctx.rotate(-0.42 + Math.cos(t * 0.06) * 0.02);
  if (padRight) {
    ctx.drawImage(padRight, -rr, -rr, rr * 2, rr * 2);
  }
  ctx.restore();

  // Giọt sương đọng lớn trên phiến lá góc phải
  const rightDewdrops = [
    { a: 2.2, k: 0.6, r: 3.4 },
    { a: 2.65, k: 0.45, r: 2.6 },
    { a: 1.8, k: 0.7, r: 2.9 },
  ];
  rightDewdrops.forEach((d) => {
    const dx = rx + Math.cos(d.a) * rr * 1.18 * d.k;
    const dy = ry + Math.sin(d.a) * rr * 0.45 * d.k;
    const dr = d.r * S;
    ctx.beginPath();
    ctx.ellipse(dx, dy + dr * 0.25, dr * 1.05, dr * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,30,18,.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dx, dy, dr, dr * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(145,215,115,.92)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dx - dr * 0.2, dy - dr * 0.15, dr * 0.45, dr * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,255,210,.7)';
    ctx.fill();
  });
}

/**
 * ENGINE FACTORY: Khởi tạo toàn bộ bộ nhớ cache offscreen canvas và các bảng tham số
 */
export interface LotusCanvasEngine {
  render: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeInSeconds: number,
  ) => void;
  addRipple: (x: number, y: number, t?: number) => void;
  setPointer: (x: number | null, y: number | null) => void;
}

export function createLotusCanvasEngine(): LotusCanvasEngine {
  // ===================================================================
  // CẤU TRÚC 5 LỚP CÁNH HOA SEN HÌNH CHÉN NGỌC 3D (Z-INDEX RENDERING)
  // - Lớp 1 (Back Petals): 5 cánh vươn cao phía sau lưng
  // - Lớp 2 (Outer Wing Petals): 4 cánh mở sang hai bên khum nâng đỡ phom hoa
  // - Lớp 3 (Deep Core): Gương sen lùn 20px (#DCE86A -> #B0C440) + Nhị sen vàng tươi (#FEE86B)
  // - Lớp 4 (Inner Cupping Petals): 4 cánh khum ôm tâm đài sen tạo lòng chén
  // - Lớp 5 (Foreground Front Petals): 3 cánh lớn phía trước (1 chính diện che 60% chân đài + 2 phụ ôm đỡ)
  // ===================================================================
  const LAY: LayerConfig[] = [
    { n: 5, sp: 0.65, len: 186, wid: 52, c1: [210, 60, 115], ps: [] },
    { n: 4, sp: 1.0, len: 168, wid: 56, c1: [224, 85, 140], ps: [] },
    { n: 4, sp: 0.62, len: 136, wid: 48, c1: [235, 115, 160], ps: [] },
    { n: 3, sp: 0.38, len: 22, wid: 44, c1: [242, 135, 172], ps: [] },
  ];

  LAY.forEach((l, li) => {
    l.ps = [];
    for (let i = 0; i < l.n; i++) {
      const r = rng(li * 97 + i * 13 + 5);
      const baseColor =
        li === 3 ? ([252, 248, 238] as const) : li === 2 ? ([248, 252, 232] as const) : CREAM;

      let petalLen = l.len * (0.95 + r() * 0.08);
      let petalWid = l.wid * (0.94 + r() * 0.1);

      // Tinh chỉnh tỷ lệ chuẩn xác cho 3 cánh tiền cảnh: 1 chính diện + 2 cánh phụ ôm đỡ
      if (li === 3) {
        if (i === 1) {
          petalLen = 21;
          petalWid = 44;
        } else {
          petalLen = 25;
          petalWid = 42;
        }
      }

      l.ps.push(makePetal(petalLen, petalWid, l.c1, li * 31 + i + 1, baseColor));
    }
  });

  // 3 Búp sen BUD
  const BUD: PetalData[] = [
    makePetal(80, 25, [214, 84, 134], 71, [170, 202, 120]),
    makePetal(76, 24, [232, 116, 158], 72, [176, 206, 128]),
    makePetal(70, 22, [240, 140, 174], 73, [190, 214, 140]),
  ];

  // 3 Loại lá sen padSp
  const padSp: HTMLCanvasElement[] = [
    makePad(1, ['#62b878', '#37894d', '#1d5a33']),
    makePad(2, ['#58ad70', '#2f8046', '#1a5230']),
    makePad(3, ['#6bbf7a', '#3f9350', '#215f35']),
  ];

  // Khởi tạo các giọt nước đọng trên 10 phiến lá
  initPadsDewdrops(PADS);

  // 46 đốm sáng lấp lánh ngẫu nhiên
  const gl = createGlistens();

  // Mảng sóng nước tương tác khi chạm/nhấp chuột
  const interactiveRipples: InteractiveRipple[] = [];

  // Tọa độ con trỏ chuột
  let pointerX: number | null = null;
  let pointerY: number | null = null;

  // Trạng thái runtime của đàn cá chép
  const fishStates: FishRuntimeState[] = FISH.map((f) => ({
    u: f.ph,
    lastT: 0,
    boostTime: -999,
    speedMult: 1.0,
  }));

  // Khởi tạo 16 chú đom đóm phát sáng bay lơ lửng
  const fireflies = createFireflies();

  return {
    render: (ctx, W, H, t) => {
      const S = Math.min(W, H * 1.1) / 620;
      const cx = W / 2;
      const cy = H * 0.5;
      const wy = cy + 140 * S;

      // 1. Mặt nước (water) & Đàn cá (cá lớn + bầy cá con)
      water(ctx, t, cx, cy, W, H, S, gl);
      fishes(ctx, t, W, H, S, fishStates, pointerX, pointerY);
      drawMinnowSchool(ctx, t, W, H, S, pointerX, pointerY);

      // 2. Lá sen hậu cảnh (pads.forEach(p => { if (!p.f) padDraw(p, t, wy); }))
      PADS.forEach((p) => {
        if (!p.f) padDraw(ctx, p, t, W, H, S, wy, padSp);
      });

      // 3. Gợn sóng cá, sóng cuống sen, sóng nhấp chuột & Nụ sen (bud)
      fishRipples(ctx, t, W, H, S);
      ripples(ctx, cx, wy, t, S);

      // Vẽ các vòng sóng nhấp chuột (Click/Tap Water Ripples) lan tỏa và mờ dần trong 1.2s
      for (let i = interactiveRipples.length - 1; i >= 0; i--) {
        const rip = interactiveRipples[i];
        if (!rip) continue;
        const age = t - rip.birthTime;
        if (age > 1.2 || age < 0) {
          interactiveRipples.splice(i, 1);
          continue;
        }
        const p = age / 1.2;
        for (let ring = 0; ring < 3; ring++) {
          const ringP = p - ring * 0.16;
          if (ringP <= 0 || ringP > 1) continue;
          const radX = (12 + ringP * 65) * S;
          const radY = radX * 0.32;
          const alpha = (1 - ringP) * 0.45;
          ctx.beginPath();
          ctx.ellipse(rip.x, rip.y, radX, radY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220, 255, 235, ${alpha})`;
          ctx.lineWidth = 1.6 * (1 - ringP * 0.4);
          ctx.stroke();
        }
      }

      bud(ctx, cx, wy, t, S, BUD);

      // 4. Bóng phản chiếu bông sen dưới nước
      ctx.save();
      ctx.translate(cx, wy + 42 * S);
      ctx.scale(S, -S * 0.3);
      ctx.globalAlpha = 0.2;
      try {
        ctx.filter = 'blur(2px)';
      } catch {
        // Fallback
      }
      flower(ctx, t, LAY);
      ctx.restore();
      ctx.filter = 'none';

      // Vầng hào quang ấm trung tâm
      const gWarm = ctx.createRadialGradient(cx, cy - 80 * S, 10, cx, cy - 80 * S, 260 * S);
      gWarm.addColorStop(0, 'rgba(255,220,230,.2)');
      gWarm.addColorStop(1, 'rgba(255,220,230,0)');
      ctx.fillStyle = gWarm;
      ctx.fillRect(0, 0, W, H);

      // 5. BÓNG CHUỒN CHUỒN: Vẽ bóng đổ trước khi vẽ bông hoa
      dragonfly(ctx, t, cx, cy, W, H, S, true);

      // 6. Lá sen đứng vươn cao & Cuống sen chính cong chữ S tự nhiên
      standLeaf(ctx, Math.min(W - 70 * S, cx + 255 * S), wy, cy + 10 * S, 56 * S, t, S);
      stem(ctx, cx, cy, wy, t, S);

      // 7. BÔNG SEN NỞ CHÍNH
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(S, S);
      flower(ctx, t, LAY);
      ctx.restore();

      // 8. LÁ SEN TIỀN CẢNH đè lên chân gốc hoa
      PADS.forEach((p) => {
        if (p.f) padDraw(ctx, p, t, W, H, S, wy, padSp);
      });

      // 9. BỔ SUNG 2 PHIẾN LÁ SEN GIÀ Ở GÓC TIỀN CẢNH (Corner Framing Pads)
      drawCornerFramingPads(ctx, W, H, S, t, padSp);

      // 10. CHÚ ẾCH NGỒI THIỀN TRÊN PHIẾN LÁ SEN TIỀN CẢNH
      drawFrog(ctx, t, W, H, S, wy, pointerX, pointerY);

      // 11. THÂN VÀ CÁNH CHUỒN CHUỒN: Bay lượn và thỉnh thoảng đỗ trên nụ sen
      dragonfly(ctx, t, cx, cy, W, H, S, false);

      // 12. BẦY ĐOM ĐÓM PHÁT SÁNG BAY LƠ LỬNG
      drawFireflies(ctx, t, W, H, S, wy, fireflies);

      // 11. 26 hạt phấn hoa bay lơ lửng
      for (let i = 0; i < 26; i++) {
        const f = (t * 0.03 + i / 26) % 1;
        const x = cx + Math.sin(i * 7.1 + t * 0.3) * 150 * S * (0.4 + f);
        const y = cy - 70 * S - f * 260 * S;
        const a = Math.sin(f * Math.PI) * 0.55;
        ctx.beginPath();
        ctx.arc(x, y, (1.2 + (i % 3) * 0.5) * S, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,200,${a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 4 * S, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,200,${a * 0.15})`;
        ctx.fill();
      }

      // 12. Lớp phủ vignette viền hồ
      const gVignette = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.3,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.75,
      );
      gVignette.addColorStop(0, 'rgba(0,30,20,0)');
      gVignette.addColorStop(1, 'rgba(0,30,20,.5)');
      ctx.fillStyle = gVignette;
      ctx.fillRect(0, 0, W, H);
    },

    addRipple: (x: number, y: number, t?: number) => {
      const birth = t !== undefined ? t : performance.now() / 1000;
      interactiveRipples.push({ x, y, birthTime: birth });
      if (interactiveRipples.length > 25) {
        interactiveRipples.shift();
      }
    },

    setPointer: (x: number | null, y: number | null) => {
      pointerX = x;
      pointerY = y;
    },
  };
}
