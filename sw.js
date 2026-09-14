// Minimal service worker - only what's needed to satisfy Chrome/Android's
// "installable" requirement so the app can be added to the home screen and
// launch full-screen like a native app. It does not cache the data calls
// (those always go to the live Apps Script backend); it just caches the app
// shell so the icon opens instantly.
var CACHE_NAME = 'warehousekeeper-shell-v1';
var SHELL_FILES = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(SHELL_FILES); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  // Never intercept calls to the Apps Script backend - always go live to the network.
  if(url.indexOf('script.google.com') !== -1) return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});
