import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { CartItem } from "@/types";

const CART_COOKIE = "overfit_cart_api";

const addSchema = z.object({
  item: z.object({
    id: z.string(),
    product: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      description: z.string(),
      price: z.number(),
      imageUrl: z.string(),
      category: z.string(),
      inventory: z.number(),
    }),
    quantity: z.number().int().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
  }),
});

const updateSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(1),
});

function readCart(request: NextRequest): CartItem[] {
  const raw = request.cookies.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function withCartResponse(cart: CartItem[], payload: unknown) {
  const response = NextResponse.json(payload);
  response.cookies.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const cart = readCart(request);
  return NextResponse.json({ cart });
}

export async function POST(request: NextRequest) {
  const cart = readCart(request);
  try {
    const body = await request.json();
    const { item } = addSchema.parse(body);
    const existing = cart.find((entry) => entry.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    return withCartResponse(cart, { cart });
  } catch {
    return NextResponse.json({ message: "Invalid cart payload" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const cart = readCart(request);
  try {
    const body = await request.json();
    const { itemId, quantity } = updateSchema.parse(body);
    const item = cart.find((entry) => entry.id === itemId);
    if (!item) return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    item.quantity = quantity;
    return withCartResponse(cart, { cart });
  } catch {
    return NextResponse.json({ message: "Invalid update payload" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const cart = readCart(request);
  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId) {
    return withCartResponse([], { cart: [] });
  }
  const filtered = cart.filter((item) => item.id !== itemId);
  return withCartResponse(filtered, { cart: filtered });
}
