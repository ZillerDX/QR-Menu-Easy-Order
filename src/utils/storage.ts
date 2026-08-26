import { Order, MenuItem, StoreConfig } from '../types';
import { initialMenuItems, initialStoreConfig } from '../data/initialMenu';

const ORDERS_KEY = 'qr_menu_orders_v1';
const MENU_KEY = 'qr_menu_items_v1';
const STORE_KEY = 'qr_menu_store_config_v1';
const CHANNEL_NAME = 'qr_menu_realtime_sync';

export type SyncEventType = 
  | { type: 'ORDER_CREATED'; payload: Order }
  | { type: 'ORDER_STATUS_UPDATED'; payload: Order }
  | { type: 'MENU_UPDATED'; payload: MenuItem[] }
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

    // Fallback for storage event across tabs
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

  // --- Menu & Stock ---
  getMenuItems(): MenuItem[] {
    try {
      const data = localStorage.getItem(MENU_KEY);
      return data ? JSON.parse(data) : initialMenuItems;
    } catch {
      return initialMenuItems;
    }
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

  // --- Reset All (For testing) ---
  resetAll() {
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(MENU_KEY);
    localStorage.removeItem(STORE_KEY);
    this.broadcast({ type: 'SYSTEM_RESET' });
  }
}

export const syncManager = new RealtimeSyncManager();
