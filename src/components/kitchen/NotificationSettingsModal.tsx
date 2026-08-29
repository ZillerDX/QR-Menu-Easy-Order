import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  Check, 
  X, 
  Play
} from 'lucide-react';
import { Language } from '../../types';
import { soundService, SoundPreset } from '../../utils/sound';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onTestChime?: (preset: SoundPreset) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onTestChime,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<SoundPreset>('cheerful');
  const [playingId, setPlayingId] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      const savedPreset = localStorage.getItem('pos_sound_preset') as SoundPreset;
      if (savedPreset) setSelectedPreset(savedPreset);
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: SoundPreset) => {
    setSelectedPreset(preset);
    try {
      localStorage.setItem('pos_sound_preset', preset);
    } catch {
      // ignore
    }
    setPlayingId(preset);
    soundService.initCtx();
    soundService.playNewOrderChime(preset);
    onTestChime?.(preset);
    setTimeout(() => setPlayingId(null), 850);
  };

  const soundOptions: { id: SoundPreset; nameTh: string; nameEn: string; descTh: string; descEn: string; emoji: string }[] = [
    {
      id: 'cheerful',
      nameTh: 'เมโลดี้สดใส (Cheerful Melody)',
      nameEn: 'Cheerful Melody',
      descTh: 'เสียง 4 คอร์ดประสาน นุ่มนวล ชัดเจน ฟังสบาย',
      descEn: 'Harmonic 4-note chord, warm and pleasant',
      emoji: '🎵',
    },
    {
      id: 'service_bell',
      nameTh: 'กระดิ่งร้านอาหาร (Service Bell)',
      nameEn: 'Restaurant Service Bell',
      descTh: 'เสียงกริ่งสไตล์คาเฟ่คลาสสิก ดังกังวานชัดเจน',
      descEn: 'Classic cafe ding-dong bell chime',
      emoji: '🛎️',
    },
    {
      id: 'marimba_breeze',
      nameTh: 'มาริมบ้าคาเฟ่ (Cafe Marimba)',
      nameEn: 'Cafe Marimba Breeze',
      descTh: 'เสียงเคาะไม้อะคูสติก นุ่มนวล ฟังสบายเป็นธรรมชาติ',
      descEn: 'Warm acoustic wooden chime, pleasant & organic',
      emoji: '🪵',
    },
    {
      id: 'counter_ding',
      nameTh: 'กริ่งคู่เคาน์เตอร์ (Counter Ding)',
      nameEn: 'Counter Double Ding',
      descTh: 'เสียงกริ่งคู่โทนสูง คมชัด กังวานได้ยินชัดเจน',
      descEn: 'Crisp high-clarity double ping chime',
      emoji: '🔔',
    },
    {
      id: 'cozy_fanfare',
      nameTh: 'แฟนแฟร์ฉลอง (Cozy Fanfare)',
      nameEn: 'Cozy Cafe Fanfare',
      descTh: 'เมโลดี้เฉลิมฉลองอารมณ์ดี สำหรับออเดอร์ใหม่',
      descEn: 'Uplifting fanfare melody for celebratory orders',
      emoji: '🎺',
    },
    {
      id: 'kitchen_alert',
      nameTh: 'เสียงเตือนในครัว (Kitchen Alert)',
      nameEn: 'Kitchen Pulse Alert',
      descTh: 'เสียงเตือน 2 จังหวะความถี่สูง เหมาะกับครัวที่เสียงดัง',
      descEn: 'High-clarity dual-pulse chime for loud kitchens',
      emoji: '⚡',
    },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[92vh]">
        
        {/* Top Header Card */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between flex-shrink-0 bg-[#fffdfa]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-200 text-orange-600 flex items-center justify-center shadow-2xs flex-shrink-0">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base sm:text-lg tracking-tight">
                {language === 'th' ? 'เลือกรูปแบบเสียงเตือนออเดอร์' : 'Order Notification Sounds'}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {language === 'th' ? 'เลือกเสียงที่เหมาะกับบรรยากาศในร้านของคุณ' : 'Choose the chime tone that fits your cafe'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer active:scale-95 flex-shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body with 6 Sound Choices */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
              {language === 'th' ? 'รูปแบบเสียงเตือน (6 สไตล์)' : 'Sound Chime Presets (6 Styles)'}
            </label>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'th' ? 'เปิดเสียงตลอดเวลา' : 'Always Active'}
            </span>
          </div>
          
          <div className="space-y-2.5">
            {soundOptions.map((opt) => {
              const isSelected = selectedPreset === opt.id;
              const isPlayingThis = playingId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectPreset(opt.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-stone-200/80 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-50 shadow-2xs'
                  }`}
                >
                  {/* Left: Radio check indicator + Emoji Squircle + Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Radio Circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-stone-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>

                    {/* Emoji Badge */}
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-base shadow-2xs flex-shrink-0">
                      {opt.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-stone-900 truncate">
                          {language === 'th' ? opt.nameTh : opt.nameEn}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug truncate font-medium">
                        {language === 'th' ? opt.descTh : opt.descEn}
                      </p>
                    </div>
                  </div>

                  {/* Right: Tactile Preview Play Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPreset(opt.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-black transition cursor-pointer active:scale-90 flex-shrink-0 shadow-2xs ${
                      isPlayingThis
                        ? 'bg-orange-500 border-orange-600 text-white shadow-orange-500/30'
                        : 'bg-white hover:bg-orange-50 hover:border-orange-300 text-orange-600 border-stone-200/90'
                    }`}
                    title="Play Preview"
                  >
                    <Play className={`w-3.5 h-3.5 ${isPlayingThis ? 'fill-white' : 'fill-orange-600'}`} />
                    <span>{language === 'th' ? 'ฟังเสียง' : 'Play'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-200 text-stone-700 font-black transition text-xs sm:text-sm cursor-pointer active:scale-95"
          >
            {language === 'th' ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black shadow-lg shadow-orange-500/25 transition text-xs sm:text-sm cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{language === 'th' ? 'บันทึกและเสร็จสิ้น' : 'Save & Done'}</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
