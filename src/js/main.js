class MapManager {
  constructor() {
    this.expanded = false;
    this.loaded = false;
    this.mapContainer = document.getElementById("map");
    this.mapButton = document.getElementById("show-map");

    this.mapButton.addEventListener('click', this.expandOrCollapseMap.bind(this));
  }

  expandOrCollapseMap(eventArgs) {
    let clickedButton = eventArgs.currentTarget;
    this.changeMapIcon(clickedButton);
    this.changeMapHeight();

    this.expanded = !this.expanded;
  }

  changeMapIcon(buttonParent) {
    buttonParent.children[0].classList.toggle("far", this.expanded);
    buttonParent.children[0].classList.toggle("fas", !this.expanded);
  }

  changeMapHeight() {
    if(this.expanded) {
      this.mapContainer.classList.add("collapsed");
      this.mapContainer.classList.remove("expanded");
    } else {
      this.mapContainer.classList.add("expanded");
      this.mapContainer.classList.remove("collapsed");
    }
  }
}


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
      this.getNeighborhoods();
      this.getCuisines();
      
      let nSel =  document.getElementById('neighborhoods-select');
      let cSel =  document.getElementById('cuisines-select');
      
      nSel.addEventListener('change',() => this.updateRestaurants());
      cSel.addEventListener('change',() => this.updateRestaurants());
    });
    var mapManager = new MapManager(document);
    
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
    }
    //this.updateRestaurants();
  }

  /**
   * Get all neighborhoods and set their HTML.
   */
  getNeighborhoods() {
    this.db.getNeighborhoods().then((neighborhoods)=>{
      this.neighborhoods = neighborhoods;
      this.fillNeighborhoodsHTML();
    }).catch((error)=>{
      console.error(error);
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
   * Get all cuisines and set their HTML.
   */
  getCuisines() {
    this.db.getCuisines().then((cuisines)=>{
      this.cuisines = cuisines;
      this.fillCuisinesHTML();
    }).catch((error)=>{
      console.error(error);
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
    
    this.db.getRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then((restaurants)=>{
      this.resetRestaurants(restaurants);
      this.fillRestaurantsHTML();
    }).catch((error)=>{
      console.error(error);
    });
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
    //this.addMarkersToMap();
  }
  
  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const li = document.createElement('li');
  
    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.alt = `Picture representing the ${restaurant.name}`;
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
