import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export type Affine3DMode = 'plane-dir' | 'line-intersect' | 'plane-parallel';

export interface MicroAffine3DCanvasProps {
  readonly initialMode?: Affine3DMode;
  readonly height?: number;
  readonly className?: string;
  readonly title?: string;
  readonly caption?: string;
}

type Point3D = readonly [number, number, number];

interface ProjectedPoint {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

const DEFAULT_YAW = Math.PI / 4; // 45°
const DEFAULT_PITCH = Math.PI / 6; // 30°
const DEFAULT_ZOOM = 1.0;

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const PITCH_LIMIT = 1.4; // ~80°

// Tọa độ thực thể Afin mẫu trong A³
const ORIGIN_3D: Point3D = [0, 0, 0];
const E1_AXIS: Point3D = [2.2, 0, 0];
const E2_AXIS: Point3D = [0, 2.2, 0];
const E3_AXIS: Point3D = [0, 0, 2.2];

// Siêu phẳng α = P + span{u, v}
const PLANE_P: Point3D = [-0.1, 0.1, 0.7];
const VECTOR_U: Point3D = [1.2, 0.3, 0.2];
const VECTOR_V: Point3D = [-0.2, 1.2, -0.3];

// Phép chiếu 3D -> 2D (Euler yaw & pitch)
function project3D(
  point: Point3D,
  yaw: number,
  pitch: number,
  centerX: number,
  centerY: number,
  scale: number,
): ProjectedPoint {
  const [x, y, z] = point;
  const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
  const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
  const z1 = z * Math.cos(pitch) - y1 * Math.sin(pitch);
  const depth = z * Math.sin(pitch) + y1 * Math.cos(pitch);

  return {
    x: centerX + x1 * scale,
    y: centerY - z1 * scale,
    depth,
  };
}

// Cộng 2 vectơ 3D: a + b
function addVec(a: Point3D, b: Point3D): Point3D {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

// Nhân vectơ với số vô hướng: s * a
function scaleVec(a: Point3D, s: number): Point3D {
  return [a[0] * s, a[1] * s, a[2] * s];
}

// Tổ hợp affine/tuyến tính: p + s*u + t*v
function linearComb(p: Point3D, u: Point3D, s: number, v: Point3D, t: number): Point3D {
  return [p[0] + s * u[0] + t * v[0], p[1] + s * u[1] + t * v[1], p[2] + s * u[2] + t * v[2]];
}

export const MicroAffine3DCanvas: FC<MicroAffine3DCanvasProps> = ({
  initialMode = 'plane-dir',
  height = 420,
  className,
  title = 'Không gian Afin 3D & Siêu phẳng',
  caption,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<Affine3DMode>(initialMode);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Góc nhìn và tỷ lệ phóng
  const [yaw, setYaw] = useState<number>(DEFAULT_YAW);
  const [pitch, setPitch] = useState<number>(DEFAULT_PITCH);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

  // Quán tính & Kéo thả
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const pinchDistRef = useRef<number | null>(null);

  // Refs phục vụ rAF
  const yawRef = useRef<number>(yaw);
  const pitchRef = useRef<number>(pitch);
  const zoomRef = useRef<number>(zoom);
  const modeRef = useRef<Affine3DMode>(mode);

  useEffect(() => {
    yawRef.current = yaw;
    pitchRef.current = pitch;
    zoomRef.current = zoom;
    modeRef.current = mode;
  }, [yaw, pitch, zoom, mode]);

  // Phát hiện dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    handleThemeChange();
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Xử lý phím Escape để thoát chế độ phóng to
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Đặt lại góc nhìn mặc định
  const handleReset = useCallback(() => {
    setYaw(DEFAULT_YAW);
    setPitch(DEFAULT_PITCH);
    setZoom(DEFAULT_ZOOM);
    velocityRef.current = { yaw: 0, pitch: 0 };
  }, []);

  // Phóng to / Thu nhỏ
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, +(prev + 0.15).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, +(prev - 0.15).toFixed(2)));
  }, []);

  // Vòng lặp render Canvas On-demand & Tối ưu Viewport (0% GPU khi cuộn khỏi màn hình)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isIntersecting = true;
    let isMounted = true;
    const startTime = performance.now();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (now: number) => {
      if (!isMounted || !isIntersecting) {
        animId = 0;
        return;
      }

      const elapsed = now - startTime;

      // Cập nhật quán tính khi thả chuột
      if (!isDraggingRef.current) {
        if (
          Math.abs(velocityRef.current.yaw) > 0.00005 ||
          Math.abs(velocityRef.current.pitch) > 0.00005
        ) {
          const nextYaw = yawRef.current + velocityRef.current.yaw;
          const nextPitch = Math.max(
            -PITCH_LIMIT,
            Math.min(PITCH_LIMIT, pitchRef.current + velocityRef.current.pitch),
          );
          setYaw(nextYaw);
          setPitch(nextPitch);

          velocityRef.current.yaw *= 0.92;
          velocityRef.current.pitch *= 0.92;
        }
      }

      // Kích thước hiển thị & tỷ lệ DPI
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const canvasHeight = rect.height;

      if (width === 0 || canvasHeight === 0) {
        if (isIntersecting && !prefersReducedMotion) {
          animId = requestAnimationFrame(render);
        }
        return;
      }

      if (
        canvas.width !== Math.round(width * dpr) ||
        canvas.height !== Math.round(canvasHeight * dpr)
      ) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(canvasHeight * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, canvasHeight);

      const centerX = width / 2;
      const centerY = canvasHeight / 2 + 12;
      const baseScale = Math.min(width, canvasHeight) / 7.0;
      const scale = baseScale * zoomRef.current;

      const currentYaw = yawRef.current;
      const currentPitch = pitchRef.current;
      const currentMode = modeRef.current;
      const dark = isDark;

      // Hàm vẽ nhãn có pill nền mờ
      const drawLabel = (
        text: string,
        pos: ProjectedPoint,
        textColor: string,
        offsetX = 8,
        offsetY = -8,
        isBold = false,
      ) => {
        ctx.save();
        ctx.font = `${isBold ? '600' : '500'} 11px system-ui, -apple-system, sans-serif`;
        const metrics = ctx.measureText(text);
        const textW = metrics.width;
        const textH = 13;
        const x = pos.x + offsetX;
        const y = pos.y + offsetY;

        ctx.fillStyle = dark ? 'rgba(11, 26, 19, 0.85)' : 'rgba(248, 250, 247, 0.9)';
        ctx.strokeStyle = dark ? 'rgba(30, 59, 45, 0.6)' : 'rgba(220, 231, 225, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x - 4, y - textH + 2, textW + 8, textH + 4, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      // Hàm vẽ mũi tên 3D
      const drawArrow3D = (
        from: Point3D,
        to: Point3D,
        strokeColor: string,
        lineWidth: number,
        dashed = false,
        arrowHead = true,
      ) => {
        const p1 = project3D(from, currentYaw, currentPitch, centerX, centerY, scale);
        const p2 = project3D(to, currentYaw, currentPitch, centerX, centerY, scale);

        ctx.save();
        ctx.beginPath();
        if (dashed) {
          ctx.setLineDash([3, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        if (arrowHead) {
          ctx.setLineDash([]);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          const headLen = 9;
          ctx.fillStyle = strokeColor;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(
            p2.x - headLen * Math.cos(angle - Math.PI / 6),
            p2.y - headLen * Math.sin(angle - Math.PI / 6),
          );
          ctx.lineTo(
            p2.x - headLen * Math.cos(angle + Math.PI / 6),
            p2.y - headLen * Math.sin(angle + Math.PI / 6),
          );
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      };

      // 1. VẼ LƯỚI MẶT PHẲNG ĐÁY Oxy (z = 0)
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = dark ? 'rgba(161, 209, 183, 0.12)' : 'rgba(46, 107, 79, 0.1)';
      ctx.lineWidth = 1;

      for (let g = -2; g <= 2; g += 1) {
        if (g === 0) continue;
        const xStart = project3D([-2.2, g, 0], currentYaw, currentPitch, centerX, centerY, scale);
        const xEnd = project3D([2.2, g, 0], currentYaw, currentPitch, centerX, centerY, scale);
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(xEnd.x, xEnd.y);
        ctx.stroke();

        const yStart = project3D([g, -2.2, 0], currentYaw, currentPitch, centerX, centerY, scale);
        const yEnd = project3D([g, 2.2, 0], currentYaw, currentPitch, centerX, centerY, scale);
        ctx.beginPath();
        ctx.moveTo(yStart.x, yStart.y);
        ctx.lineTo(yEnd.x, yEnd.y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. VẼ PHẦN ÂM CỦA 3 TRỤC TỌA ĐỘ (NÉT ĐỨT)
      drawArrow3D([-2.0, 0, 0], ORIGIN_3D, dark ? '#C2545040' : '#C2545030', 1.2, true, false);
      drawArrow3D([0, -2.0, 0], ORIGIN_3D, dark ? '#739B8840' : '#739B8830', 1.2, true, false);
      drawArrow3D([0, 0, -1.6], ORIGIN_3D, dark ? '#C5A26240' : '#C5A26230', 1.2, true, false);

      // 3. VẼ SIÊU PHẲNG α = P + span{u, v}
      const planeExtent = 1.35;
      const corner1 = linearComb(PLANE_P, VECTOR_U, -planeExtent, VECTOR_V, -planeExtent);
      const corner2 = linearComb(PLANE_P, VECTOR_U, planeExtent, VECTOR_V, -planeExtent);
      const corner3 = linearComb(PLANE_P, VECTOR_U, planeExtent, VECTOR_V, planeExtent);
      const corner4 = linearComb(PLANE_P, VECTOR_U, -planeExtent, VECTOR_V, planeExtent);

      const pC1 = project3D(corner1, currentYaw, currentPitch, centerX, centerY, scale);
      const pC2 = project3D(corner2, currentYaw, currentPitch, centerX, centerY, scale);
      const pC3 = project3D(corner3, currentYaw, currentPitch, centerX, centerY, scale);
      const pC4 = project3D(corner4, currentYaw, currentPitch, centerX, centerY, scale);

      // Nền diện tích siêu phẳng (bán trong suốt)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pC1.x, pC1.y);
      ctx.lineTo(pC2.x, pC2.y);
      ctx.lineTo(pC3.x, pC3.y);
      ctx.lineTo(pC4.x, pC4.y);
      ctx.closePath();
      ctx.fillStyle = dark ? 'rgba(115, 155, 136, 0.22)' : 'rgba(74, 138, 106, 0.16)';
      ctx.fill();

      // Khung viền siêu phẳng
      ctx.strokeStyle = dark ? 'rgba(161, 209, 183, 0.55)' : 'rgba(46, 107, 79, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Lưới phân ô trên mặt phẳng (biểu thị không gian phương V_α)
      ctx.strokeStyle = dark ? 'rgba(161, 209, 183, 0.22)' : 'rgba(46, 107, 79, 0.18)';
      ctx.lineWidth = 1;
      const subSteps = [-0.8, -0.4, 0, 0.4, 0.8];
      for (const s of subSteps) {
        const uA = project3D(
          linearComb(PLANE_P, VECTOR_U, s, VECTOR_V, -planeExtent),
          currentYaw,
          currentPitch,
          centerX,
          centerY,
          scale,
        );
        const uB = project3D(
          linearComb(PLANE_P, VECTOR_U, s, VECTOR_V, planeExtent),
          currentYaw,
          currentPitch,
          centerX,
          centerY,
          scale,
        );
        ctx.beginPath();
        ctx.moveTo(uA.x, uA.y);
        ctx.lineTo(uB.x, uB.y);
        ctx.stroke();

        const vA = project3D(
          linearComb(PLANE_P, VECTOR_U, -planeExtent, VECTOR_V, s),
          currentYaw,
          currentPitch,
          centerX,
          centerY,
          scale,
        );
        const vB = project3D(
          linearComb(PLANE_P, VECTOR_U, planeExtent, VECTOR_V, s),
          currentYaw,
          currentPitch,
          centerX,
          centerY,
          scale,
        );
        ctx.beginPath();
        ctx.moveTo(vA.x, vA.y);
        ctx.lineTo(vB.x, vB.y);
        ctx.stroke();
      }
      ctx.restore();

      // Nhãn góc siêu phẳng
      const alphaTagPos = project3D(corner3, currentYaw, currentPitch, centerX, centerY, scale);
      drawLabel('Siêu phẳng α', alphaTagPos, dark ? '#A1D1B7' : '#2E6B4F', 6, -6, true);

      // 4. VẼ CÁC TRỤC CHÍNH DƯƠNG CỦA HỆ MỤC TIÊU AFIN (O; e1, e2, e3)
      // Trục e1 (Ox): Màu Đỏ Chu Sa trầm
      drawArrow3D(ORIGIN_3D, E1_AXIS, '#C25450', 2.2);
      const e1LabelPos = project3D(E1_AXIS, currentYaw, currentPitch, centerX, centerY, scale);
      drawLabel('e₁ (Ox)', e1LabelPos, '#C25450', 6, -4, true);

      // Trục e2 (Oy): Màu Xanh Men Ngọc
      drawArrow3D(ORIGIN_3D, E2_AXIS, '#739B88', 2.2);
      const e2LabelPos = project3D(E2_AXIS, currentYaw, currentPitch, centerX, centerY, scale);
      drawLabel('e₂ (Oy)', e2LabelPos, dark ? '#A1D1B7' : '#3E7D63', 6, 6, true);

      // Trục e3 (Oz): Màu Vàng Thếp Cổ
      drawArrow3D(ORIGIN_3D, E3_AXIS, '#C5A262', 2.2);
      const e3LabelPos = project3D(E3_AXIS, currentYaw, currentPitch, centerX, centerY, scale);
      drawLabel('e₃ (Oz)', e3LabelPos, '#C5A262', 6, -4, true);

      // Gốc O(0,0,0): Chấm tròn ngọc bích viền vàng thếp
      const originProj = project3D(ORIGIN_3D, currentYaw, currentPitch, centerX, centerY, scale);
      ctx.save();
      ctx.beginPath();
      ctx.arc(originProj.x, originProj.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#C5A262';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(originProj.x, originProj.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#2E6B4F';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(originProj.x, originProj.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF5';
      ctx.fill();
      ctx.restore();
      drawLabel('O', originProj, '#C5A262', -14, 12, true);

      // Điểm neo P trên siêu phẳng α
      const pProj = project3D(PLANE_P, currentYaw, currentPitch, centerX, centerY, scale);
      ctx.save();
      ctx.beginPath();
      ctx.arc(pProj.x, pProj.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.strokeStyle = '#E5B25D';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      drawLabel('P ∈ α', pProj, dark ? '#34D399' : '#15803D', 6, -6, true);

      // 5. VẼ NỘI DUNG THEO TỪNG CHẾ ĐỘ (3 TABS)
      if (currentMode === 'plane-dir') {
        // [CHẾ ĐỘ 1: SIÊU PHẲNG & PHƯƠNG]
        // Hai vectơ u, v xuất phát từ P
        const tipU = addVec(PLANE_P, VECTOR_U);
        const tipV = addVec(PLANE_P, VECTOR_V);

        // Vectơ u
        drawArrow3D(PLANE_P, tipU, dark ? '#34D399' : '#16A34A', 2.6);
        const uLabelPos = project3D(tipU, currentYaw, currentPitch, centerX, centerY, scale);
        drawLabel('u ∈ V_α', uLabelPos, dark ? '#34D399' : '#16A34A', 6, -4, true);

        // Vectơ v
        drawArrow3D(PLANE_P, tipV, dark ? '#38BDF8' : '#0284C7', 2.6);
        const vLabelPos = project3D(tipV, currentYaw, currentPitch, centerX, centerY, scale);
        drawLabel('v ∈ V_α', vLabelPos, dark ? '#38BDF8' : '#0284C7', 6, 6, true);
      } else if (currentMode === 'line-intersect') {
        // [CHẾ ĐỘ 2: TƯƠNG GIAO ĐƯỜNG THẲNG & SIÊU PHẲNG]
        // Điểm giao I = P + 0.2u - 0.2v
        const pointI = linearComb(PLANE_P, VECTOR_U, 0.2, VECTOR_V, -0.2);
        // Vectơ chỉ phương w không nằm trong V_α (hướng xiên đứng)
        const vectorW: Point3D = [0.2, -0.2, 1.4];

        const lineStart = addVec(pointI, scaleVec(vectorW, -1.3));
        const lineEnd = addVec(pointI, scaleVec(vectorW, 1.3));

        // Đoạn dưới siêu phẳng: Nét đứt (xuyên qua)
        drawArrow3D(lineStart, pointI, dark ? '#FB923C90' : '#EA580C80', 2.0, true, false);

        // Đoạn trên siêu phẳng: Nét liền màu cam nổi bật
        drawArrow3D(pointI, lineEnd, '#EA580C', 2.6, false, true);
        const lineLabelPos = project3D(lineEnd, currentYaw, currentPitch, centerX, centerY, scale);
        drawLabel('Đường thẳng d', lineLabelPos, '#EA580C', 6, -6, true);

        // Vectơ w trên đường thẳng
        const ptM0 = addVec(pointI, scaleVec(vectorW, 0.65));
        const ptWEnd = addVec(ptM0, scaleVec(vectorW, 0.55));
        drawArrow3D(ptM0, ptWEnd, '#F59E0B', 2.2, false, true);
        const wLabelPos = project3D(ptWEnd, currentYaw, currentPitch, centerX, centerY, scale);
        drawLabel('w ∉ V_α', wLabelPos, '#F59E0B', 6, 2, true);

        // Điểm giao cắt I phát sáng vàng rực rỡ
        const iProj = project3D(pointI, currentYaw, currentPitch, centerX, centerY, scale);
        const pulse = 1 + 0.18 * Math.sin(elapsed * 0.006);

        ctx.save();
        // Hào quang vàng tỏa rộng
        ctx.beginPath();
        ctx.arc(iProj.x, iProj.y, 11 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(229, 178, 93, 0.25)';
        ctx.fill();

        // Vòng tròn trung tâm
        ctx.beginPath();
        ctx.arc(iProj.x, iProj.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#E5B25D';
        ctx.fill();

        // Chấm tâm trắng
        ctx.beginPath();
        ctx.arc(iProj.x, iProj.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFDF5';
        ctx.fill();
        ctx.restore();

        drawLabel('I = d ∩ α', iProj, '#E5B25D', 10, -10, true);
      } else if (currentMode === 'plane-parallel') {
        // [CHẾ ĐỘ 3: ĐƯỜNG THẲNG SONG SONG SIÊU PHẲNG]
        // Điểm M0 nâng cao lên theo phương z (không thuộc α)
        const pointM0: Point3D = addVec(PLANE_P, [0, 0, 1.15]);
        // Vectơ phương w thuộc V_α (song song với phương của α)
        const vectorW = linearComb([0, 0, 0], VECTOR_U, 0.85, VECTOR_V, 0.25);

        const lineStart = addVec(pointM0, scaleVec(vectorW, -1.25));
        const lineEnd = addVec(pointM0, scaleVec(vectorW, 1.25));

        // Vẽ đường thẳng d song song màu tím indigo/vàng
        drawArrow3D(lineStart, lineEnd, dark ? '#A78BFA' : '#6366F1', 2.6, false, true);
        const dLabelPos = project3D(lineEnd, currentYaw, currentPitch, centerX, centerY, scale);
        drawLabel('d ∥ α (d ∩ α = ∅)', dLabelPos, dark ? '#C4B5FD' : '#4F46E5', 6, -6, true);

        // Điểm M0 trên d
        const m0Proj = project3D(pointM0, currentYaw, currentPitch, centerX, centerY, scale);
        ctx.save();
        ctx.beginPath();
        ctx.arc(m0Proj.x, m0Proj.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dark ? '#A78BFA' : '#6366F1';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        drawLabel('M₀ ∉ α', m0Proj, dark ? '#C4B5FD' : '#4F46E5', 6, 8, true);

        // Vectơ chỉ phương w trên d
        const wTip = addVec(pointM0, vectorW);
        drawArrow3D(pointM0, wTip, '#E5B25D', 2.4, false, true);
        const wLabelPos = project3D(wTip, currentYaw, currentPitch, centerX, centerY, scale);
        drawLabel('w ∈ V_α', wLabelPos, '#E5B25D', 6, -4, true);

        // Các đường dóng khoảng cách vuông góc xuống siêu phẳng để thấy rõ tính song song
        const baseDrop = PLANE_P;
        drawArrow3D(
          pointM0,
          baseDrop,
          dark ? 'rgba(196, 181, 253, 0.45)' : 'rgba(99, 102, 241, 0.4)',
          1.2,
          true,
          false,
        );

        const dropTip = addVec(baseDrop, vectorW);
        drawArrow3D(
          wTip,
          dropTip,
          dark ? 'rgba(196, 181, 253, 0.35)' : 'rgba(99, 102, 241, 0.3)',
          1.0,
          true,
          false,
        );
      }

      ctx.restore();

      if (isIntersecting) {
        animId = requestAnimationFrame(render);
      } else {
        animId = 0;
      }
    };

    // Theo dõi viewport để dừng 100% render loop khi canvas cuộn khỏi màn hình
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting && !animId) {
              animId = requestAnimationFrame(render);
            } else if (!isIntersecting && animId) {
              cancelAnimationFrame(animId);
              animId = 0;
            }
          }
        },
        { threshold: 0.05 },
      );
      observer.observe(container);
    } else {
      animId = requestAnimationFrame(render);
    }

    return () => {
      isMounted = false;
      if (animId) cancelAnimationFrame(animId);
      observer?.disconnect();
    };
  }, [isDark]);

  // Xử lý kéo xoay chuột
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { yaw: 0, pitch: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    const dyaw = dx * 0.007;
    const dpitch = dy * 0.007;

    setYaw((prev) => prev + dyaw);
    setPitch((prev) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, prev + dpitch)));
    velocityRef.current = { yaw: dyaw, pitch: dpitch };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Xử lý chạm cảm ứng di động
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];

    if (e.touches.length === 1 && touch0) {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: touch0.clientX, y: touch0.clientY };
      velocityRef.current = { yaw: 0, pitch: 0 };
    } else if (e.touches.length === 2 && touch0 && touch1) {
      isDraggingRef.current = false;
      const dx = touch0.clientX - touch1.clientX;
      const dy = touch0.clientY - touch1.clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];

    if (e.touches.length === 1 && touch0 && isDraggingRef.current) {
      const dx = touch0.clientX - lastPointerRef.current.x;
      const dy = touch0.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: touch0.clientX, y: touch0.clientY };

      const dyaw = dx * 0.007;
      const dpitch = dy * 0.007;

      setYaw((prev) => prev + dyaw);
      setPitch((prev) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, prev + dpitch)));
      velocityRef.current = { yaw: dyaw, pitch: dpitch };
    } else if (e.touches.length === 2 && touch0 && touch1 && pinchDistRef.current !== null) {
      const dx = touch0.clientX - touch1.clientX;
      const dy = touch0.clientY - touch1.clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchDistRef.current;
      pinchDistRef.current = dist;

      setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(prev * ratio).toFixed(2))));
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    pinchDistRef.current = null;
  };

  // Xử lý cuộn chuột zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(prev * factor).toFixed(2))));
  };

  return (
    <figure
      ref={containerRef}
      className={cn(
        'my-6 flex flex-col overflow-hidden rounded-2xl transition-all duration-300',
        'border border-[#DCE7E1] bg-[#F8FAF7] shadow-sm',
        'dark:border-[#1E3B2D] dark:bg-[#0B1A13] dark:shadow-md',
        isExpanded && 'fixed inset-3 z-50 m-0 max-h-[96vh] md:inset-8',
        className,
      )}
    >
      {/* 1. THANH TIÊU ĐỀ & CHUYỂN TAB ĐIỀU KHIỂN */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#DCE7E1] px-4 py-2.5 dark:border-[#1E3B2D]">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2E6B4F]/10 text-xs font-bold text-[#2E6B4F] dark:bg-[#739B88]/20 dark:text-[#A1D1B7]">
            3D
          </span>
          <h3 className="font-serif text-sm font-bold text-zinc-900 dark:text-[#F5F2EB]">
            {title}
          </h3>
        </div>

        {/* 3 Tabs quan sát vị trí tương đối */}
        <div
          role="tablist"
          aria-label="Chế độ quan sát 3D"
          className="flex flex-wrap items-center gap-1 rounded-xl bg-zinc-200/60 p-1 dark:bg-[#12281E]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'plane-dir'}
            onClick={() => setMode('plane-dir')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200',
              mode === 'plane-dir'
                ? 'bg-[#2E6B4F] text-white shadow-xs dark:bg-[#739B88] dark:text-zinc-950'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-[#F5F2EB]',
            )}
          >
            1. Siêu phẳng & Phương
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'line-intersect'}
            onClick={() => setMode('line-intersect')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200',
              mode === 'line-intersect'
                ? 'bg-[#2E6B4F] text-white shadow-xs dark:bg-[#739B88] dark:text-zinc-950'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-[#F5F2EB]',
            )}
          >
            2. Tương giao d ∩ α
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'plane-parallel'}
            onClick={() => setMode('plane-parallel')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200',
              mode === 'plane-parallel'
                ? 'bg-[#2E6B4F] text-white shadow-xs dark:bg-[#739B88] dark:text-zinc-950'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-[#F5F2EB]',
            )}
          >
            3. Đường thẳng d ∥ α
          </button>
        </div>

        {/* Nút tiện ích góc phải */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Thu nhỏ (-)"
            aria-label="Thu nhỏ"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300/80 text-xs text-zinc-700 transition hover:bg-zinc-200/60 dark:border-[#1E3B2D] dark:text-zinc-300 dark:hover:bg-[#12281E]"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Phóng to (+)"
            aria-label="Phóng to"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300/80 text-xs text-zinc-700 transition hover:bg-zinc-200/60 dark:border-[#1E3B2D] dark:text-zinc-300 dark:hover:bg-[#12281E]"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Đặt lại góc nhìn chuẩn (45°, 30°)"
            aria-label="Đặt lại góc nhìn"
            className="flex h-7 items-center gap-1 rounded-lg border border-zinc-300/80 px-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/60 dark:border-[#1E3B2D] dark:text-zinc-300 dark:hover:bg-[#12281E]"
          >
            ↺ Đặt lại
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Thu nhỏ khung' : 'Mở rộng toàn khung'}
            aria-label={isExpanded ? 'Thu nhỏ khung' : 'Mở rộng toàn khung'}
            className="flex h-7 items-center gap-1 rounded-lg border border-zinc-300/80 px-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/60 dark:border-[#1E3B2D] dark:text-zinc-300 dark:hover:bg-[#12281E]"
          >
            {isExpanded ? '✕ Thu nhỏ' : '⤢ Toàn khung'}
          </button>
        </div>
      </div>

      {/* 2. KHU VỰC CANVAS 2D TƯƠNG TÁC */}
      <div
        className="relative w-full flex-1 touch-none overflow-hidden select-none"
        style={{ height: isExpanded ? 'calc(100vh - 160px)' : height }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="block h-full w-full cursor-grab active:cursor-grabbing"
          aria-label="Khung vẽ mô hình 3D tọa độ Afin và siêu phẳng. Kéo để xoay góc nhìn, cuộn để phóng to thu nhỏ."
        />

        {/* Chú dẫn tương tác nhanh nổi mờ góc dưới-trái */}
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-2 text-[11px] font-medium text-zinc-500/90 dark:text-zinc-400/80">
          <span>💡 Kéo để xoay 360°</span>
          <span>•</span>
          <span>Cuộn để zoom ({(zoom * 100).toFixed(0)}%)</span>
        </div>
      </div>

      {/* 3. CHÚ GIẢI HỌC THUẬT & CÔNG THỨC KATEX ĐỒNG BỘ */}
      <div className="border-t border-[#DCE7E1] bg-zinc-100/70 p-3.5 text-xs dark:border-[#1E3B2D] dark:bg-[#08150F]">
        {mode === 'plane-dir' && (
          <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between">
            <div>
              <span className="font-semibold text-[#2E6B4F] dark:text-[#A1D1B7]">
                Đặc tả siêu phẳng:
              </span>{' '}
              <span className="text-zinc-700 dark:text-zinc-300">
                Siêu phẳng <span className="font-serif font-bold italic">α</span> (2-phẳng trong{' '}
                <KatexMath math="\mathcal{A}^3" />) đi qua điểm neo{' '}
                <span className="font-serif font-bold italic">P</span> với không gian phương 2 chiều{' '}
                <KatexMath math="V_\alpha = \operatorname{span}\{\vec{u}, \vec{v}\}" />.
              </span>
            </div>
            <div className="shrink-0 font-mono text-zinc-800 dark:text-[#E5C378]">
              <KatexMath math="\alpha = P + V_\alpha = P + \operatorname{span}\{\vec{u}, \vec{v}\}" />
            </div>
          </div>
        )}

        {mode === 'line-intersect' && (
          <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between">
            <div>
              <span className="font-semibold text-[#EA580C] dark:text-[#FB923C]">
                Tương giao xuyên cắt:
              </span>{' '}
              <span className="text-zinc-700 dark:text-zinc-300">
                Đường thẳng <KatexMath math="d = M_0 + \langle\vec{w}\rangle" /> cắt siêu phẳng{' '}
                <span className="font-serif font-bold italic">α</span> tại duy nhất một điểm{' '}
                <span className="font-serif font-bold italic">I</span> khi và chỉ khi vectơ phương{' '}
                <KatexMath math="\vec{w} \notin V_\alpha" />.
              </span>
            </div>
            <div className="shrink-0 font-mono text-zinc-800 dark:text-[#E5C378]">
              <KatexMath math="d \cap \alpha = \{I\} \iff \vec{w} \notin V_\alpha" />
            </div>
          </div>
        )}

        {mode === 'plane-parallel' && (
          <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between">
            <div>
              <span className="font-semibold text-[#6366F1] dark:text-[#A78BFA]">
                Vị trí song song:
              </span>{' '}
              <span className="text-zinc-700 dark:text-zinc-300">
                Đường thẳng <span className="font-serif font-bold italic">d</span> song song với{' '}
                <span className="font-serif font-bold italic">α</span> khi vectơ chỉ phương{' '}
                <KatexMath math="\vec{w} \in V_\alpha" /> nhưng điểm neo{' '}
                <KatexMath math="M_0 \notin \alpha" /> (không có điểm chung{' '}
                <KatexMath math="d \cap \alpha = \emptyset" />
                ).
              </span>
            </div>
            <div className="shrink-0 font-mono text-zinc-800 dark:text-[#E5C378]">
              <KatexMath math="d \parallel \alpha \iff \vec{w} \in V_\alpha \text{ và } M_0 \notin \alpha" />
            </div>
          </div>
        )}

        {caption && (
          <p className="mt-2 border-t border-zinc-200/60 pt-1.5 text-zinc-500 italic dark:border-[#14261D] dark:text-zinc-400">
            {caption}
          </p>
        )}
      </div>
    </figure>
  );
};
