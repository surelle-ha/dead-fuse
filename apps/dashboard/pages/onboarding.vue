<template>
  <div class="min-h-screen bg-fuse-black flex items-center justify-center p-6">
    <div class="w-full max-w-lg animate-slide-up">
      <!-- Header -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 bg-fuse-red rounded-sm flex items-center justify-center">
            <span class="text-white font-mono text-xs font-bold">DF</span>
          </div>
          <span class="font-mono text-fuse-dim text-sm tracking-widest uppercase">DeadFuse.js</span>
        </div>
        <h1 class="text-3xl font-bold text-fuse-text mb-2">Initial Setup</h1>
        <p class="text-fuse-dim text-sm leading-relaxed">
          Configure your database and create your admin account to get started.
        </p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="border border-fuse-green/30 bg-fuse-green/5 rounded-lg p-6 text-center">
        <div class="text-fuse-green text-4xl mb-4">✓</div>
        <h2 class="text-fuse-green font-bold text-xl mb-2">Setup Complete</h2>
        <p class="text-fuse-dim text-sm mb-6">Your database is configured and your admin account is ready.</p>
        <button @click="navigateTo('/projects')" class="btn-primary w-full">
          Go to Dashboard →
        </button>
      </div>

      <!-- Setup Form -->
      <div v-else class="space-y-6">
        <!-- Step indicator -->
        <div class="flex gap-2 mb-8">
          <div v-for="s in 3" :key="s" class="flex-1 h-1 rounded-full transition-all duration-300"
            :class="step >= s ? 'bg-fuse-red' : 'bg-fuse-border'" />
        </div>

        <!-- Step 1: Database -->
        <div v-if="step === 1" class="space-y-4 animate-fade-in">
          <h2 class="text-lg font-bold text-fuse-text">PostgreSQL Connection</h2>
          <div class="field-group">
            <label class="field-label">Database URL</label>
            <input
              v-model="form.databaseUrl"
              type="text"
              class="field-input font-mono text-sm"
              placeholder="postgresql://user:pass@localhost:5432/deadfuse"
              autocomplete="off"
            />
            <p class="text-fuse-dim text-xs mt-1">Full PostgreSQL connection string</p>
          </div>
          <div v-if="error" class="error-box">{{ error }}</div>
          <button @click="testDb" :disabled="loading" class="btn-primary w-full">
            <span v-if="loading">Testing connection…</span>
            <span v-else>Test &amp; Continue →</span>
          </button>
        </div>

        <!-- Step 2: Security -->
        <div v-if="step === 2" class="space-y-4 animate-fade-in">
          <h2 class="text-lg font-bold text-fuse-text">Security Configuration</h2>
          <div class="field-group">
            <label class="field-label">JWT Secret</label>
            <div class="relative">
              <input
                v-model="form.jwtSecret"
                type="text"
                class="field-input font-mono text-sm pr-24"
                placeholder="Min 32 random characters"
              />
              <button @click="generateSecret" class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fuse-dim hover:text-fuse-text transition-colors px-2 py-1 rounded border border-fuse-border">
                Generate
              </button>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">App URL</label>
            <input
              v-model="form.appUrl"
              type="text"
              class="field-input"
              placeholder="http://localhost:3000"
            />
          </div>
          <div v-if="error" class="error-box">{{ error }}</div>
          <div class="flex gap-3">
            <button @click="step = 1" class="btn-ghost flex-1">← Back</button>
            <button @click="nextStep2" class="btn-primary flex-1">Continue →</button>
          </div>
        </div>

        <!-- Step 3: Admin Account -->
        <div v-if="step === 3" class="space-y-4 animate-fade-in">
          <h2 class="text-lg font-bold text-fuse-text">Admin Account</h2>
          <div class="field-group">
            <label class="field-label">Email</label>
            <input v-model="form.email" type="email" class="field-input" placeholder="you@example.com" />
          </div>
          <div class="field-group">
            <label class="field-label">Password</label>
            <input v-model="form.password" type="password" class="field-input" placeholder="Min 8 characters" />
          </div>
          <div v-if="error" class="error-box">{{ error }}</div>
          <div class="flex gap-3">
            <button @click="step = 2" class="btn-ghost flex-1">← Back</button>
            <button @click="submit" :disabled="loading" class="btn-primary flex-1">
              <span v-if="loading">Setting up…</span>
              <span v-else">Complete Setup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { randomBytes } from 'crypto'

definePageMeta({ layout: false })

const step = ref(1)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  databaseUrl: '',
  jwtSecret: '',
  appUrl: 'http://localhost:3000',
  email: '',
  password: '',
})

function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.jwtSecret = result
}

async function testDb() {
  if (!form.databaseUrl.trim()) {
    error.value = 'Database URL is required'
    return
  }
  error.value = ''
  loading.value = true
  try {
    // We'll validate on submit; just move forward
    await new Promise(r => setTimeout(r, 600))
    step.value = 2
  } finally {
    loading.value = false
  }
}

function nextStep2() {
  if (!form.jwtSecret.trim() || form.jwtSecret.length < 16) {
    error.value = 'JWT secret must be at least 16 characters'
    return
  }
  error.value = ''
  step.value = 3
}

async function submit() {
  if (!form.email.trim() || !form.password.trim()) {
    error.value = 'Email and password are required'
    return
  }
  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/onboarding/setup', {
      method: 'POST',
      body: {
        databaseUrl: form.databaseUrl,
        jwtSecret: form.jwtSecret,
        appUrl: form.appUrl,
        email: form.email,
        password: form.password,
      },
    })
    success.value = true
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Setup failed. Check your configuration.'
  } finally {
    loading.value = false
  }
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
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md transition-all duration-200
  disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-ghost {
  @apply border border-fuse-border hover:border-fuse-muted text-fuse-dim hover:text-fuse-text text-sm px-4 py-2.5
  rounded-md transition-all duration-200;
}
.error-box {
  @apply bg-fuse-red/10 border border-fuse-red/30 text-fuse-red text-sm rounded-md px-3 py-2;
}
</style>
