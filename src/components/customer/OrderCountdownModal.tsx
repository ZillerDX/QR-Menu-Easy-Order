import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Utensils, AlertCircle } from 'lucide-react';
import { Language } from '../../types';
import confetti from 'canvas-confetti';
import { soundService } from '../../utils/sound';

interface OrderCountdownModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
  language: Language;
  tableNumber: string;
  totalPrice: number;
}

export const OrderCountdownModal: React.FC<OrderCountdownModalProps> = ({
  isOpen,
  onCancel,
  onComplete,
  language,
  tableNumber,
  totalPrice,
}) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isSuccess, setIsSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(3);
      setIsSuccess(false);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = interval;

      return () => {
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleFinish = () => {
    setIsSuccess(true);
    soundService.playNewOrderChime();
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}

    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  const handleManualCancel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    soundService.playClickPop();
    onCancel();
  };

  if (!isOpen) return null;

  const progressPercent = ((3 - timeLeft) / 3) * 100;

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        onClick={!isSuccess ? handleManualCancel : undefined}
      />

      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 text-center overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 z-10 space-y-5">
        {!isSuccess ? (
          <>
            {/* Top Loading Icon with Ring */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-stone-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-orange-500 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-orange-600 animate-pulse font-mono">
                  {timeLeft}
                </span>
                <span className="text-[10px] text-stone-400 font-bold -mt-1">
                  {language === 'th' ? 'วินาที' : 'sec'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">
                {language === 'th' ? 'กำลังส่งออเดอร์ไปยังห้องครัว...' : 'Sending Order to Kitchen...'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {language === 'th' 
                  ? `โต๊ะ ${tableNumber} • ยอดรวม ฿${totalPrice.toLocaleString()}`
                  : `Table ${tableNumber} • Total ฿${totalPrice.toLocaleString()}`}
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 rounded-xl py-1 px-2 font-medium inline-block mt-1">
                {language === 'th' ? 'แตะปุ่มยกเลิกได้หากต้องการเปลี่ยนใจ' : 'Tap Cancel to undo order'}
              </p>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleManualCancel}
              className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 font-black text-xs sm:text-sm border border-stone-200 hover:border-red-200 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>{language === 'th' ? 'ยกเลิกออเดอร์ (ภายใน 3 วินาที)' : 'Cancel Order (Within 3s)'}</span>
            </button>
          </>
        ) : (
          <div className="py-4 space-y-3 animate-in zoom-in-90 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-stone-900">
                {language === 'th' ? 'ส่งออเดอร์เรียบร้อยแล้ว!' : 'Order Placed Successfully!'}
              </h3>
              <p className="text-xs text-emerald-700 font-bold">
                {language === 'th' ? 'ห้องครัวได้รับรายการอาหารของท่านแล้ว' : 'Kitchen received your order'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
