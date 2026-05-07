"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

const sizeOptions = ["XS", "S", "M", "L", "XL"];

const colorOptions = [
  { name: "Jet Black", value: "#0a0a0a" },
  { name: "Off White", value: "#f5f5f4" },
  { name: "Olive", value: "#4d5d53" },
  { name: "Charcoal", value: "#3f3f46" },
];

export function ProductDetailView({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].name);
  const [quantity, setQuantity] = useState(1);

  const gallery = useMemo(
    () => [
      product.imageUrl,
      `${product.imageUrl}&auto=format&fit=crop&q=80`,
      `${product.imageUrl}&auto=format&fit=crop&q=75`,
      `${product.imageUrl}&auto=format&fit=crop&q=70`,
    ],
    [product.imageUrl],
  );

  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100,
  );

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-3">
          <div className="relative h-[520px] overflow-hidden rounded-xl border border-zinc-200 bg-white sm:h-[620px]">
            <Image
              src={gallery[activeImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {gallery.map((image, index) => (
              <button
                key={image}
                onClick={() => setActiveImage(index)}
                className={`relative h-24 overflow-hidden rounded-lg border ${
                  activeImage === index ? "border-black" : "border-zinc-200"
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{product.category}</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
              <p className="text-sm text-zinc-400 line-through">
                {formatCurrency(originalPrice)}
              </p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {discountPercent}% OFF
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 rounded-md border px-3 py-2 text-sm ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Select Color</p>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                    selectedColor === color.name ? "border-black" : "border-zinc-300"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex w-fit items-center rounded-md border border-zinc-300">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="px-3 py-2 text-lg"
              >
                -
              </button>
              <span className="min-w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((value) => Math.min(product.inventory, value + 1))}
                className="px-3 py-2 text-lg"
              >
                +
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              {product.inventory} units available in stock.
            </p>
          </div>

          <AddToCartButton
            product={product}
            size={selectedSize}
            color={selectedColor}
            quantity={quantity}
          />

          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            <p>
              Selected: <span className="font-medium text-zinc-900">{selectedSize}</span> /{" "}
              <span className="font-medium text-zinc-900">{selectedColor}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Product Description</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600">{product.description}</p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Crafted with premium materials and designed around oversized silhouettes for a
            modern street-luxury look.
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Shipping Info</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>- Free shipping on prepaid orders above INR 2,999.</li>
            <li>- Standard delivery in 3-6 business days across India.</li>
            <li>- Express shipping available in metro cities.</li>
            <li>- Easy 7-day returns and exchanges.</li>
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Size Guide</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Choose your usual fit for regular wear or size up for a pronounced oversized look.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Chest (in)</th>
                <th className="px-3 py-2">Length (in)</th>
                <th className="px-3 py-2">Shoulder (in)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", "36", "25", "16"],
                ["S", "38", "26", "17"],
                ["M", "40", "27", "18"],
                ["L", "42", "28", "19"],
                ["XL", "44", "29", "20"],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-zinc-100">
                  <td className="px-3 py-2 font-medium">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                  <td className="px-3 py-2">{row[2]}</td>
                  <td className="px-3 py-2">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related Products</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
