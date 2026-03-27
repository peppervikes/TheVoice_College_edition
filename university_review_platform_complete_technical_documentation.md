# University Review Platform – Complete Technical Documentation

## 1. Project Overview

### 1.1 Purpose
This project is a **university-focused anonymous review platform** where students can review:
- **Courses**
- **Professors**
- **Teaching Assistants (TAs)**

The platform is inspired by systems like *RateMyProfessors* but is designed as a **learning-focused, production-grade full-stack project**.

### 1.2 Core Goals
- Allow students to submit **structured, multi-part reviews**
- Ensure **anonymity or pseudonymity** while preventing spam
- Provide **aggregated statistics** (averages, counts)
- Enable **moderation and admin control**
- Be **free to host**, scalable, and secure
- Serve as a **complete learning reference** for full-stack development

---

## 2. Target Users & Roles

### 2.1 User Types
1. **Public Visitor**
   - Can read reviews
   - Can search universities, courses, professors, TAs

2. **Registered User (Student)**
   - Login via Google OAuth or username/password
   - Submit one review per object
   - Edit/delete own reviews
   - Like/dislike reviews
   - Flag reviews
   - Choose anonymous or pseudonymous posting

3. **Moderator**
   - Review flagged content
   - Hide or delete reviews

4. **Admin**
   - Full access
   - Approve object creation requests
   - Create/edit/delete objects
   - Assign moderators/admins
   - View logs and flags

---

## 3. High-Level System Architecture

### 3.1 Architecture Overview

- **Frontend**: SvelteKit (SSR + SPA)
- **Backend**: Node.js + Express
- **Authentication**: Supabase Auth
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Hosting**:
  - Frontend: Vercel
  - Backend: Render
  - Database: MongoDB Atlas

### 3.2 Communication Flow

1. User interacts with SvelteKit frontend
2. Frontend calls backend REST APIs
3. Backend:
   - Verifies JWT from Supabase Auth
   - Applies authorization rules
   - Reads/writes MongoDB
4. Aggregated data returned to frontend

---

## 4. Technology Stack (Final)

### 4.1 Frontend
- **SvelteKit** – UI framework
- **Tailwind CSS** – Styling
- **Skeleton UI** – Prebuilt Svelte components
- **Playwright** – End-to-end testing

### 4.2 Backend
- **Node.js** – Runtime
- **Express.js** – API framework
- **Mongoose** – MongoDB ODM
- **Winston** – Logging
- **Sentry** – Error monitoring

### 4.3 Auth & Security
- **Supabase Auth** – Google OAuth + email/password
- **JWT** – Authorization tokens

### 4.4 DevOps
- **Docker** – Containerization
- **GitHub Actions** – CI/CD
- **Render** – Backend hosting
- **Vercel** – Frontend hosting

---

## 5. Database Design

### 5.1 Core Collections

#### User
- _id
- email
- authProvider (google / local)
- passwordHash (only for local login)
- role (user / moderator / admin)
- pseudonym
- createdAt

#### University
- _id
- name
- country

#### Course
- _id
- courseCode
- name
- universityId

#### Professor
- _id
- name
- universityId
- coursesTaught [courseId]

#### TeachingAssistant
- _id
- name
- universityId
- coursesAssisted [courseId]

#### Review
- _id
- userId
- objectId
- objectType (course / professor / ta)
- ratings (structured object)
- tags [string]
- textReview
- anonymous (boolean)
- likesCount
- dislikesCount
- createdAt

#### Flag
- _id
- reviewId
- userId
- reasonText
- createdAt

#### ObjectRequest
- _id
- requestedBy
- objectType
- payload
- status (pending/approved/rejected)

---

## 6. Review Structure (Professor Example)

- Course selection (dropdown)
- Online course? (Yes/No)
- Overall rating (1–5)
- Difficulty (1–5)
- Would take again (Yes/No)
- Taken for credit (Yes/No)
- Uses textbook (Yes/No)
- Attendance mandatory (Yes/No)
- Grade received (enum)
- Tags (max 3)
- Text review (max 350 chars)

