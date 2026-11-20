/**
 * ĐỘNG CƠ VẬT LÝ BI CẦU ĐẶC CHUẨN WPA (RIGID-SPHERE BILLIARDS PHYSICS)
 * - Bước lặp con cơ bản SUBSTEPS = 8 mỗi frame ở 120fps (`dtScale`), tự động tăng 16 ở tốc độ phá bi.
 * - Chuẩn hóa tỷ lệ bàn (`tableScale = feltWidth / 1030`) giúp cảm giác nhanh/chậm đồng nhất trên mọi màn hình.
 * - Ánh xạ điểm chạm đầu cơ (spinX, spinY) liên tục qua tâm 0:
 *   + spinY = 0 -> Stun thuần (s = 0, tách góc 90° chuẩn tiếp tuyến)
 *   + spinY ≈ +0.60 -> Lăn tự nhiên (s = v0, uốn cong theo quy tắc 30°)
 *   + spinY = +1.0 -> Cù lê sâu (Power Follow) / spinY = -1.0 -> Trô giật lùi (Power Draw)
 * - Ma sát trượt -> lăn thuần túy hoàn toàn theo định luật Coulomb (không dùng hệ số nhân mũ làm dính nỉ).
 * - Va chạm Bi–Bi tích hợp cả CIT (Cut-Induced Throw), SIT (Spin-Induced Throw) và Gear Effect.
 * - Va chạm băng chuẩn Han (2005) / Mathavan (2010): đàn hồi phụ thuộc tốc độ + phân biệt Running / Reverse English.
 */

export const SUBSTEPS = 8;
export const BREAK_HIGH_SPEED_THRESHOLD = 18;
export const REFERENCE_FELT_WIDTH_PX = 1030;
export const BALL_RESTITUTION = 0.95;
export const BALL_BALL_FRICTION_MU = 0.055;
export const CUSHION_RESTITUTION = 0.85;
export const CUSHION_MIN_RESTITUTION = 0.7;
export const CUSHION_FRICTION_MU = 0.16;
export const JAW_RESTITUTION = 0.76;
export const JAW_RADIUS_PX = 3.5;
export const STOP_SPEED_PX_PER_FRAME = 0.085;
export const MAX_SHOT_SPEED_PX_PER_FRAME = 34.0;
export const POWER_CURVE_EXPONENT = 1.36;
export const SLIDE_FRICTION_ACCEL = 0.265;
export const ROLL_FRICTION_RATIO = 0.112;
export const COLLISION_THROW_RATIO = 0.055;
export const CUE_SQUIRT_MAX_RAD = (1.15 * Math.PI) / 180;
export const ENGLISH_CUSHION_SPIN_DECAY = 0.6;
export const ENGLISH_SURFACE_SPEED_REF = 6.2;
export const ENGLISH_SIT_SPEED_REF = 4.4;
export const INITIAL_RACK_GAP_PX = 0.45;
export const MAX_SAFE_SPIN_RADIUS = 0.62;

export interface RigidBallMotion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Vận tốc lăn tương đương của bề mặt cầu tiếp xúc mặt nỉ (lăn thuần túy khi sx == vx, sy == vy). */
  sx: number;
  sy: number;
  /** Độ xoáy ngang Ép phê omega_z chuẩn hóa trong [-1.5, 1.5] (> 0: ép phê phải / quay ngược chiều kim đồng hồ nhìn từ trên xuống). */
  omegaZ: number;
}

/**
 * Hệ số tỷ lệ mặt bàn so với kích thước chuẩn 1030px giúp cảm giác lực & ma sát bất biến trên mọi thiết bị.
 */
export function computePhysicsScale(feltWidthPx: number): number {
  if (!Number.isFinite(feltWidthPx) || feltWidthPx <= 0) return 1;
  return Math.max(0.35, Math.min(1.6, feltWidthPx / REFERENCE_FELT_WIDTH_PX));
}

/**
 * Đường cong lực phi tuyến v0 = v_max * p^1.24 (theo chuẩn bàn thực: 25% nhẹ ~0.4 TL, 50% vừa ~2.0 TL, 100% phá bi cực uy lực).
 */
export function computeShotLaunchSpeed(
  powerNorm: number,
  maxSpeed = MAX_SHOT_SPEED_PX_PER_FRAME,
  tableScale = 1,
): number {
  const clamped = Math.max(0.08, Math.min(1, powerNorm));
  return maxSpeed * tableScale * Math.pow(clamped, POWER_CURVE_EXPONENT);
}

/**
 * Góc lệch đầu cơ (Cue Squirt) do đánh lệch tâm ngang (ép phê).
 */
