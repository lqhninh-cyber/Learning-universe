import {
  ArrowRight,
  ArrowUpRight,
  Music,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import {
  PENTATONIC_STRING_NOTES,
  playMarbleClick,
  playPegTap,
  playStringPluck,
  unlockPentatonicAudio,
  type PentatonicNoteLabel,
  type PentatonicVoiceMode,
} from '@/utils/pentatonicAudio';

export interface KineticSoundStageProps {
  readonly className?: string;
}

const MAX_MARBLES = 48;
const HOLD_SPAWN_INTERVAL_MS = 110;
const AUTO_DROP_INTERVAL_SEC = 3.2;
const MARBLE_RAIN_COUNT = 14;
const PEG_RADIUS_PX = 4.5;
const TRAIL_LENGTH = 6;

interface MarblePaletteSpec {
  readonly id: 'jade' | 'bronze' | 'slate' | 'terracotta';
  readonly name: string;
  readonly coreHex: string;
  readonly lightHex: string;
  readonly shadowHex: string;
  readonly trailRgba: string;
}

const MARBLE_PALETTES: readonly MarblePaletteSpec[] = [
  {
    id: 'jade',
    name: 'Ngọc Bích',
    coreHex: '#3B7A65',
    lightHex: '#79BFA7',
    shadowHex: '#1D4337',
    trailRgba: 'rgba(59, 122, 101, 0.24)',
  },
  {
    id: 'bronze',
    name: 'Đồng Cổ',
    coreHex: '#9C7A4C',
    lightHex: '#D8B98A',
    shadowHex: '#594224',
    trailRgba: 'rgba(156, 122, 76, 0.25)',
  },
  {
    id: 'slate',
    name: 'Đá Lam Phiến',
    coreHex: '#2D5266',
    lightHex: '#6CA0BC',
    shadowHex: '#172E3B',
    trailRgba: 'rgba(45, 82, 102, 0.24)',
  },
  {
    id: 'terracotta',
    name: 'Đất Nung',
    coreHex: '#9E6356',
    lightHex: '#D69B8E',
    shadowHex: '#5C342B',
    trailRgba: 'rgba(158, 99, 86, 0.24)',
  },
] as const;

interface TrailPoint {
  x: number;
  y: number;
}

interface MarbleEntity {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  paletteIndex: number;
  trail: TrailPoint[];
  lastStringHitId: number;
  lastStringHitAgeSec: number;
}

interface BrassPeg {
  readonly index: number;
  readonly nx: number;
  readonly ny: number;
  glow: number;
}

interface ElasticString {
  readonly index: number;
  readonly note: PentatonicNoteLabel;
  readonly x1Ratio: number;
  readonly y1Ratio: number;
  readonly x2Ratio: number;
  readonly y2Ratio: number;
  readonly colorHex: string;
  bend: number;
  bendVel: number;
  contactRatio: number;
  glow: number;
}

interface StageRipple {
  active: boolean;
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  colorRgba: string;
}

interface LayoutBlueprint {
  readonly id: number;
  readonly name: string;
  readonly pegs: readonly { readonly nx: number; readonly ny: number }[];
  readonly strings: readonly {
    readonly x1Ratio: number;
    readonly y1Ratio: number;
    readonly x2Ratio: number;
    readonly y2Ratio: number;
  }[];
}

const STRING_COLORS = [
  '#9C7A4C', // D4 Đồng Cổ
  '#3B7A65', // E4 Ngọc Bích
  '#2D5266', // G4 Đá Lam Phiến
  '#9E6356', // A4 Đất Nung
  '#8C6228', // B4 Hoàng Đồng
  '#245746', // D5 Lục Ngọc Trầm
] as const;

/**
 * 3 sơ đồ bố trí Ma trận Chốt Đồng Thau (18-24 chốt) & 6 Sợi Dây Đàn Ngũ Cung nghiêng chéo
 */
const STAGE_LAYOUT_BLUEPRINTS: readonly LayoutBlueprint[] = [
  {
    id: 0,
    name: 'Vòm Cung Đông Sơn',
    pegs: [
      // Hàng 1 (6 chốt)
      { nx: 0.18, ny: 0.2 },
      { nx: 0.31, ny: 0.17 },
      { nx: 0.44, ny: 0.15 },
      { nx: 0.56, ny: 0.15 },
      { nx: 0.69, ny: 0.17 },
      { nx: 0.82, ny: 0.2 },
      // Hàng 2 (7 chốt so le)
      { nx: 0.14, ny: 0.33 },
      { nx: 0.26, ny: 0.3 },
      { nx: 0.38, ny: 0.28 },
      { nx: 0.5, ny: 0.27 },
      { nx: 0.62, ny: 0.28 },
      { nx: 0.74, ny: 0.3 },
      { nx: 0.86, ny: 0.33 },
      // Hàng 3 (7 chốt dẫn hướng xuống dây đàn)
      { nx: 0.2, ny: 0.45 },
      { nx: 0.32, ny: 0.43 },
      { nx: 0.44, ny: 0.41 },
      { nx: 0.5, ny: 0.46 },
      { nx: 0.56, ny: 0.41 },
      { nx: 0.68, ny: 0.43 },
      { nx: 0.8, ny: 0.45 },
    ],
    strings: [
      { x1Ratio: 0.07, y1Ratio: 0.54, x2Ratio: 0.34, y2Ratio: 0.64 },
      { x1Ratio: 0.2, y1Ratio: 0.72, x2Ratio: 0.47, y2Ratio: 0.62 },
      { x1Ratio: 0.37, y1Ratio: 0.55, x2Ratio: 0.63, y2Ratio: 0.65 },
      { x1Ratio: 0.53, y1Ratio: 0.62, x2Ratio: 0.8, y2Ratio: 0.72 },
      { x1Ratio: 0.66, y1Ratio: 0.64, x2Ratio: 0.93, y2Ratio: 0.54 },
      { x1Ratio: 0.31, y1Ratio: 0.83, x2Ratio: 0.69, y2Ratio: 0.86 },
    ],
  },
  {
    id: 1,
    name: 'Thác Ngọc So Le',
    pegs: [
      // 22 chốt xếp lưới kim cương Galton
      { nx: 0.22, ny: 0.16 },
      { nx: 0.36, ny: 0.16 },
      { nx: 0.5, ny: 0.16 },
      { nx: 0.64, ny: 0.16 },
      { nx: 0.78, ny: 0.16 },
      { nx: 0.15, ny: 0.27 },
      { nx: 0.29, ny: 0.27 },
      { nx: 0.43, ny: 0.27 },
      { nx: 0.57, ny: 0.27 },
      { nx: 0.71, ny: 0.27 },
      { nx: 0.85, ny: 0.27 },
      { nx: 0.22, ny: 0.38 },
      { nx: 0.36, ny: 0.38 },
      { nx: 0.5, ny: 0.38 },
      { nx: 0.64, ny: 0.38 },
      { nx: 0.78, ny: 0.38 },
      { nx: 0.17, ny: 0.49 },
      { nx: 0.31, ny: 0.49 },
      { nx: 0.45, ny: 0.49 },
      { nx: 0.55, ny: 0.49 },
      { nx: 0.69, ny: 0.49 },
      { nx: 0.83, ny: 0.49 },
    ],
    strings: [
      { x1Ratio: 0.08, y1Ratio: 0.58, x2Ratio: 0.38, y2Ratio: 0.66 },
      { x1Ratio: 0.62, y1Ratio: 0.66, x2Ratio: 0.92, y2Ratio: 0.58 },
      { x1Ratio: 0.14, y1Ratio: 0.73, x2Ratio: 0.46, y2Ratio: 0.68 },
      { x1Ratio: 0.54, y1Ratio: 0.68, x2Ratio: 0.86, y2Ratio: 0.73 },
      { x1Ratio: 0.22, y1Ratio: 0.84, x2Ratio: 0.52, y2Ratio: 0.78 },
      { x1Ratio: 0.48, y1Ratio: 0.87, x2Ratio: 0.78, y2Ratio: 0.81 },
    ],
  },
  {
    id: 2,
    name: 'Song Khê Giao Thoa',
    pegs: [
      // 24 chốt chia 2 nhánh suối hội tụ
      { nx: 0.14, ny: 0.16 },
      { nx: 0.25, ny: 0.19 },
      { nx: 0.36, ny: 0.22 },
      { nx: 0.64, ny: 0.22 },
      { nx: 0.75, ny: 0.19 },
      { nx: 0.86, ny: 0.16 },
      { nx: 0.19, ny: 0.29 },
      { nx: 0.3, ny: 0.32 },
      { nx: 0.42, ny: 0.28 },
      { nx: 0.5, ny: 0.24 },
      { nx: 0.58, ny: 0.28 },
      { nx: 0.7, ny: 0.32 },
      { nx: 0.81, ny: 0.29 },
      { nx: 0.15, ny: 0.41 },
      { nx: 0.26, ny: 0.44 },
      { nx: 0.37, ny: 0.4 },
      { nx: 0.46, ny: 0.37 },
      { nx: 0.54, ny: 0.37 },
      { nx: 0.63, ny: 0.4 },
      { nx: 0.74, ny: 0.44 },
      { nx: 0.85, ny: 0.41 },
      { nx: 0.33, ny: 0.51 },
      { nx: 0.5, ny: 0.48 },
      { nx: 0.67, ny: 0.51 },
    ],
    strings: [
      { x1Ratio: 0.06, y1Ratio: 0.52, x2Ratio: 0.35, y2Ratio: 0.63 },
      { x1Ratio: 0.65, y1Ratio: 0.63, x2Ratio: 0.94, y2Ratio: 0.52 },
      { x1Ratio: 0.24, y1Ratio: 0.68, x2Ratio: 0.54, y2Ratio: 0.59 },
      { x1Ratio: 0.46, y1Ratio: 0.59, x2Ratio: 0.76, y2Ratio: 0.68 },
      { x1Ratio: 0.12, y1Ratio: 0.81, x2Ratio: 0.48, y2Ratio: 0.86 },
      { x1Ratio: 0.52, y1Ratio: 0.86, x2Ratio: 0.88, y2Ratio: 0.81 },
    ],
  },
] as const;

function buildLayoutEntities(layoutIndex: number): {
  pegs: BrassPeg[];
  strings: ElasticString[];
} {
  const blueprint =
    STAGE_LAYOUT_BLUEPRINTS[layoutIndex % STAGE_LAYOUT_BLUEPRINTS.length] ??
    STAGE_LAYOUT_BLUEPRINTS[0]!;

  const pegs: BrassPeg[] = blueprint.pegs.map((p, idx) => ({
    index: idx,
    nx: p.nx,
    ny: p.ny,
    glow: 0,
  }));

  const strings: ElasticString[] = blueprint.strings.map((s, idx) => ({
    index: idx,
    note: PENTATONIC_STRING_NOTES[idx] ?? 'D4',
    x1Ratio: s.x1Ratio,
    y1Ratio: s.y1Ratio,
    x2Ratio: s.x2Ratio,
    y2Ratio: s.y2Ratio,
    colorHex: STRING_COLORS[idx] ?? '#9C7A4C',
    bend: 0,
    bendVel: 0,
    contactRatio: 0.5,
    glow: 0,
  }));

  return { pegs, strings };
}

/**
 * Khoảng cách có dấu và vị trí chiếu từ điểm P(px, py) lên đoạn thẳng A(x1, y1) -> B(x2, y2).
 */
function projectPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { dist: number; t: number; cx: number; cy: number; nx: number; ny: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy || 1;
  const rawT = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  const t = Math.max(0, Math.min(1, rawT));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  const dist = Math.hypot(px - cx, py - cy);
  const len = Math.sqrt(lenSq) || 1;
  // Pháp tuyến đơn vị vuông góc với dây
  const nx = -dy / len;
  const ny = dx / len;
  return { dist, t, cx, cy, nx, ny };
}

/**
 * Kiểm tra giao điểm giữa đoạn quét chuột (ax, ay)->(bx, by) và dây đàn (cx, cy)->(dx, dy).
 */
function intersectSegments(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): { hit: boolean; tString: number } {
  const rX = bx - ax;
  const rY = by - ay;
  const sX = dx - cx;
  const sY = dy - cy;
  const denom = rX * sY - rY * sX;
  if (Math.abs(denom) < 1e-5) {
    return { hit: false, tString: 0.5 };
  }
  const u = ((cx - ax) * rY - (cy - ay) * rX) / denom;
  const t = ((cx - ax) * sY - (cy - ay) * sX) / denom;
  if (t >= 0 && t <= 1 && u >= 0.02 && u <= 0.98) {
    return { hit: true, tString: u };
  }
  return { hit: false, tString: 0.5 };
}

interface KineticStageWorld {
  width: number;
  height: number;
  dpr: number;
  marbles: MarbleEntity[];
  marbleCursor: number;
  pegs: BrassPeg[];
  strings: ElasticString[];
  ripples: StageRipple[];
  rippleCursor: number;
  pointerDown: boolean;
  pointerX: number;
  pointerY: number;
  prevPointerX: number;
  prevPointerY: number;
  pointerActive: boolean;
  holdTimerMs: number;
  autoDropTimerSec: number;
  boardShakeOffset: number;
  rainTimeouts: number[];
}

function createKineticStageWorld(): KineticStageWorld {
  return {
    width: 960,
    height: 500,
    dpr: 1,
    marbles: Array.from({ length: MAX_MARBLES }, (_, idx) => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 8.5,
      paletteIndex: idx % MARBLE_PALETTES.length,
      trail: [],
      lastStringHitId: -1,
      lastStringHitAgeSec: 99,
    })),
    marbleCursor: 0,
    ...buildLayoutEntities(0),
    ripples: Array.from({ length: 24 }, () => ({
      active: false,
      x: 0,
      y: 0,
      r: 4,
      maxR: 24,
      alpha: 0,
      colorRgba: 'rgba(156, 122, 76, 0.72)',
    })),
    rippleCursor: 0,
    pointerDown: false,
    pointerX: 480,
    pointerY: 90,
    prevPointerX: 480,
    prevPointerY: 90,
    pointerActive: false,
    holdTimerMs: 0,
    autoDropTimerSec: 0,
    boardShakeOffset: 0,
    rainTimeouts: [],
  };
}

