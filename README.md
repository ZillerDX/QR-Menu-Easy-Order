# ☕ QR Menu & Easy Order (Interactive Prototype)

ระบบสั่งอาหารผ่าน QR Code ไม่ต้องโหลดแอป รองรับการสั่งอาหาร ปรับแต่ง Option สร้าง QR พร้อมเพย์ตามยอดจริง และหน้าจอห้องครัว Real-time (Kitchen Display System - KDS) พร้อมเครื่องมือสร้างการ์ดตั้งโต๊ะ

---

## 🌟 ฟังก์ชันการทำงานหลัก (Core Features)

### 1. มุมมองลูกค้า (Customer View - Mobile Web)
* 📱 **สแกนสั่งได้ทันที:** เปิดผ่าน URL หรือ QR Code ประจำโต๊ะ (เช่น `?table=03`)
* ☕ **ปรับแต่งเมนูละเอียด (Modifiers):** เลือกความหวาน (0%, 25%, 50%, 100%), ประเภทนม (นมสด, นมข้าวโอ๊ต, นมอัลมอนด์), เพิ่มช็อตกาแฟ และระบุหมายเหตุพิเศษ
* 💳 **ระบบสร้าง QR พร้อมเพย์จริง:** คำนวณยอดเงินและสร้าง PromptPay QR Code มาตรฐาน EMVCo พร้อมเพย์ในเบราว์เซอร์
* ⏳ **ระบบติดตามสถานะ (Order Tracker):** แสดงสถานะการทำอาหารแบบ Real-time (รอดำเนินการ $\rightarrow$ กำลังปรุง $\rightarrow$ พร้อมเสิร์ฟ $\rightarrow$ เสร็จสิ้น)

### 2. มุมมองห้องครัว (Kitchen Display System - KDS)
* 🍳 **หน้าจอรับออเดอร์ Real-time:** ออเดอร์เด้งเข้าทันที พร้อมเล่นเสียงเตือน (Chime Bell)
* 🔄 **เปลี่ยนสถานะออเดอร์:** กดรับออเดอร์ $\rightarrow$ ปรุงเสร็จ $\rightarrow$ ปิดบิล
* 📦 **ระบบจัดการสต็อกด่วน (Stock Manager):** คลิกเดียวเพื่อเปิด/ปิด เมนูหมด (Sold Out)

### 3. ตัวสร้างการ์ด QR Code ประจำโต๊ะ (Table QR Generator)
* 🖨️ สร้าง QR Code ประจำโต๊ะ 1–15 พร้อมปุ่มดาวน์โหลดรูปภาพและสั่งพิมพ์การ์ดตั้งโต๊ะ (Table Stand)

---

## 🚀 วิธีการทดสอบในเครื่อง (Local Testing)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. รัน Local Dev Server
npm run dev
```

> 💡 **เคล็ดลับการทดสอบ Real-time Sync:**
> เปิด 2 หน้าต่างในเบราว์เซอร์:
> 1. หน้าต่างที่ 1: เลือกมุมมอง **"ลูกค้าสั่งอาหาร"** (หรือเปิด URL `http://localhost:5173/?table=03`)
> 2. หน้าต่างที่ 2: เลือกมุมมอง **"จอห้องครัว (KDS)"**
> 
> เมื่อกดสั่งอาหารในหน้าต่างที่ 1 รายการจะเด้งเข้าหน้าต่างที่ 2 ทันทีพร้อมเสียงแจ้งเตือน!

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** React 18 + Vite + TypeScript
* **Styling:** Tailwind CSS + Lucide Icons
* **Realtime Sync:** BroadcastChannel API + LocalStorage Event Engine
* **Payment Engine:** Client-side PromptPay EMVCo QR Generator with CRC16
* **Audio Engine:** Web Audio API Sound Synthesizer
* **CI/CD & Hosting:** GitHub Actions + GitHub Pages
