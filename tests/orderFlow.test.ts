import { describe, it, expect, beforeEach } from 'vitest';
import { syncManager } from '../src/utils/storage';
import { Order, OrderStatus } from '../src/types';

describe('Order Lifecycle & State Machine', () => {
  beforeEach(() => {
    syncManager.resetAll();
  });

  it('should create an order with pending status and correct totals', () => {
    const testOrder: Order = {
      id: 'ord-test-01',
      orderNumber: '#1001',
      tableNumber: '01',
      storeId: 'cafe-order',
      items: [
        {
          cartItemId: 'item-1',
          menuItem: {
            id: 'm1',
            categoryId: 'coffee',
            name: 'ลาเต้',
            price: 65,
            imageUrl: '',
            isAvailable: true,
            description: '',
          },
          quantity: 2,
          selectedOptions: [
            {
              groupId: 'sweetness',
              groupName: 'ความหวาน',
              choiceId: 'sw-50',
              choiceName: 'หวานน้อย 50%',
              priceDelta: 0,
            },
            {
              groupId: 'extra',
              groupName: 'เพิ่มช็อต',
              choiceId: 'ex-shot',
              choiceName: 'เพิ่มช็อตกาแฟ',
              priceDelta: 20,
            },
          ],
          specialNote: 'ขอน้ำแข็งน้อย',
          unitPriceWithDelta: 85,
          totalItemPrice: 170,
        },
      ],
      subtotal: 170,
      totalPrice: 170,
      paymentMethod: 'promptpay',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    syncManager.saveOrder(testOrder);
    const orders = syncManager.getOrders();
    expect(orders.length).toBe(1);
    expect(orders[0].totalPrice).toBe(170);
    expect(orders[0].status).toBe('pending');
  });

  it('should transition status smoothly through pending -> cooking -> ready -> completed', () => {
    const testOrder: Order = {
      id: 'ord-test-02',
      orderNumber: '#1002',
      tableNumber: '02',
      storeId: 'cafe-order',
      items: [],
      subtotal: 100,
      totalPrice: 100,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    syncManager.saveOrder(testOrder);

    // 1. Pending -> Cooking
    let updated = syncManager.updateOrderStatus('ord-test-02', 'cooking');
    expect(updated.find((o) => o.id === 'ord-test-02')?.status).toBe('cooking');

    // 2. Cooking -> Ready
    updated = syncManager.updateOrderStatus('ord-test-02', 'ready');
    expect(updated.find((o) => o.id === 'ord-test-02')?.status).toBe('ready');

    // 3. Ready -> Completed with paid status
    updated = syncManager.updateOrderStatus('ord-test-02', 'completed', 'paid');
    const finalOrder = updated.find((o) => o.id === 'ord-test-02');
    expect(finalOrder?.status).toBe('completed');
    expect(finalOrder?.paymentStatus).toBe('paid');
  });

  it('should handle cancel rejection with reason', () => {
    const testOrder: Order = {
      id: 'ord-test-03',
      orderNumber: '#1003',
      tableNumber: '03',
      storeId: 'cafe-order',
      items: [],
      subtotal: 120,
      totalPrice: 120,
      paymentMethod: 'promptpay',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    syncManager.saveOrder(testOrder);
    const updated = syncManager.updateOrderStatus('ord-test-03', 'cancelled');
    expect(updated.find((o) => o.id === 'ord-test-03')?.status).toBe('cancelled');
  });
});
