// Import necessary dependencies
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { useNuxtApp } from '#app';
import { readMe } from '@directus/sdk';

// Define the type for the user object in state
type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // No need for password, token, and expires in the state, as they will be managed by Directus
  location?: string;
  title?: string;
  description?: string;
  tags?: Array<string>;
  avatar?: string;
  language?: string;
  appearance?: string;
  theme_light?: string;
  theme_dark?: string;
  theme_light_overrides?: Record<string, unknown>;
  theme_dark_overrides?: Record<string, unknown>;
  tfa_secret?: string;
  status?: string;
  role?: string;
  last_access?: string;
  last_page?: string;
  provider?: string;
  external_identifier?: string;
  auth_data?: Record<string, unknown>;
  email_notifications?: boolean;
};

// Define your auth store
export const useAuth = defineStore('auth', {
  state: () => ({
    loggedIn: false,
    user: {} as User, // Initialize an empty user object
  }),

  getters: {
    isLoggedIn: (state) => state.loggedIn,
    userData: (state) => state.user,
  },

  actions: {
    async login(email: string, password: string, redirect?: string) {
      const router = useRouter();
      const { $directus } = useNuxtApp();
      try {
        // Directus manages the login and token internally
        await $directus.login(email, password);
        // After login, fetch the user's details
        await this.getUser();
        this.loggedIn = true;

        // Redirect if necessary
        if (redirect) {
          router.push(redirect);
        }
      } catch (e) {
        console.error('Login action error:', e);
        throw new Error('Wrong email address or password');
      }
    },

    async logout() {
      const router = useRouter();
      const { $directus } = useNuxtApp();

      try {
        // Directus handles the logout process
        await $directus.logout();
        // Reset the user state
        this.$reset();
        router.push('/');
      } catch (e) {
        console.error('Issue logging out', e);
        throw new Error('Issue logging out');
      }
    },

    async getUser() {
      const { $directus } = useNuxtApp();
      try {
        // Fetching user details from Directus
        const userDetails = await $directus.request(readMe());
        this.updateUser(userDetails);
        this.loggedIn = true;
      } catch (e) {
        console.error('getUser action error:', e);
        throw e; // Throw the error to be handled by the calling function
      }
    },

    updateUser(userData: Partial<User>): void {
      // Update the user state with the new user data
      Object.assign(this.user, userData);
    },

    resetState() {
      this.$reset();
    },
  },
  
  // Enable Pinia state persistence
  persist: true,
});
