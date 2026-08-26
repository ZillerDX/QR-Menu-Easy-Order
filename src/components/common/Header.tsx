import React from 'react';
import { ShoppingBag, Coffee, Store, UtensilsCrossed } from 'lucide-react';
import { StoreConfig } from '../../types';

interface HeaderProps {
  storeConfig: StoreConfig;
  tableNumber: string;
  cartCount: number;
  onOpenCart: () => void;
  activeRole: 'customer' | 'kitchen' | 'qr';
  onTableChange: (table: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeConfig,
  tableNumber,
  cartCount,
  onOpenCart,
  activeRole,
  onTableChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            {activeRole === 'kitchen' ? (
              <UtensilsCrossed className="w-5 h-5" />
            ) : (
              <Coffee className="w-5 h-5" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight text-base sm:text-lg flex items-center gap-1.5">
              {storeConfig.name}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              {storeConfig.tagline}
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeRole === 'customer' && (
            <>
              {/* Table Selector badge */}
              <div className="flex items-center bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                <Store className="w-3.5 h-3.5 mr-1 text-orange-600" />
                <select
                  aria-label="เลือกเบอร์โต๊ะ"
                  value={tableNumber}
                  onChange={(e) => onTableChange(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer pr-1"
                >
                  {Array.from({ length: storeConfig.tableCount }, (_, i) => {
                    const t = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={t} value={t}>
                        โต๊ะ {t}
                      </option>
                    );
                  })}
                  <option value="TAKEAWAY">สั่งกลับบ้าน</option>
                </select>
              </div>

              {/* Cart Button with badge */}
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition shadow-md shadow-orange-500/25 flex items-center gap-1.5"
                title="เปิดตะกร้าสินค้า"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-medium pr-0.5">ตะกร้า</span>
              </button>
            </>
          )}

          {activeRole === 'kitchen' && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kitchen KDS Online
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
