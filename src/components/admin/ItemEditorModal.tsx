import React, { useState, useEffect } from 'react';
import { X, Sparkles, Flame, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { MenuItem, MenuCategory, Language } from '../../types';
import { t } from '../../utils/i18n';

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  categories: MenuCategory[];
  language: Language;
  onSave: (item: MenuItem) => void;
}

const photoPresets = [
  { label: "Espresso / Coffee", url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80" },
  { label: "Dirty Coffee / Latte", url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80" },
  { label: "Matcha Latte", url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80" },
  { label: "Thai Milk Tea", url: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80" },
  { label: "Sparkling Drink", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80" },
  { label: "Pasta Carbonara", url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80" },
  { label: "Thai Basil Rice", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80" },
  { label: "Croissant / Pastry", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80" },
  { label: "Cheesecake / Dessert", url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80" },
  { label: "Fries / Snacks", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80" },
];

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  onClose,
  item,
  categories,
  language,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    nameEn: '',
    categoryId: categories[0]?.id || 'coffee',
    price: 80,
    imageUrl: photoPresets[0].url,
    description: '',
    descriptionEn: '',
    isAvailable: true,
    isChefRecommend: false,
    isPopular: false,
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        name: '',
        nameEn: '',
        categoryId: categories.find((c) => c.id !== 'popular')?.id || 'coffee',
        price: 80,
        imageUrl: photoPresets[0].url,
        description: '',
        descriptionEn: '',
        isAvailable: true,
        isChefRecommend: false,
        isPopular: false,
      });
    }
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const finalItem: MenuItem = {
      id: formData.id || `item-${Date.now()}`,
      categoryId: formData.categoryId || 'coffee',
      name: formData.name || '',
      nameEn: formData.nameEn || '',
      price: Number(formData.price),
      imageUrl: formData.imageUrl || photoPresets[0].url,
      description: formData.description || '',
      descriptionEn: formData.descriptionEn || '',
      isAvailable: formData.isAvailable ?? true,
      isChefRecommend: formData.isChefRecommend ?? false,
      isPopular: formData.isPopular ?? false,
      optionGroups: formData.optionGroups || item?.optionGroups,
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <h3 className="font-extrabold text-base">
            {item ? (language === 'th' ? 'แก้ไขเมนูอาหาร' : 'Edit Menu Item') : (language === 'th' ? 'เพิ่มเมนูอาหารใหม่' : 'Add New Menu Item')}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Image Preview & URL */}
          <div className="space-y-2">
            <label className="block font-bold text-stone-800">
              {t('adminImageUrl', language)}
            </label>
            <div className="flex gap-3 items-center">
              <div className="w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = photoPresets[0].url;
                  }}
                />
              </div>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                required
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 block mb-1">
                {t('adminQuickImages', language)}
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {photoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                    className="flex-shrink-0 px-2 py-1 bg-stone-100 hover:bg-orange-100 hover:text-orange-900 rounded-lg text-[11px] font-medium transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminItemNameTh', language)} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น อเมริกาโน่เย็น"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminItemNameEn', language)}
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Iced Americano"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminCategory', language)} *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-orange-500 font-bold"
              >
                {categories
                  .filter((c) => c.id !== 'popular')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'en' ? c.nameEn : c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminPrice', language)} *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-orange-600"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminDescTh', language)}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="รายละเอียดรสชาติ วัตถุดิบ..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminDescEn', language)}
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={2}
                placeholder="Flavor profile, ingredients..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Badges & Highlights */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block font-bold text-stone-800 mb-2">
              {t('adminHighlightBadges', language)}
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isChefRecommend}
                  onChange={(e) => setFormData({ ...formData, isChefRecommend: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {t('adminIsChef', language)}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> {t('adminIsPopular', language)}
                </span>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold transition text-xs sm:text-sm"
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold shadow-md shadow-orange-500/25 transition text-xs sm:text-sm"
            >
              {t('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
