import { useEffect, useRef, useState } from 'react';
import { Network } from 'lucide-react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

interface AnchorSubjectNode {
  readonly id: 'CTDS' | 'HHAVE' | 'GTHMB' | 'GDH';
  readonly shortLabel: string;
  readonly nx: number;
  readonly ny: number;
  readonly color: string;
  readonly bg: string;
}

export interface KnowledgeBridgeNode {
  readonly id: string;
  readonly shortLabel: string;
  readonly title: string;
  readonly relationLabel: string;
  readonly explanation: string;
  readonly targets: readonly ('CTDS' | 'HHAVE' | 'GTHMB' | 'GDH')[];
  readonly nx: number;
  readonly ny: number;
  readonly color: string;
  readonly pillActiveClass: string;
  readonly phase: number;
}

const ANCHOR_SUBJECTS: readonly AnchorSubjectNode[] = [
  { id: 'CTDS', shortLabel: 'CTĐS', nx: 0.16, ny: 0.22, color: '#6B5335', bg: '#F3F0E8' },
  { id: 'HHAVE', shortLabel: 'HHAVE', nx: 0.83, ny: 0.22, color: '#2D5266', bg: '#ECF1F4' },
  { id: 'GTHMB', shortLabel: 'GTHMB', nx: 0.82, ny: 0.8, color: '#245746', bg: '#EBF2EE' },
  { id: 'GDH', shortLabel: 'GDH', nx: 0.16, ny: 0.8, color: '#7A463B', bg: '#F3ECE9' },
];

const KNOWLEDGE_BRIDGE_NODES: readonly KnowledgeBridgeNode[] = [
  {
    id: 'equiv-quotient',
    shortLabel: 'Tập thương',
    title: 'Quan hệ tương đương & Tập thương',
    relationLabel: 'CTĐS ↔ HHAVE',
    explanation:
      'Phân hoạch lớp tương đương và nhóm thương G / ker φ là nền tảng đại số xây dựng không gian thương V / W và các lớp song song trong Hình học Affine.',
    targets: ['CTDS', 'HHAVE'],
    nx: 0.49,
    ny: 0.15,
    color: '#6B5335',
    pillActiveClass: 'border-[#6B5335] bg-[#F3F0E8] text-[#6B5335]',
    phase: 0.2,
  },
  {
    id: 'isometry-group',
    shortLabel: 'Đẳng cự',
    title: 'Nhóm biến hình & Đẳng cự',
    relationLabel: 'CTĐS ↔ HHAVE',
    explanation:
      'Theo Chương trình Erlangen của Felix Klein, nhóm đối xứng GL(n), nhóm trực giao O(n) và nhóm Affine phân loại các phép biến đổi và bất biến hình học.',
    targets: ['CTDS', 'HHAVE'],
    nx: 0.5,
    ny: 0.34,
    color: '#2D5266',
    pillActiveClass: 'border-[#2D5266] bg-[#ECF1F4] text-[#2D5266]',
    phase: 1.4,
  },
  {
    id: 'polynomial-series',
    shortLabel: 'Đa thức & Chuỗi',
    title: 'Vành đa thức & Chuỗi lũy thừa',
    relationLabel: 'CTĐS ↔ GTHMB',
    explanation:
      'Cấu trúc vành đa thức K[X] và công thức chia có dư chuẩn hóa cầu nối trực tiếp sang xấp xỉ đa thức Taylor và bán kính hội tụ trong Giải tích.',
    targets: ['CTDS', 'GTHMB'],
    nx: 0.56,
    ny: 0.55,
    color: '#8C6D3F',
    pillActiveClass: 'border-[#8C6D3F] bg-[#F3F0E8] text-[#6B5335]',
    phase: 2.6,
  },
  {
    id: 'metric-euclide',
    shortLabel: 'Metric Euclide',
    title: 'Cấu trúc Không gian Metric / Euclide',
    relationLabel: 'HHAVE ↔ GTHMB',
    explanation:
      'Chuẩn vector và tích vô hướng Euclide từ hình học mở rộng thành khoảng cách metric, tôpô mở, dãy Cauchy và định lý giá trị trung bình nhiều chiều.',
    targets: ['HHAVE', 'GTHMB'],
    nx: 0.84,
    ny: 0.51,
    color: '#245746',
    pillActiveClass: 'border-[#245746] bg-[#EBF2EE] text-[#245746]',
    phase: 3.7,
  },
  {
    id: 'axiomatic-pedagogy',
    shortLabel: 'Sư phạm Tiên đề',
    title: 'Tư duy Tiên đề & Sư phạm Toán',
    relationLabel: 'Toán học ↔ GDH',
    explanation:
      'Chuyển hóa sư phạm biến các cấu trúc tiên đề trừu tượng (nhóm, giới hạn ε-δ, phép dời hình) thành tình huống gợi vấn đề và trực quan cho học sinh phổ thông.',
    targets: ['CTDS', 'HHAVE', 'GTHMB', 'GDH'],
    nx: 0.31,
    ny: 0.62,
    color: '#7A463B',
    pillActiveClass: 'border-[#7A463B] bg-[#F3ECE9] text-[#7A463B]',
    phase: 4.8,
  },
];

