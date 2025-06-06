# Moral Torture Machine

This project is a simple React application that generates ethical dilemmas.
It fetches data from a backend API and provides a mock distribution of user choices.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment example file and adjust the backend URL if needed:
   ```bash
   cp .env.example .env
   # then edit .env to point to your backend
   ```
   Add your Google OAuth client ID in the new `REACT_APP_GOOGLE_CLIENT_ID` field.
   Without it, Google login will be disabled.
3. Run the development server:
   ```bash
   npm start
   ```
4. Build for production:
   ```bash
   npm run build
   ```

The app is served from `public/index.html` during development and the
compiled output is generated in the `build` folder.
