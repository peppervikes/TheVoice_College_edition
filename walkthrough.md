# Walkthrough: Changes Made So Far

This document tracks every change made, which file was affected, what was changed, and **why**.

---

## Phase 0: System Setup (Fresh Machine)

Your system had **git**, **Python**, and **VS Code** but no Node.js or npm.

| Step | What I Did | Why |
|------|-----------|-----|
| Installed `fnm` via `winget` | fnm (Fast Node Manager) lets you install and switch between Node.js versions easily | Better than installing Node.js directly — you can manage multiple versions later |
| Installed Node.js v24.14.1 LTS | The runtime needed for both the server (Express) and client (SvelteKit) | LTS = Long Term Support = stable for production |
| Set `ExecutionPolicy` to `RemoteSigned` | PowerShell was blocking npm scripts from running | Default Windows policy blocks all scripts; `RemoteSigned` allows local scripts but blocks untrusted remote ones |
| Updated PowerShell profile | Added `fnm env` to your profile so fnm activates automatically in every new terminal | Without this, you'd have to manually activate fnm in each new terminal |
| Ran `npm install` in server/ and client/ | Downloaded all project dependencies from `package.json` | The `node_modules` folder wasn't present since it's gitignored |
| Installed 4 new server packages | `helmet`, `express-rate-limit`, `google-auth-library`, `cookie-parser` | Needed for security, Google OAuth, and cookie handling |

---

## Phase 1: Backend Hardening

### Overview
The existing backend had routes and controllers but **zero security** — no authentication checks, hardcoded user IDs, fake aggregation stats, and no rate limiting. Phase 1 fixes all of that.

---

### [NEW] `server/src/middleware/authMiddleware.js`

**What it does:** Three middleware functions that sit between an API request and your controller logic.

| Function | Purpose |
|----------|---------|
| `requireAuth` | Reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches `req.user = { id, role }` to the request. Returns `401` if no token or invalid. |
| `requireRole('admin')` | Used **after** `requireAuth`. Checks if `req.user.role` matches the required role. Returns `403` if not. |
| `optionalAuth` | Same as `requireAuth` but **doesn't block** — if no token, just sets `req.user = null` and continues. Useful for pages that work for both logged-in and anonymous users. |

**Why:** Before this, ANY person could call `POST /api/reviews` or `POST /api/admin/object` without logging in. Every API call was unprotected.

---

### [MODIFIED] `server/src/controllers/authController.js`

**What changed:**

```diff
 BEFORE:
- googleLogin: hardcoded email "user@example.com", no real token verification
- localLogin: worked but returned only { token } with no user info
- No register endpoint
- No /me endpoint

 AFTER:
+ register: validates email/password/pseudonym → hashes password → creates user → returns token + user object
+ localLogin: validates input, updates lastLogin, returns token + user object
+ googleLogin: if GOOGLE_CLIENT_ID is set → verifies real Google token; if not → uses dev stub so you can test without Google credentials
+ getMe: returns current user's profile (protected by requireAuth middleware in the route)
```

**Why each change:**
- **Register**: You can't have a platform without user signups. The old code had no way to create accounts from the frontend.
- **Returning user object**: The frontend needs to know the user's name, role, etc. after login — not just a token.
- **Google dev stub**: You don't have Google OAuth credentials yet. The stub lets you test the flow now and swap in real credentials later without changing any code.
- **getMe**: When a user refreshes the page, the frontend has a stored token but needs to verify it's still valid and get user info. This endpoint does that.

---

### [MODIFIED] `server/src/routes/authRoutes.js`

```diff
- Only had: POST /google, POST /login, POST /logout
+ Added: POST /register, GET /me (protected with requireAuth)
```

**Why:** New endpoints need routes to be accessible.

---

### [NEW] `server/src/models/ReviewVote.js`

**What it does:** A new MongoDB collection that tracks which user voted on which review.

```
Schema: { reviewId, userId, voteType: "like"|"dislike" }
Unique index: (reviewId + userId) — one vote per user per review
```

**Why:** The old code used `$inc: { likes: 1 }` directly — meaning you could click "like" 1000 times and it would count 1000 likes. This model prevents that by tracking each individual vote.

---

### [MODIFIED] `server/src/controllers/reviewController.js`

**Major changes:**

| Change | Before | After | Why |
|--------|--------|-------|-----|
| User ID source | Hardcoded `"000000000000000000000000"` | `req.user.id` from JWT | Reviews must be tied to real logged-in users |
| Ownership checks | Anyone could edit/delete any review | Only owner can edit/delete (admins can also delete) | Security — users shouldn't edit each other's reviews |
| Like/Dislike | Two endpoints, no tracking, infinite clicks | Single `/vote` endpoint with toggle logic | Prevents vote spam, allows un-voting |
| GET reviews | Didn't exist as standalone | New endpoint with pagination + 4 sort modes | Frontend needs to list reviews with sorting and paging |

**Vote toggle logic explained:**
- First click → adds a "like" vote
- Click "like" again → removes the vote (toggle off)
- Click "dislike" while a "like" exists → switches from like to dislike

---

### [MODIFIED] `server/src/controllers/objectController.js`

