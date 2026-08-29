import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  X, 
  Play, 
  Radio
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
  const [isSoundOn, setIsSoundOn] = useState<boolean>(soundService.isSoundEnabled());
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedPreset = localStorage.getItem('pos_sound_preset') as SoundPreset;
      if (savedPreset) setSelectedPreset(savedPreset);
      setIsSoundOn(soundService.isSoundEnabled());
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
    setTimeout(() => setPlayingId(null), 800);
  };

  const handleToggleSound = () => {
    const nextState = !isSoundOn;
    setIsSoundOn(nextState);
    soundService.setSoundEnabled(nextState);
    if (nextState) {
      soundService.initCtx();
      soundService.playNewOrderChime(selectedPreset);
    }
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
      id: 'kitchen_alert',
      nameTh: 'เสียงเตือนในครัว (Kitchen Alert)',
      nameEn: 'Kitchen Pulse Alert',
      descTh: 'เสียงเตือน 2 จังหวะความถี่สูง เหมาะกับครัวที่เสียงดัง',
      descEn: 'High-clarity dual-pulse chime for loud kitchens',
      emoji: '⚡',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] max-w-md w-full border border-white/60 shadow-[0_25px_60px_rgba(0,0,0,0.18)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className="p-5 sm:p-6 pb-4 border-b border-stone-200/50 flex items-center justify-between bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-600 flex items-center justify-center shadow-2xs flex-shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base sm:text-lg tracking-tight">
                {language === 'th' ? 'การตั้งค่าเสียงเตือนออเดอร์' : 'Order Notification Sounds'}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {language === 'th' ? 'ปรับแต่งเสียงเตือนเมื่อมีออเดอร์ใหม่เข้ามา' : 'Customize sound chimes for incoming orders'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300/80 text-stone-600 hover:text-stone-900 flex items-center justify-center transition cursor-pointer active:scale-95 flex-shrink-0 backdrop-blur-md"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* 1. Master Audio Switch (Glass Switch Card) */}
          <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-stone-200/60 transition hover:bg-white/80 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isSoundOn ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20' : 'bg-stone-200/70 text-stone-500'
              }`}>
                {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 leading-tight">
                  {language === 'th' ? 'เสียงแจ้งเตือนออเดอร์' : 'Order Sound Alerts'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  {isSoundOn
                    ? (language === 'th' ? 'เปิดเสียงอยู่ (มีเสียงเตือนเมื่อมีออเดอร์เข้า)' : 'Sound alert is active')
                    : (language === 'th' ? 'ปิดเสียงอยู่ (โหมดเงียบ)' : 'Sound is muted')}
                </p>
              </div>
            </div>

            {/* iOS Style Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-13 h-7.5 rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer flex-shrink-0 relative ${
                isSoundOn ? 'bg-emerald-500 shadow-xs shadow-emerald-500/30' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                  isSoundOn ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Sound Preset Selection (Glass Radio Cards) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
              {language === 'th' ? 'เลือกรูปแบบเสียงแจ้งเตือน' : 'Select Sound Tone'}
            </label>
            
            <div className="space-y-2">
              {soundOptions.map((opt) => {
                const isSelected = selectedPreset === opt.id;
                const isPlayingThis = playingId === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectPreset(opt.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 select-none backdrop-blur-xl ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/12 ring-2 ring-orange-500/25 shadow-xs'
                        : 'border-stone-200/60 bg-white/70 hover:border-stone-300 hover:bg-white/90 shadow-2xs'
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
                      <div className="w-9 h-9 rounded-xl bg-white/90 border border-stone-200/60 flex items-center justify-center text-base shadow-2xs flex-shrink-0">
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
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer active:scale-90 flex-shrink-0 shadow-2xs ${
                        isPlayingThis
                          ? 'bg-orange-500 border-orange-600 text-white'
                          : 'bg-white/80 hover:bg-orange-50 hover:border-orange-300 text-orange-600 border-stone-200/90'
                      }`}
                      title="Play Preview"
                    >
                      <Play className={`w-4 h-4 ${isPlayingThis ? 'fill-white' : 'fill-orange-600'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white/60 backdrop-blur-xl border-t border-stone-200/50 flex items-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black transition cursor-pointer active:scale-[0.98] shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'th' ? 'บันทึกและเสร็จสิ้น' : 'Save & Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
