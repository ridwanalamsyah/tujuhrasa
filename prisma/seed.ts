import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Each bottle: a unique SVG illustration with rasa-specific accent
const bottle = (accent: string, label: string, badge: string) => `
<svg viewBox="0 0 200 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-${label}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="1"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.78"/>
    </linearGradient>
  </defs>
  <!-- bottle silhouette -->
  <path d="M75 20 h50 v36 q0 6 4 10 l14 14 q10 8 10 22 v210 q0 24 -24 24 h-58 q-24 0 -24 -24 v-210 q0 -14 10 -22 l14 -14 q4 -4 4 -10 z"
        fill="url(#g-${label})" stroke="#3a1410" stroke-width="2"/>
  <!-- cap -->
  <rect x="78" y="14" width="44" height="14" rx="3" fill="#3a1410"/>
  <rect x="80" y="10" width="40" height="6" rx="2" fill="#3a1410"/>
  <!-- neck shine -->
  <path d="M82 30 v22" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round"/>
  <!-- big label -->
  <rect x="38" y="120" width="124" height="160" rx="6" fill="#f7efde" stroke="#3a1410" stroke-width="1.6"/>
  <!-- label inner band -->
  <rect x="46" y="132" width="108" height="22" fill="${accent}"/>
  <text x="100" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#f7efde" letter-spacing="2">TUJUH RASA</text>
  <text x="100" y="200" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="32" fill="#3a1410">${label}</text>
  <text x="100" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#3a1410" letter-spacing="2">${badge}</text>
  <!-- small dotted line -->
  <line x1="56" y1="244" x2="144" y2="244" stroke="#3a1410" stroke-width="1" stroke-dasharray="2 3"/>
  <text x="100" y="260" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#3a1410">cold brew · 250ml</text>
  <!-- bottom mark -->
  <circle cx="100" cy="275" r="6" fill="${accent}"/>
  <!-- shadow -->
  <ellipse cx="100" cy="340" rx="60" ry="6" fill="rgba(0,0,0,0.12)"/>
</svg>
`.trim();

