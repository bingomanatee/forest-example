import {GET_PRODUCTS_INV_URL, GET_PRODUCTS_URL} from "../../constants.js";

export default function fetchFactory(products, inventory) {
  return function (url, options) {
    switch (url) {
      case GET_PRODUCTS_URL:
        return {
          status: 200,
          json() {
            return products;
          }
        }
        break;

      case GET_PRODUCTS_INV_URL:
        return {
          status: 200,
          json() {
            return inventory;
          }
        }
        break;

      default:
        return {
          status: 404,
          json() {
            return {error: 'not found'}
          }
        }
    }
  }
}