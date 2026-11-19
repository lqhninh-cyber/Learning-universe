/**
 * ĐỘNG CƠ VẬT LÝ TRƯỢT – LĂN CHÂN THẬT CHO BIDA KHOÁNG THẠCH (RIGID-SPHERE CLOTH PHYSICS)
 * - Bước lặp con SUBSTEPS = 8 mỗi frame ở 120fps (`dtScale`).
 * - Đường cong lực phi tuyến: v0 = v_max * p^1.35.
 * - Mô hình 2 pha chuẩn vật lý bi cầu đặc (I = 2/5 mR^2):
 *   + Ma sát trượt (mu_s) kéo vận tốc tâm v và vận tốc bề mặt s gặp nhau nhanh gấp 2.5x.
 *   + Sau khi v == s, chuyển sang pha lăn thuần túy cực êm (mu_r = 0.085 * mu_s).
 *   + Nhờ bảo toàn moment bề mặt s qua va chạm đàn hồi, Cù lê (Follow) và Trô (Draw) tự nhiên cong theo parabol thật.
 */

export const SUBSTEPS = 8;
export const BALL_RESTITUTION = 0.96;
export const CUSHION_RESTITUTION = 0.86;
export const JAW_RESTITUTION = 0.78;
export const JAW_RADIUS_PX = 3.5;
export const STOP_SPEED_PX_PER_FRAME = 0.08;
export const MAX_SHOT_SPEED_PX_PER_FRAME = 26.5;
export const POWER_CURVE_EXPONENT = 1.35;
export const SLIDE_FRICTION_ACCEL = 0.24;
export const ROLL_FRICTION_RATIO = 0.085;
export const COLLISION_THROW_RATIO = 0.035;
export const CUE_SQUIRT_MAX_RAD = (1.15 * Math.PI) / 180;
export const ENGLISH_CUSHION_SPIN_DECAY = 0.58;
export const INITIAL_RACK_GAP_PX = 0.5;

export interface RigidBallMotion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Vận tốc lăn tương đương của bề mặt cầu tiếp xúc mặt nỉ (lăn thuần túy khi sx == vx, sy == vy). */
  sx: number;
  sy: number;
  /** Độ xoáy ngang Ép phê omega_z trong [-1, 1]. */
  omegaZ: number;
}

/**
 * Đường cong lực phi tuyến v0 = v_max * p^1.35 giúp điều bi nhẹ chuẩn xác mà phá bi 100% vẫn bung mạnh.
 */
export function computeShotLaunchSpeed(
  powerNorm: number,
  maxSpeed = MAX_SHOT_SPEED_PX_PER_FRAME,
): number {
  const clamped = Math.max(0.08, Math.min(1, powerNorm));
  return maxSpeed * Math.pow(clamped, POWER_CURVE_EXPONENT);
}

/**
 * Khởi tạo vận tốc tâm, bề mặt lăn s (Cù lê / Trô / Stun), ép phê omegaZ và độ lệch đầu cơ nhẹ (squirt <= 1.2°)
 * ngay tại khoảnh khắc đầu cơ chạm bi cái.
 */
