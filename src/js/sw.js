// mixed 'on network response' service worker pattern(https://jakearchibald.com/2014/offline-cookbook/#on-network-response) with static cache

var cacheName = 'mws-restaurant-v1';
var urlsToCache = [
    '/',
    '/index.js',
    '/index.html',
    '/restaurant.html',
    'css/styles.css',
];

self.addEventListener('install',(event)=>{
    event.waitUntil(
        caches.open(cacheName).then((cache)=>{
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate',(event)=>{
    event.waitUntil(
        caches.keys().then((cacheNames)=>{
            return Promise.all(
                cacheNames.filter((cacheName)=>{
                    return cacheName.startsWith('mws-restaurant-v') &&
                        cacheName != cacheName;
                }).map((cacheName)=>{
                    return caches.delete(cacheName);
                })
            );
        })
    )
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        const url = new URL(event.request.url);
        if(url.pathname.startsWith('/restaurant.html')) {
            return cache.match('/restaurant.html').then(response => response || fetchReq(event.request, cache));
        }

        return cache.match(event.request).then(response => response || fetchReq(event.request, cache));
      })
    );
  });

function fetchReq(request, cache){
    return fetch(request).then(function(response) {    
        cache.put(request, response.clone());      
        return response;
    }).catch((err) => {
        if(navigator && !navigator.onLine) {
            console.log(`You are in offline mode and response of request is not cached! This is request: ${request}`);
        } else{
            console.log(`Fetching request filed :(. This is request: ${request}`);      
        }
        console.log(`Error obj: ${err}`);
    });
}