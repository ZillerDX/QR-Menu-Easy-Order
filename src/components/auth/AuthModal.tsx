import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, KeyRound, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { authService } from '../../utils/supabaseClient';
import { Language } from '../../types';
import { CAFE_ORDER_LOGO_DATA_URI } from '../../data/logoData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccess?: () => void;
  onQuickDemoLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onSuccess,
  onQuickDemoLogin,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      await authService.signInWithGoogle();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Unsupported provider') || msg.includes('provider is not enabled')) {
        setErrorMessage(
          language === 'th'
            ? '⚠️ ยังไม่ได้เปิดใช้งาน Google Provider บน Supabase Dashboard ท่านสามารถกดปุ่ม "เข้าสู่ระบบด่วน (Quick Demo)" ด้านล่างเพื่อทดสอบได้ทันทีครับ'
            : '⚠️ Google provider is not yet enabled in Supabase Dashboard. You can use the Quick Demo login button below to test immediately.'
        );
      } else {
        setErrorMessage(msg || (language === 'th' ? 'เกิดข้อผิดพลาดในการล็อกอินด้วย Google' : 'Google sign-in failed'));
      }
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(language === 'th' ? 'กรุณากรอกอีเมลและรหัสผ่าน' : 'Please enter email and password');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (mode === 'signin') {
        await authService.signInWithEmail(email, password);
        setSuccessMessage(language === 'th' ? 'เข้าสู่ระบบสำเร็จ กำลังเข้าสู่ระบบร้านค้า...' : 'Login successful! Redirecting...');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        await authService.signUpWithEmail(email, password);
        setSuccessMessage(language === 'th' ? 'ลงทะเบียนสำเร็จ! เข้าสู่ระบบได้ทันที' : 'Account registered successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (language === 'th' ? 'การยืนยันตัวตนล้มเหลว กรุณาตรวจสอบข้อมูล' : 'Authentication failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = () => {
    onQuickDemoLogin?.();
    onSuccess?.();
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10">
        {/* Header Graphic */}
        <div className="p-6 bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white p-1 mx-auto shadow-lg shadow-black/10 overflow-hidden mb-3">
            <img
              src={CAFE_ORDER_LOGO_DATA_URI}
              alt="Cafe Order Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <h3 className="font-black text-xl tracking-tight">
            {language === 'th' ? 'เข้าสู่ระบบสำหรับทางร้าน' : 'Store Staff & Admin Portal'}
          </h3>
          <p className="text-xs text-orange-100 mt-1 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'สำหรับผู้จัดการ, พนักงานครัว และแคชเชียร์' : 'For Managers, Kitchen Staff & Cashiers'}</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Demo 1-Click Login Button */}
          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{language === 'th' ? '⚡ เข้าสู่ระบบพนักงานด่วน (1-Click Staff Demo)' : '⚡ Quick Staff Demo (1-Click)'}</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/80 text-xs font-black">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                mode === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {language === 'th' ? 'เข้าสู่ระบบ (Sign In)' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                mode === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {language === 'th' ? 'สร้างบัญชีพนักงาน' : 'Create Account'}
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 active:scale-98 border border-stone-300 rounded-2xl font-black text-xs sm:text-sm text-stone-700 flex items-center justify-center gap-3 transition shadow-xs cursor-pointer hover:shadow-md"
          >
            {/* Official Google SVG Icon */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === 'signin'
                ? (language === 'th' ? 'เข้าสู่ระบบด้วย Google' : 'Sign in with Google')
                : (language === 'th' ? 'ลงทะเบียนด้วย Google' : 'Sign up with Google')}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] font-bold text-stone-400 uppercase">
              {language === 'th' ? 'หรือใช้อีเมล' : 'or email'}
            </span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* 2. Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                {language === 'th' ? 'อีเมลพนักงาน' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="staff@cafeorder.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold bg-stone-50/60 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                {language === 'th' ? 'รหัสผ่าน' : 'Password'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold bg-stone-50/60 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>
                {mode === 'signin'
                  ? (language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In')
                  : (language === 'th' ? 'ยืนยันลงทะเบียน' : 'Register Account')}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
