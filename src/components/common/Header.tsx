import React, { useState } from 'react';
import { ShoppingBag, Store, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';
import { AppRole } from './RoleSwitcher';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  storeConfig: StoreConfig;
  tableNumber: string;
  cartCount: number;
  onOpenCart: () => void;
  activeRole: AppRole;
  language: Language;
  onToggleLanguage: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isCustomerView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  storeConfig,
  tableNumber,
  cartCount,
  onOpenCart,
  activeRole,
  language,
  onToggleLanguage,
  user,
  onOpenAuth,
  onLogout,
  isCustomerView = true,
}) => {
  const [logoClickCount, setLogoClickCount] = useState(0);

  const getTableDisplayLabel = (table: string) => {
    if (table === 'TAKEAWAY') {
      return language === 'th' ? 'กลับบ้าน' : 'Takeaway';
    }
    return `${language === 'th' ? 'โต๊ะ' : 'Table'} ${table}`;
  };

  // Staff Secret Login Trigger: Click logo 3 times to open auth modal if not logged in
  const handleLogoClick = () => {
    if (!user) {
      const nextCount = logoClickCount + 1;
      if (nextCount >= 3) {
        setLogoClickCount(0);
        onOpenAuth();
      } else {
        setLogoClickCount(nextCount);
        setTimeout(() => setLogoClickCount(0), 2000);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          title={!user ? "Cafe Order" : "Staff Portal"}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-xs border border-orange-200/80 p-0.5 bg-gradient-to-tr from-amber-500 to-orange-500 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <img
              src={storeConfig.logoUrl}
              alt={storeConfig.name}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-stone-900 text-sm sm:text-base leading-tight tracking-tight group-hover:text-orange-600 transition-colors">
                {language === 'en' ? (storeConfig.nameEn || storeConfig.name) : storeConfig.name}
              </h1>
              {!isCustomerView && (
                <span className="text-[10px] font-black bg-stone-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline">
                  POS Portal
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium leading-none mt-0.5 hidden sm:block">
              {language === 'en' ? (storeConfig.taglineEn || storeConfig.tagline) : storeConfig.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Dual Language Switcher Toggle */}
          <div
            onClick={onToggleLanguage}
            className="relative bg-stone-100/90 hover:bg-stone-200/90 border border-stone-200 p-0.5 rounded-2xl flex items-center cursor-pointer transition-all shadow-2xs select-none h-9 flex-shrink-0"
            title="Switch Language"
          >
            <div
              className={`absolute top-0.5 bottom-0.5 w-[28px] sm:w-[32px] bg-orange-500 rounded-[13px] shadow-xs transition-all duration-200 ease-out ${
                language === 'th' ? 'left-0.5' : 'left-[29px] sm:left-[33px]'
              }`}
            />
            {/* TH Option */}
            <span
              className={`relative z-10 w-[28px] sm:w-[32px] text-center text-xs font-black transition-colors duration-150 ${
                language === 'th' ? 'text-white' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              TH
            </span>
            {/* EN Option */}
            <span
              className={`relative z-10 w-[28px] sm:w-[32px] text-center text-xs font-black transition-colors duration-150 ${
                language === 'en' ? 'text-white' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              EN
            </span>
          </div>

          {/* CUSTOMER SPECIFIC VIEW: ONLY Table Badge and Cart (NO LOGIN / LOGOUT BUTTONS) */}
          {isCustomerView && (
            <>
              {/* Fixed Table Badge (Customer Dining Location) */}
              <div 
                className="flex items-center gap-1 px-2.5 sm:px-3 bg-orange-50/90 border border-orange-200/90 text-orange-950 text-xs font-black rounded-2xl shadow-2xs h-9 flex-shrink-0"
                title="Your Table"
              >
                <Store className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                <span className="truncate">{getTableDisplayLabel(tableNumber)}</span>
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer h-9 px-2.5 sm:px-3.5 hover:shadow-lg hover:shadow-orange-500/35 flex-shrink-0"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-heartbeat shadow-xs">
                    {cartCount}
                  </span>
                )}
                <span className="hidden md:inline text-xs font-black pr-0.5">
                  {t('cart', language)}
                </span>
              </button>
            </>
          )}

          {/* STAFF LOGGED IN ROLE BADGES & LOGOUT */}
          {user && (
            <>
              {activeRole === 'kitchen' && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Kitchen KDS
                </div>
              )}

              {activeRole === 'admin' && (
                <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
                  Admin Mode
                </div>
              )}

              {activeRole === 'settings' && (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
                  Settings
                </div>
              )}

              {activeRole === 'qr' && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xs whitespace-nowrap h-9">
                  Table QR
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200/90 pl-2 pr-1 py-1 rounded-2xl h-9 flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">
                  {user.email ? user.email.slice(0, 1).toUpperCase() : 'S'}
                </div>
                <span className="text-[11px] font-bold text-stone-700 max-w-[90px] truncate hidden md:inline">
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};
