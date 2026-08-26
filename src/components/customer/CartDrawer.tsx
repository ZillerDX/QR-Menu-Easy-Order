import React from 'react';
import { X, Trash2, Plus, Minus, QrCode, Banknote, Store } from 'lucide-react';
import { CartItem, PaymentMethod, Language } from '../../types';
import { t } from '../../utils/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: string;
  language: Language;
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
  language,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  paymentMethod,
  setPaymentMethod,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalItemPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-stone-900 text-base">
              {language === 'th' ? 'ตะกร้าของคุณ' : 'Your Order'}
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, i) => sum + i.quantity, 0)} {t('items', language)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table indicator */}
        <div className="bg-orange-50/70 px-4 py-2.5 border-b border-orange-100/70 flex items-center justify-between text-xs text-orange-950 font-bold">
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-orange-600" />
            <span>{language === 'th' ? 'ตำแหน่งที่สั่ง:' : 'Order Target:'}</span>
          </div>
          <span className="font-extrabold bg-white px-2 py-0.5 rounded-lg border border-orange-200">
            {tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${tableNumber}`}
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Store className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-stone-600">
                {t('emptyCartTitle', language)}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {t('emptyCartSubtitle', language)}
              </p>
            </div>
          ) : (
            items.map((cartItem) => (
              <div
                key={cartItem.cartItemId}
                className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
                      {language === 'en' && cartItem.menuItem.nameEn
                        ? cartItem.menuItem.nameEn
                        : cartItem.menuItem.name}
                    </h4>

                    {cartItem.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-stone-500 mt-1 space-y-0.5">
                        {cartItem.selectedOptions.map((opt, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-stone-400">•</span>
                            <span>{opt.choiceName}</span>
                            {opt.priceDelta > 0 && (
                              <span className="text-orange-600 font-bold">
                                (+฿{opt.priceDelta})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {cartItem.specialNote && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 rounded-lg px-2 py-0.5 mt-1 inline-block font-medium">
                        {cartItem.specialNote}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-stone-900">
                      ฿{cartItem.totalItemPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <button
                    onClick={() => onRemoveItem(cartItem.cartItemId)}
                    className="text-stone-400 hover:text-red-500 text-xs flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t('delete', language)}
                  </button>

                  <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.cartItemId, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-white text-stone-700 hover:bg-stone-200 text-xs shadow-2xs font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-stone-800">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.cartItemId, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-white text-stone-700 hover:bg-stone-200 text-xs shadow-2xs font-bold"
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
          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {t('selectPayment', language)}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    paymentMethod === 'promptpay'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>{t('promptpayQR', language)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>{t('cashAtCounter', language)}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-stone-500">
                <span>{t('total', language)}</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                <span>{t('netTotal', language)}</span>
                <span className="text-orange-600 text-lg">฿{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => onCheckout(paymentMethod)}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-orange-500/30 transition flex items-center justify-between"
            >
              <span>{t('submitOrder', language)}</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