const products = [
  {
    slug: "manis-gula-aren",
    name: "Manis — Gula Aren",
    rasa: "manis",
    tagline: "ramah seperti tetangga",
    description:
      "Espresso double yang ditarik pelan, dipasangkan dengan susu segar dan gula aren cair dari petani Banyuwangi. Manisnya tidak mendominasi, hanya membuka jalan.",
    origin: "Java Banyuwangi",
    process: "Washed",
    roast: "Medium",
    volume: 250,
    caffeine: "~110mg",
    ingredients: "kopi arabika; susu segar; gula aren; air; sedikit garam laut",
    notes: "gula aren; susu; coklat susu; vanila",
    brewTip: "Kocok pelan. Tuang ke gelas berisi es batu besar. Sip lambat, biarkan rasanya membuka.",
    story:
      "Botol pertama Tujuh Rasa. Lahir dari kebiasaan sederhana: ngopi sambil ngobrol di teras dengan tetangga. Manis yang sopan — bukan untuk pamer, tapi untuk menemani.",
    priceCents: 28000,
    comparePriceCents: 32000,
    accentHex: "#e07a3c",
    bgHex: "#fce8c9",
    isFeatured: true,
    sku: "TR-MANIS-01",
    cat: "Kopi Botol",
    sat: "botol",
    gros: 11200,    // HPP ~40%
    minStk: 12,
    baristaSop: "Tarik espresso 2 shot (18g, 27ml, 25-30s) → tuang gula aren cair 30ml → tambahkan susu segar 200ml dingin → kocok di shaker → botolkan ke kaca 250ml",
    baristaTempC: 4,
    baristaTimeS: 90,
    baristaYieldMl: 250,
  },
  {
    slug: "pahit-aceh-gayo",
    name: "Pahit — Aceh Gayo",
    rasa: "pahit",
    tagline: "tegas, tanpa basa-basi",
    description:
      "Single origin Aceh Gayo, ditarik double shot, ditambah air dingin. Tidak ada gula, tidak ada susu. Hanya kopi yang serius dengan dirinya sendiri.",
    origin: "Aceh Gayo",
    process: "Wet-hulled",
    roast: "Dark",
    volume: 250,
    caffeine: "~140mg",
    ingredients: "kopi arabika 100%; air mineral",
    notes: "coklat hitam; tembakau; finish kering",
    brewTip: "Sajikan dingin langsung dari kulkas. Untuk pagi yang butuh diingatkan bahwa hari sudah dimulai.",
    story:
      "Untuk yang tidak suka basa-basi. Petani Gayo menumbuhkan biji ini di ketinggian 1.400 mdpl, dan kami tidak menambah apa-apa selain rasa hormat.",
    priceCents: 32000,
    accentHex: "#3a1410",
    bgHex: "#dccdb4",
    isFeatured: true,
    sku: "TR-PAHIT-01",
    cat: "Kopi Botol",
    sat: "botol",
    gros: 12800,
    minStk: 12,
    baristaSop: "Tarik espresso double shot dari biji Aceh Gayo (18g, 27ml, 28s) → encerkan dengan air dingin 220ml → tidak ada gula/susu → botolkan langsung",
    baristaTempC: 4,
    baristaTimeS: 60,
    baristaYieldMl: 250,
  },
  {
    slug: "asam-toraja-sapan",
    name: "Asam — Toraja Sapan",
    rasa: "asam",
    tagline: "segar seperti hujan pertama",
    description:
      "V60 Toraja Sapan dingin. Asam jeruk yang cerah, sedikit aroma mawar, finish bersih. Bukan asam yang menusuk — asam yang menyegarkan.",
    origin: "Toraja Sapan",
    process: "Washed",
    roast: "Light",
    volume: 250,
    caffeine: "~95mg",
    ingredients: "kopi arabika; air mineral",
    notes: "jeruk; mawar; teh hitam; lemon zest",
    brewTip: "Jangan tambah susu — biarkan asamnya membuka. Cocok dengan camilan ringan: roti tawar, pisang.",
    story:
      "Diseduh metode V60 dingin selama 18 jam. Hasilnya: kopi yang lebih dekat ke teh dibanding ke kopi. Untuk yang baru kenal pour-over.",
    priceCents: 35000,
    accentHex: "#c5b045",
    bgHex: "#f1e9c1",
    isFeatured: true,
    sku: "TR-ASAM-01",
    cat: "Kopi Botol",
    sat: "botol",
    gros: 14000,
    minStk: 8,
    baristaSop: "V60 dingin 18 jam dari biji Toraja Sapan, ratio 1:15. Filter kertas. Tidak ditambah apa-apa. Botolkan setelah dingin",
    baristaTempC: 4,
    baristaTimeS: 64800, // 18 jam
    baristaYieldMl: 250,
  },
  {
    slug: "gurih-santan-pandan",
    name: "Gurih — Santan Pandan",
    rasa: "gurih",
    tagline: "pulang ke rumah nenek",
    description:
      "Espresso, santan kelapa segar, esens pandan asli. Gurih yang lembut — seperti es campur tapi lebih dewasa.",
    origin: "Java Preanger",
    process: "Honey",
    roast: "Medium",
    volume: 250,
    caffeine: "~100mg",
    ingredients: "kopi arabika; santan kelapa; pandan; gula aren; sedikit garam",
    notes: "kelapa; pandan; karamel; pisang panggang",
    brewTip: "Kocok kuat sebelum dibuka — santannya memang turun. Sajikan dingin.",
    story:
      "Resep dari Ibu Sari, tetangga sebelah yang punya warung kopi tradisional. Kami pinjam resepnya dan masukkan ke botol — dengan izin, tentu saja.",
    priceCents: 32000,
    accentHex: "#7e8c5a",
    bgHex: "#dde2c1",
    isFeatured: false,
    sku: "TR-GURIH-01",
    cat: "Kopi Botol",
    sat: "botol",
    gros: 12800,
    minStk: 10,
    baristaSop: "Espresso 2 shot → santan kelapa segar 150ml → essence pandan 5ml → gula aren 20ml → garam laut sejumput → kocok dingin → botolkan",
    baristaTempC: 4,
    baristaTimeS: 120,
    baristaYieldMl: 250,
  },
  {
    slug: "rempah-jahe-sereh",
    name: "Rempah — Jahe Sereh",
    rasa: "rempah",
    tagline: "untuk pagi yang dingin",
    description:
      "Tubruk pekat dengan jahe merah, sereh, dan kayu manis. Tidak terlalu pedas — cukup untuk membangunkan tanpa membentak.",
    origin: "Java Preanger",
    process: "Natural",
    roast: "Medium-Dark",
    volume: 250,
    caffeine: "~120mg",
    ingredients: "kopi arabika; jahe merah; sereh; kayu manis; gula aren",
    notes: "jahe; sereh; kayu manis; cengkeh ringan",
    brewTip: "Bisa dipanaskan sebentar di panci kecil untuk hangat-hangat. Cocok dengan ubi rebus.",
    story:
      "Variasi modern dari kopi jahe Bandung. Dibuat untuk musim hujan di Jakarta — dan untuk siapa saja yang sedang flu.",
    priceCents: 30000,
    accentHex: "#a04a2a",
    bgHex: "#ecd0bd",
    isFeatured: false,
    sku: "TR-REMPAH-01",
    cat: "Kopi Botol",
    sat: "botol",
    gros: 12000,
    minStk: 10,
    baristaSop: "Tubruk pekat (10g/250ml) → rebus dengan jahe merah parut 5g + sereh 1 batang + kayu manis 2cm → saring → gula aren 25ml → dinginkan → botolkan",
    baristaTempC: 4,
    baristaTimeS: 600,
    baristaYieldMl: 250,
  },
  {
    slug: "bumi-cold-brew-kintamani",
    name: "Bumi — Cold Brew Kintamani",
    rasa: "bumi",
    tagline: "earthy, dalam, tenang",
    description:
      "Cold brew Kintamani 18 jam. Body tebal, finish coklat hitam, sedikit aroma tanah hujan. Disajikan tanpa pemanis.",
    origin: "Bali Kintamani",
    process: "Washed",
    roast: "Medium-Dark",
    volume: 330,
    caffeine: "~165mg",
    ingredients: "kopi arabika; air mineral",
    notes: "coklat hitam; cocoa nibs; tanah; finish panjang",
    brewTip: "Sajikan dalam gelas batu hangat. Kalau mau ringan, encerkan dengan air dingin 1:1.",
    story:
      "Botol terbesar kami — 330ml. Untuk hari yang panjang. Untuk shift malam, untuk deadline, untuk yang sedang berpikir keras.",
    priceCents: 38000,
    accentHex: "#5a4632",
    bgHex: "#d6c4a8",
    isFeatured: true,
    sku: "TR-BUMI-01",
    cat: "Kopi Botol",
    sat: "botol",
    gros: 15200,
    minStk: 8,
    baristaSop: "Cold brew immersion 18 jam dari biji Kintamani, ratio 1:8. Filter dua kali (kertas + kain). Tidak ada pemanis. Botolkan ke 330ml",
    baristaTempC: 4,
    baristaTimeS: 64800,
    baristaYieldMl: 330,
  },
  {
    slug: "hangat-wedang-uwuh",
    name: "Hangat — Wedang Uwuh",
    rasa: "hangat",
    tagline: "bukan kopi, tetap dirayakan",
    description:
      "Botol non-kopi kami: rempah-rempah Yogyakarta lengkap — secang, kayu manis, cengkeh, pala, jahe — dengan gula batu. Untuk yang sedang istirahat dari kafein.",
    origin: "Yogyakarta",
    process: "Tradisional",
    roast: "—",
    volume: 250,
    caffeine: "0mg (bebas kafein)",
    ingredients: "secang; kayu manis; cengkeh; pala; jahe; sereh; gula batu",
    notes: "secang; kayu manis; cengkeh; manis batu",
    brewTip: "Bisa dipanaskan. Bisa diminum dingin. Bisa juga diminum sambil tiduran. Tidak ada cara salah.",
    story:
      "Untuk yang tidak boleh kopi tapi tetap mau ikut duduk di meja. Untuk ibu hamil, untuk yang puasa kafein, untuk yang sedang flu.",
    priceCents: 26000,
    accentHex: "#d97757",
    bgHex: "#f3d7c5",
    isFeatured: true,
    sku: "TR-HANGAT-01",
    cat: "Wedang",
    sat: "botol",
    gros: 10400,
    minStk: 10,
    baristaSop: "Rebus secang 5g + kayu manis 2cm + cengkeh 3 butir + pala parut 1g + jahe iris 5g + sereh 1 batang dalam 500ml air → 20 menit → tambahkan gula batu 30g → saring → dinginkan → botolkan ke 250ml",
    baristaTempC: 4,
    baristaTimeS: 1200,
    baristaYieldMl: 250,
  },
];

