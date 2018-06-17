import loadGoogleMapsApi from 'load-google-maps-api'; 

export default class MapManager {
  constructor(restaurants) {
    this.expanded = false;
    this.googleMap = null;
    this.mapContainer = document.getElementById("map");
    this.mapButton = document.getElementById("show-map");

    this.mapButton.addEventListener('click', this.expandOrCollapseMap.bind(this));
  }

    expandOrCollapseMap(eventArgs) {
        var evArgs = eventArgs;
        loadGoogleMapsApi({
            key: '{{GOOGLE_MAPS.API_KEY}}',
        }).then((googleMaps)=>{
            if(!this.googleMap) {
                this.googleMap = new googleMaps.Map(this.mapContainer, {
                    zoom: 12,
                    center: {
                        lat: 40.722216,
                        lng: -73.987501
                    },
                    scrollwheel: false
                });
            }
        }).then(()=>{
            let clickedButton = evArgs.target;
            this.changeMapIcon(clickedButton);
            this.changeMapHeight();
            this.expanded = !this.expanded;
        })
        .catch((err)=>{
            this.googleMap = null;
            console.log("Error while loading map: ", err);
        });
    }

    changeMapIcon(buttonParent) {
        buttonParent.children[0].classList.toggle("far", this.expanded);
        buttonParent.children[0].classList.toggle("fas", !this.expanded);
    }

    changeMapHeight() {
        if(this.expanded) {
        this.mapContainer.classList.add("collapsed");
        this.mapContainer.classList.remove("expanded");
        } else {
        this.mapContainer.classList.add("expanded");
        this.mapContainer.classList.remove("collapsed");
        }
    }

  
  /**
   * Add markers for current restaurants to the map.
   */
//   addMarkersToMap(restaurants = this.restaurants) {
//     restaurants.forEach(restaurant => {
//       // Add marker to the map
//       const marker = this.db.mapMarkerForRestaurant(restaurant, this.map);
//       google.maps.event.addListener(marker, 'click', () => {
//         window.location.href = marker.url
//       });
//       this.markers.push(marker);
//     });
//   }
}
