import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/printrove";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

const createOrderSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(6),
  shipping_address: z.string().min(5),
  shipping_city: z.string().min(2),
  shipping_state: z.string().min(2),
  shipping_zip: z.string().min(3),
  shipping_country: z.string().min(2),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
});

/**
 * Example request body for Printrove order creation:
 * {
 *   "customer_name": "Jane Doe",
 *   "customer_email": "jane@example.com",
 *   "customer_phone": "+919876543210",
 *   "shipping_address": "123 Market Street",
 *   "shipping_city": "Mumbai",
 *   "shipping_state": "Maharashtra",
 *   "shipping_zip": "400001",
 *   "shipping_country": "India",
 *   "items": [
 *     { "productId": "sku_123", "quantity": 2, "size": "M", "color": "Black" }
 *   ],
 *   "notes": "Deliver between 10am and 4pm"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = createOrderSchema.parse(body);
    const order = await createOrder(payload);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("[Printrove API] POST /api/printrove/orders error", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order payload", details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Unable to create Printrove order." },
      { status: 500 }
    );
  }
}
