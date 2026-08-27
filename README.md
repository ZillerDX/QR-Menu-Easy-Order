# 🍽️ Easy Menu & Easy Order (ระบบสั่งอาหารและจัดการร้านอัจฉริยะ)

> **Live Interactive Prototype:** 👉 [https://zillerdx.github.io/QR-Menu-Easy-Order/](https://zillerdx.github.io/QR-Menu-Easy-Order/)

A modern, responsive, zero-install Web Application for smart restaurants, artisan cafes, and diners. Enables customers to scan table QR codes, customize options, pay with PromptPay, and track orders in real time. Equips store owners and staff with a live Kitchen Display System (KDS), Menu Management with image upload, and Store Branding Settings.

---

## 🌟 Key Features (คุณสมบัติเด่น)

### 1. 📱 Responsive Customer Dine-In Ordering (หน้าร้านสำหรับลูกค้า)
* **Zero App Download:** Scannable from any smartphone, tablet, or desktop browser.
* **Smart Menu & Filters:** Category browsing, live keyword search, recipe descriptions, and badges (Chef's Pick / Popular).
* **Detailed Customizations:** Sweetness level, milk substitutes (oat, almond, soy), extra shots, and toppings with automatic price calculations.
* **Bilingual Toggle (EN/TH):** Instant language switching with persistent preference storage (Default is EN).
* **Live Order Tracking:** Real-time progress bar (`Pending` ➔ `Cooking` ➔ `Ready to Serve` ➔ `Completed`).

### 2. 💳 Integrated PromptPay QR Payment (ระบบชำระเงินพร้อมเพย์)
* **Real-time EMVCo QR Code:** Generates official PromptPay payload with dynamic bill amount directly in the browser.
* Supports Cash at Counter and PromptPay transfers.

### 3. 🍳 Kitchen Display System (KDS) (จอห้องครัว)
* **Real-time Order Flow:** Orders submitted by customers appear instantly without refreshing.
* **Audio Alerts:** Built-in Web Audio chime when new orders arrive.
* **Fast Status Transitions:** One-click updates from *Cooking* to *Ready* and *Close Bill*.
* **Stock Manager:** Instant toggle to mark ingredients/items as *In Stock* or *Sold Out*.

### 4. 📋 Menu & Category Management (ระบบจัดการเมนูและหมวดหมู่)
* **Direct Image Upload:** Upload menu photos directly from computer/mobile (PNG, JPG, WebP) or paste an image URL.
* **Category Builder:** Create and customize categories with iconography.
* **Pricing & Highlights:** Set prices and badges (Chef Recommended, Popular).

### 5. ⚙️ Store & Branding Settings (ระบบตั้งค่าร้านค้าและโลโก้)
* **Custom Logo Upload:** Upload store profile/logo image from device, displayed seamlessly across the header and table QR stands.
* **Store Name & Slogans:** Dual-language store naming and taglines.
* **PromptPay & Tables:** Configure merchant PromptPay account number and number of tables (1–50 tables).

### 6. 🖨️ Table QR Stand Generator (ตัวสร้างการ์ด QR โต๊ะ)
* Generate high-resolution scannable QR cards for Tables 01–15+.
* One-click download as PNG and direct print layout.

---

## 🚀 Live Demo Links (ลิงก์ทดสอบใช้งาน)

| View | Role | Direct URL |
| :--- | :--- | :--- |
| **Customer Dine-in (Table 01)** | Diner | [https://zillerdx.github.io/QR-Menu-Easy-Order/?table=01&lang=en](https://zillerdx.github.io/QR-Menu-Easy-Order/?table=01&lang=en) |
| **Customer Dine-in (Table 05 TH)** | Diner | [https://zillerdx.github.io/QR-Menu-Easy-Order/?table=05&lang=th](https://zillerdx.github.io/QR-Menu-Easy-Order/?table=05&lang=th) |
| **Kitchen KDS Dashboard** | Kitchen Staff | [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=kitchen](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=kitchen) |
| **Menu & Item Admin** | Store Owner | [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=admin](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=admin) |
| **Store & Branding Settings** | Store Owner | [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=settings](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=settings) |
| **Table QR Stand Card** | Print / Service | [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=qr](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=qr) |

---

## 💻 Tech Stack & Architecture

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
* **Build Tool:** Vite 6.
* **State & Sync:** Realtime `BroadcastChannel` API + LocalStorage event bridging.
* **Audio:** Web Audio API synthesizer chimes.
* **Deployment:** GitHub Pages via GitHub Actions CI/CD.
