import type { ManifestChapter, ManifestLesson, ManifestSubject } from '@schemas/index';
import type { IslandSubjectCode } from '@/context/island-helpers';
import type { LastVisitedEntry } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';

export const CONSTELLATION_VIEWBOX = {
  width: 340,
  height: 220,
  paddingX: 34,
  paddingTop: 36,
  paddingBottom: 30,
} as const;

export const MIN_STAR_DISTANCE = 36;

export type ConstellationStarStatus = 'completed' | 'active' | 'upcoming';

export type ConstellationSegmentKind = 'completed' | 'to-active' | 'upcoming';

export interface TooltipPlacement {
  readonly horizontal: 'left' | 'center' | 'right';
  readonly vertical: 'above' | 'below';
}

export interface ConstellationPoint {
  readonly x: number;
  readonly y: number;
  readonly labelSide: 'above' | 'below';
}

export interface ConstellationStarNode {
  readonly id: string;
  readonly index: number;
  readonly shortCode: string;
  readonly title: string;
  readonly href: string;
  readonly status: ConstellationStarStatus;
  readonly x: number;
  readonly y: number;
  readonly labelSide: 'above' | 'below';
  readonly tooltipPlacement: TooltipPlacement;
}

export interface ConstellationSegment {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly kind: ConstellationSegmentKind;
}

export interface SubjectRimWaypoint {
  readonly slug: string;
  readonly code: IslandSubjectCode;
  readonly x: number;
  readonly y: number;
  readonly active: boolean;
}

export interface ActiveConstellationData {
  readonly chapterKey: string;
  readonly subjectSlug: string;
  readonly subjectTitle: string;
  readonly subjectCode: IslandSubjectCode;
  readonly chapterId: string;
  readonly chapterNumber: number;
  readonly chapterTitle: string;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly isChapterCompleted: boolean;
  readonly metadataCaption: string;
  readonly nodes: readonly ConstellationStarNode[];
  readonly segments: readonly ConstellationSegment[];
  readonly waypoints: readonly SubjectRimWaypoint[];
}

const CANONICAL_WAYPOINTS: readonly {
  readonly slug: string;
  readonly code: IslandSubjectCode;
  readonly x: number;
  readonly y: number;
}[] = [
  // Nằm dọc theo cung thiên cầu ngoài (tâm 170, 438; bán kính 420) phía trên vùng sao an toàn
  { slug: 'cau-truc-dai-so', code: 'CTĐS', x: 74, y: 29.1 },
  { slug: 'hinh-hoc-affine', code: 'HHAVE', x: 138, y: 19.2 },
  { slug: 'giai-tich-ham-mot-bien', code: 'GTHMB', x: 202, y: 19.2 },
  { slug: 'giao-duc-hoc', code: 'GDH', x: 266, y: 29.1 },
];

