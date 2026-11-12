import { useCallback, useMemo, useState } from 'react';
import { InteractiveVizFrame } from './InteractiveVizFrame';
import {
  composePerm,
  disjointCycles,
  formatCycleNotation,
  generateCyclicSubgroup,
  identityPerm,
  invertPerm,
  permutationOrder,
  permutationSign,
  type Point2D,
} from './viz-math';

type GroupDegree = 3 | 4;

interface PermPreset {
  id: string;
  label: string;
  sigma: number[];
  note?: string;
}

const S3_PRESETS: readonly PermPreset[] = [
  { id: 's3-id', label: 'id', sigma: [1, 2, 3], note: 'Đơn vị' },
  { id: 's3-r', label: 'r = (1 2 3)', sigma: [2, 3, 1], note: 'Quay 120°' },
  { id: 's3-r2', label: 'r² = (1 3 2)', sigma: [3, 1, 2], note: 'Quay 240°' },
  { id: 's3-12', label: 's₃ = (1 2)', sigma: [2, 1, 3], note: 'Đối xứng trục 3' },
  { id: 's3-13', label: 's₂ = (1 3)', sigma: [3, 2, 1], note: 'Đối xứng trục 2' },
  { id: 's3-23', label: 's₁ = (2 3)', sigma: [1, 3, 2], note: 'Đối xứng trục 1' },
];

const S4_PRESETS: readonly PermPreset[] = [
  { id: 's4-id', label: 'id', sigma: [1, 2, 3, 4] },
  { id: 's4-4cycle', label: '(1 2 3 4)', sigma: [2, 3, 4, 1], note: '4-chu trình' },
  { id: 's4-3cycle', label: '(1 2 3)', sigma: [2, 3, 1, 4], note: '3-chu trình ∈ A₄' },
  { id: 's4-transp', label: '(1 2)', sigma: [2, 1, 3, 4], note: 'Chuyển vị lẻ' },
  { id: 'v4-a', label: 'V₄: (1 2)(3 4)', sigma: [2, 1, 4, 3], note: 'Phần tử Klein V₄' },
  { id: 'v4-b', label: 'V₄: (1 3)(2 4)', sigma: [3, 4, 1, 2], note: 'Phần tử Klein V₄' },
  { id: 'v4-c', label: 'V₄: (1 4)(2 3)', sigma: [4, 3, 2, 1], note: 'Phần tử Klein V₄' },
];

const CYCLE_COLORS = ['var(--viz-primary)', 'var(--viz-accent)', 'var(--viz-purple)'];

function getNodePositions(n: GroupDegree): Record<number, Point2D> {
  if (n === 3) {
    return {
      1: { x: 145, y: 58 },
      2: { x: 65, y: 222 },
      3: { x: 225, y: 222 },
    };
  }
  return {
    1: { x: 80, y: 72 },
    2: { x: 210, y: 72 },
    3: { x: 210, y: 218 },
    4: { x: 80, y: 218 },
  };
}

function buildArcPath(from: Point2D, to: Point2D, curveOffset: number): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // Normal perpendicular vector
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * curveOffset;
  const cy = my + ny * curveOffset;

  // Shorten endpoint slightly so arrowhead meets circle edge cleanly
  const r = 21;
  const tx = to.x - cx;
  const ty = to.y - cy;
  const tlen = Math.hypot(tx, ty) || 1;
  const ex = to.x - (tx / tlen) * r;
  const ey = to.y - (ty / tlen) * r;

  const sx = from.x - ((from.x - cx) / (Math.hypot(from.x - cx, from.y - cy) || 1)) * 18;
  const sy = from.y - ((from.y - cy) / (Math.hypot(from.x - cx, from.y - cy) || 1)) * 18;

  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
}

export interface SymmetricGroupCycleVizProps {
  initialDegree?: GroupDegree;
}

