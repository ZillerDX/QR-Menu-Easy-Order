import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Volume2, 
  VolumeX,
  PackageOpen, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Layers,
  ChefHat,
  Bell,
  ArrowRight,
  Flame,
  Receipt,
  Activity,
  AlertCircle,
  Settings2,
  X,
  Calendar,
  RotateCw
} from 'lucide-react';
import { Order, MenuItem, MenuCategory, Language, OrderStatus } from '../../types';
import { t } from '../../utils/i18n';
import { OrderCard } from './OrderCard';
import { soundService } from '../../utils/sound';

const StockManager = React.lazy(() => import('./StockManager').then((m) => ({ default: m.StockManager })));
const SalesDashboardModal = React.lazy(() => import('./SalesDashboardModal').then((m) => ({ default: m.SalesDashboardModal })));
const CancelOrderModal = React.lazy(() => import('./CancelOrderModal').then((m) => ({ default: m.CancelOrderModal })));
const NotificationSettingsModal = React.lazy(() => import('./NotificationSettingsModal').then((m) => ({ default: m.NotificationSettingsModal })));

interface KitchenDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  categories?: MenuCategory[];
  language: Language;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => Promise<void> | void;
  onToggleStock: (itemId: string) => void;
  onRestockAll?: () => void;
  onRestockCategory?: (categoryId: string) => void;
  onPrintReceipt?: (order: Order) => void;
  onCancelOrder?: (orderId: string, reason: string) => Promise<void> | void;
  onRefreshOrders?: () => Promise<void> | void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({
  orders,
  menuItems,
  categories = [],
  language,
  onUpdateStatus,
  onToggleStock,
  onRestockAll,
  onRestockCategory,
  onPrintReceipt,
  onCancelOrder,
  onRefreshOrders,
}) => {
  const [filter, setFilter] = useState<'active' | 'ready' | 'completed' | 'all'>('active');
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'yesterday' | 'last7days' | 'custom' | 'all'>('today');
  const [customDate, setCustomDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => 
    new Date().toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [rejectTargetOrder, setRejectTargetOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    message?: string;
    type?: 'sound' | 'order' | 'ready' | 'completed' | 'cooking';
    targetTab?: 'active' | 'ready' | 'completed';
  } | null>(null);

  const triggerToast = (
    title: string,
    message?: string,
    type: 'sound' | 'order' | 'ready' | 'completed' | 'cooking' = 'sound',
    targetTab?: 'active' | 'ready' | 'completed'
  ) => {
    setToast({ id: Date.now(), title, message, type, targetTab });
    setTimeout(() => setToast(null), 4500);
  };

  // Auto-detect new day: refresh data and reset filter to 'today'
  const currentDayRef = React.useRef(new Date().toDateString());
  React.useEffect(() => {
    const checkNewDay = () => {
      const todayStr = new Date().toDateString();
      if (todayStr !== currentDayRef.current) {
        currentDayRef.current = todayStr;
        setDateFilterMode('today');
        setCustomDate(new Date().toISOString().slice(0, 10));
        onRefreshOrders?.();
        setLastRefreshedAt(
          new Date().toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
        triggerToast(
          language === 'th' ? '🌅 เริ่มต้นวันใหม่แล้ว!' : '🌅 New day started!',
          language === 'th' ? 'ระบบรีเฟรชข้อมูลเป็นของวันนี้เรียบร้อยแล้ว' : 'Data refreshed for today.',
          'sound'
        );
      }
    };

    const interval = setInterval(checkNewDay, 15000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkNewDay();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [language, onRefreshOrders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshOrders?.();
      setLastRefreshedAt(
        new Date().toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      triggerToast(
        language === 'th' ? '🔄 รีเฟรชข้อมูลสำเร็จ' : 'Data Refreshed',
        language === 'th' ? 'ข้อมูลออเดอร์เป็นปัจจุบันแล้ว' : 'Order tickets are up to date',
        'sound'
      );
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const prevOrdersCountRef = React.useRef(orders.length);
  React.useEffect(() => {
    if (orders.length > prevOrdersCountRef.current) {
      const latestOrder = orders[0];
      if (latestOrder && latestOrder.status === 'pending') {
        const tableLabel = latestOrder.tableNumber === 'TAKEAWAY' ? 'กลับบ้าน' : `โต๊ะ ${latestOrder.tableNumber}`;
        const itemsCount = latestOrder.items.reduce((sum, item) => sum + item.quantity, 0);
        triggerToast(
          language === 'th' ? `🔔 มีออเดอร์ใหม่เข้า! (${tableLabel})` : `🔔 New Order! (${tableLabel})`,
          language === 'th'
            ? `${itemsCount} รายการ • รวม ฿${latestOrder.totalPrice.toLocaleString()}`
            : `${itemsCount} items • Total ฿${latestOrder.totalPrice.toLocaleString()}`,
          'order',
          'active'
        );
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, language]);

  // Helper to determine if an order matches the selected date filter
  const isOrderInDateRange = (order: Order): boolean => {
    if (!order.createdAt) return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (dateFilterMode === 'today') {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate()
      );
    }

    if (dateFilterMode === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return (
        orderDate.getFullYear() === yesterday.getFullYear() &&
        orderDate.getMonth() === yesterday.getMonth() &&
        orderDate.getDate() === yesterday.getDate()
      );
    }

    if (dateFilterMode === 'last7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return orderDate >= sevenDaysAgo;
    }

    if (dateFilterMode === 'custom') {
      if (!customDate) return true;
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      const day = String(orderDate.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      const isoDateStr = orderDate.toISOString().slice(0, 10);
      return localDateStr === customDate || isoDateStr === customDate;
    }

    return true; // 'all'
  };

  // 1. In-Kitchen (Active unfulfilled queue: Pending + Cooking)
  // If viewing today or all, show all unfulfilled tickets. If reviewing a past date, scope to that date.
  const inKitchenOrders = orders.filter((o) => {
    const isActive = o.status === 'pending' || o.status === 'cooking';
    if (!isActive) return false;
    if (dateFilterMode === 'today' || dateFilterMode === 'all') return true;
    return isOrderInDateRange(o);
  });
  const pendingCount = inKitchenOrders.filter((o) => o.status === 'pending').length;
  const cookingCount = inKitchenOrders.filter((o) => o.status === 'cooking').length;

  // 2. Ready to Serve (Ready)
  const readyOrders = orders.filter((o) => {
    if (o.status !== 'ready') return false;
    if (dateFilterMode === 'today' || dateFilterMode === 'all') return true;
    return isOrderInDateRange(o);
  });

  // 3. Completed (Completed + Cancelled) strictly matching date range
  const completedOrders = orders.filter((o) => o.status === 'completed' && isOrderInDateRange(o));
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled' && isOrderInDateRange(o));

  // 4. All orders matching the selected date range
  const dateScopedOrders = orders.filter((o) => isOrderInDateRange(o));

  // Strict Filter Mapping for main display grid
  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') {
      const isActive = o.status === 'pending' || o.status === 'cooking';
      if (!isActive) return false;
      if (dateFilterMode === 'today' || dateFilterMode === 'all') return true;
      return isOrderInDateRange(o);
    }
    if (filter === 'ready') {
      if (o.status !== 'ready') return false;
      if (dateFilterMode === 'today' || dateFilterMode === 'all') return true;
      return isOrderInDateRange(o);
    }
    if (filter === 'completed') {
      if (o.status !== 'completed' && o.status !== 'cancelled') return false;
      return isOrderInDateRange(o);
    }
    return isOrderInDateRange(o);
  });

  // Dynamic revenue calculation strictly based on the selected date filter
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const handleQuickTestSound = () => {
    soundService.playNewOrderChime();
    triggerToast(
      language === 'th' ? '🔔 ทดสอบเสียงแจ้งเตือน' : 'Notification Sound Test',
      language === 'th' ? 'เล่นเสียงเตือนเรียบร้อย (คลิกปุ่มตั้งค่าเพื่อเปลี่ยนเสียง)' : 'Chime played successfully',
      'sound'
    );
  };

  const handleUpdateStatusWrapped = async (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => {
    await onUpdateStatus(orderId, status, paymentStatus);
    const target = orders.find((o) => o.id === orderId);
    const tableLabel = target ? (target.tableNumber === 'TAKEAWAY' ? 'กลับบ้าน' : `โต๊ะ ${target.tableNumber}`) : '';
    
    if (status === 'cooking') {
      triggerToast(
        language === 'th' ? '🍳 กำลังเริ่มปรุงอาหาร' : 'Cooking in progress',
        tableLabel,
        'cooking'
      );
    } else if (status === 'ready') {
      triggerToast(
        language === 'th' ? '✨ ปรุงเสร็จแล้ว (พร้อมเสิร์ฟ)' : 'Dish is Ready to Serve!',
        language === 'th' ? `ออเดอร์ ${tableLabel} ย้ายไปที่แท็บพร้อมเสิร์ฟ` : `Order for ${tableLabel} moved to Ready tab`,
        'ready',
        'ready'
      );
    } else if (status === 'completed') {
      triggerToast(
        language === 'th' ? '✓ ปิดบิลเรียบร้อยแล้ว' : 'Bill Closed',
        tableLabel,
        'completed',
        'completed'
      );
    } else if (status === 'pending') {
      triggerToast(
        language === 'th' ? '↩️ ย้อนสถานะกลับไปรอทำ' : 'Order reverted to pending',
        tableLabel,
        'cooking',
        'active'
      );
    }
  };

  const handleCancelOrderWrapped = async (orderId: string, reason: string) => {
    await onCancelOrder?.(orderId, reason);
    triggerToast(
      language === 'th' ? '🚫 ปฏิเสธออเดอร์แล้ว' : 'Order Rejected',
      reason,
      'sound',
      'completed'
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-6 pt-3.5 sm:pt-4 pb-28 space-y-4 sm:space-y-5 relative">
      
      {/* Premium Floating Notification Toast with Smooth Animated Glass Styling */}
      {toast && (
        <div 
          key={toast.id}
          className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md w-[92vw] sm:w-auto bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 ring-1 ring-black/5"
        >
          <div className="p-4 flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
              toast.type === 'ready'
                ? 'bg-emerald-100 text-emerald-700'
                : toast.type === 'completed'
                ? 'bg-stone-100 text-stone-700'
                : toast.type === 'cooking'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-orange-100 text-orange-600'
            }`}>
              {toast.type === 'ready' ? (
                <Sparkles className="w-5 h-5 animate-bounce" />
              ) : toast.type === 'completed' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : toast.type === 'cooking' ? (
                <ChefHat className="w-5 h-5 animate-pulse" />
              ) : (
                <Bell className="w-5 h-5 animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-black text-stone-900 leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-stone-500 font-medium mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {toast.targetTab && filter !== toast.targetTab && (
                <button
                  type="button"
                  onClick={() => {
                    if (toast.targetTab) setFilter(toast.targetTab);
                    setToast(null);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <span>{language === 'th' ? 'ดูแท็บนี้' : 'View'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Shrink Bar */}
          <div className="h-1 w-full bg-stone-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 animate-[shrink-progress_4s_linear_forwards]" />
          </div>
        </div>
      )}

      {/* 1. Warm Minimalist Command Header & Realtime KPIs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs relative overflow-hidden space-y-5">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-orange-600 shadow-2xs flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {t('kdsTitle', language)}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {t('kdsSubtitle', language)}
              </p>
            </div>
          </div>

          {/* Quick Action Tools (Analytics, Notification & Sound Settings, Stock) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSalesModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-sm shadow-emerald-600/20"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{language === 'th' ? 'สรุปยอดขาย' : 'Analytics'}</span>
            </button>

            {/* Notification & Sound Setting Button */}
            <div className="flex items-center rounded-2xl border border-stone-200/90 bg-stone-50 shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={handleQuickTestSound}
                title={language === 'th' ? 'ทดสอบเสียงแจ้งเตือน' : 'Test sound alert'}
                className="px-3.5 py-2.5 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline">{language === 'th' ? 'ทดสอบเสียง' : 'Sound Test'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNotificationSettingsOpen(true)}
                title={language === 'th' ? 'ตั้งค่าเสียงและการแจ้งเตือน' : 'Notification Settings'}
                className="p-2.5 hover:bg-stone-200/80 text-stone-500 hover:text-stone-800 border-l border-stone-200 transition cursor-pointer active:scale-95"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowStock(!showStock)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs ${
                showStock
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs shadow-orange-500/10'
                  : 'border-stone-200/90 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <PackageOpen className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{t('kdsManageStock', language)}</span>
            </button>
          </div>
        </div>

        {/* 4 Warm Minimalist KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
          {/* Card 1: In Kitchen */}
          <div className="bg-orange-50/60 border border-orange-200/70 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-orange-50 transition">
            <div className="flex items-center justify-between text-orange-900">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {language === 'th' ? 'กำลังทำ / คิวรอ' : 'In Kitchen'}
              </span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-orange-600">
                {inKitchenOrders.length}
              </span>
              <span className="text-[10px] text-orange-700/80 font-bold">
                {language === 'th' ? `(รอ ${pendingCount} • ทำ ${cookingCount})` : `(wait ${pendingCount} • cook ${cookingCount})`}
              </span>
            </div>
          </div>

          {/* Card 2: Ready to Serve */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-emerald-50 transition">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {language === 'th' ? 'พร้อมเสิร์ฟ' : 'Ready to Serve'}
              </span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {readyOrders.length}
              </span>
              <span className="text-[10px] text-emerald-700/80 font-bold">
                {language === 'th' ? 'จาน' : 'dishes'}
              </span>
            </div>
          </div>

          {/* Card 3: Revenue Scoped by Selected Date Filter */}
          <button
            type="button"
            onClick={() => setIsSalesModalOpen(true)}
            className="bg-teal-50/60 border border-teal-200/70 hover:border-teal-400/80 rounded-2xl p-3.5 flex flex-col justify-between text-left transition cursor-pointer group active:scale-[0.98] hover:bg-teal-50"
            title="Open Sales Dashboard"
          >
            <div className="flex items-center justify-between text-teal-900">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {dateFilterMode === 'today'
                  ? t('kdsTodaySales', language)
                  : dateFilterMode === 'yesterday'
                  ? (language === 'th' ? 'ยอดขายเมื่อวาน' : 'Yesterday Sales')
                  : dateFilterMode === 'last7days'
                  ? (language === 'th' ? 'ยอดขาย 7 วันล่าสุด' : 'Past 7 Days Sales')
                  : dateFilterMode === 'custom'
                  ? (language === 'th' ? `ยอดขาย (${customDate})` : `Sales (${customDate})`)
                  : (language === 'th' ? 'ยอดขายทั้งหมด' : 'All Time Sales')}
              </span>
              <TrendingUp className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-teal-700">
                ฿{totalRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-teal-700 font-black group-hover:underline">
                {language === 'th' ? 'ดูรายงาน →' : 'View →'}
              </span>
            </div>
          </button>

          {/* Card 4: Completed Bills */}
          <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-stone-100/70 transition">
            <div className="flex items-center justify-between text-stone-700">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {language === 'th' ? 'ปิดบิลแล้ว' : 'Completed Bills'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-stone-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-stone-800">
                {completedOrders.length}
              </span>
              <span className="text-[10px] text-stone-500 font-bold">
                {language === 'th' ? `(ยกเลิก ${cancelledOrders.length})` : `(cancelled ${cancelledOrders.length})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showStock && (
        <React.Suspense fallback={null}>
          <StockManager
            menuItems={menuItems}
            categories={categories}
            language={language}
            onToggleStock={onToggleStock}
            onRestockAll={onRestockAll}
            onRestockCategory={onRestockCategory}
          />
        </React.Suspense>
      )}

      {/* 2. Date Filter & Data Sync Toolbar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Date Preset Pills & Custom Date Picker */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-stone-600 mr-1 shrink-0">
            <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
            <span>{t('kdsDateFilterTitle', language)}</span>
          </div>

          {/* Preset: Today (Default) */}
          <button
            type="button"
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              dateFilterMode === 'today'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{t('kdsDateFilterToday', language)}</span>
            {dateFilterMode === 'today' && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />}
          </button>

          {/* Preset: Yesterday */}
          <button
            type="button"
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              dateFilterMode === 'yesterday'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
            }`}
          >
            <span>{t('kdsDateFilterYesterday', language)}</span>
          </button>

          {/* Preset: Last 7 Days */}
          <button
            type="button"
            onClick={() => setDateFilterMode('last7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              dateFilterMode === 'last7days'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
            }`}
          >
            <span>{t('kdsDateFilterLast7Days', language)}</span>
          </button>

          {/* Preset: All Time */}
          <button
            type="button"
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              dateFilterMode === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{t('kdsDateFilterAllTime', language)}</span>
          </button>

          {/* Custom Date Picker */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition ${
            dateFilterMode === 'custom'
              ? 'border-orange-500 bg-orange-50 text-orange-800 ring-1 ring-orange-400/30'
              : 'border-stone-200/80 bg-stone-50 text-stone-600 hover:border-stone-300'
          }`}>
            <span className="text-[11px] font-bold shrink-0">{t('kdsDateFilterCustom', language)}:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilterMode('custom');
              }}
              className="bg-transparent text-xs font-black text-stone-800 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Refresh Button & Sync Indicator */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">
            {lastRefreshedAt && `${t('kdsLastUpdated', language)} ${lastRefreshedAt}`}
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-stone-700 border border-stone-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
            title={t('kdsRefreshData', language)}
          >
            <RotateCw className={`w-3.5 h-3.5 text-orange-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('kdsRefreshData', language)}</span>
          </button>
        </div>
      </div>

      {/* 3. Restaurant Order Lane Tabs - Perfectly Symmetrical Segmented Grid (No Glow, No Overflow) */}
      <div className="bg-white rounded-2xl p-1.5 sm:p-2 border border-stone-200/90 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
          {/* Lane 1: Pending & Cooking */}
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] ${
              filter === 'active'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('kdsFilterActive', language)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
              filter === 'active' ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-700'
            }`}>
              {inKitchenOrders.length}
            </span>
          </button>

          {/* Lane 2: Ready to Serve */}
          <button
            type="button"
            onClick={() => setFilter('ready')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] ${
              filter === 'ready'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('kdsFilterReady', language)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
              filter === 'ready' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {readyOrders.length}
            </span>
          </button>

          {/* Lane 3: Completed & Closed Bills */}
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] ${
              filter === 'completed'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('kdsFilterCompleted', language)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
              filter === 'completed' ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {completedOrders.length + cancelledOrders.length}
            </span>
          </button>

          {/* Lane 4: All Orders */}
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] ${
              filter === 'all'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Layers className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('kdsFilterAll', language)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
              filter === 'all' ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {dateScopedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Orders Grid Presentation */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-400 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <p className="text-base font-black text-stone-700">
            {language === 'th' ? 'ไม่มีออเดอร์ในหมวดหมู่นี้' : 'No orders in this category'}
          </p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {language === 'th' ? 'เมื่อมีลูกค้าสั่งอาหารผ่าน QR Code ออเดอร์จะปรากฏและแจ้งเตือนเสียงที่นี่แบบเรียลไทม์' : 'When customers place an order via QR code, tickets will appear here with live audio chime.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              language={language}
              onUpdateStatus={handleUpdateStatusWrapped}
              onPrintReceipt={onPrintReceipt}
              onRejectOrder={(ord) => setRejectTargetOrder(ord)}
            />
          ))}
        </div>
      )}

      {/* Lazy Loaded Modals with Suspense */}
      <React.Suspense fallback={null}>
        {/* Sales Analytics Popup Dashboard Modal */}
        <SalesDashboardModal
          isOpen={isSalesModalOpen}
          onClose={() => setIsSalesModalOpen(false)}
          orders={orders}
          language={language}
        />

        {/* Cancel / Reject Order Modal */}
        <CancelOrderModal
          isOpen={!!rejectTargetOrder}
          onClose={() => setRejectTargetOrder(null)}
          order={rejectTargetOrder}
          language={language}
          onConfirmCancel={handleCancelOrderWrapped}
        />

        {/* Notification & Sound Settings Modal */}
        <NotificationSettingsModal
          isOpen={isNotificationSettingsOpen}
          onClose={() => setIsNotificationSettingsOpen(false)}
          language={language}
          onTestChime={(preset) => {
            triggerToast(
              language === 'th' ? '🔔 ทดสอบเสียงสำเร็จ' : 'Sound Test Successful',
              language === 'th' ? `เลือกรูปแบบเสียง: ${preset}` : `Preset selected: ${preset}`,
              'sound'
            );
          }}
        />
      </React.Suspense>
    </div>
  );
};
