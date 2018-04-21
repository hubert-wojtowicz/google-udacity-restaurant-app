import MainPage from "./main";

export default class IndexController {
    constructor() {
      this._registerServiceWorker();
      window.onhashchange = this.routingControl();
    }
    
    _registerServiceWorker() {
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
    };

    routingControl() {
        let restaurantId = this._getRestaurantIdFromCurrentLocation();
        if(restaurantId) {
            console.log('szczegóły restauracji o id = ' + restaurantId );
          } else {
            console.log('Ogólny widok.');
            this.page = new MainPage();
        }
    }

    _getRestaurantIdFromCurrentLocation() {
        return (new URL(document.location)).search.split('=')[1];
    }
  }