#!/usr/bin/env node
/**
 * Kiểm toán tự động 40 ảnh Di sản trong `src/components/home/HeritageArtShowcase.tsx`.
 *
 * - Kiểm tra đủ 40 mục không trùng URL.
 * - Với đường dẫn nội bộ (`/assets/...`): kiểm tra file tồn tại trong `public/`.
 * - Với URL HTTPS: gửi yêu cầu `HEAD` (hoặc `GET` nhẹ với `Range: bytes=0-1023`) kèm `User-Agent`
 *   hợp lệ, timeout 8s, concurrency 6 và tự thử lại khi gặp giới hạn tốc độ 429.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const HERITAGE_SOURCE = path.resolve(ROOT_DIR, 'src/components/home/HeritageArtShowcase.tsx');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

const REQUEST_TIMEOUT_MS = 8000;
const CONCURRENCY = 2;
const REQUEST_SPACING_MS = 350;
const MAX_ATTEMPTS = 5;
const USER_AGENT =
  'LearningUniverseHeritageAudit/2.0 (https://learning-universe.edu.vn; contact@learning-universe.edu.vn)';

function extractHeritageItems(sourceText) {
  const arrayStart = sourceText.indexOf('export const HERITAGE_ARTWORKS');
  if (arrayStart === -1) {
    throw new Error('Không tìm thấy mảng HERITAGE_ARTWORKS trong HeritageArtShowcase.tsx');
  }
  const arraySlice = sourceText.slice(arrayStart);
  const endMarker = arraySlice.indexOf('] as const;');
  const body = endMarker !== -1 ? arraySlice.slice(0, endMarker) : arraySlice;

  const items = [];
  const blockRegex =
    /\{\s*id:\s*'([^']+)'[\s\S]*?shortTitle:\s*'([^']+)'[\s\S]*?imageSrc:\s*(?:\r?\n\s*)?'([^']+)'/g;
  let match;
  while ((match = blockRegex.exec(body)) !== null) {
    items.push({
      index: items.length + 1,
      id: match[1],
      shortTitle: match[2],
      imageSrc: match[3],
    });
  }
  return items;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

async function verifyImageItem(item) {
  const src = item.imageSrc.trim();

  // 1. Kiểm tra đường dẫn local trong public/
  if (src.startsWith('/')) {
    const localPath = path.join(PUBLIC_DIR, src.replace(/^\/+/, ''));
    if (existsSync(localPath) && statSync(localPath).size > 0) {
      return { ...item, ok: true, status: 'LOCAL_OK', detail: localPath };
    }
    return { ...item, ok: false, status: 'LOCAL_MISSING', detail: `Thiếu tệp ${localPath}` };
  }

  // 2. Kiểm tra URL HTTPS hợp lệ
  if (!/^https:\/\//i.test(src)) {
    return {
      ...item,
      ok: false,
      status: 'INVALID_URL',
      detail: 'Đường dẫn không phải HTTPS hoặc local asset',
    };
  }

  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      let res = await fetchWithTimeout(src, { method: 'HEAD', headers });

      // Một số CDN/host từ chối HEAD (405/403) -> fallback GET nhẹ 1KB
      if (res.status === 405 || res.status === 403) {
        res = await fetchWithTimeout(src, {
          method: 'GET',
          headers: { ...headers, Range: 'bytes=0-1023' },
        });
      }

      if (res.status === 429 && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number.parseInt(res.headers.get('retry-after') ?? '', 10);
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2500 * attempt;
        await sleep(Math.min(waitMs, 12000));
        continue;
      }

      if (res.status === 200 || res.status === 206) {
        const contentType = res.headers.get('content-type') ?? '';
        if (
          contentType &&
          !contentType.startsWith('image/') &&
          !contentType.includes('octet-stream')
        ) {
          return {
            ...item,
            ok: false,
            status: `BAD_CONTENT_TYPE(${contentType})`,
            detail: src,
          };
        }
        return { ...item, ok: true, status: `HTTP ${res.status}`, detail: contentType || 'image' };
      }

      return { ...item, ok: false, status: `HTTP ${res.status}`, detail: src };
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(800 * attempt);
        continue;
      }
      const msg = err instanceof Error ? err.message : String(err);
      return { ...item, ok: false, status: 'NETWORK_ERROR', detail: msg };
    }
  }

  return { ...item, ok: false, status: 'FAILED', detail: src };
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const idx = cursor;
      cursor += 1;
      results[idx] = await worker(items[idx]);
      if (cursor < items.length) {
        await sleep(REQUEST_SPACING_MS);
      }
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => next());
  await Promise.all(runners);
  return results;
}

async function main() {
  const source = readFileSync(HERITAGE_SOURCE, 'utf8');
  const items = extractHeritageItems(source);

  console.log('===================================================================');
  console.log(`KIỂM TOÁN ẢNH DI SẢN — ĐÃ TRÍCH XUẤT ${items.length} TÁC PHẨM`);
  console.log('===================================================================');

  if (items.length !== 40) {
    console.error(`[FAIL] Kỳ vọng đúng 40 tác phẩm di sản nhưng tìm thấy ${items.length}.`);
    process.exit(1);
  }

  const uniqueUrls = new Set(items.map((item) => item.imageSrc.trim()));
  if (uniqueUrls.size !== items.length) {
    console.error(
      `[FAIL] Phát hiện URL ảnh trùng lặp (${uniqueUrls.size}/${items.length} URL duy nhất).`,
    );
    process.exit(1);
  }

  const results = await runPool(items, CONCURRENCY, verifyImageItem);
  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;

  for (const r of results) {
    const num = String(r.index).padStart(2, '0');
    const tag = r.ok ? 'PASS' : 'FAIL';
    console.log(
      `  [${tag}] #${num} ${r.id} (${r.shortTitle}) — ${r.status}${r.ok ? '' : ` | ${r.detail}`}`,
    );
  }

  console.log('===================================================================');
  console.log(`KẾT QUẢ: ${passed}/${results.length} ảnh Di sản hợp lệ (${failed.length} lỗi).`);
  console.log('===================================================================');

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
