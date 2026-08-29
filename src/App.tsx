import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem, MenuCategory, CartItem, Order, OrderStatus, SelectedOption, Language, StoreConfig } from './types';
import { syncManager } from './utils/storage';
import { soundService } from './utils/sound';
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
import { AuthModal } from './components/auth/AuthModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { supabase, authService } from './utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Search, Sparkles, Coffee, CupSoda, Utensils, Cake, Pizza, Heart, ArrowRight, Hourglass, Flame, CheckCircle2, ShoppingBag } from 'lucide-react';

export function App() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => syncManager.getStoreConfig());
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [activeRole, setActiveRole] = useState<AppRole>('customer');
  
  // 1. Synchronously resolve Table Number from URL query parameter
  const [tableNumber, setTableNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      if (tbl) return tbl;
    }
    return '01';
  });

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Supabase Auth & RBAC State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals & Sheets
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  
  // 2. Tracked order strictly scoped to THIS CUSTOMER'S ACTIVE BROWSER SESSION ONLY!
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(() => {
    if (typeof window !== 'undefined') {
      const sessionOrderId = sessionStorage.getItem('my_active_order_id');
      if (!sessionOrderId) return null;
      const all = syncManager.getOrders();
      const match = all.find((o) => o.id === sessionOrderId);
      return match || null;
    }
    return null;
  });

  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Fetch Latest Orders from Supabase (Full Database Sync)
  const fetchRemoteOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const mapped: Order[] = data.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          tableNumber: row.table_number,
          status: row.status,
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          subtotal: Number(row.total_price),
          totalPrice: Number(row.total_price),
          items: row.items || [],
          customerNote: row.notes,
          createdAt: row.created_at,
        }));

        setOrders(mapped);

        // Sync customer tracked order
        const myOrderId = sessionStorage.getItem('my_active_order_id');
        if (myOrderId) {
          const myOrder = mapped.find((o) => o.id === myOrderId);
          if (myOrder) {
            setTrackedOrder(myOrder);
          }
        }
      }
    } catch (err) {
      console.warn("Supabase fetch orders error:", err);
    }
  }, []);

  // Initialize Auth & Data
  useEffect(() => {
    // Check existing Supabase session
    authService.getSession().then((session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) {
        setTableNumber(tableParam);
      }
      const roleParam = params.get('role');
      if (roleParam === 'kitchen' || roleParam === 'admin' || roleParam === 'settings' || roleParam === 'qr') {
        if (currentUser) {
          setActiveRole(roleParam as AppRole);
        } else {
          setIsAuthModalOpen(true);
        }
      }
    });

    // Listen to Auth State Changes
    const { data: authListener } = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
      if (!newUser) {
        setActiveRole('customer');
      }
    });

    // Initial Local Data
    setStoreConfig(syncManager.getStoreConfig());
    setCategories(syncManager.getCategories());
    setMenuItems(syncManager.getMenuItems());
    setOrders(syncManager.getOrders());

    // Fetch live remote orders from Supabase on mount
    fetchRemoteOrders();

    // Re-fetch on Window Focus / Screen Wakeup on Mobile
    const handleFocus = () => fetchRemoteOrders();
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchRemoteOrders();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat Polling every 4 seconds for reliable real-time mobile sync
    const pollInterval = setInterval(fetchRemoteOrders, 4000);

    // Local Sync Manager Listener
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'ORDER_CREATED') {
        const updated = syncManager.getOrders();
        setOrders(updated);
        soundService.playNewOrderChime();
      } else if (event.type === 'ORDER_STATUS_UPDATED') {
        const updated = syncManager.getOrders();
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
        setStoreConfig(syncManager.getStoreConfig());
        setCategories(syncManager.getCategories());
        setMenuItems(syncManager.getMenuItems());
        setOrders([]);
        setCart([]);
        setTrackedOrder(null);
        sessionStorage.removeItem('my_active_order_id');
        setIsOrderTrackerOpen(false);
      }
    });

    // Supabase Realtime Subscription for Orders
    const orderSubscription = supabase
      .channel('public:orders:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newO: any = payload.new;
          const mappedOrder: Order = {
            id: newO.id,
            orderNumber: newO.order_number,
            tableNumber: newO.table_number,
            status: newO.status,
            paymentMethod: newO.payment_method,
            paymentStatus: newO.payment_status,
            subtotal: Number(newO.total_price),
            totalPrice: Number(newO.total_price),
            items: newO.items || [],
            customerNote: newO.notes,
            createdAt: newO.created_at,
          };
          setOrders((prev) => {
            if (prev.some((o) => o.id === mappedOrder.id)) return prev;
            return [mappedOrder, ...prev];
          });
          soundService.playNewOrderChime();
        } else if (payload.eventType === 'UPDATE') {
          const updatedO: any = payload.new;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === updatedO.id
                ? {
                    ...o,
                    status: updatedO.status,
                    paymentStatus: updatedO.payment_status,
                  }
                : o
            )
          );
          const myOrderId = sessionStorage.getItem('my_active_order_id');
          if (myOrderId && updatedO.id === myOrderId) {
            setTrackedOrder((prev) => 
              prev ? { ...prev, status: updatedO.status, paymentStatus: updatedO.payment_status } : null
            );
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
  }, [fetchRemoteOrders]);

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
      setIsAuthModalOpen(true);
      return;
    }
    setActiveRole(role);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setActiveRole('customer');
    } catch (e) {
      console.error("Logout error:", e);
      setUser(null);
      setActiveRole('customer');
    }
  };

  const handleSaveStoreConfig = (config: StoreConfig) => {
    syncManager.saveStoreConfig(config);
    setStoreConfig(config);
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

  // Step 1: Trigger 3-second countdown modal
  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCountdownOpen(true);
  };

  // Step 2: Finalize Submission after 3 seconds without cancellation
  const handleFinalizeOrder = async () => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
    const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber,
      items: [...cart],
      subtotal,
      totalPrice: subtotal,
      paymentMethod: 'promptpay',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 1. Save locally for instant reactivity
    syncManager.saveOrder(newOrder);
    setCart([]);
    setIsCountdownOpen(false);

    // 2. Track this order strictly in this customer's active session
    sessionStorage.setItem('my_active_order_id', newOrder.id);
    setTrackedOrder(newOrder);
    setIsOrderTrackerOpen(true);

    // 3. Sync to Supabase Database
    try {
      await supabase.from('orders').insert([{
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        table_number: newOrder.tableNumber,
        status: newOrder.status,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        total_price: newOrder.totalPrice,
        items: newOrder.items,
        notes: newOrder.customerNote || '',
      }]);
    } catch (e) {
      console.error("Supabase insert order error:", e);
    }
  };

  // Immediate reactive state update for kitchen status
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: Order['paymentStatus']
  ) => {
    // 1. Update local storage & broadcast
    const updated = syncManager.updateOrderStatus(orderId, status, paymentStatus);
    setOrders(updated);

    const myOrderId = sessionStorage.getItem('my_active_order_id');
    if (myOrderId && orderId === myOrderId) {
      setTrackedOrder((prev) => (prev ? { ...prev, status, ...(paymentStatus ? { paymentStatus } : {}) } : null));
    }

    // 2. Update Supabase
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
    }
  };

  const handleToggleStock = (itemId: string) => {
    syncManager.toggleItemAvailability(itemId);
  };

  const handleSaveMenuItem = (item: MenuItem) => {
    syncManager.saveMenuItem(item);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    syncManager.deleteMenuItem(itemId);
  };

  const handleSaveCategory = (cat: MenuCategory) => {
    syncManager.saveCategory(cat);
  };

  const handleDeleteCategory = (catId: string) => {
    syncManager.deleteCategory(catId);
  };

  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleExecuteResetData = () => {
    syncManager.resetAll();
    sessionStorage.removeItem('my_active_order_id');
    setTrackedOrder(null);
    setIsResetConfirmOpen(false);
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

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'cooking' || o.status === 'ready').length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Header with Dual Language Toggle & Fixed Non-Changeable Table Badge for Customers */}
      <Header
        storeConfig={storeConfig}
        tableNumber={tableNumber}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeRole={activeRole}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* VIEW 1: CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
            {/* Active Tracked Order Banner (Shown if customer has an active order) */}
            {trackedOrder && (
              <div
                onClick={() => setIsOrderTrackerOpen(true)}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-orange-500/25 flex items-center justify-between animate-pulse-subtle cursor-pointer hover:shadow-2xl hover:shadow-orange-500/35 transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 shimmer-gradient pointer-events-none opacity-30" />
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                    {trackedOrder.status === 'pending' && <Hourglass className="w-6 h-6 animate-spin" />}
                    {trackedOrder.status === 'cooking' && <Flame className="w-6 h-6 animate-bounce" />}
                    {trackedOrder.status === 'ready' && <Sparkles className="w-6 h-6 animate-pulse" />}
                    {trackedOrder.status === 'completed' && <CheckCircle2 className="w-6 h-6" />}
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
            language={language}
            onUpdateStatus={handleUpdateOrderStatus}
            onToggleStock={handleToggleStock}
            onResetData={handleResetData}
            onPrintReceipt={(order) => setReceiptOrder(order)}
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

      {/* Role Switcher Floating Bar (Strictly visible ONLY to authenticated staff - without logout button) */}
      <RoleSwitcher
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
        language={language}
        pendingOrdersCount={pendingCount}
        isAuthenticated={!!user}
      />

      {/* Auth Modal for Store Staff & Google Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

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

      {/* Receipt Printing Modal Slip with Dynamic PromptPay QR */}
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
    </div>
  );
}
