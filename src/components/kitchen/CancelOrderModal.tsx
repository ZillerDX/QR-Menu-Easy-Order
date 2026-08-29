import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Ban, CheckCircle2 } from 'lucide-react';
import { Order, Language } from '../../types';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => void;
  order: Order | null;
  language: Language;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirmCancel,
  order,
  language,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('ไม่มีลูกค้าที่โต๊ะ (โต๊ะว่าง/สั่งเล่น)');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !order) return null;

  const presetReasons = [
    { th: 'ไม่มีลูกค้าที่โต๊ะ (โต๊ะว่าง / สั่งเล่น)', en: 'No customer at table / Bogus order' },
    { th: 'วัตถุดิบในครัวหมด (ไม่สามารถทำได้)', en: 'Out of ingredients' },
    { th: 'ออเดอร์ซ้ำซ้อนกับรายการก่อนหน้า', en: 'Duplicate order' },
    { th: 'ลูกค้ายกเลิกด้วยตนเองที่หน้าร้าน', en: 'Customer requested cancellation' },
    { th: 'อื่นๆ (ระบุเอง)', en: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason.startsWith('อื่นๆ') ? (customReason.trim() || 'ทางร้านขอยกเลิกออเดอร์') : selectedReason;
    onConfirmCancel(order.id, finalReason);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5 text-red-600">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900 leading-tight">
                {language === 'th' ? 'ปฏิเสธ / ยกเลิกออเดอร์' : 'Reject / Cancel Order'}
              </h3>
              <p className="text-xs text-stone-500 font-bold">
                {order.orderNumber} • {order.tableNumber === 'TAKEAWAY' ? 'กลับบ้าน' : `โต๊ะ ${order.tableNumber}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {language === 'th' 
              ? 'ระบบจะส่งการแจ้งเตือนไปยังหน้าจอมือถือของลูกค้าทันที และนำออเดอร์นี้ออกจากคิวครัว' 
              : 'The customer will immediately receive notification on mobile that this order was rejected.'}
          </p>
        </div>

        {/* Reason Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-black text-stone-800">
            {language === 'th' ? 'กรุณาเลือกเหตุผลในการยกเลิก:' : 'Select Reason for Cancellation:'}
          </label>

          <div className="space-y-2">
            {presetReasons.map((r, i) => {
              const label = language === 'en' ? r.en : r.th;
              const isSelected = selectedReason === r.th;

              return (
                <label
                  key={i}
                  onClick={() => setSelectedReason(r.th)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold cursor-pointer transition ${
                    isSelected
                      ? 'border-red-500 bg-red-50/60 text-red-950 shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-red-600 bg-red-600' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </div>
                  <span>{label}</span>
                </label>
              );
            })}
          </div>

          {selectedReason.startsWith('อื่นๆ') && (
            <input
              type="text"
              required
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder={language === 'th' ? 'พิมพ์เหตุผลเพิ่มเติม...' : 'Enter custom reason...'}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-red-500"
            />
          )}

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
            >
              {language === 'th' ? 'ย้อนกลับ' : 'Back'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs transition shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'ยืนยันปฏิเสธออเดอร์' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
