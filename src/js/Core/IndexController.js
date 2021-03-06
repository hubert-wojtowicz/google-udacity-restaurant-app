import MainPage from '../Pages/mainPage';
import RestaurantInfoPage from '../Pages/restaurantInfoPage';
import CommonHelper from './commonHelper';
import DBHelper from './dbHelper';

export default class IndexController {
    constructor() {
      this.db = new DBHelper();
      this._registerServiceWorker();
      window.onhashchange = this._routingControl();
    }
    
    _registerServiceWorker() {
      if(!navigator.serviceWorker) {
        console.log('Service worker mechanism is not availiable');
        return;
      }
      
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // service worker is already installed
        if(!navigator.serviceWorker.controller) return;
        
        console.log('Registered successfully: ',registration);
      }).catch((err)=>{
        console.log(`Registration failed: ${err}`);
      });
    };

    _routingControl() {
      let restaurantId = CommonHelper.getParameterByName('id');
      if(restaurantId) {
          this.page = new RestaurantInfoPage(this.db);
        } else {
          this.page = new MainPage(this.db);
      }
    }
  }
  