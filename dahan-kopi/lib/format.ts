const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 25000 → "Rp 25.000" */
export function formatPrice(value: number): string {
  return rupiah.format(value).replace(/\s/g, " ");
}
