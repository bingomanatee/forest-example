import globalStore from "~/lib/stores/global-store.js";
import {AiFillDelete} from "react-icons/ai";

let USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function Purchased({id}) {
  const cart = globalStore.child('cart');
  return <div className='purchases'><label>{cart.$.purchased(id)} in cart</label> <span
     className='delete-icon' onClick={() => cart.do.removeProduct(id)}><AiFillDelete/> </span></div>
}

export function ProductIcon({product}) {
  const cart = globalStore.child('cart');
  const [inStockMessage, inStockClass] = globalStore.$.inStock(product.id, true);
  return (
     <div className='product'>
       <div>
         <h2>{product.name}</h2>
         <p>{product.description} <span className={'in-stock-body ' + inStockClass ??''}>
           {inStockMessage}
         </span></p>
       </div>
       {cart.$.purchased(product.id) > 0 ? <Purchased id={product.id}/> : null}
       <div className='property'><b>Cost:</b>
         <span>{USDollar.format(product.cost)}</span>
       </div>
       <button onClick={() => globalStore.do.buy(product)}>Purchase</button>
     </div>
  )
}