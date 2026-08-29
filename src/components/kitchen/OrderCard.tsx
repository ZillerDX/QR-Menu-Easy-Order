import React, { useState } from 'react';
import { 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Banknote, 
  QrCode, 
  Flame, 
  Hourglass, 
  Printer, 
  XCircle, 
  ChefHat, 
  Undo2, 
  Loader2 
} from 'lucide-react';
import { Order, OrderStatus, Language } from '../../types';
import { t } from '../../utils/i18n';

interface OrderCardProps {
  order: Order;
  language: Language;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => Promise<void> | void;
  onPrintReceipt?: (order: Order) => void;
  onRejectOrder?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  language, 
  onUpdateStatus,
  onPrintReceipt,
  onRejectOrder,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingLabel, setUpdatingLabel] = useState('');

  const timeFormatted = new Date(order.createdAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getCardTheme = () => {
    switch (order.status) {
      case 'pending':
        return {
          border: 'border-red-300 ring-2 ring-red-100 shadow-md shadow-red-500/10',
          badge: 'bg-red-500 text-white shadow-xs',
          label: t('kdsPendingBadge', language),
          icon: <Hourglass className="w-3.5 h-3.5 animate-spin text-white" />,
        };
      case 'cooking':
        return {
          border: 'border-amber-300 ring-2 ring-amber-100 shadow-md shadow-amber-500/10',
          badge: 'bg-amber-500 text-white shadow-xs',
          label: t('kdsCookingBadge', language),
          icon: <Flame className="w-3.5 h-3.5 animate-pulse text-white" />,
        };
      case 'ready':
        return {
          border: 'border-emerald-300 ring-2 ring-emerald-100 shadow-md shadow-emerald-500/10',
          badge: 'bg-emerald-600 text-white shadow-xs',
          label: t('kdsReadyBadge', language),
          icon: <Sparkles className="w-3.5 h-3.5 animate-bounce text-white" />,
        };
      case 'completed':
        return {
          border: 'border-stone-200 opacity-75 bg-stone-50/50',
          badge: 'bg-stone-600 text-white',
          label: t('kdsCompletedBadge', language),
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-white" />,
        };
      case 'cancelled':
        return {
          border: 'border-red-200 opacity-75 bg-red-50/20',
          badge: 'bg-red-600 text-white',
          label: language === 'th' ? 'ยกเลิกแล้ว' : 'Cancelled',
          icon: <XCircle className="w-3.5 h-3.5 text-white" />,
        };
      default:
        return {
          border: 'border-stone-200',
          badge: 'bg-stone-500 text-white',
          label: order.status,
          icon: <Clock className="w-3.5 h-3.5 text-white" />,
        };
    }
  };

  const theme = getCardTheme();

  const handleStepUpdate = async (nextStatus: OrderStatus, nextPaymentStatus?: Order['paymentStatus'], label = '') => {
    if (isUpdating) return;
    setIsUpdating(true);
    setUpdatingLabel(label);
    
    // Smooth guaranteed visual feedback with minimum spinner duration
    await new Promise((resolve) => setTimeout(resolve, 450));
    try {
      await onUpdateStatus(order.id, nextStatus, nextPaymentStatus);
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
        setUpdatingLabel('');
      }, 150);
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden ${theme.border}`}>
      
      {/* Visual Loading Overlay with Spinner */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-2.5 animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <span className="text-xs font-black text-stone-800 tracking-tight animate-pulse">
            {updatingLabel || (language === 'th' ? 'กำลังอัปเดตสถานะ...' : 'Updating status...')}
          </span>
        </div>
      )}

      <div>
        {/* Header: Table, Reject & Time */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black px-3 py-1 rounded-xl bg-stone-900 text-white shadow-xs">
              {order.tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${order.tableNumber}`}
            </span>
            <span className="text-xs font-black text-stone-400">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => onRejectOrder?.(order)}
                className="text-stone-400 hover:text-red-600 bg-stone-100 hover:bg-red-50 px-2.5 py-1 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 active:scale-95"
                title={language === 'th' ? 'ปฏิเสธ / ยกเลิกออเดอร์นี้' : 'Reject Order'}
              >
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[11px] text-red-600 font-black">
                  {language === 'th' ? 'ปฏิเสธ' : 'Reject'}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1 text-xs text-stone-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeFormatted}</span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="py-2.5 flex items-center justify-between">
          <span className={`text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${theme.badge}`}>
            {theme.icon}
            <span>{theme.label}</span>
          </span>
          
          <div className="flex items-center gap-1 text-xs">
            {order.paymentMethod === 'promptpay' ? (
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg font-bold">
                <QrCode className="w-3 h-3 text-blue-600" />
                <span>{t('promptpayQR', language)}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg font-bold">
                <Banknote className="w-3 h-3 text-emerald-600" />
                <span>{t('cashAtCounter', language)}</span>
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${
              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus === 'paid' ? t('kdsPaid', language) : t('kdsUnpaid', language)}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="py-2 space-y-2 divide-y divide-stone-50">
          {order.items.map((item, idx) => (
            <div key={idx} className="pt-2 first:pt-0">
              <div className="flex items-start justify-between text-sm">
                <div className="flex-1">
                  <span className="font-black text-orange-600 mr-1.5 text-base">
                    {item.quantity}x
                  </span>
                  <span className="font-extrabold text-stone-800">
                    {language === 'en' && item.menuItem.nameEn ? item.menuItem.nameEn : item.menuItem.name}
                  </span>
                </div>
              </div>

              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <div className="ml-6 mt-0.5 flex flex-wrap gap-1">
                  {item.selectedOptions.map((opt, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-bold"
                    >
                      {opt.choiceName}
                    </span>
                  ))}
                </div>
              )}

              {item.specialNote && (
                <div className="ml-6 mt-1 text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-bold inline-block">
                  หมายเหตุ: {item.specialNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls & Explicit Workflow Buttons */}
      <div className="mt-4 pt-3 border-t border-stone-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
          <button
            type="button"
            onClick={() => onPrintReceipt?.(order)}
            className="flex items-center gap-1.5 text-[11px] text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition cursor-pointer font-black active:scale-95 shadow-2xs"
            title="Print Receipt Slip"
          >
            <Printer className="w-3.5 h-3.5 text-orange-600" />
            <span>{language === 'th' ? 'พิมพ์ใบเสร็จ' : 'Print Slip'}</span>
          </button>
          
          <div className="text-right">
            <span className="text-[10px] text-stone-400 mr-1">{t('total', language)}</span>
            <span className="font-black text-stone-900 text-base">฿{order.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Step-by-Step Explicit Action Buttons with Click Protection (NO UNDO ON COOKING) */}
        <div className="pt-1">
          {order.status === 'pending' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStepUpdate('cooking', undefined, language === 'th' ? 'กำลังเริ่มปรุงอาหาร...' : 'Starting cooking...')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <ChefHat className="w-4 h-4 text-white" />
              )}
              <span>{isUpdating ? updatingLabel : (language === 'th' ? 'เริ่มปรุงอาหาร' : 'Start Cooking')}</span>
            </button>
          )}

          {/* Cooking Step: Full-width Clean Action (NO UNDO BUTTON) */}
          {order.status === 'cooking' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStepUpdate('ready', undefined, language === 'th' ? 'กำลังนำส่งพร้อมเสิร์ฟ...' : 'Marking ready to serve...')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
              <span>{isUpdating ? updatingLabel : (language === 'th' ? 'ปรุงเสร็จแล้ว (พร้อมเสิร์ฟ)' : 'Ready to Serve')}</span>
            </button>
          )}

          {/* Ready Step: Full-width Close Bill Action */}
          {order.status === 'ready' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStepUpdate('completed', 'paid', language === 'th' ? 'กำลังปิดบิลชำระเงิน...' : 'Closing bill...')}
              className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isUpdating ? updatingLabel : (language === 'th' ? 'ปิดบิล (ชำระเงินแล้ว)' : 'Close Bill (Paid)')}</span>
            </button>
          )}

          {order.status === 'completed' && (
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2.5 px-3 rounded-2xl bg-stone-100 text-stone-500 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'th' ? 'ปิดบิลเรียบร้อยแล้ว' : 'Bill Closed'}</span>
              </div>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStepUpdate('ready', 'paid', language === 'th' ? 'เปิดบิลใหม่...' : 'Reopening bill...')}
                className="px-3 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
                title={language === 'th' ? 'ย้อนกลับไปพร้อมเสิร์ฟ' : 'Reopen Bill'}
              >
                <Undo2 className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[11px]">{language === 'th' ? 'เปิดบิลใหม่' : 'Reopen'}</span>
              </button>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="py-2.5 px-3 rounded-2xl bg-red-50 text-red-700 font-bold text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'th' ? `ปฏิเสธ: ${order.cancelReason || 'ไม่ระบุ'}` : `Rejected: ${order.cancelReason || 'N/A'}`}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
