# Identified Issues & Future Roadmap

This document serves as a centralized tracker for all identified issues, planned enhancements, architectural changes, and security audits for the RateMyCourse platform.

---

## 1. UI / UX Refinements (The "Premium Feel" Audit)
- **Global Typography Scaling**: The text sizes across all pages (especially `text-6xl`, `text-8xl`, and massive paddings) are currently too large, making the app feel unbalanced or like a "kid's website." 
  - *Fix*: Downscale global heading classes, utilize standard `rem` scaling, and reduce component padding to create a sleeker, more professional brutalist aesthetic.
- **Footer Pages**: The four footer links (Terms, Privacy, Contact, Archive) currently lead nowhere. 
  - *Fix*: Create dedicated `+page.svelte` routes for each with basic placeholder UI text.
- **Authentication Flow**: The Google Sign-In currently appears as a native browser notification/dropdown on the top right.
  - *Fix*: Implement a custom, centered Pop-up Modal that cleanly presents the options to "Login with existing account" or "Create new account" using standard OAuth buttons.
- **Review Author Display**: 
  - *Fix*: If a user selects anonymous, exactly display "Anonymous". If not, just display their chosen pseudonym (remove the generic "Student" prefix).
- **Course & Review Cards**:
  - *List View Cards*: Course cards in the search results currently lack info. They should display aggregated stats directly on the card (e.g., 4/5 star rating, "80% would recommend").
  - *Stats Section Layout*: The aggregated stats cards on the specific course page are too large. They need to be compacted and clearly display detailed insights (e.g., "Most chose online exams", "X students found it easy").
  - *Review Details*: Individual review cards currently only show difficulty and the text payload. They must be updated to neatly display all newly added fields (Lenient Marking, Exam Style, Easy Projects, etc.) using a tag or grid system.

## 2. Search & Data Relations
- **Course Alias Searching**: Just like Universities, Courses often have short forms (e.g., "FP 101" for "Fundamentals of Programming"). 
  - *Fix*: Ensure the backend search functionality parses and matches these short-form queries for courses.
- **Admin Dashboard Improvements**:
  - *University List*: Display a comprehensive list of all existing universities directly in the admin dashboard.
  - *Relational Linking*: When an Admin creates a Professor or TA, add a multi-select UI to link them to specific `Courses` and their overarching `University`.
- **Global Professor Search**: Add the ability to search for a Professor globally across the entire platform.

---

## 3. Pending Optimizations (From Previous Session)
- **Root Page Search Performance (Client-Side Caching)**: Replace the debounced API calls on the root page with a "Redis-style" in-memory cache. Fetch the entire university list once on load, and perform instant client-side regex filtering.
- **UI Cleanup**: Remove the obsolete "Quick Search" section on the root page.

---

## 4. Architectural & Security Threats (AI Audit)

Upon analyzing the codebase and current architecture, the following critical issues and disadvantages were identified:

### Security Threats
1. **JWT Storage in LocalStorage (High Risk)**:
   - *Issue*: The frontend currently stores the authentication JWT in browser `localStorage` (`api.js` line 21). This makes the app highly vulnerable to Cross-Site Scripting (XSS) attacks, where malicious scripts could steal user sessions.
   - *Fix*: Move the JWT into a strictly `httpOnly`, `Secure` cookie set by the backend.
2. **Rate Limiting Gaps (Medium Risk)**:
   - *Issue*: While `express-rate-limit` is installed, we need to ensure strict limits are applied specifically to the `POST /reviews` endpoint to prevent spam/bot attacks from flooding a course with fake 5-star ratings.

### Architectural Disadvantages (Code Debt)
1. **Lack of Server-Side Rendering (SSR)**:
   - *Issue*: Almost all data fetching in the frontend happens via Svelte's `onMount` (client-side rendering). This is a massive disadvantage for a platform like this because search engines (Google) won't be able to index the Course or University pages effectively (poor SEO), and users see "Loading..." states.
   - *Fix*: Migrate data fetching from `onMount` inside `+page.svelte` components to SvelteKit's `+page.js` or `+page.server.js` `load` functions.
2. **Search Pagination**:
   - *Issue*: If a university has thousands of courses, the `/api/search` endpoint returning them all at once will cause massive slowdowns.
   - *Fix*: Implement infinite scrolling or standard pagination (`?page=1&limit=20`) on the backend and frontend.
3. **Database Cascading**:
   - *Issue*: If an admin deletes a Course, we must ensure all associated Reviews for that course are also deleted (cascading deletes) to prevent orphaned data from bloating the MongoDB database.

### Recommended Features
1. **User Profile Dashboard**: Users need a page to view all their past reviews and easily edit or delete them.
2. **Review Upvoting/Downvoting**: The schema supports `likes` and `dislikes`. We should wire this up in the frontend so users can upvote the most helpful reviews.
3. **Report/Moderation Queue**: A dedicated UI in the Admin Dashboard to review flagged content and ban malicious users.
4. **Bulk Excel Data Importer (Job Runner)**: Adding universities and courses one-by-one is too slow. We need a background process/script that parses a strictly formatted Excel/CSV template to bulk-insert universities, courses, professors, and TAs into the database reliably.
