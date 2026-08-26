import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, ChefHat, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTrackerProps {
  order: Order | null;
  onOrderMore: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, onOrderMore }) => {
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
      label: 'รับออเดอร์แล้ว',
      desc: 'ร้านค้าได้รับออเดอร์ของคุณเรียบร้อย',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      key: 'cooking',
      label: 'กำลังปรุงอาหาร',
      desc: 'เชฟกำลังเตรียมเมนูสุดพิเศษให้คุณ',
      icon: <ChefHat className="w-5 h-5" />,
    },
    {
      key: 'ready',
      label: 'พร้อมเสิร์ฟ / รับได้แล้ว',
      desc: 'อาหารพร้อมแล้ว พนักงานกำลังนำไปเสิร์ฟ',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    },
    {
      key: 'completed',
      label: 'เสร็จสิ้น',
      desc: 'ขอบคุณที่ใช้บริการ ขอให้อร่อยกับมื้อนี้ครับ/ค่ะ',
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
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-amber-500" />

        <div className="pt-2">
          <span className="text-xs font-semibold text-gray-400">
            หมายเลขออเดอร์
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {order.orderNumber}
          </h2>
          <div className="inline-block mt-1 bg-orange-50 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
            {order.tableNumber === 'TAKEAWAY' ? 'สั่งกลับบ้าน' : `โต๊ะ ${order.tableNumber}`}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-4 text-left">
          {steps.map((step, idx) => {
            const isPassed = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;

            return (
              <div key={step.key} className="flex items-start gap-3 relative">
                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-7 ${
                      idx < currentIndex ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                    isCurrent
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow'
                      : isPassed
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                </div>

                {/* Text description */}
                <div className="flex-1 pt-0.5">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-orange-600'
                        : isPassed
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-gray-500 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          รายการอาหารที่สั่ง ({order.items.length} รายการ)
        </h4>

        <div className="divide-y divide-gray-50 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="py-2 flex justify-between items-start">
              <div>
                <span className="font-bold text-gray-800">{item.quantity}x </span>
                <span className="text-gray-800">{item.menuItem.name}</span>
                {item.selectedOptions.length > 0 && (
                  <p className="text-[11px] text-gray-400">
                    {item.selectedOptions.map((o) => o.choiceName).join(', ')}
                  </p>
                )}
              </div>
              <span className="font-semibold text-gray-700">
                ฿{item.totalItemPrice.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-base">
          <span>ยอดรวมทั้งหมด</span>
          <span className="text-orange-600">฿{order.totalPrice.toLocaleString()}</span>
        </div>

        <div className="text-xs text-gray-400 flex justify-between pt-1">
          <span>วิธีชำระเงิน</span>
          <span className="font-medium text-gray-600">
            {order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสดที่เคาน์เตอร์'} (
            {order.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'})
          </span>
        </div>
      </div>

      {/* Action to order more */}
      <button
        onClick={onOrderMore}
        className="w-full py-3.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-sm border border-orange-200 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> สั่งอาหารเพิ่มเติม
      </button>
    </div>
  );
};
