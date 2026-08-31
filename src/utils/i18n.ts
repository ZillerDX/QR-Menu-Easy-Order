import { Language } from '../types';

export const translations = {
  en: {
    // Header & Brand
    appName: "Easy Menu",
    tagline: "Smart Restaurant & Cafe Ordering System",
    table: "Table",
    takeaway: "Takeaway",
    cart: "Cart",
    items: "items",
    total: "Total",
    netTotal: "Net Total",
    priceUnit: "฿",
    cancel: "Cancel",
    save: "Save Changes",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    confirm: "Confirm",
    searchPlaceholder: "Search coffee, tea, matcha, pasta, bakery...",
    clear: "Clear",
    soldOut: "Sold Out",
    inStock: "In Stock",
    chefPick: "Chef Pick",
    popular: "Popular",
    required: "Required",
    optional: "Optional",
    specialNotes: "Special Requests (Optional)",
    specialNotesPlaceholder: "e.g. Less ice, extra napkin, no dressing",
    addToCart: "Add to Order",
    viewCart: "View Order Cart",
    fromPrice: "From",
    emptyCartTitle: "Your cart is empty",
    emptyCartSubtitle: "Select delicious items from the menu to start ordering",
    selectPayment: "Choose Payment Method",
    promptpayQR: "PromptPay QR",
    cashAtCounter: "Cash at Counter",
    creditCard: "Credit / Debit Card",
    creditCardShort: "Credit Card",
    kdsCloseBillPromptPay: "Close Bill • Paid via QR PromptPay",
    kdsCloseBillCash: "Close Bill • Paid with Cash",
    kdsCloseBillCard: "Close Bill • Paid with Credit Card",
    submitOrder: "Confirm & Place Order",
    recentOrderStatus: "Recent Order Status",
    viewStatus: "View Status",
    heroBadge: "ORDER DIRECTLY • NO APP REQUIRED",
    heroTitle: "Freshly Crafted Food & Drinks To Your Table",
    heroSubtitle: "Browse our menu, customize ingredients & toppings, and place your order instantly.",
    noMenuItems: "No items matched your search",
    noMenuItemsDesc: "Try searching for other items or choose a different category",

    // Roles
    roleCustomer: "Order Menu",
    roleKitchen: "Kitchen (KDS)",
    roleAdmin: "Menu Items",
    roleSettings: "Store Settings",
    roleQR: "Table QR Stand",

    // Kitchen KDS
    kdsTitle: "Kitchen Display System (KDS)",
    kdsSubtitle: "Real-time order management system for service & kitchen staff",
    kdsCooking: "Cooking",
    kdsTodaySales: "Today's Sales",
    kdsTestSound: "Test Sound",
    kdsManageStock: "Stock Manager",
    kdsStockTitle: "Menu Stock Manager",
    kdsStockSubtitle: "Toggle availability in real-time to reflect on customer devices instantly",
    kdsFilterActive: "Pending / Cooking",
    kdsFilterReady: "Ready to Serve",
    kdsFilterCompleted: "Completed / Paid",
    kdsFilterAll: "All Orders",
    kdsNoOrders: "No orders in this status",
    kdsNoOrdersDesc: "When customers submit an order from their table, it appears here in real time.",
    kdsStartCooking: "Start Cooking",
    kdsReadyToServe: "Ready to Serve",
    kdsCloseBill: "Served & Close Bill",
    kdsCompletedBadge: "Order Completed",
    kdsPendingBadge: "Pending",
    kdsCookingBadge: "Cooking",
    kdsReadyBadge: "Ready",
    kdsPaid: "Paid",
    kdsUnpaid: "Unpaid",

    // Order Tracker
    trackerTitle: "Order Number",
    trackerStep1: "Order Received",
    trackerStep1Desc: "The kitchen has received your order.",
    trackerStep2: "Preparing Order",
    trackerStep2Desc: "Our chef is crafting your order.",
    trackerStep3: "Ready to Serve",
    trackerStep3Desc: "Your order is ready and being delivered.",
    trackerStep4: "Completed",
    trackerStep4Desc: "Thank you! Enjoy your meal.",
    trackerOrderMore: "Order More Items",
    trackerPaymentMethod: "Payment Method",

    // PromptPay Modal
    ppTitle: "Thai QR Payment",
    ppSubtitle: "PromptPay QR Code",
    ppAmountDue: "Total Amount Due",
    ppNote: "Take a screenshot of this QR code to scan and pay via your mobile banking app.",
    ppConfirmButton: "Payment Completed",
    ppBack: "Back to Menu",

    // Table QR Stand Generator
    qrTitle: "Table QR Stand Generator",
    qrSubtitle: "Generate and print scannable table QR cards for your tables.",
    qrSelectTable: "Select Table:",
    qrDownloadBtn: "Download Table QR Image",
    qrPrintBtn: "Print Table Stand (Card)",
    qrOpenTestBtn: "Open in Table View (New Tab)",
    qrScanInstruction: "📱 Scan QR code with your phone camera to view menu, place order, and pay instantly without waiting for staff.",

    // Menu & Store Admin
    adminTitle: "Menu Management",
    adminSubtitle: "Add, edit, and organize menu items, categories, prices, and stock.",
    adminTabMenus: "Menu Items",
    adminTabCategories: "Categories",
    adminAddNewItem: "Add New Menu Item",
    adminAddNewCategory: "Add New Category",
    adminItemNameTh: "Item Name (Thai)",
    adminItemNameEn: "Item Name (English)",
    adminCategory: "Category",
    adminPrice: "Price",
    adminImageUrl: "Image",
    adminUploadImage: "Upload Image from Device",
    adminUploadHint: "Click or drag image file here (PNG, JPG, WebP)",
    adminOrUrl: "Or paste image link URL:",
    adminDescTh: "Description (Thai)",
    adminDescEn: "Description (English)",
    adminHighlightBadges: "Highlight Badges",
    adminIsChef: "Chef's Recommended",
    adminIsPopular: "Popular Item",
    adminCategoryNameTh: "Category Name (Thai)",
    adminCategoryNameEn: "Category Name (English)",
    adminCategoryIcon: "Category Icon",
    adminConfirmDelete: "Are you sure you want to delete this item?",
    adminItemCount: "items",

    // Store Settings
    settingsTitle: "Store & Branding Settings",
    settingsSubtitle: "Customize your store name, logo profile, PromptPay payment details, and tables.",
    settingsStoreNameTh: "Store Name (Thai)",
    settingsStoreNameEn: "Store Name (English)",
    settingsTaglineTh: "Tagline / Slogan (Thai)",
    settingsTaglineEn: "Tagline / Slogan (English)",
    settingsLogoTitle: "Store Logo / Profile Picture",
    settingsLogoUploadBtn: "Upload New Logo",
    settingsLogoHint: "Recommended square aspect ratio (PNG, JPG, SVG)",
    settingsPromptPayNo: "PromptPay Phone Number or National ID",
    settingsPromptPayName: "PromptPay Account Name",
    settingsTableCount: "Number of Tables",
    settingsOpenHours: "Opening Hours",
    settingsSaveSuccess: "Store settings saved successfully!",
  },
  th: {
    // Header & Brand
    appName: "Easy Menu",
    tagline: "ระบบสั่งอาหารและจัดการร้านอัจฉริยะ",
    table: "โต๊ะ",
    takeaway: "สั่งกลับบ้าน",
    cart: "ตะกร้า",
    items: "รายการ",
    total: "ยอดรวม",
    netTotal: "ยอดสุทธิ",
    priceUnit: "฿",
    cancel: "ยกเลิก",
    save: "บันทึกข้อมูล",
    delete: "ลบ",
    edit: "แก้ไข",
    add: "เพิ่ม",
    close: "ปิด",
    confirm: "ยืนยัน",
    searchPlaceholder: "ค้นหาชื่อเมนู, กาแฟ, ชา, พาสต้า...",
    clear: "ล้าง",
    soldOut: "หมด",
    inStock: "มีขาย",
    chefPick: "แนะนำ",
    popular: "ยอดฮิต",
    required: "จำเป็น",
    optional: "ไม่บังคับ",
    specialNotes: "หมายเหตุเพิ่มเติม (ถ้ามี)",
    specialNotesPlaceholder: "เช่น แยกน้ำแข็ง, ขอช้อนส้อม, ไม่ใส่ผักชี",
    addToCart: "ใส่ตะกร้า",
    viewCart: "ดูรายการในตะกร้า",
    fromPrice: "เริ่มต้น",
    emptyCartTitle: "ยังไม่มีรายการในตะกร้า",
    emptyCartSubtitle: "เลือกเมนูแสนอร่อยเพื่อเริ่มสั่งอาหาร",
    selectPayment: "เลือกวิธีชำระเงิน",
    promptpayQR: "พร้อมเพย์ QR",
    cashAtCounter: "เงินสดที่เคาน์เตอร์",
    creditCard: "บัตรเครดิต / เดบิต",
    creditCardShort: "บัตรเครดิต",
    kdsCloseBillPromptPay: "ปิดบิล • ลูกค้าชำระด้วย QR พร้อมเพย์",
    kdsCloseBillCash: "ปิดบิล • ลูกค้าชำระด้วยเงินสด",
    kdsCloseBillCard: "ปิดบิล • ลูกค้าชำระด้วยบัตรเครดิต",
    submitOrder: "ยืนยันและส่งออเดอร์",
    recentOrderStatus: "สถานะออเดอร์ล่าสุด",
    viewStatus: "ดูสถานะ",
    heroBadge: "ORDER DIRECTLY • NO APP REQUIRED",
    heroTitle: "สั่งอาหารสดใหม่ ส่งตรงถึงโต๊ะคุณ",
    heroSubtitle: "เลือกเมนูที่ชอบ ปรับแต่งความหวานและท็อปปิ้งได้ตามใจ แล้วกดสั่งได้ทันที",
    noMenuItems: "ไม่พบรายการเมนูที่ค้นหา",
    noMenuItemsDesc: "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น",

    // Roles
    roleCustomer: "สั่งอาหาร",
    roleKitchen: "จอห้องครัว (KDS)",
    roleAdmin: "จัดการเมนู",
    roleSettings: "ตั้งค่าร้านค้า",
    roleQR: "การ์ด QR โต๊ะ",

    // Kitchen KDS
    kdsTitle: "Kitchen Display System (KDS)",
    kdsSubtitle: "หน้าจอรับและจัดการออเดอร์สำหรับฝ่ายบริการและห้องครัว",
    kdsCooking: "กำลังทำ",
    kdsTodaySales: "ยอดขายวันนี้",
    kdsTestSound: "ทดสอบเสียง",
    kdsManageStock: "จัดการสต็อก",
    kdsStockTitle: "จัดการสต็อกเมนูอาหาร (Stock Manager)",
    kdsStockSubtitle: "คลิกสวิตช์เพื่อเปิด/ปิดเมนูหมดแบบ Real-time",
    kdsFilterActive: "รอปรุง / กำลังทำ",
    kdsFilterReady: "พร้อมเสิร์ฟ",
    kdsFilterCompleted: "เสร็จสิ้น / ปิดบิล",
    kdsFilterAll: "ทั้งหมด",
    kdsNoOrders: "ไม่มีออเดอร์ในสถานะนี้",
    kdsNoOrdersDesc: "เมื่อลูกค้าสั่งอาหารจากโต๊ะ รายการจะปรากฏที่นี่ทันทีแบบ Real-time",
    kdsStartCooking: "เริ่มปรุงอาหาร",
    kdsReadyToServe: "ปรุงเสร็จแล้ว (พร้อมเสิร์ฟ)",
    kdsCloseBill: "เสิร์ฟเรียบร้อย & ปิดบิล",
    kdsCompletedBadge: "ออเดอร์นี้เสร็จสมบูรณ์แล้ว",
    kdsPendingBadge: "รอดำเนินการ",
    kdsCookingBadge: "กำลังปรุง",
    kdsReadyBadge: "พร้อมเสิร์ฟ",
    kdsPaid: "ชำระแล้ว",
    kdsUnpaid: "รอชำระ",

    // Order Tracker
    trackerTitle: "หมายเลขออเดอร์",
    trackerStep1: "รับออเดอร์แล้ว",
    trackerStep1Desc: "ร้านค้าได้รับออเดอร์ของคุณเรียบร้อย",
    trackerStep2: "กำลังปรุงอาหาร",
    trackerStep2Desc: "เชฟกำลังเตรียมเมนูสุดพิเศษให้คุณ",
    trackerStep3: "พร้อมเสิร์ฟ / รับได้แล้ว",
    trackerStep3Desc: "อาหารพร้อมแล้ว พนักงานกำลังนำไปเสิร์ฟ",
    trackerStep4: "เสร็จสิ้น",
    trackerStep4Desc: "ขอบคุณที่ใช้บริการ ขอให้อร่อยกับมื้อนี้ครับ/ค่ะ",
    trackerOrderMore: "สั่งอาหารเพิ่มเติม",
    trackerPaymentMethod: "วิธีชำระเงิน",

    // PromptPay Modal
    ppTitle: "Thai QR Payment",
    ppSubtitle: "พร้อมเพย์ / PromptPay",
    ppAmountDue: "ยอดชำระเงิน",
    ppNote: "สามารถแคปหน้าจอ QR นี้ไปเปิดในแอปธนาคารเพื่อสแกนจ่ายได้ทันที",
    ppConfirmButton: "โอนเงินเรียบร้อยแล้ว",
    ppBack: "กลับไปดูรายการอาหาร",

    // Table QR Stand Generator
    qrTitle: "ตัวสร้าง QR Code ประจำโต๊ะ",
    qrSubtitle: "เลือกเลขโต๊ะเพื่อสร้าง QR Code สำหรับพิมพ์ติดการ์ดตั้งโต๊ะให้ลูกค้าสแกนสั่ง",
    qrSelectTable: "เลือกโต๊ะ:",
    qrDownloadBtn: "ดาวน์โหลดรูป QR Code โต๊ะ",
    qrPrintBtn: "พิมพ์การ์ดตั้งโต๊ะ (Print Stand)",
    qrOpenTestBtn: "เปิดทดสอบในมุมมองโต๊ะนี้ (New Tab)",
    qrScanInstruction: "📱 เปิดกล้องมือถือสแกน QR เพื่อดูเมนูทั้งหมด สั่งอาหาร และชำระเงินผ่านมือถือโดยไม่ต้องรอพนักงาน",

    // Menu & Store Admin
    adminTitle: "ระบบจัดการเมนูอาหาร (Menu Management)",
    adminSubtitle: "เพิ่ม ลบ แก้ไข เมนูอาหาร หมวดหมู่ และราคาสำหรับเจ้าของร้าน",
    adminTabMenus: "รายการเมนูอาหาร",
    adminTabCategories: "หมวดหมู่อาหาร",
    adminAddNewItem: "เพิ่มเมนูใหม่",
    adminAddNewCategory: "เพิ่มหมวดหมู่ใหม่",
    adminItemNameTh: "ชื่อเมนู (ภาษาไทย)",
    adminItemNameEn: "ชื่อเมนู (English)",
    adminCategory: "หมวดหมู่",
    adminPrice: "ราคา",
    adminImageUrl: "รูปภาพเมนู",
    adminUploadImage: "อัปโหลดรูปภาพจากอุปกรณ์",
    adminUploadHint: "คลิกหรือลากไฟล์ภาพมาวางที่นี่ (PNG, JPG, WebP)",
    adminOrUrl: "หรือระบุลิงก์รูปภาพ (Image URL):",
    adminDescTh: "รายละเอียดเมนู (ภาษาไทย)",
    adminDescEn: "รายละเอียดเมนู (English)",
    adminHighlightBadges: "ป้ายกำกับพิเศษ",
    adminIsChef: "เมนูแนะนำโดยเชฟ",
    adminIsPopular: "เมนูยอดฮิต",
    adminCategoryNameTh: "ชื่อหมวดหมู่ (ภาษาไทย)",
    adminCategoryNameEn: "ชื่อหมวดหมู่ (English)",
    adminCategoryIcon: "ไอคอนหมวดหมู่",
    adminConfirmDelete: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
    adminItemCount: "เมนู",

    // Store Settings
    settingsTitle: "ตั้งค่าร้านค้า & ข้อมูลแบรนด์ (Store Settings)",
    settingsSubtitle: "ตั้งชื่อร้าน สโลแกน อัปโหลดโลโก้ร้าน เบอร์พร้อมเพย์ และจำนวนโต๊ะ",
    settingsStoreNameTh: "ชื่อร้าน (ภาษาไทย)",
    settingsStoreNameEn: "ชื่อร้าน (English)",
    settingsTaglineTh: "สโลแกน / คำโปรย (ภาษาไทย)",
    settingsTaglineEn: "สโลแกน / คำโปรย (English)",
    settingsLogoTitle: "โลโก้ / รูปโปรไฟล์ร้าน",
    settingsLogoUploadBtn: "อัปโหลดโลโก้ใหม่",
    settingsLogoHint: "แนะนำรูปภาพสี่เหลี่ยมจัตุรัส (PNG, JPG, SVG)",
    settingsPromptPayNo: "เบอร์พร้อมเพย์ หรือ เลขบัตรประชาชน",
    settingsPromptPayName: "ชื่อบัญชีพร้อมเพย์",
    settingsTableCount: "จำนวนโต๊ะในร้าน",
    settingsOpenHours: "เวลาเปิด - ปิดร้าน",
    settingsSaveSuccess: "บันทึกข้อมูลการตั้งค่าร้านค้าเรียบร้อยแล้ว!",
  },
};

const LANG_STORAGE_KEY = 'qr_menu_preferred_lang_v2';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang') as Language;
    if (urlLang === 'en' || urlLang === 'th') {
      localStorage.setItem(LANG_STORAGE_KEY, urlLang);
      return urlLang;
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (stored === 'en' || stored === 'th') {
      return stored;
    }
  } catch {
    // fallback
  }
  return 'en'; // Default to English
}

export function saveLanguagePreference(lang: Language) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function t(key: keyof typeof translations['en'], lang: Language): string {
  const dict = translations[lang] || translations['en'];
  return (dict[key] as string) || (translations['en'][key] as string) || (key as string);
}
