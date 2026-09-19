/* SiteBooks service worker — lets the app install to the home screen and open with no signal.
   Network-first: when online you always get the newest version; the cached copy is only a fallback.
   Cross-origin requests (Firestore, fonts, PDF/Excel libraries) are NEVER touched, so live data is never served stale. */
const CACHE='sitebooks-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  e.respondWith(
    fetch(req).then(res=>{ if(res&&res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); } return res; })
      .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
  );
});
