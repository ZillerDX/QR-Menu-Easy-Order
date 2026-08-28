import React from 'react';
import { Clock, Utensils, Sparkles, CheckCheck, Banknote, QrCode, Flame, Hourglass, Printer } from 'lucide-react';
import { Order, OrderStatus, Language } from '../../types';
import { t } from '../../utils/i18n';

interface OrderCardProps {
  order: Order;
  language: Language;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => void;
  onPrintReceipt?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  language, 
  onUpdateStatus,
  onPrintReceipt,
}) => {
  const timeFormatted = new Date(order.createdAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getCardTheme = () => {
    switch (order.status) {
      case 'pending':
        return {
          border: 'border-red-400/80 ring-2 ring-red-100 shadow-md shadow-red-500/10',
          badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-xs',
          label: t('kdsPendingBadge', language),
          icon: <Hourglass className="w-3.5 h-3.5 animate-spin text-white" />,
        };
      case 'cooking':
        return {
          border: 'border-amber-400/80 ring-2 ring-amber-100 shadow-md shadow-amber-500/10',
          badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs',
          label: t('kdsCookingBadge', language),
          icon: <Flame className="w-3.5 h-3.5 animate-pulse text-white" />,
        };
      case 'ready':
        return {
          border: 'border-emerald-400/80 ring-2 ring-emerald-100 shadow-md shadow-emerald-500/10',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs',
          label: t('kdsReadyBadge', language),
          icon: <Sparkles className="w-3.5 h-3.5 animate-bounce text-white" />,
        };
      case 'completed':
        return {
          border: 'border-stone-200 opacity-65',
          badge: 'bg-stone-500 text-white',
          label: t('kdsCompletedBadge', language),
          icon: <CheckCheck className="w-3.5 h-3.5 text-white" />,
        };
      default:
        return {
          border: 'border-stone-200',
          badge: 'bg-stone-400 text-white',
          label: order.status,
          icon: <Clock className="w-3.5 h-3.5 text-white" />,
        };
    }
  };

  const theme = getCardTheme();

  return (
    <div className={`bg-white rounded-3xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${theme.border}`}>
      <div>
        {/* Header: Table & Time */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black px-3 py-1 rounded-xl bg-stone-900 text-white shadow-xs">
              {order.tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${order.tableNumber}`}
            </span>
            <span className="text-xs font-black text-stone-400">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeFormatted}</span>
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
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg font-bold">
                <QrCode className="w-3 h-3" /> {t('promptpayQR', language)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold">
                <Banknote className="w-3 h-3" /> {t('cashAtCounter', language)}
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
                  ⚠️ {item.specialNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
          <button
            type="button"
            onClick={() => onPrintReceipt?.(order)}
            className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-xl transition cursor-pointer font-black active:scale-95"
            title="Print Receipt Slip"
          >
            <Printer className="w-3.5 h-3.5 text-orange-500" />
            <span>{language === 'th' ? 'พิมพ์ใบเสร็จ' : 'Print Slip'}</span>
          </button>
          
          <div className="text-right">
            <span className="text-[10px] text-stone-400 mr-1">{t('total', language)}</span>
            <span className="font-black text-stone-900 text-sm">฿{order.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'cooking')}
              className="col-span-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
            >
              <Utensils className="w-4 h-4" /> {t('kdsStartCooking', language)}
            </button>
          )}

          {order.status === 'cooking' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="col-span-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/25 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> {t('kdsReadyToServe', language)}
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed', 'paid')}
              className="col-span-2 py-2.5 px-3 rounded-2xl bg-stone-900 hover:bg-black text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> {t('kdsCloseBill', language)}
            </button>
          )}

          {order.status === 'completed' && (
            <div className="col-span-2 text-center text-xs text-stone-400 py-1.5 font-bold bg-stone-100 rounded-2xl">
              ✓ {t('kdsCompletedBadge', language)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
