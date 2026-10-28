# 🌿 Waste Wise — Smart Waste Segregation Platform

> **"Segregate Smart. Live Green."**

A complete, production-grade full-stack web application designed for Indian households and communities. Waste Wise educates residents on responsible waste segregation, provides a rule-based waste classifier, tracks personal civic habits, awards points for environmental action, and gives administrators powerful management tools.

Built with **HTML5, CSS3, Vanilla JavaScript (ES Modules), Node.js, Express.js, and Supabase PostgreSQL**.

---

## 🌟 Key Features

1. **Rule-Based Waste Classifier (`classifier.html`)**
   - Deterministic matching against standard household items and colloquial Indian aliases (*chai patti*, *doodh packet*, *raddi*, *whisper pad*, etc.).
   - Provides canonical category, step-by-step preparation instructions, and safety precautions.
   - Saves classification history and awards +10 points to authenticated residents.

2. **6 Standard Household Waste Categories**
   - 🍃 **Wet / Biodegradable Waste** (Green Bin)
   - ♻️ **Dry / Recyclable Waste** (Blue Bin)
   - ⚠️ **Domestic Hazardous Waste** (Red / Yellow Bin)
   - 🔌 **Electronic Waste (E-Waste)** (Purple Bin / Kiosks)
   - 🩹 **Sanitary Waste** (Red Dot Marked Pouch)
   - 🗑️ **Residual / Non-Recyclable Waste** (Black / Grey Bin)

3. **Waste Education Center (`learn.html`)**
   - Interactive guides covering home composting, plastic cleaning (Clean, Dry, Flatten), e-waste hazards, and worker safety.
   - Earn +25 points upon completing eligible guides.

4. **Resident Dashboard (`dashboard.html`)**
   - Live summary metrics: items segregated, points balance, achievement rank tier, and guides completed.
   - Interactive Doughnut chart showing household waste category distribution.
   - Recent activity history feed.

5. **Auditable Rewards Ledger (`rewards.html`)**
   - Server-enforced points ledger with unique idempotency keys preventing duplicate awards.
   - Rank progression: *Green Starter* (0-99 pts) ➔ *Eco Warrior* (100-299 pts) ➔ *Earth Guardian* (300-599 pts) ➔ *Sustainability Champion* (600+ pts).

6. **Administrator Portal (`admin.html`)**
   - Protected by `requireAdmin` backend authorization and Row Level Security.
   - CRUD management for waste categories, classification catalog items, educational modules, and points rules.
   - Citizen directory and security audit trail.

---

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5, CSS3 Custom Properties (Design Tokens), Vanilla JavaScript (ES Modules), Chart.js.
- **Backend**: Node.js (LTS), Express.js REST API (`/api/v1`), Zod validation, Helmet security headers, rate limiting.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies, triggers, and JWT bearer authentication.
- **Testing**: Built-in Node.js Test Runner with 14 automated unit and integration tests.

---

## 📂 Project Structure

```text
wastewise/
├── frontend/
│   ├── index.html            # Public landing page
│   ├── login.html            # Authentication login
│   ├── register.html         # Resident registration
│   ├── classifier.html       # Waste classification engine
│   ├── learn.html            # Education center
│   ├── dashboard.html        # Authenticated user dashboard
│   ├── rewards.html          # Points ledger & rank roadmap
│   ├── admin.html            # Administrator management panel
│   ├── privacy.html          # Privacy policy
│   ├── terms.html            # Terms of service
│   ├── css/                  # Modular styles (variables, base, layout, components, pages, responsive)
│   └── js/                   # ES Modules (config, api, auth, navigation, classifier, etc.)
├── backend/
│   ├── src/
│   │   ├── app.js            # Express application setup
│   │   ├── server.js         # HTTP server entrypoint
│   │   ├── config/           # Environment & Supabase client
│   │   ├── middleware/       # Auth, Admin, Validation, Rate Limiter, Error Handler
│   │   ├── routes/           # Versioned REST API endpoints (/api/v1)
│   │   ├── services/         # Classifier, Rewards, Dashboard, Admin services
│   │   ├── validators/       # Zod request validation schemas
│   │   └── utils/            # Logger, response helpers
│   ├── tests/                # Automated unit & integration tests
│   └── package.json
├── supabase/
│   ├── migrations/           # Versioned SQL migrations (schema & RLS policies)
│   └── seed.sql              # Rich Indian household catalog & seed data
├── docs/                     # Architecture, API & Deployment guides
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install & Test Backend
```bash
cd backend
npm install
npm test      # Runs all 14 unit and integration tests
npm start     # Starts API on http://localhost:5000
```

### 2. Run Frontend
Serve the `frontend/` directory using any local HTTP server (such as Live Server or Python):
```bash
npx serve frontend -p 3000
# or
python -m http.server 3000 --directory frontend
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Automated Test Results

All 14 unit and integration tests pass successfully:
- `API GET /health` (200 OK)
- `API GET /categories` (Active categories catalog)
- `API POST /classifications` (Valid rule matching & 422 validation error handling)
- `API Admin Authorization` (401 unauthenticated, 403 forbidden, 200 admin granted)
- `Text Normalization & Indian Household Aliases` (*chai patti*, *doodh packet*, *whisper pad*)
- `Rewards Ledger Idempotency` (Duplicate replay prevention)
- `User Tier Progression` (Point balance calculations)
- `Zod Schema Validations` (Category, items, input validation)

---

## 📜 Regulatory Reference
Designed in compliance with the **Solid Waste Management Rules (2016)** by the Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India, and supporting the nationwide **Swachh Bharat Mission (Urban)**.

