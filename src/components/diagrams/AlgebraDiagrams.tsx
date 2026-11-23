import { useId } from 'react';

export type DiagramTone = 'neutral' | 'primary' | 'heritage' | 'ctds' | 'hhave' | 'gthmb' | 'gdh';

interface ToneTokens {
  readonly stroke: string;
  readonly fill: string;
  readonly tintOpacity: number;
  readonly label: string;
}

const TONE_MAP: Record<DiagramTone, ToneTokens> = {
  neutral: {
    stroke: 'var(--border-strong)',
    fill: 'var(--bg-workspace)',
    tintOpacity: 0,
    label: 'var(--text-secondary)',
  },
  primary: {
    stroke: 'var(--accent-os)',
    fill: 'var(--accent-os)',
    tintOpacity: 0.08,
    label: 'var(--accent-os)',
  },
  heritage: {
    stroke: 'var(--accent-heritage)',
    fill: 'var(--accent-heritage)',
    tintOpacity: 0.1,
    label: 'var(--accent-heritage)',
  },
  ctds: {
    stroke: 'var(--mineral-ctds)',
    fill: 'var(--mineral-ctds)',
    tintOpacity: 0.1,
    label: 'var(--mineral-ctds)',
  },
  hhave: {
    stroke: 'var(--mineral-hhave)',
    fill: 'var(--mineral-hhave)',
    tintOpacity: 0.1,
    label: 'var(--mineral-hhave)',
  },
  gthmb: {
    stroke: 'var(--mineral-gthmb)',
    fill: 'var(--mineral-gthmb)',
    tintOpacity: 0.1,
    label: 'var(--mineral-gthmb)',
  },
  gdh: {
    stroke: 'var(--mineral-gdh)',
    fill: 'var(--mineral-gdh)',
    tintOpacity: 0.1,
    label: 'var(--mineral-gdh)',
  },
};

const FONT_SANS = "'Be Vietnam Pro', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

function SvgArrowDefs({ prefix }: { readonly prefix: string }) {
  const markers: readonly { id: string; color: string }[] = [
    { id: 'muted', color: 'var(--text-secondary)' },
    { id: 'primary', color: 'var(--accent-os)' },
    { id: 'heritage', color: 'var(--accent-heritage)' },
    { id: 'ctds', color: 'var(--mineral-ctds)' },
    { id: 'hhave', color: 'var(--mineral-hhave)' },
    { id: 'gthmb', color: 'var(--mineral-gthmb)' },
    { id: 'gdh', color: 'var(--mineral-gdh)' },
  ];

  return (
    <defs>
      {markers.map((marker) => (
        <marker
          key={marker.id}
          id={`${prefix}-arrow-${marker.id}`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill={marker.color} />
        </marker>
      ))}
    </defs>
  );
}

interface NodeBoxProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly subtitle?: string;
  readonly detail?: string;
  readonly tone?: DiagramTone;
  readonly emphasis?: boolean;
  readonly titleSize?: number;
  readonly subtitleSize?: number;
  readonly monoTitle?: boolean;
}

function NodeBox({
  x,
  y,
  width,
  height,
  title,
  subtitle,
  detail,
  tone = 'neutral',
  emphasis = false,
  titleSize = 13,
  subtitleSize = 11,
  monoTitle = false,
}: NodeBoxProps) {
  const palette = TONE_MAP[tone];
  const cx = x + width / 2;
  const lineCount = 1 + (subtitle ? 1 : 0) + (detail ? 1 : 0);

  const titleY =
    lineCount === 1
      ? y + height / 2 + titleSize * 0.35
      : lineCount === 2
        ? y + height / 2 - 4
        : y + height / 2 - 12;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill="var(--bg-workspace)"
        stroke={palette.stroke}
        strokeWidth={emphasis ? 1.85 : 1.25}
      />
      {palette.tintOpacity > 0 && (
        <rect
          x={x + 1}
          y={y + 1}
          width={width - 2}
          height={height - 2}
          rx={11}
          fill={palette.fill}
          fillOpacity={palette.tintOpacity}
        />
      )}
      <text
        x={cx}
        y={titleY}
        textAnchor="middle"
        fill="var(--text-main)"
        fontFamily={monoTitle ? FONT_MONO : FONT_SANS}
        fontSize={titleSize}
        fontWeight={emphasis ? 700 : 600}
      >
        {title}
      </text>
      {subtitle && (
        <text
          x={cx}
          y={titleY + (lineCount === 2 ? 17 : 16)}
          textAnchor="middle"
          fill={tone === 'neutral' ? 'var(--text-secondary)' : palette.label}
          fontFamily={FONT_SANS}
          fontSize={subtitleSize}
          fontWeight={500}
        >
          {subtitle}
        </text>
      )}
      {detail && (
        <text
          x={cx}
          y={titleY + 32}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontFamily={FONT_SANS}
          fontSize={10.5}
          fontWeight={500}
        >
          {detail}
        </text>
      )}
    </g>
  );
}

interface EdgePillProps {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly width: number;
  readonly tone?: DiagramTone;
}

function EdgePill({ x, y, text, width, tone = 'neutral' }: EdgePillProps) {
  const palette = TONE_MAP[tone];
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - 11}
        width={width}
        height={22}
        rx={11}
        fill="var(--bg-surface)"
        stroke={tone === 'neutral' ? 'var(--border-hairline)' : palette.stroke}
        strokeWidth={1}
      />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fill={tone === 'neutral' ? 'var(--text-secondary)' : palette.label}
        fontFamily={FONT_SANS}
        fontSize={10.5}
        fontWeight={600}
      >
        {text}
      </text>
    </g>
  );
}

interface ClusterBoxProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly label: string;
  readonly tone: DiagramTone;
}

function ClusterBox({ x, y, width, height, label, tone }: ClusterBoxProps) {
  const palette = TONE_MAP[tone];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={16}
        fill="var(--bg-surface)"
        stroke={palette.stroke}
        strokeOpacity={0.45}
        strokeWidth={1.2}
      />
      <rect x={x} y={y} width={width} height={30} rx={16} fill={palette.fill} fillOpacity={0.09} />
      <rect x={x} y={y + 18} width={width} height={12} fill={palette.fill} fillOpacity={0.09} />
      <line
        x1={x}
        y1={y + 30}
        x2={x + width}
        y2={y + 30}
        stroke={palette.stroke}
        strokeOpacity={0.25}
        strokeWidth={1}
      />
      <text
        x={x + 16}
        y={y + 19.5}
        fill={palette.label}
        fontFamily={FONT_SANS}
        fontSize={11.5}
        fontWeight={700}
        letterSpacing="0.02em"
      >
        {label}
      </text>
    </g>
  );
}

