import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { X, Printer, QrCode, Store, Clock, Utensils, ShieldCheck, Building2, User, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, StoreConfig, Language } from '../../types';
import { CAFE_ORDER_LOGO_DATA_URI } from '../../data/logoData';
import { generatePromptPayPayload } from '../../utils/promptpay';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  storeConfig: StoreConfig;
  language: Language;
}

export interface CustomerTaxInfo {
  customerType: 'individual' | 'corporate';
  name: string;
  taxId: string;
  branch: string;
  address: string;
  phone?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  storeConfig,
  language,
}) => {
  const [docType, setDocType] = useState<'abbreviated' | 'fullTax'>('abbreviated');
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [taxInfo, setTaxInfo] = useState<CustomerTaxInfo>({
    customerType: 'individual',
    name: '',
    taxId: '',
    branch: '00000 (สำนักงานใหญ่)',
    address: '',
    phone: '',
  });

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && order && qrCanvasRef.current && storeConfig.promptpayNumber) {
      const payload = generatePromptPayPayload(storeConfig.promptpayNumber, order.totalPrice);
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [isOpen, order, storeConfig.promptpayNumber, docType]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('is-printing-receipt');
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.classList.remove('is-printing-receipt');
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.classList.remove('is-printing-receipt');
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate VAT 7% breakdown (VAT inclusive)
  const totalAmount = order.totalPrice;
  const taxBase = totalAmount * (100 / 107);
  const vatAmount = totalAmount - taxBase;

  const modalContent = (
    <div 
      id="print-receipt-portal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:static print:p-0 print:m-0 print:bg-white print:block"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity print:hidden no-print"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none print:static print:p-0 print:m-0">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between flex-shrink-0 print:hidden no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="font-black text-xs sm:text-sm">
              {language === 'th' ? 'พิมพ์ใบเสร็จรับเงิน / ใบกำกับภาษี' : 'Print Receipt & Tax Invoice'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Type Selector Tabs (Hidden on Print) */}
        <div className="p-3 bg-stone-100/90 border-b border-stone-200 flex-shrink-0 print:hidden no-print space-y-2.5">
          <div className="grid grid-cols-2 gap-1.5 bg-stone-200/80 p-1 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setDocType('abbreviated');
                setShowTaxForm(false);
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                docType === 'abbreviated' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'th' ? 'ใบเสร็จอย่างย่อ (สลิป POS)' : 'Abbreviated Slip'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDocType('fullTax');
                setShowTaxForm(true);
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                docType === 'fullTax' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'th' ? 'ใบกำกับภาษีเต็มรูป (มาตรา 86/4)' : 'Full Tax Invoice'}</span>
            </button>
          </div>

          {/* Customer Tax Info Toggle Form (Visible ONLY in Full Tax Mode) */}
          {docType === 'fullTax' && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs space-y-3">
              <div 
                onClick={() => setShowTaxForm(!showTaxForm)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-stone-900">
                    {language === 'th' ? 'ข้อมูลผู้ขอใบกำกับภาษี (Customer Tax Details)' : 'Customer Tax Info'}
                  </span>
                  {taxInfo.name && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                      ระบุแล้ว
                    </span>
                  )}
                </div>
                {showTaxForm ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </div>

              {showTaxForm && (
                <div className="space-y-2.5 pt-1 text-xs animate-in fade-in">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 font-bold text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="custType"
                        checked={taxInfo.customerType === 'individual'}
                        onChange={() => setTaxInfo({ ...taxInfo, customerType: 'individual' })}
                      />
                      <span>บุคคลธรรมดา</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="custType"
                        checked={taxInfo.customerType === 'corporate'}
                        onChange={() => setTaxInfo({ ...taxInfo, customerType: 'corporate' })}
                      />
                      <span>นิติบุคคล / บริษัท</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        {taxInfo.customerType === 'corporate' ? 'ชื่อบริษัท / นิติบุคคล *' : 'ชื่อ-นามสกุล ผู้ซื้อ *'}
                      </label>
                      <input
                        type="text"
                        value={taxInfo.name}
                        onChange={(e) => setTaxInfo({ ...taxInfo, name: e.target.value })}
                        placeholder={taxInfo.customerType === 'corporate' ? 'บริษัท ตัวอย่าง จำกัด' : 'นายสมชาย ใจดี'}
                        className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        เลขประจำตัวผู้เสียภาษี 13 หลัก *
                      </label>
                      <input
                        type="text"
                        maxLength={13}
                        value={taxInfo.taxId}
                        onChange={(e) => setTaxInfo({ ...taxInfo, taxId: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="1234567890123"
                        className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        สาขา (Branch)
                      </label>
                      <input
                        type="text"
                        value={taxInfo.branch}
                        onChange={(e) => setTaxInfo({ ...taxInfo, branch: e.target.value })}
                        placeholder="00000 (สำนักงานใหญ่)"
                        className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        ที่อยู่ตามทะเบียนภาษี *
                      </label>
                      <input
                        type="text"
                        value={taxInfo.address}
                        onChange={(e) => setTaxInfo({ ...taxInfo, address: e.target.value })}
                        placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                        className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENT BODY (PRINTABLE AREA)                                             */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto font-sans text-stone-800 bg-[#fffdfa] print:p-0 print:m-0 print:overflow-visible print:bg-white">
          
          {/* OPTION A: THAI STANDARD 80MM POS THERMAL RECEIPT SLIP */}
          {docType === 'abbreviated' && (
            <div className="pos-receipt-print-container space-y-3 max-w-sm mx-auto">
              {/* Store Logo & Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-stone-300 print:border-black">
                <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden p-0.5 border border-stone-200 print:border-none">
                  <img src={CAFE_ORDER_LOGO_DATA_URI} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <h2 className="font-black text-base tracking-tight text-stone-950 print:text-black">
                  {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
                </h2>
                <p className="text-[11px] font-black text-stone-700 print:text-black uppercase">
                  ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
                </p>
                <p className="text-[10px] text-stone-600 print:text-black">
                  เลขประจำตัวผู้เสียภาษี: {storeConfig.taxId || '0105566012345'}
                </p>
                <p className="text-[9.5px] text-stone-500 print:text-black leading-tight">
                  {storeConfig.address || '123/45 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110'}
                </p>
              </div>

              {/* Receipt Meta */}
              <div className="text-[11px] space-y-0.5 py-1 border-b border-dashed border-stone-300 print:border-black">
                <div className="flex justify-between font-bold">
                  <span>เลขที่ (Order #):</span>
                  <span className="font-black text-stone-900 print:text-black">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>ตำแหน่ง (Table):</span>
                  <span className="font-black text-stone-900 print:text-black">
                    {order.tableNumber === 'TAKEAWAY' ? (language === 'th' ? 'สั่งกลับบ้าน' : 'Takeaway') : `โต๊ะ ${order.tableNumber}`}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 print:text-black text-[10px]">
                  <span>วันที่ (Date):</span>
                  <span>{formattedDate} {formattedTime}</span>
                </div>
              </div>

              {/* Itemized List */}
              <div className="space-y-1.5 py-1.5 border-b border-dashed border-stone-300 print:border-black text-[11px]">
                <div className="flex justify-between text-[10px] font-black text-stone-500 print:text-black uppercase">
                  <span>รายการ (Items)</span>
                  <span>จำนวนเงิน</span>
                </div>

                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-stone-900 print:text-black">
                      <div className="flex items-start gap-1 max-w-[78%]">
                        <span className="text-orange-600 print:text-black font-black">{item.quantity}x</span>
                        <span>{language === 'en' && item.menuItem.nameEn ? item.menuItem.nameEn : item.menuItem.name}</span>
                      </div>
                      <span>฿{item.totalItemPrice.toLocaleString()}</span>
                    </div>

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="pl-4 text-[9.5px] text-stone-500 print:text-black space-y-0.5">
                        {item.selectedOptions.map((opt, i) => (
                          <div key={i} className="flex justify-between">
                            <span>• {opt.choiceName}</span>
                            {opt.priceDelta > 0 && <span>+฿{opt.priceDelta * item.quantity}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals & Net */}
              <div className="space-y-1 py-1.5 border-b border-dashed border-stone-300 print:border-black text-[11px]">
                <div className="flex justify-between text-stone-600 print:text-black">
                  <span>มูลค่าก่อนภาษี (Tax Base):</span>
                  <span>฿{taxBase.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600 print:text-black">
                  <span>ภาษีมูลค่าเพิ่ม 7% (VAT 7%):</span>
                  <span>฿{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-950 print:text-black pt-1 border-t border-stone-200 print:border-black">
                  <span>ยอดสุทธิ (Total Due):</span>
                  <span className="text-orange-600 print:text-black text-base">฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* PROMPTPAY QR PAYMENT BOX */}
              <div className="p-3 rounded-xl bg-white border border-stone-200 print:border-black text-center space-y-1.5 shadow-xs print:shadow-none">
                <div className="flex items-center justify-center gap-1.5 text-stone-900 print:text-black font-black text-[11px]">
                  <QrCode className="w-3.5 h-3.5 text-blue-700 print:text-black" />
                  <span>สแกนจ่ายผ่านพร้อมเพย์ (PromptPay QR)</span>
                </div>

                <div className="p-1.5 bg-white rounded-lg inline-block border border-stone-100 print:border-black">
                  <canvas ref={qrCanvasRef} className="mx-auto rounded" />
                </div>

                <div className="space-y-0.5 text-[10px] text-stone-700 print:text-black">
                  <p className="font-bold">{storeConfig.promptpayName}</p>
                  <p className="text-stone-500 print:text-black font-mono">PromptPay: {storeConfig.promptpayNumber}</p>
                  <p className="text-[9px] text-stone-500 print:text-black">
                    ยอดเงินระบุอัตโนมัติ ฿{order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-1 space-y-0.5 text-[10px] text-stone-400 print:text-black">
                <p className="font-bold text-stone-600 print:text-black">*** ขอบคุณที่ใช้บริการ (Thank You) ***</p>
                <p className="text-[9px]">ราคานี้รวมภาษีมูลค่าเพิ่ม 7% แล้ว (VAT Included)</p>
              </div>
            </div>
          )}

          {/* OPTION B: FULL LEGAL TAX INVOICE (มาตรา 86/4) */}
          {docType === 'fullTax' && (
            <div className="a4-tax-invoice-container space-y-4 text-xs">
              {/* Official Header */}
              <div className="border-b-2 border-stone-800 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-stone-950">
                      {storeConfig.name}
                    </h2>
                    <p className="text-xs font-bold text-stone-700">
                      {storeConfig.nameEn || 'Cafe Order Enterprise'}
                    </p>
                    <p className="text-[11px] text-stone-600 max-w-sm">
                      {storeConfig.address || '123/45 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110'}
                    </p>
                    <p className="text-[11px] font-bold text-stone-900">
                      เลขประจำตัวผู้เสียภาษีอากร: <span className="font-mono">{storeConfig.taxId || '0105566012345'}</span> ({storeConfig.branchNumber || 'สำนักงานใหญ่'})
                    </p>
                  </div>

                  <div className="text-right space-y-1 flex-shrink-0">
                    <div className="bg-stone-900 text-white font-black px-3 py-1 rounded-lg text-xs tracking-wider inline-block">
                      ใบเสร็จรับเงิน / ใบกำกับภาษี
                    </div>
                    <p className="text-[10px] font-bold text-stone-500 uppercase">
                      TAX INVOICE / RECEIPT (ต้นฉบับ)
                    </p>
                    <p className="text-xs font-mono font-bold text-stone-900 pt-1">
                      เลขที่ (INV #): {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      วันที่ (Date): {formattedDate} {formattedTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Legal Tax Details Box */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="font-black text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-200 pb-1">
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span>ข้อมูลผู้ซื้อ / ผู้รับบริการ (Customer Information):</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px]">
                  <p>
                    <span className="font-bold text-stone-600">ชื่อผู้ซื้อ: </span>
                    <span className="font-bold text-stone-900">{taxInfo.name || '(ลูกค้าทั่วไป / ไม่ประสงค์ออกนาม)'}</span>
                  </p>
                  <p>
                    <span className="font-bold text-stone-600">เลขประจำตัวผู้เสียภาษี: </span>
                    <span className="font-mono font-bold text-stone-900">{taxInfo.taxId || '-'}</span>
                  </p>
                  <p>
                    <span className="font-bold text-stone-600">สาขา: </span>
                    <span className="font-medium text-stone-800">{taxInfo.branch || 'สำนักงานใหญ่'}</span>
                  </p>
                  <p>
                    <span className="font-bold text-stone-600">ตำแหน่ง/โต๊ะ: </span>
                    <span className="font-medium text-stone-800">โต๊ะ {order.tableNumber}</span>
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-bold text-stone-600">ที่อยู่: </span>
                    <span className="font-medium text-stone-800">{taxInfo.address || '-'}</span>
                  </p>
                </div>
              </div>

              {/* Full Legal Items Table */}
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-stone-800 bg-stone-100 font-black text-stone-900 text-[11px]">
                    <th className="py-2 px-2 text-center w-10">ลำดับ</th>
                    <th className="py-2 px-2 text-left">รายการสินค้า / บริการ</th>
                    <th className="py-2 px-2 text-center w-16">จำนวน</th>
                    <th className="py-2 px-2 text-right w-24">ราคา/หน่วย</th>
                    <th className="py-2 px-2 text-right w-24">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1.5 px-2 text-center text-stone-500 font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2">
                        <p className="font-bold text-stone-900">{item.menuItem.name}</p>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <p className="text-[10px] text-stone-500">
                            {item.selectedOptions.map((o) => o.choiceName).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold text-stone-900">{item.quantity}</td>
                      <td className="py-1.5 px-2 text-right font-mono">฿{item.unitPriceWithDelta.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-stone-900">฿{item.totalItemPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Legal Tax Calculations Breakdown */}
              <div className="border-t-2 border-stone-800 pt-2.5 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="text-[11px] text-stone-500 space-y-0.5">
                  <p className="font-bold text-stone-700">การชำระเงิน: {order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ (PromptPay)' : 'เงินสด (Cash)'}</p>
                  <p>สถานะการชำระ: {order.paymentStatus === 'paid' ? 'ชำระเงินเรียบร้อยแล้ว' : 'รอรับชำระ'}</p>
                  <p className="text-[10px] text-stone-400 pt-1">เอกสารนี้ออกโดยระบบอัตโนมัติ ถูกต้องตามมาตรา 86/4 แห่งประมวลรัษฎากร</p>
                </div>

                <div className="w-full sm:w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>รวมมูลค่าสินค้า (Subtotal):</span>
                    <span className="font-mono font-bold">฿{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>มูลค่าก่อนภาษี (Tax Base):</span>
                    <span className="font-mono">฿{taxBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>ภาษีมูลค่าเพิ่ม 7% (VAT 7%):</span>
                    <span className="font-mono">฿{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-stone-950 pt-1 border-t border-stone-800">
                    <span>จำนวนเงินรวมทั้งสิ้น:</span>
                    <span className="font-mono text-orange-600 text-base">฿{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="pt-4 grid grid-cols-2 gap-8 text-center text-[11px] text-stone-500">
                <div className="space-y-6">
                  <p>ผู้รับบริการ / ผู้จ่ายเงิน</p>
                  <p className="border-t border-dotted border-stone-400 pt-1 font-bold text-stone-700">ลงชื่อ ...................................................</p>
                </div>
                <div className="space-y-6">
                  <p>ผู้รับเงิน / ผู้มีอำนาจลงนาม</p>
                  <p className="border-t border-dotted border-stone-400 pt-1 font-bold text-stone-700">ลงชื่อ ...................................................</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls (Hidden on Print) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0 print:hidden no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 bg-stone-900 hover:bg-black active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer mr-2 shadow-md shadow-stone-900/10"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>
              {docType === 'abbreviated'
                ? (language === 'th' ? 'สั่งพิมพ์สลิปใบเสร็จ (Print POS Slip)' : 'Print POS Slip')
                : (language === 'th' ? 'สั่งพิมพ์ใบกำกับภาษีเต็มรูป (Print Full Tax Invoice)' : 'Print Full Tax Invoice')}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer active:scale-95"
          >
            {language === 'th' ? 'ปิด' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
