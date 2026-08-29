import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem, MenuCategory, CartItem, Order, OrderStatus, SelectedOption, Language, StoreConfig } from './types';
import { initialMenuItems, initialCategories, initialStoreConfig } from './data/initialMenu';
import { syncManager } from './utils/storage';
import { soundService, SoundPreset } from './utils/sound';
import { t, getInitialLanguage, saveLanguagePreference } from './utils/i18n';
import { Header } from './components/common/Header';
import { RoleSwitcher, AppRole } from './components/common/RoleSwitcher';
import { MenuCard } from './components/customer/MenuCard';
import { ItemModal } from './components/customer/ItemModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { OrderTracker } from './components/customer/OrderTracker';
import { OrderCountdownModal } from './components/customer/OrderCountdownModal';
import { KitchenDashboard } from './components/kitchen/KitchenDashboard';
import { MenuAdmin } from './components/admin/MenuAdmin';
import { StoreSettings } from './components/admin/StoreSettings';
import { QRGenerator } from './components/table-qr/QRGenerator';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { StorePortalLanding } from './components/portal/StorePortalLanding';
import { supabase, authService } from './utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Search, Sparkles, Coffee, CupSoda, Utensils, Cake, Pizza, Heart, ArrowRight, Hourglass, Flame, CheckCircle2, ShoppingBag, Ban, Loader2, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-200 text-orange-600 flex items-center justify-center font-black text-2xl shadow-sm">
            ☕
          </div>
          <h2 className="text-xl font-black text-stone-900">พบปัญหาในการแสดงผลชั่วคราว</h2>
          <p className="text-xs text-stone-500 max-w-md leading-relaxed font-medium">
            ระบบได้บันทึกข้อผิดพลาดไว้แล้ว กรุณากดปุ่มด้านล่างเพื่อเริ่มการทำงานใหม่
          </p>
          {this.state.error && (
            <pre className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-[11px] font-mono max-w-lg overflow-x-auto text-left">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>รีเฟรชหน้าจอ (Reload App)</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 1. Resolve Store / Shop ID from URL query or default
  const [shopId, setShopId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const shop = params.get('shop');
      if (shop) return shop;
    }
    return 'cafe-order';
  });

  // 2. Synchronously resolve Table Number and Customer mode from URL query parameter
  const [hasTableParam, setHasTableParam] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('table');
    }
    return false;
  });

  const [tableNumber, setTableNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      if (tbl) return tbl;
    }
    return '01';
  });

  const [activeRole, setActiveRole] = useState<AppRole>('customer');
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => syncManager.getStoreConfig(shopId));
  const [categories, setCategories] = useState<MenuCategory[]>(() => syncManager.getCategories(shopId));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => syncManager.getMenuItems(shopId));
  const [orders, setOrders] = useState<Order[]>(() => syncManager.getOrders(shopId));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Supabase Auth State
  const [user, setUser] = useState<User | null>(null);

  // Modals & Sheets
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  
  // Tracked order strictly scoped to THIS CUSTOMER'S ACTIVE BROWSER SESSION ONLY!
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(() => {
    if (typeof window !== 'undefined') {
      const sessionOrderId = sessionStorage.getItem('my_active_order_id');
      if (!sessionOrderId) return null;
      const all = syncManager.getOrders(shopId);
      const match = all.find((o) => o.id === sessionOrderId);
      return match || null;
    }
    return null;
  });

  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Auto-provision or resolve user's store from Supabase
  const resolveUserStore = useCallback(async (currentUser: User): Promise<{ shopId: string; config: StoreConfig }> => {
    try {
      // 1. Check if user already owns a store_config
      const { data: existing, error } = await supabase
        .from('store_config')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!error && existing) {
        const mappedConfig: StoreConfig = {
          id: existing.id,
          userId: existing.user_id,
          name: existing.name,
          nameEn: existing.name_en,
          tagline: existing.tagline,
          taglineEn: existing.tagline_en,
          logoUrl: existing.logo_url,
          promptpayNumber: existing.promptpay_number,
          promptpayName: existing.promptpay_name,
          openTime: existing.open_time,
          tableCount: existing.table_count,
          taxId: existing.tax_id,
          address: existing.address,
          branchNumber: existing.branch_number,
        };
        return { shopId: existing.id, config: mappedConfig };
      }

      // 2. If new user, create a unique shopId
      const userPrefix = currentUser.email ? currentUser.email.split('@')[0] : 'mystore';
      const cleanSlug = userPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueSuffix = currentUser.id.replace(/-/g, '').slice(0, 6);
      const newShopId = `shop-${cleanSlug || 'store'}-${uniqueSuffix}`;

      const newStoreConfig: StoreConfig = {
        ...initialStoreConfig,
        id: newShopId,
        userId: currentUser.id,
        name: `ร้าน ${userPrefix}`,
        nameEn: `${userPrefix}'s Cafe`,
        promptpayName: `${userPrefix}`,
      };

      // 3. Insert store_config
      await supabase.from('store_config').upsert({
        id: newShopId,
        user_id: currentUser.id,
        name: newStoreConfig.name,
        name_en: newStoreConfig.nameEn,
        tagline: newStoreConfig.tagline,
        tagline_en: newStoreConfig.taglineEn,
        logo_url: newStoreConfig.logoUrl,
        promptpay_number: newStoreConfig.promptpayNumber,
        promptpay_name: newStoreConfig.promptpayName,
        open_time: newStoreConfig.openTime,
        table_count: newStoreConfig.tableCount,
        tax_id: newStoreConfig.taxId,
        address: newStoreConfig.address,
        branch_number: newStoreConfig.branchNumber,
        updated_at: new Date().toISOString(),
      });

      // 4. Provision default categories for new store
      const initialCatsForStore = initialCategories.map((c) => ({
        id: c.id,
        store_id: newShopId,
        name: c.name,
        name_en: c.nameEn,
        icon: c.icon,
        sort_order: 0,
      }));
      await supabase.from('categories').upsert(initialCatsForStore, { onConflict: 'store_id, id' });

      // 5. Provision default menu items for new store
      const initialItemsForStore = initialMenuItems.map((item) => ({
        id: item.id,
        store_id: newShopId,
        category_id: item.categoryId,
        name: item.name,
        name_en: item.nameEn,
        description: item.description,
        description_en: item.descriptionEn,
        price: item.price,
        image_url: item.imageUrl,
        is_popular: !!item.isPopular,
        is_recommended: !!item.isChefRecommend,
        is_available: item.isAvailable !== false,
        option_groups: item.optionGroups || [],
      }));
      await supabase.from('menu_items').upsert(initialItemsForStore, { onConflict: 'store_id, id' });

      // Save locally
      syncManager.saveStoreConfig(newStoreConfig, newShopId);
      syncManager.setCategories(initialCategories.map(c => ({ ...c, storeId: newShopId })), newShopId);
      syncManager.setMenuItems(initialMenuItems.map(i => ({ ...i, storeId: newShopId })), newShopId);

      return { shopId: newShopId, config: newStoreConfig };
    } catch (err) {
      console.warn("Error resolving user store:", err);
      return { shopId: `shop-${currentUser.id.slice(0, 8)}`, config: syncManager.getStoreConfig(shopId) };
    }
  }, [shopId]);

  // Fetch Orders Only (for light background polling without overwriting menu state)
  const fetchOrdersOnly = useCallback(async (targetShopId: string) => {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', targetShopId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersData) {
        const mappedOrders: Order[] = ordersData.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          tableNumber: row.table_number,
          storeId: row.store_id || targetShopId,
          status: row.status,
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          subtotal: Number(row.total_price),
          totalPrice: Number(row.total_price),
          items: row.items || [],
          customerNote: row.notes,
          cancelReason: row.cancel_reason,
          createdAt: row.created_at,
        }));
        setOrders(mappedOrders);
        syncManager.setOrders(mappedOrders, targetShopId);

        const myOrderId = sessionStorage.getItem('my_active_order_id');
        if (myOrderId) {
          const myOrder = mappedOrders.find((o) => o.id === myOrderId);
          if (myOrder) {
            setTrackedOrder(myOrder);
          }
        }
      }
    } catch (err) {
      console.warn("Fetch orders error:", err);
    }
  }, []);

  // Fetch full store data (config, categories, menu, orders) from Supabase for current shopId
  const fetchStoreData = useCallback(async (targetShopId: string) => {
    try {
      // 1. Fetch Store Config
      const { data: configData } = await supabase
        .from('store_config')
        .select('*')
        .eq('id', targetShopId)
        .maybeSingle();

      if (configData) {
        const mappedConfig: StoreConfig = {
          id: configData.id,
          userId: configData.user_id,
          name: configData.name,
          nameEn: configData.name_en,
          tagline: configData.tagline,
          taglineEn: configData.tagline_en,
          logoUrl: configData.logo_url,
          promptpayNumber: configData.promptpay_number,
          promptpayName: configData.promptpay_name,
          openTime: configData.open_time,
          tableCount: configData.table_count,
          taxId: configData.tax_id,
          address: configData.address,
          branchNumber: configData.branch_number,
        };
        setStoreConfig(mappedConfig);
        syncManager.saveStoreConfig(mappedConfig, targetShopId);
      } else {
        setStoreConfig(syncManager.getStoreConfig(targetShopId));
      }

      // 2. Fetch Categories
      const { data: catsData } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', targetShopId)
        .order('sort_order', { ascending: true });

      if (catsData && catsData.length > 0) {
        const mappedCats: MenuCategory[] = catsData.map((c: any) => ({
          id: c.id,
          storeId: c.store_id || targetShopId,
          name: c.name,
          nameEn: c.name_en || c.name,
          icon: c.icon || 'Coffee',
        }));
        setCategories(mappedCats);
        syncManager.setCategories(mappedCats, targetShopId);
      } else {
        const localCats = syncManager.getCategories(targetShopId);
        setCategories(localCats);
      }

      // 3. Fetch Menu Items
      const { data: itemsData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('store_id', targetShopId);

      if (itemsData && itemsData.length > 0) {
        const mappedItems: MenuItem[] = itemsData.map((it: any) => ({
          id: it.id,
          storeId: it.store_id || targetShopId,
          categoryId: it.category_id,
          name: it.name,
          nameEn: it.name_en,
          description: it.description || '',
          descriptionEn: it.description_en || '',
          price: Number(it.price),
          imageUrl: it.image_url || '',
          isAvailable: it.is_available !== false,
          isPopular: !!it.is_popular,
          isChefRecommend: !!it.is_recommended,
          optionGroups: it.option_groups || [],
        }));
        setMenuItems(mappedItems);
        syncManager.setMenuItems(mappedItems, targetShopId);
      } else {
        const localItems = syncManager.getMenuItems(targetShopId);
        setMenuItems(localItems);
      }

      // 4. Fetch Orders
      await fetchOrdersOnly(targetShopId);
    } catch (err) {
      console.warn("Supabase fetch store data error:", err);
    }
  }, [fetchOrdersOnly]);

  // Initialize Auth, Routing & Isolated Store Resolution
  useEffect(() => {
    let currentActiveShop = shopId;

    authService.getSession().then(async (session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      const roleParam = params.get('role');
      const urlShopParam = params.get('shop');

      if (tableParam) {
        setActiveRole('customer');
        if (urlShopParam) {
          currentActiveShop = urlShopParam;
          setShopId(urlShopParam);
        }
      } else if (currentUser) {
        setActiveRole((roleParam as AppRole) || 'kitchen');
        const { shopId: userShop, config: userConfig } = await resolveUserStore(currentUser);
        currentActiveShop = userShop;
        setShopId(userShop);
        setStoreConfig(userConfig);
      } else if (urlShopParam) {
        currentActiveShop = urlShopParam;
        setShopId(urlShopParam);
      }

      await fetchStoreData(currentActiveShop);
      setIsAuthReady(true);
    }).catch(() => {
      setIsAuthReady(true);
    });

    const { data: authListener } = authService.onAuthStateChange(async (newUser) => {
      setUser(newUser);
      if (newUser && !hasTableParam) {
        setActiveRole('kitchen');
        const { shopId: userShop, config: userConfig } = await resolveUserStore(newUser);
        setShopId(userShop);
        setStoreConfig(userConfig);
        await fetchStoreData(userShop);
      }
    });

    const handleFocus = () => fetchOrdersOnly(shopId);
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchOrdersOnly(shopId);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const pollInterval = setInterval(() => fetchOrdersOnly(shopId), 4000);

    const unsubscribe = syncManager.subscribe((event) => {
      if (event.storeId && event.storeId !== shopId) return;

      if (event.type === 'ORDER_CREATED') {
        const updated = syncManager.getOrders(shopId);
        setOrders(updated);
        try {
          const savedPreset = (localStorage.getItem('pos_sound_preset') as SoundPreset) || 'cheerful';
          soundService.playNewOrderChime(savedPreset);
        } catch {
          soundService.playNewOrderChime();
        }
      } else if (event.type === 'ORDER_STATUS_UPDATED') {
        const updated = syncManager.getOrders(shopId);
        setOrders(updated);
        const myOrderId = sessionStorage.getItem('my_active_order_id');
        if (myOrderId && event.payload.id === myOrderId) {
          setTrackedOrder(event.payload);
        }
      } else if (event.type === 'MENU_UPDATED') {
        setMenuItems(event.payload);
      } else if (event.type === 'CATEGORIES_UPDATED') {
        setCategories(event.payload);
      } else if (event.type === 'STORE_CONFIG_UPDATED') {
        setStoreConfig(event.payload);
      } else if (event.type === 'SYSTEM_RESET') {
        setStoreConfig(syncManager.getStoreConfig(shopId));
        setCategories(syncManager.getCategories(shopId));
        setMenuItems(syncManager.getMenuItems(shopId));
        setOrders([]);
        setCart([]);
        setTrackedOrder(null);
        sessionStorage.removeItem('my_active_order_id');
        setIsOrderTrackerOpen(false);
      }
    });

    // Realtime channel strictly filtered to current shopId
    const orderSubscription = supabase
      .channel(`public:store:${shopId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${shopId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newO: any = payload.new;
          const mappedOrder: Order = {
            id: newO.id,
            orderNumber: newO.order_number,
            tableNumber: newO.table_number,
            storeId: newO.store_id || shopId,
            status: newO.status,
            paymentMethod: newO.payment_method,
            paymentStatus: newO.payment_status,
            subtotal: Number(newO.total_price),
            totalPrice: Number(newO.total_price),
            items: newO.items || [],
            customerNote: newO.notes,
            cancelReason: newO.cancel_reason,
            createdAt: newO.created_at,
          };
          setOrders((prev) => {
            if (prev.some((o) => o.id === mappedOrder.id)) return prev;
            return [mappedOrder, ...prev];
          });
          
          try {
            const savedPreset = (localStorage.getItem('pos_sound_preset') as SoundPreset) || 'cheerful';
            soundService.playNewOrderChime(savedPreset);
          } catch {
            soundService.playNewOrderChime();
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedO: any = payload.new;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === updatedO.id
                ? {
                    ...o,
                    status: updatedO.status,
                    paymentStatus: updatedO.payment_status,
                    cancelReason: updatedO.cancel_reason,
                  }
                : o
            )
          );
          const myOrderId = sessionStorage.getItem('my_active_order_id');
          if (myOrderId && updatedO.id === myOrderId) {
            setTrackedOrder((prev) => 
              prev ? { ...prev, status: updatedO.status, paymentStatus: updatedO.payment_status, cancelReason: updatedO.cancel_reason } : null
            );
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `store_id=eq.${shopId}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const it: any = payload.new;
          const mappedItem: MenuItem = {
            id: it.id,
            storeId: it.store_id || shopId,
            categoryId: it.category_id,
            name: it.name,
            nameEn: it.name_en,
            description: it.description || '',
            descriptionEn: it.description_en || '',
            price: Number(it.price),
            imageUrl: it.image_url || '',
            isAvailable: it.is_available !== false,
            isPopular: !!it.is_popular,
            isChefRecommend: !!it.is_recommended,
            optionGroups: it.option_groups || [],
          };
          setMenuItems((prev) => {
            const idx = prev.findIndex((i) => i.id === mappedItem.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = mappedItem;
              return updated;
            }
            return [mappedItem, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const oldIt: any = payload.old;
          if (oldIt?.id) {
            setMenuItems((prev) => prev.filter((i) => i.id !== oldIt.id));
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `store_id=eq.${shopId}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const c: any = payload.new;
          const mappedCat: MenuCategory = {
            id: c.id,
            storeId: c.store_id || shopId,
            name: c.name,
            nameEn: c.name_en || c.name,
            icon: c.icon || 'Coffee',
          };
          setCategories((prev) => {
            const idx = prev.findIndex((cat) => cat.id === mappedCat.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = mappedCat;
              return updated;
            }
            return [...prev, mappedCat];
          });
        } else if (payload.eventType === 'DELETE') {
          const oldCat: any = payload.old;
          if (oldCat?.id) {
            setCategories((prev) => prev.filter((c) => c.id !== oldCat.id));
          }
        }
      })
      .subscribe();

    return () => {
      authListener?.subscription.unsubscribe();
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollInterval);
      supabase.removeChannel(orderSubscription);
    };
  }, [fetchOrdersOnly, fetchStoreData, hasTableParam, resolveUserStore, shopId]);

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'th' : 'en';
    setLanguage(nextLang);
    saveLanguagePreference(nextLang);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLang);
    window.history.replaceState({}, '', url.toString());
  };

  const handleSelectRole = (role: AppRole) => {
    if (role !== 'customer' && !user) {
      setIsSimulatorMode(false);
      setActiveRole('customer');
      return;
    }
    setActiveRole(role);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsSimulatorMode(false);
      setActiveRole('customer');
      setShopId('cafe-order');
      await fetchStoreData('cafe-order');
    } catch (e) {
      console.error("Logout error:", e);
      setUser(null);
      setIsSimulatorMode(false);
      setActiveRole('customer');
      setShopId('cafe-order');
      await fetchStoreData('cafe-order');
    }
  };

  const handleSaveStoreConfig = async (config: StoreConfig) => {
    const saved = syncManager.saveStoreConfig(config, shopId);
    setStoreConfig(saved);
    try {
      const { error } = await supabase.from('store_config').upsert({
        id: shopId,
        user_id: user?.id,
        name: config.name,
        name_en: config.nameEn,
        tagline: config.tagline,
        tagline_en: config.taglineEn,
        logo_url: config.logoUrl,
        promptpay_number: config.promptpayNumber,
        promptpay_name: config.promptpayName,
        open_time: config.openTime,
        table_count: config.tableCount,
        tax_id: config.taxId,
        address: config.address,
        branch_number: config.branchNumber,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      console.error("Supabase upsert store_config error:", err);
      setErrorToast(language === 'th' ? '⚠️ บันทึกการตั้งค่าไปยังเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to save store settings to server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialNote: string,
    unitPriceWithDelta: number
  ) => {
    const cartItemId = `${item.id}-${Date.now()}`;
    const newCartItem: CartItem = {
      cartItemId,
      menuItem: item,
      quantity,
      selectedOptions,
      specialNote,
      unitPriceWithDelta,
      totalItemPrice: unitPriceWithDelta * quantity,
    };
    setCart((prev) => [...prev, newCartItem]);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? {
                  ...item,
                  quantity: newQty,
                  totalItemPrice: item.unitPriceWithDelta * newQty,
                }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCountdownOpen(true);
  };

  const handleFinalizeOrder = async () => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
    const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber,
      storeId: shopId,
      items: [...cart],
      subtotal,
      totalPrice: subtotal,
      paymentMethod: 'promptpay',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    syncManager.saveOrder(newOrder, shopId);
    setCart([]);
    setIsCountdownOpen(false);

    sessionStorage.setItem('my_active_order_id', newOrder.id);
    setTrackedOrder(newOrder);
    setIsOrderTrackerOpen(true);

    try {
      await supabase.from('orders').insert([{
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        table_number: newOrder.tableNumber,
        store_id: newOrder.storeId,
        status: newOrder.status,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        total_price: newOrder.totalPrice,
        items: newOrder.items,
        notes: newOrder.customerNote || '',
      }]);
    } catch (e) {
      console.error("Supabase insert order error:", e);
      setErrorToast(language === 'th' ? '⚠️ ส่งออเดอร์ไปยังเซิร์ฟเวอร์ไม่สำเร็จ แต่ออเดอร์ถูกบันทึกในเครื่องแล้ว' : '⚠️ Failed to sync order to server, but saved locally');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: Order['paymentStatus']
  ) => {
    const updated = syncManager.updateOrderStatus(orderId, status, paymentStatus, shopId);
    setOrders(updated);

    const myOrderId = sessionStorage.getItem('my_active_order_id');
    if (myOrderId && orderId === myOrderId) {
      setTrackedOrder((prev) => (prev ? { ...prev, status, ...(paymentStatus ? { paymentStatus } : {}) } : null));
    }

    try {
      await supabase
        .from('orders')
        .update({
          status,
          ...(paymentStatus ? { payment_status: paymentStatus } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    } catch (e) {
      console.error("Supabase update status error:", e);
      setErrorToast(language === 'th' ? '⚠️ อัปเดตสถานะไปยังเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to sync status update to server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    const updated = syncManager.updateOrderStatus(orderId, 'cancelled', undefined, shopId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled', cancelReason: reason } : o))
    );

    const myOrderId = sessionStorage.getItem('my_active_order_id');
    if (myOrderId && orderId === myOrderId) {
      setTrackedOrder((prev) => (prev ? { ...prev, status: 'cancelled', cancelReason: reason } : null));
    }

    try {
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancel_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    } catch (e) {
      console.error("Supabase cancel order error:", e);
      setErrorToast(language === 'th' ? '⚠️ ยกเลิกออเดอร์บนเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to sync cancellation to server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleToggleStock = async (itemId: string) => {
    const updated = syncManager.toggleItemAvailability(itemId, shopId);
    setMenuItems(updated);
    const target = updated.find((i) => i.id === itemId);
    if (target) {
      try {
        await supabase
          .from('menu_items')
          .update({ is_available: target.isAvailable })
          .eq('store_id', shopId)
          .eq('id', itemId);
      } catch (err) {
        console.error("Supabase toggle stock error:", err);
      }
    }
  };

  const handleRestockAll = async () => {
    const updated = syncManager.restockAll(shopId);
    setMenuItems(updated);
    try {
      await supabase
        .from('menu_items')
        .update({ is_available: true })
        .eq('store_id', shopId);
    } catch (err) {
      console.error("Supabase bulk restock all error:", err);
    }
  };

  const handleRestockCategory = async (categoryId: string) => {
    const updated = syncManager.restockCategory(categoryId, shopId);
    setMenuItems(updated);
    try {
      await supabase
        .from('menu_items')
        .update({ is_available: true })
        .eq('store_id', shopId)
        .eq('category_id', categoryId);
    } catch (err) {
      console.error("Supabase bulk restock category error:", err);
    }
  };

  const handleSaveMenuItem = async (item: MenuItem) => {
    const itemWithStore = { ...item, storeId: shopId };
    const updated = syncManager.saveMenuItem(itemWithStore, shopId);
    setMenuItems(updated);
    try {
      const { error } = await supabase.from('menu_items').upsert({
        id: item.id,
        store_id: shopId,
        category_id: item.categoryId,
        name: item.name,
        name_en: item.nameEn || '',
        description: item.description || '',
        description_en: item.descriptionEn || '',
        price: item.price,
        image_url: item.imageUrl || '',
        is_popular: !!item.isPopular,
        is_recommended: !!item.isChefRecommend,
        is_available: item.isAvailable !== false,
        option_groups: item.optionGroups || [],
      }, { onConflict: 'store_id, id' });
      if (error) throw error;
    } catch (err) {
      console.error("Supabase upsert menu item error:", err);
      setErrorToast(language === 'th' ? '⚠️ บันทึกเมนูไปยังเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to save menu item to server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    const updated = syncManager.deleteMenuItem(itemId, shopId);
    setMenuItems(updated);
    try {
      const { error } = await supabase.from('menu_items').delete().eq('store_id', shopId).eq('id', itemId);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete menu item error:", err);
      setErrorToast(language === 'th' ? '⚠️ ลบเมนูจากเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to delete menu item from server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleSaveCategory = async (cat: MenuCategory) => {
    const catWithStore = { ...cat, storeId: shopId };
    const updated = syncManager.saveCategory(catWithStore, shopId);
    setCategories(updated);
    try {
      const { error } = await supabase.from('categories').upsert({
        id: cat.id,
        store_id: shopId,
        name: cat.name,
        name_en: cat.nameEn || cat.name,
        icon: cat.icon || 'Coffee',
        sort_order: 0,
      }, { onConflict: 'store_id, id' });
      if (error) throw error;
    } catch (err) {
      console.error("Supabase upsert category error:", err);
      setErrorToast(language === 'th' ? '⚠️ บันทึกหมวดหมู่ไปยังเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to save category to server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const updated = syncManager.deleteCategory(catId, shopId);
    setCategories(updated);
    try {
      const { error } = await supabase.from('categories').delete().eq('store_id', shopId).eq('id', catId);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete category error:", err);
      setErrorToast(language === 'th' ? '⚠️ ลบหมวดหมู่จากเซิร์ฟเวอร์ไม่สำเร็จ' : '⚠️ Failed to delete category from server');
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleExecuteResetData = () => {
    syncManager.resetAll(shopId);
    sessionStorage.removeItem('my_active_order_id');
    setTrackedOrder(null);
    setIsResetConfirmOpen(false);
    fetchStoreData(shopId);
  };

  const handleCloseTracker = () => {
    setIsOrderTrackerOpen(false);
    if (trackedOrder?.status === 'completed' || trackedOrder?.status === 'cancelled') {
      sessionStorage.removeItem('my_active_order_id');
      setTrackedOrder(null);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.descriptionEn && item.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'popular') {
      return item.isPopular || item.isChefRecommend;
    }
    return item.categoryId === selectedCategory;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 flex-shrink-0" />;
      case 'Coffee': return <Coffee className="w-4 h-4 flex-shrink-0" />;
      case 'CupSoda': return <CupSoda className="w-4 h-4 flex-shrink-0" />;
      case 'Utensils': return <Utensils className="w-4 h-4 flex-shrink-0" />;
      case 'Cake': return <Cake className="w-4 h-4 flex-shrink-0" />;
      case 'Pizza': return <Pizza className="w-4 h-4 flex-shrink-0" />;
      case 'Heart': return <Heart className="w-4 h-4 flex-shrink-0" />;
      default: return <Coffee className="w-4 h-4 flex-shrink-0" />;
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'cooking').length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);

  // Determine view mode:
  const isDirectNonTableAccess = !hasTableParam;
  const shouldShowStorePortal = isDirectNonTableAccess && !user && !isSimulatorMode;
  const isCustomerDining = hasTableParam || isSimulatorMode;

  // Zero-Flash Initial Splash Loader (Clean & Instant)
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-md flex items-center justify-center animate-pulse">
          <img src={storeConfig.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[14px]" />
        </div>
        <span className="text-xs font-bold text-stone-400">Loading Cafe Order...</span>
      </div>
    );
  }

  return (
    <div 
      id="app-root-container" 
      className={`min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col selection:bg-orange-500 selection:text-white ${receiptOrder ? 'print:hidden' : ''}`}
    >
      {/* Top Header with Context-Aware Controls */}
      <Header
        storeConfig={storeConfig}
        tableNumber={tableNumber}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeRole={shouldShowStorePortal ? 'customer' : activeRole}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        user={user}
        onLogout={handleLogout}
        isCustomerView={isCustomerDining && !user}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* VIEW 0: STORE PORTAL LANDING (FOR DIRECT STORE ACCESS / NON-CUSTOMER) */}
        {shouldShowStorePortal && (
          <StorePortalLanding
            storeConfig={storeConfig}
            language={language}
            onLoginSuccess={() => {
              setActiveRole('kitchen');
            }}
            onEnterSimulator={(tbl) => {
              if (tbl) setTableNumber(tbl);
              setIsSimulatorMode(true);
              setActiveRole('customer');
            }}
          />
        )}

        {/* VIEW 1: CUSTOMER VIEW (OR TEST SIMULATOR) */}
        {(!shouldShowStorePortal && activeRole === 'customer') && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
            
            {/* Simulator Mode Exit Pill (Shown ONLY if shop owner is in testing mode) */}
            {isSimulatorMode && !hasTableParam && (
              <div className="bg-stone-900 text-white rounded-2xl p-3 px-4 flex items-center justify-between shadow-md animate-in slide-in-from-top-3">
                <div className="flex items-center gap-2 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>{language === 'th' ? 'โหมดทดสอบสั่งอาหารจำลองสำหรับเจ้าของร้าน (โต๊ะ ' + tableNumber + ')' : `Store Simulator Mode (Table ${tableNumber})`}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulatorMode(false);
                    if (!user) setActiveRole('customer');
                  }}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-xl font-bold cursor-pointer transition"
                >
                  {language === 'th' ? 'กลับหน้าพอร์ทัลร้าน' : 'Exit Simulator'}
                </button>
              </div>
            )}

            {/* Active Tracked Order Banner */}
            {trackedOrder && (
              <div
                onClick={() => setIsOrderTrackerOpen(true)}
                className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 text-white shadow-xl flex items-center justify-between animate-pulse-subtle cursor-pointer hover:shadow-2xl transition-all duration-300 group hover:-translate-y-0.5 ${
                  trackedOrder.status === 'cancelled'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/25'
                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-orange-500/25'
                }`}
              >
                <div className="absolute inset-0 shimmer-gradient pointer-events-none opacity-30" />
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                    {trackedOrder.status === 'pending' && <Hourglass className="w-6 h-6 animate-spin" />}
                    {trackedOrder.status === 'cooking' && <Flame className="w-6 h-6 animate-bounce" />}
                    {trackedOrder.status === 'ready' && <Sparkles className="w-6 h-6 animate-pulse" />}
                    {trackedOrder.status === 'completed' && <CheckCircle2 className="w-6 h-6" />}
                    {trackedOrder.status === 'cancelled' && <Ban className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm tracking-tight">
                        {language === 'th' ? 'ติดตามออเดอร์' : 'Order Tracking'}: {trackedOrder.orderNumber}
                      </span>
                      <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                        {trackedOrder.tableNumber === 'TAKEAWAY' ? t('takeaway', language) : `${language === 'th' ? 'โต๊ะ' : 'Table'} ${trackedOrder.tableNumber}`}
                      </span>
                    </div>
                    <p className="text-xs text-orange-100 font-medium mt-0.5">
                      {trackedOrder.status === 'pending' && (language === 'th' ? 'กำลังรอคิวรับออเดอร์...' : 'Waiting for kitchen confirmation...')}
                      {trackedOrder.status === 'cooking' && (language === 'th' ? 'ห้องครัวกำลังปรุงเมนูของคุณอย่างพิถีพิถัน 🔥' : 'Kitchen is preparing your meal 🔥')}
                      {trackedOrder.status === 'ready' && (language === 'th' ? 'อาหารพร้อมเสิร์ฟแล้ว! กำลังนำไปส่งที่โต๊ะ ✨' : 'Food is ready to be served! ✨')}
                      {trackedOrder.status === 'completed' && (language === 'th' ? 'ออเดอร์เสร็จสมบูรณ์ ทานให้อร่อยนะคะ' : 'Order completed. Enjoy your meal!')}
                      {trackedOrder.status === 'cancelled' && (language === 'th' ? `❌ ออเดอร์ถูกยกเลิก (${trackedOrder.cancelReason || 'กรุณาติดต่อพนักงาน'})` : 'Order was cancelled by store')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 relative z-10 pl-2">
                  <span className="hidden sm:inline text-xs font-black bg-white text-orange-600 px-3 py-1.5 rounded-xl shadow-md group-hover:bg-orange-50 transition">
                    {language === 'th' ? 'แตะเพื่อดูสถานะ' : 'View Status'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Category Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20'
                        : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200/80 shadow-2xs'
                    }`}
                  >
                    {getCategoryIcon(category.icon)}
                    <span>{language === 'en' && category.nameEn ? category.nameEn : category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchPlaceholder', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200/90 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-2xs transition font-medium"
              />
            </div>

            {/* Menu Grid */}
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 shadow-xs">
                <Utensils className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                <p className="text-sm font-bold text-stone-500">
                  {language === 'th' ? 'ไม่พบเมนูที่ค้นหา' : 'No menu items found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {filteredMenuItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    language={language}
                    onSelect={(it) => setActiveModalItem(it)}
                  />
                ))}
              </div>
            )}

            {/* Floating Action Button (FAB) Cart Button on Bottom-Right */}
            {totalCartCount > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-6 right-5 sm:right-8 z-30 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer ring-4 ring-white/90 group animate-in slide-in-from-bottom-5"
                title="View Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 sm:w-5 sm:h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                  <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-heartbeat shadow-sm">
                    {totalCartCount}
                  </span>
                </div>
                <span className="hidden sm:inline font-black text-sm">
                  {language === 'th' ? 'ดูตะกร้า' : 'Cart'}
                </span>
                <span className="font-black text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  ฿{cartSubtotal.toLocaleString()}
                </span>
              </button>
            )}
          </div>
        )}

        {/* VIEW 2: KITCHEN DISPLAY SYSTEM (KDS) */}
        {activeRole === 'kitchen' && user && (
          <KitchenDashboard
            orders={orders}
            menuItems={menuItems}
            categories={categories}
            language={language}
            onUpdateStatus={handleUpdateOrderStatus}
            onToggleStock={handleToggleStock}
            onRestockAll={handleRestockAll}
            onRestockCategory={handleRestockCategory}
            onPrintReceipt={(order) => setReceiptOrder(order)}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {/* VIEW 3: MENU & CATEGORY ADMIN */}
        {activeRole === 'admin' && user && (
          <MenuAdmin
            menuItems={menuItems}
            categories={categories}
            language={language}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onToggleStock={handleToggleStock}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* VIEW 4: STORE SETTINGS */}
        {activeRole === 'settings' && user && (
          <StoreSettings
            storeConfig={storeConfig}
            language={language}
            onSave={handleSaveStoreConfig}
            user={user}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW 5: TABLE QR GENERATOR */}
        {activeRole === 'qr' && user && (
          <QRGenerator storeConfig={storeConfig} language={language} />
        )}
      </main>

      {/* Role Switcher Floating Bar (Strictly visible ONLY to authenticated staff or simulator) */}
      {(user || isSimulatorMode) && (
        <RoleSwitcher
          activeRole={activeRole}
          onSelectRole={handleSelectRole}
          language={language}
          pendingOrdersCount={pendingCount}
          isAuthenticated={!!user}
        />
      )}

      {/* Item Customization Modal */}
      <ItemModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onAddToCart={handleAddToCart}
        language={language}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        tableNumber={tableNumber}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleStartCheckout}
      />

      {/* 3-Second Undo / Cancellation Countdown Modal */}
      <OrderCountdownModal
        isOpen={isCountdownOpen}
        onCancel={() => {
          setIsCountdownOpen(false);
          setIsCartOpen(true);
        }}
        onComplete={handleFinalizeOrder}
        language={language}
        tableNumber={tableNumber}
        totalPrice={cartSubtotal}
      />

      {/* Live Order Tracker Modal Dialog */}
      <OrderTracker
        isOpen={isOrderTrackerOpen}
        onClose={handleCloseTracker}
        order={trackedOrder}
        language={language}
      />

      {/* Receipt Printing Modal Slip & Full Legal Tax Invoice with Dynamic PromptPay QR */}
      <ReceiptModal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
        storeConfig={storeConfig}
        language={language}
      />

      {/* Reset System Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title={language === 'th' ? 'รีเซ็ตข้อมูลระบบ' : 'Reset System Data'}
        message={
          language === 'th'
            ? 'ต้องการรีเซ็ตข้อมูลออเดอร์ สต็อก และการตั้งค่าทั้งหมดเพื่อเริ่มการทดสอบใหม่หรือไม่?'
            : 'Are you sure you want to reset all test orders, stock availability, and data?'
        }
        confirmText={language === 'th' ? 'ตกลง (รีเซ็ต)' : 'OK (Reset)'}
        cancelText={language === 'th' ? 'ยกเลิก' : 'Cancel'}
        isDestructive={true}
        icon="warning"
        onConfirm={handleExecuteResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
      {/* Error Toast Notification */}
      {errorToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] max-w-md w-[92vw] bg-red-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-300 font-bold text-xs sm:text-sm">
          <span className="flex-1">{errorToast}</span>
          <button type="button" onClick={() => setErrorToast(null)} className="text-white/80 hover:text-white px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black cursor-pointer transition">✕</button>
        </div>
      )}
    </div>
  );
}