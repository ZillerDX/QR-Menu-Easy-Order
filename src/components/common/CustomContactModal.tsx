import React from 'react';
import { X, ExternalLink, Sparkles, Building2, MessageSquare } from 'lucide-react';
import { Language } from '../../types';

interface CustomContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const CustomContactModal: React.FC<CustomContactModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const LINKEDIN_URL = 'https://www.linkedin.com/in/tanathon-chanapha-452177427/';
  const GITHUB_URL = 'https://github.com/ZillerDX';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <Building2 className="w-6 h-6 text-white" />
          </div>

          <h3 className="font-black text-lg sm:text-xl">
            {language === 'th' ? 'ต้องการมากกว่า 50 โต๊ะ?' : 'Need More Than 50 Tables?'}
          </h3>
          <p className="text-xs text-orange-100 mt-1 font-medium">
            {language === 'th'
              ? 'ระบบ Custom Enterprise สำหรับร้านอาหารขนาดใหญ่ & แฟรนไชส์'
              : 'Custom Enterprise System for Large Dining & Franchises'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 text-xs text-stone-700 leading-relaxed font-medium space-y-2">
            <div className="flex items-center gap-1.5 font-black text-orange-950 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>{language === 'th' ? 'ระบบมาตรฐานรองรับสูงสุด 50 โต๊ะ' : 'Standard Edition Supports up to 50 Tables'}</span>
            </div>
            <p>
              {language === 'th'
                ? 'หากร้านของคุณมีจำนวนโต๊ะมากกว่า 50 โต๊ะ, มีหลายโซน/หลายชั้น หรือต้องการระบบ Custom ขยายโครงสร้างพื้นฐาน สามารถ Inbox ติดต่อผู้พัฒนาได้โดยตรง:'
                : 'If your establishment has more than 50 tables, multiple dining zones/floors, or requires custom architecture, contact the developer directly:'}
            </p>
          </div>

          {/* Contact Links */}
          <div className="space-y-3">
            {/* LinkedIn */}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full p-4 rounded-2xl bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center justify-between transition shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-base">
                  in
                </div>
                <div className="text-left">
                  <div className="font-black text-xs sm:text-sm">Tanathon Chanapha</div>
                  <div className="text-[11px] text-white/80">LinkedIn Profile (Direct Message)</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* GitHub Profile */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full p-4 rounded-2xl bg-stone-900 hover:bg-black text-white flex items-center justify-between transition shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-base">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-black text-xs sm:text-sm">GitHub: @ZillerDX</div>
                  <div className="text-[11px] text-white/80">Project Repository & Profile</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition cursor-pointer"
          >
            {language === 'th' ? 'เข้าใจแล้ว (ใช้สูงสุด 50 โต๊ะ)' : 'Understood (Use up to 50 tables)'}
          </button>
        </div>
      </div>
    </div>
  );
};
