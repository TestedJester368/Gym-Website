# APEX Gym — Project Overview

This repository is a simple gym membership portal with a static frontend and a small Node.js backend for authentication and admin features. It is intended as a demo / starter project.

---

## What this project contains

- `apex/` — Frontend (HTML, CSS, vanilla JavaScript)
  - `index.html` — Landing / marketing page with plans
  - `pages/` — Member `login.html`, `dashboard.html`, `cart.html`, `admin-*` pages
  - `css/` — Stylesheets including `style.css` and page-specific CSS
  - `js/` — Frontend logic: `main.js`, `auth.js`, `dashboard.js`, `cart.js`, `admin-auth.js`, `admin-dashboard.js`
- `backend/` — Node.js + Express backend
  - `server.js` — API endpoints and static file server
  - `package.json` — backend dependencies and scripts

---

## Features

- Public landing page with hero, membership plans, and a trainers carousel
- Member authentication (email/password) with hashed passwords (bcrypt)
- Member dashboard: plan display, simulated gym occupancy, workout logging (stored in `localStorage`), visit history
- Shopping cart and checkout UI (no payment integration)
- Admin login (demo credentials) and admin dashboard to view/edit/delete users and view stats
- Backend API for auth and admin operations (JWT-based auth)

---

## Tech Stack & Tools

- Frontend: HTML, CSS, vanilla JavaScript (no framework)
- Backend: Node.js, Express
- Auth: `jsonwebtoken` (JWT) and `bcryptjs` (password hashing)
- Dev utilities: `cors`, `dotenv`
- Data storage: in-memory `Map()` on the backend (not persistent); `localStorage` on the client for tokens, cart, workouts

---

## Quick Start (local)

1. Install Node.js (recommended v16+ or v18+)
2. Start the backend (it serves the frontend statically):

```bash
cd backend
npm install
npm run dev
# server listens on http://localhost:3000 by default
```

3. Open the site in your browser:

```
http://localhost:3000
```

4. Admin demo credentials (for local testing):

- Email: `admin@apex.com`
- Password: `ApexAdmin@2024`

The admin login is handled by `POST /api/admin/login` and the server issues an admin JWT for protected admin routes.

---

## Important Notes & Limitations

- The backend uses an in-memory `Map()` for users — all data is lost when the server restarts. Replace with a real database (SQLite, PostgreSQL, MongoDB) for production.
- The JWT secret falls back to a default string. Set a secure `JWT_SECRET` in a `.env` file before deploying.
- Admin credentials are hardcoded for demo purposes — do not use this in production.
- Checkout UI is present but there is no payment provider integrated.
- CORS is permissive; tighten allowed origins in production.

---

## Recommended Next Steps

1. Add a persistent database and migrate user storage.
2. Move admin credentials into the DB and add proper user roles.
3. Set a secure `JWT_SECRET` and consider token revocation or refresh flows.
4. Integrate a payment gateway (e.g. Stripe) for real checkout.
5. Harden CORS, add rate-limiting, input validation, and logging.

---

