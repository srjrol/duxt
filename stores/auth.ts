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

// Define your custom storage class
class PiniaStorage {
  constructor(private authStore: ReturnType<typeof useAuth>) {}

  get(): { data: { access_token: string; expires: number } } | null {
    const { loggedIn, user } = this.authStore.$state;
    if (loggedIn && user.token && user.expires) {
      return {
        data: {
          access_token: user.token,
          expires: user.expires,
        },
      };
    }
    return null;
  }

  set(authData: { data: { access_token: string; expires: number } }): void {
    const { access_token, expires } = authData.data;
    this.authStore.$state.loggedIn = true;
    this.authStore.$state.user = {
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
      token: access_token,
      last_access: '',
      last_page: '',
      provider: '',
      external_identifier: '',
      auth_data: {},
      email_notifications: false,
      expires: expires,
    };
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
      console.log("getUser: ", $directus)
      try {
        const user = await $directus.request(
          readMe({
            fields: ['*'],
          })
        );
        console.log(user)
        this.$state.loggedIn = true;
        this.$state.user = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password: user.password,
          location: user.location,
          title: user.title,
          description: user.description,
          tags: user.tags,
          avatar: user.avatar,
          language: user.language,
          appearance: user.appearance,
          theme_light: user.theme_light,
          theme_dark: user.theme_dark,
          theme_light_overrides: user.theme_light_overrides,
          theme_dark_overrides: user.theme_dark_overrides,
          tfa_secret: user.tfa_secret,
          status: user.status,
          role: user.role,
          token: user.token || '',
          last_access: user.last_access,
          last_page: user.last_page,
          provider: user.provider,
          external_identifier: user.external_identifier,
          auth_data: user.auth_data,
          email_notifications: user.email_notifications,
          expires: user.expires || -1,
        };
      } catch (e) {
        console.log(e);
      }
    },  
    
    async resetState() {
      this.$reset();
    },
  },
});

export { PiniaStorage };
