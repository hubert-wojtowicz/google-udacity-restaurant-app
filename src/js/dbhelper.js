import idb from 'idb';
import CommonHelper from './CommonHelper';

var RESTAURANTS_STORE = 'restaurants';
var RESTAURANTS_DATABASE = 'restaurant-db';

/**
 * Common database helper functions.
 */
export default class DBHelper {
  constructor() {
    this.dbPromise = this.openDatabase();
    var dbhelper = this;
    this.dbPromise.then((db)=>{
      dbhelper.updateDatabase();
    });
  }

  openDatabase() {
    return idb.open(RESTAURANTS_DATABASE, 1, upgradeDB => {
      let restStore = upgradeDB.createObjectStore(RESTAURANTS_STORE, {keyPath: 'id'});  
      restStore.createIndex('cuisine', 'cuisine_type');
      restStore.createIndex('neighborhood', 'neighborhood');
      restStore.createIndex('cuisineNeighborhood', ['cuisine_type', 'neighborhood']);
    });
  }

  updateDatabase() {
    // todo: updating db maybe by index 'updatedAt'
    // for now if id=10 is in idb then no fetch from server
    this.getRestaurantById(10).then((val)=>{

      if(!val) {
        this.fetchRestaurants((error, fetchedRestaurants) => {
          if(error) {
          console.log(`Error while fetching restaurants: ${error}`);
          return;
          }  

          for(let fetchedRestaurant of fetchedRestaurants) {  
            this.getRestaurantById(fetchedRestaurant.id).then((restaurant)=>{
              if(restaurant) return;
              this.addRestaurant(fetchedRestaurant);
            }).catch((err)=>{
              console.log(err);
            })
          } 
        });
      }

    });
  }

  getRestaurantById(id) {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE);
      return restaurantObjStore.get(id);
    }).catch((err)=>{
      return Promise.reject(err);
    })
  }

  addRestaurant(restaurant) {
    this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE,'readwrite');
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE); 
      restaurantObjStore.put(restaurant);
      return tx.complete;
    }).catch((err)=>{
      console.log(`Error while adding restaurant ${restaurant} to idb: ${err}`);
    });
  }

  getRestaurants() {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE);
      return restaurantObjStore.getAll();
    }).catch((err)=>{
      return Promise.reject(err);
    });
  }

  _getRestaurantsByIndex(databaseIndexName, filterValue) {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE);
      const cuisineIndex = restaurantObjStore.index(databaseIndexName);
      return cuisineIndex.getAll(filterValue);
    })
    .catch((err)=>{
      return Promise.reject(err);
    });
  }

  getRestaurantsByCuisine(cuisine) {
    return this._getRestaurantsByIndex('cuisine', cuisine);
  }

  getRestaurantsByNeighborhood(neighborhood) {
    return this._getRestaurantsByIndex('neighborhood', neighborhood);
  }

  getRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    const all = "all";
    if(cuisine !== all) {
      if(neighborhood !== all) {
        return this._getRestaurantsByIndex('cuisineNeighborhood', [cuisine, neighborhood]);
      } else {
        // cuisine !== all AND neighborhood === all
        return this._getRestaurantsByIndex('cuisine', cuisine);
      }
    } else {
      if(neighborhood !== all) {
        // cuisine === all AND neighborhood !== all
        return this._getRestaurantsByIndex('neighborhood', neighborhood);
      } else {
        // cuisine === all AND neighborhood === all
        return this.getRestaurants();
      }
    }
  } 

  getCuisines() {
    return this._getRestaurantsByIndex('cuisine')
    .then((val)=>{
      const cuisineDuplicated = val.map(r => r.cuisine_type);
      const cuisineUnique = Array.from(new Set(cuisineDuplicated));
      return new Promise((resolve,reject) => resolve(cuisineUnique));
    });
  }

  getNeighborhoods() {
    return this._getRestaurantsByIndex('neighborhood')
    .then((val)=>{
      const neighborhoodDuplicated = val.map(r => r.neighborhood);
      const neighborhoodUnique = Array.from(new Set(neighborhoodDuplicated));
      return new Promise((resolve,reject) => resolve(neighborhoodUnique));
    });
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  
  /**
   * Fetch all restaurants.
   */
  fetchRestaurants(callback) {
    let req = new Request(this.DATABASE_URL);
    fetch(req).then(response => response.json())
    .then(restaurants => {
      console.log(restaurants);
      callback(null, restaurants);
    })
    .catch((err) => {
      const error = (`Request failed. Returned status of ${req.status}`);
      callback(err, null)
    })
  }

  /**
   * Restaurant image URL.
   */
  imageUrlForRestaurant(restaurant = null, resizeVersion = null) {
    if(!restaurant || !restaurant.photograph)
      return `/img/noImage.svg`;

    return resizeVersion ? 
    `/img/${restaurant.photograph}${resizeVersion}.jpg` :
    `/img/${restaurant.photograph}.jpg` ;
  }

}
