# University Review Platform — Full Implementation Plan
## Mapped Against Technical Documentation (§14.1–14.17 + §20 Development Phases)

---

## Progress Overview

The technical documentation defines **6 development phases** and a **17-step build guide** (§14.1–14.17). Here is where we stand on every single one:

| Phase | Name | Status |
|-------|------|--------|
| Phase 1 | Setup & Auth | ✅ Complete |
| Phase 2 | Core APIs | ✅ Complete |
| Phase 3 | Frontend UI | 🟡 ~80% done (missing Profile + Admin pages) |
| Phase 4 | Admin Tools | ❌ Not started |
| Phase 5 | Testing | ❌ Not started |
| Phase 6 | Deployment | ❌ Not started |

---

## Detailed Step-by-Step Build Guide Status (§14.1–14.17)

| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 14.1 | Prerequisites: Node, Git, accounts | ✅ Done | fnm + Node v24 installed |
| 14.2 | Repo + monorepo structure | ✅ Done | `server/` + `client/` in place |
| 14.3 | Backend: Express + all packages | ✅ Done | All packages including helmet, rate-limit, oauth2 |
| 14.4 | Environment variables | ✅ Done locally | `.env.example` exists; need production env files |
| 14.5 | MongoDB Atlas setup + collections | ✅ Done | All 8 collections modeled + seed script |
| 14.6 | Authentication (Google + email/pass) | 🟡 Partial | Email/pass ✅; Google is dev stub only |
| 14.7 | API development (all endpoints) | ✅ Done | All CRUD, vote, flag, admin endpoints |
| 14.8 | Frontend pages setup | 🟡 Partial | Missing `/profile` and `/admin/*` |
| 14.9 | Frontend ↔ Backend wiring | ✅ Done | Axios + JWT store + interceptors |
| 14.10 | Error handling & logging | 🟡 Partial | Backend error handler ✅; no Winston, no toasts |
| 14.11 | Testing (Jest + Supertest + Playwright) | ❌ Not started | Zero tests exist |
| 14.12 | Database migrations | ❌ Not started | No `server/migrations/` folder |
| 14.13 | Docker setup | ❌ Not started | No Dockerfiles |
| 14.14 | Deployment pipeline | ❌ Not started | Not on Render/Vercel |
| 14.15 | SEO & performance | ❌ Not started | Only `<title>` exists on pages |
| 14.16 | Backup strategy | ❌ Not started | Atlas manual backup not configured |
| 14.17 | MVP checklist verification | ❌ Not done | Cannot verify until 14.8–14.14 done |

---

## Phase 3: Frontend UI Completion

### [MISSING] `client/src/routes/profile/+page.svelte`

The docs specify (§17.8): *"Shows user's submitted reviews + edit/delete buttons. SEO: noindex."*

**Must build:**
- Fetch user's own reviews via `GET /api/reviews?userId=me` (or add a `GET /api/users/me/reviews` endpoint)
- Display each review with the object name, rating summary, and review text
- Edit button → opens inline form or navigates to a pre-filled review form
- Delete button → calls `DELETE /api/reviews/:id` with confirmation
- `<meta name="robots" content="noindex">` in `<svelte:head>`

---

### [MISSING] `client/src/routes/admin/` — 3 pages

The docs specify (§17.9): *"Admin dashboard — protected via role check. Sections: object creation, flag review list, review moderation."*

**Must build:**

#### `client/src/routes/admin/+layout.svelte`
- Role guard: if `authState.user?.role !== 'admin'` → redirect to `/`
- Admin sidebar nav (Dashboard | Flags | Objects)

#### `client/src/routes/admin/+page.svelte` (dashboard)
- Stats cards: total reviews, total flags pending, total universities
- Quick links to objects and flags sections

#### `client/src/routes/admin/objects/+page.svelte`
- Form to create: university / course / professor / TA
- Dynamic fields based on selected type
- Calls `POST /api/admin/object`
- Lists existing items with counts

#### `client/src/routes/admin/flags/+page.svelte`
- Table of all flagged reviews (via `GET /api/flags?status=pending`)
- Each row shows: review text, flag reason, reporter pseudonym
- "Mark Reviewed" button → `PUT /api/flags/:id` with `{ status: "reviewed" }`
- "Delete Review" button → `DELETE /api/reviews/:id`

---

### [FIX] Homepage random stat

**File:** `client/src/routes/+page.svelte` line 92

```diff
- <span class="text-6xl...">{(Math.random() * 100).toFixed(1)}k+</span>
+ <span class="text-6xl...">{stats.totalReviews || 0}+</span>
```

**Also need:** `GET /api/stats` endpoint on backend returning `{ totalReviews, totalUniversities, totalUsers }`.

