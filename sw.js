// mixed update on reload with static cache

var cacheName = 'mws-restaurant-v1';
var urlsToCache = [
    '/',
    'js/dbhelper.js',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'css/styles.css',
    'data/restaurants.json',
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
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function(response) {
                cache.put(event.request, response.clone());
                return response;
            }).catch(()=>{
                if(navigator && !navigator.onLine) {
                    console.log('You are in offline mode and response of request is not cached! This is request:');
                    console.log(event.request);
                } else{
                    console.log('Fetching request filed :(. This is request:');
                    console.log(event.request);   
                }
            });
        });
      })
    );
  });