/**
 * BỘ MÁY LUẬT TRỌNG TÀI WPA 8-BALL THUẦN TÚY (PURE REFEREE RULES ENGINE)
 * Phủ đủ chuẩn World Pool-Billiard Association (WPA) cho cả 2 chuẩn thi đấu:
 * - `club`: Chỉ bắt buộc chỉ định lỗ cho Bi số 8.
 * - `wpa-pro`: Bắt buộc chỉ định lỗ cho mọi cú đánh ăn bi + hỗ trợ Chạy đạn (Safety).
 */

export type WpaRuleSet = 'club' | 'wpa-pro';
export type WpaBallGroup = 'solids' | 'stripes';
export type WpaBallInHandScope = 'full' | 'kitchen';
export type IllegalBreakChoice = 'accept-table' | 'rebreak-self' | 'rebreak-opponent';
export type EightOnBreakChoice = 'spot-and-continue' | 'rerack';

export const STALEMATE_TURN_THRESHOLD = 6;

export interface PocketedBallRecord {
  readonly id: number;
  readonly group: WpaBallGroup | 'eight';
  readonly pocketId: number;
}

export interface PendingIllegalBreakDecision {
  readonly type: 'illegal-break';
  readonly decidingPlayer: 1 | 2;
  readonly breaker: 1 | 2;
}

export interface PendingEightOnBreakDecision {
  readonly type: 'eight-on-break';
  readonly decidingPlayer: 1 | 2;
  readonly breaker: 1 | 2;
  readonly scratched: boolean;
}

export type PendingRefereeDecision =
  | PendingIllegalBreakDecision
  | PendingEightOnBreakDecision;

export interface RefereeLogEntry {
  readonly seq: number;
  readonly shotNumber: number;
  readonly player: 1 | 2;
  readonly actionLabel: string;
  readonly verdict: 'valid' | 'foul' | 'win' | 'loss' | 'decision';
  readonly detail: string;
}

export interface ShotTelemetry {
  readonly gameMode: 'vs-ai' | 'two-player' | 'free';
  readonly ruleSet: WpaRuleSet;
  readonly shooter: 1 | 2;
  readonly shotNumber: number;
  readonly isBreakShot: boolean;
  readonly scratched: boolean;
  readonly firstHitBallId: number | null;
  readonly firstHitBallGroup: WpaBallGroup | 'eight' | null;
  readonly firstHitWasInKitchen: boolean;
  readonly allLegalTargetsInKitchen: boolean;
  readonly mustShootOutOfKitchen: boolean;
  readonly cueCrossedHeadStringBeforeFirstHit: boolean;
  readonly pocketedBalls: readonly PocketedBallRecord[];
  readonly railHitAfterFirstContact: boolean;
  readonly breakRailHitCount: number;
  readonly calledPocketId: number | null;
  readonly isSafetyCall: boolean;
  readonly shooterGroupBefore: WpaBallGroup | null;
  readonly opponentGroupBefore: WpaBallGroup | null;
  readonly shooterGroupClearedBeforeTurn: boolean;
  readonly consecutiveNonPottingTurns: number;
}

export interface TurnEvaluationResult {
  readonly nextPlayer: 1 | 2;
  readonly continuesTurn: boolean;
  readonly isFoul: boolean;
  readonly foulReason: string | null;
  readonly toastText: string | null;
  readonly toastTone: 'info' | 'foul' | 'reward';
  readonly ballInHand: boolean;
  readonly ballInHandScope: WpaBallInHandScope;
  readonly mustShootOutOfKitchen: boolean;
  readonly assignedP1Group: WpaBallGroup | null;
  readonly assignedP2Group: WpaBallGroup | null;
  readonly newlyAssignedGroup: WpaBallGroup | null;
  readonly spotEightBall: boolean;
  readonly pendingDecision: PendingRefereeDecision | null;
  readonly winner: 1 | 2 | null;
  readonly winReason: string | null;
  readonly missedCalledPocket: boolean;
  readonly nextConsecutiveNonPottingTurns: number;
  readonly stalemateReached: boolean;
  readonly logEntry: Omit<RefereeLogEntry, 'seq'>;
}

