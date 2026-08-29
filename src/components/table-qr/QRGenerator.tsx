import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, ExternalLink, ChevronDown, Store, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';

interface QRGeneratorProps {
  storeConfig: StoreConfig;
  language: Language;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ storeConfig, language }) => {
  const [selectedTable, setSelectedTable] = useState('01');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const getTableUrl = (table: string) => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    let pathname = window.location.pathname;
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    const shopSlug = storeConfig.id || 'cafe-order';
    return `${origin}${pathname}?shop=${shopSlug}&table=${table}&lang=${language}`;
  };

  const currentUrl = getTableUrl(selectedTable);

  useEffect(() => {
    if (canvasRef.current && currentUrl) {
      QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      QRCode.toDataURL(currentUrl, {
        width: 600,
        margin: 2,
      }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [selectedTable, currentUrl, language]);

  // Click outside listener for table dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Menu_Table_${selectedTable}.png`;
    a.click();
    document.body.removeChild(a);
  };

  const handlePrevTable = () => {
    const currentNum = parseInt(selectedTable, 10);
    if (currentNum > 1) {
      setSelectedTable((currentNum - 1).toString().padStart(2, '0'));
    }
  };

  const handleNextTable = () => {
    const currentNum = parseInt(selectedTable, 10);
    if (currentNum < storeConfig.tableCount) {
      setSelectedTable((currentNum + 1).toString().padStart(2, '0'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Header Info with Ultra-Modern Custom Dropdown (Hidden on Print) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden no-print">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500 flex-shrink-0" />
            {t('qrTitle', language)}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('qrSubtitle', language)}
          </p>
        </div>

        {/* Quick Table Switcher Bar with Steppers */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handlePrevTable}
            disabled={parseInt(selectedTable, 10) <= 1}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-700 rounded-2xl transition cursor-pointer disabled:cursor-not-allowed"
            title="Previous Table"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Custom Dropdown Trigger */}
          <div className="relative flex-1 md:w-56" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-2xl text-xs font-black text-stone-800 flex items-center justify-between transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-orange-500" />
                <span>{selectedTable === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${selectedTable}`}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Dropdown Menu Items */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200/90 p-1.5 z-50 max-h-60 overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-150 space-y-0.5">
                {Array.from({ length: storeConfig.tableCount }, (_, i) => {
                  const numStr = (i + 1).toString().padStart(2, '0');
                  const isSelected = selectedTable === numStr;
                  return (
                    <button
                      key={numStr}
                      type="button"
                      onClick={() => {
                        setSelectedTable(numStr);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{t('table', language)} {numStr}</span>
                      {isSelected && <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
                    </button>
                  );
                })}

                <div className="border-t border-stone-100 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTable('TAKEAWAY');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                      selectedTable === 'TAKEAWAY'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{t('takeaway', language)}</span>
                    {selectedTable === 'TAKEAWAY' && <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextTable}
            disabled={parseInt(selectedTable, 10) >= storeConfig.tableCount}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-700 rounded-2xl transition cursor-pointer disabled:cursor-not-allowed"
            title="Next Table"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security & Customer Shield Banner (Hidden on Print) */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs print:hidden no-print">
        <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-emerald-950 text-xs sm:text-sm">
            {language === 'th' ? '🔒 ปลอดภัยสูงสุด: QR Code นี้ล็อคสิทธิ์เฉพาะลูกค้า (Customer-Only Link)' : '🔒 100% Protected: Customer-Only Link'}
          </h4>
          <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
            {language === 'th'
              ? 'เมื่อลูกค้าสแกน QR Code ประจำโต๊ะ ระบบจะเปิดเฉพาะหน้าเมนู สั่งอาหาร และติดตามสถานะบิลเท่านั้น แถบเมนูควบคุมร้านและฟังก์ชันหลังร้านทั้งหมดจะถูกซ่อนอย่างสมบูรณ์แบบ'
              : 'When customers scan this QR, they will only see the dining menu, cart, and live order tracker. All admin controls and management docks are strictly hidden.'}
          </p>
        </div>
      </div>

      {/* Grid: Preview Card & Quick Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Printable Card Stand Preview */}
        <div className="table-qr-print-container bg-white rounded-3xl p-8 border-2 border-orange-100/90 shadow-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden print:border-2 print:border-black print:shadow-none hover:shadow-2xl transition-shadow duration-300">
          <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white py-3.5 px-5 rounded-2xl shadow-md print:bg-none print:text-black print:border-b-2 print:border-black">
            <h3 className="font-black text-xl tracking-wide print:text-black">
              {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
            </h3>
            <p className="text-xs text-orange-100 print:text-black font-medium mt-0.5">
              {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
            </p>
          </div>

          <div className="p-3 bg-white border-2 border-stone-100 print:border-black rounded-3xl shadow-inner group">
            <canvas ref={canvasRef} className="rounded-2xl mx-auto" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-400 print:text-black uppercase tracking-wider">
              TABLE NUMBER
            </div>
            <div className="text-4xl font-black text-stone-900 print:text-black tracking-tight">
              {language === 'th' ? `โต๊ะ ${selectedTable}` : `Table ${selectedTable}`}
            </div>
            <div className="text-[10px] text-stone-400 print:text-black font-mono break-all px-4 pt-1">
              {currentUrl}
            </div>
          </div>

          <div className="text-xs text-stone-600 print:text-black max-w-xs leading-relaxed bg-stone-50 print:bg-white p-3 rounded-2xl border border-stone-100 print:border-none font-medium">
            {t('qrScanInstruction', language)}
          </div>
        </div>

        {/* Actions & Instructions (Hidden on Print) */}
        <div className="space-y-4 print:hidden no-print">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-3">
            <h4 className="font-black text-stone-900 text-sm">
              {language === 'th' ? 'สั่งพิมพ์หรือบันทึกรูปภาพ' : 'Print & Export Options'}
            </h4>
            
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('qrDownloadBtn', language)} {selectedTable}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('qrPrintBtn', language)} (โต๊ะ {selectedTable})</span>
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-orange-50/60 hover:border-orange-200 text-stone-700 hover:text-orange-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-orange-500" />
                <span>{t('qrOpenTestBtn', language)} ({selectedTable})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