**The biggest fix: Real aggregation pipeline.**

```diff
 BEFORE:
- res.json({ object, stats: { avgDifficulty: 3.5 }, reviews });
  // ↑ This is a hardcoded number. Useless.

 AFTER:
+ MongoDB $aggregate pipeline that computes:
+   - totalReviews (count)
+   - avgDifficulty (average of ratings.difficulty across all reviews)
+   - avgAssignmentDifficulty
+   - wouldTakeAgainPct (% of reviewers who said "yes")
+   - totalLikes, totalDislikes
```

**Why:** The whole point of the platform is showing real statistics. Hardcoded `3.5` is meaningless. The aggregation runs every time someone views a course/professor page, so stats are always live.

Also added:
- `getUniversities` — a clean `GET /api/universities` endpoint (before, you had to use the search endpoint with no query)
- Helper function `getModel()` to eliminate repeated `if/else` chains

---

### [MODIFIED] `server/src/controllers/flagController.js`

```diff
- reportedBy = req.body.userId || "000000000000000000000000"
+ reportedBy = req.user.id
+ Added updateFlagStatus endpoint for admins
+ Added filtering by status (pending/reviewed)
+ Added population of review and reporter data
```

**Why:** Flags must come from real users. Admins need to mark flags as "reviewed" after handling them.

---

### [MODIFIED] All 4 route files

Added middleware guards:

| Route | Before | After |
|-------|--------|-------|
| `POST /api/reviews` | Open to anyone | `requireAuth` |
| `PUT /api/reviews/:id` | Open to anyone | `requireAuth` |
| `DELETE /api/reviews/:id` | Open to anyone | `requireAuth` |
| `POST /api/reviews/:id/vote` | N/A (new) | `requireAuth` |
| `POST /api/admin/object` | Open to anyone | `requireAuth` + `requireRole('admin')` |
| `POST /api/flags` | Open to anyone | `requireAuth` |
| `GET /api/flags` | Open to anyone | `requireAuth` + `requireRole('admin', 'moderator')` |
| `GET /api/search` | Open | Stays open (public) |
| `GET /api/object/:type/:id` | Open | Stays open (public) |

**Why:** Without these guards, anyone with Postman could create fake reviews, delete real ones, or access the admin panel.

---

### [MODIFIED] `server/src/app.js`

| Addition | What It Does | Why |
|----------|-------------|-----|
| `helmet()` | Sets 15+ HTTP security headers (X-Content-Type-Options, HSTS, X-Frame-Options, etc.) | Prevents XSS, clickjacking, MIME sniffing attacks |
| `express-rate-limit` | General: 100 req/15min per IP. Auth: 20 req/15min per IP | Prevents brute-force login attempts and API abuse |
| `cors({ origin: CLIENT_URL })` | Only allows requests from your frontend URL | Before it was `cors()` which allows **any** website to call your API |
| `express.json({ limit: '10kb' })` | Limits request body size | Prevents someone sending a 100MB JSON payload to crash your server |
| `cookie-parser` | Parses cookies from requests | Needed if you later want httpOnly cookie-based auth |
| Global error handler | Catches Mongoose validation errors, CastErrors, duplicates | Returns clean error messages instead of crashing or leaking stack traces |

---

### [NEW] `server/.env.example`

A template file showing which environment variables are needed, without any real values.

**Why:** If someone clones your repo, they need to know what variables to set. The real `.env` is gitignored, so without `.env.example` they'd be clueless.

---

---

## Security Fix: `.env` Leaked to GitHub

### What Happened
The `server/.env` file (containing your MongoDB URI with username/password) was being tracked by git and was visible on GitHub.

### Root Cause
The old `.gitignore` had `*.env` — while the pattern technically matches, the file was committed **before** the gitignore rule existed. Once git tracks a file, adding it to `.gitignore` does NOT remove it.

### What I Did
1. Rewrote `.gitignore` with proper patterns (`.env`, `.env.local`, etc.) and common exclusions
2. Ran `git rm --cached server/.env` — this tells git to **stop tracking** the file, but keeps it locally
3. Committed and pushed — the file is now deleted from GitHub but still exists on your machine