/* ============================================================================
   1 & 2. MẠNG NHÓM CON CYCLIC: Z/12Z (#3) & Z/20Z (#5)
   ============================================================================ */

interface CyclicLatticeDiagramProps {
  readonly topLabel: string;
  readonly topOrder: string;
  readonly leftUpper: { readonly label: string; readonly order: string };
  readonly rightUpper: { readonly label: string; readonly order: string };
  readonly leftLower: { readonly label: string; readonly order: string };
  readonly rightLower: { readonly label: string; readonly order: string };
  readonly bottomLabel: string;
  readonly bottomOrder: string;
  readonly ariaLabel: string;
}

function CyclicLatticeDiagram({
  topLabel,
  topOrder,
  leftUpper,
  rightUpper,
  leftLower,
  rightLower,
  bottomLabel,
  bottomOrder,
  ariaLabel,
}: CyclicLatticeDiagramProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;

  return (
    <svg
      viewBox="0 0 600 390"
      role="img"
      aria-label={ariaLabel}
      className="mx-auto block h-auto w-full max-w-[580px]"
    >
      <SvgArrowDefs prefix={uid} />

      {/* Các cạnh bao hàm từ trên xuống dưới */}
      <g stroke="var(--text-secondary)" strokeWidth={1.5} fill="none">
        {/* G -> leftUpper & rightUpper */}
        <line x1={270} y1={72} x2={196} y2={116} markerEnd={arrow} />
        <line x1={330} y1={72} x2={404} y2={116} markerEnd={arrow} />
        {/* leftUpper -> leftLower & rightLower */}
        <line x1={170} y1={172} x2={170} y2={216} markerEnd={arrow} />
        <line x1={222} y1={172} x2={376} y2={216} markerEnd={arrow} />
        {/* rightUpper -> rightLower */}
        <line x1={430} y1={172} x2={430} y2={216} markerEnd={arrow} />
        {/* leftLower & rightLower -> bottom */}
        <line x1={196} y1={272} x2={270} y2={316} markerEnd={arrow} />
        <line x1={404} y1={272} x2={330} y2={316} markerEnd={arrow} />
      </g>

      {/* 6 nút mạng nhóm con */}
      <NodeBox
        x={210}
        y={18}
        width={180}
        height={54}
        title={topLabel}
        subtitle={topOrder}
        tone="hhave"
        emphasis
        titleSize={14}
      />
      <NodeBox
        x={88}
        y={118}
        width={164}
        height={54}
        title={leftUpper.label}
        subtitle={leftUpper.order}
        tone="primary"
      />
      <NodeBox
        x={348}
        y={118}
        width={164}
        height={54}
        title={rightUpper.label}
        subtitle={rightUpper.order}
        tone="primary"
      />
      <NodeBox
        x={88}
        y={218}
        width={164}
        height={54}
        title={leftLower.label}
        subtitle={leftLower.order}
        tone="neutral"
      />
      <NodeBox
        x={348}
        y={218}
        width={164}
        height={54}
        title={rightLower.label}
        subtitle={rightLower.order}
        tone="neutral"
      />
      <NodeBox
        x={210}
        y={318}
        width={180}
        height={54}
        title={bottomLabel}
        subtitle={bottomOrder}
        tone="heritage"
      />
    </svg>
  );
}

export function Z12SubgroupLatticeSvg() {
  return (
    <CyclicLatticeDiagram
      topLabel="ℤ/12ℤ"
      topOrder="cấp 12"
      leftUpper={{ label: '⟨[2]⟩', order: 'cấp 6' }}
      rightUpper={{ label: '⟨[3]⟩', order: 'cấp 4' }}
      leftLower={{ label: '⟨[4]⟩', order: 'cấp 3' }}
      rightLower={{ label: '⟨[6]⟩', order: 'cấp 2' }}
      bottomLabel="{[0]}"
      bottomOrder="cấp 1"
      ariaLabel="Mạng nhóm con của nhóm cyclic Z/12Z"
    />
  );
}

export function Z20SubgroupLatticeSvg() {
  return (
    <CyclicLatticeDiagram
      topLabel="ℤ/20ℤ"
      topOrder="cấp 20"
      leftUpper={{ label: '⟨[2]⟩', order: 'cấp 10' }}
      rightUpper={{ label: '⟨[5]⟩', order: 'cấp 4' }}
      leftLower={{ label: '⟨[4]⟩', order: 'cấp 5' }}
      rightLower={{ label: '⟨[10]⟩', order: 'cấp 2' }}
      bottomLabel="{[0]}"
      bottomOrder="cấp 1"
      ariaLabel="Mạng nhóm con của nhóm cyclic Z/20Z"
    />
  );
}

/* ============================================================================
   3. BẢN ĐỒ TỔNG KẾT CHƯƠNG 2 — NHÓM CON & NHÓM CYCLIC (#4)
   ============================================================================ */

