# StreetWifi

A simple WiFi payment system for businesses to sell internet access using M-Pesa payments.

## Features

- User-friendly login for customers
- Admin dashboard for managing routers and monitoring payments
- M-Pesa integration via PayHero
- Captive portal for WiFi access control
- Real-time session management

## Quick Start

### Backend
```bash
cd server
npm install
# Set up .env with MONGODB_URI and other configs
npm run dev
```

### Frontend
```bash
cd client
npm install
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

## Deployment

- **Backend**: Deploy to Render/Railway with `npm start`
- **Frontend**: Deploy to Vercel with `VITE_API_URL` set to your backend URL + `/api`

## Usage

1. Create admin account via database seeding
2. Add routers in admin dashboard
3. Configure router captive portal to redirect to portal URLs
4. Customers connect to WiFi and purchase access

If you want, I can now:
- Remove leftover developer logs and run a linter pass
- Prepare a short deployment checklist for Render and Vercel (I already added quick guides)
- Help you run an end-to-end test with a local router emulator

Contact / support
- If you need help running or deploying this app, tell me which environment you plan to use and I will provide step-by-step instructions.

---

HolyTech Ltd — StreetWifi team
