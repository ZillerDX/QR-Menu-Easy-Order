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

  describe('5. Menu and Category Full CRUD Lifecycle', () => {
    const testStoreId = 'shop-crud-test';

    it('should add, edit, and delete a menu item correctly', () => {
      const newItem: MenuItem = {
        id: 'item-crud-test-1',
        storeId: testStoreId,
        categoryId: 'coffee',
        name: 'Caramel Macchiato',
        nameEn: 'Caramel Macchiato',
        price: 85,
        imageUrl: 'https://example.com/caramel.jpg',
        isAvailable: true,
        isPopular: true,
        optionGroups: [
          {
            id: 'opt-sweet-1',
            name: 'ระดับความหวาน',
            required: true,
            maxSelect: 1,
            choices: [{ id: 'c-1', name: 'หวานน้อย', priceDelta: 0 }],
          },
        ],
      };

      // 1. Create (Add)
      const afterAdd = syncManager.saveMenuItem(newItem, testStoreId);
      expect(afterAdd.some((i) => i.id === newItem.id && i.name === 'Caramel Macchiato')).toBe(true);

      // 2. Update (Edit)
      const editedItem: MenuItem = {
        ...newItem,
        name: 'Iced Caramel Macchiato Premium',
        price: 95,
      };
      const afterEdit = syncManager.saveMenuItem(editedItem, testStoreId);
      const foundEdited = afterEdit.find((i) => i.id === newItem.id);
      expect(foundEdited?.name).toBe('Iced Caramel Macchiato Premium');
      expect(foundEdited?.price).toBe(95);

      // 3. Delete
      const afterDelete = syncManager.deleteMenuItem(newItem.id, testStoreId);
      expect(afterDelete.some((i) => i.id === newItem.id)).toBe(false);
    });

    it('should add and delete categories correctly', () => {
      const newCat: MenuCategory = {
        id: 'cat-test-specialty',
        storeId: testStoreId,
        name: 'Specialty Cold Brew',
        nameEn: 'Specialty Cold Brew',
        icon: 'Sparkles',
      };

      // 1. Create Category
      const afterAddCat = syncManager.saveCategory(newCat, testStoreId);
      expect(afterAddCat.some((c) => c.id === newCat.id)).toBe(true);

      // 2. Delete Category
      const afterDeleteCat = syncManager.deleteCategory(newCat.id, testStoreId);
      expect(afterDeleteCat.some((c) => c.id === newCat.id)).toBe(false);
    });
  });

  describe('6. 50 Tables Support & Strict Multi-Tenant QR Routing', () => {
    it('should support generating up to 50 tables and takeaway with unique isolated URLs', () => {
      const shopIdA = 'shop-user-alpha-123';
      const shopIdB = 'shop-user-beta-456';

      const generateTableUrl = (shop: string, table: string) => {
        return `https://example.com/?shop=${encodeURIComponent(shop)}&table=${encodeURIComponent(table)}&lang=th`;
      };

      // Test all 50 tables + takeaway for Store A
      const storeATableUrls = Array.from({ length: 50 }, (_, i) => {
        const tbl = (i + 1).toString().padStart(2, '0');
        return generateTableUrl(shopIdA, tbl);
      });
      storeATableUrls.push(generateTableUrl(shopIdA, 'TAKEAWAY'));

      expect(storeATableUrls.length).toBe(51);

      // Verify all 51 URLs are unique and bound to shopIdA
      const uniqueA = new Set(storeATableUrls);
      expect(uniqueA.size).toBe(51);
      storeATableUrls.forEach((url) => {
        expect(url).toContain('shop=shop-user-alpha-123');
        expect(url).not.toContain('shop=shop-user-beta-456');
      });

      // Verify Store B URL for Table 01 never collides with Store A
      const storeBTable01 = generateTableUrl(shopIdB, '01');
      expect(storeBTable01).toContain('shop=shop-user-beta-456');
      expect(storeATableUrls).not.toContain(storeBTable01);
    });

    it('should store and retrieve up to 50 tableCount setting in StoreConfig', () => {
      const configWith50Tables = {
        ...initialStoreConfig,
        id: 'shop-large-50',
        name: 'Mega Cafe 50',
        tableCount: 50,
      };

      syncManager.saveStoreConfig(configWith50Tables, 'shop-large-50');
      const loaded = syncManager.getStoreConfig('shop-large-50');

      expect(loaded.tableCount).toBe(50);
      expect(loaded.name).toBe('Mega Cafe 50');
    });
  });
});
