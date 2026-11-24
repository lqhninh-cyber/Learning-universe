import { ChevronDown, MousePointer2, Trash2, X } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import {
  formatRatioLabel,
  parseRatioInput,
  type GeoObject,
  type GeoToolKind,
} from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface GeoGebraToolbarProps {
  readonly activeGeoTool: GeoToolKind;
  readonly onSelectGeoTool: (tool: GeoToolKind) => void;
  readonly lineStyle: 'solid' | 'dashed';
  readonly onChangeLineStyle: (style: 'solid' | 'dashed') => void;
  readonly color: string;
  readonly onChangeColor: (color: string) => void;
  readonly stepHint: string;
  readonly pendingCount: number;
  readonly onCancelPending: () => void;
  readonly selectedObject: GeoObject | null;
  readonly onUpdateSelected: (patch: Partial<GeoObject>) => void;
  readonly onDeleteSelected: () => void;
  readonly onExitGeoMode: () => void;
}

interface GeoToolDef {
  readonly id: GeoToolKind;
  readonly label: string;
  readonly shortHint: string;
}

interface GeoToolGroup {
  readonly id: string;
  readonly label: string;
  readonly tools: readonly GeoToolDef[];
}

const GEO_TOOL_GROUPS: readonly GeoToolGroup[] = [
  {
    id: 'points',
    label: 'Điểm',
    tools: [
      { id: 'point-free', label: 'Điểm tự do (A)', shortHint: 'Chạm bất kỳ đâu để đặt điểm' },
      {
        id: 'point-on-object',
        label: 'Điểm trên cạnh / tỉ lệ',
        shortHint: 'Rê dọc đoạn thẳng hoặc đường tròn để đặt điểm ở mọi tỉ số k',
      },
      { id: 'midpoint', label: 'Trung điểm / Tâm', shortHint: 'Chạm 1 đoạn thẳng hoặc 2 điểm' },
      {
        id: 'centroid',
        label: 'Trọng tâm (3 điểm)',
        shortHint: 'Chọn 3 điểm bất kỳ để dựng trọng tâm G',
      },
      {
        id: 'intersect',
        label: 'Giao điểm (I)',
        shortHint: 'Chạm chỗ giao nhau của 2 đường / đường tròn',
      },
    ],
  },
  {
    id: 'lines',
    label: 'Đường',
    tools: [
      { id: 'segment', label: 'Đoạn thẳng AB', shortHint: 'Chọn 2 điểm (hỗ trợ nét liền / đứt)' },
      { id: 'line', label: 'Đường thẳng', shortHint: 'Đường thẳng đi qua 2 điểm' },
      { id: 'ray', label: 'Tia AB', shortHint: 'Tia xuất phát từ A đi qua B' },
      { id: 'vector', label: 'Vectơ →', shortHint: 'Vectơ có mũi tên từ điểm đầu tới điểm cuối' },
    ],
  },
  {
    id: 'construct',
    label: 'Vuông / Song song',
    tools: [
      {
        id: 'perpendicular',
        label: 'Đường vuông góc / Đường cao',
        shortHint: 'Chọn 1 điểm rồi chọn 1 đường/đoạn (tự đánh dấu góc vuông ⊥)',
      },
      { id: 'parallel', label: 'Đường song song', shortHint: 'Chọn 1 điểm rồi chọn 1 đường/đoạn' },
      {
        id: 'perp-bisector',
        label: 'Đường trung trực',
        shortHint: 'Chọn 1 đoạn thẳng hoặc 2 điểm',
      },
      {
        id: 'angle-bisector',
        label: 'Phân giác góc',
        shortHint: 'Chọn 3 điểm A, B, C (B là đỉnh góc)',
      },
      {
        id: 'tangent',
        label: 'Tiếp tuyến đường tròn',
        shortHint: 'Chọn 1 điểm rồi chọn đường tròn',
      },
    ],
  },
  {
    id: 'polygon',
    label: 'Đa giác / MP',
    tools: [
      {
        id: 'polygon',
        label: 'Đa giác / Mặt phẳng tô màu',
        shortHint: 'Chạm lần lượt các đỉnh rồi chạm lại đỉnh đầu để khép kín',
      },
    ],
  },
  {
    id: 'conics',
    label: 'Tròn / Elip',
    tools: [
      {
        id: 'circle-center-point',
        label: 'Đường tròn (Tâm & Điểm)',
        shortHint: 'Chọn tâm O rồi chọn 1 điểm trên đường tròn',
      },
      {
        id: 'circle-3pts',
        label: 'Đường tròn qua 3 điểm',
        shortHint: 'Đường tròn ngoại tiếp qua 3 điểm A, B, C',
      },
      {
        id: 'ellipse',
        label: 'Elip (Tâm & 2 bán trục)',
        shortHint: 'Chọn tâm O, đỉnh trục lớn A, rồi độ rộng trục nhỏ B',
      },
    ],
  },
];

