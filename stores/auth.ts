// Import necessary dependencies
import { defineStore } from 'pinia';
import { readMe } from '@directus/sdk';

// Define the type for the user object in state
type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
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
  token: string;
  last_access?: string;
  last_page?: string;
  provider?: string;
  external_identifier?: string;
  auth_data?: Record<string, unknown>;
  email_notifications?: boolean;
  expires: number;
};

class PiniaStorage {
  constructor(private authStore: ReturnType<typeof useAuth>) {}

  // Return the entire user state
  get(): { data: User } | null {
    const { loggedIn, user } = this.authStore.$state;
    if (loggedIn && user) {
      return { data: user };
    }
    return null;
  }

  // Update the entire user state
  set(authData: { data: User }): void {
    this.authStore.updateUser(authData.data);
  }  
}

// Define your auth store
export const useAuth = defineStore('auth', {
  state: () => ({
    loggedIn: false,
    user: {
      id: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      location: '',
      title: '',
      description: '',
      tags: [],
      avatar: '',
      language: '',
      appearance: '',
      theme_light: '',
      theme_dark: '',
      theme_light_overrides: {},
      theme_dark_overrides: {},
      tfa_secret: '',
      status: '',
      role: '',
      token: '',
      last_access: '',
      last_page: '',
      provider: '',
      external_identifier: '',
      auth_data: {},
      email_notifications: false,
      expires: -1,
    } as User,
  }),

  getters: {
    isLoggedIn: (state) => state.loggedIn,
    userData: (state) => state.user,
  },

  actions: {
    async login({ email, password, redirect }: { email: string; password: string; redirect?: string }) {
      const router = useRouter();
      const { $directus } = useNuxtApp();
      try {
        const response = await $directus.login(email, password);
        this.$state.loggedIn = true;
        this.$state.user = {
          id: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          location: '',
          title: '',
          description: '',
          tags: [],
          avatar: '',
          language: '',
          appearance: '',
          theme_light: '',
          theme_dark: '',
          theme_light_overrides: {},
          theme_dark_overrides: {},
          tfa_secret: '',
          status: '',
          role: '',
          token: response.access_token !== null ? response.access_token : '',
          last_access: '',
          last_page: '',
          provider: '',
          external_identifier: '',
          auth_data: {},
          email_notifications: false,
          expires: response.expires !== null ? response.expires : -1,
        };
        
        if (response.access_token) {
          await this.getUser();
        }

        if (redirect) {
          router.push(redirect);
        }
      } catch (e) {
        console.log(e);
        throw new Error('Wrong email address or password');
      }

    },

    async logout() {
      const router = useRouter();
      const { $directus } = useNuxtApp();
  
      try {
        await $directus.logout();
        const authExpiration = useCookie('auth_expires_at');
        authExpiration.value = null;
  
        this.$state.loggedIn = false;
        this.$state.user = {
          id: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          location: '',
          title: '',
          description: '',
          tags: [],
          avatar: '',
          language: '',
          appearance: '',
          theme_light: '',
          theme_dark: '',
          theme_light_overrides: {},
          theme_dark_overrides: {},
          tfa_secret: '',
          status: '',
          role: '',
          token: '',
          last_access: '',
          last_page: '',
          provider: '',
          external_identifier: '',
          auth_data: {},
          email_notifications: false,
          expires: -1,
        };        
  
        router.push('/');
      } catch (e) {
        console.log(e);
        throw new Error('Issue logging out');
      }
    },

    async getUser() {
      const { $directus } = useNuxtApp();
      try {
        const user = await $directus.request(
          readMe({
            fields: ['*'], // Assuming this returns all fields necessary for the User type
          })
        );
  
        // You must ensure that 'user' contains all the properties required by the User type
        // The spread of 'this.$state.user' helps maintain any existing properties
        this.updateUser({
          ...this.$state.user, // Spread the current state to fill in any missing properties
          ...user, // Spread the fetched user
          token: this.$state.user.token, // Preserve the token
          expires: this.$state.user.expires // Preserve the expires
        });
      } catch (e) {
        console.log(e);
      }
    },
    
    updateUser(userData: User): void {
      // Ensure to remove or not include sensitive data like password
      const { password, ...safeUserData } = userData;
      this.$state.loggedIn = true;
      this.$state.user = safeUserData;
    },
    async resetState() {
      this.$reset();
    },
    persist: true,
  },
  
});


export { PiniaStorage };
