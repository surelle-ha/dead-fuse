<template>
  <div class="min-h-screen bg-fuse-black flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Ambient background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-fuse-red/5 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuse-red/3 rounded-full blur-2xl" />
    </div>

    <div class="w-full max-w-lg animate-slide-up relative z-10">
      <!-- Header -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 bg-fuse-red rounded-sm flex items-center justify-center shadow-lg shadow-fuse-red/20">
            <span class="text-white font-mono text-xs font-bold">DF</span>
          </div>
          <span class="font-mono text-fuse-dim text-sm tracking-widest uppercase">DeadFuse.js</span>
        </div>
        <h1 class="text-3xl font-bold text-fuse-text mb-2">Server Setup Required</h1>
        <p class="text-fuse-dim text-sm leading-relaxed">
          DeadFuse needs a PostgreSQL database and JWT secret to operate. Configure the environment file, then restart the server.
        </p>
      </div>

      <!-- Steps -->
      <div class="space-y-4">

        <!-- Step 1 -->
        <div class="glass-panel">
          <div class="flex items-start gap-4">
            <div class="step-number">1</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-fuse-text font-bold text-sm mb-1">Create your environment file</h3>
              <p class="text-fuse-dim text-xs mb-3">In the <code class="code-inline">apps/dashboard/</code> directory, create a <code class="code-inline">.env</code> file:</p>
              <div class="code-block">
                <div class="code-block-header">
                  <span class="font-mono text-xs text-fuse-dim">apps/dashboard/.env</span>
                  <button @click="copy(envTemplate, 'env')" class="copy-btn">
                    {{ copied === 'env' ? '✓ Copied' : 'Copy' }}
                  </button>
                </div>
                <pre class="code-content">{{ envTemplate }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="glass-panel">
          <div class="flex items-start gap-4">
            <div class="step-number">2</div>
            <div class="flex-1">
              <h3 class="text-fuse-text font-bold text-sm mb-1">Fill in your values</h3>
              <div class="space-y-2 text-xs text-fuse-dim">
                <div class="env-row">
                  <code class="code-inline">DATABASE_URL</code>
                  <span>Your PostgreSQL connection string</span>
                </div>
                <div class="env-row">
                  <code class="code-inline">JWT_SECRET</code>
                  <span>Random string, min 32 chars — keep it secret</span>
                </div>
                <div class="env-row">
                  <code class="code-inline">APP_URL</code>
                  <span>The public URL of this dashboard</span>
                </div>
              </div>
              <div class="mt-3 p-3 bg-fuse-yellow/5 border border-fuse-yellow/20 rounded-lg">
                <p class="text-xs text-fuse-yellow font-mono">
                  💡 Need a JWT secret? Run this in your terminal:
                </p>
                <div class="code-block mt-2">
                  <div class="code-block-header">
                    <span class="font-mono text-xs text-fuse-dim">terminal</span>
                    <button @click="copy(secretCmd, 'secret')" class="copy-btn">
                      {{ copied === 'secret' ? '✓ Copied' : 'Copy' }}
                    </button>
                  </div>
                  <pre class="code-content">{{ secretCmd }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="glass-panel">
          <div class="flex items-start gap-4">
            <div class="step-number">3</div>
            <div class="flex-1">
              <h3 class="text-fuse-text font-bold text-sm mb-1">Restart the server</h3>
              <p class="text-fuse-dim text-xs mb-3">After saving the <code class="code-inline">.env</code> file, restart the dashboard:</p>
              <div class="code-block">
                <div class="code-block-header">
                  <span class="font-mono text-xs text-fuse-dim">terminal</span>
                  <button @click="copy(startCmd, 'start')" class="copy-btn">
                    {{ copied === 'start' ? '✓ Copied' : 'Copy' }}
                  </button>
                </div>
                <pre class="code-content">{{ startCmd }}</pre>
              </div>
              <p class="text-fuse-dim text-xs mt-2">The database tables will be created automatically on first start.</p>
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="glass-panel">
          <div class="flex items-start gap-4">
            <div class="step-number">4</div>
            <div class="flex-1">
              <h3 class="text-fuse-text font-bold text-sm mb-1">Register your account</h3>
              <p class="text-fuse-dim text-xs">Once the server restarts, return to the login page and use the <span class="text-fuse-text font-medium">Register</span> tab to create your admin account.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Check again button -->
      <div class="mt-6 flex gap-3">
        <button @click="checkStatus" :disabled="checking" class="btn-primary flex-1">
          <span v-if="checking">Checking…</span>
          <span v-else>Check Again →</span>
        </button>
      </div>

      <p class="text-center text-fuse-dim text-xs mt-6 font-mono">
        DeadFuse.js — Ethical License Enforcement
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const router = useRouter()
const copied = ref('')
const checking = ref(false)

const envTemplate = `DATABASE_URL=postgresql://user:password@localhost:5432/deadfuse
JWT_SECRET=your-super-secret-key-change-this-to-something-random
APP_URL=http://localhost:3000
WS_PATH=/fuse
PORT=3000`

const secretCmd = `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

const startCmd = `# Development
pnpm dev

# Production
pnpm build && node .output/server/index.mjs`

async function copy(text: string, key: string) {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = '' }, 2000)
}

async function checkStatus() {
  checking.value = true
  try {
    const status = await $fetch<{ configured: boolean }>('/api/onboarding/status')
    if (status.configured) {
      router.push('/login')
    } else {
      // Show subtle feedback
      alert('Server is not yet configured. Make sure your .env file is saved and the server has restarted.')
    }
  } catch {
    alert('Could not reach the server. Please restart it and try again.')
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
.glass-panel {
  @apply bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-xl p-5
  hover:border-white/[0.12] transition-all duration-200;
}

.step-number {
  @apply w-7 h-7 rounded-full bg-fuse-red/20 border border-fuse-red/40 text-fuse-red
  font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5;
}

.code-block {
  @apply bg-black/40 border border-white/[0.06] rounded-lg overflow-hidden;
}

.code-block-header {
  @apply flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06];
}

.code-content {
  @apply text-fuse-dim text-xs font-mono p-3 overflow-x-auto whitespace-pre leading-relaxed;
}

.code-inline {
  @apply bg-black/40 border border-white/[0.08] rounded px-1.5 py-0.5 font-mono text-fuse-text text-xs;
}

.env-row {
  @apply flex items-start gap-3 py-1.5 border-b border-white/[0.05] last:border-0;
}

.env-row code {
  @apply flex-shrink-0;
}

.copy-btn {
  @apply text-xs text-fuse-dim hover:text-fuse-text font-mono border border-white/[0.08]
  rounded px-2 py-0.5 transition-colors whitespace-nowrap;
}

.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md
  transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed;
}
</style>