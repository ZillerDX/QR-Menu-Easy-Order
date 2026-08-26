import React from 'react';
import { MenuItem } from '../../types';
import { Check, X } from 'lucide-react';

interface StockManagerProps {
  menuItems: MenuItem[];
  onToggleStock: (itemId: string) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  menuItems,
  onToggleStock,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">จัดการสต็อกเมนูอาหาร (Stock Manager)</h3>
          <p className="text-xs text-gray-500">คลิกสวิตช์เพื่อเปิด/ปิดเมนูหมดแบบ Real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleStock(item.id)}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              item.isAvailable
                ? 'border-gray-200 bg-white hover:border-orange-300'
                : 'border-red-200 bg-red-50/50 opacity-80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-gray-500">฿{item.price}</p>
              </div>
            </div>

            <button
              type="button"
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition ${
                item.isAvailable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-500 text-white'
              }`}
            >
              {item.isAvailable ? (
                <>
                  <Check className="w-3 h-3" /> มีขาย
                </>
              ) : (
                <>
                  <X className="w-3 h-3" /> หมด
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
