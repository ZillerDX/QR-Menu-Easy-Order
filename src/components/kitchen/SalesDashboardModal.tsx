import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, TrendingUp, DollarSign, Receipt, CreditCard, Banknote, 
  Sparkles, Award, Clock, ArrowUpRight, Printer, Download, Filter, BarChart3, ChevronRight 
} from 'lucide-react';
import { Order, Language } from '../../types';
import { t } from '../../utils/i18n';

interface SalesDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  language: Language;
}

type TimePreset = 'today' | 'yesterday' | '7days' | '30days' | 'all' | 'custom';

export const SalesDashboardModal: React.FC<SalesDashboardModalProps> = ({
  isOpen,
  onClose,
  orders,
  language,
}) => {
  const [preset, setPreset] = useState<TimePreset>('today');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Filter orders by time preset
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const orderDate = new Date(o.createdAt);

      switch (preset) {
        case 'today':
          return orderDate >= todayStart;
        case 'yesterday':
          return orderDate >= yesterdayStart && orderDate <= yesterdayEnd;
        case '7days':
          return orderDate >= sevenDaysAgo;
        case '30days':
          return orderDate >= thirtyDaysAgo;
        case 'custom': {
          const start = new Date(`${customStart}T00:00:00`);
          const end = new Date(`${customEnd}T23:59:59.999`);
          return orderDate >= start && orderDate <= end;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, preset, customStart, customEnd]);

  // Analytics Metrics Calculations
  const metrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalBills = filteredOrders.length;
    const avgTicket = totalBills > 0 ? Math.round(totalSales / totalBills) : 0;

    // Payment methods
    const promptpayOrders = filteredOrders.filter((o) => o.paymentMethod === 'promptpay');
    const cashOrders = filteredOrders.filter((o) => o.paymentMethod === 'cash');
    const promptpaySales = promptpayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const cashSales = cashOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Paid status
    const paidSales = filteredOrders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalPrice, 0);
    const unpaidSales = totalSales - paidSales;

    // Best Sellers Ranking
    const itemSalesMap: Record<string, { name: string; nameEn?: string; count: number; revenue: number; image?: string }> = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItem.id;
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = {
            name: item.menuItem.name,
            nameEn: item.menuItem.nameEn,
            count: 0,
            revenue: 0,
            image: item.menuItem.imageUrl,
          };
        }
        itemSalesMap[key].count += item.quantity;
        itemSalesMap[key].revenue += item.totalItemPrice;
      });
    });

    const topItems = Object.values(itemSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly Distribution (0-23 hrs)
    const hourlyCounts: number[] = Array(24).fill(0);
    const hourlySales: number[] = Array(24).fill(0);
    filteredOrders.forEach((o) => {
      const hr = new Date(o.createdAt).getHours();
      hourlyCounts[hr] += 1;
      hourlySales[hr] += o.totalPrice;
    });

    const maxHourlySales = Math.max(...hourlySales, 1);

    return {
      totalSales,
      totalBills,
      avgTicket,
      promptpaySales,
      promptpayCount: promptpayOrders.length,
      cashSales,
      cashCount: cashOrders.length,
      paidSales,
      unpaidSales,
      topItems,
      hourlySales,
      maxHourlySales,
    };
  }, [filteredOrders]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = ['Order Number', 'Table', 'Date Time', 'Items Count', 'Payment Method', 'Payment Status', 'Status', 'Total Price (THB)'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.tableNumber,
      new Date(o.createdAt).toLocaleString('th-TH'),
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.totalPrice,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${preset}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPresetLabel = (p: TimePreset) => {
    switch (p) {
      case 'today': return language === 'th' ? 'วันนี้' : 'Today';
      case 'yesterday': return language === 'th' ? 'เมื่อวานนี้' : 'Yesterday';
      case '7days': return language === 'th' ? '7 วันล่าสุด' : 'Last 7 Days';
      case '30days': return language === 'th' ? '30 วันล่าสุด' : 'Last 30 Days';
      case 'all': return language === 'th' ? 'ทั้งหมด' : 'All Time';
      case 'custom': return language === 'th' ? 'กำหนดเอง' : 'Custom Range';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[92vh]">
        {/* 1. Header with Gradient Accent */}
        <div className="px-6 py-5 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl tracking-tight">
                  {language === 'th' ? 'แดชบอร์ดสรุปยอดขาย (Sales Dashboard)' : 'Sales & Revenue Analytics'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">
                {language === 'th' ? 'รายงานผลการขาย วิเคราะห์สินค้าขายดี และช่วงเวลาพีค' : 'Real-time sales insights, best sellers, and peak hours'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-stone-700"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-stone-700"
              title="Print Report"
            >
              <Printer className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">{language === 'th' ? 'พิมพ์' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 bg-[#fafaf9]">
          
          {/* Time Range Selector Bar */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {(['today', 'yesterday', '7days', '30days', 'all', 'custom'] as TimePreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    preset === p
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                      : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
                  }`}
                >
                  {getPresetLabel(p)}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            {preset === 'custom' && (
              <div className="flex items-center gap-2 w-full md:w-auto animate-in fade-in">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50"
                />
                <span className="text-xs text-stone-400 font-bold">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50"
                />
              </div>
            )}
          </div>

          {/* KPI Cards Grid (4 Column Summary) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Total Revenue */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ยอดขายรวม' : 'Total Revenue'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  ฿
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  ฿{metrics.totalSales.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <span>{metrics.totalBills} {language === 'th' ? 'บิลที่สำเร็จ' : 'bills completed'}</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'จำนวนออเดอร์' : 'Total Orders'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {metrics.totalBills}
                </div>
                <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                  {language === 'th' ? 'ในรอบเวลาที่เลือก' : 'in selected period'}
                </div>
              </div>
            </div>

            {/* KPI 3: Average Ticket Size */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ยอดเฉลี่ย / บิล' : 'Avg. Ticket Size'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  ฿{metrics.avgTicket.toLocaleString()}
                </div>
                <div className="text-[11px] text-blue-600 font-bold mt-0.5">
                  {language === 'th' ? 'ค่าเฉลี่ยต่อใบเสร็จ' : 'average per receipt'}
                </div>
              </div>
            </div>

            {/* KPI 4: PromptPay vs Cash */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ช่องทางชำระเงิน' : 'Payment Split'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 space-y-1 text-xs font-bold">
                <div className="flex justify-between text-blue-700">
                  <span>พร้อมเพย์:</span>
                  <span>฿{metrics.promptpaySales.toLocaleString()} ({metrics.promptpayCount})</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>เงินสด:</span>
                  <span>฿{metrics.cashSales.toLocaleString()} ({metrics.cashCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Best Sellers & Peak Hours Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 5 Best Sellers */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{language === 'th' ? '5 อันดับเมนูขายดีที่สุด' : 'Top 5 Best Sellers'}</span>
                </h4>
                <span className="text-[11px] font-bold text-stone-400">
                  {language === 'th' ? 'เรียงตามจำนวนที่ขายได้' : 'By quantity sold'}
                </span>
              </div>

              {metrics.topItems.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs font-bold">
                  {language === 'th' ? 'ยังไม่มีรายการขายในรอบนี้' : 'No sales recorded in this period'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.topItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 hover:bg-orange-50/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-xs ${
                          idx === 0
                            ? 'bg-amber-500 text-white shadow-xs'
                            : idx === 1
                            ? 'bg-stone-300 text-stone-800'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}>
                          {idx + 1}
                        </span>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-xl object-cover border border-stone-200"
                          />
                        )}
                        <div>
                          <h5 className="font-extrabold text-stone-900 text-xs">
                            {language === 'en' && item.nameEn ? item.nameEn : item.name}
                          </h5>
                          <span className="text-[11px] text-stone-400 font-bold">
                            ฿{item.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-orange-100 text-orange-700 text-xs font-black px-2.5 py-1 rounded-xl">
                          {item.count} {language === 'th' ? 'ที่' : 'sold'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Peak Hours Hourly Chart */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{language === 'th' ? 'ช่วงเวลาที่มียอดขายสูงสุด (Peak Hours)' : 'Hourly Sales Distribution'}</span>
                </h4>
                <span className="text-[11px] font-bold text-stone-400">24 Hours</span>
              </div>

              {/* 24-Hour Bar Visualizer */}
              <div className="space-y-2 py-2">
                <div className="flex items-end gap-1 h-32 pt-4 px-1">
                  {metrics.hourlySales.map((sales, hr) => {
                    const heightPercent = sales > 0 ? Math.max((sales / metrics.maxHourlySales) * 100, 8) : 4;
                    const isPeak = sales === metrics.maxHourlySales && sales > 0;

                    return (
                      <div key={hr} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip */}
                        {sales > 0 && (
                          <div className="absolute -top-8 bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 pointer-events-none shadow-md">
                            {hr}:00 - ฿{sales.toLocaleString()}
                          </div>
                        )}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-sm shadow-orange-500/40'
                              : sales > 0
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : 'bg-stone-200'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-bold px-1 border-t border-stone-100 pt-1">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:59</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600 font-medium flex items-center justify-between">
                <span>💡 {language === 'th' ? 'ชั่วโมงยอดนิยมช่วยวางแผนเตรียมวัตถุดิบและพนักงาน' : 'Peak hours assist in staffing & prep inventory'}</span>
              </div>
            </div>
          </div>

          {/* Section: Recent Orders Log in this period */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-black text-stone-900 text-sm">
                {language === 'th' ? 'รายการบิลออเดอร์ย้อนหลัง' : 'Orders History in Period'} ({filteredOrders.length})
              </h4>
              <span className="text-xs text-stone-400 font-bold">
                {language === 'th' ? 'แสดงรายการทั้งหมด' : 'Showing all records'}
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs font-bold">
                {language === 'th' ? 'ไม่พบข้อมูลออเดอร์ในช่วงเวลานี้' : 'No order history in this timeframe'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-[11px] font-black text-stone-400 uppercase">
                      <th className="pb-2 pl-2"># Order</th>
                      <th className="pb-2">Table</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Payment</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 pr-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredOrders.slice(0, 15).map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-2.5 pl-2 font-black text-stone-900">{o.orderNumber}</td>
                        <td className="py-2.5 font-bold text-stone-600">
                          {o.tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `Table ${o.tableNumber}`}
                        </td>
                        <td className="py-2.5 text-stone-400 font-medium">
                          {new Date(o.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            o.paymentMethod === 'promptpay' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {o.paymentMethod === 'promptpay' ? 'PromptPay' : 'Cash'}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            o.status === 'completed' ? 'bg-stone-100 text-stone-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-2 font-black text-stone-900 text-right">
                          ฿{o.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* 3. Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between flex-shrink-0">
          <div className="text-xs font-bold text-stone-500">
            {language === 'th' ? `สรุปยอดทั้งหมด: ฿${metrics.totalSales.toLocaleString()} (${metrics.totalBills} บิล)` : `Total: ฿${metrics.totalSales.toLocaleString()} (${metrics.totalBills} bills)`}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-black text-xs sm:text-sm transition cursor-pointer active:scale-95"
          >
            {t('close', language)}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};