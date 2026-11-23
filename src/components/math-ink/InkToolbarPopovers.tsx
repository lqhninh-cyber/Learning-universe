import {
  ArrowUpDown,
  Circle,
  Diamond,
  Eraser,
  Hexagon,
  Highlighter,
  Lasso,
  Minus,
  MoveRight,
  Pen,
  Pencil,
  PenTool,
  Pentagon,
  Square,
  SquareDashed,
  Triangle,
  Type,
} from 'lucide-react';
import { type FC, useEffect, useRef } from 'react';
import {
  drawInkStroke,
  SCRBLE_COLOR_PALETTE,
  type EraserMode,
  type InkRecognitionMode,
  type PaperConfig,
  type PaperPattern,
  type PenKind,
  type PenPreset,
  type SelectionMode,
  type ShapeToolKind,
} from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

const PAPER_TEMPLATES: readonly { readonly id: PaperPattern; readonly label: string }[] = [
  { id: 'blank', label: 'Trắng trơn' },
  { id: 'ruled', label: 'Kẻ ngang' },
  { id: 'math', label: 'Ô ly Toán' },
  { id: 'math-sm', label: 'Ô ly nhỏ' },
  { id: 'math-lg', label: 'Ô ly lớn' },
  { id: 'dotted', label: 'Chấm bi' },
];

const PAPER_BACKGROUNDS: readonly { readonly hex: string; readonly label: string }[] = [
  { hex: '#FFFFFF', label: 'Trắng tinh' },
  { hex: '#FAF7F0', label: 'Giấy kem ấm' },
  { hex: '#F3F8FC', label: 'Xanh dịu' },
  { hex: '#13221E', label: 'Bảng phấn' },
];

export const PaperSettingsPopover: FC<{
  readonly paper: PaperConfig;
  readonly onChange: (patch: Partial<PaperConfig>) => void;
}> = ({ paper, onChange }) => (
  <div
    data-testid="paper-settings-popover"
    className="w-[min(92vw,340px)] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-2xl"
  >
    <p className="font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
      Kiểu giấy vở (Scrble Paper)
    </p>
    <div className="grid grid-cols-3 gap-1.5">
      {PAPER_TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          data-testid={`paper-pattern-${tpl.id}`}
          onClick={() => onChange({ pattern: tpl.id })}
          className={cn(
            'cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
            paper.pattern === tpl.id
              ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
              : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          {tpl.label}
        </button>
      ))}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-2.5">
      <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5 text-xs">
        <button
          type="button"
          onClick={() => onChange({ orientation: 'portrait' })}
          className={cn(
            'cursor-pointer rounded-md px-2.5 py-1 font-medium',
            paper.orientation === 'portrait'
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-secondary)]',
          )}
        >
          Dọc
        </button>
        <button
          type="button"
          onClick={() => onChange({ orientation: 'landscape' })}
          className={cn(
            'cursor-pointer rounded-md px-2.5 py-1 font-medium',
            paper.orientation === 'landscape'
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-secondary)]',
          )}
        >
          Ngang
        </button>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <input
          type="checkbox"
          checked={paper.showBorderLines}
          onChange={(e) => onChange({ showBorderLines: e.target.checked })}
          className="accent-[var(--accent-os)]"
        />
        <span>Đường lề đỏ</span>
      </label>
    </div>

    <div className="flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-2.5">
      <span className="font-mono text-[10.5px] text-[var(--text-muted)]">Màu giấy:</span>
      <div className="flex items-center gap-2">
        {PAPER_BACKGROUNDS.map((bg) => (
          <button
            key={bg.hex}
            type="button"
            title={bg.label}
            aria-label={`Chọn nền giấy ${bg.label}`}
            onClick={() => onChange({ backgroundColor: bg.hex })}
            style={{ backgroundColor: bg.hex }}
            className={cn(
              'h-6 w-6 cursor-pointer rounded-full border transition-transform hover:scale-110',
              paper.backgroundColor === bg.hex
                ? 'ring-2 ring-[var(--accent-os)] ring-offset-1'
                : 'border-[var(--border-strong)]',
            )}
          />
        ))}
      </div>
    </div>
  </div>
);

const PEN_TYPES: readonly {
  readonly id: PenKind;
  readonly label: string;
  readonly icon: typeof Pen;
}[] = [
  { id: 'ballpoint', label: 'Bút thường', icon: Pen },
  { id: 'fountain', label: 'Bút máy', icon: PenTool },
  { id: 'pencil', label: 'Bút chì', icon: Pencil },
  { id: 'highlighter', label: 'Dạ quang', icon: Highlighter },
];

