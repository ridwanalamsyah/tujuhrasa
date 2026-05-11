# Mobile Build (Android APK / iOS) — Capacitor

PWA Tujuh Rasa bisa di-bundle jadi APK Android (Play Store) atau IPA iOS (App Store) tanpa rewrite — pakai [Capacitor](https://capacitorjs.com/).

## Prasyarat

- Node.js 18+
- **Android:** Android Studio (untuk build APK)
- **iOS:** macOS + Xcode (App Store hanya bisa build dari Mac)

## Build pertama kali

```bash
# 1. Install Capacitor CLI di project
npm install --save @capacitor/core
npm install --save-dev @capacitor/cli

# 2. Init (sudah ada capacitor.config.json di repo, jadi skip jika sudah ter-init)
npx cap init "Tujuh Rasa" "id.tujuhrasa.erp" --web-dir="."

# 3. Tambah platform Android
npm install --save @capacitor/android
npx cap add android

# 4. (opsional) Tambah platform iOS
npm install --save @capacitor/ios
npx cap add ios

# 5. Sync web assets ke native project
npx cap sync
```

## Buka di Android Studio

```bash
npx cap open android
```

Lalu **Build → Generate Signed Bundle / APK** untuk hasilkan APK siap install.

## Buka di Xcode (Mac only)

```bash
npx cap open ios
```

Lalu **Product → Archive** untuk hasilkan IPA siap upload ke App Store Connect.

## Update setelah perubahan kode

Setiap kali code web berubah:

```bash
# Sync web → native shells
npx cap sync

# Lalu build ulang di Android Studio / Xcode
```

## Catatan

- **Service Worker tidak jalan** di Capacitor wrapper (gunakan caching native instead)
- **Web Bluetooth printer** masih jalan via `@capacitor-community/bluetooth-le` plugin (perlu rewrite tipis di printer.service.js)
- **Push notification:** install `@capacitor/push-notifications` plugin + Firebase config
- **Camera** untuk OCR struk: install `@capacitor/camera`

## Alternatif: TWA (Trusted Web Activity)

Jika hanya butuh Android dan tidak butuh native plugin, gunakan [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) untuk wrap PWA langsung jadi APK tanpa Capacitor:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://your-app.vercel.app/manifest.webmanifest
bubblewrap build
```

Hasil: APK siap upload ke Play Store, semua update web otomatis tersinkron tanpa rebuild APK.
