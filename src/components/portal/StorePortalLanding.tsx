import React, { useState } from 'react';
import { StoreConfig, Language } from '../../types';
import { 
  ChefHat, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  BarChart3, 
  LogIn, 
  ArrowRight, 
  Smartphone, 
  Store, 
  Receipt, 
  CheckCircle2, 
  Flame, 
  Ban, 
  Clock, 
  Lock,
  ExternalLink
} from 'lucide-react';

interface StorePortalLandingProps {
  storeConfig: StoreConfig;
  language: Language;
  onOpenAuth: () => void;
  onEnterSimulator: (tableNum?: string) => void;
}

export const StorePortalLanding: React.FC<StorePortalLandingProps> = ({
  storeConfig,
  language,
  onOpenAuth,
  onEnterSimulator,
}) => {
  const [selectedSimTable, setSelectedSimTable] = useState('01');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* Top Live Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          <span className="text-xs font-black text-stone-800">
            {language === 'th' ? 'ระบบคลาวด์ออนไลน์พร้อมใช้งาน' : 'Cloud POS Server Online'}
          </span>
          <span className="text-stone-300 font-light hidden sm:inline">•</span>
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            Supabase Realtime Database v2.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-400">
            {language === 'th' ? 'รหัสร้านค้า (Store ID):' : 'Store ID:'}
          </span>
          <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
            {storeConfig.id || 'cafe-order'}
          </span>
        </div>
      </div>

      {/* Main Split-Screen Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 Cols): Store Login & Quick Simulator Hub */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-black border border-orange-200/60">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Smart Restaurant Operating System</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                {storeConfig.name}
              </h1>
              <p className="text-sm sm:text-base text-stone-500 font-bold mt-1">
                {language === 'th'
                  ? 'ระบบจัดการร้านอาหาร & QR สั่งอาหารแยกสาขาอัจฉริยะ'
                  : 'Multi-Tenant Smart QR Menu & Kitchen Display System'}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
              {language === 'th'
                ? 'พอร์ทัลสำหรับเจ้าของร้านและพนักงานห้องครัว จัดการคิวอาหารแบบเรียลไทม์ พิมพ์สลิปใบเสร็จพร้อม PromptPay QR และสร้างการ์ด QR ประจำโต๊ะเฉพาะสาขา'
                : 'Central management dashboard for restaurant staff. Live kitchen tickets, automatic PromptPay thermal slip printing, and isolated table QR generation.'}
            </p>
          </div>

          {/* Action Boxes */}
          <div className="space-y-4 pt-2">
            {/* Primary Action: Store Staff Login */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-lg shadow-stone-900/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'th' ? 'เข้าสู่ระบบร้านค้า (Staff Portal)' : 'Store Staff Access'}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">
                  Google / Email Auth
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-orange-500/25 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'th' ? 'เข้าสู่ระบบ / ลงทะเบียนร้านค้า' : 'Sign In / Register Store'}</span>
              </button>
            </div>

            {/* Secondary Action: Interactive Customer Simulator */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  {language === 'th' ? 'ทดสอบสั่งอาหารจำลอง (โหมดลูกค้า)' : 'Test Customer Dining Simulator'}
                </span>
                <span className="text-[10px] text-stone-400 font-bold">
                  {language === 'th' ? 'สำหรับเจ้าของร้านทดสอบ' : 'For Store Testing'}
                </span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                {/* Table Picker */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 flex-1">
                  {['01', '02', '03', 'TAKEAWAY'].map((tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setSelectedSimTable(tbl)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex-shrink-0 ${
                        selectedSimTable === tbl
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {tbl === 'TAKEAWAY' ? (language === 'th' ? 'กลับบ้าน' : 'Takeaway') : `${language === 'th' ? 'โต๊ะ' : 'T-'} ${tbl}`}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onEnterSimulator(selectedSimTable)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <span>{language === 'th' ? 'เปิดสั่งอาหาร' : 'Launch'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Bento Mockup Showcase */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Card 1: Kitchen Display Mini Showcase */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-[32px] p-5 sm:p-6 text-white border border-stone-800 shadow-md space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-400" />
                <h3 className="font-black text-sm tracking-tight text-stone-100">
                  {language === 'th' ? 'จอครัว KDS เรียลไทม์' : 'Live Kitchen KDS'}
                </h3>
              </div>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active 3 Orders
              </span>
            </div>

            {/* Mockup Active Ticket */}
            <div className="bg-stone-800/90 rounded-2xl p-3.5 border border-stone-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2 py-0.5 bg-orange-500 text-white rounded-lg">
                  โต๊ะ 02 • #4819
                </span>
                <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 animate-pulse" /> กำลังปรุงอาหาร
                </span>
              </div>
              <div className="text-xs text-stone-300 space-y-1 font-medium pl-1">
                <p>1x คาราเมลมัคคิอาโต (หวาน 50%)</p>
                <p>2x ครัวซองต์เนยสดพรีเมียม</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium pt-1">
              <span>⚡ แจ้งเตือนเสียงอัตโนมัติ</span>
              <span>🖨️ พิมพ์ใบเสร็จ PromptPay ได้ทันที</span>
            </div>
          </div>

          {/* Card 2: Isolated Table QR Showcase */}
          <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-stone-200 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                Multi-Store Security
              </span>
              <h4 className="font-black text-sm text-stone-900">
                {language === 'th' ? 'QR ประจำโต๊ะเฉพาะสาขา' : 'Isolated Store QR'}
              </h4>
              <p className="text-xs text-stone-500 font-medium leading-snug">
                {language === 'th'
                  ? 'ฝัง Store Slug ใน QR ป้องกันออเดอร์ไปโผล่ผิดร้าน 100%'
                  : 'Store ID encoded into QR preventing cross-store order mixing.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
              <QrCode className="w-10 h-10 text-stone-800" />
            </div>
          </div>

          {/* Card 3: Anti-Prank Rejection Badge */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-[32px] p-4 sm:p-5 border border-red-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs text-red-950">
                {language === 'th' ? 'ระบบป้องกันออเดอร์ผี (Anti-Prank)' : 'Anti-Prank Bogus Order Protection'}
              </h4>
              <p className="text-[11px] text-stone-600 font-medium leading-snug mt-0.5">
                {language === 'th'
                  ? 'ห้องครัวสามารถปฏิเสธ / ตีกลับออเดอร์ได้ทันที พร้อมแจ้งเตือนลูกค้า'
                  : 'Kitchen staff can reject empty table orders with instant mobile notification.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-stone-900">
            {language === 'th' ? 'จอครัว KDS ครบวงจร' : 'Complete KDS Lifecycle'}
          </h4>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {language === 'th'
              ? 'รองรับ 4 สถานะ: รอทำ ➔ กำลังปรุง ➔ พร้อมเสิร์ฟ ➔ ปิดบิล'
              : 'Seamless flow from pending to cooking, ready to serve, and close bill.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-stone-900">
            {language === 'th' ? 'สลิปใบเสร็จ PromptPay' : 'EMVCo PromptPay Slip'}
          </h4>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {language === 'th'
              ? 'พิมพ์สลิป 80mm พร้อม QR สแกนจ่ายตรงยอด ไม่ต้องแคปจอ'
              : 'Prints 80mm POS slip with dynamic QR for exact bill amount.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-stone-900">
            {language === 'th' ? 'ลูกค้าสแกนสั่งได้ทันที' : 'Zero-Auth Dining'}
          </h4>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {language === 'th'
              ? 'ไม่ต้องโหลดแอป ไม่ต้องสมัครสมาชิก มีปุ่มนับถอยหลัง 3 วิ'
              : 'No app download needed. Instant menu access with 3s undo safety.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-stone-900">
            {language === 'th' ? 'สรุปยอดขาย & สต็อก' : 'Sales Analytics & Stock'}
          </h4>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {language === 'th'
              ? 'วิเคราะห์ยอดขาย เมนูยอดนิยม และปิดเมนูหมดได้แบบเรียลไทม์'
              : 'Track daily revenue, best sellers, and toggle out-of-stock items.'}
          </p>
        </div>
      </div>
    </div>
  );
};
