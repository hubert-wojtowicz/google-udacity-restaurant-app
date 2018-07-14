import HttpRouting from './HttpRouting';

export default class HttpClientHelper extends HttpRouting {
    postRestaurantReview(restaurantReviewModel) {
        return fetch(this.POST_REVIEW_URL(), {
            method: 'POST',
            body: JSON.stringify(restaurantReviewModel),
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
    }

    putFavouriteResraurant(restaurantId, isFavourite) {
        return fetch(this.PUT_RESTAURANT_FAVORITE_URL(restaurantId,isFavourite))
        .then(response => response.json());

    }

    getAllRestaurants() {
        return fetch(this.ALL_RESTAURANTS_URL())
        .then(response => response.json());
    }

    getAllRestaurantsCount() {
        return new Promise(resolve => resolve(10));
    }
    getRestaurantReviews(restaurantId) {
        return fetch(this.GET_RESTAURANT_REVIEWS_URL(restaurantId))
        .then(response => response.json());
    }
}