# Deployment Fix Guide for CustConnect

## 1. Fix the "404 NOT_FOUND" Error on Vercel

The reason for the 404 error is that Vercel is looking for your website in the main folder, but your Next.js app is inside the `frontend` folder.

**Steps to fix:**
1.  Go to your **Vercel Dashboard**.
2.  Click on your **CustConnect** project.
3.  Go to **Settings** (top menu) -> **General**.
4.  Find the **Root Directory** section.
5.  Click **Edit** and select the `frontend` folder from the list.
6.  Click **Save**.
7.  Go to the **Deployments** tab and **Redeploy** the latest commit.

## 2. Deploy your Backend (API)

Your backend is currently only running on your laptop (`localhost:5000`). The live website cannot connect to your laptop. You must host the backend online.

**Recommended Free Host: Render.com**

1.  Create an account on [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Important:** In the settings:
    *   **Root Directory:** `backend`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  Add your Environment Variables (copy from `backend/.env`):
    *   `DATABASE_URL` (Your database must be online, e.g., TiDB, PlanetScale, or Supabase. **Local MySQL won't work!**)
    *   `JWT_SECRET`
    *   `SMTP_EMAIL` & `SMTP_PASS`
    *   `node_env`: `production`
6.  Click **Create Web Service**.
7.  Copy the URL Render gives you (e.g., `https://custconnect-backend.onrender.com`).

## 3. Connect Frontend to Backend

Once your backend is live:

1.  Go back to **Vercel Dashboard** -> **Settings** -> **Environment Variables**.
2.  Add a new variable:
    *   **Key:** `NEXT_PUBLIC_API_URL`
    *   **Value:** `https://your-backend-url.onrender.com/api` (Make sure to add `/api` at the end if your routes need it).
3.  Add another variable for Sockets (if separate):
    *   **Key:** `NEXT_PUBLIC_SOCKET_URL`
    *   **Value:** `https://your-backend-url.onrender.com`
4.  **Redeploy** your Frontend on Vercel one last time.

## 4. Database Warning

If your `DATABASE_URL` in the backend points to `localhost` or `127.0.0.1`, **it will fail on Render/Railway**. You need a cloud database.
*   **Recommended:** [TiDB Cloud](https://tidbcloud.com) (MySQL compatible, free tier).
*   Create a cluster, get the connection string, and use that as your `DATABASE_URL` in Render.

---
**Summary Checklist:**
- [ ] Vercel Root Directory set to `frontend`.
- [ ] Backend deployed to Render (Root Directory: `backend`).
- [ ] Database migrated to Cloud (TiDB/Supabase).
- [ ] Vercel Environment Variables (`NEXT_PUBLIC_API_URL`) updated.
