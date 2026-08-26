import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, UtensilsCrossed, Sparkles, Layers, PackageOpen } from 'lucide-react';
import { Order, MenuItem, OrderStatus } from '../../types';
import { OrderCard } from './OrderCard';
import { StockManager } from './StockManager';
import { soundService } from '../../utils/sound';

interface KitchenDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => void;
  onToggleStock: (itemId: string) => void;
  onResetData: () => void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({
  orders,
  menuItems,
  onUpdateStatus,
  onToggleStock,
  onResetData,
}) => {
  const [filter, setFilter] = useState<'active' | 'ready' | 'completed' | 'all'>('active');
  const [showStock, setShowStock] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter orders
  const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'cooking');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status === 'pending' || o.status === 'cooking';
    if (filter === 'ready') return o.status === 'ready';
    if (filter === 'completed') return o.status === 'completed';
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const handleTestSound = () => {
    soundService.playNewOrderChime();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Controls & Metrics Bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">
              Kitchen Display System (KDS)
            </h2>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            หน้าจอรับและจัดการออเดอร์สำหรับฝ่ายบริการและห้องครัว
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 text-center flex-1 md:flex-none">
            <span className="text-[11px] font-bold text-orange-800 uppercase block">
              กำลังทำ
            </span>
            <span className="text-xl font-black text-orange-600">
              {activeOrders.length}
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-center flex-1 md:flex-none">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">
              ยอดขายวันนี้
            </span>
            <span className="text-xl font-black text-emerald-700">
              ฿{totalRevenue.toLocaleString()}
            </span>
          </div>

          {/* Sound & Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleTestSound}
              title="ทดสอบเสียงแจ้งเตือนออเดอร์"
              className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Volume2 className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">ทดสอบเสียง</span>
            </button>

            <button
              onClick={() => setShowStock(!showStock)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showStock
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <PackageOpen className="w-4 h-4" />
              <span className="hidden sm:inline">จัดการสต็อก</span>
            </button>

            <button
              onClick={onResetData}
              title="รีเซ็ตข้อมูลทดสอบ"
              className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Manager (Collapsible) */}
      {showStock && (
        <StockManager
          menuItems={menuItems}
          onToggleStock={onToggleStock}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            filter === 'active'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>รอปรุง / กำลังทำ</span>
          <span className="ml-1 bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">
            {activeOrders.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            filter === 'ready'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>พร้อมเสิร์ฟ</span>
          <span className="ml-1 bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {readyOrders.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            filter === 'completed'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>เสร็จสิ้น / ปิดบิล</span>
          <span className="ml-1 bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {completedOrders.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ทั้งหมด ({orders.length})</span>
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm text-gray-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700 text-base">ไม่มีออเดอร์ในสถานะนี้</h3>
          <p className="text-xs text-gray-400 mt-1">
            เมื่อลูกค้าสั่งอาหารจากโต๊ะ รายการจะปรากฏที่นี่ทันทีแบบ Real-time
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