All fields are validated on both frontend and backend.

---

## 7. Search & Navigation Flow

1. Home page → search university
2. University selected → scoped search
3. Dropdown toggles object type (Course / Professor / TA)
4. Object page shows:
   - Aggregated stats
   - Reviews list
   - Sorting options

Sorting options:
- Most recent
- Most liked
- Highest rating
- Lowest rating

---

## 8. Anonymity Model

- Login is mandatory to submit reviews
- Each review has a toggle:
  - Anonymous → public shows "Anonymous"
  - Non-anonymous → shows pseudonym
- Real user identity is visible **only to admins**

---

## 9. Admin & Moderation System

### Admin Dashboard Features
- View all objects
- Approve object requests
- Manage reviews
- Review flags
- Assign roles

### Flag System
- Users submit free-text flag
- Flagged reviews remain visible
- Admin/moderator decides action

---

## 10. APIs (High-Level)

### Auth
- POST /auth/login
- POST /auth/register

### Objects
- GET /universities
- GET /courses?universityId=
- GET /professors?universityId=

### Reviews
- POST /reviews
- PUT /reviews/:id
- DELETE /reviews/:id
- GET /reviews?objectId=

### Admin
- GET /admin/flags
- POST /admin/objects/approve

---

## 11. Security Layers

- HTTPS enforced
- JWT verification middleware
- Role-based authorization
- Rate limiting (per IP + per user)
- Input validation
- XSS protection

---

## 12. Logging & Error Handling

- Winston logs:
  - info
  - warn
  - error
- Sentry captures runtime crashes
- Global error handler middleware

---

## 13. Testing Strategy

### Backend
- Jest – unit tests
- Supertest – API tests

### Frontend
- Playwright – E2E testing

---

## 14. Database Migrations

- Mongoose schema versioning
- Migration scripts stored in repo
- Manual migration execution

---

## 15. Environment Variables

Stored in `.env` files:
- MONGODB_URI
- SUPABASE_URL
- SUPABASE_ANON_KEY
- JWT_SECRET
- SENTRY_DSN

Never committed to GitHub.

---

## 16. Deployment Pipeline

1. Push to GitHub
2. GitHub Actions runs tests
3. Docker image built
4. Render deploys backend
5. Vercel deploys frontend

---

## 17. SEO & Performance

- SSR via SvelteKit
- Meta tags per page
- noindex for profiles & reviews
- Image-free pages for speed
- Pagination for large lists

---

## 18. Backup Strategy

- MongoDB Atlas automatic backups
- Manual export option (admin)

---

## 19. Future Enhancements

- Compare courses/professors
- Dark mode
- Redis caching
- Analytics dashboards

---

## 20. Development Phases

1. Setup & auth
2. Core APIs
3. Frontend UI
4. Admin tools
5. Testing
6. Deployment

---

## 21. Conclusion

This document fully defines the system. A developer can implement the application end-to-end using this as the **single source of truth**.


---

## 14. Step-by-Step Build Guide (From Scratch to Deployed MVP)

This section explains **exactly how to build the project from an empty machine**, assuming beginner-level knowledge. Follow steps in order.

---

### 14.1 Prerequisites (Install Once)

1. **Install Node.js (LTS)**  
   - Required for backend & tooling
2. **Install Git**  
   - For version control & GitHub deployment
3. **Install MongoDB Compass (optional)**  
   - GUI to view database locally/cloud
4. **Create Accounts (Free)**
   - GitHub
   - MongoDB Atlas
   - Render (or Railway)
   - Auth provider (Clerk / Firebase / Auth0 free tier)

---

### 14.2 Project Repository Setup

```bash
mkdir uni-review-platform
cd uni-review-platform
git init
```

**Folder structure (monorepo):**
```
uni-review-platform/
│── client/        # SvelteKit frontend
│── server/        # Node.js backend
│── docs/
│── .gitignore
│── README.md
```

Commit initial structure.