export function Chapter2CyclicMapSvg() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;
  const arrowAccent = `url(#${uid}-arrow-primary)`;

  return (
    <svg
      viewBox="0 0 760 660"
      role="img"
      aria-label="Sơ đồ tổng kết Chương 2: Nhóm con, nhóm con sinh, nhóm cyclic và cấp phần tử"
      className="mx-auto block h-auto w-full max-w-[740px]"
    >
      <SvgArrowDefs prefix={uid} />

      {/* Mũi tên dọc chuỗi chính */}
      <g stroke="var(--text-secondary)" strokeWidth={1.5} fill="none">
        <line x1={380} y1={62} x2={380} y2={106} markerEnd={arrow} />
        <line x1={380} y1={154} x2={380} y2={198} markerEnd={arrow} />
        <line x1={380} y1={246} x2={380} y2={290} markerEnd={arrow} />
        <line x1={380} y1={340} x2={380} y2={384} markerEnd={arrow} />
      </g>

      {/* Rẽ nhánh ord(a) vô hạn / hữu hạn */}
      <g stroke="var(--accent-os)" strokeWidth={1.6} fill="none">
        <path d="M 320 434 C 245 450, 200 462, 195 496" markerEnd={arrowAccent} />
        <path d="M 440 434 C 515 450, 560 462, 565 496" markerEnd={arrowAccent} />
        <line x1={565} y1={550} x2={565} y2={596} markerEnd={arrowAccent} />
      </g>

      {/* Các nút tầng 1 -> 5 */}
      <NodeBox x={240} y={14} width={280} height={48} title="Tập con H ⊆ G" tone="neutral" />
      <EdgePill x={380} y={84} width={228} text="Tiêu chuẩn rút gọn: xy⁻¹ ∈ H" />

      <NodeBox x={240} y={108} width={280} height={46} title="Nhóm con H ≤ G" tone="neutral" />
      <EdgePill x={380} y={176} width={228} text="Giao của mọi nhóm con chứa S" />

      <NodeBox x={230} y={200} width={300} height={46} title="Nhóm con sinh ⟨S⟩" tone="neutral" />
      <EdgePill x={380} y={268} width={246} text="Trường hợp S = {a} (một phần tử)" />

      <NodeBox
        x={190}
        y={292}
        width={380}
        height={48}
        title="Nhóm con cyclic ⟨a⟩ = {aᵏ | k ∈ ℤ}"
        tone="hhave"
        emphasis
      />
      <EdgePill x={380} y={362} width={216} text="Số nguyên dương nhỏ nhất aⁿ = e" />

      <NodeBox
        x={205}
        y={386}
        width={350}
        height={48}
        title="Cấp của phần tử: ord(a) = |⟨a⟩|"
        tone="gthmb"
        emphasis
      />

      {/* Nhãn nhánh */}
      <EdgePill x={228} y={466} width={104} text="ord(a) = ∞" tone="heritage" />
      <EdgePill x={532} y={466} width={124} text="ord(a) = n < ∞" tone="heritage" />

      {/* 2 mô hình phân loại */}
      <NodeBox
        x={44}
        y={498}
        width={302}
        height={52}
        title="Mô hình vô hạn"
        subtitle="⟨a⟩ ≅ (ℤ, +)"
        tone="heritage"
      />
      <NodeBox
        x={414}
        y={498}
        width={302}
        height={52}
        title="Mô hình hữu hạn"
        subtitle="⟨a⟩ ≅ (ℤ/nℤ, +)"
        tone="heritage"
      />

      {/* Nhãn và nút mạng nhóm con */}
      <EdgePill
        x={565}
        y={573}
        width={316}
        text="Mỗi ước d | n cho duy nhất 1 nhóm con cấp d"
        tone="ctds"
      />
      <NodeBox
        x={404}
        y={598}
        width={322}
        height={50}
        title="Mạng nhóm con H_d = ⟨aⁿᐟᵈ⟩"
        tone="ctds"
        emphasis
      />
    </svg>
  );
}

/* ============================================================================
   4. THANG BẬC CẤU TRÚC VÀNH (#8)
   ============================================================================ */

export function RingStructureHierarchySvg() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;

  return (
    <svg
      viewBox="0 0 740 475"
      role="img"
      aria-label="Thang bậc bao hàm cấu trúc vành: Trường, Miền nguyên, Vành chia, Vành giao hoán có 1, Vành có 1, Vành tổng quát"
      className="mx-auto block h-auto w-full max-w-[720px]"
    >
      <SvgArrowDefs prefix={uid} />

      <g stroke="var(--text-secondary)" strokeWidth={1.55} fill="none">
        {/* Field -> Domain & DivRing */}
        <path d="M 310 74 L 210 118" markerEnd={arrow} />
        <path d="M 430 74 L 530 118" markerEnd={arrow} />
        {/* Domain -> CommRing1 */}
        <line x1={195} y1={178} x2={195} y2={220} markerEnd={arrow} />
        {/* CommRing1 -> Ring1 & DivRing -> Ring1 */}
        <path d="M 240 272 L 335 312" markerEnd={arrow} />
        <path d="M 545 178 C 545 248, 470 285, 415 312" markerEnd={arrow} />
        {/* Ring1 -> Ring */}
        <line x1={370} y1={362} x2={370} y2={402} markerEnd={arrow} />
      </g>

      <NodeBox
        x={180}
        y={16}
        width={380}
        height={58}
        title="TRƯỜNG (Field)"
        subtitle="Giao hoán, 1 ≠ 0, mọi a ≠ 0 khả nghịch"
        tone="gthmb"
        emphasis
        titleSize={14}
      />

      <NodeBox
        x={28}
        y={120}
        width={334}
        height={58}
        title="Miền nguyên (Integral Domain)"
        subtitle="Giao hoán, 1 ≠ 0, không ước của 0"
        tone="hhave"
      />
      <NodeBox
        x={386}
        y={120}
        width={326}
        height={58}
        title="Vành chia / Thể (Division Ring)"
        subtitle="1 ≠ 0, mọi a ≠ 0 khả nghịch"
        tone="heritage"
      />

      <NodeBox x={76} y={222} width={238} height={48} title="Vành giao hoán có 1" tone="primary" />

      <NodeBox x={265} y={314} width={210} height={46} title="Vành có 1" tone="neutral" />

      <NodeBox
        x={155}
        y={404}
        width={430}
        height={56}
        title="VÀNH TỔNG QUÁT (Ring)"
        subtitle="Không mặc định giao hoán, không mặc định 1"
        tone="ctds"
        emphasis
      />
    </svg>
  );
}

/* ============================================================================
   5. BA TÌNH HUỐNG PHẦN TỬ ĐƠN VỊ CỦA VÀNH CON (#9)
   ============================================================================ */

export function SubringUnityCasesSvg() {
  return (
    <svg
      viewBox="0 0 800 180"
      role="img"
      aria-label="Ba tình huống về phần tử đơn vị của vành con so với vành mẹ"
      className="mx-auto block h-auto w-full max-w-[780px]"
    >
      <NodeBox
        x={14}
        y={22}
        width={244}
        height={136}
        title="Tình huống 1"
        subtitle="Mẹ có 1, Con KHÔNG có 1"
        detail="Ví dụ: 2ℤ ⊂ ℤ"
        tone="gdh"
        emphasis
      />
      <NodeBox
        x={278}
        y={22}
        width={244}
        height={136}
        title="Tình huống 2"
        subtitle="Con có đơn vị RIÊNG khác Mẹ"
        detail="ℝE₁₁ ⊂ M₂(ℝ): 1_S = E₁₁ ≠ I₂"
        tone="heritage"
        emphasis
      />
      <NodeBox
        x={542}
        y={22}
        width={244}
        height={136}
        title="Tình huống 3"
        subtitle="Con và Mẹ CÙNG đơn vị"
        detail="ℤ ⊂ ℚ ⊂ ℝ (cùng đơn vị 1)"
        tone="gthmb"
        emphasis
      />
    </svg>
  );
}

/* ============================================================================
   6. BỘ BA VÀNH THƯƠNG ĐA THỨC KINH ĐIỂN TRÊN R (#11)
   ============================================================================ */

