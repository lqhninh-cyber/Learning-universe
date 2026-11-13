import { type FC, useEffect, useRef, useState } from 'react';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import { createLotusCanvasEngine, type LotusCanvasEngine } from './lotusCanvasEngine';
import {
  applyPassiveReplenishment,
  awardLessonBonus,
  feedFish,
  getXpForNextLevel,
  HATCH_GEM_COST,
  hatchNewKoi,
  KOI_BREEDS,
  type KoiBreedId,
  loadZenKoiState,
  petFish,
  renameFish,
  type SavedKoiFish,
  saveZenKoiState,
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
 * ĐẠI CẢNH "HỒ SEN TRI THỨC & LIÊN TRÌ NGƯ CÁC" (THE LIVING GRAND LOTUS LAKE & ZEN KOI SANCTUARY)
 *
 * Tái tạo hệ sinh thái hồ sen Canvas 2D thủ tục sống động 120fps kết hợp mini-game nuôi cá thiền định:
 * - 5 giống cá Koi: Hồng Bạch, Hoàng Kim, Tam Sắc, Thanh Ngọc & Kim Long Ngư (Celestial Butterfly Koi 8%).
 * - Cho ăn, thăng cấp Lv 1 -> 10, hào quang phát quang dưới nước và đuôi cánh bướm kim sa lấp lánh.
 * - Nhặt lượm tự nhiên Giọt Sương và Hạt Sen Vàng trên lá sen nổi.
 * - Lưu trữ dữ liệu bền vững qua localStorage (`lu_lotus_koi_game_v1`).
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LotusCanvasEngine | null>(null);

  const [lakeTheme, setLakeTheme] = useState<'day' | 'night'>(getSystemLakeTheme);
  const lakeThemeRef = useRef<'day' | 'night'>(lakeTheme);

  // Zen Koi Game State & HUD Controls
  const [gameState, setGameState] = useState<ZenKoiGameState>(() => loadZenKoiState());
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'feed' | 'pet'>('feed');
  const [inspectedFishId, setInspectedFishId] = useState<string | null>(null);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [hatchedFish, setHatchedFish] = useState<SavedKoiFish | null>(null);
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
    }, 3200);
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

  // Hồi phục thức ăn tự động mỗi 60s
  useEffect(() => {
    const replenishTimer = window.setInterval(() => {
      setGameState((prev) => applyPassiveReplenishment(prev));
    }, 60000);
    return () => window.clearInterval(replenishTimer);
  }, []);

  // Lắng nghe sự kiện hoàn thành bài học để thưởng thức ăn & ngọc sương
  useEffect(() => {
    const handleLessonCompleted = () => {
      setGameState((prev) => {
        const next = awardLessonBonus(prev);
        showToast('🌟 Hoàn thành bài học: Nhận thưởng +10 Hạt Sen & +5 Ngọc Sương!');
        return next;
      });
    };
    window.addEventListener('lu:lesson-completed', handleLessonCompleted);
    return () => window.removeEventListener('lu:lesson-completed', handleLessonCompleted);
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

    // Đăng ký các callback tương tác sinh thái từ Engine
    engine.setOnFishFed((fishId, _leveled, newLv) => {
      setGameState((prev) => {
        const { newState, leveledUp } = feedFish(prev, fishId);
        if (leveledUp) {
          const fish = newState.fishes.find((f) => f.id === fishId);
          showToast(`🎉 ${fish?.name || 'Cá Koi'} đã đạt Cấp ${newLv}!`);
        }
        return newState;
      });
    });

    engine.setOnForageCollected((type, food, gems) => {
      setGameState((prev) => {
        const newState: ZenKoiGameState = {
          ...prev,
          foodCount: Math.min(150, prev.foodCount + food),
          dewGems: prev.dewGems + gems,
          stats: {
            ...prev.stats,
            totalForaged: prev.stats.totalForaged + 1,
          },
        };
        saveZenKoiState(newState);
        showToast(
          type === 'dew'
            ? `💧 Nhặt được Giọt Sương (+${food} Hạt Sen, +${gems} Ngọc Sương)`
            : `🌾 Thu hoạch Hạt Sen Vàng (+${food} Hạt Sen)`,
        );
        return newState;
      });
    });

    engine.setOnFishPetted((fishId) => {
      setGameState((prev) => petFish(prev, fishId));
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

  // Cập nhật cá Koi trong canvas engine khi danh sách cá thay đổi
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

    // Ưu tiên 1: Nhặt đồ trên lá sen nổi
    const collected = engineRef.current.checkCollectForage(x, y);
    if (collected) return;

    if (interactionMode === 'pet') {
      // Ưu tiên 2 (Chế độ vuốt ve / xem cá): Kiểm tra có bấm trúng cá Koi không
      const hitFishId = engineRef.current.checkPetFish(x, y);
      if (hitFishId) return;

      // Nếu không trúng cá, tạo gợn sóng nước nhẹ
      engineRef.current.addRipple(x, y);
    } else {
      // Chế độ cho ăn (Mặc định)
      if (gameState.foodCount > 0) {
        const spawned = engineRef.current.feedBait(x, y);
        if (spawned) {
          setGameState((prev) => {
            const next: ZenKoiGameState = {
              ...prev,
              foodCount: Math.max(0, prev.foodCount - 1),
            };
            saveZenKoiState(next);
            return next;
          });
        }
      } else {
        engineRef.current.addRipple(x, y);
        showToast('🌾 Đã hết Hạt Sen! Hãy nhặt sương hoặc hoàn thành bài học để có thêm.');
      }
    }
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

  const handleHatchKoi = () => {
    if (gameState.dewGems < HATCH_GEM_COST) {
      showToast(`Cần ${HATCH_GEM_COST} Ngọc Sương để ấp cá mới!`);
      return;
    }
    const result = hatchNewKoi(gameState);
    if (result) {
      setGameState(result.newState);
      setHatchedFish(result.fish);
      showToast(`🪷 Chúc mừng! Bạn đã ấp thành công cá ${result.fish.name}!`);
    }
  };

  const handleFeedDirectly = (fishId: string) => {
    if (gameState.foodCount <= 0) {
      showToast('🌾 Đã hết Hạt Sen! Hãy nhặt sương hoặc hoàn thành bài học để có thêm.');
      return;
    }
    setGameState((prev) => {
      const { newState, leveledUp, newLevel } = feedFish(
        { ...prev, foodCount: Math.max(0, prev.foodCount - 1) },
        fishId,
      );
      if (leveledUp) {
        const fish = newState.fishes.find((f) => f.id === fishId);
        showToast(`🎉 ${fish?.name || 'Cá Koi'} đã đạt Cấp ${newLevel}!`);
      }
      return newState;
    });
  };

  const handleSaveRename = (fishId: string) => {
    if (!editingName.trim()) {
      setIsEditingName(false);
      return;
    }
    setGameState((prev) => renameFish(prev, fishId, editingName));
    setIsEditingName(false);
    showToast('✨ Đã cập nhật tên cá thành công!');
  };

  const inspectedFish = gameState.fishes.find((f) => f.id === inspectedFishId) ?? null;
  const inspectedBreed = inspectedFish ? KOI_BREEDS[inspectedFish.breed] : null;

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
          1. VIÊN THUỐC KÍNH MỜ GÓC TRÊN BÊN PHẢI (NON-INTRUSIVE HUD PILL)
         =================================================================== */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setIsDockOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-[#4E9B58]/35 bg-[#0B241C]/80 px-4 py-1.5 text-[13px] font-semibold text-[#E8F4EE] shadow-lg backdrop-blur-md transition-all hover:border-[#6EE7B7]/60 hover:bg-[#0E2D23] active:scale-95"
          title="Nhấp để bật/tắt bảng điều khiển Hồ Sen"
        >
          <span className="text-sm">🐟</span>
          <span>
            Hồ Sen của bạn (Số cá: {gameState.fishes.length} · Cấp hồ: Lv.{gameState.pondLevel})
          </span>
          <span className="text-xs text-[#6EE7B7]">{isDockOpen ? '▲' : '▼'}</span>
        </button>

        {/* ===================================================================
            2. BẢNG ĐIỀU KHIỂN MỞ RỘNG (EXPANDABLE GLASSMORPHIC DOCK)
           =================================================================== */}
        {isDockOpen && (
          <div className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#4E9B58]/35 bg-[#0B241C]/92 p-4 text-[#E8F4EE] shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#4E9B58]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🪷</span>
                <h3 className="text-sm font-bold text-[#E8F4EE]">Liên Trì Ngư Các</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDockOpen(false)}
                className="rounded-lg p-1 text-sm text-[#A7C8B8] transition hover:bg-white/10 hover:text-white"
                title="Đóng bảng điều khiển"
              >
                ✕
              </button>
            </div>

            {/* Kho tài nguyên */}
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-[#E5A520]/25 bg-[#251F10]/60 px-3 py-2">
                <span className="text-base">🌾</span>
                <div>
                  <div className="text-[10px] text-[#FBD38D]">Hạt Sen</div>
                  <div className="text-sm font-bold text-[#FFFBEB]">{gameState.foodCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#38BDF8]/25 bg-[#0C2234]/60 px-3 py-2">
                <span className="text-base">💧</span>
                <div>
                  <div className="text-[10px] text-[#7DD3FC]">Ngọc Sương</div>
                  <div className="text-sm font-bold text-[#F0F9FF]">{gameState.dewGems}</div>
                </div>
              </div>
            </div>

            {/* 3 Chế độ tương tác nhanh */}
            <div className="mb-3 flex flex-col gap-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setInteractionMode('feed')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition',
                    interactionMode === 'feed'
                      ? 'border-[#E5A520] bg-[#E5A520]/25 text-[#FFFBEB] shadow-sm'
                      : 'border-[#4E9B58]/25 bg-black/20 text-[#CDE6D8] hover:border-[#4E9B58]/50 hover:bg-white/5',
                  )}
                >
                  <span>🌾</span> Cho ăn
                </button>
                <button
                  type="button"
                  onClick={() => setInteractionMode('pet')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition',
                    interactionMode === 'pet'
                      ? 'border-[#6EE7B7] bg-[#6EE7B7]/25 text-[#FFFBEB] shadow-sm'
                      : 'border-[#4E9B58]/25 bg-black/20 text-[#CDE6D8] hover:border-[#4E9B58]/50 hover:bg-white/5',
                  )}
                >
                  <span>✨</span> Vuốt ve
                </button>
              </div>

              <button
                type="button"
                onClick={handleHatchKoi}
                disabled={gameState.dewGems < HATCH_GEM_COST}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition',
                  gameState.dewGems >= HATCH_GEM_COST
                    ? 'border-[#F59E0B]/50 bg-gradient-to-r from-[#D97706]/40 via-[#F59E0B]/30 to-[#D97706]/40 text-[#FFFBEB] hover:brightness-110 active:scale-98'
                    : 'cursor-not-allowed border-white/10 bg-white/5 text-white/40',
                )}
              >
                <span>🪷</span>
                <span>Ấp cá mới ({HATCH_GEM_COST} 💧)</span>
              </button>
            </div>

            {/* Nút mở Sổ Cá */}
            <button
              type="button"
              onClick={() => setIsCompendiumOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#4E9B58]/30 bg-black/25 py-2 text-xs font-medium text-[#CDE6D8] transition hover:border-[#6EE7B7]/60 hover:bg-white/5 hover:text-white"
            >
              <span>📖</span>
              <span>Sổ Cá (Koi Compendium)</span>
            </button>

            {/* Mẹo tương tác */}
            <div className="mt-3 rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5 text-[11px] leading-relaxed text-[#A7C8B8]">
              💡 Rê chuột nhặt giọt sương trên lá sen, hoặc hoàn thành bài học để nhận thêm Hạt Sen
              & Ngọc Sương.
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================
          3. THẺ XEM CHI TIẾT CÁ KOI (FISH DETAIL CARD POPOVER)
         =================================================================== */}
      {inspectedFish && inspectedBreed && (
        <div className="absolute top-16 left-4 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#6EE7B7]/40 bg-[#071F17]/95 p-4 text-[#E8F4EE] shadow-2xl backdrop-blur-xl md:left-8">
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
                  title="Đổi tên cá"
                >
                  ✎
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setInspectedFishId(null)}
              className="rounded-lg p-1 text-xs text-[#A7C8B8] hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Giống loài & Độ hiếm */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-[#CDE6D8]">{inspectedBreed.nameVi}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                inspectedBreed.rarityTier === 5
                  ? 'border border-[#F59E0B]/50 bg-[#F59E0B]/25 text-[#FDE68A]'
                  : inspectedBreed.rarityTier === 4
                    ? 'border border-[#34D399]/50 bg-[#34D399]/25 text-[#A7F3D0]'
                    : inspectedBreed.rarityTier >= 2
                      ? 'border border-[#60A5FA]/50 bg-[#60A5FA]/25 text-[#BFDBFE]'
                      : 'border border-white/20 bg-white/10 text-[#E5E7EB]',
              )}
            >
              {inspectedBreed.rarityVi}
            </span>
          </div>

          {/* Thanh cấp độ & XP */}
          <div className="mb-2.5">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#6EE7B7]">Cấp {inspectedFish.level} / 10</span>
              <span className="text-[11px] text-[#A7C8B8]">
                {inspectedFish.xp} / {getXpForNextLevel(inspectedFish.level)} XP
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4E9B58] to-[#6EE7B7] transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (inspectedFish.xp / getXpForNextLevel(inspectedFish.level)) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Thân thiết & Kích thước */}
          <div className="mb-3.5 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-black/30 p-2">
              <div className="text-[#A7C8B8]">Thân thiết</div>
              <div className="font-bold text-[#F472B6]">💖 {inspectedFish.affection}%</div>
            </div>
            <div className="rounded-lg bg-black/30 p-2">
              <div className="text-[#A7C8B8]">Kích thước</div>
              <div className="font-bold text-[#FBBF24]">📏 {inspectedFish.scale}x</div>
            </div>
          </div>

          {/* Nút cho ăn trực tiếp */}
          <button
            type="button"
            onClick={() => handleFeedDirectly(inspectedFish.id)}
            disabled={gameState.foodCount <= 0}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition',
              gameState.foodCount > 0
                ? 'border-[#E5A520]/50 bg-[#E5A520]/25 text-[#FFFBEB] hover:bg-[#E5A520]/40'
                : 'cursor-not-allowed border-white/10 bg-white/5 text-white/40',
            )}
          >
            <span>🌾</span> Cho ăn trực tiếp (+10 XP)
          </button>
        </div>
      )}

      {/* ===================================================================
          4. SỔ CÁ KOI (KOI COMPENDIUM MODAL)
         =================================================================== */}
      {isCompendiumOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative max-h-[90%] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#4E9B58]/40 bg-[#071F17] p-5 text-[#E8F4EE] shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#4E9B58]/25 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <div>
                  <h3 className="text-base font-bold text-white">Sổ Tay Ngư Các (Zen Koi)</h3>
                  <p className="text-xs text-[#A7C8B8]">
                    Hồ sen tri thức · Đã phát hiện {gameState.unlockedBreeds.length}/5 giống loài
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompendiumOpen(false)}
                className="rounded-xl p-1.5 text-sm text-[#A7C8B8] hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Danh sách 5 giống loài */}
            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(Object.keys(KOI_BREEDS) as KoiBreedId[]).map((breedId) => {
                const meta = KOI_BREEDS[breedId];
                const isUnlocked = gameState.unlockedBreeds.includes(breedId);
                return (
                  <div
                    key={breedId}
                    className={cn(
                      'rounded-2xl border p-3 transition',
                      isUnlocked
                        ? 'border-[#4E9B58]/40 bg-[#0B2A20]/60'
                        : 'border-white/10 bg-black/40 opacity-70',
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full border border-white/40 shadow-sm"
                          style={{
                            backgroundColor: `rgb(${meta.baseColor.join(',')})`,
                          }}
                        />
                        <span className="text-xs font-bold text-white">
                          {isUnlocked ? meta.nameVi : '??? (Chưa xuất hiện)'}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-bold',
                          meta.rarityTier === 5
                            ? 'border border-[#F59E0B]/50 bg-[#F59E0B]/25 text-[#FDE68A]'
                            : meta.rarityTier === 4
                              ? 'border border-[#34D399]/50 bg-[#34D399]/25 text-[#A7F3D0]'
                              : meta.rarityTier >= 2
                                ? 'border border-[#60A5FA]/50 bg-[#60A5FA]/25 text-[#BFDBFE]'
                                : 'border border-white/20 bg-white/10 text-[#E5E7EB]',
                        )}
                      >
                        {meta.rarityVi}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#A7C8B8]">
                      {isUnlocked
                        ? meta.description
                        : 'Hãy chăm sóc hồ sen và ấp trứng bằng Ngọc Sương để mở khóa giống cá này.'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Đàn cá đang bơi trong hồ */}
            <div>
              <h4 className="mb-2 text-xs font-bold text-[#6EE7B7]">
                Đàn cá trong hồ ({gameState.fishes.length})
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {gameState.fishes.map((fish) => (
                  <button
                    key={fish.id}
                    type="button"
                    onClick={() => {
                      setInspectedFishId(fish.id);
                      setIsCompendiumOpen(false);
                    }}
                    className="flex flex-col items-start rounded-xl border border-[#4E9B58]/20 bg-black/25 p-2 text-left transition hover:border-[#6EE7B7]/50 hover:bg-white/5"
                  >
                    <span className="text-xs font-bold text-white">{fish.name}</span>
                    <span className="text-[10px] text-[#A7C8B8]">
                      {KOI_BREEDS[fish.breed]?.nameVi.split(' ')[0]} · Lv.{fish.level}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          5. MODAL CHÚC MỪNG ẤP THÀNH CÔNG (HATCH CELEBRATION)
         =================================================================== */}
      {hatchedFish && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-[#F59E0B]/60 bg-gradient-to-b from-[#132A22] to-[#081813] p-6 text-center text-[#E8F4EE] shadow-2xl">
            <div className="mb-3 animate-bounce text-4xl">🪷</div>
            <h3 className="text-lg font-bold text-[#FDE68A]">Ấp Thành Công Cá Koi Mới!</h3>
            <p className="mt-1 text-xs text-[#CDE6D8]">
              Một chú cá Koi đã chào đời và bơi vào Liên Trì của bạn.
            </p>

            <div className="my-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-base font-bold text-white">{hatchedFish.name}</div>
              <div className="mt-1 text-xs text-[#6EE7B7]">
                {KOI_BREEDS[hatchedFish.breed]?.nameVi}
              </div>
              <div className="mt-2 text-[11px] text-[#A7C8B8]">
                {KOI_BREEDS[hatchedFish.breed]?.description}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInspectedFishId(hatchedFish.id);
                setHatchedFish(null);
              }}
              className="w-full rounded-xl border border-[#F59E0B]/60 bg-gradient-to-r from-[#D97706] to-[#F59E0B] py-2.5 text-xs font-bold text-[#14261F] shadow-lg transition hover:brightness-110 active:scale-98"
            >
              Chào đón vào Hồ Sen
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          6. THÔNG BÁO NỔI TOAST NHẸ NHÀNG
         =================================================================== */}
      {toastMessage && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#6EE7B7]/40 bg-[#0B241C]/90 px-4 py-1.5 text-xs font-semibold text-[#E8F4EE] shadow-xl backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* Mép trên hồ sen (Top edge mist blend hòa liền vào Dải Chạng Vạng Bờ Hồ #071A14) */}
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