---

### 14.3 Backend Setup (Node.js + Express)

```bash
cd server
npm init -y
npm install express cors dotenv mongoose jsonwebtoken bcrypt
npm install -D nodemon jest supertest
```

**Basic structure:**
```
server/
│── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│── tests/
│── .env
│── package.json
```

- `app.js` → express app
- `server.js` → server start
- `models/` → MongoDB schemas
- `routes/` → API endpoints

---

### 14.4 Environment Variables (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_key
AUTH_PROVIDER_SECRET=xxx
NODE_ENV=development
```

**Rules:**
- Never commit `.env`
- Separate `.env.local` / `.env.production`

---

### 14.5 Database Setup (MongoDB Atlas)

1. Create cluster (free tier)
2. Create DB user
3. Whitelist IP (0.0.0.0/0 for dev)
4. Copy connection string → `.env`

**Collections:**
- users
- universities
- courses
- professors
- teachingAssistants
- reviews
- flags

---

### 14.6 Authentication Setup (Google + Email/Password)

**Approach:** Third-party auth (recommended)

Flow:
1. User logs in via Google
2. Provider returns user ID
3. Backend verifies token
4. User record created/updated in DB
5. Backend issues JWT

Admin login via email/password only.

---

### 14.7 API Development (Incremental)

Start with:
- `POST /auth/login`
- `GET /objects/search`
- `POST /reviews`
- `PUT /reviews/:id`
- `DELETE /reviews/:id`
- `POST /flags`

Test each endpoint with Postman.

---

### 14.8 Frontend Setup (SvelteKit)

```bash
cd client
npm create svelte@latest
npm install
npm install axios
```

**Pages:**
```
/src/routes/
│── +page.svelte        # Home/search
│── login/
│── object/[id]/
│── review/new/
│── profile/
│── admin/
```

---

### 14.9 Connecting Frontend ↔ Backend

- Use Axios for API calls
- JWT stored in httpOnly cookies
- Protected routes via hooks

---

### 14.10 Error Handling & Logging

Backend:
- Central error middleware
- Winston logger

Frontend:
- Global error boundary
- Toast notifications

---

### 14.11 Testing Strategy

Backend:
- Jest + Supertest
- Test auth, reviews, flags

Frontend:
- Playwright for E2E tests
- Test review submission, login

---

### 14.12 Database Migrations

Use versioned scripts:
```
server/migrations/
│── 001_init.js
│── 002_add_flags.js
```

Run manually or via npm script.

---

### 14.13 Docker (Learning Setup)

- Dockerfile for server
- Dockerfile for client
- docker-compose for local dev

(Not mandatory for production on free tier)

---

### 14.14 Deployment Pipeline (Free)

**Flow:**
GitHub → Render

1. Push to GitHub
2. Connect repo to Render
3. Set env vars in dashboard
4. Auto deploy on push

---

### 14.15 SEO & Performance

- Server-side rendering (SvelteKit)
- Meta tags per object page
- Block user profiles from indexing
- Fast page loads via caching headers

---

### 14.16 Backup Strategy

- Manual MongoDB exports
- Scheduled snapshots via Atlas
- Optional cron job for JSON backup

---

### 14.17 MVP Checklist

- [ ] Auth working
- [ ] Reviews CRUD
- [ ] Aggregations correct
- [ ] Flags dashboard
- [ ] Admin object creation
- [ ] Deployed frontend & backend

---

End of Step-by-Step Build Guide.

---

## 15. Database Schema & Data Modeling (MongoDB)

This section defines **exactly how data is structured**, why each collection exists, and how relations are enforced. This acts as the **single source of truth for backend + frontend + migrations**.

---

### 15.1 Design Philosophy

- MongoDB (NoSQL) with **normalized collections**
- Relationships handled via **ObjectId references**
- One review per user per object (enforced at DB + API level)
- Hard deletes for reviews
- Soft logic handled in application layer

---

### 15.2 Core Collections Overview

| Collection | Purpose |
|----------|--------|
| users | Auth + ownership |
| universities | Scope isolation |
| courses | Reviewable object |
| professors | Reviewable object |
| teachingAssistants | Reviewable object |
| reviews | Main content |
| flags | Moderation |
| adminLogs | Audit trail |

---

### 15.3 Users Collection

```js
User {
  _id: ObjectId,
  email: String,          // unique
  passwordHash: String?,  // only for admin / local login
  authProvider: "google" | "local",
  providerId: String?,
  pseudonym: String,
  role: "user" | "admin" | "moderator",
  createdAt: Date,
  lastLogin: Date
}
```

Notes:
- Email never shown publicly
- Pseudonym used for non-anonymous posts
- Role controls access

---

### 15.4 Universities Collection

```js
University {
  _id: ObjectId,
  name: String,
  country: String,
  domain: String, // optional (.edu)
  createdAt: Date
}
```

Used to:
- Scope searches
- Prevent cross-university mixing

---

### 15.5 Courses Collection

```js
Course {
  _id: ObjectId,
  universityId: ObjectId,
  code: String,      // CS101
  name: String,      // Intro to CS
  isOnline: Boolean,
  createdBy: "admin",
  createdAt: Date
}
```

Indexes:
- (universityId + code) unique

---

### 15.6 Professors Collection

```js
Professor {
  _id: ObjectId,
  universityId: ObjectId,
  name: String,
  courses: [ObjectId], // Course IDs
  createdAt: Date
}
```

---

### 15.7 Teaching Assistants Collection

```js
TeachingAssistant {
  _id: ObjectId,
  universityId: ObjectId,
  name: String,
  courses: [ObjectId],
  createdAt: Date
}
```

---

### 15.8 Reviews Collection (Most Important)

```js
Review {
  _id: ObjectId,
  objectType: "course" | "professor" | "ta",
  objectId: ObjectId,
  universityId: ObjectId,

  userId: ObjectId,
  anonymous: Boolean,

  ratings: {
    difficulty: Number,      // 1–5
    wouldTakeAgain: Boolean,
    assignmentDifficulty: Number,
    examType: "online" | "offline" | "mixed",
    examStyle: "objective" | "subjective" | "both"
  },

  tags: [String],
  grade: String,
  attendanceMandatory: Boolean,
  textbookUsed: Boolean,

  reviewText: String,

  likes: Number,
  dislikes: Number,

  createdAt: Date
}
```

Constraints:
- Unique index on (userId + objectId)

---

### 15.9 Flags Collection

```js
Flag {
  _id: ObjectId,
  reviewId: ObjectId,
  reasonText: String,
  reportedBy: ObjectId,
  createdAt: Date,
  status: "pending" | "reviewed"
}
```

---

### 15.10 Aggregation Strategy

Aggregates are **not stored** permanently.

Computed via MongoDB aggregation pipelines:
- Average difficulty
- % would take again
- Tag frequency
- Review count

Benefits:
- No stale data
- Simpler updates

---

### 15.11 Relationships (Text ER Diagram)

```
University
  ├── Courses
  ├── Professors ──┐
  └── TAs          ├── Reviews
                    └── Users
