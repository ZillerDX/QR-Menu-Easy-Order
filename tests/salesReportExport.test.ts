import { describe, it, expect } from 'vitest';
import { generateSalesInfographicExcel, generateSalesCSV, SalesReportData } from '../src/utils/reportExport';
import { Order } from '../src/types';

describe('Sales Dashboard Infographic Report Export', () => {
  const mockOrders: Order[] = [
    {
      id: 'order-1',
      orderNumber: 'A-001',
      tableNumber: '1',
      customerName: 'Customer 1',
      items: [
        {
          menuItem: {
            id: 'item-1',
            name: 'Signature Dirty Coffee (เดอร์ตี้คอฟฟี่)',
            nameEn: 'Signature Dirty Coffee',
            price: 95,
            category: 'coffee',
            isAvailable: true,
          },
          quantity: 1,
          selectedOptions: [],
          totalItemPrice: 95,
        },
      ],
      totalPrice: 95,
      status: 'completed',
      paymentMethod: 'credit_card',
      createdAt: '2026-09-09T03:45:00.000Z',
    },
    {
      id: 'order-2',
      orderNumber: 'A-002',
      tableNumber: 'TAKEAWAY',
      customerName: 'Customer 2',
      items: [
        {
          menuItem: {
            id: 'item-2',
            name: 'Iced Americano',
            nameEn: 'Iced Americano',
            price: 75,
            category: 'coffee',
            isAvailable: true,
          },
          quantity: 2,
          selectedOptions: [],
          totalItemPrice: 150,
        },
      ],
      totalPrice: 150,
      status: 'completed',
      paymentMethod: 'promptpay',
      createdAt: '2026-09-09T04:15:00.000Z',
    },
    {
      id: 'order-3',
      orderNumber: 'A-003',
      tableNumber: '5',
      customerName: 'Customer 3',
      items: [
        {
          menuItem: {
            id: 'item-3',
            name: 'Matcha Latte',
            nameEn: 'Matcha Latte',
            price: 85,
            category: 'tea',
            isAvailable: true,
          },
          quantity: 1,
          selectedOptions: [],
          totalItemPrice: 85,
        },
      ],
      totalPrice: 85,
      status: 'completed',
      paymentMethod: 'cash',
      createdAt: '2026-09-09T04:30:00.000Z',
    },
  ];

  const hourlySales = Array(24).fill(0);
  const hourlyCounts = Array(24).fill(0);
  hourlySales[3] = 95;
  hourlyCounts[3] = 1;
  hourlySales[4] = 235;
  hourlyCounts[4] = 2;

  const mockReportData: SalesReportData = {
    language: 'th',
    preset: 'today',
    presetLabel: 'วันนี้',
    dateRangeLabel: '',
    generatedDate: '10/09/2026 03:45 น.',
    metrics: {
      totalSales: 330,
      totalBills: 3,
      avgTicket: 110,
      promptpaySales: 150,
      promptpayCount: 1,
      promptpayPercent: 45,
      cashSales: 85,
      cashCount: 1,
      cashPercent: 26,
      cardSales: 95,
      cardCount: 1,
      cardPercent: 29,
      topItems: [
        { name: 'Iced Americano', nameEn: 'Iced Americano', count: 2, revenue: 150 },
        { name: 'Signature Dirty Coffee (เดอร์ตี้คอฟฟี่)', nameEn: 'Signature Dirty Coffee', count: 1, revenue: 95 },
        { name: 'Matcha Latte', nameEn: 'Matcha Latte', count: 1, revenue: 85 },
      ],
      hourlySales,
      hourlyCounts,
      maxHourlySales: 235,
      peakHourIndex: 4,
      peakHourSales: 235,
    },
    orders: mockOrders,
    storeName: 'Cafe Order',
  };

  describe('Excel Infographic Generation (.xls)', () => {
    it('should generate valid UTF-8 BOM and Excel XML/HTML headers', () => {
      const excel = generateSalesInfographicExcel(mockReportData);

      expect(excel.startsWith('\uFEFF')).toBe(true);
      expect(excel).toContain('xmlns:x="urn:schemas-microsoft-com:office:excel"');
      expect(excel).toContain('<x:Name>รายงานสรุปยอดขาย</x:Name>');
    });

    it('should render all 4 Infographic KPI Scorecard cards with proper styling', () => {
      const excel = generateSalesInfographicExcel(mockReportData);

      // Card 1: Revenue
      expect(excel).toContain('ยอดขายรวมสุทธิ (TOTAL REVENUE)');
      expect(excel).toContain('฿330');

      // Card 2: Total Orders
      expect(excel).toContain('จำนวนออเดอร์ทั้งหมด (TOTAL ORDERS)');
      expect(excel).toContain('3 บิล');

      // Card 3: Average Ticket
      expect(excel).toContain('ยอดเฉลี่ย / บิล (AVG. TICKET)');
      expect(excel).toContain('฿110');

      // Card 4: Payment Breakdown with all 3 methods including Credit Card!
      expect(excel).toContain('ช่องทางชำระเงิน (PAYMENT METHODS)');
      expect(excel).toContain('พร้อมเพย์: ฿150 (45%)');
      expect(excel).toContain('เงินสด: ฿85 (26%)');
      expect(excel).toContain('บัตรเครดิต: ฿95 (29%)');
    });

    it('should include pre-defined column widths so Excel never truncates text', () => {
      const excel = generateSalesInfographicExcel(mockReportData);

      expect(excel).toContain('<col width="90" />');
      expect(excel).toContain('<col width="250" />');
      expect(excel).toContain('<col width="200" />');
    });

    it('should render top sellers and peak traffic highlight with flame badge', () => {
      const excel = generateSalesInfographicExcel(mockReportData);

      expect(excel).toContain('Signature Dirty Coffee (เดอร์ตี้คอฟฟี่)');
      expect(excel).toContain('#1');
      expect(excel).toContain('ช่วงพีคสูงสุด (Peak Traffic)');
    });

    it('should render complete detailed order logs with takeaway label', () => {
      const excel = generateSalesInfographicExcel(mockReportData);

      expect(excel).toContain('A-001');
      expect(excel).toContain('A-002');
      expect(excel).toContain('สั่งกลับบ้าน');
      expect(excel).toContain('โต๊ะ 1');
      expect(excel).toContain('บัตรเครดิต');
      expect(excel).toContain('พร้อมเพย์');
    });
  });

  describe('Clean CSV Generation (.csv)', () => {
    it('should not contain ugly raw dashed dividers like ----------------', () => {
      const csv = generateSalesCSV(mockReportData);

      expect(csv).not.toContain('--------------------------------------------------------');
      expect(csv).not.toContain('════════════════════════════════════════════════════════');
    });

    it('should include Credit Card in the payment method breakdown', () => {
      const csv = generateSalesCSV(mockReportData);

      expect(csv).toContain('ยอดชำระด้วยบัตรเครดิต (Credit Card),95,บาท (THB),29%,1 บิล');
      expect(csv).toContain('ยอดชำระด้วยพร้อมเพย์ (PromptPay),150,บาท (THB),45%,1 บิล');
      expect(csv).toContain('ยอดชำระด้วยเงินสด (Cash),85,บาท (THB),26%,1 บิล');
    });

    it('should start with UTF-8 BOM to prevent Thai mojibake in spreadsheet apps', () => {
      const csv = generateSalesCSV(mockReportData);

      expect(csv.startsWith('\uFEFF')).toBe(true);
    });
  });
});
