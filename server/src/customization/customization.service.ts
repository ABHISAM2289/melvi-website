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
      flavors: []
    };
  }
}
