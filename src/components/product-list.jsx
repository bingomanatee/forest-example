import useGlobalForest from "~/hooks/useGlobalForest";
import globalStore from '../lib/stores/global-store'
import {useEffect} from "react";
import './storefront.css'
import {ProductIcon} from "~/components/product-icon.jsx";

export function ProductList() {

  const {products} = useGlobalForest(globalStore);

  useEffect(() => {
    globalStore.do.load();
  }, []);

  console.log('products:', products);

  return<div>
    <h1>Test Store Products</h1>

    <div className='product-list'>
      {Array.from(products.values()).map((p) => (
         <ProductIcon key={p.id} product={p} />
      ))}
    </div>
  </div>
}