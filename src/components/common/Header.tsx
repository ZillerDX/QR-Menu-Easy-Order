import React from 'react';
import { ShoppingBag, Coffee, Store, UtensilsCrossed, Globe } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';

interface HeaderProps {
  storeConfig: StoreConfig;
  tableNumber: string;
  cartCount: number;
  onOpenCart: () => void;
  activeRole: 'customer' | 'kitchen' | 'admin' | 'qr';
  onTableChange: (table: string) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeConfig,
  tableNumber,
  cartCount,
  onOpenCart,
  activeRole,
  onTableChange,
  language,
  onToggleLanguage,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between py-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
            {activeRole === 'kitchen' ? (
              <UtensilsCrossed className="w-5 h-5" />
            ) : (
              <Coffee className="w-5 h-5" />
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-stone-900 leading-tight text-base sm:text-lg flex items-center gap-1.5">
              {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block font-medium">
              {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Toggle Button: Toggle between EN / TH */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 bg-stone-50 hover:bg-orange-50/60 text-xs font-black text-stone-700 transition shadow-2xs"
            title="Toggle Language (EN / TH)"
          >
            <Globe className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="tracking-wide">{language === 'en' ? 'EN' : 'TH'}</span>
          </button>

          {activeRole === 'customer' && (
            <>
              {/* Table Selector badge */}
              <div className="flex items-center bg-orange-50/90 border border-orange-200 text-orange-950 text-xs font-black px-2.5 py-1.5 rounded-xl shadow-2xs">
                <Store className="w-3.5 h-3.5 mr-1 text-orange-600 flex-shrink-0" />
                <select
                  aria-label="Table Selection"
                  value={tableNumber}
                  onChange={(e) => onTableChange(e.target.value)}
                  className="bg-transparent font-black focus:outline-none cursor-pointer pr-1"
                >
                  {Array.from({ length: storeConfig.tableCount }, (_, i) => {
                    const tNum = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={tNum} value={tNum}>
                        {language === 'th' ? `โต๊ะ ${tNum}` : `Table ${tNum}`}
                      </option>
                    );
                  })}
                  <option value="TAKEAWAY">
                    {t('takeaway', language)}
                  </option>
                </select>
              </div>

              {/* Cart Button with badge */}
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition shadow-md shadow-orange-500/25 flex items-center gap-1.5"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-xs">
                    {cartCount}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-black pr-0.5">
                  {t('cart', language)}
                </span>
              </button>
            </>
          )}

          {activeRole === 'kitchen' && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kitchen KDS
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
