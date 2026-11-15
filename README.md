# Melvi Chocolatier — Full-Stack Application

> *"The Signature of Premium Sweetness • Haute Chocolaterie"*
> Officially Trademark Registered TM

A full-stack, quick-commerce online chocolate store website built with **NestJS**, **React (Vite + Tailwind CSS)**, and **PostgreSQL on Docker Desktop**.

---

## Architecture Overview

```
melvi website/
├── docker-compose.yml          # PostgreSQL 17 container on port 5434
├── server/                     # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # JWT & bcrypt Authentication (Username/Email + Password)
│   │   ├── catalog/           # Main Catalog & Cloudflare R2 / Database Image Upload
│   │   ├── customization/     # Bespoke Boxes & Customer Notes Configuration
│   │   ├── orders/            # Orders, Customer Order History & Package Tracking
│   │   ├── payment/           # Payment Gateway Intent & Verification Simulator
│   │   ├── database/          # PostgreSQL Connection Pool & Schema Init
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
└── client/                     # React Frontend (Blinkit / Instamart style UX)
    ├── public/images/
    │   └── melvi-official-logo.jpg   # Official Trademark Logo
    ├── src/
    │   ├── components/
    │   │   ├── AnimatedEntryLoginPage.jsx  # Aesthetic Entry with Canvas animation
    │   │   ├── ChocolateCanvasAnimation.jsx # Interactive 3D gemstone canvas animation
    │   │   ├── PlatformAdminDashboard.jsx  # Add/Remove products & Manual Tracking
    │   │   ├── BlinkitHeader.jsx           # Location pill, search, My Orders, Cart
    │   │   ├── BlinkitBanners.jsx          # Promo banners & coupon codes
    │   │   ├── BlinkitProductGrid.jsx      # Confection cards with "+ ADD" counter
    │   │   ├── BlinkitCustomBoxSection.jsx # Custom box builder with Note Space
    │   │   ├── BlinkitOrderTracker.jsx     # Live 16°C cold-chain package tracker
    │   │   ├── OrderHistoryModal.jsx       # Customer Past Orders & Tracking
    │   │   ├── CheckoutModal.jsx           # Payment Gateway (Card, UPI QR, COD)
    │   │   ├── CartDrawer.jsx              # Slide-in cart with promo discounts
    │   │   └── BlinkitFooter.jsx           # Atelier address, WhatsApp concierge
    │   ├── App.jsx
    │   └── index.css
    └── package.json
```

---

## Quick Start Guide

### 1. Database (Docker Desktop)
The PostgreSQL database runs in Docker Desktop:
```bash
docker compose up -d
```
* **Port:** `5434` (mapped from container `5432`)
* **Database:** `melvi_db`
* **User:** `melvi_user`
* **Password:** `melvipassword123`

### 2. Backend (NestJS)
```bash
cd server
npm install
npm run build
npm start
```
* **API Root:** `http://127.0.0.1:3001/api`
* The database provisions the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 16 characters). Set these in the terminal before starting the server; registration only creates customer accounts.

### 3. Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
* **Store URL:** `http://localhost:5173`

---

## Client Review Deployment

The app has a Vite/React frontend and a separate NestJS/PostgreSQL backend. Vercel can host the frontend; deploy the API and PostgreSQL on a Node host and managed PostgreSQL provider.

### Vercel frontend

1. Import the GitHub repository into Vercel and set **Root Directory** to `client`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `VITE_API_URL` to the backend origin, without a trailing slash or `/api` (for example, `https://your-api.example.com`).
4. Deploy and note the resulting Vercel origin.

The `client/vercel.json` file keeps the `/admin` and `/store` client-side routes working after refresh.

### API and database

Deploy `server` as a Node.js service and attach a persistent PostgreSQL database. Configure the variables listed in [`server/.env.example`](./server/.env.example) in the hosting provider; do not use the local Docker credentials from `docker-compose.yml` in a hosted environment.

- Set `DATABASE_URL` to the managed database connection string and `DB_SSL=true` only when the database provider requires TLS.
- Set `JWT_SECRET` to a unique random value of at least 32 characters.
- Set `ADMIN_EMAIL` and a private `ADMIN_PASSWORD` of at least 16 characters. The admin account is provisioned from these variables; public registration always creates customer accounts.
- Set `CORS_ORIGINS` to the exact Vercel origin. If you add a custom domain, include that origin as well.
- The database initializes its schema and sample catalog on first startup.

The checkout payment flow is a **simulator** and does not charge a card or process real payments. Use this deployment only for client review, not live sales.

---

## Key Features

1. **Animated Entryway & Real Authentication**:
   * Canvas background animation with floating 3D faceted chocolate gemstones, golden stars, and mouse gravity.
   * Official Melvi Trademark Logo featured prominently.
   * Register with Full Name, **Unique `@username`**, Email, **Password**, and Phone.
   * Sign In using **either Email or Username** + **Password**.
   * Secure JWT token signing and bcrypt password hashing.

2. **Platform Admin Portal**:
   * Add new confections to the live catalog.
   * Upload confection images directly from your computer (stored in PostgreSQL).
   * 1-Click remove/delete products from the catalog.
   * Manage custom orders and manually advance package tracking stages.

3. **Blinkit / Instamart Style Customer Experience**:
   * Fast category navigation and instant search.
   * Confection cards with interactive `+ ADD` and `[-] 1 [+]` quantity counters.
   * Custom Box Atelier with dedicated **Customer Requirements Note Space** (for eggless alerts, custom gold initials, and handwritten gift notes).
   * Live 16°C cold-chain package tracking.
   * Customer **Order History** drawer with past orders recap and 1-click live tracking.
   * Multi-method payment gateway simulator with celebration confetti.
