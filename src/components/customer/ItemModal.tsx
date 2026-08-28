import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { MenuItem, SelectedOption, Language } from '../../types';
import { soundService } from '../../utils/sound';

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  language: Language;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialNote: string,
    unitPriceWithDelta: number
  ) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  onClose,
  language,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSpecialNote('');
      const initial: Record<string, string[]> = {};
      if (item.optionGroups && item.optionGroups.length > 0) {
        item.optionGroups.forEach((group) => {
          const defaultChoice = group.choices.find((c) => c.isDefault);
          if (defaultChoice) {
            initial[group.id] = [defaultChoice.id];
          } else if (group.required && group.choices.length > 0) {
            initial[group.id] = [group.choices[0].id];
          } else {
            initial[group.id] = [];
          }
        });
      }
      setSelectedChoices(initial);
    }
  }, [item]);

  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  const handleRadioSelect = (groupId: string, choiceId: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [groupId]: [choiceId],
    }));
  };

  const handleCheckboxToggle = (groupId: string, choiceId: string, maxSelect = 99) => {
    setSelectedChoices((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(choiceId)) {
        return {
          ...prev,
          [groupId]: current.filter((id) => id !== choiceId),
        };
      } else {
        if (current.length >= maxSelect) {
          return prev;
        }
        return {
          ...prev,
          [groupId]: [...current, choiceId],
        };
      }
    });
  };

  let deltaSum = 0;
  const flatSelectedOptions: SelectedOption[] = [];

  if (item.optionGroups) {
    item.optionGroups.forEach((group) => {
      const chosenIds = selectedChoices[group.id] || [];
      chosenIds.forEach((cId) => {
        const choice = group.choices.find((c) => c.id === cId);
        if (choice) {
          deltaSum += choice.priceDelta;
          flatSelectedOptions.push({
            groupId: group.id,
            groupName: language === 'en' && group.nameEn ? group.nameEn : group.name,
            choiceId: choice.id,
            choiceName: language === 'en' && choice.nameEn ? choice.nameEn : choice.name,
            priceDelta: choice.priceDelta,
          });
        }
      });
    });
  }

  const unitPrice = item.price + deltaSum;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    soundService.playClickPop();
    onAddToCart(item, quantity, flatSelectedOptions, specialNote, unitPrice);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[28px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-10 border border-stone-200/80">
        {/* Modal Header / Hero Image */}
        <div className="relative w-full h-48 sm:h-56 bg-stone-100 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">
                  {language === 'en' && item.nameEn ? item.nameEn : item.name}
                </h2>
                {language === 'th' && item.nameEn && (
                  <p className="text-xs text-stone-400">{item.nameEn}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 font-medium">
                  {language === 'th' ? 'เริ่มต้น ' : 'From '}
                </span>
                <span className="text-lg font-black text-orange-600">
                  ฿{item.price}
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed font-medium">
              {language === 'en' && item.descriptionEn ? item.descriptionEn : item.description}
            </p>
          </div>

          {/* Option Groups */}
          {item.optionGroups?.map((group) => {
            const isSingleChoice = group.maxSelect === 1;
            const currentSelected = selectedChoices[group.id] || [];

            return (
              <div key={group.id} className="pt-3.5 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-bold text-stone-800">
                    {language === 'en' && group.nameEn ? group.nameEn : group.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                    {group.required
                      ? language === 'th' ? 'จำเป็น' : 'Required'
                      : language === 'th' ? 'ไม่บังคับ' : 'Optional'}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.choices.map((choice) => {
                    const isChecked = currentSelected.includes(choice.id);

                    return (
                      <label
                        key={choice.id}
                        onClick={() => {
                          if (isSingleChoice) {
                            handleRadioSelect(group.id, choice.id);
                          } else {
                            handleCheckboxToggle(group.id, choice.id, group.maxSelect);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-sm cursor-pointer transition ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-${
                              isSingleChoice ? 'full' : 'md'
                            } border flex items-center justify-center ${
                              isChecked
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                            )}
                          </div>
                          <span>
                            {language === 'en' && choice.nameEn ? choice.nameEn : choice.name}
                          </span>
                        </div>

                        {choice.priceDelta > 0 && (
                          <span className="text-xs font-bold text-orange-600">
                            +฿{choice.priceDelta}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Request */}
          <div className="pt-3.5 border-t border-stone-100">
            <label className="block text-sm font-bold text-stone-800 mb-1.5">
              {language === 'th' ? 'หมายเหตุเพิ่มเติม (ถ้ามี)' : 'Special Requests'}
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder={
                language === 'th'
                  ? 'เช่น แยกน้ำแข็ง, ขอช้อนส้อม, ไม่ใส่ผักชี'
                  : 'e.g. Less ice, extra napkin, no dressing'
              }
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-orange-500/25 flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {language === 'th' ? 'ใส่ตะกร้า' : 'Add to Order'}
            </span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