export function PolynomialQuotientTrioSvg() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;

  return (
    <svg
      viewBox="0 0 820 340"
      role="img"
      aria-label="Ba vành thương đa thức bậc hai kinh điển trên trường số thực R"
      className="mx-auto block h-auto w-full max-w-[800px]"
    >
      <SvgArrowDefs prefix={uid} />

      <g stroke="var(--text-secondary)" strokeWidth={1.5} fill="none">
        <path d="M 330 64 C 240 80, 160 88, 140 112" markerEnd={arrow} />
        <line x1={410} y1={64} x2={410} y2={112} markerEnd={arrow} />
        <path d="M 490 64 C 580 80, 660 88, 680 112" markerEnd={arrow} />

        <line x1={140} y1={174} x2={140} y2={214} markerEnd={arrow} />
        <line x1={410} y1={174} x2={410} y2={214} markerEnd={arrow} />
        <line x1={680} y1={174} x2={680} y2={214} markerEnd={arrow} />
      </g>

      <NodeBox
        x={245}
        y={14}
        width={330}
        height={50}
        title="Đa thức bậc hai f(x) trên ℝ"
        tone="primary"
        emphasis
        titleSize={14}
      />

      {/* 3 trường hợp đa thức */}
      <NodeBox
        x={22}
        y={114}
        width={236}
        height={60}
        title="f(x) = x²"
        subtitle="Nghiệm kép: x = 0"
        tone="heritage"
      />
      <NodeBox
        x={292}
        y={114}
        width={236}
        height={60}
        title="f(x) = x² − 1"
        subtitle="Hai nghiệm thực: x = ±1"
        tone="gdh"
      />
      <NodeBox
        x={562}
        y={114}
        width={236}
        height={60}
        title="f(x) = x² + 1"
        subtitle="Vô nghiệm thực: Bất khả quy"
        tone="gthmb"
      />

      {/* 3 kết quả vành thương */}
      <NodeBox
        x={14}
        y={216}
        width={252}
        height={104}
        title="ℝ[x]/(x²)"
        subtitle="Đại diện: a + bε (ε² = 0)"
        detail="VÀNH CÓ PHẦN TỬ LŨY LINH"
        tone="heritage"
        emphasis
      />
      <NodeBox
        x={284}
        y={216}
        width={252}
        height={104}
        title="ℝ[x]/(x² − 1)"
        subtitle="a + bu (u² = 1), (u−1)(u+1) = 0"
        detail="VÀNH CÓ ƯỚC CỦA KHÔNG"
        tone="gdh"
        emphasis
      />
      <NodeBox
        x={554}
        y={216}
        width={252}
        height={104}
        title="ℝ[x]/(x² + 1)"
        subtitle="Đại diện: a + bi (i² = −1)"
        detail="TRƯỜNG SỐ PHỨC ℂ"
        tone="gthmb"
        emphasis
      />
    </svg>
  );
}

/* ============================================================================
   7, 8, 9. BA TAM GIÁC GIAO HOÁN PHỔ DỤNG (#13, #14, #17)
   ============================================================================ */

interface CommutativeTriangleProps {
  readonly topLeft: string;
  readonly topRight: string;
  readonly bottomLeft: string;
  readonly topEdgeLabel: string;
  readonly leftEdgeLabel: string;
  readonly diagEdgeLabel: string;
  readonly topTone?: DiagramTone;
  readonly ariaLabel: string;
}

function CommutativeTriangleSvg({
  topLeft,
  topRight,
  bottomLeft,
  topEdgeLabel,
  leftEdgeLabel,
  diagEdgeLabel,
  topTone = 'primary',
  ariaLabel,
}: CommutativeTriangleProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrowSolid = `url(#${uid}-arrow-muted)`;
  const arrowDashed = `url(#${uid}-arrow-heritage)`;

  return (
    <svg
      viewBox="0 0 560 250"
      role="img"
      aria-label={ariaLabel}
      className="mx-auto block h-auto w-full max-w-[540px]"
    >
      <SvgArrowDefs prefix={uid} />

      {/* Cạnh ngang trên: topLeft -> topRight */}
      <line
        x1={196}
        y1={56}
        x2={364}
        y2={56}
        stroke="var(--text-secondary)"
        strokeWidth={1.7}
        markerEnd={arrowSolid}
      />
      <EdgePill
        x={280}
        y={32}
        width={Math.max(54, topEdgeLabel.length * 8 + 24)}
        text={topEdgeLabel}
      />

      {/* Cạnh dọc trái: topLeft -> bottomLeft */}
      <line
        x1={118}
        y1={84}
        x2={118}
        y2={164}
        stroke="var(--text-secondary)"
        strokeWidth={1.7}
        markerEnd={arrowSolid}
      />
      <EdgePill
        x={64}
        y={124}
        width={Math.max(54, leftEdgeLabel.length * 7.8 + 22)}
        text={leftEdgeLabel}
      />

      {/* Cạnh chéo nét đứt (ánh xạ duy nhất): bottomLeft -.-> topRight */}
      <line
        x1={206}
        y1={178}
        x2={372}
        y2={84}
        stroke="var(--accent-heritage)"
        strokeWidth={1.8}
        strokeDasharray="6 4"
        markerEnd={arrowDashed}
      />
      <EdgePill
        x={324}
        y={144}
        width={Math.max(76, diagEdgeLabel.length * 7.8 + 24)}
        text={diagEdgeLabel}
        tone="heritage"
      />

      {/* 3 đỉnh tam giác giao hoán */}
      <NodeBox
        x={44}
        y={28}
        width={150}
        height={54}
        title={topLeft}
        tone={topTone}
        emphasis
        titleSize={15}
      />
      <NodeBox
        x={368}
        y={28}
        width={154}
        height={54}
        title={topRight}
        tone="gthmb"
        emphasis
        titleSize={15}
      />
      <NodeBox
        x={30}
        y={166}
        width={176}
        height={56}
        title={bottomLeft}
        tone="hhave"
        emphasis
        titleSize={14}
      />
    </svg>
  );
}

export function RingQuotientFactorTriangleSvg() {
  return (
    <CommutativeTriangleSvg
      topLeft="R"
      topRight="S"
      bottomLeft="R / I"
      topEdgeLabel="f"
      leftEdgeLabel="π_I"
      diagEdgeLabel="∃! f̄"
      ariaLabel="Tam giác giao hoán phân tích đồng cấu vành qua vành thương R/I"
    />
  );
}

