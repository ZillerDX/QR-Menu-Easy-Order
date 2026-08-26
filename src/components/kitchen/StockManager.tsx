import React from 'react';
import { MenuItem, Language } from '../../types';
import { Check, X } from 'lucide-react';
import { t } from '../../utils/i18n';

interface StockManagerProps {
  menuItems: MenuItem[];
  language: Language;
  onToggleStock: (itemId: string) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  menuItems,
  language,
  onToggleStock,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
            {t('kdsStockTitle', language)}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('kdsStockSubtitle', language)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleStock(item.id)}
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
              item.isAvailable
                ? 'border-stone-200 bg-white hover:border-orange-300 hover:shadow-2xs'
                : 'border-red-200 bg-red-50/40 opacity-85'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-stone-100"
              />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                  {language === 'en' && item.nameEn ? item.nameEn : item.name}
                </h4>
                <p className="text-xs font-bold text-orange-600">฿{item.price.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition whitespace-nowrap flex-shrink-0 min-w-[80px] shadow-2xs ${
                item.isAvailable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-500 text-white'
              }`}
            >
              {item.isAvailable ? (
                <>
                  <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-700" />
                  <span>{t('inStock', language)}</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{t('soldOut', language)}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
