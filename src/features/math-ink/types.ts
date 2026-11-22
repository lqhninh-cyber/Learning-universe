export type PaperPattern = 'blank' | 'ruled' | 'math' | 'math-sm' | 'math-lg' | 'dotted';

export type PaperOrientation = 'portrait' | 'landscape';

export interface PaperConfig {
  readonly pattern: PaperPattern;
  readonly orientation: PaperOrientation;
  readonly backgroundColor: string;
  readonly showBorderLines: boolean;
}

export type PenKind = 'ballpoint' | 'fountain' | 'pencil' | 'highlighter';

export type InkRecognitionMode = 'ink' | 'shape' | 'line' | 'shape-and-line';

export type EraserMode = 'stroke' | 'segment-sm' | 'segment-md' | 'segment-lg';

export type SelectionMode = 'rect' | 'lasso' | 'spacer';

export type ShapeToolKind =
  | 'line'
  | 'dashed-line'
  | 'dash-dot-line'
  | 'arrow'
  | 'double-arrow'
  | 'circle'
  | 'ellipse'
  | 'rect'
  | 'triangle'
  | 'right-triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon';

export type InkActiveTool = 'pen' | 'shape' | 'eraser' | 'select' | 'text';

export type Solid3DPresetKind =
  'pyramid-tri' | 'pyramid-quad' | 'prism-tri' | 'box' | 'cone' | 'cylinder' | 'sphere' | 'oxyz';

export interface InkPoint {
  readonly x: number;
  readonly y: number;
  readonly pressure?: number;
}

export interface InkStroke {
  readonly id: string;
  readonly penKind: PenKind;
  readonly color: string;
  readonly width: number;
  readonly opacity: number;
  readonly points: readonly InkPoint[];
}

export interface InkShapeItem {
  readonly id: string;
  readonly kind: ShapeToolKind;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly color: string;
  readonly width: number;
}

export type Solid3DConstruction =
  | {
      readonly id: string;
      readonly kind: 'midpoint';
      readonly fromVertex: string;
      readonly toVertex: string;
      readonly label: string;
      readonly color?: string;
    }
  | {
      readonly id: string;
      readonly kind: 'centroid';
      readonly vertices: readonly string[];
      readonly label: string;
      readonly color?: string;
    }
  | {
      readonly id: string;
      readonly kind: 'altitude';
      readonly apexVertex: string;
      /** `'base-plane'` = hạ vuông góc xuống mặt đáy, hoặc ID của điểm mục tiêu (đỉnh/trung điểm/trọng tâm) */
      readonly footTarget: string;
      readonly footLabel: string;
      readonly showRightAngle?: boolean;
      readonly color?: string;
    }
  | {
      readonly id: string;
      readonly kind: 'segment';
      readonly fromPoint: string;
      readonly toPoint: string;
      readonly style: 'solid' | 'dashed';
      readonly color?: string;
    };

export interface Ink3DSolidItem {
  readonly id: string;
  readonly preset: Solid3DPresetKind;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly yaw: number;
  readonly pitch: number;
  readonly color: string;
  readonly lineWidth: number;
  readonly showLabels: boolean;
  readonly showAuxLines: boolean;
  readonly dashedHidden: boolean;
  /** Bảng đổi tên đỉnh tùy chỉnh theo ID đỉnh (VD: `{ S: 'P', A: 'M', B: 'N' }`) */
  readonly customLabels?: Readonly<Record<string, string>>;
  /** Danh sách các yếu tố dựng hình phụ: trung điểm, trọng tâm, đường cao, đoạn nối */
  readonly constructions?: readonly Solid3DConstruction[];
}

export interface GraphFunctionEntry {
  readonly id: string;
  readonly expression: string;
  readonly color: string;
  readonly visible: boolean;
}

export interface InkGraphItem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly showGrid: boolean;
  readonly showSpecialPoints: boolean;
  readonly functions: readonly GraphFunctionEntry[];
  readonly integral?: {
    readonly enabled: boolean;
    readonly funcIndex: number;
    readonly from: number;
    readonly to: number;
  };
}

export interface InkTextItem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly color: string;
  readonly fontSize: number;
  readonly isMath: boolean;
}

export interface InkImageItem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly dataUrl: string;
}

export interface InkPage {
  readonly id: string;
  readonly strokes: readonly InkStroke[];
  readonly shapes: readonly InkShapeItem[];
  readonly solids3d: readonly Ink3DSolidItem[];
  readonly graphs: readonly InkGraphItem[];
  readonly texts: readonly InkTextItem[];
  readonly images: readonly InkImageItem[];
}

export interface InkFolder {
  readonly id: string;
  readonly name: string;
  /** `null` = thư mục gốc; chuỗi ID = thư mục cha để chia nhiều cấp mục */
  readonly parentId: string | null;
  readonly color: string;
  readonly createdAt: string;
}

export interface InkNotebook {
  readonly id: string;
  readonly title: string;
  /** ID thư mục chứa vở (`null` = Chưa phân mục / thư mục gốc) */
  readonly folderId?: string | null;
  readonly paper: PaperConfig;
  readonly pages: readonly InkPage[];
  readonly activePageIndex: number;
  readonly updatedAt: string;
}

export interface PenPreset {
  readonly id: string;
  readonly penKind: PenKind;
  readonly color: string;
  readonly width: number;
}

export interface RulerState {
  readonly visible: boolean;
  readonly x: number;
  readonly y: number;
  readonly angleDeg: number;
  readonly length: number;
}

export const PAGE_DIMENSIONS: Readonly<
  Record<PaperOrientation, { readonly width: number; readonly height: number }>
> = {
  portrait: { width: 960, height: 1358 },
  landscape: { width: 1358, height: 960 },
};

export const DEFAULT_PAPER_CONFIG: PaperConfig = {
  pattern: 'math',
  orientation: 'portrait',
  backgroundColor: '#FFFFFF',
  showBorderLines: true,
};

export const DEFAULT_PEN_PRESETS: readonly PenPreset[] = [
  { id: 'pen-black', penKind: 'fountain', color: '#111827', width: 2.6 },
  { id: 'pen-blue', penKind: 'fountain', color: '#1D4ED8', width: 2.6 },
  { id: 'pen-red', penKind: 'fountain', color: '#DC2626', width: 2.8 },
  { id: 'pen-emerald', penKind: 'ballpoint', color: '#1B5E4A', width: 2.6 },
  { id: 'pen-amber', penKind: 'ballpoint', color: '#D97706', width: 2.6 },
  { id: 'pen-violet', penKind: 'ballpoint', color: '#6D28D9', width: 2.4 },
  { id: 'hl-green', penKind: 'highlighter', color: '#22C55E', width: 18 },
  { id: 'hl-amber', penKind: 'highlighter', color: '#FACC15', width: 18 },
  { id: 'hl-cyan', penKind: 'highlighter', color: '#06B6D4', width: 18 },
];

export const SCRBLE_COLOR_PALETTE: readonly string[] = [
  '#111827',
  '#FFFFFF',
  '#D1D5DB',
  '#9CA3AF',
  '#6B7280',
  '#374151',
  '#9D174D',
  '#DC2626',
  '#EA580C',
  '#F59E0B',
  '#FACC15',
  '#FEF08A',
  '#84CC16',
  '#22C55E',
  '#1B5E4A',
  '#0891B2',
  '#1D4ED8',
  '#4338CA',
  '#6D28D9',
  '#581C87',
  '#FBCFE8',
  '#B45309',
  '#7C2D12',
  '#451A03',
];
