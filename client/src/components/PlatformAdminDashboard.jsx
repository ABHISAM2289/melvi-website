import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { 
  ShieldCheck, Package, Plus, Trash2, Database, Upload, RefreshCw, 
  CheckCircle2, AlertCircle, Eye, LogOut, Truck, Cloud, Image, Sparkles,
  Pencil, XCircle, ArrowRight, Check, Clock, Sliders, Snowflake, Ticket, Percent, Tag
} from 'lucide-react';
import { getBannerStyle } from './BlinkitBanners';

export default function PlatformAdminDashboard({ onLogout, onSwitchToStore }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'banners' | 'orders' | 'storage'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing Product Mode (null = Add New, string = Editing ID)
  const [editingProductId, setEditingProductId] = useState(null);

  // Confection Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('chocolate-bites');
  const [price, setPrice] = useState('360');
  const [originalPrice, setOriginalPrice] = useState('420');
  const [cocoaPercentage, setCocoaPercentage] = useState('72');
  const [badge, setBadge] = useState('Artisan Drop');
  const [tags, setTags] = useState('Gold Leaf, Single Origin, Dark');
  const [description, setDescription] = useState('Handcrafted in small batches with single-origin cocoa and 24K gold foil.');
  const [imageUrl, setImageUrl] = useState('/images/chocolates/choco-1.jpg');
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Banner Management Form State
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerTitle, setBannerTitle] = useState('Create Custom Box');
  const [bannerHighlight, setBannerHighlight] = useState('BESPOKE ATELIER');
  const [bannerSubtitle, setBannerSubtitle] = useState('Pick bonbons + add special chef notes');
  const [bannerCtaText, setBannerCtaText] = useState('Create Custom Box');
  const [bannerCode, setBannerCode] = useState('CUSTOM');
  const [bannerGradient, setBannerGradient] = useState('from-amber-500 to-amber-600');
  const [bannerImage, setBannerImage] = useState('/images/melvi-founder-box.jpg');
  const [bannerLinkType, setBannerLinkType] = useState('custom_box');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  // Promo Code / Coupon Management State
  const [coupons, setCoupons] = useState([]);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('PERCENTAGE'); // 'PERCENTAGE' | 'FLAT'
  const [couponValue, setCouponValue] = useState('15');
  const [couponMinOrder, setCouponMinOrder] = useState('499');
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('500');
  const [couponDescription, setCouponDescription] = useState('Flat 15% off on all artisan confections');
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  // Selected Order for Tracking Update
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('CUSTOM_PACKAGING');
  const [checkpointLocation, setCheckpointLocation] = useState('Melvi Central Atelier - Bay 3');
  const [checkpointNote, setCheckpointNote] = useState('Hand-packed into custom box with thermal gel pack.');
  const [courierName, setCourierName] = useState('Melvi Cold-Chain Express (16°C Chilled Van)');
  const [estimatedDelivery, setEstimatedDelivery] = useState('Tomorrow, 2:00 PM – 5:00 PM');

  // Refresh products, orders, banners & coupons from backend (Live Real-Time Sync)
  const refreshData = async () => {
    try {
      const [prodRes, ordRes, banRes, coupRes] = await Promise.all([
        apiFetch('/api/catalog/products').catch(() => null),
        apiFetch('/api/orders').catch(() => null),
        apiFetch('/api/catalog/banners?all=true').catch(() => null),
        apiFetch('/api/catalog/coupons?all=true').catch(() => null),
      ]);
      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json().catch(() => ({}));
        setProducts(prodData.products || []);
      }
      if (ordRes && ordRes.ok) {
        const ordData = await ordRes.json().catch(() => ({}));
        setOrders(ordData.orders || []);
        if (ordData.orders?.length > 0 && !selectedOrder) {
          setSelectedOrder(ordData.orders[0]);
          setTrackingStatus(ordData.orders[0].orderStatus);
          setEstimatedDelivery(ordData.orders[0].estimatedDelivery || 'Tomorrow, 2:00 PM – 5:00 PM');
        }
      }
      if (banRes && banRes.ok) {
        const banData = await banRes.json().catch(() => ({}));
        setBanners(banData.banners || []);
      }
      if (coupRes && coupRes.ok) {
        const coupData = await coupRes.json().catch(() => ({}));
        setCoupons(coupData.coupons || []);
      }
    } catch (err) {
      console.warn('Admin background sync notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3500); // Live real-time sync with database
    return () => clearInterval(interval);
  }, []);

  // Direct Local Image Upload (Database-Ready with Canvas Auto-Compression)
  const handleLocalImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Automatically optimize image to max 1000px width/height and 0.85 JPEG
        const maxDim = 1000;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setImageUrl(optimizedBase64);
        setSuccessMessage('Photo loaded & optimized for instant database storage!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      img.onerror = () => {
        setImageUrl(event.target.result);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Start Editing an existing Product
  const handleStartEdit = (prod) => {
    setEditingProductId(prod.id);
    setName(prod.name || '');
    setTagline(prod.tagline || '');
    setCategory(prod.category || 'chocolate-bites');
    setPrice(String(prod.price || ''));
    setOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : '');
    setCocoaPercentage(prod.cocoaPercentage ? String(prod.cocoaPercentage) : '70');
    setBadge(prod.badge || '');
    setTags(Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || ''));
    setDescription(prod.description || '');
    setImageUrl(prod.image || '/images/chocolates/choco-1.jpg');
    setInStock(prod.inStock !== false);
    setSuccessMessage(`Now editing "${prod.name}". Make changes and click "Save Changes".`);
    setTimeout(() => setSuccessMessage(''), 3500);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setName('');
    setTagline('');
    setCategory('chocolate-bites');
    setPrice('360');
    setOriginalPrice('420');
    setCocoaPercentage('72');
    setBadge('Artisan Drop');
    setTags('Gold Leaf, Single Origin, Dark');
    setDescription('Handcrafted in small batches with single-origin cocoa and 24K gold foil.');
    setImageUrl('/images/chocolates/choco-1.jpg');
    setInStock(true);
    setErrorMessage('');
  };

  // Quick 1-Click Stock Toggle
  const handleQuickToggleStock = async (prod) => {
    const nextStock = prod.inStock === false ? true : false;
    try {
      setErrorMessage('');
      const res = await apiFetch(`/api/catalog/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: nextStock }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`"${prod.name}" marked as ${nextStock ? 'IN STOCK' : 'OUT OF STOCK'}!`);
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update stock status');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating stock status');
    }
  };

  // Save (Create OR Update) Product in Live Catalog
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: name.trim(),
        tagline: tagline.trim(),
        category,
        price: parseFloat(price) || 299,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        cocoaPercentage: cocoaPercentage ? parseInt(cocoaPercentage, 10) : 70,
        badge: badge.trim(),
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['Artisan', 'Handmade'],
        description: description.trim(),
        image: imageUrl || '/images/chocolates/choco-1.jpg',
        inStock: Boolean(inStock),
      };

      const isEdit = Boolean(editingProductId);
      const url = isEdit ? `/api/catalog/products/${editingProductId}` : '/api/catalog/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected response (${res.status})`);
      }

      if (res.ok && data.success) {
        setSuccessMessage(
          isEdit 
            ? `"${payload.name}" updated successfully in live catalog!` 
            : `"${payload.name}" successfully published to live catalog!`
        );
        handleCancelEdit();
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        throw new Error(data.message || `Failed to save product (HTTP ${res.status})`);
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      setErrorMessage(err.message || 'Error saving product to catalog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product from Main Catalog
  const handleDeleteProduct = async (id, prodName) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from the catalog?`)) return;

    try {
      const res = await apiFetch(`/api/catalog/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Removed "${prodName}" from catalog.`);
        if (editingProductId === id) handleCancelEdit();
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 2500);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Start Editing a Banner
  const handleStartEditBanner = (b) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title || '');
    setBannerHighlight(b.highlight || '');
    setBannerSubtitle(b.subtitle || '');
    setBannerCtaText(b.ctaText || '');
    setBannerCode(b.code || '');
    setBannerGradient(b.bgGradient || 'from-amber-500 to-amber-600');
    setBannerImage(b.image || '');
    setBannerLinkType(b.linkType || 'store');
    setBannerIsActive(b.isActive !== false);
    setSuccessMessage(`Editing banner "${b.title}". Make changes and click "Save Banner Changes".`);
    setTimeout(() => setSuccessMessage(''), 3000);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Cancel Editing a Banner
  const handleCancelEditBanner = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerHighlight('');
    setBannerSubtitle('');
    setBannerCtaText('');
    setBannerCode('');
    setBannerGradient('from-amber-500 to-amber-600');
    setBannerImage('');
    setBannerLinkType('store');
    setBannerIsActive(true);
  };

  // Direct Local Image Upload for Promotional Poster Artwork
  const handleBannerImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    
    // If SVG, directly store as Data URL without canvas rasterization
    if (file.type.includes('svg') || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerImage(event.target.result);
        setSuccessMessage('SVG vector poster loaded!');
        setTimeout(() => setSuccessMessage(''), 2500);
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // High-definition canvas scaling for wide posters (up to 1600px width)
        const maxDim = 1600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.90);

        setBannerImage(optimizedBase64);
        setSuccessMessage('Poster artwork loaded & optimized for instant database storage!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save (Create OR Update) Banner
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setIsSubmittingBanner(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        title: bannerTitle.trim(),
        highlight: bannerHighlight.trim(),
        subtitle: bannerSubtitle.trim(),
        ctaText: bannerCtaText.trim(),
        code: bannerCode.trim(),
        bgGradient: bannerGradient,
        image: bannerImage,
        linkType: bannerLinkType,
        isActive: Boolean(bannerIsActive),
      };

      const isEdit = Boolean(editingBannerId);
      const url = isEdit ? `/api/catalog/banners/${editingBannerId}` : '/api/catalog/banners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isEdit
            ? `Banner "${payload.title}" updated successfully!`
            : `Banner "${payload.title}" created successfully!`
        );
        handleCancelEditBanner();
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        throw new Error(data.message || `Failed to save banner (HTTP ${res.status})`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving banner.');
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  // Toggle Active/Hidden for a Banner
  const handleQuickToggleBannerActive = async (b) => {
    try {
      setErrorMessage('');
      const newActive = !b.isActive;
      const res = await apiFetch(`/api/catalog/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Banner "${b.title}" is now ${newActive ? 'Active in Slider' : 'Hidden'}!`);
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update banner status');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating banner');
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      const res = await apiFetch(`/api/catalog/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Banner "${title}" deleted.`);
        if (editingBannerId === id) handleCancelEditBanner();
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 2500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete banner');
    }
  };

  // Start Editing a Promo Code
  const handleStartEditCoupon = (c) => {
    setEditingCouponId(c.id);
    setCouponCode(c.code || '');
    setCouponType(c.discountType || 'PERCENTAGE');
    setCouponValue(String(c.discountValue || '15'));
    setCouponMinOrder(String(c.minOrderAmount || '0'));
    setCouponMaxDiscount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '0');
    setCouponDescription(c.description || '');
    setCouponIsActive(c.isActive !== false);
    setSuccessMessage(`Editing promo code "${c.code}". Make changes and click "Save Coupon Changes".`);
    setTimeout(() => setSuccessMessage(''), 3000);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Cancel Editing a Promo Code
  const handleCancelEditCoupon = () => {
    setEditingCouponId(null);
    setCouponCode('');
    setCouponType('PERCENTAGE');
    setCouponValue('15');
    setCouponMinOrder('499');
    setCouponMaxDiscount('500');
    setCouponDescription('Flat 15% off on all artisan confections');
    setCouponIsActive(true);
  };

  // Save (Create OR Update) Promo Code
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setErrorMessage('Please provide a promo code string (e.g. MELVIGOLD).');
      return;
    }

    setIsSubmittingCoupon(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        code: couponCode.trim().toUpperCase(),
        discountType: couponType,
        discountValue: parseFloat(couponValue) || 10,
        minOrderAmount: parseFloat(couponMinOrder) || 0,
        maxDiscountAmount: parseFloat(couponMaxDiscount) || 0,
        description: couponDescription.trim(),
        isActive: Boolean(couponIsActive),
      };

      const isEdit = Boolean(editingCouponId);
      const url = isEdit ? `/api/catalog/coupons/${editingCouponId}` : '/api/catalog/coupons';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isEdit
            ? `Promo code "${payload.code}" updated successfully!`
            : `Promo code "${payload.code}" created successfully!`
        );
        handleCancelEditCoupon();
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        throw new Error(data.message || 'Failed to save promo code');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving promo code.');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  // Toggle Active/Inactive for a Promo Code
  const handleToggleCouponActive = async (c) => {
    try {
      setErrorMessage('');
      const newActive = !c.isActive;
      const res = await apiFetch(`/api/catalog/coupons/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Promo code "${c.code}" is now ${newActive ? 'ACTIVE' : 'INACTIVE'}!`);
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update promo code');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating promo code');
    }
  };

  // Delete Promo Code
  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete promo code "${code}"?`)) return;
    try {
      const res = await apiFetch(`/api/catalog/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Promo code "${code}" deleted.`);
        if (editingCouponId === id) handleCancelEditCoupon();
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 2500);
      }
    } catch (err) {
      setErrorMessage('Failed to delete promo code');
    }
  };

  // 1-Click Quick Update Tracking Milestone for Client Ease!
  const handleQuickUpdateStatus = async (orderId, newStatus) => {
    try {
      setErrorMessage('');
      const statusLocations = {
        ORDER_CONFIRMED: 'Melvi Central Kitchen',
        ARTISAN_CRAFTING: 'Artisan Kitchen Bay 2 - Handcrafting',
        CUSTOM_PACKAGING: 'Packaging Studio - Box Sealing & Gold Monogram',
        DISPATCHED: 'Mumbai Chilled Logistics Hub (16°C Chamber)',
        IN_TRANSIT: 'Climate-Controlled Van (Maintained at 16°C)',
        DELIVERED: 'Delivered to Customer Doorstep'
      };
      const statusDescriptions = {
        ORDER_CONFIRMED: 'Order confirmed and verified. Scheduled for crafting.',
        ARTISAN_CRAFTING: 'Chocolatiers have tempered the single-origin cocoa and hand-piped ganache.',
        CUSTOM_PACKAGING: 'Placed into luxury box with customer requirement note & gold wax seal.',
        DISPATCHED: 'Secured inside insulated cold-pack box with thermal gel pack.',
        IN_TRANSIT: 'Traveling in refrigerated courier vehicle.',
        DELIVERED: 'Handed over in pristine melt-proof condition. Bon appétit!'
      };

      const targetOrder = orders.find(o => o.id === orderId) || selectedOrder;
      const res = await apiFetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          location: statusLocations[newStatus] || 'Melvi Atelier',
          description: statusDescriptions[newStatus] || 'Milestone updated.',
          estimatedDelivery: targetOrder?.estimatedDelivery || estimatedDelivery,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Order ${data.order.trackingNumber} milestone updated to ${newStatus}!`);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
          setTrackingStatus(newStatus);
        }
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage(data.message || 'Failed to update tracking');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating tracking status');
    }
  };

  // 1-Click Quick Update Estimated Delivery on Order Card
  const handleQuickUpdateEstimatedDelivery = async (orderId, newEstimate) => {
    try {
      setErrorMessage('');
      const targetOrder = orders.find((o) => o.id === orderId) || selectedOrder;
      const res = await apiFetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetOrder?.orderStatus || 'IN_TRANSIT',
          location: targetOrder?.currentCheckpoint || 'Melvi Central Atelier - Bay 3',
          description: `Estimated delivery updated to "${newEstimate}".`,
          estimatedDelivery: newEstimate,
          courierName: targetOrder?.courierName || 'Melvi Cold-Chain Express (16°C Chilled Van)',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Order ${data.order.trackingNumber} delivery estimate updated to "${newEstimate}"!`);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
          setEstimatedDelivery(newEstimate);
        }
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage(data.message || 'Failed to update delivery estimate');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating delivery estimate');
    }
  };

  // Detailed Form Update Package Tracking
  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setErrorMessage('');

    try {
      const res = await apiFetch(`/api/orders/${selectedOrder.id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: trackingStatus,
          location: checkpointLocation,
          description: checkpointNote,
          courierName,
          estimatedDelivery,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedOrder(data.order);
        setSuccessMessage(`Order ${data.order.trackingNumber} updated to ${trackingStatus}!`);
        await refreshData();
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage(data.message || 'Failed to update tracking');
      }
    } catch (err) {
      console.error('Failed to update tracking:', err);
      setErrorMessage(err.message || 'Network error updating tracking');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#241c18] flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="bg-white border-b border-[#e5decb] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/50 p-1 bg-white flex items-center justify-center shrink-0">
              <img src="/images/melvi-logo-square.png" alt="Melvi Official Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-black text-lg text-[#241c18]">MELVI</span>
                <span className="bg-[#241c18] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Platform Admin
                </span>
              </div>
              <p className="text-[11px] text-[#7d7065]">Catalog & Custom Orders Management Hub</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onSwitchToStore}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#f0ebe0] text-[#54463d] font-bold text-xs border border-[#e5dcce] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>View Customer Storefront</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-6 text-xs font-bold border-t border-[#f0ebd9]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-[#7d7065] hover:text-[#241c18]'
            }`}
          >
            <span>Main Catalog Manager ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'banners'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-[#7d7065] hover:text-[#241c18]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Store Sliding Posters ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'coupons'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-[#7d7065] hover:text-[#241c18]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Promo Codes ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-[#7d7065] hover:text-[#241c18]'
            }`}
          >
            <span>Custom Orders & Easy Tracking ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'storage'
                ? 'border-[#8c5d19] text-[#8c5d19]'
                : 'border-transparent text-[#7d7065] hover:text-[#241c18]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database vs R2 Storage</span>
          </button>
        </div>
      </header>

      {/* Notification Toasts */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        
        {/* TAB 1: MAIN CATALOG MANAGER (Add, Edit & Remove Products directly in Live Database) */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Product Form (Create or Edit Mode) */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-2xs space-y-5 transition-all ${
              editingProductId ? 'bg-[#fcf9f2] border-amber-300 ring-2 ring-amber-400/30' : 'bg-white border-[#e5decb]'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18] flex items-center space-x-2">
                    {editingProductId ? (
                      <>
                        <Pencil className="w-4 h-4 text-amber-700" />
                        <span>Edit Confection Details</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-amber-700" />
                        <span>Publish New Confection</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-[#7d7065]">
                    {editingProductId 
                      ? 'Update any details for this confection in the live catalog' 
                      : 'Add a new handcrafted chocolate item to the live customer catalog'}
                  </p>
                </div>
                {editingProductId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Confection Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kashmiri Saffron Pistachio Bonbon"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Single-Origin Royal Spiced Ganache"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none font-bold"
                    >
                      <option value="chocolate-bites">Chocolate Bites</option>
                      <option value="chocolate-bars">Chocolate Bars</option>
                      <option value="surprise">Surprise</option>
                      <option value="limited-editions">Limited Editions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Cocoa %</label>
                    <input
                      type="number"
                      value={cocoaPercentage}
                      onChange={(e) => setCocoaPercentage(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Original MRP (₹)</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Badge</label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. Bestseller, 24K Gold"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. Dark, Orange Zest"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                  />
                </div>

                {/* Inventory & Stock Availability Toggle */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-white border border-[#e5dcce]">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-[#54463d]">
                      Inventory & Stock Availability:
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inStock ? 'In Stock (Available)' : 'Out of Stock (Sold Out)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setInStock(true)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        inStock
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-[#faf7f2] text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>In Stock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInStock(false)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        !inStock
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-[#faf7f2] text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Out of Stock (Sold Out)</span>
                    </button>
                  </div>
                </div>

                {/* Direct Image Upload / URL */}
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#4d3b31] flex items-center space-x-1">
                      <Image className="w-3.5 h-3.5 text-amber-700" />
                      <span>Confection Photo (Database Ready):</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Direct DB Storage
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-amber-300 p-0.5 shrink-0 shadow-2xs">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="px-3 py-1.5 bg-[#241c18] hover:bg-[#3d2f26] text-white rounded-lg cursor-pointer flex items-center justify-center space-x-1.5 font-bold w-full transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload New Photo</span>
                        <input type="file" accept="image/*" onChange={handleLocalImageUpload} className="hidden" />
                      </label>
                      <p className="text-[10px] text-zinc-500 text-center">Auto-optimized for instant database save</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image path / URL"
                    className="w-full p-2 rounded-lg bg-white border border-[#d9ccb9] text-[11px] font-mono text-zinc-800"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-white shadow-sm transition-all flex items-center justify-center space-x-2 ${
                      editingProductId
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : 'bg-[#8c5d19] hover:bg-[#734a1a]'
                    }`}
                  >
                    <span>
                      {isSubmitting 
                        ? 'Saving Changes...' 
                        : editingProductId 
                        ? '✓ Save All Changes to Confection' 
                        : '+ Publish to Main Catalog'}
                    </span>
                  </button>

                  {editingProductId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-3.5 rounded-2xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Live Main Catalog Items Table with Edit & Remove Buttons */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#e5decb] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18]">
                    Live Main Catalog Products ({products.length})
                  </h3>
                  <p className="text-xs text-[#7d7065]">Click "Edit" on any item to update all details or "Remove" to delete</p>
                </div>
                <button onClick={refreshData} className="p-2 hover:bg-[#f6f2ea] rounded-xl text-zinc-500" title="Refresh Products">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                {products.map(prod => {
                  const isCurrentEditing = editingProductId === prod.id;
                  return (
                    <div
                      key={prod.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        isCurrentEditing 
                          ? 'bg-amber-50 border-amber-400 shadow-sm ring-1 ring-amber-400' 
                          : 'bg-[#faf7f2] border-[#e5dcce] hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-amber-200 p-0.5 shrink-0 shadow-2xs">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-[#241c18] truncate">{prod.name}</h4>
                            <span className="text-[10px] bg-amber-100 text-[#7c5119] px-2 py-0.5 rounded font-bold shrink-0">
                              {prod.category}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                              prod.inStock === false
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}>
                              {prod.inStock === false ? 'OUT OF STOCK' : 'IN STOCK'}
                            </span>
                            {prod.badge && (
                              <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold shrink-0">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#7d7065] truncate">{prod.tagline}</p>
                          <p className="text-xs font-black text-[#8c5d19] mt-0.5">
                            ₹{prod.price?.toLocaleString()}
                            {prod.originalPrice && (
                              <span className="text-zinc-400 line-through font-normal ml-1.5 text-[11px]">
                                ₹{prod.originalPrice?.toLocaleString()}
                              </span>
                            )}
                            <span className="text-zinc-400 font-normal ml-2 text-[10px]">
                              • {prod.cocoaPercentage || 70}% Cocoa
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: 1-Click Stock Toggle, Edit & Remove */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStock(prod)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow-2xs cursor-pointer ${
                            prod.inStock === false
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                          title={prod.inStock === false ? 'Mark product In Stock' : 'Mark product Out of Stock'}
                        >
                          {prod.inStock === false ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Restock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Mark Out of Stock</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleStartEdit(prod)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shadow-2xs cursor-pointer ${
                            isCurrentEditing 
                              ? 'bg-amber-700 text-white' 
                              : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                          title="Edit all product details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{isCurrentEditing ? 'Editing...' : 'Edit'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center space-x-1 transition-colors shadow-2xs cursor-pointer"
                          title="Remove product from catalog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}



        {/* TAB 2: CUSTOM ORDERS & EASY 1-CLICK TRACKING CONTROLLER */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Orders List with 1-Click Quick Milestone Updates */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#e5decb] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18]">Custom Orders ({orders.length})</h3>
                  <p className="text-xs text-[#7d7065]">Use 1-click pills below to update tracking or select for full details</p>
                </div>
                <button onClick={refreshData} className="p-2 hover:bg-[#f6f2ea] rounded-xl text-zinc-500" title="Refresh Orders">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
                {orders.map(ord => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isSelected
                          ? 'border-[#8c5d19] bg-[#fbf6ed] shadow-xs ring-1 ring-[#8c5d19]'
                          : 'border-[#eae2d3] bg-[#faf7f2] hover:bg-[#f5ede0]'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          setSelectedOrder(ord);
                          setTrackingStatus(ord.orderStatus);
                          setEstimatedDelivery(ord.estimatedDelivery || 'Tomorrow, 2:00 PM – 5:00 PM');
                          setCourierName(ord.courierName || 'Melvi Cold-Chain Express (16°C Chilled Van)');
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-black text-[#8c5d19]">
                            {ord.trackingNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            ord.orderStatus === 'DELIVERED' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : ord.orderStatus === 'IN_TRANSIT'
                              ? 'bg-blue-100 text-blue-900 animate-pulse'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {ord.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-[#241c18]">{ord.customerName}</p>
                          <span className="font-serif font-black text-xs text-[#8c5d19]">
                            ₹{ord.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#7d7065]">{ord.customerEmail} • {ord.city || 'Mumbai'}</p>

                        {/* Customer Requirements Note Highlight */}
                        {ord.customNotes && (
                          <div className="mt-2 p-2 rounded-xl bg-white border border-amber-200 text-[11px] text-[#7c5119] italic">
                            <span className="font-bold not-italic text-amber-900">Note: </span>
                            "{ord.customNotes}"
                          </div>
                        )}
                      </div>

                      {/* 1-CLICK EASY MILESTONE ADVANCE PILLS */}
                      <div className="pt-2 border-t border-[#e8dfcf] flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold text-[#7d7065] w-full mb-0.5">
                          1-Click Milestone Advance:
                        </span>

                        {[
                          { key: 'ARTISAN_CRAFTING', label: 'Crafting' },
                          { key: 'CUSTOM_PACKAGING', label: 'Packaging' },
                          { key: 'DISPATCHED', label: 'Dispatched' },
                          { key: 'IN_TRANSIT', label: 'In Transit' },
                          { key: 'DELIVERED', label: 'Delivered' },
                        ].map((milestone) => {
                          const isActive = ord.orderStatus === milestone.key;
                          return (
                            <button
                              key={milestone.key}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickUpdateStatus(ord.id, milestone.key);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
                                isActive
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200'
                              }`}
                            >
                              {isActive && <Check className="w-2.5 h-2.5 shrink-0" />}
                              <span>{milestone.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 1-CLICK ESTIMATED DELIVERY UPDATE RIGHT ON ORDER CARD */}
                      <div className="pt-2 border-t border-[#e8dfcf] space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#7d7065] flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-amber-700 inline" />
                            <span>Estimated Delivery:</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                            {ord.estimatedDelivery || 'Within 24–48 Hours'}
                          </span>
                        </div>

                        {/* Quick 1-Click Estimate Presets */}
                        <div className="flex flex-wrap gap-1">
                          {[
                            'Within 45 Mins',
                            'Within 2 Hours',
                            'Today Evening',
                            'Tomorrow Afternoon',
                            'Within 24–48 Hours',
                          ].map((preset) => {
                            const isCurrent = (ord.estimatedDelivery || '').toLowerCase() === preset.toLowerCase();
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickUpdateEstimatedDelivery(ord.id, preset);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'bg-amber-700 text-white shadow-2xs'
                                    : 'bg-white hover:bg-amber-100 text-[#4a392e] border border-[#e0d3bf]'
                                }`}
                              >
                                {preset}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Inline Estimate Input */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <input
                            type="text"
                            defaultValue={ord.estimatedDelivery || ''}
                            placeholder="Type custom delivery time & click Update..."
                            id={`est-input-${ord.id}`}
                            className="flex-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#dcd2c0] rounded-lg focus:outline-none focus:border-amber-600 text-zinc-900"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleQuickUpdateEstimatedDelivery(ord.id, e.target.value);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`est-input-${ord.id}`);
                              if (input && input.value.trim()) {
                                handleQuickUpdateEstimatedDelivery(ord.id, input.value.trim());
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#241c18] hover:bg-[#3d2f26] text-white text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Controller & Order Details for Selected Order */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#e5decb] shadow-2xs space-y-6">
              {selectedOrder ? (
                <form onSubmit={handleUpdateTracking} className="space-y-5">
                  <div className="pb-4 border-b border-[#f0ebd9]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-[#8c5d19] font-bold">
                        Package: {selectedOrder.trackingNumber}
                      </span>
                      <span className="font-serif font-black text-sm text-[#241c18]">
                        ₹{selectedOrder.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-serif font-black text-xl text-[#241c18] mt-1">
                      Customer: {selectedOrder.customerName}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Delivery to: {selectedOrder.shippingAddress}, {selectedOrder.city} - {selectedOrder.pincode}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      Phone: {selectedOrder.customerPhone || 'N/A'} • Email: {selectedOrder.customerEmail}
                    </p>
                  </div>

                  {/* Customer Custom Requirements Note Alert */}
                  {selectedOrder.customNotes && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Customer Requirement Note:
                      </p>
                      <p className="text-xs text-amber-950 font-medium italic">
                        "{selectedOrder.customNotes}"
                      </p>
                    </div>
                  )}

                  {/* Tracking Stage Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#54463d]">
                      Select Tracking Milestone:
                    </label>
                    <select
                      value={trackingStatus}
                      onChange={(e) => setTrackingStatus(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-xs font-bold text-zinc-900 outline-none"
                    >
                      <option value="ORDER_CONFIRMED">1. Order Confirmed & Paid</option>
                      <option value="ARTISAN_CRAFTING">2. Tempering & Crafting Bonbons</option>
                      <option value="CUSTOM_PACKAGING">3. Bespoke Box Packaging & Wax Seal</option>
                      <option value="DISPATCHED">4. Dispatched in 16°C Cold-Box</option>
                      <option value="IN_TRANSIT">5. In Transit (Chilled Vehicle)</option>
                      <option value="DELIVERED">6. Successfully Delivered</option>
                    </select>
                  </div>

                  {/* Live Checkpoint Location */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#54463d]">
                      Live Checkpoint Location / Cold-Chain Temp:
                    </label>
                    <input
                      type="text"
                      value={checkpointLocation}
                      onChange={(e) => setCheckpointLocation(e.target.value)}
                      placeholder="e.g. Dispatched from Mumbai Central Hub (Maintained at 16°C)"
                      className="w-full p-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-xs text-zinc-900 outline-none"
                    />
                  </div>

                  {/* Courier Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#54463d]">
                      Logistics Carrier / Vehicle:
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-xs text-zinc-900 outline-none"
                    />
                  </div>

                  {/* Estimated Delivery Time with Client-Ease Quick Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#54463d]">
                        Estimated Delivery Time:
                      </label>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Visible on Customer Tracker
                      </span>
                    </div>
                    <input
                      type="text"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      placeholder="e.g. Today, 6:00 PM – 8:00 PM or Within 45 Mins"
                      className="w-full p-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-xs font-bold text-zinc-900 outline-none focus:border-[#8c5d19]"
                    />

                    {/* Quick Preset Time Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[
                        'Within 45 Mins',
                        'Within 2 Hours',
                        'Today, 6:00 PM – 8:00 PM',
                        'Tomorrow, 2:00 PM – 5:00 PM',
                        '24–48 Hours (Chilled Box)',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEstimatedDelivery(preset)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#f4eee3] hover:bg-[#eae0cf] text-[#4a392e] border border-[#e0d3bf] transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Description Note */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#54463d]">
                      Milestone Update Note for Customer:
                    </label>
                    <textarea
                      rows={2}
                      value={checkpointNote}
                      onChange={(e) => setCheckpointNote(e.target.value)}
                      placeholder="e.g. Package verified under 18°C and prepared for chilled delivery."
                      className="w-full p-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-xs text-zinc-900 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#241c18] hover:bg-[#3d2f26] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Save Milestone & Update Customer Tracker</span>
                  </button>
                </form>
              ) : (
                <p className="text-zinc-500 text-xs text-center py-20">Select an order from the list.</p>
              )}
            </div>

          </div>
        )}


        {/* TAB: STORE SLIDING POSTERS & BANNERS MANAGER */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Poster Upload & Edit Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#e5decb] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18]">
                    {editingBannerId ? 'Edit Sliding Poster' : 'Upload Designed Poster'}
                  </h3>
                  <p className="text-xs text-[#7d7065]">
                    {editingBannerId ? 'Update poster artwork, link destination, or visibility' : 'Upload artwork designed by your team to slide continuously on the storefront'}
                  </p>
                </div>
                {editingBannerId && (
                  <button
                    onClick={handleCancelEditBanner}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
                {/* 1. Main Poster Artwork Upload Box */}
                <div className="p-4 bg-amber-50/70 rounded-2xl border-2 border-dashed border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#4d3b31] flex items-center space-x-1.5 text-xs">
                      <Image className="w-4 h-4 text-amber-700" />
                      <span>Poster Graphic Artwork *</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Direct Upload
                    </span>
                  </div>

                  {/* Wide Poster Live Preview */}
                  <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-[#241c18] border border-amber-200/80 relative shadow-inner flex items-center justify-center">
                    {bannerImage ? (
                      <img src={bannerImage} alt="Poster Artwork Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 text-amber-200/70">
                        <Upload className="w-8 h-8 mx-auto mb-1 text-amber-300 animate-pulse" />
                        <span className="text-[11px] font-bold block">No poster selected yet</span>
                        <span className="text-[10px] text-zinc-400">Upload your team's design below</span>
                      </div>
                    )}
                  </div>

                  {/* File Selector */}
                  <label className="px-4 py-2.5 bg-[#241c18] hover:bg-[#3d2f26] text-white rounded-xl cursor-pointer flex items-center justify-center space-x-2 font-bold w-full transition-colors shadow-xs">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Choose Poster Image (JPG, PNG, WebP, SVG)</span>
                    <input type="file" accept="image/*,.svg" onChange={handleBannerImageUpload} className="hidden" />
                  </label>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                    <span>Recommended ratio: <strong>~1200 x 380 px</strong> (or 16:5 / 3:1)</span>
                    <span>Auto-optimized</span>
                  </div>

                  {/* Image URL fallback */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">Image Path / URL (Optional)</label>
                    <input
                      type="text"
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      placeholder="e.g. /images/poster-custom-box.svg or paste link"
                      className="w-full p-2 rounded-lg bg-white border border-[#d9ccb9] text-[11px] font-mono text-zinc-800"
                    />
                  </div>
                </div>

                {/* 2. Poster Name / Title */}
                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Poster Title / Reference Name *</label>
                  <input
                    type="text"
                    required
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. Create Custom Box or Flat 15% Off Bonbons"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] font-bold"
                  />
                </div>

                {/* 3. Click Destination */}
                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Click Action / Customer Destination *</label>
                  <select
                    value={bannerLinkType}
                    onChange={(e) => setBannerLinkType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none font-bold"
                  >
                    <option value="custom_box">🎯 Scrolls to Custom Box Atelier</option>
                    <option value="store">🛍️ View All Confections (Store)</option>
                    <option value="tracking">❄️ Opens Live Package &amp; Cold-Chain Tracking</option>
                  </select>
                </div>

                {/* 4. Promo Code & Badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Promo Code on Poster</label>
                    <input
                      type="text"
                      value={bannerCode}
                      onChange={(e) => setBannerCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MELVIGOLD"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none font-mono"
                    />
                    <span className="text-[10px] text-zinc-400">Customer taps to auto-copy</span>
                  </div>
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Tag / Category Badge</label>
                    <input
                      type="text"
                      value={bannerHighlight}
                      onChange={(e) => setBannerHighlight(e.target.value)}
                      placeholder="e.g. BESPOKE ATELIER"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                    />
                    <span className="text-[10px] text-zinc-400">Internal reference tag</span>
                  </div>
                </div>

                {/* 5. Carousel Visibility */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <div>
                    <span className="font-bold text-zinc-800 block">Carousel Visibility</span>
                    <span className="text-[10px] text-zinc-500">Show this poster in the live sliding carousel</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerIsActive(!bannerIsActive)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      bannerIsActive ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {bannerIsActive ? 'Active in Slider' : 'Hidden'}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmittingBanner}
                  className="w-full py-3.5 rounded-2xl bg-[#8c5d19] hover:bg-[#734a1a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmittingBanner 
                      ? 'Saving Poster...' 
                      : editingBannerId 
                      ? '✓ Save Poster Changes' 
                      : '+ Publish Poster to Storefront'}
                  </span>
                </button>
              </form>
            </div>

            {/* Right: Live Posters Previews & Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18]">
                    Live Sliding Posters ({banners.length})
                  </h3>
                  <p className="text-xs text-[#7d7065]">
                    These posters slide continuously in the storefront hero section
                  </p>
                </div>
                <button onClick={refreshData} className="p-2 hover:bg-[#f6f2ea] rounded-xl text-zinc-500 cursor-pointer" title="Refresh Posters">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {banners.map((b) => {
                  const isEditing = editingBannerId === b.id;
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-3xl border transition-all ${
                        isEditing ? 'border-amber-500 ring-2 ring-amber-400/40 bg-white' : 'border-[#e5decb] bg-white'
                      }`}
                    >
                      {/* Live Visual Poster Artwork Preview */}
                      {b.image ? (
                        <div className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-[#241c18] border border-amber-300/40 relative shadow-inner mb-3">
                          <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                          {b.code && (
                            <span className="absolute top-2 right-2 text-[10px] font-mono font-bold bg-black/75 px-2 py-0.5 rounded-full text-amber-200 shadow-md">
                              Code: {b.code}
                            </span>
                          )}
                          <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                            {b.title}
                          </div>
                        </div>
                      ) : (
                        <div 
                          style={getBannerStyle(b.bgGradient)}
                          className="bg-[#251209] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between mb-3 relative overflow-hidden"
                        >
                          <div className="space-y-1 max-w-[75%]">
                            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                              {b.highlight}
                            </span>
                            <h4 className="font-serif font-black text-lg text-white leading-tight">
                              {b.title}
                            </h4>
                            <p className="text-xs text-white/90 line-clamp-1">{b.subtitle}</p>
                          </div>
                        </div>
                      )}

                      {/* Controls Bar */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            b.isActive !== false
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}>
                            {b.isActive !== false ? '● Active in Slider' : '○ Hidden'}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            Target: <span className="font-semibold text-zinc-800">{b.linkType || 'store'}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleQuickToggleBannerActive(b)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                              b.isActive !== false
                                ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {b.isActive !== false ? 'Hide from Slider' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditBanner(b)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>{isEditing ? 'Editing' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(b.id, b.title)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete poster"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        



        {/* TAB: PROMO CODES & COUPONS MANAGER */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Create / Edit Promo Code Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#e5decb] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18] flex items-center space-x-2">
                    <Ticket className="w-5 h-5 text-amber-700" />
                    <span>{editingCouponId ? 'Edit Promo Code' : 'Create New Promo Code'}</span>
                  </h3>
                  <p className="text-xs text-[#7d7065]">
                    {editingCouponId ? 'Update discount rules, minimum order or status' : 'Create custom promotional coupon codes for your customers'}
                  </p>
                </div>
                {editingCouponId && (
                  <button
                    onClick={handleCancelEditCoupon}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                {/* 1. Code Name */}
                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="e.g. MELVIGOLD or DIWALI20 or WELCOME100"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none focus:border-[#8c5d19] font-mono font-bold text-sm tracking-wider"
                  />
                  <p className="text-[10px] text-zinc-400 mt-0.5">Customers type this code in Cart or Checkout</p>
                </div>

                {/* 2. Discount Type Selector */}
                <div>
                  <label className="block font-bold text-[#54463d] mb-1.5">Discount Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCouponType('PERCENTAGE')}
                      className={`p-3 rounded-2xl border text-center font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        couponType === 'PERCENTAGE'
                          ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <Percent className="w-4 h-4 text-amber-700" />
                      <span>Percentage (%) Off</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCouponType('FLAT')}
                      className={`p-3 rounded-2xl border text-center font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        couponType === 'FLAT'
                          ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <span className="font-serif text-sm">₹</span>
                      <span>Flat Cash (₹) Off</span>
                    </button>
                  </div>
                </div>

                {/* 3. Discount Value & Min Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">
                      {couponType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Flat Discount (₹) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={couponType === 'PERCENTAGE' ? '100' : '10000'}
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      placeholder={couponType === 'PERCENTAGE' ? '15' : '150'}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Min. Order Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={couponMinOrder}
                      onChange={(e) => setCouponMinOrder(e.target.value)}
                      placeholder="499"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Max Discount for Percentage */}
                {couponType === 'PERCENTAGE' && (
                  <div>
                    <label className="block font-bold text-[#54463d] mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={couponMaxDiscount}
                      onChange={(e) => setCouponMaxDiscount(e.target.value)}
                      placeholder="e.g. 500 (0 for no cap)"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                    />
                    <p className="text-[10px] text-zinc-400 mt-0.5">Limits the maximum rupee discount a customer can get</p>
                  </div>
                )}

                {/* 4. Description */}
                <div>
                  <label className="block font-bold text-[#54463d] mb-1">Customer Description / Note</label>
                  <input
                    type="text"
                    value={couponDescription}
                    onChange={(e) => setCouponDescription(e.target.value)}
                    placeholder="e.g. Flat 15% off on all artisan chocolate bonbons"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#e5dcce] text-zinc-900 outline-none"
                  />
                </div>

                {/* 5. Active Status */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <div>
                    <span className="font-bold text-zinc-800 block">Coupon Status</span>
                    <span className="text-[10px] text-zinc-500">Allow customers to redeem this code</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCouponIsActive(!couponIsActive)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      couponIsActive ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {couponIsActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmittingCoupon}
                  className="w-full py-3.5 rounded-2xl bg-[#8c5d19] hover:bg-[#734a1a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Ticket className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmittingCoupon 
                      ? 'Saving Coupon...' 
                      : editingCouponId 
                      ? '✓ Save Coupon Changes' 
                      : '+ Create Promo Code'}
                  </span>
                </button>
              </form>
            </div>

            {/* Right: Live Coupons List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd9]">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#241c18]">
                    Active Store Promo Codes ({coupons.length})
                  </h3>
                  <p className="text-xs text-[#7d7065]">
                    Promo codes redeemable by customers during cart &amp; checkout
                  </p>
                </div>
                <button onClick={refreshData} className="p-2 hover:bg-[#f6f2ea] rounded-xl text-zinc-500 cursor-pointer" title="Refresh Promo Codes">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {coupons.map((c) => {
                  const isEditing = editingCouponId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-3xl border transition-all ${
                        isEditing ? 'border-amber-500 ring-2 ring-amber-400/40 bg-white' : 'border-[#e5decb] bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono font-black text-base tracking-wider bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl shadow-2xs">
                              {c.code}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#241c18] text-amber-300">
                              {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              c.isActive !== false
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                            }`}>
                              {c.isActive !== false ? '● Active' : '○ Inactive'}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-700 font-medium pt-1">
                            {c.description || 'Artisan discount promo code'}
                          </p>

                          <div className="flex items-center space-x-4 text-[11px] text-zinc-500 pt-0.5">
                            <span>Min Order: <strong className="text-zinc-800">₹{c.minOrderAmount || 0}</strong></span>
                            {c.discountType === 'PERCENTAGE' && c.maxDiscountAmount > 0 && (
                              <span>Max Cap: <strong className="text-zinc-800">₹{c.maxDiscountAmount}</strong></span>
                            )}
                            <span>Redeemed: <strong className="text-amber-800">{c.usageCount || 0} times</strong></span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                          <button
                            type="button"
                            onClick={() => handleToggleCouponActive(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                              c.isActive !== false
                                ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {c.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditCoupon(c)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>{isEditing ? 'Editing' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete promo code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DATABASE VS R2 EXPLAINER */}
        {activeTab === 'storage' && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-[#e5decb] shadow-2xs space-y-6 text-xs">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#f0ebd9]">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-black text-xl text-[#241c18]">Image Storage Architecture</h3>
                <p className="text-zinc-500">How Melvi stores product photographs without requiring cloud accounts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PostgreSQL Database Storage (Active)</span>
                </div>
                <p className="text-zinc-700 leading-relaxed">
                  Your website stores confection images directly in the PostgreSQL database using auto-compressed image data. Zero external accounts, zero credit cards, and zero R2 setups needed. Works 100% locally on Docker Desktop!
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-[11px] text-emerald-900">
                  Status: <strong>Active & Self-Contained</strong>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center space-x-2 text-zinc-800 font-bold text-sm">
                  <Cloud className="w-4 h-4 text-amber-700" />
                  <span>Cloudflare R2 (Optional Production CDN)</span>
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  When you scale to millions of orders across India, you can optionally configure Cloudflare R2 bucket credentials in your environment variables to serve images via global CDN edge nodes.
                </p>
                <div className="p-3 bg-white rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                  Status: <strong>Optional for Enterprise Scale</strong>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>

    </div>
  );
}