export function RingCharacteristicTriangleSvg() {
  return (
    <CommutativeTriangleSvg
      topLeft="ℤ"
      topRight="R"
      bottomLeft="ℤ / (char R)ℤ"
      topEdgeLabel="η_R"
      leftEdgeLabel="π"
      diagEdgeLabel="đơn cấu"
      ariaLabel="Tam giác giao hoán của đồng cấu đơn vị đặc số vành η_R: Z -> R"
    />
  );
}

export function FractionFieldUniversalTriangleSvg() {
  return (
    <CommutativeTriangleSvg
      topLeft="R"
      topRight="Trường K"
      bottomLeft="Frac(R)"
      topEdgeLabel="f (đơn cấu)"
      leftEdgeLabel="ι_R (nhúng)"
      diagEdgeLabel="∃! f̃ (đơn cấu)"
      ariaLabel="Tam giác giao hoán biểu diễn tính chất phổ dụng của trường các thương Frac(R)"
    />
  );
}

/* ============================================================================
   10. PHÂN LOẠI TRƯỜNG CON NGUYÊN TỐ THEO ĐẶC SỐ (#16)
   ============================================================================ */

export function PrimeSubfieldDichotomySvg() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;

  return (
    <svg
      viewBox="0 0 720 330"
      role="img"
      aria-label="Phân loại trường con nguyên tố của trường F theo đặc số char(F)"
      className="mx-auto block h-auto w-full max-w-[700px]"
    >
      <SvgArrowDefs prefix={uid} />

      <g stroke="var(--text-secondary)" strokeWidth={1.6} fill="none">
        <line x1={360} y1={66} x2={360} y2={104} markerEnd={arrow} />
        <path d="M 278 154 C 210 172, 180 198, 178 236" markerEnd={arrow} />
        <path d="M 442 154 C 510 172, 540 198, 542 236" markerEnd={arrow} />
      </g>

      <NodeBox
        x={235}
        y={16}
        width={250}
        height={50}
        title="Trường bất kỳ F"
        tone="primary"
        emphasis
        titleSize={14}
      />

      {/* Hình thoi quyết định Đặc số char(F) */}
      <g>
        <polygon
          points="360,106 462,154 360,202 258,154"
          fill="var(--bg-workspace)"
          stroke="var(--accent-heritage)"
          strokeWidth={1.8}
        />
        <polygon
          points="360,109 457,154 360,199 263,154"
          fill="var(--accent-heritage)"
          fillOpacity={0.1}
        />
        <text
          x={360}
          y={150}
          textAnchor="middle"
          fill="var(--text-main)"
          fontFamily={FONT_SANS}
          fontSize={12.5}
          fontWeight={700}
        >
          Đặc số
        </text>
        <text
          x={360}
          y={168}
          textAnchor="middle"
          fill="var(--accent-heritage)"
          fontFamily={FONT_MONO}
          fontSize={12}
          fontWeight={700}
        >
          char(F)
        </text>
      </g>

      <EdgePill x={198} y={202} width={104} text="char(F) = 0" tone="hhave" />
      <EdgePill x={522} y={202} width={126} text="char(F) = p > 0" tone="ctds" />

      <NodeBox
        x={24}
        y={240}
        width={308}
        height={64}
        title="Trường con nguyên tố"
        subtitle="P_F ≅ ℚ"
        tone="hhave"
        emphasis
      />
      <NodeBox
        x={388}
        y={240}
        width={308}
        height={64}
        title="Trường con nguyên tố"
        subtitle="P_F ≅ 𝔽_p = ℤ/pℤ"
        tone="ctds"
        emphasis
      />
    </svg>
  );
}

/* ============================================================================
   11. BẢN ĐỒ TỔNG KẾT CHƯƠNG 8 — ĐỒNG CẤU VÀNH & ĐẲNG CẤU (#15)
   ============================================================================ */

