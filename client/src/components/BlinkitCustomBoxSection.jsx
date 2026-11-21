import React, { useState, useRef } from 'react';
import { Sparkles, Check, ShoppingBag, ShieldCheck, Wand2, RotateCcw } from 'lucide-react';

const BONBON_STYLES = [
  { a: '#3b1a0f', b: '#8a2c3e', shape: 'dome', finish: 'gold' },
  { a: '#8a5530', b: '#d9a066', shape: 'sq', finish: 'stripe' },
  { a: '#b83a62', b: '#f08aa6', shape: 'round', finish: 'dot' },
  { a: '#7a4a26', b: '#d09a5c', shape: 'shell', finish: 'nut' },
  { a: '#4d1f24', b: '#e8b765', shape: 'round', finish: 'gold' },
  { a: '#6b7f3e', b: '#c8d98a', shape: 'sq', finish: 'nut' },
  { a: '#2c150c', b: '#6b4630', shape: 'dome', finish: 'stripe' },
  { a: '#a84a12', b: '#ffb55a', shape: 'round', finish: 'stripe' },
];

function getBonbonStyle(name = '', index = 0) {
  const lower = name.toLowerCase();
  if (lower.includes('pistachio') || lower.includes('kunafa') || lower.includes('matcha')) {
    return { a: '#5e7332', b: '#c5d886', shape: 'sq', finish: 'gold' };
  }
  if (lower.includes('strawberry') || lower.includes('ruby') || lower.includes('raspberry') || lower.includes('berry')) {
    return { a: '#a8284e', b: '#f28aa8', shape: 'round', finish: 'dot' };
  }
  if (lower.includes('hazelnut') || lower.includes('almond') || lower.includes('praline') || lower.includes('nut')) {
    return { a: '#6e3f1d', b: '#cf985a', shape: 'shell', finish: 'nut' };
  }
  if (lower.includes('caramel') || lower.includes('orange') || lower.includes('saffron')) {
    return { a: '#8a4f22', b: '#e8b765', shape: 'dome', finish: 'stripe' };
  }
  return BONBON_STYLES[index % BONBON_STYLES.length];
}

