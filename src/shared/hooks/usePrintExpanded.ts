import { useEffect, useState } from 'react';

/**
 * Tự động mở rộng các khối nội dung thu gọn (Chứng minh, Ví dụ, Gợi ý, Lời giải)
 * trong suốt quá trình in trang (`beforeprint` -> `afterprint` hoặc `matchMedia('print')`).
 */
export function usePrintExpanded(): boolean {
  const [isPrinting, setIsPrinting] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('print').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleBeforePrint = () => {
      setIsPrinting(true);
    };

    const handleAfterPrint = () => {
      setIsPrinting(false);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    const mediaQuery = typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsPrinting(event.matches);
    };

    mediaQuery?.addEventListener?.('change', handleMediaChange);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      mediaQuery?.removeEventListener?.('change', handleMediaChange);
    };
  }, []);

  return isPrinting;
}
