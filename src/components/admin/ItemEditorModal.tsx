import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Flame, Upload, Image as ImageIcon, ChevronDown, Check, Link2, Utensils } from 'lucide-react';
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

  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setShowUrlInput(!!item.imageUrl && !item.imageUrl.startsWith('data:'));
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
      setShowUrlInput(false);
    }
  }, [item, categories, isOpen]);

  // Lock body scroll when modal is open
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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Full-Screen Dark Overlay Covering 100% of Viewport */}
      <div 
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-stone-200/80 z-10">
        
        {/* 1. Fixed Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base sm:text-lg">
                {item
                  ? (language === 'th' ? 'แก้ไขเมนูอาหาร' : 'Edit Menu Item')
                  : (language === 'th' ? 'เพิ่มเมนูอาหารใหม่' : 'Add New Menu Item')}
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                {language === 'th' ? 'กรอกรายละเอียดและอัปโหลดรูปภาพเมนู' : 'Fill in the menu details and upload a photo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
            title={t('close', language)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <form id="item-editor-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-xs sm:text-sm">
          
          {/* SECTION 1: PHOTO UPLOAD CARD */}
          <div className="bg-stone-50/90 rounded-3xl p-4 sm:p-5 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <span>{t('adminImageUrl', language)} *</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{showUrlInput ? (language === 'th' ? 'ซ่อนลิงก์ URL' : 'Hide URL input') : (language === 'th' ? 'ใส่ลิงก์รูปภาพ (URL)' : 'Paste Image URL')}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Photo Preview Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white overflow-hidden border-2 border-dashed border-stone-300 hover:border-orange-500 cursor-pointer flex-shrink-0 flex items-center justify-center relative group transition shadow-xs"
                title={language === 'th' ? 'คลิกเพื่อเลือกไฟล์รูปภาพ' : 'Click to choose image'}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                    <ImageIcon className="w-6 h-6 mb-1 text-stone-300" />
                    <span className="text-[11px] font-bold">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-white text-center p-2">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">{language === 'th' ? 'เปลี่ยนรูป' : 'Change'}</span>
                </div>
              </div>

              {/* Upload Actions */}
              <div className="flex-1 space-y-2.5 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-white hover:bg-orange-50 text-stone-800 hover:text-orange-700 border border-stone-200 hover:border-orange-300 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span>{t('adminUploadImage', language)}</span>
                </button>
                <p className="text-[11px] text-stone-400 font-medium text-center sm:text-left">
                  {t('adminUploadHint', language)}
                </p>

                {showUrlInput && (
                  <div className="pt-1 animate-in fade-in">
                    <input
                      type="url"
                      value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-orange-500 text-xs font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: BASIC INFO (NAMES, CATEGORY, PRICE) */}
          <div className="space-y-4">
            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-stone-800 mb-1.5 text-xs">
                  {t('adminItemNameTh', language)} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น อเมริกาโน่เย็น"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="block font-black text-stone-800 mb-1.5 text-xs">
                  {t('adminItemNameEn', language)}
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Craft Iced Americano"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-stone-900"
                />
              </div>
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-stone-800 mb-1.5 text-xs">
                  {t('adminCategory', language)} *
                </label>
                <div className="relative">
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:border-orange-500 font-bold text-stone-900 appearance-none cursor-pointer pr-10 shadow-2xs"
                  >
                    {categories
                      .filter((c) => c.id !== 'popular')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {language === 'en' ? (c.nameEn || c.name) : c.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-black text-stone-800 mb-1.5 text-xs">
                  {t('adminPrice', language)} (฿) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-orange-500 text-sm">
                    ฿
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-black text-stone-900 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: DESCRIPTIONS */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="block font-black text-stone-800 mb-1.5 text-xs">
                {t('adminDescTh', language)}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="รายละเอียดรสชาติ วัตถุดิบ ความพิเศษของเมนู..."
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none text-xs leading-relaxed"
              />
            </div>
            <div>
              <label className="block font-black text-stone-800 mb-1.5 text-xs">
                {t('adminDescEn', language)}
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={2}
                placeholder="Flavor profile, tasting notes, ingredients..."
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 4: HIGHLIGHT BADGES (SELECTABLE CARDS) */}
          <div className="pt-2">
            <label className="block font-black text-stone-800 mb-2.5 text-xs">
              {t('adminHighlightBadges', language)}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chef Recommend Card */}
              <div
                onClick={() => setFormData({ ...formData, isChefRecommend: !formData.isChefRecommend })}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  formData.isChefRecommend
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-2xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.isChefRecommend ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm">
                      {t('adminIsChef', language)}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-medium">Chef's Pick Badge</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.isChefRecommend ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-300 bg-white'}`}>
                  {formData.isChefRecommend && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Popular Item Card */}
              <div
                onClick={() => setFormData({ ...formData, isPopular: !formData.isPopular })}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  formData.isPopular
                    ? 'border-red-500 bg-red-50/70 text-red-950 shadow-2xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.isPopular ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm">
                      {t('adminIsPopular', language)}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-medium">Best Seller Badge</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.isPopular ? 'border-red-500 bg-red-500 text-white' : 'border-stone-300 bg-white'}`}>
                  {formData.isPopular && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* 3. Fixed Footer Action Bar (Separated from form scroll, never overlapping) */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-200 text-stone-700 font-black transition text-xs sm:text-sm cursor-pointer"
          >
            {t('cancel', language)}
          </button>
          <button
            type="submit"
            form="item-editor-form"
            className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black shadow-lg shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer flex items-center gap-2"
          >
            <span>{t('save', language)}</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
