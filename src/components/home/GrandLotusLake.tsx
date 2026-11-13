import { type FC, useEffect, useRef, useState } from 'react';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import { createLotusCanvasEngine, type LotusCanvasEngine } from './lotusCanvasEngine';
import { drawFishMorphologyPreview } from './lotusEcosystem';
import {
  addFishToLake,
  ALL_FISH_SPECIES_IDS,
  type FishSpeciesId,
  FISH_SPECIES,
  loadZenKoiState,
  removeFishFromLake,
  renameFish,
  type SavedKoiFish,
  updateFishScale,
  type ZenKoiGameState,
} from './zenKoiGame';

export interface GrandLotusLakeProps {
  readonly className?: string;
  readonly pageScrollProgress?: number;
}

type ShowcaseTab = 'compendium' | 'active';

/**
 * Xác định sắc thái hồ sen tự động theo giờ thực tế của hệ thống:
 * - 06:00 đến 17:59 -> "Sương mai" (day)
 * - 18:00 đến 05:59 -> "Nguyệt dạ" (night)
 */
function getSystemLakeTheme(): 'day' | 'night' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

interface SpeciesMorphologyPreviewProps {
  readonly speciesId: FishSpeciesId;
  readonly animTime: number;
}

const SpeciesMorphologyPreview: FC<SpeciesMorphologyPreviewProps> = ({ speciesId, animTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 96;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    let ctx: CanvasRenderingContext2D | null;
    try {
      ctx = getLowLatency2DContext(canvas, { alpha: false });
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFishMorphologyPreview(ctx, speciesId, width, height, animTime);
  }, [speciesId, animTime]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-24 w-full rounded-xl border border-white/10 bg-[#051913]"
    />
  );
};

/**
 * ĐẠI CẢNH "KHÔNG GIAN HỒ SEN 3D" (GRAND LOTUS LAKE - TRUE 3D VOLUMETRIC SANDBOX)
 *
 * Hệ sinh thái hồ sen 3D Z-Buffer 120fps kết hợp chế độ Sandbox tự do hoàn chỉnh:
 * - 10 loài cá đa dạng hình thái học: Koi, Cá Vàng Đuôi Voan, Betta Xiêm Rồng, Chép Phụng, Cá Rồng Kim Long,
 *   Thanh Ngọc Phát Quang, Cá Đuối Ngọc Bích, Cá Ngân Đai Thủy Tinh, Cá Thần Tiên Vũ Y, Cá Nóc Ngọc Trai.
 * - Sắp xếp độ sâu Z-Buffer thực (0.0 -> 1.0), Voronoi Water Caustics, Light Shafts, bọt khí 3D & đổ bóng đáy hồ.
 * - Viên thuốc kính mờ góc dưới phải kích hoạt sóng xung kích (shockwave) và mở trung tâm điều khiển Hồ Sen 3D.
 * - Zero Icons / Zero Emojis, typography cỡ lớn dễ đọc, lưu bền vững qua localStorage (`lu_lotus_koi_game_v1`).
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LotusCanvasEngine | null>(null);

  const [lakeTheme, setLakeTheme] = useState<'day' | 'night'>(getSystemLakeTheme);
  const lakeThemeRef = useRef<'day' | 'night'>(lakeTheme);

  const [gameState, setGameState] = useState<ZenKoiGameState>(() => loadZenKoiState());
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('compendium');
  const [inspectedFishId, setInspectedFishId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justAddedSpeciesId, setJustAddedSpeciesId] = useState<FishSpeciesId | null>(null);
  const [editingFishId, setEditingFishId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [previewTime, setPreviewTime] = useState(1.2);
  const [fishDepthMap, setFishDepthMap] = useState<Record<string, number>>({});

  const toastTimerRef = useRef<number | null>(null);
  const glowTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    lakeThemeRef.current = lakeTheme;
  }, [lakeTheme]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (glowTimerRef.current) window.clearTimeout(glowTimerRef.current);
    };
  }, []);

  // Tự động cập nhật sắc thái Sương mai / Nguyệt dạ theo đồng hồ hệ thống
  useEffect(() => {
    const checkTheme = () => {
      const current = getSystemLakeTheme();
      setLakeTheme((prev) => (prev !== current ? current : prev));
    };

    const timer = window.setInterval(checkTheme, 60000);
    return () => window.clearInterval(timer);
  }, []);

  // Khởi tạo Canvas Engine & vòng lặp hoạt ảnh 120fps
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animId = 0;
    let isIntersecting = true;
    let isMounted = true;
    let width = 0;
    let height = 0;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!engineRef.current) {
      engineRef.current = createLotusCanvasEngine();
    }
    const engine = engineRef.current;

    engine.setOnFishPetted((fishId) => {
      setInspectedFishId(fishId);
      setEditingFishId(null);
    });

    const cachedCtx = getLowLatency2DContext(canvas, { alpha: false });

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const W = Math.floor(rect.width) || 1440;
      const H = Math.floor(rect.height) || 760;
      if (W <= 0 || H <= 0) return;
      width = W;
      height = H;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      if (cachedCtx) {
        cachedCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const renderFrame = (t: number, dtSeconds = 1 / 60) => {
      if (!cachedCtx || width <= 0 || height <= 0) return;
      engine.render(cachedCtx, width, height, t, lakeThemeRef.current, dtSeconds);
    };

    handleResize();

    let elapsedSec = 0;
    let lastTimestampMs = performance.now();

    const startLoop = () => {
      if (animId || !isMounted || prefersReducedMotion) return;
      lastTimestampMs = performance.now();
      const loop = (timestamp: number) => {
        if (!isMounted || !isIntersecting) {
          animId = 0;
          return;
        }
        const { dtSeconds } = computeFrameDelta(timestamp, lastTimestampMs);
        lastTimestampMs = timestamp;
        elapsedSec += dtSeconds;
        renderFrame(elapsedSec, dtSeconds);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    if (prefersReducedMotion) {
      renderFrame(2.0);
    } else {
      startLoop();
    }

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting) {
              startLoop();
            } else {
              stopLoop();
            }
          }
        },
        { threshold: 0.05 },
      );
      observer.observe(container);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
        if (prefersReducedMotion) {
          renderFrame(2.0);
        }
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      isMounted = false;
      if (animId) {
        cancelAnimationFrame(animId);
      }
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Đồng bộ đàn cá vào Canvas engine
  useEffect(() => {
    engineRef.current?.syncFishes(gameState.fishes);
  }, [gameState.fishes]);

  // Vòng lặp chung nhẹ nhàng cho ảnh xem trước 3D trong Sổ Cá & cập nhật độ sâu Z trực tiếp
  useEffect(() => {
    if (!isShowcaseOpen) return;

    const syncSnapshots = () => {
      if (!engineRef.current) return;
      const snap = engineRef.current.getFishesSnapshot();
      const map: Record<string, number> = {};
      snap.forEach((item) => {
        map[item.id] = item.z;
      });
      setFishDepthMap(map);
    };

    syncSnapshots();
    const depthTimer = window.setInterval(syncSnapshots, 220);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return () => {
        window.clearInterval(depthTimer);
      };
    }

    let animId = 0;
    let lastMs = performance.now();
    let localTime = 1.2;

    const tickPreview = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, lastMs);
      lastMs = now;
      localTime += dtSeconds;
      setPreviewTime(localTime);
      animId = requestAnimationFrame(tickPreview);
    };
    animId = requestAnimationFrame(tickPreview);

    return () => {
      window.clearInterval(depthTimer);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isShowcaseOpen]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && canvasRef.current && engineRef.current) {
      const canvas = canvasRef.current;
      const ctx = getLowLatency2DContext(canvas, { alpha: false });
      const rect = canvas.getBoundingClientRect();
      if (ctx && rect.width > 0 && rect.height > 0) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        engineRef.current.render(ctx, rect.width, rect.height, 2.0, lakeThemeRef.current);
      }
    }
  }, [lakeTheme]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hitFishId = engineRef.current.checkPetFish(x, y);
    if (hitFishId) {
      setInspectedFishId(hitFishId);
      setEditingFishId(null);
      const hitFish = gameState.fishes.find((f) => f.id === hitFishId);
      if (hitFish?.species === 'boxfish') {
        showToast(`${hitFish.name} đang phồng tròn 3D gấp 1.4x!`);
      }
      return;
    }

    const collected = engineRef.current.checkCollectForage(x, y);
    if (collected) return;

    engineRef.current.feedBait(x, y);
    engineRef.current.addRipple(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engineRef.current.setPointer(x, y);
    engineRef.current.checkCollectForage(x, y);
  };

  const handlePointerLeave = () => {
    engineRef.current?.setPointer(null, null);
  };

  const handleOpenShowcaseFromPill = () => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (engineRef.current) {
      if (rect && rect.width > 0 && rect.height > 0) {
        engineRef.current.triggerShockwave(rect.width - 80, rect.height - 36);
      } else {
        engineRef.current.triggerShockwave();
      }
    }
    setIsShowcaseOpen(true);
  };

  const handleAddSpeciesFish = (species: FishSpeciesId) => {
    const result = addFishToLake(gameState, species);
    setGameState(result.newState);
    setJustAddedSpeciesId(species);
    if (glowTimerRef.current) window.clearTimeout(glowTimerRef.current);
    glowTimerRef.current = window.setTimeout(() => {
      setJustAddedSpeciesId(null);
    }, 850);
    showToast(`Đã thả ${FISH_SPECIES[species].nameVi} vào hồ`);
  };

  const handleAddRandomFish = () => {
    const chosenSpecies =
      ALL_FISH_SPECIES_IDS[Math.floor(Math.random() * ALL_FISH_SPECIES_IDS.length)] ?? 'koi';
    handleAddSpeciesFish(chosenSpecies);
  };

  const handleRemoveFish = (fishId: string) => {
    if (gameState.fishes.length <= 1) {
      showToast('Hồ sen cần duy trì ít nhất 1 chú cá.');
      return;
    }
    const targetFish = gameState.fishes.find((f) => f.id === fishId);
    const nextState = removeFishFromLake(gameState, fishId);
    setGameState(nextState);
    if (inspectedFishId === fishId) {
      setInspectedFishId(null);
    }
    showToast(`Đã thả bớt ${targetFish?.name || 'cá'} về với tự nhiên.`);
  };

  const handleSaveRename = (fishId: string) => {
    if (!editingName.trim()) {
      setEditingFishId(null);
      return;
    }
    setGameState((prev) => renameFish(prev, fishId, editingName));
    setEditingFishId(null);
    showToast('Đã cập nhật tên cá thành công.');
  };

  const inspectedFish: SavedKoiFish | null =
    gameState.fishes.find((f) => f.id === inspectedFishId) ?? null;
  const inspectedSpeciesMeta = inspectedFish
    ? (FISH_SPECIES[inspectedFish.species] ?? FISH_SPECIES.koi)
    : null;

  return (
    <section
      ref={containerRef}
      aria-label="Đại cảnh Hồ Sen Tri Thức"
      className={cn(
        'relative h-[680px] w-full overflow-hidden transition-colors duration-700 select-none lg:h-[780px] xl:h-[850px]',
        lakeTheme === 'day' ? 'bg-[#5B9577]' : 'bg-[#040D08]',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-pointer touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />

      {/* ===================================================================
          1. VIÊN THUỐC KÍNH MỜ GÓC DƯỚI PHẢI (ZERO ICONS / PILL TRIGGER)
         =================================================================== */}
      <button
        type="button"
        onClick={handleOpenShowcaseFromPill}
        className="absolute right-6 bottom-6 z-20 rounded-full border border-[#52B788]/40 bg-[#08221B]/85 px-5 py-3 text-[15.5px] font-bold tracking-wide text-[#F2F9F5] shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[#0D3126] active:scale-95"
        title="Mở Không Gian Hồ Sen 3D"
      >
        Hồ Sen · {gameState.fishes.length} cá
      </button>

      {/* ===================================================================
          2. THẺ KIỂM TRA CÁ KHI BẤM TRỰC TIẾP TRÊN MẶT HỒ
         =================================================================== */}
      {inspectedFish && inspectedSpeciesMeta && !isShowcaseOpen && (
        <div className="lotus-card-fade-up absolute bottom-6 left-6 z-30 w-96 max-w-[calc(100vw-3rem)] rounded-2xl border border-[#52B788]/40 bg-[#071D17]/92 p-5 text-[#F2F9F5] shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="mb-2.5 flex items-start justify-between gap-3">
            {editingFishId === inspectedFish.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  maxLength={24}
                  autoFocus
                  className="w-full rounded-lg border border-[#52B788]/50 bg-[#04120D] px-3 py-1.5 text-[15.5px] text-white focus:border-[#86EFAC] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(inspectedFish.id);
                    if (e.key === 'Escape') setEditingFishId(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveRename(inspectedFish.id)}
                  className="rounded-lg bg-[#2A6F4E] px-3.5 py-1.5 text-[14.5px] font-bold text-white hover:bg-[#34855F]"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[18px] font-bold text-white">{inspectedFish.name}</h4>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFishId(inspectedFish.id);
                    setEditingName(inspectedFish.name);
                  }}
                  className="rounded-md border border-white/15 px-2.5 py-0.5 text-[13.5px] font-medium text-[#A7C8B8] transition hover:border-[#86EFAC]/50 hover:text-[#86EFAC]"
                >
                  Đổi tên
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setInspectedFishId(null)}
              className="rounded-full border border-white/15 px-3 py-1 text-[14px] font-semibold text-[#D2E5DC] transition hover:bg-white/10 hover:text-white"
            >
              Đóng
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between text-[14.5px]">
            <span className="font-semibold text-[#86EFAC]">{inspectedSpeciesMeta.nameVi}</span>
            <span className="text-[#A7C8B8]">{inspectedSpeciesMeta.commonName}</span>
          </div>

          <p className="mb-4 text-[14.5px] leading-[1.6] text-[#D2E5DC]">
            {inspectedSpeciesMeta.description}
          </p>

          <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-3.5">
            <div className="mb-2 flex items-center justify-between text-[15px] text-[#E6F4EC]">
              <span>Kích thước cá</span>
              <span className="font-bold text-[#FDE047]">{inspectedFish.scale}x</span>
            </div>
            <input
              type="range"
              aria-label={`Kích thước của ${inspectedFish.name}`}
              min="0.6"
              max="1.8"
              step="0.05"
              value={Math.max(0.6, Math.min(1.8, inspectedFish.scale))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setGameState((prev) => updateFishScale(prev, inspectedFish.id, val));
              }}
              className="w-full cursor-pointer accent-[#52B788]"
            />
            <div className="mt-1.5 flex justify-between text-[13.5px] text-[#A7C8B8]">
              <span>0.6x</span>
              <span>1.2x</span>
              <span>1.8x</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                handleRemoveFish(inspectedFish.id);
                setInspectedFishId(null);
              }}
              disabled={gameState.fishes.length <= 1}
              className="flex-1 rounded-xl border border-red-400/35 bg-red-500/15 py-2.5 text-[15px] font-semibold text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Thả bớt
            </button>
            <button
              type="button"
              onClick={() => setInspectedFishId(null)}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-[15px] font-semibold text-white transition hover:bg-white/20"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          3. TRUNG TÂM ĐIỀU KHIỂN BUNG NỞ (CENTERED EXPANDING SHOWCASE MODAL)
         =================================================================== */}
      {isShowcaseOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lotus-showcase-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsShowcaseOpen(false);
            }
          }}
        >
          <div
            className="lotus-showcase-spring flex max-h-[82vh] w-[min(94vw,1140px)] flex-col overflow-hidden rounded-3xl border border-[#52B788]/35 bg-[#071D17]/92 text-[#F2F9F5] shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header Modal (Thanh điều khiển lớn trên cùng) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
              <div>
                <h2
                  id="lotus-showcase-title"
                  className="text-[24px] font-bold tracking-tight text-[#F5FBF8] lg:text-[26px]"
                >
                  Không Gian Hồ Sen 3D
                </h2>
              </div>

              {/* 2 Tab Chuyển đổi dạng viên thuốc lớn */}
              <div className="flex flex-wrap items-center gap-2.5" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'compendium'}
                  onClick={() => setActiveTab('compendium')}
                  className={cn(
                    'rounded-full px-6 py-2.5 text-[16px] font-semibold transition-all',
                    activeTab === 'compendium'
                      ? 'border border-[#86EFAC]/55 bg-[#1B4D38] text-white shadow-md'
                      : 'border border-white/15 bg-white/5 text-[#C7DED3] hover:bg-white/10 hover:text-white',
                  )}
                >
                  Sổ Cá (10 Loài)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'active'}
                  onClick={() => setActiveTab('active')}
                  className={cn(
                    'rounded-full px-6 py-2.5 text-[16px] font-semibold transition-all',
                    activeTab === 'active'
                      ? 'border border-[#86EFAC]/55 bg-[#1B4D38] text-white shadow-md'
                      : 'border border-white/15 bg-white/5 text-[#C7DED3] hover:bg-white/10 hover:text-white',
                  )}
                >
                  Danh Sách Cá Đang Nuôi ({gameState.fishes.length})
                </button>
              </div>

              {/* Nút Thêm cá ngẫu nhiên & Đóng */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddRandomFish}
                  className="rounded-full border border-[#52B788]/50 bg-[#1B4D38] px-5 py-2.5 text-[16px] font-semibold text-[#F5FBF8] shadow transition hover:bg-[#236348] active:scale-95"
                >
                  Thêm cá ngẫu nhiên
                </button>
                <button
                  type="button"
                  onClick={() => setIsShowcaseOpen(false)}
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[16px] font-semibold text-white transition hover:bg-white/20 active:scale-95"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Nội dung 2 Tab cuộn mượt bên trong modal */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeTab === 'compendium' ? (
                <div className="grid grid-cols-1 gap-5 p-8 md:grid-cols-2 xl:grid-cols-3">
                  {ALL_FISH_SPECIES_IDS.map((speciesId, idx) => {
                    const sp = FISH_SPECIES[speciesId];
                    const isGlowing = justAddedSpeciesId === sp.id;
                    return (
                      <div
                        key={sp.id}
                        style={{ animationDelay: `${idx * 35}ms` }}
                        className={cn(
                          'lotus-card-fade-up flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300',
                          isGlowing
                            ? 'border-[#86EFAC] bg-[#113D2E]/95 shadow-[0_0_28px_rgba(110,231,183,0.35)]'
                            : 'border-[#52B788]/25 bg-[#04140F]/85 hover:border-[#86EFAC]/55',
                        )}
                      >
                        <div>
                          <div className="mb-4">
                            <SpeciesMorphologyPreview speciesId={sp.id} animTime={previewTime} />
                          </div>
                          <h3 className="text-[19px] font-bold text-white">{sp.nameVi}</h3>
                          <p className="mt-0.5 text-[14px] font-medium text-[#86EFAC]">
                            {sp.commonName}
                          </p>
                          <p className="mt-2.5 text-[15.5px] leading-[1.65] text-[#D2E5DC]">
                            {sp.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-2">
                          <button
                            type="button"
                            onClick={() => handleAddSpeciesFish(sp.id)}
                            className={cn(
                              'w-full rounded-xl border px-5 py-2.5 text-[15.5px] font-bold transition-all active:scale-[0.98]',
                              isGlowing
                                ? 'border-[#86EFAC] bg-[#2D7A58] text-white shadow-[0_0_20px_rgba(134,239,172,0.45)]'
                                : 'border-[#52B788]/45 bg-[#164A36] text-[#F5FBF8] hover:border-[#86EFAC]/70 hover:bg-[#1E6247]',
                            )}
                          >
                            Thả vào hồ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-8 lg:grid-cols-2">
                  {gameState.fishes.map((fish, idx) => {
                    const spMeta = FISH_SPECIES[fish.species] ?? FISH_SPECIES.koi;
                    const liveZ =
                      fishDepthMap[fish.id] ??
                      (spMeta.defaultZRange[0] + spMeta.defaultZRange[1]) * 0.5;
                    const sliderVal = Math.max(0.6, Math.min(1.8, fish.scale));
                    const isEditingThis = editingFishId === fish.id;

                    return (
                      <div
                        key={fish.id}
                        style={{ animationDelay: `${idx * 35}ms` }}
                        className="lotus-card-fade-up flex flex-col justify-between gap-4 rounded-2xl border border-[#52B788]/25 bg-[#04140F]/85 p-5"
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {isEditingThis ? (
                              <div className="flex flex-1 items-center gap-2">
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  maxLength={24}
                                  autoFocus
                                  aria-label={`Đổi tên cho ${fish.name}`}
                                  className="w-full rounded-lg border border-[#52B788]/50 bg-[#071D17] px-3 py-1.5 text-[16px] font-semibold text-white focus:border-[#86EFAC] focus:outline-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(fish.id);
                                    if (e.key === 'Escape') setEditingFishId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(fish.id)}
                                  className="rounded-lg bg-[#2A6F4E] px-4 py-1.5 text-[15px] font-semibold text-white hover:bg-[#34855F]"
                                >
                                  Lưu
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h3 className="text-[18px] font-bold text-white">{fish.name}</h3>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFishId(fish.id);
                                    setEditingName(fish.name);
                                  }}
                                  className="rounded-md border border-white/15 px-2.5 py-0.5 text-[14px] font-medium text-[#A7C8B8] transition hover:border-[#86EFAC]/50 hover:text-[#86EFAC]"
                                >
                                  Đổi tên
                                </button>
                              </div>
                            )}

                            <span className="rounded-full border border-[#52B788]/30 bg-[#0A2920] px-3 py-1 text-[14.5px] font-semibold text-[#FDE047]">
                              {fish.scale}x
                            </span>
                          </div>

                          <p className="mt-1.5 text-[15px] text-[#A7C8B8]">
                            {spMeta.nameVi} · Độ sâu Z: {liveZ.toFixed(2)}
                          </p>
                        </div>

                        {/* Thanh trượt kích thước cá 0.6x -> 1.8x */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between text-[15px] text-[#D2E5DC]">
                            <span>Kích thước trong hồ</span>
                            <span className="font-semibold text-[#86EFAC]">{fish.scale}x</span>
                          </div>
                          <input
                            type="range"
                            aria-label={`Điều chỉnh kích thước ${fish.name}`}
                            min="0.6"
                            max="1.8"
                            step="0.05"
                            value={sliderVal}
                            onChange={(e) => {
                              const nextScale = parseFloat(e.target.value);
                              setGameState((prev) => updateFishScale(prev, fish.id, nextScale));
                            }}
                            className="w-full cursor-pointer accent-[#52B788]"
                          />
                          <div className="mt-1 flex justify-between text-[14px] text-[#97BCA9]">
                            <span>0.6x</span>
                            <span>1.2x</span>
                            <span>1.8x</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedFishId(fish.id);
                              setEditingFishId(null);
                              setIsShowcaseOpen(false);
                              showToast(`Đang theo dõi ${fish.name} (${spMeta.nameVi})`);
                            }}
                            className="flex-1 rounded-xl border border-[#52B788]/40 bg-[#154533] px-4 py-2 text-[15px] font-semibold text-white transition hover:bg-[#1E6247]"
                          >
                            Xem cá
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFish(fish.id)}
                            disabled={gameState.fishes.length <= 1}
                            className="flex-1 rounded-xl border border-red-400/35 bg-red-500/15 px-4 py-2 text-[15px] font-semibold text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Thả bớt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          4. THÔNG BÁO NHẸ (TOAST NOTIFICATION - CỠ CHỮ LỚN)
         =================================================================== */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute top-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#86EFAC]/50 bg-[#071D17]/95 px-6 py-2.5 text-[15.5px] font-semibold text-[#F2F9F5] shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {toastMessage}
        </div>
      )}
    </section>
  );
};
