import React, { useState } from 'react';
import { Sparkles, Check, Gift, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function BlinkitCustomBoxSection({ onAddCustomBoxToCart, availableProducts = [] }) {
  const boxSizes = [
    { id: 'box-6', name: '6-Piece Petite Box', slots: 6, price: 999, image: '/images/chocolates/choco-2.jpg' },
    { id: 'box-12', name: '12-Piece Signature Box', slots: 12, price: 1899, image: '/images/melvi-founder-box.jpg', popular: true },
    { id: 'box-24', name: '24-Piece Grand Box', slots: 24, price: 3499, image: '/images/melvi-founder-box.jpg' },
  ];

  // Dynamically derive flavor chips from live PostgreSQL catalog confections (only in-stock items)!
  const flavorOptions = availableProducts
    .filter(p => p.inStock !== false)
    .map(p => ({
      id: p.id,
      name: p.name,
      tag: p.badge || (p.tags && p.tags[0]) || p.category || 'Confection',
      image: p.image
    }));

  const [selectedBox, setSelectedBox] = useState(boxSizes[1]); // Default to 12-piece
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  
  // Custom Customer Requirements & Notes Space
  const [customerRequirements, setCustomerRequirements] = useState('');
  const [added, setAdded] = useState(false);

  const toggleFlavor = (name) => {
    if (selectedFlavors.includes(name)) {
      if (selectedFlavors.length > 1) {
        setSelectedFlavors(selectedFlavors.filter(f => f !== name));
      }
    } else {
      setSelectedFlavors([...selectedFlavors, name]);
    }
  };

  const handleAddPresetNote = (note) => {
    if (!customerRequirements.includes(note)) {
      setCustomerRequirements(prev => prev ? `${prev} • ${note}` : note);
    }
  };

  const handleAddToCart = () => {
    const item = {
      id: `custom-box-${Date.now()}`,
      name: `Custom ${selectedBox.name}`,
      tagline: `${selectedFlavors.length} Flavors Curated`,
      price: selectedBox.price,
      quantity: 1,
      image: selectedBox.image,
      category: 'bespoke',
      customNotes: customerRequirements,
      customSpecs: {
        boxSize: selectedBox.name,
        flavors: selectedFlavors,
      }
    };

    onAddCustomBoxToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section id="custom-box-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Custom Box Atelier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-zinc-900">
              Customize Your Melvi Box
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Select your box size, choose signature flavors, and tell our chocolatiers your specific requirements.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-400">Total Box Price:</span>
            <p className="font-bold text-2xl text-amber-900 font-serif">
              ₹{selectedBox.price.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          
          {/* Left Column: Box Selection & Flavors */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Choose Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                1. Select Box Size:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {boxSizes.map(box => (
                  <button
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedBox.id === box.id
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <p className="font-bold text-xs sm:text-sm text-zinc-900">{box.name}</p>
                    <p className="text-xs text-amber-800 font-bold mt-0.5">₹{box.price.toLocaleString()}</p>
                    {box.popular && (
                      <span className="inline-block mt-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        Most Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Choose Flavors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                2. Select Preferred Flavors:
              </label>
              {flavorOptions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {flavorOptions.map(flavor => {
                    const isChecked = selectedFlavors.includes(flavor.name);
                    return (
                      <button
                        key={flavor.id}
                        onClick={() => toggleFlavor(flavor.name)}
                        className={`p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                          isChecked
                            ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-semibold'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-zinc-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs truncate">{flavor.name}</p>
                          <p className="text-[10px] text-zinc-400">{flavor.tag}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-3 bg-zinc-50 rounded-xl px-3 border border-zinc-200">
                  No confections currently available for custom box selection. Add items in Platform Admin.
                </p>
              )}
            </div>

            {/* 3. DEDICATED NOTE SPACE FOR CUSTOMER REQUIREMENTS */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950">
                  3. Note Space for Customer Requirements & Dietary Notes:
                </label>
                <span className="text-[11px] text-amber-700 font-medium">Chef review guaranteed</span>
              </div>

              {/* Quick note preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('100% Eggless Only')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  🌿 100% Eggless
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('Emboss Initials with Gold Leaf')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  ✨ Gold Initials
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('Nut Allergy Safe')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  ⚠️ Nut-Safe
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('Write "Happy Anniversary" Card')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  💌 Gift Note Card
                </button>
              </div>

              {/* Textarea */}
              <textarea
                rows={3}
                value={customerRequirements}
                onChange={(e) => setCustomerRequirements(e.target.value)}
                placeholder="e.g. Please avoid peanuts, emboss initials 'A & M', and enclose a birthday greeting card."
                className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

          {/* Right Column: Box Preview & Instant Add to Cart */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            <div className="rounded-2xl overflow-hidden aspect-[4/3] relative border border-zinc-200 bg-zinc-100">
              <img
                src={selectedBox.image}
                alt={selectedBox.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-zinc-800 shadow-2xs">
                {selectedBox.name}
              </div>
            </div>

            {/* Note Summary */}
            {customerRequirements && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Enclosed Customer Note:</span>
                <p className="text-zinc-600 italic">"{customerRequirements}"</p>
              </div>
            )}

            {/* Big Add Button (Instamart Style) */}
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all shadow-sm flex items-center justify-center space-x-2 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Custom Box Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add Custom Box to Cart • ₹{selectedBox.price.toLocaleString()}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-zinc-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Packed in 16°C Insulated Cold-Box with Melt-Proof Seal</span>
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}
