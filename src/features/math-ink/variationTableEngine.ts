import type {
  InkVariationTableItem,
  VariationMarkerKind,
  VariationSignValue,
  VariationTableMode,
} from './types';

export interface VariationTablePreset {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly mode: VariationTableMode;
  readonly xLabel: string;
  readonly derivativeLabel: string;
  readonly valueLabel: string;
  readonly xPoints: readonly string[];
  readonly pointMarkers: readonly VariationMarkerKind[];
  readonly intervalSigns: readonly VariationSignValue[];
  readonly yValues: readonly string[];
}

export const VARIATION_TABLE_PRESETS: readonly VariationTablePreset[] = [
  {
    id: 'cubic-2-extrema',
    label: 'Hàm bậc 3',
    description: '2 cực trị (đồng biến – nghịch biến – đồng biến)',
    mode: 'variation',
    xLabel: 'x',
    derivativeLabel: "y'",
    valueLabel: 'y',
    xPoints: ['-∞', '-1', '1', '+∞'],
    pointMarkers: ['zero', 'zero'],
    intervalSigns: ['+', '-', '+'],
    yValues: ['-∞', '2', '-2', '+∞'],
  },
  {
    id: 'quartic-biquadratic',
    label: 'Hàm trùng phương',
    description: 'Hàm bậc 4 có 3 cực trị chuẩn',
    mode: 'variation',
    xLabel: 'x',
    derivativeLabel: "y'",
    valueLabel: 'y',
    xPoints: ['-∞', '-1', '0', '1', '+∞'],
    pointMarkers: ['zero', 'zero', 'zero'],
    intervalSigns: ['-', '+', '-', '+'],
    yValues: ['+∞', '-1', '0', '-1', '+∞'],
  },
  {
    id: 'rational-asymptote',
    label: 'Phân thức (||)',
    description: 'Có tiệm cận đứng x = 1 với vạch đôi ||',
    mode: 'variation',
    xLabel: 'x',
    derivativeLabel: "y'",
    valueLabel: 'y',
    xPoints: ['-∞', '1', '+∞'],
    pointMarkers: ['double-bar'],
    intervalSigns: ['+', '+'],
    yValues: ['2', '+∞ | -∞', '2'],
  },
  {
    id: 'quadratic-sign',
    label: 'Bảng xét dấu',
    description: 'Xét dấu tam thức bậc hai f(x)',
    mode: 'sign',
    xLabel: 'x',
    derivativeLabel: 'f(x)',
    valueLabel: 'y',
    xPoints: ['-∞', '1', '3', '+∞'],
    pointMarkers: ['zero', 'zero'],
    intervalSigns: ['+', '-', '+'],
    yValues: ['+∞', '0', '0', '+∞'],
  },
];

export type VariationVerticalSlot = 'high' | 'low' | 'mid';

export interface EvaluatedVariationAnchor {
  /** Vị trí dọc bên trái mốc (khác bên phải khi mốc là tiệm cận đứng `||`) */
  readonly leftSlot: VariationVerticalSlot;
  /** Vị trí dọc bên phải mốc */
  readonly rightSlot: VariationVerticalSlot;
  readonly leftLabel: string;
  readonly rightLabel: string;
  readonly isDoubleBar: boolean;
}

/**
 * Tự động xác định cao độ ('high' | 'low' | 'mid') cho từng mốc giá trị trên dòng `y`
 * dựa vào chiều tăng/giảm của dấu `y'` trên hai khoảng kề nhau.
 */
export function computeVariationAnchors(
  item: Pick<InkVariationTableItem, 'xPoints' | 'pointMarkers' | 'intervalSigns' | 'yValues'>,
): readonly EvaluatedVariationAnchor[] {
  const n = Math.max(2, item.xPoints.length);
  const anchors: EvaluatedVariationAnchor[] = [];

  for (let i = 0; i < n; i += 1) {
    const prevSign: VariationSignValue | null = i > 0 ? (item.intervalSigns[i - 1] ?? '+') : null;
    const nextSign: VariationSignValue | null = i < n - 1 ? (item.intervalSigns[i] ?? '+') : null;
    const marker: VariationMarkerKind =
      i > 0 && i < n - 1 ? (item.pointMarkers[i - 1] ?? 'zero') : 'none';
    const rawVal = (item.yValues[i] ?? '').trim();

    if (marker === 'double-bar') {
      const parts = rawVal.split('|').map((s) => s.trim());
      const leftLabel = parts[0] || (prevSign === '+' ? '+∞' : '-∞');
      const rightLabel = parts[1] || (nextSign === '+' ? '-∞' : '+∞');
      const leftSlot: VariationVerticalSlot =
        prevSign === '+' ? 'high' : prevSign === '-' ? 'low' : 'mid';
      const rightSlot: VariationVerticalSlot =
        nextSign === '+' ? 'low' : nextSign === '-' ? 'high' : 'mid';
      anchors.push({
        leftSlot,
        rightSlot,
        leftLabel,
        rightLabel,
        isDoubleBar: true,
      });
      continue;
    }

    let slot: VariationVerticalSlot;
    if (i === 0) {
      slot = nextSign === '+' ? 'low' : nextSign === '-' ? 'high' : 'mid';
    } else if (i === n - 1) {
      slot = prevSign === '+' ? 'high' : prevSign === '-' ? 'low' : 'mid';
    } else if (prevSign === '+' && nextSign === '-') {
      slot = 'high';
    } else if (prevSign === '-' && nextSign === '+') {
      slot = 'low';
    } else {
      slot = 'mid';
    }

    anchors.push({
      leftSlot: slot,
      rightSlot: slot,
      leftLabel: rawVal,
      rightLabel: rawVal,
      isDoubleBar: false,
    });
  }

  return anchors;
}

function drawArrowSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 14) return;

  const angle = Math.atan2(dy, dx);
  const headLen = 8.5;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.45;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6.5),
    y2 - headLen * Math.sin(angle - Math.PI / 6.5),
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6.5),
    y2 - headLen * Math.sin(angle + Math.PI / 6.5),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Kết xuất Bảng biến thiên / Bảng xét dấu chuẩn sách giáo khoa Toán THPT lên Canvas 2D.
 */
export function renderVariationTableOnCanvas(
  ctx: CanvasRenderingContext2D,
  item: InkVariationTableItem,
  isDarkPaper = false,
): void {
  const n = Math.max(2, item.xPoints.length);
  const { x, y, width, height, mode, color } = item;

  const pad = 10;
  const innerX = x + pad;
  const innerY = y + pad;
  const innerW = Math.max(120, width - pad * 2);
  const innerH = Math.max(76, height - pad * 2);

  const labelColW = Math.max(46, Math.min(68, innerW * 0.14));
  const contentX = innerX + labelColW;
  const contentW = innerW - labelColW;

  const rowXH = mode === 'sign' ? innerH * 0.48 : Math.max(28, innerH * 0.22);
  const rowDerivH = mode === 'sign' ? innerH - rowXH : Math.max(28, innerH * 0.22);
  const rowYH = mode === 'sign' ? 0 : innerH - rowXH - rowDerivH;

  const yLine1 = innerY + rowXH;
  const yLine2 = yLine1 + rowDerivH;

  ctx.save();

  // Khung giấy nền dịu bao quanh bảng biến thiên
  ctx.fillStyle = isDarkPaper ? 'rgba(18, 28, 25, 0.90)' : 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = isDarkPaper ? 'rgba(255, 255, 255, 0.16)' : 'rgba(17, 26, 24, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();
  ctx.stroke();

  const inkColor = isDarkPaper && color.toLowerCase() === '#111827' ? '#F1F5F9' : color;

  // Khung kẻ chính của bảng biến thiên (chỉ kẻ đường ngang & cột nhãn giống SGK Toán VN)
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  // Đường dọc phân cách cột tiêu đề (x, y', y)
  ctx.moveTo(contentX, innerY);
  ctx.lineTo(contentX, innerY + innerH);
  // Đường ngang dưới dòng x
  ctx.moveTo(innerX, yLine1);
  ctx.lineTo(innerX + innerW, yLine1);
  // Đường ngang dưới dòng y' (chỉ khi ở chế độ bảng biến thiên)
  if (mode === 'variation') {
    ctx.moveTo(innerX, yLine2);
    ctx.lineTo(innerX + innerW, yLine2);
  }
  ctx.stroke();

  // Tính tọa độ X của từng mốc giá trị
  const colPadX = Math.max(22, contentW * 0.075);
  const usableW = Math.max(40, contentW - colPadX * 2);
  const colX = (index: number) =>
    n <= 1 ? contentX + contentW / 2 : contentX + colPadX + (index / (n - 1)) * usableW;

  const baseFontSize = Math.max(12, Math.min(16, Math.round(innerW / 32)));

  ctx.fillStyle = inkColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Nhãn cột đầu (x, y', y)
  ctx.font = `italic 700 ${baseFontSize}px "Times New Roman", Georgia, serif`;
  ctx.fillText(item.xLabel || 'x', innerX + labelColW / 2, innerY + rowXH / 2);
  ctx.fillText(
    item.derivativeLabel || (mode === 'sign' ? 'f(x)' : "y'"),
    innerX + labelColW / 2,
    yLine1 + rowDerivH / 2,
  );
  if (mode === 'variation') {
    ctx.fillText(item.valueLabel || 'y', innerX + labelColW / 2, yLine2 + rowYH / 2);
  }

  // Hàng 1: Các mốc trên dòng x
  ctx.font = `600 ${baseFontSize - 1}px "Times New Roman", Georgia, serif`;
  for (let i = 0; i < n; i += 1) {
    const label = item.xPoints[i] ?? '';
    ctx.fillText(label, colX(i), innerY + rowXH / 2);
  }

  // Hàng 2: Ký hiệu tại các mốc bên trong (0, ||, |) và dấu (+ / -) trên các khoảng
  const derivCenterY = yLine1 + rowDerivH / 2;
  for (let i = 1; i < n - 1; i += 1) {
    const marker = item.pointMarkers[i - 1] ?? 'zero';
    const px = colX(i);

    if (marker === 'zero') {
      ctx.font = `600 ${baseFontSize - 1}px "Times New Roman", Georgia, serif`;
      ctx.fillText('0', px, derivCenterY);
    } else if (marker === 'double-bar') {
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1.3;
      const bottomY = mode === 'variation' ? innerY + innerH - 4 : yLine1 + rowDerivH - 3;
      ctx.beginPath();
      ctx.moveTo(px - 2.4, yLine1 + 2);
      ctx.lineTo(px - 2.4, bottomY);
      ctx.moveTo(px + 2.4, yLine1 + 2);
      ctx.lineTo(px + 2.4, bottomY);
      ctx.stroke();
    } else if (marker === 'bar') {
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(px, yLine1 + 2);
      ctx.lineTo(px, yLine1 + rowDerivH - 2);
      ctx.stroke();
    }
  }

  // Dấu trên từng khoảng của dòng y' / f(x)
  ctx.font = `700 ${baseFontSize + 1}px "Times New Roman", Georgia, serif`;
  for (let i = 0; i < n - 1; i += 1) {
    const sign = item.intervalSigns[i] ?? '+';
    const midX = (colX(i) + colX(i + 1)) / 2;
    ctx.fillText(sign === '-' ? '−' : sign, midX, derivCenterY);
  }

  // Hàng 3: Chiều biến thiên & mũi tên (chỉ khi mode === 'variation')
  if (mode === 'variation') {
    const anchors = computeVariationAnchors(item);
    const highY = yLine2 + Math.max(16, rowYH * 0.22);
    const midY = yLine2 + rowYH * 0.5;
    const lowY = yLine2 + rowYH - Math.max(16, rowYH * 0.22);

    const slotToY = (slot: VariationVerticalSlot): number => {
      if (slot === 'high') return highY;
      if (slot === 'low') return lowY;
      return midY;
    };

    ctx.font = `600 ${baseFontSize - 1}px "Times New Roman", Georgia, serif`;
    for (let i = 0; i < n; i += 1) {
      const a = anchors[i]!;
      const px = colX(i);
      if (a.isDoubleBar) {
        const offset = Math.min(20, usableW / (n * 3.2));
        ctx.textAlign = 'right';
        ctx.fillText(a.leftLabel, px - 7, slotToY(a.leftSlot));
        ctx.textAlign = 'left';
        ctx.fillText(a.rightLabel, px + 7, slotToY(a.rightSlot));
        ctx.textAlign = 'center';
        void offset;
      } else {
        ctx.fillText(a.leftLabel, px, slotToY(a.leftSlot));
      }
    }

    // Vẽ mũi tên giữa từng cặp mốc liên tiếp
    for (let i = 0; i < n - 1; i += 1) {
      const leftAnchor = anchors[i]!;
      const rightAnchor = anchors[i + 1]!;
      const startXRaw = colX(i) + (leftAnchor.isDoubleBar ? 26 : 18);
      const endXRaw = colX(i + 1) - (rightAnchor.isDoubleBar ? 26 : 18);
      const startYRaw = slotToY(leftAnchor.rightSlot);
      const endYRaw = slotToY(rightAnchor.leftSlot);

      // Co ngắn nhẹ hai đầu để mũi tên không đè chữ giá trị
      const dx = endXRaw - startXRaw;
      const dy = endYRaw - startYRaw;
      const dist = Math.hypot(dx, dy);
      if (dist > 16) {
        const trim = Math.min(10, dist * 0.14);
        const ux = dx / dist;
        const uy = dy / dist;
        drawArrowSegment(
          ctx,
          startXRaw + ux * trim,
          startYRaw + uy * trim,
          endXRaw - ux * trim,
          endYRaw - uy * trim,
          inkColor,
        );
      }
    }
  }

  ctx.restore();
}
