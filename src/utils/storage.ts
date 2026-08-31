import { Order, MenuItem, MenuCategory, StoreConfig } from '../types';
import { initialMenuItems, initialCategories, initialStoreConfig } from '../data/initialMenu';

const DEFAULT_SHOP_ID = 'cafe-order';

const getOrdersKey = (shopId = DEFAULT_SHOP_ID) => `qr_menu_orders_${shopId}_v4`;
const getMenuKey = (shopId = DEFAULT_SHOP_ID) => `qr_menu_items_${shopId}_v4`;
const getCategoriesKey = (shopId = DEFAULT_SHOP_ID) => `qr_menu_categories_${shopId}_v4`;
const getStoreKey = (shopId = DEFAULT_SHOP_ID) => `qr_menu_store_config_${shopId}_v4`;
const CHANNEL_NAME = 'qr_menu_realtime_sync_v4';

export type SyncEventType = 
  | { type: 'ORDER_CREATED'; payload: Order; storeId?: string }
  | { type: 'ORDER_STATUS_UPDATED'; payload: Order; storeId?: string }
  | { type: 'MENU_UPDATED'; payload: MenuItem[]; storeId?: string }
  | { type: 'CATEGORIES_UPDATED'; payload: MenuCategory[]; storeId?: string }
  | { type: 'STORE_CONFIG_UPDATED'; payload: StoreConfig; storeId?: string }
  | { type: 'SYSTEM_RESET'; storeId?: string };

type EventListener = (event: SyncEventType) => void;

