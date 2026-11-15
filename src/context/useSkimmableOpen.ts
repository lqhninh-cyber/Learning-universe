import { useCallback, useState } from 'react';

/**
 * Hook quản lý trạng thái đóng/mở cục bộ cho các khối Ví dụ, Chứng minh và Ghi chú học thuật.
 */
export function useSkimmableOpen(defaultOpen = true): {
  readonly isOpen: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly toggle: () => void;
} {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const setOpen = useCallback((nextOpen: boolean) => {
    setIsOpen(nextOpen);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, setOpen, toggle };
}
