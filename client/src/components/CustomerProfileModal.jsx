import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { 
  X, User, MapPin, Plus, Check, Trash2, Pencil, ShieldCheck, 
  Home, Briefcase, Tag, Phone, Mail, CheckCircle2, AlertCircle, Sparkles 
} from 'lucide-react';

export default function CustomerProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) {
  if (!isOpen) return null;

  // Active Tab: 'profile' | 'addresses'
  const [activeTab, setActiveTab] = useState('addresses');

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
    setTimeout(() => setToastMessage(''), 3000);
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
        showToast('Contact details successfully updated!');
        if (onUserUpdated) {
          onUserUpdated(data.user);
        }
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating contact details');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Open Edit Address Form
  const handleStartEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || 'Home');
    setAddrRecipient(addr.recipientName || currentUser?.name || '');
    setAddrPhone(addr.phone || currentUser?.phone || '');
    setAddrLine(addr.addressLine || '');
    setAddrCity(addr.city || 'Mumbai');
    setAddrState(addr.state || 'Maharashtra');
    setAddrPincode(addr.pincode || '400050');
    setAddrIsDefault(Boolean(addr.isDefault));
    setIsAddingAddress(true);
  };

  const handleCancelAddressForm = () => {
    setEditingAddressId(null);
    setIsAddingAddress(false);
    setAddrLabel('Home');
    setAddrRecipient(currentUser?.name || '');
    setAddrPhone(currentUser?.phone || '');
    setAddrLine('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrIsDefault(false);
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrLine.trim() || !addrPincode.trim()) {
      setErrorMessage('Please enter your full street address and pincode.');
      return;
    }

    setIsSubmittingAddress(true);
    setErrorMessage('');

    const payload = {
      userId: currentUser.id,
      label: addrLabel,
      recipientName: addrRecipient.trim(),
      phone: addrPhone.trim(),
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
        await fetchAddresses();
      } else {
        throw new Error(data.message || 'Failed to save address');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving address');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id, label) => {
    if (!window.confirm(`Are you sure you want to delete your "${label}" address?`)) return;

    try {
      const res = await apiFetch(`/api/auth/addresses/${id}?userId=${encodeURIComponent(currentUser.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Address deleted.');
        await fetchAddresses();
      }
    } catch (err) {
      setErrorMessage('Failed to delete address.');
    }
  };

  // Set As Default Address 1-Click
  const handleSetDefault = async (addr) => {
    try {
      const res = await apiFetch(`/api/auth/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, isDefault: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`"${addr.label}" is now your default delivery address.`);
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#faf8f5] border border-[#e5decb] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-zinc-900 font-sans">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#e5decb] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#241c18] text-amber-300 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#241c18]">
                My Profile &amp; Delivery Addresses
              </h2>
              <p className="text-xs text-[#7d7065]">
                Manage your contact details and saved shipping locations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5decb] bg-white px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Delivery Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-2 cursor-pointer ml-6 ${
              activeTab === 'profile'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Contact Details</span>
          </button>
        </div>

        {/* Toast / Alerts */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-5">
          
          {/* TAB 1: SAVED DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#241c18]">Delivery Addresses</h3>
                  <p className="text-[11px] text-zinc-500">Pick which address to use at checkout or add a new one</p>
                </div>

                {!isAddingAddress && (
                  <button
                    onClick={() => {
                      handleCancelAddressForm();
                      setIsAddingAddress(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#241c18] hover:bg-[#3d2f26] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Inline Add / Edit Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="p-5 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd9]">
                    <span className="font-bold text-[#241c18] text-sm">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelAddressForm}
                      className="text-xs text-zinc-500 hover:text-zinc-800 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Label Selector */}
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Address Label</label>
                    <div className="flex space-x-2">
                      {[
                        { label: 'Home', icon: Home },
                        { label: 'Work', icon: Briefcase },
                        { label: 'Other', icon: Tag },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = addrLabel === item.label;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setAddrLabel(item.label)}
                            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recipient Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={addrRecipient}
                        onChange={(e) => setAddrRecipient(e.target.value)}
                        placeholder="Enter recipient name"
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Street Address / Flat / Building *</label>
                    <textarea
                      required
                      rows={2}
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      placeholder="Flat / House No., Building, Street Address"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                    />
                  </div>

                  {/* City, State & Pincode */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">State</label>
                      <input
                        type="text"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Set as Default Checkbox */}
                  <label className="flex items-center space-x-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="font-semibold text-zinc-700">Set as my default delivery address</span>
                  </label>

                  {/* Submit & Cancel */}
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelAddressForm}
                      className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAddress}
                      className="px-5 py-2.5 rounded-xl bg-[#8c5d19] hover:bg-[#734a1a] text-white font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {isSubmittingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards List */}
              <div className="space-y-3">
                {loadingAddresses ? (
                  <p className="text-xs text-zinc-500 text-center py-8">Loading saved addresses...</p>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-zinc-300 p-6 space-y-2">
                    <MapPin className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="font-bold text-zinc-700 text-sm">No saved delivery addresses yet</p>
                    <p className="text-xs text-zinc-500">Click "Add New Address" above to save your first location.</p>
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const Icon = addr.label === 'Work' ? Briefcase : addr.label === 'Other' ? Tag : Home;
                    return (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl bg-white border transition-all ${
                          addr.isDefault
                            ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                            : 'border-[#e5decb] hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                                <Icon className="w-3 h-3 text-amber-700" />
                                <span>{addr.label || 'Home'}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Default
                                </span>
                              )}
                              {addr.recipientName && (
                                <span className="font-bold text-xs text-[#241c18]">
                                  {addr.recipientName}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-800 leading-relaxed pt-1">
                              {addr.addressLine}, {addr.city} - <span className="font-mono font-semibold">{addr.pincode}</span>
                            </p>

                            {addr.phone && (
                              <p className="text-[11px] text-zinc-500 flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-zinc-400" />
                                <span>{addr.phone}</span>
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1 shrink-0 ml-3">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors"
                              >
                                Make Default
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEditAddress(addr)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                              title="Edit address"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id, addr.label)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EDIT CONTACT DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-[#e5decb] space-y-4 shadow-2xs">
                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-3.5 rounded-2xl bg-[#241c18] hover:bg-[#3d2f26] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Contact Details'}</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

