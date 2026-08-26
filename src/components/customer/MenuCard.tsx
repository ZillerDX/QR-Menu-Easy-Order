import React from 'react';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  return (
    <div
      onClick={() => item.isAvailable && onSelect(item)}
      className={`group relative bg-white rounded-2xl p-3 border border-gray-100 shadow-sm transition-all duration-200 flex flex-col justify-between ${
        item.isAvailable
          ? 'hover:shadow-md hover:border-orange-200 cursor-pointer active:scale-[0.98]'
          : 'opacity-60 cursor-not-allowed bg-gray-50'
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                สินค้าหมด (Sold Out)
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.isChefRecommend && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3" /> แนะนำ
              </span>
            )}
            {item.isPopular && !item.isChefRecommend && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Flame className="w-3 h-3" /> ยอดฮิต
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>
          {item.nameEn && (
            <p className="text-[11px] text-gray-400 font-normal line-clamp-1">
              {item.nameEn}
            </p>
          )}
          <p className="text-xs text-gray-500 line-clamp-2 pt-0.5 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 font-medium">฿</span>
          <span className="text-base font-extrabold text-gray-900 ml-0.5">
            {item.price.toLocaleString()}
          </span>
        </div>

        {item.isAvailable && (
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-orange-100 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
