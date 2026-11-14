import React, { useState, useEffect } from 'react';
import { Search, Package, Snowflake, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, AlertCircle, Sparkles } from 'lucide-react';

export default function OrderTracking({ initialTrackingNumber = 'MLV-8821-E' }) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingNumber) {
      fetchTracking(initialTrackingNumber);
    }
  }, [initialTrackingNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(trackingNumber);
  };

  const stages = [
    { key: 'ORDER_CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'ARTISAN_CRAFTING', label: 'Artisan Crafting', icon: Sparkles },
    { key: 'CUSTOM_PACKAGING', label: 'Bespoke Packaging', icon: Package },
    { key: 'IN_TRANSIT', label: 'Cold-Chain Transit', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: ShieldCheck }
  ];

  const getStageIndex = (status) => {
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

  const currentStageIdx = order ? getStageIndex(order.orderStatus) : 0;

  return (
    <section className="py-20 bg-cocoa-950 min-h-[80vh] relative overflow-hidden">
      {/* Background ambient elements */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-cyan-950/80 border border-cyan-500/40 px-4 py-1.5 rounded-full text-cyan-300 text-xs font-semibold uppercase tracking-widest">
            <Snowflake className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>Temperature-Controlled Package Tracking</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Track Your <span className="gold-foil-text italic">Melvi Confections</span>
          </h2>

          <p className="text-zinc-400 text-sm">
            Enter your tracking ID to observe real-time handcrafting, packaging, and cold-chain vehicle transit.
          </p>
        </div>

        {/* Tracking Input Bar */}
        <div className="bg-cocoa-900/80 p-4 sm:p-6 rounded-3xl border border-gold-500/30 shadow-2xl mb-10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gold-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Enter tracking code (e.g. MLV-8821-E)"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-cocoa-950 border border-gold-500/30 text-white font-mono placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-cocoa-950 font-bold text-sm uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center space-x-2 shrink-0"
            >
              {loading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Locate Box</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill */}
          <div className="mt-3 flex items-center space-x-2 text-xs text-zinc-400">
            <span>Demo active tracking:</span>
            <button
              type="button"
              onClick={() => {
                setTrackingNumber('MLV-8821-E');
                fetchTracking('MLV-8821-E');
              }}
              className="text-gold-300 font-mono underline hover:text-gold-200"
            >
              MLV-8821-E
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex items-center space-x-3 mb-8">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loaded Order Tracking Dashboard */}
        {order && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Status Card with Live Temperature Guarantee */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cocoa-900 via-cocoa-950 to-cocoa-900 border border-gold-400/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                      Tracking Reference
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30">
                      {order.trackingNumber}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                    {order.orderStatus.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-zinc-300 flex items-center space-x-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-400" />
                    <span>{order.currentCheckpoint || 'Artisan Atelier'}</span>
                  </p>
                </div>

                {/* Cold Chain Live Sensor Widget */}
                <div className="p-4 rounded-2xl bg-cocoa-950/90 border border-cyan-500/30 flex items-center space-x-4 shrink-0 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                    <Snowflake className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Cold-Chain Active</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-cyan-300">16.4°C</p>
                    <p className="text-[10px] text-zinc-400">Insulated Melt-Proof Pack</p>
                  </div>
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div className="pt-8 pb-4">
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-gold-400 to-amber-500 -translate-y-1/2 z-0 transition-all duration-700"
                    style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                  />

                  {/* Stage Points */}
                  <div className="relative z-10 flex justify-between">
                    {stages.map((stg, idx) => {
                      const isCompleted = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      const Icon = stg.icon;

                      return (
                        <div key={stg.key} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-gradient-to-br from-gold-400 to-amber-600 text-cocoa-950 shadow-lg shadow-gold-500/25 ring-2 ring-gold-400'
                                : 'bg-cocoa-950 text-zinc-600 border border-zinc-800'
                            } ${isCurrent ? 'scale-110 animate-bounce' : ''}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`text-[11px] sm:text-xs font-bold mt-2 text-center max-w-[80px] ${
                            isCompleted ? 'text-gold-200' : 'text-zinc-500'
                          }`}>
                            {stg.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Courier and Estimated Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-400">Carrier Partner:</span>
                  <p className="font-semibold text-white mt-0.5">{order.courierName}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Estimated Delivery:</span>
                  <p className="font-semibold text-gold-300 mt-0.5">{order.estimatedDelivery}</p>
                </div>
              </div>
            </div>

            {/* Package Contents & Customer Requirements Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Items in Package */}
              <div className="bg-cocoa-900/70 p-6 rounded-3xl border border-gold-500/20 space-y-4">
                <h4 className="font-serif font-bold text-white text-base flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gold-400" />
                  <span>Confections in this Package</span>
                </h4>

                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-cocoa-950/80 border border-zinc-800">
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-zinc-700">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[11px] text-zinc-400">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-xs text-gold-300">
                        ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {order.customBoxSpecs && (
                  <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/25 text-xs space-y-1">
                    <p className="font-bold text-gold-300">Custom Box Configuration:</p>
                    <p className="text-zinc-300">
                      Sleeve: {order.customBoxSpecs.sleeve} • Ribbon: {order.customBoxSpecs.ribbon}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Customer Requirements & Chronological Timeline */}
              <div className="bg-cocoa-900/70 p-6 rounded-3xl border border-gold-500/20 space-y-4">
                <h4 className="font-serif font-bold text-white text-base flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>Customer Requirements & Event Log</span>
                </h4>

                {/* Customer Notes */}
                {order.customNotes && (
                  <div className="p-3.5 rounded-2xl bg-cocoa-950 border border-gold-500/30 text-xs">
                    <span className="font-bold text-gold-400 block mb-1">
                      Customer Special Requirements Specified:
                    </span>
                    <p className="text-zinc-200 italic">"{order.customNotes}"</p>
                  </div>
                )}

                {/* Chronological Event History */}
                <div className="space-y-3 pt-2">
                  {order.trackingEvents?.map((evt, i) => (
                    <div key={i} className="flex items-start space-x-3 text-xs">
                      <span className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white">{evt.title}</p>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-zinc-400 mt-0.5">{evt.description}</p>
                        {evt.location && (
                          <p className="text-[10px] text-gold-400/80 mt-0.5">{evt.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
