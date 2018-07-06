export default class HttpClientHelper {
    get BACKEND_SERVER_PORT() {
        return 1337;
    }

    get ADD_REVIEW_URL() {
        return `http://localhost:${this.BACKEND_SERVER_PORT}/reviews/`;
    }

    get ALL_RESTAURANTS_URL() { 
        return `http://localhost:${this.BACKEND_SERVER_PORT}/restaurants`;
    }

    RESTAURANT_REVIEWS_URL(restaurantId) {
        return `http://localhost:${this.BACKEND_SERVER_PORT}/reviews/?restaurant_id=${restaurantId}`;
    }

    postRestaurantReview(restaurantReviewModel) {
        return fetch(this.ADD_REVIEW_URL, {
            method: 'POST',
            body: JSON.stringify(restaurantReviewModel),
            headers:{
            'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
    }

    getAllRestaurants() {
        return fetch(this.ALL_RESTAURANTS_URL)
        .then(response => response.json());
    }

    getRestaurantReviews(restaurantId) {
        return fetch(this.RESTAURANT_REVIEWS_URL(restaurantId))
        .then(response => response.json());
    }
}