export default function BlinkitCustomBoxSection({ onAddCustomBoxToCart, availableProducts = [] }) {
  const boxSizes = [
    { id: 'box-6', name: '6-Piece Petite Box', slots: 6, cols: 3, price: 999, image: '/images/chocolates/choco-2.jpg' },
    { id: 'box-12', name: '12-Piece Signature Box', slots: 12, cols: 4, price: 1899, image: '/images/melvi-founder-box.jpg', popular: true },
    { id: 'box-24', name: '24-Piece Grand Box', slots: 24, cols: 6, price: 3499, image: '/images/melvi-founder-box.jpg' },
  ];

  // Dynamically derive flavor chips from live PostgreSQL catalog confections (only in-stock items)
  const flavorOptions = availableProducts
    .filter(p => p.inStock !== false)
    .map((p, idx) => ({
      id: p.id,
      name: p.name,
      tag: p.badge || (p.tags && p.tags[0]) || p.category || 'Confection',
      image: p.image,
      bonbon: getBonbonStyle(p.name, idx),
    }));

  const [selectedBox, setSelectedBox] = useState(boxSizes[1]); // Default to 12-piece
  // Array of placed chocolate items inside the box tray (up to selectedBox.slots)
  const [boxPieces, setBoxPieces] = useState([]);
  const [lastDroppedSlot, setLastDroppedSlot] = useState(-1);
  const [boxFullNotice, setBoxFullNotice] = useState(false);

  // 3D pointer tilt state for the interactive tray
  const [trayTilt, setTrayTilt] = useState({ rx: 0, ry: 0 });
  const trayRef = useRef(null);

  // Custom Customer Requirements & Notes Space
  const [customerRequirements, setCustomerRequirements] = useState('');
  const [added, setAdded] = useState(false);

  const handleSelectBoxSize = (box) => {
    setSelectedBox(box);
    setBoxPieces(prev => prev.slice(0, box.slots));
    setLastDroppedSlot(-1);
    setBoxFullNotice(false);
  };

  // Drop a flavor piece into the first empty slot in the tray
  const handleDropFlavor = (flavor) => {
    if (boxPieces.length >= selectedBox.slots) {
      setBoxFullNotice(true);
      setTimeout(() => setBoxFullNotice(false), 2200);
      return;
    }
    const piece = {
      uid: `${flavor.id}-${Date.now()}-${Math.random()}`,
      id: flavor.id,
      name: flavor.name,
      tag: flavor.tag,
      bonbon: flavor.bonbon,
    };
    const nextIdx = boxPieces.length;
    setBoxPieces(prev => [...prev, piece]);
    setLastDroppedSlot(nextIdx);
  };

  // Remove a piece when tapping a filled cup in the tray
  const handleRemovePieceAt = (slotIdx) => {
    if (slotIdx < 0 || slotIdx >= boxPieces.length) return;
    setBoxPieces(prev => prev.filter((_, idx) => idx !== slotIdx));
    setLastDroppedSlot(-1);
    setBoxFullNotice(false);
  };

  // Auto-fill remaining empty slots in the tray with staggered drop animation
  const handleFillForMe = () => {
    if (flavorOptions.length === 0) return;
    const currentLen = boxPieces.length;
    const needed = selectedBox.slots - currentLen;
    if (needed <= 0) {
      // If already full, remix the box
      const remixed = Array.from({ length: selectedBox.slots }, (_, idx) => {
        const pick = flavorOptions[(idx + Math.floor(Math.random() * flavorOptions.length)) % flavorOptions.length];
        return {
          uid: `${pick.id}-${Date.now()}-${idx}`,
          id: pick.id,
          name: pick.name,
          tag: pick.tag,
          bonbon: pick.bonbon,
        };
      });
      setBoxPieces(remixed);
      setLastDroppedSlot(selectedBox.slots - 1);
      return;
    }

    const toAdd = Array.from({ length: needed }, (_, idx) => {
      const pick = flavorOptions[(currentLen + idx) % flavorOptions.length];
      return {
        uid: `${pick.id}-${Date.now()}-${idx}`,
        id: pick.id,
        name: pick.name,
        tag: pick.tag,
        bonbon: pick.bonbon,
      };
    });
    setBoxPieces(prev => [...prev, ...toAdd]);
    setLastDroppedSlot(selectedBox.slots - 1);
  };

  const handleClearBox = () => {
    setBoxPieces([]);
    setLastDroppedSlot(-1);
    setBoxFullNotice(false);
  };

  const handleTrayPointerMove = (e) => {
    if (!trayRef.current) return;
    const rect = trayRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = 0.5 - (e.clientY - rect.top) / rect.height;
    setTrayTilt({
      ry: Number((nx * 16).toFixed(1)),
      rx: Number((ny * 12).toFixed(1)),
    });
  };

  const handleTrayPointerLeave = () => {
    setTrayTilt({ rx: 0, ry: 0 });
  };

  const handleAddPresetNote = (note) => {
    if (!customerRequirements.includes(note)) {
      setCustomerRequirements(prev => prev ? `${prev} • ${note}` : note);
    }
  };

  // Summarize selected flavors with quantities (e.g., "Strawberry Bar ×6, Pistachio Bar ×6")
  const getFlavorSummaryList = () => {
    const counts = {};
    boxPieces.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => (count > 1 ? `${name} ×${count}` : name));
  };

  const handleAddToCart = () => {
    const flavorSummary = getFlavorSummaryList();
    const item = {
      id: `custom-box-${Date.now()}`,
      name: `Custom ${selectedBox.name}`,
      tagline: boxPieces.length > 0
        ? `${boxPieces.length}/${selectedBox.slots} Pieces Curated (${flavorSummary.join(', ')})`
        : `${selectedBox.slots} Pieces Atelier Assortment`,
      price: selectedBox.price,
      quantity: 1,
      image: selectedBox.image,
      category: 'bespoke',
      customNotes: customerRequirements,
      customSpecs: {
        boxSize: selectedBox.name,
        flavors: flavorSummary,
        totalPieces: boxPieces.length,
      }
    };

    onAddCustomBoxToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const remainingSlots = Math.max(0, selectedBox.slots - boxPieces.length);

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
              Select your box size, tap flavors to drop them into your chocolate box, and tap any piece in the tray to remove it.
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
          
          {/* Left Column: Box Selection, Flavor Palette & Notes */}
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
                    type="button"
                    onClick={() => handleSelectBoxSize(box)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
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

            {/* 2. Choose Flavors to Drop Into Tray */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  2. Select Preferred Flavors (Tap to Drop into Box):
                </label>

                {flavorOptions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleFillForMe}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200/80 text-amber-900 transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-amber-700" />
                      <span>Fill it for me</span>
                    </button>
                    {boxPieces.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearBox}
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {flavorOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {flavorOptions.map(flavor => {
                    const countInBox = boxPieces.filter(p => p.id === flavor.id).length;
                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        onClick={() => handleDropFlavor(flavor)}
                        className={`p-2.5 pr-3.5 rounded-full border text-left flex items-center space-x-3 transition-all duration-200 cursor-pointer group ${
                          countInBox > 0
                            ? 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-2xs hover:translate-x-1'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50/30 hover:translate-x-1'
                        }`}
                      >
                        {/* 3D Sculpted Bonbon Preview Icon */}
                        <span className="w-10 h-10 shrink-0 block">
                          <span
                            className={`melvi-pc ${flavor.bonbon.shape} ${flavor.bonbon.finish}`}
                            style={{
                              '--choco-a': flavor.bonbon.a,
                              '--choco-b': flavor.bonbon.b,
                            }}
                          />
                        </span>

                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-zinc-900 truncate">{flavor.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{flavor.tag}</p>
                        </div>

                        {countInBox > 0 ? (
                          <span className="text-xs font-black font-serif text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full shrink-0">
                            ×{countInBox}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 opacity-70 group-hover:opacity-100 shrink-0">
                            + Drop
                          </span>
                        )}
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
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  🌿 100% Eggless
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('Emboss Initials with Gold Leaf')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  ✨ Gold Initials
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('Nut Allergy Safe')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  ⚠️ Nut-Safe
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetNote('Write "Happy Anniversary" Card')}
                  className="text-xs bg-white hover:bg-amber-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
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

          {/* Right Column: Interactive 3D Chocolate Box Tray & Instant Add to Cart */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            <div className="rounded-3xl p-5 sm:p-6 border border-amber-200/90 bg-gradient-to-b from-[#faf6ee] to-[#f3ead8] shadow-inner flex flex-col justify-between relative overflow-hidden">
              {/* Top Tray Status Bar */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-zinc-800 shadow-2xs border border-amber-200/60">
                  {selectedBox.name}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  remainingSlots === 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100/90 text-amber-900 border border-amber-300/60'
                }`}>
                  {boxPieces.length} / {selectedBox.slots} Pieces
                </span>
              </div>

              {/* Interactive 3D Wooden/Cocoa Chocolate Box Tray */}
              <div
                ref={trayRef}
                onPointerMove={handleTrayPointerMove}
                onPointerLeave={handleTrayPointerLeave}
                className="melvi-tray-wrap my-2"
              >
                <div
                  className="melvi-tray"
                  style={{
                    gridTemplateColumns: `repeat(${selectedBox.cols}, minmax(0, 1fr))`,
                    gap: selectedBox.slots === 24 ? '8px' : '12px',
                    padding: selectedBox.slots === 24 ? '14px' : '20px',
                    '--tray-rx': `${trayTilt.rx}deg`,
                    '--tray-ry': `${trayTilt.ry}deg`,
                  }}
                >
                  {Array.from({ length: selectedBox.slots }).map((_, idx) => {
                    const piece = boxPieces[idx];
                    const isNewDrop = idx === lastDroppedSlot;
                    return (
                      <div
                        key={piece ? piece.uid : `empty-cup-${idx}`}
                        onClick={() => piece && handleRemovePieceAt(idx)}
                        title={piece ? `Remove ${piece.name}` : `Empty slot ${idx + 1}`}
                        className="melvi-cup"
                      >
                        {piece && (
                          <div className={`melvi-cup-in ${isNewDrop ? 'is-new' : ''}`}>
                            <span
                              className={`melvi-pc ${piece.bonbon.shape} ${piece.bonbon.finish}`}
                              style={{
                                '--choco-a': piece.bonbon.a,
                                '--choco-b': piece.bonbon.b,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Helper caption under tray */}
              <div className="text-center mt-2">
                {boxFullNotice ? (
                  <p className="text-xs font-bold text-amber-800 animate-pulse">
                    Box is full! Tap a chocolate in the tray to remove it or choose a larger box.
                  </p>
                ) : boxPieces.length === 0 ? (
                  <p className="text-[11px] text-zinc-500">
                    Tap any flavor on the left (or <button type="button" onClick={handleFillForMe} className="underline font-bold text-amber-800 cursor-pointer">Fill it for me</button>) to drop chocolates into the tray.
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-600">
                    {remainingSlots > 0
                      ? `Pick ${remainingSlots} more piece${remainingSlots > 1 ? 's' : ''} • Tap any piece in the tray to take it out`
                      : 'Box complete! Tap any piece in the tray to swap it out.'}
                  </p>
                )}
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
              type="button"
              onClick={handleAddToCart}
              disabled={added}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer ${
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
                  <span>
                    Add Custom Box to Cart • ₹{selectedBox.price.toLocaleString()}
                  </span>
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
