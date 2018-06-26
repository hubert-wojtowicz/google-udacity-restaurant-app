

export default class Favourite {
    get isFavorite() {
        return this.restaurant.is_favorite;
    }
    
    constructor(restaurant, containerElement, db) {
        this.db = db;
        this.restaurant = restaurant;
        this.containerElement = containerElement;
        this.button = null;

        this.emptyStar = '☆';
        this.fullStar = '★';

        this.render();
    }
    
    render() {
        this.button = document.createElement("button");
        this.button.classList.add('favourite-restaurant-button');
        this.button.innerHTML = this.getCurrentStar()
        this.button.addEventListener('click', this.onClick.bind(this));
        this.containerElement.appendChild(this.button);
    }

    update() {
        this.db.updateRestaurantById(this.restaurant.id, { is_favorite: this.isFavorite });
        this.button.innerHTML = this.getCurrentStar();
    }

    getCurrentStar() {
        return this.isFavorite ? this.fullStar : this.emptyStar;
    }


    onClick(event) {
        this.restaurant.is_favorite = !this.isFavorite;
        this.update();
    }
}