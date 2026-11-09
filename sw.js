// Service worker – aplikace běží celá offline.
// Při změně souborů zvyš VERSION, aby se v telefonu stáhla nová verze.
const VERSION = 'v4';
const CACHE = 'treninkovy-denik-' + VERSION;
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'fonts/fonts.css',
  'fonts/Barlow-400-latin-ext.woff2',
  'fonts/Barlow-400-latin.woff2',
  'fonts/Barlow-500-latin-ext.woff2',
  'fonts/Barlow-500-latin.woff2',
  'fonts/Barlow-600-latin-ext.woff2',
  'fonts/Barlow-600-latin.woff2',
  'fonts/BarlowCondensed-500-latin-ext.woff2',
  'fonts/BarlowCondensed-500-latin.woff2',
  'fonts/BarlowCondensed-600-latin-ext.woff2',
  'fonts/BarlowCondensed-600-latin.woff2',
  'fonts/BarlowCondensed-700-latin-ext.woff2',
  'fonts/BarlowCondensed-700-latin.woff2',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('treninkovy-denik-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Nejdřív z cache (rychlé a funguje bez signálu), na pozadí se cache obnoví ze sítě.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key, {ignoreSearch: true});
    const net = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', {status: 503, statusText: 'Offline'});
  }));
});
