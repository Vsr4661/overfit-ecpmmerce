import { AdminNav } from "@/components/admin/admin-nav";
import { OrderStatusTable } from "@/components/admin/order-status-table";
import { mockOrders } from "@/lib/mock-data";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <AdminNav />
      <h1 className="text-2xl font-semibold">Admin / Orders</h1>
      <OrderStatusTable initialOrders={mockOrders} />
    </div>
  );
}