/** Băm FNV-1a 32-bit xác định từ chuỗi khóa chương (0% ngẫu nhiên). */
export function hashChapterSeed(chapterKey: string): number {
  let hash = 2166136261;
  for (let i = 0; i < chapterKey.length; i += 1) {
    hash ^= chapterKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveSubjectCode(subjectSlug: string, fallbackTitle?: string): IslandSubjectCode {
  switch (subjectSlug) {
    case 'cau-truc-dai-so':
    case 'algebraic-structures':
      return 'CTĐS';
    case 'hinh-hoc-affine':
    case 'affine-geometry':
      return 'HHAVE';
    case 'giai-tich-ham-mot-bien':
    case 'single-variable-calculus':
      return 'GTHMB';
    case 'giao-duc-hoc':
    case 'pedagogy':
      return 'GDH';
    default: {
      if (fallbackTitle?.toLowerCase().includes('hình học')) return 'HHAVE';
      if (fallbackTitle?.toLowerCase().includes('giải tích')) return 'GTHMB';
      if (fallbackTitle?.toLowerCase().includes('giáo dục')) return 'GDH';
      return 'CTĐS';
    }
  }
}

/**
 * Tự động neo hướng thẻ tooltip theo tọa độ sao trong viewBox 340×220
 * để không bao giờ tràn hoặc bị cắt bởi viền khung Hero.
 */
export function computeTooltipPlacement(x: number, y: number): TooltipPlacement {
  const horizontal: TooltipPlacement['horizontal'] =
    x < 108 ? 'left' : x > 232 ? 'right' : 'center';
  const vertical: TooltipPlacement['vertical'] = y < 92 ? 'below' : 'above';
  return { horizontal, vertical };
}

/**
 * Phân bổ N ngôi sao xác định (deterministic) dọc theo đường cong thiên văn chữ S hữu cơ
 * trong vùng đệm an toàn [34..306] × [36..190], khóa khoảng cách Euclid tối thiểu >= 36px.
 */
export function computeConstellationPoints(
  count: number,
  chapterSeedKey: string,
): readonly ConstellationPoint[] {
  if (!Number.isFinite(count) || count <= 0) {
    return [];
  }

  const minX = CONSTELLATION_VIEWBOX.paddingX;
  const maxX = CONSTELLATION_VIEWBOX.width - CONSTELLATION_VIEWBOX.paddingX;
  const minY = CONSTELLATION_VIEWBOX.paddingTop;
  // Chừa thêm nhịp thở phía trên dòng metadata góc dưới phải (220 - 30 = 190 -> giữ <= 186)
  const maxY = CONSTELLATION_VIEWBOX.height - CONSTELLATION_VIEWBOX.paddingBottom - 4;
  const centerX = CONSTELLATION_VIEWBOX.width / 2;
  const midY = (minY + maxY) / 2;

  if (count === 1) {
    return [{ x: centerX, y: round2(midY), labelSide: 'below' }];
  }

  const seed = hashChapterSeed(chapterSeedKey || 'default-chapter');
  const sign = (seed & 1) === 0 ? 1 : -1;
  const phase = (((seed >>> 1) % 360) * Math.PI) / 180;
  const secondaryFreq = 1.65 + ((seed >>> 9) % 6) * 0.12;

  const usableWidth = maxX - minX;
  const spanX =
    count === 2
      ? Math.min(usableWidth, 136)
      : count <= 5
        ? Math.min(usableWidth, 168 + (count - 3) * 44)
        : usableWidth;
  const startX = centerX - spanX / 2;
  const dxStep = spanX / (count - 1);

  // Khi chương nhiều bài (dxStep nhỏ), tự mở nhánh kép dọc để giữ khoảng cách >= 36px không chồng nhãn
  const minTargetDist = MIN_STAR_DISTANCE + 0.8;
  const requiredVerticalStep =
    dxStep < 42 ? Math.sqrt(Math.max(0, 39.5 * 39.5 - dxStep * dxStep)) : 0;
  const branchAmp = dxStep < 42 ? clamp(requiredVerticalStep * 0.56, 8, 28) : 5.5;
  const sAmp = dxStep < 42 ? Math.max(15, 27 - (branchAmp - 6) * 0.42) : 27;
  const harmAmp = dxStep < 42 ? 5.5 : 8.5;

  const work = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const x = startX + t * spanX;
    const sOffset = sign * Math.sin((t - 0.5) * Math.PI * 1.32) * sAmp;
    const hOffset = Math.sin(t * Math.PI * secondaryFreq + phase) * harmAmp;
    const bOffset = (i % 2 === 0 ? -1 : 1) * sign * branchAmp;
    const y = clamp(midY + sOffset + hOffset + bOffset, minY, maxY);
    return { x, y };
  });

  // Khóa ràng buộc khoảng cách Euclid tối thiểu >= 36px bằng phép chiếu giãn tĩnh xác định
  const maxIterations = 80;
  for (let iter = 0; iter < maxIterations; iter += 1) {
    let adjusted = false;
    for (let i = 0; i < count - 1; i += 1) {
      for (let j = i + 1; j < count; j += 1) {
        const pi = work[i]!;
        const pj = work[j]!;
        const dx = pj.x - pi.x;
        const dy = pj.y - pi.y;
        const dist = Math.hypot(dx, dy);
        if (dist < minTargetDist) {
          adjusted = true;
          const ux = dist > 1e-6 ? dx / dist : 0;
          const uy = dist > 1e-6 ? dy / dist : j % 2 === 0 ? 1 : -1;
          const push = (minTargetDist - dist) * 0.54;
          pi.x = clamp(pi.x - ux * push, minX, maxX);
          pi.y = clamp(pi.y - uy * push, minY, maxY);
          pj.x = clamp(pj.x + ux * push, minX, maxX);
          pj.y = clamp(pj.y + uy * push, minY, maxY);
        }
      }
    }
    if (!adjusted) break;
  }

  return work.map((pt, i) => {
    const prevY = work[Math.max(0, i - 1)]!.y;
    const nextY = work[Math.min(count - 1, i + 1)]!.y;
    const neighborMeanY = (prevY + nextY) / 2;

    let labelSide: 'above' | 'below';
    if (pt.y > 160) {
      labelSide = 'above';
    } else if (pt.y < 54) {
      labelSide = 'below';
    } else if (pt.y < neighborMeanY - 3.5) {
      labelSide = 'above';
    } else if (pt.y > neighborMeanY + 3.5) {
      labelSide = 'below';
    } else {
      labelSide = i % 2 === 0 ? 'below' : 'above';
    }

    return {
      x: round2(pt.x),
      y: round2(pt.y),
      labelSide,
    };
  });
}

function findVisitedLocationInSubjects(
  subjects: readonly ManifestSubject[],
  lessonId: string,
): { subject: ManifestSubject; chapter: ManifestChapter; lesson: ManifestLesson } | null {
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      if (chapter.lessons.length === 0) continue;
      for (const lesson of chapter.lessons) {
        if (lesson.id === lessonId || lesson.aliases?.includes(lessonId)) {
          return { subject, chapter, lesson };
        }
      }
    }
  }
  return null;
}

export interface ResolveActiveConstellationParams {
  readonly subjects: readonly ManifestSubject[];
  readonly completedLessons: Readonly<Record<string, string>>;
  readonly lastVisitedGlobal: LastVisitedEntry | null;
}

