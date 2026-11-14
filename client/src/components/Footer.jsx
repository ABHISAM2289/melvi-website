import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Snowflake, Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-cocoa-950 border-t border-gold-500/30 text-gold-100/80 pt-16 pb-12 relative overflow-hidden">
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-gold-500/10 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gold-500/15">
          
          {/* Brand Story Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 p-[1.5px]">
                <div className="w-full h-full bg-cocoa-950 rounded-full flex items-center justify-center">
                  <span className="text-xl font-serif font-black text-gold-300">M</span>
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl tracking-[0.25em] font-bold text-gold-200 uppercase">
                  MELVI
                </span>
                <p className="text-[9px] tracking-[0.35em] text-gold-400/80 uppercase font-sans -mt-1">
                  Haute Chocolaterie
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              "A Touch of Elegance • Temptingly Crafted". Handcrafted gourmet chocolates, bespoke gift ballotins with personal customer notes, and melt-proof cold-chain courier delivery.
            </p>

            <div className="flex items-center space-x-2 text-xs text-cyan-300 bg-cyan-950/60 p-2.5 rounded-xl border border-cyan-500/30 w-fit">
              <Snowflake className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Zero-Melt 16°C Cold-Chain Delivery Guarantee</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
              The Collections
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-gold-300 transition-colors">
                  Signature 12-Piece Boxes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-gold-300 transition-colors">
                  Candied Orange & Gold Bonbons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-gold-300 transition-colors">
                  Kashmiri Saffron Ganache
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customizer')} className="hover:text-gold-300 transition-colors">
                  Bespoke Box Atelier
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-gold-300 transition-colors">
                  Live Order Tracker
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
              Contact & Atelier Concierge
            </h4>
            
            <div className="space-y-2.5 text-zinc-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>
                  Melvi Chocolatier Atelier & Boutique, Ground Floor, Luxury Arcade, Bandra West, Mumbai 400050, India
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="font-mono text-gold-200">+91 98765 43210</span>
                <span className="text-[10px] text-zinc-500">(10 AM - 9 PM)</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-300 text-emerald-400 font-semibold underline underline-offset-2"
                >
                  WhatsApp Gifting Concierge
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="font-mono text-zinc-300">concierge@melvi.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Melvi Chocolatier. All rights reserved. Handcrafted with passion.</p>
          
          <div className="flex items-center space-x-6">
            <span>FSSAI Lic. No. 11524999000123</span>
            <span>100% Eggless & Gourmet Certified</span>
            <span>Cold-Chain Express Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
