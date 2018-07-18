import idb from 'idb';
import CommonHelper from './commonHelper';
import HttpClient from './httpClient';

export default class DBHelper {
  get RESTAURANTS_DATABASE() { return 'restaurant-db'; }
  get RESTAURANTS_STORE() { return 'restaurants'; }
  get REVIEWS_STORE() { return 'reviews'; }
  get PENDING_STORE() { return 'pending'; }

  constructor() {
    this.httpClient = null;
    this.dbPromise = null;
  }
  
  initialise() {    
    this.httpClient = new HttpClient();
    this.dbPromise = this._openDatabase();
    return this.dbPromise.then((db=>{
       return this._updateDatabase();
    }).bind(this));
  }

  _openDatabase() {
    return idb.open(this.RESTAURANTS_DATABASE, 1, upgradeDB => {
      let restStore = upgradeDB.createObjectStore(this.RESTAURANTS_STORE, {keyPath: 'id'});  
      restStore.createIndex('cuisine', 'cuisine_type');
      restStore.createIndex('neighborhood', 'neighborhood');
      restStore.createIndex('cuisineNeighborhood', ['cuisine_type', 'neighborhood']);

      let reviewStore = upgradeDB.createObjectStore(this.REVIEWS_STORE, {keyPath: 'id'});
      reviewStore.createIndex('restaurantId','restaurant_id');

      upgradeDB.createObjectStore(this.PENDING_STORE, {
        keyPath: 'id',
        autoIncrement: true
      });
    });
  }

  _isDbUpdated() {
    return this.httpClient.getAllRestaurantsCount()
    .then((restaurantsCount => this.getRestaurantById(restaurantsCount)).bind(this))
    .then(val=>{
      return new Promise(resolve => {
        let isDbUpdated = false;
        if(val) isDbUpdated = true;
        resolve(isDbUpdated);
      });
    });
  }

  _updateDatabase() {
    return this._isDbUpdated().then(isDbUpdated=>{
      return new Promise((resolve, reject)=>{
        if(isDbUpdated) reject("Db is updated");
        resolve();
      });
    }).then(()=>{
      return this.httpClient.getAllRestaurants().then((restaurants => {

        let addRestaurantAndReviewPromises = [];
        for(let restaurant of restaurants) { 
          let addRestaurantPromise = this.addRestaurant(restaurant);
  
          let addReviewPromise = this.httpClient.getRestaurantReviews(restaurant.id).then((reviews => {
            let restaurantReviewsPromises = [];
            reviews.forEach((reveiw => {
              let reviewPromise = this.addReview(reveiw);
              restaurantReviewsPromises.push(reviewPromise);
            }).bind(this));
            return Promise.all(restaurantReviewsPromises);
          }).bind(this));

          addRestaurantAndReviewPromises.push(addRestaurantPromise);
          addRestaurantAndReviewPromises.push(addReviewPromise);
        }

        return Promise.all(addRestaurantAndReviewPromises);
      }).bind(this)).then(()=>{
        return true; //return success
      });
    },()=>{
      return true;
    });
  }

  //////////////////////////////////////    ADD       //////////////////////////////////////      

  addAllReviews(reviews) {
    let reviewsPromises = [];
    for(let review of reviews) { 
      let addReviewPromise = this.addReview(review);
      reviewsPromises.push(addReviewPromise);
    }
    return Promise.all(restaurantAndReviewsAddPromises);
  }

  addReview(review) {
    return this.dbPromise.then(db=>{
      const tx = db.transaction(this.REVIEWS_STORE,'readwrite');
      const reviewObjStore = tx.objectStore(this.REVIEWS_STORE); 
      reviewObjStore.add(review);
      return tx.complete;
    }).catch((err)=>{
      console.log(`Error while adding restaurant review ${review} to idb: ${err}`);
    });
  }

  addAllRestaurants(restaurants) {
    let restaurantsAddPromises = [];
    for(let restaurant of restaurants) { 
      let addRestaurantPromise = this.addRestaurant(restaurant);
      restaurantsAddPromises.push(addRestaurantPromise);
    }
    return Promise.all(restaurantsAddPromises);
  }

  addRestaurant(restaurant) {
    return this.dbPromise.then(db=>{
      const tx = db.transaction(this.RESTAURANTS_STORE,'readwrite');
      const restaurantObjStore = tx.objectStore(this.RESTAURANTS_STORE); 
      restaurantObjStore.add(restaurant);
      return tx.complete;
    }).catch(err => {
      console.log(`Error while adding restaurant ${restaurant} to idb: ${err}`);
    });
  }

  addPendingRequest(jsomStringParams) {
    return this.dbPromise.then(db => {
      const tx = db.transaction(this.PENDING_STORE,'readwrite');
      const pendingStore = tx.objectStore(this.PENDING_STORE); 
      pendingStore.add(jsomStringParams);
      return tx.complete;
    });
  }

  //////////////////////////////////////    UPDATE    //////////////////////////////////////

  updateRestaurantById(id, changedPropsOfRestaurant) {
    return this.dbPromise.then(db => {
      const tx = db.transaction(this.RESTAURANTS_STORE,'readwrite'); 
      tx.objectStore(this.RESTAURANTS_STORE).iterateCursor(cursor => { 
        if (!cursor) return;
        if(cursor.value.id && cursor.value.id === id) {
          CommonHelper.updateJsonObjByAnotherObj(cursor.value, changedPropsOfRestaurant);
          return cursor.update(cursor.value);
        }
        cursor.continue();
      });

      return tx.complete;
    }).catch(e => console.log(e));
  }

  //////////////////////////////////////    GET       ////////////////////////////////////// 

  getRestaurants() {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(this.RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(this.RESTAURANTS_STORE);
      return restaurantObjStore.getAll();
    }).catch((err)=>{
      return Promise.reject(err);
    });
  }

  getRestaurantById(id) {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(this.RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(this.RESTAURANTS_STORE);
      return restaurantObjStore.get(id);
    });
  }

  getReviewsByRestaurantId(restaurantId) {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(this.REVIEWS_STORE);
      const reviweObjectStore = tx.objectStore(this.REVIEWS_STORE);
      const reviwsByRestaurantIdIndex = reviweObjectStore.index('restaurantId');
      return reviwsByRestaurantIdIndex.getAll(restaurantId);
    })
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
  
  _getRestaurantsByIndex(databaseIndexName, filterValue) {
    return this.dbPromise.then((db)=>{
      const tx = db.transaction(this.RESTAURANTS_STORE);
      const restaurantObjStore = tx.objectStore(this.RESTAURANTS_STORE);
      const cuisineIndex = restaurantObjStore.index(databaseIndexName);
      return cuisineIndex.getAll(filterValue);
    })
    .catch((err)=>{
      return Promise.reject(err);
    });
  }
}
