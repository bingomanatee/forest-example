import * as PropTypes from "prop-types";
import globalStore from "~/lib/stores/global-store.js";
import useGlobalForest from "~/hooks/useGlobalForest.jsx";
import useForest from "~/hooks/useForest.jsx";

export function BuyProduct({product}) {
  const {inventory} = useGlobalForest(globalStore);
  const [{quantity}, store] = useForest({
    $value: {quantity: 1},
    actions: {
      handleQuantity(store, e) {
        store.do.set_quantity(Number(e.target.value));
      }
    }
  });
  if (!store) return null;

  const [stockMessage, stockStyle] = globalStore.$.inStock(product.id);

  return <section className='product-buy-dlog-container'>
    <dialog open className='product-buy-dlog'>
      <div className='product-buy-dlog-inner'>
        <h1>Buy product &quot;{product.name}&quot; <small>(id: {product.id})</small></h1>

        <div className='input-rows'>
          <div className='input-row'>
            <label>Quantity:</label>
            <input type='number' value={quantity} onChange={store.do.handleQuantity} min={1}
                   max={inventory.get(product.id)}/>
            <div className={'input-row-info ' + (stockStyle ?? '')}>
              {stockMessage}
            </div>
          </div>
        </div>

        <div className='button-row'>
          <button onClick={globalStore.do.cancelBuy}>Cancel</button>
          <button className='primary' onClick={() => globalStore.do.purchase(product, quantity)}>Purchase</button>
        </div>
      </div>
    </dialog>

  </section>;
}

BuyProduct.propTypes = {product: PropTypes.any};
