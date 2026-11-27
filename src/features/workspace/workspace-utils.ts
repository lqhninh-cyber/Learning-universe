import {
  DEFAULT_DASHBOARD_SECTION_ORDER,
  isDashboardSectionId,
  type DashboardLayoutConfig,
  type DashboardSectionId,
  type StudyTaskItem,
} from './types';

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeAdaptiveGreeting {
  readonly period: DayPeriod;
  readonly salutation: string;
  readonly headline: string;
  readonly badgeLabel: string;
  readonly subtitle: string;
  readonly scrimGradient: string;
  readonly accentDotColor: string;
}

export interface ActivityHeatmapCell {
  readonly dateKey: string;
  readonly count: number;
  readonly level: 0 | 1 | 2 | 3;
  readonly shortLabel: string;
}

export interface StudyActivityMetrics {
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly activeDaysLast28: number;
  readonly weekLessonsCount: number;
  readonly weekPomodorosCount: number;
  readonly weekCompletedTasksCount: number;
  readonly activityByDate: Readonly<Record<string, number>>;
  readonly heatmapDays: readonly ActivityHeatmapCell[];
}

/** Chuyển Date sang khóa ngày địa phương `YYYY-MM-DD` (tránh lệch ngày do UTC) */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey: string): Date {
  const parts = dateKey.split('-').map((n) => Number.parseInt(n, 10));
  const year = parts[0] || 2026;
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day, 12, 0, 0, 0);
}

export function isoToLocalDateKey(isoString: string | null | undefined): string | null {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalDateKey(parsed);
}

export function addDaysLocal(base: Date, deltaDays: number): Date {
  const copy = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0, 0);
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
}

export function formatShortVietnameseDate(dateKey: string): string {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  return `${parts[2]}/${parts[1]}`;
}

