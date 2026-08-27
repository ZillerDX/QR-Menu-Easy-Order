import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, ExternalLink, ChevronDown, Check, Store, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const base = window.location.origin + window.location.pathname;
    return `${base}?table=${table}&lang=${language}`;
  };

  const currentUrl = getTableUrl(selectedTable);

  useEffect(() => {
    if (canvasRef.current && currentUrl) {
      QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1c1917',
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

  const tableList = Array.from({ length: storeConfig.tableCount }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Header Info with Ultra-Modern Custom Dropdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500 flex-shrink-0" />
            {t('qrTitle', language)}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('qrSubtitle', language)}
          </p>
        </div>

        {/* Custom Interactive Table Selector Dropdown & Step Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Prev/Next Quick Navigation Buttons */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
            <button
              type="button"
              onClick={handlePrevTable}
              disabled={parseInt(selectedTable, 10) <= 1}
              className="p-1.5 rounded-xl hover:bg-white text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
              title="Previous Table"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextTable}
              disabled={parseInt(selectedTable, 10) >= storeConfig.tableCount}
              className="p-1.5 rounded-xl hover:bg-white text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
              title="Next Table"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Popover Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border bg-orange-50/90 hover:bg-orange-100/80 text-orange-950 font-black text-xs sm:text-sm shadow-2xs transition-all duration-200 cursor-pointer active:scale-95 ${
                isDropdownOpen
                  ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-100'
                  : 'border-orange-200/90'
              }`}
            >
              <Store className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>{language === 'th' ? `โต๊ะ ${selectedTable}` : `Table ${selectedTable}`}</span>
              <ChevronDown
                className={`w-4 h-4 text-orange-600 transition-transform duration-200 flex-shrink-0 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Popover Card */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/90 p-3.5 z-50 animate-pop-in space-y-2.5">
                <div className="flex items-center justify-between px-1 pb-2 border-b border-stone-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                    {language === 'th' ? 'เลือกหมายเลขโต๊ะ' : 'Select Table'}
                  </span>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    {storeConfig.tableCount} {language === 'th' ? 'โต๊ะ' : 'Tables'}
                  </span>
                </div>

                {/* Table Numbers Grid */}
                <div className="grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto p-0.5">
                  {tableList.map((tNum) => {
                    const isSelected = selectedTable === tNum;
                    return (
                      <button
                        key={tNum}
                        type="button"
                        onClick={() => {
                          setSelectedTable(tNum);
                          setIsDropdownOpen(false);
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-[1.03]'
                            : 'bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-950 border border-stone-200/70'
                        }`}
                      >
                        <span>{tNum}</span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Preview Card & Quick Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Printable Card Preview (Styled like Table Stand) */}
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-100/90 shadow-xl flex flex-col items-center text-center space-y-5 relative overflow-hidden print:border-none print:shadow-none hover:shadow-2xl transition-shadow duration-300">
          <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white py-4 px-5 rounded-2xl shadow-md">
            <h3 className="font-black text-xl tracking-wide">
              {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
            </h3>
            <p className="text-xs text-orange-100 font-medium mt-0.5">
              {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-stone-100 rounded-3xl shadow-inner group">
            <canvas ref={canvasRef} className="rounded-2xl mx-auto transition-transform duration-300 group-hover:scale-102" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-400 uppercase tracking-wider">
              TABLE NUMBER
            </div>
            <div className="text-4xl font-black text-stone-900 tracking-tight">
              {language === 'th' ? `โต๊ะ ${selectedTable}` : `Table ${selectedTable}`}
            </div>
          </div>

          <div className="text-xs text-stone-600 max-w-xs leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100 font-medium">
            {t('qrScanInstruction', language)}
          </div>
        </div>

        {/* Actions & Instructions */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-3">
            <h4 className="font-black text-stone-900 text-sm">
              {language === 'th' ? 'สั่งพิมพ์หรือบันทึกรูปภาพ' : 'Print & Export Options'}
            </h4>
            
            <div className="space-y-2.5">
              <button
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('qrDownloadBtn', language)} {selectedTable}</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('qrPrintBtn', language)}</span>
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-orange-50/60 hover:border-orange-200 text-stone-700 hover:text-orange-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-orange-500" />
                <span>{t('qrOpenTestBtn', language)}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
