import React, { useState } from 'react';
import { UtensilsCrossed, Volume2, PackageOpen, RotateCcw, Sparkles, TrendingUp, BarChart3, Clock, ChefHat, Ban } from 'lucide-react';
import { Order, MenuItem, Language, OrderStatus } from '../../types';
import { t } from '../../utils/i18n';
import { OrderCard } from './OrderCard';
import { StockManager } from './StockManager';
import { SalesDashboardModal } from './SalesDashboardModal';
import { CancelOrderModal } from './CancelOrderModal';
import { soundService } from '../../utils/sound';

interface KitchenDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  language: Language;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => void;
  onToggleStock: (itemId: string) => void;
  onResetData: () => void;
  onPrintReceipt?: (order: Order) => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({
  orders,
  menuItems,
  language,
  onUpdateStatus,
  onToggleStock,
  onResetData,
  onPrintReceipt,
  onCancelOrder,
}) => {
  const [filter, setFilter] = useState<'active' | 'ready' | 'completed' | 'all'>('active');
  const [showStock, setShowStock] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [rejectTargetOrder, setRejectTargetOrder] = useState<Order | null>(null);

  const inProgressOrders = orders.filter((o) => o.status === 'pending' || o.status === 'cooking' || o.status === 'ready');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status === 'pending' || o.status === 'cooking' || o.status === 'ready';
    if (filter === 'ready') return o.status === 'ready';
    if (filter === 'completed') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const handleTestSound = () => {
    soundService.playNewOrderChime();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Top Controls & Metrics Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              {t('kdsTitle', language)}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {t('kdsSubtitle', language)}
          </p>
        </div>

        {/* Quick Metrics & Sales Dashboard Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* In Progress Count Card */}
          <div className="bg-orange-50 border border-orange-200/90 rounded-2xl px-4 py-2 text-center flex-1 md:flex-none">
            <span className="text-[11px] font-black text-orange-950 uppercase block">
              {language === 'th' ? 'ออเดอร์กำลังทำ' : 'In Kitchen'}
            </span>
            <span className="text-xl font-black text-orange-600">
              {inProgressOrders.length}
            </span>
          </div>

          {/* Interactive Sales Metric Card */}
          <button
            type="button"
            onClick={() => setIsSalesModalOpen(true)}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100/80 hover:to-teal-100/80 border border-emerald-200/90 rounded-2xl px-4 py-2 text-center flex-1 md:flex-none cursor-pointer transition shadow-2xs hover:shadow-md hover:scale-105 active:scale-95 group text-left relative overflow-hidden"
            title={language === 'th' ? 'คลิกเพื่อดูแดชบอร์ดสรุปยอดขายแบบละเอียด' : 'Click to view detailed sales dashboard'}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-emerald-950 uppercase block">
                {t('kdsTodaySales', language)}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span className="text-xl font-black text-emerald-700 block">
              ฿{totalRevenue.toLocaleString()}
            </span>
          </button>

          {/* Sound & Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setIsSalesModalOpen(true)}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{language === 'th' ? 'สรุปยอดขาย' : 'Analytics'}</span>
            </button>

            <button
              onClick={handleTestSound}
              title="Test sound notification"
              className="p-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">{t('kdsTestSound', language)}</span>
            </button>

            <button
              onClick={() => setShowStock(!showStock)}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                showStock
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <PackageOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{t('kdsManageStock', language)}</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset test data"
              className="p-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-red-50 hover:text-red-600 text-stone-400 text-xs transition cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showStock && (
        <StockManager
          menuItems={menuItems}
          language={language}
          onToggleStock={onToggleStock}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            filter === 'active'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>{t('kdsFilterActive', language)}</span>
          <span className="ml-1 bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">
            {inProgressOrders.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            filter === 'ready'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('kdsFilterReady', language)}</span>
          <span className="ml-1 bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {readyOrders.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            filter === 'completed'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <span>{t('kdsFilterCompleted', language)}</span>
          <span className="ml-1 bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {completedOrders.length + cancelledOrders.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-700 text-white shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <span>{t('kdsFilterAll', language)}</span>
          <span className="ml-1 bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {orders.length}
          </span>
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-400 space-y-2">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-stone-300 stroke-[1.5]" />
          <p className="text-sm font-bold text-stone-600">
            {language === 'th' ? 'ไม่มีออเดอร์ในหมวดหมู่นี้' : 'No orders in this category'}
          </p>
          <p className="text-xs text-stone-400">
            {language === 'th' ? 'เมื่อมีลูกค้าสั่งอาหาร ออเดอร์จะปรากฏที่นี่แบบเรียลไทม์' : 'New orders will appear here in real-time'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              language={language}
              onUpdateStatus={onUpdateStatus}
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
        onConfirmCancel={(orderId, reason) => {
          onCancelOrder?.(orderId, reason);
        }}
      />
    </div>
  );
};