export function computeCueSquirtOffsetRad(powerNorm: number, spinX: number): number {
  const clampedPower = Math.max(0.08, Math.min(1, powerNorm));
  const clampedSpinX = Math.max(-1, Math.min(1, spinX));
  return clampedSpinX * Math.pow(clampedPower, 1.15) * CUE_SQUIRT_MAX_RAD;
}

/**
 * Khởi tạo vận tốc tâm, vận tốc lăn bề mặt s liên tục qua gốc 0 (Stun -> Natural Roll -> Follow / Draw),
 * xoáy ngang omegaZ và góc lệch đầu cơ squirt (<= 1.15°) tại thời điểm đầu cơ chạm bi cái.
 */
export function initializeCueBallShot(
  cueBall: RigidBallMotion,
  aimAngleRad: number,
  powerNorm: number,
  spinX: number,
  spinY: number,
  tableScale = 1,
): { readonly dirX: number; readonly dirY: number; readonly speed: number } {
  const clampedPower = Math.max(0.08, Math.min(1, powerNorm));
  const clampedSpinX = Math.max(-1, Math.min(1, spinX));
  const clampedSpinY = Math.max(-1, Math.min(1, spinY));

  const speed = computeShotLaunchSpeed(clampedPower, MAX_SHOT_SPEED_PX_PER_FRAME, tableScale);
  const squirtOffset = computeCueSquirtOffsetRad(clampedPower, clampedSpinX);
  const launchAngle = aimAngleRad + squirtOffset;
  const dirX = Math.cos(launchAngle);
  const dirY = Math.sin(launchAngle);

  cueBall.vx = dirX * speed;
  cueBall.vy = dirY * speed;

  // Ánh xạ liên tục qua 0 theo vật lý bi cầu đặc (I = 2/5 mR^2):
  // - spinY = 0 -> s = 0 (Stun thuần, chuẩn quy tắc 90°)
  // - spinY ≈ +0.60 -> s = +1.0 * v0 (Lăn tự nhiên ngay lập tức, chuẩn quy tắc 30°)
  // - spinY = +1.0 -> s = +1.65 * v0 (Cù lê sâu)
  // - spinY = -1.0 -> s = -1.95 * v0 (Trô giật lùi mạnh)
  const spinLongitudinalScale = clampedSpinY >= 0 ? 1.65 * clampedSpinY : 1.95 * clampedSpinY;
  cueBall.sx = cueBall.vx * spinLongitudinalScale;
  cueBall.sy = cueBall.vy * spinLongitudinalScale;

  // Ép phê ngang tỷ lệ trực tiếp với độ lệch điểm chạm và lực đánh
  cueBall.omegaZ = clampedSpinX * (0.28 + Math.pow(clampedPower, 0.9) * 0.85);

  return { dirX, dirY, speed };
}

/**
 * Tích phân 1 substep chuyển pha Ma sát Trượt -> Lăn Thuần Túy hoàn toàn theo Coulomb:
 * - Khi |v_slip| > eps: ma sát trượt mu_s kéo v về phía s và mô-men cầu đặc (I = 2/5 mR^2) kéo s về v nhanh gấp 2.5x.
 * - Khi v == s: chỉ chịu ma sát lăn thuần Coulomb a_r = mu_r * g (KHÔNG dùng giảm tốc hàm mũ gây dính nỉ).
 * - Trả về cả góc xoay quanh trục Z (dSpinZRad) để hiển thị bi xoay tít tại chỗ khi đánh ép phê mạnh.
 */
