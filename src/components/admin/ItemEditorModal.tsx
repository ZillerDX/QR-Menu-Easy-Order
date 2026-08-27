import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Flame, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
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

const defaultPlaceholderImage = "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80";

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
    imageUrl: defaultPlaceholderImage,
    description: '',
    descriptionEn: '',
    isAvailable: true,
    isChefRecommend: false,
    isPopular: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        imageUrl: defaultPlaceholderImage,
        description: '',
        descriptionEn: '',
        isAvailable: true,
        isChefRecommend: false,
        isPopular: false,
      });
    }
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) return;

    const finalItem: MenuItem = {
      id: formData.id || `item-${Date.now()}`,
      categoryId: formData.categoryId || 'coffee',
      name: formData.name || '',
      nameEn: formData.nameEn || '',
      price: Number(formData.price),
      imageUrl: formData.imageUrl || defaultPlaceholderImage,
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Direct Image File Upload & Preview */}
          <div className="space-y-2">
            <label className="block font-black text-stone-800">
              {t('adminImageUrl', language)} *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="flex flex-col sm:flex-row gap-3.5 items-center">
              {/* Image Preview Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-100 overflow-hidden border-2 border-dashed border-stone-300 hover:border-orange-500 cursor-pointer flex-shrink-0 flex items-center justify-center relative group transition"
                title="Click to upload image"
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                  <Upload className="w-5 h-5" />
                </div>
              </div>

              {/* Upload Button & Optional URL input */}
              <div className="flex-1 space-y-2 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>{t('adminUploadImage', language)}</span>
                </button>

                <div className="space-y-1">
                  <span className="text-[11px] text-stone-400 font-medium block">
                    {t('adminOrUrl', language)}
                  </span>
                  <input
                    type="url"
                    value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>

          {/* Category & Price (Removed THB) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminCategory', language)} *
              </label>
              <div className="relative">
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-orange-500 font-bold appearance-none cursor-pointer pr-8"
                >
                  {categories
                    .filter((c) => c.id !== 'popular')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'en' ? (c.nameEn || c.name) : c.name}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                {t('adminPrice', language)} (฿) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-black text-orange-600"
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
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 resize-none text-xs"
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
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 resize-none text-xs"
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
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold transition text-xs sm:text-sm cursor-pointer"
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black shadow-md shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer"
            >
              {t('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
