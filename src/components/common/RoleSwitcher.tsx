import React from 'react';
import { Smartphone, UtensilsCrossed, QrCode, Layers, Settings } from 'lucide-react';
import { Language } from '../../types';
import { t } from '../../utils/i18n';

export type AppRole = 'customer' | 'kitchen' | 'admin' | 'settings' | 'qr';

interface RoleSwitcherProps {
  activeRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  language: Language;
  pendingOrdersCount?: number;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  activeRole,
  onSelectRole,
  language,
  pendingOrdersCount = 0,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[98vw] px-2">
      <div className="bg-stone-900/95 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-stone-700/60 flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar">
        {/* Role 1: Customer */}
        <button
          onClick={() => onSelectRole('customer')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeRole === 'customer'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleCustomer', language)}</span>
        </button>

        {/* Role 2: Kitchen KDS */}
        <button
          onClick={() => onSelectRole('kitchen')}
          className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeRole === 'kitchen'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleKitchen', language)}</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-0.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Role 3: Menu Admin */}
        <button
          onClick={() => onSelectRole('admin')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeRole === 'admin'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleAdmin', language)}</span>
        </button>

        {/* Role 4: Store Settings */}
        <button
          onClick={() => onSelectRole('settings')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeRole === 'settings'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
          }`}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleSettings', language)}</span>
        </button>

        {/* Role 5: Table QR */}
        <button
          onClick={() => onSelectRole('qr')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeRole === 'qr'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleQR', language)}</span>
        </button>
      </div>
    </div>
  );
};
