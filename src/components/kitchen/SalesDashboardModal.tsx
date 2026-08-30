import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, TrendingUp, Receipt, CreditCard, 
  Award, Clock, Download, BarChart3, 
  ArrowRight, CheckCircle2, Flame, ShoppingBag,
  CalendarRange, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Order, Language } from '../../types';
import { t } from '../../utils/i18n';

interface SalesDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  language: Language;
}

type TimePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'all' | 'custom';

export const SalesDashboardModal: React.FC<SalesDashboardModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  language,
}) => {
  // 1. All State Hooks
  const [preset, setPreset] = useState<TimePreset>('today');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Interactive Custom Calendar State (Compact corner view)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [activeDateTab, setActiveDateTab] = useState<'start' | 'end'>('start');

  // 2. All Effect Hooks
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Safe helper to parse local YYYY-MM-DD
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-').map(Number);
    return new Date(parts[0] || new Date().getFullYear(), (parts[1] || 1) - 1, parts[2] || 1);
  };

  const formatPrice = (amount: number | undefined | null) => {
    const num = Number(amount);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const formatTimeDisplay = (dateStr: string | undefined | null, lang: Language) => {
    if (!dateStr) return '--:--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  // 3. All Memo Hooks (MUST BE CALLED UNCONDITIONALLY BEFORE ANY RETURN)
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    return orders.filter((o) => {
      if (!o || o.status === 'cancelled') return false;
      const orderDate = new Date(o.createdAt);
      if (isNaN(orderDate.getTime())) return false;

      switch (preset) {
        case 'today':
          return orderDate >= todayStart;
        case 'yesterday':
          return orderDate >= yesterdayStart && orderDate <= yesterdayEnd;
        case '7days':
          return orderDate >= sevenDaysAgo;
        case '30days':
          return orderDate >= thirtyDaysAgo;
        case 'thisMonth':
          return orderDate >= thisMonthStart;
        case 'custom': {
          const partsS = (customStart || '').split('-').map(Number);
          const partsE = (customEnd || '').split('-').map(Number);
          const start = new Date(partsS[0] || 2020, (partsS[1] || 1) - 1, partsS[2] || 1, 0, 0, 0);
          const end = new Date(partsE[0] || 2030, (partsE[1] || 1) - 1, partsE[2] || 1, 23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, preset, customStart, customEnd]);

  const metrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);
    const totalBills = filteredOrders.length;
    const avgTicket = totalBills > 0 ? Math.round(totalSales / totalBills) : 0;

    // Payment methods
    const promptpayOrders = filteredOrders.filter((o) => o?.paymentMethod === 'promptpay');
    const cashOrders = filteredOrders.filter((o) => o?.paymentMethod === 'cash');
    const promptpaySales = promptpayOrders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);
    const cashSales = cashOrders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);
    const promptpayPercent = totalSales > 0 ? Math.round((promptpaySales / totalSales) * 100) : 0;
    const cashPercent = totalSales > 0 ? 100 - promptpayPercent : 0;

    // Best Sellers Ranking
    const itemSalesMap: Record<string, { name: string; nameEn?: string; count: number; revenue: number; image?: string }> = {};
    filteredOrders.forEach((order) => {
      (order?.items || []).forEach((item) => {
        if (!item) return;
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
        itemSalesMap[key].count += (Number(item.quantity) || 1);
        itemSalesMap[key].revenue += (Number(item.totalItemPrice) || 0);
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
      if (!o?.createdAt) return;
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) {
        const hr = d.getHours();
        if (hr >= 0 && hr < 24) {
          hourlyCounts[hr] += 1;
          hourlySales[hr] += (Number(o.totalPrice) || 0);
        }
      }
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
      topItems,
      maxItemCount,
      hourlySales,
      hourlyCounts,
      maxHourlySales,
      peakHourIndex,
      peakHourSales,
    };
  }, [filteredOrders]);

  const daysSelectedCount = useMemo(() => {
    if (!customStart || !customEnd) return 1;
    try {
      const s = parseLocalDate(customStart).getTime();
      const e = parseLocalDate(customEnd).getTime();
      const diff = Math.round(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diff) ? 1 : diff;
    } catch {
      return 1;
    }
  }, [customStart, customEnd]);

  // Calendar Grid Generator
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean; isStart: boolean; isEnd: boolean; isInRange: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dStr = new Date(year, month - 1, d).toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isStart: dStr === customStart,
        isEnd: dStr === customEnd,
        isInRange: dStr > customStart && dStr < customEnd,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isStart: dStr === customStart,
        isEnd: dStr === customEnd,
        isInRange: dStr > customStart && dStr < customEnd,
      });
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dStr = new Date(year, month + 1, d).toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isStart: dStr === customStart,
        isEnd: dStr === customEnd,
        isInRange: dStr > customStart && dStr < customEnd,
      });
    }

    return days;
  }, [calendarMonth, customStart, customEnd]);

  const getPresetLabel = (p: TimePreset) => {
    switch (p) {
      case 'today': return language === 'th' ? 'วันนี้' : 'Today';
      case 'yesterday': return language === 'th' ? 'เมื่อวานนี้' : 'Yesterday';
      case '7days': return language === 'th' ? '7 วันล่าสุด' : '7 Days';
      case '30days': return language === 'th' ? '30 วันล่าสุด' : '30 Days';
      case 'thisMonth': return language === 'th' ? 'เดือนนี้' : 'This Month';
      case 'all': return language === 'th' ? 'ทั้งหมด' : 'All Time';
      case 'custom': return language === 'th' ? 'กำหนดช่วงเวลา' : 'Custom Range';
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = parseLocalDate(dateStr);
      return d.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // 4. Infographic-Structured CSV Report Export
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const isTh = language === 'th';
    const now = new Date();
    const generatedDate = now.toLocaleString(isTh ? 'th-TH' : 'en-US');
    const rangeLabel = preset === 'custom'
      ? `${formatDisplayDate(customStart)} - ${formatDisplayDate(customEnd)} (${daysSelectedCount} ${isTh ? 'วัน' : 'days'})`
      : getPresetLabel(preset);

    const escapeCsv = (str: string | number | undefined | null) => {
      const s = String(str ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines: string[] = [];

    // Header Banner
    lines.push(escapeCsv('════════════════════════════════════════════════════════════════════════════════════════'));
    lines.push(escapeCsv(isTh ? '📊 รายงานสรุปผลประกอบการ & สถิติยอดขาย (EXECUTIVE SALES & BUSINESS REPORT)' : '📊 EXECUTIVE SALES & BUSINESS ANALYTICS REPORT'));
    lines.push(escapeCsv('════════════════════════════════════════════════════════════════════════════════════════'));
    lines.push(`${escapeCsv(isTh ? 'วันที่ออกรายงาน (Generated Date)' : 'Generated Date')},${escapeCsv(generatedDate)}`);
    lines.push(`${escapeCsv(isTh ? 'รอบเวลาที่วิเคราะห์ (Timeframe)' : 'Selected Timeframe')},${escapeCsv(rangeLabel)}`);
    lines.push(`${escapeCsv(isTh ? 'สถานะรายงาน (Report Status)' : 'Report Status')},${escapeCsv(isTh ? 'เสร็จสมบูรณ์ (Verified Data)' : 'Verified Realtime Data')}`);
    lines.push('');

    // Section 1: KPI Summary
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(escapeCsv(isTh ? '📌 1. สรุปตัวชี้วัดประสิทธิภาพหลัก (KEY PERFORMANCE INDICATORS)' : '📌 1. KEY PERFORMANCE INDICATORS (KPIs)'));
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(`${escapeCsv(isTh ? 'ตัวชี้วัด (Metric)' : 'Metric')},${escapeCsv(isTh ? 'มูลค่า (Value)' : 'Value')},${escapeCsv(isTh ? 'หน่วย (Unit)' : 'Unit')},${escapeCsv(isTh ? 'คำอธิบาย (Notes)' : 'Notes')}`);
    lines.push(`${escapeCsv(isTh ? 'ยอดขายรวมสุทธิ (Total Revenue)' : 'Total Revenue')},${metrics.totalSales},${escapeCsv(isTh ? 'บาท (THB)' : 'THB')},${escapeCsv(isTh ? 'ยอดบิลทั้งหมดที่เสร็จสิ้น' : 'Total completed sales')}`);
    lines.push(`${escapeCsv(isTh ? 'จำนวนออเดอร์ทั้งหมด (Total Orders)' : 'Total Orders')},${metrics.totalBills},${escapeCsv(isTh ? 'บิล (Bills)' : 'Bills')},${escapeCsv(isTh ? 'ออเดอร์ที่ไม่ถูกยกเลิก' : 'Non-cancelled orders')}`);
    lines.push(`${escapeCsv(isTh ? 'ยอดเฉลี่ยต่อบิล (Avg. Ticket Size)' : 'Average Ticket Size')},${metrics.avgTicket},${escapeCsv(isTh ? 'บาท / บิล (THB/Bill)' : 'THB/Bill')},${escapeCsv(isTh ? 'ค่าเฉลี่ยการใช้จ่ายต่อโต๊ะ' : 'Average spend per table')}`);
    lines.push(`${escapeCsv(isTh ? 'ยอดชำระด้วยพร้อมเพย์ (PromptPay)' : 'PromptPay Revenue')},${metrics.promptpaySales},${escapeCsv(isTh ? 'บาท (THB)' : 'THB')},${escapeCsv(`${metrics.promptpayPercent}% (${metrics.promptpayCount} ${isTh ? 'บิล' : 'bills'})`)}`);
    lines.push(`${escapeCsv(isTh ? 'ยอดชำระด้วยเงินสด (Cash)' : 'Cash Revenue')},${metrics.cashSales},${escapeCsv(isTh ? 'บาท (THB)' : 'THB')},${escapeCsv(`${metrics.cashPercent}% (${metrics.cashCount} ${isTh ? 'บิล' : 'bills'})`)}`);
    lines.push('');

    // Section 2: Top Best Sellers
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(escapeCsv(isTh ? '🏆 2. 5 อันดับเมนูขายดีที่สุด (TOP 5 BEST SELLING MENU ITEMS)' : '🏆 2. TOP 5 BEST SELLING DISHES'));
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(`${escapeCsv(isTh ? 'อันดับ (Rank)' : 'Rank')},${escapeCsv(isTh ? 'ชื่อเมนู (Menu Name)' : 'Menu Name (TH)')},${escapeCsv(isTh ? 'ชื่อภาษาอังกฤษ (English Name)' : 'English Name')},${escapeCsv(isTh ? 'จำนวนที่ขายได้ (Qty Sold)' : 'Qty Sold')},${escapeCsv(isTh ? 'ยอดขายรวม (Total Revenue THB)' : 'Total Revenue (THB)')},${escapeCsv(isTh ? 'สัดส่วนยอดขาย (% Share)' : '% Revenue Share')}`);
    metrics.topItems.forEach((item, idx) => {
      const share = metrics.totalSales > 0 ? ((item.revenue / metrics.totalSales) * 100).toFixed(1) : '0';
      lines.push(`${escapeCsv(`#${idx + 1}`)},${escapeCsv(item.name)},${escapeCsv(item.nameEn || '-')},${item.count},${item.revenue},${escapeCsv(`${share}%`)}`);
    });
    lines.push('');

    // Section 3: 24-Hour Hourly Peak Traffic
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(escapeCsv(isTh ? '⏰ 3. สถิติยอดขายรายชั่วโมง 24 ชม. (24-HOUR PEAK HOURLY TRAFFIC)' : '⏰ 3. 24-HOUR HOURLY TRAFFIC & REVENUE'));
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(`${escapeCsv(isTh ? 'ช่วงเวลา (Time Window)' : 'Time Window')},${escapeCsv(isTh ? 'จำนวนบิล (Orders)' : 'Orders Count')},${escapeCsv(isTh ? 'ยอดขาย (Revenue THB)' : 'Revenue (THB)')},${escapeCsv(isTh ? 'ระดับความหนาแน่น (Traffic Level)' : 'Traffic Level')}`);
    metrics.hourlySales.forEach((sales, hr) => {
      if (sales > 0 || metrics.hourlyCounts[hr] > 0) {
        const hrStart = String(hr).padStart(2, '0') + ':00';
        const hrEnd = String(hr).padStart(2, '0') + ':59';
        const isPeak = sales === metrics.maxHourlySales && sales > 0;
        const level = isPeak ? (isTh ? '🔥 ช่วงพีคสูงสุด (Peak Traffic)' : '🔥 PEAK TRAFFIC') : (isTh ? 'ปกติ (Normal)' : 'Normal');
        lines.push(`${escapeCsv(`${hrStart} - ${hrEnd}`)},${metrics.hourlyCounts[hr]},${sales},${escapeCsv(level)}`);
      }
    });
    lines.push('');

    // Section 4: Detailed Order Receipts Log
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(escapeCsv(isTh ? '🧾 4. รายการบิลออเดอร์ทั้งหมด (DETAILED ORDER RECEIPTS LOG)' : '🧾 4. DETAILED ORDER RECEIPTS LOG'));
    lines.push(escapeCsv('----------------------------------------------------------------------------------------'));
    lines.push(`${escapeCsv(isTh ? 'เลขออเดอร์ (Order #)' : 'Order #')},${escapeCsv(isTh ? 'โต๊ะ/ประเภท (Table/Type)' : 'Table/Type')},${escapeCsv(isTh ? 'วันและเวลา (Date & Time)' : 'Date & Time')},${escapeCsv(isTh ? 'รายการอาหาร (Items Ordered)' : 'Items Ordered')},${escapeCsv(isTh ? 'วิธีชำระเงิน (Payment Method)' : 'Payment Method')},${escapeCsv(isTh ? 'สถานะ (Status)' : 'Status')},${escapeCsv(isTh ? 'ยอดสุทธิ (Total THB)' : 'Total (THB)')}`);

    filteredOrders.forEach((o) => {
      const itemsList = (o.items || [])
        .map((i) => `${(isTh ? i.menuItem?.name : (i.menuItem?.nameEn || i.menuItem?.name)) || 'Item'} (x${i.quantity || 1})`)
        .join('; ');
      
      const payMethodLabel = o.paymentMethod === 'promptpay' ? (isTh ? 'พร้อมเพย์ (PromptPay)' : 'PromptPay') : (isTh ? 'เงินสด (Cash)' : 'Cash');
      const statusLabel = o.status === 'completed' ? (isTh ? 'เสร็จสิ้น' : 'Completed') : o.status === 'ready' ? (isTh ? 'พร้อมเสิร์ฟ' : 'Ready') : (isTh ? 'กำลังทำ' : 'Cooking');
      const tableLabel = o.tableNumber === 'TAKEAWAY' ? (isTh ? 'สั่งกลับบ้าน (Takeaway)' : 'Takeaway') : `${isTh ? 'โต๊ะ' : 'Table'} ${o.tableNumber || '-'}`;

      lines.push([
        escapeCsv(o.orderNumber || '-'),
        escapeCsv(tableLabel),
        escapeCsv(new Date(o.createdAt).toLocaleString(isTh ? 'th-TH' : 'en-US')),
        escapeCsv(itemsList),
        escapeCsv(payMethodLabel),
        escapeCsv(statusLabel),
        o.totalPrice || 0,
      ].join(','));
    });

    // Generate Downloadable CSV with UTF-8 BOM
    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Analytics_Infographic_${preset}_${now.toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelectCalendarDate = (dateStr: string) => {
    if (activeDateTab === 'start') {
      setCustomStart(dateStr);
      if (dateStr > customEnd) {
        setCustomEnd(dateStr);
      }
      setActiveDateTab('end');
    } else {
      if (dateStr < customStart) {
        setCustomStart(dateStr);
      } else {
        setCustomEnd(dateStr);
      }
      setActiveDateTab('start');
    }
  };

  const setShortcutRange = (type: 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last7' | 'last30') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (type === 'thisWeek') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      setCustomStart(monday.toISOString().split('T')[0]);
      setCustomEnd(todayStr);
    } else if (type === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setCustomStart(firstDay.toISOString().split('T')[0]);
      setCustomEnd(todayStr);
    } else if (type === 'lastMonth') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setCustomStart(firstDayLastMonth.toISOString().split('T')[0]);
      setCustomEnd(lastDayLastMonth.toISOString().split('T')[0]);
    } else if (type === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setCustomStart(d.toISOString().split('T')[0]);
      setCustomEnd(todayStr);
    } else if (type === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      setCustomStart(d.toISOString().split('T')[0]);
      setCustomEnd(todayStr);
    }
  };

  // 5. Early return AFTER ALL HOOKS ARE CALLED
  if (!isOpen) return null;

  const monthNamesTh = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const curMonthName = language === 'th' ? monthNamesTh[calendarMonth.getMonth()] : monthNamesEn[calendarMonth.getMonth()];
  const curYearDisplay = language === 'th' ? calendarMonth.getFullYear() + 543 : calendarMonth.getFullYear();

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
      {/* Full-Screen Glassmorphic Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Modal Card Container */}
      <div className="relative w-full max-w-5xl bg-[#fcfbf9] rounded-[36px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200/90 z-10 flex flex-col max-h-[92vh] selection:bg-emerald-500 selection:text-white">
        
        {/* 1. Header (Clean Obsidian with single X close button & CSV export only) */}
        <div className="px-6 py-4 sm:py-5 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border-b border-stone-800/80 flex items-center justify-between text-white flex-shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 flex-shrink-0">
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
                {language === 'th' ? 'แดชบอร์ดสรุปยอดขาย' : 'Sales Analytics'}
              </h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                {language === 'th' ? 'สรุปผลประกอบการ สินค้าขายดี และช่วงเวลาพีคของร้าน' : 'Revenue metrics, best sellers, and peak hourly traffic'}
              </p>
            </div>
          </div>

          {/* Action Tools (CSV only + Single X Close Button) */}
          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-emerald-500/30 shadow-2xs"
              title="Export CSV Data"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 ml-1 border border-white/10"
              title={t('close', language)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 bg-[#fcfbf9]">
          
          {/* Top Segmented Navigation & Compact Date Picker */}
          <div className="bg-white rounded-3xl p-3.5 border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Preset Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                {(['today', 'yesterday', '7days', '30days', 'thisMonth', 'all', 'custom'] as TimePreset[]).map((p) => {
                  const isActive = preset === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPreset(p)}
                      className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200/70'
                      }`}
                    >
                      {getPresetLabel(p)}
                    </button>
                  );
                })}
              </div>

              {/* Status Tag */}
              {preset === 'custom' ? (
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{daysSelectedCount} {language === 'th' ? 'วันที่เลือก' : 'days selected'}</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold text-stone-400">
                  {language === 'th' ? `ข้อมูล ณ ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.` : `Updated ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              )}
            </div>

            {/* Compact Corner Date Range Picker (Side-by-side balanced card) */}
            {preset === 'custom' && (
              <div className="p-3.5 sm:p-4 bg-stone-50/90 rounded-2xl border border-stone-200/90 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                  
                  {/* Left Column: Date Range Cards + Shortcuts */}
                  <div className="md:col-span-5 space-y-2.5">
                    {/* Start Date Card */}
                    <div
                      onClick={() => setActiveDateTab('start')}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                        activeDateTab === 'start'
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white/90 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-400 mb-0.5">
                        <span>{language === 'th' ? '1. วันที่เริ่มต้น' : '1. Start Date'}</span>
                        {activeDateTab === 'start' && <span className="text-emerald-600 font-bold">● {language === 'th' ? 'กำลังเลือก' : 'Selecting'}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-black text-stone-900">
                          {formatDisplayDate(customStart)}
                        </span>
                      </div>
                    </div>

                    {/* End Date Card */}
                    <div
                      onClick={() => setActiveDateTab('end')}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                        activeDateTab === 'end'
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white/90 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-400 mb-0.5">
                        <span>{language === 'th' ? '2. วันที่สิ้นสุด' : '2. End Date'}</span>
                        {activeDateTab === 'end' && <span className="text-emerald-600 font-bold">● {language === 'th' ? 'กำลังเลือก' : 'Selecting'}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-xs sm:text-sm font-black text-stone-900">
                          {formatDisplayDate(customEnd)}
                        </span>
                      </div>
                    </div>

                    {/* Compact Shortcuts */}
                    <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setShortcutRange('last7')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/80 font-bold transition cursor-pointer shadow-2xs"
                      >
                        {language === 'th' ? '7 วัน' : '7 Days'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShortcutRange('thisWeek')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/80 font-bold transition cursor-pointer shadow-2xs"
                      >
                        {language === 'th' ? 'สัปดาห์นี้' : 'This Week'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShortcutRange('thisMonth')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/80 font-bold transition cursor-pointer shadow-2xs"
                      >
                        {language === 'th' ? 'เดือนนี้' : 'This Month'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShortcutRange('last30')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/80 font-bold transition cursor-pointer shadow-2xs"
                      >
                        {language === 'th' ? '30 วัน' : '30 Days'}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Mini Compact Calendar */}
                  <div className="md:col-span-7 bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    {/* Calendar Month Header */}
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-stone-100">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                        className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-xs font-black text-stone-900">
                        {curMonthName} {curYearDisplay}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                        className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-stone-400 mb-1">
                      <span>{language === 'th' ? 'อา' : 'Su'}</span>
                      <span>{language === 'th' ? 'จ' : 'Mo'}</span>
                      <span>{language === 'th' ? 'อ' : 'Tu'}</span>
                      <span>{language === 'th' ? 'พ' : 'We'}</span>
                      <span>{language === 'th' ? 'พฤ' : 'Th'}</span>
                      <span>{language === 'th' ? 'ศ' : 'Fr'}</span>
                      <span>{language === 'th' ? 'ส' : 'Sa'}</span>
                    </div>

                    {/* Day Cells (Compact h-7) */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => {
                        const isSelected = day.isStart || day.isEnd;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectCalendarDate(day.dateStr)}
                            className={`h-7 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-xs scale-105 z-10'
                                : day.isInRange
                                ? 'bg-emerald-50 text-emerald-900 font-extrabold'
                                : day.isCurrentMonth
                                ? 'hover:bg-stone-100 text-stone-800'
                                : 'text-stone-300 hover:bg-stone-50'
                            } ${day.isToday && !isSelected ? 'border border-emerald-400 font-black text-emerald-700' : ''}`}
                          >
                            {day.dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* 4 Premium KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* KPI 1: Total Sales */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ยอดขายรวม' : 'Total Revenue'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shadow-xs border border-emerald-100">
                  ฿
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-baseline gap-1">
                  <span>฿{formatPrice(metrics.totalSales)}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-black flex items-center gap-1 mt-1.5 bg-emerald-50/90 px-2.5 py-0.5 rounded-lg w-fit border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{metrics.totalBills} {language === 'th' ? 'บิลเสร็จสิ้น' : 'bills'}</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between group hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'จำนวนออเดอร์' : 'Total Orders'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-xs border border-orange-100">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {metrics.totalBills} <span className="text-xs font-bold text-stone-400">{language === 'th' ? 'บิล' : 'bills'}</span>
                </div>
                <div className="text-[11px] text-orange-800 font-bold flex items-center gap-1 mt-1.5 bg-orange-50/90 px-2.5 py-0.5 rounded-lg w-fit border border-orange-200/60">
                  <span>{language === 'th' ? 'ในรอบเวลาที่เลือก' : 'in timeframe'}</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Average Ticket Size */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between group hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ยอดเฉลี่ย / บิล' : 'Avg. Ticket Size'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-xs border border-blue-100">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  ฿{formatPrice(metrics.avgTicket)}
                </div>
                <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1 mt-1.5 bg-blue-50/90 px-2.5 py-0.5 rounded-lg w-fit border border-blue-200/60">
                  <span>{language === 'th' ? 'เฉลี่ยต่อโต๊ะ' : 'per receipt'}</span>
                </div>
              </div>
            </div>

            {/* KPI 4: Payment Split with Progress Visualizer */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between group hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-400" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  {language === 'th' ? 'ช่องทางชำระเงิน' : 'Payment Split'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shadow-xs border border-purple-100">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2 space-y-2">
                {/* Segmented Progress Bar */}
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
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
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-xs" />
                      {language === 'th' ? 'พร้อมเพย์' : 'PromptPay'} ({metrics.promptpayCount})
                    </span>
                    <span className="font-black text-stone-800">฿{formatPrice(metrics.promptpaySales)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
                      {language === 'th' ? 'เงินสด' : 'Cash'} ({metrics.cashCount})
                    </span>
                    <span className="font-black text-stone-800">฿{formatPrice(metrics.cashSales)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Best Sellers & Peak Hours Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Column: Top 5 Best Sellers */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{language === 'th' ? '5 อันดับเมนูขายดีที่สุด' : 'Top 5 Best Selling Dishes'}</span>
                </h4>
                <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
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
                        className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/60 hover:bg-orange-50/40 hover:border-orange-200 transition-all duration-200 group"
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
                                loading="lazy"
                                decoding="async"
                                className="w-10 h-10 rounded-xl object-cover border border-stone-200/80 flex-shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                                ☕
                              </div>
                            )}

                            {/* Name & Revenue */}
                            <div className="min-w-0 flex-1">
                              <h5 className="font-black text-stone-900 text-xs sm:text-sm truncate group-hover:text-orange-600 transition-colors">
                                {language === 'en' && item.nameEn ? item.nameEn : item.name}
                              </h5>
                              <div className="text-[11px] text-stone-400 font-bold flex items-center gap-1.5 mt-0.5">
                                <span>{language === 'th' ? 'ยอดขาย:' : 'Revenue:'}</span>
                                <span className="font-extrabold text-stone-700">฿{formatPrice(item.revenue)}</span>
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
                        <div className="w-full bg-stone-200/60 h-1.5 rounded-full overflow-hidden mt-2.5 shadow-inner">
                          <div
                            style={{ width: `${relativePercent}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
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

            {/* Right Column: Peak Hours 24-Hour Graph */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>{language === 'th' ? 'ช่วงเวลาที่มียอดขายสูงสุด' : 'Peak Hours & Traffic'}</span>
                </h4>
                {metrics.peakHourSales > 0 && (
                  <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-orange-200/60">
                    <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                    {language === 'th' ? `พีคสุด: ${metrics.peakHourIndex}:00 น.` : `Peak: ${metrics.peakHourIndex}:00`}
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
                          {language === 'th'
                            ? `${hr}:00 น. • ฿${formatPrice(sales)} (${orderCount} บิล)`
                            : `${hr}:00 • ฿${formatPrice(sales)} (${orderCount} bills)`}
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
                <span className="w-7 h-7 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0 text-sm shadow-2xs">
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
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3.5">
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
                      <th className="pb-2.5 pl-3">{language === 'th' ? '# ออเดอร์' : '# Order'}</th>
                      <th className="pb-2.5">{language === 'th' ? 'โต๊ะ / ประเภท' : 'Table / Type'}</th>
                      <th className="pb-2.5">{language === 'th' ? 'เวลาที่สั่ง' : 'Time'}</th>
                      <th className="pb-2.5">{language === 'th' ? 'วิธีชำระเงิน' : 'Payment'}</th>
                      <th className="pb-2.5">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                      <th className="pb-2.5 pr-3 text-right">{language === 'th' ? 'ยอดรวม' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredOrders.slice(0, 15).map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 pl-3 font-black text-stone-900">{o.orderNumber || '-'}</td>
                        <td className="py-3 font-extrabold text-stone-700">
                          {o.tableNumber === 'TAKEAWAY' ? (
                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md text-[10px]">
                              {t('takeaway', language)}
                            </span>
                          ) : (
                            <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md text-[10px]">
                              {language === 'th' ? 'โต๊ะ' : 'Table'} {o.tableNumber || '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-stone-400 font-bold">
                          {formatTimeDisplay(o.createdAt, language)}{language === 'th' ? ' น.' : ''}
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-lg font-black text-[10px] inline-flex items-center gap-1 ${
                            o.paymentMethod === 'promptpay' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {o.paymentMethod === 'promptpay' ? (language === 'th' ? 'พร้อมเพย์' : 'PromptPay') : (language === 'th' ? 'เงินสด' : 'Cash')}
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
                            {o.status === 'completed' ? (language === 'th' ? 'เสร็จสิ้น' : 'Completed') : o.status === 'ready' ? (language === 'th' ? 'พร้อมเสิร์ฟ' : 'Ready') : (language === 'th' ? 'กำลังทำ' : 'Cooking')}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-black text-stone-900 text-right text-sm">
                          ฿{formatPrice(o.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* 3. Footer with Grand Total Only (No duplicate close button) */}
        <div className="px-6 py-3.5 bg-white border-t border-stone-200/80 flex items-center justify-between flex-shrink-0">
          <div className="text-xs sm:text-sm font-bold text-stone-600 flex items-center gap-2">
            <span>{language === 'th' ? 'สรุปยอดทั้งหมด:' : 'Grand Total:'}</span>
            <span className="text-lg font-black text-emerald-600">฿{formatPrice(metrics.totalSales)}</span>
            <span className="text-stone-400 text-xs font-bold">({metrics.totalBills} {language === 'th' ? 'บิล' : 'bills'})</span>
          </div>
          <div className="text-[11px] font-bold text-stone-400">
            {language === 'th' ? 'บันทึกข้อมูลเรียลไทม์' : 'Realtime recorded'}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};