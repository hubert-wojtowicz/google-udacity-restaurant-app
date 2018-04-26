import idb from 'idb';

var RESTAURANTS_STORE = 'restaurants';

/**
 * Common database helper functions.
 */
export default class DBHelper {
  constructor() {
    this.dbPromise = this.openDatabase();
    this.updateDatabase();
  }

  openDatabase() {
    return idb.open('restaurant', 1, upgradeDB => {
      let restStore = upgradeDB.createObjectStore(RESTAURANTS_STORE, {keyPath: 'id'});
      restStore.createIndex('cousine', 'cuisine_type');
      restStore.createIndex('neighborhood', 'neighborhood');
    });
  }

  updateDatabase() {
    this.fetchRestaurants((error, fetchedRestaurants) => {
      if(error) {
        console.log(`Error while fetching restaurants ${error}`);
        return;
      }
      for(let fetchedRestaurant of fetchedRestaurants) {  
        this.getRestaurantById(fetchedRestaurant.id)
        .then((restaurant)=>{
          if(restaurant) return;
          this.addRestaurant(fetchedRestaurant);
        }).catch((err)=>{
          console.log(err);
        })
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
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE,'readwrite');
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE); 
      restaurantObjStore.put(restaurant);
      return tx.complete;
    });
  }

  getRestaurants() {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE);
      return restaurantObjStore.getAll();
    }).catch((err)=>{
      return Promise.reject(err);
    })
  }
  _getRestaurantsByIndex(databaseIndexName, filterValue) {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(RESTAURANTS_STORE);
      const cousineIndex = restaurantObjStore.index(databaseIndexName);
      return cousineIndex.getAll(filterValue);
    })
    .catch((err)=>{
      return Promise.reject(err);
    })
  }

  getRestaurantsByCousine(cousine) {
    return this._getRestaurantsByIndex('cousine', cousine);
  }

  getRestaurantsByNeighborhood(neighborhood) {
    return this._getRestaurantsByIndex('neighborhood', neighborhood);
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
   * Fetch a restaurant by its ID.
   */
  fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  fetchNeighborhoods(callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  fetchCuisines(callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
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

  /**
   * Map marker for a restaurant.
   */
  mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}