export function integrateClothSlideToRollSubstep(
  ball: RigidBallMotion,
  subDtScale: number,
  tableScale = 1,
): { readonly rollDx: number; readonly rollDy: number; readonly dSpinZRad: number } {
  const prevX = ball.x;
  const prevY = ball.y;

  ball.x += ball.vx * subDtScale;
  ball.y += ball.vy * subDtScale;

  const slideAccel = SLIDE_FRICTION_ACCEL * tableScale;
  const stopSpeed = STOP_SPEED_PX_PER_FRAME * tableScale;

  const slipX = ball.vx - ball.sx;
  const slipY = ball.vy - ball.sy;
  const slipMag = Math.hypot(slipX, slipY);

  let remainingRollDt = subDtScale;

  if (slipMag > 0.035 * tableScale) {
    const ux = slipX / slipMag;
    const uy = slipY / slipMag;
    const maxDv = slideAccel * subDtScale;
    const maxGapClose = 3.5 * maxDv;

    if (slipMag <= maxGapClose) {
      // Đạt trạng thái lăn thuần túy bên trong substep này (v = (5/7)v0 cho stun shot)
      const dv = slipMag / 3.5;
      ball.vx -= ux * dv;
      ball.vy -= uy * dv;
      ball.sx = ball.vx;
      ball.sy = ball.vy;
      remainingRollDt = Math.max(0, subDtScale - slipMag / (3.5 * slideAccel));
    } else {
      ball.vx -= ux * maxDv;
      ball.vy -= uy * maxDv;
      ball.sx += ux * (2.5 * maxDv);
      ball.sy += uy * (2.5 * maxDv);
      remainingRollDt = 0;
    }
  } else {
    ball.sx = ball.vx;
    ball.sy = ball.vy;
  }

  if (remainingRollDt > 0) {
    const rollDecel = slideAccel * ROLL_FRICTION_RATIO;
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > 0) {
      const nextSpeed = Math.max(0, speed - rollDecel * remainingRollDt);
      const scale = nextSpeed / speed;
      ball.vx *= scale;
      ball.vy *= scale;
      ball.sx = ball.vx;
      ball.sy = ball.vy;
    }
  }

  // Giảm tốc xoáy đứng omegaZ theo ma sát tiếp xúc vải nỉ (suy giảm mượt theo Coulomb)
  const spinDrag = 0.0085 * subDtScale;
  if (Math.abs(ball.omegaZ) <= spinDrag) {
    ball.omegaZ = 0;
  } else {
    ball.omegaZ -= Math.sign(ball.omegaZ) * spinDrag;
  }

  // Ngưỡng dừng hoàn toàn khi cả tâm bi và độ quay bề mặt đều suy giảm hết
  const centerSpeed = Math.hypot(ball.vx, ball.vy);
  const surfaceSpeed = Math.hypot(ball.sx, ball.sy);
  if (centerSpeed < stopSpeed && surfaceSpeed < stopSpeed * 1.45) {
    ball.vx = 0;
    ball.vy = 0;
    ball.sx = 0;
    ball.sy = 0;
    if (Math.abs(ball.omegaZ) < 0.06) {
      ball.omegaZ = 0;
    }
  }

  // Độ quay 3D thực của quả cầu được dẫn dắt bởi vận tốc bề mặt s (hiển thị Trô quay ngược thật!)
  const rollDx =
    (ball.sx * 0.78 + ((ball.x - prevX) / Math.max(1e-4, subDtScale)) * 0.22) * subDtScale;
  const rollDy =
    (ball.sy * 0.78 + ((ball.y - prevY) / Math.max(1e-4, subDtScale)) * 0.22) * subDtScale;
  const dSpinZRad = -ball.omegaZ * 0.24 * subDtScale;
  return { rollDx, rollDy, dSpinZRad };
}

/**
 * Phản hồi thành băng chuẩn Han (2005) / Mathavan (2010):
 * - Đàn hồi phụ thuộc tốc độ (đánh mạnh cao su lún sâu -> hiệu suất nảy giảm từ 0.85 về 0.70).
 * - Phân biệt tự nhiên Running English (thuận chiều mở góc ổn định) và Reverse English (nghịch chiều phanh gắt, phụ thuộc tốc độ).
 * - Bị chặn bởi giới hạn ma sát Coulomb trên thành băng (CUSHION_FRICTION_MU).
 */
export function applyCushionEnglishBounce(
  ball: RigidBallMotion,
  inwardNormalX: number,
  inwardNormalY: number,
  normalImpactSpeed: number,
  tableScale = 1,
): void {
  const normalizedImpact = normalImpactSpeed / Math.max(0.35, tableScale);
  const effectiveCOR = Math.max(
    CUSHION_MIN_RESTITUTION,
    CUSHION_RESTITUTION - Math.min(0.15, normalizedImpact * 0.0052),
  );

  const vn = ball.vx * inwardNormalX + ball.vy * inwardNormalY;
  const impactN = vn < 0 ? -vn : Math.max(0, normalImpactSpeed);

  if (vn < 0) {
    ball.vx -= (1 + effectiveCOR) * vn * inwardNormalX;
    ball.vy -= (1 + effectiveCOR) * vn * inwardNormalY;
  }

  // Mũi băng cao 63.5% đường kính (0.27R phía trên tâm bi): phản xạ một phần vận tốc lăn bề mặt
  const sn = ball.sx * inwardNormalX + ball.sy * inwardNormalY;
  if (sn < 0) {
    ball.sx -= (1 + effectiveCOR * 0.82) * sn * inwardNormalX;
    ball.sy -= (1 + effectiveCOR * 0.82) * sn * inwardNormalY;
  }

  // Tiếp tuyến dọc băng theo quy ước chiều phải của cơ thủ khi đối diện băng
  const tanX = inwardNormalY;
  const tanY = -inwardNormalX;
  const vt = ball.vx * tanX + ball.vy * tanY;
  const spinSurfaceV = ball.omegaZ * ENGLISH_SURFACE_SPEED_REF * tableScale;

  // Vận tốc trượt tiếp tuyến tương đối tại mũi cao su:
  // - Running English (vt cùng dấu spinSurfaceV): đẩy mượt dọc băng, góc nảy mở ổn định.
  // - Reverse English (vt ngược dấu spinSurfaceV): độ trượt lớn -> phanh mạnh cắt góc hẹp, nhất là ở tốc độ vừa/nhẹ.
  const tangentSlip = spinSurfaceV - vt * 0.24;
  const maxFrictionImpulse = CUSHION_FRICTION_MU * (1 + effectiveCOR) * impactN;
  const rawImpulse = tangentSlip * 0.44;
  const jTan = Math.max(-maxFrictionImpulse, Math.min(maxFrictionImpulse, rawImpulse));

  if (Math.abs(jTan) > 1e-4) {
    ball.vx += tanX * jTan;
    ball.vy += tanY * jTan;
    ball.sx += tanX * jTan * 0.68;
    ball.sy += tanY * jTan * 0.68;
  }

  // Suy hao omegaZ sau khi bám băng + sinh nhẹ ép phê tự nhiên khi chạm băng xiên góc
  const inducedSpin = (-vt * 0.012) / Math.max(0.35, tableScale);
  ball.omegaZ = Math.max(
    -1.4,
    Math.min(1.4, ball.omegaZ * ENGLISH_CUSHION_SPIN_DECAY + inducedSpin),
  );
}

