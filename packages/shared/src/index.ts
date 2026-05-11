import { z } from "zod";

export const ProductSchema = z.object({
  pid: z.string(),
  sku: z.string(),
  name: z.string(),
  cat: z.string(),
  sat: z.string().default("botol"),
  sell: z.number(),
  gros: z.number().default(0),
  stock: z.number().default(0),
  minStk: z.number().default(0),
  photo: z.string().optional(),
  volume: z.number().optional(),
  active: z.boolean().default(true),
  barista: z
    .object({
      sop: z.string().optional(),
      temp: z.string().optional(),
      yieldMl: z.number().optional(),
    })
    .optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const OrderItemSchema = z.object({
  pid: z.string(),
  pname: z.string(),
  qty: z.number(),
  sell: z.number(),
  disc: z.number().default(0),
  hpp: z.number().default(0),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  ts: z.string(),
  buyer: z.string(),
  wa: z.string(),
  email: z.string().optional(),
  city: z.string(),
  addr: z.string().optional(),
  items: z.array(OrderItemSchema),
  ongkir: z.number().default(0),
  total: z.number(),
  status: z.enum(["unpaid", "partial", "paid"]).default("unpaid"),
  batch: z.string().optional(),
  source: z.enum(["web", "erp", "pos"]).default("web"),
});
export type Order = z.infer<typeof OrderSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  method: z.string(),
  amount: z.number(),
  ref: z.string().optional(),
  ts: z.string(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  wa: z.string(),
  email: z.string().optional(),
  city: z.string().optional(),
  totalSpend: z.number().default(0),
  orders: z.number().default(0),
  firstOrderAt: z.string().optional(),
  lastOrderAt: z.string().optional(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const PromoCodeSchema = z.object({
  code: z.string(),
  type: z.enum(["percent", "amount"]),
  value: z.number(),
  minSubtotal: z.number().default(0),
  maxDiscount: z.number().optional(),
  expiresAt: z.string().optional(),
  usageLimit: z.number().optional(),
  usageCount: z.number().default(0),
  active: z.boolean().default(true),
});
export type PromoCode = z.infer<typeof PromoCodeSchema>;

export const ErpStateSchema = z.object({
  products: z.array(ProductSchema).default([]),
  orders: z.array(OrderSchema).default([]),
  payments: z.array(PaymentSchema).default([]),
  customers: z.array(CustomerSchema).default([]),
  promos: z.array(PromoCodeSchema).default([]),
  settings: z.record(z.unknown()).default({}),
});
export type ErpState = z.infer<typeof ErpStateSchema>;

export const ERP_STATE_KEY = "tr_erp_v3:state" as const;

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export const newOrderId = (existing: string[]): string => {
  const nums = existing
    .map((id) => /^ORD-(\d+)$/i.exec(id)?.[1])
    .filter(Boolean)
    .map((s) => parseInt(s as string, 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ORD-${String(next).padStart(4, "0")}`;
};
