import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, ShieldCheck, Snowflake, ArrowRight, ArrowLeft, RefreshCw, ShoppingBag, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

export default function OrderHistoryPage({
  currentUser,
  onSelectOrderToTrack,
  onBackToStore,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELIVERED'

  const fetchHistory = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const identifier = currentUser.email || currentUser.id || currentUser.username || '';
      const res = await fetch(`/api/orders/history?identifier=${encodeURIComponent(identifier)}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load order history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const activeStatuses = ['ORDER_CONFIRMED', 'ARTISAN_CRAFTING', 'CUSTOM_PACKAGING', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'];

  const filteredOrders = orders.filter(ord => {
    if (filter === 'ACTIVE') {
      return activeStatuses.includes(ord.orderStatus);
    }
    if (filter === 'DELIVERED') {
      return ord.orderStatus === 'DELIVERED';
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'IN_TRANSIT':
      case 'DISPATCHED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CUSTOM_PACKAGING':
        return 'bg-cyan-100 text-cyan-900 border-cyan-200';
      case 'ARTISAN_CRAFTING':
        return 'bg-orange-100 text-orange-900 border-orange-200';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <button
            onClick={onBackToStore}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-3 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Confectionery Store</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#241c18] text-amber-400 flex items-center justify-center font-serif font-black shadow-xs shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#241c18]">
                My Melvi Order History
              </h1>
              <p className="text-xs text-[#7d7065] mt-0.5">
                Orders placed for <span className="font-semibold text-zinc-900">{currentUser?.name || 'Valued Connoisseur'}</span> ({currentUser?.email || 'Guest'})
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : 'text-zinc-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-[#241c18] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ACTIVE'
              ? 'bg-[#241c18] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Under Delivery ({orders.filter(o => activeStatuses.includes(o.orderStatus)).length})
        </button>

        <button
          onClick={() => setFilter('DELIVERED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'DELIVERED'
              ? 'bg-[#241c18] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Delivered ({orders.filter(o => o.orderStatus === 'DELIVERED').length})
        </button>
      </div>

      {/* Orders List Content */}
      <div className="space-y-5">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-zinc-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-700">Retrieving your luxury chocolate orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-zinc-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif font-black text-xl text-[#241c18]">No Orders Found</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                {filter === 'ALL'
                  ? "You haven't placed any handcrafted chocolate orders yet. Explore our artisanal collection and taste true luxury."
                  : `No orders matching "${filter.toLowerCase()}" status.`}
              </p>
            </div>
            <button
              onClick={onBackToStore}
              className="px-6 py-2.5 rounded-2xl bg-[#241c18] hover:bg-[#3d2f26] text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
            >
              Explore Confectionery
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl p-6 border border-[#e5decb] shadow-2xs space-y-5 transition-all hover:shadow-xs"
            >
              {/* Order Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebd9]">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-black text-[#8c5d19] bg-amber-50/80 border border-amber-300 px-3 py-1 rounded-xl">
                      {ord.trackingNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(ord.orderStatus)}`}>
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#7d7065] mt-1.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 inline text-zinc-400" />
                    <span>
                      Placed on {new Date(ord.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>

                <div className="text-right flex items-center sm:flex-col sm:items-end justify-between">
                  <span className="font-serif font-black text-2xl text-[#241c18]">
                    ₹{Number(ord.totalAmount || 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                    {ord.paymentStatus || 'PAID'} via {ord.paymentMethod?.split(' ')[0] || 'UPI'}
                  </span>
                </div>
              </div>

              {/* Items in this Order */}
              <div className="space-y-2.5">
                {Array.isArray(ord.items) && ord.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#faf7f2] border border-zinc-100"
                  >
                    <div className="flex items-center space-x-3">
                      {item.image ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 shrink-0 border border-zinc-200">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 text-amber-800">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-[#241c18]">{item.name}</p>
                        <p className="text-xs text-[#7d7065]">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-[#8c5d19]">
                      ₹{((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Custom Requirement Note (if specified) */}
              {ord.customNotes && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs">
                  <span className="font-bold text-amber-900 block mb-1">
                    Your Custom Requirement Note:
                  </span>
                  <p className="text-[#5c4639] italic">"{ord.customNotes}"</p>
                </div>
              )}

              {/* Order Footer & Live Tracking Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                  <div className="flex items-center space-x-1.5 text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-200">
                    <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="font-semibold text-[11px]">16°C Cold-Chain Express Maintained</span>
                  </div>
                  {ord.estimatedDelivery && (
                    <div className="flex items-center space-x-1 text-emerald-800 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Est: {ord.estimatedDelivery}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectOrderToTrack(ord.trackingNumber)}
                  className="px-5 py-2.5 rounded-2xl bg-[#241c18] hover:bg-[#3d2f26] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <span>Track Live Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

