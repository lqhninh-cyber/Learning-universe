import { type FC, useEffect, useRef, useState } from 'react';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import { createLotusCanvasEngine, type LotusCanvasEngine } from './lotusCanvasEngine';
import {
  addFishToLake,
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

/**
 * Xác định sắc thái hồ sen tự động theo giờ thực tế của hệ thống:
 * - 06:00 đến 17:59 -> "Sương mai" (day)
 * - 18:00 đến 05:59 -> "Nguyệt dạ" (night)
 */
function getSystemLakeTheme(): 'day' | 'night' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

/**
 * ĐẠI CẢNH "HỒ SEN TRI THỨC & LIÊN TRÌ TỰ DO" (GRAND LOTUS LAKE - PURE SANDBOX)
 *
 * Hệ sinh thái hồ sen Canvas 2D thủ tục sống động 120fps kết hợp chế độ Sandbox thư giãn:
 * - 6 loài cá đa dạng hình thái học: Cá Chép Koi, Cá Vàng Đuôi Voan, Cá Betta Xiêm Rồng, Cá Chép Phụng, Cá Rồng Kim Long, Cá Thanh Ngọc.
 * - Trục độ sâu quang học 3D Z-axis, lưới khúc xạ caustics đáy hồ, sỏi cuội rêu phong và bóng đổ 3D.
 * - Tự do thả mồi hạt vàng, tạo sóng nước, tùy biến kích thước và đổi tên cá không giới hạn tài nguyên.
 * - Lưu trữ trạng thái bền vững qua localStorage (`lu_lotus_koi_game_v1`).
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LotusCanvasEngine | null>(null);

  const [lakeTheme, setLakeTheme] = useState<'day' | 'night'>(getSystemLakeTheme);
  const lakeThemeRef = useRef<'day' | 'night'>(lakeTheme);

  // Zen Koi Sandbox State & HUD Controls
  const [gameState, setGameState] = useState<ZenKoiGameState>(() => loadZenKoiState());
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [inspectedFishId, setInspectedFishId] = useState<string | null>(null);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [isAddSpeciesOpen, setIsAddSpeciesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const toastTimerRef = useRef<number | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Đồng bộ sắc thái vào ref phục vụ render loop Canvas
  useEffect(() => {
    lakeThemeRef.current = lakeTheme;
  }, [lakeTheme]);

  // Luôn chạy tự động ngầm theo giờ thực tế của hệ thống (kiểm tra mỗi 60 giây)
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

    // Đăng ký callback khi cá được vuốt ve / kiểm tra
    engine.setOnFishPetted((fishId) => {
      setInspectedFishId(fishId);
      setIsEditingName(false);
    });

    const cachedCtx = getLowLatency2DContext(canvas, { alpha: false });

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const W = Math.floor(rect.width) || 1440;
      const H = Math.floor(rect.height) || 620;
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

  // Cập nhật cá trong canvas engine khi danh sách cá thay đổi
  useEffect(() => {
    engineRef.current?.syncFishes(gameState.fishes);
  }, [gameState.fishes]);

  // Khi lakeTheme thay đổi và prefers-reduced-motion đang bật, vẽ lại frame tĩnh
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

    // 1. Kiểm tra có bấm trúng cá không: cá quay vòng, sủi bọt và mở thẻ kiểm tra cá
    const hitFishId = engineRef.current.checkPetFish(x, y);
    if (hitFishId) {
      setInspectedFishId(hitFishId);
      setIsEditingName(false);
      return;
    }

    // 2. Nhặt đồ trên lá sen nổi nếu có
    const collected = engineRef.current.checkCollectForage(x, y);
    if (collected) return;

    // 3. Chế độ Sandbox tự do: Bấm vào nước tự do thả mồi hạt vàng và tạo gợn sóng 3D không giới hạn
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
    // Nhặt tự nhiên khi rê chuột qua lá sen
    engineRef.current.checkCollectForage(x, y);
  };

  const handlePointerLeave = () => {
    engineRef.current?.setPointer(null, null);
  };

  const handleAddNewFish = (species: FishSpeciesId) => {
    const result = addFishToLake(gameState, species);
    setGameState(result.newState);
    setIsAddSpeciesOpen(false);
    showToast(`Đã thêm ${result.fish.name} (${FISH_SPECIES[species].nameVi}) vào hồ.`);
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
    showToast(`Đã thả ${targetFish?.name || 'cá'} về với tự nhiên.`);
  };

  const handleSaveRename = (fishId: string) => {
    if (!editingName.trim()) {
      setIsEditingName(false);
      return;
    }
    setGameState((prev) => renameFish(prev, fishId, editingName));
    setIsEditingName(false);
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
        'relative h-[540px] w-full overflow-hidden transition-colors duration-700 select-none md:h-[640px]',
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
          1. VIÊN THUỐC KÍNH MỜ GÓC TRÊN BÊN PHẢI (ZERO ICONS HUD PILL)
         =================================================================== */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setIsDockOpen((prev) => !prev)}
          className="flex items-center gap-2.5 rounded-full border border-[#4E9B58]/35 bg-[#0B241C]/80 px-4 py-1.5 text-[13px] font-semibold text-[#E8F4EE] shadow-lg backdrop-blur-md transition-all hover:border-[#6EE7B7]/60 hover:bg-[#0E2D23] active:scale-95"
          title="Nhấp để bật/tắt bảng điều khiển Hồ Sen"
        >
          <span>Hồ Sen (Số cá: {gameState.fishes.length})</span>
          <span className="text-[10px] text-[#6EE7B7]">{isDockOpen ? '[Thu gọn]' : '[Mở]'}</span>
        </button>

        {/* ===================================================================
            2. BẢNG ĐIỀU KHIỂN MỞ RỘNG (EXPANDABLE GLASSMORPHIC DOCK - DANH SÁCH)
           =================================================================== */}
        {isDockOpen && (
          <div className="w-84 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#4E9B58]/35 bg-[#0B241C]/95 p-4 text-[#E8F4EE] shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#4E9B58]/20 pb-2">
              <h3 className="text-sm font-bold tracking-wide text-[#E8F4EE]">Danh sách</h3>
              <button
                type="button"
                onClick={() => setIsDockOpen(false)}
                className="rounded-lg border border-white/10 px-2.5 py-0.5 text-xs text-[#A7C8B8] transition hover:bg-white/10 hover:text-white"
              >
                Đóng
              </button>
            </div>

            {/* Thao tác Sandbox: Thêm cá mới & Mở Sổ Cá */}
            <div className="mb-3.5 grid grid-cols-2 gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAddSpeciesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-center rounded-xl border border-[#4E9B58]/50 bg-[#4E9B58]/20 py-2 text-xs font-semibold text-[#E8F4EE] transition hover:bg-[#4E9B58]/35"
                >
                  Thêm cá mới
                </button>

                {/* Dropdown chọn 6 loài cá */}
                {isAddSpeciesOpen && (
                  <div className="absolute top-full left-0 z-30 mt-1.5 w-60 rounded-xl border border-[#4E9B58]/40 bg-[#071F17] p-2 shadow-2xl">
                    <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-wider text-[#A7C8B8] uppercase">
                      Chọn loài cá để thả
                    </div>
                    <div className="flex flex-col gap-1">
                      {(Object.keys(FISH_SPECIES) as FishSpeciesId[]).map((spId) => {
                        const meta = FISH_SPECIES[spId];
                        return (
                          <button
                            key={spId}
                            type="button"
                            onClick={() => handleAddNewFish(spId)}
                            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-[#E8F4EE] transition hover:bg-white/10"
                          >
                            <span>{meta.nameVi}</span>
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: `rgb(${meta.baseColor.join(',')})` }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCompendiumOpen(true)}
                className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-medium text-[#CDE6D8] transition hover:border-[#6EE7B7]/50 hover:bg-white/10 hover:text-white"
              >
                Sổ Cá
              </button>
            </div>

            {/* Danh sách cá đang bơi trong hồ */}
            <div className="mb-2 flex items-center justify-between text-xs text-[#A7C8B8]">
              <span>Cá trong hồ ({gameState.fishes.length})</span>
              <span className="text-[10px]">Chế độ Sandbox</span>
            </div>

            <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
              {gameState.fishes.map((fish) => {
                const spMeta = FISH_SPECIES[fish.species] ?? FISH_SPECIES.koi;
                return (
                  <div
                    key={fish.id}
                    className="flex items-center justify-between rounded-xl border border-[#4E9B58]/20 bg-black/30 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: `rgb(${spMeta.baseColor.join(',')})` }}
                        />
                        <span className="truncate font-semibold text-white">{fish.name}</span>
                      </div>
                      <div className="text-[11px] text-[#A7C8B8]">
                        {spMeta.nameVi} · {fish.scale}x
                      </div>
                    </div>
                    <div className="ml-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectedFishId(fish.id);
                          setIsEditingName(false);
                        }}
                        className="rounded-lg border border-[#4E9B58]/30 bg-[#4E9B58]/20 px-2 py-1 text-[11px] font-medium text-[#CDE6D8] transition hover:bg-[#4E9B58]/40 hover:text-white"
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFish(fish.id)}
                        disabled={gameState.fishes.length <= 1}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          gameState.fishes.length <= 1
                            ? 'Hồ cần giữ lại ít nhất 1 chú cá'
                            : 'Thả cá về tự nhiên'
                        }
                      >
                        Thả bớt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mẹo tương tác */}
            <div className="mt-3 rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5 text-[11px] leading-relaxed text-[#A7C8B8]">
              Nhấp mặt nước để thả mồi và tạo sóng. Nhấp trực tiếp vào thân cá để kiểm tra và tùy
              chỉnh kích thước.
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================
          3. THẺ XEM CHI TIẾT CÁ (FISH DETAIL CARD - ZERO ICONS)
         =================================================================== */}
      {inspectedFish && inspectedSpeciesMeta && (
        <div className="absolute top-16 left-4 z-30 w-76 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#6EE7B7]/40 bg-[#071F17]/95 p-4 text-[#E8F4EE] shadow-2xl backdrop-blur-xl md:left-8">
          <div className="mb-2.5 flex items-center justify-between border-b border-[#4E9B58]/25 pb-2">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  maxLength={24}
                  className="w-36 rounded-lg border border-[#6EE7B7]/50 bg-black/40 px-2 py-0.5 text-xs text-white outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveRename(inspectedFish.id)}
                  className="rounded-md bg-[#4E9B58] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-[#5FB06B]"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">{inspectedFish.name}</h4>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(inspectedFish.name);
                    setIsEditingName(true);
                  }}
                  className="text-xs text-[#A7C8B8] hover:text-[#6EE7B7]"
                >
                  [Đổi tên]
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setInspectedFishId(null)}
              className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-[#A7C8B8] hover:bg-white/10 hover:text-white"
            >
              Đóng
            </button>
          </div>

          {/* Loài & Tên khoa học / quốc tế */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6EE7B7]">
              {inspectedSpeciesMeta.nameVi}
            </span>
            <span className="text-[10px] text-[#A7C8B8]">{inspectedSpeciesMeta.commonName}</span>
          </div>

          <p className="mb-3 text-[11px] leading-relaxed text-[#A7C8B8]">
            {inspectedSpeciesMeta.description}
          </p>

          {/* Tùy chỉnh kích thước cá 0.5x -> 1.5x */}
          <div className="mb-3.5 rounded-xl border border-white/10 bg-black/30 p-2.5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-[#CDE6D8]">
              <span>Kích thước cá</span>
              <span className="font-bold text-[#FDE047]">{inspectedFish.scale}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={inspectedFish.scale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setGameState((prev) => updateFishScale(prev, inspectedFish.id, val));
              }}
              className="w-full cursor-pointer accent-[#4E9B58]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#A7C8B8]">
              <span>0.5x (Nhỏ)</span>
              <span>1.0x (Chuẩn)</span>
              <span>1.5x (Lớn)</span>
            </div>
          </div>

          {/* Thao tác với cá */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleRemoveFish(inspectedFish.id);
                setInspectedFishId(null);
              }}
              disabled={gameState.fishes.length <= 1}
              className="flex-1 rounded-xl border border-red-500/30 bg-red-500/15 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Thả bớt
            </button>
            <button
              type="button"
              onClick={() => setInspectedFishId(null)}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          4. SỔ CÁ (COMPENDIUM MODAL - ĐẦY ĐỦ 6 LOÀI - ZERO ICONS)
         =================================================================== */}
      {isCompendiumOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative max-h-[90%] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#4E9B58]/40 bg-[#071F17] p-5 text-[#E8F4EE] shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#4E9B58]/25 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Sổ Cá</h3>
                <p className="text-xs text-[#A7C8B8]">
                  Hồ sen tri thức · Hệ sinh thái gồm 6 loài cá tự nhiên
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompendiumOpen(false)}
                className="rounded-xl border border-white/15 px-3 py-1 text-xs text-[#A7C8B8] hover:bg-white/10 hover:text-white"
              >
                Đóng
              </button>
            </div>

            {/* Danh sách 6 loài cá */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(Object.keys(FISH_SPECIES) as FishSpeciesId[]).map((speciesId) => {
                const meta = FISH_SPECIES[speciesId];
                return (
                  <div
                    key={speciesId}
                    className="flex flex-col justify-between rounded-2xl border border-[#4E9B58]/35 bg-[#0B2A20]/60 p-3.5 transition"
                  >
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-white/40"
                            style={{
                              backgroundColor: `rgb(${meta.baseColor.join(',')})`,
                            }}
                          />
                          <span className="text-xs font-bold text-white">{meta.nameVi}</span>
                        </div>
                        <span className="text-[10px] text-[#A7C8B8]">{meta.commonName}</span>
                      </div>
                      <p className="mb-3 text-[11px] leading-relaxed text-[#A7C8B8]">
                        {meta.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAddNewFish(speciesId);
                        setIsCompendiumOpen(false);
                      }}
                      className="w-full rounded-xl border border-[#4E9B58]/40 bg-[#4E9B58]/20 py-2 text-xs font-semibold text-[#E8F4EE] transition hover:bg-[#4E9B58]/35"
                    >
                      Thả vào hồ
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          5. THÔNG BÁO NỔI TOAST NHẸ NHÀNG (ZERO ICONS)
         =================================================================== */}
      {toastMessage && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#6EE7B7]/40 bg-[#0B241C]/90 px-4 py-1.5 text-xs font-semibold text-[#E8F4EE] shadow-xl backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* Mép trên hồ sen (Top edge mist blend) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b transition-colors duration-700 md:h-36',
          lakeTheme === 'day'
            ? 'from-[#071A14] via-[#1B3B32]/55 to-transparent'
            : 'from-[#071A14] via-[#040D08]/75 to-transparent',
        )}
        aria-hidden="true"
      />

      {/* Mép dưới hồ sen (Bottom blend) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t transition-colors duration-700',
          lakeTheme === 'day' ? 'from-[#1D4A37] to-transparent' : 'from-[#040D08] to-transparent',
        )}
        aria-hidden="true"
      />
    </section>
  );
};

export default GrandLotusLake;
