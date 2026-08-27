import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Coffee, Utensils, Check, X, Layers, Sparkles, Flame, Tag, ChevronDown } from 'lucide-react';
import { MenuItem, MenuCategory, Language } from '../../types';
import { t } from '../../utils/i18n';
import { ItemEditorModal } from './ItemEditorModal';
import { CategoryModal } from './CategoryModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface MenuAdminProps {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  language: Language;
  onSaveMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onToggleStock: (itemId: string) => void;
  onSaveCategory: (category: MenuCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const MenuAdmin: React.FC<MenuAdminProps> = ({
  menuItems,
  categories,
  language,
  onSaveMenuItem,
  onDeleteMenuItem,
  onToggleStock,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'item' | 'category';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'item',
    id: '',
    name: '',
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (selectedCatFilter === 'all') return true;
    return item.categoryId === selectedCatFilter;
  });

  const handleAddNewItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItemClick = (item: MenuItem) => {
    setConfirmDelete({
      isOpen: true,
      type: 'item',
      id: item.id,
      name: language === 'en' && item.nameEn ? item.nameEn : item.name,
    });
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategoryClick = (cat: MenuCategory) => {
    if (cat.id === 'popular') return;
    setConfirmDelete({
      isOpen: true,
      type: 'category',
      id: cat.id,
      name: language === 'en' ? (cat.nameEn || cat.name) : cat.name,
    });
  };

  const handleExecuteDelete = () => {
    if (confirmDelete.type === 'item') {
      onDeleteMenuItem(confirmDelete.id);
    } else if (confirmDelete.type === 'category') {
      onDeleteCategory(confirmDelete.id);
    }
    setConfirmDelete({ isOpen: false, type: 'item', id: '', name: '' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-500 flex-shrink-0" />
            {t('adminTitle', language)}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('adminSubtitle', language)}
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {activeTab === 'items' ? (
            <button
              onClick={handleAddNewItem}
              className="w-full md:w-auto py-3 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('adminAddNewItem', language)}</span>
            </button>
          ) : (
            <button
              onClick={handleAddNewCategory}
              className="w-full md:w-auto py-3 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('adminAddNewCategory', language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'items'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>{t('adminTabMenus', language)}</span>
          <span className="ml-1 bg-stone-700/60 px-1.5 py-0.2 rounded-full text-[11px] text-white font-bold">
            {menuItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t('adminTabCategories', language)}</span>
          <span className="ml-1 bg-stone-700/60 px-1.5 py-0.2 rounded-full text-[11px] text-white font-bold">
            {categories.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MENU ITEMS LIST */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filter & Search Bar with Modern Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder', language)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 shadow-2xs font-medium"
              />
            </div>

            {/* Modern Category Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm font-black text-stone-800 focus:outline-none focus:border-orange-500 shadow-2xs appearance-none cursor-pointer pr-9"
              >
                <option value="all">{language === 'th' ? 'ทุกหมวดหมู่ (All)' : 'All Categories'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {language === 'en' ? (c.nameEn || c.name) : c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredItems.map((item) => {
              const categoryName = categories.find((c) => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-orange-200 transition"
                >
                  <div className="flex gap-3.5">
                    {/* Item Image */}
                    <div className="relative w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-white text-center p-1">
                          {t('soldOut', language)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 whitespace-nowrap">
                          {categoryName ? (language === 'en' ? (categoryName.nameEn || categoryName.name) : categoryName.name) : item.categoryId}
                        </span>
                        {item.isChefRecommend && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {item.isPopular && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-0.5 whitespace-nowrap">
                            <Flame className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-stone-900 text-sm truncate">
                        {language === 'en' && item.nameEn ? item.nameEn : item.name}
                      </h4>
                      {item.nameEn && language === 'th' && (
                        <p className="text-[11px] text-stone-400 font-medium truncate">{item.nameEn}</p>
                      )}
                      <p className="text-sm font-black text-orange-600 pt-0.5">
                        ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                    {/* Stock Switch */}
                    <button
                      onClick={() => onToggleStock(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition whitespace-nowrap cursor-pointer shadow-2xs ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('inStock', language)}</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-red-600" />
                          <span>{t('soldOut', language)}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1 transition cursor-pointer"
                        title={t('edit', language)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('edit', language)}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteItemClick(item)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition cursor-pointer"
                        title={t('delete', language)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES LIST */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            const isProtected = cat.id === 'popular';

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-black">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 text-sm">
                      {language === 'en' ? (cat.nameEn || cat.name) : cat.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-bold">
                      {count} {t('adminItemCount', language)}
                    </p>
                  </div>
                </div>

                {!isProtected && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                      title={t('edit', language)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoryClick(cat)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                      title={t('delete', language)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ItemEditorModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        item={editingItem}
        categories={categories}
        language={language}
        onSave={onSaveMenuItem}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
        language={language}
        onSave={onSaveCategory}
      />

      {/* Beautiful Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={language === 'th' ? (confirmDelete.type === 'item' ? 'ลบรายการเมนู' : 'ลบหมวดหมู่อาหาร') : (confirmDelete.type === 'item' ? 'Delete Menu Item' : 'Delete Category')}
        message={
          language === 'th'
            ? `คุณแน่ใจหรือไม่ว่าต้องการลบ "${confirmDelete.name}" ออกจากระบบ? การดำเนินการนี้ไม่สามารถยกเลิกได้`
            : `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`
        }
        confirmText={language === 'th' ? 'ลบรายการ' : 'Delete'}
        cancelText={t('cancel', language)}
        isDestructive={true}
        icon="trash"
        onConfirm={handleExecuteDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, type: 'item', id: '', name: '' })}
      />
    </div>
  );
};
