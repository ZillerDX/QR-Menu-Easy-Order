import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { authService } from '../../utils/supabaseClient';
import { KeyRound, Lock, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  language,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setIsSuccess(false);
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage(
        language === 'th'
          ? 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
          : 'Password must be at least 6 characters long'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        language === 'th'
          ? 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'
          : 'Passwords do not match'
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await authService.updatePassword(newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (language === 'th'
            ? 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
            : 'Failed to update password. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 p-6 sm:p-8 space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
            <KeyRound className="w-7 h-7" />
          </div>
          <h3 className="font-black text-stone-900 text-xl sm:text-2xl">
            {language === 'th' ? 'ตั้งรหัสผ่านใหม่' : 'Set New Password'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto">
            {language === 'th'
              ? 'กรุณากรอกรหัสผ่านใหม่สำหรับเข้าสู่ระบบร้านค้าของคุณ'
              : 'Please enter your new password to access your store portal'}
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-black text-sm text-emerald-800">
              {language === 'th' ? 'เปลี่ยนรหัสผ่านสำเร็จ!' : 'Password updated successfully!'}
            </p>
            <p className="text-xs text-emerald-600 font-medium">
              {language === 'th' ? 'กำลังนำท่านเข้าสู่ระบบ...' : 'Redirecting to portal...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                {language === 'th' ? 'รหัสผ่านใหม่' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                {language === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-orange-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'th' ? 'บันทึกรหัสผ่านใหม่' : 'Save New Password'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
