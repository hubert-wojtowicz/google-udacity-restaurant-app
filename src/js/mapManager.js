import loadGoogleMapsApi from 'load-google-maps-api'; 
import CommonHelper from './CommonHelper';
import { ECANCELED } from 'constants';

export default class MapManager {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.expanded = false;
        this.map = null;
        this.mapAPI = null;
        this.markers = [];
        this.mapContainer = document.getElementById("map");
        this.mapButton = document.getElementById("map-icon");
        
        this.mapButton.addEventListener('click', this._expandOrCollapseMap.bind(this));
    }

    get iconText() { return (this.expanded) ? "Show map" : "Hide map"; }
    
    addMarkers(restaurants) {
        restaurants.forEach(restaurant => {
            const marker = this.markerForRestaurantFactory(restaurant, this.map);
            google.maps.event.addListener(marker, 'click', () => {
                window.location.href = marker.url
            });
            this.markers.push(marker);
        });
    }
    
    removeMarkers() {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
    }
    
    _expandOrCollapseMap(event) {
        let currentTarget = event.currentTarget;
        loadGoogleMapsApi({
            key: '{{GOOGLE_MAPS.API_KEY}}',
        }).then((googleMaps)=>{
            if(!this.map) {
                this.mapAPI = googleMaps;
                this.map = new googleMaps.Map(this.mapContainer, {
                    zoom: 12,
                    center: {
                        lat: 40.722216,
                        lng: -73.987501
                    },
                    scrollwheel: false
                });
                this._addMarkers(this.restaurants);
            }
        }).then(()=>{
            this._changeMapIcon(currentTarget);
            this._changeHeight();
            this.expanded = !this.expanded;
        })
        .catch((err)=>{
            this.map = null;
            console.log("Error while loading map: ", err);
        });
    }

    _changeMapIcon(buttonParent) {
        this._changeIconText();
        buttonParent.children[0].classList.toggle("far", this.expanded);
        buttonParent.children[0].classList.toggle("fas", !this.expanded);
    }

    _changeHeight() {
        if(this.expanded) {
            this.mapContainer.classList.add("collapsed");
            this.mapContainer.classList.remove("expanded");
        } else {
            this.mapContainer.classList.add("expanded");
            this.mapContainer.classList.remove("collapsed");
        }
    }
    _changeIconText() {
        document.querySelector('strong', this.mapButton).innerHTML = this.iconText;
    }

    _markerForRestaurantFactory(restaurant) {
        const marker = new this.mapAPI.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: CommonHelper.urlForRestaurant(restaurant),
            map: this.map,
            animation: this.mapAPI.Animation.DROP}
        );
        return marker;
    }
}
