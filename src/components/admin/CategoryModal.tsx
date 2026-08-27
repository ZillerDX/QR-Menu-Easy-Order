import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Coffee, Sparkles, CupSoda, Utensils, Cake, Pizza, Heart, Tag } from 'lucide-react';
import { MenuCategory, Language } from '../../types';
import { t } from '../../utils/i18n';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MenuCategory | null;
  language: Language;
  onSave: (category: MenuCategory) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Coffee', icon: Coffee, label: 'Coffee' },
  { name: 'CupSoda', icon: CupSoda, label: 'Drink' },
  { name: 'Utensils', icon: Utensils, label: 'Food' },
  { name: 'Cake', icon: Cake, label: 'Bakery' },
  { name: 'Pizza', icon: Pizza, label: 'Snack' },
  { name: 'Sparkles', icon: Sparkles, label: 'Special' },
  { name: 'Heart', icon: Heart, label: 'Healthy' },
];

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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/80 z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base">
                {category
                  ? (language === 'th' ? 'แก้ไขหมวดหมู่' : 'Edit Category')
                  : (language === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add New Category')}
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                {language === 'th' ? 'จัดหมวดหมู่ให้ลูกค้าค้นหาง่ายขึ้น' : 'Organize items for easier browsing'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-black text-stone-800 mb-1.5 text-xs">
              {t('adminCategoryNameTh', language)} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ชาและเครื่องดื่ม"
              required
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-stone-900"
            />
          </div>

          <div>
            <label className="block font-black text-stone-800 mb-1.5 text-xs">
              {t('adminCategoryNameEn', language)}
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Tea & Beverages"
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-stone-900"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-black text-stone-800 mb-2 text-xs">
              {t('adminCategoryIcon', language)}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = formData.icon === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.name })}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/80 text-orange-600 shadow-2xs font-black'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[10px] truncate max-w-full font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-black transition text-xs sm:text-sm cursor-pointer"
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black shadow-lg shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer"
            >
              {t('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