/**
 * Mô hình 2 (Cột phải - Quỹ đạo học tập cá nhân):
 * Mạng Lưới Liên Kết Tri Thức Liên Môn (Interactive Node-Link Graph 120fps)
 * thể hiện giao thoa kiến thức Toán học — Khoa học Giáo dục.
 */
export function KnowledgeConstellationCard() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedIdRef = useRef<string>(KNOWLEDGE_BRIDGE_NODES[0]!.id);
  const [selectedId, setSelectedId] = useState<string>(KNOWLEDGE_BRIDGE_NODES[0]!.id);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(240, container.clientWidth || 320);
    let height = Math.max(200, container.clientHeight || 228);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(240, container.clientWidth || 320);
      height = Math.max(200, container.clientHeight || 228);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    let rafId = 0;
    let isVisible = true;
    let elapsed = 0;
    let prevNow = performance.now();

    const getBridgePos = (node: KnowledgeBridgeNode, time: number) => ({
      x: node.nx * width + Math.cos(time * 1.15 + node.phase) * 3.5,
      y: node.ny * height + Math.sin(time * 1.35 + node.phase) * 3.5,
    });

    const getAnchorPos = (anchor: AnchorSubjectNode) => ({
      x: anchor.nx * width,
      y: anchor.ny * height,
    });

    const drawGraph = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const activeId = selectedIdRef.current;
      const activeBridge = KNOWLEDGE_BRIDGE_NODES.find((b) => b.id === activeId);
      const anchorPositions = new Map(ANCHOR_SUBJECTS.map((a) => [a.id, getAnchorPos(a)]));

      // Helper pElbow từ diagram.js: tuyến bo góc vuông kỹ thuật có bán kính uốn r
      const traceRoundedElbow = (x1: number, y1: number, x2: number, y2: number, r = 8) => {
        const mx = (x1 + x2) * 0.5;
        const dx = Math.abs(mx - x1);
        const dy = Math.abs(y2 - y1);
        const rr = Math.min(r, dx, dy * 0.5);
        const sx = mx >= x1 ? 1 : -1;
        const sy = y2 >= y1 ? 1 : -1;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        if (rr < 1) {
          ctx.lineTo(mx, y1);
          ctx.lineTo(mx, y2);
          ctx.lineTo(x2, y2);
          return;
        }
        ctx.lineTo(mx - sx * rr, y1);
        ctx.quadraticCurveTo(mx, y1, mx, y1 + sy * rr);
        ctx.lineTo(mx, y2 - sy * rr);
        ctx.quadraticCurveTo(mx, y2, mx + sx * rr, y2);
        ctx.lineTo(x2, y2);
      };

      // 1. Mạng bus chữ thập trung tâm & đường pElbow nối tâm tọa độ ra 4 học phần (truyền xung dashed động)
      const cxMid = width * 0.5;
      const cyMid = height * 0.5;
      for (const anchor of ANCHOR_SUBJECTS) {
        const pt = anchorPositions.get(anchor.id)!;
        const isLinked = activeBridge ? activeBridge.targets.includes(anchor.id) : true;
        traceRoundedElbow(cxMid, cyMid, pt.x, pt.y, 10);
        ctx.strokeStyle = isLinked ? `${anchor.color}66` : 'rgba(74, 93, 88, 0.14)';
        ctx.lineWidth = isLinked ? 1.25 : 0.9;
        ctx.setLineDash([4, 8]);
        ctx.lineDashOffset = isLinked ? -time * 20 : 0;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      // Vòng nối ngoại vi nhẹ giữa 4 học phần
      ctx.strokeStyle = 'rgba(74, 93, 88, 0.14)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      const cornerOrder: readonly ('CTDS' | 'HHAVE' | 'GTHMB' | 'GDH')[] = [
        'CTDS',
        'HHAVE',
        'GTHMB',
        'GDH',
      ];
      ctx.beginPath();
      cornerOrder.forEach((id, idx) => {
        const pt = anchorPositions.get(id)!;
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Vẽ các đường cong Cubic Bezier (taste-skill diagram.js pCurve) nối nút cầu nối tri thức tới các môn học liên quan
      for (const bridge of KNOWLEDGE_BRIDGE_NODES) {
        const bPos = getBridgePos(bridge, time);
        const isActive = bridge.id === activeId;

        bridge.targets.forEach((targetId, tIdx) => {
          const targetAnchor = ANCHOR_SUBJECTS.find((a) => a.id === targetId);
          const aPos = anchorPositions.get(targetId);
          if (!aPos || !targetAnchor) return;

          // Thuật toán pCurve (diagram.js): đường cong Cubic Bezier S-curve mượt với cổng kết nối dg-port
          const dx = aPos.x - bPos.x;
          const dy = aPos.y - bPos.y;
          const dist = Math.hypot(dx, dy) || 1;
          // Điểm cổng kết nối (dg-port) cách tâm nút học phần 16px
          const portX = aPos.x - (dx / dist) * 16;
          const portY = aPos.y - (dy / dist) * 16;

          const bendOffset = (tIdx % 2 === 0 ? -1 : 1) * 10;
          const kx = (portX - bPos.x) * 0.48;
          const cp1x = bPos.x + kx;
          const cp1y = bPos.y + bendOffset;
          const cp2x = portX - kx;
          const cp2y = portY - bendOffset * 0.5;

          // Vẽ đường dẫn cơ sở (.dg-line)
          ctx.beginPath();
          ctx.moveTo(bPos.x, bPos.y);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, portX, portY);
          ctx.strokeStyle = isActive ? bridge.color : 'rgba(74, 93, 88, 0.22)';
          ctx.globalAlpha = isActive ? 0.36 : 0.28;
          ctx.lineWidth = isActive ? 1.45 : 1.0;
          ctx.stroke();

          // Dải dòng dữ liệu truyền liên tục (stroke-dashoffset stream trên nhánh đang kích hoạt)
          if (isActive) {
            ctx.beginPath();
            ctx.moveTo(bPos.x, bPos.y);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, portX, portY);
            ctx.strokeStyle = targetAnchor.color;
            ctx.globalAlpha = 0.72;
            ctx.lineWidth = 1.65;
            ctx.setLineDash([5, 11]);
            ctx.lineDashOffset = -time * 28;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;
          }

          // Cổng kết nối .dg-port tại điểm tiếp xúc nút học phần
          ctx.beginPath();
          ctx.arc(portX, portY, isActive ? 2.6 : 1.7, 0, Math.PI * 2);
          ctx.fillStyle = '#FAFBF9';
          ctx.fill();
          ctx.strokeStyle = isActive ? targetAnchor.color : 'rgba(74, 93, 88, 0.38)';
          ctx.lineWidth = 1.1;
          ctx.stroke();

          // Xung truyền dữ liệu phát sáng 120fps (.dg-glow + .dg-comet + .dg-spark) chạy dọc dây dẫn
          const cycleSec = isActive ? 2.6 : 4.2;
          const phaseShift = tIdx * 0.58 + bridge.phase * 0.4;
          const u = ((time + phaseShift) % cycleSec) / cycleSec;
          const evalCubic = (tVal: number) => {
            const inv = 1 - tVal;
            const c0 = inv * inv * inv;
            const c1 = 3 * inv * inv * tVal;
            const c2 = 3 * inv * tVal * tVal;
            const c3 = tVal * tVal * tVal;
            return {
              x: c0 * bPos.x + c1 * cp1x + c2 * cp2x + c3 * portX,
              y: c0 * bPos.y + c1 * cp1y + c2 * cp2y + c3 * portY,
            };
          };

          const headPt = evalCubic(u);
          const tailPt = evalCubic(Math.max(0, u - (isActive ? 0.28 : 0.18)));

          const cometGrad = ctx.createLinearGradient(tailPt.x, tailPt.y, headPt.x, headPt.y);
          cometGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          cometGrad.addColorStop(0.5, `${bridge.color}${isActive ? '99' : '44'}`);
          cometGrad.addColorStop(1, targetAnchor.color);

          // Dải sáng quầng rộng (.dg-glow) dưới xung chạy dọc dây dẫn
          if (isActive) {
            ctx.globalAlpha = 0.24;
            ctx.beginPath();
            ctx.moveTo(tailPt.x, tailPt.y);
            ctx.lineTo(headPt.x, headPt.y);
            ctx.strokeStyle = targetAnchor.color;
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          ctx.globalAlpha = isActive ? 0.96 : 0.48;
          ctx.beginPath();
          ctx.moveTo(tailPt.x, tailPt.y);
          ctx.lineTo(headPt.x, headPt.y);
          ctx.strokeStyle = cometGrad;
          ctx.lineWidth = isActive ? 2.4 : 1.5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Quầng sáng đầu xung .dg-spark-halo & .dg-spark
          ctx.globalAlpha = isActive ? 1 : 0.55;
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, isActive ? 5.2 : 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `${targetAnchor.color}33`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, isActive ? 3.0 : 1.9, 0, Math.PI * 2);
          ctx.fillStyle = targetAnchor.color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, isActive ? 1.35 : 0.85, 0, Math.PI * 2);
          ctx.fillStyle = '#FAFBF9';
          ctx.fill();
        });
      }
      ctx.globalAlpha = 1;

      // 3. Vẽ 4 nút Học phần (Subject Anchor Hubs) kèm lan tỏa is-hit theo nhánh liên kết
      for (const anchor of ANCHOR_SUBJECTS) {
        const pos = anchorPositions.get(anchor.id)!;
        const isLinked = activeBridge ? activeBridge.targets.includes(anchor.id) : true;

        if (isLinked) {
          const glow = ctx.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, 26);
          glow.addColorStop(0, `${anchor.color}36`);
          glow.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 26, 0, Math.PI * 2);
          ctx.fill();

          // Vòng cộng hưởng ngoại vi xung quanh các Anchor được liên kết (is-hit halo)
          const pulsePhase = (time * 1.1) % 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 17 + pulsePhase * 7, 0, Math.PI * 2);
          ctx.strokeStyle = anchor.color;
          ctx.globalAlpha = Math.max(0, (1 - pulsePhase) * 0.42);
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = isLinked ? anchor.bg : '#F2F4F3';
        ctx.fill();
        ctx.strokeStyle = anchor.color;
        ctx.globalAlpha = isLinked ? 1 : 0.4;
        ctx.lineWidth = isLinked ? 1.8 : 1.1;
        ctx.stroke();

        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = anchor.color;
        ctx.fillText(anchor.shortLabel, pos.x, pos.y);
      }
      ctx.globalAlpha = 1;

      // 4. Vẽ 5 nút Cầu nối Liên môn
      for (const bridge of KNOWLEDGE_BRIDGE_NODES) {
        const bPos = getBridgePos(bridge, time);
        const isActive = bridge.id === activeId;

        if (isActive) {
          const halo = ctx.createRadialGradient(bPos.x, bPos.y, 2, bPos.x, bPos.y, 18);
          halo.addColorStop(0, `${bridge.color}40`);
          halo.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(bPos.x, bPos.y, 18, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(bPos.x, bPos.y, isActive ? 6.2 : 4.4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? bridge.color : '#FAFBF9';
        ctx.fill();
        ctx.strokeStyle = bridge.color;
        ctx.lineWidth = isActive ? 2 : 1.4;
        ctx.stroke();

        if (isActive) {
          ctx.beginPath();
          ctx.arc(bPos.x, bPos.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#FAFBF9';
          ctx.fill();
        }

        ctx.font = `${isActive ? '700' : '600'} 9.5px "Be Vietnam Pro", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const isDarkDoc =
          typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        ctx.fillStyle = isActive
          ? isDarkDoc
            ? '#EFF4F2'
            : '#182624'
          : isDarkDoc
            ? '#9EB0AA'
            : '#4A5D58';
        ctx.fillText(bridge.shortLabel, bPos.x, bPos.y + 9);
      }

      ctx.restore();
    };

    const pickNearestBridge = (px: number, py: number): string | null => {
      let bestId: string | null = null;
      let bestDist = 30;
      for (const bridge of KNOWLEDGE_BRIDGE_NODES) {
        const pos = getBridgePos(bridge, elapsed);
        const d = Math.hypot(px - pos.x, py - pos.y);
        if (d < bestDist) {
          bestDist = d;
          bestId = bridge.id;
        }
      }
      return bestId;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const found = pickNearestBridge(event.clientX - rect.left, event.clientY - rect.top);
      container.style.cursor = found ? 'pointer' : 'default';
      if (found && found !== selectedIdRef.current) {
        setSelectedId(found);
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const found = pickNearestBridge(event.clientX - rect.left, event.clientY - rect.top);
      if (found) setSelectedId(found);
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => resize());
      ro.observe(container);
    }

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      io.observe(container);
    }

    drawGraph(0.6);
    if (prefersReducedMotion) {
      return () => {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('click', handleClick);
        ro?.disconnect();
        io?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtSeconds;
        drawGraph(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [prefersReducedMotion]);

  const activeBridge =
    KNOWLEDGE_BRIDGE_NODES.find((item) => item.id === selectedId) ?? KNOWLEDGE_BRIDGE_NODES[0]!;

  return (
    <div
      data-testid="knowledge-constellation-card"
      className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-6"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--accent-os)]">
            GIAO THOA LIÊN MÔN
          </span>
          <Network className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
        </div>

        <h3 className="font-serif text-lg font-bold text-[var(--text-main)] sm:text-xl">
          Mạng Lưới Liên Kết Tri Thức
        </h3>

        {/* Đồ thị Mạng lưới Tri thức Canvas 120fps */}
        <div
          ref={containerRef}
          className="relative h-[222px] w-full overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]"
        >
          <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
        </div>

        {/* Các nút cầu nối tri thức để chọn / chạm trực tiếp */}
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Chọn điểm giao thoa tri thức"
        >
          {KNOWLEDGE_BRIDGE_NODES.map((bridge) => {
            const isActive = bridge.id === activeBridge.id;
            return (
              <button
                key={bridge.id}
                type="button"
                data-testid={`constellation-node-${bridge.id}`}
                onMouseEnter={() => setSelectedId(bridge.id)}
                onClick={() => setSelectedId(bridge.id)}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none',
                  isActive
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]',
                )}
              >
                <span
                  className="relative flex h-2 w-2 items-center justify-center"
                  aria-hidden="true"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: isActive ? '#FFFFFF' : bridge.color }}
                  />
                </span>
                <span>{bridge.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hộp giải thích ngắn gọn sự giao thoa kiến thức giữa các môn */}
      <div
        data-testid="constellation-insight-panel"
        className="mt-3 space-y-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3.5 py-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--text-main)]">{activeBridge.title}</span>
          <span className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--accent-heritage)]">
            {activeBridge.relationLabel}
          </span>
        </div>
        <p className="text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
          {activeBridge.explanation}
        </p>
      </div>
    </div>
  );
}
