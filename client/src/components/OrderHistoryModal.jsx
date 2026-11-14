import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, ShieldCheck, Snowflake, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function OrderHistoryModal({ isOpen, onClose, currentUser, onSelectOrderToTrack }) {
  if (!isOpen) return null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const identifier = currentUser.email || currentUser.id || '';
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#faf8f5] border border-[#e5decb] rounded-[2.25rem] w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#e5decb] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#241c18] text-amber-400 flex items-center justify-center font-serif font-black text-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#241c18]">My Melvi Order History</h2>
              <p className="text-xs text-[#7d7065]">Orders placed for {currentUser?.name} ({currentUser?.email})</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchHistory}
              className="p-2 rounded-xl bg-[#f4eee4] hover:bg-[#eae1d3] text-[#3d2f26] transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#f4eee4] hover:bg-[#eae1d3] text-[#3d2f26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Orders List Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-20 text-xs text-[#7d7065]">
              Loading your past orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <Package className="w-12 h-12 text-[#a89c8e] mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#241c18]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#7d7065] max-w-sm mx-auto">
                Explore our handcrafted bonbons or customize your bespoke box to place your first luxury order!
              </p>
            </div>
          ) : (
            orders.map(ord => (
              <div
                key={ord.id}
                className="p-5 rounded-3xl bg-white border border-[#e5decb] shadow-2xs space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0ebd9]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-[#8c5d19] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                        {ord.trackingNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900">
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7d7065] mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3 inline" />
                      <span>Placed on {new Date(ord.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>

                  <div className="text-right flex items-center sm:flex-col sm:items-end justify-between">
                    <span className="font-serif font-black text-lg text-[#241c18]">
                      ₹{ord.totalAmount?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {ord.paymentStatus} via {ord.paymentMethod?.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-[#faf7f2] p-2.5 rounded-2xl">
                      <div className="flex items-center space-x-2.5">
                        {item.image && (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-200 shrink-0 border border-zinc-300">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#241c18]">{item.name}</p>
                          <p className="text-[10px] text-[#7d7065]">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-[#8c5d19]">
                        ₹{((item.price) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Customer Custom Note Highlight */}
                {ord.customNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px]">
                    <span className="font-bold text-amber-900 block mb-0.5">Your Custom Requirement Note:</span>
                    <p className="text-[#5c4639] italic">"{ord.customNotes}"</p>
                  </div>
                )}

                {/* Track Package CTA Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1.5 text-[11px] text-cyan-800">
                    <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                    <span>16°C Cold-Chain Express Maintained</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectOrderToTrack(ord.trackingNumber);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#241c18] hover:bg-[#3d2f26] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <span>Track Live Delivery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

