import { useCallback, useState } from 'react';
import { useReadingSettings } from './ReadingSettingsContext';

/**
 * Đồng bộ trạng thái đóng/mở của khối Ví dụ / Chứng minh với chế độ "Đọc lướt định lý":
 * - Tự động thu gọn toàn bộ khi bật Đọc lướt định lý (`isSkimmingMode = true`).
 * - Vẫn cho phép người học tự mở/đóng từng khối riêng lẻ bất kỳ lúc nào.
 * - Khi đổi trạng thái Đọc lướt định lý, tất cả khối tự đồng bộ lại theo chế độ mới mà không cần useEffect.
 */
export function useSkimmableOpen(defaultOpenWhenNotSkimming = true): {
  readonly isOpen: boolean;
  readonly toggle: () => void;
  readonly setOpen: (nextOpen: boolean) => void;
} {
  const { isSkimmingMode } = useReadingSettings();
  const [override, setOverride] = useState<{
    readonly skimMode: boolean;
    readonly open: boolean;
  } | null>(null);

  const isOpen =
    override !== null && override.skimMode === isSkimmingMode
      ? override.open
      : isSkimmingMode
        ? false
        : defaultOpenWhenNotSkimming;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      setOverride({ skimMode: isSkimmingMode, open: nextOpen });
    },
    [isSkimmingMode],
  );

  const toggle = useCallback(() => {
    setOverride({ skimMode: isSkimmingMode, open: !isOpen });
  }, [isSkimmingMode, isOpen]);

  return { isOpen, toggle, setOpen };
}
