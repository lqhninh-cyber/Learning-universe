import { useEffect, useState } from 'react';
import { getMediaDataUrlSync, isIdbMediaUri, resolveMediaDataUrl } from '@/utils/mediaDb';

/**
 * Hook phân giải mượt cả đường dẫn thường/dataURL lẫn tham chiếu `idb://<assetId>`.
 * Trả về đồng bộ ngay từ RAM cache nếu vừa lưu, hoặc tự động nạp từ IndexedDB sau khi reload.
 */
export function useResolvedMediaUrl(uriOrUrl: string | null | undefined): string | null {
  const syncValue = getMediaDataUrlSync(uriOrUrl);
  const [asyncResolved, setAsyncResolved] = useState<{
    readonly source: string;
    readonly value: string | null;
  } | null>(null);

  useEffect(() => {
    if (!uriOrUrl || !isIdbMediaUri(uriOrUrl) || syncValue !== null) {
      return;
    }

    let cancelled = false;
    void resolveMediaDataUrl(uriOrUrl).then((resolved) => {
      if (!cancelled) {
        setAsyncResolved({ source: uriOrUrl, value: resolved });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [syncValue, uriOrUrl]);

  if (!uriOrUrl) return null;
  if (syncValue !== null) return syncValue;
  if (asyncResolved?.source === uriOrUrl) return asyncResolved.value;
  return null;
}
