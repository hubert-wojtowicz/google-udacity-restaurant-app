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
        'data/restaurants.json',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
        'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu7GxKOzY.woff2',
        'https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4.woff2'
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
                    return cacheName.startsWith('mws-restaurant-v') && 
                        cacheName != staticCacheName;
                }).map((cacheName)=>{
                    return caches.delete(cacheName);
                })
            );
        })
    )
});

self.addEventListener('fetch', (event)=>{
    event.respondWith(
        caches.match(event.request).then((response)=>{
            if(response) {
                console.log('Take from cache' + event.request.url);
                return response;
            } 

            return fetch(event.request).then((response)=>{
                    if(response.status == 404) {
                        return new Response("Not found!");
                    }
                    console.log('Take from outside world: '+event.request.url);
                    return response;
                }).catch((err)=>{
                    return new Response(`Request failed! Error msg: ${err}`);
                })
        })
    );
});
