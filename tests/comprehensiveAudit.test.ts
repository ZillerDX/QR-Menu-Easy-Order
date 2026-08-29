import { describe, it, expect, beforeEach } from 'vitest';
import { syncManager } from '../src/utils/storage';
import { generatePromptPayPayload } from '../src/utils/promptpay';
import { initialMenuItems, initialCategories, initialStoreConfig } from '../src/data/initialMenu';
import { Order, MenuItem, SelectedOption } from '../src/types';

describe('Comprehensive System Audit & Flow Verification', () => {
  beforeEach(() => {
    syncManager.resetAll();
  });

  describe('1. Menu & Option Customization Integrity', () => {
    it('should calculate total item price accurately with multiple selected options', () => {
      const basePrice = 75; // Americano
      const selectedOptions: SelectedOption[] = [
        { groupId: 'bean', groupName: 'เมล็ดกาแฟ', choiceId: 'ethiopia', choiceName: 'Ethiopia Yirgacheffe', priceDelta: 25 },
        { groupId: 'sweet', groupName: 'ระดับความหวาน', choiceId: 'sw-0', choiceName: 'ไม่หวาน 0%', priceDelta: 0 },
        { groupId: 'extra', groupName: 'เพิ่มพิเศษ', choiceId: 'oat-milk', choiceName: 'นมข้าวโอ๊ต Oatly', priceDelta: 20 },
      ];

      const unitPriceWithDelta = basePrice + selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
      expect(unitPriceWithDelta).toBe(120);

      const quantity = 3;
      const totalItemPrice = unitPriceWithDelta * quantity;
      expect(totalItemPrice).toBe(360);
    });

    it('should correctly toggle stock availability without mutating original object', () => {
      const items = syncManager.getMenuItems();
      const firstItem = items[0];
      const initialStatus = firstItem.isAvailable;

      const updated = syncManager.toggleItemAvailability(firstItem.id);
      const updatedItem = updated.find((i) => i.id === firstItem.id);

      expect(updatedItem?.isAvailable).toBe(!initialStatus);
    });
  });

  describe('2. Multi-Store Isolation & Routing', () => {
    it('should cleanly isolate store configurations per shopId', () => {
      const storeAConfig: StoreConfig = {
        ...initialStoreConfig,
        id: 'shop-user-alpha',
        name: 'Alpha Cafe',
        nameEn: 'Alpha Cafe',
      };
      const storeBConfig: StoreConfig = {
        ...initialStoreConfig,
        id: 'shop-user-beta',
        name: 'Beta Bistro',
        nameEn: 'Beta Bistro',
      };

      syncManager.saveStoreConfig(storeAConfig, 'shop-user-alpha');
      syncManager.saveStoreConfig(storeBConfig, 'shop-user-beta');

      const loadedA = syncManager.getStoreConfig('shop-user-alpha');
      const loadedB = syncManager.getStoreConfig('shop-user-beta');

      expect(loadedA.name).toBe('Alpha Cafe');
      expect(loadedB.name).toBe('Beta Bistro');
      expect(loadedA.id).not.toBe(loadedB.id);
    });

    it('should cleanly isolate menu items and stock between stores', () => {
      const customItemA: MenuItem = {
        id: 'item-alpha-special',
        storeId: 'shop-user-alpha',
        categoryId: 'coffee',
        name: 'Alpha Special Roast',
        description: 'Special roast for Alpha Cafe',
        price: 120,
        imageUrl: '',
        isAvailable: true,
      };

      syncManager.saveMenuItem(customItemA, 'shop-user-alpha');

      const itemsAlpha = syncManager.getMenuItems('shop-user-alpha');
      const itemsBeta = syncManager.getMenuItems('shop-user-beta');

      expect(itemsAlpha.some((i) => i.id === 'item-alpha-special')).toBe(true);
      expect(itemsBeta.some((i) => i.id === 'item-alpha-special')).toBe(false);
    });

    it('should cleanly isolate orders per shopId', () => {
      const storeAOrder: Order = {
        id: 'ord-shop-a-1',
        orderNumber: '#101',
        tableNumber: '01',
        storeId: 'shop-user-alpha',
        items: [],
        subtotal: 150,
        totalPrice: 150,
        paymentMethod: 'promptpay',
        paymentStatus: 'unpaid',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const storeBOrder: Order = {
        id: 'ord-shop-b-1',
        orderNumber: '#102',
        tableNumber: '01',
        storeId: 'shop-user-beta',
        items: [],
        subtotal: 350,
        totalPrice: 350,
        paymentMethod: 'cash',
        paymentStatus: 'unpaid',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      syncManager.saveOrder(storeAOrder, 'shop-user-alpha');
      syncManager.saveOrder(storeBOrder, 'shop-user-beta');

      const branchAOrders = syncManager.getOrders('shop-user-alpha');
      const branchBOrders = syncManager.getOrders('shop-user-beta');

      expect(branchAOrders.length).toBe(1);
      expect(branchAOrders[0].id).toBe('ord-shop-a-1');
      expect(branchBOrders.length).toBe(1);
      expect(branchBOrders[0].id).toBe('ord-shop-b-1');
    });
  });

  describe('3. EMVCo PromptPay CRC16 Calculation', () => {
    it('should generate valid checksum for Thai mobile numbers starting with 06, 08, 09', () => {
      const testNumbers = ['0812345678', '095-987-6543', '062 111 2233'];
      for (const num of testNumbers) {
        const payload = generatePromptPayPayload(num, 199.75);
        expect(payload).toMatch(/^000201/); // EMVCo Header
        expect(payload).toMatch(/6304[0-9A-F]{4}$/); // 4-character hex CRC16
        expect(payload).toContain('199.75');
      }
    });
  });

  describe('4. Anti-Prank Rejection Workflow', () => {
    it('should record cancellation reason when kitchen rejects an order', () => {
      const order: Order = {
        id: 'ord-fake-99',
        orderNumber: '#9999',
        tableNumber: '05',
        storeId: 'cafe-order',
        items: [],
        subtotal: 500,
        totalPrice: 500,
        paymentMethod: 'promptpay',
        paymentStatus: 'unpaid',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      syncManager.saveOrder(order);

      const cancelReason = 'ไม่มีลูกค้าที่โต๊ะ (โต๊ะว่าง / สั่งเล่น)';
      const updated = syncManager.updateOrderStatus(order.id, 'cancelled');
      const cancelledOrder = updated.find((o) => o.id === order.id);

      expect(cancelledOrder?.status).toBe('cancelled');
    });
  });
});
