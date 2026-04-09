<template>
  <div class="min-h-screen bg-fuse-black">
    <!-- Nav -->
    <nav class="border-b border-fuse-border/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-fuse-black/80 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <button @click="navigateTo('/projects')" class="text-fuse-dim hover:text-fuse-text transition-colors text-sm flex items-center gap-1.5">
          <span>←</span> <span>Projects</span>
        </button>
        <span class="text-fuse-border">/</span>
        <span class="text-fuse-text font-medium text-sm">{{ project?.name }}</span>
      </div>
      <div class="flex items-center gap-3">
        <!-- Connection status pill -->
        <div class="connection-pill" :class="wsConnected ? 'connection-pill--connected' : 'connection-pill--offline'">
          <span class="connection-dot" :class="wsConnected ? 'connection-dot--connected' : 'connection-dot--offline'" />
          <span v-if="wsConnected" class="font-mono text-xs">
            {{ connectedClients }} {{ connectedClients === 1 ? 'client' : 'clients' }} connected
          </span>
          <span v-else class="font-mono text-xs">No clients connected</span>
        </div>
      </div>
    </nav>

    <main v-if="project" class="max-w-6xl mx-auto px-6 py-10 animate-slide-up grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="space-y-6">
        <!-- Project header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-fuse-text">{{ project.name }}</h1>
          <p class="text-fuse-dim text-sm mt-1 font-mono">{{ project.project_key }}</p>
        </div>
        <StatusBadge :state="project.state" size="lg" />
      </div>

      <!-- Client connection banner -->
      <div class="client-status-banner" :class="wsConnected ? 'client-status-banner--ok' : 'client-status-banner--warn'">
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ wsConnected ? '🟢' : '🔴' }}</span>
          <div>
            <p class="text-sm font-bold" :class="wsConnected ? 'text-fuse-green' : 'text-fuse-red'">
              {{ wsConnected ? `${connectedClients} client instance${connectedClients === 1 ? '' : 's'} connected` : 'No SDK clients connected' }}
            </p>
            <p class="text-xs text-fuse-dim mt-0.5">
              {{ wsConnected
                ? 'State changes will broadcast instantly to all connected clients.'
                : 'Deploy the dead-fuse SDK in your client app to start monitoring. See the Integration section below.' }}
            </p>
          </div>
        </div>
        <div v-if="wsConnected" class="text-right hidden sm:block">
          <p class="text-xs text-fuse-dim font-mono">Last seen</p>
          <p class="text-xs text-fuse-green font-mono">just now</p>
        </div>
      </div>

      <!-- Stats -->
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

      <!-- Project Metadata -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="project.client_name" class="stat-card">
          <span class="stat-label">Client</span>
          <span class="stat-value">{{ project.client_name }}</span>
        </div>
        <div v-if="project.target_completion" class="stat-card">
          <span class="stat-label">Target Completion</span>
          <span class="stat-value">{{ formatDate(project.target_completion) }}</span>
        </div>
        <div v-if="project.budget" class="stat-card">
          <span class="stat-label">Budget</span>
          <span class="stat-value">{{ project.budget }}</span>
        </div>
        <div v-if="project.priority" class="stat-card">
          <span class="stat-label">Priority</span>
          <span class="stat-value capitalize">{{ project.priority }}</span>
        </div>
      </div>
      <div v-if="project.description" class="panel">
        <h2 class="panel-title">Description</h2>
        <p class="text-fuse-dim text-sm">{{ project.description }}</p>
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

      <!-- ── Internal Tester ──────────────────────────────────────────── -->
      <div class="panel">
        <div class="flex items-center justify-between mb-1">
          <h2 class="panel-title mb-0">Internal Tester</h2>
          <span class="text-xs font-mono px-2 py-0.5 rounded-full border"
            :class="tester.activated
              ? 'text-fuse-green border-fuse-green/30 bg-fuse-green/10'
              : 'text-fuse-dim border-fuse-border bg-fuse-zinc'">
            {{ tester.activated ? 'SDK Active' : 'SDK Inactive' }}
          </span>
        </div>
        <p class="text-fuse-dim text-xs mb-4">
          Simulate a connected client directly in this browser tab. The SDK will subscribe to your project and react to state changes instantly.
        </p>

        <!-- Activate / Deactivate -->
        <div class="flex gap-3 mb-5">
          <button
            @click="testerActivate"
            :disabled="tester.activated || tester.loading"
            class="btn-tester-activate flex-1"
          >
            {{ tester.loading ? 'Connecting…' : 'Activate SDK' }}
          </button>
          <button
            @click="testerDeactivate"
            :disabled="!tester.activated"
            class="btn-secondary flex-1"
          >
            Deactivate SDK
          </button>
        </div>

        <!-- Live state display -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="tester-stat">
            <span class="tester-stat-label">SDK State</span>
            <span class="font-mono font-bold text-sm" :class="testerStateColor">
              {{ tester.state ?? '—' }}
            </span>
          </div>
          <div class="tester-stat">
            <span class="tester-stat-label">Last Message</span>
            <span class="font-mono text-xs text-fuse-dim truncate">{{ tester.lastMessage || '—' }}</span>
          </div>
        </div>

        <!-- Event log -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-mono text-fuse-dim uppercase tracking-widest">Event Log</span>
            <button @click="tester.logs = []" class="text-xs text-fuse-dim hover:text-fuse-text font-mono transition-colors">Clear</button>
          </div>
          <div class="tester-log-box" ref="logBox">
            <div v-if="tester.logs.length === 0" class="text-fuse-muted text-xs font-mono py-2 text-center">
              No events yet — activate the SDK to start.
            </div>
            <div
              v-for="(entry, i) in tester.logs"
              :key="i"
              class="tester-log-row text-fuse-dim"
            >
              <span class="opacity-50 flex-shrink-0">{{ entry.time }}</span>
              <span class="font-bold uppercase w-24 flex-shrink-0">[{{ entry.type }}]</span>
              <span class="truncate">{{ entry.msg }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- ── /Internal Tester ─────────────────────────────────────────── -->
      </div>

      <aside class="space-y-6">
        <div class="panel">
          <h2 class="panel-title">Integration</h2>
          <div class="space-y-4">
            <div>
              <label class="field-label">Project ID (projectId)</label>
              <div class="token-row">
                <code class="text-fuse-text text-xs flex-1 truncate">{{ project.project_key }}</code>
                <button @click="copy(project.project_key, 'key')" class="copy-btn">
                  {{ copied === 'key' ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>
            <div>
              <label class="field-label">Public Token (token)</label>
              <div class="token-row">
                <code class="text-fuse-text text-xs flex-1 truncate">{{ project.public_token }}</code>
                <button @click="copy(project.public_token, 'token')" class="copy-btn">
                  {{ copied === 'token' ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <h2 class="panel-title">Usage Snippet</h2>
          <p class="text-fuse-dim text-xs mb-3">
            Copy the minimal SDK integration snippet and paste it into your client application.
          </p>
          <div class="bg-fuse-zinc border border-fuse-border rounded-lg p-4 relative">
            <button @click="copy(snippet, 'snippet')" class="copy-btn absolute top-3 right-3">
              {{ copied === 'snippet' ? 'Copied' : 'Copy' }}
            </button>
            <pre class="text-xs text-fuse-dim overflow-x-auto whitespace-pre pr-16">{{ snippet }}</pre>
          </div>
        </div>

        <div class="panel border-red-500/20 bg-red-500/5">
          <h2 class="panel-title text-fuse-red">Danger Zone</h2>
          <p class="text-fuse-dim text-xs mb-4">
            Deleting a project will soft delete it and free up a project slot. Only do this if you no longer need its current configuration.
          </p>
          <button @click="showDeleteConfirm = true" class="bg-fuse-red hover:bg-fuse-red/80 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full">
            Delete Project
          </button>
        </div>
      </aside>
    </main>

    <div v-else-if="notFound" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-fuse-dim mb-4">Project not found.</p>
        <button @click="navigateTo('/projects')" class="btn-primary">Back to Projects</button>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        @click.self="showDeleteConfirm = false">
        <div class="glass-modal w-full max-w-md animate-slide-up">
          <div class="p-6 border-b border-white/[0.07]">
            <h2 class="text-lg font-bold text-fuse-red">Delete Project</h2>
            <p class="text-fuse-dim text-xs mt-1">This action cannot be undone.</p>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-fuse-dim text-sm">
              Are you sure you want to delete <strong>{{ project?.name }}</strong>? This will soft delete the project and free up a slot for creating new projects.
            </p>
            <div class="flex gap-3 pt-1">
              <button @click="showDeleteConfirm = false" class="btn-ghost flex-1">Cancel</button>
              <button @click="deleteProject" :disabled="deleteLoading" class="bg-fuse-red hover:bg-fuse-red/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1">
                {{ deleteLoading ? 'Deleting…' : 'Delete Project' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <div v-if="statusMsg" class="fixed bottom-6 right-6 bg-fuse-zinc border px-4 py-2 rounded-lg text-sm font-mono transition-all z-50"
      :class="statusMsg.type === 'success' ? 'border-fuse-green text-fuse-green' : 'border-fuse-red text-fuse-red'">
      {{ statusMsg.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import DeadFuse from 'dead-fuse'

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
const logBox = ref<HTMLElement | null>(null)
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)

let statusTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

// ── Tester state ────────────────────────────────────────────────────────────
const tester = reactive<{
  activated: boolean
  loading: boolean
  state: string | null
  lastMessage: string
  logs: { time: string; type: string; msg: string }[]
}>({
  activated: false,
  loading: false,
  state: null,
  lastMessage: '',
  logs: [],
})

function testerLog(type: string, msg: string) {
  const now = new Date()
  const time = now.toLocaleTimeString('en-GB', { hour12: false })
  tester.logs.push({ time, type, msg })
  nextTick(() => {
    if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight
  })
}

function testerActivate() {
  if (!project.value) return
  tester.loading = true
  try {
    // Set up listeners before activation to catch initial state
    const stateListeners = {
      onActive: () => {
        tester.state = 'ACTIVE'
        testerLog('active', 'SDK received ACTIVE state — full access granted.')
      },
      onWarning: (msg: string) => {
        tester.state = 'WARNING'
        tester.lastMessage = msg
        testerLog('warning', `Warning received: ${msg}`)
      },
      onReadonly: () => {
        tester.state = 'READONLY'
        testerLog('readonly', 'Read-only mode — POST/PUT/PATCH/DELETE are now blocked.')
      },
      onLimited: () => {
        tester.state = 'LIMITED'
        testerLog('limited', 'Limited mode — custom partial restrictions active.')
      },
      onLocked: (msg: string) => {
        tester.state = 'LOCKED'
        tester.lastMessage = msg
        testerLog('locked', `Locked: ${msg}`)
      },
      onExpired: () => {
        tester.state = 'EXPIRED'
        testerLog('expired', 'Contract expired.')
      },
      onSleep: () => {
        tester.state = 'SLEEP'
        testerLog('sleep', 'App paused (SLEEP).')
      },
      onSelfDestruct: () => {
        tester.state = 'SELF_DESTRUCT'
        testerLog('self_destruct', 'SELF_DESTRUCT handler triggered.')
      },
      onDisconnect: () => {
        testerLog('disconnect', 'Disconnected from Realtime channel — applying fallback.')
      },
      onReconnect: () => {
        testerLog('info', 'Reconnected to Realtime channel.')
      },
    }
    
    DeadFuse.activate({
      projectId: project.value.project_key,
      token: project.value.public_token,
      fallbackMode: 'readonly',
      ...stateListeners,
    })
    
    tester.activated = true
    wsConnected.value = true
    connectedClients.value = 1
    testerLog('info', `SDK activated for project "${project.value.project_key}".`)
  } catch (err: any) {
    testerLog('error', err?.message ?? 'Activation failed.')
  } finally {
    tester.loading = false
  }
}

function testerDeactivate() {
  DeadFuse.deactivate()
  tester.activated = false
  tester.state = null
  tester.lastMessage = ''
  wsConnected.value = false
  connectedClients.value = 0
  testerLog('info', 'SDK deactivated.')
}

const testerStateColor = computed(() => {
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
  return tester.state ? (map[tester.state] ?? 'text-fuse-text') : 'text-fuse-dim'
})

// cleanup on leave
onUnmounted(() => {
  if (tester.activated) DeadFuse.deactivate()
  if (pollTimer) clearInterval(pollTimer)
})
// ── /Tester ──────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    project.value = await $fetch<any>(`/api/projects/${id}`)
    message.value = project.value.message || ''
    gracePeriod.value = project.value.grace_period
  } catch {
    notFound.value = true
    return
  }

  // Poll for connected client count
  await pollClientStatus()
  pollTimer = setInterval(pollClientStatus, 5000)
})

async function pollClientStatus() {
  if (!project.value || tester.activated) return
  try {
    const res = await $fetch<{ connected: number }>(`/api/projects/${id}/clients`)
    connectedClients.value = res.connected
    wsConnected.value = res.connected > 0
  } catch {
    wsConnected.value = false
    connectedClients.value = 0
  }
}

// ─── Snippet — SDK auto-configures Supabase via dashboard config endpoint ───
const snippet = computed(() => {
  if (!project.value) return ''
  return `import DeadFuse from "dead-fuse";

DeadFuse.activate({
  projectId: "${project.value.project_key}",
  token: "${project.value.public_token}",
  fallbackMode: "readonly",
  onActive:   () => console.log("Active"),
  onWarning:  (msg) => alert(msg),
  onReadonly: () => console.warn("Read-only mode"),
  onLocked:   (msg) => { console.error(msg); },
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

async function deleteProject() {
  deleteLoading.value = true
  try {
    await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
    showStatus('Project deleted successfully', 'success')
    setTimeout(() => navigateTo('/projects'), 1000)
  } catch (err: any) {
    showStatus(err?.data?.statusMessage || 'Failed to delete project', 'error')
  } finally {
    deleteLoading.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<style scoped>
.connection-pill {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300;
}
.connection-pill--connected {
  @apply bg-fuse-green/10 border-fuse-green/30 text-fuse-green;
}
.connection-pill--offline {
  @apply bg-fuse-muted/10 border-fuse-border text-fuse-dim;
}
.connection-dot {
  @apply w-1.5 h-1.5 rounded-full flex-shrink-0;
}
.connection-dot--connected {
  @apply bg-fuse-green animate-pulse;
}
.connection-dot--offline {
  @apply bg-fuse-muted;
}

.client-status-banner {
  @apply rounded-xl border p-4 flex items-center justify-between gap-4;
}
.client-status-banner--ok {
  @apply bg-fuse-green/5 border-fuse-green/20;
}
.client-status-banner--warn {
  @apply bg-fuse-red/5 border-fuse-red/20;
}

.panel {
  @apply bg-white/[0.025] backdrop-blur-sm border border-white/[0.07] rounded-xl p-6;
}
.panel-title {
  @apply text-sm font-bold text-fuse-text uppercase tracking-widest font-mono mb-4;
}
.stat-card {
  @apply bg-white/[0.025] backdrop-blur-sm border border-white/[0.07] rounded-xl p-4 flex flex-col gap-1;
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
.btn-tester-activate {
  @apply bg-fuse-green/20 hover:bg-fuse-green/30 border border-fuse-green/40 text-fuse-green font-bold text-sm
  px-4 py-2.5 rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed;
}
.token-row {
  @apply flex items-center gap-3 bg-fuse-zinc border border-fuse-border rounded-lg px-3 py-2 mt-1;
}
.copy-btn {
  @apply text-xs text-fuse-dim hover:text-fuse-text font-mono border border-fuse-border rounded px-2 py-0.5
  transition-colors whitespace-nowrap;
}

/* Tester */
.tester-stat {
  @apply bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2.5 flex flex-col gap-1;
}
.tester-stat-label {
  @apply text-xs font-mono text-fuse-dim uppercase tracking-widest;
}
.tester-log-box {
  @apply bg-black/40 border border-white/[0.06] rounded-lg p-3 h-44 overflow-y-auto font-mono text-xs;
}
.tester-log-row {
  @apply flex items-start gap-3 py-0.5 border-b border-white/[0.04] last:border-0;
}
</style>