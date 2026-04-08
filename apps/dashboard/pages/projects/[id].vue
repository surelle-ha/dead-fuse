<template>
  <div class="min-h-screen bg-fuse-black">
    <!-- Nav -->
    <nav class="border-b border-fuse-border px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="navigateTo('/projects')" class="text-fuse-dim hover:text-fuse-text transition-colors text-sm">← Projects</button>
        <span class="text-fuse-border">/</span>
        <span class="text-fuse-text font-medium text-sm">{{ project?.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="wsConnected ? 'bg-fuse-green animate-pulse-slow' : 'bg-fuse-muted'" />
        <span class="text-fuse-dim text-xs font-mono">{{ wsConnected ? `${connectedClients} client(s) live` : 'no clients' }}</span>
      </div>
    </nav>

    <main v-if="project" class="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-slide-up">
      <!-- Project header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-fuse-text">{{ project.name }}</h1>
          <p class="text-fuse-dim text-sm mt-1 font-mono">{{ project.project_key }}</p>
        </div>
        <StatusBadge :state="project.state" size="lg" />
      </div>

      <!-- Current state panel -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat-card">
          <span class="stat-label">Current State</span>
          <span class="stat-value" :class="stateColor(project.state)">{{ project.state }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Grace Period</span>
          <span class="stat-value">{{ project.grace_period }} days</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Last Updated</span>
          <span class="stat-value text-sm">{{ formatDate(project.updated_at) }}</span>
        </div>
      </div>

      <!-- State controls -->
      <div class="panel">
        <h2 class="panel-title">State Control</h2>
        <StateToggle :current="project.state" @change="updateState" :loading="stateLoading" />
      </div>

      <!-- Message -->
      <div class="panel">
        <h2 class="panel-title">Client Message</h2>
        <p class="text-fuse-dim text-xs mb-3">This message is sent to clients and shown in WARNING and LOCKED states.</p>
        <div class="flex gap-3">
          <input v-model="message" type="text" class="field-input flex-1" placeholder="Invoice overdue. Please contact support." />
          <button @click="updateMessage" :disabled="msgLoading" class="btn-secondary">
            {{ msgLoading ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Grace period -->
      <div class="panel">
        <h2 class="panel-title">Grace Period</h2>
        <p class="text-fuse-dim text-xs mb-3">Number of days before restrictions are enforced after a state change.</p>
        <div class="flex gap-3 items-center">
          <input v-model.number="gracePeriod" type="number" min="0" max="365" class="field-input w-28" />
          <span class="text-fuse-dim text-sm">days</span>
          <button @click="updateGracePeriod" :disabled="graceLoading" class="btn-secondary ml-auto">
            {{ graceLoading ? 'Saving…' : 'Update' }}
          </button>
        </div>
      </div>

      <!-- Integration tokens -->
      <div class="panel">
        <h2 class="panel-title">Integration</h2>
        <div class="space-y-4">
          <div>
            <label class="field-label">Project ID (projectId)</label>
            <div class="token-row">
              <code class="text-fuse-text text-xs flex-1 truncate">{{ project.project_key }}</code>
              <button @click="copy(project.project_key, 'key')" class="copy-btn">
                {{ copied === 'key' ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
          </div>
          <div>
            <label class="field-label">Public Token (token)</label>
            <div class="token-row">
              <code class="text-fuse-text text-xs flex-1 truncate">{{ project.public_token }}</code>
              <button @click="copy(project.public_token, 'token')" class="copy-btn">
                {{ copied === 'token' ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
          </div>
          <div>
            <label class="field-label">Usage Snippet</label>
            <div class="bg-fuse-zinc border border-fuse-border rounded-lg p-4 relative">
              <button @click="copy(snippet, 'snippet')" class="copy-btn absolute top-3 right-3">
                {{ copied === 'snippet' ? '✓ Copied' : 'Copy' }}
              </button>
              <pre class="text-xs text-fuse-dim overflow-x-auto whitespace-pre">{{ snippet }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div v-if="statusMsg" class="fixed bottom-6 right-6 bg-fuse-zinc border px-4 py-2 rounded-lg text-sm font-mono transition-all"
        :class="statusMsg.type === 'success' ? 'border-fuse-green text-fuse-green' : 'border-fuse-red text-fuse-red'">
        {{ statusMsg.text }}
      </div>
    </main>

    <div v-else-if="notFound" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-fuse-dim mb-4">Project not found.</p>
        <button @click="navigateTo('/projects')" class="btn-primary">Back to Projects</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const project = ref<any>(null)
const notFound = ref(false)
const stateLoading = ref(false)
const msgLoading = ref(false)
const graceLoading = ref(false)
const message = ref('')
const gracePeriod = ref(3)
const copied = ref('')
const wsConnected = ref(false)
const connectedClients = ref(0)
const statusMsg = ref<{ text: string; type: 'success' | 'error' } | null>(null)

let statusTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  try {
    project.value = await $fetch<any>(`/api/projects/${id}`)
    message.value = project.value.message || ''
    gracePeriod.value = project.value.grace_period
  } catch {
    notFound.value = true
    return
  }
})

const snippet = computed(() => {
  if (!project.value) return ''
  const appUrl = window.location.origin
  return `import DeadFuse from "dead-fuse";

DeadFuse.activate({
  projectId: "${project.value.project_key}",
  master: "${appUrl.replace('http', 'ws')}/fuse",
  token: "${project.value.public_token}",
  fallbackMode: "readonly",
  onActive: () => console.log("Active"),
  onWarning: (msg) => alert(msg),
  onReadonly: () => console.warn("Read-only mode"),
  onLocked: (msg) => { document.body.innerHTML = msg; },
});`
})

function stateColor(state: string) {
  const map: Record<string, string> = {
    ACTIVE: 'text-fuse-green',
    WARNING: 'text-fuse-yellow',
    READONLY: 'text-fuse-blue',
    LIMITED: 'text-fuse-orange',
    LOCKED: 'text-fuse-red',
    EXPIRED: 'text-fuse-red',
    SLEEP: 'text-fuse-dim',
    SELF_DESTRUCT: 'text-fuse-purple',
  }
  return map[state] || 'text-fuse-text'
}

function formatDate(d: string) {
  return new Date(d).toLocaleString()
}

async function updateState(newState: string) {
  stateLoading.value = true
  try {
    const updated = await $fetch(`/api/projects/${id}/state`, {
      method: 'POST',
      body: { state: newState, message: message.value },
    })
    project.value = updated
    showStatus(`State changed to ${newState}`, 'success')
  } catch (err: any) {
    showStatus(err?.data?.statusMessage || 'Failed to update state', 'error')
  } finally {
    stateLoading.value = false
  }
}

async function updateMessage() {
  msgLoading.value = true
  try {
    const updated = await $fetch(`/api/projects/${id}/state`, {
      method: 'POST',
      body: { message: message.value },
    })
    project.value = updated
    showStatus('Message saved', 'success')
  } catch {
    showStatus('Failed to save message', 'error')
  } finally {
    msgLoading.value = false
  }
}

async function updateGracePeriod() {
  graceLoading.value = true
  try {
    const updated = await $fetch(`/api/projects/${id}/state`, {
      method: 'POST',
      body: { gracePeriod: gracePeriod.value },
    })
    project.value = updated
    showStatus('Grace period updated', 'success')
  } catch {
    showStatus('Failed to update grace period', 'error')
  } finally {
    graceLoading.value = false
  }
}

async function copy(text: string, key: string) {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = '' }, 2000)
}

function showStatus(text: string, type: 'success' | 'error') {
  statusMsg.value = { text, type }
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => { statusMsg.value = null }, 3000)
}
</script>

<style scoped>
.panel {
  @apply bg-fuse-carbon border border-fuse-border rounded-xl p-6;
}
.panel-title {
  @apply text-sm font-bold text-fuse-text uppercase tracking-widest font-mono mb-4;
}
.stat-card {
  @apply bg-fuse-carbon border border-fuse-border rounded-xl p-4 flex flex-col gap-1;
}
.stat-label {
  @apply text-xs font-mono text-fuse-dim uppercase tracking-widest;
}
.stat-value {
  @apply text-lg font-bold text-fuse-text font-mono;
}
.field-label {
  @apply text-xs font-mono text-fuse-dim uppercase tracking-widest block mb-1.5;
}
.field-input {
  @apply w-full bg-fuse-zinc border border-fuse-border rounded-md px-3 py-2.5 text-fuse-text text-sm outline-none
  focus:border-fuse-red/60 focus:ring-1 focus:ring-fuse-red/20 transition-all duration-200 placeholder:text-fuse-muted;
}
.btn-primary {
  @apply bg-fuse-red hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-md transition-all duration-200;
}
.btn-secondary {
  @apply bg-fuse-zinc border border-fuse-border hover:border-fuse-muted text-fuse-text text-sm px-4 py-2.5
  rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed;
}
.token-row {
  @apply flex items-center gap-3 bg-fuse-zinc border border-fuse-border rounded-lg px-3 py-2 mt-1;
}
.copy-btn {
  @apply text-xs text-fuse-dim hover:text-fuse-text font-mono border border-fuse-border rounded px-2 py-0.5
  transition-colors whitespace-nowrap;
}
</style>
