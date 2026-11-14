import React, { useState, useEffect } from 'react';
import { ShieldCheck, Package, Truck, CheckCircle2, Clock, MapPin, RefreshCw, AlertCircle, Edit3, X } from 'lucide-react';

export default function AdminTrackingManager({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form states for manual package tracking update
  const [status, setStatus] = useState('CUSTOM_PACKAGING');
  const [checkpointLocation, setCheckpointLocation] = useState('Melvi Central Atelier - Bay 3');
  const [customNote, setCustomNote] = useState('Box hand-tied with silk ribbon and sealed with embossed gold wax.');
  const [courierName, setCourierName] = useState('Melvi Cold-Chain Express (Vehicle MH-02-CD-4421)');
  const [estimatedDelivery, setEstimatedDelivery] = useState('Tomorrow, 2:00 PM - 5:00 PM');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.orders?.length > 0 && !selectedOrder) {
        setSelectedOrder(data.orders[0]);
        setStatus(data.orders[0].orderStatus);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setStatus(order.orderStatus);
    setCourierName(order.courierName || 'Melvi Cold-Chain Express');
    setEstimatedDelivery(order.estimatedDelivery || 'Within 24 Hours');
    setUpdateSuccess(false);
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          location: checkpointLocation,
          description: customNote,
          courierName,
          estimatedDelivery,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUpdateSuccess(true);
        setSelectedOrder(data.order);
        // Refresh orders list
        await fetchOrders();
        setTimeout(() => setUpdateSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update tracking:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'ORDER_CONFIRMED', label: '1. Order Confirmed & Paid' },
    { value: 'ARTISAN_CRAFTING', label: '2. Artisan Crafting & Tempering' },
    { value: 'CUSTOM_PACKAGING', label: '3. Bespoke Box Packaging' },
    { value: 'QUALITY_INSPECTION', label: '4. Quality & Temp Inspection Passed' },
    { value: 'DISPATCHED', label: '5. Dispatched to Cold-Chain Express' },
    { value: 'IN_TRANSIT', label: '6. In Transit (16°C Chilled Van)' },
    { value: 'OUT_FOR_DELIVERY', label: '7. Out for Final Delivery' },
    { value: 'DELIVERED', label: '8. Delivered Safely' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-cocoa-950 border border-gold-500/40 rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Top Modal Bar */}
        <div className="p-5 sm:p-6 bg-cocoa-900 border-b border-gold-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/40">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white flex items-center space-x-2">
                <span>Melvi Store Owner Portal</span>
                <span className="text-xs bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/40 font-mono">
                  MANUAL TRACKING MANAGER
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Directly advance package stages, add courier updates, and review customer custom requirements.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              className="p-2 rounded-xl bg-cocoa-950 border border-zinc-700 text-zinc-300 hover:text-gold-300 transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-cocoa-950 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left orders list, Right tracking update form */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          {/* Left Column: Orders List */}
          <div className="lg:col-span-5 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gold-400 font-bold">
                Orders Queue ({orders.length})
              </span>
              <span className="text-[11px] text-zinc-500">Click to manage package</span>
            </div>

            {loading ? (
              <p className="text-xs text-zinc-400 py-6 text-center">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">No placed orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map(ord => {
                  const isSelected = selectedOrder?.id === ord.id;

                  return (
                    <div
                      key={ord.id}
                      onClick={() => handleSelectOrder(ord)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cocoa-900 border-gold-400 ring-1 ring-gold-400/50 shadow-lg'
                          : 'bg-cocoa-900/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-gold-300 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-500/20">
                          {ord.trackingNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {ord.orderStatus}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-white">{ord.customerName}</p>
                      <p className="text-xs text-zinc-400 truncate">{ord.customerEmail}</p>

                      <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-mono">₹{ord.totalAmount?.toLocaleString()}</span>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Customer Note Alert Badge */}
                      {ord.customNotes && (
                        <div className="mt-2 text-[11px] bg-cocoa-950 p-2 rounded-lg text-amber-300 border border-gold-500/20 line-clamp-1 italic">
                          "{ord.customNotes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Tracking Management Action Center */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            {selectedOrder ? (
              <form onSubmit={handleUpdateTracking} className="space-y-6">
                
                {/* Order Details Header */}
                <div className="bg-cocoa-900/60 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400">Currently Editing Package for:</p>
                      <h3 className="font-serif text-lg font-bold text-white">
                        {selectedOrder.customerName} ({selectedOrder.trackingNumber})
                      </h3>
                    </div>
                    <span className="text-sm font-serif font-bold text-gold-300">
                      ₹{selectedOrder.totalAmount?.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    <span className="text-zinc-500">Destination:</span> {selectedOrder.shippingAddress}, {selectedOrder.city} - {selectedOrder.pincode}
                  </p>

                  {/* Customer Custom Requirements Alert */}
                  {selectedOrder.customNotes && (
                    <div className="p-3 rounded-xl bg-velvet-950/80 border border-gold-500/40 text-xs text-gold-100">
                      <span className="font-bold text-gold-300 block mb-0.5">
                        Customer Custom Requirement Note:
                      </span>
                      <p className="italic">"{selectedOrder.customNotes}"</p>
                    </div>
                  )}
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gold-300 uppercase tracking-wider">
                    Package Tracking Stage:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-cocoa-950 border border-gold-500/40 rounded-xl p-3 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-gold-400"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-cocoa-950">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkpoint Location */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gold-300 uppercase tracking-wider">
                    Live Checkpoint Location:
                  </label>
                  <input
                    type="text"
                    value={checkpointLocation}
                    onChange={(e) => setCheckpointLocation(e.target.value)}
                    placeholder="e.g. Mumbai Cold-Chain Sorting Facility Bay 4"
                    className="w-full bg-cocoa-950 border border-gold-500/40 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>

                {/* Tracking Note */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gold-300 uppercase tracking-wider">
                    Milestone Description / Internal Note:
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Prepared eggless per customer note, packed inside insulated dry-ice box."
                    className="w-full bg-cocoa-950 border border-gold-500/40 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>

                {/* Courier & Delivery Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gold-300 uppercase tracking-wider">
                      Carrier Name & Vehicle:
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full bg-cocoa-950 border border-gold-500/40 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gold-300 uppercase tracking-wider">
                      Estimated Delivery Window:
                    </label>
                    <input
                      type="text"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full bg-cocoa-950 border border-gold-500/40 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                </div>

                {/* Submit Update Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center space-x-2 ${
                      updateSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 hover:from-gold-300 hover:to-amber-500 text-cocoa-950'
                    }`}
                  >
                    {isUpdating ? (
                      <span>Updating Tracking Node...</span>
                    ) : updateSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>Tracking Successfully Updated & Broadcast!</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5 text-cocoa-950" />
                        <span>Update Package Tracking Status</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-zinc-500 mt-2">
                    Customers checking tracking code <span className="text-gold-400 font-mono">{selectedOrder.trackingNumber}</span> will immediately see this live checkpoint update.
                  </p>
                </div>

              </form>
            ) : (
              <div className="text-center py-20 text-zinc-500">
                <Package className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
                <p>Select an order from the list to update its package tracking.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
