# How to Set "Root Directory" in Vercel

If you cannot find the "Root Directory" setting, it is likely because:
1.  **You are in the Deployment view**, not the Project Settings.
2.  **Or** Vercel did not detect this as a monorepo when you first imported it.

## Option 1: The "Nuclear" Option (Easiest & Most Reliable)
This is the fastest way to fix it if you are stuck.

1.  Go to your Vercel Dashboard.
2.  **Delete** the current `CustConnect` project (Settings -> General -> Scroll to bottom -> Delete).
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your `CustConnect` Git Repository again.
5.  **STOP! Do not click Deploy yet.**
6.  Look for a section called **"Root Directory"** (it has an "Edit" button next to it).
7.  Click **Edit**.
8.  Select `frontend`.
9.  **Now** click Deploy.

## Option 2: Finding the Setting (Visual Guide)
If you don't want to delete the project:

1.  Go to the Vercel Dashboard (shows all your projects).
2.  Click on the **Project Card** for CustConnect (the big box).
3.  Look at the **top menu bar** (Overview, Deployments, Analytics, Logs, Storage, Settings).
4.  Click **Settings**.
5.  On the **left sidebar**, ensure **General** is selected.
6.  The **Root Directory** section is usually the **second** section on the page, right below "Project Name" and "Build & Development Settings".
    *   *Note: If you are looking at a specific "Deployment" page, you won't find it. You must be in the main Project Settings.*

## After Fixing Root Directory
Once you have the frontend deployed (even if it says "Build Error" or "500 Error"), you need to connect it to the backend.

1.  Deploy your `backend` folder to **Render.com** (as explained in the previous guide).
2.  Get the URL from Render (e.g., `https://custconnect-backend.onrender.com`).
3.  Go to Vercel -> Settings -> Environment Variables.
4.  Add `NEXT_PUBLIC_API_URL` = `https://custconnect-backend.onrender.com/api`.
5.  **Redeploy**.
