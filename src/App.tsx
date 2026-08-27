import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, CartItem, Order, OrderStatus, PaymentMethod, SelectedOption, Language, StoreConfig } from './types';
import { syncManager } from './utils/storage';
import { soundService } from './utils/sound';
import { t, getInitialLanguage, saveLanguagePreference } from './utils/i18n';
import { Header } from './components/common/Header';
import { RoleSwitcher, AppRole } from './components/common/RoleSwitcher';
import { MenuCard } from './components/customer/MenuCard';
import { ItemModal } from './components/customer/ItemModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { PromptPayModal } from './components/customer/PromptPayModal';
import { OrderTracker } from './components/customer/OrderTracker';
import { KitchenDashboard } from './components/kitchen/KitchenDashboard';
import { MenuAdmin } from './components/admin/MenuAdmin';
import { StoreSettings } from './components/admin/StoreSettings';
import { QRGenerator } from './components/table-qr/QRGenerator';
import { ConfirmModal } from './components/common/ConfirmModal';
import { Search, Sparkles, Coffee, CupSoda, Utensils, Cake, Pizza, Heart, ArrowRight, Hourglass, Flame, CheckCircle2 } from 'lucide-react';

export function App() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => syncManager.getStoreConfig());
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [activeRole, setActiveRole] = useState<AppRole>('customer');
  const [tableNumber, setTableNumber] = useState('01');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Sheets
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [activePromptPayOrder, setActivePromptPayOrder] = useState<Order | null>(null);
  
  // Tracked order initialization (from latest active order)
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(() => {
    const all = syncManager.getOrders();
    return all.find((o) => o.status !== 'completed' && o.status !== 'cancelled') || all[0] || null;
  });
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Initialize and check URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
    }
    const roleParam = params.get('role');
    if (roleParam === 'kitchen' || roleParam === 'admin' || roleParam === 'settings' || roleParam === 'qr') {
      setActiveRole(roleParam as AppRole);
    }

    const currentOrders = syncManager.getOrders();
    setStoreConfig(syncManager.getStoreConfig());
    setCategories(syncManager.getCategories());
    setMenuItems(syncManager.getMenuItems());
    setOrders(currentOrders);

    if (!trackedOrder && currentOrders.length > 0) {
      setTrackedOrder(currentOrders[0]);
    }

    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'ORDER_CREATED') {
        const updated = syncManager.getOrders();
        setOrders(updated);
        setTrackedOrder(event.payload);
        soundService.playNewOrderChime();
      } else if (event.type === 'ORDER_STATUS_UPDATED') {
        const updated = syncManager.getOrders();
        setOrders(updated);
        setTrackedOrder((prev) => (prev?.id === event.payload.id ? event.payload : prev));
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
        setIsOrderTrackerOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update tracked order when tableNumber changes
  useEffect(() => {
    const all = syncManager.getOrders();
    const match = all.find((o) => o.tableNumber === tableNumber && o.status !== 'cancelled');
    if (match) {
      setTrackedOrder(match);
    }
  }, [tableNumber]);

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'th' : 'en';
    setLanguage(nextLang);
    saveLanguagePreference(nextLang);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLang);
    window.history.replaceState({}, '', url.toString());
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

  const handleCheckout = (chosenPayment: PaymentMethod) => {
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
      paymentMethod: chosenPayment,
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    syncManager.saveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);

    if (chosenPayment === 'promptpay') {
      setActivePromptPayOrder(newOrder);
    } else {
      setTrackedOrder(newOrder);
      setIsOrderTrackerOpen(true);
    }
  };

  const handlePromptPayConfirmed = () => {
    if (activePromptPayOrder) {
      syncManager.updateOrderStatus(activePromptPayOrder.id, 'pending', 'paid');
      const updated = { ...activePromptPayOrder, paymentStatus: 'paid' as const };
      setTrackedOrder(updated);
      setActivePromptPayOrder(null);
      setIsOrderTrackerOpen(true);
    }
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: Order['paymentStatus']
  ) => {
    syncManager.updateOrderStatus(orderId, status, paymentStatus);
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
    setIsResetConfirmOpen(false);
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

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Header with Dual Language Toggle & Custom Table Popover */}
      <Header
        storeConfig={storeConfig}
        tableNumber={tableNumber}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeRole={activeRole}
        onTableChange={setTableNumber}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* VIEW 1: CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
            {/* Active Tracked Order Banner (Click anywhere to open OrderTracker) */}
            {trackedOrder && (
              <div
                onClick={() => setIsOrderTrackerOpen(true)}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-orange-500/25 flex items-center justify-between animate-pulse-subtle cursor-pointer hover:shadow-2xl hover:shadow-orange-500/35 transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 shimmer-gradient pointer-events-none opacity-30" />
                <div className="relative z-10 space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-100/90 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    {t('recentOrderStatus', language)} ({trackedOrder.orderNumber})
                  </span>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                    {trackedOrder.status === 'pending' && (
                      <>
                        <Hourglass className="w-4 h-4 animate-spin text-orange-100" />
                        <span>{t('trackerStep1', language)}</span>
                      </>
                    )}
                    {trackedOrder.status === 'cooking' && (
                      <>
                        <Flame className="w-4 h-4 animate-pulse text-amber-200" />
                        <span>{t('trackerStep2', language)}</span>
                      </>
                    )}
                    {trackedOrder.status === 'ready' && (
                      <>
                        <Sparkles className="w-4 h-4 animate-bounce text-yellow-200" />
                        <span>{t('trackerStep3', language)}</span>
                      </>
                    )}
                    {trackedOrder.status === 'completed' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>{t('trackerStep4', language)}</span>
                      </>
                    )}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOrderTrackerOpen(true);
                  }}
                  className="relative z-10 px-4 py-2 rounded-2xl bg-white text-orange-600 font-black text-xs sm:text-sm shadow-md hover:bg-orange-50 active:scale-95 transition-all cursor-pointer flex-shrink-0 group-hover:scale-105 group-hover:shadow-lg"
                >
                  {t('viewStatus', language)}
                </button>
              </div>
            )}

            {/* Banner / Store Intro with Standardized p-5 sm:p-6 Padding */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white p-5 sm:p-6 shadow-lg border border-stone-800">
              <div className="relative z-10 max-w-xl space-y-2">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('heroBadge', language)}</span>
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {language === 'en' ? storeConfig.nameEn || storeConfig.name : storeConfig.name}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                  {language === 'en' ? storeConfig.taglineEn || storeConfig.tagline : storeConfig.tagline}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder', language)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-xs font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 font-bold cursor-pointer"
                >
                  {t('clear', language)}
                </button>
              )}
            </div>

            {/* Responsive Category Pills Bar with Padding & No Clipping */}
            <div className="flex items-center gap-2 overflow-x-auto p-1 -m-1 no-scrollbar touch-pan-x">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex-shrink-0 cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-500/20'
                        : 'bg-white hover:bg-orange-50/60 text-stone-600 hover:text-orange-950 border border-stone-200 shadow-2xs hover:border-orange-200'
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                    <span className="whitespace-nowrap">{language === 'en' ? (cat.nameEn || cat.name) : cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid - Fully Responsive */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                  {language === 'en'
                    ? (categories.find((c) => c.id === selectedCategory)?.nameEn || "Chef's Specials")
                    : (categories.find((c) => c.id === selectedCategory)?.name || 'รายการเมนู')}
                </h3>
                <span className="text-xs text-stone-400 font-bold">
                  {filteredMenuItems.length} {t('items', language)}
                </span>
              </div>

              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs text-stone-400">
                  <Coffee className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p className="font-bold text-stone-600 text-sm">
                    {t('noMenuItems', language)}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {t('noMenuItemsDesc', language)}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredMenuItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onSelect={(selected) => setActiveModalItem(selected)}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Floating Quick Cart Bar (Mobile) */}
            {cart.length > 0 && (
              <div className="fixed bottom-16 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom-5">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white p-3.5 rounded-2xl shadow-xl shadow-orange-500/40 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                      {totalCartCount}
                    </div>
                    <span className="font-extrabold text-sm">
                      {t('viewCart', language)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-sm">
                    <span>฿{cartSubtotal.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: KITCHEN VIEW */}
        {activeRole === 'kitchen' && (
          <KitchenDashboard
            orders={orders}
            menuItems={menuItems}
            language={language}
            onUpdateStatus={handleUpdateOrderStatus}
            onToggleStock={handleToggleStock}
            onResetData={handleResetData}
          />
        )}

        {/* VIEW 3: MENU & STORE ADMIN */}
        {activeRole === 'admin' && (
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
        {activeRole === 'settings' && (
          <StoreSettings
            storeConfig={storeConfig}
            language={language}
            onSave={handleSaveStoreConfig}
          />
        )}

        {/* VIEW 5: TABLE QR GENERATOR */}
        {activeRole === 'qr' && (
          <QRGenerator storeConfig={storeConfig} language={language} />
        )}
      </main>

      {/* Role Switcher Floating Bar */}
      <RoleSwitcher
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        language={language}
        pendingOrdersCount={pendingCount}
      />

      {/* Modals */}
      <ItemModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onAddToCart={handleAddToCart}
        language={language}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        tableNumber={tableNumber}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <PromptPayModal
        isOpen={!!activePromptPayOrder}
        onClose={() => {
          if (activePromptPayOrder) {
            setTrackedOrder(activePromptPayOrder);
            setIsOrderTrackerOpen(true);
          }
          setActivePromptPayOrder(null);
        }}
        amount={activePromptPayOrder?.totalPrice || 0}
        promptpayNumber={storeConfig.promptpayNumber}
        promptpayName={storeConfig.promptpayName}
        orderNumber={activePromptPayOrder?.orderNumber || ''}
        language={language}
        onPaymentConfirmed={handlePromptPayConfirmed}
      />

      {/* Live Order Tracker Modal Dialog */}
      <OrderTracker
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        order={trackedOrder}
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
