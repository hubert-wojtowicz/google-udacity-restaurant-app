var host = "localhost";
var cacheName = 'mws-restaurant-v1';
var urlsToCache = [
    '/',
    '/index.js',
    '/index.html',
    '/restaurant.html',
    'css/styles.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then( cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', event =>{
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('mws-restaurant-v') &&
                        cacheName != cacheName;
                }).map((cacheName)=>{
                    return caches.delete(cacheName);
                })
            );
        })
    )
});

self.addEventListener('fetch', event => {
    event.respondWith(
      caches.open(cacheName).then(cache => {
        const url = new URL(event.request.url);

        if(url.hostname.indexOf(host) !== -1)
            return cache.match(event.request).then(response => 
                response || fetchReq(event.request, cache));
        
        return fetch(event.request);
      })
    );
});

function fetchReq(request, cache){
    return fetch(request).then(response => {  
        if(request.method === 'GET')   
            cache.put(request, response.clone()); 

        return response;
    }).catch(err => {
        if(navigator && !navigator.onLine) {
            console.log(`You are in offline mode and response of request is not cached! This is request: ${request}`);
        } 
        else {
            console.log(`Fetching request filed :(. This is request: ${request}`);      
        }
        console.log(`Error obj: ${err}`);
    });
}