/* https://docs.directus.io/guides/sdk/getting-started.html

If using TypeScript, you need to provide a Schema when creating a Directus client 
to make use of type hinting and completion. This schema contains definitions for each 
collection and provides you with type hints (on input) and completion (on output). 

*/

import { createDirectus, authentication, rest, graphql } from '@directus/sdk';
import { useAuth } from '~~/stores/auth';

// Custom storage class interfacing with Pinia auth store
class PiniaStorage {
  constructor(authStore) {
    this.authStore = authStore;
  }

  // This method will be called by Directus's getToken method
  // https://docs.directus.io/guides/sdk/authentication.html#get-a-token

  get() {
    return { token: this.authStore.userData.token };
  }

  // This method will be called by Directus's setToken method
  // https://docs.directus.io/guides/sdk/authentication.html#set-a-token

  set(data) {
    this.authStore.user.token = data.token;
  }
}

// Defining a Nuxt plugin to setup the Directus SDK
export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  const DIRECTUS_URL = config.public.DIRECTUS_URL;

  // Obtaining the auth store instance
  const auth = useAuth();

  // Creating an instance of your custom storage class
  const piniaStorage = new PiniaStorage(auth);

  // Creating a new instance of the SDK with custom storage class, authentication, GraphQL and REST modules
  const directus = createDirectus(DIRECTUS_URL)
    // https://docs.directus.io/guides/sdk/authentication.html#using-the-rest-composable
    .with(rest({ credentials: 'include' }))
    // https://docs.directus.io/guides/sdk/getting-started.html#using-graphql
    .with(graphql({ credentials: 'include' }))
    // https://docs.directus.io/guides/sdk/authentication.html#using-the-authentication-composable
    .with(
      authentication('json', {
        storage: new PiniaStorage(useAuth()),
        autoRefresh: true,
      })
    );

  // Fetching the current token using Directus's getToken method
  const token = await directus.getToken();
  const side = process.server ? 'server' : 'client'; // Determining the runtime environment

  // If there's a token but we don't have a user, fetch the user
  if (!auth.isLoggedIn && token) {
    console.log('Token found, fetching user from ' + side);
    console.log('Token is', token);
    try {
      // Fetching user info using your auth store's getUser method
      await auth.getUser();
      console.log('User fetched successfully from ' + side);
    } catch (e) {
      if (e instanceof Error) {
        console.log('Failed to fetch user from ' + side, e.message);
      } else {
        console.log('Failed to fetch user from ' + side, e);
      }
    }
  }

  // If the user is logged in but there's no token, reset the auth store
  if (auth.isLoggedIn && !token) {
    console.log('Token not found, resetting auth store from ' + side);
    auth.$reset(); // Resetting auth store
  }

  // Extending the Nuxt context and providing the Directus SDK instance for use within the app
  return {
    extendContext({ $directus }) {
      $directus = directus;
    },
    provide: { directus },
  };
});