'use strict';
// A separate scope/cache preserves the original application's offline behavior.
const CACHE='forgealt-v4-2026-10-10';
const FILES=['./','./index.html','./styles.css','./compare-core.js','./app.js','./mappings.json','./agent-config.json','../kb.json','../updates.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('forgealt-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(e.request,{cache:'no-cache'});if(response.ok)await cache.put(e.request,response.clone()).catch(()=>{});return response.ok?response:(await cache.match(e.request))||response;}catch{return(await cache.match(e.request))||new Response('Offline: open this version once while connected to cache its files.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());});
