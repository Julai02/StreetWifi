# StreetWifi — simple explanation

StreetWifi is an app that lets businesses sell short-term WiFi access to customers. For example, a shop or cafe can offer internet time that a customer pays for using M‑Pesa (PayHero); after payment the customer's device gets online for the number of hours they bought.

Key ideas (in plain language)
- The WiFi is controlled by a small web app and a captive portal page. When someone connects to the local WiFi, they are redirected to the portal where they choose how long to buy (1–24 hours) and pay.
- Payments use PayHero (M‑Pesa). When payment succeeds the server creates a session that allows the device to use the internet for the purchased time.
- An admin dashboard lets the business owner add and manage routers, see active sessions, and view payments and revenue.

Who this is for
- Small businesses, guest WiFi providers, and network operators who want a simple pay-to-use WiFi system integrated with M‑Pesa.

Quick start (developer / tester)
1. Install prerequisites: Node.js (v16+), npm, and a MongoDB instance (Atlas or local).
2. Start the backend:
   ```bash
   cd server
   npm install
   cp .env.example .env    # then edit .env with your MongoDB and PayHero values
   npm run dev
   ```
   Backend default: http://localhost:5000

3. Start the frontend:
   ```bash
   cd client
   npm install
   # set VITE_API_URL in client/.env to http://localhost:5000/api
   npm run dev
   ```
   Frontend default: http://localhost:5173

Create an admin user (local test)
- Use the script: `node server/scripts/createAdmin.js` and follow the prompts to create the first admin account. Then go to `/admin/login` in the browser.

How to test with a router (basic)
1. Add a router entry in the Admin → Routers tab. The router record creates a `portalUrl` like `/portal.html?mac=AA:BB:...`.
2. Host the captive portal page (`client/public/portal.html`) on your client site (it is served by the built frontend). Make sure the portal page URL is reachable from devices.
3. Configure your router or captive portal (CoovaChilli/OpenWRT) to redirect unauthenticated devices to the router's `portalUrl`.
4. Connect a device to the WiFi and open a browser — you should be redirected to the portal and able to purchase time.

Deployment notes (short)
- The backend is a standard Node.js/Express app and is suitable for Render, Railway, DigitalOcean, or similar. Use `npm start` in production.
- The frontend is a Vite-built static site and is suitable for Vercel, Netlify, or Render Static Sites. Set `VITE_API_URL` to the production API base.

Where to look in the code
- Backend API routes: `server/routes/*`
- Backend controllers/models: `server/controllers/*`, `server/models/*`
- Frontend admin pages: `client/src/admin/*`
- Captive portal page: `client/public/portal.html`

If you want, I can now:
- Remove leftover developer logs and run a linter pass
- Prepare a short deployment checklist for Render and Vercel (I already added quick guides)
- Help you run an end-to-end test with a local router emulator

Contact / support
- If you need help running or deploying this app, tell me which environment you plan to use and I will provide step-by-step instructions.

---

HolyTech Ltd — StreetWifi team
