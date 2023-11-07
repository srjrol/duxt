import { createDirectus, authentication, rest, graphql } from '@directus/sdk';

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  const DIRECTUS_URL = config.public.DIRECTUS_URL;

  const directus = createDirectus(DIRECTUS_URL)
    .with(rest({ credentials: 'include' }))
    .with(graphql({ credentials: 'include' }))
    .with(authentication());

  // Provide the Directus client with authentication to the Nuxt context
  return {
    extendContext({ $directus }) {
      $directus = directus;
    },
    provide: { directus },
  };
});