export function initializeCueBallShot(
  cueBall: RigidBallMotion,
  aimAngleRad: number,
  powerNorm: number,
  spinX: number,
  spinY: number,
): { readonly dirX: number; readonly dirY: number; readonly speed: number } {
  const clampedPower = Math.max(0.08, Math.min(1, powerNorm));
  const clampedSpinX = Math.max(-1, Math.min(1, spinX));
  const clampedSpinY = Math.max(-1, Math.min(1, spinY));

  const speed = computeShotLaunchSpeed(clampedPower);
  const squirtOffset = clampedSpinX * Math.pow(clampedPower, 1.2) * CUE_SQUIRT_MAX_RAD;
  const launchAngle = aimAngleRad + squirtOffset;
  const dirX = Math.cos(launchAngle);
  const dirY = Math.sin(launchAngle);

  cueBall.vx = dirX * speed;
  cueBall.vy = dirY * speed;

  // Ánh xạ điểm chạm dọc spinY -> vận tốc bề mặt s:
  // - spinY = 0 (Stun): s = (0, 0)
  // - spinY > 0 (Cù lê): s = (1 + 1.45 * spinY) * v0
  // - spinY < 0 (Trô): s = (2.15 * spinY) * v0
  if (Math.abs(clampedSpinY) < 0.015) {
    cueBall.sx = 0;
    cueBall.sy = 0;
  } else if (clampedSpinY > 0) {
    const followScale = 1 + 1.45 * clampedSpinY;
    cueBall.sx = cueBall.vx * followScale;
    cueBall.sy = cueBall.vy * followScale;
  } else {
    const drawScale = 2.15 * clampedSpinY;
    cueBall.sx = cueBall.vx * drawScale;
    cueBall.sy = cueBall.vy * drawScale;
  }

  cueBall.omegaZ = clampedSpinX * (0.35 + clampedPower * 0.65);

  return { dirX, dirY, speed };
}

/**
 * Tích phân 1 substep chuyển pha Ma sát Trượt -> Lăn Thuần Túy trên mặt vải nỉ.
 * - Khi |v_slip| > eps: ma sát trượt mu_s kéo v về phía s và mô-men mặt cầu (I = 2/5 mR^2) kéo s về v nhanh gấp 2.5x.
 * - Khi v == s: chỉ chịu ma sát lăn cực êm mu_r = 0.085 * mu_s.
 */
export function integrateClothSlideToRollSubstep(
  ball: RigidBallMotion,
  subDtScale: number,
): { readonly rollDx: number; readonly rollDy: number } {
  const prevX = ball.x;
  const prevY = ball.y;

  ball.x += ball.vx * subDtScale;
  ball.y += ball.vy * subDtScale;

  const slipX = ball.vx - ball.sx;
  const slipY = ball.vy - ball.sy;
  const slipMag = Math.hypot(slipX, slipY);

  let remainingRollDt = subDtScale;

  if (slipMag > 0.04) {
    const ux = slipX / slipMag;
    const uy = slipY / slipMag;
    const maxDv = SLIDE_FRICTION_ACCEL * subDtScale;
    const maxGapClose = 3.5 * maxDv;

    if (slipMag <= maxGapClose) {
      // Bắt kịp pha lăn thuần túy ngay bên trong substep này
      const dv = slipMag / 3.5;
      ball.vx -= ux * dv;
      ball.vy -= uy * dv;
      ball.sx = ball.vx;
      ball.sy = ball.vy;
      remainingRollDt = Math.max(0, subDtScale - slipMag / (3.5 * SLIDE_FRICTION_ACCEL));
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
    const rollDecel = SLIDE_FRICTION_ACCEL * ROLL_FRICTION_RATIO;
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > 0) {
      const drop = Math.min(speed, rollDecel * remainingRollDt);
      const scale = ((speed - drop) / speed) * Math.pow(0.9965, remainingRollDt);
      ball.vx *= scale;
      ball.vy *= scale;
      ball.sx = ball.vx;
      ball.sy = ball.vy;
    }
  }

  // Giảm nhẹ độ xoáy ngang theo thời gian tiếp xúc vải nỉ
  ball.omegaZ *= Math.pow(0.994, subDtScale);
  if (Math.abs(ball.omegaZ) < 0.005) {
    ball.omegaZ = 0;
  }

  // Ngưỡng dừng hoàn toàn khi cả tâm bi và độ quay bề mặt đều suy giảm hết
  const centerSpeed = Math.hypot(ball.vx, ball.vy);
  const surfaceSpeed = Math.hypot(ball.sx, ball.sy);
  if (centerSpeed < STOP_SPEED_PX_PER_FRAME && surfaceSpeed < STOP_SPEED_PX_PER_FRAME * 1.4) {
    ball.vx = 0;
    ball.vy = 0;
    ball.sx = 0;
    ball.sy = 0;
    ball.omegaZ = 0;
  }

  // Độ quay 3D thực của quả cầu được dẫn dắt bởi vận tốc bề mặt s (hiển thị Trô quay ngược thật!)
  const rollDx =
    (ball.sx * 0.72 + ((ball.x - prevX) / Math.max(1e-4, subDtScale)) * 0.28) * subDtScale;
  const rollDy =
    (ball.sy * 0.72 + ((ball.y - prevY) / Math.max(1e-4, subDtScale)) * 0.28) * subDtScale;
  return { rollDx, rollDy };
}