const PenStrokePreviewCanvas: FC<{ readonly preset: PenPreset }> = ({ preset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 236;
    const h = 40;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const points = Array.from({ length: 36 }, (_, i) => {
      const t = i / 35;
      return {
        x: 14 + t * (w - 28),
        y: h / 2 - Math.sin(t * Math.PI * 2.2) * 11,
        pressure: 0.42 + 0.34 * Math.sin(t * Math.PI),
      };
    });

    drawInkStroke(ctx, {
      id: 'preview',
      penKind: preset.penKind,
      color: preset.color,
      width: Math.min(18, preset.width),
      opacity: preset.penKind === 'highlighter' ? 0.36 : preset.penKind === 'pencil' ? 0.78 : 1,
      streamline: preset.streamline ?? 0.58,
      points,
    });
  }, [preset.color, preset.penKind, preset.streamline, preset.width]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 40 }}
      className="block rounded-lg bg-[var(--bg-surface)]/55"
    />
  );
};

export const PenSettingsPopover: FC<{
  readonly preset: PenPreset;
  readonly onChange: (patch: Partial<Omit<PenPreset, 'id'>>) => void;
}> = ({ preset, onChange }) => (
  <div
    data-testid="pen-settings-popover"
    className="w-[272px] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 text-[var(--text-main)] shadow-2xl"
  >
    <div className="space-y-1.5">
      <p className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
        Ngòi bút
      </p>
      <div className="grid grid-cols-4 gap-1">
        {PEN_TYPES.map((item) => {
          const Icon = item.icon;
          const active = preset.penKind === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onChange({
                  penKind: item.id,
                  width:
                    item.id === 'highlighter'
                      ? Math.max(14, preset.width)
                      : Math.min(8, preset.width),
                })
              }
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-lg border py-1.5 text-[10px] font-medium transition-colors',
                active
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    <div className="space-y-1.5">
      <p className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
        Bảng màu
      </p>
      <div className="grid grid-cols-6 gap-1.5">
        {SCRBLE_COLOR_PALETTE.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-label={`Chọn màu mực ${hex}`}
            onClick={() => onChange({ color: hex })}
            style={{ backgroundColor: hex }}
            className={cn(
              'h-7 w-7 cursor-pointer rounded-full border transition-transform hover:scale-110',
              preset.color === hex
                ? 'ring-2 ring-[var(--accent-os)] ring-offset-1'
                : 'border-[var(--border-hairline)]',
            )}
          />
        ))}
      </div>
    </div>

    <div className="space-y-1.5 border-t border-[var(--border-hairline)] pt-2">
      <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)]">
        <span>Cỡ nét</span>
        <span>{preset.width.toFixed(1)} px</span>
      </div>
      {/* Đường lượn sóng xem trước hình dáng ngòi thật (tròn đều vs bút máy vát chéo) */}
      <PenStrokePreviewCanvas preset={preset} />
      <input
        type="range"
        min={1}
        max={preset.penKind === 'highlighter' ? 28 : 14}
        step={0.5}
        value={preset.width}
        onChange={(e) => onChange({ width: Number(e.target.value) })}
        aria-label="Độ dày nét bút"
        className="w-full accent-[var(--accent-os)]"
      />
    </div>

    <div className="space-y-1.5 border-t border-[var(--border-hairline)] pt-2">
      <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)]">
        <span>Độ mượt chữ viết (Khử rung)</span>
        <span>{Math.round((preset.streamline ?? 0.58) * 100)}%</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {(
          [
            { label: 'Tự nhiên', val: 0.25 },
            { label: 'Mượt chuẩn', val: 0.58 },
            { label: 'Thư pháp', val: 0.82 },
          ] as const
        ).map((item) => {
          const curStreamline = preset.streamline ?? 0.58;
          const active = Math.abs(curStreamline - item.val) < 0.08;
          return (
            <button
              key={item.label}
              type="button"
              data-testid={`pen-streamline-${Math.round(item.val * 100)}`}
              onClick={() => onChange({ streamline: item.val })}
              className={cn(
                'cursor-pointer rounded-md border py-1 text-[10px] font-medium transition-colors',
                active
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <input
        type="range"
        data-testid="pen-streamline-slider"
        min={0}
        max={0.9}
        step={0.04}
        value={preset.streamline ?? 0.58}
        onChange={(e) => onChange({ streamline: Number(e.target.value) })}
        aria-label="Độ mượt chữ viết"
        className="w-full accent-[var(--accent-os)]"
      />
    </div>
  </div>
);

export const InkModePopover: FC<{
  readonly mode: InkRecognitionMode;
  readonly onChange: (mode: InkRecognitionMode) => void;
}> = ({ mode, onChange }) => {
  const options: readonly {
    readonly id: InkRecognitionMode;
    readonly label: string;
    readonly desc: string;
  }[] = [
    { id: 'ink', label: 'Mực tự do (Ink)', desc: 'Viết tay mượt tự nhiên' },
    { id: 'shape', label: 'Tự nắn hình (Ink to Shape)', desc: 'Nắn tròn, elip, vuông, tam giác' },
    { id: 'line', label: 'Tự nắn thẳng (Ink to Line)', desc: 'Nắn nét thẳng hút góc 45°' },
    { id: 'shape-and-line', label: 'Nắn Hình & Đường', desc: 'Tự nhận diện cả hai' },
  ];

  return (
    <div
      data-testid="ink-mode-popover"
      className="w-60 space-y-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-1.5 shadow-2xl"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'flex w-full cursor-pointer flex-col rounded-lg px-2.5 py-2 text-left transition-colors',
            mode === opt.id
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]',
          )}
        >
          <span className="text-xs font-semibold">{opt.label}</span>
          <span
            className={cn(
              'text-[10.5px]',
              mode === opt.id ? 'text-white/80' : 'text-[var(--text-muted)]',
            )}
          >
            {opt.desc}
          </span>
        </button>
      ))}
    </div>
  );
};

