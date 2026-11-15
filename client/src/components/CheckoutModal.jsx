import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { 
  X, ShieldCheck, CreditCard, QrCode, Building, Banknote, CheckCircle2, 
  Lock, ArrowRight, Snowflake, Sparkles, MapPin, Home, Briefcase, 
  Tag, Plus, Check, Phone, Mail, User, Edit2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onOrderSuccess,
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Delivery Details, 2: Payment Gateway, 3: Success Confirmation
  
  // Contact details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saveContactToProfile, setSaveContactToProfile] = useState(true);

  // Address Selection State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Active delivery address fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('Home');
  const [orderNote, setOrderNote] = useState('');

  // Inline "Add New Address" in Checkout
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING, COD
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(currentUser?.name?.toUpperCase() || '');
  const [upiId, setUpiId] = useState('');

  const [processing, setProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Fetch saved addresses on mount or user change
  const fetchAddresses = async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingAddresses(true);
      const res = await apiFetch(`/api/auth/addresses?userId=${encodeURIComponent(currentUser.id)}`);
      const data = await res.json();
      const list = data.addresses || [];
      setSavedAddresses(list);

      // Select default or first address
      if (list.length > 0) {
        const defaultAddr = list.find(a => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr.id);
        setAddress(defaultAddr.addressLine);
        setCity(defaultAddr.city);
        setPincode(defaultAddr.pincode);
        setSelectedLabel(defaultAddr.label || 'Home');
        if (defaultAddr.phone && !phone) setPhone(defaultAddr.phone);
        if (defaultAddr.recipientName && !customerName) setCustomerName(defaultAddr.recipientName);
      }
    } catch (err) {
      console.warn('Failed to load addresses in checkout:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCustomerName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
      setPhone(currentUser?.phone || '');
      fetchAddresses();
    }
  }, [isOpen, currentUser]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setAddress(addr.addressLine);
    setCity(addr.city);
    setPincode(addr.pincode);
    setSelectedLabel(addr.label || 'Home');
    if (addr.phone) setPhone(addr.phone);
    if (addr.recipientName) setCustomerName(addr.recipientName);
    setIsAddingNewAddress(false);
  };

  // Add & immediately select a new address inside checkout
  const handleAddNewAddressInline = async (e) => {
    e.preventDefault();
    if (!newLine.trim() || !newPincode.trim()) {
      alert('Please fill in street address and pincode.');
      return;
    }

    setIsSavingAddress(true);
    try {
      if (currentUser?.id && saveNewAddress) {
        const res = await apiFetch('/api/auth/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            label: newLabel,
            recipientName: customerName,
            phone,
            addressLine: newLine.trim(),
            city: newCity.trim(),
            pincode: newPincode.trim(),
            isDefault: false,
          }),
        });
        const data = await res.json();
        if (res.ok && data.address) {
          setSavedAddresses(prev => [data.address, ...prev]);
          handleSelectAddress(data.address);
          setNewLine('');
          setIsAddingNewAddress(false);
          return;
        }
      }

      // Local fallback
      const tempAddr = {
        id: `addr-temp-${Date.now()}`,
        label: newLabel,
        addressLine: newLine.trim(),
        city: newCity.trim(),
        pincode: newPincode.trim(),
        phone,
        recipientName: customerName,
      };
      setSavedAddresses(prev => [tempAddr, ...prev]);
      handleSelectAddress(tempAddr);
      setNewLine('');
      setIsAddingNewAddress(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const coldChainFee = 0; // Free promotion
  const total = subtotal + coldChainFee;

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!customerName || !email || !address) {
      alert('Please fill in required delivery information.');
      return;
    }

    // Optionally update user profile with latest contact details
    if (currentUser?.id && saveContactToProfile) {
      apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: customerName,
          email,
          phone,
        }),
      }).catch(() => null);
    }

    setStep(2);
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);

    try {
      // 1. Create Payment Intent via NestJS API
      const intentRes = await apiFetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });
      const intentData = await intentRes.json();

      // 2. Simulate Payment Verification
      const verifyRes = await apiFetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: intentData.transactionId,
          method: paymentMethod,
          paymentDetails: { cardName, upiId },
        }),
      });
      const verifyData = await verifyRes.json();

      // 3. Place Order in NestJS Orders API
      const orderRes = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          customerName,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: `${address} (${selectedLabel})`,
          city,
          pincode,
          items: cartItems,
          customNotes: orderNote,
          totalAmount: total,
          paymentMethod: `${paymentMethod} (Transaction ${verifyData.transactionId})`,
        }),
      });

      const orderData = await orderRes.json();
      setCreatedOrder(orderData.order);
      setStep(3);

      // Launch Luxury Gold & Crimson Celebration Confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#cb9e28', '#e5b29b', '#6d1830', '#ffffff'],
      });

      onOrderSuccess(orderData.order);
    } catch (err) {
      console.error('Payment checkout error:', err);
      alert('Checkout simulation encountered a hiccup. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-cocoa-950 border border-gold-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative font-sans">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-cocoa-900 border-b border-gold-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/40 shadow-sm">
              <Lock className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                {step === 3 ? 'Order Confirmed!' : 'Melvi Encrypted Checkout'}
              </h2>
              <p className="text-xs text-zinc-400">
                {step === 1 ? 'Step 1 of 2: Select Delivery Address & Contact Info' : step === 2 ? 'Step 2 of 2: Choose Payment Method' : 'Thank you for your patronage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-cocoa-950 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[78vh] overflow-y-auto">
          
          {/* STEP 1: Delivery Details */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* SECTION A: Select Delivery Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Delivery Address</span>
                  </span>

                  {!isAddingNewAddress && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-xs font-bold text-gold-300 hover:text-gold-200 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Inline New Address Form */}
                {isAddingNewAddress && (
                  <div className="p-4 rounded-2xl bg-cocoa-900 border border-gold-500/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="font-bold text-white">Enter New Delivery Address</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="text-zinc-400 hover:text-white font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      {['Home', 'Work', 'Other'].map(lbl => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewLabel(lbl)}
                          className={`px-3 py-1 rounded-xl font-bold transition-all ${
                            newLabel === lbl
                              ? 'bg-gold-500 text-black shadow-xs'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-300 mb-1">Street Address / Flat / Building *</label>
                      <input
                        type="text"
                        value={newLine}
                        onChange={(e) => setNewLine(e.target.value)}
                        placeholder="e.g. Flat 502, Sea Crest Towers, Worli Sea Face"
                        className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1">City</label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none focus:border-gold-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1">Pincode *</label>
                        <input
                          type="text"
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none focus:border-gold-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          className="rounded text-gold-500 focus:ring-gold-400"
                        />
                        <span className="text-[11px] text-zinc-300">Save to my saved addresses</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleAddNewAddressInline}
                        disabled={isSavingAddress}
                        className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs transition-colors cursor-pointer"
                      >
                        {isSavingAddress ? 'Saving...' : 'Use This Address'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Address Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const Icon = addr.label === 'Work' ? Briefcase : addr.label === 'Other' ? Tag : Home;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-cocoa-900/90 border-gold-400 ring-2 ring-gold-400/30 shadow-md'
                            : 'bg-cocoa-900/40 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-gold-300 border border-zinc-700">
                            <Icon className="w-3 h-3 text-gold-400" />
                            <span>{addr.label || 'Home'}</span>
                          </span>

                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'border-gold-400 bg-gold-500 text-black' : 'border-zinc-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-xs text-white font-medium line-clamp-2">
                          {addr.addressLine}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {addr.city} - <span className="font-mono text-zinc-300">{addr.pincode}</span>
                        </p>

                        {addr.recipientName && (
                          <p className="text-[10px] text-zinc-400 mt-1">
                            For: <span className="text-zinc-200">{addr.recipientName}</span> {addr.phone && `(${addr.phone})`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Direct Address Preview / Manual Override */}
                <div className="p-3 bg-cocoa-900/40 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-zinc-300">
                    <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                    <span className="truncate">
                      Delivering to: <strong className="text-white">{address}, {city} - {pincode}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION B: Recipient Contact Details */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contact Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gold-200 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gold-200 mb-1">Email Address (for Receipt &amp; Live Tracking) *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-200 mb-1">Contact Phone (for Courier Dispatch Updates)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={saveContactToProfile}
                    onChange={(e) => setSaveContactToProfile(e.target.checked)}
                    className="rounded text-gold-500 focus:ring-gold-400"
                  />
                  <span>Save updated contact details to my customer account</span>
                </label>
              </div>

              {/* SECTION C: Delivery Notes & Instructions */}
              <div>
                <label className="block text-xs font-semibold text-gold-200 mb-1">
                  Delivery Notes &amp; Cold-Chain Instructions:
                </label>
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="e.g. Please ring chime, leave with concierge, include extra 16°C cold gel packs."
                  className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              {/* Summary Bar */}
              <div className="p-4 rounded-2xl bg-cocoa-900/60 border border-gold-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">Total Payable ({cartItems.length} items):</p>
                  <p className="font-serif text-2xl font-black text-gold-300">₹{total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>Free 16°C Chilled Transit</span>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-serif font-black text-base uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Continue to Secure Payment</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* STEP 2: Payment Gateway Simulation */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gold-200 mb-3">
                  Choose Payment Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'NETBANKING', label: 'Net Banking', icon: Building },
                    { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = paymentMethod === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentMethod(item.id)}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gold-500/20 border-gold-400 text-gold-300 shadow-md ring-2 ring-gold-400/30'
                            : 'bg-cocoa-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI Form */}
              {paymentMethod === 'UPI' && (
                <div className="p-5 rounded-2xl bg-cocoa-900 border border-zinc-700 space-y-3">
                  <div className="flex items-center space-x-2 text-gold-300 text-xs font-bold">
                    <QrCode className="w-4 h-4" />
                    <span>Instant UPI Payment</span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. yourname@okhdfcbank)"
                    className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                  <p className="text-[11px] text-zinc-400">
                    Supports Google Pay, PhonePe, Paytm &amp; all Indian UPI apps.
                  </p>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'CARD' && (
                <div className="p-5 rounded-2xl bg-cocoa-900 border border-zinc-700 space-y-3">
                  <div>
                    <label className="block text-[11px] text-zinc-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-300 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-cocoa-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Netbanking / COD Notes */}
              {(paymentMethod === 'NETBANKING' || paymentMethod === 'COD') && (
                <div className="p-5 rounded-2xl bg-cocoa-900 border border-zinc-700 text-xs text-zinc-300 space-y-1">
                  <p className="font-bold text-gold-300">
                    {paymentMethod === 'NETBANKING' ? 'All Major Indian Banks Supported' : 'Cash on Delivery Available'}
                  </p>
                  <p className="text-zinc-400">
                    {paymentMethod === 'NETBANKING'
                      ? 'HDFC, ICICI, SBI, Axis, Kotak and 50+ other banking portals.'
                      : 'Pay via cash or UPI QR scan when your refrigerated box arrives.'}
                  </p>
                </div>
              )}

              {/* Order Delivery Confirmation Summary */}
              <div className="p-4 rounded-2xl bg-cocoa-900/60 border border-zinc-800 text-xs space-y-1">
                <p className="text-zinc-400">Delivering to:</p>
                <p className="font-semibold text-white">{customerName} • {phone}</p>
                <p className="text-zinc-300">{address}, {city} - {pincode}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-2xl bg-cocoa-900 hover:bg-cocoa-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={processing}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-serif font-black text-base uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-zinc-950" />
                  <span>{processing ? 'Processing Payment...' : `Authorize ₹${total.toLocaleString()}`}</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Order Confirmed Celebration */}
          {step === 3 && createdOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-black text-white">
                  Payment Confirmed &amp; Dispatched to Atelier!
                </h3>
                <p className="text-sm text-gold-300 font-medium">
                  Tracking Code: <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-gold-500/30">{createdOrder.trackingNumber}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cocoa-900 border border-zinc-800 text-xs text-left max-w-md mx-auto space-y-1 text-zinc-300">
                <p className="font-bold text-white">Delivery Address:</p>
                <p>{createdOrder.shippingAddress}</p>
                <p>{createdOrder.city} - {createdOrder.pincode}</p>
                <p className="pt-2 text-zinc-400">Courier Partner: <strong className="text-gold-300">{createdOrder.courierName}</strong></p>
                <p className="text-zinc-400">Estimated Delivery: <strong className="text-emerald-400">{createdOrder.estimatedDelivery || 'Within 24-48 Hours'}</strong></p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Done &amp; Track Live Order
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}