import React from 'react';
import { StoreConfig, Language } from '../../types';
import { UtensilsCrossed, QrCode, ShieldCheck, Sparkles, ChefHat, BarChart3, LogIn, ArrowRight, Smartphone, Store } from 'lucide-react';

interface StorePortalLandingProps {
  storeConfig: StoreConfig;
  language: Language;
  onOpenAuth: () => void;
  onEnterSimulator: () => void;
}

export const StorePortalLanding: React.FC<StorePortalLandingProps> = ({
  storeConfig,
  language,
  onOpenAuth,
  onEnterSimulator,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-black tracking-wide border border-orange-200/60 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>{language === 'th' ? 'ระบบจัดการร้านอาหาร & QR สั่งอาหารแยกสาขา' : 'Multi-Store Smart QR Ordering System'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          {storeConfig.name}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 mt-1">
            Store Management Portal
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
          {language === 'th'
            ? 'เข้าสู่ระบบสำหรับเจ้าของร้านและพนักงาน เพื่อจัดการห้องครัว KDS, เมนูอาหาร, พิมพ์ QR ประจำโต๊ะ และดูสรุปยอดขายแบบเรียลไทม์'
            : 'Store Portal for managers and kitchen staff. Manage live orders, tables, menus, and view daily sales analytics.'}
        </p>

        {/* Primary Call to Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm sm:text-base shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>{language === 'th' ? 'เข้าสู่ระบบร้านค้า / ลงทะเบียนร้าน' : 'Store Staff Sign In / Register'}</span>
          </button>

          <button
            type="button"
            onClick={onEnterSimulator}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-black text-sm sm:text-base border border-stone-200/90 shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Smartphone className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <span>{language === 'th' ? 'ทดสอบสั่งอาหารจำลอง (โหมดลูกค้า)' : 'Test Customer Simulator'}</span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Card 1: KDS */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base text-stone-900">
            {language === 'th' ? 'จอห้องครัว KDS อัจฉริยะ' : 'Smart Kitchen KDS'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            {language === 'th'
              ? 'รับออเดอร์แบบเรียลไทม์ พร้อมระบบป้องกันออเดอร์ผี ปฏิเสธรายการ และพิมพ์ใบเสร็จ PromptPay อัตโนมัติ'
              : 'Real-time kitchen workflow with anti-prank order rejection and instant PromptPay receipt printing.'}
          </p>
        </div>

        {/* Card 2: Isolated QR Generator */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base text-stone-900">
            {language === 'th' ? 'QR ประจำโต๊ะแยกเฉพาะร้าน' : 'Store-Isolated Table QR'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            {language === 'th'
              ? 'QR Code มี Store ID กำกับเฉพาะสาขา หมดปัญหาลูกค้าสแกนสั่งแล้วไปโผล่ผิดร้าน 100%'
              : 'Unique Store ID encoded into each table QR code so orders always route to the exact restaurant.'}
          </p>
        </div>

        {/* Card 3: Zero-Auth Customer */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base text-stone-900">
            {language === 'th' ? 'ลูกค้าสแกนสั่งได้ทันที' : 'Zero-Friction Dining'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            {language === 'th'
              ? 'ลูกค้าไม่ต้องโหลดแอป ไม่ต้องสมัครสมาชิก สแกนแล้วสั่งได้ทันที พร้อมระบบนับถอยหลัง 3 วิ'
              : 'No app download or sign-up needed for diners. Scan, customize, and track orders in 3 seconds.'}
          </p>
        </div>

        {/* Card 4: Analytics */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base text-stone-900">
            {language === 'th' ? 'สรุปยอดขาย & สต็อก' : 'Sales & Stock Manager'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            {language === 'th'
              ? 'ดูยอดขายรายวัน เมนูขายดี และเปิด-ปิดสต็อกวัตถุดิบหมดได้แบบเรียลไทม์'
              : 'Live sales analytics, top-selling items breakdown, and instant out-of-stock toggles.'}
          </p>
        </div>
      </div>
    </div>
  );
};
