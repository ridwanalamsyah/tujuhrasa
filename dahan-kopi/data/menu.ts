/**
 * ============================================================
 *  MENU DAHAN KOPI
 * ============================================================
 *  Disalin dari buku menu Dahan Kopi (Canva: "Book Menu Dahan Clean Version").
 *  Jika harga atau menu berubah, ubah di sini.
 *
 *  Cara menambah item: salin satu blok { ... } lalu ubah isinya.
 *  - name        : nama menu
 *  - description : deskripsi singkat (opsional)
 *  - prices      : daftar harga dalam rupiah tanpa titik.
 *                  Satu harga  : [{ price: 38000 }]
 *                  Hot & ice   : [{ label: "HOT", price: 28000 }, { label: "ICE", price: 28000 }]
 *                  Ukuran      : [{ label: "500 ml", price: 45000 }, { label: "1 L", price: 90000 }]
 *  - image       : foto di public/images/menu/ (opsional)
 *
 *  Cara menambah kategori: salin satu blok kategori, beri `id` unik
 *  (huruf kecil, tanpa spasi). Urutan di sini = urutan di website.
 * ============================================================
 */

import type { MenuCategory } from "@/lib/types";

/** Teks di halaman /menu. */
export const menuPage = {
  title: "Menu",
  priceNote: "Harga dalam ribu rupiah.",
  pdfLabel: "Unduh buku menu (PDF)",
  deliveryLabel: "Pesan antar:",
  note: "Harga bisa berubah sewaktu-waktu.",
};

