import { describe, it, expect } from "vitest";
import { CheckoutSchema } from "@/lib/checkout-schema";

const validBase = {
  customerName: "Asep Setiawan",
  customerEmail: "asep@example.com",
  customerPhone: "08123456789",
  shippingAddress: "Jl. A.H. Nasution No. 105, Cibiru",
  shippingCity: "Bandung",
  shippingZip: "40614",
  paymentMethod: "gopay" as const,
};

describe("CheckoutSchema", () => {
  it("accepts a minimum valid input (no accountMode)", () => {
    const r = CheckoutSchema.safeParse(validBase);
    expect(r.success).toBe(true);
  });

  it("accepts accountMode='member'", () => {
    const r = CheckoutSchema.safeParse({ ...validBase, accountMode: "member" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.accountMode).toBe("member");
  });

  it("accepts accountMode='guest'", () => {
    const r = CheckoutSchema.safeParse({ ...validBase, accountMode: "guest" });
    expect(r.success).toBe(true);
  });

  it("rejects unknown accountMode value", () => {
    const r = CheckoutSchema.safeParse({ ...validBase, accountMode: "vip" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = CheckoutSchema.safeParse({ ...validBase, customerEmail: "x" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = r.error.flatten().fieldErrors;
      expect(fields.customerEmail?.length).toBeGreaterThan(0);
    }
  });

  it("rejects short phone (< 7 digits)", () => {
    const r = CheckoutSchema.safeParse({ ...validBase, customerPhone: "0812" });
    expect(r.success).toBe(false);
  });

  it("rejects unknown payment method", () => {
    const r = CheckoutSchema.safeParse({
      ...validBase,
      paymentMethod: "qris",
    });
    expect(r.success).toBe(false);
  });

  it("accepts cod (offline) as payment method", () => {
    const r = CheckoutSchema.safeParse({ ...validBase, paymentMethod: "cod" });
    expect(r.success).toBe(true);
  });

  it("flatten() lists multiple field errors at once", () => {
    const r = CheckoutSchema.safeParse({
      customerName: "A",
      customerEmail: "no",
      customerPhone: "1",
      shippingAddress: "x",
      shippingCity: "",
      shippingZip: "",
      paymentMethod: "gopay",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = r.error.flatten().fieldErrors;
      expect(Object.keys(fields).length).toBeGreaterThanOrEqual(5);
    }
  });
});
