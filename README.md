# ☕ QR Menu & Easy Order — Smart Restaurant & Cafe Ordering System

> **A modern, mobile-first QR ordering web application with a real-time Kitchen Display System (KDS) and printable table QR stand generator. 100% serverless, zero-cost to host, and production-ready.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://zillerdx.github.io/QR-Menu-Easy-Order/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/ZillerDX/QR-Menu-Easy-Order)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌐 Live Interactive Demo

Open the links below across your smartphone, tablet, or separate browser tabs:

* 🚀 **Main Live Web App:** [https://zillerdx.github.io/QR-Menu-Easy-Order/](https://zillerdx.github.io/QR-Menu-Easy-Order/)
* 📱 **Customer Table 05 (Thai):** [https://zillerdx.github.io/QR-Menu-Easy-Order/?table=05&lang=th](https://zillerdx.github.io/QR-Menu-Easy-Order/?table=05&lang=th)
* 📱 **Customer Table 08 (English):** [https://zillerdx.github.io/QR-Menu-Easy-Order/?table=08&lang=en](https://zillerdx.github.io/QR-Menu-Easy-Order/?table=08&lang=en)
* 🍳 **Kitchen KDS Dashboard:** [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=kitchen](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=kitchen)
* 🖨️ **Table QR Stand Generator:** [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=qr](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=qr)

---

## 🌟 Key Features

### 1. 📱 Customer Ordering View (Mobile-First Web App)
* **No App Download Required:** Customers scan the table QR code and start ordering instantly in their mobile browser.
* **Table Deep-Linking:** Automatically detects table number from URL (e.g. `?table=05`) or allows switching between Dine-In and Takeaway.
* **Bilingual Support (EN / TH):** 1-click instant language toggle between English and Thai across all menus and option groups.
* **Deep Customization (Modifiers):** Sweetness levels (0%, 25%, 50%, 100%), alternative milk choices (Oat, Soy, Almond), espresso shots, and special chef instructions.
* **Dynamic Thai PromptPay QR Generator:** Calculates the exact subtotal and generates compliant EMVCo PromptPay QR codes directly on the client side with CRC16 checksum.
* **Live Order Tracker:** Visual stage tracker (`Received` ➔ `Preparing` ➔ `Ready to Serve` ➔ `Completed`) with confetti celebration upon order completion.

### 2. 🍳 Kitchen Display System (KDS Dashboard)
* **Real-time Order Stream:** Incoming orders pop up instantly on the kitchen screen with acoustic chimes.
* **Order Status Workflow:** Kitchen staff can transition orders seamlessly (`Start Cooking` ➔ `Ready to Serve` ➔ `Close Bill`).
* **Live Stock Manager:** 1-click toggle to mark items out of stock (Sold Out), immediately updating the customer menu in real-time.
* **Revenue & Order Metrics:** Daily sales tally, active order count, and audio chime tester.

### 3. 🖨️ Table QR Code Stand Generator
* **Automatic Table Code Generation:** Generate individual scannable QR codes for Tables 01 to 15.
* **Printable Stand Mockup:** Ready-to-print acrylic table stand card preview with instructions and branding.
* **Direct Image Download:** Export high-resolution QR PNG files for printing stickers or physical stands.

---

## 🛠️ Zero-Cost Architecture & Tech Stack

| Layer | Technology | Why & Cost |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite + TypeScript | Blazing-fast performance, static asset optimization |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | Responsive Artisan Cafe aesthetic, modern typography |
| **Realtime Engine** | `BroadcastChannel API` + Storage Events | Zero-latency cross-tab & multi-window sync with **$0 server cost** |
| **Payment QR Engine** | Client-side EMVCo QR + CRC16 Checksum | Native Thai PromptPay QR generation with **0% payment gateway fees** |
| **Audio Engine** | Web Audio API Synthesizer | Built-in melodic chimes without external MP3 dependencies |
| **Hosting & CI/CD** | GitHub Actions + GitHub Pages | Continuous automated deployment with **100% free hosting** |

---

## 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/ZillerDX/QR-Menu-Easy-Order.git
cd QR-Menu-Easy-Order

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

> 💡 **Testing Real-Time Sync Locally:**
> Open two browser windows side by side:
> * **Window 1 (Customer):** `http://localhost:5173/?table=03`
> * **Window 2 (Kitchen):** `http://localhost:5173/?role=kitchen`
> 
> Place an order in Window 1, and watch it pop up in Window 2 in real-time with an audio chime!

```bash
# 4. Build for production
npm run build
```

---

<br/>

---

# 🇹🇭 ภาษาไทย (Thai Version)

## ☕ QR Menu & Easy Order — ระบบสั่งอาหารผ่าน QR Code และจอครัวอัจฉริยะ

> **เว็บแอปพลิเคชันสั่งอาหารผ่าน QR Code สำหรับร้านอาหาร คาเฟ่ และบาร์ ไม่ต้องโหลดแอป พร้อมหน้าจอห้องครัว Real-time (KDS) และตัวสร้างการ์ดตั้งโต๊ะ ต้นทุนเซิร์ฟเวอร์ 0 บาท พร้อมใช้งานทันที**

---

### 🌐 ลิงก์เข้าทดสอบระบบออนไลน์

* 🚀 **เว็บไซต์หลัก:** [https://zillerdx.github.io/QR-Menu-Easy-Order/](https://zillerdx.github.io/QR-Menu-Easy-Order/)
* 📱 **หน้าจอลูกค้า โต๊ะ 05 (ภาษาไทย):** [https://zillerdx.github.io/QR-Menu-Easy-Order/?table=05&lang=th](https://zillerdx.github.io/QR-Menu-Easy-Order/?table=05&lang=th)
* 📱 **หน้าจอลูกค้า โต๊ะ 08 (ภาษาอังกฤษ):** [https://zillerdx.github.io/QR-Menu-Easy-Order/?table=08&lang=en](https://zillerdx.github.io/QR-Menu-Easy-Order/?table=08&lang=en)
* 🍳 **หน้าจอห้องครัว Kitchen KDS:** [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=kitchen](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=kitchen)
* 🖨️ **เครื่องมือสร้าง QR Code ประจำโต๊ะ:** [https://zillerdx.github.io/QR-Menu-Easy-Order/?role=qr](https://zillerdx.github.io/QR-Menu-Easy-Order/?role=qr)

---

### 🌟 ฟังก์ชันเด่นของระบบ

1. **ฝั่งลูกค้า (Customer Mobile Web):**
   * สแกน QR แล้วเปิดหน้าเมนูตามเบอร์โต๊ะได้ทันที ไม่ต้องดาวน์โหลดแอป
   * รองรับ 2 ภาษา **(ไทย / อังกฤษ)** สลับได้ในคลิกเดียว
   * ปรับแต่งเมนูได้ละเอียด (ระดับความหวาน 0-100%, นมข้าวโอ๊ต, เพิ่มช็อตกาแฟ, ระบุหมายเหตุพิเศษ)
   * สร้าง **QR Code พร้อมเพย์ตามยอดจริง (PromptPay QR)** มาตรฐาน EMVCo พร้อมระบบตรวจสอบความถูกต้อง
   * หน้าจอติดตามสถานะการทำอาหารแบบ Real-time พร้อมเอฟเฟกต์เฉลิมฉลองเมื่อพร้อมเสิร์ฟ
2. **ฝั่งห้องครัว (Kitchen KDS Dashboard):**
   * ออเดอร์เด้งเข้าหน้าจอทันทีเมื่อลูกค้ากดสั่ง พร้อมเสียงเตือน (Chime Bell)
   * กดเปลี่ยนสถานะออเดอร์ (`เริ่มปรุง` ➔ `พร้อมเสิร์ฟ` ➔ `เสร็จสิ้น/ปิดบิล`)
   * จัดการสต็อกด่วน เปิด/ปิด เมนูหมด (Sold Out) ได้จากหน้าจอ
3. **เครื่องมือสร้าง QR Code ประจำโต๊ะ:**
   * สร้าง QR Code โต๊ะ 01–15 พร้อมพรีวิวการ์ดตั้งโต๊ะขนาดมาตรฐาน สั่งพิมพ์หรือดาวน์โหลดรูปภาพได้ทันที

---

### 💼 แผนธุรกิจและรูปแบบการนำไปขายให้ร้านอาหาร

* **แพ็กเกจ Setup พร้อมใช้ (Done-For-You):** **1,500 – 2,500 บาท** (บริการคีย์เมนู + ส่งขาตั้งการ์ดอะคริลิก QR Code ให้ถึงร้าน 5–10 ชิ้น)
* **แพ็กเกจสมาชิกรายเดือน (SaaS Subscription):** **199 – 290 บาท/เดือน** หรือ **1,990 บาท/ปี** (ใช้งานไม่จำกัด)

---

## 📄 License
MIT License © 2026 ZillerDX. All rights reserved.
