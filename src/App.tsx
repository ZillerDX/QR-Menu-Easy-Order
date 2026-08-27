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
import { Search, Sparkles, Coffee, CupSoda, Utensils, Cake, Pizza, Heart, ArrowRight } from 'lucide-react';

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
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

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

    setStoreConfig(syncManager.getStoreConfig());
    setCategories(syncManager.getCategories());
    setMenuItems(syncManager.getMenuItems());
    setOrders(syncManager.getOrders());

    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'ORDER_CREATED') {
        setOrders(syncManager.getOrders());
        soundService.playNewOrderChime();
      } else if (event.type === 'ORDER_STATUS_UPDATED') {
        setOrders(syncManager.getOrders());
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
      }
    });

    return () => unsubscribe();
  }, []);

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
    }
  };

  const handlePromptPayConfirmed = () => {
    if (activePromptPayOrder) {
      syncManager.updateOrderStatus(activePromptPayOrder.id, 'pending', 'paid');
      setTrackedOrder({ ...activePromptPayOrder, paymentStatus: 'paid' });
      setActivePromptPayOrder(null);
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
    if (window.confirm(language === 'th' ? 'ต้องการรีเซ็ตข้อมูลออเดอร์และสต็อกทั้งหมดเพื่อเริ่มทดสอบใหม่หรือไม่?' : 'Reset all orders and stock for testing?')) {
      syncManager.resetAll();
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
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'CupSoda': return <CupSoda className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Cake': return <Cake className="w-4 h-4" />;
      case 'Pizza': return <Pizza className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      default: return <Coffee className="w-4 h-4" />;
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'cooking').length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Header with Brand Logo & Language Toggle */}
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
      <main className="flex-1">
        {/* VIEW 1: CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
            {/* Active Tracked Order Bar */}
            {trackedOrder && (
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl p-4 text-white shadow-lg shadow-orange-500/20 flex items-center justify-between animate-pulse-subtle">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-100">
                    {t('recentOrderStatus', language)} ({trackedOrder.orderNumber})
                  </span>
                  <h3 className="text-base font-black">
                    {trackedOrder.status === 'pending' && `⏳ ${t('trackerStep1', language)}`}
                    {trackedOrder.status === 'cooking' && `🍳 ${t('trackerStep2', language)}`}
                    {trackedOrder.status === 'ready' && `✨ ${t('trackerStep3', language)}`}
                    {trackedOrder.status === 'completed' && `✅ ${t('trackerStep4', language)}`}
                  </h3>
                </div>
                <button
                  onClick={() => setTrackedOrder(trackedOrder)}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-orange-600 font-black text-xs shadow hover:bg-orange-50 transition cursor-pointer"
                >
                  {t('viewStatus', language)}
                </button>
              </div>
            )}

            {/* Banner / Store Intro */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-8 shadow-md border border-stone-800">
              <div className="relative z-10 max-w-xl space-y-2">
                <span className="bg-orange-500/95 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-xs">
                  {t('heroBadge', language)}
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
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-xs font-medium"
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

            {/* Responsive Category Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                    <span>{language === 'en' ? (cat.nameEn || cat.name) : cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid - Fully Responsive */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                  {language === 'en'
                    ? (categories.find((c) => c.id === selectedCategory)?.nameEn || 'Menu Items')
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
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white p-3.5 rounded-2xl shadow-xl shadow-orange-500/40 flex items-center justify-between transition cursor-pointer"
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
    </div>
  );
}
