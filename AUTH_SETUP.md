# Authentication Setup Guide

This job portal now has simple authentication using json-server. Follow these steps to run it:

## Setup

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Run json-server in one terminal
```bash
npm run server
```

This will start json-server on `http://localhost:5000` with the data from `db.json`

### 3. Run Next.js dev server in another terminal
```bash
npm run dev
```

This will start the Next.js app on `http://localhost:3000`

## How It Works

### Database (db.json)
- Contains `users` and `jobs` arrays
- Sample users are pre-loaded for testing:
  - Email: `john@example.com` | Password: `password123`
  - Email: `jane@example.com` | Password: `password123`

### API Endpoints
- **POST `/api/signup`** - Register a new user
  - Body: `{ name, email, password }`
  - Checks if email already exists

- **POST `/api/login`** - Login user
  - Body: `{ email, password }`
  - Returns user data and token

- **POST `/api/logout`** - Logout user
  - Clears frontend session (localStorage)

### Authentication Flow
1. User fills signup form → POST to `/api/signup`
2. New user saved to json-server (db.json)
3. User redirected to login page
4. User fills login form → POST to `/api/login`
5. Credentials validated against json-server
6. Token + user data stored in localStorage
7. User redirected to dashboard
8. Dashboard checks for auth token and redirects to login if not authenticated

### Protected Pages
- **Dashboard** - Requires login, redirects to login if not authenticated
- **Saved** - (Can be protected similarly)
- **Profile** - (Can be protected similarly)

### Features
- Simple token-based session management (localStorage)
- Navbar shows welcome message and logout button when logged in
- Auto redirect from login to dashboard if already logged in
- Auto redirect from dashboard to login if not logged in

## Testing

### Test Signup
1. Go to `http://localhost:3000/signup`
2. Fill in name, email, password
3. Click Register
4. Should redirect to login page with success message

### Test Login
1. Go to `http://localhost:3000/login`
2. Use test credentials:
   - Email: `john@example.com`
   - Password: `password123`
3. Should redirect to dashboard
4. Navbar should show "Welcome, John Doe!" with logout button

### Test Logout
1. Click the "Logout" button in navbar
2. Should redirect to login page
3. Navbar should show login link again

## Production Notes
- ⚠️ **IMPORTANT**: This is a student project setup. For production:
  - Hash passwords with bcrypt instead of storing plaintext
  - Use proper JWT tokens instead of simple string tokens
  - Implement secure session management
  - Add CSRF protection
  - Use HTTPS
  - Add rate limiting
  - Add input validation and sanitization
