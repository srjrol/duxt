export default defineNuxtConfig({
  // https://v3.nuxtjs.org/guide/directory-structure/nuxt.config/

  // As of RC12 Nuxt 3 supports Hybrid rendering mode
  // https://v3.nuxtjs.org/guide/concepts/rendering#route-rules
  //   routeRules: {
  //     '/pages/**': { swr: true },
  //     '/posts/**': { static: true },
  //   },

  devtools: { enabled: true },
  
  css: [],

  modules: [
    '@nuxtjs/tailwindcss',
    // https://pinia.esm.dev
    '@pinia/nuxt',
    // https://nuxt.com/modules/pinia-plugin-persistedstate
    '@pinia-plugin-persistedstate/nuxt',
    // https://vueuse.org/
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      DIRECTUS_URL: process.env.DIRECTUS_URL,
    },
  },

  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
