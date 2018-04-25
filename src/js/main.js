export default class MainPage {
  constructor(db) {
    this.restaurants = null;
    this.neighborhoods = null;
    this.cuisines = null;
    this.map = null;
    this.markers = [];
    this.db = db;
    /**
     * Fetch neighborhoods and cuisines as soon as the page is loaded.
     */
    document.addEventListener('DOMContentLoaded', (event) => {
      this.fetchNeighborhoods();
      this.fetchCuisines();
      
      let nSel =  document.getElementById('neighborhoods-select');
      let cSel =  document.getElementById('cuisines-select');
      
      nSel.addEventListener('change',() => this.updateRestaurants());
      cSel.addEventListener('change',() => this.updateRestaurants());
    });
        
    /**
     * Initialize Google map, called from HTML.
     */
    window.initMap = () => {
      let loc = {
        lat: 40.722216,
        lng: -73.987501
      };
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
      });
      this.updateRestaurants();
    }
  }
  
  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchNeighborhoods() {
    this.db.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        this.neighborhoods = neighborhoods;
        this.fillNeighborhoodsHTML();
      }
    });
  }
  
  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    this.neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  }
  
  /**
   * Fetch all cuisines and set their HTML.
   */
  fetchCuisines() {
    this.db.fetchCuisines((error, cuisines) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        this.cuisines = cuisines;
        this.fillCuisinesHTML();
      }
    });
  }
  
  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById('cuisines-select');
  
    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }

  
  /**
   * Update page and map for current restaurants.
   */
  updateRestaurants() {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');
  
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;
  
    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;
  
    this.db.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        this.resetRestaurants(restaurants);
        this.fillRestaurantsHTML();
      }
    })
  }
  
  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants(restaurants) {
    // Remove all restaurants
    this.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
  
    // Remove all map markers
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
    this.restaurants = restaurants;
  }
  
  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML(restaurants = this.restaurants) {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    this.addMarkersToMap();
  }
  
  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const li = document.createElement('li');
  
    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.alt = restaurant.alt;
    if(restaurant.photograph){
      image.src = this.db.imageUrlForRestaurant(restaurant,'-270min1x');
      let srcset = `${this.db.imageUrlForRestaurant(restaurant,'-270min1x')} 1x, ${this.db.imageUrlForRestaurant(restaurant,'-540min2x')} 2x, ${this.db.imageUrlForRestaurant(restaurant,'-800')} 3x`;
      image.setAttribute('srcset',srcset);
    } else {
      image.src = this.db.imageUrlForRestaurant();
    }
    li.append(image);
  
    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    li.append(name);
  
    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);
  
    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);
  
    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = this.db.urlForRestaurant(restaurant);
    li.append(more)
  
    return li;
  }
  
  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = this.db.mapMarkerForRestaurant(restaurant, this.map);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url
      });
      this.markers.push(marker);
    });
  }
}
