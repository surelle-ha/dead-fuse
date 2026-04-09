<template>
  <div class="min-h-screen bg-fuse-black flex items-center justify-center p-6">
    <div class="w-full max-w-sm animate-slide-up">
      <!-- Brand -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-fuse-red rounded-lg mb-4">
          <span class="text-white font-mono font-bold text-sm">DF</span>
        </div>
        <h1 class="text-2xl font-bold text-fuse-text">DeadFuse</h1>
        <p class="text-fuse-dim text-sm mt-1 font-mono">License Control Dashboard</p>
      </div>

      <!-- Tab switcher -->
      <div class="flex bg-fuse-zinc border border-fuse-border rounded-lg p-1 mb-6">
        <button v-for="tab in tabs" :key="tab"
          @click="mode = tab"
          class="flex-1 py-1.5 text-sm rounded-md font-medium transition-all duration-200 capitalize"
          :class="mode === tab ? 'bg-fuse-red text-white' : 'text-fuse-dim hover:text-fuse-text'">
          {{ tab }}
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="field-group">
          <label class="field-label">Email</label>
          <input v-model="email" type="email" required class="field-input" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="field-group">
          <label class="field-label">Password</label>
          <input v-model="password" type="password" required class="field-input" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <div v-if="error" class="error-box">{{ error }}</div>

        <button type="submit" :disabled="loading" class="btn-primary w-full mt-2">
          <span v-if="loading">{{ mode === 'login' ? 'Signing in…' : 'Creating account…' }}</span>
          <span v-else>{{ mode === 'login' ? 'Sign In →' : 'Create Account →' }}</span>
        </button>
      </form>

      <div v-if="mode === 'login'" class="mt-4">
        <button @click="loginWithGithub" type="button" class="btn-secondary w-full">
          Continue with GitHub
        </button>
      </div>

      <p class="text-center text-fuse-dim text-xs mt-8 font-mono">
        DeadFuse.js — Ethical License Enforcement
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const router = useRouter()
const tabs = ref<('login' | 'register')[]>(['login', 'register'])
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Check if already logged in
onMounted(async () => {
  try {
    await $fetch('/api/auth/me')
    router.push('/projects')
  } catch {}
})

async function submit() {
  error.value = ''
  loading.value = true
  const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register'
  try {
    await $fetch(endpoint, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    router.push('/projects')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

function loginWithGithub() {
  window.location.href = '/api/auth/github'
}
</script>

<style scoped>
.field-group { @apply flex flex-col gap-1.5; }
.field-label { @apply text-xs font-mono text-fuse-dim uppercase tracking-widest; }
.field-input {
  @apply w-full bg-fuse-zinc border border-fuse-border rounded-md px-3 py-2.5 text-fuse-text text-sm outline-none
  focus:border-fuse-red/60 focus:ring-1 focus:ring-fuse-red/20 transition-all duration-200 placeholder:text-fuse-muted;
}
.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md
  transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed;
}
.error-box {
  @apply bg-fuse-red/10 border border-fuse-red/30 text-fuse-red text-sm rounded-md px-3 py-2;
}
</style>
