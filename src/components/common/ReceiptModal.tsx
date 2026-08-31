import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { 
  X, Printer, QrCode, Building2, User, 
  FileText, ShieldCheck, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Order, StoreConfig, Language } from '../../types';
import { CAFE_ORDER_LOGO_DATA_URI } from '../../data/logoData';
import { generatePromptPayPayload } from '../../utils/promptpay';
import { calculateVatBreakdown, formatTaxId } from '../../utils/taxInvoice';
import { t } from '../../utils/i18n';

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
  const [taxValidationError, setTaxValidationError] = useState<string | null>(null);

  const [taxInfo, setTaxInfo] = useState<CustomerTaxInfo>({
    customerType: 'individual',
    name: '',
    taxId: '',
    branch: '00000 (สำนักงานใหญ่)',
    address: '',
    phone: '',
  });

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate PromptPay QR Code
  useEffect(() => {
    if (isOpen && order && qrCanvasRef.current && storeConfig.promptpayNumber) {
      const payload = generatePromptPayPayload(storeConfig.promptpayNumber, order.totalPrice);
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [isOpen, order, storeConfig.promptpayNumber, docType]);

  // Handle print body class
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

  const isTh = language === 'th';
  const now = new Date(order.createdAt || new Date());

  const handlePrint = () => {
    if (docType === 'fullTax') {
      if (!taxInfo.name.trim()) {
        setTaxValidationError(isTh ? '⚠️ กรุณาระบุชื่อผู้ซื้อจริง (ห้ามเว้นว่าง หรือไม่ประสงค์ออกนาม)' : '⚠️ Please enter actual buyer name');
        setShowTaxForm(true);
        return;
      }
      if (!taxInfo.address.trim()) {
        setTaxValidationError(isTh ? '⚠️ กรุณาระบุที่อยู่ผู้ซื้อจริงให้ครบถ้วน' : '⚠️ Please enter actual buyer address');
        setShowTaxForm(true);
        return;
      }
    }
    setTaxValidationError(null);
    window.print();
  };
  
  const formattedDateThai = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedDateShort = now.toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate official 7% VAT breakdown (Thailand Revenue Department standard)
  const vat = calculateVatBreakdown(order.totalPrice, 0.07);

  // Seller info
  const sellerLegalName = storeConfig.companyLegalName || (isTh ? storeConfig.name : (storeConfig.nameEn || storeConfig.name));
  const sellerTaxId = storeConfig.taxId || '-';
  const sellerBranch = storeConfig.branchNumber || '00000 (สำนักงานใหญ่)';
  const sellerAddress = storeConfig.address || '-';
  const sellerPhone = storeConfig.phone || storeConfig.promptpayNumber || '';

  // Invoice & Book Number (Revenue Dept standard formatting)
  const bookNo = '001';
  const invoiceNo = `RC-${order.orderNumber.replace(/[^0-9A-Za-z]/g, '') || '0001'}`;

  const modalContent = (
    <div 
      id="print-receipt-portal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 print:static print:p-0 print:m-0 print:bg-white print:block"
    >
      {/* Backdrop (Screen Only) */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity print:hidden no-print"
        onClick={onClose}
      />

      {/* Main Document Container (Modal View) */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none print:static print:p-0 print:m-0 print:overflow-visible">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between flex-shrink-0 print:hidden no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm">
                {isTh ? 'พิมพ์ใบเสร็จรับเงิน / ใบกำกับภาษี' : 'Tax Invoice & Receipt Printer'}
              </span>
              <span className="text-[10px] text-stone-400 block font-medium">
                {isTh ? 'ถูกต้องตามประมวลรัษฎากร กรมสรรพากร' : 'Compliant with Thailand Revenue Department'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title={t('close', language)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Mode Selector Tabs (Hidden on Print) */}
        <div className="p-3 bg-stone-100/90 border-b border-stone-200 flex-shrink-0 print:hidden no-print space-y-2.5">
          <div className="grid grid-cols-2 gap-2 bg-stone-200/80 p-1 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setDocType('abbreviated');
                setShowTaxForm(false);
                setTaxValidationError(null);
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'abbreviated' 
                  ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-950/5' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>{isTh ? '1. ใบกำกับภาษีอย่างย่อ (สลิป POS)' : '1. Abbreviated Tax Invoice (POS)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDocType('fullTax');
                setShowTaxForm(true);
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'fullTax' 
                  ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-950/5' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTh ? '2. ใบกำกับภาษีเต็มรูป (มาตรา 86/4)' : '2. Full Tax Invoice (Sec. 86/4)'}</span>
            </button>
          </div>

          {/* Validation Alert Message */}
          {taxValidationError && docType === 'fullTax' && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{taxValidationError}</span>
            </div>
          )}

          {/* Customer Tax Info Form (Visible in Full Tax Mode) */}
          {docType === 'fullTax' && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs space-y-3">
              <div 
                onClick={() => setShowTaxForm(!showTaxForm)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-stone-900">
                    {isTh ? 'กรอกข้อมูลผู้ซื้อสำหรับออกใบกำกับภาษีเต็มรูป' : 'Customer Tax Details for Full Invoice'}
                  </span>
                  {taxInfo.name && taxInfo.address ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3" />
                      {isTh ? 'ระบุครบแล้ว' : 'Complete'}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200/60">
                      {isTh ? '* จำเป็นต้องระบุชื่อและที่อยู่จริง' : '* Required name & address'}
                    </span>
                  )}
                </div>
                {showTaxForm ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </div>

              {showTaxForm && (
                <div className="space-y-3 pt-1 text-xs animate-in fade-in">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 font-bold text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="custType"
                        checked={taxInfo.customerType === 'individual'}
                        onChange={() => {
                          setTaxInfo({ ...taxInfo, customerType: 'individual' });
                          setTaxValidationError(null);
                        }}
                      />
                      <span>{isTh ? 'บุคคลธรรมดา' : 'Individual'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="custType"
                        checked={taxInfo.customerType === 'corporate'}
                        onChange={() => {
                          setTaxInfo({ ...taxInfo, customerType: 'corporate' });
                          setTaxValidationError(null);
                        }}
                      />
                      <span>{isTh ? 'นิติบุคคล / บริษัท' : 'Corporate / Company'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {taxInfo.customerType === 'corporate' 
                          ? (isTh ? 'ชื่อบริษัท / นิติบุคคลผู้ซื้อจริง *' : 'Company Full Name *') 
                          : (isTh ? 'ชื่อ-นามสกุล ผู้ซื้อจริง *' : 'Customer Full Name *')}
                      </label>
                      <input
                        type="text"
                        value={taxInfo.name}
                        onChange={(e) => {
                          setTaxInfo({ ...taxInfo, name: e.target.value });
                          if (e.target.value.trim()) setTaxValidationError(null);
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isTh ? 'เลขประจำตัวผู้เสียภาษี / เลขบัตร ปชช. (13 หลัก)' : 'Tax ID / ID Card No. (13 digits)'}
                      </label>
                      <input
                        type="text"
                        maxLength={13}
                        value={taxInfo.taxId}
                        onChange={(e) => setTaxInfo({ ...taxInfo, taxId: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isTh ? 'สาขา (Branch)' : 'Branch Info'}
                      </label>
                      <input
                        type="text"
                        value={taxInfo.branch}
                        onChange={(e) => setTaxInfo({ ...taxInfo, branch: e.target.value })}
                        placeholder="00000 (สำนักงานใหญ่)"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isTh ? 'เบอร์โทรศัพท์ (Phone)' : 'Phone Number'}
                      </label>
                      <input
                        type="text"
                        value={taxInfo.phone || ''}
                        onChange={(e) => setTaxInfo({ ...taxInfo, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isTh ? 'ที่อยู่ตามทะเบียนภาษีมูลค่าเพิ่ม / บัตรประชาชนผู้ซื้อจริง *' : 'Registered Tax Address *'}
                      </label>
                      <input
                        type="text"
                        value={taxInfo.address}
                        onChange={(e) => {
                          setTaxInfo({ ...taxInfo, address: e.target.value });
                          if (e.target.value.trim()) setTaxValidationError(null);
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
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
        <div className="p-4 sm:p-6 overflow-y-auto font-sans text-stone-900 bg-[#fffdfa] print:p-0 print:m-0 print:overflow-visible print:bg-white flex-1 min-h-0">
          
          {/* OPTION 1: ABBREVIATED TAX INVOICE (ใบกำกับภาษีอย่างย่อ - มาตรา 86/6) */}
          {docType === 'abbreviated' && (
            <div className="pos-receipt-print-container space-y-3 max-w-sm mx-auto bg-white p-4 border border-stone-200/80 shadow-2xs print:border-none print:shadow-none print:p-0">
              
              {/* POS Header */}
              <div className="text-center space-y-1 pb-2.5 border-b border-dashed border-stone-300 print:border-black">
                <div className="w-12 h-12 mx-auto overflow-hidden p-0.5 border border-stone-200 print:border-none">
                  <img
                    src={storeConfig.logoUrl || CAFE_ORDER_LOGO_DATA_URI}
                    alt="Logo"
                    onError={(e) => {
                      e.currentTarget.src = CAFE_ORDER_LOGO_DATA_URI;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-black text-base tracking-tight text-stone-950 print:text-black">
                  {sellerLegalName}
                </h2>
                <div className="inline-block bg-stone-900 text-white font-black px-2.5 py-0.5 text-[11px] tracking-wide print:bg-transparent print:text-black print:border print:border-black">
                  ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
                </div>
                <p className="text-[9.5px] font-bold text-stone-500 print:text-black uppercase">
                  (TAX INVOICE - ABB)
                </p>
                <div className="text-[10px] text-stone-600 print:text-black space-y-0.5 pt-0.5">
                  <p>
                    <span className="font-bold">เลขประจำตัวผู้เสียภาษี:</span> {formatTaxId(sellerTaxId)} ({sellerBranch})
                  </p>
                  <p className="leading-tight">{sellerAddress}</p>
                  {sellerPhone && <p><span className="font-bold">โทร:</span> {sellerPhone}</p>}
                </div>
              </div>

              {/* Receipt Metadata */}
              <div className="text-[11px] space-y-1 py-1.5 border-b border-dashed border-stone-300 print:border-black">
                <div className="flex justify-between font-bold">
                  <span>เลขที่ (Invoice #):</span>
                  <span className="font-mono font-black text-stone-950 print:text-black">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>โต๊ะ / ประเภท (Table):</span>
                  <span className="font-black text-stone-900 print:text-black">
                    {order.tableNumber === 'TAKEAWAY' ? (isTh ? 'สั่งกลับบ้าน (Takeaway)' : 'Takeaway') : `${isTh ? 'โต๊ะ' : 'Table'} ${order.tableNumber}`}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 print:text-black text-[10.5px]">
                  <span>วันและเวลา (Date & Time):</span>
                  <span>{formattedDateShort} {formattedTime} {isTh ? 'น.' : ''}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 py-2 border-b border-dashed border-stone-300 print:border-black text-xs">
                <div className="flex justify-between text-[10px] font-black text-stone-400 print:text-black uppercase pb-0.5 border-b border-stone-100 print:border-none">
                  <span>รายการ (Items)</span>
                  <span>จำนวนเงิน (THB)</span>
                </div>

                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-stone-900 print:text-black">
                      <div className="flex items-start gap-1 max-w-[78%]">
                        <span className="text-orange-600 print:text-black font-black">{item.quantity}x</span>
                        <span>{language === 'en' && item.menuItem.nameEn ? item.menuItem.nameEn : item.menuItem.name}</span>
                      </div>
                      <span className="font-mono">฿{item.totalItemPrice.toLocaleString()}</span>
                    </div>

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="pl-4 text-[10px] text-stone-500 print:text-black space-y-0.5">
                        {item.selectedOptions.map((opt, i) => (
                          <div key={i} className="flex justify-between">
                            <span>• {opt.choiceName === 'หวาน 25%' ? 'หวาน (25%)' : opt.choiceName}</span>
                            {opt.priceDelta > 0 && <span>+฿{opt.priceDelta * item.quantity}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* VAT Breakdown & Totals */}
              <div className="space-y-1.5 py-2 border-b border-dashed border-stone-300 print:border-black text-xs">
                <div className="flex justify-between text-stone-600 print:text-black text-[11px]">
                  <span>มูลค่าสินค้าก่อนภาษี (Tax Base):</span>
                  <span className="font-mono">฿{vat.formattedTaxBase}</span>
                </div>
                <div className="flex justify-between text-stone-600 print:text-black text-[11px]">
                  <span>ภาษีมูลค่าเพิ่ม 7% (VAT 7%):</span>
                  <span className="font-mono">฿{vat.formattedVat}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-950 print:text-black pt-1.5 border-t border-stone-200 print:border-black">
                  <span>ยอดสุทธิรวม (Total Due):</span>
                  <span className="text-orange-600 print:text-black text-base font-mono">฿{vat.formattedTotal}</span>
                </div>
                <div className="text-[10px] text-stone-500 print:text-black font-bold text-center pt-0.5">
                  ({vat.bahtText})
                </div>
              </div>

              {/* Payment & PromptPay QR Box */}
              <div className="p-3 bg-stone-50 print:bg-white border border-stone-200 print:border-black text-center space-y-1.5 shadow-2xs print:shadow-none">
                <div className="flex items-center justify-center gap-1.5 text-stone-900 print:text-black font-black text-[11px]">
                  <QrCode className="w-3.5 h-3.5 text-blue-700 print:text-black" />
                  <span>สแกนจ่ายผ่านพร้อมเพย์ (PromptPay QR)</span>
                </div>

                <div className="p-1 bg-white inline-block border border-stone-200 print:border-black">
                  <canvas ref={qrCanvasRef} className="mx-auto" />
                </div>

                <div className="space-y-0.5 text-[10px] text-stone-700 print:text-black">
                  <p className="font-bold">{storeConfig.promptpayName}</p>
                  <p className="text-stone-500 print:text-black font-mono">PromptPay: {storeConfig.promptpayNumber}</p>
                  <p className="text-[9.5px] text-stone-500 print:text-black font-bold">
                    ยอดเงินระบุอัตโนมัติ ฿{order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Slip Footer */}
              <div className="text-center pt-1 space-y-0.5 text-[10px] text-stone-500 print:text-black">
                <p className="font-black text-stone-800 print:text-black">*** ขอบคุณที่ใช้บริการ (Thank You) ***</p>
                <p className="text-[9.5px] font-bold text-stone-600 print:text-black">* ราคานี้รวมภาษีมูลค่าเพิ่ม 7% แล้ว (VAT Included) *</p>
              </div>
            </div>
          )}

          {/* OPTION 2: FULL TAX INVOICE (ใบกำกับภาษีแบบเต็มรูป - มาตรา 86/4 แบบไม่มีขอบมน สะอาด คมชัด ถูกต้อง 100%) */}
          {docType === 'fullTax' && (
            <div className="a4-tax-invoice-container space-y-4 text-xs bg-white p-4 sm:p-6 border border-stone-800 print:border-black print:p-0 shadow-none">
              
              {/* Top Row: Store Logo & Date (Left) | Document Title & Serial/No (Right) */}
              <div className="flex items-start justify-between gap-4 border-b-2 border-stone-900 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 overflow-hidden p-0.5 border border-stone-300 print:border-none flex-shrink-0">
                    <img
                      src={storeConfig.logoUrl || CAFE_ORDER_LOGO_DATA_URI}
                      alt="Logo"
                      onError={(e) => {
                        e.currentTarget.src = CAFE_ORDER_LOGO_DATA_URI;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-stone-950 tracking-tight">
                      {sellerLegalName}
                    </h1>
                    <p className="text-xs text-stone-600 font-bold">
                      {storeConfig.nameEn || 'Cafe Order Enterprise'}
                    </p>
                    <p className="text-xs font-bold text-stone-800 mt-1">
                      <span className="text-stone-500">วันที่: </span> {formattedDateThai}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1 flex-shrink-0">
                  <h2 className="text-base sm:text-lg font-black text-stone-950 tracking-tight">
                    ใบเสร็จรับเงิน / ใบกำกับภาษี
                  </h2>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    TAX INVOICE / RECEIPT (ต้นฉบับ / ORIGINAL)
                  </p>
                  <div className="flex items-center justify-end gap-3 text-xs font-bold text-stone-900 pt-1">
                    <span>เล่มที่ <span className="font-mono font-black">{bookNo}</span></span>
                    <span>เลขที่ <span className="font-mono font-black">{invoiceNo}</span></span>
                  </div>
                </div>
              </div>

              {/* Seller & Buyer Info Section (Clean Formal Straight Grid - No Rounded Corners) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-1">
                
                {/* 1. Seller Information (ข้อมูลผู้ขาย) */}
                <div className="p-3 bg-white border border-stone-800 print:border-stone-900 space-y-1.5 text-[11px]">
                  <div className="font-black text-stone-900 border-b border-stone-300 pb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-700" />
                    <span>ข้อมูลผู้ขาย (Seller Information):</span>
                  </div>
                  <div className="space-y-1 text-stone-800 leading-snug">
                    <p>
                      <span className="font-bold text-stone-600">ชื่อผู้ขาย: </span>
                      <span className="font-black">{sellerLegalName}</span>
                    </p>
                    <p>
                      <span className="font-bold text-stone-600">ที่อยู่: </span>
                      <span>{sellerAddress}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <p>
                        <span className="font-bold text-stone-600">เลขประจำตัวผู้เสียภาษี: </span>
                        <span className="font-mono font-bold block sm:inline">{formatTaxId(sellerTaxId)}</span>
                      </p>
                      <p>
                        <span className="font-bold text-stone-600">โทรศัพท์: </span>
                        <span className="font-mono">{sellerPhone}</span>
                      </p>
                    </div>
                    <p className="text-[10.5px] text-stone-600 font-bold">
                      สาขา: {sellerBranch}
                    </p>
                  </div>
                </div>

                {/* 2. Buyer Information (ข้อมูลผู้ซื้อจริง - บังคับระบุชื่อและที่อยู่จริง) */}
                <div className="p-3 bg-white border border-stone-800 print:border-stone-900 space-y-1.5 text-[11px]">
                  <div className="font-black text-stone-900 border-b border-stone-300 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-700" />
                    <span>ข้อมูลผู้ซื้อ (Buyer Information):</span>
                  </div>
                  <div className="space-y-1 text-stone-800 leading-snug">
                    <p>
                      <span className="font-bold text-stone-600">ชื่อผู้ซื้อ: </span>
                      <span className={`font-black ${!taxInfo.name.trim() ? 'text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200 print:border-none print:text-black' : 'text-stone-950'}`}>
                        {taxInfo.name.trim() || (isTh ? '* กรุณากรอกชื่อผู้ซื้อจริง' : '* Actual buyer name required')}
                      </span>
                    </p>
                    <p>
                      <span className="font-bold text-stone-600">ที่อยู่: </span>
                      <span className={!taxInfo.address.trim() ? 'text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200 print:border-none print:text-black font-bold' : ''}>
                        {taxInfo.address.trim() || (isTh ? '* กรุณากรอกที่อยู่ผู้ซื้อจริง' : '* Actual buyer address required')}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <p>
                        <span className="font-bold text-stone-600">เลขประจำตัวผู้เสียภาษี: </span>
                        <span className="font-mono font-bold block sm:inline">{formatTaxId(taxInfo.taxId) || '-'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-stone-600">โทรศัพท์: </span>
                        <span className="font-mono">{taxInfo.phone || '-'}</span>
                      </p>
                    </div>
                    <p className="text-[10.5px] text-stone-600 font-bold">
                      สาขา: {taxInfo.branch || '00000 (สำนักงานใหญ่)'} • {order.tableNumber === 'TAKEAWAY' ? 'สั่งกลับบ้าน' : `โต๊ะ ${order.tableNumber}`}
                    </p>
                  </div>
                </div>

              </div>

              {/* Items Table with Crisp Sharp Borders (No Rounded Corners) */}
              <div className="border border-stone-900 overflow-hidden">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 print:bg-stone-200 border-b border-stone-900 font-black text-stone-950 text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12 border-r border-stone-900">ลำดับ</th>
                      <th className="py-2.5 px-3 text-left border-r border-stone-900">รายการสินค้า / บริการ</th>
                      <th className="py-2.5 px-3 text-center w-16 border-r border-stone-900">จำนวน</th>
                      <th className="py-2.5 px-3 text-right w-24 border-r border-stone-900">หน่วยละ</th>
                      <th className="py-2.5 px-3 text-right w-28">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-2 px-3 text-center text-stone-600 font-mono border-r border-stone-900">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-stone-900">
                          <p className="font-black text-stone-950">{item.menuItem.name}</p>
                          {item.menuItem.nameEn && <p className="text-[10px] text-stone-500">{item.menuItem.nameEn}</p>}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className="text-[10.5px] text-stone-600 pt-0.5">
                              {item.selectedOptions.map((o) => (o.choiceName === 'หวาน 25%' ? 'หวาน (25%)' : o.choiceName)).join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-stone-950 font-mono border-r border-stone-900">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono border-r border-stone-900">{item.unitPriceWithDelta.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-stone-950">{item.totalItemPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary and Legal VAT Calculation Block (Sharp Borders) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                
                {/* Left Column: Baht Text and Payment Meta */}
                <div className="md:col-span-7 space-y-2 text-xs">
                  <div className="p-2.5 bg-white border border-stone-800 space-y-1">
                    <p className="text-[11px] font-bold text-stone-600">
                      จำนวนเงินตัวอักษร (Amount in Words):
                    </p>
                    <p className="text-xs font-black text-stone-950">
                      ({vat.bahtText})
                    </p>
                  </div>

                  <div className="text-[10.5px] text-stone-600 space-y-0.5 pt-1">
                    <p><span className="font-bold">วิธีชำระเงิน:</span> {order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ (PromptPay)' : 'เงินสด (Cash)'}</p>
                    <p><span className="font-bold">สถานะ:</span> {order.paymentStatus === 'paid' ? 'ชำระเงินเรียบร้อยแล้ว (PAID)' : 'ค้างชำระ'}</p>
                    <p className="text-[10px] text-stone-500 font-medium pt-0.5">
                      เอกสารนี้ออกตามมาตรา 86/4 แห่งประมวลรัษฎากร กรมสรรพากร
                    </p>
                  </div>
                </div>

                {/* Right Column: Pre-VAT, VAT 7%, Grand Total Table */}
                <div className="md:col-span-5 border border-stone-900 overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-white border-b border-stone-300">
                    <span className="font-bold text-stone-700">มูลค่ารวมก่อนเสียภาษี:</span>
                    <span className="font-mono font-bold text-stone-950">{vat.formattedTaxBase}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-white border-b border-stone-900">
                    <span className="font-bold text-stone-700">ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                    <span className="font-mono font-bold text-stone-950">{vat.formattedVat}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-stone-100 print:bg-stone-200 font-black text-sm text-stone-950">
                    <span>ยอดรวมสุทธิ:</span>
                    <span className="font-mono text-base text-stone-950 print:text-black">฿{vat.formattedTotal}</span>
                  </div>
                </div>

              </div>

              {/* Official Signatures Grid */}
              <div className="pt-6 grid grid-cols-2 gap-12 text-center text-xs text-stone-700">
                <div className="space-y-8">
                  <p className="font-bold">ผู้รับบริการ / ผู้จ่ายเงิน (Customer)</p>
                  <p className="border-t border-dotted border-stone-500 pt-1.5 font-medium">ลงชื่อ ...................................................</p>
                </div>
                <div className="space-y-8">
                  <p className="font-bold">ผู้รับเงิน / ผู้มีอำนาจลงนาม (Authorized)</p>
                  <p className="border-t border-dotted border-stone-500 pt-1.5 font-medium">ลงชื่อ ...................................................</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Action Controls (Hidden on Print) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0 print:hidden no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3.5 bg-stone-900 hover:bg-black active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer mr-3 shadow-md shadow-stone-900/15"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>
              {docType === 'abbreviated'
                ? (isTh ? 'สั่งพิมพ์ใบเสร็จอย่างย่อ (Print POS Slip)' : 'Print Abbreviated Slip')
                : (isTh ? 'สั่งพิมพ์ใบกำกับภาษีเต็มรูป (Print Full Tax Invoice)' : 'Print Full Tax Invoice')}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-black text-xs sm:text-sm rounded-2xl transition cursor-pointer active:scale-95"
          >
            {t('close', language)}
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