/**
 * Xác định chương hiển thị trên Chòm sao Hero và trạng thái từng bài học:
 * 1. Ưu tiên chương chứa bài học truy cập gần nhất (`lastVisitedGlobal`).
 * 2. Fallback khi chưa có lịch sử: lấy Chương đầu tiên chưa hoàn thành của học phần mặc định.
 * 3. Nếu toàn bộ chương đã hoàn thành 100%: giữ trọn vẹn các sao sáng vàng kèm cờ `isChapterCompleted`.
 */
export function resolveActiveConstellationData({
  subjects,
  completedLessons,
  lastVisitedGlobal,
}: ResolveActiveConstellationParams): ActiveConstellationData | null {
  let targetSubject: ManifestSubject | null = null;
  let targetChapter: ManifestChapter | null = null;
  let visitedLesson: ManifestLesson | null = null;

  if (lastVisitedGlobal?.lessonId) {
    const matched = findVisitedLocationInSubjects(subjects, lastVisitedGlobal.lessonId);
    if (matched) {
      targetSubject = matched.subject;
      targetChapter = matched.chapter;
      visitedLesson = matched.lesson;
    }
  }

  if (!targetSubject || !targetChapter) {
    const defaultSubject = subjects.find((s) => s.chapters.some((ch) => ch.lessons.length > 0));
    if (!defaultSubject) {
      return null;
    }
    const nonEmptyChapters = defaultSubject.chapters.filter((ch) => ch.lessons.length > 0);
    const firstIncompleteChapter = nonEmptyChapters.find((ch) =>
      ch.lessons.some((ls) => !completedLessons[ls.id]),
    );
    targetSubject = defaultSubject;
    // Nếu toàn bộ các chương của học phần mặc định đã xong 100%, hiển thị chương đầu tiên ở trạng thái hoàn tất
    targetChapter = firstIncompleteChapter ?? nonEmptyChapters[0] ?? null;
  }

  if (!targetSubject || !targetChapter || targetChapter.lessons.length === 0) {
    return null;
  }

  const lessons = targetChapter.lessons;
  const totalCount = lessons.length;
  let completedCount = 0;
  for (const ls of lessons) {
    if (completedLessons[ls.id]) {
      completedCount += 1;
    }
  }
  const isChapterCompleted = completedCount === totalCount;

  let activeLessonId: string | null = null;
  if (!isChapterCompleted) {
    if (visitedLesson && !completedLessons[visitedLesson.id]) {
      activeLessonId = visitedLesson.id;
    } else if (visitedLesson) {
      const visitedIdx = lessons.findIndex((ls) => ls.id === visitedLesson.id);
      const nextIncompleteAfterVisited =
        visitedIdx >= 0
          ? lessons.slice(visitedIdx + 1).find((ls) => !completedLessons[ls.id])
          : null;
      const firstIncomplete = lessons.find((ls) => !completedLessons[ls.id]);
      activeLessonId = nextIncompleteAfterVisited?.id ?? firstIncomplete?.id ?? null;
    } else {
      activeLessonId = lessons.find((ls) => !completedLessons[ls.id])?.id ?? null;
    }
  }

  const chapterKey = `${targetSubject.slug}::${targetChapter.id}`;
  const points = computeConstellationPoints(totalCount, chapterKey);
  const subjectCode = resolveSubjectCode(targetSubject.slug, targetSubject.title);

  const nodes: ConstellationStarNode[] = lessons.map((ls, index) => {
    const pt = points[index] ?? { x: 170, y: 110, labelSide: 'below' as const };
    const status: ConstellationStarStatus = completedLessons[ls.id]
      ? 'completed'
      : ls.id === activeLessonId
        ? 'active'
        : 'upcoming';

    return {
      id: ls.id,
      index,
      shortCode: `${targetChapter.number}.${ls.number}`,
      title: ls.title,
      href: ROUTES.lesson(targetSubject.slug, targetChapter.slug, ls.slug),
      status,
      x: pt.x,
      y: pt.y,
      labelSide: pt.labelSide,
      tooltipPlacement: computeTooltipPlacement(pt.x, pt.y),
    };
  });

  const segments: ConstellationSegment[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]!;
    const b = nodes[i + 1]!;
    const kind: ConstellationSegmentKind =
      a.status === 'completed' && b.status === 'completed'
        ? 'completed'
        : b.status === 'active'
          ? 'to-active'
          : 'upcoming';

    segments.push({
      id: `${a.id}->${b.id}`,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      kind,
    });
  }

  const waypoints: SubjectRimWaypoint[] = CANONICAL_WAYPOINTS.map((wp) => ({
    ...wp,
    active: wp.code === subjectCode,
  }));

  return {
    chapterKey,
    subjectSlug: targetSubject.slug,
    subjectTitle: targetSubject.title,
    subjectCode,
    chapterId: targetChapter.id,
    chapterNumber: targetChapter.number,
    chapterTitle: targetChapter.title,
    completedCount,
    totalCount,
    isChapterCompleted,
    metadataCaption: `${subjectCode} · CHƯƠNG ${targetChapter.number} · ${completedCount}/${totalCount}`,
    nodes,
    segments,
    waypoints,
  };
}
