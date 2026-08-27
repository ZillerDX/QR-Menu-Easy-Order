import React from 'react';
import { ShoppingBag, Store, ChevronDown } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';

interface HeaderProps {
  storeConfig: StoreConfig;
  tableNumber: string;
  cartCount: number;
  onOpenCart: () => void;
  activeRole: 'customer' | 'kitchen' | 'admin' | 'settings' | 'qr';
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs h-16 flex items-center">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name (Fixed & 100% Consistent across ALL views) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0 overflow-hidden">
            {storeConfig.logoUrl ? (
              <img
                src={storeConfig.logoUrl}
                alt="Store Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-stone-900 leading-tight text-base sm:text-lg truncate">
              {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block font-medium truncate">
              {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Dual Toggle Switch for Language (TH / EN) */}
          <div
            onClick={onToggleLanguage}
            role="button"
            tabIndex={0}
            title="Toggle Language (TH / EN)"
            className="relative flex items-center bg-stone-100 border border-stone-200/90 p-1 rounded-2xl cursor-pointer select-none transition shadow-2xs hover:border-stone-300 h-9"
          >
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[32px] rounded-xl bg-orange-500 shadow-sm transition-all duration-200 ease-out ${
                language === 'en' ? 'left-[36px]' : 'left-1'
              }`}
            />
            {/* TH Option */}
            <span
              className={`relative z-10 w-[32px] text-center text-xs font-black transition-colors duration-150 ${
                language === 'th' ? 'text-white' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              TH
            </span>
            {/* EN Option */}
            <span
              className={`relative z-10 w-[32px] text-center text-xs font-black transition-colors duration-150 ${
                language === 'en' ? 'text-white' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              EN
            </span>
          </div>

          {activeRole === 'customer' && (
            <>
              {/* Modern Table Selector */}
              <div className="relative flex items-center bg-orange-50/90 border border-orange-200 text-orange-950 text-xs font-black rounded-xl shadow-2xs hover:border-orange-300 transition h-9">
                <div className="flex items-center pl-2.5 pointer-events-none text-orange-600">
                  <Store className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                </div>
                <select
                  aria-label="Table Selection"
                  value={tableNumber}
                  onChange={(e) => onTableChange(e.target.value)}
                  className="bg-transparent font-black py-1.5 pl-1 pr-6 focus:outline-none cursor-pointer text-xs appearance-none text-orange-950"
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
                <ChevronDown className="w-3 h-3 text-orange-600 absolute right-2 pointer-events-none" />
              </div>

              {/* Cart Button with badge */}
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer h-9 px-3"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4" />
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
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kitchen KDS
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              Admin Mode
            </div>
          )}

          {activeRole === 'settings' && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              Store Settings
            </div>
          )}

          {activeRole === 'qr' && (
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              Table QR Stand
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
