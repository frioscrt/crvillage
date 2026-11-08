// Service worker tối giản cho Bên Kia Bức Tường: luôn lấy bản mới nhất từ mạng, chỉ dùng bản lưu khi mất mạng.
// Không đụng tới ván lưu (ván lưu nằm trong bộ nhớ trình duyệt, không qua đây).
const CACHE = 'crv-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './manifest.webmanifest', './pwa/icon-192.png'])).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;  // không đụng tới Google (phiếu, bảng tính)
  e.respondWith(
    fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./')))
  );
});
