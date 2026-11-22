import { Stamp, X } from 'lucide-react';
import { type FC } from 'react';
import { GEOMETRY_STAMP_PRESETS, type GeometryStampKind } from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface StampToolConfig {
  readonly kind: GeometryStampKind;
  readonly size: number;
  readonly rotationDeg: number;
  readonly color: string;
  readonly label: string;
}

export interface GeometryStampsPopoverProps {
  readonly config: StampToolConfig;
  readonly onChange: (next: StampToolConfig) => void;
  readonly onSelectAndActivate: (next: StampToolConfig) => void;
  readonly onClose: () => void;
}

const STAMP_COLORS = ['#111827', '#DC2626', '#1D4ED8', '#1B5E4A', '#9E763B', '#6D28D9'] as const;
const QUICK_ANGLES = [0, 45, 90, 180, 270] as const;

const StampGlyph: FC<{ readonly kind: GeometryStampKind }> = ({ kind }) => {
  if (kind === 'right-angle') {
    return (
      <svg
        viewBox="0 0 28 28"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="8"
          y="8"
          width="12"
          height="12"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="none"
        />
        <path d="M8 8 H20 V20" />
      </svg>
    );
  }
  if (kind === 'tick-1' || kind === 'tick-2' || kind === 'tick-3') {
    const offsets = kind === 'tick-1' ? [14] : kind === 'tick-2' ? [11, 17] : [9, 14, 19];
    return (
      <svg
        viewBox="0 0 28 28"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="14" x2="25" y2="14" strokeOpacity="0.3" strokeWidth="1.4" />
        {offsets.map((x) => (
          <line key={x} x1={x - 2} y1="8" x2={x + 2} y2="20" />
        ))}
      </svg>
    );
  }
  if (kind === 'angle-arc-1' || kind === 'angle-arc-2') {
    return (
      <svg
        viewBox="0 0 28 28"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 22 L22 22 M6 22 L17 7" strokeOpacity="0.3" strokeWidth="1.4" />
        <path d="M16 22 A10 10 0 0 0 12.5 13.8" />
        {kind === 'angle-arc-2' && <path d="M13 22 A7 7 0 0 0 10.6 16.2" />}
      </svg>
    );
  }
  if (kind === 'parallel-1' || kind === 'parallel-2') {
    return (
      <svg
        viewBox="0 0 28 28"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="14" x2="25" y2="14" strokeOpacity="0.3" strokeWidth="1.4" />
        {kind === 'parallel-1' ? (
          <path d="M11 8 L18 14 L11 20" />
        ) : (
          <>
            <path d="M8 8 L14 14 L8 20" />
            <path d="M14 8 L20 14 L14 20" />
          </>
        )}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6" fill="currentColor">
      <circle cx="11" cy="17" r="3.6" />
      <text x="16" y="13" fontSize="11" fontStyle="italic" fontFamily="Georgia, serif">
        A
      </text>
    </svg>
  );
};

export const GeometryStampsPopover: FC<GeometryStampsPopoverProps> = ({
  config,
  onChange,
  onSelectAndActivate,
  onClose,
}) => {
  const needsLabel =
    config.kind === 'dot-point' || config.kind === 'angle-arc-1' || config.kind === 'angle-arc-2';

  return (
    <div
      data-testid="geometry-stamps-popover"
      className="w-[320px] max-w-[92vw] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 shadow-2xl"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
          <Stamp className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <span>Con dấu Hình học phẳng</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp con dấu hình học"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Lưới 9 con dấu */}
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {GEOMETRY_STAMP_PRESETS.map((preset) => {
          const active = config.kind === preset.kind;
          return (
            <button
              key={preset.kind}
              type="button"
              data-testid={`stamp-preset-${preset.kind}`}
              title={preset.shortHint}
              onClick={() => onSelectAndActivate({ ...config, kind: preset.kind })}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-center transition-colors',
                active
                  ? 'border-[#17332C] bg-[#17332C] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-os)] hover:text-[var(--text-main)]',
              )}
            >
              <StampGlyph kind={preset.kind} />
              <span className="text-[10px] leading-tight font-medium">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tùy chỉnh góc xoay, kích thước, nhãn & màu */}
      <div className="space-y-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/65 p-2.5 text-[11px]">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Góc xoay</span>
            <span className="font-mono font-semibold text-[var(--text-main)]">
              {config.rotationDeg}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={345}
            step={15}
            value={config.rotationDeg}
            onChange={(e) => onChange({ ...config, rotationDeg: Number(e.target.value) })}
            className="w-full accent-[var(--accent-os)]"
          />
          <div className="mt-1 flex items-center gap-1">
            {QUICK_ANGLES.map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => onChange({ ...config, rotationDeg: deg })}
                className={cn(
                  'flex-1 cursor-pointer rounded border py-0.5 font-mono text-[10px]',
                  config.rotationDeg === deg
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                )}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[var(--text-muted)]">Cỡ ({config.size}px)</span>
          <input
            type="range"
            min={20}
            max={72}
            step={4}
            value={config.size}
            onChange={(e) => onChange({ ...config, size: Number(e.target.value) })}
            className="flex-1 accent-[var(--accent-os)]"
          />
        </div>

        {needsLabel && (
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[var(--text-muted)]">Nhãn</span>
            <input
              type="text"
              data-testid="stamp-label-input"
              value={config.label}
              onChange={(e) => onChange({ ...config, label: e.target.value })}
              placeholder={config.kind === 'dot-point' ? 'VD: A, M, H...' : 'VD: α, 60°'}
              className="min-w-0 flex-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs focus:border-[var(--accent-os)] focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5">
            {STAMP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...config, color: c })}
                style={{ backgroundColor: c }}
                aria-label={`Chọn màu con dấu ${c}`}
                className={cn(
                  'h-5 w-5 cursor-pointer rounded-full border border-black/15',
                  config.color === c && 'ring-2 ring-[var(--accent-os)] ring-offset-1',
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Chạm trang để đóng dấu</span>
        </div>
      </div>
    </div>
  );
};