export function Chapter8RingHomomorphismMapSvg() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;
  const arrowAccent = `url(#${uid}-arrow-primary)`;

  return (
    <svg
      viewBox="0 0 840 760"
      role="img"
      aria-label="Bản đồ tổng kết Chương 8: Đồng cấu vành, Ba định lý đẳng cấu, Đặc số và Ứng dụng phân rã vành"
      className="mx-auto block h-auto w-full max-w-[820px]"
    >
      <SvgArrowDefs prefix={uid} />

      {/* 4 cụm kiến thức */}
      <ClusterBox
        x={16}
        y={14}
        width={400}
        height={328}
        label="1. KHÁI NIỆM & ĐIỀU KIỆN ĐƠN VỊ"
        tone="hhave"
      />
      <ClusterBox
        x={428}
        y={14}
        width={396}
        height={328}
        label="2. BA ĐỊNH LÝ ĐẲNG CẤU VÀNH"
        tone="primary"
      />
      <ClusterBox
        x={16}
        y={360}
        width={400}
        height={386}
        label="3. ĐẶC SỐ & CẤU TRÚC TRƯỜNG"
        tone="heritage"
      />
      <ClusterBox
        x={428}
        y={360}
        width={396}
        height={386}
        label="4. ỨNG DỤNG PHÂN RÃ VÀNH"
        tone="ctds"
      />

      {/* Đường nối nội cụm & liên cụm */}
      <g stroke="var(--text-secondary)" strokeWidth={1.4} fill="none">
        {/* Cụm 1 */}
        <line x1={216} y1={116} x2={216} y2={138} markerEnd={arrow} />
        <line x1={216} y1={202} x2={216} y2={224} markerEnd={arrow} />
        <line x1={216} y1={276} x2={216} y2={290} markerEnd={arrow} />

        {/* Liên kết Cụm 1 (KerIm) -> Cụm 2 (Univ) */}
        <path
          d="M 398 250 C 414 250, 420 88, 444 88"
          stroke="var(--accent-os)"
          markerEnd={arrowAccent}
        />

        {/* Cụm 2 */}
        <line x1={626} y1={114} x2={626} y2={132} markerEnd={arrow} />
        <path d="M 555 186 L 525 206" markerEnd={arrow} />
        <path d="M 695 186 L 725 206" markerEnd={arrow} />
        <line x1={725} y1={264} x2={725} y2={280} markerEnd={arrow} />

        {/* Liên kết Cụm 1 -> Cụm 3 (Hom -> Eta) */}
        <path
          d="M 48 88 C 24 88, 24 432, 46 432"
          stroke="var(--accent-heritage)"
          strokeDasharray="4 3"
          markerEnd={arrow}
        />

        {/* Cụm 3 */}
        <line x1={216} y1={460} x2={216} y2={486} markerEnd={arrow} />
        <line x1={216} y1={540} x2={216} y2={566} markerEnd={arrow} />
        <line x1={216} y1={630} x2={216} y2={658} markerEnd={arrow} />

        {/* Liên kết Cụm 2 -> Cụm 4 & Cụm 3 -> Cụm 4 */}
        <path d="M 626 342 L 626 404" stroke="var(--accent-os)" markerEnd={arrowAccent} />
        <path
          d="M 398 598 C 422 598, 422 694, 446 694"
          stroke="var(--mineral-ctds)"
          strokeDasharray="4 3"
          markerEnd={arrow}
        />
      </g>

      {/* Nút Cụm 1 */}
      <NodeBox
        x={34}
        y={58}
        width={364}
        height={58}
        title="Đồng cấu vành f: R → S"
        subtitle="f(a+b) = f(a)+f(b) và f(ab) = f(a)f(b)"
        tone="hhave"
        emphasis
      />
      <NodeBox
        x={34}
        y={140}
        width={364}
        height={62}
        title="Điều kiện đơn vị: f(1_R) = 1_S"
        subtitle="⟺ f toàn ánh hoặc S miền nguyên (f ≠ 0)"
        tone="neutral"
      />
      <NodeBox
        x={34}
        y={226}
        width={364}
        height={50}
        title="ker(f) ⊲ R (iđêan 2 phía) & im(f) ≤ S"
        tone="primary"
      />
      <NodeBox
        x={64}
        y={292}
        width={304}
        height={38}
        title="Tiêu chuẩn đơn cấu: ker(f) = {0_R}"
        tone="neutral"
        titleSize={12}
      />

      {/* Nút Cụm 2 */}
      <NodeBox
        x={446}
        y={58}
        width={360}
        height={56}
        title="Phân tích qua thương"
        subtitle="I ⊆ ker(f) ⟹ ∃! f̄: R/I → S"
        tone="primary"
      />
      <NodeBox
        x={446}
        y={134}
        width={360}
        height={52}
        title="Định lý Đẳng cấu I"
        subtitle="R / ker(f) ≅ im(f)"
        tone="gthmb"
        emphasis
      />
      <NodeBox
        x={446}
        y={208}
        width={172}
        height={56}
        title="Định lý Đẳng cấu II"
        subtitle="(S+I)/I ≅ S/(S∩I)"
        tone="neutral"
        titleSize={12}
        subtitleSize={10.5}
      />
      <NodeBox
        x={634}
        y={208}
        width={172}
        height={56}
        title="Định lý Đẳng cấu III"
        subtitle="(R/I)/(J/I) ≅ R/J"
        tone="neutral"
        titleSize={12}
        subtitleSize={10.5}
      />
      <NodeBox
        x={446}
        y={282}
        width={360}
        height={48}
        title="Định lý Tương ứng"
        subtitle="Bảo toàn trật tự, nguyên tố và cực đại"
        tone="primary"
        titleSize={12}
      />

      {/* Nút Cụm 3 */}
      <NodeBox
        x={38}
        y={404}
        width={356}
        height={56}
        title="Đồng cấu đơn vị η_R: ℤ → R"
        subtitle="n ↦ n · 1_R"
        tone="heritage"
        emphasis
      />
      <NodeBox
        x={38}
        y={488}
        width={356}
        height={52}
        title="Đặc số của vành"
        subtitle="ker(η_R) = (char R)ℤ"
        tone="neutral"
      />
      <NodeBox
        x={38}
        y={568}
        width={356}
        height={62}
        title="Định lý 8.21 (Miền nguyên)"
        subtitle="R miền nguyên ⟹ char(R) = 0 hoặc p nguyên tố"
        tone="heritage"
      />
      <NodeBox
        x={38}
        y={660}
        width={356}
        height={66}
        title="Tự đồng cấu Frobenius"
        subtitle="(a + b)ᵖ = aᵖ + bᵖ khi char(R) = p"
        tone="gthmb"
      />

      {/* Nút Cụm 4 */}
      <NodeBox
        x={446}
        y={406}
        width={360}
        height={78}
        title="Định lý Thặng dư Trung Hoa (CRT)"
        subtitle="I + J = R ⟹ R/(I ∩ J) ≅ R/I × R/J"
        detail="Từ Định lý Đẳng cấu I & Tương ứng"
        tone="ctds"
        emphasis
      />
      <NodeBox
        x={446}
        y={516}
        width={360}
        height={78}
        title="Phân tích lũy đẳng tâm"
        subtitle="e² = e ⟹ R ≅ Re × R(1 − e)"
        detail="Hệ quả trực tiếp Định lý Đẳng cấu I"
        tone="ctds"
      />
      <NodeBox
        x={446}
        y={626}
        width={360}
        height={98}
        title="Tính cứng (Rigidity)"
        subtitle="Aut(ℚ) = {id},  Aut(ℝ) = {id}"
        detail="Mọi tự đẳng cấu giữ cố định trường con nguyên tố"
        tone="primary"
      />
    </svg>
  );
}

/* ============================================================================
   12. BẢN ĐỒ TỔNG KẾT CHƯƠNG 9 & TIẾN HÓA TOÀN HỌC PHẦN (#18)
   ============================================================================ */

