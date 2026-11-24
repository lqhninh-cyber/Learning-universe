/* Learning Universe — Offline Lecture-Hall Service Worker (Local-First PWA) */
const CACHE_NAME = 'lu-academic-os-v2';
const CORE_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/logo-laxanh.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key.startsWith('lu-academic-os-') && key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Chỉ xử lý tài nguyên cùng nguồn gốc (tuyệt đối không lưu đệm các API xác thực Supabase bên ngoài)
  if (url.origin !== self.location.origin) return;

  // 1. Điều hướng trang SPA (HTML): Ưu tiên mạng, rớt mạng tại giảng đường thì trả về vỏ index.html đã lưu
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return networkRes;
        })
        .catch(() =>
          caches
            .match(request)
            .then((matched) => matched || caches.match('/') || caches.match('/index.html')),
        ),
    );
    return;
  }

  // 2. Tài nguyên tĩnh (JS chunks bài giảng, CSS, font KaTeX, hình minh họa): Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(?:js|css|woff2?|ttf|svg|png|jpe?g|webp|webmanifest)$/i.test(url.pathname);

  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cachedResponse) => {
        const networkPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkPromise;
      }),
    ),
  );
});