const journalPosts = [
  {
    slug: "kenapa-tujuh-rasa",
    title: "Kenapa Tujuh Rasa, Bukan Lima atau Sepuluh?",
    excerpt: "Tentang asal-usul nama, dan kenapa tujuh adalah angka yang pas untuk satu meja makan.",
    body: "Awalnya kami mau bikin lima. Lima cukup ringkas, mudah diingat, mudah ditata di rak. Tapi waktu kami coba, ada dua rasa yang tidak kebagian tempat: rempah dan hangat.\n\nRempah penting karena Indonesia tidak bisa lepas dari jahe, sereh, kayu manis. Hangat penting karena tidak semua orang bisa atau mau minum kopi — dan kami tidak mau ada yang tidak kebagian. Jadi tujuh.\n\nKenapa bukan sepuluh? Karena meja kami cuma muat tujuh kursi.",
    author: "Tim Tujuh Rasa",
    cover: "#e07a3c",
  },
  {
    slug: "cara-baca-label",
    title: "Cara Baca Label Botol Kami",
    excerpt: "Setiap botol punya cerita yang bisa dibaca dari labelnya. Ini panduannya.",
    body: "Label kami sengaja ringkas. Di bagian atas: nama rasa. Di tengah: nama daerah asal biji kopi. Di bawah: cara penyeduhan dan volume.\n\nKalau ada simbol bulat di pojok kanan bawah, itu menandakan botol ini single origin (satu daerah, satu kebun). Kalau ada dua simbol, berarti blend dari dua daerah.\n\nDi belakang botol, kamu akan menemukan tanggal sangrai dan nama barista yang menyangrai. Iya, kami tulis namanya, biar kamu kenal siapa yang masakin kopimu.",
    author: "Bayu, Roaster",
    cover: "#7e8c5a",
  },
  {
    slug: "mengantar-kopi-ke-tetangga",
    title: "Mengantar Kopi ke Tetangga",
    excerpt: "Cerita dari pengiriman pertama kami — yang ternyata cuma berjarak 80 meter.",
    body: "Pesanan pertama Tujuh Rasa datang dari Bu Tati, ibu kos di seberang gang. Beliau pesan satu botol Manis. Ongkos kirim ke aplikasi: Rp 12.000. Dari kedai ke rumah Bu Tati: 80 meter.\n\nKami antar sendiri. Bu Tati nyuruh masuk, dikasih pisang goreng, diajak ngobrol setengah jam. Pulang-pulang, beliau pesan lagi 5 botol untuk anaknya yang kuliah di Bandung.\n\nKami belum tahu mana yang lebih kami suka: jualan kopi, atau alasannya jualan kopi.",
    author: "Rara, Co-founder",
    cover: "#5a4632",
  },
];

