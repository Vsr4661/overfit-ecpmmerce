type Product = {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  image?: string;
  images?: string[];
  thumbnail?: string;
  mockup?: string;
  slug?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const image =
    product.image ||
    product.thumbnail ||
    product.mockup ||
    product.images?.[0] ||
    "/placeholder.jpg";

  const name = product.name || product.title || "Untitled Product";
  const price = product.price ?? "N/A";

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-zinc-100">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-zinc-900">{name}</h3>
        <p className="mt-2 text-sm text-zinc-600">₹{price}</p>
      </div>
    </div>
  );
}
