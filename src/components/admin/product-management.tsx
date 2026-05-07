"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

type DraftProduct = {
  name: string;
  category: string;
  price: string;
  inventory: string;
  imageUrl: string;
};

const emptyDraft: DraftProduct = {
  name: "",
  category: "",
  price: "",
  inventory: "",
  imageUrl: "",
};

export function ProductManagement({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);

  const editProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [editingId, products],
  );

  const startCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      inventory: String(product.inventory),
      imageUrl: product.imageUrl,
    });
  };

  const submitDraft = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name || !draft.category || !draft.price || !draft.inventory) return;

    if (editingId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId
            ? {
                ...product,
                name: draft.name,
                category: draft.category,
                price: Number(draft.price),
                inventory: Number(draft.inventory),
                imageUrl: draft.imageUrl || product.imageUrl,
              }
            : product,
        ),
      );
    } else {
      const nameSlug = draft.name.toLowerCase().replace(/\s+/g, "-");
      setProducts((current) => [
        {
          id: `new_${Date.now()}`,
          name: draft.name,
          slug: `${nameSlug}-${Date.now()}`,
          description: "New admin-created product placeholder description.",
          category: draft.category,
          price: Number(draft.price),
          inventory: Number(draft.inventory),
          imageUrl:
            draft.imageUrl ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400",
        },
        ...current,
      ]);
    }

    setEditingId(null);
    setDraft(emptyDraft);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Product Management</h1>
        <button
          onClick={startCreate}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Inventory</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-zinc-200">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">{product.inventory}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => startEdit(product)}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">
          {editProduct ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={submitDraft} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={draft.name}
            onChange={(event) => setDraft((c) => ({ ...c, name: event.target.value }))}
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Product name"
          />
          <input
            value={draft.category}
            onChange={(event) => setDraft((c) => ({ ...c, category: event.target.value }))}
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Category"
          />
          <input
            type="number"
            value={draft.price}
            onChange={(event) => setDraft((c) => ({ ...c, price: event.target.value }))}
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Price"
          />
          <input
            type="number"
            value={draft.inventory}
            onChange={(event) => setDraft((c) => ({ ...c, inventory: event.target.value }))}
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Inventory"
          />
          <input
            value={draft.imageUrl}
            onChange={(event) => setDraft((c) => ({ ...c, imageUrl: event.target.value }))}
            className="sm:col-span-2 rounded border border-zinc-300 p-2 text-sm"
            placeholder="Image URL (optional)"
          />
          <button
            type="submit"
            className="sm:col-span-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            {editProduct ? "Save Product" : "Create Product"}
          </button>
        </form>
      </section>
    </div>
  );
}
