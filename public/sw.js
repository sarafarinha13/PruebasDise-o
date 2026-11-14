// Service worker: red primero para la navegación, caché para el resto (funciona sin conexión).
const CACHE = 'radar-v3'
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/manifest.webmanifest', '/icon.svg']))); self.skipWaiting() })
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())))
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  const nav = e.request.mode === 'navigate'
  e.respondWith(
    nav
      ? fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put('/', c)); return r }).catch(() => caches.match('/'))
      : caches.match(e.request).then(h => h || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r }))
  )
})
