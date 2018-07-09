export default class HttpRouting {
    get SERVER_PORT() {
        return 1337;
    }

    get HOST() {
        return 'localhost';
    }

    POST_REVIEW_URL() {
        return `http://${this.HOST}:${this.SERVER_PORT}/reviews/`;
    }

    PUT_RESTAURANT_FAVORITE_URL(restaurantId, isFavorite) {
        return `http://${this.HOST}:${this.SERVER_PORT}/restaurants/${restaurantId}/?is_favorite=${isFavorite}`;
    }

    ALL_RESTAURANTS_URL() { 
        return `http://${this.HOST}:${this.SERVER_PORT}/restaurants`;
    }

    GET_RESTAURANT_REVIEWS_URL(restaurantId) {
        return `http://${this.HOST}:${this.SERVER_PORT}/reviews/?restaurant_id=${restaurantId}`;
    }
}