```

---

### 15.12 Migration Strategy

- Each schema change = new migration file
- Never modify old data silently
- Migration files tracked in Git

---

End of Database Schema section.

---

## 16. API Specification (Backend Contract)

This section defines **all backend APIs**. Frontend and backend must strictly follow this contract. All responses are JSON.

---

### 16.1 API Conventions

- Base URL: `/api`
- Auth via **JWT (httpOnly cookie)**
- Protected routes require valid JWT
- All timestamps are ISO strings

Standard error format:
```json
{ "error": "MESSAGE" }
```

---

### 16.2 Authentication APIs

#### POST `/api/auth/google`
Login via Google OAuth.

Request:
```json
{ "token": "google_id_token" }
```
Response:
```json
{ "success": true }
```

---

#### POST `/api/auth/login`
Local login (admin only).

Request:
```json
{ "email": "admin@x.com", "password": "****" }
```

---

#### POST `/api/auth/logout`
Clears auth cookie.

---

### 16.3 User APIs

#### GET `/api/users/me`
Returns logged-in user profile.

Response:
```json
{ "pseudonym": "Student123", "role": "user" }
```

---

### 16.4 Search & Object APIs

#### GET `/api/search`
Query objects inside a university.

Query Params:
- `universityId`
- `type` = course | professor | ta
- `q`

Response:
```json
[{ "id": "...", "name": "CS101" }]
```

---

#### GET `/api/object/:type/:id`
Returns object details + aggregates.

Response:
```json
{
  "object": { "name": "CS101" },
  "stats": { "avgDifficulty": 3.4 },
  "reviews": []
}
```

---

### 16.5 Review APIs

#### POST `/api/reviews`
Create review.

Rules:
- One review per user per object

Request:
```json
{ "objectType": "course", "objectId": "...", "anonymous": true, "ratings": { "difficulty": 4 } }
```

---

#### PUT `/api/reviews/:id`
Edit own review.

---

#### DELETE `/api/reviews/:id`
Delete own review (hard delete).

---

#### POST `/api/reviews/:id/like`
Like a review.

---

#### POST `/api/reviews/:id/dislike`
Dislike a review.

---

### 16.6 Flagging APIs

#### POST `/api/flags`
Flag a review.

Request:
```json
{ "reviewId": "...", "reason": "Inappropriate language" }
```

---

### 16.7 Admin APIs (Protected)

#### POST `/api/admin/object`
Create course/professor/TA.

---

#### GET `/api/admin/flags`
View flagged reviews.

---

#### DELETE `/api/admin/review/:id`
Remove flagged review.

---

### 16.8 Rate Limiting

- 10 review actions / hour / user
- Enforced via middleware

---

### 16.9 Security Summary

- JWT in httpOnly cookies
- Role-based access control
- Input validation on all endpoints
- MongoDB query sanitization

---

End of API Specification.

---

## 17. Frontend Architecture & UX Flow (SvelteKit)

This section defines **how the frontend is structured**, how pages communicate with the backend, and how state/auth is handled. A frontend developer can build the UI without backend knowledge beyond the API spec.

---

### 17.1 Frontend Principles

- SvelteKit with SSR for SEO & speed
- Minimal global state
- API-driven UI
- Mobile-first responsive layout
- Accessibility-friendly

---

### 17.2 Folder Structure

```
client/src/
│── routes/
│   ├── +layout.svelte
│   ├── +layout.js
│   ├── +page.svelte            # Home / university search
│   ├── login/
│   │   └── +page.svelte
│   ├── university/[id]/
│   │   └── +page.svelte
│   ├── object/[type]/[id]/
│   │   └── +page.svelte
│   ├── review/new/
│   │   └── +page.svelte
│   ├── profile/
│   │   └── +page.svelte
│   ├── admin/
│   │   ├── +layout.svelte
│   │   ├── dashboard/
│   │   ├── flags/
│   │   └── objects/
│── lib/
│   ├── api.js
│   ├── auth.js
│   ├── components/
│   └── stores/
```

---

### 17.3 Global Layout (`+layout.svelte`)

Includes:
- Header (logo, search bar)
- Login / Profile button
- University selector
- Footer (terms/privacy)

Search behavior:
1. User selects university
2. Search restricted to that university
3. Dropdown selects course / professor / TA

---

### 17.4 Authentication Flow (Frontend)

- Login page redirects to auth provider
- JWT stored as httpOnly cookie
- `+layout.js` checks `/users/me`
- User state stored in memory (not localStorage)

---

### 17.5 Home Page (Search)

Features:
- University search
- Object search with type dropdown
- Autocomplete results

API Used:
- `/api/search`

---

### 17.6 Object Page (Course / Professor / TA)

URL:
```
/object/:type/:id
```

Sections:
- Object details
- Aggregated stats
- Sort options (recent, liked, rating)
- Paginated review list

Review cards:
- Anonymous or pseudonym
- Like / dislike buttons
- Flag option

---

### 17.7 Review Creation Page

Features:
- Dynamic form based on object type
- Anonymous toggle
- Validation before submit

API:
- `POST /api/reviews`

---

### 17.8 User Profile Page

Shows:
- User's submitted reviews
- Edit / delete buttons

SEO:
- Page blocked from indexing

---

### 17.9 Admin Dashboard

Protected via role check.

Sections:
- Object creation
- Flag review list
- Review moderation

API:
- `/api/admin/*`

---

### 17.10 State Management

- Auth state: derived from API
- No Redux
- Local component state + derived stores

---

### 17.11 Error Handling (Frontend)

- Global error boundary
- Inline form errors
- Toast notifications

---

### 17.12 Performance & SEO

- SSR enabled
- Dynamic meta tags per object
- No indexing for profiles
- Pagination instead of infinite scroll initially

---

End of Frontend Architecture section.

---

## 18. Docker, CI/CD & Deployment Pipeline

This section explains **how the project is built, tested, and deployed automatically** using free tools. It is written so a beginner can still follow while learning industry practices.

---

### 18.1 Why Docker is Used

Docker provides:
- Same environment for all developers
- Easy local setup
- Clear separation of frontend & backend
- Industry-standard deployment skills

Even if production hosting doesn’t fully rely on Docker, **learning Docker is valuable**.

---

### 18.2 Docker Setup (Local Development)

#### Backend Dockerfile (`server/Dockerfile`)

Responsibilities:
- Use Node LTS
- Install dependencies
- Load env variables
- Start server

Key concepts learned:
- Image layers
- Environment variables
- Exposed ports

---

#### Frontend Dockerfile (`client/Dockerfile`)

Responsibilities:
- Build SvelteKit app
- Serve SSR app

---

#### Docker Compose (`docker-compose.yml`)

Used for:
- Running frontend + backend together
- Optional MongoDB container (local only)

Services:
- client
- server

---

### 18.3 Environment Separation

Environment files:
- `.env.local`
- `.env.production`

Rules:
- Never commit secrets
- Render/Vercel store env vars securely

---

### 18.4 GitHub Repository Strategy

Branches:
- `main` → production
- `dev` → development

Rules:
- PR required to merge
- Tests must pass

---

### 18.5 CI Pipeline (GitHub Actions)

On every push:
1. Install dependencies
2. Run backend tests
3. Run frontend tests
4. Build Docker images (optional)

If tests fail → deployment blocked

---

### 18.6 Free Hosting Options (Chosen Stack)

#### Backend Hosting

Recommended:
- **Render** (free tier)

Features:
- Free Node.js hosting
- Env variable support
- Auto deploy from GitHub

---

#### Frontend Hosting

Recommended:
- **Vercel** or **Netlify**

Features:
- Free SvelteKit SSR
- Automatic HTTPS
- Fast global CDN

---

### 18.7 Deployment Flow (Step-by-Step)

1. Push code to GitHub
2. Connect backend repo to Render
3. Add environment variables
4. Deploy backend
5. Connect frontend repo to Vercel
6. Set API base URL
7. Deploy frontend

Result:
- Public URL
- Auto redeploy on every push

---

### 18.8 Database Deployment (MongoDB Atlas)

- Free tier cluster
- Automatic backups
- Encrypted at rest by default

---

### 18.9 Backup Strategy

Manual:
- Export collections as JSON

Automatic:
- MongoDB Atlas snapshots

Optional advanced:
- Cron job exporting data weekly

---

### 18.10 Production Checklist

- [ ] All env vars set
- [ ] Google auth domain verified
- [ ] Rate limiting enabled
- [ ] Admin account created
- [ ] SEO meta tags verified
- [ ] Backups enabled

---

### 18.11 What You Learn From This Setup

- Monorepo management
- Real CI/CD pipelines
- Secure deployments
- Production-grade practices

---

End of Docker & Deployment section.





