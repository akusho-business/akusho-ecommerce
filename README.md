# AKUSHO - Premium Anime Collectibles E-Commerce

An anime-inspired, cyberpunk-themed e-commerce website built with Next.js 14, React, Tailwind CSS, and Framer Motion.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Navigate to project folder:**
```bash
cd akusho-ecommerce
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
```
http://localhost:3000
```

## 📁 Project Structure

```
akusho-ecommerce/
├── app/
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── shop/
│   │   └── page.tsx         # Shop page with filters
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx     # Dynamic product page
│   ├── about/
│   │   └── page.tsx         # About page
│   ├── contact/
│   │   └── page.tsx         # Contact page
│   └── cart/
│       └── page.tsx         # Cart page
├── components/
│   ├── index.ts             # Component exports
│   ├── Navbar.tsx           # Navigation bar
│   ├── Hero.tsx             # Hero section with particles
│   ├── Footer.tsx           # Footer component
│   ├── ProductCard.tsx      # Product card with hover effects
│   ├── ProductGrid.tsx      # Responsive product grid
│   ├── Button.tsx           # Neon button component
│   ├── NeonText.tsx         # Animated neon text
│   ├── SectionHeader.tsx    # Section headers
│   ├── AnimeGlowWrapper.tsx # Glow effect wrapper
│   └── ParticlesBackground.tsx # tsParticles background
├── context/
│   └── CartContext.tsx      # Cart state management
├── data/
│   └── products.ts          # Product data
├── types/
│   └── index.ts             # TypeScript interfaces
├── public/
│   ├── hero-eyes.webp       # ← Add your hero image here
│   ├── products/            # ← Add product images here
│   │   ├── gojo.webp
│   │   ├── tanjiro.webp
│   │   ├── luffy.webp
│   │   └── ...
│   └── collections/         # ← Add collection images here
│       ├── jjk.webp
│       ├── ds.webp
│       └── ...
├── tailwind.config.ts       # Tailwind + AKUSHO theme
├── tsconfig.json            # TypeScript config
├── next.config.js           # Next.js config
└── package.json             # Dependencies
```

## 🎨 Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Neon Blue | `#00A8FF` | Primary accent, CTAs, highlights |
| Neon Dark | `#0052A3` | Secondary accent, shadows |
| Dark | `#0A0F1F` | Card backgrounds |
| Darker | `#05070D` | Section backgrounds |
| Deepest | `#02060F` | Main background |

## 🖼️ Adding Your Images

### Hero Image
1. Create/download an anime eyes close-up image
2. Save as `/public/hero-eyes.webp`
3. Uncomment the Image component in `components/Hero.tsx`

### Product Images
1. Add images to `/public/products/`
2. Name them to match the data in `data/products.ts`
3. Uncomment Image components in `ProductCard.tsx` and product page

### Collection Images
1. Add to `/public/collections/`
2. Update paths in `data/products.ts`

### Recommended Image Sizes
- Hero: 1920x1080px
- Products: 800x800px (square)
- Collections: 800x1000px (4:5 ratio)

## 🎬 Animations Used

- **Fade-in on scroll** - Content reveals as you scroll
- **Navbar slide** - Smooth entrance animation
- **Neon pulse** - Hero text glowing effect
- **Card hover** - Scale + glow on product cards
- **Parallax** - Hero image moves on scroll
- **Button glow** - Sweep effect on hover

## 🔧 Customization

### Adding Products
Edit `data/products.ts`:
```typescript
{
  id: 9,
  name: "Your Product Name",
  price: 1499,
  image: "/products/your-image.webp",
  description: "Product description",
  category: "Figures"
}
```

### Changing Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  akusho: {
    neon: "#YOUR_COLOR",
    // ...
  }
}
```

### Adding Pages
1. Create folder in `/app`
2. Add `page.tsx`
3. Update navigation in `Navbar.tsx`

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Deploy automatically

Or use CLI:
```bash
npm i -g vercel
vercel
```

## ⚡ Performance Tips

1. **Optimize images** - Use WebP format, compress with tools like Squoosh
2. **Lazy load** - Below-fold images load on demand
3. **Minimize JS** - Production build is optimized
4. **Use CDN** - Vercel handles this automatically

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| next | Framework |
| react | UI library |
| framer-motion | Animations |
| @tsparticles/react | Particle effects |
| lucide-react | Icons |
| tailwindcss | Styling |
| typescript | Type safety |

## 🔮 Future Improvements

- [ ] Connect to Supabase for real products
- [ ] Add Sanity CMS for content
- [ ] Implement checkout with Stripe
- [ ] Add user authentication
- [ ] Add wishlist functionality
- [ ] Implement search
- [ ] Add product reviews

## 📄 License

MIT License - Feel free to use for your projects!

---

Built with 💙 for anime fans everywhere.
