import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: 'trash' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  icon = 'trash',
  onConfirm,
  onCancel,
}) => {
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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/80 z-10 p-6 sm:p-7 text-center space-y-5">
        
        {/* Top Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-sm">
          {icon === 'trash' ? (
            <Trash2 className="w-8 h-8 text-red-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="font-black text-stone-900 text-lg sm:text-xl">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-2xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-black text-xs sm:text-sm transition cursor-pointer shadow-2xs"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white transition cursor-pointer shadow-md active:scale-[0.98] ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
