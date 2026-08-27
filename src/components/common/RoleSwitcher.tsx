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
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[98vw] px-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="bg-stone-950/90 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-stone-800/80 flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar ring-1 ring-white/10">
        {/* Role 1: Customer */}
        <button
          onClick={() => onSelectRole('customer')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
            activeRole === 'customer'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 ring-1 ring-orange-400/50'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleCustomer', language)}</span>
        </button>

        {/* Role 2: Kitchen KDS */}
        <button
          onClick={() => onSelectRole('kitchen')}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
            activeRole === 'kitchen'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-emerald-400/50'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleKitchen', language)}</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-0.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-heartbeat shadow-xs">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Role 3: Menu Admin */}
        <button
          onClick={() => onSelectRole('admin')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
            activeRole === 'admin'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-400/50'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleAdmin', language)}</span>
        </button>

        {/* Role 4: Store Settings */}
        <button
          onClick={() => onSelectRole('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
            activeRole === 'settings'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleSettings', language)}</span>
        </button>

        {/* Role 5: Table QR */}
        <button
          onClick={() => onSelectRole('qr')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
            activeRole === 'qr'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400/50'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{t('roleQR', language)}</span>
        </button>
      </div>
    </div>
  );
};
