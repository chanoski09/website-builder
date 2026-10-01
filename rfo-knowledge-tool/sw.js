/* FORGE Service Worker — offline caching for RFO_tool.html + kb.json */
'use strict';

const CACHE_NAME = 'forge-v2-2026-10-01';
const PRECACHE = ['./RFO_tool.html', './kb.json', './updates.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('forge-') && k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle same-origin GET requests
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    (async () => {
      // Prefer the latest regulatory data and app shell while online.
      // Fall back to this release's cache only when the network is unavailable.
      const cache = await caches.open(CACHE_NAME);
      try {
        const res = await fetch(e.request, {cache: 'no-cache'});
        if (res.ok) {
          // A full/disabled cache must not discard a successful live response.
          await cache.put(e.request, res.clone()).catch(() => {});
          return res;
        }
        return (await cache.match(e.request)) || res;
      } catch (err) {
        return (await cache.match(e.request)) || new Response('FORGE is offline and this resource is not cached.', {
          status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
        });
      }
    })()
  );
});
