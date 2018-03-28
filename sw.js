console.log('hello from sw.js');

self.addEventListener('install', (event)=>{
    console.log(event);
    console.log("installl!!!!");

});

// self.addEventListener('fetch',(event) => {
//     debugger;
//     //console.log(event.request);
// });