/**
 * SCREEN 3: SÂN KHẤU TƯƠNG TÁC "MÁY THẢ BI KHOÁNG THẠCH & ĐÀN DÂY NGŨ CUNG" 120FPS
 * - Vật lý 2D chuẩn 120fps (dtScale): 4 loại bi khoáng thạch (tối đa 48 bi), 18-24 chốt đồng thau & 6 dây đàn hồi.
 * - Bộ tổng hợp âm thanh Web Audio API thuần túy (Ngũ cung D-Major 2 quãng tám, chuyển đổi Đàn dây / Chuông gió).
 * - Không chứa văn bản liệt kê tính năng phần mềm; tích hợp trực tiếp các nút chơi vui nhộn & điều hướng cuối trang.
 */
export function KineticSoundStage({ className }: KineticSoundStageProps = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [voiceMode, setVoiceMode] = useState<PentatonicVoiceMode>('pluck');
  const [layoutIndex, setLayoutIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const stageWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const soundEnabledRef = useRef(isSoundEnabled);
  const voiceModeRef = useRef<PentatonicVoiceMode>(voiceMode);

  useEffect(() => {
    soundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  const worldRef = useRef<KineticStageWorld | null>(null);
  const getWorld = useCallback((): KineticStageWorld => {
    if (!worldRef.current) {
      worldRef.current = createKineticStageWorld();
    }
    return worldRef.current;
  }, []);

  const spawnRipple = useCallback(
    (x: number, y: number, maxR = 24, colorRgba = 'rgba(156, 122, 76, 0.75)') => {
      const w = getWorld();
      const ripple = w.ripples[w.rippleCursor % w.ripples.length];
      w.rippleCursor = (w.rippleCursor + 1) % w.ripples.length;
      if (!ripple) return;
      ripple.active = true;
      ripple.x = x;
      ripple.y = y;
      ripple.r = 4.5;
      ripple.maxR = maxR;
      ripple.alpha = 0.88;
      ripple.colorRgba = colorRgba;
    },
    [getWorld],
  );

  const spawnMarbleAt = useCallback(
    (x: number, y: number, vx = (Math.random() - 0.5) * 75, vy = 20, showRipple = true) => {
      const w = getWorld();
      const marble = w.marbles[w.marbleCursor % MAX_MARBLES];
      const idx = w.marbleCursor;
      w.marbleCursor = (w.marbleCursor + 1) % MAX_MARBLES;
      if (!marble) return;

      const clampedX = Math.max(24, Math.min(w.width - 24, x));
      const clampedY = Math.max(16, Math.min(w.height - 36, y));
      const radius = 7.5 + (idx % 4) * 1.0; // 7.5px -> 10.5px

      marble.active = true;
      marble.x = clampedX;
      marble.y = clampedY;
      marble.vx = vx;
      marble.vy = vy;
      marble.r = radius;
      marble.paletteIndex = idx % MARBLE_PALETTES.length;
      marble.trail = [{ x: clampedX, y: clampedY }];
      marble.lastStringHitId = -1;
      marble.lastStringHitAgeSec = 99;

      if (showRipple) {
        spawnRipple(clampedX, clampedY, 26, 'rgba(156, 122, 76, 0.68)');
      }
    },
    [getWorld, spawnRipple],
  );

  // Nút 1: Thả mưa bi (14 viên bi rơi lệch nhịp tạo thành khúc nhạc ngũ cung vui tai)
  const handleMarbleRain = useCallback(() => {
    if (soundEnabledRef.current) {
      unlockPentatonicAudio();
    }
    const w = getWorld();
    for (const tid of w.rainTimeouts) {
      window.clearTimeout(tid);
    }
    w.rainTimeouts = [];

    for (let i = 0; i < MARBLE_RAIN_COUNT; i += 1) {
      const ratio =
        0.14 + (((i * 0.72) / Math.max(1, MARBLE_RAIN_COUNT - 1) + (i % 2) * 0.04) % 0.74);
      const spawnX = w.width * ratio;
      const spawnY = 26 + (i % 3) * 10;
      const vx = (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 11);

      if (i === 0 || prefersReducedMotion) {
        spawnMarbleAt(spawnX, spawnY, vx, 35 + (i % 3) * 12, true);
      } else {
        const tid = window.setTimeout(() => {
          spawnMarbleAt(spawnX, spawnY, vx, 30, true);
        }, i * 85);
        w.rainTimeouts.push(tid);
      }
    }
  }, [getWorld, prefersReducedMotion, spawnMarbleAt]);

  // Nút 2: Rung bảng (tạo xung lực hất tung các viên bi đang nảy & kích nhẹ dây đàn)
  const handleShakeBoard = useCallback(() => {
    if (soundEnabledRef.current) {
      unlockPentatonicAudio();
    }
    const w = getWorld();
    w.boardShakeOffset = 7;

    let activeCount = 0;
    for (const m of w.marbles) {
      if (!m.active) continue;
      activeCount += 1;
      m.vy = -Math.abs(m.vy) * 0.55 - (220 + (m.paletteIndex % 3) * 65);
      m.vx += (m.x < w.width * 0.5 ? 1 : -1) * (95 + (m.paletteIndex % 4) * 35);
      spawnRipple(m.x, m.y, 22, 'rgba(59, 122, 101, 0.55)');
    }

    // Nếu trên sân khấu đang ít bi, tung thêm 4 viên bi nảy từ giữa sân
    if (activeCount < 3) {
      for (let i = 0; i < 4; i += 1) {
        const sx = w.width * (0.28 + i * 0.15);
        spawnMarbleAt(sx, w.height * 0.35, (i - 1.5) * 90, -180, true);
      }
    }

    // Rung nhẹ các sợi dây đàn
    w.strings.forEach((str, idx) => {
      str.bendVel += (idx % 2 === 0 ? 1 : -1) * 140;
      str.glow = Math.max(str.glow, 0.72);
    });
    if (soundEnabledRef.current) {
      playStringPluck(2, 0.55, voiceModeRef.current);
      playStringPluck(4, 0.45, voiceModeRef.current);
    }
  }, [getWorld, spawnMarbleAt, spawnRipple]);

  // Nút 3: Xếp lại dây (chuyển đổi qua lại giữa 3 sơ đồ bố trí chốt & dây đàn)
  const handleCycleLayout = useCallback(() => {
    if (soundEnabledRef.current) {
      unlockPentatonicAudio();
    }
    setLayoutIndex((prev) => {
      const next = (prev + 1) % STAGE_LAYOUT_BLUEPRINTS.length;
      const entities = buildLayoutEntities(next);
      const w = getWorld();
      w.pegs = entities.pegs;
      w.strings = entities.strings;
      w.strings.forEach((s, idx) => {
        s.bend = (idx % 2 === 0 ? 1 : -1) * 8;
        s.glow = 0.85;
      });
      if (soundEnabledRef.current) {
        playStringPluck(next * 2, 0.6, voiceModeRef.current);
      }
      return next;
    });
  }, [getWorld]);

  const handleToggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      if (next) {
        unlockPentatonicAudio();
        playStringPluck(0, 0.65, voiceModeRef.current);
      }
      return next;
    });
  }, []);

  const handleSelectVoiceMode = useCallback((mode: PentatonicVoiceMode) => {
    setVoiceMode(mode);
    voiceModeRef.current = mode;
    if (soundEnabledRef.current) {
      unlockPentatonicAudio();
      playStringPluck(3, 0.65, mode);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = stageWrapperRef.current;
    const section = sectionRef.current;
    if (!canvas || !wrapper || typeof window === 'undefined') return;

    const ctx = getLowLatency2DContext(canvas, { alpha: false });
    if (!ctx) return;

    const w = getWorld();

    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const nextW = Math.max(320, Math.floor(rect.width || 960));
      const nextH = Math.max(360, Math.floor(rect.height || 500));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      w.width = nextW;
      w.height = nextH;
      w.dpr = dpr;

      canvas.width = Math.round(nextW * dpr);
      canvas.height = Math.round(nextH * dpr);
      canvas.style.width = `${nextW}px`;
      canvas.style.height = `${nextH}px`;
    };

    updateSize();

    // Khởi tạo 3 viên bi mở màn để khung hình đầu tiên luôn sống động
    if (!w.marbles.some((m) => m.active)) {
      spawnMarbleAt(w.width * 0.34, w.height * 0.14, 28, 35, false);
      spawnMarbleAt(w.width * 0.52, w.height * 0.09, -24, 20, false);
      spawnMarbleAt(w.width * 0.66, w.height * 0.18, -18, 42, false);
    }

    const stepPhysics = (dtSeconds: number, dtScale: number) => {
      const width = w.width;
      const height = w.height;
      const gravity = 520; // px/s^2
      const airDrag = Math.pow(0.996, dtScale);

      // Giảm chấn rung bảng
      w.boardShakeOffset *= Math.pow(0.82, dtScale);
      if (Math.abs(w.boardShakeOffset) < 0.08) {
        w.boardShakeOffset = 0;
      }

      // Nhấn giữ chuột: thả liên tiếp chuỗi bi mỗi 110ms
      if (w.pointerDown) {
        w.holdTimerMs += dtSeconds * 1000;
        if (w.holdTimerMs >= HOLD_SPAWN_INTERVAL_MS) {
          w.holdTimerMs %= HOLD_SPAWN_INTERVAL_MS;
          const jitterX = (Math.random() - 0.5) * 22;
          const spawnY = Math.min(w.pointerY, height * 0.72);
          spawnMarbleAt(w.pointerX + jitterX, spawnY, (Math.random() - 0.5) * 85, 35, true);
        }
      }

      // Tự động thả nhẹ 1 viên bi mở màn sau mỗi 3.2s
      w.autoDropTimerSec += dtSeconds;
      if (w.autoDropTimerSec >= AUTO_DROP_INTERVAL_SEC) {
        w.autoDropTimerSec = 0;
        const activeMarbles = w.marbles.filter((m) => m.active).length;
        if (activeMarbles < MAX_MARBLES - 4) {
          const dropNx = 0.22 + ((w.marbleCursor * 0.17) % 0.56);
          spawnMarbleAt(width * dropNx, 22, Math.sin(w.marbleCursor * 1.7) * 48, 24, true);
        }
      }

      // Cập nhật chốt đồng thau
      for (const peg of w.pegs) {
        if (peg.glow > 0.005) {
          peg.glow *= Math.pow(0.9, dtScale);
        } else {
          peg.glow = 0;
        }
      }

      // Cập nhật dao động đàn hồi của 6 sợi dây đàn ở 120fps
      for (const str of w.strings) {
        const springK = 340;
        const damping = Math.pow(0.91, dtScale);
        str.bendVel += -springK * str.bend * dtSeconds;
        str.bendVel *= damping;
        str.bend += str.bendVel * dtSeconds;

        if (Math.abs(str.bend) < 0.05 && Math.abs(str.bendVel) < 0.2) {
          str.bend = 0;
          str.bendVel = 0;
        }
        if (str.glow > 0.005) {
          str.glow *= Math.pow(0.93, dtScale);
        } else {
          str.glow = 0;
        }
      }

      // Cập nhật các vòng sóng lan tỏa
      for (const ripple of w.ripples) {
        if (!ripple.active) continue;
        ripple.r += 58 * dtSeconds;
        ripple.alpha = Math.max(0, 0.88 * (1 - ripple.r / ripple.maxR));
        if (ripple.r >= ripple.maxR) {
          ripple.active = false;
        }
      }

      // Cập nhật chuyển động & va chạm của các viên bi khoáng thạch
      for (let i = 0; i < w.marbles.length; i += 1) {
        const m = w.marbles[i]!;
        if (!m.active) continue;

        m.lastStringHitAgeSec += dtSeconds;

        const prevX = m.x;
        const prevY = m.y;

        m.vy += gravity * dtSeconds;
        m.vx *= airDrag;
        m.vy *= airDrag;

        m.x += m.vx * dtSeconds;
        m.y += m.vy * dtSeconds;

        // Nảy thành biên trái/phải
        if (m.x < m.r + 10) {
          m.x = m.r + 10;
          m.vx = Math.abs(m.vx) * 0.72;
        } else if (m.x > width - m.r - 10) {
          m.x = width - m.r - 10;
          m.vx = -Math.abs(m.vx) * 0.72;
        }

        // Tự tái chế khi rơi qua đáy sân khấu
        if (m.y - m.r > height + 18) {
          m.active = false;
          m.trail = [];
          continue;
        }

        // Va chạm với Ma trận Chốt Đồng Thau (18-24 chốt, r = 4.5px)
        for (const peg of w.pegs) {
          const px = peg.nx * width;
          const py = peg.ny * height;
          const dx = m.x - px;
          const dy = m.y - py;
          const dist = Math.hypot(dx, dy);
          const minDist = m.r + PEG_RADIUS_PX;

          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            m.x += nx * overlap;
            m.y += ny * overlap;

            const vn = m.vx * nx + m.vy * ny;
            if (vn < 0) {
              const restitution = 0.74;
              m.vx -= (1 + restitution) * vn * nx;
              m.vy -= (1 + restitution) * vn * ny;
              // Thêm độ lệch vi mô để bi phân tách tự nhiên qua chốt
              m.vx += ((i + peg.index) % 2 === 0 ? 1 : -1) * 14;

              const impactVel = Math.min(1, Math.abs(vn) / 360);
              peg.glow = 1;
              spawnRipple(px, py, 24, 'rgba(156, 122, 76, 0.78)');
              if (soundEnabledRef.current && impactVel > 0.08) {
                playPegTap(peg.index, impactVel);
              }
            }
          }
        }

        // Tương tác cắt ngang 6 Sợi Dây Đàn Đàn Hồi
        for (const str of w.strings) {
          if (m.lastStringHitId === str.index && m.lastStringHitAgeSec < 0.14) {
            continue;
          }

          const x1 = str.x1Ratio * width;
          const y1 = str.y1Ratio * height;
          const x2 = str.x2Ratio * width;
          const y2 = str.y2Ratio * height;

          const proj = projectPointToSegment(m.x, m.y, x1, y1, x2, y2);
          const crossed = intersectSegments(prevX, prevY, m.x, m.y, x1, y1, x2, y2);
          const hitRadius = m.r + 2.5;

          if ((proj.dist <= hitRadius && proj.t > 0.02 && proj.t < 0.98) || crossed.hit) {
            const speed = Math.hypot(m.vx, m.vy);
            if (speed > 28) {
              const contactT = crossed.hit ? crossed.tString : proj.t;
              const signedVel = m.vx * proj.nx + m.vy * proj.ny;
              const pluckDir = signedVel >= 0 ? 1 : -1;
              const normVel = Math.max(0.18, Math.min(1, speed / 420));

              str.contactRatio = Math.max(0.15, Math.min(0.85, contactT));
              str.bend = pluckDir * Math.min(24, 9 + normVel * 15);
              str.bendVel = -pluckDir * (180 + normVel * 220);
              str.glow = 1;

              // Phản lực đàn hồi nhẹ từ dây đàn lên viên bi
              m.vy *= 0.82;
              m.vx += proj.nx * signedVel * -0.35;
              m.lastStringHitId = str.index;
              m.lastStringHitAgeSec = 0;

              spawnRipple(proj.cx, proj.cy, 28, 'rgba(59, 122, 101, 0.72)');
              if (soundEnabledRef.current) {
                playStringPluck(str.index, normVel, voiceModeRef.current);
              }
            }
          }
        }

        // Lưu vệt đuôi chuyển động mềm (trail)
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > TRAIL_LENGTH) {
          m.trail.shift();
        }
      }

      // Va chạm đàn hồi giữa các viên bi khoáng thạch với nhau
      for (let i = 0; i < w.marbles.length; i += 1) {
        const a = w.marbles[i]!;
        if (!a.active) continue;
        for (let j = i + 1; j < w.marbles.length; j += 1) {
          const b = w.marbles[j]!;
          if (!b.active) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.r + b.r;

          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.5;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const impulse = -(1 + 0.82) * velAlongNormal * 0.5;
              a.vx -= impulse * nx;
              a.vy -= impulse * ny;
              b.vx += impulse * nx;
              b.vy += impulse * ny;

              const impact = Math.min(1, Math.abs(velAlongNormal) / 300);
              if (impact > 0.22) {
                spawnRipple((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, 18, 'rgba(156, 122, 76, 0.55)');
                if (soundEnabledRef.current) {
                  playMarbleClick(impact);
                }
              }
            }
          }
        }
      }
    };

    const drawStage = () => {
      const width = w.width;
      const height = w.height;
      const dpr = w.dpr;
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.getAttribute('data-reading-theme') === 'dark';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Nền sân khấu Bạch Ngọc (#FAFBF9) / Đá Phiến Đêm (#12241C)
      ctx.fillStyle = isDark ? '#12241C' : '#FAFBF9';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      if (w.boardShakeOffset !== 0) {
        ctx.translate(0, Math.sin(w.boardShakeOffset * 3) * w.boardShakeOffset * 0.45);
      }

      // 2. Lưới tọa độ kỹ thuật & vòng cung đồng tâm mờ kiểu khí cụ Đông Sơn
      ctx.strokeStyle = isDark ? 'rgba(110, 181, 155, 0.06)' : 'rgba(30, 51, 46, 0.045)';
      ctx.lineWidth = 1;
      const gridStep = 48;
      ctx.beginPath();
      for (let gx = gridStep; gx < width; gx += gridStep) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = gridStep; gy < height; gy += gridStep) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      // Cung trắc địa trang trí phía sau ma trận chốt
      ctx.beginPath();
      ctx.arc(
        width * 0.5,
        height * 0.12,
        Math.min(width, height) * 0.42,
        0.15 * Math.PI,
        0.85 * Math.PI,
      );
      ctx.strokeStyle = isDark ? 'rgba(213, 180, 122, 0.12)' : 'rgba(156, 122, 76, 0.16)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Vẽ 6 Sợi Dây Đàn Đàn Hồi Nghiêng Chéo (quadraticCurveTo) & Nhãn Nốt Nhạc (D4..D5)
      for (const str of w.strings) {
        const x1 = str.x1Ratio * width;
        const y1 = str.y1Ratio * height;
        const x2 = str.x2Ratio * width;
        const y2 = str.y2Ratio * height;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const ctrlX = x1 + dx * str.contactRatio + nx * str.bend * 1.85;
        const ctrlY = y1 + dy * str.contactRatio + ny * str.bend * 1.85;

        // Quầng sáng dọc theo dây khi dây đang ngân
        if (str.glow > 0.02) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
          ctx.strokeStyle = isDark
            ? `rgba(213, 180, 122, ${(str.glow * 0.45).toFixed(3)})`
            : `rgba(156, 122, 76, ${(str.glow * 0.38).toFixed(3)})`;
          ctx.lineWidth = 5 + str.glow * 4;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();
        }

        // Sợi dây chính
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
        ctx.strokeStyle =
          str.glow > 0.15 ? (isDark ? '#F3DEC0' : '#8C6228') : isDark ? '#7FA898' : str.colorHex;
        ctx.lineWidth = 1.65 + str.glow * 1.1;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2 chốt neo đầu dây
        for (const [ax, ay] of [
          [x1, y1],
          [x2, y2],
        ] as const) {
          ctx.beginPath();
          ctx.arc(ax, ay, 3.6, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#D5B47A' : '#1E332E';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ax, ay, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FAFBF9';
          ctx.fill();
        }

        // Nhãn nốt nhạc nhỏ (D4, E4, G4, A4, B4, D5) lóe sáng dịu ở đầu neo dây
        const labelX = x1 < x2 ? x1 - 16 : x1 + 16;
        const labelY = y1 - 8;
        ctx.save();
        ctx.font = '600 10.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pillW = 24;
        const pillH = 15;
        ctx.fillStyle =
          str.glow > 0.12
            ? isDark
              ? 'rgba(213, 180, 122, 0.92)'
              : 'rgba(156, 122, 76, 0.92)'
            : isDark
              ? 'rgba(24, 48, 38, 0.85)'
              : 'rgba(238, 242, 240, 0.92)';
        ctx.beginPath();
        ctx.arc(labelX, labelY, pillW * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle =
          str.glow > 0.12 ? (isDark ? '#142622' : '#FAFBF9') : isDark ? '#D5B47A' : '#354E48';
        ctx.fillText(str.note, labelX, labelY + 0.5, pillH * 2);
        ctx.restore();
      }

      // 4. Vẽ Ma trận Chốt Đồng Thau (18-24 chốt, r = 4.5px)
      for (const peg of w.pegs) {
        const px = peg.nx * width;
        const py = peg.ny * height;

        if (peg.glow > 0.02) {
          ctx.beginPath();
          ctx.arc(px, py, PEG_RADIUS_PX + 4.5 * peg.glow, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(156, 122, 76, ${(peg.glow * 0.36).toFixed(3)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, PEG_RADIUS_PX, 0, Math.PI * 2);
        ctx.fillStyle = peg.glow > 0.15 ? '#D5B47A' : isDark ? '#B99764' : '#9C7A4C';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark ? '#FAFBF9' : '#1E332E';
        ctx.stroke();

        // Điểm sáng tâm chốt
        ctx.beginPath();
        ctx.arc(px - 1.1, py - 1.1, 1.25, 0, Math.PI * 2);
        ctx.fillStyle = '#FAFBF9';
        ctx.fill();
      }

      // 5. Vẽ các vòng sóng lan tỏa khi bi chạm chốt hoặc gảy dây
      for (const ripple of w.ripples) {
        if (!ripple.active) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.colorRgba;
        ctx.globalAlpha = ripple.alpha;
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Vẽ các viên Bi Khoáng Thạch (bóng khối cầu radialGradient, điểm lóe sứ trắng & vệt đuôi mềm)
      for (const m of w.marbles) {
        if (!m.active) continue;
        const spec =
          MARBLE_PALETTES[m.paletteIndex % MARBLE_PALETTES.length] ?? MARBLE_PALETTES[0]!;

        // Vệt đuôi chuyển động mềm (trail)
        if (m.trail.length > 1) {
          for (let tIdx = 0; tIdx < m.trail.length - 1; tIdx += 1) {
            const pt = m.trail[tIdx]!;
            const ratio = (tIdx + 1) / m.trail.length;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, m.r * ratio * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = spec.trailRgba;
            ctx.fill();
          }
        }

        // Bóng đổ nhẹ dưới viên bi
        ctx.beginPath();
        ctx.arc(m.x + 1.2, m.y + 2.0, m.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 38, 34, 0.14)';
        ctx.fill();

        // Khối cầu khoáng thạch radialGradient
        const grad = ctx.createRadialGradient(
          m.x - m.r * 0.32,
          m.y - m.r * 0.32,
          m.r * 0.12,
          m.x,
          m.y,
          m.r,
        );
        grad.addColorStop(0, spec.lightHex);
        grad.addColorStop(0.58, spec.coreHex);
        grad.addColorStop(1, spec.shadowHex);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Điểm lóe sáng sứ trắng (#FAFBF9)
        ctx.beginPath();
        ctx.arc(m.x - m.r * 0.34, m.y - m.r * 0.34, m.r * 0.24, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 251, 249, 0.86)';
        ctx.fill();
      }

      ctx.restore();
    };

    // Chế độ prefers-reduced-motion: vẽ khung hình tĩnh sắc nét
    if (prefersReducedMotion) {
      drawStage();
      window.addEventListener('resize', updateSize, { passive: true });
      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }

    let rafId = 0;
    let isIntersecting = true;
    let isDisposed = false;
    let prevNow = performance.now();

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = (now: number) => {
      if (isDisposed || !isIntersecting) {
        rafId = 0;
        return;
      }
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;

      stepPhysics(dtSeconds, dtScale);
      drawStage();

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isDisposed || !isIntersecting || rafId !== 0) return;
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && section) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.04 },
      );
      observer.observe(section);
    }

    window.addEventListener('resize', updateSize, { passive: true });
    drawStage();
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
      for (const tid of w.rainTimeouts) {
        window.clearTimeout(tid);
      }
      w.rainTimeouts = [];
    };
  }, [getWorld, prefersReducedMotion, spawnMarbleAt, spawnRipple]);

  // Sự kiện tương tác chuột / cảm ứng trực tiếp trên Canvas
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (soundEnabledRef.current) {
      unlockPentatonicAudio();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const w = getWorld();
    w.pointerDown = true;
    w.pointerActive = true;
    w.pointerX = x;
    w.pointerY = y;
    w.prevPointerX = x;
    w.prevPointerY = y;
    w.holdTimerMs = 0;

    spawnMarbleAt(x, y, (Math.random() - 0.5) * 65, 25, true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const w = getWorld();
    const prevX = w.pointerActive ? w.pointerX : x;
    const prevY = w.pointerActive ? w.pointerY : y;

    w.prevPointerX = prevX;
    w.prevPointerY = prevY;
    w.pointerX = x;
    w.pointerY = y;
    w.pointerActive = true;

    const moveDist = Math.hypot(x - prevX, y - prevY);
    if (moveDist < 1.5) return;

    // Rê chuột quẹt ngang qua bất kỳ dây đàn nào -> trực tiếp gảy dây phát nhạc như chơi đàn tranh
    for (const str of w.strings) {
      const x1 = str.x1Ratio * w.width;
      const y1 = str.y1Ratio * w.height;
      const x2 = str.x2Ratio * w.width;
      const y2 = str.y2Ratio * w.height;

      const crossed = intersectSegments(prevX, prevY, x, y, x1, y1, x2, y2);
      if (crossed.hit) {
        const proj = projectPointToSegment(x, y, x1, y1, x2, y2);
        const swipeVel = Math.max(0.25, Math.min(1, moveDist / 38));
        const dir = (x - prevX) * proj.nx + (y - prevY) * proj.ny >= 0 ? 1 : -1;

        str.contactRatio = Math.max(0.15, Math.min(0.85, crossed.tString));
        str.bend = dir * Math.min(24, 10 + swipeVel * 14);
        str.bendVel = -dir * (190 + swipeVel * 210);
        str.glow = 1;

        spawnRipple(proj.cx, proj.cy, 26, 'rgba(156, 122, 76, 0.76)');
        if (soundEnabledRef.current) {
          playStringPluck(str.index, swipeVel, voiceModeRef.current);
        }
      }
    }
  };

  const handlePointerUpOrLeave = () => {
    const w = getWorld();
    w.pointerDown = false;
    w.pointerActive = false;
    w.holdTimerMs = 0;
  };

  const currentBlueprint =
    STAGE_LAYOUT_BLUEPRINTS[layoutIndex % STAGE_LAYOUT_BLUEPRINTS.length] ??
    STAGE_LAYOUT_BLUEPRINTS[0]!;

  return (
    <section
      ref={sectionRef}
      id="san-khau-ngu-cung"
      data-testid="kinetic-sound-stage"
      aria-label="Máy Thả Bi Khoáng Thạch và Đàn Dây Ngũ Cung 120fps"
      className={cn(
        'relative scroll-mt-20 border-t border-[#D4DFDA] bg-[#F2F4F3] text-[#142622] dark:border-[#1E3B2D] dark:bg-[#0E1A15] dark:text-[#E6ECE7]',
        className,
      )}
    >
      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật 1px solid #D4DFDA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1400px] justify-between px-6 lg:px-10"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-20 lg:px-10">
        {/* Khung thẻ lớn tỷ lệ rộng, đậm chất khí cụ nghệ thuật Bạch Ngọc Khoáng Thạch */}
        <div
          data-testid="kinetic-stage-card"
          data-layout-name={currentBlueprint.name}
          className="relative overflow-hidden rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] shadow-[0_18px_48px_rgba(24,38,36,0.06)] dark:border-[#243B32] dark:bg-[#12241C]"
        >
          {/* 4 góc thước ngắm bản vẽ chữ L mảnh */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 left-2 z-20 h-3 w-3 border-t-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 bottom-2 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] border-[#9C7A4C]/70"
          />

          {/* Thanh tiêu đề siêu gọn bên trên Canvas: 1 dòng gợi ý chơi duy nhất + Cụm Âm thanh & Âm sắc */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <p
              data-testid="kinetic-play-hint"
              className="font-mono text-xs font-medium text-[#2D423D] dark:text-[#C9D6D0]"
            >
              Nhấp để thả bi · Nhấn giữ tạo thác bi · Rê chuột ngang dây để gảy đàn
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chuyển đổi 2 bộ âm sắc: Đàn dây (pluck) / Chuông gió (chime) */}
              <div
                role="group"
                aria-label="Chọn âm sắc nhạc cụ"
                className="inline-flex items-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] p-0.5 font-mono text-[11px] font-semibold dark:border-[#244335] dark:bg-[#12241C]"
              >
                <button
                  type="button"
                  data-testid="kinetic-voice-pluck"
                  aria-pressed={voiceMode === 'pluck'}
                  onClick={() => handleSelectVoiceMode('pluck')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 transition-colors',
                    voiceMode === 'pluck'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746] dark:text-[#FAFBF9]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3] dark:hover:text-[#E6ECE7]',
                  )}
                >
                  <Music className="h-3 w-3" aria-hidden="true" />
                  <span>Đàn dây</span>
                </button>
                <button
                  type="button"
                  data-testid="kinetic-voice-chime"
                  aria-pressed={voiceMode === 'chime'}
                  onClick={() => handleSelectVoiceMode('chime')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 transition-colors',
                    voiceMode === 'chime'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746] dark:text-[#FAFBF9]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3] dark:hover:text-[#E6ECE7]',
                  )}
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  <span>Chuông gió</span>
                </button>
              </div>

              {/* Nút bật/tắt Âm thanh */}
              <button
                type="button"
                data-testid="kinetic-sound-toggle"
                aria-pressed={isSoundEnabled}
                onClick={handleToggleSound}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1 font-mono text-[11px] font-semibold transition-colors',
                  isSoundEnabled
                    ? 'border-[#9C7A4C] bg-[#9C7A4C] text-[#FAFBF9] shadow-2xs dark:border-[#D5B47A] dark:bg-[#D5B47A] dark:text-[#142622]'
                    : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#2D423D] hover:border-[#9C7A4C] hover:text-[#142622] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0] dark:hover:border-[#D5B47A]',
                )}
              >
                {isSoundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>Âm thanh</span>
              </button>
            </div>
          </div>

          {/* Sân khấu Vật lý 2D & Đàn dây Ngũ cung 120FPS */}
          <div
            ref={stageWrapperRef}
            className="relative h-[460px] w-full overflow-hidden bg-[#FAFBF9] md:h-[520px] dark:bg-[#12241C]"
          >
            <canvas
              ref={canvasRef}
              data-testid="kinetic-sound-canvas"
              data-max-marbles={MAX_MARBLES}
              data-string-count={PENTATONIC_STRING_NOTES.length}
              data-peg-count={currentBlueprint.pegs.length}
              aria-label="Sân khấu tương tác Máy thả bi khoáng thạch và 6 dây đàn ngũ cung"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrLeave}
              onPointerCancel={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              className="block h-full w-full cursor-crosshair touch-none select-none"
            />
          </div>

          {/* Thanh điều khiển vui nhộn ở đáy khung + 2 nút điều hướng thanh lịch */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <div
              role="group"
              aria-label="Điều khiển sân khấu bi khoáng thạch"
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                data-testid="kinetic-marble-rain-btn"
                onClick={handleMarbleRain}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <Sparkles
                  className="h-3.5 w-3.5 text-[#8C6228] dark:text-[#D5B47A]"
                  aria-hidden="true"
                />
                <span>Thả mưa bi</span>
              </button>

              <button
                type="button"
                data-testid="kinetic-shake-board-btn"
                onClick={handleShakeBoard}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <Waves
                  className="h-3.5 w-3.5 text-[#3B7A65] dark:text-[#6EB59B]"
                  aria-hidden="true"
                />
                <span>Rung bảng</span>
              </button>

              <button
                type="button"
                data-testid="kinetic-cycle-layout-btn"
                onClick={handleCycleLayout}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <RefreshCw
                  className="h-3.5 w-3.5 text-[#2D5266] dark:text-[#7FA8C0]"
                  aria-hidden="true"
                />
                <span>Xếp lại dây</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to={ROUTES.learningSpace}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E332E] px-4 py-2 text-xs font-semibold text-[#FAFBF9] shadow-[0_8px_20px_rgba(30,51,46,0.16)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98] sm:text-sm dark:bg-[#245746] dark:hover:bg-[#2E6E58]"
              >
                <span>Bước vào Không gian học tập</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                to={ROUTES.glossary}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 text-xs font-semibold text-[#182624] shadow-2xs transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#9C7A4C]/65 hover:bg-[#E7ECEA] active:scale-[0.98] sm:text-sm dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <span>Kho Thuật ngữ</span>
                <ArrowRight
                  className="h-4 w-4 text-[#8C6228] dark:text-[#D5B47A]"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Đường viền kép mảnh Đồng Trầm chuyển tiếp gọn xuống Footer Đá Phiến Trầm (#142622) */}
      <div
        aria-hidden="true"
        data-testid="kinetic-footer-seam"
        className="w-full bg-[#F2F4F3] pt-1 dark:bg-[#0E1A15]"
      >
        <div className="h-[5px] w-full border-y border-[#9C7A4C]/40 bg-[#EAEFED] dark:bg-[#12241C]" />
      </div>
    </section>
  );
}

export default KineticSoundStage;
