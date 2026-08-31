import { describe, it, expect } from 'vitest';
import { syncManager } from '../src/utils/storage';
import { Order, PaymentMethod } from '../src/types';

describe('Payment Methods Suite (QR PromptPay, Cash, Credit Card)', () => {
  const shopId = 'test-payment-shop';

  it('should support creating and closing orders with promptpay, cash, and credit_card', () => {
    const paymentMethods: PaymentMethod[] = ['promptpay', 'cash', 'credit_card'];

    paymentMethods.forEach((method, idx) => {
      const order: Order = {
        id: `ord-test-${idx}`,
        orderNumber: `#${1000 + idx}`,
        tableNumber: `0${idx + 1}`,
        storeId: shopId,
        items: [],
        subtotal: 150,
        totalPrice: 150,
        paymentMethod: method,
        paymentStatus: 'unpaid',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      syncManager.saveOrder(order, shopId);
      
      // Update order to ready
      syncManager.updateOrderStatus(order.id, 'ready', 'unpaid', method, shopId);
      
      // Close bill with paid status and verify paymentMethod is preserved/updated
      const updated = syncManager.updateOrderStatus(order.id, 'completed', 'paid', method, shopId);
      const matched = updated.find((o) => o.id === order.id);

      expect(matched).toBeDefined();
      expect(matched?.status).toBe('completed');
      expect(matched?.paymentStatus).toBe('paid');
      expect(matched?.paymentMethod).toBe(method);
    });
  });

  it('should allow switching payment method from cash to credit_card at closing time', () => {
    const order: Order = {
      id: 'ord-switch-pay',
      orderNumber: '#9999',
      tableNumber: '05',
      storeId: shopId,
      items: [],
      subtotal: 300,
      totalPrice: 300,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    syncManager.saveOrder(order, shopId);

    // Customer decides to pay with credit card instead of cash
    const updated = syncManager.updateOrderStatus(order.id, 'completed', 'paid', 'credit_card', shopId);
    const matched = updated.find((o) => o.id === order.id);

    expect(matched?.paymentMethod).toBe('credit_card');
    expect(matched?.paymentStatus).toBe('paid');
    expect(matched?.status).toBe('completed');
  });
});
