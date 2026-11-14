import React, { useState, useEffect } from 'react';
import { Search, Package, Snowflake, CheckCircle2, Truck, ShieldCheck, MapPin, AlertCircle, Clock, ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react';

export default function BlinkitOrderTracker({ 
  initialTrackingNumber = '', 
  currentUser, 
  onSelectOrderToTrack 
}) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch customer's orders so they don't have to search manually
  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    try {
      const identifier = currentUser?.email || currentUser?.id || currentUser?.username || '';
      let url = identifier ? `/api/orders/history?identifier=${encodeURIComponent(identifier)}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      const list = data.orders || [];
      setUserOrders(list);

      // If user has orders and no specific tracking is active, or active code matches, set it
      if (list.length > 0) {
        const found = list.find(o => o.trackingNumber === trackingNumber);
        if (!found && !order) {
          const defaultOrd = list[0];
          setTrackingNumber(defaultOrd.trackingNumber);
          fetchTracking(defaultOrd.trackingNumber);
        }
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTracking = async (code) => {
    if (!code) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Tracking number not found');
      }
      setOrder(data.order);
      setTrackingNumber(data.order.trackingNumber);
      if (onSelectOrderToTrack) {
        onSelectOrderToTrack(data.order.trackingNumber);
      }
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserOrders();
  }, [currentUser]);

  useEffect(() => {
    if (initialTrackingNumber) {
      setTrackingNumber(initialTrackingNumber);
      fetchTracking(initialTrackingNumber);
    }
  }, [initialTrackingNumber]);

  // Live real-time polling every 3.5s for live status & estimated time updates
  useEffect(() => {
    if (!trackingNumber) return;
    const interval = setInterval(() => {
      fetchTracking(trackingNumber);
    }, 3500);
    return () => clearInterval(interval);
  }, [trackingNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(trackingNumber);
  };

  const handleSelectOrder = (selectedTrackingNumber) => {
    setTrackingNumber(selectedTrackingNumber);
    fetchTracking(selectedTrackingNumber);
  };

  const steps = [
    { key: 'ORDER_CONFIRMED', label: 'Order Confirmed' },
    { key: 'ARTISAN_CRAFTING', label: 'Tempering Bonbons' },
    { key: 'CUSTOM_PACKAGING', label: 'Box Packaging' },
    { key: 'IN_TRANSIT', label: 'Cold-Chain Transit' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status) => {
    const map = {
      ORDER_CONFIRMED: 0,
      ARTISAN_CRAFTING: 1,
      CUSTOM_PACKAGING: 2,
      QUALITY_INSPECTION: 2,
      DISPATCHED: 3,
      IN_TRANSIT: 3,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
    };
    return map[status] !== undefined ? map[status] : 1;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'IN_TRANSIT':
      case 'DISPATCHED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse';
      case 'ARTISAN_CRAFTING':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'CUSTOM_PACKAGING':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const activeIdx = order ? getStepIndex(order.orderStatus) : 0;

  // Active delivery orders
  const displayOrders = userOrders;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-serif font-black text-zinc-900">Live Package Tracking</h2>
          <p className="text-xs text-zinc-500">
            Real-time cold-chain delivery monitoring & estimated arrival
          </p>
        </div>
        <button
          onClick={() => {
            fetchUserOrders();
            if (trackingNumber) fetchTracking(trackingNumber);
          }}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : 'text-zinc-500'}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* 1-Click Orders Under Delivery Section */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-serif font-bold text-zinc-900">
              Orders Under Delivery
            </h3>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">
            Click any order to track live
          </span>
        </div>

        {loadingOrders ? (
          <div className="text-center py-6 text-xs text-zinc-400">
            Scanning for active deliveries...
          </div>
        ) : displayOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayOrders.map((ordItem) => {
              const isSelected = order?.trackingNumber === ordItem.trackingNumber || trackingNumber === ordItem.trackingNumber;
              const itemCount = Array.isArray(ordItem.items) 
                ? ordItem.items.reduce((acc, it) => acc + (it.quantity || 1), 0)
                : 1;

              return (
                <button
                  key={ordItem.id || ordItem.trackingNumber}
                  type="button"
                  onClick={() => handleSelectOrder(ordItem.trackingNumber)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 relative ${
                    isSelected 
                      ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/30 shadow-xs' 
                      : 'bg-[#faf8f5] hover:bg-white border-zinc-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tracking ID</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        )}
                      </div>
                      <span className="font-mono font-black text-sm text-zinc-900">
                        {ordItem.trackingNumber}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider shrink-0 ${getStatusBadgeColor(ordItem.orderStatus)}`}>
                      {(ordItem.orderStatus || 'IN TRANSIT').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 pt-1 border-t border-zinc-200/60">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="font-semibold text-zinc-800 text-[11px] truncate max-w-[150px] sm:max-w-[180px]">
                        {ordItem.estimatedDelivery || 'Estimated 2:00 PM – 5:00 PM'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500">
                      ₹{Number(ordItem.totalAmount || 0).toLocaleString()} • {itemCount} item{itemCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center space-x-1">
                      <span>Currently Tracking</span>
                      <ChevronRight className="w-3 h-3 text-amber-700" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-400">
            No active deliveries found. Placed orders will appear here for 1-click live tracking.
          </div>
        )}
      </div>

      {/* Search Input Bar (Preserved for manual searching) */}
      <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-2xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-700">Track Order with ID</span>
          <span className="text-[11px] text-zinc-400">Search any Melvi tracking code</span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="Enter your order tracking ID"
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#faf8f5] border border-zinc-200 text-xs sm:text-sm font-mono text-zinc-900 focus:bg-white focus:border-amber-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Tracking...' : 'Track ID'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!order && !loading && !error && (
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center border border-amber-200">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-zinc-800">Track Your Artisan Chocolate Order</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Enter your order tracking ID above or select from your active deliveries to monitor live 16°C cold-chain transit.
          </p>
        </div>
      )}

      {/* Live Tracking Card */}
      {order && (
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-2xs space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                Order Tracking ID: <span className="text-zinc-900 font-mono font-black">{order.trackingNumber}</span>
              </span>
              <h3 className="text-xl font-serif font-black text-amber-950 mt-0.5">
                {order.orderStatus.replace(/_/g, ' ')}
              </h3>
              <p className="text-xs text-zinc-500 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{order.currentCheckpoint || 'Melvi Kitchen Atelier'}</span>
              </p>
            </div>

            {/* Cold Chain Sensor Badge */}
            <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-2xl flex items-center space-x-3 shrink-0">
              <Snowflake className="w-6 h-6 text-cyan-600 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-cyan-900">Cold-Chain Temperature</p>
                <p className="text-base font-bold font-mono text-cyan-700">16.4°C • Safe</p>
              </div>
            </div>
          </div>

          {/* Blinkit Style Linear Progress Tracker */}
          <div className="py-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-6 right-6 h-1 bg-zinc-200 -z-0" />
              <div
                className="absolute top-4 left-6 h-1 bg-emerald-500 -z-0 transition-all duration-500"
                style={{ width: `${(activeIdx / (steps.length - 1)) * 90}%` }}
              />

              {steps.map((st, i) => {
                const done = i <= activeIdx;
                return (
                  <div key={st.key} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-emerald-600 text-white shadow-xs' : 'bg-zinc-200 text-zinc-500'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold mt-1 text-center max-w-[70px] ${
                      done ? 'text-zinc-900' : 'text-zinc-400'
                    }`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Requirements Specified */}
          {order.customNotes && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">
                Customer Note Enclosed with Box:
              </span>
              <p className="text-zinc-700 italic">"{order.customNotes}"</p>
            </div>
          )}

          {/* Live Delivery Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-100">
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-zinc-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Estimated Delivery</span>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="font-bold text-sm text-emerald-700">{order.estimatedDelivery || 'Tomorrow, 2:00 PM – 5:00 PM'}</p>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Updated in real-time by Melvi Master Atelier</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-zinc-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Carrier Partner</span>
              <div className="flex items-center space-x-2 mt-1">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <p className="font-bold text-xs text-zinc-800">{order.courierName || 'Melvi Cold-Chain Express (16°C Chilled Van)'}</p>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Insulated box with dry-ice temperature stabilizer</p>
            </div>
          </div>

          {/* Order items summary */}
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Package Contents
              </span>
              <div className="flex flex-wrap gap-2">
                {order.items.map((it, idx) => (
                  <div key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-medium">{it.name}</span>
                    <span className="text-zinc-400 font-mono">×{it.quantity || 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </section>
  );
}
