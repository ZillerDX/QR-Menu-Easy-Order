import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Plus, Minus, Store, ArrowRight, Utensils } from 'lucide-react';
import { CartItem, Language } from '../../types';
import { t } from '../../utils/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: string;
  language: Language;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
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
}) => {
  // Lock background scroll when drawer is open
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

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalItemPrice, 0);

  const drawerContent = (
    <div 
      className="fixed inset-0 z-[9999] flex justify-end bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-stone-900 text-base">
              {language === 'th' ? 'รายการอาหารของคุณ' : 'Your Order Items'}
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, i) => sum + i.quantity, 0)} {t('items', language)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table Indicator */}
        <div className="bg-orange-50/90 px-4 py-2.5 border-b border-orange-100 flex items-center justify-between text-xs text-orange-950 font-bold flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-orange-600" />
            <span>{language === 'th' ? 'สั่งอาหารสำหรับ:' : 'Ordering for:'}</span>
          </div>
          <span className="font-black bg-white px-2.5 py-0.5 rounded-lg border border-orange-200 shadow-2xs">
            {tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${tableNumber}`}
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain touch-pan-y">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Utensils className="w-8 h-8" />
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
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs flex flex-col gap-2.5"
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
                            <span className="leading-tight">{opt.choiceName}</span>
                            {opt.priceDelta > 0 && (
                              <span className="text-orange-600 font-bold whitespace-nowrap flex-shrink-0 ml-1">
                                (+฿{opt.priceDelta})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {cartItem.specialNote && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">
                        ✏️ {cartItem.specialNote}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-stone-900">
                      ฿{cartItem.totalItemPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(cartItem.cartItemId)}
                    className="text-stone-400 hover:text-red-500 text-xs flex items-center gap-1 transition cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t('delete', language)}
                  </button>

                  <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(cartItem.cartItemId, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-white text-stone-700 hover:bg-stone-200 text-xs shadow-2xs font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-stone-800">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(cartItem.cartItemId, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-white text-stone-700 hover:bg-stone-200 text-xs shadow-2xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3 flex-shrink-0">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-stone-500">
                <span>{t('total', language)}</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                <span>{t('netTotal', language)}</span>
                <span className="text-orange-600 text-lg font-black">฿{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 text-center font-medium">
              {language === 'th'
                ? 'ℹ️ ออเดอร์จะถูกส่งไปยังห้องครัวทันที ชำระเงินเมื่อพนักงานนำอาหารและบิลมาเสิร์ฟ'
                : 'ℹ️ Order will be sent directly to the kitchen. Pay when food is served.'}
            </p>

            <button
              type="button"
              onClick={onCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-orange-500/30 transition flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                <span>{language === 'th' ? 'ยืนยันสั่งอาหารไปยังห้องครัว' : 'Send Order to Kitchen'}</span>
              </span>
              <div className="flex items-center gap-1">
                <span>฿{subtotal.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};
