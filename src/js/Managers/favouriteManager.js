export default class FavouriteManager {
    get isFavorite() {
        return this.restaurant.is_favorite;
    }
    
    constructor(restaurant, containerElement, db) {
        this.db = db;
        this.restaurant = restaurant;
        this.containerElement = containerElement;
        this.button = null;

        this.emptyHeart = '♡';
        this.fullHeart = '♥';

        this._render();
    }
    
    _render() {
        this.button = document.createElement("button");
        this.button.classList.add('favourite-restaurant-button');
        this.button.innerHTML = this._getCurrentStar()
        this.button.addEventListener('click', this._onClick.bind(this));
        this.containerElement.appendChild(this.button);
    }

    _update() {
        this.db.updateRestaurantById(this.restaurant.id, { is_favorite: this.isFavorite });
        this.button.innerHTML = this._getCurrentStar();
    }

    _getCurrentStar() {
        return this.isFavorite ? this.fullHeart : this.emptyHeart;
    }

    _onClick(event) {
        this.restaurant.is_favorite = !this.isFavorite;
        this._update();
    }
}