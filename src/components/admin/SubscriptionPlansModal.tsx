import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  ChefHat, 
  Receipt, 
  Users, 
  Percent, 
  Store, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StoreConfig, Language, SubscriptionPlan } from '../../types';
import { syncManager } from '../../utils/storage';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
  language: Language;
}

// Live Stripe Payment Links configured on account acct_1U97R8J12nYcqJQD
const STRIPE_PAYMENT_LINKS: Record<Exclude<SubscriptionPlan, 'free_trial'>, string> = {
  monthly: 'https://buy.stripe.com/28E9AUg5Scy24QI53UaR200',
  half_year: 'https://buy.stripe.com/fZu7sM1aYapU2IAfIyaR201',
  yearly: 'https://buy.stripe.com/9B6fZiaLygOi3ME3ZQaR202',
};

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  storeConfig,
  language,
}) => {
  // ESC key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const shopId = storeConfig.id || 'cafe-order';
  const subStatus = syncManager.getSubscriptionStatus(storeConfig);

  const getCheckoutUrl = (plan: Exclude<SubscriptionPlan, 'free_trial'>) => {
    const baseUrl = STRIPE_PAYMENT_LINKS[plan];
    // Pass client_reference_id as shopId if customer visits
    return `${baseUrl}?client_reference_id=${encodeURIComponent(shopId)}`;
  };

  const handleSelectPlan = (plan: Exclude<SubscriptionPlan, 'free_trial'>) => {
    const url = getCheckoutUrl(plan);
    window.location.href = url;
  };

  const plans = [
    {
      id: 'monthly' as const,
      name: language === 'th' ? 'รายเดือน' : 'Monthly',
      badge: language === 'th' ? 'เริ่มต้นคล่องตัว' : 'Starter',
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
      price: '349',
      unit: language === 'th' ? 'บาท / เดือน' : 'THB / month',
      dailyAvg: language === 'th' ? '~11.6 บาท / วัน' : '~11.6 THB / day',
      comparison: language === 'th' ? 'ถูกกว่ากาแฟ 1 แก้ว' : 'Less than a cup of coffee',
      discount: null,
      isFeatured: false,
      buttonText: language === 'th' ? 'เลือกแพ็กเกจรายเดือน' : 'Subscribe Monthly',
      buttonStyle: 'bg-stone-900 hover:bg-stone-800 text-white',
    },
    {
      id: 'half_year' as const,
      name: language === 'th' ? 'ราย 6 เดือน' : '6 Months',
      badge: language === 'th' ? 'สัญญาระยะกลาง • ประหยัด 10%' : 'Save 10%',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      price: '1,889',
      unit: language === 'th' ? 'บาท / 6 เดือน' : 'THB / 6 months',
      dailyAvg: language === 'th' ? '~314 บาท / เดือน (~10.4 บาท / วัน)' : '~314 THB/mo (~10.4 THB/day)',
      comparison: language === 'th' ? 'ประหยัด 205 บาท' : 'Save 205 THB',
      discount: '10%',
      isFeatured: false,
      buttonText: language === 'th' ? 'เลือกแพ็กเกจ 6 เดือน' : 'Subscribe 6 Months',
      buttonStyle: 'bg-stone-900 hover:bg-stone-800 text-white',
    },
    {
      id: 'yearly' as const,
      name: language === 'th' ? 'รายปี (สุดคุ้ม)' : 'Yearly (Best Value)',
      badge: language === 'th' ? 'ยอดนิยมสูงสุด • ประหยัด 20%' : 'Most Popular • Save 20%',
      badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs',
      price: '3,349',
      unit: language === 'th' ? 'บาท / ปี' : 'THB / year',
      dailyAvg: language === 'th' ? '~279 บาท / เดือน (~9.1 บาท / วัน)' : '~279 THB/mo (~9.1 THB/day)',
      comparison: language === 'th' ? 'ประหยัด 839 บาท (เทียบรายเดือน)' : 'Save 839 THB vs Monthly',
      discount: '20%',
      isFeatured: true,
      buttonText: language === 'th' ? 'เลือกแพ็กเกจรายปี (สุดคุ้ม)' : 'Subscribe Yearly (Best)',
      buttonStyle: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25',
    },
  ];

  const valueProps = [
    {
      icon: Users,
      title: language === 'th' ? 'ลดภาระพนักงานเสิร์ฟ & แคชเชียร์' : 'Saves Staff Labor & Walking Time',
      desc: language === 'th' 
        ? 'ลูกค้าสแกนสั่งและดูเมนูเองผ่านมือถือ ไม่ต้องรอพนักงานเดินไปรับออเดอร์ ลดเวลารับออเดอร์ลงกว่า 70%' 
        : 'Customers self-order at tables, eliminating waiter trips and cutting order-taking time by 70%.',
    },
    {
      icon: Zap,
      title: language === 'th' ? 'ข้อผิดพลาดออเดอร์ 0%' : 'Zero Order & Note Mistakes',
      desc: language === 'th'
        ? 'ไม่มีปัญหาพนักงานฟังผิด จดไม่ทัน หรือลืมส่งเข้าครัว ลูกค้าเลือกตัวเลือก ท็อปปิ้ง และระบุโน้ตได้เอง'
        : 'Direct customer entry eliminates misheard items, forgotten notes, and kitchen handwriting issues.',
    },
    {
      icon: ChefHat,
      title: language === 'th' ? 'ระบบครัว KDS Realtime อัตโนมัติ' : 'Instant Realtime Kitchen KDS',
      desc: language === 'th'
        ? 'ออเดอร์เด้งเข้าหน้าจอครัวทันที พร้อมเสียงแจ้งเตือนและระบบแยกสถานะ ไม่ต้องเดินส่งบิลกระดาษ'
        : 'Orders appear instantly on kitchen screens with sound chime and color-coded status stages.',
    },
    {
      icon: TrendingUp,
      title: language === 'th' ? 'ดันยอดขายต่อบิลเพิ่มขึ้น 15-25%' : 'Boosts Basket Size by 15-25%',
      desc: language === 'th'
        ? 'แสดงรูปภาพอาหารระดับมืออาชีพ แนะนำเมนูขายดี และเมนูเสริมกระตุ้นให้ลูกค้าสั่งเพิ่มอย่างเป็นธรรมชาติ'
        : 'Vibrant food photos, smart upsells, and recommendations encourage higher customer spending.',
    },
    {
      icon: Receipt,
      title: language === 'th' ? 'พิมพ์สลิป & ใบกำกับภาษีเต็มรูป' : 'Thermal Slips & Full Tax Invoices',
      desc: language === 'th'
        ? 'รองรับเครื่องพิมพ์ความร้อน 80mm/58mm ทุกรุ่น ออกใบเสร็จอย่างย่อและใบกำกับภาษีตามกฎหมาย'
        : 'Print receipts and Thai RD-compliant tax invoices cleanly to standard ESC/POS thermal printers.',
    },
    {
      icon: Percent,
      title: language === 'th' ? '0% GP ไร้ค่าคอมมิชชั่น' : '0% Commission / 0% GP',
      desc: language === 'th'
        ? 'เงินเข้าบัญชี PromptPay หรือหน้าร้านของคุณโดยตรง 100% ไม่ถูกหัก 30% เหมือนแอปเดลิเวอรี่'
        : 'Keep 100% of your revenue directly via your PromptPay QR with zero marketplace commissions.',
    },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base sm:text-lg leading-tight">
                {language === 'th' ? 'แพ็กเกจค่าบริการ Cafe Order' : 'Cafe Order Subscription Plans'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {language === 'th' 
                  ? 'ระบบสั่งอาหาร QR Code ผ่านมือถือ • ประหยัดแรงงาน • คืนทุนตั้งแต่เดือนแรก' 
                  : 'QR Ordering System for Cafes & Restaurants • Save Labor • High ROI'}
              </p>
            </div>
          </div>

          {/* Single Top-Right Close Button (Modal Dismissal Rule) */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
            title={language === 'th' ? 'ปิด' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Current Store Subscription Status Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            subStatus.isExpired 
              ? 'bg-red-50 border-red-200 text-red-900' 
              : subStatus.isTrial 
                ? 'bg-amber-50 border-amber-200 text-amber-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                subStatus.isExpired 
                  ? 'bg-red-200 text-red-700' 
                  : subStatus.isTrial 
                    ? 'bg-amber-200 text-amber-800' 
                    : 'bg-emerald-200 text-emerald-700'
              }`}>
                {subStatus.isExpired ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">
                    {subStatus.isTrial 
                      ? (language === 'th' ? 'กำลังใช้งาน: ทดลองใช้ฟรี 14 วัน (Free Trial)' : 'Active: 14-Day Free Trial') 
                      : subStatus.isExpired 
                        ? (language === 'th' ? 'สถานะ: สิ้นสุดระยะเวลาทดลอง / แพ็กเกจหมดอายุ' : 'Status: Trial or Subscription Expired') 
                        : (language === 'th' ? `แพ็กเกจปัจจุบัน: ${subStatus.plan}` : `Current Plan: ${subStatus.plan}`)}
                  </span>
                </div>
                <p className="text-xs mt-0.5 opacity-90">
                  {subStatus.isTrial && (
                    language === 'th'
                      ? `เหลือเวลาทดลองใช้งานอีก ${subStatus.daysLeft} วัน (ครบกำหนด ${subStatus.expiresAtDate ? subStatus.expiresAtDate.toLocaleDateString('th-TH') : ''})`
                      : `${subStatus.daysLeft} days left in your trial (ends ${subStatus.expiresAtDate ? subStatus.expiresAtDate.toLocaleDateString() : ''})`
                  )}
                  {subStatus.isExpired && (
                    language === 'th'
                      ? 'กรุณาเลือกแพ็กเกจเพื่อเปิดใช้งานระบบโต๊ะ QR Code และรับออเดอร์ของร้านอย่างต่อเนื่อง'
                      : 'Please choose a plan to keep receiving table QR orders without interruption.'
                  )}
                  {!subStatus.isTrial && !subStatus.isExpired && (
                    language === 'th'
                      ? `ใช้งานได้ต่อเนื่อง เหลือเวลาอีก ${subStatus.daysLeft} วัน (หมดอายุ ${subStatus.expiresAtDate ? subStatus.expiresAtDate.toLocaleDateString('th-TH') : ''})`
                      : `Active license with ${subStatus.daysLeft} days remaining.`
                  )}
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-stone-600 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/80">
              {language === 'th' ? 'ทดลองฟรี 14 วัน สำหรับร้านใหม่' : '14 Days Free for New Stores'}
            </div>
          </div>

          {/* Pricing Tiers Grid (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-all duration-200 ${
                  plan.isFeatured
                    ? 'border-orange-500 bg-gradient-to-b from-orange-50/40 via-white to-white shadow-xl shadow-orange-500/10 ring-2 ring-orange-500'
                    : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'
                }`}
              >
                {plan.isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-sm tracking-wide flex items-center gap-1 uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'th' ? 'แนะนำ คุ้มค่าที่สุด' : 'Recommended'}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name & Tag */}
                  <div>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    <h4 className="font-black text-stone-900 text-lg sm:text-xl mt-2 tracking-tight">
                      {plan.name}
                    </h4>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-stone-500 text-xs font-bold">฿</span>
                      <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {plan.unit}
                    </p>
                    <div className="mt-2 text-[11px] font-bold text-orange-600 bg-orange-50/80 px-2.5 py-1 rounded-xl inline-block border border-orange-200/60">
                      {plan.dailyAvg}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-stone-600 font-medium pt-3 border-t border-stone-100">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'th' ? 'โต๊ะ QR สั่งอาหารไม่จำกัด (1-50 โต๊ะ)' : 'Unlimited Table QRs (1-50 tables)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'th' ? 'ระบบครัว KDS Realtime + เสียงเตือน' : 'Realtime Kitchen KDS + Chime'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'th' ? 'ใบเสร็จความร้อน 80mm & ใบกำกับภาษี' : 'Thermal Receipts & Tax Invoices'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'th' ? '0% GP ไร้ค่าคอมมิชชั่น' : '0% Commission / 0% GP'}</span>
                    </li>
                    <li className="flex items-center gap-2 font-bold text-stone-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{plan.comparison}</span>
                    </li>
                  </ul>
                </div>

                {/* Action CTA Button */}
                <div className="mt-6 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 whitespace-nowrap ${plan.buttonStyle}`}
                  >
                    <span className="whitespace-nowrap truncate">{plan.buttonText}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </button>
                  <p className="text-[10px] text-center text-stone-400 font-medium mt-1.5">
                    {language === 'th' ? 'ชำระปลอดภัยผ่าน Stripe (บัตร/PromptPay)' : 'Secure checkout via Stripe'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Anti-Abuse & Permanent Table QR Guarantee Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl border border-stone-700 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs sm:text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>
                  {language === 'th' 
                    ? 'ระบบผูก QR ประจำร้านถาวร — ไม่ต้องพิมพ์ป้ายตั้งโต๊ะใหม่ 100%' 
                    : 'Permanent Table QR Binding — Zero Re-printing Required'}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {language === 'th' ? (
                  <>
                    ป้าย QR Code ตั้งโต๊ะที่คุณพิมพ์เคลือบหรือตั้งบนแท่นไม้แล้ว ถูกผูกด้วยรหัสร้านค้า 
                    <span className="font-mono font-bold text-amber-300 bg-black/30 px-1.5 py-0.5 rounded mx-1">
                      {shopId}
                    </span> 
                    อย่างปลอดภัย การต่ออายุในแพ็กเกจเดิมจะทำให้โต๊ะทุกตัวรับออเดอร์ได้ต่อเนื่องทันที โดยไม่ต้องพิมพ์ QR Code หรือเปลี่ยนป้ายโต๊ะใหม่แม้แต่ใบเดียว
                  </>
                ) : (
                  <>
                    All printed table QR stands are securely bound to your unique Store ID 
                    <span className="font-mono font-bold text-amber-300 bg-black/30 px-1.5 py-0.5 rounded mx-1">
                      {shopId}
                    </span>. 
                    Renewing your plan keeps all existing table stands, categories, and menus running seamlessly with zero re-printing.
                  </>
                )}
              </p>
              <div className="text-[11px] text-stone-400 flex items-center gap-2 pt-1">
                <Store className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  {language === 'th'
                    ? 'ระบบป้องกัน: การสมัครบัญชีใหม่จะแยก Store ID ทำให้ออเดอร์จาก QR เดิมไม่เข้าเครื่องใหม่ การต่ออายุร้านเดิมจึงเป็นวิธีที่ราบรื่นและปลอดภัยที่สุด'
                    : 'Protection Notice: Creating a new account generates a different Store ID, orphaning previously printed table stands.'}
                </span>
              </div>
            </div>
          </div>

          {/* Value Propositions & Labor Saving Benefits (6 Cards) */}
          <div className="space-y-4">
            <div>
              <h4 className="font-black text-stone-900 text-base sm:text-lg">
                {language === 'th' ? 'ทำไมคาเฟ่และร้านอาหารจึงเลือกระบบนี้?' : 'Why Cafes & Restaurants Love Cafe Order'}
              </h4>
              <p className="text-xs text-stone-500 font-medium">
                {language === 'th' ? 'คุ้มค่าทุกการลงทุน ช่วยแก้ปัญหาขาดแคลนพนักงานและเพิ่มยอดขายได้อย่างแท้จริง' : 'Tangible labor reduction and increased daily sales turnover.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {valueProps.map((vp, idx) => {
                const Icon = vp.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h5 className="font-black text-stone-900 text-xs sm:text-sm">
                      {vp.title}
                    </h5>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {vp.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