const GEO_COLORS = ['#1D4ED8', '#111827', '#DC2626', '#1B5E4A', '#D97706', '#7C3AED'] as const;

const GeoToolGlyph: FC<{ readonly tool: GeoToolKind }> = ({ tool }) => {
  if (tool === 'point-free' || tool === 'point-on-object') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
        {tool === 'point-on-object' && (
          <line
            x1="2"
            y1="16"
            x2="18"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.55"
          />
        )}
        <circle cx="9.5" cy="10.5" r="3" fill="currentColor" />
        <text x="12.5" y="8" fontSize="7.5" fontStyle="italic" fill="currentColor" fontWeight="700">
          A
        </text>
      </svg>
    );
  }
  if (tool === 'midpoint' || tool === 'centroid') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
        <line
          x1="3"
          y1="15"
          x2="17"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.55"
        />
        <circle cx="4" cy="14.3" r="2" fill="currentColor" opacity="0.65" />
        <circle cx="16" cy="5.7" r="2" fill="currentColor" opacity="0.65" />
        <circle cx="10" cy="10" r="2.7" fill="#DC2626" />
      </svg>
    );
  }
  if (tool === 'intersect') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
        <line x1="3" y1="16" x2="17" y2="4" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3" y1="5" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.6" fill="#DC2626" />
      </svg>
    );
  }
  if (tool === 'segment' || tool === 'line' || tool === 'ray' || tool === 'vector') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
        <line x1="3" y1="15" x2="17" y2="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="5" cy="13.5" r="2" fill="currentColor" />
        {tool === 'vector' ? (
          <path d="M13 4.8 L17.4 4.8 L15.8 8.8" stroke="currentColor" strokeWidth="1.6" />
        ) : (
          <circle cx="15" cy="6.5" r="2" fill="currentColor" />
        )}
      </svg>
    );
  }
  if (
    tool === 'perpendicular' ||
    tool === 'parallel' ||
    tool === 'perp-bisector' ||
    tool === 'angle-bisector' ||
    tool === 'tangent'
  ) {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
        {tool === 'parallel' ? (
          <>
            <line x1="2" y1="13" x2="16" y2="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="17" x2="18" y2="8" stroke="currentColor" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <line
              x1="2"
              y1="14"
              x2="18"
              y2="14"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.65"
            />
            <line x1="10" y1="3" x2="10" y2="17" stroke="#DC2626" strokeWidth="1.6" />
            <path d="M10 10.5 H13.5 V14" stroke="currentColor" strokeWidth="1.2" />
          </>
        )}
      </svg>
    );
  }
  if (tool === 'polygon') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
        <polygon
          points="10,3 17,15 3,15"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="3" r="1.8" fill="currentColor" />
        <circle cx="17" cy="15" r="1.8" fill="currentColor" />
        <circle cx="3" cy="15" r="1.8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
      {tool === 'ellipse' ? (
        <ellipse cx="10" cy="10" rx="7.5" ry="4.8" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      )}
      <circle cx="10" cy="10" r="1.8" fill="currentColor" />
    </svg>
  );
};

