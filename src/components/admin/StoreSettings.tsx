import React, { useState, useRef } from 'react';
import { Store, Upload, CheckCircle2, QrCode, Clock, Hash, LogOut, ShieldCheck } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';
import { User } from '@supabase/supabase-js';

interface StoreSettingsProps {
  storeConfig: StoreConfig;
  language: Language;
  onSave: (config: StoreConfig) => void;
  user?: User | null;
  onLogout?: () => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  storeConfig,
  language,
  onSave,
  user,
  onLogout,
}) => {
  const [formData, setFormData] = useState<StoreConfig>({ ...storeConfig });
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-500 flex-shrink-0" />
            {t('settingsTitle', language)}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('settingsSubtitle', language)}
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('settingsSaveSuccess', language)}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        {/* Logo / Profile Upload Section */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <label className="block font-black text-stone-900 text-sm">
            {t('settingsLogoTitle', language)}
          </label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Logo Preview Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-1 flex-shrink-0 shadow-md shadow-orange-500/20 overflow-hidden relative group">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Store Logo"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-[22px]"
                />
              ) : (
                <div className="w-full h-full bg-white rounded-[22px] flex flex-col items-center justify-center text-orange-600">
                  <Store className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-black">Cafe Order</span>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('settingsLogoUploadBtn', language)}</span>
                </button>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                    className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-2xl transition cursor-pointer"
                  >
                    {t('delete', language)}
                  </button>
                )}
              </div>

              <p className="text-[11px] text-stone-400 font-medium">
                {t('settingsLogoHint', language)}
              </p>
            </div>
          </div>
        </div>

        {/* Store Name & Slogan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
              {t('settingsStoreNameTh', language)} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
              placeholder="เช่น Cafe Order"
            />
          </div>

          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
              {t('settingsStoreNameEn', language)} *
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
              placeholder="e.g. Cafe Order"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
              {t('settingsTaglineTh', language)}
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium"
              placeholder="เช่น สั่งง่าย อร่อยฟิน"
            />
          </div>

          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
              {t('settingsTaglineEn', language)}
            </label>
            <input
              type="text"
              value={formData.taglineEn}
              onChange={(e) => setFormData({ ...formData, taglineEn: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium"
              placeholder="e.g. Order Easy • Enjoy More"
            />
          </div>
        </div>

        {/* PromptPay Info & Table Count */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>{t('settingsPromptPayNo', language)} (เบอร์มือถือ/เลขบัตร ปชช.) *</span>
            </label>
            <input
              type="text"
              value={formData.promptpayNumber}
              onChange={(e) => setFormData({ ...formData, promptpayNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
              placeholder="เช่น 0812345678"
            />
          </div>

          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
              {t('settingsPromptPayName', language)} *
            </label>
            <input
              type="text"
              value={formData.promptpayName}
              onChange={(e) => setFormData({ ...formData, promptpayName: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
              placeholder="เช่น คาเฟ่ ออเดอร์ (Cafe Order)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-orange-600" />
              <span>{t('settingsTableCount', language)}</span>
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.tableCount}
              onChange={(e) => setFormData({ ...formData, tableCount: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
            />
          </div>

          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-600" />
              <span>{t('settingsOpenHours', language)}</span>
            </label>
            <input
              type="text"
              value={formData.openTime}
              onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
              placeholder="08:00 - 22:00 น."
            />
          </div>
        </div>

        {/* Store Tax & Legal Info (For Official Tax Invoices) */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-sm text-stone-900">
              {language === 'th' ? 'ข้อมูลภาษีและที่อยู่ร้านค้า (สำหรับออกใบกำกับภาษีเต็มรูป)' : 'Store Tax & Legal Invoice Information'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
                {language === 'th' ? 'ชื่อนิติบุคคล / ชื่อผู้ประกอบการจดทะเบียน (Legal Name)' : 'Legal Registered Company Name'}
              </label>
              <input
                type="text"
                value={formData.companyLegalName || ''}
                onChange={(e) => setFormData({ ...formData, companyLegalName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
                placeholder="เช่น บริษัท คาเฟ่ ออเดอร์ (ไทยแลนด์) จำกัด"
              />
            </div>

            <div>
              <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
                {language === 'th' ? 'เบอร์โทรศัพท์ร้านค้า (Phone for Tax Invoice)' : 'Official Phone Number'}
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
                placeholder="เช่น 02-123-4567 หรือ 081-234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
                {language === 'th' ? 'เลขประจำตัวผู้เสียภาษีอากร 13 หลัก (Tax ID)' : 'Store Tax ID (13 digits)'}
              </label>
              <input
                type="text"
                maxLength={13}
                value={formData.taxId || ''}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-mono font-bold text-sm"
                placeholder="0105566012345"
              />
            </div>

            <div>
              <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
                {language === 'th' ? 'สาขาที่ (Branch)' : 'Branch Info'}
              </label>
              <input
                type="text"
                value={formData.branchNumber || ''}
                onChange={(e) => setFormData({ ...formData, branchNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm"
                placeholder="00000 (สำนักงานใหญ่)"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-stone-800 text-xs sm:text-sm mb-1.5">
              {language === 'th' ? 'ที่อยู่ร้านค้าตามทะเบียนภาษี (Store Address)' : 'Official Registered Address'}
            </label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium"
              placeholder="123/45 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('save', language)}</span>
          </button>
        </div>
      </form>

      {/* Staff Session & Logout Card */}
      {user && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg">
              {user.email ? user.email.slice(0, 1).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-stone-900 text-sm sm:text-base">
                  {user.email || 'Staff User'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  {language === 'th' ? 'เข้าสู่ระบบแล้ว (Active)' : 'Logged In (Active)'}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                {language === 'th' ? 'สิทธิ์การเข้าถึง: จัดการร้านค้า, ครัว KDS, เมนู และการ์ด QR โต๊ะ' : 'Access Permissions: Store Management, Kitchen KDS, Menus & Table QRs'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-red-200/60"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'th' ? 'ออกจากระบบสำหรับทางร้าน' : 'Logout Staff Portal'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