const SHAPE_LIST: readonly {
  readonly id: ShapeToolKind;
  readonly label: string;
  readonly icon: typeof Minus;
}[] = [
  { id: 'line', label: 'Nét liền', icon: Minus },
  { id: 'dashed-line', label: 'Nét đứt', icon: Minus },
  { id: 'dash-dot-line', label: 'Chấm gạch', icon: Minus },
  { id: 'arrow', label: 'Vectơ →', icon: MoveRight },
  { id: 'double-arrow', label: 'Mũi tên ↔', icon: MoveRight },
  { id: 'circle', label: 'Đường tròn', icon: Circle },
  { id: 'ellipse', label: 'Elip', icon: Circle },
  { id: 'rect', label: 'Chữ nhật', icon: Square },
  { id: 'parallelogram', label: 'Mặt phẳng (α)', icon: Diamond },
  { id: 'triangle', label: 'Tam giác', icon: Triangle },
  { id: 'right-triangle', label: 'TG vuông', icon: Triangle },
  { id: 'diamond', label: 'Hình thoi', icon: Diamond },
  { id: 'pentagon', label: 'Ngũ giác', icon: Pentagon },
  { id: 'hexagon', label: 'Lục giác', icon: Hexagon },
];

export const ShapePickerPopover: FC<{
  readonly activeShape: ShapeToolKind;
  readonly onSelectShape: (kind: ShapeToolKind) => void;
  readonly onSelectTextTool: () => void;
}> = ({ activeShape, onSelectShape, onSelectTextTool }) => (
  <div
    data-testid="shape-picker-popover"
    className="w-[290px] space-y-2 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 shadow-2xl"
  >
    <button
      type="button"
      onClick={onSelectTextTool}
      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-os)]/50 hover:text-[var(--accent-os)]"
    >
      <Type className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
      <span>Chèn chữ / Công thức KaTeX (T)</span>
    </button>

    <div className="grid grid-cols-3 gap-1.5">
      {SHAPE_LIST.map((item) => {
        const Icon = item.icon;
        const active = activeShape === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectShape(item.id)}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-[10px] font-medium transition-colors',
              active
                ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export const EraserModePopover: FC<{
  readonly mode: EraserMode;
  readonly onChange: (mode: EraserMode) => void;
  readonly onClearPage: () => void;
}> = ({ mode, onChange, onClearPage }) => {
  const options: readonly { readonly id: EraserMode; readonly label: string }[] = [
    { id: 'stroke', label: 'Tẩy nguyên nét (Stroke Eraser)' },
    { id: 'segment-sm', label: 'Tẩy theo đoạn — Nhỏ' },
    { id: 'segment-md', label: 'Tẩy theo đoạn — Vừa' },
    { id: 'segment-lg', label: 'Tẩy theo đoạn — Lớn' },
  ];

  return (
    <div
      data-testid="eraser-mode-popover"
      className="w-60 space-y-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-1.5 shadow-2xl"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors',
            mode === opt.id
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]',
          )}
        >
          <Eraser className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{opt.label}</span>
        </button>
      ))}
      <div className="border-t border-[var(--border-hairline)] pt-1">
        <button
          type="button"
          onClick={onClearPage}
          className="w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-[#8F3D35] hover:bg-[#FBF4F3] dark:hover:bg-[#241615]"
        >
          Xóa sạch trang hiện tại
        </button>
      </div>
    </div>
  );
};

export const SelectionModePopover: FC<{
  readonly mode: SelectionMode;
  readonly onChange: (mode: SelectionMode) => void;
}> = ({ mode, onChange }) => {
  const options: readonly {
    readonly id: SelectionMode;
    readonly label: string;
    readonly icon: typeof SquareDashed;
  }[] = [
    { id: 'rect', label: 'Chọn khung chữ nhật', icon: SquareDashed },
    { id: 'lasso', label: 'Chọn tự do (Lasso)', icon: Lasso },
    { id: 'spacer', label: 'Chèn khoảng trống (Spacer)', icon: ArrowUpDown },
  ];

  return (
    <div
      data-testid="selection-mode-popover"
      className="w-56 space-y-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-1.5 shadow-2xl"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors',
              mode === opt.id
                ? 'bg-[var(--accent-os)] text-white'
                : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]',
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