export const GeoGebraToolbar: FC<GeoGebraToolbarProps> = ({
  activeGeoTool,
  onSelectGeoTool,
  lineStyle,
  onChangeLineStyle,
  color,
  onChangeColor,
  stepHint,
  pendingCount,
  onCancelPending,
  selectedObject,
  onUpdateSelected,
  onDeleteSelected,
  onExitGeoMode,
}) => {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [ratioDraft, setRatioDraft] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocPointerDown = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenGroupId(null);
      }
    };
    window.addEventListener('pointerdown', onDocPointerDown);
    return () => window.removeEventListener('pointerdown', onDocPointerDown);
  }, []);

  return (
    <div
      ref={barRef}
      data-testid="geogebra-toolbar"
      className="relative z-40 flex flex-wrap items-center justify-between gap-2 border-b border-[#1D4ED8]/20 bg-[#F3F7FD] px-3 py-1.5 text-xs dark:border-[#60A5FA]/20 dark:bg-[#111B26]"
    >
      {/* TRÁI: 6 nhóm công cụ dựng hình động kiểu GeoGebra Classic */}
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          data-testid="geo-tool-move"
          onClick={() => {
            onSelectGeoTool('move');
            setOpenGroupId(null);
          }}
          title="Di chuyển & kéo thả điểm động (toàn bộ đường, trung điểm, đường tròn tự cập nhật)"
          className={cn(
            'inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 font-semibold transition-colors',
            activeGeoTool === 'move'
              ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white shadow-2xs'
              : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)] hover:border-[#1D4ED8]/50',
          )}
        >
          <MousePointer2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Di chuyển</span>
        </button>

        {GEO_TOOL_GROUPS.map((group) => {
          const activeToolInGroup = group.tools.find((t) => t.id === activeGeoTool);
          const isSingle = group.tools.length === 1;
          const displayTool = activeToolInGroup ?? group.tools[0]!;
          const isOpen = openGroupId === group.id;

          return (
            <div key={group.id} className="relative">
              <button
                type="button"
                data-testid={`geo-group-${group.id}`}
                onClick={() => {
                  if (isSingle) {
                    onSelectGeoTool(displayTool.id);
                    setOpenGroupId(null);
                  } else {
                    setOpenGroupId((prev) => (prev === group.id ? null : group.id));
                  }
                }}
                title={displayTool.shortHint}
                className={cn(
                  'inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 font-medium transition-colors',
                  activeToolInGroup
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white shadow-2xs'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)] hover:border-[#1D4ED8]/45',
                )}
              >
                <GeoToolGlyph tool={displayTool.id} />
                <span>
                  {activeToolInGroup ? activeToolInGroup.label.split(' (')[0] : group.label}
                </span>
                {!isSingle && <ChevronDown className="h-3 w-3 opacity-75" aria-hidden="true" />}
              </button>

              {isOpen && !isSingle && (
                <div className="absolute top-8 left-0 z-50 w-64 space-y-0.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-1.5 shadow-2xl">
                  {group.tools.map((tool) => {
                    const isPicked = activeGeoTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        data-testid={`geo-tool-${tool.id}`}
                        onClick={() => {
                          onSelectGeoTool(tool.id);
                          setOpenGroupId(null);
                        }}
                        className={cn(
                          'flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
                          isPicked
                            ? 'bg-[#1D4ED8] text-white'
                            : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]',
                        )}
                      >
                        <span className="mt-0.5">
                          <GeoToolGlyph tool={tool.id} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11.5px] font-semibold">{tool.label}</span>
                          <span
                            className={cn(
                              'block text-[10px] leading-snug',
                              isPicked ? 'text-white/80' : 'text-[var(--text-muted)]',
                            )}
                          >
                            {tool.shortHint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="mx-0.5 h-5 w-px bg-[var(--border-hairline)]" />

        {/* Nét liền / Nét đứt nhanh */}
        <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-0.5 font-mono text-[10px]">
          <button
            type="button"
            data-testid="geo-style-solid"
            onClick={() => {
              onChangeLineStyle('solid');
              if (
                selectedObject &&
                (selectedObject.kind === 'geo-line' || selectedObject.kind === 'geo-conic')
              ) {
                onUpdateSelected({ style: 'solid' });
              } else if (selectedObject?.kind === 'geo-polygon') {
                onUpdateSelected({ borderStyle: 'solid' });
              }
            }}
            className={cn(
              'cursor-pointer rounded px-1.5 py-0.5 font-semibold',
              lineStyle === 'solid' ? 'bg-[#17332C] text-white' : 'text-[var(--text-secondary)]',
            )}
          >
            Liền
          </button>
          <button
            type="button"
            data-testid="geo-style-dashed"
            onClick={() => {
              onChangeLineStyle('dashed');
              if (
                selectedObject &&
                (selectedObject.kind === 'geo-line' || selectedObject.kind === 'geo-conic')
              ) {
                onUpdateSelected({ style: 'dashed' });
              } else if (selectedObject?.kind === 'geo-polygon') {
                onUpdateSelected({ borderStyle: 'dashed' });
              }
            }}
            className={cn(
              'cursor-pointer rounded px-1.5 py-0.5 font-semibold',
              lineStyle === 'dashed' ? 'bg-[#17332C] text-white' : 'text-[var(--text-secondary)]',
            )}
          >
            Đứt
          </button>
        </div>

        {/* Bảng màu nhanh */}
        <div className="flex items-center gap-1 pl-0.5">
          {GEO_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Chọn màu hình học ${hex}`}
              onClick={() => {
                onChangeColor(hex);
                if (selectedObject) onUpdateSelected({ color: hex });
              }}
              style={{ backgroundColor: hex }}
              className={cn(
                'h-4 w-4 cursor-pointer rounded-full border border-black/15',
                color === hex && 'ring-2 ring-[#1D4ED8] ring-offset-1',
              )}
            />
          ))}
        </div>
      </div>

      {/* PHẢI: Bộ thanh tra nhanh đối tượng đang chọn (Tỉ số k / Nhãn / Xóa) HOẶC Gợi ý bước tiếp theo */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedObject && activeGeoTool === 'move' ? (
          <div
            data-testid="geo-selected-inspector"
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#1D4ED8]/30 bg-[var(--bg-workspace)] px-2 py-0.5 text-[11px]"
          >
            {selectedObject.kind === 'geo-point' && (
              <>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">Tên:</span>
                <input
                  type="text"
                  maxLength={5}
                  value={selectedObject.label}
                  onChange={(e) => onUpdateSelected({ label: e.target.value })}
                  aria-label="Đổi tên điểm"
                  className="w-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1 py-0.5 text-center font-serif text-xs font-semibold italic"
                />
              </>
            )}

            {selectedObject.kind === 'geo-point' && selectedObject.pointMode === 'on-segment' && (
              <>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">Tỉ số k:</span>
                <input
                  type="range"
                  data-testid="geo-point-ratio-slider"
                  min={0.03}
                  max={0.97}
                  step={0.01}
                  value={selectedObject.t}
                  onChange={(e) => {
                    setRatioDraft(null);
                    onUpdateSelected({ t: Number(e.target.value) });
                  }}
                  className="w-20 accent-[#1D4ED8]"
                />
                <input
                  type="text"
                  data-testid="geo-point-ratio-input"
                  value={ratioDraft ?? formatRatioLabel(selectedObject.t)}
                  onChange={(e) => setRatioDraft(e.target.value)}
                  onBlur={() => {
                    if (ratioDraft !== null) {
                      const parsed = parseRatioInput(ratioDraft);
                      if (parsed !== null) onUpdateSelected({ t: parsed });
                    }
                    setRatioDraft(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (ratioDraft !== null) {
                        const parsed = parseRatioInput(ratioDraft);
                        if (parsed !== null) onUpdateSelected({ t: parsed });
                      }
                      setRatioDraft(null);
                    }
                  }}
                  title="Nhập phân số (VD: 1/3, 2/5) hoặc thập phân (0.35)"
                  className="w-12 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1 py-0.5 text-center font-mono text-[10.5px]"
                />
              </>
            )}

            {selectedObject.kind === 'geo-polygon' && (
              <>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">Nhãn MP:</span>
                <input
                  type="text"
                  maxLength={6}
                  value={selectedObject.label ?? ''}
                  placeholder="α, P..."
                  onChange={(e) => onUpdateSelected({ label: e.target.value })}
                  className="w-12 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1 py-0.5 text-center font-serif text-xs italic"
                />
              </>
            )}

            <button
              type="button"
              data-testid="geo-delete-selected-btn"
              onClick={onDeleteSelected}
              title="Xóa đối tượng hình học đang chọn"
              className="inline-flex h-6 cursor-pointer items-center gap-0.5 rounded px-1.5 text-[10.5px] font-semibold text-[#8F3D35] hover:bg-[#FDF2F2] dark:hover:bg-[#261414]"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              <span>Xóa</span>
            </button>
          </div>
        ) : (
          <span
            data-testid="geo-step-hint"
            className="font-mono text-[10.5px] font-medium text-[#1D4ED8] dark:text-[#93C5FD]"
          >
            {stepHint}
          </span>
        )}

        {pendingCount > 0 && (
          <button
            type="button"
            onClick={onCancelPending}
            className="cursor-pointer rounded-md border border-[#1D4ED8]/30 bg-[var(--bg-workspace)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1D4ED8]"
          >
            Hủy bước ({pendingCount})
          </button>
        )}

        <button
          type="button"
          onClick={onExitGeoMode}
          title="Quay lại Bút viết"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-main)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default GeoGebraToolbar;
