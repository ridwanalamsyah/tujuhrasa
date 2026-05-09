/**
 * Production seed wrapper: only seeds journal posts + promo codes + active batch
 * if the DB is empty. Idempotent — safe to run on every deploy.
 *
 * Products are NOT seeded here: they're auto-stubbed from ERP via
 * `ensureLocalStubs()` in src/lib/products.ts on first request.
 *
 * Reviews are also NOT seeded here: they're per-product and would create stale
 * sample data in production. Real reviews come from /api/reviews.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const journalPosts = [
  {
    slug: "kopi-bukan-tentang-cepat",
    title: "Kopi bukan tentang cepat.",
    excerpt:
      "Banyak yang nanya kenapa botol kami tidak ada di Tokopedia atau ojol. Jawabannya panjang, tapi pendeknya: kami belum siap mengecewakan kamu.",
    body: "Banyak yang nanya kenapa botol kami tidak ada di Tokopedia atau ojol. Jawabannya panjang, tapi pendeknya: kami belum siap mengecewakan kamu.\n\nSetiap botol Tujuh Rasa kami brewing dalam batch kecil dua hari sekali. 8 jam cold brew untuk yang asam, 4 jam untuk yang manis. Kami timbang, kami catat, kami cicipi. Kalau ada yang lewat dari standar (terlalu pahit, kurang manis, ada bubuknya), kami buang.\n\nMakanya kami tidak bisa janji 50 botol siap dalam 2 jam. Tapi kalau kamu pesan hari ini, besok pagi botolnya sudah keluar dari ice bath dan ditempel label oleh tangan kami sendiri.\n\nKopi bukan tentang cepat. Tentang menghormati biji, menghormati waktu, menghormati orang yang akan minum.",
    author: "Yudha, Co-founder",
    cover: "#3a1410",
  },
  {
    slug: "rumus-perbandingan-yang-pas",
    title: "Rumus perbandingan yang pas.",
    excerpt:
      "Catatan ringan dari kepala dapur: bagaimana kami menemukan rasio kopi : air : susu : gula yang pas untuk lidah Indonesia.",
    body: "Awalnya kami pakai rasio yang lazim di kafe spesialti — 1:15 untuk pour over, 2:1 untuk espresso. Tapi setelah ngobrol sama Bu Tati (warung kopi langganan), beliau bilang: 'Mas, kopi yang enak itu yang nggak bikin perut perih.'\n\nDari situ kami eksperimen ulang. Cold brew 8 jam dengan rasio 1:8 (lebih pekat), tapi diencerkan saat botoling jadi 1:14. Asamnya dapat tanpa nyiksa lambung.\n\nUntuk yang manis: kami pakai gula aren cair (bukan gula pasir), karena gula aren melarut sempurna di suhu dingin. Rasio 30 ml per 250 ml kopi. Pas.\n\nUntuk yang gurih (Bumi): kami tambah seujung sendok garam himalaya. Garam memunculkan manis alami biji, tanpa terasa asin.\n\nSemua angka ini hasil dari 200+ percobaan selama 8 bulan. Tidak ada rumus yang turun dari langit. Kami cuma terus mencicip sampai cocok.",
    author: "Mbak Rara, Head of R&D",
    cover: "#e07a3c",
  },
  {
    slug: "pengiriman-pertama",
    title: "Pengiriman pertama (yang nyaris gagal).",
    excerpt:
      "Cerita konyol dari hari pertama buka order: kurir hilang, AC mobil mati, dan kenapa akhirnya kami pilih ojol motor untuk Jabodetabek.",
    body: "Pesanan pertama Tujuh Rasa datang dari Bu Tati, ibu kos di seberang gang. Beliau pesan satu botol Manis. Ongkos kirim ke aplikasi: Rp 12.000. Dari kedai ke rumah Bu Tati: 80 meter.\n\nKami antar sendiri. Bu Tati nyuruh masuk, dikasih pisang goreng, diajak ngobrol setengah jam. Pulang-pulang, beliau pesan lagi 5 botol untuk anaknya yang kuliah di Bandung.\n\nKami belum tahu mana yang lebih kami suka: jualan kopi, atau alasannya jualan kopi.",
    author: "Rara, Co-founder",
    cover: "#5a4632",
  },
];

async function main() {
  const journalCount = await prisma.journalPost.count();
  if (journalCount === 0) {
    console.log("Seeding 3 journal posts...");
    for (const j of journalPosts) {
      await prisma.journalPost.create({ data: j });
    }
  } else {
    console.log(`Skip journal seed (${journalCount} already exist)`);
  }

  const batchCount = await prisma.batch.count();
  if (batchCount === 0) {
    console.log("Seeding active batch...");
    await prisma.batch.create({
      data: { name: process.env.ERP_BATCH_NAME || "Batch Mei 2026", status: "open" },
    });
  } else {
    console.log(`Skip batch seed (${batchCount} already exist)`);
  }

  const promoCount = await prisma.promoCode.count();
  if (promoCount === 0) {
    console.log("Seeding 3 promo codes...");
    await prisma.promoCode.createMany({
      data: [
        { code: "TETANGGA", kind: "percent", value: 10, minSubtotal: 50000, maxRedemption: 100, active: true },
        { code: "GRATISONGKIR", kind: "amount", value: 15000, minSubtotal: 80000, maxRedemption: 50, active: true },
        { code: "TUJUHRIBU", kind: "amount", value: 7000, minSubtotal: 30000, maxRedemption: 0, active: true },
      ],
    });
  } else {
    console.log(`Skip promo seed (${promoCount} already exist)`);
  }

  console.log("Production seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
