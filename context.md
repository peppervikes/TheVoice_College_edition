# TheVoice - College Edition (RateMyCourse) — Project Context

This file serves as a comprehensive overview of the current state of the application. **Read this file first before starting any new tasks or sessions.**

## 1. What the App Is
A localized, premium-feel clone of RateMyProfessor explicitly designed for university courses. Students can register, search for courses (objects), leave detailed 1-5 rating reviews, and flag inappropriate content. Admins can moderate everything from a centralized dashboard.

## 2. Tech Stack & Infrastructure
- **Frontend**: SvelteKit (`adapter-auto` for Vercel deployment), TailwindCSS + native CSS for a brutalist/premium aesthetic.
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose (Models: User, Object, Review, Flag).
- **Authentication**: JWT-based session management. Supports both Local Auth (email/password) and Google OAuth (Identity Services / ID Token verification).
- **Hosting**:
  - Frontend: **Vercel** (`https://the-voice-college-edition.vercel.app`)
  - Backend: **Render** (`https://thevoice-college-edition.onrender.com`)
- **CI/CD**: GitHub Actions configured to run backend Jest tests and verify frontend builds on every push to `main`.
- **Error Tracking**: Backend has Sentry configured via Express middleware. 

## 3. Current Implementation Status (April 2026)

**Phase 1-6 are Complete**:
- ✅ **Database & Models**: Mongoose schemas fully defined with cascading deletes (deleting a course deletes its reviews).
- ✅ **Auth**: Local & Google Sign-in fully working in production. Role-Based Access Control (`admin` vs `user`) active using middleware.
- ✅ **Core API**: Complete CRUD APIs for reviews, courses (`objects`), flags, and admin moderation.
- ✅ **Frontend Pages**: Home search, Login/Register, Course pages, Review submission page, User profile (history).
- ✅ **Admin Panel**: Full frontend dashboard for Admins to view/resolve flags and manage courses.
- ✅ **Testing Framework**: Backend fully tested with `Jest` + `mongodb-memory-server` and `supertest` (17 tests passing across Auth, Flags, Objects, and Reviews). Rate limiters are excluded during testing to prevent false 429 timeouts.
- ✅ **Deployment**: Successfully pushed to production on Vercel and Render. Environment variables (including strict CORS headers) configured.

## 4. Known Gotchas & Environment Variables
- **CORS Requirements**: The backend `CLIENT_URL` environment variable must exactly match the frontend URL **with NO trailing slashes**. Mismatches cause browser preflight blockages.
- **Render Production Limitations**: Render requires `npm install` for the build command because standard dependencies (like `dotenv`) were failing to be reliably sourced with `npm ci --only=production`.
- **Role Verification**: JWT tokens store the user role. If an admin manually elevates a user's role in the MongoDB database, that user **must log out and log back in** to get a freshly signed JWT containing the new `admin` status.

## 5. Potential Next Steps (Future Roadmap)
If picking up the project, consider these potential additions:
1. **Frontend Sentry**: We only put Sentry on the backend. We can install `@sentry/sveltekit` to track frontend network errors and browser crashes.
2. **E2E Testing**: Set up Playwright (Phase 5.3) for end-to-end browser tests of the login and review submission UI routes.
3. **Mobile OTP/Phone Auth**: The roadmap mentioned phone/OTP sign-in, which has not yet been integrated (likely requiring Twilio or Firebase Phone Auth).
4. **UI Polish**: Expand animations, dark mode refinements, and add SEO optimizations like dynamic meta tags on course pages.
