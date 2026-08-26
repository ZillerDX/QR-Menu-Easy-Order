import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Language } from '../../types';
import { generatePromptPayPayload } from '../../utils/promptpay';
import { t } from '../../utils/i18n';

interface PromptPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  promptpayNumber: string;
  promptpayName: string;
  orderNumber: string;
  language: Language;
  onPaymentConfirmed: () => void;
}

export const PromptPayModal: React.FC<PromptPayModalProps> = ({
  isOpen,
  onClose,
  amount,
  promptpayNumber,
  promptpayName,
  orderNumber,
  language,
  onPaymentConfirmed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const payload = generatePromptPayPayload(promptpayNumber, amount);
      QRCode.toCanvas(canvasRef.current, payload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#002d62',
          light: '#ffffff',
        },
      });
    }
  }, [isOpen, promptpayNumber, amount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-[#003B71] text-white p-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl font-black tracking-wider">{t('ppTitle', language)}</span>
          </div>
          <p className="text-xs text-blue-200">{t('ppSubtitle', language)}</p>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-white border-2 border-blue-100 rounded-2xl shadow-inner inline-block">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-stone-500 font-bold">{t('ppAmountDue', language)}</div>
            <div className="text-3xl font-black text-stone-900">
              ฿{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-bold text-stone-700 pt-1">
              {promptpayName}
            </div>
            <div className="text-[11px] text-stone-400 font-medium">
              {orderNumber} • PromptPay: {promptpayNumber}
            </div>
          </div>

          <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-3 text-left flex items-start gap-2.5 text-xs text-blue-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>{t('ppNote', language)}</p>
          </div>

          <div className="w-full space-y-2 pt-1">
            <button
              onClick={onPaymentConfirmed}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('ppConfirmButton', language)}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-stone-400 hover:text-stone-600"
            >
              {t('ppBack', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
