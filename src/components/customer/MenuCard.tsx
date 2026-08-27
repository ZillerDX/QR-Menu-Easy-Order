import React from 'react';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { MenuItem, Language } from '../../types';
import { t } from '../../utils/i18n';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  language: Language;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect, language }) => {
  return (
    <div
      onClick={() => item.isAvailable && onSelect(item)}
      className={`group relative bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/80 shadow-xs transition-all duration-300 flex flex-col justify-between ${
        item.isAvailable
          ? 'hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 hover:-translate-y-1 cursor-pointer active:scale-[0.98]'
          : 'opacity-60 cursor-not-allowed bg-stone-50'
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-stone-100 shadow-2xs">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
              <span className="bg-red-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                {t('soldOut', language)}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {item.isChefRecommend && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap">
                <Sparkles className="w-3 h-3 animate-pulse" /> {t('chefPick', language)}
              </span>
            )}
            {item.isPopular && !item.isChefRecommend && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap">
                <Flame className="w-3 h-3 animate-pulse" /> {t('popular', language)}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
            {language === 'en' ? (item.nameEn || item.name) : item.name}
          </h3>
          {language === 'th' && item.nameEn && (
            <p className="text-[11px] text-stone-400 font-medium line-clamp-1">
              {item.nameEn}
            </p>
          )}
          <p className="text-xs text-stone-500 line-clamp-2 pt-0.5 leading-relaxed font-normal">
            {language === 'en' ? (item.descriptionEn || item.description) : item.description}
          </p>
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-400 font-medium">฿</span>
          <span className="text-base font-black text-stone-900 ml-0.5">
            {item.price.toLocaleString()}
          </span>
        </div>

        {item.isAvailable && (
          <button
            type="button"
            className="w-8 h-8 rounded-2xl bg-orange-100 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs font-bold group-hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
};
