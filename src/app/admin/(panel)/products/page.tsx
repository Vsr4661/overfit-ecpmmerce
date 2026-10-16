import { ProductTable } from "@/components/admin/product-table";
import { isPrintroveConfigured } from "@/lib/printrove";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const rows = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return (
    <ProductTable
      printroveConfigured={isPrintroveConfigured()}
      products={rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        imageUrl: row.imageUrl,
        category: row.category.name,
        price: row.price,
        costPrice: row.costPrice,
        inventory: row.inventory,
        isActive: row.isActive,
        source: row.printroveId ? "Printrove" : "Manual",
      }))}
    />
  );
}
