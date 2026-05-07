"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartItem, Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (
    product: Product,
    options?: { size?: string; color?: string; quantity?: number },
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "overfit_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const addItem = (
      product: Product,
      options?: { size?: string; color?: string; quantity?: number },
    ) => {
      const size = options?.size;
      const color = options?.color;
      const quantity = options?.quantity ?? 1;
      const itemId = `${product.id}_${size ?? "default"}_${color ?? "default"}`;

      setItems((current) => {
        const found = current.find((item) => item.id === itemId);
        if (found) {
          return current.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...current, { id: itemId, product, quantity, size, color }];
      });
    };

    const removeItem = (itemId: string) => {
      setItems((current) => current.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
      if (quantity < 1) return removeItem(itemId);
      setItems((current) =>
        current.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    };

    const clearCart = () => setItems([]);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
