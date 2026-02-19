# fast-track Railway Deployment Guide

Since Render is asking for a card, Railway is a great alternative (and often faster).

## Step 1: Login & Create Project
1.  Go to [Railway.app](https://railway.app/).
2.  Login with GitHub.
3.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
4.  Select your `custconnect-monorepo`.

## Step 2: Configure Service (CRITICAL)
Railway will try to auto-detect things. We need to override them for the backend.

1.  Click on the new service box that appears.
2.  Go to **"Settings"**.
3.  Scroll down to **"Root Directory"**.
4.  Enter: `backend`
    *   *(This tells Railway to ignore the frontend folder)*.
5.  **Build Command**: `npm install && npm run build`
6.  **Start Command**: `npm start`

## Step 3: Environment Variables
1.  Go to the **"Variables"** tab.
2.  Click **"Raw Editor"** (looks like a pencil or "RAW" button).
3.  Paste the following block exactly as is:

```properties
DATABASE_URL=mysql://4RW1vRahFW8cEm9.root:KwWC3ZQPfRYyQRvV@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
SMTP_EMAIL=spotifyuser725@gmail.com
SMTP_PASS=uyvjwmpmliocrcgy
EMAIL_FROM=CustConnect <noreply@custconnect.com>
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://custconnect.vercel.app
SOCKET_CORS_ORIGIN=https://custconnect.vercel.app
```

4.  Click **"Update Variables"** (or Save).

## Step 4: Generate Domain (Public URL)
Unlike Render, Railway doesn't give you a URL by default. You have to ask for one.

1.  Go to the **"Settings"** tab.
2.  Scroll down to **"Networking"** or **"Public Networking"**.
3.  Click **"Generate Domain"**.
4.  It will create a URL like `custconnect-production.up.railway.app`.
5.  **Copy this URL**.

## Step 5: Update Vercel
Once Railway is "Active" (Green) and you have your URL:

1.  Go to Vercel -> Settings -> Environment Variables.
2.  Update `NEXT_PUBLIC_API_URL` to `https://<YOUR-RAILWAY-URL>/api`
3.  Update `NEXT_PUBLIC_SOCKET_URL` to `https://<YOUR-RAILWAY-URL>`
4.  **Redeploy** Vercel.