export function Chapter9CourseEvolutionMapSvg() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrow = `url(#${uid}-arrow-muted)`;
  const arrowAccent = `url(#${uid}-arrow-primary)`;

  return (
    <svg
      viewBox="0 0 840 690"
      role="img"
      aria-label="Bản đồ tổng kết học phần Cấu trúc Đại số: Tiến hóa từ Tập hợp đến Trường và Đặc số"
      className="mx-auto block h-auto w-full max-w-[820px]"
    >
      <SvgArrowDefs prefix={uid} />

      <ClusterBox
        x={14}
        y={14}
        width={812}
        height={400}
        label="1. TIẾN HÓA CẤU TRÚC ĐẠI SỐ (CHƯƠNG 0 – CHƯƠNG 9)"
        tone="primary"
      />
      <ClusterBox
        x={14}
        y={434}
        width={812}
        height={242}
        label="2. CẤU TRÚC TRƯỜNG & ĐẶC SỐ (CHƯƠNG 9)"
        tone="ctds"
      />

      {/* Mũi tên tiến hóa 3 tầng */}
      <g stroke="var(--text-secondary)" strokeWidth={1.45} fill="none">
        {/* Hàng 1: trái -> phải */}
        <line x1={206} y1={88} x2={224} y2={88} markerEnd={arrow} />
        <line x1={408} y1={88} x2={426} y2={88} markerEnd={arrow} />
        <line x1={610} y1={88} x2={628} y2={88} markerEnd={arrow} />

        {/* Chuyển Hàng 1 -> Hàng 2 */}
        <path d="M 718 118 C 718 138, 118 132, 118 158" markerEnd={arrow} />

        {/* Hàng 2: trái -> phải */}
        <line x1={206} y1={190} x2={224} y2={190} markerEnd={arrow} />
        <line x1={408} y1={190} x2={426} y2={190} markerEnd={arrow} />
        <line x1={610} y1={190} x2={628} y2={190} markerEnd={arrow} />

        {/* Chuyển Hàng 2 -> Hàng 3 */}
        <path d="M 718 220 C 718 240, 118 234, 118 260" markerEnd={arrow} />

        {/* Hàng 3: trái -> phải */}
        <line x1={206} y1={292} x2={224} y2={292} markerEnd={arrow} />
        <line x1={408} y1={292} x2={426} y2={292} markerEnd={arrow} />
        <line x1={610} y1={292} x2={628} y2={292} markerEnd={arrow} />

        {/* Hội tụ Ideal & FracField -> Field */}
        <path
          d="M 118 322 C 118 368, 220 374, 242 374"
          stroke="var(--accent-os)"
          markerEnd={arrowAccent}
        />
        <path
          d="M 718 322 C 718 368, 616 374, 594 374"
          stroke="var(--accent-os)"
          markerEnd={arrowAccent}
        />

        {/* Field -> PrimeField -> QSub / FpSub -> FinField */}
        <line
          x1={420}
          y1={402}
          x2={420}
          y2={480}
          stroke="var(--accent-os)"
          strokeWidth={1.7}
          markerEnd={arrowAccent}
        />
        <path d="M 332 528 C 250 546, 200 562, 190 594" markerEnd={arrow} />
        <path d="M 508 528 C 566 544, 580 560, 580 594" markerEnd={arrow} />
        <line x1={648} y1={624} x2={668} y2={624} markerEnd={arrow} />
      </g>

      {/* Hàng 1 (Ch.0 – Ch.2) */}
      <NodeBox
        x={30}
        y={58}
        width={176}
        height={60}
        title="Tập hợp & Ánh xạ"
        subtitle="Chương 0"
        tone="neutral"
        titleSize={12}
      />
      <NodeBox
        x={226}
        y={58}
        width={182}
        height={60}
        title="Nửa nhóm & Vị nhóm"
        subtitle="Chương 1"
        tone="neutral"
        titleSize={12}
      />
      <NodeBox
        x={428}
        y={58}
        width={182}
        height={60}
        title="Nhóm (Group)"
        subtitle="Chương 1"
        tone="hhave"
        titleSize={12}
      />
      <NodeBox
        x={630}
        y={58}
        width={180}
        height={60}
        title="Nhóm con & Cyclic"
        subtitle="Chương 2"
        tone="hhave"
        titleSize={12}
      />

      {/* Hàng 2 (Ch.3 – Ch.6) */}
      <NodeBox
        x={30}
        y={160}
        width={176}
        height={60}
        title="Lớp kề & Lagrange"
        subtitle="Chương 3"
        tone="hhave"
        titleSize={12}
      />
      <NodeBox
        x={226}
        y={160}
        width={182}
        height={60}
        title="Chuẩn tắc & G/N"
        subtitle="Chương 4"
        tone="hhave"
        titleSize={12}
      />
      <NodeBox
        x={428}
        y={160}
        width={182}
        height={60}
        title="3 ĐL Đẳng cấu Nhóm"
        subtitle="Chương 5"
        tone="primary"
        titleSize={12}
      />
      <NodeBox
        x={630}
        y={160}
        width={180}
        height={60}
        title="Vành (2 phép toán)"
        subtitle="Chương 6"
        tone="heritage"
        titleSize={12}
      />

      {/* Hàng 3 (Ch.7 – Ch.9) */}
      <NodeBox
        x={30}
        y={262}
        width={176}
        height={60}
        title="Iđêan & Vành thương"
        subtitle="Chương 7"
        tone="heritage"
        titleSize={12}
      />
      <NodeBox
        x={226}
        y={262}
        width={182}
        height={60}
        title="Đồng cấu & char R"
        subtitle="Chương 8"
        tone="heritage"
        titleSize={12}
      />
      <NodeBox
        x={428}
        y={262}
        width={182}
        height={60}
        title="Miền nguyên"
        subtitle="Không ước 0 · Ch.6"
        tone="ctds"
        titleSize={12}
      />
      <NodeBox
        x={630}
        y={262}
        width={180}
        height={60}
        title="Trường thương Frac(R)"
        subtitle="Chương 9"
        tone="ctds"
        titleSize={12}
      />

      {/* Nút hội tụ: Trường */}
      <NodeBox
        x={244}
        y={346}
        width={350}
        height={56}
        title="TRƯỜNG (Field) — Chương 9"
        subtitle="Nhận diện qua hai iđêan tầm thường {0} và R"
        tone="gthmb"
        emphasis
      />

      {/* Cụm 2: Trường con nguyên tố & Trường hữu hạn */}
      <NodeBox
        x={292}
        y={482}
        width={256}
        height={50}
        title="Trường con nguyên tố P_F"
        tone="primary"
        emphasis
      />

      <EdgePill x={246} y={558} width={78} text="char = 0" tone="hhave" />
      <EdgePill x={568} y={558} width={78} text="char = p" tone="ctds" />

      <NodeBox
        x={88}
        y={596}
        width={210}
        height={56}
        title="P_F ≅ ℚ"
        subtitle="Đặc số 0 (vô hạn)"
        tone="hhave"
      />
      <NodeBox
        x={494}
        y={596}
        width={154}
        height={56}
        title="P_F ≅ 𝔽_p"
        subtitle="Đặc số p nguyên tố"
        tone="ctds"
      />
      <NodeBox
        x={670}
        y={588}
        width={144}
        height={72}
        title="Trường hữu hạn"
        subtitle="|F| = pⁿ"
        detail="KGVT trên 𝔽_p"
        tone="gthmb"
        emphasis
        titleSize={12}
      />
    </svg>
  );
}

/* ============================================================================
   13. FALLBACK SVG GỌN NHẸ CHO FLOWCHART TÙY Ý (KHÔNG CẦN GÓI MERMAID)
   ============================================================================ */

interface ParsedNode {
  readonly id: string;
  readonly label: string;
}

interface ParsedEdge {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
  readonly dashed: boolean;
}

