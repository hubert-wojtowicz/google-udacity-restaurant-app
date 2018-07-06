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

  /* 
  * Converts a string to a bool.
  *
  * This conversion will:
  *
  *  - match 'true', 'on', or '1' as true.
  *  - ignore all white-space padding
  *  - ignore capitalization (case).
  *
  * '  tRue  ','ON', and '1   ' will all evaluate as true.
  *
  */
  static strToBool(s)
  {
    // will match one and only one of the string 'true','1', or 'on' rerardless
    // of capitalization and regardless off surrounding white-space.
    //
    let regex=/^\s*(true|1|on)\s*$/i;

    return regex.test(s);
  }
}