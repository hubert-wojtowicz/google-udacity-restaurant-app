import DBHelper from './dbhelper';
import Helpers from './helpers';

const MAX_RATING = 5;

export default class RestaurantInfoPage {
  constructor() {
    this.restaurant = null;
    this.map = null;
    
    /**
     * Initialize Google map, called from HTML.
     */
    window.initMap = () => {
      this.fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
          console.error(error);
        } else {
          this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false
          });
          this.fillBreadcrumb();
          DBHelper.mapMarkerForRestaurant(this.restaurant, this.map);
        }
      });
    }
  }
  
  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL(callback) {
    if (this.restaurant) { // restaurant already fetched!
      callback(null, this.restaurant)
      return;
    }
    const id = Helpers.getParameterByName('id');
    if (!id) { // no id found in URL
      error = 'No restaurant id in URL'
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        this.restaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return;
        }
        this.fillRestaurantHTML();
        callback(null, restaurant)
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
    image.className = 'restaurant-img'
    image.alt = restaurant.alt;
    if(restaurant.photograph){
      image.src = DBHelper.imageUrlForRestaurant(restaurant, '-270min1x');
      image.srcset = 
        `${DBHelper.imageUrlForRestaurant(restaurant, '-800')} 800w, 
        ${DBHelper.imageUrlForRestaurant(restaurant, '-540min2x')} 540w,
        ${DBHelper.imageUrlForRestaurant(restaurant, '-270min1x')} 270w`;
    } else {
      image.src = DBHelper.imageUrlForRestaurant();
    }
    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
  
    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fillReviewsHTML();
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
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(reviews = this.restaurant.reviews) {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
  
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement('li');
  
    li.appendChild(this.createReviewHeader(review));
  
    const comments = document.createElement('p');
    comments.setAttribute('class','review-essence');  
    comments.setAttribute('arial-label', 'Review essence');
    
    comments.innerHTML = review.comments;
    li.appendChild(comments);
  
    return li;
  }
  
  createReviewHeader(review) {
    const rewiewHeader = document.createElement('div');
    rewiewHeader.setAttribute('class','review-header');
  
    const pullLeftContainer = document.createElement('div');
    pullLeftContainer.setAttribute('class','pull-left');
    rewiewHeader.appendChild(pullLeftContainer);
    
    const name = document.createElement('p');
    name.innerHTML = review.name;
    name.setAttribute('arial-label', 'Review by ' + review.name);
    pullLeftContainer.appendChild(name);
  
    const rating = document.createElement('p');
    rating.innerHTML = "★".repeat(review.rating) + "☆".repeat(MAX_RATING - review.rating);
    rating.setAttribute('arial-label', `Resraurant rate ${review.rating}/${MAX_RATING}`);
    pullLeftContainer.appendChild(rating);
  
    const date = document.createElement('p');
    date.setAttribute('class','pull-right');  
    date.innerHTML = review.date;
    date.setAttribute('arial-label','Date of review');
    rewiewHeader.appendChild(date);
  
    return rewiewHeader;
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
