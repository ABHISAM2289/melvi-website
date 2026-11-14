import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomizationService {
  getCustomizationOptions() {
    return {
      boxSizes: [
        {
          id: 'box-6',
          name: '6-Piece Petite Box',
          slots: 6,
          price: 999,
          badge: 'Gift Choice',
          image: '/images/melvi-bonbons.jpg',
          description: 'Perfect for intimate gifting or a personal artisanal tasting session.'
        },
        {
          id: 'box-12',
          name: '12-Piece Signature Luxury Box',
          slots: 12,
          price: 1899,
          badge: 'Most Popular',
          image: '/images/melvi-founder-box.jpg',
          description: 'Our iconic presentation box as seen with Melvi master chocolatier. Two rows of 6 handcrafted delights.'
        },
        {
          id: 'box-24',
          name: '24-Piece Grand Celebration Box',
          slots: 24,
          price: 3499,
          badge: 'Royal Grandeur',
          image: '/images/melvi-founder-box.jpg',
          description: 'Two-tiered velvet ballotin featuring a curated journey through all of Melvi signature creations.'
        }
      ],
      sleeves: [
        {
          id: 'slv-elegance',
          name: 'A Touch of Elegance',
          subtitle: 'Blush Rose Gold with embossed Melvi seal',
          color: '#e5b29b'
        },
        {
          id: 'slv-tempting',
          name: 'Temptingly Crafted',
          subtitle: 'Deep Cocoa Crimson with hot foil stamp',
          color: '#5c1430'
        },
        {
          id: 'slv-noir',
          name: 'Noir Luxe 24K',
          subtitle: 'Midnight Cocoa with pure gold leaf accents',
          color: '#1a0d08'
        }
      ],
      ribbons: [
        { id: 'rib-gold', name: 'Champagne Silk Gold', hex: '#d4af37' },
        { id: 'rib-rose', name: 'Petal Blush Rose', hex: '#e8a598' },
        { id: 'rib-burgundy', name: 'Velvet Crimson', hex: '#6d1830' },
        { id: 'rib-midnight', name: 'Royal Midnight Navy', hex: '#16233b' }
      ],
      flavors: [
        {
          id: 'flv-orange',
          name: 'Candied Orange Dark Ganache',
          category: 'Dark Ganache',
          cocoa: '70% Valencia',
          image: '/images/melvi-bonbons.jpg',
          accent: 'French Orange Peel & Gold Leaf',
          color: '#d97706'
        },
        {
          id: 'flv-saffron',
          name: 'Kashmiri Saffron Pistachio',
          category: 'Spiced Praline',
          cocoa: '65% Royal Blend',
          image: '/images/melvi-bonbons.jpg',
          accent: 'Kashmiri Mongra Saffron & Pistachio Dust',
          color: '#f59e0b'
        },
        {
          id: 'flv-caramel',
          name: 'Smoked Fleur de Sel Caramel',
          category: 'Liquid Truffle',
          cocoa: '64% Venezuelan',
          image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=400&q=80',
          accent: 'Brittany Sea Salt Flakes',
          color: '#b45309'
        },
        {
          id: 'flv-hazelnut',
          name: 'Roasted Piedmont Gianduja',
          category: 'Crispy Praline',
          cocoa: '54% Milk & Nut',
          image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80',
          accent: 'IGP Piedmont Hazelnut Crunch',
          color: '#92400e'
        },
        {
          id: 'flv-ruby',
          name: 'Raspberry Ruby Heart',
          category: 'Fruit Truffle',
          cocoa: '47% Ruby Cocoa',
          image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80',
          accent: 'Wild Forest Berry Compote',
          color: '#e11d48'
        },
        {
          id: 'flv-espresso',
          name: 'Coorg Single-Estate Espresso',
          category: 'Coffee Dark',
          cocoa: '75% Arabica Infusion',
          image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80',
          accent: 'Slow-Drip Espresso Bean Crunch',
          color: '#451a03'
        }
      ]
    };
  }
}
