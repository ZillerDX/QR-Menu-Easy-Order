import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, ExternalLink, Sparkles } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';

interface QRGeneratorProps {
  storeConfig: StoreConfig;
  language: Language;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ storeConfig, language }) => {
  const [selectedTable, setSelectedTable] = useState('01');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500" />
            {t('qrTitle', language)}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('qrSubtitle', language)}
          </p>
        </div>

        {/* Table Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-700">
            {t('qrSelectTable', language)}
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:border-orange-500 shadow-2xs"
          >
            {Array.from({ length: storeConfig.tableCount }, (_, i) => {
              const tNum = (i + 1).toString().padStart(2, '0');
              return (
                <option key={tNum} value={tNum}>
                  {language === 'th' ? `โต๊ะ ${tNum}` : `Table ${tNum}`}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Grid: Preview Card & Quick Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Printable Card Preview (Styled like Table Stand) */}
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-lg flex flex-col items-center text-center space-y-5 relative overflow-hidden print:border-none print:shadow-none">
          <div className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-4 rounded-2xl shadow-sm">
            <h3 className="font-black text-lg tracking-wide">
              {language === 'th' ? storeConfig.name : storeConfig.nameEn}
            </h3>
            <p className="text-[11px] text-orange-100 font-medium">
              {language === 'th' ? storeConfig.tagline : storeConfig.taglineEn}
            </p>
          </div>

          <div className="p-3 bg-white border-2 border-stone-100 rounded-2xl shadow-inner">
            <canvas ref={canvasRef} className="rounded-xl mx-auto" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-400 uppercase tracking-wider">
              TABLE NUMBER
            </div>
            <div className="text-4xl font-black text-stone-900 tracking-tight">
              {language === 'th' ? `โต๊ะ ${selectedTable}` : `Table ${selectedTable}`}
            </div>
          </div>

          <div className="text-[11px] text-stone-600 max-w-xs leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-100 font-medium">
            {t('qrScanInstruction', language)}
          </div>
        </div>

        {/* Actions & Instructions */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
            <h4 className="font-bold text-stone-900 text-sm">
              {language === 'th' ? 'สั่งพิมพ์หรือบันทึกรูปภาพ' : 'Print & Export Options'}
            </h4>
            
            <div className="space-y-2.5">
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>{t('qrDownloadBtn', language)} {selectedTable}</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{t('qrPrintBtn', language)}</span>
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
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
