import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/cart-provider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Overfit — Oversized streetwear", template: "%s · Overfit" },
  description:
    "Heavyweight tees, hoodies and outerwear cut oversized. Designed in India, printed on demand, shipped across India.",
  openGraph: { siteName: "Overfit", type: "website", locale: "en_IN" },
  icons: { icon: "/overfit.svg" },
};

export const viewport: Viewport = { themeColor: "#f4f2ee" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${archivo.variable}`}>
      <body className="min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
