import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Snowflake, ShieldCheck } from 'lucide-react';

export default function BlinkitFooter({ onNavigate }) {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-12 py-10 text-xs text-zinc-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-200">

          {/* Brand & Assurance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-500/40 p-1 bg-white flex items-center justify-center shrink-0">
                <img src="/images/melvi-logo-square.png" alt="Melvi Official Trademark Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif font-black text-lg text-amber-950 uppercase">
                  MELVI
                </span>
                <p className="text-[9px] text-[#8c5d19] font-bold uppercase -mt-1 tracking-wider">
                  Trademark Registered TM
                </p>
              </div>
            </div>
            <p className="text-zinc-500 text-xs">
              "The Signature of Premium Sweetness". Handcrafted artisan chocolates delivered in temperature-controlled cold boxes.
            </p>
            <div className="flex items-center space-x-1.5 text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 w-fit">
              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-bold text-[11px]">16°C Cold-Chain Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
              Categories
            </h4>
            <ul className="space-y-1.5 text-zinc-600">
              <li><button onClick={() => onNavigate('chocolate-bites')} className="hover:text-amber-800">Chocolate Bites</button></li>
              <li><button onClick={() => onNavigate('chocolate-bars')} className="hover:text-amber-800">Chocolate Bars</button></li>
              <li><button onClick={() => onNavigate('surprise')} className="hover:text-amber-800">Surprise Drops</button></li>
              <li><button onClick={() => onNavigate('limited-editions')} className="hover:text-amber-800">Limited Editions</button></li>
              <li><button onClick={() => onNavigate('tracking')} className="hover:text-amber-800">Live Package Tracking</button></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
              Contact Details & Melvi Atelier
            </h4>

            <div className="space-y-2 text-zinc-600">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Melvi Chocolatier Boutique, Ground Floor, Luxury Arcade, Bandra West, Mumbai 400050</span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-mono text-zinc-900 font-bold">+91 98765 43210</span>
                <span className="text-zinc-400">(Daily 10:00 AM – 9:00 PM)</span>
              </div>

              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold hover:underline"
                >
                  WhatsApp Gifting Concierge: Chat Now
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span>concierge@melvi.com / orders@melvi.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-zinc-400 gap-2">
          <p>© {new Date().getFullYear()} Melvi Chocolates. All rights reserved.</p>
          <div className="flex space-x-4">
            <span>FSSAI Lic: 11524999000123</span>
            <span>Melt-Proof Courier</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