function parseLightweightFlowchart(source: string): {
  readonly nodes: readonly ParsedNode[];
  readonly edges: readonly ParsedEdge[];
} {
  const nodeMap = new Map<string, string>();
  const edges: ParsedEdge[] = [];

  const registerNode = (rawId: string, rawLabel?: string): string => {
    const id = rawId.trim();
    const cleanedLabel = rawLabel?.replace(/^["']|["']$/g, '').replace(/\\n|<br\s*\/?>/gi, ' · ');
    if (cleanedLabel) {
      nodeMap.set(id, cleanedLabel);
    } else if (!nodeMap.has(id)) {
      nodeMap.set(id, id);
    }
    return id;
  };

  const nodePattern =
    /([A-Za-z0-9_]+)(?:\s*(?:\["([^"]+)"\]|\["?([^"\]]+)"?\]|\{"([^"]+)"\}|\{([^}]+)\}))?/g;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (
      !line ||
      line.startsWith('%%') ||
      /^(flowchart|graph|style|classDef|subgraph|end)\b/i.test(line)
    ) {
      continue;
    }

    const edgeMatch = line.match(
      /^(.+?)\s*(--+>|-\.+->|--\s*"([^"]+)"\s*-->|-\.\s*"([^"]+)"\s*\.->)\s*(?:\|([^|]+)\|\s*)?(.+)$/,
    );
    if (edgeMatch) {
      const leftRaw = edgeMatch[1] ?? '';
      const connector = edgeMatch[2] ?? '-->';
      const edgeLabel = (edgeMatch[3] ?? edgeMatch[4] ?? edgeMatch[5])?.trim();
      const rightRaw = edgeMatch[6] ?? '';
      const dashed = connector.includes('.');

      const parseSide = (side: string): string[] =>
        side
          .split('&')
          .map((token) => {
            nodePattern.lastIndex = 0;
            const m = nodePattern.exec(token.trim());
            if (!m || !m[1]) return '';
            const label = m[2] ?? m[3] ?? m[4] ?? m[5];
            return registerNode(m[1], label);
          })
          .filter(Boolean);

      const fromIds = parseSide(leftRaw);
      const toIds = parseSide(rightRaw);
      for (const from of fromIds) {
        for (const to of toIds) {
          edges.push({ from, to, label: edgeLabel, dashed });
        }
      }
      continue;
    }

    nodePattern.lastIndex = 0;
    const standalone = nodePattern.exec(line);
    if (standalone?.[1]) {
      const label = standalone[2] ?? standalone[3] ?? standalone[4] ?? standalone[5];
      registerNode(standalone[1], label);
    }
  }

  return {
    nodes: Array.from(nodeMap.entries()).map(([id, label]) => ({ id, label })),
    edges,
  };
}

export function GenericFlowchartSvg({ chart }: { readonly chart: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { nodes, edges } = parseLightweightFlowchart(chart);
  const arrow = `url(#${uid}-arrow-muted)`;

  if (nodes.length === 0) {
    return (
      <svg
        viewBox="0 0 420 96"
        role="img"
        aria-label="Sơ đồ khái niệm toán học"
        className="mx-auto block h-auto w-full max-w-[420px]"
      >
        <NodeBox
          x={20}
          y={20}
          width={380}
          height={56}
          title="Sơ đồ khái niệm toán học"
          tone="primary"
        />
      </svg>
    );
  }

  // Sắp xếp tầng đơn giản theo quan hệ cạnh có hướng
  const levels = new Map<string, number>();
  for (const node of nodes) {
    levels.set(node.id, 0);
  }
  for (let pass = 0; pass < nodes.length; pass += 1) {
    for (const edge of edges) {
      const fromLvl = levels.get(edge.from) ?? 0;
      const toLvl = levels.get(edge.to) ?? 0;
      if (toLvl <= fromLvl) {
        levels.set(edge.to, Math.min(fromLvl + 1, nodes.length - 1));
      }
    }
  }

  const rows = new Map<number, ParsedNode[]>();
  for (const node of nodes) {
    const lvl = levels.get(node.id) ?? 0;
    const list = rows.get(lvl) ?? [];
    list.push(node);
    rows.set(lvl, list);
  }

  const sortedRowKeys = Array.from(rows.keys()).sort((a, b) => a - b);
  const maxCols = Math.max(1, ...Array.from(rows.values()).map((r) => r.length));
  const nodeWidth = 220;
  const nodeHeight = 50;
  const colGap = 28;
  const rowGap = 54;
  const padX = 24;
  const padY = 20;

  const canvasWidth = Math.max(480, maxCols * nodeWidth + (maxCols - 1) * colGap + padX * 2);
  const canvasHeight =
    sortedRowKeys.length * nodeHeight + Math.max(0, sortedRowKeys.length - 1) * rowGap + padY * 2;

  const coords = new Map<string, { x: number; y: number }>();
  sortedRowKeys.forEach((rowKey, rowIndex) => {
    const rowNodes = rows.get(rowKey) ?? [];
    const totalRowWidth = rowNodes.length * nodeWidth + Math.max(0, rowNodes.length - 1) * colGap;
    const startX = (canvasWidth - totalRowWidth) / 2;
    const y = padY + rowIndex * (nodeHeight + rowGap);
    rowNodes.forEach((node, colIndex) => {
      coords.set(node.id, {
        x: startX + colIndex * (nodeWidth + colGap),
        y,
      });
    });
  });

  return (
    <svg
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      role="img"
      aria-label="Sơ đồ cấu trúc khái niệm"
      className="mx-auto block h-auto w-full max-w-[740px]"
    >
      <SvgArrowDefs prefix={uid} />

      {edges.map((edge, idx) => {
        const fromPos = coords.get(edge.from);
        const toPos = coords.get(edge.to);
        if (!fromPos || !toPos) return null;
        const x1 = fromPos.x + nodeWidth / 2;
        const y1 = fromPos.y + nodeHeight;
        const x2 = toPos.x + nodeWidth / 2;
        const y2 = toPos.y - 2;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={`${edge.from}-${edge.to}-${idx}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              strokeDasharray={edge.dashed ? '5 4' : undefined}
              markerEnd={arrow}
            />
            {edge.label && (
              <EdgePill
                x={midX}
                y={midY}
                width={Math.min(260, Math.max(72, edge.label.length * 7.2 + 24))}
                text={edge.label}
              />
            )}
          </g>
        );
      })}

      {nodes.map((node, idx) => {
        const pos = coords.get(node.id);
        if (!pos) return null;
        return (
          <NodeBox
            key={node.id}
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            title={node.label}
            tone={idx === 0 ? 'primary' : idx === nodes.length - 1 ? 'gthmb' : 'neutral'}
            emphasis={idx === 0 || idx === nodes.length - 1}
          />
        );
      })}
    </svg>
  );
}