> ⚠️ **Important:** Since the credentials were publicly exposed, you should rotate your MongoDB password at [MongoDB Atlas](https://cloud.mongodb.com). Go to Database Access → Edit user → Change password → Update your local `.env` file.

---

## Phase 2: Frontend Auth & Wiring

### Overview
The frontend pages existed but were "dumb" — hardcoded API URLs, no auth awareness, and visual-only buttons. Phase 2 makes everything functional.

---

### [NEW] `client/src/lib/api.js`

**What it does:** A single axios instance that every page imports instead of using `axios` directly.

| Feature | How It Works |
|---------|-------------|
| Base URL | Reads `VITE_API_URL` env var, or defaults to `http://localhost:5000`. Only set in one place. |
| Auto JWT | Request interceptor reads `localStorage.getItem('token')` and adds `Authorization: Bearer <token>` to every request. |
| 401 handling | Response interceptor catches 401 errors and clears stale tokens from localStorage. |

**Why:** Before this, every page had `axios.get('http://localhost:5000/api/...')` hardcoded. If the server URL changed, you'd have to find and replace in 5+ files. Now there's one source of truth. Also, no page had to manually manage tokens — the interceptor does it automatically.

**Before → After in every page:**
```diff
- import axios from 'axios';
- const res = await axios.get('http://localhost:5000/api/search');
+ import api from '$lib/api.js';
+ const res = await api.get('/universities');
```

---

### [NEW] `client/src/lib/stores/auth.js`

**What it does:** A Svelte writable store that holds the current user's auth state and provides methods to change it.

**State shape:**
```js
{ user: { id, email, pseudonym, role } | null, token: string | null, isLoggedIn: boolean }
```

| Method | What It Does |
|--------|-------------|
| `loadSession()` | Called on app startup. Checks if there's a token in localStorage. If yes, calls `GET /api/auth/me` to verify it's still valid. If the server says it's expired, clears everything. |
| `login(email, pass)` | Calls `POST /api/auth/login` → stores token + user in localStorage → updates store. |
| `register(email, pass, pseudonym)` | Same flow but calls `/register`. Auto-logs in on success. |
| `googleLogin(credential)` | Sends Google token to backend. Ready for when you set up Google OAuth. |
| `logout()` | Clears localStorage, resets store to `{ user: null, isLoggedIn: false }`. |

**Why:** Without a central store, each page would have to independently check if the user is logged in (reading localStorage, parsing tokens, etc.). The store makes auth state reactive — when you log in on the login page, the navbar immediately updates because it subscribes to the same store.

---

### [MODIFIED] `client/src/routes/+layout.svelte`

**What changed:**
```diff
 BEFORE:
- Always showed "Sign In" button regardless of login state
- No user info in navbar

 AFTER:
+ Subscribes to auth store
+ Calls loadSession() on mount (checks for existing session on page load/refresh)
+ When logged in: shows user avatar (first letter of pseudonym), pseudonym text, "Admin" badge for admins, and a red Logout button
+ When logged out: shows blue "Sign In" link
+ Shows "Admin" nav link only for admin/moderator roles
```

**Why:** The navbar is the central UI element. Users need visual confirmation they're logged in, and the nav should adapt to their role.

---

### [NEW] `client/src/routes/register/+page.svelte`

A new registration form matching the brutalist design with:
- Pseudonym field (what others see — explained with helper text)
- Email + Password + Confirm Password
- Client-side validation (password match, min length)
- Uses `auth.register()` → auto redirects to homepage on success
- Link to login page for existing users

**Why:** There was no way to create an account from the UI. Users either got the seed demo account or nothing.

---

### [MODIFIED] `client/src/routes/login/+page.svelte`

```diff
 BEFORE:
- Used raw axios with hardcoded URL
- Didn't store the token anywhere useful
- No link to registration

 AFTER:
+ Uses auth.login() from the store
+ Token automatically stored in localStorage
+ Loading state on button (prevents double-clicks)
+ "Don't have an account? Register" link at bottom
+ Google button shows helpful message about setup needed
```

---

### [MODIFIED] `client/src/routes/object/[type]/[id]/+page.svelte` (The Big One)

This is the page that shows a course/professor with all their reviews. **Every interactive element is now functional:**

| Element | Before | After |
|---------|--------|-------|
| 👍 Like button | Visual only, did nothing | Calls `POST /api/reviews/:id/vote` with `{ voteType: "like" }`. Updates count in UI immediately. |
| 👎 Dislike button | Visual only, did nothing | Same as like but with `"dislike"`. |
| 🚩 Flag button | Visual only, did nothing | Opens a modal with a text area → calls `POST /api/flags` on submit. |
| "Write Review" button | Always visible | Only shown when logged in. Shows "Sign In to Review" when logged out. |
| Stats section | Hardcoded `3.5` and `RATING TBD` | Shows real `avgDifficulty`, `totalReviews`, and `wouldTakeAgainPct` from the aggregation pipeline. |
| Tags | Not displayed | Displayed as yellow badges if the review has tags. |

All buttons redirect to `/login` if the user isn't authenticated.

---

### [MODIFIED] `client/src/routes/review/new/+page.svelte`

```diff
 BEFORE:
- Used raw axios, no auth check
- Used hardcoded dummy user ID from body

 AFTER:
+ Uses centralized api.js (JWT auto-attached)
+ Redirects to /login on mount if no token exists
+ Shows the user's pseudonym ("Reviewing as CampusNerd99")
+ Prevents default form submission (e.preventDefault)
```

---

### [MODIFIED] `client/src/routes/+page.svelte` (Homepage)

Small but important:
```diff
- import axios from 'axios';
- const res = await axios.get('http://localhost:5000/api/search');
+ import api from '$lib/api.js';
+ const res = await api.get('/universities');
```

Now uses the dedicated `/universities` endpoint instead of the generic search, and goes through the centralized API layer.

---

### [MODIFIED] `client/src/routes/university/[id]/+page.svelte`

Same API migration — switched from raw axios to `api.js`.

---

## What's Next: Phase 3

Jest + Supertest testing for the backend API endpoints.
