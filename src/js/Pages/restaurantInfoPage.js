import CommonHelper from '../Core/commonHelper';
import MapManager from '../Managers/mapManager';
import ReviewFormManager from '../Managers/reviewFormManager';

const MAX_RATING = 5;

export default class RestaurantInfoPage {
  constructor(db) {
    this.db = db;
    this.restaurant = null;
    this.mapManager = null;
    this.reviewFormManager = null;
    
    document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded.bind(this));
  }
  
  onDOMContentLoaded(event) {
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
      this.fillReviewsHTML(restaurantReviews);
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
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(reviews) {
    const container = document.getElementById('review-list-container');
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
    const datetime = new Date(review.createdAt)
    date.innerHTML = `${datetime.toLocaleTimeString()} ${datetime.toLocaleDateString()}`;
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
