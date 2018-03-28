self.addEventListener('fetch', (event)=>{
    event.respondWith(
        fetch(event.request).then((response)=>{
            if(response.status == 404) {
                return new Response("Not found!");
            }
            console.log('We have got repsonse: ');
            console.log(response);
            return response;
        }).catch((err)=>{
            console.log(err);
            return new Response("Request failed!");
        })
    );
});