async function main() {
  // wipe (order matters for foreign keys)
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.pointsActivity.deleteMany().catch(() => {});
  await prisma.erpSyncLog.deleteMany().catch(() => {});
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.product.deleteMany();
  await prisma.journalPost.deleteMany();
  await prisma.batch.deleteMany().catch(() => {});
  await prisma.promoCode.deleteMany().catch(() => {});

  for (const p of products) {
    const labelText = p.rasa.charAt(0).toUpperCase() + p.rasa.slice(1);
    const badge = p.origin.toUpperCase().slice(0, 18);
    const svg = bottle(p.accentHex, labelText, badge);
    const created = await prisma.product.create({
      data: { ...p, bottleSvg: svg },
    });
    // seed a couple of reviews per product
    const reviews = [
      { rating: 5, customer: "Rizky", comment: "Pas banget rasanya, gak terlalu manis. Beli lagi minggu depan." },
      { rating: 4, customer: "Ayu", comment: "Botolnya lucu, dan rasanya beneran sesuai deskripsi. Recommended." },
      { rating: 5, customer: "Budi", comment: "Pulang kerja langsung tenang." },
    ];
    for (const r of reviews) {
      await prisma.review.create({ data: { ...r, productId: created.id } });
    }
  }

  for (const j of journalPosts) {
    await prisma.journalPost.create({ data: j });
  }

  // Active batch (matches ERP Order.batch convention)
  await prisma.batch.create({
    data: { name: "Batch Mei 2026", status: "open", notes: "Diseduh & dibotolkan minggu pertama Mei 2026." },
  });

  // Sample promo codes (will also be mirrored to ERP state.promos manually if needed)
  await prisma.promoCode.createMany({
    data: [
      { code: "TETANGGA", kind: "percent", value: 10, minSubtotal: 50000, maxRedemption: 100, active: true },
      { code: "GRATISONGKIR", kind: "amount", value: 15000, minSubtotal: 80000, maxRedemption: 50, active: true },
      { code: "TUJUHRIBU", kind: "amount", value: 7000, minSubtotal: 30000, maxRedemption: 0, active: true },
    ],
  });

  console.log(
    "Seeded",
    products.length,
    "products,",
    journalPosts.length,
    "journal posts,",
    "1 batch, 3 promo codes."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
