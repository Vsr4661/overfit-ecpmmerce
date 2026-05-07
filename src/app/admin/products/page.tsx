import { AdminNav } from "@/components/admin/admin-nav";
import { ProductManagement } from "@/components/admin/product-management";
import { mockProducts } from "@/lib/mock-data";

export default async function AdminProductsPage() {
  return (
    <div className="space-y-5">
      <AdminNav />
      <ProductManagement initialProducts={mockProducts} />
    </div>
  );
}
