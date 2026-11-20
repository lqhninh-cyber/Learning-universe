import { describe, expect, it } from 'vitest';
import {
  computeLongStringSpotPosition,
  evaluateWpaShot,
  STALEMATE_TURN_THRESHOLD,
  type ShotTelemetry,
} from '@/utils/billiardRules';

function makeTelemetry(overrides: Partial<ShotTelemetry> = {}): ShotTelemetry {
  return {
    gameMode: 'vs-ai',
    ruleSet: 'club',
    shooter: 1,
    shotNumber: 2,
    isBreakShot: false,
    scratched: false,
    firstHitBallId: 1,
    firstHitBallGroup: 'solids',
    firstHitWasInKitchen: false,
    allLegalTargetsInKitchen: false,
    mustShootOutOfKitchen: false,
    cueCrossedHeadStringBeforeFirstHit: true,
    pocketedBalls: [],
    railHitAfterFirstContact: true,
    breakRailHitCount: 0,
    calledPocketId: null,
    isSafetyCall: false,
    shooterGroupBefore: null,
    opponentGroupBefore: null,
    shooterGroupClearedBeforeTurn: false,
    consecutiveNonPottingTurns: 0,
    ...overrides,
  };
}

describe('Bộ máy luật trọng tài WPA 8-Ball (billiardRules)', () => {
  it('Khai cuộc hợp lệ ăn bi mục tiêu: giữ lượt và bàn vẫn ở trạng thái Mở (Open Table)', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        shotNumber: 1,
        isBreakShot: true,
        pocketedBalls: [{ id: 2, group: 'solids', pocketId: 2 }],
        breakRailHitCount: 3,
      }),
    );

    expect(res.isFoul).toBe(false);
    expect(res.pendingDecision).toBeNull();
    expect(res.nextPlayer).toBe(1);
    expect(res.continuesTurn).toBe(true);
    expect(res.assignedP1Group).toBeNull();
    expect(res.assignedP2Group).toBeNull();
  });

  it('Khai cuộc hợp lệ >= 4 bi chạm băng (không ăn bi): không phạm lỗi, chuyển lượt bình thường', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        shotNumber: 1,
        isBreakShot: true,
        pocketedBalls: [],
        breakRailHitCount: 4,
      }),
    );

    expect(res.isFoul).toBe(false);
    expect(res.pendingDecision).toBeNull();
    expect(res.nextPlayer).toBe(2);
    expect(res.continuesTurn).toBe(false);
    expect(res.ballInHand).toBe(false);
  });

  it('Phá bi không hợp lệ (không ăn bi & < 4 bi chạm băng): kích hoạt quyết định 3 phương án, không trao Ball-in-Hand ngay', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        shotNumber: 1,
        isBreakShot: true,
        shooter: 1,
        pocketedBalls: [],
        breakRailHitCount: 2,
      }),
    );

    expect(res.pendingDecision).toEqual({
      type: 'illegal-break',
      decidingPlayer: 2,
      breaker: 1,
    });
    expect(res.ballInHand).toBe(false);
  });

  it('Rơi bi cái lúc khai cuộc (Scratch on Break): trao Ball-in-Hand Trong Bếp và bật mustShootOutOfKitchen', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        shotNumber: 1,
        isBreakShot: true,
        scratched: true,
        pocketedBalls: [{ id: 3, group: 'solids', pocketId: 2 }],
        breakRailHitCount: 5,
      }),
    );

    expect(res.isFoul).toBe(true);
    expect(res.nextPlayer).toBe(2);
    expect(res.ballInHand).toBe(true);
    expect(res.ballInHandScope).toBe('kitchen');
    expect(res.mustShootOutOfKitchen).toBe(true);
  });

  it('Rơi Bi số 8 lúc khai cuộc hợp lệ: không xử thua, đánh dấu đặt lại Bi 8 và chờ quyết định người phá', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        shotNumber: 1,
        isBreakShot: true,
        shooter: 1,
        scratched: false,
        pocketedBalls: [{ id: 8, group: 'eight', pocketId: 1 }],
        breakRailHitCount: 4,
      }),
    );

    expect(res.winner).toBeNull();
    expect(res.spotEightBall).toBe(true);
    expect(res.pendingDecision).toEqual({
      type: 'eight-on-break',
      decidingPlayer: 1,
      breaker: 1,
      scratched: false,
    });
  });

  it('Rơi Bi số 8 kèm rơi bi cái lúc khai cuộc: đặt lại Bi 8, đối thủ chọn tiếp tục Trong Bếp hoặc xếp lại bàn', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        shotNumber: 1,
        isBreakShot: true,
        shooter: 1,
        scratched: true,
        pocketedBalls: [{ id: 8, group: 'eight', pocketId: 1 }],
        breakRailHitCount: 5,
      }),
    );

    expect(res.winner).toBeNull();
    expect(res.spotEightBall).toBe(true);
    expect(res.ballInHand).toBe(true);
    expect(res.ballInHandScope).toBe('kitchen');
    expect(res.mustShootOutOfKitchen).toBe(true);
    expect(res.pendingDecision).toEqual({
      type: 'eight-on-break',
      decidingPlayer: 2,
      breaker: 1,
      scratched: true,
    });
  });

  it('Luật Trong Bếp (Kitchen): đánh thẳng vào bi Trong Bếp khi ngoài vạch còn bi là phạm lỗi, nhưng vượt vạch trước hoặc mọi bi đều Trong Bếp thì hợp lệ', () => {
    const foulShot = evaluateWpaShot(
      makeTelemetry({
        mustShootOutOfKitchen: true,
        firstHitWasInKitchen: true,
        allLegalTargetsInKitchen: false,
        cueCrossedHeadStringBeforeFirstHit: false,
      }),
    );
    expect(foulShot.isFoul).toBe(true);
    expect(foulShot.ballInHand).toBe(true);
    expect(foulShot.ballInHandScope).toBe('full');

    const reboundOutAndBack = evaluateWpaShot(
      makeTelemetry({
        mustShootOutOfKitchen: true,
        firstHitWasInKitchen: true,
        allLegalTargetsInKitchen: false,
        cueCrossedHeadStringBeforeFirstHit: true,
      }),
    );
    expect(reboundOutAndBack.isFoul).toBe(false);

    const kitchenOnlyException = evaluateWpaShot(
      makeTelemetry({
        mustShootOutOfKitchen: true,
        firstHitWasInKitchen: true,
        allLegalTargetsInKitchen: true,
        cueCrossedHeadStringBeforeFirstHit: false,
      }),
    );
    expect(kitchenOnlyException.isFoul).toBe(false);
  });

  it('Bàn Mở (Open Table): chạm Bi 8 trước phạm lỗi; đánh hợp lệ nhóm này ăn bi nhóm kia chốt đúng nhóm vào lỗ', () => {
    const hitEightOnOpen = evaluateWpaShot(
      makeTelemetry({
        firstHitBallId: 8,
        firstHitBallGroup: 'eight',
        shooterGroupBefore: null,
      }),
    );
    expect(hitEightOnOpen.isFoul).toBe(true);
    expect(hitEightOnOpen.ballInHand).toBe(true);

    const crossOpenShot = evaluateWpaShot(
      makeTelemetry({
        ruleSet: 'club',
        firstHitBallId: 2,
        firstHitBallGroup: 'solids',
        pocketedBalls: [{ id: 11, group: 'stripes', pocketId: 2 }],
        shooterGroupBefore: null,
      }),
    );
    expect(crossOpenShot.isFoul).toBe(false);
    expect(crossOpenShot.assignedP1Group).toBe('stripes');
    expect(crossOpenShot.assignedP2Group).toBe('solids');
  });

  it('Chế độ WPA Pro Call-Shot: đưa bi rơi nhầm lỗ chỉ định không phạm lỗi nhưng mất lượt và không chốt nhóm', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        ruleSet: 'wpa-pro',
        calledPocketId: 1,
        pocketedBalls: [{ id: 4, group: 'solids', pocketId: 2 }],
        shooterGroupBefore: null,
      }),
    );

    expect(res.isFoul).toBe(false);
    expect(res.missedCalledPocket).toBe(true);
    expect(res.continuesTurn).toBe(false);
    expect(res.nextPlayer).toBe(2);
    expect(res.ballInHand).toBe(false);
    expect(res.assignedP1Group).toBeNull();
  });

  it('Cú Chạy đạn (Safety WPA 3.6): chạm bi và băng hợp lệ dù rơi bi cũng chuyển lượt an toàn, không tính thắng tiếp tục', () => {
    const res = evaluateWpaShot(
      makeTelemetry({
        ruleSet: 'wpa-pro',
        isSafetyCall: true,
        shooterGroupBefore: 'solids',
        opponentGroupBefore: 'stripes',
        pocketedBalls: [{ id: 3, group: 'solids', pocketId: 2 }],
      }),
    );

    expect(res.isFoul).toBe(false);
    expect(res.continuesTurn).toBe(false);
    expect(res.nextPlayer).toBe(2);
    expect(res.ballInHand).toBe(false);
  });

  it('Luật Bi số 8: đánh rơi Bi 8 khi chưa dọn hết nhóm hoặc sai lỗ chỉ định xử thua; dọn hết và đúng lỗ xử thắng', () => {
    const earlyEightLoss = evaluateWpaShot(
      makeTelemetry({
        shooter: 1,
        shooterGroupBefore: 'solids',
        opponentGroupBefore: 'stripes',
        shooterGroupClearedBeforeTurn: false,
        firstHitBallId: 8,
        firstHitBallGroup: 'eight',
        calledPocketId: 0,
        pocketedBalls: [{ id: 8, group: 'eight', pocketId: 0 }],
      }),
    );
    expect(earlyEightLoss.winner).toBe(2);

    const wrongPocketLoss = evaluateWpaShot(
      makeTelemetry({
        shooter: 1,
        shooterGroupBefore: 'solids',
        opponentGroupBefore: 'stripes',
        shooterGroupClearedBeforeTurn: true,
        firstHitBallId: 8,
        firstHitBallGroup: 'eight',
        calledPocketId: 0,
        pocketedBalls: [{ id: 8, group: 'eight', pocketId: 5 }],
      }),
    );
    expect(wrongPocketLoss.winner).toBe(2);

    const cleanEightWin = evaluateWpaShot(
      makeTelemetry({
        shooter: 1,
        shooterGroupBefore: 'solids',
        opponentGroupBefore: 'stripes',
        shooterGroupClearedBeforeTurn: true,
        firstHitBallId: 8,
        firstHitBallGroup: 'eight',
        calledPocketId: 5,
        pocketedBalls: [{ id: 8, group: 'eight', pocketId: 5 }],
      }),
    );
    expect(cleanEightWin.winner).toBe(1);
  });

  it('Đặt lại bi trên trục dọc (Long-String Spotting WPA 1.4): tự dịch về băng cuối đủ khoảng cách >= 2*R + 1px', () => {
    const r = 13;
    const footSpotX = 680;
    const centerY = 260;

    const clearPos = computeLongStringSpotPosition(8, r, 60, 940, centerY, footSpotX, [
      { id: 0, x: 200, y: 260 },
      { id: 8, x: 900, y: 50 },
    ]);
    expect(clearPos).toEqual({ x: footSpotX, y: centerY });

    const occupiedPos = computeLongStringSpotPosition(8, r, 60, 940, centerY, footSpotX, [
      { id: 0, x: 200, y: 260 },
      { id: 5, x: footSpotX, y: centerY },
      { id: 8, x: 900, y: 50 },
    ]);
    expect(occupiedPos.y).toBe(centerY);
    expect(occupiedPos.x).toBeGreaterThanOrEqual(footSpotX + r * 2 + 1);
  });

  it('Thế trận bế tắc (Stalemate WPA 1.12): đếm đủ 6 lượt liên tiếp không ăn bi thì mở stalemateReached', () => {
    const stalemate = evaluateWpaShot(
      makeTelemetry({
        shooterGroupBefore: 'solids',
        opponentGroupBefore: 'stripes',
        pocketedBalls: [],
        consecutiveNonPottingTurns: STALEMATE_TURN_THRESHOLD - 1,
      }),
    );
    expect(stalemate.nextConsecutiveNonPottingTurns).toBe(STALEMATE_TURN_THRESHOLD);
    expect(stalemate.stalemateReached).toBe(true);

    const resetOnPot = evaluateWpaShot(
      makeTelemetry({
        shooterGroupBefore: 'solids',
        opponentGroupBefore: 'stripes',
        pocketedBalls: [{ id: 2, group: 'solids', pocketId: 0 }],
        consecutiveNonPottingTurns: STALEMATE_TURN_THRESHOLD - 1,
      }),
    );
    expect(resetOnPot.nextConsecutiveNonPottingTurns).toBe(0);
    expect(resetOnPot.stalemateReached).toBe(false);
  });
});
