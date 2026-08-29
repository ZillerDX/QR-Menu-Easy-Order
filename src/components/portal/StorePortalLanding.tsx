import React, { useState } from 'react';
import { StoreConfig, Language } from '../../types';
import { authService } from '../../utils/supabaseClient';
import { Lock, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface StorePortalLandingProps {
  storeConfig: StoreConfig;
  language: Language;
  onEnterSimulator: (tableNum?: string) => void;
  onLoginSuccess?: () => void;
}

export const StorePortalLanding: React.FC<StorePortalLandingProps> = ({
  storeConfig,
  language,
  onEnterSimulator,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
            ? 'กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านด้านล่างครับ'
            : 'Google login is not enabled. Please sign in with Email below.'
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
        setSuccessMessage(language === 'th' ? 'เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้าจอร้านค้า...' : 'Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess?.();
        }, 600);
      } else {
        await authService.signUpWithEmail(email, password);
        setSuccessMessage(language === 'th' ? 'ลงทะเบียนสำเร็จ! เข้าสู่ระบบได้ทันที' : 'Account registered successfully!');
        setTimeout(() => {
          onLoginSuccess?.();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (language === 'th' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' : 'Authentication failed. Please check credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Centered Clean Minimal Login Card */}
      <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-xl shadow-stone-200/50 space-y-6">
        
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl mx-auto overflow-hidden shadow-md border border-orange-200 p-0.5 bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center">
            <img
              src={storeConfig.logoUrl}
              alt={storeConfig.name}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {language === 'th' ? 'เข้าสู่ระบบร้านค้า' : 'Store Staff Portal'}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {language === 'th'
              ? 'จัดการจอครัว KDS, เมนูอาหาร และใบเสร็จ PromptPay'
              : 'Kitchen Display System & Store Dashboard'}
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-2xl text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              mode === 'signin' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              mode === 'signup' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'th' ? 'ลงทะเบียนร้าน' : 'Register'}
          </button>
        </div>

        {/* 1-Click Google Sign-In */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
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
          <span>{language === 'th' ? 'เข้าสู่ระบบด้วย Google' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            {language === 'th' ? 'หรืออีเมล' : 'or email'}
          </span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              {language === 'th' ? 'อีเมล' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@cafeorder.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              {language === 'th' ? 'รหัสผ่าน' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-orange-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  {mode === 'signin'
                    ? (language === 'th' ? 'เข้าสู่ระบบร้านค้า' : 'Sign In to Portal')
                    : (language === 'th' ? 'ลงทะเบียนร้านค้าใหม่' : 'Create Store Account')}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Clean subtle simulator link at bottom */}
        <div className="pt-2 border-t border-stone-100 text-center">
          <button
            type="button"
            onClick={() => onEnterSimulator('01')}
            className="text-xs font-bold text-stone-500 hover:text-orange-600 transition inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-xl hover:bg-orange-50"
          >
            <span>🧪 {language === 'th' ? 'ทดสอบสั่งอาหารในฐานะลูกค้า (โต๊ะ 01)' : 'Test Customer Dining (Table 01)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-stone-400 font-medium select-none">
        <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
        <span>Supabase Realtime Cloud Database • 256-bit SSL</span>
      </div>
    </div>
  );
};
