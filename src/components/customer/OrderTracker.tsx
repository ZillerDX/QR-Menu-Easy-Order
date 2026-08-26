import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, ChefHat, Sparkles, Plus } from 'lucide-react';
import { Order, OrderStatus, Language } from '../../types';
import { t } from '../../utils/i18n';

interface OrderTrackerProps {
  order: Order | null;
  language: Language;
  onOrderMore: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, language, onOrderMore }) => {
  useEffect(() => {
    if (order?.status === 'ready' || order?.status === 'completed') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [order?.status]);

  if (!order) return null;

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'pending',
      label: t('trackerStep1', language),
      desc: t('trackerStep1Desc', language),
      icon: <Clock className="w-5 h-5" />,
    },
    {
      key: 'cooking',
      label: t('trackerStep2', language),
      desc: t('trackerStep2Desc', language),
      icon: <ChefHat className="w-5 h-5" />,
    },
    {
      key: 'ready',
      label: t('trackerStep3', language),
      desc: t('trackerStep3Desc', language),
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    },
    {
      key: 'completed',
      label: t('trackerStep4', language),
      desc: t('trackerStep4Desc', language),
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
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

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 animate-in fade-in duration-300 pb-24">
      {/* Status Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-amber-500" />

        <div className="pt-2">
          <span className="text-xs font-bold text-stone-400">
            {t('trackerTitle', language)}
          </span>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {order.orderNumber}
          </h2>
          <div className="inline-block mt-1 bg-orange-50 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-full border border-orange-200">
            {order.tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${order.tableNumber}`}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-4 text-left">
          {steps.map((step, idx) => {
            const isPassed = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex items-start gap-3 relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-7 ${
                      idx < currentIndex ? 'bg-orange-500' : 'bg-stone-200'
                    }`}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                    isCurrent
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow'
                      : isPassed
                      ? 'bg-orange-500 text-white'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                </div>

                <div className="flex-1 pt-0.5">
                  <h4
                    className={`text-sm font-extrabold ${
                      isCurrent
                        ? 'text-orange-600'
                        : isPassed
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-stone-500 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider">
          {language === 'th' ? 'รายการอาหารที่สั่ง' : 'Ordered Items'} ({order.items.length} {t('items', language)})
        </h4>

        <div className="divide-y divide-stone-100 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="py-2.5 flex justify-between items-start">
              <div>
                <span className="font-extrabold text-stone-800">{item.quantity}x </span>
                <span className="text-stone-800 font-bold">
                  {language === 'en' && item.menuItem.nameEn ? item.menuItem.nameEn : item.menuItem.name}
                </span>
                {item.selectedOptions.length > 0 && (
                  <p className="text-[11px] text-stone-400 font-medium">
                    {item.selectedOptions.map((o) => o.choiceName).join(', ')}
                  </p>
                )}
              </div>
              <span className="font-bold text-stone-800">
                ฿{item.totalItemPrice.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-100 flex justify-between font-extrabold text-base">
          <span>{t('total', language)}</span>
          <span className="text-orange-600">฿{order.totalPrice.toLocaleString()}</span>
        </div>

        <div className="text-xs text-stone-400 flex justify-between pt-1 font-medium">
          <span>{t('trackerPaymentMethod', language)}</span>
          <span className="font-bold text-stone-700">
            {order.paymentMethod === 'promptpay' ? t('promptpayQR', language) : t('cashAtCounter', language)} (
            {order.paymentStatus === 'paid' ? t('kdsPaid', language) : t('kdsUnpaid', language)})
          </span>
        </div>
      </div>

      <button
        onClick={onOrderMore}
        className="w-full py-3.5 px-4 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-extrabold text-sm border border-orange-200 transition flex items-center justify-center gap-2 shadow-2xs"
      >
        <Plus className="w-4 h-4" /> {t('trackerOrderMore', language)}
      </button>
    </div>
  );
};
