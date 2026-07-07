/* ATMAS Service Worker — cache-first para assets, network-first para Firestore */
var CACHE = "atmas-v10";
var STATIC = ["/", "/index.html", "/app.js", "/style.css", "/icon.png", "/manifest.json"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(STATIC); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  var url = e.request.url;
  /* Dejar pasar Firestore, Auth y cualquier API externa directamente a la red */
  if(url.indexOf("firestore.googleapis.com")!==-1 ||
     url.indexOf("firebase")!==-1 ||
     url.indexOf("googleapis.com")!==-1 ||
     url.indexOf("gstatic.com")!==-1 ||
     e.request.method !== "GET"){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var net = fetch(e.request).then(function(resp){
        if(resp && resp.status === 200 && resp.type !== "opaque"){
          var clone = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return resp;
      });
      return cached || net;
    })
  );
});
