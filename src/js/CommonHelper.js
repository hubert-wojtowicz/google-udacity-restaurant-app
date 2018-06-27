export default class CommonHelper {

  /**
   * Get a parameter by name from page URL.
   */
  static getParameterByName(name, url) {
    if (!url)
      url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return Number(decodeURIComponent(results[2].replace(/\+/g, ' ')));
  }

  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  static imageUrlForRestaurant(restaurant = null, resizeVersion = null) {
    if(!restaurant || !restaurant.photograph)
      return `/img/noImage.svg`;

    return resizeVersion ? 
    `/img/${restaurant.photograph}${resizeVersion}.jpg` :
    `/img/${restaurant.photograph}.jpg` ;
  }

  static updateJsonObjByAnotherObj(obj/*, …*/) {
      for (var i=1; i<arguments.length; i++) {
          for (var prop in arguments[i]) {
              var val = arguments[i][prop];
              if (typeof val == "object") // this also applies to arrays or null!
                updateJsonObjByAnotherObj(obj[prop], val);
              else
                obj[prop] = val;
          }
      }
      return obj;
  }
}