export function computeDaysUntilDate(targetDateKey: string, now: Date = new Date()): number {
  const todayMidday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  const targetMidday = parseLocalDateKey(targetDateKey);
  const diffMs = targetMidday.getTime() - todayMidday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatCountdownLabel(daysUntil: number): string {
  if (daysUntil < 0) return `Đã qua ${Math.abs(daysUntil)} ngày`;
  if (daysUntil === 0) return 'Hôm nay';
  if (daysUntil === 1) return 'Ngày mai';
  return `Còn ${daysUntil} ngày`;
}

/**
 * Lời chào thích ứng theo khung giờ địa phương + tên tài khoản (nếu đã đăng nhập).
 * Đổi sắc thái ánh sáng scrim nhẹ theo buổi trong ngày mà vẫn giữ độ tương phản chữ trắng > 7:1.
 */
export function getVietnameseTimeGreeting(
  now: Date = new Date(),
  learnerDisplayName?: string | null,
): TimeAdaptiveGreeting {
  const hour = now.getHours();
  const cleanName = learnerDisplayName?.trim() || '';
  // Lấy tên ngắn gọn (tối đa 2 từ cuối cho tự nhiên kiểu tiếng Việt, hoặc giữ nguyên nếu ngắn)
  const shortName = (() => {
    if (!cleanName) return '';
    const tokens = cleanName.split(/\s+/).filter(Boolean);
    if (tokens.length <= 2) return cleanName;
    return tokens.slice(-2).join(' ');
  })();

  const withName = (base: string) => (shortName ? `${base}, ${shortName}` : base);

  if (hour >= 5 && hour < 12) {
    return {
      period: 'morning',
      salutation: 'Chào buổi sáng',
      headline: withName('Chào buổi sáng'),
      badgeLabel: 'Buổi sáng',
      subtitle: 'Khởi động tư duy chứng minh trong nhịp sáng trong trẻo',
      scrimGradient:
        'linear-gradient(108deg, rgba(16, 36, 32, 0.72) 0%, rgba(22, 48, 42, 0.42) 52%, rgba(28, 54, 48, 0.14) 100%)',
      accentDotColor: '#E6C27A',
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      period: 'afternoon',
      salutation: 'Phiên học chiều',
      headline: withName('Phiên học chiều'),
      badgeLabel: 'Buổi chiều',
      subtitle: 'Tập trung hệ thống hóa định lý và luyện bài tập trọng tâm',
      scrimGradient:
        'linear-gradient(108deg, rgba(14, 28, 25, 0.74) 0%, rgba(19, 39, 35, 0.44) 52%, rgba(20, 42, 38, 0.16) 100%)',
      accentDotColor: '#D4AF6A',
    };
  }

  if (hour >= 18 && hour < 22) {
    return {
      period: 'evening',
      salutation: 'Buổi tối ôn luyện',
      headline: withName('Buổi tối ôn luyện'),
      badgeLabel: 'Buổi tối',
      subtitle: 'Tổng hợp kiến thức trong ngày và rà soát các mắt xích còn hở',
      scrimGradient:
        'linear-gradient(108deg, rgba(16, 24, 30, 0.78) 0%, rgba(22, 34, 40, 0.48) 52%, rgba(20, 32, 36, 0.2) 100%)',
      accentDotColor: '#D99B5E',
    };
  }

  return {
    period: 'night',
    salutation: 'Tĩnh lặng đêm khuya',
    headline: withName('Tĩnh lặng đêm khuya'),
    badgeLabel: 'Đêm khuya',
    subtitle: 'Không gian yên tĩnh dành cho những suy luận sâu sắc nhất',
    scrimGradient:
      'linear-gradient(108deg, rgba(10, 17, 20, 0.84) 0%, rgba(14, 24, 26, 0.56) 52%, rgba(12, 20, 22, 0.28) 100%)',
    accentDotColor: '#8BC5B0',
  };
}

function getMondayStart(now: Date): Date {
  const localMidday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const day = localMidday.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  localMidday.setDate(localMidday.getDate() + diffToMonday);
  return localMidday;
}

/**
 * Tổng hợp chuỗi ngày học (Streak), bản đồ nhiệt 28 ngày và thống kê tuần
 * từ tiến độ hoàn thành bài, To-Do hoàn thành và phiên Pomodoro.
 */
export function computeStudyActivityMetrics(params: {
  readonly completedLessons: Readonly<Record<string, string>>;
  readonly tasks: readonly StudyTaskItem[];
  readonly pomodoroLogs: readonly string[];
  readonly now?: Date;
}): StudyActivityMetrics {
  const now = params.now ?? new Date();
  const mondayStartMs = getMondayStart(now).getTime();

  const activityByDate: Record<string, number> = {};
  let weekLessonsCount = 0;
  let weekPomodorosCount = 0;
  let weekCompletedTasksCount = 0;

  const incrementDay = (dateKey: string | null) => {
    if (!dateKey) return;
    activityByDate[dateKey] = (activityByDate[dateKey] ?? 0) + 1;
  };

  for (const iso of Object.values(params.completedLessons)) {
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      incrementDay(toLocalDateKey(parsed));
      if (parsed.getTime() >= mondayStartMs) {
        weekLessonsCount += 1;
      }
    }
  }

  for (const task of params.tasks) {
    if (!task.completed) continue;
    const completedIso = task.completedAt ?? task.updatedAt;
    const parsed = new Date(completedIso);
    if (!Number.isNaN(parsed.getTime())) {
      incrementDay(toLocalDateKey(parsed));
      if (parsed.getTime() >= mondayStartMs) {
        weekCompletedTasksCount += 1;
      }
    }
  }

  for (const iso of params.pomodoroLogs) {
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      incrementDay(toLocalDateKey(parsed));
      if (parsed.getTime() >= mondayStartMs) {
        weekPomodorosCount += 1;
      }
    }
  }

  // Tính chuỗi ngày học hiện tại (tính từ hôm nay; nếu hôm nay chưa có thì kiểm tra chuỗi tính tới hôm qua)
  const todayKey = toLocalDateKey(now);
  const yesterdayKey = toLocalDateKey(addDaysLocal(now, -1));
  let currentStreak = 0;
  let cursorOffset =
    (activityByDate[todayKey] ?? 0) > 0 ? 0 : (activityByDate[yesterdayKey] ?? 0) > 0 ? -1 : 1;

  if (cursorOffset <= 0) {
    while (currentStreak < 365) {
      const key = toLocalDateKey(addDaysLocal(now, cursorOffset));
      if ((activityByDate[key] ?? 0) > 0) {
        currentStreak += 1;
        cursorOffset -= 1;
      } else {
        break;
      }
    }
  }

  // Tính kỷ lục chuỗi ngày học từ tập các ngày đã hoạt động
  const sortedActiveKeys = Object.keys(activityByDate)
    .filter((k) => (activityByDate[k] ?? 0) > 0)
    .sort();

  let bestStreak = 0;
  let run = 0;
  let prevDayMs: number | null = null;
  for (const key of sortedActiveKeys) {
    const dayMs = parseLocalDateKey(key).getTime();
    if (prevDayMs !== null && Math.round((dayMs - prevDayMs) / (1000 * 60 * 60 * 24)) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > bestStreak) bestStreak = run;
    prevDayMs = dayMs;
  }

  // Tạo lưới nhiệt đồ 28 ngày gần nhất (từ quá khứ đến hôm nay)
  const heatmapDays: ActivityHeatmapCell[] = [];
  let activeDaysLast28 = 0;
  for (let offset = -27; offset <= 0; offset += 1) {
    const date = addDaysLocal(now, offset);
    const dateKey = toLocalDateKey(date);
    const count = activityByDate[dateKey] ?? 0;
    if (count > 0) activeDaysLast28 += 1;
    const level: 0 | 1 | 2 | 3 = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
    heatmapDays.push({
      dateKey,
      count,
      level,
      shortLabel: formatShortVietnameseDate(dateKey),
    });
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    activeDaysLast28,
    weekLessonsCount,
    weekPomodorosCount,
    weekCompletedTasksCount,
    activityByDate,
    heatmapDays,
  };
}

