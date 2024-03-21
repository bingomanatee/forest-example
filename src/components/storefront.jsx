import {ProductList} from "~/components/product-list";
import useGlobalForest from "~/hooks/useGlobalForest";
import globalState from '~/lib/stores/global-store';
import {BuyProduct} from "~/components/buy-product";

export default function Storefront() {
  const {buying} = useGlobalForest(globalState);

  return (
     <>
       <ProductList/>
       {buying ? <BuyProduct product={buying}/> : null}
     </>)
}