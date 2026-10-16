import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=80`;

// Sample catalog so the store works locally before Printrove is connected.
// Run `npm run sync:printrove` to import your real Printrove products.
const sampleProducts = [
  {
    name: "Signature Heavy Tee",
    slug: "signature-heavy-tee",
    description: "240 GSM combed cotton, dropped shoulders and a boxy oversized cut. Minimal chest print.",
    price: 1299,
    image: "photo-1583743814966-8936f5b7be1a",
    category: "T-Shirts",
    sizes: "S,M,L,XL",
    color: "Jet Black",
    inventory: 64,
  },
  {
    name: "Essential Blank Tee",
    slug: "essential-blank-tee",
    description: "The everyday white tee, cut roomy through the body with a tight ribbed collar.",
    price: 999,
    image: "photo-1521572163474-6864f9cf17ab",
    category: "T-Shirts",
    sizes: "XS,S,M,L,XL",
    color: "Off White",
    inventory: 80,
  },
  {
    name: "Club Badge Tee",
    slug: "club-badge-tee",
    description: "Heavyweight black tee with a small circular chest badge. Pre-shrunk, garment dyed.",
    price: 1199,
    image: "photo-1618354691373-d851c5c3a990",
    category: "T-Shirts",
    sizes: "S,M,L,XL",
    color: "Black",
    inventory: 40,
  },
  {
    name: "Fog Pullover Hoodie",
    slug: "fog-pullover-hoodie",
    description: "Brushed-back 380 GSM fleece, double-lined hood and a deep kangaroo pocket.",
    price: 2499,
    image: "photo-1556821840-3a63f95609a7",
    category: "Hoodies",
    sizes: "S,M,L,XL",
    color: "Heather Grey",
    inventory: 42,
  },
  {
    name: "Cloud Crewneck",
    slug: "cloud-crewneck",
    description: "A clean white crewneck sweatshirt in soft loopback cotton. Layers over everything.",
    price: 1999,
    image: "photo-1620799140408-edc6dcb6d633",
    category: "Sweatshirts",
    sizes: "S,M,L,XL",
    color: "White",
    inventory: 25,
  },
  {
    name: "Rust Bomber Jacket",
    slug: "rust-bomber-jacket",
    description: "Lightweight bomber with ribbed cuffs and hem, two-way zip and an inner sleeve pocket.",
    price: 4499,
    image: "photo-1591047139829-d91aecb6caea",
    category: "Outerwear",
    sizes: "M,L,XL",
    color: "Rust",
    inventory: 18,
  },
  {
    name: "Rider Leather Jacket",
    slug: "rider-leather-jacket",
    description: "Asymmetric-zip biker in vegan leather with snap lapels and quilted lining.",
    price: 5999,
    image: "photo-1551028719-00167b16eac5",
    category: "Outerwear",
    sizes: "S,M,L",
    color: "Black",
    inventory: 10,
  },
  {
    name: "Relaxed Dark Denim",
    slug: "relaxed-dark-denim",
    description: "Straight relaxed-leg jeans in rigid 13 oz denim with a mid rise.",
    price: 2899,
    image: "photo-1624378439575-d8705ad7ae80",
    category: "Bottomwear",
    sizes: "28,30,32,34,36",
    color: "Indigo",
    inventory: 31,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@overfit.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 10) {
    throw new Error("Set ADMIN_PASSWORD (at least 10 characters) in .env before seeding.");
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPassword, 12), role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Overfit Admin",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  if (process.env.SEED_SAMPLE_PRODUCTS === "false") {
    console.log("SEED_SAMPLE_PRODUCTS=false; skipping sample products.");
    return;
  }

  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log(`Catalog already has ${productCount} products; skipping sample products.`);
    return;
  }

  for (const item of sampleProducts) {
    const category = await prisma.category.upsert({
      where: { name: item.category },
      update: {},
      create: { name: item.category, slug: slugify(item.category) },
    });
    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        imageUrl: img(item.image),
        sizes: item.sizes,
        color: item.color,
        inventory: item.inventory,
        categoryId: category.id,
      },
    });
  }
  console.log(`Seeded ${sampleProducts.length} sample products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