/** Chuẩn hóa cấu hình bố cục tầng trang Tổng quan (tương thích dữ liệu cũ từ localStorage) */
export function normalizeDashboardLayout(
  layout?: Partial<DashboardLayoutConfig> | null,
): DashboardLayoutConfig {
  const seenOrder = new Set<DashboardSectionId>();
  const order: DashboardSectionId[] = [];
  for (const id of layout?.order ?? []) {
    if (isDashboardSectionId(id) && !seenOrder.has(id)) {
      seenOrder.add(id);
      order.push(id);
    }
  }
  for (const id of DEFAULT_DASHBOARD_SECTION_ORDER) {
    if (!seenOrder.has(id)) {
      seenOrder.add(id);
      order.push(id);
    }
  }

  const seenHidden = new Set<DashboardSectionId>();
  const hidden: DashboardSectionId[] = [];
  for (const id of layout?.hidden ?? []) {
    if (isDashboardSectionId(id) && !seenHidden.has(id)) {
      seenHidden.add(id);
      hidden.push(id);
    }
  }

  return { order, hidden };
}

export type ReviewIntervalDays = 1 | 3 | 7;

export interface DueReviewLessonItem {
  readonly lessonId: string;
  readonly completedDateKey: string;
  readonly daysAgo: number;
  readonly intervalDays: ReviewIntervalDays;
  readonly reviewedToday: boolean;
}

/**
 * Lọc danh sách bài đã hoàn thành đến hạn ôn tập theo chu kỳ ngắt quãng 1 / 3 / 7 ngày.
 * - 1 ngày: vừa hoàn thành hôm qua
 * - 3 ngày: hoàn thành cách đây 3–4 ngày (chưa ôn lại trong cửa sổ này)
 * - 7 ngày: hoàn thành cách đây 7–10 ngày (chưa ôn lại trong cửa sổ này)
 */
