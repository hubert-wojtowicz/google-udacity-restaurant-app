import HttpClient from '../Core/httpClient';

export default class FavouriteManager {
    get isFavorite() { return this.restaurant.is_favorite; }
    get emptyHeart() { return '♡'; }
    get fullHeart() { return '♥'; }

    constructor(restaurant, containerElement, db) {
        this.httpClient = new HttpClient();
        this.db = db;
        this.restaurant = restaurant;
        this.containerElement = containerElement;
        this.button = null;

        this._render();
    }
    
    _render() {
        this.button = document.createElement("button");
        this.button.classList.add('favourite-restaurant-button');
        this.button.innerHTML = this._getCurrentFavoriteState()
        this.button.addEventListener('click', this._onClick.bind(this));
        this.containerElement.appendChild(this.button);
    }

    _update() {
        this.button.innerHTML = this._getCurrentFavoriteState();

        this.db.updateRestaurantById(this.restaurant.id, { is_favorite: this.isFavorite }).then((() => {
            this.httpClient.putFavouriteResraurant(this.restaurant.id, this.isFavorite).catch((err => {
                let obj = {
                    tag: 'favourite',
                    restaurantId: this.restaurant.id,
                    favourite: this.isFavorite
                };
                this.db.addPendingRequest(obj);
            }).bind(this))
        }).bind(this)).catch(console.log);
    }

    _getCurrentFavoriteState() {
        return this.isFavorite ? this.fullHeart : this.emptyHeart;
    }

    _onClick() {
        this.restaurant.is_favorite = !this.isFavorite;
        this._update();
    }
}