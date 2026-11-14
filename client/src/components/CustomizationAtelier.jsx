import React, { useState } from 'react';
import { Sparkles, Check, Gift, Heart, Plus, RotateCcw, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CustomizationAtelier({ options, onAddCustomBoxToCart }) {
  const boxSizes = options?.boxSizes || [
    { id: 'box-6', name: '6-Piece Petite Box', slots: 6, price: 999, badge: 'Gift Choice', image: '/images/melvi-bonbons.jpg' },
    { id: 'box-12', name: '12-Piece Signature Luxury Box', slots: 12, price: 1899, badge: 'Most Popular', image: '/images/melvi-founder-box.jpg' },
    { id: 'box-24', name: '24-Piece Grand Celebration Box', slots: 24, price: 3499, badge: 'Royal Grandeur', image: '/images/melvi-founder-box.jpg' }
  ];

  const sleeves = options?.sleeves || [
    { id: 'slv-elegance', name: 'A Touch of Elegance', subtitle: 'Blush Rose Gold with embossed Melvi seal', color: '#e5b29b' },
    { id: 'slv-tempting', name: 'Temptingly Crafted', subtitle: 'Deep Cocoa Crimson with hot foil stamp', color: '#5c1430' },
    { id: 'slv-noir', name: 'Noir Luxe 24K', subtitle: 'Midnight Cocoa with pure gold leaf accents', color: '#1a0d08' }
  ];

  const ribbons = options?.ribbons || [
    { id: 'rib-gold', name: 'Champagne Silk Gold', hex: '#d4af37' },
    { id: 'rib-rose', name: 'Petal Blush Rose', hex: '#e8a598' },
    { id: 'rib-burgundy', name: 'Velvet Crimson', hex: '#6d1830' },
    { id: 'rib-midnight', name: 'Royal Midnight Navy', hex: '#16233b' }
  ];

  const flavors = options?.flavors || [
    { id: 'flv-orange', name: 'Candied Orange Dark Ganache', cocoa: '70% Valencia', image: '/images/melvi-bonbons.jpg', color: '#d97706' },
    { id: 'flv-saffron', name: 'Kashmiri Saffron Pistachio', cocoa: '65% Royal Blend', image: '/images/melvi-bonbons.jpg', color: '#f59e0b' },
    { id: 'flv-caramel', name: 'Smoked Fleur de Sel Caramel', cocoa: '64% Venezuelan', image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=400&q=80', color: '#b45309' },
    { id: 'flv-hazelnut', name: 'Roasted Piedmont Gianduja', cocoa: '54% Milk & Nut', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80', color: '#92400e' },
    { id: 'flv-ruby', name: 'Raspberry Ruby Heart', cocoa: '47% Ruby Cocoa', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80', color: '#e11d48' },
    { id: 'flv-espresso', name: 'Coorg Single-Estate Espresso', cocoa: '75% Arabica Infusion', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80', color: '#451a03' }
  ];

  const [selectedBox, setSelectedBox] = useState(boxSizes[1] || boxSizes[0]); // Default to 12-piece
  const [selectedSleeve, setSelectedSleeve] = useState(sleeves[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(ribbons[0]);
  const [boxSlots, setBoxSlots] = useState(() => Array(12).fill(flavors[0]));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // Dedicated Customer Requirements and Notes Space
  const [customRequirements, setCustomRequirements] = useState(
    'Please prepare strictly eggless. Kindly emboss initials "M & V" with edible gold dust if possible.'
  );
  const [giftMessage, setGiftMessage] = useState('With endless love on this sweet celebration!');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // When box size changes, resize slot array
  const handleBoxSizeSelect = (box) => {
    setSelectedBox(box);
    setBoxSlots(Array(box.slots).fill(flavors[0]));
    setSelectedSlotIndex(0);
  };

  const handleAssignFlavor = (flavor) => {
    const updated = [...boxSlots];
    updated[selectedSlotIndex] = flavor;
    setBoxSlots(updated);
    // advance to next slot automatically
    setSelectedSlotIndex((selectedSlotIndex + 1) % selectedBox.slots);
  };

  const handleAutoAssort = () => {
    const updated = boxSlots.map((_, i) => flavors[i % flavors.length]);
    setBoxSlots(updated);
  };

  const handleAddRequirementChip = (text) => {
    if (!customRequirements.includes(text)) {
      setCustomRequirements(prev => (prev ? `${prev} • ${text}` : text));
    }
  };

  const handleAddToCart = () => {
    const customBoxItem = {
      id: `custom-box-${Date.now()}`,
      name: `Bespoke ${selectedBox.name}`,
      tagline: `${selectedSleeve.name} with ${selectedRibbon.name} Ribbon`,
      price: selectedBox.price,
      quantity: 1,
      image: selectedBox.image,
      category: 'bespoke',
      customSpecs: {
        boxSize: selectedBox.name,
        slotsCount: selectedBox.slots,
        sleeve: selectedSleeve.name,
        ribbon: selectedRibbon.name,
        selectedFlavors: boxSlots.map(f => f.name),
      },
      customNotes: customRequirements,
      giftMessage: giftMessage,
    };

    onAddCustomBoxToCart(customBoxItem);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <section id="customizer-section" className="py-20 bg-cocoa-950 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-rose-950/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold-500/15 border border-gold-400/30 px-4 py-1.5 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>The Melvi Bespoke Atelier</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Design Your <span className="gold-foil-text italic">Custom Luxury Box</span>
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base font-light">
            Curate each individual bonbon, choose hand-foiled sleeves and silk ribbons, and specify your exact dietary or occasion requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Configuration Steps (Box Size, Sleeve, Ribbon, Flavors) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Select Box Size */}
            <div className="bg-cocoa-900/70 p-6 rounded-3xl border border-gold-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-300 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Choose Box Architecture</span>
                </h3>
                <span className="text-xs text-gold-400 font-semibold">{selectedBox.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {boxSizes.map(box => (
                  <button
                    key={box.id}
                    onClick={() => handleBoxSizeSelect(box)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedBox.id === box.id
                        ? 'bg-gradient-to-br from-gold-500/20 via-cocoa-900 to-amber-950/40 border-gold-400 ring-1 ring-gold-400/40 scale-[1.02]'
                        : 'bg-cocoa-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      {box.badge}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-white mt-1">{box.name}</h4>
                    <p className="text-xs text-gold-300 font-bold mt-1">₹{box.price.toLocaleString()}</p>
                    <p className="text-[11px] text-zinc-400 mt-1">{box.slots} Handpicked Pieces</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Sleeve & Satin Ribbon */}
            <div className="bg-cocoa-900/70 p-6 rounded-3xl border border-gold-500/20 shadow-xl space-y-5">
              <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-300 text-xs flex items-center justify-center font-bold">2</span>
                <span>Select Luxury Sleeve & Silk Ribbon</span>
              </h3>

              {/* Sleeves */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-300">Presentation Sleeve:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sleeves.map(slv => (
                    <button
                      key={slv.id}
                      onClick={() => setSelectedSleeve(slv)}
                      className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                        selectedSleeve.id === slv.id
                          ? 'border-gold-400 bg-gold-500/15'
                          : 'border-zinc-800 bg-cocoa-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: slv.color }} />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{slv.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{slv.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ribbons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <p className="text-xs font-semibold text-zinc-300">Hand-Tied Silk Ribbon:</p>
                <div className="flex flex-wrap gap-2.5">
                  {ribbons.map(rib => (
                    <button
                      key={rib.id}
                      onClick={() => setSelectedRibbon(rib)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center space-x-2 transition-all ${
                        selectedRibbon.id === rib.id
                          ? 'border-gold-400 bg-gold-500/20 text-white font-bold ring-1 ring-gold-400'
                          : 'border-zinc-800 bg-cocoa-950 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: rib.hex }} />
                      <span>{rib.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Interactive Bonbon Slot Assembler */}
            <div className="bg-cocoa-900/70 p-6 rounded-3xl border border-gold-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-300 text-xs flex items-center justify-center font-bold">3</span>
                  <span>Assemble Confection Slots</span>
                </h3>
                <button
                  onClick={handleAutoAssort}
                  className="text-xs text-gold-300 hover:text-white flex items-center space-x-1 underline underline-offset-4"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Curate Chef's Assortment</span>
                </button>
              </div>

              {/* Flavor Selector Palette */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {flavors.map(flavor => (
                  <button
                    key={flavor.id}
                    onClick={() => handleAssignFlavor(flavor)}
                    className="p-2.5 rounded-xl bg-cocoa-950/80 border border-gold-500/20 hover:border-gold-400 text-left flex items-center space-x-2.5 group transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-700">
                      <img src={flavor.image} alt={flavor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-gold-200">
                        {flavor.name}
                      </p>
                      <p className="text-[10px] text-gold-400">{flavor.cocoa}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Interactive Slots Grid Preview */}
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Click any slot to replace its flavor:</span>
                  <span className="text-gold-300">Active Slot: #{selectedSlotIndex + 1}</span>
                </div>

                <div className="grid grid-cols-6 gap-2 bg-cocoa-950 p-4 rounded-2xl border border-gold-500/30">
                  {boxSlots.map((flv, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlotIndex(idx)}
                      className={`relative aspect-square rounded-xl p-1 border cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                        selectedSlotIndex === idx
                          ? 'border-gold-400 ring-2 ring-gold-400/50 bg-gold-500/20 scale-105 shadow-md'
                          : 'border-zinc-800 bg-cocoa-900/60 hover:border-gold-500/40'
                      }`}
                      title={`Slot ${idx + 1}: ${flv.name}`}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden mb-0.5 border border-white/20">
                        <img src={flv.image} alt={flv.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] text-gold-200 font-bold truncate max-w-[45px]">
                        {flv.name.split(' ')[0]}
                      </span>
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cocoa-950 text-[9px] text-zinc-400 flex items-center justify-center border border-zinc-700">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: DEDICATED CUSTOMER REQUIREMENTS & NOTE SPACE */}
            <div className="bg-gradient-to-br from-velvet-950/60 via-cocoa-900 to-amber-950/30 p-6 sm:p-8 rounded-3xl border border-gold-400/50 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-300 text-xs flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Customer Requirements & Artisan Notes Space
                  </h3>
                  <p className="text-xs text-gold-200/80">
                    Our master chocolatier will personally review and prepare your specific requests.
                  </p>
                </div>
              </div>

              {/* Quick Preset Request Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddRequirementChip('Strictly 100% Eggless Preparation')}
                  className="text-xs bg-cocoa-950/80 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 px-3 py-1 rounded-full transition-colors"
                >
                  🌿 100% Eggless Only
                </button>
                <button
                  type="button"
                  onClick={() => handleAddRequirementChip('Emboss Custom Initials with Gold Leaf')}
                  className="text-xs bg-cocoa-950/80 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 px-3 py-1 rounded-full transition-colors"
                >
                  ✨ Gold Initials Embossed
                </button>
                <button
                  type="button"
                  onClick={() => handleAddRequirementChip('Nut Allergy Alert - Zero Cross-Contact')}
                  className="text-xs bg-cocoa-950/80 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 px-3 py-1 rounded-full transition-colors"
                >
                  ⚠️ Nut-Safe Preparation
                </button>
                <button
                  type="button"
                  onClick={() => handleAddRequirementChip('Double Cold-Chain Gel Insulation Required')}
                  className="text-xs bg-cocoa-950/80 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 px-3 py-1 rounded-full transition-colors"
                >
                  ❄️ Extra Thermal Ice Pack
                </button>
              </div>

              {/* Requirement Textarea */}
              <div>
                <label className="block text-xs font-semibold text-gold-200 mb-1.5 uppercase tracking-wider">
                  Specific Instructions / Dietary / Custom Monogram Notes:
                </label>
                <textarea
                  rows={3}
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="e.g. Please avoid peanuts, emboss initials 'R & S' on the saffron bonbon, and deliver before 7 PM."
                  className="w-full bg-cocoa-950/90 border border-gold-500/40 rounded-2xl p-3.5 text-sm text-gold-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Gift Card Message */}
              <div>
                <label className="block text-xs font-semibold text-gold-200 mb-1.5 uppercase tracking-wider">
                  Hand-Written Calligraphy Note (Enclosed Inside Box):
                </label>
                <input
                  type="text"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Happy Anniversary / Birthday message to be written with fountain pen"
                  className="w-full bg-cocoa-950/90 border border-gold-500/40 rounded-xl p-3 text-sm text-gold-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Presentation Preview Card & Add to Cart */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            
            <div className="bg-cocoa-900/90 rounded-3xl p-6 sm:p-8 border border-gold-400/40 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                  Bespoke Box Summary
                </span>
                <span className="text-xs bg-gold-400/20 text-gold-300 font-bold px-2.5 py-0.5 rounded-full border border-gold-400/30">
                  Ready to Craft
                </span>
              </div>

              {/* Preview Image */}
              <div className="mt-4 rounded-2xl overflow-hidden aspect-[4/3] relative border border-gold-500/30 bg-cocoa-950">
                <img
                  src={selectedBox.image}
                  alt={selectedBox.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950 via-cocoa-950/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-serif italic text-gold-200">
                    "{selectedSleeve.name}"
                  </p>
                  <p className="text-sm font-bold font-serif">
                    {selectedBox.name} • {selectedRibbon.name} Ribbon
                  </p>
                </div>
              </div>

              {/* Specifications Recap */}
              <div className="py-4 space-y-2.5 text-xs text-zinc-300 border-b border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Box Style:</span>
                  <span className="font-semibold text-white">{selectedBox.name} ({selectedBox.slots} Pcs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Presentation Sleeve:</span>
                  <span className="font-semibold text-white">{selectedSleeve.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Silk Ribbon:</span>
                  <span className="font-semibold text-white">{selectedRibbon.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Assortment:</span>
                  <span className="font-semibold text-gold-300">{boxSlots.length} Flavors Customized</span>
                </div>
              </div>

              {/* Custom Requirements Highlight */}
              {customRequirements && (
                <div className="py-3 bg-cocoa-950/80 p-3 rounded-xl border border-gold-500/20 text-xs space-y-1">
                  <p className="font-bold text-gold-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Customer Requirements Enclosed:</span>
                  </p>
                  <p className="text-zinc-300 italic">"{customRequirements}"</p>
                </div>
              )}

              {/* Price & Add to Cart Button */}
              <div className="pt-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-zinc-400">Total Bespoke Price:</span>
                  <span className="font-serif text-3xl font-black text-gold-300">
                    ₹{selectedBox.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addedSuccess}
                  className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center space-x-2 ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 hover:from-gold-300 hover:to-amber-500 text-cocoa-950 hover:shadow-gold-500/25'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>Custom Box Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-cocoa-950" />
                      <span>Add Bespoke Box to Cart</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-zinc-400 flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ships in Insulated Cold-Box with 16°C Temperature Guarantee</span>
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
