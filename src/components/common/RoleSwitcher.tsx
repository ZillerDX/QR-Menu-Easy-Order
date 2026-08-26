import React from 'react';
import { Smartphone, UtensilsCrossed, QrCode } from 'lucide-react';

interface RoleSwitcherProps {
  activeRole: 'customer' | 'kitchen' | 'qr';
  onSelectRole: (role: 'customer' | 'kitchen' | 'qr') => void;
  pendingOrdersCount?: number;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  activeRole,
  onSelectRole,
  pendingOrdersCount = 0,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw]">
      <div className="bg-gray-900/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-gray-700/60 flex items-center gap-1">
        <button
          onClick={() => onSelectRole('customer')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
            activeRole === 'customer'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>ลูกค้าสั่งอาหาร</span>
        </button>

        <button
          onClick={() => onSelectRole('kitchen')}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
            activeRole === 'kitchen'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>จอห้องครัว (KDS)</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectRole('qr')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
            activeRole === 'qr'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR โต๊ะ</span>
        </button>
      </div>
    </div>
  );
};
