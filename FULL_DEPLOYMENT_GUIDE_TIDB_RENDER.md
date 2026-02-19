# Step-by-Step Deployment Guide (TiDB + Render + Vercel)

Follow these steps exactly to deploy your Frontend to Vercel and Backend to Render with a TiDB database.

---

## Part 1: Set up TiDB Cloud Database
1.  **Sign Up/Login**: Go to [TiDB Cloud](https://tidbcloud.com/) and sign up.
2.  **Create a Cluster**: Click **"Create Cluster"**. Select **"Serverless"** (it's free).
3.  **Get Connection String**:
    *   Once created, click **"Connect"**.
    *   Select **"Connect with Prisma"** if available, or just "General".
    *   **IMPORTANT**: Click "Generate Password" if needed.
    *   Copy the URL. It looks like:
        `mysql://<username>:<password>@<host>:4000/custconnect?sslaccept=strict`
4.  **Save this URL**. You will need it for both Render and your local machine.

## Part 2: Deploy Backend to Render
1.  **Sign Up/Login**: Go to [Render.com](https://render.com/).
2.  **New Web Service**: Click **"New +"** -> **"Web Service"**.
3.  **Connect GitHub**: Select your `custconnect-monorepo` repository.
4.  **Configure Settings**:
    *   **Name**: `custconnect-backend`
    *   **Region**: Pick the one closest to you.
    *   **Root Directory**: `backend` (This is CRITICAL. Do not leave blank).
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free`
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these:
    *   `DATABASE_URL`: (Paste your TiDB connection string from Part 1)
    *   `JWT_SECRET`: `your-super-secret-jwt-key-change-in-production` (or generate a random string)
    *   `SMTP_EMAIL`: `spotifyuser725@gmail.com`
    *   `SMTP_PASS`: `uyvjwmpmliocrcgy`
    *   `EMAIL_FROM`: `CustConnect <noreply@custconnect.com>`
    *   `NODE_ENV`: `production`
    *   `Acccept_SSL`: `true` (if TiDB requires it, usually handled in connection string)
6.  **Deploy**: Click **"Create Web Service"**.
7.  **Wait**: It will take a few minutes. Once it says "Live", **copy the URL** (e.g., `https://custconnect-backend.onrender.com`).

## Part 3: Fix Vercel "Root Directory" (The 404 Fix)
1.  **Go to Vercel**: Open your dashboard.
2.  **Select Project**: Click on `custconnect`.
3.  **Settings**: Click the **"Settings"** tab at the top.
4.  **General**: Ensure you are on the **"General"** side menu.
5.  **Locate Root Directory**:
    *   Scroll down to the section named **"Root Directory"**.
    *   It currently probably says `.` or `/`.
6.  **Edit**:
    *   Click the **"Edit"** button next to it.
    *   A file browser will appear. Select the **`frontend`** folder.
    *   Click **"Save"**.

## Part 4: Connect Vercel to Backend
1.  **Environment Variables**:
    *   Still in Vercel Settings, go to **"Environment Variables"** on the left menu.
2.  **Add Variable**:
    *   **Key**: `NEXT_PUBLIC_API_URL`
    *   **Value**: `https://your-backend-url-from-step-2.onrender.com/api`
    *   (Make sure to add `/api` at the end!)
3.  **Add Socket Variable**:
    *   **Key**: `NEXT_PUBLIC_SOCKET_URL`
    *   **Value**: `https://your-backend-url-from-step-2.onrender.com`
    *   (No `/api` for this one).
4.  **Redeploy**:
    *   Go to the **"Deployments"** tab.
    *   Click the three dots next to your latest deployment -> **"Redeploy"**.

## Part 5: Initialize the Database
Since your TiDB database is empty, you need to push your schema to it.
1.  **On your Local Machine**:
    *   Open `backend/.env` file.
    *   Temporarily replace `DATABASE_URL` with your **TiDB Connection String**.
2.  **Run Migration**:
    *   Open terminal in `backend` folder.
    *   Run: `npx prisma db push`
    *   (This creates the tables in TiDB).
3.  **Seed Data (Optional)**:
    *   Run: `npm run db:seed`
4.  **Revert Local .env**:
    *   Change `DATABASE_URL` back to `localhost` if you want to keep developing locally.

---
**Done!** Your site should now work with:
- Frontend on Vercel (pointing to `frontend` folder).
- Backend on Render (pointing to `backend` folder).
- Database on TiDB Cloud.