/**
 * Phản hồi thành băng chuẩn 0.86 kèm hiệu ứng Ép phê (omegaZ):
 * - Phản xạ thành phần vận tốc vuông góc băng với hệ số đàn hồi CUSHION_RESTITUTION = 0.86.
 * - Cộng xung tiếp tuyến dọc băng tỷ lệ với omegaZ (mạnh hơn khi đánh trực diện băng).
 * - Suy hao omegaZ * 0.58 sau mỗi lần bật băng.
 */
export function applyCushionEnglishBounce(
  ball: RigidBallMotion,
  inwardNormalX: number,
  inwardNormalY: number,
  normalImpactSpeed: number,
): void {
  const vn = ball.vx * inwardNormalX + ball.vy * inwardNormalY;
  if (vn < 0) {
    ball.vx -= (1 + CUSHION_RESTITUTION) * vn * inwardNormalX;
    ball.vy -= (1 + CUSHION_RESTITUTION) * vn * inwardNormalY;
  }
  const sn = ball.sx * inwardNormalX + ball.sy * inwardNormalY;
  if (sn < 0) {
    ball.sx -= (1 + CUSHION_RESTITUTION) * sn * inwardNormalX;
    ball.sy -= (1 + CUSHION_RESTITUTION) * sn * inwardNormalY;
  }

  if (Math.abs(ball.omegaZ) <= 0.015) return;
  const tanX = inwardNormalY;
  const tanY = -inwardNormalX;
  const spinTransfer = ball.omegaZ * (0.28 * normalImpactSpeed + 0.14);

  ball.vx += tanX * spinTransfer;
  ball.vy += tanY * spinTransfer;
  ball.sx += tanX * spinTransfer * 0.65;
  ball.sy += tanY * spinTransfer * 0.65;
  ball.omegaZ *= ENGLISH_CUSHION_SPIN_DECAY;
}

/**
 * Giải quyết va chạm đàn hồi Bi–Bi kèm Ma sát Bi–Bi (Collision-Induced Throw: ~3.5% thành phần tiếp tuyến).
 * Bảo toàn vận tốc bề mặt lăn s qua va chạm giúp Cù lê / Trô tự chuyển pha mượt mà ở các substep kế tiếp.
 */
export function resolveRigidBallPairCollision(
  a: RigidBallMotion,
  b: RigidBallMotion,
  nx: number,
  ny: number,
): number {
  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal >= 0) return 0;

  const impulse = -(1 + BALL_RESTITUTION) * velAlongNormal * 0.5;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;

  // Collision-Induced Throw (~3.5% thành phần tiếp tuyến khi cắt góc)
  const tx = -ny;
  const ty = nx;
  const tanRelVel = (a.vx - b.vx) * tx + (a.vy - b.vy) * ty;
  const throwTransfer = tanRelVel * COLLISION_THROW_RATIO;
  b.vx += tx * throwTransfer;
  b.vy += ty * throwTransfer;
  a.vx -= tx * throwTransfer * 0.6;
  a.vy -= ty * throwTransfer * 0.6;

  // Va chạm nhẹ làm tiêu hao một phần nhỏ độ xoáy bề mặt của cả 2 bi
  a.omegaZ *= 0.86;
  b.omegaZ *= 0.86;

  return Math.abs(velAlongNormal);
}
