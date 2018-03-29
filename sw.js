var staticCacheName = 'mws-restaurant-v3'

self.addEventListener('install',(event)=>{
    var urlsToCache = [
        '/',
        //'//normalize-css.googlecode.com/svn/trunk/normalize.css',
        'js/dbhelper.js',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'data/restaurants.json'
    ];

    event.waitUntil(
        caches.open(staticCacheName).then((cache)=>{
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate',(event)=>{
    event.waitUntil( 
        caches.keys().then((cacheNames)=>{
            return Promise.all(
                cacheNames.filter((cacheName)=>{
                    debugger;
                    return cacheName.startsWith('mws-restaurant-v') && 
                        cacheName != staticCacheName;
                }).map((cacheName)=>{
                    debugger;
                    return caches.delete(cacheName);
                })
            );
        })
    )
});

self.addEventListener('fetch', (event)=>{
    event.respondWith(
        caches.match(event.request).then((response)=>{
            console.log(event.request.url);
            if(response) {
                //console.log('Take from cache' + event.request.url);
                return response;
            } 

            return fetch(event.request).then((response)=>{
                    if(response.status == 404) {
                        return new Response("Not found!");
                    }
                    // console.log('We have got repsonse: ');
                    // console.log(response);
                    return response;
                }).catch((err)=>{
                    return new Response(`Request failed! Error msg: ${err}`);
                })
        })
    );
});