export const menu: MenuCategory[] = [
  {
    id: "signature",
    name: "Signature Coffee",
    description: "Racikan kopi khas Dahan.",
    items: [
      {
        name: "Dahan Iced",
        description:
          "Espresso bercita rasa kuat dengan susu creamy dan sentuhan manis, kopi susu dingin khas Dahan.",
        prices: [{ label: "ICE", price: 23000 }],
      },
      {
        name: "Sundanese",
        description: "Kopi susu yang lembut: espresso, susu creamy, dan manis yang ringan.",
        prices: [{ label: "ICE", price: 25000 }],
      },
      {
        name: "Sweet Vanilla",
        description: "Kopi dan susu creamy dengan sentuhan vanilla yang manis.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Lotus Coffee",
        description: "Espresso dan susu creamy dengan manis karamel khas biskuit Lotus.",
        prices: [{ label: "ICE", price: 28000 }],
      },
      {
        name: "Irish Coffee",
        description: "Kopi dengan sentuhan Irish cream yang lembut dan manis seimbang.",
        prices: [{ label: "ICE", price: 28000 }],
      },
      {
        name: "Dirty Latte",
        description: "Susu dingin yang creamy dengan espresso pekat di atasnya.",
        prices: [{ label: "ICE", price: 30000 }],
      },
    ],
  },
  {
    id: "kopi",
    name: "Essentials Coffee",
    description: "Kopi klasik, dari yang bold sampai yang lembut.",
    items: [
      {
        name: "Espresso",
        description: "Kopi pekat dengan rasa intens.",
        prices: [{ label: "HOT", price: 24000 }],
      },
      {
        name: "Black Coffee",
        description: "Kopi hitam dengan aroma khas.",
        prices: [
          { label: "HOT", price: 28000 },
          { label: "ICE", price: 28000 },
        ],
      },
      {
        name: "Manual Brew",
        description: "Kopi seduh manual dari biji pilihan.",
        prices: [
          { label: "HOT", price: 28000 },
          { label: "ICE", price: 28000 },
        ],
      },
      {
        name: "Iced Latte",
        description: "Espresso dengan susu dingin yang creamy.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Japanese Iced Lemon",
        description: "Kopi dingin dengan sentuhan lemon.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Sea Salt Butterscotch",
        description: "Kopi susu dengan manis butterscotch dan gurih garam laut.",
        prices: [{ label: "ICE", price: 32000 }],
      },
      {
        name: "Cappucino",
        description: "Espresso dengan susu dan busa lembut.",
        prices: [{ label: "HOT", price: 27000 }],
      },
      {
        name: "Affogato",
        description: "Es krim vanilla dengan espresso panas.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Blackberry",
        description: "Kopi hitam dengan sentuhan buah beri.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Magic",
        description: "Double ristretto dengan susu creamy.",
        prices: [
          { label: "HOT", price: 29000 },
          { label: "ICE", price: 30000 },
        ],
      },
      {
        name: "Split Shot",
        description: "Perpaduan espresso dan cappuccino.",
        prices: [{ label: "HOT", price: 35000 }],
      },
    ],
  },
  {
    id: "non-kopi",
    name: "Non Coffee",
    description: "Minuman creamy tanpa kopi.",
    items: [
      {
        name: "Greentea",
        description: "Teh hijau susu dengan rasa lembut dan creamy.",
        prices: [
          { label: "HOT", price: 24000 },
          { label: "ICE", price: 28000 },
        ],
      },
      {
        name: "Chocolate",
        description: "Cokelat kaya rasa, manis dan creamy.",
        prices: [
          { label: "HOT", price: 26000 },
          { label: "ICE", price: 30000 },
        ],
      },
      {
        name: "Chocoberry",
        description: "Cokelat dengan sentuhan buah beri yang segar.",
        prices: [{ label: "ICE", price: 32000 }],
      },
      {
        name: "Strawberry Cream",
        description: "Stroberi manis dan fruity dengan tekstur creamy.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Blueberry Cream",
        description: "Blueberry manis dengan perpaduan creamy.",
        prices: [{ label: "ICE", price: 30000 }],
      },
      {
        name: "Red Velvet",
        description: "Red velvet yang manis, lembut, dan creamy.",
        prices: [
          { label: "HOT", price: 27000 },
          { label: "ICE", price: 36000 },
        ],
      },
    ],
  },
  {
    id: "teh-mocktail",
    name: "Tea & Mocktail",
    description: "Teh, buah, dan racikan yang segar.",
    items: [
      {
        name: "Helena",
        description: "Kopi, blueberry, dan cherry dengan rasa fruity yang segar.",
        prices: [{ label: "ICE", price: 35000 }],
      },
      {
        name: "Kiwi Mojito",
        description: "Kiwi, jeruk nipis, dan mint, asam-manis yang segar.",
        prices: [{ label: "ICE", price: 31000 }],
      },
      {
        name: "Apple Lime Peach",
        description: "Apel, jeruk nipis, dan peach yang manis dan segar.",
        prices: [{ label: "ICE", price: 31000 }],
      },
      {
        name: "Lychee Tea",
        description: "Teh harum dengan sentuhan leci yang manis.",
        prices: [{ label: "ICE", price: 29000 }],
      },
      {
        name: "Lemon Tea",
        description: "Teh dengan lemon yang segar dan sedikit asam.",
        prices: [{ label: "ICE", price: 24000 }],
      },
      {
        name: "Mineral Water",
        prices: [{ label: "ICE", price: 10000 }],
      },
    ],
  },
  {
    id: "liter",
    name: "Liter Series",
    description: "Dahan in a bottle, untuk dibawa pulang.",
    items: [
      {
        name: "Dahan Iced",
        description: "Kopi susu khas Dahan, bold dengan sentuhan manis.",
        prices: [
          { label: "500 ml", price: 45000 },
          { label: "1 L", price: 90000 },
        ],
      },
      {
        name: "Greentea Latte",
        description: "Matcha yang lembut dengan susu creamy.",
        prices: [
          { label: "500 ml", price: 45000 },
          { label: "1 L", price: 90000 },
        ],
      },
      {
        name: "Helena",
        description: "Mocktail kopi dengan blueberry dan cherry.",
        prices: [
          { label: "500 ml", price: 105000 },
          { label: "1 L", price: 185000 },
        ],
      },
    ],
  },
  {
    id: "makanan",
    name: "Main Course",
    description: "Dari sajian Nusantara sampai menu favorit.",
    items: [
      {
        name: "Nasi Goreng Ala Dahan",
        description: "Nasi goreng khas Dahan yang gurih.",
        prices: [{ price: 38000 }],
      },
      {
        name: "Nasi Ayam Goreng Tempong",
        description: "Ayam goreng dan nasi hangat dengan sambal tempong yang pedas.",
        prices: [{ price: 35000 }],
      },
      {
        name: "Nasi Bakar Dendeng Balado",
        description: "Nasi bakar berisi dendeng balado, gurih dan pedas.",
        prices: [{ price: 32000 }],
      },
      {
        name: "Chicken Curry Katsu",
        description: "Ayam katsu renyah, nasi hangat, dan saus kari.",
        prices: [{ price: 36000 }],
      },
      {
        name: "Chicken Bolognese Katsu",
        description: "Ayam katsu renyah dengan saus bolognese.",
        prices: [{ price: 36000 }],
      },
      {
        name: "Nasi Rawon",
        description: "Nasi dengan kuah rawon kluwek dan daging sapi.",
        prices: [{ price: 42000 }],
      },
      {
        name: "Nasi Tongseng Kambing",
        description: "Nasi hangat dengan tongseng kambing berbumbu rempah.",
        prices: [{ price: 45000 }],
      },
      {
        name: "Roasted Chicken",
        description: "Ayam panggang berbumbu, potato wedges, dan wortel tumis herba.",
        prices: [{ price: 45000 }],
      },
    ],
  },
  {
    id: "camilan",
    name: "Side Dish",
    description: "Camilan untuk sendiri atau bersama.",
    items: [
      {
        name: "Quesadilla",
        description: "Tortilla panggang dengan isian gurih dan keju leleh.",
        prices: [{ price: 25000 }],
      },
      {
        name: "Kentang Goreng",
        description: "Renyah di luar, lembut di dalam.",
        prices: [{ price: 23000 }],
      },
      {
        name: "Tahu Lada Garam",
        description: "Tahu goreng dengan bawang putih, cabai, dan lada.",
        prices: [{ price: 22000 }],
      },
      {
        name: "Chicken Wings",
        description: "Sayap ayam yang renyah dan juicy.",
        prices: [{ price: 25000 }],
      },
      {
        name: "Mix Platter",
        description: "Kentang goreng, sosis, dan tortilla.",
        prices: [{ price: 35000 }],
      },
      {
        name: "Combo Platter",
        description: "Kentang goreng, tortilla, sosis, dan chicken wings untuk bersama.",
        prices: [{ price: 43000 }],
      },
    ],
  },
  {
    id: "dessert",
    name: "Desserts",
    description: "Manis-manis dan pastry teman ngopi.",
    items: [
      {
        name: "Burnt Cheese Cake",
        description: "Cheesecake lembut dengan permukaan karamel.",
        prices: [{ price: 35000 }],
      },
      {
        name: "Blueberry Burnt Cheese Cake",
        description: "Burnt cheesecake dengan blueberry manis-asam.",
        prices: [{ price: 38000 }],
      },
      {
        name: "Red Velvet Cake",
        description: "Kue red velvet lembut dengan manis yang pas.",
        prices: [{ price: 38000 }],
      },
      {
        name: "Cranberry Cheese Bread",
        description: "Roti lembut dengan keju dan cranberry.",
        prices: [{ price: 30000 }],
      },
      {
        name: "Plain Croissant",
        description: "Pastry berlapis dengan aroma butter.",
        prices: [{ price: 25000 }],
      },
      {
        name: "Almond Croissant",
        description: "Croissant renyah dengan almond.",
        prices: [{ price: 30000 }],
      },
    ],
  },
  {
    id: "ramen",
    name: "Ramen Tensai × Dahan Kopi",
    description: "Menu kolaborasi dengan Ramen Tensai.",
    items: [
      {
        name: "Original Tensai Toripaitan",
        description: "Kaldu ayam creamy, ayam panggang, kikurage, daun bawang, dan telur.",
        prices: [{ price: 35000 }],
      },
      {
        name: "Black Garlic Tensai Ramen",
        description: "Kaldu tonkotsu dengan black garlic oil, ayam cincang, dan telur.",
        prices: [{ price: 38000 }],
      },
      {
        name: "Spicy Curry Tensai Ramen",
        description: "Kaldu kari pedas dengan ayam panggang dan telur.",
        prices: [{ price: 40000 }],
      },
      {
        name: "Chicken Katsu Soyu Ramen",
        description: "Kaldu shoyu dengan chicken katsu, jagung manis, dan telur.",
        prices: [{ price: 42000 }],
      },
      {
        name: "Spicy Tantan Tensai Ramen",
        description: "Kaldu tantan pedas dengan daging cincang dan minyak cabai.",
        prices: [{ price: 45000 }],
      },
      {
        name: "Spicy Curry Beef Tensai Ramen",
        description: "Kaldu kari pedas dengan irisan beef dan telur.",
        prices: [{ price: 45000 }],
      },
      {
        name: "Wagyu Soyu Ramen",
        description: "Kaldu shoyu dengan irisan wagyu, daun bawang, dan telur.",
        prices: [{ price: 50000 }],
      },
      {
        name: "Tensai Wagyu Creamy Ramen",
        description: "Kaldu ayam creamy dengan beef, jagung manis, dan telur.",
        prices: [{ price: 55000 }],
      },
      {
        name: "Gyoza",
        description: "Pangsit Jepang dengan isian gurih.",
        prices: [{ price: 22000 }],
      },
      {
        name: "Lumpia Ayam Goreng",
        description: "Kulit tahu berisi ayam berbumbu.",
        prices: [{ price: 22000 }],
      },
      {
        name: "Ebi Furai",
        description: "Udang berbalut tepung panir yang renyah.",
        prices: [{ price: 25000 }],
      },
      {
        name: "Ekado",
        description: "Kulit tahu berisi adonan berbumbu, digoreng keemasan.",
        prices: [{ price: 25000 }],
      },
    ],
  },
];
