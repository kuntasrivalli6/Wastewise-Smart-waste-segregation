# Waste Wise — Production Deployment & Setup Guide

This guide details the step-by-step procedure to deploy Waste Wise across Vercel (static frontend), Render (Express Node.js REST API), and Supabase (PostgreSQL Database & Auth).

---

## 1. Supabase Setup (Database & Auth)

1. Create a free account at [supabase.com](https://supabase.com) and create a new project named `waste-wise`.
2. Under **Project Settings -> API**, copy:
   - `Project URL`
   - `anon / public` key
   - `service_role` private key
3. Open the **SQL Editor** in the Supabase Dashboard:
   - Paste and execute `supabase/migrations/20261028000001_initial_schema.sql`
   - Paste and execute `supabase/migrations/20261028000002_rls_policies.sql`
   - Paste and execute `supabase/seed.sql`
4. Under **Authentication -> Providers -> Email**:
   - Ensure Email provider is enabled.
   - For rapid testing, you can disable "Confirm email" or configure custom SMTP.

---

## 2. Secure First Administrator Provisioning

To grant admin privileges to the initial administrator:
1. Register an account with your desired admin email in the application interface (e.g., `admin@wastewise.in`).
2. Open the Supabase **SQL Editor** and run:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@wastewise.in');
```
*Note: Direct user promotion via client API is strictly blocked by Row Level Security (RLS) policies.*

---

## 3. Backend Deployment (Render or Railway)

1. Push this repository to GitHub or GitLab.
2. In [Render Dashboard](https://dashboard.render.com), create a new **Web Service**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Configure Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `FRONTEND_ORIGIN`: `https://your-frontend-app.vercel.app`
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-supabase-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
4. Deploy the service and verify health:
   - Visit: `https://your-backend.onrender.com/api/v1/health`

---

## 4. Frontend Deployment (Vercel)

1. In [Vercel Dashboard](https://vercel.com), click **Add New -> Project**.
2. Select your repository.
3. Configure Project Settings:
   - Root Directory: `frontend`
   - Framework Preset: `Other`
4. In `frontend/js/config.js` or through environment script injection, point the API base URL to your deployed Render URL:
   `https://your-backend.onrender.com/api/v1`
5. Click **Deploy**.

---

## 5. Local Verification & Testing

### Run Backend Locally:
```bash
cd backend
npm install
npm test
npm start
```
The REST API will start at `http://localhost:5000/api/v1/health`.

### Run Frontend Locally:
Open `frontend/index.html` with VS Code Live Server or any static HTTP server:
```bash
npx serve frontend -p 3000
```
Visit `http://localhost:3000` in your web browser.

