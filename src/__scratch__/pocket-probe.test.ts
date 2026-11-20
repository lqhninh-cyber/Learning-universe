import { describe, it } from 'vitest';
import { createBilliardsWorld, stepBilliardsPhysicsFrame } from '@/components/home/billiardsEngine';
import { computeShotLaunchSpeed, initializeCueBallShot } from '@/utils/billiardPhysics';

// Scratch probe (tạm thời) — đo góc nhận bi của lỗ góc/lỗ giữa và quãng lăn theo lực đánh.
function makeIsolatedWorld() {
  const w = createBilliardsWorld(1200, 625, 'free');
  w.isBreakShot = false;
  for (const b of w.balls) {
    if (b.id !== 0 && b.id !== 1) b.pocketed = true;
  }
  const cue = w.balls[0]!;
  cue.x = w.metrics.feltLeft + w.metrics.feltWidth * 0.5;
  cue.y = w.metrics.centerY;
  return w;
}

function runUntilStop(w: ReturnType<typeof makeIsolatedWorld>, maxFrames = 3000) {
  for (let f = 0; f < maxFrames; f += 1) {
    stepBilliardsPhysicsFrame(w, 1 / 120, 0.5, () => undefined);
    const moving = w.balls.some((b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > 0.01));
    if (!moving) return f;
  }
  return maxFrames;
}

describe('scratch probe', () => {
  it('pocket acceptance + roll distance', () => {
    const lines: string[] = [];
    const base = makeIsolatedWorld();
    const m = base.metrics;
    const R = m.ballRadius;
    lines.push(`feltWidth=${m.feltWidth.toFixed(1)} R=${R.toFixed(2)} pocketR=${m.pocketRadius.toFixed(2)} jawR=${m.pocketJaws[0]!.r}`);

    // Lỗ góc trên-trái (id 0): bi số 1 lăn thẳng vào tâm lỗ từ khoảng cách 7R theo góc theta so với băng dài
    const cornerRes: string[] = [];
    for (let deg = 0; deg <= 90; deg += 5) {
      const w = makeIsolatedWorld();
      const p = w.metrics.pockets[0]!;
      const ball = w.balls.find((b) => b.id === 1)!;
      const th = (deg * Math.PI) / 180;
      // điểm xuất phát: dịch theo hướng vào bàn, kẹp trong mặt nỉ
      let sx = p.x + Math.cos(th) * 7 * R;
      let sy = p.y + Math.sin(th) * 7 * R;
      sx = Math.max(w.metrics.feltLeft + R + 0.5, sx);
      sy = Math.max(w.metrics.feltTop + R + 0.5, sy);
      ball.x = sx;
      ball.y = sy;
      const ang = Math.atan2(p.y - sy, p.x - sx);
      ball.vx = Math.cos(ang) * 3;
      ball.vy = Math.sin(ang) * 3;
      ball.sx = ball.vx;
      ball.sy = ball.vy;
      runUntilStop(w);
      cornerRes.push(`${deg}°:${ball.pocketed || ball.sinking ? 'IN' : 'out'}`);
    }
    lines.push(`CORNER (aim at pocket centre, speed 3px/f): ${cornerRes.join(' ')}`);

    // Bi lăn sát băng (frozen to rail) vào lỗ góc
    {
      const w = makeIsolatedWorld();
      const ball = w.balls.find((b) => b.id === 1)!;
      ball.x = w.metrics.feltLeft + 10 * R;
      ball.y = w.metrics.feltTop + R + 0.01;
      ball.vx = -3;
      ball.vy = 0;
      ball.sx = -3;
      ball.sy = 0;
      runUntilStop(w);
      lines.push(`RAIL-HUGGING into corner: ${ball.pocketed || ball.sinking ? 'IN' : 'out'} (final x=${ball.x.toFixed(1)}, y=${ball.y.toFixed(1)})`);
    }

    // Lỗ giữa trên (id 1): góc so với băng
    const sideRes: string[] = [];
    for (let deg = 20; deg <= 160; deg += 10) {
      const w = makeIsolatedWorld();
      const p = w.metrics.pockets[1]!;
      const ball = w.balls.find((b) => b.id === 1)!;
      const th = (deg * Math.PI) / 180;
      ball.x = p.x + Math.cos(th) * 7 * R;
      ball.y = Math.max(w.metrics.feltTop + R + 0.5, p.y + Math.sin(th) * 7 * R);
      const ang = Math.atan2(p.y - ball.y, p.x - ball.x);
      ball.vx = Math.cos(ang) * 3;
      ball.vy = Math.sin(ang) * 3;
      ball.sx = ball.vx;
      ball.sy = ball.vy;
      runUntilStop(w);
      sideRes.push(`${deg}°:${ball.pocketed || ball.sinking ? 'IN' : 'out'}`);
    }
    lines.push(`SIDE (angle vs rail): ${sideRes.join(' ')}`);

    // Quãng đường lăn (theo số chiều dài bàn) của bi cái đánh tâm không xoáy theo % lực, không chạm băng (bàn ảo dài)
    const rollRes: string[] = [];
    for (const p of [0.1, 0.25, 0.5, 0.75, 1]) {
      const w = makeIsolatedWorld();
      const cue = w.balls[0]!;
      cue.x = 0;
      cue.y = 0;
      // dời bàn ảo: tắt băng bằng cách đặt bi xa lỗ, đo tích phân trực tiếp
      initializeCueBallShot(cue, 0, p, 0, 0);
      const v0 = Math.hypot(cue.vx, cue.vy);
      let dist = 0;
      let frames = 0;
      // dùng đúng hàm tích phân của engine qua world rất rộng: mô phỏng tay
      const startX = cue.x;
      for (; frames < 20000; frames += 1) {
        for (let s = 0; s < 8; s += 1) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          integrate(cue);
        }
        if (Math.hypot(cue.vx, cue.vy) < 0.01) break;
      }
      dist = cue.x - startX;
      rollRes.push(`p=${p}: v0=${v0.toFixed(2)}px/f(60Hz) → ${(dist / m.feltWidth).toFixed(2)} TL in ${(frames / 120).toFixed(2)}s`);
    }
    lines.push(`ROLL (stun, no cushions): ${rollRes.join(' | ')}`);
    lines.push(`maxLaunch=${computeShotLaunchSpeed(1).toFixed(2)} px/frame@60Hz`);

    console.log('\n' + lines.join('\n'));
  });
});

import { integrateClothSlideToRollSubstep } from '@/utils/billiardPhysics';
function integrate(ball: { x: number; y: number; vx: number; vy: number; sx: number; sy: number; omegaZ: number }) {
  integrateClothSlideToRollSubstep(ball, 0.5 / 8);
}
