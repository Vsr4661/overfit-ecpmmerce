import { AdminHeading } from "@/components/admin/admin-heading";
import { Price } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const groups = await prisma.order.groupBy({
    by: ["customerEmail"],
    where: { status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] } },
    _count: true,
    _sum: { total: true },
    _max: { createdAt: true },
    orderBy: { _sum: { total: "desc" } },
    take: 500,
  });

  const latest = await prisma.order.findMany({
    where: { customerEmail: { in: groups.map((group) => group.customerEmail) } },
    orderBy: { createdAt: "desc" },
    distinct: ["customerEmail"],
    select: { customerEmail: true, customerName: true, city: true },
  });
  const details = new Map(latest.map((row) => [row.customerEmail, row]));

  return (
    <div>
      <AdminHeading title="Customers" />
      <p className="mb-4 text-sm text-muted">Everyone with at least one paid order, highest spend first.</p>
      <div className="overflow-x-auto bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="label">
            <tr>
              <th className="p-3 font-semibold">Customer</th>
              <th className="p-3 font-semibold">City</th>
              <th className="p-3 font-semibold">Orders</th>
              <th className="p-3 font-semibold">Total spend</th>
              <th className="p-3 font-semibold">Last order</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const info = details.get(group.customerEmail);
              return (
                <tr key={group.customerEmail} className="border-t border-line">
                  <td className="p-3">
                    <p className="font-medium">{info?.customerName}</p>
                    <p className="text-xs text-muted">{group.customerEmail}</p>
                  </td>
                  <td className="p-3">{info?.city}</td>
                  <td className="p-3 tabular-nums">{group._count}</td>
                  <td className="p-3">
                    <Price amount={group._sum.total ?? 0} />
                  </td>
                  <td className="p-3 text-muted">{group._max.createdAt && formatDate(group._max.createdAt.toISOString())}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {groups.length === 0 && <p className="p-8 text-center text-sm text-muted">No paying customers yet.</p>}
      </div>
    </div>
  );
}
