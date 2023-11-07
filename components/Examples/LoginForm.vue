<template>
  <form @submit.prevent="login">
    <VAlert v-if="error" type="error" class="mb-4"> Error: {{ error }} </VAlert>
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <VLoading class="w-24 h-24 text-primary-600" />
    </div>
    <div class="space-y-4" v-if="!loading">
      <VInput
        v-model="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="john@example.com"
        required
      />
      <VInput
        v-model="password"
        name="password"
        type="password"
        label="Password"
        required
      />
      <div class="flex items-center justify-end space-x-4">
        <VButton type="button" @click="loadDemoUser()">Load Demo User</VButton>
        <VButton
          type="submit"
          variant="primary"
          :disabled="!email || !password"
        >
          <span>Login with Directus 🐇</span>
        </VButton>
      </div>
    </div>
  </form>
</template>

<script setup>

// Import the auth store from pinia
import { useAuth } from '~~/stores/auth'
const auth = useAuth()

const email = ref()
const password = ref()
const error = ref(null)
const loading = ref(false)

function loadDemoUser() {
  email.value = 'admin@example.com'
  password.value = 'password'
}

async function login() {
  loading.value = true
  error.value = null
  try {
    console.log('Attempting to login with:', email.value);
    await auth.login(email.value, password.value);
    console.log('Login successful:', auth.user);
    email.value = ''
    password.value = ''
  } catch (e) {
    console.error('Login failed:', e);
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
