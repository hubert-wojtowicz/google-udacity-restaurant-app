(function(){
    if(!navigator.serviceWorker) {
      console.log("Service worker mechanism is not availiable");
      return;
    }
    navigator.serviceWorker.register("sw.js").then((registration)=>{
      console.log("Registered successfully!");
      console.log(registration);
    }).catch((err)=>{
      console.log(err);
    });
  })();
  