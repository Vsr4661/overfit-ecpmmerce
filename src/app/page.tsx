import Link from "next/link";
import { getProducts } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Overfit pieces feel like runway silhouettes made practical for everyday city life.",
    name: "Rhea Malhotra",
    role: "Fashion Stylist, Mumbai",
  },
  {
    quote:
      "The fit, fabric, and finish are in a different league. Every drop sells out for a reason.",
    name: "Kabir Arora",
    role: "Creative Director",
  },
  {
    quote:
      "Minimal branding, premium construction, and perfect oversized cuts. Exactly my vibe.",
    name: "Aman Verma",
    role: "Overfit Customer",
  },
];

export default async function Home() {
  const products = await getProducts();
  const featuredCollection = products.slice(0, 3);
  const bestSellers = products.slice(0, 4);

  return (
    <div className="-mx-4 bg-zinc-950 px-4 text-zinc-100">
      <section className="mx-auto max-w-6xl border-b border-zinc-800 py-20 sm:py-28">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Overfit / Luxury Streetwear</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Elevated streetwear for the new city uniform.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Overfit blends precision tailoring with bold, oversized silhouettes to deliver a modern
          high-fashion wardrobe built for movement.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Shop Now
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium transition hover:border-zinc-500"
          >
            View Lookbook
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-b border-zinc-800 py-16 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-semibold sm:text-4xl">Featured Collection</h2>
          <Link href="/products" className="text-sm text-zinc-400 hover:text-white">
            Explore all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCollection.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{product.category}</p>
              <h3 className="mt-3 text-2xl font-medium">{product.name}</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{product.description}</p>
              <p className="mt-6 text-sm font-semibold">{formatCurrency(product.price)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-b border-zinc-800 py-16 sm:py-20">
        <h2 className="text-3xl font-semibold sm:text-4xl">Best Sellers</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-600"
            >
              <p className="text-sm text-zinc-300">{product.name}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">{product.category}</p>
              <p className="mt-5 text-sm font-semibold">{formatCurrency(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 border-b border-zinc-800 py-16 sm:grid-cols-2 sm:py-20">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Brand Story</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Designed in India. Inspired by global street culture.
          </h2>
        </div>
        <p className="text-sm leading-8 text-zinc-400 sm:text-base">
          Overfit was created for those who see clothing as identity. We obsess over proportion,
          structure, and material, creating minimal statement pieces that move seamlessly from day
          to night. Every collection is intentionally limited, crafted for individuality over noise.
        </p>
      </section>

      <section className="mx-auto max-w-6xl border-b border-zinc-800 py-16 sm:py-20">
        <h2 className="text-3xl font-semibold sm:text-4xl">Testimonials</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm leading-7 text-zinc-300">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-5 text-sm font-semibold">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-b border-zinc-800 py-16 sm:py-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Newsletter</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Get early access to drops.</h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Join the Overfit insiders list for limited releases, styling edits, and private sale windows.
          </p>
          <form className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border border-zinc-700 bg-zinc-950 px-5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-500"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl py-10 text-sm text-zinc-500">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p>OVERFIT</p>
          <div className="flex gap-5">
            <Link href="/products" className="hover:text-zinc-300">
              Shop
            </Link>
            <Link href="/orders/ord_1" className="hover:text-zinc-300">
              Track Order
            </Link>
            <Link href="/admin" className="hover:text-zinc-300">
              Admin
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Overfit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
