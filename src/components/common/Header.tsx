import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Store, ChevronDown, Check, UtensilsCrossed, Package, Sparkles, LogIn, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  storeConfig: StoreConfig;
  tableNumber: string;
  cartCount: number;
  onOpenCart: () => void;
  activeRole: 'customer' | 'kitchen' | 'admin' | 'settings' | 'qr';
  onTableChange: (table: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
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
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTableDropdownOpen(false);
      }
    };
    if (isTableDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTableDropdownOpen]);

  const handleSelectTable = (tbl: string) => {
    onTableChange(tbl);
    setIsTableDropdownOpen(false);
  };

  const getTableDisplayLabel = (tbl: string) => {
    if (tbl === 'TAKEAWAY') {
      return t('takeaway', language);
    }
    return language === 'th' ? `โต๊ะ ${tbl}` : `Table ${tbl}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs h-16 flex items-center">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0 overflow-hidden hover:scale-105 transition-transform duration-200">
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
            className="relative flex items-center bg-stone-100 border border-stone-200/90 p-1 rounded-2xl cursor-pointer select-none transition shadow-2xs hover:border-stone-300 hover:shadow-xs h-9 active:scale-95"
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

          {/* Customer Specific Tools: Table Dropdown & Cart */}
          {activeRole === 'customer' && (
            <>
              {/* Ultra-Modern Custom Table Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 bg-orange-50/90 hover:bg-orange-100/80 border text-orange-950 text-xs font-black rounded-2xl shadow-2xs transition-all duration-200 h-9 cursor-pointer active:scale-95 ${
                    isTableDropdownOpen
                      ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-100/90'
                      : 'border-orange-200/90'
                  }`}
                  title="Select Table"
                >
                  <Store className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <span className="truncate">{getTableDisplayLabel(tableNumber)}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-orange-600 transition-transform duration-200 flex-shrink-0 ${
                      isTableDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu Popover */}
                {isTableDropdownOpen && (
                  <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                        {language === 'th' ? 'เลือกตำแหน่งสั่งอาหาร' : 'Select Dining Option'}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                        {storeConfig.tableCount} {language === 'th' ? 'โต๊ะ' : 'Tables'}
                      </span>
                    </div>

                    {/* Takeaway Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectTable('TAKEAWAY')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-98 ${
                        tableNumber === 'TAKEAWAY'
                          ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-black shadow-xs'
                          : 'border-stone-100 bg-stone-50/70 hover:bg-stone-100 text-stone-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black">{t('takeaway', language)}</div>
                          <div className="text-[10px] text-stone-400 font-normal">สั่งกลับบ้าน / Takeaway Order</div>
                        </div>
                      </div>
                      {tableNumber === 'TAKEAWAY' && <Check className="w-4 h-4 text-orange-600 font-black" />}
                    </button>

                    {/* Table Numbers Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black text-stone-400 uppercase">
                        {language === 'th' ? 'โต๊ะนั่งทานในร้าน:' : 'Dine-In Tables:'}
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                        {Array.from({ length: storeConfig.tableCount }, (_, i) => {
                          const tbl = (i + 1).toString().padStart(2, '0');
                          const isSelected = tableNumber === tbl;
                          return (
                            <button
                              key={tbl}
                              type="button"
                              onClick={() => handleSelectTable(tbl)}
                              className={`py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer flex flex-col items-center justify-center active:scale-95 ${
                                isSelected
                                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-500/20'
                                  : 'bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-700 border border-stone-100'
                              }`}
                            >
                              <span className="text-[9px] opacity-70">โต๊ะ</span>
                              <span>{tbl}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer h-9 px-3 hover:shadow-lg hover:shadow-orange-500/35"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-heartbeat shadow-xs">
                    {cartCount}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-black pr-0.5">
                  {t('cart', language)}
                </span>
              </button>
            </>
          )}

          {/* Staff Mode Role Badges */}
          {activeRole === 'kitchen' && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kitchen KDS
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              Admin Mode
            </div>
          )}

          {activeRole === 'settings' && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              Store Settings
            </div>
          )}

          {activeRole === 'qr' && (
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
              Table QR Stand
            </div>
          )}

          {/* Staff Auth Indicator / Login Button */}
          {!user ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-2xl border border-stone-200/90 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-black flex items-center gap-1.5 transition shadow-2xs cursor-pointer h-9 active:scale-95"
              title={language === 'th' ? 'เข้าสู่ระบบสำหรับทางร้าน' : 'Staff Login'}
            >
              <LogIn className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">{language === 'th' ? 'เข้าสู่ระบบร้าน' : 'Staff Login'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200/90 pl-2 pr-1 py-1 rounded-2xl h-9">
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">
                {user.email ? user.email.slice(0, 1).toUpperCase() : 'S'}
              </div>
              <span className="text-[11px] font-bold text-stone-700 max-w-[100px] truncate hidden md:inline">
                {user.email || 'Staff'}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="p-1 rounded-xl hover:bg-stone-200 text-stone-400 hover:text-red-600 transition cursor-pointer"
                title={language === 'th' ? 'ออกจากระบบ' : 'Log Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
