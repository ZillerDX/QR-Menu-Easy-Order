import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, Sparkles, Store, ExternalLink } from 'lucide-react';
import { StoreConfig } from '../../types';

interface QRGeneratorProps {
  storeConfig: StoreConfig;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ storeConfig }) => {
  const [selectedTable, setSelectedTable] = useState('01');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Target URL for scanning
  const getTableUrl = (table: string) => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    return `${base}?table=${table}`;
  };

  const currentUrl = getTableUrl(selectedTable);

  useEffect(() => {
    if (canvasRef.current && currentUrl) {
      QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1e293b',
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
  }, [selectedTable, currentUrl]);

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
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500" />
            ตัวสร้าง QR Code ประจำโต๊ะ (Table QR Generator)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            เลือกเลขโต๊ะเพื่อสร้าง QR Code สำหรับพิมพ์ติดการ์ดตั้งโต๊ะให้ลูกค้าสแกนสั่ง
          </p>
        </div>

        {/* Table Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700">เลือกโต๊ะ:</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
          >
            {Array.from({ length: storeConfig.tableCount }, (_, i) => {
              const t = (i + 1).toString().padStart(2, '0');
              return (
                <option key={t} value={t}>
                  โต๊ะ {t}
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
            <h3 className="font-extrabold text-lg tracking-wide">
              {storeConfig.name}
            </h3>
            <p className="text-[11px] text-orange-100 font-medium">
              สแกนสั่งอาหาร & เครื่องดื่มง่ายๆ ได้ทันที
            </p>
          </div>

          <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
            <canvas ref={canvasRef} className="rounded-xl mx-auto" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              TABLE NUMBER
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              โต๊ะ {selectedTable}
            </div>
          </div>

          <div className="text-[11px] text-gray-500 max-w-xs leading-relaxed bg-gray-50 p-2.5 rounded-xl">
            📱 เปิดกล้องมือถือสแกน QR เพื่อดูเมนูทั้งหมด สั่งอาหาร และชำระเงินผ่านมือถือโดยไม่ต้องรอพนักงาน
          </div>
        </div>

        {/* Actions & Instructions */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">การดำเนินการ</h4>
            
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดรูป QR Code โต๊ะ {selectedTable}</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์การ์ดตั้งโต๊ะ (Print Stand)</span>
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-orange-500" />
                <span>เปิดทดสอบในมุมมองโต๊ะ {selectedTable} (New Tab)</span>
              </a>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>เทคนิคการนำไปขายให้ร้านค้า (Sales Tip)</span>
            </div>
            <p className="leading-relaxed">
              คุณสามารถรับบริการพิมพ์การ์ดอะคริลิกตั้งโต๊ะขนาด 4x6 นิ้ว หรือแผ่นสติกเกอร์กันน้ำส่งให้ร้านค้าพร้อมใช้งานทันที ซึ่งช่วยเพิ่มมูลค่าบริการเป็นแพ็กเกจ Setup Fee ได้ถึง <strong>1,500 – 2,500 บาท</strong> ต่อร้าน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