// Safe In-Memory Storage Fallback for SSR / Node Testing / Incognito
const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      return memoryStorage.get(key) ?? null;
    }
    return memoryStorage.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      memoryStorage.set(key, value);
      return;
    }
    memoryStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      memoryStorage.delete(key);
      return;
    }
    memoryStorage.delete(key);
  },
};

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<EventListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (msg) => {
        this.notifyListeners(msg.data);
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('qr_menu_orders_') && e.newValue) {
          try {
            const orders = JSON.parse(e.newValue);
            const latest = orders[0];
            if (latest) {
              this.notifyListeners({ type: 'ORDER_CREATED', payload: latest, storeId: latest.storeId });
            }
          } catch {
            // ignore malformed storage json
          }
        }
      });
    }
  }

  private notifyListeners(event: SyncEventType) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in sync listener:", err);
      }
    });
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  broadcast(event: SyncEventType) {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {
        // BroadcastChannel error fallback
      }
    }
    this.notifyListeners(event);
  }

  // --- Orders ---
  getOrders(shopId = DEFAULT_SHOP_ID): Order[] {
    try {
      const data = safeStorage.getItem(getOrdersKey(shopId));
      if (data) return JSON.parse(data);
      // Fallback for default cafe-order backward compatibility
      if (shopId === DEFAULT_SHOP_ID) {
        const legacy = safeStorage.getItem('qr_menu_orders_v3');
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  }

  setOrders(orders: Order[], shopId = DEFAULT_SHOP_ID): void {
    safeStorage.setItem(getOrdersKey(shopId), JSON.stringify(orders));
  }

  saveOrder(order: Order, shopId?: string): Order[] {
    const targetShop = shopId || order.storeId || DEFAULT_SHOP_ID;
    const orders = this.getOrders(targetShop);
    const updated = [order, ...orders.filter((o) => o.id !== order.id)];
    safeStorage.setItem(getOrdersKey(targetShop), JSON.stringify(updated));
    this.broadcast({ type: 'ORDER_CREATED', payload: order, storeId: targetShop });
    return updated;
  }

  updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus'], shopId = DEFAULT_SHOP_ID): Order[] {
    const orders = this.getOrders(shopId);
    let targetOrder: Order | undefined;
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        targetOrder = {
          ...o,
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
        };
        return targetOrder;
      }
      return o;
    });
    safeStorage.setItem(getOrdersKey(shopId), JSON.stringify(updated));
    if (targetOrder) {
      this.broadcast({ type: 'ORDER_STATUS_UPDATED', payload: targetOrder, storeId: shopId });
    }
    return updated;
  }

  // --- Menu Categories ---
  getCategories(shopId = DEFAULT_SHOP_ID): MenuCategory[] {
    try {
      const data = safeStorage.getItem(getCategoriesKey(shopId));
      if (!data) {
        return initialCategories.map((c) => ({ ...c, storeId: shopId }));
      }
      const parsed: MenuCategory[] = JSON.parse(data);
      return parsed.map((cat) => {
        if (cat.id === 'popular') {
          return {
            ...cat,
            storeId: cat.storeId || shopId,
            name: cat.name.replace(/🔥/g, '').trim() || "เมนูแนะนำ & ยอดฮิต",
            nameEn: (cat.nameEn || '').replace(/🔥/g, '').trim() || "Chef's Specials",
          };
        }
        return { ...cat, storeId: cat.storeId || shopId };
      });
    } catch {
      return initialCategories.map((c) => ({ ...c, storeId: shopId }));
    }
  }

  setCategories(categories: MenuCategory[], shopId = DEFAULT_SHOP_ID): void {
    safeStorage.setItem(getCategoriesKey(shopId), JSON.stringify(categories));
    this.broadcast({ type: 'CATEGORIES_UPDATED', payload: categories, storeId: shopId });
  }

  saveCategory(category: MenuCategory, shopId = DEFAULT_SHOP_ID): MenuCategory[] {
    const targetShop = shopId || category.storeId || DEFAULT_SHOP_ID;
    const categories = this.getCategories(targetShop);
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    let updated: MenuCategory[];
    const catWithStore = { ...category, storeId: targetShop };
    if (existingIndex >= 0) {
      updated = [...categories];
      updated[existingIndex] = catWithStore;
    } else {
      updated = [...categories, catWithStore];
    }
    safeStorage.setItem(getCategoriesKey(targetShop), JSON.stringify(updated));
    this.broadcast({ type: 'CATEGORIES_UPDATED', payload: updated, storeId: targetShop });
    return updated;
  }

  deleteCategory(categoryId: string, shopId = DEFAULT_SHOP_ID): MenuCategory[] {
    const categories = this.getCategories(shopId);
    const updated = categories.filter((c) => c.id !== categoryId);
    safeStorage.setItem(getCategoriesKey(shopId), JSON.stringify(updated));
    this.broadcast({ type: 'CATEGORIES_UPDATED', payload: updated, storeId: shopId });
    return updated;
  }

  private sanitizeMenuItems(items: MenuItem[], shopId: string): MenuItem[] {
    return items.map((item) => ({
      ...item,
      storeId: item.storeId || shopId,
      optionGroups: item.optionGroups?.map((group) => ({
        ...group,
        choices: group.choices?.map((choice) => {
          if (choice.name === 'หวาน 25%' || (choice.id === 's-25' && choice.name === 'หวาน 25%')) {
            return { ...choice, name: 'หวาน (25%)' };
          }
          return choice;
        }),
      })),
    }));
  }

  // --- Menu Items ---
  getMenuItems(shopId = DEFAULT_SHOP_ID): MenuItem[] {
    try {
      const data = safeStorage.getItem(getMenuKey(shopId));
      if (data) {
        const parsed: MenuItem[] = JSON.parse(data);
        const sanitized = this.sanitizeMenuItems(parsed, shopId);
        if (data.includes('หวาน 25%')) {
          safeStorage.setItem(getMenuKey(shopId), JSON.stringify(sanitized));
        }
        return sanitized;
      }
      const initial = initialMenuItems.map((item) => ({ ...item, storeId: shopId }));
      const sanitized = this.sanitizeMenuItems(initial, shopId);
      return sanitized;
    } catch {
      return this.sanitizeMenuItems(initialMenuItems.map((item) => ({ ...item, storeId: shopId })), shopId);
    }
  }

  setMenuItems(items: MenuItem[], shopId = DEFAULT_SHOP_ID): void {
    const sanitized = this.sanitizeMenuItems(items, shopId);
    safeStorage.setItem(getMenuKey(shopId), JSON.stringify(sanitized));
    this.broadcast({ type: 'MENU_UPDATED', payload: sanitized, storeId: shopId });
  }

  saveMenuItem(item: MenuItem, shopId = DEFAULT_SHOP_ID): MenuItem[] {
    const targetShop = shopId || item.storeId || DEFAULT_SHOP_ID;
    const items = this.getMenuItems(targetShop);
    const existingIndex = items.findIndex((i) => i.id === item.id);
    let updated: MenuItem[];
    const itemWithStore = { ...item, storeId: targetShop };
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex] = itemWithStore;
    } else {
      updated = [itemWithStore, ...items];
    }
    safeStorage.setItem(getMenuKey(targetShop), JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated, storeId: targetShop });
    return updated;
  }

  deleteMenuItem(itemId: string, shopId = DEFAULT_SHOP_ID): MenuItem[] {
    const items = this.getMenuItems(shopId);
    const updated = items.filter((i) => i.id !== itemId);
    safeStorage.setItem(getMenuKey(shopId), JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated, storeId: shopId });
    return updated;
  }

  toggleItemAvailability(itemId: string, shopId = DEFAULT_SHOP_ID): MenuItem[] {
    const items = this.getMenuItems(shopId);
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    safeStorage.setItem(getMenuKey(shopId), JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated, storeId: shopId });
    return updated;
  }

  restockAll(shopId = DEFAULT_SHOP_ID): MenuItem[] {
    const items = this.getMenuItems(shopId);
    const updated = items.map((item) => ({ ...item, isAvailable: true }));
    safeStorage.setItem(getMenuKey(shopId), JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated, storeId: shopId });
    return updated;
  }

  restockCategory(categoryId: string, shopId = DEFAULT_SHOP_ID): MenuItem[] {
    const items = this.getMenuItems(shopId);
    const updated = items.map((item) =>
      item.categoryId === categoryId ? { ...item, isAvailable: true } : item
    );
    safeStorage.setItem(getMenuKey(shopId), JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated, storeId: shopId });
    return updated;
  }

  // --- Store Config ---
  getStoreConfig(shopId = DEFAULT_SHOP_ID): StoreConfig {
    try {
      const data = safeStorage.getItem(getStoreKey(shopId));
      if (!data) {
        return {
          ...initialStoreConfig,
          id: shopId,
        };
      }
      const parsed: StoreConfig = JSON.parse(data);
      return {
        ...initialStoreConfig,
        ...parsed,
        id: parsed.id || shopId,
        companyLegalName: parsed.companyLegalName || initialStoreConfig.companyLegalName || parsed.name || 'บริษัท คาเฟ่ ออเดอร์ (ไทยแลนด์) จำกัด',
        phone: parsed.phone || initialStoreConfig.phone || '02-123-4567',
        taxId: parsed.taxId || initialStoreConfig.taxId || '0105566012345',
        branchNumber: parsed.branchNumber || initialStoreConfig.branchNumber || '00000 (สำนักงานใหญ่)',
        address: parsed.address || initialStoreConfig.address || '123/45 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
      };
    } catch {
      return {
        ...initialStoreConfig,
        id: shopId,
      };
    }
  }

  saveStoreConfig(config: StoreConfig, shopId?: string): StoreConfig {
    const targetShop = shopId || config.id || DEFAULT_SHOP_ID;
    const configWithId: StoreConfig = { ...config, id: targetShop };
    safeStorage.setItem(getStoreKey(targetShop), JSON.stringify(configWithId));
    this.broadcast({ type: 'STORE_CONFIG_UPDATED', payload: configWithId, storeId: targetShop });
    return configWithId;
  }

  // --- Reset Store Data ---
  resetAll(shopId = DEFAULT_SHOP_ID): void {
    safeStorage.removeItem(getOrdersKey(shopId));
    safeStorage.removeItem(getMenuKey(shopId));
    safeStorage.removeItem(getCategoriesKey(shopId));
    safeStorage.removeItem(getStoreKey(shopId));
    this.broadcast({ type: 'SYSTEM_RESET', storeId: shopId });
  }
}

export const syncManager = new RealtimeSyncManager();
