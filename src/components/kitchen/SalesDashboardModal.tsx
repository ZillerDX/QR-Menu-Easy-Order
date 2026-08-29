import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, TrendingUp, DollarSign, Receipt, CreditCard, Banknote, 
  Sparkles, Award, Clock, ArrowUpRight, Printer, Download, Filter, BarChart3, 
  ChevronRight, ArrowRight, CheckCircle2, Flame, PieChart, ShoppingBag, Eye
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
    const promptpayPercent = totalSales > 0 ? Math.round((promptpaySales / totalSales) * 100) : 0;
    const cashPercent = totalSales > 0 ? 100 - promptpayPercent : 0;

    // Paid status
    const paidSales = filteredOrders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalPrice, 0);
    const unpaidSales = totalSales - paidSales;

    // Best Sellers Ranking
    const itemSalesMap: Record<string, { name: string; nameEn?: string; count: number; revenue: number; image?: string }> = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItem?.id || item.menuItem?.name || 'unknown';
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = {
            name: item.menuItem?.name || 'Unknown Item',
            nameEn: item.menuItem?.nameEn,
            count: 0,
            revenue: 0,
            image: item.menuItem?.imageUrl,
          };
        }
        itemSalesMap[key].count += item.quantity;
        itemSalesMap[key].revenue += item.totalItemPrice;
      });
    });

    const topItems = Object.values(itemSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxItemCount = Math.max(...topItems.map((i) => i.count), 1);

    // Hourly Distribution (0-23 hrs)
    const hourlyCounts: number[] = Array(24).fill(0);
    const hourlySales: number[] = Array(24).fill(0);
    filteredOrders.forEach((o) => {
      const hr = new Date(o.createdAt).getHours();
      hourlyCounts[hr] += 1;
      hourlySales[hr] += o.totalPrice;
    });

    const maxHourlySales = Math.max(...hourlySales, 1);
    const peakHourIndex = hourlySales.indexOf(Math.max(...hourlySales));
    const peakHourSales = hourlySales[peakHourIndex] || 0;

    return {
      totalSales,
      totalBills,
      avgTicket,
      promptpaySales,
      promptpayCount: promptpayOrders.length,
      promptpayPercent,
      cashSales,
      cashCount: cashOrders.length,
      cashPercent,
      paidSales,
      unpaidSales,
      topItems,
      maxItemCount,
      hourlySales,
      hourlyCounts,
      maxHourlySales,
      peakHourIndex,
      peakHourSales,
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
      case '7days': return language === 'th' ? '7 วันล่าสุด' : '7 Days';
      case '30days': return language === 'th' ? '30 วันล่าสุด' : '30 Days';
      case 'all': return language === 'th' ? 'ทั้งหมด' : 'All Time';
      case 'custom': return language === 'th' ? 'กำหนดเอง' : 'Custom';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <div className="relative w-full max-w-5xl bg-[#fbfbfa] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[92vh]">
        
        {/* 1. Header with Modern Slate Styling & Glow Tag */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 font-black ring-2 ring-emerald-400/30">
              <BarChart3 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-lg sm:text-xl tracking-tight text-white">
                  {language === 'th' ? 'แดชบอร์ดสรุปยอดขาย' : 'Sales Analytics'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                {language === 'th' ? 'รายงานผลการขาย สินค้าขายดี และช่วงเวลาพีคแบบเรียลไทม์' : 'Real-time revenue, top selling dishes, and peak business hours'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto relative z-10">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-white/10 hover:text-white"
              title="Export CSV Data"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-white/10 hover:text-white"
              title="Print Summary Report"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="font-bold">{language === 'th' ? 'พิมพ์รายงาน' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          
          {/* Time Range Filter Floating Pill Bar */}
          <div className="bg-white rounded-3xl p-3 sm:p-3.5 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {(['today', 'yesterday', '7days', '30days', 'all', 'custom'] as TimePreset[]).map((p) => {
                const isActive = preset === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                        : 'bg-stone-100/90 hover:bg-stone-200/80 text-stone-700 hover:text-stone-900 border border-stone-200/60'
                    }`}
                  >
                    {getPresetLabel(p)}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Pickers */}
            {preset === 'custom' && (
              <div className="flex items-center gap-2 w-full md:w-auto animate-in fade-in bg-stone-50 p-1.5 rounded-2xl border border-stone-200">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-stone-200 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs text-stone-400 font-black">ถึง</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-stone-200 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* 4 Premium KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Total Sales */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ยอดขายรวม' : 'Total Revenue'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shadow-xs">
                  ฿
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  ฿{metrics.totalSales.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 font-black flex items-center gap-1.5 mt-1 bg-emerald-50/80 px-2 py-0.5 rounded-lg w-fit">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{metrics.totalBills} {language === 'th' ? 'บิลเสร็จสมบูรณ์' : 'completed bills'}</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'จำนวนออเดอร์' : 'Total Orders'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-xs">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {metrics.totalBills} <span className="text-xs font-bold text-stone-400">บิล</span>
                </div>
                <div className="text-[11px] text-orange-800 font-bold flex items-center gap-1.5 mt-1 bg-orange-50/80 px-2 py-0.5 rounded-lg w-fit">
                  <span>{language === 'th' ? 'ในรอบเวลาที่เลือก' : 'in timeframe'}</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Average Ticket Size */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ยอดเฉลี่ย / บิล' : 'Avg. Ticket Size'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  ฿{metrics.avgTicket.toLocaleString()}
                </div>
                <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1.5 mt-1 bg-blue-50/80 px-2 py-0.5 rounded-lg w-fit">
                  <span>{language === 'th' ? 'ค่าเฉลี่ยต่อใบเสร็จ' : 'per receipt'}</span>
                </div>
              </div>
            </div>

            {/* KPI 4: Payment Split with Progress Visualizer */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ช่องทางชำระเงิน' : 'Payment Split'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shadow-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2 space-y-2">
                {/* Visual Segmented Progress Bar */}
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${metrics.promptpayPercent}%` }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500"
                    title={`PromptPay: ${metrics.promptpayPercent}%`}
                  />
                  <div
                    style={{ width: `${metrics.cashPercent}%` }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500"
                    title={`Cash: ${metrics.cashPercent}%`}
                  />
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-blue-700">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      พร้อมเพย์ ({metrics.promptpayCount})
                    </span>
                    <span className="font-black text-stone-800">฿{metrics.promptpaySales.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      เงินสด ({metrics.cashCount})
                    </span>
                    <span className="font-black text-stone-800">฿{metrics.cashSales.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Best Sellers & Peak Hours Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Column: Top 5 Best Sellers with Ranking Badges & Progress */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{language === 'th' ? '5 อันดับเมนูขายดีที่สุด' : 'Top 5 Best Selling Dishes'}</span>
                </h4>
                <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  {language === 'th' ? 'ยอดนิยม' : 'Popularity'}
                </span>
              </div>

              {metrics.topItems.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs font-bold space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-stone-300" />
                  <p>{language === 'th' ? 'ยังไม่มีข้อมูลการขายในรอบเวลานี้' : 'No sales recorded in this period'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.topItems.map((item, idx) => {
                    const relativePercent = (item.count / metrics.maxItemCount) * 100;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/60 hover:bg-orange-50/40 hover:border-orange-200 transition group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Rank Badge */}
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs ${
                              idx === 0
                                ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 font-black ring-2 ring-amber-300/40'
                                : idx === 1
                                ? 'bg-gradient-to-tr from-stone-300 to-stone-400 text-stone-900 font-black'
                                : idx === 2
                                ? 'bg-gradient-to-tr from-amber-700 to-amber-800 text-white font-black'
                                : 'bg-stone-200 text-stone-600 font-bold'
                            }`}>
                              {idx + 1}
                            </span>

                            {/* Item Image */}
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover border border-stone-200/80 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                                ☕
                              </div>
                            )}

                            {/* Name & Revenue */}
                            <div className="min-w-0 flex-1">
                              <h5 className="font-black text-stone-900 text-xs sm:text-sm truncate">
                                {language === 'en' && item.nameEn ? item.nameEn : item.name}
                              </h5>
                              <div className="text-[11px] text-stone-400 font-bold flex items-center gap-1.5 mt-0.5">
                                <span>ยอดขาย:</span>
                                <span className="font-extrabold text-stone-700">฿{item.revenue.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Sold Count Badge */}
                          <div className="text-right flex-shrink-0">
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs shadow-orange-500/20 inline-block">
                              {item.count} {language === 'th' ? 'ที่' : 'sold'}
                            </span>
                          </div>
                        </div>

                        {/* Relative Volume Progress Bar */}
                        <div className="w-full bg-stone-200/60 h-1.5 rounded-full overflow-hidden mt-2.5">
                          <div
                            style={{ width: `${relativePercent}%` }}
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-amber-500' : 'bg-orange-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Peak Hours 24-Hour Graph with Visualizer */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>{language === 'th' ? 'ช่วงเวลาที่มียอดขายสูงสุด' : 'Peak Hours & Traffic'}</span>
                </h4>
                {metrics.peakHourSales > 0 && (
                  <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    พีคสุด: {metrics.peakHourIndex}:00 น.
                  </span>
                )}
              </div>

              {/* 24-Hour Interactive Bar Visualizer */}
              <div className="py-2 space-y-2">
                <div className="flex items-end gap-1.5 h-36 pt-6 px-1">
                  {metrics.hourlySales.map((sales, hr) => {
                    const heightPercent = sales > 0 ? Math.max((sales / metrics.maxHourlySales) * 100, 10) : 4;
                    const isPeak = sales === metrics.maxHourlySales && sales > 0;
                    const orderCount = metrics.hourlyCounts[hr] || 0;

                    return (
                      <div key={hr} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        {/* Hover Floating Tooltip */}
                        <div className="absolute -top-10 bg-stone-900 text-white text-[10px] font-black px-2.5 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 pointer-events-none shadow-xl border border-stone-700">
                          {hr}:00 น. • ฿{sales.toLocaleString()} ({orderCount} บิล)
                        </div>

                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-md shadow-orange-500/30 group-hover:brightness-110'
                              : sales > 0
                              ? 'bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-500 shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Hour Timeline Legend */}
                <div className="flex justify-between text-[10px] text-stone-400 font-bold px-1 border-t border-stone-100 pt-1.5">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:59</span>
                </div>
              </div>

              {/* Peak Hour Smart Suggestion Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 font-bold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0 text-sm">
                  💡
                </span>
                <span className="leading-snug text-[11px] sm:text-xs">
                  {language === 'th'
                    ? 'สถิติชั่วโมงยอดนิยมช่วยให้คุณวางแผนเตรียมวัตถุดิบและจัดกำลังพนักงานได้อย่างแม่นยำ'
                    : 'Peak hour analytics help optimize inventory preparation and staff scheduling.'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Recent Orders Log in this period */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-stone-700" />
                <span>{language === 'th' ? 'รายการบิลออเดอร์ในช่วงเวลานี้' : 'Order Receipts Log'}</span>
                <span className="bg-stone-100 text-stone-700 text-xs font-black px-2.5 py-0.5 rounded-full">
                  {filteredOrders.length}
                </span>
              </h4>
              <span className="text-xs text-stone-400 font-bold">
                {language === 'th' ? 'แสดงรายการล่าสุด' : 'Recent records'}
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-10 text-center text-stone-400 text-xs font-bold space-y-2">
                <Receipt className="w-8 h-8 mx-auto text-stone-300" />
                <p>{language === 'th' ? 'ไม่พบรายการออเดอร์ในช่วงเวลานี้' : 'No order history in this timeframe'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-[11px] font-black text-stone-400 uppercase">
                      <th className="pb-2.5 pl-3"># ออเดอร์</th>
                      <th className="pb-2.5">โต๊ะ / ประเภท</th>
                      <th className="pb-2.5">เวลาที่สั่ง</th>
                      <th className="pb-2.5">วิธีชำระเงิน</th>
                      <th className="pb-2.5">สถานะ</th>
                      <th className="pb-2.5 pr-3 text-right">ยอดรวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredOrders.slice(0, 15).map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 pl-3 font-black text-stone-900">{o.orderNumber}</td>
                        <td className="py-3 font-extrabold text-stone-700">
                          {o.tableNumber === 'TAKEAWAY' ? (
                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md text-[10px]">
                              {t('takeaway', language)}
                            </span>
                          ) : (
                            <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md text-[10px]">
                              โต๊ะ {o.tableNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-stone-400 font-bold">
                          {new Date(o.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-lg font-black text-[10px] inline-flex items-center gap-1 ${
                            o.paymentMethod === 'promptpay' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {o.paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 'เงินสด'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-lg font-black text-[10px] ${
                            o.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : o.status === 'ready' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status === 'completed' ? 'เสร็จสิ้น' : o.status === 'ready' ? 'พร้อมเสิร์ฟ' : 'กำลังทำ'}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-black text-stone-900 text-right text-sm">
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

        {/* 3. Footer with Clean Controls & Totals */}
        <div className="px-6 py-4 bg-white border-t border-stone-200/80 flex items-center justify-between flex-shrink-0">
          <div className="text-xs sm:text-sm font-bold text-stone-600 flex items-center gap-2">
            <span>สรุปยอดทั้งหมด:</span>
            <span className="text-lg font-black text-emerald-600">฿{metrics.totalSales.toLocaleString()}</span>
            <span className="text-stone-400 text-xs">({metrics.totalBills} บิล)</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-black text-xs sm:text-sm transition cursor-pointer active:scale-95 shadow-md shadow-stone-900/10"
          >
            {t('close', language)}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};