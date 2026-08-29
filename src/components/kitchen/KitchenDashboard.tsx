import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Volume2, 
  PackageOpen, 
  RotateCcw, 
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
  AlertCircle
} from 'lucide-react';
import { Order, MenuItem, MenuCategory, Language, OrderStatus } from '../../types';
import { t } from '../../utils/i18n';
import { OrderCard } from './OrderCard';
import { StockManager } from './StockManager';
import { SalesDashboardModal } from './SalesDashboardModal';
import { CancelOrderModal } from './CancelOrderModal';
import { soundService } from '../../utils/sound';

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
}) => {
  const [filter, setFilter] = useState<'active' | 'ready' | 'completed' | 'all'>('active');
  const [showStock, setShowStock] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [rejectTargetOrder, setRejectTargetOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; targetTab?: 'active' | 'ready' | 'completed' } | null>(null);

  const triggerToast = (message: string, targetTab?: 'active' | 'ready' | 'completed') => {
    setToast({ message, targetTab });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. In-Kitchen (Pending + Cooking ONLY)
  const inKitchenOrders = orders.filter((o) => o.status === 'pending' || o.status === 'cooking');
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  // 2. Ready to Serve (Ready ONLY)
  const readyOrders = orders.filter((o) => o.status === 'ready');
  // 3. Completed (Completed + Cancelled)
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  // Strict Filter Mapping
  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status === 'pending' || o.status === 'cooking';
    if (filter === 'ready') return o.status === 'ready';
    if (filter === 'completed') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const handleTestSound = () => {
    soundService.playNewOrderChime();
    triggerToast(language === 'th' ? '🔔 ทดสอบเสียงแจ้งเตือนออเดอร์ใหม่' : 'Tested notification sound');
  };

  const handleUpdateStatusWrapped = async (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => {
    await onUpdateStatus(orderId, status, paymentStatus);
    const target = orders.find((o) => o.id === orderId);
    const tableLabel = target ? (target.tableNumber === 'TAKEAWAY' ? 'กลับบ้าน' : `โต๊ะ ${target.tableNumber}`) : '';
    
    if (status === 'cooking') {
      triggerToast(language === 'th' ? `🍳 เริ่มปรุงอาหาร ${tableLabel}` : `Started cooking for ${tableLabel}`);
    } else if (status === 'ready') {
      triggerToast(
        language === 'th'
          ? `✨ ออเดอร์ ${tableLabel} ปรุงเสร็จแล้ว! ย้ายไปที่แท็บ "พร้อมเสิร์ฟ"`
          : `Order for ${tableLabel} is ready! Moved to "Ready to Serve" tab`,
        'ready'
      );
    } else if (status === 'completed') {
      triggerToast(language === 'th' ? `✓ ปิดบิล ${tableLabel} เรียบร้อยแล้ว` : `Bill closed for ${tableLabel}`, 'completed');
    } else if (status === 'pending') {
      triggerToast(language === 'th' ? `↩️ ย้อนสถานะ ${tableLabel} กลับไปรอทำ` : `Reverted ${tableLabel} to pending`, 'active');
    }
  };

  const handleCancelOrderWrapped = async (orderId: string, reason: string) => {
    await onCancelOrder?.(orderId, reason);
    triggerToast(language === 'th' ? `🚫 ปฏิเสธออเดอร์เรียบร้อยแล้ว (${reason})` : `Order rejected (${reason})`, 'completed');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-28 relative">
      
      {/* Action Toast Feedback Popup with Instant Tab Navigation */}
      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-black animate-in slide-in-from-top-4 duration-200 border border-stone-700/80">
          <Bell className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span>{toast.message}</span>
          {toast.targetTab && filter !== toast.targetTab && (
            <button
              type="button"
              onClick={() => {
                if (toast.targetTab) setFilter(toast.targetTab);
                setToast(null);
              }}
              className="ml-1 bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95 flex-shrink-0 shadow-xs"
            >
              <span>{language === 'th' ? 'ดูแท็บนี้' : 'View'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
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

          {/* Quick Action Tools (No Reset Button) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSalesModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-sm shadow-emerald-600/20"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{language === 'th' ? 'สรุปยอดขาย' : 'Analytics'}</span>
            </button>

            <button
              onClick={handleTestSound}
              title="Test sound notification"
              className="px-3.5 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/90 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">{t('kdsTestSound', language)}</span>
            </button>

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
                (รอ {pendingCount} • ทำ {cookingCount})
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

          {/* Card 3: Today's Revenue */}
          <button
            type="button"
            onClick={() => setIsSalesModalOpen(true)}
            className="bg-teal-50/60 border border-teal-200/70 hover:border-teal-400/80 rounded-2xl p-3.5 flex flex-col justify-between text-left transition cursor-pointer group active:scale-[0.98] hover:bg-teal-50"
            title="Open Sales Dashboard"
          >
            <div className="flex items-center justify-between text-teal-900">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {t('kdsTodaySales', language)}
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
                (ยกเลิก {cancelledOrders.length})
              </span>
            </div>
          </div>
        </div>
      </div>

      {showStock && (
        <StockManager
          menuItems={menuItems}
          categories={categories}
          language={language}
          onToggleStock={onToggleStock}
          onRestockAll={onRestockAll}
          onRestockCategory={onRestockCategory}
        />
      )}

      {/* 2. Restaurant Order Lane Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Lane 1: Pending & Cooking */}
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            filter === 'active'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/40'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/90 shadow-2xs'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>{t('kdsFilterActive', language)}</span>
          <span className={`ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-black ${
            filter === 'active' ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-700'
          }`}>
            {inKitchenOrders.length}
          </span>
        </button>

        {/* Lane 2: Ready to Serve */}
        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            filter === 'ready'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/90 shadow-2xs'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('kdsFilterReady', language)}</span>
          <span className={`ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-black ${
            filter === 'ready' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {readyOrders.length}
          </span>
        </button>

        {/* Lane 3: Completed & Closed Bills */}
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            filter === 'completed'
              ? 'bg-stone-900 text-white shadow-lg ring-2 ring-stone-700'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/90 shadow-2xs'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('kdsFilterCompleted', language)}</span>
          <span className={`ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-black ${
            filter === 'completed' ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-700'
          }`}>
            {completedOrders.length + cancelledOrders.length}
          </span>
        </button>

        {/* Lane 4: All Orders */}
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-700 text-white shadow-lg ring-2 ring-stone-500'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/90 shadow-2xs'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('kdsFilterAll', language)}</span>
          <span className={`ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-black ${
            filter === 'all' ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-700'
          }`}>
            {orders.length}
          </span>
        </button>
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
    </div>
  );
};