export interface SpottableBallCoord {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly pocketed?: boolean;
  readonly sinking?: boolean;
}

/**
 * WPA Rule 1.4 — Đặt lại bi trên trục dọc (Long-String Spotting):
 * Đặt tại Foot Spot (y = centerY). Nếu bị bi khác chiếm chỗ, tịnh tiến từng bước 2px về phía băng cuối bàn
 * (feltRight) tới vị trí gần nhất thỏa khoảng cách >= 2 * R_ball + 1px; nếu chạm băng cuối thì lùi về tâm bàn.
 */
export function computeLongStringSpotPosition(
  targetBallId: number,
  ballRadius: number,
  feltLeft: number,
  feltRight: number,
  centerY: number,
  footSpotX: number,
  balls: readonly SpottableBallCoord[],
): { readonly x: number; readonly y: number } {
  const minClear = ballRadius * 2 + 1;
  const maxX = feltRight - ballRadius - 2;
  const minX = feltLeft + ballRadius + 2;

  const isClearAt = (cx: number, cy: number): boolean =>
    balls.every((other) => {
      if (other.id === targetBallId || other.pocketed || other.sinking) return true;
      return Math.hypot(other.x - cx, other.y - cy) >= minClear;
    });

  const startX = Math.max(minX, Math.min(maxX, footSpotX));
  if (isClearAt(startX, centerY)) {
    return { x: startX, y: centerY };
  }

  for (let x = startX + 2; x <= maxX; x += 2) {
    if (isClearAt(x, centerY)) {
      return { x, y: centerY };
    }
  }

  for (let x = startX - 2; x >= minX; x -= 2) {
    if (isClearAt(x, centerY)) {
      return { x, y: centerY };
    }
  }

  return { x: startX, y: centerY };
}

function getOpponent(player: 1 | 2): 1 | 2 {
  return player === 1 ? 2 : 1;
}

function resolveGroupOnOpenTable(
  validPocketed: readonly PocketedBallRecord[],
  firstHitGroup: WpaBallGroup | 'eight' | null,
): WpaBallGroup | null {
  const nonEight = validPocketed.filter(
    (b): b is PocketedBallRecord & { readonly group: WpaBallGroup } => b.group !== 'eight',
  );
  if (nonEight.length === 0) return null;

  const solidsCount = nonEight.filter((b) => b.group === 'solids').length;
  const stripesCount = nonEight.filter((b) => b.group === 'stripes').length;

  if (solidsCount > stripesCount) return 'solids';
  if (stripesCount > solidsCount) return 'stripes';

  // Hòa nhau (1 Trơn + 1 Sọc): ưu tiên nhóm của bi chạm đầu tiên hoặc bi rơi đầu tiên
  if (firstHitGroup === 'solids' || firstHitGroup === 'stripes') {
    return firstHitGroup;
  }
  return nonEight[0]!.group;
}

/**
 * Đánh giá toàn diện một lượt đánh theo chuẩn luật WPA 8-Ball.
 */
