// mixed 'on network response' service worker pattern(https://jakearchibald.com/2014/offline-cookbook/#on-network-response) with static cache

const cacheName = 'mws-restaurant-v1';
const pictureSufixes = ['-270min1x.jpg', '-540min2x.jpg', '-800.jpg'];
var picturesToCache = pictureNames('img-resized/');
const urlsToCache = [
    '/',
    '/index.js',
    '/sw.js',
    '/index.html',
    '/restaurant.html',
    'js/dbhelper.js',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'css/styles.css',
    'data/restaurants.json'
];

function pictureNames(path) {
    let names = new Array();
    const numberOfPict = 10;
    for(let i=1;i<=10;i++) {
        pictureSufixes.forEach((val, index)=>{
            names.push(`${path}${i}${val}`)
        })
    }
    return names;
}

self.addEventListener('install',(event)=>{
    event.waitUntil(
        caches.open(cacheName).then((cache)=>{
            return cache.addAll(urlsToCache.concat(picturesToCache));
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
            return cache.match('/restaurant.html').then(response => {
                return response || fetchReq(event.request, cache);///restaurant.html
            });
        }

        return cache.match(event.request).then(response => {
            return response || fetchReq(event.request, cache);
        });
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