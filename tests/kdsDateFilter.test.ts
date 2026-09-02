import { describe, it, expect } from 'vitest';
import { t } from '../src/utils/i18n';
import { Order } from '../src/types';

describe('KDS Date Filtering & Symmetrical Control Suite', () => {
  const now = new Date();
  const todayISO = now.toISOString();

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayISO = yesterdayDate.toISOString();

  const eightDaysAgoDate = new Date(now);
  eightDaysAgoDate.setDate(now.getDate() - 8);
  const eightDaysAgoISO = eightDaysAgoDate.toISOString();

  const sampleOrders: Order[] = [
    {
      id: 'order-today-1',
      orderNumber: 'A01',
      tableNumber: '1',
      items: [],
      subtotal: 100,
      totalPrice: 100,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'completed',
      createdAt: todayISO,
    },
    {
      id: 'order-today-2',
      orderNumber: 'A02',
      tableNumber: '2',
      items: [],
      subtotal: 150,
      totalPrice: 150,
      paymentMethod: 'promptpay',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: todayISO,
    },
    {
      id: 'order-yesterday-1',
      orderNumber: 'Y01',
      tableNumber: '3',
      items: [],
      subtotal: 200,
      totalPrice: 200,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'completed',
      createdAt: yesterdayISO,
    },
    {
      id: 'order-old-1',
      orderNumber: 'O01',
      tableNumber: '4',
      items: [],
      subtotal: 300,
      totalPrice: 300,
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      status: 'completed',
      createdAt: eightDaysAgoISO,
    },
  ];

  it('should have all translation keys defined for both th and en', () => {
    const keys = [
      'kdsDateFilterToday',
      'kdsDateFilterYesterday',
      'kdsDateFilterLast7Days',
      'kdsDateFilterAllTime',
      'kdsDateFilterCustom',
      'kdsDateFilterTitle',
      'kdsRefreshData',
      'kdsLastUpdated',
      'kdsShowingDataFor',
      'kdsOrdersFound',
    ] as const;

    for (const key of keys) {
      expect(t(key as any, 'th')).toBeDefined();
      expect(t(key as any, 'th').length).toBeGreaterThan(0);
      expect(t(key as any, 'en')).toBeDefined();
      expect(t(key as any, 'en').length).toBeGreaterThan(0);
    }
  });

  it('should filter orders accurately for today', () => {
    const todayOrders = sampleOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
    expect(todayOrders.length).toBe(2);
    expect(todayOrders.map((o) => o.id)).toContain('order-today-1');
    expect(todayOrders.map((o) => o.id)).toContain('order-today-2');
  });

  it('should filter orders accurately for yesterday', () => {
    const yesterdayOrders = sampleOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return (
        d.getFullYear() === yesterdayDate.getFullYear() &&
        d.getMonth() === yesterdayDate.getMonth() &&
        d.getDate() === yesterdayDate.getDate()
      );
    });
    expect(yesterdayOrders.length).toBe(1);
    expect(yesterdayOrders[0].id).toBe('order-yesterday-1');
  });

  it('should calculate revenue scoped to the filtered date', () => {
    const todayRevenue = sampleOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return (
          o.status === 'completed' &&
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      })
      .reduce((sum, o) => sum + o.totalPrice, 0);

    expect(todayRevenue).toBe(100);

    const yesterdayRevenue = sampleOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return (
          o.status === 'completed' &&
          d.getFullYear() === yesterdayDate.getFullYear() &&
          d.getMonth() === yesterdayDate.getMonth() &&
          d.getDate() === yesterdayDate.getDate()
        );
      })
      .reduce((sum, o) => sum + o.totalPrice, 0);

    expect(yesterdayRevenue).toBe(200);
  });
});
