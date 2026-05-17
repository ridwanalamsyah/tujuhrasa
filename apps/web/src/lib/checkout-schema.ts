import { z } from "zod";

/**
 * Schema input untuk POST /api/checkout.
 *
 * `accountMode` adalah inti dari dual-path checkout:
 * - `"member"` → set cookie `tr_member`, customer di ERP ditandai `isMember`.
 * - `"guest"` → tidak buat akun, customer di ERP ditandai `isGuest`.
 * - undefined → diperlakukan sebagai guest (fallback aman).
 *
 * Diekspor terpisah dari route handler supaya bisa di-unit-test tanpa
 * harus stub Prisma / `next/headers` / ERP.
 */
export const CheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingZip: z.string().min(3),
  notes: z.string().optional(),
  paymentMethod: z.enum(["gopay", "ovo", "bca-va", "cod"]),
  promoCode: z.string().optional(),
  birthDate: z.string().optional(),
  accountMode: z.enum(["member", "guest"]).optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
