import fetchFactory from "./fetch-factory.js";
import {DEV_INVENTORY, DEV_PRODUCTS} from "../../constants.js";
import {makeGlobalStore} from "./global-store.js";

const LOADED_PRODUCTS = new Map(
   [
     [
       1,
       {
         id: 1,
         name: 'Cats',
         cost: 20,
         description: 'furry balls of indifference'
       }
     ],
     [
       2,
       {id: 2, name: 'Bats', cost: 5, description: 'DO NOT USE ON CATS'}],
     [
       3,
       {
         id: 3,
         name: 'Hats',
         cost: 15,
         description: 'Makes your head look cool'
       }],
     [
       4,
       {
         id: 4,
         name: 'Mats',
         description: 'Let visitors know they are welcome... or they are not.',
         cost: 8
       }]
   ]
)

describe('globalStore', () => {
  describe('loadProducts', () => {
    it('should load products', async () => {
      const store = makeGlobalStore(fetchFactory(DEV_PRODUCTS, DEV_INVENTORY), {
        alert(a, b) {
          console.log('alert', a, b)
        }
      });

      expect(store.value.products.size).toBe(0);
      await store.do.loadProducts();
      expect(store.value.products.get(1)).toEqual(DEV_PRODUCTS.find((p) => p.id === 1));
      expect(store.value.products.size).toBe(4);
    });
  });

  describe('buy', () => {
    it('should add a product', () => {
      const store = makeGlobalStore(fetchFactory(DEV_PRODUCTS, DEV_INVENTORY), {
        alert(a, b) {
          console.log('alert', a, b)
        }
      });

      const product = DEV_PRODUCTS[1];

      store.do.buy(product);
      expect(store.value.buying).toEqual(product);
    });
  })

  describe('loadInventory', () => {
    it('should load inventory', async () => {
      const store = makeGlobalStore(fetchFactory(DEV_PRODUCTS, DEV_INVENTORY), {
        alert(a, b) {
          console.log('alert', a, b)
        }
      });

      expect(store.value.inventory.size).toBe(0);
      await store.do.loadInventory();
      expect(store.value.inventory.get(1)).toEqual(DEV_INVENTORY.find((i) => i[0] === 1)[1]);
      expect(store.value.inventory.size).toBe(4);
    });
  });

  describe('child: products', () => {
    it('should not accept non-map', async () => {
      const store = makeGlobalStore(fetchFactory(DEV_PRODUCTS, DEV_INVENTORY), {
        alert(a) {
          console.log('alert', a)
        }
      });

      await store.do.load();

      const products = store.child('products');

      expect(products.value).toEqual(LOADED_PRODUCTS);
      products.value = ({foo: 1, bar: 2});
      expect(products.value).toEqual(new Map());
    });

    it('should filter out non-objects', () => {
      const store = makeGlobalStore(fetchFactory(DEV_PRODUCTS, DEV_INVENTORY), {
        alert(a) {
          console.log('alert', a)
        }
      });

      const products = store.child('products');

      const PRODUCT_1 = {id: 1, name: 'alpha', description: 'beta', cost: 5};

      products.value = new Map([[1, PRODUCT_1], [2, 'foo']]);

      expect(products.value.size).toBe(1);  // erases second product;
      expect(products.value.get(1)).toEqual(PRODUCT_1);
    })
  });

  describe('child: cart', () => {
    it('should add a product', async () => {
      const messages = [];
      const store = makeGlobalStore(fetchFactory(DEV_PRODUCTS, DEV_INVENTORY), {
        alert(a) {
          messages.push(a)
        }
      });
      const cart = store.child('cart');
      await store.do.load();

      expect(cart.value.purchases.size).toBe(0);

      expect(cart.do.addProduct(2)).toBeTruthy();
      expect(cart.value.purchases.size).toBe(1);
      expect(cart.value.purchases.get(2)).toEqual([{qty: 1, options: {}}]);

      expect(cart.do.addProduct(2, 3, {color: 'red'})).toBeTruthy();
      expect(cart.value.purchases.get(2)).toEqual([{qty: 1, options: {}}, {qty: 3, options: {color: 'red'}}]);
      expect(cart.value.purchases.size).toBe(1);

      expect(cart.do.addProduct(100, 3, {color: 'red'})).toBeFalsy();
      expect(messages).toEqual(['not in inventory']);

      expect(cart.value.purchases.size).toBe(1);
    })
  })
});

