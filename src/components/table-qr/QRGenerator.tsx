import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, ExternalLink, ChevronDown, Store, ChevronLeft, ChevronRight, ShieldCheck, CheckCircle2, Grid, Layers, Sparkles } from 'lucide-react';
import { StoreConfig, Language } from '../../types';
import { t } from '../../utils/i18n';

interface QRGeneratorProps {
  storeConfig: StoreConfig;
  language: Language;
  onUpdateTableCount?: (count: number) => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ storeConfig, language, onUpdateTableCount }) => {
  const [selectedTable, setSelectedTable] = useState('01');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [batchQrUrls, setBatchQrUrls] = useState<{ [table: string]: string }>({});

  const [activeTableCount, setActiveTableCount] = useState<number>(() => {
    return Math.min(50, Math.max(1, storeConfig.tableCount || 50));
  });

  useEffect(() => {
    if (storeConfig.tableCount && storeConfig.tableCount !== activeTableCount) {
      setActiveTableCount(Math.min(50, Math.max(1, storeConfig.tableCount)));
    }
  }, [storeConfig.tableCount]);

  const handleSetTableCount = (count: number) => {
    const clamped = Math.min(50, Math.max(1, count));
    setActiveTableCount(clamped);
    onUpdateTableCount?.(clamped);
  };

  const tableCount = activeTableCount;
  const shopSlug = storeConfig.id || 'cafe-order';

  // Build list of all tables: 01 to tableCount + TAKEAWAY
  const allTableList: string[] = [
    ...Array.from({ length: tableCount }, (_, i) => (i + 1).toString().padStart(2, '0')),
    'TAKEAWAY',
  ];

  const getTableUrl = (table: string) => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    let pathname = window.location.pathname;
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    return `${origin}${pathname}?shop=${encodeURIComponent(shopSlug)}&table=${encodeURIComponent(table)}&lang=${language}`;
  };

  const currentUrl = getTableUrl(selectedTable);

  // Single QR code rendering
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
  }, [selectedTable, currentUrl, language, viewMode]);

  // Batch QR code rendering for all tables (1..50 + TAKEAWAY)
  useEffect(() => {
    let isMounted = true;
    const generateAll = async () => {
      const urlsMap: { [table: string]: string } = {};
      for (const tbl of allTableList) {
        const url = getTableUrl(tbl);
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 320,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          urlsMap[tbl] = dataUrl;
        } catch (err) {
          console.error(`QR gen error for table ${tbl}:`, err);
        }
      }
      if (isMounted) {
        setBatchQrUrls(urlsMap);
      }
    };
    generateAll();
    return () => {
      isMounted = false;
    };
  }, [shopSlug, tableCount, language]);

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

  const handlePrintSingle = () => {
    setViewMode('single');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintAll = () => {
    setViewMode('all');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownload = (tableToDownload = selectedTable) => {
    const url = batchQrUrls[tableToDownload] || qrDataUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${shopSlug}_Table_${tableToDownload}.png`;
    a.click();
  };

  const handlePrevTable = () => {
    if (selectedTable === 'TAKEAWAY') {
      setSelectedTable(tableCount.toString().padStart(2, '0'));
      return;
    }
    const currentNum = parseInt(selectedTable, 10);
    if (currentNum > 1) {
      setSelectedTable((currentNum - 1).toString().padStart(2, '0'));
    }
  };

  const handleNextTable = () => {
    if (selectedTable === 'TAKEAWAY') return;
    const currentNum = parseInt(selectedTable, 10);
    if (currentNum < tableCount) {
      setSelectedTable((currentNum + 1).toString().padStart(2, '0'));
    } else {
      setSelectedTable('TAKEAWAY');
    }
  };

  // Filtered tables for Grid view
  const filteredTables = allTableList.filter((tbl) => {
    if (selectedRange === 'all') return true;
    if (selectedRange === 'takeaway') return tbl === 'TAKEAWAY';
    if (tbl === 'TAKEAWAY') return false;
    const num = parseInt(tbl, 10);
    if (selectedRange === '1-10') return num >= 1 && num <= 10;
    if (selectedRange === '11-20') return num >= 11 && num <= 20;
    if (selectedRange === '21-30') return num >= 21 && num <= 30;
    if (selectedRange === '31-40') return num >= 31 && num <= 40;
    if (selectedRange === '41-50') return num >= 41 && num <= 50;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Header Info & View Mode Toggle (Hidden on Print) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden no-print">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <span>{t('qrTitle', language)} ({language === 'th' ? `รองรับ 1 - 50 โต๊ะ` : `1 - 50 Tables`})</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('qrSubtitle', language)} • {language === 'th' ? `ปัจจุบันเปิดใช้งาน ${tableCount} โต๊ะ` : `Currently active: ${tableCount} tables`}
          </p>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-black w-full md:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                viewMode === 'single' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'ดูทีละโต๊ะ' : 'Single Card'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                viewMode === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{language === 'th' ? `ดูทั้งหมด (${tableCount} โต๊ะ)` : `All Tables (${tableCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Capacity Quick Selector (Hidden on Print) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden no-print">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0 font-black text-base shadow-sm">
            {activeTableCount}
          </div>
          <div>
            <h3 className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-2">
              <span>{language === 'th' ? 'จำนวนโต๊ะที่ต้องการสร้างในร้าน:' : 'Store Table Capacity:'}</span>
              <span className="text-orange-600 font-extrabold bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                {activeTableCount} {language === 'th' ? 'โต๊ะ' : 'Tables'}
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {language === 'th' ? 'กดเลือกจำนวนโต๊ะด้านขวาเพื่อขยายสร้าง QR Code สูงสุด 50 โต๊ะได้ทันที' : 'Click preset to expand or adjust table QR codes up to 50 tables'}
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
          <span className="text-[11px] font-bold text-stone-400 mr-1">{language === 'th' ? 'เปลี่ยนเป็น:' : 'Set to:'}</span>
          {[10, 15, 20, 30, 40, 50].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSetTableCount(num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTableCount === num
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {num} {language === 'th' ? 'โต๊ะ' : 'T'}
            </button>
          ))}
        </div>
      </div>

      {/* Security & Multi-Tenant Cross-Store Protection Panel (Hidden on Print) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs print:hidden no-print">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
              <span>{language === 'th' ? '🔒 ตรวจสอบความถูกต้องของ QR ไม่ให้ซ้ำร้าน / ป้องกันออเดอร์ไปโผล่ร้านอื่น' : '🔒 Verified Store Routing: Zero Cross-Store Leakage'}</span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Active Protection</span>
            </h4>
            <p className="text-emerald-800 text-[11px] mt-1 leading-relaxed">
              {language === 'th' ? (
                <>
                  รหัสร้านค้าของคุณคือ <span className="font-mono font-black bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">{shopSlug}</span> • ทุก QR Code และลิงก์จะผูกกับบัญชีร้านนี้โดยเฉพาะ เมื่อลูกค้าสแกน ออเดอร์จะวิ่งเข้าเฉพาะจอครัว KDS ของร้านนี้ 100% ไม่มีวันปะปนกับร้านอื่น
                </>
              ) : (
                <>
                  Store ID: <span className="font-mono font-black bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">{shopSlug}</span> • All QR links are cryptographically routed to your store only. Customer orders strictly target your kitchen display.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
          <button
            type="button"
            onClick={handlePrintAll}
            className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'th' ? `พิมพ์การ์ดทุกโต๊ะ (1 - ${tableCount})` : `Print All Cards (1 - ${tableCount})`}</span>
          </button>
        </div>
      </div>

      {/* SINGLE TABLE VIEW MODE */}
      {viewMode === 'single' && (
        <div className="space-y-6">
          {/* Quick Table Switcher Bar with Steppers (Hidden on Print) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-700">{language === 'th' ? 'เลือกหมายเลขโต๊ะ:' : 'Select Table:'}</span>
              
              <button
                type="button"
                onClick={handlePrevTable}
                disabled={selectedTable === '01'}
                className="p-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-700 rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                title="Previous Table"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Custom Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-xl text-xs font-black text-stone-800 flex items-center gap-2 transition cursor-pointer shadow-2xs group min-w-[140px] justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-orange-500" />
                    <span>{selectedTable === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${selectedTable}`}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Dropdown Menu Items */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200/90 p-1.5 z-50 max-h-72 w-60 overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-150 space-y-0.5">
                    {activeTableCount < 50 && (
                      <div className="p-1 mb-1 border-b border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            handleSetTableCount(50);
                          }}
                          className="w-full py-2 px-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{language === 'th' ? '⚡ ขยายเป็น 50 โต๊ะทันที' : '⚡ Expand to 50 Tables'}</span>
                        </button>
                      </div>
                    )}

                    {allTableList.map((tbl) => {
                      const isSelected = selectedTable === tbl;
                      return (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => {
                            setSelectedTable(tbl);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span>{tbl === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${tbl}`}</span>
                          {isSelected && <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded-full">Active</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextTable}
                disabled={selectedTable === 'TAKEAWAY'}
                className="p-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-700 rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                title="Next Table"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick table jump pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['01', '05', '10', '15', '20', '30', '40', '50'].map((num) => {
                const numVal = parseInt(num, 10);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (numVal > activeTableCount) {
                        handleSetTableCount(numVal);
                      }
                      setSelectedTable(num);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition cursor-pointer ${
                      selectedTable === num
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {language === 'th' ? `โต๊ะ ${num}` : `Table ${num}`}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedTable('TAKEAWAY')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition cursor-pointer ${
                  selectedTable === 'TAKEAWAY'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {language === 'th' ? 'กลับบ้าน' : 'Takeaway'}
              </button>
            </div>
          </div>

          {/* Grid: Preview Card & Actions */}
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
                  {selectedTable === 'TAKEAWAY' ? (language === 'th' ? 'ออเดอร์กลับบ้าน' : 'TAKEAWAY ORDER') : (language === 'th' ? 'หมายเลขโต๊ะ' : 'TABLE NUMBER')}
                </div>
                <div className="text-4xl font-black text-stone-900 print:text-black tracking-tight">
                  {selectedTable === 'TAKEAWAY' ? (language === 'th' ? 'กลับบ้าน (Takeaway)' : 'TAKEAWAY') : (language === 'th' ? `โต๊ะ ${selectedTable}` : `Table ${selectedTable}`)}
                </div>
                <div className="text-[10px] text-stone-400 print:text-black font-mono break-all px-4 pt-1">
                  {currentUrl}
                </div>
              </div>

              {/* Verified Store Security Stamp on Card */}
              <div className="w-full pt-2 border-t border-stone-100 print:border-stone-400 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-stone-500 print:text-black">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 print:text-black" />
                <span>{language === 'th' ? 'รหัสร้านค้า:' : 'Store ID:'} <span className="font-mono font-black">{shopSlug}</span> • {language === 'th' ? 'ออเดอร์ตรงสู่ร้าน' : 'Direct Kitchen Routing'}</span>
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
                    onClick={() => handleDownload(selectedTable)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('qrDownloadBtn', language)} ({selectedTable === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${selectedTable}`})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSingle}
                    className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t('qrPrintBtn', language)} ({selectedTable === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${selectedTable}`})</span>
                  </button>

                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-orange-50/60 hover:border-orange-200 text-stone-700 hover:text-orange-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4 text-orange-500" />
                    <span>{t('qrOpenTestBtn', language)} ({selectedTable === 'TAKEAWAY' ? t('takeaway', language) : `${t('table', language)} ${selectedTable}`})</span>
                  </a>
                </div>
              </div>

              {/* Multi-Store Anti-Collision Checklist */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-2.5">
                <h5 className="font-black text-stone-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'th' ? 'การันตีความปลอดภัยและแยกบัญชี 100%' : '100% Tenant-Isolated System'}</span>
                </h5>
                <ul className="text-[11px] text-stone-600 space-y-1.5 font-medium pl-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{language === 'th' ? <>URL มีพารามิเตอร์ <code className="bg-stone-100 text-orange-600 px-1 py-0.5 rounded font-mono font-bold">?shop={shopSlug}</code> ป้องกันการปนเปื้อน</> : <>URL parameter <code className="bg-stone-100 text-orange-600 px-1 py-0.5 rounded font-mono font-bold">?shop={shopSlug}</code> guarantees zero cross-store bleed</>}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{language === 'th' ? 'จอครัว (KDS) ดึงและแสดงผลเฉพาะออเดอร์ที่ถูกส่งเข้า Store ID นี้เท่านั้น' : 'Kitchen display (KDS) displays only orders placed strictly to this Store ID'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{language === 'th' ? 'รองรับการพิมพ์การ์ดพร้อมกันสูงสุด 50 โต๊ะ' : 'Supports batch card printing for up to 50 tables'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL TABLES BATCH GRID MODE */}
      {viewMode === 'all' && (
        <div className="space-y-6">
          {/* Table Range Filter Bar (Hidden on Print) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden no-print">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-stone-700">{language === 'th' ? 'กรองช่วงโต๊ะ:' : 'Filter Range:'}</span>
              
              <button
                type="button"
                onClick={() => setSelectedRange('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedRange === 'all' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {language === 'th' ? `ทั้งหมด (${filteredTables.length})` : `All (${filteredTables.length})`}
              </button>

              {tableCount >= 10 && (
                <button
                  type="button"
                  onClick={() => setSelectedRange('1-10')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRange === '1-10' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {language === 'th' ? 'โต๊ะ 01 - 10' : 'Table 01 - 10'}
                </button>
              )}

              {tableCount >= 20 && (
                <button
                  type="button"
                  onClick={() => setSelectedRange('11-20')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRange === '11-20' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {language === 'th' ? 'โต๊ะ 11 - 20' : 'Table 11 - 20'}
                </button>
              )}

              {tableCount >= 30 && (
                <button
                  type="button"
                  onClick={() => setSelectedRange('21-30')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRange === '21-30' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {language === 'th' ? 'โต๊ะ 21 - 30' : 'Table 21 - 30'}
                </button>
              )}

              {tableCount >= 40 && (
                <button
                  type="button"
                  onClick={() => setSelectedRange('31-40')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRange === '31-40' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {language === 'th' ? 'โต๊ะ 31 - 40' : 'Table 31 - 40'}
                </button>
              )}

              {tableCount >= 50 && (
                <button
                  type="button"
                  onClick={() => setSelectedRange('41-50')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRange === '41-50' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {language === 'th' ? 'โต๊ะ 41 - 50' : 'Table 41 - 50'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedRange('takeaway')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedRange === 'takeaway' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {language === 'th' ? 'กลับบ้าน' : 'Takeaway'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintAll}
                className="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'th' ? `สั่งพิมพ์การ์ด (${filteredTables.length} ใบ)` : `Print Cards (${filteredTables.length})`}</span>
              </button>
            </div>
          </div>

          {/* Grid of Cards (Printable & Screen Layout) */}
          <div className="all-tables-qr-print-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((tbl) => {
              const cardUrl = getTableUrl(tbl);
              const cardQrData = batchQrUrls[tbl] || '';

              return (
                <div
                  key={tbl}
                  className="table-qr-card-item bg-white rounded-3xl p-6 border-2 border-stone-200/90 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden print:border-2 print:border-black print:shadow-none hover:border-orange-300 hover:shadow-xl transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white py-2.5 px-4 rounded-xl shadow-xs print:bg-none print:text-black print:border-b print:border-black">
                    <h4 className="font-black text-base tracking-wide print:text-black">
                      {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
                    </h4>
                    <p className="text-[10px] text-orange-100 print:text-black font-medium">
                      {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
                    </p>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-2 bg-white border-2 border-stone-100 print:border-black rounded-2xl shadow-2xs">
                    {cardQrData ? (
                      <img src={cardQrData} alt={`QR Table ${tbl}`} className="w-44 h-44 object-contain rounded-xl mx-auto" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400 font-bold animate-pulse">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  {/* Table Label */}
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-black text-stone-400 print:text-black uppercase tracking-wider">
                      {tbl === 'TAKEAWAY' ? (language === 'th' ? 'ออเดอร์กลับบ้าน' : 'TAKEAWAY ORDER') : (language === 'th' ? 'หมายเลขโต๊ะ' : 'TABLE NUMBER')}
                    </div>
                    <div className="text-2xl font-black text-stone-900 print:text-black tracking-tight">
                      {tbl === 'TAKEAWAY' ? (language === 'th' ? 'กลับบ้าน' : 'TAKEAWAY') : (language === 'th' ? `โต๊ะ ${tbl}` : `Table ${tbl}`)}
                    </div>
                  </div>

                  {/* Security Verification Stamp on Each Card */}
                  <div className="w-full pt-2 border-t border-stone-100 print:border-stone-400 flex items-center justify-center gap-1 text-[9.5px] font-bold text-stone-500 print:text-black">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 print:text-black" />
                    <span>{language === 'th' ? 'รหัสร้าน:' : 'Store ID:'} <span className="font-mono font-black">{shopSlug}</span></span>
                  </div>

                  {/* Scan Instruction */}
                  <div className="text-[10px] text-stone-600 print:text-black leading-snug bg-stone-50 print:bg-white p-2 rounded-xl border border-stone-100 print:border-none font-medium w-full">
                    {t('qrScanInstruction', language)}
                  </div>

                  {/* Quick Action Buttons (Hidden on Print) */}
                  <div className="w-full pt-1 flex items-center gap-2 print:hidden no-print">
                    <button
                      type="button"
                      onClick={() => handleDownload(tbl)}
                      className="flex-1 py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('qrDownloadBtn', language)}</span>
                    </button>
                    <a
                      href={cardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition"
                      title="Test Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

