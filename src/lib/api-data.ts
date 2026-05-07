import { mockOrders, mockProducts } from "@/lib/mock-data";
import type { Order, Product } from "@/types";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ADMIN";
};

const productStore: Product[] = [...mockProducts];
const orderStore: Order[] = [...mockOrders];
const userStore: UserRecord[] = [
  {
    id: "admin_1",
    name: "Overfit Admin",
    email: "admin@overfit.com",
    password: "overfit-admin",
    role: "ADMIN",
  },
];

export function getProductStore() {
  return productStore;
}

export function getOrderStore() {
  return orderStore;
}

export function getUserStore() {
  return userStore;
}