export function evaluateWpaShot(telemetry: ShotTelemetry): TurnEvaluationResult {
  const {
    gameMode,
    ruleSet,
    shooter,
    shotNumber,
    isBreakShot,
    scratched,
    firstHitBallId,
    firstHitBallGroup,
    firstHitWasInKitchen,
    allLegalTargetsInKitchen,
    mustShootOutOfKitchen,
    cueCrossedHeadStringBeforeFirstHit,
    pocketedBalls,
    railHitAfterFirstContact,
    breakRailHitCount,
    calledPocketId,
    isSafetyCall,
    shooterGroupBefore,
    opponentGroupBefore,
    shooterGroupClearedBeforeTurn,
    consecutiveNonPottingTurns,
  } = telemetry;

  const opponent = getOpponent(shooter);
  const currentP1Group = shooter === 1 ? shooterGroupBefore : opponentGroupBefore;
  const currentP2Group = shooter === 2 ? shooterGroupBefore : opponentGroupBefore;

  const pocketedEight = pocketedBalls.find((b) => b.id === 8);
  const pocketedNonEight = pocketedBalls.filter((b) => b.id !== 8);

  if (gameMode === 'free') {
    if (scratched) {
      return {
        nextPlayer: 1,
        continuesTurn: true,
        isFoul: true,
        foulReason: 'Bi cái rơi lỗ — Bấm chọn vị trí đặt lại',
        toastText: 'BI CÁI RƠI LỖ · ĐẶT BI TỰ DO',
        toastTone: 'foul',
        ballInHand: true,
        ballInHandScope: 'full',
        mustShootOutOfKitchen: false,
        assignedP1Group: null,
        assignedP2Group: null,
        newlyAssignedGroup: null,
        spotEightBall: false,
        pendingDecision: null,
        winner: null,
        winReason: null,
        missedCalledPocket: false,
        nextConsecutiveNonPottingTurns: 0,
        stalemateReached: false,
        logEntry: {
          shotNumber,
          player: 1,
          actionLabel: 'Tập tự do',
          verdict: 'foul',
          detail: 'Bi cái rơi lỗ, đặt lại tự do',
        },
      };
    }

    return {
      nextPlayer: 1,
      continuesTurn: true,
      isFoul: false,
      foulReason: null,
      toastText: null,
      toastTone: 'info',
      ballInHand: false,
      ballInHandScope: 'full',
      mustShootOutOfKitchen: false,
      assignedP1Group: null,
      assignedP2Group: null,
      newlyAssignedGroup: null,
      spotEightBall: false,
      pendingDecision: null,
      winner: null,
      winReason: null,
      missedCalledPocket: false,
      nextConsecutiveNonPottingTurns: 0,
      stalemateReached: false,
      logEntry: {
        shotNumber,
        player: 1,
        actionLabel: pocketedBalls.length > 0 ? `Ăn ${pocketedBalls.length} bi` : 'Đánh bi',
        verdict: 'valid',
        detail:
          pocketedBalls.length > 0
            ? `Đưa bi ${pocketedBalls.map((b) => `#${b.id}`).join(', ')} vào lỗ`
            : 'Cơ tập hợp lệ',
      },
    };
  }

  // =========================================================================
  // 1. LUẬT KHAI CUỘC CHÍNH THỨC WPA 3.3 (BREAK SHOT)
  // =========================================================================
  if (isBreakShot) {
    const legalBreak = pocketedNonEight.length > 0 || breakRailHitCount >= 4;

    // Rơi Bi số 8 ngay cú khai cuộc: KHÔNG thua — kích hoạt hộp quyền quyết định cho phép đặt lại Bi 8 hoặc xếp lại
    if (pocketedEight) {
      const decidingPlayer = scratched ? opponent : shooter;
      return {
        nextPlayer: decidingPlayer,
        continuesTurn: !scratched,
        isFoul: scratched,
        foulReason: scratched
          ? 'Bi 8 rơi kèm bi cái khi khai cuộc — Đặt lại Bi 8 & Chọn phương án'
          : null,
        toastText: scratched
          ? 'BI 8 RƠI & RƠI BI CÁI KHI KHAI CUỘC'
          : 'BI 8 RƠI KHI KHAI CUỘC · CHỌN PHƯƠNG ÁN',
        toastTone: scratched ? 'foul' : 'info',
        ballInHand: scratched,
        ballInHandScope: scratched ? 'kitchen' : 'full',
        mustShootOutOfKitchen: scratched,
        assignedP1Group: null,
        assignedP2Group: null,
        newlyAssignedGroup: null,
        spotEightBall: true,
        pendingDecision: {
          type: 'eight-on-break',
          decidingPlayer,
          breaker: shooter,
          scratched,
        },
        winner: null,
        winReason: null,
        missedCalledPocket: false,
        nextConsecutiveNonPottingTurns: 0,
        stalemateReached: false,
        logEntry: {
          shotNumber,
          player: shooter,
          actionLabel: 'Khai cuộc',
          verdict: 'decision',
          detail: scratched
            ? 'Rơi Bi 8 & bi cái khi khai cuộc — chờ đối thủ quyết định (Spot hoặc Xếp lại)'
            : 'Rơi Bi 8 hợp lệ khi khai cuộc — chờ người phá quyết định (Spot hoặc Xếp lại)',
        },
      };
    }

    // Rơi bi cái khi khai cuộc (Scratch on Break): bàn vẫn Mở, đối thủ đặt bi Trong Bếp & phải đánh ra ngoài vạch 25%
    if (scratched) {
      return {
        nextPlayer: opponent,
        continuesTurn: false,
        isFoul: true,
        foulReason: 'Bi cái rơi lúc khai cuộc — Đặt bi Trong Bếp (đánh bi ngoài vạch 25%)',
        toastText: 'RƠI BI CÁI KHAI CUỘC · ĐẶT TRONG BẾP',
        toastTone: 'foul',
        ballInHand: true,
        ballInHandScope: 'kitchen',
        mustShootOutOfKitchen: true,
        assignedP1Group: null,
        assignedP2Group: null,
        newlyAssignedGroup: null,
        spotEightBall: false,
        pendingDecision: null,
        winner: null,
        winReason: null,
        missedCalledPocket: false,
        nextConsecutiveNonPottingTurns: 0,
        stalemateReached: false,
        logEntry: {
          shotNumber,
          player: shooter,
          actionLabel: 'Khai cuộc',
          verdict: 'foul',
          detail: 'Rơi bi cái khi khai cuộc — Đối thủ đặt bi Trong Bếp (Bàn vẫn Mở)',
        },
      };
    }

    // Phá bi không hợp lệ (không ăn bi & < 4 bi chạm băng): đối thủ chọn 1 trong 3 phương án WPA 3.3
    if (!legalBreak) {
      return {
        nextPlayer: opponent,
        continuesTurn: false,
        isFoul: false,
        foulReason: null,
        toastText: 'KHAI CUỘC CHƯA ĐỦ 4 BI CHẠM BĂNG · CHỌN PHƯƠNG ÁN',
        toastTone: 'foul',
        ballInHand: false,
        ballInHandScope: 'full',
        mustShootOutOfKitchen: false,
        assignedP1Group: null,
        assignedP2Group: null,
        newlyAssignedGroup: null,
        spotEightBall: false,
        pendingDecision: {
          type: 'illegal-break',
          decidingPlayer: opponent,
          breaker: shooter,
        },
        winner: null,
        winReason: null,
        missedCalledPocket: false,
        nextConsecutiveNonPottingTurns: 0,
        stalemateReached: false,
        logEntry: {
          shotNumber,
          player: shooter,
          actionLabel: 'Khai cuộc',
          verdict: 'decision',
          detail: `Khai cuộc lỗi (${breakRailHitCount}/4 bi chạm băng) — Chờ đối thủ chọn 1 trong 3 phương án`,
        },
      };
    }

    // Khai cuộc hợp lệ -> BÀN LUÔN MỞ (WPA 3.4)
    const breakContinues = pocketedNonEight.length > 0;
    return {
      nextPlayer: breakContinues ? shooter : opponent,
      continuesTurn: breakContinues,
      isFoul: false,
      foulReason: null,
      toastText: breakContinues ? 'KHAI CUỘC HỢP LỆ · BÀN ĐANG MỞ' : null,
      toastTone: 'info',
      ballInHand: false,
      ballInHandScope: 'full',
      mustShootOutOfKitchen: false,
      assignedP1Group: null,
      assignedP2Group: null,
      newlyAssignedGroup: null,
      spotEightBall: false,
      pendingDecision: null,
      winner: null,
      winReason: null,
      missedCalledPocket: false,
      nextConsecutiveNonPottingTurns: breakContinues ? 0 : 1,
      stalemateReached: false,
      logEntry: {
        shotNumber,
        player: shooter,
        actionLabel: 'Khai cuộc',
        verdict: 'valid',
        detail: breakContinues
          ? `Phá hợp lệ, ăn ${pocketedNonEight.length} bi — Bàn vẫn Mở, tiếp tục đánh`
          : `Phá hợp lệ (${breakRailHitCount} bi chạm băng) — Bàn Mở, chuyển lượt`,
      },
    };
  }

  // =========================================================================
  // 2. KIỂM TRA LỖI CHẠM CHUẨN WPA 3.8 (KỂ CẢ KHI ĐÁNH BI 8)
  // =========================================================================
  let foulReason: string | null = null;
  let toastText: string | null = null;

  if (scratched) {
    foulReason = 'Bi cái rơi lỗ — Đặt bi tự do';
    toastText = 'BI CÁI RƠI LỖ · ĐẶT BI TỰ DO';
  } else if (firstHitBallId === null) {
    foulReason = 'Không chạm bi — Đặt bi tự do';
    toastText = 'PHẠM LỖI · KHÔNG CHẠM BI';
  } else if (
    mustShootOutOfKitchen &&
    firstHitWasInKitchen &&
    !cueCrossedHeadStringBeforeFirstHit &&
    !allLegalTargetsInKitchen
  ) {
    foulReason = 'Vi phạm đánh bi Trong Bếp sau lỗi phá — Đặt bi tự do';
    toastText = 'PHẠM LỖI · PHẢI ĐÁNH BI NGOÀI VẠCH BẾP';
  } else if (shooterGroupBefore !== null) {
    if (shooterGroupClearedBeforeTurn && firstHitBallId !== 8) {
      foulReason = 'Phải chạm Bi 8 trước — Đặt bi tự do';
      toastText = 'PHẠM LỖI · CHƯA CHẠM BI 8';
    } else if (!shooterGroupClearedBeforeTurn && firstHitBallGroup !== shooterGroupBefore) {
      foulReason = 'Chạm sai nhóm bi — Đặt bi tự do';
      toastText = 'PHẠM LỖI · CHẠM SAI NHÓM BI';
    }
  } else if (firstHitBallId === 8) {
    foulReason = 'Chạm Bi 8 đầu tiên khi bàn đang mở — Đặt bi tự do';
    toastText = 'PHẠM LỖI · CHẠM BI 8 SỚM';
  }

  // Luật chạm băng sau va chạm (No-Rail Foul): sau va chạm đầu tiên phải có ít nhất 1 bi chạm băng hoặc rơi lỗ
  if (!foulReason && !railHitAfterFirstContact && pocketedBalls.length === 0) {
    foulReason = 'Không chạm băng sau va chạm — Đặt bi tự do';
    toastText = 'PHẠM LỖI · KHÔNG CHẠM BĂNG SAU VA CHẠM';
  }

  // =========================================================================
  // 3. KIỂM TRA RƠI BI SỐ 8 (THẮNG / THUA VÁN — WPA 3.9)
  // =========================================================================
  if (pocketedEight) {
    const wrongCalledPocket =
      calledPocketId !== null && pocketedEight.pocketId !== calledPocketId;
    const lost = Boolean(foulReason) || !shooterGroupClearedBeforeTurn || wrongCalledPocket;

    if (lost) {
      const lossReason = scratched
        ? 'Rơi bi cái khi đánh Bi số 8'
        : !shooterGroupClearedBeforeTurn
          ? 'Đưa Bi 8 xuống lỗ trước khi dọn hết nhóm'
          : wrongCalledPocket
            ? 'Đưa Bi 8 nhầm lỗ đã chỉ định'
            : foulReason ?? 'Phạm lỗi khi đánh Bi số 8';
      return {
        nextPlayer: opponent,
        continuesTurn: false,
        isFoul: true,
        foulReason: lossReason,
        toastText: 'THUA VÁN · LỖI BI SỐ 8',
        toastTone: 'foul',
        ballInHand: false,
        ballInHandScope: 'full',
        mustShootOutOfKitchen: false,
        assignedP1Group: currentP1Group,
        assignedP2Group: currentP2Group,
        newlyAssignedGroup: null,
        spotEightBall: false,
        pendingDecision: null,
        winner: opponent,
        winReason: lossReason,
        missedCalledPocket: wrongCalledPocket,
        nextConsecutiveNonPottingTurns: 0,
        stalemateReached: false,
        logEntry: {
          shotNumber,
          player: shooter,
          actionLabel: 'Đánh Bi 8',
          verdict: 'loss',
          detail: lossReason,
        },
      };
    }

    return {
      nextPlayer: shooter,
      continuesTurn: false,
      isFoul: false,
      foulReason: null,
      toastText: 'CHIẾN THẮNG · BI 8 VÀO ĐÚNG LỖ',
      toastTone: 'reward',
      ballInHand: false,
      ballInHandScope: 'full',
      mustShootOutOfKitchen: false,
      assignedP1Group: currentP1Group,
      assignedP2Group: currentP2Group,
      newlyAssignedGroup: null,
      spotEightBall: false,
      pendingDecision: null,
      winner: shooter,
      winReason:
        calledPocketId !== null
          ? `Đưa Bi số 8 vào đúng lỗ #${calledPocketId + 1}!`
          : 'Đưa Bi số 8 vào lỗ hợp lệ!',
      missedCalledPocket: false,
      nextConsecutiveNonPottingTurns: 0,
      stalemateReached: false,
      logEntry: {
        shotNumber,
        player: shooter,
        actionLabel: 'Bi 8 quyết định',
        verdict: 'win',
        detail:
          calledPocketId !== null
            ? `Đưa Bi 8 chuẩn xác vào lỗ #${calledPocketId + 1}`
            : 'Đưa Bi 8 vào lỗ hợp lệ — Thắng ván',
      },
    };
  }

  // =========================================================================
  // 4. NẾU PHẠM LỖI CHUẨN -> BALL-IN-HAND TOÀN BÀN CHO ĐỐI THỦ
  // =========================================================================
  if (foulReason) {
    return {
      nextPlayer: opponent,
      continuesTurn: false,
      isFoul: true,
      foulReason,
      toastText,
      toastTone: 'foul',
      ballInHand: true,
      ballInHandScope: 'full',
      mustShootOutOfKitchen: false,
      assignedP1Group: currentP1Group,
      assignedP2Group: currentP2Group,
      newlyAssignedGroup: null,
      spotEightBall: false,
      pendingDecision: null,
      winner: null,
      winReason: null,
      missedCalledPocket: false,
      nextConsecutiveNonPottingTurns: 0,
      stalemateReached: false,
      logEntry: {
        shotNumber,
        player: shooter,
        actionLabel: isSafetyCall ? 'Chạy đạn (Safety)' : 'Đánh bi',
        verdict: 'foul',
        detail: foulReason,
      },
    };
  }

  // =========================================================================
  // 5. LỌC BI ĂN HỢP LỆ THEO CALL SHOT & SAFETY (WPA 3.6 & 3.7)
  // =========================================================================
  const validPocketed =
    ruleSet === 'wpa-pro' && !isSafetyCall
      ? calledPocketId !== null
        ? pocketedNonEight.filter((b) => b.pocketId === calledPocketId)
        : []
      : pocketedNonEight;

  const missedCalledPocket =
    ruleSet === 'wpa-pro' &&
    !isSafetyCall &&
    pocketedNonEight.length > 0 &&
    validPocketed.length === 0;

  // Khi Chạy đạn (Safety) hoặc rơi nhầm lỗ chỉ định: không chốt nhóm trong Bàn Mở & chuyển lượt
  let assignedP1Group = currentP1Group;
  let assignedP2Group = currentP2Group;
  let newlyAssignedGroup: WpaBallGroup | null = null;

  if (shooterGroupBefore === null && !isSafetyCall && validPocketed.length > 0) {
    const resolved = resolveGroupOnOpenTable(validPocketed, firstHitBallGroup);
    if (resolved) {
      newlyAssignedGroup = resolved;
      const other: WpaBallGroup = resolved === 'solids' ? 'stripes' : 'solids';
      if (shooter === 1) {
        assignedP1Group = resolved;
        assignedP2Group = other;
      } else {
        assignedP2Group = resolved;
        assignedP1Group = other;
      }
    }
  }

  const shooterGroupNow = shooter === 1 ? assignedP1Group : assignedP2Group;
  const scoredOwnBall =
    !isSafetyCall &&
    validPocketed.some((b) => (shooterGroupNow === null ? true : b.group === shooterGroupNow));

  const continuesTurn = scoredOwnBall;
  const nextPlayer = continuesTurn ? shooter : opponent;
  const nextNonPot = pocketedBalls.length === 0 ? consecutiveNonPottingTurns + 1 : 0;
  const stalemateReached = !continuesTurn && nextNonPot >= STALEMATE_TURN_THRESHOLD;

  let actionLabel = 'Đánh bi';
  let detail = 'Không rơi bi — Chuyển lượt';
  let resultToast: string | null = null;

  if (isSafetyCall) {
    actionLabel = 'Chạy đạn (Safety)';
    detail =
      pocketedNonEight.length > 0
        ? `Chủ động chạy đạn (bi ${pocketedNonEight.map((b) => `#${b.id}`).join(', ')} giữ dưới lỗ) — Chuyển lượt`
        : 'Chủ động chạy đạn an toàn — Chuyển lượt';
    resultToast = 'CHẠY ĐẠN (SAFETY) · CHUYỂN LƯỢT';
  } else if (continuesTurn) {
    actionLabel = newlyAssignedGroup
      ? `Chốt ${newlyAssignedGroup === 'solids' ? 'Trơn (1–7)' : 'Sọc (9–15)'}`
      : `Ăn ${validPocketed.length} bi`;
    detail = `Ăn hợp lệ ${validPocketed.map((b) => `#${b.id}`).join(', ')} — Tiếp tục lượt`;
  } else if (missedCalledPocket) {
    actionLabel = 'Sai lỗ chỉ định';
    detail = `Bi ${pocketedNonEight.map((b) => `#${b.id}`).join(', ')} rơi nhầm lỗ chỉ định — Giữ dưới lỗ & chuyển lượt`;
    resultToast = 'RƠI NHẦM LỖ CHỈ ĐỊNH · CHUYỂN LƯỢT';
  } else if (pocketedNonEight.length > 0) {
    detail = `Chỉ ăn bi đối thủ (${pocketedNonEight.map((b) => `#${b.id}`).join(', ')}) — Chuyển lượt`;
  }

  return {
    nextPlayer,
    continuesTurn,
    isFoul: false,
    foulReason: null,
    toastText: resultToast,
    toastTone: 'info',
    ballInHand: false,
    ballInHandScope: 'full',
    mustShootOutOfKitchen: false,
    assignedP1Group,
    assignedP2Group,
    newlyAssignedGroup,
    spotEightBall: false,
    pendingDecision: null,
    winner: null,
    winReason: null,
    missedCalledPocket,
    nextConsecutiveNonPottingTurns: nextNonPot,
    stalemateReached,
    logEntry: {
      shotNumber,
      player: shooter,
      actionLabel,
      verdict: 'valid',
      detail,
    },
  };
}
