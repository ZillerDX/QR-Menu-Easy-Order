import { Order, MenuItem, MenuCategory, StoreConfig } from '../types';
import { initialMenuItems, initialCategories, initialStoreConfig } from '../data/initialMenu';

const ORDERS_KEY = 'qr_menu_orders_v3';
const MENU_KEY = 'qr_menu_items_v3';
const CATEGORIES_KEY = 'qr_menu_categories_v3';
const STORE_KEY = 'qr_menu_store_config_v3';
const CHANNEL_NAME = 'qr_menu_realtime_sync_v3';

export type SyncEventType = 
  | { type: 'ORDER_CREATED'; payload: Order }
  | { type: 'ORDER_STATUS_UPDATED'; payload: Order }
  | { type: 'MENU_UPDATED'; payload: MenuItem[] }
  | { type: 'CATEGORIES_UPDATED'; payload: MenuCategory[] }
  | { type: 'STORE_CONFIG_UPDATED'; payload: StoreConfig }
  | { type: 'SYSTEM_RESET' };

type EventListener = (event: SyncEventType) => void;

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
        if (e.key === ORDERS_KEY && e.newValue) {
          const orders = JSON.parse(e.newValue);
          const latest = orders[0];
          if (latest) {
            this.notifyListeners({ type: 'ORDER_CREATED', payload: latest });
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
      this.channel.postMessage(event);
    }
    this.notifyListeners(event);
  }

  // --- Orders ---
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveOrder(order: Order): Order[] {
    const orders = this.getOrders();
    const updated = [order, ...orders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    this.broadcast({ type: 'ORDER_CREATED', payload: order });
    return updated;
  }

  updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Order[] {
    const orders = this.getOrders();
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
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    if (targetOrder) {
      this.broadcast({ type: 'ORDER_STATUS_UPDATED', payload: targetOrder });
    }
    return updated;
  }

  // --- Menu Categories ---
  getCategories(): MenuCategory[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      return data ? JSON.parse(data) : initialCategories;
    } catch {
      return initialCategories;
    }
  }

  saveCategory(category: MenuCategory): MenuCategory[] {
    const categories = this.getCategories();
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    let updated: MenuCategory[];
    if (existingIndex >= 0) {
      updated = [...categories];
      updated[existingIndex] = category;
    } else {
      updated = [...categories, category];
    }
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    this.broadcast({ type: 'CATEGORIES_UPDATED', payload: updated });
    return updated;
  }

  deleteCategory(categoryId: string): MenuCategory[] {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.id !== categoryId);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    this.broadcast({ type: 'CATEGORIES_UPDATED', payload: updated });
    return updated;
  }

  // --- Menu Items ---
  getMenuItems(): MenuItem[] {
    try {
      const data = localStorage.getItem(MENU_KEY);
      return data ? JSON.parse(data) : initialMenuItems;
    } catch {
      return initialMenuItems;
    }
  }

  saveMenuItem(item: MenuItem): MenuItem[] {
    const items = this.getMenuItems();
    const existingIndex = items.findIndex((i) => i.id === item.id);
    let updated: MenuItem[];
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...items];
    }
    localStorage.setItem(MENU_KEY, JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated });
    return updated;
  }

  deleteMenuItem(itemId: string): MenuItem[] {
    const items = this.getMenuItems();
    const updated = items.filter((i) => i.id !== itemId);
    localStorage.setItem(MENU_KEY, JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated });
    return updated;
  }

  toggleItemAvailability(itemId: string): MenuItem[] {
    const items = this.getMenuItems();
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    localStorage.setItem(MENU_KEY, JSON.stringify(updated));
    this.broadcast({ type: 'MENU_UPDATED', payload: updated });
    return updated;
  }

  // --- Store Config ---
  getStoreConfig(): StoreConfig {
    try {
      const data = localStorage.getItem(STORE_KEY);
      return data ? JSON.parse(data) : initialStoreConfig;
    } catch {
      return initialStoreConfig;
    }
  }

  saveStoreConfig(config: StoreConfig): StoreConfig {
    localStorage.setItem(STORE_KEY, JSON.stringify(config));
    this.broadcast({ type: 'STORE_CONFIG_UPDATED', payload: config });
    return config;
  }

  // --- Reset All ---
  resetAll() {
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(MENU_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    localStorage.removeItem(STORE_KEY);
    this.broadcast({ type: 'SYSTEM_RESET' });
  }
}

export const syncManager = new RealtimeSyncManager();
