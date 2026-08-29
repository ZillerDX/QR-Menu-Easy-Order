import React, { useState } from 'react';
import { MenuItem, MenuCategory, Language } from '../../types';
import { Check, X, Sparkles, Search, Layers, PackageCheck, AlertCircle } from 'lucide-react';
import { t } from '../../utils/i18n';

interface StockManagerProps {
  menuItems: MenuItem[];
  categories?: MenuCategory[];
  language: Language;
  onToggleStock: (itemId: string) => void;
  onRestockAll?: () => void;
  onRestockCategory?: (categoryId: string) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  menuItems,
  categories = [],
  language,
  onToggleStock,
  onRestockAll,
  onRestockCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const soldOutItems = menuItems.filter((i) => !i.isAvailable);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return item.categoryId === selectedCategory;
  });

  const availableCategories = categories.filter((c) => c.id !== 'popular');
  const activeCategoryObj = availableCategories.find((c) => c.id === selectedCategory);

  const categorySoldOutCount = selectedCategory === 'all'
    ? soldOutItems.length
    : menuItems.filter((i) => i.categoryId === selectedCategory && !i.isAvailable).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-4 animate-in fade-in duration-200">
      {/* Header & Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-stone-900 text-base sm:text-lg flex items-center gap-2">
              <span>{t('kdsStockTitle', language)}</span>
              {soldOutItems.length > 0 ? (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                  {language === 'th' ? `หมด ${soldOutItems.length} รายการ` : `${soldOutItems.length} Sold out`}
                </span>
              ) : (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {language === 'th' ? 'มีสินค้าครบทุกรายการ' : 'All items in stock'}
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('kdsStockSubtitle', language)}
          </p>
        </div>

        {/* Bulk Restock Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Restock Category Button */}
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onRestockCategory?.(selectedCategory)}
              disabled={categorySoldOutCount === 0}
              className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
            >
              <PackageCheck className="w-4 h-4 text-amber-600" />
              <span>
                {language === 'th'
                  ? `รีสต๊อกหมวด ${activeCategoryObj?.name || ''}`
                  : `Restock ${activeCategoryObj?.nameEn || 'Category'}`}
              </span>
            </button>
          )}

          {/* Restock All Button */}
          <button
            type="button"
            onClick={() => onRestockAll?.()}
            disabled={soldOutItems.length === 0}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-orange-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'th' ? 'รีสต๊อกทั้งหมด' : 'Restock All Items'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Search Bar + Category Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'th' ? 'ค้นหาเมนูเพื่อเปิด/ปิดสต็อก...' : 'Search menu items...'}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200/90 rounded-2xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            {language === 'th' ? 'ทั้งหมด' : 'All'} ({menuItems.length})
          </button>

          {availableCategories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {language === 'en' && cat.nameEn ? cat.nameEn : cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-stone-400 text-xs font-bold">
          {language === 'th' ? 'ไม่พบเมนูที่ค้นหา' : 'No menu items found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-0.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleStock(item.id)}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                item.isAvailable
                  ? 'border-stone-200/90 bg-white hover:border-orange-300 hover:shadow-2xs'
                  : 'border-red-200 bg-red-50/50 opacity-90'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-stone-100 shadow-2xs"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate">
                    {language === 'en' && item.nameEn ? item.nameEn : item.name}
                  </h4>
                  <p className="text-xs font-black text-orange-600">฿{item.price.toLocaleString()}</p>
                </div>
              </div>

              <button
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition whitespace-nowrap flex-shrink-0 min-w-[84px] shadow-2xs ${
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
      )}
    </div>
  );
};
