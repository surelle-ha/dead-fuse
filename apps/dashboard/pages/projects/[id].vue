<template>
  <div class="min-h-screen bg-fuse-black">
    <main v-if="project" class="max-w-6xl mx-auto px-6 py-8 animate-slide-up">

      <!-- Page header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <button @click="navigateTo('/projects')" class="text-fuse-muted hover:text-fuse-text transition-colors text-xs font-mono">← Back</button>
          <span class="text-white/10">/</span>
          <h1 class="text-sm font-bold text-fuse-text">{{ project.name }}</h1>
          <StatusBadge :state="project.state" size="sm" />
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

        <!-- ── Left column ──────────────────────────────────────── -->
        <div class="space-y-5">

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3">
            <div class="stat-card">
              <span class="stat-label">State</span>
              <span class="stat-value" :class="stateColor(project.state)">{{ project.state }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Grace period</span>
              <span class="stat-value">{{ project.grace_period }}d</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Instances</span>
              <span class="stat-value">{{ instances.length }}</span>
            </div>
          </div>

          <!-- State control -->
          <div class="panel">
            <h2 class="panel-title">State control</h2>
            <p class="text-fuse-muted text-[10px] mb-4 leading-relaxed">
              Changing state broadcasts to <strong class="text-fuse-dim">all instances</strong> of this project simultaneously.
            </p>
            <StateToggle :current="project.state" @change="onStateChange" :loading="stateLoading" />
          </div>

          <!-- Client message -->
          <div class="panel">
            <h2 class="panel-title">Client message</h2>
            <p class="text-fuse-dim text-xs mb-3">Broadcast to all instances in WARNING and LOCKED states.</p>
            <div class="flex gap-2">
              <input v-model="message" type="text" class="field-input flex-1 text-xs" placeholder="Invoice overdue. Please contact support." />
              <button @click="updateMessage" :disabled="msgLoading" class="btn-secondary text-xs px-3">{{ msgLoading ? '…' : 'Save' }}</button>
            </div>
          </div>

          <!-- Grace period -->
          <div class="panel">
            <h2 class="panel-title">Grace period</h2>
            <p class="text-fuse-dim text-xs mb-3">Days before restrictions apply after a state change.</p>
            <div class="flex gap-2 items-center">
              <input v-model.number="gracePeriod" type="number" min="0" max="365" class="field-input w-24 text-xs" />
              <span class="text-fuse-muted text-xs">days</span>
              <button @click="updateGracePeriod" :disabled="graceLoading" class="btn-secondary text-xs px-3 ml-auto">{{ graceLoading ? '…' : 'Update' }}</button>
            </div>
          </div>

          <!-- ── Instances ─────────────────────────────────────── -->
          <div class="panel">
            <div class="flex items-center justify-between mb-1">
              <h2 class="panel-title mb-0">Instances</h2>
              <button @click="showAddInstance = true" class="btn-ghost text-xs flex items-center gap-1.5">
                <Plus class="w-3 h-3" /> Add instance
              </button>
            </div>
            <p class="text-fuse-muted text-[10px] mb-4 leading-relaxed">
              Each instance is a deployment environment with its own SDK token. All instances share this project's state.
            </p>

            <!-- Loading -->
            <div v-if="instancesLoading" class="space-y-2">
              <div v-for="i in 2" :key="i" class="h-24 rounded-xl animate-pulse bg-white/[0.02] border border-white/[0.04]" />
            </div>

            <!-- Empty -->
            <div v-else-if="instances.length === 0" class="rounded-xl border border-dashed border-white/[0.08] py-10 text-center">
              <div class="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
                <Server class="w-4 h-4 text-fuse-muted" />
              </div>
              <p class="text-fuse-dim text-xs font-medium mb-1">No instances yet</p>
              <p class="text-fuse-muted text-[10px] max-w-xs mx-auto">Add a dev, staging, or prod instance. Each gets its own SDK token.</p>
              <button @click="showAddInstance = true" class="mt-4 btn-primary text-xs px-4">Add first instance</button>
            </div>

            <!-- List -->
            <div v-else class="space-y-2.5">
              <div
                v-for="inst in instances"
                :key="inst.id"
                class="instance-card"
                :class="inst.alert ? 'instance-card--alert' : ''"
              >
                <!-- Header row -->
                <div class="flex items-center justify-between gap-3 mb-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="env-badge" :class="envBadgeClass(inst.env)">{{ inst.env }}</span>
                    <!-- Label — inline editable -->
                    <template v-if="renamingId === inst.id">
                      <input
                        v-model="renameLabel"
                        class="field-input text-xs flex-1 py-1 px-2"
                        style="min-width:0"
                        @keydown.enter="submitRename(inst)"
                        @keydown.escape="cancelRename"
                        ref="renameInputRef"
                      />
                      <button @click="submitRename(inst)" class="text-[10px] font-mono text-fuse-green border border-fuse-green/30 rounded px-2 py-0.5 hover:bg-fuse-green/10 transition-colors">Save</button>
                      <button @click="cancelRename" class="text-[10px] font-mono text-fuse-muted border border-white/[0.08] rounded px-2 py-0.5 hover:text-fuse-dim transition-colors">Cancel</button>
                    </template>
                    <template v-else>
                      <span class="text-xs font-semibold text-fuse-text truncate">{{ inst.label }}</span>
                      <div v-if="inst.alert" class="flex items-center gap-1 text-[9px] font-mono text-fuse-red bg-fuse-red/[0.08] border border-fuse-red/20 px-1.5 py-0.5 rounded-full">
                        <span class="w-1 h-1 rounded-full bg-fuse-red inline-block" />
                        No signal
                      </div>
                    </template>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <button @click="startRename(inst)" class="icon-btn" title="Rename"><Pencil class="w-3 h-3" /></button>
                    <button @click="copyToken(inst.token)" class="icon-btn" title="Copy token"><Copy class="w-3 h-3" /></button>
                    <button @click="openTester(inst)" class="icon-btn" title="Test this instance"><FlaskConical class="w-3 h-3" /></button>
                    <button @click="confirmRemoveInstance(inst)" class="icon-btn hover:!text-fuse-red" title="Remove"><Trash2 class="w-3 h-3" /></button>
                  </div>
                </div>

                <!-- Token -->
                <div class="flex items-center gap-2 bg-black/20 border border-white/[0.05] rounded-lg px-2.5 py-1.5 mb-3">
                  <code class="text-[10px] font-mono text-fuse-muted flex-1 truncate">{{ inst.token }}</code>
                  <button @click="copyToken(inst.token)" class="text-[9px] font-mono text-fuse-muted hover:text-fuse-dim border border-white/[0.06] rounded px-1.5 py-0.5 flex-shrink-0 transition-colors">Copy</button>
                </div>

                <!-- Monitoring toggle + connection status -->
                <div class="flex items-center justify-between gap-4 pt-2.5 border-t border-white/[0.05]">
                  <div class="min-w-0">
                    <p class="text-[10px] font-medium text-fuse-dim">Deployed monitoring</p>
                    <p class="text-[9px] text-fuse-muted mt-0.5 leading-relaxed">
                      Track when this instance was last seen by the DeadFuse SDK.
                    </p>
                  </div>
                  <!-- FIX: toggle-thumb uses left: fixed values, not transform, so it can't escape -->
                  <button
                    @click="toggleDeployed(inst)"
                    class="toggle-track flex-shrink-0"
                    :class="inst.deployed ? 'toggle-on' : 'toggle-off'"
                    role="switch"
                    :aria-checked="inst.deployed"
                  >
                    <span class="toggle-thumb" />
                  </button>
                </div>

                <!-- Connection info (replaces uptime/sdk ping) -->
                <div v-if="inst.deployed" class="mt-2.5 grid grid-cols-2 gap-2">
                  <div class="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="getConnectionStatus().connected ? 'bg-fuse-green animate-pulse' : 'bg-white/20'" />
                    <div>
                      <p class="text-[9px] font-mono text-fuse-muted">Current connection</p>
                      <p class="text-[10px] font-mono" :class="getConnectionStatus().connected ? 'text-fuse-green' : 'text-fuse-muted'">
                        {{ getConnectionStatus().connected ? 'Connected' : 'Not connected' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-fuse-blue/50" />
                    <div>
                      <p class="text-[9px] font-mono text-fuse-muted">Last detected</p>
                      <p class="text-[10px] font-mono text-fuse-dim">
                        {{ getLastDetected() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Project details -->
          <div v-if="project.client_name || project.description || project.budget || project.priority" class="panel">
            <h2 class="panel-title">Project details</h2>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div v-if="project.client_name" class="detail-row"><span class="detail-label">Client</span><span class="detail-value">{{ project.client_name }}</span></div>
              <div v-if="project.priority"    class="detail-row"><span class="detail-label">Priority</span><span class="detail-value capitalize">{{ project.priority }}</span></div>
              <div v-if="project.budget"      class="detail-row"><span class="detail-label">Budget</span><span class="detail-value">{{ project.budget }}</span></div>
              <div v-if="project.target_completion" class="detail-row"><span class="detail-label">Deadline</span><span class="detail-value">{{ formatDate(project.target_completion) }}</span></div>
            </div>
            <p v-if="project.description" class="text-xs text-fuse-dim">{{ project.description }}</p>
          </div>
        </div>

        <!-- ── Right column ─────────────────────────────────────── -->
        <aside class="space-y-5">

          <!-- Live clients -->
          <div class="panel">
            <div class="flex items-center gap-2 mb-3">
              <!-- dot and title on the same baseline -->
              <span
                class="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-px"
                :class="wsConnected ? 'bg-fuse-green animate-pulse' : 'bg-fuse-muted'"
              />
              <span class="text-[10px] font-mono uppercase tracking-widest text-fuse-muted">
                {{ wsConnected ? `${connectedClients} client${connectedClients !== 1 ? 's' : ''} live` : 'No clients live' }}
              </span>
            </div>
            <p class="text-fuse-muted text-[10px] leading-relaxed mb-3">
              {{ wsConnected ? 'State changes broadcast instantly.' : 'No SDK connections detected. Add an instance and deploy the SDK.' }}
            </p>
            <div v-if="dedupedHosts.length > 0" class="space-y-1.5">
              <div
                v-for="c in dedupedHosts"
                :key="c.host"
                class="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0"
              >
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-fuse-green mt-[3px]" />
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-mono text-fuse-dim truncate">{{ c.host }}</p>
                  <p v-if="c.instanceLabel" class="text-[9px] font-mono text-fuse-muted mt-0.5">{{ c.instanceLabel }}</p>
                </div>
                <span class="text-[9px] font-mono text-fuse-muted flex-shrink-0 mt-px">{{ relTime(c.lastSeen) }}</span>
              </div>
            </div>
          </div>

          <!-- Project ID -->
          <div class="panel">
            <h2 class="panel-title">Project ID</h2>
            <p class="text-fuse-muted text-[10px] mb-3 leading-relaxed">
              Use as <code class="text-fuse-dim">projectId</code> in the SDK. Each instance provides its own <code class="text-fuse-dim">token</code>.
            </p>
            <div class="token-row">
              <code class="text-fuse-text text-[10px] flex-1 truncate font-mono">{{ project.project_key }}</code>
              <button @click="copy(project.project_key, 'key')" class="copy-btn">{{ copied === 'key' ? '✓' : 'Copy' }}</button>
            </div>
          </div>

          <!-- Snippet -->
          <div class="panel">
            <h2 class="panel-title">Usage snippet</h2>
            <div v-if="instances.length === 0" class="text-center py-4">
              <p class="text-fuse-muted text-[10px]">Add an instance to generate a snippet.</p>
            </div>
            <div v-else>
              <div class="flex items-center gap-2 mb-2">
                <label class="text-[9px] font-mono text-fuse-muted uppercase tracking-widest flex-shrink-0">Instance</label>
                <select v-model="snippetId" class="mini-select flex-1">
                  <option v-for="i in instances" :key="i.id" :value="i.id">{{ i.label }} ({{ i.env }})</option>
                </select>
              </div>
              <div class="code-block relative">
                <button @click="copy(snippetRaw, 'snippet')" class="copy-btn absolute top-2 right-2 z-10">{{ copied === 'snippet' ? '✓' : 'Copy' }}</button>
                <pre class="text-[10px] font-mono p-3 overflow-x-auto whitespace-pre pr-12 leading-relaxed" v-html="snippetHighlighted" />
              </div>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="panel" style="border-color:rgba(255,51,51,0.1);background:rgba(255,51,51,0.02);">
            <h2 class="panel-title text-fuse-red/60">Danger zone</h2>
            <p class="text-fuse-dim text-[10px] mb-3 leading-relaxed">Soft-deletes this project and all its instances.</p>
            <button @click="showDeleteConfirm = true" class="w-full text-xs bg-fuse-red/[0.08] hover:bg-fuse-red/[0.15] text-fuse-red border border-fuse-red/20 px-4 py-2 rounded-lg font-medium transition-colors">
              Delete project
            </button>
          </div>
        </aside>
      </div>
    </main>

    <div v-else-if="notFound" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-fuse-dim mb-4 text-sm">Project not found.</p>
        <button @click="navigateTo('/projects')" class="btn-primary text-xs">← Back to Projects</button>
      </div>
    </div>

    <!-- Add instance modal -->
    <Teleport to="body">
      <div v-if="showAddInstance" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);"
        @click.self="showAddInstance = false">
        <div class="glass-modal w-full max-w-sm animate-slide-up">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h2 class="text-sm font-bold text-fuse-text">New instance</h2>
              <p class="text-[10px] text-fuse-muted mt-0.5">Each instance gets its own SDK token</p>
            </div>
            <button @click="showAddInstance = false" class="text-fuse-muted hover:text-fuse-dim text-sm leading-none">✕</button>
          </div>
          <div class="p-5 space-y-4">
            <div class="field-group">
              <label class="field-label">Environment type</label>
              <div class="grid grid-cols-5 gap-1.5">
                <button v-for="env in envTypes" :key="env"
                  @click="newInst.env = env"
                  class="py-1.5 rounded-lg border text-[9px] font-mono uppercase tracking-widest transition-all duration-100"
                  :class="newInst.env === env
                    ? 'border-fuse-red/40 bg-fuse-red/10 text-fuse-red'
                    : 'border-white/[0.07] bg-white/[0.02] text-fuse-muted hover:text-fuse-dim hover:border-white/[0.12]'"
                >{{ env }}</button>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Label</label>
              <input v-model="newInst.label" type="text" class="field-input text-xs"
                :placeholder="newInst.env === 'custom' ? 'e.g. EU Region' : `e.g. ${newInst.env} server`"
                @keydown.enter="addInstance" />
            </div>
            <div v-if="instanceError" class="text-fuse-red text-[10px] bg-fuse-red/[0.06] border border-fuse-red/20 rounded-lg px-3 py-2">{{ instanceError }}</div>
            <div class="flex gap-2">
              <button @click="showAddInstance = false" class="btn-ghost flex-1 text-xs">Cancel</button>
              <button @click="addInstance" :disabled="instanceLoading" class="btn-primary flex-1 text-xs">
                {{ instanceLoading ? 'Creating…' : 'Create instance' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.8);backdrop-filter:blur(12px);"
        @click.self="showDeleteConfirm = false">
        <div class="glass-modal w-full max-w-sm animate-slide-up">
          <div class="p-5 border-b border-white/[0.06]">
            <h2 class="text-sm font-bold text-fuse-red">Delete project</h2>
            <p class="text-fuse-dim text-xs mt-1">This cannot be undone. All instances will be removed.</p>
          </div>
          <div class="p-5 space-y-4">
            <p class="text-fuse-dim text-sm">Delete <strong class="text-fuse-text">{{ project?.name }}</strong>?</p>
            <div class="flex gap-2">
              <button @click="showDeleteConfirm = false" class="btn-ghost flex-1 text-xs">Cancel</button>
              <button @click="deleteProject" :disabled="deleteLoading"
                class="flex-1 text-xs bg-fuse-red hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50">
                {{ deleteLoading ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── State message modal (shown when toggling to WARNING or LOCKED) ── -->
    <Teleport to="body">
      <div v-if="pendingState" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.8);backdrop-filter:blur(12px);"
        @click.self="cancelPendingState">
        <div class="glass-modal w-full max-w-sm animate-slide-up">
          <div class="px-5 py-4 border-b border-white/[0.06]">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="pendingStateDot" />
              <h2 class="text-sm font-bold text-fuse-text">Set client message</h2>
            </div>
            <p class="text-fuse-muted text-[10px]">
              Switching to <code class="font-mono text-fuse-dim">{{ pendingState }}</code> — add an optional message shown to users.
            </p>
          </div>
          <div class="p-5 space-y-4">
            <div class="field-group">
              <label class="field-label">Message <span class="text-fuse-muted normal-case tracking-normal font-sans">(optional)</span></label>
              <input
                v-model="pendingMessage"
                type="text"
                class="field-input text-xs"
                :placeholder="pendingStatePlaceholder"
                @keydown.enter="confirmStateChange"
                ref="msgModalInputRef"
              />
            </div>
            <p class="text-[10px] text-fuse-muted leading-relaxed">
              Leave blank to keep the existing message, or type a new one. This will immediately broadcast to all connected clients.
            </p>
            <div class="flex gap-2">
              <button @click="cancelPendingState" class="btn-ghost flex-1 text-xs">Cancel</button>
              <button @click="confirmStateChange" :disabled="stateLoading" class="btn-primary flex-1 text-xs">
                {{ stateLoading ? 'Applying…' : `Switch to ${pendingState}` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 translate-y-2" leave-active-class="transition-all duration-150" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-5 right-5 px-4 py-2 rounded-lg text-xs font-mono border z-50"
        :class="toast.type === 'success' ? 'border-fuse-green/40 text-fuse-green bg-fuse-green/[0.06]' : 'border-fuse-red/40 text-fuse-red bg-fuse-red/[0.06]'">
        {{ toast.text }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Plus, Copy, Trash2, FlaskConical, Server, Pencil } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id    = route.params.id as string
const { openWith: openTesterWith } = useSdkTester()

// ── Project ───────────────────────────────────────────────────────
const project          = ref<any>(null)
const notFound         = ref(false)
const stateLoading     = ref(false)
const msgLoading       = ref(false)
const graceLoading     = ref(false)
const message          = ref('')
const gracePeriod      = ref(3)
const copied           = ref('')
const wsConnected      = ref(false)
const connectedClients = ref(0)
const clientHosts      = ref<any[]>([])
const toast            = ref<{ text: string; type: 'success'|'error' } | null>(null)
const showDeleteConfirm = ref(false)
const deleteLoading    = ref(false)
let toastTimer:    ReturnType<typeof setTimeout>  | null = null
let realtimeUnsub: (() => void) | null = null

// ── Pending state (message modal) ────────────────────────────────
// States that require/suggest a message before applying
const MESSAGE_STATES = new Set(['WARNING', 'LOCKED'])
const pendingState   = ref<string | null>(null)
const pendingMessage = ref('')
const msgModalInputRef = ref<HTMLInputElement | null>(null)

const pendingStateDot = computed(() => {
  const m: Record<string, string> = {
    WARNING: 'bg-fuse-yellow', LOCKED: 'bg-fuse-red',
  }
  return m[pendingState.value ?? ''] ?? 'bg-fuse-muted'
})
const pendingStatePlaceholder = computed(() => {
  if (pendingState.value === 'WARNING') return 'Invoice #1042 overdue — please contact support.'
  if (pendingState.value === 'LOCKED')  return 'Access suspended — please settle your invoice.'
  return 'Enter a message for your clients…'
})

function onStateChange(s: string) {
  if (MESSAGE_STATES.has(s)) {
    // Show the message modal first
    pendingState.value   = s
    pendingMessage.value = message.value // pre-fill with current message
    nextTick(() => { msgModalInputRef.value?.focus() })
  } else {
    updateState(s)
  }
}

function cancelPendingState() {
  pendingState.value   = null
  pendingMessage.value = ''
}

async function confirmStateChange() {
  if (!pendingState.value) return
  const targetState = pendingState.value
  const targetMsg   = pendingMessage.value

  // Update local message ref so it stays in sync
  if (targetMsg) message.value = targetMsg

  pendingState.value   = null
  pendingMessage.value = ''

  await updateState(targetState, targetMsg || undefined)
}

// ── Instances ─────────────────────────────────────────────────────
const instances        = ref<any[]>([])
const instancesLoading = ref(false)
const showAddInstance  = ref(false)
const instanceLoading  = ref(false)
const instanceError    = ref('')
const envTypes         = ['dev','qa','staging','prod','custom']
const newInst          = reactive({ env: 'dev', label: '' })
const snippetId        = ref('')

// Rename state
const renamingId      = ref<string | null>(null)
const renameLabel     = ref('')
const renameInputRef  = ref<HTMLInputElement | null>(null)

function startRename(inst: any) {
  renamingId.value  = inst.id
  renameLabel.value = inst.label
  nextTick(() => {
    if (renameInputRef.value) {
      const el = Array.isArray(renameInputRef.value) ? renameInputRef.value[0] : renameInputRef.value
      el?.focus()
      el?.select()
    }
  })
}

function cancelRename() {
  renamingId.value  = null
  renameLabel.value = ''
}

async function submitRename(inst: any) {
  const label = renameLabel.value.trim()
  if (!label) { cancelRename(); return }
  if (label === inst.label) { cancelRename(); return }
  try {
    const updated = await $fetch<any>(`/api/projects/${id}/instances/${inst.id}`, {
      method: 'PATCH',
      body: { label },
    })
    Object.assign(inst, updated)
    showToast('Instance renamed', 'success')
  } catch {
    showToast('Failed to rename', 'error')
  } finally {
    cancelRename()
  }
}

async function loadInstances() {
  instancesLoading.value = true
  try {
    instances.value = await $fetch<any[]>(`/api/projects/${id}/instances`)
    if (instances.value.length && !snippetId.value) {
      snippetId.value = instances.value[0].id
    }
  } catch { instances.value = [] }
  finally { instancesLoading.value = false }
}

async function addInstance() {
  instanceError.value = ''
  if (!newInst.label.trim()) { instanceError.value = 'Label is required'; return }
  instanceLoading.value = true
  try {
    const inst = await $fetch<any>(`/api/projects/${id}/instances`, {
      method: 'POST',
      body: { env: newInst.env, label: newInst.label.trim() },
    })
    instances.value.push(inst)
    if (!snippetId.value) snippetId.value = inst.id
    showAddInstance.value = false
    newInst.label = ''
    newInst.env   = 'dev'
    showToast('Instance created', 'success')
  } catch (e: any) {
    instanceError.value = e?.data?.statusMessage || 'Failed to create instance'
  } finally {
    instanceLoading.value = false
  }
}

async function toggleDeployed(inst: any) {
  const next = !inst.deployed
  try {
    const updated = await $fetch<any>(`/api/projects/${id}/instances/${inst.id}`, {
      method: 'PATCH',
      body: { deployed: next },
    })
    Object.assign(inst, updated)
  } catch { showToast('Failed to update', 'error') }
}

async function confirmRemoveInstance(inst: any) {
  if (!confirm(`Remove instance "${inst.label}"?`)) return
  try {
    await $fetch(`/api/projects/${id}/instances/${inst.id}`, { method: 'DELETE' })
    instances.value = instances.value.filter(i => i.id !== inst.id)
    if (snippetId.value === inst.id) snippetId.value = instances.value[0]?.id ?? ''
    showToast('Instance removed', 'success')
  } catch { showToast('Failed to remove', 'error') }
}

function openTester(inst: any) {
  openTesterWith(project.value.project_key, inst.token, inst.label)
}

function copyToken(token: string) {
  navigator.clipboard.writeText(token)
  showToast('Token copied', 'success')
}

function envBadgeClass(env: string) {
  const m: Record<string,string> = {
    dev:     'bg-fuse-blue/10   text-fuse-blue   border-fuse-blue/25',
    qa:      'bg-fuse-yellow/10 text-fuse-yellow border-fuse-yellow/25',
    staging: 'bg-fuse-orange/10 text-fuse-orange border-fuse-orange/25',
    prod:    'bg-fuse-green/10  text-fuse-green  border-fuse-green/25',
    custom:  'bg-fuse-purple/10 text-fuse-purple border-fuse-purple/25',
  }
  return m[env] ?? 'bg-white/[0.04] text-fuse-dim border-white/[0.08]'
}

// ── Connection helpers ────────────────────────────────────────────
// lastSeenEver persists the most recent timestamp we've ever observed
// from clientHosts, so "last detected" survives across polling cycles
// even when no clients are currently connected.
const lastSeenEver = ref<number | null>(null)

// Called on every presence sync — persists the most recent ts seen
function updateLastSeen() {
  if (clientHosts.value.length === 0) return
  const ts = Math.max(...clientHosts.value.map((c: any) => c.lastSeen))
  if (ts && (!lastSeenEver.value || ts > lastSeenEver.value)) {
    lastSeenEver.value = ts
  }
}

function getConnectionStatus(): { connected: boolean } {
  // If presence has any entries, the SDK is connected RIGHT NOW.
  // No timestamp staleness check needed — presence is live.
  return { connected: wsConnected.value }
}

function getLastDetected(): string {
  if (lastSeenEver.value) return relTime(lastSeenEver.value)
  return 'Never'
}

// Deduplicated host list for the Live clients card.
// Multiple presence entries from the same origin are collapsed to one row.
// Each row resolves its instance label by matching the presence token.
const dedupedHosts = computed(() => {
  const seen = new Map<string, {
    host: string
    token: string | null
    instanceLabel: string | null
    lastSeen: number
  }>()

  for (const c of clientHosts.value) {
    const key = c.host ?? c.clientId
    const existing = seen.get(key)
    if (!existing || c.lastSeen > existing.lastSeen) {
      const matchedInst = instances.value.find((i: any) => i.token === c.token)
      seen.set(key, {
        host:          c.host ?? 'Unknown origin',
        token:         c.token,
        instanceLabel: matchedInst ? `${matchedInst.label} (${matchedInst.env})` : null,
        lastSeen:      c.lastSeen,
      })
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.lastSeen - a.lastSeen)
})

// ── Snippet ───────────────────────────────────────────────────────
const snippetRaw = computed(() => {
  if (!project.value) return ''
  const inst  = instances.value.find(i => i.id === snippetId.value)
  const token = inst?.token ?? '<instance-token>'
  return [
    `import DeadFuse from "@surelle-ha/dead-fuse";`,
    ``,
    `DeadFuse.activate({`,
    `  projectId: "${project.value.project_key}",`,
    `  token: "${token}",`,
    `  fallbackMode: "readonly",`,
    ``,
    `  onActive:   () => console.log("Active"),`,
    `  onWarning:  (msg) => showBanner(msg),`,
    `  onReadonly: () => showNotice("Read-only mode"),`,
    `  onLimited:  () => disablePremiumFeatures(),`,
    `  onLocked:   (msg) => { document.body.innerHTML = \`<h1>\${msg}</h1>\`; },`,
    `  onExpired:  () => showPage("Contract expired."),`,
    `  onSleep:    () => showMaintenancePage(),`,
    `});`,
  ].join('\n')
})

// Minimal syntax highlighter — no external deps, pure regex substitution.
// Order matters: strings first, then keywords, then properties, then comments.
const snippetHighlighted = computed(() => {
  if (!snippetRaw.value) return ''

  // Escape HTML first
  let code = snippetRaw.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Template literals (backtick strings) — colour as strings
  code = code.replace(/`[^`]*`/g, m => `<span class="hl-str">${m}</span>`)

  // Regular strings (single and double quote)
  code = code.replace(/"(?:[^"\\]|\\.)*"/g, m => `<span class="hl-str">${m}</span>`)
  code = code.replace(/'(?:[^'\\]|\\.)*'/g, m => `<span class="hl-str">${m}</span>`)

  // Keywords
  const keywords = ['import', 'from', 'const', 'let', 'var', 'return', 'new', 'function', 'async', 'await']
  keywords.forEach(kw => {
    code = code.replace(new RegExp(`\\b(${kw})\\b`, 'g'), `<span class="hl-kw">$1</span>`)
  })

  // Object property keys (word followed by colon, not inside a string span)
  code = code.replace(/(<span[^>]*>.*?<\/span>)|(\b\w+)(?=\s*:)/g, (m, span, prop) => {
    if (span) return span  // already highlighted — leave alone
    return `<span class="hl-prop">${prop}</span>`
  })

  // DeadFuse identifier
  code = code.replace(/\bDeadFuse\b/g, '<span class="hl-class">DeadFuse</span>')

  // Arrow functions / punctuation — parentheses, braces
  code = code.replace(/([(){}])/g, '<span class="hl-punct">$1</span>')

  // Numbers
  code = code.replace(/\b(\d+)\b/g, '<span class="hl-num">$1</span>')

  // Comments //
  code = code.replace(/(\/\/.*)$/gm, '<span class="hl-comment">$1</span>')

  return code
})

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    project.value     = await $fetch<any>(`/api/projects/${id}`)
    message.value     = project.value.message || ''
    gracePeriod.value = project.value.grace_period
  } catch { notFound.value = true; return }
  await loadInstances()
  await subscribePresence()
})

onUnmounted(() => {
  realtimeUnsub?.()
})

// ── Realtime presence — subscribe to the same channel the SDK uses ─
// The SDK calls channel.track() after subscribing, so we can watch
// presenceState() to see exactly who is currently connected.
// This works regardless of whether _registerClient() succeeded.
async function subscribePresence() {
  if (!project.value?.project_key) return

  // Fetch Supabase credentials from the dashboard's own /api/config endpoint
  let supabaseUrl: string
  let supabaseAnonKey: string
  try {
    const cfg = await $fetch<{ supabaseUrl: string; supabaseAnonKey: string }>('/api/config')
    supabaseUrl    = cfg.supabaseUrl
    supabaseAnonKey = cfg.supabaseAnonKey
  } catch (e) {
    console.warn('[Dashboard] Could not fetch Supabase config for presence:', e)
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const channelName = `project:${project.value.project_key}`
  const channel = sb.channel(channelName)

  function refreshPresence() {
    const state = channel.presenceState<{ projectId: string; token?: string; ts: number; host?: string }>()
    const presences = Object.values(state).flat() as any[]
    connectedClients.value = presences.length
    wsConnected.value      = presences.length > 0

    clientHosts.value = presences.map((p, i) => ({
      clientId:  p.token ?? `presence-${i}`,
      token:     p.token  ?? null,
      host:      p.host   ?? null,
      lastSeen:  p.ts     ?? Date.now(),
    }))

    updateLastSeen()
  }

  channel
    .on('presence', { event: 'sync' },  refreshPresence)
    .on('presence', { event: 'join' },  refreshPresence)
    .on('presence', { event: 'leave' }, refreshPresence)
    .subscribe()

  realtimeUnsub = () => {
    sb.removeChannel(channel)
  }
}

// ── API actions ───────────────────────────────────────────────────
async function updateState(s: string, msg?: string) {
  stateLoading.value = true
  try {
    project.value = await $fetch(`/api/projects/${id}/state`, {
      method: 'POST',
      body: { state: s, message: msg !== undefined ? msg : message.value },
    })
    showToast(`State → ${s}`, 'success')
  }
  catch (e: any) { showToast(e?.data?.statusMessage || 'Failed', 'error') }
  finally { stateLoading.value = false }
}
async function updateMessage() {
  msgLoading.value = true
  try { project.value = await $fetch(`/api/projects/${id}/state`, { method: 'POST', body: { message: message.value } }); showToast('Message saved', 'success') }
  catch { showToast('Failed', 'error') }
  finally { msgLoading.value = false }
}
async function updateGracePeriod() {
  graceLoading.value = true
  try { project.value = await $fetch(`/api/projects/${id}/state`, { method: 'POST', body: { gracePeriod: gracePeriod.value } }); showToast('Grace period updated', 'success') }
  catch { showToast('Failed', 'error') }
  finally { graceLoading.value = false }
}
async function deleteProject() {
  deleteLoading.value = true
  try { await $fetch(`/api/projects/${id}`, { method: 'DELETE' }); showToast('Deleted', 'success'); setTimeout(() => navigateTo('/projects'), 800) }
  catch (e: any) { showToast(e?.data?.statusMessage || 'Failed', 'error') }
  finally { deleteLoading.value = false; showDeleteConfirm.value = false }
}
async function copy(text: string, key: string) {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = '' }, 2000)
}

function showToast(text: string, type: 'success'|'error') {
  toast.value = { text, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3000)
}

function stateColor(s: string) {
  const m: Record<string,string> = { ACTIVE:'text-fuse-green', WARNING:'text-fuse-yellow', READONLY:'text-fuse-blue', LIMITED:'text-fuse-orange', LOCKED:'text-fuse-red', EXPIRED:'text-fuse-red', SLEEP:'text-fuse-dim', SELF_DESTRUCT:'text-fuse-purple' }
  return m[s] || 'text-fuse-text'
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) }
function relTime(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s/60)}m ago`
}
</script>

<style scoped>
.panel { @apply rounded-xl border border-white/[0.07] p-5; background:rgba(255,255,255,0.025); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.panel-title { @apply text-[10px] font-mono uppercase tracking-widest text-fuse-muted mb-3 block; }
.stat-card { @apply rounded-xl border border-white/[0.06] px-4 py-3 flex flex-col gap-0.5; background:rgba(255,255,255,0.02); backdrop-filter:blur(8px); }
.stat-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.stat-value { @apply text-sm font-bold text-fuse-text font-mono; }
.field-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted block mb-1.5; }
.field-group { @apply flex flex-col gap-1; }
.field-input { @apply w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-fuse-text outline-none focus:border-fuse-red/40 focus:ring-1 focus:ring-fuse-red/[0.12] transition-all duration-150 placeholder:text-fuse-muted; }
.detail-row   { @apply flex flex-col gap-0.5; }
.detail-label { @apply text-[9px] font-mono uppercase tracking-widest text-fuse-muted; }
.detail-value { @apply text-xs text-fuse-dim; }
.token-row { @apply flex items-center gap-2 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 mt-1; }
.copy-btn  { @apply text-[10px] font-mono text-fuse-muted hover:text-fuse-text border border-white/[0.07] rounded px-1.5 py-0.5 transition-colors whitespace-nowrap; background:rgba(255,255,255,0.02); }
.code-block { @apply rounded-lg border border-white/[0.07] overflow-hidden; background:rgba(0,0,0,0.35); }
.mini-select { @apply text-[10px] font-mono text-fuse-dim rounded-lg border border-white/[0.08] px-2 py-1 outline-none; background:rgba(255,255,255,0.03); }
.btn-primary   { @apply bg-fuse-red hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] text-fuse-dim hover:text-fuse-text py-2 rounded-lg transition-all disabled:opacity-40; }
.btn-ghost     { @apply border border-white/[0.08] hover:border-white/[0.15] text-fuse-dim hover:text-fuse-text px-3 py-2 rounded-lg transition-all flex items-center gap-1.5; }
.icon-btn      { @apply w-7 h-7 flex items-center justify-center text-fuse-muted hover:text-fuse-text rounded-md hover:bg-white/[0.06] transition-all; }

.instance-card { @apply rounded-xl border border-white/[0.07] p-4 transition-all duration-150; background:rgba(255,255,255,0.02); backdrop-filter:blur(8px); }
.instance-card--alert { border-color:rgba(255,51,51,0.2); background:rgba(255,51,51,0.025); }
.env-badge { @apply text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border flex-shrink-0; }

/* ── Toggle — FIXED ─────────────────────────────────────────────── */
/*
  Previously the thumb used `transform: translateX()` set via inline style,
  but the on/off classes also set `transform` via tailwind, causing a fight.
  Now we use a pure CSS approach: the thumb is absolutely positioned, and
  `.toggle-on .toggle-thumb` / `.toggle-off .toggle-thumb` move it via `left`.
  No inline styles needed on the thumb at all.
*/
.toggle-track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 11px;
  border: 1px solid;
  transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
}
.toggle-track:focus-visible { box-shadow: 0 0 0 2px rgba(255,51,51,0.4); }

.toggle-on  { background: rgba(0,255,136,0.18); border-color: rgba(0,255,136,0.35); }
.toggle-off { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }

.toggle-thumb {
  position: absolute;
  top: 50%;
  margin-top: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: left 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s;
  pointer-events: none;
}

/* ON: thumb on the right */
.toggle-on .toggle-thumb {
  left: 18px;
  background: #00ff88;
}
/* OFF: thumb on the left */
.toggle-off .toggle-thumb {
  left: 2px;
  background: #555555;
}

/* ── Syntax highlight ─────────────────────────────────────────────── */
.hl-kw      { color: #cc44ff; }          /* purple  — keywords */
.hl-str     { color: #00ff88; }          /* green   — strings */
.hl-prop    { color: #4488ff; }          /* blue    — object keys / callbacks */
.hl-class   { color: #ff8c00; }          /* orange  — DeadFuse identifier */
.hl-num     { color: #ffd700; }          /* yellow  — numbers */
.hl-punct   { color: #ababab; }          /* dim     — brackets */
.hl-comment { color: #555555; font-style: italic; } /* muted  — comments */

.glass-modal { @apply rounded-2xl border border-white/[0.1]; background:rgba(14,14,14,0.96); backdrop-filter:blur(24px); box-shadow:0 24px 64px rgba(0,0,0,0.6); }
</style>