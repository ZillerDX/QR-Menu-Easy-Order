import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag, Check, Search, Sparkles } from 'lucide-react';
import { MenuCategory, Language } from '../../types';
import { t } from '../../utils/i18n';
import { 
  CATEGORY_ICONS_LIST, 
  CategoryIconGroup, 
  getCategoryIconDefinition, 
  renderCategoryIcon 
} from '../../utils/categoryIcons';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MenuCategory | null;
  language: Language;
  onSave: (category: MenuCategory) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  language,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<MenuCategory>>({
    name: '',
    nameEn: '',
    icon: 'Coffee',
  });
  const [selectedGroup, setSelectedGroup] = useState<CategoryIconGroup>('all');
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        id: `cat-${Date.now()}`,
        name: '',
        nameEn: '',
        icon: 'Coffee',
      });
    }
    setSelectedGroup('all');
    setIconSearch('');
  }, [category, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const finalCategory: MenuCategory = {
      id: formData.id || `cat-${Date.now()}`,
      name: formData.name || '',
      nameEn: formData.nameEn || formData.name || '',
      icon: formData.icon || 'Coffee',
    };

    onSave(finalCategory);
    onClose();
  };

  const filteredIcons = CATEGORY_ICONS_LIST.filter((item) => {
    const matchesGroup = selectedGroup === 'all' || item.group === selectedGroup;
    const matchesSearch = 
      !iconSearch.trim() ||
      item.name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      item.labelTh.toLowerCase().includes(iconSearch.toLowerCase()) ||
      item.labelEn.toLowerCase().includes(iconSearch.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const selectedIconDef = getCategoryIconDefinition(formData.icon);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Full-Screen Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/80 z-10 flex flex-col max-h-[92vh]">
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base sm:text-lg">
                {category
                  ? (language === 'th' ? 'แก้ไขหมวดหมู่' : 'Edit Category')
                  : (language === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add New Category')}
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                {language === 'th' ? 'ตั้งชื่อและเลือกไอคอนประจำหมวดหมู่' : 'Set category name and choose a matching icon'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer active:scale-95"
            title={t('close', language)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <form id="category-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1 min-h-0">
          
          {/* Live Preview Card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3 shadow-2xs">
            <div className={`w-12 h-12 rounded-2xl ${selectedIconDef.bgLight} ${selectedIconDef.borderLight} border flex items-center justify-center shadow-xs flex-shrink-0`}>
              {renderCategoryIcon(formData.icon, 'w-6 h-6')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                  {language === 'th' ? 'ตัวอย่างการแสดงผล' : 'Preview Card'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.2 rounded-md ${selectedIconDef.bgLight} ${selectedIconDef.color}`}>
                  {language === 'th' ? selectedIconDef.labelTh : selectedIconDef.labelEn}
                </span>
              </div>
              <h4 className="font-black text-stone-900 text-sm truncate">
                {formData.name || (language === 'th' ? 'ชื่อหมวดหมู่' : 'Category Name')}
              </h4>
              {formData.nameEn && (
                <p className="text-xs text-stone-400 font-medium truncate">{formData.nameEn}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-stone-800 mb-1 text-xs">
                {t('adminCategoryNameTh', language)} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'th' ? 'เช่น กาแฟคราฟต์, ข้าวและจานหลัก' : 'e.g. Craft Coffee'}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-stone-900 shadow-2xs transition-all text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-black text-stone-800 mb-1 text-xs">
                {t('adminCategoryNameEn', language)}
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder={language === 'th' ? 'เช่น Craft Coffee, Main Dishes' : 'e.g. Craft Coffee'}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-stone-900 shadow-2xs transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Icon Selection Section */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="block font-black text-stone-800 text-xs">
                {language === 'th' ? 'เลือกไอคอนหมวดหมู่ (Category Icon)' : 'Select Category Icon'}
              </label>
              <span className="text-[11px] text-stone-400 font-bold">
                {filteredIcons.length} {language === 'th' ? 'ไอคอน' : 'icons'}
              </span>
            </div>

            {/* Filter Group Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              {/* Category Icon Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {(
                  [
                    { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All' },
                    { id: 'drink', labelTh: 'เครื่องดื่ม', labelEn: 'Drinks' },
                    { id: 'food', labelTh: 'อาหาร', labelEn: 'Food' },
                    { id: 'dessert', labelTh: 'ขนม/เค้ก', labelEn: 'Desserts' },
                    { id: 'special', labelTh: 'พิเศษ', labelEn: 'Special' },
                  ] as { id: CategoryIconGroup; labelTh: string; labelEn: string }[]
                ).map((grp) => (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSelectedGroup(grp.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition cursor-pointer whitespace-nowrap ${
                      selectedGroup === grp.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {language === 'th' ? grp.labelTh : grp.labelEn}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[140px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder={language === 'th' ? 'ค้นหาไอคอน...' : 'Search icon...'}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            {/* Icon Palette Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
              {filteredIcons.map((item) => {
                const IconComponent = item.icon;
                const isSelected = (formData.icon || 'Coffee').toLowerCase() === item.id.toLowerCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.id })}
                    className={`p-2 sm:p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 text-center ${
                      isSelected
                        ? `border-orange-500 ${item.bgLight} ${item.color} shadow-sm font-black ring-2 ring-orange-500/20 scale-[1.03]`
                        : 'border-stone-200/80 bg-white hover:bg-stone-100 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${isSelected ? item.color : 'text-stone-700'}`} />
                    <span className="text-[10px] leading-tight font-bold truncate max-w-full">
                      {language === 'th' ? item.labelTh : item.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* 3. Fixed Footer Action Bar */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-200/70 text-stone-700 font-black transition text-xs sm:text-sm cursor-pointer active:scale-95"
          >
            {t('cancel', language)}
          </button>
          <button
            type="submit"
            form="category-form"
            className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black shadow-lg shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('save', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
