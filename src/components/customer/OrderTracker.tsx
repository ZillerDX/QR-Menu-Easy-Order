import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, ChefHat, Sparkles, Plus, X, Utensils, Receipt, Ban, AlertCircle } from 'lucide-react';
import { Order, OrderStatus, Language } from '../../types';
import { t } from '../../utils/i18n';

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  language: Language;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  isOpen,
  onClose,
  order,
  language,
}) => {
  useEffect(() => {
    if (isOpen && (order?.status === 'ready' || order?.status === 'completed')) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error("Confetti error:", err);
      }
    }
  }, [isOpen, order?.status]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'pending',
      label: t('trackerStep1', language),
      desc: t('trackerStep1Desc', language),
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'cooking',
      label: t('trackerStep2', language),
      desc: t('trackerStep2Desc', language),
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      key: 'ready',
      label: t('trackerStep3', language),
      desc: t('trackerStep3Desc', language),
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      key: 'completed',
      label: t('trackerStep4', language),
      desc: t('trackerStep4Desc', language),
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'cooking': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  const formattedTime = (() => {
    try {
      return order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    } catch {
      return '';
    }
  })();

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Full Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Tracker Card */}
      <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-stone-200/80 z-10">
        
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between flex-shrink-0 ${
          order.status === 'cancelled'
            ? 'bg-gradient-to-r from-red-600 to-rose-600'
            : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              {order.status === 'cancelled' ? <Ban className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg tracking-tight">
                  {t('trackerTitle', language)} {order.orderNumber}
                </h3>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                {order.tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${order.tableNumber}`} {formattedTime ? `• ${formattedTime}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            title={t('close', language)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 text-xs sm:text-sm">
          
          {/* Cancelled Banner if cancelled */}
          {order.status === 'cancelled' ? (
            <div className="bg-red-50 rounded-3xl p-5 border border-red-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-red-950">
                  {language === 'th' ? 'ออเดอร์นี้ถูกยกเลิกโดยทางร้าน' : 'Order Cancelled by Store'}
                </h4>
                <p className="text-xs text-red-700 font-bold bg-white/80 py-1.5 px-3 rounded-xl border border-red-100 inline-block">
                  {order.cancelReason ? `${language === 'th' ? 'เหตุผล' : 'Reason'}: ${order.cancelReason}` : (language === 'th' ? 'กรุณาติดต่อพนักงานประจำร้าน' : 'Please contact staff')}
                </p>
              </div>
            </div>
          ) : (
            /* Status Progression Card */
            <div className="bg-stone-50/90 rounded-3xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ความคืบหน้าออเดอร์' : 'Live Order Progress'}
                </span>
                <span className="text-xs font-black text-orange-600 bg-orange-100/70 px-2.5 py-0.5 rounded-full animate-pulse">
                  {order.status === 'pending' && `⏳ ${t('trackerStep1', language)}`}
                  {order.status === 'cooking' && `🍳 ${t('trackerStep2', language)}`}
                  {order.status === 'ready' && `✨ ${t('trackerStep3', language)}`}
                  {order.status === 'completed' && `✅ ${t('trackerStep4', language)}`}
                </span>
              </div>

              {/* Timeline */}
              <div className="space-y-4 pt-1">
                {steps.map((step, idx) => {
                  const isPassed = idx < currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div key={step.key} className="flex items-start gap-3.5 relative">
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute left-[15px] top-8 w-0.5 h-8 ${
                            idx < currentIndex ? 'bg-orange-500' : 'bg-stone-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                          isCurrent
                            ? 'bg-orange-500 text-white ring-4 ring-orange-200 scale-110 shadow-md'
                            : isPassed
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : step.icon}
                      </div>

                      <div className="flex-1 pt-0.5">
                        <h4
                          className={`text-sm font-black ${
                            isCurrent
                              ? 'text-orange-600'
                              : isPassed
                              ? 'text-stone-900'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-stone-500 leading-snug font-medium mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ordered Items Breakdown */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-orange-500" />
                <span>{language === 'th' ? 'รายการอาหารที่สั่ง' : 'Ordered Items'}</span>
              </h4>
              <span className="text-xs font-bold text-stone-400">
                {(order.items || []).length} {t('items', language)}
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {(order.items || []).map((item, i) => (
                <div key={i} className="py-2.5 flex justify-between items-start gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg text-xs flex-shrink-0">
                        {item.quantity}x
                      </span>
                      <span className="text-stone-900 font-black text-xs sm:text-sm leading-snug">
                        {language === 'en' && item.menuItem?.nameEn ? item.menuItem.nameEn : item.menuItem?.name}
                      </span>
                    </div>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-stone-400 font-medium pl-7">
                        {item.selectedOptions.map((o) => o.choiceName).join(', ')}
                      </p>
                    )}
                    {item.specialNote && (
                      <p className="text-[11px] text-amber-600 font-medium pl-7">
                        ✏️ {item.specialNote}
                      </p>
                    )}
                  </div>
                  <span className="font-black text-stone-900 text-xs sm:text-sm pt-0.5 flex-shrink-0 whitespace-nowrap">
                    ฿{item.totalItemPrice?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total & Payment Note */}
            <div className="pt-3 border-t border-stone-200/80 space-y-2">
              <div className="flex justify-between items-center font-black text-base">
                <span className="text-stone-900">{t('total', language)}</span>
                <span className="text-orange-600 text-lg font-black">฿{order.totalPrice?.toLocaleString()}</span>
              </div>

              {order.status !== 'cancelled' && (
                <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-100 text-xs text-orange-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>ℹ️</span>
                    <span>{language === 'th' ? 'การชำระเงิน' : 'Payment Information'}</span>
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                    {language === 'th' 
                      ? 'พนักงานจะนำใบเสร็จพร้อม PromptPay QR มาให้ท่านสแกนจ่ายหรือชำระด้วยเงินสดเมื่ออาหารพร้อมเสิร์ฟ' 
                      : 'Staff will deliver the bill slip with PromptPay QR directly to your table when food is served.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Clean Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('trackerOrderMore', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
