# Fix 404 Admin Login Error (Vercel → Render)

The 404 means your Vercel frontend can't reach the Render backend API. This is a configuration issue, not a code bug.

## Quick Diagnosis

**Step 1: Check what API URL your frontend is using**
1. Open Vercel site in browser
2. Press `F12` → Console
3. Paste: `console.log(import.meta.env.VITE_API_URL)`
4. If it logs `undefined` or `http://localhost:5000/api`, that's your problem

**Step 2: Check if Render backend is actually running**
1. Copy your Render service URL (e.g., `https://streetwifi-server.onrender.com`)
2. In browser, paste: `https://streetwifi-server.onrender.com/health`
3. If you see JSON response `{"success":true,...}`, backend is live
4. If 404 or connection refused, backend isn't running yet

## Fix: Set VITE_API_URL in Vercel

**If backend is running:**

1. Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables
2. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-render-service-url.onrender.com/api`  
     (replace `your-render-service-url` with your actual Render service name)
   - **Environment:** Production (and Preview if testing)
3. Click "Save"
4. **Redeploy** your Vercel frontend:
   - Go to Deployments tab
   - Click the three dots on latest deployment
   - Select "Redeploy"
   - Wait for build to finish
5. Refresh your app and try login again

**Example:**
- Render URL: `https://streetwifi-server.onrender.com`
- Set `VITE_API_URL` to: `https://streetwifi-server.onrender.com/api`

## If backend is NOT running

Your Render service is likely still stuck trying to connect to MongoDB. Go back to `RENDER_DEPLOYMENT_FIX.md`:
1. Whitelist MongoDB IP on Atlas
2. Redeploy on Render
3. Check Render logs for success message
4. Then come back and set `VITE_API_URL` in Vercel

## Verify the fix works

After redeploy:
1. Go to your Vercel site `/admin/login`
2. Press `F12` → Network tab
3. Try login
4. Look for POST request to `admin/login`
5. Should see response status 200 or 401 (not 404)
6. If 401, login credentials may be wrong; if 200, you'll get redirected to dashboard

## Common mistakes

- ❌ Forgot to redeploy Vercel after setting env var
- ❌ Copied `VITE_API_URL` with trailing slash: `...api/` (should be no trailing slash)
- ❌ Used `http://` instead of `https://`
- ❌ Used old Render URL after redeploy (service URL may have changed)
- ❌ Added env var to "Preview" only, not "Production"

---

**Quick test:**
```javascript
// In browser console at your Vercel site:
fetch('https://your-render-url.onrender.com/api/admin/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'admin123'})
}).then(r => r.json()).then(d => console.log(d))
```

If you get a response (not 404), API connection is working.