export function computeDueReviewLessons(params: {
  readonly completedLessons: Readonly<Record<string, string>>;
  readonly reviewedLessons?: Readonly<Record<string, string>>;
  readonly now?: Date;
}): readonly DueReviewLessonItem[] {
  const now = params.now ?? new Date();
  const todayKey = toLocalDateKey(now);
  const reviewedMap = params.reviewedLessons ?? {};

  const items: DueReviewLessonItem[] = [];

  for (const [lessonId, completedIso] of Object.entries(params.completedLessons)) {
    const completedDateKey = isoToLocalDateKey(completedIso);
    if (!completedDateKey) continue;

    const daysAgo = -computeDaysUntilDate(completedDateKey, now);
    let intervalDays: ReviewIntervalDays | null = null;
    let windowStartDaysAgo = 0;

    if (daysAgo === 1) {
      intervalDays = 1;
      windowStartDaysAgo = 1;
    } else if (daysAgo >= 3 && daysAgo <= 4) {
      intervalDays = 3;
      windowStartDaysAgo = 3;
    } else if (daysAgo >= 7 && daysAgo <= 10) {
      intervalDays = 7;
      windowStartDaysAgo = 7;
    }

    if (!intervalDays) continue;

    const lastReviewedDateKey = reviewedMap[lessonId] ?? null;
    const reviewedToday = lastReviewedDateKey === todayKey;

    // Nếu đã ôn lại trong cùng cửa sổ mốc này ở ngày trước hôm nay thì không nhắc lặp
    if (lastReviewedDateKey && !reviewedToday) {
      const daysBetweenCompletedAndReview = computeDaysUntilDate(
        lastReviewedDateKey,
        parseLocalDateKey(completedDateKey),
      );
      if (daysBetweenCompletedAndReview >= windowStartDaysAgo) {
        continue;
      }
    }

    items.push({
      lessonId,
      completedDateKey,
      daysAgo,
      intervalDays,
      reviewedToday,
    });
  }

  return items.sort((a, b) => {
    if (a.reviewedToday !== b.reviewedToday) return a.reviewedToday ? 1 : -1;
    if (a.intervalDays !== b.intervalDays) return a.intervalDays - b.intervalDays;
    return a.daysAgo - b.daysAgo;
  });
}

export type ExamPaceUrgency = 'ready' | 'comfortable' | 'tight' | 'intense';

export interface ExamPacePlan {
  readonly remainingLessons: number;
  readonly lessonsPerDay: number;
  readonly urgency: ExamPaceUrgency;
  readonly summary: string;
  readonly shortLabel: string;
}

/**
 * Gắn đếm ngược kỳ thi với tiến độ thực tế của học phần để gợi ý nhịp học mỗi ngày.
 * Ví dụ: còn 12 ngày, còn 8 bài CTĐS chưa học → "Còn 8 bài CTĐS chưa học → khoảng 1 bài/ngày"
 */
export function computeExamPacePlan(params: {
  readonly daysUntil: number;
  readonly completedCount: number;
  readonly lessonCount: number;
  readonly subjectCode: string;
}): ExamPacePlan | null {
  const { daysUntil, completedCount, lessonCount, subjectCode } = params;
  if (daysUntil < 0 || lessonCount <= 0) return null;

  const remainingLessons = Math.max(0, lessonCount - completedCount);

  if (remainingLessons === 0) {
    return {
      remainingLessons: 0,
      lessonsPerDay: 0,
      urgency: 'ready',
      summary: `Đã xong ${lessonCount}/${lessonCount} bài ${subjectCode} · Sẵn sàng tổng ôn`,
      shortLabel: 'Đã học đủ · Tổng ôn',
    };
  }

  if (daysUntil === 0) {
    return {
      remainingLessons,
      lessonsPerDay: remainingLessons,
      urgency: 'intense',
      summary: `Còn ${remainingLessons} bài ${subjectCode} chưa học · Thi hôm nay`,
      shortLabel: `còn ${remainingLessons} bài`,
    };
  }

  const exactPerDay = remainingLessons / daysUntil;
  let paceText: string;
  let shortPace: string;

  if (exactPerDay < 0.5) {
    const daysPerLesson = Math.max(2, Math.round(daysUntil / remainingLessons));
    paceText = `khoảng 1 bài/${daysPerLesson} ngày`;
    shortPace = `~1 bài/${daysPerLesson} ngày`;
  } else {
    const roundedPerDay = Math.max(1, Math.ceil(exactPerDay));
    paceText = `khoảng ${roundedPerDay} bài/ngày`;
    shortPace = `~${roundedPerDay} bài/ngày`;
  }

  const urgency: ExamPaceUrgency =
    exactPerDay <= 1 ? 'comfortable' : exactPerDay <= 2 ? 'tight' : 'intense';

  return {
    remainingLessons,
    lessonsPerDay: Number(exactPerDay.toFixed(2)),
    urgency,
    summary: `Còn ${remainingLessons} bài ${subjectCode} chưa học → ${paceText}`,
    shortLabel: `còn ${remainingLessons} bài · ${shortPace}`,
  };
}
