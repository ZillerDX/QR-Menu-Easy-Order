import React, { useState, useEffect } from 'react';
import { initialCategories, initialStoreConfig } from './data/initialMenu';
import { MenuItem, CartItem, Order, OrderStatus, PaymentMethod, SelectedOption } from './types';
import { syncManager } from './utils/storage';
import { soundService } from './utils/sound';
import { Header } from './components/common/Header';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { MenuCard } from './components/customer/MenuCard';
import { ItemModal } from './components/customer/ItemModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { PromptPayModal } from './components/customer/PromptPayModal';
import { OrderTracker } from './components/customer/OrderTracker';
import { KitchenDashboard } from './components/kitchen/KitchenDashboard';
import { QRGenerator } from './components/table-qr/QRGenerator';
import { Search, Sparkles, Coffee, CupSoda, Utensils, Cake, Pizza, ArrowRight, ShoppingBag } from 'lucide-react';

export function App() {
  const [storeConfig] = useState(initialStoreConfig);
  const [activeRole, setActiveRole] = useState<'customer' | 'kitchen' | 'qr'>('customer');
  const [tableNumber, setTableNumber] = useState('01');
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

  // Initialize and check URL query params (e.g. ?table=05 or ?role=kitchen)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
    }
    const roleParam = params.get('role');
    if (roleParam === 'kitchen' || roleParam === 'qr') {
      setActiveRole(roleParam);
    }

    // Load initial data
    setMenuItems(syncManager.getMenuItems());
    setOrders(syncManager.getOrders());

    // Subscribe to realtime sync
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'ORDER_CREATED') {
        setOrders(syncManager.getOrders());
        soundService.playNewOrderChime();
      } else if (event.type === 'ORDER_STATUS_UPDATED') {
        setOrders(syncManager.getOrders());
        // Update tracked order if it's currently viewed
        setTrackedOrder((prev) => (prev?.id === event.payload.id ? event.payload : prev));
      } else if (event.type === 'MENU_UPDATED') {
        setMenuItems(event.payload);
      } else if (event.type === 'SYSTEM_RESET') {
        setMenuItems(syncManager.getMenuItems());
        setOrders([]);
        setCart([]);
        setTrackedOrder(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cart operations
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

  // Checkout operations
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

    // Save and sync
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

  // Kitchen dashboard operations
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

  const handleResetData = () => {
    if (window.confirm('ต้องการรีเซ็ตข้อมูลออเดอร์และสต็อกทั้งหมดเพื่อเริ่มทดสอบใหม่หรือไม่?')) {
      syncManager.resetAll();
    }
  };

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

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
      default: return <Coffee className="w-4 h-4" />;
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'cooking').length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <Header
        storeConfig={storeConfig}
        tableNumber={tableNumber}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeRole={activeRole}
        onTableChange={setTableNumber}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <div className="max-w-4xl mx-auto px-4 py-5 space-y-6 pb-28">
            {/* If there is an active tracked order, show tracker bar */}
            {trackedOrder && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100">
                    สถานะออเดอร์ล่าสุด ({trackedOrder.orderNumber})
                  </span>
                  <h3 className="text-base font-bold">
                    {trackedOrder.status === 'pending' && '⏳ ร้านค้ารับออเดอร์แล้ว'}
                    {trackedOrder.status === 'cooking' && '🍳 กำลังปรุงอาหาร'}
                    {trackedOrder.status === 'ready' && '✨ อาหารพร้อมเสิร์ฟแล้ว!'}
                    {trackedOrder.status === 'completed' && '✅ เสร็จสิ้น ขอบคุณครับ/ค่ะ'}
                  </h3>
                </div>
                <button
                  onClick={() => setTrackedOrder(trackedOrder)}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-orange-600 font-bold text-xs shadow hover:bg-orange-50 transition"
                >
                  ดูสถานะ
                </button>
              </div>
            )}

            {/* Banner / Store Intro */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 shadow-md">
              <div className="relative z-10 max-w-md space-y-1.5">
                <span className="bg-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1">
                  ORDER DIRECTLY • NO APP REQUIRED
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  สั่งอาหารสดใหม่ ส่งตรงถึงโต๊ะคุณ
                </h2>
                <p className="text-xs text-stone-300">
                  เลือกเมนูที่ชอบ ปรับแต่งความหวานและท็อปปิ้งได้ตามใจ แล้วกดสั่งได้ทันที
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อเมนู, กาแฟ, ชา, พาสต้า..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {initialCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  {initialCategories.find((c) => c.id === selectedCategory)?.name || 'รายการเมนู'}
                </h3>
                <span className="text-xs text-gray-400">
                  {filteredMenuItems.length} รายการ
                </span>
              </div>

              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm text-gray-400">
                  <Coffee className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-gray-600 text-sm">ไม่พบรายการเมนูที่ค้นหา</p>
                  <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {filteredMenuItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onSelect={(selected) => setActiveModalItem(selected)}
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
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white p-3.5 rounded-2xl shadow-xl shadow-orange-500/40 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                      {totalCartCount}
                    </div>
                    <span className="font-bold text-sm">ดูรายการในตะกร้า</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-sm">
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
            onUpdateStatus={handleUpdateOrderStatus}
            onToggleStock={handleToggleStock}
            onResetData={handleResetData}
          />
        )}

        {/* VIEW 3: TABLE QR GENERATOR */}
        {activeRole === 'qr' && (
          <QRGenerator storeConfig={storeConfig} />
        )}
      </main>

      {/* Role Switcher Floating Bar */}
      <RoleSwitcher
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        pendingOrdersCount={pendingCount}
      />

      {/* Modals */}
      <ItemModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        tableNumber={tableNumber}
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
        onPaymentConfirmed={handlePromptPayConfirmed}
      />
    </div>
  );
}
