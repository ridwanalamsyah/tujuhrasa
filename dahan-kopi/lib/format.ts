const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 25000 → "Rp 25.000" (untuk pembaca layar dan data terstruktur). */
export function formatPrice(value: number): string {
  return rupiah.format(value).replace(/\s/g, " ");
}

/** 25000 → "25", 27500 → "27,5" (harga ala buku menu, dalam ribu rupiah). */
export function formatPriceShort(value: number): string {
  return (value / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
}
