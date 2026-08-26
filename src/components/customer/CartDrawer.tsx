import React from 'react';
import { X, Trash2, Plus, Minus, QrCode, Banknote, Store } from 'lucide-react';
import { CartItem, PaymentMethod } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: string;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: (paymentMethod: PaymentMethod) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  tableNumber,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  paymentMethod,
  setPaymentMethod,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalItemPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">ตะกร้าของคุณ</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, i) => sum + i.quantity, 0)} รายการ
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table & Dine-in indicator */}
        <div className="bg-orange-50/60 px-4 py-2.5 border-b border-orange-100/60 flex items-center justify-between text-xs text-orange-900 font-medium">
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-orange-600" />
            <span>ตำแหน่งที่สั่ง:</span>
          </div>
          <span className="font-bold bg-white px-2 py-0.5 rounded border border-orange-200">
            {tableNumber === 'TAKEAWAY' ? 'สั่งกลับบ้าน' : `โต๊ะ ${tableNumber}`}
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <Store className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-gray-600">ยังไม่มีรายการในตะกร้า</p>
              <p className="text-xs text-gray-400 mt-1">เลือกเมนูแสนอร่อยเพื่อเริ่มสั่งอาหาร</p>
            </div>
          ) : (
            items.map((cartItem) => (
              <div
                key={cartItem.cartItemId}
                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {cartItem.menuItem.name}
                    </h4>

                    {/* Selected Options summary */}
                    {cartItem.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                        {cartItem.selectedOptions.map((opt, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-gray-400">•</span>
                            <span>{opt.choiceName}</span>
                            {opt.priceDelta > 0 && (
                              <span className="text-orange-600 font-medium">
                                (+฿{opt.priceDelta})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special note */}
                    {cartItem.specialNote && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                        โน้ต: {cartItem.specialNote}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      ฿{cartItem.totalItemPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <button
                    onClick={() => onRemoveItem(cartItem.cartItemId)}
                    className="text-gray-400 hover:text-red-500 text-xs flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.cartItemId, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-white text-gray-700 hover:bg-gray-200 text-xs shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-gray-800">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.cartItemId, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-white text-gray-700 hover:bg-gray-200 text-xs shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Checkout Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                เลือกวิธีชำระเงิน
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    paymentMethod === 'promptpay'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>พร้อมเพย์ QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>จ่ายที่เคาน์เตอร์</span>
                </button>
              </div>
            </div>

            {/* Total summary */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>ยอดรวม</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>ยอดสุทธิ</span>
                <span className="text-orange-600 text-lg">฿{subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={() => onCheckout(paymentMethod)}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2"
            >
              <span>ยืนยันและส่งออเดอร์</span>
              <span className="text-orange-200">•</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