---

## Phase 4: Admin Tools

Covered above in "Phase 3: Frontend UI Completion" — admin dashboard pages ARE the admin tools phase. The backend APIs already exist.

---

## Phase 5: Error Handling & Logging (§14.10)

### [NEW] `server/src/utils/logger.js` — Winston logger

The docs specify (§12, §14.10): *"Winston logs: info, warn, error."*

```js
// Winston logger replacing all console.log/error in server
const winston = require('winston');
// log to console (dev) + file (prod)
```

**Apply to all controllers:** Replace `console.error(...)` with `logger.error(...)`.

---

### [NEW] Sentry integration (§12)

The docs specify: *"Sentry captures runtime crashes."*

- `npm install @sentry/node` in server
- Initialize Sentry in `server.js` before everything else
- Add Sentry error handler middleware in `app.js` (after all routes)
- Add `SENTRY_DSN` to `.env`

---

### [NEW] Frontend Toast Notification System (§14.10)

The docs specify: *"Frontend: Global error boundary + Toast notifications."*

**Options:**
- Write a simple `Toast.svelte` component + toast store
- Integrate into `+layout.svelte`
- Surface on: review submit success/error, login error, vote error, flag submit

---

### [FIX] RegExp Injection in Search (security)

**File:** `server/src/controllers/objectController.js` line 31

```diff
- if (q) filter.name = new RegExp(q, 'i');
+ if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
```

---

## Phase 5: Testing (§14.11)

### [NEW] `server/tests/` — Jest + Supertest backend tests

The docs specify: *"Jest + Supertest. Test auth, reviews, flags."*

```
server/tests/
├── auth.test.js      — register, login, /me, logout
├── reviews.test.js   — create, read, update, delete, vote
├── flags.test.js     — create flag, list flags, update status
├── objects.test.js   — search, get detail, admin create
```

**Config needed:**
- `jest.config.js` in server root
- Test DB: use `mongodb-memory-server` (in-memory MongoDB) so tests don't hit Atlas
- `npm install -D mongodb-memory-server`
- Update `package.json` test script: `"test": "jest --runInBand"`

---

### [NEW] `server/migrations/` — Database migration scripts (§14.12)

The docs specify: *"Migration scripts stored in repo. Run manually or via npm script."*

```
server/migrations/
├── 001_init.js          — documents initial schema (commentary)
├── 002_add_reviewvote.js — migration if upgrading existing DB
```

Add `"migrate": "node migrations/run.js"` to `package.json`.

---

### [NEW] Playwright E2E Tests (§14.11)

The docs specify: *"Playwright: test review submission, login."*

```
client/tests/
├── auth.spec.js      — register → login → logout flow
├── review.spec.js    — login → search uni → find course → write review
├── vote.spec.js      — like/dislike toggle
```

**Setup:**
- `npm install -D @playwright/test` in client
- `npx playwright install`
- Add `"test:e2e": "playwright test"` to client `package.json`

---

## Phase 6: Deployment (§14.13–14.16)

### [NEW] Docker Setup (§14.13)

The docs specify: *"Dockerfile for server, Dockerfile for client, docker-compose for local dev."*

#### `server/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 5000
CMD ["node", "src/server.js"]
```

#### `client/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "build"]
```

#### `docker-compose.yml` (root)
```yaml
services:
  server:
    build: ./server
    ports: ["5000:5000"]
    env_file: ./server/.env
  client:
    build: ./client
    ports: ["3000:3000"]
    environment:
      - VITE_API_URL=http://server:5000
```

---

### [MODIFY] SvelteKit Adapter for Production (§14.14)

**Current:** `@sveltejs/adapter-auto` — unreliable for specific hosts.

**For Render (Node.js server):**
```bash
cd client && npm install @sveltejs/adapter-node
```
Update `svelte.config.js`:
```diff
- import adapter from '@sveltejs/adapter-auto';
+ import adapter from '@sveltejs/adapter-node';
```

---

### [NEW] Production Environment Files (§14.4, §14.14)

#### `client/.env.production`
```env
VITE_API_URL=https://your-api-name.onrender.com
```

#### Server env vars to set on Render dashboard:
```
MONGO_URI=<rotated connection string>
JWT_SECRET=<32+ char random string>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=5000
```

---

### [NEW] GitHub Actions CI/CD Pipeline (§18.5)

The docs specify: *"On every push: install deps → run backend tests → run frontend tests → build Docker images."*

#### `.github/workflows/ci.yml`
```yaml
name: CI
on: [push, pull_request]
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd server && npm ci
      - run: cd server && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd client && npm ci
      - run: cd client && npm run build
