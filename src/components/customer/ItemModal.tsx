import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { MenuItem, SelectedOption } from '../../types';
import { soundService } from '../../utils/sound';

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
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
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});

  // Initialize default options
  useEffect(() => {
    if (item && item.optionGroups) {
      const initial: Record<string, string[]> = {};
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
      setSelectedChoices(initial);
      setQuantity(1);
      setSpecialNote('');
    }
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

  // Calculate Unit Price with Add-ons
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
            groupName: group.name,
            choiceId: choice.id,
            choiceName: choice.name,
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        {/* Modal Header / Hero Image */}
        <div className="relative w-full h-48 sm:h-56 bg-gray-100 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable options */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                {item.nameEn && (
                  <p className="text-xs text-gray-400">{item.nameEn}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500 font-medium">เริ่มต้น </span>
                <span className="text-lg font-bold text-orange-600">
                  ฿{item.price}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Option Groups */}
          {item.optionGroups?.map((group) => {
            const isSingleChoice = group.maxSelect === 1;
            const currentSelected = selectedChoices[group.id] || [];

            return (
              <div key={group.id} className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-bold text-gray-800">
                    {group.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                    {group.required ? 'จำเป็นต้องเลือก' : 'ไม่บังคับ'}
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
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-${
                              isSingleChoice ? 'full' : 'md'
                            } border flex items-center justify-center ${
                              isChecked
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                            )}
                          </div>
                          <span>{choice.name}</span>
                        </div>

                        {choice.priceDelta > 0 && (
                          <span className="text-xs font-semibold text-orange-600">
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
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="เช่น แยกน้ำแข็ง, ขอช้อนส้อม, ไม่ใส่ผักชี"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> ใส่ตะกร้า
            </span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
