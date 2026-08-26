import React from 'react';
import { Clock, Check, Utensils, Sparkles, CheckCheck, Banknote, QrCode } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const timeFormatted = new Date(order.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getCardTheme = () => {
    switch (order.status) {
      case 'pending':
        return {
          border: 'border-red-400 ring-2 ring-red-100',
          badge: 'bg-red-500 text-white',
          label: 'รอดำเนินการ (Pending)',
        };
      case 'cooking':
        return {
          border: 'border-amber-400 ring-2 ring-amber-100',
          badge: 'bg-amber-500 text-white',
          label: 'กำลังปรุง (Cooking)',
        };
      case 'ready':
        return {
          border: 'border-emerald-400 ring-2 ring-emerald-100',
          badge: 'bg-emerald-500 text-white',
          label: 'พร้อมเสิร์ฟ (Ready)',
        };
      case 'completed':
        return {
          border: 'border-gray-200 opacity-70',
          badge: 'bg-gray-500 text-white',
          label: 'เสร็จสิ้น (Completed)',
        };
      default:
        return {
          border: 'border-gray-200',
          badge: 'bg-gray-400 text-white',
          label: order.status,
        };
    }
  };

  const theme = getCardTheme();

  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${theme.border}`}>
      <div>
        {/* Header: Table & Time */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-black px-2.5 py-1 rounded-lg bg-gray-900 text-white">
              {order.tableNumber === 'TAKEAWAY' ? 'กลับบ้าน' : `โต๊ะ ${order.tableNumber}`}
            </span>
            <span className="text-xs font-bold text-gray-500">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="py-2 flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
            {theme.label}
          </span>
          <div className="flex items-center gap-1 text-xs">
            {order.paymentMethod === 'promptpay' ? (
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                <QrCode className="w-3 h-3" /> พร้อมเพย์
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                <Banknote className="w-3 h-3" /> เงินสด
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="py-2 space-y-2 divide-y divide-gray-50">
          {order.items.map((item, idx) => (
            <div key={idx} className="pt-2 first:pt-0">
              <div className="flex items-start justify-between text-sm">
                <div className="flex-1">
                  <span className="font-extrabold text-orange-600 mr-1.5 text-base">
                    {item.quantity}x
                  </span>
                  <span className="font-bold text-gray-800">
                    {item.menuItem.name}
                  </span>
                </div>
              </div>

              {/* Options */}
              {item.selectedOptions.length > 0 && (
                <div className="ml-6 mt-0.5 flex flex-wrap gap-1">
                  {item.selectedOptions.map((opt, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium"
                    >
                      {opt.choiceName}
                    </span>
                  ))}
                </div>
              )}

              {/* Note */}
              {item.specialNote && (
                <div className="ml-6 mt-1 text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium inline-block">
                  ⚠️ {item.specialNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>ยอดรวม</span>
          <span className="font-bold text-gray-900 text-sm">฿{order.totalPrice.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'cooking')}
              className="col-span-2 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              <Utensils className="w-4 h-4" /> เริ่มปรุงอาหาร
            </button>
          )}

          {order.status === 'cooking' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              <Sparkles className="w-4 h-4" /> ปรุงเสร็จแล้ว (พร้อมเสิร์ฟ)
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed', 'paid')}
              className="col-span-2 py-2 px-3 rounded-xl bg-gray-800 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              <CheckCheck className="w-4 h-4" /> เสิร์ฟเรียบร้อย & ปิดบิล
            </button>
          )}

          {order.status === 'completed' && (
            <div className="col-span-2 text-center text-xs text-gray-400 py-1 font-medium">
              ออเดอร์นี้เสร็จสมบูรณ์แล้ว
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