```

---

### [NEW] SEO & Performance (§14.15, §17.12)

The docs specify: *"SSR via SvelteKit, meta tags per page, noindex for profiles, image-free pages for speed."*

**Per page additions needed:**

| Page | Meta needed |
|------|-------------|
| Homepage | `<meta name="description" content="...">` |
| University page `[id]` | Dynamic title + description with university name |
| Object page `[type]/[id]` | Title: "Reviews for {name} — RateMyCourse", OG tags |
| Profile page | `<meta name="robots" content="noindex">` |
| Login / Register | `noindex` |

Also add Open Graph tags (`og:title`, `og:description`, `og:url`) to object pages for social sharing.

---

### [NEW] Backup Strategy (§14.16, §18.9)

The docs specify: *"MongoDB Atlas snapshots + optional cron job for JSON backup."*

- Enable **Continuous Backup** in MongoDB Atlas (M10+ tier) OR use **Atlas Scheduled Triggers** (free) to export data
- Optional: Add an admin API endpoint `GET /api/admin/export` that streams a JSON dump of all reviews

---

### [NEW] MongoDB Password Rotation (Security)

> [!CAUTION]
> The `server/.env` with MongoDB credentials was committed to GitHub (documented in walkthrough). The old password is compromised.

**Action required (you must do this):**
1. Go to MongoDB Atlas → Database Access
2. Edit the user → Change Password → Save
3. Update `server/.env` with new connection string
4. This step is yours — I cannot access your Atlas account

---

## Phase 6: Production Checklist (§14.17 + §18.10)

Per the docs, before going live:

- [ ] All env vars set on Render + Vercel dashboards
- [ ] Google OAuth domain verified in Google Cloud Console
- [ ] Rate limiting enabled ✅ (already done)
- [ ] Admin account created (via seed script or registration + manual role update in Atlas)
- [ ] SEO meta tags on all public pages
- [ ] Backups enabled in Atlas
- [ ] MongoDB password rotated ⚠️
- [ ] CORS `CLIENT_URL` set to production Vercel URL
- [ ] JWT_SECRET is a strong random string (not "super_secret_key")
- [ ] `NODE_ENV=production` set on Render
- [ ] `npm run build` succeeds for client
- [ ] Health check endpoint `/` responds on Render

---

## Proposed Execution Order (What We Do Next)

```
Phase 3 (now) ─────────────────────────────────────────
  1. Fix RegExp injection in search (5 min)
  2. Add GET /api/stats endpoint (20 min)
  3. Fix homepage random stat (5 min)
  4. Build /profile page (45 min)
  5. Build /admin layout + dashboard (30 min)
  6. Build /admin/objects page (45 min)
  7. Build /admin/flags page (45 min)

Phase 5: Logging & Error Handling ─────────────────────
  8.  Add Winston logger to server (30 min)
  9.  Add Sentry (backend) (20 min)
  10. Add Toast notification system (frontend) (40 min)
  11. Add SEO meta tags to all pages (30 min)
  12. Add 404 error page (10 min)

Phase 5: Testing ───────────────────────────────────────
  13. Set up Jest + mongodb-memory-server (30 min)
  14. Write auth.test.js (45 min)
  15. Write reviews.test.js (45 min)
  16. Write flags + objects tests (45 min)
  17. Set up Playwright (30 min)
  18. Write E2E login + review flow tests (60 min)
  
Phase 6: Deployment ────────────────────────────────────
  19. Rotate MongoDB password (you)
  20. Switch SvelteKit to adapter-node (10 min)
  21. Create client/.env.production (10 min)
  22. Write Dockerfiles + docker-compose (30 min)
  23. Write GitHub Actions CI workflow (20 min)
  24. Write server/migrations/ scripts (20 min)
  25. Deploy backend to Render (guided walkthrough)
  26. Deploy frontend to Vercel (guided walkthrough)
  27. Set all env vars in dashboards
  28. Run seed script against production DB
  29. Verify production checklist (§14.17)
  30. Set up Atlas backup
```

---

## Open Questions

> [!IMPORTANT]
> **Hosting preference?**
> Docs say Render (backend) + Vercel (frontend). Are you still using this? Or do you prefer Railway / Fly.io / another host? This determines which SvelteKit adapter to install.

> [!IMPORTANT]
> **Have you rotated the MongoDB password yet?**
> This must happen before we do anything with production deployment.

> [!IMPORTANT]
> **Google OAuth — do you have a Google Cloud project with credentials?**
> If yes, we integrate it during Phase 3. If not, we keep the dev stub and add it post-launch.

> [!IMPORTANT]
> **Do you want to build the full test suite first, or deploy first and test after?**
> The docs list testing before deployment, but for an MVP you could deploy and test post-launch.
