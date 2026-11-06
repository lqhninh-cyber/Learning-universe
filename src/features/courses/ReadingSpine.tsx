import type { FC } from 'react';

export interface ReadingSpineStage {
  readonly id: string;
  readonly symbol: string;
  readonly title: string;
  readonly anchorId?: string;
}

export const DEFAULT_READING_SPINE_STAGES: readonly ReadingSpineStage[] = [];

export interface ReadingSpineProps {
  readonly stages?: readonly ReadingSpineStage[];
  readonly activeIndex?: number;
  readonly className?: string;
}

/**
 * ReadingSpine đã được hủy kích hoạt theo quy chuẩn giao diện tối giản "Bạch Dó",
 * giải phóng hoàn toàn lề trái trang đọc bài học.
 */
export const ReadingSpine: FC<ReadingSpineProps> = () => {
  return null;
};

export default ReadingSpine;
