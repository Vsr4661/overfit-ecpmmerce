import { DiscountManager } from "@/components/admin/discount-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminDiscountsPage() {
  const codes = await prisma.discountCode.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] });
  const revenue = await prisma.order.groupBy({
    by: ["discountCode"],
    where: { discountCode: { not: null }, status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true, discountAmount: true },
  });
  const byCode = new Map(revenue.map((row) => [row.discountCode, row._sum]));

  return (
    <DiscountManager
      codes={codes.map((code) => ({
        id: code.id,
        code: code.code,
        type: code.type as "PERCENT" | "FIXED",
        value: code.value,
        minSubtotal: code.minSubtotal,
        maxUses: code.maxUses,
        usedCount: code.usedCount,
        expiresAt: code.expiresAt?.toISOString() ?? null,
        isActive: code.isActive,
        revenue: byCode.get(code.code)?.total ?? 0,
        discounted: byCode.get(code.code)?.discountAmount ?? 0,
      }))}
    />
  );
}
