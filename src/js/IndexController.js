import MainPage from './main';
import RestaurantInfoPage from './restaurant_info';
import Helpers from './helpers';
import DBHelper from './dbhelper';

export default class IndexController {
    constructor() {
      this.db = new DBHelper();
      this._registerServiceWorker();
      window.onhashchange = this.routingControl();
    }
    
    _registerServiceWorker() {
      if(!navigator.serviceWorker) {
        console.log('Service worker mechanism is not availiable');
        return;
      }
      
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // service worker is already installed
        if(!navigator.serviceWorker.controller) return;
        
        console.log(`Registered successfully: ${registration}`);
      }).catch((err)=>{
        console.log(`Registration failed: ${err}`);
      });
    };

    routingControl() {
        let restaurantId = Helpers.getParameterByName('id', window.location.href);
        if(restaurantId) {
            console.log('szczegóły restauracji o id = ' + restaurantId );
            this.page = new RestaurantInfoPage(this.db);
          } else {
            console.log('Ogólny widok.');
            this.page = new MainPage(this.db);
        }
    }
  }
  