export function SymmetricGroupCycleViz({ initialDegree = 3 }: SymmetricGroupCycleVizProps) {
  const [degree, setDegree] = useState<GroupDegree>(initialDegree);
  const [sigma, setSigma] = useState<number[]>(() =>
    initialDegree === 4 ? [2, 1, 4, 3] : [2, 3, 1],
  );
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const presets = degree === 3 ? S3_PRESETS : S4_PRESETS;
  const positions = useMemo(() => getNodePositions(degree), [degree]);

  const switchDegree = useCallback((nextDegree: GroupDegree) => {
    setDegree(nextDegree);
    setSelectedNode(null);
    setSigma(nextDegree === 3 ? [2, 3, 1] : [2, 1, 4, 3]);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedNode(null);
    setSigma(degree === 3 ? [2, 3, 1] : [2, 1, 4, 3]);
  }, [degree]);

  const handleNodeClick = useCallback(
    (node: number) => {
      if (selectedNode === null) {
        setSelectedNode(node);
        return;
      }
      if (selectedNode === node) {
        setSelectedNode(null);
        return;
      }
      // Left-multiply current permutation by transposition (selectedNode node)
      const transp = identityPerm(degree);
      transp[selectedNode - 1] = node;
      transp[node - 1] = selectedNode;
      setSigma((prev) => composePerm(transp, prev));
      setSelectedNode(null);
    },
    [degree, selectedNode],
  );

  const analysis = useMemo(() => {
    const cycles = disjointCycles(sigma);
    const notation = formatCycleNotation(sigma);
    const order = permutationOrder(sigma);
    const sign = permutationSign(sigma);
    const subgroup = generateCyclicSubgroup(sigma);
    const inverse = invertPerm(sigma);
    const inV4 =
      degree === 4 &&
      sign === 1 &&
      (order === 1 || (cycles.length === 2 && cycles[0]?.length === 2));

    // Edge arrows colored per disjoint cycle
    const arrows: Array<{
      id: string;
      path: string;
      color: string;
      marker: string;
    }> = [];

    cycles.forEach((cycle, cIdx) => {
      const color = CYCLE_COLORS[cIdx % CYCLE_COLORS.length]!;
      const marker =
        cIdx % 3 === 0
          ? 'url(#viz-arrow-primary)'
          : cIdx % 3 === 1
            ? 'url(#viz-arrow-accent)'
            : 'url(#viz-arrow-purple)';
      const offset = cycle.length === 2 ? 22 : 16;

      cycle.forEach((fromVal, idx) => {
        const toVal = cycle[(idx + 1) % cycle.length]!;
        const fromPt = positions[fromVal]!;
        const toPt = positions[toVal]!;
        arrows.push({
          id: `${cIdx}-${fromVal}-${toVal}`,
          path: buildArcPath(fromPt, toPt, offset),
          color,
          marker,
        });
      });
    });

    return {
      cycles,
      notation,
      order,
      sign,
      subgroup,
      inverse,
      inV4,
      arrows,
    };
  }, [degree, positions, sigma]);

  const domain = useMemo(() => Array.from({ length: degree }, (_, idx) => idx + 1), [degree]);

  const controls = (
    <>
      <div className="vc-actions" role="group" aria-label="Chọn bậc nhóm đối xứng">
        <button
          type="button"
          className="viz-btn"
          data-active={degree === 3 ? 'true' : 'false'}
          onClick={() => switchDegree(3)}
        >
          Nhóm đối xứng S₃ (|S₃| = 6)
        </button>
        <button
          type="button"
          className="viz-btn"
          data-active={degree === 4 ? 'true' : 'false'}
          onClick={() => switchDegree(4)}
        >
          Nhóm hoán vị S₄ &amp; V₄ (|S₄| = 24)
        </button>
        <button
          type="button"
          className="viz-btn"
          onClick={() => setSigma((prev) => composePerm(prev, prev))}
        >
          Bình phương σ²
        </button>
        <button
          type="button"
          className="viz-btn"
          onClick={() => setSigma((prev) => invertPerm(prev))}
        >
          Nghịch đảo σ⁻¹
        </button>
        {degree === 3 && (
          <button
            type="button"
            className="viz-btn"
            onClick={() => setSigma([2, 3, 1])}
            title="(1 2)∘(1 3) = (1 3 2), trong khi (1 3)∘(1 2) = (1 2 3)"
          >
            Kiểm tra (1 3)∘(1 2)
          </button>
        )}
      </div>

      <div className="vc-actions" role="group" aria-label="Hoán vị mẫu">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="viz-btn"
            data-active={preset.sigma.join(',') === sigma.join(',') ? 'true' : 'false'}
            onClick={() => {
              setSelectedNode(null);
              setSigma(preset.sigma);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </>
  );

  const info = (
    <>
      <div className="vi-metrics">
        <span className="vi-metric">
          <span className="vi-metric-label">Chu trình rời:</span>
          <span className="vi-metric-value" data-testid="perm-cycle-notation">
            σ = {analysis.notation}
          </span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">Cấp ord(σ) =</span>
          <span className="vi-metric-value" data-testid="perm-order">
            {analysis.order}
          </span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">Dấu sgn(σ) =</span>
          <span className="vi-metric-value" data-testid="perm-sign">
            {analysis.sign > 0 ? '+1 (chẵn ∈ A' : '-1 (lẻ ∉ A'}
            {degree})
          </span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">⟨σ⟩ =</span>
          <span className="vi-metric-value" data-testid="perm-subgroup">
            {'{' + analysis.subgroup.map(formatCycleNotation).join(', ') + '}'}
          </span>
        </span>
      </div>

      <p className="vi-note">
        {selectedNode !== null
          ? `Đang chọn đỉnh ${selectedNode}: bấm một đỉnh khác để nhân thêm chuyển vị (${selectedNode} j) từ bên trái.`
          : degree === 4 && analysis.inV4
            ? 'Hoán vị đang chọn thuộc nhóm con chuẩn tắc Klein V₄ = {id, (1 2)(3 4), (1 3)(2 4), (1 4)(2 3)} ◁ A₄ ≤ S₄ (mọi phần tử khác đơn vị có cấp 2).'
            : 'Bấm lần lượt hai đỉnh trên hình để tác động một chuyển vị (i j) từ bên trái, hoặc dùng các nút hoán vị mẫu.'}
      </p>
    </>
  );

  const polygonPoints = domain.map((v) => `${positions[v]!.x},${positions[v]!.y}`).join(' ');

  return (
    <InteractiveVizFrame
      title={`Nhóm hoán vị S${degree === 3 ? '₃' : '₄'}, Chu trình rời & Nhóm con sinh bởi σ`}
      subtitle="Quan sát quỹ đạo chu trình rời, tính chẵn/lẻ và nhóm con cyclic ⟨σ⟩"
      onReset={handleReset}
      svgAriaLabel={`Sơ đồ hoán vị và chu trình rời trong nhóm S${degree}`}
      controls={controls}
      info={info}
      svgChildren={
        <>
          {/* Underlying polygon frame */}
          <polygon
            points={polygonPoints}
            fill="var(--viz-parallelogram)"
            stroke="var(--viz-axis)"
            strokeWidth={1.6}
            strokeDasharray="4 4"
          />

          {/* Diagonals in S4 */}
          {degree === 4 && (
            <>
              <line
                x1={positions[1]!.x}
                y1={positions[1]!.y}
                x2={positions[3]!.x}
                y2={positions[3]!.y}
                stroke="var(--viz-axis)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <line
                x1={positions[2]!.x}
                y1={positions[2]!.y}
                x2={positions[4]!.x}
                y2={positions[4]!.y}
                stroke="var(--viz-axis)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
            </>
          )}

          {/* Disjoint cycle transition arrows */}
          {analysis.arrows.map((arr) => (
            <path
              key={arr.id}
              d={arr.path}
              fill="none"
              stroke={arr.color}
              strokeWidth={2.5}
              markerEnd={arr.marker}
            />
          ))}

          {/* Interactive vertices 1..n */}
          {domain.map((node) => {
            const pt = positions[node]!;
            const isFixed = sigma[node - 1] === node;
            const isPicked = selectedNode === node;
            return (
              <g
                key={node}
                role="button"
                tabIndex={0}
                aria-label={`Đỉnh ${node}, ảnh qua sigma là ${sigma[node - 1]}`}
                className="viz-handle"
                data-testid={`perm-node-${node}`}
                onClick={() => handleNodeClick(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(node);
                  }
                }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={18}
                  fill={
                    isPicked
                      ? 'var(--viz-accent)'
                      : isFixed
                        ? 'var(--viz-secondary)'
                        : 'var(--bg-surface, #ffffff)'
                  }
                  stroke={
                    isPicked
                      ? 'var(--viz-accent)'
                      : isFixed
                        ? 'var(--viz-secondary)'
                        : 'var(--viz-primary)'
                  }
                  strokeWidth={2.4}
                />
                <text
                  x={pt.x}
                  y={pt.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={800}
                  fill={isPicked || isFixed ? '#ffffff' : 'var(--text-main, #0f172a)'}
                >
                  {node}
                </text>
              </g>
            );
          })}

          {/* Right-hand panel: Two-row Cauchy notation table & algebraic readout */}
          <g transform="translate(290, 28)">
            <rect
              x={0}
              y={0}
              width={230}
              height={260}
              rx={12}
              fill="var(--bg-subtle)"
              stroke="var(--border-subtle, #cbd5e1)"
              strokeWidth={1.2}
            />
            <text x={16} y={26} fontSize={12.5} fontWeight={700} fill="var(--text-main, #0f172a)">
              Bảng hai hàng Cauchy (σ)
            </text>

            {/* Matrix columns i -> sigma(i) */}
            {domain.map((i, idx) => {
              const colX = degree === 3 ? 44 + idx * 60 : 34 + idx * 46;
              return (
                <g key={i}>
                  <text
                    x={colX}
                    y={60}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={700}
                    fill="var(--text-muted, #475569)"
                  >
                    {i}
                  </text>
                  <text x={colX} y={80} textAnchor="middle" fontSize={11} fill="var(--viz-axis)">
                    ↓
                  </text>
                  <text
                    x={colX}
                    y={104}
                    textAnchor="middle"
                    fontSize={15}
                    fontWeight={800}
                    fill={sigma[i - 1] === i ? 'var(--viz-secondary)' : 'var(--viz-primary)'}
                  >
                    {sigma[i - 1]}
                  </text>
                </g>
              );
            })}

            <line
              x1={16}
              y1={124}
              x2={214}
              y2={124}
              stroke="var(--border-subtle, #cbd5e1)"
              strokeWidth={1}
            />

            <text x={16} y={148} fontSize={12} fontWeight={600} fill="var(--text-muted, #475569)">
              Phân tích chu trình rời:
            </text>
            <text x={16} y={170} fontSize={15} fontWeight={800} fill="var(--viz-primary)">
              σ = {analysis.notation}
            </text>

            <text x={16} y={198} fontSize={12} fontWeight={600} fill="var(--text-muted, #475569)">
              Nghịch đảo σ⁻¹ = {formatCycleNotation(analysis.inverse)}
            </text>
            <text x={16} y={222} fontSize={12} fontWeight={600} fill="var(--text-main, #0f172a)">
              Cấp: ord(σ) = {analysis.order} | sgn = {analysis.sign > 0 ? '+1' : '-1'}
            </text>
            <text
              x={16}
              y={244}
              fontSize={11.5}
              fontWeight={700}
              fill={analysis.sign > 0 ? 'var(--viz-secondary)' : 'var(--viz-accent)'}
            >
              {analysis.sign > 0
                ? `Hoán vị chẵn (thuộc A${degree === 3 ? '₃' : '₄'})`
                : `Hoán vị lẻ (ngoài A${degree === 3 ? '₃' : '₄'})`}
            </text>
          </g>
        </>
      }
    />
  );
}
