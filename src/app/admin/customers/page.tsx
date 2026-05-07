import { AdminNav } from "@/components/admin/admin-nav";
import { getCustomers } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

export default function AdminCustomersPage() {
  const customers = getCustomers();

  return (
    <div className="space-y-5">
      <AdminNav />
      <h1 className="text-2xl font-semibold">Admin / Customers</h1>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-600">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.email} className="border-t border-zinc-200">
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer.totalOrders}</td>
                <td className="px-4 py-3">{formatCurrency(customer.totalSpend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
