import loadGoogleMapsApi from 'load-google-maps-api'; 
import CommonHelper from '../Core/commonHelper';
import { METHODS } from 'http';

export default class MapManager {
    get iconText() { return (this.expanded) ? "Show map" : "Hide map"; }

    constructor(restaurants, loadImidaiately=false) {
        this.restaurants = restaurants;
        this.expanded = false;
        this.map = null;
        this.mapAPI = null;
        this.markers = [];
        this.mapInjectionDiv = document.getElementById("map"); 
        this.mapContainer = document.getElementById("map-container");
        this.mapButton = document.getElementById("map-btn");
        this.loadImidaiately = loadImidaiately;

        if(loadImidaiately) {
            this._expandOrCollapseMap();
        }
        else {
            this.mapButton.addEventListener('click', this._expandOrCollapseMap.bind(this));
        }
    }

    updateMap(restaurants) {
        this.restaurants = null;
        this.restaurants = restaurants;
        this.removeMarkers();
        this.addMarkers(restaurants);
    }
    
    addMarkers(restaurants) {
        if(!this._isScriptDownloaded()) return;

        for(let restaurant of restaurants) {
            const marker = this._markerForRestaurantFactory(restaurant);
            this.mapAPI.event.addListener(marker, 'click', () => {
                window.location.href = marker.url
            });
            this.markers.push(marker);
        }
    }
    
    removeMarkers() {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
    }
    
    _expandOrCollapseMap(event = null) {
        let currentTarget = event ? event.currentTarget : null;

        loadGoogleMapsApi({
            key: '{{GOOGLE_MAPS.API_KEY}}',
        }).then(googleMaps => {
            if(!this.map) {
                this.mapAPI = googleMaps;
                this.map = new googleMaps.Map(this.mapInjectionDiv, {
                    zoom: 12,
                    center: {
                        lat: 40.722216,
                        lng: -73.987501
                    },
                    scrollwheel: false
                });
            }
        }).then((() => {
            this.updateMap(this.restaurants);
            this._changeMapIcon(currentTarget);
            this._changeVisibility();
            this.expanded = !this.expanded;
        }).bind(this))
        .catch(err => {
            this.map = null;
            console.log("Error while loading map: ", err);
        });
    }

    _changeMapIcon(buttonParent) {
        if(buttonParent == null) return;

        this._changeIconText();
        buttonParent.children[0].classList.toggle("btn-expanded", !this.expanded);
        buttonParent.children[0].classList.toggle("btn-collapsed", this.expanded);
    }

    _changeVisibility() {
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
        if(!this._isScriptDownloaded()) return;

        const marker = new this.mapAPI.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: CommonHelper.urlForRestaurant(restaurant),
            map: this.map,
            animation: this.mapAPI.Animation.DROP}
        );
        return marker;
    }

    _isScriptDownloaded() {
        return this.mapAPI;
    }
}
