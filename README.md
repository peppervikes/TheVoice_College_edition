# University Review Platform

A full-stack anonymous review platform for universities, inspired by RateMyProfessors.
Built with MongoDB, Express, Node.js, and SvelteKit.

## Getting Started

### 1. Database Setup
1. Create a free cluster on [MongoDB Atlas](https://account.mongodb.com/account/login).
2. Get your connection string (`mongodb+srv://<username>:<password>@cluster0...`).
3. Open `server/.env` and replace the placeholder `MONGO_URI` with your connection string.

### 2. Seed the Database (Fake Data)
To test the app, you need some initial data (Universities, Courses, TAs, Reviews).
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Run the seed command:
   ```bash
   npm run seed
   ```

### 3. Start the Backend Server
1. In the `server/` terminal, start the API:
   ```bash
   npm start
   ```

### 4. Start the Frontend App
1. Open a **new** terminal window and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Start the SvelteKit development server:
   ```bash
   npm run dev
   ```
3. Open your browser to [http://localhost:5173/](http://localhost:5173/).

**Demo Account:**
- Email: `admin@uni-review.com`
- Password: `admin123`
