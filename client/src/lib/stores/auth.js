import { writable } from 'svelte/store';
import api from '$lib/api.js';

/**
 * Auth Store
 * 
 * Manages the current user's authentication state across the entire app.
 * 
 * State shape:
 *   { user: { id, email, pseudonym, role } | null, token: string | null, isLoggedIn: boolean }
 * 
 * Usage in components:
 *   import { auth, login, logout, register, loadSession } from '$lib/stores/auth.js';
 *   $auth.isLoggedIn  → boolean
 *   $auth.user         → user object or null
 */

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    token: null,
    isLoggedIn: false
  });

  return {
    subscribe,

    /**
     * Initialize: Check localStorage for existing session on app load.
     * Calls GET /api/auth/me to verify the token is still valid.
     */
    loadSession: async () => {
      if (typeof window === 'undefined') return; // Skip on SSR

      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token) {
        set({ user: null, token: null, isLoggedIn: false });
        return;
      }

      try {
        // Verify token is still valid by calling /me
        const res = await api.get('/auth/me');
        const user = res.data;

        set({ user, token, isLoggedIn: true });
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isLoggedIn: false });
      }
    },

    /**
     * Login with email + password.
     * Stores token + user in localStorage and updates the store.
     */
    login: async (email, password) => {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoggedIn: true });
      return user;
    },

    /**
     * Register a new account.
     * Auto-logs in on success.
     */
    register: async (email, password, pseudonym) => {
      const res = await api.post('/auth/register', { email, password, pseudonym });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoggedIn: true });
      return user;
    },

    /**
     * Google login.
     * Sends the Google credential token to the backend.
     */
    googleLogin: async (credential) => {
      const res = await api.post('/auth/google', { credential });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoggedIn: true });
      return user;
    },

    /**
     * Logout.
     * Clears localStorage and resets the store.
     */
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoggedIn: false });
    }
  };
}

export const auth = createAuthStore();
