import {Forest} from "@wonderlandlabs/forest";
import {DEV_INVENTORY, DEV_PRODUCTS, GET_PRODUCTS_INV_URL, GET_PRODUCTS_URL} from "../../constants.js";
import fetchFactory from "./fetch-factory.js";
import {Product} from "~/lib/stores/product.js";

async function asJSON(fetch, url, options) {
  let res = await fetch(url, options);
  if (!/^2/.test(`${res.status}`)) throw new Error('bad status');
  return res.json();
}

export function makeGlobalStore(fetch, window) {
  return new Forest({
       $value: {
         inventory: new Map(),
         isLoading: false,
         buying: null,
       },
       selectors: {
         inStock(state, id, short = false) {
           const {inventory} = state.value
           if (!inventory.has(id)) {
             return ['unavailable', 'error'];
           }
           if (inventory.get(id) <= 0) {
             return ['out of stock', 'error'];
           }
           return short ? [`${inventory.get(id)} in stock`, ''] : [
             [`up to ${inventory.get(id)} available for purchase`, '']
           ]
         }
       },
       actions: {
         buy(store, product) {
           store.do.set_buying(product);
         }
         ,
         cancelBuy(store) {
           store.do.set_buying(null);
         }
         ,
         purchase(store, product, qty = 1) {
           store.child('cart').do.addProduct(product.id, qty);
         }
         ,
         message(store, title, message) {
           window.alert(title + ': ' + message);
         }
         ,
         async loadProducts(store) {
           if (store.value.isLoading) return;
           store.do.set_isLoading(true);
           const products = await asJSON(fetch, GET_PRODUCTS_URL, {method: 'GET'});
           const newProducts = new Map();
           products.forEach((p) => {
             newProducts.set(p.id, p);
           })
           store.do.set_products(newProducts);
           store.do.set_isLoading(false);
         }
         ,
         async loadInventory(store) {
           const inventory = await asJSON(fetch, GET_PRODUCTS_INV_URL, {method: 'GET'});
           const newInventory = new Map();
           (inventory).forEach(([id, count]) => {
             newInventory.set(id, count);
           })
           store.do.set_inventory(newInventory);
         }
         ,
         async load(store) {
           try {
             await store.do.loadInventory();
             await store.do.loadProducts();

           } catch (err) {
             store.do.message('Cannot get products', err.message);
           }
         }
       }
       ,
       children: {
         'products':
            {
              $value: new Map(),
              type:
                 true,
              filter(value) {
                if (!(value instanceof Map)) return new Map();
                value.forEach((product, id) => {
                  if (!(product && typeof product === 'object')) {
                    value.delete(id);
                  }
                  try {
                    const prod = new Product(product, id);
                    value.set(id, prod);
                  } catch (_e) {
                    console.warn('product error:', _e);
                    value.delete(id);
                  }
                });
                return value;
              }
            }
         ,
         cart: {
           $value: {
             purchases: new Map(),
           }
           ,
           selectors: {
             purchased(store, id) {
               if (!store.value.purchases.has(id)) return 0;
               return store.value.purchases.get(id).reduce((s, p) => s + p.qty, 0);
             }
           }
           ,
           actions: {
             removeProduct(store, id) {
               const {purchases} = store.value;
               const newPurchases = new Map(purchases);
               newPurchases.delete(id);
               store.do.set_purchases(newPurchases);
             }
             ,
             addProduct(store, id, qty = 1, options = {}) {
               const {purchases} = store.value;
               const inventory = store.parent.value.inventory;
               if (!(inventory.has(id) && inventory.get(id) > 0)) {
                 window.alert('not in inventory');
                 store.parent.do.cancelBuy();
                 return false;
               }
               const newPurchases = new Map(purchases);
               const purchaseQty = Math.max(1, Math.min(qty, inventory.get(id)));
               if (purchases.has(id)) {
                 const current = purchases.get(id)
                 const newList = [...current, {qty: purchaseQty, options}];
                 newPurchases.set(id, newList);
               } else {
                 newPurchases.set(id, [{qty, options}])
               }
               store.do.set_purchases(newPurchases);
               store.parent.do.cancelBuy();
               return true;
             }
           }
         }
       }
     }
  )
     ;
}

const fetchDev = fetchFactory(DEV_PRODUCTS, DEV_INVENTORY);

const globalStore = makeGlobalStore(fetchDev, typeof window !== 'undefined' ? window : {
  alert() {
  }
});
export default globalStore;