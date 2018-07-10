import CommonHelper from '../Core/commonHelper';
import MapManager from '../Managers/mapManager';
import ReviewFormManager from '../Managers/reviewFormManager';

export default class RestaurantInfoPage {
  constructor(db) {
    this.db = db;
    this.restaurant = null;
    this.mapManager = null;
    this.reviewFormManager = null;
    
    document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded.bind(this));
  }
  
  onDOMContentLoaded(event) {
    this.db.initialise().then((success=>{
      if(!success) return Promise.rejects('Db initialise failed')

      this.getRestaurantFromURL()
      .then(restaurant => {
        this.mapManager = new MapManager([restaurant], true);
  
        const reviewFormContainer = document.getElementById('review-form');
        this.reviewFormManager = new ReviewFormManager(restaurant, reviewFormContainer, this.db);
  
        this.fillBreadcrumb();
        this.fillRestaurantHTML(restaurant);
      })
      .catch(err => {
        console.log(err);
      });
    }).bind(this));
    
  }

  /**
   * Get current restaurant from page URL.
   */
  getRestaurantFromURL() {
    if (this.restaurant) {
      return Promise.resolve(this.restaurant);
    }
    const id = CommonHelper.getParameterByName('id');
    if (!id) {
      return Promise.reject('No restaurant id in URL');
    } else {
      return this.db.getRestaurantById(id).then((restaurant)=>{
        this.restaurant = restaurant;
        return Promise.resolve(restaurant);
      }).catch((err)=>{       
        return Promise.reject(err);
      });
    }
  }
  
  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant = this.restaurant) {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
  
    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    
    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.alt = `Picture representing the ${restaurant.name}`;
    if(restaurant.photograph){
      image.src = CommonHelper.imageUrlForRestaurant(restaurant, '-270min1x');
      image.srcset = 
        `${CommonHelper.imageUrlForRestaurant(restaurant, '-800')} 800w, 
        ${CommonHelper.imageUrlForRestaurant(restaurant, '-540min2x')} 540w,
        ${CommonHelper.imageUrlForRestaurant(restaurant, '-270min1x')} 270w`;
    } else {
      image.src = CommonHelper.imageUrlForRestaurant();
    }
    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
  
    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.db.getReviewsByRestaurantId(this.restaurant.id).then(restaurantReviews =>{
      this.reviewFormManager.fillReviewsHTML(restaurantReviews);
    });
  }
  
  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(operatingHours = this.restaurant.operating_hours) {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
      const row = document.createElement('tr');
  
      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);
  
      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);
  
      hours.appendChild(row);
    }
  }
  
  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant = this.restaurant) {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" aria-current="page">${restaurant.name}</a>`;
    breadcrumb.appendChild(li);
  }
}  
