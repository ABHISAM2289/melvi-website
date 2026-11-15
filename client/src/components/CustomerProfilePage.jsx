import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { 
  User, MapPin, Plus, Check, Trash2, Pencil, ShieldCheck, 
  Home, Briefcase, Tag, Phone, Mail, CheckCircle2, AlertCircle, 
  Sparkles, ArrowLeft, HeartHandshake, PackageCheck, Star
} from 'lucide-react';

export default function CustomerProfilePage({
  currentUser,
  onBackToStore,
  onUserUpdated,
}) {
  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address List & Form State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address Form Fields
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrRecipient, setAddrRecipient] = useState(currentUser?.name || '');
  const [addrPhone, setAddrPhone] = useState(currentUser?.phone || '');
  const [addrLine, setAddrLine] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingAddresses(true);
      const res = await apiFetch(`/api/auth/addresses?userId=${encodeURIComponent(currentUser.id)}`);
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.warn('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      fetchAddresses();
    }
  }, [currentUser]);

  // Handle Save Profile / Contact Details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setErrorMessage('');

    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Your contact & profile details have been successfully saved!');
        if (onUserUpdated) {
          onUserUpdated(data.user);
        }
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Start Edit Address
  const handleStartEdit = (addr) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || 'Home');
    setAddrRecipient(addr.recipientName || '');
    setAddrPhone(addr.phone || '');
    setAddrLine(addr.addressLine || '');
    setAddrCity(addr.city || 'Mumbai');
    setAddrState(addr.state || 'Maharashtra');
    setAddrPincode(addr.pincode || '');
    setAddrIsDefault(Boolean(addr.isDefault));
    setIsAddingAddress(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrRecipient(currentUser?.name || '');
    setAddrPhone(currentUser?.phone || '');
    setAddrLine('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrIsDefault(false);
  };

  // Handle Create or Update Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrLine.trim() || !addrPincode.trim()) {
      setErrorMessage('Please fill in your complete address and pincode');
      return;
    }

    setIsSubmittingAddress(true);
    setErrorMessage('');

    const payload = {
      userId: currentUser.id,
      label: addrLabel,
      recipientName: addrRecipient.trim() || currentUser.name,
      phone: addrPhone.trim() || currentUser.phone || '',
      addressLine: addrLine.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      isDefault: addrIsDefault,
    };

    try {
      const url = editingAddressId
        ? `/api/auth/addresses/${editingAddressId}`
        : '/api/auth/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(editingAddressId ? 'Address updated successfully!' : 'New delivery address added!');
        handleCancelAddressForm();
        fetchAddresses();
      } else {
        throw new Error(data.message || 'Failed to save address');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving address');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Handle Set Default Address
  const handleSetDefault = async (addrId) => {
    try {
      const res = await apiFetch(`/api/auth/addresses/${addrId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          isDefault: true,
        }),
      });

      if (res.ok) {
        showToast('Default delivery address updated!');
        fetchAddresses();
      }
    } catch (err) {
      console.warn('Failed to set default address:', err);
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (addrId) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const res = await apiFetch(`/api/auth/addresses/${addrId}?userId=${encodeURIComponent(currentUser.id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Address deleted');
        fetchAddresses();
      }
    } catch (err) {
      console.warn('Failed to delete address:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-zinc-900 pb-20">
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-[#ebdcca] sticky top-20 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="flex items-center space-x-2 text-xs font-bold text-[#8c5d19] hover:text-[#5a3809] bg-[#fbf8f2] hover:bg-[#f5ecdd] px-4 py-2 rounded-xl border border-[#e5decb] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Melvi Chocolaterie</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-zinc-600">
              Logged in as <strong className="text-zinc-900">{currentUser?.username || currentUser?.name}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Page Hero Header */}
        <div className="bg-gradient-to-r from-[#241c18] via-[#3a281c] to-[#241c18] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 flex items-center justify-center font-serif text-2xl font-black shadow-inner">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'M'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-wide">
                    {currentUser?.name || 'Melvi Connoisseur'}
                  </h1>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Customer Account
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                  Manage your contact details, recipient information, and multiple 16°C cold-pack delivery destinations
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAddingAddress(true);
                setEditingAddressId(null);
                setAddrRecipient(currentUser?.name || '');
                setAddrPhone(currentUser?.phone || '');
                setAddrLine('');
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Delivery Address</span>
            </button>
          </div>
        </div>

        {/* Live Toast Feedback */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center space-x-2 shadow-xs animate-slideDown">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 font-bold text-xs flex items-center space-x-2 shadow-xs animate-slideDown">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Profile & Contact Details Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#e5decb] shadow-2xs space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#f0ebd9]">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-[#241c18]">Contact Details</h3>
                <p className="text-xs text-[#7d7065]">Used for order tracking alerts &amp; cold-pack delivery notifications</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54463d] mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-amber-700" />
                  <span>Full Legal / Delivery Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Raj Kiran"
                  className="w-full p-3 rounded-2xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54463d] mb-1.5 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. raj@melvi.com"
                  className="w-full p-3 rounded-2xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 font-medium"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Invoices and tracking credentials will be sent here</p>
              </div>

              <div>
                <label className="block font-bold text-[#54463d] mb-1.5 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span>Contact Phone / Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-3 rounded-2xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 font-medium font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Delivery partner will call before cold-chain dispatch</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-3.5 rounded-2xl bg-[#8c5d19] hover:bg-[#734a1a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile & Contact Details'}</span>
                </button>
              </div>
            </form>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-2 text-[11px] text-[#7d7065]">
              <div className="flex items-center space-x-2 text-zinc-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Melvi Luxury Assurance</span>
              </div>
              <p>
                Your contact details are encrypted and strictly used for verified deliveries of our artisan chocolate collections.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Multiple Delivery Addresses Manager */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* INLINE ADDRESS FORM (Shown when Adding or Editing) */}
            {isAddingAddress && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-400 shadow-md space-y-5 animate-slideDown">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-amber-700" />
                    <h3 className="font-serif font-black text-lg text-[#241c18]">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelAddressForm}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 px-3 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                  {/* Address Label Buttons */}
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1.5">Address Label</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Home', 'Work', 'Gifting / Other'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setAddrLabel(lbl)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                            addrLabel === lbl
                              ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-2xs'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          {lbl === 'Home' && <Home className="w-3.5 h-3.5" />}
                          {lbl === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                          {lbl.includes('Gifting') && <Tag className="w-3.5 h-3.5" />}
                          <span>{lbl}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#54463d] mb-1">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        value={addrRecipient}
                        onChange={(e) => setAddrRecipient(e.target.value)}
                        placeholder="e.g. Raj Kiran"
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#54463d] mb-1">Recipient Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] font-mono"
                      />
                    </div>
                  </div>

                  {/* Street Address Line */}
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Flat / House No., Building, Street Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      placeholder="e.g. Penthouse 801, Signet Manor, Pali Hill, Bandra West"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] resize-none"
                    />
                  </div>

                  {/* City, State, Pincode */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                      <label className="block font-bold text-[#54463d] mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#54463d] mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#54463d] mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        placeholder="400050"
                        className="w-full p-2 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Default Address Checkbox */}
                  <label className="flex items-center space-x-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-zinc-800">Set as primary default address for instant 1-click checkout</span>
                  </label>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingAddress}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmittingAddress ? 'Saving Address...' : (editingAddressId ? 'Save Address Changes' : '+ Save Delivery Address')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddressForm}
                      className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LIST OF SAVED ADDRESSES */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e5decb] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18]">
                    Saved Delivery Destinations ({addresses.length})
                  </h3>
                  <p className="text-xs text-[#7d7065]">
                    Select any of these destinations during checkout with a single click
                  </p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => {
                      setIsAddingAddress(true);
                      setEditingAddressId(null);
                      setAddrRecipient(currentUser?.name || '');
                      setAddrPhone(currentUser?.phone || '');
                      setAddrLine('');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="py-12 text-center text-zinc-400 text-xs font-mono">
                  Loading your saved delivery addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center border border-amber-200">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-zinc-800">No delivery addresses saved yet</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Add your home, office, or luxury gift recipient address to enjoy seamless 1-click ordering with 16°C cold packaging.
                  </p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#8c5d19] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#734a1a] transition-all cursor-pointer"
                  >
                    + Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => {
                    const isDefault = Boolean(addr.isDefault);
                    return (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-3xl border transition-all ${
                          isDefault
                            ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-300/40'
                            : 'bg-white border-[#e5decb] hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center space-x-1">
                                {addr.label === 'Home' && <Home className="w-3 h-3 text-amber-700" />}
                                {addr.label === 'Work' && <Briefcase className="w-3 h-3 text-amber-700" />}
                                <span>{addr.label || 'Home'}</span>
                              </span>
                              {isDefault && (
                                <span className="bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-2xs">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>Default Address</span>
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-[#241c18] pt-1">
                              {addr.recipientName || currentUser.name}
                            </h4>

                            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                              {addr.addressLine}, {addr.city}, {addr.state} - <strong className="font-mono text-zinc-900">{addr.pincode}</strong>
                            </p>

                            {addr.phone && (
                              <p className="text-[11px] text-zinc-500 flex items-center space-x-1 pt-0.5">
                                <Phone className="w-3 h-3 text-amber-700" />
                                <span className="font-mono">{addr.phone}</span>
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                className="px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-amber-50 text-zinc-700 hover:text-amber-900 border border-zinc-200 hover:border-amber-300 text-xs font-bold transition-all cursor-pointer"
                                title="Set as primary address for orders"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(addr)}
                              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                              title="Edit this address"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                              title="Remove address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

