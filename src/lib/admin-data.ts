import { mockOrders, mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function getAdminAnalytics() {
  const totalOrders = mockOrders.length;
  const revenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = mockProducts.length;

  return {
    totalOrders,
    revenue,
    totalProducts,
    revenueFormatted: formatCurrency(revenue),
  };
}

export function getRecentOrders() {
  return [...mockOrders].slice(0, 5);
}

export function getCustomers() {
  const map = new Map<
    string,
    {
      name: string;
      email: string;
      totalOrders: number;
      totalSpend: number;
    }
  >();

  for (const order of mockOrders) {
    const existing = map.get(order.customerEmail);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpend += order.total;
    } else {
      map.set(order.customerEmail, {
        name: order.customerName,
        email: order.customerEmail,
        totalOrders: 1,
        totalSpend: order.total,
      });
    }
  }

  return [...map.values()];
}