/**
 * Va chạm đàn hồi Bi–Bi chuẩn vật rắn kèm:
 * - Bảo toàn vận tốc bề mặt lăn s (Cù lê / Trô tự chuyển pha parabol không giả lập).
 * - Cut-Induced Throw (CIT) từ trượt cắt góc.
 * - Spin-Induced Throw (SIT) từ ép phê omegaZ (ép phê phải đẩy bi mục tiêu nhẹ sang trái).
 * - Gearing Outside English (triệt tiêu throw khi trượt tiếp tuyến = 0) & Gear Effect truyền xoáy ngược sang bi mục tiêu.
 */
export function resolveRigidBallPairCollision(
  a: RigidBallMotion,
  b: RigidBallMotion,
  nx: number,
  ny: number,
  tableScale = 1,
): number {
  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal >= 0) return 0;

  const normalImpulse = -(1 + BALL_RESTITUTION) * velAlongNormal * 0.5;
  a.vx -= normalImpulse * nx;
  a.vy -= normalImpulse * ny;
  b.vx += normalImpulse * nx;
  b.vy += normalImpulse * ny;

  // Hệ trục tiếp tuyến tại điểm tiếp xúc: t = (-ny, nx) hướng sang phải nhìn từ tâm A sang B (Canvas +Y xuống)
  const tx = -ny;
  const ty = nx;
  const relTransTan = (a.vx - b.vx) * tx + (a.vy - b.vy) * ty;
  // Ép phê phải (omegaZ > 0, quay CCW từ trên xuống) làm mặt cầu A di chuyển theo hướng -t -> đẩy bi B về phía -t (trái)
  const relSpinTan = -(a.omegaZ + b.omegaZ) * ENGLISH_SIT_SPEED_REF * tableScale;
  const relSurfaceTan = relTransTan + relSpinTan;

  // Xung ma sát tiếp tuyến bị chặn theo Coulomb: J_t <= mu_bb * J_n, và hệ số cầu đặc 1/7
  const maxThrowImpulse = BALL_BALL_FRICTION_MU * normalImpulse;
  const desiredThrow = Math.abs(relSurfaceTan) / 7;
  const jTan = Math.min(maxThrowImpulse, desiredThrow) * Math.sign(relSurfaceTan);

  if (Math.abs(jTan) > 1e-5) {
    b.vx += tx * jTan;
    b.vy += ty * jTan;
    a.vx -= tx * jTan * 0.75;
    a.vy -= ty * jTan * 0.75;

    // Gear Effect: xung ma sát tiếp tuyến sinh mô-men xoáy ngược chiều lên bi mục tiêu & tiêu hao nhẹ xoáy bi cái
    const gearDelta = (jTan / Math.max(0.5, ENGLISH_SIT_SPEED_REF * tableScale)) * 1.45;
    a.omegaZ = Math.max(-1.4, Math.min(1.4, a.omegaZ + gearDelta));
    b.omegaZ = Math.max(-1.4, Math.min(1.4, b.omegaZ + gearDelta));
  }

  a.omegaZ *= 0.9;
  b.omegaZ *= 0.9;

  return Math.abs(velAlongNormal);
}
