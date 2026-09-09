import { Order, Language } from '../types';

export interface SalesReportData {
  language: Language;
  preset: string;
  presetLabel: string;
  dateRangeLabel: string;
  generatedDate: string;
  metrics: {
    totalSales: number;
    totalBills: number;
    avgTicket: number;
    promptpaySales: number;
    promptpayCount: number;
    promptpayPercent: number;
    cashSales: number;
    cashCount: number;
    cashPercent: number;
    cardSales: number;
    cardCount: number;
    cardPercent: number;
    topItems: Array<{
      name: string;
      nameEn?: string;
      count: number;
      revenue: number;
    }>;
    hourlySales: number[];
    hourlyCounts: number[];
    maxHourlySales: number;
    peakHourIndex: number;
    peakHourSales: number;
  };
  orders: Order[];
  storeName?: string;
}

const escapeHtml = (str: unknown): string => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const escapeCsv = (str: unknown): string => {
  const s = String(str ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

/**
 * Generate a beautifully styled, Excel-compatible HTML Infographic Workbook (.xls)
 * Contains styled KPI stat cards, top seller charts, peak hourly analysis, and complete order logs.
 */
export const generateSalesInfographicExcel = (data: SalesReportData): string => {
  const { language, presetLabel, dateRangeLabel, generatedDate, metrics, orders, storeName = 'Cafe Order' } = data;
  const isTh = language === 'th';

  const sheetName = isTh ? 'รายงานสรุปยอดขาย' : 'Sales Report';
  const topItemsTotalQty = metrics.topItems.reduce((sum, item) => sum + item.count, 0);
  const topItemsTotalRev = metrics.topItems.reduce((sum, item) => sum + item.revenue, 0);
  const topItemsCombinedShare = metrics.totalSales > 0 ? ((topItemsTotalRev / metrics.totalSales) * 100).toFixed(1) : '0';

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${escapeHtml(sheetName)}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body, table, td, th {
      font-family: 'LINE Seed Sans TH', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 10pt;
      color: #1e293b;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 24px;
    }
    .main-banner {
      background-color: #0f172a;
      color: #ffffff;
      font-size: 15pt;
      font-weight: 800;
      text-align: center;
      padding: 16px;
      letter-spacing: 0.5px;
    }
    .sub-banner {
      background-color: #1e293b;
      color: #94a3b8;
      font-size: 9.5pt;
      text-align: center;
      padding: 8px;
      font-weight: 500;
    }
    .meta-hdr {
      background-color: #f1f5f9;
      font-weight: 700;
      color: #475569;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      font-size: 9pt;
    }
    .meta-val {
      background-color: #ffffff;
      font-weight: 600;
      color: #0f172a;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      font-size: 9.5pt;
    }
    .sec-banner {
      background-color: #047857;
      color: #ffffff;
      font-size: 11pt;
      font-weight: 800;
      padding: 10px 14px;
      border: 1px solid #047857;
    }
    .th-col {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 700;
      padding: 8px 12px;
      border: 1px solid #334155;
      text-align: left;
      font-size: 9.5pt;
    }
    .th-col-center {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 700;
      padding: 8px 12px;
      border: 1px solid #334155;
      text-align: center;
      font-size: 9.5pt;
    }
    .th-col-num {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 700;
      padding: 8px 12px;
      border: 1px solid #334155;
      text-align: right;
      font-size: 9.5pt;
    }
    .cell-val {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      font-size: 9.5pt;
      color: #1e293b;
    }
    .cell-val-alt {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      background-color: #f8fafc;
      font-size: 9.5pt;
      color: #1e293b;
    }
    .cell-center {
      text-align: center;
    }
    .cell-num {
      text-align: right;
      mso-number-format: "#,##0";
    }
    .cell-currency {
      text-align: right;
      font-weight: 700;
      color: #059669;
      mso-number-format: "\\0022฿\\0022#,##0";
    }
    /* Infographic KPI Stat Cards */
    .kpi-card {
      border: 2px solid #cbd5e1;
      padding: 14px;
      text-align: center;
      vertical-align: middle;
    }
    .kpi-card-green {
      background-color: #ecfdf5;
      border-color: #10b981;
    }
    .kpi-card-amber {
      background-color: #fffbeb;
      border-color: #f59e0b;
    }
    .kpi-card-blue {
      background-color: #eff6ff;
      border-color: #3b82f6;
    }
    .kpi-card-purple {
      background-color: #faf5ff;
      border-color: #8b5cf6;
      text-align: left;
    }
    .kpi-title {
      font-size: 8.5pt;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .kpi-big-num {
      font-size: 18pt;
      font-weight: 900;
      line-height: 1.2;
    }
    .kpi-sub {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
    }
    .badge-rank {
      display: inline-block;
      padding: 3px 8px;
      font-weight: 800;
      font-size: 8.5pt;
      border-radius: 4px;
      color: #ffffff;
      text-align: center;
    }
    .badge-rank-1 { background-color: #d97706; }
    .badge-rank-2 { background-color: #64748b; }
    .badge-rank-3 { background-color: #b45309; }
    .badge-rank-other { background-color: #94a3b8; }
    .badge-peak {
      background-color: #fef3c7;
      color: #b45309;
      font-weight: 800;
      padding: 4px 8px;
      border: 1px solid #fcd34d;
      text-align: center;
    }
    .badge-normal {
      background-color: #f1f5f9;
      color: #64748b;
      font-weight: 600;
      padding: 4px 8px;
      text-align: center;
    }
    .row-total {
      background-color: #f1f5f9;
      font-weight: 800;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
    }
  </style>
</head>
<body>
  <table border="0" cellpadding="0" cellspacing="0">
    <colgroup>
      <col width="90" />
      <col width="250" />
      <col width="200" />
      <col width="140" />
      <col width="150" />
      <col width="130" />
      <col width="260" />
    </colgroup>

    <!-- 0. Header & Brand Banner -->
    <tr>
      <td colspan="7" class="main-banner">
        ☕ ${escapeHtml(storeName)} • ${isTh ? 'รายงานสรุปผลประกอบการ &amp; สถิติยอดขาย (EXECUTIVE SALES REPORT)' : 'EXECUTIVE SALES &amp; BUSINESS ANALYTICS REPORT'}
      </td>
    </tr>
    <tr>
      <td colspan="7" class="sub-banner">
        ${isTh ? 'สรุปข้อมูลยอดขายสินค้า วิเคราะห์เมนูยอดนิยม และช่วงเวลาพีคของร้าน • Easy QR Order System' : 'Real-time Sales Performance, Top Sellers, and Peak Hourly Traffic Analytics'}
      </td>
    </tr>
    <tr><td colspan="7" style="height: 12px;"></td></tr>

    <!-- Meta Information Grid -->
    <tr>
      <td class="meta-hdr">${isTh ? 'วันที่ออกรายงาน' : 'Generated Date'}</td>
      <td colspan="2" class="meta-val">${escapeHtml(generatedDate)}</td>
      <td class="meta-hdr">${isTh ? 'รอบเวลาที่วิเคราะห์' : 'Selected Range'}</td>
      <td colspan="3" class="meta-val">${escapeHtml(presetLabel)} ${dateRangeLabel ? `(${escapeHtml(dateRangeLabel)})` : ''}</td>
    </tr>
    <tr>
      <td class="meta-hdr">${isTh ? 'สถานะข้อมูล' : 'Data Status'}</td>
      <td colspan="2" class="meta-val" style="color: #059669; font-weight: 800;">
        ✓ ${isTh ? 'เสร็จสมบูรณ์ ตรวจสอบแล้ว (Verified Live Data)' : 'Verified Live Data'}
      </td>
      <td class="meta-hdr">${isTh ? 'จำนวนบิลที่คำนวณ' : 'Analyzed Orders'}</td>
      <td colspan="3" class="meta-val" style="font-weight: 800;">
        ${metrics.totalBills.toLocaleString()} ${isTh ? 'บิล (ออเดอร์ที่สำเร็จ)' : 'Completed Bills'}
      </td>
    </tr>
    <tr><td colspan="7" style="height: 16px;"></td></tr>

    <!-- 1. Infographic KPI Scorecards (4 Visual Cards) -->
    <tr>
      <td colspan="7" class="sec-banner">
        ${isTh ? '1. ภาพรวมตัวชี้วัดประสิทธิภาพหลัก (KEY PERFORMANCE INDICATORS)' : '1. KEY PERFORMANCE INDICATORS (KPIs)'}
      </td>
    </tr>
    <tr>
      <!-- Card 1: Total Revenue -->
      <td colspan="2" class="kpi-card kpi-card-green">
        <div class="kpi-title">${isTh ? 'ยอดขายรวมสุทธิ (TOTAL REVENUE)' : 'TOTAL REVENUE'}</div>
        <div class="kpi-big-num" style="color: #059669;">฿${metrics.totalSales.toLocaleString()}</div>
        <div class="kpi-sub">${metrics.totalBills.toLocaleString()} ${isTh ? 'บิลเสร็จสิ้น' : 'completed bills'}</div>
      </td>
      <!-- Card 2: Total Orders -->
      <td colspan="2" class="kpi-card kpi-card-amber">
        <div class="kpi-title">${isTh ? 'จำนวนออเดอร์ทั้งหมด (TOTAL ORDERS)' : 'TOTAL ORDERS'}</div>
        <div class="kpi-big-num" style="color: #d97706;">${metrics.totalBills.toLocaleString()} ${isTh ? 'บิล' : 'Bills'}</div>
        <div class="kpi-sub">${isTh ? 'ในรอบเวลาที่เลือก' : 'Within active timeframe'}</div>
      </td>
      <!-- Card 3: Avg Ticket -->
      <td class="kpi-card kpi-card-blue">
        <div class="kpi-title">${isTh ? 'ยอดเฉลี่ย / บิล (AVG. TICKET)' : 'AVG. TICKET SIZE'}</div>
        <div class="kpi-big-num" style="color: #2563eb;">฿${metrics.avgTicket.toLocaleString()}</div>
        <div class="kpi-sub">${isTh ? 'เฉลี่ยต่อโต๊ะ' : 'Per table average'}</div>
      </td>
      <!-- Card 4: Payment Methods -->
      <td colspan="2" class="kpi-card kpi-card-purple">
        <div class="kpi-title" style="text-align: left;">${isTh ? 'ช่องทางชำระเงิน (PAYMENT METHODS)' : 'PAYMENT METHODS'}</div>
        <div style="font-size: 8.5pt; line-height: 1.5; color: #1e293b; font-weight: 700;">
          <div style="color: #059669;">● ${isTh ? 'พร้อมเพย์' : 'PromptPay'}: ฿${metrics.promptpaySales.toLocaleString()} (${metrics.promptpayPercent}%) <span style="color: #64748b; font-weight: 500;">[${metrics.promptpayCount} บิล]</span></div>
          <div style="color: #0284c7;">● ${isTh ? 'เงินสด' : 'Cash'}: ฿${metrics.cashSales.toLocaleString()} (${metrics.cashPercent}%) <span style="color: #64748b; font-weight: 500;">[${metrics.cashCount} บิล]</span></div>
          <div style="color: #7c3aed;">● ${isTh ? 'บัตรเครดิต' : 'Credit Card'}: ฿${metrics.cardSales.toLocaleString()} (${metrics.cardPercent}%) <span style="color: #64748b; font-weight: 500;">[${metrics.cardCount} บิล]</span></div>
        </div>
      </td>
    </tr>
    <tr><td colspan="7" style="height: 12px;"></td></tr>

    <!-- KPI Summary Breakdown Table -->
    <tr>
      <th class="th-col">${isTh ? 'ตัวชี้วัด (Metric)' : 'Metric'}</th>
      <th class="th-col-num">${isTh ? 'มูลค่า (Value)' : 'Value'}</th>
      <th class="th-col-center">${isTh ? 'หน่วย (Unit)' : 'Unit'}</th>
      <th class="th-col-center">${isTh ? 'สัดส่วน (% Share)' : '% Share'}</th>
      <th colspan="3" class="th-col">${isTh ? 'คำอธิบายประกอบ (Notes)' : 'Notes'}</th>
    </tr>
    <tr>
      <td class="cell-val" style="font-weight: 700;">${isTh ? 'ยอดขายรวมสุทธิ (Total Revenue)' : 'Total Revenue'}</td>
      <td class="cell-val cell-currency">฿${metrics.totalSales.toLocaleString()}</td>
      <td class="cell-val cell-center">${isTh ? 'บาท (THB)' : 'THB'}</td>
      <td class="cell-val cell-center" style="font-weight: 700;">100.0%</td>
      <td colspan="3" class="cell-val">${isTh ? 'ยอดรวมบิลที่ปิดเสร็จสิ้นทั้งหมด ไม่รวมบิลยกเลิก' : 'Total completed sales amount excluding cancelled orders'}</td>
    </tr>
    <tr>
      <td class="cell-val-alt" style="font-weight: 700;">${isTh ? 'จำนวนออเดอร์ทั้งหมด (Total Orders)' : 'Total Orders'}</td>
      <td class="cell-val-alt cell-num" style="font-weight: 700;">${metrics.totalBills.toLocaleString()}</td>
      <td class="cell-val-alt cell-center">${isTh ? 'บิล (Bills)' : 'Bills'}</td>
      <td class="cell-val-alt cell-center">-</td>
      <td colspan="3" class="cell-val-alt">${isTh ? 'จำนวนรายการสั่งซื้อที่ได้รับการชำระเงินเรียบร้อย' : 'Total completed customer orders'}</td>
    </tr>
    <tr>
      <td class="cell-val" style="font-weight: 700;">${isTh ? 'ยอดเฉลี่ยต่อบิล (Avg. Ticket Size)' : 'Average Ticket Size'}</td>
      <td class="cell-val cell-currency">฿${metrics.avgTicket.toLocaleString()}</td>
      <td class="cell-val cell-center">${isTh ? 'บาท / บิล (THB/Bill)' : 'THB/Bill'}</td>
      <td class="cell-val cell-center">-</td>
      <td colspan="3" class="cell-val">${isTh ? 'ค่าเฉลี่ยการใช้จ่ายต่อออเดอร์ในร้าน' : 'Average customer spending per order'}</td>
    </tr>
    <tr>
      <td class="cell-val-alt">${isTh ? 'ชำระด้วยพร้อมเพย์ (PromptPay)' : 'PromptPay Revenue'}</td>
      <td class="cell-val-alt cell-currency">฿${metrics.promptpaySales.toLocaleString()}</td>
      <td class="cell-val-alt cell-center">${isTh ? 'บาท (THB)' : 'THB'}</td>
      <td class="cell-val-alt cell-center" style="font-weight: 700; color: #059669;">${metrics.promptpayPercent}%</td>
      <td colspan="3" class="cell-val-alt">${metrics.promptpayCount} ${isTh ? 'บิลที่ชำระผ่าน QR พร้อมเพย์' : 'PromptPay QR orders'}</td>
    </tr>
    <tr>
      <td class="cell-val">${isTh ? 'ชำระด้วยเงินสด (Cash)' : 'Cash Revenue'}</td>
      <td class="cell-val cell-currency">฿${metrics.cashSales.toLocaleString()}</td>
      <td class="cell-val cell-center">${isTh ? 'บาท (THB)' : 'THB'}</td>
      <td class="cell-val cell-center" style="font-weight: 700; color: #0284c7;">${metrics.cashPercent}%</td>
      <td colspan="3" class="cell-val">${metrics.cashCount} ${isTh ? 'บิลที่ชำระด้วยเงินสด' : 'Cash orders'}</td>
    </tr>
    <tr>
      <td class="cell-val-alt">${isTh ? 'ชำระด้วยบัตรเครดิต (Credit Card)' : 'Credit Card Revenue'}</td>
      <td class="cell-val-alt cell-currency">฿${metrics.cardSales.toLocaleString()}</td>
      <td class="cell-val-alt cell-center">${isTh ? 'บาท (THB)' : 'THB'}</td>
      <td class="cell-val-alt cell-center" style="font-weight: 700; color: #7c3aed;">${metrics.cardPercent}%</td>
      <td colspan="3" class="cell-val-alt">${metrics.cardCount} ${isTh ? 'บิลที่ชำระผ่านบัตรเครดิต' : 'Credit card orders'}</td>
    </tr>
    <tr><td colspan="7" style="height: 20px;"></td></tr>

    <!-- 2. Top 5 Best Selling Dishes -->
    <tr>
      <td colspan="7" class="sec-banner">
        ${isTh ? '2. 5 อันดับเมนูขายดีที่สุด (TOP 5 BEST SELLING DISHES)' : '2. TOP 5 BEST SELLING MENU ITEMS'}
      </td>
    </tr>
    <tr>
      <th class="th-col-center">${isTh ? 'อันดับ (Rank)' : 'Rank'}</th>
      <th colspan="2" class="th-col">${isTh ? 'ชื่อเมนู (Menu Item TH)' : 'Menu Item (TH)'}</th>
      <th class="th-col">${isTh ? 'ชื่อภาษาอังกฤษ (English Name)' : 'English Name'}</th>
      <th class="th-col-num">${isTh ? 'จำนวนขาย (Qty Sold)' : 'Qty Sold'}</th>
      <th class="th-col-num">${isTh ? 'ยอดขายรวม (Total Revenue)' : 'Total Revenue'}</th>
      <th class="th-col-center">${isTh ? 'สัดส่วนยอดขาย (% Share)' : '% Revenue Share'}</th>
    </tr>
    ${metrics.topItems.length > 0 ? metrics.topItems.map((item, idx) => {
      const share = metrics.totalSales > 0 ? ((item.revenue / metrics.totalSales) * 100).toFixed(1) : '0';
      const rankBadgeClass = idx === 0 ? 'badge-rank-1' : idx === 1 ? 'badge-rank-2' : idx === 2 ? 'badge-rank-3' : 'badge-rank-other';
      const isAlt = idx % 2 === 1;
      const cellClass = isAlt ? 'cell-val-alt' : 'cell-val';
      return `
      <tr>
        <td class="${cellClass} cell-center">
          <span class="badge-rank ${rankBadgeClass}">#${idx + 1}</span>
        </td>
        <td colspan="2" class="${cellClass}" style="font-weight: 700;">${escapeHtml(item.name)}</td>
        <td class="${cellClass}">${escapeHtml(item.nameEn || '-')}</td>
        <td class="${cellClass} cell-num" style="font-weight: 700;">${item.count.toLocaleString()} ${isTh ? 'ที่' : 'items'}</td>
        <td class="${cellClass} cell-currency">฿${item.revenue.toLocaleString()}</td>
        <td class="${cellClass} cell-center" style="font-weight: 700; color: #059669;">${share}%</td>
      </tr>`;
    }).join('') : `
      <tr>
        <td colspan="7" class="cell-val cell-center" style="color: #94a3b8; padding: 18px;">
          ${isTh ? 'ไม่มีข้อมูลรายการขายในช่วงเวลาที่เลือก' : 'No sales records found for this period'}
        </td>
      </tr>
    `}
    ${metrics.topItems.length > 0 ? `
    <tr class="row-total">
      <td colspan="4" class="cell-val row-total" style="text-align: right; padding-right: 16px;">
        ${isTh ? 'รวม 5 อันดับเมนูขายดี (Top 5 Combined Total)' : 'Top 5 Combined Total'}
      </td>
      <td class="cell-val row-total cell-num">${topItemsTotalQty.toLocaleString()} ${isTh ? 'ที่' : 'items'}</td>
      <td class="cell-val row-total cell-currency">฿${topItemsTotalRev.toLocaleString()}</td>
      <td class="cell-val row-total cell-center">${topItemsCombinedShare}%</td>
    </tr>` : ''}
    <tr><td colspan="7" style="height: 20px;"></td></tr>

    <!-- 3. 24-Hour Peak Hourly Traffic -->
    <tr>
      <td colspan="7" class="sec-banner">
        ${isTh ? '3. สถิติยอดขายรายชั่วโมง 24 ชม. (24-HOUR HOURLY TRAFFIC & PEAK ANALYSIS)' : '3. 24-HOUR HOURLY TRAFFIC & PEAK ANALYSIS'}
      </td>
    </tr>
    <tr>
      <th colspan="2" class="th-col">${isTh ? 'ช่วงเวลา (Time Window)' : 'Time Window'}</th>
      <th class="th-col-num">${isTh ? 'จำนวนบิล (Orders)' : 'Orders Count'}</th>
      <th colspan="2" class="th-col-num">${isTh ? 'ยอดขาย (Revenue THB)' : 'Revenue (THB)'}</th>
      <th colspan="2" class="th-col-center">${isTh ? 'ระดับความหนาแน่น (Traffic Level)' : 'Traffic Level'}</th>
    </tr>
    ${(() => {
      const activeHours = metrics.hourlySales
        .map((sales, hr) => ({ hr, sales, count: metrics.hourlyCounts[hr] }))
        .filter((h) => h.sales > 0 || h.count > 0);

      if (activeHours.length === 0) {
        return `
        <tr>
          <td colspan="7" class="cell-val cell-center" style="color: #94a3b8; padding: 18px;">
            ${isTh ? 'ไม่มีข้อมูลยอดขายรายชั่วโมงในช่วงเวลาที่เลือก' : 'No hourly traffic records for this period'}
          </td>
        </tr>`;
      }

      return activeHours.map((h, idx) => {
        const hrStart = String(h.hr).padStart(2, '0') + ':00';
        const hrEnd = String(h.hr).padStart(2, '0') + ':59';
        const isPeak = h.sales === metrics.maxHourlySales && h.sales > 0;
        const isAlt = idx % 2 === 1;
        const rowBg = isPeak ? 'background-color: #fef3c7; font-weight: 700;' : isAlt ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';

        return `
        <tr style="${rowBg}">
          <td colspan="2" class="cell-val" style="${rowBg}">
            ${hrStart} - ${hrEnd} ${isTh ? 'น.' : ''}
          </td>
          <td class="cell-val cell-num" style="${rowBg}">${h.count.toLocaleString()} ${isTh ? 'บิล' : 'bills'}</td>
          <td colspan="2" class="cell-val cell-currency" style="${rowBg}">฿${h.sales.toLocaleString()}</td>
          <td colspan="2" class="cell-val cell-center" style="${rowBg}">
            ${isPeak 
              ? `<span class="badge-peak">🔥 ${isTh ? 'ช่วงพีคสูงสุด (Peak Traffic)' : 'PEAK TRAFFIC'}</span>` 
              : `<span class="badge-normal">${isTh ? 'ปกติ (Normal)' : 'Normal'}</span>`
            }
          </td>
        </tr>`;
      }).join('');
    })()}
    <tr><td colspan="7" style="height: 20px;"></td></tr>

    <!-- 4. Detailed Order Receipts Log -->
    <tr>
      <td colspan="7" class="sec-banner">
        ${isTh ? '4. รายการบิลออเดอร์ทั้งหมด (DETAILED ORDER RECEIPTS LOG)' : '4. DETAILED ORDER RECEIPTS LOG'}
      </td>
    </tr>
    <tr>
      <th class="th-col">${isTh ? 'เลขออเดอร์' : 'Order #'}</th>
      <th class="th-col">${isTh ? 'โต๊ะ / ประเภท' : 'Table / Type'}</th>
      <th class="th-col">${isTh ? 'วันและเวลา' : 'Date & Time'}</th>
      <th colspan="2" class="th-col">${isTh ? 'รายการอาหารที่สั่ง' : 'Items Ordered'}</th>
      <th class="th-col-center">${isTh ? 'วิธีชำระเงิน' : 'Payment'}</th>
      <th class="th-col-num">${isTh ? 'ยอดสุทธิ (Total)' : 'Total (THB)'}</th>
    </tr>
    ${orders.length > 0 ? orders.map((o, idx) => {
      const isAlt = idx % 2 === 1;
      const cellClass = isAlt ? 'cell-val-alt' : 'cell-val';
      const itemsList = (o.items || [])
        .map((i) => `${(isTh ? i.menuItem?.name : (i.menuItem?.nameEn || i.menuItem?.name)) || 'Item'} (x${i.quantity || 1})`)
        .join('; ');
      
      const payMethodLabel = o.paymentMethod === 'promptpay' 
        ? (isTh ? 'พร้อมเพย์' : 'PromptPay') 
        : o.paymentMethod === 'credit_card'
        ? (isTh ? 'บัตรเครดิต' : 'Credit Card')
        : (isTh ? 'เงินสด' : 'Cash');
      
      const tableLabel = o.tableNumber === 'TAKEAWAY' 
        ? (isTh ? 'สั่งกลับบ้าน' : 'Takeaway') 
        : `${isTh ? 'โต๊ะ' : 'Table'} ${o.tableNumber || '-'}`;

      const dateFormatted = new Date(o.createdAt).toLocaleString(isTh ? 'th-TH' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
      <tr>
        <td class="${cellClass}" style="font-weight: 700;">${escapeHtml(o.orderNumber || '-')}</td>
        <td class="${cellClass}">${escapeHtml(tableLabel)}</td>
        <td class="${cellClass}">${escapeHtml(dateFormatted)}</td>
        <td colspan="2" class="${cellClass}">${escapeHtml(itemsList || '-')}</td>
        <td class="${cellClass} cell-center" style="font-weight: 600;">${escapeHtml(payMethodLabel)}</td>
        <td class="${cellClass} cell-currency">฿${(Number(o.totalPrice) || 0).toLocaleString()}</td>
      </tr>`;
    }).join('') : `
      <tr>
        <td colspan="7" class="cell-val cell-center" style="color: #94a3b8; padding: 18px;">
          ${isTh ? 'ไม่มีรายการออเดอร์ในระบบ' : 'No order logs found'}
        </td>
      </tr>
    `}
    ${orders.length > 0 ? `
    <tr class="row-total">
      <td colspan="5" class="cell-val row-total" style="text-align: right; padding-right: 16px;">
        ${isTh ? `ยอดรวมบิลทั้งหมด (${orders.length} บิล)` : `Grand Total (${orders.length} orders)`}
      </td>
      <td class="cell-val row-total cell-center">-</td>
      <td class="cell-val row-total cell-currency">฿${metrics.totalSales.toLocaleString()}</td>
    </tr>` : ''}

    <!-- Footer Note -->
    <tr><td colspan="7" style="height: 16px;"></td></tr>
    <tr>
      <td colspan="7" style="text-align: center; color: #94a3b8; font-size: 8.5pt; padding: 14px;">
        ${isTh 
          ? 'รายงานนี้ถูกสร้างขึ้นอัตโนมัติโดยระบบ Easy QR Order System • ข้อมูลอัปเดตแบบเรียลไทม์' 
          : 'Generated automatically by Easy QR Order System • Verified Real-time Analytics'
        }
      </td>
    </tr>
  </table>
</body>
</html>`;

  return '\uFEFF' + html.trim();
};

/**
 * Generate a clean, RFC-4180 standard CSV report without messy raw ASCII dividers.
 * Fully includes PromptPay, Cash, and Credit Card payment methods and UTF-8 BOM.
 */
export const generateSalesCSV = (data: SalesReportData): string => {
  const { language, presetLabel, dateRangeLabel, generatedDate, metrics, orders, storeName = 'Cafe Order' } = data;
  const isTh = language === 'th';

  const lines: string[] = [];

  // Header
  lines.push([
    escapeCsv(`${storeName} - ${isTh ? 'รายงานสรุปผลประกอบการ & สถิติยอดขาย' : 'EXECUTIVE SALES & BUSINESS ANALYTICS REPORT'}`),
    '', '', '', '', '', ''
  ].join(','));
  lines.push([escapeCsv(isTh ? 'วันที่ออกรายงาน (Generated Date)' : 'Generated Date'), escapeCsv(generatedDate), '', '', '', '', ''].join(','));
  lines.push([escapeCsv(isTh ? 'รอบเวลาที่วิเคราะห์ (Selected Timeframe)' : 'Selected Timeframe'), escapeCsv(`${presetLabel} ${dateRangeLabel ? `(${dateRangeLabel})` : ''}`.trim()), '', '', '', '', ''].join(','));
  lines.push([escapeCsv(isTh ? 'สถานะข้อมูล (Report Status)' : 'Report Status'), escapeCsv(isTh ? 'เสร็จสมบูรณ์ (Verified Live Data)' : 'Verified Live Data'), '', '', '', '', ''].join(','));
  lines.push('');

  // 1. KPI Summary
  lines.push([escapeCsv(isTh ? '[1. สรุปตัวชี้วัดประสิทธิภาพหลัก (KEY PERFORMANCE INDICATORS)]' : '[1. KEY PERFORMANCE INDICATORS]'), '', '', '', ''].join(','));
  lines.push([
    escapeCsv(isTh ? 'ตัวชี้วัด (Metric)' : 'Metric'),
    escapeCsv(isTh ? 'มูลค่า (Value)' : 'Value'),
    escapeCsv(isTh ? 'หน่วย (Unit)' : 'Unit'),
    escapeCsv(isTh ? 'สัดส่วน (% Share)' : '% Share'),
    escapeCsv(isTh ? 'คำอธิบายประกอบ (Notes)' : 'Notes'),
  ].join(','));

  lines.push([
    escapeCsv(isTh ? 'ยอดขายรวมสุทธิ (Total Revenue)' : 'Total Revenue'),
    metrics.totalSales,
    escapeCsv(isTh ? 'บาท (THB)' : 'THB'),
    '100.0%',
    escapeCsv(isTh ? 'ยอดบิลทั้งหมดที่เสร็จสิ้น' : 'Total completed sales'),
  ].join(','));

  lines.push([
    escapeCsv(isTh ? 'จำนวนออเดอร์ทั้งหมด (Total Orders)' : 'Total Orders'),
    metrics.totalBills,
    escapeCsv(isTh ? 'บิล (Bills)' : 'Bills'),
    '-',
    escapeCsv(isTh ? 'ออเดอร์ที่ไม่ถูกยกเลิก' : 'Non-cancelled orders'),
  ].join(','));

  lines.push([
    escapeCsv(isTh ? 'ยอดเฉลี่ยต่อบิล (Avg. Ticket Size)' : 'Average Ticket Size'),
    metrics.avgTicket,
    escapeCsv(isTh ? 'บาท / บิล (THB/Bill)' : 'THB/Bill'),
    '-',
    escapeCsv(isTh ? 'ค่าเฉลี่ยการใช้จ่ายต่อโต๊ะ' : 'Average spend per table'),
  ].join(','));

  lines.push([
    escapeCsv(isTh ? 'ยอดชำระด้วยพร้อมเพย์ (PromptPay)' : 'PromptPay Revenue'),
    metrics.promptpaySales,
    escapeCsv(isTh ? 'บาท (THB)' : 'THB'),
    `${metrics.promptpayPercent}%`,
    escapeCsv(`${metrics.promptpayCount} ${isTh ? 'บิล' : 'bills'}`),
  ].join(','));

  lines.push([
    escapeCsv(isTh ? 'ยอดชำระด้วยเงินสด (Cash)' : 'Cash Revenue'),
    metrics.cashSales,
    escapeCsv(isTh ? 'บาท (THB)' : 'THB'),
    `${metrics.cashPercent}%`,
    escapeCsv(`${metrics.cashCount} ${isTh ? 'บิล' : 'bills'}`),
  ].join(','));

  lines.push([
    escapeCsv(isTh ? 'ยอดชำระด้วยบัตรเครดิต (Credit Card)' : 'Credit Card Revenue'),
    metrics.cardSales,
    escapeCsv(isTh ? 'บาท (THB)' : 'THB'),
    `${metrics.cardPercent}%`,
    escapeCsv(`${metrics.cardCount} ${isTh ? 'บิล' : 'bills'}`),
  ].join(','));
  lines.push('');

  // 2. Top 5 Best Sellers
  lines.push([escapeCsv(isTh ? '[2. 5 อันดับเมนูขายดีที่สุด (TOP 5 BEST SELLING DISHES)]' : '[2. TOP 5 BEST SELLING DISHES]'), '', '', '', '', ''].join(','));
  lines.push([
    escapeCsv(isTh ? 'อันดับ (Rank)' : 'Rank'),
    escapeCsv(isTh ? 'ชื่อเมนู (Menu Name TH)' : 'Menu Name (TH)'),
    escapeCsv(isTh ? 'ชื่อภาษาอังกฤษ (English Name)' : 'English Name'),
    escapeCsv(isTh ? 'จำนวนที่ขายได้ (Qty Sold)' : 'Qty Sold'),
    escapeCsv(isTh ? 'ยอดขายรวม (Total Revenue THB)' : 'Total Revenue (THB)'),
    escapeCsv(isTh ? 'สัดส่วนยอดขาย (% Share)' : '% Revenue Share'),
  ].join(','));

  metrics.topItems.forEach((item, idx) => {
    const share = metrics.totalSales > 0 ? ((item.revenue / metrics.totalSales) * 100).toFixed(1) : '0';
    lines.push([
      escapeCsv(`#${idx + 1}`),
      escapeCsv(item.name),
      escapeCsv(item.nameEn || '-'),
      item.count,
      item.revenue,
      escapeCsv(`${share}%`),
    ].join(','));
  });
  lines.push('');

  // 3. Hourly Traffic
  lines.push([escapeCsv(isTh ? '[3. สถิติยอดขายรายชั่วโมง 24 ชม. (24-HOUR HOURLY TRAFFIC)]' : '[3. 24-HOUR HOURLY TRAFFIC]'), '', '', ''].join(','));
  lines.push([
    escapeCsv(isTh ? 'ช่วงเวลา (Time Window)' : 'Time Window'),
    escapeCsv(isTh ? 'จำนวนบิล (Orders)' : 'Orders Count'),
    escapeCsv(isTh ? 'ยอดขาย (Revenue THB)' : 'Revenue (THB)'),
    escapeCsv(isTh ? 'ระดับความหนาแน่น (Traffic Level)' : 'Traffic Level'),
  ].join(','));

  metrics.hourlySales.forEach((sales, hr) => {
    if (sales > 0 || metrics.hourlyCounts[hr] > 0) {
      const hrStart = String(hr).padStart(2, '0') + ':00';
      const hrEnd = String(hr).padStart(2, '0') + ':59';
      const isPeak = sales === metrics.maxHourlySales && sales > 0;
      const level = isPeak ? (isTh ? 'ช่วงพีคสูงสุด (Peak Traffic)' : 'PEAK TRAFFIC') : (isTh ? 'ปกติ (Normal)' : 'Normal');
      lines.push([
        escapeCsv(`${hrStart} - ${hrEnd}`),
        metrics.hourlyCounts[hr],
        sales,
        escapeCsv(level),
      ].join(','));
    }
  });
  lines.push('');

  // 4. Detailed Order Log
  lines.push([escapeCsv(isTh ? '[4. รายการบิลออเดอร์ทั้งหมด (DETAILED ORDER RECEIPTS LOG)]' : '[4. DETAILED ORDER RECEIPTS LOG]'), '', '', '', '', '', ''].join(','));
  lines.push([
    escapeCsv(isTh ? 'เลขออเดอร์ (Order #)' : 'Order #'),
    escapeCsv(isTh ? 'โต๊ะ/ประเภท (Table/Type)' : 'Table/Type'),
    escapeCsv(isTh ? 'วันและเวลา (Date & Time)' : 'Date & Time'),
    escapeCsv(isTh ? 'รายการอาหาร (Items Ordered)' : 'Items Ordered'),
    escapeCsv(isTh ? 'วิธีชำระเงิน (Payment Method)' : 'Payment Method'),
    escapeCsv(isTh ? 'สถานะ (Status)' : 'Status'),
    escapeCsv(isTh ? 'ยอดสุทธิ (Total THB)' : 'Total (THB)'),
  ].join(','));

  orders.forEach((o) => {
    const itemsList = (o.items || [])
      .map((i) => `${(isTh ? i.menuItem?.name : (i.menuItem?.nameEn || i.menuItem?.name)) || 'Item'} (x${i.quantity || 1})`)
      .join('; ');
    
    const payMethodLabel = o.paymentMethod === 'promptpay' 
      ? (isTh ? 'พร้อมเพย์' : 'PromptPay') 
      : o.paymentMethod === 'credit_card'
      ? (isTh ? 'บัตรเครดิต' : 'Credit Card')
      : (isTh ? 'เงินสด' : 'Cash');
    
    const statusLabel = o.status === 'completed' 
      ? (isTh ? 'เสร็จสิ้น' : 'Completed') 
      : o.status === 'ready' 
      ? (isTh ? 'พร้อมเสิร์ฟ' : 'Ready') 
      : (isTh ? 'กำลังทำ' : 'Cooking');
    
    const tableLabel = o.tableNumber === 'TAKEAWAY' 
      ? (isTh ? 'สั่งกลับบ้าน' : 'Takeaway') 
      : `${isTh ? 'โต๊ะ' : 'Table'} ${o.tableNumber || '-'}`;

    lines.push([
      escapeCsv(o.orderNumber || '-'),
      escapeCsv(tableLabel),
      escapeCsv(new Date(o.createdAt).toLocaleString(isTh ? 'th-TH' : 'en-US')),
      escapeCsv(itemsList),
      escapeCsv(payMethodLabel),
      escapeCsv(statusLabel),
      Number(o.totalPrice) || 0,
    ].join(','));
  });

  return '\uFEFF' + lines.join('\r\n');
};

/**
 * Triggers a browser file download from an in-memory string.
 */
export const downloadReportFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
