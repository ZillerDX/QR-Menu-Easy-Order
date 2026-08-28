import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, CheckCircle2, QrCode, Store, Clock, Utensils } from 'lucide-react';
import { Order, StoreConfig, Language } from '../../types';
import { CAFE_ORDER_LOGO_DATA_URI } from '../../data/logoData';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  storeConfig: StoreConfig;
  language: Language;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  storeConfig,
  language,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:p-0 print:static print:bg-white">
      {/* Backdrop (Hidden during print) */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="font-black text-xs">
              {language === 'th' ? 'ใบเสร็จรับเงิน / ใบสั่งอาหาร' : 'Order Receipt / Slip'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'พิมพ์ใบเสร็จ' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 80mm POS Thermal Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-stone-800 bg-[#fffdfa] print:p-2 print:overflow-visible print:bg-white">
          
          {/* Store Logo & Header */}
          <div className="text-center space-y-1.5 pb-3 border-b border-dashed border-stone-300">
            <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden p-0.5 border border-stone-200">
              <img src={CAFE_ORDER_LOGO_DATA_URI} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h2 className="font-black text-lg tracking-tight font-sans text-stone-950">
              {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
            </h2>
            <p className="text-[11px] text-stone-500 font-sans">
              {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
            </p>
            <p className="text-[10px] text-stone-400 font-sans">
              เวลาเปิด-ปิด: {storeConfig.openTime}
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="text-xs space-y-1 py-1 border-b border-dashed border-stone-300 font-sans">
            <div className="flex justify-between font-bold">
              <span>เลขที่ออเดอร์ (Order #):</span>
              <span className="font-black text-stone-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>ตำแหน่ง (Table):</span>
              <span className="font-black bg-stone-100 px-2 py-0.5 rounded text-stone-900">
                {order.tableNumber === 'TAKEAWAY' ? (language === 'th' ? 'สั่งกลับบ้าน (Takeaway)' : 'Takeaway') : `โต๊ะ (Table) ${order.tableNumber}`}
              </span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>วันที่ & เวลา (Date):</span>
              <span>{formattedDate} {formattedTime}</span>
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-2 py-2 border-b border-dashed border-stone-300 font-sans text-xs">
            <div className="flex justify-between text-[11px] font-black text-stone-400 uppercase">
              <span>รายการ (Items)</span>
              <span>จำนวนเงิน</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-stone-900">
                  <div className="flex items-start gap-1 max-w-[75%]">
                    <span className="text-orange-600 font-black">{item.quantity}x</span>
                    <span>{language === 'en' && item.menuItem.nameEn ? item.menuItem.nameEn : item.menuItem.name}</span>
                  </div>
                  <span>฿{item.totalItemPrice.toLocaleString()}</span>
                </div>

                {/* Option customizations */}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="pl-5 text-[10px] text-stone-500 space-y-0.5">
                    {item.selectedOptions.map((opt, i) => (
                      <div key={i} className="flex justify-between">
                        <span>• {opt.choiceName}</span>
                        {opt.priceDelta > 0 && <span>+฿{opt.priceDelta * item.quantity}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {item.specialNote && (
                  <div className="pl-5 text-[10px] text-amber-800 italic">
                    Note: {item.specialNote}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals & Payment */}
          <div className="space-y-1.5 py-2 border-b border-dashed border-stone-300 font-sans text-xs">
            <div className="flex justify-between text-stone-600">
              <span>ยอดรวม (Subtotal):</span>
              <span>฿{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-950 pt-1 border-t border-stone-100">
              <span>ยอดสุทธิ (Total Net):</span>
              <span className="text-orange-600">฿{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="p-2.5 rounded-xl bg-stone-100/80 space-y-1 font-sans text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">วิธีชำระ (Payment):</span>
              <span className="font-bold text-stone-900">
                {order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด (Cash)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">สถานะ (Status):</span>
              <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {order.paymentStatus === 'paid' ? '✓ ชำระแล้ว (Paid)' : 'รอชำระเงิน (Unpaid)'}
              </span>
            </div>
          </div>

          {/* Thank you note & barcode */}
          <div className="text-center pt-2 space-y-1 font-sans text-[11px] text-stone-400">
            <p className="font-bold text-stone-600">*** ขอบคุณที่ใช้บริการ (Thank You) ***</p>
            <p className="text-[10px]">Please come again • Order Easy Enjoy More</p>
          </div>
        </div>

        {/* Footer (Hidden on print) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-stone-900 hover:bg-black active:scale-98 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer mr-2 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'th' ? 'สั่งพิมพ์ใบเสร็จ (Print Slip)' : 'Print Receipt'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-2xl transition cursor-pointer active:scale-95"
          >
            {language === 'th' ? 'ปิด' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
