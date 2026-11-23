/**
 * Bộ lưu trữ ảnh nhị phân / DataURL nhẹ qua IndexedDB (~110 dòng, 0 dependency).
 * - Tách các chuỗi `data:image/...` lớn của Bảng viết và Soạn đề khỏi localStorage 5MB.
 * - Chỉ lưu tham chiếu gọn `idb://<assetId>` vào JSON của Zustand store.
 * - Có bộ nhớ đệm RAM đồng bộ và fallback an toàn cho môi trường jsdom / SSR / Private mode.
 */

export const IDB_MEDIA_PREFIX = 'idb://' as const;

const MEDIA_DB_NAME = 'learning-universe-media-v1';
const MEDIA_DB_VERSION = 1;
const MEDIA_STORE_NAME = 'media_assets';

interface MediaAssetRecord {
  readonly id: string;
  readonly dataUrl: string;
  readonly updatedAt: number;
}

const memoryCache = new Map<string, string>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

export function isIdbMediaUri(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith(IDB_MEDIA_PREFIX);
}

export function isInlineImageDataUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith('data:image/');
}

export function makeIdbMediaUri(assetId: string): string {
  return `${IDB_MEDIA_PREFIX}${assetId}`;
}

export function extractIdbAssetId(uri: string): string | null {
  if (!isIdbMediaUri(uri)) return null;
  const id = uri.slice(IDB_MEDIA_PREFIX.length).trim();
  return id.length > 0 ? id : null;
}

function generateMediaAssetId(prefix = 'media'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = window.indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
          db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

async function writeRecordToIdb(record: MediaAssetRecord): Promise<void> {
  const db = await openMediaDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      tx.objectStore(MEDIA_STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function readRecordFromIdb(id: string): Promise<string | null> {
  const db = await openMediaDb();
  if (!db) return null;
  return new Promise<string | null>((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const req = tx.objectStore(MEDIA_STORE_NAME).get(id);
      req.onsuccess = () => {
        const result = req.result as MediaAssetRecord | undefined;
        resolve(typeof result?.dataUrl === 'string' ? result.dataUrl : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Lưu một chuỗi ảnh `data:image/...` vào bộ nhớ đệm RAM + IndexedDB và trả về ngay tham chiếu `idb://<assetId>`.
 * Nếu đầu vào đã là `idb://...` thì trả về nguyên vẹn.
 */
export function storeMediaDataUrl(dataUrl: string, preferredId?: string): string {
  if (isIdbMediaUri(dataUrl)) return dataUrl;
  if (!isInlineImageDataUrl(dataUrl)) return dataUrl;

  const assetId = preferredId?.trim() || generateMediaAssetId();
  memoryCache.set(assetId, dataUrl);
  void writeRecordToIdb({ id: assetId, dataUrl, updatedAt: Date.now() });
  return makeIdbMediaUri(assetId);
}

/**
 * Tra cứu đồng bộ từ RAM cache (trả về ngay chuỗi ảnh gốc nếu có, tránh nhấp nháy khung ảnh).
 */
export function getMediaDataUrlSync(uriOrUrl: string | null | undefined): string | null {
  if (!uriOrUrl) return null;
  const assetId = extractIdbAssetId(uriOrUrl);
  if (!assetId) return uriOrUrl;
  return memoryCache.get(assetId) ?? null;
}

/**
 * Phân giải bất đồng bộ tham chiếu `idb://<assetId>` sang `data:image/...` (đọc RAM trước, rồi IndexedDB).
 */
export async function resolveMediaDataUrl(
  uriOrUrl: string | null | undefined,
): Promise<string | null> {
  if (!uriOrUrl) return null;
  const assetId = extractIdbAssetId(uriOrUrl);
  if (!assetId) return uriOrUrl;

  const cached = memoryCache.get(assetId);
  if (cached) return cached;

  const stored = await readRecordFromIdb(assetId);
  if (stored) {
    memoryCache.set(assetId, stored);
  }
  return stored;
}

export async function deleteMediaAsset(uriOrId: string | null | undefined): Promise<void> {
  if (!uriOrId) return;
  const assetId = extractIdbAssetId(uriOrId) ?? uriOrId;
  memoryCache.delete(assetId);

  const db = await openMediaDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      tx.objectStore(MEDIA_STORE_NAME).delete(assetId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function clearMediaMemoryCache(): void {
  memoryCache.clear();
}
