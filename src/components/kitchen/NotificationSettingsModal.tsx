import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  X, 
  Play, 
  Laptop, 
  ShieldCheck, 
  Smartphone, 
  Vibrate, 
  Music
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
  const [isMuted, setIsMuted] = useState(!soundService.isSoundEnabled());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    try {
      const savedPreset = localStorage.getItem('pos_sound_preset') as SoundPreset;
      if (savedPreset) setSelectedPreset(savedPreset);
    } catch {
      // ignore
    }

    if (!('Notification' in window)) {
      setBrowserPermission('unsupported');
    } else {
      setBrowserPermission(Notification.permission);
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
    soundService.playNewOrderChime(preset);
    onTestChime?.(preset);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setSoundEnabled(!nextMuted);
    if (!nextMuted) {
      soundService.playNewOrderChime(selectedPreset);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await soundService.requestNotificationPermission();
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
    if (granted) {
      soundService.showDesktopNotification(
        language === 'th' ? '🔔 เปิดการแจ้งเตือนสำเร็จ!' : '🔔 Notifications Enabled!',
        language === 'th' ? 'คุณจะได้รับการแจ้งเตือนทันทีเมื่อมีออเดอร์ใหม่เข้า แม้พับหน้าจอ' : 'You will receive alerts for new orders even when minimized'
      );
    }
  };

  const soundOptions: { id: SoundPreset; nameTh: string; nameEn: string; descTh: string; descEn: string; icon: string }[] = [
    {
      id: 'cheerful',
      nameTh: '🎵 เมโลดี้สดใส (Cheerful Melody)',
      nameEn: '🎵 Cheerful Melody',
      descTh: 'เสียง 4 คอร์ดประสาน นุ่มนวล ชัดเจน ฟังสบาย',
      descEn: 'Harmonic 4-note chord, warm and pleasant',
      icon: '✨',
    },
    {
      id: 'service_bell',
      nameTh: '🛎️ กระดิ่งร้านอาหาร (Service Bell)',
      nameEn: '🛎️ Restaurant Service Bell',
      descTh: 'เสียงกริ่งสไตล์คาเฟ่คลาสสิก ดังกังวานชัดเจน',
      descEn: 'Classic cafe ding-dong bell chime',
      icon: '🛎️',
    },
    {
      id: 'kitchen_alert',
      nameTh: '🚨 เสียงเตือนในครัว (Kitchen Alert)',
      nameEn: '🚨 Kitchen Pulse Alert',
      descTh: 'เสียงเตือน 2 จังหวะความถี่สูง เหมาะกับครัวที่เสียงดัง',
      descEn: 'High-clarity dual-pulse chime for loud kitchens',
      icon: '⚡',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base">
                {language === 'th' ? 'การตั้งค่าเสียงและการแจ้งเตือน' : 'Notification & Sound Settings'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'th' ? 'ปรับแต่งเสียงเตือนออเดอร์ใหม่และป๊อปอัป' : 'Customize sound chimes & desktop alerts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Mute / Unmute Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                !isMuted ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
              }`}>
                {!isMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-stone-900">
                  {language === 'th' ? 'เสียงแจ้งเตือนออเดอร์' : 'Order Sound Alerts'}
                </h4>
                <p className="text-[11px] text-stone-500">
                  {!isMuted
                    ? (language === 'th' ? 'เปิดเสียงอยู่ (มีเสียงเตือนเมื่อมีออเดอร์เข้า)' : 'Sound is active')
                    : (language === 'th' ? 'ปิดเสียงอยู่ (โหมดเงียบ)' : 'Sound is muted')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleMute}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs ${
                !isMuted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
              }`}
            >
              {!isMuted ? (language === 'th' ? 'เปิดอยู่' : 'Enabled') : (language === 'th' ? 'ปิดอยู่' : 'Muted')}
            </button>
          </div>

          {/* Sound Presets */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
              {language === 'th' ? 'เลือกรูปแบบเสียงแจ้งเตือน' : 'Select Sound Tone'}
            </label>
            
            <div className="space-y-2">
              {soundOptions.map((opt) => {
                const isSelected = selectedPreset === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectPreset(opt.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-stone-900">
                          {language === 'th' ? opt.nameTh : opt.nameEn}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-orange-500 text-white px-2 py-0.2 rounded-full font-black">
                            {language === 'th' ? 'ใช้งานอยู่' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {language === 'th' ? opt.descTh : opt.descEn}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPreset(opt.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-black flex items-center gap-1 transition flex-shrink-0 cursor-pointer active:scale-95 shadow-2xs"
                      title="Test Tone"
                    >
                      <Play className="w-3 h-3 fill-orange-700 text-orange-700" />
                      <span>{language === 'th' ? 'ฟังเสียง' : 'Play'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browser Desktop Push Notification Permission */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-stone-600" />
                <span className="text-xs font-black text-stone-900">
                  {language === 'th' ? 'การแจ้งเตือนบนหน้าจอ (Desktop Alert)' : 'Desktop Push Notifications'}
                </span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                browserPermission === 'granted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : browserPermission === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {browserPermission === 'granted'
                  ? (language === 'th' ? '✓ อนุญาตแล้ว' : 'Granted')
                  : browserPermission === 'denied'
                  ? (language === 'th' ? '✕ ถูกบล็อก' : 'Blocked')
                  : (language === 'th' ? '⏳ ยังไม่เปิด' : 'Not Enabled')}
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              {language === 'th'
                ? 'แจ้งเตือนป๊อปอัปแม้สลับไปใช้งานโปรแกรมอื่นหรือพับแท็บเบราว์เซอร์'
                : 'Receive OS popup alerts even when using other apps or minimized'}
            </p>

            {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs mt-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'th' ? 'เปิดใช้งานการแจ้งเตือนบนหน้าจอ' : 'Enable Desktop Notifications'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition cursor-pointer active:scale-95 shadow-sm shadow-orange-500/20"
          >
            {language === 'th' ? 'เสร็จสิ้น' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
