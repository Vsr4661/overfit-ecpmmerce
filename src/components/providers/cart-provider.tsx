"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  /** False until the saved cart has been read from localStorage (avoids hydration mismatches). */
  hydrated: boolean;
  addItem: (product: Product, options?: { size?: string; quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "overfit_cart_v2";
export const MAX_QUANTITY = 10;

function readSavedCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.productId === "string" && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readSavedCart();
    setItems(saved);
    setHydrated(true);

    // Re-price saved lines against the live catalog and drop products that were removed.
    if (saved.length > 0) {
      fetch("/api/products")
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { products: Product[] } | null) => {
          if (!data) return;
          const live = new Map(data.products.map((product) => [product.id, product]));
          setItems((current) =>
            current.flatMap((item) => {
              const product = live.get(item.productId);
              if (!product) return [];
              return [{ ...item, name: product.name, price: product.price, imageUrl: product.imageUrl, slug: product.slug }];
            }),
          );
        })
        .catch(() => {});
    }

    // Keep tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) setItems(readSavedCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked; cart still works for this session */
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, options?: { size?: string; quantity?: number }) => {
    const size = options?.size;
    const quantity = options?.quantity ?? 1;
    const id = `${product.id}:${size ?? "one-size"}`;
    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) } : item,
        );
      }
      return [
        ...current,
        {
          id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: Math.min(MAX_QUANTITY, quantity),
          size,
          color: product.color ?? undefined,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((current) =>
      quantity < 1
        ? current.filter((item) => item.id !== itemId)
        : current.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) } : item,
          ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [items, hydrated, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
