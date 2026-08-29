import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Sparkles, Flame, Upload, Image as ImageIcon, ChevronDown, Check, Link2, 
  Utensils, Coffee, CupSoda, Cake, Pizza, Heart, Plus, Trash2, Sliders, Layers 
} from 'lucide-react';
import { MenuItem, MenuCategory, Language, OptionGroup, OptionChoice } from '../../types';
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

// Preset templates for quick addition of common option groups
const PRESET_TEMPLATES: { label: string; icon: string; group: () => OptionGroup }[] = [
  {
    label: 'ระดับความหวาน (Sweetness)',
    icon: '🍬',
    group: () => ({
      id: `opt-sweet-${Date.now()}`,
      name: 'ระดับความหวาน',
      nameEn: 'Sweetness Level',
      required: true,
      maxSelect: 1,
      choices: [
        { id: `c-${Date.now()}-1`, name: 'หวานปกติ (100%)', nameEn: 'Regular (100%)', priceDelta: 0, isDefault: true },
        { id: `c-${Date.now()}-2`, name: 'หวานน้อย (50%)', nameEn: 'Less Sweet (50%)', priceDelta: 0 },
        { id: `c-${Date.now()}-3`, name: 'หวาน 25%', nameEn: 'Slightly Sweet (25%)', priceDelta: 0 },
        { id: `c-${Date.now()}-4`, name: 'ไม่หวานเลย (0%)', nameEn: 'No Sugar (0%)', priceDelta: 0 },
      ],
    }),
  },
  {
    label: 'ประเภทนม (Milk Choice)',
    icon: '🥛',
    group: () => ({
      id: `opt-milk-${Date.now()}`,
      name: 'ประเภทนม',
      nameEn: 'Milk Choice',
      required: false,
      maxSelect: 1,
      choices: [
        { id: `c-${Date.now()}-1`, name: 'นมสดปกติ (Fresh Milk)', nameEn: 'Fresh Whole Milk', priceDelta: 0, isDefault: true },
        { id: `c-${Date.now()}-2`, name: 'นมข้าวโอ๊ต (Oat Milk)', nameEn: 'Oat Milk', priceDelta: 20 },
        { id: `c-${Date.now()}-3`, name: 'นมถั่วเหลือง (Soy Milk)', nameEn: 'Soy Milk', priceDelta: 15 },
        { id: `c-${Date.now()}-4`, name: 'นมอัลมอนด์ (Almond Milk)', nameEn: 'Almond Milk', priceDelta: 25 },
      ],
    }),
  },
  {
    label: 'เมล็ดกาแฟ (Coffee Beans)',
    icon: '☕',
    group: () => ({
      id: `opt-beans-${Date.now()}`,
      name: 'เมล็ดกาแฟ (House Blend / Single Origin)',
      nameEn: 'Coffee Beans Selection',
      required: false,
      maxSelect: 1,
      choices: [
        { id: `c-${Date.now()}-1`, name: 'House Blend (คั่วกลาง-เข้ม)', nameEn: 'House Blend (Medium-Dark)', priceDelta: 0, isDefault: true },
        { id: `c-${Date.now()}-2`, name: 'Ethiopia Yirgacheffe (คั่วอ่อน ฟรุตตี้)', nameEn: 'Ethiopia Single Origin', priceDelta: 25 },
        { id: `c-${Date.now()}-3`, name: 'Colombia Geisha (คั่วอ่อน พีช)', nameEn: 'Colombia Geisha', priceDelta: 35 },
      ],
    }),
  },
  {
    label: 'ท็อปปิ้งเพิ่มเติม (Toppings)',
    icon: '🧋',
    group: () => ({
      id: `opt-top-${Date.now()}`,
      name: 'ท็อปปิ้งเพิ่มเติม',
      nameEn: 'Add-on Toppings',
      required: false,
      maxSelect: 5,
      choices: [
        { id: `c-${Date.now()}-1`, name: 'ไข่มุกบราวน์ชูการ์', nameEn: 'Brown Sugar Pearls', priceDelta: 15 },
        { id: `c-${Date.now()}-2`, name: 'บุกเจลลี่บราวน์ชูการ์', nameEn: 'Konjac Jelly', priceDelta: 15 },
        { id: `c-${Date.now()}-3`, name: 'วิปครีมสดแท้', nameEn: 'Whipped Cream', priceDelta: 20 },
      ],
    }),
  },
  {
    label: 'ตัวเลือกไข่ (Egg Option)',
    icon: '🍳',
    group: () => ({
      id: `opt-egg-${Date.now()}`,
      name: 'ตัวเลือกไข่',
      nameEn: 'Egg Option',
      required: false,
      maxSelect: 1,
      choices: [
        { id: `c-${Date.now()}-1`, name: 'ไม่รับไข่ดาว', nameEn: 'No Egg', priceDelta: 0, isDefault: true },
        { id: `c-${Date.now()}-2`, name: 'ไข่ดาวกรอบไข่แดงเยิ้ม', nameEn: 'Crispy Fried Egg', priceDelta: 15 },
        { id: `c-${Date.now()}-3`, name: 'ไข่ออนเซ็นญี่ปุ่น', nameEn: 'Japanese Onsen Egg', priceDelta: 20 },
      ],
    }),
  },
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
    categoryId: categories.find((c) => c.id !== 'popular')?.id || 'coffee',
    price: undefined,
    imageUrl: defaultPlaceholderImage,
    description: '',
    descriptionEn: '',
    isAvailable: true,
    isChefRecommend: false,
    isPopular: false,
    optionGroups: [],
  });

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        optionGroups: item.optionGroups ? JSON.parse(JSON.stringify(item.optionGroups)) : [],
      });
      setShowUrlInput(!!item.imageUrl && !item.imageUrl.startsWith('data:'));
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        name: '',
        nameEn: '',
        categoryId: categories.find((c) => c.id !== 'popular')?.id || 'coffee',
        price: undefined,
        imageUrl: defaultPlaceholderImage,
        description: '',
        descriptionEn: '',
        isAvailable: true,
        isChefRecommend: false,
        isPopular: false,
        optionGroups: [],
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

  // Click outside category dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryDropdownOpen]);

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

  // --- Option Groups Management Handlers ---
  const handleAddOptionGroup = () => {
    const newGroup: OptionGroup = {
      id: `opt-${Date.now()}`,
      name: '',
      nameEn: '',
      required: false,
      maxSelect: 1,
      choices: [
        { id: `c-${Date.now()}-1`, name: '', nameEn: '', priceDelta: 0, isDefault: true },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      optionGroups: [...(prev.optionGroups || []), newGroup],
    }));
  };

  const handleAddPresetGroup = (template: typeof PRESET_TEMPLATES[0]) => {
    const newGroup = template.group();
    setFormData((prev) => ({
      ...prev,
      optionGroups: [...(prev.optionGroups || []), newGroup],
    }));
  };

  const handleDeleteOptionGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: (prev.optionGroups || []).filter((_, idx) => idx !== groupIndex),
    }));
  };

  const handleUpdateOptionGroup = (groupIndex: number, updated: Partial<OptionGroup>) => {
    setFormData((prev) => {
      const groups = [...(prev.optionGroups || [])];
      groups[groupIndex] = { ...groups[groupIndex], ...updated };
      return { ...prev, optionGroups: groups };
    });
  };

  const handleAddChoice = (groupIndex: number) => {
    setFormData((prev) => {
      const groups = [...(prev.optionGroups || [])];
      const targetGroup = groups[groupIndex];
      const newChoice: OptionChoice = {
        id: `c-${Date.now()}`,
        name: '',
        nameEn: '',
        priceDelta: 0,
      };
      groups[groupIndex] = {
        ...targetGroup,
        choices: [...targetGroup.choices, newChoice],
      };
      return { ...prev, optionGroups: groups };
    });
  };

  const handleDeleteChoice = (groupIndex: number, choiceIndex: number) => {
    setFormData((prev) => {
      const groups = [...(prev.optionGroups || [])];
      const targetGroup = groups[groupIndex];
      groups[groupIndex] = {
        ...targetGroup,
        choices: targetGroup.choices.filter((_, idx) => idx !== choiceIndex),
      };
      return { ...prev, optionGroups: groups };
    });
  };

  const handleUpdateChoice = (groupIndex: number, choiceIndex: number, updated: Partial<OptionChoice>) => {
    setFormData((prev) => {
      const groups = [...(prev.optionGroups || [])];
      const targetGroup = groups[groupIndex];
      const targetChoices = [...targetGroup.choices];
      targetChoices[choiceIndex] = { ...targetChoices[choiceIndex], ...updated };
      groups[groupIndex] = { ...targetGroup, choices: targetChoices };
      return { ...prev, optionGroups: groups };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined || isNaN(Number(formData.price))) return;

    // Filter out empty option groups or empty choices
    const cleanedOptionGroups = (formData.optionGroups || [])
      .filter((g) => g.name.trim() !== '')
      .map((g) => ({
        ...g,
        choices: g.choices.filter((c) => c.name.trim() !== ''),
      }))
      .filter((g) => g.choices.length > 0);

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
      optionGroups: cleanedOptionGroups.length > 0 ? cleanedOptionGroups : undefined,
    };

    onSave(finalItem);
    onClose();
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-orange-500 flex-shrink-0" />;
      case 'CupSoda': return <CupSoda className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-blue-500 flex-shrink-0" />;
      case 'Cake': return <Cake className="w-4 h-4 text-pink-500 flex-shrink-0" />;
      case 'Pizza': return <Pizza className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />;
      default: return <Coffee className="w-4 h-4 text-stone-500 flex-shrink-0" />;
    }
  };

  const selectableCategories = categories.filter((c) => c.id !== 'popular');
  const selectedCat = categories.find((c) => c.id === formData.categoryId) || selectableCategories[0];
  const optionGroups = formData.optionGroups || [];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Full-Screen Dark Overlay Covering 100% of Viewport */}
      <div 
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col border border-stone-200/80 z-10">
        
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
                {language === 'th' ? 'กรอกรายละเอียด รูปภาพ และตัวเลือกเสริม/ท็อปปิ้ง' : 'Fill in menu info, photo, and add-on options'}
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
        <form id="item-editor-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-xs sm:text-sm">
          
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

            {/* Custom Category Dropdown & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ultra-Modern Custom Category Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <label className="block font-black text-stone-800 mb-1.5 text-xs">
                  {t('adminCategory', language)} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`w-full px-4 py-3 rounded-2xl border bg-white flex items-center justify-between text-stone-900 font-bold shadow-2xs transition-all cursor-pointer ${
                    isCategoryDropdownOpen
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedCat && getCategoryIcon(selectedCat.icon)}
                    <span className="truncate">
                      {selectedCat
                        ? (language === 'en' ? (selectedCat.nameEn || selectedCat.name) : selectedCat.name)
                        : 'เลือกหมวดหมู่'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                      isCategoryDropdownOpen ? 'rotate-180 text-orange-600' : ''
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/90 p-2 z-50 animate-pop-in space-y-1 max-h-56 overflow-y-auto">
                    {selectableCategories.map((cat) => {
                      const isSelected = formData.categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, categoryId: cat.id });
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs font-black ${
                            isSelected
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-stone-50 hover:bg-orange-50 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(cat.icon)}
                            <span>{language === 'en' ? (cat.nameEn || cat.name) : cat.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Field */}
              <div>
                <label className="block font-black text-stone-800 mb-1.5 text-xs">
                  {t('adminPrice', language)} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price !== undefined ? formData.price : ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder={language === 'th' ? 'ระบุราคา เช่น 75' : 'e.g. 75'}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-black text-stone-900 text-base shadow-2xs"
                />
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
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none text-xs leading-relaxed font-medium"
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
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none text-xs leading-relaxed font-medium"
              />
            </div>
          </div>

          {/* SECTION 4: HIGHLIGHT BADGES (SELECTABLE CARDS) */}
          <div className="pt-1">
            <label className="block font-black text-stone-800 mb-2 text-xs">
              {t('adminHighlightBadges', language)}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chef Recommend Card */}
              <div
                onClick={() => setFormData({ ...formData, isChefRecommend: !formData.isChefRecommend })}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
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
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
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

          {/* SECTION 5: OPTION GROUPS & ADD-ONS (NEW & FULLY FEATURED) */}
          <div className="bg-orange-50/40 rounded-3xl p-4 sm:p-5 border border-orange-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-orange-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-xs sm:text-sm">
                    {language === 'th' ? 'ตัวเลือกเสริม & ท็อปปิ้ง (Option Groups)' : 'Option Groups & Add-ons'}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {language === 'th' ? 'เช่น ระดับความหวาน, เมล็ดกาแฟ, ท็อปปิ้ง, ไข่ดาว' : 'e.g. Sweetness, Coffee Beans, Milk, Toppings'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddOptionGroup}
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'สร้างกลุ่มใหม่' : 'Add Group'}</span>
              </button>
            </div>

            {/* Quick Preset Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-800">
                {language === 'th' ? '⚡ เพิ่มด่วนจากเทมเพลตยอดนิยม:' : '⚡ Quick Add from Presets:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetGroup(tmpl)}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100/90 border border-orange-200/90 text-stone-800 hover:text-orange-950 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>{tmpl.icon}</span>
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List of Option Groups */}
            {optionGroups.length === 0 ? (
              <div className="bg-white/80 rounded-2xl p-6 text-center border border-dashed border-orange-200 text-stone-400">
                <Layers className="w-8 h-8 mx-auto text-orange-300 mb-1.5" />
                <p className="font-bold text-stone-600 text-xs">
                  {language === 'th' ? 'ยังไม่มีกลุ่มตัวเลือกสำหรับเมนูนี้' : 'No option groups yet'}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {language === 'th' ? 'กดเลือกเทมเพลตด้านบน หรือกดปุ่ม "สร้างกลุ่มใหม่" เพื่อเพิ่มความหวานหรือท็อปปิ้ง' : 'Click a preset above or "Add Group" to add customization'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {optionGroups.map((group, gIdx) => (
                  <div
                    key={group.id || gIdx}
                    className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3.5 relative"
                  >
                    {/* Group Header & Settings */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                        <div>
                          <label className="block text-[11px] font-black text-stone-600 mb-1">
                            {language === 'th' ? 'ชื่อกลุ่มตัวเลือก (ภาษาไทย) *' : 'Group Name (TH) *'}
                          </label>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => handleUpdateOptionGroup(gIdx, { name: e.target.value })}
                            placeholder="เช่น ระดับความหวาน"
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-stone-600 mb-1">
                            {language === 'th' ? 'ชื่อกลุ่มตัวเลือก (English)' : 'Group Name (EN)'}
                          </label>
                          <input
                            type="text"
                            value={group.nameEn || ''}
                            onChange={(e) => handleUpdateOptionGroup(gIdx, { nameEn: e.target.value })}
                            placeholder="e.g. Sweetness Level"
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-xs"
                          />
                        </div>
                      </div>

                      {/* Delete Group Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteOptionGroup(gIdx)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer active:scale-95 ml-auto"
                        title={language === 'th' ? 'ลบกลุ่มตัวเลือกนี้' : 'Delete this group'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Group Rules: Required & Max Select */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      {/* Required Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={group.required}
                          onChange={(e) => handleUpdateOptionGroup(gIdx, { required: e.target.checked })}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span>{language === 'th' ? 'จำเป็นต้องเลือก (Required)' : 'Required choice'}</span>
                      </label>

                      {/* Single vs Multi Select */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[11px] text-stone-500">{language === 'th' ? 'จำนวนที่เลือกได้:' : 'Select limit:'}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateOptionGroup(gIdx, { maxSelect: 1 })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition ${
                            group.maxSelect === 1
                              ? 'bg-orange-500 text-white'
                              : 'bg-stone-200/80 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {language === 'th' ? '1 อย่าง (Single)' : 'Single (1)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOptionGroup(gIdx, { maxSelect: 5 })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition ${
                            (group.maxSelect || 1) > 1
                              ? 'bg-orange-500 text-white'
                              : 'bg-stone-200/80 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {language === 'th' ? 'หลายอย่าง (Multi)' : 'Multiple (>1)'}
                        </button>
                      </div>
                    </div>

                    {/* Choices List */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-stone-400">
                          {language === 'th' ? 'รายการตัวเลือกย่อยในกลุ่มนี้:' : 'Choices in this group:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddChoice(gIdx)}
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{language === 'th' ? 'เพิ่มตัวเลือก' : 'Add Choice'}</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {group.choices.map((choice, cIdx) => (
                          <div
                            key={choice.id || cIdx}
                            className="flex items-center gap-2 bg-stone-50/70 p-2 rounded-xl border border-stone-200/60 text-xs"
                          >
                            <span className="text-[11px] font-black text-stone-400 w-4 text-center">
                              {cIdx + 1}.
                            </span>

                            {/* Name TH */}
                            <input
                              type="text"
                              value={choice.name}
                              onChange={(e) => handleUpdateChoice(gIdx, cIdx, { name: e.target.value })}
                              placeholder="ชื่อตัวเลือก (TH)"
                              className="flex-1 px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-xs"
                            />

                            {/* Name EN */}
                            <input
                              type="text"
                              value={choice.nameEn || ''}
                              onChange={(e) => handleUpdateChoice(gIdx, cIdx, { nameEn: e.target.value })}
                              placeholder="Choice Name (EN)"
                              className="flex-1 px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-xs"
                            />

                            {/* Price Delta */}
                            <div className="relative w-24">
                              <input
                                type="number"
                                min="0"
                                step="5"
                                value={choice.priceDelta}
                                onChange={(e) => handleUpdateChoice(gIdx, cIdx, { priceDelta: Number(e.target.value) })}
                                placeholder="+0"
                                className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 focus:outline-none focus:border-orange-500 font-black text-xs text-orange-600"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 pointer-events-none">
                                ฿
                              </span>
                            </div>

                            {/* Delete Choice */}
                            {group.choices.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteChoice(gIdx, cIdx)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete Choice"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* 3. Fixed Footer Action Bar */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-200 text-stone-700 font-black transition text-xs sm:text-sm cursor-pointer active:scale-95"
          >
            {t('cancel', language)}
          </button>
          <button
            type="submit"
            form="item-editor-form"
            className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black shadow-lg shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer flex items-center gap-2"
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