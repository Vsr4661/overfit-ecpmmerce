import { ShopClient } from "@/components/store/shop-client";
import { getProducts } from "@/lib/store";

export default async function ProductsPage() {
  const products = await getProducts();

  return <ShopClient products={products} />;
}
